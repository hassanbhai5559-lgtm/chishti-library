"use strict";


/* =====================================================
   FIREBASE CONFIG
   IMPORTANT:
   firebase.js ko is page par dobara load MAT karna.
===================================================== */

const firebaseConfig = {

    apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",

    authDomain:
        "chishti-library.firebaseapp.com",

    projectId:
        "chishti-library",

    storageBucket:
        "chishti-library.firebasestorage.app",

    messagingSenderId:
        "103447043162",

    appId:
        "1:103447043162:web:f242cd2670aaa9786e8c63",

    measurementId:
        "G-833P7N3LNT"

};



/* =====================================================
   FIREBASE INITIALIZATION
===================================================== */

let db = null;


try {

    if (!firebase.apps.length) {

        firebase.initializeApp(firebaseConfig);

    }

    db = firebase.firestore();

    console.log(
        "🔥 Firebase connected:",
        firebaseConfig.projectId
    );

}
catch (error) {

    console.error(
        "❌ Firebase initialization error:",
        error
    );

}



/* =====================================================
   BOOK DATABASE
===================================================== */

const books = [

    {
        id: 1,
        title: "Al-Rehman",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "al-rehman-cover.png",
        pdf: "Al Rehman .. Latif Sajid.C.pdf",
        description:
            "99 Names of Allah Book Series by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 2,
        title: "Husn-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "husn-e-kainat-cover.png",
        pdf: "husn-e-kainat.pdf",
        description:
            "Naatiya Kalam by Hazrat Allama Saim Chishti."
    },

    {
        id: 3,
        title: "Shahdaye Karbala",
        author: "Hazrat Allama Saim Chishti",
        category: "Manqabat",
        cover: "shahdaye karbala-cover.png",
        pdf: "shahdaye-karbala.pdf",
        description:
            "Karbala ke shuhada ke fazail par manqabat ki kitab."
    },

    {
        id: 4,
        title: "Shaheed Ibn-e-Shaheed",
        author: "Hazrat Allama Saim Chishti",
        category: "Seerat",
        cover: "shaheed-ibn-e-shaheed-cover.png",
        pdf: "shaheed-ibn-e-shaheed.pdf",
        description:
            "Historical Manqabat book by Hazrat Allama Saim Chishti."
    },

    {
        id: 5,
        title: "Nawaye Saim",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "Nawaye Saim-cover.png",
        pdf: "noori.pdf",
        description:
            "Naatiya Majmua by Hazrat Allama Saim Chishti."
    },

    {
        id: 6,
        title: "Kulliyat-e-Saim Chishti",
        author: "Hazrat Allama Saim Chishti",
        category: "Kulliyat",
        cover: "kulliyat e saim chishti-cover.png",
        pdf: "Kulliyat e Saim Chishti By Allama Saim Chishti.pdf",
        description:
            "Complete Kulliyat of Hazrat Allama Saim Chishti."
    },

    {
        id: 7,
        title: "Punjabi Maqala",
        author: "Hazrat Allama Saim Chishti",
        category: "Maqala",
        cover: "allamasaimchishtipunjbimaqala-cover.png",
        pdf: "allamasaimchishtipunjabimaqala-231010120010-3ca7944b (1).pdf",
        description:
            "Punjabi Maqala by Hazrat Allama Saim Chishti."
    },

    {
        id: 8,
        title: "Armaghan-e-Madina",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "Armaghan-e-Madina-By-Allama-Saim-Chishti-cover.webp",
        pdf: "armughan e madina.pdf",
        description:
            "Collection of Naats by Hazrat Allama Saim Chishti."
    },

    {
        id: 9,
        title: "Shan-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "naat-cover2.png",
        pdf: "shan-e-kainat.pdf",
        description:
            "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 10,
        title: "Rehmat Da Khazana",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "rehmatdakhazana-cover.png",
        pdf: "rehmatdakhazana.pdf",
        description:
            "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 11,
        title: "Madinay Diyan Kaliyan",
        author: "Hazrat Allama Saim Chishti",
        category: "Naat",
        cover: "madinydiankalinyan-cover.png",
        pdf: "madinydiankalinyan.pdf",
        description:
            "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 12,
        title: "Darooda Di Dali",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Naat",
        cover: "darooda di dali-cover..png",
        pdf: "Darooda Di Dali Pdf.pdf",
        description:
            "A Punjabi Naatiya book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 13,
        title: "Sbhy Hamdan Ne Rab Sohnay",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Sbhy Hamdan Ne Rab Sohnay-cover.jpeg",
        pdf: "Sbhy Hamdan Ne Rab Sohnay.pdf",
        description:
            "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 14,
        title: "Saqi e Baghdad",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Manqabat",
        cover: "Saqi e Baghdad.cover.jpeg",
        pdf: "Saqi e Baghdad ....Final.pdf",
        description:
            "A Manqabat book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 15,
        title: "Rab de rang niraly hamdya punjabi",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Rab de rang niraly hamdya-cover.jpeg",
        pdf: "Rab de rang niraly hamdya punjabi.pdf",
        description:
            "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 16,
        title: "Hammad Hico",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Hammad Hico-cover.jpeg",
        pdf: "Hamad Hico Book.pdf",
        description:
            "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 17,
        title: "Mazhar E noor e Khuda",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "Hamd",
        cover: "Mazhar E noor e Khuda-cover.png",
        pdf: "Mazhar E noor e Khuda.pdf",
        description:
            "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 18,
        title: "Ali Ali Hai",
        author: "Hazrat Allama Saim Chishti",
        category: "Manqabat",
        cover: "ALI ALI HAI-COVER.png",
        pdf: "ALI ALI HAI BOOK SAIM CHISHTI BOOKS.pdf",
        description:
            "Manqabat by Hazrat Allama Saim Chishti.",
        latest: true
    },

    {
        id: 19,
        title: "Al Batool",
        author: "Hazrat Allama Saim Chishti",
        category: "Seerat",
        cover: "Al-batool-cover.png",
        pdf: "AL-batool.pdf",
        description:
            "A Seerat book by Hazrat Allama Saim Chishti.",
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

const totalViews =
    document.getElementById("totalViews");

const totalLikes =
    document.getElementById("totalLikes");

const emptyBooks =
    document.getElementById("emptyBooks");

const firebaseStatus =
    document.getElementById("firebaseStatus");

const scrollTop =
    document.getElementById("scrollTop");

const mobileMenu =
    document.querySelector(".mobile-menu");

const menu =
    document.querySelector(".menu");


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
   FIREBASE DOCUMENT
===================================================== */

function getBookRef(bookId) {

    return db
        .collection("books")
        .doc("book-" + bookId);

}



/* =====================================================
   INITIALIZE ALL BOOKS
===================================================== */

async function initializeBooks() {

    if (!db) {

        setFirebaseStatus(
            "Firebase unavailable",
            true
        );

        return;

    }


    try {

        const batch = db.batch();


        books.forEach(book => {

            const ref =
                getBookRef(book.id);


            batch.set(
                ref,
                {

                    firebaseId: ref.id,

                    id: Number(book.id),

                    title: book.title || "",

                    author: book.author || "",

                    category: book.category || "",

                    cover: book.cover || "",

                    pdf: book.pdf || "",

                    description:
                        book.description || "",

                    latest:
                        book.latest === true,

                    views: 0,

                    likes: 0,

                    shares: 0,

                    comments: 0,

                    downloads: 0

                },
                {
                    merge: true
                }
            );

        });


        await batch.commit();


        console.log(
            "🔥 All books synchronized."
        );


        setFirebaseStatus(
            "🔥 Firebase Connected"
        );


        await loadFirebaseCounters();

    }
    catch (error) {

        console.error(
            "❌ Firebase book error:",
            error
        );


        setFirebaseStatus(
            "Firebase error: " + error.message,
            true
        );

    }

}



/* =====================================================
   LOAD COUNTERS
===================================================== */

async function loadFirebaseCounters() {

    if (!db) return;


    try {

        const snapshot =
            await db
                .collection("books")
                .get();


        const firebaseData = {};


        snapshot.forEach(doc => {

            firebaseData[doc.id] =
                doc.data();

        });


        books.forEach(book => {

            const data =
                firebaseData[
                    "book-" + book.id
                ];


            if (!data) return;


            book.firebaseId =
                data.firebaseId ||
                "book-" + book.id;


            book.views =
                Number(data.views || 0);


            book.likes =
                Number(data.likes || 0);


            book.shares =
                Number(data.shares || 0);


            book.comments =
                Number(data.comments || 0);


            book.downloads =
                Number(data.downloads || 0);

        });


        updateGlobalCounters();

        renderBooks();

    }
    catch (error) {

        console.error(
            "❌ Counter loading error:",
            error
        );

    }

}



/* =====================================================
   GLOBAL COUNTERS
===================================================== */

function updateGlobalCounters() {

    const views =
        books.reduce(
            (sum, book) =>
                sum + Number(book.views || 0),
            0
        );


    const likes =
        books.reduce(
            (sum, book) =>
                sum + Number(book.likes || 0),
            0
        );


    if (totalViews) {

        totalViews.textContent =
            formatNumber(views);

    }


    if (totalLikes) {

        totalLikes.textContent =
            formatNumber(likes);

    }

}



/* =====================================================
   NUMBER FORMAT
===================================================== */

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString();

}



/* =====================================================
   FIREBASE STATUS
===================================================== */

function setFirebaseStatus(
    text,
    error = false
) {

    if (!firebaseStatus) return;


    firebaseStatus.innerHTML =
        error
            ? `<i class="fas fa-triangle-exclamation"></i> ${escapeHTML(text)}`
            : `<i class="fas fa-circle-check"></i> ${escapeHTML(text)}`;


    firebaseStatus.classList.toggle(
        "error",
        error
    );

}



/* =====================================================
   INCREMENT COUNTER
===================================================== */

async function incrementCounter(
    bookId,
    field
) {

    if (!db) return;


    try {

        const ref =
            getBookRef(bookId);


        await ref.update({

            [field]:
                firebase.firestore.FieldValue.increment(1)

        });


        const book =
            books.find(
                item =>
                    String(item.id) ===
                    String(bookId)
            );


        if (book) {

            book[field] =
                Number(book[field] || 0) + 1;

        }


        updateGlobalCounters();

        renderBooks();

    }
    catch (error) {

        console.error(
            "❌ Counter update error:",
            error
        );

    }

}



/* =====================================================
   LIKE
===================================================== */

async function likeBook(bookId) {

    const key =
        "chishti-liked-" + bookId;


    if (localStorage.getItem(key)) {

        alert(
            "Aap is book ko already like kar chuke hain ❤️"
        );

        return;

    }


    await incrementCounter(
        bookId,
        "likes"
    );


    localStorage.setItem(
        key,
        "true"
    );

}



/* =====================================================
   SHARE
===================================================== */

async function shareBook(bookId) {

    const book =
        books.find(
            item =>
                String(item.id) ===
                String(bookId)
        );


    if (!book) return;


    const url =
        window.location.origin +
        window.location.pathname +
        "?book=" +
        encodeURIComponent(book.id);


    try {

        if (navigator.share) {

            await navigator.share({

                title:
                    book.title,

                text:
                    "Read " +
                    book.title +
                    " on Chishti Library",

                url: url

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


        await incrementCounter(
            bookId,
            "shares"
        );

    }
    catch (error) {

        if (error.name !== "AbortError") {

            console.error(
                "Share error:",
                error
            );

        }

    }

}



/* =====================================================
   COMMENT
===================================================== */

async function commentBook(bookId) {

    const comment =
        prompt(
            "Apna comment likhein:"
        );


    if (!comment ||
        !comment.trim()) {

        return;

    }


    await incrementCounter(
        bookId,
        "comments"
    );


    alert(
        "Comment count updated. 💬"
    );

}



/* =====================================================
   DOWNLOAD
===================================================== */

async function downloadBook(bookId) {

    const book =
        books.find(
            item =>
                String(item.id) ===
                String(bookId)
        );


    if (!book || !book.pdf) return;


    await incrementCounter(
        bookId,
        "downloads"
    );


    const link =
        document.createElement("a");


    link.href =
        "./" + book.pdf;


    link.download =
        book.pdf;


    document.body.appendChild(link);

    link.click();

    link.remove();

}



/* =====================================================
   OPEN / READ BOOK
===================================================== */

async function openBook(bookId) {

    const book =
        books.find(
            item =>
                String(item.id) ===
                String(bookId)
        );


    if (!book) {

        console.error(
            "Book not found:",
            bookId
        );

        return;

    }


    const pdfFile =
        String(book.pdf || "").trim();


    if (!pdfFile) {

        alert(
            "Is book ki PDF configured nahi hai."
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
            "Valid PDF file nahi mili."
        );

        return;

    }


    /*
       VIEW COUNTER
    */

    await incrementCounter(
        bookId,
        "views"
    );


    /*
       EXACT READER URL
    */

    const readerURL =
        "./reader.html?book=" +
        encodeURIComponent(pdfFile);


    window.location.href =
        readerURL;

}



/* =====================================================
   BOOK CARD
===================================================== */

function createBookCard(book) {

    const card =
        document.createElement("article");


    card.className =
        "book-card";


    const liked =
        localStorage.getItem(
            "chishti-liked-" + book.id
        );


    card.innerHTML = `

        <div class="book-cover">

            <img
                src="./${escapeHTML(book.cover)}"
                alt="${escapeHTML(book.title)}"
                loading="lazy"
                onerror="this.onerror=null;this.src='./logo.png';"
            >


            <span class="book-category">

                ${escapeHTML(book.category)}

            </span>


            <div class="book-cover-overlay">

                <button
                    class="read-button"
                    type="button"
                    data-action="read"
                    data-book-id="${book.id}"
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

                <span class="stat">
                    <i class="fas fa-eye"></i>
                    ${formatNumber(book.views)}
                </span>

                <span class="stat">
                    <i class="fas fa-heart"></i>
                    ${formatNumber(book.likes)}
                </span>

                <span class="stat">
                    <i class="fas fa-share"></i>
                    ${formatNumber(book.shares)}
                </span>

                <span class="stat">
                    <i class="fas fa-comment"></i>
                    ${formatNumber(book.comments)}
                </span>

                <span class="stat">
                    <i class="fas fa-download"></i>
                    ${formatNumber(book.downloads)}
                </span>

            </div>


            <div class="book-actions">

                <button
                    class="book-action ${liked ? "liked" : ""}"
                    data-action="like"
                    data-book-id="${book.id}"
                    title="Like"
                >

                    <i class="fas fa-heart"></i>

                    Like

                </button>


                <button
                    class="book-action"
                    data-action="share"
                    data-book-id="${book.id}"
                    title="Share"
                >

                    <i class="fas fa-share"></i>

                    Share

                </button>


                <button
                    class="book-action"
                    data-action="comment"
                    data-book-id="${book.id}"
                    title="Comment"
                >

                    <i class="fas fa-comment"></i>

                    Comment

                </button>


                <button
                    class="book-action"
                    data-action="download"
                    data-book-id="${book.id}"
                    title="Download"
                >

                    <i class="fas fa-download"></i>

                    Download

                </button>


                <button
                    class="book-action"
                    data-action="read"
                    data-book-id="${book.id}"
                    title="Read"
                >

                    <i class="fas fa-book-open"></i>

                    Read

                </button>

            </div>


            <button
                class="open-book-button"
                data-action="read"
                data-book-id="${book.id}"
            >

                Read Online

                <i class="fas fa-arrow-right"></i>

            </button>

        </div>

    `;


    return card;

}



/* =====================================================
   SORTING
===================================================== */

function sortBooks(list) {

    const sorted =
        [...list];


    if (currentSort === "newest") {

        sorted.sort(
            (a, b) =>
                Number(b.id) -
                Number(a.id)
        );

    }


    if (currentSort === "oldest") {

        sorted.sort(
            (a, b) =>
                Number(a.id) -
                Number(b.id)
        );

    }


    if (currentSort === "popular") {

        sorted.sort(
            (a, b) => {

                const scoreA =
                    Number(a.views || 0) +
                    Number(a.likes || 0) * 3 +
                    Number(a.shares || 0) * 4 +
                    Number(a.comments || 0) * 2 +
                    Number(a.downloads || 0) * 3;


                const scoreB =
                    Number(b.views || 0) +
                    Number(b.likes || 0) * 3 +
                    Number(b.shares || 0) * 4 +
                    Number(b.comments || 0) * 2 +
                    Number(b.downloads || 0) * 3;


                return scoreB - scoreA;

            }
        );

    }


    return sorted;

}



/* =====================================================
   RENDER BOOKS
===================================================== */

function renderBooks() {

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


            const searchText =
                (
                    book.title +
                    " " +
                    book.author +
                    " " +
                    book.category +
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


    filtered =
        sortBooks(filtered);


    booksContainer.innerHTML = "";


    if (bookCount) {

        bookCount.textContent =
            filtered.length;

    }


    if (!filtered.length) {

        emptyBooks.style.display =
            "block";

        return;

    }


    emptyBooks.style.display =
        "none";


    const fragment =
        document.createDocumentFragment();


    filtered.forEach(book => {

        fragment.appendChild(
            createBookCard(book)
        );

    });


    booksContainer.appendChild(
        fragment
    );

}



/* =====================================================
   BOOK ACTION CLICK
===================================================== */

booksContainer.addEventListener(
    "click",
    async function(event) {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) return;


        const action =
            button.dataset.action;


        const bookId =
            button.dataset.bookId;


        if (action === "read") {

            await openBook(bookId);

        }


        if (action === "like") {

            await likeBook(bookId);

        }


        if (action === "share") {

            await shareBook(bookId);

        }


        if (action === "comment") {

            await commentBook(bookId);

        }


        if (action === "download") {

            await downloadBook(bookId);

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
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".category")
                    .forEach(item => {

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
    .querySelectorAll(".sort-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            function() {

                document
                    .querySelectorAll(".sort-btn")
                    .forEach(item => {

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
   MOBILE MENU
===================================================== */

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
   YEAR
===================================================== */

const footerYear =
    document.getElementById(
        "footerYear"
    );


if (footerYear) {

    footerYear.textContent =
        new Date().getFullYear();

}



/* =====================================================
   START
===================================================== */

renderBooks();


if (db) {

    initializeBooks();

}
else {

    setFirebaseStatus(
        "Firebase could not initialize.",
        true
    );

}


console.log(
    "📚 Chishti Library Books:",
    books.length
);
