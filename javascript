// =========================
// CHISHTI LIBRARY - CLEAN SCRIPT
// =========================

document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // LOADER
    // =====================
    window.addEventListener("load", () => {
        setTimeout(() => {
            const loader = document.getElementById("loader");
            const website = document.getElementById("website");
            if (loader && website) {
                loader.style.display = "none";
                website.style.display = "block";
            }
        }, 1500);
    });

    // =====================
    // THEME SYSTEM
    // =====================
    const themeBtn = document.getElementById("themeBtn");

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
        if (themeBtn) themeBtn.innerHTML = "☀";
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {
                localStorage.setItem("theme", "dark");
                themeBtn.innerHTML = "☀";
            } else {
                localStorage.setItem("theme", "light");
                themeBtn.innerHTML = "🌙";
            }
        });
    }

    // =====================
    // CHAT OPEN / CLOSE
    // =====================
    const chatButton = document.getElementById("chatButton");
    const chatBox = document.getElementById("chatBox");
    const closeChat = document.getElementById("closeChat");

    if (chatButton) chatButton.onclick = () => chatBox.style.display = "block";
    if (closeChat) closeChat.onclick = () => chatBox.style.display = "none";

    // =====================
    // SEARCH BOOKS
    // =====================
    const search = document.getElementById("searchInput");

    if (search) {
        search.addEventListener("keyup", () => {
            let value = search.value.toLowerCase();

            document.querySelectorAll(".book-card").forEach(card => {
                let text = card.innerText.toLowerCase();
                card.style.display = text.includes(value) ? "block" : "none";
            });
        });
    }

    // =====================
    // SCROLL ANIMATION
    // =====================
    const sections = document.querySelectorAll("section");

    function reveal() {
        sections.forEach(sec => {
            let top = sec.getBoundingClientRect().top;
            if (top < window.innerHeight - 100) {
                sec.classList.add("show");
            }
        });
    }

    window.addEventListener("scroll", reveal);
    reveal();
});

// =========================
// BOOKS LOAD
// =========================

let libraryBooks = [];

fetch("books.json")
    .then(res => res.json())
    .then(data => {
        libraryBooks = data;
        loadFeaturedBooks(data);
        loadLatestBooks(data);
        loadOfflineBooks();
    });

// =========================
// FEATURED BOOKS
// =========================

function loadFeaturedBooks(books) {
    const container = document.getElementById("featuredBooks");
    if (!container) return;

    let html = "";

    books.slice(0, 6).forEach(book => {
        html += `
        <div class="book-card">
            <img src="${book.cover}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>

            <a href="${book.reader}" class="btn">📖 Read</a>

            <a href="${book.pdf}" class="btn download-btn"
               onclick="saveOfflineBook('${book.title}','${book.cover}','${book.pdf}')">
               ⬇ Download
            </a>
        </div>`;
    });

    container.innerHTML = html;
}

// =========================
// LATEST BOOKS
// =========================

function loadLatestBooks(books) {
    const container = document.getElementById("latestBooks");
    if (!container) return;

    let html = "";

    books.slice(-6).reverse().forEach(book => {
        html += `
        <div class="book-card">
            <img src="${book.cover}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <a href="${book.reader}" class="btn">📖 Read</a>
        </div>`;
    });

    container.innerHTML = html;
}

// =========================
// OFFLINE LIBRARY
// =========================

function saveOfflineBook(title, cover, pdf) {
    let books = JSON.parse(localStorage.getItem("offlineBooks")) || [];

    books.push({ title, cover, pdf });

    localStorage.setItem("offlineBooks", JSON.stringify(books));
}

function loadOfflineBooks() {
    const container = document.getElementById("offlineBooks");
    if (!container) return;

    let books = JSON.parse(localStorage.getItem("offlineBooks")) || [];

    let html = "";

    books.forEach(book => {
        html += `
        <div class="book-card">
            <img src="${book.cover}">
            <h3>${book.title}</h3>
            <a href="${book.pdf}" class="btn">📖 Open</a>
        </div>`;
    });

    container.innerHTML = html;
}

// =========================
// CHAT SYSTEM
// =========================

const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

// safe message add
function addMessage(message, type) {
    if (!chatBody) return;

    const div = document.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.textContent = message; // SAFE (no HTML injection)

    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
}

// typing effect
function typeMessage(message) {
    if (!chatBody) return;

    const div = document.createElement("div");
    div.className = "bot-message";
    chatBody.appendChild(div);

    let i = 0;
    let timer = setInterval(() => {
        div.innerHTML += message.charAt(i);
        chatBody.scrollTop = chatBody.scrollHeight;
        i++;

        if (i >= message.length) {
            clearInterval(timer);
            saveChat();
        }
    }, 15);
}

// =========================
// SMART BOOK SEARCH
// =========================

function smartBookSearch(text) {
    text = text.toLowerCase();

    for (let book of libraryBooks) {
        let title = book.title.toLowerCase();

        if (text.includes(title) || title.includes(text)) {
            return book;
        }
    }
    return null;
}

// =========================
// BOT REPLY (FIXED SINGLE VERSION)
// =========================

function botReply(text) {
    let result = smartBookSearch(text);

    if (result) {
        typeMessage(
            `📚 ${result.title}<br><br>
             👤 ${result.author}<br>
             🌍 ${result.language}<br>
             📂 ${result.category}<br><br>
             <a href="${result.reader}" target="_blank">📖 Read Online</a><br>
             <a href="${result.pdf}" target="_blank">⬇ Download PDF</a>`
        );
        return;
    }

    let msg = "";

    if (text.includes("book")) msg = "📚 Ask me a book name.";
    else if (text.includes("author")) msg = "👤 Author: Hazrat Allama Saim Chishti.";
    else if (text.includes("download")) msg = "⬇ Use download button under books.";
    else if (text.includes("offline")) msg = "📥 Offline books are saved automatically.";
    else if (text.includes("library")) msg = "📖 Chishti Library is a digital Islamic library.";
    else if (text.includes("assalam")) msg = "🤲 Wa Alaikum Assalam.";
    else if (text.includes("thanks")) msg = "😊 You're welcome.";
    else msg = "🤖 Try asking about a book title.";

    typeMessage(msg);
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
// SEND MESSAGE (FIXED ONLY ONCE)
// =========================

function sendMessage() {
    if (!aiInput) return;

    let text = aiInput.value.trim();
    if (text === "") return;

    addMessage(text, "user");

    if (commands(text)) {
        aiInput.value = "";
        return;
    }

    botReply(text);
    aiInput.value = "";
}

if (sendBtn) sendBtn.addEventListener("click", sendMessage);

if (aiInput) {
    aiInput.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });
}

// =========================
// CHAT STORAGE
// =========================

function saveChat() {
    if (chatBody) {
        localStorage.setItem("chatHistory", chatBody.innerHTML);
    }
}

function clearChat() {
    if (chatBody) {
        chatBody.innerHTML = "";
        localStorage.removeItem("chatHistory");
    }
}

// load chat
window.addEventListener("load", () => {
    const history = localStorage.getItem("chatHistory");
    if (history && chatBody) {
        chatBody.innerHTML = history;
    }
});

// =========================
// VOICE SEARCH
// =========================

if ("webkitSpeechRecognition" in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

    const mic = document.getElementById("voiceBtn");

    if (mic) {
        mic.onclick = () => recognition.start();
    }

    recognition.onresult = (event) => {
        aiInput.value = event.results[0][0].transcript;
        sendMessage();
    };
}

// =========================
// AUTO THEME
// =========================

if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    document.body.classList.add("dark");
}

// =========================
// SMOOTH SCROLL
// =========================

document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.onclick = e => {
        e.preventDefault();
        document.querySelector(link.getAttribute("href"))
            ?.scrollIntoView({ behavior: "smooth" });
    };
});

// =========================
// REFRESH OFFLINE ON FOCUS
// =========================

window.addEventListener("focus", loadOfflineBooks);

// =========================
// READY
// =========================

console.log("🤖 Chishti Library Clean AI Ready");
