/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 1A
   Core + Loader + Navbar + Theme
========================================== */

"use strict";

/* ========= GLOBAL APP ========= */

const App = {
    books: [],
    knowledge: {},
    offlineBooks: JSON.parse(localStorage.getItem("offlineBooks")) || [],
    views: JSON.parse(localStorage.getItem("bookViews")) || {},
    likes: JSON.parse(localStorage.getItem("bookLikes")) || {},
    comments: JSON.parse(localStorage.getItem("bookComments")) || {}
};

/* ========= SELECTORS ========= */

const $ = (element) => document.querySelector(element);
const $$ = (element) => document.querySelectorAll(element);

/* ========= LOADER ========= */

const loadingMessages = [

    "Preparing Library...",
    "Loading Books...",
    "Initializing Chishti AI...",
    "Loading Author...",
    "Welcome..."

];

function startLoader(){

    const loader = $("#loader");

    if(!loader) return;

    const loadingText = $("#loadingText");
    const progress = $("#progressFill");

    let value = 0;
    let index = 0;

    const timer = setInterval(()=>{

        value++;

        if(progress){

            progress.style.width = value + "%";

        }

        if(value % 20 === 0){

            if(loadingText){

                loadingText.innerHTML = loadingMessages[index];

            }

            index++;

            if(index >= loadingMessages.length){

                index = loadingMessages.length-1;

            }

        }

        if(value >= 100){

            clearInterval(timer);

            loader.classList.add("hide-loader");

            setTimeout(()=>{

                loader.remove();

            },700);

        }

    },35);

}

/* ========= NAVBAR ========= */

function navbarEffect(){

    const navbar = $("#navbar");

    if(!navbar) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 80){

            navbar.classList.add("navbar-scroll");

        }

        else{

            navbar.classList.remove("navbar-scroll");

        }

    });

}

/* ========= MOBILE MENU ========= */

function mobileMenu(){

    const menu = $("#menuBtn");
    const nav = $("#navLinks");

    if(!menu || !nav) return;

    menu.onclick = ()=>{

        nav.classList.toggle("showMenu");

    }

}

/* ========= SCROLL TO TOP ========= */

function scrollTopButton(){

    const topBtn = $("#topBtn");

    if(!topBtn) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY > 500){

            topBtn.classList.add("showTop");

        }

        else{

            topBtn.classList.remove("showTop");

        }

    });

    topBtn.onclick=()=>{

        window.scrollTo({

            top:0,
            behavior:"smooth"

        });

    }

}

/* ========= COUNTER ========= */

function animateCounter(counter){

    const target = Number(counter.dataset.target);

    let current = 0;

    const speed = target/120;

    const update = ()=>{

        current += speed;

        if(current < target){

            counter.innerHTML = Math.floor(current);

            requestAnimationFrame(update);

        }

        else{

            counter.innerHTML = target;

        }

    }

    update();

}

function startCounters(){

    const counters = $$(".counter");

    counters.forEach(counter=>{

        animateCounter(counter);

    });

}

/* ========= INIT ========= */

document.addEventListener("DOMContentLoaded",()=>{

    startLoader();

    navbarEffect();

    mobileMenu();

    scrollTopButton();

    startCounters();

});
/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 1B
   Books Loader + Search + Filters + Render
========================================== */

/* ========= LOAD BOOKS ========= */

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        App.books = await response.json();

        renderBooks(App.books);

        updateBookCounter();

    } catch (error) {

        console.error("Books Loading Error:", error);

    }

}

/* ========= BOOK COUNTER ========= */

function updateBookCounter() {

    const counter = document.getElementById("bookCounter");

    if (counter) {

        counter.innerHTML = App.books.length;

    }

}

/* ========= RENDER BOOKS ========= */

function renderBooks(data) {

    const grid = document.getElementById("booksGrid");

    if (!grid) return;

    grid.innerHTML = "";

    data.forEach(book => {

        const card = document.createElement("div");

        card.className = "book-card";

        card.innerHTML = `

        <div class="book-image">

            <img loading="lazy"

            src="${book.cover}"

            alt="${book.title}">

        </div>

        <div class="book-content">

            <span class="category">

                ${book.category}

            </span>

            <h2>${book.title}</h2>

            <p class="author">

                ${book.author}

            </p>

            <p class="description">

                ${book.description}

            </p>

            <div class="book-buttons">

                <a href="${book.reader}"

                class="read-btn">

                📖 Read Online

                </a>

                <a href="${book.pdf}"

                download

                class="download-btn">

                ⬇ Download PDF

                </a>

                <button

                class="offline-btn"

                onclick="downloadOffline(${book.id})">

                💾 Offline

                </button>

            </div>

            <div class="book-stats">

                <span>👁 ${book.views || 0}</span>

                <span>❤️ ${book.likes || 0}</span>

                <span>💬 ${book.comments || 0}</span>

            </div>

        </div>

        `;

        grid.appendChild(card);

    });

}

/* ========= SEARCH ========= */

function liveSearch() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    input.addEventListener("input", function () {

        const keyword = this.value.toLowerCase();

        const filtered = App.books.filter(book => {

            return (

                book.title.toLowerCase().includes(keyword) ||

                book.author.toLowerCase().includes(keyword) ||

                book.category.toLowerCase().includes(keyword)

            );

        });

        renderBooks(filtered);

    });

}

/* ========= FILTERS ========= */

function filterBooks(type) {

    if (type === "popular") {

        renderBooks(

            [...App.books].sort(

                (a, b) =>

                (b.views || 0) -

                (a.views || 0)

            )

        );

    }

    else if (type === "latest") {

        renderBooks(

            [...App.books].sort(

                (a, b) =>

                (b.year || 0) -

                (a.year || 0)

            )

        );

    }

    else if (type === "old") {

        renderBooks(

            [...App.books].sort(

                (a, b) =>

                (a.year || 0) -

                (b.year || 0)

            )

        );

    }

    else {

        renderBooks(App.books);

    }

}

/* ========= OFFLINE ========= */

function downloadOffline(id) {

    if (!App.offlineBooks.includes(id)) {

        App.offlineBooks.push(id);

        localStorage.setItem(

            "offlineBooks",

            JSON.stringify(App.offlineBooks)

        );

        alert("Book saved in Offline Library.");

    }

    else {

        alert("Book already exists.");

    }

}

/* ========= START ========= */

document.addEventListener("DOMContentLoaded", () => {

    loadBooks();

    liveSearch();

});
/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 1C
   Chishti AI + knowledge.json
========================================== */

/* ========= LOAD KNOWLEDGE ========= */

async function loadKnowledge() {

    try {

        const response = await fetch("knowledge.json");

        App.knowledge = await response.json();

        console.log("Knowledge Loaded");

    }

    catch (error) {

        console.error("Knowledge Loading Failed", error);

    }

}

/* ========= CHAT ========= */

function sendMessage() {

    const input = document.getElementById("userInput");
    const chat = document.getElementById("chatMessages");

    if (!input || !chat) return;

    const question = input.value.trim();

    if (question === "") return;

    addMessage(question, "user");

    input.value = "";

    setTimeout(() => {

        const reply = getAIReply(question);

        addMessage(reply, "bot");

        saveChat();

    }, 500);

}

/* ========= ADD MESSAGE ========= */

function addMessage(text, sender) {
function toggleChat(){
    document.getElementById("chatWindow")
    .classList.toggle("showChat");
}
    const chat = document.getElementById("chatMessages");

    const div = document.createElement("div");

    div.className = sender + "-message";

    div.innerHTML = `
        <div class="message">
            ${text}
        </div>
    `;

    chat.appendChild(div);

    chat.scrollTop = chat.scrollHeight;

}

/* ========= AI ========= */

function getAIReply(question) {

    if (!App.knowledge.intents)
        return "Knowledge not loaded.";

    question = question.toLowerCase();

    for (const intent of App.knowledge.intents) {

        for (const keyword of intent.keywords) {

            if (question.includes(keyword.toLowerCase())) {

                return intent.reply;

            }

        }

    }

    return App.knowledge.fallback ||
        "Sorry, I couldn't understand your question.";

}

/* ========= CHAT HISTORY ========= */

function saveChat() {

    const chat = document.getElementById("chatMessages");

    localStorage.setItem(

        "chatHistory",

        chat.innerHTML

    );

}

function loadChat() {

    const chat = document.getElementById("chatMessages");

    const history = localStorage.getItem("chatHistory");

    if (history) {

        chat.innerHTML = history;

    }

}

function clearChat() {

    localStorage.removeItem("chatHistory");

    document.getElementById("chatMessages").innerHTML = "";

}

/* ========= CHAT WINDOW ========= */

function toggleChat() {

    const box = document.getElementById("chatWindow");

    if (!box) return;

    box.classList.toggle("showChat");

}

/* ========= ENTER ========= */

document.addEventListener("DOMContentLoaded", () => {

    loadKnowledge();

    loadChat();

    const input = document.getElementById("userInput");

    if (input) {

        input.addEventListener("keypress", function (e) {

            if (e.key === "Enter") {

                sendMessage();

            }

        });

    }

});
/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 4
   Voice Input + Text To Speech
   Likes + Views + Comments
========================================== */


/* ==========================================
      VOICE INPUT
========================================== */

let recognition;

function startVoiceInput() {

    if (!('webkitSpeechRecognition' in window)) {

        alert("Voice Input is not supported.");

        return;

    }

    recognition = new webkitSpeechRecognition();

    recognition.lang = "ur-PK";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = function (event) {

        let text = event.results[0][0].transcript;

        document.getElementById("userInput").value = text;

        sendMessage();

    };

}


/* ==========================================
      TEXT TO SPEECH
========================================== */

function speak(text) {

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance();

    speech.text = text;

    speech.lang = "ur-PK";

    speech.rate = 1;

    speech.pitch = 1;

    speech.volume = 1;

    speechSynthesis.speak(speech);

}


/* ==========================================
      AI AUTO SPEAK
========================================== */

const oldReply = getAIReply;

getAIReply = function (question) {

    const answer = oldReply(question);

    speak(answer);

    return answer;

};


/* ==========================================
      BOOK VIEW COUNTER
========================================== */

function addView(bookID) {

    if (!App.views[bookID]) {

        App.views[bookID] = 0;

    }

    App.views[bookID]++;

    localStorage.setItem(

        "bookViews",

        JSON.stringify(App.views)

    );

}


/* ==========================================
      LIKE SYSTEM
========================================== */

function likeBook(bookID) {

    if (!App.likes[bookID]) {

        App.likes[bookID] = 0;

    }

    App.likes[bookID]++;

    localStorage.setItem(

        "bookLikes",

        JSON.stringify(App.likes)

    );

    alert("❤️ Thanks for liking this book.");

}


/* ==========================================
      COMMENT SYSTEM
========================================== */

function addComment(bookID) {

    const comment = prompt("Write your comment");

    if (!comment) return;

    if (!App.comments[bookID]) {

        App.comments[bookID] = [];

    }

    App.comments[bookID].push({

        text: comment,

        time: new Date().toLocaleString()

    });

    localStorage.setItem(

        "bookComments",

        JSON.stringify(App.comments)

    );

    alert("Comment Added");

}


/* ==========================================
      DOWNLOAD COUNTER
========================================== */

function increaseDownload(bookID){

    let downloads = JSON.parse(

        localStorage.getItem("downloads")

    ) || {};

    if(!downloads[bookID]){

        downloads[bookID]=0;

    }

    downloads[bookID]++;

    localStorage.setItem(

        "downloads",

        JSON.stringify(downloads)

    );

}


/* ==========================================
      GET DOWNLOADS
========================================== */

function getDownloads(bookID){

    let downloads = JSON.parse(

        localStorage.getItem("downloads")

    ) || {};

    return downloads[bookID] || 0;

}


/* ==========================================
      PAGE VIEWS
========================================== */

(function(){

let views = Number(

localStorage.getItem("websiteViews")

)||0;

views++;

localStorage.setItem(

"websiteViews",

views

);

const counter=document.getElementById(

"websiteViews"

);

if(counter){

counter.innerHTML=views;

}

})();


/* ==========================================
      READER COUNTER
========================================== */

(function(){

let readers = Number(

localStorage.getItem("readers")

)||0;

readers++;

localStorage.setItem(

"readers",

readers

);

const counter=document.getElementById(

"readerCounter"

);

if(counter){

counter.innerHTML=readers;

}

})();

/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 5
   Premium UI + Animations + Utilities
========================================== */


/* ==========================================
   SCROLL REVEAL ANIMATION
========================================== */

function scrollReveal() {

    const elements = document.querySelectorAll(".reveal");

    const reveal = () => {

        const windowHeight = window.innerHeight;

        elements.forEach(el => {

            const top = el.getBoundingClientRect().top;

            if (top < windowHeight - 120) {

                el.classList.add("active");

            }

        });

    };

    window.addEventListener("scroll", reveal);

    reveal();

}


/* ==========================================
   SMOOTH PAGE LINKS
========================================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const target = document.querySelector(this.getAttribute("href"));

        if (target) {

            target.scrollIntoView({

                behavior: "smooth"

            });

        }

    });

});


/* ==========================================
   BUTTON RIPPLE EFFECT
========================================== */

document.addEventListener("click", function (e) {

    if (!e.target.classList.contains("btn")) return;

    const circle = document.createElement("span");

    circle.className = "ripple";

    circle.style.left = e.offsetX + "px";

    circle.style.top = e.offsetY + "px";

    e.target.appendChild(circle);

    setTimeout(() => {

        circle.remove();

    }, 600);

});


/* ==========================================
   ACTIVE NAVBAR LINK
========================================== */

function activeNav() {

    const links = document.querySelectorAll(".nav-link");

    const current = location.pathname.split("/").pop();

    links.forEach(link => {

        const href = link.getAttribute("href");

        if (href === current) {

            link.classList.add("active");

        }

    });

}


/* ==========================================
   CHAT TYPING ANIMATION
========================================== */

function typingAnimation(text, callback) {

    const chat = document.getElementById("chatMessages");

    if (!chat) return;

    const box = document.createElement("div");

    box.className = "bot-message";

    chat.appendChild(box);

    let i = 0;

    const timer = setInterval(() => {

        box.innerHTML += text.charAt(i);

        i++;

        chat.scrollTop = chat.scrollHeight;

        if (i >= text.length) {

            clearInterval(timer);

            if (callback) callback();

        }

    }, 25);

}


/* ==========================================
   COPY BOOK LINK
========================================== */

function copyBookLink(url) {

    navigator.clipboard.writeText(url);

    alert("Book link copied.");

}


/* ==========================================
   SHARE BOOK
========================================== */

function shareBook(title, url) {

    if (navigator.share) {

        navigator.share({

            title: title,

            text: title,

            url: url

        });

    } else {

        copyBookLink(url);

    }

}


/* ==========================================
   IMAGE LAZY LOAD
========================================== */

const lazyImages = document.querySelectorAll("img[data-src]");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            const img = entry.target;

            img.src = img.dataset.src;

            img.removeAttribute("data-src");

            observer.unobserve(img);

        }

    });

});

lazyImages.forEach(img => observer.observe(img));
/* ==========================================
   BOOK HOVER EFFECT
========================================== */

document.querySelectorAll(".book-card").forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.classList.add("hover");

    });

    card.addEventListener("mouseleave", () => {

        card.classList.remove("hover");

    });
});
/* ==========================================
   START PREMIUM FUNCTIONS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    scrollReveal();

    activeNav();

});
/* ==========================================
   CHISHTI LIBRARY V1.0
   SCRIPT.JS - PART 6 (FINAL)
   Performance + Mobile + Final Functions
========================================== */


/* ==========================================
      MOBILE MENU
========================================== */

function initMobileMenu() {

    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");

    if (!menuBtn || !navLinks) return;

    menuBtn.addEventListener("click", () => {

        navLinks.classList.toggle("show");

        menuBtn.classList.toggle("active");

    });

}
/* ==========================================
      CLOSE MENU
========================================== */

document.querySelectorAll("#navLinks a").forEach(link => {

    link.addEventListener("click", () => {

        const nav = document.getElementById("navLinks");

        if (nav) {

            nav.classList.remove("show");

        }

    });

});
/* ==========================================
      PAGE LOADER FADE
========================================== */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (!loader) return;

    loader.classList.add("loader-hide");

    setTimeout(() => {

        loader.remove();

    }, 800);

});


/* ==========================================
      SAVE READING PROGRESS
========================================== */

function saveReading(bookID, page) {

    let progress = JSON.parse(

        localStorage.getItem("readingProgress")

    ) || {};

    progress[bookID] = page;

    localStorage.setItem(

        "readingProgress",

        JSON.stringify(progress)

    );

}


/* ==========================================
      GET READING PROGRESS
========================================== */

function getReading(bookID) {

    let progress = JSON.parse(

        localStorage.getItem("readingProgress")

    ) || {};

    return progress[bookID] || 1;

}


/* ==========================================
      FAVORITES
========================================== */

function addFavorite(bookID) {

    let fav = JSON.parse(

        localStorage.getItem("favorites")

    ) || [];

    if (!fav.includes(bookID)) {

        fav.push(bookID);

    }

    localStorage.setItem(

        "favorites",

        JSON.stringify(fav)

    );

    alert("Book added to Favorites.");

}


/* ==========================================
      BOOKMARK
========================================== */

function bookmarkBook(bookID) {

    let bookmark = JSON.parse(

        localStorage.getItem("bookmarks")

    ) || [];

    if (!bookmark.includes(bookID)) {

        bookmark.push(bookID);

    }

    localStorage.setItem(

        "bookmarks",

        JSON.stringify(bookmark)

    );

}


/* ==========================================
      DARK MODE READY
========================================== */

function toggleTheme() {

    document.body.classList.toggle("light-theme");

    localStorage.setItem(

        "theme",

        document.body.classList.contains("light-theme")

    );

}


(function () {

    if (localStorage.getItem("theme") === "true") {

        document.body.classList.add("light-theme");

    }

})();


/* ==========================================
      ERROR HANDLER
========================================== */

window.onerror = function (

    message,

    source,

    line,

    column,

    error

) {

    console.error(

        "Library Error:",

        message,

        source,

        line

    );

};


/* ==========================================
      PERFORMANCE
========================================== */

window.addEventListener("pageshow", () => {

    console.log(

        "Chishti Library Loaded Successfully"

    );

});


/* ==========================================
      APP START
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    initMobileMenu();

});


/* ==========================================
      VERSION
========================================== */

const VERSION = "1.0 Premium";

console.log("Chishti Library", VERSION);
