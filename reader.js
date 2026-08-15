/* =========================================================
   CHISHTI LIBRARY
   reader.js
   REAL 3D PDF PAGE-FLIP READER
   WATERMARK DOWNLOAD + PRINT + THEME
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

        const cleanPath =
            rawBook
                .replace(/^\/+/, "")
                .trim();

        return new URL(
            cleanPath,
            window.location.href
        ).href;

    } catch (error) {

        console.error(
            "PDF URL error:",
            error
        );

        return "";
    }
}


const PDF_URL = getPDFURL();


/* =========================================================
   SETTINGS
========================================================= */

const MIN_ZOOM = 0.65;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;

const FLIP_DURATION = 720;

const SWIPE_THRESHOLD = 55;


/* =========================================================
   LIBRARY THEME
========================================================= */

const LIBRARY_THEME = {

    maroon: "#4B0000",
    deepMaroon: "#350000",
    gold: "#D4A500",
    white: "#FFFFFF"

};


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

const downloadButton =
    document.getElementById("downloadButton");

const printButton =
    document.getElementById("printButton");

const fullscreenButton =
    document.getElementById("fullscreenButton");

const swipeButton =
    document.getElementById("swipeButton");

const themeButton =
    document.getElementById("themeButton");

const cleanDownloadButton =
    document.getElementById("cleanDownloadButton");


/* =========================================================
   STATE
========================================================= */

let pdfDocument = null;

let currentPage = 1;

let pageCount = 0;

let zoom = DEFAULT_ZOOM;

let isFlipping = false;

let flipDirection = "next";

let flipTimer = null;

let resizeTimer = null;


/* =========================================================
   TOUCH STATE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;

let touchEndX = 0;
let touchEndY = 0;


/* =========================================================
   THEME STATE
========================================================= */

const themes = [

    {
        name: "Maroon",
        background: "#4B0000",
        surface: "#350000",
        accent: "#D4A500",
        text: "#FFFFFF"
    },

    {
        name: "Deep Maroon",
        background: "#350000",
        surface: "#4B0000",
        accent: "#D4A500",
        text: "#FFFFFF"
    },

    {
        name: "Gold",
        background: "#D4A500",
        surface: "#4B0000",
        accent: "#FFFFFF",
        text: "#FFFFFF"
    }

];

let currentTheme = 0;


/* =========================================================
   FLIP BOOK ELEMENTS
========================================================= */

let flipBook = null;

let flipCurrentPage = null;

let flipNextPage = null;

let flipCurrentCanvas = null;

let flipNextCanvas = null;

let flipShadow = null;


/* =========================================================
   CREATE FLIP BOOK
========================================================= */

function createFlipBook() {

    if (!bookViewport) {
        return;
    }

    /*
     * Existing old canvas is hidden.
     * The new flip-book owns the visible reader.
     */

    if (pdfCanvas) {
        pdfCanvas.style.display = "none";
    }

    if (pageWrapper) {
        pageWrapper.style.display = "none";
    }


    flipBook =
        document.getElementById(
            "chishtiFlipBook"
        );


    if (!flipBook) {

        flipBook =
            document.createElement("div");

        flipBook.id =
            "chishtiFlipBook";

        flipBook.className =
            "chishti-flip-book";

        bookViewport.appendChild(
            flipBook
        );
    }


    flipBook.innerHTML = "";


    /*
     * Book shell
     */

    const bookShell =
        document.createElement("div");

    bookShell.className =
        "chishti-book-shell";


    /*
     * Back cover
     */

    const backCover =
        document.createElement("div");

    backCover.className =
        "chishti-book-cover chishti-book-back";


    /*
     * Page stack
     */

    const pageStack =
        document.createElement("div");

    pageStack.className =
        "chishti-page-stack";


    /*
     * Current page
     */

    flipCurrentPage =
        document.createElement("div");

    flipCurrentPage.className =
        "chishti-flip-page chishti-current-page";

    flipCurrentPage.dataset.page =
        "1";


    flipCurrentCanvas =
        document.createElement("canvas");

    flipCurrentCanvas.className =
        "chishti-page-canvas";


    flipCurrentPage.appendChild(
        flipCurrentCanvas
    );


    /*
     * Next page
     */

    flipNextPage =
        document.createElement("div");

    flipNextPage.className =
        "chishti-flip-page chishti-next-page";

    flipNextPage.dataset.page =
        "2";


    flipNextCanvas =
        document.createElement("canvas");

    flipNextCanvas.className =
        "chishti-page-canvas";


    flipNextPage.appendChild(
        flipNextCanvas
    );


    /*
     * Shadow
     */

    flipShadow =
        document.createElement("div");

    flipShadow.className =
        "chishti-flip-shadow";


    pageStack.appendChild(
        flipNextPage
    );

    pageStack.appendChild(
        flipCurrentPage
    );

    pageStack.appendChild(
        flipShadow
    );


    bookShell.appendChild(
        backCover
    );

    bookShell.appendChild(
        pageStack
    );

    flipBook.appendChild(
        bookShell
    );
}


/* =========================================================
   THEME
========================================================= */

function applyTheme(index) {

    currentTheme =
        (
            index +
            themes.length
        ) %
        themes.length;


    const theme =
        themes[currentTheme];


    document.documentElement.style.setProperty(
        "--library-maroon",
        LIBRARY_THEME.maroon
    );

    document.documentElement.style.setProperty(
        "--library-deep-maroon",
        LIBRARY_THEME.deepMaroon
    );

    document.documentElement.style.setProperty(
        "--library-gold",
        LIBRARY_THEME.gold
    );

    document.documentElement.style.setProperty(
        "--library-white",
        LIBRARY_THEME.white
    );

    document.documentElement.style.setProperty(
        "--reader-background",
        theme.background
    );

    document.documentElement.style.setProperty(
        "--reader-surface",
        theme.surface
    );

    document.documentElement.style.setProperty(
        "--reader-accent",
        theme.accent
    );

    document.documentElement.style.setProperty(
        "--reader-text",
        theme.text
    );


    document.body.dataset.theme =
        theme.name
            .toLowerCase()
            .replace(/\s+/g, "-");


    if (themeButton) {

        themeButton.title =
            `Theme: ${theme.name} — click to change`;

        themeButton.setAttribute(
            "aria-label",
            `Theme: ${theme.name}. Click to change theme`
        );
    }


    localStorage.setItem(
        "chishtiReaderTheme",
        String(currentTheme)
    );
}


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const saved =
        Number(
            localStorage.getItem(
                "chishtiReaderTheme"
            )
        );


    if (
        Number.isInteger(saved) &&
        saved >= 0 &&
        saved < themes.length
    ) {

        currentTheme = saved;
    }


    applyTheme(currentTheme);
}


/* =========================================================
   THEME BUTTON
========================================================= */

if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            applyTheme(
                currentTheme + 1
            );


            announce(
                `Reader theme changed to ${themes[currentTheme].name}.`
            );
        }
    );
}


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
            currentPage <= 1 ||
            isFlipping;
    }


    if (nextPageButton) {

        nextPageButton.disabled =
            !pdfDocument ||
            currentPage >= pageCount ||
            isFlipping;
    }


    if (cleanDownloadButton) {

        cleanDownloadButton.disabled =
            true;

        cleanDownloadButton.title =
            "Clean download is not available";

        cleanDownloadButton.setAttribute(
            "aria-disabled",
            "true"
        );
    }
}


/* =========================================================
   CALCULATE FLIP PAGE SCALE
========================================================= */

async function getPageSize(page) {

    const viewport =
        page.getViewport({
            scale: 1
        });


    const availableWidth =
        Math.max(
            260,
            bookViewport
                ? bookViewport.clientWidth - 40
                : viewport.width
        );


    const availableHeight =
        Math.max(
            300,
            bookViewport
                ? bookViewport.clientHeight - 40
                : viewport.height
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
        0.35,
        fitScale * zoom
    );
}


/* =========================================================
   RENDER PDF PAGE TO CANVAS
========================================================= */

async function renderPDFPage(
    pageNumber,
    canvas
) {

    if (
        !pdfDocument ||
        !canvas
    ) {

        return;
    }


    const page =
        await pdfDocument.getPage(
            pageNumber
        );


    const scale =
        await getPageSize(
            page
        );


    const viewport =
        page.getViewport({
            scale
        });


    const pixelRatio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    canvas.width =
        Math.ceil(
            viewport.width *
            pixelRatio
        );


    canvas.height =
        Math.ceil(
            viewport.height *
            pixelRatio
        );


    canvas.style.width =
        `${viewport.width}px`;


    canvas.style.height =
        `${viewport.height}px`;


    const ctx =
        canvas.getContext(
            "2d",
            {
                alpha: false
            }
        );


    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    ctx.fillStyle =
        "#FFFFFF";


    ctx.fillRect(
        0,
        0,
        viewport.width,
        viewport.height
    );


    await page.render({

        canvasContext:
            ctx,

        viewport:
            viewport

    }).promise;


    return {

        width:
            viewport.width,

        height:
            viewport.height
    };
}


/* =========================================================
   SET PAGE DIMENSIONS
========================================================= */

function setFlipDimensions(
    width,
    height
) {

    if (!flipBook) {
        return;
    }


    flipBook.style.setProperty(
        "--book-page-width",
        `${width}px`
    );


    flipBook.style.setProperty(
        "--book-page-height",
        `${height}px`
    );


    flipBook.style.width =
        `${width}px`;


    flipBook.style.height =
        `${height}px`;
}


/* =========================================================
   LOAD CURRENT PAGE
========================================================= */

async function loadCurrentFlipPage() {

    if (
        !pdfDocument ||
        !flipCurrentCanvas
    ) {

        return;
    }


    try {

        const size =
            await renderPDFPage(
                currentPage,
                flipCurrentCanvas
            );


        if (size) {

            setFlipDimensions(
                size.width,
                size.height
            );
        }


        flipCurrentPage.dataset.page =
            String(currentPage);


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        console.error(
            "Current page render error:",
            error
        );


        showError(
            "This PDF page could not be rendered."
        );
    }
}


/* =========================================================
   LOAD NEXT PAGE BEHIND CURRENT PAGE
========================================================= */

async function prepareNextPage() {

    if (
        !pdfDocument ||
        !flipNextCanvas
    ) {

        return;
    }


    const next =
        currentPage < pageCount
            ? currentPage + 1
            : currentPage;


    try {

        await renderPDFPage(
            next,
            flipNextCanvas
        );


        flipNextPage.dataset.page =
            String(next);

    } catch (error) {

        console.error(
            "Next page render error:",
            error
        );
    }
}


/* =========================================================
   LOAD BOTH PAGES
========================================================= */

async function renderFlipBook() {

    if (!pdfDocument) {
        return;
    }


    await loadCurrentFlipPage();

    await prepareNextPage();

    updateUI();
}


/* =========================================================
   NEXT PAGE FLIP
========================================================= */

async function nextPage() {

    if (
        !pdfDocument ||
        isFlipping ||
        currentPage >= pageCount
    ) {

        return;
    }


    isFlipping = true;

    flipDirection = "next";

    updateUI();


    const nextPageNumber =
        currentPage + 1;


    try {

        /*
         * Render next page first.
         */

        await renderPDFPage(
            nextPageNumber,
            flipNextCanvas
        );


        flipNextPage.dataset.page =
            String(nextPageNumber);


        /*
         * Prepare visual state.
         */

        flipCurrentPage.classList.remove(
            "flip-backward",
            "flip-forward"
        );


        flipCurrentPage.classList.add(
            "flip-forward"
        );


        flipShadow.classList.add(
            "active"
        );


        announce(
            `Turning to page ${nextPageNumber}...`
        );


        await wait(
            FLIP_DURATION
        );


        /*
         * Swap page canvases.
         */

        const oldCanvas =
            flipCurrentCanvas;

        flipCurrentCanvas =
            flipNextCanvas;

        flipNextCanvas =
            oldCanvas;


        const oldPage =
            flipCurrentPage;

        flipCurrentPage =
            flipNextPage;

        flipNextPage =
            oldPage;


        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );


        flipCurrentPage.classList.add(
            "chishti-current-page"
        );


        flipNextPage.classList.remove(
            "chishti-current-page"
        );


        currentPage =
            nextPageNumber;


        /*
         * Reset page transform.
         */

        flipNextPage.style.transform =
            "";


        flipShadow.classList.remove(
            "active"
        );


        /*
         * Put new upcoming page behind.
         */

        await prepareNextPage();


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        console.error(
            "Page flip error:",
            error
        );

    } finally {

        isFlipping = false;

        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );

        flipShadow.classList.remove(
            "active"
        );

        updateUI();
    }
}


/* =========================================================
   PREVIOUS PAGE FLIP
========================================================= */

async function previousPage() {

    if (
        !pdfDocument ||
        isFlipping ||
        currentPage <= 1
    ) {

        return;
    }


    isFlipping = true;

    flipDirection = "previous";

    updateUI();


    const previousPageNumber =
        currentPage - 1;


    try {

        /*
         * Render previous page
         * into the hidden canvas.
         */

        await renderPDFPage(
            previousPageNumber,
            flipNextCanvas
        );


        flipNextPage.dataset.page =
            String(previousPageNumber);


        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );


        flipCurrentPage.classList.add(
            "flip-backward"
        );


        flipShadow.classList.add(
            "active"
        );


        announce(
            `Turning back to page ${previousPageNumber}...`
        );


        await wait(
            FLIP_DURATION
        );


        const oldCanvas =
            flipCurrentCanvas;

        flipCurrentCanvas =
            flipNextCanvas;

        flipNextCanvas =
            oldCanvas;


        const oldPage =
            flipCurrentPage;

        flipCurrentPage =
            flipNextPage;

        flipNextPage =
            oldPage;


        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );


        flipCurrentPage.classList.add(
            "chishti-current-page"
        );


        flipNextPage.classList.remove(
            "chishti-current-page"
        );


        currentPage =
            previousPageNumber;


        flipNextPage.style.transform =
            "";


        flipShadow.classList.remove(
            "active"
        );


        await prepareNextPage();


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


    } catch (error) {

        console.error(
            "Previous page flip error:",
            error
        );

    } finally {

        isFlipping = false;

        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );

        flipShadow.classList.remove(
            "active"
        );

        updateUI();
    }
}


/* =========================================================
   WAIT
========================================================= */

function wait(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =========================================================
   GO TO PAGE
========================================================= */

async function goToPage(value) {

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


    if (
        page === currentPage
    ) {

        updateUI();

        return;
    }


    /*
     * For direct page input we don't
     * animate through every page.
     */

    isFlipping = true;

    updateUI();


    try {

        currentPage =
            page;


        flipCurrentPage.classList.remove(
            "flip-forward",
            "flip-backward"
        );


        await renderFlipBook();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );

    } finally {

        isFlipping = false;

        updateUI();
    }
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

        renderFlipBook();
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

        renderFlipBook();
    }
}


function resetZoom() {

    zoom =
        DEFAULT_ZOOM;


    updateUI();


    if (pdfDocument) {

        renderFlipBook();
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


        announce(
            "Loading digital book..."
        );


        createFlipBook();


        const loadingTask =
            pdfjsLib.getDocument({

                url:
                    PDF_URL

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


        await renderFlipBook();


        announce(
            `Page 1 of ${pageCount}`
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


        showError(
            "PDF could not be loaded. Check the PDF URL and filename."
        );
    }
}


/* =========================================================
   WATERMARK SETTINGS
========================================================= */

const WATERMARK_TEXT =
    "ChishtiLibrary.com";

const WATERMARK_SUBTEXT =
    "CHISHTI LIBRARY";

const WATERMARK_OPACITY =
    0.22;


/* =========================================================
   GET SAFE DOWNLOAD NAME
========================================================= */

function getDownloadFileName() {

    let filename =
        rawBook
            .split("?")[0]
            .split("/")
            .pop() ||
        "chishti-library-book.pdf";


    try {

        filename =
            decodeURIComponent(
                filename
            );

    } catch (error) {

        console.warn(
            "Filename decode error:",
            error
        );
    }


    filename =
        filename.replace(
            /\.pdf$/i,
            ""
        );


    return (
        `${filename}-ChishtiLibrary-Watermarked.pdf`
    );
}


/* =========================================================
   CREATE WATERMARKED PDF
========================================================= */

async function createWatermarkedPDF() {

    if (!PDF_URL) {

        throw new Error(
            "No PDF selected."
        );
    }


    if (
        typeof PDFLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF-LIB is not available."
        );
    }


    const response =
        await fetch(
            PDF_URL,
            {
                cache:
                    "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `PDF download failed: ${response.status}`
        );
    }


    const pdfBytes =
        await response.arrayBuffer();


    const pdfDoc =
        await PDFLib.PDFDocument.load(
            pdfBytes
        );


    const font =
        await pdfDoc.embedFont(
            PDFLib.StandardFonts.HelveticaBold
        );


    const pages =
        pdfDoc.getPages();


    for (
        const page of pages
    ) {

        const {
            width,
            height
        } =
            page.getSize();


        const fontSize =
            Math.max(
                30,
                Math.min(
                    58,
                    Math.min(
                        width,
                        height
                    ) * 0.065
                )
            );


        const mainWidth =
            font.widthOfTextAtSize(
                WATERMARK_TEXT,
                fontSize
            );


        page.drawText(
            WATERMARK_TEXT,
            {

                x:
                    (
                        width -
                        mainWidth
                    ) / 2,

                y:
                    (
                        height -
                        fontSize
                    ) / 2,

                size:
                    fontSize,

                font:
                    font,

                color:
                    PDFLib.rgb(
                        0.29,
                        0,
                        0
                    ),

                opacity:
                    WATERMARK_OPACITY,

                rotate:
                    PDFLib.degrees(
                        -32
                    )
            }
        );


        const subSize =
            Math.max(
                14,
                fontSize * 0.42
            );


        const subWidth =
            font.widthOfTextAtSize(
                WATERMARK_SUBTEXT,
                subSize
            );


        page.drawText(
            WATERMARK_SUBTEXT,
            {

                x:
                    (
                        width -
                        subWidth
                    ) / 2,

                y:
                    (
                        height -
                        fontSize
                    ) / 2 -
                    fontSize * 0.85,

                size:
                    subSize,

                font:
                    font,

                color:
                    PDFLib.rgb(
                        0.83,
                        0.65,
                        0
                    ),

                opacity:
                    0.20,

                rotate:
                    PDFLib.degrees(
                        -32
                    )
            }
        );
    }


    return pdfDoc.save();
}


/* =========================================================
   DOWNLOAD WATERMARKED PDF
========================================================= */

async function downloadWatermarkedPDF() {

    if (!downloadButton) {
        return;
    }


    const originalText =
        downloadButton.innerHTML;


    try {

        downloadButton.disabled =
            true;


        downloadButton.innerHTML =
            "⏳";


        announce(
            "Preparing watermarked PDF..."
        );


        const finalBytes =
            await createWatermarkedPDF();


        const blob =
            new Blob(
                [finalBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const blobURL =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            blobURL;


        link.download =
            getDownloadFileName();


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            function () {

                URL.revokeObjectURL(
                    blobURL
                );

            },
            5000
        );


        announce(
            "Watermarked PDF downloaded successfully."
        );


    } catch (error) {

        console.error(
            "Watermarked download error:",
            error
        );


        alert(
            "Watermarked PDF could not be created. Please try again."
        );


        announce(
            "Watermarked PDF download failed."
        );


    } finally {

        downloadButton.disabled =
            false;


        downloadButton.innerHTML =
            originalText || "↓";


        updateUI();
    }
}


/* =========================================================
   DOWNLOAD BUTTON
========================================================= */

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadWatermarkedPDF
    );
}


/* =========================================================
   CLEAN DOWNLOAD
========================================================= */

if (cleanDownloadButton) {

    cleanDownloadButton.addEventListener(
        "click",
        function () {

            alert(
                "Clean download is not available. Please use the watermarked download."
            );

        }
    );
}


/* =========================================================
   PRINT
========================================================= */

async function printCurrentBook() {

    try {

        announce(
            "Preparing watermarked document for printing..."
        );


        const finalBytes =
            await createWatermarkedPDF();


        const blob =
            new Blob(
                [finalBytes],
                {
                    type:
                        "application/pdf"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const printWindow =
            window.open(
                url,
                "_blank"
            );


        if (!printWindow) {

            URL.revokeObjectURL(
                url
            );


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


        announce(
            "Watermarked document ready for printing."
        );


    } catch (error) {

        console.error(
            "Print error:",
            error
        );


        alert(
            "Watermarked print could not be prepared."
        );
    }
}


if (printButton) {

    printButton.addEventListener(
        "click",
        printCurrentBook
    );
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

        if (
            !document.fullscreenElement
        ) {

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


if (fullscreenButton) {

    fullscreenButton.addEventListener(
        "click",
        toggleFullscreen
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
                    behavior:
                        "smooth"
                });
            }


            announce(
                "Swipe navigation is enabled."
            );
        }
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


        switch (event.key) {

            case "ArrowLeft":

                event.preventDefault();

                previousPage();

                break;


            case "ArrowRight":

                event.preventDefault();

                nextPage();

                break;


            case "+":

            case "=":

                event.preventDefault();

                zoomIn();

                break;


            case "-":

                event.preventDefault();

                zoomOut();

                break;


            case "0":

                event.preventDefault();

                resetZoom();

                break;


            case "Home":

                event.preventDefault();

                goToPage(1);

                break;


            case "End":

                event.preventDefault();

                goToPage(pageCount);

                break;


            case "f":

            case "F":

                event.preventDefault();

                toggleFullscreen();

                break;


            case "t":

            case "T":

                event.preventDefault();

                applyTheme(
                    currentTheme + 1
                );

                break;
        }

    }
);


/* =========================================================
   TOUCH START
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
            passive:
                true
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
            passive:
                true
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


    if (
        Math.abs(deltaX) <
        SWIPE_THRESHOLD
    ) {

        return;
    }


    if (
        Math.abs(deltaX) <
        Math.abs(deltaY)
    ) {

        return;
    }


    if (deltaX < 0) {

        nextPage();

    } else {

        previousPage();
    }
}


/* =========================================================
   MOUSE DRAG / CLICK PAGE TURN
========================================================= */

if (bookViewport) {

    bookViewport.addEventListener(
        "click",
        function (event) {

            if (
                isFlipping ||
                !pdfDocument
            ) {

                return;
            }


            /*
             * Ignore controls.
             */

            if (
                event.target.closest(
                    "button,input,a"
                )
            ) {

                return;
            }


            const rect =
                bookViewport.getBoundingClientRect();


            const x =
                event.clientX -
                rect.left;


            /*
             * Right side = next.
             * Left side = previous.
             */

            if (
                x >
                rect.width * 0.62
            ) {

                nextPage();

                return;
            }


            if (
                x <
                rect.width * 0.38
            ) {

                previousPage();
            }

        }
    );
}


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
                        !isFlipping
                    ) {

                        renderFlipBook();
                    }

                },
                220
            );
    }
);


/* =========================================================
   ORIENTATION
========================================================= */

window.addEventListener(
    "orientationchange",
    function () {

        setTimeout(
            function () {

                if (pdfDocument) {

                    renderFlipBook();
                }

            },
            350
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

                    renderFlipBook();
                }

            },
            250
        );
    }
);


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        function () {

            loadPDF();

        }
    );
}


/* =========================================================
   START
========================================================= */

loadTheme();

setBookTitle();

createFlipBook();

updateUI();

loadPDF();
