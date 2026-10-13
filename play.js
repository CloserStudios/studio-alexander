gsap.registerPlugin(ScrollTrigger, SplitText, Observer, DrawSVGPlugin);
let mm = gsap.matchMedia();
let globalInitialised = false;

const lenis = new Lenis();
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


function initProductPage(container) {
    const productJsonEl = container.querySelector('[id^="ProductJson-"]');
    const pricesJsonEl = container.querySelector('[id^="ProductPrices-"]');
    const productIdInput = container.querySelector('#product-id');
    const priceEl = container.querySelector('#product-price');
    const addButton = container.querySelector('#add-to-cart');
    const productImage = container.querySelector('[product-image]');
    const optionInputs = Array.from(container.querySelectorAll('.product-option input[type="radio"]'));
    const saleHighlightTemplate = container.querySelector('#sale-highlight-template');
    const saleHighlightMarkup = saleHighlightTemplate ? saleHighlightTemplate.innerHTML : '';

    if (!productJsonEl || !productIdInput || !priceEl || !addButton) return;

    const product = JSON.parse(productJsonEl.textContent);
    const priceData = pricesJsonEl ? JSON.parse(pricesJsonEl.textContent) : { prices: {}, compareAtPrices: {} };
    const formattedPrices = priceData.prices || {};
    const formattedCompareAtPrices = priceData.compareAtPrices || {};

    function getInputByOptionName(optionName) {
        return Array.from(container.querySelectorAll('.product-option input[name="' + CSS.escape(optionName) + '"]'));
    }

    function getSelectedValue(optionName) {
        const checked = container.querySelector('.product-option input[name="' + CSS.escape(optionName) + '"]:checked');
        return checked ? checked.value : null;
    }

    function getCurrentSelection() {
        return product.options.map(function (optionName) {
            return getSelectedValue(optionName);
        });
    }

    function hasAvailableVariantForCandidate(optionIndex, candidateValue, currentSelection) {
        return product.variants.some(function (variant) {
            if (!variant.available) return false;

            for (let i = 0; i <= optionIndex; i++) {
                const expectedValue = i === optionIndex ? candidateValue : currentSelection[i];
                if (expectedValue != null && variant.options[i] !== expectedValue) {
                    return false;
                }
            }

            return true;
        });
    }

    function updateOptionAvailability() {
        const currentSelection = getCurrentSelection();

        product.options.forEach(function (optionName, optionIndex) {
            const inputs = getInputByOptionName(optionName);

            inputs.forEach(function (input) {
                const isAvailable = hasAvailableVariantForCandidate(optionIndex, input.value, currentSelection);

                input.disabled = !isAvailable;

                const optionButton = input.closest('.product-option-button');
                if (optionButton) {
                    optionButton.classList.toggle('is-hidden', !isAvailable);
                }

                const label = container.querySelector('label[for="' + input.id + '"]');
                if (label) {
                    label.style.opacity = isAvailable ? '1' : '0.4';
                    label.style.cursor = isAvailable ? 'pointer' : 'not-allowed';
                }
            });
        });
    }

    function normalizeSelections() {
        const currentSelection = getCurrentSelection();

        product.options.forEach(function (optionName, optionIndex) {
            const inputs = getInputByOptionName(optionName);
            const checked = inputs.find(function (input) {
                return input.checked;
            });

            if (checked && !checked.disabled) {
                currentSelection[optionIndex] = checked.value;
                return;
            }

            const firstEnabled = inputs.find(function (input) {
                return !input.disabled;
            });

            if (firstEnabled) {
                firstEnabled.checked = true;
                currentSelection[optionIndex] = firstEnabled.value;
            } else {
                currentSelection[optionIndex] = null;
            }

            updateOptionAvailability();
        });
    }

    function findExactVariant(selection) {
        return product.variants.find(function (variant) {
            return variant.options.every(function (value, index) {
                return value === selection[index];
            });
        });
    }

    function updateIncludedItems() {
        const includedContainer = container.querySelector('[id^="IncludedItems-"]');
        const dataEl = container.querySelector('[id^="IncludedItemsData-"]');

        if (!includedContainer || !dataEl) return;

        const markupByVariant = JSON.parse(dataEl.textContent);
        includedContainer.innerHTML = markupByVariant[productIdInput.value] || '';
    }

    function updateSelectedVariant() {
        const selectedOptions = getCurrentSelection();
        const matchedVariant = findExactVariant(selectedOptions);

        if (!matchedVariant) {
            addButton.textContent = "Unavailable";
            addButton.disabled = true;
            return;
        }

        productIdInput.value = matchedVariant.id;
        updateIncludedItems();

        const url = new URL(window.location.href);
        url.searchParams.set('variant', matchedVariant.id);
        window.history.replaceState(null, '', url.toString());

        if (formattedPrices[matchedVariant.id]) {
            const price = formattedPrices[matchedVariant.id];
            const compareAtPrice = formattedCompareAtPrices[matchedVariant.id];

            if (matchedVariant.compare_at_price && matchedVariant.compare_at_price > matchedVariant.price) {
                priceEl.innerHTML =
                    '<div class="h3__thin compare">' + price + '</div>' +
                    '<div class="product__price--original">' +
                    '<div class="h3__light">' + compareAtPrice + '</div>' +
                    '<div class="product__price--highlight">' + saleHighlightMarkup + '</div>' +
                    '</div>';
            } else {
                priceEl.innerHTML =
                    '<div class="h3__light">' + price + '</div>';
            }
        }

        if (matchedVariant.available) {
            addButton.textContent = "Add to cart";
            addButton.disabled = false;
        } else {
            addButton.textContent = "Out of stock";
            addButton.disabled = true;
        }

        if (productImage && matchedVariant.featured_image && matchedVariant.featured_image.src) {
            productImage.src = matchedVariant.featured_image.src;
            productImage.alt = matchedVariant.featured_image.alt || product.title;

            if (matchedVariant.featured_image.width) productImage.width = matchedVariant.featured_image.width;
            if (matchedVariant.featured_image.height) productImage.height = matchedVariant.featured_image.height;
        }
    }

    function syncProductOptions() {
        updateOptionAvailability();
        normalizeSelections();
        updateOptionAvailability();
        updateSelectedVariant();
    }

    optionInputs.forEach(function (input) {
        input.addEventListener('change', syncProductOptions);
    });

    const qtyIncrease = container.querySelector('.quantity-selector.quantity-increase');
    const qtyDecrease = container.querySelector('.quantity-selector.quantity-decrease');
    const qtyInput = container.querySelector('#quantity');

    if (qtyIncrease && qtyInput) {
        qtyIncrease.addEventListener('click', function () {
            qtyInput.value = Number(qtyInput.value) + 1;
        });
    }

    if (qtyDecrease && qtyInput) {
        qtyDecrease.addEventListener('click', function () {
            const currentValue = Number(qtyInput.value);
            if (currentValue > 1) qtyInput.value = currentValue - 1;
        });
    }

    syncProductOptions();
}

function initCartDrawer(container = document) {
    const cartDrawer = document.querySelector('.cart-drawer');
    if (!cartDrawer) return;

    function isCartPage() {
        return !!document.getElementById('CartPage');
    }

    function updateCartItemCounts(count) {
        document.querySelectorAll(".cart-count-number").forEach((el) => {
            el.textContent = count;
        });
    }

    async function updateCartDrawer() {
        const res = await fetch('/?section_id=drawer-cart');
        const text = await res.text();
        const html = document.createElement('div');
        html.innerHTML = text;

        const newWrapper = html.querySelector('.cart-drawer__wrapper');
        const currentWrapper = document.querySelector('.cart-drawer__wrapper');

        if (!newWrapper || !currentWrapper) return;

        currentWrapper.innerHTML = newWrapper.innerHTML;
        addCartListeners();
    }

    async function updateCartPage() {
        const res = await fetch('/?section_id=cart');
        const text = await res.text();
        const html = document.createElement('div');
        html.innerHTML = text;
        const newCart = html.querySelector('#CartPage');
        const currentCart = document.getElementById('CartPage');

        if (newCart && currentCart) {
            currentCart.innerHTML = newCart.innerHTML;
            addCartListeners();
        }
    }

    function openCartDrawer() {
        if (!cartAnimation) return;

        if (cartAnimation.reversed()) {
            closeAllDrawers(cartAnimation);
            showDrawerBackground();
            cartAnimation.play();
        } else {
            cartAnimation.timeScale(1).reverse(0);
        }
    }

    function closeCartDrawer() {
        if (!cartAnimation || cartAnimation.reversed()) return;
        cartAnimation.timeScale(1).reverse(0);
    }

    function addCartListeners() {
        document
            .querySelectorAll('.cart-drawer__quantity-selector button, .cart-quantity__selector button')
            .forEach((button) => {
                if (button.dataset.cartBound === 'true') return;
                button.dataset.cartBound = 'true';

                button.addEventListener('click', async () => {
                    const rootItem = button.closest('[data-line-item-key]');
                    if (!rootItem) return;

                    const key = rootItem.getAttribute('data-line-item-key');
                    const qtyInput = rootItem.querySelector('input[type="number"], input[type="text"]');
                    const currentQuantity = Number(qtyInput.value);

                    const isUp =
                        button.classList.contains('cart-drawer__quantity-selector--plus') ||
                        button.classList.contains('cart-quantity__selector--plus');

                    let newQuantity = isUp ? currentQuantity + 1 : currentQuantity - 1;
                    if (newQuantity < 1) newQuantity = 1;

                    const res = await fetch('/cart/update.js', {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ updates: { [key]: newQuantity } }),
                    });

                    const cart = await res.json();
                    updateCartItemCounts(cart.item_count);

                    if (isCartPage()) {
                        await updateCartPage();
                    } else {
                        await updateCartDrawer();
                    }
                });
            });

        document.querySelectorAll('.button__remove').forEach((button) => {
            if (button.dataset.cartBound === 'true') return;
            button.dataset.cartBound = 'true';

            button.addEventListener('click', async () => {
                const rootItem = button.closest('[data-line-item-key]');
                if (!rootItem) return;

                const key = button.getAttribute('data-line-item-key') || rootItem.getAttribute('data-line-item-key');

                const res = await fetch('/cart/update.js', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ updates: { [key]: 0 } }),
                });

                const cart = await res.json();
                updateCartItemCounts(cart.item_count);

                if (isCartPage()) {
                    await updateCartPage();
                } else {
                    await updateCartDrawer();
                }
            });
        });

        if (!isCartPage()) {
            const box = document.querySelector('.cart-drawer__wrapper');
            if (box && !box.dataset.cartStopBound) {
                box.dataset.cartStopBound = 'true';
                box.addEventListener('click', (e) => e.stopPropagation());
            }

            document.querySelectorAll('.button__close, .cart-drawer__background').forEach((el) => {
                if (el.dataset.cartBound === 'true') return;
                el.dataset.cartBound = 'true';

                el.addEventListener('click', () => {
                    closeCartDrawer();
                });
            });

            document.querySelectorAll('a[href="/cart"]').forEach((a) => {
                if (a.dataset.cartBound === 'true') return;
                a.dataset.cartBound = 'true';

                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    openCartDrawer();
                });
            });

            document.querySelectorAll('form[action="/cart/add"]').forEach((form) => {
                if (form.dataset.cartBound === 'true') return;
                form.dataset.cartBound = 'true';

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();

                    await fetch('/cart/add', {
                        method: 'POST',
                        body: new FormData(form),
                    });

                    openCartDrawer();
                    await updateCartDrawer();

                    const res = await fetch('/cart.js');
                    const cart = await res.json();
                    updateCartItemCounts(cart.item_count);
                });
            });
        }
    }

    addCartListeners();
}

function initPage(container = document) {
    const barbaContainer = container.matches?.('[data-barba="container"]')
        ? container
        : container.querySelector?.('[data-barba="container"]') || document.querySelector('[data-barba="container"]');

    if (!barbaContainer) return;

    const namespace = barbaContainer.dataset.barbaNamespace;

    if (namespace === 'product') {
        initProductPage(barbaContainer);
    }
}

function initGlobal() {
    if (globalInitialised) return;
    globalInitialised = true;
}

function initPageAnim(container) {
    if (pageContext) {
        pageContext.revert();
    }

    pageContext = gsap.context(() => {
        function pageLoadAnim() {
            const featuredImage = document.querySelectorAll('[featured-image]');
            const elements = document.querySelectorAll('[hero-text]');
            const elementLoad = document.querySelectorAll('[element-load]');

            const allWords = [];
            const tl = gsap.timeline();

            if (elements.length) {
                elements.forEach((element) => {
                    const split = SplitText.create(element, {
                        type: 'words',
                        wordsClass: 'word'
                    });

                    split.words.forEach((word) => {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'word-clip';
                        word.parentNode.insertBefore(wrapper, word);
                        wrapper.appendChild(word);
                        allWords.push(word);
                    });

                    element.style.visibility = 'visible';
                });

                gsap.set(allWords, { yPercent: 180 });

                tl.to(allWords, {
                    yPercent: 0,
                    stagger: 0.03,
                    duration: 0.8,
                    ease: 'back.out(1.3)'
                }, 0.75);
            }

            if (featuredImage) {
                tl.fromTo(featuredImage, {
                    clipPath: 'inset(100% 0 0 0)'
                }, {
                    clipPath: 'inset(0% 0 0 0)',
                    duration: 1,
                    ease: 'power3.inOut'
                }, 0);
            }

            if (elementLoad.length) {
                gsap.set(elementLoad, { autoAlpha: 0 });

                tl.to(elementLoad, {
                    autoAlpha: 1,
                    stagger: 0.1,
                    duration: 0.5,
                    ease: 'power2.out'
                }, 1);
            }
        }
        pageLoadAnim();

        function hoverAnimA() {
            const elements = document.querySelectorAll("[hover-text-a]");
            if (!elements.length) return;

            elements.forEach((el) => {
                const split = SplitText.create(el, {
                    type: "chars",
                    charsClass: "char"
                });

                split.chars.forEach((char) => {
                    const wrapper = document.createElement("span");
                    wrapper.className = "char-clip";
                    wrapper.style.display = "inline-block";
                    char.parentNode.insertBefore(wrapper, char);
                    wrapper.appendChild(char);
                });

                gsap.set(split.chars, {
                    display: "inline-block",
                    y: 0,
                    opacity: 1
                });

                el.addEventListener("mouseenter", () => {
                    const tl = gsap.timeline();

                    tl.to(split.chars, {
                        y: -50,
                        opacity: 0,
                        stagger: 0.03,
                        duration: 0.25,
                        ease: "power2.in"
                    })
                        .set(split.chars, {
                            y: 50,
                            opacity: 0
                        })
                        .to(split.chars, {
                            y: 0,
                            opacity: 1,
                            stagger: 0.03,
                            duration: 0.25,
                            ease: "back.out(1.7)"
                        });
                });
            });
        }
        hoverAnimA();

        function scrollAnimA() {
            const elements = document.querySelectorAll("[scroll-text-a]");
            if (!elements.length) return;

            elements.forEach((element) => {
                const split = SplitText.create(element, {
                    type: "chars",
                    charsClass: "char"
                });

                split.chars.forEach((char) => {
                    const wrapper = document.createElement("span");
                    wrapper.className = "char-clip";
                    wrapper.style.display = "inline-block";
                    char.parentNode.insertBefore(wrapper, char);
                    wrapper.appendChild(char);
                });

                gsap.from(split.chars, {
                    yPercent: 110,
                    stagger: 0.05,
                    duration: 0.6,
                    ease: "back.out(2)",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        end: "bottom bottom"
                    }
                });
            });
        }
        scrollAnimA();

        function scrollAnimB() {
            const elements = document.querySelectorAll("[scroll-text-b]");
            if (!elements.length) return;

            elements.forEach((element) => {
                const split = SplitText.create(element, {
                    type: "lines",
                });

                gsap.from(split.lines, {
                    opacity: 0,
                    y: 20,
                    stagger: 0.05,
                    duration: 0.6,
                    ease: "power2.inOut",
                    scrollTrigger: {
                        trigger: element,
                        start: "top 80%",
                        end: "bottom bottom"
                    }
                });
            });
        }
        scrollAnimB();

        function sliderAnim() {
            let total = 0,
                xTo,
                itemValues = []

            const content = document.querySelector('.slider .slider__inner')
            if (!content) return;
            const cards = document.querySelectorAll('.slider .slider__item')
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
                itemValues.push((Math.random() - 0.5) * 10);
            }

            const tl = gsap.timeline({ paused: true });
            tl.to(cards, {
                rotate: (index) => (itemValues[index % cardsLength]),
                xPercent: (index) => (itemValues[index % cardsLength]),
                yPercent: (index) => (itemValues[index % cardsLength]),
                scale: 0.95,
                duration: 0.5,
                ease: 'back.inOut(3)',
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

            function tick(time, deltaTime) {
                total -= deltaTime / 15;
                xTo(total);
            }

            ScrollTrigger.create({
                trigger: '.slider',
                start: 'top bottom',
                end: 'bottom top',
                onEnter: () => {
                    gsap.ticker.add(tick);
                },
                onEnterBack: () => {
                    gsap.ticker.add(tick);
                },
                onLeave: () => {
                    gsap.ticker.remove(tick);
                },
                onLeaveBack: () => {
                    gsap.ticker.remove(tick);
                }
            });
        }
        sliderAnim();

        function accordionAnim() {
            const groups = gsap.utils.toArray(".accordion__item");
            if (!groups.length) return;

            groups.forEach((group) => {
                const trigger = group.querySelector(".accordion__header");
                const content = group.querySelector(".accordion-content");
                const icon = group.querySelector(".accordion-icon");

                if (!trigger || !content) return;

                content.style.height = "0px";
                content.style.overflow = "hidden";
                content.style.opacity = "0";

                trigger.addEventListener("click", () => {
                    const isOpen = group.classList.contains("is-open");

                    groups.forEach((item) => {
                        const itemContent = item.querySelector(".accordion-content");
                        const itemIcon = item.querySelector(".accordion-icon");

                        item.classList.remove("is-open");

                        if (itemContent) {
                            gsap.to(itemContent, {
                                height: 0,
                                opacity: 0,
                                duration: 0.25,
                                ease: "power2.inOut"
                            });
                        }

                        if (itemIcon) {
                            gsap.to(itemIcon, {
                                rotate: 0,
                                duration: 0.25,
                                ease: "none"
                            });
                        }
                    });

                    if (!isOpen) {
                        group.classList.add("is-open");

                        gsap.to(content, {
                            height: content.scrollHeight,
                            opacity: 1,
                            duration: 0.25,
                            ease: "power2.inOut",
                            onComplete: () => {
                                content.style.height = "auto";
                            }
                        });

                        if (icon) {
                            gsap.to(icon, {
                                rotate: -135,
                                duration: 0.25,
                                ease: "none"
                            });
                        }
                    }
                });
            });
        }
        accordionAnim();

        function footerAnim() {
            const footer = document.querySelector('.footer');
            if (!footer) return;

            const tagline = footer.querySelector('.tagline');

            const split = SplitText.create(tagline, { type: "chars" });

            let footerTL = gsap.timeline({
                scrollTrigger: {
                    trigger: footer,
                    start: "top 50%",
                    end: "bottom bottom",
                }
            });

            footerTL.from(split.chars, {
                y: 50,
                opacity: 0,
                stagger: 0.03,
                duration: 0.25,
                ease: "back.out(1.7)"
            });
        };
        footerAnim();

        function reasonsAnim() {
            const root = document.querySelector('[reasons-root]');
            if (!root) return;
            const pinHeight = root.querySelector('[reasons-pin]')
            const container = root.querySelector('[reasons-wrapper]');
            const circles = root.querySelectorAll('[reasons-circle]');

            ScrollTrigger.create({
                trigger: pinHeight,
                start: 'top top',
                end: 'bottom bottom',
                pin: container,
            })

            gsap.fromTo(circles, {
                rotation: 30
            },
                {
                    rotation: -30,
                    ease: 'power2.inOut',
                    stagger: 0.06,
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top top',
                        end: 'bottom bottom',
                        scrub: true
                    }
                })
        }
        reasonsAnim();

        function aboutAnim() {
            const cards = gsap.utils.toArray(".values__item");
            if (!cards.length) return;

            gsap.set(cards, {
                autoAlpha: 0,
                scale: 0.8,
                x: (i) => (i % 2 === 0 ? 50 : -50),
                rotation: (i) => (i % 2 === 0 ? 4 : -4),
                transformOrigin: "50% 50%",
            });

            const rows = [];

            cards.forEach((card) => {
                const top = card.offsetTop;
                let row = rows.find((r) => Math.abs(r.top - top) < 5);

                if (!row) {
                    row = { top, items: [] };
                    rows.push(row);
                }

                row.items.push(card);
            });

            rows.forEach((row) => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: row.items[0],
                        start: "top 80%",
                    },
                });

                tl.to(row.items, {
                    autoAlpha: 1,
                    scale: 1,
                    x: 0,
                    rotation: 0,
                    duration: 1,
                    ease: "back.out(1.5)",
                    stagger: 0.25,
                });
            });
        }
        aboutAnim();

        mm.add("(min-width: 992px)", () => {
            function featuredAnim() {
                const root = document.querySelector('.featured.featured--desktop');
                if (!root) return;

                const pinHeight = root.querySelector('.pin-height');
                const container = root.querySelector('.featured__wrapper');
                const svgWrap = root.querySelector('.featured__svg');
                const path = root.querySelector('.featured__svg path');

                const headingLeft = root.querySelector('.featured__text--left [featured-text]');
                const headingCenter = root.querySelector('.featured__text--center [featured-text]');
                const headingRight = root.querySelector('.featured__text--right [featured-text]');

                gsap.set(svgWrap, { opacity: 1 });
                gsap.set(path, { drawSVG: '0% 0%' });

                ScrollTrigger.create({
                    trigger: pinHeight,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: container
                });

                gsap.to(path, {
                    drawSVG: '0% 100%',
                    ease: 'none',
                    immediateRender: false,
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top center',
                        end: 'bottom bottom',
                        scrub: true
                    }
                });

                function buildHeadingTimeline(heading) {
                    if (!heading) return null;

                    const split = SplitText.create(heading, {
                        type: 'words',
                        wordsClass: 'words'
                    });

                    split.words.forEach((word) => {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'word-clip';
                        wrapper.style.display = 'inline-block';
                        word.parentNode.insertBefore(wrapper, word);
                        wrapper.appendChild(word);
                    });

                    heading.style.visibility = 'visible';

                    return gsap.timeline().from(split.words, {
                        yPercent: 110,
                        stagger: 0.2,
                        duration: 0.75,
                        ease: 'back.out(2)'
                    });
                }

                const tlLeft = buildHeadingTimeline(headingLeft);
                const tlCenter = buildHeadingTimeline(headingCenter);
                const tlRight = buildHeadingTimeline(headingRight);

                const master = gsap.timeline({
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top center',
                        end: 'bottom bottom',
                        scrub: 1
                    }
                });

                if (tlLeft) master.add(tlLeft);
                if (tlCenter) master.add(tlCenter);
                if (tlRight) master.add(tlRight);
            }
            featuredAnim();

            function highlightAnim() {
                const paths = gsap.utils.toArray(".highlight-path");
                if (!paths.length) return;

                gsap.fromTo(
                    paths,
                    { drawSVG: "0%" },
                    {
                        drawSVG: "100%",
                        duration: 1,
                        ease: "none",
                        stagger: 0.5,
                        scrollTrigger: {
                            trigger: ".featured-collection__right",
                            start: "top top",
                        }
                    }
                );
            }
            highlightAnim();

            function ctaButtonAnim() {
                const links = gsap.utils.toArray("[cta-hover]");

                links.forEach((linkitem) => {
                    const link = linkitem.querySelectorAll("[cta-hover-target]");
                    const linkArrow = linkitem.querySelectorAll("[cta-hover-arrow]");

                    const linkHover = gsap.timeline({ paused: true });

                    linkHover
                        .to(link, {
                            duration: 0.5,
                            yPercent: -100,
                            ease: "back.out(2.5)"
                        })
                        .to(linkArrow, {
                            duration: 1.25,
                            ease: "bounce.out",
                            keyframes: [
                                { x: 50, rotate: 90, },
                                { x: 0, rotate: 0, }
                            ]
                        }, "<");

                    linkitem.addEventListener("mouseenter", () => linkHover.restart());
                });
            }
            ctaButtonAnim();
        });

        mm.add("(min-width: 479px) and (max-width: 991px)", () => {
            function featuredAnim() {
                const root = document.querySelector('.featured.featured--desktop');
                if (!root) return;

                const pinHeight = root.querySelector('.pin-height');
                const container = root.querySelector('.featured__wrapper');
                const svgWrap = root.querySelector('.featured__svg');
                const path = root.querySelector('.featured__svg path');

                const headingLeft = root.querySelector('.featured__text--left [featured-text]');
                const headingCenter = root.querySelector('.featured__text--center [featured-text]');
                const headingRight = root.querySelector('.featured__text--right [featured-text]');

                gsap.set(svgWrap, { opacity: 1 });
                gsap.set(path, { drawSVG: '0% 0%' });


                ScrollTrigger.create({
                    trigger: pinHeight,
                    start: 'top top',
                    end: 'bottom bottom',
                    pin: container
                });


                gsap.to(path, {
                    drawSVG: '0% 100%',
                    ease: 'none',
                    immediateRender: false,
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top 40%',
                        end: 'bottom center',
                        scrub: true
                    }
                });

                function buildHeadingTimeline(heading) {
                    if (!heading) return null;

                    const split = SplitText.create(heading, {
                        type: 'words',
                        wordsClass: 'words'
                    });

                    split.words.forEach((word) => {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'word-clip';
                        wrapper.style.display = 'inline-block';
                        word.parentNode.insertBefore(wrapper, word);
                        wrapper.appendChild(word);
                    });

                    heading.style.visibility = 'visible';

                    return gsap.timeline().from(split.words, {
                        yPercent: 110,
                        stagger: 0.2,
                        duration: 0.75,
                        ease: 'back.out(2)'
                    });
                }

                const tlLeft = buildHeadingTimeline(headingLeft);
                const tlCenter = buildHeadingTimeline(headingCenter);
                const tlRight = buildHeadingTimeline(headingRight);

                const master = gsap.timeline({
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top 40%',
                        end: 'bottom center',
                        scrub: 1
                    }
                });

                if (tlLeft) master.add(tlLeft);
                if (tlCenter) master.add(tlCenter);
                if (tlRight) master.add(tlRight);
            }
            featuredAnim();

            function highlightAnim() {
                gsap.utils.toArray(".highlight-path").forEach((path) => {
                    gsap.fromTo(
                        path,
                        { drawSVG: "0%" },
                        {
                            drawSVG: "100%",
                            ease: "none",
                            scrollTrigger: {
                                trigger: ".featured-collection__left",
                                start: "top 50%",
                                end: "top 30%",
                                scrub: 1
                            }
                        }
                    );
                });
            }
            highlightAnim();
        });

        mm.add("(max-width: 478px)", () => {
            function featuredAnim() {
                const root = document.querySelector('.featured.featured--mobile');
                if (!root) return;

                const pinHeight = root.querySelector('.pin-height');
                const container = root.querySelector('.featured__wrapper');
                const svgWrap = root.querySelector('.featured__svg');
                const path = root.querySelector('.featured__svg path');
                const headings = root.querySelectorAll('.h1__emphasis');

                gsap.set(svgWrap, { opacity: 1 });
                gsap.set(path, {
                    drawSVG: '0% 0%'
                });

                gsap.to(path, {
                    drawSVG: '0% 100%',
                    ease: 'none',
                    immediateRender: false,
                    scrollTrigger: {
                        trigger: pinHeight,
                        start: 'top 40%',
                        end: 'bottom 60%',
                        scrub: true,
                    }
                });

                headings.forEach((heading) => {
                    const split = SplitText.create(heading, {
                        type: 'words',
                        wordsClass: 'words'
                    });

                    split.words.forEach((word) => {
                        const wrapper = document.createElement('span');
                        wrapper.className = 'word-clip';
                        wrapper.style.display = 'inline-block';
                        word.parentNode.insertBefore(wrapper, word);
                        wrapper.appendChild(word);
                    });

                    heading.style.visibility = 'visible';

                    gsap.from(split.words, {
                        yPercent: 110,
                        stagger: 0.2,
                        duration: 0.75,
                        ease: 'back.out(2)',
                        scrollTrigger: {
                            trigger: heading,
                            start: 'top center',
                            end: 'bottom bottom'
                        }
                    });
                });
            }
            featuredAnim();

            function highlightAnim() {
                gsap.utils.toArray(".highlight-path").forEach((path) => {
                    gsap.fromTo(
                        path,
                        { drawSVG: "0%" },
                        {
                            drawSVG: "100%",
                            ease: "none",
                            scrollTrigger: {
                                trigger: ".featured-collection__left",
                                start: "top 50%",
                                end: "top 30%",
                                scrub: 1
                            }
                        }
                    );
                });
            }
            highlightAnim();
        });
    }, container);
}

if (document.readyState === "complete" || document.readyState === "interactive") {
    initGlobal();
    initCartDrawer();
    initPageAnim(document);
    initPage(document);
} else {
    document.addEventListener("DOMContentLoaded", () => {
        initGlobal();
        initCartDrawer();
        initPageAnim(document);
        initPage(document);
    });
}

barba.hooks.beforeEnter((data) => {
    gsap.set([data.current.container, data.next.container], {
        willChange: "opacity, transform, margin-top",
    });

    gsap.set(data.next.container, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
    });
});

barba.hooks.before(() => {
    lenis.stop();
});

barba.hooks.after((data) => {
    gsap.set([data.current.container, data.next.container], {
        clearProps: "willChange"
    });

    gsap.set(data.next.container, {
        position: "relative",
        clearProps: "top,left,width"
    });

    closeAllDrawers();
    window.scrollTo(0, 0);
    initPageAnim(data.next.container);
    initPage(data.next.container);
    initCartDrawer(data.next.container);
    lenis.start();
    ScrollTrigger.refresh();
});

barba.init({
    preventRunning: true,
    timeout: 10000,
    sync: true,
    prevent: ({ el, event }) => {
        if (event?.type === "submit") return true;
        if (el?.closest('form[action*="/cart/add"]')) return true;
        if (el?.closest('[data-barba-prevent]')) return true;
        return false;
    },
    transitions: [
        {
            name: "page-reveal",
            enter(data) {
                const tl = gsap.timeline({
                    defaults: {
                        ease: "power4.in",
                        duration: 1,
                    },
                });

                tl.fromTo(
                    data.current.container,
                    {
                        opacity: 1,
                        marginTop: "0vh",
                    },
                    {
                        opacity: 0,
                        marginTop: "-40vh",

                    }, 0
                );

                tl.fromTo(
                    data.next.container,
                    {
                        marginTop: "100vh",
                    },
                    {
                        marginTop: "0vh",
                        clearProps: "all",
                    }, "<"
                );

                return tl;
            },
        },
    ],
});
