/* =========================================================
   CHISHTI LIBRARY
   FIREBASE.JS
   FIREBASE COMPAT VERSION
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       FIREBASE CONFIG
    ===================================================== */

    const firebaseConfig = {

        apiKey: "YOUR_API_KEY",

        authDomain:
            "chishti-library.firebaseapp.com",

        projectId:
            "chishti-library",

        storageBucket:
            "chishti-library.firebasestorage.app",

        messagingSenderId:
            "103447043162",

        appId:
            "YOUR_APP_ID",

        measurementId:
            "G-833P7N3LNT"

    };


    /* =====================================================
       PREVENT DUPLICATE INITIALIZATION
    ===================================================== */

    if (!firebase.apps.length) {

        firebase.initializeApp(
            firebaseConfig
        );

    }


    /* =====================================================
       SERVICES
    ===================================================== */

    window.auth =
        firebase.auth();

    window.db =
        firebase.firestore();

    window.storage =
        firebase.storage();


    /* =====================================================
       FIREBASE READY
    ===================================================== */

    console.log(
        "✅ Chishti Firebase initialized"
    );

    console.log(
        "🔥 Firestore:",
        !!window.db
    );

    console.log(
        "🔥 Storage:",
        !!window.storage
    );

    console.log(
        "🔥 Auth:",
        !!window.auth
    );

})();
