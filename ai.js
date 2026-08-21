"use strict";

/* =========================================================
   CHISHTI AI
   Firebase Book Search + Book Open Commands
========================================================= */


/* =========================================================
   DOM
========================================================= */

const chatContainer =
    document.getElementById("chatContainer");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const typingIndicator =
    document.getElementById("typingIndicator");

const newChatButton =
    document.getElementById("newChatButton");

const loginStatus =
    document.getElementById("loginStatus");


/* =========================================================
   FIREBASE
========================================================= */

let firestore = null;
let firebaseAuth = null;


/* =========================================================
   INITIALIZE FIREBASE SERVICES
========================================================= */

function initializeFirebaseServices() {

    try {

        if (
            typeof firebase !== "undefined"
        ) {

            if (
                firebase.apps &&
                firebase.apps.length
            ) {

                firestore =
                    window.db ||
                    firebase.firestore();

                firebaseAuth =
                    window.auth ||
                    firebase.auth();

                console.log(
                    "✅ Chishti AI Firebase connected"
                );

                return true;
            }
        }

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );
    }

    console.warn(
        "⚠ Firebase is not available."
    );

    return false;
}


initializeFirebaseServices();


/* =========================================================
   CURRENT USER
========================================================= */

let currentUser = null;


if (firebaseAuth) {

    firebaseAuth.onAuthStateChanged(
        function (user) {

            currentUser =
                user || null;

            updateLoginStatus(user);

        }
    );

}


function updateLoginStatus(user) {

    if (!loginStatus) {
        return;
    }

    if (user) {

        const name =
            user.displayName ||
            user.email ||
            "User";

        loginStatus.innerHTML = `

            <i class="fas fa-user-check"></i>

            <span>
                ${escapeHTML(name)}
            </span>

        `;

    } else {

        loginStatus.innerHTML = `

            <i class="fas fa-user"></i>

            <span>
                Guest
            </span>

        `;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   ADD MESSAGE
========================================================= */

function addMessage(
    text,
    type = "ai",
    html = false
) {

    if (!chatContainer) {
        return;
    }


    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }


    const message =
        document.createElement("div");

    message.className =
        `chat-message ${type}`;


    const avatar =
        document.createElement("div");

    avatar.className =
        "chat-avatar";


    avatar.innerHTML =
        type === "user"

            ? '<i class="fas fa-user"></i>'

            : '<i class="fas fa-robot"></i>';


    const bubble =
        document.createElement("div");

    bubble.className =
        "message-bubble";


    if (html) {

        bubble.innerHTML =
            text;

    } else {

        bubble.textContent =
            text;

    }


    message.appendChild(
        avatar
    );

    message.appendChild(
        bubble
    );


    chatContainer.appendChild(
        message
    );


    scrollChat();


    return message;
}


/* =========================================================
   SCROLL
========================================================= */

function scrollChat() {

    requestAnimationFrame(
        function () {

            window.scrollTo(
                {
                    top:
                        document.body.scrollHeight,

                    behavior:
                        "smooth"
                }
            );

        }
    );

}


/* =========================================================
   TYPING
========================================================= */

function showTyping() {

    if (typingIndicator) {

        typingIndicator.hidden =
            false;

    }

}


function hideTyping() {

    if (typingIndicator) {

        typingIndicator.hidden =
            true;

    }

}


/* =========================================================
   DELAY
========================================================= */

function delay(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );

}


/* =========================================================
   NORMALIZE BOOK
========================================================= */

function normalizeBook(
    doc
) {

    const data =
        doc.data() || {};


    return {

        id:
            doc.id,

        ...data

    };

}


/* =========================================================
   BOOK TITLE
========================================================= */

function getBookTitle(book) {

    return (

        book.title ||

        book.name ||

        book.bookName ||

        book.bookTitle ||

        book.displayName ||

        book.filename ||

        book.fileName ||

        book.pdfName ||

        "Untitled Book"

    );

}


/* =========================================================
   BOOK PDF / PATH
========================================================= */

function getBookPath(book) {

    return (

        book.pdfUrl ||

        book.pdfURL ||

        book.pdf ||

        book.fileUrl ||

        book.fileURL ||

        book.url ||

        book.path ||

        book.file ||

        book.downloadURL ||

        book.downloadUrl ||

        ""

    );

}


/* =========================================================
   FIREBASE BOOK SEARCH
========================================================= */

async function searchBooks(
    searchTerm
) {

    if (!firestore) {

        throw new Error(
            "Firebase Firestore is not connected."
        );

    }


    const term =
        searchTerm
            .trim()
            .toLowerCase();


    if (!term) {
        return [];
    }


    const results = [];


    /*
     * First get books collection.
     *
     * This intentionally avoids requiring
     * a special Firestore index.
     */

    const snapshot =
        await firestore
            .collection("books")
            .limit(200)
            .get();


    snapshot.forEach(
        function (doc) {

            const book =
                normalizeBook(doc);


            const title =
                getBookTitle(book);


            const author =
                book.author ||
                book.writer ||
                book.authorName ||
                "";


            const category =
                book.category ||
                book.subject ||
                "";


            const searchable =
                [
                    title,
                    author,
                    category,
                    book.description || ""
                ]
                .join(" ")
                .toLowerCase();


            if (
                searchable.includes(term)
            ) {

                results.push(book);

            }

        }
    );


    /*
     * Best title matches first.
     */

    results.sort(
        function (a, b) {

            const aTitle =
                getBookTitle(a)
                    .toLowerCase();

            const bTitle =
                getBookTitle(b)
                    .toLowerCase();


            const aStarts =
                aTitle.startsWith(term)
                    ? 1
                    : 0;

            const bStarts =
                bTitle.startsWith(term)
                    ? 1
                    : 0;


            return bStarts - aStarts;

        }
    );


    return results.slice(
        0,
        10
    );

}


/* =========================================================
   BUILD BOOK RESULT HTML
========================================================= */

function buildBookResults(
    books
) {

    if (!books.length) {

        return `
            <div class="book-results">

                <div class="book-card">

                    <div class="book-card-icon">
                        <i class="fas fa-book"></i>
                    </div>

                    <div class="book-card-info">

                        <div class="book-card-title">
                            No matching books found
                        </div>

                        <div class="book-card-meta">
                            Try another title, author or keyword.
                        </div>

                    </div>

                </div>

            </div>
        `;

    }


    const cards =
        books.map(
            function (book) {

                const title =
                    getBookTitle(book);

                const author =
                    book.author ||
                    book.writer ||
                    book.authorName ||
                    "";


                return `

                    <div
                        class="book-card"
                        data-book-id="${escapeHTML(book.id)}"
                    >

                        <div class="book-card-icon">

                            <i class="fas fa-book"></i>

                        </div>


                        <div class="book-card-info">

                            <div class="book-card-title">

                                ${escapeHTML(title)}

                            </div>

                            ${
                                author
                                    ? `
                                    <div class="book-card-meta">
                                        ${escapeHTML(author)}
                                    </div>
                                    `
                                    : ""
                            }

                        </div>


                        <button
                            class="open-book-button"
                            type="button"
                            data-open-book-id="${escapeHTML(book.id)}"
                        >

                            <i class="fas fa-book-open"></i>

                            Open

                        </button>

                    </div>

                `;

            }
        )
        .join("");


    return `

        <div class="book-results">

            ${cards}

        </div>

    `;

}


/* =========================================================
   OPEN BOOK
========================================================= */

function openBook(
    book
) {

    const path =
        getBookPath(book);


    if (!path) {

        addMessage(
            "I found the book, but this book does not have a PDF/path saved in Firebase.",
            "ai"
        );

        console.warn(
            "Book has no PDF path:",
            book
        );

        return;

    }


    let readerURL;


    try {

        /*
         * Relative PDF path:
         *
         * reader.html?book=...
         */

        readerURL =
            new URL(
                "./reader.html",
                window.location.href
            );


        readerURL.searchParams.set(
            "book",
            path
        );


        /*
         * Optional title
         */

        const title =
            getBookTitle(book);


        readerURL.searchParams.set(
            "title",
            title
        );


        /*
         * Preserve current page if available.
         */

        readerURL.searchParams.set(
            "page",
            "1"
        );


        window.location.href =
            readerURL.href;


    } catch (error) {

        console.error(
            "Book open error:",
            error
        );

        addMessage(
            "I couldn't open this book. Please check its PDF path.",
            "ai"
        );

    }

}


/* =========================================================
   COMMAND PARSER
========================================================= */

function parseCommand(
    message
) {

    const text =
        message
            .trim()
            .replace(/\s+/g, " ");


    const lower =
        text.toLowerCase();


    /*
     * HELP
     */

    if (
        lower === "help" ||
        lower === "/help" ||
        lower.includes("what can you do")
    ) {

        return {
            command: "help"
        };

    }


    /*
     * BOOKMARKS
     */

    if (
        lower === "my bookmarks" ||
        lower === "bookmarks" ||
        lower === "my bookmark"
    ) {

        return {
            command: "bookmarks"
        };

    }


    /*
     * OPEN PAGE
     *
     * open page 25
     * go to page 25
     */

    const pageMatch =
        lower.match(
            /^(?:open|go to|goto)\s+page\s+(\d+)$/i
        );


    if (pageMatch) {

        return {

            command:
                "page",

            page:
                Number(
                    pageMatch[1]
                )

        };

    }


    /*
     * OPEN BOOK
     *
     * open book shahnameh
     * open shahnameh
     * read shahnameh
     */

    let openMatch =
        text.match(
            /^(?:open|read|start)\s+book\s+(.+)$/i
        );


    if (!openMatch) {

        openMatch =
            text.match(
                /^(?:open|read|start)\s+(.+)$/i
            );

    }


    if (openMatch) {

        return {

            command:
                "open",

            query:
                openMatch[1].trim()

        };

    }


    /*
     * SEARCH
     *
     * search yusuf
     * find yusuf
     */

    const searchMatch =
        text.match(
            /^(?:search|find|look for)\s+(.+)$/i
        );


    if (searchMatch) {

        return {

            command:
                "search",

            query:
                searchMatch[1].trim()

        };

    }


    /*
     * DEFAULT
     *
     * Treat unknown message as book search
     * if it looks like a title.
     */

    return {

        command:
            "search",

        query:
            text

    };

}


/* =========================================================
   HELP RESPONSE
========================================================= */

function showHelp() {

    addMessage(
        `
        <strong>Chishti AI Commands</strong>

        <br><br>

        📖 <strong>Open a book</strong><br>
        <code>open book Shahnameh</code>

        <br><br>

        🔎 <strong>Search books</strong><br>
        <code>search Yusuf</code>

        <br><br>

        📚 <strong>Find a book</strong><br>
        <code>find Seerat</code>

        <br><br>

        📄 <strong>Open a page</strong><br>
        <code>open page 25</code>

        <br><br>

        🔖 <strong>Bookmarks</strong><br>
        <code>my bookmarks</code>

        <br><br>

        You can also simply type a book name and I will search the Chishti Library.
        `,
        "ai",
        true
    );

}


/* =========================================================
   BOOKMARK RESPONSE
========================================================= */

function showBookmarks() {

    const bookmarks = [];


    /*
     * Local bookmark format used by
     * the reader system:
     *
     * chishti_bookmark_BOOK_PATH
     */

    for (
        let i = 0;
        i < localStorage.length;
        i++
    ) {

        const key =
            localStorage.key(i);


        if (
            key &&
            key.startsWith(
                "chishti_bookmark_"
            )
        ) {

            bookmarks.push({

                key,

                page:
                    localStorage.getItem(
                        key
                    )

            });

        }

    }


    if (!bookmarks.length) {

        addMessage(
            "🔖 You don't have any saved bookmarks yet.",
            "ai"
        );

        return;

    }


    const html =
        bookmarks
            .map(
                function (item) {

                    const bookPath =
                        item.key.replace(
                            "chishti_bookmark_",
                            ""
                        );


                    const readerURL =
                        new URL(
                            "./reader.html",
                            window.location.href
                        );


                    readerURL.searchParams.set(
                        "book",
                        bookPath
                    );


                    readerURL.searchParams.set(
                        "page",
                        item.page
                    );


                    return `

                        <div class="book-card">

                            <div class="book-card-icon">
                                <i class="fas fa-bookmark"></i>
                            </div>

                            <div class="book-card-info">

                                <div class="book-card-title">
                                    Saved Page
                                </div>

                                <div class="book-card-meta">
                                    Page ${escapeHTML(item.page)}
                                </div>

                            </div>

                            <button
                                class="open-book-button"
                                type="button"
                                onclick="window.location.href='${escapeHTML(readerURL.href)}'"
                            >
                                Open
                            </button>

                        </div>

                    `;

                }
            )
            .join("");


    addMessage(
        `
        <strong>Your Bookmarks</strong>

        <div class="book-results">
            ${html}
        </div>
        `,
        "ai",
        true
    );

}


/* =========================================================
   SEARCH COMMAND
========================================================= */

async function executeSearch(
    query
) {

    showTyping();

    await delay(350);


    try {

        const books =
            await searchBooks(query);


        hideTyping();


        if (!books.length) {

            addMessage(
                `I couldn't find a book matching "${query}". Try another title or author.`,
                "ai"
            );

            return;

        }


        addMessage(
            `
            I found ${books.length}
            ${books.length === 1 ? "book" : "books"}
            matching <strong>${escapeHTML(query)}</strong>:
            ${buildBookResults(books)}
            `,
            "ai",
            true
        );


    } catch (error) {

        hideTyping();

        console.error(
            "Book search error:",
            error
        );


        addMessage(
            "I couldn't search the library right now. Please make sure Firebase Firestore is connected.",
            "ai"
        );

    }

}


/* =========================================================
   OPEN COMMAND
========================================================= */

async function executeOpen(
    query
) {

    showTyping();

    await delay(350);


    try {

        const books =
            await searchBooks(query);


        hideTyping();


        if (!books.length) {

            addMessage(
                `I couldn't find "${query}" in Chishti Library.`,
                "ai"
            );

            return;

        }


        /*
         * Exact / strongest result
         */

        const exact =
            books.find(
                function (book) {

                    return getBookTitle(book)
                        .toLowerCase()
                        === query.toLowerCase();

                }
            );


        if (exact) {

            addMessage(
                `
                📖 Opening
                <strong>${escapeHTML(getBookTitle(exact))}</strong>...
                `,
                "ai",
                true
            );


            await delay(500);

            openBook(exact);

            return;

        }


        /*
         * Multiple results:
         * show buttons instead of guessing.
         */

        addMessage(
            `
            I found these books for
            <strong>${escapeHTML(query)}</strong>.
            Choose the one you want to open:

            ${buildBookResults(books)}
            `,
            "ai",
            true
        );


    } catch (error) {

        hideTyping();

        console.error(
            "Open book error:",
            error
        );


        addMessage(
            "I couldn't open the book because the Firebase book search failed.",
            "ai"
        );

    }

}


/* =========================================================
   PAGE COMMAND
========================================================= */

function executePage(
    page
) {

    const currentURL =
        new URL(
            window.location.href
        );


    /*
     * This command is mainly useful
     * when already inside the reader.
     */

    if (
        window.location.pathname
            .toLowerCase()
            .includes("reader")
    ) {

        currentURL.searchParams.set(
            "page",
            String(page)
        );


        window.location.href =
            currentURL.href;

        return;

    }


    addMessage(
        `📄 Page ${page} command is ready. Open a book first, then use <strong>open page ${page}</strong>.`,
        "ai",
        true
    );

}


/* =========================================================
   PROCESS MESSAGE
========================================================= */

async function processMessage(
    message
) {

    const command =
        parseCommand(message);


    switch (
        command.command
    ) {

        case "help":

            showHelp();

            break;


        case "bookmarks":

            showBookmarks();

            break;


        case "search":

            await executeSearch(
                command.query
            );

            break;


        case "open":

            await executeOpen(
                command.query
            );

            break;


        case "page":

            executePage(
                command.page
            );

            break;


        default:

            addMessage(
                "I didn't understand that command. Type `help` to see what I can do.",
                "ai"
            );

    }

}


/* =========================================================
   SEND MESSAGE
========================================================= */

async function sendMessage() {

    if (!messageInput) {
        return;
    }


    const message =
        messageInput.value.trim();


    if (!message) {
        return;
    }


    addMessage(
        message,
        "user"
    );


    messageInput.value = "";

    autoResizeInput();


    if (sendButton) {

        sendButton.disabled =
            true;

    }


    try {

        await processMessage(
            message
        );

    } finally {

        if (sendButton) {

            sendButton.disabled =
                false;

        }

    }

}


/* =========================================================
   SEND BUTTON
========================================================= */

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


/* =========================================================
   ENTER KEY
========================================================= */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );


    messageInput.addEventListener(
        "input",
        autoResizeInput
    );

}


/* =========================================================
   AUTO RESIZE
========================================================= */

function autoResizeInput() {

    if (!messageInput) {
        return;
    }


    messageInput.style.height =
        "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";

}


/* =========================================================
   COMMAND CARDS
========================================================= */

document.querySelectorAll(
    ".command-card"
).forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                const command =
                    button.dataset.command || "";


                if (!messageInput) {
                    return;
                }


                messageInput.value =
                    command;


                messageInput.focus();

                autoResizeInput();

            }
        );

    }
);


/* =========================================================
   OPEN BOOK BUTTONS
========================================================= */

document.addEventListener(
    "click",
    async function (event) {

        const button =
            event.target.closest(
                "[data-open-book-id]"
            );


        if (!button) {
            return;
        }


        const bookID =
            button.dataset.openBookId;


        if (!bookID || !firestore) {
            return;
        }


        try {

            button.disabled =
                true;

            button.innerHTML =
                '<i class="fas fa-spinner fa-spin"></i>';


            const doc =
                await firestore
                    .collection("books")
                    .doc(bookID)
                    .get();


            if (!doc.exists) {

                throw new Error(
                    "Book no longer exists."
                );

            }


            openBook(
                normalizeBook(doc)
            );


        } catch (error) {

            console.error(
                "Open button error:",
                error
            );


            button.disabled =
                false;

            button.innerHTML =
                '<i class="fas fa-book-open"></i> Open';


            addMessage(
                "Sorry, this book could not be opened.",
                "ai"
            );

        }

    }
);


/* =========================================================
   NEW CHAT
========================================================= */

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        function () {

            if (chatContainer) {

                chatContainer.innerHTML =
                    "";

            }


            if (welcomeScreen) {

                welcomeScreen.style.display =
                    "";

            }


            if (messageInput) {

                messageInput.value =
                    "";

                autoResizeInput();

                messageInput.focus();

            }

        }
    );

}


/* =========================================================
   WELCOME MESSAGE
========================================================= */

console.log(
    "======================================"
);

console.log(
    "🤖 CHISHTI AI"
);

console.log(
    "📚 Firebase Book Search: Ready"
);

console.log(
    "📖 Book Open Command: Ready"
);

console.log(
    "🔖 Bookmark Command: Ready"
);

console.log(
    "======================================"
);
