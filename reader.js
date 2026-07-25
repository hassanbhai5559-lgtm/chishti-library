/*====================================================
 CHISHTI READER v3
 PART 1
 FOUNDATION
====================================================*/

/*=========================
PDF.js Worker
=========================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*=========================
URL PARAMETERS
=========================*/

const params =
new URLSearchParams(window.location.search);

const pdfURL =
decodeURIComponent(params.get("book") || "");

const bookTitle =
decodeURIComponent(params.get("title") || "Chishti Library");

/*=========================
DOM ELEMENTS
=========================*/

const book =
document.getElementById("readerBook");

const leftCanvas =
document.getElementById("leftCanvas");

const rightCanvas =
document.getElementById("rightCanvas");

const leftCtx =
leftCanvas.getContext("2d");

const rightCtx =
rightCanvas.getContext("2d");

const bookTitleElement =
document.getElementById("bookTitle");

const pageCounter =
document.getElementById("pageCounter");

const totalPagesElement =
document.getElementById("totalPages");

/*=========================
READER VARIABLES
=========================*/

let pdf = null;

let totalPages = 0;

let currentPage = 1;

let zoom = 1.5;

let rendering = false;

/*=========================
WINDOW TITLE
=========================*/

document.title = bookTitle;

if(bookTitleElement){

    bookTitleElement.textContent =
    bookTitle;

}

/*=========================
CHECK PDF
=========================*/

if(!pdfURL){

    alert("No Book Selected");

    throw new Error("PDF URL Missing");

}

/*=========================
LOAD PDF
=========================*/

async function loadPDF(){

    try{

        const task =
        pdfjsLib.getDocument(pdfURL);

        pdf =
        await task.promise;

        totalPages =
        pdf.numPages;

        if(totalPagesElement){

            totalPagesElement.textContent =
            totalPages;

        }

        console.log(
            "PDF Loaded Successfully"
        );

        console.log(
            "Pages :",
            totalPages
        );

    }

    catch(error){

        console.error(error);

        alert("Unable To Open PDF.");

    }

}

console.log("✅ Reader v3 Initialized");

/*====================================================
 CHISHTI READER v3
 PART 2
 PDF RENDER ENGINE
====================================================*/

/*=========================
RENDER SINGLE PAGE
=========================*/

async function renderPage(pageNumber, canvas, context){

    if(pageNumber > totalPages){

        context.clearRect(

            0,
            0,

            canvas.width,
            canvas.height

        );

        return;

    }

    const page =
    await pdf.getPage(pageNumber);

    const viewport =
    page.getViewport({

        scale: zoom

    });

    const outputScale =
    window.devicePixelRatio || 1;

    canvas.width =
    Math.floor(viewport.width * outputScale);

    canvas.height =
    Math.floor(viewport.height * outputScale);

    canvas.style.width =
    viewport.width + "px";

    canvas.style.height =
    viewport.height + "px";

    context.setTransform(

        outputScale,
        0,
        0,
        outputScale,
        0,
        0

    );

    await page.render({

        canvasContext: context,

        viewport: viewport

    }).promise;

}

/*=========================
RENDER CURRENT SPREAD
=========================*/

async function renderSpread(){

    if(rendering)
        return;

    rendering = true;

    await renderPage(

        currentPage,

        leftCanvas,

        leftCtx

    );

    await renderPage(

        currentPage + 1,

        rightCanvas,

        rightCtx

    );

    updatePageCounter();

    rendering = false;

}

/*=========================
PAGE COUNTER
=========================*/

function updatePageCounter(){

    if(!pageCounter)
        return;

    let secondPage =
    currentPage + 1;

    if(secondPage > totalPages){

        secondPage =
        totalPages;

    }

    pageCounter.textContent =

        currentPage +

        " - " +

        secondPage;

}

console.log("✅ Render Engine Ready");

/*====================================================
 CHISHTI READER v3
 PART 3
 NAVIGATION + ZOOM + TOOLS
====================================================*/

/*=========================
BUTTONS
=========================*/

const firstPageBtn =
document.getElementById("firstPage");

const lastPageBtn =
document.getElementById("lastPage");

const nextPageBtn =
document.getElementById("nextPage");

const prevPageBtn =
document.getElementById("prevPage");

const zoomInBtn =
document.getElementById("zoomIn");

const zoomOutBtn =
document.getElementById("zoomOut");

const fullscreenBtn =
document.getElementById("fullscreenBtn");

const downloadBtn =
document.getElementById("downloadBtn");

const printBtn =
document.getElementById("printBtn");

/*=========================
BOOK ANIMATION
=========================*/

function flipNext(){

    if(!book) return;

    book.classList.remove("flip-prev");

    void book.offsetWidth;

    book.classList.add("flip-next");

}

function flipPrevious(){

    if(!book) return;

    book.classList.remove("flip-next");

    void book.offsetWidth;

    book.classList.add("flip-prev");

}

/*=========================
NEXT
=========================*/

async function nextSpread(){

    if(rendering) return;

    if(currentPage + 2 > totalPages)
        return;

    currentPage += 2;

    flipNext();

    await renderSpread();

}

/*=========================
PREVIOUS
=========================*/

async function previousSpread(){

    if(rendering) return;

    if(currentPage <= 1)
        return;

    currentPage -= 2;

    if(currentPage < 1)
        currentPage = 1;

    flipPrevious();

    await renderSpread();

}

/*=========================
FIRST
=========================*/

async function firstSpread(){

    currentPage = 1;

    await renderSpread();

}

/*=========================
LAST
=========================*/

async function lastSpread(){

    if(totalPages % 2 === 0){

        currentPage = totalPages - 1;

    }else{

        currentPage = totalPages;

    }

    if(currentPage < 1)
        currentPage = 1;

    await renderSpread();

}

/*=========================
ZOOM
=========================*/

const MIN_ZOOM = 0.8;
const MAX_ZOOM = 3.0;
const STEP = 0.20;

async function zoomIn(){

    if(zoom >= MAX_ZOOM)
        return;

    zoom += STEP;

    await renderSpread();

}

async function zoomOut(){

    if(zoom <= MIN_ZOOM)
        return;

    zoom -= STEP;

    await renderSpread();

}

/*=========================
FULLSCREEN
=========================*/

function toggleFullscreen(){

    if(!document.fullscreenElement){

        document.documentElement.requestFullscreen();

    }else{

        document.exitFullscreen();

    }

}

/*=========================
DOWNLOAD
=========================*/

function downloadBook(){

    window.open(pdfURL,"_blank");

}

/*=========================
PRINT
=========================*/

function printBook(){

    const frame =
    window.open(pdfURL);

    if(frame){

        frame.onload = () => {

            frame.print();

        };

    }

}

/*=========================
BUTTON EVENTS
=========================*/

if(nextPageBtn)
nextPageBtn.onclick = nextSpread;

if(prevPageBtn)
prevPageBtn.onclick = previousSpread;

if(firstPageBtn)
firstPageBtn.onclick = firstSpread;

if(lastPageBtn)
lastPageBtn.onclick = lastSpread;

if(zoomInBtn)
zoomInBtn.onclick = zoomIn;

if(zoomOutBtn)
zoomOutBtn.onclick = zoomOut;

if(fullscreenBtn)
fullscreenBtn.onclick = toggleFullscreen;

if(downloadBtn)
downloadBtn.onclick = downloadBook;

if(printBtn)
printBtn.onclick = printBook;

/*=========================
KEYBOARD
=========================*/

document.addEventListener("keydown",(e)=>{

    switch(e.key){

        case "ArrowRight":

            nextSpread();
            break;

        case "ArrowLeft":

            previousSpread();
            break;

        case "+":
        case "=":

            zoomIn();
            break;

        case "-":

            zoomOut();
            break;

        case "Home":

            firstSpread();
            break;

        case "End":

            lastSpread();
            break;

        case "f":

            toggleFullscreen();
            break;

    }

});

/*=========================
MOUSE WHEEL
=========================*/

book.addEventListener("wheel",(e)=>{

    if(e.ctrlKey){

        e.preventDefault();

        if(e.deltaY < 0){

            zoomIn();

        }else{

            zoomOut();

        }

    }

},{passive:false});

console.log("✅ Reader v3 Ready");

/*====================================================
 SEARCH ENGINE
 PART 2
 POPUP CONTROLLER
====================================================*/

const searchBtn =
document.getElementById("searchBtn");

const searchOverlay =
document.getElementById("searchOverlay");

const closeSearch =
document.getElementById("closeSearch");

const searchInput =
document.getElementById("searchInput");

/*=========================
OPEN
=========================*/

if(searchBtn){

    searchBtn.onclick=function(){

        searchOverlay.classList.add("active");

        setTimeout(()=>{

            searchInput.focus();

        },120);

    };

}

/*=========================
CLOSE
=========================*/

if(closeSearch){

    closeSearch.onclick=function(){

        searchOverlay.classList.remove("active");

    };

}

/*=========================
CLICK OUTSIDE
=========================*/

if(searchOverlay){

    searchOverlay.onclick=function(e){

        if(e.target===searchOverlay){

            searchOverlay.classList.remove("active");

        }

    };

}

/*=========================
ESC KEY
=========================*/

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        searchOverlay.classList.remove("active");

    }

});

console.log("✅ Search Popup Ready");


/*====================================================
 SEARCH ENGINE
 PART 3
 PDF TEXT INDEXER
====================================================*/

/*=========================
SEARCH VARIABLES
=========================*/

let pdfTextIndex = [];

/*=========================
BUILD INDEX
=========================*/

async function buildSearchIndex(){

    pdfTextIndex = [];

    for(let pageNumber = 1; pageNumber <= totalPages; pageNumber++){

        try{

            const page =
            await pdf.getPage(pageNumber);

            const textContent =
            await page.getTextContent();

            let pageText = "";

            textContent.items.forEach(item=>{

                pageText +=
                item.str + " ";

            });

            pdfTextIndex.push({

                page:pageNumber,

                text:pageText.toLowerCase()

            });

        }

        catch(error){

            console.error(

                "Search Index Error Page :",

                pageNumber

            );

        }

    }

    console.log(

        "✅ Search Index Ready",

        pdfTextIndex.length,

        "Pages Indexed"

    );

}

/*=========================
START INDEX
=========================*/

initializeReader().then(async()=>{

    await renderSpread();

    await buildSearchIndex();

});

/*====================================================
 SEARCH ENGINE
 PART 4
 SEARCH FUNCTION
====================================================*/

/*=========================
ELEMENTS
=========================*/

const startSearch =
document.getElementById("startSearch");

const searchResults =
document.getElementById("searchResults");

/*=========================
SEARCH
=========================*/

function searchBook(){

    const keyword =
    searchInput.value
    .trim()
    .toLowerCase();

    searchResults.innerHTML = "";

    if(keyword===""){

        searchResults.innerHTML =
        "<p>Type something to search...</p>";

        return;

    }

    let found = 0;

    pdfTextIndex.forEach(page=>{

        if(page.text.includes(keyword)){

            found++;

            const item =
            document.createElement("div");

            item.className =
            "search-item";

            item.innerHTML =

            "<strong>Page " +

            page.page +

            "</strong><br>" +

            "<small>Keyword Found</small>";

            item.onclick = async()=>{

                currentPage =

                page.page % 2 === 0 ?

                page.page - 1 :

                page.page;

                if(currentPage < 1)
                    currentPage = 1;

                searchOverlay.classList.remove("active");

                await renderSpread();

            };

            searchResults.appendChild(item);

        }

    });

    if(found===0){

        searchResults.innerHTML =

        "<p>No Result Found.</p>";

    }

}

/*=========================
BUTTON
=========================*/

if(startSearch){

    startSearch.onclick =
    searchBook;

}

/*=========================
ENTER
=========================*/

if(searchInput){

    searchInput.addEventListener(

        "keydown",

        function(e){

            if(e.key==="Enter"){

                searchBook();

            }

        }

    );

}

console.log("✅ Search Engine Ready");
