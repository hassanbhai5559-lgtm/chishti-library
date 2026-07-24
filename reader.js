/*====================================================
 CHISHTI READER
 reader.js
 PART 1
 Foundation
====================================================*/

/*=========================
 PDF.js Worker
=========================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*=========================
 URL PARAMETERS
=========================*/

const urlParams = new URLSearchParams(window.location.search);

const pdfURL =
decodeURIComponent(urlParams.get("book") || "");

const bookTitle =
decodeURIComponent(urlParams.get("title") || "Chishti Library");

/*=========================
 ELEMENTS
=========================*/

const leftCanvas =
document.getElementById("leftPage");

const rightCanvas =
document.getElementById("rightPage");

const leftCtx =
leftCanvas.getContext("2d");

const rightCtx =
rightCanvas.getContext("2d");

/*=========================
 PDF VARIABLES
=========================*/

let pdfDocument = null;

let currentPage = 1;

let totalPages = 0;

let zoom = 1.5;

let rendering = false;

let pendingPage = null;

/*=========================
 CHECK BOOK
=========================*/

if(pdfURL===""){

    alert("Book Not Found");

    throw new Error("No PDF Selected.");

}

/*=========================
 START
=========================*/

console.log("✅ CHISHTI READER");
console.log("Book :",pdfURL);
console.log("Title :",bookTitle);

document.title = bookTitle;

