// script.js
let flashcards = [];

// Charger flashcards.csv automatiquement
window.addEventListener("load", async () => {
  try {
    const response = await fetch("flashcards.csv");
    if (!response.ok) throw new Error("Fichier flashcards.csv non trouvé");

    const csv = await response.text();
    parseCSV(csv);
    renderFlashcards();
  } catch (err) {
    console.warn("Aucun fichier flashcards.csv trouvé. Démarrage avec liste vide.");
    flashcards = [];
  }
});

// Parser le CSV
function parseCSV(csv) {
  flashcards = csv
    .split("\n")
    .slice(1) // en-tête
    .map(line => line.trim())
    .filter(line => line)
    .map(line => {
      const match = line.match(/(".*?"|[^,]*),(".*?"|[^,]*),(".*?"|[^,]*),(".*?"|[^,]*),(".*?"|[^,]*),(".*?"|[^,]*)/);
      if (!match) return null;
      return {
        question_content: cleanCSVField(match[1]),
        question_content_image: cleanCSVField(match[2]),
        answer_content: cleanCSVField(match[3]),
        answer_content_image: cleanCSVField(match[4]),
        box_number: parseInt(match[5]),
        last_reviewed: match[6].replace(/^"(.*)"$/, "$1")
      };
    })
    .filter(Boolean);
}

function cleanCSVField(field) {
  return field.startsWith('"') ? field.slice(1, -1).replace(/""/g, '"') : field;
}

// Générer le CSV
function generateCSV() {
  const header = "question_content,question_content_image,answer_content,answer_content_image,box_number,last_reviewed";
  const rows = flashcards.map(card => {
    const qText = `"${card.question_content.replace(/"/g, '""')}"`;
    const qImg = `"${card.question_content_image}"`;
    const aText = `"${card.answer_content.replace(/"/g, '""')}"`;
    const aImg = `"${card.answer_content_image}"`;
    return [qText, qImg, aText, aImg, card.box_number, `"${card.last_reviewed}"`].join(",");
  });
  return [header, ...rows].join("\n");
}

// Exporter le CSV
document.getElementById("export-btn").addEventListener("click", () => {
  const filename = document.getElementById("filename").value.trim() || "flashcards.csv";
  const csv = generateCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Gestion des boutons "Parcourir"
document.getElementById("browse-question-img").addEventListener("click", () => {
  document.getElementById("question_image_input").click();
});

document.getElementById("browse-answer-img").addEventListener("click", () => {
  document.getElementById("answer_image_input").click();
});

// Mémoriser le nom du fichier image
document.getElementById("question_image_input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const folder = e.target.dataset.folder;
    document.getElementById("question-img-name").textContent = `${folder}/${file.name}`;
  }
});

document.getElementById("answer_image_input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const folder = e.target.dataset.folder;
    document.getElementById("answer-img-name").textContent = `${folder}/${file.name}`;
  }
});

// Ajouter une flashcard
document.getElementById("flashcard-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const questionText = document.getElementById("question_content").value.trim();
  const answerText = document.getElementById("answer_content").value.trim();
  const questionImgName = document.getElementById("question-img-name").textContent;
  const answerImgName = document.getElementById("answer-img-name").textContent;

  const questionImg = questionImgName.includes("/") ? questionImgName : "";
  const answerImg = answerImgName.includes("/") ? answerImgName : "";

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  flashcards.push({
    question_content: questionText || "",
    question_content_image: questionImg || "",
    answer_content: answerText || "",
    answer_content_image: answerImg || "",
    box_number: 1,
    last_reviewed: today
  });

  // Réinitialiser le formulaire
  document.getElementById("flashcard-form").reset();
  document.getElementById("question-img-name").textContent = "Aucun fichier sélectionné";
  document.getElementById("answer-img-name").textContent = "Aucun fichier sélectionné";

  renderFlashcards();
});

// Afficher les flashcards
function renderFlashcards() {
  const container = document.getElementById("flashcards-list");
  container.innerHTML = flashcards.length === 0
    ? "<p class='text-gray-500'>Aucune flashcard ajoutée.</p>"
    : flashcards.map((card, i) => `
      <div class="border p-4 rounded card-hover bg-gray-50">
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <h3 class="font-semibold text-indigo-700 mb-2">Question</h3>
            <p class="mb-2">${card.question_content || "<em></em>"}</p>
            ${card.question_content_image ? `<img src="${card.question_content_image}" alt="Question" class="max-h-40 max-w-full object-contain rounded shadow"/>` : ""}
          </div>
          <div>
            <h3 class="font-semibold text-green-700 mb-2">Réponse</h3>
            <p class="mb-2">${card.answer_content || ""}</p>
            ${card.answer_content_image ? `<img src="${card.answer_content_image}" alt="Réponse" class="max-h-40 max-w-full object-contain rounded shadow"/>` : ""}
          </div>
        </div>
        <div class="mt-3 text-sm text-gray-600">
          Boîte: ${card.box_number} | Dernière révision: ${card.last_reviewed}
        </div>
      </div>
    `).join("");
}

// Accordéon instructions
document.getElementById("toggle-instructions").addEventListener("click", () => {
  const instructions = document.getElementById("instructions");
  instructions.classList.toggle("hidden");
});