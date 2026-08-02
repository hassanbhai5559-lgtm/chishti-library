/* ==========================================================
   CHISHTI READER PRO v7
   PART 9 OF 40
   reader.js
   Application Foundation
========================================================== */

"use strict";

/* ==========================================================
   Reader Configuration
========================================================== */

const READER_CONFIG = Object.freeze({

    appName:"CHISHTI READER",

    version:"7.0.0",

    defaultTheme:"maroon",

    defaultView:"double",

    defaultZoom:1,

    animationDuration:800,

    watermark:"www.chishtilibrary.com"

});

/* ==========================================================
   Global State
========================================================== */

const APP = {

    initialized:false,

    pdf:null,

    pdfUrl:null,

    currentPage:1,

    totalPages:0,

    zoom:1,

    rotation:0,

    theme:"maroon",

    view:"double",

    fullscreen:false,

    loading:false,

    rendering:false,

    searchResults:[],

    bookmarks:[],

    toc:[],

    history:[]

};

/* ==========================================================
   DOM Cache
========================================================== */

const UI = {};

/* ==========================================================
   Cache Elements
========================================================== */

function cacheElements(){

    UI.app =

        document.getElementById(

            "readerApp"

        );

    UI.book =

        document.getElementById(

            "book"

        );

    UI.leftCanvas =

        document.getElementById(

            "leftCanvas"

        );

    UI.rightCanvas =

        document.getElementById(

            "rightCanvas"

        );

    UI.searchInput =

        document.getElementById(

            "searchInput"

        );

    UI.pageNumber =

        document.getElementById(

            "pageNumber"

        );

    UI.totalPages =

        document.getElementById(

            "totalPages"

        );

    UI.toolbar =

        document.querySelector(

            ".reader-toolbar"

        );

}

/* ==========================================================
   Helpers
========================================================== */

const $ = selector =>

    document.querySelector(

        selector

    );

const $$ = selector =>

    [

        ...document.querySelectorAll(

            selector

        )

    ];

/* ==========================================================
   Clamp
========================================================== */

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

/* ==========================================================
   Ready
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () =>{

        cacheElements();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 10 OF 40
   reader.js
   Book Opening Animation
========================================================== */

/* ==========================================================
   Animation State
========================================================== */

const BOOK_ANIMATION = {

    opened:false,

    opening:false,

    duration:900

};

/* ==========================================================
   Open Book
========================================================== */

async function openBook(){

  async function openBook(){

    UI.book.classList.add("closed");

    await new Promise(r => setTimeout(r, 100));

    UI.book.classList.remove("closed");
    UI.book.classList.add("opening");

    await new Promise(r => setTimeout(r, 1200));

    UI.book.classList.remove("opening");
    UI.book.classList.add("open");
}

/* ==========================================================
   Close Book
========================================================== */

function closeBook(){

    UI.book.classList.remove(

        "open"

    );

    UI.book.classList.remove(

        "opening"

    );

    UI.book.classList.add(

        "closed"

    );

    BOOK_ANIMATION.opened = false;

}

/* ==========================================================
   Toggle Book
========================================================== */

function toggleBook(){

    if(

        BOOK_ANIMATION.opened

    ){

        closeBook();

    }

    else{

        openBook();

    }

}

/* ==========================================================
   Book Click
========================================================== */

function enableBookAnimation(){

    if(

        !UI.book

    ){

        return;

    }

    UI.book.classList.add(

        "closed"

    );

    UI.book.addEventListener(

        "click",

        openBook

    );

}

/* ==========================================================
   Auto Start
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    () =>{

        enableBookAnimation();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 11 OF 40
   reader.js
   PDF Loader & Renderer
========================================================== */

/* ==========================================================
   PDF Manager
========================================================== */

const PDF = {

    document:null,

    loading:false,

    renderScale:2,

    renderTask:null

};

/* ==========================================================
   Load PDF
========================================================== */

async function loadPDF(url){

    try{

        PDF.loading = true;

        APP.loading = true;

        APP.pdfUrl = url;

        const task =

            pdfjsLib.getDocument({

                url:url

            });

        PDF.document =

            await task.promise;

        APP.pdf =

            PDF.document;

        APP.totalPages =

            PDF.document.numPages;

        UI.totalPages.textContent =

            APP.totalPages;

        APP.currentPage = 1;

        await renderSpread();

    }

    catch(error){

        console.error(

            error

        );

    }

    finally{

        PDF.loading = false;

        APP.loading = false;

    }

}

/* ==========================================================
   Get PDF Page
========================================================== */

async function getPage(number){

    if(

        !PDF.document

    ){

        return null;

    }

    return await

    PDF.document.getPage(

        number

    );

}

/* ==========================================================
   Render Canvas
========================================================== */

async function renderCanvas(

    page,

    canvas

){

    if(

        !page ||

        !canvas

    ){

        return;

    }

    const viewport =

        page.getViewport({

            scale:

            PDF.renderScale *

            APP.zoom

        });

    canvas.width =

        viewport.width;

    canvas.height =

        viewport.height;

    const context =

        canvas.getContext(

            "2d"

        );

    if(

        PDF.renderTask

    ){

        PDF.renderTask.cancel();

    }

    PDF.renderTask =

        page.render({

            canvasContext:

            context,

            viewport

        });

    await

    PDF.renderTask.promise;

}

/* ==========================================================
   Render Left & Right Pages
========================================================== */

async function renderSpread(){

    if(

        !PDF.document

    ){

        return;

    }

    const leftPageNumber =

        APP.view === "double"

        ?

        Math.max(

            1,

            APP.currentPage

        )

        :

        APP.currentPage;

    const rightPageNumber =

        APP.view === "double"

        ?

        Math.min(

            APP.totalPages,

            APP.currentPage + 1

        )

        :

        APP.currentPage;

    const leftPage =

        await getPage(

            leftPageNumber

        );

    await renderCanvas(

        leftPage,

        UI.leftCanvas

    );

    if(

        APP.view === "double"

    ){

        const rightPage =

            await getPage(

                rightPageNumber

            );

        await renderCanvas(

            rightPage,

            UI.rightCanvas

        );

    }

    UI.pageNumber.value =

        APP.currentPage;

}
/* ==========================================================
   CHISHTI READER PRO v7
   PART 12 OF 40
   reader.js
   Page Navigation & Real Flip Animation
========================================================== */

/* ==========================================================
   Flip Animation
========================================================== */

async function flipPage(direction){

    if(

        APP.rendering ||

        !UI.book

    ){

        return;

    }

    APP.rendering = true;

    const target =

        direction === "next"

        ?

        document.querySelector(

            ".page-right"

        )

        :

        document.querySelector(

            ".page-left"

        );

    if(target){

        target.classList.add(

            "flipping"

        );

    }

    await new Promise(

        resolve =>

        setTimeout(

            resolve,

            450

        )

    );

    if(

        direction === "next"

    ){

        if(

            APP.view === "double"

        ){

            APP.currentPage += 2;

        }

        else{

            APP.currentPage++;

        }

    }

    else{

        if(

            APP.view === "double"

        ){

            APP.currentPage -= 2;

        }

        else{

            APP.currentPage--;

        }

    }

    APP.currentPage = clamp(

        APP.currentPage,

        1,

        APP.totalPages

    );

    await renderSpread();

    if(target){

        target.classList.remove(

            "flipping"

        );

    }

    APP.rendering = false;

}

/* ==========================================================
   Next Page
========================================================== */

async function nextPage(){

    if(

        APP.currentPage >=

        APP.totalPages

    ){

        return;

    }

    await flipPage(

        "next"

    );

}

/* ==========================================================
   Previous Page
========================================================== */

async function previousPage(){

    if(

        APP.currentPage <= 1

    ){

        return;

    }

    await flipPage(

        "previous"

    );

}

/* ==========================================================
   Go To Page
========================================================== */

async function goToPage(page){

    page = clamp(

        Number(page),

        1,

        APP.totalPages

    );

    APP.currentPage = page;

    await renderSpread();

}

/* ==========================================================
   Toolbar Events
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .getElementById(

            "nextPage"

        )

        .addEventListener(

            "click",

            nextPage

        );

        document

        .getElementById(

            "previousPage"

        )

        .addEventListener(

            "click",

            previousPage

        );

        document

        .getElementById(

            "pageNumber"

        )

        .addEventListener(

            "change",

            event=>{

                goToPage(

                    event.target.value

                );

            }

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 13 OF 40
   reader.js
   Search Engine (Ctrl + F Style)
========================================================== */

/* ==========================================================
   Search State
========================================================== */

const SEARCH = {

    query:"",

    results:[],

    current:0,

    busy:false

};

/* ==========================================================
   Search PDF
========================================================== */

async function searchBook(text){

    if(

        !PDF.document ||

        !text

    ){

        return;

    }

    SEARCH.busy = true;

    SEARCH.query =

        text.trim().toLowerCase();

    SEARCH.results = [];

    SEARCH.current = 0;

    for(

        let page = 1;

        page <= APP.totalPages;

        page++

    ){

        const pdfPage =

            await PDF.document.getPage(

                page

            );

        const content =

            await pdfPage.getTextContent();

        const pageText =

            content.items

            .map(

                item => item.str

            )

            .join(" ")

            .toLowerCase();

        if(

            pageText.includes(

                SEARCH.query

            )

        ){

            SEARCH.results.push({

                page,

                text:pageText

            });

        }

    }

    SEARCH.busy = false;

    if(

        SEARCH.results.length

    ){

        openSearchResult(

            0

        );

    }

}

/* ==========================================================
   Open Search Result
========================================================== */

async function openSearchResult(index){

    if(

        !SEARCH.results.length

    ){

        return;

    }

    SEARCH.current =

        clamp(

            index,

            0,

            SEARCH.results.length - 1

        );

    const result =

        SEARCH.results[

            SEARCH.current

        ];

    await goToPage(

        result.page

    );

    highlightSearch();

}

/* ==========================================================
   Next Result
========================================================== */

function nextResult(){

    if(

        !SEARCH.results.length

    ){

        return;

    }

    openSearchResult(

        (SEARCH.current + 1)

        %

        SEARCH.results.length

    );

}

/* ==========================================================
   Previous Result
========================================================== */

function previousResult(){

    if(

        !SEARCH.results.length

    ){

        return;

    }

    openSearchResult(

        (

            SEARCH.current -

            1 +

            SEARCH.results.length

        )

        %

        SEARCH.results.length

    );

}

/* ==========================================================
   Highlight
========================================================== */

function highlightSearch(){

    console.log(

        "Highlight:",

        SEARCH.query

    );

}

/* ==========================================================
   Search Events
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        UI.searchInput.addEventListener(

            "keydown",

            event=>{

                if(

                    event.key === "Enter"

                ){

                    searchBook(

                        event.target.value

                    );

                }

            }

        );

        document.addEventListener(

            "keydown",

            event=>{

                if(

                    event.ctrlKey &&

                    event.key === "f"

                ){

                    event.preventDefault();

                    UI.searchInput.focus();

                    UI.searchInput.select();

                }

            }

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 14 OF 40
   reader.js
   Theme Manager
========================================================== */

/* ==========================================================
   Themes
========================================================== */

const THEMES = Object.freeze({

    MAROON:"maroon",

    DARK:"dark",

    LIGHT:"light",

    SEPIA:"sepia",

    GREEN:"green",

    NIGHT:"night"

});

/* ==========================================================
   Theme Colors
========================================================== */

const THEME_COLORS = {

    maroon:"#4b0000",

    dark:"#181818",

    light:"#ffffff",

    sepia:"#e7d5b4",

    green:"#0d4f38",

    night:"#06111d"

};

/* ==========================================================
   Apply Theme
========================================================== */

function applyTheme(theme){

    if(

        !THEMES[

            theme.toUpperCase()

        ]

    ){

        return;

    }

    APP.theme = theme;

    document.documentElement

        .setAttribute(

            "data-theme",

            theme

        );

    localStorage.setItem(

        "chishti_theme",

        theme

    );

    updateThemeButtons();

}

/* ==========================================================
   Toggle Theme
========================================================== */

function toggleTheme(){

    const list =

        Object.values(

            THEMES

        );

    const current =

        list.indexOf(

            APP.theme

        );

    const next =

        list[

            (

                current + 1

            )

            %

            list.length

        ];

    applyTheme(

        next

    );

}

/* ==========================================================
   Restore Theme
========================================================== */

function loadTheme(){

    const saved =

        localStorage.getItem(

            "chishti_theme"

        );

    if(saved){

        applyTheme(

            saved

        );

    }

}

/* ==========================================================
   Active Theme UI
========================================================== */

function updateThemeButtons(){

    document

    .querySelectorAll(

        ".theme-card"

    )

    .forEach(card=>{

        card.classList.remove(

            "active"

        );

        if(

            card.dataset.theme ===

            APP.theme

        ){

            card.classList.add(

                "active"

            );

        }

    });

}

/* ==========================================================
   Theme Events
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadTheme();

        document

        .querySelectorAll(

            ".theme-card"

        )

        .forEach(card=>{

            card.addEventListener(

                "click",

                ()=>{

                    applyTheme(

                        card.dataset.theme

                    );

                }

            );

        });

        document

        .getElementById(

            "themeButton"

        )

        .addEventListener(

            "click",

            toggleTheme

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 15 OF 40
   reader.js
   Settings Manager
========================================================== */

/* ==========================================================
   Default Settings
========================================================== */

const SETTINGS = {

    viewMode:"double",

    flipAnimation:true,

    pageShadow:true,

    watermark:true,

    pageNumber:true,

    sound:false,

    rememberPage:true,

    autoSave:true,

    direction:"ltr",

    zoom:100

};

/* ==========================================================
   Load Settings
========================================================== */

function loadSettings(){

    const saved =

        localStorage.getItem(

            "chishti_settings"

        );

    if(saved){

        Object.assign(

            SETTINGS,

            JSON.parse(saved)

        );

    }

    applySettings();

}

/* ==========================================================
   Save Settings
========================================================== */

function saveSettings(){

    localStorage.setItem(

        "chishti_settings",

        JSON.stringify(

            SETTINGS

        )

    );

}

/* ==========================================================
   Apply Settings
========================================================== */

function applySettings(){

    APP.view =

        SETTINGS.viewMode;

    APP.zoom =

        SETTINGS.zoom / 100;

    document.body.classList.toggle(

        "single-page-mode",

        SETTINGS.viewMode ===

        "single"

    );

    document.body.classList.toggle(

        "double-page-mode",

        SETTINGS.viewMode ===

        "double"

    );

    document.body.classList.toggle(

        "hide-watermark",

        !SETTINGS.watermark

    );

    document.body.classList.toggle(

        "hide-page-number",

        !SETTINGS.pageNumber

    );

}

/* ==========================================================
   Update Setting
========================================================== */

function updateSetting(

    key,

    value

){

    SETTINGS[key] = value;

    applySettings();

    saveSettings();

}

/* ==========================================================
   Reset Settings
========================================================== */

function resetSettings(){

    Object.assign(

        SETTINGS,

        {

            viewMode:"double",

            flipAnimation:true,

            pageShadow:true,

            watermark:true,

            pageNumber:true,

            sound:false,

            rememberPage:true,

            autoSave:true,

            direction:"ltr",

            zoom:100

        }

    );

    applySettings();

    saveSettings();

}

/* ==========================================================
   Toggle View Mode
========================================================== */

function toggleViewMode(){

    updateSetting(

        "viewMode",

        SETTINGS.viewMode ===

        "double"

        ?

        "single"

        :

        "double"

    );

    renderSpread();

}

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadSettings();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 16 OF 40
   reader.js
   Bookmark Manager
========================================================== */

/* ==========================================================
   Bookmark State
========================================================== */

const BOOKMARKS = [];

/* ==========================================================
   Load Bookmarks
========================================================== */

function loadBookmarks(){

    const saved =

        localStorage.getItem(

            "chishti_bookmarks"

        );

    if(saved){

        BOOKMARKS.push(

            ...JSON.parse(saved)

        );

    }

}

/* ==========================================================
   Save Bookmarks
========================================================== */

function saveBookmarks(){

    localStorage.setItem(

        "chishti_bookmarks",

        JSON.stringify(

            BOOKMARKS

        )

    );

}

/* ==========================================================
   Add Bookmark
========================================================== */

function addBookmark(){

    const exists =

        BOOKMARKS.some(

            item =>

            item.page ===

            APP.currentPage

        );

    if(exists){

        return;

    }

    BOOKMARKS.push({

        page:

        APP.currentPage,

        title:

        "Page " +

        APP.currentPage,

        date:

        new Date()

        .toISOString()

    });

    saveBookmarks();

    renderBookmarks();

}

/* ==========================================================
   Remove Bookmark
========================================================== */

function removeBookmark(page){

    const index =

        BOOKMARKS.findIndex(

            item =>

            item.page === page

        );

    if(index >= 0){

        BOOKMARKS.splice(

            index,

            1

        );

        saveBookmarks();

        renderBookmarks();

    }

}

/* ==========================================================
   Render Bookmarks
========================================================== */

function renderBookmarks(){

    const container =

        document.getElementById(

            "bookmarkList"

        );

    if(!container){

        return;

    }

    container.innerHTML = "";

    BOOKMARKS.forEach(

        bookmark=>{

            const item =

                document.createElement(

                    "div"

                );

            item.className =

                "bookmark-item";

            item.innerHTML =

            `

            <span>

                📑 ${bookmark.title}

            </span>

            <button

            data-page="${bookmark.page}">

                Open

            </button>

            `;

            item.querySelector(

                "button"

            )

            .addEventListener(

                "click",

                ()=>{

                    goToPage(

                        bookmark.page

                    );

                }

            );

            container.appendChild(

                item

            );

        }

    );

}

/* ==========================================================
   Toggle Bookmark
========================================================== */

function toggleBookmark(){

    const exists =

        BOOKMARKS.some(

            item =>

            item.page ===

            APP.currentPage

        );

    if(exists){

        removeBookmark(

            APP.currentPage

        );

    }

    else{

        addBookmark();

    }

}

/* ==========================================================
   Bookmark Events
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadBookmarks();

        renderBookmarks();

        document

        .getElementById(

            "bookmarkButton"

        )

        .addEventListener(

            "click",

            toggleBookmark

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 17 OF 40
   reader.js
   Zoom Manager
========================================================== */

/* ==========================================================
   Zoom Configuration
========================================================== */

const ZOOM = {

    min:0.50,

    max:3.00,

    step:0.10

};

/* ==========================================================
   Apply Zoom
========================================================== */

async function applyZoom(){

    if(

        !PDF.document

    ){

        return;

    }

    APP.zoom = clamp(

        APP.zoom,

        ZOOM.min,

        ZOOM.max

    );

    await renderSpread();

    updateZoomIndicator();

}

/* ==========================================================
   Zoom In
========================================================== */

async function zoomIn(){

    APP.zoom +=

        ZOOM.step;

    await applyZoom();

}

/* ==========================================================
   Zoom Out
========================================================== */

async function zoomOut(){

    APP.zoom -=

        ZOOM.step;

    await applyZoom();

}

/* ==========================================================
   Reset Zoom
========================================================== */

async function resetZoom(){

    APP.zoom = 1;

    await applyZoom();

}

/* ==========================================================
   Fit Width
========================================================== */

async function fitWidth(){

    APP.zoom = 1.20;

    await applyZoom();

}

/* ==========================================================
   Fit Page
========================================================== */

async function fitPage(){

    APP.zoom = 1;

    await applyZoom();

}

/* ==========================================================
   Zoom Indicator
========================================================== */

function updateZoomIndicator(){

    const element =

        document.getElementById(

            "zoomValue"

        );

    if(

        element

    ){

        element.textContent =

            Math.round(

                APP.zoom * 100

            ) + "%";

    }

}

/* ==========================================================
   Mouse Wheel Zoom
========================================================== */

function enableWheelZoom(){

    const stage =

        document.querySelector(

            ".reader-stage"

        );

    if(

        !stage

    ){

        return;

    }

    stage.addEventListener(

        "wheel",

        event=>{

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

            }

            else{

                zoomOut();

            }

        },

        {

            passive:false

        }

    );

}

/* ==========================================================
   Toolbar Buttons
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .getElementById(

            "zoomIn"

        )

        .addEventListener(

            "click",

            zoomIn

        );

        document

        .getElementById(

            "zoomOut"

        )

        .addEventListener(

            "click",

            zoomOut

        );

        enableWheelZoom();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 18 OF 40
   reader.js
   Fullscreen + Rotation Manager
========================================================== */

/* ==========================================================
   Rotation
========================================================== */

const ROTATION = {

    angle:0

};

/* ==========================================================
   Apply Rotation
========================================================== */

async function applyRotation(){

    if(

        !UI.book

    ){

        return;

    }

    UI.book.style.transform =

        `rotate(${ROTATION.angle}deg)`;

}

/* ==========================================================
   Rotate Right
========================================================== */

function rotateRight(){

    ROTATION.angle += 90;

    if(

        ROTATION.angle >= 360

    ){

        ROTATION.angle = 0;

    }

    applyRotation();

}

/* ==========================================================
   Rotate Left
========================================================== */

function rotateLeft(){

    ROTATION.angle -= 90;

    if(

        ROTATION.angle < 0

    ){

        ROTATION.angle = 270;

    }

    applyRotation();

}

/* ==========================================================
   Enter Fullscreen
========================================================== */

async function enterFullscreen(){

    if(

        document.fullscreenElement

    ){

        return;

    }

    await document

    .documentElement

    .requestFullscreen();

    APP.fullscreen = true;

}

/* ==========================================================
   Exit Fullscreen
========================================================== */

async function exitFullscreen(){

    if(

        !document.fullscreenElement

    ){

        return;

    }

    await document

    .exitFullscreen();

    APP.fullscreen = false;

}

/* ==========================================================
   Toggle Fullscreen
========================================================== */

function toggleFullscreen(){

    if(

        document.fullscreenElement

    ){

        exitFullscreen();

    }

    else{

        enterFullscreen();

    }

}

/* ==========================================================
   Fullscreen Change
========================================================== */

document.addEventListener(

    "fullscreenchange",

    ()=>{

        APP.fullscreen =

            Boolean(

                document.fullscreenElement

            );

    }

);

/* ==========================================================
   Toolbar Events
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .getElementById(

            "fullscreenButton"

        )

        .addEventListener(

            "click",

            toggleFullscreen

        );

        document

        .getElementById(

            "rotateBook"

        )

        .addEventListener(

            "click",

            rotateRight

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 19 OF 40
   reader.js
   Touch Gestures + Keyboard Shortcuts
========================================================== */

/* ==========================================================
   Touch State
========================================================== */

const TOUCH = {

    startX:0,

    startY:0,

    endX:0,

    endY:0,

    threshold:60

};

/* ==========================================================
   Touch Start
========================================================== */

function touchStart(event){

    const touch =

        event.touches[0];

    TOUCH.startX =

        touch.clientX;

    TOUCH.startY =

        touch.clientY;

}

/* ==========================================================
   Touch End
========================================================== */

function touchEnd(event){

    const touch =

        event.changedTouches[0];

    TOUCH.endX =

        touch.clientX;

    TOUCH.endY =

        touch.clientY;

    detectSwipe();

}

/* ==========================================================
   Detect Swipe
========================================================== */

function detectSwipe(){

    const diffX =

        TOUCH.endX -

        TOUCH.startX;

    const diffY =

        Math.abs(

            TOUCH.endY -

            TOUCH.startY

        );

    if(

        Math.abs(diffX)

        < TOUCH.threshold ||

        diffY > 120

    ){

        return;

    }

    if(diffX < 0){

        nextPage();

    }

    else{

        previousPage();

    }

}

/* ==========================================================
   Keyboard Shortcuts
========================================================== */

function keyboardHandler(event){

    switch(event.key){

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

            toggleBookmark();

            break;

        case "r":

        case "R":

            rotateRight();

            break;

        case "Escape":

            exitFullscreen();

            break;

    }

}

/* ==========================================================
   Register Events
========================================================== */

function registerInputEvents(){

    const stage =

        document.querySelector(

            ".reader-stage"

        );

    if(stage){

        stage.addEventListener(

            "touchstart",

            touchStart,

            {

                passive:true

            }

        );

        stage.addEventListener(

            "touchend",

            touchEnd,

            {

                passive:true

            }

        );

    }

    document.addEventListener(

        "keydown",

        keyboardHandler

    );

}

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    registerInputEvents,

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 20 OF 40
   reader.js
   Session Manager + Reading Progress
========================================================== */

/* ==========================================================
   Session Keys
========================================================== */

const SESSION = {

    key:"chishti_reader_session"

};

/* ==========================================================
   Save Session
========================================================== */

function saveSession(){

    const session = {

        page:

            APP.currentPage,

        zoom:

            APP.zoom,

        theme:

            APP.theme,

        view:

            APP.view,

        rotation:

            ROTATION.angle,

        bookmarks:

            BOOKMARKS,

        lastRead:

            Date.now()

    };

    localStorage.setItem(

        SESSION.key,

        JSON.stringify(

            session

        )

    );

}

/* ==========================================================
   Restore Session
========================================================== */

function restoreSession(){

    const data =

        localStorage.getItem(

            SESSION.key

        );

    if(

        !data

    ){

        return;

    }

    const session =

        JSON.parse(

            data

        );

    APP.currentPage =

        session.page || 1;

    APP.zoom =

        session.zoom || 1;

    APP.theme =

        session.theme ||

        READER_CONFIG.defaultTheme;

    APP.view =

        session.view ||

        READER_CONFIG.defaultView;

    ROTATION.angle =

        session.rotation || 0;

    if(

        Array.isArray(

            session.bookmarks

        )

    ){

        BOOKMARKS.length = 0;

        BOOKMARKS.push(

            ...session.bookmarks

        );

    }

}

/* ==========================================================
   Reading Progress
========================================================== */

function updateReadingProgress(){

    if(

        !APP.totalPages

    ){

        return;

    }

    const progress =

        (

            APP.currentPage /

            APP.totalPages

        ) * 100;

    const bar =

        document.querySelector(

            ".reading-progress-bar"

        );

    const percent =

        document.querySelector(

            ".reading-percent"

        );

    if(bar){

        bar.style.width =

            progress + "%";

    }

    if(percent){

        percent.textContent =

            Math.round(

                progress

            ) + "%";

    }

}

/* ==========================================================
   Auto Save
========================================================== */

setInterval(

    ()=>{

        if(

            SETTINGS.autoSave

        ){

            saveSession();

        }

    },

    10000

);

/* ==========================================================
   Before Exit
========================================================== */

window.addEventListener(

    "beforeunload",

    ()=>{

        saveSession();

    }

);

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        restoreSession();

        updateReadingProgress();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 21 OF 40
   reader.js
   Table of Contents (TOC) + Thumbnail Sidebar
========================================================== */

/* ==========================================================
   TOC Manager
========================================================== */

const TOC = {

    items:[],

    loaded:false

};

/* ==========================================================
   Load Outline
========================================================== */

async function loadTableOfContents(){

    if(

        !PDF.document

    ){

        return;

    }

    try{

        const outline =

            await PDF.document.getOutline();

        TOC.items =

            outline || [];

        TOC.loaded = true;

        renderTOC();

    }

    catch(error){

        console.error(

            error

        );

    }

}

/* ==========================================================
   Render TOC
========================================================== */

function renderTOC(){

    const container =

        document.getElementById(

            "tocList"

        );

    if(

        !container

    ){

        return;

    }

    container.innerHTML = "";

    TOC.items.forEach(

        (item,index)=>{

            const row =

                document.createElement(

                    "div"

                );

            row.className =

                "toc-item";

            row.innerHTML =

            `

            <span>

                ${item.title}

            </span>

            `;

            row.addEventListener(

                "click",

                ()=>{

                    openTOCItem(

                        index

                    );

                }

            );

            container.appendChild(

                row

            );

        }

    );

}

/* ==========================================================
   Open TOC Item
========================================================== */

async function openTOCItem(index){

    const item =

        TOC.items[index];

    if(

        !item ||

        !item.dest

    ){

        return;

    }

    const destination =

        await PDF.document.getDestination(

            item.dest

        );

    const reference =

        destination[0];

    const page =

        await PDF.document.getPageIndex(

            reference

        );

    goToPage(

        page + 1

    );

}

/* ==========================================================
   Thumbnail Sidebar
========================================================== */

async function loadThumbnails(){

    const container =

        document.getElementById(

            "thumbnailList"

        );

    if(

        !container ||

        !PDF.document

    ){

        return;

    }

    container.innerHTML = "";

    for(

        let page = 1;

        page <= APP.totalPages;

        page++

    ){

        const thumb =

            document.createElement(

                "canvas"

            );

        thumb.className =

            "thumbnail";

        thumb.dataset.page =

            page;

        container.appendChild(

            thumb

        );

        renderThumbnail(

            page,

            thumb

        );

    }

}

/* ==========================================================
   Render Thumbnail
========================================================== */

async function renderThumbnail(

    pageNumber,

    canvas

){

    const page =

        await PDF.document.getPage(

            pageNumber

        );

    const viewport =

        page.getViewport({

            scale:0.25

        });

    canvas.width =

        viewport.width;

    canvas.height =

        viewport.height;

    await page.render({

        canvasContext:

        canvas.getContext(

            "2d"

        ),

        viewport

    }).promise;

    canvas.addEventListener(

        "click",

        ()=>{

            goToPage(

                pageNumber

            );

        }

    );

}

/* ==========================================================
   Initialize
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        loadTableOfContents();

        loadThumbnails();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 22 OF 40
   reader.js
   Panels Manager (Search, Theme, Settings, TOC, Bookmarks)
========================================================== */

/* ==========================================================
   Panel Manager
========================================================== */

const PANELS = {

    active:null

};

/* ==========================================================
   Open Panel
========================================================== */

function openPanel(id){

    closePanels();

    const panel =

        document.getElementById(

            id

        );

    if(

        !panel

    ){

        return;

    }

    panel.classList.add(

        "active"

    );

    PANELS.active = id;

}

/* ==========================================================
   Close Panel
========================================================== */

function closePanel(id){

    const panel =

        document.getElementById(

            id

        );

    if(

        !panel

    ){

        return;

    }

    panel.classList.remove(

        "active"

    );

    if(

        PANELS.active === id

    ){

        PANELS.active = null;

    }

}

/* ==========================================================
   Close All Panels
========================================================== */

function closePanels(){

    document

    .querySelectorAll(

        ".reader-panel"

    )

    .forEach(

        panel=>{

            panel.classList.remove(

                "active"

            );

        }

    );

    PANELS.active = null;

}

/* ==========================================================
   Toggle Panel
========================================================== */

function togglePanel(id){

    if(

        PANELS.active === id

    ){

        closePanel(id);

    }

    else{

        openPanel(id);

    }

}

/* ==========================================================
   Escape Key
========================================================== */

document.addEventListener(

    "keydown",

    event=>{

        if(

            event.key ===

            "Escape"

        ){

            closePanels();

        }

    }

);

/* ==========================================================
   Click Outside
========================================================== */

document.addEventListener(

    "click",

    event=>{

        if(

            event.target.classList.contains(

                "reader-panel"

            )

        ){

            closePanels();

        }

    }

);

/* ==========================================================
   Toolbar Buttons
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        document

        .getElementById(

            "settingButton"

        )

        ?.addEventListener(

            "click",

            ()=>{

                togglePanel(

                    "settingsPanel"

                );

            }

        );

        document

        .getElementById(

            "themeButton"

        )

        ?.addEventListener(

            "click",

            ()=>{

                togglePanel(

                    "themePanel"

                );

            }

        );

        document

        .getElementById(

            "bookmarkButton"

        )

        ?.addEventListener(

            "click",

            ()=>{

                togglePanel(

                    "bookmarkPanel"

                );

            }

        );

        document

        .getElementById(

            "searchInput"

        )

        ?.addEventListener(

            "focus",

            ()=>{

                openPanel(

                    "searchPanel"

                );

            }

        );

        document

        .getElementById(

            "tocButton"

        )

        ?.addEventListener(

            "click",

            ()=>{

                togglePanel(

                    "tocPanel"

                );

            }

        );

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 23 OF 40
   reader.js
   Loading Screen + Notifications + Error Manager
========================================================== */

/* ==========================================================
   Loader Manager
========================================================== */

const LOADER = {

    visible:false

};

/* ==========================================================
   Show Loader
========================================================== */

function showLoader(

    message="Loading Book..."

){

    let loader =

        document.getElementById(

            "readerLoader"

        );

    if(!loader){

        loader =

            document.createElement(

                "div"

            );

        loader.id =

            "readerLoader";

        loader.innerHTML =

        `

        <div class="loader-box">

            <div class="loader-book">

                <div class="loader-page"></div>

                <div class="loader-page"></div>

                <div class="loader-page"></div>

            </div>

            <h3 id="loaderText">

                ${message}

            </h3>

        </div>

        `;

        document.body.appendChild(

            loader

        );

    }

    document.getElementById(

        "loaderText"

    ).textContent = message;

    loader.classList.add(

        "show"

    );

    LOADER.visible = true;

}

/* ==========================================================
   Hide Loader
========================================================== */

function hideLoader(){

    const loader =

        document.getElementById(

            "readerLoader"

        );

    if(loader){

        loader.classList.remove(

            "show"

        );

    }

    LOADER.visible = false;

}

/* ==========================================================
   Toast Notification
========================================================== */

function showToast(

    message,

    type="success"

){

    const toast =

        document.createElement(

            "div"

        );

    toast.className =

        `toast ${type}`;

    toast.textContent =

        message;

    document.body.appendChild(

        toast

    );

    requestAnimationFrame(

        ()=>{

            toast.classList.add(

                "show"

            );

        }

    );

    setTimeout(

        ()=>{

            toast.classList.remove(

                "show"

            );

            setTimeout(

                ()=>{

                    toast.remove();

                },

                300

            );

        },

        2500

    );

}

/* ==========================================================
   Notifications
========================================================== */

function success(message){

    showToast(

        message,

        "success"

    );

}

function warning(message){

    showToast(

        message,

        "warning"

    );

}

function error(message){

    showToast(

        message,

        "error"

    );

}

/* ==========================================================
   Global Error Handler
========================================================== */

window.addEventListener(

    "error",

    event=>{

        console.error(

            event.error

        );

        error(

            "Unexpected error occurred."

        );

    }

);

/* ==========================================================
   Promise Error
========================================================== */

window.addEventListener(

    "unhandledrejection",

    event=>{

        console.error(

            event.reason

        );

        error(

            "Operation failed."

        );

    }

);

/* ==========================================================
   PDF Loading Events
========================================================== */

document.addEventListener(

    "pdfLoading",

    ()=>{

        showLoader(

            "Opening Book..."

        );

    }

);

document.addEventListener(

    "pdfLoaded",

    ()=>{

        hideLoader();

        success(

            "Book Loaded Successfully"

        );

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 24 OF 40
   reader.js
   Application Initializer + Startup Manager
========================================================== */

/* ==========================================================
   Initialize Reader
========================================================== */

async function initializeReader(){

    if(

        APP.initialized

    ){

        return;

    }

    try{

        showLoader(

            "Initializing Chishti Reader..."

        );

        cacheElements();

        loadSettings();

        loadTheme();

        loadBookmarks();

        restoreSession();

        registerInputEvents();

        updateReadingProgress();

        enableBookAnimation();

        applyRotation();

        applyZoom();

        APP.initialized = true;

        hideLoader();

        success(

            "CHISHTI READER Ready"

        );

    }

    catch(ex){

        console.error(

            ex

        );

        hideLoader();

        error(

            "Reader initialization failed."

        );

    }

}

/* ==========================================================
   Load Book
========================================================== */

async function openReader(pdfUrl){

    if(

        !pdfUrl

    ){

        warning(

            "No PDF selected."

        );

        return;

    }

    try{

        showLoader(

            "Opening Book..."

        );

        await loadPDF(

            pdfUrl

        );

        await openBook();

        await renderSpread();

        updateReadingProgress();

        hideLoader();

        success(

            "Book Ready"

        );

    }

    catch(ex){

        console.error(

            ex

        );

        hideLoader();

        error(

            "Unable to open PDF."

        );

    }

}

/* ==========================================================
   Refresh Reader
========================================================== */

async function refreshReader(){

    if(

        !APP.pdf

    ){

        return;

    }

    await renderSpread();

    updateReadingProgress();

}

/* ==========================================================
   Destroy Reader
========================================================== */

function destroyReader(){

    saveSession();

    saveBookmarks();

    saveSettings();

    APP.pdf = null;

    APP.initialized = false;

    APP.loading = false;

    APP.rendering = false;

}

/* ==========================================================
   Visibility Change
========================================================== */

document.addEventListener(

    "visibilitychange",

    ()=>{

        if(

            document.hidden

        ){

            saveSession();

        }

    }

);

/* ==========================================================
   Startup
========================================================== */

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        await initializeReader();

    },

    {

        once:true

    }

);
/* ==========================================================
   CHISHTI READER PRO v7
   PART 25 OF 40
   reader.js
   Public API + Global Export
========================================================== */

/* ==========================================================
   Public API
========================================================== */

const ChishtiReader = {

    /* Initialization */

    init:

        initializeReader,

    open:

        openReader,

    destroy:

        destroyReader,

    refresh:

        refreshReader,

    /* PDF */

    load:

        loadPDF,

    /* Navigation */

    next:

        nextPage,

    previous:

        previousPage,

    goto:

        goToPage,

    first(){

        goToPage(1);

    },

    last(){

        goToPage(

            APP.totalPages

        );

    },

    /* Zoom */

    zoomIn,

    zoomOut,

    resetZoom,

    fitPage,

    fitWidth,

    /* Rotation */

    rotateLeft,

    rotateRight,

    /* Fullscreen */

    fullscreen:

        toggleFullscreen,

    /* Search */

    search:

        searchBook,

    nextResult,

    previousResult,

    /* Bookmark */

    bookmark:

        toggleBookmark,

    bookmarks:

        BOOKMARKS,

    /* Theme */

    theme:

        applyTheme,

    /* Settings */

    settings:

        SETTINGS,

    updateSetting,

    resetSettings,

    /* Panels */

    openPanel,

    closePanel,

    togglePanel,

    /* Session */

    save:

        saveSession,

    restore:

        restoreSession

};

/* ==========================================================
   Global Export
========================================================== */

window.ChishtiReader =

    Object.freeze(

        ChishtiReader

    );

/* ==========================================================
   Console Banner
========================================================== */

console.log(

`%c
╔══════════════════════════════════════════════╗
║         CHISHTI READER PRO v7               ║
║     Professional Islamic PDF Reader         ║
╚══════════════════════════════════════════════╝
`,

"color:#d4af37;font-weight:bold;font-size:14px;"

);

console.log(

"Version :",

READER_CONFIG.version

);

console.log(

"Theme :",

APP.theme

);

console.log(

"Ready ✔"

/* ==========================================================
   END OF PART 25
   Remaining Parts:
   26. Theme CSS (All 6 Themes)
   27. Loader CSS
   28. Toast CSS
   29. Search Highlight Engine
   30. Real Page Curl Engine
   31. Book Shelf UI
   32. Library Cards Animation
   33. PDF Watermark Engine
   34. Lazy Loading Engine
   35. Performance Optimizer
   36. Accessibility
   37. Print & Download
   38. Advanced Mobile Gestures
   39. Final Integration
   40. Production Build
========================================================== */
);
/* ==========================================================
   CHISHTI READER PRO v7
   FINAL FIX
   Auto Open Book From URL
========================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js";

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // Initialize reader
        await initializeReader();

        // Get book from URL
        const params = new URLSearchParams(
            window.location.search
        );

        const book = params.get("book");

        if(book){

            // PDFs are inside books folder
            const pdfPath = `books/${book}`;

            console.log("Opening:", pdfPath);

            await openReader(pdfPath);
        }
        else{

            warning("No book specified in URL");
        }
    },
    { once:true }
);
