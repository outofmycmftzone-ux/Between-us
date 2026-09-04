const homeScreen = document.getElementById("homeScreen");
const categoryScreen = document.getElementById("categoryScreen");
const gameScreen = document.getElementById("gameScreen");
const learnedScreen = document.getElementById("learnedScreen");

const playButton = document.getElementById("playButton");
const learnedButton = document.getElementById("learnedButton");
const categoryBackButton = document.getElementById("categoryBackButton");
const gameBackButton = document.getElementById("gameBackButton");
const learnedBackButton = document.getElementById("learnedBackButton");

const categoryGrid = document.getElementById("categoryGrid");
const questionCounter = document.getElementById("questionCounter");
const categoryLabel = document.getElementById("categoryLabel");
const difficultyLabel = document.getElementById("difficultyLabel");
const questionText = document.getElementById("questionText");

const answerInput = document.getElementById("answerInput");
const partnerAnswerInput = document.getElementById("partnerAnswerInput");
const revealButton = document.getElementById("revealButton");
const submitAnswerButton = document.getElementById("submitAnswerButton");
const revealArea = document.getElementById("revealArea");
const learnedList = document.getElementById("learnedList");

let questions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let selectedCategory = null;

const categoryInfo = {
  "How Well Do You Know Me?": {
    icon: "🧠",
    description: "The things you think you know."
  },
  "You've Been Watching Me": {
    icon: "👀",
    description: "The little things you've noticed."
  },
  "Deep Cuts & Memories": {
    icon: "🕰️",
    description: "The memories buried in 16 years."
  },
  "What Would I Do?": {
    icon: "🎭",
    description: "Predict what your partner would choose."
  },
  "You Know Me Better Than I Know Myself": {
    icon: "🫣",
    description: "Things they might know about you better than you do."
  },
  "The Little Things": {
    icon: "❤️",
    description: "Small things that say a lot."
  },
  "Before Us": {
    icon: "💔",
    description: "The experiences that shaped who you are."
  },
  "Intimacy": {
    icon: "🔥",
    description: "Attraction, chemistry and connection."
  },
  "Spicy": {
    icon: "😈",
    description: "The questions that turn up the heat."
  },
  "Our Future": {
    icon: "🌱",
    description: "Where you think you're headed together."
  },
  "Us Being Us": {
    icon: "😂",
    description: "The weirdness that makes you two."
  },
  "Conversation": {
    icon: "💬",
    description: "Questions worth actually talking about."
  }
};

const difficultyNames = {
  1: "Familiar",
  2: "Observant",
  3: "Deep Cut",
  4: "Mind Reader",
  5: "You Really Know Me"
};

function showScreen(screen) {
  [homeScreen, categoryScreen, gameScreen, learnedScreen].forEach(item => {
    item.classList.remove("active");
  });

  screen.classList.add("active");
  window.scrollTo(0, 0);
}

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");

    if (!response.ok) {
      throw new Error("Unable to load questions.");
    }

    questions = await response.json();
    buildCategories();
  } catch (error) {
    categoryGrid.innerHTML = `
      <div class="learned-empty">
        Unable to load the question deck.
      </div>
    `;
  }
}

function buildCategories() {
  categoryGrid.innerHTML = "";

  const categories = [...new Set(questions.map(question => question.category))];

  categories.forEach(category => {
    const info = categoryInfo[category] || {
      icon: "💭",
      description: "Questions designed to spark conversation."
    };

    const count = questions.filter(question => question.category === category).length;

    const button = document.createElement("button");
    button.className = "category-button";

    button.innerHTML = `
      <span class="category-icon">${info.icon}</span>
      <span class="category-name">${category}</span>
      <span class="category-count">${count} questions</span>
    `;

    button.addEventListener("click", () => {
      startCategory(category);
    });

    categoryGrid.appendChild(button);
  });
}

function startCategory(category) {
  selectedCategory = category;

  currentQuestions = questions
    .filter(question => question.category === category)
    .sort(() => Math.random() - 0.5);

  currentQuestionIndex = 0;

  showScreen(gameScreen);
  showQuestion();
}

function showQuestion() {
  currentQuestion = currentQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    showScreen(categoryScreen);
    return;
  }

  categoryLabel.textContent = currentQuestion.category;
  difficultyLabel.textContent = `Level ${currentQuestion.difficulty} • ${difficultyNames[currentQuestion.difficulty] || ""}`;
  questionText.textContent = currentQuestion.question;
  questionCounter.textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

  answerInput.value = "";
  partnerAnswerInput.value = "";

  revealArea.classList.add("hidden");
  answerInput.disabled = false;
  revealButton.disabled = false;
}

function revealAnswerArea() {
  if (!answerInput.value.trim()) {
    answerInput.focus();
    return;
  }

  answerInput.disabled = true;
  revealButton.disabled = true;
  revealArea.classList.remove("hidden");

  partnerAnswerInput.focus();
}

function saveLearnedAnswer() {
  const guess = answerInput.value.trim();
  const actualAnswer = partnerAnswerInput.value.trim();

  if (!actualAnswer) {
    partnerAnswerInput.focus();
    return;
  }

  const learned = JSON.parse(localStorage.getItem("betweenUsLearned") || "[]");

  learned.unshift({
    question: currentQuestion.question,
    guess,
    answer: actualAnswer,
    category: currentQuestion.category,
    date: new Date().toISOString()
  });

  localStorage.setItem("betweenUsLearned", JSON.stringify(learned));

  currentQuestionIndex++;

  if (currentQuestionIndex >= currentQuestions.length) {
    showScreen(categoryScreen);
    return;
  }

  showQuestion();
}

function renderLearned() {
  const learned = JSON.parse(localStorage.getItem("betweenUsLearned") || "[]");

  learnedList.innerHTML = "";

  if (!learned.length) {
    learnedList.innerHTML = `
      <div class="learned-empty">
        You haven't discovered anything yet.<br>
        Start playing and the things you learn about each other will appear here.
      </div>
    `;
    return;
  }

  learned.forEach(item => {
    const element = document.createElement("article");
    element.className = "learned-item";

    element.innerHTML = `
      <div class="learned-question">${escapeHtml(item.question)}</div>
      <div class="learned-answer">
        <strong>Their answer:</strong><br>
        ${escapeHtml(item.answer)}
      </div>
    `;

    learnedList.appendChild(element);
  });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

playButton.addEventListener("click", () => {
  showScreen(categoryScreen);
});

learnedButton.addEventListener("click", () => {
  renderLearned();
  showScreen(learnedScreen);
});

categoryBackButton.addEventListener("click", () => {
  showScreen(homeScreen);
});

gameBackButton.addEventListener("click", () => {
  showScreen(categoryScreen);
});

learnedBackButton.addEventListener("click", () => {
  showScreen(homeScreen);
});

revealButton.addEventListener("click", revealAnswerArea);

submitAnswerButton.addEventListener("click", saveLearnedAnswer);

loadQuestions();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
