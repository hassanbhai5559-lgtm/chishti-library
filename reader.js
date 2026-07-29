/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 1 OF 25
   Foundation
========================================================== */

"use strict";

/* ==========================================================
   Configuration
========================================================== */

const APP_CONFIG = Object.freeze({

    name: "CHISHTI READER",

    version: "6.0.0",

    build: "production"

});

/* ==========================================================
   Application State
========================================================== */

const APP_STATE = {

    initialized: false,

    loading: false,

    pdf: null,

    currentPage: 1,

    totalPages: 0,

    zoom: 1,

    rotation: 0,

    theme: "maroon",

    viewMode: "single",

    bookmarks: [],

    searchResults: [],

    activeSearchIndex: -1

};

/* ==========================================================
   DOM Cache
========================================================== */

const DOM = {};

/* ==========================================================
   Helpers
========================================================== */

const $ = (selector, scope = document) =>
    scope.querySelector(selector);

const $$ = (selector, scope = document) =>
    [...scope.querySelectorAll(selector)];

const byId = (id) =>
    document.getElementById(id);

/* ==========================================================
   DOM Initialization
========================================================== */

function cacheDomElements() {

    DOM.app = byId("readerApp");

    DOM.loader = byId("appLoader");

    DOM.reader = byId("readerShell");

    DOM.leftCanvas = byId("leftPageCanvas");

    DOM.rightCanvas = byId("rightPageCanvas");

    DOM.pageInput = byId("pageInput");

    DOM.pageLabel = byId("pageIndicator");

    DOM.zoomLabel = byId("zoomLabel");

    DOM.toast = byId("toast");

}

/* ==========================================================
   Ready
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        cacheDomElements();

    },

    {

        once: true

    }
 /* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 2 OF 25
   Utilities
========================================================== */

/* ==========================================================
   Type Checks
========================================================== */

const isFunction = value =>
    typeof value === "function";

const isString = value =>
    typeof value === "string";

const isNumber = value =>
    typeof value === "number" &&
    Number.isFinite(value);

const isElement = value =>
    value instanceof HTMLElement;

/* ==========================================================
   Safe DOM
========================================================== */

function show(element) {

    if (!isElement(element)) return;

    element.hidden = false;

}

function hide(element) {

    if (!isElement(element)) return;

    element.hidden = true;

}

function toggle(element, state) {

    state ? show(element) : hide(element);

}

/* ==========================================================
   Classes
========================================================== */

function addClass(element, className) {

    if (!isElement(element)) return;

    element.classList.add(className);

}

function removeClass(element, className) {

    if (!isElement(element)) return;

    element.classList.remove(className);

}

function hasClass(element, className) {

    if (!isElement(element)) return false;

    return element.classList.contains(className);

}

/* ==========================================================
   Text
========================================================== */

function setText(element, value) {

    if (!isElement(element)) return;

    element.textContent = String(value);

}

/* ==========================================================
   Clamp
========================================================== */

function clamp(value, min, max) {

    return Math.min(

        Math.max(value, min),

        max

    );

}

/* ==========================================================
   Delay
========================================================== */

function wait(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 3 OF 25
   Storage Manager
========================================================== */

/* ==========================================================
   Storage Keys
========================================================== */

const STORAGE = Object.freeze({

    SETTINGS: "reader_settings",

    SESSION: "reader_session",

    BOOKMARKS: "reader_bookmarks"

});

/* ==========================================================
   Local Storage
========================================================== */

function saveStorage(key, value) {

    try {

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

        return true;

    }

    catch {

        return false;

    }

}

function loadStorage(key, fallback = null) {

    try {

        const value = localStorage.getItem(key);

        return value
            ? JSON.parse(value)
            : fallback;

    }

    catch {

        return fallback;

    }

}

function removeStorage(key) {

    localStorage.removeItem(key);

}

function clearStorage() {

    Object.values(STORAGE).forEach(removeStorage);

}

/* ==========================================================
   Settings
========================================================== */

function saveSettings() {

    saveStorage(

        STORAGE.SETTINGS,

        {

            theme: APP_STATE.theme,

            zoom: APP_STATE.zoom,

            viewMode: APP_STATE.viewMode

        }

    );

}

function loadSettings() {

    const settings = loadStorage(

        STORAGE.SETTINGS,

        {}

    );

    APP_STATE.theme =

        settings.theme ?? APP_STATE.theme;

    APP_STATE.zoom =

        settings.zoom ?? APP_STATE.zoom;

    APP_STATE.viewMode =

        settings.viewMode ?? APP_STATE.viewMode;

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 4 OF 25
   Event Manager
========================================================== */

/* ==========================================================
   Event Registry
========================================================== */

const EVENTS = new Map();

/* ==========================================================
   Add Event
========================================================== */

function on(target, event, handler, options = {}) {

    if (!target || typeof handler !== "function") {

        return;

    }

    target.addEventListener(

        event,

        handler,

        options

    );

    EVENTS.set(handler, {

        target,

        event,

        options

    });

}

/* ==========================================================
   Remove Event
========================================================== */

function off(handler) {

    const item = EVENTS.get(handler);

    if (!item) {

        return;

    }

    item.target.removeEventListener(

        item.event,

        handler,

        item.options

    );

    EVENTS.delete(handler);

}

/* ==========================================================
   Dispatch Event
========================================================== */

function emit(name, detail = {}) {

    document.dispatchEvent(

        new CustomEvent(name, {

            detail

        })

    );

}

/* ==========================================================
   Listen Event
========================================================== */

function listen(name, callback) {

    on(

        document,

        name,

        callback

    );

}

/* ==========================================================
   Remove All
========================================================== */

function clearEvents() {

    [...EVENTS.keys()].forEach(

        off

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 5 OF 25
   Loader Manager
========================================================== */

/* ==========================================================
   Loader State
========================================================== */

const LOADER = {

    visible:false,

    progress:0

};

/* ==========================================================
   Show Loader
========================================================== */

function showLoader(message = "Loading...") {

    LOADER.visible = true;

    if (!DOM.loader) return;

    show(DOM.loader);

    const text =

        DOM.loader.querySelector(".loading-text");

    if (text) {

        text.textContent = message;

    }

}

/* ==========================================================
   Hide Loader
========================================================== */

function hideLoader() {

    LOADER.visible = false;

    if (!DOM.loader) return;

    hide(DOM.loader);

}

/* ==========================================================
   Progress
========================================================== */

function updateLoaderProgress(value) {

    LOADER.progress = clamp(

        value,

        0,

        100

    );

    const bar =

        document.querySelector(

            ".loading-progress-fill"

        );

    if (bar) {

        bar.style.width =

            `${LOADER.progress}%`;

    }

}

/* ==========================================================
   Loading Sequence
========================================================== */

async function loadingSequence(task) {

    try {

        showLoader();

        updateLoaderProgress(20);

        const result = await task();

        updateLoaderProgress(100);

        await wait(300);

        hideLoader();

        return result;

    }

    catch(error) {

        hideLoader();

        throw error;

    }

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 6 OF 25
   Toast Notification System
========================================================== */

/* ==========================================================
   Toast State
========================================================== */

const TOAST = {

    timer:null,

    duration:3500

};

/* ==========================================================
   Show Toast
========================================================== */

function showToast(

    message,

    type = "info"

){

    if (!DOM.toast) return;


    const title =

        DOM.toast.querySelector(

            ".toast-title"

        );


    const content =

        DOM.toast.querySelector(

            ".toast-message"

        );


    const icon =

        DOM.toast.querySelector(

            ".toast-icon"

        );


    if(content){

        content.textContent = message;

    }


    if(title){

        title.textContent =

            type.toUpperCase();

    }


    if(icon){

        const icons = {

            success:"✓",

            error:"✕",

            warning:"!",

            info:"i"

        };


        icon.textContent =

            icons[type] || icons.info;

    }


    show(DOM.toast);


    removeClass(

        DOM.toast,

        "is-hidden"

    );


    clearTimeout(

        TOAST.timer

    );


    TOAST.timer = setTimeout(

        hideToast,

        TOAST.duration

    );

}

/* ==========================================================
   Hide Toast
========================================================== */

function hideToast(){

    if(!DOM.toast) return;


    hide(DOM.toast);


    addClass(

        DOM.toast,

        "is-hidden"

    );

}

/* ==========================================================
   Toast Types
========================================================== */

function toastSuccess(message){

    showToast(

        message,

        "success"

    );

}


function toastError(message){

    showToast(

        message,

        "error"

    );

}


function toastWarning(message){

    showToast(

        message,

        "warning"

    );

}


function toastInfo(message){

    showToast(

        message,

        "info"

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 7 OF 25
   Theme Manager
========================================================== */

/* ==========================================================
   Theme Apply
========================================================== */

function applyTheme(theme){

    if(!theme){

        return;

    }


    document.documentElement.dataset.theme = theme;


    APP_STATE.theme = theme;


    saveSettings();


    emit(

        "themeChanged",

        {

            theme

        }

    );

}

/* ==========================================================
   Theme Switch
========================================================== */

function switchTheme(theme){

    const themes = [

        "maroon",

        "dark",

        "light",

        "sepia"

    ];


    if(!themes.includes(theme)){

        return;

    }


    applyTheme(theme);

}

/* ==========================================================
   Load Theme
========================================================== */

function loadTheme(){

    const saved = loadStorage(

        STORAGE.SETTINGS,

        {}

    );


    applyTheme(

        saved.theme || "maroon"

    );

}

/* ==========================================================
   Toggle Theme
========================================================== */

function toggleTheme(){

    const themes = [

        "maroon",

        "dark",

        "light",

        "sepia"

    ];


    const index = themes.indexOf(

        APP_STATE.theme

    );


    const next = themes[

        (index + 1) % themes.length

    ];


    switchTheme(next);

}

/* ==========================================================
   Theme Events
========================================================== */

listen(

    "changeTheme",

    event => {

        switchTheme(

            event.detail.theme

        );

    }

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 8 OF 25
   PDF Manager
========================================================== */

/* ==========================================================
   PDF State
========================================================== */

const PDF_MANAGER = {

    document:null,

    loading:false,

    url:null

};

/* ==========================================================
   Load PDF
========================================================== */

async function loadPDF(url){

    if(!url){

        throw new Error(

            "PDF URL missing"

        );

    }


    try{

        PDF_MANAGER.loading = true;


        showLoader(

            "Opening book..."

        );


        updateLoaderProgress(

            30

        );


        const loadingTask =

            pdfjsLib.getDocument(url);


        PDF_MANAGER.document =

            await loadingTask.promise;


        PDF_MANAGER.url = url;


        APP_STATE.pdf =

            PDF_MANAGER.document;


        APP_STATE.totalPages =

            PDF_MANAGER.document.numPages;


        updateLoaderProgress(

            100

        );


        emit(

            "pdfReady",

            {

                pages:APP_STATE.totalPages

            }

        );


        toastSuccess(

            "Book loaded successfully"

        );


        return PDF_MANAGER.document;


    }

    catch(error){

        toastError(

            "Unable to load PDF"

        );


        throw error;

    }

    finally{

        PDF_MANAGER.loading = false;


        hideLoader();

    }

}

/* ==========================================================
   Get Page
========================================================== */

async function getPDFPage(pageNumber){

    if(!PDF_MANAGER.document){

        return null;

    }


    const page =

        await PDF_MANAGER.document.getPage(

            pageNumber

        );


    return page;

}

/* ==========================================================
   Close PDF
========================================================== */

function closePDF(){

    PDF_MANAGER.document = null;

    PDF_MANAGER.url = null;


    APP_STATE.pdf = null;

    APP_STATE.totalPages = 0;

    APP_STATE.currentPage = 1;


    emit(

        "pdfClosed"

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 9 OF 25
   Page Renderer
========================================================== */

/* ==========================================================
   Renderer State
========================================================== */

const RENDERER = {

    scale:1.5,

    rendering:false,

    cache:new Map()

};

/* ==========================================================
   Render Page
========================================================== */

async function renderPage(

    pageNumber,

    canvas

){

    if(!canvas){

        return;

    }


    const page =

        await getPDFPage(

            pageNumber

        );


    if(!page){

        return;

    }


    try{

        RENDERER.rendering = true;


        const viewport =

            page.getViewport({

                scale:

                    RENDERER.scale

            });


        const context =

            canvas.getContext(

                "2d"

            );


        canvas.width =

            viewport.width;


        canvas.height =

            viewport.height;


        const renderContext = {

            canvasContext:

                context,

            viewport

        };


        await page.render(

            renderContext

        ).promise;


        RENDERER.cache.set(

            pageNumber,

            canvas.toDataURL()

        );


        emit(

            "pageRendered",

            {

                page:pageNumber

            }

        );


    }

    catch(error){

        toastError(

            "Page rendering failed"

        );


        console.error(error);

    }

    finally{

        RENDERER.rendering = false;

    }

}

/* ==========================================================
   Render Current Page
========================================================== */

async function renderCurrentPage(){

    const page =

        APP_STATE.currentPage;


    await renderPage(

        page,

        DOM.rightCanvas

    );


    updatePageIndicator();

}

/* ==========================================================
   Clear Cache
========================================================== */

function clearRenderCache(){

    RENDERER.cache.clear();

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 10 OF 25
   Page Navigation
========================================================== */

/* ==========================================================
   Navigation State
========================================================== */

const NAVIGATION = {

    history:[],

    index:0

};

/* ==========================================================
   Update Indicator
========================================================== */

function updatePageIndicator(){

    if(DOM.pageLabel){

        DOM.pageLabel.textContent =

            `${APP_STATE.currentPage} / ${APP_STATE.totalPages}`;

    }


    if(DOM.pageInput){

        DOM.pageInput.value =

            APP_STATE.currentPage;

    }

}

/* ==========================================================
   Go To Page
========================================================== */

async function goToPage(pageNumber){

    if(!APP_STATE.totalPages){

        return;

    }


    const page = clamp(

        Number(pageNumber),

        1,

        APP_STATE.totalPages

    );


    APP_STATE.currentPage = page;


    NAVIGATION.history.push(page);


    await renderCurrentPage();


    emit(

        "pageChanged",

        {

            page

        }

    );

}

/* ==========================================================
   Next Page
========================================================== */

function nextPage(){

    if(

        APP_STATE.currentPage <

        APP_STATE.totalPages

    ){

        return goToPage(

            APP_STATE.currentPage + 1

        );

    }

}

/* ==========================================================
   Previous Page
========================================================== */

function previousPage(){

    if(

        APP_STATE.currentPage > 1

    ){

        return goToPage(

            APP_STATE.currentPage - 1

        );

    }

}

/* ==========================================================
   First Page
========================================================== */

function firstPage(){

    return goToPage(1);

}

/* ==========================================================
   Last Page
========================================================== */

function lastPage(){

    return goToPage(

        APP_STATE.totalPages

    );

}
);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 11 OF 25
   Zoom Manager
========================================================== */

/* ==========================================================
   Zoom State
========================================================== */

const ZOOM_MANAGER = {

    min:0.5,

    max:3,

    step:0.25

};

/* ==========================================================
   Apply Zoom
========================================================== */

function applyZoom(value){

    const zoom = clamp(

        Number(value),

        ZOOM_MANAGER.min,

        ZOOM_MANAGER.max

    );


    APP_STATE.zoom = zoom;


    const container =

        document.querySelector(

            ".zoom-container"

        );


    if(container){

        container.style.transform =

            `scale(${zoom})`;

    }


    if(DOM.zoomLabel){

        DOM.zoomLabel.textContent =

            `${Math.round(zoom * 100)}%`;

    }


    saveSettings();


    emit(

        "zoomChanged",

        {

            zoom

        }

    );

}

/* ==========================================================
   Zoom In
========================================================== */

function zoomIn(){

    applyZoom(

        APP_STATE.zoom +

        ZOOM_MANAGER.step

    );

}

/* ==========================================================
   Zoom Out
========================================================== */

function zoomOut(){

    applyZoom(

        APP_STATE.zoom -

        ZOOM_MANAGER.step

    );

}

/* ==========================================================
   Reset Zoom
========================================================== */

function resetZoom(){

    applyZoom(1);

}

/* ==========================================================
   Fit Page
========================================================== */

function fitPage(){

    const container =

        document.querySelector(

            ".zoom-container"

        );


    if(container){

        container.style.transform =

            "scale(1)";

    }


    APP_STATE.zoom = 1;


    emit(

        "fitPage"

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 12 OF 25
   View Mode Manager
========================================================== */

/* ==========================================================
   View Modes
========================================================== */

const VIEW_MODES = Object.freeze({

    SINGLE:"single",

    DOUBLE:"double",

    COVER:"cover"

});


/* ==========================================================
   Apply View Mode
========================================================== */

function applyViewMode(mode){

    if(!Object.values(VIEW_MODES).includes(mode)){

        return;

    }


    APP_STATE.viewMode = mode;


    const reader =

        document.querySelector(

            ".book-container"

        );


    if(reader){

        reader.classList.remove(

            "view-single",

            "view-double",

            "view-cover"

        );


        reader.classList.add(

            `view-${mode}`

        );

    }


    saveSettings();


    emit(

        "viewModeChanged",

        {

            mode

        }

    );

}


/* ==========================================================
   Single Page
========================================================== */

function setSingleView(){

    applyViewMode(

        VIEW_MODES.SINGLE

    );

}


/* ==========================================================
   Double Page
========================================================== */

function setDoubleView(){

    applyViewMode(

        VIEW_MODES.DOUBLE

    );

}


/* ==========================================================
   Cover View
========================================================== */

function setCoverView(){

    applyViewMode(

        VIEW_MODES.COVER

    );

}


/* ==========================================================
   Toggle View
========================================================== */

function toggleViewMode(){

    const modes =

        Object.values(

            VIEW_MODES

        );


    const current =

        modes.indexOf(

            APP_STATE.viewMode

        );


    const next =

        modes[

            (current + 1) %

            modes.length

        ];


    applyViewMode(next);

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 13 OF 25
   Rotation Manager
========================================================== */

/* ==========================================================
   Rotation State
========================================================== */

const ROTATION_MANAGER = {

    step:90,

    min:0,

    max:270

};


/* ==========================================================
   Apply Rotation
========================================================== */

function applyRotation(angle){

    const rotation =

        ((Number(angle) % 360) + 360) % 360;


    APP_STATE.rotation = rotation;


    const pages = $$(
        ".pdf-canvas, .page-canvas"
    );


    pages.forEach(canvas => {

        canvas.style.transform =

            `rotate(${rotation}deg)`;

    });


    emit(

        "rotationChanged",

        {

            rotation

        }

    );

}


/* ==========================================================
   Rotate Right
========================================================== */

function rotateRight(){

    applyRotation(

        APP_STATE.rotation +

        ROTATION_MANAGER.step

    );

}


/* ==========================================================
   Rotate Left
========================================================== */

function rotateLeft(){

    applyRotation(

        APP_STATE.rotation -

        ROTATION_MANAGER.step

    );

}


/* ==========================================================
   Reset Rotation
========================================================== */

function resetRotation(){

    applyRotation(0);

}


/* ==========================================================
   Orientation Helper
========================================================== */

function getOrientation(){

    return APP_STATE.rotation === 90 ||

           APP_STATE.rotation === 270

        ? "portrait"

        : "landscape";

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 14 OF 25
   Bookmark Manager
========================================================== */

/* ==========================================================
   Bookmark State
========================================================== */

const BOOKMARK_MANAGER = {

    items: []

};


/* ==========================================================
   Load Bookmarks
========================================================== */

function loadBookmarks(){

    BOOKMARK_MANAGER.items =

        loadStorage(

            STORAGE.BOOKMARKS,

            []

        );


    APP_STATE.bookmarks =

        BOOKMARK_MANAGER.items;

}


/* ==========================================================
   Save Bookmarks
========================================================== */

function saveBookmarks(){

    saveStorage(

        STORAGE.BOOKMARKS,

        BOOKMARK_MANAGER.items

    );


    APP_STATE.bookmarks =

        BOOKMARK_MANAGER.items;

}


/* ==========================================================
   Add Bookmark
========================================================== */

function addBookmark(page = APP_STATE.currentPage){

    const exists =

        BOOKMARK_MANAGER.items.some(

            item => item.page === page

        );


    if(exists){

        toastInfo(

            "Bookmark already exists"

        );

        return;

    }


    const bookmark = {

        id:Date.now(),

        page,

        created:new Date().toISOString()

    };


    BOOKMARK_MANAGER.items.push(

        bookmark

    );


    saveBookmarks();


    toastSuccess(

        "Bookmark added"

    );


    emit(

        "bookmarkAdded",

        bookmark

    );

}


/* ==========================================================
   Remove Bookmark
========================================================== */

function removeBookmark(id){

    BOOKMARK_MANAGER.items =

        BOOKMARK_MANAGER.items.filter(

            item => item.id !== id

        );


    saveBookmarks();


    emit(

        "bookmarkRemoved",

        {

            id

        }

    );

}


/* ==========================================================
   Check Bookmark
========================================================== */

function isBookmarked(page){

    return BOOKMARK_MANAGER.items.some(

        item => item.page === page

    );

}


/* ==========================================================
   Get Bookmarks
========================================================== */

function getBookmarks(){

    return BOOKMARK_MANAGER.items;

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 15 OF 25
   Search Manager
========================================================== */

/* ==========================================================
   Search State
========================================================== */

const SEARCH_MANAGER = {

    query:"",

    results:[],

    currentIndex:-1

};


/* ==========================================================
   Extract Text
========================================================== */

async function extractPageText(pageNumber){

    const page =

        await getPDFPage(

            pageNumber

        );


    if(!page){

        return "";

    }


    const content =

        await page.getTextContent();


    return content.items

        .map(

            item => item.str

        )

        .join(" ");

}


/* ==========================================================
   Search PDF
========================================================== */

async function searchPDF(query){

    if(!query){

        return [];

    }


    SEARCH_MANAGER.query =

        query.toLowerCase();


    SEARCH_MANAGER.results = [];


    for(

        let page = 1;

        page <= APP_STATE.totalPages;

        page++

    ){

        const text =

            await extractPageText(page);


        if(

            text

            .toLowerCase()

            .includes(

                SEARCH_MANAGER.query

            )

        ){

            SEARCH_MANAGER.results.push({

                page,

                text

            });

        }

    }


    SEARCH_MANAGER.currentIndex =

        SEARCH_MANAGER.results.length

        ? 0

        : -1;


    APP_STATE.searchResults =

        SEARCH_MANAGER.results;


    emit(

        "searchComplete",

        {

            results:

                SEARCH_MANAGER.results

        }

    );


    return SEARCH_MANAGER.results;

}


/* ==========================================================
   Next Result
========================================================== */

function nextSearchResult(){

    if(

        !SEARCH_MANAGER.results.length

    ){

        return;

    }


    SEARCH_MANAGER.currentIndex =

        (

            SEARCH_MANAGER.currentIndex + 1

        )

        %

        SEARCH_MANAGER.results.length;


    const result =

        SEARCH_MANAGER.results[

            SEARCH_MANAGER.currentIndex

        ];


    goToPage(

        result.page

    );

}


/* ==========================================================
   Clear Search
========================================================== */

function clearSearch(){

    SEARCH_MANAGER.query = "";

    SEARCH_MANAGER.results = [];

    SEARCH_MANAGER.currentIndex = -1;


    APP_STATE.searchResults = [];

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 16 OF 25
   Fullscreen Manager
========================================================== */

/* ==========================================================
   Fullscreen State
========================================================== */

const FULLSCREEN_MANAGER = {

    active:false

};


/* ==========================================================
   Enter Fullscreen
========================================================== */

async function enterFullscreen(){

    const element =

        DOM.app ||

        document.documentElement;


    try{

        if(element.requestFullscreen){

            await element.requestFullscreen();

        }

        else if(element.webkitRequestFullscreen){

            element.webkitRequestFullscreen();

        }


        FULLSCREEN_MANAGER.active = true;


        addClass(

            document.body,

            "fullscreen-mode"

        );


        emit(

            "fullscreenChanged",

            {

                active:true

            }

        );


    }

    catch(error){

        toastError(

            "Fullscreen not available"

        );

    }

}


/* ==========================================================
   Exit Fullscreen
========================================================== */

async function exitFullscreen(){

    try{

        if(document.exitFullscreen){

            await document.exitFullscreen();

        }

        else if(document.webkitExitFullscreen){

            document.webkitExitFullscreen();

        }


        FULLSCREEN_MANAGER.active = false;


        removeClass(

            document.body,

            "fullscreen-mode"

        );


        emit(

            "fullscreenChanged",

            {

                active:false

            }

        );


    }

    catch(error){

        console.error(error);

    }

}


/* ==========================================================
   Toggle Fullscreen
========================================================== */

function toggleFullscreen(){

    if(

        document.fullscreenElement

    ){

        return exitFullscreen();

    }


    return enterFullscreen();

}


/* ==========================================================
   Fullscreen Listener
========================================================== */

document.addEventListener(

    "fullscreenchange",

    () => {

        FULLSCREEN_MANAGER.active =

            Boolean(

                document.fullscreenElement

            );

    }

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 17 OF 25
   Keyboard Controls
========================================================== */

/* ==========================================================
   Keyboard State
========================================================== */

const KEYBOARD_MANAGER = {

    enabled:true

};


/* ==========================================================
   Key Actions
========================================================== */

function handleKeyboard(event){

    if(!KEYBOARD_MANAGER.enabled){

        return;

    }


    const key = event.key;


    switch(key){


        case "ArrowRight":

            nextPage();

            break;


        case "ArrowLeft":

            previousPage();

            break;


        case "+":

        case "=":

            zoomIn();

            break;


        case "-":

            zoomOut();

            break;


        case "0":

            resetZoom();

            break;


        case "f":

        case "F":

            toggleFullscreen();

            break;


        case "b":

        case "B":

            addBookmark();

            break;


        case "Escape":

            closeDialogs();

            break;


    }

}


/* ==========================================================
   Enable Keyboard
========================================================== */

function enableKeyboard(){

    KEYBOARD_MANAGER.enabled = true;

}


/* ==========================================================
   Disable Keyboard
========================================================== */

function disableKeyboard(){

    KEYBOARD_MANAGER.enabled = false;

}


/* ==========================================================
   Register Keyboard
========================================================== */

on(

    document,

    "keydown",

    handleKeyboard

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 18 OF 25
   Dialog Manager
========================================================== */

/* ==========================================================
   Dialog State
========================================================== */

const DIALOG_MANAGER = {

    active:null

};


/* ==========================================================
   Open Dialog
========================================================== */

function openDialog(id){

    const dialog =

        byId(id);


    if(!dialog){

        return;

    }


    closeDialogs();


    show(dialog);


    DIALOG_MANAGER.active = id;


    addClass(

        dialog,

        "is-open"

    );


    emit(

        "dialogOpened",

        {

            id

        }

    );

}


/* ==========================================================
   Close Dialog
========================================================== */

function closeDialog(id){

    const dialog =

        byId(id);


    if(!dialog){

        return;

    }


    hide(dialog);


    removeClass(

        dialog,

        "is-open"

    );


    if(

        DIALOG_MANAGER.active === id

    ){

        DIALOG_MANAGER.active = null;

    }


    emit(

        "dialogClosed",

        {

            id

        }

    );

}


/* ==========================================================
   Close All
========================================================== */

function closeDialogs(){

    const dialogs = $$(
        ".dialog-overlay, .error-dialog"
    );


    dialogs.forEach(

        dialog => {

            hide(dialog);


            removeClass(

                dialog,

                "is-open"

            );

        }

    );


    DIALOG_MANAGER.active = null;

}


/* ==========================================================
   Toggle Dialog
========================================================== */

function toggleDialog(id){

    if(

        DIALOG_MANAGER.active === id

    ){

        closeDialog(id);

    }

    else{

        openDialog(id);

    }

}


/* ==========================================================
   Dialog Events
========================================================== */

on(

    document,

    "click",

    event => {

        if(

            event.target.classList.contains(

                "dialog-overlay"

            )

        ){

            closeDialogs();

        }

    }

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 19 OF 25
   Session Manager
========================================================== */

/* ==========================================================
   Session State
========================================================== */

const SESSION_MANAGER = {

    active:false,

    data:{}

};


/* ==========================================================
   Create Session
========================================================== */

function createSession(){

    SESSION_MANAGER.data = {

        id:Date.now(),

        page:APP_STATE.currentPage,

        zoom:APP_STATE.zoom,

        rotation:APP_STATE.rotation,

        theme:APP_STATE.theme,

        viewMode:APP_STATE.viewMode,

        updated:new Date().toISOString()

    };


    SESSION_MANAGER.active = true;


    saveStorage(

        STORAGE.SESSION,

        SESSION_MANAGER.data

    );

}


/* ==========================================================
   Save Session
========================================================== */

function saveSession(){

    SESSION_MANAGER.data = {

        ...SESSION_MANAGER.data,

        page:APP_STATE.currentPage,

        zoom:APP_STATE.zoom,

        rotation:APP_STATE.rotation,

        theme:APP_STATE.theme,

        viewMode:APP_STATE.viewMode,

        updated:new Date().toISOString()

    };


    saveStorage(

        STORAGE.SESSION,

        SESSION_MANAGER.data

    );

}


/* ==========================================================
   Restore Session
========================================================== */

function restoreSession(){

    const session =

        loadStorage(

            STORAGE.SESSION,

            null

        );


    if(!session){

        return;

    }


    SESSION_MANAGER.data = session;


    APP_STATE.currentPage =

        session.page || 1;


    APP_STATE.zoom =

        session.zoom || 1;


    APP_STATE.rotation =

        session.rotation || 0;


    APP_STATE.theme =

        session.theme || "maroon";


    APP_STATE.viewMode =

        session.viewMode || "single";


    SESSION_MANAGER.active = true;


    emit(

        "sessionRestored",

        session

    );

}


/* ==========================================================
   End Session
========================================================== */

function endSession(){

    saveSession();


    SESSION_MANAGER.active = false;


    emit(

        "sessionEnded"

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 20 OF 25
   Resize Manager
========================================================== */

/* ==========================================================
   Resize State
========================================================== */

const RESIZE_MANAGER = {

    width:0,

    height:0,

    observer:null

};


/* ==========================================================
   Update Size
========================================================== */

function updateReaderSize(){

    const reader =

        DOM.reader;


    if(!reader){

        return;

    }


    RESIZE_MANAGER.width =

        reader.clientWidth;


    RESIZE_MANAGER.height =

        reader.clientHeight;


    emit(

        "readerResized",

        {

            width:

                RESIZE_MANAGER.width,

            height:

                RESIZE_MANAGER.height

        }

    );

}


/* ==========================================================
   Resize Observer
========================================================== */

function initResizeObserver(){

    if(!window.ResizeObserver){

        return;

    }


    RESIZE_MANAGER.observer =

        new ResizeObserver(

            () => {

                updateReaderSize();

            }

        );


    if(DOM.reader){

        RESIZE_MANAGER.observer.observe(

            DOM.reader

        );

    }

}


/* ==========================================================
   Window Resize
========================================================== */

on(

    window,

    "resize",

    updateReaderSize

);


/* ==========================================================
   Destroy Observer
========================================================== */

function destroyResizeObserver(){

    if(

        RESIZE_MANAGER.observer

    ){

        RESIZE_MANAGER.observer.disconnect();

        RESIZE_MANAGER.observer = null;

    }

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 21 OF 25
   Touch & Gesture Manager
========================================================== */

/* ==========================================================
   Touch State
========================================================== */

const TOUCH_MANAGER = {

    startX:0,

    startY:0,

    endX:0,

    endY:0,

    threshold:50

};


/* ==========================================================
   Touch Start
========================================================== */

function handleTouchStart(event){

    const touch =

        event.touches[0];


    TOUCH_MANAGER.startX =

        touch.clientX;


    TOUCH_MANAGER.startY =

        touch.clientY;

}


/* ==========================================================
   Touch End
========================================================== */

function handleTouchEnd(event){

    const touch =

        event.changedTouches[0];


    TOUCH_MANAGER.endX =

        touch.clientX;


    TOUCH_MANAGER.endY =

        touch.clientY;


    handleSwipe();

}


/* ==========================================================
   Swipe Detection
========================================================== */

function handleSwipe(){

    const diffX =

        TOUCH_MANAGER.endX -

        TOUCH_MANAGER.startX;


    const diffY =

        TOUCH_MANAGER.endY -

        TOUCH_MANAGER.startY;


    if(

        Math.abs(diffX)

        <

        TOUCH_MANAGER.threshold

    ){

        return;

    }


    if(

        Math.abs(diffX)

        >

        Math.abs(diffY)

    ){

        if(diffX < 0){

            nextPage();

        }

        else{

            previousPage();

        }

    }

}


/* ==========================================================
   Register Touch
========================================================== */

function initTouchControls(){

    const area =

        document.querySelector(

            ".gesture-layer"

        );


    if(!area){

        return;

    }


    on(

        area,

        "touchstart",

        handleTouchStart,

        {

            passive:true

        }

    );


    on(

        area,

        "touchend",

        handleTouchEnd,

        {

            passive:true

        }

    );

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 22 OF 25
   Button & UI Events
========================================================== */

/* ==========================================================
   Bind UI Events
========================================================== */

function bindUIEvents(){


    const nextButton =

        document.querySelector(

            "[data-action='next']"

        );


    const previousButton =

        document.querySelector(

            "[data-action='previous']"

        );


    const zoomInButton =

        document.querySelector(

            "[data-action='zoom-in']"

        );


    const zoomOutButton =

        document.querySelector(

            "[data-action='zoom-out']"

        );


    const fullscreenButton =

        document.querySelector(

            "[data-action='fullscreen']"

        );


    const themeButton =

        document.querySelector(

            "[data-action='theme']"

        );


    if(nextButton){

        on(

            nextButton,

            "click",

            nextPage

        );

    }


    if(previousButton){

        on(

            previousButton,

            "click",

            previousPage

        );

    }


    if(zoomInButton){

        on(

            zoomInButton,

            "click",

            zoomIn

        );

    }


    if(zoomOutButton){

        on(

            zoomOutButton,

            "click",

            zoomOut

        );

    }


    if(fullscreenButton){

        on(

            fullscreenButton,

            "click",

            toggleFullscreen

        );

    }


    if(themeButton){

        on(

            themeButton,

            "click",

            toggleTheme

        );

    }

}


/* ==========================================================
   Page Input
========================================================== */

function bindPageInput(){

    if(!DOM.pageInput){

        return;

    }


    on(

        DOM.pageInput,

        "change",

        event => {

            goToPage(

                event.target.value

            );

        }

    );

}


/* ==========================================================
   Initialize Events
========================================================== */

function initEvents(){

    bindUIEvents();

    bindPageInput();

}
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 23 OF 25
   Application Initializer
========================================================== */

/* ==========================================================
   Initialize Application
========================================================== */

async function initializeReader(){

    if(APP_STATE.initialized){

        return;

    }


    try{

        showLoader(

            "Starting reader..."

        );


        cacheDomElements();


        loadSettings();


        loadTheme();


        loadBookmarks();


        restoreSession();


        initResizeObserver();


        initTouchControls();


        applyZoom(

            APP_STATE.zoom

        );


        applyViewMode(

            APP_STATE.viewMode

        );


        applyRotation(

            APP_STATE.rotation

        );


        createSession();


        updatePageIndicator();


        APP_STATE.initialized = true;


        hideLoader();


        emit(

            "readerReady"

        );


        toastSuccess(

            "Reader ready"

        );


    }

    catch(error){

        hideLoader();


        toastError(

            "Reader initialization failed"

        );


        console.error(error);

    }

}


/* ==========================================================
   Auto Start
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        initializeReader();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 24 OF 25
   Cleanup & Destroy Manager
========================================================== */

/* ==========================================================
   Destroy Application
========================================================== */

function destroyReader(){

    try{


        saveSession();


        saveSettings();


        saveBookmarks();


        clearEvents();


        destroyResizeObserver();


        closePDF();


        clearRenderCache();


        closeDialogs();


        APP_STATE.initialized = false;


        APP_STATE.loading = false;


        emit(

            "readerDestroyed"

        );


    }

    catch(error){

        console.error(

            "Destroy failed:",

            error

        );

    }

}


/* ==========================================================
   Reset Application
========================================================== */

function resetReader(){

    destroyReader();


    clearStorage();


    APP_STATE.currentPage = 1;

    APP_STATE.totalPages = 0;

    APP_STATE.zoom = 1;

    APP_STATE.rotation = 0;

    APP_STATE.theme = "maroon";

    APP_STATE.viewMode = "single";


    toastInfo(

        "Reader reset"

    );


    emit(

        "readerReset"

    );

}


/* ==========================================================
   Before Close
========================================================== */

window.addEventListener(

    "beforeunload",

    () => {

        saveSession();

    }

);
/* ==========================================================
   CHISHTI READER v6
   reader.js
   PART 25 OF 25
   Final Export & API
========================================================== */

/* ==========================================================
   Public Reader API
========================================================== */

const ChishtiReader = {

    init: initializeReader,

    load: loadPDF,

    close: closePDF,

    next: nextPage,

    previous: previousPage,

    goTo: goToPage,

    zoomIn,

    zoomOut,

    resetZoom,

    rotateLeft,

    rotateRight,

    fullscreen: toggleFullscreen,

    theme: switchTheme,

    search: searchPDF,

    bookmark: addBookmark,

    removeBookmark,

    getBookmarks,

    destroy: destroyReader,

    reset: resetReader

};


/* ==========================================================
   Global Export
========================================================== */

window.ChishtiReader = ChishtiReader;


/* ==========================================================
   Final Startup Hook
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {


        initEvents();


        initializeReader();


    },

    {

        once:true

    }

);


/* ==========================================================
   CHISHTI READER v6

   reader.js

   Status : Production Ready
   Parts  : 25 / 25
   Modules: Complete
   API    : Exported

   End Of File
========================================================== */
