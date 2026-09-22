# DataLogger ESP32 · Sitio estático

Abrí `index.html` directamente en el navegador. Todo el sitio utiliza HTML, CSS y JavaScript puro, con imágenes locales. No requiere instalación, build ni servidor.

## Páginas

| Archivo              | Contenido                                                                             |
| -------------------- | ------------------------------------------------------------------------------------- |
| `index.html`         | Presentación, funciones, arquitectura, hardware, equipo y accesos a las otras páginas |
| `interfaz.html`      | Las siete capturas originales y la explicación de cada pantalla                       |
| `quick-start.html`   | Guía de primera conexión y consulta de mediciones                                     |
| `manual.html`        | Manual de uso, configuración y diagnóstico                                            |
| `documentacion.html` | Acceso al documento local, Gantt, GitHub, conexiones y referencia API |
| `documento-proyecto.html` | Documento completo adaptado, índice, tablas y original descargable |
| `faq.html`           | Preguntas frecuentes desplegables                                                     |

El manual, Quick Start, las capturas, la documentación técnica y las FAQ están en **archivos separados**. No se renderizan ocultos ni se acumulan debajo de la portada. Los enlaces navegan a cada página y funcionan también sin JavaScript.

Todas las páginas comparten `styles.css` y `script.js`. Los iconos están incluidos en el HTML para funcionar al abrir los archivos localmente.

## Imágenes

Los adjuntos del equipo se conservan sin modificaciones en `assets/images/`:

- Hero: `datalogger.png`.
- Hardware: `esp32.png`, `bme280.png`, `ds3231.png`, `oled.png`, `microsd.png`, `pulsador.png`, `bateria.png` y `tp4056.png`.
- Equipo: `valentino-dabbah.png`, `santiago-puleo.png`, `felipe-risoli.png`, `marco-varilni.png` y `malena-mazzarone.png`. Las funciones se transcribieron del adjunto `roles-equipo.png`.

La tarjeta de Santiago utiliza `assets/images/santiago-puleo-retrato.png`, una versión editada con la herramienta integrada de generación de imágenes para quitar el marco OpenToWork y acercar el rostro. El original se conserva.

<details>
<summary>Prompt de edición del retrato de Santiago</summary>

Use case: precise-object-edit. Edit target: the attached portrait of Santiago for a small team card on a website. Remove the entire green LinkedIn OpenToWork border, all white #OPENTOWORK lettering, and the green haze. Reconstruct the plain light gray background and gray polo where obscured. Make a square, tighter head-and-shoulders crop, with full hair visible and his face large and centered, suitable for a 68px avatar. Preserve his exact identity, facial features, expression, hairstyle, earrings, gray polo, and natural photographic appearance. No beautification, no changes to age, no new text, no logos, no borders. Change only the overlay removal and closer framing.

</details>
- Conexiones: `conexiones.png`.
- Interfaz: `dashboard.png`, `temperatura.png`, `humedad.png`, `presion.png`, `historial.png`, `base-de-datos.png` y `configuracion.png`.

Las capturas se muestran completas y se pueden abrir en tamaño original. Son imágenes de referencia, no lecturas en vivo. Algunas muestran rótulos DHT22/BMP280; la descripción del hardware de este proyecto conserva BME280. Esa diferencia se aclara junto a la galería.

## Próximas actualizaciones

- Para cambiar una captura, reemplazá el archivo correspondiente en `assets/images/`. Si cambia su tamaño, actualizá los atributos `width` y `height` del `img` en `interfaz.html`.
- Para incorporar la fotografía real del proyecto, cambiá la imagen, el texto alternativo y el pie del hero en `index.html`.
- Equipo: las cinco fotos y funciones están completas en `index.html`, en el orden indicado. Las tarjetas usan `.compact-team`, `.compact-member` y `.member-photo`.
- Si editás el menú o el footer, aplicá el cambio a los siete HTML para mantener la navegación coherente.
- Conservá UTF-8 para los textos en español.

## Publicación y alcance

Subí **todo el contenido de `landing-datalogger/`** a la raíz del repositorio usado para GitHub Pages. Mantené las rutas relativas; cada HTML puede abrirse directamente o compartirse como página independiente.

El sitio presenta y documenta el proyecto; no modifica el firmware ni ejecuta las funciones del panel. Las funciones de muestreo, retención, alertas y preferencias se describen según la información del equipo.

La consulta local del ESP32 funciona en su propia red sin Internet. Los enlaces publicados y las integraciones externas necesitan conectividad a esos servicios. En las rutas del manual, reemplazá `IP_DEL_ESP32` por la dirección real del equipo; nunca publiques credenciales, contraseñas o tokens.

## Organización editorial

La portada presenta el proyecto. `interfaz.html` describe las funciones con capturas; `manual.html` explica cómo utilizarlo; `quick-start.html` contiene el primer inicio; `documentacion.html` reúne las referencias técnicas y los recursos externos. Se eliminaron las listas y los bloques repetidos entre estos recorridos.

## Documento del proyecto

`documento-proyecto.html` adapta íntegramente el texto proporcionado por el equipo y se abre desde Documentación. Contiene índice navegable, control de cambios, responsables, alcance, requisitos y las secciones 2 a 8 con su numeración original. Los apartados vacíos se indican como pendientes; las notas de trabajo se expresan como tareas sin inventar resultados, prioridades, presupuestos ni firmas.

El archivo `assets/documents/documentacion-original.txt` conserva el adjunto completo, sin cambios, y puede descargarse desde la página. La adaptación distingue el planteo inicial MQTT/XLS del funcionamiento local HTTP/CSV presentado en el sitio. Las hipótesis institucionales se atribuyen a los autores del borrador y las mejoras previstas no se presentan como implementadas.

Para actualizar esta página, editá sus secciones HTML y mantené sus identificadores `doc-*`, utilizados por el índice. Actualizá también el archivo de origen cuando recibas una nueva versión, conservando la trazabilidad de los cambios.
