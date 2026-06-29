// =========================
// CHISHTI LIBRARY
// script.js
// =========================

document.addEventListener("DOMContentLoaded", () => {

    // =====================
    // LOADER
    // =====================

    window.addEventListener("load", () => {

        setTimeout(() => {

            document.getElementById("loader").style.display = "none";
            document.getElementById("website").style.display = "block";

        }, 1800);

    });

    // =====================
    // DARK / LIGHT MODE
    // =====================

    const themeBtn = document.getElementById("themeBtn");

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark");
        themeBtn.innerHTML = "☀";
    }

    themeBtn.addEventListener("click",()=>{

        document.body.classList.toggle("dark");

        if(document.body.classList.contains("dark")){

            localStorage.setItem("theme","dark");
            themeBtn.innerHTML="☀";

        }else{

            localStorage.setItem("theme","light");
            themeBtn.innerHTML="🌙";

        }

    });

    // =====================
    // CHAT OPEN / CLOSE
    // =====================

    const chatButton=document.getElementById("chatButton");
    const chatBox=document.getElementById("chatBox");
    const closeChat=document.getElementById("closeChat");

    chatButton.onclick=()=>{

        chatBox.style.display="block";

    }

    closeChat.onclick=()=>{

        chatBox.style.display="none";

    }

    // =====================
    // SEARCH BOOKS
    // =====================

    const search=document.getElementById("searchInput");

    if(search){

        search.addEventListener("keyup",()=>{

            let value=search.value.toLowerCase();

            document.querySelectorAll(".book-card").forEach(card=>{

                let text=card.innerText.toLowerCase();

                if(text.includes(value))
                    card.style.display="block";
                else
                    card.style.display="none";

            });

        });

    }

    // =====================
    // SCROLL ANIMATION
    // =====================

    const sections=document.querySelectorAll("section");

    function reveal(){

        sections.forEach(sec=>{

            let top=sec.getBoundingClientRect().top;

            if(top<window.innerHeight-100){

                sec.classList.add("show");

            }

        });

    }

    window.addEventListener("scroll",reveal);

    reveal();

});
// =========================
// LOAD BOOKS
// =========================

fetch("books.json")
.then(res => res.json())
.then(books => {

    loadFeaturedBooks(books);
    loadLatestBooks(books);

});

// =========================
// FEATURED BOOKS
// =========================

function loadFeaturedBooks(books){

    const container = document.getElementById("featuredBooks");

    if(!container) return;

    container.innerHTML = "";

    books.slice(0,6).forEach(book=>{

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}" alt="${book.title}">

            <h3>${book.title}</h3>

            <p>${book.author}</p>

            <a href="${book.reader}" class="btn">
            📖 Read
            </a>

            <a href="${book.pdf}"
               class="btn download-btn"
               onclick="saveOfflineBook('${book.title}','${book.cover}','${book.pdf}')">

            ⬇ Download

            </a>

        </div>

        `;

    });

}

// =========================
// LATEST BOOKS
// =========================

function loadLatestBooks(books){

    const container=document.getElementById("latestBooks");

    if(!container) return;

    container.innerHTML="";

    books.slice(-6).reverse().forEach(book=>{

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}">

            <h3>${book.title}</h3>

            <p>${book.author}</p>

            <a href="${book.reader}" class="btn">

            📖 Read

            </a>

        </div>

        `;

    });

}

// =========================
// OFFLINE LIBRARY
// =========================

function saveOfflineBook(title,cover,pdf){

    let books =
    JSON.parse(localStorage.getItem("offlineBooks")) || [];

    books.push({

        title,
        cover,
        pdf

    });

    localStorage.setItem(

        "offlineBooks",
        JSON.stringify(books)

    );

}

// =========================
// SHOW OFFLINE BOOKS
// =========================

function loadOfflineBooks(){

    const container =
    document.getElementById("offlineBooks");

    if(!container) return;

    let books =
    JSON.parse(localStorage.getItem("offlineBooks")) || [];

    if(books.length==0){

        return;

    }

    container.innerHTML="";

    books.forEach(book=>{

        container.innerHTML += `

        <div class="book-card">

            <img src="${book.cover}">

            <h3>${book.title}</h3>

            <a href="${book.pdf}" class="btn">

            📖 Open

            </a>

        </div>

        `;

    });

}

loadOfflineBooks();
// ==========================
// CHISHTI AI CHATBOT
// ==========================

const aiInput = document.getElementById("aiInput");
const sendBtn = document.getElementById("sendBtn");
const chatBody = document.getElementById("chatBody");

function addMessage(message, type){

    const div = document.createElement("div");

    div.className = type == "user"
    ? "user-message"
    : "bot-message";

    div.innerHTML = message;

    chatBody.appendChild(div);

    chatBody.scrollTop = chatBody.scrollHeight;

}

function botReply(text){

    let reply = "";

    text = text.toLowerCase();

    if(text.includes("book")){

        reply = "📚 You can read Islamic books from the Books page.";

    }

    else if(text.includes("author")){

        reply = "👤 Author of this library is Hazrat Allama Saim Chishti.";

    }

    else if(text.includes("download")){

        reply = "⬇ Click the Download button under any book.";

    }

    else if(text.includes("offline")){

        reply = "📥 Downloaded books automatically appear in My Offline Library.";

    }

    else if(text.includes("library")){

        reply = "📖 Chishti Library is a free Digital Islamic Library.";

    }

    else if(text.includes("contact")){

        reply = "📞 Visit the Contact page for information.";

    }

    else if(text.includes("about")){

        reply = "ℹ Chishti Library preserves Islamic books and literature.";

    }

    else if(text.includes("home")){

        reply = "🏠 Click Home anytime to return to the main page.";

    }

    else if(text.includes("salam") || text.includes("assalam")){

        reply = "🤲 Wa Alaikum Assalam wa Rahmatullah.";

    }

    else if(text.includes("thanks")){

        reply = "😊 You're Welcome.";

    }

    else{

        reply = "🤖 Sorry, I don't know that yet. Try asking about books, author, download, library or contact.";

    }

    setTimeout(()=>{

        addMessage(reply,"bot");

    },700);

}

function sendMessage(){

    let text = aiInput.value.trim();

    if(text=="") return;

    addMessage(text,"user");

    botReply(text);

    aiInput.value="";

}

sendBtn.addEventListener("click",sendMessage);

aiInput.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});
// ======================================
// SMART AI BOOK SEARCH
// ======================================

let libraryBooks = [];

fetch("books.json")
.then(res => res.json())
.then(data => {
    libraryBooks = data;
});

// ======================================
// SMART AI REPLY
// ======================================

function smartBookSearch(question){

    question = question.toLowerCase();

    for(let book of libraryBooks){

        let title = book.title.toLowerCase();

        if(question.includes(title)){

            return `
            📚 <b>${book.title}</b><br><br>

            👤 Author: ${book.author}<br>
            🌍 Language: ${book.language}<br>
            📂 Category: ${book.category}<br><br>

            <a href="${book.reader}" target="_blank">
            📖 Read Online
            </a>

            <br><br>

            <a href="${book.pdf}" target="_blank">
            ⬇ Download PDF
            </a>
            `;

        }

    }

    return null;

}

// ======================================
// UPDATE BOT REPLY
// ======================================

function botReply(text){

    let reply="";

    let result=smartBookSearch(text);

    if(result){

        addMessage(result,"bot");
        return;

    }

    text=text.toLowerCase();

    if(text.includes("books")){

        reply="📚 Click Books page to explore all Islamic books.";

    }

    else if(text.includes("author")){

        reply="👤 Hazrat Allama Saim Chishti is the author.";

    }

    else if(text.includes("download")){

        reply="⬇ Every book has a Download button.";

    }

    else if(text.includes("offline")){

        reply="📥 Downloaded books automatically appear in Offline Library.";

    }

    else if(text.includes("library")){

        reply="📖 Chishti Library is a free Digital Islamic Library.";

    }

    else if(text.includes("contact")){

        reply="📞 Open the Contact page.";

    }

    else if(text.includes("about")){

        reply="ℹ Chishti Library preserves Islamic literature.";

    }

    else if(text.includes("home")){

        reply="🏠 Click Home to return to the homepage.";

    }

    else if(text.includes("assalam")){

        reply="🤲 Wa Alaikum Assalam wa Rahmatullah.";

    }

    else if(text.includes("thanks")){

        reply="😊 You're Welcome.";

    }

    else{

        reply=`
        🤖 Sorry, I couldn't find that.

        Try asking:

        • Husn-e-Kainat
        • Shahdaye Karbala
        • Shaheed Ibn-e-Shaheed
        • Author
        • Download
        • Library
        `;

    }

    setTimeout(()=>{

        addMessage(reply,"bot");

    },500);

}
// ======================================
// PART 5 - ADVANCED AI
// ======================================

// AI Typing Effect
function typeMessage(message){

    let div=document.createElement("div");
    div.className="bot-message";

    chatBody.appendChild(div);

    let i=0;

    let timer=setInterval(()=>{

        div.innerHTML+=message.charAt(i);

        chatBody.scrollTop=chatBody.scrollHeight;

        i++;

        if(i>=message.length){

            clearInterval(timer);

            saveChat();

        }

    },20);

}

// Greeting
function greeting(){

    let hour=new Date().getHours();

    if(hour<12){

        return "🌅 Good Morning";

    }

    if(hour<18){

        return "☀ Good Afternoon";

    }

    return "🌙 Good Evening";

}

// Welcome Message
window.addEventListener("load",()=>{

    setTimeout(()=>{

        typeMessage(

        greeting() +

        " 👋<br><br>" +

        "Welcome to Chishti Library AI.<br><br>" +

        "You can ask me:<br>" +

        "📚 Book Name<br>" +

        "👤 Author<br>" +

        "⬇ Download<br>" +

        "📖 Read Online<br>" +

        "📂 Category"

        );

    },2200);

});

// Save Chat
function saveChat(){

    localStorage.setItem(

        "chatHistory",

        chatBody.innerHTML

    );

}

// Load Chat
window.addEventListener("load",()=>{

    let history=localStorage.getItem("chatHistory");

    if(history){

        chatBody.innerHTML=history;

    }

});

// Clear Chat
function clearChat(){

    chatBody.innerHTML="";

    localStorage.removeItem("chatHistory");

}

// ===========================
// SMART SEARCH
// ===========================

function smartBookSearch(question){

    question=question.toLowerCase();

    for(let book of libraryBooks){

        let title=book.title.toLowerCase();

        if(

            title.includes(question)

            ||

            question.includes(title)

        ){

            return book;

        }

    }

    return null;

}

// Update Bot Reply
function botReply(question){

    let result=smartBookSearch(question);

    if(result){

        typeMessage(

        "📚 <b>"+result.title+"</b><br><br>"+

        "👤 "+result.author+"<br>"+

        "🌍 "+result.language+"<br>"+

        "📂 "+result.category+"<br><br>"+

        "<a href='"+result.reader+"' target='_blank'>📖 Read Online</a><br><br>"+

        "<a href='"+result.pdf+"' target='_blank'>⬇ Download PDF</a>"

        );

        return;

    }

    typeMessage(

    "🤖 Sorry, I couldn't find that book.<br><br>"+

    "Try searching with another title."

    );

}
// ======================================
// PART 6 - FINAL SCRIPT
// ======================================

// =====================
// AUTO THEME
// =====================

if(window.matchMedia("(prefers-color-scheme:dark)").matches){

    document.body.classList.add("dark");

}

// =====================
// VOICE SEARCH
// =====================

if("webkitSpeechRecognition" in window){

const recognition = new webkitSpeechRecognition();

recognition.lang="en-US";

const mic=document.getElementById("voiceBtn");

if(mic){

mic.onclick=()=>{

recognition.start();

};

}

recognition.onresult=(event)=>{

let text=event.results[0][0].transcript;

document.getElementById("aiInput").value=text;

sendMessage();

};

}

// =====================
// RECOMMEND BOOK
// =====================

function recommendBook(){

if(libraryBooks.length===0) return;

let random=Math.floor(Math.random()*libraryBooks.length);

let book=libraryBooks[random];

typeMessage(

"⭐ Today's Recommendation<br><br>"+

"<b>"+book.title+"</b><br>"+

book.author+"<br><br>"+

"<a href='"+book.reader+"' target='_blank'>📖 Read Online</a>"

);

}

// =====================
// CHAT COMMANDS
// =====================

function commands(text){

text=text.toLowerCase();

if(text==="recommend"){

recommendBook();

return true;

}

if(text==="clear"){

clearChat();

return true;

}

if(text==="offline"){

window.location="#offlineBooks";

return true;

}

return false;

}

// =====================
// SEND MESSAGE UPDATE
// =====================

function sendMessage(){

let text=aiInput.value.trim();

if(text==="") return;

addMessage(text,"user");

if(commands(text)){

aiInput.value="";

return;

}

botReply(text);

aiInput.value="";

}

// =====================
// REFRESH OFFLINE
// =====================

window.addEventListener("focus",()=>{

loadOfflineBooks();

});

// =====================
// SMOOTH LINKS
// =====================

document.querySelectorAll('a[href^="#"]').forEach(link=>{

link.onclick=function(e){

e.preventDefault();

document.querySelector(

this.getAttribute("href")

).scrollIntoView({

behavior:"smooth"

});

};

});

// =====================
// AI READY
// =====================

console.log(

"🤖 Chishti AI Ready"

);
