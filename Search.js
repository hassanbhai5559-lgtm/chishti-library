/*=========================================
 CHISHTI READER PRO
 search.js
 Version 1
=========================================*/

let searchIndex = [];

/*==============================
Build Search Index
==============================*/

async function buildSearchIndex(){

searchIndex=[];

for(let i=1;i<=totalPages;i++){

const page=await pdf.getPage(i);

const text=await page.getTextContent();

let content=text.items.map(item=>item.str).join(" ");

searchIndex.push({

page:i,

text:content.toLowerCase()

});

}

console.log("Search Ready");

}

/*==============================
Search
==============================*/

async function searchBook(keyword){

keyword=keyword.trim().toLowerCase();

if(keyword==="") return;

for(let item of searchIndex){

if(item.text.includes(keyword)){

pageNum=item.page;

queueRender(pageNum);

highlightThumbnail(pageNum);

alert("Found on Page "+pageNum);

return;

}

}

alert("No Result Found");

}

/*==============================
Search Box
==============================*/

const input=document.createElement("input");

input.placeholder="Search Book...";

input.id="searchInput";

input.style.cssText=`
position:fixed;
top:85px;
right:20px;
width:250px;
padding:10px;
border-radius:10px;
border:2px solid #0b6b3a;
font-family:Poppins;
z-index:999;
`;

document.body.appendChild(input);

input.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

searchBook(input.value);

}

});

/*==============================
Load
==============================*/

setTimeout(()=>{

buildSearchIndex();

},2000);
