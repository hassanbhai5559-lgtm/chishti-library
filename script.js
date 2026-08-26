/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
UPGRADED PREMIUM VERSION
=========================================*/


/*================================================
PART 1
FOUNDATION + BOOK LOADER
================================================*/


/*=========================
PREMIUM LOADER
=========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        if (loader) {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(() => {

                loader.remove();

            }, 800);

        }

    }, 2500);

});


/*=========================
MOBILE MENU
=========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}


/*=========================
SCROLL TO TOP
=========================*/

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    scrollBtn.style.display =
        window.scrollY > 300 ? "block" : "none";

});

if (scrollBtn) {

    scrollBtn.onclick = () => {

        window.scrollTo({

            top: 0,
            behavior: "smooth"

        });

    };

}


/*=========================
VISITOR COUNTER
=========================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) return;

    try {

        if (typeof db === "undefined") {

            visitorCounter.innerText = "0";
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

            visitorCounter.innerText = "1";

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


        const latestSnapshot =
            await visitorRef.get();

        const visitors =
            Number(
                latestSnapshot.data().count
            ) || 0;


        let current = 0;

        const animation =
            setInterval(function () {

                current++;

                visitorCounter.innerText =
                    current;

                if (current >= visitors) {

                    clearInterval(animation);

                }

            }, 25);


    } catch (error) {

        console.error(
            "Visitor counter error:",
            error
        );

        visitorCounter.innerText = "0";

    }

}

updateVisitorCounter();


/*=========================
GLOBAL VARIABLES
=========================*/

let allBooks = [];
let filteredBooks = [];


/*=========================
LOAD BOOKS.JSON
=========================*/

async function loadBooks() {

    try {

        const response =
            await fetch("books.json");

        if (!response.ok) {

            throw new Error(
                "books.json not found"
            );

        }

        allBooks =
            await response.json();

        filteredBooks =
            [...allBooks];


        /* BOOK COUNTER */

        const bookCounter =
            document.getElementById(
                "bookCounter"
            );

        if (bookCounter) {

            let count = 0;

            const total =
                allBooks.length;

            if (total === 0) {

                bookCounter.innerText = "0";

            } else {

                const animation =
                    setInterval(() => {

                        count++;

                        bookCounter.innerText =
                            count;

                        if (count >= total) {

                            clearInterval(
                                animation
                            );

                        }

                    }, 120);

            }

        }


        if (
            typeof displayBooks ===
            "function"
        ) {

            displayBooks(
                filteredBooks
            );

        }


        if (
            typeof latestBook ===
            "function"
        ) {

            latestBook();

        }


        console.log(
            "✅ Books Loaded Successfully"
        );

    }

    catch (err) {

        console.error(
            "Books loading error:",
            err
        );

    }

}

loadBooks();


/*=========================
UTILITY
=========================*/

function byId(id) {

    return document.getElementById(id);

}

console.log(
    "✅ Script Foundation Loaded"
);



/*================================================
PART 2
BOOK DISPLAY + LIKE + COMMENT + SHARE
================================================*/


/*=========================
BOOK ID
=========================*/

function getBookId(book) {

    return (
        book.id ||
        book.pdf ||
        book.title
    )
    .toString()
    .replace(
        /[^a-zA-Z0-9]/g,
        "_"
    );

}


/*=========================
GET LIKE COUNT
=========================*/

function getLikeCount(book) {

    const id =
        getBookId(book);

    const saved =
        localStorage.getItem(
            "chishti_like_" + id
        );

    return Number(saved) || 0;

}


/*=========================
GET USER LIKE STATUS
=========================*/

function hasUserLiked(book) {

    const id =
        getBookId(book);

    return (
        localStorage.getItem(
            "chishti_liked_" + id
        ) === "true"
    );

}


/*=========================
DISPLAY BOOKS
=========================*/

function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );

    if (!container) return;

    container.innerHTML = "";


    if (!books || books.length === 0) {

        container.innerHTML = `

        <div class="no-books">

            <h2>No Books Found</h2>

            <p>
                Try another search.
            </p>

        </div>

        `;

        return;

    }


    books.forEach(book => {

        const bookId =
            getBookId(book);

        const likes =
            getLikeCount(book);

        const liked =
            hasUserLiked(book);


        container.innerHTML += `

        <div
            class="book-card"
            data-book-id="${bookId}"
        >

            <img
                src="${book.cover}"
                alt="${book.title}"
                loading="lazy"
            >


            <div class="book-content">

                <span class="book-category">

                    ${book.category || ""}

                </span>


                <h2>
                    ${book.title || ""}
                </h2>


                <h3>
                    ${book.author || ""}
                </h3>


                <p>
                    ${book.description || ""}
                </p>


                <!-- BOOK META -->

                <div class="book-meta">

                    <span>
                        👁 ${book.views || 0}
                    </span>

                    <span
                        class="live-like-count"
                        data-like-id="${bookId}"
                    >
                        ❤️ ${likes}
                    </span>

                    <span>
                        ⬇ ${book.downloads || 0}
                    </span>

                </div>


                <!-- SOCIAL ACTIONS -->

                <div class="book-social-actions">

                    <button
                        type="button"
                        class="book-action like-book ${liked ? "liked" : ""}"
                        data-book-id="${bookId}"
                        title="Like this book"
                    >

                        ${liked ? "❤️" : "♡"}

                        <span>
                            ${likes}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action comment-book"
                        data-book-id="${bookId}"
                        title="Comments"
                    >

                        💬

                        <span>
                            Comments
                        </span>

                    </button>


                    <button
                        type="button"
                        class="book-action share-book"
                        data-book-id="${bookId}"
                        title="Share this book"
                    >

                        🔗

                        <span>
                            Share
                        </span>

                    </button>

                </div>


                <!-- COMMENT BOX -->

                <div
                    class="comment-area"
                    id="comments-${bookId}"
                    style="display:none;"
                >

                    <div class="comment-input-row">

                        <input
                            type="text"
                            class="comment-input"
                            data-comment-id="${bookId}"
                            placeholder="Write a comment..."
                            maxlength="300"
                        >

                        <button
                            type="button"
                            class="comment-submit"
                            data-book-id="${bookId}"
                        >
                            Post
                        </button>

                    </div>


                    <div
                        class="comments-list"
                        id="comment-list-${bookId}"
                    ></div>

                </div>


                <!-- BOOK BUTTONS -->

                <div class="book-buttons">

                    <a
                        href="reader.html?book=${encodeURIComponent(book.pdf)}"
                        class="btn"
                    >

                        📖 Read Online

                    </a>


                    <a
                        href="${book.pdf}"
                        download
                        class="btn"
                    >

                        ⬇ Download

                    </a>

                </div>

            </div>

        </div>

        `;

    });


    loadAllComments();

}


/*================================================
LIKE SYSTEM
================================================*/

document.addEventListener(
    "click",
    function(e) {

        const likeBtn =
            e.target.closest(
                ".like-book"
            );

        if (!likeBtn) return;


        const bookId =
            likeBtn.dataset.bookId;


        const likedKey =
            "chishti_liked_" +
            bookId;

        const likeKey =
            "chishti_like_" +
            bookId;


        let likes =
            Number(
                localStorage.getItem(
                    likeKey
                )
            ) || 0;


        const alreadyLiked =
            localStorage.getItem(
                likedKey
            ) === "true";


        if (alreadyLiked) {

            likes =
                Math.max(
                    0,
                    likes - 1
                );

            localStorage.removeItem(
                likedKey
            );

            likeBtn.classList.remove(
                "liked"
            );

            likeBtn.innerHTML =
                `♡ <span>${likes}</span>`;

        }

        else {

            likes++;

            localStorage.setItem(
                likedKey,
                "true"
            );

            likeBtn.classList.add(
                "liked"
            );

            likeBtn.innerHTML =
                `❤️ <span>${likes}</span>`;

        }


        localStorage.setItem(
            likeKey,
            likes
        );


        /* UPDATE META COUNT */

        const meta =
            document.querySelector(
                `[data-like-id="${CSS.escape(bookId)}"]`
            );

        if (meta) {

            meta.innerText =
                "❤️ " + likes;

        }

    }
);


/*================================================
COMMENT SYSTEM
================================================*/


function getComments(bookId) {

    try {

        return JSON.parse(
            localStorage.getItem(
                "chishti_comments_" +
                bookId
            )
        ) || [];

    }

    catch {

        return [];

    }

}


/*=========================
SAVE COMMENTS
=========================*/

function saveComments(
    bookId,
    comments
) {

    localStorage.setItem(

        "chishti_comments_" +
        bookId,

        JSON.stringify(comments)

    );

}


/*=========================
LOAD ALL COMMENTS
=========================*/

function loadAllComments() {

    document
        .querySelectorAll(
            ".comments-list"
        )
        .forEach(list => {

            const bookId =
                list.id.replace(
                    "comment-list-",
                    ""
                );

            renderComments(
                bookId
            );

        });

}


/*=========================
RENDER COMMENTS
=========================*/

function renderComments(bookId) {

    const list =
        document.getElementById(
            "comment-list-" +
            bookId
        );

    if (!list) return;


    const comments =
        getComments(bookId);


    if (comments.length === 0) {

        list.innerHTML = `

            <div class="no-comments">

                No comments yet.

                Be the first to comment!

            </div>

        `;

        return;

    }


    list.innerHTML =
        comments.map(comment => `

        <div class="single-comment">

            <div class="comment-text">

                ${escapeHTML(
                    comment.text
                )}

            </div>

            <small>

                ${comment.date}

            </small>

        </div>

    `).join("");

}


/*=========================
ESCAPE HTML
=========================*/

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.innerText =
        text;

    return div.innerHTML;

}


/*=========================
COMMENT BUTTON
=========================*/

document.addEventListener(
    "click",
    function(e) {

        const btn =
            e.target.closest(
                ".comment-book"
            );

        if (!btn) return;


        const bookId =
            btn.dataset.bookId;

        const area =
            document.getElementById(
                "comments-" +
                bookId
            );

        if (!area) return;


        if (
            area.style.display ===
            "none"
        ) {

            area.style.display =
                "block";

            renderComments(
                bookId
            );


            const input =
                area.querySelector(
                    ".comment-input"
                );

            if (input) {

                setTimeout(
                    () => input.focus(),
                    100
                );

            }

        }

        else {

            area.style.display =
                "none";

        }

    }
);


/*=========================
POST COMMENT
=========================*/

document.addEventListener(
    "click",
    function(e) {

        const btn =
            e.target.closest(
                ".comment-submit"
            );

        if (!btn) return;


        const bookId =
            btn.dataset.bookId;


        const area =
            document.getElementById(
                "comments-" +
                bookId
            );

        if (!area) return;


        const input =
            area.querySelector(
                ".comment-input"
            );

        if (!input) return;


        const text =
            input.value.trim();


        if (!text) return;


        const comments =
            getComments(
                bookId
            );


        comments.push({

            text: text,

            date:
                new Date()
                    .toLocaleString()

        });


        saveComments(
            bookId,
            comments
        );


        input.value = "";


        renderComments(
            bookId
        );

    }
);


/*=========================
ENTER TO POST COMMENT
=========================*/

document.addEventListener(
    "keypress",
    function(e) {

        if (
            e.key !== "Enter"
        ) return;


        const input =
            e.target.closest(
                ".comment-input"
            );

        if (!input) return;


        const bookId =
            input.dataset.commentId;


        const button =
            document.querySelector(
                `.comment-submit[data-book-id="${CSS.escape(bookId)}"]`
            );

        if (button) {

            button.click();

        }

    }
);


/*================================================
SHARE SYSTEM
================================================*/

document.addEventListener(
    "click",
    async function(e) {

        const btn =
            e.target.closest(
                ".share-book"
            );

        if (!btn) return;


        const bookId =
            btn.dataset.bookId;


        const card =
            btn.closest(
                ".book-card"
            );

        if (!card) return;


        const title =
            card.querySelector(
                "h2"
            )?.innerText ||
            "Chishti Library Book";


        const book =
            allBooks.find(
                b =>
                    getBookId(b) ===
                    bookId
            );


        if (!book) return;


        const shareURL =
            new URL(
                "reader.html?book=" +
                encodeURIComponent(
                    book.pdf
                ),
                window.location.href
            ).href;


        const shareData = {

            title:
                title,

            text:
                `Read "${title}" on Chishti Library`,

            url:
                shareURL

        };


        try {

            if (
                navigator.share
            ) {

                await navigator.share(
                    shareData
                );

            }

            else {

                await navigator.clipboard.writeText(
                    shareURL
                );

                showToast(
                    "🔗 Book link copied!"
                );

            }

        }

        catch(error) {

            console.log(
                "Share cancelled"
            );

        }

    }
);


/*=========================
TOAST
=========================*/

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

        document.body.appendChild(
            toast
        );

    }


    toast.innerText =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2200);

}


/*=========================
LIVE SEARCH
=========================*/

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
        allBooks.filter(
            book =>

                (book.title || "")
                    .toLowerCase()
                    .includes(value) ||

                (book.author || "")
                    .toLowerCase()
                    .includes(value) ||

                (book.category || "")
                    .toLowerCase()
                    .includes(value) ||

                (book.language || "")
                    .toLowerCase()
                    .includes(value)

        );


    displayBooks(
        filteredBooks
    );

}


/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(
    category,
    button = null
) {

    document
        .querySelectorAll(
            ".category"
        )
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


    if (category === "All") {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(
                book =>
                    book.category ===
                    category
            );

    }


    displayBooks(
        filteredBooks
    );

}


/*=========================
LATEST BOOK
=========================*/

function latestBook() {

    const latest =
        allBooks.find(
            book =>
                book.latest === true
        );

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
            ".book-buttons a"
        );


    if (image)
        image.src =
            latest.cover;


    if (title)
        title.innerText =
            latest.title;


    if (author)
        author.innerText =
            latest.author;


    if (desc)
        desc.innerText =
            latest.description;


    if (buttons.length >= 2) {

        buttons[0].href =
            latest.pdf;

        buttons[0].target =
            "_blank";

        buttons[1].href =
            latest.pdf;

    }

}


console.log(
    "✅ Books + Social Features Loaded"
);



/*================================================
PART 3
CHATBOT
IMPORTANT:
CHATBOT NEVER AUTO OPENS
================================================*/


let knowledge = [];


/*=========================
LOAD KNOWLEDGE
=========================*/

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

    catch (err) {

        console.log(
            "Knowledge error:",
            err
        );

    }

}

loadKnowledge();


/*=========================
CHAT ELEMENTS
=========================*/

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


/*================================================
FORCE CHAT CLOSED ON PAGE LOAD
================================================*/

if (chatWindow) {

    chatWindow.style.display =
        "none";

}


/*=========================
OPEN CHAT
ONLY BUTTON CLICK
=========================*/

if (chatBtn) {

    chatBtn.onclick = () => {

        if (!chatWindow)
            return;


        chatWindow.style.display =
            "flex";

    };

}


/*=========================
CLOSE CHAT
=========================*/

if (closeChat) {

    closeChat.onclick = () => {

        if (!chatWindow)
            return;


        chatWindow.style.display =
            "none";

    };

}


/*=========================
ESC KEY CLOSE
=========================*/

document.addEventListener(
    "keydown",
    function(e) {

        if (
            e.key === "Escape"
        ) {

            if (chatWindow) {

                chatWindow.style.display =
                    "none";

            }

        }

    }
);


/*=========================
ENTER KEY
=========================*/

if (chatInput) {

    chatInput.addEventListener(
        "keypress",
        (e) => {

            if (
                e.key === "Enter"
            ) {

                sendMessage();

            }

        }
    );

}


/*=========================
SEARCH BOOK
=========================*/

function searchBook(question) {

    const q =
        question
            .toLowerCase()
            .trim();


    for (
        const book of allBooks
    ) {

        if (

            (book.title || "")
                .toLowerCase()
                .includes(q) ||

            (book.category || "")
                .toLowerCase()
                .includes(q)

        ) {

            return `

📚 <b>${book.title}</b><br>

👤 ${book.author}<br>

📂 ${book.category}<br><br>


<a
    href="reader.html?book=${encodeURIComponent(book.pdf)}"
    class="btn"
>
    📖 Read Online
</a>

&nbsp;

<a
    href="${book.pdf}"
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


/*=========================
SEARCH KNOWLEDGE
=========================*/

function searchKnowledge(question) {

    const q =
        question
            .toLowerCase()
            .trim();


    for (
        const item of knowledge
    ) {

        if (

            (item.question || "")
                .toLowerCase()
                .includes(q)

        ) {

            return item.answer;

        }

    }


    return null;

}


/*=========================
BOT MESSAGE
=========================*/

function botReply(text) {

    if (!chatMessages)
        return;


    chatMessages.innerHTML += `

        <div class="bot-message">

            ${text}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================
USER MESSAGE
=========================*/

function userReply(text) {

    if (!chatMessages)
        return;


    chatMessages.innerHTML += `

        <div class="user-message">

            ${escapeHTML(text)}

        </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================
SEND MESSAGE
=========================*/

function sendMessage() {

    if (!chatInput)
        return;


    const question =
        chatInput.value.trim();


    if (
        question === ""
    ) return;


    userReply(
        question
    );


    chatInput.value =
        "";


    setTimeout(() => {

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

Mujhe iska jawab abhi
database me nahi mila.

`;

        }


        botReply(
            reply
        );


    }, 500);

}


console.log(
    "✅ Chatbot Loaded - Auto Open Disabled"
);



/*================================================
PART 4
PREMIUM EFFECTS
================================================*/


/*=========================
SCROLL ANIMATION
=========================*/

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
            (entries) => {

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


/*=========================
BOOK CARD HOVER
=========================*/

document.addEventListener(
    "mouseover",
    (e) => {

        const card =
            e.target.closest(
                ".book-card"
            );


        if (card) {

            card.style.transform =
                "translateY(-10px)";

            card.style.transition =
                ".35s";

        }

    }
);


document.addEventListener(
    "mouseout",
    (e) => {

        const card =
            e.target.closest(
                ".book-card"
            );


        if (card) {

            card.style.transform =
                "translateY(0px)";

        }

    }
);


/*=========================
DOWNLOAD COUNTER
=========================*/

document.addEventListener(
    "click",
    (e) => {

        const btn =
            e.target.closest(
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


/*=========================
READ COUNTER
=========================*/

document.addEventListener(
    "click",
    (e) => {

        const btn =
            e.target.closest(
                "a"
            );


        if (!btn) return;


        if (

            btn.href.includes(
                ".pdf"
            ) &&

            !btn.hasAttribute(
                "download"
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


/*=========================
BUTTON RIPPLE
=========================*/

document.addEventListener(
    "click",
    (e) => {

        const btn =
            e.target.closest(
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
            (
                e.clientX -
                rect.left
            ) + "px";


        ripple.style.top =
            (
                e.clientY -
                rect.top
            ) + "px";


        btn.appendChild(
            ripple
        );


        setTimeout(() => {

            ripple.remove();

        }, 600);

    }
);


/*=========================
NAVBAR SHADOW
=========================*/

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


/*=========================
AUTO YEAR
=========================*/

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date()
            .getFullYear();

}


/*=========================
IMAGE FALLBACK
=========================*/

document
    .querySelectorAll("img")
    .forEach(img => {

        img.onerror =
            function() {

                this.src =
                    "logo.png";

            };

    });


/*=========================
PRELOAD BOOK COVERS
=========================*/

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

                const image =
                    new Image();


                image.src =
                    book.cover;

            }
        );

    }
);


/*=========================
SMOOTH ANCHOR LINKS
=========================*/

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function(e) {

                e.preventDefault();


                const target =
                    document.querySelector(
                        this.getAttribute(
                            "href"
                        )
                    );


                if (target) {

                    target.scrollIntoView({

                        behavior:
                            "smooth"

                    });

                }

            }
        );

    });


/*================================================
FINAL CONSOLE
================================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 2.0 PREMIUM"
);

console.log(
    "Developer : Ali Hassan"
);

console.log(
    "===================================="
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
    "✅ Books"
);

console.log(
    "✅ Like"
);

console.log(
    "✅ Comments"
);

console.log(
    "✅ Share"
);

console.log(
    "✅ AI Chatbot"
);

console.log(
    "✅ Chatbot Auto Open Disabled"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🚀 Production Ready"
);
