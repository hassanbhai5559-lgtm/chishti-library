/* =========================================================
   CHISHTI READER
   reader.js
   CLEAN FINAL VERSION
   ========================================================= */

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


/* =========================================================
   PDF.JS WORKER
   ========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   GET BOOK FROM URL
   Supports:
   reader.html?book=books/my-book.pdf
   reader.html?pdf=books/my-book.pdf
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

        /*
         * URLSearchParams has already decoded the query
         * parameter once.
         *
         * Example:
         *
         * books/Sbhy Hamdan Ne Rab Sohnay.pdf
         */

        const cleanPath =
            rawBook
                .trim()
                .replace(/^\/+/, "");


        /*
         * Resolve relative to the current reader.html
         * directory.
         *
         * Example:
         *
         * /chishti-library/reader.html
         *
         * + books/file.pdf
         *
         * becomes:
         *
         * /chishti-library/books/file.pdf
         */

        const baseURL =
            new URL(
                "./",
                window.location.href
            );


        const pdfURL =
            new URL(
                cleanPath,
                baseURL
            );


        return pdfURL.href;

    } catch (error) {

        console.error(
            "PDF URL creation failed:",
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
    "FINAL PDF URL:",
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

let zoom =
    DEFAULT_ZOOM;


/*
 * Current PDF.js rendering task.
 */

let currentRenderTask = null;


/*
 * Every render receives a unique ID.
 *
 * This prevents an older asynchronous render
 * from overwriting a newer page request.
 */

let renderRequestId = 0;


/*
 * Prevent multiple PDF loading operations
 * from running simultaneously.
 */

let loadingPDF = false;


/*
 * Resize debounce timer.
 */

let resizeTimer = null;


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

        /*
         * Get filename only.
         */

        const filename =
            rawBook
                .split("?")[0]
                .split("/")
                .pop() || "";


        /*
         * Decode filename safely.
         *
         * This allows filenames such as:
         *
         * Sbhy%20Hamdan%20Ne%20Rab%20Sohnay.pdf
         */

        let decodedFilename =
            filename;


        try {

            decodedFilename =
                decodeURIComponent(
                    filename
                );

        } catch {
            /*
             * Keep original filename if
             * decoding is unnecessary/invalid.
             */
        }


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
   CANCEL CURRENT RENDER
   ========================================================= */

function cancelCurrentRender() {

    if (!currentRenderTask) {
        return;
    }


    try {

        currentRenderTask.cancel();

    } catch (error) {

        console.warn(
            "Could not cancel PDF render:",
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
        !context ||
        pageCount <= 0
    ) {

        return;
    }


    /*
     * Clamp page number.
     */

    pageNumber =
        Math.max(
            1,
            Math.min(
                Number(pageNumber) || 1,
                pageCount
            )
        );


    /*
     * Create a unique request ID.
     *
     * Any older render becomes invalid.
     */

    const requestId =
        ++renderRequestId;


    /*
     * Cancel the previous PDF.js render.
     */

    cancelCurrentRender();


    try {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );


        /*
         * If another request was made while
         * getPage() was loading, stop here.
         */

        if (
            requestId !==
            renderRequestId
        ) {

            return;
        }


        const scale =
            calculateScale(page);


        const viewport =
            page.getViewport({
                scale: scale
            });


        /*
         * Retina / high-DPI support.
         *
         * Limit to 2x to avoid unnecessarily
         * huge canvas memory usage.
         */

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        /*
         * Real canvas resolution.
         */

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


        /*
         * CSS display size.
         */

        pdfCanvas.style.width =
            `${viewport.width}px`;


        pdfCanvas.style.height =
            `${viewport.height}px`;


        /*
         * Keep wrapper exactly the same size
         * as the rendered PDF page.
         */

        if (pageWrapper) {

            pageWrapper.style.width =
                `${viewport.width}px`;


            pageWrapper.style.height =
                `${viewport.height}px`;
        }


        /*
         * High-DPI transform.
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
         * White page background.
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
         * Start PDF.js render.
         */

        currentRenderTask =
            page.render({
                canvasContext:
                    context,

                viewport:
                    viewport
            });


        await currentRenderTask.promise;


        /*
         * Ignore this render if another
         * request was created while rendering.
         */

        if (
            requestId !==
            renderRequestId
        ) {

            return;
        }


        currentRenderTask =
            null;


        currentPage =
            pageNumber;


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        /*
         * Always clear task reference if
         * this was the current task.
         */

        if (
            requestId ===
            renderRequestId
        ) {

            currentRenderTask =
                null;
        }


        /*
         * PDF.js throws this when a render
         * is intentionally cancelled.
         *
         * This is NOT an actual error.
         */

        if (
            error?.name ===
            "RenderingCancelledException"
        ) {

            return;
        }


        /*
         * Ignore errors belonging to
         * an outdated render request.
         */

        if (
            requestId !==
            renderRequestId
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
    }
}


/* =========================================================
   GO TO PAGE
   ========================================================= */

function goToPage(value) {

    if (
        !pdfDocument ||
        pageCount <= 0
    ) {

        return;
    }


    let page =
        parseInt(
            value,
            10
        );


    if (
        !Number.isFinite(page)
    ) {

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

    /*
     * Prevent duplicate loading operations.
     */

    if (loadingPDF) {
        return;
    }


    hideError();


    if (!PDF_URL) {

        showError(
            "No PDF selected. Please open the reader from a book."
        );

        return;
    }


    loadingPDF =
        true;


    /*
     * Cancel anything from a previous
     * document/render.
     */

    cancelCurrentRender();

    renderRequestId++;


    try {

        setBookTitle();


        console.log(
            "Loading PDF:",
            PDF_URL
        );


        /*
         * Destroy previous document if one exists.
         */

        if (pdfDocument) {

            try {

                await pdfDocument.destroy();

            } catch (error) {

                console.warn(
                    "Previous PDF cleanup failed:",
                    error
                );
            }


            pdfDocument =
                null;
        }


        pageCount =
            0;

        currentPage =
            1;

        zoom =
            DEFAULT_ZOOM;


        updateUI();


        /*
         * Load PDF with PDF.js.
         */

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


        const loadedDocument =
            await loadingTask.promise;


        /*
         * Store only the successfully
         * loaded document.
         */

        pdfDocument =
            loadedDocument;


        pageCount =
            pdfDocument.numPages;


        currentPage =
            1;


        zoom =
            DEFAULT_ZOOM;


        console.log(
            "PDF loaded successfully:",
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


        /*
         * Clean state after failure.
         */

        cancelCurrentRender();


        renderRequestId++;


        if (pdfDocument) {

            try {

                await pdfDocument.destroy();

            } catch {
                // Ignore cleanup errors.
            }
        }


        pdfDocument =
            null;


        pageCount =
            0;


        currentPage =
            1;


        updateUI();


        /*
         * Specific PDF.js errors.
         */

        if (
            error?.name ===
            "MissingPDFException"
        ) {

            showError(
                `PDF not found.\n\nRequested file:\n${rawBook}\n\nFinal URL:\n${PDF_URL}\n\nCheck the exact filename in your books folder.`
            );


        } else if (
            error?.name ===
            "InvalidPDFException"
        ) {

            showError(
                "The selected file is not a valid PDF."
            );


        } else if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            showError(
                "The server returned an unexpected response for this PDF."
            );


        } else {

            showError(
                "PDF could not be loaded. Check the PDF path, filename, and server response."
            );
        }


    } finally {

        loadingPDF =
            false;

        updateUI();
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


        /*
         * Don't hijack keyboard input while
         * user is typing in an input/textarea.
         */

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


        /* Previous page */

        if (
            event.key ===
            "ArrowLeft"
        ) {

            event.preventDefault();

            previousPage();

            return;
        }


        /* Next page */

        if (
            event.key ===
            "ArrowRight"
        ) {

            event.preventDefault();

            nextPage();

            return;
        }


        /* Zoom in */

        if (
            event.key === "+" ||
            event.key === "="
        ) {

            event.preventDefault();

            zoomIn();

            return;
        }


        /* Zoom out */

        if (
            event.key === "-"
        ) {

            event.preventDefault();

            zoomOut();

            return;
        }


        /* Reset zoom */

        if (
            event.key === "0"
        ) {

            event.preventDefault();

            resetZoom();

            return;
        }


        /* First page */

        if (
            event.key === "Home"
        ) {

            event.preventDefault();

            goToPage(1);

            return;
        }


        /* Last page */

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

window.addEventListener(
    "resize",
    function () {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                function () {

                    if (
                        pdfDocument &&
                        pageCount > 0
                    ) {

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
   CLEANUP
   ========================================================= */

window.addEventListener(
    "beforeunload",
    function () {

        clearTimeout(
            resizeTimer
        );


        cancelCurrentRender();


        if (pdfDocument) {

            try {

                pdfDocument.destroy();

            } catch {
                // Ignore cleanup errors.
            }
        }
    }
);


/* =========================================================
   START READER
   ========================================================= */

setBookTitle();

updateUI();

loadPDF();
