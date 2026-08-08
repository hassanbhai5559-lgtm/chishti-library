/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 1 / 14
   CORE STATE + DOM REFERENCES + INITIALIZATION
========================================================= */

(() => {

    "use strict";


    /* =====================================================
       GLOBAL APPLICATION STATE
    ===================================================== */

    const ReaderState = {

        /* ---------------------------------------------
           Application
        --------------------------------------------- */

        initialized: false,

        isLoading: true,

        isReaderOpen: false,

        isOpeningBook: false,

        isClosingReader: false,


        /* ---------------------------------------------
           Book
        --------------------------------------------- */

        currentBook: null,

        currentBookName: "",

        currentBookUrl: "",

        totalPages: 0,

        currentPage: 1,


        /* ---------------------------------------------
           Reader
        --------------------------------------------- */

        zoom: 1,

        minZoom: 0.5,

        maxZoom: 3,

        zoomStep: 0.1,

        fitMode: "width",

        isFullscreen: false,

        focusMode: false,

        controlsVisible: true,


        /* ---------------------------------------------
           UI
        --------------------------------------------- */

        activePanel: null,

        activeModal: null,

        searchOpen: false,

        thumbnailOpen: false,

        settingsOpen: false,

        bookmarksOpen: false,

        contentsOpen: false,

        bookInfoOpen: false,


        /* ---------------------------------------------
           Reading
        --------------------------------------------- */

        readingProgress: 0,

        bookmarks: [],

        lastReadPage: 1,


        /* ---------------------------------------------
           Loading
        --------------------------------------------- */

        loadingProgress: 0,

        loadingMessage: "Preparing library",

        loadingTimer: null,


        /* ---------------------------------------------
           Settings
        --------------------------------------------- */

        theme: "maroon-gold",

        pageMode: "single",

        pageShadow: "soft",

        showPageNumbers: true,

        rememberPosition: true,

        keyboardNavigation: true,

        soundEffects: false,


        /* ---------------------------------------------
           Search
        --------------------------------------------- */

        searchQuery: "",

        searchResults: [],

        currentSearchIndex: -1,


        /* ---------------------------------------------
           Touch
        --------------------------------------------- */

        touchStartX: 0,

        touchStartY: 0,

        touchEndX: 0,

        touchEndY: 0,


        /* ---------------------------------------------
           Internal
        --------------------------------------------- */

        renderToken: 0,

        toastTimer: null,

        controlsTimer: null,

        openingTimer: null

    };


    /* =====================================================
       DOM CACHE
    ===================================================== */

    const DOM = {};


    function cacheDOM() {

        const selectors = {

            /* -----------------------------------------
               Main application
            ----------------------------------------- */

            app:
                "#app",

            loadingScreen:
                "#loadingScreen",

            loadingProgress:
                ".loading-progress-fill",

            loadingPercent:
                ".loading-percent",

            loadingMessage:
                ".loading-message",


            /* -----------------------------------------
               Opening animation
            ----------------------------------------- */

            bookOpeningScreen:
                "#bookOpeningScreen",

            openingBook:
                ".opening-book",

            openingWhiteLight:
                ".opening-white-light",


            /* -----------------------------------------
               Reader
            ----------------------------------------- */

            reader:
                ".reader",

            readerMain:
                ".reader-main",

            readerViewport:
                ".reader-viewport",

            pageStage:
                ".page-stage",

            readerPage:
                ".reader-page",


            /* -----------------------------------------
               Reader bars
            ----------------------------------------- */

            topbar:
                ".reader-topbar",

            bottombar:
                ".reader-bottombar",

            progressBar:
                ".reader-progress",

            progressFill:
                ".reader-progress-fill",


            /* -----------------------------------------
               Page navigation
            ----------------------------------------- */

            previousPage:
                "[data-action='previous-page']",

            nextPage:
                "[data-action='next-page']",

            pageInput:
                ".page-counter input",

            pageCounter:
                ".page-counter",


            /* -----------------------------------------
               Zoom
            ----------------------------------------- */

            zoomIn:
                "[data-action='zoom-in']",

            zoomOut:
                "[data-action='zoom-out']",

            zoomReset:
                "[data-action='zoom-reset']",

            zoomLevel:
                ".zoom-level",

            zoomRange:
                ".zoom-range",

            fitWidth:
                "[data-action='fit-width']",

            fitPage:
                "[data-action='fit-page']",


            /* -----------------------------------------
               Panels
            ----------------------------------------- */

            overlay:
                ".reader-overlay",

            sidebar:
                ".reader-sidebar",

            settingsPanel:
                ".settings-panel",

            bookmarkPanel:
                ".bookmark-panel",

            commentsPanel:
                ".comments-panel",

            bookInfoPanel:
                ".book-info-panel",

            thumbnailPanel:
                ".thumbnail-panel",


            /* -----------------------------------------
               Modals
            ----------------------------------------- */

            modalOverlay:
                ".modal-overlay",

            shortcutsBox:
                ".shortcuts-box",


            /* -----------------------------------------
               Search
            ----------------------------------------- */

            searchInput:
                ".search-input-wrap input",

            searchClear:
                ".search-clear",

            searchResults:
                ".search-results",


            /* -----------------------------------------
               Toast
            ----------------------------------------- */

            toast:
                ".reader-toast",


            /* -----------------------------------------
               Progress circle
            ----------------------------------------- */

            progressCircle:
                ".progress-circle .progress-value",

            progressCircleText:
                ".progress-circle span"

        };


        Object.entries(selectors).forEach(
            ([key, selector]) => {

                DOM[key] =
                    document.querySelector(selector);

            }
        );


        /* ---------------------------------------------
           Multiple element collections
        --------------------------------------------- */

        DOM.toolButtons =
            document.querySelectorAll(
                ".reader-tool-btn"
            );


        DOM.pageNavButtons =
            document.querySelectorAll(
                ".page-nav-btn"
            );


        DOM.zoomButtons =
            document.querySelectorAll(
                ".zoom-btn"
            );


        DOM.fitButtons =
            document.querySelectorAll(
                ".fit-btn"
            );


        DOM.panelCloseButtons =
            document.querySelectorAll(
                ".panel-close-btn, .close-button"
            );


        DOM.actionButtons =
            document.querySelectorAll(
                "[data-action]"
            );


        DOM.contentsItems =
            document.querySelectorAll(
                ".contents-item"
            );


        DOM.themeOptions =
            document.querySelectorAll(
                ".theme-option"
            );


        DOM.viewModeButtons =
            document.querySelectorAll(
                ".view-mode-btn"
            );

    }


    /* =====================================================
       SAFE DOM HELPERS
    ===================================================== */

    function $(selector, parent = document) {

        return parent.querySelector(selector);

    }


    function $$(selector, parent = document) {

        return [
            ...parent.querySelectorAll(selector)
        ];

    }


    function exists(element) {

        return Boolean(element);

    }


    function setText(element, value) {

        if (!element) return;

        element.textContent =
            value ?? "";

    }


    function setDisplay(element, visible) {

        if (!element) return;

        element.hidden =
            !visible;

    }


    /* =====================================================
       LOADING SYSTEM
    ===================================================== */

    function setLoadingProgress(
        value,
        message = null
    ) {

        const progress =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(value) || 0
                )
            );


        ReaderState.loadingProgress =
            progress;


        if (DOM.loadingProgress) {

            DOM.loadingProgress.style.width =
                `${progress}%`;

        }


        if (DOM.loadingPercent) {

            DOM.loadingPercent.textContent =
                `${Math.round(progress)}%`;

        }


        if (
            message !== null &&
            DOM.loadingMessage
        ) {

            DOM.loadingMessage.textContent =
                message;

            ReaderState.loadingMessage =
                message;

        }

    }


    function simulateInitialLoading() {

        if (!DOM.loadingScreen) {

            ReaderState.isLoading =
                false;

            return;

        }


        let progress =
            0;


        const messages = [

            "Preparing library",

            "Loading reader",

            "Preparing book system",

            "Checking interface",

            "Almost ready"

        ];


        let messageIndex =
            0;


        setLoadingProgress(
            0,
            messages[0]
        );


        ReaderState.loadingTimer =
            window.setInterval(() => {

                progress +=
                    Math.floor(
                        Math.random() * 13
                    ) + 7;


                if (progress >= 100) {

                    progress =
                        100;

                    setLoadingProgress(
                        100,
                        "Library ready"
                    );


                    window.clearInterval(
                        ReaderState.loadingTimer
                    );


                    window.setTimeout(
                        finishLoading,
                        350
                    );


                    return;

                }


                if (
                    progress > 18 &&
                    messageIndex < 1
                ) {

                    messageIndex =
                        1;

                }


                if (
                    progress > 42 &&
                    messageIndex < 2
                ) {

                    messageIndex =
                        2;

                }


                if (
                    progress > 67 &&
                    messageIndex < 3
                ) {

                    messageIndex =
                        3;

                }


                if (
                    progress > 86 &&
                    messageIndex < 4
                ) {

                    messageIndex =
                        4;

                }


                setLoadingProgress(
                    progress,
                    messages[messageIndex]
                );

            }, 180);

    }


    function finishLoading() {

        ReaderState.isLoading =
            false;


        if (!DOM.loadingScreen) {

            return;

        }


        DOM.loadingScreen.classList.add(
            "hidden"
        );


        window.setTimeout(() => {

            DOM.loadingScreen?.remove();

        }, 650);

    }


    /* =====================================================
       READER OPENING
       USER READ BUTTON -> BOOK CENTER -> WHITE LIGHT
       -> READER OPEN
    ===================================================== */

    function openBook(bookData = null) {

        if (
            ReaderState.isOpeningBook ||
            ReaderState.isReaderOpen
        ) {

            return;

        }


        ReaderState.isOpeningBook =
            true;


        ReaderState.currentBook =
            bookData;


        if (bookData) {

            ReaderState.currentBookName =
                bookData.title ||
                bookData.name ||
                "";

            ReaderState.currentBookUrl =
                bookData.url ||
                bookData.src ||
                "";

        }


        /* ---------------------------------------------
           Show book opening screen
        --------------------------------------------- */

        if (DOM.bookOpeningScreen) {

            DOM.bookOpeningScreen.classList.remove(
                "closing"
            );

            DOM.bookOpeningScreen.classList.add(
                "active"
            );

        }


        /* ---------------------------------------------
           Start white light / opening animation
        --------------------------------------------- */

        if (DOM.openingWhiteLight) {

            DOM.openingWhiteLight.style.animation =
                "none";

            /*
             * Force browser reflow so animation
             * can restart every time.
             */

            void DOM.openingWhiteLight.offsetWidth;

            DOM.openingWhiteLight.style.animation =
                "";

        }


        /* ---------------------------------------------
           Open actual reader after animation
        --------------------------------------------- */

        ReaderState.openingTimer =
            window.setTimeout(() => {

                showReader();

            }, 1150);

    }


    function showReader() {

        ReaderState.isOpeningBook =
            false;

        ReaderState.isReaderOpen =
            true;


        if (DOM.reader) {

            DOM.reader.classList.add(
                "active",
                "open"
            );

            DOM.reader.setAttribute(
                "aria-hidden",
                "false"
            );

        }


        /* ---------------------------------------------
           Close opening screen
        --------------------------------------------- */

        if (DOM.bookOpeningScreen) {

            DOM.bookOpeningScreen.classList.add(
                "closing"
            );


            window.setTimeout(() => {

                DOM.bookOpeningScreen.classList.remove(
                    "active",
                    "closing"
                );

            }, 700);

        }


        showReaderControls();


        updatePageUI();

    }


    /* =====================================================
       CLOSE READER
    ===================================================== */

    function closeReader() {

        if (
            !ReaderState.isReaderOpen ||
            ReaderState.isClosingReader
        ) {

            return;

        }


        ReaderState.isClosingReader =
            true;


        saveReadingPosition();


        if (DOM.reader) {

            DOM.reader.classList.add(
                "closing"
            );

        }


        window.setTimeout(() => {

            DOM.reader?.classList.remove(
                "active",
                "open",
                "closing"
            );


            DOM.reader?.setAttribute(
                "aria-hidden",
                "true"
            );


            ReaderState.isReaderOpen =
                false;

            ReaderState.isClosingReader =
                false;

            ReaderState.focusMode =
                false;


            closeAllPanels();

        }, 350);

    }


    /* =====================================================
       CONTROL BAR VISIBILITY
    ===================================================== */

    function showReaderControls() {

        ReaderState.controlsVisible =
            true;


        DOM.topbar?.classList.remove(
            "hidden"
        );


        DOM.bottombar?.classList.remove(
            "hidden"
        );


        clearTimeout(
            ReaderState.controlsTimer
        );


        if (!ReaderState.focusMode) {

            ReaderState.controlsTimer =
                window.setTimeout(() => {

                    hideReaderControls();

                }, 4500);

        }

    }


    function hideReaderControls() {

        if (
            !ReaderState.isReaderOpen ||
            ReaderState.focusMode
        ) {

            return;

        }


        ReaderState.controlsVisible =
            false;


        DOM.topbar?.classList.add(
            "hidden"
        );


        DOM.bottombar?.classList.add(
            "hidden"
        );

    }


    /* =====================================================
       PANEL MANAGEMENT
    ===================================================== */

    function closeAllPanels() {

        const panels = [

            DOM.sidebar,

            DOM.settingsPanel,

            DOM.bookmarkPanel,

            DOM.commentsPanel,

            DOM.bookInfoPanel,

            DOM.thumbnailPanel

        ];


        panels.forEach(panel => {

            panel?.classList.remove(
                "open",
                "active"
            );

        });


        DOM.overlay?.classList.remove(
            "open",
            "active"
        );


        ReaderState.activePanel =
            null;


        ReaderState.settingsOpen =
            false;

        ReaderState.bookmarksOpen =
            false;

        ReaderState.contentsOpen =
            false;

        ReaderState.bookInfoOpen =
            false;

        ReaderState.thumbnailOpen =
            false;

    }


    function openPanel(panel) {

        if (!panel) return;


        closeAllPanels();


        panel.classList.add(
            "open",
            "active"
        );


        DOM.overlay?.classList.add(
            "open",
            "active"
        );


        ReaderState.activePanel =
            panel;

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        message,
        icon = "✓"
    ) {

        if (!DOM.toast) return;


        clearTimeout(
            ReaderState.toastTimer
        );


        const iconElement =
            DOM.toast.querySelector("i");


        const textElement =
            DOM.toast.querySelector(
                "span"
            );


        if (iconElement) {

            iconElement.textContent =
                icon;

        }


        if (textElement) {

            textElement.textContent =
                message;

        } else {

            DOM.toast.textContent =
                message;

        }


        DOM.toast.classList.add(
            "show",
            "active"
        );


        ReaderState.toastTimer =
            window.setTimeout(() => {

                DOM.toast?.classList.remove(
                    "show",
                    "active"
                );

            }, 2400);

    }


    /* =====================================================
       PAGE UI
    ===================================================== */

    function updatePageUI() {

        const page =
            ReaderState.currentPage;

        const total =
            ReaderState.totalPages;


        setText(
            DOM.zoomLevel,
            `${Math.round(
                ReaderState.zoom * 100
            )}%`
        );


        if (DOM.pageInput) {

            DOM.pageInput.value =
                page;

        }


        if (DOM.previousPage) {

            DOM.previousPage.disabled =
                page <= 1;

        }


        if (DOM.nextPage) {

            DOM.nextPage.disabled =
                total > 0 &&
                page >= total;

        }


        if (DOM.progressFill) {

            const percentage =
                total > 0
                    ? (
                        page /
                        total
                    ) * 100
                    : 0;


            DOM.progressFill.style.width =
                `${percentage}%`;

        }


        if (DOM.progressCircleText) {

            const percentage =
                total > 0
                    ? Math.round(
                        (
                            page /
                            total
                        ) * 100
                    )
                    : 0;


            DOM.progressCircleText.textContent =
                `${percentage}%`;

        }

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


        setupGlobalEvents();


        loadSavedSettings();


        ReaderState.initialized =
            true;


        simulateInitialLoading();


        console.log(
            "Chishti Library Reader initialized."
        );

    }


    /* =====================================================
       GLOBAL EVENTS
    ===================================================== */

    function setupGlobalEvents() {

        /* ---------------------------------------------
           Read / Open buttons
        --------------------------------------------- */

        document.addEventListener(
            "click",
            event => {

                const readButton =
                    event.target.closest(
                        "[data-action='read'], .read-btn, .read-book"
                    );


                if (!readButton) return;


                event.preventDefault();


                const bookData = {

                    title:
                        readButton.dataset.bookTitle ||
                        readButton.dataset.title ||
                        readButton.closest(
                            "[data-book]"
                        )?.dataset.bookTitle ||
                        "",

                    url:
                        readButton.dataset.bookUrl ||
                        readButton.dataset.url ||
                        readButton.closest(
                            "[data-book]"
                        )?.dataset.bookUrl ||
                        ""

                };


                openBook(
                    bookData
                );

            }
        );


        /* ---------------------------------------------
           Action buttons
        --------------------------------------------- */

        document.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) return;


                const action =
                    button.dataset.action;


                if (
                    action === "read"
                ) {

                    return;

                }


                handleAction(
                    action,
                    button
                );

            }
        );


        /* ---------------------------------------------
           Overlay
        --------------------------------------------- */

        DOM.overlay?.addEventListener(
            "click",
            () => {

                closeAllPanels();

            }
        );


        /* ---------------------------------------------
           Escape key
        --------------------------------------------- */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    handleEscape();

                }

            }
        );


        /* ---------------------------------------------
           Reader mouse movement
        --------------------------------------------- */

        DOM.reader?.addEventListener(
            "mousemove",
            () => {

                showReaderControls();

            }
        );


        /* ---------------------------------------------
           Touch gestures
        --------------------------------------------- */

        DOM.reader?.addEventListener(
            "touchstart",
            handleTouchStart,
            {
                passive: true
            }
        );


        DOM.reader?.addEventListener(
            "touchend",
            handleTouchEnd,
            {
                passive: true
            }
        );


        /* ---------------------------------------------
           Window resize
        --------------------------------------------- */

        window.addEventListener(
            "resize",
            debounce(
                () => {

                    if (
                        ReaderState.isReaderOpen
                    ) {

                        updatePageUI();

                    }

                },
                150
            )
        );

    }


    /* =====================================================
       ACTION ROUTER
    ===================================================== */

    function handleAction(
        action,
        button
    ) {

        switch (action) {

            case "close-reader":

                closeReader();

                break;


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


            case "toggle-focus":

                toggleFocusMode();

                break;


            case "toggle-settings":

                toggleSettings();

                break;


            case "toggle-bookmarks":

                toggleBookmarks();

                break;


            case "toggle-contents":

                toggleContents();

                break;


            case "toggle-thumbnails":

                toggleThumbnails();

                break;


            case "toggle-book-info":

                toggleBookInfo();

                break;


            case "toggle-search":

                toggleSearch();

                break;


            case "show-shortcuts":

                openShortcuts();

                break;


            case "close-panel":

                closeAllPanels();

                break;


            case "fullscreen":

                toggleFullscreen();

                break;


            case "bookmark-page":

                toggleBookmark();

                break;


            default:

                break;

        }

    }


    /* =====================================================
       PAGE NAVIGATION
    ===================================================== */

    function nextPage() {

        if (
            ReaderState.totalPages > 0 &&
            ReaderState.currentPage >=
            ReaderState.totalPages
        ) {

            return;

        }


        ReaderState.currentPage +=
            1;


        updatePageUI();


        showReaderControls();


        saveReadingPosition();

    }


    function previousPage() {

        if (
            ReaderState.currentPage <= 1
        ) {

            return;

        }


        ReaderState.currentPage -=
            1;


        updatePageUI();


        showReaderControls();


        saveReadingPosition();

    }


    /* =====================================================
       ZOOM
    ===================================================== */

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


    function setZoom(value) {

        const zoom =
            Math.max(
                ReaderState.minZoom,
                Math.min(
                    ReaderState.maxZoom,
                    Number(value) || 1
                )
            );


        ReaderState.zoom =
            Math.round(
                zoom * 100
            ) / 100;


        if (DOM.pageStage) {

            DOM.pageStage.style.transform =
                `scale(${ReaderState.zoom})`;

        }


        updatePageUI();

    }


    function setFitMode(mode) {

        ReaderState.fitMode =
            mode;


        if (DOM.pageStage) {

            DOM.pageStage.style.transform =
                "scale(1)";

        }


        ReaderState.zoom =
            1;


        updatePageUI();

    }


    /* =====================================================
       FOCUS MODE
    ===================================================== */

    function toggleFocusMode() {

        ReaderState.focusMode =
            !ReaderState.focusMode;


        DOM.reader?.classList.toggle(
            "focus-mode",
            ReaderState.focusMode
        );


        if (
            ReaderState.focusMode
        ) {

            hideReaderControls();

        } else {

            showReaderControls();

        }

    }


    /* =====================================================
       PANEL TOGGLES
    ===================================================== */

    function toggleSettings() {

        if (
            DOM.settingsPanel?.classList.contains(
                "open"
            )
        ) {

            closeAllPanels();

            return;

        }


        openPanel(
            DOM.settingsPanel
        );

        ReaderState.settingsOpen =
            true;

    }


    function toggleBookmarks() {

        if (
            DOM.bookmarkPanel?.classList.contains(
                "open"
            )
        ) {

            closeAllPanels();

            return;

        }


        openPanel(
            DOM.bookmarkPanel
        );

        ReaderState.bookmarksOpen =
            true;

    }


    function toggleContents() {

        if (
            DOM.sidebar?.classList.contains(
                "open"
            )
        ) {

            closeAllPanels();

            return;

        }


        openPanel(
            DOM.sidebar
        );

        ReaderState.contentsOpen =
            true;

    }


    function toggleBookInfo() {

        if (
            DOM.bookInfoPanel?.classList.contains(
                "open"
            )
        ) {

            closeAllPanels();

            return;

        }


        openPanel(
            DOM.bookInfoPanel
        );

        ReaderState.bookInfoOpen =
            true;

    }


    function toggleThumbnails() {

        if (
            DOM.thumbnailPanel?.classList.contains(
                "open"
            )
        ) {

            closeAllPanels();

            return;

        }


        openPanel(
            DOM.thumbnailPanel
        );

        ReaderState.thumbnailOpen =
            true;

    }


    /* =====================================================
       SEARCH
    ===================================================== */

    function toggleSearch() {

        ReaderState.searchOpen =
            !ReaderState.searchOpen;


        if (
            ReaderState.searchOpen
        ) {

            DOM.searchInput?.focus();

        } else {

            DOM.searchInput?.blur();

        }

    }


    /* =====================================================
       SHORTCUT MODAL
    ===================================================== */

    function openShortcuts() {

        DOM.modalOverlay?.classList.add(
            "open",
            "active"
        );


        ReaderState.activeModal =
            DOM.modalOverlay;

    }


    function closeModal() {

        DOM.modalOverlay?.classList.remove(
            "open",
            "active"
        );


        ReaderState.activeModal =
            null;

    }


    /* =====================================================
       BOOKMARK
    ===================================================== */

    function toggleBookmark() {

        const page =
            ReaderState.currentPage;


        const index =
            ReaderState.bookmarks.indexOf(
                page
            );


        if (index === -1) {

            ReaderState.bookmarks.push(
                page
            );


            showToast(
                `Page ${page} bookmarked`,
                "★"
            );

        } else {

            ReaderState.bookmarks.splice(
                index,
                1
            );


            showToast(
                `Page ${page} bookmark removed`,
                "×"
            );

        }


        saveBookmarks();

    }


    /* =====================================================
       ESCAPE
    ===================================================== */

    function handleEscape() {

        if (
            ReaderState.activeModal
        ) {

            closeModal();

            return;

        }


        if (
            ReaderState.activePanel
        ) {

            closeAllPanels();

            return;

        }


        if (
            ReaderState.focusMode
        ) {

            toggleFocusMode();

            return;

        }


        if (
            ReaderState.isReaderOpen
        ) {

            closeReader();

        }

    }


    /* =====================================================
       TOUCH
    ===================================================== */

    function handleTouchStart(
        event
    ) {

        const touch =
            event.changedTouches[0];


        if (!touch) return;


        ReaderState.touchStartX =
            touch.clientX;

        ReaderState.touchStartY =
            touch.clientY;

    }


    function handleTouchEnd(
        event
    ) {

        const touch =
            event.changedTouches[0];


        if (!touch) return;


        ReaderState.touchEndX =
            touch.clientX;

        ReaderState.touchEndY =
            touch.clientY;


        const deltaX =
            ReaderState.touchEndX -
            ReaderState.touchStartX;


        const deltaY =
            ReaderState.touchEndY -
            ReaderState.touchStartY;


        const minimumSwipe =
            60;


        if (
            Math.abs(deltaX) <
            minimumSwipe
        ) {

            return;

        }


        if (
            Math.abs(deltaX) <=
            Math.abs(deltaY)
        ) {

            return;

        }


        if (deltaX < 0) {

            nextPage();

        } else {

            previousPage();

        }

    }


    /* =====================================================
       STORAGE
    ===================================================== */

    function loadSavedSettings() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_reader_settings"
                );


            if (!saved) return;


            const settings =
                JSON.parse(saved);


            Object.assign(
                ReaderState,
                settings
            );


        } catch (error) {

            console.warn(
                "Could not load reader settings.",
                error
            );

        }

    }


    function saveSettings() {

        try {

            localStorage.setItem(
                "chishtilib_reader_settings",
                JSON.stringify({

                    theme:
                        ReaderState.theme,

                    pageMode:
                        ReaderState.pageMode,

                    pageShadow:
                        ReaderState.pageShadow,

                    showPageNumbers:
                        ReaderState.showPageNumbers,

                    rememberPosition:
                        ReaderState.rememberPosition,

                    keyboardNavigation:
                        ReaderState.keyboardNavigation,

                    soundEffects:
                        ReaderState.soundEffects

                })
            );


        } catch (error) {

            console.warn(
                "Could not save reader settings.",
                error
            );

        }

    }


    function saveBookmarks() {

        try {

            localStorage.setItem(
                "chishtilib_reader_bookmarks",
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


    function saveReadingPosition() {

        if (
            !ReaderState.rememberPosition
        ) {

            return;

        }


        try {

            localStorage.setItem(
                "chishtilib_last_page",
                String(
                    ReaderState.currentPage
                )
            );


        } catch (error) {

            console.warn(
                "Could not save reading position.",
                error
            );

        }

    }


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    async function toggleFullscreen() {

        try {

            if (
                !document.fullscreenElement
            ) {

                await (
                    DOM.reader?.requestFullscreen?.()
                );

                ReaderState.isFullscreen =
                    true;

            } else {

                await (
                    document.exitFullscreen?.()
                );

                ReaderState.isFullscreen =
                    false;

            }


        } catch (error) {

            console.warn(
                "Fullscreen unavailable.",
                error
            );

        }

    }


    /* =====================================================
       DEBOUNCE
    ===================================================== */

    function debounce(
        callback,
        delay = 150
    ) {

        let timer;


        return (...args) => {

            clearTimeout(
                timer
            );


            timer =
                setTimeout(
                    () => {

                        callback(
                            ...args
                        );

                    },
                    delay
                );

        };

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
            initializeReader,
            {
                once: true
            }
        );

    } else {

        initializeReader();

    }


    /* =====================================================
       GLOBAL ACCESS
       Later JS parts will use this.
    ===================================================== */

    window.ChishtiReader =
        {

            state:
                ReaderState,

            openBook,

            closeReader,

            nextPage,

            previousPage,

            zoomIn,

            zoomOut,

            resetZoom,

            setZoom,

            showToast,

            toggleBookmark,

            toggleFocusMode,

            closeAllPanels

        };


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 2 / 14
   PDF.JS ENGINE + BOOK LOADING + PAGE RENDERING
========================================================= */


/* =========================================================
   PDF ENGINE STATE
========================================================= */

(() => {

    "use strict";


    const R =
        window.ChishtiReader;


    if (!R || !R.state) {

        console.error(
            "ChishtiReader core is not initialized."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       PDF STATE
    ===================================================== */

    state.pdfDocument =
        null;

    state.pdfLoadingTask =
        null;

    state.renderingPage =
        false;

    state.renderedPages =
        new Map();

    state.pageRenderTasks =
        new Map();

    state.pageCache =
        new Map();

    state.renderScale =
        1;

    state.devicePixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    state.pdfReady =
        false;

    state.pdfError =
        null;


    /* =====================================================
       DOM REFERENCES
    ===================================================== */

    const pdfDOM = {

        reader:
            document.querySelector(
                ".reader"
            ),

        viewport:
            document.querySelector(
                ".reader-viewport"
            ),

        stage:
            document.querySelector(
                ".page-stage"
            ),

        pageContainer:
            document.querySelector(
                ".reader-page"
            ),

        loading:
            document.querySelector(
                "#readerPageLoading, .reader-page-loading"
            ),

        error:
            document.querySelector(
                "#readerPageError, .reader-page-error"
            ),

        canvas:
            document.querySelector(
                ".reader-page canvas"
            ),

        pageNumber:
            document.querySelector(
                ".current-page, .page-current"
            ),

        totalPages:
            document.querySelector(
                ".total-pages, .page-total"
            )

    };


    /* =====================================================
       PDF.JS DETECTION
    ===================================================== */

    function getPDFJS() {

        if (
            window.pdfjsLib
        ) {

            return window.pdfjsLib;

        }


        if (
            window["pdfjs-dist/build/pdf"]
        ) {

            return window[
                "pdfjs-dist/build/pdf"
            ];

        }


        return null;

    }


    function configurePDFJS() {

        const pdfjs =
            getPDFJS();


        if (!pdfjs) {

            console.warn(
                "PDF.js was not found."
            );

            return false;

        }


        /*
         * Worker path.
         *
         * If PDF.js is already configured by
         * the HTML, we do not overwrite it.
         */

        if (
            pdfjs.GlobalWorkerOptions &&
            !pdfjs.GlobalWorkerOptions.workerSrc
        ) {

            pdfjs.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

        }


        return true;

    }


    /* =====================================================
       NORMALIZE BOOK URL
    ===================================================== */

    function normalizeBookURL(
        source
    ) {

        if (!source) {

            return "";

        }


        if (
            typeof source ===
            "string"
        ) {

            return source.trim();

        }


        if (
            source.url
        ) {

            return String(
                source.url
            ).trim();

        }


        if (
            source.src
        ) {

            return String(
                source.src
            ).trim();

        }


        return "";

    }


    /* =====================================================
       RESOLVE CURRENT BOOK
    ===================================================== */

    function resolveBookURL(
        bookData = null
    ) {

        let url =
            normalizeBookURL(
                bookData
            );


        if (!url) {

            url =
                normalizeBookURL(
                    state.currentBookUrl
                );

        }


        /*
         * Support common data attributes.
         */

        if (!url) {

            const activeBook =
                document.querySelector(
                    "[data-book].active, [data-book][aria-selected='true']"
                );


            if (activeBook) {

                url =
                    activeBook.dataset.bookUrl ||
                    activeBook.dataset.url ||
                    activeBook.dataset.pdf ||
                    "";

            }

        }


        return url;

    }


    /* =====================================================
       SHOW PDF LOADING
    ===================================================== */

    function showPDFLoading(
        message =
            "Opening book..."
    ) {

        if (pdfDOM.loading) {

            pdfDOM.loading.classList.add(
                "active",
                "visible"
            );


            const text =
                pdfDOM.loading.querySelector(
                    "span, .loading-text"
                );


            if (text) {

                text.textContent =
                    message;

            }

        }


        pdfDOM.reader?.classList.add(
            "pdf-loading"
        );

    }


    /* =====================================================
       HIDE PDF LOADING
    ===================================================== */

    function hidePDFLoading() {

        pdfDOM.loading?.classList.remove(
            "active",
            "visible"
        );


        pdfDOM.reader?.classList.remove(
            "pdf-loading"
        );

    }


    /* =====================================================
       SHOW PDF ERROR
    ===================================================== */

    function showPDFError(
        message
    ) {

        state.pdfError =
            message;


        hidePDFLoading();


        if (pdfDOM.error) {

            pdfDOM.error.classList.add(
                "active",
                "visible"
            );


            const text =
                pdfDOM.error.querySelector(
                    "span, .error-text, p"
                );


            if (text) {

                text.textContent =
                    message;

            }

        }


        if (
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                message,
                "!"
            );

        }

    }


    /* =====================================================
       CLEAR PDF ERROR
    ===================================================== */

    function clearPDFError() {

        state.pdfError =
            null;


        pdfDOM.error?.classList.remove(
            "active",
            "visible"
        );

    }


    /* =====================================================
       CREATE PAGE CONTAINER
    ===================================================== */

    function createPageContainer(
        pageNumber
    ) {

        const container =
            document.createElement(
                "div"
            );


        container.className =
            "reader-page";


        container.dataset.page =
            String(pageNumber);


        container.setAttribute(
            "aria-label",
            `Page ${pageNumber}`
        );


        container.style.position =
            "relative";


        return container;

    }


    /* =====================================================
       GET / CREATE PAGE CONTAINER
    ===================================================== */

    function getPageContainer(
        pageNumber
    ) {

        if (!pdfDOM.stage) {

            return null;

        }


        let container =
            pdfDOM.stage.querySelector(
                `.reader-page[data-page="${pageNumber}"]`
            );


        if (container) {

            return container;

        }


        container =
            createPageContainer(
                pageNumber
            );


        pdfDOM.stage.appendChild(
            container
        );


        return container;

    }


    /* =====================================================
       CLEAR PAGE
    ===================================================== */

    function clearPage(
        pageNumber
    ) {

        const container =
            pdfDOM.stage?.querySelector(
                `.reader-page[data-page="${pageNumber}"]`
            );


        if (!container) {

            return;

        }


        container.replaceChildren();


        state.renderedPages.delete(
            pageNumber
        );

    }


    /* =====================================================
       CALCULATE PAGE SCALE
    ===================================================== */

    async function calculatePageScale(
        page
    ) {

        if (!page) {

            return 1;

        }


        const viewport =
            page.getViewport({
                scale: 1
            });


        const availableWidth =
            pdfDOM.viewport?.clientWidth ||
            window.innerWidth ||
            viewport.width;


        const horizontalPadding =
            window.innerWidth <= 700
                ? 18
                : 40;


        const usableWidth =
            Math.max(
                100,
                availableWidth -
                horizontalPadding
            );


        let scale =
            usableWidth /
            viewport.width;


        /*
         * User zoom.
         */

        scale *=
            Number(
                state.zoom || 1
            );


        /*
         * Prevent absurd values.
         */

        scale =
            Math.max(
                0.35,
                Math.min(
                    scale,
                    4
                )
            );


        return scale;

    }


    /* =====================================================
       RENDER SINGLE PAGE
    ===================================================== */

    async function renderPage(
        pageNumber,
        options = {}
    ) {

        if (
            !state.pdfDocument
        ) {

            return null;

        }


        if (
            pageNumber < 1 ||
            pageNumber >
            state.pdfDocument.numPages
        ) {

            return null;

        }


        /*
         * Avoid duplicate render tasks.
         */

        if (
            state.pageRenderTasks.has(
                pageNumber
            )
        ) {

            return state.pageRenderTasks.get(
                pageNumber
            );

        }


        const renderPromise =
            (async () => {

                try {

                    const page =
                        await state.pdfDocument.getPage(
                            pageNumber
                        );


                    const scale =
                        await calculatePageScale(
                            page
                        );


                    const viewport =
                        page.getViewport({
                            scale
                        });


                    const dpr =
                        state.devicePixelRatio;


                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    const context =
                        canvas.getContext(
                            "2d",
                            {
                                alpha: false
                            }
                        );


                    if (!context) {

                        throw new Error(
                            "Canvas is not supported."
                        );

                    }


                    canvas.width =
                        Math.ceil(
                            viewport.width *
                            dpr
                        );


                    canvas.height =
                        Math.ceil(
                            viewport.height *
                            dpr
                        );


                    canvas.style.width =
                        `${viewport.width}px`;


                    canvas.style.height =
                        `${viewport.height}px`;


                    canvas.className =
                        "pdf-page-canvas";


                    context.setTransform(
                        dpr,
                        0,
                        0,
                        dpr,
                        0,
                        0
                    );


                    const container =
                        getPageContainer(
                            pageNumber
                        );


                    if (!container) {

                        return null;

                    }


                    container.replaceChildren();


                    container.style.width =
                        `${viewport.width}px`;


                    container.style.minHeight =
                        `${viewport.height}px`;


                    container.appendChild(
                        canvas
                    );


                    /*
                     * Render page.
                     */

                    const task =
                        page.render({

                            canvasContext:
                                context,

                            viewport:

                                viewport

                        });


                    state.pageRenderTasks.set(
                        pageNumber,
                        task.promise
                    );


                    await task.promise;


                    state.renderedPages.set(
                        pageNumber,
                        true
                    );


                    state.pageCache.set(
                        pageNumber,
                        {

                            width:
                                viewport.width,

                            height:
                                viewport.height,

                            scale

                        }
                    );


                    container.classList.add(
                        "page-enter"
                    );


                    window.setTimeout(
                        () => {

                            container.classList.remove(
                                "page-enter"
                            );

                        },
                        450
                    );


                    return container;


                } catch (error) {

                    console.error(
                        `Could not render page ${pageNumber}:`,
                        error
                    );


                    return null;

                } finally {

                    state.pageRenderTasks.delete(
                        pageNumber
                    );

                }

            })();


        state.pageRenderTasks.set(
            pageNumber,
            renderPromise
        );


        return renderPromise;

    }


    /* =====================================================
       RENDER CURRENT PAGE
    ===================================================== */

    async function renderCurrentPage(
        options = {}
    ) {

        if (
            !state.pdfDocument
        ) {

            return;

        }


        state.renderingPage =
            true;


        showPDFLoading(
            "Rendering page..."
        );


        try {

            const page =
                await renderPage(
                    state.currentPage,
                    options
                );


            if (!page) {

                return;

            }


            /*
             * Remove other page containers
             * in single-page mode.
             */

            if (
                state.pageMode ===
                "single"
            ) {

                const pages =
                    pdfDOM.stage?.querySelectorAll(
                        ".reader-page"
                    );


                pages?.forEach(
                    element => {

                        const number =
                            Number(
                                element.dataset.page
                            );


                        if (
                            number !==
                            state.currentPage
                        ) {

                            element.remove();

                        }

                    }
                );

            }


            updatePDFPageUI();


        } finally {

            state.renderingPage =
                false;

            hidePDFLoading();

        }

    }


    /* =====================================================
       RENDER NEIGHBOR PAGES
    ===================================================== */

    async function preloadNearbyPages() {

        if (
            !state.pdfDocument
        ) {

            return;

        }


        const pages = [

            state.currentPage - 1,

            state.currentPage + 1

        ];


        for (
            const pageNumber of pages
        ) {

            if (
                pageNumber < 1 ||
                pageNumber >
                state.pdfDocument.numPages
            ) {

                continue;

            }


            if (
                state.renderedPages.has(
                    pageNumber
                )
            ) {

                continue;

            }


            /*
             * Small delay prevents the
             * current page from feeling slow.
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        30
                    )
            );


            await renderPage(
                pageNumber
            );

        }

    }


    /* =====================================================
       LOAD PDF DOCUMENT
    ===================================================== */

    async function loadPDF(
        bookData = null
    ) {

        const pdfjs =
            getPDFJS();


        if (!pdfjs) {

            showPDFError(
                "PDF reader engine is unavailable."
            );

            return false;

        }


        const url =
            resolveBookURL(
                bookData
            );


        if (!url) {

            showPDFError(
                "Book file was not found."
            );

            return false;

        }


        clearPDFError();


        showPDFLoading(
            "Opening book..."
        );


        state.pdfReady =
            false;


        state.pdfError =
            null;


        state.renderedPages.clear();

        state.pageRenderTasks.clear();

        state.pageCache.clear();


        try {

            /*
             * Destroy previous document.
             */

            if (
                state.pdfDocument
            ) {

                try {

                    await state.pdfDocument.destroy();

                } catch (_) {}

            }


            if (
                state.pdfLoadingTask
            ) {

                try {

                    await state.pdfLoadingTask.destroy();

                } catch (_) {}

            }


            /*
             * Start PDF.js loading.
             */

            state.pdfLoadingTask =
                pdfjs.getDocument({
                    url,
                    verbosity: 0
                });


            /*
             * Progress.
             */

            state.pdfLoadingTask.onProgress =
                progress => {

                    if (
                        progress &&
                        progress.total
                    ) {

                        const percent =
                            (
                                progress.loaded /
                                progress.total
                            ) * 100;


                        showPDFLoading(
                            `Loading book ${Math.round(
                                percent
                            )}%`
                        );

                    }

                };


            state.pdfDocument =
                await state.pdfLoadingTask.promise;


            state.pdfReady =
                true;


            state.totalPages =
                state.pdfDocument.numPages;


            /*
             * Restore saved page.
             */

            restoreReadingPosition();


            if (
                state.currentPage >
                state.totalPages
            ) {

                state.currentPage =
                    1;

            }


            updatePDFPageUI();


            await renderCurrentPage();


            /*
             * Preload adjacent pages
             * after current page is visible.
             */

            preloadNearbyPages();


            hidePDFLoading();


            return true;


        } catch (error) {

            console.error(
                "PDF loading error:",
                error
            );


            state.pdfReady =
                false;


            state.pdfDocument =
                null;


            let message =
                "Unable to open this book.";


            if (
                error?.name ===
                "InvalidPDFException"
            ) {

                message =
                    "This PDF file is invalid or damaged.";

            }


            if (
                error?.name ===
                "MissingPDFException"
            ) {

                message =
                    "The book file could not be found.";

            }


            if (
                error?.name ===
                "UnexpectedResponseException"
            ) {

                message =
                    "The book could not be loaded.";

            }


            showPDFError(
                message
            );


            return false;

        }

    }


    /* =====================================================
       UPDATE PAGE UI
    ===================================================== */

    function updatePDFPageUI() {

        const current =
            state.currentPage;

        const total =
            state.totalPages;


        const currentElements =
            document.querySelectorAll(
                ".current-page, .page-current, [data-current-page]"
            );


        currentElements.forEach(
            element => {

                if (
                    element.matches(
                        "input"
                    )
                ) {

                    element.value =
                        current;

                } else {

                    element.textContent =
                        current;

                }

            }
        );


        const totalElements =
            document.querySelectorAll(
                ".total-pages, .page-total, [data-total-pages]"
            );


        totalElements.forEach(
            element => {

                element.textContent =
                    total;

            }
        );


        /*
         * Update progress.
         */

        const progress =
            total > 0
                ? (
                    current /
                    total
                ) * 100
                : 0;


        const fills =
            document.querySelectorAll(
                ".reader-progress-fill, .progress-fill"
            );


        fills.forEach(
            fill => {

                fill.style.width =
                    `${progress}%`;

            }
        );


        /*
         * Previous button.
         */

        const previous =
            document.querySelectorAll(
                "[data-action='previous-page']"
            );


        previous.forEach(
            button => {

                button.disabled =
                    current <= 1;

            }
        );


        /*
         * Next button.
         */

        const next =
            document.querySelectorAll(
                "[data-action='next-page']"
            );


        next.forEach(
            button => {

                button.disabled =
                    total > 0 &&
                    current >= total;

            }
        );

    }


    /* =====================================================
       OPEN BOOK -> LOAD PDF
       Extends Part 1 openBook()
    ===================================================== */

    const originalOpenBook =
        R.openBook;


    R.openBook =
        async function(
            bookData = null
        ) {

            /*
             * Run Part 1 opening animation.
             */

            originalOpenBook?.(
                bookData
            );


            /*
             * Wait until book-opening
             * animation reaches reader.
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        1050
                    )
            );


            /*
             * Load actual PDF.
             */

            const success =
                await loadPDF(
                    bookData
                );


            if (!success) {

                return false;

            }


            return true;

        };


    window.ChishtiReader =
        R;


    /* =====================================================
       EXTEND PAGE NAVIGATION
    ===================================================== */

    const originalNextPage =
        R.nextPage;


    R.nextPage =
        async function() {

            if (
                !state.pdfDocument
            ) {

                originalNextPage?.();

                return;

            }


            if (
                state.currentPage >=
                state.totalPages
            ) {

                if (
                    typeof R.showToast ===
                    "function"
                ) {

                    R.showToast(
                        "You are on the last page.",
                        "→"
                    );

                }

                return;

            }


            state.currentPage +=
                1;


            await renderCurrentPage();


            preloadNearbyPages();


            if (
                typeof R.showToast ===
                "function"
            ) {

                R.showToast(
                    `Page ${state.currentPage}`,
                    "›"
                );

            }


            if (
                typeof R.state !==
                "undefined"
            ) {

                R.state.currentPage =
                    state.currentPage;

            }

        };


    /* =====================================================
       EXTEND PREVIOUS PAGE
    ===================================================== */

    const originalPreviousPage =
        R.previousPage;


    R.previousPage =
        async function() {

            if (
                !state.pdfDocument
            ) {

                originalPreviousPage?.();

                return;

            }


            if (
                state.currentPage <=
                1
            ) {

                if (
                    typeof R.showToast ===
                    "function"
                ) {

                    R.showToast(
                        "You are on the first page.",
                        "←"
                    );

                }

                return;

            }


            state.currentPage -=
                1;


            await renderCurrentPage();


            preloadNearbyPages();


            if (
                typeof R.showToast ===
                "function"
            ) {

                R.showToast(
                    `Page ${state.currentPage}`,
                    "‹"
                );

            }


            R.state.currentPage =
                state.currentPage;

        };


    /* =====================================================
       EXTEND ZOOM
    ===================================================== */

    const originalSetZoom =
        R.setZoom;


    R.setZoom =
        async function(
            value
        ) {

            originalSetZoom?.(
                value
            );


            state.zoom =
                Math.max(
                    state.minZoom,
                    Math.min(
                        state.maxZoom,
                        Number(value) || 1
                    )
                );


            if (
                state.pdfDocument &&
                state.isReaderOpen
            ) {

                await renderCurrentPage();

            }

        };


    /* =====================================================
       EXTEND FIT MODE
    ===================================================== */

    const originalSetFitMode =
        R.state;


    /*
     * Fit mode is handled here when
     * PDF is already available.
     */

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action='fit-width'], [data-action='fit-page']"
                );


            if (!button) return;


            if (
                !state.pdfDocument
            ) {

                return;

            }


            state.fitMode =
                button.dataset.action ===
                "fit-page"
                    ? "page"
                    : "width";


            state.zoom =
                1;


            renderCurrentPage();

        }
    );


    /* =====================================================
       PDF ENGINE INITIALIZATION
    ===================================================== */

    function initializePDFEngine() {

        const ready =
            configurePDFJS();


        if (!ready) {

            console.warn(
                "PDF.js configuration skipped."
            );

            return;

        }


        console.log(
            "PDF.js engine ready."
        );

    }


    /* =====================================================
       PUBLIC PDF API
    ===================================================== */

    R.loadPDF =
        loadPDF;


    R.renderPage =
        renderPage;


    R.renderCurrentPage =
        renderCurrentPage;


    R.preloadNearbyPages =
        preloadNearbyPages;


    R.updatePDFPageUI =
        updatePDFPageUI;


    R.getPDFDocument =
        () =>
            state.pdfDocument;


    R.isPDFReady =
        () =>
            Boolean(
                state.pdfReady
            );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePDFEngine,
            {
                once: true
            }
        );

    } else {

        initializePDFEngine();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 3 / 14
   PAGE NAVIGATION + KEYBOARD + MOBILE SWIPE +
   PAGE INPUT + SCROLL + READER CONTROLS
========================================================= */

(() => {

    "use strict";


    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error(
            "ChishtiReader core missing."
        );
        return;
    }


    const state = R.state;


    /* =====================================================
       NAVIGATION STATE
    ===================================================== */

    state.navigationBusy = false;

    state.lastNavigationTime = 0;

    state.navigationCooldown = 120;

    state.wheelAccumulator = 0;

    state.wheelTimer = null;

    state.scrollNavigation = true;

    state.swipeNavigation = true;

    state.keyboardNavigation = true;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getViewport = () =>
        document.querySelector(
            ".reader-viewport"
        );


    const getStage = () =>
        document.querySelector(
            ".page-stage"
        );


    const getPageInput = () =>
        document.querySelector(
            ".page-counter input, .page-input, [data-page-input]"
        );


    const getPageCurrentElements = () =>
        document.querySelectorAll(
            ".current-page, .page-current, [data-current-page]"
        );


    const getPageTotalElements = () =>
        document.querySelectorAll(
            ".total-pages, .page-total, [data-total-pages]"
        );


    /* =====================================================
       PAGE NUMBER UI
    ===================================================== */

    function syncPageNumberUI() {

        const current =
            Number(
                state.currentPage || 1
            );


        const total =
            Number(
                state.totalPages || 0
            );


        getPageCurrentElements()
            .forEach(element => {

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

            });


        getPageTotalElements()
            .forEach(element => {

                element.textContent =
                    total;

            });


        const input =
            getPageInput();


        if (input) {

            input.value =
                current;

            input.setAttribute(
                "min",
                "1"
            );


            if (total > 0) {

                input.setAttribute(
                    "max",
                    String(total)
                );

            }

        }

    }


    /* =====================================================
       PAGE CLAMP
    ===================================================== */

    function clampPage(
        page
    ) {

        let value =
            Number(
                page
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            value = 1;

        }


        value =
            Math.round(
                value
            );


        value =
            Math.max(
                1,
                value
            );


        if (
            state.totalPages > 0
        ) {

            value =
                Math.min(
                    state.totalPages,
                    value
                );

        }


        return value;

    }


    /* =====================================================
       GO TO PAGE
    ===================================================== */

    async function goToPage(
        page,
        options = {}
    ) {

        const target =
            clampPage(
                page
            );


        if (
            state.pdfDocument &&
            target >
            state.pdfDocument.numPages
        ) {

            return false;

        }


        if (
            target ===
            state.currentPage &&
            !options.force
        ) {

            syncPageNumberUI();

            return true;

        }


        state.currentPage =
            target;


        syncPageNumberUI();


        /*
         * If PDF engine exists,
         * render actual target page.
         */

        if (
            state.pdfDocument &&
            typeof R.renderCurrentPage ===
            "function"
        ) {

            try {

                await R.renderCurrentPage();

            } catch (error) {

                console.error(
                    "Page render failed:",
                    error
                );

            }


            if (
                typeof R.preloadNearbyPages ===
                "function"
            ) {

                R.preloadNearbyPages();

            }

        }


        /*
         * Save position.
         */

        try {

            localStorage.setItem(
                "chishtilib_last_page",
                String(
                    state.currentPage
                )
            );

        } catch (_) {}


        /*
         * Update reading progress.
         */

        updateReadingProgress();


        /*
         * Optional notification.
         */

        if (
            options.notify &&
            typeof R.showToast ===
            "function"
        ) {

            R.showToast(
                `Page ${state.currentPage}`,
                "•"
            );

        }


        return true;

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    async function navigateNext(
        options = {}
    ) {

        if (
            state.navigationBusy
        ) {

            return;

        }


        const now =
            Date.now();


        if (
            now -
            state.lastNavigationTime <
            state.navigationCooldown
        ) {

            return;

        }


        state.lastNavigationTime =
            now;


        if (
            state.totalPages > 0 &&
            state.currentPage >=
            state.totalPages
        ) {

            if (
                options.notify !== false &&
                typeof R.showToast ===
                "function"
            ) {

                R.showToast(
                    "Last page",
                    "→"
                );

            }

            return;

        }


        state.navigationBusy =
            true;


        try {

            await goToPage(
                state.currentPage + 1,
                {
                    notify:
                        options.notify !== false
                }
            );

        } finally {

            state.navigationBusy =
                false;

        }

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    async function navigatePrevious(
        options = {}
    ) {

        if (
            state.navigationBusy
        ) {

            return;

        }


        const now =
            Date.now();


        if (
            now -
            state.lastNavigationTime <
            state.navigationCooldown
        ) {

            return;

        }


        state.lastNavigationTime =
            now;


        if (
            state.currentPage <= 1
        ) {

            if (
                options.notify !== false &&
                typeof R.showToast ===
                "function"
            ) {

                R.showToast(
                    "First page",
                    "←"
                );

            }

            return;

        }


        state.navigationBusy =
            true;


        try {

            await goToPage(
                state.currentPage - 1,
                {
                    notify:
                        options.notify !== false
                }
            );

        } finally {

            state.navigationBusy =
                false;

        }

    }


    /* =====================================================
       FIRST PAGE
    ===================================================== */

    async function goToFirstPage() {

        await goToPage(
            1,
            {
                notify: true
            }
        );

    }


    /* =====================================================
       LAST PAGE
    ===================================================== */

    async function goToLastPage() {

        if (
            state.totalPages <= 0
        ) {

            return;

        }


        await goToPage(
            state.totalPages,
            {
                notify: true
            }
        );

    }


    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function submitPageInput(
        value
    ) {

        const input =
            getPageInput();


        let page =
            Number(
                value ??
                input?.value
            );


        if (
            !Number.isFinite(
                page
            )
        ) {

            syncPageNumberUI();

            return;

        }


        page =
            clampPage(
                page
            );


        goToPage(
            page,
            {
                notify: true
            }
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


        if (
            input.dataset.navigationBound ===
            "true"
        ) {

            return;

        }


        input.dataset.navigationBound =
            "true";


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    submitPageInput(
                        input.value
                    );

                    input.blur();

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    syncPageNumberUI();

                    input.blur();

                }

            }
        );


        input.addEventListener(
            "blur",
            () => {

                submitPageInput(
                    input.value
                );

            }
        );


        input.addEventListener(
            "focus",
            () => {

                input.select();

            }
        );

    }


    /* =====================================================
       KEYBOARD NAVIGATION
    ===================================================== */

    function isTypingTarget(
        element
    ) {

        if (!element) {

            return false;

        }


        const tag =
            element.tagName;


        return (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            element.isContentEditable
        );

    }


    async function handleKeyboard(
        event
    ) {

        if (
            !state.keyboardNavigation
        ) {

            return;

        }


        if (
            isTypingTarget(
                event.target
            )
        ) {

            return;

        }


        const key =
            event.key;


        switch (key) {

            case "ArrowRight":

            case "PageDown":

            case " ":

                event.preventDefault();

                await navigateNext();

                break;


            case "ArrowLeft":

            case "PageUp":

                event.preventDefault();

                await navigatePrevious();

                break;


            case "Home":

                event.preventDefault();

                await goToFirstPage();

                break;


            case "End":

                event.preventDefault();

                await goToLastPage();

                break;


            case "Escape":

                /*
                 * Part 1 escape handling
                 * remains active.
                 */

                break;


            case "+":

            case "=":

                if (
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    return;

                }


                event.preventDefault();

                if (
                    typeof R.zoomIn ===
                    "function"
                ) {

                    R.zoomIn();

                }

                break;


            case "-":

            case "_":

                if (
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    return;

                }


                event.preventDefault();

                if (
                    typeof R.zoomOut ===
                    "function"
                ) {

                    R.zoomOut();

                }

                break;


            case "0":

                if (
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    return;

                }


                event.preventDefault();

                if (
                    typeof R.resetZoom ===
                    "function"
                ) {

                    R.resetZoom();

                }

                break;

        }

    }


    /* =====================================================
       MOBILE SWIPE
    ===================================================== */

    let touchStartX = 0;

    let touchStartY = 0;

    let touchStartTime = 0;


    function onTouchStart(
        event
    ) {

        if (
            !state.swipeNavigation
        ) {

            return;

        }


        const touch =
            event.changedTouches?.[0];


        if (!touch) {

            return;

        }


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;


        touchStartTime =
            Date.now();

    }


    async function onTouchEnd(
        event
    ) {

        if (
            !state.swipeNavigation
        ) {

            return;

        }


        const touch =
            event.changedTouches?.[0];


        if (!touch) {

            return;

        }


        const endX =
            touch.clientX;


        const endY =
            touch.clientY;


        const deltaX =
            endX -
            touchStartX;


        const deltaY =
            endY -
            touchStartY;


        const elapsed =
            Date.now() -
            touchStartTime;


        const distance =
            Math.sqrt(
                deltaX * deltaX +
                deltaY * deltaY
            );


        /*
         * Ignore tiny movements.
         */

        if (
            distance < 55
        ) {

            return;

        }


        /*
         * Ignore slow accidental drags.
         */

        if (
            elapsed > 900
        ) {

            return;

        }


        /*
         * Horizontal swipe only.
         */

        if (
            Math.abs(deltaX) <=
            Math.abs(deltaY) * 1.15
        ) {

            return;

        }


        if (
            deltaX < 0
        ) {

            await navigateNext();

        } else {

            await navigatePrevious();

        }

    }


    /* =====================================================
       DOUBLE TAP
    ===================================================== */

    let lastTapTime = 0;

    let lastTapX = 0;

    let lastTapY = 0;


    function handleDoubleTap(
        event
    ) {

        const now =
            Date.now();


        const touch =
            event.changedTouches?.[0];


        if (!touch) {

            return;

        }


        const x =
            touch.clientX;


        const y =
            touch.clientY;


        const timeDifference =
            now -
            lastTapTime;


        const distance =
            Math.sqrt(
                Math.pow(
                    x -
                    lastTapX,
                    2
                ) +
                Math.pow(
                    y -
                    lastTapY,
                    2
                )
            );


        if (
            timeDifference < 320 &&
            distance < 45
        ) {

            /*
             * Double tap toggles between
             * normal and readable mobile zoom.
             */

            const targetZoom =
                state.zoom > 1.05
                    ? 1
                    : 1.35;


            if (
                typeof R.setZoom ===
                "function"
            ) {

                R.setZoom(
                    targetZoom
                );

            }

        }


        lastTapTime =
            now;


        lastTapX =
            x;


        lastTapY =
            y;

    }


    /* =====================================================
       WHEEL NAVIGATION
    ===================================================== */

    function handleWheel(
        event
    ) {

        if (
            !state.isReaderOpen
        ) {

            return;

        }


        /*
         * Do not hijack normal page scrolling
         * when zoomed.
         */

        if (
            state.zoom > 1.05
        ) {

            return;

        }


        if (
            Math.abs(
                event.deltaY
            ) <
            10
        ) {

            return;

        }


        state.wheelAccumulator +=
            event.deltaY;


        clearTimeout(
            state.wheelTimer
        );


        state.wheelTimer =
            setTimeout(
                () => {

                    state.wheelAccumulator =
                        0;

                },
                250
            );


        if (
            Math.abs(
                state.wheelAccumulator
            ) < 90
        ) {

            return;

        }


        const direction =
            state.wheelAccumulator > 0
                ? 1
                : -1;


        state.wheelAccumulator =
            0;


        if (
            direction > 0
        ) {

            navigateNext({
                notify: false
            });

        } else {

            navigatePrevious({
                notify: false
            });

        }

    }


    /* =====================================================
       TRACKPAD / HORIZONTAL WHEEL
    ===================================================== */

    function handleHorizontalWheel(
        event
    ) {

        if (
            !state.isReaderOpen
        ) {

            return;

        }


        if (
            Math.abs(
                event.deltaX
            ) <
            Math.abs(
                event.deltaY
            )
        ) {

            return;

        }


        if (
            Math.abs(
                event.deltaX
            ) < 35
        ) {

            return;

        }


        if (
            event.deltaX > 0
        ) {

            navigateNext({
                notify: false
            });

        } else {

            navigatePrevious({
                notify: false
            });

        }

    }


    /* =====================================================
       SCROLL POSITION
    ===================================================== */

    function keepPageCentered() {

        const viewport =
            getViewport();


        const stage =
            getStage();


        if (
            !viewport ||
            !stage
        ) {

            return;

        }


        /*
         * When page is smaller than viewport,
         * keep it visually centered.
         */

        const page =
            stage.querySelector(
                ".reader-page"
            );


        if (!page) {

            return;

        }


        const viewportWidth =
            viewport.clientWidth;


        const pageWidth =
            page.getBoundingClientRect().width;


        if (
            pageWidth <
            viewportWidth
        ) {

            stage.style.justifyContent =
                "center";

        } else {

            stage.style.justifyContent =
                "flex-start";

        }

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


        const progressElements =
            document.querySelectorAll(
                "[data-reading-progress], .reading-progress-value"
            );


        progressElements.forEach(
            element => {

                if (
                    element.matches(
                        "input"
                    )
                ) {

                    element.value =
                        state.readingProgress;

                } else {

                    element.textContent =
                        `${state.readingProgress}%`;

                }

            }
        );


        const progressBars =
            document.querySelectorAll(
                ".reading-progress-fill, .reader-progress-fill"
            );


        progressBars.forEach(
            element => {

                element.style.width =
                    `${state.readingProgress}%`;

            }
        );

    }


    /* =====================================================
       RESTORE READING POSITION
    ===================================================== */

    function restoreSavedPage() {

        if (
            !state.rememberPosition
        ) {

            return;

        }


        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_last_page"
                );


            if (!saved) {

                return;

            }


            const page =
                Number(
                    saved
                );


            if (
                Number.isFinite(
                    page
                )
            ) {

                state.currentPage =
                    clampPage(
                        page
                    );

            }

        } catch (error) {

            console.warn(
                "Could not restore page position.",
                error
            );

        }

    }


    /*
     * PDF Part 2 may call its own restore
     * function. This function is intentionally
     * public so later parts can reuse it.
     */

    R.restoreSavedPage =
        restoreSavedPage;


    /*
     * Alias for compatibility.
     */

    window.restoreReadingPosition =
        restoreSavedPage;


    /* =====================================================
       PAGE TURN ANIMATION
    ===================================================== */

    function animatePageTurn(
        direction
    ) {

        const stage =
            getStage();


        if (!stage) {

            return;

        }


        stage.classList.remove(
            "page-turn-next",
            "page-turn-prev"
        );


        /*
         * Force reflow so the same animation
         * can run repeatedly.
         */

        void stage.offsetWidth;


        stage.classList.add(
            direction === "next"
                ? "page-turn-next"
                : "page-turn-prev"
        );


        window.setTimeout(
            () => {

                stage.classList.remove(
                    "page-turn-next",
                    "page-turn-prev"
                );

            },
            380
        );

    }


    /* =====================================================
       ENHANCE NAVIGATION WITH ANIMATION
    ===================================================== */

    const baseNext =
        R.nextPage;


    const basePrevious =
        R.previousPage;


    R.nextPage =
        async function() {

            animatePageTurn(
                "next"
            );


            return baseNext?.();

        };


    R.previousPage =
        async function() {

            animatePageTurn(
                "previous"
            );


            return basePrevious?.();

        };


    /* =====================================================
       NAVIGATION BUTTONS
    ===================================================== */

    function bindNavigationButtons() {

        const nextButtons =
            document.querySelectorAll(
                "[data-action='next-page'], .next-page-btn, .page-next"
            );


        const previousButtons =
            document.querySelectorAll(
                "[data-action='previous-page'], .previous-page-btn, .page-prev"
            );


        nextButtons.forEach(
            button => {

                if (
                    button.dataset.navBound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.navBound =
                    "true";


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        R.nextPage();

                    }
                );

            }
        );


        previousButtons.forEach(
            button => {

                if (
                    button.dataset.navBound ===
                    "true"
                ) {

                    return;

                }


                button.dataset.navBound =
                    "true";


                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        R.previousPage();

                    }
                );

            }
        );

    }


    /* =====================================================
       UPDATE AFTER PAGE RENDER
    ===================================================== */

    function afterPageRender() {

        syncPageNumberUI();

        updateReadingProgress();

        keepPageCentered();

        bindPageInput();

        bindNavigationButtons();

    }


    /* =====================================================
       GLOBAL EVENT REGISTRATION
    ===================================================== */

    function initializeNavigation() {

        document.addEventListener(
            "keydown",
            handleKeyboard
        );


        const viewport =
            getViewport();


        if (viewport) {

            viewport.addEventListener(
                "touchstart",
                onTouchStart,
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "touchend",
                event => {

                    onTouchEnd(
                        event
                    );

                    handleDoubleTap(
                        event
                    );

                },
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "wheel",
                handleWheel,
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "wheel",
                handleHorizontalWheel,
                {
                    passive: true
                }
            );

        }


        window.addEventListener(
            "resize",
            () => {

                window.requestAnimationFrame(
                    () => {

                        keepPageCentered();

                        syncPageNumberUI();

                    }
                );

            }
        );


        bindNavigationButtons();

        bindPageInput();

        syncPageNumberUI();

        updateReadingProgress();

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.goToPage =
        goToPage;


    R.goToFirstPage =
        goToFirstPage;


    R.goToLastPage =
        goToLastPage;


    R.navigateNext =
        navigateNext;


    R.navigatePrevious =
        navigatePrevious;


    R.updateReadingProgress =
        updateReadingProgress;


    R.syncPageNumberUI =
        syncPageNumberUI;


    R.keepPageCentered =
        keepPageCentered;


    R.afterPageRender =
        afterPageRender;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavigation,
            {
                once: true
            }
        );

    } else {

        initializeNavigation();

    }


    console.log(
        "Chishti Reader navigation system loaded — Part 3/14."
    );


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 4 / 14
   READER CONTROLS + AUTO HIDE + FULLSCREEN +
   FOCUS MODE + MOBILE CONTROL VISIBILITY
========================================================= */

(() => {

    "use strict";


    const R = window.ChishtiReader;

    if (!R || !R.state) {

        console.error(
            "ChishtiReader core is missing."
        );

        return;

    }


    const state =
        R.state;


    /* =====================================================
       CONTROL STATE
    ===================================================== */

    state.controlsLocked =
        false;

    state.controlsHover =
        false;

    state.lastInteraction =
        Date.now();

    state.autoHideDelay =
        4200;

    state.mobileControlsDelay =
        3500;

    state.controlsTimer =
        null;

    state.fullscreenSupported =
        Boolean(
            document.fullscreenEnabled
        );

    state.fullscreenActive =
        Boolean(
            document.fullscreenElement
        );


    /* =====================================================
       DOM REFERENCES
    ===================================================== */

    const getReader =
        () =>
            document.querySelector(
                ".reader"
            );


    const getTopbar =
        () =>
            document.querySelector(
                ".reader-topbar, .reader-header, .topbar"
            );


    const getBottomBar =
        () =>
            document.querySelector(
                ".reader-bottombar, .reader-footer, .bottombar"
            );


    const getViewport =
        () =>
            document.querySelector(
                ".reader-viewport"
            );


    const getControls =
        () =>
            document.querySelectorAll(
                ".reader-topbar, .reader-bottombar, .reader-controls"
            );


    const getOverlay =
        () =>
            document.querySelector(
                ".reader-overlay"
            );


    const getFullscreenButtons =
        () =>
            document.querySelectorAll(
                "[data-action='fullscreen'], .fullscreen-btn"
            );


    /* =====================================================
       CONTROL VISIBILITY
    ===================================================== */

    function controlsShow(
        temporary = false
    ) {

        if (
            state.controlsLocked &&
            !temporary
        ) {

            return;

        }


        const reader =
            getReader();


        if (!reader) {

            return;

        }


        state.controlsVisible =
            true;


        state.lastInteraction =
            Date.now();


        reader.classList.remove(
            "controls-hidden"
        );


        reader.classList.add(
            "controls-visible"
        );


        getControls()
            .forEach(
                element => {

                    element.classList.remove(
                        "hidden",
                        "is-hidden"
                    );

                    element.classList.add(
                        "visible",
                        "is-visible"
                    );

                    element.setAttribute(
                        "aria-hidden",
                        "false"
                    );

                }
            );


        scheduleAutoHide();

    }


    function controlsHide() {

        if (
            state.controlsLocked
        ) {

            return;

        }


        if (
            !state.isReaderOpen
        ) {

            return;

        }


        if (
            state.activePanel
        ) {

            return;

        }


        const reader =
            getReader();


        if (!reader) {

            return;

        }


        state.controlsVisible =
            false;


        reader.classList.remove(
            "controls-visible"
        );


        reader.classList.add(
            "controls-hidden"
        );


        getControls()
            .forEach(
                element => {

                    element.classList.remove(
                        "visible",
                        "is-visible"
                    );

                    element.classList.add(
                        "hidden",
                        "is-hidden"
                    );

                    element.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }
            );

    }


    /* =====================================================
       AUTO HIDE TIMER
    ===================================================== */

    function scheduleAutoHide() {

        clearTimeout(
            state.controlsTimer
        );


        if (
            state.controlsLocked
        ) {

            return;

        }


        if (
            state.focusMode
        ) {

            return;

        }


        if (
            !state.isReaderOpen
        ) {

            return;

        }


        const delay =
            window.innerWidth <= 700
                ? state.mobileControlsDelay
                : state.autoHideDelay;


        state.controlsTimer =
            window.setTimeout(
                () => {

                    if (
                        !state.controlsHover
                    ) {

                        controlsHide();

                    }

                },
                delay
            );

    }


    /* =====================================================
       USER INTERACTION
    ===================================================== */

    function registerInteraction(
        temporary = false
    ) {

        state.lastInteraction =
            Date.now();


        controlsShow(
            temporary
        );

    }


    /* =====================================================
       MOUSE / POINTER MOVEMENT
    ===================================================== */

    function handlePointerMove(
        event
    ) {

        if (
            !state.isReaderOpen
        ) {

            return;

        }


        const target =
            event.target;


        /*
         * Keep controls visible when
         * pointer is over the top/bottom bars.
         */

        if (
            target.closest(
                ".reader-topbar, .reader-bottombar, .reader-controls"
            )
        ) {

            state.controlsHover =
                true;


            controlsShow(
                true
            );


            return;

        }


        state.controlsHover =
            false;


        registerInteraction();

    }


    function handlePointerLeave() {

        state.controlsHover =
            false;


        scheduleAutoHide();

    }


    /* =====================================================
       MOBILE TAP
    ===================================================== */

    let lastReaderTap =
        0;


    function handleReaderTap(
        event
    ) {

        if (
            !state.isReaderOpen
        ) {

            return;

        }


        /*
         * Ignore clicks on buttons,
         * links and inputs.
         */

        if (
            event.target.closest(
                "button, a, input, select, textarea, [role='button']"
            )
        ) {

            return;

        }


        const now =
            Date.now();


        /*
         * Double tap is handled by Part 3.
         * Here we only toggle controls
         * on a normal single tap.
         */

        if (
            now -
            lastReaderTap <
            320
        ) {

            lastReaderTap =
                now;

            return;

        }


        lastReaderTap =
            now;


        if (
            state.controlsVisible
        ) {

            controlsHide();

        } else {

            controlsShow();

        }

    }


    /* =====================================================
       LOCK CONTROLS
    ===================================================== */

    function lockControls() {

        state.controlsLocked =
            true;


        clearTimeout(
            state.controlsTimer
        );


        controlsShow();

    }


    function unlockControls() {

        state.controlsLocked =
            false;


        scheduleAutoHide();

    }


    function toggleControlsLock() {

        if (
            state.controlsLocked
        ) {

            unlockControls();

        } else {

            lockControls();

        }

    }


    /* =====================================================
       FOCUS MODE
    ===================================================== */

    function enableFocusMode() {

        state.focusMode =
            true;


        const reader =
            getReader();


        reader?.classList.add(
            "focus-mode"
        );


        reader?.setAttribute(
            "data-focus-mode",
            "true"
        );


        /*
         * Close panels while entering
         * distraction-free reading.
         */

        if (
            typeof R.closeAllPanels ===
            "function"
        ) {

            R.closeAllPanels();

        }


        controlsHide();


        updateFocusButtons();

    }


    function disableFocusMode() {

        state.focusMode =
            false;


        const reader =
            getReader();


        reader?.classList.remove(
            "focus-mode"
        );


        reader?.setAttribute(
            "data-focus-mode",
            "false"
        );


        controlsShow();


        updateFocusButtons();

    }


    function toggleFocusMode() {

        if (
            state.focusMode
        ) {

            disableFocusMode();

        } else {

            enableFocusMode();

        }

    }


    function updateFocusButtons() {

        const buttons =
            document.querySelectorAll(
                "[data-action='toggle-focus'], .focus-mode-btn"
            );


        buttons.forEach(
            button => {

                const active =
                    state.focusMode;


                button.classList.toggle(
                    "active",
                    active
                );


                button.setAttribute(
                    "aria-pressed",
                    String(
                        active
                    )
                );


                const label =
                    button.querySelector(
                        ".tool-label, .btn-label"
                    );


                if (label) {

                    label.textContent =
                        active
                            ? "Exit focus"
                            : "Focus mode";

                }

            }
        );

    }


    /* =====================================================
       FULLSCREEN
    ===================================================== */

    async function enterFullscreen() {

        const reader =
            getReader();


        if (!reader) {

            return false;

        }


        if (
            !document.fullscreenEnabled
        ) {

            /*
             * Fallback class for browsers
             * that don't expose fullscreen API.
             */

            reader.classList.add(
                "pseudo-fullscreen"
            );


            state.fullscreenActive =
                true;


            updateFullscreenUI();

            return true;

        }


        try {

            if (
                !document.fullscreenElement
            ) {

                await reader.requestFullscreen();

            }


            state.fullscreenActive =
                true;


            reader.classList.add(
                "fullscreen-active"
            );


            updateFullscreenUI();


            controlsShow();


            return true;

        } catch (error) {

            console.warn(
                "Could not enter fullscreen:",
                error
            );


            return false;

        }

    }


    async function exitFullscreen() {

        const reader =
            getReader();


        if (
            document.fullscreenElement
        ) {

            try {

                await document.exitFullscreen();

            } catch (error) {

                console.warn(
                    "Could not exit fullscreen:",
                    error
                );

            }

        }


        reader?.classList.remove(
            "fullscreen-active",
            "pseudo-fullscreen"
        );


        state.fullscreenActive =
            false;


        updateFullscreenUI();

        controlsShow();

    }


    async function toggleFullscreen() {

        if (
            state.fullscreenActive ||
            document.fullscreenElement
        ) {

            await exitFullscreen();

        } else {

            await enterFullscreen();

        }

    }


    function updateFullscreenUI() {

        const active =
            Boolean(
                document.fullscreenElement
            ) ||
            state.fullscreenActive;


        getFullscreenButtons()
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        active
                    );


                    button.setAttribute(
                        "aria-pressed",
                        String(
                            active
                        )
                    );


                    const icon =
                        button.querySelector(
                            "i, .icon"
                        );


                    if (
                        icon
                    ) {

                        icon.classList.toggle(
                            "is-fullscreen",
                            active
                        );

                    }


                    const label =
                        button.querySelector(
                            ".btn-label, .tool-label"
                        );


                    if (
                        label
                    ) {

                        label.textContent =
                            active
                                ? "Exit fullscreen"
                                : "Fullscreen";

                    }

                }
            );

    }


    /* =====================================================
       BROWSER FULLSCREEN EVENT
    ===================================================== */

    function handleFullscreenChange() {

        const active =
            Boolean(
                document.fullscreenElement
            );


        state.fullscreenActive =
            active;


        const reader =
            getReader();


        reader?.classList.toggle(
            "fullscreen-active",
            active
        );


        updateFullscreenUI();


        if (
            active
        ) {

            controlsShow();

        }

    }


    /* =====================================================
       SCREEN ORIENTATION
    ===================================================== */

    async function lockLandscapeOnMobile() {

        if (
            window.innerWidth > 700
        ) {

            return;

        }


        if (
            !screen.orientation?.lock
        ) {

            return;

        }


        try {

            await screen.orientation.lock(
                "landscape"
            );

        } catch (_) {

            /*
             * Some mobile browsers do not
             * allow orientation locking.
             */

        }

    }


    async function unlockOrientation() {

        if (
            screen.orientation?.unlock
        ) {

            try {

                screen.orientation.unlock();

            } catch (_) {}

        }

    }


    /* =====================================================
       MOBILE READER MODE
    ===================================================== */

    function updateMobileReaderClass() {

        const reader =
            getReader();


        if (!reader) {

            return;

        }


        const mobile =
            window.innerWidth <= 700;


        reader.classList.toggle(
            "mobile-reader",
            mobile
        );


        reader.classList.toggle(
            "desktop-reader",
            !mobile
        );

    }


    /* =====================================================
       READER BODY LOCK
    ===================================================== */

    function lockDocumentScroll() {

        document.documentElement.classList.add(
            "reader-active"
        );


        document.body.classList.add(
            "reader-active"
        );

    }


    function unlockDocumentScroll() {

        document.documentElement.classList.remove(
            "reader-active"
        );


        document.body.classList.remove(
            "reader-active"
        );

    }


    /* =====================================================
       READER OPEN/CLOSE HOOKS
    ===================================================== */

    const originalOpenBook =
        R.openBook;


    if (
        typeof originalOpenBook ===
        "function"
    ) {

        R.openBook =
            async function(
                bookData = null
            ) {

                const result =
                    await originalOpenBook(
                        bookData
                    );


                lockDocumentScroll();


                const reader =
                    getReader();


                reader?.classList.add(
                    "reader-session"
                );


                updateMobileReaderClass();


                controlsShow();


                updateFocusButtons();


                return result;

            };

    }


    const originalCloseReader =
        R.closeReader;


    if (
        typeof originalCloseReader ===
        "function"
    ) {

        R.closeReader =
            function() {

                unlockDocumentScroll();


                const reader =
                    getReader();


                reader?.classList.remove(
                    "reader-session",
                    "focus-mode",
                    "fullscreen-active",
                    "pseudo-fullscreen"
                );


                state.focusMode =
                    false;


                if (
                    state.fullscreenActive
                ) {

                    exitFullscreen();

                }


                return originalCloseReader();

            };

    }


    /* =====================================================
       ACTION BUTTON SUPPORT
    ===================================================== */

    function bindControlButtons() {

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

                    case "toggle-controls":

                        if (
                            state.controlsVisible
                        ) {

                            controlsHide();

                        } else {

                            controlsShow();

                        }

                        break;


                    case "toggle-controls-lock":

                        toggleControlsLock();

                        break;


                    case "toggle-focus":

                        toggleFocusMode();

                        break;


                    case "fullscreen":

                        event.preventDefault();

                        toggleFullscreen();

                        break;

                }

            }
        );

    }


    /* =====================================================
       POINTER EVENTS
    ===================================================== */

    function bindPointerEvents() {

        const reader =
            getReader();


        if (!reader) {

            return;

        }


        reader.addEventListener(
            "pointermove",
            handlePointerMove,
            {
                passive: true
            }
        );


        reader.addEventListener(
            "pointerleave",
            handlePointerLeave,
            {
                passive: true
            }
        );


        reader.addEventListener(
            "click",
            handleReaderTap
        );


        const topbar =
            getTopbar();


        const bottombar =
            getBottomBar();


        [topbar, bottombar]
            .forEach(
                bar => {

                    if (!bar) {

                        return;

                    }


                    bar.addEventListener(
                        "pointerenter",
                        () => {

                            state.controlsHover =
                                true;

                            controlsShow(
                                true
                            );

                        }
                    );


                    bar.addEventListener(
                        "pointerleave",
                        () => {

                            state.controlsHover =
                                false;

                            scheduleAutoHide();

                        }
                    );

                }
            );

    }


    /* =====================================================
       WINDOW RESIZE
    ===================================================== */

    function handleResize() {

        updateMobileReaderClass();


        if (
            state.isReaderOpen
        ) {

            controlsShow();


            /*
             * Re-center the page.
             */

            if (
                typeof R.keepPageCentered ===
                "function"
            ) {

                window.requestAnimationFrame(
                    () => {

                        R.keepPageCentered();

                    }
                );

            }

        }

    }


    /* =====================================================
       VISIBILITY CHANGE
    ===================================================== */

    function handleVisibilityChange() {

        if (
            document.hidden
        ) {

            clearTimeout(
                state.controlsTimer
            );

            return;

        }


        if (
            state.isReaderOpen
        ) {

            controlsShow();

        }

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.showControls =
        controlsShow;


    R.hideControls =
        controlsHide;


    R.toggleControls =
        () => {

            if (
                state.controlsVisible
            ) {

                controlsHide();

            } else {

                controlsShow();

            }

        };


    R.lockControls =
        lockControls;


    R.unlockControls =
        unlockControls;


    R.toggleControlsLock =
        toggleControlsLock;


    R.enterFullscreen =
        enterFullscreen;


    R.exitFullscreen =
        exitFullscreen;


    R.toggleFullscreen =
        toggleFullscreen;


    R.enableFocusMode =
        enableFocusMode;


    R.disableFocusMode =
        disableFocusMode;


    R.toggleFocusMode =
        toggleFocusMode;


    R.lockLandscape =
        lockLandscapeOnMobile;


    R.unlockOrientation =
        unlockOrientation;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeControls() {

        updateMobileReaderClass();

        updateFullscreenUI();

        updateFocusButtons();

        bindControlButtons();

        bindPointerEvents();


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );


        document.addEventListener(
            "fullscreenchange",
            handleFullscreenChange
        );


        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );


        /*
         * Keep controls alive briefly
         * after initial page load.
         */

        if (
            state.isReaderOpen
        ) {

            controlsShow();

        }


        console.log(
            "Reader controls system loaded — Part 4/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeControls,
            {
                once: true
            }
        );

    } else {

        initializeControls();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 5 / 14
   MAROON + GOLDEN THEME SYSTEM
   READER LIGHT + PAGE EFFECTS + PERSISTENCE
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;

    /* =====================================================
       THEME STATE
    ===================================================== */

    state.theme = "maroon-gold";

    state.readerLight = true;

    state.pageGlow = true;

    state.themeTransition = true;

    state.savedTheme = null;

    /* =====================================================
       THEME COLORS
       MAIN WEBSITE = MAROON + GOLDEN
    ===================================================== */

    const THEME = {
        maroon: "#641b2b",
        maroonDark: "#3d101b",
        maroonDeep: "#280a12",
        maroonSoft: "#7d2a3d",

        gold: "#c79a3b",
        goldLight: "#e4c66a",
        goldDark: "#987126",

        paper: "#fffdf7",
        paperWarm: "#fffaf0",

        text: "#2d171c",
        muted: "#765b5f",

        white: "#ffffff"
    };


    /* =====================================================
       DOM
    ===================================================== */

    const html =
        document.documentElement;

    const body =
        document.body;

    const reader =
        () =>
            document.querySelector(
                ".reader"
            );

    const stage =
        () =>
            document.querySelector(
                ".page-stage"
            );


    /* =====================================================
       LOAD SAVED THEME
    ===================================================== */

    function loadSavedTheme() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_theme"
                );

            if (saved) {

                state.theme =
                    saved;

            }

            const light =
                localStorage.getItem(
                    "chishtilib_reader_light"
                );

            if (
                light !== null
            ) {

                state.readerLight =
                    light === "true";

            }

            const glow =
                localStorage.getItem(
                    "chishtilib_page_glow"
                );

            if (
                glow !== null
            ) {

                state.pageGlow =
                    glow === "true";

            }

        } catch (error) {

            console.warn(
                "Theme preferences could not be restored.",
                error
            );

        }

    }


    /* =====================================================
       SAVE THEME
    ===================================================== */

    function saveThemeSettings() {

        try {

            localStorage.setItem(
                "chishtilib_theme",
                state.theme
            );

            localStorage.setItem(
                "chishtilib_reader_light",
                String(
                    state.readerLight
                )
            );

            localStorage.setItem(
                "chishtilib_page_glow",
                String(
                    state.pageGlow
                )
            );

        } catch (error) {

            console.warn(
                "Theme preferences could not be saved.",
                error
            );

        }

    }


    /* =====================================================
       APPLY COLOR VARIABLES
    ===================================================== */

    function applyColorVariables() {

        html.style.setProperty(
            "--ch-maroon",
            THEME.maroon
        );

        html.style.setProperty(
            "--ch-maroon-dark",
            THEME.maroonDark
        );

        html.style.setProperty(
            "--ch-maroon-deep",
            THEME.maroonDeep
        );

        html.style.setProperty(
            "--ch-maroon-soft",
            THEME.maroonSoft
        );

        html.style.setProperty(
            "--ch-gold",
            THEME.gold
        );

        html.style.setProperty(
            "--ch-gold-light",
            THEME.goldLight
        );

        html.style.setProperty(
            "--ch-gold-dark",
            THEME.goldDark
        );

        html.style.setProperty(
            "--ch-reader-paper",
            THEME.paper
        );

        html.style.setProperty(
            "--ch-reader-paper-warm",
            THEME.paperWarm
        );

        html.style.setProperty(
            "--ch-reader-text",
            THEME.text
        );

        html.style.setProperty(
            "--ch-reader-muted",
            THEME.muted
        );

        html.style.setProperty(
            "--ch-white",
            THEME.white
        );

    }


    /* =====================================================
       APPLY MAIN THEME
    ===================================================== */

    function applyTheme(
        theme =
            "maroon-gold"
    ) {

        state.theme =
            theme;

        applyColorVariables();

        html.dataset.theme =
            "maroon-gold";

        body.dataset.theme =
            "maroon-gold";


        const currentReader =
            reader();

        if (currentReader) {

            currentReader.dataset.theme =
                "maroon-gold";

        }


        /*
         * Make sure old unwanted themes
         * never remain active.
         */

        html.classList.remove(
            "theme-light",
            "theme-dark",
            "theme-blue",
            "theme-green",
            "theme-purple"
        );

        body.classList.remove(
            "theme-light",
            "theme-dark",
            "theme-blue",
            "theme-green",
            "theme-purple"
        );


        html.classList.add(
            "theme-maroon-gold"
        );

        body.classList.add(
            "theme-maroon-gold"
        );


        updateThemeButtons();

        saveThemeSettings();

    }


    /* =====================================================
       THEME TRANSITION
    ===================================================== */

    function startThemeTransition() {

        if (
            !state.themeTransition
        ) {

            return;

        }

        html.classList.add(
            "theme-changing"
        );

        window.setTimeout(
            () => {

                html.classList.remove(
                    "theme-changing"
                );

            },
            350
        );

    }


    /* =====================================================
       SET THEME
    ===================================================== */

    function setTheme(
        theme
    ) {

        /*
         * Website identity is fixed:
         * MAROON + GOLDEN.
         */

        if (
            theme !== "maroon-gold"
        ) {

            theme =
                "maroon-gold";

        }

        startThemeTransition();

        applyTheme(
            theme
        );

    }


    /* =====================================================
       READER LIGHT
    ===================================================== */

    function enableReaderLight() {

        state.readerLight =
            true;

        const currentReader =
            reader();

        currentReader?.classList.add(
            "reader-light"
        );

        currentReader?.classList.remove(
            "reader-dim"
        );

        currentReader?.setAttribute(
            "data-reader-light",
            "true"
        );

        updateReaderLightButtons();

        saveThemeSettings();

    }


    function disableReaderLight() {

        state.readerLight =
            false;

        const currentReader =
            reader();

        currentReader?.classList.remove(
            "reader-light"
        );

        currentReader?.classList.add(
            "reader-dim"
        );

        currentReader?.setAttribute(
            "data-reader-light",
            "false"
        );

        updateReaderLightButtons();

        saveThemeSettings();

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

        state.pageGlow =
            true;

        const currentStage =
            stage();

        currentStage?.classList.add(
            "page-glow"
        );

        updatePageGlowButtons();

        saveThemeSettings();

    }


    function disablePageGlow() {

        state.pageGlow =
            false;

        const currentStage =
            stage();

        currentStage?.classList.remove(
            "page-glow"
        );

        updatePageGlowButtons();

        saveThemeSettings();

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
       UPDATE THEME BUTTONS
    ===================================================== */

    function updateThemeButtons() {

        document
            .querySelectorAll(
                "[data-theme]"
            )
            .forEach(
                button => {

                    const selected =
                        button.dataset.theme ===
                        state.theme;

                    button.classList.toggle(
                        "active",
                        selected
                    );

                    button.setAttribute(
                        "aria-selected",
                        String(
                            selected
                        )
                    );

                }
            );

    }


    /* =====================================================
       UPDATE READER LIGHT BUTTONS
    ===================================================== */

    function updateReaderLightButtons() {

        document
            .querySelectorAll(
                "[data-action='reader-light'], [data-action='toggle-reader-light']"
            )
            .forEach(
                button => {

                    const active =
                        state.readerLight;

                    button.classList.toggle(
                        "active",
                        active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(
                            active
                        )
                    );


                    const label =
                        button.querySelector(
                            ".btn-label, .tool-label"
                        );

                    if (label) {

                        label.textContent =
                            active
                                ? "Reader light"
                                : "Reader light off";

                    }

                }
            );

    }


    /* =====================================================
       UPDATE PAGE GLOW BUTTONS
    ===================================================== */

    function updatePageGlowButtons() {

        document
            .querySelectorAll(
                "[data-action='page-glow'], [data-action='toggle-page-glow']"
            )
            .forEach(
                button => {

                    const active =
                        state.pageGlow;

                    button.classList.toggle(
                        "active",
                        active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(
                            active
                        )
                    );

                }
            );

    }


    /* =====================================================
       APPLY READER LIGHT TO NEW PAGES
    ===================================================== */

    function applyPageAppearance() {

        const currentReader =
            reader();

        const currentStage =
            stage();

        if (
            !currentReader
        ) {

            return;

        }


        currentReader.classList.toggle(
            "reader-light",
            state.readerLight
        );

        currentReader.classList.toggle(
            "reader-dim",
            !state.readerLight
        );


        currentStage?.classList.toggle(
            "page-glow",
            state.pageGlow
        );


        /*
         * Ensure the actual book page
         * stays white / warm-white.
         */

        document
            .querySelectorAll(
                ".reader-page"
            )
            .forEach(
                page => {

                    page.classList.add(
                        "book-paper"
                    );

                }
            );

    }


    /* =====================================================
       GOLDEN PAGE BORDER
    ===================================================== */

    function applyPageFrame() {

        document
            .querySelectorAll(
                ".reader-page"
            )
            .forEach(
                page => {

                    page.classList.add(
                        "maroon-gold-page"
                    );

                }
            );

    }


    /* =====================================================
       READER LIGHT CSS FALLBACK
       Useful even if CSS selector differs.
    ===================================================== */

    function injectThemeFallback() {

        const styleId =
            "chishtilib-theme-runtime";

        if (
            document.getElementById(
                styleId
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );

        style.id =
            styleId;


        style.textContent = `

            :root {

                --ch-maroon: #641b2b;
                --ch-maroon-dark: #3d101b;
                --ch-maroon-deep: #280a12;
                --ch-maroon-soft: #7d2a3d;

                --ch-gold: #c79a3b;
                --ch-gold-light: #e4c66a;
                --ch-gold-dark: #987126;

                --ch-reader-paper: #fffdf7;
                --ch-reader-paper-warm: #fffaf0;

                --ch-reader-text: #2d171c;
                --ch-reader-muted: #765b5f;

                --ch-white: #ffffff;

            }


            html.theme-changing * {

                transition:
                    background-color .25s ease,
                    border-color .25s ease,
                    color .25s ease,
                    box-shadow .25s ease;

            }


            .reader.theme-maroon-gold,
            .reader[data-theme="maroon-gold"] {

                background:
                    linear-gradient(
                        135deg,
                        var(--ch-maroon-deep),
                        var(--ch-maroon-dark)
                    );

            }


            .reader.reader-light {

                color:
                    var(--ch-reader-text);

            }


            .reader.reader-dim {

                filter:
                    brightness(.82);

            }


            .page-stage.page-glow {

                filter:
                    drop-shadow(
                        0 12px 30px
                        rgba(0,0,0,.22)
                    );

            }


            .reader-page.maroon-gold-page {

                background:
                    var(--ch-reader-paper);

                border:
                    1px solid
                    rgba(
                        199,
                        154,
                        59,
                        .45
                    );

            }


            .reader-page.book-paper {

                background:
                    var(--ch-reader-paper);

            }


            .reader-topbar,
            .reader-bottombar {

                --reader-accent:
                    var(--ch-gold);

            }


            .reader-controls
            [data-action].active {

                color:
                    var(--ch-gold-light);

                border-color:
                    var(--ch-gold);

            }


            @media (
                max-width: 700px
            ) {

                .reader-page {

                    max-width:
                        calc(
                            100vw - 24px
                        );

                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       THEME ACTIONS
    ===================================================== */

    function bindThemeActions() {

        document.addEventListener(
            "click",
            event => {

                const themeButton =
                    event.target.closest(
                        "[data-theme]"
                    );


                if (
                    themeButton &&
                    themeButton.dataset.theme
                ) {

                    event.preventDefault();

                    setTheme(
                        themeButton.dataset.theme
                    );

                    return;

                }


                const actionButton =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!actionButton) {

                    return;

                }


                switch (
                    actionButton.dataset.action
                ) {

                    case "reader-light":

                    case "toggle-reader-light":

                        event.preventDefault();

                        toggleReaderLight();

                        break;


                    case "page-glow":

                    case "toggle-page-glow":

                        event.preventDefault();

                        togglePageGlow();

                        break;

                }

            }
        );

    }


    /* =====================================================
       RE-APPLY WHEN PAGE CHANGES
    ===================================================== */

    function observePageChanges() {

        const currentStage =
            stage();

        if (
            !currentStage
        ) {

            return;

        }


        const observer =
            new MutationObserver(
                () => {

                    window.requestAnimationFrame(
                        () => {

                            applyPageAppearance();

                            applyPageFrame();

                        }
                    );

                }
            );


        observer.observe(
            currentStage,
            {
                childList: true,
                subtree: true
            }
        );


        state.themeObserver =
            observer;

    }


    /* =====================================================
       WINDOW VISUAL CHANGES
    ===================================================== */

    function handleThemeResize() {

        /*
         * Re-apply page appearance after
         * responsive layout changes.
         */

        window.requestAnimationFrame(
            () => {

                applyPageAppearance();

                applyPageFrame();

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.setTheme =
        setTheme;

    R.applyTheme =
        applyTheme;

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

    R.applyPageAppearance =
        applyPageAppearance;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeTheme() {

        loadSavedTheme();

        injectThemeFallback();

        applyColorVariables();

        applyTheme(
            "maroon-gold"
        );

        applyPageAppearance();

        applyPageFrame();

        updateReaderLightButtons();

        updatePageGlowButtons();

        bindThemeActions();

        observePageChanges();


        window.addEventListener(
            "resize",
            handleThemeResize,
            {
                passive: true
            }
        );


        console.log(
            "Maroon + Golden theme system loaded — Part 5/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeTheme,
            {
                once: true
            }
        );

    } else {

        initializeTheme();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 6 / 14
   ZOOM ENGINE + FIT WIDTH + FIT PAGE +
   MOBILE RESPONSIVE READING
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;

    /* =====================================================
       ZOOM STATE
    ===================================================== */

    state.zoom = Number(state.zoom) || 1;

    state.minZoom = 0.65;

    state.maxZoom = 3.0;

    state.zoomStep = 0.1;

    state.zoomMode = "manual";

    state.fitMode = false;

    state.zoomAnimating = false;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getReader = () =>
        document.querySelector(".reader");

    const getViewport = () =>
        document.querySelector(".reader-viewport");

    const getStage = () =>
        document.querySelector(".page-stage");

    const getPage = () =>
        document.querySelector(
            ".reader-page"
        );

    const getZoomLabels = () =>
        document.querySelectorAll(
            ".zoom-value, [data-zoom-value]"
        );


    /* =====================================================
       CLAMP ZOOM
    ===================================================== */

    function clampZoom(value) {

        let zoom =
            Number(value);

        if (!Number.isFinite(zoom)) {
            zoom = 1;
        }

        zoom = Math.max(
            state.minZoom,
            zoom
        );

        zoom = Math.min(
            state.maxZoom,
            zoom
        );

        return Math.round(
            zoom * 100
        ) / 100;

    }


    /* =====================================================
       UPDATE ZOOM LABEL
    ===================================================== */

    function updateZoomUI() {

        const percent =
            Math.round(
                state.zoom * 100
            );

        getZoomLabels()
            .forEach(element => {

                element.textContent =
                    `${percent}%`;

            });


        document
            .querySelectorAll(
                "[data-zoom-range]"
            )
            .forEach(input => {

                input.value =
                    state.zoom;

            });


        document
            .querySelectorAll(
                "[data-zoom-in]"
            )
            .forEach(button => {

                button.disabled =
                    state.zoom >=
                    state.maxZoom;

            });


        document
            .querySelectorAll(
                "[data-zoom-out]"
            )
            .forEach(button => {

                button.disabled =
                    state.zoom <=
                    state.minZoom;

            });


        const reader =
            getReader();

        if (reader) {

            reader.style.setProperty(
                "--reader-zoom",
                state.zoom
            );

            reader.dataset.zoom =
                String(state.zoom);

        }

    }


    /* =====================================================
       APPLY ZOOM
    ===================================================== */

    function applyZoom(
        zoom,
        options = {}
    ) {

        const nextZoom =
            clampZoom(zoom);

        state.zoom =
            nextZoom;


        if (
            !options.keepFit
        ) {

            state.fitMode =
                false;

            state.zoomMode =
                "manual";

        }


        const stage =
            getStage();

        const page =
            getPage();


        if (
            stage
        ) {

            stage.style.setProperty(
                "--page-scale",
                String(nextZoom)
            );

        }


        if (
            page
        ) {

            page.style.setProperty(
                "--page-scale",
                String(nextZoom)
            );

        }


        const reader =
            getReader();

        if (
            reader
        ) {

            reader.style.setProperty(
                "--reader-zoom",
                String(nextZoom)
            );

            reader.classList.toggle(
                "zoomed",
                nextZoom !== 1
            );

            reader.classList.toggle(
                "zoom-100",
                nextZoom === 1
            );

        }


        updateZoomUI();


        if (
            typeof R.keepPageCentered ===
            "function"
        ) {

            window.requestAnimationFrame(
                () => {

                    R.keepPageCentered();

                }
            );

        }


        saveZoom();

    }


    /* =====================================================
       SMOOTH ZOOM
    ===================================================== */

    function animateZoom(
        target
    ) {

        target =
            clampZoom(target);


        if (
            state.zoomAnimating
        ) {

            state.zoom =
                target;

            applyZoom(
                target
            );

            return;

        }


        const start =
            state.zoom;

        const distance =
            target -
            start;


        if (
            Math.abs(distance) <
            0.01
        ) {

            applyZoom(target);

            return;

        }


        state.zoomAnimating =
            true;


        const duration =
            180;

        const startTime =
            performance.now();


        function frame(
            now
        ) {

            const progress =
                Math.min(
                    1,
                    (
                        now -
                        startTime
                    ) /
                    duration
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            const value =
                start +
                distance *
                eased;


            state.zoom =
                clampZoom(
                    value
                );


            applyZoom(
                state.zoom
            );


            if (
                progress <
                1
            ) {

                requestAnimationFrame(
                    frame
                );

            } else {

                state.zoomAnimating =
                    false;

                state.zoom =
                    target;

                applyZoom(
                    target
                );

            }

        }


        requestAnimationFrame(
            frame
        );

    }


    /* =====================================================
       ZOOM IN
    ===================================================== */

    function zoomIn() {

        animateZoom(
            state.zoom +
            state.zoomStep
        );

    }


    /* =====================================================
       ZOOM OUT
    ===================================================== */

    function zoomOut() {

        animateZoom(
            state.zoom -
            state.zoomStep
        );

    }


    /* =====================================================
       RESET ZOOM
    ===================================================== */

    function resetZoom() {

        state.fitMode =
            false;

        state.zoomMode =
            "manual";

        animateZoom(
            1
        );

    }


    /* =====================================================
       SET ZOOM
    ===================================================== */

    function setZoom(
        value
    ) {

        animateZoom(
            value
        );

    }


    /* =====================================================
       FIT WIDTH
    ===================================================== */

    function fitWidth() {

        const viewport =
            getViewport();

        const page =
            getPage();

        if (
            !viewport ||
            !page
        ) {

            return;

        }


        /*
         * Temporarily remove transform
         * so we can measure actual page size.
         */

        const previous =
            state.zoom;


        page.style.transform =
            "none";


        const pageWidth =
            page.getBoundingClientRect().width;


        const viewportWidth =
            viewport.clientWidth;


        page.style.transform =
            "";


        if (
            pageWidth <= 0 ||
            viewportWidth <= 0
        ) {

            return;

        }


        /*
         * Small mobile margin.
         */

        const margin =
            window.innerWidth <= 700
                ? 20
                : 40;


        let target =
            (
                viewportWidth -
                margin
            ) /
            pageWidth;


        /*
         * Don't let fit-width become
         * absurdly small or huge.
         */

        target =
            clampZoom(
                target
            );


        state.fitMode =
            true;

        state.zoomMode =
            "fit-width";


        animateZoom(
            target
        );


        /*
         * Keep previous zoom available
         * for future layout recalculation.
         */

        state.previousZoom =
            previous;

    }


    /* =====================================================
       FIT PAGE
    ===================================================== */

    function fitPage() {

        const viewport =
            getViewport();

        const page =
            getPage();

        if (
            !viewport ||
            !page
        ) {

            return;

        }


        page.style.transform =
            "none";


        const rect =
            page.getBoundingClientRect();


        const viewportWidth =
            viewport.clientWidth;


        const viewportHeight =
            viewport.clientHeight;


        if (
            rect.width <= 0 ||
            rect.height <= 0
        ) {

            return;

        }


        const horizontalMargin =
            window.innerWidth <= 700
                ? 20
                : 50;


        const verticalMargin =
            window.innerWidth <= 700
                ? 24
                : 60;


        const widthRatio =
            (
                viewportWidth -
                horizontalMargin
            ) /
            rect.width;


        const heightRatio =
            (
                viewportHeight -
                verticalMargin
            ) /
            rect.height;


        const target =
            clampZoom(
                Math.min(
                    widthRatio,
                    heightRatio
                )
            );


        state.fitMode =
            true;

        state.zoomMode =
            "fit-page";


        animateZoom(
            target
        );

    }


    /* =====================================================
       AUTO FIT FOR MOBILE
    ===================================================== */

    function autoFitMobile() {

        if (
            window.innerWidth >
            700
        ) {

            return;

        }


        /*
         * Only auto-fit if the user has not
         * manually zoomed.
         */

        if (
            state.zoomMode !==
            "manual"
        ) {

            return;

        }


        fitWidth();

    }


    /* =====================================================
       ZOOM WITH WHEEL + CTRL
    ===================================================== */

    function handleCtrlWheel(
        event
    ) {

        if (
            !event.ctrlKey &&
            !event.metaKey
        ) {

            return;

        }


        if (
            !state.isReaderOpen
        ) {

            return;

        }


        event.preventDefault();


        const direction =
            event.deltaY > 0
                ? -1
                : 1;


        const amount =
            state.zoomStep *
            (
                Math.abs(
                    event.deltaY
                ) > 100
                    ? 2
                    : 1
            );


        animateZoom(
            state.zoom +
            direction *
            amount
        );

    }


    /* =====================================================
       PINCH ZOOM
    ===================================================== */

    let pinchStartDistance =
        null;

    let pinchStartZoom =
        1;


    function getTouchDistance(
        touches
    ) {

        if (
            !touches ||
            touches.length <
            2
        ) {

            return 0;

        }


        const a =
            touches[0];

        const b =
            touches[1];


        const dx =
            b.clientX -
            a.clientX;

        const dy =
            b.clientY -
            a.clientY;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );

    }


    function handlePinchStart(
        event
    ) {

        if (
            event.touches.length !==
            2
        ) {

            return;

        }


        pinchStartDistance =
            getTouchDistance(
                event.touches
            );


        pinchStartZoom =
            state.zoom;

    }


    function handlePinchMove(
        event
    ) {

        if (
            event.touches.length !==
            2
        ) {

            return;

        }


        if (
            !pinchStartDistance
        ) {

            return;

        }


        const currentDistance =
            getTouchDistance(
                event.touches
            );


        if (
            currentDistance <= 0
        ) {

            return;

        }


        const ratio =
            currentDistance /
            pinchStartDistance;


        let target =
            pinchStartZoom *
            ratio;


        target =
            clampZoom(
                target
            );


        state.zoomMode =
            "manual";

        state.fitMode =
            false;


        applyZoom(
            target
        );

    }


    function handlePinchEnd() {

        pinchStartDistance =
            null;

    }


    /* =====================================================
       ZOOM BUTTONS
    ===================================================== */

    function bindZoomButtons() {

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
                        "[data-zoom-reset]"
                    );


                if (
                    resetButton
                ) {

                    event.preventDefault();

                    resetZoom();

                    return;

                }


                const fitWidthButton =
                    event.target.closest(
                        "[data-fit-width]"
                    );


                if (
                    fitWidthButton
                ) {

                    event.preventDefault();

                    fitWidth();

                    return;

                }


                const fitPageButton =
                    event.target.closest(
                        "[data-fit-page]"
                    );


                if (
                    fitPageButton
                ) {

                    event.preventDefault();

                    fitPage();

                    return;

                }

            }
        );


        document.addEventListener(
            "input",
            event => {

                if (
                    !event.target.matches(
                        "[data-zoom-range]"
                    )
                ) {

                    return;

                }


                const value =
                    Number(
                        event.target.value
                    );


                if (
                    Number.isFinite(value)
                ) {

                    state.zoomMode =
                        "manual";

                    state.fitMode =
                        false;

                    applyZoom(
                        value
                    );

                }

            }
        );

    }


    /* =====================================================
       SAVE ZOOM
    ===================================================== */

    function saveZoom() {

        try {

            localStorage.setItem(
                "chishtilib_zoom",
                String(
                    state.zoom
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       RESTORE ZOOM
    ===================================================== */

    function restoreZoom() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_zoom"
                );


            if (
                saved !== null
            ) {

                const value =
                    Number(saved);


                if (
                    Number.isFinite(
                        value
                    )
                ) {

                    state.zoom =
                        clampZoom(
                            value
                        );

                }

            }

        } catch (_) {}

    }


    /* =====================================================
       ZOOM ON PAGE RENDER
    ===================================================== */

    function applyZoomAfterRender() {

        /*
         * Page can be replaced by the PDF
         * renderer, so apply zoom again.
         */

        window.requestAnimationFrame(
            () => {

                applyZoom(
                    state.zoom,
                    {
                        keepFit:
                            state.fitMode
                    }
                );

                if (
                    window.innerWidth <=
                    700 &&
                    state.zoomMode ===
                    "manual"
                ) {

                    autoFitMobile();

                }

            }
        );

    }


    /* =====================================================
       OBSERVE PAGE REPLACEMENT
    ===================================================== */

    function observePage() {

        const stage =
            getStage();

        if (
            !stage
        ) {

            return;

        }


        const observer =
            new MutationObserver(
                () => {

                    applyZoomAfterRender();

                }
            );


        observer.observe(
            stage,
            {
                childList: true,
                subtree: true
            }
        );


        state.zoomObserver =
            observer;

    }


    /* =====================================================
       RESPONSIVE RESIZE
    ===================================================== */

    let resizeTimer =
        null;


    function handleResize() {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                () => {

                    if (
                        state.fitMode
                    ) {

                        if (
                            state.zoomMode ===
                            "fit-width"
                        ) {

                            fitWidth();

                        } else if (
                            state.zoomMode ===
                            "fit-page"
                        ) {

                            fitPage();

                        }

                    } else {

                        applyZoom(
                            state.zoom
                        );

                    }

                },
                120
            );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.setZoom =
        setZoom;

    R.zoomIn =
        zoomIn;

    R.zoomOut =
        zoomOut;

    R.resetZoom =
        resetZoom;

    R.fitWidth =
        fitWidth;

    R.fitPage =
        fitPage;

    R.applyZoom =
        applyZoom;

    R.updateZoomUI =
        updateZoomUI;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeZoom() {

        restoreZoom();

        bindZoomButtons();

        observePage();


        const viewport =
            getViewport();


        if (
            viewport
        ) {

            viewport.addEventListener(
                "wheel",
                handleCtrlWheel,
                {
                    passive: false
                }
            );


            viewport.addEventListener(
                "touchstart",
                handlePinchStart,
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "touchmove",
                handlePinchMove,
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "touchend",
                handlePinchEnd,
                {
                    passive: true
                }
            );


            viewport.addEventListener(
                "touchcancel",
                handlePinchEnd,
                {
                    passive: true
                }
            );

        }


        window.addEventListener(
            "resize",
            handleResize,
            {
                passive: true
            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.ctrlKey ||
                    event.metaKey
                ) {

                    return;

                }


                if (
                    event.key === "+"
                ) {

                    event.preventDefault();

                    zoomIn();

                }


                if (
                    event.key === "-"
                ) {

                    event.preventDefault();

                    zoomOut();

                }


                if (
                    event.key === "0"
                ) {

                    /*
                     * Don't interfere with text inputs.
                     */

                    if (
                        event.target.matches(
                            "input, textarea"
                        )
                    ) {

                        return;

                    }


                    event.preventDefault();

                    resetZoom();

                }

            }
        );


        applyZoom(
            state.zoom
        );


        updateZoomUI();


        console.log(
            "Zoom engine loaded — Part 6/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeZoom,
            {
                once: true
            }
        );

    } else {

        initializeZoom();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 7 / 14
   SEARCH ENGINE + LIVE SEARCH + HIGHLIGHTS +
   KEYBOARD SHORTCUTS + SEARCH NAVIGATION
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;


    /* =====================================================
       SEARCH STATE
    ===================================================== */

    state.searchQuery = "";

    state.searchResults = [];

    state.searchIndex = -1;

    state.searchOpen = false;

    state.searching = false;

    state.searchDebounce = null;

    state.searchRequestId = 0;

    state.searchHighlightClass =
        "reader-search-highlight";


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getReader = () =>
        document.querySelector(".reader");


    const getSearchInput = () =>
        document.querySelector(
            ".reader-search-input, [data-search-input], #readerSearchInput"
        );


    const getSearchResults = () =>
        document.querySelector(
            ".search-results, [data-search-results]"
        );


    const getSearchCount = () =>
        document.querySelectorAll(
            ".search-result-count, [data-search-count]"
        );


    const getSearchStatus = () =>
        document.querySelectorAll(
            ".search-status, [data-search-status]"
        );


    /* =====================================================
       NORMALIZE TEXT
    ===================================================== */

    function normalizeText(
        value
    ) {

        return String(
            value || ""
        )
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
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
       SEARCH SOURCE COLLECTION
    ===================================================== */

    function collectSearchSources() {

        const sources = [];


        /*
         * Existing book/library data.
         */

        const possibleCollections = [

            state.books,

            state.library,

            state.documents,

            state.catalog,

            state.bookList

        ];


        possibleCollections
            .filter(Boolean)
            .forEach(
                collection => {

                    if (
                        Array.isArray(
                            collection
                        )
                    ) {

                        collection.forEach(
                            item => {

                                if (
                                    item
                                ) {

                                    sources.push(
                                        item
                                    );

                                }

                            }
                        );

                    }

                }
            );


        /*
         * PDF metadata.
         */

        if (
            state.pdfDocument
        ) {

            sources.push({
                type: "pdf",
                title:
                    state.bookTitle ||
                    "Current document"
            });

        }


        return sources;

    }


    /* =====================================================
       SEARCH CURRENT PAGE
    ===================================================== */

    function searchCurrentPageText(
        query
    ) {

        const page =
            document.querySelector(
                ".reader-page"
            );


        if (
            !page
        ) {

            return null;

        }


        const text =
            page.innerText ||
            page.textContent ||
            "";


        const normalized =
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

            return null;

        }


        const index =
            normalized.indexOf(
                normalizedQuery
            );


        if (
            index === -1
        ) {

            return null;

        }


        return {
            page:
                state.currentPage || 1,

            title:
                state.bookTitle ||
                "Current page",

            text:
                text,

            index:
                index

        };

    }


    /* =====================================================
       SEARCH PDF PAGE
    ===================================================== */

    async function searchPDFPage(
        pageNumber,
        query,
        requestId
    ) {

        if (
            !state.pdfDocument
        ) {

            return null;

        }


        try {

            const page =
                await state.pdfDocument.getPage(
                    pageNumber
                );


            /*
             * Stop old search requests.
             */

            if (
                requestId !==
                state.searchRequestId
            ) {

                return null;

            }


            const content =
                await page.getTextContent();


            const strings =
                content.items
                    .map(
                        item =>
                            item.str || ""
                    )
                    .join(" ");


            const normalizedText =
                normalizeText(
                    strings
                );


            const normalizedQuery =
                normalizeText(
                    query
                );


            const index =
                normalizedText.indexOf(
                    normalizedQuery
                );


            if (
                index === -1
            ) {

                return null;

            }


            return {

                page:
                    pageNumber,

                title:
                    state.bookTitle ||
                    "Document",

                text:
                    strings,

                index:
                    index

            };

        } catch (error) {

            console.warn(
                "Could not search PDF page:",
                pageNumber,
                error
            );

            return null;

        }

    }


    /* =====================================================
       SEARCH PDF DOCUMENT
    ===================================================== */

    async function searchPDF(
        query,
        requestId
    ) {

        if (
            !state.pdfDocument
        ) {

            return [];

        }


        const total =
            state.pdfDocument.numPages;


        const results = [];


        /*
         * Keep search manageable on very
         * large PDFs.
         */

        const MAX_RESULTS =
            100;


        for (
            let page = 1;
            page <= total;
            page++
        ) {

            if (
                requestId !==
                state.searchRequestId
            ) {

                return [];

            }


            const result =
                await searchPDFPage(
                    page,
                    query,
                    requestId
                );


            if (
                result
            ) {

                results.push(
                    result
                );

            }


            if (
                results.length >=
                MAX_RESULTS
            ) {

                break;

            }


            /*
             * Yield to browser so the UI
             * does not freeze on mobile.
             */

            if (
                page % 4 === 0
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            0
                        )
                );

            }

        }


        return results;

    }


    /* =====================================================
       SEARCH LIBRARY DATA
    ===================================================== */

    function searchLibrary(
        query
    ) {

        const normalizedQuery =
            normalizeText(
                query
            );


        if (
            !normalizedQuery
        ) {

            return [];

        }


        const sources =
            collectSearchSources();


        const results = [];


        sources.forEach(
            (item, index) => {

                const title =
                    item.title ||
                    item.name ||
                    item.bookTitle ||
                    `Item ${index + 1}`;


                const author =
                    item.author ||
                    item.writer ||
                    "";


                const description =
                    item.description ||
                    item.summary ||
                    item.about ||
                    "";


                const searchable =
                    normalizeText(
                        [
                            title,
                            author,
                            description
                        ].join(" ")
                    );


                const position =
                    searchable.indexOf(
                        normalizedQuery
                    );


                if (
                    position !== -1
                ) {

                    results.push({

                        type:
                            "library",

                        page:
                            null,

                        title:
                            title,

                        author:
                            author,

                        description:
                            description,

                        source:
                            item,

                        index:
                            position

                    });

                }

            }
        );


        return results;

    }


    /* =====================================================
       SEARCH EVERYTHING
    ===================================================== */

    async function performSearch(
        query
    ) {

        const cleanQuery =
            String(
                query || ""
            ).trim();


        state.searchQuery =
            cleanQuery;


        state.searchRequestId++;


        const requestId =
            state.searchRequestId;


        if (
            !cleanQuery
        ) {

            state.searchResults =
                [];

            state.searchIndex =
                -1;

            state.searching =
                false;

            clearSearchHighlights();

            renderSearchResults();

            updateSearchStatus();

            return [];

        }


        state.searching =
            true;


        updateSearchStatus();


        clearSearchHighlights();


        const results = [];


        /*
         * Search current document.
         */

        if (
            state.pdfDocument
        ) {

            const pdfResults =
                await searchPDF(
                    cleanQuery,
                    requestId
                );


            results.push(
                ...pdfResults
            );

        } else {

            const currentPage =
                searchCurrentPageText(
                    cleanQuery
                );


            if (
                currentPage
            ) {

                results.push(
                    currentPage
                );

            }

        }


        /*
         * Search library metadata.
         */

        const libraryResults =
            searchLibrary(
                cleanQuery
            );


        results.push(
            ...libraryResults
        );


        if (
            requestId !==
            state.searchRequestId
        ) {

            return [];

        }


        state.searchResults =
            results;


        state.searchIndex =
            results.length
                ? 0
                : -1;


        state.searching =
            false;


        renderSearchResults();

        updateSearchStatus();


        /*
         * If a PDF result exists,
         * open its first result.
         */

        if (
            results.length &&
            results[0].page
        ) {

            await openSearchResult(
                0,
                {
                    silent: true
                }
            );

        }


        return results;

    }


    /* =====================================================
       DEBOUNCED SEARCH
    ===================================================== */

    function scheduleSearch(
        query
    ) {

        clearTimeout(
            state.searchDebounce
        );


        state.searchDebounce =
            setTimeout(
                () => {

                    performSearch(
                        query
                    );

                },
                280
            );

    }


    /* =====================================================
       HIGHLIGHT TEXT NODE
    ===================================================== */

    function highlightTextNode(
        node,
        query
    ) {

        if (
            !node ||
            !query
        ) {

            return;

        }


        const text =
            node.nodeValue;


        if (
            !text
        ) {

            return;

        }


        const normalizedQuery =
            normalizeText(
                query
            );


        const normalizedText =
            normalizeText(
                text
            );


        const index =
            normalizedText.indexOf(
                normalizedQuery
            );


        if (
            index === -1
        ) {

            return;

        }


        /*
         * Exact character mapping is safer
         * when normalizing Unicode.
         *
         * For normal Urdu/English PDF text,
         * use the original text index.
         */

        const rawIndex =
            text
                .toLowerCase()
                .indexOf(
                    String(query)
                        .toLowerCase()
                );


        if (
            rawIndex === -1
        ) {

            return;

        }


        const before =
            text.slice(
                0,
                rawIndex
            );


        const match =
            text.slice(
                rawIndex,
                rawIndex +
                String(query).length
            );


        const after =
            text.slice(
                rawIndex +
                String(query).length
            );


        const fragment =
            document.createDocumentFragment();


        if (
            before
        ) {

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
            state.searchHighlightClass;


        mark.textContent =
            match;


        fragment.appendChild(
            mark
        );


        if (
            after
        ) {

            fragment.appendChild(
                document.createTextNode(
                    after
                )
            );

        }


        node.parentNode?.replaceChild(
            fragment,
            node
        );

    }


    /* =====================================================
       HIGHLIGHT CURRENT PAGE
    ===================================================== */

    function highlightCurrentPage(
        query
    ) {

        const page =
            document.querySelector(
                ".reader-page"
            );


        if (
            !page ||
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
                            node.parentElement?.closest(
                                "script, style, mark"
                            )
                        ) {

                            return NodeFilter.FILTER_REJECT;

                        }


                        return NodeFilter.FILTER_ACCEPT;

                    }

                }
            );


        const nodes = [];


        let current;


        while (
            current =
            walker.nextNode()
        ) {

            nodes.push(
                current
            );

        }


        nodes.forEach(
            node => {

                highlightTextNode(
                    node,
                    query
                );

            }
        );

    }


    /* =====================================================
       CLEAR HIGHLIGHTS
    ===================================================== */

    function clearSearchHighlights() {

        document
            .querySelectorAll(
                `.${state.searchHighlightClass}`
            )
            .forEach(
                mark => {

                    const parent =
                        mark.parentNode;


                    if (!parent) {
                        return;
                    }


                    parent.replaceChild(
                        document.createTextNode(
                            mark.textContent
                        ),
                        mark
                    );


                    parent.normalize();

                }
            );

    }


    /* =====================================================
       RESULT SNIPPET
    ===================================================== */

    function makeSnippet(
        text,
        query
    ) {

        const cleanText =
            String(
                text || ""
            )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        if (
            !cleanText
        ) {

            return "";

        }


        const normalized =
            cleanText.toLowerCase();


        const position =
            normalized.indexOf(
                String(
                    query
                ).toLowerCase()
            );


        if (
            position === -1
        ) {

            return cleanText.slice(
                0,
                130
            );

        }


        const start =
            Math.max(
                0,
                position - 55
            );


        const end =
            Math.min(
                cleanText.length,
                position +
                String(query).length +
                75
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
                "… " +
                snippet;

        }


        if (
            end <
            cleanText.length
        ) {

            snippet +=
                " …";

        }


        return snippet;

    }


    /* =====================================================
       RENDER RESULTS
    ===================================================== */

    function renderSearchResults() {

        const container =
            getSearchResults();


        if (
            !container
        ) {

            return;

        }


        const results =
            state.searchResults || [];


        if (
            state.searching
        ) {

            container.innerHTML =
                `
                    <div class="search-empty search-loading">
                        Searching…
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
                        No results found
                    </div>
                `;

            return;

        }


        container.innerHTML =
            results
                .map(
                    (result, index) => {

                        const title =
                            escapeHTML(
                                result.title ||
                                "Untitled"
                            );


                        const pageText =
                            result.page
                                ? `Page ${result.page}`
                                : "Library";


                        const snippet =
                            makeSnippet(
                                result.text ||
                                result.description ||
                                result.author ||
                                "",
                                state.searchQuery
                            );


                        const active =
                            index ===
                            state.searchIndex;


                        return `
                            <button
                                type="button"
                                class="search-result ${
                                    active
                                        ? "active"
                                        : ""
                                }"
                                data-search-index="${index}"
                                aria-current="${
                                    active
                                        ? "true"
                                        : "false"
                                }"
                            >

                                <span class="search-result-title">
                                    ${title}
                                </span>

                                <span class="search-result-page">
                                    ${pageText}
                                </span>

                                ${
                                    snippet
                                        ? `
                                            <span class="search-result-snippet">
                                                ${escapeHTML(snippet)}
                                            </span>
                                        `
                                        : ""
                                }

                            </button>
                        `;

                    }
                )
                .join("");

    }


    /* =====================================================
       SEARCH STATUS
    ===================================================== */

    function updateSearchStatus() {

        const count =
            state.searchResults.length;


        getSearchCount()
            .forEach(
                element => {

                    element.textContent =
                        count
                            ? `${count} result${count === 1 ? "" : "s"}`
                            : "";

                }
            );


        getSearchStatus()
            .forEach(
                element => {

                    if (
                        state.searching
                    ) {

                        element.textContent =
                            "Searching…";

                    } else if (
                        state.searchQuery
                    ) {

                        element.textContent =
                            count
                                ? `${count} result${count === 1 ? "" : "s"}`
                                : "No results";

                    } else {

                        element.textContent =
                            "";

                    }

                }
            );

    }


    /* =====================================================
       OPEN RESULT
    ===================================================== */

    async function openSearchResult(
        index,
        options = {}
    ) {

        const result =
            state.searchResults[
                index
            ];


        if (
            !result
        ) {

            return;

        }


        state.searchIndex =
            index;


        renderSearchResults();


        if (
            result.page &&
            typeof R.goToPage ===
            "function"
        ) {

            await R.goToPage(
                result.page,
                {
                    notify:
                        !options.silent
                }
            );


            /*
             * Wait until renderer inserts
             * the page before highlighting.
             */

            window.requestAnimationFrame(
                () => {

                    highlightCurrentPage(
                        state.searchQuery
                    );

                    const highlight =
                        document.querySelector(
                            `.${state.searchHighlightClass}`
                        );


                    highlight?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center"
                    });

                }
            );

        }

    }


    /* =====================================================
       NEXT SEARCH RESULT
    ===================================================== */

    async function nextSearchResult() {

        const total =
            state.searchResults.length;


        if (
            !total
        ) {

            return;

        }


        let index =
            state.searchIndex + 1;


        if (
            index >= total
        ) {

            index = 0;

        }


        await openSearchResult(
            index
        );

    }


    /* =====================================================
       PREVIOUS SEARCH RESULT
    ===================================================== */

    async function previousSearchResult() {

        const total =
            state.searchResults.length;


        if (
            !total
        ) {

            return;

        }


        let index =
            state.searchIndex - 1;


        if (
            index < 0
        ) {

            index =
                total - 1;

        }


        await openSearchResult(
            index
        );

    }


    /* =====================================================
       OPEN SEARCH
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


        if (
            input
        ) {

            window.requestAnimationFrame(
                () => {

                    input.focus();

                    input.select();

                }
            );

        }


        if (
            typeof R.showControls ===
            "function"
        ) {

            R.showControls(
                true
            );

        }

    }


    /* =====================================================
       CLOSE SEARCH
    ===================================================== */

    function closeSearch() {

        state.searchOpen =
            false;


        const reader =
            getReader();


        reader?.classList.remove(
            "search-open"
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
       SEARCH INPUT
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


        input.addEventListener(
            "input",
            () => {

                scheduleSearch(
                    input.value
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

                    event.preventDefault();

                    closeSearch();

                    input.blur();

                }

            }
        );

    }


    /* =====================================================
       SEARCH ACTION BUTTONS
    ===================================================== */

    function bindSearchActions() {

        document.addEventListener(
            "click",
            event => {

                const searchButton =
                    event.target.closest(
                        "[data-action='search'], [data-search-open]"
                    );


                if (
                    searchButton
                ) {

                    event.preventDefault();

                    openSearch();

                    return;

                }


                const closeButton =
                    event.target.closest(
                        "[data-action='close-search'], [data-search-close]"
                    );


                if (
                    closeButton
                ) {

                    event.preventDefault();

                    closeSearch();

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
                        "[data-search-prev]"
                    );


                if (
                    previousButton
                ) {

                    event.preventDefault();

                    previousSearchResult();

                    return;

                }


                const resultButton =
                    event.target.closest(
                        "[data-search-index]"
                    );


                if (
                    resultButton
                ) {

                    event.preventDefault();


                    const index =
                        Number(
                            resultButton.dataset.searchIndex
                        );


                    openSearchResult(
                        index
                    );

                }

            }
        );

    }


    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    function bindSearchKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                /*
                 * Ctrl/Cmd + F
                 */

                if (
                    (
                        event.ctrlKey ||
                        event.metaKey
                    ) &&
                    event.key.toLowerCase() ===
                    "f"
                ) {

                    event.preventDefault();

                    openSearch();

                    return;

                }


                /*
                 * Search result navigation
                 */

                if (
                    state.searchOpen &&
                    event.key ===
                    "Enter"
                ) {

                    if (
                        event.shiftKey
                    ) {

                        previousSearchResult();

                    } else {

                        nextSearchResult();

                    }

                }

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.search =
        performSearch;

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

    R.openSearchResult =
        openSearchResult;

    R.clearSearch =
        clearSearchHighlights;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeSearch() {

        bindSearchInput();

        bindSearchActions();

        bindSearchKeyboard();

        updateSearchStatus();


        console.log(
            "Reader search engine loaded — Part 7/14."
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
                once: true
            }
        );

    } else {

        initializeSearch();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 8 / 14

   PAGE NAVIGATION ENGINE
   - Previous / Next page
   - First / Last page
   - Page number input
   - Progress tracking
   - Mobile-friendly navigation
   - Keyboard navigation
   - URL/hash synchronization
   - History support
   - Safe PDF.js integration
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error(
            "ChishtiReader core missing."
        );
        return;
    }

    const state = R.state;


    /* =====================================================
       NAVIGATION STATE
    ===================================================== */

    state.currentPage =
        Number(state.currentPage) || 1;

    state.totalPages =
        Number(state.totalPages) || 0;

    state.pageChanging =
        false;

    state.pageChangeToken =
        0;

    state.navigationReady =
        false;

    state.pageHistory =
        Array.isArray(
            state.pageHistory
        )
            ? state.pageHistory
            : [];

    state.pageHistoryIndex =
        Number(
            state.pageHistoryIndex
        ) || -1;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const $ =
        selector =>
            document.querySelector(
                selector
            );


    const $$ =
        selector =>
            document.querySelectorAll(
                selector
            );


    function getViewport() {

        return $(
            ".reader-viewport"
        );

    }


    function getPageInput() {

        return $(
            ".page-number-input, [data-page-input], #pageNumberInput"
        );

    }


    function getCurrentPageLabels() {

        return $$(
            ".current-page, [data-current-page]"
        );

    }


    function getTotalPageLabels() {

        return $$(
            ".total-pages, [data-total-pages]"
        );

    }


    function getProgressBars() {

        return $$(
            ".reader-progress-bar, [data-reader-progress]"
        );

    }


    function getProgressText() {

        return $$(
            ".reader-progress-text, [data-progress-text]"
        );

    }


    /* =====================================================
       NUMBER HELPERS
    ===================================================== */

    function normalizePage(
        page
    ) {

        let value =
            parseInt(
                page,
                10
            );


        if (
            !Number.isFinite(
                value
            )
        ) {

            value = 1;

        }


        const total =
            Number(
                state.totalPages
            );


        if (
            total > 0
        ) {

            value =
                Math.max(
                    1,
                    Math.min(
                        total,
                        value
                    )
                );

        } else {

            value =
                Math.max(
                    1,
                    value
                );

        }


        return value;

    }


    /* =====================================================
       GET TOTAL PAGES
    ===================================================== */

    function detectTotalPages() {

        /*
         * PDF.js document
         */

        if (
            state.pdfDocument &&
            Number(
                state.pdfDocument.numPages
            ) > 0
        ) {

            state.totalPages =
                state.pdfDocument.numPages;

            return state.totalPages;

        }


        /*
         * Existing state values
         */

        if (
            Number(
                state.pageCount
            ) > 0
        ) {

            state.totalPages =
                Number(
                    state.pageCount
                );

            return state.totalPages;

        }


        if (
            Number(
                state.total
            ) > 0
        ) {

            state.totalPages =
                Number(
                    state.total
                );

            return state.totalPages;

        }


        /*
         * DOM fallback
         */

        const totalElement =
            $(
                "[data-total-pages]"
            );


        if (
            totalElement
        ) {

            const total =
                parseInt(
                    totalElement.textContent,
                    10
                );


            if (
                Number.isFinite(
                    total
                ) &&
                total > 0
            ) {

                state.totalPages =
                    total;

                return total;

            }

        }


        return (
            Number(
                state.totalPages
            ) || 0
        );

    }


    /* =====================================================
       UPDATE PAGE LABELS
    ===================================================== */

    function updatePageLabels() {

        const current =
            normalizePage(
                state.currentPage
            );


        const total =
            detectTotalPages();


        getCurrentPageLabels()
            .forEach(
                element => {

                    element.textContent =
                        String(
                            current
                        );

                }
            );


        getTotalPageLabels()
            .forEach(
                element => {

                    element.textContent =
                        total > 0
                            ? String(
                                total
                            )
                            : "—";

                }
            );


        const input =
            getPageInput();


        if (
            input &&
            document.activeElement !==
            input
        ) {

            input.value =
                String(
                    current
                );

        }

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress() {

        const total =
            detectTotalPages();


        const current =
            normalizePage(
                state.currentPage
            );


        let percent =
            0;


        if (
            total > 1
        ) {

            percent =
                (
                    (
                        current - 1
                    ) /
                    (
                        total - 1
                    )
                ) *
                100;

        } else if (
            total === 1
        ) {

            percent =
                100;

        }


        percent =
            Math.max(
                0,
                Math.min(
                    100,
                    percent
                )
            );


        getProgressBars()
            .forEach(
                bar => {

                    /*
                     * Support normal progress
                     * elements.
                     */

                    if (
                        bar.tagName ===
                        "PROGRESS"
                    ) {

                        bar.max =
                            100;

                        bar.value =
                            percent;

                    }


                    bar.style.setProperty(
                        "--reader-progress",
                        `${percent}%`
                    );


                    bar.style.width =
                        `${percent}%`;


                    bar.setAttribute(
                        "aria-valuenow",
                        String(
                            Math.round(
                                percent
            );


        getProgressText()
            .forEach(
                element => {

                    element.textContent =
                        `${Math.round(
                            percent
                        )}%`;

                }
            );


        const reader =
            $(
                ".reader"
            );


        if (
            reader
        ) {

            reader.style.setProperty(
                "--reader-progress",
                `${percent}%`
            );

            reader.dataset.progress =
                String(
                    Math.round(
                        percent
                    )
                );

        }

    }


    /* =====================================================
       UPDATE NAVIGATION BUTTONS
    ===================================================== */

    function updateNavigationButtons() {

        const current =
            normalizePage(
                state.currentPage
            );


        const total =
            detectTotalPages();


        const atFirst =
            current <= 1;


        const atLast =
            total > 0 &&
            current >= total;


        $$(
            "[data-page-prev], [data-action='previous-page']"
        )
            .forEach(
                button => {

                    button.disabled =
                        atFirst;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            atFirst
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
                        atLast;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            atLast
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
                        atFirst;

                }
            );


        $$(
            "[data-page-last]"
        )
            .forEach(
                button => {

                    button.disabled =
                        atLast;

                }
            );

    }


    /* =====================================================
       UPDATE ALL NAVIGATION UI
    ===================================================== */

    function updateNavigationUI() {

        updatePageLabels();

        updateProgress();

        updateNavigationButtons();

        state.navigationReady =
            true;

    }


    /* =====================================================
       SAVE CURRENT PAGE
    ===================================================== */

    function saveCurrentPage() {

        try {

            localStorage.setItem(
                "chishtilib_current_page",
                String(
                    state.currentPage
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       RESTORE CURRENT PAGE
    ===================================================== */

    function restoreCurrentPage() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_current_page"
                );


            if (
                saved !== null
            ) {

                const page =
                    parseInt(
                        saved,
                        10
                    );


                if (
                    Number.isFinite(
                        page
                    ) &&
                    page > 0
                ) {

                    state.currentPage =
                        page;

                }

            }

        } catch (_) {}

    }


    /* =====================================================
       UPDATE HASH
    ===================================================== */

    function updatePageHash(
        page,
        replace = true
    ) {

        const cleanPage =
            normalizePage(
                page
            );


        const hash =
            `#page=${cleanPage}`;


        try {

            if (
                replace
            ) {

                history.replaceState(
                    {
                        page:
                            cleanPage
                    },
                    "",
                    hash
                );

            } else {

                history.pushState(
                    {
                        page:
                            cleanPage
                    },
                    "",
                    hash
                );

            }

        } catch (_) {

            /*
             * Very old / restricted browsers.
             */

            try {

                window.location.hash =
                    `page=${cleanPage}`;

            } catch (_) {}

        }

    }


    /* =====================================================
       READ PAGE FROM HASH
    ===================================================== */

    function getPageFromHash() {

        const hash =
            window.location.hash;


        if (
            !hash
        ) {

            return null;

        }


        const match =
            hash.match(
                /page\s*=\s*(\d+)/i
            );


        if (
            !match
        ) {

            return null;

        }


        const page =
            parseInt(
                match[1],
                10
            );


        return Number.isFinite(
            page
        )
            ? page
            : null;

    }


    /* =====================================================
       HISTORY
    ===================================================== */

    function pushPageHistory(
        page
    ) {

        const cleanPage =
            normalizePage(
                page
            );


        const previous =
            state.pageHistory[
                state.pageHistory.length - 1
            ];


        if (
            previous ===
            cleanPage
        ) {

            return;

        }


        state.pageHistory.push(
            cleanPage
        );


        if (
            state.pageHistory.length >
            50
        ) {

            state.pageHistory.shift();

        }


        state.pageHistoryIndex =
            state.pageHistory.length - 1;

    }


    /* =====================================================
       FIND PDF RENDERER
    ===================================================== */

    function findRenderer() {

        if (
            typeof R.renderPage ===
            "function"
        ) {

            return R.renderPage;

        }


        if (
            typeof R.renderPDFPage ===
            "function"
        ) {

            return R.renderPDFPage;

        }


        if (
            typeof R.renderPdfPage ===
            "function"
        ) {

            return R.renderPdfPage;

        }


        if (
            typeof R.showPage ===
            "function"
        ) {

            return R.showPage;

        }


        return null;

    }


    /* =====================================================
       WAIT FOR PDF PAGE
    ===================================================== */

    function wait(
        milliseconds
    ) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
        );

    }


    /* =====================================================
       RENDER PAGE
    ===================================================== */

    async function renderPage(
        page
    ) {

        const renderer =
            findRenderer();


        if (
            renderer
        ) {

            try {

                const result =
                    renderer(
                        page
                    );


                if (
                    result &&
                    typeof result.then ===
                    "function"
                ) {

                    await result;

                }


                return true;

            } catch (error) {

                console.error(
                    "Page renderer failed:",
                    error
                );

                return false;

            }

        }


        /*
         * Fallback:
         * If another part of the reader
         * already renders based on state,
         * dispatch an event.
         */

        document.dispatchEvent(
            new CustomEvent(
                "reader:pagechange",
                {
                    detail: {
                        page
                    }
                }
            )
        );


        await wait(
            20
        );


        return true;

    }


    /* =====================================================
       SCROLL TO PAGE
    ===================================================== */

    function scrollToPage(
        behavior = "smooth"
    ) {

        const viewport =
            getViewport();


        if (
            !viewport
        ) {

            return;

        }


        try {

            viewport.scrollTo({
                top: 0,
                left: 0,
                behavior
            });

        } catch (_) {

            viewport.scrollTop =
                0;

            viewport.scrollLeft =
                0;

        }

    }


    /* =====================================================
       CHANGE PAGE
    ===================================================== */

    async function goToPage(
        page,
        options = {}
    ) {

        const total =
            detectTotalPages();


        let target =
            normalizePage(
                page
            );


        if (
            total <= 0
        ) {

            target =
                Math.max(
                    1,
                    parseInt(
                        page,
                        10
                    ) || 1
                );

        }


        const oldPage =
            state.currentPage;


        if (
            target ===
            oldPage &&
            !options.force
        ) {

            updateNavigationUI();

            return target;

        }


        const token =
            ++state.pageChangeToken;


        state.pageChanging =
            true;


        state.currentPage =
            target;


        updateNavigationUI();


        /*
         * Render requested page.
         */

        await renderPage(
            target
        );


        /*
         * Ignore stale page request.
         */

        if (
            token !==
            state.pageChangeToken
        ) {

            return target;

        }


        /*
         * Give renderer one frame.
         */

        await new Promise(
            resolve =>
                requestAnimationFrame(
                    resolve
                )
        );


        scrollToPage(
            options.instant
                ? "auto"
                : "smooth"
        );


        state.pageChanging =
            false;


        updateNavigationUI();

        saveCurrentPage();


        /*
         * Update URL.
         */

        if (
            options.history ===
            false
        ) {

            updatePageHash(
                target,
                true
            );

        } else {

            updatePageHash(
                target,
                options.replaceHistory !==
                    false
            );

        }


        /*
         * Add to internal history.
         */

        if (
            options.recordHistory !==
            false
        ) {

            pushPageHistory(
                target
            );

        }


        /*
         * Notify all other modules.
         */

        document.dispatchEvent(
            new CustomEvent(
                "reader:page-rendered",
                {
                    detail: {
                        page:
                            target,

                        previousPage:
                            oldPage,

                        totalPages:
                            state.totalPages
                    }
                }
            )
        );


        /*
         * Search module can highlight
         * the new page.
         */

        if (
            state.searchQuery &&
            typeof R.search ===
            "function"
        ) {

            /*
             * Do not restart the whole search.
             * Just allow existing search module
             * to react to the rendered page.
             */

            document.dispatchEvent(
                new CustomEvent(
                    "reader:search-page-ready",
                    {
                        detail: {
                            page:
                                target,

                            query:
                                state.searchQuery
                        }
                    }
                )
            );

        }


        /*
         * Restore zoom after rendering.
         */

        if (
            typeof R.applyZoom ===
            "function"
        ) {

            window.requestAnimationFrame(
                () => {

                    R.applyZoom(
                        state.zoom,
                        {
                            keepFit:
                                state.fitMode
                        }
                    );

                }
            );

        }


        return target;

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    async function nextPage() {

        const total =
            detectTotalPages();


        const current =
            normalizePage(
                state.currentPage
            );


        if (
            total > 0 &&
            current >= total
        ) {

            return current;

        }


        return goToPage(
            current + 1
        );

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    async function previousPage() {

        const current =
            normalizePage(
                state.currentPage
            );


        if (
            current <= 1
        ) {

            return current;

        }


        return goToPage(
            current - 1
        );

    }


    /* =====================================================
       FIRST PAGE
    ===================================================== */

    async function firstPage() {

        return goToPage(
            1
        );

    }


    /* =====================================================
       LAST PAGE
    ===================================================== */

    async function lastPage() {

        const total =
            detectTotalPages();


        if (
            total <= 0
        ) {

            return state.currentPage;

        }


        return goToPage(
            total
        );

    }


    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function bindPageInput() {

        const input =
            getPageInput();


        if (
            !input ||
            input.dataset.pageBound ===
            "true"
        ) {

            return;

        }


        input.dataset.pageBound =
            "true";


        input.addEventListener(
            "focus",
            () => {

                input.select();

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


                    const page =
                        normalizePage(
                            input.value
                        );


                    goToPage(
                        page
                    );


                    input.blur();

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    input.value =
                        state.currentPage;

                    input.blur();

                }

            }
        );


        input.addEventListener(
            "change",
            () => {

                const page =
                    normalizePage(
                        input.value
                    );


                goToPage(
                    page
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION BUTTONS
    ===================================================== */

    function bindNavigationButtons() {

        document.addEventListener(
            "click",
            event => {

                const next =
                    event.target.closest(
                        "[data-page-next], [data-action='next-page']"
                    );


                if (
                    next
                ) {

                    event.preventDefault();

                    nextPage();

                    return;

                }


                const previous =
                    event.target.closest(
                        "[data-page-prev], [data-action='previous-page']"
                    );


                if (
                    previous
                ) {

                    event.preventDefault();

                    previousPage();

                    return;

                }


                const first =
                    event.target.closest(
                        "[data-page-first]"
                    );


                if (
                    first
                ) {

                    event.preventDefault();

                    firstPage();

                    return;

                }


                const last =
                    event.target.closest(
                        "[data-page-last]"
                    );


                if (
                    last
                ) {

                    event.preventDefault();

                    lastPage();

                    return;

                }


                const pageButton =
                    event.target.closest(
                        "[data-go-page]"
                    );


                if (
                    pageButton
                ) {

                    event.preventDefault();


                    const page =
                        pageButton.dataset.goPage;


                    goToPage(
                        page
                    );

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

                const target =
                    event.target;


                /*
                 * Don't hijack typing.
                 */

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


                /*
                 * Don't interfere with
                 * browser shortcuts.
                 */

                if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
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

                        event.preventDefault();

                        firstPage();

                        break;


                    case "End":

                        event.preventDefault();

                        lastPage();

                        break;

                }

            }
        );

    }


    /* =====================================================
       SWIPE NAVIGATION
    ===================================================== */

    let touchStartX =
        null;

    let touchStartY =
        null;

    let touchStartTime =
        null;


    function bindSwipeNavigation() {

        const viewport =
            getViewport();


        if (
            !viewport
        ) {

            return;

        }


        viewport.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length !==
                    1
                ) {

                    return;

                }


                const touch =
                    event.touches[0];


                touchStartX =
                    touch.clientX;


                touchStartY =
                    touch.clientY;


                touchStartTime =
                    Date.now();

            },
            {
                passive: true
            }
        );


        viewport.addEventListener(
            "touchend",
            event => {

                if (
                    touchStartX ===
                    null
                ) {

                    return;

                }


                if (
                    event.changedTouches.length !==
                    1
                ) {

                    return;

                }


                const touch =
                    event.changedTouches[0];


                const endX =
                    touch.clientX;


                const endY =
                    touch.clientY;


                const deltaX =
                    endX -
                    touchStartX;


                const deltaY =
                    endY -
                    touchStartY;


                const elapsed =
                    Date.now() -
                    touchStartTime;


                touchStartX =
                    null;

                touchStartY =
                    null;

                touchStartTime =
                    null;


                /*
                 * Ignore vertical gestures.
                 */

                if (
                    Math.abs(deltaX) <
                    Math.abs(deltaY)
                ) {

                    return;

                }


                /*
                 * Minimum swipe.
                 */

                if (
                    Math.abs(deltaX) <
                    55
                ) {

                    return;

                }


                /*
                 * Don't trigger on very slow
                 * dragging gestures.
                 */

                if (
                    elapsed >
                    900
                ) {

                    return;

                }


                if (
                    deltaX < 0
                ) {

                    nextPage();

                } else {

                    previousPage();

                }

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       BROWSER HISTORY
    ===================================================== */

    function bindBrowserHistory() {

        window.addEventListener(
            "popstate",
            event => {

                const page =
                    event.state?.page ||
                    getPageFromHash();


                if (
                    page
                ) {

                    goToPage(
                        page,
                        {
                            history:
                                false,

                            recordHistory:
                                false,

                            replaceHistory:
                                true,

                            instant:
                                true
                        }
                    );

                }

            }
        );


        window.addEventListener(
            "hashchange",
            () => {

                const page =
                    getPageFromHash();


                if (
                    page &&
                    page !==
                    state.currentPage
                ) {

                    goToPage(
                        page,
                        {
                            history:
                                false,

                            recordHistory:
                                false,

                            instant:
                                true
                        }
                    );

                }

            }
        );

    }


    /* =====================================================
       LOAD INITIAL PAGE
    ===================================================== */

    async function loadInitialPage() {

        detectTotalPages();


        const hashPage =
            getPageFromHash();


        if (
            hashPage
        ) {

            state.currentPage =
                normalizePage(
                    hashPage
                );

        } else {

            restoreCurrentPage();

            state.currentPage =
                normalizePage(
                    state.currentPage
                );

        }


        updateNavigationUI();


        /*
         * If PDF is already ready,
         * render initial page.
         */

        if (
            state.pdfDocument
        ) {

            await goToPage(
                state.currentPage,
                {
                    force:
                        true,

                    history:
                        false,

                    recordHistory:
                        false,

                    instant:
                        true
                }
            );

        }

    }


    /* =====================================================
       LISTEN FOR PDF READY
    ===================================================== */

    function bindPDFReady() {

        document.addEventListener(
            "reader:pdf-ready",
            event => {

                const pdf =
                    event.detail?.pdf ||
                    event.detail?.document ||
                    state.pdfDocument;


                if (
                    pdf
                ) {

                    state.pdfDocument =
                        pdf;


                    state.totalPages =
                        pdf.numPages;


                    updateNavigationUI();


                    loadInitialPage();

                }

            }
        );


        document.addEventListener(
            "reader:document-ready",
            event => {

                const pdf =
                    event.detail?.pdf ||
                    event.detail?.document;


                if (
                    pdf
                ) {

                    state.pdfDocument =
                        pdf;


                    state.totalPages =
                        pdf.numPages;


                    updateNavigationUI();

                }

            }
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

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

    R.detectTotalPages =
        detectTotalPages;

    R.updateNavigationUI =
        updateNavigationUI;

    R.updateProgress =
        updateProgress;


    /*
     * Compatibility aliases.
     */

    R.next =
        nextPage;

    R.prev =
        previousPage;

    R.gotoPage =
        goToPage;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeNavigation() {

        detectTotalPages();

        bindPageInput();

        bindNavigationButtons();

        bindKeyboardNavigation();

        bindSwipeNavigation();

        bindBrowserHistory();

        bindPDFReady();


        updateNavigationUI();


        /*
         * If another part has already loaded
         * the PDF, initialize immediately.
         */

        if (
            state.pdfDocument
        ) {

            state.totalPages =
                state.pdfDocument.numPages;

        }


        const initialHashPage =
            getPageFromHash();


        if (
            initialHashPage
        ) {

            state.currentPage =
                normalizePage(
                    initialHashPage
                );

        } else {

            restoreCurrentPage();

        }


        updateNavigationUI();


        console.log(
            "Page navigation engine loaded — Part 8/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavigation,
            {
                once: true
            }
        );

    } else {

        initializeNavigation();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 9 / 14

   PAGE NAVIGATION ENGINE
   NEXT / PREVIOUS
   FIRST / LAST
   PAGE INPUT
   PAGE COUNTER
   MOBILE SAFE NAVIGATION
   URL / HISTORY SUPPORT
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error(
            "ChishtiReader core missing."
        );
        return;
    }

    const state = R.state;


    /* =====================================================
       NAVIGATION STATE
    ===================================================== */

    state.currentPage =
        Number(state.currentPage) || 1;

    state.totalPages =
        Number(state.totalPages) || 1;

    state.navigationBusy =
        false;

    state.navigationQueue =
        Promise.resolve();

    state.lastNavigationTime =
        0;

    state.pageHistory =
        Array.isArray(
            state.pageHistory
        )
            ? state.pageHistory
            : [];

    state.pageHistoryIndex =
        Number(
            state.pageHistoryIndex
        );

    if (
        !Number.isFinite(
            state.pageHistoryIndex
        )
    ) {

        state.pageHistoryIndex =
            -1;

    }


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getPageInput() {

        return document.querySelector(
            [
                ".page-number-input",
                "[data-page-input]",
                "#pageNumber",
                "#pageInput"
            ].join(",")
        );

    }


    function getPageCurrentLabels() {

        return document.querySelectorAll(
            [
                ".current-page",
                ".page-current",
                "[data-current-page]",
                "[data-page-current]"
            ].join(",")
        );

    }


    function getPageTotalLabels() {

        return document.querySelectorAll(
            [
                ".total-pages",
                ".page-total",
                "[data-total-pages]",
                "[data-page-total]"
            ].join(",")
        );

    }


    function getPageCounterLabels() {

        return document.querySelectorAll(
            [
                ".page-counter",
                "[data-page-counter]"
            ].join(",")
        );

    }


    function getPrevButtons() {

        return document.querySelectorAll(
            [
                "[data-page-prev]",
                "[data-prev-page]",
                "[data-action='previous-page']",
                "[data-action='prev-page']"
            ].join(",")
        );

    }


    function getNextButtons() {

        return document.querySelectorAll(
            [
                "[data-page-next]",
                "[data-next-page]",
                "[data-action='next-page']"
            ].join(",")
        );

    }


    /* =====================================================
       SAFE PAGE NUMBER
    ===================================================== */

    function clampPage(
        page
    ) {

        let value =
            Number(page);


        if (
            !Number.isFinite(value)
        ) {

            value =
                state.currentPage || 1;

        }


        value =
            Math.round(value);


        const total =
            Math.max(
                1,
                Number(
                    state.totalPages
                ) || 1
            );


        value =
            Math.max(
                1,
                value
            );


        value =
            Math.min(
                total,
                value
            );


        return value;

    }


    /* =====================================================
       UPDATE TOTAL PAGES
    ===================================================== */

    function setTotalPages(
        total
    ) {

        let value =
            Number(total);


        if (
            !Number.isFinite(value)
        ) {

            value = 1;

        }


        value =
            Math.max(
                1,
                Math.floor(value)
            );


        state.totalPages =
            value;


        /*
         * Current page must always remain valid.
         */

        state.currentPage =
            clampPage(
                state.currentPage
            );


        updatePageUI();

    }


    /* =====================================================
       UPDATE PAGE UI
    ===================================================== */

    function updatePageUI() {

        const current =
            clampPage(
                state.currentPage
            );


        const total =
            Math.max(
                1,
                Number(
                    state.totalPages
                ) || 1
            );


        state.currentPage =
            current;


        /*
         * Current page labels
         */

        getPageCurrentLabels()
            .forEach(
                element => {

                    element.textContent =
                        String(
                            current
                        );

                }
            );


        /*
         * Total page labels
         */

        getPageTotalLabels()
            .forEach(
                element => {

                    element.textContent =
                        String(
                            total
                        );

                }
            );


        /*
         * Combined counters
         */

        getPageCounterLabels()
            .forEach(
                element => {

                    element.textContent =
                        `${current} / ${total}`;

                }
            );


        /*
         * Page input
         */

        const input =
            getPageInput();


        if (
            input
        ) {

            input.min =
                "1";

            input.max =
                String(total);

            input.value =
                String(current);

        }


        /*
         * Previous buttons
         */

        getPrevButtons()
            .forEach(
                button => {

                    button.disabled =
                        current <= 1;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            current <= 1
                        )
                    );

                }
            );


        /*
         * Next buttons
         */

        getNextButtons()
            .forEach(
                button => {

                    button.disabled =
                        current >= total;

                    button.setAttribute(
                        "aria-disabled",
                        String(
                            current >= total
                        )
                    );

                }
            );


        /*
         * Progress bar
         */

        document
            .querySelectorAll(
                [
                    "[data-page-progress]",
                    ".page-progress-bar"
                ].join(",")
            )
            .forEach(
                element => {

                    const percent =
                        total <= 1
                            ? 100
                            : (
                                (
                                    current - 1
                                ) /
                                (
                                    total - 1
                                )
                            ) *
                            100;


                    element.style.width =
                        `${Math.max(
                            0,
                            Math.min(
                                100,
                                percent
                            )
                        )}%`;

                }
            );


        /*
         * Accessibility
         */

        const reader =
            document.querySelector(
                ".reader"
            );


        if (
            reader
        ) {

            reader.setAttribute(
                "aria-label",
                `Reader page ${current} of ${total}`
            );

        }

    }


    /* =====================================================
       SAVE CURRENT PAGE
    ===================================================== */

    function saveCurrentPage() {

        try {

            const bookKey =
                state.bookId ||
                state.bookTitle ||
                "default";


            localStorage.setItem(
                `chishtilib_page_${bookKey}`,
                String(
                    state.currentPage
                )
            );


            localStorage.setItem(
                "chishtilib_current_page",
                String(
                    state.currentPage
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       RESTORE CURRENT PAGE
    ===================================================== */

    function restoreCurrentPage() {

        try {

            const bookKey =
                state.bookId ||
                state.bookTitle ||
                "default";


            let saved =
                localStorage.getItem(
                    `chishtilib_page_${bookKey}`
                );


            if (
                saved === null
            ) {

                saved =
                    localStorage.getItem(
                        "chishtilib_current_page"
                    );

            }


            if (
                saved !== null
            ) {

                const page =
                    Number(saved);


                if (
                    Number.isFinite(
                        page
                    )
                ) {

                    state.currentPage =
                        clampPage(
                            page
                        );

                }

            }

        } catch (_) {}

    }


    /* =====================================================
       HISTORY
    ===================================================== */

    function pushPageHistory(
        page
    ) {

        page =
            clampPage(page);


        /*
         * Don't add duplicate consecutive pages.
         */

        if (
            state.pageHistory[
                state.pageHistory.length - 1
            ] === page
        ) {

            return;

        }


        /*
         * If user went back and then navigates
         * somewhere else, discard the forward path.
         */

        if (
            state.pageHistoryIndex >= 0 &&
            state.pageHistoryIndex <
            state.pageHistory.length - 1
        ) {

            state.pageHistory =
                state.pageHistory.slice(
                    0,
                    state.pageHistoryIndex + 1
                );

        }


        state.pageHistory.push(
            page
        );


        /*
         * Prevent unlimited memory growth.
         */

        if (
            state.pageHistory.length >
            100
        ) {

            state.pageHistory.shift();

        }


        state.pageHistoryIndex =
            state.pageHistory.length - 1;

    }


    /* =====================================================
       ACTUAL PAGE RENDER
    ===================================================== */

    async function renderPage(
        page
    ) {

        /*
         * Prefer existing reader/PDF engine.
         */

        if (
            typeof R.renderPage ===
            "function"
        ) {

            return await R.renderPage(
                page
            );

        }


        if (
            typeof R.renderPDFPage ===
            "function"
        ) {

            return await R.renderPDFPage(
                page
            );

        }


        if (
            typeof R.displayPage ===
            "function"
        ) {

            return await R.displayPage(
                page
            );

        }


        /*
         * If another part of the application
         * handles rendering, don't create a
         * second competing renderer.
         */

        if (
            state.pdfDocument &&
            typeof window.pdfjsLib !==
            "undefined"
        ) {

            return await fallbackPDFRender(
                page
            );

        }


        return null;

    }


    /* =====================================================
       FALLBACK PDF RENDERER
    ===================================================== */

    async function fallbackPDFRender(
        pageNumber
    ) {

        if (
            !state.pdfDocument
        ) {

            return null;

        }


        const canvas =
            document.querySelector(
                ".reader-canvas, canvas[data-reader-canvas]"
            );


        if (
            !canvas
        ) {

            return null;

        }


        const pdfPage =
            await state.pdfDocument.getPage(
                pageNumber
            );


        const viewport =
            pdfPage.getViewport({
                scale:
                    Number(
                        state.zoom
                    ) || 1
            });


        const ratio =
            window.devicePixelRatio ||
            1;


        canvas.width =
            Math.floor(
                viewport.width *
                ratio
            );


        canvas.height =
            Math.floor(
                viewport.height *
                ratio
            );


        canvas.style.width =
            `${viewport.width}px`;


        canvas.style.height =
            `${viewport.height}px`;


        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false
                }
            );


        if (
            !context
        ) {

            return null;

        }


        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        await pdfPage.render({
            canvasContext:
                context,

            viewport:
                viewport
        }).promise;


        state.renderedPage =
            pageNumber;


        return pdfPage;

    }


    /* =====================================================
       MAIN GO TO PAGE
    ===================================================== */

    async function goToPage(
        page,
        options = {}
    ) {

        const target =
            clampPage(page);


        /*
         * Avoid rendering the same page again
         * unless explicitly requested.
         */

        if (
            target ===
            state.currentPage &&
            !options.force
        ) {

            updatePageUI();

            return;

        }


        /*
         * Queue navigation so fast tapping on
         * mobile doesn't create race conditions.
         */

        state.navigationQueue =
            state.navigationQueue
                .catch(
                    () => {}
                )
                .then(
                    () =>
                        performPageNavigation(
                            target,
                            options
                        )
                );


        return state.navigationQueue;

    }


    /* =====================================================
       PERFORM PAGE NAVIGATION
    ===================================================== */

    async function performPageNavigation(
        target,
        options
    ) {

        if (
            state.navigationBusy
        ) {

            /*
             * Wait a frame before continuing.
             */

            await new Promise(
                resolve =>
                    requestAnimationFrame(
                        resolve
                    )
            );

        }


        state.navigationBusy =
            true;


        const previous =
            state.currentPage;


        state.currentPage =
            target;


        updatePageUI();


        /*
         * Small visual transition.
         */

        const page =
            document.querySelector(
                ".reader-page"
            );


        if (
            page &&
            !window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches
        ) {

            page.classList.add(
                "page-changing"
            );

        }


        try {

            await renderPage(
                target
            );


            state.currentPage =
                target;


            updatePageUI();


            saveCurrentPage();


            /*
             * Add history only when requested.
             */

            if (
                options.history !==
                false
            ) {

                pushPageHistory(
                    target
                );

            }


            /*
             * Notify external components.
             */

            if (
                typeof R.emit ===
                "function"
            ) {

                R.emit(
                    "pagechange",
                    {
                        page:
                            target,

                        previousPage:
                            previous,

                        total:
                            state.totalPages
                    }
                );

            }


            /*
             * Dispatch native event too.
             */

            document.dispatchEvent(
                new CustomEvent(
                    "chishtilib:pagechange",
                    {
                        detail: {
                            page:
                                target,

                            previousPage:
                                previous,

                            total:
                                state.totalPages
                        }
                    }
                )
            );


            /*
             * Re-apply zoom after rendering.
             */

            if (
                typeof R.applyZoom ===
                "function"
            ) {

                requestAnimationFrame(
                    () => {

                        R.applyZoom(
                            state.zoom,
                            {
                                keepFit:
                                    state.fitMode
                            }
                        );

                    }
                );

            }


            /*
             * Reapply theme/page effects.
             */

            if (
                typeof R.applyPageAppearance ===
                "function"
            ) {

                requestAnimationFrame(
                    () => {

                        R.applyPageAppearance();

                    }
                );

            }

        } catch (error) {

            /*
             * Restore previous page if rendering fails.
             */

            state.currentPage =
                previous;


            updatePageUI();


            console.error(
                "Page navigation failed:",
                error
            );

        } finally {

            const currentPageElement =
                document.querySelector(
                    ".reader-page"
                );


            currentPageElement?.classList.remove(
                "page-changing"
            );


            state.navigationBusy =
                false;

        }

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    async function nextPage() {

        if (
            state.currentPage >=
            state.totalPages
        ) {

            return;

        }


        await goToPage(
            state.currentPage + 1
        );

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    async function previousPage() {

        if (
            state.currentPage <=
            1
        ) {

            return;

        }


        await goToPage(
            state.currentPage - 1
        );

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

        await goToPage(
            state.totalPages
        );

    }


    /* =====================================================
       GO BACK IN PAGE HISTORY
    ===================================================== */

    async function goBackPage() {

        if (
            state.pageHistoryIndex <=
            0
        ) {

            return;

        }


        state.pageHistoryIndex--;


        const page =
            state.pageHistory[
                state.pageHistoryIndex
            ];


        if (
            page
        ) {

            await goToPage(
                page,
                {
                    history:
                        false
                }
            );

        }

    }


    /* =====================================================
       GO FORWARD IN PAGE HISTORY
    ===================================================== */

    async function goForwardPage() {

        if (
            state.pageHistoryIndex >=
            state.pageHistory.length - 1
        ) {

            return;

        }


        state.pageHistoryIndex++;


        const page =
            state.pageHistory[
                state.pageHistoryIndex
            ];


        if (
            page
        ) {

            await goToPage(
                page,
                {
                    history:
                        false
                }
            );

        }

    }


    /* =====================================================
       PAGE INPUT
    ===================================================== */

    function bindPageInput() {

        const input =
            getPageInput();


        if (
            !input
        ) {

            return;

        }


        if (
            input.dataset.pageBound ===
            "true"
        ) {

            return;

        }


        input.dataset.pageBound =
            "true";


        input.addEventListener(
            "focus",
            () => {

                input.select();

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


                    const page =
                        Number(
                            input.value
                        );


                    if (
                        Number.isFinite(
                            page
                        )
                    ) {

                        goToPage(
                            page
                        );

                    }


                    input.blur();

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    input.value =
                        String(
                            state.currentPage
                        );

                    input.blur();

                }

            }
        );


        input.addEventListener(
            "change",
            () => {

                const page =
                    Number(
                        input.value
                    );


                if (
                    Number.isFinite(
                        page
                    )
                ) {

                    goToPage(
                        page
                    );

                }

            }
        );

    }


    /* =====================================================
       NAVIGATION BUTTONS
    ===================================================== */

    function bindNavigationButtons() {

        document.addEventListener(
            "click",
            event => {

                const next =
                    event.target.closest(
                        [
                            "[data-page-next]",
                            "[data-next-page]",
                            "[data-action='next-page']"
                        ].join(",")
                    );


                if (
                    next
                ) {

                    event.preventDefault();

                    nextPage();

                    return;

                }


                const previous =
                    event.target.closest(
                        [
                            "[data-page-prev]",
                            "[data-prev-page]",
                            "[data-action='previous-page']",
                            "[data-action='prev-page']"
                        ].join(",")
                    );


                if (
                    previous
                ) {

                    event.preventDefault();

                    previousPage();

                    return;

                }


                const first =
                    event.target.closest(
                        "[data-first-page], [data-action='first-page']"
                    );


                if (
                    first
                ) {

                    event.preventDefault();

                    firstPage();

                    return;

                }


                const last =
                    event.target.closest(
                        "[data-last-page], [data-action='last-page']"
                    );


                if (
                    last
                ) {

                    event.preventDefault();

                    lastPage();

                    return;

                }


                const back =
                    event.target.closest(
                        "[data-page-back]"
                    );


                if (
                    back
                ) {

                    event.preventDefault();

                    goBackPage();

                    return;

                }


                const forward =
                    event.target.closest(
                        "[data-page-forward]"
                    );


                if (
                    forward
                ) {

                    event.preventDefault();

                    goForwardPage();

                    return;

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

                const target =
                    event.target;


                /*
                 * Never steal keys from text fields.
                 */

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


                /*
                 * Don't navigate while a modal
                 * or search overlay is active.
                 */

                if (
                    state.modalOpen ||
                    state.searchOpen
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

                        event.preventDefault();

                        firstPage();

                        break;


                    case "End":

                        event.preventDefault();

                        lastPage();

                        break;

                }

            }
        );

    }


    /* =====================================================
       TOUCH SWIPE
    ===================================================== */

    let swipeStartX =
        null;

    let swipeStartY =
        null;

    let swipeStartTime =
        null;


    function bindSwipeNavigation() {

        const viewport =
            document.querySelector(
                ".reader-viewport"
            );


        if (
            !viewport
        ) {

            return;

        }


        viewport.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length !==
                    1
                ) {

                    swipeStartX =
                        null;

                    return;

                }


                const touch =
                    event.touches[0];


                swipeStartX =
                    touch.clientX;


                swipeStartY =
                    touch.clientY;


                swipeStartTime =
                    Date.now();

            },
            {
                passive: true
            }
        );


        viewport.addEventListener(
            "touchend",
            event => {

                if (
                    swipeStartX ===
                    null
                ) {

                    return;

                }


                if (
                    event.changedTouches.length !==
                    1
                ) {

                    swipeStartX =
                        null;

                    return;

                }


                const touch =
                    event.changedTouches[0];


                const deltaX =
                    touch.clientX -
                    swipeStartX;


                const deltaY =
                    touch.clientY -
                    swipeStartY;


                const duration =
                    Date.now() -
                    swipeStartTime;


                swipeStartX =
                    null;


                /*
                 * Vertical movement greater than
                 * horizontal movement means scrolling,
                 * not page navigation.
                 */

                if (
                    Math.abs(deltaY) >
                    Math.abs(deltaX)
                ) {

                    return;

                }


                /*
                 * Don't trigger tiny accidental swipes.
                 */

                if (
                    Math.abs(deltaX) <
                    70
                ) {

                    return;

                }


                /*
                 * Very slow movement is ignored.
                 */

                if (
                    duration >
                    900
                ) {

                    return;

                }


                if (
                    deltaX < 0
                ) {

                    nextPage();

                } else {

                    previousPage();

                }

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       URL HASH SUPPORT
    ===================================================== */

    function readPageFromHash() {

        const hash =
            window.location.hash;


        if (
            !hash
        ) {

            return null;

        }


        const match =
            hash.match(
                /(?:page|p)[=/:-]?(\d+)/i
            );


        if (
            !match
        ) {

            return null;

        }


        const page =
            Number(
                match[1]
            );


        return Number.isFinite(
            page
        )
            ? page
            : null;

    }


    function updatePageHash(
        page
    ) {

        if (
            state.disableHashNavigation
        ) {

            return;

        }


        try {

            const url =
                new URL(
                    window.location.href
                );


            url.hash =
                `page-${page}`;


            window.history.replaceState(
                null,
                "",
                url
            );

        } catch (_) {}

    }


    /* =====================================================
       INTERCEPT PAGE CHANGE
    ===================================================== */

    document.addEventListener(
        "chishtilib:pagechange",
        event => {

            const page =
                event.detail?.page;


            if (
                page
            ) {

                updatePageHash(
                    page
                );

            }

        }
    );


    /* =====================================================
       PUBLIC API
    ===================================================== */

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

    R.setTotalPages =
        setTotalPages;

    R.updatePageUI =
        updatePageUI;

    R.saveCurrentPage =
        saveCurrentPage;

    R.restoreCurrentPage =
        restoreCurrentPage;

    R.goBackPage =
        goBackPage;

    R.goForwardPage =
        goForwardPage;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeNavigation() {

        restoreCurrentPage();

        bindPageInput();

        bindNavigationButtons();

        bindKeyboardNavigation();

        bindSwipeNavigation();


        /*
         * Try to obtain total pages from PDF.
         */

        if (
            state.pdfDocument
        ) {

            setTotalPages(
                state.pdfDocument.numPages
            );

        } else {

            updatePageUI();

        }


        /*
         * If URL contains #page-10,
         * use it after initialization.
         */

        const hashPage =
            readPageFromHash();


        if (
            hashPage
        ) {

            window.setTimeout(
                () => {

                    goToPage(
                        hashPage,
                        {
                            history:
                                false
                        }
                    );

                },
                100
            );

        }


        /*
         * Save progress when leaving page.
         */

        window.addEventListener(
            "beforeunload",
            saveCurrentPage
        );


        console.log(
            "Page navigation engine loaded — Part 9/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavigation,
            {
                once: true
            }
        );

    } else {

        initializeNavigation();

    }


})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 10 / 14
   READING PROGRESS ENGINE
   PAGE PROGRESS + BAR + PERCENTAGE + MOBILE SYNC
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;


    /* =====================================================
       PROGRESS STATE
    ===================================================== */

    state.progress = 0;

    state.pageProgress = 0;

    state.currentPageProgress = 0;

    state.totalPages = 1;

    state.progressTimer = null;

    state.progressAnimationFrame = null;

    state.lastProgressPage = 0;

    state.lastProgressValue = -1;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    function getViewport() {

        return document.querySelector(
            ".reader-viewport"
        );

    }


    function getReader() {

        return document.querySelector(
            ".reader"
        );

    }


    function getProgressBars() {

        return document.querySelectorAll(
            ".reading-progress-bar, [data-reading-progress-bar]"
        );

    }


    function getProgressFill() {

        return document.querySelectorAll(
            ".reading-progress-fill, [data-reading-progress-fill]"
        );

    }


    function getProgressText() {

        return document.querySelectorAll(
            ".reading-progress-text, [data-reading-progress-text]"
        );

    }


    function getProgressPercent() {

        return document.querySelectorAll(
            ".reading-progress-percent, [data-reading-progress-percent]"
        );

    }


    function getPageProgressText() {

        return document.querySelectorAll(
            ".page-progress-text, [data-page-progress]"
        );

    }


    function getPageIndicators() {

        return document.querySelectorAll(
            "[data-progress-page]"
        );

    }


    /* =====================================================
       NUMBER SAFETY
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


    /* =====================================================
       CLAMP
    ===================================================== */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    }


    /* =====================================================
       GET TOTAL PAGES
    ===================================================== */

    function getTotalPages() {

        let total =
            safeNumber(
                state.totalPages,
                1
            );


        if (
            state.pdfDocument &&
            state.pdfDocument.numPages
        ) {

            total =
                state.pdfDocument.numPages;

        }


        if (
            state.pageCount
        ) {

            total =
                safeNumber(
                    state.pageCount,
                    total
                );

        }


        if (
            total < 1
        ) {

            total = 1;

        }


        state.totalPages =
            total;


        return total;

    }


    /* =====================================================
       GET CURRENT PAGE
    ===================================================== */

    function getCurrentPage() {

        let page =
            safeNumber(
                state.currentPage,
                1
            );


        const total =
            getTotalPages();


        page =
            clamp(
                page,
                1,
                total
            );


        state.currentPage =
            page;


        return page;

    }


    /* =====================================================
       PAGE BASE PROGRESS
    ===================================================== */

    function calculatePageProgress() {

        const total =
            getTotalPages();

        const current =
            getCurrentPage();


        if (
            total <= 1
        ) {

            return 100;

        }


        return clamp(
            (
                (
                    current -
                    1
                ) /
                (
                    total -
                    1
                )
            ) *
            100,
            0,
            100
        );

    }


    /* =====================================================
       CURRENT PAGE SCROLL PROGRESS
    ===================================================== */

    function calculateScrollProgress() {

        const viewport =
            getViewport();


        if (
            !viewport
        ) {

            return 0;

        }


        const maxScroll =
            viewport.scrollHeight -
            viewport.clientHeight;


        if (
            maxScroll <= 0
        ) {

            return 0;

        }


        const scrollTop =
            clamp(
                viewport.scrollTop,
                0,
                maxScroll
            );


        return clamp(
            (
                scrollTop /
                maxScroll
            ) *
            100,
            0,
            100
        );

    }


    /* =====================================================
       CURRENT PAGE READING PROGRESS
    ===================================================== */

    function calculateCurrentPageProgress() {

        const page =
            document.querySelector(
                ".reader-page"
            );


        const viewport =
            getViewport();


        if (
            !page ||
            !viewport
        ) {

            return 0;

        }


        const pageRect =
            page.getBoundingClientRect();


        const viewportRect =
            viewport.getBoundingClientRect();


        /*
         * Page top relative to viewport.
         */

        const pageTop =
            pageRect.top -
            viewportRect.top;


        const pageHeight =
            pageRect.height;


        const visibleHeight =
            viewportRect.height;


        if (
            pageHeight <=
            visibleHeight
        ) {

            return 100;

        }


        const scrollDistance =
            pageHeight -
            visibleHeight;


        const progress =
            (
                -pageTop /
                scrollDistance
            ) *
            100;


        return clamp(
            progress,
            0,
            100
        );

    }


    /* =====================================================
       TOTAL READING PROGRESS
    ===================================================== */

    function calculateTotalProgress() {

        const total =
            getTotalPages();

        const current =
            getCurrentPage();


        const currentPageProgress =
            calculateCurrentPageProgress();


        state.currentPageProgress =
            currentPageProgress;


        if (
            total <= 1
        ) {

            return currentPageProgress;

        }


        /*
         * Every page has equal weight.
         */

        const completedPages =
            current - 1;


        const progress =
            (
                (
                    completedPages +
                    (
                        currentPageProgress /
                        100
                    )
                ) /
                total
            ) *
            100;


        return clamp(
            progress,
            0,
            100
        );

    }


    /* =====================================================
       UPDATE PROGRESS VALUES
    ===================================================== */

    function calculateProgress() {

        const pageProgress =
            calculatePageProgress();


        const totalProgress =
            calculateTotalProgress();


        state.pageProgress =
            pageProgress;


        state.progress =
            totalProgress;


        return {
            pageProgress,
            totalProgress,
            currentPageProgress:
                state.currentPageProgress
        };

    }


    /* =====================================================
       UPDATE PROGRESS BAR
    ===================================================== */

    function updateProgressBar(
        progress
    ) {

        const safeProgress =
            clamp(
                safeNumber(
                    progress
                ),
                0,
                100
            );


        const decimal =
            safeProgress /
            100;


        getProgressBars()
            .forEach(
                bar => {

                    bar.setAttribute(
                        "aria-valuenow",
                        String(
                            Math.round(
                                safeProgress
                            )
                        )
                    );


                    bar.setAttribute(
                        "aria-valuemin",
                        "0"
                    );


                    bar.setAttribute(
                        "aria-valuemax",
                        "100"
                    );

                }
            );


        getProgressFill()
            .forEach(
                fill => {

                    fill.style.width =
                        `${safeProgress}%`;

                    fill.style.transform =
                        `scaleX(${decimal})`;

                }
            );

    }


    /* =====================================================
       UPDATE TEXT
    ===================================================== */

    function updateProgressText(
        progress
    ) {

        const rounded =
            Math.round(
                clamp(
                    safeNumber(
                        progress
                    ),
                    0,
                    100
                )
            );


        getProgressText()
            .forEach(
                element => {

                    element.textContent =
                        `${rounded}%`;

                }
            );


        getProgressPercent()
            .forEach(
                element => {

                    element.textContent =
                        `${rounded}%`;

                }
            );


        getPageProgressText()
            .forEach(
                element => {

                    const current =
                        getCurrentPage();

                    const total =
                        getTotalPages();


                    element.textContent =
                        `${current} / ${total}`;

                }
            );

    }


    /* =====================================================
       PAGE INDICATORS
    ===================================================== */

    function updatePageIndicators() {

        const current =
            getCurrentPage();


        const total =
            getTotalPages();


        getPageIndicators()
            .forEach(
                element => {

                    element.textContent =
                        `${current} / ${total}`;


                    element.setAttribute(
                        "data-current-page",
                        String(
                            current
                        )
                    );


                    element.setAttribute(
                        "data-total-pages",
                        String(
                            total
                        )
                    );

                }
            );

    }


    /* =====================================================
       UPDATE ACCESSIBILITY
    ===================================================== */

    function updateAccessibility(
        progress
    ) {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        reader.setAttribute(
            "data-reading-progress",
            String(
                Math.round(
                    progress
                )
            )
        );


        reader.setAttribute(
            "data-current-page",
            String(
                getCurrentPage()
            )
        );


        reader.setAttribute(
            "data-total-pages",
            String(
                getTotalPages()
            )
        );

    }


    /* =====================================================
       UPDATE EVERYTHING
    ===================================================== */

    function updateProgress(
        force = false
    ) {

        const values =
            calculateProgress();


        const progress =
            values.totalProgress;


        const changed =
            force ||
            Math.abs(
                progress -
                state.lastProgressValue
            ) >= 0.15 ||
            state.lastProgressPage !==
                state.currentPage;


        if (
            !changed
        ) {

            return values;

        }


        state.lastProgressValue =
            progress;


        state.lastProgressPage =
            state.currentPage;


        updateProgressBar(
            progress
        );


        updateProgressText(
            progress
        );


        updatePageIndicators();


        updateAccessibility(
            progress
        );


        return values;

    }


    /* =====================================================
       SMOOTH PROGRESS UPDATE
    ===================================================== */

    function requestProgressUpdate() {

        if (
            state.progressAnimationFrame
        ) {

            return;

        }


        state.progressAnimationFrame =
            requestAnimationFrame(
                () => {

                    state.progressAnimationFrame =
                        null;

                    updateProgress();

                }
            );

    }


    /* =====================================================
       VIEWPORT SCROLL HANDLER
    ===================================================== */

    function handleScroll() {

        requestProgressUpdate();

    }


    /* =====================================================
       PAGE CHANGE HANDLER
    ===================================================== */

    function handlePageChange() {

        /*
         * Small delay allows the PDF/page renderer
         * to finish inserting the new page.
         */

        setTimeout(
            () => {

                state.lastProgressPage =
                    0;

                updateProgress(
                    true
                );

            },
            30
        );

    }


    /* =====================================================
       SAVE READING PROGRESS
    ===================================================== */

    function saveReadingProgress() {

        try {

            const key =
                state.bookId ||
                state.currentBookId ||
                state.bookTitle ||
                "default";


            const data = {

                page:
                    getCurrentPage(),

                totalPages:
                    getTotalPages(),

                progress:
                    Math.round(
                        state.progress *
                        100
                    ) / 100,

                currentPageProgress:
                    Math.round(
                        state.currentPageProgress *
                        100
                    ) / 100,

                timestamp:
                    Date.now()

            };


            localStorage.setItem(
                `chishtilib_progress_${key}`,
                JSON.stringify(
                    data
                )
            );


            localStorage.setItem(
                "chishtilib_last_progress",
                JSON.stringify(
                    data
                )
            );

        } catch (error) {

            console.warn(
                "Could not save reading progress.",
                error
            );

        }

    }


    /* =====================================================
       LOAD READING PROGRESS
    ===================================================== */

    function loadReadingProgress() {

        try {

            const key =
                state.bookId ||
                state.currentBookId ||
                state.bookTitle ||
                "default";


            const raw =
                localStorage.getItem(
                    `chishtilib_progress_${key}`
                );


            if (
                !raw
            ) {

                return null;

            }


            const data =
                JSON.parse(
                    raw
                );


            if (
                !data
            ) {

                return null;

            }


            return data;

        } catch (error) {

            console.warn(
                "Could not load reading progress.",
                error
            );


            return null;

        }

    }


    /* =====================================================
       RESTORE LAST PAGE
    ===================================================== */

    async function restoreReadingProgress() {

        const data =
            loadReadingProgress();


        if (
            !data
        ) {

            return false;

        }


        const page =
            safeNumber(
                data.page,
                1
            );


        if (
            page <= 1
        ) {

            return false;

        }


        /*
         * Don't interrupt a page already opened
         * by another system.
         */

        if (
            state.userSelectedPage
        ) {

            return false;

        }


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


                return true;

            } catch (error) {

                console.warn(
                    "Could not restore reading page.",
                    error
                );

            }

        }


        return false;

    }


    /* =====================================================
       PROGRESS STORAGE DEBOUNCE
    ===================================================== */

    let saveTimer =
        null;


    function scheduleProgressSave() {

        clearTimeout(
            saveTimer
        );


        saveTimer =
            setTimeout(
                () => {

                    saveReadingProgress();

                },
                400
            );

    }


    /* =====================================================
       BEFORE UNLOAD SAVE
    ===================================================== */

    function saveBeforeExit() {

        updateProgress(
            true
        );


        saveReadingProgress();

    }


    /* =====================================================
       PAGE CHANGE OBSERVER
    ===================================================== */

    function observePageChanges() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        const observer =
            new MutationObserver(
                mutations => {

                    let pageChanged =
                        false;


                    mutations.forEach(
                        mutation => {

                            if (
                                mutation.type ===
                                "childList"
                            ) {

                                pageChanged =
                                    true;

                            }

                        }
                    );


                    if (
                        pageChanged
                    ) {

                        handlePageChange();

                    }

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
       PERIODIC UPDATE
    ===================================================== */

    function startProgressTimer() {

        clearInterval(
            state.progressTimer
        );


        state.progressTimer =
            setInterval(
                () => {

                    updateProgress();

                },
                500
            );

    }


    /* =====================================================
       STOP TIMER
    ===================================================== */

    function stopProgressTimer() {

        if (
            state.progressTimer
        ) {

            clearInterval(
                state.progressTimer
            );

            state.progressTimer =
                null;

        }

    }


    /* =====================================================
       PROGRESS CLICK NAVIGATION
    ===================================================== */

    function handleProgressClick(
        event
    ) {

        const bar =
            event.target.closest(
                "[data-reading-progress-click]"
            );


        if (
            !bar
        ) {

            return;

        }


        const rect =
            bar.getBoundingClientRect();


        if (
            rect.width <= 0
        ) {

            return;

        }


        const x =
            clamp(
                event.clientX -
                rect.left,
                0,
                rect.width
            );


        const percentage =
            (
                x /
                rect.width
            );


        const total =
            getTotalPages();


        if (
            total <= 1
        ) {

            return;

        }


        let page =
            Math.round(
                percentage *
                (
                    total -
                    1
                )
            ) +
            1;


        page =
            clamp(
                page,
                1,
                total
            );


        if (
            typeof R.goToPage ===
            "function"
        ) {

            state.userSelectedPage =
                true;


            R.goToPage(
                page
            );

        }

    }


    /* =====================================================
       PAGE PROGRESS DOTS
    ===================================================== */

    function updateProgressDots() {

        const current =
            getCurrentPage();


        document
            .querySelectorAll(
                "[data-page-dot]"
            )
            .forEach(
                dot => {

                    const page =
                        safeNumber(
                            dot.dataset.pageDot,
                            0
                        );


                    dot.classList.toggle(
                        "active",
                        page ===
                        current
                    );


                    dot.classList.toggle(
                        "passed",
                        page <
                        current
                    );

                }
            );

    }


    /* =====================================================
       BUTTON ACTIONS
    ===================================================== */

    function bindProgressActions() {

        document.addEventListener(
            "click",
            event => {

                const progressBar =
                    event.target.closest(
                        "[data-reading-progress-click]"
                    );


                if (
                    progressBar
                ) {

                    handleProgressClick(
                        event
                    );

                    return;

                }


                const saveButton =
                    event.target.closest(
                        "[data-action='save-progress'], [data-save-progress]"
                    );


                if (
                    saveButton
                ) {

                    event.preventDefault();

                    updateProgress(
                        true
                    );

                    saveReadingProgress();

                    return;

                }


                const restoreButton =
                    event.target.closest(
                        "[data-action='restore-progress'], [data-restore-progress]"
                    );


                if (
                    restoreButton
                ) {

                    event.preventDefault();

                    restoreReadingProgress();

                    return;

                }

            }
        );

    }


    /* =====================================================
       EXPOSE API
    ===================================================== */

    R.updateProgress =
        updateProgress;


    R.calculateProgress =
        calculateProgress;


    R.calculateTotalProgress =
        calculateTotalProgress;


    R.saveReadingProgress =
        saveReadingProgress;


    R.loadReadingProgress =
        loadReadingProgress;


    R.restoreReadingProgress =
        restoreReadingProgress;


    R.getReadingProgress =
        () =>
            state.progress;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeProgress() {

        const viewport =
            getViewport();


        if (
            viewport
        ) {

            viewport.addEventListener(
                "scroll",
                handleScroll,
                {
                    passive: true
                }
            );

        }


        bindProgressActions();

        observePageChanges();

        startProgressTimer();


        /*
         * Save when leaving page.
         */

        window.addEventListener(
            "beforeunload",
            saveBeforeExit
        );


        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "hidden"
                ) {

                    updateProgress(
                        true
                    );

                    saveReadingProgress();

                }

            }
        );


        /*
         * Listen for custom page-change
         * events from other reader modules.
         */

        document.addEventListener(
            "reader:pagechange",
            () => {

                handlePageChange();

                scheduleProgressSave();

                updateProgressDots();

            }
        );


        /*
         * First calculation.
         */

        requestAnimationFrame(
            () => {

                updateProgress(
                    true
                );

                updateProgressDots();

            }
        );


        console.log(
            "Reading progress engine loaded — Part 10/14."
        );

    }


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
   JAVASCRIPT PART 11 / 14
   BOOKMARKS + FAVORITES + READING PROGRESS
========================================================= */

(() => {
    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;

    /* =====================================================
       STATE
    ===================================================== */

    state.bookmarks = Array.isArray(state.bookmarks)
        ? state.bookmarks
        : [];

    state.favorites = Array.isArray(state.favorites)
        ? state.favorites
        : [];

    state.readingProgress =
        Number(state.readingProgress) || 0;

    state.currentBookmark = null;

    /* =====================================================
       HELPERS
    ===================================================== */

    const storageKeys = {
        bookmarks: "chishtilib_bookmarks",
        favorites: "chishtilib_favorites",
        progress: "chishtilib_progress"
    };

    function getBookId() {
        return (
            state.bookId ||
            state.currentBookId ||
            state.book?.id ||
            state.currentBook?.id ||
            state.bookTitle ||
            "current-book"
        ).toString();
    }

    function getCurrentPage() {
        return Math.max(
            1,
            Number(
                state.currentPage ||
                state.pageNumber ||
                1
            )
        );
    }

    function getTotalPages() {
        return Math.max(
            1,
            Number(
                state.totalPages ||
                state.pageCount ||
                state.pdfDocument?.numPages ||
                1
            )
        );
    }

    function getBookTitle() {
        return (
            state.bookTitle ||
            state.book?.title ||
            state.currentBook?.title ||
            "Untitled Book"
        ).toString();
    }

    function makeBookmarkId(page) {
        return `${getBookId()}::${page}`;
    }

    /* =====================================================
       LOAD STORAGE
    ===================================================== */

    function loadBookmarks() {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(
                        storageKeys.bookmarks
                    ) || "[]"
                );

            if (Array.isArray(saved)) {
                state.bookmarks = saved;
            }
        } catch (error) {
            console.warn(
                "Bookmarks could not be loaded.",
                error
            );
        }
    }

    function loadFavorites() {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(
                        storageKeys.favorites
                    ) || "[]"
                );

            if (Array.isArray(saved)) {
                state.favorites = saved;
            }
        } catch (error) {
            console.warn(
                "Favorites could not be loaded.",
                error
            );
        }
    }

    function loadProgress() {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(
                        storageKeys.progress
                    ) || "{}"
                );

            const book =
                saved[getBookId()];

            if (book) {
                state.readingProgress =
                    Number(book.progress) || 0;
            }
        } catch (error) {
            console.warn(
                "Reading progress could not be loaded.",
                error
            );
        }
    }

    /* =====================================================
       SAVE STORAGE
    ===================================================== */

    function saveBookmarks() {
        try {
            localStorage.setItem(
                storageKeys.bookmarks,
                JSON.stringify(
                    state.bookmarks
                )
            );
        } catch (error) {
            console.warn(
                "Bookmarks could not be saved.",
                error
            );
        }
    }

    function saveFavorites() {
        try {
            localStorage.setItem(
                storageKeys.favorites,
                JSON.stringify(
                    state.favorites
                )
            );
        } catch (error) {
            console.warn(
                "Favorites could not be saved.",
                error
            );
        }
    }

    function saveProgress() {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(
                        storageKeys.progress
                    ) || "{}"
                );

            saved[getBookId()] = {
                bookId: getBookId(),
                title: getBookTitle(),
                page: getCurrentPage(),
                totalPages: getTotalPages(),
                progress:
                    state.readingProgress,
                updatedAt:
                    Date.now()
            };

            localStorage.setItem(
                storageKeys.progress,
                JSON.stringify(saved)
            );
        } catch (error) {
            console.warn(
                "Reading progress could not be saved.",
                error
            );
        }
    }

    /* =====================================================
       BOOKMARK CHECK
    ===================================================== */

    function isBookmarked(
        page = getCurrentPage()
    ) {
        const id =
            makeBookmarkId(page);

        return state.bookmarks.some(
            bookmark =>
                bookmark.id === id
        );
    }

    /* =====================================================
       ADD BOOKMARK
    ===================================================== */

    function addBookmark(
        page = getCurrentPage()
    ) {
        page =
            Math.max(
                1,
                Number(page)
            );

        const id =
            makeBookmarkId(page);

        if (isBookmarked(page)) {
            return false;
        }

        const bookmark = {
            id,
            bookId: getBookId(),
            title: getBookTitle(),
            page,
            totalPages: getTotalPages(),
            createdAt: Date.now()
        };

        state.bookmarks.push(
            bookmark
        );

        state.bookmarks.sort(
            (a, b) =>
                Number(a.page) -
                Number(b.page)
        );

        saveBookmarks();
        updateBookmarkUI();
        renderBookmarkList();

        dispatchReaderEvent(
            "bookmarkadded",
            bookmark
        );

        return true;
    }

    /* =====================================================
       REMOVE BOOKMARK
    ===================================================== */

    function removeBookmark(
        page = getCurrentPage()
    ) {
        page =
            Number(page);

        const before =
            state.bookmarks.length;

        state.bookmarks =
            state.bookmarks.filter(
                bookmark =>
                    !(
                        bookmark.bookId ===
                            getBookId() &&
                        Number(
                            bookmark.page
                        ) === page
                    )
            );

        const changed =
            before !==
            state.bookmarks.length;

        if (changed) {
            saveBookmarks();
            updateBookmarkUI();
            renderBookmarkList();
        }

        return changed;
    }

    /* =====================================================
       TOGGLE BOOKMARK
    ===================================================== */

    function toggleBookmark(
        page = getCurrentPage()
    ) {
        if (
            isBookmarked(page)
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
       GET CURRENT BOOKMARKS
    ===================================================== */

    function getCurrentBookBookmarks() {
        return state.bookmarks
            .filter(
                bookmark =>
                    bookmark.bookId ===
                    getBookId()
            )
            .sort(
                (a, b) =>
                    Number(a.page) -
                    Number(b.page)
            );
    }

    /* =====================================================
       FAVORITE CHECK
    ===================================================== */

    function isFavorite(
        bookId = getBookId()
    ) {
        return state.favorites.some(
            favorite =>
                String(
                    favorite.bookId
                ) === String(bookId)
        );
    }

    /* =====================================================
       ADD FAVORITE
    ===================================================== */

    function addFavorite(
        book = null
    ) {
        const current =
            book ||
            state.currentBook ||
            state.book ||
            {};

        const bookId =
            String(
                current.id ||
                current.bookId ||
                getBookId()
            );

        if (
            isFavorite(bookId)
        ) {
            return false;
        }

        const favorite = {
            bookId,
            title:
                current.title ||
                getBookTitle(),
            author:
                current.author ||
                current.writer ||
                "",
            cover:
                current.cover ||
                current.thumbnail ||
                "",
            addedAt:
                Date.now()
        };

        state.favorites.push(
            favorite
        );

        saveFavorites();
        updateFavoriteUI();
        renderFavoriteList();

        dispatchReaderEvent(
            "favoriteadded",
            favorite
        );

        return true;
    }

    /* =====================================================
       REMOVE FAVORITE
    ===================================================== */

    function removeFavorite(
        bookId = getBookId()
    ) {
        const before =
            state.favorites.length;

        state.favorites =
            state.favorites.filter(
                favorite =>
                    String(
                        favorite.bookId
                    ) !== String(bookId)
            );

        const changed =
            before !==
            state.favorites.length;

        if (changed) {
            saveFavorites();
            updateFavoriteUI();
            renderFavoriteList();
        }

        return changed;
    }

    /* =====================================================
       TOGGLE FAVORITE
    ===================================================== */

    function toggleFavorite() {
        if (
            isFavorite()
        ) {
            return removeFavorite();
        }

        return addFavorite();
    }

    /* =====================================================
       READING PROGRESS
    ===================================================== */

    function calculateProgress(
        page = getCurrentPage()
    ) {
        const total =
            getTotalPages();

        if (
            total <= 1
        ) {
            return 0;
        }

        const progress =
            (
                (
                    page -
                    1
                ) /
                (
                    total -
                    1
                )
            ) *
            100;

        return Math.max(
            0,
            Math.min(
                100,
                progress
            )
        );
    }

    function updateReadingProgress(
        page = getCurrentPage()
    ) {
        state.readingProgress =
            Math.round(
                calculateProgress(
                    page
                ) *
                10
            ) /
            10;

        updateProgressUI();
        saveProgress();

        dispatchReaderEvent(
            "readingprogress",
            {
                page,
                progress:
                    state.readingProgress
            }
        );

        return state.readingProgress;
    }

    /* =====================================================
       PROGRESS UI
    ===================================================== */

    function updateProgressUI() {
        const value =
            state.readingProgress;

        document
            .querySelectorAll(
                "[data-reading-progress]"
            )
            .forEach(
                element => {

                    element.style.width =
                        `${value}%`;

                    element.setAttribute(
                        "aria-valuenow",
                        String(value)
                    );
                }
            );

        document
            .querySelectorAll(
                "[data-progress-value]"
            )
            .forEach(
                element => {

                    element.textContent =
                        `${Math.round(value)}%`;
                }
            );

        document
            .querySelectorAll(
                ".reading-progress-text"
            )
            .forEach(
                element => {

                    element.textContent =
                        `${Math.round(value)}% read`;
                }
            );
    }

    /* =====================================================
       BOOKMARK UI
    ===================================================== */

    function updateBookmarkUI() {
        const active =
            isBookmarked();

        document
            .querySelectorAll(
                "[data-action='bookmark'], [data-toggle-bookmark]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        active
                    );

                    button.classList.toggle(
                        "bookmarked",
                        active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                    const label =
                        button.querySelector(
                            ".btn-label, .tool-label"
                        );

                    if (label) {
                        label.textContent =
                            active
                                ? "Bookmarked"
                                : "Bookmark";
                    }

                    const icon =
                        button.querySelector(
                            "i, .icon"
                        );

                    if (icon) {
                        icon.classList.toggle(
                            "filled",
                            active
                        );
                    }
                }
            );
    }

    /* =====================================================
       FAVORITE UI
    ===================================================== */

    function updateFavoriteUI() {
        const active =
            isFavorite();

        document
            .querySelectorAll(
                "[data-action='favorite'], [data-toggle-favorite]"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        active
                    );

                    button.classList.toggle(
                        "favorited",
                        active
                    );

                    button.setAttribute(
                        "aria-pressed",
                        String(active)
                    );

                    const label =
                        button.querySelector(
                            ".btn-label, .tool-label"
                        );

                    if (label) {
                        label.textContent =
                            active
                                ? "Favorited"
                                : "Favorite";
                    }
                }
            );
    }

    /* =====================================================
       RENDER BOOKMARKS
    ===================================================== */

    function renderBookmarkList() {
        const containers =
            document.querySelectorAll(
                "[data-bookmark-list], .bookmark-list"
            );

        if (
            !containers.length
        ) {
            return;
        }

        const bookmarks =
            getCurrentBookBookmarks();

        containers.forEach(
            container => {

                if (
                    !bookmarks.length
                ) {
                    container.innerHTML = `
                        <div class="bookmark-empty">
                            <span>No bookmarks yet.</span>
                        </div>
                    `;
                    return;
                }

                container.innerHTML =
                    bookmarks
                        .map(
                            bookmark => `
                                <div
                                    class="bookmark-item"
                                    data-bookmark-page="${bookmark.page}"
                                >
                                    <button
                                        type="button"
                                        class="bookmark-open"
                                        data-open-bookmark="${bookmark.page}"
                                    >
                                        <span class="bookmark-page">
                                            Page ${bookmark.page}
                                        </span>

                                        <span class="bookmark-title">
                                            ${escapeHTML(
                                                bookmark.title
                                            )}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        class="bookmark-delete"
                                        data-delete-bookmark="${bookmark.page}"
                                        aria-label="Remove bookmark"
                                    >
                                        ×
                                    </button>
                                </div>
                            `
                        )
                        .join("");
            }
        );
    }

    /* =====================================================
       RENDER FAVORITES
    ===================================================== */

    function renderFavoriteList() {
        const containers =
            document.querySelectorAll(
                "[data-favorite-list], .favorite-list"
            );

        if (
            !containers.length
        ) {
            return;
        }

        containers.forEach(
            container => {

                if (
                    !state.favorites.length
                ) {
                    container.innerHTML = `
                        <div class="favorite-empty">
                            <span>No favorite books yet.</span>
                        </div>
                    `;
                    return;
                }

                container.innerHTML =
                    state.favorites
                        .map(
                            favorite => `
                                <div
                                    class="favorite-item"
                                    data-favorite-id="${escapeHTML(
                                        favorite.bookId
                                    )}"
                                >
                                    <button
                                        type="button"
                                        class="favorite-open"
                                        data-open-favorite="${escapeHTML(
                                            favorite.bookId
                                        )}"
                                    >
                                        <span class="favorite-title">
                                            ${escapeHTML(
                                                favorite.title
                                            )}
                                        </span>

                                        ${
                                            favorite.author
                                                ? `
                                                    <span class="favorite-author">
                                                        ${escapeHTML(
                                                            favorite.author
                                                        )}
                                                    </span>
                                                `
                                                : ""
                                        }
                                    </button>

                                    <button
                                        type="button"
                                        class="favorite-delete"
                                        data-delete-favorite="${escapeHTML(
                                            favorite.bookId
                                        )}"
                                        aria-label="Remove favorite"
                                    >
                                        ×
                                    </button>
                                </div>
                            `
                        )
                        .join("");
            }
        );
    }

    /* =====================================================
       OPEN BOOKMARK
    ===================================================== */

    async function openBookmark(
        page
    ) {
        page =
            Number(page);

        if (
            !Number.isFinite(page)
        ) {
            return;
        }

        state.currentBookmark =
            page;

        if (
            typeof R.goToPage ===
            "function"
        ) {
            await R.goToPage(
                page
            );
        }

        updateBookmarkUI();
    }

    /* =====================================================
       FIND FAVORITE BOOK
    ===================================================== */

    function findFavorite(
        bookId
    ) {
        return state.favorites.find(
            favorite =>
                String(
                    favorite.bookId
                ) === String(bookId)
        );
    }

    /* =====================================================
       EVENT DISPATCH
    ===================================================== */

    function dispatchReaderEvent(
        name,
        detail
    ) {
        document.dispatchEvent(
            new CustomEvent(
                `chishtilib:${name}`,
                {
                    detail
                }
            )
        );
    }

    /* =====================================================
       ACTION BINDINGS
    ===================================================== */

    function bindBookmarkFavoriteActions() {

        document.addEventListener(
            "click",
            event => {

                const bookmarkButton =
                    event.target.closest(
                        "[data-action='bookmark'], [data-toggle-bookmark]"
                    );

                if (
                    bookmarkButton
                ) {
                    event.preventDefault();

                    toggleBookmark();

                    return;
                }

                const favoriteButton =
                    event.target.closest(
                        "[data-action='favorite'], [data-toggle-favorite]"
                    );

                if (
                    favoriteButton
                ) {
                    event.preventDefault();

                    toggleFavorite();

                    return;
                }

                const openBookmarkButton =
                    event.target.closest(
                        "[data-open-bookmark]"
                    );

                if (
                    openBookmarkButton
                ) {
                    event.preventDefault();

                    openBookmark(
                        Number(
                            openBookmarkButton
                                .dataset
                                .openBookmark
                        )
                    );

                    return;
                }

                const deleteBookmarkButton =
                    event.target.closest(
                        "[data-delete-bookmark]"
                    );

                if (
                    deleteBookmarkButton
                ) {
                    event.preventDefault();

                    removeBookmark(
                        Number(
                            deleteBookmarkButton
                                .dataset
                                .deleteBookmark
                        )
                    );

                    return;
                }

                const deleteFavoriteButton =
                    event.target.closest(
                        "[data-delete-favorite]"
                    );

                if (
                    deleteFavoriteButton
                ) {
                    event.preventDefault();

                    removeFavorite(
                        deleteFavoriteButton
                            .dataset
                            .deleteFavorite
                    );

                    return;
                }
            }
        );
    }

    /* =====================================================
       PAGE CHANGE HOOK
    ===================================================== */

    function bindPageProgress() {

        document.addEventListener(
            "chishtilib:pagechange",
            event => {

                const page =
                    Number(
                        event.detail?.page ||
                        getCurrentPage()
                    );

                if (
                    Number.isFinite(page)
                ) {
                    updateReadingProgress(
                        page
                    );
                }

                updateBookmarkUI();
            }
        );

        /*
         * Fallback polling for readers where the
         * page engine does not dispatch an event.
         */

        let lastPage =
            getCurrentPage();

        setInterval(
            () => {

                const current =
                    getCurrentPage();

                if (
                    current !== lastPage
                ) {

                    lastPage =
                        current;

                    updateReadingProgress(
                        current
                    );

                    updateBookmarkUI();
                }

            },
            350
        );
    }

    /* =====================================================
       KEYBOARD SHORTCUTS
    ===================================================== */

    function bindBookmarkKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.target.matches(
                        "input, textarea, select"
                    )
                ) {
                    return;
                }

                /*
                 * B = Bookmark current page
                 */

                if (
                    event.key.toLowerCase() ===
                    "b"
                ) {
                    event.preventDefault();

                    toggleBookmark();
                }

            }
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.addBookmark =
        addBookmark;

    R.removeBookmark =
        removeBookmark;

    R.toggleBookmark =
        toggleBookmark;

    R.isBookmarked =
        isBookmarked;

    R.getCurrentBookBookmarks =
        getCurrentBookBookmarks;

    R.addFavorite =
        addFavorite;

    R.removeFavorite =
        removeFavorite;

    R.toggleFavorite =
        toggleFavorite;

    R.isFavorite =
        isFavorite;

    R.updateReadingProgress =
        updateReadingProgress;

    R.getReadingProgress =
        () =>
            state.readingProgress;

    R.openBookmark =
        openBookmark;

    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeBookmarks() {

        loadBookmarks();

        loadFavorites();

        loadProgress();

        bindBookmarkFavoriteActions();

        bindPageProgress();

        bindBookmarkKeyboard();

        updateBookmarkUI();

        updateFavoriteUI();

        updateProgressUI();

        renderBookmarkList();

        renderFavoriteList();

        /*
         * Small delay allows the PDF/book engine
         * from earlier parts to finish initialization.
         */

        setTimeout(
            () => {

                updateReadingProgress();

                updateBookmarkUI();

                updateFavoriteUI();

                renderBookmarkList();

                renderFavoriteList();

            },
            250
        );

        console.log(
            "Bookmarks + favorites + reading progress loaded — Part 11/14."
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeBookmarks,
            {
                once: true
            }
        );

    } else {

        initializeBookmarks();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 12 / 14
   PAGE NAVIGATION ENGINE
   PREV / NEXT / FIRST / LAST / PAGE INPUT
   MOBILE SAFE + KEYBOARD SUPPORT
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;


    /* =====================================================
       NAVIGATION STATE
    ===================================================== */

    state.currentPage =
        Number(state.currentPage) || 1;

    state.totalPages =
        Number(state.totalPages) || 1;

    state.navigationBusy =
        false;

    state.navigationTimer =
        null;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getPageInput = () =>
        document.querySelector(
            "[data-page-input], .page-number-input, #pageNumber"
        );


    const getCurrentPageLabels = () =>
        document.querySelectorAll(
            "[data-current-page], .current-page-number, .page-current"
        );


    const getTotalPageLabels = () =>
        document.querySelectorAll(
            "[data-total-pages], .total-page-number, .page-total"
        );


    const getReader = () =>
        document.querySelector(".reader");


    /* =====================================================
       GET TOTAL PAGES
    ===================================================== */

    function getTotalPages() {

        if (
            state.pdfDocument &&
            Number.isFinite(
                Number(
                    state.pdfDocument.numPages
                )
            )
        ) {

            return Math.max(
                1,
                Number(
                    state.pdfDocument.numPages
                )
            );

        }


        if (
            Number.isFinite(
                Number(
                    state.totalPages
                )
            )
        ) {

            return Math.max(
                1,
                Number(
                    state.totalPages
                )
            );

        }


        const pages =
            document.querySelectorAll(
                ".reader-page, [data-page]"
            );


        if (
            pages.length
        ) {

            return pages.length;

        }


        return 1;

    }


    /* =====================================================
       SET TOTAL PAGES
    ===================================================== */

    function setTotalPages(
        total
    ) {

        total =
            Number(total);


        if (
            !Number.isFinite(total)
        ) {

            total = 1;

        }


        state.totalPages =
            Math.max(
                1,
                Math.floor(total)
            );


        updateNavigationUI();

    }


    /* =====================================================
       CLAMP PAGE
    ===================================================== */

    function clampPage(
        page
    ) {

        page =
            Number(page);


        if (
            !Number.isFinite(page)
        ) {

            page = 1;

        }


        const total =
            getTotalPages();


        return Math.min(
            total,
            Math.max(
                1,
                Math.floor(page)
            )
        );

    }


    /* =====================================================
       UPDATE PAGE LABELS
    ===================================================== */

    function updatePageLabels() {

        const current =
            state.currentPage;


        const total =
            getTotalPages();


        getCurrentPageLabels()
            .forEach(
                element => {

                    element.textContent =
                        String(
                            current
                        );

                }
            );


        getTotalPageLabels()
            .forEach(
                element => {

                    element.textContent =
                        String(
                            total
                        );

                }
            );


        const input =
            getPageInput();


        if (
            input &&
            document.activeElement !==
            input
        ) {

            input.value =
                String(
                    current
                );

        }


        document
            .querySelectorAll(
                "[data-page-progress]"
            )
            .forEach(
                element => {

                    const percentage =
                        total > 1
                            ? (
                                (
                                    current -
                                    1
                                ) /
                                (
                                    total -
                                    1
                                )
                            ) *
                            100
                            : 100;


                    element.style.setProperty(
                        "--page-progress",
                        `${percentage}%`
                    );

                }
            );

    }


    /* =====================================================
       UPDATE NAVIGATION BUTTONS
    ===================================================== */

    function updateNavigationButtons() {

        const current =
            state.currentPage;


        const total =
            getTotalPages();


        document
            .querySelectorAll(
                "[data-page-prev]"
            )
            .forEach(
                button => {

                    button.disabled =
                        current <= 1 ||
                        state.navigationBusy;

                }
            );


        document
            .querySelectorAll(
                "[data-page-next]"
            )
            .forEach(
                button => {

                    button.disabled =
                        current >= total ||
                        state.navigationBusy;

                }
            );


        document
            .querySelectorAll(
                "[data-page-first]"
            )
            .forEach(
                button => {

                    button.disabled =
                        current <= 1 ||
                        state.navigationBusy;

                }
            );


        document
            .querySelectorAll(
                "[data-page-last]"
            )
            .forEach(
                button => {

                    button.disabled =
                        current >= total ||
                        state.navigationBusy;

                }
            );

    }


    /* =====================================================
       UPDATE ALL NAVIGATION UI
    ===================================================== */

    function updateNavigationUI() {

        updatePageLabels();

        updateNavigationButtons();

    }


    /* =====================================================
       SCROLL READER TO TOP
    ===================================================== */

    function scrollReaderToTop(
        smooth = true
    ) {

        const viewport =
            document.querySelector(
                ".reader-viewport"
            );


        const container =
            viewport ||
            document.querySelector(
                ".reader-content"
            );


        if (
            container
        ) {

            try {

                container.scrollTo({
                    top: 0,
                    behavior:
                        smooth
                            ? "smooth"
                            : "auto"
                });

            } catch (_) {

                container.scrollTop =
                    0;

            }

        }


        window.scrollTo({
            top: 0,
            behavior:
                smooth
                    ? "smooth"
                    : "auto"
        });

    }


    /* =====================================================
       SET CURRENT PAGE
    ===================================================== */

    async function setCurrentPage(
        page,
        options = {}
    ) {

        page =
            clampPage(
                page
            );


        if (
            state.navigationBusy &&
            !options.force
        ) {

            return false;

        }


        const previousPage =
            state.currentPage;


        if (
            page ===
            previousPage &&
            !options.force
        ) {

            updateNavigationUI();

            return true;

        }


        state.navigationBusy =
            true;


        updateNavigationUI();


        try {

            /*
             * If another part already provides
             * goToPage(), use it.
             */

            if (
                typeof R.renderPage ===
                "function"
            ) {

                await R.renderPage(
                    page
                );

            } else if (
                typeof R.loadPage ===
                "function"
            ) {

                await R.loadPage(
                    page
                );

            } else if (
                typeof R.displayPage ===
                "function"
            ) {

                await R.displayPage(
                    page
                );

            } else {

                /*
                 * Fallback for static/multi-page
                 * HTML reader.
                 */

                showStaticPage(
                    page
                );

            }


            state.currentPage =
                page;


            /*
             * Keep PDF.js page state synchronized.
             */

            if (
                state.pdfPage
            ) {

                state.pdfPage =
                    page;

            }


            if (
                state.page
            ) {

                state.page =
                    page;

            }


            updateNavigationUI();


            /*
             * Scroll only after page changes.
             */

            if (
                options.scroll !== false
            ) {

                scrollReaderToTop(
                    options.smooth !== false
                );

            }


            /*
             * Re-apply systems that depend
             * on the rendered page.
             */

            window.requestAnimationFrame(
                () => {

                    if (
                        typeof R.applyZoom ===
                        "function"
                    ) {

                        R.applyZoom(
                            state.zoom || 1,
                            {
                                keepFit:
                                    state.fitMode
                            }
                        );

                    }


                    if (
                        typeof R.applyPageAppearance ===
                        "function"
                    ) {

                        R.applyPageAppearance();

                    }

                }
            );


            /*
             * Save last page.
             */

            saveLastPage();


            /*
             * Notify other reader modules.
             */

            emitPageChange(
                previousPage,
                page
            );


            return true;

        } catch (error) {

            console.error(
                "Page navigation failed:",
                error
            );


            return false;

        } finally {

            state.navigationBusy =
                false;


            updateNavigationUI();

        }

    }


    /* =====================================================
       STATIC HTML PAGE FALLBACK
    ===================================================== */

    function showStaticPage(
        pageNumber
    ) {

        const pages =
            document.querySelectorAll(
                ".reader-page[data-page], .reader-page"
            );


        if (
            !pages.length
        ) {

            return;

        }


        pages.forEach(
            (page, index) => {

                const dataPage =
                    Number(
                        page.dataset.page
                    );


                const pageNumberForElement =
                    Number.isFinite(
                        dataPage
                    )
                        ? dataPage
                        : index + 1;


                const active =
                    pageNumberForElement ===
                    pageNumber;


                page.hidden =
                    !active;


                page.classList.toggle(
                    "active",
                    active
                );

            }
        );

    }


    /* =====================================================
       NEXT PAGE
    ===================================================== */

    async function nextPage() {

        const total =
            getTotalPages();


        if (
            state.currentPage >=
            total
        ) {

            showNavigationFeedback(
                "Last page"
            );

            return false;

        }


        return setCurrentPage(
            state.currentPage + 1
        );

    }


    /* =====================================================
       PREVIOUS PAGE
    ===================================================== */

    async function previousPage() {

        if (
            state.currentPage <=
            1
        ) {

            showNavigationFeedback(
                "First page"
            );

            return false;

        }


        return setCurrentPage(
            state.currentPage - 1
        );

    }


    /* =====================================================
       FIRST PAGE
    ===================================================== */

    async function firstPage() {

        return setCurrentPage(
            1
        );

    }


    /* =====================================================
       LAST PAGE
    ===================================================== */

    async function lastPage() {

        return setCurrentPage(
            getTotalPages()
        );

    }


    /* =====================================================
       PAGE INPUT
    ===================================================== */

    async function goToInputPage(
        value
    ) {

        const page =
            Number(
                String(value)
                    .replace(
                        /[^\d]/g,
                        ""
                    )
            );


        if (
            !Number.isFinite(page)
        ) {

            updatePageLabels();

            return false;

        }


        const safePage =
            clampPage(
                page
            );


        return setCurrentPage(
            safePage
        );

    }


    /* =====================================================
       PAGE INPUT EVENTS
    ===================================================== */

    function bindPageInput() {

        const input =
            getPageInput();


        if (
            !input ||
            input.dataset.pageBound ===
            "true"
        ) {

            return;

        }


        input.dataset.pageBound =
            "true";


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    goToInputPage(
                        input.value
                    );

                    input.blur();

                }


                if (
                    event.key ===
                    "Escape"
                ) {

                    event.preventDefault();

                    updatePageLabels();

                    input.blur();

                }

            }
        );


        input.addEventListener(
            "blur",
            () => {

                goToInputPage(
                    input.value
                );

            }
        );


        input.addEventListener(
            "focus",
            () => {

                window.requestAnimationFrame(
                    () => {

                        input.select();

                    }
                );

            }
        );

    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    function bindNavigationButtons() {

        document.addEventListener(
            "click",
            event => {

                const next =
                    event.target.closest(
                        "[data-page-next]"
                    );


                if (
                    next
                ) {

                    event.preventDefault();

                    nextPage();

                    return;

                }


                const previous =
                    event.target.closest(
                        "[data-page-prev]"
                    );


                if (
                    previous
                ) {

                    event.preventDefault();

                    previousPage();

                    return;

                }


                const first =
                    event.target.closest(
                        "[data-page-first]"
                    );


                if (
                    first
                ) {

                    event.preventDefault();

                    firstPage();

                    return;

                }


                const last =
                    event.target.closest(
                        "[data-page-last]"
                    );


                if (
                    last
                ) {

                    event.preventDefault();

                    lastPage();

                    return;

                }


                const directPage =
                    event.target.closest(
                        "[data-page-go]"
                    );


                if (
                    directPage
                ) {

                    event.preventDefault();

                    goToInputPage(
                        directPage.dataset.pageGo
                    );

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

                /*
                 * Never hijack typing.
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


                /*
                 * Don't navigate while modifier
                 * shortcuts are being used.
                 */

                if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
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

                        event.preventDefault();

                        firstPage();

                        break;


                    case "End":

                        event.preventDefault();

                        lastPage();

                        break;

                }

            }
        );

    }


    /* =====================================================
       SWIPE NAVIGATION
    ===================================================== */

    let touchStartX =
        0;

    let touchStartY =
        0;

    let touchStartTime =
        0;


    function bindSwipeNavigation() {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        reader.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length !==
                    1
                ) {

                    return;

                }


                const touch =
                    event.touches[0];


                touchStartX =
                    touch.clientX;


                touchStartY =
                    touch.clientY;


                touchStartTime =
                    Date.now();

            },
            {
                passive: true
            }
        );


        reader.addEventListener(
            "touchend",
            event => {

                if (
                    event.changedTouches.length !==
                    1
                ) {

                    return;

                }


                const touch =
                    event.changedTouches[0];


                const dx =
                    touch.clientX -
                    touchStartX;


                const dy =
                    touch.clientY -
                    touchStartY;


                const elapsed =
                    Date.now() -
                    touchStartTime;


                /*
                 * Don't trigger page swipe for
                 * slow/vertical gestures.
                 */

                const horizontal =
                    Math.abs(dx) >
                    Math.abs(dy) * 1.35;


                const enoughDistance =
                    Math.abs(dx) >
                    65;


                const fastEnough =
                    elapsed <
                    700;


                if (
                    horizontal &&
                    enoughDistance &&
                    fastEnough
                ) {

                    if (
                        dx < 0
                    ) {

                        nextPage();

                    } else {

                        previousPage();

                    }

                }

            },
            {
                passive: true
            }
        );

    }


    /* =====================================================
       NAVIGATION FEEDBACK
    ===================================================== */

    function showNavigationFeedback(
        message
    ) {

        const reader =
            getReader();


        if (
            !reader
        ) {

            return;

        }


        let toast =
            reader.querySelector(
                ".page-navigation-toast"
            );


        if (
            !toast
        ) {

            toast =
                document.createElement(
                    "div"
                );


            toast.className =
                "page-navigation-toast";


            toast.setAttribute(
                "role",
                "status"
            );


            reader.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        toast.classList.add(
            "visible"
        );


        clearTimeout(
            state.navigationTimer
        );


        state.navigationTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "visible"
                    );

                },
                900
            );

    }


    /* =====================================================
       PAGE CHANGE EVENT
    ===================================================== */

    function emitPageChange(
        oldPage,
        newPage
    ) {

        try {

            document.dispatchEvent(
                new CustomEvent(
                    "chishtilib:pagechange",
                    {
                        detail: {

                            oldPage:
                                oldPage,

                            newPage:
                                newPage,

                            totalPages:
                                getTotalPages()

                        }

                    }
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       SAVE LAST PAGE
    ===================================================== */

    function saveLastPage() {

        try {

            localStorage.setItem(
                "chishtilib_last_page",
                String(
                    state.currentPage
                )
            );

        } catch (_) {}

    }


    /* =====================================================
       RESTORE LAST PAGE
    ===================================================== */

    function restoreLastPage() {

        try {

            const saved =
                localStorage.getItem(
                    "chishtilib_last_page"
                );


            if (
                saved !== null
            ) {

                const page =
                    Number(
                        saved
                    );


                if (
                    Number.isFinite(
                        page
                    )
                ) {

                    state.currentPage =
                        clampPage(
                            page
                        );

                }

            }

        } catch (_) {}

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    R.getTotalPages =
        getTotalPages;

    R.setTotalPages =
        setTotalPages;

    R.setCurrentPage =
        setCurrentPage;

    R.goToPage =
        setCurrentPage;

    R.nextPage =
        nextPage;

    R.previousPage =
        previousPage;

    R.firstPage =
        firstPage;

    R.lastPage =
        lastPage;

    R.goToInputPage =
        goToInputPage;

    R.updateNavigationUI =
        updateNavigationUI;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeNavigation() {

        state.totalPages =
            getTotalPages();


        restoreLastPage();


        state.currentPage =
            clampPage(
                state.currentPage
            );


        bindPageInput();

        bindNavigationButtons();

        bindKeyboardNavigation();

        bindSwipeNavigation();

        updateNavigationUI();


        /*
         * Keep total pages synchronized if
         * PDF.js becomes available after startup.
         */

        if (
            state.pdfDocument
        ) {

            setTotalPages(
                state.pdfDocument.numPages
            );

        }


        document.addEventListener(
            "chishtilib:documentready",
            () => {

                setTotalPages(
                    getTotalPages()
                );

                state.currentPage =
                    clampPage(
                        state.currentPage
                    );

                updateNavigationUI();

            }
        );


        console.log(
            "Page navigation engine loaded — Part 12/14."
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeNavigation,
            {
                once: true
            }
        );

    } else {

        initializeNavigation();

    }

})();
/* =========================================================
   CHISHTI LIBRARY READER
   JAVASCRIPT PART 13 / 14
   READING PROGRESS ENGINE
   SCROLL PROGRESS + PAGE PROGRESS +
   TOP/BOTTOM CONTROLS + MOBILE SUPPORT
========================================================= */

(() => {

    "use strict";

    const R = window.ChishtiReader;

    if (!R || !R.state) {
        console.error("ChishtiReader core missing.");
        return;
    }

    const state = R.state;

    /* =====================================================
       PROGRESS STATE
    ===================================================== */

    state.readingProgress = 0;

    state.pageProgress = 0;

    state.progressVisible = true;

    state.progressUpdateFrame = null;

    state.progressSaveTimer = null;

    state.lastSavedProgress = -1;

    state.progressDirection = "down";

    state.previousScrollTop = 0;


    /* =====================================================
       DOM HELPERS
    ===================================================== */

    const getReader =
        () => document.querySelector(".reader");

    const getViewport =
        () => document.querySelector(
            ".reader-viewport"
        );

    const getProgressBar =
        () => document.querySelector(
            ".reading-progress-bar, [data-reading-progress-bar]"
        );

    const getProgressFill =
        () => document.querySelector(
            ".reading-progress-fill, [data-reading-progress-fill]"
        );

    const getProgressValue =
        () => document.querySelectorAll(
            ".reading-progress-value, [data-reading-progress-value]"
        );

    const getPageProgressValue =
        () => document.querySelectorAll(
            ".page-progress-value, [data-page-progress-value]"
        );

    const getCurrentPage =
        () => document.querySelector(
            ".current-page, [data-current-page]"
        );

    const getTotalPages =
        () => document.querySelector(
            ".total-pages, [data-total-pages]"
        );


    /* =====================================================
       SAFE NUMBER
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


    /* =====================================================
       CLAMP
    ===================================================== */

    function clamp(
        value,
        min = 0,
        max = 1
    ) {

        return Math.min(
            max,
            Math.max(
                min,
                value
            )
        );

    }


    /* =====================================================
       GET SCROLL CONTAINER
    ===================================================== */

    function getScrollContainer() {

        const viewport =
            getViewport();

        if (
            viewport
        ) {

            return viewport;

        }

        return document.scrollingElement ||
            document.documentElement;

    }


    /* =====================================================
       GET SCROLL PROGRESS
    ===================================================== */

    function calculateScrollProgress() {

        const container =
            getScrollContainer();

        if (
            !container
        ) {

            return 0;

        }


        const scrollTop =
            safeNumber(
                container.scrollTop
            );

        const scrollHeight =
            safeNumber(
                container.scrollHeight
            );

        const clientHeight =
            safeNumber(
                container.clientHeight
            );


        const maxScroll =
            Math.max(
                0,
                scrollHeight -
                clientHeight
            );


        if (
            maxScroll <= 0
        ) {

            return 1;

        }


        return clamp(
            scrollTop /
            maxScroll
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
                1
            );


        if (
            totalPages <= 1
        ) {

            return 1;

        }


        return clamp(
            (
                currentPage - 1
            ) /
            (
                totalPages - 1
            )
        );

    }


    /* =====================================================
       CALCULATE COMBINED READING PROGRESS
    ===================================================== */

    function calculateReadingProgress() {

        /*
         * For a multi-page reader the page position
         * is more meaningful than only the current
         * viewport scroll.
         */

        const totalPages =
            safeNumber(
                state.totalPages,
                1
            );

        const currentPage =
            safeNumber(
                state.currentPage,
                1
            );


        if (
            totalPages > 1
        ) {

            const pageBase =
                (
                    currentPage - 1
                ) /
                totalPages;


            const insidePage =
                calculateScrollProgress();


            return clamp(
                pageBase +
                (
                    insidePage /
                    totalPages
                )
            );

        }


        return calculateScrollProgress();

    }


    /* =====================================================
       FORMAT PERCENT
    ===================================================== */

    function formatPercent(
        value
    ) {

        return `${Math.round(
            clamp(value) * 100
        )}%`;

    }


    /* =====================================================
       UPDATE PROGRESS UI
    ===================================================== */

    function updateProgressUI() {

        const scrollProgress =
            calculateScrollProgress();

        const pageProgress =
            calculatePageProgress();

        const readingProgress =
            calculateReadingProgress();


        state.readingProgress =
            readingProgress;

        state.pageProgress =
            pageProgress;


        /*
         * Detect scroll direction.
         */

        const container =
            getScrollContainer();

        const currentScroll =
            safeNumber(
                container?.scrollTop
            );


        if (
            currentScroll >
            state.previousScrollTop
        ) {

            state.progressDirection =
                "down";

        } else if (
            currentScroll <
            state.previousScrollTop
        ) {

            state.progressDirection =
                "up";

        }


        state.previousScrollTop =
            currentScroll;


        /* ---------------------------------------------
           Progress fill
        --------------------------------------------- */

        const fill =
            getProgressFill();

        if (
            fill
        ) {

            fill.style.width =
                formatPercent(
                    readingProgress
                );

            fill.style.setProperty(
                "--progress",
                readingProgress
            );

        }


        const bar =
            getProgressBar();

        if (
            bar
        ) {

            bar.setAttribute(
                "aria-valuenow",
                String(
                    Math.round(
                        readingProgress * 100
                    )
                )
            );

            bar.setAttribute(
                "aria-valuetext",
                formatPercent(
                    readingProgress
                )
            );

        }


        /* ---------------------------------------------
           Main progress labels
        --------------------------------------------- */

        getProgressValue()
            .forEach(
                element => {

                    element.textContent =
                        formatPercent(
                            readingProgress
                        );

                }
            );


        getPageProgressValue()
            .forEach(
                element => {

                    element.textContent =
                        formatPercent(
                            pageProgress
                        );

                }
            );


        /* ---------------------------------------------
           Current page
        --------------------------------------------- */

        getCurrentPage()
            .forEach?.(
                element => {

                    element.textContent =
                        String(
                            state.currentPage ||
                            1
                        );

                }
            );


        getTotalPages()
            .forEach?.(
                element => {

                    element.textContent =
                        String(
                            state.totalPages ||
                            1
                        );

                }
            );


        /*
         * CSS custom properties for animations.
         */

        const reader =
            getReader();

        if (
            reader
        ) {

            reader.style.setProperty(
                "--reading-progress",
                readingProgress
            );

            reader.style.setProperty(
                "--page-progress",
                pageProgress
            );

            reader.style.setProperty(
                "--scroll-progress",
                scrollProgress
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


        state.progressUpdateFrame =
            requestAnimationFrame(
                () => {

                    state.progressUpdateFrame =
                        null;

                    updateProgressUI();

                }
            );

    }


    /* =====================================================
       SAVE READING PROGRESS
    ===================================================== */

    function scheduleProgressSave() {

        const percent =
            Math.round(
                state.readingProgress * 100
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
            setTimeout(
                () => {

                    saveReadingProgress();

                },
                500
            );

    }


    /* =====================================================
       SAVE TO LOCAL STORAGE
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
                        state.readingProgress,

                    timestamp:
                        Date.now()

                })
            );


            state.lastSavedProgress =
                Math.round(
                    state.readingProgress * 100
                );

        } catch (error) {

            console.warn(
                "Could not save reading progress.",
                error
            );

        }

    }


    /* =====================================================
       STORAGE KEY
    ===================================================== */

    function getProgressStorageKey() {

        const bookId =
            state.bookId ||
            state.currentBookId ||
            state.bookTitle ||
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
       GO TO SAVED PAGE
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
            safeNumber(
                saved.page,
                1
            );


        if (
            page <= 1
        ) {

            return false;

        }


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

        } catch (_) {}


        state.readingProgress =
            0;

        state.pageProgress =
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
            container
        ) {

            container.scrollTo({

                top: 0,

                behavior:
                    "smooth"

            });

        }

    }


    /* =====================================================
       BOTTOM OF READER
    ===================================================== */

    function scrollToBottom() {

        const container =
            getScrollContainer();


        if (
            container
        ) {

            container.scrollTo({

                top:
                    container.scrollHeight,

                behavior:
                    "smooth"

            });

        }

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

        document.addEventListener(
            "click",
            event => {

                const topButton =
                    event.target.closest(
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
                    event.target.closest(
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
                    event.target.closest(
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
                    event.target.closest(
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
                    event.target.closest(
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
       PAGE CHANGE LISTENER
       Works with the reader state even if
       another JS part changes currentPage.
    ===================================================== */

    function watchPageState() {

        let previousPage =
            state.currentPage;


        setInterval(
            () => {

                if (
                    state.currentPage !==
                    previousPage
                ) {

                    previousPage =
                        state.currentPage;

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
       MOBILE RESIZE
    ===================================================== */

    let resizeTimer =
        null;


    function handleResize() {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
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

    R.getReadingProgress =
        () =>
            state.readingProgress;


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    function initializeProgress() {

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
         * Recalculate after fonts/images/
         * PDF page layout settles.
         */

        setTimeout(
            requestProgressUpdate,
            300
        );


        setTimeout(
            requestProgressUpdate,
            1000
        );


        console.log(
            "Reading progress engine loaded — Part 13/14."
        );

    }


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
   FINAL INTEGRATION + MOBILE SAFETY +
   STATE RESTORE + ANIMATION CLEANUP +
   MAROON/GOLD FINALIZER
========================================================= */

(() => {

    "use strict";

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
       DOM
    ===================================================== */

    const html =
        document.documentElement;

    const body =
        document.body;


    const reader =
        () =>
            document.querySelector(
                ".reader"
            );


    const viewport =
        () =>
            document.querySelector(
                ".reader-viewport"
            );


    const stage =
        () =>
            document.querySelector(
                ".page-stage"
            );


    /* =====================================================
       FORCE MAIN IDENTITY
       MAROON + GOLDEN
    ===================================================== */

    function enforceBrandTheme() {

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


        const root =
            html;


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

            /*
             * Keep current zoom but let
             * the zoom engine recalculate
             * its layout.
             */

            requestAnimationFrame(
                () => {

                    R.applyZoom(
                        state.zoom || 1,
                        {
                            keepFit:
                                state.fitMode
                        }
                    );

                }
            );

        }

    }


    /* =====================================================
       MOBILE SCROLL SAFETY
    ===================================================== */

    function setupMobileScrollSafety() {

        const v =
            viewport();

        if (!v) {
            return;
        }


        v.style.setProperty(
            "overscroll-behavior",
            "contain"
        );


        if (
            state.isMobile
        ) {

            v.style.setProperty(
                "touch-action",
                "pan-x pan-y"
            );

        }

    }


    /* =====================================================
       PREVENT DOUBLE TAP ZOOM
       WITHOUT BREAKING PINCH ZOOM
    ===================================================== */

    function setupDoubleTapProtection() {

        let lastTap =
            0;


        document.addEventListener(
            "touchend",
            event => {

                if (
                    event.changedTouches.length !==
                    1
                ) {

                    return;

                }


                const now =
                    Date.now();


                if (
                    now -
                    lastTap <
                    280
                ) {

                    /*
                     * Only prevent double tap
                     * inside reader controls/page.
                     */

                    if (
                        event.target.closest(
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
       SAFE CLICK RIPPLE
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


        const rect =
            element.getBoundingClientRect();


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "reader-ripple";


        const x =
            event.clientX -
            rect.left;


        const y =
            event.clientY -
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
            550
        );

    }


    function bindRipple() {

        document.addEventListener(
            "pointerdown",
            event => {

                const button =
                    event.target.closest(
                        "button, .reader-button, [role='button']"
                    );


                if (
                    !button
                ) {

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
       ADD FINAL RUNTIME CSS
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

            /* =========================================
               BRAND
            ========================================= */

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


            /* =========================================
               RIPPLE
            ========================================= */

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


            /* =========================================
               FINAL GOLD FOCUS
            ========================================= */

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


            /* =========================================
               MOBILE
            ========================================= */

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


            /* =========================================
               TABLET
            ========================================= */

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


            /* =========================================
               REDUCE MOTION
            ========================================= */

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


            /* =========================================
               PRINT
            ========================================= */

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

        const r =
            reader();

        if (!r) {
            return;
        }


        /*
         * Remove stale classes from previous
         * page transitions.
         */

        r.classList.remove(
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

        const s =
            stage();

        if (!s) {
            return;
        }


        const pages =
            s.querySelectorAll(
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

            R.applyPageAppearance();

        }


        if (
            typeof R.updateZoomUI ===
            "function"
        ) {

            R.updateZoomUI();

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

            R.applyTheme(
                "maroon-gold"
            );

        }


        /*
         * Reader light
         */

        if (
            state.readerLight &&
            typeof R.enableReaderLight ===
            "function"
        ) {

            R.enableReaderLight();

        }


        /*
         * Page glow
         */

        if (
            state.pageGlow &&
            typeof R.enablePageGlow ===
            "function"
        ) {

            R.enablePageGlow();

        }


        /*
         * Zoom
         */

        if (
            typeof R.applyZoom ===
            "function"
        ) {

            R.applyZoom(
                state.zoom || 1,
                {
                    keepFit:
                        state.fitMode
                }
            );

        }

    }


    /* =====================================================
       ERROR RECOVERY
    ===================================================== */

    function installErrorRecovery() {

        window.addEventListener(
            "error",
            event => {

                /*
                 * Do not allow one animation
                 * failure to break reader controls.
                 */

                if (
                    event?.error
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
                 * Don't permanently block
                 * the interface because of one
                 * failed async operation.
                 */

                state.searching =
                    false;

            }
        );

    }


    /* =====================================================
       PAGE VISIBILITY OPTIMIZATION
    ===================================================== */

    function setupVisibilityOptimization() {

        const r =
            reader();

        if (!r) {
            return;
        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "page-visible"
                                );

                            } else {

                                entry.target.classList.remove(
                                    "page-visible"
                                );

                            }

                        }
                    );

                },
                {
                    root:
                        viewport(),

                    threshold:
                        0.01

                }
            );


        document
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
       RECONNECT PAGE OBSERVER
    ===================================================== */

    function observeFinalPageChanges() {

        const s =
            stage();

        if (!s) {
            return;
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
            s,
            {
                childList: true,
                subtree: true
            }
        );


        state.finalPageObserver =
            observer;

    }


    /* =====================================================
       FINAL KEYBOARD SAFETY
    ===================================================== */

    function bindFinalKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                /*
                 * Escape closes temporary reader
                 * interfaces if their public API exists.
                 */

                if (
                    event.key ===
                    "Escape"
                ) {

                    if (
                        state.searchOpen &&
                        typeof R.closeSearch ===
                        "function"
                    ) {

                        R.closeSearch();

                    }


                    if (
                        typeof R.closeMenu ===
                        "function"
                    ) {

                        R.closeMenu();

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

                },
                150
            );

    }


    /* =====================================================
       PUBLIC FINAL API
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


        window.addEventListener(
            "resize",
            finalResize,
            {
                passive: true
            }
        );


        /*
         * Let every previous module finish
         * before declaring the reader ready.
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
