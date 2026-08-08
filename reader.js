/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 1 / 14

        CORE
        DOM
        STATE
        HELPERS
==================================================*/

"use strict";


/*==================================================
                GLOBAL READER STATE
==================================================*/

const ReaderState = {

    currentPage: 1,

    totalPages: 0,

    zoom: 1,

    minZoom: 0.5,

    maxZoom: 2.5,

    zoomStep: 0.1,

    theme: "dark",

    pageShadow: true,

    autoSave: true,

    pageAnimation: true,

    bookmarks: [],

    comments: [],

    liked: false,

    likeCount: 0,

    searchQuery: "",

    searchResults: [],

    currentSearchIndex: -1,

    isLoading: true,

    readerReady: false,

    panelOpen: null,

    viewMode: "single",

    isFullscreen: false,

    bookLoaded: false,

    pdfDocument: null,

    renderedPages: {},

    isRendering: false,

    isPageTurning: false

};


/*==================================================
                DOM HELPER
==================================================*/

function $(selector){

    return document.querySelector(selector);

}


function $$(selector){

    return Array.from(
        document.querySelectorAll(selector)
    );

}


function getById(id){

    return document.getElementById(id);

}


/*==================================================
                COMMON DOM ELEMENTS
==================================================*/

const DOM = {

    body:
        document.body,

    loadingScreen:
        getById("loadingScreen"),

    loadingProgress:
        getById("loadingProgress"),

    loadingProgressFill:
        getById("loadingProgressFill"),

    loadingPercent:
        getById("loadingPercent"),

    loadingStatus:
        getById("loadingStatus"),

    bookOpenOverlay:
        getById("bookOpenOverlay"),

    readerApp:
        getById("readerApp"),

    menuBtn:
        getById("menuBtn"),

    prevBtn:
        getById("prevBtn"),

    nextBtn:
        getById("nextBtn"),

    previousPage:
        getById("previousPage"),

    nextPage:
        getById("nextPage"),

    currentPage:
        getById("currentPage"),

    totalPages:
        getById("totalPages"),

    pageCounter:
        getById("pageCounter"),

    pageInfo:
        getById("pageInfo"),

    zoomOutBtn:
        getById("zoomOutBtn"),

    zoomInBtn:
        getById("zoomInBtn"),

    zoomValue:
        getById("zoomValue"),

    fitBtn:
        getById("fitBtn"),

    thumbnailBtn:
        getById("thumbnailBtn"),

    commentsBtn:
        getById("commentsBtn"),

    bookmarkBtn:
        getById("bookmarkBtn"),

    searchInput:
        getById("searchInput"),

    commentName:
        getById("commentName"),

    likeBtn:
        getById("likeBtn"),

    likeCount:
        getById("likeCount"),

    shareBtn:
        getById("shareBtn"),

    shareClose:
        getById("shareClose"),

    copyLinkBtn:
        getById("copyLinkBtn"),

    nativeShareBtn:
        getById("nativeShareBtn"),

    darkMode:
        getById("darkMode"),

    pageShadow:
        getById("pageShadow"),

    pageAnimation:
        getById("pageAnimation"),

    autoSave:
        getById("autoSave"),

    readingProgressFill:
        getById("readingProgressFill"),

    thumbnailList:
        getById("thumbnailList"),

    contentsList:
        getById("contentsList"),

    bookmarkList:
        getById("bookmarkList"),

    commentsList:
        getById("commentsList"),

    toast:
        getById("toast"),

    toastMessage:
        getById("toastMessage"),

    toastIcon:
        getById("toastIcon")

};


/*==================================================
                SAFE ELEMENT CHECK
==================================================*/

function exists(element){

    return element !== null &&
           element !== undefined;

}


/*==================================================
                SAFE TEXT
==================================================*/

function setText(element, value){

    if(!exists(element)) return;

    element.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(value);

}


/*==================================================
                SAFE HTML
==================================================*/

function setHTML(element, html){

    if(!exists(element)) return;

    element.innerHTML =
        html || "";

}


/*==================================================
                SHOW / HIDE
==================================================*/

function showElement(element){

    if(!exists(element)) return;

    element.classList.add("show");

}


function hideElement(element){

    if(!exists(element)) return;

    element.classList.remove("show");

}


/*==================================================
                OPEN / CLOSE CLASS
==================================================*/

function openElement(element){

    if(!exists(element)) return;

    element.classList.add("open");

}


function closeElement(element){

    if(!exists(element)) return;

    element.classList.remove("open");

}


/*==================================================
                TOGGLE CLASS
==================================================*/

function toggleClass(
    element,
    className,
    force
){

    if(!exists(element)) return;

    element.classList.toggle(
        className,
        force
    );

}


/*==================================================
                CLAMP VALUE
==================================================*/

function clamp(
    value,
    min,
    max
){

    return Math.min(
        Math.max(
            value,
            min
        ),
        max
    );

}


/*==================================================
                NUMBER FORMAT
==================================================*/

function safeNumber(
    value,
    fallback = 0
){

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


/*==================================================
                LOCAL STORAGE
==================================================*/

function saveData(
    key,
    value
){

    try{

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

        return true;

    }catch(error){

        console.warn(
            "Chishti Reader: Unable to save data.",
            error
        );

        return false;

    }

}


function loadData(
    key,
    fallback = null
){

    try{

        const data =
            localStorage.getItem(key);

        if(data === null){

            return fallback;

        }

        return JSON.parse(data);

    }catch(error){

        console.warn(
            "Chishti Reader: Unable to load data.",
            error
        );

        return fallback;

    }

}


/*==================================================
                REMOVE STORAGE
==================================================*/

function removeData(key){

    try{

        localStorage.removeItem(key);

    }catch(error){

        console.warn(
            "Chishti Reader: Unable to remove data.",
            error
        );

    }

}


/*==================================================
                READER STORAGE PREFIX
==================================================*/

const STORAGE = {

    theme:
        "chishti-theme",

    settings:
        "chishti-reader-settings",

    progress:
        "chishti-reading-progress",

    bookmarks:
        "chishti-bookmarks",

    comments:
        "chishti-comments",

    likes:
        "chishti-likes",

    zoom:
        "chishti-reader-zoom"

};


/*==================================================
                SAVE CURRENT STATE
==================================================*/

function saveReaderState(){

    if(!ReaderState.autoSave){

        return;

    }

    saveData(
        STORAGE.progress,
        {
            currentPage:
                ReaderState.currentPage,

            totalPages:
                ReaderState.totalPages
        }
    );

    saveData(
        STORAGE.zoom,
        ReaderState.zoom
    );

}


/*==================================================
                UPDATE PAGE COUNTER
==================================================*/

function updatePageCounter(){

    const current =
        clamp(
            ReaderState.currentPage,
            1,
            Math.max(
                ReaderState.totalPages,
                1
            )
        );

    const total =
        Math.max(
            ReaderState.totalPages,
            0
        );

    setText(
        DOM.currentPage,
        current
    );

    setText(
        DOM.totalPages,
        total
    );

    setText(
        DOM.pageInfo,
        `Page ${current} of ${total}`
    );

}


/*==================================================
                UPDATE ZOOM TEXT
==================================================*/

function updateZoomDisplay(){

    const percent =
        Math.round(
            ReaderState.zoom * 100
        );

    setText(
        DOM.zoomValue,
        `${percent}%`
    );

}


/*==================================================
                UPDATE PROGRESS
==================================================*/

function updateReadingProgress(){

    if(
        !exists(
            DOM.readingProgressFill
        )
    ){

        return;

    }

    const total =
        ReaderState.totalPages;

    if(total <= 0){

        DOM.readingProgressFill.style.width =
            "0%";

        return;

    }

    const progress =
        (
            ReaderState.currentPage /
            total
        ) * 100;

    DOM.readingProgressFill.style.width =
        `${clamp(progress,0,100)}%`;

}


/*==================================================
                INITIAL STATE
==================================================*/

function initializeReaderState(){

    const savedSettings =
        loadData(
            STORAGE.settings,
            {}
        );

    if(
        savedSettings &&
        typeof savedSettings === "object"
    ){

        if(
            typeof savedSettings.pageShadow ===
            "boolean"
        ){

            ReaderState.pageShadow =
                savedSettings.pageShadow;

        }

        if(
            typeof savedSettings.autoSave ===
            "boolean"
        ){

            ReaderState.autoSave =
                savedSettings.autoSave;

        }

        if(
            typeof savedSettings.pageAnimation ===
            "boolean"
        ){

            ReaderState.pageAnimation =
                savedSettings.pageAnimation;

        }

    }


    const savedZoom =
        loadData(
            STORAGE.zoom,
            1
        );

    ReaderState.zoom =
        clamp(
            safeNumber(
                savedZoom,
                1
            ),
            ReaderState.minZoom,
            ReaderState.maxZoom
        );


    const savedLikes =
        loadData(
            STORAGE.likes,
            {}
        );

    if(
        savedLikes &&
        typeof savedLikes === "object"
    ){

        ReaderState.liked =
            Boolean(
                savedLikes.liked
            );

        ReaderState.likeCount =
            safeNumber(
                savedLikes.count,
                0
            );

    }


    ReaderState.bookmarks =
        loadData(
            STORAGE.bookmarks,
            []
        );

    if(
        !Array.isArray(
            ReaderState.bookmarks
        )
    ){

        ReaderState.bookmarks = [];

    }


    ReaderState.comments =
        loadData(
            STORAGE.comments,
            []
        );

    if(
        !Array.isArray(
            ReaderState.comments
        )
    ){

        ReaderState.comments = [];

    }

}


/*==================================================
                INITIAL UI
==================================================*/

function initializeReaderUI(){

    updatePageCounter();

    updateZoomDisplay();

    updateReadingProgress();

    if(exists(DOM.pageShadow)){

        DOM.pageShadow.checked =
            ReaderState.pageShadow;

    }

    if(exists(DOM.pageAnimation)){

        DOM.pageAnimation.checked =
            ReaderState.pageAnimation;

    }

    if(exists(DOM.autoSave)){

        DOM.autoSave.checked =
            ReaderState.autoSave;

    }

    if(exists(DOM.likeCount)){

        setText(
            DOM.likeCount,
            ReaderState.likeCount
        );

    }

    if(exists(DOM.likeBtn)){

        toggleClass(
            DOM.likeBtn,
            "liked",
            ReaderState.liked
        );

    }

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeReaderState();

        initializeReaderUI();

        console.log(
            "Chishti Library Reader: Core initialized."
        );

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 2 / 14

        THEMES
        SETTINGS
        LOCAL STORAGE
==================================================*/


/*==================================================
                THEME FUNCTION
==================================================*/

function setReaderTheme(theme){

    const allowedThemes = [
        "dark",
        "maroon",
        "gold",
        "light"
    ];

    if(
        !allowedThemes.includes(theme)
    ){

        theme = "dark";

    }


    document.body.classList.remove(
        "theme-dark",
        "theme-maroon",
        "theme-gold",
        "theme-light"
    );


    document.body.classList.add(
        `theme-${theme}`
    );


    ReaderState.theme =
        theme;


    saveData(
        STORAGE.theme,
        theme
    );


    updateThemeControls();

}


/*==================================================
                LOAD SAVED THEME
==================================================*/

function loadSavedTheme(){

    const savedTheme =
        loadData(
            STORAGE.theme,
            "dark"
        );


    /*
        loadData() JSON parse karta hai.
        Agar purane code ne plain string save
        ki ho to direct localStorage fallback.
    */

    let theme =
        savedTheme;


    try{

        const rawTheme =
            localStorage.getItem(
                STORAGE.theme
            );


        if(
            rawTheme &&
            (
                rawTheme === "dark" ||
                rawTheme === "maroon" ||
                rawTheme === "gold" ||
                rawTheme === "light"
            )
        ){

            theme =
                rawTheme;

        }

    }catch(error){

        console.warn(
            "Chishti Reader: Theme storage unavailable.",
            error
        );

    }


    setReaderTheme(
        theme
    );

}


/*==================================================
                THEME BUTTONS
==================================================*/

const themeButtons = $$(
    "[data-theme]"
);


/*==================================================
                UPDATE THEME CONTROLS
==================================================*/

function updateThemeControls(){

    const currentTheme =
        ReaderState.theme;


    themeButtons.forEach(
        button => {

            const buttonTheme =
                button.dataset.theme;


            button.classList.toggle(
                "active",
                buttonTheme === currentTheme
            );


            button.setAttribute(
                "aria-pressed",
                buttonTheme === currentTheme
                    ? "true"
                    : "false"
            );

        }
    );


    /*
        Agar checkbox "Dark Mode" موجود hai
        to dark theme par checked hoga.
    */

    if(
        exists(DOM.darkMode)
    ){

        DOM.darkMode.checked =
            currentTheme === "dark";

    }

}


/*==================================================
                THEME BUTTON EVENTS
==================================================*/

function bindThemeButtons(){

    themeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    const theme =
                        this.dataset.theme;


                    if(!theme){

                        return;

                    }


                    setReaderTheme(
                        theme
                    );


                    showToast(
                        `Theme changed to ${capitalize(theme)}`
                    );

                }
            );

        }
    );

}


/*==================================================
                DARK MODE TOGGLE
==================================================*/

function handleDarkMode(){

    if(
        !exists(DOM.darkMode)
    ){

        return;

    }


    DOM.darkMode.addEventListener(
        "change",
        function(){

            if(this.checked){

                setReaderTheme(
                    "dark"
                );

            }else{

                /*
                    Dark Mode OFF karne par
                    maroon/gold ko automatically
                    replace nahi karenge.
                    Light theme use hogi.
                */

                setReaderTheme(
                    "light"
                );

            }


            showToast(
                this.checked
                    ? "Dark Mode enabled"
                    : "Light Mode enabled"
            );

        }
    );

}


/*==================================================
                PAGE SHADOW SETTING
==================================================*/

function handlePageShadow(){

    if(
        !exists(DOM.pageShadow)
    ){

        return;

    }


    DOM.pageShadow.addEventListener(
        "change",
        function(){

            ReaderState.pageShadow =
                this.checked;


            document.body.classList.toggle(
                "page-shadow-off",
                !this.checked
            );


            saveSettings();


            showToast(
                this.checked
                    ? "Page Shadow enabled"
                    : "Page Shadow disabled"
            );

        }
    );

}


/*==================================================
                PAGE ANIMATION SETTING
==================================================*/

function handlePageAnimation(){

    if(
        !exists(DOM.pageAnimation)
    ){

        return;

    }


    DOM.pageAnimation.addEventListener(
        "change",
        function(){

            ReaderState.pageAnimation =
                this.checked;


            saveSettings();


            showToast(
                this.checked
                    ? "Page Animation enabled"
                    : "Page Animation disabled"
            );

        }
    );

}


/*==================================================
                AUTO SAVE SETTING
==================================================*/

function handleAutoSave(){

    if(
        !exists(DOM.autoSave)
    ){

        return;

    }


    DOM.autoSave.addEventListener(
        "change",
        function(){

            ReaderState.autoSave =
                this.checked;


            saveSettings();


            if(
                this.checked
            ){

                saveReaderState();

            }


            showToast(
                this.checked
                    ? "Auto Save enabled"
                    : "Auto Save disabled"
            );

        }
    );

}


/*==================================================
                SAVE SETTINGS
==================================================*/

function saveSettings(){

    saveData(
        STORAGE.settings,
        {

            pageShadow:
                ReaderState.pageShadow,

            pageAnimation:
                ReaderState.pageAnimation,

            autoSave:
                ReaderState.autoSave

        }
    );

}


/*==================================================
                LOAD SETTINGS
==================================================*/

function loadSettings(){

    const settings =
        loadData(
            STORAGE.settings,
            {}
        );


    if(
        !settings ||
        typeof settings !== "object"
    ){

        return;

    }


    if(
        typeof settings.pageShadow ===
        "boolean"
    ){

        ReaderState.pageShadow =
            settings.pageShadow;

    }


    if(
        typeof settings.pageAnimation ===
        "boolean"
    ){

        ReaderState.pageAnimation =
            settings.pageAnimation;

    }


    if(
        typeof settings.autoSave ===
        "boolean"
    ){

        ReaderState.autoSave =
            settings.autoSave;

    }


    updateSettingsControls();

}


/*==================================================
                UPDATE SETTINGS CONTROLS
==================================================*/

function updateSettingsControls(){

    if(
        exists(DOM.pageShadow)
    ){

        DOM.pageShadow.checked =
            ReaderState.pageShadow;

    }


    if(
        exists(DOM.pageAnimation)
    ){

        DOM.pageAnimation.checked =
            ReaderState.pageAnimation;

    }


    if(
        exists(DOM.autoSave)
    ){

        DOM.autoSave.checked =
            ReaderState.autoSave;

    }


    document.body.classList.toggle(
        "page-shadow-off",
        !ReaderState.pageShadow
    );

}


/*==================================================
                CAPITALIZE HELPER
==================================================*/

function capitalize(value){

    if(
        !value
    ){

        return "";

    }


    return (
        String(value)
            .charAt(0)
            .toUpperCase()
            +
        String(value)
            .slice(1)
    );

}


/*==================================================
                TOAST FUNCTION
==================================================*/

let toastTimer = null;


function showToast(
    message,
    type = "info"
){

    if(
        !exists(DOM.toast)
    ){

        console.log(
            message
        );

        return;

    }


    if(
        exists(DOM.toastMessage)
    ){

        DOM.toastMessage.textContent =
            message;

    }


    if(
        exists(DOM.toastIcon)
    ){

        const icons = {

            info:
                "ri-information-line",

            success:
                "ri-checkbox-circle-line",

            error:
                "ri-error-warning-line",

            warning:
                "ri-alert-line"

        };


        DOM.toastIcon.className =
            `ri ${
                icons[type] ||
                icons.info
            }`;

    }


    DOM.toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function(){

                DOM.toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/*==================================================
                INITIALIZE SETTINGS
==================================================*/

function initializeSettings(){

    loadSettings();

    loadSavedTheme();

    bindThemeButtons();

    handleDarkMode();

    handlePageShadow();

    handlePageAnimation();

    handleAutoSave();

    updateSettingsControls();

}


/*==================================================
                SETTINGS READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeSettings();

        console.log(
            "Chishti Reader: Themes and settings initialized."
        );

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 3 / 14

        LOADING SCREEN
        BOOK OPEN ANIMATION
        READER ENTRY
==================================================*/


/*==================================================
                LOADING ELEMENTS
==================================================*/

const LoadingState = {

    progress: 0,

    timer: null,

    finished: false,

    bookAnimationStarted: false

};


/*==================================================
                UPDATE LOADING
==================================================*/

function updateLoading(
    progress,
    status = ""
){

    progress =
        clamp(
            safeNumber(
                progress,
                0
            ),
            0,
            100
        );


    LoadingState.progress =
        progress;


    if(
        exists(
            DOM.loadingProgressFill
        )
    ){

        DOM.loadingProgressFill.style.width =
            `${progress}%`;

    }


    if(
        exists(
            DOM.loadingProgress
        )
    ){

        DOM.loadingProgress.value =
            progress;

    }


    if(
        exists(
            DOM.loadingPercent
        )
    ){

        DOM.loadingPercent.textContent =
            `${Math.round(progress)}%`;

    }


    if(
        exists(
            DOM.loadingStatus
        ) &&
        status
    ){

        DOM.loadingStatus.textContent =
            status;

    }

}


/*==================================================
                LOADING STATUS
==================================================*/

function setLoadingStatus(
    status
){

    if(
        !exists(
            DOM.loadingStatus
        )
    ){

        return;

    }


    DOM.loadingStatus.textContent =
        status;

}


/*==================================================
                SHOW LOADING SCREEN
==================================================*/

function showLoadingScreen(){

    if(
        !exists(
            DOM.loadingScreen
        )
    ){

        return;

    }


    DOM.loadingScreen.classList.remove(
        "hide"
    );


    DOM.loadingScreen.setAttribute(
        "aria-hidden",
        "false"
    );


    ReaderState.isLoading =
        true;

}


/*==================================================
                HIDE LOADING SCREEN
==================================================*/

function hideLoadingScreen(){

    if(
        !exists(
            DOM.loadingScreen
        )
    ){

        ReaderState.isLoading =
            false;

        return;

    }


    DOM.loadingScreen.classList.add(
        "hide"
    );


    DOM.loadingScreen.setAttribute(
        "aria-hidden",
        "true"
    );


    ReaderState.isLoading =
        false;

}


/*==================================================
                BOOK OPEN ANIMATION
==================================================*/

function startBookOpenAnimation(){

    if(
        !exists(
            DOM.bookOpenOverlay
        )
    ){

        revealReader();

        return;

    }


    if(
        LoadingState.bookAnimationStarted
    ){

        return;

    }


    LoadingState.bookAnimationStarted =
        true;


    DOM.bookOpenOverlay.classList.add(
        "active"
    );


    DOM.bookOpenOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
        Book ko center mein open hone ka
        time diya gaya hai.
    */

    setTimeout(
        function(){

            revealReader();

        },
        700
    );


    /*
        Animation complete hone ke baad
        overlay completely hide.
    */

    setTimeout(
        function(){

            DOM.bookOpenOverlay.classList.remove(
                "active"
            );


            DOM.bookOpenOverlay.setAttribute(
                "aria-hidden",
                "true"
            );


        },
        1350
    );

}


/*==================================================
                READER ENTRY
==================================================*/

function revealReader(){

    if(
        !exists(
            DOM.readerApp
        )
    ){

        hideLoadingScreen();

        ReaderState.readerReady =
            true;

        return;

    }


    DOM.readerApp.classList.remove(
        "reader-entering"
    );


    DOM.readerApp.classList.add(
        "reader-ready"
    );


    ReaderState.readerReady =
        true;


    hideLoadingScreen();


    /*
        Animation class ko baad mein remove
        kar dete hain taake repeated page
        navigation par entry animation na chale.
    */

    setTimeout(
        function(){

            DOM.readerApp.classList.remove(
                "reader-ready"
            );

        },
        700
    );

}


/*==================================================
                FINISH LOADING
==================================================*/

function finishLoading(){

    if(
        LoadingState.finished
    ){

        return;

    }


    LoadingState.finished =
        true;


    clearInterval(
        LoadingState.timer
    );


    updateLoading(
        100,
        "Opening book..."
    );


    setTimeout(
        function(){

            startBookOpenAnimation();

        },
        250
    );

}


/*==================================================
                SIMULATED LOADING
==================================================*/

function startLoading(){

    showLoadingScreen();


    LoadingState.finished =
        false;


    LoadingState.bookAnimationStarted =
        false;


    updateLoading(
        0,
        "Preparing your book..."
    );


    let progress =
        0;


    clearInterval(
        LoadingState.timer
    );


    LoadingState.timer =
        setInterval(
            function(){

                /*
                    Pehle fast,
                    end par slow.
                */

                let increment;


                if(progress < 30){

                    increment = 7;

                }else if(progress < 65){

                    increment = 4;

                }else if(progress < 88){

                    increment = 2;

                }else{

                    increment = 1;

                }


                progress +=
                    increment;


                if(progress >= 20){

                    setLoadingStatus(
                        "Loading book..."
                    );

                }


                if(progress >= 55){

                    setLoadingStatus(
                        "Preparing pages..."
                    );

                }


                if(progress >= 80){

                    setLoadingStatus(
                        "Almost ready..."
                    );

                }


                updateLoading(
                    progress
                );


                if(progress >= 100){

                    clearInterval(
                        LoadingState.timer
                    );


                    finishLoading();

                }

            },
            80
        );

}


/*==================================================
                REAL BOOK LOADING HOOK
==================================================*/

function bookLoadingProgress(
    loaded,
    total
){

    loaded =
        safeNumber(
            loaded,
            0
        );


    total =
        safeNumber(
            total,
            0
        );


    if(total <= 0){

        return;

    }


    const progress =
        (
            loaded /
            total
        ) * 100;


    updateLoading(
        progress,
        "Loading book..."
    );

}


/*==================================================
                PREPARE READER
==================================================*/

function prepareReader(){

    if(
        exists(
            DOM.readerApp
        )
    ){

        DOM.readerApp.classList.add(
            "reader-entering"
        );

    }


    showLoadingScreen();


    updateLoading(
        5,
        "Preparing reader..."
    );


    setTimeout(
        function(){

            updateLoading(
                20,
                "Loading book..."
            );

        },
        180
    );


    setTimeout(
        function(){

            updateLoading(
                45,
                "Preparing pages..."
            );

        },
        360
    );


    setTimeout(
        function(){

            updateLoading(
                70,
                "Building reader..."
            );

        },
        520
    );


    setTimeout(
        function(){

            updateLoading(
                90,
                "Almost ready..."
            );

        },
        680
    );


    setTimeout(
        function(){

            finishLoading();

        },
        850
    );

}


/*==================================================
                RESTART LOADING
==================================================*/

function restartReaderLoading(){

    LoadingState.finished =
        false;

    LoadingState.bookAnimationStarted =
        false;


    if(
        exists(
            DOM.readerApp
        )
    ){

        DOM.readerApp.classList.remove(
            "reader-ready"
        );

        DOM.readerApp.classList.add(
            "reader-entering"
        );

    }


    if(
        exists(
            DOM.bookOpenOverlay
        )
    ){

        DOM.bookOpenOverlay.classList.remove(
            "active"
        );

    }


    startLoading();

}


/*==================================================
                PAGE ANIMATION
==================================================*/

function animatePageTurn(
    direction = "next"
){

    /*
        User-facing setting nahi hai.
        Animation internally ReaderState se
        control hoti hai.
    */

    if(
        !ReaderState.pageAnimation
    ){

        return;

    }


    const pageElements = $$(
        ".page-slot"
    );


    if(
        pageElements.length === 0
    ){

        return;

    }


    pageElements.forEach(
        page => {

            page.classList.remove(
                "page-turn-next",
                "page-turn-prev"
            );


            /*
                Browser ko reflow karwa kar
                animation ko reliably restart karte hain.
            */

            void page.offsetWidth;


            page.classList.add(
                direction === "prev"
                    ? "page-turn-prev"
                    : "page-turn-next"
            );


            setTimeout(
                function(){

                    page.classList.remove(
                        "page-turn-next",
                        "page-turn-prev"
                    );

                },
                420
            );

        }
    );

}


/*==================================================
                WINDOW LOAD
==================================================*/

window.addEventListener(
    "load",
    function(){

        /*
            Agar PDF/Book ka actual loader baad mein
            Part 4+ se complete hota hai to yeh
            fallback reader ko stuck hone se bachata hai.
        */

        setTimeout(
            function(){

                if(
                    ReaderState.isLoading &&
                    !LoadingState.finished
                ){

                    finishLoading();

                }

            },
            1800
        );

    }
);


/*==================================================
                INITIALIZE LOADING
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        prepareReader();

    }
);


/*==================================================
                VISIBILITY RECOVERY
==================================================*/

document.addEventListener(
    "visibilitychange",
    function(){

        if(
            document.visibilityState ===
            "visible"
        ){

            /*
                Reader dobara visible hone par
                loading screen accidentally stuck
                na rahe.
            */

            if(
                LoadingState.finished &&
                !ReaderState.readerReady
            ){

                revealReader();

            }

        }

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 4 / 14

        READER PANELS
        MENU
        CONTENTS
        THUMBNAILS
        COMMENTS
        SETTINGS
==================================================*/


/*==================================================
                PANEL ELEMENTS
==================================================*/

const Panels = {

    menu:
        document.querySelector(
            "#menuPanel, .menu-panel, #sidePanel, .side-panel"
        ),

    thumbnail:
        document.querySelector(
            "#thumbnailPanel, .thumbnail-panel"
        ),

    comments:
        document.querySelector(
            "#commentsPanel, .comments-panel"
        ),

    settings:
        document.querySelector(
            "#settingsPanel, .settings-panel"
        ),

    contents:
        document.querySelector(
            "#contentsPanel, .contents-panel"
        ),

    bookmarks:
        document.querySelector(
            "#bookmarksPanel, .bookmarks-panel"
        ),

    overlay:
        document.querySelector(
            "#panelOverlay, .panel-overlay"
        )

};


/*==================================================
                FIND PANEL
==================================================*/

function findPanel(name){

    const panel =
        Panels[name];

    if(panel){

        return panel;

    }


    const selectors = {

        menu:
            [
                "#menuPanel",
                ".menu-panel",
                "#sidePanel",
                ".side-panel"
            ],

        thumbnail:
            [
                "#thumbnailPanel",
                ".thumbnail-panel"
            ],

        comments:
            [
                "#commentsPanel",
                ".comments-panel"
            ],

        settings:
            [
                "#settingsPanel",
                ".settings-panel"
            ],

        contents:
            [
                "#contentsPanel",
                ".contents-panel"
            ],

        bookmarks:
            [
                "#bookmarksPanel",
                ".bookmarks-panel"
            ]

    };


    const list =
        selectors[name] || [];


    for(
        const selector of list
    ){

        const element =
            document.querySelector(
                selector
            );


        if(element){

            Panels[name] =
                element;

            return element;

        }

    }


    return null;

}


/*==================================================
                CREATE OVERLAY
==================================================*/

function getPanelOverlay(){

    if(Panels.overlay){

        return Panels.overlay;

    }


    Panels.overlay =
        document.querySelector(
            "#panelOverlay, .panel-overlay"
        );


    if(
        Panels.overlay
    ){

        return Panels.overlay;

    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "panelOverlay";


    overlay.className =
        "panel-overlay";


    document.body.appendChild(
        overlay
    );


    Panels.overlay =
        overlay;


    return overlay;

}


/*==================================================
                CLOSE ALL PANELS
==================================================*/

function closeAllPanels(){

    const panelNames = [

        "menu",
        "thumbnail",
        "comments",
        "settings",
        "contents",
        "bookmarks"

    ];


    panelNames.forEach(
        name => {

            const panel =
                findPanel(name);


            if(!panel){

                return;

            }


            panel.classList.remove(
                "open",
                "active",
                "show"
            );

        }
    );


    const overlay =
        getPanelOverlay();


    if(overlay){

        overlay.classList.remove(
            "show",
            "active"
        );

    }


    ReaderState.panelOpen =
        null;


    document.body.classList.remove(
        "panel-open"
    );

}


/*==================================================
                OPEN PANEL
==================================================*/

function openPanel(
    name
){

    const panel =
        findPanel(name);


    if(!panel){

        console.warn(
            `Chishti Reader: Panel "${name}" not found.`
        );

        return false;

    }


    closeAllPanels();


    panel.classList.add(
        "open"
    );


    panel.classList.add(
        "active"
    );


    panel.classList.add(
        "show"
    );


    const overlay =
        getPanelOverlay();


    /*
        Desktop par overlay optional hai,
        mobile par useful hai.
    */

    if(overlay){

        overlay.classList.add(
            "show"
        );

    }


    ReaderState.panelOpen =
        name;


    document.body.classList.add(
        "panel-open"
    );


    return true;

}


/*==================================================
                TOGGLE PANEL
==================================================*/

function togglePanel(
    name
){

    if(
        ReaderState.panelOpen === name
    ){

        closeAllPanels();

        return;

    }


    openPanel(name);

}


/*==================================================
                MENU BUTTON
==================================================*/

function bindMenuButton(){

    if(
        !exists(DOM.menuBtn)
    ){

        return;

    }


    DOM.menuBtn.addEventListener(
        "click",
        function(){

            togglePanel(
                "menu"
            );

        }
    );

}


/*==================================================
                THUMBNAIL BUTTON
==================================================*/

function bindThumbnailButton(){

    if(
        !exists(DOM.thumbnailBtn)
    ){

        return;

    }


    DOM.thumbnailBtn.addEventListener(
        "click",
        function(){

            togglePanel(
                "thumbnail"
            );

        }
    );

}


/*==================================================
                COMMENTS BUTTON
==================================================*/

function bindCommentsButton(){

    if(
        !exists(DOM.commentsBtn)
    ){

        return;

    }


    DOM.commentsBtn.addEventListener(
        "click",
        function(){

            togglePanel(
                "comments"
            );

        }
    );

}


/*==================================================
                PANEL CLOSE BUTTONS
==================================================*/

function bindPanelCloseButtons(){

    const closeButtons =
        $$(
            [
                ".panel-close",
                ".close-panel",
                "[data-close-panel]"
            ].join(",")
        );


    closeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    closeAllPanels();

                }
            );

        }
    );

}


/*==================================================
                OVERLAY CLOSE
==================================================*/

function bindPanelOverlay(){

    const overlay =
        getPanelOverlay();


    if(!overlay){

        return;

    }


    overlay.addEventListener(
        "click",
        function(){

            closeAllPanels();

        }
    );

}


/*==================================================
                ESCAPE KEY
==================================================*/

function bindEscapeKey(){

    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Escape"
            ){

                if(
                    ReaderState.panelOpen
                ){

                    closeAllPanels();

                    return;

                }


                closeShareBox();

            }

        }
    );

}


/*==================================================
                CONTENTS ITEMS
==================================================*/

function bindContents(){

    const items =
        $$(
            [
                ".contents-item",
                "[data-page]",
                "[data-goto-page]"
            ].join(",")
        );


    items.forEach(
        item => {

            item.addEventListener(
                "click",
                function(){

                    const page =
                        this.dataset.gotoPage ||
                        this.dataset.page;


                    const pageNumber =
                        parseInt(
                            page,
                            10
                        );


                    if(
                        Number.isFinite(
                            pageNumber
                        )
                    ){

                        goToPage(
                            pageNumber
                        );

                        closeAllPanels();

                    }

                }
            );

        }
    );

}


/*==================================================
                UPDATE CONTENT ACTIVE ITEM
==================================================*/

function updateContentsActive(){

    const items =
        $$(
            ".contents-item"
        );


    items.forEach(
        item => {

            const page =
                parseInt(
                    item.dataset.page ||
                    item.dataset.gotoPage ||
                    "0",
                    10
                );


            item.classList.toggle(
                "active",
                page ===
                ReaderState.currentPage
            );

        }
    );

}


/*==================================================
                BOOKMARK PANEL
==================================================*/

function openBookmarksPanel(){

    togglePanel(
        "bookmarks"
    );

    renderBookmarks();

}


/*==================================================
                SETTINGS PANEL
==================================================*/

function openSettingsPanel(){

    togglePanel(
        "settings"
    );

}


/*==================================================
                MENU INTERNAL BUTTONS
==================================================*/

function bindMenuActions(){

    const contentsButtons =
        $$(
            "[data-panel='contents'], #contentsBtn"
        );


    contentsButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    togglePanel(
                        "contents"
                    );

                }
            );

        }
    );


    const bookmarkButtons =
        $$(
            "[data-panel='bookmarks'], #bookmarksBtn"
        );


    bookmarkButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    openBookmarksPanel();

                }
            );

        }
    );


    const settingsButtons =
        $$(
            "[data-panel='settings'], #settingsBtn"
        );


    settingsButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    openSettingsPanel();

                }
            );

        }
    );

}


/*==================================================
                MOBILE BACK BUTTON
==================================================*/

function bindMobileBack(){

    const backButtons =
        $$(
            ".panel-back, [data-panel-back]"
        );


    backButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    closeAllPanels();

                }
            );

        }
    );

}


/*==================================================
                PANEL RESIZE SAFETY
==================================================*/

function handlePanelResize(){

    let resizeTimer;


    window.addEventListener(
        "resize",
        function(){

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    function(){

                        if(
                            window.innerWidth > 760
                        ){

                            const overlay =
                                getPanelOverlay();


                            if(overlay){

                                overlay.classList.remove(
                                    "show"
                                );

                            }

                        }

                    },
                    150
                );

        }
    );

}


/*==================================================
                INITIALIZE PANELS
==================================================*/

function initializePanels(){

    bindMenuButton();

    bindThumbnailButton();

    bindCommentsButton();

    bindPanelCloseButtons();

    bindPanelOverlay();

    bindEscapeKey();

    bindContents();

    bindMenuActions();

    bindMobileBack();

    handlePanelResize();

    updateContentsActive();


    console.log(
        "Chishti Reader: Panels initialized."
    );

}


/*==================================================
                PANEL READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializePanels();

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 5 / 14

        PAGE NAVIGATION
        NEXT / PREVIOUS
        PAGE COUNTER
        READING PROGRESS
==================================================*/


/*==================================================
                PAGE ELEMENT HELPERS
==================================================*/

function getPageElements(){

    return $$(
        ".page-slot, .reader-page, .pdf-page"
    );

}


/*==================================================
                SET TOTAL PAGES
==================================================*/

function setTotalPages(total){

    total =
        Math.max(
            0,
            parseInt(total, 10) || 0
        );


    ReaderState.totalPages =
        total;


    if(
        ReaderState.currentPage >
        total &&
        total > 0
    ){

        ReaderState.currentPage =
            total;

    }


    updatePageCounter();

    updateReadingProgress();

    updateContentsActive();

}


/*==================================================
                SET CURRENT PAGE
==================================================*/

function setCurrentPage(
    page,
    animate = true
){

    const total =
        ReaderState.totalPages;


    if(total <= 0){

        return;

    }


    page =
        parseInt(
            page,
            10
        );


    if(
        !Number.isFinite(page)
    ){

        return;

    }


    const oldPage =
        ReaderState.currentPage;


    page =
        clamp(
            page,
            1,
            total
        );


    if(
        page === oldPage
    ){

        updatePageCounter();

        updateReadingProgress();

        return;

    }


    const direction =
        page > oldPage
            ? "next"
            : "prev";


    ReaderState.currentPage =
        page;


    if(
        animate &&
        ReaderState.pageAnimation
    ){

        animatePageTurn(
            direction
        );

    }


    renderCurrentPage();

    updatePageCounter();

    updateReadingProgress();

    updateContentsActive();

    saveReaderState();

}


/*==================================================
                NEXT PAGE
==================================================*/

function nextReaderPage(){

    if(
        ReaderState.isPageTurning
    ){

        return;

    }


    if(
        ReaderState.totalPages <= 0
    ){

        return;

    }


    if(
        ReaderState.currentPage >=
        ReaderState.totalPages
    ){

        showToast(
            "You are on the last page.",
            "info"
        );

        return;

    }


    setCurrentPage(
        ReaderState.currentPage + 1,
        true
    );

}


/*==================================================
                PREVIOUS PAGE
==================================================*/

function previousReaderPage(){

    if(
        ReaderState.isPageTurning
    ){

        return;

    }


    if(
        ReaderState.totalPages <= 0
    ){

        return;

    }


    if(
        ReaderState.currentPage <= 1
    ){

        showToast(
            "You are on the first page.",
            "info"
        );

        return;

    }


    setCurrentPage(
        ReaderState.currentPage - 1,
        true
    );

}


/*==================================================
                GO TO PAGE
==================================================*/

function goToPage(
    page
){

    page =
        parseInt(
            page,
            10
        );


    if(
        !Number.isFinite(page)
    ){

        return;

    }


    if(
        ReaderState.totalPages <= 0
    ){

        return;

    }


    setCurrentPage(
        page,
        true
    );

}


/*==================================================
                NEXT BUTTON
==================================================*/

function bindNextButtons(){

    const nextButtons =
        [
            DOM.nextBtn,
            DOM.nextPage
        ];


    nextButtons.forEach(
        button => {

            if(!exists(button)){

                return;

            }


            button.addEventListener(
                "click",
                function(){

                    nextReaderPage();

                }
            );

        }
    );


    const extraNextButtons =
        $$(
            [
                "#nextPageBtn",
                "[data-action='next-page']",
                "[data-next-page]"
            ].join(",")
        );


    extraNextButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    nextReaderPage();

                }
            );

        }
    );

}


/*==================================================
                PREVIOUS BUTTON
==================================================*/

function bindPreviousButtons(){

    const previousButtons =
        [
            DOM.prevBtn,
            DOM.previousPage
        ];


    previousButtons.forEach(
        button => {

            if(!exists(button)){

                return;

            }


            button.addEventListener(
                "click",
                function(){

                    previousReaderPage();

                }
            );

        }
    );


    const extraPreviousButtons =
        $$(
            [
                "#previousPageBtn",
                "[data-action='previous-page']",
                "[data-prev-page]"
            ].join(",")
        );


    extraPreviousButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    previousReaderPage();

                }
            );

        }
    );

}


/*==================================================
                PAGE INPUT
==================================================*/

function bindPageCounter(){

    if(
        !exists(DOM.pageCounter)
    ){

        return;

    }


    const input =
        DOM.pageCounter.querySelector(
            "input"
        );


    if(!input){

        return;

    }


    input.addEventListener(
        "keydown",
        function(event){

            if(
                event.key !==
                "Enter"
            ){

                return;

            }


            goToPage(
                this.value
            );


            this.blur();

        }
    );


    input.addEventListener(
        "change",
        function(){

            goToPage(
                this.value
            );

        }
    );

}


/*==================================================
                KEYBOARD NAVIGATION
==================================================*/

function bindKeyboardNavigation(){

    document.addEventListener(
        "keydown",
        function(event){

            const target =
                event.target;


            if(
                target &&
                (
                    target.tagName ===
                    "INPUT" ||
                    target.tagName ===
                    "TEXTAREA" ||
                    target.tagName ===
                    "SELECT" ||
                    target.isContentEditable
                )
            ){

                return;

            }


            switch(event.key){

                case "ArrowRight":

                case "PageDown":

                    event.preventDefault();

                    nextReaderPage();

                    break;


                case "ArrowLeft":

                case "PageUp":

                    event.preventDefault();

                    previousReaderPage();

                    break;


                case "Home":

                    if(
                        ReaderState.totalPages > 0
                    ){

                        event.preventDefault();

                        goToPage(1);

                    }

                    break;


                case "End":

                    if(
                        ReaderState.totalPages > 0
                    ){

                        event.preventDefault();

                        goToPage(
                            ReaderState.totalPages
                        );

                    }

                    break;

            }

        }
    );

}


/*==================================================
                RENDER CURRENT PAGE
==================================================*/

function renderCurrentPage(){

    /*
        Agar future PDF renderer available hai
        to usko call karenge.
    */

    if(
        typeof renderPage ===
        "function"
    ){

        try{

            renderPage(
                ReaderState.currentPage
            );

            return;

        }catch(error){

            console.warn(
                "renderPage() failed:",
                error
            );

        }

    }


    /*
        Existing DOM pages ke saath
        fallback rendering.
    */

    const pages =
        getPageElements();


    if(
        pages.length === 0
    ){

        return;

    }


    pages.forEach(
        (page, index) => {

            const pageNumber =
                parseInt(
                    page.dataset.page ||
                    page.dataset.pageNumber ||
                    (index + 1),
                    10
                );


            const active =
                pageNumber ===
                ReaderState.currentPage;


            page.classList.toggle(
                "active",
                active
            );


            page.classList.toggle(
                "hidden",
                !active
            );


            page.setAttribute(
                "aria-hidden",
                active
                    ? "false"
                    : "true"
            );

        }
    );

}


/*==================================================
                UPDATE NAVIGATION BUTTONS
==================================================*/

function updateNavigationButtons(){

    const atFirstPage =
        ReaderState.currentPage <= 1;


    const atLastPage =
        ReaderState.totalPages > 0 &&
        ReaderState.currentPage >=
        ReaderState.totalPages;


    const previousButtons =
        [
            DOM.prevBtn,
            DOM.previousPage
        ];


    previousButtons.forEach(
        button => {

            if(!exists(button)){

                return;

            }


            button.disabled =
                atFirstPage;

            button.setAttribute(
                "aria-disabled",
                String(atFirstPage)
            );

        }
    );


    const nextButtons =
        [
            DOM.nextBtn,
            DOM.nextPage
        ];


    nextButtons.forEach(
        button => {

            if(!exists(button)){

                return;

            }


            button.disabled =
                atLastPage;

            button.setAttribute(
                "aria-disabled",
                String(atLastPage)
            );

        }
    );

}


/*==================================================
                OVERRIDE PAGE COUNTER UPDATE
==================================================*/

const originalUpdatePageCounter =
    updatePageCounter;


updatePageCounter =
    function(){

        originalUpdatePageCounter();

        updateNavigationButtons();

    };


/*==================================================
                PAGE PROGRESS
==================================================*/

function getReadingProgress(){

    if(
        ReaderState.totalPages <= 0
    ){

        return 0;

    }


    return clamp(
        (
            ReaderState.currentPage /
            ReaderState.totalPages
        ) * 100,
        0,
        100
    );

}


/*==================================================
                SAVE PAGE PROGRESS
==================================================*/

function saveCurrentPage(){

    if(
        !ReaderState.autoSave
    ){

        return;

    }


    saveData(
        STORAGE.progress,
        {

            currentPage:
                ReaderState.currentPage,

            totalPages:
                ReaderState.totalPages,

            savedAt:
                Date.now()

        }
    );

}


/*==================================================
                RESTORE PAGE PROGRESS
==================================================*/

function restorePageProgress(){

    const progress =
        loadData(
            STORAGE.progress,
            null
        );


    if(
        !progress ||
        typeof progress !==
        "object"
    ){

        return;

    }


    const savedPage =
        parseInt(
            progress.currentPage,
            10
        );


    if(
        Number.isFinite(savedPage) &&
        savedPage > 0
    ){

        ReaderState.currentPage =
            savedPage;

    }

}


/*==================================================
                PAGE CLICK
==================================================*/

function bindPageClickNavigation(){

    document.addEventListener(
        "click",
        function(event){

            const target =
                event.target.closest(
                    "[data-goto-page]"
                );


            if(!target){

                return;

            }


            const page =
                target.dataset.gotoPage;


            if(page){

                event.preventDefault();

                goToPage(
                    page
                );

            }

        }
    );

}


/*==================================================
                INITIALIZE NAVIGATION
==================================================*/

function initializePageNavigation(){

    bindNextButtons();

    bindPreviousButtons();

    bindPageCounter();

    bindKeyboardNavigation();

    bindPageClickNavigation();

    restorePageProgress();

    updatePageCounter();

    updateNavigationButtons();

    updateReadingProgress();

    renderCurrentPage();


    console.log(
        "Chishti Reader: Page navigation initialized."
    );

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializePageNavigation();

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 6 / 14

        ZOOM
        FIT PAGE
        VIEW MODE
        DOUBLE / SINGLE PAGE
==================================================*/


/*==================================================
                ZOOM ELEMENTS
==================================================*/

function getZoomTarget(){

    const selectors = [

        "#pdfPages",

        ".pdf-pages",

        "#pageContainer",

        ".page-container",

        "#pagesContainer",

        ".pages-container",

        ".pdf-scroll-area"

    ];


    for(
        const selector of selectors
    ){

        const element =
            document.querySelector(
                selector
            );


        if(element){

            return element;

        }

    }


    return null;

}


/*==================================================
                APPLY ZOOM
==================================================*/

function applyZoom(){

    const target =
        getZoomTarget();


    if(!target){

        updateZoomDisplay();

        return;

    }


    const zoom =
        ReaderState.zoom;


    /*
        Agar page slots available hain,
        unko individually scale karna better hai.
    */

    const pages =
        getPageElements();


    if(
        pages.length > 0
    ){

        pages.forEach(
            page => {

                page.style.transformOrigin =
                    "center top";

                page.style.setProperty(
                    "--reader-zoom",
                    zoom
                );


                /*
                    CSS transform ki jagah
                    zoom property supported browsers
                    mein natural layout maintain karti hai.
                */

                page.style.zoom =
                    zoom;

            }
        );

    }else{

        target.style.transformOrigin =
            "center top";

        target.style.setProperty(
            "--reader-zoom",
            zoom
        );

    }


    updateZoomDisplay();

    saveZoom();

}


/*==================================================
                SET ZOOM
==================================================*/

function setReaderZoom(
    zoom
){

    zoom =
        safeNumber(
            zoom,
            1
        );


    zoom =
        clamp(
            zoom,
            ReaderState.minZoom,
            ReaderState.maxZoom
        );


    ReaderState.zoom =
        Math.round(
            zoom * 100
        ) / 100;


    applyZoom();

}


/*==================================================
                ZOOM IN
==================================================*/

function zoomIn(){

    setReaderZoom(
        ReaderState.zoom +
        ReaderState.zoomStep
    );

}


/*==================================================
                ZOOM OUT
==================================================*/

function zoomOut(){

    setReaderZoom(
        ReaderState.zoom -
        ReaderState.zoomStep
    );

}


/*==================================================
                RESET ZOOM
==================================================*/

function resetZoom(){

    setReaderZoom(
        1
    );

}


/*==================================================
                SAVE ZOOM
==================================================*/

function saveZoom(){

    if(
        !ReaderState.autoSave
    ){

        return;

    }


    saveData(
        STORAGE.zoom,
        ReaderState.zoom
    );

}


/*==================================================
                LOAD ZOOM
==================================================*/

function loadSavedZoom(){

    const savedZoom =
        loadData(
            STORAGE.zoom,
            1
        );


    ReaderState.zoom =
        clamp(
            safeNumber(
                savedZoom,
                1
            ),
            ReaderState.minZoom,
            ReaderState.maxZoom
        );


    updateZoomDisplay();

}


/*==================================================
                ZOOM BUTTONS
==================================================*/

function bindZoomButtons(){

    if(
        exists(DOM.zoomInBtn)
    ){

        DOM.zoomInBtn.addEventListener(
            "click",
            function(){

                zoomIn();

            }
        );

    }


    if(
        exists(DOM.zoomOutBtn)
    ){

        DOM.zoomOutBtn.addEventListener(
            "click",
            function(){

                zoomOut();

            }
        );

    }


    if(
        exists(DOM.fitBtn)
    ){

        DOM.fitBtn.addEventListener(
            "click",
            function(){

                fitPage();

            }
        );

    }


    const extraZoomIn =
        $$(
            [
                "#zoomIn",
                "[data-action='zoom-in']"
            ].join(",")
        );


    extraZoomIn.forEach(
        button => {

            button.addEventListener(
                "click",
                zoomIn
            );

        }
    );


    const extraZoomOut =
        $$(
            [
                "#zoomOut",
                "[data-action='zoom-out']"
            ].join(",")
        );


    extraZoomOut.forEach(
        button => {

            button.addEventListener(
                "click",
                zoomOut
            );

        }
    );


    const resetButtons =
        $$(
            [
                "#resetZoom",
                "[data-action='reset-zoom']"
            ].join(",")
        );


    resetButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                resetZoom
            );

        }
    );

}


/*==================================================
                FIT PAGE
==================================================*/

function fitPage(){

    const scrollArea =
        document.querySelector(
            "#pdfScrollArea, .pdf-scroll-area"
        );


    const pages =
        getPageElements();


    if(
        !scrollArea ||
        pages.length === 0
    ){

        resetZoom();

        return;

    }


    const page =
        pages.find(
            element =>
                element.classList.contains(
                    "active"
                )
        ) ||
        pages[0];


    const pageWidth =
        page.scrollWidth ||
        page.offsetWidth;


    const pageHeight =
        page.scrollHeight ||
        page.offsetHeight;


    const availableWidth =
        scrollArea.clientWidth -
        20;


    const availableHeight =
        scrollArea.clientHeight -
        20;


    if(
        pageWidth <= 0 ||
        pageHeight <= 0
    ){

        resetZoom();

        return;

    }


    const widthScale =
        availableWidth /
        pageWidth;


    const heightScale =
        availableHeight /
        pageHeight;


    let scale =
        Math.min(
            widthScale,
            heightScale
        );


    /*
        Mobile par page ko readable rakhne ke
        liye unnecessarily tiny nahi karna.
    */

    if(
        window.innerWidth <= 600
    ){

        scale =
            Math.min(
                widthScale,
                1
            );

    }


    scale =
        clamp(
            scale,
            ReaderState.minZoom,
            ReaderState.maxZoom
        );


    setReaderZoom(
        scale
    );


    showToast(
        "Page fitted to screen",
        "success"
    );

}


/*==================================================
                SINGLE PAGE VIEW
==================================================*/

function setSinglePageView(){

    const containers =
        $$(
            ".pdf-pages, #pdfPages"
        );


    containers.forEach(
        container => {

            container.classList.remove(
                "view-double"
            );

            container.classList.add(
                "view-single"
            );

        }
    );


    ReaderState.viewMode =
        "single";

}


/*==================================================
                DOUBLE PAGE VIEW
==================================================*/

function setDoublePageView(){

    const containers =
        $$(
            ".pdf-pages, #pdfPages"
        );


    containers.forEach(
        container => {

            container.classList.remove(
                "view-single"
            );

            container.classList.add(
                "view-double"
            );

        }
    );


    ReaderState.viewMode =
        "double";

}


/*==================================================
                TOGGLE VIEW MODE
==================================================*/

function toggleViewMode(){

    if(
        ReaderState.viewMode ===
        "single"
    ){

        /*
            Mobile par double-page ko avoid
            karna better hai.
        */

        if(
            window.innerWidth <= 600
        ){

            showToast(
                "Single page is better on mobile.",
                "info"
            );

            return;

        }


        setDoublePageView();

        showToast(
            "Two page view enabled",
            "success"
        );

    }else{

        setSinglePageView();

        showToast(
            "Single page view enabled",
            "success"
        );

    }


    saveData(
        "chishti-view-mode",
        ReaderState.viewMode
    );

}


/*==================================================
                LOAD VIEW MODE
==================================================*/

function loadViewMode(){

    const saved =
        loadData(
            "chishti-view-mode",
            "single"
        );


    if(
        saved === "double" &&
        window.innerWidth > 600
    ){

        setDoublePageView();

    }else{

        setSinglePageView();

    }

}


/*==================================================
                DOUBLE PAGE BUTTONS
==================================================*/

function bindViewModeButtons(){

    const singleButtons =
        $$(
            [
                "#singlePageBtn",
                "[data-view='single']"
            ].join(",")
        );


    singleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    setSinglePageView();

                }
            );

        }
    );


    const doubleButtons =
        $$(
            [
                "#doublePageBtn",
                "[data-view='double']"
            ].join(",")
        );


    doubleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    if(
                        window.innerWidth <= 600
                    ){

                        showToast(
                            "Two page view is disabled on mobile.",
                            "info"
                        );

                        return;

                    }


                    setDoublePageView();

                }
            );

        }
    );


    const toggleButtons =
        $$(
            [
                "#viewModeBtn",
                "[data-action='toggle-view']"
            ].join(",")
        );


    toggleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                toggleViewMode
            );

        }
    );

}


/*==================================================
                MOUSE WHEEL ZOOM
==================================================*/

function bindWheelZoom(){

    const viewer =
        document.querySelector(
            "#pdfScrollArea, .pdf-scroll-area"
        );


    if(!viewer){

        return;

    }


    viewer.addEventListener(
        "wheel",
        function(event){

            /*
                Ctrl + wheel = zoom
            */

            if(
                !event.ctrlKey
            ){

                return;

            }


            event.preventDefault();


            if(
                event.deltaY < 0
            ){

                zoomIn();

            }else{

                zoomOut();

            }

        },
        {
            passive:false
        }
    );

}


/*==================================================
                PINCH ZOOM MOBILE
==================================================*/

function bindPinchZoom(){

    const viewer =
        document.querySelector(
            "#pdfScrollArea, .pdf-scroll-area"
        );


    if(!viewer){

        return;

    }


    let initialDistance =
        null;


    let initialZoom =
        1;


    function distance(
        touch1,
        touch2
    ){

        const x =
            touch1.clientX -
            touch2.clientX;


        const y =
            touch1.clientY -
            touch2.clientY;


        return Math.sqrt(
            x * x +
            y * y
        );

    }


    viewer.addEventListener(
        "touchstart",
        function(event){

            if(
                event.touches.length !== 2
            ){

                initialDistance =
                    null;

                return;

            }


            initialDistance =
                distance(
                    event.touches[0],
                    event.touches[1]
                );


            initialZoom =
                ReaderState.zoom;

        },
        {
            passive:true
        }
    );


    viewer.addEventListener(
        "touchmove",
        function(event){

            if(
                event.touches.length !== 2 ||
                initialDistance === null
            ){

                return;

            }


            const currentDistance =
                distance(
                    event.touches[0],
                    event.touches[1]
                );


            if(
                initialDistance <= 0
            ){

                return;

            }


            const ratio =
                currentDistance /
                initialDistance;


            const newZoom =
                initialZoom *
                ratio;


            setReaderZoom(
                newZoom
            );

        },
        {
            passive:true
        }
    );


    viewer.addEventListener(
        "touchend",
        function(){

            initialDistance =
                null;

        },
        {
            passive:true
        }
    );

}


/*==================================================
                RESIZE FIT SAFETY
==================================================*/

function bindZoomResize(){

    let timer;


    window.addEventListener(
        "resize",
        function(){

            clearTimeout(
                timer
            );


            timer =
                setTimeout(
                    function(){

                        if(
                            window.innerWidth <= 600 &&
                            ReaderState.viewMode ===
                            "double"
                        ){

                            setSinglePageView();

                        }

                    },
                    180
                );

        }
    );

}


/*==================================================
                INITIALIZE ZOOM
==================================================*/

function initializeZoom(){

    loadSavedZoom();

    loadViewMode();

    bindZoomButtons();

    bindViewModeButtons();

    bindWheelZoom();

    bindPinchZoom();

    bindZoomResize();

    applyZoom();

    updateZoomDisplay();


    console.log(
        "Chishti Reader: Zoom and view controls initialized."
    );

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeZoom();

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 7 / 14

        BOOKMARKS
        COMMENTS
        SAVE / LOAD
==================================================*/


/*==================================================
                BOOKMARK HELPERS
==================================================*/

function isPageBookmarked(page){

    page =
        parseInt(
            page,
            10
        );


    if(
        !Number.isFinite(page)
    ){

        return false;

    }


    return ReaderState.bookmarks.some(
        bookmark =>
            Number(
                bookmark.page
            ) === page
    );

}


/*==================================================
                ADD BOOKMARK
==================================================*/

function addBookmark(
    page = ReaderState.currentPage
){

    page =
        parseInt(
            page,
            10
        );


    if(
        !Number.isFinite(page)
    ){

        return;

    }


    if(
        isPageBookmarked(page)
    ){

        showToast(
            "This page is already bookmarked.",
            "info"
        );

        return;

    }


    ReaderState.bookmarks.push({

        page:
            page,

        title:
            `Page ${page}`,

        createdAt:
            Date.now()

    });


    ReaderState.bookmarks.sort(
        (
            a,
            b
        ) =>
            Number(a.page) -
            Number(b.page)
    );


    saveBookmarks();

    updateBookmarkButton();

    renderBookmarks();


    showToast(
        `Page ${page} bookmarked.`,
        "success"
    );

}


/*==================================================
                REMOVE BOOKMARK
==================================================*/

function removeBookmark(page){

    page =
        parseInt(
            page,
            10
        );


    ReaderState.bookmarks =
        ReaderState.bookmarks.filter(
            bookmark =>
                Number(
                    bookmark.page
                ) !== page
        );


    saveBookmarks();

    updateBookmarkButton();

    renderBookmarks();


    showToast(
        `Page ${page} removed from bookmarks.`,
        "info"
    );

}


/*==================================================
                TOGGLE BOOKMARK
==================================================*/

function toggleBookmark(){

    const page =
        ReaderState.currentPage;


    if(
        isPageBookmarked(page)
    ){

        removeBookmark(page);

    }else{

        addBookmark(page);

    }

}


/*==================================================
                SAVE BOOKMARKS
==================================================*/

function saveBookmarks(){

    saveData(
        STORAGE.bookmarks,
        ReaderState.bookmarks
    );

}


/*==================================================
                LOAD BOOKMARKS
==================================================*/

function loadBookmarks(){

    const saved =
        loadData(
            STORAGE.bookmarks,
            []
        );


    if(
        Array.isArray(saved)
    ){

        ReaderState.bookmarks =
            saved;

    }else{

        ReaderState.bookmarks =
            [];

    }


    updateBookmarkButton();

}


/*==================================================
                UPDATE BOOKMARK BUTTON
==================================================*/

function updateBookmarkButton(){

    const buttons =
        $$(
            [
                "#bookmarkBtn",
                "[data-action='bookmark']"
            ].join(",")
        );


    const active =
        isPageBookmarked(
            ReaderState.currentPage
        );


    buttons.forEach(
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
                active
                    ? "true"
                    : "false"
            );


            const icon =
                button.querySelector(
                    "i"
                );


            if(icon){

                icon.className =
                    active
                        ? "ri-bookmark-fill"
                        : "ri-bookmark-line";

            }

        }
    );

}


/*==================================================
                RENDER BOOKMARKS
==================================================*/

function renderBookmarks(){

    if(
        !exists(
            DOM.bookmarkList
        )
    ){

        return;

    }


    DOM.bookmarkList.innerHTML =
        "";


    if(
        ReaderState.bookmarks.length === 0
    ){

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-state";


        empty.textContent =
            "No bookmarks yet.";


        DOM.bookmarkList.appendChild(
            empty
        );


        return;

    }


    ReaderState.bookmarks.forEach(
        bookmark => {

            const item =
                document.createElement(
                    "button"
                );


            item.type =
                "button";


            item.className =
                "bookmark-item";


            item.dataset.page =
                bookmark.page;


            item.innerHTML = `
                <span class="bookmark-icon">
                    <i class="ri-bookmark-fill"></i>
                </span>

                <span class="bookmark-info">
                    <strong>
                        ${escapeHTML(
                            bookmark.title ||
                            `Page ${bookmark.page}`
                        )}
                    </strong>

                    <small>
                        Page ${bookmark.page}
                    </small>
                </span>

                <span class="bookmark-arrow">
                    <i class="ri-arrow-right-s-line"></i>
                </span>
            `;


            item.addEventListener(
                "click",
                function(){

                    goToPage(
                        bookmark.page
                    );


                    closeAllPanels();

                }
            );


            DOM.bookmarkList.appendChild(
                item
            );

        }
    );

}


/*==================================================
                BOOKMARK BUTTON EVENTS
==================================================*/

function bindBookmarkButtons(){

    const buttons =
        $$(
            [
                "#bookmarkBtn",
                "[data-action='bookmark']"
            ].join(",")
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    toggleBookmark();

                }
            );

        }
    );

}


/*==================================================
                COMMENT HELPERS
==================================================*/

function createComment(
    name,
    text,
    page
){

    return {

        id:
            `comment-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2,8)}`,

        name:
            String(
                name ||
                "Anonymous"
            ).trim(),

        text:
            String(
                text ||
                ""
            ).trim(),

        page:
            parseInt(
                page,
                10
            ) || 1,

        createdAt:
            Date.now()

    };

}


/*==================================================
                ADD COMMENT
==================================================*/

function addComment(
    name,
    text,
    page = ReaderState.currentPage
){

    name =
        String(
            name ||
            ""
        ).trim();


    text =
        String(
            text ||
            ""
        ).trim();


    if(
        !name
    ){

        showToast(
            "Please enter your name.",
            "warning"
        );

        if(
            exists(DOM.commentName)
        ){

            DOM.commentName.focus();

        }

        return false;

    }


    if(
        !text
    ){

        showToast(
            "Please write a comment.",
            "warning"
        );

        return false;

    }


    if(
        text.length > 1000
    ){

        showToast(
            "Comment is too long.",
            "warning"
        );

        return false;

    }


    const comment =
        createComment(
            name,
            text,
            page
        );


    ReaderState.comments.unshift(
        comment
    );


    saveComments();

    renderComments();


    if(
        exists(DOM.commentName)
    ){

        DOM.commentName.value =
            "";

    }


    const commentInput =
        document.querySelector(
            "#commentInput, #commentText, textarea[name='comment']"
        );


    if(commentInput){

        commentInput.value =
            "";

    }


    showToast(
        "Comment posted.",
        "success"
    );


    return true;

}


/*==================================================
                DELETE COMMENT
==================================================*/

function deleteComment(
    commentId
){

    ReaderState.comments =
        ReaderState.comments.filter(
            comment =>
                comment.id !==
                commentId
        );


    saveComments();

    renderComments();


    showToast(
        "Comment deleted.",
        "info"
    );

}


/*==================================================
                SAVE COMMENTS
==================================================*/

function saveComments(){

    saveData(
        STORAGE.comments,
        ReaderState.comments
    );

}


/*==================================================
                LOAD COMMENTS
==================================================*/

function loadComments(){

    const saved =
        loadData(
            STORAGE.comments,
            []
        );


    if(
        Array.isArray(saved)
    ){

        ReaderState.comments =
            saved;

    }else{

        ReaderState.comments =
            [];

    }


    renderComments();

}


/*==================================================
                RENDER COMMENTS
==================================================*/

function renderComments(){

    if(
        !exists(
            DOM.commentsList
        )
    ){

        return;

    }


    DOM.commentsList.innerHTML =
        "";


    if(
        ReaderState.comments.length === 0
    ){

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-state";


        empty.textContent =
            "No comments yet.";


        DOM.commentsList.appendChild(
            empty
        );


        return;

    }


    ReaderState.comments.forEach(
        comment => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "comment-item";


            item.dataset.commentId =
                comment.id;


            const date =
                formatCommentDate(
                    comment.createdAt
                );


            item.innerHTML = `
                <div class="comment-header">

                    <div class="comment-user">

                        <span class="comment-avatar">
                            ${escapeHTML(
                                getInitial(
                                    comment.name
                                )
                            )}
                        </span>

                        <div>
                            <strong>
                                ${escapeHTML(
                                    comment.name
                                )}
                            </strong>

                            <small>
                                ${date}
                            </small>
                        </div>

                    </div>

                    <button
                        type="button"
                        class="comment-delete"
                        data-comment-delete="${escapeHTML(
                            comment.id
                        )}"
                        title="Delete comment"
                    >
                        <i class="ri-delete-bin-line"></i>
                    </button>

                </div>

                <p class="comment-text">
                    ${escapeHTML(
                        comment.text
                    )}
                </p>

                <button
                    type="button"
                    class="comment-page"
                    data-comment-page="${comment.page}"
                >
                    Page ${comment.page}
                </button>
            `;


            DOM.commentsList.appendChild(
                item
            );

        }
    );


    bindRenderedCommentButtons();

}


/*==================================================
                COMMENT BUTTON EVENTS
==================================================*/

function bindRenderedCommentButtons(){

    const deleteButtons =
        $$(
            "[data-comment-delete]"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    deleteComment(
                        this.dataset.commentDelete
                    );

                }
            );

        }
    );


    const pageButtons =
        $$(
            "[data-comment-page]"
        );


    pageButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    goToPage(
                        this.dataset.commentPage
                    );

                }
            );

        }
    );

}


/*==================================================
                COMMENT FORM
==================================================*/

function bindCommentForm(){

    const form =
        document.querySelector(
            "#commentForm, .comment-form"
        );


    if(form){

        form.addEventListener(
            "submit",
            function(event){

                event.preventDefault();


                const input =
                    this.querySelector(
                        "textarea, [name='comment'], #commentInput, #commentText"
                    );


                const name =
                    exists(
                        DOM.commentName
                    )
                        ? DOM.commentName.value
                        : "Anonymous";


                const text =
                    input
                        ? input.value
                        : "";


                addComment(
                    name,
                    text
                );

            }
        );

    }


    const postButton =
        document.querySelector(
            "#postCommentBtn, [data-action='post-comment']"
        );


    if(
        postButton &&
        !form
    ){

        postButton.addEventListener(
            "click",
            function(){

                const input =
                    document.querySelector(
                        "#commentInput, #commentText, textarea[name='comment']"
                    );


                addComment(
                    exists(DOM.commentName)
                        ? DOM.commentName.value
                        : "Anonymous",

                    input
                        ? input.value
                        : ""
                );

            }
        );

    }

}


/*==================================================
                ESCAPE HTML
==================================================*/

function escapeHTML(value){

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value === undefined ||
        value === null
            ? ""
            : String(value);


    return div.innerHTML;

}


/*==================================================
                INITIAL LETTER
==================================================*/

function getInitial(name){

    const value =
        String(
            name ||
            "A"
        ).trim();


    return (
        value.charAt(0) ||
        "A"
    ).toUpperCase();

}


/*==================================================
                COMMENT DATE
==================================================*/

function formatCommentDate(
    timestamp
){

    const date =
        new Date(
            Number(timestamp)
        );


    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return "Just now";

    }


    return date.toLocaleDateString(
        undefined,
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    );

}


/*==================================================
                UPDATE BOOKMARK ON PAGE CHANGE
==================================================*/

const previousSetCurrentPage =
    setCurrentPage;


setCurrentPage =
    function(
        page,
        animate = true
    ){

        previousSetCurrentPage(
            page,
            animate
        );


        updateBookmarkButton();

    };


/*==================================================
                INITIALIZE BOOKMARKS
==================================================*/

function initializeBookmarks(){

    loadBookmarks();

    renderBookmarks();

    bindBookmarkButtons();


    console.log(
        "Chishti Reader: Bookmarks initialized."
    );

}


/*==================================================
                INITIALIZE COMMENTS
==================================================*/

function initializeComments(){

    loadComments();

    bindCommentForm();


    console.log(
        "Chishti Reader: Comments initialized."
    );

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeBookmarks();

        initializeComments();

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 8 / 14

        LIKE
        SHARE
        COPY LINK
        NATIVE SHARE
        SHARE POPUP
==================================================*/


/*==================================================
                SHARE ELEMENTS
==================================================*/

const ShareState = {

    open: false,

    copied: false

};


/*==================================================
                FIND SHARE BOX
==================================================*/

function getShareBox(){

    const selectors = [

        "#shareBox",

        ".shareBox",

        "#shareModal",

        ".share-modal",

        "#sharePanel",

        ".share-panel"

    ];


    for(
        const selector of selectors
    ){

        const element =
            document.querySelector(
                selector
            );


        if(element){

            return element;

        }

    }


    return null;

}


/*==================================================
                OPEN SHARE BOX
==================================================*/

function openShareBox(){

    const box =
        getShareBox();


    if(!box){

        shareBookNative();

        return;

    }


    box.classList.add(
        "show",
        "active",
        "open"
    );


    box.setAttribute(
        "aria-hidden",
        "false"
    );


    ShareState.open =
        true;


    document.body.classList.add(
        "share-open"
    );


    /*
        Background overlay agar share box
        modal type ho.
    */

    const overlay =
        document.querySelector(
            "#shareOverlay, .share-overlay"
        );


    if(overlay){

        overlay.classList.add(
            "show"
        );

    }

}


/*==================================================
                CLOSE SHARE BOX
==================================================*/

function closeShareBox(){

    const box =
        getShareBox();


    if(box){

        box.classList.remove(
            "show",
            "active",
            "open"
        );


        box.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    const overlay =
        document.querySelector(
            "#shareOverlay, .share-overlay"
        );


    if(overlay){

        overlay.classList.remove(
            "show"
        );

    }


    ShareState.open =
        false;


    document.body.classList.remove(
        "share-open"
    );

}


/*==================================================
                SHARE BUTTON
==================================================*/

function bindShareButton(){

    if(
        exists(DOM.shareBtn)
    ){

        DOM.shareBtn.addEventListener(
            "click",
            function(){

                openShareBox();

            }
        );

    }


    const extraButtons =
        $$(
            [
                "#openShareBtn",
                "[data-action='share']"
            ].join(",")
        );


    extraButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    openShareBox();

                }
            );

        }
    );

}


/*==================================================
                SHARE CLOSE BUTTON
==================================================*/

function bindShareClose(){

    if(
        exists(DOM.shareClose)
    ){

        DOM.shareClose.addEventListener(
            "click",
            function(){

                closeShareBox();

            }
        );

    }


    const closeButtons =
        $$(
            [
                "#closeShareBtn",
                ".share-close",
                "[data-share-close]"
            ].join(",")
        );


    closeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    closeShareBox();

                }
            );

        }
    );


    const overlay =
        document.querySelector(
            "#shareOverlay, .share-overlay"
        );


    if(overlay){

        overlay.addEventListener(
            "click",
            function(){

                closeShareBox();

            }
        );

    }

}


/*==================================================
                BOOK TITLE
==================================================*/

function getBookTitle(){

    const selectors = [

        "#bookTitle",

        ".book-title",

        "[data-book-title]",

        "h1.book-name",

        "h1"

    ];


    for(
        const selector of selectors
    ){

        const element =
            document.querySelector(
                selector
            );


        if(
            element &&
            element.textContent.trim()
        ){

            return element.textContent.trim();

        }

    }


    return "Chishti Library Book";

}


/*==================================================
                BOOK URL
==================================================*/

function getBookURL(){

    return window.location.href;

}


/*==================================================
                SHARE TEXT
==================================================*/

function getShareText(){

    const title =
        getBookTitle();


    return `Read "${title}" on Chishti Library.`;

}


/*==================================================
                COPY LINK
==================================================*/

async function copyBookLink(){

    const url =
        getBookURL();


    /*
        Modern Clipboard API
    */

    if(
        navigator.clipboard &&
        typeof navigator.clipboard.writeText ===
        "function"
    ){

        try{

            await navigator.clipboard.writeText(
                url
            );


            ShareState.copied =
                true;


            showToast(
                "Book link copied.",
                "success"
            );


            updateCopyButton();


            return true;

        }catch(error){

            console.warn(
                "Clipboard API failed:",
                error
            );

        }

    }


    /*
        Fallback for older browsers
    */

    try{

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            url;


        textarea.style.position =
            "fixed";


        textarea.style.opacity =
            "0";


        document.body.appendChild(
            textarea
        );


        textarea.focus();

        textarea.select();


        const copied =
            document.execCommand(
                "copy"
            );


        document.body.removeChild(
            textarea
        );


        if(copied){

            ShareState.copied =
                true;


            showToast(
                "Book link copied.",
                "success"
            );


            updateCopyButton();


            return true;

        }

    }catch(error){

        console.warn(
            "Copy fallback failed:",
            error
        );

    }


    showToast(
        "Unable to copy link.",
        "error"
    );


    return false;

}


/*==================================================
                COPY BUTTON
==================================================*/

function updateCopyButton(){

    if(
        !exists(
            DOM.copyLinkBtn
        )
    ){

        return;

    }


    const icon =
        DOM.copyLinkBtn.querySelector(
            "i"
        );


    if(
        ShareState.copied
    ){

        if(icon){

            icon.className =
                "ri-check-line";

        }


        const text =
            DOM.copyLinkBtn.querySelector(
                "span"
            );


        if(text){

            text.textContent =
                "Copied";

        }else{

            /*
                Sirf text node ho to
                button ka label preserve karna.
            */

            DOM.copyLinkBtn.setAttribute(
                "aria-label",
                "Link copied"
            );

        }

    }else{

        if(icon){

            icon.className =
                "ri-link";

        }


        DOM.copyLinkBtn.setAttribute(
            "aria-label",
            "Copy book link"
        );

    }

}


/*==================================================
                COPY BUTTON EVENT
==================================================*/

function bindCopyButton(){

    if(
        exists(
            DOM.copyLinkBtn
        )
    ){

        DOM.copyLinkBtn.addEventListener(
            "click",
            function(){

                copyBookLink();

            }
        );

    }


    const extraButtons =
        $$(
            [
                "#copyLink",
                "[data-action='copy-link']"
            ].join(",")
        );


    extraButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    copyBookLink();

                }
            );

        }
    );

}


/*==================================================
                NATIVE SHARE
==================================================*/

async function shareBookNative(){

    const title =
        getBookTitle();


    const url =
        getBookURL();


    const text =
        getShareText();


    if(
        navigator.share &&
        typeof navigator.share ===
        "function"
    ){

        try{

            await navigator.share({

                title:
                    title,

                text:
                    text,

                url:
                    url

            });


            showToast(
                "Book shared.",
                "success"
            );


            return true;

        }catch(error){

            /*
                User ne share sheet cancel kiya
                ho to error toast nahi dikhana.
            */

            if(
                error &&
                error.name ===
                "AbortError"
            ){

                return false;

            }


            console.warn(
                "Native share failed:",
                error
            );

        }

    }


    /*
        Agar native share available nahi hai,
        link copy kar denge.
    */

    return copyBookLink();

}


/*==================================================
                NATIVE SHARE BUTTON
==================================================*/

function bindNativeShare(){

    if(
        exists(
            DOM.nativeShareBtn
        )
    ){

        DOM.nativeShareBtn.addEventListener(
            "click",
            function(){

                shareBookNative();

            }
        );

    }


    const extraButtons =
        $$(
            [
                "#nativeShare",
                "[data-action='native-share']"
            ].join(",")
        );


    extraButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    shareBookNative();

                }
            );

        }
    );

}


/*==================================================
                LIKE BUTTON
==================================================*/

function updateLikeButton(){

    if(
        !exists(
            DOM.likeBtn
        )
    ){

        return;

    }


    DOM.likeBtn.classList.toggle(
        "liked",
        ReaderState.liked
    );


    DOM.likeBtn.classList.toggle(
        "active",
        ReaderState.liked
    );


    DOM.likeBtn.setAttribute(
        "aria-pressed",
        ReaderState.liked
            ? "true"
            : "false"
    );


    const icon =
        DOM.likeBtn.querySelector(
            "i"
        );


    if(icon){

        icon.className =
            ReaderState.liked
                ? "ri-heart-fill"
                : "ri-heart-line";

    }


    if(
        exists(
            DOM.likeCount
        )
    ){

        setText(
            DOM.likeCount,
            ReaderState.likeCount
        );

    }

}


/*==================================================
                SAVE LIKE
==================================================*/

function saveLikeState(){

    saveData(
        STORAGE.likes,
        {

            liked:
                ReaderState.liked,

            count:
                ReaderState.likeCount

        }
    );

}


/*==================================================
                TOGGLE LIKE
==================================================*/

function toggleLike(){

    if(
        ReaderState.liked
    ){

        ReaderState.liked =
            false;


        /*
            Local demo reader mein unlike par
            count decrease hoga.
        */

        ReaderState.likeCount =
            Math.max(
                0,
                ReaderState.likeCount - 1
            );


        showToast(
            "Book unliked.",
            "info"
        );

    }else{

        ReaderState.liked =
            true;


        ReaderState.likeCount +=
            1;


        showToast(
            "Book liked.",
            "success"
        );

    }


    saveLikeState();

    updateLikeButton();

}


/*==================================================
                LIKE EVENT
==================================================*/

function bindLikeButton(){

    if(
        exists(
            DOM.likeBtn
        )
    ){

        DOM.likeBtn.addEventListener(
            "click",
            function(){

                toggleLike();

            }
        );

    }


    const extraButtons =
        $$(
            [
                "#likeBookBtn",
                "[data-action='like']"
            ].join(",")
        );


    extraButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    toggleLike();

                }
            );

        }
    );

}


/*==================================================
                SHARE KEYBOARD SHORTCUT
==================================================*/

function bindShareShortcut(){

    document.addEventListener(
        "keydown",
        function(event){

            const target =
                event.target;


            if(
                target &&
                (
                    target.tagName ===
                    "INPUT" ||
                    target.tagName ===
                    "TEXTAREA" ||
                    target.isContentEditable
                )
            ){

                return;

            }


            /*
                Ctrl/Cmd + Shift + S
            */

            if(
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.shiftKey &&
                event.key.toLowerCase() ===
                "s"
            ){

                event.preventDefault();

                openShareBox();

            }

        }
    );

}


/*==================================================
                SHARE INITIALIZATION
==================================================*/

function initializeSharing(){

    bindShareButton();

    bindShareClose();

    bindCopyButton();

    bindNativeShare();

    bindLikeButton();

    bindShareShortcut();

    updateCopyButton();

    updateLikeButton();


    console.log(
        "Chishti Reader: Like and Share initialized."
    );

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeSharing();

    }
);
/*==================================================
        CHISHTI LIBRARY READER
        JAVASCRIPT PART 9 / 14

        BOOK SEARCH
        SEARCH RESULTS
        PAGE JUMP
        HIGHLIGHT
==================================================*/


/*==================================================
                SEARCH STATE
==================================================*/

const SearchState = {

    query:
        "",

    results:
        [],

    currentResult:
        -1,

    active:
        false

};


/*==================================================
                SEARCH ELEMENTS
==================================================*/

function getSearchInput(){

    return (
        DOM.searchInput ||

        document.querySelector(
            "#searchInput"
        ) ||

        document.querySelector(
            "[name='search']"
        ) ||

        document.querySelector(
            ".search-input"
        )
    );

}


/*==================================================
                SEARCH RESULT CONTAINER
==================================================*/

function getSearchResultsContainer(){

    const existing =
        document.querySelector(
            "#searchResults, .search-results"
        );


    if(existing){

        return existing;

    }


    const input =
        getSearchInput();


    if(
        !input ||
        !input.parentElement
    ){

        return null;

    }


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "searchResults";


    container.className =
        "search-results";


    input.parentElement.appendChild(
        container
    );


    return container;

}


/*==================================================
                GET PAGE TEXT
==================================================*/

function getPageText(
    page
){

    if(!page){

        return "";

    }


    /*
        Script/style ko text search mein
        include nahi karna.
    */

    const clone =
        page.cloneNode(
            true
        );


    clone
        .querySelectorAll(
            "script, style, button"
        )
        .forEach(
            element =>
                element.remove()
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


/*==================================================
                SEARCH ALL PAGES
==================================================*/

function searchBook(
    query
){

    query =
        String(
            query ||
            ""
        )
        .trim();


    SearchState.query =
        query;


    SearchState.results =
        [];


    SearchState.currentResult =
        -1;


    SearchState.active =
        query.length > 0;


    clearSearchHighlights();


    if(
        !query
    ){

        renderSearchResults();

        return [];

    }


    const pages =
        getPageElements();


    /*
        Case-insensitive search.
    */

    const normalizedQuery =
        query.toLocaleLowerCase();


    pages.forEach(
        (
            page,
            index
        ) => {

            const text =
                getPageText(
                    page
                );


            if(!text){

                return;

            }


            const normalizedText =
                text.toLocaleLowerCase();


            let position =
                normalizedText.indexOf(
                    normalizedQuery
                );


            let matchCount =
                0;


            while(
                position !== -1 &&
                matchCount < 50
            ){

                const start =
                    Math.max(
                        0,
                        position - 55
                    );


                const end =
                    Math.min(
                        text.length,
                        position +
                        query.length +
                        75
                    );


                let snippet =
                    text.slice(
                        start,
                        end
                    );


                if(start > 0){

                    snippet =
                        "..." +
                        snippet;

                }


                if(end < text.length){

                    snippet +=
                        "...";

                }


                SearchState.results.push({

                    page:
                        parseInt(
                            page.dataset.page ||
                            page.dataset.pageNumber ||
                            index + 1,
                            10
                        ),

                    snippet:
                        snippet,

                    index:
                        matchCount,

                    position:
                        position

                });


                matchCount +=
                    1;


                position =
                    normalizedText.indexOf(
                        normalizedQuery,
                        position +
                        normalizedQuery.length
                    );

            }

        }
    );


    renderSearchResults();


    if(
        SearchState.results.length > 0
    ){

        SearchState.currentResult =
            0;


        showSearchResult(
            0
        );

    }


    return SearchState.results;

}


/*==================================================
                RENDER SEARCH RESULTS
==================================================*/

function renderSearchResults(){

    const container =
        getSearchResultsContainer();


    if(!container){

        return;

    }


    container.innerHTML =
        "";


    if(
        !SearchState.query
    ){

        container.classList.remove(
            "has-results"
        );

        return;

    }


    container.classList.add(
        "has-results"
    );


    if(
        SearchState.results.length === 0
    ){

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "search-empty";


        empty.innerHTML = `
            <i class="ri-search-line"></i>
            <span>No results found.</span>
        `;


        container.appendChild(
            empty
        );


        return;

    }


    const header =
        document.createElement(
            "div"
        );


    header.className =
        "search-result-header";


    header.innerHTML = `
        <strong>
            ${SearchState.results.length}
            result${SearchState.results.length === 1 ? "" : "s"}
        </strong>
    `;


    container.appendChild(
        header
    );


    SearchState.results.forEach(
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


            item.dataset.resultIndex =
                index;


            item.innerHTML = `
                <span class="search-result-page">
                    Page ${result.page}
                </span>

                <span class="search-result-snippet">
                    ${highlightSearchText(
                        result.snippet,
                        SearchState.query
                    )}
                </span>
            `;


            item.addEventListener(
                "click",
                function(){

                    showSearchResult(
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


/*==================================================
                HIGHLIGHT SEARCH TEXT
==================================================*/

function highlightSearchText(
    text,
    query
){

    const safeText =
        escapeHTML(
            text
        );


    if(
        !query
    ){

        return safeText;

    }


    const escapedQuery =
        String(
            query
        )
        .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );


    try{

        const regex =
            new RegExp(
                `(${escapedQuery})`,
                "gi"
            );


        return safeText.replace(
            regex,
            "<mark>$1</mark>"
        );

    }catch(error){

        return safeText;

    }

}


/*==================================================
                SHOW SEARCH RESULT
==================================================*/

function showSearchResult(
    index
){

    if(
        index < 0 ||
        index >=
        SearchState.results.length
    ){

        return;

    }


    const result =
        SearchState.results[
            index
        ];


    SearchState.currentResult =
        index;


    goToPage(
        result.page
    );


    updateSearchResultActive();


    highlightCurrentPageSearch();


    const container =
        getSearchResultsContainer();


    if(
        container
    ){

        const active =
            container.querySelector(
                `[data-result-index="${index}"]`
            );


        if(active){

            active.scrollIntoView({
                behavior:
                    "smooth",

                block:
                    "nearest"
            });

        }

    }

}


/*==================================================
                NEXT SEARCH RESULT
==================================================*/

function nextSearchResult(){

    if(
        SearchState.results.length === 0
    ){

        return;

    }


    let next =
        SearchState.currentResult +
        1;


    if(
        next >=
        SearchState.results.length
    ){

        next =
            0;

    }


    showSearchResult(
        next
    );

}


/*==================================================
                PREVIOUS SEARCH RESULT
==================================================*/

function previousSearchResult(){

    if(
        SearchState.results.length === 0
    ){

        return;

    }


    let previous =
        SearchState.currentResult -
        1;


    if(
        previous < 0
    ){

        previous =
            SearchState.results.length - 1;

    }


    showSearchResult(
        previous
    );

}


/*==================================================
                UPDATE ACTIVE RESULT
==================================================*/

function updateSearchResultActive(){

    const container =
        getSearchResultsContainer();


    if(!container){

        return;

    }


    const results =
        container.querySelectorAll(
            ".search-result"
        );


    results.forEach(
        (
            result,
            index
        ) => {

            result.classList.toggle(
                "active",
                index ===
                SearchState.currentResult
            );

        }
    );

}


/*==================================================
                CLEAR HIGHLIGHTS
==================================================*/

function clearSearchHighlights(){

    const highlighted =
        $$(
            [
                ".search-highlight",
                ".search-match"
            ].join(",")
        );


    highlighted.forEach(
        element => {

            const parent =
                element.parentNode;


            if(!parent){

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

}


/*==================================================
                HIGHLIGHT CURRENT PAGE
==================================================*/

function highlightCurrentPageSearch(){

    clearSearchHighlights();


    if(
        !SearchState.query
    ){

        return;

    }


    const pages =
        getPageElements();


    const currentPage =
        pages.find(
            (
                page,
                index
            ) => {

                const pageNumber =
                    parseInt(
                        page.dataset.page ||
                        page.dataset.pageNumber ||
                        index + 1,
                        10
                    );


                return (
                    pageNumber ===
                    ReaderState.currentPage
                );

            }
        );


    if(!currentPage){

        return;

    }


    /*
        Text nodes ke andar search highlight.
        Buttons / controls ko touch nahi karna.
    */

    const walker =
        document.createTreeWalker(
            currentPage,
            NodeFilter.SHOW_TEXT,
            {

                acceptNode:
                    function(node){

                        const parent =
                            node.parentElement;


                        if(
                            !parent ||
                            parent.closest(
                                "script, style, button, input, textarea, select"
                            )
                        ){

                            return NodeFilter.FILTER_REJECT;

                        }


                        if(
                            node.textContent
                                .toLocaleLowerCase()
                                .includes(
                                    SearchState.query
                                        .toLocaleLowerCase()
                                )
                        ){

                            return NodeFilter.FILTER_ACCEPT;

                        }


                        return NodeFilter.FILTER_REJECT;

                    }

            }
        );


    const textNodes =
        [];


    let node;


    while(
        node =
        walker.nextNode()
    ){

        textNodes.push(
            node
        );

    }


    textNodes.forEach(
        textNode => {

            const text =
                textNode.textContent;


            const escapedQuery =
                SearchState.query
                    .replace(
                        /[.*+?^${}()|[\]\\]/g,
                        "\\$&"
                    );


            const regex =
                new RegExp(
                    `(${escapedQuery})`,
                    "gi"
                );


            if(
                !regex.test(text)
            ){

                return;

            }


            regex.lastIndex =
                0;


            const fragment =
                document.createDocumentFragment();


            let lastIndex =
                0;


            text.replace(
                regex,
                function(
                    match,
                    _group,
                    offset
                ){

                    fragment.appendChild(
                        document.createTextNode(
                            text.slice(
                                lastIndex,
                                offset
                            )
                        )
                    );


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


                    lastIndex =
                        offset +
                        match.length;


                    return match;

                }
            );


            fragment.appendChild(
                document.createTextNode(
                    text.slice(
                        lastIndex
                    )
                )
            );


            textNode.parentNode.replaceChild(
                fragment,
                textNode
            );

        }
    );


    const firstHighlight =
        currentPage.querySelector(
            ".search-highlight"
        );


    if(firstHighlight){

        firstHighlight.scrollIntoView({
            behavior:
                "smooth",

            block:
                "center"
        });

    }

}


/*==================================================
                CLEAR SEARCH
==================================================*/

function clearBookSearch(){

    SearchState.query =
        "";

    SearchState.results =
        [];

    SearchState.currentResult =
        -1;

    SearchState.active =
        false;


    clearSearchHighlights();

    renderSearchResults();

}


/*==================================================
                SEARCH INPUT
==================================================*/

function bindSearchInput(){

    const input =
        getSearchInput();


    if(!input){

        return;

    }


    let timer;


    input.addEventListener(
        "input",
        function(){

            clearTimeout(
                timer
            );


            const value =
                this.value;


            timer =
                setTimeout(
                    function(){

                        searchBook(
                            value
                        );

                    },
                    180
                );

        }
    );


    input.addEventListener(
        "keydown",
        function(event){

            if(
                event.key ===
                "Enter"
            ){

                event.preventDefault();


                if(
                    SearchState.results.length > 0
                ){

                    nextSearchResult();

                }else{

                    searchBook(
                        this.value
                    );

                }

            }


            if(
                event.key ===
                "Escape"
            ){

                this.value =
                    "";


                clearBookSearch();

            }

        }
    );

}


/*==================================================
                SEARCH CLEAR BUTTON
==================================================*/

function bindSearchClear(){

    const buttons =
        $$(
            [
                "#clearSearch",
                "#clearSearchBtn",
                ".clear-search",
                "[data-action='clear-search']"
            ].join(",")
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(){

                    const input =
                        getSearchInput();


                    if(input){

                        input.value =
                            "";

                    }


                    clearBookSearch();


                    if(input){

                        input.focus();

                    }

                }
            );

        }
    );

}


/*==================================================
                SEARCH NEXT/PREV BUTTONS
==================================================*/

function bindSearchNavigation(){

    const nextButtons =
        $$(
            [
                "#nextSearchResult",
                "[data-action='next-search']"
            ].join(",")
        );


    nextButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                nextSearchResult
            );

        }
    );


    const previousButtons =
        $$(
            [
                "#previousSearchResult",
                "[data-action='previous-search']"
            ].join(",")
        );


    previousButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                previousSearchResult
            );

        }
    );

}


/*==================================================
                SEARCH SHORTCUT
==================================================*/

function bindSearchShortcut(){

    document.addEventListener(
        "keydown",
        function(event){

            const target =
                event.target;


            if(
                target &&
                (
                    target.tagName ===
                    "INPUT" ||
                    target.tagName ===
                    "TEXTAREA" ||
                    target.isContentEditable
                )
            ){

                return;

            }


            /*
                Ctrl + F / Cmd + F
            */

            if(
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                "f"
            ){

                event.preventDefault();


                const input =
                    getSearchInput();


                if(input){

                    input.focus();

                    input.select();

                }

            }

        }
    );

}


/*==================================================
                INITIALIZE SEARCH
==================================================*/

function initializeSearch(){

    bindSearchInput();

    bindSearchClear();

    bindSearchNavigation();

    bindSearchShortcut();


    console.log(
        "Chishti Reader: Search initialized."
    );

}


/*==================================================
                DOM READY
==================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeSearch();

    }
);
