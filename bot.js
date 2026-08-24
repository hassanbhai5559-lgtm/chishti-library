/* =========================================================
   CHISHTI AI
   BOT.JS
   Compatible with current index.html
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       CONFIG
    ===================================================== */

    const CONFIG = {

        knowledgeFile: "./knowledge.json",

        booksFile: "./books.json",

        logo:
            "./6d587a32-1b31-4895-8a67-e5e3a64257e4.png",

        loginPage: "./login.html",

        speechLanguage: "en-US",

        maxBooksInAnswer: 8

    };


    /* =====================================================
       STATE
    ===================================================== */

    let knowledge = [];

    let books = [];

    let currentUser = null;

    let knowledgeLoaded = false;

    let booksLoaded = false;

    let recognition = null;

    let isListening = false;


    /* =====================================================
       DOM
    ===================================================== */

    const chatBtn =
        document.getElementById("chatBtn");

    const chatWindow =
        document.getElementById("chatWindow");

    const closeChat =
        document.getElementById("closeChat");

    const chatMessages =
        document.getElementById("chatMessages");

    const chatInput =
        document.getElementById("chatInput");

    const sendButton =
        document.querySelector(
            '#chatWindow .chat-input button'
        );


    /* Standalone bot.html */

    const botMessages =
        document.getElementById("botMessages");

    const botInput =
        document.getElementById("botInput");

    const sendBotMessage =
        document.getElementById("sendBotMessage");

    const voiceBtn =
        document.getElementById("voiceBtn");

    const voiceStatus =
        document.getElementById("voiceStatus");

    const botTyping =
        document.getElementById("botTyping");

    const aiUserStatus =
        document.getElementById("aiUserStatus");


    const loginRequiredModal =
        document.getElementById(
            "loginRequiredModal"
        );

    const closeLoginModal =
        document.getElementById(
            "closeLoginModal"
        );


    /* =====================================================
       START
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        init
    );


    async function init() {

        await loadKnowledge();

        await loadBooks();

        setupFirebaseAuth();

        setupEvents();

        setupVoiceRecognition();

    }


    /* =====================================================
       LOAD KNOWLEDGE
    ===================================================== */

    async function loadKnowledge() {

        try {

            const response =
                await fetch(
                    CONFIG.knowledgeFile,
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "knowledge.json could not be loaded"
                );
            }

            knowledge =
                await response.json();

            if (!Array.isArray(knowledge)) {
                knowledge = [];
            }

            knowledgeLoaded = true;

        } catch (error) {

            console.error(
                "Chishti AI knowledge error:",
                error
            );

            knowledge = [];

        }

    }


    /* =====================================================
       LOAD BOOKS
    ===================================================== */

    async function loadBooks() {

        try {

            const response =
                await fetch(
                    CONFIG.booksFile,
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "books.json could not be loaded"
                );
            }

            books =
                await response.json();

            if (!Array.isArray(books)) {
                books = [];
            }

            booksLoaded = true;

            console.log(
                "Chishti AI loaded books:",
                books.length
            );

        } catch (error) {

            console.warn(
                "Chishti AI books.json error:",
                error
            );

            books = [];

        }

    }


    /* =====================================================
       FIREBASE AUTH
    ===================================================== */

    function setupFirebaseAuth() {

        if (
            typeof firebase === "undefined" ||
            !firebase.auth
        ) {

            console.warn(
                "Firebase Auth not available."
            );

            setUser(null);

            return;
        }


        firebase.auth().onAuthStateChanged(
            function (user) {

                setUser(user);

            }
        );

    }


    function setUser(user) {

        currentUser = user || null;

        updateUserStatus();

        updateChatAccess();

    }


    /* =====================================================
       USER STATUS
    ===================================================== */

    function updateUserStatus() {

        if (!aiUserStatus) {
            return;
        }

        if (currentUser) {

            aiUserStatus.classList.add(
                "logged-in"
            );

            aiUserStatus.innerHTML =
                `
                <i class="fa-solid fa-circle"></i>
                Logged in
                `;

        } else {

            aiUserStatus.classList.remove(
                "logged-in"
            );

            aiUserStatus.innerHTML =
                `
                <i class="fa-solid fa-lock"></i>
                Login required
                `;

        }

    }


    /* =====================================================
       EXISTING INDEX CHAT ACCESS
    ===================================================== */

    function updateChatAccess() {

        if (!chatBtn) {
            return;
        }

        if (currentUser) {

            chatBtn.classList.remove(
                "login-required"
            );

            chatBtn.title =
                "Open Chishti AI";

        } else {

            chatBtn.classList.add(
                "login-required"
            );

            chatBtn.title =
                "Login required to use Chishti AI";

        }

    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function setupEvents() {


        /* Existing index chatbot */

        if (chatBtn) {

            chatBtn.addEventListener(
                "click",
                function () {

                    if (!currentUser) {

                        showLoginRequired();

                        return;

                    }

                    if (chatWindow) {

                        chatWindow.classList.toggle(
                            "active"
                        );

                    }

                    if (chatInput) {
                        setTimeout(
                            () => chatInput.focus(),
                            100
                        );
                    }

                }
            );

        }


        if (closeChat) {

            closeChat.addEventListener(
                "click",
                function () {

                    if (chatWindow) {

                        chatWindow.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        if (sendButton) {

            sendButton.addEventListener(
                "click",
                function () {

                    sendExistingMessage();

                }
            );

        }


        if (chatInput) {

            chatInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendExistingMessage();

                    }

                }
            );

        }


        /* Standalone bot.html */

        if (sendBotMessage) {

            sendBotMessage.addEventListener(
                "click",
                sendStandaloneMessage
            );

        }


        if (botInput) {

            botInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendStandaloneMessage();

                    }

                }
            );

        }


        if (voiceBtn) {

            voiceBtn.addEventListener(
                "click",
                function () {

                    if (!currentUser) {

                        showLoginRequired();

                        return;

                    }

                    startVoiceRecognition();

                }
            );

        }


        if (closeLoginModal) {

            closeLoginModal.addEventListener(
                "click",
                hideLoginRequired
            );

        }


        if (loginRequiredModal) {

            loginRequiredModal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        loginRequiredModal
                    ) {

                        hideLoginRequired();

                    }

                }
            );

        }

    }


    /* =====================================================
       EXISTING CHAT MESSAGE
    ===================================================== */

    function sendExistingMessage() {

        if (!chatInput) {
            return;
        }

        const text =
            chatInput.value.trim();

        if (!text) {
            return;
        }


        if (!currentUser) {

            showLoginRequired();

            return;

        }


        addExistingUserMessage(text);

        chatInput.value = "";

        showExistingTyping();


        setTimeout(
            async function () {

                const answer =
                    await generateAnswer(text);

                hideExistingTyping();

                addExistingBotMessage(
                    answer
                );

                speak(answer);

            },
            400
        );

    }


    /* =====================================================
       STANDALONE MESSAGE
    ===================================================== */

    async function sendStandaloneMessage() {

        if (!botInput) {
            return;
        }

        const text =
            botInput.value.trim();

        if (!text) {
            return;
        }


        if (!currentUser) {

            showLoginRequired();

            return;

        }


        addStandaloneUserMessage(text);

        botInput.value = "";

        if (botTyping) {
            botTyping.classList.remove(
                "hidden"
            );
        }


        const answer =
            await generateAnswer(text);


        if (botTyping) {
            botTyping.classList.add(
                "hidden"
            );
        }


        addStandaloneBotMessage(
            answer
        );

        speak(answer);

    }


    /* =====================================================
       ANSWER ENGINE
    ===================================================== */

    async function generateAnswer(question) {

        const original =
            String(question || "").trim();

        const normalized =
            normalize(original);


        if (!normalized) {

            return (
                "Please ask me something about " +
                "Chishti Library, its books or authors."
            );

        }


        /* ================================================
           GREETINGS
        ================================================ */

        const greeting =
            findKnowledgeAnswer(
                normalized
            );

        if (greeting) {
            return greeting;
        }


        /* ================================================
           BOOK SEARCH
        ================================================ */

        const bookAnswer =
            searchBooks(normalized);

        if (bookAnswer) {
            return bookAnswer;
        }


        /* ================================================
           SPECIAL BOOK QUESTIONS
        ================================================ */

        if (
            containsAny(
                normalized,
                [
                    "how many books",
                    "kitni books",
                    "kitni kitab",
                    "total books",
                    "books count"
                ]
            )
        ) {

            return (
                `Chishti Library mein is waqt ` +
                `${books.length} books available hain.`
            );

        }


        if (
            containsAny(
                normalized,
                [
                    "latest book",
                    "latest books",
                    "new book",
                    "newest book",
                    "latest release"
                ]
            )
        ) {

            const latest =
                getLatestBooks();

            if (latest.length) {

                return (
                    "Chishti Library ki latest " +
                    "books:\n\n" +
                    latest
                        .map(
                            (book, index) =>
                                `${index + 1}. ${book.title}`
                        )
                        .join("\n")
                );

            }

        }


        /* ================================================
           CATEGORY SEARCH
        ================================================ */

        const category =
            detectCategory(normalized);

        if (category) {

            const categoryBooks =
                books.filter(
                    book =>
                        normalize(
                            book.category || ""
                        ) ===
                        normalize(category)
                );

            if (categoryBooks.length) {

                return (
                    `${category} category mein ` +
                    `${categoryBooks.length} books hain:\n\n` +
                    categoryBooks
                        .slice(
                            0,
                            CONFIG.maxBooksInAnswer
                        )
                        .map(
                            (book, index) =>
                                `${index + 1}. ${book.title}`
                        )
                        .join("\n")
                );

            }

        }


        /* ================================================
           AUTHOR SEARCH
        ================================================ */

        const author =
            detectAuthor(normalized);

        if (author) {

            const authorBooks =
                books.filter(
                    book =>
                        normalize(
                            book.author || ""
                        ).includes(
                            normalize(author)
                        )
                );

            if (authorBooks.length) {

                return (
                    `${author} se related ` +
                    `${authorBooks.length} books available hain:\n\n` +
                    authorBooks
                        .slice(
                            0,
                            CONFIG.maxBooksInAnswer
                        )
                        .map(
                            (book, index) =>
                                `${index + 1}. ${book.title}`
                        )
                        .join("\n")
                );

            }

        }


        /* ================================================
           FALLBACK
        ================================================ */

        return (
            "Sorry, mujhe is sawal ka jawab " +
            "Chishti Library ke knowledge base mein " +
            "nahi mila. 😔\n\n" +

            "Aap book title, author, category ya " +
            "Chishti Library ke bare mein pooch sakte hain."
        );

    }


    /* =====================================================
       KNOWLEDGE SEARCH
    ===================================================== */

    function findKnowledgeAnswer(query) {

        if (!knowledge.length) {
            return null;
        }


        let exact =
            knowledge.find(
                item =>
                    normalize(
                        item.question || ""
                    ) === query
            );


        if (exact) {
            return exact.answer;
        }


        let partial =
            knowledge.find(
                item => {

                    const q =
                        normalize(
                            item.question || ""
                        );

                    return (
                        query.includes(q) ||
                        q.includes(query)
                    );

                }
            );


        if (partial) {
            return partial.answer;
        }


        return null;

    }


    /* =====================================================
       BOOK SEARCH
    ===================================================== */

    function searchBooks(query) {

        if (!books.length) {
            return null;
        }


        const results =
            books.filter(
                book => {

                    const title =
                        normalize(
                            book.title || ""
                        );

                    const author =
                        normalize(
                            book.author || ""
                        );

                    const category =
                        normalize(
                            book.category || ""
                        );

                    const description =
                        normalize(
                            book.description || ""
                        );


                    return (
                        title.includes(query) ||
                        author.includes(query) ||
                        category.includes(query) ||
                        description.includes(query)
                    );

                }
            );


        if (!results.length) {
            return null;
        }


        if (results.length === 1) {

            const book =
                results[0];

            return formatBookAnswer(
                book
            );

        }


        return (
            `Mujhe ${results.length} matching books mili hain:\n\n` +

            results
                .slice(
                    0,
                    CONFIG.maxBooksInAnswer
                )
                .map(
                    (book, index) =>
                        `${index + 1}. ${book.title} — ${book.author || "Unknown author"}`
                )
                .join("\n") +

            "\n\nAap kisi specific book ka naam pooch sakte hain."
        );

    }


    /* =====================================================
       BOOK ANSWER
    ===================================================== */

    function formatBookAnswer(book) {

        let answer =
            `📚 ${book.title}\n\n`;

        if (book.author) {

            answer +=
                `Author: ${book.author}\n`;

        }

        if (book.category) {

            answer +=
                `Category: ${book.category}\n`;

        }

        if (book.description) {

            answer +=
                `\n${book.description}\n`;

        }

        answer +=
            "\nAap is book ko Books section mein read ya download kar sakte hain.";

        return answer;

    }


    /* =====================================================
       LATEST BOOKS
    ===================================================== */

    function getLatestBooks() {

        const marked =
            books.filter(
                book =>
                    book.latest === true
            );

        if (marked.length) {
            return marked.slice(
                0,
                CONFIG.maxBooksInAnswer
            );
        }


        return books
            .slice()
            .reverse()
            .slice(
                0,
                CONFIG.maxBooksInAnswer
            );

    }


    /* =====================================================
       CATEGORY
    ===================================================== */

    function detectCategory(query) {

        const categories = [
            "naat",
            "manqabat",
            "hamd",
            "hammad",
            "maqala",
            "seerat",
            "kulliyat"
        ];


        for (const category of categories) {

            if (
                query.includes(category)
            ) {

                return category;

            }

        }


        return null;

    }


    /* =====================================================
       AUTHOR
    ===================================================== */

    function detectAuthor(query) {

        const authors = [

            "saim chishti",

            "allama saim chishti",

            "hazrat allama saim chishti",

            "latif sajid chishti",

            "sahibzada muhammad latif sajid chishti",

            "shafiq mujahid chishti",

            "muhammad shafiq mujahid chishti",

            "tauseef haider chishti",

            "muhammad tauseef haider chishti"

        ];


        for (const author of authors) {

            if (
                query.includes(author)
            ) {

                return author;

            }

        }


        return null;

    }


    /* =====================================================
       NORMALIZE
    ===================================================== */

    function normalize(text) {

        return String(text || "")
            .toLowerCase()
            .replace(/[؟?!.,،؛:;'"`]/g, "")
            .replace(/\s+/g, " ")
            .trim();

    }


    /* =====================================================
       CONTAINS ANY
    ===================================================== */

    function containsAny(
        text,
        words
    ) {

        return words.some(
            word =>
                text.includes(
                    normalize(word)
                )
        );

    }


    /* =====================================================
       EXISTING UI MESSAGES
    ===================================================== */

    function addExistingUserMessage(
        text
    ) {

        if (!chatMessages) {
            return;
        }

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "user-message";

        div.textContent =
            text;

        chatMessages.appendChild(
            div
        );

        scrollExistingChat();

    }


    function addExistingBotMessage(
        text
    ) {

        if (!chatMessages) {
            return;
        }

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "bot-message";

        div.textContent =
            text;

        chatMessages.appendChild(
            div
        );

        scrollExistingChat();

    }


    function showExistingTyping() {

        if (!chatMessages) {
            return;
        }

        if (
            document.getElementById(
                "chishtiAITyping"
            )
        ) {
            return;
        }

        const typing =
            document.createElement(
                "div"
            );

        typing.id =
            "chishtiAITyping";

        typing.className =
            "bot-message";

        typing.textContent =
            "Chishti AI is typing...";

        chatMessages.appendChild(
            typing
        );

        scrollExistingChat();

    }


    function hideExistingTyping() {

        const typing =
            document.getElementById(
                "chishtiAITyping"
            );

        if (typing) {
            typing.remove();
        }

    }


    function scrollExistingChat() {

        if (chatMessages) {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }

    }


    /* =====================================================
       STANDALONE UI
    ===================================================== */

    function addStandaloneUserMessage(
        text
    ) {

        if (!botMessages) {
            return;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "bot-message user-message";

        wrapper.innerHTML =
            `
            <div class="message-content">
                <strong>You</strong>
                <p></p>
            </div>
            `;

        wrapper
            .querySelector("p")
            .textContent = text;

        botMessages.appendChild(
            wrapper
        );

        scrollStandalone();

    }


    function addStandaloneBotMessage(
        text
    ) {

        if (!botMessages) {
            return;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "bot-message";

        wrapper.innerHTML =
            `
            <div class="message-avatar">
                <img
                    src="${CONFIG.logo}"
                    alt="Chishti AI"
                >
            </div>

            <div class="message-content">

                <strong>Chishti AI</strong>

                <p></p>

            </div>
            `;

        wrapper
            .querySelector("p")
            .textContent = text;

        botMessages.appendChild(
            wrapper
        );

        scrollStandalone();

    }


    function scrollStandalone() {

        if (botMessages) {

            botMessages.scrollTop =
                botMessages.scrollHeight;

        }

    }


    /* =====================================================
       LOGIN REQUIRED
    ===================================================== */

    function showLoginRequired() {

        if (loginRequiredModal) {

            loginRequiredModal.classList.remove(
                "hidden"
            );

            return;

        }


        /* If modal isn't available on index.html,
           redirect user to login page. */

        const goLogin =
            confirm(
                "Please login to use Chishti AI.\n\nOpen Login page?"
            );

        if (goLogin) {

            window.location.href =
                CONFIG.loginPage;

        }

    }


    function hideLoginRequired() {

        if (loginRequiredModal) {

            loginRequiredModal.classList.add(
                "hidden"
            );

        }

    }


    /* =====================================================
       VOICE RECOGNITION
    ===================================================== */

    function setupVoiceRecognition() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            if (voiceBtn) {

                voiceBtn.title =
                    "Voice input is not supported in this browser";

            }

            return;

        }


        recognition =
            new SpeechRecognition();

        recognition.continuous = false;

        recognition.interimResults = false;

        recognition.lang =
            CONFIG.speechLanguage;


        recognition.onstart =
            function () {

                isListening = true;

                if (voiceBtn) {

                    voiceBtn.classList.add(
                        "listening"
                    );

                }

                setVoiceStatus(
                    "Listening..."
                );

            };


        recognition.onresult =
            function (event) {

                const result =
                    event
                        .results[0][0]
                        .transcript;


                if (botInput) {

                    botInput.value =
                        result;

                }


                if (chatInput) {

                    chatInput.value =
                        result;

                }


                setVoiceStatus(
                    "Voice captured ✓"
                );


                if (botInput) {

                    sendStandaloneMessage();

                } else if (chatInput) {

                    sendExistingMessage();

                }

            };


        recognition.onerror =
            function (event) {

                console.warn(
                    "Voice error:",
                    event.error
                );

                setVoiceStatus(
                    "Voice input unavailable."
                );

            };


        recognition.onend =
            function () {

                isListening = false;

                if (voiceBtn) {

                    voiceBtn.classList.remove(
                        "listening"
                    );

                }

            };

    }


    function startVoiceRecognition() {

        if (!recognition) {

            setVoiceStatus(
                "Voice recognition is not supported by this browser."
            );

            return;

        }


        if (isListening) {

            recognition.stop();

            return;

        }


        try {

            recognition.start();

        } catch (error) {

            console.warn(error);

        }

    }


    function setVoiceStatus(
        text
    ) {

        if (voiceStatus) {

            voiceStatus.textContent =
                text;

        }

    }


    /* =====================================================
       TEXT TO SPEECH
    ===================================================== */

    function speak(text) {

        if (
            !("speechSynthesis" in window)
        ) {
            return;
        }


        if (!text) {
            return;
        }


        window.speechSynthesis.cancel();


        const cleanText =
            String(text)
                .replace(
                    /https?:\/\/\S+/g,
                    ""
                );


        const utterance =
            new SpeechSynthesisUtterance(
                cleanText
            );


        utterance.lang =
            CONFIG.speechLanguage;

        utterance.rate =
            0.95;

        utterance.pitch =
            1;


        window.speechSynthesis.speak(
            utterance
        );

    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.ChishtiAI = {

        ask:
            generateAnswer,

        speak:
            speak,

        reloadBooks:
            loadBooks,

        reloadKnowledge:
            loadKnowledge,

        getUser:
            function () {
                return currentUser;
            },

        getBooks:
            function () {
                return books;
            }

    };

})();
