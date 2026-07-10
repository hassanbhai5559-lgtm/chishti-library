/*==================================================
CHISHTI LIBRARY
firebase.js
==================================================*/

/*==========================
FIREBASE CONFIG
==========================*/

const firebaseConfig = {

  apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",

  authDomain: "chishti-library.firebaseapp.com",

  projectId: "chishti-library",

  storageBucket: "chishti-library.firebasestorage.app",

  messagingSenderId: "103447043162",

  appId: "1:103447043162:web:f242cd2670aaa9786e8c63",

  measurementId: "G-833P7N3LNT"

};

/*==========================
INITIALIZE FIREBASE
==========================*/

firebase.initializeApp(firebaseConfig);

/*==========================
SERVICES
==========================*/

const auth = firebase.auth();

const db = firebase.firestore();

const storage = firebase.storage();

/*==========================
AUTH SETTINGS
==========================*/

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(() => {

    console.log("Auth Persistence Enabled");

})
.catch((error)=>{

    console.log(error.message);

});

/*==========================
CHECK ADMIN LOGIN
==========================*/

function checkAdmin(){

auth.onAuthStateChanged((user)=>{

if(user){

console.log("Logged In :",user.email);

const adminMenu=document.getElementById("adminMenu");
const dashboardMenu=document.getElementById("dashboardMenu");
const loginMenu=document.getElementById("loginMenu");

if(adminMenu) adminMenu.style.display="block";
if(dashboardMenu) dashboardMenu.style.display="block";
if(loginMenu) loginMenu.style.display="none";

}else{

console.log("Guest User");

const adminMenu=document.getElementById("adminMenu");
const dashboardMenu=document.getElementById("dashboardMenu");
const loginMenu=document.getElementById("loginMenu");

if(adminMenu) adminMenu.style.display="none";
if(dashboardMenu) dashboardMenu.style.display="none";
if(loginMenu) loginMenu.style.display="block";

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

window.location.href="login.html";

})

.catch((error)=>{

alert(error.message);

});

}

/*==========================
GLOBAL VARIABLES
==========================*/

window.auth = auth;
window.db = db;
window.storage = storage;
window.logout = logout;
window.checkAdmin = checkAdmin;

/*==========================
READY
==========================*/

console.log("================================");

console.log("CHISHTI LIBRARY");

console.log("Firebase Connected Successfully");

console.log("================================");
