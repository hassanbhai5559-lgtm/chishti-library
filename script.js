/* =========================
    GLOBAL VARIABLES
========================= */

let books = [];
let filteredBooks = [];

const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");

/* =========================
    LOAD BOOKS
========================= */

async function loadBooks() {
    try {
        const res = await fetch("books.json");
        books = await res.json();

        filteredBooks = books;

        renderBooks(filteredBooks);
        updateBookCounter();
        loadLatestBook();

    } catch (error) {
        console.error("Books load error:", error);
    }
}

/* =========================
    RENDER BOOKS
========================= */

function renderBooks(list) {

    booksContainer.innerHTML = "";

    if (!list || list.length === 0) {
        booksContainer.innerHTML = "<p style='color:white'>No Books Found</p>";
        return;
    }

    const template = document.getElementById("bookTemplate");

    list.forEach(book => {

        const card = template.content.cloneNode(true);

        card.querySelector(".cover").src =
            book.cover || "no-image.png";

        card.querySelector(".cover").alt =
            book.title;

        card.querySelector(".title").textContent =
            book.title;

        card.querySelector(".author").textContent =
            book.author;

        card.querySelector(".description").textContent =
            book.description || "";

        card.querySelector(".book-category").textContent =
            book.category;

        card.querySelector(".views").textContent =
            book.views || 0;

        card.querySelector(".downloads").textContent =
            book.downloads || 0;

        card.querySelector(".readBtn").href =
            book.reader;

        card.querySelector(".downloadBtn").href =
            book.pdf;

        const latestTag = card.querySelector(".latest-tag");

        if (latestTag) {
            latestTag.style.display = book.latest ? "block" : "none";
        }

        booksContainer.appendChild(card);
    });
}

/* =========================
    SEARCH
========================= */

if (searchInput) {
    searchInput.addEventListener("input", function () {

        const value = this.value.toLowerCase();

        filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(value) ||
            book.author.toLowerCase().includes(value) ||
            book.category.toLowerCase().includes(value)
        );

        renderBooks(filteredBooks);
    });
}

/* =========================
    FILTER BOOKS
========================= */

function filterBooks(category, button) {

    document.querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    if (button) button.classList.add("active");

    if (category === "All") {
        filteredBooks = books;
    } else {
        filteredBooks = books.filter(book =>
            book.category.toLowerCase() === category.toLowerCase()
        );
    }

    renderBooks(filteredBooks);
}

/* =========================
    BOOK COUNTER
========================= */

function updateBookCounter() {

    const counter = document.getElementById("bookCounter");
    if (!counter) return;

    let count = 0;

    const interval = setInterval(() => {
        count++;
        counter.textContent = count;

        if (count >= books.length) {
            clearInterval(interval);
        }
    }, 100);
}

/* =========================
    LATEST BOOK
========================= */

function loadLatestBook() {

    const latest = books.find(b => b.latest);
    if (!latest) return;

    console.log("Latest Book:", latest.title);
}

/* =========================
    AI CHAT BUTTON (BASIC)
========================= */

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

if (chatBtn && chatWindow) {
    chatBtn.addEventListener("click", () => {
        chatWindow.classList.toggle("active");
    });
}

if (closeChat) {
    closeChat.addEventListener("click", () => {
        chatWindow.classList.remove("active");
    });
}

/* =========================
    INIT
========================= */

window.addEventListener("DOMContentLoaded", loadBooks);
