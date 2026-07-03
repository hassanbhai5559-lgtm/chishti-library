/*==================================================
        CHISHTI LIBRARY 2026
        FINAL SCRIPT.JS (FULL CLEAN VERSION)
==================================================*/

/*==============================
        GLOBAL DATA
==============================*/

let books = [];
let filteredBooks = [];

/*==============================
        ELEMENTS
==============================*/

const booksContainer = document.getElementById("booksContainer");
const bookTemplate = document.getElementById("bookTemplate");

const searchInput = document.getElementById("searchInput");
const bookCounter = document.getElementById("bookCounter");

/*==============================
        LOAD BOOKS
==============================*/

async function loadBooks() {

try {

const res = await fetch("./books.json");

if (!res.ok) throw new Error("JSON not found");

books = await res.json();

filteredBooks = [...books];

renderBooks(filteredBooks);

updateCounter();

loadLatest();

} catch (err) {

console.log("Books Load Error:", err);

if (booksContainer) {

booksContainer.innerHTML = `
<h2 style="color:red;text-align:center">
Books load nahi ho rahi (check books.json path)
</h2>
`;

}

}

}

/*==============================
        RENDER BOOKS
==============================*/

function renderBooks(list) {

if (!booksContainer || !bookTemplate) return;

booksContainer.innerHTML = "";

list.forEach(book => {

const card = bookTemplate.content.cloneNode(true);

card.querySelector(".cover").src = book.cover || "no-image.png";
card.querySelector(".title").textContent = book.title;
card.querySelector(".author").textContent = book.author;
card.querySelector(".description").textContent = book.description || "";
card.querySelector(".book-category").textContent = book.category;

card.querySelector(".views").textContent = book.views || 0;
card.querySelector(".downloads").textContent = book.downloads || 0;

card.querySelector(".readBtn").href = book.reader || "#";
card.querySelector(".downloadBtn").href = book.pdf || "#";

const tag = card.querySelector(".latest-tag");
if (tag) tag.style.display = book.latest ? "inline-block" : "none";

booksContainer.appendChild(card);

});

}

/*==============================
        SEARCH
==============================*/

if (searchInput) {

searchInput.addEventListener("input", (e) => {

const val = e.target.value.toLowerCase();

filteredBooks = books.filter(b =>
b.title.toLowerCase().includes(val) ||
b.author.toLowerCase().includes(val) ||
b.category.toLowerCase().includes(val)
);

renderBooks(filteredBooks);

});

}

/*==============================
        CATEGORY FILTER
==============================*/

function filterBooks(category, btn = null) {

document.querySelectorAll(".category")
.forEach(b => b.classList.remove("active"));

if (btn) btn.classList.add("active");

if (category === "All") {

filteredBooks = [...books];

} else {

filteredBooks = books.filter(b =>
b.category.toLowerCase() === category.toLowerCase()
);

}

renderBooks(filteredBooks);

}

/*==============================
        COUNTER
==============================*/

function updateCounter() {

if (!bookCounter) return;

let i = 0;

const total = books.length;

const timer = setInterval(() => {

i++;
bookCounter.textContent = i;

if (i >= total) clearInterval(timer);

}, 50);

}

/*==============================
        LATEST BOOK
==============================*/

function loadLatest() {

const latest = books.find(b => b.latest);

if (!latest) return;

const title = document.getElementById("latestBookTitle");
const author = document.getElementById("latestBookAuthor");
const desc = document.getElementById("latestBookDescription");
const cover = document.getElementById("latestBookCover");

if (title) title.textContent = latest.title;
if (author) author.textContent = latest.author;
if (desc) desc.textContent = latest.description;
if (cover) cover.src = latest.cover;

}

/*==============================
        CHATBOT
==============================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

chatBtn?.addEventListener("click", () => {
chatWindow.style.display = "flex";
});

closeChat?.addEventListener("click", () => {
chatWindow.style.display = "none";
});

function sendMessage() {

if (!chatInput) return;

const text = chatInput.value.trim();

if (!text) return;

chatMessages.innerHTML += `
<div class="user-message"><div>${text}</div></div>
`;

chatInput.value = "";

setTimeout(() => {

chatMessages.innerHTML += `
<div class="bot-message">
<div>
Assalamu Alaikum 👋<br>
Main Chishti AI hoon.<br>
Demo mode active hai.
</div>
</div>
`;

chatMessages.scrollTop = chatMessages.scrollHeight;

}, 500);

}

document.addEventListener("click", (e) => {

if (e.target.closest("#sendMessage")) {
sendMessage();
}

});

chatInput?.addEventListener("keypress", (e) => {
if (e.key === "Enter") sendMessage();
});

/*==============================
        INIT
==============================*/

window.addEventListener("load", () => {
loadBooks();
console.log("Chishti Library Ready 🚀");
});
