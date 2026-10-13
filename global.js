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

  let pageLoadTl;

  function pageLoad() { }
  pageLoad();

  function currentPage() {
    const container = document.querySelector('[data-barba="container"]');
    const pageTitle = container?.getAttribute("page-name");
    const pageBreadcrumb = document.querySelector("[current-page]");

    if (!pageBreadcrumb || !pageTitle) return;

    pageBreadcrumb.textContent = pageTitle;
  }
  currentPage();

  function copyright() {
    const currentYear = new Date().getFullYear();
    document.querySelectorAll('[data="year"]').forEach((el) => {
      el.textContent = currentYear;
    });
  }
  copyright();

  function desktopAnimations() {
    mm.add("(min-width: 992px)", () => {

      function heroAnim() {
        const root = document.querySelector('.h-hero');
        if (!root) return;

        const pinHeight = root.querySelector('[data-pin-height]');
        const container = root.querySelector('.h-hero-wrapper');
        const mask = root.querySelector('.h-hero-mask');
        const heroImage = root.querySelector('.h-hero-image');

        const ratio = 16 / 9;
        const startH = () => container.clientHeight * 0.4;
        const endH = () => container.clientHeight;

        gsap.set(mask, { xPercent: -50, yPercent: -50 });

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: pinHeight,
            start: 'top top',
            end: 'bottom bottom',
            pin: container,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(mask,
          {
            height: () => startH(),
            width: () => startH() * ratio,
          },
          {
            height: () => endH(),
            width: () => endH() * ratio,
          }, 0)
          .fromTo(heroImage,
            { scale: 1.3, yPercent: 6 },
            { scale: 1, yPercent: 0 }, 0);
      }
      heroAnim();

    });
  }
  desktopAnimations();
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

/*
barba.hooks.beforeEnter((data) => {
  if (!data.current.container) navTheme(data.next.container);
});
*/

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
        /*navTheme(data.next.container);*/
      },

      enter(data) {
        gsap.set(data.next.container, { visibility: "visible" });
      },
    },
  ],
});