"use strict";

/*
=========================================================
 CHISHTI LIBRARY — BOOK SYSTEM
 book.js
=========================================================

 FEATURES
 - 19 Books
 - Search
 - Categories
 - Newest / Oldest / Popular
 - Firebase Views
 - Firebase Likes
 - Firebase Comments
 - Firebase Shares
 - Login / Logout
 - Email display
 - Google Login
 - One like per user
 - One view per user/session
 - Direct Reader links
=========================================================
*/


/* ======================================================
   BOOK DATABASE
====================================================== */

const books = [

    {
        id: 1,
        title: "Al-Rehman",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "hamd",
        categoryName: "Hamd",
        cover: "al-rehman-cover.png",
        pdf: "Al Rehman .. Latif Sajid.C.pdf",
        description: "99 Names of Allah Book Series by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 2,
        title: "Husn-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "husn-e-kainat-cover.png",
        pdf: "husn-e-kainat.pdf",
        description: "Naatiya Kalam by Hazrat Allama Saim Chishti."
    },

    {
        id: 3,
        title: "Shahdaye Karbala",
        author: "Hazrat Allama Saim Chishti",
        category: "manqabat",
        categoryName: "Manqabat",
        cover: "shahdaye karbala-cover.png",
        pdf: "shahdaye-karbala.pdf",
        description: "Karbala ke shuhada ke fazail par manqabat ki kitab."
    },

    {
        id: 4,
        title: "Shaheed Ibn-e-Shaheed",
        author: "Hazrat Allama Saim Chishti",
        category: "seerat",
        categoryName: "Seerat",
        cover: "shaheed-ibn-e-shaheed-cover.png",
        pdf: "shaheed-ibn-e-shaheed.pdf",
        description: "Historical Manqabat book by Hazrat Allama Saim Chishti."
    },

    {
        id: 5,
        title: "Nawaye Saim",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "Nawaye Saim-cover.png",
        pdf: "noori.pdf",
        description: "Naatiya Majmua by Hazrat Allama Saim Chishti."
    },

    {
        id: 6,
        title: "Kulliyat-e-Saim Chishti",
        author: "Hazrat Allama Saim Chishti",
        category: "kulliyat",
        categoryName: "Kulliyat",
        cover: "kulliyat e saim chishti-cover.png",
        pdf: "Kulliyat e Saim Chishti By Allama Saim Chishti.pdf",
        description: "Complete Kulliyat of Hazrat Allama Saim Chishti."
    },

    {
        id: 7,
        title: "Punjabi Maqala",
        author: "Hazrat Allama Saim Chishti",
        category: "maqala",
        categoryName: "Maqala",
        cover: "allamasaimchishtipunjbimaqala-cover.png",
        pdf: "allamasaimchishtipunjabimaqala-231010120010-3ca7944b (1).pdf",
        description: "Punjabi Maqala by Hazrat Allama Saim Chishti."
    },

    {
        id: 8,
        title: "Armaghan-e-Madina",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "Armaghan-e-Madina-By-Allama-Saim-Chishti-cover.webp",
        pdf: "armughan e madina.pdf",
        description: "Collection of Naats by Hazrat Allama Saim Chishti."
    },

    {
        id: 9,
        title: "Shan-e-Kainat",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "naat-cover2.png",
        pdf: "shan-e-kainat.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 10,
        title: "Rehmat Da Khazana",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "rehmatdakhazana-cover.png",
        pdf: "rehmatdakhazana.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 11,
        title: "Madinay Diyan Kaliyan",
        author: "Hazrat Allama Saim Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "madinydiankalinyan-cover.png",
        pdf: "madinydiankalinyan.pdf",
        description: "Naatiya Collection by Hazrat Allama Saim Chishti."
    },

    {
        id: 12,
        title: "Darooda Di Dali",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "naat",
        categoryName: "Naat",
        cover: "darooda di dali-cover..png",
        pdf: "Darooda Di Dali Pdf.pdf",
        description: "A Punjabi Naatiya book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 13,
        title: "Sbhy Hamdan Ne Rab Sohnay",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "hamd",
        categoryName: "Hamd",
        cover: "Sbhy Hamdan Ne Rab Sohnay-cover.jpeg",
        pdf: "Sbhy Hamdan Ne Rab Sohnay.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 14,
        title: "Saqi e Baghdad",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "manqabat",
        categoryName: "Manqabat",
        cover: "Saqi e Baghdad.cover.jpeg",
        pdf: "Saqi e Baghdad ....Final.pdf",
        description: "A Manqabat book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 15,
        title: "Rab de rang niraly hamdya punjabi",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "hamd",
        categoryName: "Hamd",
        cover: "Rab de rang niraly hamdya-cover.jpeg",
        pdf: "Rab de rang niraly hamdya punjabi.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 16,
        title: "Hammad Hico",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "hamd",
        categoryName: "Hamd",
        cover: "Hammad Hico-cover.jpeg",
        pdf: "Hamad Hico Book.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 17,
        title: "Mazhar E noor e Khuda",
        author: "Sahibzada Muhammad Latif Sajid Chishti",
        category: "hamd",
        categoryName: "Hamd",
        cover: "Mazhar E noor e Khuda-cover.png",
        pdf: "Mazhar E noor e Khuda.pdf",
        description: "A Hamd book by Sahibzada Muhammad Latif Sajid Chishti.",
        latest: true
    },

    {
        id: 18,
        title: "Ali Ali Hai",
        author: "Hazrat Allama Saim Chishti",
        category: "manqabat",
        categoryName: "Manqabat",
        cover: "ALI ALI HAI-COVER.png",
        pdf: "ALI ALI HAI BOOK SAIM CHISHTI BOOKS.pdf",
        description: "Manqabat book by Hazrat Allama Saim Chishti.",
        latest: true
    },

    {
        id: 19,
        title: "Al Batool",
        author: "Hazrat Allama Saim Chishti",
        category: "seerat",
        categoryName: "Seerat",
        cover: "Al-batool-cover.png",
        pdf: "AL-batool.pdf",
        description: "A Seerat book by Hazrat Allama Saim Chishti.",
        latest: true
    }

];


/* ======================================================
   GLOBAL STATE
====================================================== */

let currentCategory = "all";

let currentSort = "newest";

let currentBooks = [];

let currentCommentBookId = null;

let currentShareBookId = null;

let booksData = {};

let unsubscribeBookListeners = [];


/* ======================================================
   FIREBASE REFERENCES
====================================================== */

let db = null;

let auth = null;


/*
 * firebase.js should already initialize Firebase.
 */

try {

    if (
        typeof firebase !== "undefined" &&
        firebase.apps &&
        firebase.apps.length
    ) {

        db =
            firebase.firestore();

        auth =
            firebase.auth();

        console.log(
            "✅ book.js connected to Firebase"
        );

    } else {

        console.warn(
            "⚠️ Firebase is not initialized."
        );

    }

} catch (error) {

    console.error(
        "Firebase connection error:",
        error
    );

}


/* ======================================================
   ELEMENTS
====================================================== */

const booksContainer =
    document.getElementById(
        "booksContainer"
    );

const booksLoading =
    document.getElementById(
        "booksLoading"
    );

const emptyBooks =
    document.getElementById(
        "emptyBooks"
    );

const bookSearch =
    document.getElementById(
        "bookSearch"
    );

const bookCount =
    document.getElementById(
        "bookCount"
    );

const totalViews =
    document.getElementById(
        "totalViews"
    );

const totalLikes =
    document.getElementById(
        "totalLikes"
    );

const resultsText =
    document.getElementById(
        "resultsText"
    );

const bookSort =
    document.getElementById(
        "bookSort"
    );

const firebaseStatus =
    document.getElementById(
        "firebaseStatus"
    );

const firebaseStatusText =
    document.getElementById(
        "firebaseStatusText"
    );

const userStatusText =
    document.getElementById(
        "userStatusText"
    );

const userEmailText =
    document.getElementById(
        "userEmailText"
    );

const loginButton =
    document.getElementById(
        "loginButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const googleLoginButton =
    document.getElementById(
        "googleLoginButton"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const loginSubmit =
    document.getElementById(
        "loginSubmit"
    );

const commentModal =
    document.getElementById(
        "commentModal"
    );

const commentForm =
    document.getElementById(
        "commentForm"
    );

const commentsList =
    document.getElementById(
        "commentsList"
    );

const commentInput =
    document.getElementById(
        "commentInput"
    );

const commentBookTitle =
    document.getElementById(
        "commentBookTitle"
    );

const commentLoginHint =
    document.getElementById(
        "commentLoginHint"
    );

const submitComment =
    document.getElementById(
        "submitComment"
    );

const shareModal =
    document.getElementById(
        "shareModal"
    );

const shareUrl =
    document.getElementById(
        "shareUrl"
    );

const shareBookTitle =
    document.getElementById(
        "shareBookTitle"
    );

const toast =
    document.getElementById(
        "toast"
    );

const toastIcon =
    document.getElementById(
        "toastIcon"
    );

const toastMessage =
    document.getElementById(
        "toastMessage"
    );


/* ======================================================
   HTML ESCAPE
====================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* ======================================================
   NUMBER FORMAT
====================================================== */

function formatNumber(number) {

    const value =
        Number(number) || 0;

    return value.toLocaleString(
        "en-US"
    );

}


/* ======================================================
   TOAST
====================================================== */

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    if (!toast) return;

    if (toastMessage) {

        toastMessage.textContent =
            message;

    }

    if (toastIcon) {

        toastIcon.className =
            type === "error"
                ? "fas fa-circle-exclamation"
                : type === "warning"
                    ? "fas fa-triangle-exclamation"
                    : "fas fa-circle-check";

    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


/* ======================================================
   FIREBASE STATUS
====================================================== */

function setFirebaseStatus(
    online,
    text
) {

    if (firebaseStatus) {

        firebaseStatus.classList.toggle(
            "online",
            Boolean(online)
        );

        firebaseStatus.classList.toggle(
            "offline",
            !online
        );

    }

    if (firebaseStatusText) {

        firebaseStatusText.textContent =
            text;

    }

}


/* ======================================================
   BOOK REFERENCE
====================================================== */

function bookRef(bookId) {

    if (!db) {
        return null;
    }

    return db
        .collection("books")
        .doc(`book-${bookId}`);

}


/* ======================================================
   USER REFERENCE
====================================================== */

function userRef(
    bookId,
    uid
) {

    if (!db || !uid) {
        return null;
    }

    return bookRef(bookId)
        .collection("likes")
        .doc(uid);

}


/* ======================================================
   DEFAULT FIREBASE BOOK DATA
====================================================== */

function defaultBookData(book) {

    return {

        id: book.id,

        title: book.title,

        author: book.author,

        category: book.category,

        categoryName:
            book.categoryName,

        cover: book.cover,

        pdf: book.pdf,

        description:
            book.description,

        views: 0,

        likes: 0,

        shares: 0,

        comments: 0,

        downloads: 0,

        createdAt:
            firebase.firestore.FieldValue.serverTimestamp(),

        updatedAt:
            firebase.firestore.FieldValue.serverTimestamp()

    };

}


/* ======================================================
   INITIALIZE BOOK
====================================================== */

async function initializeBook(book) {

    if (!db) return;

    const ref =
        bookRef(book.id);

    if (!ref) return;

    try {

        const snapshot =
            await ref.get();

        if (!snapshot.exists) {

            await ref.set(
                defaultBookData(book)
            );

            console.log(
                "✅ Firebase book created:",
                book.title
            );

        }

    } catch (error) {

        console.error(
            "Firebase book error:",
            book.title,
            error
        );

    }

}


/* ======================================================
   INITIALIZE ALL BOOKS
====================================================== */

async function initializeAllBooks() {

    if (!db) {

        setFirebaseStatus(
            false,
            "Firebase unavailable"
        );

        return;

    }

    try {

        /*
         * Do not create all books with Promise.all
         * if Firestore rules are restrictive.
         */

        for (const book of books) {

            await initializeBook(book);

        }

        setFirebaseStatus(
            true,
            "Firebase Connected"
        );

    } catch (error) {

        console.error(
            "Book initialization error:",
            error
        );

        setFirebaseStatus(
            false,
            "Firebase Error"
        );

    }

}


/* ======================================================
   LOAD BOOK DATA
====================================================== */

async function loadBookData() {

    if (!db) return;

    for (
        const unsubscribe
        of unsubscribeBookListeners
    ) {

        try {
            unsubscribe();
        } catch (_) {}

    }

    unsubscribeBookListeners = [];


    for (const book of books) {

        const ref =
            bookRef(book.id);

        if (!ref) continue;


        const unsubscribe =
            ref.onSnapshot(

                function (snapshot) {

                    if (snapshot.exists) {

                        booksData[book.id] =
                            snapshot.data();

                    } else {

                        booksData[book.id] = {

                            views: 0,

                            likes: 0,

                            shares: 0,

                            comments: 0,

                            downloads: 0

                        };

                    }

                    updateCounters();

                    renderBooks();

                },

                function (error) {

                    console.error(
                        "Book listener error:",
                        book.title,
                        error
                    );

                }

            );


        unsubscribeBookListeners.push(
            unsubscribe
        );

    }

}


/* ======================================================
   GET BOOK STATS
====================================================== */

function getBookStats(bookId) {

    const data =
        booksData[bookId] || {};

    return {

        views:
            Number(data.views) || 0,

        likes:
            Number(data.likes) || 0,

        shares:
            Number(data.shares) || 0,

        comments:
            Number(data.comments) || 0,

        downloads:
            Number(data.downloads) || 0

    };

}


/* ======================================================
   UPDATE TOP COUNTERS
====================================================== */

function updateCounters() {

    let views = 0;

    let likes = 0;


    books.forEach(
        function (book) {

            const stats =
                getBookStats(book.id);

            views +=
                stats.views;

            likes +=
                stats.likes;

        }
    );


    if (totalViews) {

        totalViews.textContent =
            formatNumber(views);

    }


    if (totalLikes) {

        totalLikes.textContent =
            formatNumber(likes);

    }

}


/* ======================================================
   CURRENT USER
====================================================== */

function currentUser() {

    if (!auth) {
        return null;
    }

    return auth.currentUser;

}


/* ======================================================
   LOGIN REQUIRED
====================================================== */

function requireLogin() {

    if (currentUser()) {

        return true;

    }

    openModal(
        "loginModal"
    );

    showToast(
        "Please login first.",
        "warning"
    );

    return false;

}


/* ======================================================
   UPDATE USER UI
====================================================== */

function updateUserUI(user) {

    if (user) {

        if (userStatusText) {

            userStatusText.textContent =
                user.displayName ||
                "Logged-in User";

        }


        if (userEmailText) {

            userEmailText.textContent =
                user.email ||
                "Firebase user";

        }


        if (loginButton) {

            loginButton.style.display =
                "none";

        }


        if (logoutButton) {

            logoutButton.style.display =
                "inline-flex";

        }


        if (commentLoginHint) {

            commentLoginHint.textContent =
                "Logged in as " +
                (user.email || "User");

        }


        if (submitComment) {

            submitComment.disabled =
                false;

        }

    } else {

        if (userStatusText) {

            userStatusText.textContent =
                "Guest User";

        }


        if (userEmailText) {

            userEmailText.textContent =
                "Login to like, comment and share";

        }


        if (loginButton) {

            loginButton.style.display =
                "inline-flex";

        }


        if (logoutButton) {

            logoutButton.style.display =
                "none";

        }


        if (commentLoginHint) {

            commentLoginHint.textContent =
                "Login required";

        }


        if (submitComment) {

            submitComment.disabled =
                false;

        }

    }

}


/* ======================================================
   AUTH STATE
====================================================== */

function startAuthListener() {

    if (!auth) {

        updateUserUI(
            null
        );

        return;

    }


    auth.onAuthStateChanged(
        async function (user) {

            updateUserUI(
                user
            );


            if (user) {

                console.log(
                    "✅ Logged in:",
                    user.email
                );

                /*
                 * Re-render so like state can update.
                 */

                renderBooks();

            } else {

                console.log(
                    "👤 Guest user"
                );

                renderBooks();

            }

        }
    );

}


/* ======================================================
   EMAIL LOGIN
====================================================== */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!auth) {

                showLoginError(
                    "Firebase Authentication is not connected."
                );

                return;

            }


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    ?.value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    ?.value;


            if (!email || !password) {

                showLoginError(
                    "Email and password required."
                );

                return;

            }


            if (loginSubmit) {

                loginSubmit.disabled =
                    true;

                loginSubmit.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            }


            try {

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );


                closeModal(
                    "loginModal"
                );


                loginForm.reset();


                showToast(
                    "Login successful."
                );

            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                showLoginError(
                    firebaseAuthMessage(
                        error
                    )
                );

            } finally {

                if (loginSubmit) {

                    loginSubmit.disabled =
                        false;

                    loginSubmit.innerHTML =
                        '<i class="fas fa-right-to-bracket"></i> Login';

                }

            }

        }
    );

}


/* ======================================================
   GOOGLE LOGIN
====================================================== */

if (googleLoginButton) {

    googleLoginButton.addEventListener(
        "click",
        async function () {

            if (!auth) {

                showToast(
                    "Firebase Authentication is not connected.",
                    "error"
                );

                return;

            }


            try {

                const provider =
                    new firebase.auth.GoogleAuthProvider();


                await auth.signInWithPopup(
                    provider
                );


                closeModal(
                    "loginModal"
                );


                showToast(
                    "Google login successful."
                );

            } catch (error) {

                console.error(
                    "Google login error:",
                    error
                );


                showLoginError(
                    firebaseAuthMessage(
                        error
                    )
                );

            }

        }
    );

}


/* ======================================================
   LOGOUT
====================================================== */

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            if (!auth) return;

            try {

                await auth.signOut();

                showToast(
                    "Logged out successfully."
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }
    );

}


/* ======================================================
   AUTH ERROR MESSAGE
====================================================== */

function firebaseAuthMessage(
    error
) {

    const code =
        error?.code || "";


    switch (code) {

        case "auth/invalid-email":
            return "Invalid email address.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-credential":
            return "Email or password is incorrect.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        case "auth/popup-closed-by-user":
            return "Login popup was closed.";

        default:
            return error?.message ||
                "Authentication failed.";

    }

}


/* ======================================================
   LOGIN ERROR
====================================================== */

function showLoginError(
    message
) {

    if (!loginError) {

        showToast(
            message,
            "error"
        );

        return;

    }


    loginError.textContent =
        message;

    loginError.style.display =
        "block";

}


/* ======================================================
   LIKE CHECK
====================================================== */

async function checkLike(
    bookId
) {

    const user =
        currentUser();


    if (!db || !user) {

        return false;

    }


    try {

        const ref =
            userRef(
                bookId,
                user.uid
            );


        const snapshot =
            await ref.get();


        return snapshot.exists;

    } catch (error) {

        console.error(
            "Check like error:",
            error
        );

        return false;

    }

}


/* ======================================================
   LIKE / UNLIKE
====================================================== */

async function toggleLike(
    bookId,
    button
) {

    if (!requireLogin()) {

        return;

    }


    if (!db) {

        showToast(
            "Firebase unavailable.",
            "error"
        );

        return;

    }


    const user =
        currentUser();


    const ref =
        userRef(
            bookId,
            user.uid
        );


    const bookReference =
        bookRef(
            bookId
        );


    if (!ref || !bookReference) {

        return;

    }


    if (button) {

        button.disabled =
            true;

    }


    try {

        const snapshot =
            await ref.get();


        if (snapshot.exists) {

            /*
             * Unlike
             */

            await db.runTransaction(
                async function (transaction) {

                    const bookSnapshot =
                        await transaction.get(
                            bookReference
                        );


                    const data =
                        bookSnapshot.exists
                            ? bookSnapshot.data()
                            : {};


                    const likes =
                        Math.max(
                            0,
                            Number(data.likes) || 0
                        );


                    transaction.delete(
                        ref
                    );


                    transaction.update(
                        bookReference,
                        {

                            likes:
                                Math.max(
                                    0,
                                    likes - 1
                                ),

                            updatedAt:
                                firebase.firestore.FieldValue.serverTimestamp()

                        }
                    );

                }
            );


            showToast(
                "Like removed."
            );

        } else {

            /*
             * Like
             */

            await db.runTransaction(
                async function (transaction) {

                    const bookSnapshot =
                        await transaction.get(
                            bookReference
                        );


                    const data =
                        bookSnapshot.exists
                            ? bookSnapshot.data()
                            : {};


                    const likes =
                        Number(data.likes) || 0;


                    transaction.set(
                        ref,
                        {

                            uid:
                                user.uid,

                            email:
                                user.email || "",

                            createdAt:
                                firebase.firestore.FieldValue.serverTimestamp()

                        }
                    );


                    if (bookSnapshot.exists) {

                        transaction.update(
                            bookReference,
                            {

                                likes:
                                    likes + 1,

                                updatedAt:
                                    firebase.firestore.FieldValue.serverTimestamp()

                            }
                        );

                    } else {

                        transaction.set(
                            bookReference,
                            {

                                likes: 1,

                                views: 0,

                                shares: 0,

                                comments: 0,

                                downloads: 0

                            },
                            {
                                merge: true
                            }
                        );

                    }

                }
            );


            showToast(
                "Book liked ❤️"
            );

        }


        /*
         * Immediately update visual button.
         */

        if (button) {

            button.classList.toggle(
                "liked",
                !snapshot.exists
            );

        }

    } catch (error) {

        console.error(
            "Like error:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            showToast(
                "Firebase rules ne like allow nahi kiya.",
                "error"
            );

        } else {

            showToast(
                "Like failed.",
                "error"
            );

        }

    } finally {

        if (button) {

            button.disabled =
                false;

        }

        renderBooks();

    }

}


/* ======================================================
   VIEW
====================================================== */

async function registerView(
    bookId
) {

    if (!db) return;


    const user =
        currentUser();


    /*
     * Logged-in user:
     * one view per user.
     */

    if (user) {

        const viewRef =
            db
                .collection("books")
                .doc(`book-${bookId}`)
                .collection("views")
                .doc(user.uid);


        try {

            const existing =
                await viewRef.get();


            if (existing.exists) {

                return;

            }


            await db.runTransaction(
                async function (transaction) {

                    const bookReference =
                        bookRef(bookId);


                    const snapshot =
                        await transaction.get(
                            bookReference
                        );


                    const data =
                        snapshot.exists
                            ? snapshot.data()
                            : {};


                    const views =
                        Number(data.views) || 0;


                    transaction.set(
                        viewRef,
                        {

                            uid:
                                user.uid,

                            email:
                                user.email || "",

                            createdAt:
                                firebase.firestore.FieldValue.serverTimestamp()

                        }
                    );


                    transaction.set(
                        bookReference,
                        {

                            views:
                                views + 1,

                            updatedAt:
                                firebase.firestore.FieldValue.serverTimestamp()

                        },
                        {
                            merge: true
                        }
                    );

                }
            );


        } catch (error) {

            console.error(
                "View error:",
                error
            );

        }


        return;

    }


    /*
     * Guest user:
     * one view per browser/session.
     */

    const key =
        `chishti_view_${bookId}`;


    if (
        sessionStorage.getItem(
            key
        )
    ) {

        return;

    }


    try {

        const bookReference =
            bookRef(bookId);


        await bookReference.update({

            views:
                firebase.firestore.FieldValue.increment(1),

            updatedAt:
                firebase.firestore.FieldValue.serverTimestamp()

        });


        sessionStorage.setItem(
            key,
            "1"
        );

    } catch (error) {

        console.error(
            "Guest view error:",
            error
        );

    }

}


/* ======================================================
   SHARE
====================================================== */

async function shareBook(
    bookId
) {

    const book =
        books.find(
            item =>
                Number(item.id) ===
                Number(bookId)
        );


    if (!book) return;


    const readerLink =
        new URL(
            `./reader.html?book=${encodeURIComponent(book.pdf)}`,
            window.location.href
        ).href;


    currentShareBookId =
        bookId;


    if (shareBookTitle) {

        shareBookTitle.textContent =
            book.title;

    }


    if (shareUrl) {

        shareUrl.value =
            readerLink;

    }


    openModal(
        "shareModal"
    );


    /*
     * Firebase share counter
     */

    if (db) {

        try {

            await bookRef(
                bookId
            ).update({

                shares:
                    firebase.firestore.FieldValue.increment(1),

                updatedAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });

        } catch (error) {

            console.error(
                "Share counter error:",
                error
            );

        }

    }

}


/* ======================================================
   NATIVE SHARE
====================================================== */

const nativeShareButton =
    document.getElementById(
        "nativeShareButton"
    );


if (nativeShareButton) {

    nativeShareButton.addEventListener(
        "click",
        async function () {

            if (!currentShareBookId) {
                return;
            }


            const book =
                books.find(
                    item =>
                        Number(item.id) ===
                        Number(currentShareBookId)
                );


            if (!book) return;


            const url =
                new URL(
                    `./reader.html?book=${encodeURIComponent(book.pdf)}`,
                    window.location.href
                ).href;


            if (
                navigator.share
            ) {

                try {

                    await navigator.share({

                        title:
                            book.title,

                        text:
                            `Read ${book.title} on Chishti Library`,

                        url:
                            url

                    });

                    showToast(
                        "Book shared."
                    );

                } catch (error) {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        console.error(
                            "Native share error:",
                            error
                        );

                    }

                }

            } else {

                await copyText(
                    url
                );

            }

        }
    );

}


/* ======================================================
   COPY SHARE URL
====================================================== */

const copyShareUrl =
    document.getElementById(
        "copyShareUrl"
    );

const copyShareButton =
    document.getElementById(
        "copyShareButton"
    );


async function copyText(
    text
) {

    try {

        await navigator.clipboard.writeText(
            text
        );

        showToast(
            "Link copied."
        );

    } catch (error) {

        /*
         * Fallback
         */

        const input =
            document.createElement(
                "textarea"
            );


        input.value =
            text;

        input.style.position =
            "fixed";

        input.style.opacity =
            "0";


        document.body.appendChild(
            input
        );


        input.select();


        try {

            document.execCommand(
                "copy"
            );

            showToast(
                "Link copied."
            );

        } catch (_) {

            showToast(
                "Copy failed.",
                "error"
            );

        }


        input.remove();

    }

}


if (copyShareUrl) {

    copyShareUrl.addEventListener(
        "click",
        async function () {

            if (shareUrl) {

                await copyText(
                    shareUrl.value
                );

            }

        }
    );

}


if (copyShareButton) {

    copyShareButton.addEventListener(
        "click",
        async function () {

            if (shareUrl) {

                await copyText(
                    shareUrl.value
                );

            }

        }
    );

}


/* ======================================================
   COMMENTS
====================================================== */

async function openComments(
    bookId
) {

    const book =
        books.find(
            item =>
                Number(item.id) ===
                Number(bookId)
        );


    if (!book) return;


    currentCommentBookId =
        bookId;


    if (commentBookTitle) {

        commentBookTitle.textContent =
            book.title;

    }


    if (commentInput) {

        commentInput.value =
            "";

    }


    openModal(
        "commentModal"
    );


    await loadComments(
        bookId
    );

}


/* ======================================================
   LOAD COMMENTS
====================================================== */

async function loadComments(
    bookId
) {

    if (!commentsList) {
        return;
    }


    if (!db) {

        commentsList.innerHTML = `

            <div class="comments-empty">

                Firebase unavailable.

            </div>

        `;

        return;

    }


    commentsList.innerHTML = `

        <div class="comments-loading">

            <i class="fas fa-spinner fa-spin"></i>

            Loading comments...

        </div>

    `;


    try {

        const snapshot =
            await bookRef(bookId)
                .collection("comments")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(100)
                .get();


        if (snapshot.empty) {

            commentsList.innerHTML = `

                <div class="comments-empty">

                    <i class="far fa-comment-dots"></i>

                    <p>
                        No comments yet.
                    </p>

                    <small>
                        Be the first to comment.
                    </small>

                </div>

            `;

            return;

        }


        commentsList.innerHTML =
            "";


        snapshot.forEach(
            function (doc) {

                const data =
                    doc.data();


                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "comment-item";


                const name =
                    data.displayName ||
                    data.email ||
                    "User";


                const date =
                    formatCommentDate(
                        data.createdAt
                    );


                element.innerHTML = `

                    <div class="comment-avatar">

                        <i class="fas fa-user"></i>

                    </div>

                    <div class="comment-content">

                        <div class="comment-top">

                            <strong>
                                ${escapeHTML(name)}
                            </strong>

                            <span>
                                ${escapeHTML(date)}
                            </span>

                        </div>

                        <p>
                            ${escapeHTML(
                                data.text || ""
                            )}
                        </p>

                    </div>

                `;


                commentsList.appendChild(
                    element
                );

            }
        );


    } catch (error) {

        console.error(
            "Load comments error:",
            error
        );


        commentsList.innerHTML = `

            <div class="comments-empty">

                Unable to load comments.

            </div>

        `;

    }

}


/* ======================================================
   COMMENT DATE
====================================================== */

function formatCommentDate(
    timestamp
) {

    if (!timestamp) {

        return "Just now";

    }


    try {

        let date;


        if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(timestamp);

        }


        return date.toLocaleString(
            "en-US",
            {

                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric",

                hour:
                    "numeric",

                minute:
                    "2-digit"

            }
        );

    } catch (_) {

        return "Just now";

    }

}


/* ======================================================
   ADD COMMENT
====================================================== */

if (commentForm) {

    commentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!requireLogin()) {

                return;

            }


            if (!currentCommentBookId) {

                return;

            }


            const text =
                commentInput
                    ?.value
                    .trim();


            if (!text) {

                showToast(
                    "Write a comment first.",
                    "warning"
                );

                return;

            }


            const user =
                currentUser();


            if (!user || !db) {

                return;

            }


            if (submitComment) {

                submitComment.disabled =
                    true;

                submitComment.innerHTML =
                    '<i class="fas fa-spinner fa-spin"></i> Posting...';

            }


            try {

                const bookReference =
                    bookRef(
                        currentCommentBookId
                    );


                const commentReference =
                    bookReference
                        .collection(
                            "comments"
                        )
                        .doc();


                await db.runTransaction(
                    async function (transaction) {

                        const bookSnapshot =
                            await transaction.get(
                                bookReference
                            );


                        const data =
                            bookSnapshot.exists
                                ? bookSnapshot.data()
                                : {};


                        const comments =
                            Number(
                                data.comments
                            ) || 0;


                        transaction.set(
                            commentReference,
                            {

                                uid:
                                    user.uid,

                                email:
                                    user.email || "",

                                displayName:
                                    user.displayName ||
                                    user.email ||
                                    "User",

                                text:
                                    text,

                                createdAt:
                                    firebase.firestore.FieldValue.serverTimestamp()

                            }
                        );


                        transaction.set(
                            bookReference,
                            {

                                comments:
                                    comments + 1,

                                updatedAt:
                                    firebase.firestore.FieldValue.serverTimestamp()

                            },
                            {
                                merge: true
                            }
                        );

                    }
                );


                commentInput.value =
                    "";


                showToast(
                    "Comment added."
                );


                await loadComments(
                    currentCommentBookId
                );


                renderBooks();

            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );


                showToast(
                    error.code ===
                        "permission-denied"
                        ? "Firebase rules ne comment allow nahi kiya."
                        : "Comment failed.",
                    "error"
                );

            } finally {

                if (submitComment) {

                    submitComment.disabled =
                        false;

                    submitComment.innerHTML =
                        '<i class="fas fa-paper-plane"></i> Comment';

                }

            }

        }
    );

}


/* ======================================================
   CREATE BOOK CARD
====================================================== */

async function createBookCard(
    book
) {

    const stats =
        getBookStats(
            book.id
        );


    const card =
        document.createElement(
            "article"
        );


    card.className =
        "book-card";


    card.dataset.bookId =
        book.id;


    /*
     * Check current user's like.
     */

    let liked = false;


    if (currentUser()) {

        liked =
            await checkLike(
                book.id
            );

    }


    card.innerHTML = `

        <div class="book-cover">

            <img
                src="${escapeHTML(book.cover)}"
                alt="${escapeHTML(book.title)}"
                loading="lazy"
                onerror="this.src='./logo.png'"
            >


            <span class="book-category">

                ${escapeHTML(
                    book.categoryName
                )}

            </span>


            ${
                book.latest
                    ? `
                        <span class="latest-badge">

                            <i class="fas fa-star"></i>

                            NEW

                        </span>
                    `
                    : ""
            }


            <div class="book-cover-overlay">

                <button
                    class="read-button"
                    type="button"
                    data-action="read"
                    data-book-id="${book.id}">

                    <i class="fa-solid fa-book-open"></i>

                    Read Book

                </button>

            </div>

        </div>


        <div class="book-card-content">

            <h2>
                ${escapeHTML(
                    book.title
                )}
            </h2>


            <p class="book-author">

                <i class="fa-solid fa-user-pen"></i>

                ${escapeHTML(
                    book.author
                )}

            </p>


            <p class="book-description">

                ${escapeHTML(
                    book.description
                )}

            </p>


            <!-- BOOK STATS -->

            <div class="book-stats">

                <span
                    class="book-stat views"
                    title="Views">

                    <i class="fas fa-eye"></i>

                    <b>
                        ${formatNumber(
                            stats.views
                        )}
                    </b>

                </span>


                <button
                    class="book-stat like-action ${
                        liked
                            ? "liked"
                            : ""
                    }"
                    type="button"
                    data-action="like"
                    data-book-id="${book.id}"
                    title="Like">

                    <i class="${
                        liked
                            ? "fas"
                            : "far"
                    } fa-heart"></i>

                    <b>
                        ${formatNumber(
                            stats.likes
                        )}
                    </b>

                </button>


                <button
                    class="book-stat comment-action"
                    type="button"
                    data-action="comment"
                    data-book-id="${book.id}"
                    title="Comments">

                    <i class="far fa-comment"></i>

                    <b>
                        ${formatNumber(
                            stats.comments
                        )}
                    </b>

                </button>


                <button
                    class="book-stat share-action"
                    type="button"
                    data-action="share"
                    data-book-id="${book.id}"
                    title="Share">

                    <i class="fas fa-share-nodes"></i>

                    <b>
                        ${formatNumber(
                            stats.shares
                        )}
                    </b>

                </button>

            </div>


            <!-- FOOTER -->

            <div class="book-card-footer">

                <span>

                    <i class="fa-solid fa-book"></i>

                    Digital Edition

                </span>


                <button
                    class="open-book-button"
                    type="button"
                    data-action="read"
                    data-book-id="${book.id}">

                    Open

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        </div>

    `;


    /*
     * Register a view when card becomes visible.
     */

    registerView(
        book.id
    );


    return card;

}


/* ======================================================
   OPEN BOOK / READER
====================================================== */

function openBook(
    bookId
) {

    const book =
        books.find(
            item =>
                Number(item.id) ===
                Number(bookId)
        );


    if (!book) {

        console.error(
            "Book not found:",
            bookId
        );

        return;

    }


    const pdfFile =
        String(
            book.pdf || ""
        ).trim();


    if (!pdfFile) {

        showToast(
            "This book PDF is not configured.",
            "error"
        );

        return;

    }


    const extension =
        pdfFile
            .split("?")[0]
            .split(".")
            .pop()
            .toLowerCase();


    if (extension !== "pdf") {

        showToast(
            "Valid PDF file not found.",
            "error"
        );

        return;

    }


    const readerURL =
        "./reader.html?book=" +
        encodeURIComponent(
            pdfFile
        );


    window.location.href =
        readerURL;

}


/* ======================================================
   BOOK ACTIONS
====================================================== */

if (booksContainer) {

    booksContainer.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;


            const bookId =
                Number(
                    button.dataset.bookId
                );


            if (!bookId) {
                return;
            }


            switch (action) {

                case "read":

                    openBook(
                        bookId
                    );

                    break;


                case "like":

                    await toggleLike(
                        bookId,
                        button
                    );

                    break;


                case "comment":

                    await openComments(
                        bookId
                    );

                    break;


                case "share":

                    await shareBook(
                        bookId
                    );

                    break;

            }

        }
    );

}


/* ======================================================
   FILTER BOOKS
====================================================== */

function getFilteredBooks() {

    const query =
        bookSearch
            ? bookSearch.value
                .trim()
                .toLowerCase()
            : "";


    let filtered =
        books.filter(
            function (book) {

                const categoryMatch =
                    currentCategory ===
                        "all" ||
                    book.category ===
                        currentCategory;


                const searchText =
                    (
                        book.title +
                        " " +
                        book.author +
                        " " +
                        book.categoryName +
                        " " +
                        book.description
                    )
                    .toLowerCase();


                const searchMatch =
                    !query ||
                    searchText.includes(
                        query
                    );


                return (
                    categoryMatch &&
                    searchMatch
                );

            }
        );


    /*
     * SORT
     */

    if (
        currentSort ===
        "oldest"
    ) {

        filtered.sort(
            function (a, b) {

                return a.id - b.id;

            }
        );

    }


    else if (
        currentSort ===
        "popular"
    ) {

        filtered.sort(
            function (a, b) {

                const aStats =
                    getBookStats(
                        a.id
                    );

                const bStats =
                    getBookStats(
                        b.id
                    );


                return (
                    (
                        bStats.views +
                        bStats.likes * 3 +
                        bStats.comments * 2 +
                        bStats.shares * 2
                    )
                    -
                    (
                        aStats.views +
                        aStats.likes * 3 +
                        aStats.comments * 2 +
                        aStats.shares * 2
                    )
                );

            }
        );

    }


    else if (
        currentSort ===
        "most-liked"
    ) {

        filtered.sort(
            function (a, b) {

                return (
                    getBookStats(
                        b.id
                    ).likes
                    -
                    getBookStats(
                        a.id
                    ).likes
                );

            }
        );

    }


    else if (
        currentSort ===
        "most-viewed"
    ) {

        filtered.sort(
            function (a, b) {

                return (
                    getBookStats(
                        b.id
                    ).views
                    -
                    getBookStats(
                        a.id
                    ).views
                );

            }
        );

    }


    else {

        /*
         * Newest
         */

        filtered.sort(
            function (a, b) {

                return b.id - a.id;

            }
        );

    }


    return filtered;

}


/* ======================================================
   RENDER BOOKS
====================================================== */

let renderTimer = null;


async function renderBooks() {

    if (!booksContainer) {
        return;
    }


    clearTimeout(
        renderTimer
    );


    /*
     * Prevent too many renders from
     * Firestore snapshot events.
     */

    renderTimer =
        setTimeout(
            async function () {

                const filteredBooks =
                    getFilteredBooks();


                currentBooks =
                    filteredBooks;


                booksContainer.innerHTML =
                    "";


                if (bookCount) {

                    bookCount.textContent =
                        filteredBooks.length;

                }


                if (resultsText) {

                    resultsText.textContent =
                        `${filteredBooks.length} book${
                            filteredBooks.length === 1
                                ? ""
                                : "s"
                        } found`;

                }


                if (!filteredBooks.length) {

                    if (emptyBooks) {

                        emptyBooks.style.display =
                            "block";

                    }


                    if (booksLoading) {

                        booksLoading.style.display =
                            "none";

                    }

                    return;

                }


                if (emptyBooks) {

                    emptyBooks.style.display =
                        "none";

                }


                if (booksLoading) {

                    booksLoading.style.display =
                        "none";

                }


                const fragment =
                    document.createDocumentFragment();


                /*
                 * Sequential creation prevents
                 * Firebase requests from exploding.
                 */

                for (
                    const book
                    of filteredBooks
                ) {

                    const card =
                        await createBookCard(
                            book
                        );


                    fragment.appendChild(
                        card
                    );

                }


                booksContainer.appendChild(
                    fragment
                );


            },
            100
        );

}


/* ======================================================
   SEARCH
====================================================== */

if (bookSearch) {

    bookSearch.addEventListener(
        "input",
        function () {

            renderBooks();

        }
    );

}


/* ======================================================
   CATEGORY
====================================================== */

document
    .querySelectorAll(
        ".category"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".category"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    this.classList.add(
                        "active"
                    );


                    currentCategory =
                        this.dataset.category ||
                        "all";


                    renderBooks();

                }
            );

        }
    );


/* ======================================================
   SORT
====================================================== */

if (bookSort) {

    bookSort.addEventListener(
        "change",
        function () {

            currentSort =
                this.value ||
                "newest";


            renderBooks();

        }
    );

}


/* ======================================================
   RESET FILTERS
====================================================== */

const resetFilters =
    document.getElementById(
        "resetFilters"
    );


if (resetFilters) {

    resetFilters.addEventListener(
        "click",
        function () {

            currentCategory =
                "all";

            currentSort =
                "newest";


            if (bookSearch) {

                bookSearch.value =
                    "";

            }


            if (bookSort) {

                bookSort.value =
                    "newest";

            }


            document
                .querySelectorAll(
                    ".category"
                )
                .forEach(
                    function (button) {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


            const allButton =
                document.querySelector(
                    '[data-category="all"]'
                );


            if (allButton) {

                allButton.classList.add(
                    "active"
                );

            }


            renderBooks();

        }
    );

}


/* ======================================================
   MODAL HELPERS
====================================================== */

function openModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(
    id
) {

    const modal =
        document.getElementById(
            id
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
     * Only remove body lock if no
     * modal remains open.
     */

    const anotherModal =
        document.querySelector(
            ".modal.show"
        );


    if (!anotherModal) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* ======================================================
   CLOSE BUTTONS
====================================================== */

const closeLoginModal =
    document.getElementById(
        "closeLoginModal"
    );

const closeCommentModal =
    document.getElementById(
        "closeCommentModal"
    );

const closeShareModal =
    document.getElementById(
        "closeShareModal"
    );


if (closeLoginModal) {

    closeLoginModal.addEventListener(
        "click",
        function () {

            closeModal(
                "loginModal"
            );

        }
    );

}


if (closeCommentModal) {

    closeCommentModal.addEventListener(
        "click",
        function () {

            closeModal(
                "commentModal"
            );

        }
    );

}


if (closeShareModal) {

    closeShareModal.addEventListener(
        "click",
        function () {

            closeModal(
                "shareModal"
            );

        }
    );

}


/* ======================================================
   MODAL OVERLAYS
====================================================== */

document
    .querySelectorAll(
        "[data-close-modal]"
    )
    .forEach(
        function (element) {

            element.addEventListener(
                "click",
                function () {

                    closeModal(
                        "loginModal"
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-close-comment]"
    )
    .forEach(
        function (element) {

            element.addEventListener(
                "click",
                function () {

                    closeModal(
                        "commentModal"
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        "[data-close-share]"
    )
    .forEach(
        function (element) {

            element.addEventListener(
                "click",
                function () {

                    closeModal(
                        "shareModal"
                    );

                }
            );

        }
    );


/* ======================================================
   ESC KEY
====================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal(
                "loginModal"
            );

            closeModal(
                "commentModal"
            );

            closeModal(
                "shareModal"
            );

        }

    }
);


/* ======================================================
   START
====================================================== */

async function startBookSystem() {

    console.log(
        "===================================="
    );

    console.log(
        "📚 CHISHTI LIBRARY BOOK SYSTEM"
    );


    /*
     * Show loading
     */

    if (booksLoading) {

        booksLoading.style.display =
            "flex";

    }


    /*
     * Authentication listener
     */

    startAuthListener();


    /*
     * Initialize Firebase books.
     */

    await initializeAllBooks();


    /*
     * Start real-time listeners.
     */

    await loadBookData();


    /*
     * First render.
     */

    await renderBooks();


    console.log(
        "📚 Total books:",
        books.length
    );

    console.log(
        "❤️ Firebase Likes: READY"
    );

    console.log(
        "👁 Firebase Views: READY"
    );

    console.log(
        "💬 Firebase Comments: READY"
    );

    console.log(
        "↗️ Firebase Shares: READY"
    );

    console.log(
        "📖 Reader links: READY"
    );

    console.log(
        "🚀 CHISHTI BOOK SYSTEM READY"
    );

}


/* ======================================================
   WAIT FOR DOM
====================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startBookSystem
    );

} else {

    startBookSystem();

}
