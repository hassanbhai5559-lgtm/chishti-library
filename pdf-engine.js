/*=========================================
 CHISHTI READER PRO
 pdf-engine.js
 Part 1
=========================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

/*=========================================
STATE
=========================================*/

const Reader={

pdf:null,

page:1,

pages:0,

zoom:1.4,

rotation:0,

rendering:false,

pending:null,

book:null,

title:"",

cover:""

};

/*=========================================
ELEMENTS
=========================================*/

const canvas=document.getElementById("pdfCanvas");

const ctx=canvas.getContext("2d");

const pageCounter=document.getElementById("currentPage");

const totalPages=document.getElementById("totalPages");

const progress=document.getElementById("progressFill");

const loader=document.getElementById("loader");

const intro=document.querySelector(".intro-screen");

/*=========================================
GET URL
reader.html?book=books/file.pdf
&title=Book
&cover=cover.webp
=========================================*/

const params=new URLSearchParams(location.search);

Reader.book=params.get("book");

Reader.title=decodeURIComponent(

params.get("title")||"Chishti Library"

);

Reader.cover=params.get("cover")||"images/default-cover.webp";

/*=========================================
SET INFO
=========================================*/

document.getElementById("bookTitle").innerHTML=

Reader.title;

document.getElementById("bookCover").src=

Reader.cover;

/*=========================================
READ BUTTON
=========================================*/

document.getElementById("readBook")

.onclick=()=>{

intro.classList.add("book-closing");

setTimeout(()=>{

intro.style.display="none";

loadPDF();

},700);

};

/*=========================================
LOAD PDF
=========================================*/

async function loadPDF(){

if(!Reader.book){

alert("Book Not Found");

return;

}

showLoader();

try{

const task=

pdfjsLib.getDocument(

decodeURIComponent(

Reader.book

)

);

Reader.pdf=

await task.promise;

Reader.pages=

Reader.pdf.numPages;

totalPages.innerHTML=

Reader.pages;

restoreReading();

renderPage(

Reader.page

);

}catch(e){

console.error(e);

alert("Unable To Load PDF");

}

}

/*=========================================
RENDER
=========================================*/

async function renderPage(page){

Reader.rendering=true;

const pdfPage=

await Reader.pdf.getPage(page);

const viewport=

pdfPage.getViewport({

scale:Reader.zoom,

rotation:Reader.rotation

});

canvas.width=

viewport.width;

canvas.height=

viewport.height;

await pdfPage.render({

canvasContext:ctx,

viewport:viewport

}).promise;

pageCounter.innerHTML=

page;

updateProgress();

hideLoader();

Reader.rendering=false;

if(Reader.pending!==null){

renderPage(

Reader.pending

);

Reader.pending=null;

}

}

/*=========================================
QUEUE
=========================================*/

function queue(page){

if(Reader.rendering){

Reader.pending=page;

}else{

renderPage(page);

}

}

/*=========================================
LOADER
=========================================*/

function showLoader(){

loader.style.display="flex";

}

function hideLoader(){

setTimeout(()=>{

loader.style.display="none";

},300);

}

/*=========================================
PROGRESS
=========================================*/

function updateProgress(){

const value=

Reader.page/

Reader.pages*100;

progress.style.width=

value+"%";

}

/*=========================================
NEXT PART
=========================================*/
console.log("PDF Engine Part 1 Loaded");

/*=========================================
 CHISHTI READER PRO
 pdf-engine.js
 Part 2
 Navigation
=========================================*/

/*=========================================
NEXT PAGE
=========================================*/

function nextPage(){

if(Reader.page>=Reader.pages)

return;

Reader.page++;

queue(Reader.page);

saveReading();

playFlip();

}

/*=========================================
PREVIOUS PAGE
=========================================*/

function previousPage(){

if(Reader.page<=1)

return;

Reader.page--;

queue(Reader.page);

saveReading();

playFlip();

}

/*=========================================
GO TO PAGE
=========================================*/

function gotoPage(number){

if(number<1)

number=1;

if(number>Reader.pages)

number=Reader.pages;

Reader.page=number;

queue(number);

saveReading();

}

/*=========================================
ZOOM
=========================================*/

function zoomIn(){

Reader.zoom+=0.20;

queue(Reader.page);

document.getElementById("zoomValue").innerHTML=

Math.round(Reader.zoom*100/1.4)+"%";

saveReading();

}

function zoomOut(){

if(Reader.zoom<=0.60)

return;

Reader.zoom-=0.20;

queue(Reader.page);

document.getElementById("zoomValue").innerHTML=

Math.round(Reader.zoom*100/1.4)+"%";

saveReading();

}

/*=========================================
ROTATE
=========================================*/

function rotateBook(){

Reader.rotation+=90;

if(Reader.rotation==360)

Reader.rotation=0;

queue(Reader.page);

saveReading();

}

/*=========================================
BUTTONS
=========================================*/

document.getElementById("nextPage")

.onclick=nextPage;

document.getElementById("prevPage")

.onclick=previousPage;

document.getElementById("zoomIn")

.onclick=zoomIn;

document.getElementById("zoomOut")

.onclick=zoomOut;

document.getElementById("rotateBtn")

.onclick=rotateBook;

/*=========================================
KEYBOARD
=========================================*/

document.addEventListener(

"keydown",

e=>{

switch(e.key){

case "ArrowRight":

nextPage();

break;

case "ArrowLeft":

previousPage();

break;

case "+":

zoomIn();

break;

case "-":

zoomOut();

break;

case "Home":

gotoPage(1);

break;

case "End":

gotoPage(Reader.pages);

break;

}

});

/*=========================================
MOUSE WHEEL
=========================================*/

canvas.addEventListener(

"wheel",

e=>{

if(e.ctrlKey){

e.preventDefault();

if(e.deltaY<0){

zoomIn();

}else{

zoomOut();

}

}

});

/*=========================================
PAGE INPUT
=========================================*/

const pageInput=

document.getElementById("pageNumber");

if(pageInput){

pageInput.addEventListener(

"change",

()=>{

gotoPage(

parseInt(pageInput.value)

);

});

}

/*=========================================
FLIP SOUND
=========================================*/

function playFlip(){

const audio=

document.getElementById(

"pageFlipSound"

);

if(audio){

audio.currentTime=0;

audio.play().catch(()=>{});

}

}

console.log("PDF Engine Part 2 Loaded");
/*=========================================
 CHISHTI READER PRO
 pdf-engine.js
 Part 3
 Storage & Reader Tools
=========================================*/

/*=========================================
STORAGE KEY
=========================================*/

const STORAGE_KEY =

"chishti_reader_" +

btoa(Reader.book);

/*=========================================
SAVE READING
=========================================*/

function saveReading(){

const data={

page:Reader.page,

zoom:Reader.zoom,

rotation:Reader.rotation,

time:new Date().toISOString(),

theme:

document.body.className

};

localStorage.setItem(

STORAGE_KEY,

JSON.stringify(data)

);

}

/*=========================================
RESTORE
=========================================*/

function restoreReading(){

const data=

localStorage.getItem(

STORAGE_KEY

);

if(!data) return;

try{

const saved=

JSON.parse(data);

Reader.page=

saved.page||1;

Reader.zoom=

saved.zoom||1.4;

Reader.rotation=

saved.rotation||0;

if(saved.theme){

document.body.className=

saved.theme;

}

}catch(e){

console.log(e);

}

}

/*=========================================
AUTO SAVE
=========================================*/

setInterval(

saveReading,

5000

);

/*=========================================
FULLSCREEN
=========================================*/

document

.getElementById(

"fullscreenBtn"

)

.onclick=()=>{

if(

!document.fullscreenElement

){

document

.documentElement

.requestFullscreen();

}else{

document

.exitFullscreen();

}

};

/*=========================================
DOWNLOAD
=========================================*/

document

.getElementById(

"downloadBtn"

)

.onclick=()=>{

window.open(

Reader.book,

"_blank"

);

};

/*=========================================
PRINT
=========================================*/

document

.getElementById(

"printBtn"

)

.onclick=()=>{

const frame=

document.createElement(

"iframe"

);

frame.style.display="none";

frame.src=Reader.book;

document.body.appendChild(frame);

frame.onload=()=>{

frame.contentWindow.focus();

frame.contentWindow.print();

};

};

/*=========================================
READING TIMER
=========================================*/

let seconds=0;

const readingTimer=

document.getElementById(

"readingTime"

);

setInterval(()=>{

seconds++;

const h=

String(

Math.floor(seconds/3600)

).padStart(2,"0");

const m=

String(

Math.floor(

(seconds%3600)/60

)

).padStart(2,"0");

const s=

String(

seconds%60

).padStart(2,"0");

readingTimer.innerHTML=

`${h}:${m}:${s}`;

},1000);

/*=========================================
PAGE INPUT UPDATE
=========================================*/

function updatePageBox(){

const box=

document.getElementById(

"pageNumber"

);

if(box){

box.value=

Reader.page;

}

}

/*=========================================
OVERRIDE
=========================================*/

const oldQueue=queue;

queue=function(page){

oldQueue(page);

updatePageBox();

};

/*=========================================
TOAST
=========================================*/

function toast(text){

const t=

document.getElementById(

"toast"

);

if(!t) return;

t.innerHTML=text;

t.classList.add("show");

setTimeout(()=>{

t.classList.remove(

"show"

);

},2000);

}

/*=========================================
SAVE BUTTON
=========================================*/

const saveBtn=

document.getElementById(

"saveReading"

);

if(saveBtn){

saveBtn.onclick=()=>{

saveReading();

toast(

"Reading Progress Saved"

);

};

}

console.log(

"PDF Engine Part 3 Loaded"

);
/*=========================================
 CHISHTI READER PRO
 pdf-engine.js
 Part 4
 Touch • Cache • Performance
=========================================*/

/*=========================================
PAGE CACHE
=========================================*/

const PageCache=new Map();

async function getCachedPage(page){

if(PageCache.has(page)){

return PageCache.get(page);

}

const pdfPage=

await Reader.pdf.getPage(page);

PageCache.set(page,pdfPage);

return pdfPage;

}

/*=========================================
PRELOAD
=========================================*/

async function preloadPages(){

const next=Reader.page+1;

const prev=Reader.page-1;

if(next<=Reader.pages){

getCachedPage(next);

}

if(prev>=1){

getCachedPage(prev);

}

}

/*=========================================
OVERRIDE RENDER
=========================================*/

const oldRenderPage=renderPage;

renderPage=async function(page){

Reader.rendering=true;

const pdfPage=

await getCachedPage(page);

const viewport=

pdfPage.getViewport({

scale:Reader.zoom,

rotation:Reader.rotation

});

canvas.width=viewport.width;

canvas.height=viewport.height;

await pdfPage.render({

canvasContext:ctx,

viewport

}).promise;

Reader.rendering=false;

pageCounter.innerHTML=page;

updateProgress();

hideLoader();

preloadPages();

};

/*=========================================
DOUBLE CLICK
=========================================*/

canvas.addEventListener(

"dblclick",

()=>{

if(Reader.zoom<2.2){

Reader.zoom=2.2;

}else{

Reader.zoom=1.4;

}

queue(Reader.page);

});

/*=========================================
TOUCH SWIPE
=========================================*/

let touchStartX=0;

let touchEndX=0;

canvas.addEventListener(

"touchstart",

e=>{

touchStartX=

e.changedTouches[0].clientX;

});

canvas.addEventListener(

"touchend",

e=>{

touchEndX=

e.changedTouches[0].clientX;

const diff=

touchStartX-touchEndX;

if(diff>70){

nextPage();

}

if(diff<-70){

previousPage();

}

});

/*=========================================
MOUSE DRAG
=========================================*/

let dragStart=0;

canvas.addEventListener(

"mousedown",

e=>{

dragStart=e.clientX;

});

canvas.addEventListener(

"mouseup",

e=>{

const diff=

dragStart-e.clientX;

if(diff>120){

nextPage();

}

if(diff<-120){

previousPage();

}

});

/*=========================================
AUTO HIDE TOOLBAR
=========================================*/

const toolbar=

document.querySelector(

".reader-toolbar"

);

let hideTimer;

document.addEventListener(

"mousemove",

()=>{

toolbar.style.opacity="1";

clearTimeout(hideTimer);

hideTimer=setTimeout(()=>{

toolbar.style.opacity=".15";

},3500);

});

/*=========================================
FPS
=========================================*/

let lastFrame=performance.now();

function fps(){

const now=performance.now();

const delta=now-lastFrame;

lastFrame=now;

requestAnimationFrame(fps);

}

fps();

/*=========================================
VISIBILITY
=========================================*/

document.addEventListener(

"visibilitychange",

()=>{

if(document.hidden){

saveReading();

}

});

/*=========================================
BEFORE CLOSE
=========================================*/

window.addEventListener(

"beforeunload",

()=>{

saveReading();

});

/*=========================================
BOOK READY
=========================================*/

window.addEventListener(

"load",

()=>{

console.log(

"Chishti Reader Ready"

);

});
