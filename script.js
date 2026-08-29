/*=========================================================
CHISHTI LIBRARY
SCRIPT.JS
FULL REPLACEMENT VERSION
=========================================================*/

"use strict";

/*=========================================================
GLOBAL VARIABLES
=========================================================*/

let allBooks = [];
let filteredBooks = [];
let currentSort = "latest";

const BOOKS_FILE = "books.json";
const READER_PAGE = "reader.html";


/*=========================================================
UTILITY
=========================================================*/

function byId(id) {
    return document.getElementById(id);
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
CORRECT READER URL
IMPORTANT:
reader.html?book=PDF-NAME.pdf
=========================================================*/

function getReaderURL(book) {

    if (!book || !book.pdf) {
        return READER_PAGE;
    }

    return (
        READER_PAGE +
        "?book=" +
        encodeURIComponent(String(book.pdf).trim())
    );

}


/*=========================================================
BOOK PDF URL
=========================================================*/

function getPDFURL(book) {

    if (!book || !book.pdf) {
        return "#";
    }

    return String(book.pdf).trim();

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

    }, 1200);

});


/*=========================================================
MOBILE MENU
=========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.querySelector(".mobile-menu");
    const menu = document.querySelector(".menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("active");
        menu.classList.toggle("show");

    });

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("active");
            menu.classList.remove("show");

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
VISITOR COUNTER
=========================================================*/

async function updateVisitorCounter() {

    const counter = byId("visitorCounter");

    if (!counter) return;

    try {

        if (
            typeof db === "undefined" ||
            typeof firebase === "undefined"
        ) {

            counter.innerText = "0";
            return;

        }


        const visitorRef =
            db.collection("counter").doc("visitors");


        const snapshot =
            await visitorRef.get();


        if (!snapshot.exists) {

            await visitorRef.set({
                count: 1
            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

            animateNumber(counter, 1);

            return;

        }


        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


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


        const latest =
            await visitorRef.get();


        const total =
            Number(
                latest.data()?.count
            ) || 0;


        animateNumber(counter, total);


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        counter.innerText = "0";

    }

}


/*=========================================================
NUMBER ANIMATION
=========================================================*/

function animateNumber(element, target) {

    if (!element) return;

    target = Number(target) || 0;

    if (target <= 0) {

        element.innerText = "0";
        return;

    }

    let current = 0;

    const duration = 800;
    const stepTime = 25;
    const steps = Math.max(
        1,
        Math.ceil(duration / stepTime)
    );

    const increment = target / steps;

    const timer = setInterval(() => {

        current += increment;

        if (current >= target) {

            current = target;
            clearInterval(timer);

        }

        element.innerText =
            Math.floor(current).toLocaleString();

    }, stepTime);

}


/*=========================================================
START VISITOR COUNTER
=========================================================*/

updateVisitorCounter();


/*=========================================================
LOAD BOOKS.JSON
=========================================================*/

async function loadBooks() {

    try {

        const response =
            await fetch(
                BOOKS_FILE +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }


        const data =
            await response.json();


        /*-----------------------------------------
        ONLY VALID BOOK OBJECTS
        -----------------------------------------*/

        allBooks = Array.isArray(data)

            ? data.filter(book =>
                book &&
                typeof book === "object" &&
                book.title &&
                book.pdf
            )

            : [];


        /*
         * IMPORTANT:
         * We DO NOT create extra books.
         * We use ONLY books.json.
         */

        filteredBooks =
            [...allBooks];


        console.log(
            "📚 Actual books loaded:",
            allBooks.length
        );


        /*-----------------------------------------
        BOOK COUNTER
        -----------------------------------------*/

        const bookCounter =
            byId("bookCounter");


        if (bookCounter) {

            animateNumber(
                bookCounter,
                allBooks.length
            );

        }


        /*-----------------------------------------
        INITIAL SORT
        -----------------------------------------*/

        sortBooks(currentSort, false);


        /*-----------------------------------------
        LATEST RELEASE
        -----------------------------------------*/

        updateLatestBook();


    } catch (error) {

        console.error(
            "❌ Books loading error:",
            error
        );


        const container =
            byId("booksContainer");


        if (container) {

            container.innerHTML = `

                <div class="no-books">

                    <h2>
                        Unable to Load Books
                    </h2>

                    <p>
                        Please check books.json
                    </p>

                </div>

            `;

        }

    }

}


/*=========================================================
DISPLAY BOOKS
=========================================================*/

function displayBooks(books) {

    const container =
        byId("booksContainer");


    if (!container) return;


    container.innerHTML = "";


    if (!Array.isArray(books) || books.length === 0) {

        container.innerHTML = `

            <div class="no-books">

                <h2>
                    No Books Found
                </h2>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;

    }


    const fragment =
        document.createDocumentFragment();


    books.forEach((book, index) => {

        const card =
            createBookCard(book, index);


        fragment.appendChild(card);

    });


    container.appendChild(fragment);


    /*
     * Add horizontal carousel class.
     * CSS can control the exact movement/layout.
     */

    container.classList.add(
        "books-carousel-container"
    );

}


/*=========================================================
CREATE BOOK CARD
=========================================================*/

function createBookCard(book, index) {

    const card =
        document.createElement("div");


    card.className =
        "book-card book-result";


    card.dataset.bookId =
        String(book.id ?? index + 1);


    card.dataset.pdf =
        String(book.pdf).trim();


    const title =
        escapeHTML(book.title);


    const author =
        escapeHTML(book.author);


    const category =
        escapeHTML(book.category);


    const description =
        escapeHTML(book.description);


    const cover =
        escapeHTML(book.cover);


    const pdf =
        getPDFURL(book);


    const reader =
        getReaderURL(book);


    const views =
        Number(book.views) || 0;


    const likes =
        Number(book.likes) || 0;


    const downloads =
        Number(book.downloads) || 0;


    card.innerHTML = `

        <div class="book-image-wrap">

            <img
                src="${cover}"
                alt="${title}"
                class="book-cover"
                loading="lazy"
                onerror="this.onerror=null;this.src='logo.png';"
            >

        </div>


        <div class="book-content">

            <span class="book-category">
                ${category}
            </span>


            <h2 class="book-title">
                ${title}
            </h2>


            <h3 class="book-author">
                ${author}
            </h3>


            <p class="book-description">
                ${description}
            </p>


            <!-- BOOK ACTION BAR -->

            <div class="chishti-book-actions">


                <!-- VIEWS -->

                <button
                    type="button"
                    class="book-action view-action"
                    title="Views"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                >

                    <i class="fas fa-eye"></i>

                    <span class="book-view-count">
                        ${views}
                    </span>

                </button>


                <!-- LIKE -->

                <button
                    type="button"
                    class="book-action like-action"
                    title="Like"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                >

                    <i class="far fa-heart"></i>

                    <span>
                        ${likes}
                    </span>

                </button>


                <!-- COMMENT -->

                <button
                    type="button"
                    class="book-action comment-action"
                    title="Comment"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                >

                    <i class="far fa-comment"></i>

                    <span>
                        Comment
                    </span>

                </button>


                <!-- SHARE -->

                <button
                    type="button"
                    class="book-action share-action"
                    title="Share"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                >

                    <i class="fas fa-share-nodes"></i>

                    <span>
                        Share
                    </span>

                </button>

            </div>


            <!-- META -->

            <div class="book-meta">

                <span>
                    <i class="fas fa-eye"></i>
                    ${views}
                </span>

                <span>
                    <i class="fas fa-heart"></i>
                    ${likes}
                </span>

                <span>
                    <i class="fas fa-download"></i>
                    ${downloads}
                </span>

            </div>


            <!-- BUTTONS -->

            <div class="book-buttons">

                <a
                    href="${reader}"
                    class="btn read-book"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                    data-pdf="${escapeHTML(pdf)}"
                >

                    <i class="fas fa-book-open"></i>

                    Read Online

                </a>


                <a
                    href="${escapeHTML(pdf)}"
                    download
                    class="btn download-book"
                    data-book-id="${escapeHTML(book.id ?? index + 1)}"
                >

                    <i class="fas fa-download"></i>

                    Download

                </a>

            </div>

        </div>

    `;


    setupBookActions(
        card,
        book
    );


    return card;

}


/*=========================================================
BOOK ACTIONS
=========================================================*/

function setupBookActions(card, book) {

    /*-----------------------------------------
    LIKE
    -----------------------------------------*/

    const likeButton =
        card.querySelector(
            ".like-action"
        );


    if (likeButton) {

        const storageKey =
            "chishti-liked-" +
            String(book.id);


        const alreadyLiked =
            localStorage.getItem(
                storageKey
            ) === "true";


        if (alreadyLiked) {

            likeButton.classList.add(
                "liked"
            );


            const icon =
                likeButton.querySelector("i");


            if (icon) {

                icon.className =
                    "fas fa-heart";

            }

        }


        likeButton.addEventListener(
            "click",
            async () => {

                let count =
                    Number(
                        likeButton.querySelector(
                            "span"
                        )?.innerText
                    ) || 0;


                const liked =
                    localStorage.getItem(
                        storageKey
                    ) === "true";


                const icon =
                    likeButton.querySelector(
                        "i"
                    );


                if (!liked) {

                    count++;

                    localStorage.setItem(
                        storageKey,
                        "true"
                    );


                    likeButton.classList.add(
                        "liked"
                    );


                    if (icon) {

                        icon.className =
                            "fas fa-heart";

                    }

                } else {

                    count =
                        Math.max(
                            0,
                            count - 1
                        );


                    localStorage.removeItem(
                        storageKey
                    );


                    likeButton.classList.remove(
                        "liked"
                    );


                    if (icon) {

                        icon.className =
                            "far fa-heart";

                    }

                }


                const span =
                    likeButton.querySelector(
                        "span"
                    );


                if (span) {

                    span.innerText =
                        count;

                }


                /*
                 * Update local book data
                 */

                book.likes = count;


                /*
                 * Re-sort if Most Liked is active.
                 */

                if (
                    currentSort === "liked"
                ) {

                    sortBooks(
                        "liked"
                    );

                }

            }
        );

    }


    /*-----------------------------------------
    COMMENT
    -----------------------------------------*/

    const commentButton =
        card.querySelector(
            ".comment-action"
        );


    if (commentButton) {

        commentButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    getReaderURL(book);

            }
        );

    }


    /*-----------------------------------------
    SHARE
    -----------------------------------------*/

    const shareButton =
        card.querySelector(
            ".share-action"
        );


    if (shareButton) {

        shareButton.addEventListener(
            "click",
            async () => {

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
                                book.title,

                            text:
                                "Read this book on Chishti Library",

                            url:
                                url

                        });

                    } catch (error) {

                        /*
                         * User cancelled share.
                         */

                    }

                } else {

                    try {

                        await navigator.clipboard
                            .writeText(url);


                        showNotification(
                            "Book link copied!"
                        );

                    } catch (error) {

                        prompt(
                            "Copy this book link:",
                            url
                        );

                    }

                }

            }
        );

    }

}


/*=========================================================
NOTIFICATION
=========================================================*/

function showNotification(message) {

    const old =
        document.querySelector(
            ".chishti-notification"
        );


    if (old) {
        old.remove();
    }


    const notification =
        document.createElement("div");


    notification.className =
        "chishti-notification";


    notification.innerText =
        message;


    document.body.appendChild(
        notification
    );


    setTimeout(() => {

        notification.classList.add(
            "hide"
        );

        setTimeout(() => {

            notification.remove();

        }, 300);

    }, 1800);

}


/*=========================================================
LIVE SEARCH
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
                    book.description || ""
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


/*=========================================================
SEARCH INPUT
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            byId("searchInput");


        if (!searchInput) return;


        searchInput.addEventListener(
            "input",
            searchBooks
        );

    }
);


/*=========================================================
CATEGORY FILTER
=========================================================*/

function filterBooks(
    category,
    button = null
) {

    /*
     * Make category matching
     * case-insensitive.
     */

    const selected =
        String(category)
            .toLowerCase()
            .trim();


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

                if (
                    btn.textContent
                        .trim()
                        .toLowerCase() ===
                    selected
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

                return String(
                    book.category || ""
                )
                .toLowerCase()
                .trim() === selected;

            });

    }


    displayBooks(
        filteredBooks
    );

}


/*=========================================================
CATEGORY BUTTON AUTO CONNECTION
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll(".category")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const category =
                            button.textContent
                                .trim();


                        filterBooks(
                            category,
                            button
                        );

                    }
                );

            });

    }
);


/*=========================================================
SORT BOOKS
=========================================================*/

function sortBooks(
    type = "latest",
    updateButtons = true
) {

    currentSort = type;


    /*
     * Always sort a copy.
     */

    filteredBooks =
        [...filteredBooks];


    if (
        type === "latest"
    ) {

        /*
         * Highest ID = newest upload.
         */

        filteredBooks.sort(
            (a, b) =>
                Number(b.id || 0) -
                Number(a.id || 0)
        );

    }


    else if (
        type === "oldest"
    ) {

        filteredBooks.sort(
            (a, b) =>
                Number(a.id || 0) -
                Number(b.id || 0)
        );

    }


    else if (
        type === "liked"
    ) {

        filteredBooks.sort(
            (a, b) =>
                Number(b.likes || 0) -
                Number(a.likes || 0)
        );

    }


    else if (
        type === "popular"
    ) {

        filteredBooks.sort(
            (a, b) => {

                const scoreA =
                    (
                        Number(a.views || 0) +
                        Number(a.likes || 0) * 3 +
                        Number(a.downloads || 0) * 2
                    );


                const scoreB =
                    (
                        Number(b.views || 0) +
                        Number(b.likes || 0) * 3 +
                        Number(b.downloads || 0) * 2
                    );


                return scoreB - scoreA;

            }
        );

    }


    displayBooks(
        filteredBooks
    );


    /*
     * Active sorting button
     */

    if (updateButtons) {

        document
            .querySelectorAll(".sort-btn")
            .forEach(button => {

                button.classList.remove(
                    "active"
                );

            });


        const buttons =
            document.querySelectorAll(
                ".sort-btn"
            );


        const indexMap = {

            latest: 0,
            oldest: 1,
            liked: 2,
            popular: 3

        };


        const active =
            buttons[
                indexMap[type]
            ];


        if (active) {

            active.classList.add(
                "active"
            );

        }

    }

}


/*=========================================================
LATEST BOOK
=========================================================*/

function updateLatestBook() {

    if (
        !Array.isArray(allBooks) ||
        allBooks.length === 0
    ) {

        return;

    }


    /*
     * First priority:
     * book.latest === true
     *
     * If multiple latest books exist,
     * highest ID wins.
     */

    const latestBooks =
        allBooks.filter(
            book =>
                book.latest === true
        );


    let latest;


    if (latestBooks.length > 0) {

        latest =
            [...latestBooks].sort(
                (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
            )[0];

    } else {

        /*
         * If no latest flag exists,
         * highest ID becomes latest.
         */

        latest =
            [...allBooks].sort(
                (a, b) =>
                    Number(b.id || 0) -
                    Number(a.id || 0)
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


    const description =
        document.querySelector(
            ".latest-book .book-info p"
        );


    const buttons =
        document.querySelectorAll(
            ".latest-book .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover;


        image.alt =
            latest.title;


        image.onerror =
            function () {

                this.onerror = null;
                this.src = "logo.png";

            };

    }


    if (title) {

        title.innerText =
            latest.title;

    }


    if (author) {

        author.innerText =
            latest.author;

    }


    if (description) {

        description.innerText =
            latest.description;

    }


    /*
     * IMPORTANT:
     * Read Online goes to:
     *
     * reader.html?book=filename.pdf
     *
     * NOT:
     * book-2
     */

    if (buttons.length >= 1) {

        buttons[0].href =
            getReaderURL(latest);


        buttons[0].removeAttribute(
            "target"
        );


        buttons[0].dataset.bookId =
            latest.id;


        buttons[0].dataset.pdf =
            latest.pdf;

    }


    if (buttons.length >= 2) {

        buttons[1].href =
            getPDFURL(latest);


        buttons[1].setAttribute(
            "download",
            ""
        );


        buttons[1].dataset.bookId =
            latest.id;

    }


    console.log(
        "⭐ Latest book:",
        latest.title
    );


    console.log(
        "📖 Reader URL:",
        getReaderURL(latest)
    );

}


/*=========================================================
DOWNLOAD COUNTER
LOCAL COUNTER
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "a[download]"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        if (!bookId) return;


        const key =
            "chishti-download-" +
            bookId;


        let count =
            Number(
                localStorage.getItem(
                    key
                )
            ) || 0;


        count++;


        localStorage.setItem(
            key,
            count
        );


        /*
         * Update matching book.
         */

        const book =
            allBooks.find(
                b =>
                    String(b.id) ===
                    String(bookId)
            );


        if (book) {

            book.downloads =
                Number(book.downloads || 0) + 1;

        }

    }
);


/*=========================================================
READ COUNTER
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".read-book"
            );


        if (!button) return;


        const bookId =
            button.dataset.bookId;


        if (!bookId) return;


        const key =
            "chishti-read-" +
            bookId;


        let count =
            Number(
                localStorage.getItem(
                    key
                )
            ) || 0;


        count++;


        localStorage.setItem(
            key,
            count
        );

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
NAVBAR SHADOW
=========================================================*/

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


/*=========================================================
SCROLL REVEAL
=========================================================*/

function setupScrollReveal() {

    const sections =
        document.querySelectorAll(
            "section"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        sections.forEach(
            section =>
                section.classList.add(
                    "show-section"
                )
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


    sections.forEach(
        section =>
            observer.observe(
                section
            )
    );

}


document.addEventListener(
    "DOMContentLoaded",
    setupScrollReveal
);


/*=========================================================
IMAGE FALLBACK
=========================================================*/

document.addEventListener(
    "error",
    event => {

        const image =
            event.target;


        if (
            image &&
            image.tagName === "IMG"
        ) {

            if (
                !image.dataset.fallback
            ) {

                image.dataset.fallback =
                    "true";


                image.src =
                    "logo.png";

            }

        }

    },
    true
);


/*=========================================================
PRELOAD BOOK COVERS
=========================================================*/

function preloadBookCovers() {

    if (
        !Array.isArray(allBooks)
    ) return;


    allBooks.forEach(
        book => {

            if (!book.cover) return;


            const image =
                new Image();


            image.src =
                book.cover;

        }
    );

}


/*=========================================================
CHATBOT
=========================================================*/

let knowledge = [];


/*---------------------------------------------------------
LOAD KNOWLEDGE
---------------------------------------------------------*/

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "knowledge.json?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "knowledge.json not found"
            );

        }


        knowledge =
            await response.json();


        console.log(
            "✅ Knowledge Loaded"
        );


    } catch (error) {

        console.warn(
            "Knowledge loading error:",
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
CHAT ENTER
=========================================================*/

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
CHAT BOOK SEARCH
=========================================================*/

function searchBook(question) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    if (!q) return null;


    /*
     * Exact title first
     */

    let book =
        allBooks.find(
            item =>
                String(
                    item.title || ""
                )
                .toLowerCase()
                .trim() === q
        );


    /*
     * Partial search
     */

    if (!book) {

        book =
            allBooks.find(
                item => {

                    const title =
                        String(
                            item.title || ""
                        ).toLowerCase();


                    const author =
                        String(
                            item.author || ""
                        ).toLowerCase();


                    const category =
                        String(
                            item.category || ""
                        ).toLowerCase();


                    return (
                        title.includes(q) ||
                        author.includes(q) ||
                        category.includes(q)
                    );

                }
            );

    }


    if (!book) return null;


    return `

        <div class="chat-book-result">

            <strong>
                📚 ${escapeHTML(book.title)}
            </strong>

            <br>

            👤 ${escapeHTML(book.author)}

            <br>

            📂 ${escapeHTML(book.category)}

            <br><br>

            <a
                href="${getReaderURL(book)}"
                class="btn"
            >

                📖 Read Online

            </a>

            &nbsp;

            <a
                href="${escapeHTML(getPDFURL(book))}"
                download
                class="btn"
            >

                ⬇ Download

            </a>

        </div>

    `;

}


/*=========================================================
CHAT KNOWLEDGE SEARCH
=========================================================*/

function searchKnowledge(question) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    if (!Array.isArray(knowledge)) {

        return null;

    }


    for (
        const item of knowledge
    ) {

        const itemQuestion =
            String(
                item.question || ""
            ).toLowerCase();


        if (
            itemQuestion.includes(q)
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


    chatMessages.innerHTML += `

        <div class="bot-message">

            ${text}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
USER MESSAGE
=========================================================*/

function userReply(text) {

    if (!chatMessages) return;


    chatMessages.innerHTML += `

        <div class="user-message">

            ${escapeHTML(text)}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
SEND CHAT MESSAGE
=========================================================*/

function sendMessage() {

    if (!chatInput) return;


    const question =
        chatInput.value.trim();


    if (!question) return;


    userReply(
        question
    );


    chatInput.value =
        "";


    setTimeout(
        () => {

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

        },
        450
    );

}


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

function updateYear() {

    const year =
        byId("year");


    if (year) {

        year.innerText =
            new Date()
                .getFullYear();

    }

}


document.addEventListener(
    "DOMContentLoaded",
    updateYear
);


/*=========================================================
START EVERYTHING
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "===================================="
        );

        console.log(
            "📚 CHISHTI LIBRARY"
        );

        console.log(
            "Version : Premium Dynamic"
        );

        console.log(
            "Developer : Ali Hassan"
        );

        console.log(
            "===================================="
        );

        console.log(
            "✅ Firebase"
        );

        console.log(
            "✅ Visitor Counter"
        );

        console.log(
            "✅ Dynamic books.json"
        );

        console.log(
            "✅ Exact PDF Reader URLs"
        );

        console.log(
            "✅ Search"
        );

        console.log(
            "✅ Categories"
        );

        console.log(
            "✅ Sorting"
        );

        console.log(
            "✅ Likes"
        );

        console.log(
            "✅ Comments"
        );

        console.log(
            "✅ Sharing"
        );

        console.log(
            "✅ Downloads"
        );

        console.log(
            "✅ Chatbot"
        );

        console.log(
            "🚀 CHISHTI LIBRARY READY"
        );

    }
);


/*=========================================================
LOAD BOOK DATABASE
=========================================================*/

loadBooks();


/*=========================================================
FINAL BOOK PRELOAD
=========================================================*/

window.addEventListener(
    "load",
    () => {

        setTimeout(
            preloadBookCovers,
            500
        );

    }
);
