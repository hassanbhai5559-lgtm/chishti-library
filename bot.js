/* =========================================================
   CHISHTI AI
   Firebase + Firestore + Knowledge + Voice
========================================================= */

"use strict";


/* =========================================================
   GLOBAL DATA
========================================================= */

let knowledge = [];
let books = [];

let currentUser = null;

let voiceEnabled = true;

let recognition = null;
let isListening = false;


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen =
    document.getElementById("loadingScreen");

const loginScreen =
    document.getElementById("loginScreen");

const chatApp =
    document.getElementById("chatApp");

const chatMessages =
    document.getElementById("chatMessages");

const chatInput =
    document.getElementById("chatInput");

const sendButton =
    document.getElementById("sendButton");

const micButton =
    document.getElementById("micButton");

const voiceStatus =
    document.getElementById("voiceStatus");

const voiceToggle =
    document.getElementById("voiceToggle");

const clearChat =
    document.getElementById("clearChat");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await loadKnowledge();

    setupVoiceRecognition();

    setupEvents();

    checkFirebaseAuth();

});


/* =========================================================
   LOAD KNOWLEDGE.JSON
========================================================= */

async function loadKnowledge() {

    try {

        const response =
            await fetch("./knowledge.json?version=20260824");

        if (!response.ok) {
            throw new Error("Knowledge file not found");
        }

        knowledge = await response.json();

        console.log(
            "Chishti AI knowledge loaded:",
            knowledge.length
        );

    } catch (error) {

        console.error(
            "Knowledge loading error:",
            error
        );

        knowledge = [];

    }

}


/* =========================================================
   FIREBASE AUTH
========================================================= */

function checkFirebaseAuth() {

    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {

        showError(
            "Firebase is not initialized. Please check firebase.js."
        );

        return;
    }

    const auth = firebase.auth();

    auth.onAuthStateChanged(async user => {

        if (!user) {

            currentUser = null;

            loadingScreen.classList.add("hidden");

            loginScreen.classList.remove("hidden");

            chatApp.classList.add("hidden");

            return;
        }

        currentUser = user;

        loginScreen.classList.add("hidden");

        loadingScreen.classList.remove("hidden");

        chatApp.classList.add("hidden");

        try {

            await loadBooksFromFirebase();

        } catch (error) {

            console.error(error);

        }

        loadingScreen.classList.add("hidden");

        chatApp.classList.remove("hidden");

        showWelcome();

    });

}


/* =========================================================
   LOAD BOOKS FROM FIRESTORE
========================================================= */

async function loadBooksFromFirebase() {

    books = [];

    try {

        const db = firebase.firestore();

        /*
          IMPORTANT:

          Your admin should save books inside:

          books

          collection.
        */

        const snapshot =
            await db.collection("books").get();

        snapshot.forEach(doc => {

            const data = doc.data();

            books.push({
                firestoreId: doc.id,
                ...data
            });

        });

        console.log(
            "Books loaded from Firestore:",
            books.length
        );

    } catch (error) {

        console.error(
            "Firestore books error:",
            error
        );

        addBotMessage(
            "I couldn't connect to the live books database right now."
        );

    }

}


/* =========================================================
   WELCOME
========================================================= */

function showWelcome() {

    if (chatMessages.children.length > 0) {
        return;
    }

    const name =
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "Reader";

    addBotMessage(
        `Assalamu Alaikum ${escapeHtml(name)} 👋<br><br>
        Main <strong>Chishti AI</strong> hoon.<br><br>
        Aap mujh se Chishti Library, books, authors aur Islamic literature ke bare mein pooch sakte hain.<br><br>
        <strong>Try:</strong> "What is Chishti Library?" ya "Show Kulliyat books"`
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

    chatInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                sendMessage();
            }

        }
    );


    micButton.addEventListener(
        "click",
        toggleListening
    );


    voiceToggle.addEventListener(
        "click",
        () => {

            voiceEnabled =
                !voiceEnabled;

            voiceToggle.innerHTML =
                voiceEnabled
                    ? '<i class="fa-solid fa-volume-high"></i>'
                    : '<i class="fa-solid fa-volume-xmark"></i>';

        }
    );


    clearChat.addEventListener(
        "click",
        () => {

            chatMessages.innerHTML = "";

            showWelcome();

        }
    );


    document
        .querySelectorAll(".quick-commands button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    chatInput.value =
                        button.dataset.command;

                    sendMessage();

                }
            );

        });

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!currentUser) {

        addBotMessage(
            "Please login first to use Chishti AI."
        );

        return;
    }


    const text =
        chatInput.value.trim();

    if (!text) return;


    addUserMessage(text);

    chatInput.value = "";


    showTyping();


    const answer =
        await processMessage(text);


    removeTyping();


    addBotMessage(
        answer.text,
        answer.books
    );


    if (
        voiceEnabled &&
        answer.speak
    ) {

        speak(answer.speak);

    }

}


/* =========================================================
   PROCESS MESSAGE
========================================================= */

async function processMessage(input) {

    const normalized =
        normalize(input);


    /* -------------------------
       BOOK SEARCH
    ------------------------- */

    const foundBooks =
        searchBooks(normalized);


    if (foundBooks.length > 0) {

        return {

            text:
                foundBooks.length === 1
                    ? "Ji, mujhe library database mein ye book mili hai:"
                    : `Ji, mujhe ${foundBooks.length} matching books mili hain:`,

            books: foundBooks,

            speak:
                foundBooks.length === 1
                    ? `${foundBooks[0].title} library database mein available hai.`
                    : `${foundBooks.length} matching books library database mein mili hain.`

        };

    }


    /* -------------------------
       SHOW ALL BOOKS
    ------------------------- */

    if (
        containsAny(normalized, [
            "show all books",
            "all books",
            "list books",
            "books list",
            "kitni books",
            "kitabain dikhao",
            "kitabein dikhao"
        ])
    ) {

        const result =
            books.slice(0, 20);

        return {

            text:
                `Library database mein <strong>${books.length}</strong> books hain.`,

            books: result,

            speak:
                `Library database mein ${books.length} books hain.`

        };

    }


    /* -------------------------
       LATEST
    ------------------------- */

    if (
        containsAny(normalized, [
            "latest",
            "new books",
            "latest books",
            "new book",
            "latest release"
        ])
    ) {

        const latest =
            [...books]
                .sort((a, b) => {

                    const da =
                        a.createdAt?.seconds ||
                        a.createdAt ||
                        a.id ||
                        0;

                    const db =
                        b.createdAt?.seconds ||
                        b.createdAt ||
                        b.id ||
                        0;

                    return db - da;

                })
                .slice(0, 8);


        return {

            text:
                "Ye library ki latest available books hain:",

            books: latest,

            speak:
                `Ye library ki latest available books hain.`

        };

    }


    /* -------------------------
       CATEGORIES
    ------------------------- */

    if (
        normalized.includes("naat")
    ) {

        return categoryResult("Naat");

    }

    if (
        normalized.includes("manqabat")
    ) {

        return categoryResult("Manqabat");

    }

    if (
        normalized.includes("hamd") ||
        normalized.includes("hammad")
    ) {

        return categoryResult("Hamd");

    }

    if (
        normalized.includes("maqala")
    ) {

        return categoryResult("Maqala");

    }

    if (
        normalized.includes("kulliyat") ||
        normalized.includes("kuliyat")
    ) {

        const result =
            books.filter(book =>
                normalize(
                    `${book.title || ""} ${book.category || ""}`
                ).includes("kulliyat") ||
                normalize(
                    `${book.title || ""} ${book.category || ""}`
                ).includes("kuliyat")
            );

        return {

            text:
                result.length
                    ? `Ji, mujhe <strong>${result.length}</strong> Kulliyat-related books mili hain:`
                    : "Mujhe abhi Firestore database mein Kulliyat ki book nahi mili.",

            books: result,

            speak:
                result.length
                    ? `${result.length} Kulliyat books library database mein mili hain.`
                    : "Mujhe database mein Kulliyat ki book nahi mili."

        };

    }


    /* -------------------------
       KNOWLEDGE SEARCH
    ------------------------- */

    const knowledgeResult =
        findKnowledge(normalized);


    if (knowledgeResult) {

        return {

            text:
                knowledgeResult.answer,

            books: [],

            speak:
                stripHtml(
                    knowledgeResult.answer
                )

        };

    }


    /* -------------------------
       COMMANDS
    ------------------------- */

    if (
        normalized.includes("go home") ||
        normalized === "home"
    ) {

        window.location.href =
            "index.html";

        return {
            text: "Opening Chishti Library home page.",
            speak: "Opening Chishti Library home page."
        };

    }


    if (
        normalized.includes("open books")
    ) {

        window.location.href =
            "books.html";

        return {
            text: "Opening Books page.",
            speak: "Opening Books page."
        };

    }


    if (
        normalized.includes("logout") ||
        normalized.includes("log out")
    ) {

        await firebase.auth().signOut();

        return {

            text:
                "You have been logged out.",

            speak:
                "You have been logged out."

        };

    }


    /* -------------------------
       DEFAULT
    ------------------------- */

    return {

        text:
            `Sorry, mujhe iska jawab knowledge database mein nahi mila.<br><br>
            Lekin agar aap book ka naam pooch rahe hain to exact title likhein, jaise:
            <br><br>
            <strong>“Kulliyat e Saim Urdu”</strong>
            <br>
            <strong>“Husn-e-Kainat”</strong>
            <br>
            <strong>“Show all books”</strong>`,

        speak:
            "Sorry, mujhe iska jawab knowledge database mein nahi mila. Agar aap book ke baare mein pooch rahe hain to exact book title likhein."

    };

}


/* =========================================================
   CATEGORY
========================================================= */

function categoryResult(category) {

    const result =
        books.filter(book =>
            normalize(book.category || "")
                .includes(normalize(category))
        );


    return {

        text:
            result.length
                ? `<strong>${category}</strong> category mein ${result.length} books available hain:`
                : `${category} category mein abhi koi book nahi mili.`,

        books: result,

        speak:
            result.length
                ? `${category} category mein ${result.length} books available hain.`
                : `${category} category mein koi book nahi mili.`

    };

}


/* =========================================================
   SEARCH BOOKS
========================================================= */

function searchBooks(query) {

    if (!books.length) {
        return [];
    }


    const clean =
        normalize(query);


    /*
      Exact title words ko priority.
    */

    const words =
        clean
            .split(" ")
            .filter(word => word.length > 2);


    if (!words.length) {
        return [];
    }


    const results =
        books
            .map(book => {

                const title =
                    normalize(book.title || "");

                const author =
                    normalize(book.author || "");

                const category =
                    normalize(book.category || "");

                const description =
                    normalize(book.description || "");

                let score = 0;


                if (
                    title === clean
                ) {
                    score += 100;
                }


                if (
                    title.includes(clean)
                ) {
                    score += 60;
                }


                if (
                    author.includes(clean)
                ) {
                    score += 35;
                }


                if (
                    category.includes(clean)
                ) {
                    score += 20;
                }


                words.forEach(word => {

                    if (title.includes(word)) {
                        score += 15;
                    }

                    if (author.includes(word)) {
                        score += 8;
                    }

                    if (description.includes(word)) {
                        score += 5;
                    }

                });


                return {
                    book,
                    score
                };

            })
            .filter(item => item.score > 0)
            .sort((a, b) =>
                b.score - a.score
            )
            .slice(0, 10)
            .map(item => item.book);


    return results;

}


/* =========================================================
   KNOWLEDGE SEARCH
========================================================= */

function findKnowledge(query) {

    let best = null;

    let bestScore = 0;


    for (const item of knowledge) {

        const question =
            normalize(item.question || "");


        const words =
            question
                .split(" ")
                .filter(word => word.length > 2);


        let score = 0;


        if (
            question === query
        ) {

            return item;

        }


        if (
            question.includes(query) ||
            query.includes(question)
        ) {

            score += 50;

        }


        words.forEach(word => {

            if (query.includes(word)) {
                score += 10;
            }

        });


        if (score > bestScore) {

            bestScore = score;
            best = item;

        }

    }


    return bestScore >= 20
        ? best
        : null;

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(value) {

    return String(value || "")
        .toLowerCase()
        .replace(/[’']/g, "")
        .replace(/[-_]/g, " ")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

}


/* =========================================================
   CONTAINS ANY
========================================================= */

function containsAny(text, values) {

    return values.some(value =>
        text.includes(
            normalize(value)
        )
    );

}


/* =========================================================
   ADD USER MESSAGE
========================================================= */

function addUserMessage(text) {

    const div =
        document.createElement("div");

    div.className =
        "message user-message";

    div.textContent =
        text;

    chatMessages.appendChild(div);

    scrollChat();

}


/* =========================================================
   ADD BOT MESSAGE
========================================================= */

function addBotMessage(text, resultBooks = []) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "message bot-message";


    wrapper.innerHTML =
        text;


    if (
        resultBooks &&
        resultBooks.length
    ) {

        resultBooks
            .slice(0, 10)
            .forEach(book => {

                wrapper.appendChild(
                    createBookCard(book)
                );

            });

    }


    chatMessages.appendChild(wrapper);

    scrollChat();

}


/* =========================================================
   BOOK CARD
========================================================= */

function createBookCard(book) {

    const card =
        document.createElement("div");

    card.className =
        "book-result";


    const cover =
        book.cover ||
        book.coverUrl ||
        "logo.png";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        "Unknown Author";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    const bookId =
        book.id ||
        book.firestoreId ||
        "";


    /*
      If your website has individual book pages
      using the numeric ID, this can be changed later.
    */

    let openLink =
        pdf ||
        "books.html";


    card.innerHTML = `

        <img
            src="${safeUrl(cover)}"
            alt="${escapeHtml(title)}"
            onerror="this.src='logo.png'"
        >

        <div class="book-result-info">

            <h4>
                ${escapeHtml(title)}
            </h4>

            <p>
                ${escapeHtml(author)}
            </p>

            ${
                book.category
                    ? `<p>${escapeHtml(book.category)}</p>`
                    : ""
            }

            <a
                href="${safeUrl(openLink)}"
                ${
                    pdf
                        ? 'target="_blank"'
                        : ""
                }
            >

                ${
                    pdf
                        ? "Read / PDF"
                        : "Open Books"
                }

            </a>

        </div>
    `;


    return card;

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (
        document.getElementById("typing")
    ) {
        return;
    }


    const typing =
        document.createElement("div");

    typing.id =
        "typing";

    typing.className =
        "message bot-message";

    typing.innerHTML =
        "Chishti AI is thinking...";


    chatMessages.appendChild(typing);

    scrollChat();

}


function removeTyping() {

    const typing =
        document.getElementById("typing");

    if (typing) {
        typing.remove();
    }

}


/* =========================================================
   VOICE RECOGNITION
========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        micButton.style.display =
            "none";

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.lang =
        "en-US";


    recognition.onstart =
        () => {

            isListening = true;

            micButton.classList.add(
                "listening"
            );

            voiceStatus.textContent =
                "Listening...";

        };


    recognition.onend =
        () => {

            isListening = false;

            micButton.classList.remove(
                "listening"
            );

            voiceStatus.textContent =
                "";

        };


    recognition.onerror =
        error => {

            console.error(
                "Speech recognition:",
                error
            );

            isListening = false;

            micButton.classList.remove(
                "listening"
            );

            voiceStatus.textContent =
                "Voice input unavailable.";

        };


    recognition.onresult =
        event => {

            const transcript =
                event.results[0][0].transcript;

            chatInput.value =
                transcript;

            sendMessage();

        };

}


/* =========================================================
   START / STOP LISTENING
========================================================= */

function toggleListening() {

    if (!recognition) {

        alert(
            "Your browser does not support voice recognition."
        );

        return;

    }


    if (isListening) {

        recognition.stop();

    } else {

        recognition.start();

    }

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speak(text) {

    if (
        !("speechSynthesis" in window)
    ) {
        return;
    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            stripHtml(text)
        );


    utterance.rate =
        0.95;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    /*
      Browser voice selection.
      Urdu may depend on installed/browser voices.
    */

    const voices =
        speechSynthesis.getVoices();


    const preferred =
        voices.find(v =>
            /ur|en/i.test(v.lang)
        );


    if (preferred) {
        utterance.voice =
            preferred;
    }


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   HELPERS
========================================================= */

function scrollChat() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


function stripHtml(html) {

    const temp =
        document.createElement("div");

    temp.innerHTML =
        html;

    return temp.textContent ||
           temp.innerText ||
           "";

}


function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function safeUrl(url) {

    const value =
        String(url || "")
            .trim();


    /*
      Prevent javascript: URLs.
    */

    if (
        /^javascript:/i.test(value)
    ) {

        return "#";

    }


    return value;

}


function showError(message) {

    loadingScreen.classList.add(
        "hidden"
    );

    chatApp.classList.remove(
        "hidden"
    );

    addBotMessage(
        `<strong>Error:</strong><br>${escapeHtml(message)}`
    );

}
