/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
COMPLETE VERSION
Foundation + Visitor + Books + AI + Premium
=========================================*/


/*=========================================
PART 1
PREMIUM LOADER
=========================================*/

window.addEventListener("load", () => {

    const loader =
        document.getElementById("loader");

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


/*=========================================
MOBILE MENU
=========================================*/

const menuBtn =
    document.querySelector(".mobile-menu");

const menu =
    document.querySelector(".menu");

if (menuBtn && menu) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}


/*=========================================
SCROLL TO TOP
=========================================*/

const scrollBtn =
    document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (!scrollBtn) return;

    scrollBtn.style.display =
        window.scrollY > 300
            ? "block"
            : "none";

});

if (scrollBtn) {

    scrollBtn.onclick = () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    };

}


/*=========================================
VISITOR COUNTER
FIREBASE FIRESTORE
=========================================*/

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById(
            "visitorCounter"
        );

    if (!visitorCounter) return;


    /*=====================================
    CHECK FIREBASE
    =====================================*/

    if (
        typeof firebase === "undefined" ||
        typeof firebase.firestore !== "function"
    ) {

        console.error(
            "❌ Firebase Firestore is not loaded."
        );

        visitorCounter.innerText = "0";

        return;

    }


    try {

        /*=================================
        FIRESTORE DATABASE
        =================================*/

        const db =
            firebase.firestore();


        /*=================================
        VISITOR DOCUMENT
        =================================*/

        const visitorRef =
            db
                .collection("counter")
                .doc("visitors");


        /*=================================
        GET CURRENT DOCUMENT
        =================================*/

        const snapshot =
            await visitorRef.get();


        /*=================================
        CREATE DOCUMENT IF MISSING
        =================================*/

        if (!snapshot.exists) {

            await visitorRef.set({

                count: 1

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            animateVisitorCount(
                visitorCounter,
                1
            );


            console.log(
                "✅ Visitor counter created: 1"
            );


            return;

        }


        /*=================================
        CHECK CURRENT SESSION
        =================================*/

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /*=================================
        NEW VISITOR
        =================================*/

        if (!alreadyCounted) {

            await visitorRef.update({

                count:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );

        }


        /*=================================
        GET FINAL COUNT
        =================================*/

        const latestSnapshot =
            await visitorRef.get();


        const visitorData =
            latestSnapshot.data() || {};


        const visitors =
            Number(
                visitorData.count
            ) || 0;


        /*=================================
        DISPLAY COUNT
        =================================*/

        animateVisitorCount(
            visitorCounter,
            visitors
        );


        console.log(
            "✅ Total Visitors:",
            visitors
        );

    }

    catch (error) {

        console.error(
            "❌ Visitor counter error:",
            error
        );


        visitorCounter.innerText = "0";

    }

}


/*=========================================
VISITOR NUMBER ANIMATION
=========================================*/

function animateVisitorCount(
    element,
    target
) {

    if (!element) return;


    target =
        Number(target) || 0;


    /*=====================================
    ZERO
    =====================================*/

    if (target <= 0) {

        element.innerText = "0";

        return;

    }


    const duration = 900;

    const startTime =
        performance.now();


    function updateCounter(currentTime) {

        const progress =
            Math.min(

                (currentTime - startTime) /
                duration,

                1

            );


        /*=============================
        SMOOTH EASING
        =============================*/

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
                updateCounter
            );

        }

        else {

            element.innerText =
                target.toLocaleString();

        }

    }


    requestAnimationFrame(
        updateCounter
    );

}


/*=========================================
START VISITOR COUNTER
=========================================*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateVisitorCounter();

    }
);


/*=========================================
GLOBAL VARIABLES
=========================================*/

let allBooks = [];

let filteredBooks = [];



        /*=================================
        LATEST BOOK
        =================================*/

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
            "❌ Books Error:",
            err
        );

    }

}


loadBooks();


/*=========================================
UTILITY
=========================================*/

function byId(id) {

    return document.getElementById(id);

}


console.log(
    "✅ Script Part 1 Loaded"
);


/*=========================================
PART 2
DISPLAY BOOKS
=========================================*/

function displayBooks(books) {

    const container =
        document.getElementById(
            "booksContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    /*=====================================
    NO BOOKS
    =====================================*/

    if (books.length === 0) {

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


    /*=====================================
    BOOK CARDS
    =====================================*/

    books.forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img
                src="${book.cover}"
                alt="${book.title}"
                loading="lazy"
            >


            <div class="book-content">

                <span class="book-category">

                    ${book.category}

                </span>


                <h2>

                    ${book.title}

                </h2>


                <h3>

                    ${book.author}

                </h3>


                <p>

                    ${book.description}

                </p>


                <div class="book-meta">

                    <span>

                        👁 ${book.views || 0}

                    </span>


                    <span>

                        ❤️ ${book.likes || 0}

                    </span>


                    <span>

                        ⬇ ${book.downloads || 0}

                    </span>

                </div>


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

}


/*=========================================
LIVE SEARCH
=========================================*/

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
        allBooks.filter(book =>

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


    displayBooks(
        filteredBooks
    );

}


/*=========================================
CATEGORY FILTER
=========================================*/

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


    if (category === "All") {

        filteredBooks =
            [...allBooks];

    }

    else {

        filteredBooks =
            allBooks.filter(book =>

                book.category ===
                category

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


    if (image) {

        image.src =
            latest.cover;

    }


    if (title) {

        title.innerText =
            latest.title;

    }


    if (author) {

        author.innerText =
            latest.author;

    }


    if (desc) {

        desc.innerText =
            latest.description;

    }


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
    "✅ Script Part 2 Loaded"
);


/*=========================================
PART 3
AI CHATBOT
=========================================*/

let knowledge = [];


/*=========================================
LOAD KNOWLEDGE
=========================================*/

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
            "❌ Knowledge Error:",
            err
        );

    }

}


loadKnowledge();


/*=========================================
CHAT ELEMENTS
=========================================*/

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


/*=========================================
OPEN CHAT
=========================================*/

if (chatBtn) {

    chatBtn.onclick = () => {

        if (chatWindow) {

            chatWindow.style.display =
                "flex";

        }

    };

}


/*=========================================
CLOSE CHAT
=========================================*/

if (closeChat) {

    closeChat.onclick = () => {

        if (chatWindow) {

            chatWindow.style.display =
                "none";

        }

    };

}


/*=========================================
ENTER KEY
=========================================*/

if (chatInput) {

    chatInput.addEventListener(
        "keypress",
        (e) => {

            if (e.key === "Enter") {

                sendMessage();

            }

        }
    );

}


/*=========================================
SEARCH BOOK
=========================================*/

function searchBook(question) {

    const q =
        question.toLowerCase();


    for (const book of allBooks) {

        if (

            (book.title || "")
                .toLowerCase()
                .includes(q)

            ||

            (book.category || "")
                .toLowerCase()
                .includes(q)

        ) {

            return `

📚 <b>
${book.title}
</b>

<br>

👤 ${book.author}

<br>

📂 ${book.category}

<br><br>


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


/*=========================================
SEARCH KNOWLEDGE
=========================================*/

function searchKnowledge(question) {

    const q =
        question.toLowerCase();


    for (const item of knowledge) {

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


/*=========================================
BOT MESSAGE
=========================================*/

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


/*=========================================
USER MESSAGE
=========================================*/

function userReply(text) {

    if (!chatMessages) return;


    chatMessages.innerHTML += `

    <div class="user-message">

        ${text}

    </div>

    `;


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/*=========================================
SEND MESSAGE
=========================================*/

function sendMessage() {

    if (!chatInput) return;


    const question =
        chatInput.value.trim();


    if (question === "") return;


    userReply(
        question
    );


    chatInput.value = "";


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

            <br><br>

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
    "✅ Script Part 3 Loaded"
);


/*=========================================
PART 4
FINAL PREMIUM
=========================================*/


/*=========================================
SCROLL ANIMATION
=========================================*/

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


/*=========================================
BOOK CARD HOVER
=========================================*/

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


/*=========================================
DOWNLOAD COUNTER
LOCAL
=========================================*/

document.addEventListener(
    "click",
    (e) => {

        const btn =
            e.target.closest("a");


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


/*=========================================
READ COUNTER
LOCAL
=========================================*/

document.addEventListener(
    "click",
    (e) => {

        const btn =
            e.target.closest("a");


        if (!btn) return;


        if (

            btn.href.includes(".pdf")

            &&

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


/*=========================================
BUTTON RIPPLE
=========================================*/

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


        ripple.style.left =
            e.offsetX + "px";


        ripple.style.top =
            e.offsetY + "px";


        btn.appendChild(
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

        }

        else {

            nav.classList.remove(
                "nav-shadow"
            );

        }

    }
);


/*=========================================
AUTO YEAR
=========================================*/

const year =
    document.getElementById(
        "year"
    );


if (year) {

    year.innerText =
        new Date().getFullYear();

}


/*=========================================
IMAGE FALLBACK
=========================================*/

document
    .querySelectorAll("img")
    .forEach(img => {

        img.onerror =
            function () {

                this.src =
                    "logo.png";

            };

    });


/*=========================================
PRELOAD BOOK COVERS
=========================================*/

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


/*=========================================
SMOOTH ANCHOR LINKS
=========================================*/

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(anchor => {

        anchor.addEventListener(
            "click",
            function (e) {

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


/*=========================================
FINAL CONSOLE
=========================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY"
);

console.log(
    "Version : 1.0"
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
    "✅ AI"
);

console.log(
    "✅ Reader"
);

console.log(
    "✅ Downloads"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "✅ Responsive"
);

console.log(
    "🚀 Production Ready"
);
