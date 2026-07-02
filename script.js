/* =============================
   CHISHTI LIBRARY SCRIPT
============================= */

let books = [];
let filteredBooks = [];

const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");

/* =============================
   LOAD BOOKS
============================= */

async function loadBooks() {
    try {
        const res = await fetch("books.json");
        books = await res.json();

        filteredBooks = [...books];

        renderBooks(filteredBooks);
        updateCounters();
        loadLatestBook();

    } catch (error) {
        console.error("Error loading books:", error);
    }
}

/* =============================
   RENDER BOOKS
============================= */

function renderBooks(bookList) {

    booksContainer.innerHTML = "";

    if (!bookList.length) {
        booksContainer.innerHTML = "<h2 style='color:#fff'>No Books Found</h2>";
        return;
    }

    const template = document.getElementById("bookTemplate");

    bookList.forEach(book => {

        const card = template.content.cloneNode(true);

        // COVER
        card.querySelector(".cover").src =
            book.cover || "images/no-image.png";

        card.querySelector(".cover").alt = book.title;

        // TEXT
        card.querySelector(".title").textContent = book.title;
        card.querySelector(".author").textContent = book.author;
        card.querySelector(".description").textContent = book.description || "";
        card.querySelector(".book-category").textContent = book.category;

        // STATS
        card.querySelector(".views").textContent = book.views || 0;
        card.querySelector(".downloads").textContent = book.downloads || 0;

        // LINKS
        card.querySelector(".readBtn").href = book.reader;
        card.querySelector(".downloadBtn").href = book.pdf;

        // FEATURED TAG
        const latestTag = card.querySelector(".latest-tag");

        if (latestTag) {
            latestTag.style.display = book.latest ? "inline-block" : "none";
        }

        booksContainer.appendChild(card);
    });
}

/* =============================
   SEARCH
============================= */

if (searchInput) {
    searchInput.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(keyword) ||
            book.author.toLowerCase().includes(keyword) ||
            book.category.toLowerCase().includes(keyword)
        );

        renderBooks(filteredBooks);
    });
}

/* =============================
   CATEGORY FILTER
============================= */

function filterBooks(category, btn) {

    document.querySelectorAll(".category")
        .forEach(b => b.classList.remove("active"));

    if (btn) btn.classList.add("active");

    if (category === "All") {
        filteredBooks = [...books];
    } else {
        filteredBooks = books.filter(book =>
            book.category.toLowerCase() === category.toLowerCase()
        );
    }

    renderBooks(filteredBooks);
}

/* =============================
   COUNTERS
============================= */

function updateCounters() {

    const bookCounter = document.getElementById("bookCounter");
    const downloadCounter = document.getElementById("downloadCounter");

    if (bookCounter) bookCounter.textContent = books.length;

    let totalDownloads = books.reduce((sum, b) => sum + (b.downloads || 0), 0);

    if (downloadCounter) downloadCounter.textContent = totalDownloads;
}

/* =============================
   LATEST BOOK
============================= */

function loadLatestBook() {

    const latest = books.find(b => b.latest);

    if (!latest) return;

    const img = document.querySelector(".latest-cover img");
    const title = document.querySelector(".latest-content h2");
    const author = document.querySelector(".latest-content h4");

    if (img) img.src = latest.cover;
    if (title) title.textContent = latest.title;
    if (author) author.textContent = latest.author;
}

/* =============================
   CHAT BOT (SIMPLE FIX)
============================= */

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

if (chatBtn) {
    chatBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("active");
    });
}

if (closeChat) {
    closeChat.addEventListener("click", () => {
        chatWindow.classList.remove("active");
    });
}

/* =============================
   INIT
============================= */

window.addEventListener("DOMContentLoaded", loadBooks);
