/* ==================================================
   CHISHTI LIBRARY
   NORMAL USER GOOGLE LOGIN
   login.js
================================================== */


/* ==================================================
   FIREBASE CONFIG
================================================== */

const firebaseConfig = {

    apiKey:
        "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_MESSAGING_SENDER_ID",

    appId:
        "YOUR_APP_ID"

};


/* ==================================================
   INITIALIZE FIREBASE
================================================== */

if (!firebase.apps.length) {

    firebase.initializeApp(
        firebaseConfig
    );

}


const auth =
    firebase.auth();

const db =
    firebase.firestore();


/* ==================================================
   ELEMENTS
================================================== */

const googleLoginBtn =
    document.getElementById(
        "googleLoginBtn"
    );

const googleButtonText =
    document.getElementById(
        "googleButtonText"
    );

const messageBox =
    document.getElementById(
        "message"
    );


/* ==================================================
   MESSAGE
================================================== */

function showMessage(
    text,
    type
) {

    messageBox.textContent =
        text;

    messageBox.className =
        "message " + type;

}


function clearMessage() {

    messageBox.textContent =
        "";

    messageBox.className =
        "message";

}


/* ==================================================
   BUTTON LOADING
================================================== */

function setGoogleLoading(
    loading
) {

    googleLoginBtn.disabled =
        loading;


    if (loading) {

        googleButtonText.textContent =
            "Signing in...";

    } else {

        googleButtonText.textContent =
            "Continue with Google";

    }

}


/* ==================================================
   SAVE USER
================================================== */

async function saveUser(
    user
) {

    if (!user) {

        return;

    }


    const userRef =
        db
        .collection("users")
        .doc(user.uid);


    const userData = {

        uid:
            user.uid,

        name:
            user.displayName ||
            "Library User",

        email:
            user.email ||
            "",

        photoURL:
            user.photoURL ||
            "",

        provider:
            "google",

        updatedAt:
            firebase.firestore
            .FieldValue
            .serverTimestamp()

    };


    const existingUser =
        await userRef.get();


    if (!existingUser.exists) {

        userData.createdAt =
            firebase.firestore
            .FieldValue
            .serverTimestamp();

    }


    await userRef.set(
        userData,
        {
            merge: true
        }
    );

}


/* ==================================================
   GOOGLE LOGIN
================================================== */

async function googleLogin() {

    clearMessage();

    setGoogleLoading(
        true
    );


    try {

        const provider =
            new firebase.auth
            .GoogleAuthProvider();


        provider.setCustomParameters({

            prompt:
                "select_account"

        });


        const result =
            await auth
            .signInWithPopup(
                provider
            );


        const user =
            result.user;


        await saveUser(
            user
        );


        showMessage(
            "Login successful. Welcome!",
            "success"
        );


        setTimeout(
            function() {

                window.location.href =
                    "index.html";

            },
            600
        );


    } catch (error) {

        console.error(
            "Google login error:",
            error
        );


        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            clearMessage();

        } else {

            showMessage(
                getErrorMessage(
                    error
                ),
                "error"
            );

        }

    } finally {

        setGoogleLoading(
            false
        );

    }

}


/* ==================================================
   ERROR MESSAGE
================================================== */

function getErrorMessage(
    error
) {

    switch (
        error.code
    ) {

        case "auth/popup-blocked":

            return "Google login popup was blocked. Please allow popups for this website.";


        case "auth/cancelled-popup-request":

            return "Login request was cancelled.";


        case "auth/network-request-failed":

            return "Network error. Please check your internet connection.";


        case "auth/unauthorized-domain":

            return "This website domain is not authorized in Firebase Authentication.";


        case "auth/operation-not-allowed":

            return "Google Sign-In is not enabled in Firebase Authentication.";


        default:

            return (
                error.message ||
                "Google login failed. Please try again."
            );

    }

}


/* ==================================================
   GOOGLE BUTTON
================================================== */

googleLoginBtn.addEventListener(
    "click",
    googleLogin
);


/* ==================================================
   CHECK CURRENT LOGIN
================================================== */

auth.onAuthStateChanged(
    function(user) {

        if (!user) {

            return;

        }


        /*
           Agar user pehle se Google se
           login hai to login page par
           dobara na rukao.
        */

        window.location.href =
            "index.html";

    }
);


/* ==================================================
   READY
================================================== */

console.log(
    "Chishti Library Google Login Ready"
);
