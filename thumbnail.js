/*=========================================
 CHISHTI READER PRO
 thumbnails.js
 Version 1
=========================================*/

const thumbnailContainer =
document.getElementById("thumbnailContainer");

/*==============================
Create Thumbnails
==============================*/

async function loadThumbnails(){

if(!pdf) return;

thumbnailContainer.innerHTML="";

for(let i=1;i<=totalPages;i++){

const page =
await pdf.getPage(i);

const viewport =
page.getViewport({scale:0.22});

const thumb =
document.createElement("canvas");

thumb.className="page-thumb";

thumb.width=viewport.width;

thumb.height=viewport.height;

const ctx=
thumb.getContext("2d");

await page.render({

canvasContext:ctx,

viewport:viewport

}).promise;

thumb.onclick=()=>{

pageNum=i;

queueRender(i);

highlightThumbnail(i);

};

thumbnailContainer.appendChild(thumb);

}

highlightThumbnail(1);

}

/*==============================
Highlight
==============================*/

function highlightThumbnail(page){

document

.querySelectorAll(".page-thumb")

.forEach((thumb,index)=>{

thumb.classList.remove("active");

if(index+1===page){

thumb.classList.add("active");

}

});

}

/*==============================
Update
==============================*/

const oldRender=renderPage;

renderPage=async function(num){

await oldRender(num);

highlightThumbnail(num);

}

/*==============================
Load
==============================*/

setTimeout(()=>{

loadThumbnails();

},1200);
