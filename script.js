let books = [];
let filteredBooks = [];

const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");

/* ==============================
        LOAD BOOKS
============================== */

async function loadBooks() {
    try {
        const res = await fetch("books.json");
        books = await res.json();

        filteredBooks = [...books];

        renderBooks(filteredBooks);
        updateBookCounter();
        loadLatestBook();

    } catch (error) {
        console.log("Error loading books:", error);
    }
}

loadBooks();

/* ==============================
        RENDER BOOKS
============================== */

function renderBooks(list) {

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    list.forEach(book => {

        const card = document
            .getElementById("bookTemplate")
            .content
            .cloneNode(true);

        // IMAGE FIX
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

        const latestTag =
            card.querySelector(".latest-tag");

        if (latestTag) {
            latestTag.style.display = book.latest ? "block" : "none";
        }

        booksContainer.appendChild(card);

    });

}

/* ==============================
        SEARCH
============================== */

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

/* ==============================
        CATEGORY FILTER (FIXED)
============================== */

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

/* ==============================
        COUNTER
============================== */

function updateBookCounter() {

    const counter = document.getElementById("bookCounter");

    if (!counter) return;

    counter.textContent = books.length;
}

/* ==============================
        LATEST BOOK
============================== */

function loadLatestBook() {

    const latest = books.find(b => b.latest);

    if (!latest) return;

    console.log("Latest Book:", latest.title);
}

/* ==============================
        FIX BUTTON CLICK ISSUE
============================== */

window.filterBooks = filterBooks;
window.onload = () => {
    document.getElementById("loader").style.display = "none";
}
