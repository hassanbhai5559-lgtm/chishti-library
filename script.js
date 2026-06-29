let knowledge = [];

fetch("knowledge.json")
.then(res => res.json())
.then(data => {
    knowledge = data;
})
.catch(err => console.log(err));
// =========================
// CHISHTI LIBRARY SCRIPT
// PART 1
// =========================

let libraryBooks = [];

document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // LOADER
    // =====================

    window.addEventListener("load", () => {

        document.body.classList.add("loading");

        setTimeout(() => {

            document.body.classList.remove("loading");
            document.body.classList.add("loaded");

            const loader = document.getElementById("loader");
            const website = document.getElementById("website");

            if (loader) loader.style.display = "none";
            if (website) website.style.display = "block";

        }, 2000);

    });

    // =====================
    // THEME SYSTEM
    // =====================

    const themeBtn = document.getElementById("themeBtn");

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

        if (themeBtn) {
            themeBtn.textContent = "☀";
        }
    }

    if (themeBtn) {

        themeBtn.addEventListener("click", () => {

            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {

                localStorage.setItem("theme", "dark");
                themeBtn.textContent = "☀";

            } else {

                localStorage.setItem("theme", "light");
                themeBtn.textContent = "🌙";

            }

        });

    }

    // =====================
    // CHAT OPEN / CLOSE
    // =====================

    const chatButton = document.getElementById("chatButton");
    const chatBox = document.getElementById("chatBox");
    const closeChat = document.getElementById("closeChat");

    if (chatButton && chatBox) {
        chatButton.addEventListener("click", () => {
            chatBox.style.display = "block";
        });
    }

    if (closeChat && chatBox) {
        closeChat.addEventListener("click", () => {
            chatBox.style.display = "none";
        });
    }

    // =====================
    // SEARCH BOOKS
    // =====================

    const searchInput = document.getElementById("searchInput");

    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();

            document.querySelectorAll(".book-card").forEach(card => {

                const text = card.innerText.toLowerCase();

                card.style.display =
                    text.includes(value) ? "block" : "none";

            });

        });

    }

    // =====================
    // SCROLL ANIMATION
    // =====================

    const sections = document.querySelectorAll("section");

    function revealSections() {

        sections.forEach(section => {

            const top = section.getBoundingClientRect().top;

            if (top < window.innerHeight - 100) {
                section.classList.add("show");
            }

        });

    }

    window.addEventListener("scroll", revealSections);
    revealSections();

});
// =========================
// BOOKS LOAD
// =========================

fetch("books.json")
    .then(response => response.json())
    .then(data => {

        libraryBooks = data;

        loadFeaturedBooks(data);
        loadLatestBooks(data);
        loadOfflineBooks();

    })
    .catch(error => {

        console.error("Books.json Error:", error);

    });

// =========================
// FEATURED BOOKS
// =========================

function loadFeaturedBooks(books) {

    const container = document.getElementById("featuredBooks");

    if (!container) return;

    container.innerHTML = "";

    books.slice(0, 6).forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <h3>${book.title}</h3>

            <p>${book.author}</p>

            <a href="${book.reader}" class="btn">
                📖 Read
            </a>

            <a href="${book.pdf}"
               class="btn download-btn"
               onclick="saveOfflineBook('${book.title}','${book.cover}','${book.pdf}')">

                ⬇ Download

            </a>

        </div>

        `;

    });

}

// =========================
// LATEST BOOKS
// =========================

function loadLatestBooks(books) {

    const container = document.getElementById("latestBooks");

    if (!container) return;

    container.innerHTML = "";

    books
        .slice(-6)
        .reverse()
        .forEach(book => {

            container.innerHTML += `

            <div class="book-card">

                <img src="${book.cover}" alt="${book.title}">

                <h3>${book.title}</h3>

                <p>${book.author}</p>

                <a href="${book.reader}" class="btn">

                    📖 Read

                </a>

            </div>

            `;

        });

}

// =========================
// OFFLINE BOOKS
// =========================

function saveOfflineBook(title, cover, pdf) {

    let books =
        JSON.parse(localStorage.getItem("offlineBooks")) || [];

    books.push({

        title,
        cover,
        pdf

    });

    localStorage.setItem(
        "offlineBooks",
        JSON.stringify(books)
    );

}

function loadOfflineBooks() {

    const container =
        document.getElementById("offlineBooks");

    if (!container) return;

    let books =
        JSON.parse(localStorage.getItem("offlineBooks")) || [];

    container.innerHTML = "";

    books.forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <h3>${book.title}</h3>

            <a href="${book.pdf}" class="btn">

                📖 Open

            </a>

        </div>

        `;

    });

}
// =========================
// CHAT SYSTEM
// =========================

const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

// =========================
// ADD USER MESSAGE
// =========================

function addMessage(message, type) {

    if (!chatBody) return;

    const div = document.createElement("div");

    div.className =
        type === "user"
            ? "user-message"
            : "bot-message";

    div.textContent = message;

    chatBody.appendChild(div);

    chatBody.scrollTop = chatBody.scrollHeight;

}

// =========================
// BOT MESSAGE
// =========================

function typeMessage(message) {

    if (!chatBody) return;

    const div = document.createElement("div");

    div.className = "bot-message";

    div.innerHTML = message;

    chatBody.appendChild(div);

    chatBody.scrollTop = chatBody.scrollHeight;

    saveChat();

}

// =========================
// SMART BOOK SEARCH
// =========================

function smartBookSearch(text) {

    text = text.toLowerCase();

    for (const book of libraryBooks) {

        const title = book.title.toLowerCase();

        if (
            text.includes(title) ||
            title.includes(text)
        ) {

            return book;

        }

    }

    return null;

}

// =========================
// BOT REPLY
// =========================
function searchKnowledge(text) {

    text = text.toLowerCase();

    for (const item of knowledge) {

        for (const key of item.keywords) {

            if (text.includes(key.toLowerCase())) {

                return item.answer_en;

            }

        }

    }

    return null;
}
function botReply(text) {

    let answer = searchKnowledge(text);

if (answer) {
    typeMessage(answer);
    return;
}
    const result = smartBookSearch(text);

    if (result) {

        typeMessage(`

<b>📚 ${result.title}</b><br><br>

👤 ${result.author}<br>

🌍 ${result.language || ""}<br>

📂 ${result.category || ""}<br><br>

<a href="${result.reader}" target="_blank">

📖 Read Online

</a><br>

<a href="${result.pdf}" target="_blank">

⬇ Download PDF

</a>

`);

        return;

    }

    let reply = "";

    if (text.toLowerCase().includes("book")) {

        reply = "📚 Please type a book name.";

    }

    else if (text.toLowerCase().includes("author")) {

        reply = "👤 Hazrat Allama Saim Chishti.";

    }

    else if (text.toLowerCase().includes("download")) {

        reply = "⬇ Click the Download button below every book.";

    }

    else if (text.toLowerCase().includes("offline")) {

        reply = "📥 Downloaded books appear in Offline Library.";

    }

    else if (text.toLowerCase().includes("library")) {

        reply = "📖 Welcome to Chishti Library.";

    }

    else if (text.toLowerCase().includes("assalam")) {

        reply = "🤲 Wa Alaikum Assalam wa Rahmatullah.";

    }

    else if (text.toLowerCase().includes("thanks")) {

        reply = "😊 You're Welcome.";

    }

    else {

        reply = "🤖 Please search using a book title.";

    }

    typeMessage(reply);

}
// =========================
// COMMANDS
// =========================

function commands(text) {

    text = text.toLowerCase();

    if (text === "clear") {

        clearChat();
        return true;

    }

    if (text === "offline") {

        window.location.hash = "#offlineBooks";
        return true;

    }

    return false;

}

// =========================
// SEND MESSAGE
// =========================

function sendMessage() {

    if (!aiInput) return;

    const text = aiInput.value.trim();

    if (text === "") return;

    addMessage(text, "user");

    if (!commands(text)) {

        botReply(text);

    }

    aiInput.value = "";

}

if (sendBtn) {

    sendBtn.addEventListener("click", sendMessage);

}

if (aiInput) {

    aiInput.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            sendMessage();

        }

    });

}

// =========================
// CHAT STORAGE
// =========================

function saveChat() {

    if (!chatBody) return;

    localStorage.setItem(
        "chatHistory",
        chatBody.innerHTML
    );

}

function clearChat() {

    if (!chatBody) return;

    chatBody.innerHTML = "";

    localStorage.removeItem("chatHistory");

}

window.addEventListener("load", function () {

    if (!chatBody) return;

    const history = localStorage.getItem("chatHistory");

    if (history) {

        chatBody.innerHTML = history;

    }

});

// =========================
// VOICE SEARCH
// =========================

if ("webkitSpeechRecognition" in window) {

    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    const voiceBtn = document.getElementById("voiceBtn");

    if (voiceBtn) {

        voiceBtn.onclick = () => recognition.start();

    }

    recognition.onresult = function (event) {

        aiInput.value = event.results[0][0].transcript;

        sendMessage();

    };

}

// =========================
// AUTO THEME
// =========================

if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    !localStorage.getItem("theme")
) {

    document.body.classList.add("dark");

}

// =========================
// SMOOTH SCROLL
// =========================

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior: "smooth"

        });

    });

});

// =========================
// REFRESH OFFLINE
// =========================

window.addEventListener("focus", loadOfflineBooks);

// =========================
// LOADER
// =========================

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    const website = document.getElementById("website");

    setTimeout(function () {

        if (loader) {

            loader.style.display = "none";

        }

        if (website) {

            website.style.display = "block";

        }

    }, 2000);

});

// =========================
// READY
// =========================

console.log("✅ Chishti Library Loaded Successfully");
