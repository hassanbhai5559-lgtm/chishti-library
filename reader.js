 /* =========================================================
    CHISHTI LIBRARY
    reader.js
    FULL PDF READER
 ========================================================= */


import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


/* =========================================================
   PDF.JS WORKER
 ========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   GET URL PARAMETERS
 ========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const rawBook =
    params.get("book") ||
    params.get("pdf") ||
    "";


/* =========================================================
   BUILD PDF URL
 ========================================================= */

function getPDFURL() {

    if (!rawBook) {
        return "";
    }

    try {

        const cleanPath =
            rawBook
                .replace(/^\/+/, "")
                .trim();

        const pdfURL =
            new URL(
                cleanPath,
                window.location.href
            );

        return pdfURL.href;

    } catch (error) {

        console.error(
            "PDF URL error:",
            error
        );

        return "";
    }
}


const PDF_URL =
    getPDFURL();


console.log(
    "RAW BOOK:",
    rawBook
);

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
    document.getElementById(
        "bookTitle"
    );


const bookViewport =
    document.getElementById(
        "bookViewport"
    );


const pageWrapper =
    document.getElementById(
        "pageWrapper"
    );


const pdfCanvas =
    document.getElementById(
        "pdfCanvas"
    );


const previousPageButton =
    document.getElementById(
        "previousPageButton"
    );


const nextPageButton =
    document.getElementById(
        "nextPageButton"
    );


const pageNumberInput =
    document.getElementById(
        "pageNumberInput"
    );


const totalPages =
    document.getElementById(
        "totalPages"
    );


const zoomOutButton =
    document.getElementById(
        "zoomOutButton"
    );


const resetZoomButton =
    document.getElementById(
        "resetZoomButton"
    );


const zoomInButton =
    document.getElementById(
        "zoomInButton"
    );


const zoomLevel =
    document.getElementById(
        "zoomLevel"
    );


const errorScreen =
    document.getElementById(
        "errorScreen"
    );


const errorMessage =
    document.getElementById(
        "errorMessage"
    );


const retryButton =
    document.getElementById(
        "retryButton"
    );


const readerStatus =
    document.getElementById(
        "readerStatus"
    );


/* =========================================================
   OPTIONAL EXTRA BUTTONS
 ========================================================= */

const downloadButton =
    document.getElementById(
        "downloadButton"
    );


const printButton =
    document.getElementById(
        "printButton"
    );


const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );


const swipeButton =
    document.getElementById(
        "swipeButton"
    );


/* =========================================================
   CANVAS
 ========================================================= */

const context =
    pdfCanvas
        ? pdfCanvas.getContext(
            "2d",
            {
                alpha: false
            }
        )
        : null;


/* =========================================================
   STATE
 ========================================================= */

let pdfDocument = null;

let currentPage = 1;

let pageCount = 0;

let zoom = DEFAULT_ZOOM;

let currentRenderTask = null;


/* =========================================================
   SWIPE STATE
 ========================================================= */

let touchStartX = 0;

let touchStartY = 0;

let touchEndX = 0;

let touchEndY = 0;


/* =========================================================
   TITLE
 ========================================================= */

function setBookTitle() {

    if (!bookTitle) {
        return;
    }


    if (!rawBook) {

        bookTitle.textContent =
            "No book selected";

        return;
    }


    try {

        const filename =
            rawBook
                .split("?")[0]
                .split("/")
                .pop() || "";


        const decodedFilename =
            decodeURIComponent(
                filename
            );


        const title =
            decodedFilename
                .replace(
                    /\.pdf$/i,
                    ""
                )
                .replace(
                    /[-_]+/g,
                    " "
                )
                .trim();


        bookTitle.textContent =
            title ||
            "Digital Book";

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

    console.error(
        "Reader error:",
        message
    );


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
   UPDATE UI
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
   CALCULATE SCALE
 ========================================================= */

function calculateScale(page) {

    if (!bookViewport) {

        return zoom;
    }


    const baseViewport =
        page.getViewport({
            scale: 1
        });


    const availableWidth =
        Math.max(
            200,
            bookViewport.clientWidth - 30
        );


    const availableHeight =
        Math.max(
            200,
            bookViewport.clientHeight - 30
        );


    const widthScale =
        availableWidth /
        baseViewport.width;


    const heightScale =
        availableHeight /
        baseViewport.height;


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
   CANCEL RENDER
 ========================================================= */

function cancelCurrentRender() {

    if (!currentRenderTask) {
        return;
    }


    try {

        currentRenderTask.cancel();

    } catch (error) {

        console.warn(
            "Render cancel error:",
            error
        );
    }


    currentRenderTask =
        null;
}


/* =========================================================
   RENDER PAGE
 ========================================================= */

async function renderPage(pageNumber) {

    if (
        !pdfDocument ||
        !pdfCanvas ||
        !context
    ) {

        return;
    }


    pageNumber =
        Math.max(
            1,
            Math.min(
                Number(pageNumber) || 1,
                pageCount
            )
        );


    cancelCurrentRender();


    try {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );


        const scale =
            calculateScale(page);


        const viewport =
            page.getViewport({
                scale
            });


        /*
         * Retina / High DPI
         */

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


        if (pageWrapper) {

            pageWrapper.style.width =
                `${viewport.width}px`;

            pageWrapper.style.height =
                `${viewport.height}px`;
        }


        /*
         * Canvas transform
         */

        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );


        /*
         * White background
         */

        context.fillStyle =
            "#ffffff";


        context.fillRect(
            0,
            0,
            viewport.width,
            viewport.height
        );


        /*
         * Render PDF
         */

        currentRenderTask =
            page.render({

                canvasContext:
                    context,

                viewport:
                    viewport
            });


        await currentRenderTask.promise;


        currentRenderTask =
            null;


        currentPage =
            pageNumber;


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        if (
            error?.name ===
            "RenderingCancelledException"
        ) {

            return;
        }


        console.error(
            "PDF render error:",
            error
        );


        showError(
            "This PDF page could not be rendered."
        );


    } finally {

        currentRenderTask =
            null;
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
        parseInt(
            value,
            10
        );


    if (!Number.isFinite(page)) {

        page =
            currentPage;
    }


    page =
        Math.max(
            1,
            Math.min(
                page,
                pageCount
            )
        );


    renderPage(
        page
    );
}


/* =========================================================
   PREVIOUS
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
   NEXT
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


    if (pdfDocument) {

        renderPage(
            currentPage
        );
    }
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


    if (pdfDocument) {

        renderPage(
            currentPage
        );
    }
}


/* =========================================================
   RESET ZOOM
 ========================================================= */

function resetZoom() {

    zoom =
        DEFAULT_ZOOM;


    updateUI();


    if (pdfDocument) {

        renderPage(
            currentPage
        );
    }
}


/* =========================================================
   LOAD PDF
 ========================================================= */

async function loadPDF() {

    hideError();


    if (!PDF_URL) {

        showError(
            "No PDF selected. Please open the reader from a book."
        );

        return;
    }


    cancelCurrentRender();


    try {

        setBookTitle();


        console.log(
            "Loading PDF:",
            PDF_URL
        );


        const loadingTask =
            pdfjsLib.getDocument({
                url: PDF_URL
            });


        pdfDocument =
            await loadingTask.promise;


        pageCount =
            pdfDocument.numPages;


        currentPage =
            1;


        zoom =
            DEFAULT_ZOOM;


        console.log(
            "PDF loaded:",
            pageCount,
            "pages"
        );


        updateUI();


        announce(
            `Page 1 of ${pageCount}`
        );


        await renderPage(
            1
        );


    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        pdfDocument =
            null;


        pageCount =
            0;


        currentPage =
            1;


        updateUI();


        if (
            error?.name ===
            "MissingPDFException"
        ) {

            showError(
                `PDF not found.

Requested:
${rawBook}

URL:
${PDF_URL}

Check the exact PDF filename and path.`
            );

            return;
        }


        if (
            error?.name ===
            "InvalidPDFException"
        ) {

            showError(
                "The selected file is not a valid PDF."
            );

            return;
        }


        if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            showError(
                "The server returned an unexpected response for this PDF."
            );

            return;
        }


        showError(
            "PDF could not be loaded. Check the PDF URL and filename."
        );
    }
}


/* =========================================================
   RETRY
 ========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadPDF
    );
}


/* =========================================================
   PAGE BUTTONS
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


/* =========================================================
   ZOOM BUTTONS
 ========================================================= */

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


if (zoomInButton) {

    zoomInButton.addEventListener(
        "click",
        zoomIn
    );
}


/* =========================================================
   PAGE INPUT
 ========================================================= */

if (pageNumberInput) {

    pageNumberInput.addEventListener(
        "change",
        function () {

            goToPage(
                this.value
            );
        }
    );


    pageNumberInput.addEventListener(
        "keydown",
        function (event) {

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
    function (event) {

        const active =
            document.activeElement;


        const typing =
            active &&
            (
                active.tagName === "INPUT" ||
                active.tagName === "TEXTAREA" ||
                active.isContentEditable
            );


        if (typing) {
            return;
        }


        /*
         * LEFT
         */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            previousPage();

            return;
        }


        /*
         * RIGHT
         */

        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            nextPage();

            return;
        }


        /*
         * PLUS
         */

        if (
            event.key === "+" ||
            event.key === "="
        ) {

            event.preventDefault();

            zoomIn();

            return;
        }


        /*
         * MINUS
         */

        if (
            event.key === "-"
        ) {

            event.preventDefault();

            zoomOut();

            return;
        }


        /*
         * RESET
         */

        if (
            event.key === "0"
        ) {

            event.preventDefault();

            resetZoom();

            return;
        }


        /*
         * FIRST PAGE
         */

        if (
            event.key === "Home"
        ) {

            event.preventDefault();

            goToPage(1);

            return;
        }


        /*
         * LAST PAGE
         */

        if (
            event.key === "End"
        ) {

            event.preventDefault();

            goToPage(pageCount);

            return;
        }


        /*
         * FULLSCREEN
         */

        if (
            event.key === "f" ||
            event.key === "F"
        ) {

            toggleFullscreen();

            return;
        }
    }
);


/* =========================================================
   MOBILE SWIPE
 ========================================================= */

if (bookViewport) {

    bookViewport.addEventListener(
        "touchstart",
        function (event) {

            if (
                !event.touches ||
                !event.touches.length
            ) {
                return;
            }


            touchStartX =
                event.touches[0].clientX;


            touchStartY =
                event.touches[0].clientY;
        },
        {
            passive: true
        }
    );


    bookViewport.addEventListener(
        "touchend",
        function (event) {

            if (
                !event.changedTouches ||
                !event.changedTouches.length
            ) {
                return;
            }


            touchEndX =
                event.changedTouches[0].clientX;


            touchEndY =
                event.changedTouches[0].clientY;


            handleSwipe();
        },
        {
            passive: true
        }
    );
}


/* =========================================================
   HANDLE SWIPE
 ========================================================= */

function handleSwipe() {

    const deltaX =
        touchEndX -
        touchStartX;


    const deltaY =
        touchEndY -
        touchStartY;


    /*
     * Ignore mostly vertical movement.
     */

    if (
        Math.abs(deltaX) <
        60
    ) {
        return;
    }


    if (
        Math.abs(deltaX) <
        Math.abs(deltaY)
    ) {
        return;
    }


    /*
     * Swipe LEFT
     * = Next page
     */

    if (deltaX < 0) {

        nextPage();

        return;
    }


    /*
     * Swipe RIGHT
     * = Previous page
     */

    if (deltaX > 0) {

        previousPage();
    }
}


/* =========================================================
   FULLSCREEN
 ========================================================= */

async function toggleFullscreen() {

    const reader =
        document.getElementById(
            "readerApp"
        );


    if (!reader) {
        return;
    }


    try {

        if (!document.fullscreenElement) {

            await reader.requestFullscreen();

        } else {

            await document.exitFullscreen();
        }

    } catch (error) {

        console.warn(
            "Fullscreen not available:",
            error
        );
    }
}


/* =========================================================
   FULLSCREEN BUTTON
 ========================================================= */

if (fullscreenButton) {

    fullscreenButton.addEventListener(
        "click",
        toggleFullscreen
    );
}


/* =========================================================
   PRINT
 ========================================================= */

function printCurrentBook() {

    /*
     * Browser PDF print.
     *
     * This opens the browser print dialog.
     */

    if (!PDF_URL) {

        alert(
            "No PDF selected."
        );

        return;
    }


    const printWindow =
        window.open(
            PDF_URL,
            "_blank"
        );


    if (!printWindow) {

        alert(
            "Please allow popups to print the book."
        );

        return;
    }


    printWindow.addEventListener(
        "load",
        function () {

            setTimeout(
                function () {

                    try {

                        printWindow.print();

                    } catch (error) {

                        console.warn(
                            "Print error:",
                            error
                        );
                    }

                },
                1000
            );
        }
    );
}


if (printButton) {

    printButton.addEventListener(
        "click",
        printCurrentBook
    );
}


/* =========================================================
   DOWNLOAD
 ========================================================= */

function downloadBook() {

    if (!PDF_URL) {

        alert(
            "No PDF selected."
        );

        return;
    }


    /*
     * IMPORTANT:
     *
     * This is only the frontend download action.
     *
     * Real subscription protection must be
     * handled by Firebase/backend.
     */

    const link =
        document.createElement(
            "a"
        );


    link.href =
        PDF_URL;


    link.download =
        rawBook
            .split("/")
            .pop() ||
        "book.pdf";


    link.target =
        "_blank";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();
}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadBook
    );
}


/* =========================================================
   SWIPE BUTTON
 ========================================================= */

if (swipeButton) {

    swipeButton.addEventListener(
        "click",
        function () {

            if (bookViewport) {

                bookViewport.scrollIntoView({
                    behavior: "smooth"
                });
            }


            announce(
                "Swipe navigation is enabled. Swipe left for next page and right for previous page."
            );
        }
    );
}


/* =========================================================
   RESIZE
 ========================================================= */

let resizeTimer = null;


window.addEventListener(
    "resize",
    function () {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                function () {

                    if (pdfDocument) {

                        renderPage(
                            currentPage
                        );
                    }

                },
                180
            );
    }
);


/* =========================================================
   ORIENTATION CHANGE
 ========================================================= */

window.addEventListener(
    "orientationchange",
    function () {

        setTimeout(
            function () {

                if (pdfDocument) {

                    renderPage(
                        currentPage
                    );
                }

            },
            300
        );
    }
);


/* =========================================================
   FULLSCREEN CHANGE
 ========================================================= */

document.addEventListener(
    "fullscreenchange",
    function () {

        setTimeout(
            function () {

                if (pdfDocument) {

                    renderPage(
                        currentPage
                    );
                }

            },
            200
        );
    }
);


/* =========================================================
   PREVENT ACCIDENTAL IMAGE DRAG
 ========================================================= */

if (pdfCanvas) {

    pdfCanvas.addEventListener(
        "dragstart",
        function (event) {

            event.preventDefault();
        }
    );
}


/* =========================================================
   START
 ========================================================= */

setBookTitle();

updateUI();

loadPDF();
