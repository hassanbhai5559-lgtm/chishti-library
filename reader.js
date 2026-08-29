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

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 1
Foundation + Books Loader
=========================================*/

/*=========================
PREMIUM LOADER
=========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        if (loader) {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(() => {

                loader.remove();

            }, 800);

        }

    }, 2500);

});

/*=========================
MOBILE MENU
=========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}

/*=========================
SCROLL TO TOP
=========================*/

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    scrollBtn.style.display =
        window.scrollY > 300 ? "block" : "none";

});

if (scrollBtn) {

    scrollBtn.onclick = () => {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    };

}

/*=========================
  VISITOR COUNTER
=========================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) return;

    try {

        const visitorRef =
            db.collection("counter").doc("visitors");


        /* =========================
           GET CURRENT DOCUMENT
        ========================= */

        const snapshot =
            await visitorRef.get();


        /* =========================
           CREATE DOCUMENT IF MISSING
        ========================= */

        if (!snapshot.exists) {

            await visitorRef.set({
                count: 1
            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            visitorCounter.innerText = "1";

            return;
        }


        /* =========================
           CHECK THIS SESSION
        ========================= */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* =========================
           NEW VISITOR
        ========================= */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore.FieldValue.increment(1)

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        /* =========================
           GET UPDATED COUNT
        ========================= */

        const latestSnapshot =
            await visitorRef.get();


        const visitors =
            Number(
                latestSnapshot.data().count
            ) || 0;


        /* =========================
           ANIMATION
        ========================= */

        let current = 0;

        const animation =
            setInterval(function () {

                current++;

                visitorCounter.innerText =
                    current;

                if (current >= visitors) {

                    clearInterval(animation);

                }

            }, 25);


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        visitorCounter.innerText = "0";

    }

}


/* =========================
   START COUNTER
========================= */

updateVisitorCounter();

/*=========================
GLOBAL VARIABLES
=========================*/

let allBooks = [];
let filteredBooks = [];

/*=========================
LOAD BOOKS.JSON
=========================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok) {

            throw new Error("books.json not found");

        }

        allBooks = await response.json();

        filteredBooks = [...allBooks];

        /* Book Counter */

        const bookCounter = document.getElementById("bookCounter");

        if (bookCounter) {

            let count = 0;

            const total = allBooks.length;

            const animation = setInterval(() => {

                count++;

                bookCounter.innerText = count;

                if (count >= total) {

                    clearInterval(animation);

                }

            }, 120);

        }

        if (typeof displayBooks === "function") {

            displayBooks(filteredBooks);

        }

        if (typeof latestBook === "function") {

            latestBook();

        }

        console.log("✅ Books Loaded Successfully");

    }

    catch (err) {

        console.error(err);

    }

}

loadBooks();

/*=========================
UTILITY
=========================*/

function byId(id) {

    return document.getElementById(id);

}

console.log("✅ Script Part 1 Loaded");

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 2
DISPLAY BOOKS + SEARCH + FILTER
=========================================*/

function displayBooks(books) {

    const container = document.getElementById("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    if (books.length === 0) {

        container.innerHTML = `
        <div class="no-books">
            <h2>No Books Found</h2>
            <p>Try another search.</p>
        </div>
        `;

        return;
    }

    books.forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}"
                 alt="${book.title}"
                 loading="lazy">

            <div class="book-content">

                <span class="book-category">
                    ${book.category}
                </span>

                <h2>${book.title}</h2>

                <h3>${book.author}</h3>

                <p>${book.description}</p>

                <div class="book-meta">

                    <span>👁 ${book.views || 0}</span>

                    <span>❤️ ${book.likes || 0}</span>

                    <span>⬇ ${book.downloads || 0}</span>

                </div>

                <div class="book-buttons">

                    <a href="reader.html?book=${encodeURIComponent(book.pdf)}"
                       class="btn">
                        📖 Read Online
                    </a>

                    <a href="${book.pdf}"
                       download
                       class="btn">
                        ⬇ Download
                    </a>

                </div>

            </div>

        </div>

        `;

    });

}
/*=========================
LIVE SEARCH
=========================*/

function searchBooks() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const value = input.value.toLowerCase().trim();

    filteredBooks = allBooks.filter(book =>

        (book.title || "").toLowerCase().includes(value) ||

        (book.author || "").toLowerCase().includes(value) ||

        (book.category || "").toLowerCase().includes(value) ||

        (book.language || "").toLowerCase().includes(value)

    );

    displayBooks(filteredBooks);

}

/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(category, button = null) {

    document.querySelectorAll(".category").forEach(btn => {

        btn.classList.remove("active");

    });

    if (button) {

        button.classList.add("active");

    }

    if (category === "All") {

        filteredBooks = [...allBooks];

    } else {

        filteredBooks = allBooks.filter(book =>

            book.category === category

        );

    }

    displayBooks(filteredBooks);

}

/*=========================
LATEST BOOK
=========================*/

function latestBook() {

    const latest = allBooks.find(book => book.latest === true);

    if (!latest) return;

    const image = document.querySelector(".book-image img");
    const title = document.querySelector(".book-info h2");
    const author = document.querySelector(".book-info h3");
    const desc = document.querySelector(".book-info p");

    const buttons = document.querySelectorAll(".book-buttons a");

    if (image) image.src = latest.cover;
    if (title) title.innerText = latest.title;
    if (author) author.innerText = latest.author;
    if (desc) desc.innerText = latest.description;

    if (buttons.length >= 2) {

        buttons[0].href = latest.pdf;
        buttons[0].target = "_blank";

        buttons[1].href = latest.pdf;

    }

}

console.log("✅ Script Part 2 Loaded");

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 3
AI CHATBOT
=========================================*/

let knowledge = [];

/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge() {

    try {

        const response = await fetch("knowledge.json");

        if (!response.ok) {

            throw new Error("knowledge.json not found");

        }

        knowledge = await response.json();

        console.log("✅ Knowledge Loaded");

    }

    catch (err) {

        console.log(err);

    }

}

loadKnowledge();

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

/*=========================
OPEN CHAT
=========================*/

if (chatBtn) {

    chatBtn.onclick = () => {

        chatWindow.style.display = "flex";

    };

}

/*=========================
CLOSE CHAT
=========================*/

if (closeChat) {

    closeChat.onclick = () => {

        chatWindow.style.display = "none";

    };

}

/*=========================
ENTER KEY
=========================*/

if (chatInput) {

    chatInput.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            sendMessage();

        }

    });

}

/*=========================
SEARCH BOOK
=========================*/

function searchBook(question) {

    const q = question.toLowerCase();

    for (const book of allBooks) {

        if (
            (book.title || "").toLowerCase().includes(q) ||
            (book.category || "").toLowerCase().includes(q)
        ) {

            return `

📚 <b>${book.title}</b><br>

👤 ${book.author}<br>

📂 ${book.category}<br><br>

<a href="reader.html?book=${encodeURIComponent(book.pdf)}" class="btn">
📖 Read Online
</a>

&nbsp;

<a href="${book.pdf}" download class="btn">
⬇ Download
</a>

`;

        }

    }

    return null;
}

/*=========================
SEARCH KNOWLEDGE
=========================*/

function searchKnowledge(question) {

    const q = question.toLowerCase();

    for (const item of knowledge) {

        if (

            (item.question || "").toLowerCase().includes(q)

        ) {

            return item.answer;

        }

    }

    return null;

}

/*=========================
BOT MESSAGE
=========================*/

function botReply(text) {

    chatMessages.innerHTML += `

<div class="bot-message">

${text}

</div>

`;

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/*=========================
USER MESSAGE
=========================*/

function userReply(text) {

    chatMessages.innerHTML += `

<div class="user-message">

${text}

</div>

`;

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/*=========================
SEND MESSAGE
=========================*/

function sendMessage() {

    const question = chatInput.value.trim();

    if (question === "") return;

    userReply(question);

    chatInput.value = "";

    setTimeout(() => {

        let reply = searchBook(question);

        if (!reply) {

            reply = searchKnowledge(question);

        }

        if (!reply) {

            reply = `

🤖 Sorry!

Mujhe iska jawab abhi database me nahi mila.

`;

        }

        botReply(reply);

    }, 500);

}

console.log("✅ Script Part 3 Loaded");

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 4
FINAL PREMIUM
=========================================*/

/*=========================
SCROLL ANIMATION
=========================*/

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show-section");

        }

    });

}, {

    threshold: 0.15

});

sections.forEach(section => {

    observer.observe(section);

});

/*=========================
BOOK CARD HOVER
=========================*/

document.addEventListener("mouseover", (e) => {

    const card = e.target.closest(".book-card");

    if (card) {

        card.style.transform = "translateY(-10px)";
        card.style.transition = ".35s";

    }

});

document.addEventListener("mouseout", (e) => {

    const card = e.target.closest(".book-card");

    if (card) {

        card.style.transform = "translateY(0px)";

    }

});

/*=========================
DOWNLOAD COUNTER
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest("a");

    if (!btn) return;

    if (btn.hasAttribute("download")) {

        let total = Number(localStorage.getItem("downloads")) || 0;

        total++;

        localStorage.setItem("downloads", total);

    }

});

/*=========================
READ COUNTER
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest("a");

    if (!btn) return;

    if (

        btn.href.includes(".pdf") &&

        !btn.hasAttribute("download")

    ) {

        let total = Number(localStorage.getItem("reads")) || 0;

        total++;

        localStorage.setItem("reads", total);

    }

});

/*=========================
BUTTON RIPPLE
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest(".btn");

    if (!btn) return;

    const ripple = document.createElement("span");

    ripple.className = "ripple";

    ripple.style.left = e.offsetX + "px";

    ripple.style.top = e.offsetY + "px";

    btn.appendChild(ripple);

    setTimeout(() => {

        ripple.remove();

    }, 600);

});

/*=========================
NAVBAR SHADOW
=========================*/

window.addEventListener("scroll", () => {

    const nav = document.querySelector(".navbar");

    if (!nav) return;

    if (window.scrollY > 40) {

        nav.classList.add("nav-shadow");

    }

    else {

        nav.classList.remove("nav-shadow");

    }

});

/*=========================
AUTO YEAR
=========================*/

const year = document.getElementById("year");

if (year) {

    year.innerText = new Date().getFullYear();

}

/*=========================
IMAGE FALLBACK
=========================*/

document.querySelectorAll("img").forEach(img => {

    img.onerror = function () {

        this.src = "logo.png";

    };

});

/*=========================
PRELOAD BOOK COVERS
=========================*/

window.addEventListener("load", () => {

    if (!Array.isArray(allBooks)) return;

    allBooks.forEach(book => {

        const image = new Image();

        image.src = book.cover;

    });

});

/*=========================
SMOOTH ANCHOR LINKS
=========================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

/*=========================
CONSOLE
=========================*/

console.log("====================================");

console.log("📚 CHISHTI LIBRARY");

console.log("Version : 1.0");

console.log("Developer : Ali Hassan");

console.log("====================================");

console.log("✅ Loader");

console.log("✅ Navbar");

console.log("✅ Search");

console.log("✅ Categories");

console.log("✅ Books");

console.log("✅ AI");

console.log("✅ Reader");

console.log("✅ Downloads");

console.log("✅ Responsive");

console.log("🚀 Production Ready");
