/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   COMPLETE FIREBASE + VISITOR COUNTER
   FIREBASE v8
   ========================================================= */

"use strict";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT_ID.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT_ID.firebasestorage.app",

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
   INITIALIZE FIREBASE ONCE
   ========================================================= */

let firebaseApp;

try {

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
            "🔥 Firebase already initialized"
        );
    }

} catch (error) {

    console.error(
        "❌ Firebase initialization failed:",
        error
    );

    throw error;
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

window.firebaseFieldValue =
    firebase.firestore.FieldValue;


/* =========================================================
   FIREBASE TIMESTAMP
   ========================================================= */

window.firebaseTimestamp =
    firebase.firestore.Timestamp;


/* =========================================================
   VISITOR COUNTER
   =========================================================
   
   Firestore:
   
   counter
      ↓
   visitors
      ↓
   count: 123

   Each browser session is counted once.
   ========================================================= */

async function updateVisitorCounter() {

    const visitorCounter =
        document.getElementById(
            "visitorCounter"
        );

    if (!visitorCounter) {

        console.warn(
            "⚠️ #visitorCounter element not found."
        );

        return;
    }


    try {

        const visitorRef =
            window.db
                .collection("counter")
                .doc("visitors");


        /* =================================================
           CHECK CURRENT SESSION
           ================================================= */

        const alreadyCounted =
            sessionStorage.getItem(
                "chishtiVisitorCounted"
            );


        /* =================================================
           COUNT NEW SESSION
           ================================================= */

        if (!alreadyCounted) {

            await visitorRef.set(

                {

                    count:
                        firebase.firestore
                            .FieldValue
                            .increment(1),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                },

                {

                    merge: true

                }

            );


            sessionStorage.setItem(
                "chishtiVisitorCounted",
                "true"
            );


            console.log(
                "👁️ New visitor counted"
            );

        } else {

            console.log(
                "👁️ Visitor already counted in this session"
            );
        }


        /* =================================================
           GET CURRENT TOTAL
           ================================================= */

        const snapshot =
            await visitorRef.get();


        let totalVisitors = 0;


        if (snapshot.exists) {

            const data =
                snapshot.data();


            totalVisitors =
                Number(
                    data.count
                ) || 0;
        }


        /* =================================================
           DISPLAY COUNTER
           ================================================= */

        animateVisitorCounter(
            visitorCounter,
            totalVisitors
        );


        console.log(
            "👁️ Total Visitors:",
            totalVisitors
        );


    } catch (error) {

        console.error(
            "❌ Visitor counter error:",
            error
        );


        /* =============================================
           USER-FRIENDLY ERROR
           ============================================= */

        if (
            error.code ===
            "unavailable"
        ) {

            console.error(
                "🌐 Firestore is offline/unavailable."
            );

        }


        else if (
            error.code ===
            "permission-denied"
        ) {

            console.error(
                "🔒 Firestore permission denied. Check Firestore Rules."
            );

        }


        else {

            console.error(
                "🔥 Firebase error:",
                error.message || error
            );

        }


        visitorCounter.innerText =
            "0";
    }
}


/* =========================================================
   COUNTER ANIMATION
   ========================================================= */

function animateVisitorCounter(
    element,
    target
) {

    if (!element) return;


    target =
        Number(target) || 0;


    let current = 0;


    /* Small numbers don't need long animation */

    const duration =
        target > 1000
            ? 1200
            : 700;


    const startTime =
        performance.now();


    function animate(
        currentTime
    ) {

        const progress =
            Math.min(
                (currentTime - startTime) /
                duration,
                1
            );


        /* Smooth animation */

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        current =
            Math.floor(
                eased * target
            );


        element.innerText =
            current.toLocaleString();


        if (progress < 1) {

            requestAnimationFrame(
                animate
            );

        } else {

            element.innerText =
                target.toLocaleString();
        }
    }


    requestAnimationFrame(
        animate
    );
}


/* =========================================================
   MAKE COUNTER GLOBAL
   ========================================================= */

window.updateVisitorCounter =
    updateVisitorCounter;

window.animateVisitorCounter =
    animateVisitorCounter;


/* =========================================================
   FIRESTORE CONNECTION TEST
   ========================================================= */

async function testFirestoreConnection() {

    try {

        console.log(
            "🔄 Testing Firestore connection..."
        );


        const testRef =
            window.db
                .collection("counter")
                .doc("visitors");


        await testRef.get({
            source: "server"
        });


        console.log(
            "✅ Firestore is ONLINE"
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Firestore connection failed:",
            error
        );


        return false;
    }
}


window.testFirestoreConnection =
    testFirestoreConnection;


/* =========================================================
   AUTH STATE
   ========================================================= */

firebaseAuth.onAuthStateChanged(
    function (user) {

        if (user) {

            window.currentFirebaseUser =
                user;


            console.log(
                "👤 User signed in:",
                user.email || user.uid
            );

        } else {

            window.currentFirebaseUser =
                null;


            console.log(
                "👤 No user signed in"
            );
        }
    }
);


/* =========================================================
   FIREBASE ERROR HANDLER
   ========================================================= */

window.handleFirebaseError =
    function (error) {

        console.error(
            "🔥 Firebase Error:",
            error
        );


        if (!error) return;


        switch (error.code) {


            case "unavailable":

                console.error(
                    "🌐 Firebase/Firestore is offline or unavailable."
                );

                break;


            case "permission-denied":

                console.error(
                    "🔒 Permission denied. Check Firestore Security Rules."
                );

                break;


            case "auth/invalid-api-key":

                console.error(
                    "❌ Firebase API key is invalid."
                );

                break;


            case "auth/network-request-failed":

                console.error(
                    "🌐 Authentication network error."
                );

                break;


            case "storage/unauthorized":

                console.error(
                    "🔒 Storage permission denied."
                );

                break;


            case "storage/object-not-found":

                console.error(
                    "❌ Storage file not found."
                );

                break;


            default:

                console.error(
                    "🔥 Firebase:",
                    error.message || error
                );
        }
    };


/* =========================================================
   FIREBASE READY EVENT
   ========================================================= */

window.dispatchEvent(

    new CustomEvent(
        "firebaseReady",
        {

            detail: {

                app:
                    firebaseApp,

                auth:
                    firebaseAuth,

                db:
                    firebaseDB,

                storage:
                    firebaseStorage
            }
        }
    )
);


/* =========================================================
   START VISITOR COUNTER
   ========================================================= */

function startVisitorCounter() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                updateVisitorCounter();

            },
            {
                once: true
            }
        );

    } else {

        updateVisitorCounter();

    }
}


/* =========================================================
   START
   ========================================================= */

startVisitorCounter();


/* =========================================================
   FINAL CONSOLE
   ========================================================= */

console.log(
    "======================================"
);

console.log(
    "🔥 CHISHTI LIBRARY"
);

console.log(
    "🔥 FIREBASE SYSTEM"
);

console.log(
    "======================================"
);

console.log(
    "✅ Firebase App"
);

console.log(
    "✅ Authentication"
);

console.log(
    "✅ Firestore"
);

console.log(
    "✅ Storage"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "✅ Global auth"
);

console.log(
    "✅ Global db"
);

console.log(
    "✅ Global storage"
);

console.log(
    "🚀 Firebase Ready"
);

console.log(
    "======================================"
);
