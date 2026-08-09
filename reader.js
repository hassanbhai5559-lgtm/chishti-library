/* =========================================================
   CHISHTI READER
   DIGITAL BOOK READER
   JAVASCRIPT — PART 1 / 9

   CORE STATE
   DOM REFERENCES
   INITIALIZATION
   SAFE HELPERS

   IMPORTANT:
   - No loading screen
   - No fake progress
   - No recursive getViewport()
   - CHISHTI READER branding
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL READER STATE
    ===================================================== */

    const ReaderState = {

        /* ---------------------------------------------
           Application
        --------------------------------------------- */

        initialized: false,

        readerOpen: false,

        openingBook: false,

        closingReader: false,


        /* ---------------------------------------------
           Current Book
        --------------------------------------------- */

        currentBook: null,

        currentBookUrl: "",

        currentBookTitle: "",

        currentBookAuthor: "",


        /* ---------------------------------------------
           PDF
        --------------------------------------------- */

        pdfDocument: null,

        pdfLoading: false,

        totalPages: 0,


        /* ---------------------------------------------
           Page
        --------------------------------------------- */

        currentPage: 1,

        leftPage: 1,

        rightPage: 2,


        /* ---------------------------------------------
           Reader View
        --------------------------------------------- */

        pageMode: "two-page",

        fitMode: "width",

        zoom: 1,

        minZoom: 0.5,

        maxZoom: 3,

        zoomStep: 0.1,


        /* ---------------------------------------------
           Reader UI
        --------------------------------------------- */

        settingsOpen: false,

        searchOpen: false,

        bookmarksOpen: false,

        contentsOpen: false,

        commentsOpen: false,

        shareOpen: false,

        bookInfoOpen: false,

        thumbnailsOpen: false,

        navigationOpen: false,

        modalOpen: false,


        /* ---------------------------------------------
           Reader Features
        --------------------------------------------- */

        watermarkVisible: true,

        pageNumbersVisible: true,

        rememberPosition: true,

        liked: false,


        /* ---------------------------------------------
           Reading
        --------------------------------------------- */

        bookmarks: [],

        readingProgress: 0,


        /* ---------------------------------------------
           Search
        --------------------------------------------- */

        searchQuery: "",

        searchResults: [],

        searchIndex: -1,


        /* ---------------------------------------------
           Opening Animation
        --------------------------------------------- */

        openingTimer: null,

        openingDuration: 1150,


        /* ---------------------------------------------
           UI Timers
        --------------------------------------------- */

        toastTimer: null,

        controlsTimer: null,


        /* ---------------------------------------------
           Touch
        --------------------------------------------- */

        touchStartX: 0,

        touchStartY: 0,

        touchEndX: 0,

        touchEndY: 0,


        /* ---------------------------------------------
           Rendering
        --------------------------------------------- */

        renderToken: 0,

        rendering: false,


        /* ---------------------------------------------
           Fullscreen
        --------------------------------------------- */

        fullscreen: false

    };



    /* =====================================================
       DOM CACHE
    ===================================================== */

    const DOM = {};


    function cacheDOM() {

        /* ---------------------------------------------
           Main Reader
        --------------------------------------------- */

        DOM.reader =
            document.querySelector(
                "#chishtilib-reader"
            );


        DOM.readerMain =
            document.querySelector(
                "#readerMain"
            );


        DOM.viewport =
            document.querySelector(
                "#readerViewport"
            );


        DOM.stage =
            document.querySelector(
                "#readerPageStage"
            );


        /* ---------------------------------------------
           Opening Animation
        --------------------------------------------- */

        DOM.opening =
            document.querySelector(
                "#readerOpening"
            );


        DOM.openingBook =
            document.querySelector(
                "#openingBook"
            );


        DOM.openingWhiteLight =
            document.querySelector(
                "#openingWhiteLight"
            );


        /* ---------------------------------------------
           Pages
        --------------------------------------------- */

        DOM.leftPage =
            document.querySelector(
                "#readerPageLeft"
            );


        DOM.rightPage =
            document.querySelector(
                "#readerPageRight"
            );


        DOM.leftPageElement =
            document.querySelector(
                "#readerPageLeft .reader-page"
            );


        DOM.rightPageElement =
            document.querySelector(
                "#readerPageRight .reader-page"
            );


        DOM.leftCanvas =
            document.querySelector(
                "#readerPageLeft .reader-page-canvas"
            );


        DOM.rightCanvas =
            document.querySelector(
                "#readerPageRight .reader-page-canvas"
            );


        DOM.leftTextLayer =
            document.querySelector(
                "#readerPageLeft .reader-page-text-layer"
            );


        DOM.rightTextLayer =
            document.querySelector(
                "#readerPageRight .reader-page-text-layer"
            );


        /* ---------------------------------------------
           Header
        --------------------------------------------- */

        DOM.header =
            document.querySelector(
                "#readerHeader"
            );


        DOM.headerSearch =
            document.querySelector(
                "#headerSearchButton"
            );


        DOM.headerSettings =
            document.querySelector(
                "#headerSettingsButton"
            );


        DOM.bookTitle =
            document.querySelector(
                "#readerBookTitle"
            );


        DOM.readingStatus =
            document.querySelector(
                "#readerReadingStatus"
            );


        /* ---------------------------------------------
           Toolbar
        --------------------------------------------- */

        DOM.toolbar =
            document.querySelector(
                "#readerToolbar"
            );


        /* ---------------------------------------------
           Footer
        --------------------------------------------- */

        DOM.footer =
            document.querySelector(
                "#readerFooter"
            );


        /* ---------------------------------------------
           Page Navigation
        --------------------------------------------- */

        DOM.previousPage =
            document.querySelector(
                "#previousPageButton"
            );


        DOM.nextPage =
            document.querySelector(
                "#nextPageButton"
            );


        DOM.pageInput =
            document.querySelector(
                "#readerPageInput"
            );


        DOM.totalPages =
            document.querySelector(
                "#readerTotalPages"
            );


        /* ---------------------------------------------
           Book Navigation
        --------------------------------------------- */

        DOM.previousBook =
            document.querySelector(
                "#previousBookButton"
            );


        DOM.nextBook =
            document.querySelector(
                "#nextBookButton"
            );


        /* ---------------------------------------------
           Zoom
        --------------------------------------------- */

        DOM.zoomOut =
            document.querySelector(
                "#zoomOutButton"
            );


        DOM.zoomReset =
            document.querySelector(
                "#zoomResetButton"
            );


        DOM.zoomIn =
            document.querySelector(
                "#zoomInButton"
            );


        /* ---------------------------------------------
           Overlay
        --------------------------------------------- */

        DOM.overlay =
            document.querySelector(
                "#readerOverlay"
            );


        /* ---------------------------------------------
           Search
        --------------------------------------------- */

        DOM.searchBar =
            document.querySelector(
                "#readerSearchBar"
            );


        DOM.searchInput =
            document.querySelector(
                "#readerSearchInput"
            );


        DOM.searchResults =
            document.querySelector(
                "#readerSearchResults"
            );


        /* ---------------------------------------------
           Panels
        --------------------------------------------- */

        DOM.settingsPanel =
            document.querySelector(
                "#readerSettingsPanel"
            );


        DOM.bookInfoPanel =
            document.querySelector(
                "#readerBookInfoPanel"
            );


        DOM.bookmarksPanel =
            document.querySelector(
                "#readerBookmarksPanel"
            );


        DOM.commentsPanel =
            document.querySelector(
                "#readerCommentsPanel"
            );


        DOM.sharePanel =
            document.querySelector(
                "#readerSharePanel"
            );


        DOM.navigationPanel =
            document.querySelector(
                "#readerNavigationPanel"
            );


        DOM.contentsPanel =
            document.querySelector(
                "#readerContentsPanel"
            );


        DOM.thumbnailsPanel =
            document.querySelector(
                "#readerThumbnailsPanel"
            );


        /* ---------------------------------------------
           Lists
        --------------------------------------------- */

        DOM.bookmarksList =
            document.querySelector(
                "#readerBookmarksList"
            );


        DOM.contentsList =
            document.querySelector(
                "#readerContentsList"
            );


        DOM.thumbnailsList =
            document.querySelector(
                "#readerThumbnailsList"
            );


        DOM.commentsList =
            document.querySelector(
                "#readerCommentsList"
            );


        /* ---------------------------------------------
           Settings
        --------------------------------------------- */

        DOM.pageMode =
            document.querySelector(
                "#readerPageMode"
            );


        DOM.fitMode =
            document.querySelector(
                "#readerFitMode"
            );


        DOM.watermark =
            document.querySelector(
                "#readerWatermark"
            );


        DOM.showPageNumbers =
            document.querySelector(
                "#readerShowPageNumbers"
            );


        DOM.rememberPosition =
            document.querySelector(
                "#readerRememberPosition"
            );


        /* ---------------------------------------------
           Social
        --------------------------------------------- */

        DOM.likeButton =
            document.querySelector(
                "#readerLikeButton"
            );


        DOM.shareButton =
            document.querySelector(
                "#readerShareButton"
            );


        DOM.commentButton =
            document.querySelector(
                "#readerCommentButton"
            );


        /* ---------------------------------------------
           Book Information
        --------------------------------------------- */

        DOM.bookCover =
            document.querySelector(
                "#readerBookCover"
            );


        DOM.infoTitle =
            document.querySelector(
                "#readerInfoTitle"
            );


        DOM.infoAuthor =
            document.querySelector(
                "#readerInfoAuthor"
            );


        DOM.infoTotalPages =
            document.querySelector(
                "#readerInfoTotalPages"
            );


        DOM.infoCurrentPage =
            document.querySelector(
                "#readerInfoCurrentPage"
            );


        /* ---------------------------------------------
           Toast
        --------------------------------------------- */

        DOM.toast =
            document.querySelector(
                "#readerToast"
            );


        DOM.toastIcon =
            document.querySelector(
                "#readerToastIcon"
            );


        DOM.toastMessage =
            document.querySelector(
                "#readerToastMessage"
            );


        /* ---------------------------------------------
           Error
        --------------------------------------------- */

        DOM.error =
            document.querySelector(
                "#readerError"
            );


        DOM.errorMessage =
            document.querySelector(
                "#readerErrorMessage"
            );


        /* ---------------------------------------------
           Empty
        --------------------------------------------- */

        DOM.empty =
            document.querySelector(
                "#readerEmpty"
            );


        /* ---------------------------------------------
           Modal
        --------------------------------------------- */

        DOM.shortcutsModal =
            document.querySelector(
                "#readerShortcutsModal"
            );


        /* ---------------------------------------------
           Live Region
        --------------------------------------------- */

        DOM.liveRegion =
            document.querySelector(
                "#readerLiveRegion"
            );


        /* ---------------------------------------------
           Print
        --------------------------------------------- */

        DOM.printArea =
            document.querySelector(
                "#readerPrintArea"
            );


        /* ---------------------------------------------
           Hidden Book Data
        --------------------------------------------- */

        DOM.bookData =
            document.querySelector(
                "#readerBookData"
            );


        DOM.bookUrl =
            document.querySelector(
                "#readerBookUrl"
            );


        DOM.bookName =
            document.querySelector(
                "#readerBookName"
            );

    }



    /* =====================================================
       SAFE DOM HELPERS
    ===================================================== */

    function $(selector, parent = document) {

        return parent.querySelector(
            selector
        );

    }


    function $$(selector, parent = document) {

        return Array.from(
            parent.querySelectorAll(
                selector
            )
        );

    }


    function exists(element) {

        return Boolean(
            element
        );

    }


    function setText(
        element,
        value
    ) {

        if (!element) {
            return;
        }

        element.textContent =
            value ?? "";

    }


    function setAttribute(
        element,
        attribute,
        value
    ) {

        if (!element) {
            return;
        }

        element.setAttribute(
            attribute,
            String(value)
        );

    }


    function toggleClass(
        element,
        className,
        force
    ) {

        if (!element) {
            return;
        }

        element.classList.toggle(
            className,
            force
        );

    }


    function showElement(
        element
    ) {

        if (!element) {
            return;
        }

        element.hidden =
            false;

        element.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function hideElement(
        element
    ) {

        if (!element) {
            return;
        }

        element.hidden =
            true;

        element.setAttribute(
            "aria-hidden",
            "true"
        );

    }



    /* =====================================================
       SAFE NUMBER HELPERS
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


    function safeInteger(
        value,
        fallback = 0
    ) {

        const number =
            Number.parseInt(
                value,
                10
            );

        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    }


    /* =====================================================
       INITIAL READER STATE
    ===================================================== */

    function initializeState() {

        ReaderState.zoom =
            1;

        ReaderState.currentPage =
            1;

        ReaderState.leftPage =
            1;

        ReaderState.rightPage =
            2;

        ReaderState.pageMode =
            "two-page";

        ReaderState.fitMode =
            "width";

        ReaderState.watermarkVisible =
            true;

        ReaderState.pageNumbersVisible =
            true;

    }



    /* =====================================================
       INITIAL DOM STATE
    ===================================================== */

    function initializeDOMState() {

        if (!DOM.reader) {
            return;
        }


        DOM.reader.classList.remove(
            "active",
            "open",
            "closing",
            "focus-mode"
        );


        setAttribute(
            DOM.reader,
            "aria-hidden",
            "true"
        );


        hideElement(
            DOM.overlay
        );


        hideElement(
            DOM.searchBar
        );


        hideElement(
            DOM.settingsPanel
        );


        hideElement(
            DOM.bookInfoPanel
        );


        hideElement(
            DOM.bookmarksPanel
        );


        hideElement(
            DOM.commentsPanel
        );


        hideElement(
            DOM.sharePanel
        );


        hideElement(
            DOM.navigationPanel
        );


        hideElement(
            DOM.contentsPanel
        );


        hideElement(
            DOM.thumbnailsPanel
        );


        hideElement(
            DOM.shortcutsModal
        );


        hideElement(
            DOM.error
        );


        hideElement(
            DOM.empty
        );

    }



    /* =====================================================
       CHISHTI READER BRANDING
    ===================================================== */

    function applyReaderBranding() {

        if (DOM.bookTitle) {

            if (
                !ReaderState.currentBookTitle
            ) {

                setText(
                    DOM.bookTitle,
                    "CHISHTI READER"
                );

            }

        }


        if (DOM.readingStatus) {

            setText(
                DOM.readingStatus,
                "Reading"
            );

        }


        if (DOM.watermark) {

            DOM.watermark.checked =
                ReaderState.watermarkVisible;

        }


        /* ---------------------------------------------
           Force watermark text
           on both page elements.
        --------------------------------------------- */

        const watermarks =
            $$(".reader-page-watermark");


        watermarks.forEach(
            watermark => {

                watermark.textContent =
                    "CHISHTI READER";

            }
        );

    }



    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeReader() {

        if (
            ReaderState.initialized
        ) {

            return;

        }


        cacheDOM();


        initializeState();


        initializeDOMState();


        applyReaderBranding();


        ReaderState.initialized =
            true;


        console.log(
            "CHISHTI READER — Part 1/9 initialized."
        );

    }



    /* =====================================================
       DOM READY
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeReader,
            {
                once: true
            }
        );

    } else {

        initializeReader();

    }


})();
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 2 / 9

   DOM CACHE + READER ELEMENT ACCESS
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       USE EXISTING GLOBAL READER OBJECT
    ===================================================== */

    const R =
        window.ChishtiReader ||
        (window.ChishtiReader = {});


    /* =====================================================
       INTERNAL STATE
    ===================================================== */

    const state =
        R.state ||
        (R.state = {});


    state.dom =
        state.dom ||
        {};



    /* =====================================================
       SAFE QUERY HELPERS
    ===================================================== */

    function query(
        selector,
        parent = document
    ) {

        if (
            !selector ||
            !parent ||
            typeof parent.querySelector !== "function"
        ) {

            return null;

        }


        try {

            return parent.querySelector(
                selector
            );

        } catch (error) {

            console.warn(
                "CHISHTI READER: Invalid selector",
                selector,
                error
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
            typeof parent.querySelectorAll !== "function"
        ) {

            return [];

        }


        try {

            return Array.from(
                parent.querySelectorAll(
                    selector
                )
            );

        } catch (error) {

            console.warn(
                "CHISHTI READER: Invalid selector",
                selector,
                error
            );

            return [];

        }

    }



    /* =====================================================
       CACHE ONE ELEMENT
    ===================================================== */

    function cacheElement(
        key,
        selectors
    ) {

        if (!key) {

            return null;

        }


        const list =
            Array.isArray(selectors)
                ? selectors
                : [selectors];


        let element =
            null;


        for (
            const selector of list
        ) {

            element =
                query(
                    selector
                );


            if (element) {

                break;

            }

        }


        state.dom[key] =
            element;


        return element;

    }



    /* =====================================================
       CACHE READER DOM
       
       IMPORTANT:
       We cache real DOM elements directly.

       We DO NOT call:
       
       R.getViewport()
       R.getStage()
       R.getReader()

       from inside these getters.

       This prevents recursive call-stack errors.
    ===================================================== */

    function cacheReaderDOM() {

        cacheElement(
            "reader",
            [
                "#chishtilib-reader",
                "#reader",
                ".reader"
            ]
        );


        cacheElement(
            "header",
            [
                "#readerHeader",
                ".reader-header"
            ]
        );


        cacheElement(
            "main",
            [
                "#readerMain",
                ".reader-main"
            ]
        );


        cacheElement(
            "viewport",
            [
                "#readerViewport",
                ".reader-viewport"
            ]
        );


        cacheElement(
            "stage",
            [
                "#readerPageStage",
                ".reader-page-stage",
                ".page-stage"
            ]
        );


        cacheElement(
            "leftPage",
            [
                "#readerPageLeft",
                ".reader-page-left"
            ]
        );


        cacheElement(
            "rightPage",
            [
                "#readerPageRight",
                ".reader-page-right"
            ]
        );


        cacheElement(
            "toolbar",
            [
                "#readerToolbar",
                ".reader-toolbar"
            ]
        );


        cacheElement(
            "footer",
            [
                "#readerFooter",
                ".reader-footer"
            ]
        );


        cacheElement(
            "overlay",
            [
                "#readerOverlay",
                ".reader-overlay"
            ]
        );


        cacheElement(
            "searchBar",
            [
                "#readerSearchBar",
                ".reader-search-bar"
            ]
        );


        cacheElement(
            "searchInput",
            [
                "#readerSearchInput",
                ".reader-search-input"
            ]
        );


        cacheElement(
            "searchResults",
            [
                "#readerSearchResults",
                ".reader-search-results"
            ]
        );


        cacheElement(
            "settingsPanel",
            [
                "#readerSettingsPanel",
                ".reader-settings-panel"
            ]
        );


        cacheElement(
            "bookmarksPanel",
            [
                "#readerBookmarksPanel",
                ".reader-bookmarks-panel"
            ]
        );


        cacheElement(
            "commentsPanel",
            [
                "#readerCommentsPanel",
                ".reader-comments-panel"
            ]
        );


        cacheElement(
            "sharePanel",
            [
                "#readerSharePanel",
                ".reader-share-panel"
            ]
        );


        cacheElement(
            "bookInfoPanel",
            [
                "#readerBookInfoPanel",
                ".reader-book-info-panel"
            ]
        );


        cacheElement(
            "contentsPanel",
            [
                "#readerContentsPanel",
                ".reader-contents-panel"
            ]
        );


        cacheElement(
            "thumbnailsPanel",
            [
                "#readerThumbnailsPanel",
                ".reader-thumbnails-panel"
            ]
        );


        cacheElement(
            "shortcutsModal",
            [
                "#readerShortcutsModal",
                ".reader-modal"
            ]
        );


        cacheElement(
            "toast",
            [
                "#readerToast",
                ".reader-toast"
            ]
        );


        cacheElement(
            "error",
            [
                "#readerError",
                ".reader-error"
            ]
        );


        cacheElement(
            "empty",
            [
                "#readerEmpty",
                ".reader-empty"
            ]
        );


        cacheElement(
            "liveRegion",
            [
                "#readerLiveRegion",
                ".reader-visually-hidden"
            ]
        );


        cacheElement(
            "printArea",
            [
                "#readerPrintArea",
                ".reader-print-area"
            ]
        );


        cacheElement(
            "opening",
            [
                "#readerOpening",
                "#bookOpeningScreen",
                ".reader-opening"
            ]
        );


        cacheElement(
            "openingBook",
            [
                "#openingBook",
                ".opening-book"
            ]
        );


        cacheElement(
            "openingWhiteLight",
            [
                "#openingWhiteLight",
                ".opening-white-light"
            ]
        );


        cacheElement(
            "bookTitle",
            [
                "#readerBookTitle",
                ".reader-book-title"
            ]
        );


        cacheElement(
            "pageInput",
            [
                "#readerPageInput",
                ".reader-page-input"
            ]
        );


        cacheElement(
            "totalPages",
            [
                "#readerTotalPages",
                ".reader-total-pages"
            ]
        );


        cacheElement(
            "previousPage",
            [
                "#previousPageButton",
                "[data-action='previous-page']"
            ]
        );


        cacheElement(
            "nextPage",
            [
                "#nextPageButton",
                "[data-action='next-page']"
            ]
        );


        cacheElement(
            "previousBook",
            [
                "#previousBookButton",
                "[data-action='previous-book']"
            ]
        );


        cacheElement(
            "nextBook",
            [
                "#nextBookButton",
                "[data-action='next-book']"
            ]
        );


        cacheElement(
            "zoomOut",
            [
                "#zoomOutButton",
                "[data-action='zoom-out']"
            ]
        );


        cacheElement(
            "zoomIn",
            [
                "#zoomInButton",
                "[data-action='zoom-in']"
            ]
        );


        cacheElement(
            "zoomReset",
            [
                "#zoomResetButton",
                "[data-action='zoom-reset']"
            ]
        );


        cacheElement(
            "likeButton",
            [
                "#readerLikeButton",
                "[data-action='like-book']"
            ]
        );


        cacheElement(
            "shareButton",
            [
                "#readerShareButton",
                "[data-action='share-book']"
            ]
        );


        cacheElement(
            "commentButton",
            [
                "#readerCommentButton",
                "[data-action='comments']"
            ]
        );


        return state.dom;

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

        return cacheReaderDOM();

    }



    /* =====================================================
       READER ELEMENT GETTERS
       
       IMPORTANT:
       These functions ONLY return cached DOM elements.

       They NEVER call themselves.
    ===================================================== */

    function getReader() {

        return (
            getDOM("reader")
        );

    }


    function getViewport() {

        return (
            getDOM("viewport")
        );

    }


    function getStage() {

        return (
            getDOM("stage")
        );

    }


    function getToolbar() {

        return (
            getDOM("toolbar")
        );

    }


    function getFooter() {

        return (
            getDOM("footer")
        );

    }



    /* =====================================================
       PAGE ELEMENTS
    ===================================================== */

    function getPages() {

        const stage =
            getStage();


        if (!stage) {

            return [];

        }


        return queryAll(
            ".reader-page, [data-reader-page]",
            stage
        );

    }



    function getPage(
        pageNumber
    ) {

        const pages =
            getPages();


        const target =
            Number.isFinite(
                Number(pageNumber)
            )
                ? Math.max(
                    1,
                    Math.floor(
                        Number(pageNumber)
                    )
                )
                : 1;


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
                        Number(number) ===
                        target
                    );

                }
            ) ||
            null
        );

    }



    /* =====================================================
       PAGE CANVAS HELPERS
    ===================================================== */

    function getPageCanvas(
        page
    ) {

        if (!page) {

            return null;

        }


        return query(
            ".reader-page-canvas, canvas",
            page
        );

    }



    function getPageTextLayer(
        page
    ) {

        if (!page) {

            return null;

        }


        return query(
            ".reader-page-text-layer, .textLayer",
            page
        );

    }



    /* =====================================================
       ALL ACTION BUTTONS
    ===================================================== */

    function getActionButtons() {

        return queryAll(
            "[data-action]"
        );

    }



    /* =====================================================
       ALL PAGE CANVASES
    ===================================================== */

    function getPageCanvases() {

        const stage =
            getStage();


        if (!stage) {

            return [];

        }


        return queryAll(
            ".reader-page-canvas",
            stage
        );

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.cacheReaderDOM =
        cacheReaderDOM;

    R.refreshDOM =
        refreshDOM;

    R.getDOM =
        getDOM;

    R.getReader =
        getReader;

    R.getViewport =
        getViewport;

    R.getStage =
        getStage;

    R.getToolbar =
        getToolbar;

    R.getFooter =
        getFooter;

    R.getPages =
        getPages;

    R.getPage =
        getPage;

    R.getPageCanvas =
        getPageCanvas;

    R.getPageTextLayer =
        getPageTextLayer;

    R.getActionButtons =
        getActionButtons;

    R.getPageCanvases =
        getPageCanvases;



    /* =====================================================
       PART 2 READY
    ===================================================== */

    console.log(
        "Chishti Reader — JavaScript Part 2/9 loaded."
    );

})();
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 3 / 9

   DOM ACCESS
   READER ELEMENTS
   PAGE ELEMENTS
========================================================= */

(() => {

"use strict";


/* =========================================================
   REQUIRE CORE OBJECT
========================================================= */

const R =
    window.ChishtiReader;


if (!R) {

    console.error(
        "Chishti Reader: Core object not found."
    );

    return;

}


/* =========================================================
   STATE
========================================================= */

const state =
    R.state ||
    (R.state = {});


state.dom =
    state.dom ||
    {};



/* =========================================================
   SAFE DOM SELECTOR
========================================================= */

function query(
    selectors,
    parent = document
) {

    if (!parent) {
        return null;
    }


    const list =
        Array.isArray(selectors)
            ? selectors
            : [selectors];


    for (
        const selector of list
    ) {

        if (!selector) {
            continue;
        }


        try {

            const element =
                parent.querySelector(
                    selector
                );


            if (element) {
                return element;
            }

        } catch (error) {

            console.warn(
                "Chishti Reader: Invalid selector",
                selector,
                error
            );

        }

    }


    return null;

}



/* =========================================================
   CACHE ONE ELEMENT
========================================================= */

function cacheElement(
    key,
    selectors
) {

    const element =
        query(
            selectors
        );


    state.dom[key] =
        element || null;


    return element || null;

}



/* =========================================================
   CACHE READER DOM
========================================================= */

function cacheReaderDOM() {

    state.dom =
        state.dom || {};


    /* -----------------------------------------------------
       Main Reader
    ----------------------------------------------------- */

    cacheElement(
        "reader",
        [
            "#chishtilib-reader",
            "#reader",
            ".reader"
        ]
    );


    cacheElement(
        "main",
        [
            "#readerMain",
            ".reader-main"
        ]
    );


    cacheElement(
        "viewport",
        [
            "#readerViewport",
            ".reader-viewport"
        ]
    );


    cacheElement(
        "stage",
        [
            "#readerPageStage",
            ".reader-page-stage",
            ".page-stage"
        ]
    );


    cacheElement(
        "leftPage",
        [
            "#readerPageLeft",
            ".reader-page-left"
        ]
    );


    cacheElement(
        "rightPage",
        [
            "#readerPageRight",
            ".reader-page-right"
        ]
    );


    /* -----------------------------------------------------
       Header
    ----------------------------------------------------- */

    cacheElement(
        "header",
        [
            "#readerHeader",
            ".reader-header"
        ]
    );


    cacheElement(
        "bookTitle",
        [
            "#readerBookTitle",
            ".reader-book-title"
        ]
    );


    /* -----------------------------------------------------
       Toolbar
    ----------------------------------------------------- */

    cacheElement(
        "toolbar",
        [
            "#readerToolbar",
            ".reader-toolbar"
        ]
    );


    cacheElement(
        "footer",
        [
            "#readerFooter",
            ".reader-footer"
        ]
    );


    /* -----------------------------------------------------
       Overlay
    ----------------------------------------------------- */

    cacheElement(
        "overlay",
        [
            "#readerOverlay",
            ".reader-overlay",
            "[data-reader-overlay]"
        ]
    );


    /* -----------------------------------------------------
       Search
    ----------------------------------------------------- */

    cacheElement(
        "searchBar",
        [
            "#readerSearchBar",
            ".reader-search-bar"
        ]
    );


    cacheElement(
        "searchInput",
        [
            "#readerSearchInput",
            ".reader-search-input"
        ]
    );


    cacheElement(
        "searchResults",
        [
            "#readerSearchResults",
            ".reader-search-results"
        ]
    );


    /* -----------------------------------------------------
       Page Counter
    ----------------------------------------------------- */

    cacheElement(
        "pageInput",
        [
            "#readerPageInput",
            ".reader-page-input"
        ]
    );


    cacheElement(
        "totalPages",
        [
            "#readerTotalPages",
            ".reader-total-pages"
        ]
    );


    /* -----------------------------------------------------
       Zoom
    ----------------------------------------------------- */

    cacheElement(
        "zoomOut",
        [
            "#zoomOutButton",
            "[data-action='zoom-out']"
        ]
    );


    cacheElement(
        "zoomReset",
        [
            "#zoomResetButton",
            "[data-action='zoom-reset']"
        ]
    );


    cacheElement(
        "zoomIn",
        [
            "#zoomInButton",
            "[data-action='zoom-in']"
        ]
    );


    /* -----------------------------------------------------
       Panels
    ----------------------------------------------------- */

    cacheElement(
        "settingsPanel",
        [
            "#readerSettingsPanel",
            ".reader-settings-panel"
        ]
    );


    cacheElement(
        "bookmarksPanel",
        [
            "#readerBookmarksPanel",
            ".reader-bookmarks-panel"
        ]
    );


    cacheElement(
        "commentsPanel",
        [
            "#readerCommentsPanel",
            ".reader-comments-panel"
        ]
    );


    cacheElement(
        "sharePanel",
        [
            "#readerSharePanel",
            ".reader-share-panel"
        ]
    );


    cacheElement(
        "bookInfoPanel",
        [
            "#readerBookInfoPanel",
            ".reader-book-info-panel"
        ]
    );


    cacheElement(
        "contentsPanel",
        [
            "#readerContentsPanel",
            ".reader-contents-panel"
        ]
    );


    cacheElement(
        "thumbnailsPanel",
        [
            "#readerThumbnailsPanel",
            ".reader-thumbnails-panel"
        ]
    );


    /* -----------------------------------------------------
       Modals
    ----------------------------------------------------- */

    cacheElement(
        "shortcutsModal",
        [
            "#readerShortcutsModal",
            ".reader-modal"
        ]
    );


    /* -----------------------------------------------------
       Toast / Error
    ----------------------------------------------------- */

    cacheElement(
        "toast",
        [
            "#readerToast",
            ".reader-toast"
        ]
    );


    cacheElement(
        "error",
        [
            "#readerError",
            ".reader-error"
        ]
    );


    cacheElement(
        "empty",
        [
            "#readerEmpty",
            ".reader-empty"
        ]
    );


    /* -----------------------------------------------------
       Opening Animation
    ----------------------------------------------------- */

    cacheElement(
        "opening",
        [
            "#readerOpening",
            "#bookOpeningScreen",
            ".reader-opening"
        ]
    );


    cacheElement(
        "openingBook",
        [
            "#openingBook",
            ".opening-book"
        ]
    );


    cacheElement(
        "openingWhiteLight",
        [
            "#openingWhiteLight",
            ".opening-white-light"
        ]
    );


    /* -----------------------------------------------------
       Print Area
    ----------------------------------------------------- */

    cacheElement(
        "printArea",
        [
            "#readerPrintArea",
            ".reader-print-area"
        ]
    );


    /* -----------------------------------------------------
       Book Data
    ----------------------------------------------------- */

    cacheElement(
        "bookData",
        [
            "#readerBookData"
        ]
    );


    cacheElement(
        "bookUrl",
        [
            "#readerBookUrl"
        ]
    );


    cacheElement(
        "bookName",
        [
            "#readerBookName"
        ]
    );


    return state.dom;

}



/* =========================================================
   GET CACHED ELEMENT
========================================================= */

function getDOM(
    key
) {

    if (
        state.dom &&
        Object.prototype.hasOwnProperty.call(
            state.dom,
            key
        )
    ) {

        return state.dom[key];

    }


    return null;

}



/* =========================================================
   REFRESH DOM CACHE
========================================================= */

function refreshDOM() {

    return cacheReaderDOM();

}



/* =========================================================
   READER ELEMENTS
========================================================= */

function getReader() {

    return getDOM(
        "reader"
    );

}


function getViewport() {

    return getDOM(
        "viewport"
    );

}


function getStage() {

    return getDOM(
        "stage"
    );

}


function getToolbar() {

    return getDOM(
        "toolbar"
    );

}



/* =========================================================
   PAGE ELEMENTS
========================================================= */

function getPages() {

    const stage =
        getStage();


    if (!stage) {

        return [];

    }


    return Array.from(
        stage.querySelectorAll(
            ".reader-page"
        )
    );

}



/* =========================================================
   GET PAGE NUMBER
========================================================= */

function getPageNumber(
    page
) {

    if (!page) {
        return 0;
    }


    const value =
        page.dataset.page ||
        page.dataset.pageNumber ||
        page.getAttribute(
            "data-page"
        );


    const number =
        Number.parseInt(
            value,
            10
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}



/* =========================================================
   GET PAGE
========================================================= */

function getPage(
    pageNumber
) {

    const pages =
        getPages();


    const target =
        Number.parseInt(
            pageNumber,
            10
        );


    if (
        !Number.isFinite(
            target
        )
    ) {

        return null;

    }


    return (
        pages.find(
            page =>
                getPageNumber(
                    page
                ) === target
        ) ||
        null
    );

}



/* =========================================================
   GET LEFT PAGE
========================================================= */

function getLeftPage() {

    return getDOM(
        "leftPage"
    );

}



/* =========================================================
   GET RIGHT PAGE
========================================================= */

function getRightPage() {

    return getDOM(
        "rightPage"
    );

}



/* =========================================================
   GET PAGE CANVAS
========================================================= */

function getPageCanvas(
    page
) {

    if (!page) {
        return null;
    }


    return page.querySelector(
        ".reader-page-canvas, canvas"
    );

}



/* =========================================================
   GET PAGE TEXT LAYER
========================================================= */

function getPageTextLayer(
    page
) {

    if (!page) {
        return null;
    }


    return page.querySelector(
        ".reader-page-text-layer"
    );

}



/* =========================================================
   PUBLIC API
========================================================= */

R.cacheReaderDOM =
    cacheReaderDOM;


R.refreshDOM =
    refreshDOM;


R.getDOM =
    getDOM;


R.getReader =
    getReader;


R.getViewport =
    getViewport;


R.getStage =
    getStage;


R.getToolbar =
    getToolbar;


R.getPages =
    getPages;


R.getPage =
    getPage;


R.getPageNumber =
    getPageNumber;


R.getLeftPage =
    getLeftPage;


R.getRightPage =
    getRightPage;


R.getPageCanvas =
    getPageCanvas;


R.getPageTextLayer =
    getPageTextLayer;



/* =========================================================
   INITIAL CACHE
========================================================= */

cacheReaderDOM();


console.log(
    "Chishti Reader — Part 3/9 loaded."
);


})();
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 4 / 9

   PAGE NAVIGATION
   TWO-PAGE VIEW
   ZOOM
   FIT MODE
   PAGE COUNTER
========================================================= */


/* =========================================================
   PAGE STATE
========================================================= */

function getCurrentPage() {

    const page =
        Number(
            ReaderState.currentPage
        );

    if (
        !Number.isFinite(page) ||
        page < 1
    ) {

        return 1;

    }

    return Math.floor(page);

}


function getTotalPages() {

    const total =
        Number(
            ReaderState.totalPages
        );

    if (
        !Number.isFinite(total) ||
        total < 0
    ) {

        return 0;

    }

    return Math.floor(total);

}


function setCurrentPage(
    page
) {

    let target =
        Number(page);

    if (
        !Number.isFinite(target)
    ) {

        target = 1;

    }

    target =
        Math.floor(target);


    const total =
        getTotalPages();


    if (total > 0) {

        target =
            Math.max(
                1,
                Math.min(
                    total,
                    target
                )
            );

    } else {

        target =
            Math.max(
                1,
                target
            );

    }


    ReaderState.currentPage =
        target;


    updatePageCounter();

    updateNavigationButtons();

    updateProgress();

    updateBookInfo();

}


/* =========================================================
   TWO-PAGE NAVIGATION
========================================================= */

function getPageStep() {

    if (
        ReaderState.pageMode ===
        "single-page"
    ) {

        return 1;

    }

    return 2;

}


function nextPage() {

    if (
        !ReaderState.isReaderOpen
    ) {

        return;

    }


    const current =
        getCurrentPage();

    const total =
        getTotalPages();

    const step =
        getPageStep();


    if (
        total > 0 &&
        current >= total
    ) {

        return;

    }


    let target =
        current + step;


    if (
        total > 0 &&
        target > total
    ) {

        target =
            total;

    }


    setCurrentPage(
        target
    );


    renderReaderPages();

    saveReadingPosition();

    showReaderControls();

}


function previousPage() {

    if (
        !ReaderState.isReaderOpen
    ) {

        return;

    }


    const current =
        getCurrentPage();

    const step =
        getPageStep();


    if (
        current <= 1
    ) {

        return;

    }


    const target =
        Math.max(
            1,
            current - step
        );


    setCurrentPage(
        target
    );


    renderReaderPages();

    saveReadingPosition();

    showReaderControls();

}


/* =========================================================
   GO TO SPECIFIC PAGE
========================================================= */

function goToPage(
    page
) {

    const target =
        Number(page);


    if (
        !Number.isFinite(target)
    ) {

        return;

    }


    setCurrentPage(
        target
    );


    renderReaderPages();

    saveReadingPosition();

}


/* =========================================================
   PAGE INPUT
========================================================= */

function handlePageInput() {

    const input =
        document.querySelector(
            "#readerPageInput"
        );


    if (!input) {

        return;

    }


    const value =
        parseInt(
            input.value,
            10
        );


    if (
        !Number.isFinite(value)
    ) {

        input.value =
            getCurrentPage();

        return;

    }


    goToPage(
        value
    );

}


/* =========================================================
   PAGE COUNTER
========================================================= */

function updatePageCounter() {

    const current =
        getCurrentPage();

    const total =
        getTotalPages();


    const input =
        document.querySelector(
            "#readerPageInput"
        );


    const totalElement =
        document.querySelector(
            "#readerTotalPages"
        );


    const infoCurrent =
        document.querySelector(
            "#readerInfoCurrentPage"
        );


    const infoTotal =
        document.querySelector(
            "#readerInfoTotalPages"
        );


    if (input) {

        input.value =
            current;

    }


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (infoCurrent) {

        infoCurrent.textContent =
            current;

    }


    if (infoTotal) {

        infoTotal.textContent =
            total;

    }

}


/* =========================================================
   NAVIGATION BUTTON STATE
========================================================= */

function updateNavigationButtons() {

    const current =
        getCurrentPage();

    const total =
        getTotalPages();


    const previous =
        document.querySelector(
            "#previousPageButton"
        );


    const next =
        document.querySelector(
            "#nextPageButton"
        );


    if (previous) {

        previous.disabled =
            current <= 1;

    }


    if (next) {

        next.disabled =
            total > 0 &&
            current >= total;

    }

}


/* =========================================================
   READING PROGRESS
========================================================= */

function updateProgress() {

    const current =
        getCurrentPage();

    const total =
        getTotalPages();


    let progress =
        0;


    if (total > 0) {

        progress =
            (
                current /
                total
            ) * 100;

    }


    progress =
        Math.max(
            0,
            Math.min(
                100,
                progress
            )
        );


    ReaderState.readingProgress =
        progress;


    const progressBar =
        document.querySelector(
            ".reader-progress-fill"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }


    const liveRegion =
        document.querySelector(
            "#readerLiveRegion"
        );


    if (liveRegion) {

        liveRegion.textContent =
            `Page ${current} of ${total}`;

    }

}


/* =========================================================
   PAGE RENDERING
========================================================= */

function renderReaderPages() {

    if (
        !ReaderState.isReaderOpen
    ) {

        return;

    }


    /*
       Part 5/9 mein actual PDF/canvas rendering
       connect hogi.

       Yahan hum sirf current page state
       prepare kar rahe hain.
    */

    const current =
        getCurrentPage();

    const total =
        getTotalPages();


    const leftPage =
        document.querySelector(
            "#readerPageLeft"
        );


    const rightPage =
        document.querySelector(
            "#readerPageRight"
        );


    if (!leftPage) {

        return;

    }


    /*
       Single-page mode
    */

    if (
        ReaderState.pageMode ===
        "single-page"
    ) {

        leftPage.hidden =
            false;


        if (rightPage) {

            rightPage.hidden =
                true;

        }


        leftPage.dataset.page =
            String(
                current
            );


        updatePageNumber(
            leftPage,
            current
        );


        return;

    }


    /*
       Two-page mode
    */

    leftPage.hidden =
        false;


    if (rightPage) {

        rightPage.hidden =
            false;

    }


    let leftNumber =
        current;


    /*
       Keep two-page spread aligned.
    */

    if (
        leftNumber % 2 === 0
    ) {

        leftNumber -= 1;

    }


    let rightNumber =
        leftNumber + 1;


    if (
        total > 0 &&
        rightNumber > total
    ) {

        rightNumber =
            0;

    }


    leftPage.dataset.page =
        String(
            leftNumber
        );


    updatePageNumber(
        leftPage,
        leftNumber
    );


    if (rightPage) {

        if (
            rightNumber > 0
        ) {

            rightPage.hidden =
                false;

            rightPage.dataset.page =
                String(
                    rightNumber
                );


            updatePageNumber(
                rightPage,
                rightNumber
            );

        } else {

            rightPage.hidden =
                true;

            rightPage.dataset.page =
                "";

            updatePageNumber(
                rightPage,
                ""
            );

        }

    }

}


/* =========================================================
   PAGE NUMBER DISPLAY
========================================================= */

function updatePageNumber(
pageElement,
pageNumber
) {

    if (!pageElement) {

        return;

    }


    const numberElement =
        pageElement.querySelector(
            ".reader-page-number"
        );


    if (!numberElement) {

        return;

    }


    if (
        !ReaderState.showPageNumbers ||
        pageNumber === "" ||
        pageNumber === null
    ) {

        numberElement.hidden =
            true;

        numberElement.textContent =
            "";

        return;

    }


    numberElement.hidden =
        false;

    numberElement.textContent =
        pageNumber;

}


/* =========================================================
   ZOOM
========================================================= */

function zoomIn() {

    setZoom(
        ReaderState.zoom +
        ReaderState.zoomStep
    );

}


function zoomOut() {

    setZoom(
        ReaderState.zoom -
        ReaderState.zoomStep
    );

}


function resetZoom() {

    setZoom(
        1
    );

}


function setZoom(
    value
) {

    let zoom =
        Number(value);


    if (
        !Number.isFinite(zoom)
    ) {

        zoom =
            1;

    }


    zoom =
        Math.max(
            ReaderState.minZoom,
            Math.min(
                ReaderState.maxZoom,
                zoom
            )
        );


    zoom =
        Math.round(
            zoom * 100
        ) / 100;


    ReaderState.zoom =
        zoom;


    applyZoom();

}


/* =========================================================
   APPLY ZOOM
========================================================= */

function applyZoom() {

    const stage =
        document.querySelector(
            "#readerPageStage"
        );


    if (!stage) {

        return;

    }


    stage.style.transform =
        `scale(${ReaderState.zoom})`;


    stage.style.transformOrigin =
        "center center";


    updateZoomUI();

}


/* =========================================================
   ZOOM UI
========================================================= */

function updateZoomUI() {

    const percentage =
        Math.round(
            ReaderState.zoom * 100
        );


    const zoomButtons =
        document.querySelectorAll(
            ".reader-zoom-level"
        );


    zoomButtons.forEach(
        element => {

            element.textContent =
                `${percentage}%`;

        }
    );


    const zoomRange =
        document.querySelector(
            ".reader-zoom-range"
        );


    if (zoomRange) {

        zoomRange.value =
            ReaderState.zoom;

    }

}


/* =========================================================
   FIT MODE
========================================================= */

function setFitMode(
mode
) {

    const allowedModes = [
        "width",
        "page",
        "actual"
    ];


    if (
        !allowedModes.includes(
            mode
        )
    ) {

        mode =
            "width";

    }


    ReaderState.fitMode =
        mode;


    if (
        mode === "actual"
    ) {

        setZoom(
            1
        );

        return;

    }


    /*
       Actual dimension calculation will be connected
       to the rendered PDF pages in Part 5/9.
    */

    if (
        mode === "width"
    ) {

        setZoom(
            1
        );

        return;

    }


    if (
        mode === "page"
    ) {

        setZoom(
            1
        );

    }

}


/* =========================================================
   BOOK INFORMATION
========================================================= */

function updateBookInfo() {

    const title =
        document.querySelector(
            "#readerInfoTitle"
        );


    if (
        title &&
        ReaderState.currentBook
    ) {

        title.textContent =
            ReaderState.currentBook.title ||
            ReaderState.currentBook.name ||
            "Book";

    }


    const current =
        document.querySelector(
            "#readerInfoCurrentPage"
        );


    const total =
        document.querySelector(
            "#readerInfoTotalPages"
        );


    if (current) {

        current.textContent =
            getCurrentPage();

    }


    if (total) {

        total.textContent =
            getTotalPages();

    }

}


/* =========================================================
   PAGE UI MASTER UPDATE
========================================================= */

function updatePageUI() {

    updatePageCounter();

    updateNavigationButtons();

    updateProgress();

    updateZoomUI();

    updateBookInfo();

}


/* =========================================================
   PAGE INPUT EVENTS
========================================================= */

function bindPageControls() {

    const input =
        document.querySelector(
            "#readerPageInput"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                handlePageInput();

                input.blur();

            }

        }
    );


    input.addEventListener(
        "change",
        handlePageInput
    );

}


/* =========================================================
   ZOOM CONTROL EVENTS
========================================================= */

function bindZoomControls() {

    const zoomInButton =
        document.querySelector(
            "#zoomInButton"
        );


    const zoomOutButton =
        document.querySelector(
            "#zoomOutButton"
        );


    const zoomResetButton =
        document.querySelector(
            "#zoomResetButton"
        );


    zoomInButton?.addEventListener(
        "click",
        zoomIn
    );


    zoomOutButton?.addEventListener(
        "click",
        zoomOut
    );


    zoomResetButton?.addEventListener(
        "click",
        resetZoom
    );

}


/* =========================================================
   PAGE BUTTON EVENTS
========================================================= */

function bindPageNavigation() {

    const previous =
        document.querySelector(
            "#previousPageButton"
        );


    const next =
        document.querySelector(
            "#nextPageButton"
        );


    previous?.addEventListener(
        "click",
        previousPage
    );


    next?.addEventListener(
        "click",
        nextPage
    );

}


/* =========================================================
   INITIALIZE PAGE CONTROLS
========================================================= */

function initializePageControls() {

    bindPageControls();

    bindZoomControls();

    bindPageNavigation();

    updatePageUI();

}


/* =========================================================
   PUBLIC API
========================================================= */

R.nextPage =
    nextPage;


R.previousPage =
    previousPage;


R.goToPage =
    goToPage;


R.setCurrentPage =
    setCurrentPage;


R.getCurrentPage =
    getCurrentPage;


R.getTotalPages =
    getTotalPages;


R.setZoom =
    setZoom;


R.zoomIn =
    zoomIn;


R.zoomOut =
    zoomOut;


R.resetZoom =
    resetZoom;


R.setFitMode =
    setFitMode;


R.renderReaderPages =
    renderReaderPages;


R.updatePageUI =
    updatePageUI;


R.updatePageCounter =
    updatePageCounter;


/* =========================================================
   PART 4 READY
========================================================= */

console.log(
    "Chishti Reader — Part 4/9 loaded."
);
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 5 / 9

   SEARCH + BOOKMARKS + SOCIAL ACTIONS
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       READER OBJECT
    ===================================================== */

    const R =
        window.ChishtiReader =
        window.ChishtiReader || {};



    /* =====================================================
       STATE
    ===================================================== */

    const state =
        R.state =
        R.state || {};


    state.search =
        state.search || {

            open: false,

            query: "",

            results: [],

            currentIndex: -1,

            totalMatches: 0,

            activePage: 0

        };


    state.bookmarks =
        Array.isArray(state.bookmarks)
            ? state.bookmarks
            : [];


    state.likes =
        Boolean(state.likes);


    state.comments =
        Array.isArray(state.comments)
            ? state.comments
            : [];



    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getElement(...selectors) {

        for (
            const selector of selectors
        ) {

            const element =
                document.querySelector(
                    selector
                );


            if (element) {

                return element;

            }

        }


        return null;

    }



    function getElements(...selectors) {

        for (
            const selector of selectors
        ) {

            const elements =
                document.querySelectorAll(
                    selector
                );


            if (elements.length) {

                return [
                    ...elements
                ];

            }

        }


        return [];

    }



    /* =====================================================
       SEARCH ELEMENTS
    ===================================================== */

    function getSearchBar() {

        return getElement(
            "#readerSearchBar",
            ".reader-search-bar"
        );

    }


    function getSearchInput() {

        return getElement(
            "#readerSearchInput",
            ".reader-search-input"
        );

    }


    function getSearchResults() {

        return getElement(
            "#readerSearchResults",
            ".reader-search-results"
        );

    }



    /* =====================================================
       OPEN SEARCH
       
       Microsoft Word / Ctrl+F style
    ===================================================== */

    function openSearch() {

        const bar =
            getSearchBar();


        const input =
            getSearchInput();


        if (!bar) {

            return;

        }


        state.search.open =
            true;


        bar.classList.add(
            "open",
            "active"
        );


        bar.setAttribute(
            "aria-hidden",
            "false"
        );


        if (input) {

            input.focus();

            input.select();

        }

    }



    /* =====================================================
       CLOSE SEARCH
    ===================================================== */

    function closeSearch() {

        const bar =
            getSearchBar();


        state.search.open =
            false;


        if (bar) {

            bar.classList.remove(
                "open",
                "active"
            );


            bar.setAttribute(
                "aria-hidden",
                "true"
            );

        }


        clearSearch();

    }



    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function clearSearch() {

        state.search.query =
            "";

        state.search.results =
            [];

        state.search.currentIndex =
            -1;

        state.search.totalMatches =
            0;

        state.search.activePage =
            0;


        const input =
            getSearchInput();


        if (input) {

            input.value =
                "";

        }


        updateSearchCounter();

        clearSearchHighlights();

    }



    /* =====================================================
       SEARCH INPUT
    ===================================================== */

    function handleSearchInput(
        event
    ) {

        const query =
            String(
                event.target.value ||
                ""
            ).trim();


        state.search.query =
            query;


        if (!query) {

            clearSearchResults();

            return;

        }


        performSearch(
            query
        );

    }



    /* =====================================================
       PERFORM SEARCH
       
       Searches visible text layers.
    ===================================================== */

    function performSearch(
        query
    ) {

        clearSearchHighlights();


        state.search.results =
            [];


        state.search.currentIndex =
            -1;


        const normalizedQuery =
            query.toLocaleLowerCase();


        const textLayers =
            getElements(
                ".reader-page-text-layer",
                ".textLayer",
                "[data-text-layer]"
            );


        textLayers.forEach(
            (layer, layerIndex) => {

                const text =
                    String(
                        layer.textContent ||
                        ""
                    );


                if (!text) {

                    return;

                }


                const normalizedText =
                    text.toLocaleLowerCase();


                let position =
                    0;


                while (
                    position <
                    normalizedText.length
                ) {

                    const found =
                        normalizedText.indexOf(
                            normalizedQuery,
                            position
                        );


                    if (
                        found === -1
                    ) {

                        break;

                    }


                    state.search.results.push({

                        layer,

                        pageIndex:
                            layerIndex,

                        position:
                            found,

                        length:
                            query.length

                    });


                    position =
                        found +
                        Math.max(
                            query.length,
                            1
                        );

                }

            }
        );


        state.search.totalMatches =
            state.search.results.length;


        if (
            state.search.totalMatches > 0
        ) {

            state.search.currentIndex =
                0;


            focusSearchResult(
                0
            );

        }


        updateSearchCounter();

    }



    /* =====================================================
       CLEAR SEARCH RESULTS
    ===================================================== */

    function clearSearchResults() {

        state.search.results =
            [];

        state.search.currentIndex =
            -1;

        state.search.totalMatches =
            0;


        clearSearchHighlights();

        updateSearchCounter();

    }



    /* =====================================================
       SEARCH COUNTER
       
       Example:
       3 / 18
    ===================================================== */

    function updateSearchCounter() {

        const counter =
            getSearchResults();


        if (!counter) {

            return;

        }


        if (
            state.search.totalMatches <= 0
        ) {

            counter.textContent =
                "0 / 0";

            return;

        }


        counter.textContent =
            `${state.search.currentIndex + 1} / ${state.search.totalMatches}`;

    }



    /* =====================================================
       NEXT SEARCH RESULT
    ===================================================== */

    function nextSearchResult() {

        if (
            !state.search.results.length
        ) {

            return;

        }


        state.search.currentIndex =
            (
                state.search.currentIndex +
                1
            ) %
            state.search.results.length;


        focusSearchResult(
            state.search.currentIndex
        );


        updateSearchCounter();

    }



    /* =====================================================
       PREVIOUS SEARCH RESULT
    ===================================================== */

    function previousSearchResult() {

        if (
            !state.search.results.length
        ) {

            return;

        }


        state.search.currentIndex =
            (
                state.search.currentIndex -
                1 +
                state.search.results.length
            ) %
            state.search.results.length;


        focusSearchResult(
            state.search.currentIndex
        );


        updateSearchCounter();

    }



    /* =====================================================
       FOCUS SEARCH RESULT
    ===================================================== */

    function focusSearchResult(
        index
    ) {

        const result =
            state.search.results[index];


        if (!result) {

            return;

        }


        const layer =
            result.layer;


        if (!layer) {

            return;

        }


        state.search.activePage =
            result.pageIndex;


        const page =
            layer.closest(
                ".reader-page, [data-reader-page]"
            );


        if (page) {

            page.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "center",

                inline:
                    "center"

            });

        }


        highlightSearchPage(
            layer,
            state.search.query
        );

    }



    /* =====================================================
       HIGHLIGHT SEARCH PAGE
    ===================================================== */

    function highlightSearchPage(
        layer,
        query
    ) {

        clearSearchHighlights();


        if (
            !query ||
            !layer
        ) {

            return;

        }


        const walker =
            document.createTreeWalker(
                layer,
                NodeFilter.SHOW_TEXT
            );


        const nodes = [];


        let node;


        while (
            node =
            walker.nextNode()
        ) {

            nodes.push(
                node
            );

        }


        nodes.forEach(
            textNode => {

                const text =
                    textNode.nodeValue ||
                    "";


                const lowerText =
                    text.toLocaleLowerCase();


                const lowerQuery =
                    query.toLocaleLowerCase();


                if (
                    !lowerText.includes(
                        lowerQuery
                    )
                ) {

                    return;

                }


                const parent =
                    textNode.parentNode;


                if (!parent) {

                    return;

                }


                const fragment =
                    document.createDocumentFragment();


                let cursor =
                    0;


                while (
                    cursor <
                    text.length
                ) {

                    const found =
                        lowerText.indexOf(
                            lowerQuery,
                            cursor
                        );


                    if (
                        found === -1
                    ) {

                        fragment.appendChild(
                            document.createTextNode(
                                text.slice(
                                    cursor
                                )
                            )
                        );

                        break;

                    }


                    fragment.appendChild(
                        document.createTextNode(
                            text.slice(
                                cursor,
                                found
                            )
                        )
                    );


                    const mark =
                        document.createElement(
                            "mark"
                        );


                    mark.className =
                        "reader-search-highlight";


                    mark.textContent =
                        text.slice(
                            found,
                            found +
                            query.length
                        );


                    fragment.appendChild(
                        mark
                    );


                    cursor =
                        found +
                        query.length;

                }


                parent.replaceChild(
                    fragment,
                    textNode
                );

            }
        );

    }



    /* =====================================================
       CLEAR HIGHLIGHTS
    ===================================================== */

    function clearSearchHighlights() {

        const highlights =
            getElements(
                ".reader-search-highlight"
            );


        highlights.forEach(
            highlight => {

                const parent =
                    highlight.parentNode;


                if (!parent) {

                    return;

                }


                parent.replaceChild(
                    document.createTextNode(
                        highlight.textContent ||
                        ""
                    ),
                    highlight
                );


                parent.normalize();

            }
        );

    }



    /* =====================================================
       BOOKMARK
    ===================================================== */

    function getCurrentPage() {

        if (
            typeof R.getCurrentPage ===
            "function"
        ) {

            return R.getCurrentPage();

        }


        if (
            state.currentPage
        ) {

            return Number(
                state.currentPage
            ) || 1;

        }


        return 1;

    }



    function toggleBookmark() {

        const page =
            getCurrentPage();


        const index =
            state.bookmarks.indexOf(
                page
            );


        if (
            index === -1
        ) {

            state.bookmarks.push(
                page
            );


            showToast(
                `Page ${page} bookmarked`,
                "★"
            );

        } else {

            state.bookmarks.splice(
                index,
                1
            );


            showToast(
                `Page ${page} bookmark removed`,
                "×"
            );

        }


        saveBookmarks();

        renderBookmarks();

    }



    /* =====================================================
       SAVE BOOKMARKS
    ===================================================== */

    function saveBookmarks() {

        try {

            localStorage.setItem(
                "chishtireader_bookmarks",
                JSON.stringify(
                    state.bookmarks
                )
            );

        } catch (error) {

            console.warn(
                "CHISHTI READER: unable to save bookmarks.",
                error
            );

        }

    }



    /* =====================================================
       LOAD BOOKMARKS
    ===================================================== */

    function loadBookmarks() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtireader_bookmarks"
                );


            if (!saved) {

                return;

            }


            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(parsed)
            ) {

                state.bookmarks =
                    parsed
                    .map(
                        Number
                    )
                    .filter(
                        Number.isFinite
                    );

            }

        } catch (error) {

            console.warn(
                "CHISHTI READER: unable to load bookmarks.",
                error
            );

        }


        renderBookmarks();

    }



    /* =====================================================
       RENDER BOOKMARKS
    ===================================================== */

    function renderBookmarks() {

        const list =
            getElement(
                "#readerBookmarksList",
                ".reader-bookmarks-list"
            );


        if (!list) {

            return;

        }


        list.innerHTML =
            "";


        if (
            state.bookmarks.length === 0
        ) {

            list.innerHTML = `

                <div class="reader-empty-state">

                    <div class="reader-empty-icon">
                        ☆
                    </div>

                    <p>
                        No bookmarks yet.
                    </p>

                </div>

            `;

            return;

        }


        const sorted =
            [
                ...state.bookmarks
            ].sort(
                (a, b) =>
                    a - b
            );


        sorted.forEach(
            page => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "reader-bookmark-item";


                button.dataset.page =
                    String(page);


                button.textContent =
                    `Page ${page}`;


                button.addEventListener(
                    "click",
                    () => {

                        if (
                            typeof R.goToPage ===
                            "function"
                        ) {

                            R.goToPage(
                                page
                            );

                        }

                    }
                );


                list.appendChild(
                    button
                );

            }
        );

    }



    /* =====================================================
       LIKE
    ===================================================== */

    function toggleLike() {

        state.likes =
            !state.likes;


        const button =
            getElement(
                "#readerLikeButton"
            );


        if (button) {

            button.classList.toggle(
                "liked",
                state.likes
            );


            const icon =
                button.querySelector(
                    ".reader-social-icon"
                );


            if (icon) {

                icon.textContent =
                    state.likes
                        ? "♥"
                        : "♡";

            }

        }


        try {

            localStorage.setItem(
                "chishtireader_like",
                state.likes
                    ? "1"
                    : "0"
            );

        } catch (
            error
        ) {

            console.warn(
                error
            );

        }


        showToast(
            state.likes
                ? "Book liked"
                : "Like removed",
            state.likes
                ? "♥"
                : "♡"
        );

    }



    /* =====================================================
       LOAD LIKE
    ===================================================== */

    function loadLike() {

        try {

            state.likes =
                localStorage.getItem(
                    "chishtireader_like"
                ) === "1";

        } catch (
            error
        ) {

            state.likes =
                false;

        }


        const button =
            getElement(
                "#readerLikeButton"
            );


        if (button) {

            button.classList.toggle(
                "liked",
                state.likes
            );

        }

    }



    /* =====================================================
       SHARE
    ===================================================== */

    async function shareBook() {

        const title =
            document.querySelector(
                "#readerBookTitle"
            )?.textContent ||
            "CHISHTI READER";


        const url =
            window.location.href;


        try {

            if (
                navigator.share
            ) {

                await navigator.share({

                    title,

                    text:
                        `Read this book on CHISHTI READER`,

                    url

                });

                return;

            }


            await navigator.clipboard.writeText(
                url
            );


            showToast(
                "Book link copied",
                "✓"
            );

        } catch (
            error
        ) {

            if (
                error?.name ===
                "AbortError"
            ) {

                return;

            }


            showToast(
                "Unable to share book",
                "!"
            );

        }

    }



    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        icon = "✓"
    ) {

        const toast =
            getElement(
                "#readerToast",
                ".reader-toast"
            );


        if (!toast) {

            return;

        }


        const iconElement =
            toast.querySelector(
                "#readerToastIcon, .reader-toast-icon"
            );


        const messageElement =
            toast.querySelector(
                "#readerToastMessage, .reader-toast-message"
            );


        if (iconElement) {

            iconElement.textContent =
                icon;

        }


        if (messageElement) {

            messageElement.textContent =
                message;

        }


        toast.classList.add(
            "show",
            "active"
        );


        toast.setAttribute(
            "aria-hidden",
            "false"
        );


        clearTimeout(
            state.toastTimer
        );


        state.toastTimer =
            window.setTimeout(
                () => {

                    toast.classList.remove(
                        "show",
                        "active"
                    );


                    toast.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                },
                2400
            );

    }



    /* =====================================================
       EVENT BINDING
    ===================================================== */

    function bindPartFiveEvents() {

        const input =
            getSearchInput();


        if (input) {

            input.addEventListener(
                "input",
                handleSearchInput
            );

        }


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() === "f"
                ) {

                    event.preventDefault();

                    openSearch();

                }


                if (
                    event.key === "Escape" &&
                    state.search.open
                ) {

                    closeSearch();

                }

            }
        );


        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {

                    return;

                }


                switch (
                    button.dataset.action
                ) {

                    case "toggle-search":

                        openSearch();

                        break;


                    case "close-search":

                        closeSearch();

                        break;


                    case "search-next":

                        nextSearchResult();

                        break;


                    case "search-previous":

                        previousSearchResult();

                        break;


                    case "search-clear":

                        clearSearch();

                        break;


                    case "bookmark-page":

                        toggleBookmark();

                        break;


                    case "like-book":

                        toggleLike();

                        break;


                    case "share-book":

                        shareBook();

                        break;

                }

            }
        );

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.openSearch =
        openSearch;

    R.closeSearch =
        closeSearch;

    R.performSearch =
        performSearch;

    R.nextSearchResult =
        nextSearchResult;

    R.previousSearchResult =
        previousSearchResult;

    R.clearSearch =
        clearSearch;

    R.toggleBookmark =
        toggleBookmark;

    R.renderBookmarks =
        renderBookmarks;

    R.shareBook =
        shareBook;

    R.toggleLike =
        toggleLike;

    R.showToast =
        showToast;



    /* =====================================================
       INITIALIZE PART 5
    ===================================================== */

    function initializePartFive() {

        loadBookmarks();

        loadLike();

        bindPartFiveEvents();

        console.log(
            "CHISHTI READER — Part 5/9 loaded."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePartFive,
            {
                once: true
            }
        );

    } else {

        initializePartFive();

    }

})();
/* =========================================================
   CHISHTI READER — JAVASCRIPT
   PART 6 / 9

   PAGE NAVIGATION
   TWO-PAGE VIEW
   PAGE COUNTER
   PAGE INPUT
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       SHARED READER OBJECT
    ===================================================== */

    const R =
        window.ChishtiReader =
        window.ChishtiReader || {};



    /* =====================================================
       STATE
    ===================================================== */

    const state =
        R.state =
        R.state || {};


    if (
        typeof state.currentPage !== "number"
    ) {
        state.currentPage = 1;
    }


    if (
        typeof state.totalPages !== "number"
    ) {
        state.totalPages = 0;
    }


    if (
        typeof state.pageMode !== "string"
    ) {
        state.pageMode = "two-page";
    }


    if (
        typeof state.zoom !== "number"
    ) {
        state.zoom = 1;
    }



    /* =====================================================
       DOM HELPER
    ===================================================== */

    function getElement(id) {

        return document.getElementById(id);

    }



    /* =====================================================
       GET PAGE ELEMENTS
    ===================================================== */

    function getLeftPage() {

        return getElement(
            "readerPageLeft"
        );

    }


    function getRightPage() {

        return getElement(
            "readerPageRight"
        );

    }


    function getPageInput() {

        return getElement(
            "readerPageInput"
        );

    }


    function getTotalPagesElement() {

        return getElement(
            "readerTotalPages"
        );

    }


    function getPreviousPageButton() {

        return getElement(
            "previousPageButton"
        );

    }


    function getNextPageButton() {

        return getElement(
            "nextPageButton"
        );

    }



    /* =====================================================
       SAFE NUMBER
    ===================================================== */

    function safePageNumber(
        value,
        fallback = 1
    ) {

        const number =
            Number.parseInt(
                value,
                10
            );


        if (
            !Number.isFinite(number)
        ) {

            return fallback;

        }


        return number;

    }



    /* =====================================================
       SET TOTAL PAGES
    ===================================================== */

    function setTotalPages(
        total
    ) {

        const value =
            Math.max(
                0,
                safePageNumber(
                    total,
                    0
                )
            );


        state.totalPages =
            value;


        updatePageCounter();

        updateNavigationButtons();

    }



    /* =====================================================
       SET CURRENT PAGE
    ===================================================== */

    function setCurrentPage(
        page
    ) {

        let target =
            safePageNumber(
                page,
                1
            );


        if (
            state.totalPages > 0
        ) {

            target =
                Math.max(
                    1,
                    Math.min(
                        target,
                        state.totalPages
                    )
                );

        } else {

            target =
                Math.max(
                    1,
                    target
                );

        }


        state.currentPage =
            target;


        updatePageCounter();

        updateNavigationButtons();

        updatePageNumbers();

        updateReadingProgress();


        R.emit?.(
            "reader:page-change",
            {
                page:
                    state.currentPage,

                totalPages:
                    state.totalPages
            }
        );

    }



    /* =====================================================
       PAGE COUNTER
    ===================================================== */

    function updatePageCounter() {

        const input =
            getPageInput();


        const totalElement =
            getTotalPagesElement();


        if (input) {

            input.value =
                state.currentPage;

        }


        if (totalElement) {

            totalElement.textContent =
                String(
                    state.totalPages || 0
                );

        }

    }



    /* =====================================================
       PAGE NAVIGATION BUTTONS
    ===================================================== */

    function updateNavigationButtons() {

        const previous =
            getPreviousPageButton();


        const next =
            getNextPageButton();


        if (previous) {

            previous.disabled =
                state.currentPage <= 1;

        }


        if (next) {

            next.disabled =
                state.totalPages > 0 &&
                state.currentPage >=
                state.totalPages;

        }

    }



    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    function previousPage() {

        if (
            state.currentPage <= 1
        ) {

            return;

        }


        setCurrentPage(
            state.currentPage - 1
        );


        renderCurrentSpread();

    }



    /* =====================================================
       NEXT PAGE
    ===================================================== */

    function nextPage() {

        if (
            state.totalPages > 0 &&
            state.currentPage >=
            state.totalPages
        ) {

            return;

        }


        setCurrentPage(
            state.currentPage + 1
        );


        renderCurrentSpread();

    }



    /* =====================================================
       GO TO PAGE
    ===================================================== */

    function goToPage(
        page
    ) {

        const target =
            safePageNumber(
                page,
                1
            );


        setCurrentPage(
            target
        );


        renderCurrentSpread();

    }



    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function handlePageInput() {

        const input =
            getPageInput();


        if (!input) {

            return;

        }


        const target =
            safePageNumber(
                input.value,
                state.currentPage
            );


        goToPage(
            target
        );

    }



    /* =====================================================
       PAGE INPUT EVENTS
    ===================================================== */

    function bindPageInput() {

        const input =
            getPageInput();


        if (!input) {

            return;

        }


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    handlePageInput();

                    input.blur();

                }

            }
        );


        input.addEventListener(
            "change",
            handlePageInput
        );

    }



    /* =====================================================
       TWO-PAGE SPREAD
       
       Page 1:
          Left = 1
          Right = 2

       Page 12:
          Left = 12
          Right = 13

       Last page:
          Right page becomes empty.
    ===================================================== */

    function getSpreadPages() {

        const firstPage =
            state.currentPage;


        if (
            state.pageMode !==
            "two-page"
        ) {

            return {

                left:
                    firstPage,

                right:
                    null

            };

        }


        const secondPage =
            firstPage + 1;


        return {

            left:
                firstPage,

            right:
                secondPage <=
                state.totalPages
                    ? secondPage
                    : null

        };

    }



    /* =====================================================
       UPDATE PAGE NUMBERS
    ===================================================== */

    function updatePageNumbers() {

        const spread =
            getSpreadPages();


        const left =
            getLeftPage();


        const right =
            getRightPage();


        const leftNumber =
            left?.querySelector(
                ".reader-page-number"
            );


        const rightNumber =
            right?.querySelector(
                ".reader-page-number"
            );


        if (leftNumber) {

            leftNumber.textContent =
                spread.left
                    ? String(
                        spread.left
                    )
                    : "";

        }


        if (rightNumber) {

            rightNumber.textContent =
                spread.right
                    ? String(
                        spread.right
                    )
                    : "";

        }

    }



    /* =====================================================
       CLEAR PAGE
    ===================================================== */

    function clearPage(
        pageElement
    ) {

        if (!pageElement) {

            return;

        }


        const canvas =
            pageElement.querySelector(
                ".reader-page-canvas"
            );


        const textLayer =
            pageElement.querySelector(
                ".reader-page-text-layer"
            );


        if (canvas) {

            const context =
                canvas.getContext(
                    "2d"
                );


            if (context) {

                context.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }


            canvas.width = 0;

            canvas.height = 0;

        }


        if (textLayer) {

            textLayer.innerHTML = "";

        }


        pageElement.classList.remove(
            "has-page",
            "empty-page"
        );

    }



    /* =====================================================
       PREPARE PAGE
    ===================================================== */

    function preparePage(
        pageElement,
        pageNumber
    ) {

        if (!pageElement) {

            return;

        }


        if (
            !pageNumber
        ) {

            clearPage(
                pageElement
            );


            pageElement.classList.add(
                "empty-page"
            );


            return;

        }


        pageElement.dataset.page =
            String(
                pageNumber
            );


        pageElement.classList.add(
            "has-page"
        );


        pageElement.classList.remove(
            "empty-page"
        );


        const number =
            pageElement.querySelector(
                ".reader-page-number"
            );


        if (number) {

            number.textContent =
                String(
                    pageNumber
                );

        }

    }



    /* =====================================================
       RENDER CURRENT SPREAD
       
       IMPORTANT:
       Actual PDF rendering will be connected in the
       rendering part. This function ONLY prepares the
       correct left/right page targets.
    ===================================================== */

    function renderCurrentSpread() {

        const spread =
            getSpreadPages();


        const left =
            getLeftPage();


        const right =
            getRightPage();


        preparePage(
            left,
            spread.left
        );


        preparePage(
            right,
            spread.right
        );


        updatePageNumbers();


        R.renderPage?.(
            spread.left,
            left
        );


        if (
            spread.right
        ) {

            R.renderPage?.(
                spread.right,
                right
            );

        }


        R.emit?.(
            "reader:spread-change",
            {
                left:
                    spread.left,

                right:
                    spread.right
            }
        );

    }



    /* =====================================================
       READING PROGRESS
    ===================================================== */

    function updateReadingProgress() {

        if (
            state.totalPages <= 0
        ) {

            state.readingProgress =
                0;

            return;

        }


        state.readingProgress =
            Math.round(
                (
                    state.currentPage /
                    state.totalPages
                ) * 100
            );


        R.emit?.(
            "reader:progress",
            {
                page:
                    state.currentPage,

                totalPages:
                    state.totalPages,

                progress:
                    state.readingProgress
            }
        );

    }



    /* =====================================================
       KEYBOARD PAGE NAVIGATION
    ===================================================== */

    function handlePageKeyboard(
        event
    ) {

        if (
            event.defaultPrevented
        ) {

            return;

        }


        const target =
            event.target;


        if (
            target instanceof
            HTMLInputElement ||
            target instanceof
            HTMLTextAreaElement ||
            target instanceof
            HTMLSelectElement
        ) {

            return;

        }


        if (
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            previousPage();

            return;

        }


        if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            nextPage();

        }

    }



    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    function bindNavigationButtons() {

        const previous =
            getPreviousPageButton();


        const next =
            getNextPageButton();


        previous?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                previousPage();

            }
        );


        next?.addEventListener(
            "click",
            event => {

                event.preventDefault();

                nextPage();

            }
        );

    }



    /* =====================================================
       INITIALIZE PAGE NAVIGATION
    ===================================================== */

    function initializePageNavigation() {

        bindNavigationButtons();

        bindPageInput();


        document.addEventListener(
            "keydown",
            handlePageKeyboard
        );


        updatePageCounter();

        updateNavigationButtons();

        updatePageNumbers();

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.setTotalPages =
        setTotalPages;


    R.setCurrentPage =
        setCurrentPage;


    R.getCurrentPage =
        () =>
            state.currentPage;


    R.getTotalPages =
        () =>
            state.totalPages;


    R.previousPage =
        previousPage;


    R.nextPage =
        nextPage;


    R.goToPage =
        goToPage;


    R.getSpreadPages =
        getSpreadPages;


    R.renderCurrentSpread =
        renderCurrentSpread;


    R.updatePageCounter =
        updatePageCounter;



    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePageNavigation,
            {
                once: true
            }
        );

    } else {

        initializePageNavigation();

    }


})();
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 7 / 9

   PAGE NAVIGATION
   TWO-PAGE VIEW
   PAGE COUNTER
   ZOOM
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GET READER STATE
    ===================================================== */

    const R =
        window.ChishtiReader ||
        window.Reader ||
        {};


    const state =
        R.state ||
        (R.state = {});


    /* =====================================================
       DEFAULT STATE
    ===================================================== */

    if (
        typeof state.currentPage !== "number"
    ) {

        state.currentPage = 1;

    }


    if (
        typeof state.totalPages !== "number"
    ) {

        state.totalPages = 0;

    }


    if (
        typeof state.zoom !== "number"
    ) {

        state.zoom = 1;

    }


    if (
        typeof state.minZoom !== "number"
    ) {

        state.minZoom = 0.5;

    }


    if (
        typeof state.maxZoom !== "number"
    ) {

        state.maxZoom = 3;

    }


    if (
        typeof state.zoomStep !== "number"
    ) {

        state.zoomStep = 0.1;

    }


    if (
        !state.pageMode
    ) {

        state.pageMode = "two-page";

    }



    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function get(
        selector
    ) {

        return document.querySelector(
            selector
        );

    }


    function getAll(
        selector
    ) {

        return [
            ...document.querySelectorAll(
                selector
            )
        ];

    }



    /* =====================================================
       READER ELEMENTS
    ===================================================== */

    function getStage() {

        return (
            get("#readerPageStage") ||
            get(".reader-page-stage") ||
            get(".page-stage")
        );

    }


    function getLeftPage() {

        return (
            get("#readerPageLeft .reader-page") ||
            get("#readerPageLeft") ||
            get(".reader-page-left")
        );

    }


    function getRightPage() {

        return (
            get("#readerPageRight .reader-page") ||
            get("#readerPageRight") ||
            get(".reader-page-right")
        );

    }


    function getPageInput() {

        return (
            get("#readerPageInput") ||
            get(".reader-page-input")
        );

    }


    function getTotalPagesElement() {

        return (
            get("#readerTotalPages") ||
            get(".reader-total-pages")
        );

    }


    function getZoomLevel() {

        return (
            get("#zoomResetButton") ||
            get(".reader-zoom-level")
        );

    }



    /* =====================================================
       SAFE INTEGER
    ===================================================== */

    function safeInteger(
        value,
        fallback = 1
    ) {

        const number =
            Number(value);


        if (
            Number.isInteger(number)
        ) {

            return number;

        }


        return fallback;

    }



    /* =====================================================
       SET TOTAL PAGES
    ===================================================== */

    function setTotalPages(
        total
    ) {

        total =
            safeInteger(
                total,
                0
            );


        if (
            total < 0
        ) {

            total = 0;

        }


        state.totalPages =
            total;


        updatePageCounter();

    }



    /* =====================================================
       SET CURRENT PAGE
    ===================================================== */

    function setCurrentPage(
        page
    ) {

        page =
            safeInteger(
                page,
                1
            );


        if (
            state.totalPages > 0
        ) {

            page =
                Math.max(
                    1,
                    Math.min(
                        page,
                        state.totalPages
                    )
                );

        } else {

            page =
                Math.max(
                    1,
                    page
                );

        }


        state.currentPage =
            page;


        renderPagePair();

        updatePageCounter();

        updateNavigationButtons();

    }



    /* =====================================================
       UPDATE PAGE COUNTER
    ===================================================== */

    function updatePageCounter() {

        const input =
            getPageInput();


        const total =
            getTotalPagesElement();


        if (input) {

            input.value =
                state.currentPage;

        }


        if (total) {

            total.textContent =
                state.totalPages;

        }


        const infoPage =
            get("#readerInfoCurrentPage");


        if (infoPage) {

            infoPage.textContent =
                state.currentPage;

        }


        const infoTotal =
            get("#readerInfoTotalPages");


        if (infoTotal) {

            infoTotal.textContent =
                state.totalPages;

        }


        updateProgress();

    }



    /* =====================================================
       PROGRESS
    ===================================================== */

    function updateProgress() {

        let percentage =
            0;


        if (
            state.totalPages > 0
        ) {

            percentage =
                (
                    state.currentPage /
                    state.totalPages
                ) * 100;

        }


        percentage =
            Math.max(
                0,
                Math.min(
                    100,
                    percentage
                )
            );


        const progress =
            get(
                ".reader-progress-fill"
            );


        if (progress) {

            progress.style.width =
                `${percentage}%`;

        }


        const liveRegion =
            get("#readerLiveRegion");


        if (liveRegion) {

            liveRegion.textContent =
                `Page ${state.currentPage} of ${state.totalPages}`;

        }

    }



    /* =====================================================
       TWO-PAGE RENDER TARGET
       
       Example:
       
       Page 12 → left page
       Page 13 → right page
       
       Page 14 → left page
       Page 15 → right page
    ===================================================== */

    function renderPagePair() {

        const left =
            getLeftPage();


        const right =
            getRightPage();


        if (!left) {

            return;

        }


        const firstPage =
            state.currentPage;


        const secondPage =
            firstPage + 1;


        left.dataset.pageNumber =
            String(
                firstPage
            );


        left.dataset.page =
            String(
                firstPage
            );


        const leftNumber =
            left.querySelector(
                ".reader-page-number"
            );


        if (leftNumber) {

            leftNumber.textContent =
                firstPage;

        }


        if (
            right &&
            state.pageMode === "two-page"
        ) {

            if (
                state.totalPages === 0 ||
                secondPage <= state.totalPages
            ) {

                right.hidden =
                    false;


                right.dataset.pageNumber =
                    String(
                        secondPage
                    );


                right.dataset.page =
                    String(
                        secondPage
                    );


                const rightNumber =
                    right.querySelector(
                        ".reader-page-number"
                    );


                if (rightNumber) {

                    rightNumber.textContent =
                        secondPage;

                }

            } else {

                right.hidden =
                    true;

            }

        } else if (right) {

            right.hidden =
                true;

        }


        if (typeof R.renderPagePair === "function") {

            R.renderPagePair(
                firstPage,
                secondPage
            );

        } else if (
            typeof R.renderPages === "function"
        ) {

            R.renderPages(
                firstPage,
                secondPage
            );

        }

    }



    /* =====================================================
       NEXT PAGE
    ===================================================== */

    function nextPage() {

        if (
            state.totalPages <= 0
        ) {

            return;

        }


        const step =
            state.pageMode === "two-page"
                ? 2
                : 1;


        const next =
            state.currentPage +
            step;


        if (
            next >
            state.totalPages
        ) {

            return;

        }


        setCurrentPage(
            next
        );


        showControls();

    }



    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    function previousPage() {

        if (
            state.currentPage <= 1
        ) {

            return;

        }


        const step =
            state.pageMode === "two-page"
                ? 2
                : 1;


        const previous =
            Math.max(
                1,
                state.currentPage -
                step
            );


        setCurrentPage(
            previous
        );


        showControls();

    }



    /* =====================================================
       GO TO PAGE
    ===================================================== */

    function goToPage(
        page
    ) {

        page =
            safeInteger(
                page,
                1
            );


        setCurrentPage(
            page
        );


        showControls();

    }



    /* =====================================================
       NAVIGATION BUTTON STATE
    ===================================================== */

    function updateNavigationButtons() {

        const previous =
            get(
                "#previousPageButton"
            );


        const next =
            get(
                "#nextPageButton"
            );


        if (previous) {

            previous.disabled =
                state.currentPage <= 1;

        }


        if (next) {

            if (
                state.totalPages <= 0
            ) {

                next.disabled =
                    false;

            } else {

                const step =
                    state.pageMode === "two-page"
                        ? 2
                        : 1;


                next.disabled =
                    state.currentPage +
                    step >
                    state.totalPages;

            }

        }

    }



    /* =====================================================
       ZOOM
    ===================================================== */

    function setZoom(
        value
    ) {

        value =
            Number(value);


        if (
            !Number.isFinite(value)
        ) {

            value =
                1;

        }


        value =
            Math.max(
                state.minZoom,
                Math.min(
                    state.maxZoom,
                    value
                )
            );


        state.zoom =
            Math.round(
                value * 100
            ) / 100;


        applyZoom();

    }



    function zoomIn() {

        setZoom(
            state.zoom +
            state.zoomStep
        );

    }



    function zoomOut() {

        setZoom(
            state.zoom -
            state.zoomStep
        );

    }



    function resetZoom() {

        setZoom(
            1
        );

    }



    function applyZoom() {

        const stage =
            getStage();


        if (stage) {

            stage.style.setProperty(
                "--reader-zoom",
                String(
                    state.zoom
                )
            );


            stage.style.transform =
                `scale(${state.zoom})`;

        }


        const zoom =
            getZoomLevel();


        if (zoom) {

            zoom.textContent =
                `${Math.round(
                    state.zoom * 100
                )}%`;

        }

    }



    /* =====================================================
       FIT MODE
    ===================================================== */

    function setFitMode(
        mode
    ) {

        if (
            mode !== "width" &&
            mode !== "page" &&
            mode !== "actual"
        ) {

            mode =
                "width";

        }


        state.fitMode =
            mode;


        const reader =
            get(
                "#chishtilib-reader"
            ) ||
            get(
                ".reader"
            );


        if (reader) {

            reader.dataset.fit =
                mode;

        }


        if (
            mode === "actual"
        ) {

            resetZoom();

            return;

        }


        const viewport =
            get(
                "#readerViewport"
            );


        const stage =
            getStage();


        if (
            !viewport ||
            !stage
        ) {

            resetZoom();

            return;

        }


        /*
         * CSS handles the actual responsive sizing.
         * We reset transform here so the page does not
         * become permanently enlarged after switching fit.
         */

        stage.style.transform =
            "scale(1)";


        state.zoom =
            1;


        applyZoom();

    }



    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function handlePageInput() {

        const input =
            getPageInput();


        if (!input) {

            return;

        }


        const page =
            safeInteger(
                input.value,
                state.currentPage
            );


        goToPage(
            page
        );

    }



    /* =====================================================
       KEYBOARD PAGE NAVIGATION
    ===================================================== */

    function handleKeyboard(
        event
    ) {

        const target =
            event.target;


        const tag =
            target?.tagName;


        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            target?.isContentEditable
        ) {

            return;

        }


        if (
            event.key === "ArrowRight" ||
            event.key === "PageDown"
        ) {

            event.preventDefault();

            nextPage();

            return;

        }


        if (
            event.key === "ArrowLeft" ||
            event.key === "PageUp"
        ) {

            event.preventDefault();

            previousPage();

            return;

        }


        if (
            event.key === "+" ||
            event.key === "="
        ) {

            event.preventDefault();

            zoomIn();

            return;

        }


        if (
            event.key === "-" ||
            event.key === "_"
        ) {

            event.preventDefault();

            zoomOut();

            return;

        }

    }



    /* =====================================================
       CONTROL VISIBILITY
    ===================================================== */

    function showControls() {

        const reader =
            get(
                "#chishtilib-reader"
            ) ||
            get(
                ".reader"
            );


        if (!reader) {

            return;

        }


        reader.classList.remove(
            "controls-hidden"
        );

    }



    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    function bindButtons() {

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {

                    return;

                }


                const action =
                    button.dataset.action;


                switch (action) {

                    case "previous-page":

                        previousPage();

                        break;


                    case "next-page":

                        nextPage();

                        break;


                    case "zoom-in":

                        zoomIn();

                        break;


                    case "zoom-out":

                        zoomOut();

                        break;


                    case "zoom-reset":

                        resetZoom();

                        break;


                    case "fit-width":

                        setFitMode(
                            "width"
                        );

                        break;


                    case "fit-page":

                        setFitMode(
                            "page"
                        );

                        break;

                }

            }
        );


        const input =
            getPageInput();


        input?.addEventListener(
            "change",
            handlePageInput
        );


        input?.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    handlePageInput();

                    input.blur();

                }

            }
        );


        document.addEventListener(
            "keydown",
            handleKeyboard
        );

    }



    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.setTotalPages =
        setTotalPages;


    R.setCurrentPage =
        setCurrentPage;


    R.goToPage =
        goToPage;


    R.nextPage =
        nextPage;


    R.previousPage =
        previousPage;


    R.setZoom =
        setZoom;


    R.zoomIn =
        zoomIn;


    R.zoomOut =
        zoomOut;


    R.resetZoom =
        resetZoom;


    R.setFitMode =
        setFitMode;


    R.renderPagePair =
        renderPagePair;


    R.updatePageCounter =
        updatePageCounter;


    R.updateNavigationButtons =
        updateNavigationButtons;



    /* =====================================================
       INITIALIZE
    ===================================================== */

    bindButtons();

    updatePageCounter();

    updateNavigationButtons();

    applyZoom();


    console.log(
        "Chishti Reader — Part 7/9 loaded."
    );


})();
/* =========================================================
   CHISHTI READER
   JAVASCRIPT — PART 8 / 8
   FINAL PUBLIC API + INITIALIZATION
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       FINAL STATE HELPERS
    ===================================================== */

    function getState() {

        return ReaderState;

    }


    function getCurrentBook() {

        return ReaderState.currentBook;

    }


    function getCurrentPage() {

        return ReaderState.currentPage;

    }


    function getTotalPages() {

        return ReaderState.totalPages;

    }


    /* =====================================================
       FINAL READER STATUS
    ===================================================== */

    function isReaderOpen() {

        return Boolean(
            ReaderState.isReaderOpen
        );

    }


    function isOpeningBook() {

        return Boolean(
            ReaderState.isOpeningBook
        );

    }


    /* =====================================================
       FINAL UI REFRESH
    ===================================================== */

    function refreshReaderUI() {

        updatePageUI();

        updateZoomUI();

        updateBookmarkUI();

        updateLikeUI();

    }


    /* =====================================================
       ZOOM UI
    ===================================================== */

    function updateZoomUI() {

        const zoom =
            Math.round(
                ReaderState.zoom * 100
            );


        if (DOM.zoomLevel) {

            DOM.zoomLevel.textContent =
                `${zoom}%`;

        }


        if (DOM.zoomRange) {

            DOM.zoomRange.value =
                ReaderState.zoom;

        }


        if (DOM.zoomIn) {

            DOM.zoomIn.disabled =
                ReaderState.zoom >=
                ReaderState.maxZoom;

        }


        if (DOM.zoomOut) {

            DOM.zoomOut.disabled =
                ReaderState.zoom <=
                ReaderState.minZoom;

        }

    }


    /* =====================================================
       BOOKMARK UI
    ===================================================== */

    function updateBookmarkUI() {

        const page =
            ReaderState.currentPage;


        const isBookmarked =
            ReaderState.bookmarks.includes(
                page
            );


        const buttons =
            document.querySelectorAll(
                "[data-action='bookmark-page']"
            );


        buttons.forEach(button => {

            button.classList.toggle(
                "active",
                isBookmarked
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    isBookmarked
                )
            );

        });

    }


    /* =====================================================
       LIKE STATE
    ===================================================== */

    function updateLikeUI() {

        const likeButtons =
            document.querySelectorAll(
                "[data-action='like-book']"
            );


        const liked =
            Boolean(
                ReaderState.bookLiked
            );


        likeButtons.forEach(button => {

            button.classList.toggle(
                "active",
                liked
            );


            button.setAttribute(
                "aria-pressed",
                String(
                    liked
                )
            );


            const icon =
                button.querySelector(
                    ".reader-social-icon"
                );


            if (icon) {

                icon.textContent =
                    liked
                        ? "♥"
                        : "♡";

            }

        });

    }


    /* =====================================================
       LIKE BOOK
    ===================================================== */

    function toggleLike() {

        ReaderState.bookLiked =
            !Boolean(
                ReaderState.bookLiked
            );


        saveLikeState();


        updateLikeUI();


        showToast(
            ReaderState.bookLiked
                ? "Book liked"
                : "Like removed",
            ReaderState.bookLiked
                ? "♥"
                : "♡"
        );

    }


    /* =====================================================
       LIKE STORAGE
    ===================================================== */

    function saveLikeState() {

        try {

            const key =
                getBookStorageKey(
                    "liked"
                );


            localStorage.setItem(
                key,
                ReaderState.bookLiked
                    ? "1"
                    : "0"
            );

        } catch (error) {

            console.warn(
                "Could not save like state.",
                error
            );

        }

    }


    function loadLikeState() {

        try {

            const key =
                getBookStorageKey(
                    "liked"
                );


            ReaderState.bookLiked =
                localStorage.getItem(
                    key
                ) === "1";

        } catch (error) {

            ReaderState.bookLiked =
                false;

        }

    }


    /* =====================================================
       BOOK STORAGE KEY
    ===================================================== */

    function getBookStorageKey(
        suffix
    ) {

        const book =
            ReaderState.currentBook;


        const raw =
            book?.url ||
            book?.src ||
            ReaderState.currentBookUrl ||
            ReaderState.currentBookName ||
            "default";


        const safe =
            String(raw)
                .trim()
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "_"
                )
                .slice(
                    0,
                    100
                );


        return (
            `chishtireader_${safe}_${suffix}`
        );

    }


    /* =====================================================
       LOAD BOOK-SPECIFIC STATE
    ===================================================== */

    function loadBookState() {

        loadLikeState();

        loadBookmarks();

        loadLastReadPage();

        updateLikeUI();

        updateBookmarkUI();

    }


    /* =====================================================
       BOOKMARK LOAD
    ===================================================== */

    function loadBookmarks() {

        try {

            const saved =
                localStorage.getItem(
                    getBookStorageKey(
                        "bookmarks"
                    )
                );


            if (!saved) {

                ReaderState.bookmarks =
                    [];

                return;

            }


            const parsed =
                JSON.parse(
                    saved
                );


            if (
                Array.isArray(
                    parsed
                )
            ) {

                ReaderState.bookmarks =
                    parsed
                        .map(
                            Number
                        )
                        .filter(
                            Number.isFinite
                        )
                        .filter(
                            page =>
                                page > 0
                        );

            } else {

                ReaderState.bookmarks =
                    [];

            }

        } catch (error) {

            ReaderState.bookmarks =
                [];

        }

    }


    /* =====================================================
       LAST PAGE LOAD
    ===================================================== */

    function loadLastReadPage() {

        if (
            !ReaderState.rememberPosition
        ) {

            return;

        }


        try {

            const saved =
                localStorage.getItem(
                    getBookStorageKey(
                        "last_page"
                    )
                );


            const page =
                Number(
                    saved
                );


            if (
                Number.isFinite(
                    page
                ) &&
                page >= 1
            ) {

                ReaderState.lastReadPage =
                    page;

            }

        } catch (error) {

            ReaderState.lastReadPage =
                1;

        }

    }


    /* =====================================================
       SAVE BOOKMARKS OVERRIDE
       Keeps bookmarks separate for every book.
    ===================================================== */

    function saveBookmarksForCurrentBook() {

        try {

            localStorage.setItem(
                getBookStorageKey(
                    "bookmarks"
                ),
                JSON.stringify(
                    ReaderState.bookmarks
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
       SAVE CURRENT PAGE
    ===================================================== */

    function saveCurrentPage() {

        if (
            !ReaderState.rememberPosition
        ) {

            return;

        }


        try {

            localStorage.setItem(
                getBookStorageKey(
                    "last_page"
                ),
                String(
                    ReaderState.currentPage
                )
            );

        } catch (error) {

            console.warn(
                "Could not save current page.",
                error
            );

        }

    }


    /* =====================================================
       READER OPEN HOOK
    ===================================================== */

    const originalShowReader =
        showReader;


    showReader =
        function () {

            originalShowReader();


            loadBookState();


            refreshReaderUI();

        };


    /* =====================================================
       PAGE CHANGE HOOK
    ===================================================== */

    const originalNextPage =
        nextPage;


    nextPage =
        function () {

            originalNextPage();


            saveCurrentPage();

            updateBookmarkUI();

        };


    const originalPreviousPage =
        previousPage;


    previousPage =
        function () {

            originalPreviousPage();


            saveCurrentPage();

            updateBookmarkUI();

        };


    /* =====================================================
       BOOKMARK HOOK
    ===================================================== */

    const originalToggleBookmark =
        toggleBookmark;


    toggleBookmark =
        function () {

            originalToggleBookmark();


            saveBookmarksForCurrentBook();

            updateBookmarkUI();

        };


    /* =====================================================
       PAGE INPUT
       
       User can type:
       12
       Enter
       → page 12
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            const target =
                event.target;


            if (
                !target ||
                target !== DOM.pageInput
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
                Number(
                    target.value
                );


            if (
                !Number.isFinite(
                    page
                )
            ) {

                return;

            }


            const max =
                ReaderState.totalPages ||
                page;


            ReaderState.currentPage =
                Math.max(
                    1,
                    Math.min(
                        max,
                        Math.floor(
                            page
                        )
                    )
                );


            updatePageUI();

            saveCurrentPage();

            showReaderControls();

        }
    );


    /* =====================================================
       RANGE ZOOM
    ===================================================== */

    DOM.zoomRange?.addEventListener(
        "input",
        event => {

            const value =
                Number(
                    event.target.value
                );


            if (
                Number.isFinite(
                    value
                )
            ) {

                setZoom(
                    value
                );

            }

        }
    );


    /* =====================================================
       GLOBAL KEYBOARD SHORTCUTS
    ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                !ReaderState.isReaderOpen
            ) {

                return;

            }


            const target =
                event.target;


            const tag =
                target?.tagName
                    ?.toLowerCase();


            const typing =
                tag === "input" ||
                tag === "textarea" ||
                tag === "select" ||
                target?.isContentEditable;


            /* -----------------------------------------
               Ctrl + F
            ----------------------------------------- */

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "f"
            ) {

                event.preventDefault();

                toggleSearch();

                return;

            }


            /* -----------------------------------------
               Escape
            ----------------------------------------- */

            if (
                event.key === "Escape"
            ) {

                return;

            }


            if (typing) {

                return;

            }


            /* -----------------------------------------
               Arrow navigation
            ----------------------------------------- */

            if (
                ReaderState.keyboardNavigation
            ) {

                if (
                    event.key === "ArrowRight"
                ) {

                    event.preventDefault();

                    nextPage();

                    return;

                }


                if (
                    event.key === "ArrowLeft"
                ) {

                    event.preventDefault();

                    previousPage();

                    return;

                }

            }


            /* -----------------------------------------
               Zoom +
            ----------------------------------------- */

            if (
                event.key === "+" ||
                event.key === "="
            ) {

                event.preventDefault();

                zoomIn();

                return;

            }


            /* -----------------------------------------
               Zoom -
            ----------------------------------------- */

            if (
                event.key === "-" ||
                event.key === "_"
            ) {

                event.preventDefault();

                zoomOut();

                return;

            }

        }
    );


    /* =====================================================
       FINAL ACTION ROUTER EXTENSION
    ===================================================== */

    const originalHandleAction =
        handleAction;


    handleAction =
        function (
            action,
            button
        ) {

            switch (action) {

                case "like-book":

                    toggleLike();

                    break;


                case "share-book":

                    openShare();

                    break;


                case "comments":

                    openComments();

                    break;


                case "download-book":

                    downloadBook();

                    break;


                case "print-book":

                    printBook();

                    break;


                case "close-search":

                    closeSearch();

                    break;


                case "search-next":

                    searchNext();

                    break;


                case "search-previous":

                    searchPrevious();

                    break;


                case "search-clear":

                    clearSearch();

                    break;


                case "close-settings":

                case "close-bookmarks":

                case "close-book-info":

                case "close-comments":

                case "close-share":

                case "close-contents":

                case "close-thumbnails":

                case "close-navigation":

                case "close-panel":

                    closeAllPanels();

                    break;


                case "close-modal":

                    closeModal();

                    break;


                default:

                    originalHandleAction(
                        action,
                        button
                    );

                    break;

            }

        };


    /* =====================================================
       SHARE
    ===================================================== */

    function openShare() {

        const panel =
            document.querySelector(
                "#readerSharePanel"
            );


        if (panel) {

            openPanel(
                panel
            );

        }

    }


    /* =====================================================
       COMMENTS
    ===================================================== */

    function openComments() {

        const panel =
            document.querySelector(
                "#readerCommentsPanel"
            );


        if (panel) {

            openPanel(
                panel
            );

        }

    }


    /* =====================================================
       SEARCH CLOSE
    ===================================================== */

    function closeSearch() {

        ReaderState.searchOpen =
            false;


        document
            .querySelector(
                "#readerSearchBar"
            )
            ?.classList.remove(
                "active",
                "open"
            );


        DOM.searchInput?.blur();

    }


    /* =====================================================
       SEARCH NAVIGATION
    ===================================================== */

    function searchNext() {

        if (
            typeof goToNextSearchResult ===
            "function"
        ) {

            goToNextSearchResult();

            return;

        }


        if (
            ReaderState.searchResults.length ===
            0
        ) {

            return;

        }


        ReaderState.currentSearchIndex =
            (
                ReaderState.currentSearchIndex +
                1
            ) %
            ReaderState.searchResults.length;

    }


    function searchPrevious() {

        if (
            typeof goToPreviousSearchResult ===
            "function"
        ) {

            goToPreviousSearchResult();

            return;

        }


        if (
            ReaderState.searchResults.length ===
            0
        ) {

            return;

        }


        ReaderState.currentSearchIndex--;

        if (
            ReaderState.currentSearchIndex <
            0
        ) {

            ReaderState.currentSearchIndex =
                ReaderState.searchResults.length -
                1;

        }

    }


    function clearSearch() {

        ReaderState.searchQuery =
            "";

        ReaderState.searchResults =
            [];

        ReaderState.currentSearchIndex =
            -1;


        if (DOM.searchInput) {

            DOM.searchInput.value =
                "";

        }


        if (DOM.searchResults) {

            DOM.searchResults.textContent =
                "0 / 0";

        }

    }


    /* =====================================================
       DOWNLOAD BOOK
    ===================================================== */

    function downloadBook() {

        const url =
            ReaderState.currentBookUrl;


        if (!url) {

            showToast(
                "Book file is not available",
                "!"
            );

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            ReaderState.currentBookName ||
            "chisti-reader-book.pdf";


        link.target =
            "_blank";


        link.rel =
            "noopener";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        showToast(
            "Download started",
            "⇩"
        );

    }


    /* =====================================================
       PRINT BOOK
    ===================================================== */

    function printBook() {

        if (
            ReaderState.currentBookUrl
        ) {

            const printWindow =
                window.open(
                    ReaderState.currentBookUrl,
                    "_blank"
                );


            if (
                printWindow
            ) {

                printWindow.addEventListener(
                    "load",
                    () => {

                        printWindow.print();

                    },
                    {
                        once: true
                    }
                );


                return;

            }

        }


        window.print();

    }


    /* =====================================================
       BEFORE PAGE UNLOAD
    ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            saveCurrentPage();

            saveBookmarksForCurrentBook();

        }
    );


    /* =====================================================
       FULLSCREEN STATE
    ===================================================== */

    document.addEventListener(
        "fullscreenchange",
        () => {

            ReaderState.isFullscreen =
                Boolean(
                    document.fullscreenElement
                );


            DOM.reader?.classList.toggle(
                "fullscreen-active",
                ReaderState.isFullscreen
            );

        }
    );


    /* =====================================================
       FINAL PUBLIC API
    ===================================================== */

    window.ChishtiReader =
        window.ChishtiReader ||
        {};


    Object.assign(
        window.ChishtiReader,
        {

            state:
                getState,

            open:
                openBook,

            close:
                closeReader,

            nextPage,

            previousPage,

            zoomIn,

            zoomOut,

            resetZoom,

            setZoom,

            toggleBookmark,

            toggleLike,

            toggleSearch,

            closeSearch,

            refresh:
                refreshReaderUI,

            getCurrentBook,

            getCurrentPage,

            getTotalPages,

            isOpen:
                isReaderOpen,

            isOpening:
                isOpeningBook

        }
    );


    /* =====================================================
       FINAL INITIALIZATION CHECK
    ===================================================== */

    function finalReaderCheck() {

        if (
            !ReaderState.initialized
        ) {

            return;

        }


        refreshReaderUI();


        console.log(
            "CHISHTI READER — JavaScript 8/8 ready."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            finalReaderCheck,
            {
                once: true
            }
        );

    } else {

        finalReaderCheck();

    }


})();
