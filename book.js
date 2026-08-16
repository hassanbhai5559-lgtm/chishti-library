"use strict";


/*
=========================================================
CHISHTI LIBRARY BOOK SYSTEM
=========================================================
Firebase:
- Views
- Likes
- Shares
- Comments
- Downloads
- User-specific likes
- User-specific views
- Newest / Oldest / Popular
=========================================================
*/


/* =====================================================
BOOK DATABASE
===================================================== */

const books = [

{
    id: 1,
    title: "Al-Rehman",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "hamd",
    categoryName: "Hamd",
    cover: "al-rehman-cover.png",
    pdf: "Al Rehman .. Latif Sajid.C.pdf",
    description: "99 Names of Allah Book Series by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 2,
    title: "Husn-e-Kainat",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "husn-e-kainat-cover.png",
    pdf: "husn-e-kainat.pdf",
    description: "Naatiya Kalam by Hazrat Allama Saim Chishti."
},

{
    id: 3,
    title: "Shahdaye Karbala",
    author: "Hazrat Allama Saim Chishti",
    category: "manqabat",
    categoryName: "Manqabat",
    cover: "shahdaye karbala-cover.png",
    pdf: "shahdaye-karbala.pdf",
    description: "Karbala ke shuhada ke fazail par manqabat ki kitab."
},

{
    id: 4,
    title: "Shaheed Ibn-e-Shaheed",
    author: "Hazrat Allama Saim Chishti",
    category: "seerat",
    categoryName: "Seerat",
    cover: "shaheed-ibn-e-shaheed-cover.png",
    pdf: "shaheed-ibn-e-shaheed.pdf",
    description: "Historical Manqabat book by Hazrat Allama Saim Chishti."
},

{
    id: 5,
    title: "Nawaye Saim",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "Nawaye Saim-cover.png",
    pdf: "noori.pdf",
    description: "Naatiya Majmua by Hazrat Allama Saim Chishti."
},

{
    id: 6,
    title: "Kulliyat-e-Saim Chishti",
    author: "Hazrat Allama Saim Chishti",
    category: "kulliyat",
    categoryName: "Kulliyat",
    cover: "kulliyat e saim chishti-cover.png",
    pdf: "Kulliyat e Saim Chishti By Allama Saim Chishti.pdf",
    description: "Complete Kulliyat of Hazrat Allama Saim Chishti."
},

{
    id: 7,
    title: "Punjabi Maqala",
    author: "Hazrat Allama Saim Chishti",
    category: "maqala",
    categoryName: "Maqala",
    cover: "allamasaimchishtipunjbimaqala-cover.png",
    pdf: "allamasaimchishtipunjabimaqala-231010120010-3ca7944b (1).pdf",
    description: "Punjabi Maqala by Hazrat Allama Saim Chishti."
},

{
    id: 8,
    title: "Armaghan-e-Madina",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "Armaghan-e-Madina-By-Allama-Saim-Chishti-cover.webp",
    pdf: "armughan e madina.pdf",
    description: "Collection of Naats by Hazrat Allama Saim Chishti."
},

{
    id: 9,
    title: "Shan-e-Kainat",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "naat-cover2.png",
    pdf: "shan-e-kainat.pdf",
    description: "Naatiya Collection by Hazrat Allama Saim Chishti."
},

{
    id: 10,
    title: "Rehmat Da Khazana",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "rehmatdakhazana-cover.png",
    pdf: "rehmatdakhazana.pdf",
    description: "Naatiya Collection by Hazrat Allama Saim Chishti."
},

{
    id: 11,
    title: "Madinay Diyan Kaliyan",
    author: "Hazrat Allama Saim Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "madinydiankalinyan-cover.png",
    pdf: "madinydiankalinyan.pdf",
    description: "Naatiya Collection by Hazrat Allama Saim Chishti."
},

{
    id: 12,
    title: "Darooda Di Dali",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "naat",
    categoryName: "Naat",
    cover: "darooda di dali-cover..png",
    pdf: "Darooda Di Dali Pdf.pdf",
    description: "A Punjabi Naatiya book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 13,
    title: "Sbhy Hamdan Ne Rab Sohnay",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "hamd",
    categoryName: "Hamd",
    cover: "Sbhy Hamdan Ne Rab Sohnay-cover.jpeg",
    pdf: "Sbhy Hamdan Ne Rab Sohnay.pdf",
    description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 14,
    title: "Saqi e Baghdad",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "manqabat",
    categoryName: "Manqabat",
    cover: "Saqi e Baghdad.cover.jpeg",
    pdf: "Saqi e Baghdad ....Final.pdf",
    description: "A Manqabat book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 15,
    title: "Rab de rang niraly hamdya punjabi",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "hamd",
    categoryName: "Hamd",
    cover: "Rab de rang niraly hamdya-cover.jpeg",
    pdf: "Rab de rang niraly hamdya punjabi.pdf",
    description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 16,
    title: "Hammad Hico",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "hamd",
    categoryName: "Hamd",
    cover: "Hammad Hico-cover.jpeg",
    pdf: "Hamad Hico Book.pdf",
    description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 17,
    title: "Mazhar E noor e Khuda",
    author: "Sahibzada Muhammad Latif Sajid Chishti",
    category: "hamd",
    categoryName: "Hamd",
    cover: "Mazhar E noor e Khuda-cover.png",
    pdf: "Mazhar E noor e Khuda.pdf",
    description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
    latest: true
},

{
    id: 18,
    title: "Ali Ali Hai",
    author: "Hazrat Allama Saim Chishti",
    category: "manqabat",
    categoryName: "Manqabat",
    cover: "ALI ALI HAI-COVER.png",
    pdf: "ALI ALI HAI BOOK SAIM CHISHTI BOOKS.pdf",
    description: "Manqabat Hazrat Ali by Hazrat Allama Saim Chishti.",
    latest: true
},

{
    id: 19,
    title: "Al Batool",
    author: "Hazrat Allama Saim Chishti",
    category: "seerat",
    categoryName: "Seerat",
    cover: "Al-batool-cover.png",
    pdf: "AL-batool.pdf",
    description: "A Seerat book by Hazrat Allama Saim Chishti.",
    latest: true
}

];


/* =====================================================
ELEMENTS
===================================================== */

const booksContainer =
    document.getElementById("booksContainer");

const bookSearch =
    document.getElementById("bookSearch");

const bookCount =
    document.getElementById("bookCount");

const emptyBooks =
    document.getElementById("emptyBooks");

const footerYear =
    document.getElementById("footerYear");

const loginStatusText =
    document.getElementById("loginStatusText");


let currentCategory = "all";

let currentSort = "newest";


/* =====================================================
ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
BOOK FIREBASE DATA
===================================================== */

const bookStats = {};


/* =====================================================
BOOK REFERENCE
===================================================== */

function bookRef(bookId) {

    return db
        .collection("books")
        .doc("book-" + bookId);

}


/* =====================================================
INITIALIZE BOOK
===================================================== */

async function initializeBook(book) {

    try {

        const ref =
            bookRef(book.id);

        const snapshot =
            await ref.get();


        if (!snapshot.exists) {

            await ref.set({

                id: book.id,

                title: book.title,

                author: book.author,

                category: book.categoryName,

                cover: book.cover,

                pdf: book.pdf,

                description: book.description,

                views: 0,

                likes: 0,

                shares: 0,

                comments: 0,

                downloads: 0,

                latest: book.latest === true,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

            console.log(
                "✅ Created:",
                book.title
            );

        }

    } catch (error) {

        firebaseError(
            error,
            "initializeBook: " + book.title
        );

    }

}


/* =====================================================
LOAD BOOK STATS
===================================================== */

async function loadBookStats(book) {

    try {

        const snapshot =
            await bookRef(book.id).get();


        if (snapshot.exists) {

            bookStats[book.id] =
                snapshot.data();

        } else {

            bookStats[book.id] = {

                views: 0,
                likes: 0,
                shares: 0,
                comments: 0,
                downloads: 0

            };

        }

    } catch (error) {

        console.error(
            "Stats error:",
            error
        );

        bookStats[book.id] = {

            views: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            downloads: 0

        };

    }

}


/* =====================================================
LOAD ALL FIREBASE DATA
===================================================== */

async function loadFirebaseBooks() {

    for (const book of books) {

        await initializeBook(book);

        await loadBookStats(book);

    }

    renderBooks();

}


/* =====================================================
CHECK USER LIKE
===================================================== */

async function userLiked(bookId) {

    const user =
        window.currentFirebaseUser;

    if (!user) {
        return false;
    }


    try {

        const snapshot =
            await bookRef(bookId)
                .collection("likes")
                .doc(user.uid)
                .get();


        return snapshot.exists;

    } catch (error) {

        console.error(
            "Like check:",
            error
        );

        return false;

    }

}


/* =====================================================
CHECK USER VIEW
===================================================== */

async function userViewed(bookId) {

    const user =
        window.currentFirebaseUser;

    if (!user) {
        return false;
    }


    try {

        const snapshot =
            await bookRef(bookId)
                .collection("views")
                .doc(user.uid)
                .get();


        return snapshot.exists;

    } catch (error) {

        console.error(
            "View check:",
            error
        );

        return false;

    }

}


/* =====================================================
CREATE BOOK CARD
===================================================== */

async function createBookCard(book) {

    const card =
        document.createElement("article");

    card.className =
        "book-card";


    const stats =
        bookStats[book.id] || {};


    const views =
        Number(stats.views || 0);

    const likes =
        Number(stats.likes || 0);

    const shares =
        Number(stats.shares || 0);

    const comments =
        Number(stats.comments || 0);

    const downloads =
        Number(stats.downloads || 0);


    const liked =
        await userLiked(book.id);


    card.innerHTML = `

        <div class="book-cover">

            <img
                src="${escapeHTML(book.cover)}"
                alt="${escapeHTML(book.title)}"
                loading="lazy"
                onerror="this.src='./logo.png'"
            >


            <span class="book-category">

                ${escapeHTML(book.categoryName)}

            </span>


            <div class="book-cover-overlay">

                <button
                    class="read-button"
                    type="button"
                    data-action="read"
                    data-book-id="${book.id}">

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

                <span
                    title="Views">

                    <i class="fa-solid fa-eye"></i>

                    <b>
                        ${views}
                    </b>

                </span>


                <button
                    class="stat-button like-button ${liked ? "liked" : ""}"
                    data-action="like"
                    data-book-id="${book.id}"
                    type="button"
                    title="Like">

                    <i class="fa-solid fa-heart"></i>

                    <b>
                        ${likes}
                    </b>

                </button>


                <button
                    class="stat-button"
                    data-action="comment"
                    data-book-id="${book.id}"
                    type="button"
                    title="Comments">

                    <i class="fa-solid fa-comment"></i>

                    <b>
                        ${comments}
                    </b>

                </button>


                <button
                    class="stat-button"
                    data-action="share"
                    data-book-id="${book.id}"
                    type="button"
                    title="Share">

                    <i class="fa-solid fa-share-nodes"></i>

                    <b>
                        ${shares}
                    </b>

                </button>


                <button
                    class="stat-button"
                    data-action="download"
                    data-book-id="${book.id}"
                    type="button"
                    title="Download">

                    <i class="fa-solid fa-download"></i>

                    <b>
                        ${downloads}
                    </b>

                </button>

            </div>


            <div class="comment-area"
                 id="comments-${book.id}"
                 style="display:none;">

                <div class="comment-input-row">

                    <input
                        type="text"
                        class="comment-input"
                        data-comment-input="${book.id}"
                        placeholder="Write a comment...">

                    <button
                        class="comment-send"
                        data-action="send-comment"
                        data-book-id="${book.id}"
                        type="button">

                        <i class="fas fa-paper-plane"></i>

                    </button>

                </div>


                <div
                    class="comments-list"
                    id="comment-list-${book.id}">

                    Loading comments...

                </div>

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
                    data-book-id="${book.id}">

                    Open

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </div>

    `;


    return card;

}


/* =====================================================
RENDER BOOKS
===================================================== */

async function renderBooks() {

    if (!booksContainer) {
        return;
    }


    const query =
        bookSearch
            ? bookSearch.value
                .trim()
                .toLowerCase()
            : "";


    let filteredBooks =
        books.filter(function(book) {

            const categoryMatch =
                currentCategory === "all" ||
                book.category === currentCategory;


            const searchText =
                (
                    book.title +
                    " " +
                    book.author +
                    " " +
                    book.categoryName +
                    " " +
                    book.description
                ).toLowerCase();


            const searchMatch =
                !query ||
                searchText.includes(query);


            return (
                categoryMatch &&
                searchMatch
            );

        });


    /* =================================================
       SORT
    ================================================= */

    filteredBooks.sort(function(a, b) {

        const aStats =
            bookStats[a.id] || {};

        const bStats =
            bookStats[b.id] || {};


        if (currentSort === "popular") {

            return (
                Number(bStats.views || 0) -
                Number(aStats.views || 0)
            );

        }


        if (currentSort === "oldest") {

            return a.id - b.id;

        }


        return b.id - a.id;

    });


    booksContainer.innerHTML = "";


    if (bookCount) {

        bookCount.textContent =
            filteredBooks.length;

    }


    if (!filteredBooks.length) {

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


    for (const book of filteredBooks) {

        const card =
            await createBookCard(book);

        fragment.appendChild(card);

    }


    booksContainer.appendChild(
        fragment
    );

}


/* =====================================================
LIKE
===================================================== */

async function toggleLike(bookId) {

    if (!requireLogin()) {
        return;
    }


    const user =
        currentFirebaseUser;


    const bookReference =
        bookRef(bookId);


    const likeReference =
        bookReference
            .collection("likes")
            .doc(user.uid);


    try {

        const result =
            await db.runTransaction(
                async function(transaction) {

                    const likeSnapshot =
                        await transaction.get(
                            likeReference
                        );


                    const bookSnapshot =
                        await transaction.get(
                            bookReference
                        );


                    const currentLikes =
                        Number(
                            bookSnapshot.data()?.likes || 0
                        );


                    if (likeSnapshot.exists) {

                        transaction.delete(
                            likeReference
                        );

                        transaction.update(
                            bookReference,
                            {
                                likes:
                                    Math.max(
                                        0,
                                        currentLikes - 1
                                    )
                            }
                        );

                        return false;

                    }


                    transaction.set(
                        likeReference,
                        {
                            userId: user.uid,

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()
                        }
                    );


                    transaction.update(
                        bookReference,
                        {
                            likes:
                                currentLikes + 1
                        }
                    );


                    return true;

                }
            );


        console.log(
            result
                ? "❤️ Liked"
                : "💔 Unliked"
        );


        await loadBookStats(
            books.find(
                b =>
                    String(b.id) ===
                    String(bookId)
            )
        );


        renderBooks();

    } catch (error) {

        firebaseError(
            error,
            "toggleLike"
        );

    }

}


/* =====================================================
VIEW
===================================================== */

async function registerView(bookId) {

    const user =
        currentFirebaseUser;


    /*
    Anonymous users are not counted as
    unique Firebase views.
    */

    if (!user) {

        return;

    }


    const bookReference =
        bookRef(bookId);


    const viewReference =
        bookReference
            .collection("views")
            .doc(user.uid);


    try {

        await db.runTransaction(
            async function(transaction) {

                const viewSnapshot =
                    await transaction.get(
                        viewReference
                    );


                if (viewSnapshot.exists) {

                    return;

                }


                const bookSnapshot =
                    await transaction.get(
                        bookReference
                    );


                const currentViews =
                    Number(
                        bookSnapshot.data()?.views || 0
                    );


                transaction.set(
                    viewReference,
                    {
                        userId: user.uid,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()
                    }
                );


                transaction.update(
                    bookReference,
                    {
                        views:
                            currentViews + 1
                    }
                );

            }
        );


        await loadBookStats(
            books.find(
                b =>
                    String(b.id) ===
                    String(bookId)
            )
        );


        renderBooks();

    } catch (error) {

        firebaseError(
            error,
            "registerView"
        );

    }

}


/* =====================================================
OPEN BOOK
===================================================== */

async function openBook(bookId) {

    const book =
        books.find(
            item =>
                String(item.id) ===
                String(bookId)
        );


    if (!book) {

        return;

    }


    if (!currentFirebaseUser) {

        const login =
            confirm(
                "Please login first to read this book.\n\nOK = Login"
            );


        if (login) {

            window.location.href =
                "./login.html";

        }

        return;

    }


    await registerView(
        bookId
    );


    const pdfFile =
        String(book.pdf || "").trim();


    if (!pdfFile) {

        alert(
            "PDF file is not configured."
        );

        return;

    }


    const extension =
        pdfFile
            .split("?")[0]
            .split(".")
            .pop()
            .toLowerCase();


    if (extension !== "pdf") {

        alert(
            "Invalid PDF file."
        );

        return;

    }


    window.location.href =
        "./reader.html?book=" +
        encodeURIComponent(pdfFile);

}


/* =====================================================
DOWNLOAD
===================================================== */

async function downloadBook(bookId) {

    if (!requireLogin()) {
        return;
    }


    const book =
        books.find(
            b =>
                String(b.id) ===
                String(bookId)
        );


    if (!book) {
        return;
    }


    const reference =
        bookRef(bookId);


    try {

        await reference.update({

            downloads:
                firebase.firestore
                    .FieldValue
                    .increment(1)

        });


        await loadBookStats(book);


        renderBooks();


        const link =
            document.createElement("a");


        link.href =
            "./" +
            encodeURIComponent(book.pdf);


        link.download =
            book.pdf;


        document.body.appendChild(link);

        link.click();

        link.remove();


    } catch (error) {

        firebaseError(
            error,
            "downloadBook"
        );

    }

}


/* =====================================================
SHARE
===================================================== */

async function shareBook(bookId) {

    if (!requireLogin()) {
        return;
    }


    const book =
        books.find(
            b =>
                String(b.id) ===
                String(bookId)
        );


    if (!book) {
        return;
    }


    try {

        const shareURL =
            window.location.origin +
            window.location.pathname +
            "?book=" +
            book.id;


        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    book.title,

                text:
                    "Read " +
                    book.title +
                    " on Chishti Library",

                url:
                    shareURL

            });

        } else {

            await navigator.clipboard.writeText(
                shareURL
            );

            alert(
                "Book link copied!"
            );

        }


        await bookRef(bookId).update({

            shares:
                firebase.firestore
                    .FieldValue
                    .increment(1)

        });


        await loadBookStats(book);

        renderBooks();


    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return;

        }


        firebaseError(
            error,
            "shareBook"
        );

    }

}


/* =====================================================
COMMENTS
===================================================== */

async function openComments(bookId) {

    const area =
        document.getElementById(
            "comments-" + bookId
        );


    if (!area) {
        return;
    }


    if (
        area.style.display ===
        "block"
    ) {

        area.style.display =
            "none";

        return;

    }


    area.style.display =
        "block";


    await loadComments(
        bookId
    );

}


/* =====================================================
LOAD COMMENTS
===================================================== */

async function loadComments(bookId) {

    const list =
        document.getElementById(
            "comment-list-" + bookId
        );


    if (!list) {
        return;
    }


    try {

        const snapshot =
            await bookRef(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();


        if (snapshot.empty) {

            list.innerHTML =
                `<p class="no-comment">
                    No comments yet.
                 </p>`;

            return;

        }


        list.innerHTML = "";


        snapshot.forEach(
            function(doc) {

                const comment =
                    doc.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "comment-item";


                item.innerHTML = `

                    <strong>
                        ${escapeHTML(
                            comment.name ||
                            "Library User"
                        )}
                    </strong>

                    <p>
                        ${escapeHTML(
                            comment.text
                        )}
                    </p>

                `;


                list.appendChild(item);

            }
        );


    } catch (error) {

        console.error(
            "Comments error:",
            error
        );

        list.innerHTML =
            `<p>
                Unable to load comments.
             </p>`;

    }

}


/* =====================================================
ADD COMMENT
===================================================== */

async function addComment(bookId) {

    if (!requireLogin()) {
        return;
    }


    const input =
        document.querySelector(
            `[data-comment-input="${bookId}"]`
        );


    if (!input) {
        return;
    }


    const text =
        input.value.trim();


    if (!text) {

        alert(
            "Please write a comment."
        );

        return;

    }


    const user =
        currentFirebaseUser;


    try {

        await bookRef(bookId)
            .collection("comments")
            .add({

                userId:
                    user.uid,

                name:
                    user.displayName ||
                    user.email?.split("@")[0] ||
                    "Library User",

                email:
                    user.email || "",

                text:
                    text,

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


        await bookRef(bookId).update({

            comments:
                firebase.firestore
                    .FieldValue
                    .increment(1)

        });


        input.value = "";


        await loadComments(
            bookId
        );


        const book =
            books.find(
                b =>
                    String(b.id) ===
                    String(bookId)
            );


        await loadBookStats(book);

        renderBooks();


    } catch (error) {

        firebaseError(
            error,
            "addComment"
        );

    }

}


/* =====================================================
BUTTON EVENTS
===================================================== */

booksContainer.addEventListener(
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


        const bookId =
            button.dataset.bookId;


        if (action === "read") {

            await openBook(
                bookId
            );

        }


        if (action === "like") {

            await toggleLike(
                bookId
            );

        }


        if (action === "comment") {

            await openComments(
                bookId
            );

        }


        if (action === "send-comment") {

            await addComment(
                bookId
            );

        }


        if (action === "share") {

            await shareBook(
                bookId
            );

        }


        if (action === "download") {

            await downloadBook(
                bookId
            );

        }

    }
);


/* =====================================================
SEARCH
===================================================== */

if (bookSearch) {

    bookSearch.addEventListener(
        "input",
        renderBooks
    );

}


/* =====================================================
CATEGORY
===================================================== */

document
    .querySelectorAll(".category")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".category")
                    .forEach(function(item) {

                        item.classList.remove(
                            "active"
                        );

                    });


                this.classList.add(
                    "active"
                );


                currentCategory =
                    this.dataset.category;


                renderBooks();

            }
        );

    });


/* =====================================================
SORT
===================================================== */

document
    .querySelectorAll(".sort-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".sort-button")
                    .forEach(function(item) {

                        item.classList.remove(
                            "active"
                        );

                    });


                this.classList.add(
                    "active"
                );


                currentSort =
                    this.dataset.sort;


                renderBooks();

            }
        );

    });


/* =====================================================
AUTH STATE UI
===================================================== */

window.addEventListener(
    "firebaseAuthChanged",
    async function(event) {

        const user =
            event.detail.user;


        if (loginStatusText) {

            if (user) {

                loginStatusText.textContent =
                    "Logged in: " +
                    (
                        user.displayName ||
                        user.email ||
                        "User"
                    );

            } else {

                loginStatusText.textContent =
                    "Login required for Like & Comment";

            }

        }


        renderBooks();

    }
);


/* =====================================================
MOBILE MENU
===================================================== */

const mobileMenu =
    document.querySelector(
        ".mobile-menu"
    );


const menu =
    document.querySelector(
        ".menu"
    );


if (mobileMenu && menu) {

    mobileMenu.addEventListener(
        "click",
        function() {

            menu.classList.toggle(
                "show"
            );

        }
    );

}


/* =====================================================
SCROLL TOP
===================================================== */

const scrollTop =
    document.getElementById(
        "scrollTop"
    );


if (scrollTop) {

    window.addEventListener(
        "scroll",
        function() {

            scrollTop.style.display =
                window.scrollY > 300
                    ? "block"
                    : "none";

        }
    );


    scrollTop.addEventListener(
        "click",
        function() {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/* =====================================================
FOOTER
===================================================== */

if (footerYear) {

    footerYear.textContent =
        new Date().getFullYear();

}


/* =====================================================
START
===================================================== */

(async function() {

    try {

        await loadFirebaseBooks();

        console.log(
            "📚 Books:",
            books.length
        );

        console.log(
            "🔥 Firebase book system ready"
        );

    } catch (error) {

        firebaseError(
            error,
            "Book system startup"
        );

    }

})();
