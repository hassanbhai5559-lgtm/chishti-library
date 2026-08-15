"use strict";

/* =========================================
   CHISHTI LIBRARY FIREBASE
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",
    authDomain: "chishti-library.firebaseapp.com",
    projectId: "chishti-library",
    storageBucket: "chishti-library.firebasestorage.app",
    messagingSenderId: "103447043162",
    appId: "1:103447043162:web:f242cd2670aaa9786e8c63",
    measurementId: "G-833P7N3LNT"
};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


/* =========================================
   FIRESTORE
========================================= */

const db = firebase.firestore();

window.chishtiDB = db;

console.log("🔥 Firebase Connected");
console.log("📚 Chishti Library Firestore Ready");
