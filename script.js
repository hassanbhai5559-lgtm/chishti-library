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

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    if (!list || list.length === 0) {
        booksContainer.innerHTML = "<p style='color:white;text-align:center'>No Books Found</p>";
        return;
    }

    const template = document.getElementById("bookTemplate");

    list.forEach(book => {

        const card = template.content.cloneNode(true);

        card.querySelector(".cover").src =
            book.cover || "images/no-image.png";

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
            book.reader || "#";

        card.querySelector(".downloadBtn").href =
            book.pdf || "#";

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

        const value = this.value.toLowerCase().trim();

        filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(value) ||
            book.author.toLowerCase().includes(value) ||
            book.category.toLowerCase().includes(value)
        );

        renderBooks(filteredBooks);
    });
}

/* =========================
    CATEGORY FILTER (FIXED)
========================= */

window.filterBooks = function (category, button) {

    // remove active class from all buttons
    document.querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    // add active to clicked button
    if (button) button.classList.add("active");

    if (category === "All") {
        filteredBooks = books;
    } else {
        filteredBooks = books.filter(book =>
            (book.category || "").toLowerCase() === category.toLowerCase()
        );
    }

    renderBooks(filteredBooks);
};

/* =========================
    COUNTER
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
    }, 50);
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
    INIT
========================= */

window.addEventListener("DOMContentLoaded", loadBooks);
