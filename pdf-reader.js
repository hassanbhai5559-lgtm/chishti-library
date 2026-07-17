/*=========================================
 CHISHTI READER PRO
 pdf-reader.js
 Version 2
=========================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

/*========================
GET BOOK
========================*/

const params = new URLSearchParams(window.location.search);

const pdfFile = params.get("book");

const bookTitle = params.get("title") || "Chishti Library";

document.getElementById("bookTitle").innerHTML =
decodeURIComponent(bookTitle);

/*========================
VARIABLES
========================*/

let pdf = null;

let pageNum = 1;

let totalPages = 0;

let zoom = 1.4;

let rendering = false;

let pendingPage = null;

/*========================
CANVAS
========================*/

const canvas =
document.getElementById("pdfCanvas");

const ctx =
canvas.getContext("2d");

/*========================
LOAD PDF
========================*/

async function loadBook(){

if(!pdfFile){

alert("Book Not Found");

return;

}

const task =
pdfjsLib.getDocument(decodeURIComponent(pdfFile));

pdf = await task.promise;

totalPages = pdf.numPages;

document.getElementById("totalPages").innerHTML =
totalPages;

renderPage(pageNum);

hideLoader();

}

loadBook();

/*========================
RENDER PAGE
========================*/

async function renderPage(num){

rendering = true;

const page =
await pdf.getPage(num);

const viewport =
page.getViewport({scale:zoom});

canvas.height =
viewport.height;

canvas.width =
viewport.width;

const renderContext = {

canvasContext:ctx,

viewport:viewport

};

await page.render(renderContext).promise;

document.getElementById("pageCounter").innerHTML =
num;

updateProgress();

rendering = false;

if(pendingPage!==null){

renderPage(pendingPage);

pendingPage = null;

}

}

/*========================
QUEUE
========================*/

function queueRender(num){

if(rendering){

pendingPage=num;

}else{

renderPage(num);

}

}

/*========================
NEXT
========================*/

function nextPage(){

if(pageNum>=totalPages)

return;

pageNum++;

queueRender(pageNum);

animatePage();

}

/*========================
PREVIOUS
========================*/

function previousPage(){

if(pageNum<=1)

return;

pageNum--;

queueRender(pageNum);

animatePage();

}

/*========================
ZOOM
========================*/

function zoomIn(){

zoom+=0.2;

queueRender(pageNum);

}

function zoomOut(){

if(zoom<=0.8)

return;

zoom-=0.2;

queueRender(pageNum);

}

/*========================
DOWNLOAD
========================*/

function downloadBook(){

const a=document.createElement("a");

a.href=decodeURIComponent(pdfFile);

a.download="";

a.click();

}

/*========================
PRINT
========================*/

function printBook(){

window.open(decodeURIComponent(pdfFile));

}

/*========================
FULLSCREEN
========================*/

function fullscreenBook(){

if(!document.fullscreenElement){

document.documentElement.requestFullscreen();

}else{

document.exitFullscreen();

}

}

/*========================
BOOKMARK
========================*/

function bookmarkPage(){

localStorage.setItem(

pdfFile,

pageNum

);

alert("Bookmark Saved");

}

/*========================
RESTORE
========================*/

const lastPage=

localStorage.getItem(pdfFile);

if(lastPage){

pageNum=

parseInt(lastPage);

}

/*========================
PROGRESS
========================*/

function updateProgress(){

const percent=

(pageNum/totalPages)*100;

document.getElementById(

"readingProgress"

).style.width=

percent+"%";

}

/*========================
LOADER
========================*/

function hideLoader(){

setTimeout(()=>{

document.getElementById(

"loading"

).style.display="none";

},700);

}

/*========================
PAGE ANIMATION
========================*/

function animatePage(){

canvas.classList.remove("page-turn");

void canvas.offsetWidth;

canvas.classList.add("page-turn");

}

/*========================
KEYBOARD
========================*/

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

case "f":

fullscreenBook();

break;

}

}

/*========================
BUTTONS
========================*/

document.getElementById("next")
.onclick=nextPage;

document.getElementById("prev")
.onclick=previousPage;

document.getElementById("zoomIn")
.onclick=zoomIn;

document.getElementById("zoomOut")
.onclick=zoomOut;

document.getElementById("download")
.onclick=downloadBook;

document.getElementById("print")
.onclick=printBook;

document.getElementById("fullscreen")
.onclick=fullscreenBook;

document.getElementById("bookmark")
.onclick=bookmarkPage;

/*========================
END
========================*/

console.log(
"Chishti Reader Loaded Successfully"
);
