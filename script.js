/*==================================================
        CHISHTI LIBRARY
        SCRIPT.JS
        PART 1
==================================================*/

"use strict";

/*==================================================
                SELECTORS
==================================================*/

const loader = document.getElementById("loader");

const navbar = document.querySelector(".navbar");

const mobileMenu = document.querySelector(".mobile-menu");

const menu = document.querySelector(".menu");

const themeBtn = document.querySelector(".theme-btn");

const scrollTopBtn = document.getElementById("scrollTop");

const body = document.body;

/*==================================================
                LOADER
==================================================*/

window.addEventListener("load", () => {

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

        loader.style.pointerEvents = "none";

    }, 1800);

});

/*==================================================
                NAVBAR SHADOW
==================================================*/

window.addEventListener("scroll", () => {

    if (window.scrollY > 80) {

        navbar.style.background = "rgba(8,8,8,.92)";

        navbar.style.backdropFilter = "blur(20px)";

        navbar.style.boxShadow =
            "0 12px 30px rgba(0,0,0,.25)";

    } else {

        navbar.style.background =
            "rgba(8,8,8,.55)";

        navbar.style.boxShadow = "none";

    }

});

/*==================================================
            MOBILE MENU
==================================================*/

mobileMenu.addEventListener("click", () => {

    menu.classList.toggle("show-menu");

    mobileMenu.classList.toggle("active");

});

/*==================================================
            CLOSE MENU
==================================================*/

document.querySelectorAll(".menu a")
.forEach(link=>{

link.addEventListener("click",()=>{

menu.classList.remove("show-menu");

mobileMenu.classList.remove("active");

});

});

/*==================================================
                THEME
==================================================*/

const savedTheme =
localStorage.getItem("theme");

if(savedTheme==="light"){

body.classList.add("light-theme");

themeBtn.innerHTML=
'<i class="fas fa-sun"></i>';

}

themeBtn.addEventListener("click",()=>{

body.classList.toggle("light-theme");

if(body.classList.contains("light-theme")){

localStorage.setItem("theme","light");

themeBtn.innerHTML=
'<i class="fas fa-sun"></i>';

}else{

localStorage.setItem("theme","dark");

themeBtn.innerHTML=
'<i class="fas fa-moon"></i>';

}

});

/*==================================================
            SCROLL TOP
==================================================*/

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

scrollTopBtn.style.display="flex";

}else{

scrollTopBtn.style.display="none";

}

});

scrollTopBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

/*==================================================
        ACTIVE NAV LINK
==================================================*/

const sections =
document.querySelectorAll("section");

const navLinks =
document.querySelectorAll(".menu a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const sectionTop =
section.offsetTop-150;

if(window.scrollY>=sectionTop){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active");

if(link.getAttribute("href")
===`#${current}`){

link.classList.add("active");

}

});

});

/*==================================================
        CURSOR GLOW
==================================================*/

const glow =
document.querySelector(".cursor-glow");

document.addEventListener("mousemove",(e)=>{

if(glow){

glow.style.left=e.clientX+"px";

glow.style.top=e.clientY+"px";

}

});

/*==================================================
            FADE IN
==================================================*/

const observer =
new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("fade-in");

}

});

},{threshold:.15});

document.querySelectorAll(

".book-card,.counter-card,.latest-book-card,.contact-card"

).forEach(item=>{

observer.observe(item);

});

/*==================================================
        END PART 1
==================================================*/
/*==================================================
            BOOK SYSTEM
            PART 2
==================================================*/

let books = [];
let filteredBooks = [];

const booksContainer = document.getElementById("booksContainer");
const bookTemplate = document.getElementById("bookTemplate");
const searchInput = document.getElementById("searchInput");
const noBooks = document.getElementById("noBooks");

/*=====================================
        LOAD BOOKS
=====================================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        if (!response.ok)
            throw new Error("Books not found");

        books = await response.json();

        filteredBooks = [...books];

        renderBooks(filteredBooks);

        updateBookCounter();

        loadLatestBook();

    } catch (error) {

        console.error(error);

        booksContainer.innerHTML = `
            <div class="error-box">
                Failed to load books.
            </div>
        `;

    }

}

loadBooks();

/*=====================================
        RENDER BOOKS
=====================================*/

function renderBooks(bookArray) {

    booksContainer.innerHTML = "";

    if (bookArray.length === 0) {

        noBooks.style.display = "block";

        return;

    }

    noBooks.style.display = "none";

    bookArray.forEach(book => {

        const card =
            bookTemplate.content.cloneNode(true);

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
            book.views || "0";

        card.querySelector(".downloads").textContent =
            book.downloads || "0";

        card.querySelector(".readBtn").href =
            book.reader;

        card.querySelector(".downloadBtn").href =
            book.pdf;

        const latest =
            card.querySelector(".latest-tag");

        latest.style.display =
            book.latest ? "block" : "none";

        booksContainer.appendChild(card);

    });

}

/*=====================================
            SEARCH
=====================================*/

if (searchInput) {

searchInput.addEventListener("input", function () {

    const keyword =
        this.value.toLowerCase().trim();

    filteredBooks = books.filter(book =>

        book.title.toLowerCase().includes(keyword)

        ||

        book.author.toLowerCase().includes(keyword)

        ||

        book.category.toLowerCase().includes(keyword)

    );

    renderBooks(filteredBooks);

});

}

/*=====================================
        CATEGORY FILTER
=====================================*/

function filterBooks(category) {

    document
        .querySelectorAll(".category")
        .forEach(btn => btn.classList.remove("active"));

    event.target.classList.add("active");

    if (category === "All") {

        filteredBooks = [...books];

    }

    else {

        filteredBooks = books.filter(book =>

            book.category
            .toLowerCase() ===
            category.toLowerCase()

        );

    }

    renderBooks(filteredBooks);

}

/*=====================================
        BOOK COUNTER
=====================================*/

function updateBookCounter() {

    const counter =
        document.getElementById("bookCounter");

    if (!counter) return;

    let start = 0;

    const end = books.length;

    const timer = setInterval(() => {

        start++;

        counter.textContent = start;

        if (start >= end)

            clearInterval(timer);

    }, 40);

}

/*=====================================
        LATEST BOOK
=====================================*/

function loadLatestBook() {

    const latest = books.find(book => book.latest);

    if (!latest) return;

    console.log("Latest Book:", latest.title);

}
/*==================================================
        SCRIPT.JS PART 3
        COUNTERS + STATS + SEARCH
==================================================*/

/*=====================================
        VISITOR COUNTER
=====================================*/

function updateVisitorCounter() {

    const counter = document.getElementById("visitorCounter");

    if (!counter) return;

    let visitors =
        Number(localStorage.getItem("visitors")) || 1250;

    visitors++;

    localStorage.setItem("visitors", visitors);

    animateCounter(counter, visitors);

}

updateVisitorCounter();

/*=====================================
        ANIMATE COUNTER
=====================================*/

function animateCounter(element, target) {

    let start = 0;

    const speed = Math.max(10, Math.floor(target / 80));

    const timer = setInterval(() => {

        start += speed;

        if (start >= target) {

            start = target;

            clearInterval(timer);

        }

        element.textContent = start.toLocaleString();

    }, 20);

}

/*=====================================
        BOOK DOWNLOAD STATS
=====================================*/

function increaseDownload(bookTitle){

    const key = `download_${bookTitle}`;

    let total = Number(localStorage.getItem(key)) || 0;

    total++;

    localStorage.setItem(key,total);

}

/*=====================================
        READ STATS
=====================================*/

function increaseViews(bookTitle){

    const key = `view_${bookTitle}`;

    let total = Number(localStorage.getItem(key)) || 0;

    total++;

    localStorage.setItem(key,total);

}

/*=====================================
        LATEST BOOK SECTION
=====================================*/

function updateLatestBook(){

    const latestBook = books.find(book=>book.latest);

    if(!latestBook) return;

    const cover =
    document.querySelector(".latest-cover img");

    const title =
    document.querySelector(".latest-content h2");

    const author =
    document.querySelector(".latest-content h4");

    const desc =
    document.querySelector(".latest-content p");

    if(cover) cover.src = latestBook.cover;

    if(title) title.textContent = latestBook.title;

    if(author) author.textContent = latestBook.author;

    if(desc)
    desc.textContent =
    latestBook.description || "";

}

updateLatestBook();

/*=====================================
        LIVE SEARCH SUGGESTIONS
=====================================*/

const suggestionBox =
document.createElement("div");

suggestionBox.className="search-suggestions";

if(searchInput){

searchInput.parentElement.appendChild(
suggestionBox
);

}

searchInput?.addEventListener("input",()=>{

const keyword =
searchInput.value.toLowerCase().trim();

suggestionBox.innerHTML="";

if(keyword.length<2){

suggestionBox.style.display="none";

return;

}

const matches =
books.filter(book=>

book.title.toLowerCase().includes(keyword)

).slice(0,5);

if(matches.length===0){

suggestionBox.style.display="none";

return;

}

matches.forEach(book=>{

const item=document.createElement("div");

item.className="suggestion-item";

item.innerHTML=`

<strong>${book.title}</strong>

<br>

<small>${book.author}</small>

`;

item.onclick=()=>{

searchInput.value=book.title;

renderBooks([book]);

suggestionBox.style.display="none";

};

suggestionBox.appendChild(item);

});

suggestionBox.style.display="block";

});

/*=====================================
        ESC CLOSE
=====================================*/

document.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

suggestionBox.style.display="none";

}

});

/*=====================================
        SEARCH OUTSIDE CLICK
=====================================*/

document.addEventListener("click",(e)=>{

if(

searchInput &&

!searchInput.contains(e.target)

&&

!suggestionBox.contains(e.target)

){

suggestionBox.style.display="none";

}

});

/*=====================================
        TOTAL STATS
=====================================*/

function calculateLibraryStats(){

const totalBooks=books.length;

const totalDownloads=
books.reduce((sum,book)=>

sum+(book.downloads||0)

,0);

const totalViews=
books.reduce((sum,book)=>

sum+(book.views||0)

,0);

console.log({

totalBooks,

totalDownloads,

totalViews

});

}

calculateLibraryStats();
/*==================================================
        CHISHTI AI
        PART 4
==================================================*/

let chatbotData = [];
let knowledgeData = [];

/*=====================================
        LOAD AI DATA
=====================================*/

async function loadAI() {

    try {

        const chat = await fetch("chatbot.json");
        chatbotData = await chat.json();

        const knowledge = await fetch("knowledge.json");
        knowledgeData = await knowledge.json();

        console.log("AI Loaded");

    } catch (error) {

        console.error("AI Error", error);

    }

}

loadAI();

/*=====================================
        SELECTORS
=====================================*/

const chatBtn =
document.getElementById("chatBtn");

const chatWindow =
document.getElementById("chatWindow");

const closeChat =
document.getElementById("closeChat");

const clearChat =
document.getElementById("clearChat");

const userInput =
document.getElementById("userInput");

const sendBtn =
document.getElementById("sendBtn");

const chatMessages =
document.getElementById("chatMessages");

const typing =
document.getElementById("typing");

/*=====================================
        OPEN CHAT
=====================================*/

chatBtn.onclick=()=>{

chatWindow.classList.add("active");

userInput.focus();

};

/*=====================================
        CLOSE CHAT
=====================================*/

closeChat.onclick=()=>{

chatWindow.classList.remove("active");

};

/*=====================================
        ENTER KEY
=====================================*/

userInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

/*=====================================
        SEND BUTTON
=====================================*/

sendBtn.onclick=sendMessage;

/*=====================================
        SEND MESSAGE
=====================================*/

function sendMessage(){

const text=userInput.value.trim();

if(text==="") return;

addUserMessage(text);

userInput.value="";

showTyping();

setTimeout(()=>{

hideTyping();

const reply=getReply(text);

addBotMessage(reply);

saveChat();

},900);

}

/*=====================================
        USER MESSAGE
=====================================*/

function addUserMessage(text){

chatMessages.innerHTML+=`

<div class="user-message">

<div class="message">

${text}

</div>

</div>

`;

scrollBottom();

}

/*=====================================
        BOT MESSAGE
=====================================*/

function addBotMessage(text){

chatMessages.innerHTML+=`

<div class="bot-message">

<img
src="images/chishti-ai-logo.png"
class="bot-avatar">

<div class="message">

${text}

</div>

</div>

`;

scrollBottom();

}

/*=====================================
        AI REPLY
=====================================*/

function getReply(question){

question=question.toLowerCase();

/* chatbot.json */

for(const item of chatbotData){

if(question.includes(item.question.toLowerCase()))

return item.answer;

}

/* knowledge.json */

for(const item of knowledgeData){

if(question.includes(item.question.toLowerCase()))

return item.answer;

}

/* books.json */

const found=

books.find(book=>

question.includes(book.title.toLowerCase())

||

question.includes(book.author.toLowerCase())

||

question.includes(book.category.toLowerCase())

);

if(found){

return `

📚 ${found.title}

Author: ${found.author}

Category: ${found.category}

Click Read or Download from Books section.

`;

}

/* Greetings */

if(question.includes("assalam")||

question.includes("salam"))

return "Wa Alaikum Assalam 🌹";

if(question.includes("hello"))

return "Hello 👋 Welcome to Chishti Library.";

if(question.includes("thanks"))

return "You're Welcome ❤️";

/* Default */

return "Sorry, I couldn't understand. Please ask about books, authors or Islamic knowledge.";

}

/*=====================================
        QUICK ASK
=====================================*/

function quickAsk(text){

userInput.value=text;

sendMessage();

}

/*=====================================
        TYPING
=====================================*/

function showTyping(){

typing.style.display="block";

scrollBottom();

}

function hideTyping(){

typing.style.display="none";

}

/*=====================================
        SCROLL
=====================================*/

function scrollBottom(){

chatMessages.scrollTop=

chatMessages.scrollHeight;

}

/*=====================================
        CLEAR CHAT
=====================================*/

clearChat.onclick=()=>{

chatMessages.innerHTML="";

localStorage.removeItem("chatHistory");

};

/*=====================================
        SAVE CHAT
=====================================*/

function saveChat(){

localStorage.setItem(

"chatHistory",

chatMessages.innerHTML

);

}

/*=====================================
        LOAD CHAT
=====================================*/

window.addEventListener("load",()=>{

const history=

localStorage.getItem("chatHistory");

if(history){

chatMessages.innerHTML=history;

scrollBottom();

}

});
/*==================================================
        CHISHTI LIBRARY
        SCRIPT.JS
        PART 5
==================================================*/

"use strict";

/*========================================
        SAFE MESSAGE CREATOR
========================================*/

function createMessage(text, type = "bot") {

    const wrapper = document.createElement("div");

    wrapper.className =
        type === "user"
        ? "user-message"
        : "bot-message";

    if (type === "bot") {

        const avatar = document.createElement("img");

        avatar.src = "images/chishti-ai-logo.png";

        avatar.className = "bot-avatar";

        wrapper.appendChild(avatar);

    }

    const bubble = document.createElement("div");

    bubble.className = "message";

    bubble.textContent = text;

    wrapper.appendChild(bubble);

    chatMessages.appendChild(wrapper);

    scrollBottom();

}

/*========================================
        CHAT HISTORY JSON
========================================*/

let history = JSON.parse(

localStorage.getItem("chat-history")

) || [];

function saveHistory(role,text){

history.push({

role,

text,

time:Date.now()

});

localStorage.setItem(

"chat-history",

JSON.stringify(history)

);

}

function restoreHistory(){

chatMessages.innerHTML="";

history.forEach(item=>{

createMessage(

item.text,

item.role

);

});

}

restoreHistory();

/*========================================
        IMPROVED SEND
========================================*/

function sendMessage(){

const text=userInput.value.trim();

if(!text) return;

createMessage(text,"user");

saveHistory("user",text);

userInput.value="";

typing.style.display="block";

setTimeout(()=>{

typing.style.display="none";

const reply=

findBestReply(text);

createMessage(reply,"bot");

saveHistory("bot",reply);

},800);

}

/*========================================
        SMART AI
========================================*/

function normalize(str){

return str

.toLowerCase()

.replace(/[^\w\s]/g,"")

.trim();

}

function findBestReply(question){

const q=normalize(question);

/* chatbot */

for(const item of chatbotData){

if(q.includes(normalize(item.question)))

return item.answer;

}

/* knowledge */

for(const item of knowledgeData){

if(q.includes(normalize(item.question)))

return item.answer;

}

/* books */

for(const book of books){

if(

q.includes(normalize(book.title))

||

q.includes(normalize(book.author))

||

q.includes(normalize(book.category))

){

return

`📚 ${book.title}

Author: ${book.author}

Category: ${book.category}

Read or Download from Books Section.`;

}

}

/* greetings */

const greetings=[

"hello",

"hi",

"assalam",

"salam",

"aoa",

"اسلام",

"السلام"

];

if(greetings.some(x=>q.includes(x)))

return "🌹 Assalamu Alaikum! Welcome to Chishti Library AI.";

/* thanks */

if(

q.includes("thanks")

||

q.includes("shukriya")

||

q.includes("jazak")

)

return "🤍 You're most welcome.";

/* default */

return "Sorry, I couldn't find an answer. Please ask about books, authors or Islamic knowledge.";

}

/*========================================
        QUICK QUESTIONS
========================================*/

document

.querySelectorAll(".quick-btn")

.forEach(btn=>{

btn.onclick=()=>{

userInput.value=

btn.dataset.ask;

sendMessage();

};

});

/*========================================
        SCROLL TOP
========================================*/

window.addEventListener("scroll",()=>{

if(window.scrollY>600){

scrollTopBtn.classList.add("show");

}else{

scrollTopBtn.classList.remove("show");

}

});

/*========================================
        SEARCH DEBOUNCE
========================================*/

function debounce(fn,delay){

let timer;

return(...args)=>{

clearTimeout(timer);

timer=setTimeout(

()=>fn(...args),

delay

);

};

}

if(searchInput){

searchInput.addEventListener(

"input",

debounce(()=>{

const value=

searchInput.value

.toLowerCase()

.trim();

const results=

books.filter(book=>

book.title

.toLowerCase()

.includes(value)

||

book.author

.toLowerCase()

.includes(value)

||

book.category

.toLowerCase()

.includes(value)

);

renderBooks(results);

},300)

);

}

/*========================================
        LAZY IMAGES
========================================*/

document

.querySelectorAll("img[data-src]")

.forEach(img=>{

const observer=

new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

img.src=

img.dataset.src;

observer.unobserve(img);

}

});

});

observer.observe(img);

});

/*========================================
        OFFLINE
========================================*/

window.addEventListener(

"offline",

()=>{

alert(

"Internet connection lost."

);

}

);

window.addEventListener(

"online",

()=>{

console.log(

"Connected"

);

}

);

/*========================================
        VERSION
========================================*/

console.log(

"Chishti Library v2.0 Loaded"

);
