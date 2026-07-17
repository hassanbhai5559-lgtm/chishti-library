/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 1
 Core Engine
=========================================================*/

const FlipEngine = {

    enabled: true,

    flipping: false,

    currentPage: 1,

    totalPages: 0,

    direction: "next",

    speed: 650,

    shadow: true,

    perspective: 2200,

    pageWidth: 0,

    pageHeight: 0

};

/*=========================================================
ELEMENTS
=========================================================*/

const bookStage =
document.querySelector(".book-stage");

const viewer =
document.getElementById("bookViewer");

const canvas =
document.getElementById("pdfCanvas");

/*=========================================================
CREATE PAGE
=========================================================*/

function createFlipPage(){

    const page =
    document.createElement("div");

    page.className =
    "flip-page";

    const front =
    document.createElement("div");

    front.className =
    "page-front";

    const back =
    document.createElement("div");

    back.className =
    "page-back";

    page.appendChild(front);

    page.appendChild(back);

    viewer.appendChild(page);

    return page;

}

/*=========================================================
SHADOW
=========================================================*/

function createShadow(){

    const shadow =
    document.createElement("div");

    shadow.className =
    "page-shadow";

    viewer.appendChild(shadow);

    return shadow;

}

const pageShadow =
createShadow();

/*=========================================================
OPEN BOOK
=========================================================*/

function openBook(){

    bookStage.classList.add(
    "book-opening"
    );

    viewer.classList.add(
    "reader-active"
    );

}

/*=========================================================
CLOSE BOOK
=========================================================*/

function closeBook(){

    bookStage.classList.remove(
    "book-opening"
    );

    bookStage.classList.add(
    "book-closing"
    );

}

/*=========================================================
BOOK SIZE
=========================================================*/

function updateBookSize(){

    FlipEngine.pageWidth =
    canvas.offsetWidth;

    FlipEngine.pageHeight =
    canvas.offsetHeight;

}

window.addEventListener(
"resize",
updateBookSize
);

/*=========================================================
INITIALIZE
=========================================================*/

function initFlipEngine(){

    updateBookSize();

    FlipEngine.totalPages =
    Reader.pages;

    console.log(
    "Flip Engine Initialized"
    );

}

window.addEventListener(
"load",
initFlipEngine
);

/*=========================================================
STATUS
=========================================================*/

function isFlipping(){

    return FlipEngine.flipping;

}

console.log(
"Flip Engine Part 1 Loaded"
);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 2
 3D Flip Core
=========================================================*/

/*=========================================================
CREATE FLIP LAYER
=========================================================*/

let flipLayer = null;

function createFlipLayer(){

    if(flipLayer){

        flipLayer.remove();

    }

    flipLayer = document.createElement("div");

    flipLayer.className = "flip-layer";

    viewer.appendChild(flipLayer);

}

/*=========================================================
START FLIP
=========================================================*/

function startFlip(direction){

    if(FlipEngine.flipping) return;

    FlipEngine.flipping = true;

    FlipEngine.direction = direction;

    createFlipLayer();

    flipLayer.style.transformOrigin =
    direction==="next"
    ? "left center"
    : "right center";

    pageShadow.style.opacity=".35";

    requestAnimationFrame(runFlip);

}

/*=========================================================
RUN
=========================================================*/

function runFlip(){

    flipLayer.animate(

    [

    {

    transform:"perspective(2200px) rotateY(0deg)"

    },

    {

    transform:

    FlipEngine.direction==="next"

    ?

    "perspective(2200px) rotateY(-180deg)"

    :

    "perspective(2200px) rotateY(180deg)"

    }

    ],

    {

    duration:FlipEngine.speed,

    easing:"cubic-bezier(.22,.61,.36,1)",

    fill:"forwards"

    }

    ).onfinish=()=>{

        finishFlip();

    };

}

/*=========================================================
FINISH
=========================================================*/

function finishFlip(){

    FlipEngine.flipping=false;

    pageShadow.style.opacity="0";

    if(flipLayer){

        flipLayer.remove();

        flipLayer=null;

    }

}

/*=========================================================
BUTTONS
=========================================================*/

const nextBtn=
document.getElementById("nextPage");

const prevBtn=
document.getElementById("prevPage");

nextBtn.addEventListener(

"click",

()=>{

startFlip("next");

});

prevBtn.addEventListener(

"click",

()=>{

startFlip("previous");

});

/*=========================================================
AUTO
=========================================================*/

function flipNext(){

startFlip("next");

}

function flipPrevious(){

startFlip("previous");

}

console.log(

"Flip Engine Part 2 Loaded"

);

/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 3
 Paper Layer & Curl Engine
=========================================================*/

/*=========================================================
PAPER LAYERS
=========================================================*/

let paperFront = null;
let paperBack = null;

function buildPaper(){

    if(paperFront) paperFront.remove();
    if(paperBack) paperBack.remove();

    paperFront = document.createElement("div");
    paperBack  = document.createElement("div");

    paperFront.className = "paper-front";
    paperBack.className  = "paper-back";

    flipLayer.appendChild(paperFront);
    flipLayer.appendChild(paperBack);

}

/*=========================================================
COPY CURRENT PAGE
=========================================================*/

function cloneCurrentCanvas(){

    const img = canvas.toDataURL("image/png");

    paperFront.style.backgroundImage =
    `url(${img})`;

    paperFront.style.backgroundSize="cover";

}

/*=========================================================
NEXT PAGE PREVIEW
=========================================================*/

async function loadNextPreview(){

    let target =

    FlipEngine.direction==="next"

    ?

    Reader.page+1

    :

    Reader.page-1;

    if(target<1) target=1;

    if(target>Reader.pages)

    target=Reader.pages;

    const pdfPage =
    await Reader.pdf.getPage(target);

    const temp =
    document.createElement("canvas");

    const tctx =
    temp.getContext("2d");

    const viewport =
    pdfPage.getViewport({

        scale:Reader.zoom

    });

    temp.width=viewport.width;
    temp.height=viewport.height;

    await pdfPage.render({

        canvasContext:tctx,

        viewport

    }).promise;

    paperBack.style.backgroundImage =
    `url(${temp.toDataURL()})`;

    paperBack.style.backgroundSize="cover";

}

/*=========================================================
PREPARE FLIP
=========================================================*/

async function prepareFlip(){

    buildPaper();

    cloneCurrentCanvas();

    await loadNextPreview();

}

/*=========================================================
OVERRIDE START
=========================================================*/

const originalStartFlip =
startFlip;

startFlip = async function(direction){

    if(FlipEngine.flipping)

    return;

    originalStartFlip(direction);

    await prepareFlip();

}

/*=========================================================
SHADOW MOTION
=========================================================*/

function animateShadow(){

    pageShadow.animate(

    [

    {

    opacity:.05,

    transform:"scaleX(.7)"

    },

    {

    opacity:.45,

    transform:"scaleX(1.1)"

    },

    {

    opacity:0,

    transform:"scaleX(.8)"

    }

    ],

    {

    duration:FlipEngine.speed,

    easing:"ease"

    }

    );

}

/*=========================================================
OVERRIDE RUN
=========================================================*/

const oldRunFlip =
runFlip;

runFlip=function(){

    animateShadow();

    oldRunFlip();

}

console.log(
"Flip Engine Part 3 Loaded"
);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 4
 Curl Physics Foundation
=========================================================*/

/*=========================================================
CURSOR
=========================================================*/

let pointer={

x:0,

y:0,

active:false

};

/*=========================================================
ANGLE
=========================================================*/

function calculateAngle(x){

const width=

FlipEngine.pageWidth;

let angle=

(x/width)*180;

if(angle>180)

angle=180;

if(angle<0)

angle=0;

return angle;

}

/*=========================================================
UPDATE CURL
=========================================================*/

function updateCurl(){

if(!FlipEngine.flipping)

return;

const angle=

calculateAngle(pointer.x);

flipLayer.style.transform=

FlipEngine.direction==="next"

?

`perspective(${FlipEngine.perspective}px)
 rotateY(${-angle}deg)`

:

`perspective(${FlipEngine.perspective}px)
 rotateY(${angle}deg)`;

const shadow=

Math.min(

0.45,

angle/400

);

pageShadow.style.opacity=

shadow;

}

/*=========================================================
MOUSE
=========================================================*/

viewer.addEventListener(

"mousemove",

e=>{

if(!pointer.active)

return;

const rect=

viewer.getBoundingClientRect();

pointer.x=

e.clientX-rect.left;

pointer.y=

e.clientY-rect.top;

updateCurl();

});

/*=========================================================
DOWN
=========================================================*/

viewer.addEventListener(

"mousedown",

e=>{

if(!FlipEngine.flipping)

return;

pointer.active=true;

const rect=

viewer.getBoundingClientRect();

pointer.x=

e.clientX-rect.left;

pointer.y=

e.clientY-rect.top;

});

/*=========================================================
UP
=========================================================*/

window.addEventListener(

"mouseup",

()=>{

pointer.active=false;

});

/*=========================================================
TOUCH
=========================================================*/

viewer.addEventListener(

"touchmove",

e=>{

if(!pointer.active)

return;

const rect=

viewer.getBoundingClientRect();

pointer.x=

e.touches[0].clientX-rect.left;

pointer.y=

e.touches[0].clientY-rect.top;

updateCurl();

});

viewer.addEventListener(

"touchstart",

()=>{

pointer.active=true;

});

viewer.addEventListener(

"touchend",

()=>{

pointer.active=false;

});

/*=========================================================
SPINE
=========================================================*/

function animateSpine(angle){

const value=

angle/18;

bookStage.style.transform=

`rotateY(${value}deg)`;

}

/*=========================================================
OVERRIDE
=========================================================*/

const oldUpdate=

updateCurl;

updateCurl=function(){

oldUpdate();

const angle=

calculateAngle(pointer.x);

animateSpine(angle);

};

console.log(

"Flip Engine Part 4 Loaded"

);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 5
 Mesh + Inertia Engine
=========================================================*/

/*=========================================================
INERTIA
=========================================================*/

let velocity = 0;
let targetAngle = 0;
let currentAngle = 0;

/*=========================================================
ANIMATION LOOP
=========================================================*/

function physicsLoop(){

    if(!FlipEngine.flipping){

        requestAnimationFrame(physicsLoop);

        return;

    }

    currentAngle +=
    (targetAngle-currentAngle)*0.18;

    velocity *= .92;

    currentAngle += velocity;

    flipLayer.style.transform =

    FlipEngine.direction==="next"

    ?

    `perspective(${FlipEngine.perspective}px)
    rotateY(${-currentAngle}deg)`

    :

    `perspective(${FlipEngine.perspective}px)
    rotateY(${currentAngle}deg)`;

    requestAnimationFrame(physicsLoop);

}

physicsLoop();

/*=========================================================
UPDATE TARGET
=========================================================*/

const oldCurl = updateCurl;

updateCurl=function(){

    oldCurl();

    targetAngle=
    calculateAngle(pointer.x);

};

/*=========================================================
CORNER FOLD
=========================================================*/

function updateCorner(){

    if(!paperFront) return;

    const fold=

    Math.max(

    8,

    targetAngle/3

    );

    paperFront.style.clipPath=

    `polygon(
    0 0,
    100% 0,
    100% ${100-fold}%,
    ${100-fold}% 100%,
    0 100%
    )`;

}

/*=========================================================
LIGHT
=========================================================*/

function updateLight(){

    const glow=

    targetAngle/180;

    paperFront.style.filter=

    `brightness(${1+glow*.12})
     contrast(${1+glow*.05})`;

}

/*=========================================================
OVERRIDE
=========================================================*/

const oldUpdateCurl=
updateCurl;

updateCurl=function(){

    oldUpdateCurl();

    updateCorner();

    updateLight();

};

/*=========================================================
RELEASE
=========================================================*/

window.addEventListener(

"mouseup",

()=>{

    if(!FlipEngine.flipping)

    return;

    if(targetAngle>90){

        velocity=12;

    }else{

        velocity=-12;

    }

});

/*=========================================================
TOUCH RELEASE
=========================================================*/

window.addEventListener(

"touchend",

()=>{

    if(!FlipEngine.flipping)

    return;

    if(targetAngle>90){

        velocity=12;

    }else{

        velocity=-12;

    }

});

/*=========================================================
COMPLETE
=========================================================*/

console.log(
"Flip Engine Part 5 Loaded"
);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 6
 Two Page Engine
=========================================================*/

/*=========================================================
LAYOUT
=========================================================*/

FlipEngine.mode="single";

/*=========================================================
CHANGE MODE
=========================================================*/

function setReaderMode(mode){

    FlipEngine.mode=mode;

    if(mode==="double"){

        viewer.classList.add("double-page");

    }else{

        viewer.classList.remove("double-page");

    }

    queue(Reader.page);

}

/*=========================================================
AUTO
=========================================================*/

function autoMode(){

    if(window.innerWidth>1100){

        setReaderMode("double");

    }else{

        setReaderMode("single");

    }

}

window.addEventListener(

"resize",

autoMode

);

window.addEventListener(

"load",

autoMode

);

/*=========================================================
BOOK DEPTH
=========================================================*/

function updateDepth(){

    const depth=

    Reader.pages-Reader.page;

    viewer.style.setProperty(

    "--book-depth",

    depth

    );

}

/*=========================================================
PAGE THICKNESS
=========================================================*/

function updateThickness(){

    const value=

    Math.max(

    4,

    (Reader.pages-Reader.page)/8

    );

    viewer.style.setProperty(

    "--page-stack",

    value+"px"

    );

}

/*=========================================================
LEFT RIGHT
=========================================================*/

function getLeftPage(){

    return Reader.page%2===0

    ?

    Reader.page

    :

    Reader.page-1;

}

function getRightPage(){

    return getLeftPage()+1;

}

/*=========================================================
SYNC
=========================================================*/

function updateBookLayout(){

    updateDepth();

    updateThickness();

}

/*=========================================================
OVERRIDE
=========================================================*/

const oldQueuePage=queue;

queue=function(page){

    oldQueuePage(page);

    updateBookLayout();

};

/*=========================================================
PAGE STACK
=========================================================*/

function buildStack(){

    viewer.style.setProperty(

    "--stack-left",

    Reader.page

    );

    viewer.style.setProperty(

    "--stack-right",

    Reader.pages-Reader.page

    );

}

buildStack();

/*=========================================================
SHADOW DEPTH
=========================================================*/

function depthShadow(){

    const shadow=

    Reader.page/

    Reader.pages;

    pageShadow.style.filter=

    `blur(${20+shadow*25}px)`;

}

setInterval(

depthShadow,

250

);

/*=========================================================
READY
=========================================================*/

console.log(

"Flip Engine Part 6 Loaded"

);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 7
 Corner Drag Engine
=========================================================*/

/*=========================================================
DRAG STATE
=========================================================*/

const Drag={

enabled:false,

startX:0,

startY:0,

currentX:0,

currentY:0,

progress:0

};

/*=========================================================
START DRAG
=========================================================*/

function startDrag(e){

if(FlipEngine.flipping) return;

const rect=viewer.getBoundingClientRect();

const x=e.clientX-rect.left;

const y=e.clientY-rect.top;

/* only corner */

if(x<FlipEngine.pageWidth-120) return;

Drag.enabled=true;

Drag.startX=x;

Drag.startY=y;

startFlip("next");

}

/*=========================================================
MOVE
=========================================================*/

function moveDrag(e){

if(!Drag.enabled) return;

const rect=viewer.getBoundingClientRect();

Drag.currentX=e.clientX-rect.left;

Drag.currentY=e.clientY-rect.top;

let distance=

Drag.startX-Drag.currentX;

if(distance<0)

distance=0;

if(distance>

FlipEngine.pageWidth)

distance=

FlipEngine.pageWidth;

Drag.progress=

distance/

FlipEngine.pageWidth;

targetAngle=

Drag.progress*180;

updateCurl();

}

/*=========================================================
END
=========================================================*/

function endDrag(){

if(!Drag.enabled)

return;

Drag.enabled=false;

/* threshold */

if(targetAngle>90){

velocity=18;

}else{

velocity=-18;

}

}

/*=========================================================
EVENTS
=========================================================*/

viewer.addEventListener(

"mousedown",

startDrag

);

window.addEventListener(

"mousemove",

moveDrag

);

window.addEventListener(

"mouseup",

endDrag

);

/*=========================================================
TOUCH
=========================================================*/

viewer.addEventListener(

"touchstart",

e=>{

startDrag({

clientX:e.touches[0].clientX,

clientY:e.touches[0].clientY

});

});

window.addEventListener(

"touchmove",

e=>{

moveDrag({

clientX:e.touches[0].clientX,

clientY:e.touches[0].clientY

});

});

window.addEventListener(

"touchend",

endDrag

);

/*=========================================================
CURSOR
=========================================================*/

viewer.addEventListener(

"mousemove",

e=>{

const rect=

viewer.getBoundingClientRect();

const x=e.clientX-rect.left;

if(

x>

FlipEngine.pageWidth-100

){

viewer.style.cursor="grab";

}else{

viewer.style.cursor="default";

}

});

console.log(

"Flip Engine Part 7 Loaded"

);
/*=========================================================
 CHISHTI READER PRO
 flip-engine.js
 Part 8
 Mesh Engine
=========================================================*/

/*=========================================================
MESH
=========================================================*/

const Mesh={

segments:18,

depth:28,

light:.35,

shadow:.25

};

/*=========================================================
CREATE STRIPS
=========================================================*/

function createMesh(){

if(!flipLayer) return;

flipLayer.innerHTML="";

for(let i=0;i<Mesh.segments;i++){

const strip=document.createElement("div");

strip.className="page-strip";

strip.style.left=

(i*(100/Mesh.segments))+"%";

strip.style.width=

(100/Mesh.segments)+"%";

flipLayer.appendChild(strip);

}

}

createMesh();

/*=========================================================
UPDATE
=========================================================*/

function updateMesh(){

const strips=

flipLayer.querySelectorAll(".page-strip");

strips.forEach((strip,index)=>{

const p=

index/(Mesh.segments-1);

const bend=

Math.sin(p*Math.PI);

const angle=

targetAngle*bend;

const depth=

Mesh.depth*bend;

strip.style.transform=

`perspective(2200px)
 rotateY(${-angle}deg)
 translateZ(${depth}px)`;

});

}

/*=========================================================
LIGHT
=========================================================*/

function updateLightMesh(){

const strips=

flipLayer.querySelectorAll(".page-strip");

strips.forEach((strip,index)=>{

const p=

index/(Mesh.segments-1);

const glow=

Math.sin(

p*Math.PI

);

const value=

1+

(glow*.12);

strip.style.filter=

`brightness(${value})
 contrast(1.02)`;

});

}

/*=========================================================
SHADOW
=========================================================*/

function updateShadowMesh(){

const strips=

flipLayer.querySelectorAll(".page-strip");

strips.forEach((strip,index)=>{

const alpha=

index/

Mesh.segments;

strip.style.boxShadow=

`0 0 20px
 rgba(0,0,0,
 ${alpha*.18})`;

});

}

/*=========================================================
SPINE
=========================================================*/

function updateSpine(){

const value=

targetAngle/15;

viewer.style.transform=

`translateX(${-value}px)`;

}

/*=========================================================
OVERRIDE
=========================================================*/

const oldPhysics=

physicsLoop;

physicsLoop=function(){

oldPhysics();

updateMesh();

updateLightMesh();

updateShadowMesh();

updateSpine();

}

/*=========================================================
READY
=========================================================*/

console.log(

"Flip Engine Part 8 Loaded"

);
