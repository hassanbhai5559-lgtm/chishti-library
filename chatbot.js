let qaData = [];

// 1. knowledge.json file se data dynamically load karein
fetch('knowledge.json')
    .then(response => response.json())
    .then(data => {
        qaData = data;
        console.log("Database successfully loaded. Total entries:", qaData.length);
    })
    .catch(error => {
        console.error("Error loading knowledge.json database:", error);
    });

// Normalization Function: Punctuation hatane ke liye
function cleanText(text) {
    return text.toLowerCase()
               .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "") // Saare symbols dho kar saaf karein
               .replace(/\s+/g, " ")                        // Faltu spacing dur karein
               .trim();
}

// Smart Matching Logic
function findBestAnswer(userInput) {
    const cleanUser = cleanText(userInput);
    if (!cleanUser) return "Ji? Aapne kuch likha nahi.";

    const userWords = cleanUser.split(" ");
    let bestMatch = null;
    let maxScore = 0;

    qaData.forEach(item => {
        const cleanQuestion = cleanText(item.question);
        
        // Exact Match test
        if (cleanUser === cleanQuestion) {
            maxScore = 100;
            bestMatch = item;
            return;
        }

        // Word overlap checking
        const questionWords = cleanQuestion.split(" ");
        let matchCount = 0;

        userWords.forEach(word => {
            if (questionWords.includes(word)) {
                matchCount++;
            }
        });

        // Match Score system (Fuzzy match ratio)
        const score = matchCount / Math.max(userWords.length, questionWords.length);

        if (score > maxScore) {
            maxScore = score;
            bestMatch = item;
        }
    });

    // Agar match ka score 20% se zyada hai to reply nikalega
    if (maxScore > 0.2) {
        return bestMatch.answer;
    }

    // Default response agar kuch bhi na mile
    return "Maaf kijiye, mujhe iska jawab nahi maloom. Aap deeni kitabein, Saim Chishti (RA) ya library se mutaliq koi aur sawal pooch sakte hain.";
}

// User Ka Message Send Karne Ka Function
function sendMessage() {
    const inputField = document.getElementById("userInput");
    const chatArea = document.getElementById("chat");
    const text = inputField.value.trim();

    if (text === "") return;

    // User Message create karein
    const userDiv = document.createElement("div");
    userDiv.className = "msg user";
    userDiv.innerText = text;
    chatArea.appendChild(userDiv);

    // Box clear aur scroll set karein
    inputField.value = "";
    chatArea.scrollTop = chatArea.scrollHeight;

    // AI Response generate karein thode realistic pause ke sath
    setTimeout(() => {
        const responseText = findBestAnswer(text);
        const botDiv = document.createElement("div");
        botDiv.className = "msg bot";
        botDiv.innerText = responseText;
        chatArea.appendChild(botDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }, 400);
}
