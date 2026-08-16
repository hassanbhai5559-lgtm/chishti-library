"use strict";

/*
=========================================================
CHISHTI LIBRARY - FIREBASE CONFIG
=========================================================
IMPORTANT:
firebaseConfig sirf isi file mein hona chahiye.
books.html ya book.js mein dobara mat likhna.
=========================================================
*/

const firebaseConfig = {
    apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",
    authDomain: "chishti-library.firebaseapp.com",
    projectId: "chishti-library",
    storageBucket: "chishti-library.firebasestorage.app",
    messagingSenderId: "103447043162",
    appId: "1:103447043162:web:f242cd2670aaa9786e8c63",
    measurementId: "G-833P7N3LNT"
};


/*
=========================================================
INITIALIZE FIREBASE ONLY ONCE
=========================================================
*/

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}


/*
=========================================================
GLOBAL FIREBASE SERVICES
=========================================================
*/

window.db = firebase.firestore();
window.auth = firebase.auth();

window.firebaseReady = true;


/*
=========================================================
GLOBAL HELPERS
=========================================================
*/

window.firebaseServerTimestamp =
    firebase.firestore.FieldValue.serverTimestamp;

window.firebaseIncrement =
    firebase.firestore.FieldValue.increment;


/*
=========================================================
AUTH STATE
=========================================================
*/

window.currentFirebaseUser = null;

window.auth.onAuthStateChanged(function(user) {

    window.currentFirebaseUser = user || null;

    window.dispatchEvent(
        new CustomEvent("firebaseAuthChanged", {
            detail: {
                user: user || null
            }
        })
    );

    if (user) {

        console.log(
            "✅ Logged in:",
            user.email || user.uid
        );

    } else {

        console.log(
            "ℹ️ No user logged in"
        );

    }

});


/*
=========================================================
LOGIN REQUIRED
=========================================================
*/

window.requireLogin = function() {

    if (window.currentFirebaseUser) {
        return true;
    }

    const goLogin = confirm(
        "Please login first to use this feature.\n\nOK = Login"
    );

    if (goLogin) {

        window.location.href =
            "./login.html";

    }

    return false;
};


/*
=========================================================
FIREBASE ERROR LOGGER
=========================================================
*/

window.firebaseError = function(error, context) {

    console.error(
        "🔥 Firebase Error:",
        context || "",
        error
    );

};


/*
=========================================================
READY
=========================================================
*/

console.log(
    "===================================="
);

console.log(
    "🔥 CHISHTI LIBRARY FIREBASE"
);

console.log(
    "✅ Firebase initialized"
);

console.log(
    "✅ Firestore ready"
);

console.log(
    "✅ Authentication ready"
);

console.log(
    "===================================="
);
