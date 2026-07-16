/*====================================
 CHISHTI LIBRARY READER PRO
 Part 1
=====================================*/

const params = new URLSearchParams(window.location.search);

const pdfFile = params.get("book");

const title = params.get("title");

const viewer = document.getElementById("viewer");

const pageCounter = document.getElementById("pageCounter");

const totalCounter = document.getElementById("totalPages");

const titleBox = document.getElementById("bookTitle");

if(titleBox){

titleBox.innerHTML = decodeURIComponent(title || "Chishti Library");

}

viewer.src = pdfFile;


/*==========================
Page Variables
==========================*/

let currentPage = 1;

let totalPages = 0;

let zoom = 100;


/*==========================
Update Page Number
==========================*/

function updatePage(){

pageCounter.innerHTML = currentPage;

totalCounter.innerHTML = totalPages;

}


/*==========================
Next Page
==========================*/

function nextPage(){

currentPage++;

updatePage();

}


/*==========================
Previous Page
==========================*/

function previousPage(){

if(currentPage>1){

currentPage--;

updatePage();

}

}


/*==========================
Zoom In
==========================*/

function zoomIn(){

zoom += 10;

viewer.style.transform="scale("+(zoom/100)+")";

viewer.style.transformOrigin="top center";

}


/*==========================
Zoom Out
==========================*/

function zoomOut(){

if(zoom>50){

zoom -=10;

viewer.style.transform="scale("+(zoom/100)+")";

}

}


/*==========================
Fullscreen
==========================*/

function fullscreenReader(){

document.documentElement.requestFullscreen();

}


/*==========================
Print
==========================*/

function printBook(){

window.open(pdfFile);

}


/*==========================
Download
==========================*/

function downloadBook(){

const a=document.createElement("a");

a.href=pdfFile;

a.download="";

a.click();

}


/*==========================
Dark Theme
==========================*/

let dark=false;

function changeTheme(){

dark=!dark;

document.body.classList.toggle("dark");

}


/*==========================
Keyboard
==========================*/

document.addEventListener("keydown",function(e){

if(e.key=="ArrowRight"){

nextPage();

}

if(e.key=="ArrowLeft"){

previousPage();

}

});


/*==========================
Auto Save
==========================*/

window.addEventListener("beforeunload",()=>{

localStorage.setItem(

pdfFile,

currentPage

);

});


/*==========================
Restore
==========================*/

const save=localStorage.getItem(pdfFile);

if(save){

currentPage=Number(save);

updatePage();

}


/*==========================
Console
==========================*/

console.log("Reader Part 1 Loaded");

/*====================================
 CHISHTI LIBRARY READER PRO
 Part 2
 PDF Rendering Engine
====================================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let scale = 1.6;

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

async function loadPDF() {

    const loadingTask = pdfjsLib.getDocument(pdfFile);

    pdfDoc = await loadingTask.promise;

    totalPages = pdfDoc.numPages;

    document.getElementById("totalPages").innerHTML = totalPages;

    const saved = localStorage.getItem(pdfFile);

    if(saved){

        currentPage = Number(saved);

    }

    renderPage(currentPage);

}

/*============================
Render Page
============================*/

async function renderPage(num){

    const page = await pdfDoc.getPage(num);

    const viewport = page.getViewport({

        scale:scale

    });

    canvas.height = viewport.height;

    canvas.width = viewport.width;

    await page.render({

        canvasContext:ctx,

        viewport:viewport

    }).promise;

    document.getElementById("pageCounter").innerHTML = num;

    localStorage.setItem(pdfFile,num);

}

/*============================
Next Page
============================*/

function nextPage(){

    if(currentPage>=totalPages) return;

    currentPage++;

    renderPage(currentPage);

}

/*============================
Previous Page
============================*/

function previousPage(){

    if(currentPage<=1) return;

    currentPage--;

    renderPage(currentPage);

}

/*============================
Go To Page
============================*/

function goToPage(page){

    if(page<1) return;

    if(page>totalPages) return;

    currentPage = page;

    renderPage(page);

}

/*============================
Zoom In
============================*/

function zoomIn(){

    scale += 0.20;

    renderPage(currentPage);

}

/*============================
Zoom Out
============================*/

function zoomOut(){

    if(scale<=0.60) return;

    scale -=0.20;

    renderPage(currentPage);

}

/*============================
Keyboard Support
============================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        nextPage();

    }

    if(e.key==="ArrowLeft"){

        previousPage();

    }

    if(e.key==="+" || e.key==="="){

        zoomIn();

    }

    if(e.key==="-"){

        zoomOut();

    }

});

/*============================
Buttons
============================*/

document.getElementById("next")
.addEventListener("click",nextPage);

document.getElementById("prev")
.addEventListener("click",previousPage);

document.getElementById("zoomIn")
.addEventListener("click",zoomIn);

document.getElementById("zoomOut")
.addEventListener("click",zoomOut);

/*============================
Load
============================*/

loadPDF();

console.log("Reader Part 2 Loaded");

