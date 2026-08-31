/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   FULL FIXED VERSION
   =========================================================

   FEATURES
   ✅ Single Firebase initialization
   ✅ Authentication
   ✅ Firestore
   ✅ Storage
   ✅ Visitor counter
   ✅ Session-based visitor counting
   ✅ Book views
   ✅ Book likes
   ✅ Book downloads
   ✅ Firebase helper functions
   ✅ Online/offline detection
   ✅ Firestore network reconnect
   ✅ Global window.db
   ✅ Global window.auth
   ✅ Global window.storage

   IMPORTANT:
   Firebase COMPAT SDK must be loaded BEFORE this file.
   ========================================================= */

"use strict";


/* =========================================================
   FIREBASE CONFIG
   =========================================================

   ⚠️ REPLACE THESE VALUES WITH YOUR REAL FIREBASE CONFIG.

   Firebase Console:
   Project Settings
   → Your apps
   → Web app
   → SDK setup and configuration
   ========================================================= */

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain:
        "YOUR_PROJECT.firebaseapp.com",

    projectId:
        "YOUR_PROJECT_ID",

    storageBucket:
        "YOUR_PROJECT.firebasestorage.app",

    messagingSenderId:
        "YOUR_SENDER_ID",

    appId:
        "YOUR_APP_ID"

};


/* =========================================================
   CHECK FIREBASE SDK
   ========================================================= */

if (
    typeof firebase === "undefined"
) {

    console.error(
        "❌ Firebase SDK not loaded."
    );

    console.error(
        "Load Firebase App, Auth, Firestore and Storage SDKs before firebase.js."
    );

} else {


    /* =====================================================
       FIREBASE INITIALIZATION
       ===================================================== */

    try {

        if (
            !firebase.apps ||
            firebase.apps.length === 0
        ) {

            firebase.initializeApp(
                firebaseConfig
            );

            console.log(
                "🔥 Firebase initialized successfully"
            );

        } else {

            console.log(
                "🔥 Firebase already initialized"
            );

        }


        /* =================================================
           FIREBASE SERVICES
           ================================================= */

        const firebaseAuth =
            firebase.auth();

        const firebaseDB =
            firebase.firestore();

        const firebaseStorage =
            firebase.storage();


        /* =================================================
           GLOBAL SERVICES
           ================================================= */

        window.firebaseAuth =
            firebaseAuth;

        window.firebaseDB =
            firebaseDB;

        window.firebaseStorage =
            firebaseStorage;


        window.auth =
            firebaseAuth;

        window.db =
            firebaseDB;

        window.storage =
            firebaseStorage;


        /* =================================================
           FIRESTORE NETWORK
           ================================================= */

        /*
           Try to enable Firestore network.

           This is useful when the browser temporarily
           enters Firestore offline mode.
        */

        firebaseDB.enableNetwork()
            .then(() => {

                console.log(
                    "🌐 Firestore network enabled"
                );

            })
            .catch(error => {

                console.warn(
                    "⚠️ Firestore network could not be enabled:",
                    error
                );

            });


        /* =================================================
           FIREBASE ONLINE / OFFLINE STATUS
           ================================================= */

        window.addEventListener(
            "online",
            () => {

                console.log(
                    "🌐 Internet connection restored"
                );

                firebaseDB
                    .enableNetwork()
                    .then(() => {

                        console.log(
                            "🔥 Firestore reconnected"
                        );

                    })
                    .catch(error => {

                        console.warn(
                            "Firestore reconnect error:",
                            error
                        );

                    });

            }
        );


        window.addEventListener(
            "offline",
            () => {

                console.warn(
                    "⚠️ Browser is offline"
                );

            }
        );


        /* =================================================
           VISITOR COUNTER
           =================================================

           Firestore:

           counter
              └── visitors
                    └── count
        */

        async function updateVisitorCounter() {

            const counterElement =
                document.getElementById(
                    "visitorCounter"
                );


            if (!counterElement) {

                console.warn(
                    "⚠️ #visitorCounter not found"
                );

                return;

            }


            try {

                const visitorRef =
                    firebaseDB
                        .collection("counter")
                        .doc("visitors");


                /* =========================================
                   CHECK SESSION
                   ========================================= */

                const alreadyCounted =
                    sessionStorage.getItem(
                        "chishtiVisitorCounted"
                    );


                /* =========================================
                   CREATE / UPDATE COUNTER
                   ========================================= */

                if (!alreadyCounted) {


                    /*
                       Transaction prevents two visitors
                       updating the same counter incorrectly.
                    */

                    await firebaseDB.runTransaction(
                        async transaction => {

                            const snapshot =
                                await transaction.get(
                                    visitorRef
                                );


                            if (
                                !snapshot.exists
                            ) {

                                transaction.set(
                                    visitorRef,
                                    {
                                        count: 1,
                                        updatedAt:
                                            firebase.firestore.FieldValue.serverTimestamp()
                                    }
                                );

                            } else {

                                const data =
                                    snapshot.data() || {};


                                const currentCount =
                                    Number(
                                        data.count
                                    ) || 0;


                                transaction.update(
                                    visitorRef,
                                    {
                                        count:
                                            currentCount + 1,

                                        updatedAt:
                                            firebase.firestore.FieldValue.serverTimestamp()
                                    }
                                );

                            }

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


                /* =========================================
                   GET FINAL COUNT
                   ========================================= */

                const snapshot =
                    await visitorRef.get();


                if (
                    !snapshot.exists
                ) {

                    counterElement.innerText =
                        "0";

                    return;

                }


                const data =
                    snapshot.data() || {};


                const visitors =
                    Number(
                        data.count
                    ) || 0;


                /* =========================================
                   ANIMATE COUNTER
                   ========================================= */

                animateNumber(
                    counterElement,
                    visitors
                );


                console.log(
                    "👁️ Total visitors:",
                    visitors
                );


            } catch (error) {

                console.error(
                    "❌ Visitor counter error:",
                    error
                );


                /*
                   Do NOT display 0 if Firebase is
                   temporarily unavailable.

                   Keep the previous value instead.
                */

                if (
                    counterElement.innerText ===
                    ""
                ) {

                    counterElement.innerText =
                        "—";

                }

            }

        }


        /* =================================================
           NUMBER ANIMATION
           ================================================= */

        function animateNumber(
            element,
            target
        ) {

            if (!element) return;


            target =
                Number(target) || 0;


            const start =
                Number(
                    element.innerText
                ) || 0;


            if (
                start >= target
            ) {

                element.innerText =
                    target.toLocaleString();

                return;

            }


            const duration = 1000;

            const startTime =
                performance.now();


            function update(currentTime) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );


                const value =
                    Math.floor(
                        start +
                        (
                            target -
                            start
                        ) *
                        progress
                    );


                element.innerText =
                    value.toLocaleString();


                if (
                    progress < 1
                ) {

                    requestAnimationFrame(
                        update
                    );

                } else {

                    element.innerText =
                        target.toLocaleString();

                }

            }


            requestAnimationFrame(
                update
            );

        }


        /* =================================================
           GLOBAL VISITOR FUNCTION
           ================================================= */

        window.updateVisitorCounter =
            updateVisitorCounter;


        /* =================================================
           BOOK VIEW COUNTER
           =================================================

           Usage:

           incrementBookView("book-id");

        */

        async function incrementBookView(
            bookId
        ) {

            if (!bookId) return;


            try {

                const ref =
                    firebaseDB
                        .collection("books")
                        .doc(String(bookId));


                await ref.set(

                    {

                        views:
                            firebase.firestore.FieldValue.increment(
                                1
                            ),

                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    },

                    {
                        merge: true
                    }

                );


                console.log(
                    "👁️ Book view added:",
                    bookId
                );


            } catch (error) {

                console.error(
                    "❌ Book view error:",
                    error
                );

            }

        }


        window.incrementBookView =
            incrementBookView;


        /* =================================================
           BOOK LIKE COUNTER
           =================================================

           Usage:

           incrementBookLike("book-id");

        */

        async function incrementBookLike(
            bookId
        ) {

            if (!bookId) return;


            try {

                const ref =
                    firebaseDB
                        .collection("books")
                        .doc(String(bookId));


                await ref.set(

                    {

                        likes:
                            firebase.firestore.FieldValue.increment(
                                1
                            ),

                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    },

                    {
                        merge: true
                    }

                );


                console.log(
                    "❤️ Book like added:",
                    bookId
                );


            } catch (error) {

                console.error(
                    "❌ Book like error:",
                    error
                );

            }

        }


        window.incrementBookLike =
            incrementBookLike;


        /* =================================================
           BOOK DOWNLOAD COUNTER
           =================================================

           Usage:

           incrementBookDownload("book-id");

        */

        async function incrementBookDownload(
            bookId
        ) {

            if (!bookId) return;


            try {

                const ref =
                    firebaseDB
                        .collection("books")
                        .doc(String(bookId));


                await ref.set(

                    {

                        downloads:
                            firebase.firestore.FieldValue.increment(
                                1
                            ),

                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    },

                    {
                        merge: true
                    }

                );


                console.log(
                    "⬇️ Book download added:",
                    bookId
                );


            } catch (error) {

                console.error(
                    "❌ Book download error:",
                    error
                );

            }

        }


        window.incrementBookDownload =
            incrementBookDownload;


        /* =================================================
           GENERIC FIREBASE COUNTER
           =================================================

           Usage:

           incrementCounter(
               "counter",
               "visitors",
               "count"
           );

        */

        async function incrementCounter(
            collectionName,
            documentId,
            fieldName = "count"
        ) {

            if (
                !collectionName ||
                !documentId ||
                !fieldName
            ) {

                return null;

            }


            try {

                const ref =
                    firebaseDB
                        .collection(
                            collectionName
                        )
                        .doc(
                            String(documentId)
                        );


                await ref.set(

                    {

                        [fieldName]:
                            firebase.firestore.FieldValue.increment(
                                1
                            ),

                        updatedAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    },

                    {
                        merge: true
                    }

                );


                const snapshot =
                    await ref.get();


                if (
                    !snapshot.exists
                ) {

                    return 0;

                }


                return Number(
                    snapshot.data()[fieldName]
                ) || 0;


            } catch (error) {

                console.error(
                    "❌ Firebase counter error:",
                    error
                );

                return null;

            }

        }


        window.incrementCounter =
            incrementCounter;


        /* =================================================
           GET COUNTER
           ================================================= */

        async function getCounter(
            collectionName,
            documentId,
            fieldName = "count"
        ) {

            try {

                const ref =
                    firebaseDB
                        .collection(
                            collectionName
                        )
                        .doc(
                            String(documentId)
                        );


                const snapshot =
                    await ref.get();


                if (
                    !snapshot.exists
                ) {

                    return 0;

                }


                return Number(
                    snapshot.data()[fieldName]
                ) || 0;


            } catch (error) {

                console.error(
                    "❌ Get counter error:",
                    error
                );

                return 0;

            }

        }


        window.getCounter =
            getCounter;


        /* =================================================
           AUTH HELPERS
           ================================================= */

        async function getCurrentUser() {

            return firebaseAuth.currentUser ||
                null;

        }


        window.getCurrentUser =
            getCurrentUser;


        /* =================================================
           FIREBASE CONNECTION TEST
           ================================================= */

        async function testFirebaseConnection() {

            try {

                const testRef =
                    firebaseDB
                        .collection("counter")
                        .doc("visitors");


                const snapshot =
                    await testRef.get();


                console.log(
                    "======================================"
                );

                console.log(
                    "🔥 FIREBASE CONNECTION TEST"
                );

                console.log(
                    "✅ Firestore is reachable"
                );

                console.log(
                    "📄 Visitor document exists:",
                    snapshot.exists
                );

                console.log(
                    "======================================"
                );


                return true;


            } catch (error) {

                console.error(
                    "❌ Firebase connection test failed:",
                    error
                );


                return false;

            }

        }


        window.testFirebaseConnection =
            testFirebaseConnection;


        /* =================================================
           START VISITOR COUNTER
           ================================================= */

        /*
           Wait until DOM is ready.
        */

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(
                "DOMContentLoaded",
                () => {

                    updateVisitorCounter();

                }
            );

        } else {

            updateVisitorCounter();

        }


        /* =================================================
           FIREBASE READY LOG
           ================================================= */

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
            "✅ Book Views"
        );

        console.log(
            "✅ Book Likes"
        );

        console.log(
            "✅ Book Downloads"
        );

        console.log(
            "✅ Firebase Helpers"
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


    } catch (error) {

        console.error(
            "❌ Firebase initialization failed:",
            error
        );

    }

}

