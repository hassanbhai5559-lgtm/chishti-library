/* =========================================================
   CHISHTI AI — READER INTEGRATION
   Connects Chishti AI with Chishti PDF Reader
   ========================================================= */

(function () {
    "use strict";

    const DEBUG = true;

    function log(...args) {
        if (DEBUG) {
            console.log("[Chishti Reader]", ...args);
        }
    }

    /* ---------------------------------------------------------
       Check Reader API
       --------------------------------------------------------- */

    function getReader() {
        if (!window.chishtiReader) {
            log("Reader API is not available yet.");
            return null;
        }

        return window.chishtiReader;
    }

    /* ---------------------------------------------------------
       Reader Commands
       --------------------------------------------------------- */

    function nextPage() {
        const reader = getReader();
        if (!reader) return false;

        reader.nextPage();
        return true;
    }

    function previousPage() {
        const reader = getReader();
        if (!reader) return false;

        reader.previousPage();
        return true;
    }

    function goToPage(page) {
        const reader = getReader();
        if (!reader) return false;

        const pageNumber = Number(page);

        if (!Number.isInteger(pageNumber) || pageNumber < 1) {
            return false;
        }

        reader.goToPage(pageNumber);
        return true;
    }

    function zoomIn() {
        const reader = getReader();
        if (!reader) return false;

        reader.zoomIn();
        return true;
    }

    function zoomOut() {
        const reader = getReader();
        if (!reader) return false;

        reader.zoomOut();
        return true;
    }

    function resetZoom() {
        const reader = getReader();
        if (!reader) return false;

        reader.resetZoom();
        return true;
    }

    function fullscreen() {
        const reader = getReader();
        if (!reader) return false;

        reader.toggleFullscreen();
        return true;
    }

    function stopReading() {
        const reader = getReader();
        if (!reader) return false;

        reader.stopSpeech();
        return true;
    }

    /* ---------------------------------------------------------
       Read Aloud
       --------------------------------------------------------- */

    function startReading() {
        /*
         * Your existing reader.js controls speech through
         * the Listen button.
         *
         * We trigger the real button instead of duplicating
         * the speech engine here.
         */

        const button =
            document.getElementById("listenButton");

        if (!button) {
            log("listenButton not found.");
            return false;
        }

        button.click();
        return true;
    }

    function pauseReading() {
        const button =
            document.getElementById("pauseListenButton");

        if (!button) {
            log("pauseListenButton not found.");
            return false;
        }

        button.click();
        return true;
    }

    /* ---------------------------------------------------------
       Reader State
       --------------------------------------------------------- */

    function getReaderState() {
        const reader = getReader();

        if (!reader) {
            return {
                ready: false
            };
        }

        return {
            ready: true,
            currentPage: reader.currentPage,
            pageCount: reader.pageCount,
            zoom: reader.zoom
        };
    }

    /* ---------------------------------------------------------
       Natural Language Command Parser
       --------------------------------------------------------- */

    function executeCommand(command) {

        if (!command || typeof command !== "string") {
            return {
                success: false,
                message: "No command received."
            };
        }

        const text = command
            .toLowerCase()
            .trim();

        log("Command:", text);

        /* NEXT PAGE */

        if (
            text.includes("next page") ||
            text.includes("next") ||
            text.includes("agla page") ||
            text.includes("aglay page") ||
            text.includes("اگلا صفحہ")
        ) {
            return {
                success: nextPage(),
                message: "Next page"
            };
        }

        /* PREVIOUS PAGE */

        if (
            text.includes("previous page") ||
            text.includes("prev page") ||
            text.includes("previous") ||
            text.includes("pichla page") ||
            text.includes("pichlay page") ||
            text.includes("پچھلا صفحہ")
        ) {
            return {
                success: previousPage(),
                message: "Previous page"
            };
        }

        /* PAGE NUMBER */

        const pageMatch = text.match(
            /(?:page|صفحہ)\s*(?:number\s*)?(\d+)/
        );

        if (pageMatch) {

            const page = Number(pageMatch[1]);

            return {
                success: goToPage(page),
                message: `Going to page ${page}`
            };
        }

        /* ROMAN URDU PAGE */

        const romanPageMatch = text.match(
            /page\s*(\d+)/
        );

        if (romanPageMatch) {

            const page = Number(romanPageMatch[1]);

            return {
                success: goToPage(page),
                message: `Going to page ${page}`
            };
        }

        /* ZOOM IN */

        if (
            text.includes("zoom in") ||
            text.includes("zoom karo") ||
            text.includes("bara karo") ||
            text.includes("بڑا کرو")
        ) {
            return {
                success: zoomIn(),
                message: "Zooming in"
            };
        }

        /* ZOOM OUT */

        if (
            text.includes("zoom out") ||
            text.includes("chota karo") ||
            text.includes("چھوٹا کرو")
        ) {
            return {
                success: zoomOut(),
                message: "Zooming out"
            };
        }

        /* RESET ZOOM */

        if (
            text.includes("reset zoom") ||
            text.includes("normal zoom") ||
            text.includes("zoom reset")
        ) {
            return {
                success: resetZoom(),
                message: "Zoom reset"
            };
        }

        /* FULLSCREEN */

        if (
            text.includes("fullscreen") ||
            text.includes("full screen") ||
            text.includes("پورا سکرین")
        ) {
            return {
                success: fullscreen(),
                message: "Fullscreen"
            };
        }

        /* START READING */

        if (
            text.includes("read aloud") ||
            text.includes("start reading") ||
            text.includes("listen") ||
            text.includes("parho") ||
            text.includes("parhna shuru") ||
            text.includes("پڑھو")
        ) {
            return {
                success: startReading(),
                message: "Reading started"
            };
        }

        /* PAUSE */

        if (
            text.includes("pause reading") ||
            text.includes("pause") ||
            text.includes("reading pause")
        ) {
            return {
                success: pauseReading(),
                message: "Reading paused"
            };
        }

        /* STOP */

        if (
            text.includes("stop reading") ||
            text.includes("stop") ||
            text.includes("parhna band") ||
            text.includes("پڑھنا بند")
        ) {
            return {
                success: stopReading(),
                message: "Reading stopped"
            };
        }

        /* CURRENT PAGE */

        if (
            text.includes("current page") ||
            text.includes("which page") ||
            text.includes("kon sa page") ||
            text.includes("kis page")
        ) {

            const state = getReaderState();

            if (!state.ready) {
                return {
                    success: false,
                    message: "Reader is not ready."
                };
            }

            return {
                success: true,
                message:
                    `You are on page ${state.currentPage} of ${state.pageCount}.`,
                data: state
            };
        }

        /* PAGE COUNT */

        if (
            text.includes("total pages") ||
            text.includes("kitne pages") ||
            text.includes("total page")
        ) {

            const state = getReaderState();

            if (!state.ready) {
                return {
                    success: false,
                    message: "Reader is not ready."
                };
            }

            return {
                success: true,
                message:
                    `This book has ${state.pageCount} pages.`,
                data: state
            };
        }

        /* UNKNOWN */

        return {
            success: false,
            message: "Reader command not recognized."
        };
    }

    /* ---------------------------------------------------------
       Public API
       --------------------------------------------------------- */

    window.ChishtiReaderIntegration = {

        nextPage,
        previousPage,
        goToPage,

        zoomIn,
        zoomOut,
        resetZoom,

        fullscreen,

        startReading,
        pauseReading,
        stopReading,

        getReaderState,

        executeCommand

    };

    log("Reader integration loaded.");

})();
