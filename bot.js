"use strict";

/*
=========================================================
 CHISHTI AI — COMPLETE BOT.JS
 Firebase + Firestore + Knowledge JSON + Voice
=========================================================
*/

/* ========================================================
   GLOBAL STATE
======================================================== */

let knowledge = [];
let books = [];

let currentUser = null;

let voiceEnabled = true;
let recognition = null;
let isListening = false;
let isSending = false;


/* ========================================================
   ELEMENTS
======================================================== */

let loadingScreen;
let loginScreen;
let chatApp;
let chatMessages;
let chatInput;
let sendButton;
let micButton;
let voiceStatus;
let voiceToggle;
let clearChat;


/* ========================================================
   DOM READY
======================================================== */

document.addEventListener("DOMContentLoaded", () => {

    cacheElements();

    loadKnowledge();

    setupEvents();

    setupVoiceRecognition();

    checkFirebaseAuth();

});


/* ========================================================
   CACHE ELEMENTS
======================================================== */

function cacheElements() {

    loadingScreen =
        document.getElementById("loadingScreen");

    loginScreen =
        document.getElementById("loginScreen");

    chatApp =
        document.getElementById("chatApp");

    chatMessages =
        document.getElementById("chatMessages");

    chatInput =
        document.getElementById("chatInput");

    sendButton =
        document.getElementById("sendButton");

    micButton =
        document.getElementById("micButton");

    voiceStatus =
        document.getElementById("voiceStatus");

    voiceToggle =
        document.getElementById("voiceToggle");

    clearChat =
        document.getElementById("clearChat");

}


/* ========================================================
   LOAD KNOWLEDGE.JSON
======================================================== */

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "./knowledge.json?v=" +
                Date.now()
            );

        if (!response.ok) {

            throw new Error(
                "knowledge.json not found"
            );

        }

        const data =
            await response.json();

        /*
        Supports:

        [
          {...},
          {...}
        ]

        OR

        {
          "knowledge": [...]
        }
        */

        if (Array.isArray(data)) {

            knowledge = data;

        } else if (
            Array.isArray(data.knowledge)
        ) {

            knowledge =
                data.knowledge;

        } else {

            knowledge = [];

        }

        console.log(
            "✅ Chishti AI knowledge loaded:",
            knowledge.length
        );

    }

    catch (error) {

        console.error(
            "❌ Knowledge error:",
            error
        );

        knowledge = [];

    }

}


/* ========================================================
   FIREBASE AUTH
======================================================== */

function checkFirebaseAuth() {

    if (
        typeof firebase === "undefined"
    ) {

        showFirebaseError(
            "Firebase SDK load nahi hua."
        );

        return;

    }


    if (
        !firebase.apps ||
        !firebase.apps.length
    ) {

        showFirebaseError(
            "Firebase initialize nahi hua. firebase.js check karein."
        );

        return;

    }


    const auth =
        firebase.auth();


    auth.onAuthStateChanged(
        async user => {

            if (!user) {

                currentUser = null;

                if (loadingScreen)
                    loadingScreen.classList.add("hidden");

                if (chatApp)
                    chatApp.classList.add("hidden");

                if (loginScreen)
                    loginScreen.classList.remove("hidden");

                return;

            }


            /*
            LOGIN SUCCESS
            */

            currentUser =
                user;


            if (loginScreen)
                loginScreen.classList.add("hidden");

            if (loadingScreen)
                loadingScreen.classList.remove("hidden");

            if (chatApp)
                chatApp.classList.add("hidden");


            /*
            LOAD LIVE BOOKS
            */

            await loadBooksFromFirebase();


            if (loadingScreen)
                loadingScreen.classList.add("hidden");

            if (chatApp)
                chatApp.classList.remove("hidden");


            /*
            Welcome only once
            */

            if (
                chatMessages &&
                chatMessages.children.length === 0
            ) {

                showWelcome();

            }

        }
    );

}


/* ========================================================
   LOAD BOOKS FROM FIRESTORE
======================================================== */

async function loadBooksFromFirebase() {

    books = [];


    try {

        const db =
            firebase.firestore();


        const snapshot =
            await db
                .collection("books")
                .get();


        snapshot.forEach(
            doc => {

                const data =
                    doc.data() || {};

                books.push({

                    firestoreId:
                        doc.id,

                    ...data

                });

            }
        );


        console.log(
            "✅ Live books:",
            books.length
        );

    }

    catch (error) {

        console.error(
            "Firestore books error:",
            error
        );

        books = [];

    }

}


/* ========================================================
   WELCOME
======================================================== */

function showWelcome() {

    if (!chatMessages)
        return;


    if (
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
        Aap likh sakte hain:
        <br>
        <strong>Hi</strong>
        <br>
        <strong>Show Kulliyat books</strong>
        <br>
        <strong>Latest books</strong>
        <br>
        <strong>Open Books</strong>`
    );

}


/* ========================================================
   EVENTS
======================================================== */

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


    if (micButton) {

        micButton.addEventListener(
            "click",
            toggleListening
        );

    }


    if (voiceToggle) {

        voiceToggle.addEventListener(
            "click",
            toggleVoice
        );

    }


    if (clearChat) {

        clearChat.addEventListener(
            "click",
            clearConversation
        );

    }


    document
        .querySelectorAll(
            ".quick-commands button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    if (!chatInput)
                        return;

                    chatInput.value =
                        button.dataset.command ||
                        button.textContent.trim();

                    sendMessage();

                }
            );

        });

}


/* ========================================================
   VOICE TOGGLE
======================================================== */

function toggleVoice() {

    voiceEnabled =
        !voiceEnabled;


    if (voiceToggle) {

        voiceToggle.innerHTML =
            voiceEnabled
                ? '<i class="fa-solid fa-volume-high"></i>'
                : '<i class="fa-solid fa-volume-xmark"></i>';

    }


    if (!voiceEnabled) {

        window.speechSynthesis?.cancel();

    }

}


/* ========================================================
   CLEAR CHAT
======================================================== */

function clearConversation() {

    if (!chatMessages)
        return;


    chatMessages.innerHTML = "";

    showWelcome();

}


/* ========================================================
   SEND MESSAGE
======================================================== */

async function sendMessage() {

    /*
    Prevent double clicks
    */

    if (isSending)
        return;


    /*
    LOGIN CHECK
    */

    if (!currentUser) {

        addBotMessage(
            "Please login first to use Chishti AI."
        );

        return;

    }


    const text =
        chatInput?.value.trim() || "";


    if (!text)
        return;


    /*
    Add user message
    */

    addUserMessage(text);


    if (chatInput)
        chatInput.value = "";


    isSending = true;


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

            speak(
                answer.speak
            );

        }

    }

    catch (error) {

        console.error(
            "Chishti AI error:",
            error
        );

        removeTyping();

        addBotMessage(
            "Sorry, AI mein temporary error aa gaya."
        );

    }


    isSending = false;

}


/* ========================================================
   MAIN AI PROCESSOR
======================================================== */

async function processMessage(input) {

    const query =
        normalize(input);


    if (!query) {

        return {
            text: "Ji, aap kya poochna chahte hain?",
            speak: "Ji, aap kya poochna chahte hain?"
        };

    }


    /*
    ========================================================
    1. GREETINGS — MUST COME FIRST
    ========================================================
    */

    if (isGreeting(query)) {

        return {

            text:
                getGreetingResponse(),

            speak:
                "Wa Alaikum Assalam. Main Chishti AI hoon. Aap kaise hain? Main aap ki kya madad kar sakta hoon?"

        };

    }


    /*
    ========================================================
    2. THANK YOU
    ========================================================
    */

    if (
        containsAny(query, [
            "thanks",
            "thank you",
            "shukria",
            "shukriya",
            "jazakallah",
            "jazak allah"
        ])
    ) {

        return {

            text:
                "Khush rahiye! 😊 Agar Chishti Library ke bare mein koi sawal ho to pooch sakte hain.",

            speak:
                "Khush rahiye. Agar Chishti Library ke bare mein koi sawal ho to pooch sakte hain."

        };

    }


    /*
    ========================================================
    3. HOW ARE YOU
    ========================================================
    */

    if (
        containsAny(query, [
            "how are you",
            "how r u",
            "kaise ho",
            "kese ho",
            "kia haal hai",
            "kya haal hai"
        ])
    ) {

        return {

            text:
                "Alhamdulillah, main bilkul theek hoon 😊 Aap ki madad ke liye ready hoon.",

            speak:
                "Alhamdulillah, main bilkul theek hoon. Aap ki madad ke liye ready hoon."

        };

    }


    /*
    ========================================================
    4. IDENTITY
    ========================================================
    */

    if (
        containsAny(query, [
            "who are you",
            "what are you",
            "tum kon ho",
            "aap kon ho",
            "ap kon ho",
            "your name",
            "tumhara naam",
            "aap ka naam"
        ])
    ) {

        return {

            text:
                "Main <strong>Chishti AI</strong> hoon — Chishti Library ka AI assistant. Main library ki books, authors aur available knowledge ke bare mein aap ki madad kar sakta hoon.",

            speak:
                "Main Chishti AI hoon. Chishti Library ka AI assistant."

        };

    }


    /*
    ========================================================
    5. COMMANDS
    ========================================================
    */

    if (
        isCommand(query, [
            "go home",
            "open home",
            "home kholo",
            "home open",
            "ghar kholo"
        ])
    ) {

        navigateTo(
            "index.html"
        );

        return {

            text:
                "Chishti Library Home open kar raha hoon.",

            speak:
                "Chishti Library Home open kar raha hoon."

        };

    }


    if (
        isCommand(query, [
            "open books",
            "books kholo",
            "book page kholo",
            "books page kholo"
        ])
    ) {

        navigateTo(
            "books.html"
        );

        return {

            text:
                "Books page open kar raha hoon.",

            speak:
                "Books page open kar raha hoon."

        };

    }


    /*
    ========================================================
    6. LOGOUT
    ========================================================
    */

    if (
        containsAny(query, [
            "logout",
            "log out",
            "sign out",
            "account logout"
        ])
    ) {

        try {

            await firebase
                .auth()
                .signOut();

        }

        catch (error) {

            console.error(error);

        }


        return {

            text:
                "Aap logout ho gaye hain.",

            speak:
                "Aap logout ho gaye hain."

        };

    }


    /*
    ========================================================
    7. ALL BOOKS
    ========================================================
    */

    if (
        containsAny(query, [
            "show all books",
            "all books",
            "all book",
            "list books",
            "books list",
            "kitni books hain",
            "kitni kitabain hain",
            "kitabein dikhao",
            "kitabain dikhao",
            "tamam books",
            "sari books",
            "saari books"
        ])
    ) {

        const result =
            books.slice(0, 20);


        return {

            text:
                `Library mein <strong>${books.length}</strong> books available hain:`,

            books:
                result,

            speak:
                `Library mein ${books.length} books available hain.`

        };

    }


    /*
    ========================================================
    8. LATEST BOOKS
    ========================================================
    */

    if (
        containsAny(query, [
            "latest books",
            "latest book",
            "new books",
            "new book",
            "latest release",
            "new release",
            "nayi books",
            "nai books",
            "new kitab"
        ])
    ) {

        const latest =
            getLatestBooks();


        return {

            text:
                latest.length
                    ? "Ye Chishti Library ki latest available books hain:"
                    : "Abhi latest books available nahi hain.",

            books:
                latest,

            speak:
                latest.length
                    ? "Ye Chishti Library ki latest available books hain."
                    : "Abhi latest books available nahi hain."

        };

    }


    /*
    ========================================================
    9. CATEGORY COMMANDS
    ========================================================
    */

    if (
        containsAny(query, [
            "kulliyat",
            "kuliyat"
        ])
    ) {

        return categoryResult(
            "Kulliyat"
        );

    }


    if (
        containsAny(query, [
            "naat",
            "naats"
        ])
    ) {

        return categoryResult(
            "Naat"
        );

    }


    if (
        containsAny(query, [
            "manqabat",
            "manqib"
        ])
    ) {

        return categoryResult(
            "Manqabat"
        );

    }


    if (
        containsAny(query, [
            "hamd",
            "hamdain"
        ])
    ) {

        return categoryResult(
            "Hamd"
        );

    }


    if (
        containsAny(query, [
            "maqala",
            "maqalat",
            "article",
            "articles"
        ])
    ) {

        return categoryResult(
            "Maqala"
        );

    }


    if (
        containsAny(query, [
            "seerat",
            "seerah"
        ])
    ) {

        return categoryResult(
            "Seerat"
        );

    }


    /*
    ========================================================
    10. KNOWLEDGE.JSON
    ========================================================
    */

    const knowledgeResult =
        findKnowledge(query);


    if (knowledgeResult) {

        return {

            text:
                safeKnowledgeAnswer(
                    knowledgeResult.answer ||
                    knowledgeResult.response ||
                    knowledgeResult.content ||
                    ""
                ),

            speak:
                stripHtml(
                    knowledgeResult.answer ||
                    knowledgeResult.response ||
                    knowledgeResult.content ||
                    ""
                ),

            books: []

        };

    }


    /*
    ========================================================
    11. BOOK SEARCH
    ========================================================
    */

    const foundBooks =
        searchBooks(query);


    if (
        foundBooks.length > 0
    ) {

        /*
        ONE exact/strong book
        */

        if (
            foundBooks.length === 1
        ) {

            const book =
                foundBooks[0];


            return {

                text:
                    `Ji, mujhe <strong>${escapeHtml(book.title || "ye book")}</strong> library database mein mil gayi hai:`,

                books:
                    [book],

                speak:
                    `${book.title || "Ye book"} library database mein available hai.`

            };

        }


        return {

            text:
                `Ji, mujhe <strong>${foundBooks.length}</strong> matching books mili hain:`,

            books:
                foundBooks,

            speak:
                `${foundBooks.length} matching books library database mein mili hain.`

        };

    }


    /*
    ========================================================
    12. AUTHOR QUERY
    ========================================================
    */

    if (
        containsAny(query, [
            "author",
            "authors",
            "writer",
            "writers",
            "musannif",
            "musannifeen"
        ])
    ) {

        navigateTo(
            "authors.html"
        );

        return {

            text:
                "Authors page open kar raha hoon.",

            speak:
                "Authors page open kar raha hoon."

        };

    }


    /*
    ========================================================
    13. DEFAULT
    ========================================================
    */

    return {

        text:
            `Ji, main samajhne ki koshish kar raha hoon 😊<br><br>
            Aap mujh se ye pooch sakte hain:
            <br><br>
            • <strong>Hi</strong>
            <br>
            • <strong>What is Chishti Library?</strong>
            <br>
            • <strong>Show Kulliyat books</strong>
            <br>
            • <strong>Latest books</strong>
            <br>
            • <strong>Show all books</strong>
            <br>
            • <strong>Open Books</strong>`,

        speak:
            "Ji, main aap ki madad kar sakta hoon. Aap Chishti Library, books, authors ya knowledge ke bare mein pooch sakte hain."

    };

}


/* ========================================================
   GREETING DETECTOR
======================================================== */

function isGreeting(query) {

    const greetings = [

        "hi",
        "hello",
        "hey",
        "hy",
        "hii",
        "hiii",
        "salam",
        "salaam",
        "assalamualaikum",
        "assalamu alaikum",
        "asalamualaikum",
        "aoa",
        "aoa ji",
        "good morning",
        "good afternoon",
        "good evening",
        "good night"

    ];


    /*
    Exact greeting
    */

    if (
        greetings.includes(query)
    ) {

        return true;

    }


    /*
    Greeting with punctuation/extra words
    */

    if (
        query.startsWith(
            "assalamualaikum"
        )
    ) {

        return true;

    }


    return false;

}


/* ========================================================
   GREETING RESPONSE
======================================================== */

function getGreetingResponse() {

    return `
        Wa Alaikum Assalam 👋
        <br><br>
        <strong>Welcome to Chishti AI.</strong>
        <br><br>
        Main aap ki kya madad kar sakta hoon?
    `;

}


/* ========================================================
   CATEGORY RESULT
======================================================== */

function categoryResult(category) {

    const target =
        normalize(category);


    const result =
        books.filter(book => {

            const title =
                normalize(
                    book.title || ""
                );

            const bookCategory =
                normalize(
                    book.category || ""
                );

            const description =
                normalize(
                    book.description || ""
                );


            if (
                target === "kulliyat"
            ) {

                return (
                    bookCategory.includes("kulliyat") ||
                    bookCategory.includes("kuliyat") ||
                    title.includes("kulliyat") ||
                    title.includes("kuliyat")
                );

            }


            return (
                bookCategory.includes(target) ||
                title.includes(target) ||
                description.includes(target)
            );

        });


    return {

        text:
            result.length
                ? `<strong>${escapeHtml(category)}</strong> mein <strong>${result.length}</strong> books available hain:`
                : `Mujhe abhi <strong>${escapeHtml(category)}</strong> category mein koi book nahi mili.`,

        books:
            result,

        speak:
            result.length
                ? `${result.length} ${category} books available hain.`
                : `Mujhe abhi ${category} category mein koi book nahi mili.`

    };

}


/* ========================================================
   BOOK SEARCH
======================================================== */

function searchBooks(query) {

    /*
    IMPORTANT FIX:

    Very short words such as:

    hi
    he
    in
    is

    should NEVER search inside book titles.

    This fixes:

    "hi"

    matching:

    "Chishti"
    */

    const clean =
        normalize(query);


    if (
        !clean ||
        clean.length < 3
    ) {

        return [];

    }


    /*
    Stop generic words
    */

    const stopWords = new Set([

        "the",
        "and",
        "for",
        "book",
        "books",
        "show",
        "open",
        "please",
        "give",
        "find",
        "tell",
        "about"

    ]);


    const words =
        clean
            .split(" ")
            .filter(
                word =>
                    word.length >= 3 &&
                    !stopWords.has(word)
            );


    /*
    No useful search terms
    */

    if (
        words.length === 0
    ) {

        return [];

    }


    const results =
        books
            .map(book => {

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


                let score = 0;


                /*
                Exact title
                */

                if (
                    title === clean
                ) {

                    score += 200;

                }


                /*
                Exact phrase
                */

                if (
                    title.includes(clean)
                ) {

                    score += 100;

                }


                /*
                Author exact phrase
                */

                if (
                    author.includes(clean)
                ) {

                    score += 60;

                }


                /*
                Category
                */

                if (
                    category.includes(clean)
                ) {

                    score += 40;

                }


                /*
                Individual words
                */

                words.forEach(word => {

                    /*
                    Title gets highest score
                    */

                    if (
                        title
                            .split(" ")
                            .includes(word)
                    ) {

                        score += 35;

                    }

                    else if (
                        title.includes(word)
                    ) {

                        score += 20;

                    }


                    /*
                    Author
                    */

                    if (
                        author.includes(word)
                    ) {

                        score += 12;

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
            .filter(
                item =>
                    item.score >= 20
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 10)
            .map(
                item =>
                    item.book
            );


    return results;

}


/* ========================================================
   LATEST BOOKS
======================================================== */

function getLatestBooks() {

    return [...books]
        .sort(
            (a, b) =>
                getBookDate(b) -
                getBookDate(a)
        )
        .slice(0, 8);

}


/* ========================================================
   BOOK DATE
======================================================== */

function getBookDate(book) {

    const value =
        book.createdAt ||
        book.timestamp ||
        book.date ||
        0;


    if (
        value &&
        typeof value.toMillis === "function"
    ) {

        return value.toMillis();

    }


    if (
        value &&
        typeof value.seconds === "number"
    ) {

        return value.seconds * 1000;

    }


    const parsed =
        Date.parse(value);


    if (
        !Number.isNaN(parsed)
    ) {

        return parsed;

    }


    return 0;

}


/* ========================================================
   KNOWLEDGE SEARCH
======================================================== */

function findKnowledge(query) {

    if (
        !Array.isArray(knowledge) ||
        !knowledge.length
    ) {

        return null;

    }


    let best = null;

    let bestScore = 0;


    for (
        const item of knowledge
    ) {

        const question =
            normalize(
                item.question ||
                item.q ||
                item.title ||
                ""
            );


        if (!question)
            continue;


        /*
        Exact match
        */

        if (
            question === query
        ) {

            return item;

        }


        let score = 0;


        /*
        Exact phrase
        */

        if (
            question.includes(query)
        ) {

            score += 60;

        }


        if (
            query.includes(question) &&
            question.length >= 5
        ) {

            score += 50;

        }


        const words =
            question
                .split(" ")
                .filter(
                    word =>
                        word.length >= 3
                );


        words.forEach(word => {

            if (
                query.includes(word)
            ) {

                score += 10;

            }

        });


        if (
            score > bestScore
        ) {

            bestScore =
                score;

            best =
                item;

        }

    }


    /*
    Don't return weak/random answers
    */

    return (
        bestScore >= 20
            ? best
            : null
    );

}


/* ========================================================
   SAFE KNOWLEDGE ANSWER
======================================================== */

function safeKnowledgeAnswer(answer) {

    /*
    Knowledge JSON answers may contain
    trusted HTML formatting.

    If you don't want HTML,
    this can later be changed.
    */

    return String(
        answer || ""
    );

}


/* ========================================================
   COMMAND CHECK
======================================================== */

function isCommand(
    query,
    commands
) {

    return commands.some(
        command =>
            query === normalize(command)
    );

}


/* ========================================================
   CONTAINS ANY
======================================================== */

function containsAny(
    text,
    values
) {

    return values.some(
        value =>
            text.includes(
                normalize(value)
            )
    );

}


/* ========================================================
   NORMALIZE
======================================================== */

function normalize(value) {

    return String(
        value || ""
    )
        .toLowerCase()
        .replace(
            /[’']/g,
            ""
        )
        .replace(
            /[-_]/g,
            " "
        )
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


/* ========================================================
   USER MESSAGE
======================================================== */

function addUserMessage(text) {

    if (!chatMessages)
        return;


    const div =
        document.createElement("div");


    div.className =
        "message user-message";


    div.textContent =
        text;


    chatMessages.appendChild(
        div
    );


    scrollChat();

}


/* ========================================================
   BOT MESSAGE
======================================================== */

function addBotMessage(
    text,
    resultBooks = []
) {

    if (!chatMessages)
        return;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "message bot-message";


    wrapper.innerHTML =
        text;


    /*
    Add books only if actually requested
    */

    if (
        Array.isArray(resultBooks) &&
        resultBooks.length
    ) {

        resultBooks
            .slice(0, 10)
            .forEach(
                book => {

                    wrapper.appendChild(
                        createBookCard(book)
                    );

                }
            );

    }


    chatMessages.appendChild(
        wrapper
    );


    scrollChat();

}


/* ========================================================
   CREATE BOOK CARD
======================================================== */

function createBookCard(book) {

    const card =
        document.createElement("div");


    card.className =
        "book-result";


    const cover =
        book.cover ||
        book.coverUrl ||
        book.image ||
        book.imageUrl ||
        "logo.png";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        book.authorName ||
        "Unknown Author";


    const category =
        book.category ||
        "";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        book.downloadUrl ||
        "";


    const online =
        book.onlineUrl ||
        book.readUrl ||
        book.readerUrl ||
        book.html ||
        "";


    /*
    If no online URL, use PDF.
    */

    const readLink =
        online ||
        pdf ||
        "books.html";


    /*
    Escape everything
    */

    const safeTitle =
        escapeHtml(title);

    const safeAuthor =
        escapeHtml(author);

    const safeCategory =
        escapeHtml(category);


    card.innerHTML = `

        <div class="book-result-image">

            <img
                src="${safeUrl(cover)}"
                alt="${safeTitle}"
                loading="lazy"
                onerror="this.onerror=null;this.src='logo.png';"
            >

        </div>


        <div class="book-result-info">

            <h4>
                📚 ${safeTitle}
            </h4>


            <p>
                👤 ${safeAuthor}
            </p>


            ${
                category
                    ? `
                    <p>
                        📁 ${safeCategory}
                    </p>
                    `
                    : ""
            }


            <div class="book-result-actions">

                ${
                    readLink
                        ? `
                        <a
                            class="book-read-btn"
                            href="${safeUrl(readLink)}"
                            ${
                                /^https?:\/\//i.test(
                                    readLink
                                )
                                    ? 'target="_blank" rel="noopener noreferrer"'
                                    : ""
                            }
                        >
                            📖 Read Online
                        </a>
                        `
                        : ""
                }


                ${
                    pdf
                        ? `
                        <a
                            class="book-download-btn"
                            href="${safeUrl(pdf)}"
                            download
                        >
                            ↓ Download
                        </a>
                        `
                        : ""
                }

            </div>

        </div>

    `;


    return card;

}


/* ========================================================
   TYPING
======================================================== */

function showTyping() {

    if (!chatMessages)
        return;


    if (
        document.getElementById(
            "typing"
        )
    ) {

        return;

    }


    const typing =
        document.createElement("div");


    typing.id =
        "typing";


    typing.className =
        "message bot-message typing";


    typing.innerHTML = `

        <span>Chishti AI is thinking</span>

        <span class="typing-dots">
            • • •
        </span>

    `;


    chatMessages.appendChild(
        typing
    );


    scrollChat();

}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing"
        );


    if (typing) {

        typing.remove();

    }

}


/* ========================================================
   VOICE RECOGNITION
======================================================== */

function setupVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (
        !SpeechRecognition
    ) {

        console.warn(
            "Speech Recognition not supported."
        );


        if (micButton) {

            micButton.style.display =
                "none";

        }


        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    /*
    Urdu first.
    Browser may fallback depending
    on installed language support.
    */

    recognition.lang =
        "ur-PK";


    recognition.onstart =
        () => {

            isListening =
                true;


            if (micButton) {

                micButton.classList.add(
                    "listening"
                );

            }


            if (voiceStatus) {

                voiceStatus.textContent =
                    "🎙️ Listening...";

            }

        };


    recognition.onend =
        () => {

            isListening =
                false;


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
        event => {

            console.error(
                "Voice error:",
                event.error
            );


            isListening =
                false;


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
                event
                    .results[0][0]
                    .transcript
                    .trim();


            if (!transcript)
                return;


            if (chatInput) {

                chatInput.value =
                    transcript;

            }


            sendMessage();

        };

}


/* ========================================================
   TOGGLE LISTENING
======================================================== */

function toggleListening() {

    if (!currentUser) {

        addBotMessage(
            "Please login first to use voice."
        );

        return;

    }


    if (!recognition) {

        alert(
            "Aap ka browser voice recognition support nahi karta. Chrome/Edge try karein."
        );

        return;

    }


    try {

        if (isListening) {

            recognition.stop();

        } else {

            recognition.start();

        }

    }

    catch (error) {

        console.error(
            "Voice start error:",
            error
        );

    }

}


/* ========================================================
   TEXT TO SPEECH
======================================================== */

function speak(text) {

    if (
        !voiceEnabled
    ) {

        return;

    }


    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const cleanText =
        stripHtml(text)
            .trim();


    if (!cleanText)
        return;


    window.speechSynthesis.cancel();


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


    /*
    Prefer Urdu voice.
    */

    const voices =
        window.speechSynthesis
            .getVoices();


    let preferred =
        voices.find(
            voice =>
                /^ur(-|_)/i.test(
                    voice.lang
                )
        );


    /*
    Then Hindi
    */

    if (!preferred) {

        preferred =
            voices.find(
                voice =>
                    /^hi(-|_)/i.test(
                        voice.lang
                    )
            );

    }


    /*
    Then English
    */

    if (!preferred) {

        preferred =
            voices.find(
                voice =>
                    /^en(-|_)/i.test(
                        voice.lang
                    )
            );

    }


    if (preferred) {

        utterance.voice =
            preferred;

    }


    window.speechSynthesis.speak(
        utterance
    );

}


/* ========================================================
   SPEECH VOICES READY
======================================================== */

if (
    "speechSynthesis" in window
) {

    window.speechSynthesis
        .addEventListener(
            "voiceschanged",
            () => {

                console.log(
                    "🔊 Speech voices loaded"
                );

            }
        );

}


/* ========================================================
   NAVIGATION
======================================================== */

function navigateTo(
    page
) {

    window.location.href =
        page;

}


/* ========================================================
   SCROLL
======================================================== */

function scrollChat() {

    if (!chatMessages)
        return;


    requestAnimationFrame(
        () => {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

}


/* ========================================================
   STRIP HTML
======================================================== */

function stripHtml(html) {

    const temp =
        document.createElement(
            "div"
        );


    temp.innerHTML =
        html;


    return (
        temp.textContent ||
        temp.innerText ||
        ""
    );

}


/* ========================================================
   ESCAPE HTML
======================================================== */

function escapeHtml(value) {

    return String(
        value ?? ""
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


/* ========================================================
   SAFE URL
======================================================== */

function safeUrl(url) {

    const value =
        String(
            url || ""
        ).trim();


    if (
        /^javascript:/i.test(
            value
        )
    ) {

        return "#";

    }


    if (
        /^data:/i.test(
            value
        )
    ) {

        return "#";

    }


    return value;

}


/* ========================================================
   FIREBASE ERROR
======================================================== */

function showFirebaseError(
    message
) {

    console.error(
        message
    );


    if (loadingScreen) {

        loadingScreen.classList.add(
            "hidden"
        );

    }


    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

}


/* ========================================================
   GENERAL ERROR
======================================================== */

function showError(
    message
) {

    if (!chatApp)
        return;


    chatApp.classList.remove(
        "hidden"
    );


    addBotMessage(
        `<strong>Error:</strong><br>${escapeHtml(message)}`
    );

}


/* ========================================================
   GLOBAL DEBUG
======================================================== */

window.ChishtiAI = {

    getUser: () =>
        currentUser,

    getBooks: () =>
        books,

    getKnowledge: () =>
        knowledge,

    searchBooks,

    findKnowledge,

    speak,

    sendMessage

};


console.log(
    "======================================"
);

console.log(
    "🤖 CHISHTI AI READY"
);

console.log(
    "📚 Firestore books enabled"
);

console.log(
    "🧠 knowledge.json enabled"
);

console.log(
    "🎙️ Urdu voice enabled"
);

console.log(
    "🔊 Voice reply enabled"
);

console.log(
    "🔐 Login-only mode enabled"
);

console.log(
    "======================================"
);
