/*==================================================
        CHISHTI LIBRARY 2026
        MAIN SCRIPT
==================================================*/

/*==============================
        GLOBAL VARIABLES
==============================*/

let books = [];
let filteredBooks = [];
let chatbotData = [];

/*==============================
        DOM ELEMENTS
==============================*/

const booksContainer = document.getElementById("booksContainer");
const bookTemplate = document.getElementById("bookTemplate");

const searchInput = document.getElementById("searchInput");

const booksCounter = document.getElementById("booksCounter");
const visitorCounter = document.getElementById("visitorCounter");
const downloadCounter = document.getElementById("downloadCounter");

const latestBookCover = document.getElementById("latestBookCover");
const latestBookTitle = document.getElementById("latestBookTitle");
const latestBookAuthor = document.getElementById("latestBookAuthor");
const latestBookDescription = document.getElementById("latestBookDescription");
const latestBookCategory = document.getElementById("latestBookCategory");
const latestBookYear = document.getElementById("latestBookYear");
const latestReadBtn = document.getElementById("latestReadBtn");
const latestDownloadBtn = document.getElementById("latestDownloadBtn");

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendMessageBtn = document.getElementById("sendMessage");

const loader = document.getElementById("loader");

/*==============================
        LOAD BOOKS
==============================*/

async function loadBooks() {

try {

const response = await fetch("books.json");

if (!response.ok)
throw new Error("books.json not found");

books = await response.json();

filteredBooks = [...books];

renderBooks(filteredBooks);

loadLatestBook();

updateBooksCounter();

}

catch(error){

console.error(error);

if(booksContainer){

booksContainer.innerHTML=`
<h2 style="text-align:center;color:#ff5555;">
Unable to load books.
</h2>
`;

}

}

}
/*==============================
        RENDER BOOKS
==============================*/

function renderBooks(list){

if(!booksContainer || !bookTemplate) return;

booksContainer.innerHTML="";

list.forEach((book,index)=>{

const card=bookTemplate.content.cloneNode(true);

const cover=card.querySelector(".cover");
const title=card.querySelector(".title");
const author=card.querySelector(".author");
const description=card.querySelector(".description");
const category=card.querySelector(".book-category");
const views=card.querySelector(".views");
const downloads=card.querySelector(".downloads");
const readBtn=card.querySelector(".readBtn");
const downloadBtn=card.querySelector(".downloadBtn");
const latestTag=card.querySelector(".latest-tag");

cover.src=book.cover || "images/no-image.png";
cover.alt=book.title;

title.textContent=book.title;
author.textContent=book.author;
description.textContent=book.description || "";

category.textContent=book.category || "Islamic";

views.textContent=book.views || 0;
downloads.textContent=book.downloads || 0;

readBtn.href=book.reader || "#";

downloadBtn.href=book.pdf || "#";

downloadBtn.addEventListener("click",()=>{

book.downloads=(book.downloads || 0)+1;

downloads.textContent=book.downloads;

updateDownloadCounter();

});

if(book.latest){

latestTag.style.display="inline-flex";

}else{

latestTag.style.display="none";

}

booksContainer.appendChild(card);

});

}

/*==============================
        LATEST BOOK
==============================*/

function loadLatestBook(){

const latest=books.find(book=>book.latest);

if(!latest) return;

latestBookCover.src=latest.cover || "images/no-image.png";

latestBookTitle.textContent=latest.title;

latestBookAuthor.textContent=latest.author;

latestBookDescription.textContent=latest.description;

latestBookCategory.textContent=latest.category;

latestBookYear.textContent=latest.year || "2026";

latestReadBtn.href=latest.reader || "#";

latestDownloadBtn.href=latest.pdf || "#";

}

/*==============================
        DOWNLOAD COUNTER
==============================*/

function updateDownloadCounter(){

let total=0;

books.forEach(book=>{

total+=book.downloads || 0;

});

if(downloadCounter){

downloadCounter.textContent=total;

}

}
/*==============================
        BOOK COUNTER
==============================*/

function updateBooksCounter(){

if(!booksCounter) return;

let current = 0;

const total = books.length;

const timer = setInterval(()=>{

current++;

booksCounter.textContent = current;

if(current >= total){

clearInterval(timer);

}

},40);

}

/*==============================
        VISITOR COUNTER
==============================*/

function updateVisitorCounter(){

if(!visitorCounter) return;

let visitors = Number(localStorage.getItem("chishtiVisitors")) || 0;

const today = new Date().toDateString();

const lastVisit = localStorage.getItem("lastVisit");

if(lastVisit !== today){

visitors++;

localStorage.setItem("chishtiVisitors",visitors);

localStorage.setItem("lastVisit",today);

}

visitorCounter.textContent = visitors;

}

/*==============================
        LIVE SEARCH
==============================*/

function searchBooks(){

const keyword = searchInput.value
.toLowerCase()
.trim();

filteredBooks = books.filter(book=>{

return(

book.title.toLowerCase().includes(keyword) ||

book.author.toLowerCase().includes(keyword) ||

book.category.toLowerCase().includes(keyword)

);

});

renderBooks(filteredBooks);

}

if(searchInput){

searchInput.addEventListener("input",searchBooks);

}

/*==============================
        CATEGORY FILTER
==============================*/

function filterBooks(category,button){

document.querySelectorAll(".category")
.forEach(btn=>{

btn.classList.remove("active");

});

if(button){

button.classList.add("active");

}

if(category==="All"){

filteredBooks=[...books];

}else{

filteredBooks=books.filter(book=>

book.category.toLowerCase()===category.toLowerCase()

);

}

renderBooks(filteredBooks);

}

/*==============================
        TOTAL DOWNLOADS
==============================*/

updateDownloadCounter();

updateVisitorCounter();/*==============================
        BOOK COUNTER
==============================*/

function updateBooksCounter(){

if(!booksCounter) return;

let current = 0;

const total = books.length;

const timer = setInterval(()=>{

current++;

booksCounter.textContent = current;

if(current >= total){

clearInterval(timer);

}

},40);

}

/*==============================
        VISITOR COUNTER
==============================*/

function updateVisitorCounter(){

if(!visitorCounter) return;

let visitors = Number(localStorage.getItem("chishtiVisitors")) || 0;

const today = new Date().toDateString();

const lastVisit = localStorage.getItem("lastVisit");

if(lastVisit !== today){

visitors++;

localStorage.setItem("chishtiVisitors",visitors);

localStorage.setItem("lastVisit",today);

}

visitorCounter.textContent = visitors;

}

/*==============================
        LIVE SEARCH
==============================*/

function searchBooks(){

const keyword = searchInput.value
.toLowerCase()
.trim();

filteredBooks = books.filter(book=>{

return(

book.title.toLowerCase().includes(keyword) ||

book.author.toLowerCase().includes(keyword) ||

book.category.toLowerCase().includes(keyword)

);

});

renderBooks(filteredBooks);

}

if(searchInput){

searchInput.addEventListener("input",searchBooks);

}

/*==============================
        CATEGORY FILTER
==============================*/

function filterBooks(category,button){

document.querySelectorAll(".category")
.forEach(btn=>{

btn.classList.remove("active");

});

if(button){

button.classList.add("active");

}

if(category==="All"){

filteredBooks=[...books];

}else{

filteredBooks=books.filter(book=>

book.category.toLowerCase()===category.toLowerCase()

);

}

renderBooks(filteredBooks);

}

/*==============================
        TOTAL DOWNLOADS
==============================*/

updateDownloadCounter();

updateVisitorCounter();
/*==============================
        LOAD CHATBOT DATA
==============================*/

async function loadChatbot(){

try{

const response = await fetch("chatbot.json");

if(!response.ok)
throw new Error("chatbot.json not found");

chatbotData = await response.json();

console.log("Chatbot Loaded");

}catch(error){

console.error(error);

chatbotData = [];

}

}

/*==============================
        OPEN / CLOSE CHAT
==============================*/

if(chatBtn){

chatBtn.addEventListener("click",()=>{

chatWindow.classList.add("active");

chatInput.focus();

});

}

if(closeChat){

closeChat.addEventListener("click",()=>{

chatWindow.classList.remove("active");

});

}

/*==============================
        ADD MESSAGE
==============================*/

function addMessage(type,text){

const message=document.createElement("div");

message.className=type+"-message";

message.innerHTML=`

<div class="message-content">

${text}

</div>

`;

chatMessages.appendChild(message);

chatMessages.scrollTop=chatMessages.scrollHeight;

}

/*==============================
        FIND BOT REPLY
==============================*/

function getBotReply(question){

const q=question.toLowerCase();

for(const item of chatbotData){

if(item.keywords.some(word=>q.includes(word.toLowerCase()))){

return item.reply;

}

}

return "🤲 Sorry, I couldn't understand your question. Please ask about books, authors, downloads or the Chishti Library.";

}

/*==============================
        SEND MESSAGE
==============================*/

function sendMessage(){

const text=chatInput.value.trim();

if(text==="") return;

addMessage("user",text);

chatInput.value="";

setTimeout(()=>{

const reply=getBotReply(text);

addMessage("bot",reply);

},500);

}

/*==============================
        SEND EVENTS
==============================*/

if(sendMessageBtn){

sendMessageBtn.addEventListener("click",sendMessage);

}

if(chatInput){

chatInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

e.preventDefault();

sendMessage();

}

});

}
/*==============================
        LOADING SCREEN
==============================*/

window.addEventListener("load", () => {

setTimeout(() => {

if(loader){

loader.style.opacity = "0";

loader.style.visibility = "hidden";

}

},5000);

});

/*==============================
        FALLING STARS
==============================*/

function createStars(){

const starsContainer = document.getElementById("stars");

if(!starsContainer) return;

for(let i=0;i<80;i++){

const star=document.createElement("span");

star.className="star";

star.style.left=Math.random()*100+"%";

star.style.top=Math.random()*-100+"vh";

star.style.animationDuration=(4+Math.random()*8)+"s";

star.style.animationDelay=Math.random()*6+"s";

star.style.opacity=Math.random();

star.style.width=(2+Math.random()*3)+"px";

star.style.height=star.style.width;

starsContainer.appendChild(star);

}

}

/*==============================
        BACK TO TOP
==============================*/

const backToTop=document.getElementById("backToTop");



if(!backToTop) return;

if(window.scrollY>400){

backToTop.classList.add("show");

}else{

backToTop.classList.remove("show");

}

});

backToTop?.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

/*==============================
        MOBILE MENU
==============================*/

const menuBtn=document.getElementById("menuBtn");

const navbar=document.querySelector(".navbar");

menuBtn?.addEventListener("click",()=>{

navbar.classList.toggle("active");

menuBtn.classList.toggle("active");

});

/*==============================
        CLOSE MOBILE MENU
==============================*/

document.querySelectorAll(".navbar a").forEach(link=>{

link.addEventListener("click",()=>{

navbar?.classList.remove("active");

menuBtn?.classList.remove("active");

});

});

/*==============================
        SMOOTH SCROLL
==============================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

e.preventDefault();

const target=document.querySelector(this.getAttribute("href"));

if(target){

target.scrollIntoView({

behavior:"smooth",

block:"start"

});

}

});

});

/*==============================
        INITIALIZE
==============================*/

window.addEventListener("DOMContentLoaded",async()=>{

await loadBooks();

await loadChatbot();

updateVisitorCounter();

updateDownloadCounter();

createStars();

console.log("✅ Chishti Library Ready");

});
