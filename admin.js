/*==================================================
CHISHTI LIBRARY
admin.js
PART 1
==================================================*/

/*==========================
ELEMENTS
==========================*/

const totalBooks = document.getElementById("totalBooks");
const totalVisitors = document.getElementById("totalVisitors");
const aiUsers = document.getElementById("aiUsers");

/*==========================
CHECK ADMIN LOGIN
==========================*/

firebase.auth().onAuthStateChanged((user)=>{

    if(!user){

        window.location.href="login.html";

        return;

    }

    loadDashboard();

});

/*==========================
LOAD DASHBOARD
==========================*/

async function loadDashboard(){

    loadBooksCounter();

    loadVisitors();

    loadAIUsers();

}

/*==========================
TOTAL BOOKS
==========================*/

async function loadBooksCounter(){

    const snapshot = await db.collection("books").get();

    totalBooks.innerHTML = snapshot.size;

}

/*==========================
VISITOR COUNTER
==========================*/

async function loadVisitors(){

    const doc = await db.collection("counter")

    .doc("visitors")

    .get();

    if(doc.exists){

        totalVisitors.innerHTML = doc.data().count;

    }else{

        totalVisitors.innerHTML = 0;

    }

}

/*==========================
AI USERS
==========================*/

async function loadAIUsers(){

    const doc = await db.collection("counter")

    .doc("ai")

    .get();

    if(doc.exists){

        aiUsers.innerHTML = doc.data().count;

    }else{

        aiUsers.innerHTML = 0;

    }

}

/*==========================
LOGOUT
==========================*/

document.getElementById("logoutBtn")

.addEventListener("click",()=>{

firebase.auth().signOut()

.then(()=>{

window.location.href="login.html";

});

});
/*==================================================
CHISHTI LIBRARY
admin.js
PART 2
==================================================*/

/*==========================
LIVE BOOK COUNTER
==========================*/

db.collection("books")

.onSnapshot((snapshot)=>{

totalBooks.innerHTML = snapshot.size;

});

/*==========================
LIVE VISITOR COUNTER
==========================*/

db.collection("counter")

.doc("visitors")

.onSnapshot((doc)=>{

if(doc.exists){

totalVisitors.innerHTML = doc.data().count;

}

});

/*==========================
LIVE AI COUNTER
==========================*/

db.collection("counter")

.doc("ai")

.onSnapshot((doc)=>{

if(doc.exists){

aiUsers.innerHTML = doc.data().count;

}

});

/*==========================
LATEST BOOK
==========================*/

async function latestBook(){

const snapshot = await db.collection("books")

.orderBy("created","desc")

.limit(1)

.get();

snapshot.forEach((doc)=>{

console.log("Latest Book :",doc.data().title);

});

}

latestBook();

/*==========================
SEND NOTIFICATION
==========================*/

document

.getElementById("sendNotification")

.addEventListener("click",sendNotification);

async function sendNotification(){

const title =

document.getElementById("notificationTitle").value;

const message =

document.getElementById("notificationMessage").value;

if(title==""){

alert("Enter Notification Title");

return;

}

if(message==""){

alert("Enter Notification");

return;

}

await db.collection("notifications").add({

title:title,

message:message,

time:firebase.firestore.FieldValue.serverTimestamp()

});

alert("Notification Sent");

document.getElementById("notificationTitle").value="";

document.getElementById("notificationMessage").value="";

}

/*==========================
AUTO REFRESH
==========================*/

setInterval(()=>{

loadDashboard();

},10000);

console.log("Admin Panel Ready");
