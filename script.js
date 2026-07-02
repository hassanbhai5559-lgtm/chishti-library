let books = [];
let filteredBooks = [];

const container = document.getElementById("booksContainer");
const template = document.getElementById("bookTemplate").content;

fetch("books.json")
    .then(res => res.json())
    .then(data => {
        books = data;
        filteredBooks = data;
        renderBooks(books);
        updateCounter();
    });

function renderBooks(list) {

    container.innerHTML = "";

    list.forEach(book => {

        const card = template.cloneNode(true);

        card.querySelector(".cover").src =
            book.cover || "images/no-image.png";

        card.querySelector(".title").textContent =
            book.title || "No Title";

        card.querySelector(".author").textContent =
            book.author || "";

        card.querySelector(".description").textContent =
            book.description || "";

        card.querySelector(".book-category").textContent =
            book.category || "";

        card.querySelector(".views").textContent =
            book.views ?? 0;

        card.querySelector(".downloads").textContent =
            book.downloads ?? 0;

        card.querySelector(".readBtn").href =
            book.reader || "#";

        card.querySelector(".downloadBtn").href =
            book.pdf || "#";

        const badge = card.querySelector(".latest-tag");

        if (badge) {
            badge.style.display = book.latest ? "block" : "none";
        }

        container.appendChild(card);
    });
}

/* SEARCH */
document.getElementById("searchInput")?.addEventListener("input", function () {

    const value = this.value.toLowerCase();

    filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(value) ||
        book.author.toLowerCase().includes(value) ||
        book.category.toLowerCase().includes(value)
    );

    renderBooks(filteredBooks);
});

/* CATEGORY FIX */
function filterBooks(category) {

    document.querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");

    filteredBooks = category === "All"
        ? books
        : books.filter(b => b.category.toLowerCase() === category.toLowerCase());

    renderBooks(filteredBooks);
}

/* COUNTER */
function updateCounter() {
    const counter = document.getElementById("bookCounter");
    if (!counter) return;

    counter.textContent = books.length;
}
