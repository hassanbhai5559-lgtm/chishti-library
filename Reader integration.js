/* =========================================================
   CHISHTI AI → READER BRIDGE
========================================================= */

window.addEventListener(
    "chishtiAIReaderCommand",
    async event => {

        const data =
            event.detail;

        if (!data) {
            return;
        }

        console.log(
            "Chishti AI Reader Action:",
            data
        );

        if (
            data.type ===
            "reader_action"
        ) {

            const action =
                data.action;

            switch (action) {

                case "next_page":

                    if (
                        typeof nextPage ===
                        "function"
                    ) {
                        await nextPage();
                    }

                    break;


                case "previous_page":

                    if (
                        typeof previousPage ===
                        "function"
                    ) {
                        await previousPage();
                    }

                    break;


                case "zoom_in":

                    if (
                        typeof zoomIn ===
                        "function"
                    ) {
                        zoomIn();
                    }

                    break;


                case "zoom_out":

                    if (
                        typeof zoomOut ===
                        "function"
                    ) {
                        zoomOut();
                    }

                    break;


                case "reset_zoom":

                    if (
                        typeof resetZoom ===
                        "function"
                    ) {
                        resetZoom();
                    }

                    break;


                case "fullscreen":

                    if (
                        typeof toggleFullscreen ===
                        "function"
                    ) {
                        toggleFullscreen();
                    }

                    break;


                case "print":

                    if (
                        typeof printPDF ===
                        "function"
                    ) {
                        printPDF();
                    }

                    break;


                case "download":

                    if (
                        typeof downloadPDF ===
                        "function"
                    ) {
                        downloadPDF();
                    }

                    break;


                case "listen":

                    if (
                        typeof startSpeech ===
                        "function"
                    ) {
                        startSpeech();
                    }

                    break;


                case "stop_listen":

                    if (
                        typeof stopSpeech ===
                        "function"
                    ) {
                        stopSpeech();
                    }

                    break;


                case "open_book":

                    if (
                        data.book
                    ) {

                        /*
                         * Change this function name
                         * to your actual book-opening
                         * function if different.
                         */

                        if (
                            typeof openBook ===
                            "function"
                        ) {

                            openBook(
                                data.book
                            );
                        }
                    }

                    break;
            }
        }
    }
);
