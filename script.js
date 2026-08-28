/* =========================================================
   CHISHTI LIBRARY
   FINAL SCRIPT.JS
   CHATBOT REMOVED
   DIRECT PDF READER
   1 SECOND BOOK CAROUSEL
========================================================= */

"use strict";


/* =========================================================
   GLOBAL
========================================================= */

let allBooks = [];

let searchResults = [];

let carouselTimers = {};

let carouselPositions = {};


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    setTimeout(function () {

        if (!loader) return;

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        setTimeout(function () {

            loader.remove();

        }, 700);

    }, 1200);

});


/* =========================================================
   LOAD BOOKS.JSON
========================================================= */

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok) {

            throw new Error("books.json not found");

        }

        allBooks = await response.json();

        searchResults = [...allBooks];


        console.log(
            "✅ Books Loaded:",
            allBooks.length
        );


        renderAllSections();


    } catch (error) {

        console.error(
            "❌ Books Loading Error:",
            error
        );

        showBooksError();

    }

}


/* =========================================================
   RENDER ALL SECTIONS
========================================================= */

function renderAllSections() {

    renderBooks(
        allBooks,
        "allBooksContainer"
    );


    const latest = allBooks.filter(function (book) {

        return book.latest === true;

    });


    const popular = [...allBooks]
        .sort(function (a, b) {

            return (
                Number(b.views || 0) -
                Number(a.views || 0)
            );

        })
        .slice(0, Math.max(8, Math.min(allBooks.length, 12)));


    const oldBooks = allBooks.filter(function (book) {

        return book.old === true;

    });


    renderBooks(
        latest.length ? latest : allBooks.slice(0, 12),
        "latestBooks"
    );


    renderBooks(
        popular,
        "popularBooks"
    );


    renderBooks(
        oldBooks.length ? oldBooks : allBooks.slice(-12),
        "oldBooks"
    );


    startAllCarousels();

}


/* =========================================================
   RENDER BOOKS
========================================================= */

function renderBooks(books, containerId) {

    const container =
        document.getElementById(containerId);

    if (!container) return;


    container.innerHTML = "";


    if (!books || books.length === 0) {

        container.innerHTML = `

            <div class="no-books">

                <h3>
                    No Books Found
                </h3>

                <p>
                    Books will appear here soon.
                </p>

            </div>

        `;

        return;

    }


    books.forEach(function (book, index) {

        const card =
            createBookCard(book, index);

        container.insertAdjacentHTML(
            "beforeend",
            card
        );

    });

}


/* =========================================================
   CREATE BOOK CARD
========================================================= */

function createBookCard(book, index) {

    const title =
        escapeHTML(book.title || "Untitled Book");


    const author =
        escapeHTML(book.author || "Unknown Author");


    const category =
        escapeHTML(book.category || "Islamic Book");


    const description =
        escapeHTML(
            book.description ||
            "Islamic knowledge and valuable reading material."
        );


    const cover =
        book.cover ||
        "logo.png";


    const pdf =
        book.pdf ||
        "#";


    const likes =
        getBookCounter(
            book,
            "likes"
        );


    const views =
        getBookCounter(
            book,
            "views"
        );


    const downloads =
        getBookCounter(
            book,
            "downloads"
        );


    const shares =
        getBookCounter(
            book,
            "shares"
        );


    return `

        <article
            class="book-card"
            data-book-index="${index}">

            <div class="book-cover">

                <span class="book-category">
                    ${category}
                </span>

                <img
                    src="${cover}"
                    alt="${title}"
                    loading="lazy"
                    onerror="this.src='logo.png';">

            </div>


            <div class="book-content">

                <h3>
                    ${title}
                </h3>


                <div class="book-author">
                    ${author}
                </div>


                <p class="book-description">
                    ${description}
                </p>


                <div class="book-stats">

                    <button
                        class="stat-btn like-btn"
                        data-action="like"
                        data-pdf="${escapeAttribute(pdf)}"
                        title="Like">

                        ❤️
                        <span class="like-count">
                            ${likes}
                        </span>

                    </button>


                    <button
                        class="stat-btn share-btn"
                        data-action="share"
                        data-title="${escapeAttribute(title)}"
                        data-pdf="${escapeAttribute(pdf)}"
                        title="Share">

                        🔗
                        <span class="share-count">
                            ${shares}
                        </span>

                    </button>


                    <span class="stat-btn">

                        👁
                        <span>
                            ${views}
                        </span>

                    </span>


                    <span class="stat-btn">

                        ⬇
                        <span>
                            ${downloads}
                        </span>

                    </span>

                </div>


                <div class="book-actions">

                    <!-- DIRECT PDF -->
                    <a
                        href="${pdf}"
                        target="_blank"
                        rel="noopener"
                        class="book-btn read-btn"
                        data-action="read"
                        data-pdf="${escapeAttribute(pdf)}">

                        📖 READ ONLINE

                    </a>


                    <!-- DIRECT DOWNLOAD -->
                    <a
                        href="${pdf}"
                        download
                        class="book-btn download-btn"
                        data-action="download"
                        data-pdf="${escapeAttribute(pdf)}">

                        ⬇ DOWNLOAD

                    </a>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   COUNTER
========================================================= */

function getBookCounter(book, type) {

    const pdf =
        book.pdf || book.title || "book";


    const key =
        "chishti_" +
        type +
        "_" +
        btoa(unescape(encodeURIComponent(pdf)))
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 80);


    const stored =
        Number(
            localStorage.getItem(key)
        );


    if (stored > 0) {

        return stored;

    }


    return Number(book[type] || 0);

}


/* =========================================================
   INCREMENT COUNTER
========================================================= */

function incrementBookCounter(
    pdf,
    type,
    amount = 1
) {

    if (!pdf) return 0;


    const safeKey =
        btoa(unescape(encodeURIComponent(pdf)))
            .replace(/[^a-zA-Z0-9]/g, "")
            .substring(0, 80);


    const key =
        "chishti_" +
        type +
        "_" +
        safeKey;


    let current =
        Number(
            localStorage.getItem(key)
        ) || 0;


    current += amount;


    localStorage.setItem(
        key,
        current
    );


    return current;

}


/* =========================================================
   FIND BOOK CARD
========================================================= */

function getBookFromPDF(pdf) {

    return allBooks.find(function (book) {

        return book.pdf === pdf;

    });

}


/* =========================================================
   LIKE
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(".like-btn");

        if (!button) return;


        const pdf =
            button.dataset.pdf;


        const alreadyLiked =
            localStorage.getItem(
                "liked_" + pdf
            );


        if (alreadyLiked) {

            return;

        }


        localStorage.setItem(
            "liked_" + pdf,
            "true"
        );


        const newCount =
            incrementBookCounter(
                pdf,
                "likes"
            );


        const count =
            button.querySelector(
                ".like-count"
            );


        if (count) {

            count.textContent =
                newCount;

        }


        button.style.transform =
            "scale(1.15)";


        setTimeout(function () {

            button.style.transform =
                "scale(1)";

        }, 180);

    }
);


/* =========================================================
   SHARE
========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(".share-btn");

        if (!button) return;


        const pdf =
            button.dataset.pdf;


        const title =
            button.dataset.title ||
            "Chishti Library Book";


        const shareURL =
            new URL(
                pdf,
                window.location.href
            ).href;


        try {

            if (
                navigator.share
            ) {

                await navigator.share({

                    title: title,

                    text:
                        "Read this book from Chishti Library",

                    url: shareURL

                });

            } else {

                await navigator.clipboard.writeText(
                    shareURL
                );

                alert(
                    "Book link copied!"
                );

            }


            const newCount =
                incrementBookCounter(
                    pdf,
                    "shares"
                );


            const count =
                button.querySelector(
                    ".share-count"
                );


            if (count) {

                count.textContent =
                    newCount;

            }

        }

        catch (error) {

            console.log(
                "Share cancelled."
            );

        }

    }
);


/* =========================================================
   VIEW / READ COUNTER
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".read-btn"
            );

        if (!button) return;


        const pdf =
            button.dataset.pdf;


        incrementBookCounter(
            pdf,
            "views"
        );

    }
);


/* =========================================================
   DOWNLOAD COUNTER
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".download-btn"
            );

        if (!button) return;


        const pdf =
            button.dataset.pdf;


        incrementBookCounter(
            pdf,
            "downloads"
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

const searchInput =
    document.getElementById(
        "searchInput"
    );


const searchBtn =
    document.getElementById(
        "searchBtn"
    );


function performSearch() {

    if (!searchInput) return;


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    if (!query) {

        searchResults =
            [...allBooks];

    }

    else {

        searchResults =
            allBooks.filter(
                function (book) {

                    return (

                        String(
                            book.title || ""
                        )
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(
                            book.author || ""
                        )
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(
                            book.category || ""
                        )
                            .toLowerCase()
                            .includes(query)

                        ||

                        String(
                            book.language || ""
                        )
                            .toLowerCase()
                            .includes(query)

                    );

                }
            );

    }


    renderBooks(
        searchResults,
        "allBooksContainer"
    );


    stopCarousel(
        "allBooksContainer"
    );


    startCarousel(
        "allBooksContainer"
    );

}


if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        performSearch
    );

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        performSearch
    );

}


/* =========================================================
   CAROUSEL
   ONE BOOK = ONE SECOND
========================================================= */

function getBookMoveAmount(container) {

    const card =
        container.querySelector(
            ".book-card"
        );


    if (!card) {

        return 300;

    }


    const styles =
        window.getComputedStyle(
            container
        );


    const gap =
        parseFloat(
            styles.columnGap ||
            styles.gap ||
            24
        );


    return (
        card.getBoundingClientRect().width +
        gap
    );

}


/* =========================================================
   START CAROUSEL
========================================================= */

function startCarousel(containerId) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    stopCarousel(containerId);


    if (
        container.children.length <= 4
    ) {

        return;

    }


    carouselPositions[
        containerId
    ] = 0;


    carouselTimers[
        containerId
    ] = setInterval(
        function () {

            moveCarousel(
                containerId,
                1
            );

        },
        1000
    );


    container.addEventListener(
        "mouseenter",
        function () {

            stopCarousel(
                containerId
            );

        },
        {
            once: false
        }
    );


    container.addEventListener(
        "mouseleave",
        function () {

            startCarousel(
                containerId
            );

        },
        {
            once: false
        }
    );

}


/* =========================================================
   MOVE CAROUSEL
========================================================= */

function moveCarousel(
    containerId,
    direction
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) return;


    const cards =
        container.querySelectorAll(
            ".book-card"
        );


    if (cards.length <= 4) return;


    const moveAmount =
        getBookMoveAmount(
            container
        );


    const maxPosition =
        cards.length - 4;


    let position =
        carouselPositions[
            containerId
        ] || 0;


    position += direction;


    if (
        position > maxPosition
    ) {

        position = 0;

    }


    if (position < 0) {

        position = maxPosition;

    }


    carouselPositions[
        containerId
    ] = position;


    container.scrollTo({

        left:
            position *
            moveAmount,

        behavior: "smooth"

    });

}


/* =========================================================
   STOP CAROUSEL
========================================================= */

function stopCarousel(containerId) {

    if (
        carouselTimers[
            containerId
        ]
    ) {

        clearInterval(
            carouselTimers[
                containerId
            ]
        );


        carouselTimers[
            containerId
        ] = null;

    }

}


/* =========================================================
   START ALL CAROUSELS
========================================================= */

function startAllCarousels() {

    [
        "latestBooks",
        "popularBooks",
        "oldBooks",
        "allBooksContainer"

    ].forEach(function (id) {

        startCarousel(id);

    });

}


/* =========================================================
   ARROW BUTTONS
========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".carousel-arrow"
            );


        if (!button) return;


        const target =
            button.dataset.target;


        stopCarousel(target);


        if (
            button.classList.contains(
                "carousel-next"
            )
        ) {

            moveCarousel(
                target,
                1
            );

        }

        else {

            moveCarousel(
                target,
                -1
            );

        }


        setTimeout(
            function () {

                startCarousel(
                    target
                );

            },
            1800
        );

    }
);


/* =========================================================
   WHATSAPP
========================================================= */

const whatsappBtn =
    document.getElementById(
        "whatsappBtn"
    );


const whatsappContacts =
    document.getElementById(
        "whatsappContacts"
    );


if (whatsappBtn) {

    whatsappBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            whatsappContacts.classList.toggle(
                "show"
            );

        }
    );

}


document.addEventListener(
    "click",
    function (event) {

        if (
            whatsappContacts &&
            !event.target.closest(
                ".whatsapp-container"
            )
        ) {

            whatsappContacts.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   SCROLL TOP
========================================================= */

const scrollTop =
    document.getElementById(
        "scrollTop"
    );


window.addEventListener(
    "scroll",
    function () {

        if (!scrollTop) return;


        if (
            window.scrollY > 350
        ) {

            scrollTop.style.display =
                "block";

        }

        else {

            scrollTop.style.display =
                "none";

        }

    }
);


if (scrollTop) {

    scrollTop.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =========================================================
   YEAR
========================================================= */

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.textContent =
        new Date().getFullYear();

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
   ESCAPE ATTRIBUTE
========================================================= */

function escapeAttribute(value) {

    return String(value || "")
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
   BOOK ERROR
========================================================= */

function showBooksError() {

    [
        "latestBooks",
        "popularBooks",
        "oldBooks",
        "allBooksContainer"

    ].forEach(function (id) {

        const container =
            document.getElementById(id);


        if (!container) return;


        container.innerHTML = `

            <div class="no-books">

                <h3>
                    Books Could Not Be Loaded
                </h3>

                <p>
                    Please make sure
                    <b>books.json</b>
                    is uploaded correctly.
                </p>

            </div>

        `;

    });

}


/* =========================================================
   DIRECT PDF CHECK
========================================================= */

function checkAlRehmanPDF() {

    const expectedPDF =
        "Al%20Rehman%20..%20Latif%20Sajid.C.pdf";


    const book =
        allBooks.find(
            function (item) {

                return String(
                    item.pdf || ""
                ).includes(
                    "Al%20Rehman"
                );

            }
        );


    if (book) {

        console.log(
            "✅ Al-Rehman PDF:",
            book.pdf
        );

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

loadBooks();


console.log(
    "======================================"
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "✅ Chatbot Removed"
);

console.log(
    "✅ Direct PDF Reader"
);

console.log(
    "✅ 1 Second Carousel"
);

console.log(
    "✅ Latest / Popular / Old"
);

console.log(
    "✅ Like / Share / View / Download"
);

console.log(
    "✅ WhatsApp Contacts"
);

console.log(
    "======================================"
);
