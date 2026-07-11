/*==================================================
CHISHTI LIBRARY
script.js
PART 1
==================================================*/

/*==============================
ELEMENTS
==============================*/

const booksContainer = document.getElementById("booksContainer");

const latestCover = document.getElementById("latestCover");
const latestTitle = document.getElementById("latestTitle");
const latestAuthor = document.getElementById("latestAuthor");
const latestRead = document.getElementById("latestRead");
const latestDownload = document.getElementById("latestDownload");

const visitorCounter = document.getElementById("visitorCounter");
const bookCounter = document.getElementById("bookCounter");
const aiCounter = document.getElementById("aiCounter");

const searchInput = document.getElementById("searchInput");

/*==============================
GLOBAL
==============================*/

let books = [];
let currentCategory = "All";

/*==============================
START
==============================*/

window.addEventListener("load", () => {

    updateVisitorCounter();

    loadLatestBook();

    loadCounters();

});

/*==============================
VISITOR COUNTER
==============================*/

async function updateVisitorCounter() {

    try {

        const ref = db.collection("counter").doc("visitors");

        const doc = await ref.get();

        if (doc.exists) {

            await ref.update({

                count: firebase.firestore.FieldValue.increment(1)

            });

        } else {

            await ref.set({

                count: 1

            });

        }

    } catch (e) {

        console.log(e);

    }

}

/*==============================
LOAD COUNTERS
==============================*/

function loadCounters() {

    db.collection("counter")

    .doc("visitors")

    .onSnapshot((doc) => {

        if (doc.exists && visitorCounter) {

            visitorCounter.innerHTML = doc.data().count;

        }

    });

    db.collection("books")

    .onSnapshot((snapshot) => {

        if (bookCounter) {

            bookCounter.innerHTML = snapshot.size;

        }

    });

    db.collection("counter")

    .doc("ai")

    .onSnapshot((doc) => {

        if (doc.exists && aiCounter) {

            aiCounter.innerHTML = doc.data().count;

        }

    });

}

/*==============================
LATEST BOOK
==============================*/

async function loadLatestBook() {

    try {

        const snapshot = await db.collection("books")

        .orderBy("created", "desc")

        .limit(1)

        .get();

        snapshot.forEach((doc) => {

            const book = doc.data();

            if (latestCover) latestCover.src = book.cover;

            if (latestTitle) latestTitle.innerHTML = book.title;

            if (latestAuthor) latestAuthor.innerHTML = book.author;

            if (latestRead) latestRead.href = book.reader || book.pdf;

            if (latestDownload) latestDownload.href = book.pdf;

        });

    }

    catch (e) {

        console.log(e);

    }

}

/*==============================
HOME PAGE
==============================*/

/*
Home page par books show nahi hongi.

Sirf Latest Book show hogi.

Books sirf books.html par load hongi.
*/

console.log("Script Part 1 Loaded");
/*==================================================
CHISHTI LIBRARY
script.js
PART 2
BOOKS PAGE
==================================================*/

/*==============================
LOAD BOOKS
==============================*/

async function loadBooks() {

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    books = [];

    try {

        const snapshot = await db.collection("books")
            .orderBy("created", "desc")
            .get();

        snapshot.forEach((doc) => {

            books.push({
                id: doc.id,
                ...doc.data()
            });

        });

        displayBooks(books);

    } catch (e) {

        console.log(e);

    }

}

/*==============================
DISPLAY BOOKS
==============================*/

function displayBooks(list) {

    if (!booksContainer) return;

    booksContainer.innerHTML = "";

    if (list.length === 0) {

        booksContainer.innerHTML = `

        <div class="no-books">

            <h2>No Books Found</h2>

        </div>

        `;

        return;

    }

    list.forEach(book => {

        booksContainer.innerHTML += createBookCard(book);

    });

}

/*==============================
BOOK CARD
==============================*/

function createBookCard(book) {

return `

<div class="book-card fade-up">

<div class="book-image">

<img src="${book.cover}" alt="${book.title}">

</div>

<div class="book-content">

<h3>${book.title}</h3>

<p class="author">

${book.author}

</p>

<p class="category">

${book.category}

</p>

<p class="description">

${book.description || ""}

</p>

<div class="book-buttons">

<a href="${book.reader || book.pdf}"

target="_blank"

class="btn">

Read Online

</a>

<a href="${book.pdf}"

download

class="btn">

Download PDF

</a>

</div>

</div>

</div>

`;

}

/*==============================
AUTO LOAD
==============================*/

if (booksContainer) {

    loadBooks();

}

console.log("Books Page Ready");
/*==================================================
CHISHTI LIBRARY
script.js
PART 3
SEARCH + CATEGORY FILTER
==================================================*/

/*==============================
SEARCH
==============================*/

if(searchInput){

searchInput.addEventListener("keyup",()=>{

filterBooks(currentCategory);

});

}

/*==============================
CATEGORY FILTER
==============================*/

function filterBooks(category){

currentCategory = category;

/* Active Button */

document.querySelectorAll(".category").forEach(btn=>{

btn.classList.remove("active");

if(btn.innerText.trim()===category){

btn.classList.add("active");

}

});

/* Search Text */

let keyword="";

if(searchInput){

keyword=searchInput.value.toLowerCase().trim();

}

/* Filter */

const filtered=books.filter(book=>{

const matchCategory=

category==="All" ||

book.category===category;

const matchSearch=

book.title.toLowerCase().includes(keyword)||

book.author.toLowerCase().includes(keyword)||

book.category.toLowerCase().includes(keyword)||

(book.description||"")

.toLowerCase()

.includes(keyword);

return matchCategory && matchSearch;

});

/* Display */

displayBooks(filtered);

}

/*==============================
CLEAR SEARCH
==============================*/

function clearSearch(){

if(searchInput){

searchInput.value="";

}

filterBooks(currentCategory);

}

/*==============================
AUTO FILTER
==============================*/

if(booksContainer){

setTimeout(()=>{

filterBooks("All");

},500);

}

console.log("Search Ready");
/*==================================================
CHISHTI LIBRARY
script.js
PART 4 (FINAL)
==================================================*/

/*==============================
CHISHTI AI
==============================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

let aiData = [];

/* Load AI Data */

fetch("ai.json")

.then(res => res.json())

.then(data => {

aiData = data;

})

.catch(err => console.log(err));

/* Open */

if(chatBtn){

chatBtn.onclick = () =>{

chatWindow.classList.add("show");

};

}

/* Close */

if(closeChat){

closeChat.onclick = ()=>{

chatWindow.classList.remove("show");

};

}

/* Send */

if(sendBtn){

sendBtn.onclick = sendMessage;

}

if(userInput){

userInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

}

function sendMessage(){

const text = userInput.value.trim();

if(text=="") return;

chatMessages.innerHTML += `

<div class="user-message">

${text}

</div>

`;

userInput.value="";

let reply="Sorry, I don't know the answer.";

const q=text.toLowerCase();

aiData.forEach(item=>{

if(

(item.question && q.includes(item.question.toLowerCase())) ||

(item.roman && q.includes(item.roman.toLowerCase())) ||

(item.urdu && q.includes(item.urdu))

){

reply=item.answer;

}

});

setTimeout(()=>{

chatMessages.innerHTML += `

<div class="bot-message">

${reply}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

increaseAI();

},500);

}

/*==============================
AI COUNTER
==============================*/

async function increaseAI(){

try{

const ref=db.collection("counter").doc("ai");

const doc=await ref.get();

if(doc.exists){

await ref.update({

count:firebase.firestore.FieldValue.increment(1)

});

}else{

await ref.set({

count:1

});

}

}catch(e){

console.log(e);

}

}

/*==============================
SCROLL BUTTON
==============================*/

const scrollBtn=document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

if(!scrollBtn) return;

if(window.scrollY>400){

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

/*==============================
MOBILE MENU
==============================*/

const mobile=document.querySelector(".mobile-menu");

const menu=document.querySelector(".menu");

if(mobile){

mobile.onclick=()=>{

menu.classList.toggle("show");

};

}

/*==============================
FOOTER YEAR
==============================*/

const year=document.getElementById("year");

if(year){

year.innerHTML=new Date().getFullYear();

}

/*==============================
ANIMATION
==============================*/

const observer=new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

});

document.querySelectorAll("section").forEach(sec=>{

observer.observe(sec);

});

console.log("SCRIPT READY");
