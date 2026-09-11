/* =========================================================
   CHISHTI LIBRARY
   READER.JS
   PDF.JS 4.10.38
   FAST PDF + SEARCH + READ ALOUD
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

        const decoded =
            decodeURIComponent(rawBook)
                .replace(/^\/+/, "")
                .trim();

        return new URL(
            decoded,
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

const FLIP_TIME = 450;

const RANGE_CHUNK_SIZE =
    1024 * 1024;

const MAX_CANVAS_PIXELS =
    4500000;

const DESKTOP_DPR =
    1.75;

const MOBILE_DPR =
    1.35;

const PAGE_CACHE_LIMIT =
    3;


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
   SEARCH
========================================================= */

const readerSearchInput =
    document.getElementById(
        "readerSearchInput"
    );

const readerSearchClear =
    document.getElementById(
        "readerSearchClear"
    );

const readerSearchResults =
    document.getElementById(
        "readerSearchResults"
    );

const readerSearchButton =
    document.getElementById(
        "readerSearchButton"
    );


/* =========================================================
   READ ALOUD
========================================================= */

const listenButton =
    document.getElementById(
        "listenButton"
    );

const pauseListenButton =
    document.getElementById(
        "pauseListenButton"
    );

const stopListenButton =
    document.getElementById(
        "stopListenButton"
    );

const listenSpeed =
    document.getElementById(
        "listenSpeed"
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

let zoom = DEFAULT_ZOOM;

let currentRenderTask = null;

let renderVersion = 0;

let loadingPDF = false;

let pageTransitionBusy = false;

let activeLoadingTask = null;


/* =========================================================
   PAGE CACHE
========================================================= */

const pageCache =
    new Map();


/* =========================================================
   TEXT SEARCH CACHE
========================================================= */

const pageTextCache =
    new Map();

let searchToken = 0;

let currentSearchResults = [];

let currentSearchIndex = -1;


/* =========================================================
   SPEECH STATE
========================================================= */

let speechMode =
    "stopped";

let speechToken = 0;

let speechChunks = [];

let speechChunkIndex = 0;

let speechPage = 0;

let preferredVoice = null;

const MAX_TTS_CHUNK =
    240;


/* =========================================================
   TOUCH
========================================================= */

let touchStartX = 0;
let touchStartY = 0;


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

    } catch {

        return "Chishti Library";

    }

}


function setBookTitle() {

    if (bookTitle) {

        bookTitle.textContent =
            getBookName();

    }

}


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
            .replace(
                /\s+/g,
                "-"
            );

    if (themeButton) {

        themeButton.title =
            `Theme: ${theme.name}`;

    }

    try {

        localStorage.setItem(
            "chishtiReaderTheme",
            String(currentTheme)
        );

    } catch {}

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

    } catch {}

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
        () => {

            applyTheme(
                currentTheme + 1
            );

            announce(
                `Theme: ${themes[currentTheme].name}`
            );

        }
    );

}


/* =========================================================
   BOOKMARK
========================================================= */

const bookmarkKey =
    "chishti_bookmark_" +
    encodeURIComponent(
        rawBook ||
        "current-book"
    );


function getBookmark() {

    try {

        return Number(
            localStorage.getItem(
                bookmarkKey
            )
        ) || 0;

    } catch {

        return 0;

    }

}


function updateBookmark() {

    if (!bookmarkButton) {
        return;
    }

    const saved =
        getBookmark();

    const active =
        saved > 0 &&
        saved === currentPage;

    bookmarkButton.classList.toggle(
        "active",
        active
    );

    bookmarkButton.innerHTML =
        active
            ? '<i class="fas fa-bookmark"></i>'
            : '<i class="far fa-bookmark"></i>';

}


if (bookmarkButton) {

    bookmarkButton.addEventListener(
        "click",
        () => {

            try {

                if (
                    getBookmark() ===
                    currentPage
                ) {

                    localStorage.removeItem(
                        bookmarkKey
                    );

                    announce(
                        "Bookmark removed."
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
                    "Bookmark:",
                    error
                );

            }

            updateBookmark();

        }
    );

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

    updateBookmark();

    updateSpeechUI();

}


/* =========================================================
   PAGE CACHE
========================================================= */

async function getPage(pageNumber) {

    if (!pdfDocument) {

        return null;

    }

    if (
        pageCache.has(
            pageNumber
        )
    ) {

        return pageCache.get(
            pageNumber
        );

    }

    const page =
        await pdfDocument.getPage(
            pageNumber
        );

    pageCache.set(
        pageNumber,
        page
    );

    trimPageCache();

    return page;

}


function trimPageCache() {

    while (
        pageCache.size >
        PAGE_CACHE_LIMIT
    ) {

        let farthest = null;

        let distance =
            -1;

        for (
            const number of
            pageCache.keys()
        ) {

            const d =
                Math.abs(
                    number -
                    currentPage
                );

            if (d > distance) {

                distance = d;

                farthest = number;

            }

        }

        if (
            farthest === null
        ) {
            break;
        }

        const page =
            pageCache.get(
                farthest
            );

        pageCache.delete(
            farthest
        );

        try {

            page?.cleanup?.();

        } catch {}

    }

}


/* =========================================================
   CANCEL RENDER
========================================================= */

function cancelRender() {

    if (!currentRenderTask) {
        return;
    }

    try {

        currentRenderTask.cancel();

    } catch {}

    currentRenderTask = null;

}


/* =========================================================
   SCALE
========================================================= */

function calculateScale(page) {

    if (!bookViewport) {

        return zoom;

    }

    const base =
        page.getViewport({
            scale: 1
        });

    const width =
        Math.max(
            200,
            bookViewport.clientWidth -
            40
        );

    const height =
        Math.max(
            200,
            bookViewport.clientHeight -
            40
        );

    const widthScale =
        width /
        base.width;

    const heightScale =
        height /
        base.height;

    const fit =
        Math.min(
            widthScale,
            heightScale
        );

    return Math.max(
        0.25,
        fit * zoom
    );

}


/* =========================================================
   PIXEL RATIO
========================================================= */

function getPixelRatio(
    viewport
) {

    const mobile =
        window.matchMedia?.(
            "(max-width: 768px)"
        )?.matches;

    const max =
        mobile
            ? MOBILE_DPR
            : DESKTOP_DPR;

    const device =
        window.devicePixelRatio ||
        1;

    let ratio =
        Math.min(
            device,
            max
        );

    const pixels =
        Math.max(
            1,
            viewport.width *
            viewport.height
        );

    const limit =
        Math.sqrt(
            MAX_CANVAS_PIXELS /
            pixels
        );

    ratio =
        Math.min(
            ratio,
            limit
        );

    return Math.max(
        1,
        Number(
            ratio.toFixed(2)
        )
    );

}


/* =========================================================
   RENDER PAGE
========================================================= */

async function renderPage(
    requestedPage,
    announcePage = true
) {

    if (
        !pdfDocument ||
        !pdfCanvas ||
        !context
    ) {

        return false;

    }

    const version =
        ++renderVersion;

    const pageNumber =
        Math.max(
            1,
            Math.min(
                pageCount,
                parseInt(
                    requestedPage,
                    10
                ) || 1
            )
        );

    cancelRender();

    try {

        const page =
            await getPage(
                pageNumber
            );

        if (
            version !== renderVersion ||
            !pdfDocument
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

        const ratio =
            getPixelRatio(
                viewport
            );

        const canvasWidth =
            Math.max(
                1,
                Math.floor(
                    viewport.width *
                    ratio
                )
            );

        const canvasHeight =
            Math.max(
                1,
                Math.floor(
                    viewport.height *
                    ratio
                )
            );

        pdfCanvas.width =
            canvasWidth;

        pdfCanvas.height =
            canvasHeight;

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
            ratio,
            0,
            0,
            ratio,
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

        const renderTask =
            page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            });

        currentRenderTask =
            renderTask;

        await renderTask.promise;

        if (
            version !== renderVersion ||
            !pdfDocument
        ) {

            return false;

        }

        if (
            currentRenderTask ===
            renderTask
        ) {

            currentRenderTask =
                null;

        }

        currentPage =
            pageNumber;

        trimPageCache();

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
            "RenderingCancelledException" ||
            error?.name ===
            "AbortException"
        ) {

            return false;

        }

        console.error(
            "Page render error:",
            error
        );

        if (
            version ===
            renderVersion
        ) {

            showError(
                "This PDF page could not be rendered."
            );

        }

        return false;

    }

}


/* =========================================================
   PAGE FLIP
========================================================= */

async function flipTo(
    targetPage,
    direction
) {

    if (
        !pdfDocument ||
        pageTransitionBusy
    ) {

        return;

    }

    if (
        targetPage < 1 ||
        targetPage > pageCount ||
        targetPage === currentPage
    ) {

        return;

    }

    pageTransitionBusy =
        true;

    updateUI();

    const oldCanvas =
        document.createElement(
            "canvas"
        );

    oldCanvas.width =
        pdfCanvas.width;

    oldCanvas.height =
        pdfCanvas.height;

    const oldContext =
        oldCanvas.getContext(
            "2d"
        );

    if (oldContext) {

        oldContext.drawImage(
            pdfCanvas,
            0,
            0
        );

    }

    const width =
        pageWrapper
            ?.getBoundingClientRect()
            .width ||
        pdfCanvas.clientWidth ||
        300;

    const height =
        pageWrapper
            ?.getBoundingClientRect()
            .height ||
        pdfCanvas.clientHeight ||
        400;

    const stage =
        document.createElement(
            "div"
        );

    stage.className =
        "chishti-page-flip-stage";

    stage.style.width =
        `${width}px`;

    stage.style.height =
        `${height}px`;

    const sheet =
        document.createElement(
            "div"
        );

    sheet.className =
        "chishti-page-flip-sheet";

    const front =
        document.createElement(
            "div"
        );

    front.className =
        "chishti-page-flip-face chishti-page-flip-front";

    const frontCanvas =
        document.createElement(
            "canvas"
        );

    frontCanvas.width =
        oldCanvas.width;

    frontCanvas.height =
        oldCanvas.height;

    frontCanvas.style.width =
        `${width}px`;

    frontCanvas.style.height =
        `${height}px`;

    const frontContext =
        frontCanvas.getContext(
            "2d"
        );

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

    const back =
        document.createElement(
            "div"
        );

    back.className =
        "chishti-page-flip-face chishti-page-flip-back";

    back.innerHTML =
        `<div class="chishti-flip-paper"></div>`;

    sheet.appendChild(front);

    sheet.appendChild(back);

    stage.appendChild(sheet);

    stage.classList.add(
        direction === "next"
            ? "chishti-flip-next"
            : "chishti-flip-prev"
    );

    if (bookViewport) {

        bookViewport.appendChild(
            stage
        );

    }

    void stage.offsetWidth;

    stage.classList.add(
        "chishti-flip-running"
    );

    const renderPromise =
        renderPage(
            targetPage,
            false
        );

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                120
            )
    );

    await renderPromise;

    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                Math.max(
                    0,
                    FLIP_TIME - 120
                )
            )
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
   NAVIGATION
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

    if (
        !Number.isFinite(target)
    ) {

        target =
            currentPage;

    }

    target =
        Math.max(
            1,
            Math.min(
                pageCount,
                target
            )
        );

    if (
        target ===
        currentPage
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

    flipTo(
        target,
        target >
        currentPage
            ? "next"
            : "prev"
    );

}


function nextPage() {

    stopSpeechForManualNavigation();

    if (
        currentPage <
        pageCount
    ) {

        goToPage(
            currentPage + 1,
            true
        );

    }

}


function previousPage() {

    stopSpeechForManualNavigation();

    if (
        currentPage >
        1
    ) {

        goToPage(
            currentPage - 1,
            true
        );

    }

}


if (nextPageButton) {

    nextPageButton.addEventListener(
        "click",
        nextPage
    );

}


if (previousPageButton) {

    previousPageButton.addEventListener(
        "click",
        previousPage
    );

}


/* =========================================================
   ZOOM
========================================================= */

function setZoom(value) {

    if (pageTransitionBusy) {
        return;
    }

    zoom =
        Math.max(
            MIN_ZOOM,
            Math.min(
                MAX_ZOOM,
                Number(value)
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


function zoomIn() {

    setZoom(
        Number(
            (
                zoom +
                ZOOM_STEP
            ).toFixed(2)
        )
    );

}


function zoomOut() {

    setZoom(
        Number(
            (
                zoom -
                ZOOM_STEP
            ).toFixed(2)
        )
    );

}


function resetZoom() {

    setZoom(
        DEFAULT_ZOOM
    );

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
        () => {

            goToPage(
                pageNumberInput.value,
                true
            );

        }
    );

    pageNumberInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                goToPage(
                    pageNumberInput.value,
                    true
                );

                pageNumberInput.blur();

            }

        }
    );

}


/* =========================================================
   CTRL + F / KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

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


        /* Ctrl + F */

        if (
            (
                event.ctrlKey ||
                event.metaKey
            ) &&
            event.key.toLowerCase() ===
                "f"
        ) {

            event.preventDefault();

            if (readerSearchInput) {

                readerSearchInput.focus();

                readerSearchInput.select();

            }

            return;

        }


        /* F3 */

        if (
            event.key === "F3"
        ) {

            event.preventDefault();

            focusNextSearchResult(
                event.shiftKey
            );

            return;

        }


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

                goToPage(
                    1,
                    true
                );

                break;


            case "End":

                event.preventDefault();

                goToPage(
                    pageCount,
                    true
                );

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
        event => {

            if (
                !event.touches?.length
            ) {

                return;

            }

            touchStartX =
                event.touches[0]
                    .clientX;

            touchStartY =
                event.touches[0]
                    .clientY;

        },
        {
            passive: true
        }
    );


    bookViewport.addEventListener(
        "touchend",
        event => {

            if (
                pageTransitionBusy ||
                !event.changedTouches?.length
            ) {

                return;

            }

            const touch =
                event.changedTouches[0];

            const dx =
                touch.clientX -
                touchStartX;

            const dy =
                touch.clientY -
                touchStartY;

            if (
                Math.abs(dx) < 60 ||
                Math.abs(dx) <=
                    Math.abs(dy)
            ) {

                return;

            }

            if (dx < 0) {

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
    () => {

        clearTimeout(
            resizeTimer
        );

        resizeTimer =
            setTimeout(
                () => {

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
                180
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

        if (
            !document.fullscreenElement
        ) {

            await reader.requestFullscreen();

        } else {

            await document.exitFullscreen();

        }

    } catch (error) {

        console.warn(
            "Fullscreen:",
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
    () => {

        setTimeout(
            () => {

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
            150
        );

    }
);


/* =========================================================
   SHARE
========================================================= */

async function shareCurrentPage() {

    try {

        const url =
            new URL(
                window.location.href
            );

        url.searchParams.set(
            "page",
            String(currentPage)
        );

        const shareData = {

            title:
                `${getBookName()} — Chishti Library`,

            text:
                `Read ${getBookName()} — Page ${currentPage}`,

            url:
                url.href

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


        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            await navigator.clipboard.writeText(
                url.href
            );

            announce(
                "Reader link copied."
            );

            return;

        }


        prompt(
            "Copy reader link:",
            url.href
        );

    } catch (error) {

        console.error(
            "Share:",
            error
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
   WATERMARK
========================================================= */

const WATERMARK_TEXT =
    "ChishtiLibrary.com";

const WATERMARK_SUBTEXT =
    "CHISHTI LIBRARY";


function getDownloadFileName() {

    let filename =
        rawBook
            .split("?")[0]
            .split("/")
            .pop() ||
        "book.pdf";

    try {

        filename =
            decodeURIComponent(
                filename
            );

    } catch {}

    filename =
        filename.replace(
            /\.pdf$/i,
            ""
        );

    return (
        `${filename}-ChishtiLibrary-Watermarked.pdf`
    );

}


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
                cache:
                    "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            `PDF fetch failed: ${response.status}`
        );

    }

    const bytes =
        await response.arrayBuffer();

    const doc =
        await PDFLib.PDFDocument.load(
            bytes
        );

    const font =
        await doc.embedFont(
            PDFLib.StandardFonts
                .HelveticaBold
        );

    for (
        const page of
        doc.getPages()
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

                size,

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


        const subSize =
            Math.max(
                14,
                size * 0.42
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
                        size
                    ) / 2 -
                    size * 0.85,

                size:
                    subSize,

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

    return doc.save();

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

        const bytes =
            await createWatermarkedPDF();

        const blob =
            new Blob(
                [bytes],
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
            document.createElement(
                "a"
            );

        link.href = url;

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
            "Watermarked PDF downloaded."
        );

    } catch (error) {

        console.error(
            "Download:",
            error
        );

        alert(
            "Watermarked PDF could not be created."
        );

    } finally {

        if (downloadButton) {

            downloadButton.disabled =
                false;

        }

    }

}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadWatermarkedPDF
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

    try {

        announce(
            "Preparing watermarked document..."
        );

        const bytes =
            await createWatermarkedPDF();

        const blob =
            new Blob(
                [bytes],
                {
                    type:
                        "application/pdf"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const win =
            window.open(
                url,
                "_blank"
            );

        if (!win) {

            URL.revokeObjectURL(
                url
            );

            alert(
                "Please allow popups to print."
            );

            return;

        }

        win.addEventListener(
            "load",
            () => {

                setTimeout(
                    () => {

                        try {

                            win.print();

                        } catch {}

                    },
                    800
                );

            }
        );

    } catch (error) {

        console.error(
            "Print:",
            error
        );

        alert(
            "Watermarked print failed."
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
   PDF TEXT EXTRACTION
========================================================= */

async function getPageText(
    pageNumber
) {

    if (!pdfDocument) {
        return "";
    }

    if (
        pageTextCache.has(
            pageNumber
        )
    ) {

        return pageTextCache.get(
            pageNumber
        );

    }

    try {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );

        const content =
            await page.getTextContent({

                normalizeWhitespace:
                    true,

                disableCombineTextItems:
                    false

            });

        const text =
            content.items
                .map(
                    item =>
                        item?.str || ""
                )
                .join(" ")
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();

        pageTextCache.set(
            pageNumber,
            text
        );

        return text;

    } catch (error) {

        console.warn(
            `Text extraction failed on page ${pageNumber}:`,
            error
        );

        pageTextCache.set(
            pageNumber,
            ""
        );

        return "";

    }

}


/* =========================================================
   SEARCH NORMALIZATION
========================================================= */

function normalizeSearchText(
    value
) {

    return String(
        value || ""
    )
        .normalize(
            "NFKC"
        )

        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        .replace(
            /ـ/g,
            ""
        )

        .replace(
            /[\u200B-\u200D\uFEFF]/g,
            ""
        )

        .replace(
            /[إأٱآ]/g,
            "ا"
        )

        .replace(
            /ى/g,
            "ی"
        )

        .replace(
            /ئ/g,
            "ی"
        )

        .replace(
            /ؤ/g,
            "و"
        )

        .replace(
            /ة/g,
            "ه"
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim()
        .toLocaleLowerCase();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

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
   SEARCH SNIPPET
========================================================= */

function createSnippet(
    text,
    query
) {

    const source =
        String(
            text || ""
        );

    const normalizedSource =
        normalizeSearchText(
            source
        );

    const normalizedQuery =
        normalizeSearchText(
            query
        );

    const index =
        normalizedSource.indexOf(
            normalizedQuery
        );

    if (
        index < 0
    ) {

        return source.slice(
            0,
            180
        );

    }

    const start =
        Math.max(
            0,
            index - 60
        );

    return (
        source.slice(
            start,
            start + 190
        ) +
        (
            source.length >
            start + 190
                ? "…"
                : ""
        )
    );

}


/* =========================================================
   SHOW SEARCH RESULTS
========================================================= */

function closeSearch() {

    if (
        readerSearchResults
    ) {

        readerSearchResults.innerHTML =
            "";

        readerSearchResults.classList.remove(
            "show"
        );

    }

}


function showSearchMessage(
    message
) {

    if (
        !readerSearchResults
    ) {
        return;
    }

    readerSearchResults.innerHTML =
        `<div class="reader-search-empty">
            ${message}
        </div>`;

    readerSearchResults.classList.add(
        "show"
    );

}


function showSearchResults(
    results,
    query
) {

    if (
        !readerSearchResults
    ) {
        return;
    }

    currentSearchResults =
        results;

    currentSearchIndex =
        results.findIndex(
            item =>
                item.page ===
                currentPage
        );

    readerSearchResults.innerHTML =
        "";

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "reader-search-count";

    header.textContent =
        `${results.length} match${
            results.length === 1
                ? ""
                : "es"
        } found`;

    readerSearchResults.appendChild(
        header
    );


    results
        .slice(0, 50)
        .forEach(
            (item, index) => {

                const result =
                    document.createElement(
                        "button"
                    );

                result.type =
                    "button";

                result.className =
                    "reader-search-result reader-search-page";

                result.innerHTML = `

                    <div class="reader-search-result-image">
                        <span>📖</span>
                    </div>

                    <div class="reader-search-result-info">

                        <div class="reader-search-result-title">
                            Page ${item.page}
                        </div>

                        <div class="reader-search-result-author">
                            Jump to matching page
                        </div>

                        <div class="reader-search-snippet">
                            ${escapeHTML(item.snippet)}
                        </div>

                        <span class="reader-search-result-type">
                            ${index + 1} / ${results.length}
                        </span>

                    </div>
                `;

                result.addEventListener(
                    "click",
                    () => {

                        currentSearchIndex =
                            index;

                        closeSearch();

                        goToPage(
                            item.page,
                            true
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

    announce(
        `${results.length} matches found for "${query}"`
    );

}


/* =========================================================
   PDF SEARCH
========================================================= */

async function searchPDF(
    query
) {

    query =
        String(
            query || ""
        ).trim();

    if (
        !pdfDocument ||
        !query
    ) {

        return;

    }

    const token =
        ++searchToken;

    currentSearchResults =
        [];

    currentSearchIndex =
        -1;

    if (
        readerSearchResults
    ) {

        readerSearchResults.innerHTML =
            `<div class="reader-search-count">
                🔎 Searching book...
            </div>`;

        readerSearchResults.classList.add(
            "show"
        );

    }

    const normalizedQuery =
        normalizeSearchText(
            query
        );

    const results = [];


    /*
     * Search every page.
     *
     * Only a few pages are processed
     * between browser yields, so UI
     * remains responsive.
     */

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        if (
            token !== searchToken
        ) {

            return;

        }

        const text =
            await getPageText(
                page
            );

        if (
            normalizeSearchText(
                text
            ).includes(
                normalizedQuery
            )
        ) {

            results.push({

                page,

                snippet:
                    createSnippet(
                        text,
                        query
                    )

            });

        }


        if (
            page % 3 === 0
        ) {

            announce(
                `Searching book... ${page}/${pageCount}`
            );

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        0
                    )
            );

        }

    }


    if (
        token !== searchToken
    ) {

        return;

    }

    if (
        !results.length
    ) {

        showSearchMessage(
            `🔎 No result found for <strong>${escapeHTML(query)}</strong>`
        );

        announce(
            `No result found for ${query}`
        );

        return;

    }

    showSearchResults(
        results,
        query
    );

}


/* =========================================================
   NEXT SEARCH RESULT
========================================================= */

function focusNextSearchResult(
    backwards = false
) {

    if (
        !currentSearchResults.length
    ) {

        if (readerSearchInput) {

            readerSearchInput.focus();

        }

        return;

    }

    if (backwards) {

        currentSearchIndex--;

        if (
            currentSearchIndex < 0
        ) {

            currentSearchIndex =
                currentSearchResults.length - 1;

        }

    } else {

        currentSearchIndex++;

        if (
            currentSearchIndex >=
            currentSearchResults.length
        ) {

            currentSearchIndex =
                0;

        }

    }

    const result =
        currentSearchResults[
            currentSearchIndex
        ];

    if (!result) {
        return;
    }

    goToPage(
        result.page,
        true
    );

    announce(
        `Search result ${
            currentSearchIndex + 1
        } of ${
            currentSearchResults.length
        } — page ${
            result.page
        }`
    );

}


/* =========================================================
   SEARCH EVENTS
========================================================= */

if (
    readerSearchInput
) {

    readerSearchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                readerSearchInput.value =
                    "";

                ++searchToken;

                closeSearch();

                return;

            }


            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchPDF(
                    readerSearchInput.value
                );

            }

        }
    );


    readerSearchInput.addEventListener(
        "input",
        () => {

            if (
                !readerSearchInput.value.trim()
            ) {

                ++searchToken;

                closeSearch();

            }

        }
    );

}


if (
    readerSearchButton
) {

    readerSearchButton.addEventListener(
        "click",
        () => {

            searchPDF(
                readerSearchInput
                    ? readerSearchInput.value
                    : ""
            );

        }
    );

}


if (
    readerSearchClear
) {

    readerSearchClear.addEventListener(
        "click",
        () => {

            ++searchToken;

            if (
                readerSearchInput
            ) {

                readerSearchInput.value =
                    "";

                readerSearchInput.focus();

            }

            closeSearch();

        }
    );

}


/* =========================================================
   READ ALOUD
========================================================= */

function getSpeechVoices() {

    if (
        !("speechSynthesis" in window)
    ) {

        return [];

    }

    return (
        window.speechSynthesis
            .getVoices() || []
    );

}


function chooseSpeechVoice() {

    const voices =
        getSpeechVoices();

    if (!voices.length) {

        return null;

    }

    preferredVoice =
        voices.find(
            voice => {

                const lang =
                    String(
                        voice.lang || ""
                    )
                        .toLowerCase();

                const name =
                    String(
                        voice.name || ""
                    )
                        .toLowerCase();

                return (
                    lang === "ur-pk" ||
                    lang.startsWith("ur") ||
                    name.includes("urdu")
                );

            }
        ) ||

        voices.find(
            voice =>
                String(
                    voice.lang || ""
                )
                    .toLowerCase()
                    .startsWith("ur")
        ) ||

        voices.find(
            voice =>
                String(
                    voice.lang || ""
                )
                    .toLowerCase()
                    .startsWith("hi")
        ) ||

        voices.find(
            voice =>
                String(
                    voice.lang || ""
                )
                    .toLowerCase()
                    .startsWith("en")
        ) ||

        voices[0];

    return preferredVoice;

}


if (
    "speechSynthesis" in window
) {

    window.speechSynthesis.addEventListener(
        "voiceschanged",
        chooseSpeechVoice
    );

    chooseSpeechVoice();

}


/* =========================================================
   SPEECH CHUNKS
========================================================= */

function splitSpeechText(
    text
) {

    const cleaned =
        String(
            text || ""
        )
            .replace(
                /\s+/g,
                " "
            )
            .trim();

    if (!cleaned) {
        return [];
    }

    const chunks = [];

    let remaining =
        cleaned;

    while (
        remaining.length >
        MAX_TTS_CHUNK
    ) {

        let cut =
            remaining.lastIndexOf(
                " ",
                MAX_TTS_CHUNK
            );

        if (
            cut < 80
        ) {

            cut =
                MAX_TTS_CHUNK;

        }

        chunks.push(
            remaining
                .slice(
                    0,
                    cut
                )
                .trim()
        );

        remaining =
            remaining
                .slice(cut)
                .trim();

    }

    if (remaining) {

        chunks.push(
            remaining
        );

    }

    return chunks;

}


/* =========================================================
   SPEECH UI
========================================================= */

function updateSpeechUI() {

    const supported =
        "speechSynthesis" in window;

    const active =
        speechMode !==
        "stopped";

    const speaking =
        speechMode ===
        "playing";


    if (listenButton) {

        listenButton.disabled =
            !pdfDocument ||
            !supported;

        listenButton.classList.toggle(
            "speaking",
            speaking
        );

        listenButton.innerHTML =
            speaking

                ? '<i class="fas fa-volume-high"></i><span class="button-label">Listening</span>'

                : '<i class="fas fa-volume-high"></i><span class="button-label">Listen</span>';

    }


    if (pauseListenButton) {

        pauseListenButton.disabled =
            !active;

        pauseListenButton.innerHTML =
            speechMode ===
            "paused"

                ? '<i class="fas fa-play"></i>'

                : '<i class="fas fa-pause"></i>';

    }


    if (stopListenButton) {

        stopListenButton.disabled =
            !active;

    }

}


/* =========================================================
   STOP SPEECH
========================================================= */

function stopSpeaking(
    announceStop = false
) {

    ++speechToken;

    speechChunks =
        [];

    speechChunkIndex =
        0;

    speechPage =
        0;

    speechMode =
        "stopped";

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    updateSpeechUI();

    if (announceStop) {

        announce(
            "Read aloud stopped."
        );

    }

}


/* =========================================================
   START SPEECH PAGE
========================================================= */

async function startSpeechPage(
    page,
    token
) {

    if (
        token !== speechToken ||
        speechMode !== "playing"
    ) {

        return;

    }

    const text =
        await getPageText(
            page
        );

    if (
        token !== speechToken ||
        speechMode !== "playing"
    ) {

        return;

    }


    /*
     * Scanned/image page:
     * automatically move to next page.
     */

    if (!text) {

        announce(
            `Page ${page} has no selectable text.`
        );

        if (
            page < pageCount
        ) {

            const next =
                page + 1;

            speechPage =
                next;

            await renderPage(
                next,
                false
            );

            if (
                token === speechToken &&
                speechMode === "playing"
            ) {

                startSpeechPage(
                    next,
                    token
                );

            }

        } else {

            stopSpeaking(false);

            announce(
                "Read aloud finished."
            );

        }

        return;

    }


    speechPage =
        page;

    speechChunks =
        splitSpeechText(
            text
        );

    speechChunkIndex =
        0;

    announce(
        `Reading page ${page} of ${pageCount}...`
    );

    speakNextChunk(
        token
    );

}


/* =========================================================
   SPEAK NEXT CHUNK
========================================================= */

function speakNextChunk(
    token
) {

    if (
        token !== speechToken ||
        speechMode !== "playing"
    ) {

        return;

    }


    if (
        speechChunkIndex >=
        speechChunks.length
    ) {

        if (
            speechPage <
            pageCount
        ) {

            const next =
                speechPage + 1;

            speechPage =
                next;

            renderPage(
                next,
                false
            )
                .then(
                    () => {

                        if (
                            token === speechToken &&
                            speechMode === "playing"
                        ) {

                            startSpeechPage(
                                next,
                                token
                            );

                        }

                    }
                );

            return;

        }


        stopSpeaking(false);

        announce(
            "Read aloud finished."
        );

        return;

    }


    const utterance =
        new SpeechSynthesisUtterance(
            speechChunks[
                speechChunkIndex
            ]
        );


    const voice =
        preferredVoice ||
        chooseSpeechVoice();


    if (voice) {

        utterance.voice =
            voice;

        utterance.lang =
            voice.lang ||
            "ur-PK";

    } else {

        utterance.lang =
            "ur-PK";

    }


    utterance.rate =
        Number(
            listenSpeed?.value ||
            1
        );

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onend =
        () => {

            if (
                token !== speechToken ||
                speechMode !== "playing"
            ) {

                return;

            }

            speechChunkIndex++;

            speakNextChunk(
                token
            );

        };


    utterance.onerror =
        event => {

            if (
                event?.error ===
                    "canceled" ||
                event?.error ===
                    "interrupted"
            ) {

                return;

            }

            console.warn(
                "Speech error:",
                event?.error
            );

            stopSpeaking(false);

            announce(
                "Read aloud could not continue."
            );

        };


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   LISTEN BUTTON
========================================================= */

if (listenButton) {

    listenButton.addEventListener(
        "click",
        () => {

            if (
                !pdfDocument ||
                !("speechSynthesis" in window)
            ) {

                return;

            }


            if (
                speechMode ===
                "paused"
            ) {

                speechMode =
                    "playing";

                updateSpeechUI();

                window.speechSynthesis.resume();

                announce(
                    "Read aloud resumed."
                );

                return;

            }


            stopSpeaking(false);

            speechMode =
                "playing";

            updateSpeechUI();

            const token =
                speechToken;

            startSpeechPage(
                currentPage,
                token
            );

        }
    );

}


/* =========================================================
   PAUSE
========================================================= */

if (
    pauseListenButton
) {

    pauseListenButton.addEventListener(
        "click",
        () => {

            if (
                !("speechSynthesis" in window)
            ) {

                return;

            }


            if (
                speechMode ===
                "playing"
            ) {

                speechMode =
                    "paused";

                window.speechSynthesis.pause();

                updateSpeechUI();

                announce(
                    "Read aloud paused."
                );

            }

            else if (
                speechMode ===
                "paused"
            ) {

                speechMode =
                    "playing";

                window.speechSynthesis.resume();

                updateSpeechUI();

                announce(
                    "Read aloud resumed."
                );

            }

        }
    );

}


/* =========================================================
   STOP
========================================================= */

if (
    stopListenButton
) {

    stopListenButton.addEventListener(
        "click",
        () =>
            stopSpeaking(true)
    );

}


/* =========================================================
   SPEECH SPEED
========================================================= */

if (listenSpeed) {

    listenSpeed.addEventListener(
        "change",
        () => {

            if (
                speechMode !==
                "playing"
            ) {

                return;

            }

            const page =
                speechPage ||
                currentPage;

            stopSpeaking(false);

            speechMode =
                "playing";

            updateSpeechUI();

            startSpeechPage(
                page,
                speechToken
            );

        }
    );

}


/* =========================================================
   MANUAL NAVIGATION STOPS SPEECH
========================================================= */

function stopSpeechForManualNavigation() {

    if (
        speechMode !==
        "stopped"
    ) {

        stopSpeaking(false);

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

    cancelRender();

    ++renderVersion;

    stopSpeaking(false);

    pageCache.clear();

    pageTextCache.clear();

    currentPage =
        1;

    pageCount =
        0;

    updateUI();

    setBookTitle();

    announce(
        "Loading PDF..."
    );


    console.log(
        "📖 Loading PDF:",
        PDF_URL
    );


    try {

        /*
         * IMPORTANT:
         * This is the fast-loading configuration.
         */

        const loadingTask =
            pdfjsLib.getDocument({

                url:
                    PDF_URL,

                rangeChunkSize:
                    RANGE_CHUNK_SIZE,

                disableAutoFetch:
                    true,

                disableStream:
                    false,

                useWorkerFetch:
                    true,

                isEvalSupported:
                    true,

                stopAtErrors:
                    false

            });


        activeLoadingTask =
            loadingTask;


        loadingTask.onProgress =
            progress => {

                if (
                    progress?.total
                ) {

                    const percent =
                        Math.round(
                            (
                                progress.loaded /
                                progress.total
                            ) *
                            100
                        );

                    announce(
                        `Loading PDF… ${percent}%`
                    );

                } else {

                    announce(
                        "Loading PDF..."

                    );

                }

            };


        const document =
            await loadingTask.promise;


        if (
            activeLoadingTask !==
            loadingTask
        ) {

            try {

                await document.destroy();

            } catch {}

            return;

        }


        pdfDocument =
            document;

        activeLoadingTask =
            null;

        pageCount =
            pdfDocument.numPages;


        if (!pageCount) {

            throw new Error(
                "PDF contains no pages."
            );

        }


        const requestedPage =
            parseInt(
                params.get("page"),
                10
            );


        currentPage =
            (
                Number.isFinite(
                    requestedPage
                ) &&
                requestedPage >= 1 &&
                requestedPage <= pageCount
            )
                ? requestedPage
                : 1;


        updateUI();


        /*
         * Render FIRST page immediately.
         */

        const rendered =
            await renderPage(
                currentPage,
                true
            );


        if (!rendered) {

            throw new Error(
                "First page render failed."
            );

        }


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

        pageCache.clear();


        updateUI();


        if (
            error?.name ===
            "MissingPDFException"
        ) {

            showError(
                "PDF not found. Check the exact PDF filename and path."
            );

        }

        else if (
            error?.name ===
            "InvalidPDFException"
        ) {

            showError(
                "The selected file is not a valid PDF."
            );

        }

        else if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            showError(
                "The PDF server rejected the request. Check the PDF path and hosting."
            );

        }

        else {

            showError(
                "PDF could not be loaded. Check the PDF URL, filename, hosting and file."
            );

        }

    } finally {

        loadingPDF =
            false;

    }

}


/* =========================================================
   CANVAS
========================================================= */

if (pdfCanvas) {

    pdfCanvas.addEventListener(
        "dragstart",
        event => {

            event.preventDefault();

        }
    );

}


/* =========================================================
   GLOBAL API
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

    searchPDF,

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
   START
========================================================= */

loadTheme();

setBookTitle();

updateUI();

loadPDF();


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
    "✅ Fast PDF Loading"
);

console.log(
    "✅ Ctrl+F Search"
);

console.log(
    "✅ PDF Text Search"
);

console.log(
    "✅ Urdu / Arabic Search"
);

console.log(
    "✅ Read Aloud"
);

console.log(
    "✅ Pause / Resume / Stop"
);

console.log(
    "✅ Page Flip"
);

console.log(
    "✅ Mobile Swipe"
);

console.log(
    "✅ Zoom"
);

console.log(
    "✅ Bookmark"
);

console.log(
    "✅ Share"
);

console.log(
    "======================================"
);
