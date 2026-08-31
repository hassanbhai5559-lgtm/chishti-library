/* =========================================================
   CHISHTI LIBRARY
   ADMIN.JS
   FULL FIREBASE ADMIN PANEL
   =========================================================

   REQUIRED:
   - firebase.js must initialize Firebase
   - admin.html loads:
       firebase-app-compat.js
       firebase-auth-compat.js
       firebase-firestore-compat.js
       firebase-storage-compat.js

   FIREBASE OBJECTS USED:
       firebase
       firebase.auth()
       firebase.firestore()
       firebase.storage()

   FIRESTORE COLLECTION:
       books
       comments

   BOOK DOCUMENT:
       title
       author
       category
       language
       description
       cover
       pdf
       latest
       views
       likes
       shares
       downloads
       createdAt
       updatedAt
========================================================= */

"use strict";


/* =========================================================
   FIREBASE
========================================================= */

let auth = null;
let db = null;
let storage = null;

try {

    if (
        typeof firebase === "undefined"
    ) {

        throw new Error(
            "Firebase is not loaded."
        );

    }

    auth =
        firebase.auth();

    db =
        firebase.firestore();

    storage =
        firebase.storage();

    console.log(
        "✅ Firebase connected"
    );

} catch (error) {

    console.error(
        "❌ Firebase initialization error:",
        error
    );

    alert(
        "Firebase could not be initialized.\n\nCheck firebase.js."
    );

}


/* =========================================================
   COLLECTIONS
========================================================= */

const BOOKS_COLLECTION =
    "books";

const COMMENTS_COLLECTION =
    "comments";


/* =========================================================
   DOM
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );

const adminApp =
    document.getElementById(
        "adminApp"
    );

const loginForm =
    document.getElementById(
        "loginForm"
    );

const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );

const loginError =
    document.getElementById(
        "loginError"
    );

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

const adminEmail =
    document.getElementById(
        "adminEmail"
    );

const booksTable =
    document.getElementById(
        "booksTable"
    );

const bookForm =
    document.getElementById(
        "bookForm"
    );

const editingBookId =
    document.getElementById(
        "editingBookId"
    );

const bookTitle =
    document.getElementById(
        "bookTitle"
    );

const bookAuthor =
    document.getElementById(
        "bookAuthor"
    );

const bookCategory =
    document.getElementById(
        "bookCategory"
    );

const bookLanguage =
    document.getElementById(
        "bookLanguage"
    );

const bookDescription =
    document.getElementById(
        "bookDescription"
    );

const coverFile =
    document.getElementById(
        "coverFile"
    );

const pdfFile =
    document.getElementById(
        "pdfFile"
    );

const coverStatus =
    document.getElementById(
        "coverStatus"
    );

const pdfStatus =
    document.getElementById(
        "pdfStatus"
    );

const bookLatest =
    document.getElementById(
        "bookLatest"
    );

const saveBookBtn =
    document.getElementById(
        "saveBookBtn"
    );

const cancelEdit =
    document.getElementById(
        "cancelEdit"
    );

const bookMessage =
    document.getElementById(
        "bookMessage"
    );

const bookFormTitle =
    document.getElementById(
        "bookFormTitle"
    );

const commentsContainer =
    document.getElementById(
        "commentsContainer"
    );

const totalBooks =
    document.getElementById(
        "totalBooks"
    );

const totalVisitors =
    document.getElementById(
        "totalVisitors"
    );

const totalViews =
    document.getElementById(
        "totalViews"
    );

const totalLikes =
    document.getElementById(
        "totalLikes"
    );

const totalShares =
    document.getElementById(
        "totalShares"
    );

const totalDownloads =
    document.getElementById(
        "totalDownloads"
    );

const goAddBook =
    document.getElementById(
        "goAddBook"
    );


/* =========================================================
   STATE
========================================================= */

let allBooks = [];

let unsubscribeBooks = null;

let unsubscribeComments = null;

let editingBook = null;


/* =========================================================
   UTILITIES
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(value) {

    return escapeHTML(
        value
    );

}


function getNumber(value) {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


function formatNumber(value) {

    return getNumber(value)
        .toLocaleString();

}


function formatDate(timestamp) {

    if (!timestamp) {

        return "—";

    }

    try {

        let date;

        if (
            timestamp instanceof
            firebase.firestore.Timestamp
        ) {

            date =
                timestamp.toDate();

        } else if (
            timestamp.toDate
        ) {

            date =
                timestamp.toDate();

        } else {

            date =
                new Date(
                    timestamp
                );

        }

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";

        }

        return date.toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch (error) {

        return "—";

    }

}


/* =========================================================
   MESSAGE
========================================================= */

function showBookMessage(
    message,
    type = "success"
) {

    if (!bookMessage) {
        return;
    }

    bookMessage.textContent =
        message;

    bookMessage.className =
        `admin-message ${type}`;

}


function clearBookMessage() {

    if (!bookMessage) {
        return;
    }

    bookMessage.textContent =
        "";

    bookMessage.className =
        "admin-message";

}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginError(
    message
) {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        message;

    loginError.className =
        "login-error";

}


function clearLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent =
        "";

}


/* =========================================================
   SHOW / HIDE ADMIN
========================================================= */

function showAdmin() {

    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }

    if (adminApp) {

        adminApp.classList.remove(
            "hidden"
        );

    }

}


function showLogin() {

    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

    if (adminApp) {

        adminApp.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   AUTH STATE
========================================================= */

if (auth) {

    auth.onAuthStateChanged(
        function (user) {

            if (user) {

                console.log(
                    "✅ Admin authenticated:",
                    user.email
                );

                showAdmin();

                if (adminEmail) {

                    adminEmail.textContent =
                        user.email ||
                        "Admin";

                }

                startAdminData();

            } else {

                console.log(
                    "ℹ️ No admin logged in"
                );

                stopAdminData();

                showLogin();

            }

        }
    );

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            clearLoginError();

            const email =
                loginEmail
                    ? loginEmail.value.trim()
                    : "";

            const password =
                loginPassword
                    ? loginPassword.value
                    : "";

            if (!email || !password) {

                showLoginError(
                    "Please enter email and password."
                );

                return;

            }

            const button =
                loginForm.querySelector(
                    "button[type='submit']"
                );

            const oldText =
                button
                    ? button.innerHTML
                    : "";

            try {

                if (button) {

                    button.disabled =
                        true;

                    button.innerHTML =
                        "⏳ Logging in...";

                }

                await auth.signInWithEmailAndPassword(
                    email,
                    password
                );

                console.log(
                    "✅ Login successful"
                );

            } catch (error) {

                console.error(
                    "❌ Login failed:",
                    error
                );

                let message =
                    "Login failed.";

                switch (
                    error.code
                ) {

                    case "auth/invalid-credential":

                        message =
                            "Email or password is incorrect.";

                        break;

                    case "auth/invalid-email":

                        message =
                            "Please enter a valid email.";

                        break;

                    case "auth/user-disabled":

                        message =
                            "This admin account is disabled.";

                        break;

                    case "auth/user-not-found":

                        message =
                            "Admin account was not found.";

                        break;

                    case "auth/wrong-password":

                        message =
                            "Incorrect password.";

                        break;

                    case "auth/too-many-requests":

                        message =
                            "Too many login attempts. Try again later.";

                        break;

                    default:

                        message =
                            error.message ||
                            "Unable to login.";

                }

                showLoginError(
                    message
                );

            } finally {

                if (button) {

                    button.disabled =
                        false;

                    button.innerHTML =
                        oldText ||
                        "🔐 Login";

                }

            }

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        async function () {

            try {

                await auth.signOut();

                console.log(
                    "✅ Logged out"
                );

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Logout failed."
                );

            }

        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function openSection(
    sectionId
) {

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );

    sections.forEach(
        section => {

            section.classList.remove(
                "active-section"
            );

        }
    );


    const target =
        document.getElementById(
            sectionId
        );


    if (target) {

        target.classList.add(
            "active-section"
        );

    }


    const buttons =
        document.querySelectorAll(
            ".nav-btn"
        );


    buttons.forEach(
        button => {

            button.classList.toggle(
                "active",
                button.dataset.section ===
                sectionId
            );

        }
    );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (pageTitle) {

        const names = {

            dashboard:
                "Dashboard",

            books:
                "Books",

            addBook:
                "Add Book",

            comments:
                "Comments"

        };

        pageTitle.textContent =
            names[sectionId] ||
            "Dashboard";

    }


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );

    }

}


document
    .querySelectorAll(
        ".nav-btn"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    openSection(
                        this.dataset.section
                    );

                }
            );

        }
    );


if (goAddBook) {

    goAddBook.addEventListener(
        "click",
        function () {

            resetBookForm();

            openSection(
                "addBook"
            );

        }
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenu =
    document.getElementById(
        "mobileMenu"
    );


if (mobileMenu) {

    mobileMenu.addEventListener(
        "click",
        function () {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );

            if (sidebar) {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }

        }
    );

}


/* =========================================================
   START ADMIN DATA
========================================================= */

function startAdminData() {

    loadBooksRealtime();

    loadCommentsRealtime();

}


/* =========================================================
   STOP ADMIN DATA
========================================================= */

function stopAdminData() {

    if (
        typeof unsubscribeBooks ===
        "function"
    ) {

        unsubscribeBooks();

        unsubscribeBooks =
            null;

    }


    if (
        typeof unsubscribeComments ===
        "function"
    ) {

        unsubscribeComments();

        unsubscribeComments =
            null;

    }


    allBooks = [];

}


/* =========================================================
   LOAD BOOKS REALTIME
========================================================= */

function loadBooksRealtime() {

    if (!db) {
        return;
    }


    if (
        typeof unsubscribeBooks ===
        "function"
    ) {

        unsubscribeBooks();

    }


    console.log(
        "📚 Starting realtime books listener..."
    );


    unsubscribeBooks =
        db.collection(
            BOOKS_COLLECTION
        )
        .orderBy(
            "createdAt",
            "desc"
        )
        .onSnapshot(
            snapshot => {

                allBooks =
                    snapshot.docs.map(
                        doc => ({

                            id:
                                doc.id,

                            ...doc.data()

                        })
                    );


                console.log(
                    `✅ Books loaded: ${allBooks.length}`
                );


                renderBooksTable();

                updateDashboard();

            },
            error => {

                console.error(
                    "❌ Books listener error:",
                    error
                );


                /*
                 * If createdAt index/order
                 * causes a problem, fallback.
                 */

                if (
                    error.code ===
                    "failed-precondition"
                ) {

                    loadBooksFallback();

                }

            }
        );

}


/* =========================================================
   BOOK FALLBACK
========================================================= */

function loadBooksFallback() {

    if (!db) {
        return;
    }


    if (
        typeof unsubscribeBooks ===
        "function"
    ) {

        unsubscribeBooks();

    }


    unsubscribeBooks =
        db.collection(
            BOOKS_COLLECTION
        )
        .onSnapshot(
            snapshot => {

                allBooks =
                    snapshot.docs.map(
                        doc => ({

                            id:
                                doc.id,

                            ...doc.data()

                        })
                    );


                allBooks.sort(
                    function (a, b) {

                        const aTime =
                            a.createdAt?.toMillis
                                ? a.createdAt.toMillis()
                                : 0;

                        const bTime =
                            b.createdAt?.toMillis
                                ? b.createdAt.toMillis()
                                : 0;

                        return bTime -
                            aTime;

                    }
                );


                renderBooksTable();

                updateDashboard();

            },
            error => {

                console.error(
                    "Books fallback error:",
                    error
                );

                showBooksError(
                    error.message
                );

            }
        );

}


/* =========================================================
   RENDER BOOKS TABLE
========================================================= */

function renderBooksTable() {

    if (!booksTable) {
        return;
    }


    if (!allBooks.length) {

        booksTable.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:40px;"
                >
                    📚 No books found.
                </td>

            </tr>

        `;

        return;

    }


    booksTable.innerHTML =
        allBooks
            .map(
                book => {

                    const cover =
                        book.cover ||
                        book.coverUrl ||
                        "logo.png";


                    const title =
                        book.title ||
                        "Untitled";


                    const author =
                        book.author ||
                        "Unknown";


                    const category =
                        book.category ||
                        "Other";


                    const views =
                        getNumber(
                            book.views
                        );


                    const downloads =
                        getNumber(
                            book.downloads
                        );


                    return `

                        <tr data-book-id="${escapeAttribute(book.id)}">

                            <td>

                                <img
                                    src="${escapeAttribute(cover)}"
                                    alt=""
                                    style="
                                        width:60px;
                                        height:80px;
                                        object-fit:cover;
                                        border-radius:6px;
                                    "
                                    onerror="this.src='logo.png'"
                                >

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(title)}
                                </strong>

                            </td>


                            <td>
                                ${escapeHTML(author)}
                            </td>


                            <td>
                                ${escapeHTML(category)}
                            </td>


                            <td>
                                ${formatNumber(views)}
                            </td>


                            <td>
                                ${formatNumber(downloads)}
                            </td>


                            <td>

                                ${
                                    book.latest
                                        ? `
                                            <span
                                                class="latest-badge"
                                            >
                                                ⭐ Latest
                                            </span>
                                          `
                                        : "—"
                                }

                            </td>


                            <td>

                                <div
                                    class="book-actions"
                                    style="
                                        display:flex;
                                        gap:6px;
                                        flex-wrap:wrap;
                                    "
                                >

                                    <button
                                        type="button"
                                        class="edit-book-btn"
                                        data-id="${escapeAttribute(book.id)}"
                                        title="Edit book"
                                    >
                                        ✏️
                                    </button>


                                    <button
                                        type="button"
                                        class="delete-book-btn"
                                        data-id="${escapeAttribute(book.id)}"
                                        title="Delete book"
                                    >
                                        🗑️
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    /*
     * Edit buttons
     */

    document
        .querySelectorAll(
            ".edit-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        editBook(
                            this.dataset.id
                        );

                    }
                );

            }
        );


    /*
     * Delete buttons
     */

    document
        .querySelectorAll(
            ".delete-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteBook(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   TABLE ERROR
========================================================= */

function showBooksError(
    message
) {

    if (!booksTable) {
        return;
    }


    booksTable.innerHTML = `

        <tr>

            <td
                colspan="8"
                style="
                    text-align:center;
                    padding:40px;
                    color:#b00020;
                "
            >

                ❌ Could not load books.

                <br><br>

                ${escapeHTML(message)}

            </td>

        </tr>

    `;

}


/* =========================================================
   UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    const books =
        allBooks;


    let views = 0;

    let likes = 0;

    let shares = 0;

    let downloads = 0;


    books.forEach(
        book => {

            views +=
                getNumber(
                    book.views
                );

            likes +=
                getNumber(
                    book.likes
                );

            shares +=
                getNumber(
                    book.shares
                );

            downloads +=
                getNumber(
                    book.downloads
                );

        }
    );


    if (totalBooks) {

        totalBooks.textContent =
            formatNumber(
                books.length
            );

    }


    if (totalViews) {

        totalViews.textContent =
            formatNumber(
                views
            );

    }


    if (totalLikes) {

        totalLikes.textContent =
            formatNumber(
                likes
            );

    }


    if (totalShares) {

        totalShares.textContent =
            formatNumber(
                shares
            );

    }


    if (totalDownloads) {

        totalDownloads.textContent =
            formatNumber(
                downloads
            );

    }


    /*
     * Visitors:
     *
     * If your site has a visitors document,
     * use it.
     *
     * Otherwise show total views.
     */

    if (totalVisitors) {

        totalVisitors.textContent =
            formatNumber(
                views
            );

    }

}


/* =========================================================
   EDIT BOOK
========================================================= */

function editBook(
    id
) {

    const book =
        allBooks.find(
            item =>
                item.id === id
        );


    if (!book) {

        alert(
            "Book not found."
        );

        return;

    }


    editingBook =
        book;


    if (editingBookId) {

        editingBookId.value =
            book.id;

    }


    if (bookTitle) {

        bookTitle.value =
            book.title ||
            "";

    }


    if (bookAuthor) {

        bookAuthor.value =
            book.author ||
            "";

    }


    if (bookCategory) {

        /*
         * If old category isn't
         * in select options, add it.
         */

        const category =
            book.category ||
            "Other";


        let option =
            Array.from(
                bookCategory.options
            )
            .find(
                item =>
                    item.value ===
                    category
            );


        if (!option) {

            option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            bookCategory.appendChild(
                option
            );

        }


        bookCategory.value =
            category;

    }


    if (bookLanguage) {

        const language =
            book.language ||
            "Urdu";


        let option =
            Array.from(
                bookLanguage.options
            )
            .find(
                item =>
                    item.value ===
                    language
            );


        if (!option) {

            option =
                document.createElement(
                    "option"
                );

            option.value =
                language;

            option.textContent =
                language;

            bookLanguage.appendChild(
                option
            );

        }


        bookLanguage.value =
            language;

    }


    if (bookDescription) {

        bookDescription.value =
            book.description ||
            "";

    }


    if (bookLatest) {

        bookLatest.checked =
            Boolean(
                book.latest
            );

    }


    if (coverStatus) {

        coverStatus.textContent =
            book.cover
                ? "✅ Existing cover will be kept unless a new one is selected."
                : "No cover selected";

    }


    if (pdfStatus) {

        pdfStatus.textContent =
            book.pdf
                ? "✅ Existing PDF will be kept unless a new one is selected."
                : "No PDF selected";

    }


    if (coverFile) {

        coverFile.value =
            "";

    }


    if (pdfFile) {

        pdfFile.value =
            "";

    }


    if (bookFormTitle) {

        bookFormTitle.textContent =
            "Edit Book";

    }


    if (saveBookBtn) {

        saveBookBtn.innerHTML =
            "💾 Update Book";

    }


    clearBookMessage();


    openSection(
        "addBook"
    );


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );


    console.log(
        "✏️ Editing:",
        book
    );

}


/* =========================================================
   RESET FORM
========================================================= */

function resetBookForm() {

    editingBook =
        null;


    if (bookForm) {

        bookForm.reset();

    }


    if (editingBookId) {

        editingBookId.value =
            "";

    }


    if (bookFormTitle) {

        bookFormTitle.textContent =
            "Add New Book";

    }


    if (saveBookBtn) {

        saveBookBtn.innerHTML =
            "💾 Save Book";

    }


    if (coverStatus) {

        coverStatus.textContent =
            "No cover selected";

    }


    if (pdfStatus) {

        pdfStatus.textContent =
            "No PDF selected";

    }


    clearBookMessage();

}


/* =========================================================
   CANCEL EDIT
========================================================= */

if (cancelEdit) {

    cancelEdit.addEventListener(
        "click",
        function () {

            resetBookForm();

            openSection(
                "books"
            );

        }
    );

}


/* =========================================================
   FILE STATUS
========================================================= */

if (coverFile) {

    coverFile.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                coverStatus.textContent =
                    editingBook?.cover
                        ? "Existing cover will be kept."
                        : "No cover selected";

                return;

            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                coverStatus.textContent =
                    "❌ Please select an image file.";

                this.value =
                    "";

                return;

            }


            coverStatus.textContent =
                `✅ ${file.name}`;

        }
    );

}


if (pdfFile) {

    pdfFile.addEventListener(
        "change",
        function () {

            const file =
                this.files &&
                this.files[0];


            if (!file) {

                pdfStatus.textContent =
                    editingBook?.pdf
                        ? "Existing PDF will be kept."
                        : "No PDF selected";

                return;

            }


            if (
                file.type !==
                "application/pdf"
            ) {

                pdfStatus.textContent =
                    "❌ Please select a PDF file.";

                this.value =
                    "";

                return;

            }


            const sizeMB =
                file.size /
                (1024 * 1024);


            pdfStatus.textContent =
                `✅ ${file.name} — ${sizeMB.toFixed(1)} MB`;

        }
    );

}


/* =========================================================
   STORAGE UPLOAD
========================================================= */

async function uploadFile(
    file,
    folder,
    oldURL = ""
) {

    if (!file) {

        return oldURL || "";

    }


    if (!storage) {

        throw new Error(
            "Firebase Storage is not initialized."
        );

    }


    const safeName =
        file.name
            .replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


    const uniqueName =
        `${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}_${safeName}`;


    const path =
        `${folder}/${uniqueName}`;


    console.log(
        "⬆️ Uploading:",
        path
    );


    const reference =
        storage.ref(
            path
        );


    const uploadTask =
        reference.put(
            file
        );


    return new Promise(
        function (
            resolve,
            reject
        ) {

            uploadTask.on(

                "state_changed",

                function (
                    snapshot
                ) {

                    const percent =
                        (
                            snapshot.bytesTransferred /
                            snapshot.totalBytes
                        ) *
                        100;


                    console.log(
                        `${folder}: ${percent.toFixed(0)}%`
                    );

                },

                function (error) {

                    console.error(
                        "Upload error:",
                        error
                    );

                    reject(
                        error
                    );

                },

                async function () {

                    try {

                        const url =
                            await uploadTask.snapshot
                                .ref
                                .getDownloadURL();


                        resolve(
                            url
                        );

                    } catch (error) {

                        reject(
                            error
                        );

                    }

                }

            );

        }
    );

}


/* =========================================================
   SAVE BOOK
========================================================= */

if (bookForm) {

    bookForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!auth?.currentUser) {

                alert(
                    "Please login first."
                );

                return;

            }


            if (!db) {

                alert(
                    "Firestore is not available."
                );

                return;

            }


            clearBookMessage();


            const title =
                bookTitle
                    ? bookTitle.value.trim()
                    : "";


            const author =
                bookAuthor
                    ? bookAuthor.value.trim()
                    : "";


            const category =
                bookCategory
                    ? bookCategory.value
                    : "Other";


            const language =
                bookLanguage
                    ? bookLanguage.value
                    : "Urdu";


            const description =
                bookDescription
                    ? bookDescription.value.trim()
                    : "";


            const latest =
                bookLatest
                    ? bookLatest.checked
                    : false;


            const cover =
                coverFile?.files?.[0] ||
                null;


            const pdf =
                pdfFile?.files?.[0] ||
                null;


            if (!title) {

                showBookMessage(
                    "Please enter book title.",
                    "error"
                );

                bookTitle?.focus();

                return;

            }


            if (!author) {

                showBookMessage(
                    "Please enter author.",
                    "error"
                );

                bookAuthor?.focus();

                return;

            }


            const isEditing =
                Boolean(
                    editingBookId?.value
                );


            const bookId =
                editingBookId?.value ||
                "";


            const oldBook =
                isEditing
                    ? allBooks.find(
                        item =>
                            item.id ===
                            bookId
                    )
                    : null;


            /*
             * New book requires PDF.
             *
             * Existing book can keep
             * old PDF.
             */

            if (
                !isEditing &&
                !pdf
            ) {

                showBookMessage(
                    "Please select a PDF.",
                    "error"
                );

                return;

            }


            const oldButtonText =
                saveBookBtn
                    ? saveBookBtn.innerHTML
                    : "";


            try {

                if (saveBookBtn) {

                    saveBookBtn.disabled =
                        true;

                    saveBookBtn.innerHTML =
                        isEditing
                            ? "⏳ Updating..."
                            : "⏳ Uploading...";

                }


                showBookMessage(
                    isEditing
                        ? "Updating book..."
                        : "Uploading book...",
                    "loading"
                );


                /*
                 * Upload cover if selected.
                 */

                let coverURL =
                    oldBook?.cover ||
                    oldBook?.coverUrl ||
                    "";


                if (cover) {

                    showBookMessage(
                        "Uploading cover...",
                        "loading"
                    );


                    coverURL =
                        await uploadFile(
                            cover,
                            "book-covers",
                            coverURL
                        );

                }


                /*
                 * Upload PDF if selected.
                 */

                let pdfURL =
                    oldBook?.pdf ||
                    oldBook?.pdfUrl ||
                    "";


                if (pdf) {

                    showBookMessage(
                        "Uploading PDF...",
                        "loading"
                    );


                    pdfURL =
                        await uploadFile(
                            pdf,
                            "book-pdfs",
                            pdfURL
                        );

                }


                if (
                    !pdfURL &&
                    !isEditing
                ) {

                    throw new Error(
                        "PDF upload failed."
                    );

                }


                /*
                 * Build book object.
                 */

                const bookData = {

                    title:
                        title,

                    author:
                        author,

                    category:
                        category,

                    language:
                        language,

                    description:
                        description,

                    cover:
                        coverURL,

                    pdf:
                        pdfURL,

                    latest:
                        latest,

                    views:
                        getNumber(
                            oldBook?.views
                        ),

                    likes:
                        getNumber(
                            oldBook?.likes
                        ),

                    shares:
                        getNumber(
                            oldBook?.shares
                        ),

                    downloads:
                        getNumber(
                            oldBook?.downloads
                        ),

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                /*
                 * Add createdAt only
                 * for new book.
                 */

                if (!isEditing) {

                    bookData.createdAt =
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp();

                }


                /*
                 * IMPORTANT:
                 *
                 * If Latest is selected,
                 * make all other books
                 * latest=false.
                 */

                if (latest) {

                    showBookMessage(
                        "Updating latest book...",
                        "loading"
                    );


                    const latestSnapshot =
                        await db.collection(
                            BOOKS_COLLECTION
                        )
                        .where(
                            "latest",
                            "==",
                            true
                        )
                        .get();


                    const batch =
                        db.batch();


                    latestSnapshot.docs
                        .forEach(
                            doc => {

                                if (
                                    doc.id !==
                                    bookId
                                ) {

                                    batch.update(
                                        doc.ref,
                                        {
                                            latest:
                                                false,

                                            updatedAt:
                                                firebase.firestore
                                                    .FieldValue
                                                    .serverTimestamp()

                                        }
                                    );

                                }

                            }
                        );


                    await batch.commit();

                }


                /*
                 * SAVE
                 */

                showBookMessage(
                    "Saving to Firebase...",
                    "loading"
                );


                if (isEditing) {

                    await db.collection(
                        BOOKS_COLLECTION
                    )
                    .doc(
                        bookId
                    )
                    .update(
                        bookData
                    );


                    console.log(
                        "✅ Book updated:",
                        bookId
                    );


                    showBookMessage(
                        "✅ Book updated successfully!",
                        "success"
                    );


                } else {

                    const newRef =
                        await db.collection(
                            BOOKS_COLLECTION
                        )
                        .add(
                            bookData
                        );


                    console.log(
                        "✅ Book added:",
                        newRef.id
                    );


                    showBookMessage(
                        "✅ Book added successfully!",
                        "success"
                    );

                }


                /*
                 * Reset after successful save.
                 */

                setTimeout(
                    function () {

                        resetBookForm();

                        openSection(
                            "books"
                        );

                    },
                    900
                );


            } catch (error) {

                console.error(
                    "❌ Save book error:",
                    error
                );


                let message =
                    error.message ||
                    "Could not save book.";


                if (
                    error.code ===
                    "permission-denied"
                ) {

                    message =
                        "Firestore permission denied. Check Firestore Rules.";

                }


                if (
                    error.code ===
                    "storage/unauthorized"
                ) {

                    message =
                        "Storage permission denied. Check Storage Rules.";

                }


                showBookMessage(
                    `❌ ${message}`,
                    "error"
                );


            } finally {

                if (saveBookBtn) {

                    saveBookBtn.disabled =
                        false;

                    saveBookBtn.innerHTML =
                        oldButtonText ||
                        "💾 Save Book";

                }

            }

        }
    );

}


/* =========================================================
   DELETE BOOK
========================================================= */

async function deleteBook(
    id
) {

    if (!auth?.currentUser) {

        alert(
            "Please login first."
        );

        return;

    }


    const book =
        allBooks.find(
            item =>
                item.id === id
        );


    if (!book) {

        alert(
            "Book not found."
        );

        return;

    }


    const title =
        book.title ||
        "this book";


    const confirmed =
        confirm(
            `Delete "${title}"?\n\nThis will permanently remove the book from Firestore.`
        );


    if (!confirmed) {

        return;

    }


    try {

        console.log(
            "🗑️ Deleting book:",
            id
        );


        await db.collection(
            BOOKS_COLLECTION
        )
        .doc(
            id
        )
        .delete();


        /*
         * Storage files are intentionally
         * not automatically deleted here
         * because an existing URL may be
         * shared elsewhere.
         */

        alert(
            "✅ Book deleted successfully."
        );


    } catch (error) {

        console.error(
            "Delete book error:",
            error
        );


        alert(
            `❌ Delete failed.\n\n${error.message}`
        );

    }

}


/* =========================================================
   COMMENTS REALTIME
========================================================= */

function loadCommentsRealtime() {

    if (!db || !commentsContainer) {
        return;
    }


    if (
        typeof unsubscribeComments ===
        "function"
    ) {

        unsubscribeComments();

    }


    unsubscribeComments =
        db.collection(
            COMMENTS_COLLECTION
        )
        .orderBy(
            "createdAt",
            "desc"
        )
        .onSnapshot(
            snapshot => {

                renderComments(
                    snapshot.docs
                );

            },
            error => {

                console.error(
                    "Comments error:",
                    error
                );


                /*
                 * Fallback if index
                 * is unavailable.
                 */

                loadCommentsFallback();

            }
        );

}


/* =========================================================
   COMMENTS FALLBACK
========================================================= */

function loadCommentsFallback() {

    if (!db || !commentsContainer) {
        return;
    }


    if (
        typeof unsubscribeComments ===
        "function"
    ) {

        unsubscribeComments();

    }


    unsubscribeComments =
        db.collection(
            COMMENTS_COLLECTION
        )
        .onSnapshot(
            snapshot => {

                const docs =
                    [...snapshot.docs];


                docs.sort(
                    function (a, b) {

                        const aData =
                            a.data();

                        const bData =
                            b.data();


                        const aTime =
                            aData.createdAt
                                ?.toMillis
                                ? aData.createdAt.toMillis()
                                : 0;


                        const bTime =
                            bData.createdAt
                                ?.toMillis
                                ? bData.createdAt.toMillis()
                                : 0;


                        return bTime -
                            aTime;

                    }
                );


                renderComments(
                    docs
                );

            },
            error => {

                console.error(
                    "Comments fallback error:",
                    error
                );


                commentsContainer.innerHTML = `

                    <p>
                        ❌ Could not load comments.
                    </p>

                `;

            }
        );

}


/* =========================================================
   RENDER COMMENTS
========================================================= */

function renderComments(
    docs
) {

    if (!commentsContainer) {
        return;
    }


    if (!docs.length) {

        commentsContainer.innerHTML = `

            <div
                class="empty-comments"
                style="padding:40px;text-align:center;"
            >

                💬 No comments yet.

            </div>

        `;

        return;

    }


    commentsContainer.innerHTML =
        docs
            .map(
                doc => {

                    const comment =
                        doc.data();


                    const text =
                        comment.text ||
                        comment.comment ||
                        comment.message ||
                        "";


                    const name =
                        comment.name ||
                        comment.userName ||
                        comment.username ||
                        "Visitor";


                    const email =
                        comment.email ||
                        "";


                    const book =
                        comment.bookTitle ||
                        comment.bookName ||
                        "";


                    return `

                        <div
                            class="comment-card"
                            data-comment-id="${escapeAttribute(doc.id)}"
                            style="
                                padding:18px;
                                margin-bottom:12px;
                                border-radius:10px;
                                background:#fff;
                                border:1px solid #ddd;
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    gap:15px;
                                "
                            >

                                <div>

                                    <strong>
                                        ${escapeHTML(name)}
                                    </strong>

                                    ${
                                        email
                                            ? `
                                                <small>
                                                    ${escapeHTML(email)}
                                                </small>
                                              `
                                            : ""
                                    }

                                </div>


                                <button
                                    type="button"
                                    class="delete-comment-btn"
                                    data-id="${escapeAttribute(doc.id)}"
                                    title="Delete comment"
                                >
                                    🗑️
                                </button>

                            </div>


                            ${
                                book
                                    ? `
                                        <div
                                            style="
                                                margin-top:8px;
                                                font-size:13px;
                                                opacity:.7;
                                            "
                                        >
                                            📚 ${escapeHTML(book)}
                                        </div>
                                      `
                                    : ""
                            }


                            <p
                                style="
                                    margin-top:10px;
                                    line-height:1.6;
                                "
                            >
                                ${escapeHTML(text)}
                            </p>


                            <small>

                                ${formatDate(
                                    comment.createdAt
                                )}

                            </small>

                        </div>

                    `;

                }
            )
            .join("");


    document
        .querySelectorAll(
            ".delete-comment-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteComment(
                            this.dataset.id
                        );

                    }
                );

            }
        );

}


/* =========================================================
   DELETE COMMENT
========================================================= */

async function deleteComment(
    id
) {

    const confirmed =
        confirm(
            "Delete this comment permanently?"
        );


    if (!confirmed) {

        return;

    }


    try {

        await db.collection(
            COMMENTS_COLLECTION
        )
        .doc(
            id
        )
        .delete();


        console.log(
            "✅ Comment deleted:",
            id
        );


    } catch (error) {

        console.error(
            "Comment delete error:",
            error
        );


        alert(
            `❌ Could not delete comment.\n\n${error.message}`
        );

    }

}


/* =========================================================
   BOOK SEARCH
========================================================= */

function createAdminSearch() {

    /*
     * If your admin HTML already has
     * a search input, this will use it.
     *
     * Otherwise it does nothing.
     */

    const search =
        document.getElementById(
            "adminBookSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .trim()
                    .toLowerCase();


            if (!query) {

                renderBooksTable();

                return;

            }


            const original =
                allBooks;


            const filtered =
                original.filter(
                    book => {

                        return (

                            String(
                                book.title ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query)

                            ||

                            String(
                                book.author ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query)

                            ||

                            String(
                                book.category ||
                                ""
                            )
                            .toLowerCase()
                            .includes(query)

                        );

                    }
                );


            renderFilteredBooks(
                filtered
            );

        }
    );

}


/* =========================================================
   RENDER FILTERED BOOKS
========================================================= */

function renderFilteredBooks(
    books
) {

    if (!booksTable) {
        return;
    }


    if (!books.length) {

        booksTable.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    style="text-align:center;padding:30px;"
                >
                    🔎 No books found.
                </td>

            </tr>

        `;

        return;

    }


    booksTable.innerHTML =
        books
            .map(
                book => {

                    const cover =
                        book.cover ||
                        "logo.png";


                    return `

                        <tr>

                            <td>

                                <img
                                    src="${escapeAttribute(cover)}"
                                    style="
                                        width:60px;
                                        height:80px;
                                        object-fit:cover;
                                        border-radius:6px;
                                    "
                                    onerror="this.src='logo.png'"
                                >

                            </td>


                            <td>
                                ${escapeHTML(
                                    book.title ||
                                    "Untitled"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    book.author ||
                                    "Unknown"
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    book.category ||
                                    "Other"
                                )}
                            </td>


                            <td>
                                ${formatNumber(
                                    book.views
                                )}
                            </td>


                            <td>
                                ${formatNumber(
                                    book.downloads
                                )}
                            </td>


                            <td>
                                ${
                                    book.latest
                                        ? "⭐ Latest"
                                        : "—"
                                }
                            </td>


                            <td>

                                <button
                                    class="edit-book-btn"
                                    data-id="${escapeAttribute(book.id)}"
                                >
                                    ✏️
                                </button>

                                <button
                                    class="delete-book-btn"
                                    data-id="${escapeAttribute(book.id)}"
                                >
                                    🗑️
                                </button>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


    document
        .querySelectorAll(
            ".edit-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => editBook(
                        button.dataset.id
                    )
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-book-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => deleteBook(
                        button.dataset.id
                    )
                );

            }
        );

}


/* =========================================================
   INITIALIZE SEARCH
========================================================= */

createAdminSearch();


/* =========================================================
   PREVENT FORM LEAVING WITH FILE UPLOAD
========================================================= */

window.addEventListener(
    "beforeunload",
    function (event) {

        if (
            saveBookBtn &&
            saveBookBtn.disabled
        ) {

            event.preventDefault();

            event.returnValue =
                "";

        }

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   Useful for debugging / HTML buttons
========================================================= */

window.ChishtiAdmin = {

    getBooks:
        () => allBooks,

    editBook:
        editBook,

    deleteBook:
        deleteBook,

    deleteComment:
        deleteComment,

    resetBookForm:
        resetBookForm,

    refresh:
        function () {

            if (auth?.currentUser) {

                loadBooksRealtime();

                loadCommentsRealtime();

            }

        }

};


/* =========================================================
   STARTUP
========================================================= */

console.log(
    "=========================================="
);

console.log(
    "📚 CHISHTI LIBRARY ADMIN"
);

console.log(
    "✅ Firebase Admin JS Loaded"
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
    "✅ Add Book Ready"
);

console.log(
    "✅ Edit Book Ready"
);

console.log(
    "✅ Delete Book Ready"
);

console.log(
    "✅ Cover Upload Ready"
);

console.log(
    "✅ PDF Upload Ready"
);

console.log(
    "✅ Latest Book Ready"
);

console.log(
    "✅ Dashboard Ready"
);

console.log(
    "✅ Comments Ready"
);

console.log(
    "=========================================="
);
