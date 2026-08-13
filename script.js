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

        // Firestore visitor document
        const visitorRef =
            db.collection("counter").doc("visitors");

        /*
         * Check whether this browser session
         * has already been counted.
         *
         * Refresh = no new visitor
         * New session = +1 visitor
         */

        const alreadyCounted =
            sessionStorage.getItem("chishtiVisitorCounted");

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

        /*
         * Get latest global visitor count
         */

        const snapshot =
            await visitorRef.get();

        if (!snapshot.exists()) {

            visitorCounter.innerText = "0";

            return;

        }

        const visitors =
            Number(snapshot.data().count) || 0;

        /*
         * Counter animation
         */

        let current = 0;

        const animation =
            setInterval(() => {

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


/* Start visitor counter */

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
