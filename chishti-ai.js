/* =========================================================
   CHISHTI AI FRONTEND
========================================================= */

const CHISHTI_AI_API =
    "https://YOUR-BACKEND-DOMAIN.com/api/chat";

const aiButton =
    document.getElementById("chishtiAIButton");

const aiPanel =
    document.getElementById("chishtiAI");

const aiClose =
    document.getElementById("chishtiAIClose");

const aiMessages =
    document.getElementById("chishtiAIMessages");

const aiInput =
    document.getElementById("chishtiAIInput");

const aiSend =
    document.getElementById("chishtiAISend");

let previousResponseId = null;


/* =========================================================
   OPEN / CLOSE
========================================================= */

aiButton?.addEventListener("click", () => {

    aiPanel.classList.add("open");

    aiInput?.focus();

});

aiClose?.addEventListener("click", () => {

    aiPanel.classList.remove("open");

});


/* =========================================================
   MESSAGE UI
========================================================= */

function addUserMessage(text) {

    const div =
        document.createElement("div");

    div.className =
        "user-message";

    div.textContent =
        text;

    aiMessages.appendChild(div);

    scrollMessages();
}


function addAIMessage(text) {

    const div =
        document.createElement("div");

    div.className =
        "ai-message";

    const strong =
        document.createElement("strong");

    strong.textContent =
        "Chishti AI";

    const p =
        document.createElement("p");

    p.textContent =
        text;

    div.appendChild(strong);
    div.appendChild(p);

    aiMessages.appendChild(div);

    scrollMessages();
}


function addLoading() {

    const div =
        document.createElement("div");

    div.id =
        "chishtiAILoading";

    div.className =
        "ai-message chishti-ai-loading";

    div.textContent =
        "Chishti AI is thinking...";

    aiMessages.appendChild(div);

    scrollMessages();
}


function removeLoading() {

    document
        .getElementById("chishtiAILoading")
        ?.remove();
}


function scrollMessages() {

    aiMessages.scrollTop =
        aiMessages.scrollHeight;
}


/* =========================================================
   READER ACTIONS
========================================================= */

function executeReaderAction(action) {

    if (!action) {
        return;
    }

    /*
     * These custom events let Chishti AI communicate
     * with your existing reader.js.
     */

    window.dispatchEvent(
        new CustomEvent(
            "chishtiAIReaderCommand",
            {
                detail: action
            }
        )
    );
}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage(text) {

    text =
        String(text || "").trim();

    if (!text) {
        return;
    }

    addUserMessage(text);

    aiInput.value = "";

    addLoading();

    aiSend.disabled = true;

    try {

        const response =
            await fetch(
                CHISHTI_AI_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: text,

                        previousResponseId
                    })
                }
            );

        const data =
            await response.json();

        removeLoading();

        if (!response.ok || !data.ok) {

            throw new Error(
                data.error ||
                "AI request failed"
            );
        }

        previousResponseId =
            data.responseId ||
            previousResponseId;

        /*
         * Execute browser-side actions.
         */

        if (
            Array.isArray(data.actions)
        ) {

            for (
                const action
                of data.actions
            ) {

                executeReaderAction(
                    action
                );
            }
        }

        addAIMessage(
            data.answer ||
            "I could not generate a response."
        );

    } catch (error) {

        console.error(
            "Chishti AI:",
            error
        );

        removeLoading();

        addAIMessage(
            "Sorry, Chishti AI is temporarily unavailable."
        );

    } finally {

        aiSend.disabled = false;

        aiInput.focus();
    }
}


/* =========================================================
   SEND BUTTON
========================================================= */

aiSend?.addEventListener(
    "click",
    () => {

        sendMessage(
            aiInput.value
        );

    }
);


/* =========================================================
   ENTER KEY
========================================================= */

aiInput?.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage(
                aiInput.value
            );
        }
    }
);


/* =========================================================
   QUICK QUESTIONS
========================================================= */

document
    .querySelectorAll(
        ".chishti-ai-suggestions button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                sendMessage(
                    button.dataset.question
                );

            }
        );

    });
