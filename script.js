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
/* =====================================================
   CHISHTI LIBRARY
   RESPONSIVE BOOK CARDS
   LIKE • COMMENT • SHARE
===================================================== */

function displayBooks(books) {

    const container =
        document.getElementById("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!books || books.length === 0) {

        container.innerHTML = `
            <div class="no-books">
                <h2>No Books Found</h2>
                <p>Try another search.</p>
            </div>
        `;

        return;
    }


    books.forEach(function(book) {

        /*
        ---------------------------------------------
        BOOK ID
        ---------------------------------------------
        */

        const socialBookId =
            String(
                book.id ||
                book.slug ||
                book.pdf ||
                book.title
            )
            .replace(/[\/\\]/g, "_");


        const likes =
            Number(book.likes || 0);

        const comments =
            Number(book.comments || 0);

        const shares =
            Number(book.shares || 0);


        container.innerHTML += `

        <article
            class="book-card"
            data-book-id="${escapeSocialHTML(socialBookId)}"
        >

            <!-- BOOK COVER -->

            <div class="book-cover-wrap">

                <img
                    src="${escapeSocialHTML(book.cover)}"
                    alt="${escapeSocialHTML(book.title)}"
                    loading="lazy"
                    class="book-cover"
                >

            </div>


            <!-- BOOK CONTENT -->

            <div class="book-content">

                <span class="book-category">

                    ${escapeSocialHTML(
                        book.category || "Islamic Book"
                    )}

                </span>


                <h2 class="book-title">

                    ${escapeSocialHTML(
                        book.title || "Untitled Book"
                    )}

                </h2>


                <h3 class="book-author">

                    ${escapeSocialHTML(
                        book.author || "Chishti Library"
                    )}

                </h3>


                <p class="book-description">

                    ${escapeSocialHTML(
                        book.description || ""
                    )}

                </p>


                <!-- BOOK STATS -->

                <div class="book-meta">

                    <span>
                        <i class="fa-solid fa-eye"></i>
                        ${Number(book.views || 0)}
                    </span>

                    <span>
                        <i class="fa-solid fa-heart"></i>
                        ${likes}
                    </span>

                    <span>
                        <i class="fa-solid fa-download"></i>
                        ${Number(book.downloads || 0)}
                    </span>

                </div>


                <!-- ❤️ 💬 📤 SOCIAL ACTIONS -->

                <div class="social-actions">

                    <!-- LIKE -->

                    <button
                        type="button"
                        class="social-btn like-btn"
                        data-book-id="${escapeSocialHTML(socialBookId)}"
                        aria-label="Like this book"
                    >

                        <span class="icon-wrap">

                            <i class="fa-regular fa-heart"></i>

                            <span class="like-burst"></span>

                        </span>

                        <span class="action-count">
                            ${likes}
                        </span>

                    </button>


                    <!-- COMMENT -->

                    <button
                        type="button"
                        class="social-btn comment-btn"
                        data-book-id="${escapeSocialHTML(socialBookId)}"
                        aria-label="Comments"
                    >

                        <span class="icon-wrap">

                            <i class="fa-regular fa-comment"></i>

                        </span>

                        <span class="action-count">
                            ${comments}
                        </span>

                    </button>


                    <!-- SHARE -->

                    <button
                        type="button"
                        class="social-btn share-btn"
                        data-book-id="${escapeSocialHTML(socialBookId)}"
                        aria-label="Share book"
                    >

                        <span class="icon-wrap">

                            <i class="fa-solid fa-share-nodes"></i>

                        </span>

                        <span class="action-count">
                            ${shares}
                        </span>

                    </button>

                </div>


                <!-- MAIN BUTTONS -->

                <div class="book-buttons">

                    <a
                        href="reader.html?book=${encodeURIComponent(
                            book.pdf || ""
                        )}"
                        class="btn read-btn"
                    >

                        <i class="fa-solid fa-book-open"></i>

                        Read Online

                    </a>


                    <a
                        href="${escapeSocialHTML(
                            book.pdf || "#"
                        )}"
                        download
                        class="btn download-btn"
                    >

                        <i class="fa-solid fa-download"></i>

                        Download

                    </a>

                </div>

            </div>

        </article>

        `;

    });

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

/* =====================================================
   CHISHTI LIBRARY
   ❤️ LIKE
   💬 COMMENT
   🔖 BOOKMARK
   📤 SHARE
===================================================== */

let activeCommentBookId = null;
let activeShareBook = null;


/* =====================================================
   LOGIN CHECK
===================================================== */

function socialLoginRequired() {

    if (window.currentFirebaseUser) {
        return true;
    }

    if (typeof window.requireLogin === "function") {
        window.requireLogin();
    } else {
        alert("Please login first.");
    }

    return false;
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeSocialHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   ❤️ LIKE SYSTEM
===================================================== */

document.addEventListener("click", async function(event) {

    const button =
        event.target.closest(".like-btn");

    if (!button) return;

    if (!socialLoginRequired()) return;

    const bookId =
        button.dataset.bookId;

    const user =
        window.currentFirebaseUser;

    if (!window.db) {
        console.error("Firebase Firestore not ready.");
        return;
    }

    const bookRef =
        window.db
            .collection("books")
            .doc(bookId);

    const likeRef =
        bookRef
            .collection("likes")
            .doc(user.uid);

    try {

        const likeSnap =
            await likeRef.get();

        const countElement =
            button.querySelector(".action-count");

        let count =
            Number(
                countElement?.textContent || 0
            );


        /* =========================
           UNLIKE
        ========================= */

        if (likeSnap.exists) {

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

            button.classList.remove("liked");

            count = Math.max(0, count - 1);

        }


        /* =========================
           LIKE
        ========================= */

        else {

            await likeRef.set({

                uid: user.uid,

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

            button.classList.add("liked");

            /* ❤️ BIG ANIMATION */

            button.classList.remove("animate");

            void button.offsetWidth;

            button.classList.add("animate");

            setTimeout(() => {

                button.classList.remove("animate");

            }, 800);

            count++;

        }


        if (countElement) {

            countElement.textContent =
                count;

        }

    }

    catch (error) {

        console.error(
            "❤️ Like Error:",
            error
        );

    }

});


/* =====================================================
   💬 COMMENT MODAL
===================================================== */

const commentModal =
    document.getElementById("commentModal");

const commentsList =
    document.getElementById("commentsList");

const commentForm =
    document.getElementById("commentForm");

const commentInput =
    document.getElementById("commentInput");

const closeComments =
    document.getElementById("closeComments");


/* OPEN COMMENTS */

document.addEventListener("click", async function(event) {

    const button =
        event.target.closest(".comment-btn");

    if (!button) return;

    activeCommentBookId =
        button.dataset.bookId;

    button.classList.add("open");

    if (commentModal) {

        commentModal.classList.add("show");

    }

    await loadComments(
        activeCommentBookId
    );

});


/* CLOSE */

if (closeComments) {

    closeComments.addEventListener(
        "click",
        function() {

            commentModal.classList.remove(
                "show"
            );

        }
    );

}


/* CLICK OUTSIDE */

if (commentModal) {

    commentModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                commentModal
            ) {

                commentModal.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =====================================================
   LOAD COMMENTS
===================================================== */

async function loadComments(bookId) {

    if (!commentsList) return;

    commentsList.innerHTML = `

        <p style="
            text-align:center;
            color:#aaa;
            padding:20px;
        ">

            <i class="fa-solid fa-spinner fa-spin"></i>
            Loading comments...

        </p>

    `;


    try {

        const snapshot =
            await window.db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        if (snapshot.empty) {

            commentsList.innerHTML = `

                <p style="
                    text-align:center;
                    color:#aaa;
                    padding:20px;
                ">

                    No comments yet ❤️<br>
                    Be the first to comment!

                </p>

            `;

            return;

        }


        commentsList.innerHTML = "";


        snapshot.forEach(function(doc) {

            const data =
                doc.data();


            const comment =
                document.createElement("div");


            comment.className =
                "comment-item";


            comment.innerHTML = `

                <div class="comment-user">

                    <i class="fa-solid fa-user"></i>

                    ${escapeSocialHTML(
                        data.name ||
                        data.email ||
                        "Reader"
                    )}

                </div>

                <div class="comment-text">

                    ${escapeSocialHTML(
                        data.text
                    )}

                </div>

            `;


            commentsList.appendChild(
                comment
            );

        });

    }

    catch (error) {

        console.error(
            "💬 Comment Load Error:",
            error
        );


        commentsList.innerHTML = `

            <p style="
                text-align:center;
                color:#aaa;
                padding:20px;
            ">

                Unable to load comments.

            </p>

        `;

    }

}


/* =====================================================
   ➕ ADD COMMENT
===================================================== */

if (commentForm) {

    commentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            if (!socialLoginRequired()) {
                return;
            }


            const text =
                commentInput.value.trim();


            if (!text) {
                return;
            }


            if (!activeCommentBookId) {
                return;
            }


            const user =
                window.currentFirebaseUser;


            try {

                await window.db
                    .collection("books")
                    .doc(activeCommentBookId)
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


                commentInput.value = "";


                await loadComments(
                    activeCommentBookId
                );


                /* UPDATE COMMENT COUNT */

                const button =
                    document.querySelector(
                        `.comment-btn[data-book-id="${CSS.escape(
                            activeCommentBookId
                        )}"]`
                    );


                if (button) {

                    const count =
                        button.querySelector(
                            ".action-count"
                        );


                    if (count) {

                        count.textContent =
                            Number(
                                count.textContent || 0
                            ) + 1;

                    }

                }

            }

            catch (error) {

                console.error(
                    "💬 Add Comment Error:",
                    error
                );

                alert(
                    "Comment could not be posted."
                );

            }

        }
    );

}


/* =====================================================
   📤 SHARE SYSTEM
===================================================== */

const sharePopup =
    document.getElementById("sharePopup");

const copyBookLink =
    document.getElementById("copyBookLink");


document.addEventListener("click", function(event) {

    const button =
        event.target.closest(".share-btn");

    if (!button) return;


    const bookId =
        button.dataset.bookId;


    /*
       allBooks tumhare existing
       script.js ka books array hai.
    */

    if (!Array.isArray(window.allBooks) &&
        !Array.isArray(allBooks)) {

        console.error(
            "Books array not found."
        );

        return;

    }


    const books =
        Array.isArray(window.allBooks)
            ? window.allBooks
            : allBooks;


    const book =
        books.find(function(item) {

            return String(item.id) ===
                String(bookId);

        });


    if (!book) {

        console.error(
            "Book not found:",
            bookId
        );

        return;

    }


    activeShareBook =
        book;


    button.classList.add(
        "shared"
    );


    if (sharePopup) {

        sharePopup.classList.add(
            "show"
        );

    }

});


/* =====================================================
   SHARE OPTIONS
===================================================== */

document.addEventListener("click", async function(event) {

    const button =
        event.target.closest(
            ".share-option"
        );

    if (!button) return;

    if (!activeShareBook) return;


    const book =
        activeShareBook;


    const url =
        new URL(
            "reader.html?book=" +
            encodeURIComponent(
                book.pdf
            ),
            window.location.href
        ).href;


    const text =
        `Read "${book.title}" on Chishti Library`;


    const type =
        button.dataset.share;


    let shareURL = "";


    if (type === "whatsapp") {

        shareURL =
            "https://wa.me/?text=" +
            encodeURIComponent(
                text + " " + url
            );

    }


    else if (type === "facebook") {

        shareURL =
            "https://www.facebook.com/sharer/sharer.php?u=" +
            encodeURIComponent(url);

    }


    else if (type === "telegram") {

        shareURL =
            "https://t.me/share/url?url=" +
            encodeURIComponent(url) +
            "&text=" +
            encodeURIComponent(text);

    }


    else if (type === "twitter") {

        shareURL =
            "https://twitter.com/intent/tweet?text=" +
            encodeURIComponent(text) +
            "&url=" +
            encodeURIComponent(url);

    }


    if (shareURL) {

        window.open(
            shareURL,
            "_blank",
            "noopener,noreferrer"
        );

    }


    await incrementShare(book);

});


/* =====================================================
   📋 COPY LINK
===================================================== */

if (copyBookLink) {

    copyBookLink.addEventListener(
        "click",
        async function() {

            if (!activeShareBook) {
                return;
            }


            const url =
                new URL(
                    "reader.html?book=" +
                    encodeURIComponent(
                        activeShareBook.pdf
                    ),
                    window.location.href
                ).href;


            try {

                await navigator.clipboard.writeText(
                    url
                );


                copyBookLink.innerHTML = `

                    <i class="fa-solid fa-check"></i>

                    Link Copied!

                `;


                setTimeout(
                    function() {

                        copyBookLink.innerHTML = `

                            <i class="fa-solid fa-link"></i>

                            Copy Book Link

                        `;

                    },
                    1600
                );

            }

            catch (error) {

                console.error(
                    "Copy Link Error:",
                    error
                );

            }

        }
    );

}


/* =====================================================
   CLOSE SHARE
===================================================== */

if (sharePopup) {

    sharePopup.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                sharePopup
            ) {

                sharePopup.classList.remove(
                    "show"
                );

            }

        }
    );

}


/* =====================================================
   SHARE COUNTER
===================================================== */

async function incrementShare(book) {

    if (!window.db) {
        return;
    }


    try {

        await window.db
            .collection("books")
            .doc(String(book.id))
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

    }

    catch (error) {

        console.error(
            "📤 Share Counter Error:",
            error
        );

    }

}


console.log(
    "❤️ Like System Ready"
);

console.log(
    "💬 Comment System Ready"
);

console.log(
    "🔖 Bookmark System Ready"
);

console.log(
    "📤 Share System Ready"
);
