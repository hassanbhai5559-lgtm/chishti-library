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

/*====================================
 CHISHTI LIBRARY READER PRO
 Part 3
 Premium Features
====================================*/

/*============================
 Reading Progress
============================*/

const progressBar = document.getElementById("readingProgress");

function updateProgress() {

    if (!progressBar) return;

    const percent = (currentPage / totalPages) * 100;

    progressBar.style.width = percent + "%";

}

/*============================
 Override renderPage
============================*/

const oldRender = renderPage;

renderPage = async function(page){

    await oldRender(page);

    updateProgress();

};

/*============================
 Bookmark
============================*/

function bookmarkPage(){

    const key = "bookmark_" + pdfFile;

    localStorage.setItem(key,currentPage);

    alert("Bookmark saved on page " + currentPage);

}

function openBookmark(){

    const key = "bookmark_" + pdfFile;

    const page = localStorage.getItem(key);

    if(page){

        currentPage = Number(page);

        renderPage(currentPage);

    }

}

/*============================
 Theme
============================*/

const themes = [

"light",

"dark",

"sepia",

"emerald"

];

let themeIndex = 0;

function changeTheme(){

    document.body.classList.remove(

        "light",

        "dark",

        "sepia",

        "emerald"

    );

    themeIndex++;

    if(themeIndex>=themes.length){

        themeIndex=0;

    }

    document.body.classList.add(

        themes[themeIndex]

    );

}

/*============================
 Fullscreen
============================*/

function fullscreenReader(){

    if(document.fullscreenElement){

        document.exitFullscreen();

    }

    else{

        document.documentElement.requestFullscreen();

    }

}

/*============================
 Print
============================*/

function printBook(){

    window.open(pdfFile);

}

/*============================
 Download
============================*/

function downloadBook(){

    const a=document.createElement("a");

    a.href=pdfFile;

    a.download="";

    a.click();

}

/*============================
 Thumbnail Sidebar
============================*/

const sidebar=document.getElementById("sidebar");

function toggleSidebar(){

    if(!sidebar) return;

    sidebar.classList.toggle("show");

}

/*============================
 Reader Animation
============================*/

canvas.style.transition=".35s";

function pageAnimation(){

    canvas.animate([

        {

            transform:"scale(.96)",

            opacity:.6

        },

        {

            transform:"scale(1)",

            opacity:1

        }

    ],

    {

        duration:350

    });

}

const renderOriginal=renderPage;

renderPage=async function(page){

    await renderOriginal(page);

    pageAnimation();

    updateProgress();

};

/*============================
 Buttons
============================*/

document.getElementById("bookmark")
?.addEventListener("click",bookmarkPage);

document.getElementById("theme")
?.addEventListener("click",changeTheme);

document.getElementById("fullscreen")
?.addEventListener("click",fullscreenReader);

document.getElementById("download")
?.addEventListener("click",downloadBook);

document.getElementById("print")
?.addEventListener("click",printBook);

document.getElementById("menu")
?.addEventListener("click",toggleSidebar);

/*============================
 Welcome
============================*/

console.log("Reader Part 3 Loaded");

/*=====================================
 CHISHTI LIBRARY READER PRO
 Part 4
 Premium Animation
======================================*/

/***************
LOADING
****************/

const loading=document.getElementById("loading");

window.onload=function(){

setTimeout(()=>{

loading.style.opacity="0";

loading.style.visibility="hidden";

},800);

}

/***************
PAGE SOUND
****************/

const flipSound=new Audio(

"https://cdn.pixabay.com/download/audio/2022/03/15/audio_115b9d3d64.mp3"

);

function playFlip(){

flipSound.currentTime=0;

flipSound.play();

}

/***************
NEXT
****************/

const next=document.getElementById("next");

next.onclick=function(){

playFlip();

nextPage();

}

/***************
PREVIOUS
****************/

const prev=document.getElementById("prev");

prev.onclick=function(){

playFlip();

previousPage();

}

/***************
DOUBLE CLICK
****************/

viewer.addEventListener("dblclick",()=>{

fullscreenReader();

});

/***************
MOUSE WHEEL ZOOM
****************/

viewer.addEventListener("wheel",(e)=>{

e.preventDefault();

if(e.deltaY<0){

zoomIn();

}else{

zoomOut();

}

});

/***************
READING TIMER
****************/

let seconds=0;

setInterval(()=>{

seconds++;

const time=document.getElementById("readingTime");

if(time){

time.innerHTML=

Math.floor(seconds/60)+" min";

}

},1000);

/***************
BOOKMARK AUTO
****************/

setInterval(()=>{

localStorage.setItem(

pdfFile+"_last",

currentPage

);

},5000);

/***************
RESTORE
****************/

const last=

localStorage.getItem(pdfFile+"_last");

if(last){

currentPage=Number(last);

renderPage(currentPage);

}

/***************
PROGRESS
****************/

setInterval(()=>{

const progress=

(currentPage/totalPages)*100;

const bar=document.getElementById("progress");

if(bar){

bar.style.width=progress+"%";

}

},200);

/***************
SHORTCUTS
****************/

document.addEventListener("keydown",(e)=>{

if(e.code==="Space"){

nextPage();

}

if(e.code==="KeyB"){

bookmarkPage();

}

if(e.code==="KeyF"){

fullscreenReader();

}

if(e.code==="KeyP"){

printBook();

}

});

/***************
END
****************/

console.log("Reader Part 4 Loaded");


