/* ==================================================
   CHISHTI LIBRARY
   USER LOGIN
   GOOGLE AUTHENTICATION
================================================== */


/* ==================================================
   FIREBASE IMPORTS
================================================== */

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    signInAnonymously
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* ==================================================
   FIREBASE CONFIG
================================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSy0d4HlfzHbInFRMgtjosgSbGgoBxNwFbGU",

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


/* ==================================================
   INITIALIZE FIREBASE
================================================== */

const app =
    initializeApp(firebaseConfig);


/* ==================================================
   FIREBASE AUTH
================================================== */

const auth =
    getAuth(app);


/* ==================================================
   FIRESTORE
================================================== */

const db =
    getFirestore(app);


/* ==================================================
   GOOGLE PROVIDER
================================================== */

const googleProvider =
    new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: "select_account"
});


/* ==================================================
   ELEMENTS
================================================== */

const googleLoginBtn =
    document.getElementById(
        "googleLoginBtn"
    );

const guestBtn =
    document.getElementById(
        "guestBtn"
    );

const messageBox =
    document.getElementById(
        "message"
    );

const loadingBox =
    document.getElementById(
        "loading"
    );


/* ==================================================
   MESSAGE
================================================== */

function showMessage(
    text,
    type = "error"
) {

    messageBox.innerText =
        text;

    messageBox.className =
        "message " + type;

}


/* ==================================================
   CLEAR MESSAGE
================================================== */

function clearMessage() {

    messageBox.innerText = "";

    messageBox.className =
        "message";

}


/* ==================================================
   LOADING
================================================== */

function setLoading(
    loading
) {

    if (loading) {

        loadingBox.style.display =
            "block";

        googleLoginBtn.disabled =
            true;

        guestBtn.disabled =
            true;

    } else {

        loadingBox.style.display =
            "none";

        googleLoginBtn.disabled =
            false;

        guestBtn.disabled =
            false;

    }

}


/* ==================================================
   SAVE USER IN FIRESTORE
================================================== */

async function saveUser(
    user
) {

    if (!user) {
        return;
    }

    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );

        await setDoc(
            userRef,
            {

                uid:
                    user.uid,

                name:
                    user.displayName || "User",

                email:
                    user.email || "",

                photoURL:
                    user.photoURL || "",

                lastLogin:
                    serverTimestamp()

            },
            {
                merge: true
            }
        );

    } catch (error) {

        console.error(
            "Firestore user save error:",
            error
        );

        /*
         User login should still work even
         if Firestore rules are not ready.
        */

    }

}


/* ==================================================
   GOOGLE LOGIN
================================================== */

async function googleLogin() {

    clearMessage();

    setLoading(true);

    try {

        const result =
            await signInWithPopup(
                auth,
                googleProvider
            );

        const user =
            result.user;

        await saveUser(
            user
        );

        showMessage(
            "Login successful. Redirecting...",
            "success"
        );

        setTimeout(
            () => {

                window.location.href =
                    "index.html";

            },
            700
        );

    } catch (error) {

        console.error(
            "Google login error:",
            error
        );

        setLoading(false);

        let errorMessage =
            "Google login failed.";

        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            errorMessage =
                "Login window close kar di gayi.";

        }

        else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            errorMessage =
                "Browser ne Google login popup block kar diya. Popup allow karein.";

        }

        else if (
            error.code ===
            "auth/unauthorized-domain"
        ) {

            errorMessage =
                "Ye website Firebase Authorized Domains mein add nahi hai.";

        }

        else if (
            error.code ===
            "auth/operation-not-allowed"
        ) {

            errorMessage =
                "Firebase mein Google Sign-In abhi enabled nahi hai.";

        }

        else if (
            error.message
        ) {

            errorMessage =
                error.message;

        }

        showMessage(
            errorMessage,
            "error"
        );

    }

}


/* ==================================================
   GUEST LOGIN
================================================== */

async function guestLogin() {

    clearMessage();

    setLoading(true);

    try {

        const result =
            await signInAnonymously(
                auth
            );

        const user =
            result.user;

        await saveUser(
            user
        );

        showMessage(
            "Guest login successful. Redirecting...",
            "success"
        );

        setTimeout(
            () => {

                window.location.href =
                    "index.html";

            },
            700
        );

    } catch (error) {

        console.error(
            "Guest login error:",
            error
        );

        setLoading(false);

        showMessage(
            "Guest login failed: " +
            error.message,
            "error"
        );

    }

}


/* ==================================================
   BUTTON EVENTS
================================================== */

googleLoginBtn.addEventListener(
    "click",
    googleLogin
);


guestBtn.addEventListener(
    "click",
    guestLogin
);


/* ==================================================
   AUTH STATE
================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            return;

        }

        /*
           If user is already logged in,
           don't show login page again.
        */

        console.log(
            "Current user:",
            user.email ||
            "Guest"
        );

    }
);


/* ==================================================
   ENTER KEY
================================================== */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            googleLogin();

        }

    }
);


/* ==================================================
   READY
================================================== */

console.log(
    "Chishti Library User Login Ready"
);
