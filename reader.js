/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 1
            CORE + INITIALIZATION
==================================================*/

"use strict";

/*==================================================
                    READER
==================================================*/

const Reader={

version:"1.0.0",

pdf:null,

pdfUrl:null,

totalPages:0,

currentPage:1,

scale:1,

rotation:0,

fitMode:"fit",

theme:"dark",

readingMode:"single",

fullscreen:false,

searchResults:[],

searchIndex:0,

bookmarks:[],

comments:[],

isRendering:false,

isLoading:false,

cache:new Map(),

elements:{}

};

/*==================================================
                SHORTCUTS
==================================================*/

Reader.$=function(id){

return document.getElementById(id);

};

Reader.$$=function(selector){

return document.querySelector(selector);

};

Reader.$all=function(selector){

return document.querySelectorAll(selector);

};

/*==================================================
            CACHE HTML ELEMENTS
==================================================*/

Reader.cacheElements=function(){

const ids=[

"reader",

"preloader",

"openingAnimation",

"readerHeader",

"bookTitle",

"bookAuthor",

"pageCounter",

"zoomIndicator",

"leftCanvas",

"rightCanvas",

"readerBody",

"bookViewport",

"canvasWrapper",

"loadingScreen",

"loadingBar",

"loadingStatus",

"readerToast",

"toastMessage",

"readerOverlay",

"errorScreen",

"errorMessage",

"bookmarkPanel",

"searchPanel",

"settingsPanel",

"tocPanel",

"thumbnailSidebar"

];

ids.forEach(id=>{

Reader.elements[id]=Reader.$(id);

});

};

/*==================================================
                SHOW TOAST
==================================================*/

Reader.toast=function(message){

const toast=Reader.elements.readerToast;

const text=Reader.$("toastMessage");

if(!toast||!text)return;

text.textContent=message;

toast.classList.add("show");

clearTimeout(Reader.toastTimer);

Reader.toastTimer=setTimeout(()=>{

toast.classList.remove("show");

},2500);

};

/*==================================================
            SHOW / HIDE LOADER
==================================================*/

Reader.showLoader=function(text="Loading..."){

const loader=Reader.elements.loadingScreen;

const status=Reader.$("loadingStatus");

if(loader){

loader.classList.add("active");

}

if(status){

status.textContent=text;

}

};

Reader.hideLoader=function(){

const loader=Reader.elements.loadingScreen;

if(loader){

loader.classList.remove("active");

}

};

/*==================================================
                UPDATE PROGRESS
==================================================*/

Reader.setProgress=function(value){

const bar=Reader.$("loadingBar");

if(bar){

bar.style.width=value+"%";

}

};

/*==================================================
            APPLICATION START
==================================================*/

Reader.start=function(){

Reader.cacheElements();

Reader.bindGlobalEvents();

Reader.restoreSettings();

Reader.detectTheme();

Reader.hidePreloader();

Reader.toast("Reader Ready");

console.log(

"Chishti Library Reader Started"

);

};

/*==================================================
            PRELOADER
==================================================*/

Reader.hidePreloader=function(){

setTimeout(()=>{

const preloader=Reader.elements.preloader;

if(preloader){

preloader.style.opacity="0";

setTimeout(()=>{

preloader.remove();

},400);

}

},500);

};

/*==================================================
            DOM READY
==================================================*/

document.addEventListener(

"DOMContentLoaded",

function(){

Reader.start();

}

);

/*==================================================
            JS PART 1 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 2
            EVENTS + UI CONTROLS
==================================================*/

/*==================================================
                EVENT BINDING
==================================================*/

Reader.bindGlobalEvents=function(){

const clickEvents={

previousBtn:()=>Reader.previousPage(),

nextBtn:()=>Reader.nextPage(),

firstPageBtn:()=>Reader.firstPage(),

lastPageBtn:()=>Reader.lastPage(),

zoomInBtn:()=>Reader.zoomIn(),

zoomOutBtn:()=>Reader.zoomOut(),

resetZoomBtn:()=>Reader.resetZoom(),

fitPageBtn:()=>Reader.fitPage(),

fitWidthBtn:()=>Reader.fitWidth(),

themeBtn:()=>Reader.toggleTheme(),

fullScreenBtn:()=>Reader.toggleFullscreen(),

bookmarkBtn:()=>Reader.addBookmark(),

searchBtn:()=>Reader.togglePanel("searchPanel"),

settingBtn:()=>Reader.togglePanel("settingsPanel"),

closeBtn:()=>Reader.closeReader(),

mobilePrevBtn:()=>Reader.previousPage(),

mobileNextBtn:()=>Reader.nextPage(),

closeSearchPanelBtn:()=>Reader.closePanel("searchPanel"),

closeBookmarkBtn:()=>Reader.closePanel("bookmarkPanel"),

closeSettingsBtn:()=>Reader.closePanel("settingsPanel"),

closeTocBtn:()=>Reader.closePanel("tocPanel"),

closeThumbnailBtn:()=>Reader.closePanel("thumbnailSidebar"),

reloadBookBtn:()=>location.reload(),

goHomeBtn:()=>window.location.href="index.html"

};

Object.keys(clickEvents).forEach(id=>{

const element=Reader.$(id);

if(element){

element.addEventListener(

"click",

clickEvents[id]

);

}

});

/*==================================================
            SEARCH EVENTS
==================================================*/

const searchInput=Reader.$("searchKeyword");

if(searchInput){

searchInput.addEventListener(

"keydown",

event=>{

if(event.key==="Enter"){

Reader.search(

searchInput.value

);

}

}

);

}

/*==================================================
            WINDOW EVENTS
==================================================*/

window.addEventListener(

"resize",

()=>{

Reader.updateLayout();

}

);

document.addEventListener(

"keydown",

Reader.keyboardShortcuts

);

};

/*==================================================
                PANEL SYSTEM
==================================================*/

Reader.togglePanel=function(panelId){

const panel=Reader.$(panelId);

const overlay=Reader.$("readerOverlay");

if(!panel)return;

const opened=

panel.classList.contains("active");

Reader.closeAllPanels();

if(!opened){

panel.classList.add("active");

if(overlay){

overlay.classList.add("active");

}

}

};

Reader.closePanel=function(panelId){

const panel=Reader.$(panelId);

if(panel){

panel.classList.remove("active");

}

const overlay=Reader.$("readerOverlay");

if(overlay){

overlay.classList.remove("active");

}

};

Reader.closeAllPanels=function(){

document

.querySelectorAll(".sidePanel")

.forEach(panel=>{

panel.classList.remove("active");

});

const thumb=Reader.$("thumbnailSidebar");

if(thumb){

thumb.classList.remove("active");

}

const overlay=Reader.$("readerOverlay");

if(overlay){

overlay.classList.remove("active");

}

};

/*==================================================
            KEYBOARD SHORTCUTS
==================================================*/

Reader.keyboardShortcuts=function(event){

switch(event.key){

case"ArrowRight":

Reader.nextPage();

break;

case"ArrowLeft":

Reader.previousPage();

break;

case"+":

Reader.zoomIn();

break;

case"-":

Reader.zoomOut();

break;

case"0":

Reader.resetZoom();

break;

case"f":

Reader.toggleFullscreen();

break;

case"Escape":

Reader.closeAllPanels();

break;

}

};

/*==================================================
            LAYOUT UPDATE
==================================================*/

Reader.updateLayout=function(){

const zoom=

Reader.$("zoomIndicator");

if(zoom){

zoom.textContent=

Math.round(

Reader.scale*100

)+"%";

}

};

/*==================================================
                JS PART 2 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 3
            PDF LOADER + RENDER ENGINE
==================================================*/

/*==================================================
                LOAD PDF
==================================================*/

Reader.loadPDF=async function(pdfUrl){

try{

Reader.showLoader("Opening Book...");

Reader.setProgress(10);

Reader.pdfUrl=pdfUrl;

const loadingTask=

pdfjsLib.getDocument({

url:pdfUrl,

enableXfa:true,

useSystemFonts:true

});

loadingTask.onProgress=function(progress){

if(progress.total){

const percent=

Math.floor(

(progress.loaded/progress.total)*100

);

Reader.setProgress(percent);

}

};

Reader.pdf=

await loadingTask.promise;

Reader.totalPages=

Reader.pdf.numPages;

Reader.currentPage=1;

Reader.updatePageCounter();

Reader.updateBookInfo();

await Reader.renderPage(

Reader.currentPage

);

Reader.hideLoader();

Reader.toast("Book Loaded");

}

catch(error){

console.error(error);

Reader.showError(

"Unable to load PDF."

);

}

};

/*==================================================
                RENDER PAGE
==================================================*/

Reader.renderPage=async function(pageNumber){

if(

Reader.isRendering||

!Reader.pdf

){

return;

}

Reader.isRendering=true;

try{

const page=

await Reader.pdf.getPage(pageNumber);

const canvas=

Reader.$("leftCanvas");

const context=

canvas.getContext("2d");

const viewport=

page.getViewport({

scale:Reader.scale,

rotation:Reader.rotation

});

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

Reader.updatePageCounter();

Reader.updateProgress();

}

catch(error){

console.error(error);

Reader.showError(

"Unable to render page."

);

}

Reader.isRendering=false;

};

/*==================================================
            UPDATE PAGE COUNTER
==================================================*/

Reader.updatePageCounter=function(){

const counter=

Reader.$("pageCounter");

const floating=

Reader.$("floatingPageNumber");

const mobileCurrent=

Reader.$("mobileCurrentPage");

const mobileTotal=

Reader.$("mobileTotalPages");

if(counter){

counter.textContent=

Reader.currentPage+

" / "+

Reader.totalPages;

}

if(floating){

floating.textContent=

Reader.currentPage;

}

if(mobileCurrent){

mobileCurrent.textContent=

Reader.currentPage;

}

if(mobileTotal){

mobileTotal.textContent=

Reader.totalPages;

}

};

/*==================================================
            UPDATE BOOK INFO
==================================================*/

Reader.updateBookInfo=async function(){

if(!Reader.pdf)return;

const metadata=

await Reader.pdf.getMetadata()

.catch(()=>null);

const title=

metadata?.info?.Title||

"Untitled Book";

const author=

metadata?.info?.Author||

"Unknown Author";

Reader.$("bookTitle").textContent=

title;

Reader.$("bookAuthor").textContent=

author;

};

/*==================================================
                SHOW ERROR
==================================================*/

Reader.showError=function(message){

const screen=

Reader.$("errorScreen");

const text=

Reader.$("errorMessage");

if(text){

text.textContent=message;

}

if(screen){

screen.classList.add("active");

}

};

/*==================================================
                JS PART 3 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 4
        PAGE NAVIGATION + ZOOM CONTROLS
==================================================*/

/*==================================================
                NEXT PAGE
==================================================*/

Reader.nextPage=async function(){

if(

!Reader.pdf||

Reader.currentPage>=Reader.totalPages||

Reader.isRendering

){

return;

}

Reader.currentPage++;

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                PREVIOUS PAGE
==================================================*/

Reader.previousPage=async function(){

if(

!Reader.pdf||

Reader.currentPage<=1||

Reader.isRendering

){

return;

}

Reader.currentPage--;

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                FIRST PAGE
==================================================*/

Reader.firstPage=async function(){

if(!Reader.pdf)return;

Reader.currentPage=1;

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                LAST PAGE
==================================================*/

Reader.lastPage=async function(){

if(!Reader.pdf)return;

Reader.currentPage=

Reader.totalPages;

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                GO TO PAGE
==================================================*/

Reader.goToPage=async function(page){

page=parseInt(page);

if(

isNaN(page)||

page<1||

page>Reader.totalPages

){

return;

}

Reader.currentPage=page;

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                ZOOM IN
==================================================*/

Reader.zoomIn=async function(){

if(

Reader.scale>=5

){

return;

}

Reader.scale+=0.1;

Reader.scale=

Number(

Reader.scale.toFixed(2)

);

Reader.updateZoom();

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                ZOOM OUT
==================================================*/

Reader.zoomOut=async function(){

if(

Reader.scale<=0.5

){

return;

}

Reader.scale-=0.1;

Reader.scale=

Number(

Reader.scale.toFixed(2)

);

Reader.updateZoom();

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                RESET ZOOM
==================================================*/

Reader.resetZoom=async function(){

Reader.scale=1;

Reader.fitMode="manual";

Reader.updateZoom();

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                FIT PAGE
==================================================*/

Reader.fitPage=async function(){

Reader.fitMode="page";

Reader.scale=1;

Reader.updateZoom();

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                FIT WIDTH
==================================================*/

Reader.fitWidth=async function(){

Reader.fitMode="width";

Reader.scale=1.35;

Reader.updateZoom();

await Reader.renderPage(

Reader.currentPage

);

};

/*==================================================
                UPDATE ZOOM
==================================================*/

Reader.updateZoom=function(){

const zoom=

Reader.$("zoomIndicator");

const footer=

Reader.$("footerZoom");

if(zoom){

zoom.textContent=

Math.round(

Reader.scale*100

)+"%";

}

if(footer){

footer.textContent=

Math.round(

Reader.scale*100

)+"%";

}

};

/*==================================================
                JS PART 4 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 5
        THEME + FULLSCREEN + READING MODES
==================================================*/

/*==================================================
                TOGGLE THEME
==================================================*/

Reader.toggleTheme=function(){

const body=document.body;

if(body.classList.contains("light")){

body.classList.remove("light");

Reader.theme="dark";

localStorage.setItem(

"readerTheme",

"dark"

);

const btn=Reader.$("themeBtn");

if(btn){

btn.textContent="🌙";

}

Reader.toast("Dark Theme");

}

else{

body.classList.add("light");

Reader.theme="light";

localStorage.setItem(

"readerTheme",

"light"

);

const btn=Reader.$("themeBtn");

if(btn){

btn.textContent="☀";

}

Reader.toast("Light Theme");

}

};

/*==================================================
                DETECT THEME
==================================================*/

Reader.detectTheme=function(){

const saved=

localStorage.getItem(

"readerTheme"

);

if(saved==="light"){

document.body.classList.add(

"light"

);

Reader.theme="light";

const btn=Reader.$("themeBtn");

if(btn){

btn.textContent="☀";

}

}

};

/*==================================================
            RESTORE SETTINGS
==================================================*/

Reader.restoreSettings=function(){

Reader.detectTheme();

const mode=

localStorage.getItem(

"readingMode"

);

if(mode){

Reader.readingMode=mode;

}

};

/*==================================================
            TOGGLE FULLSCREEN
==================================================*/

Reader.toggleFullscreen=

async function(){

try{

if(

!document.fullscreenElement

){

await document

.documentElement

.requestFullscreen();

Reader.fullscreen=true;

Reader.toast(

"Fullscreen Enabled"

);

}

else{

await document

.exitFullscreen();

Reader.fullscreen=false;

Reader.toast(

"Fullscreen Disabled"

);

}

}

catch(error){

console.error(error);

}

};

/*==================================================
            READING MODES
==================================================*/

Reader.setReadingMode=

function(mode){

Reader.readingMode=mode;

localStorage.setItem(

"readingMode",

mode

);

const buttons=[

"singleModeBtn",

"doubleModeBtn",

"autoModeBtn"

];

buttons.forEach(id=>{

const button=

Reader.$(id);

if(button){

button.classList.remove(

"active"

);

}

});

switch(mode){

case"single":

Reader.$(

"singleModeBtn"

)?.classList.add(

"active"

);

break;

case"double":

Reader.$(

"doubleModeBtn"

)?.classList.add(

"active"

);

break;

default:

Reader.$(

"autoModeBtn"

)?.classList.add(

"active"

);

}

Reader.toast(

mode+

" mode enabled"

);

};

/*==================================================
            BUTTON EVENTS
==================================================*/

Reader.$(

"singleModeBtn"

)?.addEventListener(

"click",

()=>{

Reader.setReadingMode(

"single"

);

}

);

Reader.$(

"doubleModeBtn"

)?.addEventListener(

"click",

()=>{

Reader.setReadingMode(

"double"

);

}

);

Reader.$(

"autoModeBtn"

)?.addEventListener(

"click",

()=>{

Reader.setReadingMode(

"auto"

);

}

);

/*==================================================
                CLOSE READER
==================================================*/

Reader.closeReader=function(){

history.back();

};

/*==================================================
                JS PART 5 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 6
        BOOKMARKS + SEARCH + PROGRESS
==================================================*/

/*==================================================
                BOOKMARKS
==================================================*/

Reader.addBookmark=function(){

const page=Reader.currentPage;

if(

Reader.bookmarks.includes(page)

){

Reader.toast(

"Bookmark already exists"

);

return;

}

Reader.bookmarks.push(page);

Reader.bookmarks.sort(

(a,b)=>a-b

);

localStorage.setItem(

"readerBookmarks",

JSON.stringify(

Reader.bookmarks

)

);

Reader.renderBookmarks();

Reader.toast(

"Bookmark Added"

);

};

Reader.loadBookmarks=function(){

const data=

localStorage.getItem(

"readerBookmarks"

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

Reader.renderBookmarks=function(){

const list=

Reader.$("bookmarkList");

if(!list)return;

list.innerHTML="";

if(

Reader.bookmarks.length===0

){

list.innerHTML=

"<p>No bookmarks found.</p>";

return;

}

Reader.bookmarks.forEach(page=>{

const item=

document.createElement("div");

item.className=

"bookmarkItem";

item.textContent=

"Page "+page;

item.addEventListener(

"click",

()=>{

Reader.goToPage(page);

Reader.closePanel(

"bookmarkPanel"

);

}

);

list.appendChild(item);

});

};

/*==================================================
                SEARCH
==================================================*/

Reader.search=

async function(keyword){

if(

!keyword||

!Reader.pdf

){

return;

}

keyword=

keyword.trim()

.toLowerCase();

Reader.searchResults=[];

Reader.searchIndex=0;

Reader.showLoader(

"Searching..."

);

for(

let i=1;

i<=Reader.totalPages;

i++

){

const page=

await Reader.pdf.getPage(i);

const text=

await page.getTextContent();

const content=

text.items

.map(

item=>item.str

)

.join(" ")

.toLowerCase();

if(

content.includes(keyword)

){

Reader.searchResults.push(i);

}

}

Reader.hideLoader();

Reader.renderSearchResults();

if(

Reader.searchResults.length

){

Reader.toast(

Reader.searchResults.length+

" result(s)"

);

}

else{

Reader.toast(

"No results found"

);

}

};

Reader.renderSearchResults=function(){

const results=

Reader.$("searchResults");

if(!results)return;

results.innerHTML="";

Reader.searchResults.forEach(page=>{

const item=

document.createElement("div");

item.className=

"searchResult";

item.textContent=

"Found on Page "+page;

item.onclick=()=>{

Reader.goToPage(page);

Reader.closePanel(

"searchPanel"

);

};

results.appendChild(item);

});

};

/*==================================================
                PROGRESS
==================================================*/

Reader.updateProgress=function(){

const percent=

Reader.totalPages

?Math.round(

(Reader.currentPage/

Reader.totalPages)

*100

)

:0;

const fill=

Reader.$("progressFill");

const text=

Reader.$("progressPercent");

if(fill){

fill.style.width=

percent+"%";

}

if(text){

text.textContent=

percent+"%";

}

};

/*==================================================
            INITIALIZE
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

Reader.loadBookmarks();

}

/*==================================================
                JS PART 6 END
==================================================*/
);
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 7
        COMMENTS + SHARE + LIKE + STATISTICS
==================================================*/

/*==================================================
                LOAD STATS
==================================================*/

Reader.loadStatistics=function(){

Reader.views=

parseInt(

localStorage.getItem("readerViews")||0

);

Reader.likes=

parseInt(

localStorage.getItem("readerLikes")||0

);

Reader.comments=

JSON.parse(

localStorage.getItem("readerComments")||"[]"

);

Reader.updateStatistics();

Reader.renderComments();

};

/*==================================================
                UPDATE STATS
==================================================*/

Reader.updateStatistics=function(){

const views=

Reader.$("bookViews");

const likes=

Reader.$("bookLikes");

const comments=

Reader.$("bookComments");

const bookmarks=

Reader.$("bookBookmarks");

if(views){

views.textContent=Reader.views;

}

if(likes){

likes.textContent=Reader.likes;

}

if(comments){

comments.textContent=

Reader.comments.length;

}

if(bookmarks){

bookmarks.textContent=

Reader.bookmarks.length;

}

};

/*==================================================
                LIKE BOOK
==================================================*/

Reader.likeBook=function(){

if(

localStorage.getItem(

"readerLiked"

)==="true"

){

Reader.toast(

"You already liked this book."

);

return;

}

Reader.likes++;

localStorage.setItem(

"readerLikes",

Reader.likes

);

localStorage.setItem(

"readerLiked",

"true"

);

Reader.updateStatistics();

Reader.toast(

"Book Liked ❤️"

);

};

/*==================================================
                SHARE BOOK
==================================================*/

Reader.shareBook=

async function(){

try{

const url=

window.location.href;

if(

navigator.share

){

await navigator.share({

title:

Reader.$("bookTitle")

?.textContent||

"Book",

text:

"Read this book on Chishti Library",

url:url

});

}

else{

await navigator.clipboard.writeText(

url

);

Reader.toast(

"Link Copied"

);

}

}

catch(error){

console.error(error);

}

};

/*==================================================
                COMMENTS
==================================================*/

Reader.addComment=function(){

const name=

Reader.$("commentName")

.value.trim();

const message=

Reader.$("commentMessage")

.value.trim();

if(

!name||

!message

){

Reader.toast(

"Fill all fields"

);

return;

}

Reader.comments.push({

name:name,

message:message,

date:new Date()

.toLocaleString()

});

localStorage.setItem(

"readerComments",

JSON.stringify(

Reader.comments

)

);

Reader.$(

"commentName"

).value="";

Reader.$(

"commentMessage"

).value="";

Reader.renderComments();

Reader.updateStatistics();

Reader.toast(

"Comment Added"

);

};

Reader.renderComments=function(){

const container=

Reader.$("commentList");

if(!container)return;

container.innerHTML="";

if(

Reader.comments.length===0

){

container.innerHTML=

"<p>No comments yet.</p>";

return;

}

Reader.comments.forEach(comment=>{

const item=

document.createElement("div");

item.className=

"commentItem";

item.innerHTML=

`

<div class="commentUser">

${comment.name}

</div>

<div class="commentDate">

${comment.date}

</div>

<div class="commentText">

${comment.message}

</div>

`;

container.appendChild(item);

});

};

/*==================================================
                EVENTS
==================================================*/

Reader.$(

"likeBookBtn"

)?.addEventListener(

"click",

Reader.likeBook

);

Reader.$(

"shareBookBtn"

)?.addEventListener(

"click",

Reader.shareBook

);

Reader.$(

"submitCommentBtn"

)?.addEventListener(

"click",

Reader.addComment

);

/*==================================================
            INITIALIZE
==================================================*/

document.addEventListener(

"DOMContentLoaded",

()=>{

Reader.loadStatistics();

});

/*==================================================
                JS PART 7 END
==================================================*/
/*==================================================
            CHISHTI LIBRARY READER
                JAVASCRIPT PART 8
        THUMBNAILS + TOC + SETTINGS + FINAL
==================================================*/

/*==================================================
                THUMBNAILS
==================================================*/

Reader.generateThumbnails=async function(){

const container=

Reader.$("thumbnailContainer");

if(

!container||

!Reader.pdf

){

return;

}

container.innerHTML="";

for(

let pageNumber=1;

pageNumber<=Reader.totalPages;

pageNumber++

){

const page=

await Reader.pdf.getPage(pageNumber);

const viewport=

page.getViewport({

scale:.20

});

const canvas=

document.createElement(

"canvas"

);

const context=

canvas.getContext(

"2d"

);

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:context,

viewport:viewport

}).promise;

const item=

document.createElement(

"div"

);

item.className=

"thumbnail";

item.innerHTML=

`<div class="thumbnailNumber">

Page ${pageNumber}

</div>`;

item.prepend(canvas);

item.onclick=()=>{

Reader.goToPage(

pageNumber

);

};

container.appendChild(item);

}

};

/*==================================================
                TABLE OF CONTENTS
==================================================*/

Reader.loadTOC=async function(){

const toc=

Reader.$("tocList");

if(

!toc||

!Reader.pdf

){

return;

}

toc.innerHTML="";

try{

const outline=

await Reader.pdf.getOutline();

if(

!outline||

outline.length===0

){

toc.innerHTML=

"<p>No table of contents available.</p>";

return;

}

outline.forEach(item=>{

const row=

document.createElement(

"div"

);

row.className=

"tocItem";

row.textContent=

item.title;

toc.appendChild(row);

});

}

catch(error){

console.error(error);

}

};

/*==================================================
                SETTINGS
==================================================*/

Reader.loadSettings=function(){

Reader.$(

"themeSelect"

).value=

Reader.theme;

Reader.$(

"readingMode"

).value=

Reader.readingMode;

};

Reader.saveSettings=function(){

localStorage.setItem(

"readerTheme",

Reader.theme

);

localStorage.setItem(

"readingMode",

Reader.readingMode

);

};

/*==================================================
                AUTO SAVE
==================================================*/

Reader.autoSave=function(){

localStorage.setItem(

"lastPage",

Reader.currentPage

);

localStorage.setItem(

"lastZoom",

Reader.scale

);

};

Reader.restoreLastSession=

function(){

const page=

parseInt(

localStorage.getItem(

"lastPage"

)

);

const zoom=

parseFloat(

localStorage.getItem(

"lastZoom"

)

);

if(!isNaN(page)){

Reader.currentPage=

page;

}

if(!isNaN(zoom)){

Reader.scale=

zoom;

}

};

/*==================================================
                BEFORE EXIT
==================================================*/

window.addEventListener(

"beforeunload",

()=>{

Reader.autoSave();

Reader.saveSettings();

}

/*==================================================
                STARTUP
==================================================*/

);

document.addEventListener(

"DOMContentLoaded",

async()=>{

Reader.loadSettings();

Reader.restoreLastSession();

if(Reader.pdf){

await Reader.generateThumbnails();

await Reader.loadTOC();

}

});

/*==================================================
                END OF READER
==================================================*/

console.log(

"==================================="

);

console.log(

"CHISHTI LIBRARY READER READY"

);

console.log(

"Version:",

Reader.version

);

console.log(

"===================================");

/*==================================================
                END OF JAVASCRIPT
==================================================*/
