/* =========================================
   CHISHTI AI — KNOWLEDGE.JSON
========================================= */

let chishtiKnowledge = [];

/* Load knowledge.json */
async function loadChishtiKnowledge() {

    try {

        const response =
            await fetch("./knowledge.json");

        if (!response.ok) {
            throw new Error(
                "knowledge.json load nahi hui"
            );
        }

        chishtiKnowledge =
            await response.json();

        console.log(
            "✅ Chishti AI Knowledge Loaded:",
            chishtiKnowledge.length
        );

    } catch (error) {

        console.error(
            "❌ Knowledge error:",
            error
        );

    }
}

loadChishtiKnowledge();
