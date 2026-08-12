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
   reader.html?book=my-book.pdf
   reader.html?pdf=books/my-book.pdf
   reader.html?pdf=my-book.pdf
========================================================= */

const params =
    new URLSearchParams(window.location.search);

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
         * URLSearchParams already decodes the query parameter.
         */

        let cleanPath =
            rawBook.trim();

        /*
         * Convert accidental backslashes.
         */

        cleanPath =
            cleanPath.replace(/\\/g, "/");


        /*
         * If a complete URL was supplied,
         * use it directly.
         */

        if (
            cleanPath.startsWith("http://") ||
            cleanPath.startsWith("https://")
        ) {

            return new URL(cleanPath).href;
        }


        /*
         * Remove leading ./ and /.
         */

        cleanPath =
            cleanPath.replace(/^\.?\//, "");


        /*
         * If only the filename was supplied,
         * automatically use the books folder.
         *
         * Example:
         *
         * Sbhy Hamdan Ne Rab Sohnay.pdf
         *
         * becomes:
         *
         * books/Sbhy Hamdan Ne Rab Sohnay.pdf
         */

        if (
            !cleanPath.startsWith("books/")
        ) {

            cleanPath =
                `books/${cleanPath}`;
        }


        /*
         * Resolve from reader.html directory.
         */

        const baseURL =
            new URL("./", window.location.href);

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
    document.getElementById("bookTitle");

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


        const title =
            decodeURIComponent(filename)
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


    /*
     * Cancel previous render.
     */

    if (currentRenderTask) {

        try {

            currentRenderTask.cancel();

        } catch (error) {

            console.warn(
                "Render cancellation warning:",
                error
            );
        }

        currentRenderTask = null;
    }


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


        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        /*
         * Real canvas dimensions.
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
         * CSS display dimensions.
         */

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
         * Retina scaling.
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
         * Render PDF page.
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

        currentRenderTask =
            null;


        /*
         * Ignore normal cancellation.
         */

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
    }
}


/* =========================================================
   PAGE NAVIGATION
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


    renderPage(page);
}


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
   ZOOM
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


    try {

        setBookTitle();


        console.log(
            "Loading PDF:",
            PDF_URL
        );


        const loadingTask =
            pdfjsLib.getDocument({

                url:
                    PDF_URL,

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


        zoom =
            DEFAULT_ZOOM;


        console.log(
            "PDF loaded successfully:",
            pageCount,
            "pages"
        );


        updateUI();


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


        updateUI();


        if (
            error?.name ===
            "MissingPDFException"
        ) {

            showError(
                `PDF not found.

Requested file:
${rawBook}

Final URL:
${PDF_URL}

Check the exact filename inside your books folder.`
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
                "PDF could not be loaded. Check the PDF path, filename, and GitHub Pages file location."
            );
        }
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
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

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
                150
            );
    }
);


/* =========================================================
   START
========================================================= */

setBookTitle();

updateUI();

loadPDF();
