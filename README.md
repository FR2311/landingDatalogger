# Datalogger · Landing de producto

Abrí `index.html` directamente en el navegador. El sitio utiliza HTML, CSS y JavaScript puros, con imágenes y tipografía locales. No requiere instalación, build, backend ni conexión a servicios para explorar sus páginas.

## Presentación

La portada explica qué permite hacer Datalogger: consultar temperatura, humedad y presión, reconocer variaciones y volver sobre los registros. No incluye Hardware, Arquitectura ni una lista de componentes. Los botones principales llevan a Beneficios y Paneles; no hay formularios comerciales, precios ni cotizaciones.

El menú compartido es Producto, Beneficios, Paneles, Equipo y Quick Start. Quick Start está visible en el encabezado de las siete páginas y dentro del menú móvil; también se conserva el enlace «Primeros pasos» del pie. `styles.css` conserva los estilos de las guías y `product.css` define la identidad comercial, los contrastes, la portada, el equipo y la galería.

La nueva dirección visual usa un hero azul profundo y el mensaje «Tu ambiente, en perspectiva». El dispositivo se presenta vertical, sin inclinación, con tamaño destacado, sin tarjeta ni fondo rectangular y con la silueta completa. Los beneficios se presentan en tres columnas editoriales, el recorrido combina texto azul y capturas completas, y Temperatura, Humedad y Presión se muestran también en tres vistas previas juntas. El equipo conserva cinco integrantes en fila en escritorio, con fotografías de 72 px; en pantallas pequeñas se reorganiza. El visor y los documentos existentes se mantienen.

## Páginas

| Archivo | Contenido |
| --- | --- |
| `index.html` | Producto, beneficios, cinco vistas, respaldo y cinco integrantes del equipo |
| `interfaz.html` | Recorrido de Panel principal, Temperatura, Humedad, Presión e Historial |
| `quick-start.html` | Primeros pasos |
| `manual.html` | Manual de uso y diagnóstico |
| `faq.html` | Preguntas frecuentes |
| `documentacion.html` | Recursos y documentación técnica |
| `documento-proyecto.html` | Documento del proyecto y original descargable |

No se muestran capturas de Base de Datos ni Configuración. Sus archivos anteriores no se borraron.

## Imágenes y marca

El hero usa `assets/images/datalogger-real-cutout.png`, una copia con fondo transparente preparada a partir de `dataloggerReal.webp` mediante la herramienta integrada `image_gen`, modo `background-extraction`. El prompt utilizado está en `assets/images/datalogger-real-cutout.prompt.txt`. La fotografía original se conserva sin sobrescribir y se abre desde «Ver fotografía original». El tamaño y la posición del hero se ajustan solo con CSS. Las pruebas comprueban los límites de la silueta visible con el canal alfa, para no confundir el margen transparente con una parte del producto.

Los seis archivos originales adjuntados el 3 de noviembre de 2026 se conservan en `assets/images/`. Se crearon copias con nombres estables:

| Original | Copia utilizada |
| --- | --- |
| WhatsApp Image 2026-11-03 at 22.51.54.jpeg | panel-principal-real.jpg |
| WhatsApp Image 2026-11-03 at 22.43.20.jpeg | temperatura-real.jpg |
| WhatsApp Image 2026-11-03 at 22.43.57.jpeg | humedad-real.jpg |
| WhatsApp Image 2026-11-03 at 22.45.09.jpeg | presion-real.jpg |
| WhatsApp Image 2026-11-03 at 22.46.03.jpeg | historial-real.jpg |
| WhatsApp Image 2026-11-03 at 23.02.49.jpeg | inti.jpg |

La silueta del dispositivo, las tres capturas y las galerías se muestran completas, conservando proporciones. El visor permite consultar las fotografías y capturas originales ajustadas a pantalla o en tamaño nativo, con desplazamiento si hace falta. La resolución está limitada por los archivos proporcionados. Las capturas de interfaz no se editaron ni representan datos en vivo. Las cinco fotos y responsabilidades del equipo existente se conservan.

La marca principal es Datalogger. El logo del INTI aparece únicamente junto al respaldo del director del Laboratorio de Robótica, conforme a la confirmación del responsable del proyecto; no se agrega una certificación institucional general ni un sello inventado.

La tipografía Plus Jakarta Sans está incluida en `assets/fonts/` junto con su licencia OFL.

## Interacción y accesibilidad

La galería permite elegir las cinco vistas con mouse o teclado (flechas, Inicio y Fin). Conserva los enlaces directos `interfaz.html#vista-dashboard`, `#vista-temperatura`, `#vista-humedad`, `#vista-presion` y `#vista-historial`. Sin JavaScript, las cinco vistas se muestran en orden y los enlaces siguen funcionando.

El menú móvil y el visor de imágenes pueden cerrarse con Escape. Al cerrar el visor, el foco vuelve al enlace original. Los enlaces de imagen siguen abriendo el archivo original sin JavaScript. Se respetan las preferencias de movimiento reducido. Texto azul profundo sobre fondos claros y texto claro sobre azul oscuro mantienen un contraste alto; las combinaciones principales superan 4.5:1.

## Verificación local

Solo para ejecutar las pruebas: Node.js 22.12 o posterior, `npm install` y `npm run test:ui`. Puppeteer utiliza Chrome instalado en Windows o su navegador incluido. Se puede indicar otra ruta mediante `CHROME_PATH`.

La prueba revisa siete páginas en escritorio (1440×1000), tablet (768×1024) y móvil (390×844): errores JavaScript, recursos, imágenes, enlaces y anclas, desbordes, galería, teclado, contraste, menú, apertura sin JavaScript y apertura directa con `file://`. Las capturas se generan en `tests/previews/`, excluido de Git. El servidor temporal se cierra al terminar.

## Alcance

Los cambios son locales. No se publicó el sitio, no se cambiaron APIs ni se modificaron el dashboard o el firmware. Se conservan los documentos y las imágenes técnicas para consulta secundaria.

## Procedencia del retrato existente

La tarjeta de Santiago utiliza `assets/images/santiago-puleo-retrato.png`, una versión editada con la herramienta integrada de generación de imágenes para quitar el marco OpenToWork y acercar el rostro. El original se conserva.

<details>
<summary>Prompt de edición del retrato de Santiago</summary>

Use case: precise-object-edit. Edit target: the attached portrait of Santiago for a small team card on a website. Remove the entire green LinkedIn OpenToWork border, all white #OPENTOWORK lettering, and the green haze. Reconstruct the plain light gray background and gray polo where obscured. Make a square, tighter head-and-shoulders crop, with full hair visible and his face large and centered, suitable for a 68px avatar. Preserve his exact identity, facial features, expression, hairstyle, earrings, gray polo, and natural photographic appearance. No beautification, no changes to age, no new text, no logos, no borders. Change only the overlay removal and closer framing.

</details>

## Documento del proyecto
El enlace «Documentación del proyecto» de los siete pies y el botón principal de Documentación abren https://claude.ai/artifact/FUM1c3DuGiFqgQw5Yv4ygL en una pestaña nueva. La tarjeta «Desarrollo abierto» se retiró de los recursos; se conservan los otros enlaces y archivos del proyecto.

`documento-proyecto.html` conserva la adaptación local del texto proporcionado por el equipo, pero ya no es el destino del botón principal de Documentación. Contiene índice navegable, control de cambios, responsables, alcance, requisitos y las secciones 2 a 8 con su numeración original. Los apartados vacíos se indican como pendientes; las notas de trabajo se expresan como tareas sin inventar resultados, prioridades, presupuestos ni firmas.

El archivo `assets/documents/documentacion-original.txt` conserva el adjunto completo, sin cambios, y puede descargarse desde la página. La adaptación distingue el planteo inicial MQTT/XLS del funcionamiento local HTTP/CSV presentado en el sitio. Las hipótesis institucionales se atribuyen a los autores del borrador y las mejoras previstas no se presentan como implementadas.

Para actualizar esta página, editá sus secciones HTML y mantené sus identificadores `doc-*`, utilizados por el índice. Actualizá también el archivo de origen cuando recibas una nueva versión, conservando la trazabilidad de los cambios.
