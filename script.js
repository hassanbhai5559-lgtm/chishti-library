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

/*=========================
  VISITOR COUNTER
=========================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) return;

    try {

        const visitorRef =
            db.collection("counter").doc("visitors");


        /* =========================
           GET CURRENT DOCUMENT
        ========================= */

        const snapshot =
            await visitorRef.get();


        /* =========================
           CREATE DOCUMENT IF MISSING
        ========================= */

        if (!snapshot.exists) {

            await visitorRef.set({
                count: 1
            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            visitorCounter.innerText = "1";

            return;
        }


        /* =========================
           CHECK THIS SESSION
        ========================= */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* =========================
           NEW VISITOR
        ========================= */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore.FieldValue.increment(1)

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        /* =========================
           GET UPDATED COUNT
        ========================= */

        const latestSnapshot =
            await visitorRef.get();


        const visitors =
            Number(
                latestSnapshot.data().count
            ) || 0;


        /* =========================
           ANIMATION
        ========================= */

        let current = 0;

        const animation =
            setInterval(function () {

                current++;

                visitorCounter.innerText =
                    current;

                if (current >= visitors) {

                    clearInterval(animation);

                }

            }, 25);


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        visitorCounter.innerText = "0";

    }

}


/* =========================
   START COUNTER
========================= */

updateVisitorCounter();

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

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 2
DISPLAY BOOKS + SEARCH + FILTER
=========================================*/

function displayBooks(books) {

    const container = document.getElementById("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    if (books.length === 0) {

        container.innerHTML = `
        <div class="no-books">
            <h2>No Books Found</h2>
            <p>Try another search.</p>
        </div>
        `;

        return;
    }

    books.forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}"
                 alt="${book.title}"
                 loading="lazy">

            <div class="book-content">

                <span class="book-category">
                    ${book.category}
                </span>

                <h2>${book.title}</h2>

                <h3>${book.author}</h3>

                <p>${book.description}</p>

                <div class="book-meta">

                    <span>👁 ${book.views || 0}</span>

                    <span>❤️ ${book.likes || 0}</span>

                    <span>⬇ ${book.downloads || 0}</span>

                </div>

                <div class="book-buttons">

                    <a href="reader.html?book=${encodeURIComponent(book.pdf)}"
                       class="btn">
                        📖 Read Online
                    </a>

                    <a href="${book.pdf}"
                       download
                       class="btn">
                        ⬇ Download
                    </a>

                </div>

            </div>

        </div>

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
/* =========================================================
   CHISHTI LIBRARY
   LIKE + SHARE + COMMENT UI
   PASTE THIS AT THE VERY END OF SCRIPT.JS
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       LIKE BUTTON
       ===================================================== */

    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(".like-book");

        if (!button) return;


        /* Prevent double click animation */
        if (button.dataset.animating === "true") {
            return;
        }


        button.dataset.animating = "true";


        /* Heart animation */
        button.classList.add("heart-pop");
        button.classList.add("liked");


        const icon =
            button.querySelector("i");


        if (icon) {

            icon.className =
                "fa-solid fa-heart";

        }


        /* Floating hearts */

        createFloatingHearts(button);


        setTimeout(function () {

            button.classList.remove(
                "heart-pop"
            );

            button.dataset.animating =
                "false";

        }, 600);

    });


    /* =====================================================
       FLOATING HEARTS
       ===================================================== */

    function createFloatingHearts(button) {

        const rect =
            button.getBoundingClientRect();


        const hearts = [
            "❤️",
            "💖",
            "💕",
            "❤️",
            "💗"
        ];


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const heart =
                document.createElement("span");


            heart.className =
                "floating-heart";


            heart.textContent =
                hearts[
                    Math.floor(
                        Math.random() *
                        hearts.length
                    )
                ];


            heart.style.left =
                (
                    rect.left +
                    rect.width / 2 +
                    (Math.random() * 40 - 20)
                ) + "px";


            heart.style.top =
                (
                    rect.top +
                    window.scrollY
                ) + "px";


            heart.style.setProperty(
                "--heart-x",
                (
                    Math.random() * 100 -
                    50
                ) + "px"
            );


            document.body.appendChild(
                heart
            );


            setTimeout(function () {

                heart.remove();

            }, 1200);

        }

    }


    /* =====================================================
       SHARE BUTTON
       ===================================================== */

    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(".share-book");

        if (!button) return;


        const bookId =
            button.dataset.bookId || "";


        const book =
            typeof findBookById === "function"
                ? findBookById(bookId)
                : null;


        const title =
            book?.title ||
            document.title ||
            "Chishti Library";


        const url =
            window.location.href;


        openShareBox(
            title,
            url
        );

    });


    /* =====================================================
       SHARE POPUP
       ===================================================== */

    function openShareBox(
        title,
        url
    ) {

        const old =
            document.getElementById(
                "chishtiShareBox"
            );


        if (old) {
            old.remove();
        }


        const encodedURL =
            encodeURIComponent(url);


        const encodedText =
            encodeURIComponent(
                title
            );


        const popup =
            document.createElement("div");


        popup.id =
            "chishtiShareBox";


        popup.className =
            "chishti-share-popup";


        popup.innerHTML = `

            <div class="share-panel">

                <button
                    type="button"
                    class="share-close"
                    aria-label="Close"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>


                <div class="share-heading">

                    <span class="share-icon">
                        <i class="fa-solid fa-share-nodes"></i>
                    </span>

                    <h3>
                        Share Book
                    </h3>

                    <p>
                        Share this book with your friends
                    </p>

                </div>


                <div class="share-buttons">


                    <a
                        href="https://wa.me/?text=${encodedText}%20${encodedURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="share-option whatsapp"
                    >

                        <i class="fa-brands fa-whatsapp"></i>

                        <span>WhatsApp</span>

                    </a>


                    <a
                        href="https://www.facebook.com/sharer/sharer.php?u=${encodedURL}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="share-option facebook"
                    >

                        <i class="fa-brands fa-facebook-f"></i>

                        <span>Facebook</span>

                    </a>


                    <a
                        href="https://t.me/share/url?url=${encodedURL}&text=${encodedText}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="share-option telegram"
                    >

                        <i class="fa-brands fa-telegram"></i>

                        <span>Telegram</span>

                    </a>


                    <a
                        href="https://twitter.com/intent/tweet?url=${encodedURL}&text=${encodedText}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="share-option twitter"
                    >

                        <i class="fa-brands fa-x-twitter"></i>

                        <span>Twitter / X</span>

                    </a>


                    <button
                        type="button"
                        class="share-option copy-link"
                        id="copyChishtiBookLink"
                    >

                        <i class="fa-solid fa-link"></i>

                        <span>Copy Link</span>

                    </button>


                </div>

            </div>

        `;


        document.body.appendChild(
            popup
        );


        requestAnimationFrame(function () {

            popup.classList.add(
                "show"
            );

        });


        /* Close */

        const close =
            popup.querySelector(
                ".share-close"
            );


        if (close) {

            close.addEventListener(
                "click",
                function () {

                    closeShareBox();

                }
            );

        }


        /* Click outside */

        popup.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === popup
                ) {

                    closeShareBox();

                }

            }
        );


        /* Copy link */

        const copyButton =
            popup.querySelector(
                "#copyChishtiBookLink"
            );


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                async function () {

                    try {

                        await navigator
                            .clipboard
                            .writeText(url);


                        copyButton.innerHTML = `

                            <i class="fa-solid fa-check"></i>

                            <span>
                                Copied!
                            </span>

                        `;


                        if (
                            typeof showToast ===
                            "function"
                        ) {

                            showToast(
                                "🔗 Book link copied!"
                            );

                        }


                        setTimeout(
                            function () {

                                closeShareBox();

                            },
                            900
                        );


                    } catch (error) {

                        console.error(
                            "Copy error:",
                            error
                        );

                    }

                }
            );

        }

    }


    /* =====================================================
       CLOSE SHARE
       ===================================================== */

    function closeShareBox() {

        const popup =
            document.getElementById(
                "chishtiShareBox"
            );


        if (!popup) return;


        popup.classList.remove(
            "show"
        );


        setTimeout(
            function () {

                popup.remove();

            },
            300
        );

    }


    /* =====================================================
       COMMENT BUTTON
       ===================================================== */

    document.addEventListener("click", function (event) {

        const button =
            event.target.closest(
                ".comment-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        if (!bookId) {

            console.warn(
                "Comment button has no book ID."
            );

            return;

        }


        let book = null;


        if (
            typeof findBookById ===
            "function"
        ) {

            book =
                findBookById(
                    bookId
                );

        }


        if (!book) {

            book = {
                id: bookId,
                title: "Book"
            };

        }


        if (
            typeof openComments ===
            "function"
        ) {

            openComments(
                book
            );

            return;

        }


        /* Fallback comment modal */

        openCommentFallback(
            book
        );

    });


    /* =====================================================
       COMMENT FALLBACK
       ===================================================== */

    function openCommentFallback(book) {

        const old =
            document.getElementById(
                "chishtiCommentBox"
            );


        if (old) {
            old.remove();
        }


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "chishtiCommentBox";


        modal.className =
            "chishti-comment-popup";


        modal.innerHTML = `

            <div class="comment-panel">


                <button
                    type="button"
                    class="comment-close"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>


                <div class="comment-header">

                    <div class="comment-header-icon">

                        💬

                    </div>


                    <div>

                        <h3>
                            Comments
                        </h3>

                        <p>
                            ${escapeCommentText(
                                book.title ||
                                "Book"
                            )}
                        </p>

                    </div>

                </div>


                <div
                    class="comment-gif-area"
                >

                    <div class="comment-gif">

                        💖

                    </div>

                    <p>
                        Share your thoughts about this book
                    </p>

                </div>


                <div class="comment-reactions">


                    <button
                        type="button"
                        data-comment-emoji="❤️"
                    >
                        ❤️
                    </button>


                    <button
                        type="button"
                        data-comment-emoji="😍"
                    >
                        😍
                    </button>


                    <button
                        type="button"
                        data-comment-emoji="🤲"
                    >
                        🤲
                    </button>


                    <button
                        type="button"
                        data-comment-emoji="📚"
                    >
                        📚
                    </button>


                    <button
                        type="button"
                        data-comment-emoji="✨"
                    >
                        ✨
                    </button>


                    <button
                        type="button"
                        data-comment-emoji="🌙"
                    >
                        🌙
                    </button>


                </div>


                <div class="comment-input-row">

                    <input
                        type="text"
                        id="fallbackCommentInput"
                        maxlength="500"
                        placeholder="Write a comment..."
                        autocomplete="off"
                    >


                    <button
                        type="button"
                        id="fallbackCommentSend"
                    >

                        <i class="fa-solid fa-paper-plane"></i>

                    </button>

                </div>


                <div
                    id="fallbackCommentList"
                    class="fallback-comment-list"
                >

                    <div class="no-comments">

                        No comments yet.
                        Be the first to comment.

                    </div>

                </div>


            </div>

        `;


        document.body.appendChild(
            modal
        );


        requestAnimationFrame(
            function () {

                modal.classList.add(
                    "show"
                );

            }
        );


        /* Close */

        modal
            .querySelector(
                ".comment-close"
            )
            .addEventListener(
                "click",
                function () {

                    closeCommentFallback();

                }
            );


        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === modal
                ) {

                    closeCommentFallback();

                }

            }
        );


        /* Emoji */

        modal
            .querySelectorAll(
                "[data-comment-emoji]"
            )
            .forEach(
                function (emojiButton) {

                    emojiButton.addEventListener(
                        "click",
                        function () {

                            const input =
                                document.getElementById(
                                    "fallbackCommentInput"
                                );


                            if (!input) return;


                            input.value +=
                                emojiButton.dataset
                                    .commentEmoji;


                            input.focus();

                        }
                    );

                }
            );


        /* Send */

        const send =
            document.getElementById(
                "fallbackCommentSend"
            );


        if (send) {

            send.addEventListener(
                "click",
                function () {

                    addFallbackComment();

                }
            );

        }


        const input =
            document.getElementById(
                "fallbackCommentInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        addFallbackComment();

                    }

                }
            );

        }

    }


    /* =====================================================
       ADD FALLBACK COMMENT
       ===================================================== */

    function addFallbackComment() {

        const input =
            document.getElementById(
                "fallbackCommentInput"
            );


        const list =
            document.getElementById(
                "fallbackCommentList"
            );


        if (!input || !list) return;


        const text =
            input.value.trim();


        if (!text) return;


        const comment =
            document.createElement(
                "div"
            );


        comment.className =
            "fallback-comment";


        comment.innerHTML = `

            <div class="comment-avatar">

                <i class="fa-solid fa-user"></i>

            </div>


            <div class="comment-body">

                <strong>
                    You
                </strong>

                <p>
                    ${escapeCommentText(
                        text
                    )}
                </p>

            </div>

        `;


        const empty =
            list.querySelector(
                ".no-comments"
            );


        if (empty) {
            empty.remove();
        }


        list.prepend(
            comment
        );


        input.value =
            "";


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "💬 Comment added!"
            );

        }

    }


    /* =====================================================
       CLOSE COMMENT
       ===================================================== */

    function closeCommentFallback() {

        const modal =
            document.getElementById(
                "chishtiCommentBox"
            );


        if (!modal) return;


        modal.classList.remove(
            "show"
        );


        setTimeout(
            function () {

                modal.remove();

            },
            300
        );

    }


    /* =====================================================
       ESCAPE COMMENT TEXT
       ===================================================== */

    function escapeCommentText(
        value
    ) {

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


    /* =====================================================
       ESC KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            closeShareBox();
            closeCommentFallback();

        }
    );


    /* =====================================================
       PUBLIC
       ===================================================== */

    window.chishtiOpenShare =
        openShareBox;


    window.chishtiCloseShare =
        closeShareBox;


})();

/* =========================================================
   CHISHTI LIBRARY
   SAFE HORIZONTAL BOOK CAROUSEL
   ADD THIS AT THE VERY END OF SCRIPT.JS
========================================================= */

(function () {

    "use strict";

    let animationFrame = null;
    let paused = false;
    let initializedContainer = null;


    function startBookCarousel() {

        const container =
            document.getElementById("booksContainer");

        if (!container) {
            return;
        }


        /* Stop previous animation */
        if (animationFrame) {

            cancelAnimationFrame(
                animationFrame
            );

            animationFrame = null;

        }


        /* If there are not enough books, do nothing */
        if (
            container.scrollWidth <=
            container.clientWidth
        ) {

            return;

        }


        function animate() {

            if (!paused) {

                container.scrollLeft += 0.35;


                /*
                 * Safely return to beginning
                 * when reaching the end.
                 */

                if (
                    container.scrollLeft +
                    container.clientWidth >=
                    container.scrollWidth - 2
                ) {

                    container.scrollLeft = 0;

                }

            }


            animationFrame =
                requestAnimationFrame(
                    animate
                );

        }


        animationFrame =
            requestAnimationFrame(
                animate
            );

    }


    function setupBookCarousel() {

        const container =
            document.getElementById(
                "booksContainer"
            );

        if (!container) {
            return;
        }


        /*
         * Do not add mouse/touch events
         * more than once.
         */

        if (
            initializedContainer ===
            container
        ) {

            startBookCarousel();

            return;

        }


        initializedContainer =
            container;


        /* Desktop pause */
        container.addEventListener(
            "mouseenter",
            function () {

                paused = true;

            }
        );


        container.addEventListener(
            "mouseleave",
            function () {

                paused = false;

            }
        );


        /* Mobile touch pause */
        container.addEventListener(
            "touchstart",
            function () {

                paused = true;

            },
            {
                passive: true
            }
        );


        container.addEventListener(
            "touchend",
            function () {

                setTimeout(
                    function () {

                        paused = false;

                    },
                    1000
                );

            },
            {
                passive: true
            }
        );


        startBookCarousel();

    }


    /*
     * Start after page loads.
     */

    function bootCarousel() {

        setTimeout(
            function () {

                setupBookCarousel();

            },
            1200
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootCarousel
        );

    } else {

        bootCarousel();

    }


    /*
     * Make function available globally.
     * This lets us restart it after
     * search/category rendering.
     */

    window.restartBookCarousel =
        function () {

            setTimeout(
                function () {

                    setupBookCarousel();

                },
                150
            );

        };


})();
