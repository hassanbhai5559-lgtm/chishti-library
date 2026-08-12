/* =========================================================
   CHISHTI READER
   reader.js
   Simple Fast PDF Reader
========================================================= */


/* =========================================================
   PDF.JS
========================================================= */

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   PDF URL

   Expected URL:
   reader.html?book=books/my-book.pdf
========================================================= */

const readerParams =
    new URLSearchParams(
        window.location.search
    );

const PDF_URL =
    readerParams.get("book");

console.log(
    "PDF URL:",
    PDF_URL
);


/* =========================================================
   SETTINGS
========================================================= */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;


/* =========================================================
   DOM
========================================================= */

const bookTitle =
    document.getElementById("bookTitle");

const readerArea =
    document.getElementById("readerArea");

const bookViewport =
    document.getElementById("bookViewport");

const pageWrapper =
    document.getElementById("pageWrapper");

const pdfCanvas =
    document.getElementById("pdfCanvas");

const previousPageButton =
    document.getElementById("previousPageButton");

const nextPageButton =
    document.getElementById("nextPageButton");

const pageNumberInput =
    document.getElementById("pageNumberInput");

const totalPages =
    document.getElementById("totalPages");

const zoomOutButton =
    document.getElementById("zoomOutButton");

const resetZoomButton =
    document.getElementById("resetZoomButton");

const zoomInButton =
    document.getElementById("zoomInButton");

const zoomLevel =
    document.getElementById("zoomLevel");

const errorScreen =
    document.getElementById("errorScreen");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const readerStatus =
    document.getElementById("readerStatus");


/* =========================================================
   CANVAS
========================================================= */

const context =
    pdfCanvas
        ? pdfCanvas.getContext("2d", {
            alpha: false
        })
        : null;


/* =========================================================
   STATE
========================================================= */

let pdfDocument = null;

let currentPage = 1;

let pageCount = 0;

let zoom = DEFAULT_ZOOM;

let rendering = false;

let pendingPage = null;

let renderRequest = 0;


/* =========================================================
   TITLE FROM URL
========================================================= */

function setBookTitle() {

    if (!bookTitle) {
        return;
    }

    if (!PDF_URL) {

        bookTitle.textContent =
            "No book selected";

        return;
    }

    try {

        const cleanURL =
            PDF_URL.split("?")[0];

        const filename =
            cleanURL
                .split("/")
                .pop();

        if (!filename) {

            bookTitle.textContent =
                "Digital Book";

            return;
        }

        const decoded =
            decodeURIComponent(
                filename
            );

        const title =
            decoded
                .replace(
                    /\.pdf$/i,
                    ""
                )
                .replace(
                    /[-_]+/g,
                    " "
                );

        bookTitle.textContent =
            title || "Digital Book";

    } catch (error) {

        console.error(
            "Title error:",
            error
        );

        bookTitle.textContent =
            "Digital Book";
    }
}


/* =========================================================
   STATUS
========================================================= */

function announce(message) {

    if (readerStatus) {

        readerStatus.textContent =
            message;
    }
}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (errorMessage) {

        errorMessage.textContent =
            message;
    }

    if (errorScreen) {

        errorScreen.hidden =
            false;
    }
}


function hideError() {

    if (errorScreen) {

        errorScreen.hidden =
            true;
    }
}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    if (pageNumberInput) {

        pageNumberInput.value =
            currentPage;
    }

    if (totalPages) {

        totalPages.textContent =
            pageCount;
    }

    if (zoomLevel) {

        zoomLevel.textContent =
            `${Math.round(zoom * 100)}%`;
    }

    if (previousPageButton) {

        previousPageButton.disabled =
            !pdfDocument ||
            currentPage <= 1;
    }

    if (nextPageButton) {

        nextPageButton.disabled =
            !pdfDocument ||
            currentPage >= pageCount;
    }
}


/* =========================================================
   FIT PAGE
========================================================= */

function calculateScale(page) {

    const viewport =
        page.getViewport({
            scale: 1
        });

    const availableWidth =
        Math.max(
            200,
            bookViewport.clientWidth - 40
        );

    const availableHeight =
        Math.max(
            200,
            bookViewport.clientHeight - 40
        );

    const widthScale =
        availableWidth /
        viewport.width;

    const heightScale =
        availableHeight /
        viewport.height;

    const fitScale =
        Math.min(
            widthScale,
            heightScale
        );

    return Math.max(
        0.25,
        fitScale * zoom
    );
}


/* =========================================================
   RENDER PAGE
========================================================= */

async function renderPage(pageNumber) {

    if (!pdfDocument) {
        return;
    }

    pageNumber =
        Math.max(
            1,
            Math.min(
                pageNumber,
                pageCount
            )
        );

    if (rendering) {

        pendingPage =
            pageNumber;

        return;
    }

    rendering =
        true;

    if (previousPageButton) {
        previousPageButton.disabled = true;
    }

    if (nextPageButton) {
        nextPageButton.disabled = true;
    }

    const requestID =
        ++renderRequest;

    try {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );

        if (
            requestID !==
            renderRequest
        ) {

            return;
        }

        const scale =
            calculateScale(page);

        const viewport =
            page.getViewport({
                scale: scale
            });

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );

        pdfCanvas.width =
            Math.floor(
                viewport.width *
                pixelRatio
            );

        pdfCanvas.height =
            Math.floor(
                viewport.height *
                pixelRatio
            );

        pdfCanvas.style.width =
            `${viewport.width}px`;

        pdfCanvas.style.height =
            `${viewport.height}px`;

        pageWrapper.style.width =
            `${viewport.width}px`;

        pageWrapper.style.height =
            `${viewport.height}px`;

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            viewport.width,
            viewport.height
        );

        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        if (
            requestID !==
            renderRequest
        ) {

            return;
        }

        currentPage =
            pageNumber;

        updateUI();

        announce(
            `Page ${currentPage} of ${pageCount}`
        );

    } catch (error) {

        console.error(
            "PDF render error:",
            error
        );

        showError(
            "This PDF page could not be rendered."
        );

    } finally {

        rendering =
            false;

        updateUI();

        if (
            pendingPage !== null
        ) {

            const nextPage =
                pendingPage;

            pendingPage =
                null;

            if (
                nextPage !==
                currentPage
            ) {

                renderPage(
                    nextPage
                );
            }
        }
    }
}


/* =========================================================
   GO TO PAGE
========================================================= */

function goToPage(value) {

    if (!pdfDocument) {
        return;
    }

    let page =
        Number(value);

    if (
        !Number.isFinite(page)
    ) {

        page =
            currentPage;
    }

    page =
        Math.round(page);

    page =
        Math.max(
            1,
            Math.min(
                page,
                pageCount
            )
        );

    renderPage(page);
}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {

    if (
        !pdfDocument ||
        currentPage <= 1
    ) {

        return;
    }

    goToPage(
        currentPage - 1
    );
}


/* =========================================================
   NEXT PAGE
========================================================= */

function nextPage() {

    if (
        !pdfDocument ||
        currentPage >= pageCount
    ) {

        return;
    }

    goToPage(
        currentPage + 1
    );
}


/* =========================================================
   ZOOM IN
========================================================= */

function zoomIn() {

    zoom =
        Math.min(
            MAX_ZOOM,
            Number(
                (
                    zoom +
                    ZOOM_STEP
                ).toFixed(2)
            )
        );

    updateUI();

    renderPage(
        currentPage
    );
}


/* =========================================================
   ZOOM OUT
========================================================= */

function zoomOut() {

    zoom =
        Math.max(
            MIN_ZOOM,
            Number(
                (
                    zoom -
                    ZOOM_STEP
                ).toFixed(2)
            )
        );

    updateUI();

    renderPage(
        currentPage
    );
}


/* =========================================================
   RESET ZOOM
========================================================= */

function resetZoom() {

    zoom =
        DEFAULT_ZOOM;

    updateUI();

    renderPage(
        currentPage
    );
}


/* =========================================================
   LOAD PDF
========================================================= */

async function loadPDF() {

    hideError();

    if (!PDF_URL) {

        showError(
            "No PDF was selected. Open the reader from a book's Read button."
        );

        return;
    }

    try {

        setBookTitle();

        console.log(
            "Loading PDF:",
            PDF_URL
        );

        const loadingTask =
            pdfjsLib.getDocument({
                url: PDF_URL,

                disableAutoFetch:
                    false,

                disableStream:
                    false,

                rangeChunkSize:
                    65536
            });

        pdfDocument =
            await loadingTask.promise;

        pageCount =
            pdfDocument.numPages;

        currentPage =
            1;

        updateUI();

        await renderPage(1);

    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );

        let message =
            "The PDF could not be loaded.";

        if (
            error?.name ===
            "MissingPDFException"
        ) {

            message =
                "The requested PDF file was not found. Please check the PDF path.";
        }

        else if (
            error?.name ===
            "InvalidPDFException"
        ) {

            message =
                "The selected file is not a valid PDF.";
        }

        else if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            message =
                "The PDF server returned an unexpected response.";
        }

        else if (
            error?.name ===
            "UnknownErrorException"
        ) {

            message =
                "The PDF could not be opened. Please check the file path and server.";
        }

        showError(message);
    }
}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function() {

            loadPDF();

        }
    );
}


/* =========================================================
   BUTTONS
========================================================= */

if (previousPageButton) {

    previousPageButton.addEventListener(
        "click",
        previousPage
    );
}

if (nextPageButton) {

    nextPageButton.addEventListener(
        "click",
        nextPage
    );
}

if (zoomInButton) {

    zoomInButton.addEventListener(
        "click",
        zoomIn
    );
}

if (zoomOutButton) {

    zoomOutButton.addEventListener(
        "click",
        zoomOut
    );
}

if (resetZoomButton) {

    resetZoomButton.addEventListener(
        "click",
        resetZoom
    );
}


/* =========================================================
   PAGE INPUT
========================================================= */

if (pageNumberInput) {

    pageNumberInput.addEventListener(
        "change",
        function() {

            goToPage(
                this.value
            );

        }
    );

    pageNumberInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                goToPage(
                    this.value
                );

                this.blur();
            }
        }
    );
}


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        const active =
            document.activeElement;

        const typing =
            active &&
            (
                active.tagName ===
                    "INPUT" ||
                active.tagName ===
                    "TEXTAREA" ||
                active.isContentEditable
            );

        if (typing) {
            return;
        }

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            previousPage();

            return;
        }

        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            nextPage();

            return;
        }

        if (
            event.key === "+" ||
            event.key === "="
        ) {

            event.preventDefault();

            zoomIn();

            return;
        }

        if (
            event.key === "-"
        ) {

            event.preventDefault();

            zoomOut();

            return;
        }

        if (
            event.key === "0"
        ) {

            event.preventDefault();

            resetZoom();

            return;
        }

        if (
            event.key === "Home"
        ) {

            event.preventDefault();

            goToPage(1);

            return;
        }

        if (
            event.key === "End"
        ) {

            event.preventDefault();

            goToPage(pageCount);

            return;
        }
    }
);


/* =========================================================
   RESIZE
========================================================= */

let resizeTimer;

window.addEventListener(
    "resize",
    function() {

        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(
                function() {

                    if (pdfDocument) {

                        renderPage(
                            currentPage
                        );
                    }

                },
                150
            );
    }
);


/* =========================================================
   START READER
========================================================= */

setBookTitle();

updateUI();

loadPDF();
