gsap.registerPlugin(ScrollTrigger, SplitText, Observer);
let mm = gsap.matchMedia();
let lenis;
let resizeObserver = null;
const getNav = () => document.querySelector('nav');
const initialised = new WeakSet();

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

function navColour(container) {
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

function pageInit(container) {
  if (!container || initialised.has(container)) return;
  initialised.add(container);

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  mm.revert();

  const clipHidden = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
  const clipShown = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  let pageLoadTl;

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

  function buttonAnim() {
    const buttons = gsap.utils.toArray("[data-button-hover]");

    buttons.forEach((button) => {
      let buttonArrow = button.querySelector("[data-button-arrow]");
      let buttonText = button.querySelectorAll("[data-button-text]");
      let tl = gsap.timeline({
        paused: true,
        defaults: {
          ease: "expo.inOut"
        }
      });

      tl
        .to(buttonText, { y: -12, duration: 0.5 }, 0)
        .to(buttonArrow, { xPercent: 101, duration: 0.25 }, 0)
        .set(buttonArrow, { xPercent: -101 }, 0.25)
        .to(buttonArrow, { xPercent: 0, duration: 0.25 }, 0.25);

      button.addEventListener("mouseenter", () => tl.play(0));

      button.addEventListener("mouseleave", () => tl.reverse());
    });
  }
  buttonAnim();

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
    const pageTitle = container?.getAttribute("data-page");
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

  function defaultPreLoader() {
    const loader = document.querySelector('.preload-wrapper');
    const loaderLogo = document.querySelector('.preloader-logo-svg');
    const loaderInnerBg = document.querySelector('.preload-inner-bg');
    const loaderInnerImg = document.querySelector('.preload-inner-img');
    let loaderDuration = 1.5;

    let tl = gsap.timeline({
      defaults: { duration: loaderDuration, ease: "expo.inOut" },
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

    tl.fromTo(loaderLogo, { opacity: 0 }, { delay: 0.5, opacity: 1 });

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
    const elements = document.querySelectorAll("[data-split-p1]");
    const splitTweens = [];

    pageLoadTl = gsap.timeline({ paused: true });

    if (!elements.length) return;

    elements.forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit(self) {
          const tween = gsap.from(self.lines, {
            duration: 1.5,
            y: 50,
            autoAlpha: 0,
            stagger: 0.05,
            ease: "expo.out",
          });

          splitTweens.push(tween);
          return tween;
        },
      });
    });

    pageLoadTl.add(splitTweens, 0);
  }
  pageLoad();

  function checkPreloader() {
    if (!sessionStorage.getItem("visited")) {
      preLoader();
    } else {
      document.documentElement.classList.remove("show-preloader");
    }
  }
  checkPreloader();

  function navColourChange() {
    const nav = getNav();
    const navTrigger = document.querySelector("[data-nav-trigger]");
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

  function projectAnim() {
    let total = 0,
      xTo,
      itemValues = []

    const content = document.querySelector('.f-work-list')
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

  function reasonSwiper() {
    const reasonTrigger = document.querySelector("[data-reason-trigger]");
    if (!reasonTrigger) return;
    const reasonPanels = gsap.utils.toArray("[data-reason-panels]");
    const reasonSegments = reasonPanels.length - 1;
    const reasonHead = gsap.utils.toArray("[data-reason-head]");
    const reasonSub = gsap.utils.toArray("[data-reason-sub]");
    const reasonCount = document.querySelector("[data-reason-count]");

    let countIndex = 0;

    function updateCount(nextIndex, direction) {
      if (!reasonCount || nextIndex === countIndex) return;
      countIndex = nextIndex;

      const outY = direction > 0 ? "-100%" : "100%";
      const inY = direction > 0 ? "100%" : "-100%";

      gsap.killTweensOf(reasonCount);
      gsap.to(reasonCount, {
        yPercent: parseFloat(outY),
        autoAlpha: 0,
        duration: 0.25,
        ease: "expo.in",
        onComplete: () => {
          reasonCount.textContent = String(nextIndex + 1).padStart(2, "0");
          gsap.fromTo(
            reasonCount,
            { yPercent: parseFloat(inY), autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: "power2.out" }
          );
        },
      });
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: reasonTrigger,
        start: "top top",
        end: "+=" + reasonSegments * 100 + "%",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        refreshPriority: 1,
      },
    });

    reasonPanels.forEach((reasonPanel, i) => {
      gsap.set(reasonPanel, { zIndex: reasonPanels.length - i });
    });

    reasonPanels.slice(0, -1).forEach((reasonPanel, i) => {
      tl.to(
        reasonPanel,
        {
          clipPath: "inset(0% 0% 100% 0%)",
          ease: "none",
          duration: 1,
        },
        i
      );
    });

    gsap.set(reasonHead, { autoAlpha: 0, y: 30 });
    gsap.set(reasonSub, { autoAlpha: 0, y: 30 });

    gsap.set(reasonHead[0], { autoAlpha: 1, y: 0 });
    gsap.set(reasonSub[0], { autoAlpha: 1, y: 0 });

    let activeIndex = 0;

    function showText(nextIndex, direction) {
      if (nextIndex === activeIndex) return;

      const prevIndex = activeIndex;
      activeIndex = nextIndex;

      gsap.killTweensOf(reasonHead);
      gsap.killTweensOf(reasonSub);

      const outY = direction > 0 ? -30 : 30;
      const inY = direction > 0 ? 30 : -30;

      // Out
      gsap.to([reasonHead[prevIndex], reasonSub[prevIndex]], {
        autoAlpha: 0,
        y: outY,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.05,
        overwrite: true,
      });

      // In
      gsap.fromTo(
        [reasonHead[nextIndex], reasonSub[nextIndex]],
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
    for (let i = 0; i < reasonHead.length - 1; i++) {
      const t = i + 0.85;

      tl.add(() => { showText(i + 1, 1); updateCount(i + 1, 1); }, t);
      tl.add(() => { showText(i, -1); updateCount(i, -1); }, t - 0.001);
    }
    //Parallax
    const Parallax = -5; // tweak amount of parallax
    reasonPanels.forEach((reasonPanel) => {
      const inner = reasonPanel.querySelector(".h-reasons-image");
      if (!inner) return;

      tl.fromTo(
        inner,
        { yPercent: 0 },
        { yPercent: Parallax, ease: "none", duration: reasonSegments },
        0
      );
    });
  }
  reasonSwiper();

  function marqueeAnimation() {
    const marquee = document.querySelector(".h-clients-track");
    const marqueeContent = document.querySelector(".h-clients-inner");
    if (!marquee || !marqueeContent) {
      return;
    }

    const marqueeContentClone = marqueeContent.cloneNode(true);
    marquee.append(marqueeContentClone);

    const width = marqueeContent.offsetWidth;
    const gap = 16; // Match the px gap from CSS

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
  marqueeAnimation();

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

  function setGrid(container) {
    if (!container.querySelector('.work-list, .ap-list')) return;

    const getPreview = () => container.querySelector('[data-work-preview]');
    let previewVisible = false;
    let mediaZ = 1;

    function setView(view) {
      const isList = view === 'list';

      container.querySelectorAll('.work-list, .work-list-header').forEach(el => {
        el.classList.toggle('is-list', isList);
      });

      container.querySelectorAll('[data-view]').forEach(b => {
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
  setGrid(container);

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

  function lazyImage() {
    const lazy = document.querySelector("[data-lazy-image]");
    if (!lazy) return;

    gsap.set(lazy, { y: 200 });

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: lazy,
        start: "top center",
        end: "bottom top",
        ease: "expo.inOut",
        scrub: 1,
      }
    });

    tl.to(lazy, { y: -200 });
  }
  lazyImage();

  function teamAnimation() {
    const teamWrapper = document.querySelector("[data-team-wrapper]");
    const teamItems = document.querySelectorAll("[data-team-item]");

    if (!teamWrapper || !teamItems.length) return;

    const teamPanels = teamWrapper.querySelectorAll("[data-team-panel]");
    if (!teamPanels.length) return;

    const roles = Array.from(teamPanels, (panel) => panel.querySelector("[data-team-role]"));
    const bios = Array.from(teamPanels, (panel) => panel.querySelector("[data-team-bio]"));
    const allText = [...roles, ...bios].filter(Boolean);

    let currentIndex = -1;

    function setActiveItem(index) {
      teamItems.forEach((item, i) => {
        item.classList.toggle("is-active", i === index);
      });
    }

    function showPanel(index) {
      if (index === currentIndex) return;
      currentIndex = index;

      gsap.set(teamPanels, { autoAlpha: 0 });
      gsap.set(teamPanels[index], { autoAlpha: 1 });
      gsap.killTweensOf(allText);
      gsap.set(bios.filter(Boolean), { autoAlpha: 0 });
      gsap.set(roles.filter(Boolean), { autoAlpha: 0, y: -12 });

      if (roles[index]) {
        gsap.to(roles[index], { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" });
      }
      if (bios[index]) {
        gsap.to(bios[index], { autoAlpha: 1, duration: 0.5, ease: "power2.out", delay: 0.25 });
      }

      setActiveItem(index);
    }

    showPanel(0);

    teamItems.forEach((teamItem, index) => {
      teamItem.addEventListener("mouseenter", () => showPanel(index));
    });
  }
  teamAnimation();

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
  pageInit(document.querySelector('[data-barba="container"]'));
  navColour(document.querySelector('[data-barba="container"]'));
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
  //window.FinsweetAttributes.modules.list.restart();
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

      leave(data) { },

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