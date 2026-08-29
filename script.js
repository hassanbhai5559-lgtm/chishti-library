/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS
   COMPLETE REPLACEMENT
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL SETTINGS
========================================================= */

const CHISHTI_CONFIG = {

    collection: "books",

    readerPage:
        window.CHISHTI_READER_PAGE || "reader.html",

    defaultCover:
        "logo.png",

    booksPerPage:
        100

};


/* =========================================================
   GLOBAL STATE
========================================================= */

let allBooks = [];

let filteredBooks = [];

let currentCategory = "All";

let currentSort = "latest";

let currentSearch = "";

let booksLoaded = false;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeLibrary();

});


/* =========================================================
   INITIALIZE
========================================================= */

function initializeLibrary() {

    setupMobileMenu();

    setupScrollTop();

    setupSearch();

    setupCategoryButtons();

    setupSortingButtons();

    setupFirebaseBookListener();

    initializeVisitorCounter();

}


/* =========================================================
   FIREBASE BOOK LOADER
========================================================= */

function setupFirebaseBookListener() {

    if (
        typeof firebase === "undefined" ||
        !firebase.firestore
    ) {

        console.error(
            "Chishti Library: Firebase Firestore not available."
        );

        showBookError(
            "Firebase could not be loaded. Please check firebase.js."
        );

        return;

    }


    let db;

    try {

        db = firebase.firestore();

    } catch (error) {

        console.error(
            "Firestore initialization error:",
            error
        );

        showBookError(
            "Unable to connect to the library database."
        );

        return;

    }


    showBookLoading();


    db.collection(CHISHTI_CONFIG.collection)
        .onSnapshot(

            snapshot => {

                allBooks = [];

                snapshot.forEach(doc => {

                    const data = doc.data() || {};

                    allBooks.push({

                        id: doc.id,

                        ...data

                    });

                });


                booksLoaded = true;


                updateBookCounter(
                    allBooks.length
                );


                applyLibraryFilters();


                console.log(
                    `Chishti Library: ${allBooks.length} books loaded.`
                );

            },

            error => {

                console.error(
                    "Firebase books error:",
                    error
                );

                showBookError(
                    "Unable to load books. Please try again later."
                );

            }

        );

}


/* =========================================================
   LOADING STATE
========================================================= */

function showBookLoading() {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="books-loading">

            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
            </div>

            <p>
                Loading Islamic Books...
            </p>

        </div>

    `;

}


/* =========================================================
   ERROR STATE
========================================================= */

function showBookError(message) {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    container.innerHTML = `

        <div class="books-error">

            <i class="fas fa-circle-exclamation"></i>

            <h3>
                Library Temporarily Unavailable
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                onclick="location.reload()"
            >
                <i class="fas fa-rotate-right"></i>
                Try Again
            </button>

        </div>

    `;

}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        function () {

            currentSearch =
                this.value
                    .trim()
                    .toLowerCase();


            applyLibraryFilters();

        }
    );


    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                this.value = "";

                currentSearch = "";

                applyLibraryFilters();

            }

        }
    );

}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function setupCategoryButtons() {

    const buttons =
        document.querySelectorAll(
            ".category"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const category =
                    this.textContent
                        .trim();

                filterBooks(category);

            }
        );

    });

}


/* =========================================================
   CATEGORY FILTER FUNCTION
========================================================= */

function filterBooks(category) {

    currentCategory =
        category || "All";


    document
        .querySelectorAll(".category")
        .forEach(button => {

            const buttonCategory =
                button.textContent
                    .trim()
                    .toLowerCase();

            button.classList.toggle(

                "active",

                buttonCategory ===
                currentCategory.toLowerCase()

            );

        });


    applyLibraryFilters();


    const featuredSection =
        document.querySelector(
            ".featured-books"
        );


    if (featuredSection) {

        setTimeout(() => {

            featuredSection.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

        }, 100);

    }

}


/* =========================================================
   SORTING
========================================================= */

function setupSortingButtons() {

    document
        .querySelectorAll(".sort-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const text =
                        this.textContent
                            .trim()
                            .toLowerCase();


                    if (
                        text.includes("latest")
                    ) {

                        sortBooks("latest");

                    }

                    else if (
                        text.includes("oldest")
                    ) {

                        sortBooks("oldest");

                    }

                    else if (
                        text.includes("liked")
                    ) {

                        sortBooks("liked");

                    }

                    else if (
                        text.includes("popular")
                    ) {

                        sortBooks("popular");

                    }

                }
            );

        });

}


/* =========================================================
   SORT BOOKS
========================================================= */

function sortBooks(type) {

    currentSort =
        type || "latest";


    document
        .querySelectorAll(".sort-btn")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    document
        .querySelectorAll(".sort-btn")
        .forEach(button => {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();


            let matches = false;


            if (
                currentSort === "latest" &&
                text.includes("latest")
            ) {

                matches = true;

            }

            if (
                currentSort === "oldest" &&
                text.includes("oldest")
            ) {

                matches = true;

            }

            if (
                currentSort === "liked" &&
                text.includes("liked")
            ) {

                matches = true;

            }

            if (
                currentSort === "popular" &&
                text.includes("popular")
            ) {

                matches = true;

            }


            if (matches) {

                button.classList.add(
                    "active"
                );

            }

        });


    applyLibraryFilters();

}


/* =========================================================
   APPLY FILTERS + SORT
========================================================= */

function applyLibraryFilters() {

    let result =
        [...allBooks];


    /* =========================
       CATEGORY
    ========================= */

    if (
        currentCategory &&
        currentCategory !== "All"
    ) {

        result =
            result.filter(book => {

                const category =
                    getBookCategory(book)
                        .toLowerCase();


                return (
                    category ===
                    currentCategory.toLowerCase()
                );

            });

    }


    /* =========================
       SEARCH
    ========================= */

    if (currentSearch) {

        result =
            result.filter(book => {

                const searchableText = [

                    getBookTitle(book),

                    getBookAuthor(book),

                    getBookCategory(book),

                    getBookDescription(book)

                ]
                    .join(" ")
                    .toLowerCase();


                return searchableText
                    .includes(currentSearch);

            });

    }


    /* =========================
       SORT
    ========================= */

    result.sort(
        (a, b) => {

            switch (currentSort) {

                case "oldest":

                    return (
                        getBookTime(a) -
                        getBookTime(b)
                    );


                case "liked":

                    return (
                        getBookLikes(b) -
                        getBookLikes(a)
                    );


                case "popular":

                    return (
                        getBookViews(b) -
                        getBookViews(a)
                    );


                case "latest":

                default:

                    return (
                        getBookTime(b) -
                        getBookTime(a)
                    );

            }

        }
    );


    filteredBooks =
        result;


    renderBooks(
        filteredBooks
    );

}


/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;


    if (!books.length) {

        container.innerHTML = `

            <div class="no-books">

                <i class="fas fa-book-open"></i>

                <h3>
                    No Books Found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        books
            .slice(
                0,
                CHISHTI_CONFIG.booksPerPage
            )
            .map(
                createBookCard
            )
            .join("");


    setupBookActions(
        container
    );

}


/* =========================================================
   CREATE BOOK CARD
========================================================= */

function createBookCard(book) {

    const id =
        String(
            book.id || ""
        );


    const title =
        getBookTitle(book);


    const author =
        getBookAuthor(book);


    const category =
        getBookCategory(book);


    const description =
        getBookDescription(book);


    const cover =
        getBookCover(book);


    const pdf =
        getBookPDF(book);


    const views =
        getBookViews(book);


    const likes =
        getBookLikes(book);


    const comments =
        getBookComments(book);


    const readerURL =
        createReaderURL(id);


    return `

        <article
            class="book-result"
            data-book-id="${escapeHTML(id)}"
            data-id="${escapeHTML(id)}"
        >

            <div class="book-card-image">

                <img
                    src="${escapeHTML(cover)}"
                    alt="${escapeHTML(title)}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${escapeHTML(CHISHTI_CONFIG.defaultCover)}'"
                >

                ${
                    category
                        ? `
                            <span class="book-category-badge">
                                ${escapeHTML(category)}
                            </span>
                        `
                        : ""
                }

            </div>


            <div class="book-card-content">

                <h3 class="book-title">
                    ${escapeHTML(title)}
                </h3>


                ${
                    author
                        ? `
                            <p class="book-author">
                                <i class="fas fa-feather-pointed"></i>
                                ${escapeHTML(author)}
                            </p>
                        `
                        : ""
                }


                ${
                    description
                        ? `
                            <p class="book-description">
                                ${escapeHTML(
                                    shortenText(
                                        description,
                                        140
                                    )
                                )}
                            </p>
                        `
                        : ""
                }


                <div class="book-meta">

                    ${
                        category
                            ? `
                                <span>
                                    <i class="fas fa-layer-group"></i>
                                    ${escapeHTML(category)}
                                </span>
                            `
                            : ""
                    }

                </div>


                <!-- ACTION BAR -->

                <div
                    class="chishti-book-actions"
                    data-action-book-id="${escapeHTML(id)}"
                >

                    <button
                        type="button"
                        class="book-action view-action"
                        title="Views"
                    >

                        <i class="fas fa-eye"></i>

                        <span class="book-view-count">
                            ${formatNumber(views)}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action like-action"
                        data-book-id="${escapeHTML(id)}"
                        title="Like"
                    >

                        <i class="far fa-heart"></i>

                        <span>
                            ${formatNumber(likes)}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action comment-action"
                        data-book-id="${escapeHTML(id)}"
                        title="Comments"
                    >

                        <i class="far fa-comment"></i>

                        <span>
                            ${formatNumber(comments)}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action share-action"
                        data-book-id="${escapeHTML(id)}"
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
                        href="${escapeHTML(readerURL)}"
                        class="btn read-book"
                        data-book-id="${escapeHTML(id)}"
                    >

                        <i class="fas fa-book-open"></i>

                        Read Online

                    </a>


                    ${
                        pdf
                            ? `
                                <a
                                    href="${escapeHTML(pdf)}"
                                    class="btn download-book"
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <i class="fas fa-download"></i>

                                    Download PDF

                                </a>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   SETUP BOOK ACTIONS
========================================================= */

function setupBookActions(container) {

    if (!container) return;


    /* =========================
       READ BUTTONS
    ========================= */

    container
        .querySelectorAll(".read-book")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const bookId =
                        this.dataset.bookId;


                    if (!bookId) return;


                    registerBookView(
                        bookId
                    );

                }
            );

        });


    /* =========================
       LIKE
    ========================= */

    container
        .querySelectorAll(".like-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    toggleLike(
                        this
                    );

                }
            );

        });


    /* =========================
       COMMENTS
    ========================= */

    container
        .querySelectorAll(".comment-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const bookId =
                        this.dataset.bookId;


                    if (!bookId) return;


                    window.location.href =
                        createReaderURL(
                            bookId
                        ) + "#comments";

                }
            );

        });


    /* =========================
       SHARE
    ========================= */

    container
        .querySelectorAll(".share-action")
        .forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    shareBook(
                        this.dataset.bookId
                    );

                }
            );

        });

}


/* =========================================================
   BOOK VIEW
========================================================= */

async function registerBookView(bookId) {

    if (
        !bookId ||
        typeof firebase === "undefined"
    ) {

        return;

    }


    try {

        const db =
            firebase.firestore();


        await db
            .collection(
                CHISHTI_CONFIG.collection
            )
            .doc(bookId)
            .update({

                views:
                    firebase.firestore.FieldValue.increment(
                        1
                    )

            });


    } catch (error) {

        console.warn(
            "View counter could not be updated:",
            error
        );

    }

}


/* =========================================================
   LIKE SYSTEM
========================================================= */

async function toggleLike(button) {

    const bookId =
        button.dataset.bookId;


    if (!bookId) return;


    const icon =
        button.querySelector("i");


    const count =
        button.querySelector("span");


    const storageKey =
        `chishti-liked-${bookId}`;


    const alreadyLiked =
        localStorage.getItem(
            storageKey
        ) === "true";


    if (alreadyLiked) {

        showToast(
            "You already liked this book."
        );

        return;

    }


    button.disabled = true;


    try {

        const db =
            firebase.firestore();


        await db
            .collection(
                CHISHTI_CONFIG.collection
            )
            .doc(bookId)
            .update({

                likes:
                    firebase.firestore.FieldValue.increment(
                        1
                    )

            });


        localStorage.setItem(
            storageKey,
            "true"
        );


        button.dataset.liked =
            "true";


        if (icon) {

            icon.className =
                "fas fa-heart";

        }


        let current =
            parseInt(
                count.textContent
            ) || 0;


        count.textContent =
            formatNumber(
                current + 1
            );


        button.classList.add(
            "liked"
        );


        showToast(
            "Book liked ❤️"
        );


    } catch (error) {

        console.error(
            "Like error:",
            error
        );


        showToast(
            "Could not like this book."
        );

    }


    button.disabled = false;

}


/* =========================================================
   SHARE BOOK
========================================================= */

async function shareBook(bookId) {

    if (!bookId) return;


    const url =
        new URL(
            createReaderURL(bookId),
            window.location.href
        ).href;


    const shareData = {

        title:
            "Chishti Library",

        text:
            "Read this Islamic book on Chishti Library.",

        url:
            url

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

            return;

        }


        if (
            navigator.clipboard
        ) {

            await navigator.clipboard
                .writeText(url);


            showToast(
                "Book link copied!"
            );


            return;

        }


        fallbackCopyText(
            url
        );


    } catch (error) {

        if (
            error &&
            error.name === "AbortError"
        ) {

            return;

        }


        console.warn(
            "Share failed:",
            error
        );

    }

}


/* =========================================================
   COPY FALLBACK
========================================================= */

function fallbackCopyText(text) {

    const textarea =
        document.createElement(
            "textarea"
        );


    textarea.value =
        text;


    textarea.style.position =
        "fixed";

    textarea.style.opacity =
        "0";


    document.body.appendChild(
        textarea
    );


    textarea.select();


    try {

        document.execCommand(
            "copy"
        );


        showToast(
            "Book link copied!"
        );

    } catch (error) {

        alert(
            "Copy this link:\n\n" +
            text
        );

    }


    textarea.remove();

}


/* =========================================================
   READER URL
========================================================= */

function createReaderURL(bookId) {

    return (
        CHISHTI_CONFIG.readerPage +
        "?book=" +
        encodeURIComponent(
            bookId
        )
    );

}


/* =========================================================
   VISITOR COUNTER
========================================================= */

function initializeVisitorCounter() {

    const counter =
        document.getElementById(
            "visitorCounter"
        );


    if (!counter) return;


    let visitors =
        parseInt(
            localStorage.getItem(
                "chishti-local-visitors"
            )
        ) || 0;


    const visitorSession =
        sessionStorage.getItem(
            "chishti-visitor-session"
        );


    if (!visitorSession) {

        visitors++;

        localStorage.setItem(
            "chishti-local-visitors",
            visitors
        );


        sessionStorage.setItem(
            "chishti-visitor-session",
            "true"
        );

    }


    animateCounter(
        counter,
        visitors
    );

}


/* =========================================================
   BOOK COUNTER
========================================================= */

function updateBookCounter(total) {

    const counter =
        document.getElementById(
            "bookCounter"
        );


    if (!counter) return;


    animateCounter(
        counter,
        total
    );

}


/* =========================================================
   ANIMATED COUNTER
========================================================= */

function animateCounter(
    element,
    target
) {

    if (!element) return;


    const finalValue =
        Number(target) || 0;


    const duration =
        800;


    const startTime =
        performance.now();


    function update(
        currentTime
    ) {

        const progress =
            Math.min(

                (
                    currentTime -
                    startTime
                ) /
                duration,

                1

            );


        const value =
            Math.floor(
                progress *
                finalValue
            );


        element.textContent =
            formatNumber(
                value
            );


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

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
        () => {

            menu.classList.toggle(
                "active"
            );


            const isOpen =
                menu.classList.contains(
                    "active"
                );


            mobileMenu.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );


    menu
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    menu.classList.remove(
                        "active"
                    );


                    mobileMenu.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }
            );

        });


    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(
                    event.target
                ) &&
                !mobileMenu.contains(
                    event.target
                )
            ) {

                menu.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================================================
   SCROLL TOP
========================================================= */

function setupScrollTop() {

    const button =
        document.getElementById(
            "scrollTop"
        );


    if (!button) return;


    window.addEventListener(
        "scroll",
        () => {

            if (
                window.scrollY >
                400
            ) {

                button.classList.add(
                    "show"
                );

            } else {

                button.classList.remove(
                    "show"
                );

            }

        },
        {
            passive: true
        }
    );


    button.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =========================================================
   BOOK FIELD HELPERS
========================================================= */

function getBookTitle(book) {

    return firstValid(

        book.title,

        book.name,

        book.bookTitle,

        "Untitled Book"

    );

}


function getBookAuthor(book) {

    return firstValid(

        book.author,

        book.authorName,

        book.writer,

        book.writerName,

        "Unknown Author"

    );

}


function getBookCategory(book) {

    return firstValid(

        book.category,

        book.categories,

        book.type,

        "General"

    );

}


function getBookDescription(book) {

    return firstValid(

        book.description,

        book.about,

        book.summary,

        ""

    );

}


function getBookCover(book) {

    return firstValid(

        book.cover,

        book.coverImage,

        book.image,

        book.imageUrl,

        book.thumbnail,

        book.thumbnailUrl,

        CHISHTI_CONFIG.defaultCover

    );

}


function getBookPDF(book) {

    return firstValid(

        book.pdf,

        book.pdfUrl,

        book.downloadURL,

        book.downloadUrl,

        book.fileUrl,

        book.url,

        ""

    );

}


function getBookViews(book) {

    return Number(

        firstValid(

            book.views,

            book.viewCount,

            book.totalViews,

            0

        )

    ) || 0;

}


function getBookLikes(book) {

    return Number(

        firstValid(

            book.likes,

            book.likeCount,

            0

        )

    ) || 0;

}


function getBookComments(book) {

    return Number(

        firstValid(

            book.comments,

            book.commentCount,

            0

        )

    ) || 0;

}


/* =========================================================
   BOOK DATE / TIMESTAMP
========================================================= */

function getBookTime(book) {

    const value =
        firstValid(

            book.createdAt,

            book.timestamp,

            book.date,

            book.uploadedAt,

            book.created

        );


    if (!value) {

        return 0;

    }


    if (
        value &&
        typeof value.toMillis ===
        "function"
    ) {

        return value.toMillis();

    }


    if (
        value &&
        value.seconds
    ) {

        return (
            Number(
                value.seconds
            ) * 1000
        );

    }


    const date =
        new Date(value);


    const time =
        date.getTime();


    return Number.isNaN(time)
        ? 0
        : time;

}


/* =========================================================
   FIRST VALID VALUE
========================================================= */

function firstValid(...values) {

    for (
        const value of values
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return value;

        }

    }


    return "";

}


/* =========================================================
   FORMAT NUMBERS
========================================================= */

function formatNumber(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString();

}


/* =========================================================
   SHORTEN TEXT
========================================================= */

function shortenText(
    text,
    maxLength
) {

    const clean =
        String(text)
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    if (
        clean.length <=
        maxLength
    ) {

        return clean;

    }


    return (
        clean.substring(
            0,
            maxLength
        )
        .trim() +
        "..."
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)

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
   TOAST MESSAGE
========================================================= */

function showToast(message) {

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


        toast.style.position =
            "fixed";


        toast.style.bottom =
            "25px";


        toast.style.left =
            "50%";


        toast.style.transform =
            "translateX(-50%)";


        toast.style.zIndex =
            "99999";


        toast.style.padding =
            "12px 20px";


        toast.style.borderRadius =
            "30px";


        toast.style.background =
            "#111";


        toast.style.color =
            "#fff";


        toast.style.fontSize =
            "14px";


        toast.style.fontWeight =
            "600";


        toast.style.boxShadow =
            "0 8px 30px rgba(0,0,0,.25)";


        toast.style.transition =
            "all .3s ease";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.opacity =
        "1";


    toast.style.transform =
        "translateX(-50%) translateY(0)";


    clearTimeout(
        toast._timeout
    );


    toast._timeout =
        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateX(-50%) translateY(10px)";

            },
            2200
        );

}


/* =========================================================
   GLOBAL FUNCTIONS
   These keep your existing inline onclick
   attributes working.
========================================================= */

window.filterBooks =
    filterBooks;

window.sortBooks =
    sortBooks;

window.shareBook =
    shareBook;


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.visibilityState ===
            "visible" &&
            booksLoaded
        ) {

            /*
             * Firebase onSnapshot handles
             * live updates automatically.
             */

        }

    }
);


/* =========================================================
   FINAL INITIALIZATION MESSAGE
========================================================= */

console.log(
    "%c CHISHTI LIBRARY ",
    "background:#111;color:#d4af37;font-weight:bold;padding:6px 10px;border-radius:4px;"
);

console.log(
    "Digital Islamic Library system initialized."
);
