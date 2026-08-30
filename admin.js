"use strict";

/*
=========================================================
CHISHTI LIBRARY
ADMIN.JS
FINAL COMPLETE ADMIN PANEL
=========================================================
*/


/*=========================================================
 GLOBAL
=========================================================*/

let adminBooks = [];

let editingBook = null;

let adminInitialized = false;


/*=========================================================
 ELEMENT HELPER
=========================================================*/

function $id(id) {

    return document.getElementById(id);

}


/*=========================================================
 WAIT FOR FIREBASE
=========================================================*/

function waitForFirebase(callback) {

    if (
        window.firebaseReady &&
        window.db &&
        window.auth &&
        window.storage
    ) {

        callback();

        return;

    }


    window.addEventListener(
        "firebaseReady",
        callback,
        {
            once: true
        }
    );

}


/*=========================================================
 DOM READY
=========================================================*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        waitForFirebase(
            initializeAdmin
        );

    }
);


/*=========================================================
 INITIALIZE ADMIN
=========================================================*/

function initializeAdmin() {

    if (adminInitialized) return;

    adminInitialized = true;

    setupLogin();

    setupNavigation();

    setupLogout();

    setupBookForm();

    setupFileInputs();

    setupMobileMenu();

    setupAddBookButton();

    setupCancelButton();

    setupDashboardControls();

    watchAuth();

    console.log(
        "✅ Admin initialized"
    );

}


/*=========================================================
 LOGIN
=========================================================*/

function setupLogin() {

    const form =
        $id("loginForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const email =
                $id("loginEmail")?.value
                    .trim();

            const password =
                $id("loginPassword")?.value;


            const errorBox =
                $id("loginError");


            if (errorBox) {

                errorBox.innerText =
                    "Logging in...";

            }


            try {

                await adminLogin(
                    email,
                    password
                );


                if (errorBox) {

                    errorBox.innerText =
                        "✅ Login successful!";

                }


                showAdminApp();


                await loadDashboard();

                await loadBooks();

                await loadComments();


            }

            catch (error) {

                console.error(
                    "❌ Login:",
                    error
                );


                if (errorBox) {

                    errorBox.innerText =
                        getFirebaseErrorMessage(
                            error
                        );

                }

            }

        }
    );

}


/*=========================================================
 AUTH STATE
=========================================================*/

function watchAuth() {

    window.addEventListener(
        "firebaseAuthChanged",
        function (event) {

            const user =
                event.detail.user;


            if (user) {

                showAdminApp();

                const email =
                    $id("adminEmail");

                if (email) {

                    email.innerText =
                        user.email ||
                        "Admin";

                }

                loadDashboard();

                loadBooks();

                loadComments();

            }

            else {

                showLoginScreen();

            }

        }
    );

}


/*=========================================================
 SHOW ADMIN
=========================================================*/

function showAdminApp() {

    const login =
        $id("loginScreen");

    const app =
        $id("adminApp");


    if (login) {

        login.classList.add(
            "hidden"
        );

    }


    if (app) {

        app.classList.remove(
            "hidden"
        );

        app.style.animation =
            "adminFade .4s ease";

    }

}


/*=========================================================
 SHOW LOGIN
=========================================================*/

function showLoginScreen() {

    const login =
        $id("loginScreen");

    const app =
        $id("adminApp");


    if (login) {

        login.classList.remove(
            "hidden"
        );

    }


    if (app) {

        app.classList.add(
            "hidden"
        );

    }

}


/*=========================================================
 LOGOUT
=========================================================*/

function setupLogout() {

    const button =
        $id("logoutBtn");

    if (!button) return;


    button.addEventListener(
        "click",
        async function () {

            try {

                await adminLogout();

                showLoginScreen();

            }

            catch (error) {

                console.error(
                    error
                );

            }

        }
    );

}


/*=========================================================
 NAVIGATION
=========================================================*/

function setupNavigation() {

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const section =
                            button.dataset.section;

                        openSection(
                            section
                        );

                    }
                );

            }
        );

}


/*=========================================================
 OPEN SECTION
=========================================================*/

function openSection(
    sectionId
) {

    document
        .querySelectorAll(
            ".nav-btn"
        )
        .forEach(
            btn =>
                btn.classList.remove(
                    "active"
                )
        );


    const activeButton =
        document.querySelector(
            `.nav-btn[data-section="${sectionId}"]`
        );


    if (activeButton) {

        activeButton.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".admin-section"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active-section"
                );

            }
        );


    const target =
        $id(sectionId);


    if (target) {

        target.classList.add(
            "active-section"
        );

        target.style.animation =
            "adminFade .35s ease";

    }


    const title =
        $id("pageTitle");


    if (title) {

        const names = {

            dashboard:
                "Dashboard",

            books:
                "All Books",

            addBook:
                editingBook ?
                "Edit Book" :
                "Add Book",

            comments:
                "Comments"

        };


        title.innerText =
            names[sectionId] ||
            "Dashboard";

    }


    if (sectionId === "dashboard") {

        loadDashboard();

    }


    if (sectionId === "books") {

        loadBooks();

    }


    if (sectionId === "comments") {

        loadComments();

    }

}


/*=========================================================
 MOBILE MENU
=========================================================*/

function setupMobileMenu() {

    const button =
        $id("mobileMenu");

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        !button ||
        !sidebar
    ) return;


    button.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "mobile-open"
            );

        }
    );

}


/*=========================================================
 ADD BOOK BUTTON
=========================================================*/

function setupAddBookButton() {

    const button =
        $id("goAddBook");

    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            resetBookForm();

            openSection(
                "addBook"
            );

        }
    );

}


/*=========================================================
 CANCEL EDIT
=========================================================*/

function setupCancelButton() {

    const button =
        $id("cancelEdit");

    if (!button) return;


    button.addEventListener(
        "click",
        function () {

            resetBookForm();

            openSection(
                "books"
            );

        }
    );

}


/*=========================================================
 BOOK FORM
=========================================================*/

function setupBookForm() {

    const form =
        $id("bookForm");

    if (!form) return;


    form.addEventListener(
        "submit",
        saveBook
    );

}


/*=========================================================
 SAVE BOOK
=========================================================*/

async function saveBook(e) {

    e.preventDefault();


    const saveButton =
        $id("saveBookBtn");

    const message =
        $id("bookMessage");


    const title =
        $id("bookTitle")?.value
            .trim();

    const author =
        $id("bookAuthor")?.value
            .trim();

    const category =
        $id("bookCategory")?.value ||
        "Other";

    const language =
        $id("bookLanguage")?.value ||
        "Urdu";

    const description =
        $id("bookDescription")?.value
            .trim();

    const latest =
        Boolean(
            $id("bookLatest")?.checked
        );


    if (!title || !author) {

        showMessage(
            message,
            "❌ Title and author are required.",
            true
        );

        return;

    }


    try {

        if (saveButton) {

            saveButton.disabled =
                true;

            saveButton.innerText =
                editingBook ?
                "⏳ Updating..." :
                "⏳ Saving...";

        }


        /*=============================================
          EDIT EXISTING BOOK
        =============================================*/

        if (editingBook) {

            const bookId =
                editingBook.id;


            let coverUrl =
                editingBook.coverUrl ||
                editingBook.cover ||
                "";

            let coverPath =
                editingBook.coverPath ||
                "";

            let pdfUrl =
                editingBook.pdfUrl ||
                editingBook.pdf ||
                "";

            let pdfPath =
                editingBook.pdfPath ||
                "";


            const coverFile =
                $id("coverFile")?.files?.[0];

            const pdfFile =
                $id("pdfFile")?.files?.[0];


            if (coverFile) {

                const uploadedCover =
                    await uploadBookCover(
                        coverFile,
                        bookId
                    );

                coverUrl =
                    uploadedCover.url;

                coverPath =
                    uploadedCover.path;

            }


            if (pdfFile) {

                const uploadedPDF =
                    await uploadBookPDF(
                        pdfFile,
                        bookId
                    );

                pdfUrl =
                    uploadedPDF.url;

                pdfPath =
                    uploadedPDF.path;

            }


            if (latest) {

                await removeOtherLatestBooks(
                    bookId
                );

            }


            await updateBook(
                bookId,
                {

                    title,

                    author,

                    category,

                    language,

                    description,

                    latest,

                    coverUrl,

                    coverPath,

                    pdfUrl,

                    pdfPath

                }
            );


            showMessage(
                message,
                "✅ Book updated successfully.",
                false
            );

        }

        /*=============================================
          ADD NEW BOOK
        =============================================*/

        else {

            const tempId =
                createBookId();


            let coverUrl = "";

            let coverPath = "";

            let pdfUrl = "";

            let pdfPath = "";


            const coverFile =
                $id("coverFile")?.files?.[0];

            const pdfFile =
                $id("pdfFile")?.files?.[0];


            if (coverFile) {

                const uploadedCover =
                    await uploadBookCover(
                        coverFile,
                        tempId
                    );

                coverUrl =
                    uploadedCover.url;

                coverPath =
                    uploadedCover.path;

            }


            if (pdfFile) {

                const uploadedPDF =
                    await uploadBookPDF(
                        pdfFile,
                        tempId
                    );

                pdfUrl =
                    uploadedPDF.url;

                pdfPath =
                    uploadedPDF.path;

            }


            if (!pdfUrl) {

                throw new Error(
                    "Please select a PDF."
                );

            }


            if (latest) {

                await removeOtherLatestBooks(
                    tempId
                );

            }


            const ref =
                db
                    .collection("books")
                    .doc(tempId);


            await ref.set({

                title,

                author,

                category,

                language,

                description,

                coverUrl,

                coverPath,

                pdfUrl,

                pdfPath,

                latest,

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

            });


            showMessage(
                message,
                "✅ Book added successfully.",
                false
            );

        }


        await loadBooks();

        await loadDashboard();


        setTimeout(
            resetBookForm,
            1000
        );


    }

    catch (error) {

        console.error(
            "❌ Save book error:",
            error
        );


        showMessage(
            message,
            "❌ " +
            (
                error.message ||
                "Something went wrong."
            ),
            true
        );

    }

    finally {

        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.innerText =
                editingBook ?
                "💾 Update Book" :
                "💾 Save Book";

        }

    }

}


/*=========================================================
 REMOVE OTHER LATEST BOOKS
=========================================================*/

async function removeOtherLatestBooks(
    currentId
) {

    const snap =
        await db
            .collection("books")
            .where(
                "latest",
                "==",
                true
            )
            .get();


    const batch =
        db.batch();


    snap.forEach(
        function (doc) {

            if (
                doc.id !==
                currentId
            ) {

                batch.update(
                    doc.ref,
                    {
                        latest: false
                    }
                );

            }

        }
    );


    await batch.commit();

}


/*=========================================================
 FILE INPUTS
=========================================================*/

function setupFileInputs() {

    const cover =
        $id("coverFile");

    const pdf =
        $id("pdfFile");


    if (cover) {

        cover.addEventListener(
            "change",
            function () {

                const file =
                    cover.files[0];

                const status =
                    $id("coverStatus");


                if (status) {

                    status.innerText =
                        file ?
                        "✅ " + file.name :
                        "No cover selected";

                }

            }
        );

    }


    if (pdf) {

        pdf.addEventListener(
            "change",
            function () {

                const file =
                    pdf.files[0];

                const status =
                    $id("pdfStatus");


                if (status) {

                    status.innerText =
                        file ?
                        "✅ " + file.name :
                        "No PDF selected";

                }

            }
        );

    }

}


/*=========================================================
 LOAD BOOKS
=========================================================*/

async function loadBooks() {

    const table =
        $id("booksTable");


    if (!table) return;


    table.innerHTML = `

        <tr>

            <td colspan="8"
                class="loading">

                ⏳ Loading books...

            </td>

        </tr>

    `;


    try {

        adminBooks =
            await getAllBooks();


        renderBooks();

    }

    catch (error) {

        console.error(
            "❌ Books error:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="8">

                    ❌ Failed to load books.

                </td>

            </tr>

        `;

    }

}


/*=========================================================
 RENDER BOOKS
=========================================================*/

function renderBooks() {

    const table =
        $id("booksTable");

    if (!table) return;


    if (!adminBooks.length) {

        table.innerHTML = `

            <tr>

                <td colspan="8"
                    style="text-align:center">

                    📚 No books found.

                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML =
        adminBooks
            .map(
                function (book) {

                    const cover =
                        book.coverUrl ||
                        book.cover ||
                        "logo.png";


                    return `

                    <tr class="admin-book-row">

                        <td>

                            <img
                                src="${escapeHTML(cover)}"
                                class="admin-book-cover"
                                onerror="this.src='logo.png'"
                            >

                        </td>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    book.title ||
                                    "Untitled"
                                )}
                            </strong>

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
                            👁 ${Number(
                                book.views || 0
                            )}
                        </td>

                        <td>
                            ⬇ ${Number(
                                book.downloads || 0
                            )}
                        </td>

                        <td>

                            ${
                                book.latest
                                ?
                                "⭐ Yes"
                                :
                                "—"
                            }

                        </td>

                        <td>

                            <button
                                class="admin-action edit-action"
                                data-edit="${book.id}"
                            >
                                ✏️ Edit
                            </button>

                            <button
                                class="admin-action delete-action"
                                data-delete="${book.id}"
                            >
                                🗑️ Delete
                            </button>

                        </td>

                    </tr>

                    `;

                }
            )
            .join("");


    table
        .querySelectorAll(
            "[data-edit]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        editBook(
                            button.dataset.edit
                        );

                    }
                );

            }
        );


    table
        .querySelectorAll(
            "[data-delete]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        deleteBook(
                            button.dataset.delete
                        );

                    }
                );

            }
        );

}


/*=========================================================
 EDIT BOOK
=========================================================*/

function editBook(id) {

    const book =
        adminBooks.find(
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


    $id("editingBookId").value =
        book.id;


    $id("bookTitle").value =
        book.title || "";


    $id("bookAuthor").value =
        book.author || "";


    $id("bookCategory").value =
        book.category ||
        "Other";


    $id("bookLanguage").value =
        book.language ||
        "Urdu";


    $id("bookDescription").value =
        book.description || "";


    $id("bookLatest").checked =
        book.latest === true;


    const title =
        $id("bookFormTitle");


    if (title) {

        title.innerText =
            "Edit Book";

    }


    const save =
        $id("saveBookBtn");


    if (save) {

        save.innerText =
            "💾 Update Book";

    }


    const coverStatus =
        $id("coverStatus");


    if (coverStatus) {

        coverStatus.innerText =
            book.coverUrl ?
            "Current cover will remain unless replaced." :
            "No current cover.";

    }


    const pdfStatus =
        $id("pdfStatus");


    if (pdfStatus) {

        pdfStatus.innerText =
            book.pdfUrl ?
            "Current PDF will remain unless replaced." :
            "No current PDF.";

    }


    openSection(
        "addBook"
    );

}


/*=========================================================
 DELETE BOOK
=========================================================*/

async function deleteBook(id) {

    const book =
        adminBooks.find(
            item =>
                item.id === id
        );


    if (!book) return;


    const confirmed =
        confirm(
            `Delete "${book.title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) return;


    try {

        await window.deleteBook(
            id
        );


        await loadBooks();

        await loadDashboard();


        alert(
            "✅ Book deleted successfully."
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Delete failed:\n" +
            error.message
        );

    }

}


/*=========================================================
 RESET FORM
=========================================================*/

function resetBookForm() {

    editingBook =
        null;


    const form =
        $id("bookForm");


    if (form) {

        form.reset();

    }


    const hidden =
        $id("editingBookId");


    if (hidden) {

        hidden.value = "";

    }


    const title =
        $id("bookFormTitle");


    if (title) {

        title.innerText =
            "Add New Book";

    }


    const save =
        $id("saveBookBtn");


    if (save) {

        save.innerText =
            "💾 Save Book";

    }


    const cover =
        $id("coverStatus");


    if (cover) {

        cover.innerText =
            "No cover selected";

    }


    const pdf =
        $id("pdfStatus");


    if (pdf) {

        pdf.innerText =
            "No PDF selected";

    }


    const message =
        $id("bookMessage");


    if (message) {

        message.innerText = "";

    }

}


/*=========================================================
 DASHBOARD
=========================================================*/

async function loadDashboard() {

    try {

        const stats =
            await getStatistics();


        const bookStats =
            await calculateBookStatistics();


        animateNumber(
            "totalBooks",
            bookStats.totalBooks
        );


        animateNumber(
            "totalVisitors",
            Number(
                stats.visitors || 0
            )
        );


        animateNumber(
            "totalViews",
            bookStats.totalViews
        );


        animateNumber(
            "totalLikes",
            bookStats.totalLikes
        );


        animateNumber(
            "totalShares",
            bookStats.totalShares
        );


        animateNumber(
            "totalDownloads",
            bookStats.totalDownloads
        );


        createDashboardTools();


    }

    catch (error) {

        console.error(
            "❌ Dashboard:",
            error
        );

    }

}


/*=========================================================
 DASHBOARD EXTRA TOOLS
=========================================================*/

function createDashboardTools() {

    const dashboard =
        $id("dashboard");


    if (!dashboard) return;


    if (
        $id("adminExtraTools")
    ) {

        return;

    }


    const box =
        document.createElement(
            "div"
        );


    box.id =
        "adminExtraTools";


    box.className =
        "admin-extra-tools";


    box.innerHTML = `

        <div class="section-head">

            <div>

                <h2>⚙️ Admin Controls</h2>

                <p>
                    Manage counters and refresh library data.
                </p>

            </div>

        </div>


        <div class="admin-tools-grid">

            <button
                id="changeVisitorsBtn"
                class="gold-btn"
            >
                👥 Change Visitor Counter
            </button>


            <button
                id="refreshAdminBtn"
                class="gold-btn"
            >
                🔄 Refresh Dashboard
            </button>


            <button
                id="manageBooksBtn"
                class="gold-btn"
            >
                📚 Manage Books
            </button>


            <button
                id="manageCommentsBtn"
                class="gold-btn"
            >
                💬 Manage Comments
            </button>

        </div>

    `;


    dashboard.appendChild(
        box
    );


    $id(
        "changeVisitorsBtn"
    )
    .addEventListener(
        "click",
        changeVisitorCounter
    );


    $id(
        "refreshAdminBtn"
    )
    .addEventListener(
        "click",
        async function () {

            await loadDashboard();

            await loadBooks();

            await loadComments();

        }
    );


    $id(
        "manageBooksBtn"
    )
    .addEventListener(
        "click",
        function () {

            openSection(
                "books"
            );

        }
    );


    $id(
        "manageCommentsBtn"
    )
    .addEventListener(
        "click",
        function () {

            openSection(
                "comments"
            );

        }
    );

}


/*=========================================================
 CHANGE VISITOR COUNTER
=========================================================*/

async function changeVisitorCounter() {

    const current =
        await getStatistics();


    const value =
        prompt(
            "Enter new visitor count:",
            Number(
                current.visitors || 0
            )
        );


    if (
        value === null
    ) return;


    const number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number < 0
    ) {

        alert(
            "❌ Enter a valid number."
        );

        return;

    }


    try {

        await setVisitorCount(
            Math.floor(number)
        );


        await loadDashboard();


        alert(
            "✅ Visitor counter updated."
        );

    }

    catch (error) {

        console.error(
            error
        );

        alert(
            "❌ Failed to update counter."
        );

    }

}


/*=========================================================
 ANIMATED NUMBER
=========================================================*/

function animateNumber(
    id,
    target
) {

    const element =
        $id(id);


    if (!element) return;


    target =
        Number(target) || 0;


    const start =
        Number(
            element.innerText
        ) || 0;


    const duration =
        700;


    const startTime =
        performance.now();


    function update(
        currentTime
    ) {

        const progress =
            Math.min(
                (
                    currentTime -
                    startTime
                ) /
                duration,
                1
            );


        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const value =
            Math.floor(
                start +
                (
                    target -
                    start
                ) *
                eased
            );


        element.innerText =
            value.toLocaleString();


        if (
            progress < 1
        ) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(
        update
    );

}


/*=========================================================
 COMMENTS
=========================================================*/

async function loadComments() {

    const container =
        $id("commentsContainer");


    if (!container) return;


    container.innerHTML = `

        <p class="loading">
            ⏳ Loading comments...
        </p>

    `;


    try {

        const books =
            await getAllBooks();


        const allComments = [];


        for (
            const book
            of books
        ) {

            try {

                const comments =
                    await getBookComments(
                        book.id
                    );


                comments.forEach(
                    comment => {

                        allComments.push({

                            ...comment,

                            bookTitle:
                                book.title

                        });

                    }
                );

            }

            catch (error) {

                console.warn(
                    "Comments skipped:",
                    book.id
                );

            }

        }


        renderComments(
            allComments
        );

    }

    catch (error) {

        console.error(
            error
        );


        container.innerHTML = `

            <p>
                ❌ Unable to load comments.
            </p>

        `;

    }

}


/*=========================================================
 RENDER COMMENTS
=========================================================*/

function renderComments(
    comments
) {

    const container =
        $id("commentsContainer");


    if (!container) return;


    if (!comments.length) {

        container.innerHTML = `

            <div class="empty-comments">

                💬 No comments yet.

            </div>

        `;

        return;

    }


    container.innerHTML =
        comments
            .map(
                function (comment) {

                    return `

                    <div class="admin-comment">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    comment.name ||
                                    "Visitor"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    comment.bookTitle ||
                                    ""
                                )}
                            </small>

                        </div>


                        <p>
                            ${escapeHTML(
                                comment.comment ||
                                ""
                            )}
                        </p>


                        <button
                            class="admin-action delete-action"
                            data-comment-book="${comment.bookId}"
                            data-comment-id="${comment.id}"
                        >
                            🗑️ Delete
                        </button>

                    </div>

                    `;

                }
            )
            .join("");


    container
        .querySelectorAll(
            "[data-comment-id]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async function () {

                        const bookId =
                            button.dataset
                                .commentBook;

                        const commentId =
                            button.dataset
                                .commentId;


                        if (
                            !confirm(
                                "Delete this comment?"
                            )
                        ) {

                            return;

                        }


                        try {

                            await deleteBookComment(
                                bookId,
                                commentId
                            );


                            await loadComments();

                            await loadDashboard();


                        }

                        catch (error) {

                            console.error(
                                error
                            );

                            alert(
                                "❌ Failed to delete comment."
                            );

                        }

                    }
                );

            }
        );

}


/*=========================================================
 MESSAGE
=========================================================*/

function showMessage(
    element,
    text,
    error
) {

    if (!element) return;


    element.innerText =
        text;


    element.style.padding =
        "12px";


    element.style.marginTop =
        "15px";


    element.style.borderRadius =
        "8px";


    element.style.animation =
        "adminFade .3s ease";


    if (error) {

        element.style.color =
            "#ff8080";

    }

    else {

        element.style.color =
            "#d4af37";

    }

}


/*=========================================================
 ESCAPE HTML
=========================================================*/

function escapeHTML(
    value
) {

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


/*=========================================================
 FIREBASE ERROR
=========================================================*/

function getFirebaseErrorMessage(
    error
) {

    if (!error) {

        return "Login failed.";

    }


    const code =
        error.code || "";


    const messages = {

        "auth/invalid-credential":
            "❌ Email or password is incorrect.",

        "auth/invalid-login-credentials":
            "❌ Email or password is incorrect.",

        "auth/user-not-found":
            "❌ Admin account not found.",

        "auth/wrong-password":
            "❌ Incorrect password.",

        "auth/invalid-email":
            "❌ Invalid email address.",

        "auth/too-many-requests":
            "❌ Too many attempts. Try again later.",

        "auth/network-request-failed":
            "❌ Internet connection problem."

    };


    return (
        messages[code] ||
        error.message ||
        "❌ Login failed."
    );

}


/*=========================================================
 DASHBOARD CONTROLS
=========================================================*/

function setupDashboardControls() {

    /*
     * Extra dashboard controls are created
     * automatically by createDashboardTools().
     */

}


/*=========================================================
 AUTO REFRESH
=========================================================*/

setInterval(
    function () {

        if (
            window.currentFirebaseUser
        ) {

            loadDashboard();

        }

    },
    60000
);


/*=========================================================
 CONSOLE
=========================================================*/

console.log(
    "===================================="
);

console.log(
    "📚 CHISHTI LIBRARY ADMIN"
);

console.log(
    "✅ Login"
);

console.log(
    "✅ Dashboard"
);

console.log(
    "✅ Visitor Counter"
);

console.log(
    "✅ Statistics"
);

console.log(
    "✅ Add Book"
);

console.log(
    "✅ Edit Book"
);

console.log(
    "✅ Delete Book"
);

console.log(
    "✅ Cover Upload"
);

console.log(
    "✅ PDF Upload"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Comments"
);

console.log(
    "✅ Comment Delete"
);

console.log(
    "✅ Refresh"
);

console.log(
    "🚀 Admin Ready"
);

console.log(
    "===================================="
);
