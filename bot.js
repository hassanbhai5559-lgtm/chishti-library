"use strict";

/*
=========================================================
 CHISHTI AI
 Firebase + Firestore + Knowledge + Voice
 FIXED INTENT PRIORITY
=========================================================
*/

let knowledge = [];
let books = [];

let currentUser = null;

let voiceEnabled = true;

let recognition = null;
let isListening = false;


/* =========================================================
   ELEMENTS
========================================================= */

const loadingScreen = document.getElementById("loadingScreen");
const loginScreen = document.getElementById("loginScreen");
const chatApp = document.getElementById("chatApp");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const micButton = document.getElementById("micButton");
const voiceStatus = document.getElementById("voiceStatus");
const voiceToggle = document.getElementById("voiceToggle");
const clearChat = document.getElementById("clearChat");


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
   KNOWLEDGE.JSON
========================================================= */

async function loadKnowledge() {

    try {

        const response = await fetch(
            "./knowledge.json?v=" + Date.now()
        );

        if (!response.ok) {
            throw new Error("knowledge.json not found");
        }

        knowledge = await response.json();

        if (!Array.isArray(knowledge)) {
            knowledge = [];
        }

        console.log(
            "✅ Chishti AI knowledge loaded:",
            knowledge.length
        );

    } catch (error) {

        console.error(
            "❌ Knowledge loading error:",
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

            if (loadingScreen)
                loadingScreen.classList.add("hidden");

            if (loginScreen)
                loginScreen.classList.remove("hidden");

            if (chatApp)
                chatApp.classList.add("hidden");

            return;
        }

        currentUser = user;

        if (loginScreen)
            loginScreen.classList.add("hidden");

        if (loadingScreen)
            loadingScreen.classList.remove("hidden");

        if (chatApp)
            chatApp.classList.add("hidden");

        try {

            await loadBooksFromFirebase();

        } catch (error) {

            console.error(error);

        }

        if (loadingScreen)
            loadingScreen.classList.add("hidden");

        if (chatApp)
            chatApp.classList.remove("hidden");

        showWelcome();

    });

}


/* =========================================================
   FIRESTORE BOOKS
========================================================= */

async function loadBooksFromFirebase() {

    books = [];

    try {

        const db = firebase.firestore();

        const snapshot =
            await db.collection("books").get();

        snapshot.forEach(doc => {

            books.push({
                firestoreId: doc.id,
                ...doc.data()
            });

        });

        console.log(
            "✅ Books loaded:",
            books.length
        );

    } catch (error) {

        console.error(
            "❌ Firestore books error:",
            error
        );

    }

}


/* =========================================================
   WELCOME
========================================================= */

function showWelcome() {

    if (
        !chatMessages ||
        chatMessages.children.length > 0
    ) {
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
        <strong>Try:</strong><br>
        • What is Chishti Library?<br>
        • Kulliyat e Saim Urdu<br>
        • Show all books`
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendMessage
        );

    }


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                }

            }
        );

    }


    if (micButton) {

        micButton.addEventListener(
            "click",
            toggleListening
        );

    }


    if (voiceToggle) {

        voiceToggle.addEventListener(
            "click",
            () => {

                voiceEnabled = !voiceEnabled;

                voiceToggle.innerHTML =
                    voiceEnabled
                        ? '<i class="fa-solid fa-volume-high"></i>'
                        : '<i class="fa-solid fa-volume-xmark"></i>';

                if (!voiceEnabled) {
                    speechSynthesis.cancel();
                }

            }
        );

    }


    if (clearChat) {

        clearChat.addEventListener(
            "click",
            () => {

                chatMessages.innerHTML = "";

                showWelcome();

            }
        );

    }


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

    if (!text) {
        return;
    }


    addUserMessage(text);

    chatInput.value = "";

    showTyping();


    try {

        const answer =
            await processMessage(text);

        removeTyping();

        addBotMessage(
            answer.text,
            answer.books || []
        );


        if (
            voiceEnabled &&
            answer.speak
        ) {

            speak(answer.speak);

        }

    } catch (error) {

        console.error(
            "AI processing error:",
            error
        );

        removeTyping();

        addBotMessage(
            "Sorry, something went wrong while processing your request."
        );

    }

}


/* =========================================================
   PROCESS MESSAGE
   IMPORTANT:
   KNOWLEDGE FIRST
   BOOK SEARCH SECOND
========================================================= */

async function processMessage(input) {

    const normalized =
        normalize(input);


    if (!normalized) {

        return {
            text: "Please ask me something.",
            speak: "Please ask me something."
        };

    }


    /* =====================================================
       1. EXACT KNOWLEDGE MATCH
       HIGHEST PRIORITY
    ===================================================== */

    const exactKnowledge =
        findExactKnowledge(normalized);

    if (exactKnowledge) {

        return {

            text:
                exactKnowledge.answer,

            books: [],

            speak:
                stripHtml(
                    exactKnowledge.answer
                )

        };

    }


    /* =====================================================
       2. GREETING PROTECTION
       NEVER SEARCH BOOKS FOR HI / HELLO
    ===================================================== */

    if (isGreeting(normalized)) {

        const greetingKnowledge =
            findGreetingKnowledge(normalized);

        if (greetingKnowledge) {

            return {

                text:
                    greetingKnowledge.answer,

                books: [],

                speak:
                    stripHtml(
                        greetingKnowledge.answer
                    )

            };

        }


        return {

            text:
                `Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh! 👋<br><br>
                Welcome to <strong>Chishti Library</strong>.<br>
                Main Chishti AI hoon. Aap books, authors ya Islamic literature ke bare mein pooch sakte hain.`,

            books: [],

            speak:
                "Wa Alaikum Assalam wa Rahmatullahi wa Barakatuh. Welcome to Chishti Library. Main Chishti AI hoon."

        };

    }


    /* =====================================================
       3. KNOWLEDGE SEMANTIC / PARTIAL MATCH
       BEFORE BOOK SEARCH
    ===================================================== */

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


    /* =====================================================
       4. WEBSITE COMMANDS
    ===================================================== */

    if (
        normalized === "home" ||
        normalized.includes("go home") ||
        normalized.includes("open home")
    ) {

        window.location.href = "index.html";

        return {

            text:
                "Opening Chishti Library home page.",

            speak:
                "Opening Chishti Library home page."

        };

    }


    if (
        normalized === "open books" ||
        normalized.includes("open books page")
    ) {

        window.location.href = "books.html";

        return {

            text:
                "Opening Books page.",

            speak:
                "Opening Books page."

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


    /* =====================================================
       5. SHOW ALL BOOKS
    ===================================================== */

    if (
        containsAny(normalized, [
            "show all books",
            "all books",
            "list books",
            "books list",
            "kitni books",
            "kitabein dikhao",
            "kitaben dikhao",
            "kitabain dikhao"
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


    /* =====================================================
       6. LATEST BOOKS
    ===================================================== */

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
                "Ye library ki latest available books hain."

        };

    }


    /* =====================================================
       7. CATEGORY REQUEST
    ===================================================== */

    if (
        normalized === "naat" ||
        normalized.includes("naat books") ||
        normalized.includes("naat collection")
    ) {

        return categoryResult("Naat");

    }


    if (
        normalized === "manqabat" ||
        normalized.includes("manqabat books")
    ) {

        return categoryResult("Manqabat");

    }


    if (
        normalized === "hamd" ||
        normalized === "hammad" ||
        normalized.includes("hamd books")
    ) {

        return categoryResult("Hamd");

    }


    if (
        normalized === "maqala" ||
        normalized.includes("maqala books")
    ) {

        return categoryResult("Maqala");

    }


    /* =====================================================
       8. BOOK SEARCH
       ONLY NOW
    ===================================================== */

    const foundBooks =
        searchBooks(normalized);

    if (foundBooks.length > 0) {

        return {

            text:
                foundBooks.length === 1
                    ? "Ji, mujhe library database mein ye book mili hai:"
                    : `Ji, mujhe ${foundBooks.length} matching books mili hain:`,

            books:
                foundBooks,

            speak:
                foundBooks.length === 1
                    ? `${foundBooks[0].title} library database mein available hai.`
                    : `${foundBooks.length} matching books library database mein mili hain.`

        };

    }


    /* =====================================================
       9. DEFAULT
    ===================================================== */

    return {

        text:
            `Sorry, mujhe iska jawab knowledge database mein nahi mila.<br><br>
            Aap mujh se Chishti Library, authors, Islamic literature ya kisi specific book ke bare mein pooch sakte hain.`,

        speak:
            "Sorry, mujhe iska jawab knowledge database mein nahi mila."

    };

}


/* =========================================================
   EXACT KNOWLEDGE
========================================================= */

function findExactKnowledge(query) {

    for (const item of knowledge) {

        const question =
            normalize(item.question);

        if (
            question &&
            question === query
        ) {

            return item;

        }

    }

    return null;

}


/* =========================================================
   GREETING DETECTION
========================================================= */

function isGreeting(query) {

    const greetings = [

        "hi",
        "hello",
        "hey",
        "salam",
        "salaam",
        "aoa",
        "assalamualaikum",
        "assalam o alaikum",
        "assalamu alaikum",
        "assalam alaikum",

        "اسلام علیکم",
        "السلام علیکم",
        "ہیلو",
        "ہائے"

    ];

    return greetings.includes(query);

}


/* =========================================================
   FIND GREETING KNOWLEDGE
========================================================= */

function findGreetingKnowledge(query) {

    const greetingWords = [

        "hi",
        "hello",
        "hey",
        "salam",
        "salaam",
        "aoa",
        "assalamualaikum",
        "assalam o alaikum",
        "assalamu alaikum",
        "assalam alaikum",
        "اسلام علیکم",
        "السلام علیکم",
        "ہیلو",
        "ہائے"

    ];


    for (const item of knowledge) {

        const question =
            normalize(item.question);

        if (
            greetingWords.includes(question) &&
            question === query
        ) {

            return item;

        }

    }

    return null;

}


/* =========================================================
   CATEGORY
========================================================= */

function categoryResult(category) {

    const target =
        normalize(category);

    const result =
        books.filter(book =>

            normalize(
                book.category || ""
            ).includes(target)

        );


    return {

        text:
            result.length
                ? `<strong>${escapeHtml(category)}</strong> category mein ${result.length} books available hain:`
                : `${escapeHtml(category)} category mein abhi koi book nahi mili.`,

        books:
            result,

        speak:
            result.length
                ? `${category} category mein ${result.length} books available hain.`
                : `${category} category mein koi book nahi mili.`

    };

}


/* =========================================================
   SEARCH BOOKS
   FIXED:
   NO SHORT WORD MATCH
========================================================= */

function searchBooks(query) {

    if (!books.length) {
        return [];
    }


    const clean =
        normalize(query);


    /*
    Only meaningful words.
    Words like "hi", "is", "a", "me"
    cannot trigger a book search.
    */

    const stopWords = new Set([

        "a",
        "an",
        "the",
        "is",
        "are",
        "am",
        "was",
        "were",
        "what",
        "who",
        "where",
        "when",
        "why",
        "how",
        "me",
        "my",
        "you",
        "your",
        "please",
        "tell",
        "about",
        "show",
        "give",
        "find",
        "book",
        "books",
        "kitab",
        "kitabein",
        "kitaben",
        "mujhe",
        "kya",
        "hai",
        "hain",
        "ka",
        "ki",
        "ke",
        "main",
        "mein",
        "par",
        "se",
        "ko"
    ]);


    const words =
        clean
            .split(" ")
            .filter(word =>
                word.length >= 4 &&
                !stopWords.has(word)
            );


    /*
    No meaningful words = NO BOOK SEARCH
    */

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


                /* Exact title */

                if (
                    title === clean
                ) {

                    score += 200;

                }


                /* Full title */

                if (
                    title.includes(clean)
                ) {

                    score += 100;

                }


                /*
                Word matching
                */

                words.forEach(word => {

                    /*
                    Title is strongest
                    */

                    if (
                        title.split(" ").includes(word)
                    ) {

                        score += 50;

                    } else if (
                        title.includes(word)
                    ) {

                        score += 25;

                    }


                    /*
                    Author
                    */

                    if (
                        author.includes(word)
                    ) {

                        score += 15;

                    }


                    /*
                    Category
                    */

                    if (
                        category.includes(word)
                    ) {

                        score += 10;

                    }


                    /*
                    Description
                    */

                    if (
                        description.includes(word)
                    ) {

                        score += 5;

                    }

                });


                return {
                    book,
                    score
                };

            })
            .filter(item =>
                item.score >= 25
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 10)
            .map(
                item => item.book
            );


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


        if (!question) {
            continue;
        }


        /*
        EXACT
        */

        if (
            question === query
        ) {

            return item;

        }


        const questionWords =
            question
                .split(" ")
                .filter(
                    word => word.length >= 3
                );


        const queryWords =
            query
                .split(" ")
                .filter(
                    word => word.length >= 3
                );


        let score = 0;


        /*
        Whole phrase
        */

        if (
            query.length >= 5 &&
            question.includes(query)
        ) {

            score += 50;

        }


        /*
        Query phrase contains question
        Only for meaningful questions
        */

        if (
            question.length >= 5 &&
            query.includes(question)
        ) {

            score += 40;

        }


        /*
        Word matching
        */

        questionWords.forEach(word => {

            if (
                queryWords.includes(word)
            ) {

                score += 12;

            }

        });


        /*
        Avoid weak one-word matches.
        */

        if (
            score > bestScore
        ) {

            bestScore = score;
            best = item;

        }

    }


    return bestScore >= 30
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
        .replace(
            /[^\p{L}\p{N}\s]/gu,
            " "
        )
        .replace(
            /\s+/g,
            " "
        )
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
   USER MESSAGE
========================================================= */

function addUserMessage(text) {

    if (!chatMessages) {
        return;
    }

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
   BOT MESSAGE
========================================================= */

function addBotMessage(
    text,
    resultBooks = []
) {

    if (!chatMessages) {
        return;
    }


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
                📚 ${escapeHtml(title)}
            </h4>

            <p>
                👤 ${escapeHtml(author)}
            </p>

            ${
                book.category
                    ? `<p>📁 ${escapeHtml(book.category)}</p>`
                    : ""
            }

            <a
                href="${safeUrl(openLink)}"
                ${
                    pdf
                        ? 'target="_blank" rel="noopener"'
                        : ""
                }
            >

                ${
                    pdf
                        ? "📖 Read / PDF"
                        : "📚 Open Books"
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
   URDU VOICE INPUT
========================================================= */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        if (micButton) {
            micButton.style.display = "none";
        }

        console.warn(
            "Speech Recognition not supported."
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    /*
    Urdu Pakistan
    */

    recognition.lang =
        "ur-PK";


    recognition.onstart =
        () => {

            isListening = true;

            if (micButton) {
                micButton.classList.add(
                    "listening"
                );
            }

            if (voiceStatus) {
                voiceStatus.textContent =
                    "🎙️ Listening Urdu...";
            }

        };


    recognition.onend =
        () => {

            isListening = false;

            if (micButton) {
                micButton.classList.remove(
                    "listening"
                );
            }

            if (voiceStatus) {
                voiceStatus.textContent =
                    "";
            }

        };


    recognition.onerror =
        error => {

            console.error(
                "Speech recognition:",
                error
            );

            isListening = false;

            if (micButton) {
                micButton.classList.remove(
                    "listening"
                );
            }

            if (voiceStatus) {

                voiceStatus.textContent =
                    "Voice input unavailable.";

            }

        };


    recognition.onresult =
        event => {

            const transcript =
                event.results[0][0].transcript;

            console.log(
                "🎙️ Urdu voice:",
                transcript
            );


            if (chatInput) {

                chatInput.value =
                    transcript;

                sendMessage();

            }

        };

}


/* =========================================================
   TOGGLE MIC
========================================================= */

function toggleListening() {

    if (!currentUser) {

        addBotMessage(
            "Please login first to use voice commands."
        );

        return;

    }


    if (!recognition) {

        alert(
            "Your browser does not support Urdu voice recognition."
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

        console.error(error);

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


    if (!text) {
        return;
    }


    window.speechSynthesis.cancel();


    const cleanText =
        stripHtml(text);


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.rate =
        0.92;

    utterance.pitch =
        1;

    utterance.volume =
        1;


    const voices =
        window.speechSynthesis
            .getVoices();


    /*
    Prefer Urdu
    */

    const urduVoice =
        voices.find(
            voice =>
                /^ur/i.test(
                    voice.lang
                )
        );


    /*
    Then Hindi
    */

    const hindiVoice =
        voices.find(
            voice =>
                /^hi/i.test(
                    voice.lang
                )
        );


    /*
    Then English
    */

    const englishVoice =
        voices.find(
            voice =>
                /^en/i.test(
                    voice.lang
                )
        );


    if (urduVoice) {

        utterance.voice =
            urduVoice;

        utterance.lang =
            urduVoice.lang;

    } else if (hindiVoice) {

        utterance.voice =
            hindiVoice;

        utterance.lang =
            hindiVoice.lang;

    } else if (englishVoice) {

        utterance.voice =
            englishVoice;

        utterance.lang =
            englishVoice.lang;

    } else {

        utterance.lang =
            "ur-PK";

    }


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   HELPERS
========================================================= */

function scrollChat() {

    if (!chatMessages) {
        return;
    }

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


function stripHtml(html) {

    const temp =
        document.createElement("div");

    temp.innerHTML =
        html;

    return (
        temp.textContent ||
        temp.innerText ||
        ""
    );

}


function escapeHtml(value) {

    return String(value || "")
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


function safeUrl(url) {

    const value =
        String(url || "")
            .trim();


    if (
        /^javascript:/i.test(value)
    ) {

        return "#";

    }


    return value;

}


/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    if (loadingScreen) {

        loadingScreen.classList.add(
            "hidden"
        );

    }


    if (chatApp) {

        chatApp.classList.remove(
            "hidden"
        );

    }


    addBotMessage(
        `<strong>Error:</strong><br>${escapeHtml(message)}`
    );

}


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "🤖 CHISHTI AI BOT JS LOADED"
);
console.log(
    "📚 Knowledge-first system enabled"
);
console.log(
    "🔥 Firebase book database enabled"
);
console.log(
    "🎙️ Urdu voice enabled"
);
