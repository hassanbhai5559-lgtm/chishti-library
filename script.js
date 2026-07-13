/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 1
Foundation
=========================================*/

/*=========================
PREMIUM LOADER
=========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        if(loader){

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";

            setTimeout(()=>{
                loader.remove();
            },800);

        }

    },2500);

});

/*=========================
MOBILE MENU
=========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if(menuBtn && menu){

    menuBtn.addEventListener("click",()=>{

        menu.classList.toggle("show");

    });

}

/*=========================
SCROLL TOP
=========================*/

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

    if(!scrollBtn) return;

    if(window.scrollY>300){

        scrollBtn.style.display="block";

    }else{

        scrollBtn.style.display="none";

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

/*=========================
VISITOR COUNTER
0 → 1 → 2 → 3...
=========================*/

let visitors = Number(localStorage.getItem("chishtiVisitors")) || 0;

visitors++;

localStorage.setItem("chishtiVisitors", visitors);

const visitorCounter = document.getElementById("visitorCounter");

if(visitorCounter){

let current = 0;

const animateVisitor = setInterval(()=>{

current++;

visitorCounter.innerText=current;

if(current>=visitors){

clearInterval(animateVisitor);

}

},25);

}

/*=========================
GLOBAL VARIABLES
=========================*/

let allBooks = [];

let filteredBooks = [];

/*=========================
LOAD BOOKS.JSON
=========================*/

async function loadBooks(){

try{

const response = await fetch("books.json");

allBooks = await response.json();

filteredBooks = [...allBooks];

/* Book Counter */

const bookCounter=document.getElementById("bookCounter");

if(bookCounter){

let count=0;

const total=allBooks.length;

const animation=setInterval(()=>{

count++;

bookCounter.innerText=count;

if(count>=total){

clearInterval(animation);

}

},120);

}

/* Display Books */

if(typeof displayBooks==="function"){

displayBooks(filteredBooks);

}

}catch(error){

console.error("books.json not found",error);

}

}

loadBooks();

/*=========================
UTILITY FUNCTION
=========================*/

function byId(id){

return document.getElementById(id);

}

console.log("✅ Script Part 1 Loaded");
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 2
SEARCH + FILTER + BOOKS
=========================================*/

/*=========================
DISPLAY BOOKS
=========================*/

function displayBooks(books){

const container=document.getElementById("booksContainer");

if(!container) return;

container.innerHTML="";

if(books.length===0){

container.innerHTML=`

<div class="no-books">

<h2>No Books Found</h2>

<p>Try another search.</p>

</div>

`;

return;

}

books.forEach(book=>{

container.innerHTML+=`

<div class="book-card">

<img src="${book.cover}" alt="${book.title}">

<div class="book-content">

<span class="book-category">

${book.category}

</span>

<h2>

${book.title}

</h2>

<h3>

${book.author}

</h3>

<p>

${book.description}

</p>

<div class="book-meta">

<span>

👁 ${book.views}

</span>

<span>

❤️ ${book.likes}

</span>

<span>

⬇ ${book.downloads}

</span>

</div>

<div class="book-buttons">

<a href="${book.reader}" class="btn">

Read Online

</a>

<a href="${book.pdf}" download class="btn">

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

const input=document.getElementById("searchInput");

if(!input) return;

const value=input.value.toLowerCase().trim();

filteredBooks=allBooks.filter(book=>

book.title.toLowerCase().includes(value)||

book.author.toLowerCase().includes(value)||

book.category.toLowerCase().includes(value)||

book.language.toLowerCase().includes(value)

);

displayBooks(filteredBooks);

}

/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(category){

document.querySelectorAll(".category").forEach(btn=>{

btn.classList.remove("active");

});

event.target.classList.add("active");

if(category==="All"){

filteredBooks=[...allBooks];

displayBooks(filteredBooks);

return;

}

filteredBooks=allBooks.filter(book=>

book.category===category

);

displayBooks(filteredBooks);

}

/*=========================
FEATURED BOOK
=========================*/

function latestBook(){

const latest=allBooks.find(book=>book.latest===true);

if(!latest) return;

const image=document.querySelector(".book-image img");

const title=document.querySelector(".book-info h2");

const author=document.querySelector(".book-info h3");

const desc=document.querySelector(".book-info p");

const read=document.querySelector(".book-buttons a");

const download=document.querySelectorAll(".book-buttons a")[1];

if(image) image.src=latest.cover;

if(title) title.innerText=latest.title;

if(author) author.innerText=latest.author;

if(desc) desc.innerText=latest.description;

if(read) read.href=latest.reader;

if(download) download.href=latest.pdf;

}

/*=========================
AFTER BOOKS LOAD
=========================*/

setTimeout(()=>{

latestBook();

},800);

console.log("✅ Script Part 2 Loaded");
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 3
PREMIUM AI CHATBOT
=========================================*/

let knowledge=[];

/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge(){

try{

const response=await fetch("knowledge.json");

knowledge=await response.json();

}catch(error){

console.log("knowledge.json not found");

}

}

loadKnowledge();

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn=document.getElementById("chatBtn");
const chatWindow=document.getElementById("chatWindow");
const closeChat=document.getElementById("closeChat");
const chatInput=document.getElementById("chatInput");
const chatMessages=document.getElementById("chatMessages");

/*=========================
OPEN CHAT
=========================*/

if(chatBtn){

chatBtn.onclick=()=>{

chatWindow.style.display="flex";

};

}

/*=========================
CLOSE CHAT
=========================*/

if(closeChat){

closeChat.onclick=()=>{

chatWindow.style.display="none";

};

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
BOOK SEARCH
=========================*/

function searchBook(question){

const q=question.toLowerCase();

for(const book of allBooks){

if(

q.includes(book.title.toLowerCase()) ||

q.includes(book.category.toLowerCase())

){

return `

📚 <b>${book.title}</b><br>

👤 ${book.author}<br>

📂 ${book.category}<br><br>

<a href="${book.reader}" class="btn">

Read Online

</a>

`;

}

}

return null;

}

/*=========================
KNOWLEDGE SEARCH
=========================*/

function searchKnowledge(question){

const q=question.toLowerCase();

for(const item of knowledge){

if(q.includes(item.question.toLowerCase())){

return item.answer;

}

}

return null;

}

/*=========================
BOT MESSAGE
=========================*/

function botReply(text){

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

function userReply(text){

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

function sendMessage(){

const question=chatInput.value.trim();

if(question==="") return;

userReply(question);

chatInput.value="";

setTimeout(()=>{

let reply=searchBook(question);

if(!reply){

reply=searchKnowledge(question);

}

if(!reply){

reply=`

🤖 Sorry,

Mujhe iska jawab abhi database me nahi mila.

`;

}

botReply(reply);

},600);

}

console.log("✅ Script Part 3 Loaded");
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 3
PREMIUM AI CHATBOT
=========================================*/

let knowledge=[];

/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge(){

try{

const response=await fetch("knowledge.json");

knowledge=await response.json();

}catch(error){

console.log("knowledge.json not found");

}

}

loadKnowledge();

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn=document.getElementById("chatBtn");
const chatWindow=document.getElementById("chatWindow");
const closeChat=document.getElementById("closeChat");
const chatInput=document.getElementById("chatInput");
const chatMessages=document.getElementById("chatMessages");

/*=========================
OPEN CHAT
=========================*/

if(chatBtn){

chatBtn.onclick=()=>{

chatWindow.style.display="flex";

};

}

/*=========================
CLOSE CHAT
=========================*/

if(closeChat){

closeChat.onclick=()=>{

chatWindow.style.display="none";

};

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
BOOK SEARCH
=========================*/

function searchBook(question){

const q=question.toLowerCase();

for(const book of allBooks){

if(

q.includes(book.title.toLowerCase()) ||

q.includes(book.category.toLowerCase())

){

return `

📚 <b>${book.title}</b><br>

👤 ${book.author}<br>

📂 ${book.category}<br><br>

<a href="${book.reader}" class="btn">

Read Online

</a>

`;

}

}

return null;

}

/*=========================
KNOWLEDGE SEARCH
=========================*/

function searchKnowledge(question){

const q=question.toLowerCase();

for(const item of knowledge){

if(q.includes(item.question.toLowerCase())){

return item.answer;

}

}

return null;

}

/*=========================
BOT MESSAGE
=========================*/

function botReply(text){

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

function userReply(text){

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

function sendMessage(){

const question=chatInput.value.trim();

if(question==="") return;

userReply(question);

chatInput.value="";

setTimeout(()=>{

let reply=searchBook(question);

if(!reply){

reply=searchKnowledge(question);

}

if(!reply){

reply=`

🤖 Sorry,

Mujhe iska jawab abhi database me nahi mila.

`;

}

botReply(reply);

},600);

}

console.log("✅ Script Part 3 Loaded");
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS
PART 4
FINAL PREMIUM
=========================================*/

/*=========================
SCROLL ANIMATION
=========================*/

const sections=document.querySelectorAll("section");

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show-section");

}

});

},{threshold:.15});

sections.forEach(section=>{

observer.observe(section);

});

/*=========================
BOOK CARD HOVER EFFECT
=========================*/

document.addEventListener("mouseover",(e)=>{

const card=e.target.closest(".book-card");

if(card){

card.style.transform="translateY(-10px)";

}

});

document.addEventListener("mouseout",(e)=>{

const card=e.target.closest(".book-card");

if(card){

card.style.transform="translateY(0px)";

}

});

/*=========================
DOWNLOAD COUNTER
=========================*/

document.addEventListener("click",(e)=>{

if(e.target.innerText.includes("Download")){

const total=Number(localStorage.getItem("downloads"))||0;

localStorage.setItem("downloads",total+1);

}

});

/*=========================
READ COUNTER
=========================*/

document.addEventListener("click",(e)=>{

if(e.target.innerText.includes("Read")){

const total=Number(localStorage.getItem("reads"))||0;

localStorage.setItem("reads",total+1);

}

});

/*=========================
BUTTON RIPPLE EFFECT
=========================*/

document.querySelectorAll(".btn").forEach(btn=>{

btn.addEventListener("click",(e)=>{

const ripple=document.createElement("span");

ripple.className="ripple";

ripple.style.left=e.offsetX+"px";

ripple.style.top=e.offsetY+"px";

btn.appendChild(ripple);

setTimeout(()=>{

ripple.remove();

},600);

});

});

/*=========================
NAVBAR SHADOW
=========================*/

window.addEventListener("scroll",()=>{

const nav=document.querySelector(".navbar");

if(!nav) return;

if(window.scrollY>50){

nav.classList.add("nav-shadow");

}else{

nav.classList.remove("nav-shadow");

}

});

/*=========================
AUTO YEAR
=========================*/

const year=document.querySelector("#year");

if(year){

year.innerHTML=new Date().getFullYear();

}

/*=========================
IMAGE FALLBACK
=========================*/

document.querySelectorAll("img").forEach(img=>{

img.onerror=function(){

this.src="logo.png";

};

});

/*=========================
CONSOLE
=========================*/

console.log("🚀 CHISHTI LIBRARY PREMIUM LOADED");
console.log("✅ Loader");
console.log("✅ Search");
console.log("✅ Categories");
console.log("✅ AI Chatbot");
console.log("✅ Visitor Counter");
console.log("✅ Book Counter");
console.log("✅ Responsive");
console.log("✅ Premium Animations");
console.log("✅ Production Ready");
