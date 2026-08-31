/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   FULL VERSION
   Firebase + Auth + Firestore + Storage + Counters
   ========================================================= */

"use strict";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

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


/* =========================================================
   CHECK FIREBASE SDK
   ========================================================= */

if (typeof firebase === "undefined") {

    console.error(
        "❌ Firebase SDK is not loaded."
    );

} else {


    /* =====================================================
       INITIALIZE FIREBASE ONCE
       ===================================================== */

    if (!firebase.apps.length) {

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


    /* =====================================================
       SERVICES
       ===================================================== */

    const auth =
        firebase.auth();

    const db =
        firebase.firestore();

    const storage =
        firebase.storage();


    /* =====================================================
       GLOBAL SERVICES
       ===================================================== */

    window.auth =
        auth;

    window.db =
        db;

    window.storage =
        storage;

    window.firebaseAuth =
        auth;

    window.firebaseDB =
        db;

    window.firebaseStorage =
        storage;


    /* =====================================================
       FIRESTORE NETWORK
       ===================================================== */

    db.enableNetwork()
        .then(() => {

            console.log(
                "🌐 Firestore network enabled"
            );

        })
        .catch(error => {

            console.warn(
                "⚠️ Firestore network error:",
                error
            );

        });


    /* =====================================================
       ONLINE / OFFLINE
       ===================================================== */

    window.addEventListener(
        "online",
        () => {

            console.log(
                "🌐 Internet connection restored"
            );

            db.enableNetwork()
                .then(() => {

                    console.log(
                        "🔥 Firestore reconnected"
                    );

                })
                .catch(error => {

                    console.warn(
                        "⚠️ Firestore reconnect failed:",
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


    /* =====================================================
       AUTH PERSISTENCE
       ===================================================== */

    auth.setPersistence(
        firebase.auth.Auth.Persistence.LOCAL
    )
    .then(() => {

        console.log(
            "✅ Auth Persistence Enabled"
        );

    })
    .catch(error => {

        console.error(
            "❌ Auth persistence error:",
            error
        );

    });


    /* =====================================================
       ADMIN LOGIN CHECK
       ===================================================== */

    function checkAdmin() {

        auth.onAuthStateChanged(
            user => {

                const adminMenu =
                    document.getElementById(
                        "adminMenu"
                    );

                const dashboardMenu =
                    document.getElementById(
                        "dashboardMenu"
                    );

                const loginMenu =
                    document.getElementById(
                        "loginMenu"
                    );


                if (user) {

                    console.log(
                        "🔐 Logged In:",
                        user.email
                    );


                    if (adminMenu) {

                        adminMenu.style.display =
                            "block";

                    }


                    if (dashboardMenu) {

                        dashboardMenu.style.display =
                            "block";

                    }


                    if (loginMenu) {

                        loginMenu.style.display =
                            "none";

                    }

                } else {

                    console.log(
                        "👤 Guest User"
                    );


                    if (adminMenu) {

                        adminMenu.style.display =
                            "none";

                    }


                    if (dashboardMenu) {

                        dashboardMenu.style.display =
                            "none";

                    }


                    if (loginMenu) {

                        loginMenu.style.display =
                            "block";

                    }

                }

            }
        );

    }


    window.checkAdmin =
        checkAdmin;


    /* =====================================================
       LOGOUT
       ===================================================== */

    function logout() {

        auth.signOut()

            .then(() => {

                console.log(
                    "✅ Logout Successful"
                );

                window.location.href =
                    "login.html";

            })

            .catch(error => {

                console.error(
                    "❌ Logout error:",
                    error
                );

                alert(
                    error.message
                );

            });

    }


    window.logout =
        logout;


    /* =====================================================
       NUMBER ANIMATION
       ===================================================== */

    function animateNumber(
        element,
        target
    ) {

        if (!element) return;


        target =
            Number(target) || 0;


        let current = 0;


        if (target === 0) {

            element.innerText =
                "0";

            return;

        }


        const duration =
            1000;

        const startTime =
            performance.now();


        function update(time) {

            const progress =
                Math.min(
                    (time - startTime) /
                    duration,
                    1
                );


            current =
                Math.floor(
                    target * progress
                );


            element.innerText =
                current.toLocaleString();


            if (progress < 1) {

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


    /* =====================================================
       VISITOR COUNTER
       =====================================================

       Firestore:

       counter
          └── visitors
               └── count
    */

    async function updateVisitorCounter() {

        const element =
            document.getElementById(
                "visitorCounter"
            );


        if (!element) {

            console.warn(
                "⚠️ #visitorCounter not found"
            );

            return;

        }


        const visitorRef =
            db
                .collection("counter")
                .doc("visitors");


        try {

            const alreadyCounted =
                sessionStorage.getItem(
                    "chishtiVisitorCounted"
                );


            /* =============================================
               NEW SESSION
               ============================================= */

            if (!alreadyCounted) {

                await db.runTransaction(
                    async transaction => {

                        const snapshot =
                            await transaction.get(
                                visitorRef
                            );


                        if (!snapshot.exists) {

                            transaction.set(
                                visitorRef,
                                {

                                    count: 1,

                                    updatedAt:
                                        firebase.firestore
                                            .FieldValue
                                            .serverTimestamp()

                                }
                            );

                        } else {

                            const data =
                                snapshot.data() || {};


                            const current =
                                Number(
                                    data.count
                                ) || 0;


                            transaction.update(
                                visitorRef,
                                {

                                    count:
                                        current + 1,

                                    updatedAt:
                                        firebase.firestore
                                            .FieldValue
                                            .serverTimestamp()

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


            /* =============================================
               READ CURRENT TOTAL
               ============================================= */

            const snapshot =
                await visitorRef.get();


            if (!snapshot.exists) {

                element.innerText =
                    "0";

                return;

            }


            const data =
                snapshot.data() || {};


            const total =
                Number(
                    data.count
                ) || 0;


            animateNumber(
                element,
                total
            );


            console.log(
                "👁️ Total Visitors:",
                total
            );


        } catch (error) {

            console.error(
                "❌ Visitor counter error:",
                error
            );


            /*
               Do NOT reset the counter to 0
               when Firebase is temporarily offline.
            */

            if (
                !element.innerText ||
                element.innerText === "0"
            ) {

                element.innerText =
                    "—";

            }

        }

    }


    window.updateVisitorCounter =
        updateVisitorCounter;


    /* =====================================================
       GENERIC COUNTER
       ===================================================== */

    async function incrementCounter(
        collectionName,
        documentId,
        fieldName = "count"
    ) {

        if (
            !collectionName ||
            !documentId
        ) {

            return null;

        }


        try {

            const ref =
                db
                    .collection(
                        collectionName
                    )
                    .doc(
                        String(documentId)
                    );


            await ref.set(

                {

                    [fieldName]:
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


            const snapshot =
                await ref.get();


            if (!snapshot.exists) {

                return 0;

            }


            return Number(
                snapshot.data()[fieldName]
            ) || 0;


        } catch (error) {

            console.error(
                "❌ Counter error:",
                error
            );

            return null;

        }

    }


    window.incrementCounter =
        incrementCounter;


    /* =====================================================
       GET COUNTER
       ===================================================== */

    async function getCounter(
        collectionName,
        documentId,
        fieldName = "count"
    ) {

        try {

            const ref =
                db
                    .collection(
                        collectionName
                    )
                    .doc(
                        String(documentId)
                    );


            const snapshot =
                await ref.get();


            if (!snapshot.exists) {

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


    /* =====================================================
       BOOK VIEW
       ===================================================== */

    async function incrementBookView(
        bookId
    ) {

        if (!bookId) return null;


        try {

            const ref =
                db
                    .collection("books")
                    .doc(
                        String(bookId)
                    );


            await ref.set(

                {

                    views:
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


            console.log(
                "👁️ Book view:",
                bookId
            );


            return true;


        } catch (error) {

            console.error(
                "❌ Book view error:",
                error
            );

            return false;

        }

    }


    window.incrementBookView =
        incrementBookView;


    /* =====================================================
       BOOK LIKE
       ===================================================== */

    async function incrementBookLike(
        bookId
    ) {

        if (!bookId) return null;


        try {

            const ref =
                db
                    .collection("books")
                    .doc(
                        String(bookId)
                    );


            await ref.set(

                {

                    likes:
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


            console.log(
                "❤️ Book like:",
                bookId
            );


            return true;


        } catch (error) {

            console.error(
                "❌ Book like error:",
                error
            );

            return false;

        }

    }


    window.incrementBookLike =
        incrementBookLike;


    /* =====================================================
       BOOK DOWNLOAD
       ===================================================== */

    async function incrementBookDownload(
        bookId
    ) {

        if (!bookId) return null;


        try {

            const ref =
                db
                    .collection("books")
                    .doc(
                        String(bookId)
                    );


            await ref.set(

                {

                    downloads:
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


            console.log(
                "⬇️ Book download:",
                bookId
            );


            return true;


        } catch (error) {

            console.error(
                "❌ Book download error:",
                error
            );

            return false;

        }

    }


    window.incrementBookDownload =
        incrementBookDownload;


    /* =====================================================
       CURRENT USER
       ===================================================== */

    function getCurrentUser() {

        return auth.currentUser ||
            null;

    }


    window.getCurrentUser =
        getCurrentUser;


    /* =====================================================
       FIREBASE CONNECTION TEST
       ===================================================== */

    async function testFirebaseConnection() {

        try {

            await db
                .collection("counter")
                .doc("visitors")
                .get();


            console.log(
                "🔥 Firestore connection OK"
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


    window.testFirebaseConnection =
        testFirebaseConnection;


    /* =====================================================
       START VISITOR COUNTER
       ===================================================== */

    function startFirebase() {

        updateVisitorCounter();

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startFirebase
        );

    } else {

        startFirebase();

    }


    /* =====================================================
       ADMIN AUTH
       ===================================================== */

    checkAdmin();


    /* =====================================================
       FIREBASE READY
       ===================================================== */

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

}

