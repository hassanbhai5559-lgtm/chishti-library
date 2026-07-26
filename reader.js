/*====================================================
 CHISHTI READER ENGINE v3
 PART 1
 FOUNDATION + FAST PDF ENGINE
====================================================*/

/*==============================
 PDF.js Worker
==============================*/

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/*==============================
 URL PARAMETERS
==============================*/

const params = new URLSearchParams(window.location.search);

const PDF_URL =
decodeURIComponent(params.get("book") || "");

const BOOK_TITLE =
decodeURIComponent(params.get("title") || "Chishti Library");

/*==============================
 DOCUMENT TITLE
==============================*/

document.title = BOOK_TITLE;

/*==============================
 DOM
==============================*/

const leftCanvas =
document.getElementById("leftCanvas");

const rightCanvas =
document.getElementById("rightCanvas");

const leftCtx =
leftCanvas.getContext("2d");

const rightCtx =
rightCanvas.getContext("2d");

const bookTitle =
document.getElementById("bookTitle");

const pageCounter =
document.getElementById("pageCounter");

const totalPagesElement =
document.getElementById("totalPages");

/*==============================
 TITLE
==============================*/

if(bookTitle){

    bookTitle.textContent =
    BOOK_TITLE;

}

/*==============================
 PDF VARIABLES
==============================*/

let pdf = null;

let totalPages = 0;

let currentPage = 1;

let zoom = 1.45;

let rendering = false;

/*==============================
 CACHE
==============================*/

const pageCache =
new Map();

const textCache =
new Map();

/*==============================
 SEARCH INDEX
==============================*/

const pdfTextIndex = [];

/*==============================
 SETTINGS
==============================*/

const SETTINGS = {

    minZoom : 0.70,

    maxZoom : 3.20,

    zoomStep : 0.15,

    renderScale : 2

};

/*==============================
 CHECK PDF
==============================*/

if(!PDF_URL){

    alert("Book Not Found");

    throw new Error("No PDF Selected");

}

/*==============================
 LOAD PDF
==============================*/

async function loadPDF(){

    try{

        const task =
        pdfjsLib.getDocument({

            url:PDF_URL,

            cMapPacked:true,

            disableAutoFetch:false,

            disableStream:false,

            disableRange:false

        });

        pdf =
        await task.promise;

        totalPages =
        pdf.numPages;

        if(totalPagesElement){

            totalPagesElement.textContent =
            totalPages;

        }

        console.log(

            "PDF Loaded",

            totalPages

        );

        return true;

    }

    catch(err){

        console.error(err);

        alert("Unable To Open Book");

        return false;

    }

}

console.log("✅ Reader Engine v3 Ready");

/*====================================================
 CHISHTI READER ENGINE v3
 PART 2
 RENDER ENGINE
====================================================*/

/*==============================
GET PAGE (CACHE)
==============================*/

async function getPage(pageNumber){

    if(pageCache.has(pageNumber)){

        return pageCache.get(pageNumber);

    }

    const page =
    await pdf.getPage(pageNumber);

    pageCache.set(

        pageNumber,

        page

    );

    return page;

}

/*==============================
RENDER PAGE
==============================*/

async function renderPage(

    pageNumber,

    canvas,

    ctx

){

    if(pageNumber>totalPages){

        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

        return;

    }

    const page =
    await getPage(pageNumber);

    const viewport =
    page.getViewport({

        scale:zoom

    });

    const ratio =
    window.devicePixelRatio || 1;

    canvas.width =
    viewport.width * ratio;

    canvas.height =
    viewport.height * ratio;

    canvas.style.width =
    viewport.width + "px";

    canvas.style.height =
    viewport.height + "px";

    ctx.setTransform(

        ratio,

        0,

        0,

        ratio,

        0,

        0

    );

    await page.render({

        canvasContext:ctx,

        viewport

    }).promise;

}

/*==============================
RENDER SPREAD
==============================*/

async function renderSpread(){

    if(rendering)
        return;

    rendering = true;

    await Promise.all([

        renderPage(

            currentPage,

            leftCanvas,

            leftCtx

        ),

        renderPage(

            currentPage+1,

            rightCanvas,

            rightCtx

        )

    ]);

    updatePageCounter();

    rendering = false;

    preloadNext();

}

/*==============================
PRELOAD NEXT PAGES
==============================*/

async function preloadNext(){

    const p1 =
    currentPage+2;

    const p2 =
    currentPage+3;

    if(p1<=totalPages){

        getPage(p1);

    }

    if(p2<=totalPages){

        getPage(p2);

    }

}

/*==============================
PRELOAD PREVIOUS
==============================*/

async function preloadPrevious(){

    const p1 =
    currentPage-2;

    const p2 =
    currentPage-3;

    if(p1>=1){

        getPage(p1);

    }

    if(p2>=1){

        getPage(p2);

    }

}

/*==============================
FIRST LOAD
==============================*/

async function startReader(){

    const ok =
    await loadPDF();

    if(!ok)
        return;

    await renderSpread();

    console.log(

        "Fast Renderer Ready"

    );

}

startReader();

console.log("✅ Render Engine Ready");

/*====================================================
 CHISHTI READER ENGINE v3
 PART 3
 NAVIGATION ENGINE
====================================================*/

/*==============================
BOOK
==============================*/

const book =
document.querySelector(".book");

/*==============================
PAGE COUNTER
==============================*/

function updatePageCounter(){

    if(!pageCounter) return;

    let rightPage =
    currentPage + 1;

    if(rightPage > totalPages){

        rightPage = totalPages;

    }

    pageCounter.textContent =

    currentPage +

    " - " +

    rightPage;

}

/*==============================
FLIP
==============================*/

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

/*==============================
NEXT
==============================*/

async function nextSpread(){

    if(rendering)
        return;

    if(currentPage + 2 > totalPages)
        return;

    currentPage += 2;

    flipNext();

    await renderSpread();

}

/*==============================
PREVIOUS
==============================*/

async function previousSpread(){

    if(rendering)
        return;

    if(currentPage <= 1)
        return;

    currentPage -= 2;

    if(currentPage < 1)
        currentPage = 1;

    flipPrevious();

    await renderSpread();

}

/*==============================
FIRST
==============================*/

async function firstSpread(){

    currentPage = 1;

    await renderSpread();

}

/*==============================
LAST
==============================*/

async function lastSpread(){

    if(totalPages % 2 === 0){

        currentPage =
        totalPages - 1;

    }else{

        currentPage =
        totalPages;

    }

    if(currentPage < 1)
        currentPage = 1;

    await renderSpread();

}

/*==============================
BUTTONS
==============================*/

const firstBtn =
document.getElementById("firstPage");

const lastBtn =
document.getElementById("lastPage");

const nextBtn =
document.getElementById("nextPage");

const prevBtn =
document.getElementById("prevPage");

if(firstBtn)
firstBtn.onclick =
firstSpread;

if(lastBtn)
lastBtn.onclick =
lastSpread;

if(nextBtn)
nextBtn.onclick =
nextSpread;

if(prevBtn)
prevBtn.onclick =
previousSpread;

/*==============================
KEYBOARD
==============================*/

document.addEventListener(

"keydown",

function(e){

    switch(e.key){

        case "ArrowRight":

            nextSpread();

        break;

        case "ArrowLeft":

            previousSpread();

        break;

        case "Home":

            firstSpread();

        break;

        case "End":

            lastSpread();

        break;

    }

});

/*==============================
PRELOAD
==============================*/

book.addEventListener(

"mouseenter",

function(){

    preloadNext();

    preloadPrevious();

});

/*==============================
READY
==============================*/

console.log("✅ Navigation Ready");

/*====================================================
 CHISHTI READER ENGINE v3
 PART 4
 ZOOM ENGINE
====================================================*/

/*==============================
BUTTONS
==============================*/

const zoomInBtn =
document.getElementById("zoomIn");

const zoomOutBtn =
document.getElementById("zoomOut");

/*==============================
LIMITS
==============================*/

const MIN_ZOOM = 0.70;

const MAX_ZOOM = 3.20;

const ZOOM_STEP = 0.15;

/*==============================
APPLY ZOOM
==============================*/

async function applyZoom(){

    if(rendering)
        return;

    await renderSpread();

}

/*==============================
ZOOM IN
==============================*/

async function zoomIn(){

    if(zoom >= MAX_ZOOM)
        return;

    zoom += ZOOM_STEP;

    await applyZoom();

}

/*==============================
ZOOM OUT
==============================*/

async function zoomOut(){

    if(zoom <= MIN_ZOOM)
        return;

    zoom -= ZOOM_STEP;

    await applyZoom();

}

/*==============================
BUTTON EVENTS
==============================*/

if(zoomInBtn){

    zoomInBtn.onclick =
    zoomIn;

}

if(zoomOutBtn){

    zoomOutBtn.onclick =
    zoomOut;

}

/*==============================
DOUBLE CLICK
==============================*/

if(book){

book.addEventListener(

"dblclick",

async()=>{

    if(zoom < 2.5){

        zoom = 2.5;

    }else{

        zoom = 1.45;

    }

    await applyZoom();

});

}

/*==============================
CTRL + WHEEL
==============================*/

if(book){

book.addEventListener(

"wheel",

function(e){

    if(!e.ctrlKey)
        return;

    e.preventDefault();

    if(e.deltaY < 0){

        zoomIn();

    }else{

        zoomOut();

    }

},

{passive:false});

}

/*==============================
KEYBOARD
==============================*/

document.addEventListener(

"keydown",

function(e){

    switch(e.key){

        case "+":

        case "=":

            zoomIn();

        break;

        case "-":

            zoomOut();

        break;

        case "0":

            zoom = 1.45;

            applyZoom();

        break;

    }

});

/*==============================
PINCH ZOOM READY
==============================*/

let touchDistance = 0;

function getDistance(t1,t2){

    const dx =
    t1.clientX - t2.clientX;

    const dy =
    t1.clientY - t2.clientY;

    return Math.sqrt(dx*dx + dy*dy);

}

if(book){

book.addEventListener(

"touchstart",

function(e){

    if(e.touches.length===2){

        touchDistance =

        getDistance(

            e.touches[0],

            e.touches[1]

        );

    }

});

book.addEventListener(

"touchmove",

function(e){

    if(e.touches.length!==2)
        return;

    e.preventDefault();

    const newDistance =

    getDistance(

        e.touches[0],

        e.touches[1]

    );

    if(newDistance > touchDistance + 15){

        zoomIn();

        touchDistance = newDistance;

    }

    if(newDistance < touchDistance - 15){

        zoomOut();

        touchDistance = newDistance;

    }

},

{passive:false});

}

console.log("✅ Zoom Engine Ready");

/*====================================================
 CHISHTI READER ENGINE v3
 PART 5
 TOOLS + THEME + SETTINGS
====================================================*/

/*==============================
BUTTONS
==============================*/

const fullscreenBtn =
document.getElementById("fullscreenBtn");

const downloadBtn =
document.getElementById("downloadBtn");

const printBtn =
document.getElementById("printBtn");

const themeBtn =
document.getElementById("themeBtn");

const settingsBtn =
document.getElementById("settingsBtn");

/*==============================
FULLSCREEN
==============================*/

async function toggleFullscreen(){

    if(!document.fullscreenElement){

        await document.documentElement.requestFullscreen();

    }else{

        await document.exitFullscreen();

    }

}

if(fullscreenBtn){

    fullscreenBtn.onclick =
    toggleFullscreen;

}

/*==============================
DOWNLOAD
==============================*/

function downloadBook(){

    const a =
    document.createElement("a");

    a.href = PDF_URL;

    a.download =

    BOOK_TITLE + ".pdf";

    document.body.appendChild(a);

    a.click();

    a.remove();

}

if(downloadBtn){

    downloadBtn.onclick =
    downloadBook;

}

/*==============================
PRINT
==============================*/

function printBook(){

    const frame =
    window.open(PDF_URL);

    if(!frame) return;

    frame.onload = function(){

        frame.focus();

        frame.print();

    };

}

if(printBtn){

    printBtn.onclick =
    printBook;

}

/*==============================
THEME
==============================*/

const THEMES = [

    "maroon",

    "dark",

    "light",

    "sepia"

];

let currentTheme =

localStorage.getItem(

"chishti_theme"

) || "maroon";

applyTheme(currentTheme);

function applyTheme(name){

    document.body.setAttribute(

        "data-theme",

        name

    );

    localStorage.setItem(

        "chishti_theme",

        name

    );

    currentTheme = name;

}

function changeTheme(){

    let index =

    THEMES.indexOf(

        currentTheme

    );

    index++;

    if(index>=THEMES.length)

        index=0;

    applyTheme(

        THEMES[index]

    );

}

if(themeBtn){

    themeBtn.onclick =
    changeTheme;

}

/*==============================
SETTINGS
==============================*/

function saveReaderState(){

    const data={

        page:currentPage,

        zoom:zoom,

        theme:currentTheme

    };

    localStorage.setItem(

        "chishti_reader",

        JSON.stringify(data)

    );

}

function loadReaderState(){

    const data=

    localStorage.getItem(

        "chishti_reader"

    );

    if(!data) return;

    try{

        const state=

        JSON.parse(data);

        if(state.page)

            currentPage=

            state.page;

        if(state.zoom)

            zoom=

            state.zoom;

        if(state.theme)

            applyTheme(

                state.theme

            );

    }

    catch(e){

        console.log(

            "Reader Settings Reset"

        );

    }

}

loadReaderState();

/*==============================
AUTO SAVE
==============================*/

setInterval(

saveReaderState,

5000

);

/*==============================
KEYBOARD
==============================*/

document.addEventListener(

"keydown",

function(e){

    if(e.key==="F11"){

        e.preventDefault();

        toggleFullscreen();

    }

});

console.log(

"✅ Premium Tools Ready"

);

/*====================================================
 CHISHTI READER ENGINE v3
 PART 6
 SEARCH + BOOKMARK + CONTINUE READING
====================================================*/

/*==============================
ELEMENTS
==============================*/

const bookmarkBtn =
document.getElementById("bookmarkBtn");

const searchBtn =
document.getElementById("searchBtn");

const searchOverlay =
document.getElementById("searchOverlay");

const searchInput =
document.getElementById("searchInput");

const searchResults =
document.getElementById("searchResults");

const startSearch =
document.getElementById("startSearch");

const closeSearch =
document.getElementById("closeSearch");

/*==============================
SEARCH INDEX
==============================*/

let searchIndex=[];

/*==============================
BUILD SEARCH INDEX
==============================*/

async function buildSearchIndex(){

    searchIndex=[];

    for(let i=1;i<=totalPages;i++){

        try{

            const page=
            await getPage(i);

            const text=
            await page.getTextContent();

            let content="";

            text.items.forEach(item=>{

                content+=item.str+" ";

            });

            searchIndex.push({

                page:i,

                text:content.toLowerCase()

            });

        }

        catch(err){

            console.log("Index Skip",i);

        }

    }

    console.log("Search Index Ready");

}

/*==============================
OPEN SEARCH
==============================*/

if(searchBtn){

searchBtn.onclick=function(){

    searchOverlay.classList.add("active");

    searchInput.focus();

};

}

/*==============================
CLOSE SEARCH
==============================*/

if(closeSearch){

closeSearch.onclick=function(){

    searchOverlay.classList.remove("active");

};

}

/*==============================
LIVE SEARCH
==============================*/

function searchBook(){

    const keyword=

    searchInput.value

    .trim()

    .toLowerCase();

    searchResults.innerHTML="";

    if(keyword===""){

        return;

    }

    searchIndex.forEach(item=>{

        if(item.text.includes(keyword)){

            const div=

            document.createElement("div");

            div.className="search-item";

            div.innerHTML=

            "<strong>Page "

            +item.page+

            "</strong>";

            div.onclick=async()=>{

                currentPage=

                item.page%2===0 ?

                item.page-1 :

                item.page;

                if(currentPage<1)

                    currentPage=1;

                searchOverlay.classList.remove("active");

                await renderSpread();

            };

            searchResults.appendChild(div);

        }

    });

}

if(startSearch){

startSearch.onclick=

searchBook;

}

if(searchInput){

searchInput.addEventListener(

"keyup",

searchBook

);

}

/*==============================
BOOKMARK
==============================*/

bookmarkBtn.onclick=function(){

    localStorage.setItem(

        "chishti_bookmark",

        currentPage

    );

    alert(

        "Bookmark Saved"

    );

};

/*==============================
CONTINUE READING
==============================*/

const saved=

parseInt(

localStorage.getItem(

"chishti_bookmark"

)

);

if(saved){

currentPage=saved;

}

/*==============================
START INDEX
==============================*/

setTimeout(()=>{

    buildSearchIndex();

},1500);

console.log("✅ Reader Complete");

