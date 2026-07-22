/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 1 - Foundation
=========================================*/

// PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js";

/*=========================================
 URL PARAMETERS
=========================================*/

const params = new URLSearchParams(window.location.search);

const pdfFile = params.get("book");
const bookTitle = params.get("title") || "Chishti Library";

/*=========================================
 ELEMENTS
=========================================*/

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");

const pageCounter = document.getElementById("pageCounter");
const totalPagesText = document.getElementById("totalPages");

const titleElement = document.getElementById("bookTitle");

/*=========================================
 PDF VARIABLES
=========================================*/

let pdfDoc = null;

let currentPage = 1;

let totalPages = 0;

let scale = 1.4;

let isRendering = false;

let pendingPage = null;

/*=========================================
 SHOW TITLE
=========================================*/

if (titleElement) {

    titleElement.textContent = decodeURIComponent(bookTitle);

}

document.title = decodeURIComponent(bookTitle);

/*=========================================
 CHECK BOOK
=========================================*/

if (!pdfFile) {

    if (loading) {

        loading.innerHTML = `
            <h2>❌ Book Not Found</h2>
            <p>Please open this page from Chishti Library.</p>
        `;

    }

    throw new Error("PDF file missing.");

}

/*=========================================
 HELPER FUNCTIONS
=========================================*/

function updatePageInfo() {

    if (pageCounter)
        pageCounter.textContent = currentPage;

    if (totalPagesText)
        totalPagesText.textContent = totalPages;

}

function showLoader(text = "Opening Chishti Reader...") {

    if (!loading) return;

    loading.style.display = "flex";

    loading.innerHTML = `<h2>${text}</h2>`;

}

function hideLoader() {

    if (!loading) return;

    loading.style.display = "none";

}

console.log("✅ Reader Part 1 Loaded");

/*=========================================
 CHISHTI READER PRO
 pdf-reader.js
 PART 2
 LOAD PDF + RENDER
=========================================*/

// ========================
// LOAD PDF
// ========================

async function loadBook() {

    if (!pdfFile) {

        document.getElementById("loading").innerHTML =
            "Book Not Found";

        return;

    }

    try {

        const loadingTask =
            pdfjsLib.getDocument(decodeURIComponent(pdfFile));

        pdf = await loadingTask.promise;

        totalPages = pdf.numPages;

        document.getElementById("totalPages").innerText =
            totalPages;

        // Restore Bookmark
        const last =
            localStorage.getItem(pdfFile);

        if (last) {

            pageNum = parseInt(last);

        }

        renderPage(pageNum);

        hideLoader();

    } catch (error) {

        console.error(error);

        document.getElementById("loading").innerHTML =
            "Failed To Open PDF";

    }

}

// ========================
// RENDER PAGE
// ========================

async function renderPage(num) {

    rendering = true;

    const page =
        await pdf.getPage(num);

    const viewport =
        page.getViewport({

            scale: zoom

        });

    canvas.width =
        viewport.width;

    canvas.height =
        viewport.height;

    const renderContext = {

        canvasContext: ctx,

        viewport: viewport

    };

    await page.render(renderContext).promise;

    document.getElementById("pageCounter").innerText =
        num;

    updateProgress();

    rendering = false;

    if (pendingPage !== null) {

        renderPage(pendingPage);

        pendingPage = null;

    }

}

// ========================
// QUEUE RENDER
// ========================

function queueRender(num) {

    if (rendering) {

        pendingPage = num;

    } else {

        renderPage(num);

    }

}

// ========================
// START
// ========================

loadBook();

console.log("✅ Reader Part 2 Loaded");

/*=========================================
 CHISHTI READER PRO
 pdf-reader.js
 PART 3
 Render PDF Pages
=========================================*/

/*========================
RENDER PAGE
========================*/

async function renderPage(pageNumber){

    rendering = true;

    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({
        scale: zoom
    });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const renderContext = {
        canvasContext: ctx,
        viewport: viewport
    };

    await page.render(renderContext).promise;

    document.getElementById("pageCounter").textContent = pageNumber;
    document.getElementById("totalPages").textContent = totalPages;

    rendering = false;

    if(pendingPage !== null){

        const next = pendingPage;
        pendingPage = null;

        renderPage(next);

    }

    updateProgress();

}

/*========================
QUEUE PAGE
========================*/

function queueRender(pageNumber){

    if(rendering){

        pendingPage = pageNumber;

    }else{

        renderPage(pageNumber);

    }

}

/*========================
READING PROGRESS
========================*/

function updateProgress(){

    const percent = (pageNum / totalPages) * 100;

    const bar = document.getElementById("readingProgress");

    if(bar){

        bar.style.width = percent + "%";

    }

}

/*========================
PAGE TURN EFFECT
========================*/

function animatePage(){

    canvas.classList.remove("page-turn");

    void canvas.offsetWidth;

    canvas.classList.add("page-turn");

}

console.log("✅ Part 3 Loaded");

/*=========================================
 CHISHTI READER PRO
 pdf-reader.js
 PART 4
 Controls + Features
=========================================*/

/*========================
NEXT PAGE
========================*/

function nextPage(){

    if(pageNum >= totalPages) return;

    pageNum++;

    queueRender(pageNum);

    animatePage();

}

/*========================
PREVIOUS PAGE
========================*/

function previousPage(){

    if(pageNum <= 1) return;

    pageNum--;

    queueRender(pageNum);

    animatePage();

}

/*========================
ZOOM IN
========================*/

function zoomIn(){

    zoom += 0.2;

    queueRender(pageNum);

}

/*========================
ZOOM OUT
========================*/

function zoomOut(){

    if(zoom <= 0.8) return;

    zoom -= 0.2;

    queueRender(pageNum);

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
DOWNLOAD
========================*/

function downloadBook(){

    const a = document.createElement("a");

    a.href = pdfFile;

    a.download = "";

    a.click();

}

/*========================
PRINT
========================*/

function printBook(){

    window.open(pdfFile);

}

/*========================
BOOKMARK
========================*/

function bookmarkPage(){

    localStorage.setItem(

        "bookmark_"+pdfFile,

        pageNum

    );

    alert("Bookmark Saved");

}

/*========================
RESTORE BOOKMARK
========================*/

const savedPage =

localStorage.getItem(

"bookmark_"+pdfFile

);

if(savedPage){

    pageNum = parseInt(savedPage);

}

/*========================
BUTTON EVENTS
========================*/

document.getElementById("next").onclick = nextPage;

document.getElementById("prev").onclick = previousPage;

document.getElementById("zoomIn").onclick = zoomIn;

document.getElementById("zoomOut").onclick = zoomOut;

document.getElementById("fullscreen").onclick = fullscreenBook;

document.getElementById("download").onclick = downloadBook;

document.getElementById("print").onclick = printBook;

document.getElementById("bookmark").onclick = bookmarkPage;

/*========================
KEYBOARD
========================*/

document.addEventListener("keydown",(e)=>{

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

});

console.log("✅ Chishti Reader Ready");

/*=========================================
 CHISHTI READER PRO
 PART 5
 Professional Features
=========================================*/

/*========================
LOADER
========================*/

function hideLoader(){

    const loader = document.getElementById("loading");

    if(!loader) return;

    setTimeout(()=>{

        loader.style.opacity="0";

        loader.style.visibility="hidden";

        setTimeout(()=>{

            loader.remove();

        },500);

    },600);

}

/*========================
DOUBLE CLICK ZOOM
========================*/

canvas.addEventListener("dblclick",()=>{

    if(zoom<2.6){

        zoom+=0.4;

    }else{

        zoom=1.4;

    }

    queueRender(pageNum);

});

/*========================
MOUSE WHEEL ZOOM
========================*/

canvas.addEventListener("wheel",(e)=>{

    e.preventDefault();

    if(e.deltaY<0){

        zoom+=0.1;

    }else{

        if(zoom>0.8){

            zoom-=0.1;

        }

    }

    queueRender(pageNum);

});

/*========================
MOBILE SWIPE
========================*/

let startX=0;

let endX=0;

canvas.addEventListener("touchstart",(e)=>{

    startX=e.changedTouches[0].screenX;

});

canvas.addEventListener("touchend",(e)=>{

    endX=e.changedTouches[0].screenX;

    if(endX<startX-80){

        nextPage();

    }

    if(endX>startX+80){

        previousPage();

    }

});

/*========================
SAVE LAST PAGE
========================*/

window.addEventListener("beforeunload",()=>{

    localStorage.setItem(

        "bookmark_"+pdfFile,

        pageNum

    );

});

/*========================
PREVENT IMAGE DRAG
========================*/

canvas.addEventListener("dragstart",(e)=>{

    e.preventDefault();

});

/*========================
DISABLE RIGHT CLICK
========================*/

document.addEventListener("contextmenu",(e)=>{

    e.preventDefault();

});

/*========================
TITLE
========================*/

document.title=

decodeURIComponent(bookTitle)+" | Chishti Reader";

/*========================
CONSOLE
========================*/

console.log("📖 Chishti Reader Professional Ready");
