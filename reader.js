/*====================================================
 CHISHTI READER ENGINE
 reader.js
 PART 1
 Foundation + Load PDF
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
 CANVAS
=========================*/

const leftCanvas =
document.getElementById("leftCanvas");

const rightCanvas =
document.getElementById("rightCanvas");

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

if (pdfURL === "") {

    alert("Book Not Found");

    throw new Error("No PDF Selected");

}

/*=========================
 LOAD PDF
=========================*/

async function loadPDF() {

    try {

        const loadingTask =
        pdfjsLib.getDocument(pdfURL);

        pdfDocument =
        await loadingTask.promise;

        totalPages =
        pdfDocument.numPages;

        console.log("PDF Loaded");

        console.log("Total Pages :", totalPages);

    }

    catch(error){

        console.error(error);

        alert("Unable To Open Book");

    }

}

/*=========================
 START
=========================*/

document.title = bookTitle;

loadPDF();

console.log("✅ CHISHTI READER ENGINE");
console.log("Book :", pdfURL);
console.log("Title :", bookTitle);

/*====================================================
 CHISHTI READER ENGINE
 PART 2
 Two Page Rendering
====================================================*/

/*=========================
 RENDER LEFT PAGE
=========================*/

async function renderLeft(pageNumber){

    if(pageNumber > totalPages){

        leftCtx.clearRect(
            0,
            0,
            leftCanvas.width,
            leftCanvas.height
        );

        return;

    }

    const page =
    await pdfDocument.getPage(pageNumber);

    const viewport =
    page.getViewport({
        scale: zoom
    });

    leftCanvas.width =
    viewport.width;

    leftCanvas.height =
    viewport.height;

    await page.render({

        canvasContext:leftCtx,

        viewport:viewport

    }).promise;

}

/*=========================
 RENDER RIGHT PAGE
=========================*/

async function renderRight(pageNumber){

    if(pageNumber > totalPages){

        rightCtx.clearRect(
            0,
            0,
            rightCanvas.width,
            rightCanvas.height
        );

        return;

    }

    const page =
    await pdfDocument.getPage(pageNumber);

    const viewport =
    page.getViewport({
        scale: zoom
    });

    rightCanvas.width =
    viewport.width;

    rightCanvas.height =
    viewport.height;

    await page.render({

        canvasContext:rightCtx,

        viewport:viewport

    }).promise;

}

/*=========================
 RENDER BOOK
=========================*/

async function renderBook(){

    if(rendering) return;

    rendering = true;

    await renderLeft(currentPage);

    await renderRight(currentPage + 1);

    rendering = false;

}

/*=========================
 START BOOK
=========================*/

loadPDF().then(()=>{

    renderBook();

});

/*====================================================
 CHISHTI READER ENGINE
 PART 3
 Navigation + Page Counter
====================================================*/

/*=========================
 PAGE COUNTER
=========================*/

function updatePageCounter(){

    const counter =
    document.getElementById("pageCounter");

    if(counter){

        counter.innerHTML =
        currentPage +
        " - " +
        Math.min(currentPage + 1,totalPages) +
        " / " +
        totalPages;

    }

}

/*=========================
 NEXT
=========================*/

async function nextPages(){

    if(currentPage + 2 > totalPages){

        return;

    }

    currentPage += 2;

    await renderBook();

    updatePageCounter();

}

/*=========================
 PREVIOUS
=========================*/

async function previousPages(){

    if(currentPage <= 1){

        return;

    }

    currentPage -= 2;

    await renderBook();

    updatePageCounter();

}

/*=========================
 KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        nextPages();

    }

    if(e.key==="ArrowLeft"){

        previousPages();

    }

});


/*=========================
 FIRST COUNTER
=========================*/

updatePageCounter();

console.log("✅ Navigation Ready");

/*====================================================
 CHISHTI READER ENGINE
 PART 4
 Book Animation
====================================================*/

/*=========================
 BOOK ELEMENT
=========================*/

const book =
document.querySelector(".book");

/*=========================
 PAGE FLIP
=========================*/

function flipNext(){

    if(!book) return;

    book.classList.remove("flip-next");

    void book.offsetWidth;

    book.classList.add("flip-next");

}

function flipPrevious(){

    if(!book) return;

    book.classList.remove("flip-prev");

    void book.offsetWidth;

    book.classList.add("flip-prev");

}

/*=========================
 OVERRIDE BUTTONS
=========================*/

const oldNext = nextPages;

nextPages = async function(){

    flipNext();

    await oldNext();

};

const oldPrev = previousPages;

previousPages = async function(){

    flipPrevious();

    await oldPrev();

};

/*=========================
 KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        flipNext();

    }

    if(e.key==="ArrowLeft"){

        flipPrevious();

    }

});

console.log("✅ Book Animation Ready");

/*====================================================
 CHISHTI READER
 PART 6
 NAVIGATION ENGINE
====================================================*/

/*=========================
 NEXT SPREAD
=========================*/

function nextSpread(){

    if(currentPage + 2 > totalPages) return;

    currentPage += 2;

    book.classList.remove("flip-prev");

    void book.offsetWidth;

    book.classList.add("flip-next");

    renderSpread(currentPage);

    updatePageCounter();

}

/*=========================
 PREVIOUS SPREAD
=========================*/

function previousSpread(){

    if(currentPage <= 1) return;

    currentPage -= 2;

    if(currentPage < 1)
        currentPage = 1;

    book.classList.remove("flip-next");

    void book.offsetWidth;

    book.classList.add("flip-prev");

    renderSpread(currentPage);

    updatePageCounter();

}

/*=========================
 PAGE COUNTER
=========================*/

function updatePageCounter(){

    const counter =
    document.getElementById("pageCounter");

    const total =
    document.getElementById("totalPages");

    if(counter){

        let second =
        currentPage + 1;

        if(second > totalPages)
            second = totalPages;

        counter.innerHTML =
        currentPage + " - " + second;

    }

    if(total){

        total.innerHTML =
        totalPages;

    }

}

/*=========================
 BUTTON EVENTS
=========================*/

const nextBtn =
document.getElementById("nextPage");

const prevBtn =
document.getElementById("prevPage");

if(nextBtn){

    nextBtn.onclick =
    nextSpread;

}

if(prevBtn){

    prevBtn.onclick =
    previousSpread;

}

/*=========================
 KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="ArrowRight"){

        nextSpread();

    }

    if(e.key==="ArrowLeft"){

        previousSpread();

    }

});

/*=========================
 INITIAL COUNTER
=========================*/

setTimeout(()=>{

    updatePageCounter();

},500);

console.log("✅ Navigation Ready");
