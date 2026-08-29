"use strict";

/*
=========================================================
CHISHTI LIBRARY
ADMIN.JS
FULL ADMIN PANEL
=========================================================
*/


/*=========================================================
 GLOBAL VARIABLES
=========================================================*/

let adminBooks = [];
let editingBook = false;


/*=========================================================
 ELEMENT HELPER
=========================================================*/

function $(id) {
    return document.getElementById(id);
}


/*=========================================================
 SHOW MESSAGE
=========================================================*/

function showMessage(message, type = "success") {

    const box = $("bookMessage");

    if (!box) return;

    box.innerText = message;

    box.className = "";

    box.classList.add(type);

    setTimeout(() => {

        box.innerText = "";

    }, 5000);
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
 LOGIN SCREEN
=========================================================*/

function showLogin() {

    const loginScreen = $("loginScreen");
    const adminApp = $("adminApp");

    if (loginScreen) {

        loginScreen.classList.remove("hidden");

    }

    if (adminApp) {

        adminApp.classList.add("hidden");

    }

}


/*=========================================================
 ADMIN SCREEN
=========================================================*/

function showAdmin(user) {

    const loginScreen = $("loginScreen");
    const adminApp = $("adminApp");

    if (loginScreen) {

        loginScreen.classList.add("hidden");

    }

    if (adminApp) {

        adminApp.classList.remove("hidden");

    }

    const email = $("adminEmail");

    if (email) {

        email.innerText =
            user.email ||
            "Admin";

    }

    loadDashboard();

}


/*=========================================================
 FIREBASE AUTH STATE
=========================================================*/

function initializeAdminAuth() {

    if (!window.auth) {

        console.error(
            "❌ Firebase Auth is not ready."
        );

        return;

    }

    auth.onAuthStateChanged(function(user) {

        if (user) {

            console.log(
                "✅ Admin authenticated:",
                user.email
            );

            showAdmin(user);

        } else {

            console.log(
                "ℹ️ No admin logged in"
            );

            showLogin();

        }

    });

}


/*=========================================================
 LOGIN
=========================================================*/

function initializeLogin() {

    const form = $("loginForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const email =
                $("loginEmail").value.trim();

            const password =
                $("loginPassword").value;

            const errorBox =
                $("loginError");

            const button =
                form.querySelector("button");

            if (!email || !password) {

                if (errorBox) {

                    errorBox.innerText =
                        "Please enter email and password.";

                }

                return;

            }

            try {

                if (button) {

                    button.disabled = true;

                    button.innerText =
                        "🔄 Logging in...";

                }

                if (errorBox) {

                    errorBox.innerText = "";

                }

                const result =
                    await auth.signInWithEmailAndPassword(
                        email,
                        password
                    );

                console.log(
                    "✅ Login successful:",
                    result.user.email
                );

                /*
                Auth state listener automatically
                opens the admin panel.
                */

            }

            catch (error) {

                console.error(
                    "❌ Login failed:",
                    error
                );

                let message =
                    "Login failed.";

                if (
                    error.code ===
                    "auth/invalid-credential"
                ) {

                    message =
                        "❌ Email or password is incorrect.";

                }

                else if (
                    error.code ===
                    "auth/user-not-found"
                ) {

                    message =
                        "❌ Admin account not found.";

                }

                else if (
                    error.code ===
                    "auth/wrong-password"
                ) {

                    message =
                        "❌ Incorrect password.";

                }

                else if (
                    error.code ===
                    "auth/invalid-email"
                ) {

                    message =
                        "❌ Invalid email address.";

                }

                else {

                    message =
                        "❌ " +
                        (
                            error.message ||
                            "Login failed."
                        );

                }

                if (errorBox) {

                    errorBox.innerText =
                        message;

                }

            }

            finally {

                if (button) {

                    button.disabled = false;

                    button.innerText =
                        "🔐 Login";

                }

            }

        }
    );

}


/*=========================================================
 LOGOUT
=========================================================*/

function initializeLogout() {

    const button =
        $("logoutBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        async function() {

            try {

                await auth.signOut();

                console.log(
                    "✅ Admin logged out"
                );

                showLogin();

            }

            catch (error) {

                console.error(
                    "❌ Logout error:",
                    error
                );

            }

        }
    );

}


/*=========================================================
 NAVIGATION
=========================================================*/

function initializeNavigation() {

    const buttons =
        document.querySelectorAll(".nav-btn");

    const sections =
        document.querySelectorAll(".admin-section");

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function() {

                const sectionId =
                    this.dataset.section;

                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });

                this.classList.add("active");

                sections.forEach(section => {

                    section.classList.remove(
                        "active-section"
                    );

                });

                const section =
                    $(sectionId);

                if (section) {

                    section.classList.add(
                        "active-section"
                    );

                }

                const title =
                    $("pageTitle");

                if (title) {

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

                    title.innerText =
                        names[sectionId] ||
                        "Admin Panel";

                }

                if (
                    sectionId ===
                    "dashboard"
                ) {

                    loadDashboard();

                }

                if (
                    sectionId ===
                    "books"
                ) {

                    loadBooks();

                }

                if (
                    sectionId ===
                    "comments"
                ) {

                    loadComments();

                }

            }
        );

    });


    const goAdd =
        $("goAddBook");

    if (goAdd) {

        goAdd.addEventListener(
            "click",
            function() {

                resetBookForm();

                openSection("addBook");

            }
        );

    }

}


/*=========================================================
 OPEN SECTION
=========================================================*/

function openSection(sectionId) {

    const button =
        document.querySelector(
            `.nav-btn[data-section="${sectionId}"]`
        );

    if (button) {

        button.click();

    }

}


/*=========================================================
 MOBILE MENU
=========================================================*/

function initializeMobileMenu() {

    const button =
        $("mobileMenu");

    const sidebar =
        document.querySelector(".sidebar");

    if (!button || !sidebar) return;

    button.addEventListener(
        "click",
        function() {

            sidebar.classList.toggle(
                "show"
            );

        }
    );

}


/*=========================================================
 LOAD DASHBOARD
=========================================================*/

async function loadDashboard() {

    try {

        const stats =
            await getStatistics();

        const bookStats =
            await calculateBookStatistics();

        setNumber(
            "totalBooks",
            bookStats.totalBooks
        );

        setNumber(
            "totalVisitors",
            stats.visitors || 0
        );

        setNumber(
            "totalViews",
            bookStats.totalViews
        );

        setNumber(
            "totalLikes",
            bookStats.totalLikes
        );

        setNumber(
            "totalShares",
            bookStats.totalShares
        );

        setNumber(
            "totalDownloads",
            bookStats.totalDownloads
        );

        console.log(
            "✅ Dashboard loaded"
        );

    }

    catch (error) {

        console.error(
            "❌ Dashboard error:",
            error
        );

    }

}


/*=========================================================
 NUMBER DISPLAY
=========================================================*/

function setNumber(id, number) {

    const element = $(id);

    if (!element) return;

    element.innerText =
        Number(number || 0).toLocaleString();

}


/*=========================================================
 LOAD BOOKS
=========================================================*/

async function loadBooks() {

    const table =
        $("booksTable");

    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="8">
                Loading books...
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
            "❌ Books loading error:",
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
        $("booksTable");

    if (!table) return;

    table.innerHTML = "";

    if (!adminBooks.length) {

        table.innerHTML = `
            <tr>
                <td colspan="8">
                    No books found.
                </td>
            </tr>
        `;

        return;

    }

    adminBooks.forEach(book => {

        const row =
            document.createElement("tr");

        const cover =
            book.coverUrl ||
            book.cover ||
            "logo.png";

        row.innerHTML = `

            <td>

                <img
                    src="${escapeHTML(cover)}"
                    class="admin-cover"
                    alt="Cover"
                    onerror="this.src='logo.png'"
                >

            </td>

            <td>
                ${escapeHTML(
                    book.title || "Untitled"
                )}
            </td>

            <td>
                ${escapeHTML(
                    book.author || "Unknown"
                )}
            </td>

            <td>
                ${escapeHTML(
                    book.category || "Other"
                )}
            </td>

            <td>
                ${Number(book.views || 0)}
            </td>

            <td>
                ${Number(book.downloads || 0)}
            </td>

            <td>

                ${
                    book.latest === true
                    ? "⭐ Yes"
                    : "No"
                }

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="edit-btn"
                        data-id="${book.id}"
                    >
                        ✏️ Edit
                    </button>

                    <button
                        class="delete-btn"
                        data-id="${book.id}"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </td>

        `;

        table.appendChild(row);

    });

    initializeBookActions();

}


/*=========================================================
 ESCAPE HTML
=========================================================*/

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/*=========================================================
 BOOK ACTIONS
=========================================================*/

function initializeBookActions() {

    document.querySelectorAll(
        ".edit-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            function() {

                editBook(
                    this.dataset.id
                );

            }
        );

    });


    document.querySelectorAll(
        ".delete-btn"
    ).forEach(button => {

        button.addEventListener(
            "click",
            function() {

                deleteBookAdmin(
                    this.dataset.id
                );

            }
        );

    });

}


/*=========================================================
 EDIT BOOK
=========================================================*/

function editBook(bookId) {

    const book =
        adminBooks.find(
            item => item.id === bookId
        );

    if (!book) {

        alert(
            "Book not found."
        );

        return;

    }

    editingBook = true;

    $("editingBookId").value =
        book.id;

    $("bookTitle").value =
        book.title || "";

    $("bookAuthor").value =
        book.author || "";

    $("bookCategory").value =
        book.category || "Other";

    $("bookLanguage").value =
        book.language || "Urdu";

    $("bookDescription").value =
        book.description || "";

    $("bookLatest").checked =
        book.latest === true;

    $("coverStatus").innerText =
        book.coverUrl
        ? "✅ Existing cover will be kept"
        : "No cover selected";

    $("pdfStatus").innerText =
        book.pdfUrl
        ? "✅ Existing PDF will be kept"
        : "No PDF selected";

    const title =
        $("bookFormTitle");

    if (title) {

        title.innerText =
            "Edit Book";

    }

    const save =
        $("saveBookBtn");

    if (save) {

        save.innerText =
            "💾 Update Book";

    }

    openSection("addBook");

}


/*=========================================================
 RESET FORM
=========================================================*/

function resetBookForm() {

    editingBook = false;

    const form =
        $("bookForm");

    if (form) {

        form.reset();

    }

    $("editingBookId").value = "";

    $("coverStatus").innerText =
        "No cover selected";

    $("pdfStatus").innerText =
        "No PDF selected";

    const title =
        $("bookFormTitle");

    if (title) {

        title.innerText =
            "Add New Book";

    }

    const save =
        $("saveBookBtn");

    if (save) {

        save.innerText =
            "💾 Save Book";

    }

}


/*=========================================================
 CANCEL EDIT
=========================================================*/

function initializeCancel() {

    const button =
        $("cancelEdit");

    if (!button) return;

    button.addEventListener(
        "click",
        function() {

            resetBookForm();

            openSection("books");

        }
    );

}


/*=========================================================
 COVER FILE STATUS
=========================================================*/

function initializeFileInputs() {

    const cover =
        $("coverFile");

    const pdf =
        $("pdfFile");


    if (cover) {

        cover.addEventListener(
            "change",
            function() {

                if (
                    this.files &&
                    this.files[0]
                ) {

                    $("coverStatus").innerText =
                        "📕 " +
                        this.files[0].name;

                }

            }
        );

    }


    if (pdf) {

        pdf.addEventListener(
            "change",
            function() {

                if (
                    this.files &&
                    this.files[0]
                ) {

                    $("pdfStatus").innerText =
                        "📄 " +
                        this.files[0].name;

                }

            }
        );

    }

}


/*=========================================================
 SAVE / UPDATE BOOK
=========================================================*/

function initializeBookForm() {

    const form =
        $("bookForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        async function(e) {

            e.preventDefault();

            const title =
                $("bookTitle").value.trim();

            const author =
                $("bookAuthor").value.trim();

            const category =
                $("bookCategory").value;

            const language =
                $("bookLanguage").value;

            const description =
                $("bookDescription").value.trim();

            const latest =
                $("bookLatest").checked;

            const coverFile =
                $("coverFile").files[0];

            const pdfFile =
                $("pdfFile").files[0];

            const editingId =
                $("editingBookId").value.trim();

            const saveButton =
                $("saveBookBtn");


            if (!title) {

                showMessage(
                    "Please enter book title.",
                    "error"
                );

                return;

            }


            if (!author) {

                showMessage(
                    "Please enter author.",
                    "error"
                );

                return;

            }


            try {

                saveButton.disabled =
                    true;

                saveButton.innerText =
                    editingId
                    ? "🔄 Updating..."
                    : "🔄 Saving...";


                /*
                =========================================
                UPDATE EXISTING BOOK
                =========================================
                */

                if (editingId) {

                    const oldBook =
                        adminBooks.find(
                            book =>
                                book.id ===
                                editingId
                        );


                    let coverUrl =
                        oldBook?.coverUrl ||
                        "";

                    let coverPath =
                        oldBook?.coverPath ||
                        "";

                    let pdfUrl =
                        oldBook?.pdfUrl ||
                        "";

                    let pdfPath =
                        oldBook?.pdfPath ||
                        "";


                    /*
                    NEW COVER
                    */

                    if (coverFile) {

                        const uploadedCover =
                            await uploadBookCover(
                                coverFile,
                                editingId
                            );

                        coverUrl =
                            uploadedCover.url;

                        coverPath =
                            uploadedCover.path;

                    }


                    /*
                    NEW PDF
                    */

                    if (pdfFile) {

                        const uploadedPDF =
                            await uploadBookPDF(
                                pdfFile,
                                editingId
                            );

                        pdfUrl =
                            uploadedPDF.url;

                        pdfPath =
                            uploadedPDF.path;

                    }


                    await updateBook(
                        editingId,
                        {

                            title,
                            author,
                            category,
                            language,
                            description,

                            coverUrl,
                            coverPath,

                            pdfUrl,
                            pdfPath,

                            latest

                        }
                    );


                    /*
                    If this is latest,
                    remove latest from others.
                    */

                    if (latest) {

                        await removeOtherLatest(
                            editingId
                        );

                    }


                    showMessage(
                        "✅ Book updated successfully!",
                        "success"
                    );

                }


                /*
                =========================================
                ADD NEW BOOK
                =========================================
                */

                else {

                    const bookId =
                        createBookId();


                    let coverUrl = "";

                    let coverPath = "";

                    let pdfUrl = "";

                    let pdfPath = "";


                    /*
                    COVER
                    */

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


                    /*
                    PDF
                    */

                    if (!pdfFile) {

                        throw new Error(
                            "Please select a PDF."
                        );

                    }


                    const uploadedPDF =
                        await uploadBookPDF(
                            pdfFile,
                            bookId
                        );

                    pdfUrl =
                        uploadedPDF.url;

                    pdfPath =
                        uploadedPDF.path;


                    await addBook({

                        title,
                        author,
                        category,
                        language,
                        description,

                        coverUrl,
                        coverPath,

                        pdfUrl,
                        pdfPath,

                        latest

                    });


                    showMessage(
                        "✅ Book added successfully!",
                        "success"
                    );

                }


                /*
                REFRESH
                */

                await loadBooks();

                await loadDashboard();


                setTimeout(() => {

                    resetBookForm();

                    openSection(
                        "books"
                    );

                }, 1000);

            }

            catch (error) {

                console.error(
                    "❌ Save book error:",
                    error
                );

                showMessage(
                    "❌ " +
                    (
                        error.message ||
                        "Something went wrong."
                    ),
                    "error"
                );

            }

            finally {

                saveButton.disabled =
                    false;

                saveButton.innerText =
                    editingId
                    ? "💾 Update Book"
                    : "💾 Save Book";

            }

        }
    );

}


/*=========================================================
 REMOVE OTHER LATEST BOOKS
=========================================================*/

async function removeOtherLatest(
    currentBookId
) {

    try {

        const snapshot =
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

        snapshot.forEach(doc => {

            if (
                doc.id !==
                currentBookId
            ) {

                batch.update(
                    doc.ref,
                    {
                        latest: false
                    }
                );

            }

        });

        await batch.commit();

    }

    catch (error) {

        console.error(
            "❌ Latest update error:",
            error
        );

    }

}


/*=========================================================
 DELETE BOOK
=========================================================*/

async function deleteBookAdmin(bookId) {

    const book =
        adminBooks.find(
            item =>
                item.id === bookId
        );

    if (!book) return;


    const confirmed =
        confirm(
            `Delete "${book.title}"?\n\nThis action cannot be undone.`
        );


    if (!confirmed) return;


    try {

        await deleteBook(bookId);

        console.log(
            "🗑️ Deleted:",
            book.title
        );

        await loadBooks();

        await loadDashboard();

        alert(
            "✅ Book deleted successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Delete error:",
            error
        );

        alert(
            "❌ Failed to delete book."
        );

    }

}


/*=========================================================
 LOAD COMMENTS
=========================================================*/

async function loadComments() {

    const container =
        $("commentsContainer");

    if (!container) return;


    container.innerHTML = `
        <p class="loading">
            Loading comments...
        </p>
    `;


    try {

        const books =
            await getAllBooks();

        let allComments = [];


        for (
            const book of books
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

                            bookId:
                                book.id,

                            bookTitle:
                                book.title

                        });

                    }
                );

            }

            catch (error) {

                console.warn(
                    "Comments unavailable for:",
                    book.title
                );

            }

        }


        renderComments(
            allComments
        );

    }

    catch (error) {

        console.error(
            "❌ Comments error:",
            error
        );

        container.innerHTML = `
            <p>
                ❌ Failed to load comments.
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
        $("commentsContainer");

    if (!container) return;


    if (!comments.length) {

        container.innerHTML = `
            <p>
                No comments yet.
            </p>
        `;

        return;

    }


    container.innerHTML = "";


    comments.forEach(comment => {

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "comment-card";


        div.innerHTML = `

            <div>

                <h3>
                    ${escapeHTML(
                        comment.name ||
                        "Visitor"
                    )}
                </h3>

                <strong>
                    ${escapeHTML(
                        comment.bookTitle ||
                        "Book"
                    )}
                </strong>

                <p>
                    ${escapeHTML(
                        comment.comment ||
                        ""
                    )}
                </p>

            </div>

            <button
                class="delete-comment"
                data-book="${comment.bookId}"
                data-comment="${comment.id}"
            >
                🗑️ Delete
            </button>

        `;


        container.appendChild(div);

    });


    document.querySelectorAll(
        ".delete-comment"
    ).forEach(button => {

        button.addEventListener(
            "click",
            function() {

                deleteComment(
                    this.dataset.book,
                    this.dataset.comment
                );

            }
        );

    });

}


/*=========================================================
 DELETE COMMENT
=========================================================*/

async function deleteComment(
    bookId,
    commentId
) {

    if (!bookId || !commentId) return;


    const confirmed =
        confirm(
            "Delete this comment?"
        );


    if (!confirmed) return;


    try {

        await db
            .collection("books")
            .doc(bookId)
            .collection("comments")
            .doc(commentId)
            .delete();


        await db
            .collection("books")
            .doc(bookId)
            .update({

                comments:
                    firebase.firestore
                        .FieldValue
                        .increment(-1)

            });


        await loadComments();

        console.log(
            "✅ Comment deleted"
        );

    }

    catch (error) {

        console.error(
            "❌ Comment delete error:",
            error
        );

        alert(
            "❌ Could not delete comment."
        );

    }

}


/*=========================================================
 INITIALIZE ADMIN
=========================================================*/

waitForFirebase(function() {

    console.log(
        "🔥 Firebase ready for Admin Panel"
    );

    initializeAdminAuth();

    initializeLogin();

    initializeLogout();

    initializeNavigation();

    initializeMobileMenu();

    initializeBookForm();

    initializeCancel();

    initializeFileInputs();

});


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
    "===================================="
);

console.log(
    "✅ Login System"
);

console.log(
    "✅ Authentication"
);

console.log(
    "✅ Dashboard"
);

console.log(
    "✅ Books"
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
    "✅ PDF Upload"
);

console.log(
    "✅ Cover Upload"
);

console.log(
    "✅ Categories"
);

console.log(
    "✅ Latest Book"
);

console.log(
    "✅ Comments"
);

console.log(
    "✅ Logout"
);

console.log(
    "🚀 Admin Panel Ready"
);

console.log(
    "===================================="
);
