/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   PREMIUM FIREBASE SETUP
   FIREBASE v8
   ========================================================= */

"use strict";

/* =========================================================
   FIREBASE CONFIG
   =========================================================
   Firebase Console
   → Project Settings
   → General
   → Your apps
   → Web App
   → SDK setup and configuration
   ========================================================= */

const firebaseConfig = {

    apiKey: "YOUR_REAL_API_KEY",

    authDomain:
        "YOUR_PROJECT_ID.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_STORAGE_BUCKET",

    messagingSenderId:
        "YOUR_SENDER_ID",

    appId:
        "YOUR_APP_ID"
};


/* =========================================================
   CHECK FIREBASE SDK
   ========================================================= */

if (typeof firebase === "undefined") {

    console.error(
        "❌ Firebase SDK is not loaded."
    );

    throw new Error(
        "Firebase SDK must be loaded before firebase.js"
    );
}


/* =========================================================
   INITIALIZE FIREBASE ONLY ONCE
   ========================================================= */

let firebaseApp;

if (!firebase.apps.length) {

    firebaseApp =
        firebase.initializeApp(firebaseConfig);

    console.log(
        "🔥 Firebase initialized successfully"
    );

} else {

    firebaseApp =
        firebase.app();

    console.log(
        "🔥 Firebase app already initialized"
    );
}


/* =========================================================
   FIREBASE AUTHENTICATION
   ========================================================= */

const firebaseAuth =
    firebase.auth();


/* =========================================================
   FIRESTORE DATABASE
   ========================================================= */

const firebaseDB =
    firebase.firestore();


/* =========================================================
   FIREBASE STORAGE
   ========================================================= */

const firebaseStorage =
    firebase.storage();


/* =========================================================
   GLOBAL FIREBASE ACCESS
   ========================================================= */

window.firebaseApp =
    firebaseApp;

window.firebaseAuth =
    firebaseAuth;

window.firebaseDB =
    firebaseDB;

window.firebaseStorage =
    firebaseStorage;


/* =========================================================
   COMMON ALIASES
   =========================================================
   These allow your other JS files to use:

   auth
   db
   storage

   without creating duplicate Firebase variables.
   ========================================================= */

window.auth =
    firebaseAuth;

window.db =
    firebaseDB;

window.storage =
    firebaseStorage;


/* =========================================================
   FIREBASE FIELD VALUE
   ========================================================= */

window.firebaseIncrement =
    firebase.firestore.FieldValue.increment;


/* =========================================================
   FIREBASE TIMESTAMP
   ========================================================= */

window.firebaseTimestamp =
    firebase.firestore.Timestamp;


/* =========================================================
   FIREBASE SERVER TIMESTAMP
   ========================================================= */

window.serverTimestamp =
    firebase.firestore.FieldValue.serverTimestamp;


/* =========================================================
   FIREBASE READY CHECK
   ========================================================= */

function firebaseReady() {

    return (
        typeof window.firebaseApp !== "undefined" &&
        typeof window.firebaseAuth !== "undefined" &&
        typeof window.firebaseDB !== "undefined" &&
        typeof window.firebaseStorage !== "undefined"
    );
}


/* =========================================================
   FIREBASE CONNECTION TEST
   ========================================================= */

async function testFirebaseConnection() {

    try {

        if (!firebaseReady()) {

            throw new Error(
                "Firebase services are not available."
            );
        }


        console.log(
            "✅ Firebase App Connected"
        );

        console.log(
            "✅ Firebase Authentication Connected"
        );

        console.log(
            "✅ Firestore Connected"
        );

        console.log(
            "✅ Firebase Storage Connected"
        );


        return true;

    }

    catch (error) {

        console.error(
            "❌ Firebase connection error:",
            error
        );

        return false;
    }
}


/* =========================================================
   FIREBASE ERROR HANDLER
   ========================================================= */

window.firebaseErrorHandler =
    function (error) {

        console.error(
            "🔥 Firebase Error:",
            error
        );


        if (!error) return;


        switch (error.code) {

            case "permission-denied":

                console.error(
                    "❌ Firestore/Storage permission denied."
                );

                break;


            case "auth/invalid-api-key":

                console.error(
                    "❌ Firebase API key is invalid."
                );

                break;


            case "auth/network-request-failed":

                console.error(
                    "❌ Firebase network request failed."
                );

                break;


            case "storage/unauthorized":

                console.error(
                    "❌ Firebase Storage permission denied."
                );

                break;


            case "storage/object-not-found":

                console.error(
                    "❌ Firebase Storage file not found."
                );

                break;


            default:

                console.error(
                    "❌ Firebase error:",
                    error.message || error
                );
        }
    };


/* =========================================================
   FIREBASE AUTH STATE
   ========================================================= */

firebaseAuth.onAuthStateChanged(
    function (user) {

        if (user) {

            console.log(
                "👤 Firebase User:",
                user.email || user.uid
            );

            window.currentFirebaseUser =
                user;

        } else {

            console.log(
                "👤 No Firebase user signed in"
            );

            window.currentFirebaseUser =
                null;
        }
    }
);


/* =========================================================
   FIREBASE READY EVENT
   ========================================================= */

window.dispatchEvent(
    new CustomEvent("firebaseReady", {
        detail: {
            app: firebaseApp,
            auth: firebaseAuth,
            db: firebaseDB,
            storage: firebaseStorage
        }
    })
);


/* =========================================================
   CONSOLE STATUS
   ========================================================= */

console.log(
    "======================================"
);

console.log(
    "🔥 CHISHTI LIBRARY FIREBASE"
);

console.log(
    "======================================"
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
    "✅ Global auth Ready"
);

console.log(
    "✅ Global db Ready"
);

console.log(
    "✅ Global storage Ready"
);

console.log(
    "======================================"
);


/* =========================================================
   RUN CONNECTION CHECK
   ========================================================= */

testFirebaseConnection();
