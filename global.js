gsap.registerPlugin(ScrollTrigger, SplitText);
let mm = gsap.matchMedia();
let lenis;
let appStarted = false;
let barbaStarted = false;
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

function setupBarba() {
  if (barbaStarted) return;
  barbaStarted = true;

  barba.hooks.beforeEnter((data) => {
    if (!data.current.container) navTheme(data.next.container);
  });

  barba.hooks.beforeLeave(() => {
    destroyResizeObserver();
  });

  barba.hooks.after((data) => {
    // On first load, init() already ran pageInit()
    if (!data.current.container) return;

    window.scrollTo(0, 0);
    pageInit();
    lenis?.start?.();
    initResizeObserver();
  });

  barba.init({
    preventRunning: true,
    transitions: [
      {
        name: "default-transition",
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
}

function startApp() {
  if (appStarted) return;
  appStarted = true;

  init();        // globalInit/menu/pageInit/observer
  setupBarba();  // hooks + init in one place
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
  startApp();
}
