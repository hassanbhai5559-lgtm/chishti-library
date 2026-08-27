/* =========================================================
   CHISHTI LIBRARY
   SCRIPT.JS
   CLEAN PREMIUM VERSION
   ========================================================= */

"use strict";


/* =========================================================
   GLOBAL BOOK DATA
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
    initPremiumAnimations();
    initCounters();
    initImageFallback();
    initSmoothLinks();
    initYear();

    loadBooks();

});


/* =========================================================
   PREMIUM LOADER
   ========================================================= */

function initLoader() {

    const loader =
        document.getElementById("loader");

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

        }, 1500);

    });

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const menuBtn =
        document.querySelector(".mobile-menu");

    const menu =
        document.querySelector(".menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");
        menuBtn.classList.toggle("active");

    });


    document
        .querySelectorAll(".menu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                menu.classList.remove("show");
                menuBtn.classList.remove("active");

            });

        });

}


/* =========================================================
   SCROLL TO TOP
   ========================================================= */

function initScrollTop() {

    const button =
        document.getElementById("scrollTop");

    if (!button) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 350) {

            button.classList.add("show");
            button.style.display = "block";

        } else {

            button.classList.remove("show");
            button.style.display = "none";

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
   VISITOR COUNTER
   ========================================================= */

async function updateVisitorCounter() {

    const counter =
        document.getElementById("visitorCounter");

    if (!counter) return;


    if (
        typeof firebase === "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {

        counter.textContent = "0";
        return;

    }


    try {

        const db =
            firebase.firestore();

        const ref =
            db.collection("counter")
              .doc("visitors");


        const snapshot =
            await ref.get();


        if (!snapshot.exists) {

            await ref.set({
                count: 1
            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            counter.textContent = "1";

            return;

        }


        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        if (!alreadyCounted) {

            await ref.update({

                count:
                    firebase.firestore.FieldValue
                        .increment(1)

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        const latest =
            await ref.get();


        const total =
            Number(
                latest.data()?.count
            ) || 0;


        animateNumber(
            counter,
            total
        );


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        counter.textContent = "0";

    }

}


function animateNumber(element, target) {

    let current = 0;

    const step =
        Math.max(
            1,
            Math.ceil(target / 40)
        );


    const timer =
        setInterval(() => {

            current += step;

            if (current >= target) {

                current = target;
                clearInterval(timer);

            }

            element.textContent =
                current.toLocaleString();

        }, 25);

}


/* =========================================================
   BOOK COUNTER
   ========================================================= */

function updateBookCounter() {

    const counter =
        document.getElementById("bookCounter");

    if (!counter) return;

    animateNumber(
        counter,
        allBooks.length
    );

}


/* =========================================================
   LOAD BOOKS.JSON
   ========================================================= */

async function loadBooks() {

    try {

        const response =
            await fetch(
                "./books.json?cache=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "books.json could not be loaded"
            );

        }


        const data =
            await response.json();


        if (!Array.isArray(data)) {

            throw new Error(
                "books.json must contain an array"
            );

        }


        allBooks =
            data;


        filteredBooks =
            [...allBooks];


        window.allBooks =
            allBooks;

        window.filteredBooks =
            filteredBooks;


        updateBookCounter();


        displayBooks(
            filteredBooks
        );


        latestBook();


        preloadBookCovers();


        console.log(
            "✅ Books loaded:",
            allBooks.length
        );


    } catch (error) {

        console.error(
            "❌ Books loading error:",
            error
        );


        const container =
            document.getElementById(
                "booksContainer"
            );


        if (container) {

            container.innerHTML = `

                <div class="books-error">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <h3>
                        Books could not be loaded
                    </h3>

                    <p>
                        Please check books.json.
                    </p>

                </div>

            `;

        }

    }

}


/* =========================================================
   DISPLAY BOOKS
   THIS WAS MISSING IN YOUR SCRIPT
   ========================================================= */

function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) {

        console.warn(
            "booksContainer not found"
        );

        return;

    }


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


        setTimeout(() => {

            card.classList.add(
                "book-visible"
            );

        }, index * 45);

    });

}


/* =========================================================
   CREATE BOOK CARD
   ========================================================= */

function createBookCard(book, index = 0) {

    const card =
        document.createElement("div");


    card.className =
        "book-card animated-book-card";


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
        book.coverUrl ||
        "logo.png";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    const bookId =
        getBookId(book);


    /*
    ---------------------------------------------------------
    READER
    ---------------------------------------------------------
    */

    const readerPage =
        window.CHISHTI_READER_PAGE ||
        "reader.html";


    const readUrl =
        readerPage +
        "?book=" +
        encodeURIComponent(bookId);


    card.innerHTML = `

        <div class="book-image-wrap">

            <img
                src="${safeUrl(cover)}"
                alt="${escapeHtml(title)}"
                class="book-cover"
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
                    href="${safeUrl(readUrl)}"
                    class="btn book-read-btn"
                >

                    <i class="fa-solid fa-book-open"></i>

                    Read

                </a>


                ${
                    pdf
                    ? `

                        <a
                            href="${safeUrl(pdf)}"
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


        </div>

    `;


    const image =
        card.querySelector("img");


    if (image) {

        image.onerror = () => {

            image.src =
                "logo.png";

        };

    }


    /* READ */

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

            }
        );

    }


    /* DOWNLOAD */

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

            }
        );

    }


    return card;

}


/* =========================================================
   BOOK ID
   ========================================================= */

function getBookId(book) {

    if (book.firestoreId) {

        return String(
            book.firestoreId
        );

    }


    if (book.id) {

        return String(
            book.id
        );

    }


    if (book.title) {

        return String(
            book.title
        )
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

    }


    return "book-" +
        Math.random()
            .toString(36)
            .slice(2);

}


/* =========================================================
   SEARCH
   ========================================================= */

function initSearch() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            searchBooks();

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

    } else {

        const words =
            query
                .split(" ")
                .filter(
                    word => word.length > 0
                );


        filteredBooks =
            allBooks
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


                    const language =
                        normalize(
                            book.language
                        );


                    const description =
                        normalize(
                            book.description
                        );


                    let score = 0;


                    if (
                        title === query
                    ) {

                        score += 100;

                    }


                    if (
                        title.includes(query)
                    ) {

                        score += 60;

                    }


                    if (
                        author.includes(query)
                    ) {

                        score += 35;

                    }


                    if (
                        category.includes(query)
                    ) {

                        score += 25;

                    }


                    if (
                        language.includes(query)
                    ) {

                        score += 15;

                    }


                    if (
                        description.includes(query)
                    ) {

                        score += 10;

                    }


                    words.forEach(word => {

                        if (
                            title.includes(word)
                        ) {

                            score += 20;

                        }


                        if (
                            author.includes(word)
                        ) {

                            score += 12;

                        }


                        if (
                            category.includes(word)
                        ) {

                            score += 8;

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
                        b.score -
                        a.score
                )
                .map(
                    item =>
                        item.book
                );

    }


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );

}
/* =========================================================
   FILTER BOOKS
   ========================================================= */

function filterBooks(category) {

    if (!category) {
        category = "All";
    }


    const normalizedCategory =
        normalize(category);


    if (
        normalizedCategory === "all"
    ) {

        filteredBooks =
            [...allBooks];

    } else {

        filteredBooks =
            allBooks.filter(book => {

                return normalize(
                    book.category
                ) === normalizedCategory;

            });

    }


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );


    updateCategoryButtons(
        category
    );

}


/* =========================================================
   CATEGORY BUTTONS
   ========================================================= */

function initCategories() {

    document
        .querySelectorAll(
            ".category"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const category =
                        button.textContent.trim();

                    filterBooks(
                        category
                    );

                }
            );

        });

}


/* =========================================================
   UPDATE CATEGORY BUTTONS
   ========================================================= */

function updateCategoryButtons(
    activeCategory
) {

    const normalized =
        normalize(
            activeCategory
        );


    document
        .querySelectorAll(
            ".category"
        )
        .forEach(button => {

            const value =
                normalize(
                    button.textContent
                );


            button.classList.toggle(
                "active",
                value === normalized
            );

        });

}


/* =========================================================
   SORT BOOKS
   ========================================================= */

function sortBooks(type) {

    if (!Array.isArray(
        filteredBooks
    )) {

        filteredBooks =
            [...allBooks];

    }


    const books =
        [...filteredBooks];


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
                    getNumber(
                        b.likes
                    ) -
                    getNumber(
                        a.likes
                    )
            );

            break;


        case "popular":

            books.sort(
                (a, b) =>
                    getPopularity(b) -
                    getPopularity(a)
            );

            break;


        default:

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
   SORT BUTTONS
   ========================================================= */

function updateSortButtons(
    activeType
) {

    document
        .querySelectorAll(
            ".sort-btn"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const buttons =
        document.querySelectorAll(
            ".sort-btn"
        );


    buttons.forEach(button => {

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

    const value =
        book.date ||
        book.createdAt ||
        book.created_at ||
        book.timestamp ||
        book.publishedAt ||
        book.publishDate;


    if (!value) {

        return 0;

    }


    if (
        typeof value ===
        "object" &&
        typeof value.toDate ===
        "function"
    ) {

        return value
            .toDate()
            .getTime();

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

    return (
        getNumber(book.views) +
        getNumber(book.reads) * 2 +
        getNumber(book.downloads) +
        getNumber(book.likes) * 3
    );

}


/* =========================================================
   LATEST BOOK
   ========================================================= */

function latestBook() {

    const container =
        document.querySelector(
            ".latest-book-card"
        );


    if (!container) return;


    if (!allBooks.length) return;


    const latest =
        [...allBooks].sort(
            (a, b) =>
                getBookDate(b) -
                getBookDate(a)
        )[0];


    if (!latest) return;


    const title =
        latest.title ||
        "Untitled Book";


    const author =
        latest.author ||
        "Unknown Author";


    const cover =
        latest.cover ||
        latest.coverUrl ||
        "logo.png";


    const pdf =
        latest.pdf ||
        latest.pdfUrl ||
        "";


    const bookId =
        getBookId(
            latest
        );


    const image =
        container.querySelector(
            ".book-image img"
        );


    const titleElement =
        container.querySelector(
            ".book-info h2"
        );


    const authorElement =
        container.querySelector(
            ".book-info h3"
        );


    const descriptionElement =
        container.querySelector(
            ".book-info p"
        );


    const readButton =
        container.querySelector(
            ".read-book"
        );


    const pdfButton =
        container.querySelector(
            ".book-info .btn:not(.read-book)"
        );


    if (image) {

        image.src =
            cover;

        image.alt =
            title;

    }


    if (titleElement) {

        titleElement.textContent =
            title;

    }


    if (authorElement) {

        authorElement.textContent =
            author;

    }


    if (
        descriptionElement &&
        latest.description
    ) {

        descriptionElement.textContent =
            latest.description;

    }


    if (readButton) {

        const readerPage =
            window.CHISHTI_READER_PAGE ||
            "reader.html";


        readButton.href =
            readerPage +
            "?book=" +
            encodeURIComponent(
                bookId
            );


        readButton.removeAttribute(
            "target"
        );

        readButton.dataset.bookId =
            bookId;

    }


    if (pdfButton) {

        if (pdf) {

            pdfButton.href =
                pdf;

            pdfButton.style.display =
                "";

        } else {

            pdfButton.style.display =
                "none";

        }

    }

}


/* =========================================================
   PRELOAD BOOK COVERS
   ========================================================= */

function preloadBookCovers() {

    if (!Array.isArray(
        allBooks
    )) return;


    allBooks.forEach(book => {

        const src =
            book.cover ||
            book.coverUrl;


        if (!src) return;


        const image =
            new Image();


        image.src =
            src;

    });

}


/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function initImageFallback() {

    document
        .querySelectorAll(
            "img"
        )
        .forEach(image => {

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

        });

}


/* =========================================================
   SMOOTH LINKS
   ========================================================= */

function initSmoothLinks() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetId =
                        link
                            .getAttribute("href")
                            .slice(1);


                    if (!targetId) return;


                    const target =
                        document.getElementById(
                            targetId
                        );


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }
            );

        });

}


/* =========================================================
   YEAR
   ========================================================= */

function initYear() {

    const elements =
        document.querySelectorAll(
            "[data-current-year]"
        );


    elements.forEach(element => {

        element.textContent =
            new Date()
                .getFullYear();

    });

}


/* =========================================================
   PREMIUM ANIMATIONS
   ========================================================= */

function initPremiumAnimations() {

    const elements =
        document.querySelectorAll(
            ".book-card, .author-card, .contact-card, .counter-card"
        );


    if (!elements.length) return;


    if (
        typeof IntersectionObserver ===
        "undefined"
    ) {

        elements.forEach(element => {

            element.classList.add(
                "visible"
            );

        });

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

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

                });

            },
            {
                threshold: 0.08
            }
        );


    elements.forEach(element => {

        observer.observe(
            element
        );

    });

}


/* =========================================================
   COUNTERS
   ========================================================= */

function initCounters() {

    updateVisitorCounter();

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
        String(current + 1)
    );

}


/* =========================================================
   FIREBASE BOOK COUNTERS
   ========================================================= */

async function incrementBookStat(
    bookId,
    field
) {

    if (!bookId || !field) {
        return;
    }


    if (
        typeof firebase ===
        "undefined" ||
        !firebase.apps ||
        !firebase.apps.length
    ) {

        return;

    }


    try {

        const db =
            firebase.firestore();


        await db
            .collection("books")
            .doc(bookId)
            .update({

                [field]:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });


    } catch (error) {

        console.warn(
            "Book stat update failed:",
            error
        );

    }

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


    return allBooks.find(
        book =>
            String(
                getBookId(book)
            ) ===
            String(bookId)
    ) || null;

}


/* =========================================================
   SAFE URL
   ========================================================= */

function safeUrl(
    url
) {

    if (!url) {
        return "";
    }


    return String(
        url
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
   NORMALIZE TEXT
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
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


/* =========================================================
   EXPOSE FUNCTIONS
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

window.findBookById =
    findBookById;

window.getBookId =
    getBookId;
    /* =========================================================
       CATEGORY FILTER
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

    window.filterBooks =
    function filterBooks(
        category,
        button = null
    ) {

        const selected =
            normalize(
                category || "All"
            );


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

        } else {

            document
                .querySelectorAll(".category")
                .forEach(btn => {

                    const text =
                        normalize(
                            btn.dataset.category ||
                            btn.textContent
                        );


                    if (
                        text === selected
                    ) {

                        btn.classList.add(
                            "active"
                        );

                    }

                });

        }


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


        console.log(
            "Category:",
            category,
            "Results:",
            filteredBooks.length
        );

    };


    /* =========================================================
       LATEST BOOK
       ========================================================= */

    function latestBook() {

        if (!allBooks.length) return;


        let latest =
            allBooks.find(
                book =>
                    book.latest === true
            );


        if (!latest) {

            latest =
                [...allBooks]
                    .sort((a, b) => {

                        const dateA =
                            getBookDate(a);

                        const dateB =
                            getBookDate(b);

                        return dateB - dateA;

                    })[0];

        }


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


        const description =
            document.querySelector(
                ".book-info p"
            );


        if (
            image &&
            latest.cover
        ) {

            image.src =
                latest.cover;

        }


        if (title) {

            title.textContent =
                latest.title ||
                "Latest Book";

        }


        if (author) {

            author.textContent =
                latest.author ||
                "";

        }


        if (description) {

            description.textContent =
                latest.description ||
                "";

        }


        const buttons =
            document.querySelectorAll(
                ".book-buttons a"
            );


        if (
            latest.pdf &&
            buttons.length
        ) {

            buttons.forEach(button => {

                button.href =
                    latest.pdf;

            });

        }

    }


    /* =========================================================
       BOOK DATE
       ========================================================= */

    function getBookDate(book) {

        if (
            book.createdAt &&
            typeof book.createdAt === "object" &&
            book.createdAt.seconds
        ) {

            return (
                Number(
                    book.createdAt.seconds
                ) * 1000
            );

        }


        if (book.createdAt) {

            const date =
                new Date(
                    book.createdAt
                ).getTime();


            if (!isNaN(date)) {

                return date;

            }

        }


        if (book.date) {

            const date =
                new Date(
                    book.date
                ).getTime();


            if (!isNaN(date)) {

                return date;

            }

        }


        return 0;

    }


    /* =========================================================
       LIKE SYSTEM
       FIREBASE
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


    async function likeBook(button) {

        const user =
            getCurrentUser();


        if (!user) {

            requireLogin();
            return;

        }


        const bookId =
            button.dataset.bookId;


        if (!bookId) return;


        if (
            button.dataset.loading === "true"
        ) {

            return;

        }


        button.dataset.loading =
            "true";


        try {

            const db =
                firebase.firestore();


            const bookRef =
                db.collection("books")
                  .doc(bookId);


            const likeRef =
                bookRef
                    .collection("likes")
                    .doc(user.uid);


            const likeSnapshot =
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
                Number(
                    count?.textContent || 0
                );


            if (
                likeSnapshot.exists
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

            }


            if (count) {

                count.textContent =
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

        }


        button.dataset.loading =
            "false";

    }


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
                allBooks.find(
                    item =>
                        getBookId(item) ===
                        bookId
                );


            if (!book) return;


            openComments(
                book
            );

        }
    );


    /* =========================================================
       COMMENTS MODAL
       ========================================================= */

    async function openComments(book) {

        const user =
            getCurrentUser();


        if (!user) {

            requireLogin();
            return;

        }


        const old =
            document.getElementById(
                "bookCommentsModal"
            );


        if (old) {

            old.remove();

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
                            ${escapeHtml(book.title || "Book")}
                        </p>

                    </div>


                    <button
                        type="button"
                        class="comments-close"
                    >

                        <i class="fa-solid fa-xmark"></i>

                    </button>

                </div>


                <div
                    class="comments-list"
                    id="commentsList"
                >

                    <div class="comments-loading">
                        Loading comments...
                    </div>

                </div>


                <div class="comment-reactions">

                    <button
                        type="button"
                        data-emoji="❤️"
                    >
                        ❤️
                    </button>


                    <button
                        type="button"
                        data-emoji="😍"
                    >
                        😍
                    </button>


                    <button
                        type="button"
                        data-emoji="🤲"
                    >
                        🤲
                    </button>


                    <button
                        type="button"
                        data-emoji="📚"
                    >
                        📚
                    </button>


                    <button
                        type="button"
                        data-emoji="🌙"
                    >
                        🌙
                    </button>


                    <button
                        type="button"
                        data-emoji="✨"
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
                    >


                    <button type="submit">

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


        modal
            .querySelector(
                ".comments-close"
            )
            .addEventListener(
                "click",
                () =>
                    closeComments(
                        modal
                    )
            );


        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target === modal
                ) {

                    closeComments(
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


                        input.value +=
                            button.dataset.emoji;


                        input.focus();

                    }
                );

            });


        modal
            .querySelector(
                "#commentFormNew"
            )
            .addEventListener(
                "submit",
                event => {

                    event.preventDefault();

                    submitComment(
                        bookId,
                        modal
                    );

                }
            );


        await loadComments(
            bookId,
            modal
        );

    }
/* =========================================================
   NUMBER HELPER
   ========================================================= */

function getNumber(value) {

    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : 0;

}


/* =========================================================
   BOOK ID
   ========================================================= */

function getBookId(book) {

    if (!book) {
        return "";
    }


    return String(
        book.id ||
        book.bookId ||
        book.slug ||
        book.firestoreId ||
        ""
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   TOAST
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
   CHAT / AI
   ========================================================= */

const chatButton =
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


if (
    chatButton &&
    chatWindow
) {

    chatButton.addEventListener(
        "click",
        () => {

            chatWindow.classList.add(
                "open"
            );

            chatWindow.setAttribute(
                "aria-hidden",
                "false"
            );

        }
    );

}


if (closeChat) {

    closeChat.addEventListener(
        "click",
        () => {

            chatWindow?.classList.remove(
                "open"
            );

            chatWindow?.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );

}


/* =========================================================
   CHAT SEND
   ========================================================= */

const chatInput =
    document.getElementById(
        "chatInput"
    );

const sendButton =
    document.getElementById(
        "sendButton"
    );

const chatMessages =
    document.getElementById(
        "chatMessages"
    );


function addChatMessage(
    text,
    type = "bot-message"
) {

    if (!chatMessages) return;


    const message =
        document.createElement(
            "div"
        );


    message.className =
        `message ${type}`;


    message.textContent =
        text;


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


function sendChatMessage() {

    if (!chatInput) return;


    const text =
        chatInput.value.trim();


    if (!text) return;


    addChatMessage(
        text,
        "user-message"
    );


    chatInput.value =
        "";


    /*
     * Keep the existing AI/backend
     * integration untouched.
     */

}


if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendChatMessage
    );

}


if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );

}


/* =========================================================
   CLEAR CHAT
   ========================================================= */

const clearChat =
    document.getElementById(
        "clearChat"
    );


if (clearChat) {

    clearChat.addEventListener(
        "click",
        () => {

            if (!chatMessages) return;


            chatMessages.innerHTML = `

                <div class="message bot-message">

                    Assalamu Alaikum 👋

                    <br><br>

                    Welcome to
                    <strong>Chishti AI</strong>.

                </div>

            `;

        }
    );

}


/* =========================================================
   SHARE POPUP
   ========================================================= */

const sharePopup =
    document.getElementById(
        "sharePopup"
    );


document.addEventListener(
    "click",
    event => {

        const shareButton =
            event.target.closest(
                ".share-option"
            );


        if (!shareButton) return;


        const type =
            shareButton.dataset.share;


        const url =
            window.location.href;


        const text =
            document.title;


        let shareUrl =
            "";


        if (
            type === "whatsapp"
        ) {

            shareUrl =
                "https://wa.me/?text=" +
                encodeURIComponent(
                    text + " " + url
                );

        }


        if (
            type === "facebook"
        ) {

            shareUrl =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodeURIComponent(url);

        }


        if (
            type === "telegram"
        ) {

            shareUrl =
                "https://t.me/share/url?url=" +
                encodeURIComponent(url) +
                "&text=" +
                encodeURIComponent(text);

        }


        if (
            type === "twitter"
        ) {

            shareUrl =
                "https://twitter.com/intent/tweet?url=" +
                encodeURIComponent(url) +
                "&text=" +
                encodeURIComponent(text);

        }


        if (shareUrl) {

            window.open(
                shareUrl,
                "_blank",
                "noopener,noreferrer"
            );

        }

    }
);


/* =========================================================
   COPY BOOK LINK
   ========================================================= */

const copyBookLink =
    document.getElementById(
        "copyBookLink"
    );


if (copyBookLink) {

    copyBookLink.addEventListener(
        "click",
        async () => {

            try {

                await navigator.clipboard.writeText(
                    window.location.href
                );


                showToast(
                    "🔗 Book link copied!"
                );


            } catch (error) {

                console.error(
                    "Copy failed:",
                    error
                );

            }

        }
    );

}


/* =========================================================
   CLOSE SHARE POPUP
   ========================================================= */

if (sharePopup) {

    sharePopup.addEventListener(
        "click",
        event => {

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


/* =========================================================
   INITIALIZE
   ========================================================= */

initCategories();
initPremiumAnimations();
initImageFallback();
initSmoothLinks();
initCounters();
initYear();

loadBooks();


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

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

window.loadBooks =
    loadBooks;

window.showToast =
    showToast;
