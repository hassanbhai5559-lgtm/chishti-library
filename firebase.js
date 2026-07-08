/*==================================================
CHISHTI LIBRARY
firebase.js
==================================================*/

const firebaseConfig = {
  apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",
  authDomain: "chishti-library.firebaseapp.com",
  projectId: "chishti-library",
  storageBucket: "chishti-library.firebasestorage.app",
  messagingSenderId: "103447043162",
  appId: "1:103447043162:web:f242cd2670aaa9786e8c63",
  measurementId: "G-833P7N3LNT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Login Persistence
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

// Export
window.auth = auth;
window.db = db;
window.storage = storage;

// Logout
function logout() {
    auth.signOut().then(() => {
        window.location.href = "login.html";
    });
}

window.logout = logout;

// Check Login
auth.onAuthStateChanged((user) => {

    if (user) {

        console.log("✅ Admin Login:", user.email);

        const adminMenu = document.getElementById("adminMenu");
        const dashboardMenu = document.getElementById("dashboardMenu");
        const loginMenu = document.getElementById("loginMenu");

        if(adminMenu) adminMenu.style.display="block";
        if(dashboardMenu) dashboardMenu.style.display="block";
        if(loginMenu) loginMenu.style.display="none";

    } else {

        console.log("Guest Mode");

    }

});

console.log("🔥 Firebase Connected Successfully");
