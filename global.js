//Studio Alexander
gsap.registerPlugin(ScrollTrigger, SplitText);
let mm = gsap.matchMedia();
let lenis;
let resizeObserver = null;

const getNav = () => document.querySelector(".nav");

function navTheme(container) {
  const nav = getNav();
  if (!nav || !container) return;
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

  if ( !menuButton || !menuLineTop || !menuLineTopHover || !menuLineBottom || !menuLineBottomHover ) return;

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

function pageInit() {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  mm.revert();

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

  function menuAnimation() {
    const menu = document.querySelector(".menu");
    const menuBackground = document.querySelector(".menu-background");
    const menuWrapper = document.querySelector(".menu-wrapper");
    const menuOpen = document.querySelector(".menu-button");
    const menuTextOpen = document.querySelector("[data-menu-open]");
    const menuTextClose = document.querySelector("[data-menu-close]");
    
    //const menuItems = gsap.utils.toArray("[menu-item-stagger]");

    if ( !menu || !menuWrapper || !menuOpen || !menuBackground) return;

    const tl = gsap.timeline({
      paused: true,
      reversed: true,
      defaults: {
        ease: "power2.inOut",
      },
    });

    tl
      .set(menu, { display: "flex" }, 0)
      .to(menuBackground, { opacity: 0.5, duration: 0.5 }, 0.1)
      .to(
        menuWrapper,
        {
          scale: 1,
          duration: 0.5,
          ease: "power2.inOut"
        },
        0.15
      )
      .to(menuTextOpen, { y: -12, duration: 0.25 }, 0.15)
      .to(menuTextClose, { y: 0, duration: 0.25 }, 0.2);
      //.fromTo(menuItems, { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.075 },0.75);

    const toggle = () => {
      tl.reversed() ? tl.play() : tl.timeScale(1).reverse(0);
    };

    menuOpen.addEventListener("click", toggle);
    menuBackground.addEventListener("click", toggle);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !tl.reversed()) tl.timeScale(1).reverse(0);
    });

    tl.eventCallback("onStart", () => lenis?.stop?.());
    tl.eventCallback("onReverseComplete", () => lenis?.start?.());
  }
  menuAnimation();

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
        const root = document.querySelector('.home-hero');
        if (!root) return;
    
        const pinHeight = root.querySelector('[data-pin-height]');
        const container = root.querySelector('.home-hero__wrapper');
        const heroImage = root.querySelector('.home-hero__image');

        let tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinHeight,
            start: 'top top',
            end: 'bottom bottom',
            pin: container,
            scrub: 1,
          },
        });

        tl.to(heroImage, {scale: 1, ease: "sine.out",});
        
      }
      heroAnim();

      /*
      function buttonAnimation() {
        const buttons = gsap.utils.toArray("[buttonhover]");

        buttons.forEach((buttonItem) => {
          let button = buttonItem.querySelector("[buttonhovertarget]");
          let buttonHover = gsap.timeline({
            paused: true,
          });

          buttonHover
            .to(button, { duration: 0.3, xPercent: 101, ease: "power2.inOut" })
            .set(button, { xPercent: -101 })
            .to(button, { duration: 0.5, xPercent: 0 });

          buttonItem.addEventListener("mouseenter", () => buttonHover.play(0));
        });
      }
      buttonAnimation();
      */
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
  menuButtonHover();
  pageInit();
  initResizeObserver();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

barba.hooks.beforeEnter((data) => {
  if (!data.current.container) navTheme(data.next.container);
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

      leave(data) {},

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


   /*
  

  const content = document.querySelector("[content-wrapper]");
  const navLink = gsap.utils.toArray("[nav-link]");
  const menuButton = document.querySelector("[menu-button='open']");
  const elementLoad = document.querySelectorAll("[element-load]");
  let elementFade = document.querySelectorAll("[element-fade]");
  let maskOverlay = document.querySelector("[mask-overlay]");
  let pageLoadTl;
  let splitA;

  
  function splitAnimationA() {
    const heroText = gsap.utils.toArray("[hero-text]");

    if (heroText.length) {
      SplitText.create("[hero-text]", {
        type: "lines",
        autoSplit: true,
        onSplit: (self) => {
          splitA = gsap.from(self.lines, {
            y: 30,
            autoAlpha: 0,
            stagger: 0.1,
            duration: 1.5,
            clearProps: "transform",
          });
        },
      });
    }
  }
  splitAnimationA();

  function splitAnimationB() {
    const splitB = gsap.utils.toArray("[word-split]");

    if (splitB.length) {
      splitB.forEach((el) => {
        const split = SplitText.create(el, {
          type: "words",
          wordsClass: "word",
        });

        gsap.from(split.words, {
          duration: 1.5,
          autoAlpha: 0.2,
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            end: "top 60%",
            scrub: 1,
          },
        });
      });
    }
  }
  splitAnimationB();

  function splitAnimationC() {
    const splitC = gsap.utils.toArray("[text-fade]");

    if (splitC.length) {
      splitC.forEach((el) => {
        const split = SplitText.create(el, { type: "lines" });

        gsap.from(split.lines, {
          duration: 1.5,
          autoAlpha: 0,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
          },
        });
      });
    }
  }
  splitAnimationC();

  function pageLoad() {
    pageLoadTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      paused: true,
    });

    pageLoadTl
      .set(navLink, { visibility: "visible", y: 30 }, 0)
      .from(".content-overlay", { opacity: 1, duration: 0.5 }, 0)
      .add(splitA, 0.5)
      .to(navLink, { y: 0, stagger: 0.1 }, 0.75);

    if (elementLoad.length) {
      pageLoadTl
        .set(elementLoad, { y: 30 }, 0)
        .to(elementLoad, { opacity: 1, y: 0, stagger: 0.25, duration: 2 }, 1);
    }

    if (elementFade.length) {
      pageLoadTl.to(elementFade, { opacity: 1, duration: 3 }, 1);
    }

    if (maskOverlay) {
      pageLoadTl.to(maskOverlay, { height: "0%", duration: 1.5 }, 1);
    }
  }

  function initPreload() {
    let preLoadTl = gsap.timeline({
      defaults: {
        ease: "power2.inOut",
      },
      onStart: () => {
        lenis.stop();
      },
      onComplete: () => {
        sessionStorage.setItem("visited", "true");
        lenis.start();
        content.style.opacity = "1";
        document.documentElement.classList.remove("show-preloader");
        pageLoadTl.play();
      },
    });

    preLoadTl
      .to(".load-bar", { yPercent: -80, duration: 2 }, 0.25)
      .to(".load-text-wrapper", { opacity: 0 }, 2.25)
      .to(".load-line", { height: "100%" }, 2.5)
      .to(".load-line", { opacity: 1, width: "100%", duration: 0.75 }, ">");
  }
  pageLoad();

  function checkPreload() {
    if (!sessionStorage.getItem("visited")) {
      initPreload();
    } else {
      //document.documentElement.classList.remove("show-preloader");
      content.style.opacity = "1";
      pageLoadTl.play();
    }
  }
  checkPreload();

  

  function currentPage() {}
  currentPage();

  

  function tabletAnimations() {
    mm.add("(min-width: 768px) and (max-width: 991px)", () => {});
  }
  tabletAnimations();

  function mobileLAnimations() {
    mm.add("(min-width: 480px) and (max-width: 767px)", () => {});
  }
  mobileLAnimations();

  function mobilePAnimations() {
    mm.add("(max-width: 479px)", () => {});
  }
  mobilePAnimations();
  */

  /*
  function reasonsSwiper() {
    const reasonsTrigger = document.querySelector("[reasons-trigger]");
    const reasonsPanels = gsap.utils.toArray("[reasons-panels]");
    const reasonsSegments = reasonsPanels.length - 1;
    const reasonsText = gsap.utils.toArray("[hero-text]");
    const subText = gsap.utils.toArray("[sub-text]");

    const reasonsTL = gsap.timeline({
      scrollTrigger: {
        trigger: reasonsTrigger,
        start: "top top",
        end: "+=" + reasonsSegments * 100 + "%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    reasonsPanels.forEach((reasonPanel, i) => {
      gsap.set(reasonPanel, { zIndex: reasonsPanels.length - i });
    });

    reasonsPanels.slice(0, -1).forEach((reasonPanel, i) => {
      reasonsTL.to(
        reasonPanel,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          ease: "none",
          duration: 1,
        },
        i
      );
    });

    gsap.set(reasonsText, { autoAlpha: 0, y: 30 });
    gsap.set(subText, { autoAlpha: 0, y: 30 });

    gsap.set(reasonsText[0], { autoAlpha: 1, y: 0 });
    gsap.set(subText[0], { autoAlpha: 1, y: 0 });

    let activeIndex = 0;

    function showText(nextIndex, direction) {
      if (nextIndex === activeIndex) return;

      const prevIndex = activeIndex;
      activeIndex = nextIndex;

      gsap.killTweensOf(reasonsText);
      gsap.killTweensOf(subText);

      const outY = direction > 0 ? -30 : 30;
      const inY = direction > 0 ? 30 : -30;

      // Out
      gsap.to([reasonsText[prevIndex], subText[prevIndex]], {
        autoAlpha: 0,
        y: outY,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.05,
        overwrite: true,
      });

      // In
      gsap.fromTo(
        [reasonsText[nextIndex], subText[nextIndex]],
        { autoAlpha: 0, y: inY },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.05,
          ease: "power2.out",
          overwrite: true,
        }
      );
    }

    // Callbacks
    for (let i = 0; i < reasonsText.length - 1; i++) {
      const t = i + 0.85;

      reasonsTL.add(() => showText(i + 1, 1), t);
      reasonsTL.add(() => showText(i, -1), t - 0.001);
    }
    //Parallax
    const Parallax = -5; // tweak amount of parallax
    reasonsPanels.forEach((reasonPanel) => {
      const inner = reasonPanel.querySelector(".hero__image");
      if (!inner) return;

      reasonsTL.fromTo(
        inner,
        { yPercent: 0 },
        { yPercent: Parallax, ease: "none", duration: reasonsSegments },
        0
      );
    });
  }
  reasonsSwiper();
  */


//Closer Studios boilerplate
/*
gsap.registerPlugin(ScrollTrigger, SplitText);

/////-----Lenis Smooth Scroll-----/////
const lenis = new Lenis();

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

function init() {
  let loader = document.querySelector(".preload__wrapper");
  let loaderInner = document.querySelector(".preload__inner-wrapper");
  let loaderLogo = document.querySelector(".preloader__logo-svg");
  let loaderImageWrap = document.querySelector(".preload__image-wrapper");
  let loaderInnerBg = document.querySelector(".preload__inner-bg");
  let loaderDuration = 1;
  let pageLoadTl;

  function pageLoad() {}
  pageLoad();

  function preLoader() {
    let preloaderTl = gsap.timeline({
      defaults: {
        duration: loaderDuration,
        ease: "power2.inOut",
      },
      onStart: () => {
        lenis.stop();
        loader.style.visibility = "visible";
      },
      onComplete: () => {
        lenis.start();
        sessionStorage.setItem("visited", "true");
        //loader.style.visibility = "hidden";
        document.documentElement.classList.remove("show-preloader");
      },
    });

    preloaderTl.fromTo(
      loaderLogo,
      {
        opacity: 0,
      },
      {
        delay: 0.5,
        ease: "power2.inOut",
        duration: loaderDuration,
        opacity: 1,
      }
    );

    preloaderTl.to(loaderInnerBg, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: loaderDuration,
    });

    preloaderTl.to(
      loaderImageWrap,
      {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: loaderDuration,
      },
      "<15%"
    );

    preloaderTl.to(loaderInner, {
      clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      duration: loaderDuration,
    });

    preloaderTl.to(
      loader,
      {
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        duration: loaderDuration,
      },
      "<30%"
    );
  }

  function checkPreloader() {
    if (!sessionStorage.getItem("visited")) {
      preLoader();
    } else {
      document.documentElement.classList.remove("show-preloader");
    }
  }
  checkPreloader();

  function heroSwiper() {
    const heroTrigger = document.querySelector("[hero-trigger]");
    const heroPanels = gsap.utils.toArray("[hero-panels]");
    const heroSegments = heroPanels.length - 1;
    const heroText = gsap.utils.toArray("[hero-text]");
    const subText = gsap.utils.toArray("[sub-text]");

    const heroTL = gsap.timeline({
      scrollTrigger: {
        trigger: heroTrigger,
        start: "top top",
        end: "+=" + heroSegments * 100 + "%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    });

    heroPanels.forEach((heroPanel, i) => {
      gsap.set(heroPanel, { zIndex: heroPanels.length - i });
    });

    heroPanels.slice(0, -1).forEach((heroPanel, i) => {
      heroTL.to(
        heroPanel,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          ease: "none",
          duration: 1,
        },
        i
      );
    });

    gsap.set(heroText, { autoAlpha: 0, y: 30 });
    gsap.set(subText, { autoAlpha: 0, y: 30 });

    gsap.set(heroText[0], { autoAlpha: 1, y: 0 });
    gsap.set(subText[0], { autoAlpha: 1, y: 0 });

    let activeIndex = 0;

    function showText(nextIndex, direction) {
      if (nextIndex === activeIndex) return;

      const prevIndex = activeIndex;
      activeIndex = nextIndex;

      gsap.killTweensOf(heroText);
      gsap.killTweensOf(subText);

      const outY = direction > 0 ? -30 : 30;
      const inY = direction > 0 ? 30 : -30;

      // Out
      gsap.to([heroText[prevIndex], subText[prevIndex]], {
        autoAlpha: 0,
        y: outY,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.05,
        overwrite: true,
      });

      // In
      gsap.fromTo(
        [heroText[nextIndex], subText[nextIndex]],
        { autoAlpha: 0, y: inY },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.05,
          ease: "power2.out",
          overwrite: true,
        }
      );
    }

    // Callbacks
    for (let i = 0; i < heroText.length - 1; i++) {
      const t = i + 0.85;

      heroTL.add(() => showText(i + 1, 1), t);
      heroTL.add(() => showText(i, -1), t - 0.001);
    }
    //Parallax
    const Parallax = -5; // tweak amount of parallax
    heroPanels.forEach((heroPanel) => {
      const inner = heroPanel.querySelector(".hero__image");
      if (!inner) return;

      heroTL.fromTo(
        inner,
        { yPercent: 0 },
        { yPercent: Parallax, ease: "none", duration: heroSegments },
        0
      );
    });
  }
  heroSwiper();

  function initMarquee() {
    const marquee = document.querySelector(".marquee__outer");
    if (!marquee) {
      return;
    }
    const marqueeContent = document.querySelector(".marquee__inner");
    if (!marqueeContent) {
      return;
    }
    const marqueeContentClone = marqueeContent.cloneNode(true);
    marquee.append(marqueeContentClone);

    const width = marqueeContent.offsetWidth;
    const gap = 12; // Match the 2rem gap from CSS

    gsap.set(marquee.children, { x: 0 });

    gsap.to(marquee.children, {
      x: -(width + gap),
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % (width + gap)),
      },
    });
  }
  initMarquee();

  /////-----SplitText-----/////
  let split = SplitText.create("[h3-split]", {
    type: "lines",
    mask: "lines",
  });

  gsap.from(split.lines, {
    duration: 1.5,
    y: 50,
    autoAlpha: 0,
    stagger: 0.05,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "[h3-split]",
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  /////-----Text animation-----/////
  gsap.from("[list-scroll]", {
    duration: 1.5,
    y: 50,
    autoAlpha: 0,
    stagger: 0.05,
    ease: "power2.out",
    scrollTrigger: {
      trigger: "[list-trigger]",
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  /////-----Cursor-----/////
  const cursor = document.querySelector(".cursor");
  const comingSoonAreas = document.querySelectorAll(".work__no-link");

  const xTo = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power2.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power2.out" });
  const opacityTo = gsap.quickTo(cursor, "opacity", {
    duration: 0.5,
    ease: "power2.out",
  });

  window.addEventListener("pointermove", (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  comingSoonAreas.forEach((area) => {
    area.addEventListener("pointerenter", (e) => {
      gsap.set(cursor, {
        xPercent: 20,
        yPercent: 0,
        x: e.clientX,
        y: e.clientY,
      });
      opacityTo(1);
    });

    area.addEventListener("pointerleave", () => {
      opacityTo(0);
    });
  });
  

  /////-----Nav link hover-----/////
  const links = gsap.utils.toArray("[link-hover]");

  links.forEach((link) => {
    if (link.dataset.hoverBound === "1") return;
    link.dataset.hoverBound = "1";

    const inner = link.querySelector("[link-hover__inner]");

    const tl = gsap
      .timeline({ paused: true })
      .to(inner, {
        duration: 0.25,
        yPercent: -50,
        opacity: 0,
        ease: "power2.in",
      })
      .set(inner, { yPercent: 50 })
      .to(inner, { duration: 0.25, yPercent: 0, opacity: 1 });

    link.addEventListener("pointerenter", () => tl.play(0));
    link.addEventListener("pointerleave", () => tl.reverse());
  });

  /////-----Menu animation-----/////
  function menuAnimationInit() {
    const menuWrapper = document.querySelector(".menu__wrapper");
    const menuBackground = document.querySelector(".menu__background");
    const menuInner = document.querySelector(".menu__inner-wrapper");
    const menuOpen = document.querySelector("[menu-open]");
    const menuItems = gsap.utils.toArray("[menu-item-stagger]");

    if (!menuWrapper || !menuBackground || !menuInner || !menuOpen) return;

    const menuTL = gsap.timeline({
      paused: true,
      reversed: true,
      defaults: {
        ease: "power2.inOut",
      },
    });

    menuTL
      .set(menuWrapper, { display: "flex" }, 0)
      .set(menuInner, { width: "0%" }, 0)
      .to(menuBackground, { autoAlpha: 1 }, 0.15)
      .to(
        menuInner,
        {
          width: "25%",
          duration: 0.5,
        },
        0.5
      )
      .fromTo(
        menuItems,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.075 },
        0.75
      );

    const toggle = () => {
      menuTL.reversed() ? menuTL.play() : menuTL.timeScale(1).reverse(0);
    };

    menuOpen.addEventListener("click", toggle);
    menuBackground.addEventListener("click", toggle);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !tl.reversed()) menuTL.timeScale(1).reverse(0);
    });

    menuTL.eventCallback("onStart", () => lenis?.stop?.());
    menuTL.eventCallback("onReverseComplete", () => lenis?.start?.());
  }

  menuAnimationInit();
}

function updateClock() {
  const now = new Date();
  const options = {
    timeZone: "Africa/Johannesburg",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat([], options);
  document.querySelectorAll("[clock]").forEach((el) => {
    el.textContent = formatter.format(now);
  });
}

setInterval(updateClock, 1000);
updateClock();

function copyright() {
  const currentYear = new Date().getFullYear();
  $(`[copyright]`).html(currentYear);
}
copyright();

if (document.readyState === "complete") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", () => init());
}

barba.init({
  preventRunning: true,
  transitions: [
    {
      name: "default-transition",
      leave(data) {
        return gsap.to(data.current.container, {
          autoAlpha: 0,
          duration: 1,
          ease: "power2.inOut",
        });
      },

      beforeEnter(data) {
        gsap.set(data.next.container, {
          autoAlpha: 0,
          position: "fixed",
          inset: 0,
          width: "100%",
          zIndex: 9999,
        });
      },

      enter(data) {
        return gsap.to(data.next.container, {
          autoAlpha: 1,
          duration: 1,
          ease: "power2.inOut",
        });
      },

      afterEnter(data) {
        gsap.set(data.next.container, {
          clearProps: "position,inset,width,zIndex,opacity.visibility",
        });
        $(window).scrollTop(0);
        init();
      },
    },
  ],
});
*/


