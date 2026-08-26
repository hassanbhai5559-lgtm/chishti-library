"use strict";

/* =========================================================
   CHISHTI LIBRARY
   COMPLETE MAIN SCRIPT
   Firebase + Books + Search + Sort + Categories
   Comments + Share + CHISHTI AI JARVIS + Voice
========================================================= */


/* =========================================================
   GLOBAL STATE
========================================================= */

let libraryBooks = [];
let knowledge = [];

let currentUser = null;

let currentCategory = "All";
let currentSort = "latest";

let aiVoiceEnabled = true;
let recognition = null;
let isListening = false;

let currentShareBook = null;


/* =========================================================
   DOM HELPERS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const booksContainer = $("booksContainer");
const searchInput = $("searchInput");
const bookCounter = $("bookCounter");
const visitorCounter = $("visitorCounter");

const chatBtn = $("chatBtn");
const chatWindow = $("chatWindow");
const closeChat = $("closeChat");

const chatMessages = $("chatMessages");
const chatInput = $("chatInput");

const commentModal = $("commentModal");
const commentsList = $("commentsList");
const commentForm = $("commentForm");
const commentInput = $("commentInput");
const closeComments = $("closeComments");

const sharePopup = $("sharePopup");
const copyBookLink = $("copyBookLink");

const scrollTopButton = $("scrollTop");


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    console.log("=================================");
    console.log("CHISHTI LIBRARY STARTING...");
    console.log("=================================");

    setupNavigation();

    setupChat();

    setupComments();

    setupShare();

    setupScrollTop();

    setupSortingButtons();

    setupCategoryButtons();

    setupSearch();

    setupVoice();

    await loadKnowledge();

    await initFirebase();

    console.log("=================================");
    console.log("CHISHTI LIBRARY READY");
    console.log("=================================");

});


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

async function initFirebase() {

    try {

        if (
            typeof firebase === "undefined"
        ) {

            console.error(
                "Firebase SDK not found."
            );

            return;

        }


        if (
            !firebase.apps ||
            !firebase.apps.length
        ) {

            console.error(
                "Firebase has not been initialized."
            );

            return;

        }


        const auth =
            firebase.auth();


        auth.onAuthStateChanged(
            async function (user) {

                currentUser =
                    user || null;


                updateLoginUI(user);


                if (user) {

                    console.log(
                        "Logged in:",
                        user.email || user.uid
                    );


                    await loadBooks();


                    updateBookCounter();

                    await updateVisitorCounter();


                    /*
                    AI gets activated for logged-in users
                    */

                    enableJarvis();


                } else {

                    console.log(
                        "No logged-in user."
                    );


                    /*
                    Books can still be visible
                    on public library.
                    */

                    await loadBooks();


                    updateBookCounter();


                    /*
                    AI stays locked.
                    */

                    lockJarvis();

                }

            }
        );


    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

    }

}


/* =========================================================
   LOAD BOOKS FROM FIRESTORE
========================================================= */

async function loadBooks() {

    libraryBooks = [];


    try {

        if (
            typeof firebase === "undefined"
        ) {
            return;
        }


        const db =
            firebase.firestore();


        const snapshot =
            await db
                .collection("books")
                .get();


        snapshot.forEach(function (doc) {

            const data =
                doc.data() || {};


            libraryBooks.push({

                firestoreId: doc.id,

                ...data

            });

        });


        console.log(
            "Books loaded:",
            libraryBooks.length
        );


        renderBooks(
            libraryBooks
        );


        updateBookCounter();


    } catch (error) {

        console.error(
            "Book loading error:",
            error
        );


        /*
        If Firestore fails, don't destroy
        the complete website.
        */

        if (booksContainer) {

            booksContainer.innerHTML = `

                <div class="library-error">

                    Unable to load books right now.

                </div>

            `;

        }

    }

}


/* =========================================================
   KNOWLEDGE.JSON
========================================================= */

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
          knowledge: [...]
        }
        */

        if (Array.isArray(data)) {

            knowledge = data;

        }

        else if (
            Array.isArray(data.knowledge)
        ) {

            knowledge =
                data.knowledge;

        }

        else {

            knowledge = [];

        }


        console.log(
            "Knowledge loaded:",
            knowledge.length
        );


    } catch (error) {

        console.error(
            "Knowledge error:",
            error
        );


        knowledge = [];

    }

}


/* =========================================================
   UPDATE LOGIN UI
========================================================= */

function updateLoginUI(user) {

    const loginNav =
        $("loginNav");


    if (!loginNav) {
        return;
    }


    if (user) {

        const email =
            user.email ||
            "User";


        loginNav.innerHTML = `

            <i class="fa-solid fa-user-check"></i>

            <span>
                ${escapeHTML(email)}
            </span>

        `;


        loginNav.href =
            "#";


        loginNav.classList.add(
            "user-email"
        );

    }

    else {

        loginNav.innerHTML = `

            <i class="fa-solid fa-right-to-bracket"></i>

            <span>
                Login
            </span>

        `;


        loginNav.href =
            "./login.html";


        loginNav.classList.remove(
            "user-email"
        );

    }

}


/* =========================================================
   BOOK COUNTER
========================================================= */

function updateBookCounter() {

    if (!bookCounter) {
        return;
    }


    animateCounter(
        bookCounter,
        libraryBooks.length
    );

}


/* =========================================================
   VISITOR COUNTER
========================================================= */

async function updateVisitorCounter() {

    if (!visitorCounter) {
        return;
    }


    try {

        const db =
            firebase.firestore();


        const ref =
            db.collection(
                "siteStats"
            ).doc(
                "visitors"
            );


        await ref.set({

            count:
                firebase.firestore.FieldValue.increment(1),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        }, {
            merge: true
        });


        const snapshot =
            await ref.get();


        if (snapshot.exists) {

            const data =
                snapshot.data();


            animateCounter(
                visitorCounter,
                data.count || 0
            );

        }

    } catch (error) {

        console.warn(
            "Visitor counter:",
            error
        );

    }

}


/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounter(
    element,
    target
) {

    target =
        Number(target) || 0;


    const duration =
        800;


    const start =
        performance.now();


    function update(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        const value =
            Math.floor(
                target * progress
            );


        element.textContent =
            value.toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks(
    books
) {

    if (!booksContainer) {
        return;
    }


    booksContainer.innerHTML =
        "";


    if (
        !books ||
        !books.length
    ) {

        booksContainer.innerHTML = `

            <div class="no-books">

                <i class="fa-solid fa-book-open"></i>

                <h3>
                    No books found
                </h3>

                <p>
                    Books will appear here when
                    they are added to the library.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(function (book) {

        booksContainer.appendChild(
            createLibraryBookCard(book)
        );

    });

}


/* =========================================================
   CREATE LIBRARY BOOK CARD
========================================================= */

function createLibraryBookCard(
    book
) {

    const card =
        document.createElement("article");


    card.className =
        "book-card";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        "Unknown Author";


    const category =
        book.category ||
        "";


    const cover =
        book.cover ||
        book.coverUrl ||
        "logo.png";


    const readURL =
        book.readUrl ||
        book.read ||
        book.url ||
        (
            book.id
                ? `book.html?id=${encodeURIComponent(book.id)}`
                : "books.html"
        );


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    card.innerHTML = `

        <div class="book-card-image">

            <img
                src="${safeURL(cover)}"
                alt="${escapeHTML(title)}"
                loading="lazy"
                onerror="this.src='logo.png'"
            >

        </div>


        <div class="book-card-content">

            ${
                category
                    ? `
                        <span class="book-category">
                            ${escapeHTML(category)}
                        </span>
                    `
                    : ""
            }


            <h3>
                ${escapeHTML(title)}
            </h3>


            <p>
                <i class="fa-solid fa-user"></i>

                ${escapeHTML(author)}
            </p>


            <div class="book-actions">

                <a
                    href="${safeURL(readURL)}"
                    class="btn"
                >
                    <i class="fa-solid fa-book-open"></i>
                    Read Online
                </a>


                ${
                    pdf
                        ? `
                            <a
                                href="${safeURL(pdf)}"
                                class="btn"
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                            >
                                <i class="fa-solid fa-download"></i>
                                Download
                            </a>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="book-comment-btn"
                    data-book-id="${escapeHTML(
                        book.firestoreId ||
                        book.id ||
                        title
                    )}"
                >
                    <i class="fa-solid fa-comments"></i>
                </button>


                <button
                    type="button"
                    class="book-share-btn"
                    data-book-id="${escapeHTML(
                        book.firestoreId ||
                        book.id ||
                        title
                    )}"
                >
                    <i class="fa-solid fa-share-nodes"></i>
                </button>

            </div>

        </div>

    `;


    /*
    Comment button
    */

    const commentButton =
        card.querySelector(
            ".book-comment-btn"
        );


    if (commentButton) {

        commentButton.addEventListener(
            "click",
            function () {

                openComments(book);

            }
        );

    }


    /*
    Share button
    */

    const shareButton =
        card.querySelector(
            ".book-share-btn"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            function () {

                openShare(book);

            }
        );

    }


    return card;

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            searchBooks(
                this.value
            );

        }
    );

}


/* =========================================================
   GLOBAL SEARCH BOOKS
========================================================= */

window.searchBooks =
function (query) {

    const text =
        normalize(query);


    if (!text) {

        applyCurrentView();

        return;

    }


    const words =
        text
            .split(" ")
            .filter(
                word =>
                    word.length > 1
            );


    const results =
        libraryBooks
            .map(function (book) {

                const title =
                    normalize(
                        book.title
                    );


                const author =
                    normalize(
                        book.author
                    );


                const category =
                    normalize(
                        book.category
                    );


                const description =
                    normalize(
                        book.description
                    );


                let score = 0;


                /*
                Exact title
                */

                if (
                    title === text
                ) {

                    score += 200;

                }


                /*
                Full title match
                */

                if (
                    title.includes(text)
                ) {

                    score += 100;

                }


                /*
                Author
                */

                if (
                    author.includes(text)
                ) {

                    score += 50;

                }


                /*
                Category
                */

                if (
                    category.includes(text)
                ) {

                    score += 40;

                }


                /*
                Description
                */

                if (
                    description.includes(text)
                ) {

                    score += 20;

                }


                words.forEach(
                    function (word) {

                        if (
                            title.includes(word)
                        ) {
                            score += 15;
                        }


                        if (
                            author.includes(word)
                        ) {
                            score += 8;
                        }


                        if (
                            category.includes(word)
                        ) {
                            score += 6;
                        }


                        if (
                            description.includes(word)
                        ) {
                            score += 3;
                        }

                    }
                );


                return {
                    book,
                    score
                };

            })
            .filter(
                item =>
                    item.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .map(
                item =>
                    item.book
            );


    renderBooks(
        results
    );

};


/* =========================================================
   SORTING
========================================================= */

function setupSortingButtons() {

    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const onclick =
                            button.getAttribute(
                                "onclick"
                            );


                        if (onclick) {
                            return;
                        }

                    }
                );

            }
        );

}


/* =========================================================
   GLOBAL SORT BOOKS
========================================================= */

window.sortBooks =
function (type) {

    currentSort =
        type || "latest";


    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(
            function (button) {

                const onclick =
                    button.getAttribute(
                        "onclick"
                    );


                if (
                    onclick &&
                    onclick.includes(
                        `'${type}'`
                    )
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    applyCurrentView();

};


/* =========================================================
   APPLY SORT / FILTER
========================================================= */

function applyCurrentView() {

    let result =
        [...libraryBooks];


    /*
    CATEGORY
    */

    if (
        currentCategory &&
        currentCategory !== "All"
    ) {

        const wanted =
            normalize(
                currentCategory
            );


        result =
            result.filter(
                function (book) {

                    return normalize(
                        book.category
                    ).includes(
                        wanted
                    );

                }
            );

    }


    /*
    SORT
    */

    if (
        currentSort === "latest"
    ) {

        result.sort(
            compareNewest
        );

    }

    else if (
        currentSort === "oldest"
    ) {

        result.sort(
            compareOldest
        );

    }

    else if (
        currentSort === "liked"
    ) {

        result.sort(
            function (a, b) {

                return (
                    Number(
                        b.likes || 0
                    ) -
                    Number(
                        a.likes || 0
                    )
                );

            }
        );

    }

    else if (
        currentSort === "popular"
    ) {

        result.sort(
            function (a, b) {

                return (
                    Number(
                        b.views || 0
                    ) -
                    Number(
                        a.views || 0
                    )
                );

            }
        );

    }


    renderBooks(
        result
    );

}


/* =========================================================
   DATE HELPERS
========================================================= */

function getBookDate(book) {

    const value =
        book.createdAt ||
        book.timestamp ||
        book.date ||
        0;


    if (
        value &&
        typeof value === "object" &&
        value.seconds
    ) {

        return Number(
            value.seconds
        );

    }


    const parsed =
        Date.parse(value);


    if (
        !isNaN(parsed)
    ) {

        return parsed;

    }


    return Number(value) || 0;

}


function compareNewest(a, b) {

    return (
        getBookDate(b) -
        getBookDate(a)
    );

}


function compareOldest(a, b) {

    return (
        getBookDate(a) -
        getBookDate(b)
    );

}


/* =========================================================
   CATEGORIES
========================================================= */

function setupCategoryButtons() {

    /*
    Existing HTML uses onclick="filterBooks(...)"
    so we only keep compatibility here.
    */

}


/* =========================================================
   GLOBAL FILTER BOOKS
========================================================= */

window.filterBooks =
function (category) {

    currentCategory =
        category || "All";


    document
        .querySelectorAll(
            ".category"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );


                const text =
                    normalize(
                        button.textContent
                    );


                if (
                    text ===
                    normalize(category)
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    applyCurrentView();

};


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    const mobileMenu =
        document.querySelector(
            ".mobile-menu"
        );


    const menu =
        document.querySelector(
            ".menu"
        );


    if (
        mobileMenu &&
        menu
    ) {

        mobileMenu.addEventListener(
            "click",
            function () {

                menu.classList.toggle(
                    "active"
                );

            }
        );

    }

}


/* =========================================================
   ================= CHISHTI AI =================
========================================================= */


/* =========================================================
   SETUP CHAT
========================================================= */

function setupChat() {

    if (!chatBtn) {
        return;
    }


    /*
    Existing chat button
    */

    chatBtn.addEventListener(
        "click",
        function () {

            /*
            Login required
            */

            if (!currentUser) {

                showLoginRequired();

                return;

            }


            openJarvis();

        }
    );


    if (closeChat) {

        closeChat.addEventListener(
            "click",
            function () {

                closeJarvis();

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

                    sendJarvisMessage();

                }

            }
        );

    }


    /*
    Existing send button if available
    */

    const send =
        $("sendButton");


    if (send) {

        send.addEventListener(
            "click",
            sendJarvisMessage
        );

    }


    /*
    Build voice controls
    */

    createJarvisControls();

}


/* =========================================================
   CREATE JARVIS CONTROLS
========================================================= */

function createJarvisControls() {

    if (!chatWindow) {
        return;
    }


    /*
    Prevent duplicates
    */

    if (
        $("jarvisControls")
    ) {

        return;

    }


    const inputArea =
        chatWindow.querySelector(
            ".chat-input"
        );


    if (!inputArea) {
        return;
    }


    const controls =
        document.createElement(
            "div"
        );


    controls.id =
        "jarvisControls";


    controls.innerHTML = `

        <button
            type="button"
            id="jarvisMic"
            title="Voice Input"
            aria-label="Voice Input"
        >
            <i class="fa-solid fa-microphone"></i>
        </button>


        <button
            type="button"
            id="jarvisVoice"
            title="Voice Reply"
            aria-label="Voice Reply"
        >
            <i class="fa-solid fa-volume-high"></i>
        </button>


        <span
            id="jarvisStatus"
        ></span>

    `;


    inputArea.insertBefore(
        controls,
        inputArea.firstChild
    );


    const mic =
        $("jarvisMic");


    const voice =
        $("jarvisVoice");


    if (mic) {

        mic.addEventListener(
            "click",
            function () {

                if (!currentUser) {

                    showLoginRequired();

                    return;

                }


                toggleVoiceInput();

            }
        );

    }


    if (voice) {

        voice.addEventListener(
            "click",
            function () {

                aiVoiceEnabled =
                    !aiVoiceEnabled;


                voice.innerHTML =
                    aiVoiceEnabled
                        ? '<i class="fa-solid fa-volume-high"></i>'
                        : '<i class="fa-solid fa-volume-xmark"></i>';


                if (
                    !aiVoiceEnabled &&
                    "speechSynthesis" in window
                ) {

                    speechSynthesis.cancel();

                }

            }
        );

    }

}


/* =========================================================
   LOGIN REQUIRED
========================================================= */

function showLoginRequired() {

    if (!chatWindow) {
        return;
    }


    chatWindow.classList.add(
        "active"
    );


    if (chatMessages) {

        chatMessages.innerHTML = `

            <div class="bot-message">

                <strong>
                    🔐 Chishti AI Login Required
                </strong>

                <br><br>

                Chishti AI sirf logged-in users
                ke liye available hai.

                <br><br>

                <a
                    href="./login.html"
                    class="jarvis-login-button"
                >
                    <i class="fa-solid fa-right-to-bracket"></i>
                    Login to Continue
                </a>

            </div>

        `;

    }

}


/* =========================================================
   OPEN JARVIS
========================================================= */

function openJarvis() {

    if (!currentUser) {

        showLoginRequired();

        return;

    }


    if (!chatWindow) {
        return;
    }


    chatWindow.classList.add(
        "active"
    );


    chatWindow.classList.remove(
        "hidden"
    );


    /*
    Add welcome only once
    */

    if (
        chatMessages &&
        !chatMessages.dataset.jarvisReady
    ) {

        chatMessages.innerHTML =
            "";


        addJarvisMessage(
            getJarvisWelcome()
        );


        chatMessages.dataset.jarvisReady =
            "true";

    }


    setTimeout(
        function () {

            if (chatInput) {

                chatInput.focus();

            }

        },
        150
    );

}


/* =========================================================
   CLOSE JARVIS
========================================================= */

function closeJarvis() {

    if (!chatWindow) {
        return;
    }


    chatWindow.classList.remove(
        "active"
    );

    chatWindow.classList.add(
        "hidden"
    );


    if (
        "speechSynthesis" in window
    ) {

        speechSynthesis.cancel();

    }

}


/* =========================================================
   ENABLE JARVIS
========================================================= */

function enableJarvis() {

    if (!chatBtn) {
        return;
    }


    chatBtn.classList.remove(
        "jarvis-locked"
    );


    chatBtn.title =
        "Open Chishti AI";


    chatBtn.setAttribute(
        "aria-label",
        "Open Chishti AI"
    );

}


/* =========================================================
   LOCK JARVIS
========================================================= */

function lockJarvis() {

    if (!chatBtn) {
        return;
    }


    chatBtn.classList.add(
        "jarvis-locked"
    );


    chatBtn.title =
        "Login required";


    chatBtn.setAttribute(
        "aria-label",
        "Login required"
    );

}


/* =========================================================
   WELCOME
========================================================= */

function getJarvisWelcome() {

    const name =
        currentUser?.displayName ||
        currentUser?.email?.split("@")[0] ||
        "Reader";


    return `

        <strong>
            Assalamu Alaikum 👋
        </strong>

        <br><br>

        ${escapeHTML(name)}, main
        <strong>Chishti AI</strong> hoon.

        <br><br>

        Aap mujh se library,
        books, authors aur available
        information ke bare mein pooch sakte hain.

        <br><br>

        <strong>Try:</strong>

        <br>

        • Hi

        <br>

        • What is Chishti Library?

        <br>

        • Who is Hazrat Allama Saim Chishti?

        <br>

        • Show all books

        <br>

        • Show Naat books

    `;

}


/* =========================================================
   SEND JARVIS MESSAGE
========================================================= */

async function sendJarvisMessage() {

    if (!currentUser) {

        showLoginRequired();

        return;

    }


    if (!chatInput) {
        return;
    }


    const text =
        chatInput.value.trim();


    if (!text) {
        return;
    }


    addUserMessage(
        text
    );


    chatInput.value =
        "";


    showJarvisTyping();


    try {

        const response =
            await processJarvis(
                text
            );


        removeJarvisTyping();


        addJarvisMessage(
            response.text,
            response.books
        );


        if (
            aiVoiceEnabled &&
            response.speak
        ) {

            speakJarvis(
                response.speak
            );

        }

    } catch (error) {

        console.error(
            "Jarvis error:",
            error
        );


        removeJarvisTyping();


        addJarvisMessage(
            "Sorry, kuch error aa gaya. Please dobara try karein."
        );

    }

}


/* =========================================================
   PROCESS JARVIS
========================================================= */

async function processJarvis(
    input
) {

    const q =
        normalize(input);


    /*
    =========================================
    1. GREETINGS
    =========================================

    IMPORTANT:
    "hi" will NEVER search books.
    */

    if (
        isGreeting(q)
    ) {

        return {

            text: `

                Wa Alaikum Assalam 👋

                <br><br>

                Ji, main yahan hoon.

                <br>

                Aap kya poochna chahte hain?

            `,

            speak:
                "Wa Alaikum Assalam. Ji, main yahan hoon. Aap kya poochna chahte hain?"

        };

    }


    /*
    =========================================
    2. THANK YOU
    */

    if (
        containsAny(
            q,
            [
                "thank you",
                "thanks",
                "shukria",
                "shukriya"
            ]
        )
    ) {

        return {

            text:
                "You're welcome! 😊",

            speak:
                "You're welcome."

        };

    }


    /*
    =========================================
    3. HOW ARE YOU
    */

    if (
        containsAny(
            q,
            [
                "how are you",
                "kaise ho",
                "kese ho",
                "kya haal hai"
            ]
        )
    ) {

        return {

            text:
                "Alhamdulillah, main bilkul ready hoon. Aap batayein, main kya help karun?",

            speak:
                "Alhamdulillah, main bilkul ready hoon. Aap batayein, main kya help karun."

        };

    }


    /*
    =========================================
    4. WHO ARE YOU
    */

    if (
        containsAny(
            q,
            [
                "who are you",
                "tum kon ho",
                "aap kon ho",
                "what are you",
                "your name",
                "naam kya hai"
            ]
        )
    ) {

        return {

            text: `

                Main <strong>Chishti AI</strong> hoon —
                Chishti Library ka AI assistant.

                <br><br>

                Main library ki available books
                aur knowledge database se information
                provide karta hoon.

            `,

            speak:
                "Main Chishti AI hoon, Chishti Library ka AI assistant."

        };

    }


    /*
    =========================================
    5. WHAT IS LIBRARY
    */

    if (
        containsAny(
            q,
            [
                "what is chishti library",
                "chishti library kya hai",
                "library kya hai",
                "what is this library"
            ]
        )
    ) {

        const result =
            findKnowledge(q);


        if (result) {

            return {

                text:
                    result.answer,

                speak:
                    stripHTML(
                        result.answer
                    )

            };

        }


        return {

            text: `

                <strong>Chishti Library</strong>
                ek Digital Islamic Library hai jahan
                Islamic books, Naat, Manqabat, Hamd,
                Maqala aur research material available
                hai.

            `,

            speak:
                "Chishti Library ek Digital Islamic Library hai jahan Islamic books aur research material available hai."

        };

    }


    /*
    =========================================
    6. LATEST BOOKS
    ========================================= */

    if (
        containsAny(
            q,
            [
                "latest books",
                "latest book",
                "new books",
                "new book",
                "latest release",
                "recent books"
            ]
        )
    ) {

        const latest =
            [...libraryBooks]
                .sort(
                    compareNewest
                )
                .slice(
                    0,
                    8
                );


        return {

            text:
                latest.length
                    ? "Ji, ye library ki latest available books hain:"
                    : "Abhi library mein books available nahi hain.",

            books:
                latest,

            speak:
                latest.length
                    ? `Ji, library mein ${latest.length} latest books mili hain.`
                    : "Abhi library mein books available nahi hain."

        };

    }


    /*
    =========================================
    7. ALL BOOKS
    ========================================= */

    if (
        containsAny(
            q,
            [
                "show all books",
                "all books",
                "list books",
                "books list",
                "kitni books",
                "kitabain dikhao",
                "kitabein dikhao",
                "books dikhao"
            ]
        )
    ) {

        return {

            text:
                `Library mein total <strong>${libraryBooks.length}</strong> books available hain:`,

            books:
                libraryBooks.slice(
                    0,
                    20
                ),

            speak:
                `Library mein total ${libraryBooks.length} books available hain.`

        };

    }


    /*
    =========================================
    8. CATEGORIES
    ========================================= */

    if (
        containsAny(
            q,
            [
                "naat books",
                "naat book",
                "naat ki books",
                "naat dikhao"
            ]
        )
    ) {

        return categoryAI(
            "Naat"
        );

    }


    if (
        containsAny(
            q,
            [
                "manqabat books",
                "manqabat book",
                "manqabat dikhao"
            ]
        )
    ) {

        return categoryAI(
            "Manqabat"
        );

    }


    if (
        containsAny(
            q,
            [
                "hamd books",
                "hamd book",
                "hamd dikhao"
            ]
        )
    ) {

        return categoryAI(
            "Hamd"
        );

    }


    if (
        containsAny(
            q,
            [
                "maqala books",
                "maqala book",
                "maqala dikhao"
            ]
        )
    ) {

        return categoryAI(
            "Maqala"
        );

    }


    if (
        containsAny(
            q,
            [
                "kulliyat",
                "kuliyat",
                "kulliyat books",
                "kulliyat book"
            ]
        )
    ) {

        return categoryAI(
            "Kulliyat"
        );

    }


    if (
        containsAny(
            q,
            [
                "seerat books",
                "seerat book",
                "seerat"
            ]
        )
    ) {

        return categoryAI(
            "Seerat"
        );

    }


    /*
    =========================================
    9. AUTHOR QUERY
    ========================================= */

    if (
        containsAny(
            q,
            [
                "author",
                "writer",
                "writer kon",
                "musannif",
                "musannif kon",
                "who wrote"
            ]
        )
    ) {

        const result =
            findKnowledge(q);


        if (result) {

            return {

                text:
                    result.answer,

                speak:
                    stripHTML(
                        result.answer
                    )

            };

        }


        return {

            text:
                "Aap kis author ke bare mein poochna chahte hain?",

            speak:
                "Aap kis author ke bare mein poochna chahte hain?"

        };

    }


    /*
    =========================================
    10. WEBSITE COMMANDS
    ========================================= */

    if (
        q === "home" ||
        containsAny(
            q,
            [
                "go home",
                "open home",
                "homepage"
            ]
        )
    ) {

        return {

            text:
                "Opening Chishti Library Home.",

            speak:
                "Opening Chishti Library Home.",

            action:
                function () {

                    window.location.href =
                        "index.html";

                }

        };

    }


    if (
        containsAny(
            q,
            [
                "open books",
                "books page",
                "go to books"
            ]
        )
    ) {

        return {

            text:
                "Opening Books page.",

            speak:
                "Opening Books page.",

            action:
                function () {

                    window.location.href =
                        "books.html";

                }

        };

    }


    /*
    =========================================
    11. LOGOUT
    ========================================= */

    if (
        containsAny(
            q,
            [
                "logout",
                "log out",
                "sign out"
            ]
        )
    ) {

        try {

            await firebase
                .auth()
                .signOut();

        } catch (error) {

            console.error(
                error
            );

        }


        return {

            text:
                "You have been logged out.",

            speak:
                "You have been logged out."

        };

    }


    /*
    =========================================
    12. KNOWLEDGE SEARCH
    ========================================= */

    const knowledgeResult =
        findKnowledge(q);


    if (knowledgeResult) {

        return {

            text:
                knowledgeResult.answer,

            speak:
                stripHTML(
                    knowledgeResult.answer
                )

        };

    }


    /*
    =========================================
    13. BOOK SEARCH
    =========================================

    IMPORTANT:
    This is AFTER greetings/general questions.

    Therefore "hi" won't show a book.
    */

    const bookResults =
        searchLibraryBooks(
            q
        );


    if (
        bookResults.length
    ) {

        return {

            text:
                bookResults.length === 1
                    ? "Ji, mujhe ye book library mein mili:"
                    : `Ji, mujhe ${bookResults.length} matching books mili hain:`,

            books:
                bookResults,

            speak:
                bookResults.length === 1
                    ? `${bookResults[0].title || "Ye book"} library mein available hai.`
                    : `${bookResults.length} matching books library mein mili hain.`

        };

    }


    /*
    =========================================
    14. DEFAULT
    ========================================= */

    return {

        text: `

            Sorry, mujhe is question ka answer
            meri current knowledge mein nahi mila.

            <br><br>

            Aap mujh se ye pooch sakte hain:

            <br><br>

            • What is Chishti Library?

            <br>

            • Show all books

            <br>

            • Show latest books

            <br>

            • Show Naat books

            <br>

            • Who are the authors?

        `,

        speak:
            "Sorry, mujhe is question ka answer meri current knowledge mein nahi mila."

    };

}


/* =========================================================
   CATEGORY AI
========================================================= */

function categoryAI(
    category
) {

    const wanted =
        normalize(
            category
        );


    const results =
        libraryBooks.filter(
            function (book) {

                const text =
                    normalize(
                        `${book.category || ""} ${book.title || ""}`
                    );


                return text.includes(
                    wanted
                );

            }
        );


    return {

        text:
            results.length
                ? `<strong>${escapeHTML(category)}</strong> mein ${results.length} books available hain:`
                : `Abhi <strong>${escapeHTML(category)}</strong> category mein koi book nahi mili.`,

        books:
            results,

        speak:
            results.length
                ? `${category} category mein ${results.length} books available hain.`
                : `Abhi ${category} category mein koi book nahi mili.`

    };

}


/* =========================================================
   SEARCH BOOKS FOR AI
========================================================= */

function searchLibraryBooks(
    query
) {

    if (
        !query ||
        !libraryBooks.length
    ) {

        return [];

    }


    const words =
        normalize(query)
            .split(" ")
            .filter(
                word =>
                    word.length >= 3
            );


    if (!words.length) {
        return [];
    }


    const results =
        libraryBooks
            .map(
                function (book) {

                    const title =
                        normalize(
                            book.title
                        );


                    const author =
                        normalize(
                            book.author
                        );


                    const category =
                        normalize(
                            book.category
                        );


                    const description =
                        normalize(
                            book.description
                        );


                    let score = 0;


                    /*
                    Full title
                    */

                    if (
                        title === query
                    ) {

                        score += 300;

                    }


                    if (
                        title.includes(query)
                    ) {

                        score += 150;

                    }


                    if (
                        author.includes(query)
                    ) {

                        score += 80;

                    }


                    if (
                        category.includes(query)
                    ) {

                        score += 60;

                    }


                    words.forEach(
                        function (word) {

                            if (
                                title.includes(word)
                            ) {

                                score += 25;

                            }


                            if (
                                author.includes(word)
                            ) {

                                score += 12;

                            }


                            if (
                                category.includes(word)
                            ) {

                                score += 10;

                            }


                            if (
                                description.includes(word)
                            ) {

                                score += 5;

                            }

                        }
                    );


                    return {
                        book,
                        score
                    };

                }
            )
            .filter(
                item =>
                    item.score >= 25
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(
                0,
                10
            )
            .map(
                item =>
                    item.book
            );


    return results;

}


/* =========================================================
   KNOWLEDGE SEARCH
========================================================= */

function findKnowledge(
    query
) {

    if (
        !knowledge.length
    ) {

        return null;

    }


    let best =
        null;


    let bestScore =
        0;


    knowledge.forEach(
        function (item) {

            const question =
                normalize(
                    item.question ||
                    item.q ||
                    item.key ||
                    ""
                );


            const keywords =
                Array.isArray(
                    item.keywords
                )
                    ? item.keywords
                    : [];


            let score = 0;


            if (
                !question
            ) {

                return;

            }


            if (
                question === query
            ) {

                score += 200;

            }


            if (
                question.includes(query)
            ) {

                score += 100;

            }


            if (
                query.includes(question)
            ) {

                score += 80;

            }


            const words =
                question
                    .split(" ")
                    .filter(
                        word =>
                            word.length >= 3
                    );


            words.forEach(
                function (word) {

                    if (
                        query.includes(word)
                    ) {

                        score += 12;

                    }

                }
            );


            keywords.forEach(
                function (keyword) {

                    const k =
                        normalize(
                            keyword
                        );


                    if (
                        query.includes(k)
                    ) {

                        score += 25;

                    }

                }
            );


            if (
                score > bestScore
            ) {

                bestScore =
                    score;

                best =
                    item;

            }

        }
    );


    return bestScore >= 20
        ? best
        : null;

}


/* =========================================================
   GREETING DETECTOR
========================================================= */

function isGreeting(
    query
) {

    const greetings = [

        "hi",

        "hello",

        "hey",

        "salam",

        "assalamualaikum",

        "assalamu alaikum",

        "aoa",

        "aoa bro",

        "good morning",

        "good evening",

        "good afternoon",

        "hy"

    ];


    return greetings.includes(
        normalize(query)
    );

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
        "message user-message";


    message.textContent =
        text;


    chatMessages.appendChild(
        message
    );


    scrollChat();

}


/* =========================================================
   ADD JARVIS MESSAGE
========================================================= */

function addJarvisMessage(
    text,
    books = []
) {

    if (!chatMessages) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "message bot-message jarvis-message";


    const content =
        document.createElement(
            "div"
        );


    content.innerHTML =
        text;


    wrapper.appendChild(
        content
    );


    /*
    BOOK RESULTS ONLY WHEN NEEDED
    */

    if (
        books &&
        books.length
    ) {

        const bookArea =
            document.createElement(
                "div"
            );


        bookArea.className =
            "jarvis-book-results";


        books
            .slice(
                0,
                10
            )
            .forEach(
                function (book) {

                    bookArea.appendChild(
                        createAIBookCard(book)
                    );

                }
            );


        wrapper.appendChild(
            bookArea
        );

    }


    chatMessages.appendChild(
        wrapper
    );


    scrollChat();

}


/* =========================================================
   AI BOOK CARD
========================================================= */

function createAIBookCard(
    book
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "jarvis-book-card";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        "Unknown Author";


    const category =
        book.category ||
        "";


    const cover =
        book.cover ||
        book.coverUrl ||
        "logo.png";


    const readURL =
        book.readUrl ||
        book.read ||
        book.url ||
        "books.html";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    card.innerHTML = `

        <img
            src="${safeURL(cover)}"
            alt="${escapeHTML(title)}"
            onerror="this.src='logo.png'"
        >


        <div class="jarvis-book-info">

            <h4>
                📚 ${escapeHTML(title)}
            </h4>


            <p>
                👤 ${escapeHTML(author)}
            </p>


            ${
                category
                    ? `
                        <p>
                            📁 ${escapeHTML(category)}
                        </p>
                    `
                    : ""
            }


            <div class="jarvis-book-actions">

                <a
                    href="${safeURL(readURL)}"
                    class="jarvis-read"
                >
                    📖 Read Online
                </a>


                ${
                    pdf
                        ? `
                            <a
                                href="${safeURL(pdf)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="jarvis-download"
                                download
                            >
                                ⬇ Download
                            </a>
                        `
                        : ""
                }

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   TYPING
========================================================= */

function showJarvisTyping() {

    if (!chatMessages) {
        return;
    }


    if (
        $("jarvisTyping")
    ) {

        return;

    }


    const typing =
        document.createElement(
            "div"
        );


    typing.id =
        "jarvisTyping";


    typing.className =
        "message bot-message";


    typing.innerHTML = `

        <span class="jarvis-thinking">
            JARVIS is thinking
            <span>.</span>
            <span>.</span>
            <span>.</span>
        </span>

    `;


    chatMessages.appendChild(
        typing
    );


    scrollChat();

}


/* =========================================================
   REMOVE TYPING
========================================================= */

function removeJarvisTyping() {

    const typing =
        $("jarvisTyping");


    if (typing) {

        typing.remove();

    }

}


/* =========================================================
   VOICE SETUP
========================================================= */

function setupVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

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
    Urdu input
    */

    recognition.lang =
        "ur-PK";


    recognition.onstart =
        function () {

            isListening =
                true;


            const mic =
                $("jarvisMic");


            const status =
                $("jarvisStatus");


            if (mic) {

                mic.classList.add(
                    "listening"
                );

            }


            if (status) {

                status.textContent =
                    "Listening...";

            }

        };


    recognition.onresult =
        function (event) {

            const result =
                event
                    .results[0][0]
                    .transcript;


            if (chatInput) {

                chatInput.value =
                    result;

            }


            /*
            Automatically send
            */

            setTimeout(
                function () {

                    sendJarvisMessage();

                },
                100
            );

        };


    recognition.onerror =
        function (event) {

            console.warn(
                "Voice error:",
                event.error
            );


            showVoiceStatus(
                "Voice unavailable"
            );

        };


    recognition.onend =
        function () {

            isListening =
                false;


            const mic =
                $("jarvisMic");


            if (mic) {

                mic.classList.remove(
                    "listening"
                );

            }


            showVoiceStatus(
                ""
            );

        };

}


/* =========================================================
   TOGGLE VOICE
========================================================= */

function toggleVoiceInput() {

    if (!recognition) {

        alert(
            "Your browser does not support voice input."
        );

        return;

    }


    if (isListening) {

        recognition.stop();

        return;

    }


    try {

        /*
        Urdu
        */

        recognition.lang =
            "ur-PK";


        recognition.start();

    } catch (error) {

        console.warn(
            error
        );

    }

}


/* =========================================================
   VOICE STATUS
========================================================= */

function showVoiceStatus(
    text
) {

    const status =
        $("jarvisStatus");


    if (status) {

        status.textContent =
            text;

    }

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakJarvis(
    text
) {

    if (
        !aiVoiceEnabled
    ) {

        return;

    }


    if (
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const clean =
        stripHTML(text);


    if (!clean.trim()) {
        return;
    }


    speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            clean
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
        speechSynthesis.getVoices();


    let voice =
        voices.find(
            function (v) {

                return /^ur/i.test(
                    v.lang
                );

            }
        );


    if (!voice) {

        voice =
            voices.find(
                function (v) {

                    return /^en/i.test(
                        v.lang
                    );

                }
            );

    }


    if (voice) {

        utterance.voice =
            voice;

    }


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   CHAT SCROLL
========================================================= */

function scrollChat() {

    if (!chatMessages) {
        return;
    }


    setTimeout(
        function () {

            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        },
        20
    );

}


/* =========================================================
   COMMENTS
========================================================= */

function setupComments() {

    if (closeComments) {

        closeComments.addEventListener(
            "click",
            closeCommentModal
        );

    }


    if (commentModal) {

        commentModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    commentModal
                ) {

                    closeCommentModal();

                }

            }
        );

    }


    if (commentForm) {

        commentForm.addEventListener(
            "submit",
            submitComment
        );

    }

}


/* =========================================================
   OPEN COMMENTS
========================================================= */

async function openComments(
    book
) {

    if (!currentUser) {

        alert(
            "Please login first to comment."
        );

        return;

    }


    currentShareBook =
        book;


    if (!commentModal) {
        return;
    }


    commentModal.classList.add(
        "active"
    );


    if (commentsList) {

        commentsList.innerHTML =
            "<p>Loading comments...</p>";

    }


    await loadComments(
        book
    );

}


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadComments(
    book
) {

    if (!commentsList) {
        return;
    }


    try {

        const db =
            firebase.firestore();


        const bookId =
            book.firestoreId ||
            book.id ||
            book.title;


        const snapshot =
            await db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        commentsList.innerHTML =
            "";


        if (
            snapshot.empty
        ) {

            commentsList.innerHTML =
                "<p>No comments yet.</p>";

            return;

        }


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "comment-item";


                div.innerHTML = `

                    <strong>
                        ${escapeHTML(
                            data.userName ||
                            data.email ||
                            "Reader"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            data.text ||
                            ""
                        )}
                    </p>

                `;


                commentsList.appendChild(
                    div
                );

            }
        );


    } catch (error) {

        console.error(
            "Comments error:",
            error
        );


        commentsList.innerHTML =
            "<p>Unable to load comments.</p>";

    }

}


/* =========================================================
   SUBMIT COMMENT
========================================================= */

async function submitComment(
    event
) {

    event.preventDefault();


    if (!currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    if (
        !currentShareBook ||
        !commentInput
    ) {

        return;

    }


    const text =
        commentInput.value.trim();


    if (!text) {
        return;
    }


    try {

        const db =
            firebase.firestore();


        const bookId =
            currentShareBook.firestoreId ||
            currentShareBook.id ||
            currentShareBook.title;


        await db
            .collection("books")
            .doc(bookId)
            .collection("comments")
            .add({

                text: text,

                uid:
                    currentUser.uid,

                email:
                    currentUser.email ||
                    "",

                userName:
                    currentUser.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "Reader",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        commentInput.value =
            "";


        await loadComments(
            currentShareBook
        );


    } catch (error) {

        console.error(
            "Comment error:",
            error
        );


        alert(
            "Comment could not be added."
        );

    }

}


/* =========================================================
   CLOSE COMMENTS
========================================================= */

function closeCommentModal() {

    if (commentModal) {

        commentModal.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   SHARE
========================================================= */

function setupShare() {

    if (sharePopup) {

        sharePopup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    sharePopup
                ) {

                    closeShare();

                }

            }
        );

    }


    document
        .querySelectorAll(
            ".share-option"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const type =
                            button.dataset.share;


                        shareBookTo(
                            type
                        );

                    }
                );

            }
        );


    if (copyBookLink) {

        copyBookLink.addEventListener(
            "click",
            copyBookURL
        );

    }

}


/* =========================================================
   OPEN SHARE
========================================================= */

function openShare(
    book
) {

    currentShareBook =
        book;


    if (!sharePopup) {
        return;
    }


    sharePopup.classList.add(
        "active"
    );

}


/* =========================================================
   CLOSE SHARE
========================================================= */

function closeShare() {

    if (sharePopup) {

        sharePopup.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   SHARE BOOK
========================================================= */

function shareBookTo(
    type
) {

    if (!currentShareBook) {
        return;
    }


    const title =
        currentShareBook.title ||
        "Chishti Library Book";


    const url =
        getBookURL(
            currentShareBook
        );


    let shareURL =
        "";


    if (
        type === "whatsapp"
    ) {

        shareURL =
            "https://wa.me/?text=" +
            encodeURIComponent(
                `${title}\n${url}`
            );

    }


    else if (
        type === "facebook"
    ) {

        shareURL =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(
                url
            );

    }


    else if (
        type === "telegram"
    ) {

        shareURL =
            "https://t.me/share/url?url=" +
            encodeURIComponent(
                url
            ) +
            "&text=" +
            encodeURIComponent(
                title
            );

    }


    else if (
        type === "twitter"
    ) {

        shareURL =
            "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(
                title
            ) +
            "&url=" +
            encodeURIComponent(
                url
            );

    }


    if (shareURL) {

        window.open(
            shareURL,
            "_blank",
            "noopener,noreferrer"
        );

    }

}


/* =========================================================
   COPY BOOK LINK
========================================================= */

async function copyBookURL() {

    if (!currentShareBook) {
        return;
    }


    const url =
        getBookURL(
            currentShareBook
        );


    try {

        await navigator.clipboard.writeText(
            url
        );


        if (copyBookLink) {

            copyBookLink.innerHTML =
                '<i class="fa-solid fa-check"></i> Copied!';

        }


        setTimeout(
            function () {

                if (copyBookLink) {

                    copyBookLink.innerHTML =
                        '<i class="fa-solid fa-link"></i> Copy Book Link';

                }

            },
            1500
        );


    } catch (error) {

        console.error(
            error
        );

    }

}


/* =========================================================
   BOOK URL
========================================================= */

function getBookURL(
    book
) {

    const existing =
        book.readUrl ||
        book.read ||
        book.url;


    if (existing) {

        return new URL(
            existing,
            window.location.href
        ).href;

    }


    return window.location.href;

}


/* =========================================================
   SCROLL TO TOP
========================================================= */

function setupScrollTop() {

    if (!scrollTopButton) {
        return;
    }


    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY >
                500
            ) {

                scrollTopButton.classList.add(
                    "show"
                );

            } else {

                scrollTopButton.classList.remove(
                    "show"
                );

            }

        }
    );


    scrollTopButton.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalize(
    value
) {

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


/* =========================================================
   CONTAINS ANY
========================================================= */

function containsAny(
    text,
    values
) {

    return values.some(
        function (value) {

            return text.includes(
                normalize(value)
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

    return String(
        value || ""
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


/* =========================================================
   STRIP HTML
========================================================= */

function stripHTML(
    html
) {

    const div =
        document.createElement(
            "div"
        );


    div.innerHTML =
        html || "";


    return (
        div.textContent ||
        div.innerText ||
        ""
    );

}


/* =========================================================
   SAFE URL
========================================================= */

function safeURL(
    url
) {

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


    return value;

}


/* =========================================================
   GLOBAL COMPATIBILITY
========================================================= */

window.libraryBooks =
    libraryBooks;


/* =========================================================
   DEBUG
========================================================= */

console.log(
    "Chishti Library script loaded."
);
console.log(
    "Jarvis system loaded."
);
console.log(
    "Knowledge system ready."
);
console.log(
    "Firebase book sync ready."
);
