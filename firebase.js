"use strict";

/*
=========================================================
CHISHTI LIBRARY
FIREBASE.JS
FINAL ADMIN + WEBSITE FIREBASE SYSTEM
=========================================================
*/

(function () {

    /*=====================================================
      FIREBASE CONFIG
    =====================================================*/

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


    /*=====================================================
      CHECK FIREBASE
    =====================================================*/

    if (typeof firebase === "undefined") {

        console.error(
            "❌ Firebase SDK is not loaded."
        );

        return;

    }


    /*=====================================================
      INITIALIZE ONLY ONCE
    =====================================================*/

    if (!firebase.apps.length) {

        firebase.initializeApp(firebaseConfig);

        console.log(
            "🔥 Firebase initialized"
        );

    } else {

        console.log(
            "ℹ️ Firebase already initialized"
        );

    }


    /*=====================================================
      SERVICES
    =====================================================*/

    const db =
        firebase.firestore();

    const auth =
        firebase.auth();

    const storage =
        firebase.storage();


    window.db = db;
    window.auth = auth;
    window.storage = storage;


    window.firebaseReady = true;


    /*=====================================================
      HELPERS
    =====================================================*/

    window.firebaseServerTimestamp =
        firebase.firestore.FieldValue.serverTimestamp;

    window.firebaseIncrement =
        firebase.firestore.FieldValue.increment;


    /*=====================================================
      CURRENT USER
    =====================================================*/

    window.currentFirebaseUser = null;


    auth.onAuthStateChanged(function (user) {

        window.currentFirebaseUser =
            user || null;

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

        if (user) {

            console.log(
                "✅ Firebase User:",
                user.email || user.uid
            );

        } else {

            console.log(
                "ℹ️ No Firebase user logged in"
            );

        }

    });


    /*=====================================================
      ADMIN LOGIN
    =====================================================*/

    window.adminLogin = async function (
        email,
        password
    ) {

        if (!email || !password) {

            throw new Error(
                "Email and password are required."
            );

        }

        const result =
            await auth.signInWithEmailAndPassword(
                email.trim(),
                password
            );

        return result.user;

    };


    /*=====================================================
      LOGOUT
    =====================================================*/

    window.adminLogout = async function () {

        await auth.signOut();

    };


    /*=====================================================
      REQUIRE LOGIN
    =====================================================*/

    window.requireLogin = function () {

        if (window.currentFirebaseUser) {

            return true;

        }

        window.location.href =
            "admin.html";

        return false;

    };


    /*=====================================================
      CREATE BOOK
    =====================================================*/

    window.createBookId = function () {

        return db
            .collection("books")
            .doc()
            .id;

    };


    /*=====================================================
      GET ONE BOOK
    =====================================================*/

    window.getBook = async function (bookId) {

        const snap =
            await db
                .collection("books")
                .doc(bookId)
                .get();

        if (!snap.exists) {

            return null;

        }

        return {

            id: snap.id,

            ...snap.data()

        };

    };


    /*=====================================================
      GET ALL BOOKS
    =====================================================*/

    window.getAllBooks = async function () {

        const snap =
            await db
                .collection("books")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();

        const books = [];

        snap.forEach(function (doc) {

            books.push({

                id: doc.id,

                ...doc.data()

            });

        });

        return books;

    };


    /*=====================================================
      UPLOAD FIREBASE FILE
    =====================================================*/

    window.uploadFirebaseFile = async function (
        file,
        folder,
        fileName
    ) {

        if (!file) {

            throw new Error(
                "No file selected."
            );

        }

        const safeName =
            fileName ||
            Date.now() +
            "-" +
            file.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "-"
            );

        const path =
            folder +
            "/" +
            safeName;

        const ref =
            storage.ref(path);

        const upload =
            await ref.put(file);

        const url =
            await upload.ref.getDownloadURL();

        return {

            url: url,

            path: path

        };

    };


    /*=====================================================
      COVER UPLOAD
    =====================================================*/

    window.uploadBookCover = async function (
        file,
        bookId
    ) {

        if (!file) return null;

        if (!file.type.startsWith("image/")) {

            throw new Error(
                "Please select a valid image."
            );

        }

        return await uploadFirebaseFile(

            file,

            "books/" +
            bookId +
            "/cover",

            "cover-" +
            Date.now()

        );

    };


    /*=====================================================
      PDF UPLOAD
    =====================================================*/

    window.uploadBookPDF = async function (
        file,
        bookId
    ) {

        if (!file) {

            throw new Error(
                "Please select a PDF."
            );

        }

        if (
            file.type !==
            "application/pdf"
        ) {

            throw new Error(
                "Only PDF files are allowed."
            );

        }

        return await uploadFirebaseFile(

            file,

            "books/" +
            bookId +
            "/pdf",

            "book-" +
            Date.now() +
            ".pdf"

        );

    };


    /*=====================================================
      ADD BOOK
    =====================================================*/

    window.addBook = async function (
        bookData
    ) {

        const ref =
            db
                .collection("books")
                .doc();

        const data = {

            title:
                bookData.title || "",

            author:
                bookData.author || "",

            category:
                bookData.category || "Other",

            language:
                bookData.language || "Urdu",

            description:
                bookData.description || "",

            coverUrl:
                bookData.coverUrl || "",

            coverPath:
                bookData.coverPath || "",

            pdfUrl:
                bookData.pdfUrl || "",

            pdfPath:
                bookData.pdfPath || "",

            latest:
                Boolean(
                    bookData.latest
                ),

            views: 0,

            likes: 0,

            shares: 0,

            downloads: 0,

            comments: 0,

            createdAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),

            updatedAt:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };

        await ref.set(data);

        return ref.id;

    };


    /*=====================================================
      UPDATE BOOK
    =====================================================*/

    window.updateBook = async function (
        bookId,
        data
    ) {

        if (!bookId) {

            throw new Error(
                "Book ID missing."
            );

        }

        data.updatedAt =
            firebase.firestore
                .FieldValue
                .serverTimestamp();

        await db
            .collection("books")
            .doc(bookId)
            .update(data);

    };


    /*=====================================================
      DELETE BOOK
    =====================================================*/

    window.deleteBook = async function (
        bookId
    ) {

        if (!bookId) return;

        await db
            .collection("books")
            .doc(bookId)
            .delete();

    };


    /*=====================================================
      BOOK VIEW
    =====================================================*/

    window.addBookView = async function (
        bookId
    ) {

        if (!bookId) return;

        await db
            .collection("books")
            .doc(bookId)
            .update({

                views:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });

    };


    /*=====================================================
      BOOK LIKE
    =====================================================*/

    window.addBookLike = async function (
        bookId
    ) {

        if (!bookId) return;

        await db
            .collection("books")
            .doc(bookId)
            .update({

                likes:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });

    };


    /*=====================================================
      BOOK SHARE
    =====================================================*/

    window.addBookShare = async function (
        bookId
    ) {

        if (!bookId) return;

        await db
            .collection("books")
            .doc(bookId)
            .update({

                shares:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });

    };


    /*=====================================================
      BOOK DOWNLOAD
    =====================================================*/

    window.addBookDownload = async function (
        bookId
    ) {

        if (!bookId) return;

        await db
            .collection("books")
            .doc(bookId)
            .update({

                downloads:
                    firebase.firestore
                        .FieldValue
                        .increment(1)

            });

    };


    /*=====================================================
      ADD COMMENT
    =====================================================*/

    window.addBookComment = async function (
        bookId,
        commentData
    ) {

        const bookRef =
            db
                .collection("books")
                .doc(bookId);

        await bookRef
            .collection("comments")
            .add({

                name:
                    commentData.name ||
                    "Visitor",

                comment:
                    commentData.comment ||
                    "",

                createdAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            });

        await bookRef.update({

            comments:
                firebase.firestore
                    .FieldValue
                    .increment(1)

        });

    };


    /*=====================================================
      GET COMMENTS
    =====================================================*/

    window.getBookComments = async function (
        bookId
    ) {

        const snap =
            await db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();

        const comments = [];

        snap.forEach(function (doc) {

            comments.push({

                id: doc.id,

                bookId: bookId,

                ...doc.data()

            });

        });

        return comments;

    };


    /*=====================================================
      DELETE COMMENT
    =====================================================*/

    window.deleteBookComment =
        async function (
            bookId,
            commentId
        ) {

            await db
                .collection("books")
                .doc(bookId)
                .collection("comments")
                .doc(commentId)
                .delete();

            const bookRef =
                db
                    .collection("books")
                    .doc(bookId);

            const book =
                await bookRef.get();

            const current =
                Number(
                    book.data()?.comments || 0
                );

            await bookRef.update({

                comments:
                    Math.max(
                        0,
                        current - 1
                    )

            });

        };


    /*=====================================================
      ADD VISITOR
    =====================================================*/

    window.addVisitor = async function () {

        const ref =
            db
                .collection("statistics")
                .doc("main");

        await ref.set(

            {

                visitors:
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

    };


    /*=====================================================
      GET STATISTICS
    =====================================================*/

    window.getStatistics = async function () {

        const snap =
            await db
                .collection("statistics")
                .doc("main")
                .get();

        if (!snap.exists) {

            return {

                visitors: 0,

                views: 0,

                likes: 0,

                shares: 0,

                downloads: 0

            };

        }

        return snap.data();

    };


    /*=====================================================
      SET VISITOR COUNT
    =====================================================*/

    window.setVisitorCount =
        async function (number) {

            number =
                Math.max(
                    0,
                    Number(number) || 0
                );

            await db
                .collection("statistics")
                .doc("main")
                .set(

                    {

                        visitors: number,

                        updatedAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    },

                    {
                        merge: true
                    }

                );

            return number;

        };


    /*=====================================================
      CALCULATE BOOK STATISTICS
    =====================================================*/

    window.calculateBookStatistics =
        async function () {

            const snap =
                await db
                    .collection("books")
                    .get();

            let views = 0;

            let likes = 0;

            let shares = 0;

            let downloads = 0;

            let comments = 0;

            let latest = 0;


            snap.forEach(function (doc) {

                const book =
                    doc.data();

                views +=
                    Number(
                        book.views || 0
                    );

                likes +=
                    Number(
                        book.likes || 0
                    );

                shares +=
                    Number(
                        book.shares || 0
                    );

                downloads +=
                    Number(
                        book.downloads || 0
                    );

                comments +=
                    Number(
                        book.comments || 0
                    );

                if (
                    book.latest === true
                ) {

                    latest++;

                }

            });


            return {

                totalBooks:
                    snap.size,

                latestBooks:
                    latest,

                totalViews:
                    views,

                totalLikes:
                    likes,

                totalShares:
                    shares,

                totalDownloads:
                    downloads,

                totalComments:
                    comments

            };

        };


    /*=====================================================
      ERROR LOGGER
    =====================================================*/

    window.firebaseError =
        function (
            error,
            context
        ) {

            console.error(
                "🔥 Firebase Error:",
                context || "",
                error
            );

        };


    /*=====================================================
      READY
    =====================================================*/

    window.dispatchEvent(
        new CustomEvent(
            "firebaseReady"
        )
    );


    console.log(
        "===================================="
    );

    console.log(
        "🔥 CHISHTI LIBRARY FIREBASE"
    );

    console.log(
        "✅ Firestore"
    );

    console.log(
        "✅ Authentication"
    );

    console.log(
        "✅ Storage"
    );

    console.log(
        "✅ Visitor System"
    );

    console.log(
        "✅ Book Management"
    );

    console.log(
        "✅ Comment System"
    );

    console.log(
        "===================================="

    );

})();
