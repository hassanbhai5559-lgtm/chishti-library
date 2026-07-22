/*=========================================
CHISHTI READER
reader.js
PART 3
=========================================*/

// PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.5.136/pdf.worker.min.js";

/*=========================
VARIABLES
=========================*/

const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d");

const loading = document.getElementById("loading");

const pageNumber = document.getElementById("pageNumber");

const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");

const zoomIn = document.getElementById("zoomIn");
const zoomOut = document.getElementById("zoomOut");

let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;

let scale = 1.5;

let rendering = false;

/*=========================
GET PDF FROM URL
=========================*/

const params = new URLSearchParams(window.location.search);

const params = new URLSearchParams(window.location.search);

const book = params.get("book");

const pdfFile =
"https://hassanbhai5559-lgtm.github.io/chishti-library/" + book;

console.log(pdfFile);

if (!pdfFile) {

    loading.innerHTML = "❌ No Book Selected";

    throw new Error("No PDF Found");

}

/*=========================
LOAD PDF
=========================*/

async function loadPDF() {

    try {

        pdfDoc = await pdfjsLib.getDocument(pdfFile).promise;

        totalPages = pdfDoc.numPages;

        loading.style.display = "none";

        renderPage(currentPage);

    }

    catch (err) {

        console.error(err);

        loading.innerHTML = "❌ Failed To Load PDF";

    }

}

/*=========================
RENDER PAGE
=========================*/

async function renderPage(num) {

    rendering = true;

    const page = await pdfDoc.getPage(num);

    const viewport = page.getViewport({

        scale: scale

    });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({

        canvasContext: ctx,

        viewport: viewport

    }).promise;

    rendering = false;

    pageNumber.innerHTML =
        "Page " + currentPage + " / " + totalPages;

}

/*=========================
NEXT PAGE
=========================*/

nextBtn.onclick = () => {

    if (currentPage >= totalPages) return;

    currentPage++;

    renderPage(currentPage);

};

/*=========================
PREVIOUS PAGE
=========================*/

prevBtn.onclick = () => {

    if (currentPage <= 1) return;

    currentPage--;

    renderPage(currentPage);

};

/*=========================
ZOOM IN
=========================*/

zoomIn.onclick = () => {

    scale += 0.2;

    renderPage(currentPage);

};

/*=========================
ZOOM OUT
=========================*/

zoomOut.onclick = () => {

    if (scale <= 0.8) return;

    scale -= 0.2;

    renderPage(currentPage);

};

/*=========================
KEYBOARD
=========================*/

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowRight") {

        nextBtn.click();

    }

    if (e.key === "ArrowLeft") {

        prevBtn.click();

    }

});

/*=========================
START
=========================*/

loadPDF();

console.log("✅ Chishti Reader Loaded");

/*=========================================
CHISHTI READER
PART 4
EXTRA FEATURES
=========================================*/

/*=========================
FULLSCREEN
=========================*/

function toggleFullscreen(){

if(!document.fullscreenElement){

document.documentElement.requestFullscreen();

}else{

document.exitFullscreen();

}

}

/*=========================
DOUBLE CLICK ZOOM
=========================*/

canvas.addEventListener("dblclick",()=>{

if(scale<2.5){

scale+=0.5;

}else{

scale=1.5;

}

renderPage(currentPage);

});

/*=========================
MOUSE WHEEL ZOOM
=========================*/

canvas.addEventListener("wheel",(e)=>{

e.preventDefault();

if(e.deltaY<0){

scale+=0.1;

}else{

if(scale>0.8){

scale-=0.1;

}

}

renderPage(currentPage);

});

/*=========================
TOUCH SWIPE
=========================*/

let touchStartX=0;

let touchEndX=0;

canvas.addEventListener("touchstart",(e)=>{

touchStartX=e.changedTouches[0].screenX;

});

canvas.addEventListener("touchend",(e)=>{

touchEndX=e.changedTouches[0].screenX;

handleSwipe();

});

function handleSwipe(){

if(touchEndX<touchStartX-80){

if(currentPage<totalPages){

currentPage++;

renderPage(currentPage);

}

}

if(touchEndX>touchStartX+80){

if(currentPage>1){

currentPage--;

renderPage(currentPage);

}

}

}

/*=========================
LOADING TITLE
=========================*/

document.title="📖 Chishti Reader";

/*=========================
PREVENT RIGHT CLICK
=========================*/

document.addEventListener("contextmenu",(e)=>{

e.preventDefault();

});

/*=========================
DISABLE IMAGE DRAG
=========================*/

canvas.addEventListener("dragstart",(e)=>{

e.preventDefault();

});

console.log("✅ Reader Part 4 Loaded");
