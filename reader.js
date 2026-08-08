/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 1 / 14

   CORE ENGINE
   - Global reader object
   - State management
   - DOM helpers
   - Safe utilities
   - Event helpers
   - Theme foundation
   - No page navigation yet
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL READER OBJECT
    ===================================================== */

    const R =
        window.ChishtiReader =
            window.ChishtiReader || {};


    /* =====================================================
       READER STATE
    ===================================================== */

    const state =
        R.state =
            R.state || {};


    /* =====================================================
       DEFAULT STATE
    ===================================================== */

    const defaults = {

        /* Reader */
        initialized: false,
        ready: false,

        /* PDF */
        pdfDocument: null,
        pdfLoading: false,
        pdfLoaded: false,

        /* Pages */
        currentPage: 1,
        totalPages: 0,
        pageCount: 0,

        /* Navigation */
        pageChanging: false,
        pageChangeToken: 0,
        navigationReady: false,

        /* History */
        pageHistory: [],
        pageHistoryIndex: -1,

        /* Search */
        searchQuery: "",
        searchOpen: false,
        searching: false,

        /* Zoom */
        zoom: 1,
        minZoom: 0.5,
        maxZoom: 3,
        zoomStep: 0.1,
        fitMode: false,

        /* Reading progress */
        readingProgress: 0,
        pageProgress: 0,
        scrollProgress: 0,
        progressVisible: true,
        progressDirection: "ltr",

        /* UI */
        readerLight: false,
        pageGlow: false,

        /* Book */
        bookId: "",
        currentBookId: "",
        bookTitle: "",

        /* Timers */
        progressSaveTimer: null,
        progressUpdateFrame: null,

        /* Observers */
        progressObserver: null,
        finalPageObserver: null,
        visibilityObserver: null,

        /* Runtime */
        isMobile: false,
        isTablet: false,
        isDesktop: false,

        /* Misc */
        lastSavedProgress: -1,
        finalIntegration: false

    };


    /* =====================================================
       APPLY DEFAULTS
    ===================================================== */

    Object.keys(defaults)
        .forEach(
            key => {

                if (
                    state[key] === undefined
                ) {

                    /*
                     * Clone arrays/objects so
                     * state does not share references.
                     */

                    if (
                        Array.isArray(
                            defaults[key]
                        )
                    ) {

                        state[key] =
                            [...defaults[key]];

                    } else {

                        state[key] =
                            defaults[key];

                    }

                }

            }
        );


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function $(
        selector,
        root = document
    ) {

        if (
            !selector ||
            !root
        ) {

            return null;

        }

        try {

            return root.querySelector(
                selector
            );

        } catch (error) {

            console.warn(
                "Invalid selector:",
                selector,
                error
            );

            return null;

        }

    }


    function $$(
        selector,
        root = document
    ) {

        if (
            !selector ||
            !root
        ) {

            return [];

        }

        try {

            return Array.from(
                root.querySelectorAll(
                    selector
                )
            );

        } catch (error) {

            console.warn(
                "Invalid selector:",
                selector,
                error
            );

            return [];

        }

    }


    /* =====================================================
       COMMON READER ELEMENTS
    ===================================================== */

    function getReader() {

        return $(
            ".reader"
        );

    }


    function getViewport() {

        return $(
            ".reader-viewport"
        );

    }


    function getStage() {

        return $(
            ".page-stage"
        );

    }


    function getToolbar() {

        return $(
            ".reader-toolbar"
        );

    }


    function getPageContainer() {

        return $(
            ".reader-pages, .pages-container, .page-stage"
        );

    }


    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    function safeNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }


        return fallback;

    }


    /* =====================================================
       SAFE INTEGER
    ===================================================== */

    function safeInteger(
        value,
        fallback = 0
    ) {

        const number =
            parseInt(
                value,
                10
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }


        return fallback;

    }


    /* =====================================================
       CLAMP
    ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        const number =
            safeNumber(
                value,
                min
            );


        return Math.max(
            min,
            Math.min(
                max,
                number
            )
        );

    }


    /* =====================================================
       NORMALIZE PAGE
    ===================================================== */

    function normalizePage(
        page
    ) {

        let value =
            safeInteger(
                page,
                1
            );


        if (
            value < 1
        ) {

            value = 1;

        }


        const total =
            safeInteger(
                state.totalPages,
                0
            );


        if (
            total > 0
        ) {

            value =
                Math.min(
                    value,
                    total
                );

        }


        return value;

    }


    /* =====================================================
       PERCENTAGE
    ===================================================== */

    function toPercent(
        value,
        total
    ) {

        const amount =
            safeNumber(
                value,
                0
            );


        const maximum =
            safeNumber(
                total,
                0
            );


        if (
            maximum <= 0
        ) {

            return 0;

        }


        return clamp(
            (
                amount /
                maximum
            ) *
            100,
            0,
            100
        );

    }


    /* =====================================================
       SAFE TEXT
    ===================================================== */

    function setText(
        element,
        value
    ) {

        if (
            !element
        ) {

            return;

        }


        element.textContent =
            String(
                value ?? ""
            );

    }


    /* =====================================================
       SAFE ATTRIBUTE
    ===================================================== */

    function setAttribute(
        element,
        name,
        value
    ) {

        if (
            !element ||
            !name
        ) {

            return;

        }


        try {

            element.setAttribute(
                name,
                String(
                    value
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       SAFE CLASS
    ===================================================== */

    function toggleClass(
        element,
        className,
        condition
    ) {

        if (
            !element ||
            !className
        ) {

            return;

        }


        element.classList.toggle(
            className,
            Boolean(
                condition
            )
        );

    }


    /* =====================================================
       EVENT HELPER
    ===================================================== */

    function on(
        target,
        eventName,
        handler,
        options
    ) {

        if (
            !target ||
            typeof target.addEventListener !==
            "function"
        ) {

            return () => {};

        }


        target.addEventListener(
            eventName,
            handler,
            options
        );


        return () => {

            try {

                target.removeEventListener(
                    eventName,
                    handler,
                    options
                );

            } catch (_) {}

        };

    }


    /* =====================================================
       DISPATCH READER EVENT
    ===================================================== */

    function emit(
        name,
        detail = {}
    ) {

        if (
            !name
        ) {

            return;

        }


        try {

            document.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail
                    }
                )
            );

        } catch (error) {

            console.warn(
                "Could not dispatch reader event:",
                name,
                error
            );

        }

    }


    /* =====================================================
       REQUEST FRAME
    ===================================================== */

    function nextFrame(
        callback
    ) {

        if (
            typeof callback !==
            "function"
        ) {

            return null;

        }


        if (
            typeof requestAnimationFrame ===
            "function"
        ) {

            return requestAnimationFrame(
                callback
            );

        }


        return setTimeout(
            callback,
            16
        );

    }


    /* =====================================================
       DELAY
    ===================================================== */

    function wait(
        milliseconds = 0
    ) {

        const delay =
            Math.max(
                0,
                safeNumber(
                    milliseconds,
                    0
                )
            );


        return new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    delay
                );

            }
        );

    }


    /* =====================================================
       READER THEME
    ===================================================== */

    function applyBaseTheme() {

        const root =
            document.documentElement;


        if (
            !root
        ) {

            return;

        }


        root.style.setProperty(
            "--primary",
            "#641b2b"
        );

        root.style.setProperty(
            "--primary-dark",
            "#3d101b"
        );

        root.style.setProperty(
            "--primary-deep",
            "#280a12"
        );

        root.style.setProperty(
            "--secondary",
            "#c79a3b"
        );

        root.style.setProperty(
            "--gold",
            "#c79a3b"
        );

        root.style.setProperty(
            "--gold-light",
            "#e4c66a"
        );

        root.style.setProperty(
            "--gold-dark",
            "#987126"
        );


        root.dataset.theme =
            "maroon-gold";


        root.classList.add(
            "theme-maroon-gold"
        );


        if (
            document.body
        ) {

            document.body.dataset.theme =
                "maroon-gold";


            document.body.classList.add(
                "theme-maroon-gold"
            );

        }

    }


    /* =====================================================
       RESPONSIVE STATE
    ===================================================== */

    function updateDeviceState() {

        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            0;


        state.isMobile =
            width <= 700;


        state.isTablet =
            width > 700 &&
            width <= 1024;


        state.isDesktop =
            width > 1024;


        const root =
            document.documentElement;


        if (
            root
        ) {

            toggleClass(
                root,
                "is-mobile",
                state.isMobile
            );

            toggleClass(
                root,
                "is-tablet",
                state.isTablet
            );

            toggleClass(
                root,
                "is-desktop",
                state.isDesktop
            );

        }


        if (
            document.body
        ) {

            toggleClass(
                document.body,
                "is-mobile",
                state.isMobile
            );

            toggleClass(
                document.body,
                "is-tablet",
                state.isTablet
            );

            toggleClass(
                document.body,
                "is-desktop",
                state.isDesktop
            );

        }

    }


    /* =====================================================
       PUBLIC CORE API
    ===================================================== */

    R.$ =
        $;

    R.$$ =
        $$;

    R.getReader =
        getReader;

    R.getViewport =
        getViewport;

    R.getStage =
        getStage;

    R.getToolbar =
        getToolbar;

    R.getPageContainer =
        getPageContainer;

    R.safeNumber =
        safeNumber;

    R.safeInteger =
        safeInteger;

    R.clamp =
        clamp;

    R.normalizePage =
        normalizePage;

    R.toPercent =
        toPercent;

    R.setText =
        setText;

    R.setAttribute =
        setAttribute;

    R.toggleClass =
        toggleClass;

    R.on =
        on;

    R.emit =
        emit;

    R.nextFrame =
        nextFrame;

    R.wait =
        wait;

    R.applyBaseTheme =
        applyBaseTheme;

    R.updateDeviceState =
        updateDeviceState;


    /* =====================================================
       INITIAL CORE SETUP
    ===================================================== */

    function initializeCore() {

        applyBaseTheme();

        updateDeviceState();


        state.initialized =
            true;


        emit(
            "reader:core-ready",
            {
                state
            }
        );


        console.log(
            "Chishti Library Reader — Part 1/14 loaded."
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeCore,
            {
                once: true
            }
        );

    } else {

        initializeCore();

    }

})();
/* =========================================================
   END OF JAVASCRIPT PART 1 / 14
========================================================= */
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 2 / 14

   DOM + READER SHELL ENGINE

   - Reader element detection
   - Viewport detection
   - Page stage detection
   - Toolbar / controls detection
   - Safe DOM refresh
   - Reader CSS variables
   - Resize handling
   - Part 1 compatible
========================================================= */


/* =====================================================
   READER DOM CACHE
===================================================== */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader Part 1 is required before Part 2."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       DOM CACHE
    ===================================================== */

    state.dom =
        state.dom || {};


    function cacheElement(
        key,
        selectors
    ) {

        const selectorList =
            Array.isArray(
                selectors
            )
                ? selectors
                : [selectors];


        for (
            const selector of selectorList
        ) {

            const element =
                R.$(
                    selector
                );


            if (
                element
            ) {

                state.dom[key] =
                    element;

                return element;

            }

        }


        state.dom[key] =
            null;


        return null;

    }


    /* =====================================================
       CACHE ALL READER ELEMENTS
    ===================================================== */

    function cacheReaderDOM() {

        cacheElement(
            "reader",
            [
                ".reader",
                "#reader",
                "[data-reader]"
            ]
        );


        cacheElement(
            "viewport",
            [
                ".reader-viewport",
                "#readerViewport",
                "[data-reader-viewport]"
            ]
        );


        cacheElement(
            "stage",
            [
                ".page-stage",
                "#pageStage",
                "[data-page-stage]"
            ]
        );


        cacheElement(
            "toolbar",
            [
                ".reader-toolbar",
                "#readerToolbar",
                "[data-reader-toolbar]"
            ]
        );


        cacheElement(
            "topbar",
            [
                ".reader-topbar",
                "#readerTopbar",
                "[data-reader-topbar]"
            ]
        );


        cacheElement(
            "bottombar",
            [
                ".reader-bottombar",
                "#readerBottombar",
                "[data-reader-bottombar]"
            ]
        );


        cacheElement(
            "sidebar",
            [
                ".reader-sidebar",
                "#readerSidebar",
                "[data-reader-sidebar]"
            ]
        );


        cacheElement(
            "controls",
            [
                ".reader-controls",
                "#readerControls",
                "[data-reader-controls]"
            ]
        );


        cacheElement(
            "search",
            [
                ".reader-search",
                "#readerSearch",
                "[data-reader-search]"
            ]
        );


        cacheElement(
            "overlay",
            [
                ".reader-overlay",
                "#readerOverlay",
                "[data-reader-overlay]"
            ]
        );


        cacheElement(
            "loading",
            [
                ".reader-loading",
                "#readerLoading",
                "[data-reader-loading]"
            ]
        );


        cacheElement(
            "pageContainer",
            [
                ".reader-pages",
                ".pages-container",
                ".page-stage",
                "[data-pages]"
            ]
        );

    }


    /* =====================================================
       GET CACHED ELEMENT
    ===================================================== */

    function getDOM(
        key
    ) {

        if (
            state.dom &&
            state.dom[key]
        ) {

            return state.dom[key];

        }


        return null;

    }


    /* =====================================================
       REFRESH DOM CACHE
    ===================================================== */

    function refreshDOM() {

        cacheReaderDOM();

        return state.dom;

    }


    /* =====================================================
       READER ELEMENTS
    ===================================================== */

    function getReader() {

        return (
            getDOM(
                "reader"
            ) ||
            R.getReader?.() ||
            null
        );

    }


    function getViewport() {

        return (
            getDOM(
                "viewport"
            ) ||
            R.getViewport?.() ||
            null
        );

    }


    function getStage() {

        return (
            getDOM(
                "stage"
            ) ||
            R.getStage?.() ||
            null
        );

    }


    function getToolbar() {

        return (
            getDOM(
                "toolbar"
            ) ||
            R.getToolbar?.() ||
            null
        );

    }


    /* =====================================================
       PAGE ELEMENTS
    ===================================================== */

    function getPages() {

        const stage =
            getStage();


        if (
            !stage
        ) {

            return [];

        }


        return Array.from(
            stage.querySelectorAll(
                ".reader-page, [data-reader-page]"
            )
        );

    }


    function getPage(
        pageNumber
    ) {

        const pages =
            getPages();


        const target =
            R.safeInteger(
                pageNumber,
                1
            );


        return (
            pages.find(
                page => {

                    const number =
                        page.dataset.page ||
                        page.dataset.pageNumber ||
                        page.getAttribute(
                            "data-page"
                        );


                    return (
                        R.safeInteger(
                            number,
                            -1
                        ) ===
                        target
                    );

                }
            ) ||
            null
        );

    }


    /* =====================================================
       READER STATE CLASSES
    ===================================================== */

    function updateReaderClasses() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        R.toggleClass(
            reader,
            "is-mobile",
            state.isMobile
        );


        R.toggleClass(
            reader,
            "is-tablet",
            state.isTablet
        );


        R.toggleClass(
            reader,
            "is-desktop",
            state.isDesktop
        );


        R.toggleClass(
            reader,
            "is-ready",
            state.ready
        );


        R.toggleClass(
            reader,
            "is-loading",
            Boolean(
                state.pdfLoading
            )
        );


        R.toggleClass(
            reader,
            "is-searching",
            Boolean(
                state.searching
            )
        );


        R.toggleClass(
            reader,
            "fit-mode",
            Boolean(
                state.fitMode
            )
        );


        R.toggleClass(
            reader,
            "reader-light",
            Boolean(
                state.readerLight
            )
        );


        R.toggleClass(
            reader,
            "page-glow",
            Boolean(
                state.pageGlow
            )
        );

    }


    /* =====================================================
       CSS VARIABLES
    ===================================================== */

    function updateCSSVariables() {

        const root =
            document.documentElement;


        if (
            !root
        ) {

            return;

        }


        const zoom =
            R.clamp(
                state.zoom,
                state.minZoom || 0.5,
                state.maxZoom || 3
            );


        root.style.setProperty(
            "--reader-zoom",
            String(
                zoom
            )
        );


        root.style.setProperty(
            "--reader-page",
            String(
                state.currentPage || 1
            )
        );


        root.style.setProperty(
            "--reader-total-pages",
            String(
                state.totalPages || 0
            )
        );


        root.style.setProperty(
            "--reader-progress",
            `${R.toPercent(
                state.currentPage || 1,
                Math.max(
                    state.totalPages || 1,
                    1
                )
            )}%`
        );


        root.style.setProperty(
            "--reader-primary",
            "#641b2b"
        );


        root.style.setProperty(
            "--reader-gold",
            "#c79a3b"
        );

    }


    /* =====================================================
       VIEWPORT SAFETY
    ===================================================== */

    function setupViewport() {

        const viewport =
            getViewport();


        if (
            !viewport
        ) {

            return;

        }


        viewport.style.setProperty(
            "overscroll-behavior",
            "contain"
        );


        if (
            state.isMobile
        ) {

            viewport.style.setProperty(
                "width",
                "100%"
            );


            viewport.style.setProperty(
                "max-width",
                "100%"
            );


            viewport.style.setProperty(
                "-webkit-overflow-scrolling",
                "touch"
            );

        }

    }


    /* =====================================================
       STAGE SAFETY
    ===================================================== */

    function setupStage() {

        const stage =
            getStage();


        if (
            !stage
        ) {

            return;

        }


        stage.style.setProperty(
            "box-sizing",
            "border-box"
        );


        if (
            state.isMobile
        ) {

            stage.style.setProperty(
                "max-width",
                "100%"
            );


            stage.style.setProperty(
                "padding-left",
                "10px"
            );


            stage.style.setProperty(
                "padding-right",
                "10px"
            );

        }

    }


    /* =====================================================
       LOADING UI
    ===================================================== */

    function showLoading(
        message = "Loading..."
    ) {

        const loading =
            cacheElement(
                "loading",
                [
                    ".reader-loading",
                    "#readerLoading",
                    "[data-reader-loading]"
                ]
            );


        if (
            !loading
        ) {

            return;

        }


        const text =
            loading.querySelector(
                ".loading-text, [data-loading-text]"
            );


        if (
            text
        ) {

            text.textContent =
                message;

        }


        loading.hidden =
            false;


        loading.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function hideLoading() {

        const loading =
            getDOM(
                "loading"
            );


        if (
            !loading
        ) {

            return;

        }


        loading.hidden =
            true;


        loading.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* =====================================================
       READER VISIBILITY
    ===================================================== */

    function showReader() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        reader.hidden =
            false;


        reader.setAttribute(
            "aria-hidden",
            "false"
        );


        reader.classList.add(
            "reader-visible"
        );

    }


    function hideReader() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        reader.classList.remove(
            "reader-visible"
        );

    }


    /* =====================================================
       MOBILE / RESIZE
    ===================================================== */

    let resizeTimer =
        null;


    function handleResize() {

        if (
            resizeTimer
        ) {

            clearTimeout(
                resizeTimer
            );

        }


        resizeTimer =
            setTimeout(
                () => {

                    R.updateDeviceState();

                    refreshDOM();

                    updateReaderClasses();

                    updateCSSVariables();

                    setupViewport();

                    setupStage();


                    R.emit(
                        "reader:resize",
                        {
                            mobile:
                                state.isMobile,

                            tablet:
                                state.isTablet,

                            desktop:
                                state.isDesktop
                        }
                    );

                },
                100
            );

    }


    function bindResize() {

        if (
            state.domResizeBound
        ) {

            return;

        }


        state.domResizeBound =
            true;


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );

    }


    /* =====================================================
       DOM OBSERVER
    ===================================================== */

    function observeReaderDOM() {

        const reader =
            getReader();


        if (
            !reader ||
            state.domObserver
        ) {

            return;

        }


        const observer =
            new MutationObserver(
                mutations => {

                    if (
                        !mutations.length
                    ) {

                        return;

                    }


                    refreshDOM();

                    updateReaderClasses();

                    updateCSSVariables();

                }
            );


        observer.observe(
            reader,
            {
                childList: true,
                subtree: true
            }
        );


        state.domObserver =
            observer;

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.refreshDOM =
        refreshDOM;

    R.getDOM =
        getDOM;

    R.getPages =
        getPages;

    R.getPage =
        getPage;

    R.getReader =
        getReader;

    R.getViewport =
        getViewport;

    R.getStage =
        getStage;

    R.getToolbar =
        getToolbar;

    R.updateReaderClasses =
        updateReaderClasses;

    R.updateCSSVariables =
        updateCSSVariables;

    R.setupViewport =
        setupViewport;

    R.setupStage =
        setupStage;

    R.showLoading =
        showLoading;

    R.hideLoading =
        hideLoading;

    R.showReader =
        showReader;

    R.hideReader =
        hideReader;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeDOM() {

        R.updateDeviceState();

        refreshDOM();

        updateReaderClasses();

        updateCSSVariables();

        setupViewport();

        setupStage();

        bindResize();

        observeReaderDOM();


        R.emit(
            "reader:dom-ready",
            {
                reader:
                    getReader(),

                viewport:
                    getViewport(),

                stage:
                    getStage()
            }
        );


        console.log(
            "Chishti Library Reader — Part 2/14 loaded."
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeDOM,
            {
                once: true
            }
        );

    } else {

        initializeDOM();

    }

})();


/* =========================================================
   END OF JAVASCRIPT PART 2 / 14
========================================================= */
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 3 / 14

   READER STATE + DEVICE + EVENT ENGINE

   - Safe shared state
   - Mobile / tablet / desktop detection
   - Custom reader events
   - Utility helpers
   - State synchronization
   - Error-safe event dispatch
   - Compatible with Parts 1–2
========================================================= */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader Parts 1–2 are required before Part 3."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       STATE DEFAULTS
    ===================================================== */

    const defaults = {

        currentPage: 1,

        totalPages: 0,

        currentBookId: "",

        bookId: "",

        bookTitle: "",

        zoom: 1,

        minZoom: 0.5,

        maxZoom: 3,

        zoomStep: 0.1,

        fitMode: false,

        readerLight: false,

        pageGlow: false,

        searching: false,

        searchOpen: false,

        searchQuery: "",

        pdfLoading: false,

        pdfLoaded: false,

        initialized: false,

        ready: false,

        isMobile: false,

        isTablet: false,

        isDesktop: true,

        pageChanging: false,

        pageChangeToken: 0,

        progressUpdateFrame: null,

        progressSaveTimer: null,

        lastSavedProgress: -1,

        readingProgress: 0,

        pageProgress: 0,

        scrollProgress: 0,

        progressVisible: true,

        progressDirection: "forward",

        eventHandlers: {},

        errors: []

    };


    Object.keys(
        defaults
    ).forEach(
        key => {

            if (
                state[key] ===
                undefined
            ) {

                state[key] =
                    defaults[key];

            }

        }
    );


    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    function safeNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(
                value
            );


        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    }


    function safeInteger(
        value,
        fallback = 0
    ) {

        const number =
            parseInt(
                value,
                10
            );


        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    }


    function clamp(
        value,
        min,
        max
    ) {

        const number =
            safeNumber(
                value,
                min
            );


        return Math.min(
            max,
            Math.max(
                min,
                number
            )
        );

    }


    /* =====================================================
       PERCENTAGE
    ===================================================== */

    function toPercent(
        value,
        total
    ) {

        const current =
            safeNumber(
                value,
                0
            );


        const maximum =
            safeNumber(
                total,
                0
            );


        if (
            maximum <= 0
        ) {

            return 0;

        }


        return clamp(
            (
                current /
                maximum
            ) *
            100,
            0,
            100
        );

    }


    /* =====================================================
       DEVICE DETECTION
    ===================================================== */

    function updateDeviceState() {

        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            0;


        state.isMobile =
            width <= 700;


        state.isTablet =
            width > 700 &&
            width <= 1024;


        state.isDesktop =
            width > 1024;


        if (
            document.documentElement
        ) {

            document.documentElement.classList.toggle(
                "is-mobile",
                state.isMobile
            );

            document.documentElement.classList.toggle(
                "is-tablet",
                state.isTablet
            );

            document.documentElement.classList.toggle(
                "is-desktop",
                state.isDesktop
            );

        }


        if (
            document.body
        ) {

            document.body.classList.toggle(
                "is-mobile",
                state.isMobile
            );

            document.body.classList.toggle(
                "is-tablet",
                state.isTablet
            );

            document.body.classList.toggle(
                "is-desktop",
                state.isDesktop
            );

        }


        return {

            mobile:
                state.isMobile,

            tablet:
                state.isTablet,

            desktop:
                state.isDesktop,

            width

        };

    }


    /* =====================================================
       EVENT ENGINE
    ===================================================== */

    function emit(
        name,
        detail = {}
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    name,
                    {
                        detail:
                            detail
                    }
                )
            );

        } catch (
            error
        ) {

            console.warn(
                "Reader event dispatch failed:",
                name,
                error
            );

        }


        /*
         * Also execute internal handlers.
         */

        const handlers =
            state.eventHandlers?.[name];


        if (
            !Array.isArray(
                handlers
            )
        ) {

            return;

        }


        handlers.forEach(
            handler => {

                if (
                    typeof handler !==
                    "function"
                ) {

                    return;

                }


                try {

                    handler(
                        detail
                    );

                } catch (
                    error
                ) {

                    console.warn(
                        "Reader event handler failed:",
                        name,
                        error
                    );

                }

            }
        );

    }


    function on(
        name,
        handler
    ) {

        if (
            typeof handler !==
            "function"
        ) {

            return () => {};

        }


        if (
            !state.eventHandlers[name]
        ) {

            state.eventHandlers[name] =
                [];

        }


        state.eventHandlers[name].push(
            handler
        );


        return () => {

            off(
                name,
                handler
            );

        };

    }


    function off(
        name,
        handler
    ) {

        const handlers =
            state.eventHandlers?.[name];


        if (
            !Array.isArray(
                handlers
            )
        ) {

            return;

        }


        state.eventHandlers[name] =
            handlers.filter(
                item =>
                    item !==
                    handler
            );

    }


    /* =====================================================
       SAFE CLASS HELPERS
    ===================================================== */

    function toggleClass(
        element,
        className,
        enabled
    ) {

        if (
            !element ||
            !className
        ) {

            return;

        }


        element.classList.toggle(
            className,
            Boolean(
                enabled
            )
        );

    }


    function addClass(
        element,
        className
    ) {

        if (
            !element ||
            !className
        ) {

            return;

        }


        element.classList.add(
            className
        );

    }


    function removeClass(
        element,
        className
    ) {

        if (
            !element ||
            !className
        ) {

            return;

        }


        element.classList.remove(
            className
        );

    }


    /* =====================================================
       SAFE DOM QUERY
    ===================================================== */

    function query(
        selector,
        parent = document
    ) {

        if (
            !selector ||
            !parent ||
            typeof parent.querySelector !==
            "function"
        ) {

            return null;

        }


        try {

            return parent.querySelector(
                selector
            );

        } catch (
            error
        ) {

            console.warn(
                "Invalid reader selector:",
                selector
            );

            return null;

        }

    }


    function queryAll(
        selector,
        parent = document
    ) {

        if (
            !selector ||
            !parent ||
            typeof parent.querySelectorAll !==
            "function"
        ) {

            return [];

        }


        try {

            return Array.from(
                parent.querySelectorAll(
                    selector
                )
            );

        } catch (
            error
        ) {

            console.warn(
                "Invalid reader selector:",
                selector
            );

            return [];

        }

    }


    /* =====================================================
       PAGE NORMALIZATION
    ===================================================== */

    function normalizePage(
        page
    ) {

        let value =
            safeInteger(
                page,
                1
            );


        const total =
            safeInteger(
                state.totalPages,
                0
            );


        if (
            value < 1
        ) {

            value =
                1;

        }


        if (
            total > 0 &&
            value > total
        ) {

            value =
                total;

        }


        return value;

    }


    /* =====================================================
       ZOOM NORMALIZATION
    ===================================================== */

    function normalizeZoom(
        zoom
    ) {

        return clamp(
            zoom,
            safeNumber(
                state.minZoom,
                0.5
            ),
            safeNumber(
                state.maxZoom,
                3
            )
        );

    }


    /* =====================================================
       BOOK IDENTIFIER
    ===================================================== */

    function getBookIdentifier() {

        return (
            state.bookId ||
            state.currentBookId ||
            state.bookTitle ||
            document.body?.dataset?.bookId ||
            "default-book"
        );

    }


    /* =====================================================
       STATE SNAPSHOT
    ===================================================== */

    function getStateSnapshot() {

        return {

            currentPage:
                state.currentPage,

            totalPages:
                state.totalPages,

            zoom:
                state.zoom,

            fitMode:
                state.fitMode,

            readerLight:
                state.readerLight,

            pageGlow:
                state.pageGlow,

            searchQuery:
                state.searchQuery,

            searching:
                state.searching,

            searchOpen:
                state.searchOpen,

            readingProgress:
                state.readingProgress,

            pageProgress:
                state.pageProgress,

            scrollProgress:
                state.scrollProgress,

            isMobile:
                state.isMobile,

            isTablet:
                state.isTablet,

            isDesktop:
                state.isDesktop

        };

    }


    /* =====================================================
       STATE UPDATE
    ===================================================== */

    function updateState(
        changes = {},
        emitEvent = true
    ) {

        if (
            !changes ||
            typeof changes !==
            "object"
        ) {

            return state;

        }


        Object.keys(
            changes
        ).forEach(
            key => {

                if (
                    key in state
                ) {

                    state[key] =
                        changes[key];

                }

            }
        );


        if (
            typeof R.updateReaderClasses ===
            "function"
        ) {

            R.updateReaderClasses();

        }


        if (
            typeof R.updateCSSVariables ===
            "function"
        ) {

            R.updateCSSVariables();

        }


        if (
            emitEvent
        ) {

            emit(
                "reader:state-change",
                getStateSnapshot()
            );

        }


        return state;

    }


    /* =====================================================
       ERROR HANDLER
    ===================================================== */

    function reportError(
        message,
        error = null
    ) {

        const entry = {

            message:
                String(
                    message ||
                    "Unknown reader error."
                ),

            error:
                error || null,

            timestamp:
                Date.now()

        };


        if (
            !Array.isArray(
                state.errors
            )
        ) {

            state.errors =
                [];

        }


        state.errors.push(
            entry
        );


        if (
            state.errors.length >
            20
        ) {

            state.errors.shift();

        }


        console.error(
            entry.message,
            error || ""
        );


        emit(
            "reader:error",
            entry
        );

    }


    /* =====================================================
       VISIBILITY
    ===================================================== */

    function isVisible(
        element
    ) {

        if (
            !element
        ) {

            return false;

        }


        const rect =
            element.getBoundingClientRect();


        return (
            rect.width > 0 &&
            rect.height > 0 &&
            getComputedStyle(
                element
            ).display !==
                "none" &&
            getComputedStyle(
                element
            ).visibility !==
                "hidden"
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.safeNumber =
        safeNumber;

    R.safeInteger =
        safeInteger;

    R.clamp =
        clamp;

    R.toPercent =
        toPercent;

    R.normalizePage =
        normalizePage;

    R.normalizeZoom =
        normalizeZoom;

    R.updateDeviceState =
        updateDeviceState;

    R.emit =
        emit;

    R.on =
        on;

    R.off =
        off;

    R.toggleClass =
        toggleClass;

    R.addClass =
        addClass;

    R.removeClass =
        removeClass;

    R.$ =
        query;

    R.$$ =
        queryAll;

    R.getBookIdentifier =
        getBookIdentifier;

    R.getStateSnapshot =
        getStateSnapshot;

    R.updateState =
        updateState;

    R.reportError =
        reportError;

    R.isVisible =
        isVisible;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initializeStateEngine() {

        updateDeviceState();


        state.currentPage =
            normalizePage(
                state.currentPage
            );


        state.zoom =
            normalizeZoom(
                state.zoom
            );


        emit(
            "reader:state-ready",
            getStateSnapshot()
        );


        console.log(
            "Chishti Library Reader — Part 3/14 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeStateEngine,
            {
                once: true
            }
        );

    } else {

        initializeStateEngine();

    }

})();


/* =========================================================
   END OF JAVASCRIPT PART 3 / 14
========================================================= */
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 4 / 14

   READER UI ENGINE

   - Toolbar controls
   - Menu open / close
   - Sidebar open / close
   - Overlay handling
   - Reader light
   - Page glow
   - Theme control
   - Accessible UI state
   - Mobile-friendly controls
   - Compatible with Parts 1–3
========================================================= */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader Parts 1–3 are required before Part 4."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ =
        R.$ ||
        (
            selector =>
                document.querySelector(
                    selector
                )
        );


    const $$ =
        R.$$ ||
        (
            selector =>
                Array.from(
                    document.querySelectorAll(
                        selector
                    )
                )
        );


    function getReader() {

        return (
            R.getReader?.() ||
            $(".reader")
        );

    }


    function getOverlay() {

        return (
            $(".reader-overlay") ||
            $("[data-reader-overlay]")
        );

    }


    function getSidebar() {

        return (
            $(".reader-sidebar") ||
            $("[data-reader-sidebar]")
        );

    }


    function getMenu() {

        return (
            $(".reader-menu") ||
            $("[data-reader-menu]")
        );

    }


    /* =====================================================
       UI STATE
    ===================================================== */

    state.menuOpen =
        Boolean(
            state.menuOpen
        );

    state.sidebarOpen =
        Boolean(
            state.sidebarOpen
        );

    state.overlayOpen =
        Boolean(
            state.overlayOpen
        );

    state.readerLight =
        Boolean(
            state.readerLight
        );

    state.pageGlow =
        Boolean(
            state.pageGlow
        );

    state.theme =
        state.theme ||
        "maroon-gold";


    /* =====================================================
       SAFE ARIA
    ===================================================== */

    function setExpanded(
        element,
        expanded
    ) {

        if (
            !element
        ) {

            return;

        }


        element.setAttribute(
            "aria-expanded",
            String(
                Boolean(
                    expanded
                )
            )
        );

    }


    function setHidden(
        element,
        hidden
    ) {

        if (
            !element
        ) {

            return;

        }


        element.hidden =
            Boolean(
                hidden
            );


        element.setAttribute(
            "aria-hidden",
            String(
                Boolean(
                    hidden
                )
            )
        );

    }


    /* =====================================================
       OVERLAY
    ===================================================== */

    function showOverlay() {

        const overlay =
            getOverlay();


        if (
            !overlay
        ) {

            return;

        }


        state.overlayOpen =
            true;


        overlay.classList.add(
            "is-visible",
            "open",
            "active"
        );


        setHidden(
            overlay,
            false
        );


        document.body.classList.add(
            "reader-overlay-open"
        );

    }


    function hideOverlay() {

        const overlay =
            getOverlay();


        state.overlayOpen =
            false;


        if (
            overlay
        ) {

            overlay.classList.remove(
                "is-visible",
                "open",
                "active"
            );


            setHidden(
                overlay,
                true
            );

        }


        document.body.classList.remove(
            "reader-overlay-open"
        );

    }


    function toggleOverlay() {

        if (
            state.overlayOpen
        ) {

            hideOverlay();

        } else {

            showOverlay();

        }

    }


    /* =====================================================
       MENU
    ===================================================== */

    function openMenu() {

        const menu =
            getMenu();


        state.menuOpen =
            true;


        if (
            menu
        ) {

            menu.classList.add(
                "is-open",
                "open",
                "active"
            );


            setHidden(
                menu,
                false
            );

        }


        const buttons =
            $$(
                "[data-toggle-menu]"
            );


        buttons.forEach(
            button => {

                setExpanded(
                    button,
                    true
                );

            }
        );


        showOverlay();


        R.emit?.(
            "reader:menu-open",
            {}
        );

    }


    function closeMenu() {

        const menu =
            getMenu();


        state.menuOpen =
            false;


        if (
            menu
        ) {

            menu.classList.remove(
                "is-open",
                "open",
                "active"
            );


            setHidden(
                menu,
                true
            );

        }


        $$(
            "[data-toggle-menu]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        false
                    );

                }
            );


        if (
            !state.sidebarOpen
        ) {

            hideOverlay();

        }


        R.emit?.(
            "reader:menu-close",
            {}
        );

    }


    function toggleMenu() {

        if (
            state.menuOpen
        ) {

            closeMenu();

        } else {

            openMenu();

        }

    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    function openSidebar() {

        const sidebar =
            getSidebar();


        state.sidebarOpen =
            true;


        if (
            sidebar
        ) {

            sidebar.classList.add(
                "is-open",
                "open",
                "active"
            );


            setHidden(
                sidebar,
                false
            );

        }


        $$(
            "[data-toggle-sidebar]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        true
                    );

                }
            );


        showOverlay();


        R.emit?.(
            "reader:sidebar-open",
            {}
        );

    }


    function closeSidebar() {

        const sidebar =
            getSidebar();


        state.sidebarOpen =
            false;


        if (
            sidebar
        ) {

            sidebar.classList.remove(
                "is-open",
                "open",
                "active"
            );


            setHidden(
                sidebar,
                true
            );

        }


        $$(
            "[data-toggle-sidebar]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        false
                    );

                }
            );


        if (
            !state.menuOpen
        ) {

            hideOverlay();

        }


        R.emit?.(
            "reader:sidebar-close",
            {}
        );

    }


    function toggleSidebar() {

        if (
            state.sidebarOpen
        ) {

            closeSidebar();

        } else {

            openSidebar();

        }

    }


    /* =====================================================
       CLOSE ALL TEMPORARY UI
    ===================================================== */

    function closeMenuAndSidebar() {

        state.menuOpen =
            false;

        state.sidebarOpen =
            false;


        const menu =
            getMenu();


        const sidebar =
            getSidebar();


        if (
            menu
        ) {

            menu.classList.remove(
                "is-open",
                "open",
                "active"
            );

            setHidden(
                menu,
                true
            );

        }


        if (
            sidebar
        ) {

            sidebar.classList.remove(
                "is-open",
                "open",
                "active"
            );

            setHidden(
                sidebar,
                true
            );

        }


        $$(
            "[data-toggle-menu], [data-toggle-sidebar]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        false
                    );

                }
            );


        hideOverlay();

    }


    /* =====================================================
       READER LIGHT
    ===================================================== */

    function enableReaderLight() {

        const reader =
            getReader();


        state.readerLight =
            true;


        if (
            reader
        ) {

            reader.classList.add(
                "reader-light",
                "light-mode"
            );

        }


        document.documentElement.classList.add(
            "reader-light"
        );


        localStorage.setItem(
            "chishtilib_reader_light",
            "true"
        );


        R.emit?.(
            "reader:light-change",
            {
                enabled:
                    true
            }
        );

    }


    function disableReaderLight() {

        const reader =
            getReader();


        state.readerLight =
            false;


        if (
            reader
        ) {

            reader.classList.remove(
                "reader-light",
                "light-mode"
            );

        }


        document.documentElement.classList.remove(
            "reader-light"
        );


        localStorage.setItem(
            "chishtilib_reader_light",
            "false"
        );


        R.emit?.(
            "reader:light-change",
            {
                enabled:
                    false
            }
        );

    }


    function toggleReaderLight() {

        if (
            state.readerLight
        ) {

            disableReaderLight();

        } else {

            enableReaderLight();

        }

    }


    /* =====================================================
       PAGE GLOW
    ===================================================== */

    function enablePageGlow() {

        const reader =
            getReader();


        state.pageGlow =
            true;


        if (
            reader
        ) {

            reader.classList.add(
                "page-glow"
            );

        }


        localStorage.setItem(
            "chishtilib_page_glow",
            "true"
        );


        R.emit?.(
            "reader:glow-change",
            {
                enabled:
                    true
            }
        );

    }


    function disablePageGlow() {

        const reader =
            getReader();


        state.pageGlow =
            false;


        if (
            reader
        ) {

            reader.classList.remove(
                "page-glow"
            );

        }


        localStorage.setItem(
            "chishtilib_page_glow",
            "false"
        );


        R.emit?.(
            "reader:glow-change",
            {
                enabled:
                    false
            }
        );

    }


    function togglePageGlow() {

        if (
            state.pageGlow
        ) {

            disablePageGlow();

        } else {

            enablePageGlow();

        }

    }


    /* =====================================================
       THEME
    ===================================================== */

    function applyTheme(
        theme = "maroon-gold"
    ) {

        const validThemes = [
            "maroon-gold",
            "maroon",
            "gold"
        ];


        if (
            !validThemes.includes(
                theme
            )
        ) {

            theme =
                "maroon-gold";

        }


        state.theme =
            theme;


        document.documentElement.dataset.theme =
            theme;


        document.body.dataset.theme =
            theme;


        document.documentElement.classList.remove(
            "theme-maroon-gold",
            "theme-maroon",
            "theme-gold"
        );


        document.body.classList.remove(
            "theme-maroon-gold",
            "theme-maroon",
            "theme-gold"
        );


        document.documentElement.classList.add(
            `theme-${theme}`
        );


        document.body.classList.add(
            `theme-${theme}`
        );


        /*
         * Main identity is always
         * maroon + golden.
         */

        document.documentElement.style.setProperty(
            "--primary",
            "#641b2b"
        );


        document.documentElement.style.setProperty(
            "--primary-dark",
            "#3d101b"
        );


        document.documentElement.style.setProperty(
            "--primary-deep",
            "#280a12"
        );


        document.documentElement.style.setProperty(
            "--secondary",
            "#c79a3b"
        );


        document.documentElement.style.setProperty(
            "--gold",
            "#c79a3b"
        );


        document.documentElement.style.setProperty(
            "--gold-light",
            "#e4c66a"
        );


        document.documentElement.style.setProperty(
            "--gold-dark",
            "#987126"
        );


        localStorage.setItem(
            "chishtilib_theme",
            theme
        );


        R.emit?.(
            "reader:theme-change",
            {
                theme
            }
        );

    }


    /* =====================================================
       RESTORE UI SETTINGS
    ===================================================== */

    function restoreUISettings() {

        try {

            const theme =
                localStorage.getItem(
                    "chishtilib_theme"
                );


            if (
                theme
            ) {

                applyTheme(
                    theme
                );

            } else {

                applyTheme(
                    "maroon-gold"
                );

            }


            const light =
                localStorage.getItem(
                    "chishtilib_reader_light"
                );


            if (
                light ===
                "true"
            ) {

                enableReaderLight();

            }


            const glow =
                localStorage.getItem(
                    "chishtilib_page_glow"
                );


            if (
                glow ===
                "true"
            ) {

                enablePageGlow();

            }

        } catch (
            error
        ) {

            console.warn(
                "Could not restore reader UI settings.",
                error
            );

            applyTheme(
                "maroon-gold"
            );

        }

    }


    /* =====================================================
       BUTTON STATE
    ===================================================== */

    function updateControlStates() {

        $$(
            "[data-toggle-menu]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        state.menuOpen
                    );

                }
            );


        $$(
            "[data-toggle-sidebar]"
        )
            .forEach(
                button => {

                    setExpanded(
                        button,
                        state.sidebarOpen
                    );

                }
            );


        $$(
            "[data-toggle-reader-light]"
        )
            .forEach(
                button => {

                    button.setAttribute(
                        "aria-pressed",
                        String(
                            state.readerLight
                        )
                    );

                }
            );


        $$(
            "[data-toggle-page-glow]"
        )
            .forEach(
                button => {

                    button.setAttribute(
                        "aria-pressed",
                        String(
                            state.pageGlow
                        )
                    );

                }
            );

    }


    /* =====================================================
       CLICK HANDLERS
    ===================================================== */

    function bindUIActions() {

        if (
            state.uiActionsBound
        ) {

            return;

        }


        state.uiActionsBound =
            true;


        document.addEventListener(
            "click",
            event => {

                const menuButton =
                    event.target.closest(
                        "[data-toggle-menu]"
                    );


                if (
                    menuButton
                ) {

                    event.preventDefault();

                    toggleMenu();

                    return;

                }


                const sidebarButton =
                    event.target.closest(
                        "[data-toggle-sidebar]"
                    );


                if (
                    sidebarButton
                ) {

                    event.preventDefault();

                    toggleSidebar();

                    return;

                }


                const overlay =
                    event.target.closest(
                        ".reader-overlay, [data-reader-overlay]"
                    );


                if (
                    overlay &&
                    event.target ===
                    overlay
                ) {

                    event.preventDefault();

                    closeMenuAndSidebar();

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-close-menu], [data-close-sidebar], [data-close-overlay]"
                    );


                if (
                    closeButton
                ) {

                    event.preventDefault();

                    closeMenuAndSidebar();

                    return;

                }


                const lightButton =
                    event.target.closest(
                        "[data-toggle-reader-light]"
                    );


                if (
                    lightButton
                ) {

                    event.preventDefault();

                    toggleReaderLight();

                    updateControlStates();

                    return;

                }


                const glowButton =
                    event.target.closest(
                        "[data-toggle-page-glow]"
                    );


                if (
                    glowButton
                ) {

                    event.preventDefault();

                    togglePageGlow();

                    updateControlStates();

                    return;

                }


                const themeButton =
                    event.target.closest(
                        "[data-theme]"
                    );


                if (
                    themeButton &&
                    !themeButton.closest(
                        ".reader"
                    ) === false
                ) {

                    const theme =
                        themeButton.dataset.theme;


                    if (
                        theme
                    ) {

                        applyTheme(
                            theme
                        );

                        updateControlStates();

                    }

                }

            }
        );

    }


    /* =====================================================
       KEYBOARD ESCAPE
    ===================================================== */

    function bindEscapeKey() {

        if (
            state.uiEscapeBound
        ) {

            return;

        }


        state.uiEscapeBound =
            true;


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    state.menuOpen ||
                    state.sidebarOpen ||
                    state.overlayOpen
                ) {

                    event.preventDefault();

                    closeMenuAndSidebar();

                }

            }
        );

    }


    /* =====================================================
       MOBILE MENU SAFETY
    ===================================================== */

    function bindMobileOutsideClick() {

        document.addEventListener(
            "click",
            event => {

                if (
                    !state.isMobile
                ) {

                    return;

                }


                if (
                    !state.menuOpen &&
                    !state.sidebarOpen
                ) {

                    return;

                }


                const target =
                    event.target;


                if (
                    target.closest(
                        ".reader-menu, .reader-sidebar, [data-toggle-menu], [data-toggle-sidebar]"
                    )
                ) {

                    return;

                }


                closeMenuAndSidebar();

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.openMenu =
        openMenu;

    R.closeMenu =
        closeMenu;

    R.toggleMenu =
        toggleMenu;

    R.openSidebar =
        openSidebar;

    R.closeSidebar =
        closeSidebar;

    R.toggleSidebar =
        toggleSidebar;

    R.showOverlay =
        showOverlay;

    R.hideOverlay =
        hideOverlay;

    R.toggleOverlay =
        toggleOverlay;

    R.closeMenuAndSidebar =
        closeMenuAndSidebar;

    R.enableReaderLight =
        enableReaderLight;

    R.disableReaderLight =
        disableReaderLight;

    R.toggleReaderLight =
        toggleReaderLight;

    R.enablePageGlow =
        enablePageGlow;

    R.disablePageGlow =
        disablePageGlow;

    R.togglePageGlow =
        togglePageGlow;

    R.applyTheme =
        applyTheme;

    R.restoreUISettings =
        restoreUISettings;

    R.updateControlStates =
        updateControlStates;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeUI() {

        restoreUISettings();

        bindUIActions();

        bindEscapeKey();

        bindMobileOutsideClick();

        updateControlStates();


        R.emit?.(
            "reader:ui-ready",
            {
                theme:
                    state.theme,

                readerLight:
                    state.readerLight,

                pageGlow:
                    state.pageGlow
            }
        );


        console.log(
            "Chishti Library Reader — Part 4/14 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeUI,
            {
                once: true
            }
        );

    } else {

        initializeUI();

    }

})();


/* =========================================================
   END OF JAVASCRIPT PART 4 / 14
========================================================= */
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 5 / 14

   READER TOOLBAR + CONTROL ENGINE

   - Previous / Next buttons
   - First / Last buttons
   - Zoom controls
   - Fit-to-width
   - Reset zoom
   - Fullscreen
   - Toolbar state
   - Mobile-safe controls
   - Accessible ARIA states
   - Compatible with Parts 1–4
========================================================= */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader Parts 1–4 are required before Part 5."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       STATE DEFAULTS
    ===================================================== */

    state.zoom =
        Number.isFinite(
            Number(
                state.zoom
            )
        )
            ? Number(
                state.zoom
            )
            : 1;


    state.minZoom =
        Number.isFinite(
            Number(
                state.minZoom
            )
        )
            ? Number(
                state.minZoom
            )
            : 0.5;


    state.maxZoom =
        Number.isFinite(
            Number(
                state.maxZoom
            )
        )
            ? Number(
                state.maxZoom
            )
            : 3;


    state.zoomStep =
        Number.isFinite(
            Number(
                state.zoomStep
            )
        )
            ? Number(
                state.zoomStep
            )
            : 0.1;


    state.fitMode =
        Boolean(
            state.fitMode
        );


    state.fullscreen =
        Boolean(
            state.fullscreen
        );


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ =
        R.$ ||
        (
            selector =>
                document.querySelector(
                    selector
                )
        );


    const $$ =
        R.$$ ||
        (
            selector =>
                Array.from(
                    document.querySelectorAll(
                        selector
                    )
                )
        );


    function getReader() {

        return (
            R.getReader?.() ||
            $(".reader")
        );

    }


    function getViewport() {

        return (
            R.getViewport?.() ||
            $(".reader-viewport")
        );

    }


    /* =====================================================
       NUMBER HELPERS
    ===================================================== */

    function clampZoom(
        value
    ) {

        const zoom =
            Number(
                value
            );


        if (
            !Number.isFinite(
                zoom
            )
        ) {

            return 1;

        }


        return Math.max(
            state.minZoom,
            Math.min(
                state.maxZoom,
                zoom
            )
        );

    }


    function roundZoom(
        value
    ) {

        return Math.round(
            value * 100
        ) / 100;

    }


    /* =====================================================
       ZOOM UI
    ===================================================== */

    function getZoomLabels() {

        return $$(
            ".zoom-value, [data-zoom-value]"
        );

    }


    function updateZoomUI() {

        const zoom =
            clampZoom(
                state.zoom
            );


        state.zoom =
            roundZoom(
                zoom
            );


        getZoomLabels()
            .forEach(
                element => {

                    element.textContent =
                        `${Math.round(
                            state.zoom * 100
                        )}%`;

                }
            );


        $$(
            "[data-zoom-in]"
        )
            .forEach(
                button => {

                    button.disabled =
                        state.zoom >=
                        state.maxZoom;


                    button.setAttribute(
                        "aria-disabled",
                        String(
                            button.disabled
                        )
                    );

                }
            );


        $$(
            "[data-zoom-out]"
        )
            .forEach(
                button => {

                    button.disabled =
                        state.zoom <=
                        state.minZoom;


                    button.setAttribute(
                        "aria-disabled",
                        String(
                            button.disabled
                        )
                    );

                }
            );


        $$(
            "[data-fit-width], [data-fit-page]"
        )
            .forEach(
                button => {

                    button.setAttribute(
                        "aria-pressed",
                        String(
                            state.fitMode
                        )
                    );

                }
            );


        document.documentElement.style.setProperty(
            "--reader-zoom",
            String(
                state.zoom
            )
        );


        R.emit?.(
            "reader:zoom-ui-update",
            {
                zoom:
                    state.zoom,

                fitMode:
                    state.fitMode
            }
        );

    }


    /* =====================================================
       APPLY ZOOM
    ===================================================== */

    function applyZoom(
        zoom,
        options = {}
    ) {

        let target =
            clampZoom(
                zoom
            );


        target =
            roundZoom(
                target
            );


        state.zoom =
            target;


        if (
            options.keepFit !==
            undefined
        ) {

            state.fitMode =
                Boolean(
                    options.keepFit
                );

        }


        const reader =
            getReader();


        const viewport =
            getViewport();


        if (
            reader
        ) {

            reader.style.setProperty(
                "--reader-zoom",
                String(
                    target
                )
            );

            reader.style.setProperty(
                "--page-scale",
                String(
                    target
                )
            );

        }


        if (
            viewport
        ) {

            viewport.style.setProperty(
                "--reader-zoom",
                String(
                    target
                )
            );

        }


        /*
         * Apply transform only when the
         * page renderer has not supplied
         * its own zoom implementation.
         */

        const pages =
            $$(
                ".reader-page, [data-reader-page]"
            );


        pages.forEach(
            page => {

                if (
                    page.dataset.zoomManaged !==
                    "true"
                ) {

                    page.style.setProperty(
                        "--page-scale",
                        String(
                            target
                        )
                    );

                }

            }
        );


        updateZoomUI();


        if (
            typeof R.updateCSSVariables ===
            "function"
        ) {

            R.updateCSSVariables();

        }


        R.emit?.(
            "reader:zoom-change",
            {
                zoom:
                    target,

                fitMode:
                    state.fitMode
            }
        );


        return target;

    }


    /* =====================================================
       ZOOM IN
    ===================================================== */

    function zoomIn() {

        const next =
            roundZoom(
                state.zoom +
                state.zoomStep
            );


        return applyZoom(
            next,
            {
                keepFit:
                    false
            }
        );

    }


    /* =====================================================
       ZOOM OUT
    ===================================================== */

    function zoomOut() {

        const next =
            roundZoom(
                state.zoom -
                state.zoomStep
            );


        return applyZoom(
            next,
            {
                keepFit:
                    false
            }
        );

    }


    /* =====================================================
       RESET ZOOM
    ===================================================== */

    function resetZoom() {

        return applyZoom(
            1,
            {
                keepFit:
                    false
            }
        );

    }


    /* =====================================================
       FIT WIDTH
    ===================================================== */

    function calculateFitZoom() {

        const viewport =
            getViewport();


        const page =
            document.querySelector(
                ".reader-page, [data-reader-page]"
            );


        if (
            !viewport ||
            !page
        ) {

            return 1;

        }


        const viewportWidth =
            viewport.clientWidth;


        const pageWidth =
            page.scrollWidth ||
            page.offsetWidth ||
            page.clientWidth;


        if (
            viewportWidth <= 0 ||
            pageWidth <= 0
        ) {

            return 1;

        }


        /*
         * Leave a small amount of space
         * around the page.
         */

        const available =
            Math.max(
                100,
                viewportWidth - 20
            );


        return clampZoom(
            available /
            pageWidth
        );

    }


    function fitWidth() {

        const calculated =
            calculateFitZoom();


        state.fitMode =
            true;


        return applyZoom(
            calculated,
            {
                keepFit:
                    true
            }
        );

    }


    function toggleFitWidth() {

        if (
            state.fitMode
        ) {

            state.fitMode =
                false;


            return applyZoom(
                1,
                {
                    keepFit:
                        false
                }
            );

        }


        return fitWidth();

    }


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    async function enterFullscreen() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return false;

        }


        try {

            if (
                document.fullscreenElement
            ) {

                return true;

            }


            if (
                reader.requestFullscreen
            ) {

                await reader.requestFullscreen();

                state.fullscreen =
                    true;


                return true;

            }

        } catch (
            error
        ) {

            console.warn(
                "Fullscreen could not be enabled.",
                error
            );

        }


        return false;

    }


    async function exitFullscreen() {

        try {

            if (
                document.fullscreenElement &&
                document.exitFullscreen
            ) {

                await document.exitFullscreen();

            }

            state.fullscreen =
                false;


            return true;

        } catch (
            error
        ) {

            console.warn(
                "Fullscreen could not be closed.",
                error
            );

            return false;

        }

    }


    async function toggleFullscreen() {

        if (
            document.fullscreenElement
        ) {

            return exitFullscreen();

        }


        return enterFullscreen();

    }


    function bindFullscreenChange() {

        document.addEventListener(
            "fullscreenchange",
            () => {

                state.fullscreen =
                    Boolean(
                        document.fullscreenElement
                    );


                $$(
                    "[data-fullscreen]"
                )
                    .forEach(
                        button => {

                            button.setAttribute(
                                "aria-pressed",
                                String(
                                    state.fullscreen
                                )
                            );

                        }
                    );


                R.emit?.(
                    "reader:fullscreen-change",
                    {
                        fullscreen:
                            state.fullscreen
                    }
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION CONTROL STATE
    ===================================================== */

    function updateNavigationControls() {

        const current =
            Number(
                state.currentPage
            ) || 1;


        const total =
            Number(
                state.totalPages
            ) || 0;


        const first =
            current <= 1;


        const last =
            total > 0 &&
            current >= total;


        $$(
            "[data-page-prev], [data-action='previous-page']"
        )
            .forEach(
                button => {

                    button.disabled =
                        first;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            first
                        )
                    );

                }
            );


        $$(
            "[data-page-next], [data-action='next-page']"
        )
            .forEach(
                button => {

                    button.disabled =
                        last;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            last
                        )
                    );

                }
            );


        $$(
            "[data-page-first]"
        )
            .forEach(
                button => {

                    button.disabled =
                        first;

                }
            );


        $$(
            "[data-page-last]"
        )
            .forEach(
                button => {

                    button.disabled =
                        last;

                }
            );

    }


    /* =====================================================
       TOOLBAR VISIBILITY
    ===================================================== */

    function showToolbar() {

        const reader =
            getReader();


        if (
            reader
        ) {

            reader.classList.add(
                "toolbar-visible"
            );

        }


        $$(
            ".reader-toolbar, [data-reader-toolbar]"
        )
            .forEach(
                toolbar => {

                    toolbar.classList.add(
                        "is-visible"
                    );

                }
            );

    }


    function hideToolbar() {

        const reader =
            getReader();


        if (
            reader
        ) {

            reader.classList.remove(
                "toolbar-visible"
            );

        }


        $$(
            ".reader-toolbar, [data-reader-toolbar]"
        )
            .forEach(
                toolbar => {

                    toolbar.classList.remove(
                        "is-visible"
                    );

                }
            );

    }


    function toggleToolbar() {

        const reader =
            getReader();


        if (
            reader?.classList.contains(
                "toolbar-visible"
            )
        ) {

            hideToolbar();

        } else {

            showToolbar();

        }

    }


    /* =====================================================
       BUTTON CLICK ENGINE
    ===================================================== */

    function bindToolbarActions() {

        if (
            state.toolbarActionsBound
        ) {

            return;

        }


        state.toolbarActionsBound =
            true;


        document.addEventListener(
            "click",
            event => {

                const zoomInButton =
                    event.target.closest(
                        "[data-zoom-in]"
                    );


                if (
                    zoomInButton
                ) {

                    event.preventDefault();

                    zoomIn();

                    return;

                }


                const zoomOutButton =
                    event.target.closest(
                        "[data-zoom-out]"
                    );


                if (
                    zoomOutButton
                ) {

                    event.preventDefault();

                    zoomOut();

                    return;

                }


                const resetButton =
                    event.target.closest(
                        "[data-zoom-reset], [data-reset-zoom]"
                    );


                if (
                    resetButton
                ) {

                    event.preventDefault();

                    resetZoom();

                    return;

                }


                const fitButton =
                    event.target.closest(
                        "[data-fit-width], [data-fit-page]"
                    );


                if (
                    fitButton
                ) {

                    event.preventDefault();

                    toggleFitWidth();

                    return;

                }


                const fullscreenButton =
                    event.target.closest(
                        "[data-fullscreen]"
                    );


                if (
                    fullscreenButton
                ) {

                    event.preventDefault();

                    toggleFullscreen();

                    return;

                }


                const toolbarButton =
                    event.target.closest(
                        "[data-toggle-toolbar]"
                    );


                if (
                    toolbarButton
                ) {

                    event.preventDefault();

                    toggleToolbar();

                    return;

                }

            }
        );

    }


    /* =====================================================
       KEYBOARD ZOOM
    ===================================================== */

    function bindKeyboardControls() {

        if (
            state.toolbarKeyboardBound
        ) {

            return;

        }


        state.toolbarKeyboardBound =
            true;


        document.addEventListener(
            "keydown",
            event => {

                const target =
                    event.target;


                if (
                    target &&
                    (
                        target.matches(
                            "input, textarea, select"
                        ) ||
                        target.isContentEditable
                    )
                ) {

                    return;

                }


                if (
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    if (
                        event.key ===
                        "+"
                    ) {

                        event.preventDefault();

                        zoomIn();

                    }


                    if (
                        event.key ===
                        "-"
                    ) {

                        event.preventDefault();

                        zoomOut();

                    }


                    if (
                        event.key ===
                        "0"
                    ) {

                        event.preventDefault();

                        resetZoom();

                    }

                }

            }
        );

    }


    /* =====================================================
       RESIZE FIT
    ===================================================== */

    let fitResizeTimer =
        null;


    function handleToolbarResize() {

        if (
            !state.fitMode
        ) {

            return;

        }


        clearTimeout(
            fitResizeTimer
        );


        fitResizeTimer =
            setTimeout(
                () => {

                    fitWidth();

                },
                150
            );

    }


    function bindResize() {

        if (
            state.toolbarResizeBound
        ) {

            return;

        }


        state.toolbarResizeBound =
            true;


        window.addEventListener(
            "resize",
            handleToolbarResize,
            {
                passive: true
            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.applyZoom =
        applyZoom;

    R.zoomIn =
        zoomIn;

    R.zoomOut =
        zoomOut;

    R.resetZoom =
        resetZoom;

    R.fitWidth =
        fitWidth;

    R.toggleFitWidth =
        toggleFitWidth;

    R.updateZoomUI =
        updateZoomUI;

    R.enterFullscreen =
        enterFullscreen;

    R.exitFullscreen =
        exitFullscreen;

    R.toggleFullscreen =
        toggleFullscreen;

    R.updateNavigationControls =
        updateNavigationControls;

    R.showToolbar =
        showToolbar;

    R.hideToolbar =
        hideToolbar;

    R.toggleToolbar =
        toggleToolbar;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeToolbar() {

        state.zoom =
            clampZoom(
                state.zoom
            );


        bindToolbarActions();

        bindKeyboardControls();

        bindFullscreenChange();

        bindResize();


        updateZoomUI();

        updateNavigationControls();


        R.emit?.(
            "reader:toolbar-ready",
            {
                zoom:
                    state.zoom,

                fitMode:
                    state.fitMode
            }
        );


        console.log(
            "Chishti Library Reader — Part 5/14 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeToolbar,
            {
                once: true
            }
        );

    } else {

        initializeToolbar();

    }

})();


/* =========================================================
   END OF JAVASCRIPT PART 5 / 14
========================================================= */
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 6 / 14
   PAGE NAVIGATION + PAGE STATE + READER VIEW
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CORE CHECK
    ===================================================== */

    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader core missing — Part 6."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getReader() {

        return document.querySelector(
            ".reader"
        );

    }


    function getViewport() {

        return document.querySelector(
            ".reader-viewport"
        );

    }


    function getStage() {

        return document.querySelector(
            ".page-stage"
        );

    }


    function getPages() {

        const stage =
            getStage();


        if (!stage) {

            return [];

        }


        return [
            ...stage.querySelectorAll(
                ".reader-page"
            )
        ];

    }


    function getPage(
        pageNumber
    ) {

        const pages =
            getPages();


        return pages[
            pageNumber - 1
        ] || null;

    }


    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    function safeNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    }


    /* =====================================================
       PAGE COUNT
    ===================================================== */

    function getTotalPages() {

        const pages =
            getPages();


        if (
            pages.length > 0
        ) {

            state.totalPages =
                pages.length;

        }


        return safeNumber(
            state.totalPages,
            0
        );

    }


    /* =====================================================
       CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        const total =
            getTotalPages();


        let page =
            safeNumber(
                state.currentPage,
                1
            );


        if (
            page < 1
        ) {

            page = 1;

        }


        if (
            total > 0 &&
            page > total
        ) {

            page = total;

        }


        state.currentPage =
            page;


        return page;

    }


    /* =====================================================
       UPDATE PAGE CLASSES
    ===================================================== */

    function updatePageClasses() {

        const pages =
            getPages();


        const current =
            getCurrentPage();


        pages.forEach(
            (page, index) => {

                const number =
                    index + 1;


                const active =
                    number === current;


                page.classList.toggle(
                    "active",
                    active
                );


                page.classList.toggle(
                    "current",
                    active
                );


                page.classList.toggle(
                    "previous",
                    number < current
                );


                page.classList.toggle(
                    "next",
                    number > current
                );


                page.setAttribute(
                    "aria-hidden",
                    active
                        ? "false"
                        : "true"
                );


                if (active) {

                    page.dataset.pageActive =
                        "true";

                } else {

                    delete page.dataset.pageActive;

                }

            }
        );

    }


    /* =====================================================
       UPDATE PAGE COUNTER
    ===================================================== */

    function updatePageCounter() {

        const current =
            getCurrentPage();


        const total =
            getTotalPages();


        const inputs =
            document.querySelectorAll(
                ".page-counter input, [data-current-page]"
            );


        inputs.forEach(
            element => {

                if (
                    element.tagName ===
                    "INPUT"
                ) {

                    element.value =
                        current;

                } else {

                    element.textContent =
                        current;

                }

            }
        );


        const totals =
            document.querySelectorAll(
                ".page-total, [data-total-pages]"
            );


        totals.forEach(
            element => {

                element.textContent =
                    total || 1;

            }
        );


        const labels =
            document.querySelectorAll(
                ".page-counter, [data-page-counter]"
            );


        labels.forEach(
            element => {

                if (
                    element.children.length ===
                    0
                ) {

                    element.textContent =
                        `${current} / ${total || 1}`;

                }

            }
        );

    }


    /* =====================================================
       UPDATE NAVIGATION BUTTONS
    ===================================================== */

    function updateNavigationButtons() {

        const current =
            getCurrentPage();


        const total =
            getTotalPages();


        const previousButtons =
            document.querySelectorAll(
                "[data-action='previous-page'], .previous-page"
            );


        const nextButtons =
            document.querySelectorAll(
                "[data-action='next-page'], .next-page"
            );


        previousButtons.forEach(
            button => {

                button.disabled =
                    current <= 1;


                button.setAttribute(
                    "aria-disabled",
                    current <= 1
                        ? "true"
                        : "false"
                );

            }
        );


        nextButtons.forEach(
            button => {

                button.disabled =
                    total > 0 &&
                    current >= total;


                button.setAttribute(
                    "aria-disabled",
                    total > 0 &&
                    current >= total
                        ? "true"
                        : "false"
                );

            }
        );

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updatePageProgress() {

        const current =
            getCurrentPage();


        const total =
            getTotalPages();


        const percentage =
            total > 0
                ? (
                    current /
                    total
                ) * 100
                : 0;


        state.readingProgress =
            Math.max(
                0,
                Math.min(
                    1,
                    percentage / 100
                )
            );


        const fills =
            document.querySelectorAll(
                ".reader-progress-fill, [data-progress-fill]"
            );


        fills.forEach(
            fill => {

                fill.style.width =
                    `${percentage}%`;

            }
        );


        const values =
            document.querySelectorAll(
                ".progress-value, [data-progress-percent]"
            );


        values.forEach(
            value => {

                value.textContent =
                    `${Math.round(
                        percentage
                    )}%`;

            }
        );

    }


    /* =====================================================
       UPDATE ALL PAGE UI
    ===================================================== */

    function updatePageUI() {

        updatePageClasses();

        updatePageCounter();

        updateNavigationButtons();

        updatePageProgress();

    }


    /* =====================================================
       SCROLL TO PAGE
    ===================================================== */

    function scrollToPage(
        pageNumber,
        behavior = "smooth"
    ) {

        const page =
            getPage(
                pageNumber
            );


        const viewport =
            getViewport();


        if (
            !page ||
            !viewport
        ) {

            return false;

        }


        try {

            page.scrollIntoView({
                behavior:
                    behavior,
                block:
                    "center",
                inline:
                    "center"
            });


            return true;

        } catch (_) {

            try {

                page.scrollIntoView();

                return true;

            } catch (
                error
            ) {

                console.warn(
                    "Could not scroll to page.",
                    error
                );

                return false;

            }

        }

    }


    /* =====================================================
       GO TO PAGE
    ===================================================== */

    async function goToPage(
        pageNumber,
        options = {}
    ) {

        const total =
            getTotalPages();


        let page =
            safeNumber(
                pageNumber,
                1
            );


        page =
            Math.floor(
                page
            );


        if (
            page < 1
        ) {

            page = 1;

        }


        if (
            total > 0 &&
            page > total
        ) {

            page =
                total;

        }


        const previous =
            state.currentPage;


        state.currentPage =
            page;


        updatePageUI();


        /*
         * Scroll only when a matching
         * rendered page exists.
         */

        scrollToPage(
            page,
            options.behavior ||
                "smooth"
        );


        /*
         * Notify other reader modules.
         */

        if (
            previous !== page
        ) {

            document.dispatchEvent(
                new CustomEvent(
                    "chishtilib:pagechange",
                    {
                        detail: {
                            page:
                                page,
                            previousPage:
                                previous,
                            totalPages:
                                total
                        }
                    }
                )
            );

        }


        /*
         * Allow progress/search/bookmark
         * modules to react.
         */

        if (
            !options.notify
        ) {

            return page;

        }


        return page;

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    async function nextPage() {

        const current =
            getCurrentPage();


        const total =
            getTotalPages();


        if (
            total > 0 &&
            current >= total
        ) {

            return false;

        }


        await goToPage(
            current + 1
        );


        return true;

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    async function previousPage() {

        const current =
            getCurrentPage();


        if (
            current <= 1
        ) {

            return false;

        }


        await goToPage(
            current - 1
        );


        return true;

    }


    /* =====================================================
       FIRST PAGE
    ===================================================== */

    async function firstPage() {

        await goToPage(
            1
        );

    }


    /* =====================================================
       LAST PAGE
    ===================================================== */

    async function lastPage() {

        const total =
            getTotalPages();


        if (
            total > 0
        ) {

            await goToPage(
                total
            );

        }

    }


    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function bindPageInput() {

        document.addEventListener(
            "keydown",
            event => {

                const input =
                    event.target.closest(
                        ".page-counter input, [data-page-input]"
                    );


                if (
                    !input
                ) {

                    return;

                }


                if (
                    event.key !==
                    "Enter"
                ) {

                    return;

                }


                event.preventDefault();


                const page =
                    safeNumber(
                        input.value,
                        state.currentPage
                    );


                goToPage(
                    page
                );

            }
        );


        document.addEventListener(
            "change",
            event => {

                const input =
                    event.target.closest(
                        ".page-counter input, [data-page-input]"
                    );


                if (
                    !input
                ) {

                    return;

                }


                const page =
                    safeNumber(
                        input.value,
                        state.currentPage
                    );


                goToPage(
                    page
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION CLICK EVENTS
    ===================================================== */

    function bindPageNavigation() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (
                    !button
                ) {

                    return;

                }


                const action =
                    button.dataset.action;


                switch (
                    action
                ) {

                    case "previous-page":

                        event.preventDefault();

                        previousPage();

                        break;


                    case "next-page":

                        event.preventDefault();

                        nextPage();

                        break;


                    case "first-page":

                        event.preventDefault();

                        firstPage();

                        break;


                    case "last-page":

                        event.preventDefault();

                        lastPage();

                        break;


                    default:

                        break;

                }

            }
        );

    }


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    function bindKeyboardNavigation() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    state.keyboardNavigation ===
                    false
                ) {

                    return;

                }


                /*
                 * Don't hijack typing fields.
                 */

                const target =
                    event.target;


                if (
                    target &&
                    (
                        target.matches(
                            "input, textarea, select"
                        ) ||
                        target.isContentEditable
                    )
                ) {

                    return;

                }


                if (
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    return;

                }


                switch (
                    event.key
                ) {

                    case "ArrowRight":

                    case "PageDown":

                        event.preventDefault();

                        nextPage();

                        break;


                    case "ArrowLeft":

                    case "PageUp":

                        event.preventDefault();

                        previousPage();

                        break;


                    case "Home":

                        if (
                            state.isReaderOpen !==
                            false
                        ) {

                            event.preventDefault();

                            firstPage();

                        }

                        break;


                    case "End":

                        if (
                            state.isReaderOpen !==
                            false
                        ) {

                            event.preventDefault();

                            lastPage();

                        }

                        break;


                    default:

                        break;

                }

            }
        );

    }


    /* =====================================================
       DETECT PAGE FROM SCROLL POSITION
    ===================================================== */

    function detectCurrentPage() {

        const viewport =
            getViewport();


        const pages =
            getPages();


        if (
            !viewport ||
            pages.length === 0
        ) {

            return;

        }


        const viewportRect =
            viewport.getBoundingClientRect();


        const center =
            viewportRect.top +
            (
                viewportRect.height /
                2
            );


        let closestPage =
            state.currentPage;


        let closestDistance =
            Infinity;


        pages.forEach(
            (page, index) => {

                const rect =
                    page.getBoundingClientRect();


                const pageCenter =
                    rect.top +
                    (
                        rect.height /
                        2
                    );


                const distance =
                    Math.abs(
                        pageCenter -
                        center
                    );


                if (
                    distance <
                    closestDistance
                ) {

                    closestDistance =
                        distance;


                    closestPage =
                        index + 1;

                }

            }
        );


        if (
            closestPage !==
            state.currentPage
        ) {

            state.currentPage =
                closestPage;


            updatePageUI();


            document.dispatchEvent(
                new CustomEvent(
                    "chishtilib:pagechange",
                    {
                        detail: {
                            page:
                                closestPage,
                            totalPages:
                                pages.length
                        }
                    }
                )
            );

        }

    }


    /* =====================================================
       SCROLL LISTENER
    ===================================================== */

    let scrollTimer =
        null;


    function bindScrollDetection() {

        const viewport =
            getViewport();


        if (
            !viewport
        ) {

            return;

        }


        if (
            viewport.dataset.pageDetectionBound ===
            "true"
        ) {

            return;

        }


        viewport.dataset.pageDetectionBound =
            "true";


        viewport.addEventListener(
            "scroll",
            () => {

                clearTimeout(
                    scrollTimer
                );


                scrollTimer =
                    window.setTimeout(
                        () => {

                            detectCurrentPage();

                        },
                        80
                    );

            },
            {
                passive:
                    true
            }
        );

    }


    /* =====================================================
       PAGE CLICK
    ===================================================== */

    function bindPageClicks() {

        document.addEventListener(
            "click",
            event => {

                const page =
                    event.target.closest(
                        ".reader-page"
                    );


                if (
                    !page
                ) {

                    return;

                }


                const pages =
                    getPages();


                const index =
                    pages.indexOf(
                        page
                    );


                if (
                    index < 0
                ) {

                    return;

                }


                const pageNumber =
                    index + 1;


                if (
                    pageNumber !==
                    state.currentPage
                ) {

                    goToPage(
                        pageNumber
                    );

                }

            }
        );

    }


    /* =====================================================
       OBSERVE PAGE DOM
    ===================================================== */

    function observePages() {

        const stage =
            getStage();


        if (
            !stage
        ) {

            return;

        }


        if (
            state.pageObserver
        ) {

            try {

                state.pageObserver.disconnect();

            } catch (_) {}

        }


        const observer =
            new MutationObserver(
                () => {

                    requestAnimationFrame(
                        () => {

                            getTotalPages();

                            updatePageUI();

                            bindScrollDetection();

                        }
                    );

                }
            );


        observer.observe(
            stage,
            {
                childList:
                    true,
                subtree:
                    true
            }
        );


        state.pageObserver =
            observer;

    }


    /* =====================================================
       PAGE INITIALIZATION
    ===================================================== */

    function initializePages() {

        getTotalPages();


        if (
            !state.currentPage ||
            state.currentPage < 1
        ) {

            state.currentPage =
                1;

        }


        updatePageUI();

        bindPageInput();

        bindPageNavigation();

        bindKeyboardNavigation();

        bindPageClicks();

        bindScrollDetection();

        observePages();


        console.log(
            "Chishti Library Reader — Part 6 loaded."
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.getTotalPages =
        getTotalPages;


    R.getCurrentPage =
        getCurrentPage;


    R.goToPage =
        goToPage;


    R.nextPage =
        nextPage;


    R.previousPage =
        previousPage;


    R.firstPage =
        firstPage;


    R.lastPage =
        lastPage;


    R.updatePageUI =
        updatePageUI;


    R.updatePageProgress =
        updatePageProgress;


    R.scrollToPage =
        scrollToPage;


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePages,
            {
                once:
                    true
            }
        );

    } else {

        initializePages();

    }


    /* =====================================================
       CHISHTI LIBRARY READER
       JAVASCRIPT PART 6 / 14
       END
       ===================================================== */

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 7 / 14

   READER SEARCH ENGINE
   - Search input handling
   - Search results
   - Page matching
   - Safe text extraction
   - Highlighting
   - Keyboard navigation
   - Clear search
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CORE
    ===================================================== */

    const R =
        window.ChishtiReader;

    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader core missing — Part 7."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       SEARCH STATE
    ===================================================== */

    state.searchQuery =
        state.searchQuery || "";

    state.searchResults =
        Array.isArray(
            state.searchResults
        )
            ? state.searchResults
            : [];

    state.currentSearchIndex =
        Number.isInteger(
            state.currentSearchIndex
        )
            ? state.currentSearchIndex
            : -1;

    state.searching =
        false;

    state.searchTimer =
        null;

    state.searchBound =
        false;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getSearchInput() {

        return (
            document.querySelector(
                ".search-input-wrap input"
            ) ||
            document.querySelector(
                ".search-input"
            ) ||
            document.querySelector(
                "[data-search-input]"
            )
        );

    }


    function getSearchResultsContainer() {

        return (
            document.querySelector(
                ".search-results"
            ) ||
            document.querySelector(
                "[data-search-results]"
            )
        );

    }


    function getSearchClearButton() {

        return (
            document.querySelector(
                ".search-clear"
            ) ||
            document.querySelector(
                "[data-search-clear]"
            )
        );

    }


    function getSearchPreviousButton() {

        return (
            document.querySelector(
                "[data-search-previous]"
            ) ||
            document.querySelector(
                ".search-prev"
            )
        );

    }


    function getSearchNextButton() {

        return (
            document.querySelector(
                "[data-search-next]"
            ) ||
            document.querySelector(
                ".search-next"
            )
        );

    }


    function getSearchCountElement() {

        return (
            document.querySelector(
                ".search-count"
            ) ||
            document.querySelector(
                "[data-search-count]"
            )
        );

    }


    /* =====================================================
       READER / PAGES
    ===================================================== */

    function getReader() {

        if (
            typeof R.getReader ===
            "function"
        ) {

            return R.getReader();

        }


        return document.querySelector(
            ".reader"
        );

    }


    function getPageStage() {

        if (
            typeof R.getPageStage ===
            "function"
        ) {

            return R.getPageStage();

        }


        return document.querySelector(
            ".page-stage"
        );

    }


    function getPages() {

        const stage =
            getPageStage();


        if (!stage) {

            return [];

        }


        return [
            ...stage.querySelectorAll(
                ".reader-page"
            )
        ];

    }


    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalizeText(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       SEARCHABLE TEXT
    ===================================================== */

    function getPageText(
        page
    ) {

        if (!page) {

            return "";

        }


        /*
         * Prefer explicit searchable text.
         */

        const explicitText =
            page.dataset.searchText ||
            page.getAttribute(
                "data-text"
            );


        if (
            explicitText
        ) {

            return String(
                explicitText
            );

        }


        /*
         * Clone page so UI controls,
         * buttons and navigation don't
         * pollute search text.
         */

        const clone =
            page.cloneNode(
                true
            );


        clone.querySelectorAll(
            "button, input, textarea, select, script, style, .no-search, [data-no-search]"
        )
            .forEach(
                element => {

                    element.remove();

                }
            );


        return String(
            clone.textContent || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }


    /* =====================================================
       FIND MATCH POSITION
    ===================================================== */

    function findMatchIndex(
        text,
        query
    ) {

        const normalizedText =
            normalizeText(
                text
            );


        const normalizedQuery =
            normalizeText(
                query
            );


        if (
            !normalizedQuery
        ) {

            return -1;

        }


        return normalizedText.indexOf(
            normalizedQuery
        );

    }


    /* =====================================================
       CREATE SEARCH RESULT
    ===================================================== */

    function createSearchResult(
        page,
        pageIndex,
        query
    ) {

        const text =
            getPageText(
                page
            );


        if (!text) {

            return null;

        }


        const matchIndex =
            findMatchIndex(
                text,
                query
            );


        if (
            matchIndex === -1
        ) {

            return null;

        }


        const cleanText =
            text.replace(
                /\s+/g,
                " "
            );


        const start =
            Math.max(
                0,
                matchIndex - 70
            );


        const end =
            Math.min(
                cleanText.length,
                matchIndex +
                String(query).length +
                110
            );


        let snippet =
            cleanText.slice(
                start,
                end
            );


        if (
            start > 0
        ) {

            snippet =
                "…" +
                snippet;

        }


        if (
            end <
            cleanText.length
        ) {

            snippet +=
                "…";

        }


        return {

            pageIndex,

            page:
                pageIndex + 1,

            text:
                cleanText,

            snippet,

            query:
                String(query),

            matchIndex,

            element:
                page

        };

    }


    /* =====================================================
       SEARCH ALL PAGES
    ===================================================== */

    function performSearch(
        query
    ) {

        const cleanQuery =
            String(
                query ?? ""
            ).trim();


        state.searchQuery =
            cleanQuery;


        state.searchResults =
            [];

        state.currentSearchIndex =
            -1;


        if (
            !cleanQuery
        ) {

            renderSearchResults();

            updateSearchUI();

            return [];

        }


        state.searching =
            true;


        const pages =
            getPages();


        pages.forEach(
            (
                page,
                index
            ) => {

                const result =
                    createSearchResult(
                        page,
                        index,
                        cleanQuery
                    );


                if (
                    result
                ) {

                    state.searchResults.push(
                        result
                    );

                }

            }
        );


        state.searching =
            false;


        if (
            state.searchResults.length
        ) {

            state.currentSearchIndex =
                0;

        }


        renderSearchResults();

        updateSearchUI();


        return state.searchResults;

    }


    /* =====================================================
       SEARCH CURRENT PAGE ONLY
    ===================================================== */

    function searchCurrentPage(
        query
    ) {

        const pages =
            getPages();


        const currentPage =
            Number(
                state.currentPage || 1
            );


        const page =
            pages[
                Math.max(
                    0,
                    currentPage - 1
                )
            ];


        if (!page) {

            return null;

        }


        return createSearchResult(
            page,
            currentPage - 1,
            query
        );

    }


    /* =====================================================
       RENDER SEARCH RESULTS
    ===================================================== */

    function renderSearchResults() {

        const container =
            getSearchResultsContainer();


        if (!container) {

            return;

        }


        container.innerHTML =
            "";


        const results =
            state.searchResults;


        if (
            !state.searchQuery
        ) {

            container.innerHTML = `
                <div class="search-empty">
                    <span>Search the book</span>
                </div>
            `;

            return;

        }


        if (
            !results.length
        ) {

            container.innerHTML = `
                <div class="search-empty">
                    <span>No results found</span>
                </div>
            `;

            return;

        }


        results.forEach(
            (
                result,
                index
            ) => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "search-result";


                if (
                    index ===
                    state.currentSearchIndex
                ) {

                    item.classList.add(
                        "active"
                    );

                }


                item.dataset.searchIndex =
                    String(index);


                const snippet =
                    createHighlightedSnippet(
                        result.snippet,
                        result.query
                    );


                item.innerHTML = `
                    <span class="search-result-page">
                        Page ${escapeHTML(result.page)}
                    </span>

                    <span class="search-result-text">
                        ${snippet}
                    </span>
                `;


                item.addEventListener(
                    "click",
                    () => {

                        selectSearchResult(
                            index
                        );

                    }
                );


                container.appendChild(
                    item
                );

            }
        );

    }


    /* =====================================================
       HIGHLIGHT SEARCH QUERY
    ===================================================== */

    function createHighlightedSnippet(
        text,
        query
    ) {

        const source =
            String(
                text ?? ""
            );


        const cleanQuery =
            String(
                query ?? ""
            ).trim();


        if (
            !cleanQuery
        ) {

            return escapeHTML(
                source
            );

        }


        const escapedQuery =
            cleanQuery.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


        const regex =
            new RegExp(
                `(${escapedQuery})`,
                "gi"
            );


        const parts =
            source.split(
                regex
            );


        return parts
            .map(
                (
                    part,
                    index
                ) => {

                    if (
                        index % 2 === 1
                    ) {

                        return `
                            <mark class="search-highlight">
                                ${escapeHTML(part)}
                            </mark>
                        `;

                    }


                    return escapeHTML(
                        part
                    );

                }
            )
            .join("");

    }


    /* =====================================================
       SELECT RESULT
    ===================================================== */

    async function selectSearchResult(
        index
    ) {

        const results =
            state.searchResults;


        if (
            !results.length
        ) {

            return;

        }


        const safeIndex =
            Math.max(
                0,
                Math.min(
                    index,
                    results.length - 1
                )
            );


        const result =
            results[
                safeIndex
            ];


        if (!result) {

            return;

        }


        state.currentSearchIndex =
            safeIndex;


        renderSearchResults();

        updateSearchUI();


        await goToSearchPage(
            result.page
        );


        highlightSearchResult(
            result
        );

    }


    /* =====================================================
       GO TO SEARCH PAGE
    ===================================================== */

    async function goToSearchPage(
        page
    ) {

        const targetPage =
            Math.max(
                1,
                Number(page) || 1
            );


        /*
         * Use reader's existing API
         * if available.
         */

        if (
            typeof R.goToPage ===
            "function"
        ) {

            try {

                await R.goToPage(
                    targetPage,
                    {
                        notify:
                            false
                    }
                );


                return true;

            } catch (error) {

                console.warn(
                    "Search page navigation failed.",
                    error
                );

            }

        }


        /*
         * Fallback for the rewritten reader.
         */

        if (
            typeof R.setPage ===
            "function"
        ) {

            try {

                await R.setPage(
                    targetPage
                );


                return true;

            } catch (error) {

                console.warn(
                    "Search fallback navigation failed.",
                    error
                );

            }

        }


        state.currentPage =
            targetPage;


        if (
            typeof R.updatePageUI ===
            "function"
        ) {

            R.updatePageUI();

        }


        return true;

    }


    /* =====================================================
       HIGHLIGHT RESULT ON PAGE
    ===================================================== */

    function highlightSearchResult(
        result
    ) {

        if (
            !result ||
            !result.element
        ) {

            return;

        }


        const page =
            result.element;


        page.classList.add(
            "search-result-page-active"
        );


        window.setTimeout(
            () => {

                page.classList.remove(
                    "search-result-page-active"
                );

            },
            1200
        );


        /*
         * Scroll page into view without
         * destroying reader scroll position.
         */

        try {

            page.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center",

                inline:
                    "nearest"
            });

        } catch (_) {}

    }


    /* =====================================================
       NEXT SEARCH RESULT
    ===================================================== */

    function nextSearchResult() {

        const results =
            state.searchResults;


        if (
            !results.length
        ) {

            return;

        }


        let next =
            state.currentSearchIndex + 1;


        if (
            next >=
            results.length
        ) {

            next = 0;

        }


        selectSearchResult(
            next
        );

    }


    /* =====================================================
       PREVIOUS SEARCH RESULT
    ===================================================== */

    function previousSearchResult() {

        const results =
            state.searchResults;


        if (
            !results.length
        ) {

            return;

        }


        let previous =
            state.currentSearchIndex - 1;


        if (
            previous < 0
        ) {

            previous =
                results.length - 1;

        }


        selectSearchResult(
            previous
        );

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

        const input =
            getSearchInput();


        if (input) {

            input.value =
                "";

        }


        state.searchQuery =
            "";

        state.searchResults =
            [];

        state.currentSearchIndex =
            -1;


        renderSearchResults();

        updateSearchUI();


        clearPageSearchHighlights();

    }


    /* =====================================================
       CLEAR PAGE HIGHLIGHTS
    ===================================================== */

    function clearPageSearchHighlights() {

        getPages()
            .forEach(
                page => {

                    page.classList.remove(
                        "search-result-page-active"
                    );

                }
            );

    }


    /* =====================================================
       UPDATE SEARCH UI
    ===================================================== */

    function updateSearchUI() {

        const countElement =
            getSearchCountElement();


        const results =
            state.searchResults;


        if (
            countElement
        ) {

            if (
                !state.searchQuery
            ) {

                countElement.textContent =
                    "";

            } else {

                countElement.textContent =
                    results.length
                        ? `${state.currentSearchIndex + 1} / ${results.length}`
                        : "0 results";

            }

        }


        const previousButton =
            getSearchPreviousButton();


        const nextButton =
            getSearchNextButton();


        const disabled =
            results.length === 0;


        if (
            previousButton
        ) {

            previousButton.disabled =
                disabled;

        }


        if (
            nextButton
        ) {

            nextButton.disabled =
                disabled;

        }


        const clearButton =
            getSearchClearButton();


        if (
            clearButton
        ) {

            clearButton.hidden =
                !state.searchQuery;

        }

    }


    /* =====================================================
       INPUT HANDLING
    ===================================================== */

    function handleSearchInput(
        event
    ) {

        const query =
            event.target.value;


        state.searchQuery =
            query;


        clearTimeout(
            state.searchTimer
        );


        state.searchTimer =
            window.setTimeout(
                () => {

                    performSearch(
                        query
                    );

                },
                180
            );

    }


    /* =====================================================
       KEYBOARD SEARCH
    ===================================================== */

    function handleSearchKeydown(
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            if (
                event.shiftKey
            ) {

                previousSearchResult();

            } else {

                nextSearchResult();

            }


            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            clearSearch();

        }

    }


    /* =====================================================
       BIND SEARCH UI
    ===================================================== */

    function bindSearchUI() {

        if (
            state.searchBound
        ) {

            return;

        }


        state.searchBound =
            true;


        const input =
            getSearchInput();


        if (
            input
        ) {

            input.addEventListener(
                "input",
                handleSearchInput
            );


            input.addEventListener(
                "keydown",
                handleSearchKeydown
            );

        }


        const clearButton =
            getSearchClearButton();


        clearButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                clearSearch();

            }
        );


        const nextButton =
            getSearchNextButton();


        nextButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                nextSearchResult();

            }
        );


        const previousButton =
            getSearchPreviousButton();


        previousButton?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                previousSearchResult();

            }
        );


        /*
         * Event delegation also supports
         * dynamically created search controls.
         */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-search-next]"
                    );


                if (button) {

                    event.preventDefault();

                    nextSearchResult();

                    return;

                }


                const previous =
                    event.target.closest(
                        "[data-search-previous]"
                    );


                if (previous) {

                    event.preventDefault();

                    previousSearchResult();

                    return;

                }


                const clear =
                    event.target.closest(
                        "[data-search-clear]"
                    );


                if (clear) {

                    event.preventDefault();

                    clearSearch();

                }

            }
        );

    }


    /* =====================================================
       REFRESH SEARCH
       Useful after pages are rendered dynamically.
    ===================================================== */

    function refreshSearch() {

        if (
            state.searchQuery
        ) {

            performSearch(
                state.searchQuery
            );

        } else {

            updateSearchUI();

        }

    }


    /* =====================================================
       SEARCH OPEN
    ===================================================== */

    function openSearch() {

        state.searchOpen =
            true;


        const input =
            getSearchInput();


        const wrapper =
            document.querySelector(
                ".reader-search"
            );


        wrapper?.classList.add(
            "open",
            "active"
        );


        input?.focus();


        if (
            state.searchQuery
        ) {

            input.value =
                state.searchQuery;

        }


        updateSearchUI();

    }


    /* =====================================================
       SEARCH CLOSE
    ===================================================== */

    function closeSearch() {

        state.searchOpen =
            false;


        const wrapper =
            document.querySelector(
                ".reader-search"
            );


        wrapper?.classList.remove(
            "open",
            "active"
        );


        const input =
            getSearchInput();


        input?.blur();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.performSearch =
        performSearch;

    R.searchCurrentPage =
        searchCurrentPage;

    R.nextSearchResult =
        nextSearchResult;

    R.previousSearchResult =
        previousSearchResult;

    R.selectSearchResult =
        selectSearchResult;

    R.clearSearch =
        clearSearch;

    R.refreshSearch =
        refreshSearch;

    R.openSearch =
        openSearch;

    R.closeSearch =
        closeSearch;

    R.updateSearchUI =
        updateSearchUI;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeSearch() {

        bindSearchUI();

        updateSearchUI();

        console.log(
            "Chishti Library Reader — Part 7/14 Search loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSearch,
            {
                once:
                    true
            }
        );

    } else {

        initializeSearch();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 8 / 14

   BOOKMARKS + TABLE OF CONTENTS + BOOK INFO
   - Bookmark persistence
   - Bookmark rendering
   - Bookmark navigation
   - Contents navigation
   - Book information
   - Safe dynamic DOM handling
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CORE
    ===================================================== */

    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader core missing — Part 8."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       STATE SAFETY
    ===================================================== */

    state.bookmarks =
        Array.isArray(
            state.bookmarks
        )
            ? state.bookmarks
            : [];

    state.bookmarksOpen =
        Boolean(
            state.bookmarksOpen
        );

    state.contentsOpen =
        Boolean(
            state.contentsOpen
        );

    state.bookInfoOpen =
        Boolean(
            state.bookInfoOpen
        );


    /* =====================================================
       STORAGE KEYS
    ===================================================== */

    const BOOKMARK_KEY =
        "chishtilib_reader_bookmarks";


    const POSITION_KEY =
        "chishtilib_last_page";


    /* =====================================================
       HELPERS
    ===================================================== */

    function safeNumber(
        value,
        fallback = 0
    ) {

        const number =
            Number(value);


        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    }


    function getCurrentPage() {

        return Math.max(
            1,
            safeNumber(
                state.currentPage,
                1
            )
        );

    }


    function getTotalPages() {

        return Math.max(
            0,
            safeNumber(
                state.totalPages,
                0
            )
        );

    }


    function getReader() {

        if (
            typeof R.getReader ===
            "function"
        ) {

            return R.getReader();

        }


        return document.querySelector(
            ".reader"
        );

    }


    /* =====================================================
       BOOK IDENTIFIER
    ===================================================== */

    function getBookIdentifier() {

        const book =
            state.currentBook;


        return (
            book?.id ||
            book?.bookId ||
            state.bookId ||
            state.currentBookId ||
            state.currentBookName ||
            book?.title ||
            "default-book"
        );

    }


    function getBookmarkStorageKey() {

        return (
            BOOKMARK_KEY +
            "_" +
            String(
                getBookIdentifier()
            )
                .replace(
                    /\s+/g,
                    "_"
                )
                .slice(
                    0,
                    100
                )
        );

    }


    /* =====================================================
       LOAD BOOKMARKS
    ===================================================== */

    function loadBookmarks() {

        /*
         * First try book-specific storage.
         */

        try {

            const raw =
                localStorage.getItem(
                    getBookmarkStorageKey()
                );


            if (raw) {

                const parsed =
                    JSON.parse(
                        raw
                    );


                if (
                    Array.isArray(
                        parsed
                    )
                ) {

                    state.bookmarks =
                        normalizeBookmarks(
                            parsed
                        );

                    return state.bookmarks;

                }

            }

        } catch (error) {

            console.warn(
                "Could not load book bookmarks.",
                error
            );

        }


        /*
         * Backward compatibility with
         * Part 1 storage.
         */

        try {

            const raw =
                localStorage.getItem(
                    BOOKMARK_KEY
                );


            if (!raw) {

                return state.bookmarks;

            }


            const parsed =
                JSON.parse(
                    raw
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                state.bookmarks =
                    normalizeBookmarks(
                        parsed
                    );

            }

        } catch (error) {

            console.warn(
                "Could not load bookmarks.",
                error
            );

        }


        return state.bookmarks;

    }


    /* =====================================================
       NORMALIZE BOOKMARKS
    ===================================================== */

    function normalizeBookmarks(
        bookmarks
    ) {

        return [
            ...new Set(
                bookmarks
                    .map(
                        page =>
                            Math.round(
                                safeNumber(
                                    page,
                                    0
                                )
                            )
                    )
                    .filter(
                        page =>
                            page >= 1 &&
                            (
                                getTotalPages() === 0 ||
                                page <= getTotalPages()
                            )
                    )
            )
        ]
            .sort(
                (a, b) =>
                    a - b
            );

    }


    /* =====================================================
       SAVE BOOKMARKS
    ===================================================== */

    function saveBookmarks() {

        state.bookmarks =
            normalizeBookmarks(
                state.bookmarks
            );


        try {

            localStorage.setItem(
                getBookmarkStorageKey(),
                JSON.stringify(
                    state.bookmarks
                )
            );


            /*
             * Keep old storage key updated
             * for compatibility.
             */

            localStorage.setItem(
                BOOKMARK_KEY,
                JSON.stringify(
                    state.bookmarks
                )
            );

        } catch (error) {

            console.warn(
                "Could not save bookmarks.",
                error
            );

        }

    }


    /* =====================================================
       CHECK BOOKMARK
    ===================================================== */

    function isBookmarked(
        page = getCurrentPage()
    ) {

        return state.bookmarks.includes(
            Math.round(
                safeNumber(
                    page,
                    1
                )
            )
        );

    }


    /* =====================================================
       ADD BOOKMARK
    ===================================================== */

    function addBookmark(
        page = getCurrentPage()
    ) {

        const target =
            Math.max(
                1,
                Math.round(
                    safeNumber(
                        page,
                        1
                    )
                )
            );


        if (
            !state.bookmarks.includes(
                target
            )
        ) {

            state.bookmarks.push(
                target
            );

        }


        state.bookmarks =
            normalizeBookmarks(
                state.bookmarks
            );


        saveBookmarks();

        updateBookmarkUI();

        renderBookmarks();


        if (
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                `Page ${target} bookmarked`,
                "★"
            );

        }

        return true;

    }


    /* =====================================================
       REMOVE BOOKMARK
    ===================================================== */

    function removeBookmark(
        page = getCurrentPage()
    ) {

        const target =
            Math.round(
                safeNumber(
                    page,
                    1
                )
            );


        const index =
            state.bookmarks.indexOf(
                target
            );


        if (
            index === -1
        ) {

            return false;

        }


        state.bookmarks.splice(
            index,
            1
        );


        saveBookmarks();

        updateBookmarkUI();

        renderBookmarks();


        if (
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                `Page ${target} bookmark removed`,
                "×"
            );

        }


        return true;

    }


    /* =====================================================
       TOGGLE BOOKMARK
    ===================================================== */

    function toggleBookmark(
        page = getCurrentPage()
    ) {

        if (
            isBookmarked(
                page
            )
        ) {

            return removeBookmark(
                page
            );

        }


        return addBookmark(
            page
        );

    }


    /* =====================================================
       CLEAR ALL BOOKMARKS
    ===================================================== */

    function clearBookmarks() {

        state.bookmarks =
            [];


        saveBookmarks();

        updateBookmarkUI();

        renderBookmarks();


        if (
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                "All bookmarks cleared",
                "×"
            );

        }

    }


    /* =====================================================
       BOOKMARK PANEL
    ===================================================== */

    function getBookmarkPanel() {

        return (
            document.querySelector(
                ".bookmark-panel"
            ) ||
            document.querySelector(
                "[data-bookmark-panel]"
            )
        );

    }


    function getBookmarkList() {

        return (
            document.querySelector(
                ".bookmark-list"
            ) ||
            document.querySelector(
                "[data-bookmark-list]"
            )
        );

    }


    function renderBookmarks() {

        const list =
            getBookmarkList();


        if (!list) {

            return;

        }


        list.innerHTML =
            "";


        if (
            !state.bookmarks.length
        ) {

            list.innerHTML = `
                <div class="bookmark-empty">
                    <span>No bookmarks yet</span>
                    <small>
                        Bookmark a page while reading.
                    </small>
                </div>
            `;

            return;

        }


        state.bookmarks
            .forEach(
                page => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "bookmark-item";


                    if (
                        page ===
                        getCurrentPage()
                    ) {

                        item.classList.add(
                            "active"
                        );

                    }


                    item.dataset.page =
                        String(page);


                    item.innerHTML = `
                        <button
                            type="button"
                            class="bookmark-page"
                            data-bookmark-page="${page}"
                        >
                            <span class="bookmark-star">
                                ★
                            </span>

                            <span class="bookmark-label">
                                Page ${page}
                            </span>
                        </button>

                        <button
                            type="button"
                            class="bookmark-remove"
                            data-remove-bookmark="${page}"
                            aria-label="Remove bookmark"
                        >
                            ×
                        </button>
                    `;


                    list.appendChild(
                        item
                    );

                }
            );

    }


    /* =====================================================
       BOOKMARK UI
    ===================================================== */

    function updateBookmarkUI() {

        const buttons =
            document.querySelectorAll(
                "[data-action='bookmark-page'], [data-bookmark-toggle]"
            );


        const bookmarked =
            isBookmarked();


        buttons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    bookmarked
                );


                button.setAttribute(
                    "aria-pressed",
                    String(
                        bookmarked
                    )
                );


                const label =
                    button.querySelector(
                        "[data-bookmark-label]"
                    );


                if (label) {

                    label.textContent =
                        bookmarked
                            ? "Remove bookmark"
                            : "Bookmark page";

                }

            }
        );


        const count =
            document.querySelector(
                ".bookmark-count, [data-bookmark-count]"
            );


        if (count) {

            count.textContent =
                String(
                    state.bookmarks.length
                );

        }

    }


    /* =====================================================
       GO TO BOOKMARK
    ===================================================== */

    async function goToBookmark(
        page
    ) {

        const target =
            Math.max(
                1,
                Math.round(
                    safeNumber(
                        page,
                        1
                    )
                )
            );


        try {

            if (
                typeof R.goToPage ===
                "function"
            ) {

                await R.goToPage(
                    target,
                    {
                        notify:
                            false
                    }
                );

            } else {

                state.currentPage =
                    target;


                if (
                    typeof R.updatePageUI ===
                    "function"
                ) {

                    R.updatePageUI();

                }

            }

        } catch (error) {

            console.warn(
                "Could not navigate to bookmark.",
                error
            );

        }


        renderBookmarks();

        updateBookmarkUI();

    }


    /* =====================================================
       CONTENTS
    ===================================================== */

    function getContentsItems() {

        return [
            ...document.querySelectorAll(
                ".contents-item, [data-page]"
            )
        ]
            .filter(
                element =>
                    element.matches(
                        ".contents-item, [data-contents-item]"
                    ) ||
                    element.hasAttribute(
                        "data-page"
                    )
            );

    }


    function getContentsPage(
        item
    ) {

        if (!item) {

            return null;

        }


        const value =
            item.dataset.page ||
            item.dataset.targetPage ||
            item.getAttribute(
                "data-page"
            );


        const page =
            parseInt(
                value,
                10
            );


        if (
            Number.isFinite(
                page
            ) &&
            page >= 1
        ) {

            return page;

        }


        return null;

    }


    async function goToContentsItem(
        item
    ) {

        const page =
            getContentsPage(
                item
            );


        if (!page) {

            return;

        }


        await goToBookmark(
            page
        );


        /*
         * Close sidebar after navigation.
         */

        if (
            typeof R.closeAllPanels ===
            "function"
        ) {

            R.closeAllPanels();

        } else {

            document
                .querySelector(
                    ".reader-sidebar"
                )
                ?.classList.remove(
                    "open",
                    "active"
                );

        }

    }


    /* =====================================================
       ACTIVE CONTENTS ITEM
    ===================================================== */

    function updateContentsUI() {

        const currentPage =
            getCurrentPage();


        getContentsItems()
            .forEach(
                item => {

                    const page =
                        getContentsPage(
                            item
                        );


                    item.classList.toggle(
                        "active",
                        page === currentPage
                    );


                    if (
                        page === currentPage
                    ) {

                        item.setAttribute(
                            "aria-current",
                            "page"
                        );

                    } else {

                        item.removeAttribute(
                            "aria-current"
                        );

                    }

                }
            );

    }


    /* =====================================================
       BOOK INFORMATION
    ===================================================== */

    function getBookInfoPanel() {

        return (
            document.querySelector(
                ".book-info-panel"
            ) ||
            document.querySelector(
                "[data-book-info-panel]"
            )
        );

    }


    function setBookInfo(
        selector,
        value
    ) {

        const element =
            document.querySelector(
                selector
            );


        if (!element) {

            return;

        }


        element.textContent =
            value ?? "";

    }


    function updateBookInfo() {

        const book =
            state.currentBook ||
            {};


        const title =
            book.title ||
            book.name ||
            state.currentBookName ||
            "Untitled Book";


        const author =
            book.author ||
            book.authors ||
            state.author ||
            "Unknown Author";


        const category =
            book.category ||
            book.genre ||
            state.category ||
            "Library Book";


        const description =
            book.description ||
            book.summary ||
            state.description ||
            "";


        const url =
            book.url ||
            book.src ||
            state.currentBookUrl ||
            "";


        setBookInfo(
            ".book-info-title",
            title
        );


        setBookInfo(
            "[data-book-title]",
            title
        );


        setBookInfo(
            ".book-info-author",
            author
        );


        setBookInfo(
            "[data-book-author]",
            author
        );


        setBookInfo(
            ".book-info-category",
            category
        );


        setBookInfo(
            "[data-book-category]",
            category
        );


        setBookInfo(
            ".book-info-description",
            description
        );


        setBookInfo(
            "[data-book-description]",
            description
        );


        setBookInfo(
            ".book-info-pages",
            getTotalPages()
                ? String(
                    getTotalPages()
                )
                : "—"
        );


        const cover =
            document.querySelector(
                ".book-info-cover"
            );


        const coverUrl =
            book.cover ||
            book.coverUrl ||
            book.image ||
            book.thumbnail ||
            "";


        if (
            cover &&
            coverUrl
        ) {

            cover.src =
                coverUrl;

            cover.alt =
                title;

        }


        const source =
            document.querySelector(
                "[data-book-source]"
            );


        if (
            source &&
            url
        ) {

            source.textContent =
                url;

        }

    }


    /* =====================================================
       PANEL TOGGLES
    ===================================================== */

    function openBookmarkPanel() {

        const panel =
            getBookmarkPanel();


        if (!panel) {

            return;

        }


        if (
            typeof R.openPanel ===
            "function"
        ) {

            R.openPanel(
                panel
            );

        } else {

            panel.classList.add(
                "open",
                "active"
            );

        }


        state.bookmarksOpen =
            true;


        renderBookmarks();

        updateBookmarkUI();

    }


    function openContentsPanel() {

        const panel =
            document.querySelector(
                ".reader-sidebar"
            );


        if (!panel) {

            return;

        }


        if (
            typeof R.openPanel ===
            "function"
        ) {

            R.openPanel(
                panel
            );

        } else {

            panel.classList.add(
                "open",
                "active"
            );

        }


        state.contentsOpen =
            true;


        updateContentsUI();

    }


    function openBookInfoPanel() {

        const panel =
            getBookInfoPanel();


        if (!panel) {

            return;

        }


        updateBookInfo();


        if (
            typeof R.openPanel ===
            "function"
        ) {

            R.openPanel(
                panel
            );

        } else {

            panel.classList.add(
                "open",
                "active"
            );

        }


        state.bookInfoOpen =
            true;

    }


    /* =====================================================
       EVENT DELEGATION
    ===================================================== */

    function bindBookmarkEvents() {

        document.addEventListener(
            "click",
            event => {

                const bookmarkButton =
                    event.target.closest(
                        "[data-action='bookmark-page'], [data-bookmark-toggle]"
                    );


                if (
                    bookmarkButton
                ) {

                    event.preventDefault();

                    toggleBookmark();

                    return;

                }


                const bookmarkPage =
                    event.target.closest(
                        "[data-bookmark-page]"
                    );


                if (
                    bookmarkPage
                ) {

                    event.preventDefault();


                    goToBookmark(
                        bookmarkPage.dataset.bookmarkPage
                    );


                    return;

                }


                const removeBookmarkButton =
                    event.target.closest(
                        "[data-remove-bookmark]"
                    );


                if (
                    removeBookmarkButton
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    removeBookmark(
                        removeBookmarkButton.dataset.removeBookmark
                    );


                    return;

                }


                const clearButton =
                    event.target.closest(
                        "[data-clear-bookmarks]"
                    );


                if (
                    clearButton
                ) {

                    event.preventDefault();

                    clearBookmarks();

                    return;

                }


                const contentsItem =
                    event.target.closest(
                        ".contents-item, [data-contents-item]"
                    );


                if (
                    contentsItem &&
                    getContentsPage(
                        contentsItem
                    )
                ) {

                    event.preventDefault();

                    goToContentsItem(
                        contentsItem
                    );

                }

            }
        );

    }


    /* =====================================================
       PAGE CHANGE WATCHER
    ===================================================== */

    function watchPageChanges() {

        let previousPage =
            getCurrentPage();


        window.setInterval(
            () => {

                const currentPage =
                    getCurrentPage();


                if (
                    currentPage !==
                    previousPage
                ) {

                    previousPage =
                        currentPage;


                    updateBookmarkUI();

                    renderBookmarks();

                    updateContentsUI();

                }

            },
            200
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.loadBookmarks =
        loadBookmarks;

    R.saveBookmarks =
        saveBookmarks;

    R.isBookmarked =
        isBookmarked;

    R.addBookmark =
        addBookmark;

    R.removeBookmark =
        removeBookmark;

    R.toggleBookmark =
        toggleBookmark;

    R.clearBookmarks =
        clearBookmarks;

    R.renderBookmarks =
        renderBookmarks;

    R.goToBookmark =
        goToBookmark;

    R.updateBookmarkUI =
        updateBookmarkUI;

    R.updateContentsUI =
        updateContentsUI;

    R.updateBookInfo =
        updateBookInfo;

    R.openBookmarkPanel =
        openBookmarkPanel;

    R.openContentsPanel =
        openContentsPanel;

    R.openBookInfoPanel =
        openBookInfoPanel;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializePart8() {

        loadBookmarks();

        bindBookmarkEvents();

        renderBookmarks();

        updateBookmarkUI();

        updateContentsUI();

        updateBookInfo();

        watchPageChanges();


        console.log(
            "Chishti Library Reader — Part 8/14 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePart8,
            {
                once:
                    true
            }
        );

    } else {

        initializePart8();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 9 / 14
   SEARCH ENGINE + SEARCH UI + RESULT NAVIGATION
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error(
            "ChishtiReader core missing — Part 9."
        );
        return;
    }

    const state = R.state;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getSearchInput() {

        return document.querySelector(
            ".search-input-wrap input, .search-input"
        );

    }


    function getSearchResults() {

        return document.querySelector(
            ".search-results"
        );

    }


    function getSearchPanel() {

        return document.querySelector(
            ".reader-search, .search-panel"
        );

    }


    function getPages() {

        return [
            ...document.querySelectorAll(
                ".reader-page"
            )
        ];

    }


    /* =====================================================
       SEARCH STATE
    ===================================================== */

    state.searching =
        false;

    state.searchQuery =
        state.searchQuery || "";

    state.searchResults =
        Array.isArray(
            state.searchResults
        )
            ? state.searchResults
            : [];

    state.currentSearchIndex =
        Number.isInteger(
            state.currentSearchIndex
        )
            ? state.currentSearchIndex
            : -1;


    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalizeSearchText(
        value
    ) {

        return String(
            value || ""
        )
            .toLowerCase()
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value || ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       GET PAGE TEXT
    ===================================================== */

    function getPageText(
        page
    ) {

        if (!page) {
            return "";
        }


        /*
         * Prefer explicit searchable text.
         */

        const searchable =
            page.querySelector(
                "[data-search-text]"
            );


        if (searchable) {

            return (
                searchable.textContent ||
                ""
            );

        }


        return (
            page.textContent ||
            ""
        );

    }


    /* =====================================================
       BUILD SEARCH INDEX
    ===================================================== */

    function buildSearchIndex() {

        const pages =
            getPages();


        const index = [];


        pages.forEach(
            (page, indexNumber) => {

                const text =
                    getPageText(
                        page
                    ).trim();


                if (!text) {
                    return;
                }


                index.push({

                    pageElement:
                        page,

                    pageNumber:
                        Number(
                            page.dataset.page ||
                            page.dataset.pageNumber ||
                            indexNumber + 1
                        ),

                    text,

                    normalized:
                        normalizeSearchText(
                            text
                        )

                });

            }
        );


        state.searchIndex =
            index;


        return index;

    }


    /* =====================================================
       FIND SEARCH INDEX
    ===================================================== */

    function getSearchIndex() {

        if (
            Array.isArray(
                state.searchIndex
            ) &&
            state.searchIndex.length
        ) {

            return state.searchIndex;

        }


        return buildSearchIndex();

    }


    /* =====================================================
       SEARCH PAGE
    ===================================================== */

    function searchPage(
        entry,
        query
    ) {

        const normalizedQuery =
            normalizeSearchText(
                query
            );


        if (
            !normalizedQuery ||
            !entry?.normalized
        ) {

            return null;

        }


        const position =
            entry.normalized.indexOf(
                normalizedQuery
            );


        if (
            position === -1
        ) {

            return null;

        }


        const start =
            Math.max(
                0,
                position - 65
            );


        const end =
            Math.min(
                entry.text.length,
                position +
                normalizedQuery.length +
                90
            );


        let excerpt =
            entry.text.slice(
                start,
                end
            );


        if (start > 0) {

            excerpt =
                "…" +
                excerpt;

        }


        if (
            end <
            entry.text.length
        ) {

            excerpt +=
                "…";

        }


        return {

            page:
                entry.pageNumber,

            text:
                excerpt,

            position,

            element:
                entry.pageElement

        };

    }


    /* =====================================================
       PERFORM SEARCH
    ===================================================== */

    function performSearch(
        query
    ) {

        const cleanQuery =
            String(
                query || ""
            ).trim();


        state.searchQuery =
            cleanQuery;


        state.searchResults =
            [];

        state.currentSearchIndex =
            -1;


        if (!cleanQuery) {

            renderSearchResults();

            return [];

        }


        state.searching =
            true;


        const index =
            getSearchIndex();


        index.forEach(
            entry => {

                const result =
                    searchPage(
                        entry,
                        cleanQuery
                    );


                if (result) {

                    state.searchResults.push(
                        result
                    );

                }

            }
        );


        state.searching =
            false;


        if (
            state.searchResults.length
        ) {

            state.currentSearchIndex =
                0;

        }


        renderSearchResults();


        return state.searchResults;

    }


    /* =====================================================
       HIGHLIGHT SEARCH TERM
    ===================================================== */

    function highlightText(
        text,
        query
    ) {

        const escapedText =
            escapeHTML(
                text
            );


        const escapedQuery =
            escapeHTML(
                query
            );


        if (!escapedQuery) {

            return escapedText;

        }


        const pattern =
            new RegExp(
                "(" +
                escapedQuery.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                ) +
                ")",
                "gi"
            );


        return escapedText.replace(
            pattern,
            "<mark>$1</mark>"
        );

    }


    /* =====================================================
       RENDER RESULTS
    ===================================================== */

    function renderSearchResults() {

        const container =
            getSearchResults();


        if (!container) {
            return;
        }


        const results =
            state.searchResults || [];


        if (!state.searchQuery) {

            container.innerHTML = `
                <div class="search-empty">
                    <span>⌕</span>
                    <p>Search this book</p>
                </div>
            `;

            return;

        }


        if (!results.length) {

            container.innerHTML = `
                <div class="search-empty">
                    <span>⌕</span>
                    <p>No results found</p>
                    <small>
                        Try another word or phrase.
                    </small>
                </div>
            `;

            return;

        }


        container.innerHTML =
            results
                .map(
                    (result, index) => {

                        const active =
                            index ===
                            state.currentSearchIndex;


                        return `
                            <button
                                type="button"
                                class="search-result ${
                                    active
                                        ? "active"
                                        : ""
                                }"
                                data-search-index="${index}"
                            >

                                <span
                                    class="search-result-page"
                                >
                                    Page ${
                                        escapeHTML(
                                            result.page
                                        )
                                    }
                                </span>

                                <span
                                    class="search-result-text"
                                >
                                    ${
                                        highlightText(
                                            result.text,
                                            state.searchQuery
                                        )
                                    }
                                </span>

                            </button>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       GO TO SEARCH RESULT
    ===================================================== */

    async function goToSearchResult(
        index
    ) {

        const results =
            state.searchResults || [];


        if (
            !results.length
        ) {

            return false;

        }


        let targetIndex =
            Number(index);


        if (
            !Number.isInteger(
                targetIndex
            )
        ) {

            targetIndex =
                0;

        }


        if (
            targetIndex < 0
        ) {

            targetIndex =
                results.length - 1;

        }


        if (
            targetIndex >=
            results.length
        ) {

            targetIndex =
                0;

        }


        const result =
            results[targetIndex];


        if (!result) {

            return false;

        }


        state.currentSearchIndex =
            targetIndex;


        /*
         * Use the reader's page API if another
         * module has already provided it.
         */

        if (
            typeof R.goToPage ===
            "function"
        ) {

            try {

                await R.goToPage(
                    result.page,
                    {
                        notify:
                            false
                    }
                );

            } catch (error) {

                console.warn(
                    "Could not navigate to search result.",
                    error
                );

            }

        } else {

            /*
             * Fallback for simple page systems.
             */

            state.currentPage =
                result.page;

            if (
                typeof R.updatePageUI ===
                "function"
            ) {

                R.updatePageUI();

            }

        }


        highlightCurrentSearchPage(
            result
        );


        renderSearchResults();


        return true;

    }


    /* =====================================================
       NEXT SEARCH RESULT
    ===================================================== */

    function nextSearchResult() {

        const results =
            state.searchResults || [];


        if (
            !results.length
        ) {

            return false;

        }


        const next =
            state.currentSearchIndex + 1;


        return goToSearchResult(
            next >= results.length
                ? 0
                : next
        );

    }


    /* =====================================================
       PREVIOUS SEARCH RESULT
    ===================================================== */

    function previousSearchResult() {

        const results =
            state.searchResults || [];


        if (
            !results.length
        ) {

            return false;

        }


        const previous =
            state.currentSearchIndex - 1;


        return goToSearchResult(
            previous < 0
                ? results.length - 1
                : previous
        );

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

        state.searchQuery =
            "";

        state.searchResults =
            [];

        state.currentSearchIndex =
            -1;

        state.searching =
            false;


        const input =
            getSearchInput();


        if (input) {

            input.value =
                "";

        }


        clearSearchHighlights();


        renderSearchResults();

    }


    /* =====================================================
       OPEN SEARCH
    ===================================================== */

    function openSearch() {

        state.searchOpen =
            true;


        const panel =
            getSearchPanel();


        panel?.classList.add(
            "open",
            "active"
        );


        const input =
            getSearchInput();


        window.setTimeout(
            () => {

                input?.focus();

                input?.select();

            },
            50
        );

    }


    /* =====================================================
       CLOSE SEARCH
    ===================================================== */

    function closeSearch() {

        state.searchOpen =
            false;


        const panel =
            getSearchPanel();


        panel?.classList.remove(
            "open",
            "active"
        );


        clearSearchHighlights();

    }


    /* =====================================================
       TOGGLE SEARCH
    ===================================================== */

    function toggleSearch() {

        if (
            state.searchOpen
        ) {

            closeSearch();

        } else {

            openSearch();

        }

    }


    /* =====================================================
       CLEAR HIGHLIGHTS
    ===================================================== */

    function clearSearchHighlights() {

        document
            .querySelectorAll(
                ".search-highlight"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "search-highlight"
                    );

                }
            );

    }


    /* =====================================================
       HIGHLIGHT CURRENT PAGE
    ===================================================== */

    function highlightCurrentSearchPage(
        result
    ) {

        clearSearchHighlights();


        if (
            !result?.element
        ) {

            return;

        }


        result.element.classList.add(
            "search-highlight"
        );


        /*
         * Scroll the page into view only when
         * necessary. This avoids violent jumps.
         */

        try {

            result.element.scrollIntoView({
                behavior:
                    "smooth",
                block:
                    "center"
            });

        } catch (_) {

            result.element.scrollIntoView();

        }

    }


    /* =====================================================
       SEARCH INPUT HANDLER
    ===================================================== */

    let searchTimer =
        null;


    function handleSearchInput(
        event
    ) {

        const query =
            event.target.value;


        clearTimeout(
            searchTimer
        );


        searchTimer =
            window.setTimeout(
                () => {

                    performSearch(
                        query
                    );

                },
                180
            );

    }


    /* =====================================================
       KEYBOARD SEARCH
    ===================================================== */

    function handleSearchKeyboard(
        event
    ) {

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            if (
                event.shiftKey
            ) {

                previousSearchResult();

            } else {

                nextSearchResult();

            }


            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            event.preventDefault();

            closeSearch();

        }

    }


    /* =====================================================
       SEARCH RESULT CLICK
    ===================================================== */

    function handleResultClick(
        event
    ) {

        const resultButton =
            event.target.closest(
                "[data-search-index]"
            );


        if (!resultButton) {

            return;

        }


        const index =
            Number(
                resultButton.dataset.searchIndex
            );


        goToSearchResult(
            index
        );

    }


    /* =====================================================
       BIND SEARCH EVENTS
    ===================================================== */

    function bindSearchEvents() {

        const input =
            getSearchInput();


        input?.addEventListener(
            "input",
            handleSearchInput
        );


        input?.addEventListener(
            "keydown",
            handleSearchKeyboard
        );


        const results =
            getSearchResults();


        results?.addEventListener(
            "click",
            handleResultClick
        );


        document.addEventListener(
            "click",
            event => {

                const searchButton =
                    event.target.closest(
                        "[data-action='toggle-search'], [data-action='search']"
                    );


                if (
                    searchButton
                ) {

                    event.preventDefault();

                    toggleSearch();

                    return;

                }


                const clearButton =
                    event.target.closest(
                        ".search-clear, [data-action='clear-search']"
                    );


                if (
                    clearButton
                ) {

                    event.preventDefault();

                    clearSearch();

                    return;

                }


                const nextButton =
                    event.target.closest(
                        "[data-action='search-next']"
                    );


                if (
                    nextButton
                ) {

                    event.preventDefault();

                    nextSearchResult();

                    return;

                }


                const previousButton =
                    event.target.closest(
                        "[data-action='search-previous']"
                    );


                if (
                    previousButton
                ) {

                    event.preventDefault();

                    previousSearchResult();

                }

            }
        );

    }


    /* =====================================================
       REBUILD INDEX WHEN PAGES CHANGE
    ===================================================== */

    function observeSearchPages() {

        const stage =
            document.querySelector(
                ".page-stage"
            );


        if (!stage) {

            return;

        }


        const observer =
            new MutationObserver(
                () => {

                    /*
                     * Delay rebuilding so several PDF/page
                     * mutations are grouped into one operation.
                     */

                    clearTimeout(
                        state.searchIndexTimer
                    );


                    state.searchIndexTimer =
                        window.setTimeout(
                            () => {

                                state.searchIndex =
                                    null;

                            },
                            100
                        );

                }
            );


        observer.observe(
            stage,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );


        state.searchObserver =
            observer;

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.buildSearchIndex =
        buildSearchIndex;

    R.search =
        performSearch;

    R.performSearch =
        performSearch;

    R.goToSearchResult =
        goToSearchResult;

    R.nextSearchResult =
        nextSearchResult;

    R.previousSearchResult =
        previousSearchResult;

    R.clearSearch =
        clearSearch;

    R.openSearch =
        openSearch;

    R.closeSearch =
        closeSearch;

    R.toggleSearch =
        toggleSearch;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeSearch() {

        bindSearchEvents();

        observeSearchPages();


        /*
         * Build after the reader has had a chance
         * to render its pages.
         */

        window.setTimeout(
            () => {

                buildSearchIndex();

            },
            300
        );


        console.log(
            "Chishti Library Reader — Part 9/14 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSearch,
            {
                once:
                    true
            }
        );

    } else {

        initializeSearch();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 10 / 14

   SEARCH ENGINE + SEARCH UI
========================================================= */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (
        !R ||
        !R.state
    ) {

        console.error(
            "ChishtiReader core missing — Part 10."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getSearchInput() {

        return document.querySelector(
            ".search-input-wrap input, .search-input"
        );

    }


    function getSearchResults() {

        return document.querySelector(
            ".search-results"
        );

    }


    function getSearchContainer() {

        return document.querySelector(
            ".reader-search, .search-panel, .search-container"
        );

    }


    function getReaderPages() {

        return [
            ...document.querySelectorAll(
                ".reader-page"
            )
        ];

    }


    /* =====================================================
       SEARCH STATE
    ===================================================== */

    state.searchQuery =
        state.searchQuery || "";

    state.searchResults =
        Array.isArray(
            state.searchResults
        )
            ? state.searchResults
            : [];

    state.currentSearchIndex =
        Number.isInteger(
            state.currentSearchIndex
        )
            ? state.currentSearchIndex
            : -1;

    state.searching =
        false;


    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalizeText(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(
        value
    ) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       CREATE SEARCH INDEX
    ===================================================== */

    function buildSearchIndex() {

        const pages =
            getReaderPages();


        const index = [];


        pages.forEach(
            (
                page,
                indexNumber
            ) => {

                const text =
                    page.innerText ||
                    page.textContent ||
                    "";


                const cleanText =
                    text
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();


                if (
                    !cleanText
                ) {

                    return;

                }


                const pageNumber =
                    Number(
                        page.dataset.page ||
                        page.dataset.pageNumber ||
                        indexNumber + 1
                    );


                index.push({

                    page:
                        pageNumber,

                    element:
                        page,

                    text:
                        cleanText,

                    normalized:
                        normalizeText(
                            cleanText
                        )

                });

            }
        );


        state.searchIndex =
            index;


        return index;

    }


    /* =====================================================
       GET SEARCH INDEX
    ===================================================== */

    function getSearchIndex() {

        if (
            Array.isArray(
                state.searchIndex
            ) &&
            state.searchIndex.length
        ) {

            return state.searchIndex;

        }


        return buildSearchIndex();

    }


    /* =====================================================
       FIND MATCH POSITION
    ===================================================== */

    function getMatchPosition(
        text,
        query
    ) {

        return normalizeText(
            text
        ).indexOf(
            normalizeText(
                query
            )
        );

    }


    /* =====================================================
       CREATE SNIPPET
    ===================================================== */

    function createSnippet(
        text,
        query
    ) {

        const original =
            String(
                text || ""
            )
            .replace(
                /\s+/g,
                " "
            )
            .trim();


        const lowerText =
            original.toLowerCase();


        const lowerQuery =
            String(
                query || ""
            )
            .toLowerCase()
            .trim();


        if (
            !lowerQuery
        ) {

            return original.slice(
                0,
                140
            );

        }


        const position =
            lowerText.indexOf(
                lowerQuery
            );


        if (
            position === -1
        ) {

            return original.slice(
                0,
                140
            );

        }


        const start =
            Math.max(
                0,
                position - 55
            );


        const end =
            Math.min(
                original.length,
                position +
                lowerQuery.length +
                85
            );


        let snippet =
            original.slice(
                start,
                end
            );


        if (
            start > 0
        ) {

            snippet =
                "… " +
                snippet;

        }


        if (
            end <
            original.length
        ) {

            snippet +=
                " …";

        }


        return snippet;

    }


    /* =====================================================
       HIGHLIGHT MATCH
    ===================================================== */

    function highlightMatch(
        text,
        query
    ) {

        const value =
            String(
                text || ""
            );


        const cleanQuery =
            String(
                query || ""
            )
            .trim();


        if (
            !cleanQuery
        ) {

            return escapeHTML(
                value
            );

        }


        const escapedText =
            escapeHTML(
                value
            );


        const escapedQuery =
            escapeHTML(
                cleanQuery
            );


        const expression =
            new RegExp(
                `(${escapeRegExp(escapedQuery)})`,
                "gi"
            );


        return escapedText.replace(
            expression,
            "<mark>$1</mark>"
        );

    }


    /* =====================================================
       ESCAPE REGEX
    ===================================================== */

    function escapeRegExp(
        value
    ) {

        return String(
            value
        )
            .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function searchReader(
        query
    ) {

        const cleanQuery =
            String(
                query ?? ""
            )
            .trim();


        state.searchQuery =
            cleanQuery;


        state.currentSearchIndex =
            -1;


        if (
            !cleanQuery
        ) {

            state.searchResults =
                [];

            renderSearchResults();

            return [];

        }


        state.searching =
            true;


        const index =
            getSearchIndex();


        const normalizedQuery =
            normalizeText(
                cleanQuery
            );


        const results = [];


        index.forEach(
            item => {

                if (
                    item.normalized.includes(
                        normalizedQuery
                    )
                ) {

                    const position =
                        item.normalized.indexOf(
                            normalizedQuery
                        );


                    results.push({

                        page:
                            item.page,

                        element:
                            item.element,

                        text:
                            item.text,

                        position:
                            position,

                        snippet:
                            createSnippet(
                                item.text,
                                cleanQuery
                            )

                    });

                }

            }
        );


        /*
         * Sort by page number.
         */

        results.sort(
            (
                a,
                b
            ) => {

                return (
                    a.page -
                    b.page
                );

            }
        );


        state.searchResults =
            results;

        state.searching =
            false;


        renderSearchResults();


        return results;

    }


    /* =====================================================
       RENDER SEARCH RESULTS
    ===================================================== */

    function renderSearchResults() {

        const container =
            getSearchResults();


        if (
            !container
        ) {

            return;

        }


        container.innerHTML =
            "";


        const results =
            state.searchResults || [];


        if (
            !state.searchQuery
        ) {

            container.innerHTML = `

                <div class="search-empty">

                    <span>
                        Search this book
                    </span>

                </div>

            `;

            return;

        }


        if (
            !results.length
        ) {

            container.innerHTML = `

                <div class="search-empty">

                    <strong>
                        No results found
                    </strong>

                    <span>
                        Try another word or phrase.
                    </span>

                </div>

            `;

            return;

        }


        const fragment =
            document.createDocumentFragment();


        results.forEach(
            (
                result,
                index
            ) => {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "search-result";


                item.dataset.searchIndex =
                    String(
                        index
                    );


                item.dataset.page =
                    String(
                        result.page
                    );


                item.innerHTML = `

                    <span class="search-result-page">

                        Page
                        ${escapeHTML(
                            result.page
                        )}

                    </span>

                    <span class="search-result-text">

                        ${highlightMatch(
                            result.snippet,
                            state.searchQuery
                        )}

                    </span>

                `;


                fragment.appendChild(
                    item
                );

            }
        );


        container.appendChild(
            fragment
        );


        updateSearchResultCount();

    }


    /* =====================================================
       SEARCH RESULT COUNT
    ===================================================== */

    function updateSearchResultCount() {

        const count =
            state.searchResults?.length ||
            0;


        const elements =
            document.querySelectorAll(
                ".search-result-count, [data-search-count]"
            );


        elements.forEach(
            element => {

                element.textContent =
                    count
                        ? `${count} result${count === 1 ? "" : "s"}`
                        : "";

            }
        );

    }


    /* =====================================================
       GO TO SEARCH RESULT
    ===================================================== */

    async function openSearchResult(
        index
    ) {

        const results =
            state.searchResults || [];


        const result =
            results[
                Number(index)
            ];


        if (
            !result
        ) {

            return;

        }


        state.currentSearchIndex =
            Number(index);


        const page =
            Number(
                result.page
            );


        /*
         * Prefer reader's real page API.
         */

        if (
            typeof R.goToPage ===
            "function"
        ) {

            try {

                await R.goToPage(
                    page,
                    {
                        notify:
                            false
                    }
                );

            } catch (
                error
            ) {

                console.warn(
                    "Could not open search result page.",
                    error
                );

            }

        } else {

            state.currentPage =
                page;


            if (
                typeof R.updatePageUI ===
                "function"
            ) {

                R.updatePageUI();

            }

        }


        /*
         * Highlight selected result.
         */

        highlightSearchResult(
            result
        );


        updateActiveSearchResult();


        if (
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                `Page ${page}`,
                "⌕"
            );

        }

    }


    /* =====================================================
       HIGHLIGHT SEARCH RESULT
    ===================================================== */

    function highlightSearchResult(
        result
    ) {

        if (
            !result?.element
        ) {

            return;

        }


        document
            .querySelectorAll(
                ".search-hit-page"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "search-hit-page"
                    );

                }
            );


        result.element.classList.add(
            "search-hit-page"
        );


        window.setTimeout(
            () => {

                result.element.classList.remove(
                    "search-hit-page"
                );

            },
            1800
        );

    }


    /* =====================================================
       ACTIVE SEARCH RESULT
    ===================================================== */

    function updateActiveSearchResult() {

        const items =
            document.querySelectorAll(
                ".search-result"
            );


        items.forEach(
            (
                item,
                index
            ) => {

                item.classList.toggle(
                    "active",
                    index ===
                    state.currentSearchIndex
                );

            }
        );

    }


    /* =====================================================
       NEXT SEARCH RESULT
    ===================================================== */

    async function nextSearchResult() {

        const results =
            state.searchResults || [];


        if (
            !results.length
        ) {

            return;

        }


        let index =
            state.currentSearchIndex +
            1;


        if (
            index >=
            results.length
        ) {

            index =
                0;

        }


        await openSearchResult(
            index
        );

    }


    /* =====================================================
       PREVIOUS SEARCH RESULT
    ===================================================== */

    async function previousSearchResult() {

        const results =
            state.searchResults || [];


        if (
            !results.length
        ) {

            return;

        }


        let index =
            state.currentSearchIndex -
            1;


        if (
            index < 0
        ) {

            index =
                results.length -
                1;

        }


        await openSearchResult(
            index
        );

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

        state.searchQuery =
            "";

        state.searchResults =
            [];

        state.currentSearchIndex =
            -1;


        const input =
            getSearchInput();


        if (
            input
        ) {

            input.value =
                "";

        }


        renderSearchResults();


        document
            .querySelectorAll(
                ".search-hit-page"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "search-hit-page"
                    );

                }
            );

    }


    /* =====================================================
       CLOSE SEARCH
    ===================================================== */

    function closeSearch() {

        state.searchOpen =
            false;


        const container =
            getSearchContainer();


        container?.classList.remove(
            "open",
            "active"
        );


        clearSearch();

    }


    /* =====================================================
       OPEN SEARCH
    ===================================================== */

    function openSearch() {

        state.searchOpen =
            true;


        const container =
            getSearchContainer();


        container?.classList.add(
            "open",
            "active"
        );


        const input =
            getSearchInput();


        if (
            input
        ) {

            window.setTimeout(
                () => {

                    input.focus();

                    input.select();

                },
                50
            );

        }

    }


    /* =====================================================
       REBUILD INDEX
    ===================================================== */

    function rebuildSearchIndex() {

        state.searchIndex =
            [];


        return buildSearchIndex();

    }


    /* =====================================================
       SEARCH INPUT EVENTS
    ===================================================== */

    function bindSearchInput() {

        const input =
            getSearchInput();


        if (
            !input ||
            input.dataset.searchBound ===
            "true"
        ) {

            return;

        }


        input.dataset.searchBound =
            "true";


        let timer =
            null;


        input.addEventListener(
            "input",
            () => {

                clearTimeout(
                    timer
                );


                timer =
                    window.setTimeout(
                        () => {

                            searchReader(
                                input.value
                            );

                        },
                        120
                    );

            }
        );


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();


                    if (
                        event.shiftKey
                    ) {

                        previousSearchResult();

                    } else {

                        nextSearchResult();

                    }

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    closeSearch();

                }

            }
        );

    }


    /* =====================================================
       SEARCH RESULT EVENTS
    ===================================================== */

    function bindSearchResults() {

        const container =
            getSearchResults();


        if (
            !container ||
            container.dataset.searchBound ===
            "true"
        ) {

            return;

        }


        container.dataset.searchBound =
            "true";


        container.addEventListener(
            "click",
            event => {

                const result =
                    event.target.closest(
                        ".search-result"
                    );


                if (
                    !result
                ) {

                    return;

                }


                event.preventDefault();


                openSearchResult(
                    result.dataset.searchIndex
                );

            }
        );

    }


    /* =====================================================
       SEARCH ACTIONS
    ===================================================== */

    function bindSearchActions() {

        document.addEventListener(
            "click",
            event => {

                const searchButton =
                    event.target.closest(
                        "[data-action='toggle-search'], [data-search-open]"
                    );


                if (
                    searchButton
                ) {

                    event.preventDefault();


                    if (
                        state.searchOpen
                    ) {

                        closeSearch();

                    } else {

                        openSearch();

                    }

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-search-close], .search-close"
                    );


                if (
                    closeButton
                ) {

                    event.preventDefault();

                    closeSearch();

                    return;

                }


                const clearButton =
                    event.target.closest(
                        "[data-search-clear], .search-clear"
                    );


                if (
                    clearButton
                ) {

                    event.preventDefault();

                    clearSearch();

                    return;

                }


                const nextButton =
                    event.target.closest(
                        "[data-search-next]"
                    );


                if (
                    nextButton
                ) {

                    event.preventDefault();

                    nextSearchResult();

                    return;

                }


                const previousButton =
                    event.target.closest(
                        "[data-search-previous]"
                    );


                if (
                    previousButton
                ) {

                    event.preventDefault();

                    previousSearchResult();

                }

            }
        );

    }


    /* =====================================================
       OBSERVE PAGE CHANGES
    ===================================================== */

    function observeReaderPages() {

        const stage =
            document.querySelector(
                ".page-stage"
            );


        if (
            !stage
        ) {

            return;

        }


        if (
            stage.dataset.searchObserverBound ===
            "true"
        ) {

            return;

        }


        stage.dataset.searchObserverBound =
            "true";


        const observer =
            new MutationObserver(
                () => {

                    window.requestAnimationFrame(
                        () => {

                            rebuildSearchIndex();

                        }
                    );

                }
            );


        observer.observe(
            stage,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );


        state.searchObserver =
            observer;

    }


    /* =====================================================
       SEARCH KEYBOARD SHORTCUT
       CTRL/CMD + F
    ===================================================== */

    function bindSearchShortcut() {

        document.addEventListener(
            "keydown",
            event => {

                const modifier =
                    event.ctrlKey ||
                    event.metaKey;


                if (
                    modifier &&
                    event.key.toLowerCase() ===
                    "f"
                ) {

                    event.preventDefault();


                    if (
                        state.searchOpen
                    ) {

                        getSearchInput()?.focus();

                    } else {

                        openSearch();

                    }

                }

            }
        );

    }


    /* =====================================================
       RUNTIME CSS
    ===================================================== */

    function injectSearchCSS() {

        if (
            document.getElementById(
                "chishtilib-search-runtime"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "chishtilib-search-runtime";


        style.textContent = `

            .search-result {

                display:
                    flex;

                flex-direction:
                    column;

                width:
                    100%;

                padding:
                    12px;

                margin:
                    0;

                border:
                    0;

                border-bottom:
                    1px solid
                    rgba(
                        100,
                        27,
                        43,
                        .12
                    );

                background:
                    transparent;

                text-align:
                    left;

                cursor:
                    pointer;

                transition:
                    background .18s ease,
                    transform .18s ease;

            }


            .search-result:hover {

                background:
                    rgba(
                        199,
                        154,
                        59,
                        .08
                    );

            }


            .search-result.active {

                background:
                    rgba(
                        199,
                        154,
                        59,
                        .16
                    );

            }


            .search-result-page {

                font-size:
                    11px;

                font-weight:
                    700;

                color:
                    #c79a3b;

                margin-bottom:
                    5px;

            }


            .search-result-text {

                font-size:
                    13px;

                line-height:
                    1.55;

                color:
                    #3d101b;

            }


            .search-result-text mark {

                background:
                    rgba(
                        199,
                        154,
                        59,
                        .42
                    );

                color:
                    inherit;

                border-radius:
                    3px;

                padding:
                    1px 2px;

            }


            .search-empty {

                display:
                    flex;

                flex-direction:
                    column;

                align-items:
                    center;

                justify-content:
                    center;

                gap:
                    7px;

                min-height:
                    100px;

                padding:
                    20px;

                text-align:
                    center;

                color:
                    rgba(
                        61,
                        16,
                        27,
                        .62
                    );

            }


            .search-hit-page {

                animation:
                    chSearchPageHit
                    1.8s ease;

            }


            @keyframes chSearchPageHit {

                0% {

                    box-shadow:
                        0 0 0 0
                        rgba(
                            199,
                            154,
                            59,
                            0
                        );

                }

                35% {

                    box-shadow:
                        0 0 0 8px
                        rgba(
                            199,
                            154,
                            59,
                            .22
                        );

                }

                100% {

                    box-shadow:
                        0 0 0 0
                        rgba(
                            199,
                            154,
                            59,
                            0
                        );

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.searchReader =
        searchReader;


    R.openSearch =
        openSearch;


    R.closeSearch =
        closeSearch;


    R.clearSearch =
        clearSearch;


    R.nextSearchResult =
        nextSearchResult;


    R.previousSearchResult =
        previousSearchResult;


    R.openSearchResult =
        openSearchResult;


    R.buildSearchIndex =
        buildSearchIndex;


    R.rebuildSearchIndex =
        rebuildSearchIndex;


    R.renderSearchResults =
        renderSearchResults;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeSearch() {

        injectSearchCSS();

        bindSearchInput();

        bindSearchResults();

        bindSearchActions();

        bindSearchShortcut();

        observeReaderPages();


        /*
         * Build index after reader DOM settles.
         */

        window.setTimeout(
            () => {

                rebuildSearchIndex();

            },
            500
        );


        window.setTimeout(
            () => {

                rebuildSearchIndex();

            },
            1500
        );


        console.log(
            "Chishti Library Reader — Search engine loaded — Part 10/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSearch,
            {
                once:
                    true
            }
        );

    } else {

        initializeSearch();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 11 / 14
   SEARCH ENGINE + SEARCH UI + PAGE RESULT NAVIGATION
========================================================= */

(() => {

"use strict";

const R = window.ChishtiReader;

if (!R || !R.state) {

    console.error(
        "ChishtiReader core missing — Part 11."
    );

    return;

}

const state = R.state;


/* =====================================================
   SAFE HELPERS
===================================================== */

function getReader() {

    return document.querySelector(
        ".reader"
    );

}


function getSearchInput() {

    return document.querySelector(
        ".search-input-wrap input, .search-input, [data-search-input]"
    );

}


function getSearchResults() {

    return document.querySelector(
        ".search-results, [data-search-results]"
    );

}


function getSearchContainer() {

    return document.querySelector(
        ".reader-search, .search-panel, [data-search-container]"
    );

}


function getPages() {

    return [
        ...document.querySelectorAll(
            ".reader-page"
        )
    ];

}


function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   SEARCH STATE
===================================================== */

state.searchQuery =
    state.searchQuery || "";

state.searchResults =
    Array.isArray(
        state.searchResults
    )
        ? state.searchResults
        : [];

state.currentSearchIndex =
    safeNumber(
        state.currentSearchIndex,
        -1
    );

state.searching =
    false;

state.searchDebounceTimer =
    null;

state.searchToken =
    0;


/* =====================================================
   EXTRACT PAGE TEXT
===================================================== */

function getPageText(
    page
) {

    if (!page) {

        return "";

    }


    /*
     * Prefer visible text.
     * Ignore controls where possible.
     */

    const clone =
        page.cloneNode(
            true
        );


    clone
        .querySelectorAll(
            "button, input, textarea, select, script, style"
        )
        .forEach(
            element => {

                element.remove();

            }
        );


    return (
        clone.textContent ||
        ""
    )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   BUILD SEARCH INDEX
===================================================== */

function buildSearchIndex() {

    const pages =
        getPages();


    const index = [];


    pages.forEach(
        (
            page,
            indexNumber
        ) => {

            const text =
                getPageText(
                    page
                );


            if (!text) {

                return;

            }


            const pageNumber =
                safeNumber(
                    page.dataset.page ||
                    page.dataset.pageNumber ||
                    indexNumber + 1,
                    indexNumber + 1
                );


            index.push({

                page,

                pageNumber,

                text,

                normalized:
                    text.toLowerCase()

            });

        }
    );


    state.searchIndex =
        index;


    return index;

}


/* =====================================================
   ENSURE INDEX
===================================================== */

function ensureSearchIndex() {

    if (
        Array.isArray(
            state.searchIndex
        ) &&
        state.searchIndex.length
    ) {

        return state.searchIndex;

    }


    return buildSearchIndex();

}


/* =====================================================
   HIGHLIGHT SEARCH TERM
===================================================== */

function highlightText(
    text,
    query
) {

    if (
        !query
    ) {

        return escapeHTML(
            text
        );

    }


    const escapedQuery =
        query.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const regex =
        new RegExp(
            `(${escapedQuery})`,
            "gi"
        );


    const parts =
        String(text)
            .split(regex);


    return parts
        .map(
            part => {

                if (
                    regex.test(
                        part
                    )
                ) {

                    regex.lastIndex =
                        0;

                    return (
                        "<mark class=\"search-highlight\">" +
                        escapeHTML(
                            part
                        ) +
                        "</mark>"
                    );

                }


                regex.lastIndex =
                    0;

                return escapeHTML(
                    part
                );

            }
        )
        .join("");

}


/* =====================================================
   GET SEARCH CONTEXT
===================================================== */

function getSearchContext(
text,
query,
radius = 90
) {

    const source =
        String(
            text || ""
        );


    const lower =
        source.toLowerCase();


    const q =
        String(
            query || ""
        )
            .toLowerCase();


    const position =
        lower.indexOf(
            q
        );


    if (
        position < 0
    ) {

        return source.slice(
            0,
            radius * 2
        );

    }


    const start =
        Math.max(
            0,
            position - radius
        );


    const end =
        Math.min(
            source.length,
            position +
            q.length +
            radius
        );


    let context =
        source.slice(
            start,
            end
        );


    if (
        start > 0
    ) {

        context =
            "…" +
            context;

    }


    if (
        end < source.length
    ) {

        context +=
            "…";

    }


    return context;

}


/* =====================================================
   SEARCH
===================================================== */

function performSearch(
query
) {

    const cleanQuery =
        String(
            query ?? ""
        )
            .trim()
            .toLowerCase();


    state.searchQuery =
        cleanQuery;


    state.currentSearchIndex =
        -1;


    if (
        !cleanQuery
    ) {

        state.searchResults =
            [];

        renderSearchResults();

        return [];

    }


    state.searching =
        true;


    const token =
        ++state.searchToken;


    const index =
        ensureSearchIndex();


    const results = [];


    index.forEach(
        item => {

            if (
                token !==
                state.searchToken
            ) {

                return;

            }


            const position =
                item.normalized.indexOf(
                    cleanQuery
                );


            if (
                position < 0
            ) {

                return;

            }


            const context =
                getSearchContext(
                    item.text,
                    cleanQuery
                );


            results.push({

                page:
                    item.pageNumber,

                pageElement:
                    item.page,

                text:
                    item.text,

                context,

                position

            });

        }
    );


    state.searchResults =
        results;


    state.searching =
        false;


    renderSearchResults();


    if (
        results.length
    ) {

        state.currentSearchIndex =
            0;

        updateSearchSelection();

    }


    return results;

}


/* =====================================================
   RENDER SEARCH RESULTS
===================================================== */

function renderSearchResults() {

    const container =
        getSearchResults();


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const results =
        state.searchResults;


    if (
        !state.searchQuery
    ) {

        container.innerHTML = `
            <div class="search-empty">
                <span>Search this book</span>
            </div>
        `;

        return;

    }


    if (
        !results.length
    ) {

        container.innerHTML = `
            <div class="search-empty search-no-results">
                <span>No results found</span>
            </div>
        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    results.forEach(
        (
            result,
            index
        ) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "search-result";


            item.dataset.searchIndex =
                String(
                    index
                );


            item.innerHTML = `

                <span class="search-result-page">
                    Page ${escapeHTML(
                        result.page
                    )}
                </span>

                <span class="search-result-text">
                    ${highlightText(
                        result.context,
                        state.searchQuery
                    )}
                </span>

            `;


            item.addEventListener(
                "click",
                () => {

                    selectSearchResult(
                        index
                    );

                }
            );


            fragment.appendChild(
                item
            );

        }
    );


    container.appendChild(
        fragment
    );


    updateSearchSelection();

}


/* =====================================================
   UPDATE SEARCH SELECTION
===================================================== */

function updateSearchSelection() {

    const container =
        getSearchResults();


    if (!container) {

        return;

    }


    const items =
        container.querySelectorAll(
            ".search-result"
        );


    items.forEach(
        (
            item,
            index
        ) => {

            item.classList.toggle(
                "active",
                index ===
                state.currentSearchIndex
            );

        }
    );

}


/* =====================================================
   SELECT SEARCH RESULT
===================================================== */

async function selectSearchResult(
index
) {

    const result =
        state.searchResults[
            index
        ];


    if (!result) {

        return false;

    }


    state.currentSearchIndex =
        index;


    updateSearchSelection();


    const page =
        safeNumber(
            result.page,
            1
        );


    /*
     * Prefer the reader's existing
     * page navigation API.
     */

    if (
        typeof R.goToPage ===
        "function"
    ) {

        try {

            await R.goToPage(
                page,
                {
                    notify:
                        false
                }
            );


        } catch (error) {

            console.warn(
                "Could not navigate to search result.",
                error
            );

        }

    } else {

        /*
         * Fallback for readers that only
         * expose state.currentPage.
         */

        state.currentPage =
            page;


        if (
            typeof R.updatePageUI ===
            "function"
        ) {

            R.updatePageUI();

        }

    }


    highlightCurrentPageSearch();


    return true;

}


/* =====================================================
   HIGHLIGHT CURRENT PAGE
===================================================== */

function highlightCurrentPageSearch() {

    const pages =
        getPages();


    pages.forEach(
        page => {

            page
                .querySelectorAll(
                    ".search-active-highlight"
                )
                .forEach(
                    element => {

                        element.classList.remove(
                            "search-active-highlight"
                        );

                    }
                );

        }
    );


    const result =
        state.searchResults[
            state.currentSearchIndex
        ];


    if (!result) {

        return;

    }


    const page =
        result.pageElement;


    if (!page) {

        return;

    }


    page.classList.add(
        "search-page-active"
    );


    window.setTimeout(
        () => {

            page.classList.remove(
                "search-page-active"
            );

        },
        1600
    );

}


/* =====================================================
   NEXT SEARCH RESULT
===================================================== */

function nextSearchResult() {

    const results =
        state.searchResults;


    if (
        !results.length
    ) {

        return false;

    }


    let next =
        state.currentSearchIndex +
        1;


    if (
        next >=
        results.length
    ) {

        next =
            0;

    }


    return selectSearchResult(
        next
    );

}


/* =====================================================
   PREVIOUS SEARCH RESULT
===================================================== */

function previousSearchResult() {

    const results =
        state.searchResults;


    if (
        !results.length
    ) {

        return false;

    }


    let previous =
        state.currentSearchIndex -
        1;


    if (
        previous < 0
    ) {

        previous =
            results.length - 1;

    }


    return selectSearchResult(
        previous
    );

}


/* =====================================================
   CLEAR SEARCH
===================================================== */

function clearSearch() {

    state.searchQuery =
        "";

    state.searchResults =
        [];

    state.currentSearchIndex =
        -1;

    state.searchToken +=
        1;


    const input =
        getSearchInput();


    if (input) {

        input.value =
            "";

    }


    renderSearchResults();

    clearSearchHighlights();

}


/* =====================================================
   CLEAR HIGHLIGHTS
===================================================== */

function clearSearchHighlights() {

    document
        .querySelectorAll(
            ".search-page-active"
        )
        .forEach(
            page => {

                page.classList.remove(
                    "search-page-active"
                );

            }
        );

}


/* =====================================================
   SEARCH INPUT HANDLER
===================================================== */

function handleSearchInput(
event
) {

    const query =
        event.target.value;


    clearTimeout(
        state.searchDebounceTimer
    );


    state.searchDebounceTimer =
        window.setTimeout(
            () => {

                performSearch(
                    query
                );

            },
            180
        );

}


/* =====================================================
   SEARCH KEYBOARD
===================================================== */

function handleSearchKeyboard(
event
) {

    if (
        !state.searchQuery
    ) {

        return;

    }


    if (
        event.key ===
        "Enter"
    ) {

        event.preventDefault();


        if (
            event.shiftKey
        ) {

            previousSearchResult();

        } else {

            nextSearchResult();

        }


        return;

    }


    if (
        event.key ===
        "Escape"
    ) {

        clearSearch();

    }

}


/* =====================================================
   SEARCH OPEN / CLOSE
===================================================== */

function openSearch() {

    const container =
        getSearchContainer();


    const input =
        getSearchInput();


    state.searchOpen =
        true;


    container?.classList.add(
        "open",
        "active"
    );


    input?.focus();


    if (
        state.searchQuery
    ) {

        performSearch(
            state.searchQuery
        );

    }

}


function closeSearch() {

    const container =
        getSearchContainer();


    state.searchOpen =
        false;


    container?.classList.remove(
        "open",
        "active"
    );

}


/* =====================================================
   TOGGLE SEARCH
===================================================== */

function toggleSearch() {

    if (
        state.searchOpen
    ) {

        closeSearch();

    } else {

        openSearch();

    }

}


/* =====================================================
   SEARCH ACTION BINDING
===================================================== */

function bindSearchActions() {

    const input =
        getSearchInput();


    if (input) {

        input.addEventListener(
            "input",
            handleSearchInput
        );


        input.addEventListener(
            "keydown",
            handleSearchKeyboard
        );

    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-search-action]"
                );


            if (!button) {

                return;

            }


            const action =
                button.dataset.searchAction;


            switch (action) {

                case "open":

                    openSearch();

                    break;


                case "close":

                    closeSearch();

                    break;


                case "clear":

                    clearSearch();

                    break;


                case "next":

                    nextSearchResult();

                    break;


                case "previous":

                    previousSearchResult();

                    break;

            }

        }
    );

}


/* =====================================================
   REBUILD INDEX WHEN PAGES CHANGE
===================================================== */

function observeSearchPages() {

    const stage =
        document.querySelector(
            ".page-stage"
        );


    if (!stage) {

        return;

    }


    const observer =
        new MutationObserver(
            () => {

                state.searchIndex =
                    null;

                if (
                    state.searchQuery
                ) {

                    window.requestAnimationFrame(
                        () => {

                            performSearch(
                                state.searchQuery
                            );

                        }
                    );

                }

            }
        );


    observer.observe(
        stage,
        {
            childList:
                true,

            subtree:
                true
        }
    );


    state.searchObserver =
        observer;

}


/* =====================================================
   PUBLIC API
===================================================== */

R.performSearch =
    performSearch;

R.openSearch =
    openSearch;

R.closeSearch =
    closeSearch;

R.toggleSearch =
    toggleSearch;

R.clearSearch =
    clearSearch;

R.nextSearchResult =
    nextSearchResult;

R.previousSearchResult =
    previousSearchResult;

R.selectSearchResult =
    selectSearchResult;

R.buildSearchIndex =
    buildSearchIndex;


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeSearch() {

    bindSearchActions();

    observeSearchPages();

    console.log(
        "Chishti Library Reader — Part 11 loaded."
    );

}


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSearch,
        {
            once:
                true
        }
    );

} else {

    initializeSearch();

}

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 12 / 14
   SEARCH ENGINE + PAGE SEARCH + SEARCH UI
========================================================= */

(() => {

"use strict";


/* =====================================================
   CORE
===================================================== */

const R =
    window.ChishtiReader;

if (
    !R ||
    !R.state
) {

    console.error(
        "ChishtiReader core missing — Part 12."
    );

    return;

}


const state =
    R.state;


/* =====================================================
   SEARCH STATE
===================================================== */

state.searchQuery =
    state.searchQuery ||
    "";

state.searchResults =
    Array.isArray(
        state.searchResults
    )
        ? state.searchResults
        : [];

state.currentSearchIndex =
    Number.isInteger(
        state.currentSearchIndex
    )
        ? state.currentSearchIndex
        : -1;

state.searching =
    false;

state.searchToken =
    0;


/* =====================================================
   DOM HELPERS
===================================================== */

function getSearchInput() {

    return document.querySelector(
        ".search-input-wrap input, " +
        ".search-input, " +
        "[data-search-input]"
    );

}


function getSearchResultsContainer() {

    return document.querySelector(
        ".search-results, " +
        "[data-search-results]"
    );

}


function getSearchClearButton() {

    return document.querySelector(
        ".search-clear, " +
        "[data-search-clear]"
    );

}


function getSearchCount() {

    return document.querySelector(
        ".search-count, " +
        "[data-search-count]"
    );

}


function getReader() {

    return document.querySelector(
        ".reader"
    );

}


/* =====================================================
   NORMALIZE TEXT
===================================================== */

function normalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   HIGHLIGHT SEARCH TEXT
===================================================== */

function highlightText(
    text,
    query
) {

    const source =
        String(
            text ?? ""
        );

    const cleanQuery =
        String(
            query ?? ""
        ).trim();


    if (
        !cleanQuery
    ) {

        return escapeHTML(
            source
        );

    }


    const escapedQuery =
        cleanQuery.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    const regex =
        new RegExp(
            `(${escapedQuery})`,
            "gi"
        );


    const parts =
        source.split(
            regex
        );


    return parts
        .map(
            part => {

                if (
                    regex.test(
                        part
                    )
                ) {

                    regex.lastIndex =
                        0;

                    return (
                        "<mark>" +
                        escapeHTML(
                            part
                        ) +
                        "</mark>"
                    );

                }


                regex.lastIndex =
                    0;


                return escapeHTML(
                    part
                );

            }
        )
        .join("");

}


/* =====================================================
   GET PAGE ELEMENTS
===================================================== */

function getPages() {

    const reader =
        getReader();


    if (!reader) {

        return [];

    }


    return [
        ...reader.querySelectorAll(
            ".reader-page"
        )
    ];

}


/* =====================================================
   GET PAGE TEXT
===================================================== */

function getPageText(
    page,
    index
) {

    if (!page) {

        return "";

    }


    /*
     * Ignore buttons and controls.
     */

    const clone =
        page.cloneNode(
            true
        );


    clone
        .querySelectorAll(
            "button, input, textarea, select, script, style"
        )
        .forEach(
            element => {

                element.remove();

            }
        );


    const text =
        clone.textContent ||
        "";


    return text
        .replace(
            /\s+/g,
            " "
        )
        .trim();

}


/* =====================================================
   SEARCH ONE PAGE
===================================================== */

function searchPage(
    page,
    pageNumber,
    query
) {

    const text =
        getPageText(
            page,
            pageNumber
        );


    const normalizedText =
        normalizeText(
            text
        );

    const normalizedQuery =
        normalizeText(
            query
        );


    if (
        !normalizedQuery ||
        !normalizedText
    ) {

        return null;

    }


    const position =
        normalizedText.indexOf(
            normalizedQuery
        );


    if (
        position === -1
    ) {

        return null;

    }


    return {

        page:
            pageNumber,

        text,

        position,

        query

    };

}


/* =====================================================
   RUN SEARCH
===================================================== */

function performSearch(
    query
) {

    const cleanQuery =
        String(
            query ?? ""
        ).trim();


    state.searchQuery =
        cleanQuery;


    state.searchResults =
        [];

    state.currentSearchIndex =
        -1;


    if (
        !cleanQuery
    ) {

        renderSearchResults();

        updateSearchCount();

        return [];

    }


    state.searching =
        true;


    const token =
        ++state.searchToken;


    const pages =
        getPages();


    pages.forEach(
        (page, index) => {

            if (
                token !==
                state.searchToken
            ) {

                return;

            }


            const result =
                searchPage(
                    page,
                    index + 1,
                    cleanQuery
                );


            if (result) {

                state.searchResults.push(
                    result
                );

            }

        }
    );


    state.searching =
        false;


    renderSearchResults();

    updateSearchCount();


    if (
        state.searchResults.length
    ) {

        state.currentSearchIndex =
            0;

        updateActiveSearchResult();

    }


    return (
        state.searchResults
    );

}


/* =====================================================
   SEARCH RESULT SNIPPET
===================================================== */

function createSnippet(
    text,
    query
) {

    const source =
        String(
            text ?? ""
        );


    const normalizedSource =
        normalizeText(
            source
        );

    const normalizedQuery =
        normalizeText(
            query
        );


    let position =
        normalizedSource.indexOf(
            normalizedQuery
        );


    if (
        position < 0
    ) {

        position = 0;

    }


    const start =
        Math.max(
            0,
            position - 70
        );


    const end =
        Math.min(
            source.length,
            position +
            normalizedQuery.length +
            100
        );


    let snippet =
        source.slice(
            start,
            end
        );


    if (
        start > 0
    ) {

        snippet =
            "…" +
            snippet;

    }


    if (
        end <
        source.length
    ) {

        snippet +=
            "…";

    }


    return snippet;

}


/* =====================================================
   RENDER SEARCH RESULTS
===================================================== */

function renderSearchResults() {

    const container =
        getSearchResultsContainer();


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const results =
        state.searchResults;


    if (
        !state.searchQuery
    ) {

        container.innerHTML =
            `
                <div class="search-empty">
                    <span>⌕</span>
                    <p>Search this book</p>
                </div>
            `;

        return;

    }


    if (
        !results.length
    ) {

        container.innerHTML =
            `
                <div class="search-empty">
                    <span>⌕</span>
                    <p>No results found</p>
                    <small>
                        Try another word or phrase.
                    </small>
                </div>
            `;

        return;

    }


    results.forEach(
        (result, index) => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "search-result-item";


            item.dataset.searchIndex =
                String(
                    index
                );


            const snippet =
                createSnippet(
                    result.text,
                    result.query
                );


            item.innerHTML =
                `
                    <span class="search-result-page">
                        Page ${result.page}
                    </span>

                    <span class="search-result-text">
                        ${highlightText(
                            snippet,
                            result.query
                        )}
                    </span>
                `;


            item.addEventListener(
                "click",
                () => {

                    selectSearchResult(
                        index
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   SEARCH COUNT
===================================================== */

function updateSearchCount() {

    const element =
        getSearchCount();


    if (!element) {

        return;

    }


    const count =
        state.searchResults.length;


    if (
        !state.searchQuery
    ) {

        element.textContent =
            "";

        return;

    }


    element.textContent =
        count === 0
            ? "No results"
            : `${count} result${count === 1 ? "" : "s"}`;

}


/* =====================================================
   ACTIVE SEARCH RESULT
===================================================== */

function updateActiveSearchResult() {

    const container =
        getSearchResultsContainer();


    if (!container) {

        return;

    }


    const items =
        container.querySelectorAll(
            ".search-result-item"
        );


    items.forEach(
        (item, index) => {

            item.classList.toggle(
                "active",
                index ===
                state.currentSearchIndex
            );

        }
    );

}


/* =====================================================
   GO TO SEARCH RESULT
===================================================== */

async function selectSearchResult(
    index
) {

    const result =
        state.searchResults[
            index
        ];


    if (!result) {

        return false;

    }


    state.currentSearchIndex =
        index;


    updateActiveSearchResult();


    const page =
        Number(
            result.page
        );


    /*
     * Prefer existing reader API.
     */

    if (
        typeof R.goToPage ===
        "function"
    ) {

        try {

            await R.goToPage(
                page,
                {
                    notify:
                        false
                }
            );

        } catch (error) {

            console.warn(
                "Search page navigation failed.",
                error
            );

        }

    } else {

        /*
         * Fallback for the basic reader.
         */

        state.currentPage =
            page;


        if (
            typeof R.updatePageUI ===
            "function"
        ) {

            R.updatePageUI();

        }

    }


    highlightCurrentPageMatch(
        result.query
    );


    return true;

}


/* =====================================================
   HIGHLIGHT CURRENT PAGE
===================================================== */

function highlightCurrentPageMatch(
    query
) {

    const pages =
        getPages();


    const currentPage =
        Number(
            state.currentPage ||
            1
        );


    const page =
        pages[
            currentPage - 1
        ];


    if (!page) {

        return;

    }


    page
        .querySelectorAll(
            ".search-highlight"
        )
        .forEach(
            element => {

                const parent =
                    element.parentNode;


                if (!parent) {

                    return;

                }


                parent.replaceChild(
                    document.createTextNode(
                        element.textContent
                    ),
                    element
                );


                parent.normalize();

            }
        );


    if (
        !query
    ) {

        return;

    }


    const walker =
        document.createTreeWalker(
            page,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {

                    if (
                        !node.nodeValue ||
                        !node.nodeValue.trim()
                    ) {

                        return NodeFilter.FILTER_REJECT;

                    }


                    if (
                        node.parentElement?.closest(
                            "button, input, textarea, select, script, style"
                        )
                    ) {

                        return NodeFilter.FILTER_REJECT;

                    }


                    return NodeFilter.FILTER_ACCEPT;

                }

            }
        );


    const nodes =
        [];


    let node;


    while (
        (
            node =
                walker.nextNode()
        )
    ) {

        nodes.push(
            node
        );

    }


    const normalizedQuery =
        normalizeText(
            query
        );


    if (
        !normalizedQuery
    ) {

        return;

    }


    nodes.some(
        textNode => {

            const original =
                textNode.nodeValue;


            const normalized =
                normalizeText(
                    original
                );


            const position =
                normalized.indexOf(
                    normalizedQuery
                );


            if (
                position === -1
            ) {

                return false;

            }


            /*
             * Keep DOM safe:
             * use a simple exact substring
             * when possible.
             */

            const exactPosition =
                original
                    .toLowerCase()
                    .indexOf(
                        String(
                            query
                        ).toLowerCase()
                    );


            if (
                exactPosition === -1
            ) {

                return false;

            }


            const before =
                original.slice(
                    0,
                    exactPosition
                );


            const match =
                original.slice(
                    exactPosition,
                    exactPosition +
                    String(
                        query
                    ).length
                );


            const after =
                original.slice(
                    exactPosition +
                    String(
                        query
                    ).length
                );


            const fragment =
                document.createDocumentFragment();


            if (before) {

                fragment.appendChild(
                    document.createTextNode(
                        before
                    )
                );

            }


            const mark =
                document.createElement(
                    "mark"
                );


            mark.className =
                "search-highlight";


            mark.textContent =
                match;


            fragment.appendChild(
                mark
            );


            if (after) {

                fragment.appendChild(
                    document.createTextNode(
                        after
                    )
                );

            }


            textNode.parentNode.replaceChild(
                fragment,
                textNode
            );


            mark.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "center"
            });


            return true;

        }
    );

}


/* =====================================================
   NEXT SEARCH RESULT
===================================================== */

function nextSearchResult() {

    const results =
        state.searchResults;


    if (
        !results.length
    ) {

        return;

    }


    state.currentSearchIndex =
        (
            state.currentSearchIndex +
            1
        ) %
        results.length;


    selectSearchResult(
        state.currentSearchIndex
    );

}


/* =====================================================
   PREVIOUS SEARCH RESULT
===================================================== */

function previousSearchResult() {

    const results =
        state.searchResults;


    if (
        !results.length
    ) {

        return;

    }


    state.currentSearchIndex =
        (
            state.currentSearchIndex -
            1 +
            results.length
        ) %
        results.length;


    selectSearchResult(
        state.currentSearchIndex
    );

}


/* =====================================================
   CLEAR SEARCH
===================================================== */

function clearSearch() {

    state.searchToken +=
        1;

    state.searching =
        false;

    state.searchQuery =
        "";

    state.searchResults =
        [];

    state.currentSearchIndex =
        -1;


    const input =
        getSearchInput();


    if (input) {

        input.value =
            "";

    }


    const clearButton =
        getSearchClearButton();


    clearButton?.classList.remove(
        "visible",
        "active"
    );


    renderSearchResults();

    updateSearchCount();

}


/* =====================================================
   TOGGLE SEARCH UI
===================================================== */

function openSearch() {

    state.searchOpen =
        true;


    const reader =
        getReader();


    reader?.classList.add(
        "search-open"
    );


    const input =
        getSearchInput();


    if (input) {

        window.setTimeout(
            () => {

                input.focus();

                input.select();

            },
            50
        );

    }

}


function closeSearch() {

    state.searchOpen =
        false;


    getReader()?.classList.remove(
        "search-open"
    );


    clearSearch();

}


function toggleSearch() {

    if (
        state.searchOpen
    ) {

        closeSearch();

    } else {

        openSearch();

    }

}


/* =====================================================
   SEARCH INPUT EVENTS
===================================================== */

function bindSearchInput() {

    const input =
        getSearchInput();


    if (!input) {

        return;

    }


    if (
        input.dataset.searchBound ===
        "true"
    ) {

        return;

    }


    input.dataset.searchBound =
        "true";


    let timer =
        null;


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value;


            const clearButton =
                getSearchClearButton();


            clearButton?.classList.toggle(
                "visible",
                Boolean(
                    query.trim()
                )
            );


            clearTimeout(
                timer
            );


            timer =
                window.setTimeout(
                    () => {

                        performSearch(
                            query
                        );

                    },
                    180
                );

        }
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                if (
                    event.shiftKey
                ) {

                    previousSearchResult();

                } else {

                    nextSearchResult();

                }

                return;

            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                closeSearch();

            }

        }
    );

}


/* =====================================================
   SEARCH BUTTON EVENTS
===================================================== */

function bindSearchButtons() {

    document.addEventListener(
        "click",
        event => {

            const toggle =
                event.target.closest(
                    "[data-action='toggle-search'], [data-toggle-search]"
                );


            if (toggle) {

                event.preventDefault();

                toggleSearch();

                return;

            }


            const clear =
                event.target.closest(
                    ".search-clear, [data-search-clear]"
                );


            if (clear) {

                event.preventDefault();

                clearSearch();

                getSearchInput()?.focus();

                return;

            }


            const next =
                event.target.closest(
                    "[data-search-next]"
                );


            if (next) {

                event.preventDefault();

                nextSearchResult();

                return;

            }


            const previous =
                event.target.closest(
                    "[data-search-previous]"
                );


            if (previous) {

                event.preventDefault();

                previousSearchResult();

            }

        }
    );

}


/* =====================================================
   OBSERVE DYNAMIC SEARCH DOM
===================================================== */

function observeSearchDOM() {

    const observer =
        new MutationObserver(
            () => {

                bindSearchInput();

            }
        );


    observer.observe(
        document.body,
        {
            childList:
                true,

            subtree:
                true
        }
    );


    state.searchObserver =
        observer;

}


/* =====================================================
   PUBLIC API
===================================================== */

R.performSearch =
    performSearch;

R.search =
    performSearch;

R.clearSearch =
    clearSearch;

R.openSearch =
    openSearch;

R.closeSearch =
    closeSearch;

R.toggleSearch =
    toggleSearch;

R.nextSearchResult =
    nextSearchResult;

R.previousSearchResult =
    previousSearchResult;

R.selectSearchResult =
    selectSearchResult;

R.updateSearchResults =
    renderSearchResults;


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeSearch() {

    bindSearchInput();

    bindSearchButtons();

    observeSearchDOM();


    /*
     * Keyboard shortcut:
     * Ctrl/Cmd + F
     */

    document.addEventListener(
        "keydown",
        event => {

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                "f"
            ) {

                /*
                 * Only override browser find
                 * while reader is open.
                 */

                if (
                    state.isReaderOpen
                ) {

                    event.preventDefault();

                    openSearch();

                }

            }

        }
    );


    console.log(
        "Chishti Library Reader — Part 12 loaded."
    );

}


if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSearch,
        {
            once:
                true
        }
    );

} else {

    initializeSearch();

}

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 13 / 14
   READING PROGRESS + SAVE/RESTORE + SCROLL
========================================================= */

(() => {

"use strict";


/* =====================================================
   CORE
===================================================== */

const R =
    window.ChishtiReader;

if (
    !R ||
    !R.state
) {

    console.warn(
        "ChishtiReader core not ready — Part 13 skipped."
    );

    return;

}


const state =
    R.state;


/* =====================================================
   SAFE HELPERS
===================================================== */

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function getReader() {

    return (
        document.querySelector(
            ".reader"
        )
    );

}


function getScrollContainer() {

    return (
        document.querySelector(
            ".reader-viewport"
        ) ||
        document.querySelector(
            ".reader-main"
        ) ||
        getReader()
    );

}


function getPageElements() {

    return [
        ...document.querySelectorAll(
            ".reader-page"
        )
    ];

}


/* =====================================================
   PROGRESS STATE
===================================================== */

state.readingProgress =
    safeNumber(
        state.readingProgress,
        0
    );

state.pageProgress =
    safeNumber(
        state.pageProgress,
        0
    );

state.scrollProgress =
    safeNumber(
        state.scrollProgress,
        0
    );

state.progressDirection =
    state.progressDirection ||
    "forward";

state.lastSavedProgress =
    safeNumber(
        state.lastSavedProgress,
        -1
    );

state.progressSaveTimer =
    null;

state.progressUpdateFrame =
    null;

state.progressObserver =
    null;


/* =====================================================
   STORAGE KEY
===================================================== */

function getProgressStorageKey() {

    const bookId =
        state.bookId ||
        state.currentBookId ||
        state.currentBookName ||
        state.currentBook?.id ||
        state.currentBook?.title ||
        "default-book";


    return (
        "chishtilib_reading_progress_" +
        String(bookId)
            .replace(
                /\s+/g,
                "_"
            )
            .slice(
                0,
                100
            )
    );

}


/* =====================================================
   CALCULATE PAGE PROGRESS
===================================================== */

function calculatePageProgress() {

    const currentPage =
        safeNumber(
            state.currentPage,
            1
        );

    const totalPages =
        safeNumber(
            state.totalPages,
            0
        );


    if (
        totalPages <= 0
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            1,
            currentPage /
            totalPages
        )
    );

}


/* =====================================================
   CALCULATE SCROLL PROGRESS
===================================================== */

function calculateScrollProgress() {

    const container =
        getScrollContainer();


    if (
        !container
    ) {

        return 0;

    }


    const scrollHeight =
        safeNumber(
            container.scrollHeight,
            0
        );

    const clientHeight =
        safeNumber(
            container.clientHeight,
            0
        );

    const scrollTop =
        safeNumber(
            container.scrollTop,
            0
        );


    const maxScroll =
        scrollHeight -
        clientHeight;


    if (
        maxScroll <= 0
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            1,
            scrollTop /
            maxScroll
        )
    );

}


/* =====================================================
   CALCULATE READING PROGRESS
===================================================== */

function calculateReadingProgress() {

    const pageProgress =
        calculatePageProgress();

    const scrollProgress =
        calculateScrollProgress();


    /*
     * Page progress is the primary value.
     * Scroll progress provides smoother movement
     * when a page itself is being scrolled.
     */

    let progress =
        pageProgress;


    if (
        state.totalPages > 0
    ) {

        const page =
            safeNumber(
                state.currentPage,
                1
            );

        const total =
            safeNumber(
                state.totalPages,
                1
            );


        /*
         * Convert current page + intra-page scroll
         * into a continuous book position.
         */

        progress =
            (
                Math.max(
                    0,
                    page - 1
                ) +
                scrollProgress
            ) /
            Math.max(
                1,
                total
            );

    }


    return Math.max(
        0,
        Math.min(
            1,
            progress
        )
    );

}


/* =====================================================
   UPDATE PROGRESS UI
===================================================== */

function updateProgressUI() {

    state.pageProgress =
        calculatePageProgress();


    state.scrollProgress =
        calculateScrollProgress();


    const previousProgress =
        safeNumber(
            state.readingProgress,
            0
        );


    state.readingProgress =
        calculateReadingProgress();


    if (
        state.readingProgress <
        previousProgress
    ) {

        state.progressDirection =
            "backward";

    } else {

        state.progressDirection =
            "forward";

    }


    const percentage =
        Math.round(
            state.readingProgress *
            100
        );


    /*
     * Generic progress elements
     */

    document
        .querySelectorAll(
            "[data-reading-progress]"
        )
        .forEach(
            element => {

                element.style.width =
                    `${percentage}%`;

                element.setAttribute(
                    "aria-valuenow",
                    String(percentage)
                );

            }
        );


    /*
     * Percentage labels
     */

    document
        .querySelectorAll(
            "[data-reading-progress-text]"
        )
        .forEach(
            element => {

                element.textContent =
                    `${percentage}%`;

            }
        );


    /*
     * Current page labels
     */

    document
        .querySelectorAll(
            "[data-current-page]"
        )
        .forEach(
            element => {

                element.textContent =
                    String(
                        state.currentPage ||
                        1
                    );

            }
        );


    /*
     * Total page labels
     */

    document
        .querySelectorAll(
            "[data-total-pages]"
        )
        .forEach(
            element => {

                element.textContent =
                    String(
                        state.totalPages ||
                        1
                    );

            }
        );


    /*
     * CSS custom properties
     */

    const reader =
        getReader();


    if (
        reader
    ) {

        reader.style.setProperty(
            "--reading-progress",
            String(
                state.readingProgress
            )
        );

        reader.style.setProperty(
            "--page-progress",
            String(
                state.pageProgress
            )
        );

        reader.style.setProperty(
            "--scroll-progress",
            String(
                state.scrollProgress
            )
        );

        reader.style.setProperty(
            "--reading-progress-percent",
            `${percentage}%`
        );

        reader.dataset.progressDirection =
            state.progressDirection;

    }


    scheduleProgressSave();

}


/* =====================================================
   REQUEST FRAME UPDATE
===================================================== */

function requestProgressUpdate() {

    if (
        state.progressUpdateFrame
    ) {

        return;

    }


    if (
        typeof window.requestAnimationFrame !==
        "function"
    ) {

        updateProgressUI();

        return;

    }


    state.progressUpdateFrame =
        window.requestAnimationFrame(
            () => {

                state.progressUpdateFrame =
                    null;

                updateProgressUI();

            }
        );

}


/* =====================================================
   SCHEDULE SAVE
===================================================== */

function scheduleProgressSave() {

    const percent =
        Math.round(
            safeNumber(
                state.readingProgress,
                0
            ) *
            100
        );


    if (
        percent ===
        state.lastSavedProgress
    ) {

        return;

    }


    clearTimeout(
        state.progressSaveTimer
    );


    state.progressSaveTimer =
        window.setTimeout(
            () => {

                saveReadingProgress();

            },
            500
        );

}


/* =====================================================
   SAVE READING PROGRESS
===================================================== */

function saveReadingProgress() {

    const key =
        getProgressStorageKey();


    try {

        localStorage.setItem(
            key,
            JSON.stringify({

                page:
                    safeNumber(
                        state.currentPage,
                        1
                    ),

                progress:
                    safeNumber(
                        state.readingProgress,
                        0
                    ),

                scrollProgress:
                    safeNumber(
                        state.scrollProgress,
                        0
                    ),

                timestamp:
                    Date.now()

            })
        );


        state.lastSavedProgress =
            Math.round(
                safeNumber(
                    state.readingProgress,
                    0
                ) *
                100
            );


    } catch (error) {

        console.warn(
            "Could not save reading progress.",
            error
        );

    }

}


/* =====================================================
   RESTORE SAVED PROGRESS
===================================================== */

function restoreReadingProgress() {

    try {

        const raw =
            localStorage.getItem(
                getProgressStorageKey()
            );


        if (
            !raw
        ) {

            return null;

        }


        const saved =
            JSON.parse(
                raw
            );


        if (
            !saved ||
            typeof saved !==
            "object"
        ) {

            return null;

        }


        return saved;


    } catch (error) {

        console.warn(
            "Could not restore reading progress.",
            error
        );

        return null;

    }

}


/* =====================================================
   CONTINUE READING
===================================================== */

async function continueReading() {

    const saved =
        restoreReadingProgress();


    if (
        !saved
    ) {

        return false;

    }


    const page =
        Math.max(
            1,
            Math.floor(
                safeNumber(
                    saved.page,
                    1
                )
            )
        );


    if (
        page <= 1
    ) {

        return false;

    }


    /*
     * Prefer reader's own navigation API.
     */

    if (
        typeof R.goToPage ===
        "function"
    ) {

        try {

            await R.goToPage(
                page,
                {
                    notify: false
                }
            );


            window.requestAnimationFrame(
                () => {

                    requestProgressUpdate();

                }
            );


            return true;


        } catch (error) {

            console.warn(
                "Could not continue reading.",
                error
            );

        }

    }


    /*
     * Fallback for the rewritten core.
     */

    if (
        typeof R.nextPage ===
        "function"
    ) {

        try {

            if (
                typeof R.setPage ===
                "function"
            ) {

                await R.setPage(
                    page
                );

                requestProgressUpdate();

                return true;

            }

        } catch (error) {

            console.warn(
                "Fallback page restore failed.",
                error
            );

        }

    }


    return false;

}


/* =====================================================
   CLEAR SAVED PROGRESS
===================================================== */

function clearReadingProgress() {

    try {

        localStorage.removeItem(
            getProgressStorageKey()
        );

    } catch (error) {

        console.warn(
            "Could not clear reading progress.",
            error
        );

    }


    state.readingProgress =
        0;

    state.pageProgress =
        0;

    state.scrollProgress =
        0;

    state.lastSavedProgress =
        -1;


    requestProgressUpdate();

}


/* =====================================================
   TOP OF READER
===================================================== */

function scrollToTop() {

    const container =
        getScrollContainer();


    if (
        !container
    ) {

        return;

    }


    container.scrollTo({

        top: 0,

        behavior:
            "smooth"

    });

}


/* =====================================================
   BOTTOM OF READER
===================================================== */

function scrollToBottom() {

    const container =
        getScrollContainer();


    if (
        !container
    ) {

        return;

    }


    container.scrollTo({

        top:
            container.scrollHeight,

        behavior:
            "smooth"

    });

}


/* =====================================================
   SHOW / HIDE PROGRESS
===================================================== */

function showProgress() {

    state.progressVisible =
        true;


    getReader()?.classList.add(
        "progress-visible"
    );

}


function hideProgress() {

    state.progressVisible =
        false;


    getReader()?.classList.remove(
        "progress-visible"
    );

}


function toggleProgress() {

    if (
        state.progressVisible
    ) {

        hideProgress();

    } else {

        showProgress();

    }

}


/* =====================================================
   PROGRESS ACTIONS
===================================================== */

function bindProgressActions() {

    if (
        state.progressActionsBound
    ) {

        return;

    }


    state.progressActionsBound =
        true;


    document.addEventListener(
        "click",
        event => {

            const target =
                event.target;


            if (
                !(target instanceof Element)
            ) {

                return;

            }


            const topButton =
                target.closest(
                    "[data-scroll-top]"
                );


            if (
                topButton
            ) {

                event.preventDefault();

                scrollToTop();

                return;

            }


            const bottomButton =
                target.closest(
                    "[data-scroll-bottom]"
                );


            if (
                bottomButton
            ) {

                event.preventDefault();

                scrollToBottom();

                return;

            }


            const continueButton =
                target.closest(
                    "[data-continue-reading]"
                );


            if (
                continueButton
            ) {

                event.preventDefault();

                continueReading();

                return;

            }


            const clearButton =
                target.closest(
                    "[data-clear-reading-progress]"
                );


            if (
                clearButton
            ) {

                event.preventDefault();

                clearReadingProgress();

                return;

            }


            const toggleButton =
                target.closest(
                    "[data-toggle-progress]"
                );


            if (
                toggleButton
            ) {

                event.preventDefault();

                toggleProgress();

            }

        }
    );

}


/* =====================================================
   SCROLL LISTENER
===================================================== */

function bindScrollListener() {

    const container =
        getScrollContainer();


    if (
        !container
    ) {

        return;

    }


    if (
        container.dataset.progressBound ===
        "true"
    ) {

        return;

    }


    container.dataset.progressBound =
        "true";


    container.addEventListener(
        "scroll",
        requestProgressUpdate,
        {
            passive: true
        }
    );

}


/* =====================================================
   PAGE STATE WATCHER
===================================================== */

function watchPageState() {

    if (
        state.pageStateWatcher
    ) {

        return;

    }


    let previousPage =
        state.currentPage;


    state.pageStateWatcher =
        window.setInterval(
            () => {

                const currentPage =
                    state.currentPage;


                if (
                    currentPage !==
                    previousPage
                ) {

                    state.progressDirection =
                        currentPage >
                        previousPage
                            ? "forward"
                            : "backward";


                    previousPage =
                        currentPage;


                    requestProgressUpdate();

                }

            },
            150
        );

}


/* =====================================================
   OBSERVE READER DOM
===================================================== */

function observeReaderChanges() {

    const reader =
        getReader();


    if (
        !reader
    ) {

        return;

    }


    if (
        state.progressObserver
    ) {

        state.progressObserver.disconnect();

    }


    const observer =
        new MutationObserver(
            () => {

                bindScrollListener();

                requestProgressUpdate();

            }
        );


    observer.observe(
        reader,
        {
            childList: true,
            subtree: true
        }
    );


    state.progressObserver =
        observer;

}


/* =====================================================
   MOBILE / RESIZE
===================================================== */

let resizeTimer =
    null;


function handleResize() {

    clearTimeout(
        resizeTimer
    );


    resizeTimer =
        window.setTimeout(
            () => {

                bindScrollListener();

                requestProgressUpdate();

            },
            120
        );

}


/* =====================================================
   PUBLIC API
===================================================== */

R.updateProgress =
    updateProgressUI;


R.requestProgressUpdate =
    requestProgressUpdate;


R.saveReadingProgress =
    saveReadingProgress;


R.restoreReadingProgress =
    restoreReadingProgress;


R.continueReading =
    continueReading;


R.clearReadingProgress =
    clearReadingProgress;


R.scrollToTop =
    scrollToTop;


R.scrollToBottom =
    scrollToBottom;


R.showProgress =
    showProgress;


R.hideProgress =
    hideProgress;


R.toggleProgress =
    toggleProgress;


R.getReadingProgress =
    () =>
        state.readingProgress;


/* =====================================================
   INITIALIZATION
===================================================== */

function initializeProgress() {

    if (
        state.progressInitialized
    ) {

        return;

    }


    state.progressInitialized =
        true;


    bindProgressActions();

    bindScrollListener();

    observeReaderChanges();

    watchPageState();


    window.addEventListener(
        "resize",
        handleResize,
        {
            passive: true
        }
    );


    /*
     * Initial calculation.
     */

    requestProgressUpdate();


    /*
     * Recalculate after PDF/page layout
     * has settled.
     */

    window.setTimeout(
        requestProgressUpdate,
        300
    );


    window.setTimeout(
        requestProgressUpdate,
        1000
    );


    console.log(
        "Chishti Reader — Part 13/14 loaded."
    );

}


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeProgress,
        {
            once: true
        }
    );

} else {

    initializeProgress();

}

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 14 / 14

   FINAL INTEGRATION
   + MOBILE SAFETY
   + STATE RESTORE
   + ANIMATION CLEANUP
   + MAROON / GOLD FINALIZER
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       CORE CHECK
    ===================================================== */

    const R = window.ChishtiReader;

    if (!R || !R.state) {

        console.error(
            "ChishtiReader core missing."
        );

        return;

    }


    const state = R.state;


    /* =====================================================
       FINAL STATE
    ===================================================== */

    state.initialized =
        state.initialized || false;

    state.ready =
        false;

    state.isMobile =
        window.matchMedia(
            "(max-width: 700px)"
        ).matches;

    state.isTablet =
        window.matchMedia(
            "(min-width: 701px) and (max-width: 1024px)"
        ).matches;

    state.isDesktop =
        !state.isMobile &&
        !state.isTablet;

    state.finalIntegration =
        true;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getReader = () =>
        document.querySelector(
            ".reader"
        );


    const getViewport = () =>
        document.querySelector(
            ".reader-viewport"
        );


    const getStage = () =>
        document.querySelector(
            ".page-stage"
        );


    /* =====================================================
       BRAND THEME
    ===================================================== */

    function enforceBrandTheme() {

        const html =
            document.documentElement;

        const body =
            document.body;


        html.dataset.theme =
            "maroon-gold";

        body.dataset.theme =
            "maroon-gold";


        html.classList.add(
            "theme-maroon-gold"
        );

        body.classList.add(
            "theme-maroon-gold"
        );


        html.style.setProperty(
            "--primary",
            "#641b2b"
        );

        html.style.setProperty(
            "--primary-dark",
            "#3d101b"
        );

        html.style.setProperty(
            "--primary-deep",
            "#280a12"
        );

        html.style.setProperty(
            "--secondary",
            "#c79a3b"
        );

        html.style.setProperty(
            "--gold",
            "#c79a3b"
        );

        html.style.setProperty(
            "--gold-light",
            "#e4c66a"
        );

        html.style.setProperty(
            "--gold-dark",
            "#987126"
        );

    }


    /* =====================================================
       RESPONSIVE STATE
    ===================================================== */

    function updateResponsiveState() {

        state.isMobile =
            window.matchMedia(
                "(max-width: 700px)"
            ).matches;

        state.isTablet =
            window.matchMedia(
                "(min-width: 701px) and (max-width: 1024px)"
            ).matches;

        state.isDesktop =
            !state.isMobile &&
            !state.isTablet;


        const html =
            document.documentElement;

        const body =
            document.body;


        html.classList.toggle(
            "is-mobile",
            state.isMobile
        );

        html.classList.toggle(
            "is-tablet",
            state.isTablet
        );

        html.classList.toggle(
            "is-desktop",
            state.isDesktop
        );


        body.classList.toggle(
            "is-mobile",
            state.isMobile
        );

        body.classList.toggle(
            "is-tablet",
            state.isTablet
        );

        body.classList.toggle(
            "is-desktop",
            state.isDesktop
        );


        if (
            typeof R.applyZoom ===
            "function"
        ) {

            requestAnimationFrame(
                () => {

                    try {

                        R.applyZoom(
                            Number(
                                state.zoom
                            ) || 1,
                            {
                                keepFit:
                                    state.fitMode
                            }
                        );

                    } catch (error) {

                        console.warn(
                            "Responsive zoom refresh failed.",
                            error
                        );

                    }

                }
            );

        }

    }


    /* =====================================================
       MOBILE SCROLL SAFETY
    ===================================================== */

    function setupMobileScrollSafety() {

        const viewport =
            getViewport();


        if (!viewport) {

            return;

        }


        viewport.style.overscrollBehavior =
            "contain";


        if (
            state.isMobile
        ) {

            viewport.style.touchAction =
                "pan-x pan-y";

        } else {

            viewport.style.removeProperty(
                "touch-action"
            );

        }

    }


    /* =====================================================
       DOUBLE TAP PROTECTION
    ===================================================== */

    function setupDoubleTapProtection() {

        let lastTap =
            0;


        document.addEventListener(
            "touchend",
            event => {

                if (
                    !event.changedTouches ||
                    event.changedTouches.length !== 1
                ) {

                    return;

                }


                const now =
                    Date.now();


                const isDoubleTap =
                    now - lastTap < 280;


                if (
                    isDoubleTap
                ) {

                    const target =
                        event.target;


                    if (
                        target &&
                        target.closest &&
                        target.closest(
                            ".reader, .reader-page"
                        )
                    ) {

                        event.preventDefault();

                    }

                }


                lastTap =
                    now;

            },
            {
                passive: false
            }
        );

    }


    /* =====================================================
       RIPPLE
    ===================================================== */

    function createRipple(
        element,
        event
    ) {

        if (
            !element ||
            element.dataset.noRipple ===
            "true"
        ) {

            return;

        }


        /*
         * Ripple requires relative positioning.
         * Don't overwrite existing inline position
         * if the element already has one.
         */

        const computed =
            window.getComputedStyle(
                element
            );


        if (
            computed.position ===
            "static"
        ) {

            element.style.position =
                "relative";

        }


        const rect =
            element.getBoundingClientRect();


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "reader-ripple";


        const x =
            Number(
                event.clientX
            ) -
            rect.left;


        const y =
            Number(
                event.clientY
            ) -
            rect.top;


        ripple.style.left =
            `${x}px`;

        ripple.style.top =
            `${y}px`;


        element.appendChild(
            ripple
        );


        window.setTimeout(
            () => {

                ripple.remove();

            },
            600
        );

    }


    function bindRipple() {

        document.addEventListener(
            "pointerdown",
            event => {

                const button =
                    event.target.closest?.(
                        "button, .reader-button, [role='button']"
                    );


                if (!button) {

                    return;

                }


                createRipple(
                    button,
                    event
                );

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       FINAL RUNTIME CSS
    ===================================================== */

    function injectFinalCSS() {

        if (
            document.getElementById(
                "chishtilib-final-runtime"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "chishtilib-final-runtime";


        style.textContent = `

            :root {

                --ch-final-maroon:
                    #641b2b;

                --ch-final-maroon-dark:
                    #3d101b;

                --ch-final-maroon-deep:
                    #280a12;

                --ch-final-gold:
                    #c79a3b;

                --ch-final-gold-light:
                    #e4c66a;

            }


            /* =====================================
               RIPPLE
            ===================================== */

            .reader-ripple {

                position:
                    absolute;

                width:
                    18px;

                height:
                    18px;

                border-radius:
                    50%;

                pointer-events:
                    none;

                transform:
                    translate(-50%, -50%)
                    scale(0);

                background:
                    rgba(
                        228,
                        198,
                        106,
                        .45
                    );

                animation:
                    chReaderRipple
                    .55s ease-out
                    forwards;

                z-index:
                    9999;

            }


            @keyframes chReaderRipple {

                0% {

                    transform:
                        translate(-50%, -50%)
                        scale(0);

                    opacity:
                        .9;

                }

                100% {

                    transform:
                        translate(-50%, -50%)
                        scale(8);

                    opacity:
                        0;

                }

            }


            /* =====================================
               GOLD FOCUS
            ===================================== */

            .reader button:focus-visible,
            .reader [role="button"]:focus-visible,
            .reader input:focus-visible {

                outline:
                    2px solid
                    var(--ch-final-gold-light);

                outline-offset:
                    3px;

                box-shadow:
                    0 0 0 4px
                    rgba(
                        199,
                        154,
                        59,
                        .18
                    );

            }


            /* =====================================
               MOBILE
            ===================================== */

            @media (max-width: 700px) {

                html,
                body {

                    width:
                        100%;

                    max-width:
                        100%;

                    overflow-x:
                        hidden;

                }


                .reader {

                    width:
                        100%;

                    max-width:
                        100%;

                }


                .reader-viewport {

                    width:
                        100%;

                    max-width:
                        100%;

                    overflow:
                        auto;

                    -webkit-overflow-scrolling:
                        touch;

                }


                .page-stage {

                    min-width:
                        100%;

                    padding-left:
                        10px;

                    padding-right:
                        10px;

                    box-sizing:
                        border-box;

                }


                .reader-page {

                    max-width:
                        calc(
                            100vw - 20px
                        );

                }


                .reader button {

                    min-width:
                        42px;

                    min-height:
                        42px;

                }

            }


            /* =====================================
               TABLET
            ===================================== */

            @media (
                min-width: 701px
            ) and (
                max-width: 1024px
            ) {

                .reader-page {

                    max-width:
                        calc(
                            100vw - 50px
                        );

                }

            }


            /* =====================================
               REDUCED MOTION
            ===================================== */

            @media (
                prefers-reduced-motion: reduce
            ) {

                *,
                *::before,
                *::after {

                    animation-duration:
                        .01ms !important;

                    animation-iteration-count:
                        1 !important;

                    transition-duration:
                        .01ms !important;

                    scroll-behavior:
                        auto !important;

                }

            }


            /* =====================================
               PRINT
            ===================================== */

            @media print {

                .reader-toolbar,
                .reader-topbar,
                .reader-bottombar,
                .reader-controls,
                .reader-sidebar,
                .reader-search,
                .reader-overlay {

                    display:
                        none !important;

                }


                .reader,
                .reader-viewport,
                .page-stage {

                    overflow:
                        visible !important;

                    height:
                        auto !important;

                    max-height:
                        none !important;

                }


                .reader-page {

                    box-shadow:
                        none !important;

                    transform:
                        none !important;

                    break-after:
                        page;

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       CLEAN OLD ANIMATION CLASSES
    ===================================================== */

    function cleanupAnimationClasses() {

        const reader =
            getReader();


        if (!reader) {

            return;

        }


        reader.classList.remove(
            "page-enter",
            "page-exit",
            "is-changing",
            "loading-animation"
        );

    }


    /* =====================================================
       FINAL PAGE APPEARANCE
    ===================================================== */

    function finalizePage() {

        const stage =
            getStage();


        if (!stage) {

            return;

        }


        const pages =
            stage.querySelectorAll(
                ".reader-page"
            );


        pages.forEach(
            page => {

                page.style.setProperty(
                    "--theme-primary",
                    "#641b2b"
                );

                page.style.setProperty(
                    "--theme-gold",
                    "#c79a3b"
                );

                page.classList.add(
                    "book-paper"
                );

            }
        );


        if (
            typeof R.applyPageAppearance ===
            "function"
        ) {

            try {

                R.applyPageAppearance();

            } catch (error) {

                console.warn(
                    "Page appearance refresh failed.",
                    error
                );

            }

        }


        if (
            typeof R.updateZoomUI ===
            "function"
        ) {

            try {

                R.updateZoomUI();

            } catch (error) {

                console.warn(
                    "Zoom UI refresh failed.",
                    error
                );

            }

        }

    }


    /* =====================================================
       RESTORE UI STATE
    ===================================================== */

    function restoreFinalState() {

        /*
         * Theme
         */

        if (
            typeof R.applyTheme ===
            "function"
        ) {

            try {

                R.applyTheme(
                    "maroon-gold"
                );

            } catch (error) {

                console.warn(
                    "Theme restore failed.",
                    error
                );

            }

        }


        /*
         * Reader light
         */

        if (
            state.readerLight &&
            typeof R.enableReaderLight ===
            "function"
        ) {

            try {

                R.enableReaderLight();

            } catch (error) {

                console.warn(
                    "Reader light restore failed.",
                    error
                );

            }

        }


        /*
         * Page glow
         */

        if (
            state.pageGlow &&
            typeof R.enablePageGlow ===
            "function"
        ) {

            try {

                R.enablePageGlow();

            } catch (error) {

                console.warn(
                    "Page glow restore failed.",
                    error
                );

            }

        }


        /*
         * Zoom
         */

        if (
            typeof R.applyZoom ===
            "function"
        ) {

            try {

                R.applyZoom(
                    Number(
                        state.zoom
                    ) || 1,
                    {
                        keepFit:
                            state.fitMode
                    }
                );

            } catch (error) {

                console.warn(
                    "Zoom restore failed.",
                    error
                );

            }

        }

    }


    /* =====================================================
       ERROR RECOVERY
    ===================================================== */

    function installErrorRecovery() {

        window.addEventListener(
            "error",
            event => {

                if (
                    event &&
                    event.error
                ) {

                    console.warn(
                        "Reader runtime recovered from an error:",
                        event.error
                    );

                }

            }
        );


        window.addEventListener(
            "unhandledrejection",
            event => {

                console.warn(
                    "Reader async operation rejected:",
                    event.reason
                );


                /*
                 * Reset temporary search state
                 * only if the state property exists.
                 */

                if (
                    "searching" in state
                ) {

                    state.searching =
                        false;

                }

            }
        );

    }


    /* =====================================================
       PAGE VISIBILITY
    ===================================================== */

    function setupVisibilityOptimization() {

        const reader =
            getReader();

        const viewport =
            getViewport();


        if (
            !reader ||
            !viewport ||
            typeof IntersectionObserver !==
            "function"
        ) {

            return;

        }


        /*
         * Disconnect old observer first.
         * This prevents duplicate observers
         * when pages are dynamically replaced.
         */

        if (
            state.visibilityObserver &&
            typeof state.visibilityObserver.disconnect ===
            "function"
        ) {

            try {

                state.visibilityObserver.disconnect();

            } catch (_) {}

        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            const page =
                                entry.target;


                            if (
                                entry.isIntersecting
                            ) {

                                page.classList.add(
                                    "page-visible"
                                );

                            } else {

                                page.classList.remove(
                                    "page-visible"
                                );

                            }

                        }
                    );

                },
                {
                    root:
                        viewport,

                    threshold:
                        0.01

                }
            );


        reader
            .querySelectorAll(
                ".reader-page"
            )
            .forEach(
                page => {

                    observer.observe(
                        page
                    );

                }
            );


        state.visibilityObserver =
            observer;

    }


    /* =====================================================
       OBSERVE DYNAMIC PAGES
    ===================================================== */

    function observeFinalPageChanges() {

        const stage =
            getStage();


        if (!stage) {

            return;

        }


        if (
            state.finalPageObserver &&
            typeof state.finalPageObserver.disconnect ===
            "function"
        ) {

            try {

                state.finalPageObserver.disconnect();

            } catch (_) {}

        }


        const observer =
            new MutationObserver(
                () => {

                    requestAnimationFrame(
                        () => {

                            finalizePage();

                            setupVisibilityOptimization();

                        }
                    );

                }
            );


        observer.observe(
            stage,
            {
                childList: true,
                subtree: true
            }
        );


        state.finalPageObserver =
            observer;

    }


    /* =====================================================
       KEYBOARD SAFETY
    ===================================================== */

    function bindFinalKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;

                }


                if (
                    state.searchOpen &&
                    typeof R.closeSearch ===
                    "function"
                ) {

                    try {

                        R.closeSearch();

                    } catch (error) {

                        console.warn(
                            "Could not close search.",
                            error
                        );

                    }

                }


                if (
                    typeof R.closeMenu ===
                    "function"
                ) {

                    try {

                        R.closeMenu();

                    } catch (error) {

                        console.warn(
                            "Could not close menu.",
                            error
                        );

                    }

                }

            }
        );

    }


    /* =====================================================
       FINAL RESIZE
    ===================================================== */

    let finalResizeTimer =
        null;


    function finalResize() {

        clearTimeout(
            finalResizeTimer
        );


        finalResizeTimer =
            setTimeout(
                () => {

                    updateResponsiveState();

                    setupMobileScrollSafety();

                    finalizePage();

                    setupVisibilityOptimization();

                },
                150
            );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.finalize =
        finalizePage;


    R.refreshResponsive =
        updateResponsiveState;


    R.enforceBrandTheme =
        enforceBrandTheme;


    /* =====================================================
       MAIN INITIALIZER
    ===================================================== */

    function initializeFinalIntegration() {

        if (
            state.ready
        ) {

            return;

        }


        injectFinalCSS();

        enforceBrandTheme();

        updateResponsiveState();

        setupMobileScrollSafety();

        setupDoubleTapProtection();

        bindRipple();

        bindFinalKeyboard();

        installErrorRecovery();

        restoreFinalState();

        cleanupAnimationClasses();

        finalizePage();

        observeFinalPageChanges();

        setupVisibilityOptimization();


        /*
         * Avoid duplicate resize listeners.
         */

        if (
            !state.finalResizeBound
        ) {

            state.finalResizeBound =
                true;


            window.addEventListener(
                "resize",
                finalResize,
                {
                    passive: true
                }
            );

        }


        /*
         * Give Parts 1–13 time to finish.
         */

        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        state.ready =
                            true;

                        state.initialized =
                            true;


                        document.documentElement
                            .classList.add(
                                "reader-ready"
                            );


                        document.body
                            .classList.add(
                                "reader-ready"
                            );


                        console.log(
                            "===================================="
                        );

                        console.log(
                            "Chishti Library Reader READY"
                        );

                        console.log(
                            "Theme: Maroon + Golden"
                        );

                        console.log(
                            "Responsive: Mobile + Tablet + Desktop"
                        );

                        console.log(
                            "Animation: Enabled"
                        );

                        console.log(
                            "Search: Enabled"
                        );

                        console.log(
                            "Zoom: Enabled"
                        );

                        console.log(
                            "JS Parts: 1–14"
                        );

                        console.log(
                            "===================================="
                        );

                    }
                );

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeFinalIntegration,
            {
                once: true
            }
        );

    } else {

        initializeFinalIntegration();

    }


})();
