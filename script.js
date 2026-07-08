/*==================================================
CHISHTI LIBRARY 2026
PART 1
RESET + BODY + NAVBAR + HERO
==================================================*/

*{
margin:0;
padding:0;
box-sizing:border-box;
scroll-behavior:smooth;
}

body{

font-family:'Poppins',sans-serif;
background:#f8f9fb;
color:#222;
overflow-x:hidden;

}

/*==========================
SCROLLBAR
==========================*/

::-webkit-scrollbar{

width:8px;

}

::-webkit-scrollbar-track{

background:#eee;

}

::-webkit-scrollbar-thumb{

background:#0b6b3a;
border-radius:20px;

}

/*==========================
NAVBAR
==========================*/

.navbar{

position:fixed;
top:0;
left:0;
width:100%;
height:80px;

display:flex;
justify-content:space-between;
align-items:center;

padding:0 70px;

background:rgba(255,255,255,.95);

backdrop-filter:blur(15px);

box-shadow:0 5px 20px rgba(0,0,0,.08);

z-index:9999;

transition:.4s;

}

.logo{

display:flex;
align-items:center;
gap:15px;

}

.logo img{

width:60px;
height:60px;
border-radius:50%;

}

.logo-text h2{

font-size:22px;
font-weight:700;
color:#0b6b3a;

}

.logo-text span{

font-size:13px;
color:#666;

}

.menu{

display:flex;
gap:35px;
list-style:none;

}

.menu a{

text-decoration:none;
color:#222;
font-weight:600;
transition:.3s;

}

.menu a:hover{

color:#0b6b3a;

}

.mobile-menu{

display:none;
font-size:28px;
cursor:pointer;

}

/*==========================
HERO
==========================*/

.hero{

height:100vh;

background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),

url("images/banner.jpg") center center/cover;

display:flex;
align-items:center;
justify-content:center;
text-align:center;

padding-top:90px;

color:#fff;

}

.hero-content{

max-width:850px;

}

.hero-logo{

width:170px;

margin-bottom:25px;

animation:float 3s ease-in-out infinite;

}

.hero h1{

font-size:62px;
font-weight:800;
letter-spacing:2px;

margin-bottom:10px;

}

.hero h3{

font-size:28px;
font-weight:400;

margin-bottom:20px;

color:#ffd86b;

}

.hero p{

font-size:18px;

line-height:32px;

margin-bottom:40px;

}

/*==========================
SEARCH BOX
==========================*/

.search-box{

width:100%;
max-width:650px;

margin:auto;

background:#fff;

display:flex;
align-items:center;

padding:15px 20px;

border-radius:50px;

box-shadow:0 10px 30px rgba(0,0,0,.18);

}

.search-box i{

font-size:22px;
color:#0b6b3a;

margin-right:15px;

}

.search-box input{

flex:1;
border:none;
outline:none;

font-size:17px;

}

/*==========================
COUNTERS
==========================*/

.counter-area{

display:flex;
justify-content:center;
gap:30px;

margin-top:45px;

flex-wrap:wrap;

}

.counter-card{

background:#fff;

padding:30px;

border-radius:20px;

width:220px;

color:#222;

box-shadow:0 10px 30px rgba(0,0,0,.15);

transition:.4s;

}

.counter-card:hover{

transform:translateY(-10px);

}

.counter-card i{

font-size:35px;

color:#0b6b3a;

margin-bottom:15px;

}

.counter-card h2{

font-size:34px;

color:#0b6b3a;

margin-bottom:8px;

}

.counter-card p{

font-weight:600;

}

/*==========================
BUTTONS
==========================*/

.btn{

display:inline-block;

padding:14px 35px;

background:#0b6b3a;

color:#fff;

text-decoration:none;

border-radius:40px;

font-weight:600;

transition:.3s;

}

.btn:hover{

background:#09552f;

transform:translateY(-3px);

}

/*==========================
SECTION TITLE
==========================*/

.section-title{

text-align:center;

font-size:40px;

font-weight:700;

color:#0b6b3a;

margin-bottom:50px;

}

/*==========================
FLOAT ANIMATION
==========================*/

@keyframes float{

0%{

transform:translateY(0px);

}

50%{

transform:translateY(-12px);

}

100%{

transform:translateY(0px);

}

}
/*==================================================
CHISHTI LIBRARY 2026
PART 1
RESET + BODY + NAVBAR + HERO
==================================================*/

*{
margin:0;
padding:0;
box-sizing:border-box;
scroll-behavior:smooth;
}

body{

font-family:'Poppins',sans-serif;
background:#f8f9fb;
color:#222;
overflow-x:hidden;

}

/*==========================
SCROLLBAR
==========================*/

::-webkit-scrollbar{

width:8px;

}

::-webkit-scrollbar-track{

background:#eee;

}

::-webkit-scrollbar-thumb{

background:#0b6b3a;
border-radius:20px;

}

/*==========================
NAVBAR
==========================*/

.navbar{

position:fixed;
top:0;
left:0;
width:100%;
height:80px;

display:flex;
justify-content:space-between;
align-items:center;

padding:0 70px;

background:rgba(255,255,255,.95);

backdrop-filter:blur(15px);

box-shadow:0 5px 20px rgba(0,0,0,.08);

z-index:9999;

transition:.4s;

}

.logo{

display:flex;
align-items:center;
gap:15px;

}

.logo img{

width:60px;
height:60px;
border-radius:50%;

}

.logo-text h2{

font-size:22px;
font-weight:700;
color:#0b6b3a;

}

.logo-text span{

font-size:13px;
color:#666;

}

.menu{

display:flex;
gap:35px;
list-style:none;

}

.menu a{

text-decoration:none;
color:#222;
font-weight:600;
transition:.3s;

}

.menu a:hover{

color:#0b6b3a;

}

.mobile-menu{

display:none;
font-size:28px;
cursor:pointer;

}

/*==========================
HERO
==========================*/

.hero{

height:100vh;

background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.55)),

url("images/banner.jpg") center center/cover;

display:flex;
align-items:center;
justify-content:center;
text-align:center;

padding-top:90px;

color:#fff;

}

.hero-content{

max-width:850px;

}

.hero-logo{

width:170px;

margin-bottom:25px;

animation:float 3s ease-in-out infinite;

}

.hero h1{

font-size:62px;
font-weight:800;
letter-spacing:2px;

margin-bottom:10px;

}

.hero h3{

font-size:28px;
font-weight:400;

margin-bottom:20px;

color:#ffd86b;

}

.hero p{

font-size:18px;

line-height:32px;

margin-bottom:40px;

}

/*==========================
SEARCH BOX
==========================*/

.search-box{

width:100%;
max-width:650px;

margin:auto;

background:#fff;

display:flex;
align-items:center;

padding:15px 20px;

border-radius:50px;

box-shadow:0 10px 30px rgba(0,0,0,.18);

}

.search-box i{

font-size:22px;
color:#0b6b3a;

margin-right:15px;

}

.search-box input{

flex:1;
border:none;
outline:none;

font-size:17px;

}

/*==========================
COUNTERS
==========================*/

.counter-area{

display:flex;
justify-content:center;
gap:30px;

margin-top:45px;

flex-wrap:wrap;

}

.counter-card{

background:#fff;

padding:30px;

border-radius:20px;

width:220px;

color:#222;

box-shadow:0 10px 30px rgba(0,0,0,.15);

transition:.4s;

}

.counter-card:hover{

transform:translateY(-10px);

}

.counter-card i{

font-size:35px;

color:#0b6b3a;

margin-bottom:15px;

}

.counter-card h2{

font-size:34px;

color:#0b6b3a;

margin-bottom:8px;

}

.counter-card p{

font-weight:600;

}

/*==========================
BUTTONS
==========================*/

.btn{

display:inline-block;

padding:14px 35px;

background:#0b6b3a;

color:#fff;

text-decoration:none;

border-radius:40px;

font-weight:600;

transition:.3s;

}

.btn:hover{

background:#09552f;

transform:translateY(-3px);

}

/*==========================
SECTION TITLE
==========================*/

.section-title{

text-align:center;

font-size:40px;

font-weight:700;

color:#0b6b3a;

margin-bottom:50px;

}

/*==========================
FLOAT ANIMATION
==========================*/

@keyframes float{

0%{

transform:translateY(0px);

}

50%{

transform:translateY(-12px);

}

100%{

transform:translateY(0px);

}

}
/*==================================================
CHISHTI LIBRARY 2026
PART 2
LATEST BOOK + CATEGORIES + BOOKS
==================================================*/

/*==========================
LATEST BOOK
==========================*/

.latest-book{

padding:100px 8%;
background:#fff;

}

.latest-book-card{

display:flex;
align-items:center;
gap:50px;

background:#ffffff;

border-radius:25px;

padding:40px;

box-shadow:0 15px 40px rgba(0,0,0,.08);

flex-wrap:wrap;

}

.book-image{

flex:1;
text-align:center;

}

.book-image img{

width:320px;
max-width:100%;

border-radius:18px;

box-shadow:0 15px 35px rgba(0,0,0,.15);

transition:.4s;

}

.book-image img:hover{

transform:scale(1.05);

}

.book-info{

flex:1;

}

.book-info h2{

font-size:38px;
color:#0b6b3a;
margin-bottom:12px;

}

.book-info h3{

font-size:22px;
color:#666;
margin-bottom:20px;

}

.book-info p{

font-size:17px;
line-height:30px;
margin-bottom:30px;

}

.book-buttons{

display:flex;
gap:20px;
flex-wrap:wrap;

}

/*==========================
CATEGORIES
==========================*/

.categories{

padding:90px 8%;

background:#f7f7f7;

}

.category-grid{

display:flex;

justify-content:center;

flex-wrap:wrap;

gap:15px;

}

.category{

padding:14px 28px;

border:none;

background:#fff;

border-radius:40px;

cursor:pointer;

font-weight:600;

font-size:15px;

transition:.35s;

box-shadow:0 5px 15px rgba(0,0,0,.08);

}

.category:hover{

background:#0b6b3a;

color:#fff;

}

.category.active{

background:#0b6b3a;

color:#fff;

}

/*==========================
BOOK SECTION
==========================*/

.featured-books{

padding:100px 8%;

background:#fff;

}

.books-grid{

display:grid;

grid-template-columns:repeat(auto-fit,minmax(290px,1fr));

gap:35px;

}

/*==========================
BOOK CARD
==========================*/

.book-card{

background:#fff;

border-radius:22px;

overflow:hidden;

box-shadow:0 10px 25px rgba(0,0,0,.08);

transition:.35s;

display:flex;

flex-direction:column;

}

.book-card:hover{

transform:translateY(-10px);

box-shadow:0 18px 45px rgba(0,0,0,.15);

}

.book-card img{

width:100%;

height:420px;

object-fit:cover;

}

.book-info{

padding:25px;

}

.book-info .category{

display:inline-block;

background:#e8f6ef;

color:#0b6b3a;

padding:8px 16px;

border-radius:25px;

font-size:13px;

font-weight:600;

margin-bottom:15px;

}

.book-info h2{

font-size:24px;

margin-bottom:8px;

color:#222;

}

.book-info h3{

font-size:17px;

color:#777;

margin-bottom:15px;

}

.book-info p{

font-size:15px;

line-height:28px;

margin-bottom:22px;

color:#555;

}

.book-buttons{

display:flex;

gap:12px;

flex-wrap:wrap;

}

.book-buttons .btn{

flex:1;

text-align:center;

}

.book-buttons .btn2{

background:#444;

}

.book-buttons .btn2:hover{

background:#222;

}

/*==========================
NO BOOKS
==========================*/

.no-books{

text-align:center;

padding:80px;

font-size:22px;

font-weight:600;

color:#888;

}
/*==================================================
CHISHTI LIBRARY
SCRIPT.JS
PART 2
Search + Categories + AI + Login
==================================================*/

/*==========================
LIVE SEARCH
==========================*/

const searchInput = document.getElementById("searchInput");

if (searchInput) {

    searchInput.addEventListener("keyup", () => {

        const keyword = searchInput.value.toLowerCase();

        const filtered = books.filter(book => {

            return (

                book.title.toLowerCase().includes(keyword) ||

                book.author.toLowerCase().includes(keyword) ||

                book.category.toLowerCase().includes(keyword)

            );

        });

        renderBooks(filtered);

    });

}

/*==========================
RENDER BOOKS
==========================*/

function renderBooks(data){

    if(!booksContainer) return;

    booksContainer.innerHTML="";

    data.forEach(book=>{

        booksContainer.innerHTML += `

<div class="book-card">

<img src="${book.cover}" alt="${book.title}">

<div class="book-info">

<span class="category">${book.category}</span>

<h2>${book.title}</h2>

<h3>${book.author}</h3>

<p>${book.description}</p>

<div class="book-buttons">

<a href="${book.reader}" class="btn" target="_blank">

Read Online

</a>

<a href="${book.pdf}" class="btn" target="_blank">

Download

</a>

</div>

</div>

</div>

`;

    });

}

/*==========================
CATEGORY FILTER
==========================*/

function filterBooks(category){

    document.querySelectorAll(".category").forEach(btn=>{

        btn.classList.remove("active");

    });

    if(event){

        event.target.classList.add("active");

    }

    if(category==="All"){

        renderBooks(books);

        return;

    }

    const filtered=books.filter(book=>{

        return book.category===category;

    });

    renderBooks(filtered);

}

/*==========================
AI CHAT OPEN/CLOSE
==========================*/

const chatBtn=document.getElementById("chatBtn");
const chatWindow=document.getElementById("chatWindow");
const closeChat=document.getElementById("closeChat");

if(chatBtn){

chatBtn.onclick=()=>{

chatWindow.classList.add("show");

};

}

if(closeChat){

closeChat.onclick=()=>{

chatWindow.classList.remove("show");

};

}

/*==========================
AI LOGIN CHECK
==========================*/

let fullAI=false;

auth.onAuthStateChanged(user=>{

if(user){

fullAI=true;

document.getElementById("loginMenu").style.display="none";

document.getElementById("adminMenu").style.display="block";

document.getElementById("dashboardMenu").style.display="block";

}else{

fullAI=false;

}

});

/*==========================
SEND MESSAGE
==========================*/

const sendBtn=document.getElementById("sendBtn");
const userInput=document.getElementById("userInput");
const chatMessages=document.getElementById("chatMessages");

if(sendBtn){

sendBtn.onclick=sendMessage;

}

if(userInput){

userInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

}

function addUser(text){

chatMessages.innerHTML += `

<div class="user-message">

${text}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

}

function addBot(text){

chatMessages.innerHTML += `

<div class="bot-message">

${text}

</div>

`;

chatMessages.scrollTop=chatMessages.scrollHeight;

}

function sendMessage(){

const msg=userInput.value.trim();

if(msg==="") return;

addUser(msg);

userInput.value="";

/*==========================
GUEST MODE
==========================*/

if(!fullAI){

const q=msg.toLowerCase();

if(

q.includes("who is saim chishti") ||

q.includes("husn e kainat") ||

q.includes("assalam") ||

q.includes("aslam") ||

q.includes("aoa")

){

addBot("Hazrat Allama Saim Chishti is a renowned Islamic scholar and writer.");

}else{

addBot("🔒 Please login to use Full Chishti AI.");

}

return;

}

/*==========================
FULL AI
==========================*/

searchBookAI(msg);

}

function searchBookAI(text){

const q=text.toLowerCase();

const found=books.find(book=>

book.title.toLowerCase().includes(q)

);

if(found){

addBot(`

📚 <b>${found.title}</b><br><br>

Author : ${found.author}<br>

Category : ${found.category}<br><br>

<a href="${found.reader}" target="_blank">

Read Online

</a>

`);

return;

}

addBot("AI Answer: "+text);

}

console.log("SCRIPT PART 2 LOADED");
