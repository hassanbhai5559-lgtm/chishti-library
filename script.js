/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
FULL PREMIUM VERSION
=========================================*/

"use strict";


/*=========================================
GLOBAL VARIABLES
=========================================*/

let allBooks = [];
let filteredBooks = [];


/*=========================================
UTILITY
=========================================*/

function byId(id) {
    return document.getElementById(id);
}


/*=========================================
PREMIUM LOADER
=========================================*/

window.addEventListener("load", () => {

    const loader = byId("loader");

    if (!loader) return;

    setTimeout(() => {

        loader.style.opacity = "0";
        loader.style.visibility = "hidden";

        setTimeout(() => {

            loader.remove();

        }, 800);

    }, 1500);

});


/*=========================================
MOBILE MENU
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.querySelector(".mobile-menu");
    const menu = document.querySelector(".menu");

    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });


    /* Close mobile menu after clicking link */

    menu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            menu.classList.remove("show");

        });

    });

});


/*=========================================
SCROLL TOP
=========================================*/

const scrollBtn = byId("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    if (window.scrollY > 300) {

        scrollBtn.style.display = "flex";

    } else {

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


/*=========================================
COUNTER ANIMATION
=========================================*/

function animateCounter(element, target, duration = 1000) {

    if (!element) return;

    target = Number(target) || 0;

    if (target <= 0) {

        element.innerText = "0";

        return;

    }

    const startTime = performance.now();

    function update(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) / duration,
                1
            );

        const value =
            Math.floor(progress * target);

        element.innerText =
            value.toLocaleString();

        if (progress < 1) {

            requestAnimationFrame(update);

        }

    }

    requestAnimationFrame(update);

}


/* =========================================
   VISITOR COUNTER
========================================= */

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById("visitorCounter");

    if (!visitorCounter) return;

    // Firebase ready hone ka wait
    if (!window.firebaseReady || !window.db) {

        console.log("⏳ Waiting for Firebase...");

        window.addEventListener(
            "firebaseReady",
            updateVisitorCounter,
            { once: true }
        );

        return;
    }

    try {

        const visitorRef =
            window.db
                .collection("counter")
                .doc("visitors");

        const snapshot =
            await visitorRef.get();

        /* FIRST VISITOR */

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

        /* CHECK CURRENT SESSION */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );

        /* NEW VISITOR */

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    window.firebaseIncrement(1)

            });

            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }

        /* GET UPDATED COUNT */

        const latestSnapshot =
            await visitorRef.get();

        const data =
            latestSnapshot.data() || {};

        const visitors =
            Number(data.count) || 0;

        /* ANIMATE COUNTER */

        let current = 0;

        const animation =
            setInterval(() => {

                current++;

                visitorCounter.innerText =
                    current.toLocaleString();

                if (current >= visitors) {

                    clearInterval(animation);

                }

            }, 25);

    }

    catch (error) {

        console.error(
            "🔥 Visitor Counter Error:",
            error
        );

        visitorCounter.innerText = "0";

    }

}


/*=========================================
LOAD BOOKS.JSON
=========================================*/

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
            byId("bookCounter");


        if (bookCounter) {

            animateCounter(
                bookCounter,
                allBooks.length,
                1200
            );

        }


        displayBooks(
            filteredBooks
        );


        latestBook();


        console.log(
            "✅ Books Loaded:",
            allBooks.length
        );


    } catch (error) {

        console.error(
            "Books Loading Error:",
            error
        );

    }

}


loadBooks();


/*=========================================
DISPLAY BOOKS
=========================================*/

function displayBooks(books) {

    const container =
        byId("booksContainer");


    if (!container) return;


    container.innerHTML = "";


    if (!books || books.length === 0) {

        container.innerHTML = `

            <div class="no-books">

                <h2>
                    No Books Found
                </h2>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    books.forEach((book, index) => {

        const bookId =
            book.id ||
            book.slug ||
            book.title
                ?.toLowerCase()
                .replace(/[^a-z0-9]+/g, "-") ||
            `book-${index}`;


        const views =
            Number(book.views) || 0;

        const likes =
            Number(book.likes) || 0;

        const shares =
            Number(book.shares) || 0;

        const comments =
            Number(book.comments) || 0;

        const downloads =
            Number(book.downloads) || 0;


        container.innerHTML += `

        <article
            class="book-card"
            data-book-id="${escapeHTML(bookId)}"
        >

            <img
                src="${escapeHTML(book.cover || "logo.png")}"
                alt="${escapeHTML(book.title || "Book")}"
                loading="lazy"
            >


            <div class="book-content">

                <span class="book-category">

                    ${escapeHTML(
                        book.category || "Islamic Book"
                    )}

                </span>


                <h2>

                    ${escapeHTML(
                        book.title || "Untitled Book"
                    )}

                </h2>


                <h3>

                    ${escapeHTML(
                        book.author || "Unknown Author"
                    )}

                </h3>


                <p>

                    ${escapeHTML(
                        book.description || ""
                    )}

                </p>


                <!-- BOOK STATS -->

                <div class="book-meta">

                    <span
                        title="Views"
                        class="book-stat"
                    >

                        👁
                        <b data-stat="views">
                            ${views.toLocaleString()}
                        </b>

                    </span>


                    <button
                        type="button"
                        class="book-stat like-btn"
                        data-book="${escapeHTML(bookId)}"
                        title="Like"
                    >

                        ❤️
                        <b data-stat="likes">
                            ${likes.toLocaleString()}
                        </b>

                    </button>


                    <button
                        type="button"
                        class="book-stat share-btn"
                        data-book="${escapeHTML(bookId)}"
                        title="Share"
                    >

                        🔗
                        <b data-stat="shares">
                            ${shares.toLocaleString()}
                        </b>

                    </button>


                    <button
                        type="button"
                        class="book-stat comment-btn"
                        data-book="${escapeHTML(bookId)}"
                        title="Comments"
                    >

                        💬
                        <b data-stat="comments">
                            ${comments.toLocaleString()}
                        </b>

                    </button>


                    <span
                        title="Downloads"
                        class="book-stat"
                    >

                        ⬇
                        <b data-stat="downloads">
                            ${downloads.toLocaleString()}
                        </b>

                    </span>

                </div>


                <!-- BUTTONS -->

                <div class="book-buttons">

                    <a
                        href="reader.html?book=${encodeURIComponent(book.pdf || "")}"
                        class="btn read-book-btn"
                        data-book="${escapeHTML(bookId)}"
                    >

                        📖 Read Online

                    </a>


                    <a
                        href="${escapeHTML(book.pdf || "#")}"
                        download
                        class="btn download-book-btn"
                        data-book="${escapeHTML(bookId)}"
                    >

                        ⬇ Download

                    </a>

                </div>


                <!-- COMMENT AREA -->

                <div
                    class="comment-area"
                    id="comments-${escapeHTML(bookId)}"
                    style="display:none;"
                >

                    <div class="comment-input-row">

                        <input
                            type="text"
                            class="book-comment-input"
                            data-book="${escapeHTML(bookId)}"
                            placeholder="Write a comment..."
                            maxlength="300"
                        >

                        <button
                            type="button"
                            class="btn submit-comment"
                            data-book="${escapeHTML(bookId)}"
                        >

                            Send

                        </button>

                    </div>


                    <div
                        class="comments-list"
                        data-comments="${escapeHTML(bookId)}"
                    ></div>

                </div>

            </div>

        </article>

        `;

    });


    attachBookImageFallbacks();

}


/*=========================================
ESCAPE HTML
=========================================*/

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*=========================================
SEARCH BOOKS
=========================================*/

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

            );

        });


    displayBooks(
        filteredBooks
    );

}


/*=========================================
CATEGORY FILTER
=========================================*/

function filterBooks(category, button = null) {

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


    if (category === "All") {

        filteredBooks =
            [...allBooks];

    } else {

        filteredBooks =
            allBooks.filter(book =>

                String(
                    book.category || ""
                ).toLowerCase()
                ===
                String(category).toLowerCase()

            );

    }


    displayBooks(
        filteredBooks
    );

}


/*=========================================
LATEST BOOK
=========================================*/

function latestBook() {

    const latest =
        allBooks.find(
            book => book.latest === true
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
            ".latest-book .book-buttons a"
        );


    if (image) {

        image.src =
            latest.cover || "logo.png";

        image.alt =
            latest.title || "Latest Book";

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


    if (buttons.length >= 2) {

        buttons[0].href =
            "reader.html?book=" +
            encodeURIComponent(
                latest.pdf || ""
            );


        buttons[1].href =
            latest.pdf || "#";

    }

}


/*=========================================
GET BOOK ID
=========================================*/

function getBookIdFromElement(element) {

    if (!element) return null;

    return (
        element.dataset.book ||
        element.closest(".book-card")
            ?.dataset.bookId ||
        null
    );

}


/*=========================================
FIREBASE BOOK STATS
=========================================*/

function bookStatsRef(bookId) {

    if (!window.db || !bookId) {

        return null;

    }


    return window.db
        .collection("bookStats")
        .doc(String(bookId));

}


/*=========================================
INCREMENT BOOK STAT
=========================================*/

async function incrementBookStat(
    bookId,
    field
) {

    if (!window.db || !bookId) {

        return null;

    }


    try {

        const ref =
            bookStatsRef(bookId);


        await ref.set({

            [field]:
                window.firebaseIncrement(1)

        }, {

            merge: true

        });


        const snapshot =
            await ref.get();


        return (
            Number(
                snapshot.data()?.[field]
            ) || 0
        );


    } catch (error) {

        console.error(
            `❌ ${field} counter error:`,
            error
        );


        return null;

    }

}


/*=========================================
UPDATE CARD STAT
=========================================*/

function updateCardStat(
    bookId,
    field,
    value
) {

    const card =
        document.querySelector(
            `.book-card[data-book-id="${CSS.escape(String(bookId))}"]`
        );


    if (!card) return;


    const stat =
        card.querySelector(
            `[data-stat="${field}"]`
        );


    if (stat) {

        stat.innerText =
            Number(value || 0)
                .toLocaleString();

    }

}


/*=========================================
BOOK VIEW
=========================================*/

async function registerBookView(bookId) {

    if (!bookId) return;

    const viewedKey =
        `chishti-view-${bookId}`;


    /*
    Count once per browser session
    */

    if (
        sessionStorage.getItem(
            viewedKey
        )
    ) {

        return;

    }


    sessionStorage.setItem(
        viewedKey,
        "true"
    );


    const value =
        await incrementBookStat(
            bookId,
            "views"
        );


    if (value !== null) {

        updateCardStat(
            bookId,
            "views",
            value
        );

    }

}


/*=========================================
LIKE BOOK
=========================================*/

async function likeBook(bookId) {

    if (!bookId) return;


    const likeKey =
        `chishti-liked-${bookId}`;


    if (
        localStorage.getItem(
            likeKey
        )
    ) {

        alert(
            "You already liked this book ❤️"
        );

        return;

    }


    const value =
        await incrementBookStat(
            bookId,
            "likes"
        );


    if (value !== null) {

        localStorage.setItem(
            likeKey,
            "true"
        );


        updateCardStat(
            bookId,
            "likes",
            value
        );

    }

}


/*=========================================
SHARE BOOK
=========================================*/

async function shareBook(bookId) {

    if (!bookId) return;


    const card =
        document.querySelector(
            `.book-card[data-book-id="${CSS.escape(String(bookId))}"]`
        );


    const title =
        card?.querySelector("h2")
            ?.innerText ||
        "Chishti Library Book";


    const url =
        window.location.href;


    try {

        if (
            navigator.share
        ) {

            await navigator.share({

                title:
                    title,

                text:
                    `Read "${title}" on Chishti Library`,

                url:
                    url

            });

        } else {

            await navigator.clipboard.writeText(
                url
            );


            alert(
                "Book link copied! 🔗"
            );

        }


        const value =
            await incrementBookStat(
                bookId,
                "shares"
            );


        if (value !== null) {

            updateCardStat(
                bookId,
                "shares",
                value
            );

        }

    } catch (error) {

        /*
        User cancelled native share.
        Do not count as share.
        */

        console.log(
            "Share cancelled."
        );

    }

}


/*=========================================
COMMENTS
=========================================*/

async function addBookComment(
    bookId,
    comment
) {

    if (!window.db || !bookId) {

        return;

    }


    comment =
        String(comment || "")
            .trim();


    if (!comment) {

        return;

    }


    if (comment.length > 300) {

        alert(
            "Comment is too long."
        );

        return;

    }


    try {

        const commentsRef =
            window.db
                .collection("bookComments")
                .doc(String(bookId))
                .collection("comments");


        await commentsRef.add({

            text:
                comment,

            createdAt:
                window.firebaseServerTimestamp(),

            user:

                window.currentFirebaseUser
                    ?.email ||
                "Guest"

        });


        const count =
            await incrementBookStat(
                bookId,
                "comments"
            );


        if (count !== null) {

            updateCardStat(
                bookId,
                "comments",
                count
            );

        }


        loadBookComments(
            bookId
        );


    } catch (error) {

        console.error(
            "Comment error:",
            error
        );


        alert(
            "Comment could not be posted."
        );

    }

}


/*=========================================
LOAD COMMENTS
=========================================*/

async function loadBookComments(
    bookId
) {

    if (!window.db || !bookId) {

        return;

    }


    const list =
        document.querySelector(
            `[data-comments="${CSS.escape(String(bookId))}"]`
        );


    if (!list) return;


    try {

        const snapshot =
            await window.db
                .collection("bookComments")
                .doc(String(bookId))
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(20)
                .get();


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML = `

                <p class="no-comments">
                    No comments yet.
                </p>

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
                "book-comment";


            item.innerHTML = `

                <strong>
                    ${escapeHTML(
                        data.user || "Guest"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        data.text || ""
                    )}
                </p>

            `;


            list.appendChild(
                item
            );

        });


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );

    }

}


/*=========================================
BOOK ACTION EVENTS
=========================================*/

document.addEventListener(
    "click",
    async (event) => {


        /* LIKE */

        const likeButton =
            event.target.closest(
                ".like-btn"
            );


        if (likeButton) {

            event.preventDefault();

            const bookId =
                getBookIdFromElement(
                    likeButton
                );


            await likeBook(
                bookId
            );

            return;

        }


        /* SHARE */

        const shareButton =
            event.target.closest(
                ".share-btn"
            );


        if (shareButton) {

            event.preventDefault();

            const bookId =
                getBookIdFromElement(
                    shareButton
                );


            await shareBook(
                bookId
            );

            return;

        }


        /* COMMENTS OPEN */

        const commentButton =
            event.target.closest(
                ".comment-btn"
            );


        if (commentButton) {

            event.preventDefault();


            const bookId =
                getBookIdFromElement(
                    commentButton
                );


            const area =
                byId(
                    `comments-${bookId}`
                );


            if (area) {

                const isHidden =
                    area.style.display ===
                    "none";


                area.style.display =
                    isHidden
                        ? "block"
                        : "none";


                if (isHidden) {

                    loadBookComments(
                        bookId
                    );

                }

            }

            return;

        }


        /* SUBMIT COMMENT */

        const submitButton =
            event.target.closest(
                ".submit-comment"
            );


        if (submitButton) {

            event.preventDefault();


            const bookId =
                getBookIdFromElement(
                    submitButton
                );


            const input =
                document.querySelector(
                    `.book-comment-input[data-book="${CSS.escape(String(bookId))}"]`
                );


            if (!input) return;


            const text =
                input.value.trim();


            if (!text) return;


            input.value = "";


            await addBookComment(
                bookId,
                text
            );


            return;

        }


        /* READ BOOK */

        const readButton =
            event.target.closest(
                ".read-book-btn"
            );


        if (readButton) {

            const bookId =
                getBookIdFromElement(
                    readButton
                );


            registerBookView(
                bookId
            );

            return;

        }


        /* DOWNLOAD */

        const downloadButton =
            event.target.closest(
                ".download-book-btn"
            );


        if (downloadButton) {

            const bookId =
                getBookIdFromElement(
                    downloadButton
                );


            const value =
                await incrementBookStat(
                    bookId,
                    "downloads"
                );


            if (value !== null) {

                updateCardStat(
                    bookId,
                    "downloads",
                    value
                );

            }

        }

    }
);


/*=========================================
COMMENT ENTER KEY
=========================================*/

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !== "Enter"
        ) {

            return;

        }


        if (
            !event.target.classList.contains(
                "book-comment-input"
            )
        ) {

            return;

        }


        event.preventDefault();


        const bookId =
            event.target.dataset.book;


        const text =
            event.target.value.trim();


        if (!text) return;


        event.target.value = "";


        addBookComment(
            bookId,
            text
        );

    }
);


/*=========================================
BUTTON RIPPLE
=========================================*/

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
            `${event.clientX - rect.left}px`;


        ripple.style.top =
            `${event.clientY - rect.top}px`;


        button.appendChild(
            ripple
        );


        setTimeout(() => {

            ripple.remove();

        }, 600);

    }
);


/*=========================================
NAVBAR SHADOW
=========================================*/

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


/*=========================================
SECTION ANIMATION
=========================================*/

function initSectionAnimation() {

    const sections =
        document.querySelectorAll(
            "section"
        );


    if (
        !("IntersectionObserver" in window)
    ) {

        sections.forEach(section => {

            section.classList.add(
                "show-section"
            );

        });

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
                threshold: 0.08
            }
        );


    sections.forEach(section => {

        observer.observe(
            section
        );

    });

}


document.addEventListener(
    "DOMContentLoaded",
    initSectionAnimation
);


/*=========================================
IMAGE FALLBACK
=========================================*/

function attachBookImageFallbacks() {

    document
        .querySelectorAll(
            ".book-card img"
        )
        .forEach(img => {

            img.onerror =
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

                };

        });

}


document
    .querySelectorAll("img")
    .forEach(img => {

        img.onerror =
            function() {

                if (
                    !this.src.includes(
                        "logo.png"
                    )
                ) {

                    this.src =
                        "logo.png";

                }

            };

    });


/*=========================================
PRELOAD BOOK COVERS
=========================================*/

window.addEventListener(
    "load",
    () => {

        if (
            !Array.isArray(allBooks)
        ) {

            return;

        }


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


/*=========================================
SMOOTH ANCHOR LINKS
=========================================*/

document.addEventListener(
    "click",
    event => {

        const anchor =
            event.target.closest(
                'a[href^="#"]'
            );


        if (!anchor) return;


        const href =
            anchor.getAttribute(
                "href"
            );


        if (
            !href ||
            href === "#"
        ) {

            return;

        }


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


/*=========================================
CONSOLE
=========================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "🚀 Premium Script Loaded"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "✅ Books Counter"
);

console.log(
    "✅ Search"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Views"
);

console.log(
    "✅ Likes"
);

console.log(
    "✅ Shares"
);

console.log(
    "✅ Comments"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Mobile Menu"
);

console.log(
    "✅ Scroll Top"
);

console.log(
    "===================================="
);
