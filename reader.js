/* =========================================================
   CHISHTI LIBRARY
   PREMIUM READER.JS
   FULL CLEAN + FIXED VERSION

   FEATURES
   ✅ PDF.JS 4.10.38
   ✅ NEXT / PREVIOUS
   ✅ PREMIUM PAGE FLIP
   ✅ PAGE SWAP ANIMATION
   ✅ MOBILE SWIPE
   ✅ KEYBOARD NAVIGATION
   ✅ PAGE COUNTER
   ✅ PAGE INPUT
   ✅ ZOOM
   ✅ THEMES
   ✅ FULLSCREEN
   ✅ BOOKMARK
   ✅ SHARE
   ✅ WATERMARK DOWNLOAD
   ✅ WATERMARK PRINT
   ✅ READER SEARCH
   ✅ URL PAGE SUPPORT
   ✅ DUPLICATE SEARCH REMOVED
   ✅ RENDER CONFLICT PROTECTION
========================================================= */


/* =========================================================
   PDF.JS
========================================================= */

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


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
   PDF URL
========================================================= */

function getPDFURL() {

    if (!rawBook) {
        return "";
    }

    try {

        const cleanPath =
            decodeURIComponent(rawBook)
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


/* =========================================================
   SETTINGS
========================================================= */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;


/*
 * Premium flip speed.
 */

const FLIP_TIME = 650;


/* =========================================================
   DOM ELEMENTS
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


const themeButton =
    document.getElementById("themeButton");


const cleanDownloadButton =
    document.getElementById("cleanDownloadButton");


const bookmarkButton =
    document.getElementById("bookmarkBtn");


const shareButton =
    document.getElementById("shareBtn");


const readerSearchInput =
    document.getElementById("readerSearchInput");


const readerSearchClear =
    document.getElementById("readerSearchClear");


const readerSearchResults =
    document.getElementById("readerSearchResults");


const readerSearchButton =
    document.getElementById("readerSearchButton");


const listenButton =
    document.getElementById("listenButton");


const pauseListenButton =
    document.getElementById("pauseListenButton");


const stopListenButton =
    document.getElementById("stopListenButton");


const listenSpeed =
    document.getElementById("listenSpeed");


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

let currentRenderTask = null;

let pageTransitionBusy = false;

let loadingPDF = false;

let renderVersion = 0;


/* =========================================================
   MOBILE TOUCH STATE
========================================================= */

let touchStartX = 0;

let touchStartY = 0;


/* =========================================================
   TEXT SEARCH + READ ALOUD STATE
========================================================= */

const pageTextCache = new Map();

let textSearchResults = [];

let textSearchToken = 0;

let speechMode = "stopped";

let speechToken = 0;

let speechQueue = [];

let speechQueueIndex = 0;

let speechCurrentPage = 0;

let speechPreferredVoice = null;


const MAX_TTS_CHUNK = 260;


/* =========================================================
   THEMES
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
   BOOKMARK KEY
========================================================= */

const bookmarkKey =
    "chishti_bookmark_" +
    encodeURIComponent(
        rawBook || "current-book"
    );


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
        "Chishti Reader:",
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
   BOOK NAME
========================================================= */

function getBookName() {

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


function setBookTitle() {

    if (!bookTitle) {

        return;

    }


    bookTitle.textContent =
        getBookName();

}


/* =========================================================
   THEME SYSTEM
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


    const root =
        document.documentElement;


    root.style.setProperty(
        "--library-maroon",
        "#4B0000"
    );


    root.style.setProperty(
        "--library-deep-maroon",
        "#350000"
    );


    root.style.setProperty(
        "--library-gold",
        "#D4A500"
    );


    root.style.setProperty(
        "--library-white",
        "#FFFFFF"
    );


    root.style.setProperty(
        "--reader-background",
        theme.background
    );


    root.style.setProperty(
        "--reader-surface",
        theme.surface
    );


    root.style.setProperty(
        "--reader-accent",
        theme.accent
    );


    root.style.setProperty(
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
            `Theme: ${theme.name}. Click to change`
        );

    }


    try {

        localStorage.setItem(
            "chishtiReaderTheme",
            String(currentTheme)
        );

    } catch (error) {

        console.warn(
            "Theme storage unavailable."
        );

    }

}


function loadTheme() {

    let saved = 0;


    try {

        saved =
            Number(
                localStorage.getItem(
                    "chishtiReaderTheme"
                )
            );

    } catch (error) {

        saved = 0;

    }


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


if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            applyTheme(
                currentTheme + 1
            );


            announce(
                `Theme changed to ${themes[currentTheme].name}.`
            );

        }
    );

}


/* =========================================================
   BOOKMARK SYSTEM
========================================================= */

function getSavedBookmark() {

    try {

        return Number(
            localStorage.getItem(
                bookmarkKey
            )
        ) || 0;

    } catch (error) {

        return 0;

    }

}


function updateBookmarkButton() {

    if (!bookmarkButton) {

        return;

    }


    const savedPage =
        getSavedBookmark();


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

    } else {

        bookmarkButton.classList.remove(
            "active"
        );


        bookmarkButton.innerHTML =
            '<i class="far fa-bookmark" aria-hidden="true"></i>';


        bookmarkButton.title =
            `Bookmark page ${currentPage}`;

    }

}


if (bookmarkButton) {

    bookmarkButton.addEventListener(
        "click",
        function () {

            const savedPage =
                getSavedBookmark();


            try {

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

            } catch (error) {

                console.error(
                    "Bookmark error:",
                    error
                );

            }


            updateBookmarkButton();

        }
    );

}


/* =========================================================
   SHARE
========================================================= */

async function shareCurrentPage() {

    try {

        const shareURL =
            new URL(
                window.location.href
            );


        shareURL.searchParams.set(
            "page",
            String(currentPage)
        );


        const bookName =
            getBookName();


        const shareData = {

            title:
                `${bookName} — Chishti Library`,

            text:
                `Read "${bookName}" on Chishti Library — Page ${currentPage}`,

            url:
                shareURL.href

        };


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

                if (
                    error?.name ===
                    "AbortError"
                ) {

                    return;

                }

            }

        }


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
                `✅ Reader link copied!\n\nPage ${currentPage} direct link copied.`
            );


            return;

        }


        const input =
            document.createElement("input");


        input.value =
            shareURL.href;


        input.style.position =
            "fixed";


        input.style.opacity =
            "0";


        document.body.appendChild(
            input
        );


        input.select();


        document.execCommand(
            "copy"
        );


        input.remove();


        announce(
            "Reader link copied."
        );


        alert(
            `✅ Reader link copied!\n\nPage ${currentPage} direct link copied.`
        );


    } catch (error) {

        console.error(
            "Share error:",
            error
        );


        try {

            const shareURL =
                new URL(
                    window.location.href
                );


            shareURL.searchParams.set(
                "page",
                String(currentPage)
            );


            prompt(
                "Copy this reader link:",
                shareURL.href
            );

        } catch (fallbackError) {

            console.error(
                fallbackError
            );

        }

    }

}


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
            `${Math.round(zoom * 100)}%`;

    }


    if (previousPageButton) {

        previousPageButton.disabled =
            !pdfDocument ||
            currentPage <= 1 ||
            pageTransitionBusy;

    }


    if (nextPageButton) {

        nextPageButton.disabled =
            !pdfDocument ||
            currentPage >= pageCount ||
            pageTransitionBusy;

    }


    if (cleanDownloadButton) {

        cleanDownloadButton.disabled =
            true;

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
            "Fullscreen error:",
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


document.addEventListener(
    "fullscreenchange",
    function () {

        setTimeout(
            function () {

                if (
                    pdfDocument &&
                    !pageTransitionBusy
                ) {

                    renderPage(
                        currentPage,
                        false
                    );

                }

            },
            250
        );

    }
);


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
   DOWNLOAD FILE NAME
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

    } catch (error) {}


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
   WATERMARK PDF
========================================================= */

async function createWatermarkedPDF() {

    if (
        typeof PDFLib ===
        "undefined"
    ) {

        throw new Error(
            "PDFLib is not loaded."
        );

    }


    if (!PDF_URL) {

        throw new Error(
            "No PDF URL."
        );

    }


    const response =
        await fetch(
            PDF_URL,
            {
                cache: "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `PDF fetch failed: ${response.status}`
        );

    }


    const bytes =
        await response.arrayBuffer();


    const pdfDoc =
        await PDFLib.PDFDocument.load(
            bytes
        );


    const font =
        await pdfDoc.embedFont(
            PDFLib.StandardFonts.HelveticaBold
        );


    const pages =
        pdfDoc.getPages();


    for (const page of pages) {

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


        const textWidth =
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
                        textWidth
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
   DOWNLOAD
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
            "Watermark system is not loaded. Please refresh the reader."
        );

        return;

    }
