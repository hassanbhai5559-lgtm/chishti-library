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

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 3
AI CHATBOT
=========================================*/

let knowledge = [];

/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge() {

    try {

        const response = await fetch("knowledge.json");

        if (!response.ok) {

            throw new Error("knowledge.json not found");

        }

        knowledge = await response.json();

        console.log("✅ Knowledge Loaded");

    }

    catch (err) {

        console.log(err);

    }

}

loadKnowledge();

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

/*=========================
OPEN CHAT
=========================*/

if (chatBtn) {

    chatBtn.onclick = () => {

        chatWindow.style.display = "flex";

    };

}

/*=========================
CLOSE CHAT
=========================*/

if (closeChat) {

    closeChat.onclick = () => {

        chatWindow.style.display = "none";

    };

}

/*=========================
ENTER KEY
=========================*/

if (chatInput) {

    chatInput.addEventListener("keypress", (e) => {

        if (e.key === "Enter") {

            sendMessage();

        }

    });

}

/*=========================
SEARCH BOOK
=========================*/

function searchBook(question) {

    const q = question.toLowerCase();

    for (const book of allBooks) {

        if (
            (book.title || "").toLowerCase().includes(q) ||
            (book.category || "").toLowerCase().includes(q)
        ) {

            return `

📚 <b>${book.title}</b><br>

👤 ${book.author}<br>

📂 ${book.category}<br><br>

<a href="reader.html?book=${encodeURIComponent(book.pdf)}" class="btn">
📖 Read Online
</a>

&nbsp;

<a href="${book.pdf}" download class="btn">
⬇ Download
</a>

`;

        }

    }

    return null;
}

/*=========================
SEARCH KNOWLEDGE
=========================*/

function searchKnowledge(question) {

    const q = question.toLowerCase();

    for (const item of knowledge) {

        if (

            (item.question || "").toLowerCase().includes(q)

        ) {

            return item.answer;

        }

    }

    return null;

}

/*=========================
BOT MESSAGE
=========================*/

function botReply(text) {

    chatMessages.innerHTML += `

<div class="bot-message">

${text}

</div>

`;

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/*=========================
USER MESSAGE
=========================*/

function userReply(text) {

    chatMessages.innerHTML += `

<div class="user-message">

${text}

</div>

`;

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/*=========================
SEND MESSAGE
=========================*/

function sendMessage() {

    const question = chatInput.value.trim();

    if (question === "") return;

    userReply(question);

    chatInput.value = "";

    setTimeout(() => {

        let reply = searchBook(question);

        if (!reply) {

            reply = searchKnowledge(question);

        }

        if (!reply) {

            reply = `

🤖 Sorry!

Mujhe iska jawab abhi database me nahi mila.

`;

        }

        botReply(reply);

    }, 500);

}

console.log("✅ Script Part 3 Loaded");

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

"use strict";


/* =========================================================
   1. CASUAL MESSAGE DETECTOR
========================================================= */

const CHISHTI_CASUAL_MESSAGES = [

    "hi",
    "hello",
    "hey",
    "hii",
    "hiii",
    "helo",

    "salam",
    "salaam",
    "assalamualaikum",
    "assalamu alaikum",
    "aoa",

    "thanks",
    "thank you",
    "thx",
    "ok",
    "okay",
    "bye",
    "goodbye",

    "good morning",
    "good evening",
    "good night"

];


function chishtiIsCasualMessage(text) {

    const value =
        normalize(text);

    return CHISHTI_CASUAL_MESSAGES.includes(value);

}


/* =========================================================
   2. REAL BOOK REQUEST DETECTOR
========================================================= */

function chishtiIsBookRequest(text) {

    const value =
        normalize(text);

    const bookWords = [

        "book",
        "books",
        "kitab",
        "kitabain",
        "kitabein",
        "kitab dikhao",
        "kitab batao",

        "show book",
        "show books",
        "show all books",

        "read book",
        "read online",

        "download book",
        "download pdf",

        "latest book",
        "latest books",
        "new book",
        "new books",

        "search book",
        "find book",

        "naat",
        "manqabat",
        "hamd",
        "maqala",
        "seerat",

        "kulliyat",
        "kuliyat"

    ];

    return bookWords.some(word =>
        value.includes(
            normalize(word)
        )
    );

}


/* =========================================================
   3. GREETING RESPONSE
========================================================= */

function chishtiGreetingResponse(text) {

    const value =
        normalize(text);


    if (
        value === "hi" ||
        value === "hello" ||
        value === "hey" ||
        value === "hii" ||
        value === "hiii" ||
        value === "helo"
    ) {

        return {

            text:
                "Hi 👋<br><br>" +
                "Main <strong>Chishti AI</strong> hoon. " +
                "How can I help you today?",

            books: [],

            speak:
                "Hi. Main Chishti AI hoon. How can I help you today?"

        };

    }


    if (
        value === "salam" ||
        value === "salaam" ||
        value === "assalamualaikum" ||
        value === "assalamu alaikum" ||
        value === "aoa"
    ) {

        return {

            text:
                "Wa Alaikum Assalam 🌙<br><br>" +
                "Khush aamdeed! Main <strong>Chishti AI</strong> hoon. " +
                "Aap kya poochna chahte hain?",

            books: [],

            speak:
                "Wa Alaikum Assalam. Khush aamdeed. Main Chishti AI hoon. Aap kya poochna chahte hain?"

        };

    }


    if (
        value === "thanks" ||
        value === "thank you" ||
        value === "thx"
    ) {

        return {

            text:
                "You're welcome 😊<br><br>" +
                "Agar kisi book ya Chishti Library ke baare mein poochna ho to bata dein.",

            books: [],

            speak:
                "You're welcome. Agar kisi book ya Chishti Library ke baare mein poochna ho to bata dein."

        };

    }


    if (
        value === "bye" ||
        value === "goodbye"
    ) {

        return {

            text:
                "Allah Hafiz 👋<br><br>" +
                "Jab bhi zaroorat ho, Chishti AI available hai.",

            books: [],

            speak:
                "Allah Hafiz. Jab bhi zaroorat ho, Chishti AI available hai."

        };

    }


    if (
        value === "good morning"
    ) {

        return {

            text:
                "Good morning ☀️<br><br>" +
                "How can I help you today?",

            books: [],

            speak:
                "Good morning. How can I help you today?"

        };

    }


    if (
        value === "good evening"
    ) {

        return {

            text:
                "Good evening 🌙<br><br>" +
                "How can I help you today?",

            books: [],

            speak:
                "Good evening. How can I help you today?"

        };

    }


    if (
        value === "good night"
    ) {

        return {

            text:
                "Good night 🌙<br><br>" +
                "Allah Hafiz!",

            books: [],

            speak:
                "Good night. Allah Hafiz."

        };

    }


    return null;

}


/* =========================================================
   4. PREVENT OLD BOOK SEARCH FOR SIMPLE CHAT
========================================================= */

async function chishtiProcessMessageFixed(input) {

    const normalized =
        normalize(input);


    /* -----------------------------------------
       EMPTY
    ----------------------------------------- */

    if (!normalized) {

        return {

            text:
                "Ji, bataiye 😊",

            books: [],

            speak:
                "Ji, bataiye."

        };

    }


    /* -----------------------------------------
       CASUAL MESSAGE FIRST
       VERY IMPORTANT
    ----------------------------------------- */

    const casual =
        chishtiGreetingResponse(normalized);


    if (casual) {

        return casual;

    }


    /* -----------------------------------------
       BOOK SEARCH ONLY IF ACTUALLY REQUESTED
    ----------------------------------------- */

    if (
        chishtiIsBookRequest(normalized)
    ) {

        /*
           ALL BOOKS
        */

        if (
            containsAny(normalized, [
                "show all books",
                "all books",
                "list books",
                "books list",
                "kitabain dikhao",
                "kitabein dikhao",
                "kitab dikhao",
                "show books"
            ])
        ) {

            const result =
                Array.isArray(books)
                    ? books.slice(0, 20)
                    : [];


            return {

                text:
                    `Library database mein <strong>${books.length}</strong> books hain.`,

                books:
                    removeDuplicateBooks(result),

                speak:
                    `Library database mein ${books.length} books hain.`

            };

        }


        /* -----------------------------------------
           KULLIYAT
        ----------------------------------------- */

        if (
            normalized.includes("kulliyat") ||
            normalized.includes("kuliyat")
        ) {

            const result =
                books.filter(book => {

                    const data =
                        normalize(
                            `${book.title || ""} ${book.category || ""} ${book.description || ""}`
                        );

                    return (
                        data.includes("kulliyat") ||
                        data.includes("kuliyat")
                    );

                });


            const unique =
                removeDuplicateBooks(result);


            if (!unique.length) {

                return {

                    text:
                        "Mujhe abhi database mein Kulliyat ki koi book nahi mili.",

                    books: [],

                    speak:
                        "Mujhe abhi database mein Kulliyat ki koi book nahi mili."

                };

            }


            return {

                text:
                    `Ji, mujhe <strong>${unique.length}</strong> Kulliyat-related books mili hain:`,

                books:
                    unique,

                speak:
                    `Ji, mujhe ${unique.length} Kulliyat-related books mili hain.`

            };

        }


        /* -----------------------------------------
           CATEGORY
        ----------------------------------------- */

        if (
            normalized.includes("naat")
        ) {

            return chishtiCategoryResult("Naat");

        }


        if (
            normalized.includes("manqabat")
        ) {

            return chishtiCategoryResult("Manqabat");

        }


        if (
            normalized.includes("hamd")
        ) {

            return chishtiCategoryResult("Hamd");

        }


        if (
            normalized.includes("maqala")
        ) {

            return chishtiCategoryResult("Maqala");

        }


        if (
            normalized.includes("seerat")
        ) {

            return chishtiCategoryResult("Seerat");

        }


        /* -----------------------------------------
           LATEST BOOKS
        ----------------------------------------- */

        if (
            containsAny(normalized, [
                "latest book",
                "latest books",
                "new book",
                "new books",
                "latest release"
            ])
        ) {

            const latest =
                [...books]
                    .sort((a, b) => {

                        const aTime =
                            a.createdAt?.seconds ||
                            a.createdAt ||
                            0;

                        const bTime =
                            b.createdAt?.seconds ||
                            b.createdAt ||
                            0;

                        return bTime - aTime;

                    })
                    .slice(0, 8);


            return {

                text:
                    "Ji, ye library ki latest books hain:",

                books:
                    removeDuplicateBooks(latest),

                speak:
                    "Ji, ye library ki latest books hain."

            };

        }


        /* -----------------------------------------
           EXACT / PARTIAL BOOK SEARCH
        ----------------------------------------- */

        const found =
            searchBooksOnlyWhenRequested(
                normalized
            );


        if (found.length) {

            return {

                text:
                    found.length === 1
                        ? "Ji, mujhe ye book library database mein mili:"
                        : `Ji, mujhe ${found.length} matching books mili hain:`,

                books:
                    removeDuplicateBooks(found),

                speak:
                    found.length === 1
                        ? `${found[0].title || "Ye book"} library database mein available hai.`
                        : `${found.length} matching books library database mein mili hain.`

            };

        }

    }


    /* =====================================================
       KNOWLEDGE
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
       COMMANDS
    ===================================================== */

    if (
        normalized === "home" ||
        normalized.includes("go home") ||
        normalized.includes("open home")
    ) {

        return {

            text:
                "Opening Chishti Library home page...",

            books: [],

            speak:
                "Opening Chishti Library home page.",

            action:
                "home"

        };

    }


    if (
        normalized === "open books" ||
        normalized === "books page"
    ) {

        return {

            text:
                "Opening Books page...",

            books: [],

            speak:
                "Opening Books page.",

            action:
                "books"

        };

    }


    /* =====================================================
       DEFAULT — NO RANDOM BOOK
    ===================================================== */

    return {

        text:
            "Ji 😊 Main aapki baat samajhne ki koshish kar raha hoon.<br><br>" +
            "Aap mujh se <strong>Chishti Library</strong>, " +
            "authors, Islamic literature ya books ke baare mein pooch sakte hain.",

        books: [],

        speak:
            "Ji. Main aapki baat samajhne ki koshish kar raha hoon. Aap mujh se Chishti Library, authors, Islamic literature ya books ke baare mein pooch sakte hain."

    };

}


/* =========================================================
   5. CATEGORY SEARCH
========================================================= */

function chishtiCategoryResult(category) {

    const result =
        books.filter(book => {

            const data =
                normalize(
                    `${book.category || ""} ${book.title || ""}`
                );

            return data.includes(
                normalize(category)
            );

        });


    const unique =
        removeDuplicateBooks(result);


    if (!unique.length) {

        return {

            text:
                `${category} category mein abhi koi book nahi mili.`,

            books: [],

            speak:
                `${category} category mein abhi koi book nahi mili.`

        };

    }


    return {

        text:
            `<strong>${category}</strong> category mein <strong>${unique.length}</strong> books available hain:`,

        books:
            unique,

        speak:
            `${category} category mein ${unique.length} books available hain.`

    };

}


/* =========================================================
   6. BOOK SEARCH
========================================================= */

function searchBooksOnlyWhenRequested(query) {

    if (!Array.isArray(books) || !books.length) {
        return [];
    }


    const clean =
        normalize(query);


    /*
       Remove command words.
    */

    const searchText =
        clean
            .replace(/\b(show|book|books|find|search|read|online|download|pdf)\b/g, " ")
            .replace(/\s+/g, " ")
            .trim();


    if (!searchText) {
        return [];
    }


    const words =
        searchText
            .split(" ")
            .filter(word => word.length >= 3);


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
                    title === searchText
                ) {

                    score += 1000;

                }


                if (
                    title.includes(searchText)
                ) {

                    score += 300;

                }


                if (
                    author.includes(searchText)
                ) {

                    score += 100;

                }


                if (
                    category.includes(searchText)
                ) {

                    score += 80;

                }


                words.forEach(word => {

                    if (title.includes(word)) {
                        score += 50;
                    }

                    if (author.includes(word)) {
                        score += 20;
                    }

                    if (category.includes(word)) {
                        score += 15;
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


    return removeDuplicateBooks(results);

}


/* =========================================================
   7. REMOVE DUPLICATE BOOKS
========================================================= */

function removeDuplicateBooks(list) {

    if (!Array.isArray(list)) {
        return [];
    }


    const seen =
        new Set();


    return list.filter(book => {

        const key =
            String(
                book.firestoreId ||
                book.id ||
                book.title ||
                ""
            )
            .trim()
            .toLowerCase();


        if (!key) {
            return true;
        }


        if (seen.has(key)) {
            return false;
        }


        seen.add(key);

        return true;

    });

}


/* =========================================================
   8. REPLACE SEND MESSAGE BEHAVIOR
   CAPTURE PHASE PREVENTS OLD FUNCTION FROM RUNNING
========================================================= */

function chishtiHandleSend() {

    if (!currentUser) {

        if (
            typeof requireLogin === "function"
        ) {

            requireLogin();

        }

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


    chishtiProcessMessageFixed(text)
        .then(answer => {

            removeTyping();

            addBotMessage(
                answer.text,
                answer.books || []
            );


            if (
                answer.action === "home"
            ) {

                setTimeout(() => {
                    window.location.href =
                        "index.html";
                }, 300);

            }


            if (
                answer.action === "books"
            ) {

                setTimeout(() => {
                    window.location.href =
                        "books.html";
                }, 300);

            }


            if (
                voiceEnabled &&
                answer.speak &&
                typeof speak === "function"
            ) {

                speak(
                    answer.speak
                );

            }

        })
        .catch(error => {

            console.error(
                "Chishti AI:",
                error
            );

            removeTyping();

            addBotMessage(
                "Sorry, AI response mein problem aa gayi. Please try again."
            );

        });

}


/* =========================================================
   9. SEND BUTTON FIX
========================================================= */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopImmediatePropagation();

            chishtiHandleSend();

        },
        true
    );

}


/* =========================================================
   10. ENTER KEY FIX
========================================================= */

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                event.stopImmediatePropagation();

                chishtiHandleSend();

            }

        },
        true
    );

}


/* =========================================================
   11. SAFETY: NEVER SHOW BOOKS FOR SIMPLE GREETING
========================================================= */

if (chatMessages) {

    const observer =
        new MutationObserver(() => {

            const messages =
                chatMessages.querySelectorAll(
                    ".user-message"
                );


            const lastUser =
                messages[messages.length - 1];


            if (!lastUser) {
                return;
            }


            const text =
                normalize(
                    lastUser.textContent
                );


            if (
                chishtiIsCasualMessage(text)
            ) {

                /*
                   We don't remove old legitimate
                   book results. This only protects
                   casual-message response generation.
                */

                console.log(
                    "Chishti AI: casual message detected → no book search"
                );

            }

        });


    observer.observe(
        chatMessages,
        {
            childList: true
        }
    );

}


/* =========================================================
   DONE
========================================================= */

console.log(
    "✅ Chishti AI final chat patch loaded"
);

console.log(
    "✅ Casual messages protected"
);

console.log(
    "✅ Book search only on book requests"
);

console.log(
    "✅ Duplicate books protected"
);

console.log(
    "✅ No manual function call required"
);
