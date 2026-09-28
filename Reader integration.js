/* =========================================================
   CHISHTI AI → CHISHTI READER INTEGRATION
========================================================= */

(function () {
    "use strict";

    function log(...args) {
        console.log("[Chishti Reader]", ...args);
    }

    function getReader() {
        return window.chishtiReader || null;
    }

    function executeReaderAction(action) {

        if (!action) {
            return false;
        }

        const reader = getReader();

        if (!reader) {
            console.warn(
                "[Chishti Reader] Reader API not ready."
            );
            return false;
        }

        /*
         * Server returns:
         *
         * {
         *   type: "reader_action",
         *   action: "next_page"
         * }
         */

        const command =
            typeof action === "string"
                ? action
                : action.action || action.type || "";

        log("Executing:", command);

        switch (command) {

            /* =========================
               PAGE NAVIGATION
            ========================= */

            case "next_page":
            case "nextPage":

                reader.nextPage();
                return true;


            case "previous_page":
            case "previousPage":

                reader.previousPage();
                return true;


            case "go_to_page":
            case "goToPage":
            case "page":

                if (
                    typeof action === "object" &&
                    action.page != null
                ) {
                    reader.goToPage(
                        Number(action.page)
                    );
                    return true;
                }

                return false;


            /* =========================
               ZOOM
            ========================= */

            case "zoom_in":
            case "zoomIn":

                reader.zoomIn();
                return true;


            case "zoom_out":
            case "zoomOut":

                reader.zoomOut();
                return true;


            case "reset_zoom":
            case "resetZoom":

                reader.resetZoom();
                return true;


            /* =========================
               FULLSCREEN
            ========================= */

            case "fullscreen":
            case "toggleFullscreen":

                reader.toggleFullscreen();
                return true;


            /* =========================
               READ ALOUD
            ========================= */

            case "listen":
            case "read_aloud":
            case "readAloud":

                document
                    .getElementById("listenButton")
                    ?.click();

                return true;


            case "stop_listen":
            case "stopReading":
            case "stopSpeech":

                reader.stopSpeech();
                return true;


            case "pause_listen":
            case "pauseReading":

                document
                    .getElementById(
                        "pauseListenButton"
                    )
                    ?.click();

                return true;


            /* =========================
               OPEN BOOK
            ========================= */

            case "open_book":

                if (
                    typeof action === "object" &&
                    action.book
                ) {

                    const book =
                        action.book;

                    if (book.pdf) {

                        const url =
                            new URL(
                                "reader.html",
                                window.location.href
                            );

                        url.searchParams.set(
                            "pdf",
                            book.pdf
                        );

                        if (book.title) {
                            url.searchParams.set(
                                "title",
                                book.title
                            );
                        }

                        window.location.href =
                            url.href;

                        return true;
                    }
                }

                return false;


            default:

                console.warn(
                    "[Chishti Reader] Unknown action:",
                    action
                );

                return false;
        }
    }


    /* =====================================================
       RECEIVE ACTIONS FROM CHISHTI AI
    ===================================================== */

    window.addEventListener(
        "chishtiAIReaderCommand",
        event => {

            const action =
                event.detail;

            executeReaderAction(action);

        }
    );


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.ChishtiReaderIntegration = {

        execute: executeReaderAction,

        nextPage: () =>
            executeReaderAction("next_page"),

        previousPage: () =>
            executeReaderAction("previous_page"),

        zoomIn: () =>
            executeReaderAction("zoom_in"),

        zoomOut: () =>
            executeReaderAction("zoom_out"),

        resetZoom: () =>
            executeReaderAction("reset_zoom"),

        fullscreen: () =>
            executeReaderAction("fullscreen"),

        listen: () =>
            executeReaderAction("listen"),

        stopListening: () =>
            executeReaderAction("stop_listen")
    };


    log(
        "AI Reader integration loaded."
    );

})();
