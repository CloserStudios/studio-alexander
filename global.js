gsap.registerPlugin(ScrollTrigger, SplitText);
let mm = gsap.matchMedia();
let lenis;
let resizeObserver = null;
const getNav = () => document.querySelector('nav');
const getPreview = () => document.querySelector('[data-work-preview]');
const CLIP_HIDDEN = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
const CLIP_SHOWN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

/*Grid to list*/
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

/*List hover start*/
function clearPreview() {
  const preview = getPreview();
  preview?.classList.remove('on');
  preview?.replaceChildren();
}

function getItemSrc(item) {
  return item.dataset.image || item.querySelector('.work-image')?.getAttribute('src');
}

function createMedia(preview, src) {
  const div = document.createElement('div');
  const img = document.createElement('img');
  img.src = src;
  div.appendChild(img);
  preview.appendChild(div);

  gsap.fromTo(div,
    { clipPath: CLIP_HIDDEN },
    { clipPath: CLIP_SHOWN, duration: 0.6, ease: 'expo.inOut' }
  );

  while (preview.children.length > 3) preview.children[0].remove();
}

function arrowHover(item) {
  const arrow = item.querySelector('.arrow-svg');
  if (!arrow) return;

  gsap.killTweensOf(arrow);

  gsap.timeline()
    .to(arrow, { duration: 0.3, xPercent: 101, ease: 'power2.inOut' })
    .set(arrow, { xPercent: -101 })
    .to(arrow, { duration: 0.5, xPercent: 0, ease: 'power2.inOut' });
}

function initListListeners() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (btn) setView(btn.dataset.view);
  });

  document.addEventListener('mouseover', e => {
    const item = e.target.closest('.work-list.is-list .work-item');
    if (!item || item.contains(e.relatedTarget)) return;

    arrowHover(item);

    const preview = getPreview();
    const src = getItemSrc(item);
    if (!preview || !src) return;

    preview.classList.add('on');
    createMedia(preview, src);

  });

  document.addEventListener('mouseout', e => {
    const list = e.target.closest('.work-list.is-list');
    if (!list || list.contains(e.relatedTarget)) return;
    clearPreview();
  });
}
/*List hover end*/

function navTheme(container) {
  const nav = getNav();
  if (!nav || !container) return;

  const title = container.getAttribute("page-name");

  if (title) {
    const navTitle = nav.querySelector(".nav__title");
    if (navTitle) navTitle.textContent = title;
  }

  nav.classList.toggle("dark", container.dataset.navTheme === "dark");
}

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

function menuAnimation() {
  const menu = document.querySelector(".menu");
  const menuBackground = document.querySelector(".menu-background");
  const menuWrapper = document.querySelector(".menu-wrapper");
  const menuButton = document.querySelector(".menu-button");
  const menuTextOpen = document.querySelector("[data-menu-open]");
  const menuTextClose = document.querySelector("[data-menu-close]");
  const menuTextAnimate = document.querySelectorAll("[data-text-animate]");
  const menuLinks = document.querySelectorAll(".menu-link");

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
    .to(menuBackground, { opacity: 0.5, duration: 0.5 }, 0.1)
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
  });

  tl.eventCallback("onReverseComplete", () => {
    lenis?.start?.();
    menuButton.classList.remove("dark");
  });
}

function pageInit() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  mm.revert();

  function preLoader() {
    const loader = document.querySelector('.preload-wrapper');
    const target = document.querySelector(".h-hero-mask");
    const loaderLogo = document.querySelector('.preloader-logo-svg');
    const loaderInnerBg = document.querySelector('.preload-inner-bg');
    const loaderInnerImg = document.querySelector('.preload-inner-img');
    let loaderDuration = 1.5;

    gsap.set(loaderInnerImg, { scale: 1.3, yPercent: 6, transformOrigin: '50% 50%' });
    gsap.set(loaderInnerBg, { scale: 0.3, x: 0, y: 0, transformOrigin: "50% 50%" });

    const getTargetState = () => {
      const t = target.getBoundingClientRect();
      const l = loaderInnerBg.getBoundingClientRect();
      return {
        scale: t.width / loaderInnerBg.offsetWidth,
        x: gsap.getProperty(loaderInnerBg, "x") + (t.left + t.width / 2) - (l.left + l.width / 2),
        y: gsap.getProperty(loaderInnerBg, "y") + (t.top + t.height / 2) - (l.top + l.height / 2),
      };
    };

    let preloaderTl = gsap.timeline({
      defaults: { duration: loaderDuration, ease: "power2.inOut" },
      onStart: () => {
        lenis.stop();
        loader.style.visibility = "visible";
      },
      onComplete: () => {
        lenis.start();
        sessionStorage.setItem("visited", "true");
        document.documentElement.classList.remove("show-preloader");
      },
    });

    preloaderTl.fromTo(loaderLogo, { opacity: 0 }, { delay: 0.5, opacity: 1 });

    preloaderTl.to(loaderInnerBg, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    });

    preloaderTl.to(
      loaderInnerBg,
      {
        scale: () => getTargetState().scale,
        x: () => getTargetState().x,
        y: () => getTargetState().y,
      },
      ">"
    );

    preloaderTl.to(loader, { opacity: 0 }, ">");
  }

  function checkPreloader() {
    if (!sessionStorage.getItem("visited")) {
      preLoader();
    } else {
      document.documentElement.classList.remove("show-preloader");
    }
  }
  checkPreloader();

  let pageLoadTl;

  function pageLoad() { }
  pageLoad();

  function navColourChange() {
    const nav = getNav();
    const navTrigger = document.querySelector("[data-nav-trigger]");
    const container = document.querySelector('[data-barba="container"]');
    if (!nav || !navTrigger || !container) return;

    const baseDark = container.dataset.navTheme === "dark";

    ScrollTrigger.create({
      trigger: navTrigger,
      start: "top top",
      end: "bottom top",
      onToggle: (self) => nav.classList.toggle("dark", self.isActive ? !baseDark : baseDark),
    });
  }
  navColourChange();

  /*
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
  */

  /*Home page*/
  function heroAnim() {
    const root = document.querySelector('.h-hero');
    if (!root) return;

    const nav = getNav();
    const barba = document.querySelector('[data-barba="container"]');
    const baseDark = barba?.dataset.navTheme === 'dark';

    const pinHeight = root.querySelector('[data-pin-height]');
    const container = root.querySelector('.h-hero-wrapper');
    const mask = root.querySelector('.h-hero-mask');
    const heroImage = root.querySelector('.h-hero-image');
    const heroText = root.querySelector('.h-hero-text');

    const ratio = 16 / 9;
    const startH = () => container.clientHeight * 0.4;
    const endH = () => container.clientHeight;

    const navToggle = 0.8;

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

    ScrollTrigger.create({
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (!nav) return;
        const past = self.progress >= navToggle;
        nav.classList.toggle('dark', past ? !baseDark : baseDark);
      },
    });

    ScrollTrigger.create({
      trigger: pinHeight,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        if (!nav) return;
        const past = self.progress >= navToggle;
        heroText.classList.toggle('dark', past ? !baseDark : baseDark);
      },
    });
  }
  heroAnim();

  /*Work page*/
  function filterReveal() {
    const filterButton = document.querySelector(".filter-button");
    const filterOptions = document.querySelector(".filter-options");
    const filterIcon = document.querySelector(".plus-svg");
    const filterType = document.querySelectorAll("[data-filter-type]");
    const filterOption = document.querySelectorAll("[data-filter-option]");

    if (!filterButton || !filterOptions || !filterIcon || !filterType.length || !filterOption.length) return;

    let isOpen = false;
    let tl = null;

    // Initial state
    gsap.set(filterOptions, { height: 0, overflow: "hidden" });
    gsap.set(filterType, { y: 12 });
    gsap.set(filterOption, { y: 50 });

    function openFilter() {
      isOpen = true;
      if (tl) tl.kill();

      tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl
        .to(filterOptions, { height: "auto", duration: 0.5, transformOrigin: "top center" }, 0)
        .to(filterIcon, { rotation: -45, transformOrigin: "center center", duration: 0.5 }, 0)
        .to(filterType, { y: 0, stagger: 0.05, duration: 0.5 }, 0.25)
        .to(filterOption, { y: 0, stagger: 0.05, duration: 0.5 }, 0.25);
    }

    function closeFilter() {
      isOpen = false;
      if (tl) tl.kill();

      tl = gsap.timeline({ defaults: { ease: "expo.in" } });

      tl
        .to(filterType, { y: -12, stagger: { each: 0.05, from: "end" }, duration: 0.5 }, 0)
        .to(filterOption, { y: -50, stagger: { each: 0.05, from: "end" }, duration: 0.5 }, 0)
        .to(filterOptions, { height: 0, duration: 0.5, transformOrigin: "top center" }, 0.5)
        .to(filterIcon, { rotation: 0, transformOrigin: "center center", duration: 0.5 }, 0.5)
        .set(filterType, { y: 12 })
        .set(filterOption, { y: 50 });
    }

    filterButton.addEventListener("click", () => {
      isOpen ? closeFilter() : openFilter();
    });
  }
  filterReveal();

  /*View toggle start*/
  setView('grid');

  /*
  function viewToggle() {
    function setView(view) {
      const isList = view === 'list';

      document.querySelectorAll('.work-list, .work-list-header').forEach(el => {
        el.classList.toggle('is-list', isList);
      });

      document.querySelectorAll('[data-view]').forEach(b => {
        b.classList.toggle('is-active', b.dataset.view === view);
      });

      if (!isList) {
        preview.classList.remove('on');
        preview.replaceChildren();
      }
    }

    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-view]');
      if (!btn) return;
      setView(btn.dataset.view);
    });

    document.addEventListener('DOMContentLoaded', () => {
      setView('grid');
    });
  }
  viewToggle();

  function listHover() {
    const preview = document.querySelector('[data-work-preview]');
    const CLIP_HIDDEN = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
    const CLIP_SHOWN = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';

    function getItemSrc(item) {
      return item.dataset.image || item.querySelector('.work-image')?.getAttribute('src');
    }

    function createMedia(src) {
      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = src;
      div.appendChild(img);
      preview.appendChild(div);

      gsap.fromTo(div,
        { clipPath: CLIP_HIDDEN },
        { clipPath: CLIP_SHOWN, duration: 0.6, ease: 'expo.inOut' }
      );

      while (preview.children.length > 3) {
        preview.children[0].remove();
      }
    }

    document.addEventListener('mouseover', e => {
      const item = e.target.closest('.work-list.is-list .work-item');
      if (!item || item.contains(e.relatedTarget)) return;

      const src = getItemSrc(item);
      if (!src) return;

      preview.classList.add('on');
      createMedia(src);
    });

    document.addEventListener('mouseout', e => {
      const list = e.target.closest('.work-list.is-list');
      if (!list || list.contains(e.relatedTarget)) return;

      preview.classList.remove('on');
      preview.replaceChildren();
    });
  }
  listHover();
  */

  function currentProject() {
    const projectName = document.querySelector("[data-project-name]");
    const connectingLine = document.querySelector("[data-connecting-line]");
    const trigger = document.querySelector("[data-project-trigger]");
    if (!projectName || !connectingLine || !trigger) return;

    gsap.set(projectName, { y: 12 });
    gsap.set(connectingLine, { xPercent: -150 });

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: "bottom top",
        toggleActions: "play none none reverse",
        ease: "power2.inOut",
      },
    });

    tl
      .to(projectName, { y: 0 }, 0)
      .to(connectingLine, { xPercent: 0 }, 0.2);

  }
  currentProject();

  function cmsHighlight() {
    document.querySelectorAll('[data-p-subheading]').length

    document.querySelectorAll('[data-p-subheading]').forEach(el => {
      const raw = el.textContent;
      const html = raw.replace(/\*([^*]+)\*/g, '<span class="h6__emphasis">$1</span>');
      el.innerHTML = html;
    });
  }
  cmsHighlight();

  function bgColourChange() {
    let bgColour = document.querySelector("[data-bg-colour]");
    let bgTrigger = document.querySelector("[data-bg-trigger]");

    if (!bgColour || !bgTrigger) return;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: bgTrigger,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    tl.to(bgColour, { opacity: 0, ease: "power2.out" });
  }
  bgColourChange();

  function teamAnimation() {
    const teamWrapper = document.querySelector("[team-wrapper]");
    const teamItems = document.querySelectorAll("[team-item]");

    if (!teamWrapper || !teamItems.length) return;

    const teamPanels = teamWrapper.querySelectorAll("[team-panel]");
    if (!teamPanels.length) return;

    function setActiveItem(index) {
      teamItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
      });
    }

    function showPanel(index) {
      gsap.set(teamPanels, { autoAlpha: 0 });
      gsap.set(teamPanels[index], { autoAlpha: 1 });
      setActiveItem(index);
    }
    showPanel(0);

    teamItems.forEach((teamItem, index) => {
      teamItem.addEventListener("mouseenter", () => {
        showPanel(index);
      });
    });
  }
  teamAnimation();

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
  initListListeners();
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
  navTheme(data.next.container);
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