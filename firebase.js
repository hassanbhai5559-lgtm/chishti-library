"use strict";

/*
=========================================================
CHISHTI LIBRARY
FIREBASE.JS
=========================================================

Firebase Authentication
Firestore Database
Firebase Storage

USED FOR:

• Admin Login
• Book Data
• PDF Upload
• Cover Upload
• Visitors
• Views
• Likes
• Shares
• Downloads
• Comments
• Latest Books
=========================================================
*/


/*=========================================================
 FIREBASE CONFIG
=========================================================*/

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


/*=========================================================
 FIREBASE INITIALIZE
=========================================================*/

if (
    typeof firebase === "undefined"
) {

    console.error(
        "❌ Firebase SDK is not loaded."
    );

    window.firebaseReady = false;

}

else {

    if (!firebase.apps.length) {

        firebase.initializeApp(
            firebaseConfig
        );

    }


    /*=====================================================
     FIREBASE SERVICES
    =====================================================*/

    window.db =
        firebase.firestore();

    window.auth =
        firebase.auth();

    window.storage =
        firebase.storage();


    window.firebaseReady = true;


    /*=====================================================
     FIREBASE HELPERS
    =====================================================*/

    window.firebaseServerTimestamp =
        firebase.firestore
            .FieldValue
            .serverTimestamp;


    window.firebaseIncrement =
        firebase.firestore
            .FieldValue
            .increment;


    /*=====================================================
     CURRENT USER
    =====================================================*/

    window.currentFirebaseUser = null;


    /*=====================================================
     AUTH STATE
    =====================================================*/

    auth.onAuthStateChanged(
        function (user) {

            window.currentFirebaseUser =
                user || null;


            window.dispatchEvent(
                new CustomEvent(
                    "firebaseAuthChanged",
                    {
                        detail: {
                            user:
                                user || null
                        }
                    }
                )
            );


            if (user) {

                console.log(
                    "✅ Firebase User:",
                    user.email || user.uid
                );

            }

            else {

                console.log(
                    "ℹ️ Firebase: No user logged in"
                );

            }

        }
    );


    /*=====================================================
     ADMIN LOGIN
    =====================================================*/

    window.adminLogin =
        async function (
            email,
            password
        ) {

            try {

                const result =
                    await auth
                        .signInWithEmailAndPassword(
                            email,
                            password
                        );


                console.log(
                    "✅ Admin login successful"
                );


                return result.user;

            }

            catch (error) {

                console.error(
                    "❌ Admin Login Error:",
                    error
                );

                throw error;

            }

        };


    /*=====================================================
     LOGOUT
    =====================================================*/

    window.adminLogout =
        async function () {

            try {

                await auth.signOut();

                console.log(
                    "✅ Logged out"
                );

            }

            catch (error) {

                console.error(
                    "❌ Logout Error:",
                    error
                );

                throw error;

            }

        };


    /*=====================================================
     REQUIRE LOGIN
    =====================================================*/

    window.requireLogin =
        function () {

            if (
                window.currentFirebaseUser
            ) {

                return true;

            }


            const login =
                confirm(
                    "Please login first."
                );


            if (login) {

                window.location.href =
                    "./login.html";

            }


            return false;

        };


    /*=====================================================
     CREATE BOOK ID
    =====================================================*/

    window.createBookId =
        function () {

            return db
                .collection("books")
                .doc()
                .id;

        };


    /*=====================================================
     GET BOOK
    =====================================================*/

    window.getBook =
        async function (
            bookId
        ) {

            const doc =
                await db
                    .collection("books")
                    .doc(bookId)
                    .get();


            if (!doc.exists) {

                return null;

            }


            return {

                id: doc.id,

                ...doc.data()

            };

        };


    /*=====================================================
     GET ALL BOOKS
    =====================================================*/

    window.getAllBooks =
        async function () {

            const snapshot =
                await db
                    .collection("books")
                    .orderBy(
                        "createdAt",
                        "desc"
                    )
                    .get();


            const books = [];


            snapshot.forEach(
                function (doc) {

                    books.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            return books;

        };


    /*=====================================================
     UPLOAD FILE
    =====================================================*/

    window.uploadFirebaseFile =
        async function (
            file,
            folder,
            fileName
        ) {

            if (!file) {

                throw new Error(
                    "No file selected."
                );

            }


            const extension =
                file.name
                    .split(".")
                    .pop()
                    .toLowerCase();


            const safeName =
                fileName ||
                Date.now() +
                "." +
                extension;


            const path =
                folder +
                "/" +
                safeName;


            const reference =
                storage.ref(path);


            const snapshot =
                await reference.put(file);


            const downloadURL =
                await snapshot.ref
                    .getDownloadURL();


            return {

                url:
                    downloadURL,

                path:
                    path

            };

        };


    /*=====================================================
     UPLOAD BOOK COVER
    =====================================================*/

    window.uploadBookCover =
        async function (
            file,
            bookId
        ) {

            if (!file) {

                return null;

            }


            return await
                uploadFirebaseFile(

                    file,

                    "books/" +
                    bookId +
                    "/cover",

                    "cover-" +
                    Date.now()

                );

        };


    /*=====================================================
     UPLOAD BOOK PDF
    =====================================================*/

    window.uploadBookPDF =
        async function (
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


            return await
                uploadFirebaseFile(

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

    window.addBook =
        async function (
            bookData
        ) {

            const bookRef =
                db
                    .collection("books")
                    .doc();


            const data = {

                title:
                    bookData.title || "",

                author:
                    bookData.author || "",

                category:
                    bookData.category ||
                    "Other",

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


            await bookRef.set(data);


            console.log(
                "✅ Book added:",
                bookRef.id
            );


            return bookRef.id;

        };


    /*=====================================================
     UPDATE BOOK
    =====================================================*/

    window.updateBook =
        async function (
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


            console.log(
                "✅ Book updated:",
                bookId
            );

        };


    /*=====================================================
     DELETE BOOK
    =====================================================*/

    window.deleteBook =
        async function (
            bookId
        ) {

            if (!bookId) {

                throw new Error(
                    "Book ID missing."
                );

            }


            await db
                .collection("books")
                .doc(bookId)
                .delete();


            console.log(
                "🗑️ Book deleted:",
                bookId
            );

        };


    /*=====================================================
     BOOK VIEW
    =====================================================*/

    window.addBookView =
        async function (
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

    window.addBookLike =
        async function (
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

    window.addBookShare =
        async function (
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

    window.addBookDownload =
        async function (
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
     COMMENTS
    =====================================================*/

    window.addBookComment =
        async function (
            bookId,
            commentData
        ) {

            if (!bookId) {

                throw new Error(
                    "Book ID missing."
                );

            }


            await db
                .collection("books")
                .doc(bookId)
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


            await db
                .collection("books")
                .doc(bookId)
                .update({

                    comments:
                        firebase.firestore
                            .FieldValue
                            .increment(1)

                });

        };


    /*=====================================================
     GET COMMENTS
    =====================================================*/

    window.getBookComments =
        async function (
            bookId
        ) {

            const snapshot =
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


            snapshot.forEach(
                function (doc) {

                    comments.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            return comments;

        };


    /*=====================================================
     VISITOR COUNTER
    =====================================================*/

    window.addVisitor =
        async function () {

            const visitorRef =
                db
                    .collection("statistics")
                    .doc("main");


            await visitorRef.set(

                {

                    visitors:
                        firebase.firestore
                            .FieldValue
                            .increment(1)

                },

                {

                    merge: true

                }

            );


            console.log(
                "👤 Visitor counted"
            );

        };


    /*=====================================================
     GET STATISTICS
    =====================================================*/

    window.getStatistics =
        async function () {

            const doc =
                await db
                    .collection("statistics")
                    .doc("main")
                    .get();


            if (!doc.exists) {

                return {

                    visitors: 0,

                    views: 0,

                    likes: 0,

                    shares: 0,

                    downloads: 0

                };

            }


            return doc.data();

        };


    /*=====================================================
     TOTAL BOOK STATISTICS
    =====================================================*/

    window.calculateBookStatistics =
        async function () {

            const snapshot =
                await db
                    .collection("books")
                    .get();


            let views = 0;

            let likes = 0;

            let shares = 0;

            let downloads = 0;

            let latest = 0;


            snapshot.forEach(
                function (doc) {

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


                    if (
                        book.latest === true
                    ) {

                        latest++;

                    }

                }
            );


            return {

                totalBooks:
                    snapshot.size,

                latestBooks:
                    latest,

                totalViews:
                    views,

                totalLikes:
                    likes,

                totalShares:
                    shares,

                totalDownloads:
                    downloads

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
     READY EVENT
    =====================================================*/

    window.dispatchEvent(

        new CustomEvent(
            "firebaseReady"
        )

    );


    /*=====================================================
     CONSOLE
    =====================================================*/

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
        "✅ Storage ready"
    );

    console.log(
        "✅ Book system ready"
    );

    console.log(
        "✅ Visitor system ready"
    );

    console.log(
        "===================================="
    );

}
