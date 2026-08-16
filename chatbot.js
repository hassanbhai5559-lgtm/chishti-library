"use strict";

/*
===========================================================
        CHISHTI AI — COMPLETE CHATBOT.JS
        Chishti Library
===========================================================

FILES USED:

./knowledge.json
./books.json        optional

FEATURES:

✅ Knowledge JSON connection
✅ English questions
✅ Roman Urdu questions
✅ Urdu text questions
✅ Keyword matching
✅ Exact question matching
✅ Book search
✅ Book recommendations
✅ Read Online button
✅ Download button
✅ Typing indicator
✅ Chat history
✅ Clear chat
✅ Enter to send
✅ Mobile friendly
✅ Works on GitHub Pages
===========================================================
*/


/* =========================================================
   CONFIGURATION
========================================================= */

const CHISHTI_AI_CONFIG = {

    knowledgeFile: "./knowledge.json",

    booksFile: "./books.json",

    readerPage: "./reader.html",

    storageKey: "chishti_ai_chat_history",

    maxHistory: 50

};


/* =========================================================
   GLOBAL DATA
========================================================= */

let chishtiKnowledge = [];

let chishtiBooks = [];

let knowledgeLoaded = false;

let booksLoaded = false;


/* =========================================================
   COMMON ELEMENTS
========================================================= */

let chatbotButton = null;

let chatbotWindow = null;

let chatMessages = null;

let chatInput = null;

let chatSend = null;

let chatClose = null;

let chatClear = null;


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    startChishtiAI
);


async function startChishtiAI() {

    console.log(
        "===================================="
    );

    console.log(
        "🤖 CHISHTI AI"
    );

    console.log(
        "===================================="
    );


    createChatbotUI();


    await Promise.all([

        loadKnowledge(),

        loadBooks()

    ]);


    loadChatHistory();


    if (!chatMessages || chatMessages.children.length === 0) {

        showWelcomeMessage();

    }


    console.log(
        "===================================="
    );

    console.log(
        "✅ CHISHTI AI READY"
    );

    console.log(
        "📚 Knowledge:",
        chishtiKnowledge.length
    );

    console.log(
        "📖 Books:",
        chishtiBooks.length
    );

    console.log(
        "===================================="
    );

}


/* =========================================================
   LOAD KNOWLEDGE.JSON
========================================================= */

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                CHISHTI_AI_CONFIG.knowledgeFile,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "knowledge.json must contain an array"
            );

        }


        chishtiKnowledge = data;

        knowledgeLoaded = true;


        console.log(
            "✅ Knowledge loaded:",
            chishtiKnowledge.length
        );


    } catch (error) {

        knowledgeLoaded = false;


        console.error(
            "❌ Knowledge loading error:",
            error
        );

    }

}


/* =========================================================
   LOAD BOOKS.JSON
========================================================= */

async function loadBooks() {

    try {

        const response =
            await fetch(
                CHISHTI_AI_CONFIG.booksFile,
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "books.json must contain an array"
            );

        }


        chishtiBooks = data;

        booksLoaded = true;


        console.log(
            "✅ Books loaded:",
            chishtiBooks.length
        );


    } catch (error) {

        booksLoaded = false;


        console.warn(
            "⚠️ books.json not loaded.",
            "Book search will use page data if available."
        );


        /*
        If books.js has a global books array,
        use it as fallback.
        */

        if (
            Array.isArray(
                window.books
            )
        ) {

            chishtiBooks =
                window.books;

            booksLoaded = true;


            console.log(
                "✅ Books loaded from window.books:",
                chishtiBooks.length
            );

        }

    }

}


/* =========================================================
   CREATE CHATBOT UI
========================================================= */

function createChatbotUI() {

    /*
    If chatbot already exists in HTML,
    use existing elements.
    */

    chatbotButton =
        document.getElementById(
            "chishtiAIButton"
        );


    chatbotWindow =
        document.getElementById(
            "chishtiAIWindow"
        );


    chatMessages =
        document.getElementById(
            "chishtiAIMessages"
        );


    chatInput =
        document.getElementById(
            "chishtiAIInput"
        );


    chatSend =
        document.getElementById(
            "chishtiAISend"
        );


    chatClose =
        document.getElementById(
            "chishtiAIClose"
        );


    chatClear =
        document.getElementById(
            "chishtiAIClear"
        );


    /*
    If HTML doesn't contain chatbot,
    create complete UI automatically.
    */

    if (!chatbotButton) {

        createAutomaticChatbot();

    }


    attachChatEvents();

}


/* =========================================================
   AUTOMATIC CHATBOT UI
========================================================= */

function createAutomaticChatbot() {

    /*
    FLOATING BUTTON
    */

    chatbotButton =
        document.createElement(
            "button"
        );


    chatbotButton.id =
        "chishtiAIButton";


    chatbotButton.type =
        "button";


    chatbotButton.setAttribute(
        "aria-label",
        "Open Chishti AI"
    );


    chatbotButton.innerHTML = `
        <span>🤖</span>
        <span>Chishti AI</span>
    `;


    chatbotButton.style.cssText = `

        position:fixed;
        right:20px;
        bottom:20px;
        z-index:99999;

        border:none;
        border-radius:50px;

        padding:14px 20px;

        background:#8b0000;
        color:#ffffff;

        font-family:Poppins,Arial,sans-serif;
        font-size:15px;
        font-weight:700;

        cursor:pointer;

        box-shadow:
            0 8px 30px rgba(0,0,0,.35);

    `;


    document.body.appendChild(
        chatbotButton
    );


    /*
    CHAT WINDOW
    */

    chatbotWindow =
        document.createElement(
            "div"
        );


    chatbotWindow.id =
        "chishtiAIWindow";


    chatbotWindow.style.cssText = `

        position:fixed;

        right:20px;
        bottom:85px;

        width:380px;
        max-width:calc(100vw - 30px);

        height:560px;
        max-height:calc(100vh - 110px);

        z-index:99998;

        display:none;

        flex-direction:column;

        overflow:hidden;

        background:#111111;

        border:
            1px solid rgba(212,175,55,.45);

        border-radius:20px;

        box-shadow:
            0 20px 70px rgba(0,0,0,.55);

        font-family:
            Poppins,Arial,sans-serif;

    `;


    /*
    HEADER
    */

    const header =
        document.createElement(
            "div"
        );


    header.style.cssText = `

        display:flex;
        align-items:center;
        justify-content:space-between;

        padding:15px 18px;

        background:#8b0000;

        color:#ffffff;

    `;


    header.innerHTML = `

        <div style="
            display:flex;
            align-items:center;
            gap:10px;
        ">

            <img
                src="./logo.png"
                alt="Chishti AI"
                style="
                    width:36px;
                    height:36px;
                    object-fit:contain;
                    border-radius:8px;
                    background:#fff;
                "
                onerror="this.style.display='none'"
            >

            <div>

                <div style="
                    font-size:17px;
                    font-weight:800;
                ">
                    CHISHTI AI
                </div>

                <div style="
                    font-size:11px;
                    opacity:.85;
                ">
                    Chishti Digital Library
                </div>

            </div>

        </div>

        <div style="
            display:flex;
            gap:5px;
        ">

            <button
                id="chishtiAIClear"
                type="button"
                title="Clear chat"
                style="
                    border:none;
                    background:transparent;
                    color:#fff;
                    font-size:16px;
                    cursor:pointer;
                "
            >
                🗑
            </button>

            <button
                id="chishtiAIClose"
                type="button"
                title="Close"
                style="
                    border:none;
                    background:transparent;
                    color:#fff;
                    font-size:24px;
                    cursor:pointer;
                "
            >
                ×
            </button>

        </div>

    `;


    /*
    MESSAGES
    */

    chatMessages =
        document.createElement(
            "div"
        );


    chatMessages.id =
        "chishtiAIMessages";


    chatMessages.style.cssText = `

        flex:1;

        overflow-y:auto;

        padding:18px;

        background:#0b0b0b;

    `;


    /*
    INPUT AREA
    */

    const inputArea =
        document.createElement(
            "div"
        );


    inputArea.style.cssText = `

        display:flex;
        gap:8px;

        padding:12px;

        background:#171717;

        border-top:
            1px solid rgba(255,255,255,.08);

    `;


    chatInput =
        document.createElement(
            "input"
        );


    chatInput.id =
        "chishtiAIInput";


    chatInput.type =
        "text";


    chatInput.placeholder =
        "Ask anything...";


    chatInput.autocomplete =
        "off";


    chatInput.style.cssText = `

        flex:1;

        min-width:0;

        padding:13px 14px;

        border:none;

        outline:none;

        border-radius:14px;

        background:#252525;

        color:#ffffff;

        font-family:inherit;

        font-size:14px;

    `;


    chatSend =
        document.createElement(
            "button"
        );


    chatSend.id =
        "chishtiAISend";


    chatSend.type =
        "button";


    chatSend.innerHTML =
        "➤";


    chatSend.style.cssText = `

        width:54px;

        border:none;

        border-radius:14px;

        background:#a90000;

        color:#fff;

        font-size:20px;

        cursor:pointer;

    `;


    inputArea.appendChild(
        chatInput
    );


    inputArea.appendChild(
        chatSend
    );


    chatbotWindow.appendChild(
        header
    );


    chatbotWindow.appendChild(
        chatMessages
    );


    chatbotWindow.appendChild(
        inputArea
    );


    document.body.appendChild(
        chatbotWindow
    );


    chatClose =
        document.getElementById(
            "chishtiAIClose"
        );


    chatClear =
        document.getElementById(
            "chishtiAIClear"
        );

}


/* =========================================================
   EVENTS
========================================================= */

function attachChatEvents() {

    if (chatbotButton) {

        chatbotButton.addEventListener(
            "click",
            toggleChatbot
        );

    }


    if (chatClose) {

        chatClose.addEventListener(
            "click",
            closeChatbot
        );

    }


    if (chatClear) {

        chatClear.addEventListener(
            "click",
            clearChat
        );

    }


    if (chatSend) {

        chatSend.addEventListener(
            "click",
            sendMessage
        );

    }


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }

}


/* =========================================================
   OPEN / CLOSE
========================================================= */

function toggleChatbot() {

    if (!chatbotWindow) {
        return;
    }


    const isOpen =
        chatbotWindow.style.display === "flex";


    if (isOpen) {

        closeChatbot();

    } else {

        openChatbot();

    }

}


function openChatbot() {

    chatbotWindow.style.display =
        "flex";


    setTimeout(
        function() {

            if (chatInput) {

                chatInput.focus();

            }

        },
        100
    );

}


function closeChatbot() {

    chatbotWindow.style.display =
        "none";

}


/* =========================================================
   WELCOME MESSAGE
========================================================= */

function showWelcomeMessage() {

    addBotMessage(
        `
        <strong>Welcome to Chishti Library AI.</strong>
        <br><br>
        Main aapki help kar sakta hoon:
        <br>
        📚 Books
        <br>
        👤 Hazrat Allama Saim Chishti
        <br>
        📝 Unki tasaneef
        <br>
        🕌 Naat aur Manqabat
        <br>
        🔎 Library mein books search
        <br><br>
        Aap apna sawal poochhein.
        `
    );

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!chatInput) {
        return;
    }


    const text =
        chatInput.value
            .trim();


    if (!text) {
        return;
    }


    addUserMessage(
        text
    );


    chatInput.value =
        "";


    saveChatHistory();


    showTyping();


    await delay(400);


    const answer =
        getChishtiAIAnswer(
            text
        );


    hideTyping();


    if (
        answer &&
        answer.type === "books"
    ) {

        addBookResults(
            answer.books
        );

    } else {

        addBotMessage(
            answer
        );

    }


    saveChatHistory();

}


/* =========================================================
   AI ANSWER
========================================================= */

function getChishtiAIAnswer(
    userMessage
) {

    const cleanMessage =
        normalizeText(
            userMessage
        );


    /*
    BOOK SEARCH FIRST
    */

    const bookResults =
        searchBooks(
            cleanMessage
        );


    if (
        bookResults.length > 0 &&
        (
            cleanMessage.includes("book") ||
            cleanMessage.includes("kitab") ||
            cleanMessage.includes("kitabain") ||
            cleanMessage.includes("read") ||
            cleanMessage.includes("parhna") ||
            cleanMessage.includes("naat") ||
            cleanMessage.includes("manqabat") ||
            cleanMessage.includes("hamd") ||
            cleanMessage.includes("kulliyat") ||
            cleanMessage.includes("maqala")
        )
    ) {

        return {

            type: "books",

            books: bookResults.slice(
                0,
                5
            )

        };

    }


    /*
    KNOWLEDGE SEARCH
    */

    const knowledgeAnswer =
        searchKnowledge(
            cleanMessage
        );


    if (knowledgeAnswer) {

        return knowledgeAnswer;

    }


    /*
    COMMON GREETINGS
    */

    if (
        containsAny(
            cleanMessage,
            [
                "hi",
                "hello",
                "hey",
                "salam",
                "assalam",
                "aoa",
                "aoa",
                "assalam o alaikum"
            ]
        )
    ) {

        return `
        <strong>Wa Alaikum Assalam 🌙</strong>
        <br><br>
        Welcome to Chishti Library AI.
        <br>
        Aap kya jaanna chahte hain?
        `;

    }


    /*
    THANK YOU
    */

    if (
        containsAny(
            cleanMessage,
            [
                "thanks",
                "thank you",
                "shukriya",
                "jazakallah",
                "jazak allah"
            ]
        )
    ) {

        return `
        Khushi hui ke main aapki madad kar saka. ❤️
        <br><br>
        Chishti Library mein aapka khair maqdam hai.
        `;

    }


    /*
    HELP
    */

    if (
        containsAny(
            cleanMessage,
            [
                "help",
                "kya kar sakte",
                "what can you do",
                "tum kya kar sakte"
            ]
        )
    ) {

        return `
        <strong>Chishti AI kya kar sakta hai?</strong>
        <br><br>
        📚 Library books search
        <br>
        👤 Saim Chishti ke baare mein maloomat
        <br>
        📖 Books ke details
        <br>
        🕌 Naat / Manqabat / Hamd
        <br>
        🔎 Knowledge base search
        <br><br>
        Example:
        <br>
        <em>"Who is Saim Chishti?"</em>
        <br>
        <em>"Saim Chishti ki books"</em>
        <br>
        <em>"Al Batool book"</em>
        `;

    }


    /*
    DEFAULT
    */

    return `
    Mujhe is sawal ka exact jawab
    Chishti Library knowledge base mein nahi mila. 🤖
    <br><br>
    Aap is tarah sawal pooch sakte hain:
    <br>
    • Who is Saim Chishti?
    <br>
    • Saim Chishti birth
    <br>
    • Saim Chishti books
    <br>
    • Saim Chishti sons
    <br>
    • Al Batool book
    `;

}


/* =========================================================
   KNOWLEDGE SEARCH
========================================================= */

function searchKnowledge(
    message
) {

    if (
        !Array.isArray(
            chishtiKnowledge
        )
    ) {

        return null;

    }


    /*
    EXACT MATCH
    */

    for (
        const item
        of chishtiKnowledge
    ) {

        const question =
            normalizeText(
                item.question || ""
            );


        if (
            message === question
        ) {

            return formatAnswer(
                item.answer
            );

        }

    }


    /*
    PARTIAL MATCH
    */

    let bestItem =
        null;

    let bestScore =
        0;


    const words =
        getMeaningfulWords(
            message
        );


    chishtiKnowledge.forEach(
        function(item) {

            const question =
                normalizeText(
                    item.question || ""
                );


            const answer =
                normalizeText(
                    item.answer || ""
                );


            let score =
                0;


            /*
            Whole question contained
            */

            if (
                message.includes(
                    question
                )
            ) {

                score += 20;

            }


            if (
                question.includes(
                    message
                )
            ) {

                score += 15;

            }


            /*
            Word matching
            */

            words.forEach(
                function(word) {

                    if (
                        question.includes(
                            word
                        )
                    ) {

                        score += 5;

                    }


                    if (
                        answer.includes(
                            word
                        )
                    ) {

                        score += 1;

                    }

                }
            );


            /*
            Important keyword boost
            */

            if (
                message.includes(
                    "saim"
                ) &&
                question.includes(
                    "saim"
                )
            ) {

                score += 4;

            }


            if (
                message.includes(
                    "chishti"
                ) &&
                question.includes(
                    "chishti"
                )
            ) {

                score += 4;

            }


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                bestItem =
                    item;

            }

        }
    );


    if (
        bestItem &&
        bestScore >= 5
    ) {

        return formatAnswer(
            bestItem.answer
        );

    }


    return null;

}


/* =========================================================
   FORMAT ANSWER
========================================================= */

function formatAnswer(
    answer
) {

    if (!answer) {
        return null;
    }


    return escapeHTML(
        String(answer)
    )
        .replaceAll(
            "\n",
            "<br>"
        );

}


/* =========================================================
   SEARCH BOOKS
========================================================= */

function searchBooks(
    message
) {

    if (
        !Array.isArray(
            chishtiBooks
        )
    ) {

        return [];

    }


    const words =
        getMeaningfulWords(
            message
        );


    return chishtiBooks
        .map(
            function(book) {

                const searchable =
                    normalizeText(
                        [
                            book.title,
                            book.author,
                            book.category,
                            book.categoryName,
                            book.description
                        ]
                        .filter(Boolean)
                        .join(" ")
                    );


                let score =
                    0;


                words.forEach(
                    function(word) {

                        if (
                            searchable.includes(
                                word
                            )
                        ) {

                            score += 3;

                        }

                    }
                );


                if (
                    normalizeText(
                        book.title || ""
                    ) === message
                ) {

                    score += 20;

                }


                return {

                    book: book,

                    score: score

                };

            }
        )
        .filter(
            function(item) {

                return item.score > 0;

            }
        )
        .sort(
            function(a, b) {

                return b.score - a.score;

            }
        )
        .map(
            function(item) {

                return item.book;

            }
        );

}


/* =========================================================
   BOOK RESULT CARDS
========================================================= */

function addBookResults(
    books
) {

    if (
        !Array.isArray(books) ||
        books.length === 0
    ) {

        addBotMessage(
            "Mujhe matching book nahi mili."
        );

        return;

    }


    books.forEach(
        function(book) {

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "chishti-ai-message chishti-ai-bot";


            message.innerHTML = `

                <div style="
                    background:#242424;
                    border-radius:16px;
                    padding:14px;
                    margin-bottom:10px;
                ">

                    <div style="
                        display:flex;
                        gap:12px;
                    ">

                        <img
                            src="${escapeAttribute(
                                book.cover ||
                                "./logo.png"
                            )}"
                            alt="${escapeAttribute(
                                book.title ||
                                "Book"
                            )}"
                            style="
                                width:70px;
                                height:95px;
                                object-fit:cover;
                                border-radius:7px;
                                background:#fff;
                            "
                            onerror="
                                this.src='./logo.png'
                            "
                        >

                        <div style="
                            flex:1;
                        ">

                            <strong style="
                                font-size:16px;
                                color:#fff;
                            ">
                                📚 ${escapeHTML(
                                    book.title ||
                                    "Book"
                                )}
                            </strong>

                            <div style="
                                margin-top:6px;
                                font-size:13px;
                                color:#ddd;
                            ">
                                👤 ${escapeHTML(
                                    book.author ||
                                    "Unknown"
                                )}
                            </div>

                            <div style="
                                margin-top:5px;
                                font-size:12px;
                                color:#d4af37;
                            ">
                                📁 ${escapeHTML(
                                    book.category ||
                                    book.categoryName ||
                                    ""
                                )}
                            </div>

                        </div>

                    </div>


                    <div style="
                        margin-top:12px;
                        display:flex;
                        gap:7px;
                        flex-wrap:wrap;
                    ">

                        <button
                            type="button"
                            class="chishti-ai-read-book"
                            data-pdf="${escapeAttribute(
                                book.pdf || ""
                            )}"
                            style="
                                border:none;
                                border-radius:20px;
                                padding:9px 13px;
                                background:#8b0000;
                                color:#fff;
                                cursor:pointer;
                                font-weight:700;
                            "
                        >
                            📖 Read Online
                        </button>


                        <button
                            type="button"
                            class="chishti-ai-download-book"
                            data-pdf="${escapeAttribute(
                                book.pdf || ""
                            )}"
                            style="
                                border:none;
                                border-radius:20px;
                                padding:9px 13px;
                                background:#590000;
                                color:#fff;
                                cursor:pointer;
                                font-weight:700;
                            "
                        >
                            ↓ Download
                        </button>

                    </div>

                </div>

            `;


            chatMessages.appendChild(
                message
            );


            const readButton =
                message.querySelector(
                    ".chishti-ai-read-book"
                );


            const downloadButton =
                message.querySelector(
                    ".chishti-ai-download-book"
                );


            if (readButton) {

                readButton.addEventListener(
                    "click",
                    function() {

                        openBookReader(
                            this.dataset.pdf
                        );

                    }
                );

            }


            if (downloadButton) {

                downloadButton.addEventListener(
                    "click",
                    function() {

                        downloadBook(
                            this.dataset.pdf
                        );

                    }
                );

            }

        }
    );


    scrollChatToBottom();

}


/* =========================================================
   OPEN READER
========================================================= */

function openBookReader(
    pdfFile
) {

    if (!pdfFile) {

        alert(
            "Is book ki PDF available nahi hai."
        );

        return;

    }


    const extension =
        pdfFile
            .split("?")[0]
            .split(".")
            .pop()
            .toLowerCase();


    if (
        extension !== "pdf"
    ) {

        alert(
            "Invalid PDF file."
        );

        return;

    }


    const url =
        CHISHTI_AI_CONFIG.readerPage +
        "?book=" +
        encodeURIComponent(
            pdfFile
        );


    window.location.href =
        url;

}


/* =========================================================
   DOWNLOAD BOOK
========================================================= */

function downloadBook(
    pdfFile
) {

    if (!pdfFile) {

        alert(
            "PDF available nahi hai."
        );

        return;

    }


    const link =
        document.createElement(
            "a"
        );


    link.href =
        pdfFile;


    link.download =
        pdfFile.split("/").pop();


    link.target =
        "_blank";


    link.rel =
        "noopener";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(
    text
) {

    if (!chatMessages) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chishti-ai-message chishti-ai-user";


    message.style.cssText = `

        display:flex;
        justify-content:flex-end;

        margin-bottom:12px;

    `;


    message.innerHTML = `

        <div style="
            max-width:82%;

            background:#a00000;

            color:#fff;

            padding:11px 14px;

            border-radius:
                16px 16px 4px 16px;

            font-size:14px;

            line-height:1.5;

            word-break:break-word;
        ">
            ${escapeHTML(text)}
        </div>

    `;


    chatMessages.appendChild(
        message
    );


    scrollChatToBottom();

}


/* =========================================================
   ADD BOT MESSAGE
========================================================= */

function addBotMessage(
    html
) {

    if (!chatMessages) {
        return;
    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "chishti-ai-message chishti-ai-bot";


    message.style.cssText = `

        display:flex;
        justify-content:flex-start;

        margin-bottom:12px;

    `;


    message.innerHTML = `

        <div style="
            max-width:88%;

            background:#242424;

            color:#ffffff;

            padding:13px 15px;

            border-radius:
                4px 16px 16px 16px;

            font-size:14px;

            line-height:1.6;

            word-break:break-word;
        ">

            ${html}

        </div>

    `;


    chatMessages.appendChild(
        message
    );


    scrollChatToBottom();

}


/* =========================================================
   TYPING INDICATOR
========================================================= */

let typingElement =
    null;


function showTyping() {

    if (!chatMessages) {
        return;
    }


    if (typingElement) {
        return;
    }


    typingElement =
        document.createElement(
            "div"
        );


    typingElement.id =
        "chishtiAITyping";


    typingElement.style.cssText = `

        display:flex;
        justify-content:flex-start;

        margin-bottom:12px;

    `;


    typingElement.innerHTML = `

        <div style="
            background:#242424;
            color:#aaa;

            padding:11px 15px;

            border-radius:
                4px 16px 16px 16px;

            font-size:13px;
        ">

            Chishti AI is typing
            <span>•••</span>

        </div>

    `;


    chatMessages.appendChild(
        typingElement
    );


    scrollChatToBottom();

}


function hideTyping() {

    if (typingElement) {

        typingElement.remove();

        typingElement =
            null;

    }

}


/* =========================================================
   CLEAR CHAT
========================================================= */

function clearChat() {

    if (!chatMessages) {
        return;
    }


    const confirmed =
        confirm(
            "Clear Chishti AI chat?"
        );


    if (!confirmed) {
        return;
    }


    chatMessages.innerHTML =
        "";


    localStorage.removeItem(
        CHISHTI_AI_CONFIG.storageKey
    );


    showWelcomeMessage();

}


/* =========================================================
   SAVE CHAT
========================================================= */

function saveChatHistory() {

    if (!chatMessages) {
        return;
    }


    try {

        localStorage.setItem(
            CHISHTI_AI_CONFIG.storageKey,
            chatMessages.innerHTML
        );

    } catch (error) {

        console.warn(
            "Chat history save failed:",
            error
        );

    }

}


/* =========================================================
   LOAD CHAT
========================================================= */

function loadChatHistory() {

    if (!chatMessages) {
        return;
    }


    try {

        const history =
            localStorage.getItem(
                CHISHTI_AI_CONFIG.storageKey
            );


        if (history) {

            chatMessages.innerHTML =
                history;

            /*
            Reconnect book buttons
            after restoring HTML.
            */

            reconnectBookButtons();

            scrollChatToBottom();

        }

    } catch (error) {

        console.warn(
            "Chat history load failed:",
            error
        );

    }

}


/* =========================================================
   RECONNECT BOOK BUTTONS
========================================================= */

function reconnectBookButtons() {

    if (!chatMessages) {
        return;
    }


    chatMessages
        .querySelectorAll(
            ".chishti-ai-read-book"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        openBookReader(
                            this.dataset.pdf
                        );

                    }
                );

            }
        );


    chatMessages
        .querySelectorAll(
            ".chishti-ai-download-book"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        downloadBook(
                            this.dataset.pdf
                        );

                    }
                );

            }
        );

}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    text
) {

    return String(text || "")
        .toLowerCase()
        .trim()
        .replace(/[؟?!.,،؛:;'"`]/g, " ")
        .replace(/\s+/g, " ");

}


/* =========================================================
   GET MEANINGFUL WORDS
========================================================= */

function getMeaningfulWords(
    text
) {

    const stopWords = [

        "the",
        "a",
        "an",
        "is",
        "are",
        "was",
        "were",
        "who",
        "what",
        "where",
        "when",
        "why",
        "how",

        "ka",
        "ki",
        "ke",
        "ko",
        "mein",
        "me",
        "hai",
        "hain",
        "he",
        "ho",
        "kya",
        "kon",
        "kis",
        "se",
        "par",
        "aur",
        "ye",
        "yeh",
        "wo",
        "woh",

        "book",
        "books",
        "booki",
        "please"

    ];


    return normalizeText(text)
        .split(" ")
        .filter(
            function(word) {

                return (
                    word.length >= 3 &&
                    !stopWords.includes(
                        word
                    )
                );

            }
        );

}


/* =========================================================
   CHECK KEYWORDS
========================================================= */

function containsAny(
    text,
    words
) {

    return words.some(
        function(word) {

            return text.includes(
                normalizeText(word)
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChatToBottom() {

    if (!chatMessages) {
        return;
    }


    requestAnimationFrame(
        function() {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

}


/* =========================================================
   DELAY
========================================================= */

function delay(
    milliseconds
) {

    return new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   PUBLIC API
========================================================= */

window.ChishtiAI = {

    ask: function(question) {

        return getChishtiAIAnswer(
            question
        );

    },


    searchKnowledge: function(question) {

        return searchKnowledge(
            normalizeText(question)
        );

    },


    searchBooks: function(question) {

        return searchBooks(
            normalizeText(question)
        );

    },


    open: function() {

        openChatbot();

    },


    close: function() {

        closeChatbot();

    },


    clear: function() {

        clearChat();

    }

};


/* =========================================================
   END
========================================================= */

console.log(
    "🤖 Chishti AI chatbot.js loaded"
);
