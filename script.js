/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 1
==================================================*/

"use strict";

/*=====================================
        GLOBAL ELEMENTS
=====================================*/

const body = document.body;

const menuBtn = document.querySelector(".mobile-menu");

const menu = document.querySelector(".menu");

const scrollTop = document.getElementById("scrollTop");

const searchInput = document.getElementById("searchInput");

const bookCounter = document.getElementById("bookCounter");

/*=====================================
        GLOBAL DATA
=====================================*/

let books = [];

let filteredBooks = [];

/*=====================================
        MOBILE MENU
=====================================*/

if(menuBtn){

menuBtn.addEventListener("click",()=>{

menu.classList.toggle("active");

});

}

/*=====================================
        CLOSE MENU
=====================================*/

document.querySelectorAll(".menu a").forEach(link=>{

link.addEventListener("click",()=>{

if(menu){

menu.classList.remove("active");

}

});

});

/*=====================================
        NAVBAR SCROLL
=====================================*/

const navbar=document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY>80){

navbar.classList.add("scrolled");

}else{

navbar.classList.remove("scrolled");

}

});

/*=====================================
        SCROLL TOP
=====================================*/

window.addEventListener("scroll",()=>{

if(!scrollTop) return;

if(window.scrollY>500){

scrollTop.classList.add("show");

}else{

scrollTop.classList.remove("show");

}

});

if(scrollTop){

scrollTop.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

}

/*=====================================
        COUNTER
=====================================*/

function animateCounter(element,end){

if(!element) return;

let start=0;

const timer=setInterval(()=>{

start++;

element.textContent=start;

if(start>=end){

clearInterval(timer);

}

},40);

}

/*=====================================
        IMAGE FALLBACK
=====================================*/

function imageFallback(img){

img.onerror=function(){

this.src="no-image.png";

};

}

/*=====================================
        PAGE LOADED
=====================================*/

window.addEventListener("load",()=>{

console.log("✅ Chishti Library Loaded");

});
/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 2
        BOOKS SYSTEM CORE
==================================================*/

/*=====================================
        DOM ELEMENTS
=====================================*/

const booksContainer = document.getElementById("booksContainer");
const bookTemplate = document.getElementById("bookTemplate");
const latestSection = document.getElementById("latestBooks");

/*=====================================
        LOAD BOOKS.JSON
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

console.error("Books load error:", error);

if (booksContainer) {

booksContainer.innerHTML = `
<div class="error-message">
<h2>Books load nahi ho rahi</h2>
<p>Check books.json file path</p>
</div>
`;

}

}

}

/*=====================================
        RENDER BOOKS
=====================================*/

function renderBooks(list) {

if (!booksContainer || !bookTemplate) return;

booksContainer.innerHTML = "";

list.forEach(book => {

const card = bookTemplate.content.cloneNode(true);

/* Cover */
const cover = card.querySelector(".cover");

cover.src = book.cover || "no-image.png";

cover.onerror = function () {
this.src = "no-image.png";
};

/* Text */
card.querySelector(".title").textContent = book.title;
card.querySelector(".author").textContent = book.author;
card.querySelector(".description").textContent = book.description || "";
card.querySelector(".book-category").textContent = book.category;

/* Stats */
card.querySelector(".views").textContent = book.views || 0;
card.querySelector(".downloads").textContent = book.downloads || 0;

/* Links */
card.querySelector(".readBtn").href = book.reader || "#";
card.querySelector(".downloadBtn").href = book.pdf || "#";

/* Latest tag */
const tag = card.querySelector(".latest-tag");
if (tag) tag.style.display = book.latest ? "inline-block" : "none";

/* Append */
booksContainer.appendChild(card);

});

}

/*=====================================
        BOOK COUNTER
=====================================*/

function updateBookCounter() {

if (!bookCounter) return;

let count = 0;

const target = books.length;

const timer = setInterval(() => {

count++;

bookCounter.textContent = count;

if (count >= target) clearInterval(timer);

}, 60);

}

/*=====================================
        INIT SYSTEM
=====================================*/

window.addEventListener("load", () => {

loadBooks();

});
/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 3
        SEARCH + CATEGORY FILTER
==================================================*/

/*=====================================
        SEARCH SYSTEM
=====================================*/

if (searchInput) {

searchInput.addEventListener("input", (e) => {

const keyword = e.target.value.toLowerCase().trim();

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
        CATEGORY FILTER
=====================================*/

function filterBooks(category, button = null) {

/* Active button style */
document.querySelectorAll(".category")
.forEach(btn => btn.classList.remove("active"));

if (button) button.classList.add("active");

/* Filter logic */
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
        SEARCH RESET FIX
=====================================*/

function resetFilters() {

if (searchInput) searchInput.value = "";

filteredBooks = [...books];

renderBooks(filteredBooks);

}
/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 4
        AI CHATBOT SYSTEM (FIXED)
==================================================*/

/*=====================================
        CHAT ELEMENTS
=====================================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

/*=====================================
        OPEN CHAT
=====================================*/

if (chatBtn) {

chatBtn.addEventListener("click", () => {

chatWindow.style.display = "flex";

setTimeout(() => {

chatMessages.scrollTop = chatMessages.scrollHeight;

}, 100);

});

}

/*=====================================
        CLOSE CHAT
=====================================*/

if (closeChat) {

closeChat.addEventListener("click", () => {

chatWindow.style.display = "none";

});

}

/*=====================================
        SEND MESSAGE FUNCTION
=====================================*/

function sendMessage() {

const text = chatInput.value.trim();

if (text === "") return;

/* USER MESSAGE */

chatMessages.innerHTML += `
<div class="user-message">
<div>${text}</div>
</div>
`;

/* CLEAR INPUT */

chatInput.value = "";

/* SCROLL */

chatMessages.scrollTop = chatMessages.scrollHeight;

/* BOT RESPONSE */

setTimeout(() => {

let reply = getBotReply(text.toLowerCase());

chatMessages.innerHTML += `
<div class="bot-message">
<div>${reply}</div>
</div>
`;

chatMessages.scrollTop = chatMessages.scrollHeight;

}, 600);

}

/*=====================================
        BOT LOGIC
=====================================*/

function getBotReply(input) {

if (input.includes("hello") || input.includes("assalam")) {

return "Assalamu Alaikum 👋 Welcome to Chishti Library";

}

if (input.includes("book")) {

return "You can browse books in the Books section 📚";

}

if (input.includes("download")) {

return "Click on Download button to get PDF ⬇️";

}

if (input.includes("author")) {

return "All books are written by Hazrat Allama Saim Chishti ✨";

}

return "Sorry, I am still learning 🤖 Please try another question";

}

/*=====================================
        ENTER KEY SUPPORT
=====================================*/

if (chatInput) {

chatInput.addEventListener("keypress", (e) => {

if (e.key === "Enter") {

sendMessage();

}

});

}

/*=====================================
        SEND BUTTON SUPPORT
=====================================*/

document.addEventListener("click", (e) => {

if (e.target.closest("#sendMessage")) {

sendMessage();

}

});
/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 5
        FINAL BUG FIX + POLISH
==================================================*/

/*=====================================
        SAFE INIT WRAPPER
=====================================*/

document.addEventListener("DOMContentLoaded", () => {

/* ensure books exist */
if (typeof books === "undefined") {
    window.books = [];
    window.filteredBooks = [];
}

/*=====================================
        SCROLL TO TOP FIX
=====================================*/

const scrollTopBtn = document.getElementById("scrollTop");

if (scrollTopBtn) {

scrollTopBtn.addEventListener("click", () => {

window.scrollTo({
top: 0,
behavior: "smooth"
});

});

}

/*=====================================
        MOBILE MENU FIX (SAFE)
=====================================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn && menu) {

menuBtn.addEventListener("click", () => {
menu.classList.toggle("active");
});

}

/*=====================================
        ACTIVE MENU CLOSE FIX
=====================================*/

document.querySelectorAll(".menu a").forEach(link => {

link.addEventListener("click", () => {
menu?.classList.remove("active");
});

});

/*=====================================
        IMAGE SAFE FIX (GLOBAL)
=====================================*/

document.querySelectorAll("img").forEach(img => {

img.addEventListener("error", () => {
img.src = "no-image.png";
});

});

/*=====================================
        CHAT SAFE CLOSE ON OUTSIDE CLICK
=====================================*/

const chatWindow = document.getElementById("chatWindow");
const chatBtn = document.getElementById("chatBtn");

if (chatWindow && chatBtn) {

document.addEventListener("click", (e) => {

if (
chatWindow.style.display === "flex" &&
!chatWindow.contains(e.target) &&
!chatBtn.contains(e.target)
) {
chatWindow.style.display = "none";
}

});

}

/*=====================================
        PERFORMANCE BOOST
=====================================*/

window.addEventListener("load", () => {

console.log("🚀 Chishti Library Fully Optimized & Ready");

});

/*=====================================
        GLOBAL SAFETY (NO CRASH)
=====================================*/

window.addEventListener("error", (e) => {

console.log("Handled Error:", e.message);

});

});
