"use strict";

/*
=========================================================
CHISHTI LIBRARY
BOOKS SYSTEM
=========================================================

Uses:

firebase.js
books.json

Systems:

- Books
- Search
- Categories
- Sorting
- Likes
- Views
- Bookmarks
- Shares
- Downloads
- Login/Profile
=========================================================
*/


let allBooks = [];

let filteredBooks = [];

let currentCategory = "All";

let currentSort = "latest";



/* =====================================================
   ELEMENTS
===================================================== */

const booksContainer =
    document.getElementById("booksContainer");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const noBooks =
    document.getElementById("noBooks");

const resultsText =
    document.getElementById("resultsText");



/* =====================================================
   LOAD BOOKS
===================================================== */

async function loadBooks() {

    try {

        const response =
            await fetch("./books.json");

        if (!response.ok) {

            throw new Error(
                "books.json could not be loaded"
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


        updateBookCounter();

        renderBooks();


        console.log(
            "✅ Books loaded:",
            allBooks.length
        );

    }

    catch (error) {

        console.error(
            "❌ Books loading error:",
            error
        );


        booksContainer.innerHTML = `

            <div class="loader">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <span>
                    Books could not be loaded.
                </span>

            </div>

        `;

    }

}



/* =====================================================
   SORT
===================================================== */

function sortBooks(sortType) {

    currentSort =
        sortType;


    document
        .querySelectorAll(".sort-btn")
        .forEach(function(button) {

            button.classList.remove(
                "active"
            );

        });


    const activeButton =
        document.querySelector(
            `.sort-btn[data-sort="${sortType}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    renderBooks();

}



/* =====================================================
   CATEGORY
===================================================== */

function filterBooks(category) {

    currentCategory =
        category;


    document
        .querySelectorAll(".category")
        .forEach(function(button) {

            button.classList.remove(
                "active"
            );

        });


    const active =
        document.querySelector(
            `.category[data-category="${category}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

    }


    renderBooks();

}



/* =====================================================
   SEARCH
===================================================== */

function searchBooks() {

    renderBooks();

}


if (searchInput) {

    searchInput.addEventListener(
        "input",
        searchBooks
    );

}



if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        function() {

            searchInput.value = "";

            renderBooks();

            searchInput.focus();

        }
    );

}



/* =====================================================
   GET DATE
===================================================== */

function getBookDate(book) {

    return new Date(

        book.date ||
        book.createdAt ||
        book.uploadDate ||
        book.publishedDate ||
        0

    ).getTime();

}



/* =====================================================
   GET FIREBASE DATA
===================================================== */

async function getFirebaseBookData(book) {

    if (!window.db) {

        return {

            likes: Number(book.likes || 0),

            views: Number(book.views || 0),

            shares: Number(book.shares || 0),

            downloads:
                Number(book.downloads || 0)

        };

    }


    const id =
        getBookId(book);


    try {

        const snap =
            await window.db
                .collection("books")
                .doc(id)
                .get();


        if (!snap.exists) {

            return {

                likes:
                    Number(book.likes || 0),

                views:
                    Number(book.views || 0),

                shares:
                    Number(book.shares || 0),

                downloads:
                    Number(book.downloads || 0)

            };

        }


        return {

            ...book,

            ...snap.data()

        };

    }

    catch (error) {

        console.error(
            "Firebase book data error:",
            error
        );


        return {

            likes:
                Number(book.likes || 0),

            views:
                Number(book.views || 0),

            shares:
                Number(book.shares || 0),

            downloads:
                Number(book.downloads || 0)

        };

    }

}



/* =====================================================
   BOOK ID
===================================================== */

function getBookId(book) {

    if (book.id) {

        return String(book.id);

    }


    return String(
        book.title || "book"
    )
        .toLowerCase()
        .trim()
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}



/* =====================================================
   SORT BOOK ARRAY
===================================================== */

function sortBookArray(books) {

    const copy =
        [...books];


    if (
        currentSort ===
        "latest"
    ) {

        copy.sort(
            (a, b) =>
                getBookDate(b) -
                getBookDate(a)
        );

    }


    else if (
        currentSort ===
        "oldest"
    ) {

        copy.sort(
            (a, b) =>
                getBookDate(a) -
                getBookDate(b)
        );

    }


    else if (
        currentSort ===
        "liked"
    ) {

        copy.sort(
            (a, b) =>
                Number(b.likes || 0) -
                Number(a.likes || 0)
        );

    }


    else if (
        currentSort ===
        "popular"
    ) {

        copy.sort(
            function(a, b) {

                const scoreA =

                    Number(a.views || 0) +

                    Number(a.likes || 0) * 3 +

                    Number(a.downloads || 0) * 2 +

                    Number(a.shares || 0) * 2;


                const scoreB =

                    Number(b.views || 0) +

                    Number(b.likes || 0) * 3 +

                    Number(b.downloads || 0) * 2 +

                    Number(b.shares || 0) * 2;


                return scoreB - scoreA;

            }
        );

    }


    return copy;

}



/* =====================================================
   RENDER BOOKS
===================================================== */

async function renderBooks() {

    let books =
        [...allBooks];


    /* SEARCH */

    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    if (search) {

        books =
            books.filter(
                function(book) {

                    return (

                        String(
                            book.title || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            book.author || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            book.category || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            book.language || ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    /* CATEGORY */

    if (
        currentCategory !==
        "All"
    ) {

        books =
            books.filter(
                function(book) {

                    return String(
                        book.category ||
                        ""
                    )
                    .toLowerCase() ===
                    currentCategory
                        .toLowerCase();

                }
            );

    }


    books =
        sortBookArray(
            books
        );


    filteredBooks =
        books;


    /* EMPTY */

    if (!books.length) {

        booksContainer.innerHTML =
            "";

        noBooks.hidden =
            false;

        resultsText.textContent =
            "0 books found";

        return;

    }


    noBooks.hidden =
        true;


    resultsText.textContent =
        `${books.length} books found`;


    booksContainer.innerHTML =
        books
            .map(
                createBookCard
            )
            .join("");


    updateBookCounter();

}



/* =====================================================
   CREATE CARD
===================================================== */

function createBookCard(book) {

    const id =
        getBookId(book);


    const title =
        escapeHTML(
            book.title ||
            "Untitled Book"
        );


    const author =
        escapeHTML(
            book.author ||
            "Unknown Author"
        );


    const category =
        escapeHTML(
            book.category ||
            "Islamic Book"
        );


    const description =
        escapeHTML(
            book.description ||
            "Islamic literary work from Chishti Library."
        );


    const cover =
        escapeAttribute(
            book.cover ||
            "./logo.png"
        );


    const pdf =
        escapeAttribute(
            book.pdf ||
            "#"
        );


    const likes =
        Number(
            book.likes || 0
        );


    const views =
        Number(
            book.views || 0
        );


    const downloads =
        Number(
            book.downloads || 0
        );


    return `

        <article
            class="book-card"
            data-book-id="${escapeAttribute(id)}">

            <div class="book-cover">

                <img
                    src="${cover}"
                    alt="${title}"
                    loading="lazy"
                    onerror="this.src='./logo.png'">

                <span class="book-category">

                    ${category}

                </span>

            </div>


            <div class="book-info">

                <h3>
                    ${title}
                </h3>


                <div class="author">

                    <i class="fa-solid fa-user"></i>

                    ${author}

                </div>


                <p>
                    ${description}
                </p>


                <div class="book-meta">

                    <span>
                        <i class="fa-solid fa-eye"></i>
                        <span class="view-count">
                            ${views}
                        </span>
                    </span>


                    <span>
                        <i class="fa-solid fa-heart"></i>
                        <span class="like-count">
                            ${likes}
                        </span>
                    </span>


                    <span>
                        <i class="fa-solid fa-download"></i>
                        ${downloads}
                    </span>

                </div>


                <div class="book-actions">

                    <a
                        href="./reader.html?book=${encodeURIComponent(pdf)}"
                        class="book-btn read-btn">

                        <i class="fa-solid fa-book-open"></i>

                        Read

                    </a>


                    <a
                        href="${pdf}"
                        download
                        class="book-btn download-btn"
                        data-download-id="${escapeAttribute(id)}">

                        <i class="fa-solid fa-download"></i>

                        Download

                    </a>

                </div>


                <div class="extra-actions">

                    <button
                        class="icon-btn like"
                        data-action="like"
                        data-id="${escapeAttribute(id)}"
                        title="Like">

                        <i class="fa-solid fa-heart"></i>

                    </button>


                    <button
                        class="icon-btn"
                        data-action="bookmark"
                        data-id="${escapeAttribute(id)}"
                        title="Bookmark">

                        <i class="fa-solid fa-bookmark"></i>

                    </button>


                    <button
                        class="icon-btn"
                        data-action="share"
                        data-id="${escapeAttribute(id)}"
                        title="Share">

                        <i class="fa-solid fa-share-nodes"></i>

                    </button>

                </div>

            </div>

        </article>

    `;

}



/* =====================================================
   CARD ACTIONS
===================================================== */

document.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const id =
            button.dataset.id;


        const book =
            allBooks.find(
                function(item) {

                    return getBookId(item) === id;

                }
            );


        if (!book) {

            return;

        }


        if (
            action ===
            "like"
        ) {

            await toggleLike(
                book,
                button
            );

        }


        else if (
            action ===
            "bookmark"
        ) {

            await toggleBookmark(
                book,
                button
            );

        }


        else if (
            action ===
            "share"
        ) {

            await shareBook(
                book
            );

        }

    }
);



/* =====================================================
   LIKE
===================================================== */

async function toggleLike(
    book,
    button
) {

    if (
        !window.currentFirebaseUser
    ) {

        if (
            window.requireLogin
        ) {

            window.requireLogin();

        }

        return;

    }


    const user =
        window.currentFirebaseUser;


    const bookId =
        getBookId(book);


    const likeRef =
        window.db
            .collection("books")
            .doc(bookId)
            .collection("likes")
            .doc(user.uid);


    try {

        const snap =
            await likeRef.get();


        const bookRef =
            window.db
                .collection("books")
                .doc(bookId);


        if (snap.exists) {

            await likeRef.delete();


            await bookRef.set(
                {
                    likes:
                        firebase.firestore.FieldValue.increment(-1)
                },
                {
                    merge: true
                }
            );


            button.classList.remove(
                "active"
            );

        }

        else {

            await likeRef.set({

                uid:
                    user.uid,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


            await bookRef.set(
                {
                    title:
                        book.title,

                    author:
                        book.author,

                    likes:
                        firebase.firestore.FieldValue.increment(1)

                },
                {
                    merge: true
                }
            );


            button.classList.add(
                "active"
            );

        }


        await renderBooks();

    }

    catch (error) {

        console.error(
            "Like error:",
            error
        );

        alert(
            "Like could not be saved."
        );

    }

}



/* =====================================================
   BOOKMARK
===================================================== */

async function toggleBookmark(
    book,
    button
) {

    if (
        !window.currentFirebaseUser
    ) {

        if (
            window.requireLogin
        ) {

            window.requireLogin();

        }

        return;

    }


    const user =
        window.currentFirebaseUser;


    const bookmarkRef =
        window.db
            .collection("users")
            .doc(user.uid)
            .collection("bookmarks")
            .doc(
                getBookId(book)
            );


    try {

        const snap =
            await bookmarkRef.get();


        if (snap.exists) {

            await bookmarkRef.delete();

            button.classList.remove(
                "active"
            );

        }

        else {

            await bookmarkRef.set({

                bookId:
                    getBookId(book),

                title:
                    book.title || "",

                author:
                    book.author || "",

                cover:
                    book.cover || "",

                pdf:
                    book.pdf || "",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


            button.classList.add(
                "active"
            );

        }

    }

    catch (error) {

        console.error(
            "Bookmark error:",
            error
        );

        alert(
            "Bookmark could not be saved."
        );

    }

}



/* =====================================================
   SHARE
===================================================== */

async function shareBook(
    book
) {

    const url =
        new URL(
            `./reader.html?book=${encodeURIComponent(book.pdf || "")}`,
            window.location.href
        ).href;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    book.title,

                text:
                    `Read "${book.title}" on Chishti Library.`,

                url:
                    url

            });

        }

        else {

            await navigator.clipboard.writeText(
                url
            );

            alert(
                "Book link copied!"
            );

        }


        if (window.db) {

            await window.db
                .collection("books")
                .doc(
                    getBookId(book)
                )
                .set(
                    {
                        shares:
                            firebase.firestore.FieldValue.increment(1)
                    },
                    {
                        merge: true
                    }
                );

        }

    }

    catch (error) {

        console.log(
            "Share cancelled/error:",
            error
        );

    }

}



/* =====================================================
   DOWNLOAD COUNTER
===================================================== */

document.addEventListener(
    "click",
    async function(event) {

        const link =
            event.target.closest(
                "[data-download-id]"
            );


        if (!link) {

            return;

        }


        const id =
            link.dataset.downloadId;


        if (!window.db) {

            return;

        }


        try {

            await window.db
                .collection("books")
                .doc(id)
                .set(
                    {
                        downloads:
                            firebase.firestore.FieldValue.increment(1)
                    },
                    {
                        merge: true
                    }
                );

        }

        catch (error) {

            console.error(
                "Download counter error:",
                error
            );

        }

    }
);



/* =====================================================
   BOOK COUNTER
===================================================== */

function updateBookCounter() {

    const counter =
        document.getElementById(
            "bookCounter"
        );


    if (counter) {

        counter.textContent =
            allBooks.length;

    }

}



/* =====================================================
   FIREBASE TOTAL STATS
===================================================== */

async function loadStatistics() {

    if (!window.db) {

        return;

    }


    try {

        const snapshot =
            await window.db
                .collection("books")
                .get();


        let likes = 0;

        let views = 0;


        snapshot.forEach(
            function(doc) {

                const data =
                    doc.data();


                likes +=
                    Number(
                        data.likes || 0
                    );


                views +=
                    Number(
                        data.views || 0
                    );

            }
        );


        const likesCounter =
            document.getElementById(
                "likesCounter"
            );


        const viewsCounter =
            document.getElementById(
                "viewsCounter"
            );


        if (likesCounter) {

            likesCounter.textContent =
                likes;

        }


        if (viewsCounter) {

            viewsCounter.textContent =
                views;

        }

    }

    catch (error) {

        console.error(
            "Statistics error:",
            error
        );

    }

}



/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    value
) {

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


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}



/* =====================================================
   YEAR
===================================================== */

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.textContent =
        new Date()
            .getFullYear();

}



/* =====================================================
   FIREBASE AUTH
===================================================== */

window.addEventListener(
    "firebaseAuthChanged",
    async function() {

        await loadStatistics();

    }
);



/* =====================================================
   START
===================================================== */

loadBooks();

loadStatistics();


console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY BOOK SYSTEM"
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
    "✅ Firebase Likes"
);

console.log(
    "✅ Firebase Bookmarks"
);

console.log(
    "✅ Firebase Shares"
);

console.log(
    "✅ Firebase Downloads"
);

console.log(
    "===================================="
);
