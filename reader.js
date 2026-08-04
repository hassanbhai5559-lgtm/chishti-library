/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 1
            CORE + PDF INITIALIZATION
==================================================*/

"use strict";

/*==================================================
                PDF.JS
==================================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.js";

/*==================================================
                READER OBJECT
==================================================*/

const Reader = {

    /*------------------------------
        PDF
    ------------------------------*/

    pdf: null,

    bookUrl: "",

    totalPages: 0,

    currentPage: 1,

    /*------------------------------
        Canvas
    ------------------------------*/

    leftCanvas: null,

    rightCanvas: null,

    leftContext: null,

    rightContext: null,

    /*------------------------------
        Zoom
    ------------------------------*/

    zoom: 1,

    minZoom: 0.60,

    maxZoom: 3,

    zoomStep: 0.20,

    /*------------------------------
        View
    ------------------------------*/

    singleMode: false,

    doubleMode: true,

    mobileMode: false,

    /*------------------------------
        Cache
    ------------------------------*/

    pageCache: new Map(),

    renderQueue: [],

    rendering: false,

    /*------------------------------
        Search
    ------------------------------*/

    searchIndex: [],

    searchResults: [],

    /*------------------------------
        Bookmark
    ------------------------------*/

    bookmarks: [],

    /*------------------------------
        UI
    ------------------------------*/

    initialized: false,

    animationRunning: false

};

/*==================================================
                DOM
==================================================*/

Reader.dom = {};

/*==================================================
                GET ELEMENT
==================================================*/

Reader.$ = function(id){

    return document.getElementById(id);

};

/*==================================================
                CACHE DOM
==================================================*/

Reader.cacheDOM = function(){

    Reader.dom.reader =
    Reader.$("reader");

    Reader.dom.preloader =
    Reader.$("preloader");

    Reader.dom.loadingScreen =
    Reader.$("loadingScreen");

    Reader.dom.errorScreen =
    Reader.$("errorScreen");

    Reader.dom.readerBody =
    Reader.$("readerBody");

    Reader.dom.bookViewport =
    Reader.$("bookViewport");

    Reader.dom.canvasWrapper =
    Reader.$("canvasWrapper");

    Reader.leftCanvas =
    Reader.$("leftCanvas");

    Reader.rightCanvas =
    Reader.$("rightCanvas");

    Reader.leftContext =
    Reader.leftCanvas.getContext(
        "2d",
        {
            alpha:false
        }
    );

    Reader.rightContext =
    Reader.rightCanvas.getContext(
        "2d",
        {
            alpha:false
        }
    );

    Reader.dom.pageCounter =
    Reader.$("pageCounter");

    Reader.dom.zoomIndicator =
    Reader.$("zoomIndicator");

    Reader.dom.loadingBar =
    Reader.$("loadingBar");

    Reader.dom.loadingStatus =
    Reader.$("loadingStatus");

    Reader.dom.bookTitle =
    Reader.$("bookTitle");

    Reader.dom.bookAuthor =
    Reader.$("bookAuthor");

};

/*==================================================
                DEVICE
==================================================*/

Reader.detectDevice = function(){

    Reader.mobileMode =
    window.innerWidth <= 991;

    if(Reader.mobileMode){

        Reader.singleMode = true;

        Reader.doubleMode = false;

    }

    else{

        Reader.singleMode = false;

        Reader.doubleMode = true;

    }

};

/*==================================================
                START
==================================================*/

Reader.start = function(){

    Reader.cacheDOM();

    Reader.detectDevice();

};

/*==================================================
            JAVASCRIPT PART 1 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 2
            PDF LOADER + RENDER ENGINE
==================================================*/

/*==================================================
                BOOK URL
==================================================*/

Reader.setBook=function(url){

Reader.bookUrl=url;

};

/*==================================================
                SHOW LOADING
==================================================*/

Reader.showLoading=function(text){

Reader.dom.loadingScreen.style.display="flex";

Reader.dom.loadingStatus.textContent=

text||"Loading Book...";

Reader.dom.loadingBar.style.width="0%";

};

/*==================================================
                HIDE LOADING
==================================================*/

Reader.hideLoading=function(){

Reader.dom.loadingScreen.style.display="none";

};

/*==================================================
                SHOW ERROR
==================================================*/

Reader.showError=function(message){

Reader.hideLoading();

Reader.dom.errorScreen.style.display="flex";

Reader.$("errorMessage").textContent=

message;

};

/*==================================================
                UPDATE PROGRESS
==================================================*/

Reader.updateProgress=function(percent){

Reader.dom.loadingBar.style.width=

percent+"%";

};

/*==================================================
                LOAD PDF
==================================================*/

Reader.loadPDF=async function(){

try{

Reader.showLoading(

"Loading PDF..."

);

const loadingTask=

pdfjsLib.getDocument({

url:Reader.bookUrl,

enableXfa:false,

useSystemFonts:true,

isEvalSupported:true,

cMapPacked:true

});

loadingTask.onProgress=function(progress){

if(progress.total){

const percent=

Math.round(

(progress.loaded/

progress.total)*100

);

Reader.updateProgress(percent);

}

};

Reader.pdf=

await loadingTask.promise;

Reader.totalPages=

Reader.pdf.numPages;

Reader.currentPage=1;

Reader.dom.pageCounter.textContent=

Reader.currentPage+

" / "+

Reader.totalPages;

Reader.updateProgress(100);

setTimeout(function(){

Reader.hideLoading();

},300);

}

catch(error){

console.error(error);

Reader.showError(

"Unable To Load PDF"

);

}

};

/*==================================================
                GET PAGE
==================================================*/

Reader.getPage=async function(pageNumber){

if(

Reader.pageCache.has(pageNumber)

){

return Reader.pageCache.get(pageNumber);

}

const page=

await Reader.pdf.getPage(

pageNumber

);

Reader.pageCache.set(

pageNumber,

page

);

return page;

};

/*==================================================
                RENDER CANVAS
==================================================*/

Reader.renderCanvas=

async function(

pageNumber,

canvas,

context

){

const page=

await Reader.getPage(

pageNumber

);

const viewport=

page.getViewport({

scale:Reader.zoom

});

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

};

/*==================================================
                UPDATE PAGE COUNTER
==================================================*/

Reader.updatePageCounter=

function(){

Reader.dom.pageCounter.textContent=

Reader.currentPage+

" / "+

Reader.totalPages;

};

/*==================================================
                RENDER CURRENT PAGE
==================================================*/

Reader.renderCurrentPages=

async function(){

if(

Reader.rendering

){

return;

}

Reader.rendering=true;

try{

await Reader.renderCanvas(

Reader.currentPage,

Reader.leftCanvas,

Reader.leftContext

);

if(

Reader.doubleMode &&

Reader.currentPage<

Reader.totalPages

){

await Reader.renderCanvas(

Reader.currentPage+1,

Reader.rightCanvas,

Reader.rightContext

);

}

else{

Reader.rightContext.clearRect(

0,

0,

Reader.rightCanvas.width,

Reader.rightCanvas.height

);

}

Reader.updatePageCounter();

}

catch(error){

console.error(error);

}

Reader.rendering=false;

};

/*==================================================
            JAVASCRIPT PART 2 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 3
            NAVIGATION + PAGE FLIP
==================================================*/

/*==================================================
                NEXT PAGE
==================================================*/

Reader.nextPage=async function(){

if(Reader.rendering){

return;

}

const step=

Reader.doubleMode

?

2

:

1;

if(

Reader.currentPage+step>

Reader.totalPages

){

return;

}

if(

Reader.animationEnabled

){

await Reader.playFlip(

"next"

);

}

Reader.currentPage+=step;

await Reader.renderCurrentPages();

Reader.saveReadingProgress();

};

/*==================================================
                PREVIOUS PAGE
==================================================*/

Reader.previousPage=async function(){

if(Reader.rendering){

return;

}

const step=

Reader.doubleMode

?

2

:

1;

if(

Reader.currentPage-step<1

){

return;

}

if(

Reader.animationEnabled

){

await Reader.playFlip(

"previous"

);

}

Reader.currentPage-=step;

await Reader.renderCurrentPages();

Reader.saveReadingProgress();

};

/*==================================================
                FIRST PAGE
==================================================*/

Reader.firstPage=

async function(){

Reader.currentPage=1;

await Reader.renderCurrentPages();

Reader.saveReadingProgress();

};

/*==================================================
                LAST PAGE
==================================================*/

Reader.lastPage=

async function(){

if(

Reader.doubleMode

){

Reader.currentPage=

Reader.totalPages%2===0

?

Reader.totalPages-1

:

Reader.totalPages;

}

else{

Reader.currentPage=

Reader.totalPages;

}

await Reader.renderCurrentPages();

Reader.saveReadingProgress();

};

/*==================================================
                PAGE FLIP
==================================================*/

Reader.playFlip=

function(direction){

return new Promise(

function(resolve){

const wrapper=

Reader.dom.canvasWrapper;

wrapper.classList.remove(

"page-flip-next",

"page-flip-prev"

);

void wrapper.offsetWidth;

wrapper.classList.add(

direction==="next"

?

"page-flip-next"

:

"page-flip-prev"

);

setTimeout(function(){

wrapper.classList.remove(

"page-flip-next",

"page-flip-prev"

);

resolve();

},450);

}

);

};

/*==================================================
                KEYBOARD
==================================================*/

document.addEventListener(

"keydown",

async function(event){

if(event.target.tagName==="INPUT"){

return;

}

switch(event.key){

case "ArrowRight":

event.preventDefault();

await Reader.nextPage();

break;

case "ArrowLeft":

event.preventDefault();

await Reader.previousPage();

break;

case "Home":

event.preventDefault();

await Reader.firstPage();

break;

case "End":

event.preventDefault();

await Reader.lastPage();

break;

}

});

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.bindNavigation=function(){

Reader.$("nextBtn")

.addEventListener(

"click",

Reader.nextPage

);

Reader.$("previousBtn")

.addEventListener(

"click",

Reader.previousPage

);

Reader.$("firstPageBtn")

.addEventListener(

"click",

Reader.firstPage

);

Reader.$("lastPageBtn")

.addEventListener(

"click",

Reader.lastPage

);

Reader.$("mobileNextBtn")

.addEventListener(

"click",

Reader.nextPage

);

Reader.$("mobilePrevBtn")

.addEventListener(

"click",

Reader.previousPage

);

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

function(){

Reader.bindNavigation();

});

/*==================================================
            JAVASCRIPT PART 3 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 4
            ZOOM + FIT PAGE + FIT WIDTH
==================================================*/

/*==================================================
                UPDATE ZOOM UI
==================================================*/

Reader.updateZoomIndicator=function(){

Reader.dom.zoomIndicator.textContent=

Math.round(

Reader.zoom*100

)+"%";

};

/*==================================================
                APPLY ZOOM
==================================================*/

Reader.applyZoom=

async function(){

await Reader.renderCurrentPages();

Reader.updateZoomIndicator();

};

/*==================================================
                ZOOM IN
==================================================*/

Reader.zoomIn=

async function(){

if(

Reader.zoom>=

Reader.maxZoom

){

return;

}

Reader.zoom+=

Reader.zoomStep;

if(

Reader.zoom>

Reader.maxZoom

){

Reader.zoom=

Reader.maxZoom;

}

await Reader.applyZoom();

};

/*==================================================
                ZOOM OUT
==================================================*/

Reader.zoomOut=

async function(){

if(

Reader.zoom<=

Reader.minZoom

){

return;

}

Reader.zoom-=

Reader.zoomStep;

if(

Reader.zoom<

Reader.minZoom

){

Reader.zoom=

Reader.minZoom;

}

await Reader.applyZoom();

};

/*==================================================
                RESET ZOOM
==================================================*/

Reader.resetZoom=

async function(){

Reader.zoom=1;

await Reader.applyZoom();

};

/*==================================================
                FIT WIDTH
==================================================*/

Reader.fitWidth=

async function(){

const container=

Reader.dom.bookViewport.clientWidth;

const canvas=

Reader.leftCanvas.width||800;

Reader.zoom=

(container*0.92)/canvas;

if(

Reader.zoom>

Reader.maxZoom

){

Reader.zoom=

Reader.maxZoom;

}

await Reader.applyZoom();

};

/*==================================================
                FIT PAGE
==================================================*/

Reader.fitPage=

async function(){

const width=

Reader.dom.bookViewport.clientWidth;

const height=

Reader.dom.bookViewport.clientHeight;

const pageWidth=

Reader.leftCanvas.width||800;

const pageHeight=

Reader.leftCanvas.height||1100;

const scaleX=

(width*0.88)/pageWidth;

const scaleY=

(height*0.90)/pageHeight;

Reader.zoom=

Math.min(

scaleX,

scaleY

);

if(

Reader.zoom>

Reader.maxZoom

){

Reader.zoom=

Reader.maxZoom;

}

if(

Reader.zoom<

Reader.minZoom

){

Reader.zoom=

Reader.minZoom;

}

await Reader.applyZoom();

};

/*==================================================
                MOUSE WHEEL ZOOM
==================================================*/

Reader.dom.bookViewport.addEventListener(

"wheel",

async function(event){

if(

!event.ctrlKey

){

return;

}

event.preventDefault();

if(

event.deltaY<0

){

await Reader.zoomIn();

}

else{

await Reader.zoomOut();

}

},

{

passive:false

}

);

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.bindZoom=function(){

Reader.$("zoomInBtn")

.addEventListener(

"click",

Reader.zoomIn

);

Reader.$("zoomOutBtn")

.addEventListener(

"click",

Reader.zoomOut

);

Reader.$("fitPageBtn")

.addEventListener(

"click",

Reader.fitPage

);

Reader.$("fitWidthBtn")

.addEventListener(

"click",

Reader.fitWidth

);

Reader.$("resetZoomBtn")

.addEventListener(

"click",

Reader.resetZoom

);

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

function(){

Reader.bindZoom();

Reader.updateZoomIndicator();

});

/*==================================================
            JAVASCRIPT PART 4 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 5
            SEARCH ENGINE (FULL BOOK)
==================================================*/

/*==================================================
                VARIABLES
==================================================*/

Reader.searchText=[];

Reader.searchResults=[];

Reader.searchIndex=0;

/*==================================================
                BUILD SEARCH INDEX
==================================================*/

Reader.buildSearchIndex=async function(){

Reader.showLoading(

"Building Search Index..."

);

Reader.searchText=[];

for(

let pageNumber=1;

pageNumber<=Reader.totalPages;

pageNumber++

){

const page=

await Reader.pdf.getPage(

pageNumber

);

const text=

await page.getTextContent();

const content=

text.items

.map(

item=>item.str

)

.join(" ")

.toLowerCase();

Reader.searchText.push({

page:pageNumber,

text:content

});

Reader.updateProgress(

Math.round(

(pageNumber/

Reader.totalPages)

*100

)

);

}

Reader.hideLoading();

};

/*==================================================
                SEARCH
==================================================*/

Reader.searchBook=function(){

const keyword=

Reader.$(

"searchInput"

)

.value

.trim()

.toLowerCase();

Reader.searchResults=[];

Reader.searchIndex=0;

const container=

Reader.$(

"searchResults"

);

container.innerHTML="";

if(keyword===""){

return;

}

Reader.searchText.forEach(

function(page){

if(

page.text.includes(

keyword

)

){

Reader.searchResults.push(

page.page

);

}

}

);

if(

Reader.searchResults.length===0

){

container.innerHTML=

"<div class='searchEmpty'>No Result Found</div>";

return;

}

Reader.searchResults.forEach(

function(page){

const button=

document.createElement(

"button"

);

button.className=

"searchResult";

button.textContent=

"Page "+page;

button.addEventListener(

"click",

async function(){

Reader.currentPage=

page;

await Reader.renderCurrentPages();

Reader.closePanels();

}

);

container.appendChild(

button

);

}

);

};

/*==================================================
                NEXT RESULT
==================================================*/

Reader.nextSearchResult=

async function(){

if(

Reader.searchResults.length===0

){

return;

}

Reader.searchIndex++;

if(

Reader.searchIndex>=

Reader.searchResults.length

){

Reader.searchIndex=0;

}

Reader.currentPage=

Reader.searchResults[

Reader.searchIndex

];

await Reader.renderCurrentPages();

};

/*==================================================
                PREVIOUS RESULT
==================================================*/

Reader.previousSearchResult=

async function(){

if(

Reader.searchResults.length===0

){

return;

}

Reader.searchIndex--;

if(

Reader.searchIndex<0

){

Reader.searchIndex=

Reader.searchResults.length-1;

}

Reader.currentPage=

Reader.searchResults[

Reader.searchIndex

];

await Reader.renderCurrentPages();

};

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.bindSearch=function(){

Reader.$(

"searchNowBtn"

)

.addEventListener(

"click",

Reader.searchBook

);

Reader.$(

"searchBookBtn"

)

.addEventListener(

"click",

Reader.searchBook

);

Reader.$(

"nextSearchBtn"

)

.addEventListener(

"click",

Reader.nextSearchResult

);

Reader.$(

"previousSearchBtn"

)

.addEventListener(

"click",

Reader.previousSearchResult

);

Reader.$(

"searchInput"

)

.addEventListener(

"keydown",

function(event){

if(

event.key==="Enter"

){

Reader.searchBook();

}

}

);

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

async function(){

Reader.bindSearch();

});

/*==================================================
            JAVASCRIPT PART 5 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 6
            BOOKMARKS + READING PROGRESS
==================================================*/

/*==================================================
                STORAGE KEYS
==================================================*/

Reader.bookmarkKey="chishti_reader_bookmarks";

Reader.progressKey="chishti_reader_progress";

/*==================================================
                LOAD BOOKMARKS
==================================================*/

Reader.loadBookmarks=function(){

const data=

localStorage.getItem(

Reader.bookmarkKey

);

if(!data){

Reader.bookmarks=[];

return;

}

try{

Reader.bookmarks=

JSON.parse(data);

}

catch(error){

Reader.bookmarks=[];

}

Reader.renderBookmarks();

};

/*==================================================
                SAVE BOOKMARKS
==================================================*/

Reader.saveBookmarks=function(){

localStorage.setItem(

Reader.bookmarkKey,

JSON.stringify(

Reader.bookmarks

)

);

};

/*==================================================
                ADD BOOKMARK
==================================================*/

Reader.addBookmark=function(){

const exists=

Reader.bookmarks.find(

item=>item.page===

Reader.currentPage

);

if(exists){

Reader.showToast(

"Bookmark Already Exists"

);

return;

}

Reader.bookmarks.push({

page:

Reader.currentPage,

title:

"Page "+

Reader.currentPage,

created:

Date.now()

});

Reader.bookmarks.sort(

(a,b)=>a.page-b.page

);

Reader.saveBookmarks();

Reader.renderBookmarks();

Reader.showToast(

"Bookmark Added"

);

};

/*==================================================
                REMOVE BOOKMARK
==================================================*/

Reader.removeBookmark=function(page){

Reader.bookmarks=

Reader.bookmarks.filter(

item=>

item.page!==page

);

Reader.saveBookmarks();

Reader.renderBookmarks();

};

/*==================================================
                RENDER BOOKMARKS
==================================================*/

Reader.renderBookmarks=function(){

const list=

Reader.$(

"bookmarkList"

);

if(!list){

return;

}

list.innerHTML="";

if(

Reader.bookmarks.length===0

){

list.innerHTML=

"<div class='bookmarkEmpty'>No Bookmarks</div>";

return;

}

Reader.bookmarks.forEach(

function(item){

const row=

document.createElement(

"div"

);

row.className=

"bookmarkItem";

const open=

document.createElement(

"button"

);

open.className=

"bookmarkOpen";

open.textContent=

"Page "+

item.page;

open.addEventListener(

"click",

async function(){

Reader.currentPage=

item.page;

await Reader.renderCurrentPages();

Reader.closePanels();

}

);

const remove=

document.createElement(

"button"

);

remove.className=

"bookmarkDelete";

remove.innerHTML="✕";

remove.addEventListener(

"click",

function(){

Reader.removeBookmark(

item.page

);

}

);

row.appendChild(

open

);

row.appendChild(

remove

);

list.appendChild(

row

);

}

);

};

/*==================================================
                SAVE PROGRESS
==================================================*/

Reader.saveReadingProgress=

function(){

localStorage.setItem(

Reader.progressKey,

Reader.currentPage

);

};

/*==================================================
                RESTORE PROGRESS
==================================================*/

Reader.restoreReadingProgress=

async function(){

const page=

parseInt(

localStorage.getItem(

Reader.progressKey

)

);

if(

isNaN(page)

){

return;

}

if(

page<1 ||

page>

Reader.totalPages

){

return;

}

Reader.currentPage=

page;

await Reader.renderCurrentPages();

};

/*==================================================
                CLEAR PROGRESS
==================================================*/

Reader.clearProgress=

function(){

localStorage.removeItem(

Reader.progressKey

);

};

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.bindBookmarks=

function(){

Reader.$(

"bookmarkBtn"

)

.addEventListener(

"click",

Reader.addBookmark

);

};

/*==================================================
                AUTO SAVE
==================================================*/

window.addEventListener(

"beforeunload",

function(){

Reader.saveReadingProgress();

Reader.saveBookmarks();

}

);

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

async function(){

Reader.bindBookmarks();

Reader.loadBookmarks();

await Reader.restoreReadingProgress();

});

/*==================================================
            JAVASCRIPT PART 6 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 7
            SETTINGS + PANELS + UI
==================================================*/

/*==================================================
                UI STATE
==================================================*/

Reader.activePanel=null;

Reader.animationEnabled=true;

Reader.theme="dark";

/*==================================================
                OPEN PANEL
==================================================*/

Reader.openPanel=function(panelId){

const panel=

typeof panelId==="string"

?

Reader.$(panelId)

:

panelId;

if(!panel){

return;

}

Reader.closePanels();

panel.classList.add("active");

Reader.$("readerOverlay")

.classList.add("active");

Reader.activePanel=panel;

};

/*==================================================
                CLOSE PANELS
==================================================*/

Reader.closePanels=function(){

document

.querySelectorAll(".sidePanel")

.forEach(function(panel){

panel.classList.remove("active");

});

Reader.$("readerOverlay")

.classList.remove("active");

Reader.activePanel=null;

};

/*==================================================
                TOAST
==================================================*/

Reader.showToast=function(message){

const toast=

Reader.$("readerToast");

const text=

Reader.$("toastMessage");

text.textContent=message;

toast.classList.add("show");

clearTimeout(

Reader.toastTimer

);

Reader.toastTimer=

setTimeout(function(){

toast.classList.remove("show");

},2500);

};

/*==================================================
                THEME
==================================================*/

Reader.toggleTheme=function(){

document.body.classList.toggle(

"lightTheme"

);

Reader.theme=

document.body.classList.contains(

"lightTheme"

)

?

"light"

:

"dark";

localStorage.setItem(

"readerTheme",

Reader.theme

);

};

Reader.restoreTheme=function(){

const theme=

localStorage.getItem(

"readerTheme"

);

if(theme==="light"){

document.body.classList.add(

"lightTheme"

);

Reader.theme="light";

}

};

/*==================================================
                PAGE ANIMATION
==================================================*/

Reader.toggleAnimation=function(){

Reader.animationEnabled=

Reader.$(

"pageAnimation"

).checked;

};

/*==================================================
                WATERMARK
==================================================*/

Reader.toggleWatermark=function(){

Reader.$(

"watermark"

).style.display=

Reader.$(

"watermarkSwitch"

).checked

?

"block"

:

"none";

};

/*==================================================
                PAGE SHADOW
==================================================*/

Reader.toggleShadow=function(){

Reader.$(

"pageShadow"

).style.display=

Reader.$(

"pageShadowSwitch"

).checked

?

"block"

:

"none";

};

/*==================================================
                SETTINGS
==================================================*/

Reader.applyReadingMode=

async function(){

const mode=

Reader.$(

"readingMode"

).value;

if(mode==="single"){

Reader.singleMode=true;

Reader.doubleMode=false;

}

else if(mode==="double"){

Reader.singleMode=false;

Reader.doubleMode=true;

}

else{

Reader.detectDevice();

}

await Reader.renderCurrentPages();

};

/*==================================================
                EVENTS
==================================================*/

Reader.bindPanels=function(){

Reader.$("searchBtn")

.addEventListener(

"click",

()=>Reader.openPanel(

"searchPanel"

)

);

Reader.$("settingBtn")

.addEventListener(

"click",

()=>Reader.openPanel(

"settingsPanel"

)

);

Reader.$("readerOverlay")

.addEventListener(

"click",

Reader.closePanels

);

Reader.$("closeSearchPanelBtn")

.addEventListener(

"click",

Reader.closePanels

);

Reader.$("closeBookmarkBtn")

.addEventListener(

"click",

Reader.closePanels

);

Reader.$("closeSettingsBtn")

.addEventListener(

"click",

Reader.closePanels

);

Reader.$("themeBtn")

.addEventListener(

"click",

Reader.toggleTheme

);

Reader.$("pageAnimation")

.addEventListener(

"change",

Reader.toggleAnimation

);

Reader.$("watermarkSwitch")

.addEventListener(

"change",

Reader.toggleWatermark

);

Reader.$("pageShadowSwitch")

.addEventListener(

"change",

Reader.toggleShadow

);

Reader.$("readingMode")

.addEventListener(

"change",

Reader.applyReadingMode

);

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

function(){

Reader.bindPanels();

Reader.restoreTheme();

Reader.toggleAnimation();

Reader.toggleWatermark();

Reader.toggleShadow();

});

/*==================================================
            JAVASCRIPT PART 7 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 8
            MOBILE + FULLSCREEN + SHORTCUTS
==================================================*/

/*==================================================
                FULLSCREEN
==================================================*/

Reader.toggleFullscreen=async function(){

try{

if(!document.fullscreenElement){

await Reader.$("reader").requestFullscreen();

Reader.showToast(

"Fullscreen Enabled"

);

}

else{

await document.exitFullscreen();

Reader.showToast(

"Fullscreen Disabled"

);

}

}

catch(error){

console.error(error);

}

};

/*==================================================
                MOBILE MODE
==================================================*/

Reader.updateMobileLayout=

async function(){

const mobile=

window.innerWidth<=991;

if(mobile!==Reader.mobileMode){

Reader.mobileMode=mobile;

if(mobile){

Reader.singleMode=true;

Reader.doubleMode=false;

}

else{

const mode=

Reader.$("readingMode").value;

if(mode==="double"){

Reader.singleMode=false;

Reader.doubleMode=true;

}

else if(mode==="single"){

Reader.singleMode=true;

Reader.doubleMode=false;

}

else{

Reader.detectDevice();

}

}

await Reader.renderCurrentPages();

}

};

/*==================================================
                TOUCH SWIPE
==================================================*/

Reader.touchStartX=0;

Reader.touchEndX=0;

Reader.$("bookViewport")

.addEventListener(

"touchstart",

function(event){

Reader.touchStartX=

event.changedTouches[0].clientX;

},

{

passive:true

}

);

Reader.$("bookViewport")

.addEventListener(

"touchend",

async function(event){

Reader.touchEndX=

event.changedTouches[0].clientX;

const distance=

Reader.touchEndX-

Reader.touchStartX;

if(distance>80){

await Reader.previousPage();

}

else if(distance<-80){

await Reader.nextPage();

}

},

{

passive:true

}

);

/*==================================================
                KEYBOARD SHORTCUTS
==================================================*/

document.addEventListener(

"keydown",

async function(event){

if(

event.target.tagName==="INPUT"

){

return;

}

if(event.ctrlKey){

switch(event.key.toLowerCase()){

case "=":

event.preventDefault();

await Reader.zoomIn();

break;

case "-":

event.preventDefault();

await Reader.zoomOut();

break;

case "0":

event.preventDefault();

await Reader.resetZoom();

break;

case "f":

event.preventDefault();

Reader.openPanel(

"searchPanel"

);

Reader.$("searchInput").focus();

break;

case "b":

event.preventDefault();

Reader.addBookmark();

break;

}

}

switch(event.key){

case "Escape":

Reader.closePanels();

break;

case "F11":

event.preventDefault();

await Reader.toggleFullscreen();

break;

}

});

/*==================================================
                WINDOW EVENTS
==================================================*/

window.addEventListener(

"resize",

Reader.updateMobileLayout

);

document.addEventListener(

"fullscreenchange",

function(){

Reader.showToast(

document.fullscreenElement

?

"Fullscreen"

:

"Window Mode"

);

}

/*==================================================
                BUTTON EVENTS
==================================================*/

);

Reader.$("fullScreenBtn")

.addEventListener(

"click",

Reader.toggleFullscreen

);

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

async function(){

await Reader.updateMobileLayout();

});

/*==================================================
            JAVASCRIPT PART 8 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 9
            THUMBNAILS + TABLE OF CONTENTS
==================================================*/

/*==================================================
                THUMBNAILS
==================================================*/

Reader.thumbnailCache=[];

/*==================================================
                CREATE THUMBNAILS
==================================================*/

Reader.createThumbnails=async function(){

const container=

Reader.$("thumbnailContainer");

if(!container){

return;

}

container.innerHTML="";

for(

let pageNumber=1;

pageNumber<=Reader.totalPages;

pageNumber++

){

const page=

await Reader.pdf.getPage(

pageNumber

);

const viewport=

page.getViewport({

scale:.20

});

const canvas=

document.createElement(

"canvas"

);

canvas.width=

viewport.width;

canvas.height=

viewport.height;

const context=

canvas.getContext(

"2d",

{

alpha:false

}

);

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

const item=

document.createElement(

"div"

);

item.className=

"thumbnailItem";

item.dataset.page=

pageNumber;

item.appendChild(

canvas

);

item.addEventListener(

"click",

async function(){

Reader.currentPage=

parseInt(

this.dataset.page

);

await Reader.renderCurrentPages();

Reader.highlightThumbnail();

Reader.closePanels();

}

);

container.appendChild(

item

);

}

Reader.highlightThumbnail();

};

/*==================================================
                ACTIVE THUMBNAIL
==================================================*/

Reader.highlightThumbnail=

function(){

document

.querySelectorAll(

".thumbnailItem"

)

.forEach(function(item){

item.style.borderColor=

parseInt(

item.dataset.page

)===Reader.currentPage

?

"var(--primary)"

:

"transparent";

});

};

/*==================================================
                TABLE OF CONTENTS
==================================================*/

Reader.buildTOC=

async function(){

const list=

Reader.$(

"tocList"

);

if(!list){

return;

}

list.innerHTML="";

const outline=

await Reader.pdf.getOutline();

if(

!outline ||

outline.length===0

){

list.innerHTML=

"<div class='searchEmpty'>No Table Of Contents</div>";

return;

}

for(

const chapter

of outline

){

const item=

document.createElement(

"div"

);

item.className=

"tocItem";

item.textContent=

chapter.title;

item.addEventListener(

"click",

async function(){

if(

chapter.dest

){

const destination=

await Reader.pdf.getDestination(

chapter.dest

);

const reference=

destination[0];

const page=

await Reader.pdf.getPageIndex(

reference

);

Reader.currentPage=

page+1;

await Reader.renderCurrentPages();

Reader.highlightThumbnail();

Reader.closePanels();

}

}

);

list.appendChild(

item

);

}

};

/*==================================================
                SIDEBAR
==================================================*/

Reader.openThumbnailSidebar=

function(){

Reader.$(

"thumbnailSidebar"

)

.classList.add(

"active"

);

Reader.$(

"readerOverlay"

)

.classList.add(

"active"

);

};

Reader.closeThumbnailSidebar=

function(){

Reader.$(

"thumbnailSidebar"

)

.classList.remove(

"active"

);

};

/*==================================================
                EVENTS
==================================================*/

Reader.bindSidebar=

function(){

Reader.$(

"closeThumbnailBtn"

)

.addEventListener(

"click",

Reader.closeThumbnailSidebar

);

Reader.$(

"closeTocBtn"

)

.addEventListener(

"click",

Reader.closePanels

);

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

async function(){

Reader.bindSidebar();

});

/*==================================================
            JAVASCRIPT PART 9 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
            JAVASCRIPT PART 10
            APPLICATION STARTUP + FINAL EVENTS
==================================================*/

/*==================================================
                START READER
==================================================*/

Reader.startReader=async function(bookUrl){

try{

Reader.setBook(bookUrl);

Reader.start();

await Reader.loadPDF();

await Reader.renderCurrentPages();

await Reader.buildSearchIndex();

await Reader.createThumbnails();

await Reader.buildTOC();

Reader.restoreReadingProgress();

Reader.hideLoading();

Reader.showToast(

"Book Loaded Successfully"

);

}

catch(error){

console.error(error);

Reader.showError(

error.message

);

}

};

/*==================================================
                UPDATE MOBILE COUNTER
==================================================*/

Reader.updateMobileCounter=function(){

const current=

Reader.$(

"mobileCurrentPage"

);

const total=

Reader.$(

"mobileTotalPages"

);

if(current){

current.textContent=

Reader.currentPage;

}

if(total){

total.textContent=

Reader.totalPages;

}

};

/*==================================================
                UPDATE UI
==================================================*/

Reader.refreshUI=function(){

Reader.updatePageCounter();

Reader.updateZoomIndicator();

Reader.updateMobileCounter();

Reader.highlightThumbnail();

};

/*==================================================
                AFTER PAGE CHANGE
==================================================*/

Reader.afterPageChange=

async function(){

Reader.refreshUI();

Reader.saveReadingProgress();

};

/*==================================================
                RELOAD
==================================================*/

Reader.reloadBook=

async function(){

Reader.pageCache.clear();

Reader.searchText=[];

Reader.searchResults=[];

await Reader.loadPDF();

await Reader.renderCurrentPages();

await Reader.buildSearchIndex();

await Reader.createThumbnails();

await Reader.buildTOC();

};

/*==================================================
                CLOSE ERROR
==================================================*/

Reader.$(

"reloadBookBtn"

)

.addEventListener(

"click",

Reader.reloadBook

);

Reader.$(

"goHomeBtn"

)

.addEventListener(

"click",

function(){

window.location.href="/";

}

);

/*==================================================
                AUTO UPDATE
==================================================*/

const oldNext=

Reader.nextPage;

Reader.nextPage=

async function(){

await oldNext();

await Reader.afterPageChange();

};

const oldPrevious=

Reader.previousPage;

Reader.previousPage=

async function(){

await oldPrevious();

await Reader.afterPageChange();

};

const oldFirst=

Reader.firstPage;

Reader.firstPage=

async function(){

await oldFirst();

await Reader.afterPageChange();

};

const oldLast=

Reader.lastPage;

Reader.lastPage=

async function(){

await oldLast();

await Reader.afterPageChange();

};

/*==================================================
                INITIALIZE
==================================================*/

window.addEventListener(

"DOMContentLoaded",

async function(){

try{

const pdfUrl=

document.body.dataset.pdf ||

new URLSearchParams(

window.location.search

).get(

"book"

);

if(!pdfUrl){

Reader.showError(

"No PDF Selected"

);

return;

}

await Reader.startReader(

pdfUrl

);

Reader.initialized=true;

}

catch(error){

console.error(error);

Reader.showError(

"Reader Initialization Failed"

);

}

});

/*==================================================
                FINAL CHECK
==================================================*/

window.addEventListener(

"error",

function(event){

console.error(

event.error

);

Reader.showToast(

"Unexpected Error"

);

});

window.addEventListener(

"unhandledrejection",

function(event){

console.error(

event.reason

);

Reader.showToast(

"Promise Rejected"

);

});

/*==================================================
                END OF JAVASCRIPT
==================================================*/
