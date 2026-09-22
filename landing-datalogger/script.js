/* Mejora progresiva: enlaces, documentación y FAQ funcionan sin JavaScript. */
(() => {
  "use strict";

  document.body.classList.add("js");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#main-nav");
  const mobileViewport = window.matchMedia("(max-width: 1250px)");
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
