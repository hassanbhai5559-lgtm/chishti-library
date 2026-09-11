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


        cleanDownloadButton.title =
            "Clean download is not available";

    }


    updateBookmarkButton();
    updateListenUI();

}


/* =========================================================
   SCALE CALCULATION
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
            "Render cancel:",
            error
        );

    }


    currentRenderTask =
        null;

}


/* =========================================================
   RENDER PAGE
========================================================= */

async function renderPage(
    pageNumber,
    announcePage = true
) {

    if (
        !pdfDocument ||
        !pdfCanvas ||
        !context
    ) {

        return false;

    }


    const myRenderVersion =
        ++renderVersion;


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


        if (
            myRenderVersion !==
            renderVersion
        ) {

            return false;

        }


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


        if (
            myRenderVersion !==
            renderVersion
        ) {

            return false;

        }


        currentRenderTask =
            null;


        currentPage =
            pageNumber;


        updateUI();


        if (announcePage) {

            announce(
                `Page ${currentPage} of ${pageCount}`
            );

        }


        return true;

    } catch (error) {

        if (
            error?.name ===
            "RenderingCancelledException"
        ) {

            return false;

        }


        console.error(
            "Page render error:",
            error
        );


        if (
            myRenderVersion ===
            renderVersion
        ) {

            showError(
                "This PDF page could not be rendered."
            );

        }


        return false;

    } finally {

        currentRenderTask =
            null;

    }

}


/* =========================================================
   PAGE FLIP
========================================================= */

async function playPageFlip(
    direction,
    targetPage
) {

    if (
        pageTransitionBusy ||
        !pdfDocument
    ) {

        return;

    }


    if (
        targetPage < 1 ||
        targetPage > pageCount
    ) {

        return;

    }


    pageTransitionBusy =
        true;


    updateUI();


    const viewport =
        bookViewport;


    const page =
        pageWrapper;


    const canvas =
        pdfCanvas;


    if (
        !viewport ||
        !page ||
        !canvas
    ) {

        pageTransitionBusy =
            false;


        updateUI();


        await renderPage(
            targetPage
        );


        return;

    }


    const rect =
        page.getBoundingClientRect();


    const width =
        rect.width ||
        canvas.clientWidth ||
        300;


    const height =
        rect.height ||
        canvas.clientHeight ||
        400;


    /*
     * Copy current page.
     */

    const oldCanvas =
        document.createElement("canvas");


    oldCanvas.width =
        canvas.width;


    oldCanvas.height =
        canvas.height;


    const oldContext =
        oldCanvas.getContext("2d");


    if (oldContext) {

        oldContext.drawImage(
            canvas,
            0,
            0
        );

    }


    /*
     * Stage.
     */

    const stage =
        document.createElement("div");


    stage.className =
        "chishti-page-flip-stage";


    stage.style.width =
        `${width}px`;


    stage.style.height =
        `${height}px`;


    /*
     * Sheet.
     */

    const sheet =
        document.createElement("div");


    sheet.className =
        "chishti-page-flip-sheet";


    sheet.style.width =
        `${width}px`;


    sheet.style.height =
        `${height}px`;


    /*
     * Front.
     */

    const front =
        document.createElement("div");


    front.className =
        "chishti-page-flip-face chishti-page-flip-front";


    const frontCanvas =
        document.createElement("canvas");


    frontCanvas.width =
        oldCanvas.width;


    frontCanvas.height =
        oldCanvas.height;


    frontCanvas.style.width =
        `${width}px`;


    frontCanvas.style.height =
        `${height}px`;


    const frontContext =
        frontCanvas.getContext("2d");


    if (frontContext) {

        frontContext.drawImage(
            oldCanvas,
            0,
            0
        );

    }


    front.appendChild(
        frontCanvas
    );


    /*
     * Back.
     */

    const back =
        document.createElement("div");


    back.className =
        "chishti-page-flip-face chishti-page-flip-back";


    back.innerHTML = `
        <div class="chishti-flip-paper"></div>
    `;


    sheet.appendChild(
        front
    );


    sheet.appendChild(
        back
    );


    stage.appendChild(
        sheet
    );


    if (direction === "next") {

        stage.classList.add(
            "chishti-flip-next"
        );

    } else {

        stage.classList.add(
            "chishti-flip-prev"
        );

    }


    viewport.appendChild(
        stage
    );


    /*
     * Force animation start.
     */

    void stage.offsetWidth;


    stage.classList.add(
        "chishti-flip-running"
    );


    announce(
        direction === "next"
            ? `Opening page ${targetPage}...`
            : `Returning to page ${targetPage}...`
    );


    /*
     * Render target during animation.
     */

    const renderDelay =
        Math.floor(
            FLIP_TIME * 0.42
        );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                renderDelay
            )
    );


    if (
        !pageTransitionBusy
    ) {

        stage.remove();

        return;

    }


    await renderPage(
        targetPage,
        false
    );


    /*
     * Finish animation.
     */

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                Math.max(
                    0,
                    FLIP_TIME - renderDelay
                )
            )
    );


    stage.classList.remove(
        "chishti-flip-running"
    );


    stage.remove();


    pageTransitionBusy =
        false;


    updateUI();


    announce(
        `Page ${currentPage} of ${pageCount}`
    );

}


/* =========================================================
   GO TO PAGE
========================================================= */

function goToPage(
    value,
    animated = true
) {

    if (
        !pdfDocument ||
        pageTransitionBusy
    ) {

        return;

    }


    let target =
        parseInt(
            value,
            10
        );


    if (!Number.isFinite(target)) {

        target =
            currentPage;

    }


    target =
        Math.max(
            1,
            Math.min(
                target,
                pageCount
            )
        );


    if (
        target === currentPage
    ) {

        updateUI();

        return;

    }


    if (!animated) {

        renderPage(
            target
        );


        return;

    }


    const direction =
        target > currentPage
            ? "next"
            : "prev";


    playPageFlip(
        direction,
        target
    );

}


/* =========================================================
   NEXT PAGE
========================================================= */

function nextPage() {

    if (
        speechMode !== "stopped" && !pageTransitionBusy
    ) {
        stopSpeechForManualNavigation();
    }

    if (
        !pdfDocument ||
        pageTransitionBusy ||
        currentPage >= pageCount
    ) {

        return;

    }


    goToPage(
        currentPage + 1,
        true
    );

}


/* =========================================================
   PREVIOUS PAGE
========================================================= */

function previousPage() {

    if (
        speechMode !== "stopped" && !pageTransitionBusy
    ) {
        stopSpeechForManualNavigation();
    }

    if (
        !pdfDocument ||
        pageTransitionBusy ||
        currentPage <= 1
    ) {

        return;

    }


    goToPage(
        currentPage - 1,
        true
    );

}


/* =========================================================
   PAGE BUTTONS
========================================================= */

if (nextPageButton) {

    nextPageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            nextPage();

        }
    );

}


if (previousPageButton) {

    previousPageButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            previousPage();

        }
    );

}


/* =========================================================
   ZOOM
========================================================= */

function zoomIn() {

    if (pageTransitionBusy) {
        return;
    }


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
            currentPage,
            false
        );

    }

}


function zoomOut() {

    if (pageTransitionBusy) {
        return;
    }


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
            currentPage,
            false
        );

    }

}


function resetZoom() {

    if (pageTransitionBusy) {
        return;
    }


    zoom =
        DEFAULT_ZOOM;


    updateUI();


    if (pdfDocument) {

        renderPage(
            currentPage,
            false
        );

    }

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
        function () {

            goToPage(
                this.value,
                true
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
                    this.value,
                    true
                );


                this.blur();

            }

        }
    );

}


/* =========================================================
   KEYBOARD NAVIGATION
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


        switch (event.key) {

            case "ArrowRight":

            case "PageDown":

                event.preventDefault();

                nextPage();

                break;


            case "ArrowLeft":

            case "PageUp":

                event.preventDefault();

                previousPage();

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

                if (!pageTransitionBusy) {

                    goToPage(
                        1,
                        true
                    );

                }

                break;


            case "End":

                event.preventDefault();

                if (!pageTransitionBusy) {

                    goToPage(
                        pageCount,
                        true
                    );

                }

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


            if (pageTransitionBusy) {
                return;
            }


            const touch =
                event.changedTouches[0];


            const deltaX =
                touch.clientX -
                touchStartX;


            const deltaY =
                touch.clientY -
                touchStartY;


            if (
                Math.abs(deltaX) < 60 ||
                Math.abs(deltaX) <= Math.abs(deltaY)
            ) {

                return;

            }


            if (deltaX < 0) {

                nextPage();

            } else {

                previousPage();

            }

        },
        {
            passive: true
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
                200
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
            300
        );

    }
);


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


    const oldHTML =
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


        const link =
            document.createElement("a");


        link.href =
            url;


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
                    url
                );

            },
            5000
        );


        announce(
            "Watermarked PDF downloaded successfully."
        );

    } catch (error) {

        console.error(
            "Download error:",
            error
        );


        alert(
            "Watermarked PDF could not be created."
        );


        announce(
            "Download failed."
        );

    } finally {

        if (downloadButton) {

            downloadButton.disabled =
                false;


            downloadButton.innerHTML =
                oldHTML || "↓";

        }


        updateUI();

    }

}


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
            "Watermark system is not loaded."
        );

        return;

    }


    try {

        announce(
            "Preparing watermarked document..."
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
   READER SEARCH — FIXED

   One search box now supports BOTH:
   1) Searching the current PDF text and jumping to pages.
   2) Searching the library books by title/author/category/language.
========================================================= */

let readerBooks = [];
let searchLoaded = false;


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* Arabic/Urdu-friendly normalization. */
function normalizeSearchText(value) {
    return String(value ?? "")
        .normalize("NFKC")
        .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
        .replace(/ـ/g, "")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[إأٱآ]/g, "ا")
        .replace(/ى/g, "ی")
        .replace(/ئ/g, "ی")
        .replace(/ؤ/g, "و")
        .replace(/ة/g, "ه")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase();
}


function getBookTitleFromData(book) {
    return String(book?.title || book?.name || book?.bookTitle || book?.bookName || "");
}

function getBookAuthorFromData(book) {
    return String(book?.author || book?.authorName || book?.writer || book?.writerName || "");
}

function getBookCategoryFromData(book) {
    return String(book?.category || book?.categoryName || book?.subject || book?.genre || "");
}

function getBookLanguageFromData(book) {
    return String(book?.language || book?.lang || "");
}

function getBookImageFromData(book) {
    return String(book?.image || book?.cover || book?.coverImage || book?.thumbnail || book?.imageUrl || "");
}

function getBookPDFFromData(book) {
    return book?.pdf || book?.pdfUrl || book?.file || book?.fileUrl || book?.url || book?.path || book?.downloadUrl || "";
}


async function loadReaderBooks() {
    if (searchLoaded) return;
    searchLoaded = true;

    try {
        const response = await fetch("books.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(`books.json HTTP ${response.status}`);

        const data = await response.json();
        readerBooks = Array.isArray(data) ? data : (Array.isArray(data.books) ? data.books : []);
        console.log(`✅ Reader search loaded ${readerBooks.length} books.`);
    } catch (error) {
        console.warn("Reader search books.json error:", error);
        readerBooks = Array.isArray(window.books) ? window.books
            : Array.isArray(window.bookData) ? window.bookData
            : Array.isArray(window.libraryBooks) ? window.libraryBooks
            : Array.isArray(window.allBooks) ? window.allBooks
            : [];
    }
}


function closeSearch() {
    if (!readerSearchResults) return;
    readerSearchResults.innerHTML = "";
    readerSearchResults.classList.remove("show");
    if (readerSearchClear) readerSearchClear.classList.remove("active");
}


function showSearchMessage(message) {
    if (!readerSearchResults) return;
    readerSearchResults.innerHTML = `<div class="reader-search-empty">${message}</div>`;
    readerSearchResults.classList.add("show");
}


function makeSearchResult({ type, title, meta, snippet, page, image, onClick }) {
    const result = document.createElement("div");
    result.className = `reader-search-result ${type === "page" ? "reader-search-page" : ""}`;
    result.setAttribute("role", "option");
    result.tabIndex = 0;

    const imageHTML = image
        ? `<img src="${escapeHTML(image)}" alt="" loading="lazy" onerror="this.style.display='none'">`
        : `<span>📖</span>`;

    result.innerHTML = `
        <div class="reader-search-result-image">${imageHTML}</div>
        <div class="reader-search-result-info">
            <div class="reader-search-result-title">${escapeHTML(title)}</div>
            ${meta ? `<div class="reader-search-result-author">${escapeHTML(meta)}</div>` : ""}
            ${page ? `<div class="reader-search-page-number">Page ${page}</div>` : ""}
            ${snippet ? `<div class="reader-search-snippet">${escapeHTML(snippet)}</div>` : ""}
            <span class="reader-search-result-type">${type === "page" ? "This book" : "Library book"}</span>
        </div>
    `;

    result.addEventListener("click", onClick);
    result.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick();
        }
    });

    return result;
}


async function getPageText(pageNumber) {
    if (!pdfDocument) return "";
    if (pageTextCache.has(pageNumber)) return pageTextCache.get(pageNumber);

    try {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent({
            normalizeWhitespace: true,
            disableCombineTextItems: false
        });

        const text = textContent.items
            .map(item => item?.str || "")
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        pageTextCache.set(pageNumber, text);
        return text;
    } catch (error) {
        console.warn(`Could not extract text from page ${pageNumber}:`, error);
        pageTextCache.set(pageNumber, "");
        return "";
    }
}


function makeSnippet(text, query) {
    const source = String(text || "");
    const normalizedSource = normalizeSearchText(source);
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedSource || !normalizedQuery) return source.slice(0, 150);

    const index = normalizedSource.indexOf(normalizedQuery);
    if (index < 0) return source.slice(0, 170);

    /* Character positions are close enough for a readable snippet even
       when Arabic normalization changes the exact source index. */
    const start = Math.max(0, index - 70);
    return `${source.slice(start, start + 190)}${source.length > start + 190 ? "…" : ""}`;
}


async function searchCurrentPDF(query, token) {
    if (!pdfDocument || !query) return [];

    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return [];

    const matches = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
        if (token !== textSearchToken) return [];

        const text = await getPageText(pageNumber);
        if (!text) continue;

        if (normalizeSearchText(text).includes(normalizedQuery)) {
            matches.push({
                page: pageNumber,
                text,
                snippet: makeSnippet(text, query)
            });
        }

        /* Keep the UI responsive on large books. */
        if (pageNumber % 4 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return matches;
}


function openSearchBook(book) {
    const pdfUrl = getBookPDFFromData(book);
    if (!pdfUrl) {
        announce("This library entry does not have a PDF URL.");
        return;
    }

    try {
        const readerURL = new URL("reader.html", window.location.href);
        readerURL.searchParams.set("book", pdfUrl);
        window.location.href = readerURL.href;
    } catch (error) {
        console.error("Unable to open book:", error);
    }
}


async function searchBooks(query) {
    if (!readerSearchResults) return;

    const rawQuery = String(query ?? "").trim();
    if (!rawQuery) {
        textSearchToken++;
        closeSearch();
        return;
    }

    if (readerSearchClear) readerSearchClear.classList.add("active");

    const token = ++textSearchToken;
    readerSearchResults.innerHTML = `<div class="reader-search-count">Searching…</div>`;
    readerSearchResults.classList.add("show");

    const [pdfMatches] = await Promise.all([
        searchCurrentPDF(rawQuery, token),
        loadReaderBooks()
    ]);

    if (token !== textSearchToken) return;

    const cleanQuery = normalizeSearchText(rawQuery);
    const bookMatches = readerBooks.filter(book => {
        const combined = [
            getBookTitleFromData(book),
            getBookAuthorFromData(book),
            getBookCategoryFromData(book),
            getBookLanguageFromData(book)
        ].map(normalizeSearchText).join(" ");
        return combined.includes(cleanQuery);
    }).slice(0, 12);

    readerSearchResults.innerHTML = "";

    if (pdfMatches.length) {
        const header = document.createElement("div");
        header.className = "reader-search-count";
        header.textContent = `${pdfMatches.length} page${pdfMatches.length === 1 ? "" : "s"} found in this book`;
        readerSearchResults.appendChild(header);

        pdfMatches.slice(0, 20).forEach(match => {
            const item = makeSearchResult({
                type: "page",
                title: `Match on page ${match.page}`,
                meta: `Jump directly to page ${match.page}`,
                snippet: match.snippet,
                page: match.page,
                onClick: () => {
                    closeSearch();
                    goToPage(match.page, true);
                }
            });
            readerSearchResults.appendChild(item);
        });
    }

    if (bookMatches.length) {
        const header = document.createElement("div");
        header.className = "reader-search-count";
        header.textContent = `Library books${pdfMatches.length ? " — more results" : ""}`;
        readerSearchResults.appendChild(header);

        bookMatches.forEach(book => {
            const title = getBookTitleFromData(book) || "Untitled Book";
            const author = getBookAuthorFromData(book);
            const category = getBookCategoryFromData(book);
            const image = getBookImageFromData(book);

            readerSearchResults.appendChild(makeSearchResult({
                type: "book",
                title,
                meta: author || category,
                image,
                onClick: () => openSearchBook(book)
            }));
        });
    }

    if (!pdfMatches.length && !bookMatches.length) {
        showSearchMessage(`🔎 No result found for <strong>${escapeHTML(rawQuery)}</strong>`);
        return;
    }

    readerSearchResults.classList.add("show");
}


let searchDebounce = null;
function scheduleSearch(value) {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => searchBooks(value), 220);
}


if (readerSearchInput) {
    readerSearchInput.addEventListener("input", function () {
        scheduleSearch(this.value);
    });

    readerSearchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            this.value = "";
            closeSearch();
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            searchBooks(this.value);
        }
    });
}


if (readerSearchButton) {
    readerSearchButton.addEventListener("click", function () {
        searchBooks(readerSearchInput ? readerSearchInput.value : "");
    });
}


if (readerSearchClear) {
    readerSearchClear.addEventListener("click", function () {
        textSearchToken++;
        if (readerSearchInput) {
            readerSearchInput.value = "";
            readerSearchInput.focus();
        }
        closeSearch();
    });
}


document.addEventListener("click", function (event) {
    const container = event.target.closest(".reader-search");
    if (!container && readerSearchResults) {
        readerSearchResults.classList.remove("show");
    }
});


/* =========================================================
   READ ALOUD — PAGE BY PAGE

   Uses the browser's Speech Synthesis voices. If an Urdu voice is
   installed on the device/browser it is preferred automatically.
========================================================= */

function getSpeechVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices() || [];
}


function chooseSpeechVoice() {
    const voices = getSpeechVoices();
    if (!voices.length) return null;

    const preferred = voices.find(voice => {
        const lang = String(voice.lang || "").toLowerCase();
        const name = String(voice.name || "").toLowerCase();
        return lang === "ur-pk" || lang.startsWith("ur") || name.includes("urdu");
    });

    speechPreferredVoice = preferred || voices.find(voice => {
        const lang = String(voice.lang || "").toLowerCase();
        return lang.startsWith("ur") || lang.startsWith("hi");
    }) || voices.find(voice => {
        const lang = String(voice.lang || "").toLowerCase();
        return lang.startsWith("en");
    }) || voices[0];

    return speechPreferredVoice;
}


if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener("voiceschanged", chooseSpeechVoice);
    chooseSpeechVoice();
}


function splitSpeechText(text) {
    const cleaned = String(text || "")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleaned) return [];

    const chunks = [];
    let remaining = cleaned;

    while (remaining.length > MAX_TTS_CHUNK) {
        let cut = remaining.lastIndexOf(" ", MAX_TTS_CHUNK);
        if (cut < 100) cut = MAX_TTS_CHUNK;
        chunks.push(remaining.slice(0, cut).trim());
        remaining = remaining.slice(cut).trim();
    }

    if (remaining) chunks.push(remaining);
    return chunks;
}


function updateListenUI() {
    const active = speechMode !== "stopped";
    const speaking = speechMode === "playing";

    if (listenButton) {
        listenButton.disabled = !pdfDocument;
        listenButton.classList.toggle("speaking", speaking);
        listenButton.innerHTML = speaking
            ? '<i class="fas fa-volume-high" aria-hidden="true"></i><span class="button-label">Listening</span>'
            : '<i class="fas fa-volume-high" aria-hidden="true"></i><span class="button-label">Listen</span>';
    }

    if (pauseListenButton) {
        pauseListenButton.disabled = !active;
        pauseListenButton.innerHTML = speechMode === "paused"
            ? '<i class="fas fa-play" aria-hidden="true"></i>'
            : '<i class="fas fa-pause" aria-hidden="true"></i>';
        pauseListenButton.title = speechMode === "paused" ? "Resume reading" : "Pause reading";
    }

    if (stopListenButton) {
        stopListenButton.disabled = !active;
    }
}


function stopSpeaking(announceStop = false) {
    speechToken++;
    speechQueue = [];
    speechQueueIndex = 0;
    speechCurrentPage = 0;
    speechMode = "stopped";

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    updateListenUI();
    if (announceStop) announce("Read aloud stopped.");
}


async function speakCurrentPage({ continueAcrossPages = true } = {}) {
    if (!pdfDocument) return;

    if (!("speechSynthesis" in window)) {
        announce("Read aloud is not supported by this browser.");
        return;
    }

    const token = ++speechToken;
    const page = currentPage;
    const text = await getPageText(page);

    if (token !== speechToken) return;

    if (!text) {
        announce(`No selectable text was found on page ${page}. This page may be scanned as an image.`);
        if (continueAcrossPages && page < pageCount && speechMode === "playing") {
            goToPage(page + 1, true);
        }
        return;
    }

    const chunks = splitSpeechText(text);
    if (!chunks.length) return;

    speechQueue = chunks;
    speechQueueIndex = 0;
    speechCurrentPage = page;
    speechMode = "playing";
    updateListenUI();
    announce(`Reading page ${page} of ${pageCount}...`);

    await speakNextChunk(token, continueAcrossPages);
}


function speakNextChunk(token, continueAcrossPages) {
    return new Promise(resolve => {
        if (token !== speechToken || speechMode === "stopped") {
            resolve();
            return;
        }

        if (speechMode === "paused") {
            resolve();
            return;
        }

        if (speechQueueIndex >= speechQueue.length) {
            if (continueAcrossPages && speechCurrentPage < pageCount && token === speechToken) {
                const next = speechCurrentPage + 1;
                speechCurrentPage = next;
                goToPage(next, true);

                /* The flip animation takes time; wait for the new page render. */
                const waitStarted = Date.now();
                const waitForPage = () => {
                    if (token !== speechToken || speechMode !== "playing") {
                        resolve();
                        return;
                    }
                    if (currentPage === next || Date.now() - waitStarted > 2500) {
                        speakCurrentPage({ continueAcrossPages: true }).then(resolve);
                        return;
                    }
                    setTimeout(waitForPage, 80);
                };
                setTimeout(waitForPage, 80);
                return;
            }

            speechMode = "stopped";
            updateListenUI();
            announce("Read aloud finished.");
            resolve();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(speechQueue[speechQueueIndex]);
        speechPreferredVoice = speechPreferredVoice || chooseSpeechVoice();

        if (speechPreferredVoice) {
            utterance.voice = speechPreferredVoice;
            utterance.lang = speechPreferredVoice.lang || "ur-PK";
        } else {
            utterance.lang = "ur-PK";
        }

        utterance.rate = Number(listenSpeed?.value || 1);
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onend = () => {
            if (token !== speechToken || speechMode === "stopped") {
                resolve();
                return;
            }
            speechQueueIndex++;
            speakNextChunk(token, continueAcrossPages).then(resolve);
        };

        utterance.onerror = event => {
            if (event?.error === "canceled" || event?.error === "interrupted") {
                resolve();
                return;
            }
            console.warn("Speech synthesis error:", event?.error);
            speechMode = "stopped";
            updateListenUI();
            announce("Read aloud could not continue on this device.");
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    });
}


if (listenButton) {
    listenButton.addEventListener("click", function () {
        if (speechMode === "paused") {
            speechMode = "playing";
            updateListenUI();
            window.speechSynthesis.resume();
            return;
        }

        stopSpeaking(false);
        speechMode = "playing";
        updateListenUI();
        speakCurrentPage({ continueAcrossPages: true });
    });
}


if (pauseListenButton) {
    pauseListenButton.addEventListener("click", function () {
        if (!("speechSynthesis" in window)) return;

        if (speechMode === "playing") {
            speechMode = "paused";
            window.speechSynthesis.pause();
            updateListenUI();
            announce("Read aloud paused.");
        } else if (speechMode === "paused") {
            speechMode = "playing";
            window.speechSynthesis.resume();
            updateListenUI();
            announce("Read aloud resumed.");
        }
    });
}


if (stopListenButton) {
    stopListenButton.addEventListener("click", () => stopSpeaking(true));
}


if (listenSpeed) {
    listenSpeed.addEventListener("change", function () {
        if (speechMode === "playing" && "speechSynthesis" in window) {
            /* SpeechSynthesisUtterance.rate is not reliably changeable mid-speech,
               so restart the current page at the new speed. */
            stopSpeaking(false);
            speechMode = "playing";
            updateListenUI();
            speakCurrentPage({ continueAcrossPages: true });
        }
    });
}


/* Stop speech whenever the user manually navigates. */
function stopSpeechForManualNavigation() {
    if (speechMode !== "stopped") stopSpeaking(false);
}


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
   LOAD PDF
========================================================= */

async function loadPDF() {

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


    pageTransitionBusy =
        false;


    cancelCurrentRender();


    renderVersion++;


    try {

        setBookTitle();


        announce(
            "Loading PDF..."
        );


        console.log(
            "📖 Loading PDF:",
            PDF_URL
        );


      const loadingTask =
    pdfjsLib.getDocument({
        url: PDF_URL,

        // Load PDF in smaller chunks instead of trying
        // to fetch the whole file at once.
        disableAutoFetch: true,
        disableStream: false,

        // Smaller network chunks = faster first-page loading
        rangeChunkSize: 65536,

        // Use the PDF.js worker for rendering
        useWorkerFetch: true,

        // Keep compatibility with normal PDF files
        useSystemFonts: true,
        isEvalSupported: true
    });


pdfDocument =
    await loadingTask.promise;


pageCount =
    pdfDocument.numPages;

pageTextCache.clear();
textSearchResults = [];
textSearchToken++;


if (!pageCount) {

    throw new Error(
        "PDF contains no pages."
    );

}


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


updateUI();
updateListenUI();


await renderPage(
    currentPage
);


announce(
    `Page ${currentPage} of ${pageCount}`
);


console.log(
    `✅ PDF loaded successfully: ${pageCount} pages`
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
                "The PDF server rejected the request. Check the PDF path and hosting settings."
            );

        } else {

            showError(
                "PDF could not be loaded. Check the PDF URL, filename and GitHub Pages path."
            );

        }

    } finally {

        loadingPDF =
            false;

    }

}


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
   GLOBAL API
   Useful if another script needs these.
========================================================= */

window.chishtiReader = {

    nextPage,

    previousPage,

    goToPage,

    zoomIn,

    zoomOut,

    resetZoom,

    toggleFullscreen,

    stopSpeaking,

    loadPDF,

    get currentPage() {

        return currentPage;

    },

    get pageCount() {

        return pageCount;

    },

    get zoom() {

        return zoom;

    }

};


/* =========================================================
   START READER
========================================================= */

loadTheme();

setBookTitle();

updateUI();

loadReaderBooks();

loadPDF();


/* =========================================================
   READY LOG
========================================================= */

console.log(
    "======================================"
);

console.log(
    "📚 CHISHTI LIBRARY READER"
);

console.log(
    "======================================"
);

console.log(
    "✅ PDF.js 4.10.38"
);

console.log(
    "✅ PDF Worker"
);

console.log(
    "✅ PDF Loader"
);

console.log(
    "✅ Next / Previous"
);

console.log(
    "✅ Premium Page Flip"
);

console.log(
    "✅ Page Swap"
);

console.log(
    "✅ Mobile Swipe"
);

console.log(
    "✅ Keyboard Navigation"
);

console.log(
    "✅ Page Counter"
);

console.log(
    "✅ Page Input"
);

console.log(
    "✅ Zoom"
);

console.log(
    "✅ Themes"
);

console.log(
    "✅ Fullscreen"
);

console.log(
    "✅ Bookmark"
);

console.log(
    "✅ Share"
);

console.log(
    "✅ Watermarked Download"
);

console.log(
    "✅ Watermarked Print"
);

console.log(
    "✅ PDF Text Search + Library Search"
);

console.log(
    "✅ Read Aloud / Pause / Stop / Speed"
);

console.log(
    "======================================"
);
