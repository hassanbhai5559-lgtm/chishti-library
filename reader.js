/* ==========================================================
   CHISHTI BOOK READER v1
   PART 5 OF 40
   reader.js
   Global State + Initialization
========================================================== */

"use strict";

/* ==========================================================
   PDF.js
========================================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js";

/* ==========================================================
   DOM
========================================================== */

const $ = id => document.getElementById(id);

/* ==========================================================
   UI
========================================================== */

const UI = {

app:$("app"),

book:$("book"),

bookStage:$("bookStage"),

leftCanvas:$("leftCanvas"),

rightCanvas:$("rightCanvas"),

searchInput:$("searchInput"),

themeButton:$("themeButton"),

bookmarkButton:$("bookmarkButton"),

settingButton:$("settingButton"),

fullscreenButton:$("fullscreenButton"),

firstPage:$("firstPage"),

previousPage:$("previousPage"),

nextPage:$("nextPage"),

lastPage:$("lastPage"),

zoomIn:$("zoomIn"),

zoomOut:$("zoomOut"),

rotateBook:$("rotateBook"),

pageInput:$("pageInput"),

totalPages:$("totalPages"),

zoomValue:$("zoomValue"),

loader:$("loader"),

searchPanel:$("searchPanel"),

themePanel:$("themePanel"),

settingsPanel:$("settingsPanel"),

bookmarkPanel:$("bookmarkPanel"),

tocPanel:$("tocPanel"),

toastContainer:$("toastContainer")

};

/* ==========================================================
   PDF STATE
========================================================== */

let pdf = null;

let currentPage = 1;

let totalPages = 0;

let zoom = 1.2;

let rotation = 0;

let singlePage = false;

let rendering = false;

let renderPending = false;

/* ==========================================================
   STORAGE
========================================================== */

const STORAGE = {

theme:

localStorage.getItem("reader-theme") ||

"maroon",

zoom:

parseFloat(

localStorage.getItem("reader-zoom")

) ||

1.2,

page:

parseInt(

localStorage.getItem("reader-page")

) ||

1

};

zoom = STORAGE.zoom;

/* ==========================================================
   CANVAS
========================================================== */

const leftCtx =
UI.leftCanvas.getContext("2d");

const rightCtx =
UI.rightCanvas.getContext("2d");

/* ==========================================================
   START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

initializeReader

);

/* ==========================================================
   INIT
========================================================== */

async function initializeReader(){

document.documentElement.dataset.theme =
STORAGE.theme;

showLoader();

bindEvents();

await loadBookFromURL();

hideLoader();

}
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 6 OF 40
   reader.js
   Load PDF + URL + Book Animation
========================================================== */

/* ==========================================================
   LOAD BOOK FROM URL
========================================================== */

async function loadBookFromURL(){

const params =

new URLSearchParams(

window.location.search

);

const file =

params.get("book");

if(!file){

toast(

"No book selected."

);

return;

}

await openPDF(

`books/${file}`

);

}

/* ==========================================================
   OPEN PDF
========================================================== */

async function openPDF(path){

try{

pdf = await pdfjsLib

.getDocument(path)

.promise;

totalPages =

pdf.numPages;

UI.totalPages.textContent =

totalPages;

currentPage =

Math.min(

STORAGE.page,

totalPages

);

await playBookAnimation();

await renderBook();

toast(

"Book Loaded"

);

}

catch(error){

console.error(error);

toast(

"Unable to load PDF."

);

}

}

/* ==========================================================
   BOOK OPEN ANIMATION
========================================================== */

async function playBookAnimation(){

UI.book.classList.remove(

"closed"

);

UI.book.classList.add(

"opening"

);

await sleep(1200);

UI.book.classList.remove(

"opening"

);

UI.book.classList.add(

"open"

);

}

/* ==========================================================
   SLEEP
========================================================== */

function sleep(ms){

return new Promise(

resolve=>

setTimeout(

resolve,

ms

)

);

}
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 7 OF 40
   reader.js
   Render PDF Pages
========================================================== */

/* ==========================================================
   RENDER BOOK
========================================================== */

async function renderBook(){

if(rendering){

renderPending = true;

return;

}

rendering = true;

if(singlePage){

await renderSinglePage();

}

else{

await renderSpread();

}

rendering = false;

if(renderPending){

renderPending = false;

renderBook();

}

}

/* ==========================================================
   RENDER TWO PAGES
========================================================== */

async function renderSpread(){

const leftPage =

currentPage % 2 === 0 ?

currentPage :

Math.max(

1,

currentPage - 1

);

const rightPage =

leftPage + 1;

await drawPage(

leftPage,

UI.leftCanvas,

leftCtx

);

if(rightPage <= totalPages){

await drawPage(

rightPage,

UI.rightCanvas,

rightCtx

);

}

else{

rightCtx.clearRect(

0,

0,

UI.rightCanvas.width,

UI.rightCanvas.height

);

}

updatePageUI();

}

/* ==========================================================
   RENDER SINGLE PAGE
========================================================== */

async function renderSinglePage(){

UI.leftCanvas.parentElement.style.display =

"none";

UI.rightCanvas.parentElement.style.width =

"100%";

await drawPage(

currentPage,

UI.rightCanvas,

rightCtx

);

updatePageUI();

}

/* ==========================================================
   DRAW PDF PAGE
========================================================== */

async function drawPage(

pageNumber,

canvas,

ctx

){

const page =

await pdf.getPage(

pageNumber

);

const viewport =

page.getViewport({

scale:zoom,

rotation

});

canvas.width =

viewport.width;

canvas.height =

viewport.height;

await page.render({

canvasContext:ctx,

viewport

}).promise;

drawWatermark(

ctx,

canvas

);

}
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 8 OF 40
   reader.js
   Navigation + Page Controls
========================================================== */

/* ==========================================================
   NEXT PAGE
========================================================== */

async function nextPage(){

if(rendering) return;

if(singlePage){

if(currentPage>=totalPages)

return;

currentPage++;

}

else{

if(currentPage+2>totalPages)

return;

currentPage+=2;

}

saveReadingState();

await renderBook();

}

/* ==========================================================
   PREVIOUS PAGE
========================================================== */

async function previousPage(){

if(rendering) return;

if(singlePage){

if(currentPage<=1)

return;

currentPage--;

}

else{

if(currentPage<=2)

return;

currentPage-=2;

}

saveReadingState();

await renderBook();

}

/* ==========================================================
   GO TO PAGE
========================================================== */

async function goToPage(page){

page=

parseInt(page);

if(isNaN(page))

return;

if(page<1)

page=1;

if(page>totalPages)

page=totalPages;

currentPage=page;

saveReadingState();

await renderBook();

}

/* ==========================================================
   FIRST PAGE
========================================================== */

async function firstPage(){

currentPage=1;

saveReadingState();

await renderBook();

}

/* ==========================================================
   LAST PAGE
========================================================== */

async function lastPage(){

currentPage=totalPages;

saveReadingState();

await renderBook();

}

/* ==========================================================
   PAGE UI
========================================================== */

function updatePageUI(){

UI.pageInput.value=

currentPage;

UI.totalPages.textContent=

totalPages;

}

/* ==========================================================
   SAVE STATE
========================================================== */

function saveReadingState(){

localStorage.setItem(

"reader-page",

currentPage

);

}

/* ==========================================================
   PAGE INPUT
========================================================== */

UI.pageInput.addEventListener(

"change",

e=>{

goToPage(

e.target.value

);

}

/* ==========================================================
   NAVIGATION BUTTONS
========================================================== */

);

UI.nextPage.onclick=

nextPage;

UI.previousPage.onclick=

previousPage;

UI.firstPage.onclick=

firstPage;

UI.lastPage.onclick=

lastPage;

/* ==========================================================
   KEYBOARD
========================================================== */

document.addEventListener(

"keydown",

event=>{

switch(event.key){

case "ArrowRight":

nextPage();

break;

case "ArrowLeft":

previousPage();

break;

case "Home":

firstPage();

break;

case "End":

lastPage();

break;

}

});
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 9 OF 40
   reader.js
   Zoom + Rotation + Fullscreen
========================================================== */

/* ==========================================================
   ZOOM IN
========================================================== */

async function zoomIn(){

if(zoom>=3)

return;

zoom+=0.1;

zoom=

Number(

zoom.toFixed(1)

);

UI.zoomValue.textContent=

Math.round(

zoom*100

)+"%";

localStorage.setItem(

"reader-zoom",

zoom

);

await renderBook();

}

/* ==========================================================
   ZOOM OUT
========================================================== */

async function zoomOut(){

if(zoom<=0.5)

return;

zoom-=0.1;

zoom=

Number(

zoom.toFixed(1)

);

UI.zoomValue.textContent=

Math.round(

zoom*100

)+"%";

localStorage.setItem(

"reader-zoom",

zoom

);

await renderBook();

}

/* ==========================================================
   ROTATE
========================================================== */

async function rotateBook(){

rotation+=90;

if(rotation>=360)

rotation=0;

await renderBook();

}

/* ==========================================================
   FULLSCREEN
========================================================== */

async function toggleFullscreen(){

if(

!document.fullscreenElement

){

await document.documentElement

.requestFullscreen();

}

else{

await document

.exitFullscreen();

}

}

/* ==========================================================
   FULLSCREEN ICON
========================================================== */

document.addEventListener(

"fullscreenchange",

()=>{

const icon=

UI.fullscreenButton

.querySelector("i");

if(document.fullscreenElement){

icon.className=

"ri-fullscreen-exit-line";

}

else{

icon.className=

"ri-fullscreen-line";

}

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

);

UI.zoomIn.onclick=

zoomIn;

UI.zoomOut.onclick=

zoomOut;

UI.rotateBook.onclick=

rotateBook;

UI.fullscreenButton.onclick=

toggleFullscreen;

/* ==========================================================
   MOUSE WHEEL ZOOM
========================================================== */

UI.bookStage.addEventListener(

"wheel",

event=>{

if(

!event.ctrlKey

)

return;

event.preventDefault();

if(event.deltaY<0)

zoomIn();

else

zoomOut();

},

{

passive:false

}

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 10 OF 40
   reader.js
   Search Engine + Search Highlight
========================================================== */

/* ==========================================================
   SEARCH STATE
========================================================== */

let searchText="";

let searchMatches=[];

let activeMatch=0;

/* ==========================================================
   SEARCH
========================================================== */

async function searchBook(text){

searchText=

text.trim();

searchMatches=[];

activeMatch=0;

if(

searchText===""

){

clearSearch();

return;

}

for(

let pageNo=1;

pageNo<=totalPages;

pageNo++

){

const page=

await pdf.getPage(

pageNo

);

const content=

await page.getTextContent();

const textItems=

content.items;

textItems.forEach(

item=>{

if(

item.str

.toLowerCase()

.includes(

searchText

.toLowerCase()

)

){

searchMatches.push({

page:pageNo,

text:item.str

});

}

}

);

}

toast(

searchMatches.length+

" result(s) found"

);

if(

searchMatches.length

){

goToSearchResult(

0

);

}

}

/* ==========================================================
   OPEN SEARCH RESULT
========================================================== */

async function goToSearchResult(index){

if(

!searchMatches.length

)

return;

activeMatch=

index;

currentPage=

searchMatches[index].page;

await renderBook();

}

/* ==========================================================
   NEXT RESULT
========================================================== */

function nextSearchResult(){

if(

!searchMatches.length

)

return;

activeMatch++;

if(

activeMatch>=

searchMatches.length

){

activeMatch=0;

}

goToSearchResult(

activeMatch

);

}

/* ==========================================================
   PREVIOUS RESULT
========================================================== */

function previousSearchResult(){

if(

!searchMatches.length

)

return;

activeMatch--;

if(

activeMatch<0

){

activeMatch=

searchMatches.length-1;

}

goToSearchResult(

activeMatch

);

}

/* ==========================================================
   CLEAR SEARCH
========================================================== */

function clearSearch(){

searchText="";

searchMatches=[];

activeMatch=0;

}

/* ==========================================================
   SEARCH INPUT
========================================================== */

UI.searchInput

.addEventListener(

"keydown",

event=>{

if(

event.key==="Enter"

){

searchBook(

UI.searchInput.value

);

}

}

);

/* ==========================================================
   CTRL + F
========================================================== */

document

.addEventListener(

"keydown",

event=>{

if(

event.ctrlKey &&

event.key==="f"

){

event.preventDefault();

UI.searchInput.focus();

UI.searchInput.select();

}

}

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 11 OF 40
   reader.js
   Themes + Settings + Single/Double Page
========================================================== */

/* ==========================================================
   THEMES
========================================================== */

const THEMES=[

"maroon",

"light",

"dark",

"sepia",

"emerald",

"midnight"

];

/* ==========================================================
   APPLY THEME
========================================================== */

function applyTheme(theme){

if(

!THEMES.includes(theme)

)

return;

document.documentElement

.dataset.theme=

theme;

localStorage.setItem(

"reader-theme",

theme

);

}

/* ==========================================================
   THEME BUTTONS
========================================================== */

document

.querySelectorAll(

"[data-theme]"

)

.forEach(

button=>{

button.onclick=()=>{

applyTheme(

button.dataset.theme

);

};

}

);

/* ==========================================================
   SINGLE PAGE MODE
========================================================== */

function enableSinglePage(){

singlePage=true;

UI.leftCanvas.parentElement

.style.display="none";

UI.rightCanvas.parentElement

.style.width="100%";

renderBook();

}

/* ==========================================================
   DOUBLE PAGE MODE
========================================================== */

function enableDoublePage(){

singlePage=false;

UI.leftCanvas.parentElement

.style.display="block";

UI.rightCanvas.parentElement

.style.width="50%";

renderBook();

}

/* ==========================================================
   TOGGLE MODE
========================================================== */

function togglePageMode(){

singlePage=

!singlePage;

localStorage.setItem(

"reader-single-page",

singlePage

);

if(singlePage){

enableSinglePage();

}

else{

enableDoublePage();

}

}

/* ==========================================================
   LOAD SETTINGS
========================================================== */

(function(){

const mode=

localStorage.getItem(

"reader-single-page"

);

if(mode==="true"){

singlePage=true;

}

})();

/* ==========================================================
   SETTINGS BUTTON
========================================================== */

UI.settingButton.onclick=()=>{

UI.settingsPanel

.classList.toggle(

"active"

);

};

/* ==========================================================
   THEME BUTTON
========================================================== */

UI.themeButton.onclick=()=>{

UI.themePanel

.classList.toggle(

"active"

);

};

/* ==========================================================
   ESC CLOSE
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(event.key==="Escape"){

document

.querySelectorAll(

".panel"

)

.forEach(

panel=>{

panel.classList.remove(

"active"

);

}

);

}

});
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 12 OF 40
   reader.js
   Bookmarks + Reading Progress + Session
========================================================== */

/* ==========================================================
   BOOKMARKS
========================================================== */

let bookmarks=

JSON.parse(

localStorage.getItem(

"reader-bookmarks"

)

||

"[]"

);

/* ==========================================================
   SAVE BOOKMARKS
========================================================== */

function saveBookmarks(){

localStorage.setItem(

"reader-bookmarks",

JSON.stringify(

bookmarks

)

);

}

/* ==========================================================
   TOGGLE BOOKMARK
========================================================== */

function toggleBookmark(){

const index=

bookmarks.indexOf(

currentPage

);

if(index===-1){

bookmarks.push(

currentPage

);

bookmarks.sort(

(a,b)=>a-b

);

toast(

"Bookmark Added"

);

}

else{

bookmarks.splice(

index,

1

);

toast(

"Bookmark Removed"

);

}

saveBookmarks();

renderBookmarks();

}

/* ==========================================================
   RENDER BOOKMARKS
========================================================== */

function renderBookmarks(){

const container=

document.getElementById(

"bookmarkList"

);

if(!container)

return;

container.innerHTML="";

if(

bookmarks.length===0

){

container.innerHTML=

"<p>No bookmarks.</p>";

return;

}

bookmarks.forEach(

page=>{

const item=

document.createElement(

"button"

);

item.textContent=

"Page "+page;

item.onclick=()=>{

goToPage(page);

UI.bookmarkPanel

.classList.remove(

"active"

);

};

container.appendChild(

item

);

}

);

}

/* ==========================================================
   READING PROGRESS
========================================================== */

function updateProgress(){

if(!totalPages)

return;

const progress=

Math.round(

(currentPage/

totalPages)

*100

);

document.title=

`(${progress}%) CHISHTI BOOK READER`;

}

/* ==========================================================
   SESSION
========================================================== */

function saveSession(){

localStorage.setItem(

"reader-page",

currentPage

);

localStorage.setItem(

"reader-zoom",

zoom

);

localStorage.setItem(

"reader-rotation",

rotation

);

}

function restoreSession(){

const page=

parseInt(

localStorage.getItem(

"reader-page"

)

);

const rotate=

parseInt(

localStorage.getItem(

"reader-rotation"

)

);

if(!isNaN(page))

currentPage=page;

if(!isNaN(rotate))

rotation=rotate;

}

/* ==========================================================
   AUTO SAVE
========================================================== */

window.addEventListener(

"beforeunload",

saveSession

);

/* ==========================================================
   BOOKMARK BUTTON
========================================================== */

UI.bookmarkButton.onclick=()=>{

toggleBookmark();

};

/* ==========================================================
   UPDATE AFTER PAGE CHANGE
========================================================== */

const originalRenderBook=

renderBook;

renderBook=

async function(){

await originalRenderBook();

updateProgress();

renderBookmarks();

saveSession();

};
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 13 OF 40
   reader.js
   Toast + Loader + Watermark + Utilities
========================================================== */

/* ==========================================================
   TOAST
========================================================== */

function toast(message,type="success"){

const toast=

document.createElement(

"div"

);

toast.className=

"toast "+type;

toast.textContent=

message;

UI.toastContainer.appendChild(

toast

);

setTimeout(

()=>{

toast.classList.add(

"show"

);

},

20

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

3000

);

}

/* ==========================================================
   LOADER
========================================================== */

function showLoader(){

if(

UI.loader

)

UI.loader.style.display=

"flex";

}

function hideLoader(){

if(

!UI.loader

)

return;

setTimeout(

()=>{

UI.loader.style.display=

"none";

},

500

);

}

/* ==========================================================
   WATERMARK
========================================================== */

function drawWatermark(

ctx,

canvas

){

ctx.save();

ctx.font=

"14px Poppins";

ctx.fillStyle=

"rgba(0,0,0,.18)";

ctx.textAlign=

"center";

ctx.fillText(

"www.chishtilibrary.com",

canvas.width/2,

canvas.height-18

);

ctx.restore();

}

/* ==========================================================
   CLOSE PANELS
========================================================== */

function closePanels(){

document

.querySelectorAll(

".panel"

)

.forEach(

panel=>{

panel.classList.remove(

"active"

);

}

);

}

/* ==========================================================
   CLICK OUTSIDE
========================================================== */

document.addEventListener(

"click",

event=>{

if(

event.target.classList.contains(

"panel"

)

){

closePanels();

}

}

/* ==========================================================
   WINDOW RESIZE
========================================================== */

);

window.addEventListener(

"resize",

()=>{

if(pdf)

renderBook();

}

/* ==========================================================
   ERROR
========================================================== */

);

window.addEventListener(

"error",

event=>{

console.error(

event.error

);

toast(

"Unexpected Error",

"error"

);

}

/* ==========================================================
   READY
========================================================== */

);

console.log(

"CHISHTI BOOK READER Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 14 OF 40
   reader.js
   Theme Manager + Theme Panel
========================================================== */

/* ==========================================================
   THEME DATA
========================================================== */

const THEME_DATA={

maroon:{
name:"Maroon",
color:"#651111"
},

light:{
name:"Light",
color:"#ffffff"
},

dark:{
name:"Dark",
color:"#111111"
},

sepia:{
name:"Sepia",
color:"#f4ecd8"
},

emerald:{
name:"Emerald",
color:"#0f5c4b"
},

midnight:{
name:"Midnight",
color:"#16213e"
}

};

/* ==========================================================
   CREATE THEME PANEL
========================================================== */

function buildThemePanel(){

if(

!UI.themePanel

)

return;

UI.themePanel.innerHTML=

"<h2>Themes</h2>";

Object.entries(

THEME_DATA

).forEach(

([key,value])=>{

const button=

document.createElement(

"button"

);

button.className=

"theme-item";

button.dataset.theme=

key;

button.innerHTML=

`
<div
style="
display:flex;
align-items:center;
gap:12px;
">

<div
style="
width:22px;
height:22px;
border-radius:50%;
background:${value.color};
border:2px solid #ddd;
">
</div>

<span>

${value.name}

</span>

</div>
`;

button.onclick=()=>{

applyTheme(

key

);

highlightTheme();

toast(

value.name+

" Theme Applied"

);

};

UI.themePanel

.appendChild(

button

);

}

);

}

/* ==========================================================
   HIGHLIGHT ACTIVE
========================================================== */

function highlightTheme(){

document

.querySelectorAll(

".theme-item"

)

.forEach(

button=>{

button.classList.remove(

"active"

);

if(

button.dataset.theme===

document.documentElement

.dataset.theme

){

button.classList.add(

"active"

);

}

}

);

}

/* ==========================================================
   LOAD SAVED THEME
========================================================== */

(function(){

applyTheme(

STORAGE.theme

);

setTimeout(

()=>{

buildThemePanel();

highlightTheme();

},

100

);

})();
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 15 OF 40
   reader.js
   Settings Panel + Reading Preferences
========================================================== */

/* ==========================================================
   BUILD SETTINGS PANEL
========================================================== */

function buildSettingsPanel(){

if(!UI.settingsPanel)

return;

UI.settingsPanel.innerHTML=`

<h2>

Settings

</h2>

<label>

<span>

Single Page Mode

</span>

<input

id="singlePageSwitch"

type="checkbox"

${singlePage?"checked":""}>

</label>

<label>

<span>

Enable Watermark

</span>

<input

id="watermarkSwitch"

type="checkbox"

checked>

</label>

<label>

<span>

Open In Fullscreen

</span>

<input

id="fullscreenSwitch"

type="checkbox">

</label>

<label>

<span>

Smooth Animation

</span>

<input

id="animationSwitch"

type="checkbox"

checked>

</label>

<label>

<span>

Show Shadows

</span>

<input

id="shadowSwitch"

type="checkbox"

checked>

</label>

<hr>

<button

id="resetReader">

Reset Reader

</button>

`;

bindSettings();

}

/* ==========================================================
   SETTINGS EVENTS
========================================================== */

function bindSettings(){

const single=

document.getElementById(

"singlePageSwitch"

);

const watermark=

document.getElementById(

"watermarkSwitch"

);

const fullscreen=

document.getElementById(

"fullscreenSwitch"

);

const animation=

document.getElementById(

"animationSwitch"

);

const shadow=

document.getElementById(

"shadowSwitch"

);

const reset=

document.getElementById(

"resetReader"

);

single.onchange=()=>{

togglePageMode();

};

watermark.onchange=e=>{

window.readerWatermark=

e.target.checked;

renderBook();

};

fullscreen.onchange=e=>{

localStorage.setItem(

"reader-auto-fullscreen",

e.target.checked

);

};

animation.onchange=e=>{

localStorage.setItem(

"reader-animation",

e.target.checked

);

};

shadow.onchange=e=>{

UI.bookStage.classList.toggle(

"no-shadow",

!e.target.checked

);

};

reset.onclick=resetReader;

}

/* ==========================================================
   RESET
========================================================== */

function resetReader(){

localStorage.removeItem(

"reader-page"

);

localStorage.removeItem(

"reader-zoom"

);

localStorage.removeItem(

"reader-theme"

);

localStorage.removeItem(

"reader-single-page"

);

localStorage.removeItem(

"reader-bookmarks"

);

currentPage=1;

zoom=1.2;

rotation=0;

singlePage=false;

bookmarks=[];

applyTheme(

"maroon"

);

renderBookmarks();

renderBook();

toast(

"Reader Reset Successfully"

);

}

/* ==========================================================
   INITIALIZE
========================================================== */

setTimeout(

()=>{

buildSettingsPanel();

},

100);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 16 OF 40
   reader.js
   Mobile Gestures + Swipe + Pinch Zoom
========================================================== */

/* ==========================================================
   TOUCH STATE
========================================================== */

let touchStartX=0;

let touchStartY=0;

let touchEndX=0;

let touchEndY=0;

let pinchDistance=0;

let isPinching=false;

/* ==========================================================
   DISTANCE
========================================================== */

function getDistance(t1,t2){

const dx=

t1.clientX-

t2.clientX;

const dy=

t1.clientY-

t2.clientY;

return Math.sqrt(

dx*dx+

dy*dy

);

}

/* ==========================================================
   TOUCH START
========================================================== */

UI.bookStage.addEventListener(

"touchstart",

event=>{

if(

event.touches.length===1

){

touchStartX=

event.touches[0].clientX;

touchStartY=

event.touches[0].clientY;

isPinching=false;

}

if(

event.touches.length===2

){

isPinching=true;

pinchDistance=

getDistance(

event.touches[0],

event.touches[1]

);

}

},

{

passive:true

}

);

/* ==========================================================
   TOUCH MOVE
========================================================== */

UI.bookStage.addEventListener(

"touchmove",

event=>{

if(

!isPinching ||

event.touches.length!==2

)

return;

const currentDistance=

getDistance(

event.touches[0],

event.touches[1]

);

if(

currentDistance>

pinchDistance+20

){

zoomIn();

pinchDistance=

currentDistance;

}

else if(

currentDistance<

pinchDistance-20

){

zoomOut();

pinchDistance=

currentDistance;

}

},

{

passive:true

}

);

/* ==========================================================
   TOUCH END
========================================================== */

UI.bookStage.addEventListener(

"touchend",

event=>{

if(

isPinching

)

return;

touchEndX=

event.changedTouches[0].clientX;

touchEndY=

event.changedTouches[0].clientY;

handleSwipe();

},

{

passive:true

}

);

/* ==========================================================
   HANDLE SWIPE
========================================================== */

function handleSwipe(){

const dx=

touchEndX-

touchStartX;

const dy=

Math.abs(

touchEndY-

touchStartY

);

if(

dy>80

)

return;

if(

Math.abs(dx)<70

)

return;

if(dx<0){

nextPage();

}

else{

previousPage();

}

}

/* ==========================================================
   DOUBLE TAP
========================================================== */

let lastTap=0;

UI.bookStage.addEventListener(

"touchend",

()=>{

const now=

Date.now();

if(

now-lastTap<300

){

if(

zoom===1.2

){

zoom=2;

}

else{

zoom=1.2;

}

UI.zoomValue.textContent=

Math.round(

zoom*100

)+"%";

renderBook();

}

lastTap=now;

},

{

passive:true

}

);

/* ==========================================================
   MOBILE READY
========================================================== */

console.log(

"Mobile Gestures Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 17 OF 40
   reader.js
   Table of Contents + Thumbnail Sidebar
========================================================== */

/* ==========================================================
   TOC
========================================================== */

let tableOfContents=[];

/* ==========================================================
   LOAD TOC
========================================================== */

async function loadTOC(){

if(!pdf)

return;

try{

const outline=

await pdf.getOutline();

tableOfContents=

outline||[];

renderTOC();

}

catch(error){

console.error(error);

}

}

/* ==========================================================
   RENDER TOC
========================================================== */

async function renderTOC(){

const container=

document.getElementById(

"tocList"

);

if(!container)

return;

container.innerHTML="";

if(

tableOfContents.length===0

){

container.innerHTML=

"<p>No Table of Contents</p>";

return;

}

tableOfContents.forEach(

(item,index)=>{

const button=

document.createElement(

"button"

);

button.className=

"toc-item";

button.textContent=

item.title||

`Chapter ${index+1}`;

button.onclick=

async()=>{

if(

!item.dest

)

return;

const destination=

await pdf.getDestination(

item.dest

);

const reference=

destination[0];

const page=

await pdf.getPageIndex(

reference

);

goToPage(

page+1

);

UI.tocPanel.classList.remove(

"active"

);

};

container.appendChild(

button

);

}

);

}

/* ==========================================================
   THUMBNAILS
========================================================== */

async function renderThumbnails(){

const container=

document.getElementById(

"thumbnailList"

);

if(!container)

return;

container.innerHTML="";

for(

let pageNo=1;

pageNo<=totalPages;

pageNo++

){

const page=

await pdf.getPage(

pageNo

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

await page.render({

canvasContext:

canvas.getContext("2d"),

viewport

}).promise;

canvas.className=

"thumbnail";

canvas.title=

"Page "+pageNo;

canvas.onclick=()=>{

goToPage(pageNo);

UI.tocPanel.classList.remove(

"active"

);

};

container.appendChild(

canvas

);

}

}

/* ==========================================================
   TOC BUTTON
========================================================== */

UI.bookmarkButton.addEventListener(

"contextmenu",

event=>{

event.preventDefault();

UI.tocPanel.classList.toggle(

"active"

);

}

/* ==========================================================
   LOAD AFTER PDF
========================================================== */

);

const originalOpenPDF=

openPDF;

openPDF=

async function(path){

await originalOpenPDF(path);

await loadTOC();

await renderThumbnails();

};
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 18 OF 40
   reader.js
   Auto Save + Resume Reading + Recent Books
========================================================== */

/* ==========================================================
   RECENT BOOKS
========================================================== */

let recentBooks=

JSON.parse(

localStorage.getItem(

"reader-recent-books"

)

||

"[]"

);

/* ==========================================================
   CURRENT BOOK
========================================================== */

function currentBookName(){

const params=

new URLSearchParams(

window.location.search

);

return params.get(

"book"

)||"Unknown";

}

/* ==========================================================
   SAVE RECENT
========================================================== */

function saveRecentBook(){

const book=

currentBookName();

recentBooks=

recentBooks.filter(

item=>item.name!==book

);

recentBooks.unshift({

name:book,

page:currentPage,

time:Date.now()

});

recentBooks=

recentBooks.slice(

0,

15

);

localStorage.setItem(

"reader-recent-books",

JSON.stringify(

recentBooks

)

);

}

/* ==========================================================
   RESTORE PAGE
========================================================== */

function restoreLastPage(){

const book=

currentBookName();

const recent=

recentBooks.find(

item=>

item.name===book

);

if(

!recent

)

return;

currentPage=

Math.min(

recent.page,

totalPages

);

}

/* ==========================================================
   AUTO SAVE
========================================================== */

setInterval(

()=>{

if(

!pdf

)

return;

saveRecentBook();

saveSession();

},

5000

);

/* ==========================================================
   PAGE CHANGE
========================================================== */

const originalGoToPage=

goToPage;

goToPage=

async function(page){

await originalGoToPage(

page

);

saveRecentBook();

};

/* ==========================================================
   NEXT
========================================================== */

const originalNextPage=

nextPage;

nextPage=

async function(){

await originalNextPage();

saveRecentBook();

};

/* ==========================================================
   PREVIOUS
========================================================== */

const originalPreviousPage=

previousPage;

previousPage=

async function(){

await originalPreviousPage();

saveRecentBook();

};

/* ==========================================================
   AFTER PDF LOAD
========================================================== */

const openPDFResume=

openPDF;

openPDF=

async function(path){

await openPDFResume(

path

);

restoreLastPage();

await renderBook();

};

/* ==========================================================
   BEFORE CLOSE
========================================================== */

window.addEventListener(

"beforeunload",

()=>{

saveRecentBook();

saveSession();

}

);

/* ==========================================================
   READY
========================================================== */

console.log(

"Resume Reading Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 19 OF 40
   reader.js
   Page Flip Animation + Real Book Effect
========================================================== */

/* ==========================================================
   FLIP STATE
========================================================== */

let flipping=false;

/* ==========================================================
   FLIP RIGHT
========================================================== */

async function flipNext(){

if(flipping||rendering)

return;

flipping=true;

UI.book.classList.add(

"flip-next"

);

await sleep(420);

await nextPage();

UI.book.classList.remove(

"flip-next"

);

flipping=false;

}

/* ==========================================================
   FLIP LEFT
========================================================== */

async function flipPrevious(){

if(flipping||rendering)

return;

flipping=true;

UI.book.classList.add(

"flip-prev"

);

await sleep(420);

await previousPage();

UI.book.classList.remove(

"flip-prev"

);

flipping=false;

}

/* ==========================================================
   BUTTONS
========================================================== */

UI.nextPage.onclick=

flipNext;

UI.previousPage.onclick=

flipPrevious;

/* ==========================================================
   KEYBOARD
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.target.tagName==="INPUT"

)

return;

switch(event.key){

case "ArrowRight":

event.preventDefault();

flipNext();

break;

case "ArrowLeft":

event.preventDefault();

flipPrevious();

break;

}

});

/* ==========================================================
   SWIPE SUPPORT
========================================================== */

handleSwipe=function(){

const dx=

touchEndX-touchStartX;

const dy=

Math.abs(

touchEndY-touchStartY

);

if(dy>80)

return;

if(Math.abs(dx)<70)

return;

if(dx<0)

flipNext();

else

flipPrevious();

};

/* ==========================================================
   BOOK CLICK
========================================================== */

UI.book.addEventListener(

"click",

()=>{

UI.book.classList.add(

"focus"

);

setTimeout(

()=>{

UI.book.classList.remove(

"focus"

);

},

250

);

});

/* ==========================================================
   SHADOW EFFECT
========================================================== */

function animateShadow(){

const shadow=

document.querySelector(

".book-shadow"

);

if(!shadow)

return;

shadow.style.transform=

"translateX(-50%) scale(1.08)";

setTimeout(

()=>{

shadow.style.transform=

"translateX(-50%) scale(1)";

},

300

);

}

/* ==========================================================
   PATCH
========================================================== */

const _flipNext=

flipNext;

flipNext=

async function(){

animateShadow();

await _flipNext();

};

const _flipPrevious=

flipPrevious;

flipPrevious=

async function(){

animateShadow();

await _flipPrevious();

};

/* ==========================================================
   READY
========================================================== */

console.log(

"Page Flip Animation Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 20 OF 40
   reader.js
   Keyboard Shortcuts + Mouse Controls
========================================================== */

/* ==========================================================
   SHORTCUTS
========================================================== */

document.addEventListener(

"keydown",

async event=>{

if(

event.target.tagName==="INPUT" ||

event.target.tagName==="TEXTAREA"

)

return;

switch(event.key){

case "+":

case "=":

event.preventDefault();

zoomIn();

break;

case "-":

event.preventDefault();

zoomOut();

break;

case "0":

event.preventDefault();

zoom=1.2;

UI.zoomValue.textContent="120%";

renderBook();

break;

case "r":

case "R":

event.preventDefault();

rotateBook();

break;

case "b":

case "B":

event.preventDefault();

toggleBookmark();

break;

case "t":

case "T":

event.preventDefault();

UI.themePanel.classList.toggle(

"active"

);

break;

case "s":

case "S":

event.preventDefault();

UI.settingsPanel.classList.toggle(

"active"

);

break;

case "f":

case "F":

if(event.ctrlKey)

return;

event.preventDefault();

toggleFullscreen();

break;

case "Escape":

closePanels();

break;

}

});

/* ==========================================================
   DOUBLE CLICK
========================================================== */

UI.bookStage.addEventListener(

"dblclick",

()=>{

if(

zoom===1.2

){

zoom=2;

}

else{

zoom=1.2;

}

UI.zoomValue.textContent=

Math.round(

zoom*100

)+"%";

renderBook();

}

);

/* ==========================================================
   CONTEXT MENU
========================================================== */

UI.bookStage.addEventListener(

"contextmenu",

event=>{

event.preventDefault();

UI.settingsPanel.classList.toggle(

"active"

);

}

/* ==========================================================
   MOUSE SIDE BUTTONS
========================================================== */

);

UI.bookStage.addEventListener(

"mouseup",

event=>{

if(event.button===3)

flipPrevious();

if(event.button===4)

flipNext();

}

/* ==========================================================
   SPACEBAR
========================================================== */

);

document.addEventListener(

"keydown",

event=>{

if(

event.code!=="Space"

)

return;

event.preventDefault();

flipNext();

}

/* ==========================================================
   HOME END
========================================================== */

);

document.addEventListener(

"keydown",

event=>{

if(

event.key==="Home"

){

firstPage();

}

if(

event.key==="End"

){

lastPage();

}

}

/* ==========================================================
   READY
========================================================== */

);

console.log(

"Keyboard Shortcuts Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 21 OF 40
   reader.js
   Real Book Cover + Open Animation + Dynamic Cover
========================================================== */

/* ==========================================================
   BOOK INFO
========================================================== */

let currentBook={

title:"",

author:"",

cover:"",

file:""

};

/* ==========================================================
   LOAD BOOK INFO
========================================================== */

async function loadBookInformation(){

const params=

new URLSearchParams(

window.location.search

);

const file=

params.get(

"book"

);

if(!file)

return;

try{

const response=

await fetch(

"books.json"

);

const books=

await response.json();

const found=

books.find(

book=>book.pdf===file

);

if(!found)

return;

currentBook=

found;

renderBookCover();

document.title=

found.title+

" | CHISHTI BOOK READER";

}

catch(error){

console.error(error);

}

}

/* ==========================================================
   BOOK COVER
========================================================== */

function renderBookCover(){

const front=

document.querySelector(

".front-cover"

);

const back=

document.querySelector(

".back-cover"

);

if(!front)

return;

front.innerHTML=

`

<img

class="cover-image"

src="covers/${currentBook.cover}"

alt="${currentBook.title}"

>

<div class="cover-overlay">

<h2>

${currentBook.title}

</h2>

<p>

${currentBook.author}

</p>

</div>

`;

back.innerHTML=

`

<div class="back-cover-content">

<img

src="assets/logo.png"

class="back-logo"

>

<h3>

CHISHTI LIBRARY

</h3>

<p>

www.chishtilibrary.com

</p>

</div>

`;

}

/* ==========================================================
   OPEN EFFECT
========================================================== */

async function playOpeningSequence(){

UI.book.classList.remove(

"closed"

);

await sleep(

300

);

UI.book.classList.add(

"opening"

);

await sleep(

1400

);

UI.book.classList.remove(

"opening"

);

UI.book.classList.add(

"open"

);

}

/* ==========================================================
   PATCH PDF LOAD
========================================================== */

const originalOpenBook=

openPDF;

openPDF=

async function(path){

await loadBookInformation();

await originalOpenBook(path);

await playOpeningSequence();

};

/* ==========================================================
   COVER CLICK
========================================================== */

document.addEventListener(

"click",

event=>{

if(

event.target.closest(

".front-cover"

)

){

UI.book.classList.add(

"opening"

);

setTimeout(

()=>{

UI.book.classList.remove(

"opening"

);

},

1200

);

}

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Real Book Cover Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 22 OF 40
   reader.js
   Realistic Page Curl + Paper Shadow + Page Depth
========================================================== */

/* ==========================================================
   PAGE TURN
========================================================== */

async function animatePageTurn(direction){

if(flipping)

return;

flipping=true;

const page=

direction==="next"

?document.querySelector(".right-page")

:document.querySelector(".left-page");

page.classList.add(

direction==="next"

?

"page-curl-next"

:

"page-curl-prev"

);

UI.book.classList.add("book-turning");

animatePaperDepth();

await sleep(550);

if(direction==="next")

await nextPage();

else

await previousPage();

page.classList.remove(

"page-curl-next",

"page-curl-prev"

);

UI.book.classList.remove("book-turning");

resetPaperDepth();

flipping=false;

}

/* ==========================================================
   PAPER DEPTH
========================================================== */

function animatePaperDepth(){

UI.book.style.transform=

"translateY(-6px) scale(1.01)";

const shadow=

document.querySelector(

".book-shadow"

);

if(shadow){

shadow.style.filter=

"blur(40px)";

shadow.style.transform=

"translateX(-50%) scale(1.15)";

}

}

/* ==========================================================
   RESET DEPTH
========================================================== */

function resetPaperDepth(){

UI.book.style.transform="";

const shadow=

document.querySelector(

".book-shadow"

);

if(shadow){

shadow.style.filter=

"blur(28px)";

shadow.style.transform=

"translateX(-50%) scale(1)";

}

}

/* ==========================================================
   PAPER STACK
========================================================== */

function updatePaperStack(){

const left=

document.querySelector(".left-page");

const right=

document.querySelector(".right-page");

const leftPages=

Math.max(

0,

currentPage-1

);

const rightPages=

Math.max(

0,

totalPages-currentPage

);

left.style.boxShadow=

`

inset -12px 0 22px rgba(0,0,0,.12),

${Math.min(leftPages,12)}px 0 0 #f4efe6,

${Math.min(leftPages+2,14)}px 0 0 #ebe5d8

`;

right.style.boxShadow=

`

inset 12px 0 22px rgba(0,0,0,.12),

-${Math.min(rightPages,12)}px 0 0 #f4efe6,

-${Math.min(rightPages+2,14)}px 0 0 #ebe5d8

`;

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderBookOriginal=

renderBook;

renderBook=

async function(){

await renderBookOriginal();

updatePaperStack();

};

/* ==========================================================
   PATCH BUTTONS
========================================================== */

UI.nextPage.onclick=()=>{

animatePageTurn("next");

};

UI.previousPage.onclick=()=>{

animatePageTurn("prev");

};

/* ==========================================================
   KEYBOARD
========================================================== */

document.addEventListener(

"keydown",

e=>{

if(e.key==="ArrowRight"){

e.preventDefault();

animatePageTurn("next");

}

if(e.key==="ArrowLeft"){

e.preventDefault();

animatePageTurn("prev");

}

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Real Paper Animation Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 23 OF 40
   reader.js
   Reader Preferences + Auto Restore + Reading Modes
========================================================== */

/* ==========================================================
   DEFAULT PREFERENCES
========================================================== */

const DEFAULT_SETTINGS={

theme:"maroon",

zoom:1.2,

rotation:0,

singlePage:false,

watermark:true,

animation:true,

shadow:true,

fullscreen:false

};

/* ==========================================================
   SETTINGS
========================================================== */

let readerSettings=

JSON.parse(

localStorage.getItem(

"reader-settings"

)

||

JSON.stringify(

DEFAULT_SETTINGS

)

);

/* ==========================================================
   SAVE
========================================================== */

function saveReaderSettings(){

localStorage.setItem(

"reader-settings",

JSON.stringify(

readerSettings

)

);

}

/* ==========================================================
   RESTORE
========================================================== */

function restoreReaderSettings(){

applyTheme(

readerSettings.theme

);

zoom=

readerSettings.zoom;

rotation=

readerSettings.rotation;

singlePage=

readerSettings.singlePage;

window.readerWatermark=

readerSettings.watermark;

UI.zoomValue.textContent=

Math.round(

zoom*100

)+"%";

if(singlePage){

enableSinglePage();

}

else{

enableDoublePage();

}

}

/* ==========================================================
   UPDATE
========================================================== */

function updateSetting(

key,

value

){

readerSettings[key]=value;

saveReaderSettings();

}

/* ==========================================================
   PATCH THEME
========================================================== */

const originalApplyTheme=

applyTheme;

applyTheme=function(theme){

originalApplyTheme(theme);

updateSetting(

"theme",

theme

);

};

/* ==========================================================
   PATCH ZOOM
========================================================== */

const originalZoomIn=

zoomIn;

zoomIn=async function(){

await originalZoomIn();

updateSetting(

"zoom",

zoom

);

};

const originalZoomOut=

zoomOut;

zoomOut=async function(){

await originalZoomOut();

updateSetting(

"zoom",

zoom

);

};

/* ==========================================================
   PATCH ROTATION
========================================================== */

const originalRotate=

rotateBook;

rotateBook=async function(){

await originalRotate();

updateSetting(

"rotation",

rotation

);

};

/* ==========================================================
   PATCH PAGE MODE
========================================================== */

const originalToggle=

togglePageMode;

togglePageMode=function(){

originalToggle();

updateSetting(

"singlePage",

singlePage

);

};

/* ==========================================================
   AUTO RESTORE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

restoreReaderSettings();

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Reader Preferences Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 24 OF 40
   reader.js
   Ctrl+F Highlight + Search Navigation + Match Overlay
========================================================== */

/* ==========================================================
   SEARCH CACHE
========================================================== */

let searchResults=[];

let searchIndex=-1;

let searchLayer=[];

/* ==========================================================
   FIND TEXT
========================================================== */

async function findInBook(keyword){

keyword=keyword.trim();

searchResults=[];

searchIndex=-1;

clearHighlights();

if(keyword==="") return;

for(let p=1;p<=totalPages;p++){

const page=await pdf.getPage(p);

const text=await page.getTextContent();

text.items.forEach(item=>{

if(

item.str

.toLowerCase()

.includes(

keyword.toLowerCase()

)

){

searchResults.push({

page:p,

keyword,

x:item.transform[4],

y:item.transform[5],

width:item.width,

height:item.height

});

}

});

}

toast(

searchResults.length+

" Matches"

);

if(searchResults.length){

gotoMatch(0);

}

}

/* ==========================================================
   MATCH
========================================================== */

async function gotoMatch(index){

if(!searchResults.length)

return;

searchIndex=index;

currentPage=

searchResults[index].page;

await renderBook();

highlightCurrentMatch();

}

/* ==========================================================
   NEXT
========================================================== */

function nextMatch(){

if(!searchResults.length)

return;

searchIndex++;

if(searchIndex>=searchResults.length)

searchIndex=0;

gotoMatch(searchIndex);

}

/* ==========================================================
   PREVIOUS
========================================================== */

function previousMatch(){

if(!searchResults.length)

return;

searchIndex--;

if(searchIndex<0)

searchIndex=

searchResults.length-1;

gotoMatch(searchIndex);

}

/* ==========================================================
   HIGHLIGHT
========================================================== */

function highlightCurrentMatch(){

clearHighlights();

const result=

searchResults[searchIndex];

if(!result)

return;

const canvas=

singlePage

?UI.rightCanvas

:(result.page%2===0

?UI.leftCanvas

:UI.rightCanvas);

const ctx=

canvas.getContext("2d");

ctx.save();

ctx.strokeStyle="#ff0000";

ctx.lineWidth=3;

ctx.fillStyle="rgba(255,255,0,.35)";

ctx.fillRect(

result.x,

canvas.height-result.y,

result.width,

22

);

ctx.strokeRect(

result.x,

canvas.height-result.y,

result.width,

22

);

ctx.restore();

}

/* ==========================================================
   CLEAR
========================================================== */

function clearHighlights(){

searchLayer=[];

if(pdf)

renderBook();

}

/* ==========================================================
   SEARCH EVENTS
========================================================== */

UI.searchInput.addEventListener(

"keydown",

event=>{

if(event.key==="Enter"){

findInBook(

UI.searchInput.value

);

}

if(event.key==="ArrowDown"){

nextMatch();

}

if(event.key==="ArrowUp"){

previousMatch();

}

});

/* ==========================================================
   CTRL+F
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.ctrlKey &&

event.key==="f"

){

event.preventDefault();

UI.searchInput.focus();

UI.searchInput.select();

}

if(event.key==="F3"){

event.preventDefault();

nextMatch();

}

if(

event.shiftKey &&

event.key==="F3"

){

event.preventDefault();

previousMatch();

}

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Advanced Search Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 25 OF 40
   reader.js
   Real PDF Watermark + Page Number + Book Information
========================================================== */

/* ==========================================================
   PAGE FOOTER
========================================================== */

function drawPageFooter(

ctx,

canvas,

pageNumber

){

ctx.save();

ctx.beginPath();

ctx.moveTo(40,canvas.height-40);

ctx.lineTo(canvas.width-40,canvas.height-40);

ctx.strokeStyle="rgba(0,0,0,.12)";

ctx.lineWidth=1;

ctx.stroke();

ctx.font="15px Poppins";

ctx.fillStyle="rgba(0,0,0,.55)";

ctx.textAlign="left";

ctx.fillText(

currentBook.title||"",

40,

canvas.height-16

);

ctx.textAlign="center";

ctx.fillText(

"www.chishtilibrary.com",

canvas.width/2,

canvas.height-16

);

ctx.textAlign="right";

ctx.fillText(

pageNumber+"",

canvas.width-40,

canvas.height-16

);

ctx.restore();

}

/* ==========================================================
   DIAGONAL WATERMARK
========================================================== */

function drawDiagonalWatermark(

ctx,

canvas

){

if(

window.readerWatermark===false

)

return;

ctx.save();

ctx.translate(

canvas.width/2,

canvas.height/2

);

ctx.rotate(

-25*Math.PI/180

);

ctx.font="42px Poppins";

ctx.textAlign="center";

ctx.fillStyle="rgba(120,120,120,.08)";

ctx.fillText(

"CHISHTI LIBRARY",

0,

0

);

ctx.restore();

}

/* ==========================================================
   PATCH DRAW PAGE
========================================================== */

const originalDrawPage=

drawPage;

drawPage=

async function(

pageNumber,

canvas,

ctx

){

await originalDrawPage(

pageNumber,

canvas,

ctx

);

drawDiagonalWatermark(

ctx,

canvas

);

drawPageFooter(

ctx,

canvas,

pageNumber

);

};

/* ==========================================================
   BOOK INFO HEADER
========================================================== */

function updateBookHeader(){

const title=

document.getElementById(

"bookTitle"

);

const author=

document.getElementById(

"bookAuthor"

);

if(title)

title.textContent=

currentBook.title;

if(author)

author.textContent=

currentBook.author;

}

/* ==========================================================
   PATCH BOOK INFO
========================================================== */

const oldLoadBookInformation=

loadBookInformation;

loadBookInformation=

async function(){

await oldLoadBookInformation();

updateBookHeader();

};

/* ==========================================================
   DOCUMENT TITLE
========================================================== */

function updateWindowTitle(){

document.title=

`${currentBook.title} • Page ${currentPage} • CHISHTI BOOK READER`;

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const originalRender=

renderBook;

renderBook=

async function(){

await originalRender();

updateWindowTitle();

};

/* ==========================================================
   READY
========================================================== */

console.log(

"Professional PDF Footer Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 26 OF 40
   reader.js
   Auto Fit Screen + Responsive Scaling + Resize Observer
========================================================== */

/* ==========================================================
   AUTO SCALE
========================================================== */

function fitBookToScreen(){

if(!UI.book)

return;

const stage=

UI.bookStage;

const width=

stage.clientWidth;

const height=

stage.clientHeight;

const scaleX=

width/UI.book.offsetWidth;

const scaleY=

height/UI.book.offsetHeight;

const scale=

Math.min(

scaleX,

scaleY,

1

);

UI.book.style.transform=

`scale(${scale})`;

}

/* ==========================================================
   RESIZE OBSERVER
========================================================== */

const resizeObserver=

new ResizeObserver(

()=>{

fitBookToScreen();

}

);

resizeObserver.observe(

UI.bookStage

);

/* ==========================================================
   WINDOW RESIZE
========================================================== */

window.addEventListener(

"resize",

()=>{

fitBookToScreen();

});

/* ==========================================================
   ORIENTATION
========================================================== */

window.addEventListener(

"orientationchange",

()=>{

setTimeout(

()=>{

fitBookToScreen();

renderBook();

},

300

);

});

/* ==========================================================
   FULLSCREEN
========================================================== */

document.addEventListener(

"fullscreenchange",

()=>{

setTimeout(

fitBookToScreen,

300

);

});

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderBookFit=

renderBook;

renderBook=

async function(){

await renderBookFit();

fitBookToScreen();

};

/* ==========================================================
   CENTER BOOK
========================================================== */

function centerBook(){

UI.book.style.margin="auto";

UI.book.style.transformOrigin=

"center center";

}

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

centerBook();

fitBookToScreen();

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Responsive Book Scaling Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 27 OF 40
   reader.js
   Smooth Page Preloading + Cache Manager
========================================================== */

/* ==========================================================
   PAGE CACHE
========================================================== */

const PAGE_CACHE=

new Map();

const MAX_CACHE=

12;

/* ==========================================================
   GET PAGE
========================================================== */

async function getCachedPage(pageNumber){

if(

PAGE_CACHE.has(pageNumber)

){

return PAGE_CACHE.get(pageNumber);

}

const page=

await pdf.getPage(pageNumber);

PAGE_CACHE.set(

pageNumber,

page

);

cleanCache();

return page;

}

/* ==========================================================
   CACHE CLEAN
========================================================== */

function cleanCache(){

if(

PAGE_CACHE.size<=MAX_CACHE

)

return;

const firstKey=

PAGE_CACHE.keys().next().value;

PAGE_CACHE.delete(

firstKey

);

}

/* ==========================================================
   PRELOAD
========================================================== */

async function preloadPages(){

if(!pdf)

return;

const pages=[

currentPage-2,

currentPage-1,

currentPage+1,

currentPage+2,

currentPage+3

];

for(const page of pages){

if(

page<1 ||

page>totalPages

)

continue;

try{

await getCachedPage(page);

}

catch(e){}

}

}

/* ==========================================================
   PATCH DRAW PAGE
========================================================== */

const drawPageOriginal=

drawPage;

drawPage=

async function(

pageNumber,

canvas,

ctx

){

const page=

await getCachedPage(

pageNumber

);

const viewport=

page.getViewport({

scale:zoom,

rotation

});

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await page.render({

canvasContext:ctx,

viewport

}).promise;

if(

window.readerWatermark!==false

){

drawDiagonalWatermark(

ctx,

canvas

);

}

drawPageFooter(

ctx,

canvas,

pageNumber

);

};

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderBookCache=

renderBook;

renderBook=

async function(){

await renderBookCache();

preloadPages();

};

/* ==========================================================
   CLEAR CACHE
========================================================== */

function clearPageCache(){

PAGE_CACHE.clear();

}

/* ==========================================================
   ZOOM
========================================================== */

const zoomInCache=

zoomIn;

zoomIn=

async function(){

clearPageCache();

await zoomInCache();

};

const zoomOutCache=

zoomOut;

zoomOut=

async function(){

clearPageCache();

await zoomOutCache();

};

/* ==========================================================
   ROTATE
========================================================== */

const rotateCache=

rotateBook;

rotateBook=

async function(){

clearPageCache();

await rotateCache();

};

/* ==========================================================
   NEW BOOK
========================================================== */

const openPDFCache=

openPDF;

openPDF=

async function(path){

clearPageCache();

await openPDFCache(path);

};

/* ==========================================================
   READY
========================================================== */

console.log(

"Smart PDF Cache Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 28 OF 40
   reader.js
   Auto Hide UI + Reading Mode + Immersive Reader
========================================================== */

/* ==========================================================
   IMMERSIVE
========================================================== */

let immersiveMode=false;

let hideTimer=null;

/* ==========================================================
   SHOW UI
========================================================== */

function showReaderUI(){

document.querySelector(

".header"

).classList.remove(

"hide-ui"

);

document.querySelector(

".toolbar"

).classList.remove(

"hide-ui"

);

}

/* ==========================================================
   HIDE UI
========================================================== */

function hideReaderUI(){

if(!immersiveMode)

return;

document.querySelector(

".header"

).classList.add(

"hide-ui"

);

document.querySelector(

".toolbar"

).classList.add(

"hide-ui"

);

}

/* ==========================================================
   TIMER
========================================================== */

function resetHideTimer(){

clearTimeout(

hideTimer

);

showReaderUI();

if(!immersiveMode)

return;

hideTimer=

setTimeout(

()=>{

hideReaderUI();

},

2500

);

}

/* ==========================================================
   TOGGLE
========================================================== */

function toggleImmersiveMode(){

immersiveMode=

!immersiveMode;

document.body.classList.toggle(

"immersive",

immersiveMode

);

toast(

immersiveMode

?

"Immersive Mode Enabled"

:

"Immersive Mode Disabled"

);

resetHideTimer();

}

/* ==========================================================
   EVENTS
========================================================== */

[

"mousemove",

"touchstart",

"touchmove",

"click",

"keydown"

].forEach(eventName=>{

document.addEventListener(

eventName,

resetHideTimer,

{

passive:true

}

);

});

/* ==========================================================
   SHORTCUT
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.key==="i" ||

event.key==="I"

){

event.preventDefault();

toggleImmersiveMode();

}

});

/* ==========================================================
   DOUBLE CLICK
========================================================== */

UI.bookStage.addEventListener(

"dblclick",

()=>{

toggleImmersiveMode();

});

/* ==========================================================
   INITIALIZE
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

resetHideTimer();

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Immersive Reading Mode Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 29 OF 40
   reader.js
   Reading Statistics + Time Tracker + Progress Ring
========================================================== */

/* ==========================================================
   STATS
========================================================== */

let readingStats=

JSON.parse(

localStorage.getItem(

"reader-stats"

)

||

JSON.stringify({

minutes:0,

pages:0,

books:[]

})

);

let readingStarted=

Date.now();

/* ==========================================================
   SAVE
========================================================== */

function saveReadingStats(){

localStorage.setItem(

"reader-stats",

JSON.stringify(

readingStats

)

);

}

/* ==========================================================
   TIMER
========================================================== */

setInterval(

()=>{

const minutes=

Math.floor(

(Date.now()-readingStarted)/60000

);

readingStats.minutes=

minutes;

saveReadingStats();

},

60000

);

/* ==========================================================
   PAGE COUNT
========================================================== */

function recordPageRead(){

readingStats.pages++;

saveReadingStats();

}

/* ==========================================================
   BOOK HISTORY
========================================================== */

function recordBookHistory(){

const book=

currentBook.title||

currentBookName();

if(

!readingStats.books.includes(book)

){

readingStats.books.push(book);

saveReadingStats();

}

}

/* ==========================================================
   PATCH NEXT
========================================================== */

const nextStats=

nextPage;

nextPage=

async function(){

await nextStats();

recordPageRead();

};

/* ==========================================================
   PATCH PREVIOUS
========================================================== */

const previousStats=

previousPage;

previousPage=

async function(){

await previousStats();

recordPageRead();

};

/* ==========================================================
   PATCH OPEN
========================================================== */

const openStats=

openPDF;

openPDF=

async function(path){

await openStats(path);

recordBookHistory();

};

/* ==========================================================
   PROGRESS
========================================================== */

function updateReadingProgress(){

const ring=

document.getElementById(

"progressRing"

);

if(!ring)

return;

const percent=

Math.round(

(currentPage/totalPages)*100

);

ring.style.setProperty(

"--progress",

percent

);

const label=

document.getElementById(

"progressLabel"

);

if(label)

label.textContent=

percent+"%";

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderStats=

renderBook;

renderBook=

async function(){

await renderStats();

updateReadingProgress();

};

/* ==========================================================
   READING TIME
========================================================== */

function updateReadingClock(){

const clock=

document.getElementById(

"readingClock"

);

if(!clock)

return;

const minutes=

Math.floor(

(Date.now()-readingStarted)/60000

);

clock.textContent=

minutes+" min";

}

setInterval(

updateReadingClock,

1000

);

/* ==========================================================
   READY
========================================================== */

console.log(

"Reading Statistics Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 30 OF 40
   reader.js
   Mini Map + Page Slider + Quick Navigation
========================================================== */

/* ==========================================================
   PAGE SLIDER
========================================================== */

function initializePageSlider(){

const slider=

document.getElementById(

"pageSlider"

);

if(!slider)

return;

slider.min=1;

slider.max=totalPages;

slider.value=currentPage;

slider.oninput=()=>{

document.getElementById(

"sliderPage"

).textContent=

slider.value;

};

slider.onchange=()=>{

goToPage(

parseInt(

slider.value

)

);

};

}

/* ==========================================================
   UPDATE SLIDER
========================================================== */

function updatePageSlider(){

const slider=

document.getElementById(

"pageSlider"

);

if(!slider)

return;

slider.max=

totalPages;

slider.value=

currentPage;

const label=

document.getElementById(

"sliderPage"

);

if(label)

label.textContent=

currentPage;

}

/* ==========================================================
   MINI MAP
========================================================== */

function buildMiniMap(){

const map=

document.getElementById(

"miniMap"

);

if(!map)

return;

map.innerHTML="";

for(

let i=1;

i<=totalPages;

i++

){

const dot=

document.createElement(

"div"

);

dot.className=

"page-dot";

dot.dataset.page=i;

dot.onclick=()=>{

goToPage(i);

};

map.appendChild(

dot

);

}

updateMiniMap();

}

/* ==========================================================
   UPDATE MINI MAP
========================================================== */

function updateMiniMap(){

document

.querySelectorAll(

".page-dot"

)

.forEach(

dot=>{

dot.classList.toggle(

"active",

parseInt(

dot.dataset.page

)===currentPage

);

}

);

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderMiniMap=

renderBook;

renderBook=

async function(){

await renderMiniMap();

updateMiniMap();

updatePageSlider();

};

/* ==========================================================
   PATCH OPEN PDF
========================================================== */

const openMiniMap=

openPDF;

openPDF=

async function(path){

await openMiniMap(path);

initializePageSlider();

buildMiniMap();

};

/* ==========================================================
   QUICK JUMP
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.altKey &&

event.key==="ArrowRight"

){

goToPage(

Math.min(

currentPage+10,

totalPages

)

);

}

if(

event.altKey &&

event.key==="ArrowLeft"

){

goToPage(

Math.max(

currentPage-10,

1

)

);

}

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Mini Map Navigation Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 31 OF 40
   reader.js
   Night Reading + Brightness + Eye Comfort Mode
========================================================== */

/* ==========================================================
   READING FILTER
========================================================== */

let brightness=100;

let eyeComfort=false;

/* ==========================================================
   APPLY FILTER
========================================================== */

function applyReadingFilter(){

UI.bookStage.style.filter=

`

brightness(${brightness}%)

${eyeComfort

?

"sepia(.18) saturate(.92)"

:

""

}

`;

}

/* ==========================================================
   BRIGHTNESS
========================================================== */

function setBrightness(value){

brightness=

Math.max(

40,

Math.min(

150,

value

)

);

localStorage.setItem(

"reader-brightness",

brightness

);

applyReadingFilter();

updateBrightnessLabel();

}

/* ==========================================================
   LABEL
========================================================== */

function updateBrightnessLabel(){

const label=

document.getElementById(

"brightnessValue"

);

if(label)

label.textContent=

brightness+"%";

}

/* ==========================================================
   EYE MODE
========================================================== */

function toggleEyeComfort(){

eyeComfort=

!eyeComfort;

localStorage.setItem(

"reader-eye-mode",

eyeComfort

);

applyReadingFilter();

toast(

eyeComfort

?

"Eye Comfort Enabled"

:

"Eye Comfort Disabled"

);

}

/* ==========================================================
   BUILD SETTINGS
========================================================== */

function initializeBrightness(){

const slider=

document.getElementById(

"brightnessSlider"

);

if(!slider)

return;

slider.min=40;

slider.max=150;

slider.value=brightness;

slider.oninput=e=>{

setBrightness(

parseInt(

e.target.value

)

);

};

const eye=

document.getElementById(

"eyeComfortSwitch"

);

if(eye){

eye.checked=

eyeComfort;

eye.onchange=

toggleEyeComfort;

}

updateBrightnessLabel();

}

/* ==========================================================
   LOAD
========================================================== */

(function(){

const b=

parseInt(

localStorage.getItem(

"reader-brightness"

)

);

if(!isNaN(b))

brightness=b;

eyeComfort=

localStorage.getItem(

"reader-eye-mode"

)==="true";

})();

/* ==========================================================
   SHORTCUTS
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(event.key==="]"){

setBrightness(

brightness+5

);

}

if(event.key==="["){

setBrightness(

brightness-5

);

}

if(

event.key==="e"||

event.key==="E"

){

toggleEyeComfort();

}

});

/* ==========================================================
   START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

initializeBrightness();

applyReadingFilter();

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Night Reading Mode Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 32 OF 40
   reader.js
   Notes + Text Selection + Highlight System
========================================================== */

/* ==========================================================
   NOTES
========================================================== */

let readerNotes=

JSON.parse(

localStorage.getItem(

"reader-notes"

)

||

"[]"

);

/* ==========================================================
   SAVE NOTES
========================================================== */

function saveNotes(){

localStorage.setItem(

"reader-notes",

JSON.stringify(

readerNotes

)

);

}

/* ==========================================================
   ADD NOTE
========================================================== */

function addNote(text){

if(

!text.trim()

)

return;

readerNotes.push({

page:currentPage,

text,

time:Date.now()

});

saveNotes();

renderNotes();

toast(

"Note Saved"

);

}

/* ==========================================================
   RENDER NOTES
========================================================== */

function renderNotes(){

const container=

document.getElementById(

"notesList"

);

if(!container)

return;

container.innerHTML="";

readerNotes

.filter(

note=>note.page===currentPage

)

.forEach(

note=>{

const card=

document.createElement(

"div"

);

card.className=

"note-card";

card.innerHTML=

`

<p>

${note.text}

</p>

<small>

Page ${note.page}

</small>

`;

container.appendChild(

card

);

}

);

}

/* ==========================================================
   ADD NOTE BUTTON
========================================================== */

const noteButton=

document.getElementById(

"addNote"

);

if(noteButton){

noteButton.onclick=()=>{

const note=

prompt(

"Write Note"

);

if(note)

addNote(note);

};

}

/* ==========================================================
   TEXT SELECTION
========================================================== */

document.addEventListener(

"mouseup",

()=>{

const text=

window

.getSelection()

.toString()

.trim();

if(

text.length>2

){

UI.selectedText=

text;

}

});

/* ==========================================================
   COPY SHORTCUT
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.ctrlKey &&

event.key==="c"

){

const text=

window

.getSelection()

.toString()

.trim();

if(text){

toast(

"Text Copied"

);

}

}

});

/* ==========================================================
   PAGE HIGHLIGHT
========================================================== */

let pageHighlights=

JSON.parse(

localStorage.getItem(

"reader-highlights"

)

||

"[]"

);

function saveHighlights(){

localStorage.setItem(

"reader-highlights",

JSON.stringify(

pageHighlights

)

);

}

function addHighlight(){

pageHighlights.push({

page:currentPage

});

saveHighlights();

toast(

"Page Highlighted"

);

}

const highlightButton=

document.getElementById(

"highlightPage"

);

if(highlightButton){

highlightButton.onclick=

addHighlight;

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderNotesPatch=

renderBook;

renderBook=

async function(){

await renderNotesPatch();

renderNotes();

};

/* ==========================================================
   READY
========================================================== */

console.log(

"Notes & Highlight System Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 33 OF 40
   reader.js
   Printing + Download + Share + Copy Link
========================================================== */

/* ==========================================================
   PRINT
========================================================== */

function printBook(){

if(!currentBook.file)

return;

const frame=

document.createElement(

"iframe"

);

frame.style.display="none";

frame.src=

"books/"+

currentBook.file;

document.body.appendChild(

frame

);

frame.onload=()=>{

frame.contentWindow.focus();

frame.contentWindow.print();

};

}

/* ==========================================================
   DOWNLOAD
========================================================== */

function downloadBook(){

const link=

document.createElement(

"a"

);

link.href=

"books/"+

currentBook.file;

link.download=

currentBook.file;

document.body.appendChild(

link

);

link.click();

link.remove();

toast(

"Download Started"

);

}

/* ==========================================================
   SHARE
========================================================== */

async function shareBook(){

const url=

window.location.href;

if(

navigator.share

){

try{

await navigator.share({

title:

currentBook.title,

text:

currentBook.author,

url

});

}

catch(e){}

}

else{

copyReaderLink();

}

}

/* ==========================================================
   COPY LINK
========================================================== */

async function copyReaderLink(){

await navigator.clipboard.writeText(

window.location.href

);

toast(

"Reader Link Copied"

);

}

/* ==========================================================
   SHORTCUTS
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.ctrlKey &&

event.key==="p"

){

event.preventDefault();

printBook();

}

if(

event.ctrlKey &&

event.key==="d"

){

event.preventDefault();

downloadBook();

}

if(

event.ctrlKey &&

event.key==="l"

){

event.preventDefault();

copyReaderLink();

}

});

/* ==========================================================
   TOOLBAR BUTTONS
========================================================== */

const printButton=

document.getElementById(

"printBook"

);

if(printButton)

printButton.onclick=

printBook;

const downloadButton=

document.getElementById(

"downloadBook"

);

if(downloadButton)

downloadButton.onclick=

downloadBook;

const shareButton=

document.getElementById(

"shareBook"

);

if(shareButton)

shareButton.onclick=

shareBook;

/* ==========================================================
   READY
========================================================== */

console.log(

"Print Download Share Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 34 OF 40
   reader.js
   Real Book Shelf + Open Book Animation
========================================================== */

/* ==========================================================
   BOOK OPEN
========================================================== */

function openBookAnimation(){

UI.book.classList.remove(

"closed"

);

UI.book.classList.add(

"opening"

);

setTimeout(

()=>{

UI.book.classList.remove(

"opening"

);

UI.book.classList.add(

"opened"

);

},

900

);

}

/* ==========================================================
   CLOSE BOOK
========================================================== */

function closeBookAnimation(){

UI.book.classList.remove(

"opened"

);

UI.book.classList.add(

"closing"

);

setTimeout(

()=>{

UI.book.classList.remove(

"closing"

);

UI.book.classList.add(

"closed"

);

},

800

);

}

/* ==========================================================
   BOOK HOVER
========================================================== */

UI.book.addEventListener(

"mouseenter",

()=>{

UI.book.classList.add(

"hover-book"

);

}

);

UI.book.addEventListener(

"mouseleave",

()=>{

UI.book.classList.remove(

"hover-book"

);

}

);

/* ==========================================================
   BOOK DEPTH
========================================================== */

function updateBookThickness(){

const spine=

document.querySelector(

".book-spine"

);

if(!spine)

return;

const percent=

currentPage/

totalPages;

const left=

Math.max(

8,

percent*30

);

const right=

Math.max(

8,

(1-percent)*30

);

spine.style.boxShadow=

`

-${left}px 0 0 #efe7d7,

${right}px 0 0 #efe7d7

`;

}

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderDepth=

renderBook;

renderBook=

async function(){

await renderDepth();

updateBookThickness();

};

/* ==========================================================
   PATCH OPEN
========================================================== */

const originalPDFOpen=

openPDF;

openPDF=

async function(path){

await originalPDFOpen(path);

openBookAnimation();

};

/* ==========================================================
   EXIT
========================================================== */

window.addEventListener(

"beforeunload",

()=>{

closeBookAnimation();

}

/* ==========================================================
   BOOK FOCUS
========================================================== */

);

UI.book.addEventListener(

"click",

()=>{

UI.book.animate(

[

{

transform:

"scale(1)"

},

{

transform:

"scale(1.015)"

},

{

transform:

"scale(1)"

}

],

{

duration:220,

iterations:1

}

);

}

/* ==========================================================
   SHADOW
========================================================== */

);

function updateBookShadow(){

const shadow=

document.querySelector(

".book-shadow"

);

if(!shadow)

return;

shadow.style.opacity=".45";

shadow.style.filter=

"blur(35px)";

shadow.style.transform=

"translateX(-50%) scale(1.08)";

}

/* ==========================================================
   PATCH
========================================================== */

const oldRender=

renderBook;

renderBook=

async function(){

await oldRender();

updateBookThickness();

updateBookShadow();

};

/* ==========================================================
   READY
========================================================== */

console.log(

"Real Book Animation Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 35 OF 40
   reader.js
   Auto Scroll + Mouse Wheel + Reading Position
========================================================== */

/* ==========================================================
   AUTO SCROLL
========================================================== */

let autoScroll=false;

let autoScrollSpeed=1;

let autoScrollTimer=null;

/* ==========================================================
   START
========================================================== */

function startAutoScroll(){

if(autoScroll)

return;

autoScroll=true;

toast(

"Auto Scroll Enabled"

);

autoScrollTimer=

setInterval(

()=>{

if(

currentPage<totalPages

){

flipNext();

}

else{

stopAutoScroll();

}

},

6000/autoScrollSpeed

);

}

/* ==========================================================
   STOP
========================================================== */

function stopAutoScroll(){

autoScroll=false;

clearInterval(

autoScrollTimer

);

toast(

"Auto Scroll Disabled"

);

}

/* ==========================================================
   TOGGLE
========================================================== */

function toggleAutoScroll(){

if(autoScroll)

stopAutoScroll();

else

startAutoScroll();

}

/* ==========================================================
   SPEED
========================================================== */

function setAutoScrollSpeed(speed){

autoScrollSpeed=

Math.max(

0.5,

Math.min(

5,

speed

)

);

if(autoScroll){

stopAutoScroll();

startAutoScroll();

}

}

/* ==========================================================
   MOUSE WHEEL
========================================================== */

UI.bookStage.addEventListener(

"wheel",

event=>{

event.preventDefault();

if(event.deltaY>0){

flipNext();

}

else{

flipPrevious();

}

},

{

passive:false

}

);

/* ==========================================================
   KEYBOARD
========================================================== */

document.addEventListener(

"keydown",

event=>{

switch(event.key){

case "a":

case "A":

toggleAutoScroll();

break;

case ".":

setAutoScrollSpeed(

autoScrollSpeed+.5

);

toast(

"Speed "+

autoScrollSpeed.toFixed(1)

+"x"

);

break;

case ",":

setAutoScrollSpeed(

autoScrollSpeed-.5

);

toast(

"Speed "+

autoScrollSpeed.toFixed(1)

+"x"

);

break;

}

});

/* ==========================================================
   BUTTON
========================================================== */

const autoButton=

document.getElementById(

"autoScrollButton"

);

if(autoButton){

autoButton.onclick=

toggleAutoScroll;

}

/* ==========================================================
   STOP ON USER ACTION
========================================================== */

[

"touchstart",

"mousedown",

"keydown"

].forEach(eventName=>{

document.addEventListener(

eventName,

()=>{

if(autoScroll)

stopAutoScroll();

},

{

passive:true

}

);

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Auto Scroll Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 36 OF 40
   reader.js
   Favorites + Recently Read + Continue Reading
========================================================== */

/* ==========================================================
   FAVORITES
========================================================== */

let favoriteBooks=

JSON.parse(

localStorage.getItem(

"reader-favorites"

)

||

"[]"

);

/* ==========================================================
   TOGGLE FAVORITE
========================================================== */

function toggleFavorite(){

const file=

currentBook.file;

const index=

favoriteBooks.indexOf(

file

);

if(index===-1){

favoriteBooks.push(

file

);

toast(

"Added to Favorites"

);

}

else{

favoriteBooks.splice(

index,

1

);

toast(

"Removed from Favorites"

);

}

localStorage.setItem(

"reader-favorites",

JSON.stringify(

favoriteBooks

)

);

updateFavoriteButton();

}

/* ==========================================================
   BUTTON
========================================================== */

function updateFavoriteButton(){

const button=

document.getElementById(

"favoriteBook"

);

if(!button)

return;

button.classList.toggle(

"active",

favoriteBooks.includes(

currentBook.file

)

);

}

/* ==========================================================
   CONTINUE READING
========================================================== */

function saveContinueReading(){

localStorage.setItem(

"continue-book",

currentBook.file

);

localStorage.setItem(

"continue-page",

currentPage

);

}

/* ==========================================================
   RESTORE
========================================================== */

function restoreContinueReading(){

const file=

localStorage.getItem(

"continue-book"

);

const page=

parseInt(

localStorage.getItem(

"continue-page"

)

);

if(

file===currentBook.file &&

!isNaN(page)

){

currentPage=

Math.min(

page,

totalPages

);

}

}

/* ==========================================================
   RECENT HISTORY
========================================================== */

function updateHistory(){

let history=

JSON.parse(

localStorage.getItem(

"reader-history"

)

||

"[]"

);

history=

history.filter(

item=>item.file!==currentBook.file

);

history.unshift({

file:currentBook.file,

title:currentBook.title,

page:currentPage,

time:Date.now()

});

history=

history.slice(

0,

20

);

localStorage.setItem(

"reader-history",

JSON.stringify(

history

)

);

}

/* ==========================================================
   PATCH OPEN
========================================================== */

const openFavorite=

openPDF;

openPDF=

async function(path){

await openFavorite(path);

restoreContinueReading();

updateFavoriteButton();

renderBook();

};

/* ==========================================================
   PATCH RENDER
========================================================== */

const renderFavorite=

renderBook;

renderBook=

async function(){

await renderFavorite();

saveContinueReading();

updateHistory();

};

/* ==========================================================
   BUTTON
========================================================== */

const favoriteButton=

document.getElementById(

"favoriteBook"

);

if(favoriteButton){

favoriteButton.onclick=

toggleFavorite;

}

/* ==========================================================
   READY
========================================================== */

console.log(

"Favorites & Continue Reading Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 37 OF 40
   reader.js
   Performance Optimizer + Lazy Render + Memory Manager
========================================================== */

/* ==========================================================
   PERFORMANCE
========================================================== */

const PERFORMANCE={

renderQueue:false,

fps:60,

lastRender:0,

lazyDistance:4

};

/* ==========================================================
   REQUEST RENDER
========================================================== */

function requestBookRender(){

if(

PERFORMANCE.renderQueue

)

return;

PERFORMANCE.renderQueue=true;

requestAnimationFrame(

async()=>{

PERFORMANCE.renderQueue=false;

await renderBook();

}

);

}

/* ==========================================================
   MEMORY CLEANUP
========================================================== */

function cleanupMemory(){

if(

PAGE_CACHE.size>

MAX_CACHE

){

const keys=

[...PAGE_CACHE.keys()]

.sort(

(a,b)=>a-b

);

while(

keys.length>

MAX_CACHE

){

PAGE_CACHE.delete(

keys.shift()

);

}

}

}

/* ==========================================================
   LAZY PRELOAD
========================================================== */

async function lazyPreload(){

if(!pdf)

return;

for(

let i=1;

i<=PERFORMANCE.lazyDistance;

i++

){

const next=

currentPage+i;

const prev=

currentPage-i;

if(

next<=totalPages &&

!PAGE_CACHE.has(next)

){

try{

PAGE_CACHE.set(

next,

await pdf.getPage(next)

);

}catch(e){}

}

if(

prev>=1 &&

!PAGE_CACHE.has(prev)

){

try{

PAGE_CACHE.set(

prev,

await pdf.getPage(prev)

);

}catch(e){}

}

}

cleanupMemory();

}

/* ==========================================================
   IDLE PRELOAD
========================================================== */

function scheduleIdlePreload(){

if(

"requestIdleCallback"

in window

){

requestIdleCallback(

lazyPreload

);

}

else{

setTimeout(

lazyPreload,

200

);

}

}

/* ==========================================================
   PATCH
========================================================== */

const renderPerformance=

renderBook;

renderBook=

async function(){

const now=

performance.now();

if(

now-

PERFORMANCE.lastRender<

16

){

return;

}

PERFORMANCE.lastRender=

now;

await renderPerformance();

scheduleIdlePreload();

};

/* ==========================================================
   VISIBILITY
========================================================== */

document.addEventListener(

"visibilitychange",

()=>{

if(

document.hidden

){

cleanupMemory();

}

});

/* ==========================================================
   LOW MEMORY
========================================================== */

window.addEventListener(

"pagehide",

()=>{

cleanupMemory();

});

/* ==========================================================
   DEVICE MEMORY
========================================================== */

if(

navigator.deviceMemory &&

navigator.deviceMemory<=4

){

PERFORMANCE.lazyDistance=2;

}

/* ==========================================================
   READY
========================================================== */

console.log(

"Performance Optimizer Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 38 OF 40
   reader.js
   Realistic Sound Effects + Haptic Feedback + Ambient Audio
========================================================== */

/* ==========================================================
   AUDIO
========================================================== */

const AUDIO={

enabled:true,

page:new Audio(

"assets/sounds/page-flip.mp3"

),

open:new Audio(

"assets/sounds/book-open.mp3"

),

close:new Audio(

"assets/sounds/book-close.mp3"

)

};

AUDIO.page.preload="auto";
AUDIO.open.preload="auto";
AUDIO.close.preload="auto";

/* ==========================================================
   SOUND
========================================================== */

function playSound(type){

if(

!AUDIO.enabled ||

!AUDIO[type]

)

return;

const sound=

AUDIO[type];

sound.pause();

sound.currentTime=0;

sound.play()

.catch(()=>{});

}

/* ==========================================================
   HAPTIC
========================================================== */

function vibrate(duration=20){

if(

navigator.vibrate

){

navigator.vibrate(

duration

);

}

}

/* ==========================================================
   PAGE EFFECT
========================================================== */

function pageFeedback(){

playSound(

"page"

);

vibrate(

15

);

}

/* ==========================================================
   PATCH FLIP
========================================================== */

const originalFlipNext=

flipNext;

flipNext=

async function(){

pageFeedback();

await originalFlipNext();

};

const originalFlipPrevious=

flipPrevious;

flipPrevious=

async function(){

pageFeedback();

await originalFlipPrevious();

};

/* ==========================================================
   PATCH OPEN
========================================================== */

const originalOpenAnimation=

openBookAnimation;

openBookAnimation=function(){

playSound(

"open"

);

vibrate(

35

);

originalOpenAnimation();

};

/* ==========================================================
   PATCH CLOSE
========================================================== */

const originalCloseAnimation=

closeBookAnimation;

closeBookAnimation=function(){

playSound(

"close"

);

vibrate(

25

);

originalCloseAnimation();

};

/* ==========================================================
   SOUND SWITCH
========================================================== */

function toggleReaderSound(){

AUDIO.enabled=

!AUDIO.enabled;

localStorage.setItem(

"reader-sound",

AUDIO.enabled

);

toast(

AUDIO.enabled

?

"Reader Sound Enabled"

:

"Reader Sound Disabled"

);

}

/* ==========================================================
   LOAD
========================================================== */

(function(){

AUDIO.enabled=

localStorage.getItem(

"reader-sound"

)!=="false";

})();

/* ==========================================================
   SHORTCUT
========================================================== */

document.addEventListener(

"keydown",

event=>{

if(

event.key==="m" ||

event.key==="M"

){

toggleReaderSound();

}

});

/* ==========================================================
   READY
========================================================== */

console.log(

"Sound & Haptic Engine Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 39 OF 40
   reader.js
   Offline Mode + Service Worker + Install PWA
========================================================== */

/* ==========================================================
   SERVICE WORKER
========================================================== */

async function registerServiceWorker(){

if(

!("serviceWorker" in navigator)

)

return;

try{

await navigator.serviceWorker.register(

"./sw.js"

);

console.log(

"Service Worker Registered"

);

}

catch(error){

console.error(error);

}

}

/* ==========================================================
   INSTALL
========================================================== */

let deferredPrompt=null;

window.addEventListener(

"beforeinstallprompt",

event=>{

event.preventDefault();

deferredPrompt=event;

const button=

document.getElementById(

"installReader"

);

if(button)

button.style.display="flex";

});

/* ==========================================================
   INSTALL APP
========================================================== */

async function installReader(){

if(

!deferredPrompt

)

return;

deferredPrompt.prompt();

const result=

await deferredPrompt.userChoice;

if(

result.outcome==="accepted"

){

toast(

"Reader Installed"

);

}

deferredPrompt=null;

}

/* ==========================================================
   INSTALL BUTTON
========================================================== */

const installButton=

document.getElementById(

"installReader"

);

if(

installButton

){

installButton.onclick=

installReader;

}

/* ==========================================================
   OFFLINE
========================================================== */

window.addEventListener(

"online",

()=>{

toast(

"Internet Connected"

);

document.body.classList.remove(

"offline"

);

}

);

window.addEventListener(

"offline",

()=>{

toast(

"Offline Mode"

);

document.body.classList.add(

"offline"

);

}

);

/* ==========================================================
   CACHE STATUS
========================================================== */

async function cacheBook(){

if(

!("caches" in window)

)

return;

const cache=

await caches.open(

"chishti-books"

);

await cache.add(

window.location.href

);

}

/* ==========================================================
   PATCH OPEN
========================================================== */

const openOffline=

openPDF;

openPDF=

async function(path){

await openOffline(path);

cacheBook();

};

/* ==========================================================
   START
========================================================== */

document.addEventListener(

"DOMContentLoaded",

()=>{

registerServiceWorker();

});

/* ==========================================================
   APP INSTALLED
========================================================== */

window.addEventListener(

"appinstalled",

()=>{

toast(

"CHISHTI BOOK READER Installed Successfully"

);

});

/* ==========================================================
   READY
========================================================== */

console.log(

"PWA & Offline Mode Ready"

);
/* ==========================================================
   CHISHTI BOOK READER v1
   PART 40 OF 40
   reader.js
   Final Initialize + Startup + Engine
========================================================== */

/* ==========================================================
   START READER
========================================================== */

async function startReader(){

try{

showLoader();

const params=

new URLSearchParams(

window.location.search

);

const pdfFile=

params.get("book");

if(!pdfFile){

toast(

"No Book Selected",

"error"

);

hideLoader();

return;

}

await loadBookInformation();

await openPDF(pdfFile);

restoreReaderSettings();

restoreContinueReading();

renderBookmarks();

renderNotes();

updateFavoriteButton();

updateReadingProgress();

updatePageSlider();

fitBookToScreen();

applyReadingFilter();

hideLoader();

toast(

"Welcome to CHISHTI BOOK READER"

);

}

catch(error){

console.error(error);

hideLoader();

toast(

"Failed To Load Book",

"error"

);

}

}

/* ==========================================================
   BUTTON EVENTS
========================================================== */

function initializeButtons(){

UI.firstPage.onclick=

firstPage;

UI.lastPage.onclick=

lastPage;

UI.nextPage.onclick=

flipNext;

UI.previousPage.onclick=

flipPrevious;

UI.zoomIn.onclick=

zoomIn;

UI.zoomOut.onclick=

zoomOut;

UI.rotateBook.onclick=

rotateBook;

UI.themeButton.onclick=

()=>{

UI.themePanel.classList.toggle(

"active"

);

};

UI.settingButton.onclick=

()=>{

UI.settingsPanel.classList.toggle(

"active"

);

};

UI.bookmarkButton.onclick=

()=>{

UI.bookmarkPanel.classList.toggle(

"active"

);

};

UI.fullscreenButton.onclick=

toggleFullscreen;

}

/* ==========================================================
   PAGE INPUT
========================================================== */

function initializePageInput(){

UI.pageNumber.addEventListener(

"change",

()=>{

let page=

parseInt(

UI.pageNumber.value

);

if(

isNaN(page)

)

page=1;

goToPage(page);

}

);

}

/* ==========================================================
   STARTUP
========================================================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

initializeButtons();

initializePageInput();

await startReader();

});

/* ==========================================================
   GLOBAL
========================================================== */

window.reader={

openPDF,

renderBook,

goToPage,

flipNext,

flipPrevious,

zoomIn,

zoomOut,

rotateBook,

toggleFullscreen,

toggleFavorite,

toggleBookmark,

toggleImmersiveMode,

toggleReaderSound,

downloadBook,

printBook,

shareBook,

findInBook

};

/* ==========================================================
   VERSION
========================================================== */

console.log(
"%cCHISHTI BOOK READER v1.0",
"color:#8B0000;font-size:18px;font-weight:bold;"
);

console.log(
"Professional PDF Engine Loaded Successfully."
);

/* ==========================================================
   END
========================================================== */
