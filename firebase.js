/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   SINGLE FIREBASE INITIALIZATION
   ========================================================= */

"use strict";

/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.firebasestorage.app",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};


/* =========================================================
   PREVENT DOUBLE INITIALIZATION
   ========================================================= */

if (!firebase.apps.length) {

    firebase.initializeApp(firebaseConfig);

    console.log("✅ Firebase initialized");

} else {

    console.log("✅ Firebase already initialized");

}


/* =========================================================
   FIREBASE SERVICES
   ========================================================= */

const firebaseAuth =
    firebase.auth();

const firebaseDB =
    firebase.firestore();

const firebaseStorage =
    firebase.storage();


/* =========================================================
   GLOBAL ACCESS
   =========================================================
   IMPORTANT:
   Do NOT write:
       const auth = firebase.auth();

   again inside script.js/admin.js.
   ========================================================= */

window.firebaseAuth =
    firebaseAuth;

window.firebaseDB =
    firebaseDB;

window.firebaseStorage =
    firebaseStorage;


/* =========================================================
   OPTIONAL COMMON ALIASES
   =========================================================
   These are attached to window instead of using const,
   preventing "already been declared" errors.
   ========================================================= */

window.auth =
    firebaseAuth;

window.db =
    firebaseDB;

window.storage =
    firebaseStorage;


/* =========================================================
   FIREBASE READY
   ========================================================= */

console.log(
    "======================================"
);

console.log(
    "🔥 CHISHTI LIBRARY FIREBASE"
);

console.log(
    "✅ Firebase App Ready"
);

console.log(
    "✅ Authentication Ready"
);

console.log(
    "✅ Firestore Ready"
);

console.log(
    "✅ Storage Ready"
);

console.log(
    "======================================"
);
