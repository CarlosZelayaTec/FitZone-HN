# Fotografías del frontend de FITZONE-HN

Las tres fotografías actuales de sedes fueron proporcionadas por el usuario. Su uso visual no verifica direcciones, horarios ni la existencia comercial de las sedes del proyecto. No se generaron imágenes nuevas para sustituirlas.

## Sedes y versiones optimizadas

| Sede | Original de respaldo | Dimensiones originales | Peso original |
|---|---|---|---|
| Choluteca | `public/images/choluteca.png` | 1536 × 1024 | 3.129.416 bytes |
| Tegucigalpa | `public/images/tegucigalpa.png` | 1680 × 945 | 3.109.466 bytes |
| San Pedro Sula | `public/images/san-pedro-sula.png` | 1673 × 940 | 3.226.105 bytes |

Para cada sede hay copias WebP de 480, 960 y 1536 píxeles de ancho, con el patrón `<sede>-<ancho>.webp`. Se obtuvieron con Pillow ya instalado, orientación EXIF normalizada, remuestreo Lanczos y calidad WebP 84. Se conservan las fotografías, sus proporciones y los PNG originales.

El catálogo `src/components/sedesData.ts` proporciona `imagen` e `imagenSrcSet`. Tarjetas, detalles y resumen usan `srcset` y `sizes`. Los originales suman 9.464.987 bytes; las tres versiones de 1536 suman 900.912 bytes (90,48 % menos). Las de 960 suman 407.624 y las de 480 suman 120.310 bytes. El navegador elige según ancho y densidad; mantener respaldos en `public` conserva su tamaño en la distribución, aunque la interfaz ya no los solicita.

## Beneficios y portada

- Equipamiento: `public/images/equipamiento.png`.
- Entrenamiento: `public/images/entrenamiento.png`.
- Instalaciones: `public/images/instalaciones.png`.
- Fondo de membresías: `public/images/membresias-gym.png`.
- Portada: `public/images/hero-gimnasio.jpg` y `public/videos/hero-gimnasio.mp4`.

El encuadre de Beneficios se ajusta únicamente mediante CSS en `App.tsx`: posición por fotografía y alturas adaptables. No se editan los archivos originales. El video permanece intacto y su control está en `HeroBackground.tsx`.

## Recursos anteriores conservados

La búsqueda de referencias en el código activo no encontró usos actuales de `sede-fuerza.png`, `sede-cardio.png`, `sede-funcional.png`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, `public/icons.svg`, los PNG de `public/iconos/`, `src/App.css` ni `src/App.respaldo.txt`. Se conservan porque pueden ser respaldos o materiales de otros integrantes; no se autoriza su eliminación a partir de esta lista.

Los tres archivos `sede-fuerza.png`, `sede-cardio.png` y `sede-funcional.png` corresponden a las ilustraciones generadas usadas anteriormente, no a las fotos actuales. No deben volver a enlazarse por accidente.
