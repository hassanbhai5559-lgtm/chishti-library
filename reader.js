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

const pdfFile = params.get("book");

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
