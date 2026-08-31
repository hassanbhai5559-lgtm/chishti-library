/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   Firebase Auth + Firestore + Storage
========================================================= */

"use strict";

/* =========================================================
   FIREBASE CONFIG
   IMPORTANT:
   Replace ONLY the values below with the config from
   Firebase Console → Project settings → Your apps → Web app
========================================================= */

const firebaseConfig = {
    apiKey: "PASTE_YOUR_REAL_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};


/* =========================================================
   INITIALIZE FIREBASE
========================================================= */

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

} else {

    console.log("🔥 Firebase already initialized.");

}


/* =========================================================
   SERVICES
========================================================= */

const auth = firebase.auth();

const db = firebase.firestore();

const storage = firebase.storage();


/* =========================================================
   GLOBAL ACCESS
   admin.js can use these directly
========================================================= */

window.firebaseApp = firebase.app();

window.auth = auth;

window.db = db;

window.storage = storage;


/* =========================================================
   FIREBASE STATUS
========================================================= */

console.log("======================================");
console.log("📚 CHISHTI LIBRARY FIREBASE");
console.log("======================================");

console.log(
    "✅ Chishti Firebase initialized"
);

console.log(
    "🔥 Firestore:",
    !!db
);

console.log(
    "🔥 Storage:",
    !!storage
);

console.log(
    "🔥 Auth:",
    !!auth
);

console.log("======================================");


/* =========================================================
   AUTH STATE
========================================================= */

auth.onAuthStateChanged(function (user) {

    if (user) {

        console.log(
            "👤 Admin authenticated:",
            user.email
        );

    } else {

        console.log(
            "👤 No admin currently logged in."
        );

    }

});

