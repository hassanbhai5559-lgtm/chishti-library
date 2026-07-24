/*====================================================
 CHISHTI READER ENGINE v2
 PART 1
 Foundation
====================================================*/

/*=========================
 PDF.js Worker
=========================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*=========================
 URL PARAMETERS
=========================*/

const urlParams = new URLSearchParams(window.location.search);

const pdfURL =
decodeURIComponent(urlParams.get("book") || "");

const bookTitle =
decodeURIComponent(urlParams.get("title") || "Chishti Library");

/*=========================
 CANVAS
=========================*/

const leftCanvas =
document.getElementById("leftCanvas");

const rightCanvas =
document.getElementById("rightCanvas");

const leftCtx =
leftCanvas.getContext("2d");

const rightCtx =
rightCanvas.getContext("2d");

/*=========================
 BOOK ELEMENT
=========================*/

const book =
document.querySelector(".book");

/*=========================
 TOOLBAR
=========================*/

const titleElement =
document.getElementById("bookTitle");

const pageCounter =
document.getElementById("pageCounter");

const totalPageElement =
document.getElementById("totalPages");

/*=========================
 PDF VARIABLES
=========================*/

let pdfDocument = null;

let totalPages = 0;

let currentPage = 1;

let zoom = 1.5;

let rendering = false;

/*=========================
 CHECK BOOK
=========================*/

if(!pdfURL){

    alert("Book Not Found");

    throw new Error("No PDF Selected");

}

/*=========================
 WINDOW TITLE
=========================*/

document.title = bookTitle;

if(titleElement){

    titleElement.textContent =
    bookTitle;

}

console.log("✅ CHISHTI READER ENGINE v2");
console.log("Book :", pdfURL);
console.log("Title :", bookTitle);

/*====================================================
 CHISHTI READER ENGINE v2
 PART 2
 PDF Loader
====================================================*/

/*=========================
 LOAD PDF
=========================*/

async function loadPDF(){

    try{

        console.log("Loading PDF...");

        const loadingTask =
        pdfjsLib.getDocument(pdfURL);

        pdfDocument =
        await loadingTask.promise;

        totalPages =
        pdfDocument.numPages;

        console.log("PDF Loaded Successfully");
        console.log("Total Pages :", totalPages);

        return true;

    }

    catch(error){

        console.error(error);

        alert("Unable To Open PDF");

        return false;

    }

}

/*=========================
 INITIALIZE
=========================*/

async function initializeReader(){

    const loaded =
    await loadPDF();

    if(!loaded)
        return;

    console.log("Reader Initialized");

}

/*====================================================
 CHISHTI READER ENGINE v2
 PART 3
 Two Page Renderer
====================================================*/

/*=========================
 RENDER SINGLE PAGE
=========================*/

async function renderPage(pageNumber, canvas, context){

    if(pageNumber > totalPages){

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        return;

    }

    const page =
    await pdfDocument.getPage(pageNumber);

    const viewport =
    page.getViewport({
        scale: zoom
    });

    canvas.width =
    viewport.width;

    canvas.height =
    viewport.height;

    await page.render({

        canvasContext: context,

        viewport: viewport

    }).promise;

}

/*=========================
 RENDER CURRENT SPREAD
=========================*/

async function renderSpread(){

    if(rendering)
        return;

    rendering = true;

    await renderPage(

        currentPage,

        leftCanvas,

        leftCtx

    );

    await renderPage(

        currentPage + 1,

        rightCanvas,

        rightCtx

    );

    rendering = false;

    console.log(
        "Spread Rendered :",
        currentPage,
        "-",
        currentPage + 1
    );

}

/*=========================
 START FIRST SPREAD
=========================*/

initializeReader().then(()=>{

    renderSpread();

});

/*====================================================
 CHISHTI READER ENGINE v2
 PART 4
 Navigation Engine
====================================================*/

/*=========================
 PAGE COUNTER
=========================*/

function updatePageCounter(){

    if(pageCounter){

        const secondPage =
        Math.min(currentPage + 1, totalPages);

        pageCounter.textContent =
        currentPage + " - " + secondPage;

    }

    if(totalPageElement){

        totalPageElement.textContent =
        totalPages;

    }

}

/*=========================
 NEXT SPREAD
=========================*/

async function nextSpread(){

    if(rendering) return;

    if(currentPage + 2 > totalPages)
        return;

    currentPage += 2;

    if(book){

        book.classList.remove("flip-prev");

        void book.offsetWidth;

        book.classList.add("flip-next");

    }

    await renderSpread();

    updatePageCounter();

}

/*=========================
 PREVIOUS SPREAD
=========================*/

async function previousSpread(){

    if(rendering) return;

    if(currentPage <= 1)
        return;

    currentPage -= 2;

    if(currentPage < 1)
        currentPage = 1;

    if(book){

        book.classList.remove("flip-next");

        void book.offsetWidth;

        book.classList.add("flip-prev");

    }

    await renderSpread();

    updatePageCounter();

}

/*=========================
 KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        nextSpread();

    }

    if(e.key==="ArrowLeft"){

        previousSpread();

    }

});

/*=========================
 BUTTONS
=========================*/

const nextButton =
document.getElementById("nextPage");

const prevButton =
document.getElementById("prevPage");

if(nextButton){

    nextButton.onclick =
    nextSpread;

}

if(prevButton){

    prevButton.onclick =
    previousSpread;

}

/*=========================
 FIRST COUNTER
=========================*/

setTimeout(()=>{

    updatePageCounter();

},300);

console.log("✅ Navigation Engine Ready");

/*====================================================
 CHISHTI READER ENGINE v2
 PART 5
 Zoom Engine
====================================================*/

/*=========================
 MIN / MAX ZOOM
=========================*/

const MIN_ZOOM = 0.8;

const MAX_ZOOM = 3.0;

const ZOOM_STEP = 0.20;

/*=========================
 APPLY ZOOM
=========================*/

async function applyZoom(){

    if(rendering) return;

    await renderSpread();

}

/*=========================
 ZOOM IN
=========================*/

async function zoomIn(){

    if(zoom >= MAX_ZOOM)
        return;

    zoom += ZOOM_STEP;

    await applyZoom();

}

/*=========================
 ZOOM OUT
=========================*/

async function zoomOut(){

    if(zoom <= MIN_ZOOM)
        return;

    zoom -= ZOOM_STEP;

    await applyZoom();

}

/*=========================
 TOOLBAR BUTTONS
=========================*/

const zoomInButton =
document.getElementById("zoomIn");

const zoomOutButton =
document.getElementById("zoomOut");

if(zoomInButton){

    zoomInButton.onclick =
    zoomIn;

}

if(zoomOutButton){

    zoomOutButton.onclick =
    zoomOut;

}

/*=========================
 MOUSE WHEEL
=========================*/

book.addEventListener("wheel",async(e)=>{

    e.preventDefault();

    if(e.deltaY<0){

        zoomIn();

    }else{

        zoomOut();

    }

},{passive:false});

/*=========================
 DOUBLE CLICK
=========================*/

book.addEventListener("dblclick",async()=>{

    if(zoom<2.5){

        zoom=2.5;

    }else{

        zoom=1.5;

    }

    await applyZoom();

});

/*=========================
 KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="+" || e.key==="="){

        zoomIn();

    }

    if(e.key==="-"){

        zoomOut();

    }

});

console.log("✅ Zoom Engine Ready");

/*====================================================
 CHISHTI READER
 PART 6
 PREMIUM BOTTOM NAVIGATION
====================================================*/

/*=========================
BOTTOM BAR
=========================*/

.reader-bottom{

position:fixed;

left:50%;

bottom:20px;

transform:translateX(-50%);

width:95%;

max-width:900px;

height:74px;

display:flex;

justify-content:space-between;

align-items:center;

padding:0 18px;

background:rgba(35,0,0,.88);

backdrop-filter:blur(18px);

border:1px solid rgba(212,175,55,.18);

border-radius:22px;

box-shadow:

0 15px 40px rgba(0,0,0,.45);

z-index:9999;

}

/*=========================
GROUP
=========================*/

.bottom-group{

display:flex;

align-items:center;

gap:10px;

}

/*=========================
BUTTON
=========================*/

.reader-btn{

width:48px;

height:48px;

border:none;

outline:none;

cursor:pointer;

border-radius:14px;

background:rgba(255,255,255,.06);

color:#d4af37;

font-size:18px;

transition:.25s;

}

.reader-btn:hover{

background:#d4af37;

color:#2b0000;

transform:translateY(-2px);

box-shadow:0 0 18px rgba(212,175,55,.45);

}

/*=========================
PAGE COUNTER
=========================*/

.page-display{

padding:10px 18px;

border-radius:40px;

background:rgba(255,255,255,.05);

border:1px solid rgba(212,175,55,.15);

font-size:15px;

font-weight:600;

color:#fff;

min-width:150px;

text-align:center;

}

/*=========================
MOBILE
=========================*/

@media(max-width:768px){

.reader-bottom{

width:98%;

height:66px;

padding:0 10px;

}

.reader-btn{

width:42px;

height:42px;

font-size:16px;

}

.page-display{

min-width:110px;

font-size:13px;

}

}

