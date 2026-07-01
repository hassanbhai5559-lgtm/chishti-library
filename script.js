/*==================================
CHISHTI LIBRARY
SCRIPT.JS PART 1
==================================*/

/*==============
LOADER
===============*/

window.addEventListener("load", function () {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.style.opacity = "0";

        loader.style.visibility = "hidden";

    }, 2500);

});

/*==============
MOBILE MENU
===============*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        menu.classList.toggle("show");

    });

}

/*==============
SCROLL TOP
===============*/

const scrollTopBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        scrollTopBtn.style.display = "block";

    } else {

        scrollTopBtn.style.display = "none";

    }

});

scrollTopBtn.onclick = () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

};

/*==============
VISITOR COUNTER
===============*/

let visitors = localStorage.getItem("visitorCount");

if (!visitors) {

    visitors = 1;

} else {

    visitors = Number(visitors) + 1;

}

localStorage.setItem("visitorCount", visitors);

const visitorCounter = document.getElementById("visitorCounter");

let visitorValue = 0;

const visitorAnimation = setInterval(() => {

    visitorValue++;

    visitorCounter.innerHTML = visitorValue;

    if (visitorValue >= visitors) {

        clearInterval(visitorAnimation);

    }

}, 20);

/*==============
BOOK COUNTER
===============*/

const TOTAL_BOOKS = 150;

const bookCounter = document.getElementById("bookCounter");

let bookValue = 0;

const bookAnimation = setInterval(() => {

    bookValue++;

    bookCounter.innerHTML = bookValue;

    if (bookValue >= TOTAL_BOOKS) {

        clearInterval(bookAnimation);

    }

}, 20);
/*==================================
SCRIPT.JS PART 2
SEARCH + CATEGORY + BOOKS
==================================*/

let allBooks = [];

/*==================
LOAD BOOKS
==================*/

async function loadBooks() {

    try {

        const response = await fetch("books.json");

        allBooks = await response.json();

        displayBooks(allBooks);

        document.getElementById("bookCounter").innerHTML = allBooks.length;

    } catch (error) {

        console.log("Books not found.");

    }

}

loadBooks();

/*==================
DISPLAY BOOKS
==================*/

function displayBooks(books) {

    const container = document.getElementById("booksContainer");

    if (!container) return;

    container.innerHTML = "";

    books.forEach(book => {

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <div class="book-content">

                <h2>${book.title}</h2>

                <h3>${book.author}</h3>

                <p>${book.category}</p>

                <a href="${book.pdf}" class="btn">
                Read Book
                </a>

            </div>

        </div>

        `;

    });

}

/*==================
LIVE SEARCH
==================*/

function searchBooks() {

    const value = document
    .getElementById("searchInput")
    .value
    .toLowerCase();

    const result = allBooks.filter(book =>

        book.title.toLowerCase().includes(value) ||

        book.author.toLowerCase().includes(value) ||

        book.category.toLowerCase().includes(value)

    );

    displayBooks(result);

}

/*==================
CATEGORY FILTER
==================*/

function filterBooks(category) {

    document.querySelectorAll(".category")
    .forEach(btn => {

        btn.classList.remove("active");

    });

    event.target.classList.add("active");

    if (category === "All") {

        displayBooks(allBooks);

        return;

    }

    const filtered = allBooks.filter(book =>

        book.category === category

    );

    displayBooks(filtered);

}
/*==================================
SCRIPT.JS PART 3
CHISHTI AI CHATBOT
==================================*/

/*==================
CHAT ELEMENTS
==================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");

/*==================
OPEN CHAT
==================*/

if(chatBtn){

chatBtn.addEventListener("click",()=>{

chatWindow.style.display="flex";

});

}

/*==================
CLOSE CHAT
==================*/

if(closeChat){

closeChat.addEventListener("click",()=>{

chatWindow.style.display="none";

});

}

/*==================
ENTER KEY
==================*/

if(chatInput){

chatInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

}

/*==================
SEND MESSAGE
==================*/

async function sendMessage(){

const text=chatInput.value.trim();

if(text==="") return;

chatMessages.innerHTML+=`

<div class="user-message">

${text}

</div>

`;

chatInput.value="";

chatMessages.scrollTop=chatMessages.scrollHeight;

let reply="";

try{

const response=await fetch("qa.json");

const data=await response.json();

const msg=text.toLowerCase();

const found=data.find(item=>

msg.includes(item.question.toLowerCase())

);

if(found){

reply=found.answer;

}else{

reply="Sorry, mujhe is sawal ka jawab library database me nahi mila.";

}

}catch{

reply="AI Database load nahi ho saka.";

}

setTimeout(()=>{

chatMessages.innerHTML+=`

<div class="bot-message">

${reply}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

},700);

}

/*==================
AUTO SCROLL
==================*/

const observer=new MutationObserver(()=>{

chatMessages.scrollTop=chatMessages.scrollHeight;

});

if(chatMessages){

observer.observe(chatMessages,{

childList:true

});

}
/*==================================
SCRIPT.JS PART 4
FINAL FUNCTIONS
==================================*/

/*==================
BOOK SEARCH FROM AI
==================*/

function findBook(message){

    const text = message.toLowerCase();

    const found = allBooks.find(book =>

        book.title.toLowerCase().includes(text)

    );

    if(found){

        return `
        📚 <b>${found.title}</b><br>
        👤 ${found.author}<br>
        📂 ${found.category}<br><br>

        <a href="${found.pdf}" class="btn">
        Read Book
        </a>
        `;

    }

    return null;

}

/*==================
UPDATE SEND MESSAGE
==================*/

async function sendMessage(){

    const text = chatInput.value.trim();

    if(text=="") return;

    chatMessages.innerHTML += `

    <div class="user-message">

        ${text}

    </div>

    `;

    chatInput.value="";

    chatMessages.scrollTop=chatMessages.scrollHeight;

    let reply = findBook(text);

    if(reply){

        setTimeout(()=>{

            chatMessages.innerHTML += `

            <div class="bot-message">

                ${reply}

            </div>

            `;

            chatMessages.scrollTop=chatMessages.scrollHeight;

        },500);

        return;

    }

    try{

        const response=await fetch("qa.json");

        const qa=await response.json();

        const msg=text.toLowerCase();

        const answer=qa.find(item=>

            msg.includes(item.question.toLowerCase())

        );

        if(answer){

            reply=answer.answer;

        }else{

            reply="📖 Sorry, mujhe iska jawab library me nahi mila.";

        }

    }catch{

        reply="⚠ AI Database Error.";

    }

    setTimeout(()=>{

        chatMessages.innerHTML += `

        <div class="bot-message">

            ${reply}

        </div>

        `;

        chatMessages.scrollTop=chatMessages.scrollHeight;

    },700);

}

/*==================
PAGE ANIMATION
==================*/

window.addEventListener("scroll",()=>{

    document.querySelectorAll("section").forEach(section=>{

        const top = section.getBoundingClientRect().top;

        if(top < window.innerHeight-100){

            section.style.opacity="1";

            section.style.transform="translateY(0px)";

        }

    });

});

/*==================
SECTION DEFAULT
==================*/

document.querySelectorAll("section").forEach(section=>{

    section.style.opacity="0";

    section.style.transform="translateY(40px)";

    section.style.transition=".8s";

});

/*==================
CONSOLE
==================*/

console.log("✅ Chishti Library Loaded Successfully");
