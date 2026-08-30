/* =========================================================
   CHISHTI LIBRARY
   PREMIUM READER.JS
   FULL FIXED VERSION

   ✅ PDF.JS
   ✅ NEXT / PREVIOUS
   ✅ PREMIUM PAGE FLIP
   ✅ SWAP ANIMATION
   ✅ MOBILE SWIPE
   ✅ KEYBOARD NAVIGATION
   ✅ PAGE COUNTER
   ✅ ZOOM
   ✅ THEMES
   ✅ FULLSCREEN
   ✅ BOOKMARK
   ✅ SHARE
   ✅ WATERMARK DOWNLOAD
   ✅ WATERMARK PRINT
   ✅ READER SEARCH
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
   PDF URL
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


/* =========================================================
   SETTINGS
========================================================= */

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;
const DEFAULT_ZOOM = 1;


/*
 * Page flip timing.
 * 650ms = premium but fast.
 */

const FLIP_TIME = 650;


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

const themeButton =
    document.getElementById("themeButton");

const cleanDownloadButton =
    document.getElementById("cleanDownloadButton");

const bookmarkButton =
    document.getElementById("bookmarkBtn");

const shareButton =
    document.getElementById("shareBtn");


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


/*
 * IMPORTANT
 *
 * This prevents:
 * Next click
 * + animation click
 * + swipe
 * from running together.
 */

let pageTransitionBusy = false;


/* =========================================================
   MOBILE TOUCH
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


    localStorage.setItem(
        "chishtiReaderTheme",
        String(currentTheme)
    );

}


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
   BOOK TITLE
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
   BOOKMARK
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
   SHARE
========================================================= */

async function shareCurrentPage() {

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


    if (navigator.share) {

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
                `✅ Reader link copied!\n\nPage ${currentPage} direct link copied.`
            );

            return;

        }

    } catch (error) {

        console.warn(
            "Clipboard failed:",
            error
        );

    }


    try {

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

        prompt(
            "Copy this reader link:",
            shareURL.href
        );

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
   SCALE
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


        showError(
            "This PDF page could not be rendered."
        );


        return false;

    } finally {

        currentRenderTask =
            null;

    }

}


/* =========================================================
   PAGE FLIP ANIMATION
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


    /*
     * Get current page image.
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


    const rect =
        page.getBoundingClientRect();


    const stage =
        document.createElement("div");


    stage.className =
        "chishti-page-flip-stage";


    stage.style.width =
        `${rect.width}px`;


    stage.style.height =
        `${rect.height}px`;


    /*
     * New sheet.
     */

    const sheet =
        document.createElement("div");


    sheet.className =
        "chishti-page-flip-sheet";


    sheet.style.width =
        `${rect.width}px`;


    sheet.style.height =
        `${rect.height}px`;


    /*
     * Front = current page.
     */

    const front =
        document.createElement("div");


    front.className =
        "chishti-page-flip-face chishti-page-flip-front";


    /*
     * Back = blank paper.
     */

    const back =
        document.createElement("div");


    back.className =
        "chishti-page-flip-face chishti-page-flip-back";


    /*
     * Copy current canvas.
     */

    const frontCanvas =
        document.createElement("canvas");


    frontCanvas.width =
        oldCanvas.width;


    frontCanvas.height =
        oldCanvas.height;


    frontCanvas.style.width =
        `${rect.width}px`;


    frontCanvas.style.height =
        `${rect.height}px`;


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
     * Back design.
     */

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


    viewport.appendChild(
        stage
    );


    /*
     * Direction class.
     */

    if (direction === "next") {

        stage.classList.add(
            "chishti-flip-next"
        );

    } else {

        stage.classList.add(
            "chishti-flip-prev"
        );

    }


    /*
     * Force browser to start animation.
     */

    void stage.offsetWidth;


    /*
     * Start flip.
     */

    stage.classList.add(
        "chishti-flip-running"
    );


    announce(
        direction === "next"
            ? `Opening page ${targetPage}...`
            : `Returning to page ${targetPage}...`
    );


    /*
     * Render the new page during the
     * flip instead of waiting until the
     * entire animation finishes.
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


    await renderPage(
        targetPage,
        false
    );


    /*
     * Let animation finish.
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
   NEXT
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
   PREVIOUS
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
   BUTTON EVENTS
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


    if (
        pdfDocument &&
        !pageTransitionBusy
    ) {

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


    if (
        pdfDocument &&
        !pageTransitionBusy
    ) {

        renderPage(
            currentPage
        );

    }

}


function resetZoom() {

    zoom =
        DEFAULT_ZOOM;


    updateUI();


    if (
        pdfDocument &&
        !pageTransitionBusy
    ) {

        renderPage(
            currentPage
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
   ONLY ONE SWIPE SYSTEM
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


            /*
             * Ignore vertical movement.
             */

            if (
                Math.abs(deltaX) < 60 ||
                Math.abs(deltaX) <= Math.abs(deltaY)
            ) {

                return;

            }


            /*
             * Swipe left = next
             */

            if (deltaX < 0) {

                nextPage();

            }


            /*
             * Swipe right = previous
             */

            else {

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
            () => {

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
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        loadPDF
    );

}


/* =========================================================
   READER SEARCH
========================================================= */

(function initReaderSearch() {

    const searchInput =
        document.getElementById(
            "readerSearchInput"
        );

    const clearButton =
        document.getElementById(
            "readerSearchClear"
        );

    const resultsBox =
        document.getElementById(
            "readerSearchResults"
        );


    if (
        !searchInput ||
        !resultsBox
    ) {

        return;

    }


    let readerBooks = [];


    async function loadReaderBooks() {

        try {

            const response =
                await fetch(
                    "books.json",
                    {
                        cache:
                            "no-cache"
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "books.json not found"
                );

            }


            readerBooks =
                await response.json();


            if (
                !Array.isArray(
                    readerBooks
                )
            ) {

                readerBooks =
                    [];

            }


            console.log(
                "✅ Reader search books:",
                readerBooks.length
            );

        } catch (error) {

            console.error(
                "Reader search:",
                error
            );

        }

    }


    function escapeHTML(value) {

        return String(value)

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


    function searchBooks(value) {

        const query =
            String(value)
                .toLowerCase()
                .trim();


        if (!query) {

            resultsBox.innerHTML =
                "";

            resultsBox.classList.remove(
                "show"
            );

            if (clearButton) {

                clearButton.classList.remove(
                    "active"
                );

            }

            return;

        }


        if (clearButton) {

            clearButton.classList.add(
                "active"
            );

        }


        const results =
            readerBooks.filter(
                book => {

                    const title =
                        String(
                            book.title || ""
                        ).toLowerCase();


                    const author =
                        String(
                            book.author || ""
                        ).toLowerCase();


                    const category =
                        String(
                            book.category || ""
                        ).toLowerCase();


                    const language =
                        String(
                            book.language || ""
                        ).toLowerCase();


                    return (
                        title.includes(query) ||
                        author.includes(query) ||
                        category.includes(query) ||
                        language.includes(query)
                    );

                }
            );


        resultsBox.innerHTML =
            "";


        if (!results.length) {

            resultsBox.innerHTML = `

                <div class="reader-search-empty">
                    🔎 No books found
                </div>

            `;


            resultsBox.classList.add(
                "show"
            );


            return;

        }


        results
            .slice(0, 10)
            .forEach(
                book => {

                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "reader-search-result";


                    const cover =
                        escapeHTML(
                            book.cover ||
                            "logo.png"
                        );


                    const title =
                        escapeHTML(
                            book.title ||
                            "Untitled"
                        );


                    const author =
                        escapeHTML(
                            book.author ||
                            "Unknown Author"
                        );


                    const category =
                        escapeHTML(
                            book.category ||
                            "Other"
                        );


                    item.innerHTML = `

                        <img
                            src="${cover}"
                            alt="${title}"
                            onerror="this.src='logo.png'"
                        >

                        <div class="reader-search-result-info">

                            <h4>
                                ${title}
                            </h4>

                            <p>
                                ${author}
                                •
                                ${category}
                            </p>

                        </div>

                    `;


                    item.addEventListener(
                        "click",
                        function () {

                            if (!book.pdf) {

                                return;

                            }


                            window.location.href =
                                "reader.html?book=" +
                                encodeURIComponent(
                                    book.pdf
                                );

                        }
                    );


                    resultsBox.appendChild(
                        item
                    );

                }
            );


        resultsBox.classList.add(
            "show"
        );

    }


    searchInput.addEventListener(
        "input",
        function () {

            searchBooks(
                this.value
            );

        }
    );


    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                this.value =
                    "";

                searchBooks(
                    ""
                );

            }

        }
    );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            function () {

                searchInput.value =
                    "";

                searchBooks(
                    ""
                );

                searchInput.focus();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                !event.target.closest(
                    ".reader-search"
                )
            ) {

                resultsBox.classList.remove(
                    "show"
                );

            }

        }
    );


    loadReaderBooks();

})();
/* =========================================================
   CHISHTI READER
   READER SEARCH SYSTEM
   PASTE AT THE VERY END OF reader.js
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const searchInput =
        document.getElementById("readerSearchInput");

    const searchClear =
        document.getElementById("readerSearchClear");

    const searchResults =
        document.getElementById("readerSearchResults");


    if (!searchInput || !searchResults) {
        console.warn(
            "Chishti Reader Search: Search elements not found."
        );
        return;
    }


    /* =====================================================
       FIND BOOK DATABASE
    ===================================================== */

    function getBooks() {

        /*
         * Tries common book-data names used by Chishti Library.
         */

        if (Array.isArray(window.books)) {
            return window.books;
        }

        if (Array.isArray(window.bookData)) {
            return window.bookData;
        }

        if (Array.isArray(window.libraryBooks)) {
            return window.libraryBooks;
        }

        if (Array.isArray(window.allBooks)) {
            return window.allBooks;
        }


        /* Try localStorage */

        const storageKeys = [
            "books",
            "bookData",
            "libraryBooks",
            "allBooks"
        ];


        for (const key of storageKeys) {

            try {

                const data =
                    JSON.parse(
                        localStorage.getItem(key)
                    );

                if (Array.isArray(data)) {
                    return data;
                }

            } catch (error) {
                // Ignore invalid localStorage data
            }

        }


        return [];
    }


    /* =====================================================
       SAFE TEXT
    ===================================================== */

    function safeText(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value);
    }


    /* =====================================================
       GET BOOK INFORMATION
    ===================================================== */

    function getBookTitle(book) {

        return safeText(
            book.title ||
            book.name ||
            book.bookTitle ||
            book.bookName
        );
    }


    function getBookAuthor(book) {

        return safeText(
            book.author ||
            book.authorName ||
            book.writer ||
            book.writerName
        );
    }


    function getBookCategory(book) {

        return safeText(
            book.category ||
            book.categoryName ||
            book.subject ||
            book.genre
        );
    }


    function getBookImage(book) {

        return (
            book.image ||
            book.cover ||
            book.coverImage ||
            book.thumbnail ||
            book.imageUrl ||
            ""
        );
    }


    /* =====================================================
       SEARCH BOOKS
    ===================================================== */

    function searchBooks(query) {

        const books = getBooks();

        const cleanQuery =
            safeText(query)
                .trim()
                .toLowerCase();


        searchResults.innerHTML = "";


        /* Empty search */

        if (!cleanQuery) {

            searchResults.classList.remove(
                "show"
            );

            return;
        }


        /* No database */

        if (!books.length) {

            searchResults.innerHTML = `
                <div class="reader-search-empty">
                    No books available for search.
                </div>
            `;

            searchResults.classList.add("show");

            return;
        }


        /* Filter */

        const matches = books.filter(book => {

            const title =
                getBookTitle(book).toLowerCase();

            const author =
                getBookAuthor(book).toLowerCase();

            const category =
                getBookCategory(book).toLowerCase();


            return (
                title.includes(cleanQuery) ||
                author.includes(cleanQuery) ||
                category.includes(cleanQuery)
            );

        });


        /* No results */

        if (!matches.length) {

            searchResults.innerHTML = `
                <div class="reader-search-empty">
                    No books found for
                    "<strong>${escapeHTML(query)}</strong>"
                </div>
            `;

            searchResults.classList.add("show");

            return;
        }


        /* Limit results */

        const limitedResults =
            matches.slice(0, 12);


        limitedResults.forEach((book, index) => {

            const title =
                getBookTitle(book) ||
                "Untitled Book";

            const author =
                getBookAuthor(book);

            const category =
                getBookCategory(book);

            const image =
                getBookImage(book);


            const result =
                document.createElement("div");


            result.className =
                "reader-search-result";


            result.setAttribute(
                "role",
                "option"
            );


            result.dataset.index =
                String(index);


            result.innerHTML = `

                <div class="reader-search-result-image">

                    ${
                        image
                            ? `
                                <img
                                    src="${escapeAttribute(image)}"
                                    alt=""
                                    loading="lazy"
                                >
                              `
                            : `
                                <span>
                                    📖
                                </span>
                              `
                    }

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

                    openSearchBook(book);

                }
            );


            searchResults.appendChild(result);

        });


        searchResults.classList.add("show");

    }


    /* =====================================================
       OPEN SELECTED BOOK
    ===================================================== */

    function openSearchBook(book) {

        /*
         * Try common PDF/file properties.
         */

        const pdfUrl =
            book.pdf ||
            book.pdfUrl ||
            book.file ||
            book.fileUrl ||
            book.url ||
            book.path ||
            book.downloadUrl;


        if (!pdfUrl) {

            console.warn(
                "Chishti Reader Search: PDF URL not found.",
                book
            );

            return;
        }


        /*
         * If your existing reader has a global
         * book-opening function, use it.
         */

        if (
            typeof window.openBook === "function"
        ) {

            window.openBook(book);

            closeSearch();

            return;
        }


        if (
            typeof window.loadBook === "function"
        ) {

            window.loadBook(book);

            closeSearch();

            return;
        }


        if (
            typeof window.loadPDF === "function"
        ) {

            window.loadPDF(pdfUrl);

            closeSearch();

            return;
        }


        /*
         * Fallback:
         * Open the PDF in the current reader.
         */

        try {

            const url =
                new URL(
                    pdfUrl,
                    window.location.href
                ).href;


            window.location.href = url;

        } catch (error) {

            console.error(
                "Unable to open selected book.",
                error
            );

        }

    }


    /* =====================================================
       CLEAR SEARCH
    ===================================================== */

    function closeSearch() {

        searchResults.innerHTML = "";

        searchResults.classList.remove(
            "show"
        );

    }


    function clearSearch() {

        searchInput.value = "";

        closeSearch();

        searchInput.focus();

    }


    /* =====================================================
       HTML SAFETY
    ===================================================== */

    function escapeHTML(value) {

        return safeText(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHTML(value);

    }


    /* =====================================================
       LIVE SEARCH
    ===================================================== */

    searchInput.addEventListener(
        "input",
        function () {

            searchBooks(
                this.value
            );

        }
    );


    /* =====================================================
       CLEAR BUTTON
    ===================================================== */

    if (searchClear) {

        searchClear.addEventListener(
            "click",
            clearSearch
        );

    }


    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                clearSearch();

            }

        }
    );


    /* =====================================================
       ENTER KEY
    ===================================================== */

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                const firstResult =
                    searchResults.querySelector(
                        ".reader-search-result"
                    );


                if (firstResult) {

                    firstResult.click();

                }

            }

        }
    );


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const searchContainer =
                document.querySelector(
                    ".reader-search"
                );


            if (
                searchContainer &&
                !searchContainer.contains(
                    event.target
                )
            ) {

                searchResults.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       INITIAL STATE
    ===================================================== */

    searchResults.classList.remove(
        "show"
    );


    console.log(
        "✓ Chishti Reader Search System Loaded"
    );


})();

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
            "📖 Loading PDF:",
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


        pageTransitionBusy =
            false;


        updateUI();


        await renderPage(
            currentPage
        );


        console.log(
            `✅ PDF loaded: ${pageCount} pages`
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
   START
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
    "✅ PDF.js Ready"
);

console.log(
    "✅ Next / Previous Fixed"
);

console.log(
    "✅ Premium Page Flip Fixed"
);

console.log(
    "✅ Page Swap Animation Fixed"
);

console.log(
    "✅ Mobile Swipe Fixed"
);

console.log(
    "✅ Keyboard Navigation Ready"
);

console.log(
    "✅ Zoom Ready"
);

console.log(
    "✅ Bookmark Ready"
);

console.log(
    "✅ Share Ready"
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
