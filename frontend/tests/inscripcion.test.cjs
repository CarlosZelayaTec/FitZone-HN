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
      const boton = nodos(vista).find((nodo) => nodo.type === 'button' && texto(nodo).includes('CONFIRMAR SOLICITUD'));
      assert.equal(boton.props.disabled, true);
      assert.equal(boton.props.onClick, undefined);
    }
  }
});
