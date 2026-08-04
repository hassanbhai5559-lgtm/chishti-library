/*==================================================
                JAVASCRIPT PART 1
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

const Reader={};

/*==================================================
                READER STATE
==================================================*/

Reader.pdf=null;

Reader.currentPage=1;

Reader.totalPages=0;

Reader.scale=1.4;

Reader.rotation=0;

Reader.isLoading=false;

Reader.isRendering=false;

Reader.isSearching=false;

Reader.isMobile=false;

Reader.isSingleMode=false;

Reader.isDoubleMode=true;

Reader.pageCache=new Map();

Reader.bookmarks=[];

Reader.searchIndex=[];

/*==================================================
                URL
==================================================*/

Reader.url=new URL(window.location.href);

Reader.bookPath=
Reader.url.searchParams.get("book")||"";

/*==================================================
                DOM
==================================================*/

Reader.dom={

preloader:
document.getElementById("preloader"),

openingAnimation:
document.getElementById("openingAnimation"),

reader:
document.getElementById("reader"),

readerHeader:
document.getElementById("readerHeader"),

toolbarTop:
document.getElementById("toolbarTop"),

toolbarBottom:
document.getElementById("toolbarBottom"),

readerBody:
document.getElementById("readerBody"),

bookViewport:
document.getElementById("bookViewport"),

canvasWrapper:
document.getElementById("canvasWrapper"),

leftCanvas:
document.getElementById("leftCanvas"),

rightCanvas:
document.getElementById("rightCanvas"),

pageShadow:
document.getElementById("pageShadow"),

pageCurve:
document.getElementById("pageCurve"),

watermark:
document.getElementById("watermark"),

bookTitle:
document.getElementById("bookTitle"),

bookAuthor:
document.getElementById("bookAuthor"),

pageCounter:
document.getElementById("pageCounter"),

floatingPageNumber:
document.getElementById("floatingPageNumber"),

zoomIndicator:
document.getElementById("zoomIndicator"),

readerOverlay:
document.getElementById("readerOverlay"),

loadingScreen:
document.getElementById("loadingScreen"),

loadingStatus:
document.getElementById("loadingStatus"),

loadingBar:
document.getElementById("loadingBar"),

errorScreen:
document.getElementById("errorScreen"),

errorMessage:
document.getElementById("errorMessage"),

readerToast:
document.getElementById("readerToast"),

toastMessage:
document.getElementById("toastMessage"),

searchPanel:
document.getElementById("searchPanel"),

settingsPanel:
document.getElementById("settingsPanel"),

bookmarkPanel:
document.getElementById("bookmarkPanel"),

thumbnailSidebar:
document.getElementById("thumbnailSidebar"),

tocPanel:
document.getElementById("tocPanel")

};

/*==================================================
                BUTTONS
==================================================*/

Reader.btn={

bookmark:
document.getElementById("bookmarkBtn"),

theme:
document.getElementById("themeBtn"),

settings:
document.getElementById("settingBtn"),

close:
document.getElementById("closeBtn"),

first:
document.getElementById("firstPageBtn"),

previous:
document.getElementById("previousBtn"),

next:
document.getElementById("nextBtn"),

last:
document.getElementById("lastPageBtn"),

zoomIn:
document.getElementById("zoomInBtn"),

zoomOut:
document.getElementById("zoomOutBtn"),

fullscreen:
document.getElementById("fullScreenBtn"),

search:
document.getElementById("searchBtn"),

single:
document.getElementById("singleModeBtn"),

double:
document.getElementById("doubleModeBtn"),

auto:
document.getElementById("autoModeBtn"),

mobilePrevious:
document.getElementById("mobilePrevBtn"),

mobileNext:
document.getElementById("mobileNextBtn")

};

/*==================================================
                INPUTS
==================================================*/

Reader.input={

search:
document.getElementById("searchInput"),

searchKeyword:
document.getElementById("searchKeyword"),

readingMode:
document.getElementById("readingMode"),

theme:
document.getElementById("themeSelect"),

pageAnimation:
document.getElementById("pageAnimation"),

pageShadow:
document.getElementById("pageShadowSwitch"),

watermark:
document.getElementById("watermarkSwitch")

};

/*==================================================
                CANVAS
==================================================*/

Reader.ctxLeft=
Reader.dom.leftCanvas.getContext("2d");

Reader.ctxRight=
Reader.dom.rightCanvas.getContext("2d");

/*==================================================
                HELPERS
==================================================*/

Reader.isPhone=function(){

return window.innerWidth<=991;

};

Reader.updatePageCounter=function(){

Reader.dom.pageCounter.textContent=

Reader.currentPage+

" / "+

Reader.totalPages;

};

Reader.showToast=function(message){

Reader.dom.toastMessage.textContent=
message;

Reader.dom.readerToast.classList.add("show");

clearTimeout(Reader.toastTimer);

Reader.toastTimer=setTimeout(function(){

Reader.dom.readerToast.classList.remove("show");

},2000);

};

/*==================================================
                JAVASCRIPT PART 1 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 2
==================================================*/

/*==================================================
                LOADING
==================================================*/

Reader.showLoading=function(text="Loading Book..."){

Reader.isLoading=true;

Reader.dom.loadingStatus.textContent=text;

Reader.dom.loadingBar.style.width="0%";

Reader.dom.loadingScreen.style.display="flex";

};

Reader.hideLoading=function(){

Reader.isLoading=false;

Reader.dom.loadingBar.style.width="100%";

setTimeout(function(){

Reader.dom.loadingScreen.style.display="none";

},300);

};

/*==================================================
                ERROR
==================================================*/

Reader.showError=function(message){

Reader.dom.errorMessage.textContent=message;

Reader.dom.errorScreen.style.display="flex";

};

Reader.hideError=function(){

Reader.dom.errorScreen.style.display="none";

};

/*==================================================
                PAGE COUNTER
==================================================*/

Reader.updatePageCounter=function(){

Reader.dom.pageCounter.textContent=

Reader.currentPage+

" / "+

Reader.totalPages;

if(Reader.dom.floatingPageNumber){

Reader.dom.floatingPageNumber.textContent=

Reader.currentPage;

Reader.dom.floatingPageNumber.style.opacity="1";

clearTimeout(Reader.pageTimer);

Reader.pageTimer=setTimeout(function(){

Reader.dom.floatingPageNumber.style.opacity="0";

},1200);

}

};

/*==================================================
                DEVICE
==================================================*/

Reader.detectDevice=function(){

Reader.isMobile=

window.innerWidth<=991;

if(Reader.isMobile){

Reader.isSingleMode=true;

Reader.isDoubleMode=false;

}else{

if(!Reader.isSingleMode){

Reader.isDoubleMode=true;

}

}

};

window.addEventListener(

"resize",

Reader.detectDevice

);

/*==================================================
                CACHE
==================================================*/

Reader.clearCache=function(){

Reader.pageCache.clear();

};

/*==================================================
                PANEL
==================================================*/

Reader.openPanel=function(panel){

Reader.closePanels();

panel.classList.add("active");

Reader.dom.readerOverlay.classList.add("active");

};

Reader.closePanels=function(){

Reader.dom.searchPanel.classList.remove("active");

Reader.dom.settingsPanel.classList.remove("active");

Reader.dom.bookmarkPanel.classList.remove("active");

Reader.dom.thumbnailSidebar.classList.remove("active");

Reader.dom.tocPanel.classList.remove("active");

Reader.dom.readerOverlay.classList.remove("active");

};

/*==================================================
                BUTTON PANEL EVENTS
==================================================*/

Reader.btn.search.addEventListener(

"click",

function(){

Reader.openPanel(

Reader.dom.searchPanel

);

}

);

Reader.btn.settings.addEventListener(

"click",

function(){

Reader.openPanel(

Reader.dom.settingsPanel

);

}

);

Reader.btn.bookmark.addEventListener(

"dblclick",

function(){

Reader.openPanel(

Reader.dom.bookmarkPanel

);

}

);

Reader.dom.readerOverlay.addEventListener(

"click",

Reader.closePanels

);

document

.getElementById("closeSearchPanelBtn")

.addEventListener(

"click",

Reader.closePanels

);

document

.getElementById("closeSettingsBtn")

.addEventListener(

"click",

Reader.closePanels

);

document

.getElementById("closeBookmarkBtn")

.addEventListener(

"click",

Reader.closePanels

);

document

.getElementById("closeTocBtn")

.addEventListener(

"click",

Reader.closePanels

);

/*==================================================
                INITIALIZE
==================================================*/

Reader.detectDevice();

Reader.hideError();

/*==================================================
                JAVASCRIPT PART 2 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 3
==================================================*/

/*==================================================
                LOAD PDF
==================================================*/

Reader.loadPDF=async function(){

if(!Reader.bookPath){

Reader.showError("Book Not Found.");

return;

}

try{

Reader.showLoading("Opening Book...");

const loadingTask=

pdfjsLib.getDocument({

url:Reader.bookPath,

cMapPacked:true

});

Reader.pdf=

await loadingTask.promise;

Reader.totalPages=

Reader.pdf.numPages;

await Reader.loadMetadata();

Reader.updatePageCounter();

Reader.hideLoading();

Reader.showToast("Book Loaded");

}

catch(error){

console.error(error);

Reader.hideLoading();

Reader.showError(

"Unable To Open PDF."

);

}

};

/*==================================================
                PDF METADATA
==================================================*/

Reader.loadMetadata=async function(){

try{

const metadata=

await Reader.pdf.getMetadata();

Reader.dom.bookTitle.textContent=

metadata.info.Title||

"Untitled Book";

Reader.dom.bookAuthor.textContent=

metadata.info.Author||

"";

}

catch(error){

Reader.dom.bookTitle.textContent=

"Untitled Book";

Reader.dom.bookAuthor.textContent="";

}

};

/*==================================================
                GET PAGE
==================================================*/

Reader.getPage=async function(pageNumber){

if(

pageNumber<1 ||

pageNumber>Reader.totalPages

){

return null;

}

return await Reader.pdf.getPage(pageNumber);

};

/*==================================================
                VIEWPORT
==================================================*/

Reader.getViewport=function(page){

return page.getViewport({

scale:Reader.scale,

rotation:Reader.rotation

});

};

/*==================================================
                RESIZE CANVAS
==================================================*/

Reader.resizeCanvas=function(

canvas,

viewport

){

canvas.width=

viewport.width;

canvas.height=

viewport.height;

canvas.style.width=

viewport.width+"px";

canvas.style.height=

viewport.height+"px";

};

/*==================================================
                PRELOAD NEXT PAGE
==================================================*/

Reader.preloadPage=async function(pageNumber){

if(

pageNumber<1 ||

pageNumber>Reader.totalPages

){

return;

}

if(

Reader.pageCache.has(pageNumber)

){

return;

}

try{

const page=

await Reader.getPage(pageNumber);

const viewport=

Reader.getViewport(page);

const canvas=

document.createElement("canvas");

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:

canvas.getContext("2d"),

viewport

}).promise;

Reader.pageCache.set(

pageNumber,

canvas

);

}

catch(error){

console.warn(

"Preload Failed",

pageNumber

);

}

};

/*==================================================
                START PDF
==================================================*/

window.addEventListener(

"load",

function(){

Reader.loadPDF();

}

/*==================================================
                JAVASCRIPT PART 3 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 4
                PDF RENDER ENGINE
==================================================*/

/*==================================================
                RENDER CURRENT PAGE(S)
==================================================*/

Reader.renderCurrentPages=async function(){

if(!Reader.pdf) return;

if(Reader.isRendering) return;

Reader.isRendering=true;

try{

await Reader.renderPage(

Reader.currentPage,

Reader.dom.leftCanvas,

Reader.ctxLeft

);

if(

Reader.isDoubleMode &&
!Reader.isMobile &&
Reader.currentPage<Reader.totalPages

){

Reader.dom.rightCanvas.style.display="block";

await Reader.renderPage(

Reader.currentPage+1,

Reader.dom.rightCanvas,

Reader.ctxRight

);

}else{

Reader.dom.rightCanvas.style.display="none";

Reader.ctxRight.clearRect(

0,

0,

Reader.dom.rightCanvas.width,

Reader.dom.rightCanvas.height

);

}

Reader.updatePageCounter();

Reader.preloadPage(

Reader.currentPage+1

);

Reader.preloadPage(

Reader.currentPage+2

);

}

catch(error){

console.error(error);

Reader.showError(

"Page Rendering Failed."

);

}

finally{

Reader.isRendering=false;

}

};

/*==================================================
                RENDER SINGLE PAGE
==================================================*/

Reader.renderPage=async function(

pageNumber,

canvas,

context

){

if(

pageNumber<1 ||

pageNumber>Reader.totalPages

){

return;

}

if(

Reader.pageCache.has(pageNumber)

){

const cache=

Reader.pageCache.get(pageNumber);

canvas.width=

cache.width;

canvas.height=

cache.height;

context.clearRect(

0,

0,

canvas.width,

canvas.height

);

context.drawImage(

cache,

0,

0

);

return;

}

const page=

await Reader.getPage(pageNumber);

const viewport=

Reader.getViewport(page);

Reader.resizeCanvas(

canvas,

viewport

);

context.clearRect(

0,

0,

canvas.width,

canvas.height

);

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

const cache=

document.createElement("canvas");

cache.width=

canvas.width;

cache.height=

canvas.height;

cache

.getContext("2d")

.drawImage(

canvas,

0,

0

);

Reader.pageCache.set(

pageNumber,

cache

);

if(

Reader.pageCache.size>20

){

const firstKey=

Reader.pageCache

.keys()

.next()

.value;

Reader.pageCache.delete(firstKey);

}

};

/*==================================================
                WATERMARK
==================================================*/

Reader.updateWatermark=function(){

if(

Reader.dom.watermark

){

Reader.dom.watermark.textContent=

"CHISHTI LIBRARY";

}

};

/*==================================================
                PAGE SHADOW
==================================================*/

Reader.updateShadow=function(){

if(

Reader.input.pageShadow &&

Reader.input.pageShadow.checked

){

Reader.dom.pageShadow.style.display="block";

Reader.dom.pageCurve.style.display="block";

}else{

Reader.dom.pageShadow.style.display="none";

Reader.dom.pageCurve.style.display="none";

}

};

/*==================================================
                AFTER PDF LOAD
==================================================*/

Reader.afterLoad=async function(){

await Reader.renderCurrentPages();

Reader.updateWatermark();

Reader.updateShadow();

Reader.showToast(

"Ready To Read"

);

};

/*==================================================
                MODIFY LOAD PDF
==================================================*/

Reader.startReader=async function(){

await Reader.loadPDF();

if(

Reader.pdf

){

await Reader.afterLoad();

}

};

/*==================================================
                START
==================================================*/

window.addEventListener(

"load",

async function(){

await Reader.startReader();

});

/*==================================================
                JAVASCRIPT PART 4 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 5
                PAGE NAVIGATION
==================================================*/

/*==================================================
                NEXT PAGE
==================================================*/

Reader.nextPage=async function(){

if(!Reader.pdf) return;

if(Reader.isRendering) return;

const step=

(

Reader.isDoubleMode &&

!Reader.isMobile

)

?2:1;

if(

Reader.currentPage+step>

Reader.totalPages

){

Reader.showToast(

"Last Page"

);

return;

}

Reader.currentPage+=step;

await Reader.renderCurrentPages();

Reader.saveCurrentPage();

};

/*==================================================
                PREVIOUS PAGE
==================================================*/

Reader.previousPage=async function(){

if(!Reader.pdf) return;

if(Reader.isRendering) return;

const step=

(

Reader.isDoubleMode &&

!Reader.isMobile

)

?2:1;

if(

Reader.currentPage-step<1

){

Reader.showToast(

"First Page"

);

return;

}

Reader.currentPage-=step;

await Reader.renderCurrentPages();

Reader.saveCurrentPage();

};

/*==================================================
                FIRST PAGE
==================================================*/

Reader.firstPage=async function(){

if(!Reader.pdf) return;

Reader.currentPage=1;

await Reader.renderCurrentPages();

Reader.saveCurrentPage();

};

/*==================================================
                LAST PAGE
==================================================*/

Reader.lastPage=async function(){

if(!Reader.pdf) return;

if(

Reader.isDoubleMode &&

!Reader.isMobile

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

Reader.saveCurrentPage();

};

/*==================================================
                GO TO PAGE
==================================================*/

Reader.goToPage=async function(page){

page=parseInt(page);

if(

isNaN(page) ||

page<1 ||

page>Reader.totalPages

){

Reader.showToast(

"Invalid Page"

);

return;

}

Reader.currentPage=page;

await Reader.renderCurrentPages();

Reader.saveCurrentPage();

};

/*==================================================
                SAVE LAST PAGE
==================================================*/

Reader.saveCurrentPage=function(){

localStorage.setItem(

"reader-last-page-"+

Reader.bookPath,

Reader.currentPage

);

};

/*==================================================
                RESTORE LAST PAGE
==================================================*/

Reader.restoreLastPage=async function(){

const page=

parseInt(

localStorage.getItem(

"reader-last-page-"+

Reader.bookPath

)

);

if(

!isNaN(page) &&

page>=1 &&

page<=Reader.totalPages

){

Reader.currentPage=page;

}

};

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.btn.next.addEventListener(

"click",

Reader.nextPage

);

Reader.btn.previous.addEventListener(

"click",

Reader.previousPage

);

Reader.btn.first.addEventListener(

"click",

Reader.firstPage

);

Reader.btn.last.addEventListener(

"click",

Reader.lastPage

);

if(Reader.btn.mobileNext){

Reader.btn.mobileNext.addEventListener(

"click",

Reader.nextPage

);

}

if(Reader.btn.mobilePrevious){

Reader.btn.mobilePrevious.addEventListener(

"click",

Reader.previousPage

);

}

/*==================================================
                KEYBOARD
==================================================*/

document.addEventListener(

"keydown",

async function(e){

if(e.target.tagName==="INPUT") return;

switch(e.key){

case "ArrowRight":

case "PageDown":

e.preventDefault();

await Reader.nextPage();

break;

case "ArrowLeft":

case "PageUp":

e.preventDefault();

await Reader.previousPage();

break;

case "Home":

e.preventDefault();

await Reader.firstPage();

break;

case "End":

e.preventDefault();

await Reader.lastPage();

break;

}

});

/*==================================================
                MOUSE WHEEL
==================================================*/

Reader.dom.bookViewport.addEventListener(

"wheel",

async function(e){

if(e.ctrlKey) return;

if(Reader.isRendering) return;

if(e.deltaY>80){

await Reader.nextPage();

}

else if(e.deltaY<-80){

await Reader.previousPage();

}

},

{

passive:true

}

);

/*==================================================
                JAVASCRIPT PART 5 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 6
                ZOOM ENGINE
==================================================*/

/*==================================================
                ZOOM SETTINGS
==================================================*/

Reader.minZoom=0.50;

Reader.maxZoom=4.00;

Reader.zoomStep=0.20;

/*==================================================
                APPLY ZOOM
==================================================*/

Reader.applyZoom=async function(){

if(!Reader.pdf) return;

if(Reader.scale<Reader.minZoom){

Reader.scale=Reader.minZoom;

}

if(Reader.scale>Reader.maxZoom){

Reader.scale=Reader.maxZoom;

}

Reader.dom.zoomIndicator.textContent=

Math.round(

Reader.scale*100

)+"%";

Reader.dom.zoomIndicator.style.opacity="1";

clearTimeout(

Reader.zoomTimer

);

Reader.zoomTimer=setTimeout(function(){

Reader.dom.zoomIndicator.style.opacity="0";

},1200);

Reader.clearCache();

await Reader.renderCurrentPages();

};

/*==================================================
                ZOOM IN
==================================================*/

Reader.zoomIn=async function(){

if(Reader.isRendering) return;

Reader.scale+=Reader.zoomStep;

await Reader.applyZoom();

};

/*==================================================
                ZOOM OUT
==================================================*/

Reader.zoomOut=async function(){

if(Reader.isRendering) return;

Reader.scale-=Reader.zoomStep;

await Reader.applyZoom();

};

/*==================================================
                FIT PAGE
==================================================*/

Reader.fitPage=async function(){

const page=

await Reader.getPage(

Reader.currentPage

);

if(!page) return;

const viewport=

page.getViewport({

scale:1

});

const area=

Reader.dom.bookViewport;

const widthScale=

(area.clientWidth-80)/

viewport.width;

const heightScale=

(area.clientHeight-80)/

viewport.height;

Reader.scale=

Math.min(

widthScale,

heightScale

);

await Reader.applyZoom();

};

/*==================================================
                FIT WIDTH
==================================================*/

Reader.fitWidth=async function(){

const page=

await Reader.getPage(

Reader.currentPage

);

if(!page) return;

const viewport=

page.getViewport({

scale:1

});

Reader.scale=

(

Reader.dom.bookViewport.clientWidth-60

)/

viewport.width;

await Reader.applyZoom();

};

/*==================================================
                RESET ZOOM
==================================================*/

Reader.resetZoom=async function(){

Reader.scale=1.4;

await Reader.applyZoom();

};

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.btn.zoomIn.addEventListener(

"click",

Reader.zoomIn

);

Reader.btn.zoomOut.addEventListener(

"click",

Reader.zoomOut

);

document

.getElementById("fitPageBtn")

.addEventListener(

"click",

Reader.fitPage

);

document

.getElementById("fitWidthBtn")

.addEventListener(

"click",

Reader.fitWidth

);

document

.getElementById("resetZoomBtn")

.addEventListener(

"click",

Reader.resetZoom

);

/*==================================================
                CTRL + MOUSE WHEEL
==================================================*/

Reader.dom.bookViewport.addEventListener(

"wheel",

async function(e){

if(!e.ctrlKey) return;

e.preventDefault();

if(e.deltaY<0){

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
                KEYBOARD SHORTCUTS
==================================================*/

document.addEventListener(

"keydown",

async function(e){

if(e.target.tagName==="INPUT") return;

if(

e.ctrlKey &&

(e.key==="+" || e.key==="=")

){

e.preventDefault();

await Reader.zoomIn();

}

if(

e.ctrlKey &&

e.key==="-"

){

e.preventDefault();

await Reader.zoomOut();

}

if(

e.ctrlKey &&

e.key==="0"

){

e.preventDefault();

await Reader.resetZoom();

}

if(

e.key==="f" &&

!e.ctrlKey

){

await Reader.fitPage();

}

if(

e.key==="w" &&

!e.ctrlKey

){

await Reader.fitWidth();

}

});

/*==================================================
                JAVASCRIPT PART 6 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 7
                FULL BOOK SEARCH ENGINE
==================================================*/

/*==================================================
                SEARCH VARIABLES
==================================================*/

Reader.searchDatabase=[];

Reader.searchResults=[];

Reader.searchPointer=0;

Reader.searchBuilt=false;

/*==================================================
                BUILD SEARCH DATABASE
==================================================*/

Reader.buildSearchDatabase=async function(){

if(Reader.searchBuilt){

return;

}

Reader.showLoading(

"Creating Search Index..."

);

Reader.searchDatabase=[];

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

.map(item=>item.str)

.join(" ")

.toLowerCase();

Reader.searchDatabase.push({

page:pageNumber,

text:content

});

Reader.dom.loadingBar.style.width=

Math.floor(

(pageNumber/

Reader.totalPages)*100

)+"%";

}

Reader.searchBuilt=true;

Reader.hideLoading();

};

/*==================================================
                SEARCH BOOK
==================================================*/

Reader.searchBook=async function(){

const keyword=

Reader.input.searchKeyword.value

.trim()

.toLowerCase();

const resultBox=

document.getElementById(

"searchResults"

);

resultBox.innerHTML="";

Reader.searchResults=[];

Reader.searchPointer=0;

if(keyword===""){

Reader.showToast(

"Enter Search Word"

);

return;

}

if(!Reader.searchBuilt){

await Reader.buildSearchDatabase();

}

Reader.searchDatabase.forEach(page=>{

if(

page.text.includes(keyword)

){

Reader.searchResults.push(page.page);

}

});

if(

Reader.searchResults.length===0

){

resultBox.innerHTML=

"<div class='searchEmpty'>No Results Found</div>";

Reader.showToast(

"No Result"

);

return;

}

Reader.searchResults.forEach(page=>{

const item=

document.createElement("button");

item.className=

"searchResult";

item.textContent=

"Page "+page;

item.addEventListener(

"click",

async function(){

Reader.currentPage=page;

await Reader.renderCurrentPages();

Reader.closePanels();

}

);

resultBox.appendChild(item);

});

Reader.showToast(

Reader.searchResults.length+

" Result(s) Found"

);

};

/*==================================================
                NEXT SEARCH RESULT
==================================================*/

Reader.nextSearchResult=

async function(){

if(

Reader.searchResults.length===0

){

return;

}

Reader.searchPointer++;

if(

Reader.searchPointer>=

Reader.searchResults.length

){

Reader.searchPointer=0;

}

Reader.currentPage=

Reader.searchResults[

Reader.searchPointer

];

await Reader.renderCurrentPages();

};

/*==================================================
                PREVIOUS SEARCH RESULT
==================================================*/

Reader.previousSearchResult=

async function(){

if(

Reader.searchResults.length===0

){

return;

}

Reader.searchPointer--;

if(

Reader.searchPointer<0

){

Reader.searchPointer=

Reader.searchResults.length-1;

}

Reader.currentPage=

Reader.searchResults[

Reader.searchPointer

];

await Reader.renderCurrentPages();

};

/*==================================================
                EVENTS
==================================================*/

Reader.btn.search.addEventListener(

"click",

function(){

Reader.openPanel(

Reader.dom.searchPanel

);

Reader.input.searchKeyword.focus();

}

);

document

.getElementById("searchBookBtn")

.addEventListener(

"click",

Reader.searchBook

);

Reader.input.searchKeyword

.addEventListener(

"keydown",

function(e){

if(

e.key==="Enter"

){

Reader.searchBook();

}

}

);

document

.getElementById("nextSearchBtn")

.addEventListener(

"click",

Reader.nextSearchResult

);

document

.getElementById("previousSearchBtn")

.addEventListener(

"click",

Reader.previousSearchResult

);

/*==================================================
                CTRL + F
==================================================*/

document.addEventListener(

"keydown",

function(e){

if(

e.ctrlKey &&

e.key.toLowerCase()==="f"

){

e.preventDefault();

Reader.openPanel(

Reader.dom.searchPanel

);

Reader.input.searchKeyword.focus();

}

});

/*==================================================
                JAVASCRIPT PART 7 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 8
                BOOKMARKS & READING PROGRESS
==================================================*/

/*==================================================
                BOOKMARK VARIABLES
==================================================*/

Reader.bookmarks=[];

Reader.bookmarkKey=

"chishti-bookmarks";

Reader.lastPageKey=

"chishti-last-page";

/*==================================================
                STORAGE KEY
==================================================*/

Reader.getStorageKey=function(){

return Reader.bookmarkKey+

"-"+

btoa(

Reader.bookPath

);

};

Reader.getLastPageKey=function(){

return Reader.lastPageKey+

"-"+

btoa(

Reader.bookPath

);

};

/*==================================================
                LOAD BOOKMARKS
==================================================*/

Reader.loadBookmarks=function(){

const data=

localStorage.getItem(

Reader.getStorageKey()

);

if(data){

try{

Reader.bookmarks=

JSON.parse(data);

}

catch{

Reader.bookmarks=[];

}

}

Reader.renderBookmarks();

};

/*==================================================
                SAVE BOOKMARKS
==================================================*/

Reader.saveBookmarks=function(){

localStorage.setItem(

Reader.getStorageKey(),

JSON.stringify(

Reader.bookmarks

)

);

};

/*==================================================
                ADD BOOKMARK
==================================================*/

Reader.addBookmark=function(){

const page=

Reader.currentPage;

const exists=

Reader.bookmarks.find(

item=>item.page===page

);

if(exists){

Reader.showToast(

"Bookmark Already Exists"

);

return;

}

Reader.bookmarks.push({

page:page,

title:

Reader.dom.bookTitle.textContent,

date:

new Date()

.toLocaleString()

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

item=>item.page!==page

);

Reader.saveBookmarks();

Reader.renderBookmarks();

Reader.showToast(

"Bookmark Removed"

);

};

/*==================================================
                RENDER BOOKMARKS
==================================================*/

Reader.renderBookmarks=function(){

const list=

document.getElementById(

"bookmarkList"

);

if(!list) return;

list.innerHTML="";

if(

Reader.bookmarks.length===0

){

list.innerHTML=

"<div class='bookmarkEmpty'>No Bookmarks</div>";

return;

}

Reader.bookmarks.forEach(item=>{

const row=

document.createElement("div");

row.className=

"bookmarkItem";

const open=

document.createElement("button");

open.className=

"bookmarkOpen";

open.textContent=

"Page "+item.page;

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

document.createElement("button");

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

row.appendChild(open);

row.appendChild(remove);

list.appendChild(row);

});

};

/*==================================================
                SAVE LAST PAGE
==================================================*/

Reader.saveReadingProgress=function(){

localStorage.setItem(

Reader.getLastPageKey(),

Reader.currentPage

);

};

/*==================================================
                RESTORE LAST PAGE
==================================================*/

Reader.restoreReadingProgress=

function(){

const page=

parseInt(

localStorage.getItem(

Reader.getLastPageKey()

)

);

if(

!isNaN(page) &&

page>=1 &&

page<=Reader.totalPages

){

Reader.currentPage=page;

}

};

/*==================================================
                AUTO SAVE
==================================================*/

window.addEventListener(

"beforeunload",

function(){

Reader.saveReadingProgress();

}

);

document.addEventListener(

"visibilitychange",

function(){

if(document.hidden){

Reader.saveReadingProgress();

}

}

);

/*==================================================
                BUTTON EVENTS
==================================================*/

Reader.btn.bookmark.addEventListener(

"click",

Reader.addBookmark

);

/*==================================================
                STARTUP
==================================================*/

window.addEventListener(

"load",

function(){

Reader.loadBookmarks();

Reader.restoreReadingProgress();

});

/*==================================================
                JAVASCRIPT PART 8 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 9
                SETTINGS • VIEW MODE • FULLSCREEN
==================================================*/

/*==================================================
                READING MODE
==================================================*/

Reader.setSingleMode=async function(){

Reader.isSingleMode=true;

Reader.isDoubleMode=false;

Reader.clearCache();

await Reader.renderCurrentPages();

Reader.showToast(

"Single Page Mode"

);

};

Reader.setDoubleMode=async function(){

Reader.isSingleMode=false;

Reader.isDoubleMode=true;

Reader.clearCache();

await Reader.renderCurrentPages();

Reader.showToast(

"Double Page Mode"

);

};

Reader.setAutoMode=async function(){

if(window.innerWidth<=991){

await Reader.setSingleMode();

}

else{

await Reader.setDoubleMode();

}

};

/*==================================================
                FULLSCREEN
==================================================*/

Reader.toggleFullscreen=async function(){

try{

if(!document.fullscreenElement){

await document.documentElement.requestFullscreen();

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
                THEME
==================================================*/

Reader.currentTheme="dark";

Reader.toggleTheme=function(){

document.body.classList.toggle(

"lightTheme"

);

Reader.currentTheme=

document.body.classList.contains(

"lightTheme"

)

?

"light"

:

"dark";

localStorage.setItem(

"reader-theme",

Reader.currentTheme

);

};

Reader.restoreTheme=function(){

const theme=

localStorage.getItem(

"reader-theme"

);

if(theme==="light"){

document.body.classList.add(

"lightTheme"

);

Reader.currentTheme="light";

}

};

/*==================================================
                PAGE SHADOW
==================================================*/

Reader.togglePageShadow=function(){

if(!Reader.input.pageShadow) return;

if(

Reader.input.pageShadow.checked

){

Reader.dom.pageShadow.style.display="block";

Reader.dom.pageCurve.style.display="block";

}

else{

Reader.dom.pageShadow.style.display="none";

Reader.dom.pageCurve.style.display="none";

}

};

/*==================================================
                WATERMARK
==================================================*/

Reader.toggleWatermark=function(){

if(!Reader.input.watermark) return;

Reader.dom.watermark.style.display=

Reader.input.watermark.checked

?

"block"

:

"none";

};

/*==================================================
                PAGE ANIMATION
==================================================*/

Reader.animationEnabled=true;

Reader.toggleAnimation=function(){

if(!Reader.input.pageAnimation) return;

Reader.animationEnabled=

Reader.input.pageAnimation.checked;

};

/*==================================================
                SETTINGS EVENTS
==================================================*/

Reader.btn.single.addEventListener(

"click",

Reader.setSingleMode

);

Reader.btn.double.addEventListener(

"click",

Reader.setDoubleMode

);

Reader.btn.auto.addEventListener(

"click",

Reader.setAutoMode

);

Reader.btn.fullscreen.addEventListener(

"click",

Reader.toggleFullscreen

);

Reader.btn.theme.addEventListener(

"click",

Reader.toggleTheme

);

if(Reader.input.pageShadow){

Reader.input.pageShadow.addEventListener(

"change",

Reader.togglePageShadow

);

}

if(Reader.input.watermark){

Reader.input.watermark.addEventListener(

"change",

Reader.toggleWatermark

);

}

if(Reader.input.pageAnimation){

Reader.input.pageAnimation.addEventListener(

"change",

Reader.toggleAnimation

);

}

/*==================================================
                WINDOW EVENTS
==================================================*/

window.addEventListener(

"resize",

async function(){

if(

Reader.isSingleMode ||

Reader.isDoubleMode

){

await Reader.setAutoMode();

}

}

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

);

/*==================================================
                STARTUP
==================================================*/

window.addEventListener(

"load",

function(){

Reader.restoreTheme();

Reader.togglePageShadow();

Reader.toggleWatermark();

Reader.toggleAnimation();

});

/*==================================================
                JAVASCRIPT PART 9 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 10
        PAGE FLIP • OPEN ANIMATION • MOBILE
==================================================*/

/*==================================================
                VARIABLES
==================================================*/

Reader.animationDuration=450;

Reader.animationEnabled=true;

/*==================================================
                OPEN READER ANIMATION
==================================================*/

Reader.playOpeningAnimation=async function(){

if(!Reader.dom.openingAnimation){

return;

}

Reader.dom.openingAnimation.style.display="flex";

Reader.dom.openingAnimation.style.opacity="1";

const glow=

document.getElementById("pageGlow");

if(glow){

glow.style.opacity="1";

}

await new Promise(function(resolve){

setTimeout(resolve,2000);

});

if(glow){

glow.style.opacity="0";

}

Reader.dom.openingAnimation.style.opacity="0";

await new Promise(function(resolve){

setTimeout(resolve,400);

});

Reader.dom.openingAnimation.style.display="none";

};

/*==================================================
                PAGE FLIP
==================================================*/

Reader.pageFlip=async function(direction){

if(!Reader.animationEnabled){

return;

}

const front=

document.getElementById("pageFront");

const back=

document.getElementById("pageBack");

if(!front || !back){

return;

}

front.style.transition=

"transform .45s ease";

back.style.transition=

"transform .45s ease";

if(direction==="next"){

front.style.transform=

"rotateY(-180deg)";

back.style.transform=

"rotateY(0deg)";

}

else{

front.style.transform=

"rotateY(180deg)";

back.style.transform=

"rotateY(0deg)";

}

await new Promise(function(resolve){

setTimeout(

resolve,

Reader.animationDuration

);

});

front.style.transition="none";

back.style.transition="none";

front.style.transform="rotateY(0deg)";

back.style.transform="rotateY(180deg)";

};

/*==================================================
                TOUCH SWIPE
==================================================*/

Reader.touchStartX=0;

Reader.touchEndX=0;

Reader.dom.bookViewport.addEventListener(

"touchstart",

function(e){

Reader.touchStartX=

e.changedTouches[0].clientX;

},

{

passive:true

}

);

Reader.dom.bookViewport.addEventListener(

"touchend",

async function(e){

Reader.touchEndX=

e.changedTouches[0].clientX;

const distance=

Reader.touchEndX-

Reader.touchStartX;

if(distance>80){

await Reader.previousPage();

}

if(distance<-80){

await Reader.nextPage();

}

},

{

passive:true

}

);

/*==================================================
                ESC KEY
==================================================*/

document.addEventListener(

"keydown",

async function(e){

if(e.key!=="Escape"){

return;

}

if(document.fullscreenElement){

await document.exitFullscreen();

return;

}

Reader.closePanels();

});

/*==================================================
                CLOSE READER
==================================================*/

Reader.closeReader=function(){

window.history.back();

};

Reader.btn.close.addEventListener(

"click",

Reader.closeReader

);

/*==================================================
                OPENING
==================================================*/

window.addEventListener(

"load",

async function(){

await Reader.playOpeningAnimation();

});

/*==================================================
                JAVASCRIPT PART 10 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 11
        THUMBNAILS • TABLE OF CONTENTS • NAVIGATION
==================================================*/

/*==================================================
                THUMBNAIL SYSTEM
==================================================*/

Reader.thumbnailPages=[];

Reader.createThumbnails=async function(){

const container=

document.getElementById(

"thumbnailContainer"

);

if(!container) return;

container.innerHTML="";

for(

let i=1;

i<=Reader.totalPages;

i++

){

const page=

await Reader.getPage(i);

const viewport=

page.getViewport({

scale:0.25

});

const canvas=

document.createElement("canvas");

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:

canvas.getContext("2d"),

viewport:viewport

}).promise;


const item=

document.createElement("div");

item.className=

"thumbnail";


item.dataset.page=i;


item.appendChild(canvas);


item.addEventListener(

"click",

async function(){

Reader.currentPage=i;

await Reader.renderCurrentPages();

Reader.closePanels();

}

);


container.appendChild(item);


Reader.thumbnailPages.push(item);

}

};


/*==================================================
                ACTIVE THUMBNAIL
==================================================*/

Reader.updateThumbnail=function(){

Reader.thumbnailPages.forEach(

thumb=>{

thumb.classList.remove(

"active"

);


if(

parseInt(thumb.dataset.page)

===Reader.currentPage

){

thumb.classList.add(

"active"

);

}

}

);

};


/*==================================================
                TABLE OF CONTENTS
==================================================*/

Reader.loadTOC=async function(){

const container=

document.getElementById(

"tocContainer"

);


if(!container) return;


container.innerHTML="";


try{


const outline=

await Reader.pdf.getOutline();


if(!outline){

container.innerHTML=

"<p>No Contents</p>";

return;

}


for(

const item of outline

){


const row=

document.createElement("div");


row.className=

"tocItem";


row.textContent=

item.title;


row.addEventListener(

"click",

async function(){


const destination=

await Reader.pdf.getDestination(

item.dest

);


const pageIndex=

await Reader.pdf.getPageIndex(

destination[0]

);


Reader.currentPage=

pageIndex+1;


await Reader.renderCurrentPages();


Reader.closePanels();


});


container.appendChild(row);


}


}

catch(error){

console.warn(

"TOC Error",

error

);

}

};


/*==================================================
                OPEN SIDEBARS
==================================================*/

Reader.openThumbnail=function(){

Reader.closePanels();


Reader.dom.thumbnailSidebar

.classList

.add("active");


Reader.dom.readerOverlay

.classList

.add("active");


};


Reader.openTOC=function(){

Reader.closePanels();


Reader.dom.tocPanel

.classList

.add("active");


Reader.dom.readerOverlay

.classList

.add("active");


};


/*==================================================
                EVENTS
==================================================*/


const thumbnailBtn=

document.getElementById(

"thumbnailBtn"

);


if(thumbnailBtn){


thumbnailBtn.addEventListener(

"click",

Reader.openThumbnail

);


}



const tocBtn=

document.getElementById(

"tocBtn"

);


if(tocBtn){


tocBtn.addEventListener(

"click",

Reader.openTOC

);


}


/*==================================================
                UPDATE AFTER PAGE CHANGE
==================================================*/


const oldRender=

Reader.renderCurrentPages;


Reader.renderCurrentPages=

async function(){


await oldRender();


Reader.updateThumbnail();


};


/*==================================================
                START LOAD
==================================================*/


window.addEventListener(

"load",

async function(){


if(Reader.pdf){


await Reader.createThumbnails();


await Reader.loadTOC();


}


});


/*==================================================
                JAVASCRIPT PART 11 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 12
        MOBILE RESPONSIVE • GESTURES • TOUCH
==================================================*/

/*==================================================
                MOBILE MODE CHECK
==================================================*/

Reader.checkMobileMode=function(){

Reader.isMobile=

window.innerWidth<=991;

if(Reader.isMobile){

Reader.isSingleMode=true;

Reader.isDoubleMode=false;

}

else{

if(

!Reader.isSingleMode

){

Reader.isDoubleMode=true;

}

}

};


/*==================================================
                MOBILE VIEW UPDATE
==================================================*/

Reader.updateMobileView=function(){

if(!Reader.dom.rightCanvas){

return;

}

if(Reader.isMobile){

Reader.dom.rightCanvas.style.display="none";

Reader.isSingleMode=true;

Reader.isDoubleMode=false;

}

else{

Reader.dom.rightCanvas.style.display="block";

}

};


/*==================================================
                TOUCH VARIABLES
==================================================*/

Reader.touch={

startX:0,

startY:0,

endX:0,

endY:0,

startTime:0

};


/*==================================================
                TOUCH START
==================================================*/

Reader.dom.bookViewport.addEventListener(

"touchstart",

function(e){

const touch=

e.changedTouches[0];

Reader.touch.startX=

touch.clientX;

Reader.touch.startY=

touch.clientY;

Reader.touch.startTime=

Date.now();

},

{

passive:true

}

);


/*==================================================
                TOUCH END
==================================================*/

Reader.dom.bookViewport.addEventListener(

"touchend",

async function(e){

const touch=

e.changedTouches[0];

Reader.touch.endX=

touch.clientX;

Reader.touch.endY=

touch.clientY;


const distanceX=

Reader.touch.endX-

Reader.touch.startX;


const distanceY=

Reader.touch.endY-

Reader.touch.startY;


const time=

Date.now()-

Reader.touch.startTime;


/*
    PAGE SWIPE
*/

if(

Math.abs(distanceX)>80 &&

Math.abs(distanceY)<80 &&

time<600

){

if(distanceX<0){

await Reader.pageFlip("next");

await Reader.nextPage();

}

else{

await Reader.pageFlip("previous");

await Reader.previousPage();

}

}


/*
    TAP CONTROLS
*/

else if(

Math.abs(distanceX)<20 &&

Math.abs(distanceY)<20

){

const width=

window.innerWidth;

const x=

touch.clientX;


if(x<width*0.35){

await Reader.previousPage();

}


if(x>width*0.65){

await Reader.nextPage();

}

}


},

{

passive:true

}

);


/*==================================================
                DOUBLE TAP ZOOM
==================================================*/

Reader.lastTap=0;


Reader.dom.bookViewport.addEventListener(

"touchend",

async function(){

const now=

Date.now();


if(

now-Reader.lastTap<300

){

if(

Reader.scale>1

){

await Reader.resetZoom();

}

else{

Reader.scale=2;

await Reader.applyZoom();

}

}


Reader.lastTap=now;


},

{

passive:true

}

);


/*==================================================
                MOBILE ORIENTATION
==================================================*/

window.addEventListener(

"orientationchange",

async function(){

setTimeout(async function(){

Reader.checkMobileMode();

Reader.updateMobileView();

await Reader.renderCurrentPages();

},300);

});


/*==================================================
                RESIZE EVENT
==================================================*/

window.addEventListener(

"resize",

async function(){

Reader.checkMobileMode();

Reader.updateMobileView();

});


/*==================================================
                MOBILE PAGE SELECT
==================================================*/

Reader.mobileGotoPage=function(page){

page=parseInt(page);

if(

isNaN(page)

){

return;

}

Reader.goToPage(page);

};


/*==================================================
                MOBILE INIT
==================================================*/

window.addEventListener(

"load",

function(){

Reader.checkMobileMode();

Reader.updateMobileView();

});


/*==================================================
                JAVASCRIPT PART 12 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 13
        PERFORMANCE • CACHE • LAZY LOADING
==================================================*/

/*==================================================
                PERFORMANCE SETTINGS
==================================================*/

Reader.performance={

maxCachePages:25,

preloadDistance:3,

renderQueue:[],

isBusy:false

};


/*==================================================
                SMART CACHE MANAGER
==================================================*/

Reader.addToCache=function(pageNumber,canvas){

if(

Reader.pageCache.has(pageNumber)

){

return;

}

Reader.pageCache.set(

pageNumber,

canvas

);


/* Remove old pages */

if(

Reader.pageCache.size >

Reader.performance.maxCachePages

){

const oldPage=

Reader.pageCache

.keys()

.next()

.value;


Reader.pageCache.delete(

oldPage

);

}

};


/*==================================================
                CLEAR OLD CACHE
==================================================*/

Reader.optimizeCache=function(){

const keepPages=[];


for(

let i=-Reader.performance.preloadDistance;

i<=Reader.performance.preloadDistance;

i++

){

const page=

Reader.currentPage+i;


if(

page>0 &&

page<=Reader.totalPages

){

keepPages.push(page);

}

}


Reader.pageCache.forEach(

function(value,key){

if(

!keepPages.includes(key)

){

Reader.pageCache.delete(key);

}

}

);

};


/*==================================================
                LAZY PRELOAD
==================================================*/

Reader.lazyLoadPages=async function(){

if(!Reader.pdf){

return;

}


for(

let i=1;

i<=Reader.performance.preloadDistance;

i++

){

const next=

Reader.currentPage+i;

const previous=

Reader.currentPage-i;


if(

next<=Reader.totalPages

){

await Reader.preloadPage(next);

}


if(

previous>=1

){

await Reader.preloadPage(previous);

}

}


Reader.optimizeCache();

};


/*==================================================
                RENDER QUEUE
==================================================*/

Reader.addRenderTask=function(task){

Reader.performance.renderQueue.push(task);

Reader.processRenderQueue();

};


Reader.processRenderQueue=async function(){

if(

Reader.performance.isBusy

){

return;

}


Reader.performance.isBusy=true;


while(

Reader.performance.renderQueue.length

){

const task=

Reader.performance.renderQueue.shift();


try{

await task();

}

catch(error){

console.error(

"Render Queue Error",

error

);

}

}


Reader.performance.isBusy=false;

};


/*==================================================
                MEMORY CLEANER
==================================================*/

Reader.cleanMemory=function(){

if(

performance.memory

){

console.log(

"Memory:",

performance.memory.usedJSHeapSize

);

}


Reader.optimizeCache();

};


/*==================================================
                VISIBILITY OPTIMIZATION
==================================================*/

document.addEventListener(

"visibilitychange",

function(){


if(document.hidden){

Reader.saveReadingProgress();

Reader.optimizeCache();

}

else{

Reader.lazyLoadPages();

}


}

);


/*==================================================
                IDLE PRELOAD
==================================================*/

if(

window.requestIdleCallback

){

requestIdleCallback(

function(){

Reader.lazyLoadPages();

}

);

}

else{

setTimeout(

function(){

Reader.lazyLoadPages();

},

1000

);

}


/*==================================================
                PERIODIC CLEAN
==================================================*/

setInterval(

function(){

Reader.cleanMemory();

},

60000

);


/*==================================================
                JAVASCRIPT PART 13 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 14
        KEYBOARD • BROWSER SUPPORT • SAFETY
==================================================*/

/*==================================================
                KEYBOARD SHORTCUT SYSTEM
==================================================*/

Reader.keyboardEnabled=true;

Reader.handleKeyboard=function(e){

if(!Reader.keyboardEnabled){

return;

}


/* Ignore typing areas */

if(

e.target.tagName==="INPUT" ||

e.target.tagName==="TEXTAREA" ||

e.target.isContentEditable

){

return;

}


/* PAGE CONTROL */

switch(e.key){


case "ArrowRight":

case "PageDown":

Reader.nextPage();

break;


case "ArrowLeft":

case "PageUp":

Reader.previousPage();

break;


case "Home":

Reader.firstPage();

break;


case "End":

Reader.lastPage();

break;



/* ZOOM */

case "+":

if(e.ctrlKey){

e.preventDefault();

Reader.zoomIn();

}

break;


case "-":

if(e.ctrlKey){

e.preventDefault();

Reader.zoomOut();

}

break;


case "0":

if(e.ctrlKey){

e.preventDefault();

Reader.resetZoom();

}

break;



/* FULLSCREEN */

case "f":

if(e.ctrlKey){

e.preventDefault();

Reader.toggleFullscreen();

}

break;



/* SEARCH */

case "f":

break;


}

};


document.addEventListener(

"keydown",

Reader.handleKeyboard

);


/*==================================================
                BROWSER BACK CONTROL
==================================================*/

Reader.preventAccidentalExit=function(){

history.pushState(

{

reader:true

},

""

);


window.addEventListener(

"popstate",

function(){

if(

Reader.pdf

){

const confirmClose=

confirm(

"Exit Reader?"

);


if(confirmClose){

history.back();

}

else{

history.pushState(

{

reader:true

},

""

);

}

}

}

);

};


/*==================================================
                COPY PROTECTION
==================================================*/


Reader.enableProtection=function(){

document.addEventListener(

"dragstart",

function(e){

e.preventDefault();

}

);


document.addEventListener(

"contextmenu",

function(e){

e.preventDefault();

}

);

};


/*==================================================
                NETWORK CHECK
==================================================*/

Reader.checkConnection=function(){

if(

navigator.onLine

){

return true;

}

else{

Reader.showToast(

"No Internet Connection"

);

return false;

}

};


window.addEventListener(

"offline",

function(){

Reader.showToast(

"Connection Lost"

);

});


window.addEventListener(

"online",

function(){

Reader.showToast(

"Connection Restored"

);

});


/*==================================================
                BROWSER DETECTION
==================================================*/

Reader.browser={

chrome:false,

firefox:false,

edge:false,

safari:false

};


Reader.detectBrowser=function(){

const agent=

navigator.userAgent.toLowerCase();


Reader.browser.chrome=

agent.includes("chrome");


Reader.browser.firefox=

agent.includes("firefox");


Reader.browser.edge=

agent.includes("edg");


Reader.browser.safari=

agent.includes("safari")

&&

!Reader.browser.chrome;


};


Reader.detectBrowser();


/*==================================================
                PERFORMANCE
==================================================*/

Reader.optimize=function(){


/* reduce cache on mobile */

if(

Reader.isMobile

){

Reader.pageCache.clear();

}


/* hardware acceleration */

Reader.dom.canvasWrapper.style.transform=

"translateZ(0)";


};


/*==================================================
                ERROR HANDLING
==================================================*/


window.addEventListener(

"error",

function(event){

console.error(

"Reader Error:",

event.error

);

});


window.addEventListener(

"unhandledrejection",

function(event){

console.error(

"Promise Error:",

event.reason

);

});


/*==================================================
                INITIALIZE SECURITY
==================================================*/


window.addEventListener(

"load",

function(){

Reader.preventAccidentalExit();

Reader.enableProtection();

Reader.optimize();

});


/*==================================================
                JAVASCRIPT PART 14 END
==================================================*/
/*==================================================
                JAVASCRIPT PART 15
        FINAL CONNECTION • VALIDATION • START
==================================================*/

/*==================================================
        CONNECT ALL BUTTONS SAFELY
==================================================*/

Reader.connectButton=function(id,action){

const button=

document.getElementById(id);

if(button && typeof action==="function"){

button.addEventListener(

"click",

action

);

}

};

/*==================================================
                BUTTON CONNECTIONS
==================================================*/

Reader.connectAllButtons=function(){

Reader.connectButton(

"nextBtn",

Reader.nextPage

);

Reader.connectButton(

"previousBtn",

Reader.previousPage

);

Reader.connectButton(

"firstPageBtn",

Reader.firstPage

);

Reader.connectButton(

"lastPageBtn",

Reader.lastPage

);

Reader.connectButton(

"zoomInBtn",

Reader.zoomIn

);

Reader.connectButton(

"zoomOutBtn",

Reader.zoomOut

);

Reader.connectButton(

"fullScreenBtn",

Reader.toggleFullscreen

);

Reader.connectButton(

"themeBtn",

Reader.toggleTheme

);

Reader.connectButton(

"bookmarkBtn",

Reader.addBookmark

);

Reader.connectButton(

"searchBtn",

function(){

Reader.openPanel(

Reader.dom.searchPanel

);

}

);

Reader.connectButton(

"settingBtn",

function(){

Reader.openPanel(

Reader.dom.settingsPanel

);

}

);

Reader.connectButton(

"singleModeBtn",

Reader.setSingleMode

);

Reader.connectButton(

"doubleModeBtn",

Reader.setDoubleMode

);

Reader.connectButton(

"autoModeBtn",

Reader.setAutoMode

);

Reader.connectButton(

"closeBtn",

Reader.closeReader

);

};

/*==================================================
                CHECK HTML ELEMENTS
==================================================*/

Reader.checkHTML=function(){

const required=[

"reader",

"bookViewport",

"leftCanvas",

"rightCanvas",

"pageCounter",

"nextBtn",

"previousBtn",

"zoomInBtn",

"zoomOutBtn",

"searchPanel",

"settingsPanel",

"bookmarkPanel"

];

let missing=[];

required.forEach(function(id){

if(!document.getElementById(id)){

missing.push(id);

}

});

if(missing.length){

console.warn(

"Missing HTML IDs:",

missing

);

return false;

}

return true;

};

/*==================================================
                CHECK PDF.JS
==================================================*/

Reader.checkLibrary=function(){

if(typeof pdfjsLib==="undefined"){

Reader.showError(

"PDF Library Not Loaded"

);

return false;

}

return true;

};

/*==================================================
                FINAL INIT
==================================================*/

Reader.init=async function(){

try{

if(!Reader.checkHTML()){

return;

}

if(!Reader.checkLibrary()){

return;

}

Reader.detectDevice();

Reader.restoreTheme();

Reader.connectAllButtons();

Reader.loadBookmarks();

await Reader.startReader();

Reader.restoreReadingProgress();

await Reader.renderCurrentPages();

Reader.updateWatermark();

Reader.updateShadow();

Reader.showToast(

"Chishti Reader Ready"

);

console.log(

"Chishti Library Reader Loaded Successfully"

);

}

catch(error){

console.error(

"Reader Error:",

error

);

Reader.showError(

"Reader Failed To Start"

);

}

};

/*==================================================
                AUTO START
==================================================*/

if(

document.readyState==="loading"

){

document.addEventListener(

"DOMContentLoaded",

Reader.init

);

}

else{

Reader.init();

}

/*==================================================
                CLEANUP
==================================================*/

window.addEventListener(

"beforeunload",

function(){

Reader.saveCurrentPage();

Reader.saveBookmarks();

});

/*==================================================
                END OF JAVASCRIPT
==================================================*/
