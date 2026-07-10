/*==================================================
CHISHTI LIBRARY
SCRIPT.JS
PART 1
==================================================*/

/*==========================
CURRENT YEAR
==========================*/

document.getElementById("year").innerHTML =
new Date().getFullYear();

/*==========================
NAVBAR SCROLL
==========================*/

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll",()=>{

if(window.scrollY>50){

navbar.classList.add("active");

}else{

navbar.classList.remove("active");

}

});

/*==========================
SCROLL TOP BUTTON
==========================*/

const scrollBtn =
document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>500){

scrollBtn.style.display="block";

}else{

scrollBtn.style.display="none";

}

});

scrollBtn.onclick=()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

};

/*==========================
MOBILE MENU
==========================*/

const mobileBtn =
document.querySelector(".mobile-menu");

const menu =
document.querySelector(".menu");

mobileBtn.onclick=()=>{

menu.classList.toggle("show");

};

/*==========================
SEARCH BOOKS
==========================*/

const searchInput =
document.getElementById("searchInput");

searchInput.addEventListener("keyup",()=>{

const value =
searchInput.value.toLowerCase();

const books =
document.querySelectorAll(".book-card");

books.forEach((book)=>{

const text =
book.innerText.toLowerCase();

book.style.display =
text.includes(value)
?
"block"
:
"none";

});

});

/*==========================
FIREBASE CHECK
==========================*/

if(typeof firebase!=="undefined"){

console.log("Firebase Connected");

}else{

console.log("Firebase Not Connected");

}
/*==================================================
CHISHTI LIBRARY
SCRIPT.JS
PART 2
FIREBASE BOOKS
==================================================*/

/*==========================
VISITOR COUNTER
==========================*/

const visitorRef = db.collection("counter").doc("visitors");

visitorRef.get().then((doc)=>{

if(doc.exists){

let count = doc.data().count + 1;

visitorRef.update({

count:count

});

document.getElementById("visitorCounter").innerHTML = count;

}else{

visitorRef.set({

count:1

});

document.getElementById("visitorCounter").innerHTML = 1;

}

});

/*==========================
BOOK COUNTER
==========================*/

db.collection("books")

.onSnapshot((snapshot)=>{

document.getElementById("bookCounter").innerHTML =
snapshot.size;

});

/*==========================
LOAD BOOKS
==========================*/

const booksContainer =
document.getElementById("booksContainer");

function loadBooks(){

booksContainer.innerHTML="";

db.collection("books")

.orderBy("time","desc")

.get()

.then((snapshot)=>{

snapshot.forEach((doc)=>{

const book = doc.data();

booksContainer.innerHTML += `

<div class="book-card"
data-category="${book.category}">

<img src="${book.cover}">

<div class="book-card-content">

<span class="book-category">

${book.category}

</span>

<h3>

${book.title}

</h3>

<p>

${book.author}

</p>

<div class="book-actions">

<a
href="${book.pdf}"
target="_blank"
class="btn">

Read

</a>

<a
href="${book.pdf}"
download
class="btn btn2">

Download

</a>

</div>

</div>

</div>

`;

});

});

}

loadBooks();

/*==========================
LATEST BOOK
==========================*/

db.collection("books")

.orderBy("time","desc")

.limit(1)

.get()

.then((snapshot)=>{

snapshot.forEach((doc)=>{

const b = doc.data();

document.getElementById("latestCover").src = b.cover;

document.getElementById("latestTitle").innerHTML = b.title;

document.getElementById("latestAuthor").innerHTML = b.author;

document.getElementById("latestRead").href = b.pdf;

document.getElementById("latestDownload").href = b.pdf;

});

});

/*==========================
CATEGORY FILTER
==========================*/

function filterBooks(category){

const cards =
document.querySelectorAll(".book-card");

cards.forEach((card)=>{

if(category=="All"){

card.style.display="block";

}else{

if(card.dataset.category==category){

card.style.display="block";

}else{

card.style.display="none";

}

}

});

}
/*==================================================
CHISHTI LIBRARY
SCRIPT.JS
PART 3
AI + LOGIN + ADMIN
==================================================*/

/*==========================
CHAT WINDOW
==========================*/

const chatBtn = document.getElementById("chatBtn");
const chatWindow = document.getElementById("chatWindow");
const closeChat = document.getElementById("closeChat");

chatBtn.onclick = () => {

chatWindow.style.display = "flex";

};

closeChat.onclick = () => {

chatWindow.style.display = "none";

};

/*==========================
AI QUESTIONS LIMIT
==========================*/

let aiQuestions = Number(localStorage.getItem("aiQuestions")) || 0;

let userLoggedIn = false;

auth.onAuthStateChanged((user)=>{

if(user){

userLoggedIn = true;

document.getElementById("loginMenu").style.display="none";

document.getElementById("adminMenu").style.display="block";

}else{

userLoggedIn = false;

}

});

/*==========================
SEND MESSAGE
==========================*/

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

sendBtn.onclick = sendMessage;

userInput.addEventListener("keypress",(e)=>{

if(e.key==="Enter"){

sendMessage();

}

});

function sendMessage(){

const msg = userInput.value.trim();

if(msg==="") return;

/* Guest Limit */

if(!userLoggedIn){

if(aiQuestions>=3){

chatMessages.innerHTML += `

<div class="bot-message">

You have used your 3 free questions.<br><br>

Please Login to continue using Chishti AI.

</div>

`;

userInput.value="";

return;

}

aiQuestions++;

localStorage.setItem("aiQuestions",aiQuestions);

}

/* User Message */

chatMessages.innerHTML += `

<div class="user-message">

${msg}

</div>

`;

userInput.value="";

document.getElementById("typing").style.display="block";

/* AI Reply */

setTimeout(()=>{

document.getElementById("typing").style.display="none";

chatMessages.innerHTML += `

<div class="bot-message">

Searching answer...

</div>

`;

chatMessages.scrollTop = chatMessages.scrollHeight;

},1500);

}

/*==========================
ADMIN MENU
==========================*/

auth.onAuthStateChanged((user)=>{

if(user){

document.getElementById("adminMenu").style.display="block";

document.getElementById("dashboardMenu").style.display="block";

}else{

document.getElementById("adminMenu").style.display="none";

document.getElementById("dashboardMenu").style.display="none";

}

});

/*==========================
BOOK NOTIFICATION
==========================*/

db.collection("books")

.orderBy("time","desc")

.limit(1)

.onSnapshot((snapshot)=>{

snapshot.forEach((doc)=>{

const book = doc.data();

console.log("Latest Book:",book.title);

/* Future Notification */

});

});
/*==================================================
CHISHTI LIBRARY
SCRIPT.JS
PART 4 FINAL
==================================================*/

/*==========================
AI USAGE COUNTER
==========================*/

const aiCounterRef =
db.collection("counter").doc("ai");

function increaseAICounter(){

aiCounterRef.get().then((doc)=>{

if(doc.exists){

let total = doc.data().count + 1;

aiCounterRef.update({

count:total

});

document.getElementById("aiCounter").innerHTML = total;

}else{

aiCounterRef.set({

count:1

});

document.getElementById("aiCounter").innerHTML = 1;

}

});

}

/*==========================
LOGOUT
==========================*/

function logout(){

auth.signOut()

.then(()=>{

alert("Logout Successful");

window.location="index.html";

});

}

/*==========================
LOGIN CHECK
==========================*/

auth.onAuthStateChanged((user)=>{

if(user){

console.log("Welcome :",user.email);

}else{

console.log("Guest User");

}

});

/*==========================
NOTIFICATIONS
==========================*/

if("Notification" in window){

Notification.requestPermission();

}

function showNotification(title){

if(Notification.permission==="granted"){

new Notification(title,{

body:"New Book Uploaded",

icon:"logo.png"

});

}

}

/*==========================
NEW BOOK LISTENER
==========================*/

db.collection("books")

.orderBy("time","desc")

.limit(1)

.onSnapshot((snapshot)=>{

snapshot.forEach((doc)=>{

const latest = doc.data();

showNotification(latest.title);

});

});

/*==========================
INITIALIZE WEBSITE
==========================*/

window.onload=()=>{

loadBooks();

checkAdmin();

console.log("Chishti Library Loaded");

};

/*==========================
END
==========================*/

console.log("Script Loaded Successfully"); 
