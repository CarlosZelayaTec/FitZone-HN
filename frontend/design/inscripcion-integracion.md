# Integración del proceso de inscripción

Implementación exclusivamente frontend. No agrega endpoints, tablas, migraciones ni pagos.

## API existente utilizada

- `POST /api/auth/register`: `{ nombre, email, password }`. Debe responder con `usuario: { id, nombre, email, rol }`. El frontend no considera válido un registro solo por recibir un mensaje de éxito.
- `POST /api/auth/login`: `{ email, password }`. Debe responder con `{ token, usuario }`.
- `GET /api/users/me`: encabezado `Authorization: Bearer <token>`. Debe responder con `{ usuario }`. Verifica la sesión antes de avanzar al paso 4, también al retomar una selección guardada.

Después de registrarse se solicita el inicio de sesión y el perfil. Si la cuenta se crea pero el login falla, se indica que la cuenta existe y se permite iniciar sesión sin volver a registrarse. No hay reintentos automáticos de creación de cuentas.

## Dirección de la API

En desarrollo, el valor predeterminado es `http://localhost:3000/api`. Puede definirse `VITE_API_URL` en el entorno de Vite, incluyendo el prefijo `/api`, por ejemplo `https://api.ejemplo.hn/api`. No introducir secretos en variables `VITE_`, que son públicas. En producción, sin esa variable, se usa `/api` en el mismo origen. El equipo de despliegue deberá servir esa ruta o proporcionar la URL correspondiente; no se ha modificado Rocky Linux ni la configuración del servidor.

La API debe permitir el origen del frontend mediante CORS y usar HTTPS en despliegue. Cada petición tiene un límite de 12 segundos y se cancela al salir del formulario.

## Persistencia

Se guardan sede, plan y paso en `sessionStorage`; los precios se consultan siempre en el catálogo del frontend. El token también se conserva solo en esta pestaña y se valida contra `/users/me` al restaurar. Las contraseñas no se guardan. Cambiar de cuenta elimina el token local; no revoca tokens en el servidor porque no existe un endpoint de cierre de sesión.

Si el navegador bloquea el almacenamiento, el flujo funciona en memoria, pero no puede conservarse al recargar. El almacenamiento no sustituye la validación de autenticación ni debe utilizarse para autorizar solicitudes en el backend.

## Pendiente para el compañero de backend

Falta acordar e implementar el contrato de inscripciones: URL, autenticación, identificadores de sede y membresía aceptados, campos, códigos de error y respuesta que confirme almacenamiento real con identificador y estado. Actualmente el botón de confirmación está deshabilitado y no envía peticiones. Ninguna pantalla simula una inscripción exitosa.

Los identificadores del catálogo frontend son `choluteca`, `tegucigalpa`, `san-pedro-sula`, `fit` y `negro`. Los precios visualizados son L 599 y L 799 mensuales. El backend deberá validar los identificadores, establecer el precio desde su propio catálogo y obtener el usuario desde la autenticación, además de manejar duplicados y permisos.

## Verificación

- `npm run build`
- `npm run lint`
- `node --test tests/inscripcion.test.cjs` (usa Node y TypeScript ya instalados; no accede a la API ni a la base de datos).

Prueba manual: abrir `/#sedes`, buscar una sede, elegir plan, continuar y alternar entre registro e inicio de sesión. Con la API apagada debe mostrarse un error sin perder la selección; con una cuenta real y API disponible debe verificarse el perfil antes de mostrar el resumen del paso 4. Recargar y usar “Retomar selección” debe recuperar sede y plan y volver a validar la sesión. Comprobar las tres formas de cierre y la navegación por teclado en móvil y escritorio.
