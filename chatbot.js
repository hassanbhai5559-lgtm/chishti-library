const chat = document.getElementById("chat");
let knowledgeData = [];

// Cache bypass karne ke liye URL ke sath unique timestamp generate kiya hai
const jsonFile = 'knowledge.json?v=' + new Date().getTime(); 

// 1. JSON Data fetch karna (Fresh copy har baar)
fetch(jsonFile)
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        knowledgeData = data;
        console.log("Database loaded fresh from knowledge.json!", knowledgeData);
    })
    .catch(error => {
        console.error("Error loading database: ", error);
        addMsg("⚠️ Chishti AI System Alert: `knowledge.json` load nahi ho saki.", "bot");
    });

function addMsg(text, type) {
    const div = document.createElement("div");
    div.className = "msg " + type;
    div.innerHTML = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function typing(cb) {
    const t = document.createElement("div");
    t.className = "msg bot";
    t.innerHTML = `
    <div class="typing">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    </div>`;
    chat.appendChild(t);
    chat.scrollTop = chat.scrollHeight;

    setTimeout(() => {
        t.remove();
        cb();
    }, 800);
}

/* ===== SMART FUZZY AI BRAIN ===== */
function ai(msg) {
    // 1. Clean the input (punctuation khatam karein aur lowercase karein)
    const cleanMsg = msg.replace(/['"!?.,;:-]+/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

    if (knowledgeData && knowledgeData.length > 0) {
        
        // Match 1: Exact Match check (Punctuation ke baghair)
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
            if (cleanMsg === cleanQuestion) {
                return item.answer;
            }
        }

        // Match 2: Partial Match check (E.g. "who is saim chishti" -> checks if contains "saim chishti")
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
            if (cleanMsg.includes(cleanQuestion) || cleanQuestion.includes(cleanMsg)) {
                return item.answer;
            }
        }

        // Match 3: Keyword Match check (Agar user ke words question mein match hote hain)
        for (let item of knowledgeData) {
            const cleanQuestion = item.question.replace(/['"!?.,;:-]+/g, '').toLowerCase().trim();
            const userWords = cleanMsg.split(' ');
            
            let matches = 0;
            userWords.forEach(word => {
                // Saim, Chishti, Latif, Sajid, Born jaise words check karne ke liye (>3 characters)
                if (word.length > 3 && cleanQuestion.includes(word)) {
                    matches++;
                }
            });

            // Agar kam az kam 2 keyword match ho jayein (jaise "saim" aur "chishti")
            if (matches >= 2) {
                return item.answer;
            }
        }
    }

    // Fallback normal greetings ke liye:
    if (cleanMsg.includes("hi") || cleanMsg.includes("hello") || cleanMsg.includes("hey") || cleanMsg.includes("salam")) {
        return "Wa Alaikum Assalam! Welcome to Chishti Library. How may I assist you today?";
    }
    
    return "Mera jawab database mein nahi mila. Aap Saim Chishti ke bare mein, ya unki books ke mutalik sawal pooch sakte hain.";
}

function send() {
    const input = document.getElementById("input");
    const text = input.value.trim();
    if (!text) return;

    addMsg(text, "user");
    input.value = "";

    typing(() => {
        addMsg(ai(text), "bot");
    });
}
