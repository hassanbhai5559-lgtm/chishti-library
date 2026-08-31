```javascript
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
FULL FIXED VERSION
Foundation + Books + Search + AI + Effects
=========================================*/

"use strict";


/*=========================================
PART 1
FOUNDATION + BOOKS LOADER
=========================================*/


/*=========================
PREMIUM LOADER
=========================*/

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");

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

const menuBtn =
    document.querySelector(".mobile-menu");

const menu =
    document.querySelector(".menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}


/*=========================
SCROLL TO TOP
=========================*/

const scrollBtn =
    document.getElementById("scrollTop");


window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    scrollBtn.style.display =
        window.scrollY > 300
            ? "block"
            : "none";

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
IMPORTANT FIREBASE NOTE
=========================================

Firebase visitor counter is handled by
firebase.js.

DO NOT put updateVisitorCounter()
inside this script.

firebase.js provides:

window.auth
window.db
window.storage

This prevents:

❌ duplicate Firebase initialization
❌ duplicate visitor counting
❌ Firebase helper errors
❌ db declaration conflicts
=========================================*/


/*=========================
GLOBAL VARIABLES
=========================*/

let allBooks = [];

let filteredBooks = [];


/*=========================================
LOAD BOOKS.JSON
=========================================*/

async function loadBooks() {

    try {

        const response =
            await fetch("books.json");


        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }


        allBooks =
            await response.json();


        if (!Array.isArray(allBooks)) {

            throw new Error(
                "books.json must contain an array"
            );

        }


        filteredBooks =
            [...allBooks];


        /*=========================
        BOOK COUNTER
        =========================*/

        const bookCounter =
            document.getElementById(
                "bookCounter"
            );


        if (bookCounter) {

            const total =
                allBooks.length;


            if (total === 0) {

                bookCounter.innerText =
                    "0";

            } else {

                let count = 0;


                const animation =
                    setInterval(() => {

                        count++;

                        bookCounter.innerText =
                            count;


                        if (
                            count >= total
                        ) {

                            clearInterval(
                                animation
                            );

                        }

                    }, 120);

            }

        }


        /*=========================
        DISPLAY BOOKS
        =========================*/

        displayBooks(
            filteredBooks
        );


        /*=========================
        LATEST BOOK
        =========================*/

        latestBook();


        console.log(
            "✅ Books Loaded Successfully"
        );


    } catch (error) {

        console.error(
            "❌ Books loading error:",
            error
        );

    }

}


loadBooks();


/*=========================
UTILITY
=========================*/

function byId(id) {

    return document.getElementById(id);

}


console.log(
    "✅ Script Part 1 Loaded"
);


/*=========================================
PART 2
DISPLAY BOOKS + SEARCH + FILTER
=========================================*/


function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (
        !Array.isArray(books) ||
        books.length === 0
    ) {

        container.innerHTML = `

            <div class="no-books">

                <h2>No Books Found</h2>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(book => {

        const title =
            book.title ||
            "Untitled Book";


        const author =
            book.author ||
            "Unknown Author";


        const category =
            book.category ||
            "General";


        const description =
            book.description ||
            "";


        const cover =
            book.cover ||
            "logo.png";


        const pdf =
            book.pdf ||
            "#";


        container.innerHTML += `

            <div class="book-card">

                <img
                    src="${cover}"
                    alt="${title}"
                    loading="lazy"
                    onerror="this.src='logo.png'"
                >


                <div class="book-content">


                    <span class="book-category">

                        ${category}

                    </span>


                    <h2>

                        ${title}

                    </h2>


                    <h3>

                        ${author}

                    </h3>


                    <p>

                        ${description}

                    </p>


                    <div class="book-meta">


                        <span>

                            👁
                            ${book.views || 0}

                        </span>


                        <span>

                            ❤️
                            ${book.likes || 0}

                        </span>


                        <span>

                            ⬇
                            ${book.downloads || 0}

                        </span>


                    </div>


                    <div class="book-buttons">


                        <a
                            href="reader.html?book=${encodeURIComponent(pdf)}"
                            class="btn read-book-btn"
                        >

                            📖 Read Online

                        </a>


                        <a
                            href="${pdf}"
                            download
                            class="btn download-book-btn"
                        >

                            ⬇ Download

                        </a>


                    </div>


                </div>

            </div>

        `;

    });

}


/*=========================================
LIVE SEARCH
=========================================*/

function searchBooks() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const value =
        input.value
            .toLowerCase()
            .trim();


    filteredBooks =
        allBooks.filter(book => {


            return (

                (book.title || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.author || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.category || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.language || "")
                    .toLowerCase()
                    .includes(value)

            );

        });


    displayBooks(
        filteredBooks
    );

}


/*=========================
SEARCH INPUT
=========================*/

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchBooks
    );

}


/*=========================================
CATEGORY FILTER
=========================================*/

function filterBooks(
    category,
    button = null
) {


    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    if (button) {

        button.classList.add(
            "active"
        );

    }


    if (category === "All") {

        filteredBooks =
            [...allBooks];

    } else {

        filteredBooks =
            allBooks.filter(book =>

                book.category ===
                category

            );

    }


    displayBooks(
        filteredBooks
    );

}


/*=========================================
LATEST BOOK
=========================================*/

function latestBook() {

    const latest =
        allBooks.find(
            book =>
                book.latest === true
        );


    if (!latest) return;


    const image =
        document.querySelector(
            ".book-image img"
        );


    const title =
        document.querySelector(
            ".book-info h2"
        );


    const author =
        document.querySelector(
            ".book-info h3"
        );


    const desc =
        document.querySelector(
            ".book-info p"
        );


    const buttons =
        document.querySelectorAll(
            ".book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover ||
            "logo.png";

    }


    if (title) {

        title.innerText =
            latest.title || "";

    }


    if (author) {

        author.innerText =
            latest.author || "";

    }


    if (desc) {

        desc.innerText =
            latest.description || "";

    }


    if (buttons.length >= 2) {

        buttons[0].href =
            latest.pdf || "#";


        buttons[0].target =
            "_blank";


        buttons[1].href =
            latest.pdf || "#";

    }

}


console.log(
    "✅ Script Part 2 Loaded"
);


/*=========================================
PART 3
AI CHATBOT
=========================================*/


let knowledge = [];


/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "knowledge.json"
            );


        if (!response.ok) {

            throw new Error(
                "knowledge.json not found"
            );

        }


        knowledge =
            await response.json();


        if (!Array.isArray(knowledge)) {

            knowledge = [];

        }


        console.log(
            "✅ Knowledge Loaded"
        );


    } catch (error) {

        console.error(
            "❌ Knowledge loading error:",
            error
        );

    }

}


loadKnowledge();


/*=========================
CHAT ELEMENTS
=========================*/

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


const chatInput =
    document.getElementById(
        "chatInput"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


/*=========================
OPEN CHAT
=========================*/

if (
    chatBtn &&
    chatWindow
) {

    chatBtn.onclick = () => {

        chatWindow.style.display =
            "flex";

    };

}


/*=========================
CLOSE CHAT
=========================*/

if (
    closeChat &&
    chatWindow
) {

    closeChat.onclick = () => {

        chatWindow.style.display =
            "none";

    };

}


/*=========================
ENTER KEY
=========================*/

if (chatInput) {

    chatInput.addEventListener(
        "keypress",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                sendMessage();

            }

        }
    );

}


/*=========================================
SEARCH BOOK
=========================================*/

function searchBook(question) {

    const q =
        question
            .toLowerCase()
            .trim();


    if (!q) return null;


    for (
        const book of allBooks
    ) {


        if (

            (book.title || "")
                .toLowerCase()
                .includes(q)

            ||

            (book.category || "")
                .toLowerCase()
                .includes(q)

            ||

            (book.author || "")
                .toLowerCase()
                .includes(q)

        ) {


            return `

                📚 <b>
                    ${book.title}
                </b>

                <br><br>

                👤
                ${book.author || "Unknown"}

                <br>

                📂
                ${book.category || "General"}

                <br><br>


                <a
                    href="reader.html?book=${encodeURIComponent(book.pdf || "")}"
                    class="btn"
                >

                    📖 Read Online

                </a>


                &nbsp;


                <a
                    href="${book.pdf || "#"}"
                    download
                    class="btn"
                >

                    ⬇ Download

                </a>

            `;

        }

    }


    return null;

}


/*=========================================
SEARCH KNOWLEDGE
=========================================*/

function searchKnowledge(question) {

    const q =
        question
            .toLowerCase()
            .trim();


    for (
        const item of knowledge
    ) {


        if (

            (item.question || "")
                .toLowerCase()
                .includes(q)

        ) {

            return (
                item.answer ||
                null
            );

        }

    }


    return null;

}


/*=========================================
BOT MESSAGE
=========================================*/

function botReply(text) {

    if (!chatMessages) return;


    chatMessages.innerHTML += `

        <div class="bot-message">

            ${text}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================
USER MESSAGE
=========================================*/

function userReply(text) {

    if (!chatMessages) return;


    chatMessages.innerHTML += `

        <div class="user-message">

            ${text}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================
SEND MESSAGE
=========================================*/

function sendMessage() {

    if (!chatInput) return;


    const question =
        chatInput.value.trim();


    if (question === "") return;


    userReply(
        question
    );


    chatInput.value =
        "";


    setTimeout(() => {


        let reply =
            searchBook(
                question
            );


        if (!reply) {

            reply =
                searchKnowledge(
                    question
                );

        }


        if (!reply) {

            reply = `

                🤖 Sorry!

                <br><br>

                Mujhe iska jawab
                abhi database mein
                nahi mila.

            `;

        }


        botReply(
            reply
        );


    }, 500);

}


console.log(
    "✅ Script Part 3 Loaded"
);


/*=========================================
PART 4
FINAL PREMIUM
=========================================*/


/*=========================
SCROLL ANIMATION
=========================*/

const sections =
    document.querySelectorAll(
        "section"
    );


if (
    "IntersectionObserver"
    in window
) {


    const observer =
        new IntersectionObserver(
            entries => {


                entries.forEach(
                    entry => {


                        if (
                            entry.isIntersecting
                        ) {


                            entry.target
                                .classList
                                .add(
                                    "show-section"
                                );

                        }

                    }
                );

            },
            {

                threshold: 0.15

            }
        );


    sections.forEach(
        section => {

            observer.observe(
                section
            );

        }
    );

}


/*=========================================
BOOK CARD HOVER
=========================================*/

document.addEventListener(
    "mouseover",
    event => {


        const card =
            event.target.closest(
                ".book-card"
            );


        if (card) {

            card.style.transform =
                "translateY(-10px)";

            card.style.transition =
                ".35s";

        }

    }
);


document.addEventListener(
    "mouseout",
    event => {


        const card =
            event.target.closest(
                ".book-card"
            );


        if (card) {

            card.style.transform =
                "translateY(0px)";

        }

    }
);


/*=========================================
DOWNLOAD COUNTER
LOCAL DEVICE
=========================================*/

document.addEventListener(
    "click",
    event => {


        const btn =
            event.target.closest(
                "a"
            );


        if (!btn) return;


        if (
            btn.hasAttribute(
                "download"
            )
        ) {


            let total =
                Number(
                    localStorage.getItem(
                        "downloads"
                    )
                ) || 0;


            total++;


            localStorage.setItem(
                "downloads",
                total
            );

        }

    }
);


/*=========================================
READ COUNTER
LOCAL DEVICE
=========================================*/

document.addEventListener(
    "click",
    event => {


        const btn =
            event.target.closest(
                "a"
            );


        if (!btn) return;


        if (

            btn.href.includes(
                ".pdf"
            )

            &&

            !btn.hasAttribute(
                "download"
            )

        ) {


            let total =
                Number(
                    localStorage.getItem(
                        "reads"
                    )
                ) || 0;


            total++;


            localStorage.setItem(
                "reads",
                total
            );

        }

    }
);


/*=========================================
BUTTON RIPPLE
=========================================*/

document.addEventListener(
    "click",
    event => {


        const btn =
            event.target.closest(
                ".btn"
            );


        if (!btn) return;


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "ripple";


        const rect =
            btn.getBoundingClientRect();


        ripple.style.left =
            (
                event.clientX -
                rect.left
            ) + "px";


        ripple.style.top =
            (
                event.clientY -
                rect.top
            ) + "px";


        btn.appendChild(
            ripple
        );


        setTimeout(() => {

            if (ripple) {

                ripple.remove();

            }

        }, 600);

    }
);


/*=========================================
NAVBAR SHADOW
=========================================*/

window.addEventListener(
    "scroll",
    () => {


        const nav =
            document.querySelector(
                ".navbar"
            );


        if (!nav) return;


        if (
            window.scrollY > 40
        ) {

            nav.classList.add(
                "nav-shadow"
            );

        } else {

            nav.classList.remove(
                "nav-shadow"
            );

        }

    }
);


/*=========================================
AUTO YEAR
=========================================*/

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date()
            .getFullYear();

}


/*=========================================
IMAGE FALLBACK
=========================================*/

document
    .querySelectorAll("img")
    .forEach(img => {


        img.addEventListener(
            "error",
            function () {


                if (
                    this.dataset
                        .fallbackApplied
                ) {

                    return;

                }


                this.dataset
                    .fallbackApplied =
                    "true";


                this.src =
                    "logo.png";

            }
        );

    });


/*=========================================
PRELOAD BOOK COVERS
=========================================*/

window.addEventListener(
    "load",
    () => {


        if (
            !Array.isArray(
                allBooks
            )
        ) {

            return;

        }


        allBooks.forEach(
            book => {


                if (!book.cover) {

                    return;

                }


                const image =
                    new Image();


                image.src =
                    book.cover;

            }
        );

    }
);


/*=========================================
SMOOTH ANCHOR LINKS
=========================================*/

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {


        anchor.addEventListener(
            "click",
            function (event) {


                event.preventDefault();


                const selector =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !selector ||
                    selector === "#"
                ) {

                    return;

                }


                const target =
                    document.querySelector(
                        selector
                    );


                if (target) {

                    target.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                }

            }
        );

    });


/*=========================================
FIREBASE CONNECTION STATUS
=========================================*/

if (

    typeof window.db !==
    "undefined"

    &&

    typeof window.auth !==
    "undefined"

    &&

    typeof window.storage !==
    "undefined"

) {

    console.log(
        "🔥 Firebase connected to script.js"
    );

} else {

    console.warn(
        "⚠️ Firebase services not available."
    );

}


/*=========================================
FINAL CONSOLE
=========================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 1.0"
);

console.log(
    "Developer : Ali Hassan"
);

console.log(
    "===================================="
);

console.log(
    "✅ Loader"
);

console.log(
    "✅ Navbar"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Books"
);

console.log(
    "✅ AI"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🔥 Firebase connected"
);

console.log(
    "🚀 Production Ready"
);

console.log(
    "===================================="
);
```
