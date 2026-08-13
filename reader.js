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

   reader.html?book=Sbhy%20Hamdan%20Ne%20Rab%20Sohnay.pdf

   reader.html?pdf=Sbhy%20Hamdan%20Ne%20Rab%20Sohnay.pdf
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
         * URLSearchParams already decodes
         * %20 into spaces.
         */

        const cleanPath =
            rawBook
                .replace(/^\/+/, "")
                .trim();


        /*
         * reader.html and the PDF files
         * are in the same GitHub Pages root.
         *
         * Example:
         *
         * reader.html
         * Sbhy Hamdan Ne Rab Sohnay.pdf
         *
         * becomes:
         *
         * /chishti-library/
         * Sbhy%20Hamdan%20Ne%20Rab%20Sohnay.pdf
         */

        const pdfURL =
            new URL(
                cleanPath,
                window.location.href
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

const MIN_ZOOM =
    0.5;

const MAX_ZOOM =
    3;

const ZOOM_STEP =
    0.1;

const DEFAULT_ZOOM =
    1;


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

let pdfDocument =
    null;

let currentPage =
    1;

let pageCount =
    0;

let zoom =
    DEFAULT_ZOOM;

let currentRenderTask =
    null;


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
            "Could not cancel render:",
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


    /*
     * Cancel previous render.
     */

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
         * High DPI / Retina support.
         */

        const pixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        /*
         * Actual canvas resolution.
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
         * Page wrapper size.
         */

        if (pageWrapper) {

            pageWrapper.style.width =
                `${viewport.width}px`;

            pageWrapper.style.height =
                `${viewport.height}px`;
        }


        /*
         * Retina transform.
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
         * White background.
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


        /*
         * Update current page only
         * after successful render.
         */

        currentPage =
            pageNumber;


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        /*
         * PDF.js throws this when a render
         * is intentionally cancelled.
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

    hideError();


    if (!PDF_URL) {

        showError(
            "No PDF selected. Please open the reader from a book."
        );

        return;
    }


    /*
     * Cancel any old rendering.
     */

    cancelCurrentRender();


    try {

        setBookTitle();


        console.log(
            "Loading PDF:",
            PDF_URL
        );


        /*
         * Simple PDF.js loading.
         *
         * No custom rangeChunkSize,
         * no disableStream,
         * no disableAutoFetch.
         *
         * PDF.js uses its normal defaults.
         */

        const loadingTask =
            pdfjsLib.getDocument({
                url: PDF_URL
            });


        pdfDocument =
            await loadingTask.promise;


        /*
         * PDF successfully loaded.
         */

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


        pdfDocument =
            null;


        pageCount =
            0;


        currentPage =
            1;


        updateUI();


        /*
         * PDF not found.
         */

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

Check the exact filename and GitHub Pages path.`
            );


            return;
        }


        /*
         * Invalid PDF.
         */

        if (
            error?.name ===
            "InvalidPDFException"
        ) {

            showError(
                "The selected file is not a valid PDF."
            );


            return;
        }


        /*
         * Unexpected server response.
         */

        if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            showError(
                "The server returned an unexpected response for this PDF."
            );


            return;
        }


        /*
         * Generic error.
         */

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


        /*
         * Don't hijack keyboard controls
         * while user is typing.
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


        /*
         * Previous page
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
         * Next page
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
         * Zoom in
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
         * Zoom out
         */

        if (
            event.key === "-"
        ) {

            event.preventDefault();

            zoomOut();

            return;
        }


        /*
         * Reset zoom
         */

        if (
            event.key === "0"
        ) {

            event.preventDefault();

            resetZoom();

            return;
        }


        /*
         * First page
         */

        if (
            event.key === "Home"
        ) {

            event.preventDefault();

            goToPage(1);

            return;
        }


        /*
         * Last page
         */

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

let resizeTimer =
    null;


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
   START READER
========================================================= */

setBookTitle();

updateUI();

loadPDF();
/* =========================================
   READER CONTROLS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const reader =
        document.getElementById("readerMode");

    const readerContent =
        document.getElementById("readerContent");

    const readerPage =
        document.getElementById("readerPage");

    const prevBtn =
        document.getElementById("readerPrev");

    const nextBtn =
        document.getElementById("readerNext");

    const fontMinus =
        document.getElementById("readerFontMinus");

    const fontPlus =
        document.getElementById("readerFontPlus");

    const themeBtn =
        document.getElementById("readerTheme");

    const closeBtn =
        document.getElementById("readerClose");


    if (!reader || !readerContent) {
        return;
    }


    /* =====================================
       FONT SIZE
    ===================================== */

    let fontSize = 18;

    fontMinus.addEventListener("click", function () {

        if (fontSize > 14) {

            fontSize -= 1;

            readerContent.style.fontSize =
                fontSize + "px";

        }

    });


    fontPlus.addEventListener("click", function () {

        if (fontSize < 30) {

            fontSize += 1;

            readerContent.style.fontSize =
                fontSize + "px";

        }

    });


    /* =====================================
       THEME SWAP
    ===================================== */

    let theme = 0;

    themeBtn.addEventListener("click", function () {

        theme++;

        if (theme > 2) {
            theme = 0;
        }


        reader.classList.remove(
            "dark-bg",
            "sepia-bg"
        );

        readerContent.classList.remove(
            "dark",
            "sepia"
        );


        /* NORMAL */

        if (theme === 0) {

            reader.style.background = "#fff";

            readerContent.style.color =
                "#222";

        }


        /* DARK */

        if (theme === 1) {

            reader.classList.add("dark-bg");

            readerContent.classList.add("dark");

        }


        /* SEPIA */

        if (theme === 2) {

            reader.classList.add("sepia-bg");

            readerContent.classList.add("sepia");

        }

    });


    /* =====================================
       CLOSE READER
    ===================================== */

    closeBtn.addEventListener("click", function () {

        reader.classList.remove("active");

        document.body.style.overflow = "";

    });


    /* =====================================
       ESC KEY
    ===================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            reader.classList.remove("active");

            document.body.style.overflow = "";

        }

    });


    /* =====================================
       PREVIOUS / NEXT
    ===================================== */

    let currentPage = 1;

    let totalPages = 1;


    function updatePage() {

        readerPage.textContent =
            currentPage + " / " + totalPages;

    }


    prevBtn.addEventListener("click", function () {

        if (currentPage > 1) {

            currentPage--;

            updatePage();

            reader.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    });


    nextBtn.addEventListener("click", function () {

        if (currentPage < totalPages) {

            currentPage++;

            updatePage();

            reader.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    });


    updatePage();

});
