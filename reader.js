/* =========================================================
   CHISHTI READER
   reader.js
   Simple + Fast PDF Reader
   ========================================================= */

import * as pdfjsLib from
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";


/* =========================================================
   PDF.js WORKER
   ========================================================= */

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const PDF_URL = "./book.pdf";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.1;

const DEFAULT_ZOOM = 1;


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const readerApp =
    document.getElementById("readerApp");

const loadingScreen =
    document.getElementById("loadingScreen");

const loadingText =
    document.getElementById("loadingText");

const loadingProgress =
    document.getElementById("loadingProgress");

const bookTitle =
    document.getElementById("bookTitle");

const bookContainer =
    document.getElementById("bookContainer");

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

const zoomInButton =
    document.getElementById("zoomInButton");

const zoomOutButton =
    document.getElementById("zoomOutButton");

const resetZoomButton =
    document.getElementById("resetZoomButton");

const zoomLevel =
    document.getElementById("zoomLevel");

const readerStatus =
    document.getElementById("readerStatus");


/* =========================================================
   READER STATE
   ========================================================= */

let pdfDocument = null;

let currentPage = 1;

let totalPageCount = 0;

let zoom = DEFAULT_ZOOM;

let rendering = false;

let pendingPage = null;

let renderToken = 0;


/* =========================================================
   CANVAS
   ========================================================= */

const canvasContext =
    pdfCanvas.getContext("2d", {
        alpha: false
    });


/* =========================================================
   UPDATE LOADING
   ========================================================= */

function updateLoading(
    message,
    percent
) {

    loadingText.textContent =
        message;

    loadingProgress.textContent =
        `${Math.round(percent)}%`;
}


/* =========================================================
   SHOW LOADING
   ========================================================= */

function showLoading() {

    loadingScreen.classList.remove(
        "hidden"
    );
}


/* =========================================================
   HIDE LOADING
   ========================================================= */

function hideLoading() {

    loadingScreen.classList.add(
        "hidden"
    );
}


/* =========================================================
   READER STATUS
   ========================================================= */

function announce(message) {

    readerStatus.textContent =
        message;
}


/* =========================================================
   UPDATE PAGE UI
   ========================================================= */

function updatePageUI() {

    pageNumberInput.value =
        currentPage;

    totalPages.textContent =
        totalPageCount;

    previousPageButton.disabled =
        currentPage <= 1;

    nextPageButton.disabled =
        currentPage >= totalPageCount;

    zoomLevel.textContent =
        `${Math.round(zoom * 100)}%`;
}


/* =========================================================
   UPDATE BUTTON STATE
   ========================================================= */

function updateButtonState() {

    previousPageButton.disabled =
        rendering ||
        currentPage <= 1;

    nextPageButton.disabled =
        rendering ||
        currentPage >= totalPageCount;
}


/* =========================================================
   RENDER PAGE
   ========================================================= */

async function renderPage(
    pageNumber,
    animate = false
) {

    if (!pdfDocument) {
        return;
    }

    if (
        pageNumber < 1 ||
        pageNumber > totalPageCount
    ) {
        return;
    }


    /*
     * If another page is currently rendering,
     * remember the latest requested page.
     */

    if (rendering) {

        pendingPage =
            pageNumber;

        return;
    }


    rendering = true;

    updateButtonState();


    const localToken =
        ++renderToken;


    try {

        const page =
            await pdfDocument.getPage(
                pageNumber
            );


        if (localToken !== renderToken) {
            return;
        }


        /*
         * PDF.js calculates the correct page
         * size from the original PDF.
         */

        const baseViewport =
            page.getViewport({
                scale: 1
            });


        /*
         * Fit the page into the available reader
         * area while respecting the user's zoom.
         */

        const availableWidth =
            Math.max(
                250,
                bookContainer.clientWidth - 45
            );

        const availableHeight =
            Math.max(
                250,
                bookContainer.clientHeight - 45
            );


        const fitScale =
            Math.min(
                availableWidth /
                    baseViewport.width,

                availableHeight /
                    baseViewport.height
            );


        /*
         * Prevent extremely small pages.
         */

        const finalScale =
            Math.max(
                0.25,
                fitScale * zoom
            );


        const viewport =
            page.getViewport({
                scale: finalScale
            });


        /*
         * High-DPI rendering.
         * This keeps text sharp on Retina/mobile screens.
         */

        const devicePixelRatio =
            Math.min(
                window.devicePixelRatio || 1,
                2
            );


        pdfCanvas.width =
            Math.floor(
                viewport.width *
                devicePixelRatio
            );

        pdfCanvas.height =
            Math.floor(
                viewport.height *
                devicePixelRatio
            );


        pdfCanvas.style.width =
            `${viewport.width}px`;

        pdfCanvas.style.height =
            `${viewport.height}px`;


        pageWrapper.style.width =
            `${viewport.width}px`;

        pageWrapper.style.height =
            `${viewport.height}px`;


        canvasContext.setTransform(
            devicePixelRatio,
            0,
            0,
            devicePixelRatio,
            0,
            0
        );


        canvasContext.fillStyle =
            "#ffffff";

        canvasContext.fillRect(
            0,
            0,
            viewport.width,
            viewport.height
        );


        await page.render({
            canvasContext,
            viewport
        }).promise;


        if (localToken !== renderToken) {
            return;
        }


        currentPage =
            pageNumber;


        updatePageUI();


        announce(
            `Page ${currentPage} of ${totalPageCount}`
        );


        /*
         * Optional lightweight page transition.
         */

        if (animate) {

            pageWrapper.animate(
                [
                    {
                        opacity: 0.72,
                        transform:
                            "translateY(4px)"
                    },
                    {
                        opacity: 1,
                        transform:
                            "translateY(0)"
                    }
                ],
                {
                    duration: 180,
                    easing:
                        "ease-out"
                }
            );
        }

    } catch (error) {

        console.error(
            "PDF page render error:",
            error
        );

        announce(
            "Unable to render this page."
        );

    } finally {

        rendering = false;

        updateButtonState();


        /*
         * If user clicked several times while
         * rendering, render only the latest page.
         */

        if (pendingPage !== null) {

            const nextRequestedPage =
                pendingPage;

            pendingPage =
                null;

            if (
                nextRequestedPage !==
                currentPage
            ) {

                renderPage(
                    nextRequestedPage,
                    true
                );
            }
        }
    }
}


/* =========================================================
   GO TO PAGE
   ========================================================= */

function goToPage(pageNumber) {

    if (!pdfDocument) {
        return;
    }


    let target =
        Number(pageNumber);


    if (!Number.isFinite(target)) {

        target =
            currentPage;
    }


    target =
        Math.trunc(target);


    target =
        Math.max(
            1,
            Math.min(
                target,
                totalPageCount
            )
        );


    renderPage(
        target,
        target !== currentPage
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
        currentPage >= totalPageCount
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


    updatePageUI();

    renderPage(
        currentPage
    );
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


    updatePageUI();

    renderPage(
        currentPage
    );
}


/* =========================================================
   RESET ZOOM
   ========================================================= */

function resetZoom() {

    zoom =
        DEFAULT_ZOOM;


    updatePageUI();

    renderPage(
        currentPage
    );
}


/* =========================================================
   PDF LOADING
   ========================================================= */

async function loadPDF() {

    showLoading();

    updateLoading(
        "Loading book...",
        0
    );


    try {

        /*
         * Change the title here if required.
         */

        bookTitle.textContent =
            "Chishti Digital Book";


        updateLoading(
            "Preparing PDF...",
            10
        );


        const loadingTask =
            pdfjsLib.getDocument({
                url: PDF_URL,

                /*
                 * Keep PDF.js networking efficient.
                 */

                disableAutoFetch: false,

                disableStream: false,

                rangeChunkSize:
                    65536
            });


        /*
         * Real PDF loading progress.
         */

        loadingTask.onProgress =
            function(progress) {

                if (
                    progress &&
                    progress.total
                ) {

                    const percent =
                        Math.min(
                            90,
                            (
                                progress.loaded /
                                progress.total
                            ) * 80 + 10
                        );


                    updateLoading(
                        "Loading book...",
                        percent
                    );
                }
            };


        pdfDocument =
            await loadingTask.promise;


        totalPageCount =
            pdfDocument.numPages;


        totalPages.textContent =
            totalPageCount;


        updateLoading(
            "Preparing first page...",
            94
        );


        /*
         * Render only the first page initially.
         * This makes opening much faster.
         */

        await renderPage(
            1,
            false
        );


        updateLoading(
            "Ready",
            100
        );


        /*
         * Small delay so the completed loading
         * state feels smooth instead of flashing.
         */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    120
                )
        );


        hideLoading();


        announce(
            `Book loaded. Page 1 of ${totalPageCount}.`
        );

    } catch (error) {

        console.error(
            "PDF loading error:",
            error
        );


        loadingText.textContent =
            "Unable to load book";


        loadingProgress.textContent =
            "";


        announce(
            "The PDF could not be loaded."
        );


        /*
         * Keep the error visible so the user
         * knows that loading actually failed.
         */

        loadingScreen.classList.remove(
            "hidden"
        );
    }
}


/* =========================================================
   PAGE INPUT
   ========================================================= */

pageNumberInput.addEventListener(
    "change",
    function() {

        goToPage(
            this.value
        );
    }
);


pageNumberInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            goToPage(
                this.value
            );

            this.blur();
        }
    }
);


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

previousPageButton.addEventListener(
    "click",
    previousPage
);


nextPageButton.addEventListener(
    "click",
    nextPage
);


zoomInButton.addEventListener(
    "click",
    zoomIn
);


zoomOutButton.addEventListener(
    "click",
    zoomOut
);


resetZoomButton.addEventListener(
    "click",
    resetZoom
);


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        /*
         * Do not capture keyboard shortcuts
         * while typing in an input.
         */

        const activeElement =
            document.activeElement;

        const isTyping =
            activeElement &&
            (
                activeElement.tagName ===
                    "INPUT" ||

                activeElement.tagName ===
                    "TEXTAREA" ||

                activeElement.isContentEditable
            );


        if (isTyping) {

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

                goToPage(
                    totalPageCount
                );

                break;
        }
    }
);


/* =========================================================
   RESIZE
   ========================================================= */

let resizeTimer = null;


window.addEventListener(
    "resize",
    function() {

        clearTimeout(
            resizeTimer
        );


        resizeTimer =
            setTimeout(
                function() {

                    if (pdfDocument) {

                        renderPage(
                            currentPage
                        );
                    }

                },
                120
            );
    }
);


/* =========================================================
   START READER
   ========================================================= */

loadPDF();
