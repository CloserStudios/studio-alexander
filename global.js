gsap.registerPlugin(ScrollTrigger, SplitText, Observer);
let mm = gsap.matchMedia();
let lenis;
let resizeObserver = null;
const getNav = () => document.querySelector('nav');
const clipHidden = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
const clipShown = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
const getContainer = () => document.querySelector('[data-barba="container"]');

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

function navColour(container = getContainer()) {
  const isDark = container?.dataset.navTheme === "dark";
  const nav = getNav();
  if (nav) nav.classList.toggle("dark", isDark);
}

function menuAnimation() {
  const menu = document.querySelector(".menu");
  const menuBackground = document.querySelector(".menu-background");
  const menuWrapper = document.querySelector(".menu-wrapper");
  const menuButton = document.querySelector(".menu-button");
  const menuTextOpen = document.querySelector("[data-menu-open]");
  const menuTextClose = document.querySelector("[data-menu-close]");
  const menuTextAnimate = document.querySelectorAll("[data-text-animate]");
  const menuLinks = document.querySelectorAll(".menu-link");
  const navLogo = document.querySelector(".nav-logo");

  if (!menu || !menuWrapper || !menuButton || !menuBackground || !menuTextOpen || !menuTextClose || !menuTextAnimate) return;
  if (menuButton.dataset.bound) return;
  menuButton.dataset.bound = "true";

  gsap.set(menuTextOpen, { y: 0 });
  gsap.set(menuTextClose, { y: 12 });
  gsap.set(menuTextAnimate, { y: -50 });

  const tl = gsap.timeline({
    paused: true,
    reversed: true,
    defaults: { ease: "power2.inOut" },
  });

  tl
    .set(menu, { display: "flex" }, 0)
    .to(menuBackground, { opacity: 0.25, duration: 0.5 }, 0.1)
    .to(menuWrapper, { scale: 1, duration: 0.5 }, 0.15)
    .to(menuTextOpen, { y: -12, duration: 0.5 }, 0.15)
    .to(menuTextClose, { y: 0, duration: 0.5 }, 0.2)
    .to(menuTextAnimate, { y: 0, stagger: 0.1, }, 0.4);

  const toggle = () => {
    tl.reversed() ? tl.play() : tl.timeScale(1).reverse(0);
  };

  menuButton.addEventListener("click", toggle);
  menuBackground.addEventListener("click", toggle);
  menuLinks.forEach(link => link.addEventListener("click", toggle));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !tl.reversed()) tl.timeScale(1).reverse(0);
  });

  tl.eventCallback("onStart", () => {
    lenis?.stop?.();
    const container = document.querySelector('[data-barba="container"]');
    const baseDark = container?.dataset.navTheme === "dark";
    menuButton.classList.toggle("dark", baseDark);
    if (navLogo) navLogo.style.pointerEvents = "none";
  });

  tl.eventCallback("onReverseComplete", () => {
    lenis?.start?.();
    menuButton.classList.remove("dark");
    if (navLogo) navLogo.style.pointerEvents = "";
  });
}

function menuButtonHover() {
  const menuButton = document.querySelector(".menu-button");
  const menuLineTop = document.querySelector(".menu-line__top");
  const menuLineTopHover = document.querySelector(".menu-line__top.hover");
  const menuLineBottom = document.querySelector(".menu-line__bottom");
  const menuLineBottomHover = document.querySelector(".menu-line__bottom.hover");

  if (!menuButton || !menuLineTop || !menuLineTopHover || !menuLineBottom || !menuLineBottomHover) return;

  gsap.set([menuLineTopHover, menuLineBottomHover], { xPercent: -150 });

  const tl = gsap.timeline({
    paused: true,
    defaults: {
      ease: "power2.inOut",
    },
  });

  tl
    .to(menuLineTop, { duration: 0.2, xPercent: 150 }, 0)
    .to(menuLineTopHover, { duration: 0.3, xPercent: 0 }, 0.1)
    .to(menuLineBottom, { duration: 0.2, xPercent: 150 }, 0.15)
    .to(menuLineBottomHover, { duration: 0.3, xPercent: 0 }, 0.2);

  menuButton.addEventListener("mouseenter", () => tl.play());
  menuButton.addEventListener("mouseleave", () => tl.reverse());
}

function setGrid(container = getContainer()) {
  if (!document.querySelector('.work-list, .ap-list')) return;

  const getPreview = () => document.querySelector('[data-work-preview]');
  let previewVisible = false;
  let mediaZ = 1;

  function setView(view) {
    const isList = view === 'list';

    document.querySelectorAll('.work-list, .work-list-header').forEach(el => {
      el.classList.toggle('is-list', isList);
    });

    document.querySelectorAll('[data-view]').forEach(b => {
      b.classList.toggle('is-active', b.dataset.view === view);
    });

    if (!isList) clearPreview();
  }

  function clearPreview() {
    const preview = getPreview();
    previewVisible = false;
    if (preview) {
      gsap.killTweensOf(preview);
      preview.classList.remove('on');
      preview.replaceChildren();
    }
  }

  function getItemSrc(item) {
    return item.dataset.image || item.querySelector('.work-image')?.getAttribute('src');
  }

  function showPreview(preview) {
    if (previewVisible) return;
    previewVisible = true;

    preview.classList.add('on');
    gsap.killTweensOf(preview);
    gsap.fromTo(
      preview,
      { clipPath: clipHidden },
      { clipPath: clipShown, duration: 0.6, ease: 'expo.inOut' }
    );
  }

  function hidePreview() {
    const preview = getPreview();
    if (!preview || !previewVisible) return;
    previewVisible = false;

    gsap.killTweensOf(preview);
    gsap.to(preview, {
      clipPath: clipHidden,
      duration: 0.4,
      ease: 'expo.inOut',
      onComplete: () => {
        if (previewVisible) return;
        preview.classList.remove('on');
        preview.replaceChildren();
      },
    });
  }

  function createMedia(preview, src) {
    const top = preview.lastElementChild;
    if (top?.dataset.src === src) return;

    const div = document.createElement('div');
    div.dataset.src = src;
    const img = document.createElement('img');
    img.src = src;
    div.appendChild(img);
    preview.appendChild(div);

    gsap.set(div, { autoAlpha: 1, zIndex: ++mediaZ });

    while (preview.children.length > 2) preview.children[0].remove();
  }

  setView('grid');

  function arrowHover(item) {
    const arrow = item.querySelector('.arrow-svg');
    if (!arrow) return;

    gsap.killTweensOf(arrow);

    gsap.timeline()
      .to(arrow, { duration: 0.3, xPercent: 101, ease: 'power2.inOut' })
      .set(arrow, { xPercent: -101 })
      .to(arrow, { duration: 0.5, xPercent: 0, ease: 'power2.inOut' });
  }

  container.addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (btn) setView(btn.dataset.view);
  });

  container.addEventListener('mouseover', e => {
    const item = e.target.closest('.work-list.is-list .work-item, .ap-item');
    if (!item || item.contains(e.relatedTarget)) return;

    arrowHover(item);

    const preview = getPreview();
    const src = getItemSrc(item);
    if (!preview || !src) return;

    createMedia(preview, src);
    showPreview(preview);
  });

  container.addEventListener('mouseout', e => {
    const list = e.target.closest('.work-list.is-list, .ap-list');
    if (!list || list.contains(e.relatedTarget)) return;
    hidePreview();
  });
}

function pageInit() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  mm.revert();
  let pageLoadTl;
  setGrid();

  function splitAnimA() {
    const elements = gsap.utils.toArray("[data-split-a]");
    if (!elements.length) return;

    elements.forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            duration: 1.5,
            y: 50,
            autoAlpha: 0,
            stagger: 0.05,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        },
      });
    });
  }
  splitAnimA();

  function partnerAnim() {
    const partner = document.querySelector("[data-partner]");
    if (!partner) return;

    gsap.set(partner, { yPercent: 100 });

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: partner,
        start: "top 90%",
        toggleActions: "play none none reverse",
      },
    });

    tl.to(partner, { yPercent: 0, duration: 1, ease: "expo.out" });
  }
  partnerAnim();

  function paraEffect() {
    const paraWrappers = document.querySelectorAll("[data-para-wrap]");
    if (!paraWrappers.length) return;

    paraWrappers.forEach((wrapper) => {
      const image = wrapper.querySelector("[data-para-image]");
      if (!image) return;

      gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          scrub: true,
          invalidateOnRefresh: true,
        },
        defaults: {
          ease: "none",
          force3D: true,
        }
      })
        .fromTo(image, { backgroundPosition: "50% 100%" }, { backgroundPosition: "50% 0%", duration: 1 });
    });
  }
  paraEffect();

  function currentPage() {
    const pageTitle = document.querySelector('[data-barba="container"]').getAttribute("data-page");
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

  function homePreLoader() {
    const loader = document.querySelector(".preload-wrapper");
    if (!loader) return;
    const loaderLogo = document.querySelector(".preloader-logo-svg");
    const loaderInnerBg = document.querySelector(".preload-inner-bg");
    const loaderInnerImg = document.querySelector(".preload-inner-img");
    const counterEl = document.querySelector("[data-counter]");
    const loading = document.querySelector("[data-loading]");
    const connectingLine = document.querySelector("[data-connecting-line]");
    const number = document.querySelectorAll("[data-number]");

    const counter = { value: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onStart: () => {
        lenis.stop();
        loader.style.visibility = "visible";
      },
      onComplete: () => {
        loader.remove();
        sessionStorage.setItem("visited", "true");
        document.documentElement.classList.remove("show-preloader");
        lenis.start();
        pageLoadTl.play();
      },
    });

    gsap.set(loaderLogo, { autoAlpha: 0 });
    gsap.set(loading, { autoAlpha: 1, y: 12 });
    gsap.set(connectingLine, { autoAlpha: 1, xPercent: -150 });
    gsap.set(number, { autoAlpha: 1, y: 12 });


    tl.to(loading, { y: 0, }, 0.25);

    tl.to(connectingLine, { xPercent: 0, }, 0.45);

    tl.to(number, { y: 0, }, 0.65);

    tl.to(
      counter,
      {
        value: 100,
        ease: "none",
        duration: 3.5,
        onUpdate: () => {
          counterEl.textContent = Math.round(counter.value);
        },
      },
      1
    );

    tl.to(loaderInnerImg, { clipPath: clipShown, duration: 1.5, }, 0.5);

    tl.fromTo(
      loaderLogo,
      { autoAlpha: 0, filter: "blur(10px)" },
      { autoAlpha: 1, filter: "blur(0px)", duration: 2, },
      1
    );

    tl.to(loaderLogo, { autoAlpha: 0, duration: 1 }, 3);

    tl.fromTo(
      loaderInnerBg,
      { clipPath: "inset(30% 30% 30% 30%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1 },
      3
    );

    tl.to(loaderInnerImg, { scale: 1, duration: 1 }, 4);

    tl.to(loader, { opacity: 0 }, ">");
  }

  function defaultPreLoader() {
    const loader = document.querySelector(".preload-wrapper");
    if (!loader) return;
    const loaderLogoWrap = document.querySelector(".preloader-logo-svg");
    const loaderLogo = document.querySelectorAll(".preloader-logo-svg path");
    const loaderInnerBg = document.querySelector(".preload-inner-bg");
    const loaderInnerImg = document.querySelector(".preload-inner-img");
    const counterEl = document.querySelector("[data-counter]");
    const loading = document.querySelector("[data-loading]");
    const connectingLine = document.querySelector("[data-connecting-line]");
    const number = document.querySelectorAll("[data-number]");

    const counter = { value: 0 };

    const tl = gsap.timeline({
      defaults: { ease: "expo.inOut" },
      onStart: () => {
        lenis.stop();
        loader.style.visibility = "visible";
      },
      onComplete: () => {
        loader.remove();
        sessionStorage.setItem("visited", "true");
        document.documentElement.classList.remove("show-preloader");
        lenis.start();
        pageLoadTl.play();
      },
    });

    gsap.set(loaderLogo, { autoAlpha: 0, scale: 0.5 });
    gsap.set(loaderLogoWrap, { autoAlpha: 1 });
    gsap.set(loading, { y: 12 });
    gsap.set(connectingLine, { xPercent: -150 });
    gsap.set(number, { y: 12 });

    // Counter: part of the timeline, starts at 0
    tl.to(
      loading,
      {
        y: 0,
      },
      0.25
    );

    tl.to(
      connectingLine,
      {
        xPercent: 0,
      },
      0.45
    );

    tl.to(
      number,
      {
        y: 0,
      },
      0.65
    );

    tl.to(
      counter,
      {
        value: 100,
        ease: "none",
        duration: 3.5,
        onUpdate: () => {
          counterEl.textContent = Math.round(counter.value);
        },
      },
      1
    );

    tl.to(
      loaderInnerImg,
      {
        clipPath: clipShown,
        duration: 1.5,
      },
      0.5
    );

    tl.to(
      loaderLogo,
      { autoAlpha: 1, scale: 1, transformOrigin: "center center", stagger: 0.05, duration: 2, },
      0.5
    );

    tl.to(loaderLogo, { autoAlpha: 0, duration: 1 }, 3);

    tl.fromTo(
      loaderInnerBg,
      { clipPath: "inset(30% 30% 30% 30%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1 },
      4
    );

    tl.to(loaderInnerImg, { scale: 1, duration: 1 }, 4);

    tl.to(loader, { opacity: 0 }, ">");
  }

  function preLoader() {
    const isHome = document.querySelector('[data-page="home"]') !== null;

    if (isHome) {
      homePreLoader();
    } else {
      defaultPreLoader();
    }
  }

  function pageLoad() {
    pageLoadTl = gsap.timeline({ paused: true });

    const heroText = gsap.utils.toArray("[data-hero-text]");
    if (!heroText.length) return;
    const heroImage = document.querySelector("[data-hero-image]");
    const elementLoad = gsap.utils.toArray("[data-element-load]");
    const workOverlay = document.querySelector("[data-work-overlay]");

    heroText.forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) => {
          gsap.set(el, { visibility: "visible" });
          gsap.set(self.lines, { yPercent: 100, autoAlpha: 0 });

          pageLoadTl.to(
            self.lines,
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1,
              stagger: 0.05,
              ease: "expo.out",
            },
            0.5
          );
        },
      });
    });

    if (heroImage) {
      pageLoadTl.fromTo(heroImage,
        {
          clipPath: "inset(100% 50% 0% 50%)"
        },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 2,
          ease: "expo.inOut"
        }, 0.5)
    }

    if (elementLoad.length) {
      pageLoadTl.from(elementLoad, {
        yPercent: 100,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.05,
        ease: "expo.out"
      }, 0.5);
    }

    if (workOverlay) {
      pageLoadTl.from(workOverlay, {
        autoAlpha: 1,
        duration: 2,
        ease: "expo.out"
      }, 0.5);
    }
  }
  pageLoad();

  function checkPreloader() {
    if (!sessionStorage.getItem("visited")) {
      preLoader();
    } else {
      document.documentElement.classList.remove("show-preloader");
      pageLoadTl.play();
    }
  }
  checkPreloader();

  function navColourChange() {
    const nav = getNav();
    const navTrigger = document.querySelector("[data-nav-trigger]");
    if (!nav || !navTrigger) return;

    const baseDark = document.querySelector('[data-barba="container"]').dataset.navTheme === "dark";

    ScrollTrigger.create({
      trigger: navTrigger,
      start: "top top",
      end: "bottom top",
      onToggle: (self) => nav.classList.toggle("dark", self.isActive ? !baseDark : baseDark),
    });
  }
  navColourChange();

  function projectAnim() {
    let total = 0,
      xTo,
      itemValues = []

    const content = document.querySelector('.h-featured-bottom')
    const cards = document.querySelectorAll('.f-work-item')
    if (!content || !cards.length) return;
    const cardsLength = cards.length / 2
    const half = content.clientWidth / 2

    const wrap = gsap.utils.wrap(-half, 0);

    xTo = gsap.quickTo(content, "x", {
      duration: 0.5,
      ease: 'power3',
      modifiers: {
        x: gsap.utils.unitize(wrap),
      },
    });

    for (let i = 0; i < cardsLength; i++) {
      itemValues.push((Math.random() - 0.5) * 20);
    }

    const tl = gsap.timeline({ paused: true });
    tl.to(cards, {
      scale: 0.95,
      duration: 0.5,
      ease: 'expo.inOut',
    })

    Observer.create({
      target: content,
      type: "pointer,touch",
      dragMinimum: 10,
      onPress: () => {
        tl.play();
      },
      onDragStart: () => {
        content.classList.add('is-dragging');
      },
      onDrag: (self) => {
        total += self.deltaX;
        xTo(total);
      },
      onRelease: () => {
        content.classList.remove('is-dragging');
        tl.reverse();
      },
      onStop: () => {
        content.classList.remove('is-dragging');
        tl.reverse();
      }
    });

    gsap.ticker.add(tick);

    function tick(time, deltaTime) {
      total -= deltaTime / 7.5  // Adjust the speed of automatic scrolling    
      xTo(total)
    }

  }
  projectAnim();

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
    navColour();
    initResizeObserver();
    menuButtonHover();
    menuAnimation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  barba.hooks.beforeEnter((data) => {
    navColour(data.next.container);
  });

  barba.hooks.beforeLeave(() => {
    destroyResizeObserver();
  });

  barba.hooks.afterEnter((data) => {
    window.FinsweetAttributes.modules.list.restart();
  });

  barba.hooks.after((data) => {
    window.scrollTo(0, 0);
    pageInit(data.next.container);
    lenis.start();
    initResizeObserver();
  });

  barba.init({
    preventRunning: true,
    transitions: [
      {
        name: "default-transition",

        leave(data) {
          let tl = gsap.timeline({
            defaults: {
              ease: "expo.out",
            },
          });

          tl.to(
            ".content-overlay",
            {
              opacity: 1,
              duration: 1,
            },
            0
          );

          return tl;
        },

        afterLeave(data) {
          gsap.set(data.current.container, { visibility: "hidden" });
        },

        beforeEnter(data) {
          gsap.set(data.next.container, { visibility: "hidden" });
          navColour(data.next.container);
        },

        enter(data) {
          gsap.set(data.next.container, { visibility: "visible" });
        },
      },
    ],
  });


