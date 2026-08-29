/* =========================================================
   CHISHTI LIBRARY
   reader.js
   FULL PDF READER

   INCLUDED:
   ✅ PDF.js Reader
   ✅ Previous / Next
   ✅ Page Counter
   ✅ Zoom
   ✅ Theme
   ✅ Fullscreen
   ✅ Print with watermark
   ✅ Watermarked Download
   ✅ Mobile Swipe
   ✅ Bookmark Current Page
   ✅ Share Current Page
========================================================= */

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


/* =========================================================
   PDF.JS WORKER
========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   URL PARAMETERS
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
   LIBRARY THEME
========================================================= */

const LIBRARY_THEME = {

    maroon:
        "#4B0000",

    deepMaroon:
        "#350000",

    gold:
        "#D4A500",

    white:
        "#FFFFFF"

};


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

const themeButton =
    document.getElementById(
        "themeButton"
    );

const cleanDownloadButton =
    document.getElementById(
        "cleanDownloadButton"
    );

const bookmarkButton =
    document.getElementById(
        "bookmarkBtn"
    );

const shareButton =
    document.getElementById(
        "shareBtn"
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
   MOBILE SWIPE STATE
========================================================= */

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;


/* =========================================================
   THEME
========================================================= */

const themes = [

    {
        name:
            "Maroon",

        background:
            "#4B0000",

        surface:
            "#350000",

        accent:
            "#D4A500",

        text:
            "#FFFFFF"
    },

    {
        name:
            "Deep Maroon",

        background:
            "#350000",

        surface:
            "#4B0000",

        accent:
            "#D4A500",

        text:
            "#FFFFFF"
    },

    {
        name:
            "Gold",

        background:
            "#D4A500",

        surface:
            "#4B0000",

        accent:
            "#FFFFFF",

        text:
            "#FFFFFF"
    }

];


let currentTheme =
    0;


/* =========================================================
   BOOKMARK STORAGE KEY
========================================================= */

const bookmarkKey =
    "chishti_bookmark_" +
    encodeURIComponent(
        rawBook || "current-book"
    );


/* =========================================================
   APPLY THEME
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
            .replace(
                /\s+/g,
                "-"
            );


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

        currentTheme =
            saved;

    }


    applyTheme(
        currentTheme
    );

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
   UPDATE BOOKMARK UI
========================================================= */

function updateBookmarkButton() {

    if (!bookmarkButton) {
        return;
    }


    const savedPage =
        Number(
            localStorage.getItem(
                bookmarkKey
            )
        );


    if (
        savedPage &&
        savedPage === currentPage
    ) {

        bookmarkButton.classList.add(
            "active"
        );


        bookmarkButton.innerHTML =
            '<i class="fas fa-bookmark" aria-hidden="true"></i>';


        bookmarkButton.title =
            `Remove bookmark from page ${currentPage}`;


        bookmarkButton.setAttribute(
            "aria-label",
            `Remove bookmark from page ${currentPage}`
        );


    } else {

        bookmarkButton.classList.remove(
            "active"
        );


        bookmarkButton.innerHTML =
            '<i class="far fa-bookmark" aria-hidden="true"></i>';


        bookmarkButton.title =
            `Bookmark page ${currentPage}`;


        bookmarkButton.setAttribute(
            "aria-label",
            `Bookmark page ${currentPage}`
        );

    }

}


/* =========================================================
   BOOKMARK BUTTON
========================================================= */

if (bookmarkButton) {

    bookmarkButton.addEventListener(
        "click",
        function () {

            const savedPage =
                Number(
                    localStorage.getItem(
                        bookmarkKey
                    )
                );


            if (
                savedPage === currentPage
            ) {

                localStorage.removeItem(
                    bookmarkKey
                );


                announce(
                    `Bookmark removed from page ${currentPage}.`
                );


            } else {

                localStorage.setItem(
                    bookmarkKey,
                    String(currentPage)
                );


                announce(
                    `Page ${currentPage} bookmarked.`
                );

            }


            updateBookmarkButton();

        }
    );

}


/* =========================================================
   GET BOOK NAME FOR SHARE
========================================================= */

function getShareBookName() {

    if (!rawBook) {

        return "Chishti Library";

    }


    try {

        const filename =
            rawBook
                .split("?")[0]
                .split("/")
                .pop() || "";


        return decodeURIComponent(
            filename
        )
            .replace(
                /\.pdf$/i,
                ""
            )
            .replace(
                /[-_]+/g,
                " "
            )
            .trim() ||
            "Chishti Library";


    } catch (error) {

        return "Chishti Library";

    }

}


/* =========================================================
   SHARE BOOK / CURRENT PAGE
========================================================= */

async function shareCurrentPage() {

    const shareURL =
        new URL(
            window.location.href
        );


    /*
     * Current page URL mein save.
     */

    shareURL.searchParams.set(
        "page",
        String(currentPage)
    );


    const bookName =
        getShareBookName();


    const shareData = {

        title:
            `${bookName} — Chishti Library`,

        text:
            `Read "${bookName}" on Chishti Library — Page ${currentPage}`,

        url:
            shareURL.href

    };


    /*
     * Mobile / supported browser.
     */

    if (
        navigator.share
    ) {

        try {

            await navigator.share(
                shareData
            );


            announce(
                "Book shared successfully."
            );


            return;


        } catch (error) {

            /*
             * User ne share popup close kiya.
             */

            if (
                error &&
                error.name ===
                "AbortError"
            ) {

                return;

            }

            console.warn(
                "Native share failed:",
                error
            );

        }

    }


    /*
     * Desktop clipboard fallback.
     */

    try {

        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                shareURL.href
            );


            announce(
                "Reader link copied."
            );


            alert(
                `✅ Reader link copied!\n\nPage ${currentPage} ka direct link copy ho gaya.`
            );


            return;

        }

    } catch (error) {

        console.warn(
            "Clipboard error:",
            error
        );

    }


    /*
     * Old browser fallback.
     */

    try {

        const temporaryInput =
            document.createElement(
                "input"
            );


        temporaryInput.value =
            shareURL.href;


        temporaryInput.style.position =
            "fixed";

        temporaryInput.style.opacity =
            "0";


        document.body.appendChild(
            temporaryInput
        );


        temporaryInput.select();


        document.execCommand(
            "copy"
        );


        temporaryInput.remove();


        announce(
            "Reader link copied."
        );


        alert(
            `✅ Reader link copied!\n\nPage ${currentPage} ka direct link copy ho gaya.`
        );


    } catch (error) {

        console.error(
            "Share fallback error:",
            error
        );


        prompt(
            "Copy this reader link:",
            shareURL.href
        );

    }

}


/* =========================================================
   SHARE BUTTON
========================================================= */

if (shareButton) {

    shareButton.addEventListener(
        "click",
        shareCurrentPage
    );

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
            `${Math.round(
                zoom * 100
            )}%`;

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


    /*
     * Clean download intentionally disabled.
     */

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


    updateBookmarkButton();

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
            calculateScale(
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


        context.setTransform(
            pixelRatio,
            0,
            0,
            pixelRatio,
            0,
            0
        );


        context.fillStyle =
            "#FFFFFF";


        context.fillRect(
            0,
            0,
            viewport.width,
            viewport.height
        );


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


    cancelCurrentRender();


    try {

        setBookTitle();


        console.log(
            "Loading PDF:",
            PDF_URL
        );


        const loadingTask =
            pdfjsLib.getDocument({

                url:
                    PDF_URL

            });


        pdfDocument =
            await loadingTask.promise;


        pageCount =
            pdfDocument.numPages;


        /*
         * If URL contains ?page=5,
         * open page 5.
         */

        const urlPage =
            parseInt(
                params.get("page"),
                10
            );


        if (
            Number.isFinite(urlPage) &&
            urlPage >= 1 &&
            urlPage <= pageCount
        ) {

            currentPage =
                urlPage;

        } else {

            currentPage =
                1;

        }


        zoom =
            DEFAULT_ZOOM;


        console.log(
            "PDF loaded:",
            pageCount,
            "pages"
        );


        updateUI();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


        await renderPage(
            currentPage
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
   RETRY BUTTON
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadPDF
    );

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

const WATERMARK_COLOR =
    typeof PDFLib !== "undefined" &&
    PDFLib.rgb
        ? PDFLib.rgb(
            0.29,
            0,
            0
        )
        : null;


/* =========================================================
   SAFE DOWNLOAD FILE NAME
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
   WATERMARKED PDF DOWNLOAD
========================================================= */

async function downloadWatermarkedPDF() {

    if (!PDF_URL) {

        alert(
            "No PDF selected."
        );

        return;

    }


    if (
        typeof PDFLib ===
        "undefined"
    ) {

        alert(
            "PDF watermark system is not available. Please refresh the page."
        );

        return;

    }


    const originalText =
        downloadButton
            ? downloadButton.innerHTML
            : "";


    try {

        if (downloadButton) {

            downloadButton.disabled =
                true;

            downloadButton.innerHTML =
                "⏳";

        }


        announce(
            "Preparing watermarked PDF..."
        );


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
            let i = 0;
            i < pages.length;
            i++
        ) {

            const page =
                pages[i];


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
                        WATERMARK_COLOR ||
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


        const finalBytes =
            await pdfDoc.save();


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

        if (downloadButton) {

            downloadButton.disabled =
                false;

            downloadButton.innerHTML =
                originalText ||
                "↓";

        }


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
   CLEAN DOWNLOAD BLOCKED
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
   PRINT WATERMARKED BOOK
========================================================= */

async function printCurrentBook() {

    if (!PDF_URL) {

        alert(
            "No PDF selected."
        );

        return;

    }


    if (
        typeof PDFLib ===
        "undefined"
    ) {

        alert(
            "Watermark system is not available."
        );

        return;

    }


    try {

        announce(
            "Preparing watermarked document for printing..."
        );


        const response =
            await fetch(
                PDF_URL
            );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch PDF."
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


            const size =
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


            const textWidth =
                font.widthOfTextAtSize(
                    WATERMARK_TEXT,
                    size
                );


            page.drawText(
                WATERMARK_TEXT,
                {

                    x:
                        (
                            width -
                            textWidth
                        ) / 2,

                    y:
                        (
                            height -
                            size
                        ) / 2,

                    size:

                        size,

                    font:

                        font,

                    color:
                        PDFLib.rgb(
                            0.29,
                            0,
                            0
                        ),

                    opacity:
                        0.22,

                    rotate:
                        PDFLib.degrees(
                            -32
                        )

                }
            );

        }


        const finalBytes =
            await pdfDoc.save();


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


/* =========================================================
   PRINT BUTTON
========================================================= */

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

            goToPage(
                1
            );

            return;

        }


        if (
            event.key === "End"
        ) {

            event.preventDefault();

            goToPage(
                pageCount
            );

            return;

        }


        if (
            event.key === "f" ||
            event.key === "F"
        ) {

            toggleFullscreen();

            return;

        }


        if (
            event.key === "t" ||
            event.key === "T"
        ) {

            applyTheme(
                currentTheme + 1
            );

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


    if (
        Math.abs(deltaX) < 60
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

        return;

    }


    if (deltaX > 0) {

        previousPage();

    }

}


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
                180
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
   PREVENT CANVAS DRAG
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
   START READER
========================================================= */

loadTheme();

setBookTitle();

updateUI();

loadPDF();


/* =========================================================
   READY
========================================================= */

console.log(
    "======================================"
);

console.log(
    "📚 CHISHTI LIBRARY READER"
);

console.log(
    "✅ PDF Reader Ready"
);

console.log(
    "✅ Bookmark System Ready"
);

console.log(
    "✅ Share System Ready"
);

console.log(
    "✅ Zoom Ready"
);

console.log(
    "✅ Theme Ready"
);

console.log(
    "✅ Fullscreen Ready"
);

console.log(
    "✅ Watermarked Download Ready"
);

console.log(
    "======================================"
);
/* =========================================================
   CHISHTI LIBRARY
   PREMIUM PAGE FLIP — END OF READER.JS
========================================================= */

(() => {

    let flipBusy = false;

    const FLIP_TIME = 1000;

    /* =========================
       PAPER FLIP SOUND
    ========================= */

    const flipSound = new Audio("paper-slide.mp3");

    flipSound.preload = "auto";
    flipSound.volume = 0.35;


    function playFlipSound() {

        try {

            flipSound.currentTime = 0;
            flipSound.play().catch(() => {});

        } catch (error) {

            console.log("Flip sound unavailable");

        }

    }


    /* =========================
       FIND READER BUTTONS
    ========================= */

    function getNextButton() {

        return (
            document.getElementById("nextPageButton") ||
            document.querySelector("#nextPage")
        );

    }


    function getPreviousButton() {

        return (
            document.getElementById("previousPageButton") ||
            document.querySelector("#previousPage")
        );

    }


    /* =========================
       FLIP EFFECT
    ========================= */

    function pageFlip(direction) {

        if (flipBusy) return;

        const viewport =
            document.getElementById("bookViewport");

        const page =
            document.getElementById("pageWrapper");

        if (!viewport || !page) return;


        flipBusy = true;

        viewport.classList.add("chishti-is-flipping");


        /* =========================
           CREATE FLIP STAGE
        ========================= */

        const stage =
            document.createElement("div");

        stage.className =
            "chishti-flip-stage";


        /* =========================
           CREATE SHEET
        ========================= */

        const sheet =
            document.createElement("div");

        sheet.className =
            "chishti-flip-sheet";


        /* =========================
           GET PAGE SIZE
        ========================= */

        const rect =
            page.getBoundingClientRect();


        sheet.style.width =
            rect.width + "px";

        sheet.style.height =
            rect.height + "px";


        /* =========================
           FRONT
        ========================= */

        const front =
            document.createElement("div");

        front.className =
            "chishti-flip-face";


        /* =========================
           BACK
        ========================= */

        const back =
            document.createElement("div");

        back.className =
            "chishti-flip-face chishti-flip-back";


        /* =========================
           COPY CURRENT PAGE
        ========================= */

        const currentCanvas =
            document.getElementById("pdfCanvas");


        if (currentCanvas) {

            const frontCanvas =
                document.createElement("canvas");

            frontCanvas.width =
                currentCanvas.width;

            frontCanvas.height =
                currentCanvas.height;

            const ctx =
                frontCanvas.getContext("2d");

            if (ctx) {

                ctx.drawImage(
                    currentCanvas,
                    0,
                    0
                );

            }

            front.appendChild(frontCanvas);

        }


        /* =========================
           ADD FACES
        ========================= */

        sheet.appendChild(front);
        sheet.appendChild(back);

        stage.appendChild(sheet);

        viewport.appendChild(stage);


        /* =========================
           FLIP DIRECTION
        ========================= */

        if (direction === "next") {

            sheet.classList.add(
                "chishti-flip-forward"
            );

        } else {

            sheet.classList.add(
                "chishti-flip-backward"
            );

        }


        /* =========================
           SOUND
        ========================= */

        playFlipSound();


        /* =========================
           CLEANUP
        ========================= */

        setTimeout(() => {

            stage.remove();

            viewport.classList.remove(
                "chishti-is-flipping"
            );

            flipBusy = false;

        }, FLIP_TIME + 80);

    }


    /* =========================
       NEXT PAGE
    ========================= */

    const nextButton =
        getNextButton();


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            () => {

                if (flipBusy) return;

                pageFlip("next");

            },
            true
        );

    }


    /* =========================
       PREVIOUS PAGE
    ========================= */

    const previousButton =
        getPreviousButton();


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            () => {

                if (flipBusy) return;

                pageFlip("prev");

            },
            true
        );

    }


    /* =========================
       MOBILE SWIPE
    ========================= */

    const viewport =
        document.getElementById("bookViewport");

    let touchStartX = 0;
    let touchStartY = 0;


    if (viewport) {

        viewport.addEventListener(
            "touchstart",
            (e) => {

                if (!e.touches.length) return;

                touchStartX =
                    e.touches[0].clientX;

                touchStartY =
                    e.touches[0].clientY;

            },
            {
                passive: true
            }
        );


        viewport.addEventListener(
            "touchend",
            (e) => {

                if (!e.changedTouches.length) return;

                const endX =
                    e.changedTouches[0].clientX;

                const endY =
                    e.changedTouches[0].clientY;


                const diffX =
                    endX - touchStartX;

                const diffY =
                    endY - touchStartY;


                /* Ignore vertical scrolling */

                if (
                    Math.abs(diffX) < 70 ||
                    Math.abs(diffX) < Math.abs(diffY)
                ) {

                    return;

                }


                if (diffX < 0) {

                    const btn =
                        getNextButton();

                    if (
                        btn &&
                        !btn.disabled
                    ) {

                        btn.click();

                    }

                } else {

                    const btn =
                        getPreviousButton();

                    if (
                        btn &&
                        !btn.disabled
                    ) {

                        btn.click();

                    }

                }

            },
            {
                passive: true
            }
        );

    }


    console.log(
        "📖 Chishti Premium Page Flip Loaded"
    );

})();
