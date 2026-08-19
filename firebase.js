"use strict";

/*
=========================================================
CHISHTI LIBRARY - FIREBASE CONFIG
=========================================================
IMPORTANT:

firebaseConfig sirf isi file mein hoga.

Firebase ko sirf ek baar initialize kiya jayega.

Other files:
- books.js
- book.js
- login.js
- profile.js
- chatbot.js
- reader.js

Firebase ko yahan se use karenge.
=========================================================
*/


/*
=========================================================
FIREBASE CONFIG
=========================================================
*/

const firebaseConfig = {

    apiKey: "AIzaSyD0h4LFzHbInFRMgtjosgSbGgoBxNwFbGU",

    authDomain:
        "chishti-library.firebaseapp.com",

    projectId:
        "chishti-library",

    storageBucket:
        "chishti-library.firebasestorage.app",

    messagingSenderId:
        "103447043162",

    appId:
        "1:103447043162:web:f242cd2670aaa9786e8c63",

    measurementId:
        "G-833P7N3LNT"
};


/*
=========================================================
INITIALIZE FIREBASE ONLY ONCE
=========================================================
*/

if (!firebase.apps.length) {

    firebase.initializeApp(
        firebaseConfig
    );

}


/*
=========================================================
GLOBAL FIREBASE SERVICES
=========================================================
*/

window.db =
    firebase.firestore();

window.auth =
    firebase.auth();

window.firebaseReady =
    true;


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
CURRENT USER
=========================================================
*/

window.currentFirebaseUser =
    null;


/*
=========================================================
AUTH STATE
=========================================================
*/

window.auth.onAuthStateChanged(
    function(user) {

        window.currentFirebaseUser =
            user || null;


        /*
        ---------------------------------------------
        SEND EVENT TO OTHER CHISHTI LIBRARY FILES
        ---------------------------------------------
        */

        window.dispatchEvent(
            new CustomEvent(
                "firebaseAuthChanged",
                {
                    detail: {
                        user: user || null
                    }
                }
            )
        );


        /*
        ---------------------------------------------
        CONSOLE
        ---------------------------------------------
        */

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

    }
);


/*
=========================================================
LOGIN REQUIRED
=========================================================
*/

window.requireLogin =
    function() {

        if (
            window.currentFirebaseUser
        ) {

            return true;

        }


        const goLogin =
            confirm(
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

window.firebaseError =
    function(error, context) {

        console.error(
            "🔥 Firebase Error:",
            context || "",
            error
        );

    };


/*
=========================================================
NAVIGATION LOGIN / USER EMAIL
=========================================================
*/

function updateLoginNavigation(user) {

    const loginNav =
        document.getElementById(
            "loginNav"
        );


    /*
    ---------------------------------------------
    LOGIN ELEMENT DOES NOT EXIST
    ---------------------------------------------
    */

    if (!loginNav) {

        return;

    }


    /*
    ---------------------------------------------
    USER LOGGED IN
    ---------------------------------------------
    */

    if (user) {

        const email =
            user.email || "User";


        loginNav.innerHTML = `

            <i class="fa-solid fa-envelope"></i>

            <span>
                ${email}
            </span>

        `;


        loginNav.href =
            "#";

        loginNav.classList.add(
            "user-email"
        );


        /*
        Optional:
        */

        loginNav.title =
            "Logged in as " + email;


    }

    /*
    ---------------------------------------------
    USER LOGGED OUT
    ---------------------------------------------
    */

    else {

        loginNav.innerHTML = `

            <i class="fa-solid fa-right-to-bracket"></i>

            <span>
                Login
            </span>

        `;


        loginNav.href =
            "./login.html";


        loginNav.classList.remove(
            "user-email"
        );


        loginNav.removeAttribute(
            "title"
        );

    }

}


/*
=========================================================
UPDATE NAV WHEN AUTH CHANGES
=========================================================
*/

window.addEventListener(
    "firebaseAuthChanged",
    function(event) {

        updateLoginNavigation(
            event.detail.user
        );

    }
);


/*
=========================================================
INITIAL NAV CHECK
=========================================================
*/

updateLoginNavigation(
    window.currentFirebaseUser
);


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
    "✅ Auth navigation ready"
);

console.log(
    "===================================="
);
