/*=========================================
 CHISHTI READER PRO
 page-engine.js
 Version 1
=========================================*/

const engine={

pageWidth:0,

pageHeight:0,

book:null,

left:null,

right:null

};

/*=========================
Initialize
=========================*/

function initBookEngine(){

engine.book=document.querySelector(".book-container");

engine.left=document.createElement("div");

engine.right=document.createElement("div");

engine.left.className="left-page";

engine.right.className="right-page";

engine.book.appendChild(engine.left);

engine.book.appendChild(engine.right);

resizeBook();

}

/*=========================
Resize
=========================*/

function resizeBook(){

engine.pageWidth=

window.innerWidth*0.34;

engine.pageHeight=

window.innerHeight*0.74;

canvas.style.width=

engine.pageWidth+"px";

canvas.style.height=

engine.pageHeight+"px";

}

/*=========================
Open Animation
=========================*/

function openBook(){

engine.book.animate([

{

transform:"perspective(1800px) rotateY(-40deg)",

opacity:0

},

{

transform:"perspective(1800px) rotateY(8deg)",

opacity:1

},

{

transform:"perspective(1800px) rotateY(0deg)",

opacity:1

}

],{

duration:900,

fill:"forwards"

});

}

/*=========================
Next Animation
=========================*/

function flipNext(){

canvas.animate([

{

transformOrigin:"left",

transform:"rotateY(0deg)"

},

{

transformOrigin:"left",

transform:"rotateY(-20deg)"

},

{

transformOrigin:"left",

transform:"rotateY(0deg)"

}

],{

duration:450,

easing:"ease"

});

}

/*=========================
Previous Animation
=========================*/

function flipPrevious(){

canvas.animate([

{

transformOrigin:"right",

transform:"rotateY(0deg)"

},

{

transformOrigin:"right",

transform:"rotateY(20deg)"

},

{

transformOrigin:"right",

transform:"rotateY(0deg)"

}

],{

duration:450,

easing:"ease"

});

}

/*=========================
Glow
=========================*/

function glowBook(){

engine.book.animate([

{

boxShadow:

"0 20px 35px rgba(0,0,0,.18)"

},

{

boxShadow:

"0 20px 60px rgba(212,175,55,.25)"

},

{

boxShadow:

"0 20px 35px rgba(0,0,0,.18)"

}

],{

duration:2500

});

}

/*=========================
Mouse Move
=========================*/

document.addEventListener("mousemove",(e)=>{

let x=

(e.clientX/window.innerWidth-.5)*6;

let y=

(.5-e.clientY/window.innerHeight)*5;

engine.book.style.transform=

`perspective(1800px)
rotateY(${x}deg)
rotateX(${y}deg)`;

});

/*=========================
Resize
=========================*/

window.addEventListener(

"resize",

resizeBook

);

/*=========================
Start
=========================*/

window.addEventListener(

"load",

()=>{

initBookEngine();

openBook();

glowBook();

});
