/* =========================================================
   CHISHTI LIBRARY
   CLEAN + FIXED READER.JS
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
   URL / BOOK
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );

const rawBook =
    params.get("book") ||
    params.get("pdf") ||
    "";

const requestedPage =
    Number.parseInt(
        params.get("page"),
        10
    ) || 1;


function getPDFURL() {

    if (!rawBook) {
        return "";
    }

    try {

        const decoded =
            decodeURIComponent(
                rawBook
            );

        return new URL(
            decoded,
            window.location.href
        ).href;

    } catch (error) {

        console.error(
            "Invalid PDF URL:",
            error
        );

        return "";

    }

}


function getBookName() {

    if (!rawBook) {
        return "Chishti Library";
    }

    try {

        const decoded =
            decodeURIComponent(
                rawBook.split("?")[0]
            );

        const filename =
            decoded
                .split("/")
                .pop()
                .replace(
                    /\.[^/.]+$/,
                    ""
                );

        return filename ||
            "Chishti Library";

    } catch {

        return "Chishti Library";

    }

}


/* =========================================================
   SETTINGS
========================================================= */

const SETTINGS = {

    minZoom: 0.65,

    maxZoom: 2.5,

    zoomStep: 0.1,

    maxPageCache: 3,

    maxCanvasPixels:
        4096 * 4096,

    searchDelay: 80,

    speechChunkSize: 180

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

const bookmarkBtn =
    document.getElementById(
        "bookmarkBtn"
    );

const shareBtn =
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
   PDF STATE
========================================================= */

let pdfDocument = null;

let activeLoadingTask = null;

let currentPage =
    Math.max(
        1,
        requestedPage
    );

let pageCount = 0;

let zoom = 1;

let currentRenderTask = null;

let renderVersion = 0;

let pageTransitionBusy = false;

let loadingPDF = false;


/* =========================================================
   SEARCH STATE
========================================================= */

let searchResults = [];

let searchIndex = -1;

let searchToken = 0;

let searchRunning = false;


/* =========================================================
   READ ALOUD STATE
========================================================= */

let speechMode =
    "stopped";

let speechToken = 0;

let speechChunks = [];

let speechChunkIndex = 0;

let speechPage = 0;

let speechVoice = null;

let speechChunkRetry = 0;


/* =========================================================
   PAGE CACHE
========================================================= */

const pageCache =
    new Map();


function addToPageCache(
    pageNumber,
    page
) {

    if (
        pageCache.has(
            pageNumber
        )
    ) {

        pageCache.delete(
            pageNumber
        );

    }

    pageCache.set(
        pageNumber,
        page
    );

    while (
        pageCache.size >
        SETTINGS.maxPageCache
    ) {

        const oldest =
            pageCache.keys()
                .next()
                .value;

        pageCache.delete(
            oldest
        );

    }

}


/* =========================================================
   STATUS / LOADING
========================================================= */

function setStatus(
    message
) {

    if (readerStatus) {

        readerStatus.textContent =
            message || "";

    }

}


function showLoading(
    message
) {

    if (loadingText) {

        loadingText.textContent =
            message ||
            "Loading...";

    }

    if (loadingScreen) {

        loadingScreen.hidden =
            false;

    }

}


function hideLoading() {

    if (loadingScreen) {

        loadingScreen.hidden =
            true;

    }

}


function showError(
    message
) {

    if (errorMessage) {

        errorMessage.textContent =
            message ||
            "Unable to load this PDF.";

    }

    if (errorScreen) {

        errorScreen.hidden =
            false;

    }

    hideLoading();

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

function setBookTitle() {

    const name =
        getBookName();

    if (bookTitle) {

        bookTitle.textContent =
            name;

    }

    document.title =
        `${name} | Chishti Library`;

}


/* =========================================================
   THEME
========================================================= */

const THEME_KEY =
    "chishti-reader-theme";


function loadTheme() {

    const saved =
        localStorage.getItem(
            THEME_KEY
        );

    applyTheme(
        saved || "maroon"
    );

}


function applyTheme(
    theme
) {

    const allowed = [
        "maroon",
        "deep-maroon",
        "gold"
    ];

    if (
        !allowed.includes(
            theme
        )
    ) {

        theme =
            "maroon";

    }

    document.documentElement
        .setAttribute(
            "data-reader-theme",
            theme
        );

    localStorage.setItem(
        THEME_KEY,
        theme
    );

}


function toggleTheme() {

    const current =
        document.documentElement
            .getAttribute(
                "data-reader-theme"
            ) ||
        "maroon";

    const themes = [
        "maroon",
        "deep-maroon",
        "gold"
    ];

    const index =
        themes.indexOf(
            current
        );

    const next =
        themes[
            (index + 1) %
            themes.length
        ];

    applyTheme(next);

}


/* =========================================================
   BOOKMARK
========================================================= */

function getBookmarkKey() {

    return (
        "chishti-bookmark-" +
        encodeURIComponent(
            rawBook
        )
    );

}


function loadBookmark() {

    const saved =
        Number.parseInt(
            localStorage.getItem(
                getBookmarkKey()
            ),
            10
        );

    if (
        Number.isFinite(saved) &&
        saved >= 1
    ) {

        return saved;

    }

    return 1;

}


function saveBookmark() {

    localStorage.setItem(
        getBookmarkKey(),
        String(currentPage)
    );

    updateBookmarkUI();

}


function updateBookmarkUI() {

    if (!bookmarkBtn) {
        return;
    }

    const saved =
        loadBookmark();

    const active =
        saved === currentPage;

    bookmarkBtn.classList.toggle(
        "active",
        active
    );

    bookmarkBtn.setAttribute(
        "aria-pressed",
        String(active)
    );

    bookmarkBtn.title =
        active
            ? "Remove bookmark"
            : "Bookmark this page";

}


function toggleBookmark() {

    const saved =
        loadBookmark();

    if (
        saved === currentPage
    ) {

        localStorage.removeItem(
            getBookmarkKey()
        );

        updateBookmarkUI();

        return;

    }

    saveBookmark();

}


/* =========================================================
   UI UPDATE
========================================================= */

function updateUI() {

    if (totalPages) {

        totalPages.textContent =
            String(
                pageCount || 0
            );

    }

    if (pageNumberInput) {

        pageNumberInput.value =
            String(currentPage);

        pageNumberInput.max =
            String(
                pageCount || 1
            );

    }

    if (previousPageButton) {

        previousPageButton.disabled =
            currentPage <= 1 ||
            pageTransitionBusy;

    }

    if (nextPageButton) {

        nextPageButton.disabled =
            currentPage >= pageCount ||
            pageTransitionBusy;

    }

    if (zoomLevel) {

        zoomLevel.textContent =
            `${Math.round(
                zoom * 100
            )}%`;

    }

    if (zoomOutButton) {

        zoomOutButton.disabled =
            zoom <=
            SETTINGS.minZoom;

    }

    if (zoomInButton) {

        zoomInButton.disabled =
            zoom >=
            SETTINGS.maxZoom;

    }

    updateBookmarkUI();

    updateSpeechUI();

}


/* =========================================================
   SCALE
========================================================= */

function calculateScale(
    page
) {

    if (
        !bookViewport ||
        !page
    ) {

        return zoom;

    }

    const viewport =
        page.getViewport({
            scale: 1
        });

    const availableWidth =
        Math.max(
            100,
            bookViewport.clientWidth -
            24
        );

    const availableHeight =
        Math.max(
            100,
            bookViewport.clientHeight -
            24
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

    return (
        Math.max(
            0.1,
            fitScale
        ) * zoom
    );

}


/* =========================================================
   PIXEL RATIO
========================================================= */

function getPixelRatio(
    viewport
) {

    const deviceRatio =
        window.devicePixelRatio ||
        1;

    const pixelCount =
        viewport.width *
        viewport.height *
        deviceRatio *
        deviceRatio;

    if (
        pixelCount <=
        SETTINGS.maxCanvasPixels
    ) {

        return deviceRatio;

    }

    const ratio =
        Math.sqrt(
            SETTINGS.maxCanvasPixels /
            (
                viewport.width *
                viewport.height
            )
        );

    return Math.max(
        0.75,
        Math.min(
            deviceRatio,
            ratio
        )
    );

}


/* =========================================================
   GET PAGE
========================================================= */

async function getPDFPage(
    pageNumber
) {

    if (!pdfDocument) {
        return null;
    }

    if (
        pageCache.has(
            pageNumber
        )
    ) {

        const cached =
            pageCache.get(
                pageNumber
            );

        pageCache.delete(
            pageNumber
        );

        pageCache.set(
            pageNumber,
            cached
        );

        return cached;

    }

    const page =
        await pdfDocument.getPage(
            pageNumber
        );

    addToPageCache(
        pageNumber,
        page
    );

    return page;

}


/* =========================================================
   RENDER PAGE — FIXED
========================================================= */

async function renderPage(
    pageNumber
) {

    if (
        !pdfDocument ||
        !pdfCanvas
    ) {

        console.error(
            "PDF document or canvas is missing."
        );

        return false;

    }

    const version =
        ++renderVersion;


    /* Cancel previous render */

    if (currentRenderTask) {

        try {

            currentRenderTask.cancel();

        } catch (error) {

            console.warn(
                "Could not cancel previous render:",
                error
            );

        }

        currentRenderTask =
            null;

    }


    try {

        console.log(
            `Rendering page ${pageNumber}...`
        );


        const page =
            await getPDFPage(
                pageNumber
            );


        if (!page) {

            console.error(
                `Could not get PDF page ${pageNumber}.`
            );

            return false;

        }


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


        const canvas =
            pdfCanvas;


        const context =
            canvas.getContext(
                "2d",
                {
                    alpha: false
                }
            );


        if (!context) {

            console.error(
                "Could not get 2D canvas context."
            );

            return false;

        }


        /* Physical canvas size */

        canvas.width =
            Math.max(
                1,
                Math.floor(
                    viewport.width *
                    ratio
                )
            );

        canvas.height =
            Math.max(
                1,
                Math.floor(
                    viewport.height *
                    ratio
                )
            );


        /* CSS display size */

        canvas.style.width =
            `${viewport.width}px`;

        canvas.style.height =
            `${viewport.height}px`;


        if (pageWrapper) {

            pageWrapper.style.width =
                `${viewport.width}px`;

            pageWrapper.style.height =
                `${viewport.height}px`;

        }


        /* Reset transform */

        context.setTransform(
            1,
            0,
            0,
            1,
            0,
            0
        );


        /* Clear */

        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /* White background */

        context.fillStyle =
            "#ffffff";

        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        /*
         * Important:
         * PDF.js receives the transform.
         * This prevents double-scaling problems.
         */

        const transform = [
            ratio,
            0,
            0,
            ratio,
            0,
            0
        ];


        const renderTask =
            page.render({

                canvasContext:
                    context,

                viewport:
                    viewport,

                transform:
                    transform

            });


        currentRenderTask =
            renderTask;


        try {

            await renderTask.promise;

        } catch (error) {

            if (
                error?.name ===
                "RenderingCancelledException"
            ) {

                console.log(
                    "PDF page render cancelled."
                );

                return false;

            }

            /*
             * IMPORTANT:
             * Print the REAL PDF.js error.
             */

            console.error(
                `PDF.js render error on page ${pageNumber}:`,
                error
            );

            throw error;

        } finally {

            if (
                currentRenderTask ===
                renderTask
            ) {

                currentRenderTask =
                    null;

            }

        }


        if (
            version !==
            renderVersion
        ) {

            return false;

        }


        console.log(
            `Page ${pageNumber} rendered successfully.`
        );


        return true;


    } catch (error) {

        console.error(
            `Error rendering page ${pageNumber}:`,
            error
        );


        if (
            error?.name !==
            "RenderingCancelledException"
        ) {

            setStatus(
                `Unable to render page ${pageNumber}.`
            );

        }


        return false;

    }

}


/* =========================================================
   PAGE TRANSITION
========================================================= */

async function flipTo(
    pageNumber
) {

    if (
        pageTransitionBusy ||
        !pdfDocument
    ) {

        return;

    }

    const target =
        Number.parseInt(
            pageNumber,
            10
        );


    if (
        !Number.isFinite(target) ||
        target < 1 ||
        target > pageCount
    ) {

        return;

    }


    if (
        target === currentPage
    ) {

        updateUI();

        return;

    }


    pageTransitionBusy =
        true;

    updateUI();

    stopSpeech();


    try {

        if (bookViewport) {

            bookViewport.classList.add(
                "page-changing"
            );

        }


        const success =
            await renderPage(
                target
            );


        if (!success) {
            return;
        }


        currentPage =
            target;


        setStatus(
            `Page ${currentPage} of ${pageCount}`
        );


    } finally {

        if (bookViewport) {

            bookViewport.classList.remove(
                "page-changing"
            );

        }


        pageTransitionBusy =
            false;

        updateUI();

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function nextPage() {

    if (
        currentPage <
        pageCount
    ) {

        flipTo(
            currentPage + 1
        );

    }

}


function previousPage() {

    if (
        currentPage > 1
    ) {

        flipTo(
            currentPage - 1
        );

    }

}


function goToPage(
    page
) {

    const target =
        Number.parseInt(
            page,
            10
        );


    if (
        !Number.isFinite(target)
    ) {

        return;

    }


    if (
        target < 1 ||
        target > pageCount
    ) {

        return;

    }


    flipTo(target);

}


/* =========================================================
   ZOOM
========================================================= */

function setZoom(
    value
) {

    const numeric =
        Number(value);


    if (
        !Number.isFinite(
            numeric
        )
    ) {

        return;

    }


    zoom =
        Math.max(
            SETTINGS.minZoom,
            Math.min(
                SETTINGS.maxZoom,
                numeric
            )
        );


    renderPage(
        currentPage
    ).then(() => {

        updateUI();

    });


    updateUI();

}


function zoomIn() {

    setZoom(
        zoom +
        SETTINGS.zoomStep
    );

}


function zoomOut() {

    setZoom(
        zoom -
        SETTINGS.zoomStep
    );

}


function resetZoom() {

    setZoom(1);

}


/* =========================================================
   PAGE INPUT
========================================================= */

function handlePageInput() {

    if (!pageNumberInput) {
        return;
    }


    const value =
        Number.parseInt(
            pageNumberInput.value,
            10
        );


    if (
        !Number.isFinite(value)
    ) {

        pageNumberInput.value =
            String(currentPage);

        return;

    }


    goToPage(value);

}


/* =========================================================
   TOUCH
========================================================= */

let touchStartX = 0;

let touchStartY = 0;


if (bookViewport) {

    bookViewport.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.touches[0];

            if (!touch) {
                return;
            }

            touchStartX =
                touch.clientX;

            touchStartY =
                touch.clientY;

        },
        {
            passive: true
        }
    );


    bookViewport.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            if (!touch) {
                return;
            }


            const deltaX =
                touch.clientX -
                touchStartX;

            const deltaY =
                touch.clientY -
                touchStartY;


            if (
                Math.abs(deltaX) <
                50
            ) {

                return;

            }


            if (
                Math.abs(deltaX) <=
                Math.abs(deltaY)
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
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const target =
            event.target;

        const isTyping =
            target instanceof
                HTMLInputElement ||
            target instanceof
                HTMLTextAreaElement ||
            target instanceof
                HTMLSelectElement ||
            target?.isContentEditable;


        if (isTyping) {

            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                ) &&
                event.key.toLowerCase() ===
                    "f"
            ) {

                event.preventDefault();

                if (
                    readerSearchInput
                ) {

                    readerSearchInput.focus();

                }

            }

            return;

        }


        switch (
            event.key
        ) {

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


            case "Home":

                event.preventDefault();

                goToPage(1);

                break;


            case "End":

                event.preventDefault();

                goToPage(
                    pageCount
                );

                break;


            case "+":

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

        .normalize("NFKC")

        .replace(
            /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
            ""
        )

        .replace(
            /\u0640/g,
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

        .toLowerCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value || ""
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

function makeSearchSnippet(
    text,
    query
) {

    const source =
        String(
            text || ""
        );


    if (!source) {
        return "";
    }


    const normalizedQuery =
        normalizeSearchText(
            query
        );


    if (!normalizedQuery) {

        return (
            source.length > 180
                ? source.slice(
                    0,
                    180
                ) + "…"
                : source
        );

    }


    let normalized = "";

    const positionMap = [];


    for (
        let i = 0;
        i < source.length;
        i++
    ) {

        const char =
            source[i];

        const normalizedChar =
            normalizeSearchText(
                char
            );


        for (
            const normalizedPart
            of normalizedChar
        ) {

            normalized +=
                normalizedPart;

            positionMap.push(i);

        }

    }


    const matchIndex =
        normalized.indexOf(
            normalizedQuery
        );


    if (
        matchIndex < 0
    ) {

        return (
            source.length > 180
                ? source.slice(
                    0,
                    180
                ) + "…"
                : source
        );

    }


    const originalIndex =
        positionMap[
            matchIndex
        ] ?? 0;


    const start =
        Math.max(
            0,
            originalIndex - 65
        );


    const end =
        Math.min(
            source.length,
            start + 190
        );


    let snippet =
        source.slice(
            start,
            end
        );


    if (start > 0) {

        snippet =
            "…" + snippet;

    }


    if (
        end <
        source.length
    ) {

        snippet += "…";

    }


    return snippet;

}


/* =========================================================
   PAGE TEXT
========================================================= */

async function getPageText(
    pageNumber
) {

    if (!pdfDocument) {
        return "";
    }


    try {

        const page =
            await getPDFPage(
                pageNumber
            );


        if (!page) {
            return "";
        }


        const content =
            await page.getTextContent();


        return content.items
            .map(
                item =>
                    item?.str || ""
            )
            .join(" ");


    } catch (error) {

        console.warn(
            `Could not read text from page ${pageNumber}:`,
            error
        );

        return "";

    }

}


/* =========================================================
   SEARCH PDF
========================================================= */

async function searchPDF(
    queryValue
) {

    const query =
        String(
            queryValue ??
            readerSearchInput?.value ??
            ""
        ).trim();


    const token =
        ++searchToken;


    searchResults = [];

    searchIndex = -1;


    if (readerSearchResults) {

        readerSearchResults.innerHTML =
            "";

        readerSearchResults.classList.remove(
            "active"
        );

    }


    if (!query) {

        searchRunning =
            false;

        return [];

    }


    if (!pdfDocument) {

        setStatus(
            "PDF is still loading..."
        );

        return [];

    }


    searchRunning =
        true;


    setStatus(
        "Searching..."
    );


    const normalizedQuery =
        normalizeSearchText(
            query
        );


    if (!normalizedQuery) {

        searchRunning =
            false;

        return [];

    }


    try {

        for (
            let pageNumber = 1;
            pageNumber <= pageCount;
            pageNumber++
        ) {

            if (
                token !==
                searchToken
            ) {

                return [];

            }


            const text =
                await getPageText(
                    pageNumber
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

                    page:
                        pageNumber,

                    text:
                        makeSearchSnippet(
                            text,
                            query
                        )

                });

            }


            if (
                pageNumber %
                    3 ===
                0
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            SETTINGS.searchDelay
                        )
                );

            }

        }


        if (
            token !==
            searchToken
        ) {

            return [];

        }


        renderSearchResults(
            query
        );


        setStatus(
            searchResults.length
                ? `${searchResults.length} result(s) found`
                : "No results found"
        );


        return searchResults;


    } catch (error) {

        if (
            token !==
            searchToken
        ) {

            return [];

        }


        console.error(
            "Search error:",
            error
        );


        setStatus(
            "Search failed."
        );


        return [];


    } finally {

        if (
            token ===
            searchToken
        ) {

            searchRunning =
                false;

        }

    }

}


/* =========================================================
   SEARCH RESULTS
========================================================= */

function renderSearchResults(
    query
) {

    if (!readerSearchResults) {
        return;
    }


    readerSearchResults.innerHTML =
        "";


    if (
        !searchResults.length
    ) {

        readerSearchResults.innerHTML =
            `
            <div class="search-no-results">
                No results found
            </div>
            `;


        readerSearchResults.classList.add(
            "active"
        );


        return;

    }


    const fragment =
        document.createDocumentFragment();


    const visibleResults =
        searchResults.slice(
            0,
            50
        );


    visibleResults.forEach(
        (result, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "search-result-item";


            button.dataset.page =
                String(
                    result.page
                );


            button.innerHTML = `
                <span class="search-result-page">
                    Page ${escapeHTML(
                        result.page
                    )}
                </span>

                <span class="search-result-text">
                    ${escapeHTML(
                        result.text
                    )}
                </span>
            `;


            button.addEventListener(
                "click",
                () => {

                    searchIndex =
                        index;


                    closeSearch(
                        false
                    );


                    goToPage(
                        result.page
                    );

                }
            );


            fragment.appendChild(
                button
            );

        }
    );


    readerSearchResults.appendChild(
        fragment
    );


    readerSearchResults.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE SEARCH
========================================================= */

function closeSearch(
    invalidate = true
) {

    if (invalidate) {

        ++searchToken;

    }


    if (readerSearchResults) {

        readerSearchResults.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   SEARCH EVENTS
========================================================= */

if (readerSearchButton) {

    readerSearchButton.addEventListener(
        "click",
        () => {

            searchPDF();

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

                searchPDF();

            }


            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();

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

            searchResults = [];

            searchIndex = -1;


            if (readerSearchInput) {

                readerSearchInput.value =
                    "";

            }


            if (readerSearchResults) {

                readerSearchResults.innerHTML =
                    "";

                readerSearchResults.classList.remove(
                    "active"
                );

            }


            setStatus(
                pageCount
                    ? `Page ${currentPage} of ${pageCount}`
                    : ""
            );

        }
    );

}


document.addEventListener(
    "click",
    event => {

        const target =
            event.target instanceof
                Element
                ? event.target
                : null;


        if (!target) {
            return;
        }


        if (
            !target.closest(
                "#readerSearchResults"
            ) &&
            !target.closest(
                "#readerSearchInput"
            ) &&
            !target.closest(
                "#readerSearchButton"
            )
        ) {

            closeSearch(
                false
            );

        }

    }
);


/* =========================================================
   READ ALOUD
========================================================= */

function speechSupported() {

    return (
        "speechSynthesis" in
            window &&
        "SpeechSynthesisUtterance" in
            window
    );

}


function chooseVoice() {

    if (
        !speechSupported()
    ) {

        return null;

    }


    const voices =
        window.speechSynthesis
            .getVoices();


    if (!voices.length) {
        return null;
    }


    const exactUrdu =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase() ===
                "ur-pk"
        );


    if (exactUrdu) {
        return exactUrdu;
    }


    const anyUrdu =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith("ur")
        );


    if (anyUrdu) {
        return anyUrdu;
    }


    const urduName =
        voices.find(
            voice =>
                /urdu/i.test(
                    voice.name || ""
                )
        );


    if (urduName) {
        return urduName;
    }


    const hindi =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase() ===
                "hi-in"
        );


    if (hindi) {
        return hindi;
    }


    const anyHindi =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith("hi")
        );


    if (anyHindi) {
        return anyHindi;
    }


    const englishPK =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase() ===
                "en-pk"
        );


    if (englishPK) {
        return englishPK;
    }


    const englishIN =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase() ===
                "en-in"
        );


    if (englishIN) {
        return englishIN;
    }


    const english =
        voices.find(
            voice =>
                voice.lang
                    ?.toLowerCase()
                    .startsWith("en")
        );


    if (english) {
        return english;
    }


    return voices[0];

}


function waitForSpeechVoices(
    timeout = 2000
) {

    return new Promise(
        resolve => {

            const existing =
                chooseVoice();


            if (existing) {

                resolve(
                    existing
                );

                return;

            }


            let finished =
                false;


            const finish =
                () => {

                    if (finished) {
                        return;
                    }


                    finished =
                        true;


                    window.speechSynthesis
                        .removeEventListener(
                            "voiceschanged",
                            handleVoices
                        );


                    resolve(
                        chooseVoice()
                    );

                };


            const handleVoices =
                () => {

                    finish();

                };


            window.speechSynthesis
                .addEventListener(
                    "voiceschanged",
                    handleVoices
                );


            setTimeout(
                finish,
                timeout
            );

        }
    );

}


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


    const maxLength =
        SETTINGS.speechChunkSize;


    const chunks = [];

    let remaining =
        clean;


    while (
        remaining.length >
        maxLength
    ) {

        let cut =
            remaining.lastIndexOf(
                " ",
                maxLength
            );


        if (
            cut < 60
        ) {

            cut =
                remaining.lastIndexOf(
                    "۔",
                    maxLength
                );

        }


        if (
            cut < 60
        ) {

            cut =
                remaining.lastIndexOf(
                    ".",
                    maxLength
                );

        }


        if (
            cut < 60
        ) {

            cut =
                maxLength;

        }


        const chunk =
            remaining
                .slice(
                    0,
                    cut
                )
                .trim();


        if (chunk) {

            chunks.push(
                chunk
            );

        }


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


function getSpeechRate() {

    if (!listenSpeed) {
        return 1;
    }


    const value =
        Number(
            listenSpeed.value
        );


    if (
        !Number.isFinite(value)
    ) {

        return 1;

    }


    return Math.max(
        0.5,
        Math.min(
            2,
            value
        )
    );

}


async function startSpeech() {

    if (
        !speechSupported()
    ) {

        setStatus(
            "Read Aloud is not supported in this browser."
        );

        return;

    }


    if (!pdfDocument) {

        setStatus(
            "PDF is still loading..."
        );

        return;

    }


    const token =
        ++speechToken;


    try {

        window.speechSynthesis.cancel();

    } catch {}


    speechVoice =
        await waitForSpeechVoices();


    if (
        token !==
        speechToken
    ) {

        return;

    }


    if (!speechVoice) {

        speechMode =
            "stopped";

        updateSpeechUI();

        setStatus(
            "No speech voice is available."
        );

        return;

    }


    speechMode =
        "playing";


    speechPage =
        currentPage;


    speechChunks = [];

    speechChunkIndex = 0;

    speechChunkRetry = 0;


    updateSpeechUI();


    await startSpeechPage(
        speechPage,
        token
    );

}


async function startSpeechPage(
    pageNumber,
    token
) {

    if (
        token !==
        speechToken ||
        speechMode ===
            "stopped"
    ) {

        return;

    }


    if (
        pageNumber < 1 ||
        pageNumber > pageCount
    ) {

        stopSpeech();

        return;

    }


    speechPage =
        pageNumber;


    setStatus(
        `Reading page ${pageNumber} of ${pageCount}`
    );


    const text =
        await getPageText(
            pageNumber
        );


    if (
        token !==
        speechToken ||
        speechMode ===
            "stopped"
    ) {

        return;

    }


    speechChunks =
        splitSpeechText(
            text
        );


    speechChunkIndex =
        0;


    speechChunkRetry =
        0;


    /*
     * Image-only page.
     * Automatically continue.
     */

    if (
        !speechChunks.length
    ) {

        if (
            pageNumber <
            pageCount
        ) {

            await startSpeechPage(
                pageNumber + 1,
                token
            );

        } else {

            stopSpeech();

            setStatus(
                "Read Aloud finished."
            );

        }

        return;

    }


    speakNextChunk(
        token
    );

}


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

            startSpeechPage(
                speechPage + 1,
                token
            );

        } else {

            stopSpeech();

            setStatus(
                "Read Aloud finished."
            );

        }

        return;

    }


    const text =
        speechChunks[
            speechChunkIndex
        ];


    if (!text) {

        speechChunkIndex++;

        speakNextChunk(
            token
        );

        return;

    }


    if (!speechVoice) {

        speechVoice =
            chooseVoice();

    }


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    if (speechVoice) {

        utterance.voice =
            speechVoice;

        if (
            speechVoice.lang
        ) {

            utterance.lang =
                speechVoice.lang;

        }

    }


    utterance.rate =
        getSpeechRate();

    utterance.pitch =
        1;

    utterance.volume =
        1;


    utterance.onstart =
        () => {

            if (
                token !==
                speechToken
            ) {

                return;

            }


            speechChunkRetry =
                0;


            updateSpeechUI();

        };


    utterance.onend =
        () => {

            if (
                token !==
                speechToken
            ) {

                return;

            }


            if (
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
                token !==
                speechToken
            ) {

                return;

            }


            const error =
                event?.error ||
                "";


            if (
                error ===
                    "canceled" ||
                error ===
                    "interrupted"
            ) {

                return;

            }


            console.warn(
                "Speech error:",
                error
            );


            if (
                speechChunkRetry <
                1
            ) {

                speechChunkRetry++;


                setTimeout(
                    () => {

                        if (
                            token ===
                                speechToken &&
                            speechMode ===
                                "playing"
                        ) {

                            speakNextChunk(
                                token
                            );

                        }

                    },
                    150
                );


                return;

            }


            speechChunkRetry =
                0;


            speechChunkIndex++;


            speakNextChunk(
                token
            );

        };


    try {

        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            utterance
        );

    } catch (error) {

        console.error(
            "Speech start error:",
            error
        );


        speechChunkIndex++;


        speakNextChunk(
            token
        );

    }

}


function pauseSpeech() {

    if (
        !speechSupported()
    ) {

        return;

    }


    if (
        speechMode ===
        "playing"
    ) {

        window.speechSynthesis.pause();

        speechMode =
            "paused";

    } else if (
        speechMode ===
        "paused"
    ) {

        window.speechSynthesis.resume();

        speechMode =
            "playing";

    }


    updateSpeechUI();

}


function stopSpeech() {

    speechToken++;


    speechMode =
        "stopped";


    speechChunks = [];

    speechChunkIndex = 0;

    speechPage = 0;

    speechVoice = null;

    speechChunkRetry = 0;


    if (
        speechSupported()
    ) {

        try {

            window.speechSynthesis.cancel();

        } catch {}

    }


    updateSpeechUI();

}


function updateSpeechUI() {

    if (listenButton) {

        listenButton.disabled =
            !speechSupported();

    }


    if (pauseListenButton) {

        pauseListenButton.disabled =
            speechMode ===
            "stopped";


        pauseListenButton.textContent =
            speechMode ===
                "paused"
                ? "▶ Resume"
                : "⏸ Pause";

    }


    if (stopListenButton) {

        stopListenButton.disabled =
            speechMode ===
            "stopped";

    }

}


/* =========================================================
   SPEECH EVENTS
========================================================= */

if (listenButton) {

    listenButton.addEventListener(
        "click",
        () => {

            if (
                speechMode ===
                "paused"
            ) {

                pauseSpeech();

            } else {

                startSpeech();

            }

        }
    );

}


if (pauseListenButton) {

    pauseListenButton.addEventListener(
        "click",
        () => {

            pauseSpeech();

        }
    );

}


if (stopListenButton) {

    stopListenButton.addEventListener(
        "click",
        () => {

            stopSpeech();

            setStatus(
                `Page ${currentPage} of ${pageCount}`
            );

        }
    );

}


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


            const savedPage =
                speechPage ||
                currentPage;


            const token =
                ++speechToken;


            try {

                window.speechSynthesis.cancel();

            } catch {}


            speechMode =
                "playing";


            speechPage =
                savedPage;


            speechChunkIndex =
                0;


            speechChunkRetry =
                0;


            waitForSpeechVoices()
                .then(
                    voice => {

                        if (
                            token !==
                            speechToken
                        ) {

                            return;

                        }


                        speechVoice =
                            voice;


                        return startSpeechPage(
                            savedPage,
                            token
                        );

                    }
                );

        }
    );

}


/* =========================================================
   FULLSCREEN
========================================================= */

async function toggleFullscreen() {

    const readerApp =
        document.getElementById(
            "readerApp"
        );


    if (!readerApp) {
        return;
    }


    try {

        if (
            !document.fullscreenElement
        ) {

            await readerApp
                .requestFullscreen();

        } else {

            await document
                .exitFullscreen();

        }

    } catch (error) {

        console.error(
            "Fullscreen error:",
            error
        );

    }

}


/* =========================================================
   SHARE
========================================================= */

async function shareCurrentPage() {

    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "page",
        String(currentPage)
    );


    const title =
        getBookName();


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    `${title} | Chishti Library`,

                text:
                    `Read page ${currentPage} of ${title}`,

                url:
                    url.href

            });


            return;

        }


        if (
            navigator.clipboard
        ) {

            await navigator.clipboard
                .writeText(
                    url.href
                );

            setStatus(
                "Page link copied."
            );

        }

    } catch (error) {

        if (
            error?.name !==
            "AbortError"
        ) {

            console.warn(
                "Share failed:",
                error
            );

        }

    }

}


/* =========================================================
   CREATE WATERMARKED PDF
========================================================= */

async function createWatermarkedPDF() {

    if (!pdfDocument) {

        throw new Error(
            "PDF is not loaded."
        );

    }


    if (
        typeof PDFLib ===
        "undefined"
    ) {

        throw new Error(
            "pdf-lib is not loaded."
        );

    }


    const {
        PDFDocument,
        rgb,
        degrees,
        StandardFonts
    } = PDFLib;


    const response =
        await fetch(
            getPDFURL(),
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


    const sourceBytes =
        await response.arrayBuffer();


    const sourcePDF =
        await PDFDocument.load(
            sourceBytes
        );


    const font =
        await sourcePDF.embedFont(
            StandardFonts.Helvetica
        );


    const pages =
        sourcePDF.getPages();


    for (
        const page of pages
    ) {

        const {
            width,
            height
        } =
            page.getSize();


        const text =
            "ChishtiLibrary.com";


        const fontSize =
            Math.max(
                22,
                Math.min(
                    42,
                    Math.min(
                        width,
                        height
                    ) / 10
                )
            );


        const textWidth =
            font.widthOfTextAtSize(
                text,
                fontSize
            );


        const x =
            Math.max(
                20,
                (
                    width -
                    textWidth
                ) / 2
            );


        const y =
            Math.max(
                20,
                height / 2
            );


        page.drawText(
            text,
            {

                x,
                y,

                size:
                    fontSize,

                font,

                color:
                    rgb(
                        0.18,
                        0,
                        0
                    ),

                opacity:
                    0.22,

                rotate:
                    degrees(-32)

            }
        );

    }


    return sourcePDF.save();

}


/* =========================================================
   DOWNLOAD
========================================================= */

async function downloadPDF() {

    if (!rawBook) {
        return;
    }


    if (!pdfDocument) {

        setStatus(
            "PDF is still loading..."
        );

        return;

    }


    try {

        setStatus(
            "Preparing download..."
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


        const anchor =
            document.createElement(
                "a"
            );


        anchor.href =
            url;


        anchor.download =
            `${getBookName()}.pdf`;


        document.body.appendChild(
            anchor
        );


        anchor.click();


        anchor.remove();


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            5000
        );


        setStatus(
            "Download started."
        );


    } catch (error) {

        console.error(
            "Download error:",
            error
        );


        setStatus(
            "Download failed."
        );

    }

}


/* =========================================================
   PRINT
========================================================= */

async function printPDF() {

    try {

        setStatus(
            "Preparing print..."
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


        const printWindow =
            window.open(
                url,
                "_blank"
            );


        if (!printWindow) {

            URL.revokeObjectURL(
                url
            );


            setStatus(
                "Please allow pop-ups to print."
            );


            return;

        }


        setTimeout(
            () => {

                try {

                    printWindow.focus();

                    printWindow.print();

                } catch {}

            },
            1200
        );


        setTimeout(
            () => {

                URL.revokeObjectURL(
                    url
                );

            },
            60000
        );


    } catch (error) {

        console.error(
            "Print error:",
            error
        );


        setStatus(
            "Print failed."
        );

    }

}


/* =========================================================
   LOAD PDF
========================================================= */

async function loadPDF() {

    if (loadingPDF) {
        return;
    }


    const pdfURL =
        getPDFURL();


    if (!pdfURL) {

        showError(
            "No PDF was specified."
        );

        return;

    }


    loadingPDF =
        true;


    hideError();


    showLoading(
        "Loading PDF..."
    );


    setStatus(
        "Loading..."
    );


    stopSpeech();


    /*
     * Cancel any old render.
     */

    ++renderVersion;


    if (currentRenderTask) {

        try {

            currentRenderTask.cancel();

        } catch {}

        currentRenderTask =
            null;

    }


    /*
     * Destroy old loading task.
     */

    if (activeLoadingTask) {

        try {

            await activeLoadingTask.destroy();

        } catch {}

        activeLoadingTask =
            null;

    }


    /*
     * Destroy previous PDF.
     */

    if (pdfDocument) {

        try {

            await pdfDocument.destroy();

        } catch {}

        pdfDocument =
            null;

    }


    pageCache.clear();


    let loadingTask = null;


    try {

        loadingTask =
            pdfjsLib.getDocument({

                url:
                    pdfURL,

                rangeChunkSize:
                    1024 * 1024,

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

                if (!loadingText) {
                    return;
                }


                if (
                    progress &&
                    progress.total > 0
                ) {

                    const percent =
                        Math.round(
                            (
                                progress.loaded /
                                progress.total
                            ) * 100
                        );


                    loadingText.textContent =
                        `Loading PDF... ${percent}%`;

                } else {

                    loadingText.textContent =
                        "Loading PDF...";

                }

            };


        const loadedPDF =
            await loadingTask.promise;


        if (
            activeLoadingTask !==
            loadingTask
        ) {

            try {

                await loadedPDF.destroy();

            } catch {}

            return;

        }


        pdfDocument =
            loadedPDF;


        activeLoadingTask =
            null;


        pageCount =
            pdfDocument.numPages;


        if (
            pageCount < 1
        ) {

            throw new Error(
                "The PDF contains no pages."
            );

        }


        currentPage =
            Math.max(
                1,
                Math.min(
                    requestedPage,
                    pageCount
                )
            );


        /*
         * If URL does not specify a page,
         * restore bookmark.
         */

        if (
            !params.has("page")
        ) {

            const bookmark =
                loadBookmark();


            if (
                bookmark >= 1 &&
                bookmark <= pageCount
            ) {

                currentPage =
                    bookmark;

            }

        }


        zoom = 1;


        updateUI();


        setStatus(
            `Preparing page ${currentPage} of ${pageCount}...`
        );


        /*
         * Render first page.
         */

        const rendered =
            await renderPage(
                currentPage
            );


        if (!rendered) {

            /*
             * The real PDF.js error has already
             * been printed by renderPage().
             */

            throw new Error(
                "The first page could not be rendered."
            );

        }


        hideLoading();


        setStatus(
            `Page ${currentPage} of ${pageCount}`
        );


        updateUI();


    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        if (loadingTask) {

            try {

                await loadingTask.destroy();

            } catch {}

        }


        if (
            activeLoadingTask ===
            loadingTask
        ) {

            activeLoadingTask =
                null;

        }


        pdfDocument =
            null;


        pageCount =
            0;


        pageCache.clear();


        showError(
            error?.message ||
            "Unable to load PDF."
        );


        setStatus(
            "PDF loading failed."
        );


        updateUI();


    } finally {

        loadingPDF =
            false;


        if (
            activeLoadingTask ===
            loadingTask
        ) {

            activeLoadingTask =
                null;

        }

    }

}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        () => {

            loadPDF();

        }
    );

}


/* =========================================================
   BUTTON EVENTS
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


if (pageNumberInput) {

    pageNumberInput.addEventListener(
        "change",
        handlePageInput
    );


    pageNumberInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                handlePageInput();

                pageNumberInput.blur();

            }

        }
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


if (zoomInButton) {

    zoomInButton.addEventListener(
        "click",
        zoomIn
    );

}


if (bookmarkBtn) {

    bookmarkBtn.addEventListener(
        "click",
        toggleBookmark
    );

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        toggleTheme
    );

}


if (fullscreenButton) {

    fullscreenButton.addEventListener(
        "click",
        toggleFullscreen
    );

}


if (shareBtn) {

    shareBtn.addEventListener(
        "click",
        shareCurrentPage
    );

}


if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        downloadPDF
    );

}


if (printButton) {

    printButton.addEventListener(
        "click",
        printPDF
    );

}


/* =========================================================
   FULLSCREEN CHANGE
========================================================= */

document.addEventListener(
    "fullscreenchange",
    () => {

        if (!fullscreenButton) {
            return;
        }


        fullscreenButton.classList.toggle(
            "active",
            Boolean(
                document.fullscreenElement
            )
        );

    }
);


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
                            currentPage
                        ).then(
                            () => {

                                updateUI();

                            }
                        );

                    }

                },
                150
            );

    }
);


/* =========================================================
   SPEECH VOICES
========================================================= */

if (
    speechSupported()
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                if (!speechVoice) {

                    speechVoice =
                        chooseVoice();

                }


                updateSpeechUI();

            }
        );

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
   STARTUP
========================================================= */

loadTheme();

setBookTitle();

updateUI();

loadPDF();
