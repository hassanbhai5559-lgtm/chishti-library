/*=========================================================
 CHISHTI LIBRARY
 SCRIPT.JS
 FULL REPLACEMENT
=========================================================*/

"use strict";

/*=========================================================
 GLOBAL VARIABLES
=========================================================*/

let allBooks = [];
let filteredBooks = [];
let knowledge = [];


/*=========================================================
 HELPER
=========================================================*/

function byId(id) {
    return document.getElementById(id);
}

function safeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/*=========================================================
 PREMIUM LOADER
=========================================================*/

window.addEventListener("load", () => {

    const loader = byId("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        setTimeout(() => {

            if (loader) {
                loader.remove();
            }

        }, 800);

    }, 1800);

});


/*=========================================================
 MOBILE MENU
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.querySelector(".mobile-menu");
    const menu = document.querySelector(".menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");
        menu.classList.toggle("active");

    });

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("show");
            menu.classList.remove("active");

        });

    });

});


/*=========================================================
 SCROLL TO TOP
=========================================================*/

const scrollBtn = byId("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    if (window.scrollY > 300) {

        scrollBtn.classList.add("show");
        scrollBtn.style.display = "flex";

    } else {

        scrollBtn.classList.remove("show");
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


/*=========================================================
 NAVBAR SHADOW
=========================================================*/

window.addEventListener("scroll", () => {

    const nav = document.querySelector(".navbar");

    if (!nav) return;

    if (window.scrollY > 40) {
        nav.classList.add("nav-shadow");
    } else {
        nav.classList.remove("nav-shadow");
    }

});


/*=========================================================
 FIREBASE HELPERS
=========================================================*/

function firebaseReady() {

    return (
        typeof firebase !== "undefined" &&
        typeof db !== "undefined"
    );

}


/*=========================================================
 VISITOR COUNTER
=========================================================*/

async function updateVisitorCounter() {

    const counter = byId("visitorCounter");

    if (!counter) return;

    if (!firebaseReady()) {

        counter.innerText = "0";
        return;

    }

    try {

        const ref =
            db.collection("counter").doc("visitors");

        const snapshot = await ref.get();

        if (!snapshot.exists) {

            await ref.set({
                count: 1
            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            counter.innerText = "1";

            return;
        }

        const already =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );

        if (!already) {

            await ref.update({

                count:
                    firebase.firestore.FieldValue.increment(1)

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }

        const latest =
            await ref.get();

        const total =
            safeNumber(latest.data()?.count);

        animateNumber(counter, total, 20);

    }

    catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        counter.innerText = "0";

    }

}

updateVisitorCounter();


/*=========================================================
 NUMBER ANIMATION
=========================================================*/

function animateNumber(element, target, speed = 20) {

    if (!element) return;

    target = Math.max(0, Math.floor(target));

    let current = 0;

    if (target === 0) {

        element.innerText = "0";
        return;

    }

    const timer = setInterval(() => {

        current++;

        element.innerText =
            current.toLocaleString();

        if (current >= target) {
            clearInterval(timer);
        }

    }, speed);

}


/*=========================================================
 LOAD BOOKS.JSON
=========================================================*/

async function loadBooks() {

    try {

        const response =
            await fetch("books.json", {
                cache: "no-store"
            });

        if (!response.ok) {

            throw new Error(
                "books.json could not be loaded"
            );

        }

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(
                "books.json must contain an array"
            );

        }

        /*
         * IMPORTANT:
         * Only books.json books are used.
         * No extra books are created.
         */

        allBooks = data;

        filteredBooks = [...allBooks];

        /* BOOK COUNTER */

        const bookCounter = byId("bookCounter");

        if (bookCounter) {

            animateNumber(
                bookCounter,
                allBooks.length,
                45
            );

        }

        /* ALL BOOKS */

        displayBooks(filteredBooks);

        /* LATEST */

        latestBook();

        /* MOST LIKED */

        renderMostLikedBooks();

        console.log(
            `✅ ${allBooks.length} books loaded`
        );

    }

    catch (error) {

        console.error(
            "Books loading error:",
            error
        );

        const container =
            byId("booksContainer");

        if (container) {

            container.innerHTML = `
                <div class="no-books">
                    <h2>Books could not be loaded</h2>
                    <p>Please check books.json.</p>
                </div>
            `;

        }

    }

}

loadBooks();


/*=========================================================
 GET BOOK PDF URL
=========================================================*/

function getReaderURL(book) {

    if (!book || !book.pdf) {
        return "reader.html";
    }

    return (
        "reader.html?book=" +
        encodeURIComponent(
            String(book.pdf).trim()
        )
    );

}


/*=========================================================
 GET PDF URL
=========================================================*/

function getPDFURL(book) {

    if (!book || !book.pdf) {
        return "#";
    }

    return encodeURI(
        String(book.pdf).trim()
    );

}


/*=========================================================
 BOOK STATISTICS
=========================================================*/

function getBookStats(book) {

    return {

        views: safeNumber(book.views),
        likes: safeNumber(book.likes),
        downloads: safeNumber(book.downloads)

    };

}


/*=========================================================
 ALL BOOKS
 NORMAL GRID
 NO AUTO MOVEMENT
=========================================================*/

function displayBooks(books) {

    const container =
        byId("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(books) || books.length === 0) {

        container.innerHTML = `
            <div class="no-books">
                <h2>No Books Found</h2>
                <p>Try another search.</p>
            </div>
        `;

        return;

    }

    books.forEach(book => {

        container.insertAdjacentHTML(
            "beforeend",
            createBookCard(book)
        );

    });

}


/*=========================================================
 CREATE BOOK CARD
=========================================================*/

function createBookCard(book) {

    const stats = getBookStats(book);

    const readerURL = getReaderURL(book);
    const pdfURL = getPDFURL(book);

    const bookID =
        escapeHTML(
            book.id ?? book.pdf ?? book.title
        );

    return `

    <article
        class="book-card"
        data-book-id="${bookID}"
        data-book-pdf="${escapeHTML(book.pdf || "")}"
    >

        <div class="book-cover">

            <img
                src="${escapeHTML(book.cover || "logo.png")}"
                alt="${escapeHTML(book.title || "Book")}"
                loading="lazy"
                onerror="this.onerror=null;this.src='logo.png';"
            >

        </div>


        <div class="book-content">

            <span class="book-category">
                ${escapeHTML(book.category || "Book")}
            </span>


            <h2>
                ${escapeHTML(book.title || "Untitled")}
            </h2>


            <h3>
                ${escapeHTML(book.author || "Unknown Author")}
            </h3>


            <p>
                ${escapeHTML(
                    book.description || ""
                )}
            </p>


            <!-- BOOK STATS -->

            <div class="book-meta">

                <span class="view-stat">

                    <i class="fas fa-eye"></i>

                    <span class="book-view-count">
                        ${stats.views}
                    </span>

                </span>


                <span class="like-stat">

                    <i class="fas fa-heart"></i>

                    <span class="book-like-count">
                        ${stats.likes}
                    </span>

                </span>


                <span class="download-stat">

                    <i class="fas fa-download"></i>

                    <span class="book-download-count">
                        ${stats.downloads}
                    </span>

                </span>

            </div>


            <!-- ACTION BAR -->

            <div class="chishti-book-actions">

                <button
                    type="button"
                    class="book-action like-action"
                    data-book-id="${bookID}"
                    title="Like this book"
                >

                    <i class="far fa-heart"></i>

                    <span>
                        ${stats.likes}
                    </span>

                </button>


                <button
                    type="button"
                    class="book-action view-action"
                    data-book-id="${bookID}"
                    title="Views"
                >

                    <i class="fas fa-eye"></i>

                    <span>
                        ${stats.views}
                    </span>

                </button>


                <button
                    type="button"
                    class="book-action share-action"
                    data-book-id="${bookID}"
                    title="Share book"
                >

                    <i class="fas fa-share-nodes"></i>

                    <span>
                        Share
                    </span>

                </button>

            </div>


            <!-- BUTTONS -->

            <div class="book-buttons">

                <a
                    href="${readerURL}"
                    class="btn read-book"
                    data-book-id="${bookID}"
                    data-book-pdf="${escapeHTML(book.pdf || "")}"
                >

                    <i class="fas fa-book-open"></i>

                    Read Online

                </a>


                <a
                    href="${pdfURL}"
                    download
                    class="btn download-book"
                    data-book-id="${bookID}"
                    data-book-pdf="${escapeHTML(book.pdf || "")}"
                >

                    <i class="fas fa-download"></i>

                    Download

                </a>

            </div>

        </div>

    </article>

    `;

}


/*=========================================================
 SEARCH
=========================================================*/

function searchBooks() {

    const input =
        byId("searchInput");

    if (!input) return;

    const value =
        input.value
            .toLowerCase()
            .trim();

    filteredBooks =
        allBooks.filter(book => {

            return (

                String(book.title || "")
                    .toLowerCase()
                    .includes(value)

                ||

                String(book.author || "")
                    .toLowerCase()
                    .includes(value)

                ||

                String(book.category || "")
                    .toLowerCase()
                    .includes(value)

                ||

                String(book.description || "")
                    .toLowerCase()
                    .includes(value)

            );

        });

    displayBooks(filteredBooks);

}


/*=========================================================
 CONNECT SEARCH
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            byId("searchInput");

        if (!input) return;

        input.addEventListener(
            "input",
            searchBooks
        );

    }
);


/*=========================================================
 CATEGORY FILTER
=========================================================*/

function filterBooks(category, button = null) {

    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove("active");

        });

    if (button) {

        button.classList.add("active");

    }

    if (category === "All") {

        filteredBooks = [...allBooks];

    } else {

        filteredBooks =
            allBooks.filter(book =>

                String(book.category || "")
                    .toLowerCase() ===
                String(category || "")
                    .toLowerCase()

            );

    }

    displayBooks(filteredBooks);

}


/*=========================================================
 SORT BOOKS
=========================================================*/

function sortBooks(type) {

    const buttons =
        document.querySelectorAll(".sort-btn");

    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    const clicked =
        [...buttons].find(btn =>
            btn.textContent
                .toLowerCase()
                .includes(
                    type === "latest"
                        ? "latest"
                        : type === "oldest"
                            ? "oldest"
                            : type === "liked"
                                ? "liked"
                                : "popular"
                )
        );

    if (clicked) {
        clicked.classList.add("active");
    }


    let sorted =
        [...filteredBooks];


    if (type === "latest") {

        sorted.sort(
            (a, b) =>
                safeNumber(b.id) -
                safeNumber(a.id)
        );

    }


    if (type === "oldest") {

        sorted.sort(
            (a, b) =>
                safeNumber(a.id) -
                safeNumber(b.id)
        );

    }


    if (type === "liked") {

        sorted.sort(
            (a, b) =>
                safeNumber(b.likes) -
                safeNumber(a.likes)
        );

    }


    if (type === "popular") {

        sorted.sort((a, b) => {

            const scoreA =
                safeNumber(a.views) +
                safeNumber(a.likes) * 3 +
                safeNumber(a.downloads) * 2;

            const scoreB =
                safeNumber(b.views) +
                safeNumber(b.likes) * 3 +
                safeNumber(b.downloads) * 2;

            return scoreB - scoreA;

        });

    }

    displayBooks(sorted);

}


/*=========================================================
 LATEST BOOK
=========================================================*/

function latestBook() {

    if (!Array.isArray(allBooks) ||
        allBooks.length === 0) {

        return;

    }

    let latest =
        allBooks.find(
            book => book.latest === true
        );

    /*
     * If no latest:true exists,
     * use highest ID.
     */

    if (!latest) {

        latest =
            [...allBooks]
                .sort(
                    (a, b) =>
                        safeNumber(b.id) -
                        safeNumber(a.id)
                )[0];

    }

    if (!latest) return;


    const image =
        document.querySelector(
            ".latest-book .book-image img"
        );

    const title =
        document.querySelector(
            ".latest-book .book-info h2"
        );

    const author =
        document.querySelector(
            ".latest-book .book-info h3"
        );

    const desc =
        document.querySelector(
            ".latest-book .book-info p"
        );

    const buttons =
        document.querySelectorAll(
            ".latest-book .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover || "logo.png";

        image.alt =
            latest.title || "Latest Book";

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

        /*
         * IMPORTANT:
         * Reader uses PDF filename.
         * NOT numeric ID.
         */

        buttons[0].href =
            getReaderURL(latest);

        buttons[0].removeAttribute(
            "target"
        );

        buttons[0].dataset.bookId =
            latest.id ?? "";

        buttons[0].dataset.bookPdf =
            latest.pdf ?? "";


        buttons[1].href =
            getPDFURL(latest);

        buttons[1].dataset.bookId =
            latest.id ?? "";

        buttons[1].dataset.bookPdf =
            latest.pdf ?? "";

    }

}


/*=========================================================
 MOST LIKED TOP 6
 INSERT JUST BEFORE AUTHORS
=========================================================*/

function renderMostLikedBooks() {

    if (!Array.isArray(allBooks)) return;

    /*
     * IMPORTANT:
     * Top 6 are calculated from ALL books.
     */

    const topBooks =
        [...allBooks]
            .sort(
                (a, b) =>
                    safeNumber(b.likes) -
                    safeNumber(a.likes)
            )
            .slice(0, 6);


    if (topBooks.length === 0) return;


    let section =
        document.getElementById(
            "mostLikedSection"
        );


    /*
     * Create section automatically
     * if it does not already exist.
     */

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "mostLikedSection";

        section.className =
            "most-liked-books";


        const authors =
            document.querySelector(
                ".authors"
            );


        if (authors) {

            authors.parentNode.insertBefore(
                section,
                authors
            );

        } else {

            const featured =
                document.querySelector(
                    ".featured-books"
                );

            if (featured) {

                featured.parentNode.insertAfter
                    ? featured.parentNode.insertAfter(
                        section,
                        featured
                    )
                    : document.body.appendChild(
                        section
                    );

            } else {

                document.body.appendChild(
                    section
                );

            }

        }

    }


    section.innerHTML = `

        <div class="container">

            <h2 class="section-title">
                Most Liked Books
            </h2>

            <p class="section-subtitle">
                Top 6 books loved by Chishti Library readers.
            </p>

            <div class="most-liked-wrapper">

                <div
                    class="most-liked-track"
                    id="mostLikedTrack"
                >

                    ${topBooks
                        .map(createMostLikedCard)
                        .join("")}

                </div>

            </div>

        </div>

    `;


    startMostLikedCarousel();

}


/*=========================================================
 MOST LIKED CARD
=========================================================*/

function createMostLikedCard(book) {

    const stats =
        getBookStats(book);

    return `

    <article
        class="most-liked-card"
        data-book-id="${escapeHTML(
            book.id ?? book.pdf ?? book.title
        )}"
    >

        <div class="most-liked-cover">

            <img
                src="${escapeHTML(
                    book.cover || "logo.png"
                )}"
                alt="${escapeHTML(
                    book.title || "Book"
                )}"
                loading="lazy"
                onerror="this.onerror=null;this.src='logo.png';"
            >

        </div>


        <div class="most-liked-info">

            <span class="book-category">
                ${escapeHTML(
                    book.category || "Book"
                )}
            </span>

            <h3>
                ${escapeHTML(
                    book.title || "Untitled"
                )}
            </h3>

            <p>
                ${escapeHTML(
                    book.author || ""
                )}
            </p>


            <div class="most-liked-stats">

                <span>
                    <i class="fas fa-heart"></i>
                    ${stats.likes}
                </span>

                <span>
                    <i class="fas fa-eye"></i>
                    ${stats.views}
                </span>

            </div>


            <a
                class="btn"
                href="${getReaderURL(book)}"
            >

                <i class="fas fa-book-open"></i>

                Read Online

            </a>

        </div>

    </article>

    `;

}


/*=========================================================
 MOST LIKED AUTO CAROUSEL
=========================================================*/

function startMostLikedCarousel() {

    const track =
        byId("mostLikedTrack");

    if (!track) return;


    /*
     * Small automatic movement.
     * Does NOT affect All Books.
     */

    let position = 0;

    const cards =
        track.querySelectorAll(
            ".most-liked-card"
        );

    if (cards.length <= 1) return;


    function move() {

        const first =
            cards[0];

        if (!first) return;


        const cardWidth =
            first.getBoundingClientRect().width;


        const gap =
            parseFloat(
                getComputedStyle(track).gap
            ) || 20;


        position++;


        if (position >= cards.length) {

            position = 0;

        }


        track.style.transform =
            `translateX(-${
                position *
                (cardWidth + gap)
            }px)`;

    }


    /*
     * Move every 1 second.
     */

    setInterval(
        move,
        1000
    );

}


/*=========================================================
 LIKE BOOK
 FIRESTORE
=========================================================*/

async function likeBook(book) {

    if (!book) return;

    const bookKey =
        String(
            book.pdf ||
            book.id ||
            book.title
        ).trim();


    /*
     * Prevent multiple likes
     * from same browser.
     */

    const storageKey =
        "chishti-liked-" +
        encodeURIComponent(bookKey);


    const alreadyLiked =
        localStorage.getItem(storageKey);


    if (alreadyLiked === "true") {

        return;

    }


    /*
     * Local fallback
     */

    book.likes =
        safeNumber(book.likes) + 1;

    localStorage.setItem(
        storageKey,
        "true"
    );


    updateBookUI(book);


    /*
     * Firebase
     */

    if (!firebaseReady()) {

        renderMostLikedBooks();
        return;

    }


    try {

        const ref =
            db.collection("books")
                .doc(bookKey);


        await ref.set({

            title: book.title || "",
            author: book.author || "",
            pdf: book.pdf || "",
            likes:
                firebase.firestore.FieldValue.increment(1),
            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        }, {

            merge: true

        });


        console.log(
            "❤️ Like saved:",
            book.title
        );


        renderMostLikedBooks();

    }

    catch (error) {

        console.error(
            "Like error:",
            error
        );

    }

}


/*=========================================================
 VIEW BOOK
=========================================================*/

async function countBookView(book) {

    if (!book) return;

    const bookKey =
        String(
            book.pdf ||
            book.id ||
            book.title
        ).trim();


    /*
     * Count only once per browser session.
     */

    const sessionKey =
        "chishti-viewed-" +
        encodeURIComponent(bookKey);


    if (
        sessionStorage.getItem(
            sessionKey
        )
    ) {

        return;

    }


    sessionStorage.setItem(
        sessionKey,
        "true"
    );


    book.views =
        safeNumber(book.views) + 1;


    updateBookUI(book);


    if (!firebaseReady()) {

        return;

    }


    try {

        const ref =
            db.collection("books")
                .doc(bookKey);


        await ref.set({

            title: book.title || "",
            author: book.author || "",
            pdf: book.pdf || "",
            views:
                firebase.firestore.FieldValue.increment(1),
            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        }, {

            merge: true

        });


        console.log(
            "👁 View saved:",
            book.title
        );

    }

    catch (error) {

        console.error(
            "View error:",
            error
        );

    }

}


/*=========================================================
 UPDATE BOOK UI
=========================================================*/

function updateBookUI(book) {

    const key =
        String(
            book.pdf ||
            book.id ||
            book.title
        ).trim();


    document
        .querySelectorAll(
            `[data-book-pdf="${CSS.escape(
                book.pdf || ""
            )}"]`
        );


    document
        .querySelectorAll(".book-card")
        .forEach(card => {

            const cardPDF =
                card.dataset.bookPdf || "";

            const cardID =
                card.dataset.bookId || "";


            if (
                cardPDF === String(book.pdf || "") ||
                cardID === String(book.id || "")
            ) {

                const likeCounts =
                    card.querySelectorAll(
                        ".book-like-count, .like-action span"
                    );

                likeCounts.forEach(el => {

                    el.innerText =
                        safeNumber(book.likes);

                });


                const viewCounts =
                    card.querySelectorAll(
                        ".book-view-count, .view-action span"
                    );

                viewCounts.forEach(el => {

                    el.innerText =
                        safeNumber(book.views);

                });


                const downloadCounts =
                    card.querySelectorAll(
                        ".book-download-count"
                    );

                downloadCounts.forEach(el => {

                    el.innerText =
                        safeNumber(book.downloads);

                });

            }

        });

}


/*=========================================================
 FIND BOOK
=========================================================*/

function findBookFromElement(element) {

    if (!element) return null;

    const card =
        element.closest(
            ".book-card, .most-liked-card"
        );

    if (!card) return null;

    const pdf =
        card.dataset.bookPdf || "";

    const id =
        card.dataset.bookId || "";


    return (
        allBooks.find(book =>
            String(book.pdf || "") ===
            String(pdf)
        )

        ||

        allBooks.find(book =>
            String(book.id || "") ===
            String(id)
        )

        ||

        null
    );

}


/*=========================================================
 BOOK ACTION CLICKS
=========================================================*/

document.addEventListener(
    "click",
    async event => {

        const likeButton =
            event.target.closest(
                ".like-action"
            );


        if (likeButton) {

            event.preventDefault();
            event.stopPropagation();

            const book =
                findBookFromElement(
                    likeButton
                );

            if (!book) return;


            const key =
                String(
                    book.pdf ||
                    book.id ||
                    book.title
                );


            const storageKey =
                "chishti-liked-" +
                encodeURIComponent(key);


            if (
                localStorage.getItem(
                    storageKey
                ) === "true"
            ) {

                return;

            }


            likeButton.dataset.liked =
                "true";


            const icon =
                likeButton.querySelector("i");


            if (icon) {

                icon.className =
                    "fas fa-heart";

            }


            await likeBook(book);

        }

    }
);


/*=========================================================
 READ BUTTON
 ENSURE PDF FILENAME URL
=========================================================*/

document.addEventListener(
    "click",
    async event => {

        const readButton =
            event.target.closest(
                ".read-book"
            );


        if (!readButton) return;


        const book =
            findBookFromElement(
                readButton
            );


        if (!book) return;


        /*
         * FORCE CORRECT READER URL
         */

        readButton.href =
            getReaderURL(book);


        /*
         * Count view
         */

        await countBookView(book);

    }
);


/*=========================================================
 DOWNLOAD COUNTER
=========================================================*/

document.addEventListener(
    "click",
    async event => {

        const downloadButton =
            event.target.closest(
                ".download-book"
            );


        if (!downloadButton) return;


        const book =
            findBookFromElement(
                downloadButton
            );


        if (!book) return;


        book.downloads =
            safeNumber(
                book.downloads
            ) + 1;


        updateBookUI(book);


        /*
         * Firebase download counter
         */

        if (!firebaseReady()) return;


        try {

            const key =
                String(
                    book.pdf ||
                    book.id ||
                    book.title
                ).trim();


            await db.collection("books")
                .doc(key)
                .set({

                    title: book.title || "",
                    author: book.author || "",
                    pdf: book.pdf || "",

                    downloads:
                        firebase.firestore.FieldValue.increment(1),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                }, {

                    merge: true

                });

        }

        catch (error) {

            console.error(
                "Download counter error:",
                error
            );

        }

    }
);


/*=========================================================
 SHARE BOOK
=========================================================*/

document.addEventListener(
    "click",
    async event => {

        const shareButton =
            event.target.closest(
                ".share-action"
            );


        if (!shareButton) return;


        event.preventDefault();


        const book =
            findBookFromElement(
                shareButton
            );


        if (!book) return;


        const url =
            new URL(
                getReaderURL(book),
                window.location.href
            ).href;


        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title:
                        book.title ||
                        "Chishti Library",

                    text:
                        "Read this book on Chishti Library",

                    url: url

                });

            }

            catch (error) {

                /* User cancelled */

            }

        }

        else if (
            navigator.clipboard
        ) {

            try {

                await navigator.clipboard
                    .writeText(url);

                alert(
                    "Book link copied!"
                );

            }

            catch (error) {

                prompt(
                    "Copy book link:",
                    url
                );

            }

        }

    }
);


/*=========================================================
 RIPPLE EFFECT
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".btn"
            );


        if (!button) return;


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "ripple";


        const rect =
            button.getBoundingClientRect();


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


        button.appendChild(
            ripple
        );


        setTimeout(() => {

            ripple.remove();

        }, 600);

    }
);


/*=========================================================
 SCROLL ANIMATION
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const sections =
            document.querySelectorAll(
                "section"
            );


        if (
            !("IntersectionObserver" in window)
        ) {

            sections.forEach(section => {

                section.classList.add(
                    "show-section"
                );

            });

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
                    threshold: 0.12
                }
            );


        sections.forEach(section => {

            observer.observe(
                section
            );

        });

    }
);


/*=========================================================
 KNOWLEDGE JSON
=========================================================*/

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "knowledge.json",
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "knowledge.json not found"
            );

        }


        knowledge =
            await response.json();


        console.log(
            "✅ Knowledge loaded"
        );

    }

    catch (error) {

        console.warn(
            "Knowledge loading skipped:",
            error
        );

    }

}

loadKnowledge();


/*=========================================================
 CHAT ELEMENTS
=========================================================*/

const chatBtn =
    byId("chatBtn");

const chatWindow =
    byId("chatWindow");

const closeChat =
    byId("closeChat");

const chatInput =
    byId("chatInput");

const chatMessages =
    byId("chatMessages");


/*=========================================================
 OPEN CHAT
=========================================================*/

if (chatBtn) {

    chatBtn.addEventListener(
        "click",
        () => {

            if (chatWindow) {

                chatWindow.style.display =
                    "flex";

            }

        }
    );

}


/*=========================================================
 CLOSE CHAT
=========================================================*/

if (closeChat) {

    closeChat.addEventListener(
        "click",
        () => {

            if (chatWindow) {

                chatWindow.style.display =
                    "none";

            }

        }
    );

}


/*=========================================================
 CHAT SEARCH BOOK
=========================================================*/

function searchBook(question) {

    const q =
        String(question || "")
            .toLowerCase()
            .trim();


    if (!q) return null;


    const book =
        allBooks.find(book => {

            return (

                String(book.title || "")
                    .toLowerCase()
                    .includes(q)

                ||

                String(book.author || "")
                    .toLowerCase()
                    .includes(q)

                ||

                String(book.category || "")
                    .toLowerCase()
                    .includes(q)

            );

        });


    if (!book) return null;


    return `

        📚 <b>${escapeHTML(
            book.title
        )}</b><br><br>

        👤 ${escapeHTML(
            book.author
        )}<br>

        📂 ${escapeHTML(
            book.category
        )}<br><br>

        <a
            href="${getReaderURL(book)}"
            class="btn"
        >
            📖 Read Online
        </a>

        &nbsp;

        <a
            href="${getPDFURL(book)}"
            download
            class="btn"
        >
            ⬇ Download
        </a>

    `;

}


/*=========================================================
 CHAT KNOWLEDGE
=========================================================*/

function searchKnowledge(question) {

    const q =
        String(question || "")
            .toLowerCase()
            .trim();


    for (
        const item of knowledge
    ) {

        const itemQuestion =
            String(
                item.question || ""
            ).toLowerCase();


        if (
            itemQuestion.includes(q) ||
            q.includes(itemQuestion)
        ) {

            return item.answer;

        }

    }


    return null;

}


/*=========================================================
 BOT MESSAGE
=========================================================*/

function botReply(text) {

    if (!chatMessages) return;

    chatMessages.insertAdjacentHTML(
        "beforeend",
        `
        <div class="bot-message">
            ${text}
        </div>
        `
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
 USER MESSAGE
=========================================================*/

function userReply(text) {

    if (!chatMessages) return;

    chatMessages.insertAdjacentHTML(
        "beforeend",
        `
        <div class="user-message">
            ${escapeHTML(text)}
        </div>
        `
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
 SEND MESSAGE
=========================================================*/

function sendMessage() {

    if (!chatInput) return;


    const question =
        chatInput.value.trim();


    if (!question) return;


    userReply(question);


    chatInput.value = "";


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
                🤖 Sorry!<br><br>
                Mujhe iska jawab abhi database mein nahi mila.
            `;

        }


        botReply(reply);

    }, 400);

}


if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/*=========================================================
 IMAGE FALLBACK
=========================================================*/

document.addEventListener(
    "error",
    event => {

        if (
            event.target &&
            event.target.tagName === "IMG"
        ) {

            if (
                event.target.dataset.fallbackDone
            ) {

                return;

            }


            event.target.dataset.fallbackDone =
                "true";


            event.target.src =
                "logo.png";

        }

    },
    true
);


/*=========================================================
 PRELOAD BOOK COVERS
=========================================================*/

window.addEventListener(
    "load",
    () => {

        if (
            !Array.isArray(allBooks)
        ) return;


        allBooks.forEach(book => {

            if (!book.cover) return;


            const image =
                new Image();


            image.src =
                book.cover;

        });

    }
);


/*=========================================================
 SMOOTH ANCHOR LINKS
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(anchor => {

                anchor.addEventListener(
                    "click",
                    event => {

                        const href =
                            anchor.getAttribute(
                                "href"
                            );


                        if (
                            !href ||
                            href === "#"
                        ) return;


                        const target =
                            document.querySelector(
                                href
                            );


                        if (!target) return;


                        event.preventDefault();


                        target.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }
                );

            });

    }
);


/*=========================================================
 AUTO YEAR
=========================================================*/

const yearElement =
    byId("year");

if (yearElement) {

    yearElement.innerText =
        new Date()
            .getFullYear();

}


/*=========================================================
 FINAL
=========================================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Full Script Loaded"
);

console.log(
    "✅ JSON Books"
);

console.log(
    "✅ All Books Normal Grid"
);

console.log(
    "✅ Most Liked Top 6"
);

console.log(
    "✅ Auto Moving Most Liked"
);

console.log(
    "✅ PDF Reader URLs"
);

console.log(
    "✅ Likes"
);

console.log(
    "✅ Views"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Chatbot"
);

console.log(
    "🚀 Ready"
);

console.log(
    "===================================="
);
