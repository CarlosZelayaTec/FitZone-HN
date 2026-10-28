const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Ejecuta los módulos TS con las dependencias instaladas, sin navegador ni API real.
function entorno(fetchImpl = async () => { throw new TypeError('offline'); }, hooks) {
  const memoria = new Map();
  const sessionStorage = { getItem: (key) => memoria.get(key) ?? null, setItem: (key, value) => memoria.set(key, value), removeItem: (key) => memoria.delete(key) };
  const cache = new Map();
  function cargar(file) {
    const absoluto = path.resolve(__dirname, '../src', file);
    if (cache.has(absoluto)) return cache.get(absoluto);
    const codigo = ts.transpileModule(fs.readFileSync(absoluto, 'utf8').replaceAll('import.meta.env', '({DEV:true})'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const contexto = { exports: {}, sessionStorage, fetch: fetchImpl, AbortController, DOMException, Error, setTimeout, clearTimeout,
      document: { getElementById: () => ({ focus() {}, scrollIntoView() {} }) },
      window: { matchMedia: () => ({ matches: true }) },
      require: (nombre) => {
        if (nombre.endsWith('.css')) return {};
        if (nombre === 'react' && hooks) return hooks;
        if (!nombre.startsWith('.')) return require(nombre);
        const base = path.resolve(path.dirname(absoluto), nombre);
        const destino = fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`;
        return cargar(path.relative(path.resolve(__dirname, '../src'), destino));
      } };
    vm.runInNewContext(codigo, contexto, { filename: absoluto });
    cache.set(absoluto, contexto.exports);
    return contexto.exports;
  }
  return { cargar, memoria };
}

const usuario = { id: 7, nombre: 'Usuario de prueba', email: 'prueba@example.com', rol: 'cliente' };
const respuesta = (status, datos) => ({ ok: status >= 200 && status < 300, status, json: async () => datos });

test('login requiere un perfil protegido válido antes de aceptar la sesión', async () => {
  const llamadas = [];
  const { cargar } = entorno(async (url, opciones) => {
    llamadas.push({ url, opciones });
    return url.endsWith('/auth/login') ? respuesta(200, { token: 'token-prueba', usuario }) : respuesta(200, { usuario });
  });
  const sesion = await cargar('services/api.ts').iniciarSesion(usuario.email, 'contraseña-no-real');
  assert.equal(sesion.usuario.id, usuario.id);
  assert.equal(llamadas.length, 2);
  assert.ok(llamadas[0].url.endsWith('/api/auth/login'));
  assert.equal(llamadas[1].opciones.headers.Authorization, 'Bearer token-prueba');
});

test('no acepta tokens rechazados por /users/me ni respuestas incompletas', async () => {
  for (const datos of [{ message: 'ok' }, { token: '', usuario }, { token: 'token', usuario: {} }]) {
    const { cargar } = entorno(async () => respuesta(200, datos));
    await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba'), /verificar/);
  }
  const { cargar } = entorno(async (url) => url.endsWith('/auth/login') ? respuesta(200, { token: 'token', usuario }) : respuesta(401, {}));
  await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba'), (error) => error.status === 401);
});

test('rechaza un perfil de otro usuario aunque ambos HTTP sean 200', async () => {
  const { cargar } = entorno(async (url) => respuesta(200, url.endsWith('/auth/login') ? { token: 'token', usuario } : { usuario: { ...usuario, id: 99 } }));
  await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba'), /no corresponde/);
});

test('registro solo devuelve usuario ante una respuesta válida de la API', async () => {
  const solicitudes = [];
  const { cargar } = entorno(async (url, opciones) => {
    solicitudes.push({ url, body: JSON.parse(opciones.body) });
    return respuesta(201, { usuario });
  });
  const resultado = await cargar('services/api.ts').registrarCuenta({ nombre: usuario.nombre, email: usuario.email, password: 'solo-prueba' });
  assert.equal(resultado.id, 7);
  assert.equal(solicitudes[0].body.nombre, usuario.nombre);
  const invalido = entorno(async () => respuesta(201, { message: 'ok' }));
  await assert.rejects(invalido.cargar('services/api.ts').registrarCuenta({ nombre: 'Prueba', email: 'a@b.com', password: 'solo-prueba' }), /verificar/);
});

test('errores de credenciales, correo duplicado, servidor y conexión no se convierten en éxito', async () => {
  for (const status of [401, 409, 500]) {
    const { cargar } = entorno(async () => respuesta(status, {}));
    await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba'), (error) => error.status === status && error.message.length > 0);
  }
  const { cargar } = entorno();
  await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba'), /conectar con el servidor/);
});

test('cancelar una petición no devuelve usuario ni sesión', async () => {
  const { cargar } = entorno(async (_url, opciones) => {
    if (opciones.signal.aborted) throw new DOMException('cancelado', 'AbortError');
    throw new Error('No debería llegar aquí');
  });
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(cargar('services/api.ts').iniciarSesion('a@b.com', 'prueba', controller.signal), (error) => error.name === 'AbortError');
});

test('conserva selección y paso, ignora datos corruptos y no almacena contraseñas', () => {
  const { cargar, memoria } = entorno();
  const seleccion = cargar('components/seleccionInscripcion.ts');
  const api = cargar('services/api.ts');
  seleccion.guardarSeleccion({ sedeId: 'choluteca', planId: 'negro', paso: 'confirmacion' });
  assert.equal(seleccion.leerSeleccion().paso, 'confirmacion');
  api.conservarToken('token-prueba');
  assert.equal(api.leerToken(), 'token-prueba');
  assert.ok([...memoria.values()].every((value) => !value.includes('token-prueba')));
  assert.ok([...memoria.values()].every((value) => !value.includes('password')));
  api.conservarToken(null);
  assert.equal(api.leerToken(), null);
  const clave = 'fitzone-hn:seleccion-inscripcion:v1';
  for (const invalido of ['no-json', '{"sedeId":"inexistente","planId":"fit"}', '{"sedeId":"choluteca","planId":"inventado"}']) {
    memoria.set(clave, invalido);
    assert.equal(seleccion.leerSeleccion(), null);
  }
  memoria.set(clave, '{"sedeId":"choluteca","planId":null,"paso":"confirmacion"}');
  assert.equal(seleccion.leerSeleccion().paso, 'membresia');
});

test('un plan sin sede sobrevive la recarga y el almacenamiento solo incluye selección y paso', () => {
  const { cargar, memoria } = entorno();
  const seleccion = cargar('components/seleccionInscripcion.ts');
  for (const planId of ['fit', 'negro']) {
    seleccion.guardarSeleccion({ sedeId: null, planId, paso: 'cuenta', password: 'no-guardar', token: 'no-guardar' });
    assert.equal(seleccion.leerSeleccion().planId, planId);
    assert.equal(seleccion.leerSeleccion().sedeId, null);
    assert.equal(seleccion.leerSeleccion().paso, 'gimnasio');
    assert.ok([...memoria.values()].every((value) => !value.includes('no-guardar')));
  }
  const api = cargar('services/api.ts');
  api.conservarToken('solo-memoria');
  assert.equal(api.leerToken(), 'solo-memoria');
  assert.equal(entorno().cargar('services/api.ts').leerToken(), null);
});

test('A–F: ambos puntos de entrada, cambio de plan y sede y restauración de selección', () => {
  for (const origen of ['plan', 'sede']) {
    for (const planId of ['fit', 'negro']) {
      const estadoApp = estadoReact();
      const appEnv = entorno(undefined, estadoApp.hooks);
      const App = appEnv.cargar('App.tsx').default;
      const datos = appEnv.cargar('components/sedesData.ts');
      function renderApp() { estadoApp.reiniciar(); return App(); }
      if (origen === 'plan') {
        const modal = nodos(renderApp()).find((nodo) => nodo.type?.name === 'ModalMembresia');
        modal.props.onElegir(planId, 'choluteca');
      }
      const estadoSedes = estadoReact();
      const Sedes = entorno(undefined, estadoSedes.hooks).cargar('components/Sedes.tsx').default;
      function renderSedes() {
        estadoSedes.reiniciar();
        const props = nodos(renderApp()).find((nodo) => nodo.type?.name === 'Sedes').props;
        return Sedes(props);
      }
      function boton(etiqueta) { return nodos(renderSedes()).find((nodo) => nodo.type === 'button' && texto(nodo).trim() === etiqueta); }
      if (origen === 'sede') {
        nodos(renderSedes()).find((nodo) => nodo.props?.['aria-label'] === `Ver gimnasio ${datos.sedes[0].nombre}`).props.onClick();
        assert.equal(appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion(), null);
        nodos(renderSedes()).find((nodo) => nodo.props?.['aria-label'] === `Comenzar selección de membresía en ${datos.sedes[0].nombre}`).props.onClick();
        nodos(renderSedes()).find((nodo) => nodo.type === 'input' && nodo.props.value === planId).props.onChange();
        boton('CONTINUAR INSCRIPCIÓN').props.onClick();
      }
      const formulario = nodos(renderSedes()).find((nodo) => nodo.type?.name === 'AutenticacionInscripcion');
      assert.ok(formulario, `${origen}/${planId} llega a cuenta sin duplicar selección`);
      assert.ok(formulario.props.resumen.includes(planId === 'fit' ? 'PLAN FIT · L 599/mes' : 'PLAN NEGRO · L 799/mes'));
      // La autenticación y sus respuestas se comprueban en las pruebas de contrato de API.
      formulario.props.onAutenticado({ token: 'token-prueba', usuario });
      const resumen = nodos(renderSedes()).find((nodo) => nodo.type?.name === 'ConfirmacionInscripcion');
      assert.equal(resumen.props.plan.id, planId);
      assert.equal(resumen.props.usuario.nombre, usuario.nombre);
      resumen.props.onCambiarPlan();
      const nuevoPlan = planId === 'fit' ? 'negro' : 'fit';
      nodos(renderSedes()).find((nodo) => nodo.type === 'input' && nodo.props.value === nuevoPlan).props.onChange();
      let guardada = appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion();
      assert.equal(guardada.sedeId, 'choluteca');
      assert.equal(guardada.planId, planId);
      boton('CONTINUAR INSCRIPCIÓN').props.onClick();
      guardada = appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion();
      assert.equal(guardada.planId, nuevoPlan);
      nodos(renderSedes()).find((nodo) => nodo.props?.['aria-label'] === `Comenzar selección de membresía en ${datos.sedes[1].nombre}`).props.onClick();
      guardada = appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion();
      assert.equal(guardada.sedeId, 'choluteca');
      boton('CONTINUAR INSCRIPCIÓN').props.onClick();
      guardada = appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion();
      assert.equal(guardada.sedeId, 'tegucigalpa');
      assert.equal(guardada.planId, nuevoPlan);
      const recarga = entorno();
      for (const [clave, valor] of appEnv.memoria) recarga.memoria.set(clave, valor);
      const restaurada = recarga.cargar('components/seleccionInscripcion.ts').leerSeleccion();
      assert.equal(restaurada.sedeId, guardada.sedeId);
      assert.equal(restaurada.planId, guardada.planId);
      assert.equal(restaurada.paso, 'cuenta');
      assert.equal(recarga.cargar('services/api.ts').leerToken(), null);
    }
  }
});

test('buscador y precios de las tres sedes se conservan', () => {
  const data = entorno().cargar('components/sedesData.ts');
  for (const [consulta, total] of [['', 3], ['TEGUCIGÁLPA', 1], ['cortes', 1], [' san  pedro sula ', 1], ['sin-resultados', 0]]) {
    assert.equal(data.filtrarSedes(consulta).length, total);
  }
  assert.deepEqual(Array.from(data.membresias, (plan) => plan.precio), [599, 799]);
});

function nodos(nodo) {
  if (Array.isArray(nodo)) return nodo.flatMap(nodos);
  return nodo && typeof nodo === 'object' ? [nodo, ...nodos(nodo.props?.children)] : [];
}

function texto(nodo) {
  if (Array.isArray(nodo)) return nodo.map(texto).join(' ');
  if (nodo == null || typeof nodo === 'boolean') return '';
  return typeof nodo === 'object' ? texto(nodo.props?.children) : String(nodo);
}

function estadoReact() {
  const estados = [];
  let cursor = 0;
  return {
    reiniciar() { cursor = 0; },
    hooks: {
      useState(inicial) {
        const indice = cursor++;
        if (!(indice in estados)) estados[indice] = typeof inicial === 'function' ? inicial() : inicial;
        return [estados[indice], (valor) => { estados[indice] = valor; }];
      },
      useRef(inicial) {
        const indice = cursor++;
        if (!(indice in estados)) estados[indice] = { current: inicial };
        return estados[indice];
      },
      useEffect() {},
    },
  };
}

test('formularios: contrato de registro, login y perfil antes de notificar autenticación', async () => {
  const estado = estadoReact();
  const llamadas = [];
  let sesionRecibida;
  const { cargar } = entorno(async (url) => {
    llamadas.push(url);
    if (url.endsWith('/auth/register')) return respuesta(201, { usuario });
    if (url.endsWith('/auth/login')) return respuesta(200, { token: 'token', usuario });
    return respuesta(200, { usuario });
  }, estado.hooks);
  const Formulario = cargar('components/AutenticacionInscripcion.tsx').default;
  function render() { estado.reiniciar(); return Formulario({ onAutenticado: (sesion) => { sesionRecibida = sesion; }, onVolver() {}, resumen: 'Choluteca · PLAN FIT' }); }
  nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === 'CREAR CUENTA').props.onClick();
  for (const [id, value] of [['cuenta-nombre', usuario.nombre], ['cuenta-email', usuario.email], ['cuenta-password', 'solo-prueba'], ['cuenta-confirmacion', 'solo-prueba']]) {
    nodos(render()).find((nodo) => nodo.props?.id === id).props.onChange({ target: { value } });
  }
  await nodos(render()).find((nodo) => nodo.type === 'form').props.onSubmit({ preventDefault() {} });
  assert.equal(sesionRecibida.usuario.id, 7);
  assert.deepEqual(llamadas.map((url) => new URL(url).pathname), ['/api/auth/register', '/api/auth/login', '/api/users/me']);
});

test('formulario mantiene el paso 3 ante API caída o respuesta inválida', async () => {
  for (const fetchImpl of [async () => { throw new TypeError('offline'); }, async () => respuesta(200, { message: 'ok' })]) {
    const estado = estadoReact();
    let autenticaciones = 0;
    const { cargar } = entorno(fetchImpl, estado.hooks);
    const Formulario = cargar('components/AutenticacionInscripcion.tsx').default;
    function render() { estado.reiniciar(); return Formulario({ onAutenticado: () => autenticaciones++, onVolver() {}, resumen: 'Selección conservada' }); }
    for (const [id, value] of [['cuenta-email', usuario.email], ['cuenta-password', 'solo-prueba']]) nodos(render()).find((nodo) => nodo.props?.id === id).props.onChange({ target: { value } });
    await nodos(render()).find((nodo) => nodo.type === 'form').props.onSubmit({ preventDefault() {} });
    assert.equal(autenticaciones, 0);
    assert.ok(nodos(render()).some((nodo) => nodo.props?.role === 'alert'));
  }
});

test('resumen de cada sede y plan conserva la confirmación deshabilitada', () => {
  const { cargar } = entorno();
  const data = cargar('components/sedesData.ts');
  const Confirmacion = cargar('components/ConfirmacionInscripcion.tsx').default;
  for (const sede of data.sedes) {
    for (const plan of data.membresias) {
      const vista = Confirmacion({ usuario, sede, plan, onCambiarPlan() {}, onCambiarCuenta() {} });
      for (const valor of [usuario.nombre, usuario.email, sede.nombre, plan.nombre, String(plan.precio)]) assert.ok(texto(vista).includes(valor));
      for (const beneficio of plan.beneficios) assert.ok(texto(vista).includes(beneficio));
      assert.ok(texto(vista).includes(plan.alcance));
      const boton = nodos(vista).find((nodo) => nodo.type === 'button' && texto(nodo).includes('CONFIRMAR SOLICITUD'));
      assert.equal(boton.props.disabled, true);
      assert.equal(boton.props.onClick, undefined);
    }
  }
});

test('modales muestran beneficios y precios específicos y eligen el plan correcto', () => {
  const { membresias } = entorno().cargar('components/sedesData.ts');
  for (const plan of membresias) {
    const estado = estadoReact();
    const Modal = entorno(undefined, estado.hooks).cargar('components/ModalMembresia.tsx').default;
    let elegido;
    function render() { estado.reiniciar(); return Modal({ plan, seleccionAnterior: null, onNuevaInscripcion() {}, onCerrar() {}, onElegir: (id, sedeId) => { elegido = { id, sedeId }; } }); }
    const vista = render();
    for (const beneficio of plan.beneficios) assert.ok(texto(vista).includes(beneficio));
    assert.equal(plan.precio, plan.id === 'fit' ? 599 : 799);
    assert.ok(texto(vista).includes(String(plan.precio)));
    assert.ok(!texto(vista).includes('BLACK'));
    assert.ok(!texto(vista).includes(plan.id === 'fit' ? 'Acceso a todas las sedes' : 'Ambiente cómodo y seguro'));
    const continuar = (vista) => nodos(vista).find((nodo) => nodo.type === 'button' && texto(nodo).trim() === 'CONTINUAR INSCRIPCIÓN');
    assert.equal(continuar(vista).props.disabled, true);
    continuar(vista).props.onClick();
    assert.equal(elegido, undefined);
    assert.ok(texto(vista).includes('Sede pendiente de seleccionar'));
    const opciones = nodos(vista).filter((nodo) => nodo.type === 'input' && nodo.props.type === 'radio');
    assert.equal(opciones.length, 3);
    assert.ok(opciones.every((nodo) => nodo.props.checked === false));
    for (const opcion of opciones) {
      opcion.props.onChange();
      const actual = render();
      assert.equal(nodos(actual).filter((nodo) => nodo.type === 'input' && nodo.props.checked).length, 1);
      assert.equal(continuar(actual).props.disabled, false);
      continuar(actual).props.onClick();
      assert.deepEqual(elegido, { id: plan.id, sedeId: opcion.props.value });
    }
  }
});

test('nueva inscripción limpia únicamente selecciones y el modal permite cambiar la sede anterior', () => {
  const estado = estadoReact();
  const { cargar, memoria } = entorno(undefined, estado.hooks);
  const seleccion = cargar('components/seleccionInscripcion.ts');
  seleccion.guardarSeleccion({ sedeId: 'san-pedro-sula', planId: 'negro', paso: 'cuenta' });
  memoria.set('otra-preferencia', 'conservar');
  const { membresias } = cargar('components/sedesData.ts');
  const Modal = cargar('components/ModalMembresia.tsx').default;
  let elegido;
  function render() { estado.reiniciar(); return Modal({ plan: membresias[0], seleccionAnterior: seleccion.leerSeleccion(), onNuevaInscripcion: seleccion.limpiarSeleccion, onCerrar() {}, onElegir: (planId, sedeId) => { elegido = sedeId; } }); }
  assert.ok(texto(render()).includes('Sede seleccionada anteriormente: FITZONE-HN San Pedro Sula'));
  nodos(render()).find((nodo) => nodo.type === 'input' && nodo.props.value === 'tegucigalpa').props.onChange();
  nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === 'CONTINUAR INSCRIPCIÓN').props.onClick();
  assert.equal(elegido, 'tegucigalpa');
  nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === 'NUEVA INSCRIPCIÓN').props.onClick();
  assert.equal(seleccion.leerSeleccion(), null);
  assert.equal(memoria.get('otra-preferencia'), 'conservar');
  assert.ok(nodos(render()).filter((nodo) => nodo.type === 'input').every((nodo) => !nodo.props.checked));
});

test('acceso independiente reutiliza login y perfil sin sede, plan ni registro', async () => {
  for (const status of [200, 401, 500, 0]) {
    const estado = estadoReact();
    const llamadas = [];
    const env = entorno(async (url) => {
      llamadas.push(url);
      if (!status) throw new TypeError('offline');
      return respuesta(status, url.endsWith('/auth/login') ? { token: 'solo-memoria', usuario } : { usuario });
    }, estado.hooks);
    const Formulario = env.cargar('components/AutenticacionInscripcion.tsx').default;
    let sesion;
    function render() { estado.reiniciar(); return Formulario({ independiente: true, resumen: '', onVolver() {}, onAutenticado: (valor) => { sesion = valor; } }); }
    const inicial = texto(render());
    assert.ok(!inicial.includes('PASO 3'));
    assert.ok(!inicial.includes('CREAR CUENTA'));
    for (const [id, value] of [['cuenta-email', usuario.email], ['cuenta-password', 'solo-prueba']]) nodos(render()).find((nodo) => nodo.props?.id === id).props.onChange({ target: { value } });
    await nodos(render()).find((nodo) => nodo.type === 'form').props.onSubmit({ preventDefault() {} });
    if (status === 200) {
      assert.equal(sesion.usuario.id, usuario.id);
      assert.equal(llamadas.length, 2);
      assert.ok(llamadas[1].endsWith('/users/me'));
    } else {
      assert.equal(sesion, undefined);
      assert.ok(nodos(render()).some((nodo) => nodo.props?.role === 'alert'));
    }
    assert.equal(env.cargar('components/seleccionInscripcion.ts').leerSeleccion(), null);
    assert.ok([...env.memoria.values()].every((valor) => !valor.includes('solo-memoria') && !valor.includes('solo-prueba')));
  }
});

test('portada e inscripción comparten sesión y cerrar sesión conserva sede y membresía', () => {
  const estado = estadoReact();
  const env = entorno(undefined, estado.hooks);
  const App = env.cargar('App.tsx').default;
  function render() { estado.reiniciar(); return App(); }
  nodos(render()).find((nodo) => nodo.props?.['aria-controls'] === 'sesion-modal').props.onClick();
  const modal = nodos(render()).find((nodo) => nodo.type?.name === 'ModalSesion');
  const sesion = { token: 'verificado-prueba', usuario };
  modal.props.onAutenticado(sesion);
  assert.ok(texto(render()).includes(usuario.nombre));
  let propsSedes = nodos(render()).find((nodo) => nodo.type?.name === 'Sedes').props;
  assert.equal(propsSedes.sesion, sesion);
  propsSedes.onSeleccion({ sedeId: 'tegucigalpa', planId: 'negro', paso: 'cuenta' });
  nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === 'CERRAR SESIÓN').props.onClick();
  propsSedes = nodos(render()).find((nodo) => nodo.type?.name === 'Sedes').props;
  assert.equal(propsSedes.sesion, null);
  assert.equal(propsSedes.seleccionGuardada.sedeId, 'tegucigalpa');
  assert.equal(propsSedes.seleccionGuardada.planId, 'negro');
  propsSedes.onSesion(sesion);
  assert.equal(nodos(render()).find((nodo) => nodo.type?.name === 'ModalSesion').props.sesion, sesion);
  nodos(render()).find((nodo) => nodo.type?.name === 'ModalSesion').props.onSesionInvalidada();
  assert.equal(nodos(render()).find((nodo) => nodo.type?.name === 'Sedes').props.sesion, null);
});

test('cambiar sede conserva el plan y solo guarda la nueva sede al confirmar', () => {
  for (const planId of ['fit', 'negro']) {
    const estadoApp = estadoReact();
    const appEnv = entorno(undefined, estadoApp.hooks);
    const App = appEnv.cargar('App.tsx').default;
    function app() { estadoApp.reiniciar(); return App(); }
    const props = () => nodos(app()).find((nodo) => nodo.type?.name === 'Sedes').props;
    props().onSeleccion({ sedeId: 'choluteca', planId, paso: 'cuenta' });
    const estadoSedes = estadoReact();
    const Sedes = entorno(undefined, estadoSedes.hooks).cargar('components/Sedes.tsx').default;
    function render() { estadoSedes.reiniciar(); return Sedes(props()); }
    const boton = (nombre) => nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === nombre);
    boton('CAMBIAR SEDE').props.onClick();
    let radios = nodos(render()).filter((nodo) => nodo.type === 'input' && nodo.props.name === 'cambiar-sede');
    assert.equal(radios.length, 3);
    radios.find((nodo) => nodo.props.value === 'tegucigalpa').props.onChange();
    assert.equal(props().seleccionGuardada.sedeId, 'choluteca');
    boton('CANCELAR').props.onClick();
    assert.equal(props().seleccionGuardada.sedeId, 'choluteca');
    boton('CAMBIAR SEDE').props.onClick();
    radios = nodos(render()).filter((nodo) => nodo.type === 'input' && nodo.props.name === 'cambiar-sede');
    assert.equal(radios.find((nodo) => nodo.props.checked).props.value, 'choluteca');
    radios.find((nodo) => nodo.props.value === 'san-pedro-sula').props.onChange();
    boton('CONFIRMAR CAMBIO DE SEDE').props.onClick();
    const guardada = appEnv.cargar('components/seleccionInscripcion.ts').leerSeleccion();
    assert.equal(guardada.sedeId, 'san-pedro-sula');
    assert.equal(guardada.planId, planId);
    assert.equal(guardada.paso, 'cuenta');
  }
});

test('un borrador de sede o membresía no reemplaza una selección confirmada al cerrar', () => {
  const estadoApp = estadoReact();
  const env = entorno(undefined, estadoApp.hooks);
  const App = env.cargar('App.tsx').default;
  function app() { estadoApp.reiniciar(); return App(); }
  const props = () => nodos(app()).find((nodo) => nodo.type?.name === 'Sedes').props;
  props().onSeleccion({ sedeId: 'choluteca', planId: 'fit', paso: 'cuenta' });
  const estado = estadoReact();
  const Sedes = entorno(undefined, estado.hooks).cargar('components/Sedes.tsx').default;
  function render() { estado.reiniciar(); return Sedes(props()); }
  const abrir = () => nodos(render()).find((nodo) => nodo.props?.['aria-label'] === 'Comenzar selección de membresía en FITZONE-HN Tegucigalpa').props.onClick();
  abrir();
  nodos(render()).find((nodo) => nodo.type === 'input' && nodo.props.value === 'negro').props.onChange();
  assert.equal(props().seleccionGuardada.planId, 'fit');
  assert.equal(props().seleccionGuardada.sedeId, 'choluteca');
  nodos(render()).find((nodo) => nodo.type === 'dialog').props.onClose();
  abrir();
  assert.equal(nodos(render()).find((nodo) => nodo.type === 'input' && nodo.props.checked).props.value, 'fit');
  nodos(render()).find((nodo) => nodo.type === 'input' && nodo.props.value === 'negro').props.onChange();
  nodos(render()).find((nodo) => nodo.type === 'button' && texto(nodo) === 'CONTINUAR INSCRIPCIÓN').props.onClick();
  assert.equal(props().seleccionGuardada.planId, 'negro');
  assert.equal(props().seleccionGuardada.sedeId, 'tegucigalpa');
});

test('las tarjetas de membresías usan el mismo catálogo de precios y beneficios que los modales', () => {
  const estado = estadoReact();
  const { cargar } = entorno(undefined, estado.hooks);
  const App = cargar('App.tsx').default;
  const { membresias } = cargar('components/sedesData.ts');
  estado.reiniciar();
  const planes = nodos(App()).find((nodo) => nodo.props?.id === 'planes');
  for (const plan of membresias) {
    assert.ok(texto(planes).includes(String(plan.precio)));
    for (const beneficio of plan.beneficios) assert.ok(texto(planes).includes(beneficio));
  }
});

test('el menú móvil abre, cierra con Escape y se cierra al elegir navegación', () => {
  const estado = estadoReact();
  const App = entorno(undefined, estado.hooks).cargar('App.tsx').default;
  function render() { estado.reiniciar(); return App(); }
  const boton = () => nodos(render()).find((nodo) => nodo.props?.['aria-controls'] === 'menu-principal');
  assert.equal(boton().props['aria-expanded'], false);
  boton().props.onClick();
  assert.equal(boton().props['aria-expanded'], true);
  nodos(render()).find((nodo) => nodo.type === 'header').props.onKeyDown({ key: 'Escape' });
  assert.equal(boton().props['aria-expanded'], false);
  boton().props.onClick();
  nodos(render()).find((nodo) => nodo.type === 'nav' && nodo.props['aria-label'] === 'Navegación principal').props.onClick();
  assert.equal(boton().props['aria-expanded'], false);
});
