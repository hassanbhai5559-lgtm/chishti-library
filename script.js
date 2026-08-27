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


    const readUrl =
        book.url ||
        book.readUrl ||
        (
            pdf
                ? pdf
                : "books.html"
        );


    const likes =
        Number(
            book.likes || 0
        );


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
                    ${pdf ? 'target="_blank"' : ""}
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


            <div class="book-social-actions">

                <button
                    type="button"
                    class="like-book"
                    data-book-id="${escapeHtml(bookId)}"
                >

                    <i class="fa-regular fa-heart"></i>

                    <span>
                        ${likes}
                    </span>

                </button>


                <button
                    type="button"
                    class="comment-book"
                    data-book-id="${escapeHtml(bookId)}"
                >

                    <i class="fa-regular fa-comment"></i>

                    <span>
                        Comment
                    </span>

                </button>


                <button
                    type="button"
                    class="share-book"
                    data-book-id="${escapeHtml(bookId)}"
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


                    words.forEach(word => {

                        if (
                            title.includes(word)
                        ) {

                            score += 12;

                        }


                        if (
                            author.includes(word)
                        ) {

                            score += 8;

                        }


                        if (
                            category.includes(word)
                        ) {

                            score += 6;

                        }


                        if (
                            description.includes(word)
                        ) {

                            score += 3;

                        }

                    });


                    return {
                        book,
                        score
                    };

                })
                .filter(
                    item => item.score > 0
                )
                .sort(
                    (a, b) =>
                        b.score - a.score
                )
                .map(
                    item => item.book
                );

    }


    window.filteredBooks =
        filteredBooks;


    displayBooks(
        filteredBooks
    );

}


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


    if (image && latest.cover) {

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
            Number(book.createdAt.seconds) *
            1000
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
            button.querySelector("span");


        const icon =
            button.querySelector("i");


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
                    firebase.firestore.FieldValue
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
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


            await bookRef.set({

                likes:
                    firebase.firestore.FieldValue
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
            () => closeComments(modal)
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
   LOAD FIREBASE COMMENTS
   ========================================================= */

async function loadComments(
    bookId,
    modal
) {

    const list =
        modal.querySelector(
            "#commentsList"
        );


    if (!list) return;


    try {

        const snapshot =
            await firebase.firestore()
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(50)
                .get();


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML = `

                <div class="no-comments">

                    <div>
                        💬
                    </div>

                    <h3>
                        No comments yet
                    </h3>

                    <p>
                        Be the first to comment.
                    </p>

                </div>

            `;

            return;

        }


        snapshot.forEach(doc => {

            const data =
                doc.data();


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "comment-item";


            const email =
                data.email ||
                "";


            const name =
                email
                    ? email.split("@")[0]
                    : "Reader";


            const avatar =
                name
                    .charAt(0)
                    .toUpperCase();


            item.innerHTML = `

                <div class="comment-avatar">

                    ${escapeHtml(avatar)}

                </div>


                <div class="comment-content">

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <p>
                        ${escapeHtml(data.text || "")}
                    </p>

                </div>

            `;


            list.appendChild(
                item
            );

        });


    } catch (error) {

        console.error(
            "Comments error:",
            error
        );


        list.innerHTML = `

            <div class="no-comments">

                Unable to load comments.

            </div>

        `;

    }

}


/* =========================================================
   SUBMIT COMMENT
   ========================================================= */

async function submitComment(
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


    const text =
        input.value.trim();


    if (!text) return;


    if (text.length > 500) {

        showToast(
            "Comment is too long."
        );

        return;

    }


    try {

        await firebase.firestore()

            .collection("books")
            .doc(bookId)
            .collection("comments")
            .add({

                uid:
                    user.uid,

                email:
                    user.email ||
                    "Reader",

                text:
                    text,

                createdAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


        input.value = "";


        await loadComments(
            bookId,
            modal
        );


        showToast(
            "💬 Comment posted!"
        );


    } catch (error) {

        console.error(
            "Comment error:",
            error
        );


        showToast(
            "Comment could not be posted."
        );

    }

}


/* =========================================================
   CLOSE COMMENTS
   ========================================================= */

function closeComments(modal) {

    modal.classList.remove(
        "show"
    );


    setTimeout(() => {

        if (modal.parentNode) {

            modal.remove();

        }

    }, 300);

}


/* =========================================================
   SHARE
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
            allBooks.find(
                item =>
                    getBookId(item) ===
                    bookId
            );


        if (!book) return;


        shareBook(
            book
        );

    }
);


async function shareBook(book) {

    const title =
        book.title ||
        "Chishti Library";


    const pdf =
        book.pdf ||
        book.pdfUrl ||
        "";


    const url =
        book.url ||
        book.readUrl ||
        pdf ||
        window.location.href;


    const shareData = {

        title:
            title,

        text:
            `📚 Read "${title}" on Chishti Library`,

        url:
            new URL(
                url,
                window.location.href
            ).href

    };


    try {

        if (
            navigator.share
        ) {

            await navigator.share(
                shareData
            );

        } else {

            await navigator.clipboard.writeText(
                shareData.url
            );


            showToast(
                "🔗 Book link copied!"
            );

        }

    } catch (error) {

        if (
            error.name !==
            "AbortError"
        ) {

            console.error(
                "Share error:",
                error
            );

        }

    }

}


/* =========================================================
   LOGIN HELPER
   ========================================================= */

function getCurrentUser() {

    if (
        typeof firebase !== "undefined" &&
        firebase.auth
    ) {

        return firebase.auth().currentUser;

    }


    if (
        window.currentFirebaseUser
    ) {

        return window.currentFirebaseUser;

    }


    return null;

}


/* =========================================================
   REQUIRE LOGIN
   ========================================================= */

function requireLogin() {

    const user =
        getCurrentUser();


    if (user) {

        return true;

    }


    showToast(
        "🔐 Please login first."
    );


    setTimeout(() => {

        window.location.href =
            "./login.html";

    }, 700);


    return false;

}


/* =========================================================
   FIREBASE AUTH CHANGE
   ========================================================= */

if (
    typeof firebase !== "undefined" &&
    firebase.auth
) {

    firebase.auth()
        .onAuthStateChanged(user => {

            window.currentFirebaseUser =
                user || null;


            console.log(
                user
                    ? "✅ User logged in"
                    : "ℹ️ User logged out"
            );

        });

}


/* =========================================================
   LOCAL COUNTERS
   ========================================================= */

function incrementLocalCounter(
    key
) {

    let value =
        Number(
            localStorage.getItem(key)
        ) || 0;


    value++;


    localStorage.setItem(
        key,
        value
    );

}


/* =========================================================
   PREMIUM SCROLL ANIMATION
   ========================================================= */

function initPremiumAnimations() {

    const sections =
        document.querySelectorAll(
            "section"
        );


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

                        entry.target.classList.add(
                            "show-section"
                        );

                    }

                });

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


/* =========================================================
   BUTTON RIPPLE
   ========================================================= */

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


/* =========================================================
   BOOK CARD HOVER
   ========================================================= */

document.addEventListener(
    "mouseover",
    event => {

        const card =
            event.target.closest(
                ".book-card"
            );


        if (!card) return;


        card.classList.add(
            "book-hover"
        );

    }
);


document.addEventListener(
    "mouseout",
    event => {

        const card =
            event.target.closest(
                ".book-card"
            );


        if (!card) return;


        card.classList.remove(
            "book-hover"
        );

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

        } else {

            nav.classList.remove(
                "nav-shadow"
            );

        }

    }
);


/* =========================================================
   YEAR
   ========================================================= */

function initYear() {

    const year =
        document.getElementById(
            "year"
        );


    if (year) {

        year.textContent =
            new Date()
                .getFullYear();

    }

}


/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function initImageFallback() {

    document
        .querySelectorAll("img")
        .forEach(img => {

            img.addEventListener(
                "error",
                function() {

                    if (
                        this.src.includes(
                            "logo.png"
                        )
                    ) {

                        return;

                    }


                    this.src =
                        "logo.png";

                }
            );

        });

}


/* =========================================================
   PRELOAD BOOK COVERS
   ========================================================= */

function preloadBookCovers() {

    allBooks.forEach(book => {

        const cover =
            book.cover ||
            book.coverUrl;


        if (!cover) return;


        const image =
            new Image();


        image.src =
            cover;

    });

}


/* =========================================================
   SMOOTH ANCHOR LINKS
   ========================================================= */

function initSmoothLinks() {

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(anchor => {

            anchor.addEventListener(
                "click",
                event => {

                    const selector =
                        anchor.getAttribute(
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


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior: "smooth"
                    });

                }
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
   NORMALIZE
   ========================================================= */

function normalize(value) {

    return String(
        value || ""
    )
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[-_]/g, " ")
    .replace(
        /[^\p{L}\p{N}\s]/gu,
        " "
    )
    .replace(
        /\s+/g,
        " "
    )
    .trim();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(value) {

    return String(
        value || ""
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
   SAFE URL
   ========================================================= */

function safeUrl(value) {

    const url =
        String(
            value || ""
        ).trim();


    if (!url) {

        return "#";

    }


    if (
        /^javascript:/i.test(url)
    ) {

        return "#";

    }


    return url;

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
        toast._timer
    );


    toast._timer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2300);

}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.displayBooks =
    displayBooks;


window.searchBooks =
    searchBooks;


window.latestBook =
    latestBook;


window.createBookCard =
    createBookCard;


window.getBookId =
    getBookId;


window.showToast =
    showToast;


window.escapeHtml =
    escapeHtml;


window.safeUrl =
    safeUrl;


/* =========================================================
   FINAL STATUS
   ========================================================= */

console.log(
    "======================================"
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "🚀 CLEAN PREMIUM SCRIPT"
);

console.log(
    "======================================"
);

console.log(
    "✅ Loader"
);

console.log(
    "✅ Mobile Menu"
);

console.log(
    "✅ Books JSON"
);

console.log(
    "✅ displayBooks()"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Category Filter"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Firebase Likes"
);

console.log(
    "✅ Firebase Comments"
);

console.log(
    "✅ Emoji Comments"
);

console.log(
    "✅ Share"
);

console.log(
    "✅ Login Protection"
);

console.log(
    "✅ Download Counter"
);

console.log(
    "✅ Read Counter"
);

console.log(
    "✅ Premium Animations"
);

console.log(
    "❌ Chatbot NOT included"
);

console.log(
    "======================================"
);

/* =========================================================
   CHISHTI LIBRARY
   BOOK VIEWS + DOWNLOADS + LIKES COUNTER
   END-PASTE SYSTEM
   Does NOT replace existing functions
========================================================= */

(function () {

    "use strict";

    console.log("📊 Chishti Library counters system loading...");

    /* =====================================================
       FIREBASE CHECK
    ===================================================== */

    function getDB() {

        if (window.db) {
            return window.db;
        }

        if (
            typeof firebase !== "undefined" &&
            firebase.apps &&
            firebase.apps.length
        ) {
            return firebase.firestore();
        }

        console.error("❌ Firebase Firestore not available.");
        return null;
    }


    /* =====================================================
       GET BOOK ID
    ===================================================== */

    function getBookId(element) {

        if (!element) return null;

        return (
            element.dataset.bookId ||
            element.dataset.id ||
            element.getAttribute("data-book-id") ||
            element.getAttribute("data-id") ||
            null
        );

    }


    /* =====================================================
       FIND BOOK ID FROM URL
    ===================================================== */

    function getBookIdFromURL() {

        const params =
            new URLSearchParams(window.location.search);

        return (
            params.get("id") ||
            params.get("book") ||
            params.get("bookId")
        );

    }


    /* =====================================================
       INCREMENT FIRESTORE COUNTER
    ===================================================== */

    async function incrementCounter(bookId, field) {

        if (!bookId) {
            console.warn("⚠️ No book ID found.");
            return;
        }

        const db = getDB();

        if (!db) return;

        try {

            await db
                .collection("books")
                .doc(bookId)
                .update({

                    [field]:
                        firebase.firestore.FieldValue.increment(1)

                });

            console.log(
                `✅ ${field} +1`,
                bookId
            );

        } catch (error) {

            /*
             If field doesn't exist, Firestore increment
             still normally creates it.
            */

            console.error(
                `❌ Counter error (${field}):`,
                error
            );

        }

    }


    /* =====================================================
       UPDATE COUNTER ON SCREEN
    ===================================================== */

    function updateCounterDisplay(
        bookId,
        field,
        value
    ) {

        const selectors = [

            `[data-${field}="${bookId}"]`,

            `[data-book-id="${bookId}"] .${field}`,

            `#${field}-${bookId}`,

            `#book-${field}-${bookId}`

        ];


        selectors.forEach(selector => {

            document
                .querySelectorAll(selector)
                .forEach(element => {

                    element.textContent =
                        Number(value || 0);

                });

        });

    }


    /* =====================================================
       LOAD BOOK COUNTERS
    ===================================================== */

    async function loadBookCounters(bookId) {

        if (!bookId) return;

        const db = getDB();

        if (!db) return;

        try {

            const doc =
                await db
                    .collection("books")
                    .doc(bookId)
                    .get();

            if (!doc.exists) {

                console.warn(
                    "⚠️ Book not found:",
                    bookId
                );

                return;

            }

            const data =
                doc.data();


            updateCounterDisplay(
                bookId,
                "views",
                data.views
            );


            updateCounterDisplay(
                bookId,
                "downloads",
                data.downloads
            );


            updateCounterDisplay(
                bookId,
                "likes",
                data.likes
            );


        } catch (error) {

            console.error(
                "❌ Could not load counters:",
                error
            );

        }

    }


    /* =====================================================
       VIEW COUNTER
    ===================================================== */

    async function countBookView(bookId) {

        if (!bookId) return;

        /*
        Prevent multiple view counts during the same
        page session.
        */

        const key =
            "chishti_view_" + bookId;

        if (
            sessionStorage.getItem(key)
        ) {

            return;

        }

        sessionStorage.setItem(
            key,
            "1"
        );


        await incrementCounter(
            bookId,
            "views"
        );

    }


    /* =====================================================
       DOWNLOAD COUNTER
    ===================================================== */

    async function countBookDownload(bookId) {

        if (!bookId) return;

        await incrementCounter(
            bookId,
            "downloads"
        );

    }


    /* =====================================================
       LIKE COUNTER
    ===================================================== */

    async function countBookLike(bookId) {

        if (!bookId) return;

        const key =
            "chishti_like_" + bookId;


        /*
        One like per browser.
        */

        if (
            localStorage.getItem(key)
        ) {

            return false;

        }


        localStorage.setItem(
            key,
            "1"
        );


        await incrementCounter(
            bookId,
            "likes"
        );


        return true;

    }


    /* =====================================================
       AUTO DETECT CURRENT BOOK
    ===================================================== */

    function detectCurrentBook() {

        let bookId =
            getBookIdFromURL();


        /*
        Look for common book elements.
        */

        if (!bookId) {

            const element =
                document.querySelector(
                    "[data-book-id], [data-id]"
                );

            if (element) {

                bookId =
                    getBookId(element);

            }

        }


        return bookId;

    }


    /* =====================================================
       AUTOMATIC VIEW COUNT
    ===================================================== */

    function startAutomaticViewCounter() {

        const bookId =
            detectCurrentBook();


        if (!bookId) {

            console.log(
                "ℹ️ No current book ID detected."
            );

            return;

        }


        console.log(
            "📖 Current book:",
            bookId
        );


        loadBookCounters(
            bookId
        );


        countBookView(
            bookId
        );

    }


    /* =====================================================
       DOWNLOAD BUTTON LISTENER
    ===================================================== */

    function setupDownloadCounters() {

        document.addEventListener(
            "click",
            function (event) {

                const link =
                    event.target.closest(
                        "a"
                    );


                if (!link) return;


                const href =
                    link.getAttribute(
                        "href"
                    ) || "";


                const isDownload =
                    link.hasAttribute("download") ||
                    /pdf/i.test(href);


                if (!isDownload) return;


                let bookId =
                    getBookId(link);


                if (!bookId) {

                    const parent =
                        link.closest(
                            "[data-book-id]"
                        );


                    if (parent) {

                        bookId =
                            getBookId(parent);

                    }

                }


                if (!bookId) {

                    bookId =
                        getBookIdFromURL();

                }


                if (bookId) {

                    countBookDownload(
                        bookId
                    );

                }

            },
            true
        );

    }


    /* =====================================================
       LIKE BUTTON LISTENER
    ===================================================== */

    function setupLikeCounters() {

        document.addEventListener(
            "click",
            async function (event) {

                const button =
                    event.target.closest(
                        "[data-like-book], .like-btn, .book-like"
                    );


                if (!button) return;


                let bookId =
                    getBookId(button);


                if (!bookId) {

                    const parent =
                        button.closest(
                            "[data-book-id]"
                        );


                    if (parent) {

                        bookId =
                            getBookId(parent);

                    }

                }


                if (!bookId) {

                    bookId =
                        getBookIdFromURL();

                }


                if (!bookId) return;


                const liked =
                    await countBookLike(
                        bookId
                    );


                if (liked) {

                    button.classList.add(
                        "liked"
                    );


                    const count =
                        button.querySelector(
                            ".likes"
                        );


                    if (count) {

                        count.textContent =
                            Number(
                                count.textContent || 0
                            ) + 1;

                    }

                }

            },
            true
        );

    }


    /* =====================================================
       GLOBAL FUNCTIONS
       You can call these from existing HTML/JS
    ===================================================== */

    window.chishtiCountView =
        countBookView;

    window.chishtiCountDownload =
        countBookDownload;

    window.chishtiCountLike =
        countBookLike;

    window.chishtiLoadCounters =
        loadBookCounters;


    /* =====================================================
       START
    ===================================================== */

    function start() {

        setupDownloadCounters();

        setupLikeCounters();

        startAutomaticViewCounter();

    }


    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }


    console.log(
        "✅ Chishti counters system ready"
    );

})();
