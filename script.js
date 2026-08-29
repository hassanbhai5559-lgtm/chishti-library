"use strict";

/* =========================================================
   CHISHTI LIBRARY
   FULL SCRIPT.JS
   FIXED + FIREBASE SUPPORT
   ========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let allBooks = [];
let filteredBooks = [];

let firebaseVisitorStarted = false;


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
   ANIMATE COUNTER
========================================================= */

function animateCounter(element, target, duration = 800) {

    if (!element) return;

    target = Number(target) || 0;

    const startTime = performance.now();

    function update(time) {

        const progress =
            Math.min(
                (time - startTime) / duration,
                1
            );

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );

        const value =
            Math.floor(
                target * eased
            );

        element.textContent =
            value.toLocaleString();

        if (progress < 1) {

            requestAnimationFrame(update);

        } else {

            element.textContent =
                target.toLocaleString();

        }

    }

    requestAnimationFrame(update);

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

            if (loader) {
                loader.remove();
            }

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


/*=========================================
  CHISHTI LIBRARY
  VISITOR COUNTER
=========================================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) return;

    try {

        /* =========================
           FIREBASE VISITOR DOCUMENT
        ========================= */

        const visitorRef =
            db.collection("counter").doc("visitors");


        /* =========================
           GET CURRENT COUNT
        ========================= */

        const snapshot =
            await visitorRef.get();


        /* =========================
           CREATE IF NOT EXISTS
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
           COUNT NEW VISITOR
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
           ANIMATED COUNTER
        ========================= */

        let current = 0;

        const animation =
            setInterval(() => {

                current++;

                visitorCounter.innerText =
                    current.toLocaleString();

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
   UPDATE VISITOR COUNTER
========================= */

updateVisitorCounter();

/* =========================================================
   LOAD BOOKS.JSON
========================================================= */

async function loadBooks() {

    try {

        const response =
            await fetch(
                "books.json",
                {
                    cache: "no-cache"
                }
            );


        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "books.json must contain an array"
            );

        }


        allBooks = data;

        filteredBooks =
            [...allBooks];


        /*
        -----------------------------------------------------
        BOOK COUNTER
        -----------------------------------------------------
        */

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


        /*
        -----------------------------------------------------
        DISPLAY BOOKS
        -----------------------------------------------------
        */

        displayBooks(
            filteredBooks
        );


        /*
        -----------------------------------------------------
        LATEST BOOK
        -----------------------------------------------------
        */

        latestBook();


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
   GET BOOK ID
========================================================= */

function getBookId(book) {

    return String(
        book?.id ||
        book?.bookId ||
        book?.title ||
        ""
    );

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


    books.forEach((book, index) => {

        const views =
            Number(book.views) || 0;

        const likes =
            Number(book.likes) || 0;

        const downloads =
            Number(book.downloads) || 0;

        const comments =
            Number(book.comments) || 0;

        const bookId =
            getBookId(book);


        container.innerHTML += `

            <div
                class="book-card"
                data-book-id="${escapeHTML(bookId)}"
                data-book-index="${index}"
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
                            book.title ||
                            "Untitled Book"
                        )}

                    </h2>


                    <h3>

                        ${escapeHTML(
                            book.author ||
                            "Unknown Author"
                        )}

                    </h3>


                    <p>

                        ${escapeHTML(
                            book.description || ""
                        )}

                    </p>


                    <!-- BOOK STATS -->

                    <div class="book-meta">

                        <span title="Views">

                            <i class="fas fa-eye"></i>

                            <span class="view-count">

                                ${views}

                            </span>

                        </span>


                        <span
                            title="Likes"
                            class="like-book-btn"
                            data-book-id="${escapeHTML(bookId)}"
                            role="button"
                            tabindex="0"
                        >

                            <i class="fas fa-heart"></i>

                            <span class="like-count">

                                ${likes}

                            </span>

                        </span>


                        <span title="Comments">

                            <i class="fas fa-comment"></i>

                            <span class="comment-count">

                                ${comments}

                            </span>

                        </span>


                        <span title="Downloads">

                            <i class="fas fa-download"></i>

                            <span class="download-count">

                                ${downloads}

                            </span>

                        </span>

                    </div>


                    <!-- BUTTONS -->

                    <div class="book-buttons">

                        <a
                            href="reader.html?book=${encodeURIComponent(
                                book.pdf || ""
                            )}"
                            class="btn read-book-btn"
                            data-book-id="${escapeHTML(bookId)}"
                        >

                            <i class="fas fa-book-open"></i>

                            Read Online

                        </a>


                        <a
                            href="${escapeHTML(
                                book.pdf || "#"
                            )}"
                            class="btn download-book-btn"
                            data-book-id="${escapeHTML(bookId)}"
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
   SEARCH
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
   SEARCH INPUT EVENT
========================================================= */

document.addEventListener(
    "input",
    event => {

        if (
            event.target &&
            event.target.id ===
            "searchInput"
        ) {

            searchBooks();

        }

    }
);


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
        !category ||
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
            "reader.html?book=" +
            encodeURIComponent(
                latest.pdf || ""
            );


        buttons[1].href =
            latest.pdf || "#";


        buttons[1].setAttribute(
            "download",
            ""
        );

    }

}


/* =========================================================
   FIREBASE BOOK REFERENCE
========================================================= */

function getBookFirebaseRef(bookId) {

    if (!firebaseIsReady()) {
        return null;
    }

    if (!bookId) {
        return null;
    }

    return window.db
        .collection("books")
        .doc(String(bookId));

}


/* =========================================================
   GENERIC BOOK COUNTER
========================================================= */

async function increaseBookCounter(
    bookId,
    field
) {

    if (!firebaseIsReady()) {

        console.warn(
            "⚠️ Firebase unavailable:",
            field
        );

        return false;

    }


    if (!bookId) {

        console.warn(
            "⚠️ Book ID missing:",
            field
        );

        return false;

    }


    try {

        const ref =
            getBookFirebaseRef(
                bookId
            );


        await ref.set({

            [field]:
                window.firebaseIncrement
                    ? window.firebaseIncrement(1)
                    : firebase.firestore.FieldValue.increment(1)

        }, {

            merge: true

        });


        console.log(
            `✅ ${field} counted:`,
            bookId
        );


        return true;

    }

    catch (error) {

        console.error(
            `❌ ${field} error:`,
            error
        );

        return false;

    }

}


/* =========================================================
   BOOK VIEW
========================================================= */

async function increaseBookView(book) {

    if (!book) return false;

    return increaseBookCounter(
        getBookId(book),
        "views"
    );

}


/* =========================================================
   BOOK DOWNLOAD
========================================================= */

async function increaseBookDownload(book) {

    if (!book) return false;

    return increaseBookCounter(
        getBookId(book),
        "downloads"
    );

}


/* =========================================================
   BOOK LIKE
========================================================= */

async function likeBook(book) {

    if (!book) return false;

    return increaseBookCounter(
        getBookId(book),
        "likes"
    );

}


/* =========================================================
   BOOK COMMENT COUNTER
========================================================= */

async function increaseBookComment(book) {

    if (!book) return false;

    return increaseBookCounter(
        getBookId(book),
        "comments"
    );

}


/* =========================================================
   FIND BOOK FROM CARD
========================================================= */

function getBookFromCard(card) {

    if (!card) return null;


    const bookId =
        card.dataset.bookId;


    if (bookId) {

        const found =
            allBooks.find(
                book =>
                    getBookId(book) ===
                    String(bookId)
            );


        if (found) {

            return found;

        }

    }


    const index =
        Number(
            card.dataset.bookIndex
        );


    if (
        Number.isInteger(index) &&
        filteredBooks[index]
    ) {

        return filteredBooks[index];

    }


    return null;

}


/* =========================================================
   BOOK BUTTON EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
        -----------------------------------------------------
        LIKE
        -----------------------------------------------------
        */

        const likeBtn =
            event.target.closest(
                ".like-book-btn"
            );


        if (likeBtn) {

            event.preventDefault();


            const card =
                likeBtn.closest(
                    ".book-card"
                );


            const book =
                getBookFromCard(card);


            if (!book) return;


            likeBook(book);


            const count =
                likeBtn.querySelector(
                    ".like-count"
                );


            if (count) {

                const old =
                    Number(
                        count.textContent
                    ) || 0;


                count.textContent =
                    old + 1;

            }

        }


        /*
        -----------------------------------------------------
        DOWNLOAD
        -----------------------------------------------------
        */

        const downloadBtn =
            event.target.closest(
                ".download-book-btn"
            );


        if (downloadBtn) {

            const card =
                downloadBtn.closest(
                    ".book-card"
                );


            const book =
                getBookFromCard(card);


            if (book) {

                increaseBookDownload(
                    book
                );

            }

        }


        /*
        -----------------------------------------------------
        READ ONLINE
        -----------------------------------------------------
        */

        const readBtn =
            event.target.closest(
                ".read-book-btn"
            );


        if (readBtn) {

            const card =
                readBtn.closest(
                    ".book-card"
                );


            const book =
                getBookFromCard(card);


            if (book) {

                increaseBookView(
                    book
                );

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
   SECTION ANIMATION
========================================================= */

function initializeSectionAnimation() {

    const sections =
        document.querySelectorAll(
            "section"
        );


    if (!sections.length) return;


    sections.forEach(section => {

        section.style.opacity = "1";

    });


    if (
        !("IntersectionObserver" in window)
    ) {

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target
                            .classList
                            .add(
                                "show-section"
                            );

                    }

                });

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
            !Array.isArray(allBooks)
        ) {

            return;

        }


        allBooks.forEach(book => {

            if (!book.cover) {
                return;
            }


            const image =
                new Image();


            image.src =
                book.cover;

        });

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


        let target = null;


        try {

            target =
                document.querySelector(
                    href
                );

        }

        catch (error) {

            return;

        }


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
   GLOBAL FUNCTIONS
========================================================= */

window.displayBooks =
    displayBooks;

window.searchBooks =
    searchBooks;

window.filterBooks =
    filterBooks;

window.latestBook =
    latestBook;

window.increaseBookView =
    increaseBookView;

window.increaseBookDownload =
    increaseBookDownload;

window.likeBook =
    likeBook;

window.increaseBookComment =
    increaseBookComment;

window.startVisitorCounter =
    startVisitorCounter;


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
    "Version : 2.1"
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
    "✅ Firebase Views"
);

console.log(
    "✅ Firebase Likes"
);

console.log(
    "✅ Firebase Comments"
);

console.log(
    "✅ Firebase Downloads"
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

console.log(
    "===================================="
);
