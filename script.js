/*=====================================
        GLOBAL VARIABLES
=====================================*/

let books = [];
let filteredBooks = [];

const booksContainer = document.getElementById("booksContainer");
const searchInput = document.getElementById("searchInput");

/*=====================================
        LOAD BOOKS
=====================================*/

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

/*=====================================
        RENDER BOOKS
=====================================*/

function renderBooks(bookList) {

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    bookList.forEach(book => {

        const template = document.getElementById("bookTemplate");
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

        const latest = card.querySelector(".latest-tag");

        if (latest) {
            latest.style.display = book.latest ? "block" : "none";
        }

        booksContainer.appendChild(card);

    });
}

/*=====================================
        SEARCH SYSTEM
=====================================*/

if (searchInput) {

    searchInput.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        filteredBooks = books.filter(book => {

            return (
                book.title.toLowerCase().includes(keyword) ||
                book.author.toLowerCase().includes(keyword) ||
                book.category.toLowerCase().includes(keyword)
            );

        });

        renderBooks(filteredBooks);

    });
}

/*=====================================
        CATEGORY FILTER FIXED
=====================================*/

function filterBooks(category, button) {

    document.querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    if (button) {
        button.classList.add("active");
    }

    if (category === "All") {
        filteredBooks = [...books];
    } else {
        filteredBooks = books.filter(book =>
            book.category.toLowerCase() === category.toLowerCase()
        );
    }

    renderBooks(filteredBooks);
}

/*=====================================
        BOOK COUNTER
=====================================*/

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

/*=====================================
        LATEST BOOK
=====================================*/

function loadLatestBook() {

    const latest = books.find(book => book.latest);

    if (!latest) return;

    const title = document.querySelector(".latest-book h2");
    const author = document.querySelector(".latest-book h4");

    if (title) title.textContent = latest.title;
    if (author) author.textContent = latest.author;
}

/*=====================================
        SCROLL TOP
=====================================*/

const scrollBtn = document.getElementById("scrollTop");

if (scrollBtn) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 300) {
            scrollBtn.style.display = "block";
        } else {
            scrollBtn.style.display = "none";
        }

    });

    scrollBtn.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });
}

/*=====================================
        INIT
=====================================*/

window.addEventListener("DOMContentLoaded", loadBooks);
