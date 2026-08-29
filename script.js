"use strict";

/* =========================================================
   CHISHTI LIBRARY
   FULL SCRIPT.JS
   PREMIUM VERSION
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let allBooks = [];
let filteredBooks = [];


/* =========================================================
   FIREBASE READY CHECK
========================================================= */

function firebaseIsReady() {

    return (
        window.firebaseReady === true &&
        window.db
    );

}


/* =========================================================
   PREMIUM LOADER
========================================================= */

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        setTimeout(() => {

            loader.remove();

        }, 800);

    }, 1200);

});


/* =========================================================
   MOBILE MENU
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn =
        document.querySelector(".mobile-menu");

    const menu =
        document.querySelector(".menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });


    /* Close menu after clicking link */

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("show");

        });

    });

});


/* =========================================================
   SCROLL TO TOP
========================================================= */

const scrollBtn =
    document.getElementById("scrollTop");


window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    if (window.scrollY > 300) {

        scrollBtn.style.display = "flex";

    } else {

        scrollBtn.style.display = "none";

    }

});


if (scrollBtn) {

    scrollBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}


/* =========================================================
   VISITOR COUNTER
========================================================= */

async function updateVisitorCounter() {

    const counter =
        document.getElementById(
            "visitorCounter"
        );

    if (!counter) return;


    /* Firebase not ready */

    if (!firebaseIsReady()) {

        console.log(
            "⏳ Waiting for Firebase..."
        );

        window.addEventListener(
            "firebaseReady",
            updateVisitorCounter,
            { once: true }
        );

        return;

    }


    try {

        const visitorRef =
            window.db
                .collection("counter")
                .doc("visitors");


        const snapshot =
            await visitorRef.get();


        /* =========================================
           CREATE COUNTER
        ========================================= */

        if (!snapshot.exists) {

            await visitorRef.set({

                count: 1,

                updatedAt:
                    window.firebaseServerTimestamp
                        ? window.firebaseServerTimestamp()
                        : new Date()

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            counter.innerText = "1";

            console.log(
                "🌐 First visitor counted"
            );

            return;

        }


        /* =========================================
           CHECK SESSION
        ========================================= */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* =========================================
           NEW VISITOR
        ========================================= */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    window.firebaseIncrement
                        ? window.firebaseIncrement(1)
                        : firebase.firestore.FieldValue.increment(1),

                updatedAt:
                    window.firebaseServerTimestamp
                        ? window.firebaseServerTimestamp()
                        : new Date()

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            console.log(
                "🌐 New visitor counted"
            );

        }


        /* =========================================
           GET CURRENT COUNT
        ========================================= */

        const latest =
            await visitorRef.get();


        const data =
            latest.data() || {};


        const visitors =
            Number(data.count) || 0;


        /* =========================================
           ANIMATE NUMBER
        ========================================= */

        animateCounter(
            counter,
            visitors
        );


    }

    catch (error) {

        console.error(
            "🔥 Visitor Counter Error:",
            error
        );

        counter.innerText = "0";

    }

}


/* =========================================================
   COUNTER ANIMATION
========================================================= */

function animateCounter(
    element,
    target
) {

    if (!element) return;

    target =
        Number(target) || 0;


    let current = 0;


    if (target === 0) {

        element.innerText = "0";

        return;

    }


    const duration = 1000;

    const steps = 40;

    const increment =
        target / steps;


    const interval =
        duration / steps;


    const timer =
        setInterval(() => {

            current += increment;


            if (current >= target) {

                current = target;

                clearInterval(timer);

            }


            element.innerText =
                Math.floor(current)
                    .toLocaleString();

        }, interval);

}


/* =========================================================
   START VISITOR COUNTER
========================================================= */

updateVisitorCounter();


/* =========================================================
   LOAD BOOKS.JSON
========================================================= */

async function loadBooks() {

    try {

        const response =
            await fetch("books.json", {
                cache: "no-cache"
            });


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


        /* =========================================
           BOOK COUNTER
        ========================================= */

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


        /* =========================================
           DISPLAY BOOKS
        ========================================= */

        if (
            typeof displayBooks ===
            "function"
        ) {

            displayBooks(
                filteredBooks
            );

        }


        /* =========================================
           LATEST BOOK
        ========================================= */

        if (
            typeof latestBook ===
            "function"
        ) {

            latestBook();

        }


        console.log(
            "✅ Books Loaded:",
            allBooks.length
        );

    }

    catch (error) {

        console.error(
            "❌ Books Loading Error:",
            error
        );

        const container =
            document.getElementById(
                "booksContainer"
            );


        if (container) {

            container.innerHTML = `

                <div class="no-books">

                    <h2>
                        Unable to Load Books
                    </h2>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   START BOOKS
========================================================= */

loadBooks();


/* =========================================================
   UTILITY
========================================================= */

function byId(id) {

    return document.getElementById(id);

}


/* =========================================================
   DISPLAY BOOKS
========================================================= */

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

                <h2>
                    No Books Found
                </h2>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(book => {

        const views =
            Number(book.views) || 0;

        const likes =
            Number(book.likes) || 0;

        const downloads =
            Number(book.downloads) || 0;

        const comments =
            Number(book.comments) || 0;


        container.innerHTML += `

            <div
                class="book-card"
                data-book-id="${escapeHTML(
                    book.id || book.title || ""
                )}"
            >

                <img
                    src="${escapeHTML(
                        book.cover || "logo.png"
                    )}"
                    alt="${escapeHTML(
                        book.title || "Book"
                    )}"
                    loading="lazy"
                >


                <div class="book-content">


                    <span class="book-category">

                        ${escapeHTML(
                            book.category || "Other"
                        )}

                    </span>


                    <h2>

                        ${escapeHTML(
                            book.title || "Untitled Book"
                        )}

                    </h2>


                    <h3>

                        ${escapeHTML(
                            book.author || "Unknown Author"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            book.description || ""
                        )}

                    </p>


                    <!-- BOOK META -->

                    <div class="book-meta">


                        <span
                            title="Views"
                        >

                            <i class="fas fa-eye"></i>

                            ${views}

                        </span>


                        <span
                            title="Likes"
                        >

                            <i class="fas fa-heart"></i>

                            ${likes}

                        </span>


                        <span
                            title="Comments"
                        >

                            <i class="fas fa-comment"></i>

                            ${comments}

                        </span>


                        <span
                            title="Downloads"
                        >

                            <i class="fas fa-download"></i>

                            ${downloads}

                        </span>


                    </div>


                    <!-- BUTTONS -->

                    <div class="book-buttons">


                        <a
                            href="reader.html?book=${encodeURIComponent(
                                book.pdf || ""
                            )}"
                            class="btn read-book-btn"
                        >

                            <i class="fas fa-book-open"></i>

                            Read Online

                        </a>


                        <a
                            href="${escapeHTML(
                                book.pdf || "#"
                            )}"
                            class="btn download-book-btn"
                            download
                        >

                            <i class="fas fa-download"></i>

                            Download

                        </a>


                    </div>


                </div>

            </div>

        `;

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   LIVE SEARCH
========================================================= */

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

                String(
                    book.title || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    book.author || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    book.category || ""
                )
                    .toLowerCase()
                    .includes(value)

                ||

                String(
                    book.language || ""
                )
                    .toLowerCase()
                    .includes(value)

            );

        });


    displayBooks(
        filteredBooks
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function filterBooks(
    category,
    button = null
) {


    document
        .querySelectorAll(
            ".category"
        )
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


    if (
        category === "All"
    ) {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(book =>

                String(
                    book.category || ""
                )
                    .toLowerCase() ===
                String(category)
                    .toLowerCase()

            );

    }


    displayBooks(
        filteredBooks
    );

}


/* =========================================================
   LATEST BOOK
========================================================= */

function latestBook() {

    const latest =
        allBooks.find(
            book =>
                book.latest === true
        );


    if (!latest) {

        console.log(
            "ℹ️ No latest book found"
        );

        return;

    }


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
            ".book-info .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover ||
            "logo.png";

        image.alt =
            latest.title ||
            "Latest Book";

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


    if (
        buttons.length >= 2
    ) {

        buttons[0].href =
            latest.pdf || "#";

        buttons[1].href =
            latest.pdf || "#";


        buttons[1].setAttribute(
            "download",
            ""
        );

    }

}


/* =========================================================
   BOOK VIEW COUNTER
========================================================= */

async function increaseBookView(book) {

    if (!book) return;


    /* Firebase unavailable */

    if (!firebaseIsReady()) {

        console.log(
            "⚠️ Firebase unavailable for view counter"
        );

        return;

    }


    try {

        let bookId =
            book.id ||
            book.title;


        if (!bookId) return;


        bookId =
            String(bookId);


        const ref =
            window.db
                .collection("books")
                .doc(bookId);


        await ref.set({

            views:
                window.firebaseIncrement
                    ? window.firebaseIncrement(1)
                    : firebase.firestore.FieldValue.increment(1)

        }, {
            merge: true
        });


        console.log(
            "👁 View counted:",
            book.title
        );

    }

    catch (error) {

        console.error(
            "🔥 View counter error:",
            error
        );

    }

}


/* =========================================================
   DOWNLOAD COUNTER
========================================================= */

async function increaseBookDownload(book) {

    if (!book) return;


    if (!firebaseIsReady()) {

        return;

    }


    try {

        const bookId =
            String(
                book.id ||
                book.title ||
                ""
            );


        if (!bookId) return;


        const ref =
            window.db
                .collection("books")
                .doc(bookId);


        await ref.set({

            downloads:
                window.firebaseIncrement
                    ? window.firebaseIncrement(1)
                    : firebase.firestore.FieldValue.increment(1)

        }, {
            merge: true
        });


        console.log(
            "⬇ Download counted:",
            book.title
        );

    }

    catch (error) {

        console.error(
            "🔥 Download counter error:",
            error
        );

    }

}


/* =========================================================
   LIKE BOOK
========================================================= */

async function likeBook(book) {

    if (!book) return;


    if (!firebaseIsReady()) {

        return;

    }


    try {

        const bookId =
            String(
                book.id ||
                book.title ||
                ""
            );


        if (!bookId) return;


        const ref =
            window.db
                .collection("books")
                .doc(bookId);


        await ref.set({

            likes:
                window.firebaseIncrement
                    ? window.firebaseIncrement(1)
                    : firebase.firestore.FieldValue.increment(1)

        }, {
            merge: true
        });


        console.log(
            "❤️ Like counted:",
            book.title
        );

    }

    catch (error) {

        console.error(
            "🔥 Like error:",
            error
        );

    }

}


/* =========================================================
   BOOK BUTTON EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {


        const downloadBtn =
            event.target.closest(
                ".download-book-btn"
            );


        if (downloadBtn) {

            const card =
                downloadBtn.closest(
                    ".book-card"
                );


            if (card) {

                const index =
                    [...document.querySelectorAll(
                        ".book-card"
                    )]
                    .indexOf(card);


                const book =
                    filteredBooks[index];


                if (book) {

                    increaseBookDownload(
                        book
                    );

                }

            }

        }


        const readBtn =
            event.target.closest(
                ".read-book-btn"
            );


        if (readBtn) {

            const card =
                readBtn.closest(
                    ".book-card"
                );


            if (card) {

                const index =
                    [...document.querySelectorAll(
                        ".book-card"
                    )]
                    .indexOf(card);


                const book =
                    filteredBooks[index];


                if (book) {

                    increaseBookView(
                        book
                    );

                }

            }

        }

    }
);


/* =========================================================
   GLOBAL DOWNLOAD COUNTER
========================================================= */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                "a[download]"
            );


        if (!link) return;


        let total =
            Number(
                localStorage.getItem(
                    "chishtiDownloads"
                )
            ) || 0;


        total++;


        localStorage.setItem(
            "chishtiDownloads",
            total
        );


        console.log(
            "⬇ Total local downloads:",
            total
        );

    }
);


/* =========================================================
   BUTTON RIPPLE
========================================================= */

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
            (event.clientX -
                rect.left) +
            "px";


        ripple.style.top =
            (event.clientY -
                rect.top) +
            "px";


        btn.appendChild(
            ripple
        );


        setTimeout(() => {

            ripple.remove();

        }, 600);

    }
);


/* =========================================================
   NAVBAR SHADOW
========================================================= */

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

        }

        else {

            nav.classList.remove(
                "nav-shadow"
            );

        }

    }
);


/* =========================================================
   SECTION SCROLL ANIMATION
========================================================= */

function initializeSectionAnimation() {

    const sections =
        document.querySelectorAll(
            "section"
        );


    if (!sections.length) return;


    /* Prevent animation from hiding content */

    sections.forEach(section => {

        section.style.opacity = "1";

    });


    if (
        !("IntersectionObserver"
            in window)
    ) {

        return;

    }


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
                threshold: 0.05
            }
        );


    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );

}


initializeSectionAnimation();


/* =========================================================
   AUTO YEAR
========================================================= */

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date()
            .getFullYear();

}


/* =========================================================
   IMAGE FALLBACK
========================================================= */

document.addEventListener(
    "error",
    event => {

        const img =
            event.target;


        if (
            img &&
            img.tagName === "IMG" &&
            !img.dataset.fallback
        ) {

            img.dataset.fallback =
                "true";


            img.src =
                "logo.png";

        }

    },
    true
);


/* =========================================================
   PRELOAD BOOK COVERS
========================================================= */

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

                if (
                    !book.cover
                ) {

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


/* =========================================================
   SMOOTH ANCHOR LINKS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const anchor =
            event.target.closest(
                'a[href^="#"]'
            );


        if (!anchor) return;


        const href =
            anchor.getAttribute(
                "href"
            );


        if (
            !href ||
            href === "#"
        ) {

            return;

        }


        const target =
            document.querySelector(
                href
            );


        if (!target) return;


        event.preventDefault();


        target.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }
);


/* =========================================================
   WHATSAPP BUTTON
========================================================= */

function createWhatsAppButton() {

    /* Don't create duplicate */

    if (
        document.getElementById(
            "whatsappBtn"
        )
    ) {

        return;

    }


    const button =
        document.createElement(
            "a"
        );


    button.id =
        "whatsappBtn";


    button.href =
        "https://wa.me/923067813783";


    button.target =
        "_blank";


    button.rel =
        "noopener noreferrer";


    button.setAttribute(
        "aria-label",
        "Contact Chishti Library on WhatsApp"
    );


    button.innerHTML = `

        <i class="fab fa-whatsapp"></i>

    `;


    document.body.appendChild(
        button
    );


    /* Inline styling */

    button.style.position =
        "fixed";


    button.style.right =
        "25px";


    button.style.bottom =
        "25px";


    button.style.width =
        "65px";


    button.style.height =
        "65px";


    button.style.borderRadius =
        "50%";


    button.style.display =
        "flex";


    button.style.alignItems =
        "center";


    button.style.justifyContent =
        "center";


    button.style.background =
        "#25D366";


    button.style.color =
        "#fff";


    button.style.fontSize =
        "32px";


    button.style.textDecoration =
        "none";


    button.style.zIndex =
        "99999";


    button.style.boxShadow =
        "0 8px 30px rgba(0,0,0,.4)";


    button.style.transition =
        ".3s ease";


    button.addEventListener(
        "mouseenter",
        () => {

            button.style.transform =
                "scale(1.1)";

        }
    );


    button.addEventListener(
        "mouseleave",
        () => {

            button.style.transform =
                "scale(1)";

        }
    );

}


document.addEventListener(
    "DOMContentLoaded",
    createWhatsAppButton
);


/* =========================================================
   CONSOLE
========================================================= */

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 2.0"
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
    "✅ Mobile Menu"
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
    "✅ Latest Book"
);

console.log(
    "✅ Firebase Visitors"
);

console.log(
    "✅ Views"
);

console.log(
    "✅ Likes Support"
);

console.log(
    "✅ Comments Support"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ WhatsApp"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🚀 Production Ready"
);
