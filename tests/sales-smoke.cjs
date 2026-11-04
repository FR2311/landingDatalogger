/* QA local: no modifica el firmware ni consulta servicios externos. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { pathToFileURL } = require("node:url");
const puppeteer = require("puppeteer");
const root = path.resolve(__dirname, "..");
const previews = path.join(__dirname, "previews");
const pages = ["index", "interfaz", "quick-start", "manual", "documentacion", "documento-proyecto", "faq"];
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"application/javascript; charset=utf-8", ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".ttf":"font/ttf", ".txt":"text/plain; charset=utf-8" };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (pathname === "/favicon.ico") { res.writeHead(204); return res.end(); }
  const file = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
// Comprueba el producto visible, sin confundir el margen transparente con su silueta.
async function productBounds(page) {
  return page.evaluate(() => {
    const img = document.querySelector(".hero-device-image");
    const stage = img.parentElement;
    const frame = stage.getBoundingClientRect();
    if (!img.__inkBounds) {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d", {willReadFrequently:true});
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let left=canvas.width, right=0, top=canvas.height, bottom=0;
      for (let y=0; y<canvas.height; y++) for (let x=0; x<canvas.width; x++) {
        if (data[(y*canvas.width+x)*4+3] > 32) {
          left=Math.min(left,x); right=Math.max(right,x);
          top=Math.min(top,y); bottom=Math.max(bottom,y);
        }
      }
      img.__inkBounds = {left,right,top,bottom};
    }
    const ink = img.__inkBounds;
    const style = getComputedStyle(img);
    const matrix = new DOMMatrix(style.transform);
    const [ox,oy] = style.transformOrigin.split(" ").map(parseFloat);
    const width = img.offsetWidth, height = img.offsetHeight;
    const corners = [[ink.left,ink.top],[ink.right,ink.top],[ink.right,ink.bottom],[ink.left,ink.bottom]].map(([x,y]) => {
      const point = new DOMPoint(x/img.naturalWidth*width-ox, y/img.naturalHeight*height-oy).matrixTransform(matrix);
      return {x:frame.left+img.offsetLeft+ox+point.x, y:frame.top+img.offsetTop+oy+point.y};
    });
    const bounds = {left:Math.min(...corners.map(p=>p.x)),right:Math.max(...corners.map(p=>p.x)),top:Math.min(...corners.map(p=>p.y)),bottom:Math.max(...corners.map(p=>p.y))};
    const intro = document.querySelector(".hero-intro").getBoundingClientRect();
    return {bounds,frame:{left:frame.left,right:frame.right,top:frame.top,bottom:frame.bottom},
      fit:style.objectFit, angle:Math.atan2(matrix.b,matrix.a)*180/Math.PI,
      inside:bounds.left>=frame.left-2 && bounds.right<=frame.right+2 && bounds.top>=frame.top-2 && bounds.bottom<=frame.bottom+2,
      centered:Math.abs((bounds.left+bounds.right-frame.left-frame.right)/2)<frame.width*.08,
      collision:bounds.left<intro.right && bounds.right>intro.left && bounds.top<intro.bottom && bounds.bottom>intro.top,
      ratio:Math.abs(width/height-img.naturalWidth/img.naturalHeight)};
  });
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const failures = [];
let browser;
(async () => {
  fs.mkdirSync(previews, { recursive: true });
  try {
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const origin = "http://127.0.0.1:" + server.address().port;
    const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
    browser = await puppeteer.launch({ ...(fs.existsSync(chromePath) ? { executablePath: chromePath } : {}), headless: true });
    for (const name of pages) {
      const page = await browser.newPage();
      page.on("pageerror", error => failures.push(name + ": " + error.message));
      page.on("response", response => { if (response.status() >= 400 && response.url().startsWith(origin)) failures.push(name + ": " + response.status() + " " + response.url()); });
      for (const viewport of [{width:1440,height:1000,label:"desktop"},{width:768,height:1024,label:"tablet"},{width:390,height:844,label:"mobile"}]) {
        await page.setViewport(viewport);
        await page.goto(origin + "/" + name + ".html", { waitUntil:"networkidle0" });
        await page.evaluate(async () => {
          await document.fonts.ready;
          const images = [...document.images];
          images.forEach(image => image.loading = "eager");
          await Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => { image.onload = resolve; image.onerror = resolve; })));
          document.querySelectorAll(".is-pending").forEach(el => el.classList.remove("is-pending"));
        });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, name + ": sin desbordes en " + viewport.label);
        assert.equal(await page.$eval(".site-header .brand", el => el.textContent.trim()), "Datalogger");
        assert.equal(await page.$$eval("#main-nav > a", links => links.map(a => a.textContent).join(",")), "Producto,Beneficios,Paneles,Equipo,Quick Start");
        assert.equal(await page.$eval('#main-nav a[href="quick-start.html"]', link => link.textContent.trim()), "Quick Start", "Quick Start visible en navegación principal");
        const projectDocs = await page.$$eval(".sales-footer a", links => links.filter(link => link.textContent.trim() === "Documentación del proyecto").map(link => ({href:link.href,target:link.target,rel:link.rel})));
        assert.equal(projectDocs.length, 1, name + ": acceso a documentación del proyecto");
        assert.equal(projectDocs[0].href, "https://claude.ai/artifact/FUM1c3DuGiFqgQw5Yv4ygL", name + ": URL de documentación actualizada");
        assert.equal(projectDocs[0].target, "_blank");
        const repositoryLinks = await page.$$eval('a[href^="https://github.com/proyectofinal7ano-spec/"]', links => links.map(link => ({href:link.href,target:link.target,rel:link.rel})));
        assert.ok(repositoryLinks.length > 0, name + ": enlace al repositorio presente");
        assert.ok(repositoryLinks.every(link => link.href === "https://github.com/proyectofinal7ano-spec/Datalogger-INTI-Code" && link.target === "_blank" && link.rel.includes("noopener")), name + ": repositorio correcto en todos los enlaces del proyecto");
        assert.ok(projectDocs[0].rel.includes("noopener") && projectDocs[0].rel.includes("noreferrer"));
        if (name === "documentacion") {
          assert.equal(await page.$$(".resource-card").then(cards => cards.length), 2, "Documentación: tarjeta Desarrollo abierto eliminada");
          assert.ok(await page.$$eval(".resource-card h3", titles => titles.every(title => !title.textContent.includes("Desarrollo abierto"))));
          assert.equal(await page.$eval(".resource-featured .button-primary", link => link.href), "https://claude.ai/artifact/FUM1c3DuGiFqgQw5Yv4ygL");
          if (viewport.label === "desktop") await page.screenshot({path:path.join(previews,"documentacion-desktop.png"),fullPage:true});
        }
        assert.deepEqual(await page.$$eval("img", imgs => imgs.filter(img => !img.complete || !img.naturalWidth).map(img => img.src)), [], name + ": imágenes disponibles");
        const links = await page.$$eval("a[href]", anchors => anchors.map(anchor => anchor.href));
        for (const href of links) {
          const url = new URL(href);
          if (url.origin !== origin) continue;
          const file = path.join(root, decodeURIComponent(url.pathname));
          assert.ok(fs.existsSync(file), name + ": archivo enlazado " + url.pathname);
          if (url.hash && path.extname(file) === ".html") {
            const source = fs.readFileSync(file, "utf8");
            const id = decodeURIComponent(url.hash.slice(1));
            assert.ok(source.includes('id="' + id + '"') || source.includes("id='" + id + "'"), name + ": ancla " + url.hash + " en " + url.pathname);
          }
        }
        if (viewport.width === 390) {
          await page.click(".menu-toggle");
          assert.equal(await page.$eval(".menu-toggle", el => el.getAttribute("aria-expanded")), "true");
          assert.ok(await page.$eval('#main-nav a[href="quick-start.html"]', link => link.getBoundingClientRect().height > 0), "Quick Start accesible en el menú móvil");
          await page.keyboard.press("Escape");
          assert.equal(await page.$eval(".menu-toggle", el => el.getAttribute("aria-expanded")), "false");
        }
        if (name === "index" || name === "interfaz") {
          if (name === "index") {
            assert.ok(await page.$eval(".hero-device-image", img => img.src.endsWith("datalogger-real-cutout.png") && img.naturalWidth > 0), "Hero: recorte transparente basado en la fotografía real");
            assert.ok(await page.$eval(".hero-device", figure => {
              const style = getComputedStyle(figure);
              return style.backgroundColor === "rgba(0, 0, 0, 0)" && parseFloat(style.borderTopWidth) === 0 && parseFloat(style.paddingTop) === 0;
            }), "Hero: producto sin tarjeta, fondo blanco ni bordes");
            assert.equal(await page.$eval(".hero-photo-link", link => getComputedStyle(link).backgroundColor), "rgba(0, 0, 0, 0)", "Hero: imagen integrada al fondo");
            assert.equal(await page.$(".hero-panel-preview"), null, "Hero: sin miniaturas que tapen el producto");
            const framing = await productBounds(page);
            assert.ok(Math.abs(framing.angle) < 1, "Hero: producto vertical, sin inclinación");
            assert.equal(framing.fit, "contain", "Hero: mantiene las proporciones de la imagen");
            assert.ok(framing.inside && framing.centered && framing.ratio < .01 && !framing.collision, "Hero: producto visible completo, centrado y sin tapar el texto: " + JSON.stringify(framing));
            assert.equal(await page.$$eval(".data-snapshot img", imgs => imgs.filter(img => img.getBoundingClientRect().width > 0 && img.naturalWidth > 0).length), 3, "Tres capturas de datos visibles sin pestañas");
            assert.ok(await page.$$eval(".snapshot-image", links => links.every(link => {
              const box = link.getBoundingClientRect(), img = link.querySelector("img"), rect = img.getBoundingClientRect();
              return rect.left >= box.left && rect.right <= box.right + 1 && rect.top >= box.top && rect.bottom <= box.bottom + 1 && Math.abs(rect.width / rect.height - img.naturalWidth / img.naturalHeight) < .01;
            })), "Capturas: proporciones originales y sin recortes");
            await page.click(".hero-photo-link");
            await page.waitForFunction(() => {
              const dialog = document.querySelector(".image-viewer");
              const img = dialog.querySelector("img");
              return dialog.open && img && img.complete && img.naturalWidth > 0;
            });
            assert.ok(await page.$eval(".viewer-stage img", img => img.src.endsWith("dataloggerReal.webp")), "Visor: abre el archivo real");
            await page.click("[data-viewer-zoom]");
            assert.equal(await page.$eval("[data-viewer-zoom]", button => button.getAttribute("aria-pressed")), "true", "Visor: tamaño original");
            await page.click("[data-viewer-zoom]");
            await page.keyboard.press("Escape");
            assert.equal(await page.$eval(".image-viewer", dialog => dialog.open), false, "Visor: Escape cierra");
            assert.ok(await page.evaluate(() => document.activeElement.classList.contains("hero-photo-link")), "Visor: devuelve el foco");
            if (viewport.width > 900) {
              const team = await page.$$eval(".sales-member", nodes => nodes.map(node => ({top:node.getBoundingClientRect().top, avatar:node.querySelector("img").getBoundingClientRect().width})));
              assert.ok(team.every(member => Math.abs(member.top - team[0].top) < 2), "Equipo: cinco integrantes en una fila");
              assert.ok(team.every(member => member.avatar <= 80), "Equipo: fotografías compactas");
            }
          }
          assert.equal(await page.$$eval('[role="tab"]', tabs => tabs.length), 5);
          for (let i = 0; i < 5; i++) {
            const tab = (await page.$$('[role="tab"]'))[i];
            await tab.click();
            assert.equal(await tab.evaluate(el => el.getAttribute("aria-selected")), "true");
            assert.equal(await page.$$eval('[role="tabpanel"]:not([hidden])', panels => panels.length), 1);
          }
          await page.focus('[role="tab"][aria-selected="true"]');
          await page.keyboard.press("Home");
          await page.keyboard.press("ArrowRight");
          assert.ok(await page.$eval('[role="tab"][aria-selected="true"]', el => el.textContent.includes("Temperatura")));
          await page.keyboard.press("End");
          assert.ok(await page.$eval('[role="tab"][aria-selected="true"]', el => el.textContent.includes("Historial")));
          await page.keyboard.press("Home");
          await page.evaluate(() => scrollTo({ top:0, behavior:"instant" }));
          await delay(120);
          await page.screenshot({ path:path.join(previews, name + "-" + viewport.label + ".png"), fullPage:true });
        }
        console.log(name + ": " + viewport.label + " OK");
      }
      if (name === "index") {
        await page.setViewport({ width:1440,height:1000 });
        await page.goto(origin + "/index.html", {waitUntil:"networkidle0"});
        await page.evaluate(async () => {
          await document.fonts.ready;
          document.querySelectorAll("img").forEach(img => img.loading = "eager");
          await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
        });
        assert.equal(await page.$("#hardware"), null);
        assert.equal(await page.$("#arquitectura"), null);
        assert.equal(await page.$$(".sales-member").then(items => items.length), 5);
        assert.ok((await page.$eval(".endorsement", el => el.textContent)).includes("Certificado por el director"));
        await page.screenshot({path:path.join(previews,"portada-desktop.png")});
        await page.click(".hero-photo-link");
        await page.waitForFunction(() => document.querySelector(".viewer-stage img")?.complete);
        await page.screenshot({path:path.join(previews,"visor-fotografia.png")});
        await page.keyboard.press("Escape");
        const hideFixed = await page.addStyleTag({content: ".site-header, .back-to-top { visibility: hidden !important; }"});
        await (await page.$("#inicio")).screenshot({path:path.join(previews,"hero-completo.png")});
        await page.$eval("#equipo", el => el.scrollIntoView({behavior:"instant"}));
        await delay(100);
        await (await page.$("#equipo")).screenshot({path:path.join(previews,"equipo-desktop.png")});
        await (await page.$(".data-snapshots")).screenshot({path:path.join(previews,"tres-capturas.png")});
        await page.$eval("#paneles", el => el.scrollIntoView({behavior:"instant"}));
        await page.click('[aria-controls="panel-temperatura"]');
        await delay(100);
        await (await page.$("#paneles")).screenshot({path:path.join(previews,"paneles-temperatura.png")});
        await hideFixed.evaluate(node => node.remove());
        for (const extra of [{width:1024,height:768},{width:1440,height:800},{width:1920,height:1080},{width:360,height:780}]) {
          await page.setViewport(extra);
          await page.evaluate(() => scrollTo({top:0,behavior:"instant"}));
          assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Encuadre adicional: " + extra.width);
          const layout = await productBounds(page);
          assert.ok(layout.inside && !layout.collision, "Hero adicional sin recortes: " + extra.width + " " + JSON.stringify(layout));
          if (extra.width > 900) assert.ok(layout.bounds.bottom <= extra.height, "Producto completo en el primer pantallazo: " + extra.width + "×" + extra.height);
          if (extra.width === 1440) await page.screenshot({path:path.join(previews,"hero-1440x800.png")});
        }
        await page.setViewport({width:1440,height:1000});
        const ratios = await page.evaluate(() => {
          const luminance = hex => {
            const rgb = hex.match(/\w\w/g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
            return rgb[0]*.2126 + rgb[1]*.7152 + rgb[2]*.0722;
          };
          const ratio = (a,b) => { const l1 = luminance(a), l2 = luminance(b); return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05); };
          return [ratio("0b3181","ffffff"),ratio("455b77","f1f5fc"),ratio("e0eaff","0b3181")];
        });
        assert.ok(ratios.every(ratio => ratio >= 4.5), "Contraste de las combinaciones principales");
        console.log("Contraste principal: " + ratios.map(value => value.toFixed(2)).join(", "));
      }
      await page.close();
    }
    const noJS = await browser.newPage();
    await noJS.setJavaScriptEnabled(false);
    await noJS.goto(origin + "/index.html", {waitUntil:"networkidle0"});
    assert.equal(await noJS.$$eval(".gallery-panel", nodes => nodes.filter(el => getComputedStyle(el).display !== "none").length), 5, "Galería sin JavaScript");
    await noJS.close();
    const filePage = await browser.newPage();
    filePage.on("pageerror", error => failures.push("file:// " + error.message));
    await filePage.goto(pathToFileURL(path.join(root,"index.html")).href, {waitUntil:"load"});
    assert.equal(await filePage.$$eval('[role="tab"]', tabs => tabs.length), 5, "Apertura directa sin servidor");
    await filePage.close();
    assert.deepEqual(failures, [], "Sin errores JavaScript ni recursos faltantes");
    console.log("QA COMPLETA: 7 páginas, 3 tamaños, enlaces, galería, teclado, contraste, sin JS y file://.");
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
