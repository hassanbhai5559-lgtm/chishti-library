/*==================================================
CHISHTI LIBRARY 2026
PART 1
Loader
Navbar
Scroll
Counters
Hero Search
==================================================*/

/*==========================
LOADER
==========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.classList.add("hide");

    }, 3000);

});


/*==========================
MOBILE MENU
==========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if(menuBtn){

menuBtn.addEventListener("click",()=>{

menu.classList.toggle("show");

});

}


/*==========================
SCROLL TOP BUTTON
==========================*/

const scrollBtn=document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

scrollBtn.classList.add("show");

}else{

scrollBtn.classList.remove("show");

}

});

if(scrollBtn){

scrollBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

}


/*==========================
NAVBAR EFFECT
==========================*/

const navbar=document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY>80){

navbar.classList.add("active");

}else{

navbar.classList.remove("active");

}

});


/*==========================
VISITOR COUNTER
==========================*/

let visitorCount=localStorage.getItem("visitorCounter");

if(visitorCount==null){

visitorCount=0;

}

visitorCount++;

localStorage.setItem("visitorCounter",visitorCount);

const visitor=document.getElementById("visitorCounter");

let currentVisitor=0;

const visitorAnimation=setInterval(()=>{

currentVisitor++;

visitor.innerHTML=currentVisitor;

if(currentVisitor>=visitorCount){

clearInterval(visitorAnimation);

}

},20);


/*==========================
BOOK COUNTER
==========================*/

let allBooks=[];

async function updateBookCounter(){

try{

const response=await fetch("books.json");

allBooks=await response.json();

const totalBooks=allBooks.length;

const counter=document.getElementById("bookCounter");

let current=0;

const animation=setInterval(()=>{

current++;

counter.innerHTML=current;

if(current>=totalBooks){

clearInterval(animation);

}

},20);

}catch(err){

console.log("books.json not found");

}

}

updateBookCounter();


/*==========================
SEARCH
==========================*/

function searchBooks(){

const keyword=document

.getElementById("searchInput")

.value

.toLowerCase();

const filtered=allBooks.filter(book=>{

return(

book.title.toLowerCase().includes(keyword)||

book.author.toLowerCase().includes(keyword)||

book.category.toLowerCase().includes(keyword)

);

});

displayBooks(filtered);

}


/*==========================
CATEGORY FILTER
==========================*/

function filterBooks(category){

document.querySelectorAll(".category").forEach(btn=>{

btn.classList.remove("active");

});

event.target.classList.add("active");

if(category==="All"){

displayBooks(allBooks);

return;

}

const filtered=allBooks.filter(book=>{

return book.category===category;

});

displayBooks(filtered);

}


/*==========================
PAGE FADE
==========================*/

const sections=document.querySelectorAll("section");

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show-section");

}

});

});

sections.forEach(section=>{

observer.observe(section);

});


console.log("Chishti Library JS Part 1 Loaded");
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 2
BOOK SYSTEM
=========================================*/

let books = [];
let currentCategory = "All";

/*=========================
LOAD BOOKS
=========================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");
        books = await response.json();

        renderBooks(books);

        // Book Counter Auto
        const counter = document.getElementById("bookCounter");

        if(counter){

            animateCounter(counter, books.length);

        }

    }

    catch(error){

        console.error("books.json not found");

    }

}

loadBooks();

/*=========================
RENDER BOOKS
=========================*/

function renderBooks(bookArray){

    const container = document.getElementById("booksContainer");

    if(!container) return;

    container.innerHTML = "";

    if(bookArray.length===0){

        container.innerHTML=`

        <div class="no-books">

        <h2>No Books Found</h2>

        </div>

        `;

        return;

    }

    bookArray.forEach(book=>{

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <div class="book-info">

                <span class="category">

                ${book.category}

                </span>

                <h2>${book.title}</h2>

                <h3>${book.author}</h3>

                <p>${book.description}</p>

                <div class="book-buttons">

                    <a href="${book.reader}" class="btn">

                    Read Online

                    </a>

                    <a href="${book.pdf}" download class="btn btn2">

                    Download

                    </a>

                </div>

            </div>

        </div>

        `;

    });

}

/*=========================
LIVE SEARCH
=========================*/

function searchBooks(){

    const keyword=document
    .getElementById("searchInput")
    .value
    .toLowerCase();

    let filtered=books.filter(book=>{

        return(

            book.title.toLowerCase().includes(keyword)||

            book.author.toLowerCase().includes(keyword)||

            book.category.toLowerCase().includes(keyword)||

            book.language.toLowerCase().includes(keyword)

        );

    });

    if(currentCategory!="All"){

        filtered=filtered.filter(book=>

            book.category===currentCategory

        );

    }

    renderBooks(filtered);

}

/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(category){

    currentCategory=category;

    document.querySelectorAll(".category").forEach(btn=>{

        btn.classList.remove("active");

    });

    event.target.classList.add("active");

    let filtered;

    if(category==="All"){

        filtered=books;

    }

    else{

        filtered=books.filter(book=>

            book.category===category

        );

    }

    const keyword=document
    .getElementById("searchInput")
    .value
    .toLowerCase();

    if(keyword!=""){

        filtered=filtered.filter(book=>{

            return(

                book.title.toLowerCase().includes(keyword)||

                book.author.toLowerCase().includes(keyword)

            );

        });

    }

    renderBooks(filtered);

}
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 3
AI CHATBOT + VISITOR COUNTER
=========================================*/

/*=========================
VISITOR COUNTER
=========================*/

function updateVisitorCounter(){

    let visitors=localStorage.getItem("chishtiVisitors");

    if(visitors===null){

        visitors=0;

    }else{

        visitors=parseInt(visitors);

    }

    visitors++;

    localStorage.setItem("chishtiVisitors",visitors);

    const counter=document.getElementById("visitorCounter");

    if(counter){

        animateCounter(counter,visitors);

    }

}

updateVisitorCounter();

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn=document.getElementById("chatBtn");
const chatWindow=document.getElementById("chatWindow");
const closeChat=document.getElementById("closeChat");
const chatInput=document.getElementById("chatInput");
const chatMessages=document.getElementById("chatMessages");

if(chatBtn){

chatBtn.onclick=()=>{

chatWindow.classList.add("show");

}

}

if(closeChat){

closeChat.onclick=()=>{

chatWindow.classList.remove("show");

}

}

/*=========================
ENTER KEY
=========================*/

if(chatInput){

chatInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

}

/*=========================
BOT MESSAGE
=========================*/

function addBotMessage(text){

chatMessages.innerHTML+=`

<div class="bot-message">

${text}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

}

/*=========================
USER MESSAGE
=========================*/

function addUserMessage(text){

chatMessages.innerHTML+=`

<div class="user-message">

${text}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

}

/*=========================
SEND MESSAGE
=========================*/

async function sendMessage(){

const text=chatInput.value.trim();

if(text==="") return;

addUserMessage(text);

chatInput.value="";

/*=========================
BOOK SEARCH
=========================*/

const foundBook=books.find(book=>

book.title.toLowerCase().includes(text.toLowerCase())

);

if(foundBook){

setTimeout(()=>{

addBotMessage(`

📚 <b>${foundBook.title}</b><br><br>

Author : ${foundBook.author}<br>

Category : ${foundBook.category}<br><br>

<a href="${foundBook.reader}" class="btn">

Read Online

</a>

`);

},500);

return;

}

/*=========================
LOAD KNOWLEDGE
=========================*/

try{

const response=await fetch("knowledge.json");

const knowledge=await response.json();

const msg=text.toLowerCase();

const answer=knowledge.find(item=>

msg.includes(item.question.toLowerCase())

);

if(answer){

setTimeout(()=>{

addBotMessage(answer.answer);

},500);

}

else{

chatbotReply(text);

}

}

catch{

chatbotReply(text);

}

}

/*=========================
CHATBOT.JSON
=========================*/

async function chatbotReply(message){

try{

const response=await fetch("chatbot.json");

const data=await response.json();

const msg=message.toLowerCase();

const answer=data.find(item=>

msg.includes(item.question.toLowerCase())

);

if(answer){

setTimeout(()=>{

addBotMessage(answer.answer);

},500);

}

else{

setTimeout(()=>{

addBotMessage("🤖 Sorry, mujhe iska jawab abhi database me nahi mila.");

},500);

}

}

catch{

addBotMessage("⚠ AI Database Error");

}

}
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 4
FINAL EFFECTS
=========================================*/

/*=========================
LATEST BOOK AUTO
=========================*/

function loadLatestBook(){

    if(!books || books.length===0) return;

    const latest=books.find(book=>book.latest===true);

    if(!latest) return;

    const latestTitle=document.getElementById("latestTitle");
    const latestAuthor=document.getElementById("latestAuthor");
    const latestCover=document.getElementById("latestCover");
    const latestRead=document.getElementById("latestRead");
    const latestDownload=document.getElementById("latestDownload");

    if(latestTitle) latestTitle.innerHTML=latest.title;

    if(latestAuthor) latestAuthor.innerHTML=latest.author;

    if(latestCover) latestCover.src=latest.cover;

    if(latestRead) latestRead.href=latest.reader;

    if(latestDownload) latestDownload.href=latest.pdf;

}

setTimeout(loadLatestBook,800);

/*=========================
FLOATING HERO LOGO
=========================*/

const heroLogo=document.querySelector(".hero-logo");

if(heroLogo){

let position=0;

setInterval(()=>{

position++;

heroLogo.style.transform=`translateY(${Math.sin(position/15)*10}px)`;

},40);

}

/*=========================
AI FLOAT
=========================*/

const ai=document.getElementById("chatBtn");

if(ai){

let i=0;

setInterval(()=>{

i++;

ai.style.transform=`translateY(${Math.sin(i/20)*8}px)`;

},40);

}

/*=========================
SECTION ANIMATION
=========================*/

const observer=new IntersectionObserver(entries=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:.2
});

document.querySelectorAll("section").forEach(section=>{

observer.observe(section);

});

/*=========================
NAVBAR SHADOW
=========================*/

window.addEventListener("scroll",()=>{

const nav=document.querySelector(".navbar");

if(window.scrollY>40){

nav.classList.add("shadow");

}else{

nav.classList.remove("shadow");

}

});

/*=========================
CURRENT YEAR
=========================*/

const year=document.getElementById("year");

if(year){

year.innerHTML=new Date().getFullYear();

}

/*=========================
IMAGE FALLBACK
=========================*/

document.querySelectorAll("img").forEach(img=>{

img.onerror=function(){

this.src="images/no-image.png";

};

});

/*=========================
PRELOAD BOOK COVERS
=========================*/

function preloadImages(){

if(!books) return;

books.forEach(book=>{

const image=new Image();

image.src=book.cover;

});

}

setTimeout(preloadImages,1000);

/*=========================
WELCOME
=========================*/

console.log("%cCHISHTI LIBRARY","color:#C9A227;font-size:26px;font-weight:bold;");

console.log("%cDigital Islamic Library Loaded Successfully","color:lime;font-size:15px;");
/*====================================
BOOKS PAGE
LOAD FROM books.json
====================================*/

let booksData = [];

/*==========================
LOAD BOOKS
==========================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");
        booksData = await response.json();

        renderBooks(booksData);

    } catch (err) {

        console.error("Books not loaded", err);

    }

}

/*==========================
RENDER BOOKS
==========================*/

function renderBooks(data) {

    const grid = document.getElementById("booksGrid");

    if (!grid) return;

    grid.innerHTML = "";

    data.forEach(book => {

        grid.innerHTML += `

<div class="book-card">

<div class="book-cover">

<img src="${book.cover}" alt="${book.title}">

${book.featured ? '<span class="featured" style="display:block;">Featured</span>' : ""}

</div>

<div class="book-details">

<h2>${book.title}</h2>

<h3>${book.author}</h3>

<p>${book.category}</p>

<div class="stats">

<span>
<i class="fas fa-eye"></i
