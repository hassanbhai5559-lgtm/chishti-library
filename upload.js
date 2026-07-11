/*==================================================
CHISHTI LIBRARY
upload.js
PART 1
==================================================*/

/*==========================
ELEMENTS
==========================*/

const uploadBtn = document.getElementById("uploadBookBtn");

const statusText = document.getElementById("statusText");

const title = document.getElementById("bookTitle");

const author = document.getElementById("bookAuthor");

const category = document.getElementById("bookCategory");

const language = document.getElementById("bookLanguage");

const description = document.getElementById("bookDescription");

const cover = document.getElementById("bookCover");

const pdf = document.getElementById("bookPDF");

const reader = document.getElementById("readerLink");

/*==========================
UPLOAD BUTTON
==========================*/

uploadBtn.addEventListener("click", uploadBook);

/*==========================
UPLOAD BOOK
==========================*/

async function uploadBook(){

statusText.innerHTML="Checking Form...";

/* Validation */

if(title.value.trim()==""){

alert("Enter Book Title");

return;

}

if(author.value.trim()==""){

alert("Enter Author Name");

return;

}

if(category.value==""){

alert("Select Category");

return;

}

if(language.value==""){

alert("Select Language");

return;

}

if(!cover.files.length){

alert("Select Book Cover");

return;

}

if(!pdf.files.length){

alert("Select PDF File");

return;

}

/* Files */

const coverFile=cover.files[0];

const pdfFile=pdf.files[0];

statusText.innerHTML="Uploading Cover Image...";

/* Firebase Storage References */

const coverRef=storage.ref(

"covers/"+Date.now()+"_"+coverFile.name

);

const pdfRef=storage.ref(

"books/"+Date.now()+"_"+pdfFile.name

);

/* Next Part Upload */

window.coverRef=coverRef;

window.pdfRef=pdfRef;

window.coverFile=coverFile;

window.pdfFile=pdfFile;

statusText.innerHTML="Ready For Upload...";

startUpload();

}
/*==================================================
PART 2
UPLOAD COVER + PDF
==================================================*/

async function startUpload() {

    try {

        statusText.innerHTML = "Uploading Cover...";

        /* Upload Cover */

        await coverRef.put(coverFile);

        const coverURL = await coverRef.getDownloadURL();

        statusText.innerHTML = "Cover Uploaded...";

        /* Upload PDF */

        statusText.innerHTML = "Uploading PDF...";

        await pdfRef.put(pdfFile);

        const pdfURL = await pdfRef.getDownloadURL();

        statusText.innerHTML = "PDF Uploaded...";

        /* Reader Link */

        let readerURL = reader.value.trim();

        if (readerURL == "") {

            readerURL = pdfURL;

        }

        statusText.innerHTML = "Saving Book...";

        /* Save Firestore */

        await db.collection("books").add({

            title: title.value,

            author: author.value,

            category: category.value,

            language: language.value,

            description: description.value,

            cover: coverURL,

            pdf: pdfURL,

            reader: readerURL,

            created: firebase.firestore.FieldValue.serverTimestamp()

        });

        statusText.innerHTML = "Book Uploaded Successfully ✅";

        document.getElementById("uploadForm").reset();

        loadBooks();

    }

    catch (error) {

        console.log(error);

        statusText.innerHTML = error.message;

        alert(error.message);

    }

}
/*==================================================
PART 3
LOAD BOOKS + DELETE BOOK
==================================================*/

async function loadBooks() {

    const table = document.getElementById("booksTable");

    const totalBooks = document.getElementById("totalBooks");

    table.innerHTML = "";

    const snapshot = await db.collection("books").orderBy("created", "desc").get();

    totalBooks.innerHTML = snapshot.size;

    snapshot.forEach(doc => {

        const book = doc.data();

        table.innerHTML += `

        <tr>

            <td>

                <img src="${book.cover}" width="60">

            </td>

            <td>

                <b>${book.title}</b><br>

                ${book.author}

            </td>

            <td>

                ${book.category}

            </td>

            <td>

                <button class="editBtn"

                onclick="editBook('${doc.id}')">

                Edit

                </button>

                <button class="deleteBtn"

                onclick="deleteBook('${doc.id}','${book.cover}','${book.pdf}')">

                Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/*==========================
DELETE BOOK
==========================*/

async function deleteBook(id, coverURL, pdfURL) {

    if (!confirm("Delete this book?")) return;

    try {

        await db.collection("books").doc(id).delete();

        statusText.innerHTML = "Book Deleted";

        loadBooks();

    }

    catch (e) {

        alert(e.message);

    }

}

/*==========================
EDIT BOOK
==========================*/

function editBook(id){

    alert("Edit Feature Coming Next Update");

}

/*==========================
AUTO LOAD
==========================*/

window.onload = function(){

    loadBooks();

};
