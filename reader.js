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
   READER SEARCH
   ONLY ONE SEARCH SYSTEM
========================================================= */

let readerBooks = [];

let searchLoaded = false;


/* =========================================================
   SEARCH ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   SEARCH BOOK FIELD HELPERS
========================================================= */

function getBookTitleFromData(book) {

    return String(
        book?.title ||
        book?.name ||
        book?.bookTitle ||
        book?.bookName ||
        ""
    );

}


function getBookAuthorFromData(book) {

    return String(
        book?.author ||
        book?.authorName ||
        book?.writer ||
        book?.writerName ||
        ""
    );

}


function getBookCategoryFromData(book) {

    return String(
        book?.category ||
        book?.categoryName ||
        book?.subject ||
        book?.genre ||
        ""
    );

}


function getBookLanguageFromData(book) {

    return String(
        book?.language ||
        book?.lang ||
        ""
    );

}


function getBookImageFromData(book) {

    return String(
        book?.image ||
        book?.cover ||
        book?.coverImage ||
        book?.thumbnail ||
        book?.imageUrl ||
        ""
    );

}


function getBookPDFFromData(book) {

    return (
        book?.pdf ||
        book?.pdfUrl ||
        book?.file ||
        book?.fileUrl ||
        book?.url ||
        book?.path ||
        book?.downloadUrl ||
        ""
    );

}


/* =========================================================
   LOAD BOOKS.JSON
========================================================= */

async function loadReaderBooks() {

    if (searchLoaded) {
        return;
    }


    searchLoaded =
        true;


    try {

        const response =
            await fetch(
                "books.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                `books.json HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (Array.isArray(data)) {

            readerBooks =
                data;

        } else if (
            Array.isArray(data.books)
        ) {

            readerBooks =
                data.books;

        } else {

            readerBooks =
                [];

        }


        console.log(
            `✅ Reader search loaded ${readerBooks.length} books.`
        );

    } catch (error) {

        console.warn(
            "Reader search books.json error:",
            error
        );


        /*
         * Fallback to common global arrays.
         */

        if (Array.isArray(window.books)) {

            readerBooks =
                window.books;

        } else if (
            Array.isArray(window.bookData)
        ) {

            readerBooks =
                window.bookData;

        } else if (
            Array.isArray(window.libraryBooks)
        ) {

            readerBooks =
                window.libraryBooks;

        } else if (
            Array.isArray(window.allBooks)
        ) {

            readerBooks =
                window.allBooks;

        } else {

            readerBooks =
                [];

        }

    }

}


/* =========================================================
   CLOSE SEARCH
========================================================= */

function closeSearch() {

    if (!readerSearchResults) {
        return;
    }


    readerSearchResults.innerHTML =
        "";


    readerSearchResults.classList.remove(
        "show"
    );


    if (readerSearchClear) {

        readerSearchClear.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   OPEN SEARCH BOOK
========================================================= */

function openSearchBook(book) {

    const pdfUrl =
        getBookPDFFromData(book);


    if (!pdfUrl) {

        console.warn(
            "Reader Search: PDF URL not found.",
            book
        );


        return;

    }


    /*
     * Keep the reader page instead of
     * opening the raw PDF.
     */

    try {

        const readerURL =
            new URL(
                "reader.html",
                window.location.href
            );


        readerURL.searchParams.set(
            "book",
            pdfUrl
        );


        window.location.href =
            readerURL.href;

    } catch (error) {

        console.error(
            "Unable to open book:",
            error
        );

    }

}


/* =========================================================
   SEARCH BOOKS
========================================================= */

async function searchBooks(query) {

    if (!readerSearchResults) {
        return;
    }


    const cleanQuery =
        String(query ?? "")
            .trim()
            .toLowerCase();


    if (!cleanQuery) {

        closeSearch();

        return;

    }


    if (readerSearchClear) {

        readerSearchClear.classList.add(
            "active"
        );

    }


    await loadReaderBooks();


    readerSearchResults.innerHTML =
        "";


    if (!readerBooks.length) {

        readerSearchResults.innerHTML = `

            <div class="reader-search-empty">
                🔎 No books available for search.
            </div>

        `;


        readerSearchResults.classList.add(
            "show"
        );


        return;

    }


    const matches =
        readerBooks.filter(
            book => {

                const title =
                    getBookTitleFromData(
                        book
                    ).toLowerCase();


                const author =
                    getBookAuthorFromData(
                        book
                    ).toLowerCase();


                const category =
                    getBookCategoryFromData(
                        book
                    ).toLowerCase();


                const language =
                    getBookLanguageFromData(
                        book
                    ).toLowerCase();


                return (
                    title.includes(cleanQuery) ||
                    author.includes(cleanQuery) ||
                    category.includes(cleanQuery) ||
                    language.includes(cleanQuery)
                );

            }
        );


    if (!matches.length) {

        readerSearchResults.innerHTML = `

            <div class="reader-search-empty">
                🔎 No books found for
                "<strong>${escapeHTML(query)}</strong>"
            </div>

        `;


        readerSearchResults.classList.add(
            "show"
        );


        return;

    }


    matches
        .slice(0, 12)
        .forEach(
            (book, index) => {

                const title =
                    getBookTitleFromData(
                        book
                    ) ||
                    "Untitled Book";


                const author =
                    getBookAuthorFromData(
                        book
                    );


                const category =
                    getBookCategoryFromData(
                        book
                    );


                const image =
                    getBookImageFromData(
                        book
                    );


                const result =
                    document.createElement(
                        "div"
                    );


                result.className =
                    "reader-search-result";


                result.setAttribute(
                    "role",
                    "option"
                );


                result.dataset.index =
                    String(index);


                const imageHTML =
                    image
                        ? `
                            <img
                                src="${escapeHTML(image)}"
                                alt=""
                                loading="lazy"
                                onerror="this.style.display='none'"
                            >
                          `
                        : `
                            <span>📖</span>
                          `;


                result.innerHTML = `

                    <div class="reader-search-result-image">

                        ${imageHTML}

                    </div>


                    <div class="reader-search-result-info">

                        <div class="reader-search-result-title">
                            ${escapeHTML(title)}
                        </div>


                        ${
                            author
                                ? `
                                    <div class="reader-search-result-author">
                                        ${escapeHTML(author)}
                                    </div>
                                  `
                                : ""
                        }


                        ${
                            category
                                ? `
                                    <div class="reader-search-result-category">
                                        ${escapeHTML(category)}
                                    </div>
                                  `
                                : ""
                        }

                    </div>

                `;


                result.addEventListener(
                    "click",
                    function () {

                        openSearchBook(
                            book
                        );

                    }
                );


                readerSearchResults.appendChild(
                    result
                );

            }
        );


    readerSearchResults.classList.add(
        "show"
    );

}


/* =========================================================
   SEARCH INPUT
========================================================= */

if (readerSearchInput) {

    readerSearchInput.addEventListener(
        "input",
        function () {

            searchBooks(
                this.value
            );

        }
    );


    readerSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                this.value =
                    "";


                closeSearch();

                return;

            }


            if (
                event.key ===
                "Enter"
            ) {

                const firstResult =
                    readerSearchResults
                        ? readerSearchResults.querySelector(
                            ".reader-search-result"
                        )
                        : null;


                if (firstResult) {

                    firstResult.click();

                }

            }

        }
    );

}


/* =========================================================
   SEARCH CLEAR
========================================================= */

if (readerSearchClear) {

    readerSearchClear.addEventListener(
        "click",
        function () {

            if (readerSearchInput) {

                readerSearchInput.value =
                    "";

                readerSearchInput.focus();

            }


            closeSearch();

        }
    );

}


/* =========================================================
   SEARCH OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const container =
            event.target.closest(
                ".reader-search"
            );


        if (!container) {

            if (readerSearchResults) {

                readerSearchResults.classList.remove(
                    "show"
                );

            }

        }

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

                url:
                    PDF_URL,

                /*
                 * Helps prevent unnecessary
                 * network/cache conflicts.
                 */

                disableAutoFetch:
                    false,

                disableStream:
                    false

            });


        pdfDocument =
            await loadingTask.promise;


        pageCount =
            pdfDocument.numPages;


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
    "✅ Single Reader Search System"
);

console.log(
    "======================================"
);
