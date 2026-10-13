//Studio Alexander
gsap.registerPlugin(ScrollTrigger, SplitText);
let mm = gsap.matchMedia();
let lenis;
let resizeObserver = null;

function globalInit() {
  lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  document.querySelectorAll("[data-lenis-start]").forEach((el) => {
    const handler = () => lenis.start();
    el.addEventListener("click", handler);
  });

  document.querySelectorAll("[data-lenis-stop]").forEach((el) => {
    const handler = () => lenis.stop();
    el.addEventListener("click", handler);
  });
}

function pageInit() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  mm.revert();
}

function initResizeObserver() {
  if (resizeObserver) return;

  resizeObserver = new ResizeObserver(() => {
    ScrollTrigger.refresh();
    lenis?.resize?.();
  });

  resizeObserver.observe(document.body);
}

function destroyResizeObserver() {
  if (!resizeObserver) return;
  resizeObserver.disconnect();
  resizeObserver = null;
}

function init() {
  globalInit();
  pageInit();
  initResizeObserver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

barba.hooks.beforeEnter((data) => {
});

barba.hooks.beforeLeave(() => {
  destroyResizeObserver();
});

barba.hooks.afterEnter((data) => {
  //window.FinsweetAttributes.modules.list.restart();
});

barba.hooks.after((data) => {
  window.scrollTo(0, 0);
  pageInit();
  lenis.start();
  initResizeObserver();
});

barba.init({
  preventRunning: true,
  transitions: [
    {
      name: "default-transition",

      leave(data) { },

      afterLeave(data) {
        gsap.set(data.current.container, { visibility: "hidden" });
      },

      beforeEnter(data) {
        gsap.set(data.next.container, { visibility: "hidden" });
        navTheme(data.next.container);
      },

      enter(data) {
        gsap.set(data.next.container, { visibility: "visible" });
      },
    },
  ],
});
