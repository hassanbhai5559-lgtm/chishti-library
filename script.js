/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS — FINAL COMPLETE VERSION
   PART 1 / 4

   Works with the supplied index.html
   ========================================================= */

"use strict";

/* =========================================================
   GLOBAL DATA
   ========================================================= */

let allBooks = [];
let filteredBooks = [];

window.allBooks = allBooks;
window.filteredBooks = filteredBooks;


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initLoader();
    initMobileMenu();
    initScrollTop();
    initSearch();
    initCategories();
    initSortButtons();
    initPremiumAnimations();
    initImageFallback();
    initSmoothLinks();
    initYear();
    initChat();
    initCommentsModal();
    initSharePopup();
    initKeyboardShortcuts();

    loadBooks();
    updateVisitorCounter();

});


/* =========================================================
   LOADER
   ========================================================= */

function initLoader() {

    const loader = document.getElementById("loader");

    if (!loader) return;

    window.addEventListener("load", () => {

        setTimeout(() => {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(() => {

                if (loader.parentNode) {
                    loader.remove();
                }

            }, 700);

        }, 1000);

    });

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const menuButton =
        document.querySelector(".mobile-menu");

    const menu =
        document.querySelector(".menu");

    if (!menuButton || !menu) return;

    menuButton.addEventListener("click", () => {

        menu.classList.toggle("show");
        menu.classList.toggle("active");
        menuButton.classList.toggle("active");

    });


    document
        .querySelectorAll(".menu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                menu.classList.remove("show");
                menu.classList.remove("active");
                menuButton.classList.remove("active");

            });

        });

}


/* =========================================================
   SCROLL TOP
   ========================================================= */

function initScrollTop() {

    const button =
        document.getElementById("scrollTop");

    if (!button) return;

    button.style.display = "none";

    window.addEventListener("scroll", () => {

        if (window.scrollY > 350) {

            button.style.display = "block";
            button.classList.add("show");

        } else {

            button.style.display = "none";
            button.classList.remove("show");

        }

    });


    button.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   YEAR
   ========================================================= */

function initYear() {

    document
        .querySelectorAll("[data-current-year]")
        .forEach(element => {

            element.textContent =
                new Date().getFullYear();

        });

}


/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function initImageFallback() {

    document
        .querySelectorAll("img")
        .forEach(image => {

            image.addEventListener("error", () => {

                if (
                    image.dataset.fallbackApplied === "true"
                ) {
                    return;
                }

                image.dataset.fallbackApplied = "true";

                image.src = "logo.png";

            });

        });

}


/* =========================================================
   SMOOTH ANCHOR LINKS
   ========================================================= */

function initSmoothLinks() {

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const id =
                    link.getAttribute("href");

                if (!id || id === "#") return;

                const target =
                    document.querySelector(id);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            });

        });

}


/* =========================================================
   FIREBASE READY CHECK
   ========================================================= */

function firebaseReady() {

    return (
        typeof firebase !== "undefined" &&
        firebase.apps &&
        firebase.apps.length > 0
    );

}


/* =========================================================
   FIRESTORE
   ========================================================= */

function getDB() {

    if (!firebaseReady()) {
        return null;
    }

    try {
        return firebase.firestore();
    } catch (error) {

        console.error(
            "Firestore initialization error:",
            error
        );

        return null;
    }

}


/* =========================================================
   FIREBASE AUTH
   ========================================================= */

function getAuth() {

    if (!firebaseReady()) {
        return null;
    }

    try {
        return firebase.auth();
    } catch (error) {

        console.error(
            "Firebase Auth error:",
            error
        );

        return null;
    }

}


/* =========================================================
   CURRENT USER
   ========================================================= */

function getCurrentUser() {

    const auth = getAuth();

    if (!auth) {
        return null;
    }

    return auth.currentUser || null;

}


/* =========================================================
   REQUIRE LOGIN
   ========================================================= */

function requireLogin() {

    const user = getCurrentUser();

    if (user) {
        return true;
    }

    showToast("Please login first.");

    setTimeout(() => {

        window.location.href = "login.html";

    }, 700);

    return false;

}


/* =========================================================
   AUTH STATE
   ========================================================= */

function initAuthState() {

    const auth = getAuth();

    if (!auth) return;

    auth.onAuthStateChanged(user => {

        updateLoginNavigation(user);

    });

}


/* =========================================================
   LOGIN NAVIGATION
   ========================================================= */

function updateLoginNavigation(user) {

    const loginNav =
        document.getElementById("loginNav");

    const loginNavItem =
        document.getElementById("loginNavItem");

    if (!loginNav || !loginNavItem) return;


    if (user) {

        loginNav.href = "javascript:void(0)";
        loginNav.title = "Logged in";

        loginNav.innerHTML = `
            <i class="fas fa-user-check"></i>
            <span>Account</span>
        `;

        loginNav.onclick = () => {

            showToast(
                user.displayName
                    ? `Welcome, ${user.displayName}`
                    : "You are logged in."
            );

        };

    } else {

        loginNav.href = "login.html";

        loginNav.innerHTML = `
            <i class="fas fa-right-to-bracket"></i>
            <span>Login</span>
        `;

        loginNav.onclick = null;

    }

}


/* =========================================================
   LOAD BOOKS
   ========================================================= */

async function loadBooks() {

    /*
     * Primary source:
     * books.json
     *
     * This matches the structure already used
     * by your current website.
     */

    try {

        const response =
            await fetch(
                "./books.json?cache=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "books.json must contain an array."
            );

        }


        allBooks =
            data.map(normalizeBook);


        filteredBooks =
            [...allBooks];


        window.allBooks =
            allBooks;

        window.filteredBooks =
            filteredBooks;


        updateBookCounter();

        displayBooks(filteredBooks);

        latestBook();

        preloadBookCovers();


        console.log(
            "Chishti Library books loaded:",
            allBooks.length
        );


    } catch (error) {

        console.error(
            "Books loading error:",
            error
        );


        /*
         * If books.json fails, try Firebase
         * as a secondary source.
         */

        const firebaseLoaded =
            await loadBooksFromFirebase();


        if (!firebaseLoaded) {

            showBooksError();

        }

    }

}


/* =========================================================
   FIREBASE BOOK LOADER
   ========================================================= */

async function loadBooksFromFirebase() {

    const db = getDB();

    if (!db) {
        return false;
    }


    try {

        const snapshot =
            await db
                .collection("books")
                .get();


        const books = [];


        snapshot.forEach(doc => {

            books.push(
                normalizeBook({
                    ...doc.data(),
                    firestoreId: doc.id
                })
            );

        });


        allBooks = books;

        filteredBooks = [...allBooks];

        window.allBooks = allBooks;
        window.filteredBooks = filteredBooks;


        updateBookCounter();

        displayBooks(filteredBooks);

        latestBook();

        preloadBookCovers();


        console.log(
            "Firebase books loaded:",
            allBooks.length
        );


        return true;


    } catch (error) {

        console.error(
            "Firebase book loading error:",
            error
        );

        return false;

    }

}


/* =========================================================
   NORMALIZE BOOK
   ========================================================= */

function normalizeBook(book) {

    if (!book || typeof book !== "object") {
        return {};
    }


    return {

        ...book,

        title:
            book.title ||
            book.name ||
            "Untitled Book",

        author:
            book.author ||
            book.authorName ||
            "Unknown Author",

        category:
            book.category ||
            book.type ||
            "",

        description:
            book.description ||
            book.desc ||
            "",

        cover:
            book.cover ||
            book.coverUrl ||
            book.image ||
            "logo.png",

        pdf:
            book.pdf ||
            book.pdfUrl ||
            book.file ||
            "",

        language:
            book.language ||
            "",

        id:
            book.id ||
            book.bookId ||
            book.slug ||
            book.firestoreId ||
            "",

        likes:
            getNumber(book.likes),

        views:
            getNumber(book.views),

        reads:
            getNumber(book.reads),

        downloads:
            getNumber(book.downloads)

    };

}


/* =========================================================
   SHOW BOOK ERROR
   ========================================================= */

function showBooksError() {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="books-error">

            <i class="fa-solid fa-triangle-exclamation"></i>

            <h3>
                Books could not be loaded
            </h3>

            <p>
                Please check your books.json file
                or Firebase connection.
            </p>

        </div>

    `;

}


/* =========================================================
   BOOK COUNTER
   ========================================================= */

function updateBookCounter() {

    const counter =
        document.getElementById(
            "bookCounter"
        );

    if (!counter) return;


    animateNumber(
        counter,
        allBooks.length
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

                <i class="fa-solid fa-book-open"></i>

                <h3>
                    No books found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    books.forEach((book, index) => {

        const card =
            createBookCard(
                book,
                index
            );


        container.appendChild(card);


        requestAnimationFrame(() => {

            setTimeout(() => {

                card.classList.add(
                    "book-visible",
                    "visible"
                );

            }, index * 35);

        });

    });

}


/* =========================================================
   CREATE BOOK CARD
   ========================================================= */

function createBookCard(book, index = 0) {

    const card =
        document.createElement("div");


    card.className =
        "book-card animated-book-card book-result";


    const title =
        book.title ||
        "Untitled Book";


    const author =
        book.author ||
        "Unknown Author";


    const category =
        book.category ||
        "";


    const cover =
        book.cover ||
        "logo.png";


    const pdf =
        book.pdf ||
        "";


    const bookId =
        getBookId(book);


    card.dataset.bookId =
        bookId;


    card.dataset.id =
        bookId;


    card.innerHTML = `

        <div class="book-image-wrap">

            <img
                src="${safeAttributeUrl(cover)}"
                alt="${escapeHtml(title)}"
                class="book-cover"
                loading="lazy"
            >

        </div>


        <div class="book-card-content">

            <h3>
                ${escapeHtml(title)}
            </h3>


            <p class="book-author">

                <i class="fa-solid fa-user"></i>

                ${escapeHtml(author)}

            </p>


            ${
                category
                ? `
                    <p class="book-category">

                        <i class="fa-solid fa-layer-group"></i>

                        ${escapeHtml(category)}

                    </p>
                `
                : ""
            }


            <div class="book-buttons">

                <a
                    href="${safeAttributeUrl(
                        getReaderUrl(bookId)
                    )}"
                    class="btn book-read-btn"
                    data-reader-link="true"
                    data-book-id="${escapeHtml(bookId)}"
                >

                    <i class="fa-solid fa-book-open"></i>

                    Read

                </a>


                ${
                    pdf
                    ? `
                        <a
                            href="${safeAttributeUrl(pdf)}"
                            class="btn book-download-btn"
                            download
                        >

                            <i class="fa-solid fa-download"></i>

                            PDF

                        </a>
                    `
                    : ""
                }


            </div>


            <div class="book-social-actions">

                <button
                    type="button"
                    class="like-book"
                    data-book-id="${escapeHtml(bookId)}"
                    title="Like this book"
                >

                    <i class="fa-regular fa-heart"></i>

                    <span>
                        ${getNumber(book.likes)}
                    </span>

                </button>


                <button
                    type="button"
                    class="comment-book"
                    data-book-id="${escapeHtml(bookId)}"
                    title="Comments"
                >

                    <i class="fa-regular fa-comment"></i>

                    <span>
                        Comments
                    </span>

                </button>


                <button
                    type="button"
                    class="share-book"
                    data-book-id="${escapeHtml(bookId)}"
                    title="Share"
                >

                    <i class="fa-solid fa-share-nodes"></i>

                    <span>
                        Share
                    </span>

                </button>

            </div>

        </div>

    `;


    const image =
        card.querySelector("img");


    if (image) {

        image.addEventListener(
            "error",
            () => {

                if (
                    image.dataset.fallbackApplied
                ) {
                    return;
                }

                image.dataset.fallbackApplied =
                    "true";

                image.src =
                    "logo.png";

            }
        );

    }


    const readButton =
        card.querySelector(
            ".book-read-btn"
        );


    if (readButton) {

        readButton.addEventListener(
            "click",
            () => {

                incrementLocalCounter(
                    "reads"
                );


                incrementBookStat(
                    bookId,
                    "reads"
                );

            }
        );

    }


    const downloadButton =
        card.querySelector(
            ".book-download-btn"
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => {

                incrementLocalCounter(
                    "downloads"
                );


                incrementBookStat(
                    bookId,
                    "downloads"
                );

            }
        );

    }


    return card;

}


/* =========================================================
   READER URL
   ========================================================= */

function getReaderUrl(bookId) {

    const readerPage =
        window.CHISHTI_READER_PAGE ||
        "reader.html";


    return (
        readerPage +
        "?book=" +
        encodeURIComponent(
            bookId
        )
    );

}


/* =========================================================
   PRELOAD COVERS
   ========================================================= */

function preloadBookCovers() {

    if (!Array.isArray(allBooks)) {
        return;
    }


    allBooks.forEach(book => {

        if (!book.cover) return;


        const image =
            new Image();


        image.src =
            book.cover;

    });

}


/* =========================================================
   SEARCH INIT
   ========================================================= */

function initSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );

    if (!input) return;


    input.addEventListener(
        "input",
        debounce(() => {

            searchBooks();

        }, 150)
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                input.value = "";

                searchBooks();

                input.blur();

            }

        }
    );

}


/* =========================================================
   SEARCH BOOKS
   ========================================================= */

function searchBooks() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const query =
        normalize(
            input.value
        );


    if (!query) {

        filteredBooks =
            [...allBooks];

        window.filteredBooks =
            filteredBooks;

        displayBooks(
            filteredBooks
        );

        return;

    }


    const words =
        query
            .split(/\s+/)
            .filter(Boolean);


    filteredBooks =
        allBooks
            .map(book => {

                const title =
                    normalize(book.title);

                const author =
                    normalize(book.author);

                const category =
                    normalize(book.category);

                const language =
                    normalize(book.language);

                const description =
                    normalize(book.description);


                let score = 0;


                if (
                    title === query
                ) {
                    score += 150;
                }


                if (
                    title.startsWith(query)
                ) {
                    score += 90;
                }


                if (
                    title.includes(query)
                ) {
                    score += 70;
                }


                if (
                    author.includes(query)
                ) {
                    score += 40;
                }


                if (
                    category.includes(query)
                ) {
                    score += 30;
                }


                if (
                    language.includes(query)
                ) {
                    score += 20;
                }


                if (
                    description.includes(query)
                ) {
                    score += 15;
                }


                words.forEach(word => {

                    if (
                        title.includes(word)
                    ) {
                        score += 25;
                    }


                    if (
                        author.includes(word)
                    ) {
                        score += 15;
                    }


                    if (
                        category.includes(word)
                    ) {
                        score += 10;
                    }


                    if (
                        description.includes(word)
                    ) {
                        score += 5;
                    }

                });


                return {
                    book,
                    score
                };

            })
            .filter(
                result =>
                    result.score > 0
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .map(
                result =>
                    result.book
            );


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );

}


/* =========================================================
   CATEGORY INIT
   ========================================================= */

function initCategories() {

    document
        .querySelectorAll(".category")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.dataset.category ||
                        button.textContent.trim();


                    filterBooks(
                        category,
                        button
                    );

                }
            );

        });

}


/* =========================================================
   FILTER BOOKS
   ========================================================= */

function filterBooks(
    category = "All",
    button = null
) {

    const selected =
        normalize(
            category
        );


    updateCategoryButtons(
        selected,
        button
    );


    if (
        selected === "all"
    ) {

        filteredBooks =
            [...allBooks];

    } else {

        filteredBooks =
            allBooks.filter(book => {

                const bookCategory =
                    normalize(
                        book.category
                    );


                return (
                    bookCategory === selected ||
                    bookCategory.includes(selected) ||
                    selected.includes(bookCategory)
                );

            });

    }


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );

}


/* =========================================================
   CATEGORY BUTTON STATE
   ========================================================= */

function updateCategoryButtons(
    selected,
    clickedButton = null
) {

    const buttons =
        document.querySelectorAll(
            ".category"
        );


    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );

    });


    if (clickedButton) {

        clickedButton.classList.add(
            "active"
        );

        return;

    }


    buttons.forEach(button => {

        const value =
            normalize(
                button.dataset.category ||
                button.textContent
            );


        if (
            value === selected
        ) {

            button.classList.add(
                "active"
            );

        }

    });

}


/* =========================================================
   END PART 1
   ========================================================= */
/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS — FINAL COMPLETE VERSION
   PART 2 / 4
   ========================================================= */


/* =========================================================
   SORT BUTTON INIT
   ========================================================= */

function initSortButtons() {

    document
        .querySelectorAll(".sort-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const onclick =
                        button.getAttribute(
                            "onclick"
                        ) || "";


                    const match =
                        onclick.match(
                            /sortBooks\(['"]([^'"]+)['"]\)/
                        );


                    if (match) {

                        sortBooks(
                            match[1]
                        );

                    }

                }
            );

        });

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function sortBooks(type = "latest") {

    let books =
        Array.isArray(filteredBooks)
            ? [...filteredBooks]
            : [...allBooks];


    switch (type) {

        case "latest":

            books.sort(
                (a, b) =>
                    getBookDate(b) -
                    getBookDate(a)
            );

            break;


        case "oldest":

            books.sort(
                (a, b) =>
                    getBookDate(a) -
                    getBookDate(b)
            );

            break;


        case "liked":

            books.sort(
                (a, b) =>
                    getNumber(b.likes) -
                    getNumber(a.likes)
            );

            break;


        case "popular":

            books.sort(
                (a, b) =>
                    getPopularity(b) -
                    getPopularity(a)
            );

            break;

    }


    filteredBooks =
        books;


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );


    updateSortButtons(
        type
    );

}


/* =========================================================
   SORT BUTTON STATE
   ========================================================= */

function updateSortButtons(
    activeType
) {

    document
        .querySelectorAll(".sort-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );


            const onclick =
                button.getAttribute(
                    "onclick"
                ) || "";


            if (
                onclick.includes(
                    `'${activeType}'`
                ) ||
                onclick.includes(
                    `"${activeType}"`
                )
            ) {

                button.classList.add(
                    "active"
                );

            }

        });

}


/* =========================================================
   BOOK DATE
   ========================================================= */

function getBookDate(book) {

    if (!book) {
        return 0;
    }


    const values = [

        book.date,

        book.createdAt,

        book.created_at,

        book.timestamp,

        book.publishedAt,

        book.publishDate,

        book.uploadedAt

    ];


    for (
        const value of values
    ) {

        const result =
            parseDateValue(
                value
            );


        if (
            result > 0
        ) {

            return result;

        }

    }


    return 0;

}


/* =========================================================
   PARSE DATE
   ========================================================= */

function parseDateValue(value) {

    if (!value) {
        return 0;
    }


    if (
        typeof value === "object"
    ) {

        if (
            typeof value.toDate ===
            "function"
        ) {

            const date =
                value.toDate();


            const time =
                date.getTime();


            return Number.isFinite(time)
                ? time
                : 0;

        }


        if (
            typeof value.seconds ===
            "number"
        ) {

            return (
                value.seconds * 1000
            );

        }

    }


    if (
        typeof value === "number"
    ) {

        /*
         * Supports both milliseconds
         * and Unix seconds.
         */

        if (
            value < 10000000000
        ) {

            return value * 1000;

        }

        return value;

    }


    const date =
        new Date(value);


    const time =
        date.getTime();


    return Number.isFinite(time)
        ? time
        : 0;

}


/* =========================================================
   POPULARITY
   ========================================================= */

function getPopularity(book) {

    if (!book) {
        return 0;
    }


    return (

        getNumber(book.views) +

        (
            getNumber(book.reads) * 2
        ) +

        getNumber(book.downloads) +

        (
            getNumber(book.likes) * 3
        )

    );

}


/* =========================================================
   LATEST BOOK
   ========================================================= */

function latestBook() {

    if (
        !Array.isArray(allBooks) ||
        !allBooks.length
    ) {
        return;
    }


    let latest =
        allBooks.find(
            book =>
                book.latest === true
        );


    if (!latest) {

        latest =
            [...allBooks]
                .sort(
                    (a, b) =>
                        getBookDate(b) -
                        getBookDate(a)
                )[0];

    }


    if (!latest) {
        return;
    }


    const container =
        document.querySelector(
            ".latest-book-card"
        );


    if (!container) {
        return;
    }


    const image =
        container.querySelector(
            ".book-image img"
        );


    const title =
        container.querySelector(
            ".book-info h2"
        );


    const author =
        container.querySelector(
            ".book-info h3"
        );


    const description =
        container.querySelector(
            ".book-info p"
        );


    const readButton =
        container.querySelector(
            ".read-book"
        );


    const buttons =
        container.querySelectorAll(
            ".book-info .btn"
        );


    const pdfButton =
        Array.from(buttons)
            .find(
                button =>
                    !button.classList.contains(
                        "read-book"
                    )
            );


    const latestTitle =
        latest.title ||
        "Untitled Book";


    const latestAuthor =
        latest.author ||
        "Unknown Author";


    const latestCover =
        latest.cover ||
        "logo.png";


    const latestPdf =
        latest.pdf ||
        "";


    const bookId =
        getBookId(
            latest
        );


    if (image) {

        image.src =
            latestCover;

        image.alt =
            latestTitle;

        image.onerror =
            () => {

                image.src =
                    "logo.png";

            };

    }


    if (title) {

        title.textContent =
            latestTitle;

    }


    if (author) {

        author.textContent =
            latestAuthor;

    }


    if (description) {

        description.textContent =
            latest.description ||
            "A beautiful Islamic literary work from Chishti Library.";

    }


    if (readButton) {

        readButton.href =
            getReaderUrl(
                bookId
            );

        readButton.dataset.bookId =
            bookId;

        readButton.removeAttribute(
            "target"
        );

    }


    if (pdfButton) {

        if (latestPdf) {

            pdfButton.href =
                latestPdf;

            pdfButton.style.display =
                "";

        } else {

            pdfButton.style.display =
                "none";

        }

    }


    const badge =
        container.querySelector(
            ".badge"
        );


    if (badge) {

        badge.textContent =
            latest.latest === true
                ? "NEW RELEASE"
                : "LATEST RELEASE";

    }

}


/* =========================================================
   BOOK ID
   ========================================================= */

function getBookId(book) {

    if (!book) {
        return "";
    }


    const id =
        book.firestoreId ||
        book.id ||
        book.bookId ||
        book.slug;


    if (id) {

        return String(
            id
        );

    }


    if (book.title) {

        return String(
            book.title
        )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            "");

    }


    return "";

}


/* =========================================================
   BOOK LOOKUP
   ========================================================= */

function findBookById(
    bookId
) {

    if (!bookId) {
        return null;
    }


    return (
        allBooks.find(
            book =>
                String(
                    getBookId(book)
                ) ===
                String(bookId)
        ) || null
    );

}


/* =========================================================
   FIREBASE BOOK STAT
   ========================================================= */

async function incrementBookStat(
    bookId,
    field
) {

    const allowedFields = [

        "views",
        "reads",
        "downloads",
        "likes"

    ];


    if (
        !bookId ||
        !allowedFields.includes(field)
    ) {

        return;

    }


    const db =
        getDB();


    if (!db) {
        return;
    }


    try {

        await db
            .collection("books")
            .doc(bookId)
            .set({

                [field]:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            }, {

                merge: true

            });


    } catch (error) {

        console.warn(
            "Book stat update failed:",
            error
        );

    }

}


/* =========================================================
   LOCAL COUNTER
   ========================================================= */

function incrementLocalCounter(
    type
) {

    const key =
        "chishti_" +
        type;


    const current =
        Number(
            localStorage.getItem(
                key
            )
        ) || 0;


    localStorage.setItem(
        key,
        String(
            current + 1
        )
    );

}


/* =========================================================
   LIKE EVENT
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".like-book"
            );


        if (!button) return;


        likeBook(
            button
        );

    }
);


/* =========================================================
   LIKE BOOK
   ========================================================= */

async function likeBook(
    button
) {

    if (
        button.dataset.loading ===
        "true"
    ) {
        return;
    }


    const user =
        getCurrentUser();


    if (!user) {

        requireLogin();

        return;

    }


    const bookId =
        button.dataset.bookId;


    if (!bookId) {
        return;
    }


    const db =
        getDB();


    if (!db) {

        showToast(
            "Like system is unavailable."
        );

        return;

    }


    button.dataset.loading =
        "true";


    try {

        const bookRef =
            db
                .collection("books")
                .doc(bookId);


        const likeRef =
            bookRef
                .collection("likes")
                .doc(user.uid);


        const snapshot =
            await likeRef.get();


        const count =
            button.querySelector(
                "span"
            );


        const icon =
            button.querySelector(
                "i"
            );


        let currentCount =
            getNumber(
                count
                    ? count.textContent
                    : 0
            );


        if (
            snapshot.exists
        ) {

            await likeRef.delete();


            await bookRef.set({

                likes:
                    firebase.firestore
                        .FieldValue
                        .increment(-1)

            }, {

                merge: true

            });


            currentCount =
                Math.max(
                    0,
                    currentCount - 1
                );


            button.classList.remove(
                "liked"
            );


            if (icon) {

                icon.className =
                    "fa-regular fa-heart";

            }


            showToast(
                "Like removed."
            );


        } else {

            await likeRef.set({

                uid:
                    user.uid,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


            await bookRef.set({

                likes:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            }, {

                merge: true

            });


            currentCount++;


            button.classList.add(
                "liked"
            );


            button.classList.add(
                "heart-pop"
            );


            if (icon) {

                icon.className =
                    "fa-solid fa-heart";

            }


            setTimeout(() => {

                button.classList.remove(
                    "heart-pop"
                );

            }, 500);


            showToast(
                "Book liked ❤️"
            );

        }


        if (count) {

            count.textContent =
                currentCount;

        }


        /*
         * Update local book data too.
         */

        const localBook =
            findBookById(
                bookId
            );


        if (localBook) {

            localBook.likes =
                currentCount;

        }


    } catch (error) {

        console.error(
            "Like error:",
            error
        );


        showToast(
            "Unable to update like."
        );

    } finally {

        button.dataset.loading =
            "false";

    }

}


/* =========================================================
   END PART 2
   ========================================================= */
/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS — FINAL COMPLETE VERSION
   PART 3 / 4
   ========================================================= */


/* =========================================================
   COMMENT BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".comment-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        const book =
            findBookById(
                bookId
            );


        if (!book) {

            showToast(
                "Book not found."
            );

            return;

        }


        openBookComments(
            book
        );

    }
);


/* =========================================================
   OPEN COMMENTS
   ========================================================= */

async function openBookComments(
    book
) {

    if (
        !requireLogin()
    ) {
        return;
    }


    const oldModal =
        document.getElementById(
            "bookCommentsModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const bookId =
        getBookId(book);


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "bookCommentsModal";


    modal.className =
        "book-comments-modal";


    modal.innerHTML = `

        <div class="comments-panel">

            <div class="comments-top">

                <div>

                    <small>
                        CHISHTI LIBRARY
                    </small>

                    <h2>

                        <i class="fa-solid fa-comments"></i>

                        Comments

                    </h2>

                    <p>
                        ${escapeHtml(
                            book.title ||
                            "Book"
                        )}
                    </p>

                </div>


                <button
                    type="button"
                    class="comments-close"
                    aria-label="Close comments"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div
                class="comments-list"
                id="dynamicCommentsList"
            >

                <div class="comments-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading comments...

                </div>

            </div>


            <div class="comment-reactions">

                <button
                    type="button"
                    data-emoji="❤️"
                    aria-label="Heart"
                >
                    ❤️
                </button>

                <button
                    type="button"
                    data-emoji="😍"
                    aria-label="Love"
                >
                    😍
                </button>

                <button
                    type="button"
                    data-emoji="🤲"
                    aria-label="Dua"
                >
                    🤲
                </button>

                <button
                    type="button"
                    data-emoji="📚"
                    aria-label="Books"
                >
                    📚
                </button>

                <button
                    type="button"
                    data-emoji="🌙"
                    aria-label="Moon"
                >
                    🌙
                </button>

                <button
                    type="button"
                    data-emoji="✨"
                    aria-label="Sparkles"
                >
                    ✨
                </button>

            </div>


            <form
                class="comment-form-new"
                id="commentFormNew"
            >

                <input
                    id="commentInputNew"
                    type="text"
                    maxlength="500"
                    placeholder="Write a comment..."
                    autocomplete="off"
                    required
                >


                <button
                    type="submit"
                    aria-label="Send comment"
                >

                    <i class="fa-solid fa-paper-plane"></i>

                </button>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    requestAnimationFrame(() => {

        modal.classList.add(
            "show"
        );

    });


    const closeButton =
        modal.querySelector(
            ".comments-close"
        );


    closeButton.addEventListener(
        "click",
        () => {

            closeBookComments(
                modal
            );

        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeBookComments(
                    modal
                );

            }

        }
    );


    modal
        .querySelectorAll(
            "[data-emoji]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        modal.querySelector(
                            "#commentInputNew"
                        );


                    if (!input) return;


                    input.value +=
                        button.dataset.emoji;


                    input.focus();

                }
            );

        });


    const form =
        modal.querySelector(
            "#commentFormNew"
        );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                submitBookComment(
                    bookId,
                    modal
                );

            }
        );

    }


    await loadBookComments(
        bookId,
        modal
    );

}


/* =========================================================
   CLOSE COMMENTS
   ========================================================= */

function closeBookComments(
    modal
) {

    if (!modal) return;


    modal.classList.remove(
        "show"
    );


    setTimeout(() => {

        if (
            modal.parentNode
        ) {

            modal.remove();

        }

    }, 300);

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

async function loadBookComments(
    bookId,
    modal
) {

    const list =
        modal.querySelector(
            "#dynamicCommentsList"
        );


    if (!list) return;


    const db =
        getDB();


    if (!db) {

        list.innerHTML = `

            <div class="comments-empty">

                <i class="fa-solid fa-cloud"></i>

                <h4>
                    Comments unavailable
                </h4>

                <p>
                    Firebase is not connected.
                </p>

            </div>

        `;

        return;

    }


    try {

        const snapshot =
            await db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(100)
                .get();


        if (
            snapshot.empty
        ) {

            list.innerHTML = `

                <div class="comments-empty">

                    <i class="fa-regular fa-comment-dots"></i>

                    <h4>
                        No comments yet
                    </h4>

                    <p>
                        Be the first to share your thoughts.
                    </p>

                </div>

            `;

            return;

        }


        list.innerHTML = "";


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                list.appendChild(
                    createCommentElement(
                        data
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );


        list.innerHTML = `

            <div class="comments-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h4>
                    Could not load comments
                </h4>

                <p>
                    Please try again.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   CREATE COMMENT ELEMENT
   ========================================================= */

function createCommentElement(
    comment
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "comment-item";


    const name =
        comment.userName ||
        comment.displayName ||
        "Library Member";


    const text =
        comment.text ||
        "";


    const avatar =
        comment.photoURL ||
        "";


    const date =
        formatDate(
            comment.createdAt
        );


    item.innerHTML = `

        <div class="comment-avatar">

            ${
                avatar
                ? `
                    <img
                        src="${safeAttributeUrl(avatar)}"
                        alt=""
                    >
                `
                : `
                    <i class="fa-solid fa-user"></i>
                `
            }

        </div>


        <div class="comment-content">

            <div class="comment-meta">

                <strong>
                    ${escapeHtml(name)}
                </strong>

                <span>
                    ${escapeHtml(date)}
                </span>

            </div>


            <p>
                ${escapeHtml(text)}
            </p>

        </div>

    `;


    const image =
        item.querySelector(
            "img"
        );


    if (image) {

        image.onerror =
            () => {

                image.remove();

            };

    }


    return item;

}


/* =========================================================
   SUBMIT COMMENT
   ========================================================= */

async function submitBookComment(
    bookId,
    modal
) {

    const user =
        getCurrentUser();


    if (!user) {

        requireLogin();

        return;

    }


    const input =
        modal.querySelector(
            "#commentInputNew"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Please write a comment."
        );

        return;

    }


    if (
        text.length > 500
    ) {

        showToast(
            "Comment is too long."
        );

        return;

    }


    const db =
        getDB();


    if (!db) {

        showToast(
            "Comments are unavailable."
        );

        return;

    }


    const form =
        modal.querySelector(
            "#commentFormNew"
        );


    const submitButton =
        form
            ? form.querySelector(
                "button"
            )
            : null;


    if (submitButton) {

        submitButton.disabled =
            true;

    }


    try {

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Library Member";


        await db
            .collection("books")
            .doc(bookId)
            .collection("comments")
            .add({

                uid:
                    user.uid,

                userName:
                    name,

                displayName:
                    user.displayName ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                text:
                    text,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        input.value = "";


        showToast(
            "Comment posted."
        );


        await loadBookComments(
            bookId,
            modal
        );


    } catch (error) {

        console.error(
            "Comment submit error:",
            error
        );


        showToast(
            "Unable to post comment."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

        }

    }

}


/* =========================================================
   EXISTING STATIC COMMENT MODAL
   ========================================================= */

function initCommentsModal() {

    const modal =
        document.getElementById(
            "commentModal"
        );


    const closeButton =
        document.getElementById(
            "closeComments"
        );


    if (!modal) return;


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "show"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }
    );


    const input =
        document.getElementById(
            "commentInput"
        );


    const counter =
        document.getElementById(
            "commentCounter"
        );


    if (
        input &&
        counter
    ) {

        input.addEventListener(
            "input",
            () => {

                counter.textContent =
                    `${input.value.length}/500`;

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
            event => {

                event.preventDefault();

                showToast(
                    "Please open comments from a book."
                );

            }
        );

    }

}


/* =========================================================
   SHARE BOOK BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".share-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        const book =
            findBookById(
                bookId
            );


        if (!book) return;


        openSharePopup(
            book
        );

    }
);


/* =========================================================
   SHARE POPUP
   ========================================================= */

let currentShareBook = null;


function openSharePopup(
    book
) {

    currentShareBook =
        book;


    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.classList.add(
        "show"
    );


    popup.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeSharePopup() {

    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.classList.remove(
        "show"
    );


    popup.setAttribute(
        "aria-hidden",
        "true"
    );


    currentShareBook =
        null;

}


/* =========================================================
   SHARE INIT
   ========================================================= */

function initSharePopup() {

    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.addEventListener(
        "click",
        event => {

            if (
                event.target === popup
            ) {

                closeSharePopup();

            }

        }
    );


    popup
        .querySelectorAll(
            ".share-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    shareBook(
                        button.dataset.share
                    );

                }
            );

        });


    const copyButton =
        document.getElementById(
            "copyBookLink"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copyCurrentBookLink
        );

    }

}


/* =========================================================
   BOOK SHARE URL
   ========================================================= */

function getBookShareUrl(
    book
) {

    const bookId =
        getBookId(
            book
        );


    const url =
        new URL(
            window.location.href
        );


    url.search = "";


    url.hash =
        "";


    url.searchParams.set(
        "book",
        bookId
    );


    return url.toString();

}


/* =========================================================
   SHARE BOOK
   ========================================================= */

function shareBook(
    type
) {

    if (
        !currentShareBook
    ) {
        return;
    }


    const book =
        currentShareBook;


    const url =
        getBookShareUrl(
            book
        );


    const title =
        book.title ||
        "Chishti Library";


    const text =
        `Read "${title}" on Chishti Library`;


    let shareUrl =
        "";


    switch (type) {

        case "whatsapp":

            shareUrl =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    text +
                    " " +
                    url
                );

            break;


        case "facebook":

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    url
                );

            break;


        case "telegram":

            shareUrl =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    text
                );

            break;


        case "twitter":

            shareUrl =
                "https://twitter.com/intent/tweet?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    text
                );

            break;

    }


    if (shareUrl) {

        window.open(
            shareUrl,
            "_blank",
            "noopener,noreferrer"
        );

    }

}


/* =========================================================
   COPY BOOK LINK
   ========================================================= */

async function copyCurrentBookLink() {

    if (
        !currentShareBook
    ) {
        return;
    }


    const url =
        getBookShareUrl(
            currentShareBook
        );


    try {

        if (
            navigator.clipboard
        ) {

            await navigator.clipboard.writeText(
                url
            );

        } else {

            fallbackCopyText(
                url
            );

        }


        showToast(
            "🔗 Book link copied!"
        );


    } catch (error) {

        console.error(
            "Copy link error:",
            error
        );


        showToast(
            "Unable to copy link."
        );

    }

}


/* =========================================================
   FALLBACK COPY
   ========================================================= */

function fallbackCopyText(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    document.execCommand(
        "copy"
    );


    textarea.remove();

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


    const db =
        getDB();


    if (!db) {

        counter.textContent =
            "0";

        return;

    }


    try {

        const ref =
            db
                .collection("counter")
                .doc("visitors");


        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        if (!alreadyCounted) {

            await ref.set({

                count:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            }, {

                merge: true

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        const snapshot =
            await ref.get();


        const total =
            getNumber(
                snapshot.exists
                    ? snapshot.data()?.count
                    : 0
            );


        animateNumber(
            counter,
            total
        );


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );


        counter.textContent =
            "0";

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "chishtiToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "chishtiToast";


        toast.className =
            "chishti-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.chishtiToastTimer
    );


    window.chishtiToastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


/* =========================================================
   END PART 3
   ========================================================= */
/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS — FINAL COMPLETE VERSION
   PART 3 / 4
   ========================================================= */


/* =========================================================
   COMMENT BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".comment-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        const book =
            findBookById(
                bookId
            );


        if (!book) {

            showToast(
                "Book not found."
            );

            return;

        }


        openBookComments(
            book
        );

    }
);


/* =========================================================
   OPEN COMMENTS
   ========================================================= */

async function openBookComments(
    book
) {

    if (
        !requireLogin()
    ) {
        return;
    }


    const oldModal =
        document.getElementById(
            "bookCommentsModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const bookId =
        getBookId(book);


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "bookCommentsModal";


    modal.className =
        "book-comments-modal";


    modal.innerHTML = `

        <div class="comments-panel">

            <div class="comments-top">

                <div>

                    <small>
                        CHISHTI LIBRARY
                    </small>

                    <h2>

                        <i class="fa-solid fa-comments"></i>

                        Comments

                    </h2>

                    <p>
                        ${escapeHtml(
                            book.title ||
                            "Book"
                        )}
                    </p>

                </div>


                <button
                    type="button"
                    class="comments-close"
                    aria-label="Close comments"
                >

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <div
                class="comments-list"
                id="dynamicCommentsList"
            >

                <div class="comments-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading comments...

                </div>

            </div>


            <div class="comment-reactions">

                <button
                    type="button"
                    data-emoji="❤️"
                    aria-label="Heart"
                >
                    ❤️
                </button>

                <button
                    type="button"
                    data-emoji="😍"
                    aria-label="Love"
                >
                    😍
                </button>

                <button
                    type="button"
                    data-emoji="🤲"
                    aria-label="Dua"
                >
                    🤲
                </button>

                <button
                    type="button"
                    data-emoji="📚"
                    aria-label="Books"
                >
                    📚
                </button>

                <button
                    type="button"
                    data-emoji="🌙"
                    aria-label="Moon"
                >
                    🌙
                </button>

                <button
                    type="button"
                    data-emoji="✨"
                    aria-label="Sparkles"
                >
                    ✨
                </button>

            </div>


            <form
                class="comment-form-new"
                id="commentFormNew"
            >

                <input
                    id="commentInputNew"
                    type="text"
                    maxlength="500"
                    placeholder="Write a comment..."
                    autocomplete="off"
                    required
                >


                <button
                    type="submit"
                    aria-label="Send comment"
                >

                    <i class="fa-solid fa-paper-plane"></i>

                </button>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    requestAnimationFrame(() => {

        modal.classList.add(
            "show"
        );

    });


    const closeButton =
        modal.querySelector(
            ".comments-close"
        );


    closeButton.addEventListener(
        "click",
        () => {

            closeBookComments(
                modal
            );

        }
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeBookComments(
                    modal
                );

            }

        }
    );


    modal
        .querySelectorAll(
            "[data-emoji]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        modal.querySelector(
                            "#commentInputNew"
                        );


                    if (!input) return;


                    input.value +=
                        button.dataset.emoji;


                    input.focus();

                }
            );

        });


    const form =
        modal.querySelector(
            "#commentFormNew"
        );


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                submitBookComment(
                    bookId,
                    modal
                );

            }
        );

    }


    await loadBookComments(
        bookId,
        modal
    );

}


/* =========================================================
   CLOSE COMMENTS
   ========================================================= */

function closeBookComments(
    modal
) {

    if (!modal) return;


    modal.classList.remove(
        "show"
    );


    setTimeout(() => {

        if (
            modal.parentNode
        ) {

            modal.remove();

        }

    }, 300);

}


/* =========================================================
   LOAD COMMENTS
   ========================================================= */

async function loadBookComments(
    bookId,
    modal
) {

    const list =
        modal.querySelector(
            "#dynamicCommentsList"
        );


    if (!list) return;


    const db =
        getDB();


    if (!db) {

        list.innerHTML = `

            <div class="comments-empty">

                <i class="fa-solid fa-cloud"></i>

                <h4>
                    Comments unavailable
                </h4>

                <p>
                    Firebase is not connected.
                </p>

            </div>

        `;

        return;

    }


    try {

        const snapshot =
            await db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(100)
                .get();


        if (
            snapshot.empty
        ) {

            list.innerHTML = `

                <div class="comments-empty">

                    <i class="fa-regular fa-comment-dots"></i>

                    <h4>
                        No comments yet
                    </h4>

                    <p>
                        Be the first to share your thoughts.
                    </p>

                </div>

            `;

            return;

        }


        list.innerHTML = "";


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                list.appendChild(
                    createCommentElement(
                        data
                    )
                );

            }
        );


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );


        list.innerHTML = `

            <div class="comments-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h4>
                    Could not load comments
                </h4>

                <p>
                    Please try again.
                </p>

            </div>

        `;

    }

}


/* =========================================================
   CREATE COMMENT ELEMENT
   ========================================================= */

function createCommentElement(
    comment
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "comment-item";


    const name =
        comment.userName ||
        comment.displayName ||
        "Library Member";


    const text =
        comment.text ||
        "";


    const avatar =
        comment.photoURL ||
        "";


    const date =
        formatDate(
            comment.createdAt
        );


    item.innerHTML = `

        <div class="comment-avatar">

            ${
                avatar
                ? `
                    <img
                        src="${safeAttributeUrl(avatar)}"
                        alt=""
                    >
                `
                : `
                    <i class="fa-solid fa-user"></i>
                `
            }

        </div>


        <div class="comment-content">

            <div class="comment-meta">

                <strong>
                    ${escapeHtml(name)}
                </strong>

                <span>
                    ${escapeHtml(date)}
                </span>

            </div>


            <p>
                ${escapeHtml(text)}
            </p>

        </div>

    `;


    const image =
        item.querySelector(
            "img"
        );


    if (image) {

        image.onerror =
            () => {

                image.remove();

            };

    }


    return item;

}


/* =========================================================
   SUBMIT COMMENT
   ========================================================= */

async function submitBookComment(
    bookId,
    modal
) {

    const user =
        getCurrentUser();


    if (!user) {

        requireLogin();

        return;

    }


    const input =
        modal.querySelector(
            "#commentInputNew"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) {

        showToast(
            "Please write a comment."
        );

        return;

    }


    if (
        text.length > 500
    ) {

        showToast(
            "Comment is too long."
        );

        return;

    }


    const db =
        getDB();


    if (!db) {

        showToast(
            "Comments are unavailable."
        );

        return;

    }


    const form =
        modal.querySelector(
            "#commentFormNew"
        );


    const submitButton =
        form
            ? form.querySelector(
                "button"
            )
            : null;


    if (submitButton) {

        submitButton.disabled =
            true;

    }


    try {

        const name =
            user.displayName ||
            user.email?.split("@")[0] ||
            "Library Member";


        await db
            .collection("books")
            .doc(bookId)
            .collection("comments")
            .add({

                uid:
                    user.uid,

                userName:
                    name,

                displayName:
                    user.displayName ||
                    "",

                photoURL:
                    user.photoURL ||
                    "",

                text:
                    text,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        input.value = "";


        showToast(
            "Comment posted."
        );


        await loadBookComments(
            bookId,
            modal
        );


    } catch (error) {

        console.error(
            "Comment submit error:",
            error
        );


        showToast(
            "Unable to post comment."
        );


    } finally {

        if (submitButton) {

            submitButton.disabled =
                false;

        }

    }

}


/* =========================================================
   EXISTING STATIC COMMENT MODAL
   ========================================================= */

function initCommentsModal() {

    const modal =
        document.getElementById(
            "commentModal"
        );


    const closeButton =
        document.getElementById(
            "closeComments"
        );


    if (!modal) return;


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                modal.classList.remove(
                    "show"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );

    }


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                modal.classList.remove(
                    "show"
                );

                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

        }
    );


    const input =
        document.getElementById(
            "commentInput"
        );


    const counter =
        document.getElementById(
            "commentCounter"
        );


    if (
        input &&
        counter
    ) {

        input.addEventListener(
            "input",
            () => {

                counter.textContent =
                    `${input.value.length}/500`;

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
            event => {

                event.preventDefault();

                showToast(
                    "Please open comments from a book."
                );

            }
        );

    }

}


/* =========================================================
   SHARE BOOK BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".share-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        const book =
            findBookById(
                bookId
            );


        if (!book) return;


        openSharePopup(
            book
        );

    }
);


/* =========================================================
   SHARE POPUP
   ========================================================= */

let currentShareBook = null;


function openSharePopup(
    book
) {

    currentShareBook =
        book;


    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.classList.add(
        "show"
    );


    popup.setAttribute(
        "aria-hidden",
        "false"
    );

}


function closeSharePopup() {

    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.classList.remove(
        "show"
    );


    popup.setAttribute(
        "aria-hidden",
        "true"
    );


    currentShareBook =
        null;

}


/* =========================================================
   SHARE INIT
   ========================================================= */

function initSharePopup() {

    const popup =
        document.getElementById(
            "sharePopup"
        );


    if (!popup) return;


    popup.addEventListener(
        "click",
        event => {

            if (
                event.target === popup
            ) {

                closeSharePopup();

            }

        }
    );


    popup
        .querySelectorAll(
            ".share-option"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    shareBook(
                        button.dataset.share
                    );

                }
            );

        });


    const copyButton =
        document.getElementById(
            "copyBookLink"
        );


    if (copyButton) {

        copyButton.addEventListener(
            "click",
            copyCurrentBookLink
        );

    }

}


/* =========================================================
   BOOK SHARE URL
   ========================================================= */

function getBookShareUrl(
    book
) {

    const bookId =
        getBookId(
            book
        );


    const url =
        new URL(
            window.location.href
        );


    url.search = "";


    url.hash =
        "";


    url.searchParams.set(
        "book",
        bookId
    );


    return url.toString();

}


/* =========================================================
   SHARE BOOK
   ========================================================= */

function shareBook(
    type
) {

    if (
        !currentShareBook
    ) {
        return;
    }


    const book =
        currentShareBook;


    const url =
        getBookShareUrl(
            book
        );


    const title =
        book.title ||
        "Chishti Library";


    const text =
        `Read "${title}" on Chishti Library`;


    let shareUrl =
        "";


    switch (type) {

        case "whatsapp":

            shareUrl =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    text +
                    " " +
                    url
                );

            break;


        case "facebook":

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(
                    url
                );

            break;


        case "telegram":

            shareUrl =
                "https://t.me/share/url?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    text
                );

            break;


        case "twitter":

            shareUrl =
                "https://twitter.com/intent/tweet?url=" +
                encodeURIComponent(
                    url
                ) +
                "&text=" +
                encodeURIComponent(
                    text
                );

            break;

    }


    if (shareUrl) {

        window.open(
            shareUrl,
            "_blank",
            "noopener,noreferrer"
        );

    }

}


/* =========================================================
   COPY BOOK LINK
   ========================================================= */

async function copyCurrentBookLink() {

    if (
        !currentShareBook
    ) {
        return;
    }


    const url =
        getBookShareUrl(
            currentShareBook
        );


    try {

        if (
            navigator.clipboard
        ) {

            await navigator.clipboard.writeText(
                url
            );

        } else {

            fallbackCopyText(
                url
            );

        }


        showToast(
            "🔗 Book link copied!"
        );


    } catch (error) {

        console.error(
            "Copy link error:",
            error
        );


        showToast(
            "Unable to copy link."
        );

    }

}


/* =========================================================
   FALLBACK COPY
   ========================================================= */

function fallbackCopyText(
    text
) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.left =
        "-9999px";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    document.execCommand(
        "copy"
    );


    textarea.remove();

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


    const db =
        getDB();


    if (!db) {

        counter.textContent =
            "0";

        return;

    }


    try {

        const ref =
            db
                .collection("counter")
                .doc("visitors");


        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        if (!alreadyCounted) {

            await ref.set({

                count:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            }, {

                merge: true

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        const snapshot =
            await ref.get();


        const total =
            getNumber(
                snapshot.exists
                    ? snapshot.data()?.count
                    : 0
            );


        animateNumber(
            counter,
            total
        );


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );


        counter.textContent =
            "0";

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "chishtiToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "chishtiToast";


        toast.className =
            "chishti-toast";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.chishtiToastTimer
    );


    window.chishtiToastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2800);

}


/* =========================================================
   END PART 3
   ========================================================= */
/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS — FINAL COMPLETE VERSION
   PART 4 / 4
   ========================================================= */


/* =========================================================
   CHISHTI AI
   ========================================================= */

function initChat() {

    const chatButton =
        document.getElementById(
            "chatBtn"
        );


    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    const closeButton =
        document.getElementById(
            "closeChat"
        );


    const sendButton =
        document.getElementById(
            "sendButton"
        );


    const input =
        document.getElementById(
            "chatInput"
        );


    const clearButton =
        document.getElementById(
            "clearChat"
        );


    const micButton =
        document.getElementById(
            "micButton"
        );


    const voiceToggle =
        document.getElementById(
            "voiceToggle"
        );


    if (!chatButton || !chatWindow) {
        return;
    }


    /* -----------------------------------------------------
       OPEN CHAT
       ----------------------------------------------------- */

    chatButton.addEventListener(
        "click",
        () => {

            openChat();

        }
    );


    /* -----------------------------------------------------
       CLOSE CHAT
       ----------------------------------------------------- */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            () => {

                closeChatWindow();

            }
        );

    }


    /* -----------------------------------------------------
       SEND
       ----------------------------------------------------- */

    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendChatMessage
        );

    }


    /* -----------------------------------------------------
       ENTER
       ----------------------------------------------------- */

    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendChatMessage();

                }

            }
        );

    }


    /* -----------------------------------------------------
       CLEAR
       ----------------------------------------------------- */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearChatMessages
        );

    }


    /* -----------------------------------------------------
       VOICE INPUT
       ----------------------------------------------------- */

    if (micButton) {

        micButton.addEventListener(
            "click",
            startVoiceInput
        );

    }


    /* -----------------------------------------------------
       VOICE REPLY
       ----------------------------------------------------- */

    if (voiceToggle) {

        voiceToggle.addEventListener(
            "click",
            () => {

                const enabled =
                    localStorage.getItem(
                        "chishtiVoiceReply"
                    ) !== "false";


                localStorage.setItem(
                    "chishtiVoiceReply",
                    String(!enabled)
                );


                updateVoiceToggle();

            }
        );

    }


    updateVoiceToggle();


    /* -----------------------------------------------------
       INITIAL AUTH
       ----------------------------------------------------- */

    initAuthState();


    /* -----------------------------------------------------
       BOOK URL
       ----------------------------------------------------- */

    handleBookQuery();

}


/* =========================================================
   OPEN CHAT
   ========================================================= */

function openChat() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) return;


    chatWindow.classList.add(
        "open"
    );


    chatWindow.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        const input =
            document.getElementById(
                "chatInput"
            );


        if (input) {
            input.focus();
        }

    }, 200);

}


/* =========================================================
   CLOSE CHAT
   ========================================================= */

function closeChatWindow() {

    const chatWindow =
        document.getElementById(
            "chatWindow"
        );


    if (!chatWindow) return;


    chatWindow.classList.remove(
        "open"
    );


    chatWindow.setAttribute(
        "aria-hidden",
        "true"
    );

}


/* =========================================================
   CHAT MESSAGE
   ========================================================= */

function addChatMessage(
    text,
    type = "bot-message"
) {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) return;


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}`;


    message.textContent =
        text;


    messages.appendChild(
        message
    );


    messages.scrollTop =
        messages.scrollHeight;

}


/* =========================================================
   CHAT TYPING
   ========================================================= */

function addTypingMessage() {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) {
        return null;
    }


    const typing =
        document.createElement(
            "div"
        );


    typing.className =
        "message bot-message ai-typing";


    typing.innerHTML = `

        <span>●</span>
        <span>●</span>
        <span>●</span>

    `;


    messages.appendChild(
        typing
    );


    messages.scrollTop =
        messages.scrollHeight;


    return typing;

}


/* =========================================================
   SEND CHAT
   ========================================================= */

async function sendChatMessage() {

    const input =
        document.getElementById(
            "chatInput"
        );


    if (!input) return;


    const text =
        input.value.trim();


    if (!text) return;


    addChatMessage(
        text,
        "user-message"
    );


    input.value =
        "";


    const typing =
        addTypingMessage();


    /*
     * The AI currently uses the local library data.
     *
     * This avoids inventing a fake external AI endpoint.
     *
     * If your existing project has a backend/API,
     * sendChatMessage() is the place to connect it.
     */

    setTimeout(() => {

        if (typing) {
            typing.remove();
        }


        const reply =
            generateLibraryReply(
                text
            );


        addChatMessage(
            reply,
            "bot-message"
        );


        speakAIReply(
            reply
        );

    }, 450);

}


/* =========================================================
   LOCAL LIBRARY AI
   ========================================================= */

function generateLibraryReply(
    question
) {

    const q =
        normalize(
            question
        );


    if (
        q.includes("assalam") ||
        q.includes("salam")
    ) {

        return (
            "Wa Alaikum Assalam 🌙\n\n" +
            "Welcome to Chishti Library. " +
            "Aap books, authors, categories ya " +
            "Islamic literature ke bare mein pooch sakte hain."
        );

    }


    if (
        q.includes("how many") &&
        q.includes("book")
    ) {

        return (
            `Chishti Library mein is waqt ` +
            `${allBooks.length} books available hain. 📚`
        );

    }


    if (
        q.includes("books") ||
        q.includes("book")
    ) {

        const results =
            searchBooksForAI(
                q
            );


        if (results.length) {

            const names =
                results
                    .slice(0, 5)
                    .map(
                        book =>
                            "• " +
                            book.title
                    )
                    .join("\n");


            return (
                "Mujhe library mein ye relevant books mili hain:\n\n" +
                names +
                "\n\n" +
                "Aap kisi specific book ka naam pooch sakte hain."
            );

        }


        return (
            "Aap kis book ke bare mein maloomat chahte hain? " +
            "Book ka naam, author ya category likhein."
        );

    }


    if (
        q.includes("author") ||
        q.includes("writer") ||
        q.includes("scholar")
    ) {

        const authors =
            [
                ...new Set(
                    allBooks
                        .map(
                            book =>
                                book.author
                        )
                        .filter(Boolean)
                )
            ];


        if (authors.length) {

            return (
                "Library mein available authors mein:\n\n" +
                authors
                    .slice(0, 10)
                    .map(
                        author =>
                            "• " + author
                    )
                    .join("\n")
            );

        }


        return (
            "Authors ke bare mein maloomat " +
            "authors section mein available hai."
        );

    }


    const matchingBooks =
        searchBooksForAI(
            q
        );


    if (
        matchingBooks.length
    ) {

        const book =
            matchingBooks[0];


        return (
            `Mujhe "${book.title}" mil gayi hai.\n\n` +
            `Author: ${book.author || "Unknown"}\n` +
            (
                book.category
                    ? `Category: ${book.category}\n`
                    : ""
            ) +
            (
                book.description
                    ? `\n${book.description}`
                    : ""
            )
        );

    }


    return (
        "Main Chishti Library ke books aur library " +
        "information mein aapki madad kar sakta hoon. 📚\n\n" +
        "Aap book name, author, category ya " +
        "\"how many books\" jaisa sawal pooch sakte hain."
    );

}


/* =========================================================
   SEARCH BOOKS FOR AI
   ========================================================= */

function searchBooksForAI(
    query
) {

    const words =
        normalize(query)
            .split(/\s+/)
            .filter(Boolean);


    return allBooks
        .map(book => {

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


            let score = 0;


            words.forEach(word => {

                if (
                    title.includes(word)
                ) {

                    score += 10;

                }


                if (
                    author.includes(word)
                ) {

                    score += 6;

                }


                if (
                    category.includes(word)
                ) {

                    score += 4;

                }

            });


            return {
                book,
                score
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

}


/* =========================================================
   CLEAR CHAT
   ========================================================= */

function clearChatMessages() {

    const messages =
        document.getElementById(
            "chatMessages"
        );


    if (!messages) return;


    messages.innerHTML = `

        <div class="message bot-message">

            Assalamu Alaikum 👋

            <br><br>

            Welcome to <strong>Chishti AI</strong>.

            <br><br>

            Aap Chishti Library, books,
            authors aur Islamic literature
            ke bare mein pooch sakte hain.

        </div>

    `;

}


/* =========================================================
   VOICE REPLY TOGGLE
   ========================================================= */

function updateVoiceToggle() {

    const button =
        document.getElementById(
            "voiceToggle"
        );


    if (!button) return;


    const enabled =
        localStorage.getItem(
            "chishtiVoiceReply"
        ) !== "false";


    button.classList.toggle(
        "active",
        enabled
    );


    button.title =
        enabled
            ? "Voice Reply: ON"
            : "Voice Reply: OFF";


    const icon =
        button.querySelector(
            "i"
        );


    if (icon) {

        icon.className =
            enabled
                ? "fas fa-volume-high"
                : "fas fa-volume-xmark";

    }

}


/* =========================================================
   SPEAK AI REPLY
   ========================================================= */

function speakAIReply(
    text
) {

    const enabled =
        localStorage.getItem(
            "chishtiVoiceReply"
        ) !== "false";


    if (!enabled) {
        return;
    }


    if (
        typeof speechSynthesis ===
        "undefined"
    ) {

        return;

    }


    /*
     * Cancel previous speech.
     */

    speechSynthesis.cancel();


    const cleanText =
        String(
            text
        )
        .replace(
            /[📚🌙❤️😍🤲✨👋]/gu,
            ""
        );


    const utterance =
        new SpeechSynthesisUtterance(
            cleanText
        );


    utterance.rate =
        0.95;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    /*
     * Browser voice selection.
     */

    const voices =
        speechSynthesis.getVoices();


    const preferred =
        voices.find(
            voice =>
                /ur|hi|en/i.test(
                    voice.lang
                )
        );


    if (preferred) {

        utterance.voice =
            preferred;

    }


    speechSynthesis.speak(
        utterance
    );

}


/* =========================================================
   VOICE INPUT
   ========================================================= */

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        showToast(
            "Voice input is not supported in this browser."
        );

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "ur-PK";


    recognition.interimResults =
        false;


    recognition.continuous =
        false;


    const input =
        document.getElementById(
            "chatInput"
        );


    const status =
        document.getElementById(
            "voiceStatus"
        );


    const micButton =
        document.getElementById(
            "micButton"
        );


    if (status) {

        status.textContent =
            "🎙️ Listening...";

        status.classList.add(
            "active"
        );

    }


    if (micButton) {

        micButton.classList.add(
            "recording"
        );

    }


    recognition.onresult =
        event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            if (input) {

                input.value =
                    transcript;

            }


            if (status) {

                status.textContent =
                    "Voice captured.";

            }

        };


    recognition.onerror =
        event => {

            console.warn(
                "Voice recognition:",
                event.error
            );


            if (status) {

                status.textContent =
                    "Voice input failed.";

            }

        };


    recognition.onend =
        () => {

            if (micButton) {

                micButton.classList.remove(
                    "recording"
                );

            }


            setTimeout(() => {

                if (status) {

                    status.textContent =
                        "";

                    status.classList.remove(
                        "active"
                    );

                }

            }, 1500);

        };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Voice start error:",
            error
        );

    }

}


/* =========================================================
   PREMIUM ANIMATIONS
   ========================================================= */

function initPremiumAnimations() {

    const elements =
        document.querySelectorAll(
            ".book-card, " +
            ".author-card, " +
            ".contact-card, " +
            ".counter-card"
        );


    if (!elements.length) {
        return;
    }


    if (
        typeof IntersectionObserver ===
        "undefined"
    ) {

        elements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );

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

                            entry.target.classList.add(
                                "visible"
                            );


                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.08
            }
        );


    elements.forEach(
        element => {

            observer.observe(
                element
            );

        }
    );

}


/* =========================================================
   NUMBER ANIMATION
   ========================================================= */

function animateNumber(
    element,
    target
) {

    if (!element) return;


    const finalNumber =
        Math.max(
            0,
            getNumber(target)
        );


    const duration =
        700;


    const start =
        performance.now();


    function update(
        currentTime
    ) {

        const elapsed =
            currentTime -
            start;


        const progress =
            Math.min(
                elapsed /
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
                finalNumber *
                eased
            );


        element.textContent =
            value.toLocaleString();


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        } else {

            element.textContent =
                finalNumber.toLocaleString();

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   HANDLE BOOK QUERY
   ========================================================= */

function handleBookQuery() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const bookId =
        params.get(
            "book"
        );


    if (!bookId) {
        return;
    }


    /*
     * The index page can highlight/open the
     * requested book if the book exists.
     *
     * Reader links remain reader.html?book=ID.
     */

    setTimeout(() => {

        const book =
            findBookById(
                bookId
            );


        if (!book) {
            return;
        }


        const card =
            document.querySelector(
                `[data-book-id="${cssEscape(bookId)}"]`
            );


        if (card) {

            card.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


            card.classList.add(
                "book-highlight"
            );


            setTimeout(() => {

                card.classList.remove(
                    "book-highlight"
                );

            }, 2500);

        }

    }, 1200);

}


/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function initKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            /*
             * "/" focuses search unless
             * user is already typing.
             */

            if (
                event.key === "/" &&
                !isTypingElement(
                    event.target
                )
            ) {

                event.preventDefault();


                const search =
                    document.getElementById(
                        "searchInput"
                    );


                if (search) {

                    search.focus();

                }

            }


            /*
             * Escape closes chat/share.
             */

            if (
                event.key === "Escape"
            ) {

                closeSharePopup();

                closeChatWindow();

            }

        }
    );

}


/* =========================================================
   TYPING ELEMENT
   ========================================================= */

function isTypingElement(
    element
) {

    if (!element) {
        return false;
    }


    const tag =
        element.tagName
            ?.toLowerCase();


    return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        element.isContentEditable
    );

}


/* =========================================================
   DEBOUNCE
   ========================================================= */

function debounce(
    callback,
    delay = 150
) {

    let timer;


    return function (...args) {

        clearTimeout(
            timer
        );


        timer =
            setTimeout(
                () => {

                    callback.apply(
                        this,
                        args
                    );

                },
                delay
            );

    };

}


/* =========================================================
   NORMALIZE
   ========================================================= */

function normalize(
    value
) {

    return String(
        value ?? ""
    )
    .trim()
    .toLowerCase()
    .replace(
        /\s+/g,
        " "
    );

}


/* =========================================================
   NUMBER HELPER
   ========================================================= */

function getNumber(
    value
) {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
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


/* =========================================================
   SAFE ATTRIBUTE URL
   ========================================================= */

function safeAttributeUrl(
    value
) {

    if (!value) {
        return "";
    }


    return String(
        value
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /</g,
        "%3C"
    )
    .replace(
        />/g,
        "%3E"
    );

}


/* =========================================================
   CSS ESCAPE
   ========================================================= */

function cssEscape(
    value
) {

    if (
        window.CSS &&
        typeof window.CSS.escape ===
        "function"
    ) {

        return window.CSS.escape(
            String(value)
        );

    }


    return String(
        value
    )
    .replace(
        /["\\]/g,
        "\\$&"
    );

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(
    value
) {

    const timestamp =
        parseDateValue(
            value
        );


    if (!timestamp) {

        return "Recently";

    }


    try {

        return new Date(
            timestamp
        ).toLocaleDateString(
            "en-PK",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch {

        return "Recently";

    }

}


/* =========================================================
   PUBLIC API
   ========================================================= */

window.loadBooks =
    loadBooks;


window.displayBooks =
    displayBooks;


window.searchBooks =
    searchBooks;


window.filterBooks =
    filterBooks;


window.sortBooks =
    sortBooks;


window.latestBook =
    latestBook;


window.findBookById =
    findBookById;


window.getBookId =
    getBookId;


window.incrementBookStat =
    incrementBookStat;


window.showToast =
    showToast;


window.openChat =
    openChat;


window.closeChatWindow =
    closeChatWindow;


window.sendChatMessage =
    sendChatMessage;


window.openSharePopup =
    openSharePopup;


window.closeSharePopup =
    closeSharePopup;


/* =========================================================
   FINAL INITIALIZATION
   ========================================================= */

console.log(
    "✅ Chishti Library SCRIPT.JS loaded successfully."
);


/* =========================================================
   END OF SCRIPT.JS
   ========================================================= */
