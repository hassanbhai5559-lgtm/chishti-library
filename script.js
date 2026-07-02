/*================================================== CHISHTI LIBRARY - MASTER SCRIPT ==================================================*/
"use strict";

/*--- 1. SELECTORS & VARIABLES ---*/
const loader = document.getElementById("loader");
const navbar = document.querySelector(".navbar");
const mobileMenu = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");
const themeBtn = document.querySelector(".theme-btn");
const scrollTopBtn = document.getElementById("scrollTop");
const body = document.body;

let books = [];
let filteredBooks = [];
let chatbotData = [];
let knowledgeData = [];

/*--- 2. UI & LOADER ---*/
window.addEventListener("load", () => {
    setTimeout(() => {
        if(loader) {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            loader.style.pointerEvents = "none";
        }
    }, 1800);
});

/*--- 3. NAVBAR & SCROLL ---*/
window.addEventListener("scroll", () => {
    // Navbar Shadow
    if (navbar) {
        if (window.scrollY > 80) {
            navbar.style.background = "rgba(8,8,8,.92)";
            navbar.style.backdropFilter = "blur(20px)";
            navbar.style.boxShadow = "0 12px 30px rgba(0,0,0,.25)";
        } else {
            navbar.style.background = "rgba(8,8,8,.55)";
            navbar.style.boxShadow = "none";
        }
    }

    // Scroll Top
    if (scrollTopBtn) {
        scrollTopBtn.style.display = (window.scrollY > 500) ? "flex" : "none";
    }
});

// Mobile Menu
mobileMenu?.addEventListener("click", () => {
    menu.classList.toggle("show-menu");
    mobileMenu.classList.toggle("active");
});

// Theme Toggle
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    body.classList.add("light-theme");
    if(themeBtn) themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
}

themeBtn?.addEventListener("click", () => {
    body.classList.toggle("light-theme");
    if (body.classList.contains("light-theme")) {
        localStorage.setItem("theme", "light");
        themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem("theme", "dark");
        themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

/*--- 4. BOOK SYSTEM ---*/
const booksContainer = document.getElementById("booksContainer");
const bookTemplate = document.getElementById("bookTemplate");
const searchInput = document.getElementById("searchInput");
const noBooks = document.getElementById("noBooks");

async function loadBooks() {
    try {
        const response = await fetch("books.json");
        books = await response.json();
        filteredBooks = [...books];
        renderBooks(filteredBooks);
        updateBookCounter();
        loadLatestBook();
    } catch (error) {
        console.error("Books load error:", error);
    }
}
loadBooks();

function renderBooks(bookArray) {
    if (!booksContainer || !bookTemplate) return;
    booksContainer.innerHTML = "";
    if (bookArray.length === 0) {
        if(noBooks) noBooks.style.display = "block";
        return;
    }
    if(noBooks) noBooks.style.display = "none";
    
    bookArray.forEach(book => {
        const card = bookTemplate.content.cloneNode(true);
        card.querySelector(".cover").src = book.cover || "images/no-image.png";
        card.querySelector(".title").textContent = book.title;
        card.querySelector(".author").textContent = book.author;
        card.querySelector(".book-category").textContent = book.category;
        card.querySelector(".readBtn").href = book.reader;
        card.querySelector(".downloadBtn").href = book.pdf;
        booksContainer.appendChild(card);
    });
}

// Search Logic
searchInput?.addEventListener("input", function() {
    const keyword = this.value.toLowerCase().trim();
    filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(keyword) || 
        b.author.toLowerCase().includes(keyword)
    );
    renderBooks(filteredBooks);
});

/*--- 5. CHATBOT & AI ---*/
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");
const typing = document.getElementById("typing");

async function loadAI() {
    try {
        const chat = await fetch("chatbot.json");
        chatbotData = await chat.json();
        const knowledge = await fetch("knowledge.json");
        knowledgeData = await knowledge.json();
    } catch (e) {
        console.error("AI load error");
    }
}
loadAI();

function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    
    // Add User Message
    createMessage(text, "user");
    userInput.value = "";
    
    if(typing) typing.style.display = "block";
    
    setTimeout(() => {
        if(typing) typing.style.display = "none";
        const reply = findBestReply(text);
        createMessage(reply, "bot");
    }, 800);
}

function findBestReply(question) {
    const q = question.toLowerCase();
    
    // AI Logic
    const match = [...chatbotData, ...knowledgeData].find(item => 
        q.includes(item.question.toLowerCase())
    );
    if (match) return match.answer;
    
    // Books Logic
    const book = books.find(b => 
        q.includes(b.title.toLowerCase()) || 
        q.includes(b.author.toLowerCase())
    );
    if (book) return `📚 ${book.title} by ${book.author}. Check the books section.`;
    
    return "Sorry, please ask about books or library.";
}

function createMessage(text, type) {
    const div = document.createElement("div");
    div.className = type === "user" ? "user-message" : "bot-message";
    div.innerHTML = `<div class="message">${text}</div>`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/*--- 6. UTILS ---*/
function updateBookCounter() {
    const counter = document.getElementById("bookCounter");
    if(counter) counter.textContent = books.length;
}

function updateVisitorCounter() {
    const counter = document.getElementById("visitorCounter");
    if (!counter) return;
    let visitors = Number(localStorage.getItem("visitors")) || 1250;
    visitors++;
    localStorage.setItem("visitors", visitors);
    counter.textContent = visitors.toLocaleString();
}
updateVisitorCounter();
