/*=========================================================
  CHISHTI LIBRARY
  SCRIPT.JS — FULL REPLACEMENT
=========================================================*/

"use strict";

/*=========================================================
  GLOBAL DATA
=========================================================*/

let allBooks = [];
let currentBooks = [];
let currentCategory = "All";
let currentSort = "latest";

/*=========================================================
  HELPERS
=========================================================*/

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/*
 * Get the REAL PDF filename.
 *
 * IMPORTANT:
 * Reader URL uses:
 * reader.html?book=husn-e-kainat.pdf
 *
 * NOT:
 * reader.html?book=book-2
 */
function getBookPdf(book) {
    if (!book) return "";

    return (
        book.pdf ||
        book.file ||
        book.pdfFile ||
        book.pdfUrl ||
        book.filename ||
        ""
    ).toString().trim();
}


/*=========================================================
  READER URL
=========================================================*/

function getReaderUrl(book) {

    const pdfFile = getBookPdf(book);

    if (!pdfFile) {
        console.warn("PDF file missing:", book);
        return "reader.html";
    }

    return (
        "reader.html?book=" +
        encodeURIComponent(pdfFile)
    );
}


/*=========================================================
  DOWNLOAD URL
=========================================================*/

function getPdfUrl(book) {

    const pdfFile = getBookPdf(book);

    if (!pdfFile) return "#";

    return pdfFile;
}


/*=========================================================
  BOOK NORMALIZATION
=========================================================*/

function normalizeBook(book, index) {

    const normalized = {
        ...book,

        id:
            book.id ??
            book.bookId ??
            ("book-" + (index + 1)),

        title:
            book.title ||
            "Untitled Book",

        author:
            book.author ||
            "Unknown Author",

        category:
            book.category ||
            "Other",

        cover:
            book.cover ||
            "logo.png",

        pdf:
            getBookPdf(book),

        description:
            book.description ||
            "Islamic book from Chishti Library.",

        views:
            Number(book.views) || 0,

        likes:
            Number(book.likes) || 0,

        downloads:
            Number(book.downloads) || 0,

        latest:
            Boolean(book.latest)
    };

    return normalized;
}


/*=========================================================
  LOAD BOOKS FROM FIREBASE / GLOBAL DATA
=========================================================*/

async function loadBooks() {

    try {

        /*
         * First try Firebase/Firestore if available.
         */

        if (
            typeof firebase !== "undefined" &&
            firebase.firestore
        ) {

            try {

                const db = firebase.firestore();

                const snapshot =
                    await db
                        .collection("books")
                        .get();

                if (!snapshot.empty) {

                    allBooks =
                        snapshot.docs.map(
                            (doc, index) => {

                                const data =
                                    doc.data() || {};

                                return normalizeBook(
                                    {
                                        ...data,
                                        firestoreId:
                                            doc.id
                                    },
                                    index
                                );

                            }
                        );

                }

            } catch (firebaseError) {

                console.warn(
                    "Firebase books unavailable. Trying books.json...",
                    firebaseError
                );

            }

        }


        /*
         * If Firebase returned nothing,
         * load books.json.
         */

        if (!allBooks.length) {

            const response =
                await fetch(
                    "./books.json",
                    {
                        cache: "no-store"
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "books.json could not be loaded."
                );
            }

            const data =
                await response.json();

            if (Array.isArray(data)) {

                allBooks =
                    data.map(
                        normalizeBook
                    );

            } else {

                throw new Error(
                    "books.json format is invalid."
                );

            }

        }


        /*
         * Remove duplicate books.
         */

        const uniqueBooks = [];

        const seen = new Set();

        allBooks.forEach(book => {

            const key =
                book.pdf ||
                book.id ||
                book.title;

            if (!seen.has(key)) {

                seen.add(key);

                uniqueBooks.push(book);

            }

        });

        allBooks = uniqueBooks;


        currentBooks =
            [...allBooks];


        updateBookCounter();

        renderBooks();

        updateLatestBook();


    } catch (error) {

        console.error(
            "Book loading error:",
            error
        );

        const container =
            document.getElementById(
                "booksContainer"
            );

        if (container) {

            container.innerHTML = `
                <div class="book-error">
                    <i class="fas fa-book"></i>
                    <h3>Unable to load books</h3>
                    <p>Please try again later.</p>
                </div>
            `;

        }

    }

}


/*=========================================================
  BOOK COUNTER
=========================================================*/

function updateBookCounter() {

    const counter =
        document.getElementById(
            "bookCounter"
        );

    if (!counter) return;

    animateCounter(
        counter,
        allBooks.length
    );

}


/*=========================================================
  VISITOR COUNTER
=========================================================*/

function loadVisitorCounter() {

    const counter =
        document.getElementById(
            "visitorCounter"
        );

    if (!counter) return;


    /*
     * Local visitor counter.
     */

    const storageKey =
        "chishti_library_visitors";

    let visitors =
        Number(
            localStorage.getItem(
                storageKey
            )
        ) || 0;


    /*
     * Count this browser visit once
     * per session.
     */

    if (
        !sessionStorage.getItem(
            "chishti_visit_counted"
        )
    ) {

        visitors++;

        localStorage.setItem(
            storageKey,
            visitors
        );

        sessionStorage.setItem(
            "chishti_visit_counted",
            "true"
        );

    }


    animateCounter(
        counter,
        visitors
    );

}


/*=========================================================
  COUNTER ANIMATION
=========================================================*/

function animateCounter(
    element,
    target
) {

    if (!element) return;

    const duration = 900;

    const startTime =
        performance.now();

    const startValue = 0;


    function update(now) {

        const progress =
            Math.min(
                (now - startTime) /
                duration,
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
                startValue +
                (target - startValue) *
                eased
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


/*=========================================================
  RENDER BOOKS
=========================================================*/

function renderBooks() {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    let books =
        [...allBooks];


    /* FILTER */

    if (
        currentCategory &&
        currentCategory !== "All"
    ) {

        books =
            books.filter(
                book =>
                    String(
                        book.category
                    ).toLowerCase() ===
                    String(
                        currentCategory
                    ).toLowerCase()
            );

    }


    /* SORT */

    if (currentSort === "latest") {

        books.sort(
            (a, b) =>
                Number(b.id) -
                Number(a.id)
        );

    }


    else if (
        currentSort === "oldest"
    ) {

        books.sort(
            (a, b) =>
                Number(a.id) -
                Number(b.id)
        );

    }


    else if (
        currentSort === "liked"
    ) {

        books.sort(
            (a, b) =>
                Number(b.likes) -
                Number(a.likes)
        );

    }


    else if (
        currentSort === "popular"
    ) {

        books.sort(
            (a, b) =>
                Number(b.views) -
                Number(a.views)
        );

    }


    currentBooks =
        books;


    if (!books.length) {

        container.innerHTML = `
            <div class="no-books">
                <i class="fas fa-book-open"></i>
                <h3>No books found</h3>
                <p>Try another category.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        books.map(
            createBookCard
        ).join("");


    connectBookActions();

}


/*=========================================================
  CREATE BOOK CARD
=========================================================*/

function createBookCard(book, index) {

    const pdfFile =
        getBookPdf(book);

    const readerUrl =
        getReaderUrl(book);

    const downloadUrl =
        getPdfUrl(book);


    return `

        <article
            class="book-result"
            data-book-id="${escapeHtml(book.id)}"
            data-pdf="${escapeHtml(pdfFile)}"
            data-title="${escapeHtml(book.title)}"
        >

            <div class="book-card-image">

                <img
                    src="${escapeHtml(book.cover)}"
                    alt="${escapeHtml(book.title)}"
                    loading="lazy"
                    onerror="this.src='logo.png'"
                >

            </div>


            <div class="book-card-content">

                <span class="book-category">
                    ${escapeHtml(book.category)}
                </span>


                <h3 class="book-title">
                    ${escapeHtml(book.title)}
                </h3>


                <h4 class="book-author">
                    ${escapeHtml(book.author)}
                </h4>


                <p class="book-description">
                    ${escapeHtml(book.description)}
                </p>


                <!-- ACTION BAR -->

                <div class="chishti-book-actions">


                    <button
                        type="button"
                        class="book-action view-action"
                        title="Views"
                    >

                        <i class="fas fa-eye"></i>

                        <span class="book-view-count">
                            ${Number(book.views).toLocaleString()}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action like-action"
                        data-book-id="${escapeHtml(book.id)}"
                        title="Like"
                    >

                        <i class="far fa-heart"></i>

                        <span>
                            ${Number(book.likes).toLocaleString()}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action comment-action"
                        data-book-id="${escapeHtml(book.id)}"
                        title="Comments"
                    >

                        <i class="far fa-comment"></i>

                        <span>
                            Comment
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action share-action"
                        data-book-id="${escapeHtml(book.id)}"
                        title="Share"
                    >

                        <i class="fas fa-share-nodes"></i>

                        <span>
                            Share
                        </span>

                    </button>


                </div>


                <!-- BOOK BUTTONS -->

                <div class="book-buttons">


                    <a
                        href="${escapeHtml(readerUrl)}"
                        class="btn read-book"
                        data-book-id="${escapeHtml(book.id)}"
                        data-pdf="${escapeHtml(pdfFile)}"
                    >

                        <i class="fas fa-book-open"></i>

                        Read Online

                    </a>


                    <a
                        href="${escapeHtml(downloadUrl)}"
                        class="btn download-book"
                        data-book-id="${escapeHtml(book.id)}"
                        download
                    >

                        <i class="fas fa-download"></i>

                        Download PDF

                    </a>


                </div>

            </div>

        </article>

    `;

}


/*=========================================================
  CONNECT BOOK ACTIONS
=========================================================*/

function connectBookActions() {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    const cards =
        container.querySelectorAll(
            ".book-result"
        );


    cards.forEach(card => {

        const bookId =
            card.dataset.bookId;

        const pdfFile =
            card.dataset.pdf;


        const book =
            allBooks.find(
                item =>
                    String(item.id) ===
                    String(bookId)
            );


        /*
         * READ ONLINE
         *
         * IMPORTANT:
         * Uses PDF filename.
         */

        const readButton =
            card.querySelector(
                ".read-book"
            );


        if (
            readButton &&
            pdfFile
        ) {

            readButton.href =
                "reader.html?book=" +
                encodeURIComponent(
                    pdfFile
                );

            readButton.removeAttribute(
                "target"
            );

        }


        /*
         * DOWNLOAD
         */

        const downloadButton =
            card.querySelector(
                ".download-book"
            );


        if (
            downloadButton &&
            pdfFile
        ) {

            downloadButton.href =
                pdfFile;

        }


        /*
         * LIKE
         */

        const likeButton =
            card.querySelector(
                ".like-action"
            );


        if (
            likeButton &&
            book
        ) {

            setupLikeButton(
                likeButton,
                book,
                card
            );

        }


        /*
         * COMMENTS
         */

        const commentButton =
            card.querySelector(
                ".comment-action"
            );


        if (commentButton) {

            commentButton.addEventListener(
                "click",
                function () {

                    /*
                     * Open reader using PDF filename.
                     */

                    if (pdfFile) {

                        window.location.href =
                            "reader.html?book=" +
                            encodeURIComponent(
                                pdfFile
                            );

                    }

                }
            );

        }


        /*
         * SHARE
         */

        const shareButton =
            card.querySelector(
                ".share-action"
            );


        if (shareButton) {

            shareButton.addEventListener(
                "click",
                function () {

                    shareBook(
                        book,
                        pdfFile
                    );

                }
            );

        }


        /*
         * VIEW
         */

        if (book) {

            setupViewCounter(
                card,
                book
            );

        }

    });

}


/*=========================================================
  LIKE SYSTEM
=========================================================*/

function setupLikeButton(
    button,
    book,
    card
) {

    const storageKey =
        "chishti_liked_" +
        String(book.id);


    let liked =
        localStorage.getItem(
            storageKey
        ) === "true";


    updateLikeUI(
        button,
        liked,
        book.likes
    );


    button.addEventListener(
        "click",
        function () {

            liked = !liked;


            if (liked) {

                book.likes =
                    Number(book.likes) + 1;

                localStorage.setItem(
                    storageKey,
                    "true"
                );

            } else {

                book.likes =
                    Math.max(
                        0,
                        Number(book.likes) - 1
                    );

                localStorage.setItem(
                    storageKey,
                    "false"
                );

            }


            updateLikeUI(
                button,
                liked,
                book.likes
            );


            /*
             * Update Firebase if possible.
             */

            updateFirebaseBookStats(
                book
            );

        }
    );

}


function updateLikeUI(
    button,
    liked,
    count
) {

    const icon =
        button.querySelector("i");

    const span =
        button.querySelector("span");


    if (icon) {

        icon.className =
            liked
                ? "fas fa-heart"
                : "far fa-heart";

    }


    if (span) {

        span.textContent =
            Number(count).toLocaleString();

    }


    button.dataset.liked =
        liked
            ? "true"
            : "false";

}


/*=========================================================
  VIEW SYSTEM
=========================================================*/

function setupViewCounter(
    card,
    book
) {

    const viewButton =
        card.querySelector(
            ".view-action"
        );


    if (!viewButton) return;


    const count =
        viewButton.querySelector(
            ".book-view-count"
        );


    if (!count) return;


    count.textContent =
        Number(book.views).toLocaleString();

}


/*=========================================================
  UPDATE FIREBASE STATS
=========================================================*/

async function updateFirebaseBookStats(
    book
) {

    if (
        typeof firebase === "undefined" ||
        !firebase.firestore
    ) {
        return;
    }


    try {

        const db =
            firebase.firestore();


        /*
         * If a Firestore document ID exists,
         * update it.
         */

        if (book.firestoreId) {

            await db
                .collection("books")
                .doc(book.firestoreId)
                .update({

                    likes:
                        Number(book.likes) || 0,

                    views:
                        Number(book.views) || 0,

                    downloads:
                        Number(book.downloads) || 0

                });

        }

    } catch (error) {

        console.warn(
            "Firebase stats update failed:",
            error
        );

    }

}


/*=========================================================
  SHARE BOOK
=========================================================*/

async function shareBook(
    book,
    pdfFile
) {

    if (!pdfFile) return;


    const url =
        new URL(
            "reader.html?book=" +
            encodeURIComponent(
                pdfFile
            ),
            window.location.href
        ).href;


    const title =
        book?.title ||
        "Chishti Library";


    const text =
        "Read " +
        title +
        " on Chishti Library.";


    /*
     * Native share
     */

    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    title,

                text:
                    text,

                url:
                    url

            });

            return;

        } catch (error) {

            /*
             * User cancelled share.
             */

        }

    }


    /*
     * Clipboard fallback
     */

    try {

        await navigator.clipboard.writeText(
            url
        );

        alert(
            "Book link copied!"
        );

    } catch (error) {

        prompt(
            "Copy this book link:",
            url
        );

    }

}


/*=========================================================
  SEARCH
=========================================================*/

function setupSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        function () {

            const query =
                input.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                renderBooks();

                return;

            }


            let books =
                allBooks.filter(
                    book => {

                        const title =
                            String(
                                book.title
                            ).toLowerCase();

                        const author =
                            String(
                                book.author
                            ).toLowerCase();

                        const category =
                            String(
                                book.category
                            ).toLowerCase();

                        const description =
                            String(
                                book.description
                            ).toLowerCase();


                        return (
                            title.includes(query) ||
                            author.includes(query) ||
                            category.includes(query) ||
                            description.includes(query)
                        );

                    }
                );


            /*
             * Apply current sort.
             */

            if (
                currentSort ===
                "liked"
            ) {

                books.sort(
                    (a, b) =>
                        Number(b.likes) -
                        Number(a.likes)
                );

            }

            else if (
                currentSort ===
                "popular"
            ) {

                books.sort(
                    (a, b) =>
                        Number(b.views) -
                        Number(a.views)
                );

            }

            else if (
                currentSort ===
                "oldest"
            ) {

                books.sort(
                    (a, b) =>
                        Number(a.id) -
                        Number(b.id)
                );

            }

            else {

                books.sort(
                    (a, b) =>
                        Number(b.id) -
                        Number(a.id)
                );

            }


            const container =
                document.getElementById(
                    "booksContainer"
                );


            if (!container) return;


            if (!books.length) {

                container.innerHTML = `
                    <div class="no-books">
                        <i class="fas fa-search"></i>
                        <h3>No books found</h3>
                        <p>Try another search.</p>
                    </div>
                `;

                return;

            }


            container.innerHTML =
                books
                    .map(
                        createBookCard
                    )
                    .join("");


            connectBookActions();

        }
    );

}


/*=========================================================
  CATEGORY FILTER
=========================================================*/

function filterBooks(
    category
) {

    currentCategory =
        category || "All";


    /*
     * Update active category.
     */

    document
        .querySelectorAll(
            ".category"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                const text =
                    button.textContent
                        .trim()
                        .toLowerCase();


                if (
                    text ===
                    currentCategory
                        .toLowerCase()
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    renderBooks();

}


/*=========================================================
  SORT BOOKS
=========================================================*/

function sortBooks(
    sortType
) {

    currentSort =
        sortType || "latest";


    /*
     * Active sort button.
     */

    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const buttons =
        document.querySelectorAll(
            ".sort-btn"
        );


    buttons.forEach(
        button => {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();


            if (
                (
                    sortType === "latest" &&
                    text.includes("latest")
                ) ||
                (
                    sortType === "oldest" &&
                    text.includes("oldest")
                ) ||
                (
                    sortType === "liked" &&
                    text.includes("liked")
                ) ||
                (
                    sortType === "popular" &&
                    text.includes("popular")
                )
            ) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    renderBooks();

}


/*=========================================================
  LATEST RELEASE
=========================================================*/

function updateLatestBook() {

    const latestSection =
        document.querySelector(
            ".latest-book"
        );


    if (!latestSection) return;


    if (!allBooks.length) return;


    /*
     * Prefer latest:true books.
     * If several exist, use highest ID.
     */

    const latestBooks =
        allBooks.filter(
            book =>
                book.latest === true
        );


    let latestBook;


    if (latestBooks.length) {

        latestBook =
            latestBooks.sort(
                (a, b) =>
                    Number(b.id) -
                    Number(a.id)
            )[0];

    } else {

        latestBook =
            [...allBooks].sort(
                (a, b) =>
                    Number(b.id) -
                    Number(a.id)
            )[0];

    }


    if (!latestBook) return;


    const image =
        latestSection.querySelector(
            ".book-image img"
        );


    const title =
        latestSection.querySelector(
            ".book-info h2"
        );


    const author =
        latestSection.querySelector(
            ".book-info h3"
        );


    const description =
        latestSection.querySelector(
            ".book-info p"
        );


    const readButton =
        latestSection.querySelector(
            ".read-book"
        );


    const downloadButton =
        latestSection.querySelector(
            ".book-buttons a:not(.read-book)"
        );


    if (image) {

        image.src =
            latestBook.cover ||
            "logo.png";

        image.alt =
            latestBook.title;

    }


    if (title) {

        title.textContent =
            latestBook.title;

    }


    if (author) {

        author.textContent =
            latestBook.author;

    }


    if (description) {

        description.textContent =
            latestBook.description;

    }


    if (readButton) {

        readButton.href =
            getReaderUrl(
                latestBook
            );

        readButton.dataset.bookId =
            latestBook.id;

    }


    if (downloadButton) {

        downloadButton.href =
            getPdfUrl(
                latestBook
            );

    }

}


/*=========================================================
  MOBILE MENU
=========================================================*/

function setupMobileMenu() {

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const menu =
        document.querySelector(
            ".menu"
        );


    if (
        !mobileMenu ||
        !menu
    ) {
        return;
    }


    mobileMenu.addEventListener(
        "click",
        function () {

            menu.classList.toggle(
                "active"
            );


            const expanded =
                menu.classList.contains(
                    "active"
                );


            mobileMenu.setAttribute(
                "aria-expanded",
                expanded
                    ? "true"
                    : "false"
            );

        }
    );


    menu
        .querySelectorAll("a")
        .forEach(
            link => {

                link.addEventListener(
                    "click",
                    function () {

                        menu.classList.remove(
                            "active"
                        );

                        mobileMenu.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/*=========================================================
  SCROLL TOP
=========================================================*/

function setupScrollTop() {

    const scrollTop =
        document.getElementById(
            "scrollTop"
        );


    if (!scrollTop) return;


    function checkScroll() {

        if (
            window.scrollY >
            400
        ) {

            scrollTop.classList.add(
                "show"
            );

        } else {

            scrollTop.classList.remove(
                "show"
            );

        }

    }


    window.addEventListener(
        "scroll",
        checkScroll,
        {
            passive: true
        }
    );


    scrollTop.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );


    checkScroll();

}


/*=========================================================
  FIX OLD / EXISTING FIREBASE BOOK CARDS
=========================================================*/

function fixExistingBookLinks() {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    container
        .querySelectorAll(
            ".book-result"
        )
        .forEach(
            card => {

                const pdf =
                    card.dataset.pdf ||
                    card.getAttribute(
                        "data-pdf"
                    );


                if (!pdf) return;


                const readButton =
                    card.querySelector(
                        ".read-book"
                    );


                if (readButton) {

                    readButton.href =
                        "reader.html?book=" +
                        encodeURIComponent(
                            pdf
                        );

                }

            }
        );

}


/*=========================================================
  MUTATION OBSERVER
=========================================================*/

function setupBookObserver() {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    const observer =
        new MutationObserver(
            function () {

                fixExistingBookLinks();

            }
        );


    observer.observe(
        container,
        {
            childList: true,
            subtree: true
        }
    );

}


/*=========================================================
  INITIALIZATION
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupSearch();

        setupMobileMenu();

        setupScrollTop();

        setupBookObserver();

        loadVisitorCounter();

        loadBooks();


        /*
         * Extra protection in case
         * Firebase renders cards later.
         */

        setTimeout(
            fixExistingBookLinks,
            500
        );

        setTimeout(
            fixExistingBookLinks,
            1500
        );

        setTimeout(
            fixExistingBookLinks,
            3000
        );

    }
);


/*=========================================================
  GLOBAL FUNCTIONS
  Required by HTML onclick=""
=========================================================*/

window.filterBooks =
    filterBooks;

window.sortBooks =
    sortBooks;

window.loadBooks =
    loadBooks;


/*=========================================================
  DEBUG
=========================================================*/

console.log(
    "%c CHISHTI LIBRARY ",
    "font-weight:bold;font-size:18px;"
);

console.log(
    "Book reader system loaded."
);
