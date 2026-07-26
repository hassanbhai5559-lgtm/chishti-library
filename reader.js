/*====================================================
 CHISHTI READER v5
 PART 1
 FOUNDATION
====================================================*/

"use strict";

/*====================================================
PDF.JS WORKER
====================================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*====================================================
URL PARAMETERS
====================================================*/

const urlParams = new URLSearchParams(window.location.search);

const PDF_URL =
decodeURIComponent(
urlParams.get("book") || ""
);

const BOOK_TITLE =
decodeURIComponent(
urlParams.get("title") || "Chishti Library"
);

/*====================================================
DOM
====================================================*/

const readerApp =
document.getElementById("readerApp");

const leftCanvas =
document.getElementById("leftCanvas");

const rightCanvas =
document.getElementById("rightCanvas");

const leftCtx =
leftCanvas.getContext("2d",{alpha:false});

const rightCtx =
rightCanvas.getContext("2d",{alpha:false});

const bookTitle =
document.getElementById("bookTitle");

const currentPageDisplay =
document.getElementById("currentPageDisplay");

const totalPagesDisplay =
document.getElementById("totalPagesDisplay");

const preloader =
document.getElementById("preloader");

/*====================================================
MAIN ENGINE
====================================================*/

const Reader={

pdf:null,

totalPages:0,

currentPage:1,

zoom:1.40,

rotation:0,

rendering:false,

ready:false,

theme:"maroon",

animation:true,

cache:new Map(),

textCache:new Map(),

bookmark:new Set(),

MAX_CACHE:16,

dpi:
window.devicePixelRatio||1

};

/*====================================================
SAVE
====================================================*/

function saveState(){

localStorage.setItem(

"chishti_reader",

JSON.stringify({

page:Reader.currentPage,

zoom:Reader.zoom,

theme:Reader.theme

})

);

}

/*====================================================
RESTORE
====================================================*/

function restoreState(){

const data=

localStorage.getItem(

"chishti_reader"

);

if(!data) return;

try{

const state=

JSON.parse(data);

Reader.currentPage=

state.page||1;

Reader.zoom=

state.zoom||1.4;

Reader.theme=

state.theme||"maroon";

}

catch(e){}

}

/*====================================================
PRELOADER
====================================================*/

function hidePreloader(){

if(!preloader) return;

preloader.classList.add("hide");

setTimeout(()=>{

preloader.remove();

},500);

}

/*====================================================
PAGE CACHE
====================================================*/

async function getPage(pageNo){

if(

Reader.cache.has(pageNo)

){

return Reader.cache.get(pageNo);

}

const page=

await Reader.pdf.getPage(pageNo);

Reader.cache.set(

pageNo,

page

);

if(

Reader.cache.size>

Reader.MAX_CACHE

){

const oldest=

Reader.cache

.keys()

.next()

.value;

Reader.cache.delete(oldest);

}

return page;

}

/*====================================================
LOAD PDF
====================================================*/

async function loadPDF(){

if(!PDF_URL){

alert("PDF Not Found");

return;

}

try{

const task=

pdfjsLib.getDocument({

url:PDF_URL,

cMapPacked:true,

enableXfa:false,

disableFontFace:false

});

Reader.pdf=

await task.promise;

Reader.totalPages=

Reader.pdf.numPages;

Reader.ready=true;

bookTitle.textContent=

BOOK_TITLE;

totalPagesDisplay.textContent=

Reader.totalPages;

hidePreloader();

console.log(

"PDF Ready"

);

}

catch(err){

console.error(err);

alert(

"Unable To Load PDF"

);

}

}

/*====================================================
START
====================================================*/

window.addEventListener(

"load",

async()=>{

restoreState();

await loadPDF();

});

/*====================================================
 CHISHTI READER v5
 PART 2
 ULTRA FAST RENDER ENGINE
====================================================*/

/*====================================================
RENDER VIEWPORT
====================================================*/

function createViewport(page){

    return page.getViewport({

        scale:Reader.zoom,

        rotation:Reader.rotation

    });

}

/*====================================================
FIT CANVAS
====================================================*/

function prepareCanvas(canvas,ctx,viewport){

    const ratio = Reader.dpi;

    canvas.width  = viewport.width  * ratio;
    canvas.height = viewport.height * ratio;

    canvas.style.width  = viewport.width  + "px";
    canvas.style.height = viewport.height + "px";

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );

}

/*====================================================
DRAW PAGE
====================================================*/

async function drawPage(pageNumber,canvas,ctx){

    if(pageNumber<1 || pageNumber>Reader.totalPages){

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;

    }

    const page =
    await getPage(pageNumber);

    const viewport =
    createViewport(page);

    prepareCanvas(
        canvas,
        ctx,
        viewport
    );

    await page.render({

        canvasContext:ctx,

        viewport,

        intent:"display"

    }).promise;

}

/*====================================================
SPREAD
====================================================*/

async function renderSpread(){

    if(
        !Reader.ready ||
        Reader.rendering
    ) return;

    Reader.rendering = true;

    try{

        await Promise.all([

            drawPage(

                Reader.currentPage,

                leftCanvas,

                leftCtx

            ),

            drawPage(

                Reader.currentPage+1,

                rightCanvas,

                rightCtx

            )

        ]);

        updateCounter();

        preloadNearbyPages();

    }

    catch(error){

        console.error(error);

    }

    finally{

        Reader.rendering = false;

    }

}

/*====================================================
COUNTER
====================================================*/

function updateCounter(){

    let right =
    Reader.currentPage+1;

    if(right>Reader.totalPages)
        right=Reader.totalPages;

    currentPageDisplay.textContent=

        Reader.currentPage+

        " - "+

        right;

}

/*====================================================
PRELOAD
====================================================*/

async function preloadNearbyPages(){

    const pages=[

        Reader.currentPage+2,
        Reader.currentPage+3,
        Reader.currentPage-2,
        Reader.currentPage-3

    ];

    pages.forEach(async(p)=>{

        if(

            p>=1 &&
            p<=Reader.totalPages &&
            !Reader.cache.has(p)

        ){

            try{

                const page=

                await Reader.pdf.getPage(p);

                Reader.cache.set(
                    p,
                    page
                );

            }

            catch(e){}

        }

    });

}

/*====================================================
REFRESH
====================================================*/

async function refreshReader(){

    await renderSpread();

}

/*====================================================
FIRST RENDER
====================================================*/

window.addEventListener(

"load",

async()=>{

    while(!Reader.ready){

        await new Promise(r=>setTimeout(r,40));

    }

    await refreshReader();

});

console.log("✅ Render Engine Ready");

/*====================================================
 CHISHTI READER v5
 PART 3
 NAVIGATION ENGINE
====================================================*/

/*====================================================
DOM
====================================================*/

const firstPageBtn =
document.getElementById("firstPageBtn");

const prevPageBtn =
document.getElementById("prevPageBtn");

const nextPageBtn =
document.getElementById("nextPageBtn");

const lastPageBtn =
document.getElementById("lastPageBtn");

/*====================================================
GO TO PAGE
====================================================*/

async function goToPage(page){

    if(!Reader.ready) return;

    if(page<1)
        page=1;

    if(page>Reader.totalPages)
        page=Reader.totalPages;

    if(page%2===0)
        page--;

    Reader.currentPage=page;

    saveState();

    await renderSpread();

}

/*====================================================
NEXT
====================================================*/

async function nextSpread(){

    if(
        Reader.currentPage+2>
        Reader.totalPages
    ) return;

    await goToPage(

        Reader.currentPage+2

    );

}

/*====================================================
PREVIOUS
====================================================*/

async function previousSpread(){

    await goToPage(

        Reader.currentPage-2

    );

}

/*====================================================
FIRST
====================================================*/

async function firstSpread(){

    await goToPage(1);

}

/*====================================================
LAST
====================================================*/

async function lastSpread(){

    let page=

    Reader.totalPages;

    if(page%2===0)
        page--;

    await goToPage(page);

}

/*====================================================
BUTTON EVENTS
====================================================*/

if(firstPageBtn){

firstPageBtn.onclick=

()=>firstSpread();

}

if(prevPageBtn){

prevPageBtn.onclick=

()=>previousSpread();

}

if(nextPageBtn){

nextPageBtn.onclick=

()=>nextSpread();

}

if(lastPageBtn){

lastPageBtn.onclick=

()=>lastSpread();

}

/*====================================================
KEYBOARD
====================================================*/

document.addEventListener(

"keydown",

async(e)=>{

switch(e.key){

case"ArrowRight":

await nextSpread();

break;

case"ArrowLeft":

await previousSpread();

break;

case"Home":

await firstSpread();

break;

case"End":

await lastSpread();

break;

}

});

/*====================================================
MOUSE WHEEL
====================================================*/

let wheelLock=false;

readerApp.addEventListener(

"wheel",

async(e)=>{

if(e.ctrlKey)
return;

if(wheelLock)
return;

wheelLock=true;

setTimeout(()=>{

wheelLock=false;

},220);

if(e.deltaY>0){

await nextSpread();

}else{

await previousSpread();

}

},

{passive:true}

);

/*====================================================
DOUBLE CLICK
====================================================*/

readerApp.addEventListener(

"dblclick",

()=>{

if(document.fullscreenElement){

document.exitFullscreen();

}else{

document.documentElement
.requestFullscreen();

}

});

/*====================================================
SWIPE
====================================================*/

let touchStartX=0;

readerApp.addEventListener(

"touchstart",

(e)=>{

touchStartX=

e.touches[0].clientX;

},

{passive:true}

);

readerApp.addEventListener(

"touchend",

async(e)=>{

const endX=

e.changedTouches[0].clientX;

const diff=

touchStartX-endX;

if(Math.abs(diff)<70)
return;

if(diff>0){

await nextSpread();

}else{

await previousSpread();

}

},

{passive:true}

);

console.log(
"✅ Navigation Engine Ready"
);

/*====================================================
 CHISHTI READER v5
 PART 4
 ZOOM ENGINE
====================================================*/

/*====================================================
DOM
====================================================*/

const zoomInBtn =
document.getElementById("zoomInBtn");

const zoomOutBtn =
document.getElementById("zoomOutBtn");

/*====================================================
LIMITS
====================================================*/

const MIN_ZOOM = 0.80;

const MAX_ZOOM = 3.00;

const ZOOM_STEP = 0.15;

/*====================================================
SET ZOOM
====================================================*/

async function setZoom(level){

    if(!Reader.ready) return;

    level = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, level)
    );

    Reader.zoom = level;

    saveState();

    await renderSpread();

}

/*====================================================
ZOOM IN
====================================================*/

async function zoomIn(){

    await setZoom(

        Reader.zoom + ZOOM_STEP

    );

}

/*====================================================
ZOOM OUT
====================================================*/

async function zoomOut(){

    await setZoom(

        Reader.zoom - ZOOM_STEP

    );

}

/*====================================================
RESET
====================================================*/

async function resetZoom(){

    await setZoom(1.40);

}

/*====================================================
BUTTON EVENTS
====================================================*/

if(zoomInBtn){

    zoomInBtn.onclick = zoomIn;

}

if(zoomOutBtn){

    zoomOutBtn.onclick = zoomOut;

}

/*====================================================
CTRL + WHEEL
====================================================*/

readerApp.addEventListener(

"wheel",

async(e)=>{

    if(!e.ctrlKey) return;

    e.preventDefault();

    if(e.deltaY<0){

        zoomIn();

    }else{

        zoomOut();

    }

},

{passive:false}

);

/*====================================================
DOUBLE CLICK
====================================================*/

leftCanvas.addEventListener(

"dblclick",

()=>{

    if(Reader.zoom<2){

        zoomIn();

    }else{

        resetZoom();

    }

});

rightCanvas.addEventListener(

"dblclick",

()=>{

    if(Reader.zoom<2){

        zoomIn();

    }else{

        resetZoom();

    }

});

/*====================================================
PINCH ZOOM
====================================================*/

let pinchStartDistance = 0;

function getDistance(t1,t2){

    return Math.hypot(

        t1.clientX - t2.clientX,

        t1.clientY - t2.clientY

    );

}

readerApp.addEventListener(

"touchstart",

(e)=>{

    if(e.touches.length===2){

        pinchStartDistance=

        getDistance(

            e.touches[0],

            e.touches[1]

        );

    }

},

{passive:true}

);

readerApp.addEventListener(

"touchmove",

async(e)=>{

    if(e.touches.length!==2) return;

    const currentDistance=

    getDistance(

        e.touches[0],

        e.touches[1]

    );

    if(Math.abs(

        currentDistance-

        pinchStartDistance

    )<18) return;

    if(currentDistance>

        pinchStartDistance){

        zoomIn();

    }else{

        zoomOut();

    }

    pinchStartDistance=

    currentDistance;

},

{passive:true}

);

/*====================================================
KEYBOARD
====================================================*/

document.addEventListener(

"keydown",

(e)=>{

    if(e.key==="+" ||

       e.key==="="){

        zoomIn();

    }

    if(e.key==="-"){

        zoomOut();

    }

    if(e.key==="0"){

        resetZoom();

    }

});

/*====================================================
END
====================================================*/

console.log(

"✅ Zoom Engine Ready"

);

/*====================================================
 CHISHTI READER v5
 PART 5
 SEARCH ENGINE
====================================================*/

/*====================================================
DOM
====================================================*/

const searchBtn =
document.getElementById("searchBtn");

const searchOverlay =
document.getElementById("searchOverlay");

const searchInput =
document.getElementById("searchInput");

const searchResults =
document.getElementById("searchResults");

const startSearchBtn =
document.getElementById("startSearchBtn");

const closeSearchBtn =
document.getElementById("closeSearchBtn");

/*====================================================
TEXT CACHE
====================================================*/

Reader.searchData = [];

/*====================================================
EXTRACT TEXT
====================================================*/

async function buildSearchIndex(){

    if(Reader.searchData.length)
        return;

    for(

        let i=1;

        i<=Reader.totalPages;

        i++

    ){

        try{

            const page =
            await getPage(i);

            const txt =
            await page.getTextContent();

            const text =

            txt.items

            .map(v=>v.str)

            .join(" ");

            Reader.searchData.push({

                page:i,

                text:text

            });

        }

        catch(e){

            console.log(e);

        }

    }

}

/*====================================================
OPEN SEARCH
====================================================*/

function openSearch(){

    searchOverlay.classList.add("active");

    setTimeout(()=>{

        searchInput.focus();

    },200);

}

/*====================================================
CLOSE SEARCH
====================================================*/

function closeSearch(){

    searchOverlay.classList.remove("active");

}

/*====================================================
SEARCH
====================================================*/

async function performSearch(){

    const keyword =

    searchInput.value

    .trim()

    .toLowerCase();

    if(!keyword)
        return;

    if(

        Reader.searchData.length===0

    ){

        await buildSearchIndex();

    }

    searchResults.innerHTML="";

    let found = 0;

    Reader.searchData.forEach(item=>{

        if(

            item.text

            .toLowerCase()

            .includes(keyword)

        ){

            found++;

            const div =

            document.createElement("div");

            div.className="search-item";

            div.innerHTML=`

            <strong>

            Page ${item.page}

            </strong>

            <br>

            ${item.text.substring(0,180)}...

            `;

            div.onclick=async()=>{

                closeSearch();

                await goToPage(item.page);

            };

            searchResults.appendChild(div);

        }

    });

    if(found===0){

        searchResults.innerHTML=

        `<div class="empty-state">

        No Result Found

        </div>`;

    }

}

/*====================================================
BUTTON EVENTS
====================================================*/

if(searchBtn){

searchBtn.onclick=

()=>openSearch();

}

if(closeSearchBtn){

closeSearchBtn.onclick=

()=>closeSearch();

}

if(startSearchBtn){

startSearchBtn.onclick=

()=>performSearch();

}

/*====================================================
ENTER
====================================================*/

searchInput.addEventListener(

"keydown",

e=>{

if(e.key==="Enter")

performSearch();

});

/*====================================================
ESC
====================================================*/

document.addEventListener(

"keydown",

e=>{

if(

e.key==="Escape"

)

closeSearch();

});

console.log(

"✅ Search Engine Ready"

);

/*====================================================
 CHISHTI READER v5
 PART 6
 BOOKMARK + SETTINGS + THEME ENGINE
====================================================*/

/*====================================================
DOM
====================================================*/

const bookmarkBtn =
document.getElementById("bookmarkBtn");

const bookmarkOverlay =
document.getElementById("bookmarkOverlay");

const bookmarkList =
document.getElementById("bookmarkList");

const closeBookmarkBtn =
document.getElementById("closeBookmarkBtn");

const settingsBtn =
document.getElementById("settingsBtn");

const settingsOverlay =
document.getElementById("settingsOverlay");

const closeSettingsBtn =
document.getElementById("closeSettingsBtn");

const saveSettingsBtn =
document.getElementById("saveSettingsBtn");

const themeBtn =
document.getElementById("themeBtn");

const themeSelect =
document.getElementById("themeSelect");

const defaultZoom =
document.getElementById("defaultZoom");

const animationToggle =
document.getElementById("animationToggle");

const continueReadingToggle =
document.getElementById("continueReadingToggle");

/*====================================================
BOOKMARK STORAGE
====================================================*/

function saveBookmarks(){

localStorage.setItem(

"reader_bookmarks",

JSON.stringify(

Array.from(

Reader.bookmark

)

)

);

}

function loadBookmarks(){

const data=

localStorage.getItem(

"reader_bookmarks"

);

if(!data) return;

try{

Reader.bookmark=

new Set(

JSON.parse(data)

);

}catch(e){}

}

/*====================================================
BOOKMARK WINDOW
====================================================*/

function refreshBookmarks(){

bookmarkList.innerHTML="";

if(Reader.bookmark.size===0){

bookmarkList.innerHTML=

`<div class="empty-state">

No bookmarks yet.

</div>`;

return;

}

Reader.bookmark.forEach(page=>{

const item=

document.createElement("div");

item.className="search-item";

item.innerHTML=

`Page ${page}`;

item.onclick=async()=>{

bookmarkOverlay.classList.remove("active");

await goToPage(page);

};

bookmarkList.appendChild(item);

});

}

bookmarkBtn.onclick=()=>{

refreshBookmarks();

bookmarkOverlay.classList.add("active");

};

closeBookmarkBtn.onclick=()=>{

bookmarkOverlay.classList.remove("active");

};

/*====================================================
ADD BOOKMARK
====================================================*/

bookmarkBtn.addEventListener(

"dblclick",

()=>{

if(

Reader.bookmark.has(

Reader.currentPage

)

){

Reader.bookmark.delete(

Reader.currentPage

);

}else{

Reader.bookmark.add(

Reader.currentPage

);

}

saveBookmarks();

refreshBookmarks();

});

/*====================================================
SETTINGS
====================================================*/

settingsBtn.onclick=()=>{

themeSelect.value=

Reader.theme;

defaultZoom.value=

Reader.zoom;

animationToggle.checked=

Reader.animation;

settingsOverlay.classList.add("active");

};

closeSettingsBtn.onclick=()=>{

settingsOverlay.classList.remove("active");

};

/*====================================================
SAVE SETTINGS
====================================================*/

saveSettingsBtn.onclick=async()=>{

Reader.theme=

themeSelect.value;

Reader.zoom=

parseFloat(

defaultZoom.value

);

Reader.animation=

animationToggle.checked;

document.body.setAttribute(

"data-theme",

Reader.theme

);

saveState();

settingsOverlay.classList.remove(

"active"

);

await renderSpread();

};

/*====================================================
THEME BUTTON
====================================================*/

themeBtn.onclick=()=>{

const themes=[

"maroon",

"dark",

"light",

"sepia"

];

let index=

themes.indexOf(

Reader.theme

);

index++;

if(index>=themes.length)

index=0;

Reader.theme=

themes[index];

document.body.setAttribute(

"data-theme",

Reader.theme

);

saveState();

};

/*====================================================
START
====================================================*/

window.addEventListener(

"load",

()=>{

loadBookmarks();

document.body.setAttribute(

"data-theme",

Reader.theme

);

});

console.log(

"✅ Bookmark + Settings Engine Ready"

);

/*====================================================
 CHISHTI READER v5
 PART 7
 DOWNLOAD + PRINT + FULLSCREEN + TOAST
====================================================*/

/*====================================================
DOM
====================================================*/

const downloadPdfBtn =
document.getElementById("downloadPdfBtn");

const printPdfBtn =
document.getElementById("printPdfBtn");

const fullscreenReaderBtn =
document.getElementById("fullscreenReaderBtn");

const loadingBar =
document.querySelector(".loading-bar");

const loadingProgress =
document.querySelector(".loading-progress");

const toast =
document.querySelector(".toast");

const toastMessage =
document.querySelector(".toast-message");

/*====================================================
TOAST
====================================================*/

function showToast(message,icon="fa-circle-check"){

    if(!toast) return;

    const iconBox =
    toast.querySelector("i");

    if(iconBox){

        iconBox.className =
        "fas "+icon;

    }

    if(toastMessage){

        toastMessage.textContent =
        message;

    }

    toast.classList.add("show");

    clearTimeout(
        toast.timer
    );

    toast.timer =

    setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

/*====================================================
LOADING BAR
====================================================*/

function startLoading(){

    if(!loadingBar) return;

    loadingBar.style.display="block";

    loadingProgress.style.width="0%";

}

function setLoading(value){

    if(!loadingProgress) return;

    loadingProgress.style.width=

    value+"%";

}

function stopLoading(){

    if(!loadingBar) return;

    loadingProgress.style.width="100%";

    setTimeout(()=>{

        loadingBar.style.display="none";

        loadingProgress.style.width="0%";

    },250);

}

/*====================================================
DOWNLOAD
====================================================*/

if(downloadPdfBtn){

downloadPdfBtn.onclick=async()=>{

    if(!PDF_URL) return;

    startLoading();

    setLoading(20);

    const link=

    document.createElement("a");

    link.href=PDF_URL;

    link.download=

    BOOK_TITLE+".pdf";

    setLoading(70);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setLoading(100);

    stopLoading();

    showToast(

    "PDF Download Started",

    "fa-download"

    );

};

}

/*====================================================
PRINT
====================================================*/

if(printPdfBtn){

printPdfBtn.onclick=()=>{

    if(!PDF_URL) return;

    const win=

    window.open(PDF_URL);

    if(win){

        win.onload=()=>{

            win.print();

        };

    }

    showToast(

    "Print Window Opened",

    "fa-print"

    );

};

}

/*====================================================
FULLSCREEN
====================================================*/

if(fullscreenReaderBtn){

fullscreenReaderBtn.onclick=()=>{

    if(

    !document.fullscreenElement

    ){

        document.documentElement

        .requestFullscreen();

        showToast(

        "Fullscreen Enabled",

        "fa-expand"

        );

    }

    else{

        document.exitFullscreen();

        showToast(

        "Fullscreen Disabled",

        "fa-compress"

        );

    }

};

}

/*====================================================
SHORTCUTS
====================================================*/

document.addEventListener(

"keydown",

e=>{

    if(e.key==="F11"){

        e.preventDefault();

        fullscreenReaderBtn.click();

    }

    if(

        e.ctrlKey &&

        e.key.toLowerCase()==="p"

    ){

        e.preventDefault();

        printPdfBtn.click();

    }

    if(

        e.ctrlKey &&

        e.key.toLowerCase()==="d"

    ){

        e.preventDefault();

        downloadPdfBtn.click();

    }

});

console.log(

"✅ Download + Print + Fullscreen Ready"

);

/*====================================================
 CHISHTI READER v5
 PART 8
 FINAL ENGINE
 LOADER + AUTO SAVE + PERFORMANCE
====================================================*/

/*====================================================
PDF LOADER
====================================================*/

const pdfLoading =
document.querySelector(".pdf-loading");

function showPDFLoader(){

    if(pdfLoading)
        pdfLoading.classList.add("active");

}

function hidePDFLoader(){

    if(pdfLoading)
        pdfLoading.classList.remove("active");

}

/*====================================================
FAST PAGE PRELOAD
====================================================*/

async function smartPreload(){

    if(!Reader.ready) return;

    const pages=[];

    for(let i=1;i<=6;i++){

        if(
            Reader.currentPage+i<=Reader.totalPages
        ){

            pages.push(
                Reader.currentPage+i
            );

        }

    }

    for(const p of pages){

        if(!Reader.cache.has(p)){

            try{

                const page=
                await Reader.pdf.getPage(p);

                Reader.cache.set(p,page);

            }

            catch(e){}

        }

    }

}

/*====================================================
AUTO SAVE
====================================================*/

setInterval(()=>{

    if(!Reader.ready) return;

    saveState();

},5000);

/*====================================================
MEMORY CLEANER
====================================================*/

setInterval(()=>{

    if(

        Reader.cache.size>

        Reader.MAX_CACHE

    ){

        const remove=

        Reader.cache.size-

        Reader.MAX_CACHE;

        const keys=

        Array.from(

            Reader.cache.keys()

        );

        for(

            let i=0;

            i<remove;

            i++

        ){

            Reader.cache.delete(

                keys[i]

            );

        }

    }

},10000);

/*====================================================
ONLINE / OFFLINE
====================================================*/

window.addEventListener(

"offline",

()=>{

showToast(

"Offline Mode",

"fa-wifi"

);

});

window.addEventListener(

"online",

()=>{

showToast(

"Back Online",

"fa-globe"

);

});

/*====================================================
VISIBILITY
====================================================*/

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

saveState();

}

});

/*====================================================
WINDOW RESIZE
====================================================*/

let resizeTimer;

window.addEventListener(

"resize",

()=>{

clearTimeout(

resizeTimer

);

resizeTimer=

setTimeout(()=>{

renderSpread();

},250);

});

/*====================================================
FAST START
====================================================*/

window.addEventListener(

"load",

async()=>{

showPDFLoader();

await new Promise(r=>setTimeout(r,80));

await renderSpread();

await smartPreload();

hidePDFLoader();

showToast(

"Reader Ready",

"fa-book-open"

);

});

/*====================================================
ERROR HANDLER
====================================================*/

window.addEventListener(

"error",

e=>{

console.error(e);

showToast(

"Unexpected Error",

"fa-triangle-exclamation"

);

});

/*====================================================
UNHANDLED PROMISE
====================================================*/

window.addEventListener(

"unhandledrejection",

e=>{

console.error(e.reason);

});

/*====================================================
PERFORMANCE
====================================================*/

console.log(

"================================="

);

console.log(

"CHISHTI READER v5"

);

console.log(

"Premium Reader Loaded"

);

console.log(

"Fast PDF Engine Enabled"

);

console.log(

"Two Page Spread Enabled"

);

console.log(

"Smart Cache Enabled"

);

console.log(

"Search Enabled"

);

console.log(

"Bookmarks Enabled"

);

console.log(

"Settings Enabled"

);

console.log(

"Theme Engine Enabled"

);

console.log(

"Performance Mode Enabled"

);

console.log(

"================================="

);

/*====================================================
END OF reader.js
====================================================*/
