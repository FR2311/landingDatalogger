/* Mejora progresiva: enlaces, documentación y FAQ funcionan sin JavaScript. */
(() => {
  "use strict";

  document.body.classList.add("js");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#main-nav");
  const mobileViewport = window.matchMedia("(max-width: 900px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const topLink = document.querySelector(".back-to-top");

  const setMenu = (open) => {
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    navigation.classList.toggle("is-open", open);
  };

  menuButton.addEventListener("click", () => {
    setMenu(menuButton.getAttribute("aria-expanded") !== "true");
  });

  // Los enlaces conservan su comportamiento nativo y el scroll suave se define en CSS.
  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    setMenu(false);
    if (mobileViewport.matches) {
      const samePage =
        link.origin === window.location.origin &&
        link.pathname === window.location.pathname;
      const target =
        samePage && link.hash && document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true },
        );
      } else {
        menuButton.focus({ preventScroll: true });
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuButton.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      menuButton.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav-wrap")) setMenu(false);
  });
  navigation.addEventListener("focusout", () => {
    requestAnimationFrame(() => {
      if (
        !navigation.contains(document.activeElement) &&
        document.activeElement !== menuButton
      )
        setMenu(false);
    });
  });
  mobileViewport.addEventListener("change", () => setMenu(false));

  // Acordeón nativo accesible: solo una respuesta abierta a la vez.
  const questions = [...document.querySelectorAll(".faq-list details")];
  questions.forEach((question) => {
    question.addEventListener("toggle", () => {
      if (question.open)
        questions.forEach((other) => {
          if (other !== question) other.open = false;
        });
    });
  });

  const updateTopLink = () => {
    // Evitar ocultar el enlace mientras mantiene el foco de teclado.
    topLink.hidden = window.scrollY < 500 && document.activeElement !== topLink;
  };
  window.addEventListener("scroll", updateTopLink, { passive: true });
  topLink.addEventListener("blur", updateTopLink);
  updateTopLink();


  // Galería con mejora progresiva: sin JavaScript se conservan las cinco vistas.
  document.querySelectorAll("[data-gallery]").forEach((gallery, galleryIndex) => {
    const tablist = gallery.querySelector(".gallery-tabs");
    const tabs = [...tablist.querySelectorAll(".gallery-tab")];
    const panels = tabs.map(tab => document.getElementById(tab.hash.slice(1)));
    if (!tabs.length || panels.some(panel => !panel)) return;

    tablist.setAttribute("role", "tablist");
    const select = (index, focus = false) => {
      tabs.forEach((tab, current) => {
        const active = current === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle("is-active", active);
        panels[current].hidden = !active;
      });
      if (focus) tabs[index].focus({ preventScroll: true });
    };
    tabs.forEach((tab, index) => {
      tab.id = `gallery-${galleryIndex}-tab-${index}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", panels[index].id);
      panels[index].setAttribute("role", "tabpanel");
      panels[index].setAttribute("aria-labelledby", tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener("click", event => {
        event.preventDefault();
        select(index);
        try { history.replaceState(null, "", tab.hash); } catch { /* file:// conserva la navegación local. */ }
      });
      tab.addEventListener("keydown", event => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (event.key === " ") next = index;
        if (next === undefined) return;
        event.preventDefault();
        select(next, true);
      });
    });
    const selectHash = () => {
      const selected = tabs.findIndex(tab => tab.hash === location.hash);
      if (selected >= 0) select(selected);
    };
    const initial = tabs.findIndex(tab => tab.hash === location.hash);
    select(initial >= 0 ? initial : 0);
    window.addEventListener("hashchange", selectHash);
  });
  // Ampliación local: se usa el original, sin rehacer letras ni mediciones.
  if (document.body.classList.contains("sales-page") && typeof HTMLDialogElement !== "undefined") {
    const viewer = document.createElement("dialog");
    viewer.className = "image-viewer";
    viewer.setAttribute("aria-labelledby", "viewer-title");
    viewer.innerHTML = `<header class="viewer-topbar"><h2 id="viewer-title">Imagen del producto</h2><button class="viewer-close" type="button" aria-label="Cerrar imagen">×</button></header><div class="viewer-stage"></div><footer class="viewer-actions"><button type="button" data-viewer-zoom aria-pressed="false">Ver tamaño original</button><span data-viewer-info>Archivo original</span><a data-viewer-original target="_blank" rel="noopener noreferrer">Abrir original ↗</a></footer>`;
    document.body.append(viewer);
    const stage = viewer.querySelector(".viewer-stage");
    const zoom = viewer.querySelector("[data-viewer-zoom]");
    const info = viewer.querySelector("[data-viewer-info]");
    const original = viewer.querySelector("[data-viewer-original]");
    let image;
    let returnFocus;
    const resetZoom = () => {
      stage.classList.remove("is-native");
      zoom.setAttribute("aria-pressed", "false");
      zoom.textContent = "Ver tamaño original";
      stage.scrollTo(0, 0);
    };
    viewer.querySelector(".viewer-close").addEventListener("click", () => viewer.close());
    zoom.addEventListener("click", () => {
      const nativeSize = stage.classList.toggle("is-native");
      zoom.setAttribute("aria-pressed", String(nativeSize));
      zoom.textContent = nativeSize ? "Ajustar a pantalla" : "Ver tamaño original";
      stage.scrollTo(0, 0);
    });
    viewer.addEventListener("close", () => {
      document.body.classList.remove("has-image-viewer");
      resetZoom();
      returnFocus?.focus({ preventScroll: true });
    });
    viewer.addEventListener("click", event => {
      const rect = viewer.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
    });
    document.addEventListener("click", event => {
      const link = event.target.closest("a[href]");
      if (!link || link.closest(".image-viewer") || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
      const url = new URL(link.href, location.href);
      if (!/\/assets\/images\/[^/]+\.(?:png|jpe?g|webp)$/i.test(url.pathname)) return;
      event.preventDefault();
      if (!image) {
        image = document.createElement("img");
        stage.append(image);
      }
      const source = link.querySelector("img") || link.closest("article,figure")?.querySelector("img");
      const title = source?.alt || "Imagen de Datalogger";
      viewer.querySelector("#viewer-title").textContent = title;
      image.alt = title;
      info.textContent = "Cargando archivo original…";
      zoom.disabled = true;
      image.onload = () => {
        info.textContent = image.naturalWidth + " × " + image.naturalHeight + " px · Archivo original";
        zoom.disabled = false;
      };
      image.onerror = () => { info.textContent = "No se pudo abrir la imagen. Usá el enlace al original."; };
      image.src = url.href;
      original.href = url.href;
      resetZoom();
      returnFocus = link;
      viewer.showModal();
      document.body.classList.add("has-image-viewer");
    });
  }
  if ("IntersectionObserver" in window) {
    const animatedElements = document.querySelectorAll(".reveal");
    if (!reducedMotion.matches) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("is-pending");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 },
      );
      animatedElements.forEach((element) => {
        element.classList.add("is-pending");
        revealObserver.observe(element);
      });
      reducedMotion.addEventListener("change", (event) => {
        if (event.matches) {
          revealObserver.disconnect();
          animatedElements.forEach((element) =>
            element.classList.remove("is-pending"),
          );
        }
      });
    }

    // Resalta la sección visible en la navegación principal.
    const sectionLinks = [...navigation.querySelectorAll('a[href^="#"]')];
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          sectionLinks.forEach((link) => {
            if (link.hash === `#${entry.target.id}`)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
    );
    sectionLinks.forEach((link) => {
      const section = document.getElementById(link.hash.slice(1));
      if (section) sectionObserver.observe(section);
    });
  }
})();
