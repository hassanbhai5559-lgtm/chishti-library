/* =========================================================
   CHISHTI LIBRARY
   CLEAN READER.JS
   PDF.JS 4.10.38
========================================================= */


/* =========================================================
   PDF.JS
========================================================= */

import * as pdfjsLib from
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   URL
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const rawBook =
    params.get("book") ||
    params.get("pdf") ||
    "";


function getPDFURL() {

    if (!rawBook) {
        return "";
    }

    try {

        const clean =
            decodeURIComponent(
                rawBook
            )
            .replace(/^\/+/, "")
            .trim();

        return new URL(
            clean,
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

const loadingScreen =
    document.getElementById(
        "loadingScreen"
    );

const loadingText =
    document.getElementById(
        "loadingText"
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


const bookmarkButton =
    document.getElementById(
        "bookmarkBtn"
    );

const shareButton =
    document.getElementById(
        "shareBtn"
    );

const themeButton =
    document.getElementById(
        "themeButton"
    );

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );

const downloadButton =
    document.getElementById(
        "downloadButton"
    );

const printButton =
    document.getElementById(
        "printButton"
    );


/* SEARCH */

const readerSearchInput =
    document.getElementById(
        "readerSearchInput"
    );

const readerSearchButton =
    document.getElementById(
        "readerSearchButton"
    );

const readerSearchClear =
    document.getElementById(
        "readerSearchClear"
    );

const readerSearchResults =
    document.getElementById(
        "readerSearchResults"
    );


/* READ ALOUD */

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

let zoom =
    DEFAULT_ZOOM;

let currentRenderTask = null;

let renderVersion = 0;

let loadingPDF = false;

let pageTransitionBusy = false;

let activeLoadingTask = null;


/* Page cache */

const pageCache =
    new Map();


/* Text cache */

const pageTextCache =
    new Map();


let searchToken = 0;

let searchResults = [];

let searchIndex = -1;


/* Speech */

let speechMode =
    "stopped";

let speechToken = 0;

let speechChunks = [];

let speechChunkIndex = 0;

let speechPage = 0;

let speechVoice = null;


/* Touch */

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
   LOADING
========================================================= */

function showLoading(message) {

    if (loadingText) {

        loadingText.textContent =
            message;

    }

    if (loadingScreen) {

        loadingScreen.classList.remove(
            "hidden"
        );

    }

}


function hideLoading() {

    if (loadingScreen) {

        loadingScreen.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    hideLoading();

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
   THEME
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

    try {

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

    } catch {}

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
    "chishtiReaderBookmark_" +
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
        saved === currentPage &&
        saved > 0;

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

            } catch {}

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

    /*
     * Keep current + nearby pages.
     */

    while (
        pageCache.size > 3
    ) {

        let farthest =
            null;

        let distance =
            -1;

        for (
            const number of pageCache.keys()
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

        const oldPage =
            pageCache.get(
                farthest
            );

        pageCache.delete(
            farthest
        );

        try {
            oldPage?.cleanup?.();
        } catch {}

    }

    return page;

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

    return Math.max(
        .25,
        Math.min(
            widthScale,
            heightScale
        ) * zoom
    );

}


/* =========================================================
   PIXEL RATIO
========================================================= */

function getPixelRatio(
    viewport
) {

    const mobile =
        window.innerWidth <= 768;

    const max =
        mobile
            ? 1.35
            : 1.75;

    const device =
        window.devicePixelRatio ||
        1;

    let ratio =
        Math.min(
            device,
            max
        );

    const pixels =
        viewport.width *
        viewport.height;

    if (
        pixels > 0
    ) {

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

    }

    return Math.max(
        1,
        Number(
            ratio.toFixed(2)
        )
    );

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

    currentRenderTask =
        null;

}


/* =========================================================
   RENDER
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
            version !==
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

        const ratio =
            getPixelRatio(
                viewport
            );

        pdfCanvas.width =
            Math.floor(
                viewport.width *
                ratio
            );

        pdfCanvas.height =
            Math.floor(
                viewport.height *
                ratio
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

        const task =
            page.render({

                canvasContext:
                    context,

                viewport:
                    viewport

            });

        currentRenderTask =
            task;

        await task.promise;

        if (
            version !==
            renderVersion
        ) {

            return false;

        }

        if (
            currentRenderTask ===
            task
        ) {

            currentRenderTask =
                null;

        }

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
            version ===
            renderVersion
        ) {

            showError(
                "PDF page could not be rendered."
            );

        }

        return false;

    }

}


/* =========================================================
   PAGE FLIP
========================================================= */

async function flipTo(
    target,
    direction
) {

    if (
        !pdfDocument ||
        pageTransitionBusy
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
        pageWrapper?.clientWidth ||
        pdfCanvas.clientWidth ||
        300;

    const height =
        pageWrapper?.clientHeight ||
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


    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        oldCanvas.width;

    canvas.height =
        oldCanvas.height;

    canvas.style.width =
        `${width}px`;

    canvas.style.height =
        `${height}px`;


    const frontContext =
        canvas.getContext(
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
        canvas
    );


    const back =
        document.createElement(
            "div"
        );

    back.className =
        "chishti-page-flip-face chishti-page-flip-back";

    back.innerHTML =
        `<div class="chishti-flip-paper"></div>`;


    sheet.appendChild(
        front
    );

    sheet.appendChild(
        back
    );

    stage.appendChild(
        sheet
    );


    stage.classList.add(
        direction === "next"
            ? "chishti-flip-next"
            : "chishti-flip-prev"
    );


    bookViewport.appendChild(
        stage
    );


    void stage.offsetWidth;


    stage.classList.add(
        "chishti-flip-running"
    );


    announce(
        `Opening page ${target}...`
    );


    /*
     * Render new page while
     * flip animation is running.
     */

    const renderPromise =
        renderPage(
            target,
            false
        );


    await new Promise(
        resolve =>
            setTimeout(
                resolve,
                FLIP_TIME
            )
    );


    await renderPromise;


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

    if (
        !Number.isFinite(
            target
        )
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

    stopSpeech();

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

    stopSpeech();

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

    if (
        pageTransitionBusy
    ) {
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

            }

        }
    );

}


/* =========================================================
   MOBILE SWIPE
========================================================= */

if (bookViewport) {

    bookViewport.addEventListener(
        "touchstart",
        event => {

            if (
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
        event => {

            if (
                pageTransitionBusy ||
                !event.changedTouches.length
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
   KEYBOARD + CTRL F
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
         * Browser Ctrl+F ko stop karke
         * hamari PDF search open karo.
         */

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "f"
        ) {

            event.preventDefault();

            if (readerSearchInput) {

                readerSearchInput.focus();

                readerSearchInput.select();

            }

            return;

        }


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
            "ArrowRight"
        ) {

            event.preventDefault();

            nextPage();

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
            event.key === "+"
            ||
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

        }

    }
);


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
   ESCAPE HTML
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
   GET PAGE TEXT
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
                        item?.str ||
                        ""
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
            `Text extraction failed on page ${pageNumber}`,
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
   SEARCH SNIPPET
========================================================= */

function makeSnippet(
    text,
    query
) {

    const source =
        String(text || "");

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
            index - 65
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
   SEARCH PDF
========================================================= */

async function searchPDF(
    query
) {

    if (
        !pdfDocument
    ) {

        announce(
            "PDF is not loaded yet."
        );

        return;

    }

    const clean =
        String(
            query || ""
        ).trim();

    if (!clean) {

        closeSearch();

        return;

    }

    const token =
        ++searchToken;

    searchResults = [];

    searchIndex = -1;

    if (readerSearchResults) {

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
            clean
        );


    /*
     * Search every page.
     * Only a few pages are processed between
     * browser yields so the UI doesn't freeze.
     */

    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        if (
            token !==
            searchToken
        ) {

            return;

        }

        const text =
            await getPageText(
                page
            );

        const normalizedText =
            normalizeSearchText(
                text
            );

        if (
            normalizedText.includes(
                normalizedQuery
            )
        ) {

            searchResults.push({

                page,

                snippet:
                    makeSnippet(
                        text,
                        clean
                    )

            });

        }


        if (
            page % 3 === 0
        ) {

            announce(
                `Searching… ${page}/${pageCount}`
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
        token !==
        searchToken
    ) {

        return;

    }


    if (
        !searchResults.length
    ) {

        showSearchMessage(
            `🔎 No result found for <strong>${escapeHTML(clean)}</strong>`
        );

        announce(
            "No matching page found."
        );

        return;

    }


    currentSearchIndex =
        searchResults.findIndex(
            item =>
                item.page ===
                currentPage
        );


    if (
        currentSearchIndex < 0
    ) {

        currentSearchIndex =
            0;

    }


    renderSearchResults(
        clean
    );


    announce(
        `${searchResults.length} matching pages found.`
    );

}


/* =========================================================
   SEARCH RESULTS UI
========================================================= */

function renderSearchResults(
    query
) {

    if (!readerSearchResults) {
        return;
    }

    readerSearchResults.innerHTML = "";


    const count =
        document.createElement(
            "div"
        );

    count.className =
        "reader-search-count";

    count.textContent =
        `${searchResults.length} matching page${searchResults.length === 1 ? "" : "s"}`;

    readerSearchResults.appendChild(
        count
    );


    searchResults
        .slice(
            0,
            50
        )
        .forEach(
            (item, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "reader-search-result";


                button.innerHTML = `

                    <div
                        class="reader-search-result-image"
                    >
                        <i class="fas fa-file-pdf"></i>
                    </div>

                    <div
                        class="reader-search-result-info"
                    >

                        <div
                            class="reader-search-result-title"
                        >
                            Page ${item.page}
                        </div>

                        <div
                            class="reader-search-result-author"
                        >
                            Match ${index + 1}
                        </div>

                        <div
                            class="reader-search-snippet"
                        >
                            ${escapeHTML(item.snippet)}
                        </div>

                        <span
                            class="reader-search-result-type"
                        >
                            Open page
                        </span>

                    </div>

                `;


                button.addEventListener(
                    "click",
                    () => {

                        searchIndex =
                            index;

                        closeSearch();

                        goToPage(
                            item.page,
                            true
                        );

                    }
                );


                readerSearchResults.appendChild(
                    button
                );

            }
        );


    readerSearchResults.classList.add(
        "show"
    );

}


/* =========================================================
   SEARCH MESSAGE
========================================================= */

function showSearchMessage(
    message
) {

    if (!readerSearchResults) {
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


if (readerSearchButton) {

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


if (readerSearchInput) {

    readerSearchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchPDF(
                    readerSearchInput.value
                );

            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

                readerSearchInput.value =
                    "";

                ++searchToken;

                closeSearch();

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


if (readerSearchClear) {

    readerSearchClear.addEventListener(
        "click",
        () => {

            ++searchToken;

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
   CLOSE SEARCH OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    event => {

        const search =
            event.target.closest(
                ".reader-search"
            );

        if (
            !search
        ) {

            readerSearchResults
                ?.classList
                .remove(
                    "show"
                );

        }

    }
);


/* =========================================================
   READ ALOUD
========================================================= */

function chooseVoice() {

    if (
        !("speechSynthesis" in window)
    ) {

        return null;

    }

    const voices =
        window.speechSynthesis
            .getVoices();

    if (!voices.length) {
        return null;
    }


    speechVoice =
        voices.find(
            voice => {

                const lang =
                    String(
                        voice.lang ||
                        ""
                    )
                    .toLowerCase();

                return (
                    lang === "ur-pk" ||
                    lang.startsWith("ur")
                );

            }
        ) ||

        voices.find(
            voice =>
                String(
                    voice.lang ||
                    ""
                )
                .toLowerCase()
                .startsWith("hi")
        ) ||

        voices.find(
            voice =>
                String(
                    voice.lang ||
                    ""
                )
                .toLowerCase()
                .startsWith("en")
        ) ||

        voices[0];


    return speechVoice;

}


if (
    "speechSynthesis" in window
) {

    window.speechSynthesis.addEventListener(
        "voiceschanged",
        chooseVoice
    );

    chooseVoice();

}


/* =========================================================
   SPEECH CHUNKS
========================================================= */

function splitSpeechText(
    text
) {

    const clean =
        String(
            text || ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim();

    if (!clean) {
        return [];
    }

    const chunks = [];

    let remaining =
        clean;

    const max =
        240;


    while (
        remaining.length >
        max
    ) {

        let cut =
            remaining.lastIndexOf(
                " ",
                max
            );

        if (
            cut < 80
        ) {

            cut = max;

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
                .slice(
                    cut
                )
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

                ? `
                    <i class="fas fa-volume-high"></i>
                    <span class="button-label">
                        Listening
                    </span>
                  `

                : `
                    <i class="fas fa-volume-high"></i>
                    <span class="button-label">
                        Listen
                    </span>
                  `;

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

function stopSpeech(
    announceStop = false
) {

    ++speechToken;

    speechChunks = [];

    speechChunkIndex = 0;

    speechPage = 0;

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
   START PAGE SPEECH
========================================================= */

async function startSpeechPage(
    page,
    token
) {

    if (
        token !==
        speechToken ||
        speechMode !==
        "playing"
    ) {

        return;

    }


    const text =
        await getPageText(
            page
        );


    if (
        token !==
        speechToken ||
        speechMode !==
        "playing"
    ) {

        return;

    }


    if (!text) {

        /*
         * Image-only/scanned page.
         * Automatically continue.
         */

        if (
            page <
            pageCount
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
                token ===
                speechToken &&
                speechMode ===
                "playing"
            ) {

                startSpeechPage(
                    next,
                    token
                );

            }

        } else {

            stopSpeech();

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
   SPEAK CHUNK
========================================================= */

function speakNextChunk(
    token
) {

    if (
        token !==
        speechToken ||
        speechMode !==
        "playing"
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
                        token ===
                        speechToken &&
                        speechMode ===
                        "playing"
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


        stopSpeech();

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
        speechVoice ||
        chooseVoice();


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
                token !==
                speechToken ||
                speechMode !==
                "playing"
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

            stopSpeech();

            announce(
                "Read aloud could not continue."
            );

        };


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   SPEECH BUTTONS
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


            stopSpeech();

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


if (pauseListenButton) {

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

            } else if (
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


if (stopListenButton) {

    stopListenButton.addEventListener(
        "click",
        () =>
            stopSpeech(true)
    );

}


/* =========================================================
   SPEED
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

            stopSpeech();

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


        const data = {

            title:
                `${getBookName()} — Chishti Library`,

            text:
                `Read ${getBookName()} — Page ${currentPage}`,

            url:
                url.href

        };


        if (
            navigator.share
        ) {

            await navigator.share(
                data
            );

            announce(
                "Reader link shared."
            );

            return;

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

        if (
            error?.name !==
            "AbortError"
        ) {

            console.error(
                "Share error:",
                error
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
   WATERMARK PDF
========================================================= */

async function createWatermarkedPDF() {

    if (
        typeof PDFLib ===
        "undefined"
    ) {

        throw new Error(
            "PDF-LIB is not loaded."
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
                cache:
                    "no-store"
            }
        );


    if (!response.ok) {

        throw new Error(
            `PDF request failed: ${response.status}`
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
            PDFLib.StandardFonts.HelveticaBold
        );


    for (
        const page of doc.getPages()
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
                    ) * .065
                )
            );


        const textWidth =
            font.widthOfTextAtSize(
                "ChishtiLibrary.com",
                size
            );


        page.drawText(
            "ChishtiLibrary.com",
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
                        .29,
                        0,
                        0
                    ),

                opacity:
                    .22,

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

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        async () => {

            try {

                downloadButton.disabled =
                    true;

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


                link.href =
                    url;

                link.download =
                    `${getBookName()}-ChishtiLibrary.pdf`;


                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();


                setTimeout(
                    () =>
                        URL.revokeObjectURL(
                            url
                        ),
                    5000
                );


                announce(
                    "Watermarked PDF downloaded."
                );

            } catch (error) {

                console.error(
                    "Download error:",
                    error
                );

                alert(
                    "Watermarked PDF could not be created."
                );

            } finally {

                downloadButton.disabled =
                    false;

            }

        }
    );

}


/* =========================================================
   PRINT
========================================================= */

if (printButton) {

    printButton.addEventListener(
        "click",
        async () => {

            try {

                announce(
                    "Preparing document..."
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
                    "Print error:",
                    error
                );

                alert(
                    "Print preparation failed."
                );

            }

        }
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
   LOAD PDF
========================================================= */

async function loadPDF() {

    if (
        loadingPDF
    ) {
        return;
    }


    loadingPDF =
        true;


    hideError();

    showLoading(
        "Loading PDF..."
    );


    if (!PDF_URL) {

        showError(
            "No PDF selected. Open the reader using ?book=YOUR-PDF.pdf"
        );

        loadingPDF =
            false;

        return;

    }


    console.log(
        "📖 PDF URL:",
        PDF_URL
    );


    try {

        cancelRender();

        ++renderVersion;

        stopSpeech();


        if (
            activeLoadingTask
        ) {

            try {

                activeLoadingTask.destroy();

            } catch {}

        }


        pageCache.clear();

        pageTextCache.clear();


        const loadingTask =
            pdfjsLib.getDocument({

                url:
                    PDF_URL,

                rangeChunkSize:
                    RANGE_CHUNK_SIZE,

                /*
                 * First page priority.
                 */

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
                            ) * 100
                        );

                    showLoading(
                        `Loading PDF… ${percent}%`
                    );

                } else {

                    showLoading(
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


        activeLoadingTask =
            null;


        pdfDocument =
            document;


        pageCount =
            pdfDocument.numPages;


        if (
            pageCount <= 0
        ) {

            throw new Error(
                "PDF has no pages."
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
         * IMPORTANT:
         * Only render ONE page first.
         */

        showLoading(
            "Opening first page..."
        );


        const success =
            await renderPage(
                currentPage,
                true
            );


        if (!success) {

            throw new Error(
                "First page could not be rendered."
            );

        }


        hideLoading();


        announce(
            `Page ${currentPage} of ${pageCount}`
        );


        console.log(
            `✅ PDF loaded successfully: ${pageCount} pages`
        );


    } catch (error) {

        console.error(
            "PDF LOAD ERROR:",
            error
        );


        pdfDocument =
            null;

        pageCount =
            0;

        currentPage =
            1;

        pageCache.clear();


        if (
            error?.name ===
            "MissingPDFException"
        ) {

            showError(
                "PDF not found. Check the exact PDF filename and path."
            );

        } else if (
            error?.name ===
            "InvalidPDFException"
        ) {

            showError(
                "This file is not a valid PDF."
            );

        } else if (
            error?.name ===
            "UnexpectedResponseException"
        ) {

            showError(
                "The server rejected the PDF request."
            );

        } else {

            showError(
                "PDF could not be loaded. Check the PDF path and hosting."
            );

        }


        updateUI();

    } finally {

        loadingPDF =
            false;

    }

}


/* =========================================================
   GLOBAL API
========================================================= */

window.chishtiReader = {

    loadPDF,

    nextPage,

    previousPage,

    goToPage,

    zoomIn,

    zoomOut,

    resetZoom,

    toggleFullscreen,

    searchPDF,

    stopSpeech,

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
    "PDF.js 4.10.38"
);

console.log(
    "Fast PDF Loading"
);

console.log(
    "PDF Search / Ctrl+F"
);

console.log(
    "Read Aloud"
);

console.log(
    "Page Navigation"
);

console.log(
    "Zoom"
);

console.log(
    "Bookmark"
);

console.log(
    "Share"
);

console.log(
    "Watermarked Download"
);

console.log(
    "Print"
);

console.log(
    "Fullscreen"
);

console.log(
    "======================================"
);
