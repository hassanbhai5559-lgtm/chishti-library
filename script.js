/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 1
=========================================*/

/*=========================
GLOBAL VARIABLES
=========================*/

let books = [];
let knowledge = [];

/*=========================
LOADER
=========================*/

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if(loader){

        setTimeout(() => {

            loader.classList.add("hide");

        },1500);

    }

});

/*=========================
NAVBAR
=========================*/

const menuBtn = document.querySelector(".mobile-menu");
const menu = document.querySelector(".menu");

if(menuBtn){

    menuBtn.onclick = () => {

        menu.classList.toggle("show");

    }

}

/*=========================
NAVBAR SCROLL
=========================*/

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

    if(!navbar) return;

    if(window.scrollY>50){

        navbar.classList.add("active");

    }else{

        navbar.classList.remove("active");

    }

});

/*=========================
LOAD BOOKS
=========================*/

async function loadBooks(){

    try{

        const response = await fetch("books.json");

        books = await response.json();

        renderBooks(books);

        updateBookCounter();

    }catch(e){

        console.log("books.json not found");

    }

}

/*=========================
LOAD KNOWLEDGE
=========================*/

async function loadKnowledge(){

    try{

        const response = await fetch("knowledge.json");

        knowledge = await response.json();

    }catch(e){

        console.log("knowledge.json not found");

    }

}

/*=========================
START
=========================*/

loadBooks();
loadKnowledge();

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 2
BOOK SYSTEM
=========================================*/

/*=========================
BOOK COUNTER
=========================*/

function updateBookCounter(){

    const counter=document.getElementById("bookCounter");

    if(!counter) return;

    let current=0;

    const total=books.length;

    const timer=setInterval(()=>{

        current++;

        counter.innerHTML=current;

        if(current>=total){

            clearInterval(timer);

        }

    },40);

}

/*=========================
RENDER BOOKS
=========================*/

function renderBooks(data){

    const container=document.getElementById("booksContainer");

    if(!container) return;

    container.innerHTML="";

    if(data.length===0){

        container.innerHTML="<h2 style='text-align:center;'>No Books Found</h2>";

        return;

    }

    data.forEach(book=>{

        container.innerHTML+=`

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <div class="book-info">

                <span class="category">${book.category}</span>

                <h2>${book.title}</h2>

                <h3>${book.author}</h3>

                <p>${book.description}</p>

                <div class="book-buttons">

                    <a href="${book.reader}" class="btn">
                    Read Online
                    </a>

                    <a href="${book.pdf}" download class="btn">
                    Download PDF
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

const searchInput=document.getElementById("searchInput");

if(searchInput){

searchInput.addEventListener("keyup",()=>{

const keyword=searchInput.value.toLowerCase();

const filtered=books.filter(book=>

book.title.toLowerCase().includes(keyword)||

book.author.toLowerCase().includes(keyword)||

book.category.toLowerCase().includes(keyword)

);

renderBooks(filtered);

});

}

/*=========================
CATEGORY FILTER
=========================*/

function filterBooks(category){

if(category==="All"){

renderBooks(books);

return;

}

const filtered=books.filter(book=>

book.category===category

);

renderBooks(filtered);

}

/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 3
CHISHTI AI
=========================================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages") || document.getElementById("messages");
const typing = document.getElementById("typing");

/*=========================
OPEN / CLOSE
=========================*/

if(chatBtn){

chatBtn.onclick=()=>{

chatWindow.style.display="flex";

};

}

if(closeChat){

closeChat.onclick=()=>{

chatWindow.style.display="none";

};

}

/*=========================
ENTER KEY
=========================*/

if(userInput){

userInput.addEventListener("keypress",function(e){

if(e.key==="Enter"){

sendMessage();

}

});

}

/*=========================
SEND MESSAGE
=========================*/

function sendMessage(){

const msg=userInput.value.trim();

if(msg==="") return;

chatMessages.innerHTML+=`

<div class="user-message">

${msg}

</div>

`;

userInput.value="";

chatMessages.scrollTop=chatMessages.scrollHeight;

typing.style.display="block";

setTimeout(()=>{

typing.style.display="none";

replyAI(msg);

},600);

}

/*=========================
AI REPLY
=========================*/

function replyAI(message){

const msg=message.toLowerCase();

/* BOOK SEARCH */

const foundBook=books.find(book=>

book.title.toLowerCase().includes(msg)

);

if(foundBook){

chatMessages.innerHTML+=`

<div class="bot-message">

<img src="images/chishti-ai-logo.png" class="bot-avatar">

<b>📚 ${foundBook.title}</b><br><br>

Author : ${foundBook.author}<br>

Category : ${foundBook.category}<br><br>

<a href="${foundBook.reader}" class="btn">

Read Online

</a>

&nbsp;

<a href="${foundBook.pdf}" class="btn">

Download

</a>

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

return;

}

/* KNOWLEDGE */

for(const item of knowledge){

if(item.keywords){

for(const key of item.keywords){

if(msg.includes(key.toLowerCase())){

chatMessages.innerHTML+=`

<div class="bot-message">

<img src="images/chishti-ai-logo.png" class="bot-avatar">

${item.answer_en || item.answer || item.answer_ur || item.answer_hi}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

return;

}

}

}

}

/* DEFAULT */

chatMessages.innerHTML+=`

<div class="bot-message">

<img src="images/chishti-ai-logo.png" class="bot-avatar">

🤖 Sorry, mujhe iska jawab abhi Knowledge Base me nahi mila.<br><br>

You can ask me about:<br>

📚 Books<br>

👤 Authors<br>

🕌 Islam<br>

📖 Chishti Library

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

}
/*=========================================
CHISHTI LIBRARY
SCRIPT.JS PART 3
AI CHATBOT SYSTEM
=========================================*/

/*=========================
CHAT ELEMENTS
=========================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");
const typing = document.getElementById("typing");

/*=========================
OPEN CHAT
=========================*/

if(chatBtn){

chatBtn.onclick = () => {

chatWindow.classList.add("show");

}

}

/*=========================
CLOSE CHAT
=========================*/

if(closeChat){

closeChat.onclick = () => {

chatWindow.classList.remove("show");

}

}

/*=========================
ENTER KEY
=========================*/

if(userInput){

userInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

}

/*=========================
ADD USER MESSAGE
=========================*/

function addUserMessage(text){

messages.innerHTML += `

<div class="user-message">
${text}
</div>

`;

messages.scrollTop = messages.scrollHeight;

}

/*=========================
ADD BOT MESSAGE
=========================*/

function addBotMessage(text){

messages.innerHTML += `

<div class="bot-message">

<img src="images/chishti-ai-logo.png" style="width:25px;">

${text}

</div>

`;

messages.scrollTop = messages.scrollHeight;

}

/*=========================
BOOK SEARCH INSIDE AI
=========================*/

function findBook(msg){

return books.find(b =>

msg.includes(b.title.toLowerCase()) ||

msg.includes(b.category.toLowerCase())

);

}

/*=========================
AI RESPONSE ENGINE
=========================*/

function getAIResponse(message){

const msg = message.toLowerCase();

/* BOOK SEARCH */

const book = findBook(msg);

if(book){

return `📚 <b>${book.title}</b><br>
👤 ${book.author}<br>
📂 ${book.category}<br><br>
<a href="${book.reader}" target="_blank">Read Online</a>
`;

}

/* KEYWORDS */

for(let k of knowledge){

if(k.question && msg.includes(k.question.toLowerCase())){

return k.answer;

}

}

return "🤖 Sorry, mujhe iska jawab nahi mila. Try Books, Authors, Chishti Library.";
}

/*=========================
SEND MESSAGE
=========================*/

function sendMessage(){

const text = userInput.value.trim();

if(text==="") return;

addUserMessage(text);

userInput.value="";

typing.style.display="block";

setTimeout(()=>{

typing.style.display="none";

addBotMessage(getAIResponse(text));

},600);

}
