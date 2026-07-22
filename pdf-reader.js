/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 1 - Foundation
=========================================*/

// ================================
// PDF.js Worker
// ================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// ================================
// URL Parameters
// ================================

const params = new URLSearchParams(window.location.search);

const pdfFile = params.get("book");

const bookTitle =
params.get("title") || "Chishti Library";

// ================================
// HTML Elements
// ================================

const canvas =
document.getElementById("pdfCanvas");

const ctx =
canvas.getContext("2d");

const loading =
document.getElementById("loading");

const title =
document.getElementById("bookTitle");

const pageCounter =
document.getElementById("pageCounter");

const totalPagesText =
document.getElementById("totalPages");

const progressBar =
document.getElementById("readingProgress");

// ================================
// PDF Variables
// ================================

let pdfDoc = null;

let currentPage = 1;

let totalPages = 0;

let zoom = 1.4;

let rendering = false;

let pendingPage = null;

// ================================
// Show Title
// ================================

title.textContent =
decodeURIComponent(bookTitle);

document.title =
decodeURIComponent(bookTitle);

// ================================
// Book Check
// ================================

if (!pdfFile) {

    loading.innerHTML = `
        <h2>❌ Book Not Found</h2>
        <p>Please open this book from Chishti Library.</p>
    `;

    throw new Error("No PDF Selected");

}

console.log("✅ Reader Part 1 Loaded");


/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 2 - Load PDF
=========================================*/

// ================================
// Load PDF
// ================================

async function loadBook() {

    try {

        loading.innerHTML = `
            <h2>Opening Chishti Reader...</h2>
        `;

        const loadingTask = pdfjsLib.getDocument({

            url: decodeURIComponent(pdfFile)

        });

        pdfDoc = await loadingTask.promise;

        totalPages = pdfDoc.numPages;

        // Restore Last Page
        const savedPage = localStorage.getItem(

            "bookmark_" + pdfFile

        );

        if (savedPage) {

            currentPage = parseInt(savedPage);

        }

        totalPagesText.textContent = totalPages;

        renderPage(currentPage);

        setTimeout(() => {

            loading.style.display = "none";

        }, 500);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = `

            <h2>❌ Failed To Open PDF</h2>

            <p>
            Check PDF path or filename.
            </p>

        `;

    }

}

// ================================
// Start Reader
// ================================

loadBook();

console.log("✅ Reader Part 2 Loaded");

/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 3 - Render PDF
=========================================*/

// ================================
// Render PDF Page
// ================================

async function renderPage(pageNumber) {

    rendering = true;

    const page = await pdfDoc.getPage(pageNumber);

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

    // Update Page Counter

    pageCounter.textContent = pageNumber;

    totalPagesText.textContent = totalPages;

    // Update Progress Bar

    if (progressBar) {

        const percent = (pageNumber / totalPages) * 100;

        progressBar.style.width = percent + "%";

    }

    rendering = false;

    // Render queued page if any

    if (pendingPage !== null) {

        const nextPage = pendingPage;

        pendingPage = null;

        renderPage(nextPage);

    }

}

// ================================
// Queue Rendering
// ================================

function queueRender(pageNumber) {

    if (rendering) {

        pendingPage = pageNumber;

    } else {

        renderPage(pageNumber);

    }

}

console.log("✅ Reader Part 3 Loaded");

/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 4 - Controls
=========================================*/

// ================================
// Next Page
// ================================

function nextPage() {

    if (currentPage >= totalPages) return;

    currentPage++;

    queueRender(currentPage);

    saveBookmark();

}

// ================================
// Previous Page
// ================================

function previousPage() {

    if (currentPage <= 1) return;

    currentPage--;

    queueRender(currentPage);

    saveBookmark();

}

// ================================
// Zoom In
// ================================

function zoomIn() {

    zoom += 0.2;

    queueRender(currentPage);

}

// ================================
// Zoom Out
// ================================

function zoomOut() {

    if (zoom <= 0.8) return;

    zoom -= 0.2;

    queueRender(currentPage);

}

// ================================
// Fullscreen
// ================================

function fullscreenBook() {

    if (!document.fullscreenElement) {

        document.documentElement.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

}

// ================================
// Download PDF
// ================================

function downloadBook() {

    const a = document.createElement("a");

    a.href = decodeURIComponent(pdfFile);

    a.download = "";

    a.click();

}

// ================================
// Print PDF
// ================================

function printBook() {

    window.open(decodeURIComponent(pdfFile), "_blank");

}

// ================================
// Bookmark
// ================================

function saveBookmark() {

    localStorage.setItem(

        "bookmark_" + pdfFile,

        currentPage

    );

}

function bookmarkPage() {

    saveBookmark();

    alert("✅ Bookmark Saved");

}

// ================================
// Button Events
// ================================

document.getElementById("next").onclick = nextPage;

document.getElementById("prev").onclick = previousPage;

document.getElementById("zoomIn").onclick = zoomIn;

document.getElementById("zoomOut").onclick = zoomOut;

document.getElementById("download").onclick = downloadBook;

document.getElementById("print").onclick = printBook;

document.getElementById("fullscreen").onclick = fullscreenBook;

document.getElementById("bookmark").onclick = bookmarkPage;

// ================================
// Keyboard
// ================================

document.addEventListener("keydown", function(e){

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

console.log("✅ Reader Part 4 Loaded");

/*=========================================
 CHISHTI LIBRARY PDF READER
 Part 5 - Professional Features
=========================================*/

// ================================
// Double Click Zoom
// ================================

canvas.addEventListener("dblclick", () => {

    if (zoom < 2.6) {

        zoom += 0.4;

    } else {

        zoom = 1.4;

    }

    queueRender(currentPage);

});

// ================================
// Mouse Wheel Zoom
// ================================

canvas.addEventListener("wheel", (e) => {

    e.preventDefault();

    if (e.deltaY < 0) {

        zoom += 0.1;

    } else {

        if (zoom > 0.8) {

            zoom -= 0.1;

        }

    }

    queueRender(currentPage);

});

// ================================
// Mobile Swipe
// ================================

let startX = 0;
let endX = 0;

canvas.addEventListener("touchstart", (e) => {

    startX = e.changedTouches[0].screenX;

});

canvas.addEventListener("touchend", (e) => {

    endX = e.changedTouches[0].screenX;

    if (endX < startX - 80) {

        nextPage();

    }

    if (endX > startX + 80) {

        previousPage();

    }

});

// ================================
// Auto Save Page
// ================================

window.addEventListener("beforeunload", () => {

    saveBookmark();

});

// ================================
// Page Turn Animation
// ================================

function animatePage() {

    canvas.classList.remove("page-turn");

    void canvas.offsetWidth;

    canvas.classList.add("page-turn");

}

// Animation on page change

const oldNext = nextPage;
nextPage = function () {

    oldNext();

    animatePage();

};

const oldPrev = previousPage;
previousPage = function () {

    oldPrev();

    animatePage();

};

// ================================
// Prevent Image Drag
// ================================

canvas.addEventListener("dragstart", (e) => {

    e.preventDefault();

});

// ================================
// Disable Right Click
// ================================

document.addEventListener("contextmenu", (e) => {

    e.preventDefault();

});

// ================================
// Reader Loaded
// ================================

console.log("📖 Chishti Reader Professional Loaded Successfully");
