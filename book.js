/* =========================================================
   CHISHTI LIBRARY — book.js
   Firebase Multi-User Book System
   Features:
   ✓ Search
   ✓ Categories
   ✓ Oldest / Newest / Popular
   ✓ Firebase automatic book IDs
   ✓ Views
   ✓ Likes per user
   ✓ Shares
   ✓ Comments
   ✓ Downloads
   ✓ Reader opens directly with PDF
   ✓ Like button changes when user has liked
   ✓ Login required for Like / Comment
========================================================= */

"use strict";

/* =========================================================
   FIREBASE
   firebase.js must already initialize:
   window.db = firebase.firestore();
========================================================= */

if (!window.db) {
    console.error("❌ Firebase Firestore is not initialized.");
}

/* =========================================================
   BOOK DATA
   Keep your existing books array here
========================================================= */

const books = [
    {
        id: 1,
        title: "Al-Rehman",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "al-rehman-cover.png",
        pdf: "Al Rehman .. Latif Sajid.C.pdf",
        description: "99 Names of Allah Book Series by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 2,
        title: "Husn-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "husn-e-kainat-cover.png",
        pdf: "husn-e-kainat.pdf",
        description: "Naatiya Kalam by Hazrat Allama Saim Chishti."
    },
    {
        id: 3,
        title: "Shahdaye Karbala",
        author: "Hazrat Allama Saim Chishti",
        category: "Manqabat",
        cover: "shahdaye karbala-cover.png",
        pdf: "shahdaye-karbala.pdf",
        description: "Karbala ke shuhada ke fazail par manqabat ki kitab."
    },
    {
        id: 4,
        title: "Shaheed Ibn-e-Shaheed",
        author: "Hazrat Allama Saim Chishti",
        category: "Seerat",
        cover: "shaheed-ibn-e-shaheed-cover.png",
        pdf: "shaheed-ibn-e-shaheed.pdf",
        description: "Historical Manqabat book by Hazrat Allama Saim Chishti."
    },
    {
        id: 5,
        title: "Nawaye Saim",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "Nawaye Saim-cover.png",
        pdf: "noori.pdf",
        description: "Naatiya Majmua by Hazrat Allama Saim Chishti."
    },
    {
        id: 6,
        title: "Kulliyat-e-Saim Chishti",
        author: "Hazrat Allama Saim Chishti",
        category: "Kulliyat",
        cover: "kulliyat e saim chishti-cover.png",
        pdf: "Kulliyat e Saim Chishti By Allama Saim Chishti.pdf",
        description: "Complete Kulliyat of Hazrat Allama Saim Chishti."
    },
    {
        id: 7,
        title: "Punjabi Maqala",
        author: "Hazrat Allama Saim Chishti",
        category: "Maqala",
        cover: "allamasaimchishtipunjbimaqala-cover.png",
        pdf: "allamasaimchishtipunjabimaqala-231010120010-3ca7944b (1).pdf",
        description: "Punjabi Maqala by Hazrat Allama Saim Chishti."
    },
    {
        id: 8,
        title: "Armaghan-e-Madina",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "Armaghan-e-Madina-By-Allama-Saim-Chishti-cover.webp",
        pdf: "armughan e madina.pdf",
        description: "Collection of Naats by Hazrat Allama Saim Chishti."
    },
    {
        id: 9,
        title: "Shan-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "naat-cover2.png",
        pdf: "shan-e-kainat.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },
    {
        id: 10,
        title: "Rehmat Da Khazana",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "rehmatdakhazana-cover.png",
        pdf: "rehmatdakhazana.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },
    {
        id: 11,
        title: "Madinay Diyan Kaliyan",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "madinydiankalinyan-cover.png",
        pdf: "madinydiankalinyan.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },
    {
        id: 12,
        title: "Darooda Di Dali",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Naat",
        cover: "darooda di dali-cover..png",
        pdf: "Darooda Di Dali Pdf.pdf",
        description: "A Punjabi Naatiya book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 13,
        title: "Sbhy Hamdan Ne Rab Sohnay",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Sbhy Hamdan Ne Rab Sohnay-cover.jpeg",
        pdf: "Sbhy Hamdan Ne Rab Sohnay.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 14,
        title: "Saqi e Baghdad",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Manqabat",
        cover: "Saqi e Baghdad.cover.jpeg",
        pdf: "Saqi e Baghdad ....Final.pdf",
        description: "A Manqabat book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 15,
        title: "Rab de rang niraly hamdya punjabi",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Rab de rang niraly hamdya-cover.jpeg",
        pdf: "Rab de rang niraly hamdya punjabi.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 16,
        title: "Hammad Hico",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Hammad Hico-cover.jpeg",
        pdf: "Hamad Hico Book.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 17,
        title: "Mazhar E noor e Khuda",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Mazhar E noor e Khuda-cover.png",
        pdf: "Mazhar E noor e Khuda.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti."
    },
    {
        id: 18,
        title: "Ali Ali Hai",
        author: "Hazrat Allama Saim Chishti",
        category: "Manqabat",
        cover: "ALI ALI HAI-COVER.png",
        pdf: "ALI ALI HAI BOOK SAIM CHISHTI BOOKS.pdf",
        description: "Manqabat book by Hazrat Allama Saim Chishti."
    },
    {
        id: 19,
        title: "Al Batool",
        author: "Hazrat Allama Saim Chishti",
        category: "Seerat",
        cover: "Al-batool-cover.png",
        pdf: "AL-batool.pdf",
        description: "A Seerat book by Hazrat Allama Saim Chishti."
    }
];

/* =========================================================
   GLOBALS
========================================================= */

let currentCategory = "all";
let currentSort = "newest";

const booksContainer = document.getElementById("booksContainer");
const bookSearch = document.getElementById("bookSearch");
const bookCount = document.getElementById("bookCount");
const emptyBooks = document.getElementById("emptyBooks");
const footerYear = document.getElementById("footerYear");

/* =========================================================
   FIRESTORE HELPERS
========================================================= */

function bookRef(book) {
    return window.db.collection("books").doc(`book-${book.id}`);
}

function userId() {
    return (
        firebase.auth &&
        firebase.auth().currentUser
    )
        ? firebase.auth().currentUser.uid
        : null;
}

function requireLogin() {
    const user = userId();

    if (!user) {
        alert("Like ya comment karne ke liye pehle Login karein.");
        window.location.href =
            "./login.html?redirect=" +
            encodeURIComponent(window.location.href);

        return null;
    }

    return user;
}

/* =========================================================
   INITIALIZE BOOK IN FIREBASE
========================================================= */

async function initializeBook(book) {

    if (!window.db) return;

    try {

        const ref = bookRef(book);
        const snap = await ref.get();

        if (!snap.exists) {

            await ref.set({

                bookId: book.id,
                title: book.title,
                author: book.author,
                category: book.category,
                cover: book.cover,
                pdf: book.pdf,

                views: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                downloads: 0,

                createdAt: firebase.firestore.FieldValue.serverTimestamp(),

                updatedAt: firebase.firestore.FieldValue.serverTimestamp()

            });

        }

    } catch (error) {

        console.error(
            `Firebase book error: ${book.title}`,
            error
        );

    }
}

/* =========================================================
   INITIALIZE ALL BOOKS
========================================================= */

async function initializeAllBooks() {

    for (const book of books) {
        await initializeBook(book);
    }

}

/* =========================================================
   GET BOOK STATS
========================================================= */

async function getBookStats(book) {

    const defaults = {
        views: 0,
        likes: 0,
        shares: 0,
        comments: 0,
        downloads: 0
    };

    if (!window.db) return defaults;

    try {

        const snap = await bookRef(book).get();

        if (!snap.exists) return defaults;

        return {
            ...defaults,
            ...snap.data()
        };

    } catch (error) {

        console.error("Stats error:", error);

        return defaults;

    }
}

/* =========================================================
   INCREMENT VIEW
========================================================= */

async function addView(book) {

    if (!window.db) return;

    try {

        await bookRef(book).update({

            views:
                firebase.firestore.FieldValue.increment(1),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        });

    } catch (error) {

        console.error("View error:", error);

    }

}

/* =========================================================
   LIKE SYSTEM
   One like per Firebase user
========================================================= */

async function toggleLike(book, button, counter) {

    const uid = requireLogin();

    if (!uid) return;

    try {

        const likeRef =
            bookRef(book)
                .collection("likes")
                .doc(uid);

        const likeSnap =
            await likeRef.get();

        if (likeSnap.exists) {

            await likeRef.delete();

            await bookRef(book).update({

                likes:
                    firebase.firestore.FieldValue.increment(-1)

            });

            button.classList.remove("liked");

        } else {

            await likeRef.set({

                uid: uid,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

            await bookRef(book).update({

                likes:
                    firebase.firestore.FieldValue.increment(1)

            });

            button.classList.add("liked");

        }

        const stats =
            await getBookStats(book);

        counter.textContent =
            Number(stats.likes || 0);

    } catch (error) {

        console.error("Like error:", error);

    }

}

/* =========================================================
   CHECK USER LIKE
========================================================= */

async function checkLike(book, button) {

    const uid = userId();

    if (!uid || !window.db) return;

    try {

        const snap =
            await bookRef(book)
                .collection("likes")
                .doc(uid)
                .get();

        if (snap.exists) {

            button.classList.add("liked");

        }

    } catch (error) {

        console.error("Check like error:", error);

    }

}

/* =========================================================
   SHARE
========================================================= */

async function shareBook(book) {

    const readerURL =
        new URL(
            `./reader.html?book=${encodeURIComponent(book.pdf)}`,
            window.location.href
        ).href;

    try {

        if (navigator.share) {

            await navigator.share({

                title: book.title,

                text:
                    `${book.title} — Chishti Library`,

                url: readerURL

            });

        } else {

            await navigator.clipboard.writeText(readerURL);

            alert("Reader link copied!");

        }

        if (window.db) {

            await bookRef(book).update({

                shares:
                    firebase.firestore.FieldValue.increment(1)

            });

        }

        renderBooks();

    } catch (error) {

        if (error.name !== "AbortError") {

            console.error(
                "Share error:",
                error
            );

        }

    }

}

/* =========================================================
   DOWNLOAD
========================================================= */

async function downloadBook(book) {

    if (!book.pdf) return;

    const link =
        document.createElement("a");

    link.href =
        encodeURI(book.pdf);

    link.download =
        book.pdf;

    document.body.appendChild(link);

    link.click();

    link.remove();

    if (window.db) {

        try {

            await bookRef(book).update({

                downloads:
                    firebase.firestore.FieldValue.increment(1)

            });

        } catch (error) {

            console.error(
                "Download counter error:",
                error
            );

        }

    }

    renderBooks();

}

/* =========================================================
   COMMENTS
========================================================= */

async function addComment(book) {

    const uid = requireLogin();

    if (!uid) return;

    const text =
        prompt("Apna comment likhein:");

    if (!text || !text.trim()) return;

    try {

        await bookRef(book)
            .collection("comments")
            .add({

                uid: uid,

                text: text.trim(),

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        await bookRef(book).update({

            comments:
                firebase.firestore.FieldValue.increment(1)

        });

        alert("Comment added successfully.");

        renderBooks();

    } catch (error) {

        console.error(
            "Comment error:",
            error
        );

        alert(
            "Comment add nahi ho saka."
        );

    }

}

/* =========================================================
   OPEN READER
========================================================= */

async function openBook(book) {

    if (!book.pdf) {

        alert(
            "Is book ki PDF configured nahi hai."
        );

        return;

    }

    await addView(book);

    const readerURL =
        "./reader.html?book=" +
        encodeURIComponent(book.pdf) +
        "&id=" +
        encodeURIComponent(book.id);

    window.location.href =
        readerURL;

}

/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

/* =========================================================
   CREATE BOOK CARD
========================================================= */

async function createBookCard(book) {

    const stats =
        await getBookStats(book);

    const card =
        document.createElement("article");

    card.className =
        "book-card";

    card.dataset.bookId =
        book.id;

    card.innerHTML = `

        <div class="book-cover">

            <img
                src="${escapeHTML(book.cover)}"
                alt="${escapeHTML(book.title)}"
                loading="lazy"
                onerror="this.src='./logo.png'"
            >

            <span class="book-category">

                ${escapeHTML(book.category)}

            </span>

            <div class="book-cover-overlay">

                <button
                    class="read-button"
                    type="button"
                    data-action="read"
                >

                    <i class="fa-solid fa-book-open"></i>

                    Read Book

                </button>

            </div>

        </div>

        <div class="book-card-content">

            <h2>
                ${escapeHTML(book.title)}
            </h2>

            <p class="book-author">

                <i class="fa-solid fa-user-pen"></i>

                ${escapeHTML(book.author)}

            </p>

            <p class="book-description">

                ${escapeHTML(book.description)}

            </p>

            <div class="book-stats">

                <span title="Views">

                    <i class="fa-solid fa-eye"></i>

                    <b data-stat="views">
                        ${Number(stats.views || 0)}
                    </b>

                </span>

                <button
                    class="stat-button like-button"
                    data-action="like"
                    type="button"
                    title="Like"
                >

                    <i class="fa-solid fa-heart"></i>

                    <b data-stat="likes">
                        ${Number(stats.likes || 0)}
                    </b>

                </button>

                <button
                    class="stat-button"
                    data-action="share"
                    type="button"
                    title="Share"
                >

                    <i class="fa-solid fa-share-nodes"></i>

                    <b data-stat="shares">
                        ${Number(stats.shares || 0)}
                    </b>

                </button>

                <button
                    class="stat-button"
                    data-action="comment"
                    type="button"
                    title="Comment"
                >

                    <i class="fa-solid fa-comment"></i>

                    <b data-stat="comments">
                        ${Number(stats.comments || 0)}
                    </b>

                </button>

                <button
                    class="stat-button"
                    data-action="download"
                    type="button"
                    title="Download"
                >

                    <i class="fa-solid fa-download"></i>

                    <b data-stat="downloads">
                        ${Number(stats.downloads || 0)}
                    </b>

                </button>

            </div>

            <div class="book-card-footer">

                <span>

                    <i class="fa-solid fa-book"></i>

                    Digital Edition

                </span>

                <button
                    class="open-book-button"
                    type="button"
                    data-action="read"
                >

                    Open

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </div>
    `;

    const likeButton =
        card.querySelector(
            '[data-action="like"]'
        );

    await checkLike(
        book,
        likeButton
    );

    return card;

}

/* =========================================================
   RENDER BOOKS
========================================================= */

async function renderBooks() {

    if (!booksContainer) return;

    const query =
        bookSearch
            ? bookSearch.value
                .trim()
                .toLowerCase()
            : "";

    let filtered =
        books.filter(book => {

            const categoryMatch =
                currentCategory === "all" ||
                book.category.toLowerCase() ===
                currentCategory.toLowerCase();

            const text =
                (
                    book.title +
                    " " +
                    book.author +
                    " " +
                    book.category +
                    " " +
                    book.description
                ).toLowerCase();

            return (
                categoryMatch &&
                (!query || text.includes(query))
            );

        });

    /* =====================================================
       SORT
    ===================================================== */

    if (currentSort === "oldest") {

        filtered.sort(
            (a, b) => a.id - b.id
        );

    }

    else if (currentSort === "newest") {

        filtered.sort(
            (a, b) => b.id - a.id
        );

    }

    else if (currentSort === "popular") {

        const statsList =
            await Promise.all(
                filtered.map(
                    book => getBookStats(book)
                )
            );

        filtered.sort(
            (a, b) => {

                const sa =
                    statsList[
                        filtered.indexOf(a)
                    ];

                const sb =
                    statsList[
                        filtered.indexOf(b)
                    ];

                return (
                    Number(sb.views || 0) +
                    Number(sb.likes || 0) * 3 +
                    Number(sb.shares || 0) * 2
                ) -
                (
                    Number(sa.views || 0) +
                    Number(sa.likes || 0) * 3 +
                    Number(sa.shares || 0) * 2
                );

            }
        );

    }

    booksContainer.innerHTML = "";

    if (bookCount) {

        bookCount.textContent =
            filtered.length;

    }

    if (!filtered.length) {

        if (emptyBooks) {

            emptyBooks.style.display =
                "block";

        }

        return;

    }

    if (emptyBooks) {

        emptyBooks.style.display =
            "none";

    }

    const fragment =
        document.createDocumentFragment();

    for (const book of filtered) {

        const card =
            await createBookCard(book);

        fragment.appendChild(card);

    }

    booksContainer.appendChild(
        fragment
    );

}

/* =========================================================
   BOOK ACTIONS
========================================================= */

if (booksContainer) {

    booksContainer.addEventListener(
        "click",
        async function(event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) return;

            const card =
                button.closest(".book-card");

            if (!card) return;

            const id =
                Number(card.dataset.bookId);

            const book =
                books.find(
                    item => item.id === id
                );

            if (!book) return;

            const action =
                button.dataset.action;

            if (action === "read") {

                await openBook(book);

            }

            else if (action === "like") {

                const counter =
                    card.querySelector(
                        '[data-stat="likes"]'
                    );

                await toggleLike(
                    book,
                    button,
                    counter
                );

            }

            else if (action === "share") {

                await shareBook(book);

            }

            else if (action === "comment") {

                await addComment(book);

            }

            else if (action === "download") {

                await downloadBook(book);

            }

        }
    );

}

/* =========================================================
   SEARCH
========================================================= */

if (bookSearch) {

    bookSearch.addEventListener(
        "input",
        renderBooks
    );

}

/* =========================================================
   CATEGORY
========================================================= */

document
    .querySelectorAll("[data-category]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        "[data-category]"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                this.classList.add(
                    "active"
                );

                currentCategory =
                    this.dataset.category;

                renderBooks();

            }
        );

    });

/* =========================================================
   SORT BUTTONS
   Add these buttons in HTML:

   data-sort="oldest"
   data-sort="newest"
   data-sort="popular"
========================================================= */

document
    .querySelectorAll("[data-sort]")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(
                        "[data-sort]"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );

                this.classList.add(
                    "active"
                );

                currentSort =
                    this.dataset.sort;

                renderBooks();

            }
        );

    });

/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu =
    document.querySelector(".mobile-menu");

const menu =
    document.querySelector(".menu");

if (mobileMenu && menu) {

    mobileMenu.addEventListener(
        "click",
        () => {

            menu.classList.toggle(
                "show"
            );

        }
    );

}

/* =========================================================
   SCROLL TOP
========================================================= */

const scrollTop =
    document.getElementById("scrollTop");

if (scrollTop) {

    scrollTop.style.display =
        "none";

    window.addEventListener(
        "scroll",
        () => {

            scrollTop.style.display =
                window.scrollY > 300
                    ? "block"
                    : "none";

        }
    );

    scrollTop.addEventListener(
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
   FOOTER YEAR
========================================================= */

if (footerYear) {

    footerYear.textContent =
        new Date().getFullYear();

}

/* =========================================================
   START AFTER FIREBASE
========================================================= */

async function startBookSystem() {

    if (!window.db) {

        console.error(
            "❌ Firebase is not ready."
        );

        await renderBooks();

        return;

    }

    try {

        await initializeAllBooks();

        await renderBooks();

        console.log(
            "✅ CHISHTI BOOK SYSTEM READY"
        );

        console.log(
            "📚 Total books:",
            books.length
        );

    } catch (error) {

        console.error(
            "❌ Book system error:",
            error
        );

        await renderBooks();

    }

}

/* Firebase SDK already loaded */
startBookSystem();
