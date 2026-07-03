/*==================================================
        CHISHTI LIBRARY 2026
        SCRIPT.JS - PART 1
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
const visitorCounter = document.getElementById("visitorCounter");
const downloadCounter = document.getElementById("downloadCounter");

/*==============================
        LOAD BOOKS
==============================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok) {
            throw new Error("books.json not found");
        }

        books = await response.json();

        filteredBooks = [...books];

        renderBooks(filteredBooks);

        updateBookCounter();

        loadLatestBook();

    } catch (error) {

        console.error("Books Load Error:", error);

        if (booksContainer) {

            booksContainer.innerHTML = `
            <div class="error-box">
                <h2>⚠ Books Could Not Load</h2>
                <p>Please check books.json</p>
            </div>
            `;

        }

    }

}

/*==============================
        BOOK COUNTER
==============================*/

function updateBookCounter(){

    if(!bookCounter) return;

    bookCounter.textContent = books.length;

}
/*==============================
        RENDER BOOKS
==============================*/

function renderBooks(list) {

    if (!booksContainer || !bookTemplate) return;

    booksContainer.innerHTML = "";

    if (list.length === 0) {

        booksContainer.innerHTML = `
        <div class="error-box">
            <h2>No Books Found</h2>
        </div>
        `;

        return;
    }

    list.forEach(book => {

        const card = bookTemplate.content.cloneNode(true);

        const cover = card.querySelector(".cover");
        const title = card.querySelector(".title");
        const author = card.querySelector(".author");
        const description = card.querySelector(".description");
        const category = card.querySelector(".book-category");

        const views = card.querySelector(".views");
        const downloads = card.querySelector(".downloads");

        const readBtn = card.querySelector(".readBtn");
        const downloadBtn = card.querySelector(".downloadBtn");

        const latestTag = card.querySelector(".latest-tag");

        if (cover)
            cover.src = book.cover || "logo.png";

        if (title)
            title.textContent = book.title;

        if (author)
            author.textContent = book.author;

        if (description)
            description.textContent = book.description || "";

        if (category)
            category.textContent = book.category || "Book";

        if (views)
            views.textContent = book.views || 0;

        if (downloads)
            downloads.textContent = book.downloads || 0;

        if (readBtn)
            readBtn.href = book.reader || "#";

        if (downloadBtn)
            downloadBtn.href = book.pdf || "#";

        if (latestTag)
            latestTag.style.display = book.latest ? "inline-block" : "none";

        booksContainer.appendChild(card);

    });

}

/*==============================
        LATEST BOOK
==============================*/

function loadLatestBook() {

    const latest = books.find(book => book.latest);

    if (!latest) return;

    const cover = document.getElementById("latestBookCover");
    const title = document.getElementById("latestBookTitle");
    const author = document.getElementById("latestBookAuthor");
    const description = document.getElementById("latestBookDescription");

    if (cover)
        cover.src = latest.cover;

    if (title)
        title.textContent = latest.title;

    if (author)
        author.textContent = latest.author;

    if (description)
        description.textContent = latest.description;

}
/*==============================
        LIVE SEARCH
==============================*/

function searchBooks() {

    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    filteredBooks = books.filter(book => {

        return (
            (book.title || "").toLowerCase().includes(query) ||
            (book.author || "").toLowerCase().includes(query) ||
            (book.category || "").toLowerCase().includes(query)
        );

    });

    renderBooks(filteredBooks);

}

if (searchInput) {

    searchInput.addEventListener("input", searchBooks);

}

/*==============================
        CATEGORY FILTER
==============================*/

function filterBooks(category, button = null) {

    document.querySelectorAll(".category").forEach(btn => {

        btn.classList.remove("active");

    });

    if (button) {

        button.classList.add("active");

    }

    if (category === "All") {

        filteredBooks = [...books];

    } else {

        filteredBooks = books.filter(book =>
            (book.category || "").toLowerCase() === category.toLowerCase()
        );

    }

    renderBooks(filteredBooks);

}

/*==============================
        VISITOR COUNTER
==============================*/

function updateVisitorCounter() {

    if (!visitorCounter) return;

    let visitors = Number(localStorage.getItem("visitorCounter")) || 0;

    visitors++;

    localStorage.setItem("visitorCounter", visitors);

    visitorCounter.textContent = visitors;

}

/*==============================
        DOWNLOAD COUNTER
==============================*/

function updateDownloadCounter() {

    if (!downloadCounter) return;

    let totalDownloads = 0;

    books.forEach(book => {

        totalDownloads += Number(book.downloads || 0);

    });

    downloadCounter.textContent = totalDownloads;

}

/*==============================
        DOWNLOAD BUTTON EVENT
==============================*/

document.addEventListener("click", function(e){

    const btn = e.target.closest(".downloadBtn");

    if(!btn) return;

    let downloads = Number(localStorage.getItem("downloads")) || 0;

    downloads++;

    localStorage.setItem("downloads", downloads);

    if(downloadCounter){

        downloadCounter.textContent = downloads;

    }

});
/*==============================
        AI CHATBOT
==============================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendMessage");
const chatMessages = document.getElementById("chatMessages");

let chatbotData = [];

/*==============================
        LOAD CHATBOT
==============================*/

async function loadChatbot(){

    try{

        const response = await fetch("chatbot.json");

        if(!response.ok) throw new Error("chatbot.json not found");

        chatbotData = await response.json();

    }catch(error){

        console.error("Chatbot Error:",error);

    }

}

/*==============================
        OPEN CHAT
==============================*/

chatBtn?.addEventListener("click",()=>{

    chatWindow.classList.add("active");

});

/*==============================
        CLOSE CHAT
==============================*/

closeChat?.addEventListener("click",()=>{

    chatWindow.classList.remove("active");

});

/*==============================
        SEND MESSAGE
==============================*/

function sendMessage(){

    if(!chatInput) return;

    const text = chatInput.value.trim();

    if(text==="") return;

    chatMessages.innerHTML += `
    <div class="user-message">
        ${text}
    </div>
    `;

    chatInput.value="";

    let reply =
    "Assalamu Alaikum 🌹<br>Welcome to Chishti AI.";

    chatbotData.forEach(item=>{

        if(
            text.toLowerCase().includes(item.keyword.toLowerCase())
        ){

            reply=item.reply;

        }

    });

    setTimeout(()=>{

        chatMessages.innerHTML += `
        <div class="bot-message">
            ${reply}
        </div>
        `;

        chatMessages.scrollTop =
        chatMessages.scrollHeight;

    },600);

}

/*==============================
        EVENTS
==============================*/

sendBtn?.addEventListener("click",sendMessage);

chatInput?.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});
/*==============================
        FALLING STARS
==============================*/

function createStars() {

    const starsContainer = document.getElementById("stars");

    if (!starsContainer) return;

    for (let i = 0; i < 60; i++) {

        const star = document.createElement("span");

        star.classList.add("star");

        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * -100 + "vh";

        star.style.animationDuration = (3 + Math.random() * 5) + "s";
        star.style.opacity = Math.random();

        starsContainer.appendChild(star);
    }

}

/*==============================
        BACK TO TOP
==============================*/

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {

    if (!backToTop) return;

    if (window.scrollY > 400) {
        backToTop.classList.add("show");
    } else {
        backToTop.classList.remove("show");
    }

});

backToTop?.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

/*==============================
        MOBILE MENU
==============================*/

const menuBtn = document.getElementById("menuBtn");
const navbar = document.querySelector(".navbar");

menuBtn?.addEventListener("click", () => {

    navbar.classList.toggle("active");

});

/*==============================
        INIT PROJECT
==============================*/

window.addEventListener("DOMContentLoaded", async () => {

    await loadBooks();
    await loadChatbot();

    updateVisitorCounter();
    updateDownloadCounter();

    createStars();

    console.log("✅ Chishti Library Loaded Successfully 🚀");

});
