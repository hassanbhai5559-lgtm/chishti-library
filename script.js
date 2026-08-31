/*=========================================================
  CHISHTI LIBRARY
  SCRIPT.JS
  COMPLETE FIXED VERSION
  Firebase + Books + Search + Visitor + AI + Premium UI
=========================================================*/


/*=========================================================
  PART 1
  GLOBAL VARIABLES
=========================================================*/

let allBooks = [];
let filteredBooks = [];
let knowledge = [];

let db = null;


/*=========================================================
  FIREBASE INITIALIZATION
=========================================================*/

function initializeFirebase() {

    if (
        typeof firebase === "undefined" ||
        typeof firebase.firestore !== "function"
    ) {

        console.error(
            "❌ Firebase / Firestore SDK not loaded."
        );

        return false;
    }


    try {

        db = firebase.firestore();

        console.log(
            "✅ Firebase Firestore Connected"
        );

        return true;

    }

    catch (error) {

        console.error(
            "❌ Firebase initialization error:",
            error
        );

        return false;
    }
}


/*=========================================================
  PART 2
  PREMIUM LOADER
=========================================================*/

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");


    setTimeout(() => {

        if (!loader) return;


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
  PART 3
  MOBILE MENU
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const menuBtn =
            document.querySelector(
                ".mobile-menu"
            );


        const menu =
            document.querySelector(
                ".menu"
            );


        if (!menuBtn || !menu) return;


        menuBtn.addEventListener(
            "click",
            () => {

                menu.classList.toggle(
                    "show"
                );

            }
        );


        /* Close menu after clicking link */

        menu.querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        menu.classList.remove(
                            "show"
                        );

                    }
                );

            });

    }
);


/*=========================================================
  PART 4
  SCROLL TO TOP
=========================================================*/

const scrollBtn =
    document.getElementById(
        "scrollTop"
    );


window.addEventListener(
    "scroll",
    () => {

        if (!scrollBtn) return;


        scrollBtn.style.display =
            window.scrollY > 300
                ? "block"
                : "none";

    }
);


if (scrollBtn) {

    scrollBtn.addEventListener(
        "click",
        () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


/*=========================================================
  PART 5
  VISITOR COUNTER
  FIREBASE FIRESTORE
=========================================================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById(
            "visitorCounter"
        );


    if (!visitorCounter) return;


    if (!db) {

        if (!initializeFirebase()) {

            visitorCounter.innerText = "0";

            return;

        }

    }


    try {

        const visitorRef =
            db
                .collection("counter")
                .doc("visitors");


        const snapshot =
            await visitorRef.get();


        /*-----------------------------------------
          CREATE COUNTER
        -----------------------------------------*/

        if (!snapshot.exists) {

            await visitorRef.set({

                count: 1,

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            animateVisitorCount(
                visitorCounter,
                1
            );


            return;
        }


        /*-----------------------------------------
          CHECK SESSION
        -----------------------------------------*/

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /*-----------------------------------------
          ADD NEW VISITOR
        -----------------------------------------*/

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore
                        .FieldValue
                        .increment(1),

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        /*-----------------------------------------
          GET FINAL COUNT
        -----------------------------------------*/

        const latestSnapshot =
            await visitorRef.get();


        const data =
            latestSnapshot.data() || {};


        const total =
            Number(data.count) || 0;


        animateVisitorCount(
            visitorCounter,
            total
        );


        console.log(
            "✅ Visitors:",
            total
        );

    }

    catch (error) {

        console.error(
            "❌ Visitor Counter Error:",
            error
        );


        visitorCounter.innerText = "0";

    }

}


/*=========================================================
  VISITOR COUNTER ANIMATION
=========================================================*/

function animateVisitorCount(
    element,
    target
) {

    if (!element) return;


    target =
        Number(target) || 0;


    if (target <= 0) {

        element.innerText = "0";

        return;

    }


    const duration = 900;

    const start =
        performance.now();


    function animate(now) {

        const progress =
            Math.min(
                (now - start) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const current =
            Math.floor(
                eased * target
            );


        element.innerText =
            current.toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        }

        else {

            element.innerText =
                target.toLocaleString();

        }

    }


    requestAnimationFrame(
        animate
    );

}


/*=========================================================
  PART 6
  LOAD BOOKS FROM FIREBASE
=========================================================*/

async function loadBooks() {

    const container =
        document.getElementById(
            "booksContainer"
        );


    try {

        if (!db) {

            if (!initializeFirebase()) {

                console.error(
                    "❌ Firebase unavailable."
                );

                return;

            }

        }


        console.log(
            "📚 Loading books..."
        );


        const snapshot =
            await db
                .collection("books")
                .get();


        allBooks = [];


        snapshot.forEach(
            doc => {

                const data =
                    doc.data() || {};


                allBooks.push({

                    id: doc.id,

                    title:
                        data.title || "Untitled Book",

                    author:
                        data.author || "Unknown Author",

                    category:
                        data.category || "General",

                    description:
                        data.description || "",

                    language:
                        data.language || "",

                    cover:
                        data.cover || "logo.png",

                    pdf:
                        data.pdf || "",

                    views:
                        Number(data.views) || 0,

                    likes:
                        Number(data.likes) || 0,

                    downloads:
                        Number(data.downloads) || 0,

                    latest:
                        data.latest === true,

                    featured:
                        data.featured === true,

                    published:
                        data.published !== false,

                    createdAt:
                        data.createdAt || null

                });

            }
        );


        /*-----------------------------------------
          ONLY PUBLISHED BOOKS
        -----------------------------------------*/

        allBooks =
            allBooks.filter(
                book =>
                    book.published !== false
            );


        filteredBooks =
            [...allBooks];


        /*-----------------------------------------
          DISPLAY
        -----------------------------------------*/

        displayBooks(
            filteredBooks
        );


        /*-----------------------------------------
          LATEST
        -----------------------------------------*/

        latestBook();


        /*-----------------------------------------
          CAROUSEL
        -----------------------------------------*/

        if (
            typeof initBookCarousel ===
            "function"
        ) {

            initBookCarousel();

        }


        console.log(
            `✅ ${allBooks.length} books loaded`
        );

    }

    catch (error) {

        console.error(
            "❌ Books Loading Error:",
            error
        );


        if (container) {

            container.innerHTML = `

                <div class="no-books">

                    <h2>
                        Books could not be loaded
                    </h2>

                    <p>
                        Please try again later.
                    </p>

                </div>

            `;

        }

    }

}


/*=========================================================
  START FIREBASE + BOOKS
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeFirebase();

        updateVisitorCounter();

        loadBooks();

    }
);


/*=========================================================
  UTILITY
=========================================================*/

function byId(id) {

    return document.getElementById(id);

}


/*=========================================================
  PART 7
  DISPLAY BOOKS
=========================================================*/

function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!Array.isArray(books)) {

        books = [];

    }


    /*-----------------------------------------
      NO BOOKS
    -----------------------------------------*/

    if (books.length === 0) {

        container.innerHTML = `

            <div class="no-books">

                <h2>No Books Found</h2>

                <p>
                    Try another search or category.
                </p>

            </div>

        `;

        return;
    }


    /*-----------------------------------------
      BOOK CARDS
    -----------------------------------------*/

    books.forEach(book => {

        const safeTitle =
            escapeHTML(book.title);


        const safeAuthor =
            escapeHTML(book.author);


        const safeCategory =
            escapeHTML(book.category);


        const safeDescription =
            escapeHTML(book.description);


        const cover =
            book.cover || "logo.png";


        const pdf =
            book.pdf || "";


        container.innerHTML += `

            <div
                class="book-card"
                data-book-id="${book.id || ""}"
            >

                <img
                    src="${cover}"
                    alt="${safeTitle}"
                    loading="lazy"
                    onerror="this.src='logo.png'"
                >


                <div class="book-content">

                    <span class="book-category">

                        ${safeCategory}

                    </span>


                    <h2>

                        ${safeTitle}

                    </h2>


                    <h3>

                        ${safeAuthor}

                    </h3>


                    <p>

                        ${safeDescription}

                    </p>


                    <div class="book-meta">

                        <span>
                            👁
                            ${Number(book.views) || 0}
                        </span>


                        <span>
                            ❤️
                            ${Number(book.likes) || 0}
                        </span>


                        <span>
                            ⬇
                            ${Number(book.downloads) || 0}
                        </span>

                    </div>


                    <div class="book-buttons">

                        ${
                            pdf
                            ?
                            `

                            <a
                                href="reader.html?book=${encodeURIComponent(pdf)}"
                                class="btn read-book"
                                data-book-id="${book.id || ""}"
                            >
                                📖 Read Online
                            </a>


                            <a
                                href="${pdf}"
                                download
                                class="btn download-book"
                                data-book-id="${book.id || ""}"
                            >
                                ⬇ Download
                            </a>

                            `
                            :
                            `
                            <span class="btn disabled">
                                PDF Unavailable
                            </span>
                            `
                        }

                    </div>

                </div>

            </div>

        `;

    });


    /*-----------------------------------------
      IMAGE FALLBACK
    -----------------------------------------*/

    container
        .querySelectorAll("img")
        .forEach(img => {

            img.addEventListener(
                "error",
                () => {

                    img.src = "logo.png";

                },
                {
                    once: true
                }
            );

        });

}


/*=========================================================
  ESCAPE HTML
=========================================================*/

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";

    }


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


/*=========================================================
  PART 8
  SEARCH BOOKS
=========================================================*/

function searchBooks() {

    const input =
        document.getElementById(
            "searchInput"
        );


    if (!input) return;


    const value =
        input.value
            .toLowerCase()
            .trim();


    filteredBooks =
        allBooks.filter(book => {

            return (

                (book.title || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.author || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.category || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.language || "")
                    .toLowerCase()
                    .includes(value)

                ||

                (book.description || "")
                    .toLowerCase()
                    .includes(value)

            );

        });


    displayBooks(
        filteredBooks
    );


    if (
        typeof restartBookCarousel ===
        "function"
    ) {

        restartBookCarousel();

    }

}


/*=========================================================
  SEARCH INPUT EVENT
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const searchInput =
            document.getElementById(
                "searchInput"
            );


        if (!searchInput) return;


        searchInput.addEventListener(
            "input",
            searchBooks
        );

    }
);


/*=========================================================
  PART 9
  CATEGORY FILTER
=========================================================*/

function filterBooks(
    category,
    button = null
) {

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

    }


    if (
        !category ||
        category === "All"
    ) {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(
                book =>

                    String(
                        book.category
                    )
                    .toLowerCase() ===
                    String(category)
                    .toLowerCase()

            );

    }


    displayBooks(
        filteredBooks
    );


    if (
        typeof restartBookCarousel ===
        "function"
    ) {

        restartBookCarousel();

    }

}


/*=========================================================
  PART 10
  LATEST BOOK
=========================================================*/

function latestBook() {

    if (!Array.isArray(allBooks)) return;


    let latest =
        allBooks.find(
            book =>
                book.latest === true
        );


    /*-----------------------------------------
      FALLBACK: MOST RECENT BOOK
    -----------------------------------------*/

    if (!latest && allBooks.length > 0) {

        latest =
            allBooks[0];

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


    const desc =
        document.querySelector(
            ".book-info p"
        );


    const buttons =
        document.querySelectorAll(
            ".book-info .book-buttons a, .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover ||
            "logo.png";

    }


    if (title) {

        title.innerText =
            latest.title || "";

    }


    if (author) {

        author.innerText =
            latest.author || "";

    }


    if (desc) {

        desc.innerText =
            latest.description || "";

    }


    if (buttons.length >= 1) {

        buttons[0].href =
            `reader.html?book=${encodeURIComponent(
                latest.pdf || ""
            )}`;

    }


    if (buttons.length >= 2) {

        buttons[1].href =
            latest.pdf || "";

    }

}


/*=========================================================
  PART 11
  FIREBASE BOOK VIEWS
=========================================================*/

async function increaseBookViews(
    bookId
) {

    if (!bookId || !db) return;


    try {

        await db
            .collection("books")
            .doc(bookId)
            .update({

                views:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });


        console.log(
            "👁 Book view +1"
        );

    }

    catch (error) {

        console.error(
            "❌ View update error:",
            error
        );

    }

}


/*=========================================================
  FIREBASE DOWNLOAD COUNTER
=========================================================*/

async function increaseBookDownloads(
    bookId
) {

    if (!bookId || !db) return;


    try {

        await db
            .collection("books")
            .doc(bookId)
            .update({

                downloads:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });


        console.log(
            "⬇ Download +1"
        );

    }

    catch (error) {

        console.error(
            "❌ Download update error:",
            error
        );

    }

}


/*=========================================================
  FIREBASE LIKE
=========================================================*/

async function likeBook(
    bookId
) {

    if (!bookId || !db) return;


    const key =
        `chishtiLiked_${bookId}`;


    if (
        localStorage.getItem(key)
    ) {

        return;

    }


    try {

        await db
            .collection("books")
            .doc(bookId)
            .update({

                likes:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });


        localStorage.setItem(
            key,
            "true"
        );


        console.log(
            "❤️ Like added"
        );

    }

    catch (error) {

        console.error(
            "❌ Like error:",
            error
        );

    }

}


/*=========================================================
  BOOK ACTION EVENTS
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const readBtn =
            event.target.closest(
                ".read-book"
            );


        const downloadBtn =
            event.target.closest(
                ".download-book"
            );


        if (readBtn) {

            const bookId =
                readBtn.dataset.bookId;


            increaseBookViews(
                bookId
            );

        }


        if (downloadBtn) {

            const bookId =
                downloadBtn.dataset.bookId;


            increaseBookDownloads(
                bookId
            );

        }

    }
);


/*=========================================================
  PART 12
  AI KNOWLEDGE
=========================================================*/

async function loadKnowledge() {

    try {

        const response =
            await fetch(
                "knowledge.json"
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

    }

    catch (error) {

        console.error(
            "❌ Knowledge Error:",
            error
        );

    }

}


loadKnowledge();


/*=========================================================
  CHAT ELEMENTS
=========================================================*/

const chatBtn =
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


const chatInput =
    document.getElementById(
        "chatInput"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


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
  ENTER KEY
=========================================================*/

if (chatInput) {

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


/*=========================================================
  SEARCH BOOK FOR AI
=========================================================*/

function searchBook(question) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    for (const book of allBooks) {

        const title =
            (book.title || "")
                .toLowerCase();


        const category =
            (book.category || "")
                .toLowerCase();


        const author =
            (book.author || "")
                .toLowerCase();


        if (

            title.includes(q)

            ||

            category.includes(q)

            ||

            author.includes(q)

        ) {

            return `

                📚 <b>
                ${escapeHTML(book.title)}
                </b>

                <br>

                👤
                ${escapeHTML(book.author)}

                <br>

                📂
                ${escapeHTML(book.category)}

                <br><br>

                <a
                    href="reader.html?book=${encodeURIComponent(book.pdf || "")}"
                    class="btn"
                >
                    📖 Read Online
                </a>

                &nbsp;

                <a
                    href="${book.pdf || "#"}"
                    download
                    class="btn"
                >
                    ⬇ Download
                </a>

            `;

        }

    }


    return null;

}


/*=========================================================
  SEARCH KNOWLEDGE
=========================================================*/

function searchKnowledge(question) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    for (const item of knowledge) {

        const itemQuestion =
            String(
                item.question || ""
            )
            .toLowerCase();


        const keywords =
            Array.isArray(
                item.keywords
            )
            ?
            item.keywords
            :
            [];


        if (
            itemQuestion.includes(q)
            ||
            keywords.some(
                keyword =>
                    String(keyword)
                        .toLowerCase()
                        .includes(q)
            )
        ) {

            return item.answer || null;

        }

    }


    return null;

}


/*=========================================================
  BOT MESSAGE
=========================================================*/

function botReply(text) {

    if (!chatMessages) return;


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "bot-message";


    message.innerHTML =
        text;


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
  USER MESSAGE
=========================================================*/

function userReply(text) {

    if (!chatMessages) return;


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "user-message";


    message.innerText =
        text;


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================================
  SEND MESSAGE
=========================================================*/

function sendMessage() {

    if (!chatInput) return;


    const question =
        chatInput.value.trim();


    if (!question) return;


    userReply(
        question
    );


    chatInput.value = "";


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

                    Mujhe iska jawab abhi
                    database mein nahi mila.

                `;

            }


            botReply(
                reply
            );

        },
        400
    );

}


/*=========================================================
  PART 13
  SCROLL ANIMATION
=========================================================*/

const sections =
    document.querySelectorAll(
        "section"
    );


if (
    "IntersectionObserver"
    in window
) {

    const observer =
        new IntersectionObserver(

            entries => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add(
                                    "show-section"
                                );

                        }

                    }
                );

            },

            {
                threshold: 0.15
            }

        );


    sections.forEach(
        section => {

            observer.observe(
                section
            );

        }
    );

}


/*=========================================================
  PART 14
  BOOK CARD HOVER
=========================================================*/

document.addEventListener(
    "mouseover",
    event => {

        const card =
            event.target.closest(
                ".book-card"
            );


        if (!card) return;


        card.style.transform =
            "translateY(-10px)";


        card.style.transition =
            "transform .35s ease";

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


        card.style.transform =
            "translateY(0)";

    }
);


/*=========================================================
  PART 15
  LOCAL DOWNLOAD COUNTER
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                "a"
            );


        if (!btn) return;


        if (
            btn.hasAttribute(
                "download"
            )
        ) {

            let total =
                Number(
                    localStorage.getItem(
                        "downloads"
                    )
                ) || 0;


            total++;


            localStorage.setItem(
                "downloads",
                total
            );

        }

    }
);


/*=========================================================
  PART 16
  LOCAL READ COUNTER
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                "a"
            );


        if (!btn) return;


        const href =
            btn.getAttribute(
                "href"
            ) || "";


        if (

            href.includes(
                "reader.html"
            )

        ) {

            let total =
                Number(
                    localStorage.getItem(
                        "reads"
                    )
                ) || 0;


            total++;


            localStorage.setItem(
                "reads",
                total
            );

        }

    }
);


/*=========================================================
  PART 17
  BUTTON RIPPLE
=========================================================*/

document.addEventListener(
    "click",
    event => {

        const btn =
            event.target.closest(
                ".btn"
            );


        if (!btn) return;


        const ripple =
            document.createElement(
                "span"
            );


        ripple.className =
            "ripple";


        const rect =
            btn.getBoundingClientRect();


        ripple.style.left =
            `${event.clientX - rect.left}px`;


        ripple.style.top =
            `${event.clientY - rect.top}px`;


        btn.appendChild(
            ripple
        );


        setTimeout(
            () => {

                if (ripple) {

                    ripple.remove();

                }

            },
            600
        );

    }
);


/*=========================================================
  PART 18
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

        }

        else {

            nav.classList.remove(
                "nav-shadow"
            );

        }

    }
);


/*=========================================================
  PART 19
  AUTO YEAR
=========================================================*/

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date()
            .getFullYear();

}


/*=========================================================
  PART 20
  IMAGE FALLBACK
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document
            .querySelectorAll("img")
            .forEach(img => {

                img.addEventListener(
                    "error",
                    function () {

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
);


/*=========================================================
  PART 21
  PRELOAD BOOK COVERS
=========================================================*/

window.addEventListener(
    "load",
    () => {

        if (
            !Array.isArray(
                allBooks
            )
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
);


/*=========================================================
  PART 22
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
                    function (event) {

                        const selector =
                            this.getAttribute(
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
  PART 23
  GLOBAL FUNCTIONS
=========================================================*/

window.searchBooks =
    searchBooks;


window.filterBooks =
    filterBooks;


window.sendMessage =
    sendMessage;


window.likeBook =
    likeBook;


window.loadBooks =
    loadBooks;


/*=========================================================
  FINAL CONSOLE
=========================================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 2.0"
);

console.log(
    "Firebase : Firestore"
);

console.log(
    "===================================="
);

console.log(
    "✅ Firebase"
);

console.log(
    "✅ Loader"
);

console.log(
    "✅ Navbar"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Firebase Books"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "✅ Book Views"
);

console.log(
    "✅ Likes"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ AI Knowledge"
);

console.log(
    "✅ Chatbot"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🚀 Chishti Library Ready"
);
