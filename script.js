/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 1
Foundation + Books Loader
=========================================*/

/*=========================
PREMIUM LOADER
=========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        if (loader) {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(() => {

                loader.remove();

            }, 800);

        }

    }, 2500);

});

/*=========================
MOBILE MENU
=========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}

/*=========================
SCROLL TO TOP
=========================*/

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    scrollBtn.style.display =
        window.scrollY > 300 ? "block" : "none";

});

if (scrollBtn) {

    scrollBtn.onclick = () => {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    };

}

/*=========================================
CHISHTI LIBRARY
VISITOR COUNTER
FIREBASE FIRESTORE
=========================================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) {
        console.error("❌ Visitor counter element not found");
        return;
    }

    if (typeof firebase === "undefined") {
        console.error("❌ Firebase SDK not loaded");
        visitorCounter.innerText = "0";
        return;
    }
if (!window.db) {

    console.error(
        "❌ Firestore database not initialized"
    );

    visitorCounter.innerText = "0";

    return;
}

    try {

        const visitorRef = window.db
    .collection("counter")
    .doc("visitors");
        /* =========================
           GET COUNTER
        ========================= */

        const snapshot =
            await visitorRef.get();


        /* =========================
           FIRST VISITOR
        ========================= */

        if (!snapshot.exists) {

            await visitorRef.set({

                count: 1,

                updatedAt:
                    firebase.firestore.FieldValue
                    .serverTimestamp()

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            visitorCounter.innerText = "1";

            console.log(
                "✅ Visitor counter created: 1"
            );

            return;
        }


        /* =========================
           CHECK SESSION
        ========================= */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* =========================
           NEW SESSION VISITOR
        ========================= */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore.FieldValue
                    .increment(1),

                updatedAt:
                    firebase.firestore.FieldValue
                    .serverTimestamp()

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            console.log(
                "✅ New visitor counted"
            );
        }


        /* =========================
           GET FINAL COUNT
        ========================= */

        const latest =
            await visitorRef.get();

        const data =
            latest.data();

        const count =
            Number(data?.count) || 0;


        /* =========================
           SHOW COUNTER
        ========================= */

        animateVisitorCount(
            visitorCounter,
            count
        );

        console.log(
            "👁 Total Visitors:",
            count
        );


    } catch (error) {

        console.error(
            "❌ Visitor Counter Error:",
            error
        );

        visitorCounter.innerText = "0";
    }
}


/*=========================================
VISITOR NUMBER ANIMATION
=========================================*/

function animateVisitorCount(
    element,
    target
) {

    const number =
        Number(target) || 0;

    if (number <= 0) {

        element.innerText = "0";
        return;
    }

    let current = 0;

    const duration = 1000;
    const steps = 40;

    const increment =
        number / steps;

    const timer =
        setInterval(() => {

            current += increment;

            if (current >= number) {

                current = number;

                clearInterval(timer);
            }

            element.innerText =
                Math.floor(current);

        }, duration / steps);
}


/*=========================================
START VISITOR COUNTER
=========================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateVisitorCounter();

    }
);
/*=========================
GLOBAL VARIABLES
=========================*/

let allBooks = [];
let filteredBooks = [];

/*=========================
LOAD BOOKS.JSON
=========================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok) {

            throw new Error("books.json not found");

        }

        allBooks = await response.json();

        filteredBooks = [...allBooks];

        /* Book Counter */

        const bookCounter = document.getElementById("bookCounter");

        if (bookCounter) {

            let count = 0;

            const total = allBooks.length;

            const animation = setInterval(() => {

                count++;

                bookCounter.innerText = count;

                if (count >= total) {

                    clearInterval(animation);

                }

            }, 120);

        }

        if (typeof displayBooks === "function") {

            displayBooks(filteredBooks);

        }

        if (typeof latestBook === "function") {

            latestBook();

        }

        console.log("✅ Books Loaded Successfully");

    }

    catch (err) {

        console.error(err);

    }

}

loadBooks();

/*=========================
UTILITY
=========================*/

function byId(id) {

    return document.getElementById(id);

}

console.log("✅ Script Part 1 Loaded");

function escapeSocialHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* =========================================================
   CHISHTI LIBRARY
   BOOK DISPLAY SYSTEM
   LIKE • COMMENT • SHARE • VIEWS
========================================================= */

function displayBooks(books) {

    const container =
        document.getElementById("booksContainer");

    if (!container) {
        console.error(
            "❌ booksContainer not found"
        );
        return;
    }


    container.innerHTML = "";


    if (!books || books.length === 0) {

        container.innerHTML = `
            <div class="no-books">
                <i class="fa-solid fa-book-open"></i>

                <h2>No Books Found</h2>

                <p>
                    Try another search.
                </p>
            </div>
        `;

        return;
    }


    books.forEach(function(book) {

        /* =========================================
           BOOK ID
        ========================================= */

        const bookId =
            getBookKey(book);


        /* =========================================
           BOOK DATA
        ========================================= */

        const title =
            book.title ||
            "Untitled Book";


        const author =
            book.author ||
            "Chishti Library";


        const category =
            book.category ||
            "Islamic Book";


        const description =
            book.description ||
            "Read this book online at Chishti Library.";


        const cover =
            book.cover ||
            "./logo.png";


        const pdf =
            book.pdf ||
            "";


        const views =
            Number(book.views || 0);


        const likes =
            Number(book.likes || 0);


        const comments =
            Number(book.comments || 0);


        const shares =
            Number(book.shares || 0);


        const downloads =
            Number(book.downloads || 0);


        /* =========================================
           CARD
        ========================================= */

        const card =
            document.createElement(
                "article"
            );


        card.className =
            "book-card";


        card.dataset.bookId =
            bookId;


        card.innerHTML = `

            <!-- ===============================
                 BOOK COVER
            ================================ -->

            <div class="book-cover-wrap">

                <img
                    src="${escapeSocialHTML(cover)}"
                    alt="${escapeSocialHTML(title)}"
                    class="book-cover"
                    loading="lazy"
                >

            </div>


            <!-- ===============================
                 BOOK CONTENT
            ================================ -->

            <div class="book-content">


                <!-- CATEGORY -->

                <span class="book-category">

                    ${escapeSocialHTML(
                        category
                    )}

                </span>


                <!-- TITLE -->

                <h2 class="book-title">

                    ${escapeSocialHTML(
                        title
                    )}

                </h2>


                <!-- AUTHOR -->

                <h3 class="book-author">

                    <i class="fa-solid fa-user-pen"></i>

                    ${escapeSocialHTML(
                        author
                    )}

                </h3>


                <!-- DESCRIPTION -->

                <p class="book-description">

                    ${escapeSocialHTML(
                        description
                    )}

                </p>


                <!-- =================================
                     BOOK STATS
                ================================== -->

                <div class="book-meta">


                    <!-- VIEWS -->

                    <span class="book-stat">

                        <i class="fa-solid fa-eye"></i>

                        <span
                            class="view-count"
                            data-book-id="${escapeSocialHTML(
                                bookId
                            )}"
                        >

                            ${views}

                        </span>

                    </span>


                    <!-- LIKES -->

                    <span class="book-stat">

                        <i class="fa-solid fa-heart"></i>

                        <span class="like-meta-count">

                            ${likes}

                        </span>

                    </span>


                    <!-- DOWNLOADS -->

                    <span class="book-stat">

                        <i class="fa-solid fa-download"></i>

                        <span>

                            ${downloads}

                        </span>

                    </span>

                </div>


                <!-- =================================
                     SOCIAL ACTIONS
                ================================== -->

                <div class="social-actions">


                    <!-- ❤️ LIKE -->

                    <button
                        type="button"
                        class="social-btn like-btn"
                        data-book-id="${escapeSocialHTML(
                            bookId
                        )}"
                        aria-label="Like book"
                    >

                        <i class="fa-regular fa-heart"></i>

                        <span class="action-count">

                            ${likes}

                        </span>

                    </button>


                    <!-- 💬 COMMENT -->

                    <button
                        type="button"
                        class="social-btn comment-btn"
                        data-book-id="${escapeSocialHTML(
                            bookId
                        )}"
                        aria-label="Comment on book"
                    >

                        <i class="fa-regular fa-comment"></i>

                        <span class="action-count">

                            ${comments}

                        </span>

                    </button>


                    <!-- 📤 SHARE -->

                    <button
                        type="button"
                        class="social-btn share-btn"
                        data-book-id="${escapeSocialHTML(
                            bookId
                        )}"
                        aria-label="Share book"
                    >

                        <i class="fa-solid fa-share-nodes"></i>

                        <span class="action-count">

                            ${shares}

                        </span>

                    </button>


                </div>


                <!-- =================================
                     BOOK BUTTONS
                ================================== -->

                <div class="book-buttons">


                    <!-- READ ONLINE -->

                    <a
                        href="reader.html?book=${encodeURIComponent(
                            pdf
                        )}"
                        class="btn read-btn"
                        data-book-id="${escapeSocialHTML(
                            bookId
                        )}"
                    >

                        <i class="fa-solid fa-book-open"></i>

                        Read Online

                    </a>


                    <!-- DOWNLOAD -->

                    <a
                        href="${escapeSocialHTML(
                            pdf || "#"
                        )}"
                        class="btn download-btn"
                        download
                        data-book-id="${escapeSocialHTML(
                            bookId
                        )}"
                    >

                        <i class="fa-solid fa-download"></i>

                        Download

                    </a>

                </div>


            </div>

        `;


        /* =========================================
           ADD CARD
        ========================================= */

        container.appendChild(
            card
        );

    });


    /* =============================================
       LOAD FIREBASE COUNTERS
    ============================================== */

    if (
        typeof loadFirebaseBookStats ===
        "function"
    ) {

        loadFirebaseBookStats(
            books
        );

    }


    console.log(
        "📚 Books displayed:",
        books.length
    );

}
/*=========================
LIVE SEARCH
=========================*/

function searchBooks() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const value = input.value.toLowerCase().trim();

    filteredBooks = allBooks.filter(book =>

        (book.title || "").toLowerCase().includes(value) ||

        (book.author || "").toLowerCase().includes(value) ||

        (book.category || "").toLowerCase().includes(value) ||

        (book.language || "").toLowerCase().includes(value)

    );

    displayBooks(filteredBooks);

}

/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(category, button = null) {

    document.querySelectorAll(".category").forEach(btn => {

        btn.classList.remove("active");

    });

    if (button) {

        button.classList.add("active");

    }

    if (category === "All") {

        filteredBooks = [...allBooks];

    } else {

        filteredBooks = allBooks.filter(book =>

            book.category === category

        );

    }

    displayBooks(filteredBooks);

}

/*=========================
LATEST BOOK
=========================*/

function latestBook() {

    const latest = allBooks.find(book => book.latest === true);

    if (!latest) return;

    const image = document.querySelector(".book-image img");
    const title = document.querySelector(".book-info h2");
    const author = document.querySelector(".book-info h3");
    const desc = document.querySelector(".book-info p");

    const buttons = document.querySelectorAll(".book-buttons a");

    if (image) image.src = latest.cover;
    if (title) title.innerText = latest.title;
    if (author) author.innerText = latest.author;
    if (desc) desc.innerText = latest.description;

    if (buttons.length >= 2) {

        buttons[0].href = latest.pdf;
        buttons[0].target = "_blank";

        buttons[1].href = latest.pdf;

    }

}

console.log("✅ Script Part 2 Loaded");

"use strict";

/* =========================================================
   CHISHTI LIBRARY
   COMPLETE script.js
   ---------------------------------------------------------
   Includes:
   • Firebase books
   • Book counter
   • Visitor counter
   • Search
   • Categories
   • Sorting
   • Latest book
   • Chishti AI / Jarvis
   • Knowledge JSON
   • Login-only AI
   • Urdu / Roman Urdu voice input
   • Voice reply
   • Commands
   • Chat open / close
   • Comments / share hooks
========================================================= */


/* =========================================================
   GLOBAL
========================================================= */

let allBooks = [];
let filteredBooks = [];

let knowledge = [];

let currentUser =
    window.currentFirebaseUser || null;

let chatInitialized = false;

let recognition = null;
let isListening = false;

let voiceEnabled = true;

let currentShareBook = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    initializeChishtiLibrary();

});


/* =========================================================
   MAIN INITIALIZATION
========================================================= */

async function initializeChishtiLibrary() {

    setupChatUI();

    setupSearch();

    setupSorting();

    setupCategories();

    setupScrollTop();

    setupMobileMenu();

    setupComments();

    setupSharing();

    setupAuthListener();

    await loadKnowledge();

    await loadBooks();

    setupVoice();

    updateCounters();

    renderLatestBook();

}


/* =========================================================
   FIREBASE CHECK
========================================================= */

function firebaseAvailable() {

    return (
        typeof firebase !== "undefined" &&
        firebase.apps &&
        firebase.apps.length > 0
    );

}


/* =========================================================
   AUTH LISTENER
========================================================= */

function setupAuthListener() {

    if (!firebaseAvailable()) {

        console.warn(
            "Firebase is not available."
        );

        return;

    }


    firebase.auth().onAuthStateChanged(function (user) {

        currentUser = user || null;

        window.currentFirebaseUser =
            currentUser;


        updateLoginNavigation(
            currentUser
        );


        updateChatAccess(
            currentUser
        );

    });

}


/* =========================================================
   LOGIN NAVIGATION
========================================================= */

function updateLoginNavigation(user) {

    const loginLinks =
        document.querySelectorAll(
            'a[href="login.html"], a[href="./login.html"]'
        );


    loginLinks.forEach(function (link) {

        /*
         Don't change Admin Login.
        */

        if (
            link.textContent
                .toLowerCase()
                .includes("admin")
        ) {

            return;

        }


        if (user) {

            const name =
                user.displayName ||
                user.email ||
                "Account";


            link.innerHTML =
                '<i class="fas fa-user"></i> ' +
                escapeHtml(
                    name
                );

        }

    });

}


/* =========================================================
   KNOWLEDGE JSON
========================================================= */

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "./knowledge.json?v=20260825"
            );


        if (!response.ok) {

            throw new Error(
                "knowledge.json not found"
            );

        }


        const data =
            await response.json();


        /*
         Support both:

         [
            {...},
            {...}
         ]

         and:

         {
            "knowledge": [...]
         }
        */

        if (Array.isArray(data)) {

            knowledge = data;

        }

        else if (
            Array.isArray(
                data.knowledge
            )
        ) {

            knowledge =
                data.knowledge;

        }

        else {

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


/* =========================================================
   LOAD BOOKS FROM FIRESTORE
========================================================= */

async function loadBooks() {

    if (!firebaseAvailable()) {

        console.warn(
            "Firebase not initialized."
        );

        return;

    }


    try {

        const db =
            firebase.firestore();


        const snapshot =
            await db
                .collection("books")
                .get();


        allBooks = [];


        snapshot.forEach(function (doc) {

            const data =
                doc.data() || {};


            allBooks.push({

                firestoreId:
                    doc.id,

                ...data

            });

        });


        filteredBooks =
            [...allBooks];


        console.log(
            "✅ Books loaded:",
            allBooks.length
        );


        updateCounters();

        renderBooks(
            filteredBooks
        );

        renderLatestBook();


    }

    catch (error) {

        console.error(
            "❌ Firestore books error:",
            error
        );

    }

}


/* =========================================================
   BOOK COUNTER
========================================================= */

function updateCounters() {

    const bookCounter =
        document.getElementById(
            "bookCounter"
        );


    if (bookCounter) {

        animateCounter(
            bookCounter,
            allBooks.length
        );

    }


    const visitorCounter =
        document.getElementById(
            "visitorCounter"
        );


    if (
        visitorCounter &&
        firebaseAvailable()
    ) {

        updateVisitorCounter(
            visitorCounter
        );

    }

}


/* =========================================================
   VISITOR COUNTER
========================================================= */

async function updateVisitorCounter(element) {

    try {

        const db =
            firebase.firestore();


        const ref =
            db.collection(
                "siteStats"
            ).doc(
                "main"
            );


        await ref.set({

            visitors:
                firebase.firestore.FieldValue.increment(
                    1
                )

        }, {

            merge: true

        });


        const snap =
            await ref.get();


        const data =
            snap.data() || {};


        animateCounter(
            element,
            Number(
                data.visitors || 0
            )
        );


    }

    catch (error) {

        console.warn(
            "Visitor counter error:",
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
        700;


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
                progress * target
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

function renderBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!books.length) {

        container.innerHTML = `

            <div class="no-books">

                <i class="fas fa-book-open"></i>

                <h3>No books found</h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(function (book) {

        container.appendChild(
            createLibraryBookCard(
                book
            )
        );

    });

}


/* =========================================================
   LIBRARY BOOK CARD
========================================================= */

function createLibraryBookCard(book) {

    const card =
        document.createElement(
            "article"
        );


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
        "Islamic Literature";


    const cover =
        book.cover ||
        book.coverUrl ||
        "logo.png";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    const read =
        book.readUrl ||
        book.onlineUrl ||
        book.pageUrl ||
        "";


    const link =
        read ||
        pdf ||
        "books.html";


    card.innerHTML = `

        <div class="book-card-image">

            <img
                src="${safeUrl(cover)}"
                alt="${escapeHtml(title)}"
                loading="lazy"
                onerror="this.src='logo.png'"
            >

        </div>


        <div class="book-card-info">

            <h3>
                ${escapeHtml(title)}
            </h3>

            <p>
                ${escapeHtml(author)}
            </p>

            <span>
                ${escapeHtml(category)}
            </span>


            <div class="book-card-actions">

                <a
                    href="${safeUrl(link)}"
                    ${
                        pdf || read
                            ? 'target="_blank"'
                            : ""
                    }
                    class="btn"
                >
                    Read Online
                </a>


                ${
                    pdf
                        ? `
                            <a
                                href="${safeUrl(pdf)}"
                                download
                                class="btn"
                            >
                                Download
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
   LATEST BOOK
========================================================= */

function renderLatestBook() {

    const container =
        document.querySelector(
            ".latest-book-card"
        );


    if (
        !container ||
        !allBooks.length
    ) {

        return;

    }


    const latest =
        [...allBooks]
            .sort(function (a, b) {

                return (
                    getBookTime(b) -
                    getBookTime(a)
                );

            })[0];


    if (!latest) {
        return;
    }


    const title =
        latest.title ||
        "Untitled Book";


    const author =
        latest.author ||
        "Unknown Author";


    const description =
        latest.description ||
        "A new addition to Chishti Library.";


    const cover =
        latest.cover ||
        latest.coverUrl ||
        "logo.png";


    const pdf =
        latest.pdf ||
        latest.pdfUrl ||
        "";


    const read =
        latest.readUrl ||
        latest.onlineUrl ||
        latest.pageUrl ||
        pdf ||
        "books.html";


    container.innerHTML = `

        <div class="book-image">

            <img
                src="${safeUrl(cover)}"
                alt="${escapeHtml(title)}"
                onerror="this.src='logo.png'"
            >

        </div>


        <div class="book-info">

            <span class="badge">
                NEW RELEASE
            </span>


            <h2>
                ${escapeHtml(title)}
            </h2>


            <h3>
                ${escapeHtml(author)}
            </h3>


            <p>
                ${escapeHtml(description)}
            </p>


            <div class="book-buttons">

                <a
                    href="${safeUrl(read)}"
                    class="btn"
                    ${
                        read !== "books.html"
                            ? 'target="_blank"'
                            : ""
                    }
                >
                    Read Online
                </a>


                ${
                    pdf
                        ? `
                            <a
                                href="${safeUrl(pdf)}"
                                class="btn"
                                download
                            >
                                Download PDF
                            </a>
                        `
                        : ""
                }

            </div>

        </div>

    `;

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            searchLibrary(
                input.value
            );

        }
    );

}


function searchLibrary(query) {

    const q =
        normalize(query);


    if (!q) {

        filteredBooks =
            [...allBooks];

        renderBooks(
            filteredBooks
        );

        return;

    }


    const words =
        q.split(" ")
            .filter(
                word =>
                    word.length > 1
            );


    filteredBooks =
        allBooks
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


                if (
                    title === q
                ) {

                    score += 100;

                }


                if (
                    title.includes(q)
                ) {

                    score += 60;

                }


                if (
                    author.includes(q)
                ) {

                    score += 30;

                }


                if (
                    category.includes(q)
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
                            description.includes(word)
                        ) {

                            score += 4;

                        }

                    }
                );


                return {
                    book: book,
                    score: score
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
        filteredBooks
    );

}


/* =========================================================
   SORTING
========================================================= */

function setupSorting() {

    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".sort-btn"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    const type =
                        button.dataset.sort ||
                        getSortType(
                            button
                        );


                    sortBooks(
                        type
                    );

                }
            );

        });

}


function getSortType(button) {

    const text =
        normalize(
            button.textContent
        );


    if (
        text.includes("oldest")
    ) {

        return "oldest";

    }


    if (
        text.includes("liked")
    ) {

        return "liked";

    }


    if (
        text.includes("popular")
    ) {

        return "popular";

    }


    return "latest";

}


function sortBooks(type) {

    let result =
        [...allBooks];


    if (
        type === "oldest"
    ) {

        result.sort(
            (a, b) =>
                getBookTime(a) -
                getBookTime(b)
        );

    }

    else if (
        type === "liked"
    ) {

        result.sort(
            (a, b) =>
                Number(
                    b.likes || 0
                ) -
                Number(
                    a.likes || 0
                )
        );

    }

    else if (
        type === "popular"
    ) {

        result.sort(
            (a, b) =>
                Number(
                    b.views || 0
                ) -
                Number(
                    a.views || 0
                )
        );

    }

    else {

        result.sort(
            (a, b) =>
                getBookTime(b) -
                getBookTime(a)
        );

    }


    filteredBooks =
        result;


    renderBooks(
        filteredBooks
    );

}


/* =========================================================
   CATEGORY
========================================================= */

function setupCategories() {

    document
        .querySelectorAll(
            ".category"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            btn =>
                                btn.classList.remove(
                                    "active"
                                )
                        );


                    button.classList.add(
                        "active"
                    );


                    const category =
                        button.textContent.trim();


                    filterBooks(
                        category
                    );

                }
            );

        });

}


function filterBooks(category) {

    const normalized =
        normalize(category);


    if (
        normalized === "all"
    ) {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(
                function (book) {

                    return normalize(
                        `${book.category || ""}
                         ${book.title || ""}
                         ${book.description || ""}`
                    ).includes(
                        normalized
                    );

                }
            );

    }


    renderBooks(
        filteredBooks
    );

}


/* =========================================================
   CHAT UI
========================================================= */

function setupChatUI() {

    const chatBtn =
        document.getElementById(
            "chatBtn"
        );


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    const closeChat =
        document.getElementById(
            "closeChat"
        );


    if (
        !chatBtn ||
        !chatWindow
    ) {

        return;

    }


    chatWindow.style.display =
        "none";


    chatBtn.addEventListener(
        "click",
        function () {

            openChat();

        }
    );


    if (closeChat) {

        closeChat.addEventListener(
            "click",
            function () {

                closeChatWindow();

            }
        );

    }


    /*
      Add microphone automatically.
      No HTML modification required.
    */

    createMicButton();


    /*
      Input Enter.
    */

    const input =
        document.getElementById(
            "chatInput"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    chatInitialized =
        true;

}


function openChat() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) {
        return;
    }


    /*
      Login-only.
    */

    if (!currentUser) {

        const goLogin =
            confirm(
                "Please login first to use Chishti AI.\n\nOK = Login"
            );


        if (goLogin) {

            window.location.href =
                "./login.html";

        }


        return;

    }


    chatWindow.style.display =
        "flex";


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "chatInput"
                );


            if (input) {
                input.focus();
            }


            scrollChat();

        },
        100
    );


    showJarvisWelcome();

}


function closeChatWindow() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (chatWindow) {

        chatWindow.style.display =
            "none";

    }


    if (
        window.speechSynthesis
    ) {

        window.speechSynthesis.cancel();

    }

}


/* =========================================================
   CHAT ACCESS
========================================================= */

function updateChatAccess(user) {

    const chatBtn =
        document.getElementById(
            "chatBtn"
        );


    if (!chatBtn) {
        return;
    }


    if (user) {

        chatBtn.removeAttribute(
            "aria-disabled"
        );

        chatBtn.title =
            "Open Chishti AI";

    }

    else {

        chatBtn.setAttribute(
            "aria-disabled",
            "true"
        );

        chatBtn.title =
            "Login required";

    }

}


/* =========================================================
   JARVIS WELCOME
========================================================= */

function showJarvisWelcome() {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
        return;
    }


    if (
        messages.dataset.welcomed === "true"
    ) {

        return;

    }


    messages.dataset.welcomed =
        "true";


    addBotMessage(
        `Assalamu Alaikum 👋<br>
        Welcome to <strong>Chishti Library AI</strong>.<br><br>
        Main aapki kis tarah madad kar sakta hoon?`
    );

}


/* =========================================================
   CREATE MIC BUTTON
========================================================= */

function createMicButton() {

    const inputArea =
        document.querySelector(
            ".chat-input"
        );


    if (!inputArea) {
        return;
    }


    if (
        document.getElementById(
            "chishtiMic"
        )
    ) {

        return;

    }


    const mic =
        document.createElement(
            "button"
        );


    mic.id =
        "chishtiMic";


    mic.type =
        "button";


    mic.title =
        "Speak";


    mic.innerHTML =
        '<i class="fas fa-microphone"></i>';


    mic.addEventListener(
        "click",
        toggleVoice
    );


    /*
      Insert before send button.
    */

    const send =
        inputArea.querySelector(
            "button"
        );


    if (send) {

        inputArea.insertBefore(
            mic,
            send
        );

    }

    else {

        inputArea.appendChild(
            mic
        );

    }

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!currentUser) {

        alert(
            "Please login first to use Chishti AI."
        );

        return;

    }


    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {
        return;
    }


    input.value =
        "";


    addUserMessage(
        text
    );


    showTyping();


    try {

        const result =
            await jarvisProcess(
                text
            );


        removeTyping();


        addBotMessage(
            result.text,
            result.books || []
        );


        if (
            voiceEnabled &&
            result.speak
        ) {

            speak(
                result.speak
            );

        }


        executeCommand(
            result.command
        );

    }

    catch (error) {

        console.error(
            "Chishti AI:",
            error
        );


        removeTyping();


        addBotMessage(
            "Sorry, mujhe temporary problem aa gayi. Please dobara try karein."
        );

    }

}


/* =========================================================
   JARVIS CORE
========================================================= */

async function jarvisProcess(input) {

    const q =
        normalize(input);


    /*
      =====================================================
      PRIORITY 1 — GREETINGS
      =====================================================
    */

    if (
        isGreeting(q)
    ) {

        return {

            text:
                `Wa Alaikum Assalam! 👋<br><br>
                Main <strong>Chishti AI</strong> hoon.
                Aap mujh se Chishti Library, books,
                authors aur Islamic literature ke baare mein
                pooch sakte hain.`,

            speak:
                "Wa Alaikum Assalam. Main Chishti AI hoon. Aap mujh se kya poochna chahte hain?"

        };

    }


    /*
      =====================================================
      PRIORITY 2 — SIMPLE CHAT
      =====================================================
    */

    if (
        containsAny(
            q,
            [
                "how are you",
                "how r u",
                "kaise ho",
                "kese ho",
                "kaisay ho",
                "kya haal hai",
                "haal kya hai"
            ]
        )
    ) {

        return {

            text:
                "Alhamdulillah 😊 Main bilkul theek hoon. Aapki kya madad karoon?",

            speak:
                "Alhamdulillah, main bilkul theek hoon. Aapki kya madad karoon?"

        };

    }


    if (
        containsAny(
            q,
            [
                "thanks",
                "thank you",
                "shukriya",
                "jazakallah",
                "jazak allah"
            ]
        )
    ) {

        return {

            text:
                "Khush rahiye! 😊 Main aapki madad ke liye hamesha ready hoon.",

            speak:
                "Khush rahiye. Main aapki madad ke liye ready hoon."

        };

    }


    /*
      =====================================================
      PRIORITY 3 — KNOWLEDGE.JSON
      =====================================================
    */

    const knowledgeAnswer =
        findKnowledgeAnswer(
            q
        );


    if (knowledgeAnswer) {

        return {

            text:
                knowledgeAnswer,

            speak:
                stripHtml(
                    knowledgeAnswer
                )

        };

    }


    /*
      =====================================================
      PRIORITY 4 — COMMANDS
      =====================================================
    */

    if (
        q === "home" ||
        q === "go home" ||
        q === "open home" ||
        q === "ghar kholo"
    ) {

        return {

            text:
                "🏠 Chishti Library Home open kar raha hoon...",

            speak:
                "Chishti Library Home open kar raha hoon.",

            command:
                "home"

        };

    }


    if (
        q === "open books" ||
        q === "books page" ||
        q === "open book page"
    ) {

        return {

            text:
                "📚 Books page open kar raha hoon...",

            speak:
                "Books page open kar raha hoon.",

            command:
                "books"

        };

    }


    if (
        q === "logout" ||
        q === "log out" ||
        q === "sign out"
    ) {

        return {

            text:
                "Aap logout ho rahe hain...",

            speak:
                "Aap logout ho rahe hain.",

            command:
                "logout"

        };

    }


    /*
      =====================================================
      PRIORITY 5 — EXPLICIT BOOK COMMANDS
      =====================================================
    */

    if (
        isAllBooksRequest(q)
    ) {

        return {

            text:
                `📚 Chishti Library mein <strong>${allBooks.length}</strong> books available hain.`,

            books:
                allBooks.slice(0, 20),

            speak:
                `Chishti Library mein ${allBooks.length} books available hain.`

        };

    }


    if (
        isLatestBooksRequest(q)
    ) {

        const latest =
            [...allBooks]
                .sort(
                    (a, b) =>
                        getBookTime(b) -
                        getBookTime(a)
                )
                .slice(0, 10);


        return {

            text:
                "🆕 Ye library ki latest books hain:",

            books:
                latest,

            speak:
                "Ye library ki latest books hain."

        };

    }


    /*
      =====================================================
      CATEGORY
      =====================================================
    */

    const category =
        detectCategory(
            q
        );


    if (category) {

        const result =
            allBooks.filter(
                function (book) {

                    return normalize(
                        `${book.category || ""}
                         ${book.title || ""}
                         ${book.description || ""}`
                    ).includes(
                        normalize(category)
                    );

                }
            );


        return {

            text:
                result.length
                    ? `📚 <strong>${escapeHtml(category)}</strong> category mein ${result.length} books available hain:`
                    : `Is waqt <strong>${escapeHtml(category)}</strong> category mein koi book nahi mili.`,

            books:
                result,

            speak:
                result.length
                    ? `${category} category mein ${result.length} books available hain.`
                    : `${category} category mein koi book nahi mili.`

        };

    }


    /*
      =====================================================
      PRIORITY 6 — BOOK SEARCH
      ONLY IF USER CLEARLY WANTS A BOOK
      =====================================================
    */

    if (
        isBookRequest(q)
    ) {

        const results =
            searchBooks(
                q
            );


        if (
            results.length
        ) {

            return {

                text:
                    results.length === 1
                        ? "📚 Ji, mujhe ye book mili hai:"
                        : `📚 Ji, mujhe ${results.length} matching books mili hain:`,

                books:
                    results,

                speak:
                    results.length === 1
                        ? `${results[0].title} library mein available hai.`
                        : `${results.length} matching books library mein available hain.`

            };

        }


        return {

            text:
                "📚 Mujhe is naam se koi matching book nahi mili. Book ka exact naam dobara likhein.",

            speak:
                "Mujhe is naam se koi matching book nahi mili."

        };

    }


    /*
      =====================================================
      PRIORITY 7 — NORMAL FALLBACK
      =====================================================
    */

    return {

        text:
            `Ji 😊 Main Chishti Library ke baare mein aapki madad kar sakta hoon.<br><br>
            Aap pooch sakte hain:<br>
            • Chishti Library kya hai?<br>
            • Kulliyat books dikhao<br>
            • Latest books dikhao<br>
            • Show all books<br>
            • Kisi specific book ka naam`,

        speak:
            "Ji, main Chishti Library ke baare mein aapki madad kar sakta hoon. Aap apna sawal pooch sakte hain."

    };

}


/* =========================================================
   GREETING DETECTOR
========================================================= */

function isGreeting(q) {

    const greetings = [

        "hi",
        "hello",
        "hey",
        "hy",
        "hii",
        "helo",
        "hlo",
        "salam",
        "salaam",
        "aoa",
        "assalamualaikum",
        "assalamu alaikum",
        "asalam o alaikum",
        "assalam o alaikum"

    ];


    return greetings.includes(
        q
    );

}


/* =========================================================
   ALL BOOKS REQUEST
========================================================= */

function isAllBooksRequest(q) {

    const phrases = [

        "show all books",
        "all books",
        "list all books",
        "books list",
        "show books",
        "books dikhao",
        "kitabein dikhao",
        "kitabain dikhao",
        "sari books dikhao",
        "saari books dikhao",
        "tamam books dikhao"

    ];


    return phrases.some(
        phrase =>
            q.includes(
                normalize(phrase)
            )
    );

}


/* =========================================================
   LATEST REQUEST
========================================================= */

function isLatestBooksRequest(q) {

    const phrases = [

        "latest books",
        "latest book",
        "new books",
        "new book",
        "latest release",
        "recent books",
        "nayi books",
        "nai books",
        "new kitab"

    ];


    return phrases.some(
        phrase =>
            q.includes(
                normalize(phrase)
            )
    );

}


/* =========================================================
   CATEGORY DETECTOR
========================================================= */

function detectCategory(q) {

    const categories = [

        "Naat",
        "Manqabat",
        "Hamd",
        "Maqala",
        "Seerat",
        "Kulliyat",
        "Kuliyat"

    ];


    for (
        const category of categories
    ) {

        const c =
            normalize(category);


        if (
            q === c ||
            q.includes(
                c + " books"
            ) ||
            q.includes(
                c + " book"
            ) ||
            q.includes(
                c + " dikhao"
            ) ||
            q.includes(
                "show " + c
            ) ||
            q.includes(
                c + " ki books"
            ) ||
            q.includes(
                c + " ki kitab"
            )
        ) {

            return category;

        }

    }


    return null;

}


/* =========================================================
   BOOK REQUEST DETECTOR
========================================================= */

function isBookRequest(q) {

    /*
      VERY IMPORTANT:

      A normal "hi", "hello", "thanks" etc.
      can NEVER reach book search.
    */

    if (
        isGreeting(q)
    ) {

        return false;

    }


    const bookWords = [

        "book",
        "books",
        "kitab",
        "kitaab",
        "kitabein",
        "kitabain",
        "pdf",
        "download",
        "read book",
        "book name",
        "kitab ka naam",
        "book ka naam",
        "author ki book",
        "author books"

    ];


    if (
        bookWords.some(
            word =>
                q.includes(
                    normalize(word)
                )
        )
    ) {

        return true;

    }


    /*
      Exact title matching.
    */

    return allBooks.some(
        function (book) {

            const title =
                normalize(
                    book.title || ""
                );


            if (!title) {
                return false;
            }


            return (
                q === title ||
                q.includes(title)
            );

        }
    );

}


/* =========================================================
   SEARCH BOOKS
========================================================= */

function searchBooks(query) {

    const q =
        normalize(query);


    if (
        !q ||
        !allBooks.length
    ) {

        return [];

    }


    const words =
        q.split(" ")
            .filter(
                word =>
                    word.length > 2
            );


    return allBooks
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


                if (
                    title === q
                ) {

                    score += 200;

                }


                if (
                    title.includes(q)
                ) {

                    score += 100;

                }


                if (
                    author.includes(q)
                ) {

                    score += 40;

                }


                if (
                    category.includes(q)
                ) {

                    score += 25;

                }


                words.forEach(
                    function (word) {

                        if (
                            title.includes(word)
                        ) {

                            score += 20;

                        }


                        if (
                            author.includes(word)
                        ) {

                            score += 8;

                        }


                        if (
                            description.includes(word)
                        ) {

                            score += 3;

                        }

                    }
                );


                return {

                    book:
                        book,

                    score:
                        score

                };

            }
        )
        .filter(
            item =>
                item.score > 0
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

}


/* =========================================================
   KNOWLEDGE SEARCH
========================================================= */

function findKnowledgeAnswer(q) {

    if (
        !Array.isArray(knowledge) ||
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

            if (!item) {
                return;
            }


            /*
              Support:
              question
              questions
              keywords
              answer
            */

            const question =
                normalize(
                    item.question || ""
                );


            const keywords =
                Array.isArray(
                    item.keywords
                )
                    ? item.keywords
                    : [];


            const allText =
                [
                    question,
                    ...keywords.map(
                        x =>
                            normalize(x)
                    )
                ]
                .filter(Boolean)
                .join(" ");


            if (!allText) {
                return;
            }


            let score =
                0;


            if (
                question === q
            ) {

                score += 200;

            }


            if (
                question &&
                (
                    question.includes(q) ||
                    q.includes(question)
                )
            ) {

                score += 80;

            }


            const queryWords =
                q.split(" ")
                    .filter(
                        word =>
                            word.length > 2
                    );


            queryWords.forEach(
                function (word) {

                    if (
                        allText.includes(word)
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
                        k &&
                        q.includes(k)
                    ) {

                        score += 40;

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


    /*
      Don't return random knowledge result.
    */

    if (
        best &&
        bestScore >= 25
    ) {

        return (
            best.answer ||
            best.response ||
            best.text ||
            null
        );

    }


    return null;

}


/* =========================================================
   VOICE RECOGNITION
========================================================= */

function setupVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    const mic =
        document.getElementById(
            "chishtiMic"
        );


    if (!SpeechRecognition) {

        if (mic) {

            mic.style.display =
                "none";

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
      Urdu first.
    */

    recognition.lang =
        "ur-PK";


    recognition.onstart =
        function () {

            isListening =
                true;


            if (mic) {

                mic.classList.add(
                    "listening"
                );

                mic.innerHTML =
                    '<i class="fas fa-stop"></i>';

            }

        };


    recognition.onend =
        function () {

            isListening =
                false;


            if (mic) {

                mic.classList.remove(
                    "listening"
                );

                mic.innerHTML =
                    '<i class="fas fa-microphone"></i>';

            }

        };


    recognition.onerror =
        function (event) {

            console.warn(
                "Voice error:",
                event.error
            );


            isListening =
                false;


            if (mic) {

                mic.classList.remove(
                    "listening"
                );

                mic.innerHTML =
                    '<i class="fas fa-microphone"></i>';

            }

        };


    recognition.onresult =
        function (event) {

            const transcript =
                event.results[0][0]
                    .transcript
                    .trim();


            const input =
                document.getElementById(
                    "chatInput"
                );


            if (input) {

                input.value =
                    transcript;

            }


            if (transcript) {

                sendMessage();

            }

        };

}


/* =========================================================
   TOGGLE VOICE
========================================================= */

function toggleVoice() {

    if (!recognition) {

        alert(
            "Urdu voice input is not supported by this browser. Chrome/Edge try karein."
        );

        return;

    }


    if (isListening) {

        recognition.stop();

        return;

    }


    try {

        recognition.lang =
            "ur-PK";

        recognition.start();

    }

    catch (error) {

        console.warn(
            error
        );

    }

}


/* =========================================================
   VOICE REPLY
========================================================= */

function speak(text) {

    if (
        !voiceEnabled ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    const clean =
        stripHtml(
            text
        );


    if (!clean) {
        return;
    }


    window.speechSynthesis.cancel();


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
      Try Urdu voice first.
    */

    const voices =
        window.speechSynthesis
            .getVoices();


    let voice =
        voices.find(
            v =>
                /^ur(-|_)/i.test(
                    v.lang
                )
        );


    if (!voice) {

        voice =
            voices.find(
                v =>
                    /urdu/i.test(
                        v.name
                    )
            );

    }


    if (!voice) {

        voice =
            voices.find(
                v =>
                    /^en(-|_)/i.test(
                        v.lang
                    )
            );

    }


    if (voice) {

        utterance.voice =
            voice;

    }


    window.speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   USER MESSAGE
========================================================= */

function addUserMessage(text) {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
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


    messages.appendChild(
        div
    );


    scrollChat();

}


/* =========================================================
   BOT MESSAGE
========================================================= */

function addBotMessage(
    text,
    books = []
) {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "bot-message";


    /*
      Only text first.
    */

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
      Books ONLY when explicitly returned.
    */

    if (
        Array.isArray(books) &&
        books.length
    ) {

        books
            .slice(
                0,
                10
            )
            .forEach(
                function (book) {

                    wrapper.appendChild(
                        createAIBookCard(
                            book
                        )
                    );

                }
            );

    }


    messages.appendChild(
        wrapper
    );


    scrollChat();

}


/* =========================================================
   AI BOOK CARD
========================================================= */

function createAIBookCard(book) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "ai-book-card";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        "Unknown Author";


    const category =
        book.category ||
        "Islamic Literature";


    const cover =
        book.cover ||
        book.coverUrl ||
        "logo.png";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    const online =
        book.readUrl ||
        book.onlineUrl ||
        book.pageUrl ||
        "";


    const readLink =
        online ||
        pdf ||
        "books.html";


    card.innerHTML = `

        <div class="ai-book-cover">

            <img
                src="${safeUrl(cover)}"
                alt="${escapeHtml(title)}"
                onerror="this.src='logo.png'"
            >

        </div>


        <div class="ai-book-info">

            <strong>
                📚 ${escapeHtml(title)}
            </strong>


            <span>
                👤 ${escapeHtml(author)}
            </span>


            <span>
                📁 ${escapeHtml(category)}
            </span>


            <div class="ai-book-buttons">

                <a
                    href="${safeUrl(readLink)}"
                    ${
                        readLink !== "books.html"
                            ? 'target="_blank"'
                            : ""
                    }
                >
                    📖 Read Online
                </a>


                ${
                    pdf
                        ? `
                            <a
                                href="${safeUrl(pdf)}"
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

function showTyping() {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
        return;
    }


    if (
        document.getElementById(
            "chishtiTyping"
        )
    ) {

        return;

    }


    const div =
        document.createElement(
            "div"
        );


    div.id =
        "chishtiTyping";


    div.className =
        "bot-message";


    div.innerHTML =
        "🤖 Chishti AI is thinking...";


    messages.appendChild(
        div
    );


    scrollChat();

}


function removeTyping() {

    const typing =
        document.getElementById(
            "chishtiTyping"
        );


    if (typing) {

        typing.remove();

    }

}


/* =========================================================
   COMMAND EXECUTION
========================================================= */

function executeCommand(command) {

    if (!command) {
        return;
    }


    if (
        command === "home"
    ) {

        setTimeout(
            function () {

                window.location.href =
                    "index.html";

            },
            500
        );

    }


    if (
        command === "books"
    ) {

        setTimeout(
            function () {

                window.location.href =
                    "books.html";

            },
            500
        );

    }


    if (
        command === "logout"
    ) {

        if (
            firebaseAvailable()
        ) {

            firebase.auth()
                .signOut()
                .then(
                    function () {

                        setTimeout(
                            function () {

                                window.location.href =
                                    "login.html";

                            },
                            500
                        );

                    }
                );

        }

    }

}


/* =========================================================
   SCROLL CHAT
========================================================= */

function scrollChat() {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
        return;
    }


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   SCROLL TOP
========================================================= */

function setupScrollTop() {

    const button =
        document.getElementById(
            "scrollTop"
        );


    if (!button) {
        return;
    }


    window.addEventListener(
        "scroll",
        function () {

            if (
                window.scrollY >
                400
            ) {

                button.classList.add(
                    "show"
                );

            }

            else {

                button.classList.remove(
                    "show"
                );

            }

        }
    );


    button.addEventListener(
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
   MOBILE MENU
========================================================= */

function setupMobileMenu() {

    const button =
        document.querySelector(
            ".mobile-menu"
        );


    const menu =
        document.querySelector(
            ".menu"
        );


    if (
        !button ||
        !menu
    ) {

        return;

    }


    button.addEventListener(
        "click",
        function () {

            menu.classList.toggle(
                "show"
            );

        }
    );

}


/* =========================================================
   COMMENTS
========================================================= */

function setupComments() {

    const modal =
        document.getElementById(
            "commentModal"
        );


    const close =
        document.getElementById(
            "closeComments"
        );


    if (!modal) {
        return;
    }


    if (close) {

        close.addEventListener(
            "click",
            function () {

                modal.classList.remove(
                    "active"
                );

            }
        );

    }


    const form =
        document.getElementById(
            "commentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                if (!currentUser) {

                    alert(
                        "Please login first."
                    );

                    return;

                }


                const input =
                    document.getElementById(
                        "commentInput"
                    );


                if (
                    !input ||
                    !input.value.trim()
                ) {

                    return;

                }


                if (
                    !firebaseAvailable()
                ) {

                    return;

                }


                try {

                    await firebase
                        .firestore()
                        .collection(
                            "comments"
                        )
                        .add({

                            text:
                                input.value.trim(),

                            uid:
                                currentUser.uid,

                            email:
                                currentUser.email || "",

                            createdAt:
                                firebase
                                    .firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });


                    input.value =
                        "";


                    loadComments();

                }

                catch (error) {

                    console.error(
                        error
                    );

                }

            }
        );

    }

}


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadComments() {

    const list =
        document.getElementById(
            "commentsList"
        );


    if (
        !list ||
        !firebaseAvailable()
    ) {

        return;

    }


    try {

        const snapshot =
            await firebase
                .firestore()
                .collection(
                    "comments"
                )
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(50)
                .get();


        list.innerHTML =
            "";


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data() || {};


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "comment-item";


                item.innerHTML = `

                    <strong>
                        ${escapeHtml(
                            data.email ||
                            "Reader"
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            data.text || ""
                        )}
                    </p>

                `;


                list.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.warn(
            "Comments error:",
            error
        );

    }

}


/* =========================================================
   SHARING
========================================================= */

function setupSharing() {

    document
        .querySelectorAll(
            "[data-share]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        shareBook(
                            button.dataset.share
                        );

                    }
                );

            }
        );


    const copy =
        document.getElementById(
            "copyBookLink"
        );


    if (copy) {

        copy.addEventListener(
            "click",
            copyBookLink
        );

    }

}


function shareBook(type) {

    if (!currentShareBook) {
        return;
    }


    const url =
        currentShareBook.url ||
        window.location.href;


    const encoded =
        encodeURIComponent(
            url
        );


    let shareUrl =
        "";


    if (
        type === "whatsapp"
    ) {

        shareUrl =
            "https://wa.me/?text=" +
            encoded;

    }


    else if (
        type === "facebook"
    ) {

        shareUrl =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encoded;

    }


    else if (
        type === "telegram"
    ) {

        shareUrl =
            "https://t.me/share/url?url=" +
            encoded;

    }


    else if (
        type === "twitter"
    ) {

        shareUrl =
            "https://twitter.com/intent/tweet?url=" +
            encoded;

    }


    if (shareUrl) {

        window.open(
            shareUrl,
            "_blank",
            "noopener,noreferrer"
        );

    }

}


async function copyBookLink() {

    if (!currentShareBook) {
        return;
    }


    const url =
        currentShareBook.url ||
        window.location.href;


    try {

        await navigator.clipboard.writeText(
            url
        );


        alert(
            "Book link copied!"
        );

    }

    catch (error) {

        console.warn(
            error
        );

    }

}


/* =========================================================
   NORMALIZE
========================================================= */

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
   BOOK DATE
========================================================= */

function getBookTime(book) {

    if (!book) {
        return 0;
    }


    const value =
        book.createdAt ||
        book.timestamp ||
        book.date ||
        0;


    if (
        value &&
        typeof value === "object"
    ) {

        if (
            typeof value.toMillis ===
            "function"
        ) {

            return value.toMillis();

        }


        if (value.seconds) {

            return Number(
                value.seconds
            ) * 1000;

        }

    }


    const parsed =
        Date.parse(
            value
        );


    return Number.isNaN(
        parsed
    )
        ? 0
        : parsed;

}


/* =========================================================
   STRIP HTML
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

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
   SAFE URL
========================================================= */

function safeUrl(url) {

    const value =
        String(
            url || ""
        ).trim();


    if (
        /^(javascript|data|vbscript):/i.test(
            value
        )
    ) {

        return "#";

    }


    return value;

}


/* =========================================================
   GLOBAL FUNCTIONS
   Your existing HTML uses these directly.
========================================================= */

window.sendMessage =
    sendMessage;


window.searchBooks =
    searchLibrary;


window.sortBooks =
    sortBooks;


window.filterBooks =
    filterBooks;


window.openChat =
    openChat;


window.closeChatWindow =
    closeChatWindow;


/* =========================================================
   FINAL
========================================================= */

console.log(
    "===================================="
);

console.log(
    "🤖 CHISHTI AI JARVIS"
);

console.log(
    "✅ Fresh chatbot engine"
);

console.log(
    "✅ Knowledge JSON"
);

console.log(
    "✅ Firestore books"
);

console.log(
    "✅ Login-only access"
);

console.log(
    "✅ Urdu voice input"
);

console.log(
    "✅ Voice reply"
);

console.log(
    "✅ Greeting protection"
);

console.log(
    "===================================="
);

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 4
FINAL PREMIUM
=========================================*/

/*=========================
SCROLL ANIMATION
=========================*/

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show-section");

        }

    });

}, {

    threshold: 0.15

});

sections.forEach(section => {

    observer.observe(section);

});

/*=========================
BOOK CARD HOVER
=========================*/

document.addEventListener("mouseover", (e) => {

    const card = e.target.closest(".book-card");

    if (card) {

        card.style.transform = "translateY(-10px)";
        card.style.transition = ".35s";

    }

});

document.addEventListener("mouseout", (e) => {

    const card = e.target.closest(".book-card");

    if (card) {

        card.style.transform = "translateY(0px)";

    }

});

/*=========================
DOWNLOAD COUNTER
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest("a");

    if (!btn) return;

    if (btn.hasAttribute("download")) {

        let total = Number(localStorage.getItem("downloads")) || 0;

        total++;

        localStorage.setItem("downloads", total);

    }

});

/*=========================
READ COUNTER
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest("a");

    if (!btn) return;

    if (

        btn.href.includes(".pdf") &&

        !btn.hasAttribute("download")

    ) {

        let total = Number(localStorage.getItem("reads")) || 0;

        total++;

        localStorage.setItem("reads", total);

    }

});

/*=========================
BUTTON RIPPLE
=========================*/

document.addEventListener("click", (e) => {

    const btn = e.target.closest(".btn");

    if (!btn) return;

    const ripple = document.createElement("span");

    ripple.className = "ripple";

    ripple.style.left = e.offsetX + "px";

    ripple.style.top = e.offsetY + "px";

    btn.appendChild(ripple);

    setTimeout(() => {

        ripple.remove();

    }, 600);

});

/*=========================
NAVBAR SHADOW
=========================*/

window.addEventListener("scroll", () => {

    const nav = document.querySelector(".navbar");

    if (!nav) return;

    if (window.scrollY > 40) {

        nav.classList.add("nav-shadow");

    }

    else {

        nav.classList.remove("nav-shadow");

    }

});

/*=========================
AUTO YEAR
=========================*/

const year = document.getElementById("year");

if (year) {

    year.innerText = new Date().getFullYear();

}

/*=========================
IMAGE FALLBACK
=========================*/

document.querySelectorAll("img").forEach(img => {

    img.onerror = function () {

        this.src = "logo.png";

    };

});

/*=========================
PRELOAD BOOK COVERS
=========================*/

window.addEventListener("load", () => {

    if (!Array.isArray(allBooks)) return;

    allBooks.forEach(book => {

        const image = new Image();

        image.src = book.cover;

    });

});

/*=========================
SMOOTH ANCHOR LINKS
=========================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});

/*=========================
CONSOLE
=========================*/

console.log("====================================");

console.log("📚 CHISHTI LIBRARY");

console.log("Version : 1.0");

console.log("Developer : Ali Hassan");

console.log("====================================");

console.log("✅ Loader");

console.log("✅ Navbar");

console.log("✅ Search");

console.log("✅ Categories");

console.log("✅ Books");

console.log("✅ AI");

console.log("✅ Reader");

console.log("✅ Downloads");

console.log("✅ Responsive");

console.log("🚀 Production Ready");

/* =========================
   BOOK SORTING
========================= */

let currentBooks = [];
let currentCategory = "All";
let currentSort = "latest";


function sortBooks(sortType) {

    currentSort = sortType;

    /* Active button */

    document.querySelectorAll(".sort-btn").forEach(function (button) {
        button.classList.remove("active");
    });

    const clickedButton =
        document.querySelector(
            `.sort-btn[onclick="sortBooks('${sortType}')"]`
        );

    if (clickedButton) {
        clickedButton.classList.add("active");
    }

    renderSortedBooks();
}


function renderSortedBooks() {

    let books = [...currentBooks];

    /* =========================
       CATEGORY FILTER
    ========================= */

    if (
        currentCategory &&
        currentCategory.toLowerCase() !== "all"
    ) {

        books = books.filter(function (book) {

            const category =
                String(
                    book.category ||
                    book.type ||
                    book.genre ||
                    ""
                ).toLowerCase();

            return category === currentCategory.toLowerCase();

        });

    }


    /* =========================
       LATEST
    ========================= */

    if (currentSort === "latest") {

        books.sort(function (a, b) {

            const dateA =
                new Date(
                    a.date ||
                    a.createdAt ||
                    a.uploadDate ||
                    a.publishedDate ||
                    0
                );

            const dateB =
                new Date(
                    b.date ||
                    b.createdAt ||
                    b.uploadDate ||
                    b.publishedDate ||
                    0
                );

            return dateB - dateA;

        });

    }


    /* =========================
       OLDEST
    ========================= */

    else if (currentSort === "oldest") {

        books.sort(function (a, b) {

            const dateA =
                new Date(
                    a.date ||
                    a.createdAt ||
                    a.uploadDate ||
                    a.publishedDate ||
                    0
                );

            const dateB =
                new Date(
                    b.date ||
                    b.createdAt ||
                    b.uploadDate ||
                    b.publishedDate ||
                    0
                );

            return dateA - dateB;

        });

    }


    /* =========================
       MOST LIKED
    ========================= */

    else if (currentSort === "liked") {

        books.sort(function (a, b) {

            return (
                Number(b.likes || 0) -
                Number(a.likes || 0)
            );

        });

    }


    /* =========================
       POPULAR
    ========================= */

    else if (currentSort === "popular") {

        books.sort(function (a, b) {

            const popularA =
                Number(a.views || 0) +
                Number(a.likes || 0) * 3 +
                Number(a.downloads || 0) * 2 +
                Number(a.shares || 0) * 2;

            const popularB =
                Number(b.views || 0) +
                Number(b.likes || 0) * 3 +
                Number(b.downloads || 0) * 2 +
                Number(b.shares || 0) * 2;

            return popularB - popularA;

        });

    }


    /* =========================
       DISPLAY
    ========================= */

    displayBooks(books);

}

/* =========================================================
   CHISHTI LIBRARY
   FINAL FIREBASE SOCIAL SYSTEM
   ❤️ LIKE
   💬 COMMENT
   📤 SHARE
   👁️ VIEWS
========================================================= */


/* =========================================================
   HELPER
========================================================= */

function escapeSocialHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   BOOK ID
========================================================= */

function getBookKey(book) {

    if (book.id) {
        return String(book.id);
    }

    if (book.slug) {
        return String(book.slug);
    }

    if (book.pdf) {

        return String(book.pdf)
            .split("/")
            .pop()
            .replace(/\.[^/.]+$/, "")
            .replace(/[^a-zA-Z0-9_-]/g, "-")
            .toLowerCase();

    }

    return String(book.title || "book")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .toLowerCase();
}


/* =========================================================
   FIREBASE READY CHECK
========================================================= */

function firebaseSocialReady() {

    if (
        !window.db ||
        !window.firebaseReady
    ) {

        console.warn(
            "⚠️ Firebase is not ready."
        );

        return false;
    }

    return true;
}


/* =========================================================
   LOAD BOOK STATS
========================================================= */

async function loadFirebaseBookStats(books) {

    if (!firebaseSocialReady()) {
        return;
    }

    for (const book of books) {

        const bookId =
            getBookKey(book);

        try {

            const ref =
                window.db
                    .collection("books")
                    .doc(bookId);

            const snapshot =
                await ref.get();

            if (!snapshot.exists) {
                continue;
            }

            const data =
                snapshot.data();


            /* VIEWS */

            document
                .querySelectorAll(
                    `.view-count[data-book-id="${CSS.escape(bookId)}"]`
                )
                .forEach(function(element) {

                    element.textContent =
                        Number(data.views || 0);

                });


            /* LIKES */

            document
                .querySelectorAll(
                    `.like-btn[data-book-id="${CSS.escape(bookId)}"]`
                )
                .forEach(function(button) {

                    const count =
                        button.querySelector(
                            ".action-count"
                        );

                    if (count) {

                        count.textContent =
                            Number(data.likes || 0);

                    }

                });


            /* COMMENTS */

            document
                .querySelectorAll(
                    `.comment-btn[data-book-id="${CSS.escape(bookId)}"]`
                )
                .forEach(function(button) {

                    const count =
                        button.querySelector(
                            ".action-count"
                        );

                    if (count) {

                        count.textContent =
                            Number(data.comments || 0);

                    }

                });


            /* SHARES */

            document
                .querySelectorAll(
                    `.share-btn[data-book-id="${CSS.escape(bookId)}"]`
                )
                .forEach(function(button) {

                    const count =
                        button.querySelector(
                            ".action-count"
                        );

                    if (count) {

                        count.textContent =
                            Number(data.shares || 0);

                    }

                });

        }

        catch (error) {

            console.error(
                "❌ Stats Load Error:",
                bookId,
                error
            );

        }

    }

}


/* =========================================================
   👁️ BOOK VIEW
========================================================= */

async function recordBookView(bookId) {

    if (!firebaseSocialReady()) {
        return;
    }


    const storageKey =
        "chishti_view_" + bookId;


    /* Same session = don't count again */

    if (
        sessionStorage.getItem(
            storageKey
        )
    ) {

        return;

    }


    try {

        const ref =
            window.db
                .collection("books")
                .doc(String(bookId));


        await ref.set(

            {

                views:
                    firebase.firestore
                        .FieldValue
                        .increment(1),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            },

            {
                merge: true
            }

        );


        sessionStorage.setItem(
            storageKey,
            "1"
        );


        /* Update visible counter */

        document
            .querySelectorAll(
                `.view-count[data-book-id="${CSS.escape(String(bookId))}"]`
            )
            .forEach(function(element) {

                element.textContent =
                    Number(
                        element.textContent || 0
                    ) + 1;

            });


        console.log(
            "👁️ View recorded:",
            bookId
        );

    }

    catch (error) {

        console.error(
            "❌ View Error:",
            error
        );

    }

}


/* =========================================================
   📖 READ ONLINE = VIEW
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".read-btn"
            );

        if (!button) {
            return;
        }


        const card =
            button.closest(
                ".book-card"
            );

        if (!card) {
            return;
        }


        const bookId =
            card.dataset.bookId;


        if (bookId) {

            recordBookView(
                bookId
            );

        }

    }
);


/* =========================================================
   ❤️ LIKE SYSTEM
========================================================= */

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".like-btn"
            );

        if (!button) {
            return;
        }


        /* LOGIN REQUIRED */

        if (
            !window.currentFirebaseUser
        ) {

            alert(
                "Please login first to like this book."
            );

            window.location.href =
                "./login.html";

            return;

        }


        if (!firebaseSocialReady()) {
            return;
        }


        const bookId =
            button.dataset.bookId;


        if (!bookId) {
            return;
        }


        const uid =
            window.currentFirebaseUser.uid;


        const likeRef =
            window.db
                .collection("books")
                .doc(bookId)
                .collection("likes")
                .doc(uid);


        const bookRef =
            window.db
                .collection("books")
                .doc(bookId);


        try {

            const likeSnapshot =
                await likeRef.get();


            /* =========================
               UNLIKE
            ========================= */

            if (likeSnapshot.exists) {

                await likeRef.delete();


                await bookRef.set(

                    {

                        likes:
                            firebase.firestore
                                .FieldValue
                                .increment(-1)

                    },

                    {
                        merge: true
                    }

                );


                button.classList.remove(
                    "liked"
                );


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        "fa-regular fa-heart";

                }


                updateSocialCounter(
                    button,
                    -1
                );


                console.log(
                    "💔 Book unliked"
                );

            }


            /* =========================
               LIKE
            ========================= */

            else {

                await likeRef.set({

                    uid:
                        uid,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


                await bookRef.set(

                    {

                        likes:
                            firebase.firestore
                                .FieldValue
                                .increment(1)

                    },

                    {
                        merge: true
                    }

                );


                button.classList.add(
                    "liked"
                );


                const icon =
                    button.querySelector(
                        "i"
                    );


                if (icon) {

                    icon.className =
                        "fa-solid fa-heart";

                }


                updateSocialCounter(
                    button,
                    1
                );


                /* Animation */

                button.classList.add(
                    "like-pop"
                );


                setTimeout(
                    function() {

                        button.classList.remove(
                            "like-pop"
                        );

                    },
                    400
                );


                console.log(
                    "❤️ Book liked"
                );

            }

        }

        catch (error) {

            console.error(
                "❌ Like Error:",
                error
            );

            alert(
                "Like could not be updated."
            );

        }

    }
);


/* =========================================================
   SOCIAL COUNTER
========================================================= */

function updateSocialCounter(
    button,
    change
) {

    const counter =
        button.querySelector(
            ".action-count"
        );


    if (!counter) {
        return;
    }


    const current =
        Number(
            counter.textContent || 0
        );


    counter.textContent =
        Math.max(
            0,
            current + change
        );

}


/* =========================================================
   💬 COMMENT SYSTEM
========================================================= */

let activeCommentBookId =
    null;


/* OPEN COMMENT */

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".comment-btn"
            );

        if (!button) {
            return;
        }


        activeCommentBookId =
            button.dataset.bookId;


        if (!activeCommentBookId) {
            return;
        }


        const modal =
            document.getElementById(
                "commentModal"
            );


        if (modal) {

            modal.classList.add(
                "show"
            );

        }


        const input =
            document.getElementById(
                "commentInput"
            );


        if (input) {

            setTimeout(
                function() {

                    input.focus();

                },
                200
            );

        }


        await loadFirebaseComments(
            activeCommentBookId
        );

    }
);


/* CLOSE COMMENT */

document.addEventListener(
    "click",
    function(event) {

        const close =
            event.target.closest(
                "#closeComments"
            );

        if (!close) {
            return;
        }


        const modal =
            document.getElementById(
                "commentModal"
            );


        if (modal) {

            modal.classList.remove(
                "show"
            );

        }

    }
);


/* CLICK OUTSIDE COMMENT */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "commentModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            modal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   LOAD COMMENTS
========================================================= */

async function loadFirebaseComments(
    bookId
) {

    const list =
        document.getElementById(
            "commentsList"
        );


    if (!list) {
        return;
    }


    if (!firebaseSocialReady()) {

        list.innerHTML = `
            <p class="comment-error">
                Firebase is not connected.
            </p>
        `;

        return;
    }


    list.innerHTML = `
        <p class="comment-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading comments...
        </p>
    `;


    try {

        const snapshot =
            await window.db
                .collection("books")
                .doc(String(bookId))
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        if (snapshot.empty) {

            list.innerHTML = `
                <div class="no-comments">

                    <i class="fa-regular fa-comments"></i>

                    <p>No comments yet.</p>

                    <small>
                        Be the first to comment ❤️
                    </small>

                </div>
            `;

            return;

        }


        list.innerHTML = "";


        snapshot.forEach(
            function(doc) {

                const data =
                    doc.data();


                let date =
                    "";


                if (
                    data.createdAt &&
                    data.createdAt.toDate
                ) {

                    date =
                        data.createdAt
                            .toDate()
                            .toLocaleString();

                }


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "comment-item";


                item.innerHTML = `

                    <div class="comment-top">

                        <div class="comment-avatar">

                            <i class="fa-solid fa-user"></i>

                        </div>

                        <div>

                            <div class="comment-user">

                                ${escapeSocialHTML(
                                    data.name ||
                                    "Reader"
                                )}

                            </div>

                            <div class="comment-date">

                                ${escapeSocialHTML(
                                    date
                                )}

                            </div>

                        </div>

                    </div>

                    <div class="comment-text">

                        ${escapeSocialHTML(
                            data.text
                        )}

                    </div>

                `;


                list.appendChild(
                    item
                );

            }
        );

    }

    catch (error) {

        console.error(
            "❌ Comment Load Error:",
            error
        );


        list.innerHTML = `
            <div class="comment-error">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <p>
                    Comments could not be loaded.
                </p>

            </div>
        `;

    }

}


/* =========================================================
   POST COMMENT
========================================================= */

document.addEventListener(
    "submit",
    async function(event) {

        const form =
            event.target.closest(
                "#commentForm"
            );

        if (!form) {
            return;
        }


        event.preventDefault();


        /* LOGIN */

        if (
            !window.currentFirebaseUser
        ) {

            alert(
                "Please login first to comment."
            );

            window.location.href =
                "./login.html";

            return;

        }


        if (!activeCommentBookId) {

            alert(
                "Book not selected."
            );

            return;

        }


        const input =
            document.getElementById(
                "commentInput"
            );


        if (!input) {
            return;
        }


        const text =
            input.value.trim();


        if (!text) {

            return;

        }


        if (text.length > 500) {

            alert(
                "Comment must be 500 characters or less."
            );

            return;

        }


        if (!firebaseSocialReady()) {

            alert(
                "Firebase is not connected."
            );

            return;

        }


        const user =
            window.currentFirebaseUser;


        const submitButton =
            form.querySelector(
                "button[type='submit']"
            );


        if (submitButton) {

            submitButton.disabled =
                true;

            submitButton.innerHTML =
                `<i class="fa-solid fa-spinner fa-spin"></i>`;

        }


        try {

            await window.db
                .collection("books")
                .doc(String(activeCommentBookId))
                .collection("comments")
                .add({

                    uid:
                        user.uid,

                    name:
                        user.displayName ||
                        user.email ||
                        "Reader",

                    email:
                        user.email ||
                        "",

                    text:
                        text,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            /* BOOK COMMENT COUNTER */

            await window.db
                .collection("books")
                .doc(String(activeCommentBookId))
                .set(

                    {

                        comments:
                            firebase.firestore
                                .FieldValue
                                .increment(1)

                    },

                    {
                        merge: true
                    }

                );


            input.value = "";


            await loadFirebaseComments(
                activeCommentBookId
            );


            /* CARD COUNTER */

            const button =
                document.querySelector(
                    `.comment-btn[data-book-id="${CSS.escape(
                        String(activeCommentBookId)
                    )}"]`
                );


            if (button) {

                updateSocialCounter(
                    button,
                    1
                );

            }


            console.log(
                "💬 Comment added"
            );

        }

        catch (error) {

            console.error(
                "❌ Comment Error:",
                error
            );

            alert(
                "Comment could not be posted."
            );

        }

        finally {

            if (submitButton) {

                submitButton.disabled =
                    false;

                submitButton.innerHTML =
                    `<i class="fa-solid fa-paper-plane"></i>`;

            }

        }

    }
);


/* =========================================================
   📤 SHARE SYSTEM
========================================================= */

let activeShareBookId =
    null;


/* SHARE BUTTON */

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                ".share-btn"
            );

        if (!button) {
            return;
        }


        activeShareBookId =
            button.dataset.bookId;


        if (!activeShareBookId) {
            return;
        }


        const book =
            allBooks.find(
                function(item) {

                    return String(
                        getBookKey(item)
                    ) === String(
                        activeShareBookId
                    );

                }
            );


        if (!book) {

            console.error(
                "❌ Book not found."
            );

            return;

        }


        const url =
            new URL(
                "reader.html?book=" +
                encodeURIComponent(
                    book.pdf || ""
                ),
                window.location.href
            ).href;


        const shareData = {

            title:
                book.title ||
                "Chishti Library",

            text:
                `Read "${book.title}" on Chishti Library`,

            url:
                url

        };


        /* MOBILE SHARE */

        if (
            navigator.share
        ) {

            try {

                await navigator.share(
                    shareData
                );


                await increaseShareCount(
                    activeShareBookId
                );


                return;

            }

            catch (error) {

                if (
                    error.name ===
                    "AbortError"
                ) {

                    return;

                }

            }

        }


        /* DESKTOP POPUP */

        const popup =
            document.getElementById(
                "sharePopup"
            );


        if (popup) {

            popup.classList.add(
                "show"
            );

        }

    }
);


/* =========================================================
   SHARE OPTIONS
========================================================= */

document.addEventListener(
    "click",
    async function(event) {

        const option =
            event.target.closest(
                ".share-option"
            );

        if (!option) {
            return;
        }


        if (!activeShareBookId) {
            return;
        }


        const book =
            allBooks.find(
                function(item) {

                    return String(
                        getBookKey(item)
                    ) === String(
                        activeShareBookId
                    );

                }
            );


        if (!book) {
            return;
        }


        const url =
            new URL(
                "reader.html?book=" +
                encodeURIComponent(
                    book.pdf || ""
                ),
                window.location.href
            ).href;


        const text =
            `Read "${book.title}" on Chishti Library`;


        const type =
            option.dataset.share;


        let shareUrl =
            "";


        if (
            type ===
            "whatsapp"
        ) {

            shareUrl =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    text + "\n" + url
                );

        }


        else if (
            type ===
            "facebook"
        ) {

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    url
                );

        }


        else if (
            type ===
            "telegram"
        ) {

            shareUrl =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    text
                );

        }


        else if (
            type ===
            "twitter"
        ) {

            shareUrl =
                "https://twitter.com/intent/tweet?text=" +
                encodeURIComponent(
                    text
                ) +
                "&url=" +
                encodeURIComponent(
                    url
                );

        }


        else if (
            type ===
            "copy"
        ) {

            try {

                await navigator.clipboard.writeText(
                    url
                );


                alert(
                    "Link copied! 🔗"
                );


                await increaseShareCount(
                    activeShareBookId
                );

            }

            catch (error) {

                prompt(
                    "Copy this link:",
                    url
                );

            }


            return;

        }


        if (shareUrl) {

            window.open(
                shareUrl,
                "_blank",
                "noopener,noreferrer"
            );


            await increaseShareCount(
                activeShareBookId
            );

        }

    }
);


/* =========================================================
   SHARE COUNT
========================================================= */

async function increaseShareCount(
    bookId
) {

    if (!firebaseSocialReady()) {
        return;
    }


    try {

        await window.db
            .collection("books")
            .doc(String(bookId))
            .set(

                {

                    shares:
                        firebase.firestore
                            .FieldValue
                            .increment(1)

                },

                {
                    merge: true
                }

            );


        document
            .querySelectorAll(
                `.share-btn[data-book-id="${CSS.escape(
                    String(bookId)
                )}"]`
            )
            .forEach(
                function(button) {

                    updateSocialCounter(
                        button,
                        1
                    );

                }
            );

    }

    catch (error) {

        console.error(
            "❌ Share Count Error:",
            error
        );

    }

}

/* =========================================================
   👁️ FINAL BOOK VIEW COUNTER
========================================================= */

async function recordBookView(bookId) {

    if (!firebaseSocialReady()) {
        return;
    }

    const id = String(bookId);

    /* Same session mein duplicate view nahi */

    const storageKey =
        "chishti_library_view_" + id;

    if (
        sessionStorage.getItem(storageKey)
    ) {
        return;
    }

    try {

        const bookRef =
            window.db
                .collection("books")
                .doc(id);


        /* Firebase +1 */

        await bookRef.set(

            {
                views:
                    firebase.firestore
                        .FieldValue
                        .increment(1),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            },

            {
                merge: true
            }

        );


        /* Mark this session */

        sessionStorage.setItem(
            storageKey,
            "1"
        );


        /* Update screen immediately */

        document
            .querySelectorAll(
                `.view-count[data-book-id="${CSS.escape(id)}"]`
            )
            .forEach(function(counter) {

                counter.textContent =
                    Number(
                        counter.textContent || 0
                    ) + 1;

            });


        console.log(
            "👁️ View +1:",
            id
        );

    }

    catch (error) {

        console.error(
            "❌ View Counter Error:",
            error
        );

    }

}


/* =========================================================
   📖 READ ONLINE = VIEW
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const readButton =
            event.target.closest(
                ".read-btn"
            );

        if (!readButton) {
            return;
        }


        const bookId =
            readButton.dataset.bookId;


        if (!bookId) {
            return;
        }


        recordBookView(
            bookId
        );

    }
);

/* =========================================================
   READY
========================================================= */

console.log(
    "======================================"
);

console.log(
    "🔥 CHISHTI LIBRARY SOCIAL SYSTEM"
);

console.log(
    "❤️ Like System Ready"
);

console.log(
    "💬 Comment System Ready"
);

console.log(
    "📤 Share System Ready"
);

console.log(
    "👁️ View System Ready"
);

console.log(
    "🔥 Firebase Social System Loaded"
);

console.log(
    "======================================"
);

/* =========================================================
   CHISHTI AI — KNOWLEDGE.JSON CONNECTOR
   Paste at the END of script.js
========================================================= */

(function () {

    "use strict";

    let chishtiKnowledge = [];
    let knowledgeLoaded = false;

    /* -----------------------------------------
       LOAD KNOWLEDGE.JSON
    ----------------------------------------- */

    async function loadChishtiKnowledge() {

        try {

            const response = await fetch("./knowledge.json", {
                cache: "no-store"
            });

            if (!response.ok) {
                throw new Error(
                    "knowledge.json not found: " +
                    response.status
                );
            }

            const data = await response.json();

            if (!Array.isArray(data)) {
                throw new Error(
                    "knowledge.json must contain an array."
                );
            }

            chishtiKnowledge = data;

            knowledgeLoaded = true;

            console.log(
                "🤖 Chishti AI Knowledge Loaded:",
                chishtiKnowledge.length,
                "entries"
            );

        } catch (error) {

            knowledgeLoaded = false;

            console.error(
                "❌ Chishti AI Knowledge Error:",
                error
            );

        }

    }


    /* -----------------------------------------
       NORMALIZE TEXT
    ----------------------------------------- */

    function normalizeText(text) {

        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/[؟?!.,،؛:;'"`]/g, "")
            .replace(/\s+/g, " ");

    }


    /* -----------------------------------------
       FIND BEST ANSWER
    ----------------------------------------- */

    function findKnowledgeAnswer(question) {

        if (!knowledgeLoaded || !chishtiKnowledge.length) {
            return null;
        }

        const input = normalizeText(question);

        if (!input) {
            return null;
        }


        /* Exact match */

        for (const item of chishtiKnowledge) {

            if (
                normalizeText(item.question) === input
            ) {

                return item.answer;

            }

        }


        /* Contains match */

        for (const item of chishtiKnowledge) {

            const keyword =
                normalizeText(item.question);

            if (
                keyword.length >= 3 &&
                input.includes(keyword)
            ) {

                return item.answer;

            }

        }


        /* Reverse contains */

        for (const item of chishtiKnowledge) {

            const keyword =
                normalizeText(item.question);

            if (
                keyword.length >= 3 &&
                keyword.includes(input)
            ) {

                return item.answer;

            }

        }


        /* Word matching */

        const inputWords =
            new Set(input.split(" "));

        let bestAnswer = null;
        let bestScore = 0;

        for (const item of chishtiKnowledge) {

            const keyword =
                normalizeText(item.question);

            const words =
                keyword.split(" ");

            let score = 0;

            for (const word of words) {

                if (
                    word.length > 2 &&
                    inputWords.has(word)
                ) {

                    score++;

                }

            }

            if (score > bestScore) {

                bestScore = score;
                bestAnswer = item.answer;

            }

        }

        if (bestScore >= 1) {
            return bestAnswer;
        }

        return null;

    }


    /* -----------------------------------------
       GLOBAL API
    ----------------------------------------- */

    window.ChishtiKnowledge = {

        getAnswer: findKnowledgeAnswer,

        getAll: function () {
            return chishtiKnowledge;
        },

        isLoaded: function () {
            return knowledgeLoaded;
        },

        reload: loadChishtiKnowledge

    };


    /* -----------------------------------------
       LOAD NOW
    ----------------------------------------- */

    loadChishtiKnowledge();


    /* -----------------------------------------
       CHATBOT INTEGRATION
    ----------------------------------------- */

    window.addEventListener(
        "chishtiAIQuestion",
        function (event) {

            const question =
                event.detail?.question || "";

            const answer =
                findKnowledgeAnswer(question);

            window.dispatchEvent(
                new CustomEvent(
                    "chishtiAIAnswer",
                    {
                        detail: {
                            question: question,
                            answer: answer
                        }
                    }
                )
            );

        }
    );


})();

/* =========================================================
   CHISHTI AI — FINAL CHAT FIX
   APPEND THIS AT THE VERY END OF script.js

   IMPORTANT:
   Do NOT delete your existing script.
   Do NOT call any function manually.
========================================================= */
