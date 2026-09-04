const homeScreen = document.getElementById("homeScreen");
const setupScreen = document.getElementById("setupScreen");
const categoryScreen = document.getElementById("categoryScreen");
const gameScreen = document.getElementById("gameScreen");
const resultsScreen = document.getElementById("resultsScreen");
const learnedScreen = document.getElementById("learnedScreen");

const playButton = document.getElementById("playButton");
const learnedButton = document.getElementById("learnedButton");
const setupBackButton = document.getElementById("setupBackButton");
const categoryBackButton = document.getElementById("categoryBackButton");
const gameBackButton = document.getElementById("gameBackButton");
const learnedBackButton = document.getElementById("learnedBackButton");

const playerOneInput = document.getElementById("playerOneInput");
const playerTwoInput = document.getElementById("playerTwoInput");
const startGameButton = document.getElementById("startGameButton");

const categoryGrid = document.getElementById("categoryGrid");
const questionCounter = document.getElementById("questionCounter");
const scoreDisplay = document.getElementById("scoreDisplay");
const turnLabel = document.getElementById("turnLabel");
const categoryLabel = document.getElementById("categoryLabel");
const difficultyLabel = document.getElementById("difficultyLabel");
const questionText = document.getElementById("questionText");

const answerStage = document.getElementById("answerStage");
const answerInstruction = document.getElementById("answerInstruction");
const answerInput = document.getElementById("answerInput");
const lockAnswerButton = document.getElementById("lockAnswerButton");

const guessStage = document.getElementById("guessStage");
const guessPlayerLabel = document.getElementById("guessPlayerLabel");
const guessInstruction = document.getElementById("guessInstruction");
const guessInput = document.getElementById("guessInput");
const revealButton = document.getElementById("revealButton");

const revealStage = document.getElementById("revealStage");
const answerPlayerName = document.getElementById("answerPlayerName");
const originalAnswer = document.getElementById("originalAnswer");
const guessPlayerName = document.getElementById("guessPlayerName");
const partnerGuess = document.getElementById("partnerGuess");
const accuracyButtons = document.querySelectorAll(".accuracy-button");
const discussionArea = document.getElementById("discussionArea");
const nextQuestionButton = document.getElementById("nextQuestionButton");

const resultsTitle = document.getElementById("resultsTitle");
const resultsPercentage = document.getElementById("resultsPercentage");
const resultsMessage = document.getElementById("resultsMessage");
const resultsPlayerOneName = document.getElementById("resultsPlayerOneName");
const resultsPlayerTwoName = document.getElementById("resultsPlayerTwoName");
const resultsPlayerOneScore = document.getElementById("resultsPlayerOneScore");
const resultsPlayerTwoScore = document.getElementById("resultsPlayerTwoScore");
const resultsContinueButton = document.getElementById("resultsContinueButton");
const resultsHomeButton = document.getElementById("resultsHomeButton");

const learnedList = document.getElementById("learnedList");

let questions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let currentQuestion = null;
let selectedCategory = null;

let players = {
  one: "",
  two: ""
};

let answeringPlayer = 0;
let guessingPlayer = 1;

let scores = {
  one: 0,
  two: 0
};

let answeredCounts = {
  one: 0,
  two: 0
};

let totalPoints = 0;
let possiblePoints = 0;
let resultSavedForQuestion = false;

const categoryInfo = {
  "How Well Do You Know Me?": { icon: "🧠" },
  "You've Been Watching Me": { icon: "👀" },
  "Deep Cuts & Memories": { icon: "🕰️" },
  "What Would I Do?": { icon: "🎭" },
  "You Know Me Better Than I Know Myself": { icon: "🫣" },
  "The Little Things": { icon: "❤️" },
  "Before Us": { icon: "💔" },
  "Intimacy": { icon: "🔥" },
  "Spicy": { icon: "😈" },
  "Our Future": { icon: "🌱" },
  "Us Being Us": { icon: "😂" },
  "Conversation": { icon: "💬" }
};

const difficultyNames = {
  1: "Familiar",
  2: "Observant",
  3: "Deep Cut",
  4: "Mind Reader",
  5: "You Really Know Me"
};

function showScreen(screen) {
  [homeScreen, setupScreen, categoryScreen, gameScreen, resultsScreen, learnedScreen].forEach(item => {
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
      icon: "💭"
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

  answeringPlayer = 0;
  guessingPlayer = 1;

  scores.one = 0;
  scores.two = 0;
  answeredCounts.one = 0;
  answeredCounts.two = 0;
  totalPoints = 0;
  possiblePoints = currentQuestions.length * 3;

  showScreen(gameScreen);
  showQuestion();
}

function getPlayerName(playerIndex) {
  return playerIndex === 0 ? players.one : players.two;
}

function getPlayerKey(playerIndex) {
  return playerIndex === 0 ? "one" : "two";
}

function updateScoreDisplay() {
  const percentage = possiblePoints
    ? Math.round((totalPoints / possiblePoints) * 100)
    : 0;

  scoreDisplay.textContent = `${percentage}%`;
}

function resetQuestionState() {
  resultSavedForQuestion = false;

  accuracyButtons.forEach(button => {
    button.disabled = false;
  });

  discussionArea.classList.add("hidden");

  answerInput.disabled = false;
  lockAnswerButton.disabled = false;

  guessInput.disabled = false;
  revealButton.disabled = false;
}

function showQuestion() {
  currentQuestion = currentQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    showResults();
    return;
  }

  const answerer = getPlayerName(answeringPlayer);
  const guesser = getPlayerName(guessingPlayer);

  resetQuestionState();

  turnLabel.textContent = `${answerer}'S TURN`;
  categoryLabel.textContent = currentQuestion.category;
  difficultyLabel.textContent = `Level ${currentQuestion.difficulty} • ${difficultyNames[currentQuestion.difficulty] || ""}`;
  questionText.textContent = currentQuestion.question;
  questionCounter.textContent = `${currentQuestionIndex + 1} / ${currentQuestions.length}`;

  answerInstruction.textContent = `${answerer}, answer honestly. Your partner shouldn't see your answer.`;

  answerInput.value = "";
  guessInput.value = "";

  guessPlayerLabel.textContent = `${guesser}, it's your turn`;
  guessInstruction.textContent = `Try to guess exactly what ${answerer} answered.`;

  answerStage.classList.remove("hidden");
  guessStage.classList.add("hidden");
  revealStage.classList.add("hidden");

  updateScoreDisplay();

  answerInput.focus();
}

function lockAnswer() {
  if (!answerInput.value.trim()) {
    answerInput.focus();
    return;
  }

  answerStage.classList.add("hidden");
  guessStage.classList.remove("hidden");

  guessInput.value = "";
  guessInput.focus();
}

function revealAnswers() {
  if (!guessInput.value.trim()) {
    guessInput.focus();
    return;
  }

  answerStage.classList.add("hidden");
  guessStage.classList.add("hidden");
  revealStage.classList.remove("hidden");

  answerPlayerName.textContent = getPlayerName(answeringPlayer);
  originalAnswer.textContent = answerInput.value.trim();

  guessPlayerName.textContent = `${getPlayerName(guessingPlayer)} guessed`;
  partnerGuess.textContent = guessInput.value.trim();

  discussionArea.classList.add("hidden");

  accuracyButtons.forEach(button => {
    button.disabled = false;
  });
}

function saveResult(score) {
  if (resultSavedForQuestion) {
    return;
  }

  resultSavedForQuestion = true;

  const guesserKey = getPlayerKey(guessingPlayer);

  scores[guesserKey] += score;
  answeredCounts[guesserKey]++;
  totalPoints += score;

  const learned = JSON.parse(localStorage.getItem("betweenUsLearned") || "[]");

  learned.unshift({
    question: currentQuestion.question,
    answerPlayer: getPlayerName(answeringPlayer),
    guessPlayer: getPlayerName(guessingPlayer),
    answer: answerInput.value.trim(),
    guess: guessInput.value.trim(),
    score,
    category: currentQuestion.category,
    date: new Date().toISOString()
  });

  localStorage.setItem("betweenUsLearned", JSON.stringify(learned));

  accuracyButtons.forEach(button => {
    button.disabled = true;
  });

  updateScoreDisplay();

  discussionArea.classList.remove("hidden");
}

function nextQuestion() {
  currentQuestionIndex++;

  const previousAnsweringPlayer = answeringPlayer;

  answeringPlayer = guessingPlayer;
  guessingPlayer = previousAnsweringPlayer;

  if (currentQuestionIndex >= currentQuestions.length) {
    showResults();
    return;
  }

  showQuestion();
}

function showResults() {
  const percentage = possiblePoints
    ? Math.round((totalPoints / possiblePoints) * 100)
    : 0;

  if (percentage >= 90) {
    resultsTitle.textContent = "You REALLY Know Each Other";
    resultsMessage.textContent = "That's seriously impressive. After all those questions, you two know each other incredibly well.";
  } else if (percentage >= 75) {
    resultsTitle.textContent = "You Know Each Other Damn Well";
    resultsMessage.textContent = "You picked up on a lot of the little things. There aren't many secrets between you.";
  } else if (percentage >= 60) {
    resultsTitle.textContent = "Pretty Damn Good";
    resultsMessage.textContent = "You know each other well, but there are still a few surprises hiding in there.";
  } else if (percentage >= 40) {
    resultsTitle.textContent = "You've Got Some Learning To Do";
    resultsMessage.textContent = "You know the basics. The interesting stuff is clearly still being discovered.";
  } else {
    resultsTitle.textContent = "Apparently You're Still Strangers";
    resultsMessage.textContent = "Good thing you have plenty of questions left to figure each other out.";
  }

  resultsPercentage.textContent = `${percentage}%`;

  resultsPlayerOneName.textContent = players.one;
  resultsPlayerTwoName.textContent = players.two;

  const playerOnePossible = answeredCounts.one * 3;
  const playerTwoPossible = answeredCounts.two * 3;

  const playerOnePercentage = playerOnePossible
    ? Math.round((scores.one / playerOnePossible) * 100)
    : 0;

  const playerTwoPercentage = playerTwoPossible
    ? Math.round((scores.two / playerTwoPossible) * 100)
    : 0;

  resultsPlayerOneScore.textContent = `${playerOnePercentage}%`;
  resultsPlayerTwoScore.textContent = `${playerTwoPercentage}%`;

  showScreen(resultsScreen);
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
        <strong>${escapeHtml(item.answerPlayer)}'s answer:</strong><br>
        ${escapeHtml(item.answer)}
      </div>
      <div class="learned-answer">
        <strong>${escapeHtml(item.guessPlayer)}'s guess:</strong><br>
        ${escapeHtml(item.guess)}
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
  showScreen(setupScreen);
  playerOneInput.focus();
});

startGameButton.addEventListener("click", () => {
  const playerOne = playerOneInput.value.trim();
  const playerTwo = playerTwoInput.value.trim();

  if (!playerOne) {
    playerOneInput.focus();
    return;
  }

  if (!playerTwo) {
    playerTwoInput.focus();
    return;
  }

  players.one = playerOne;
  players.two = playerTwo;

  showScreen(categoryScreen);
});

setupBackButton.addEventListener("click", () => {
  showScreen(homeScreen);
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

lockAnswerButton.addEventListener("click", lockAnswer);

revealButton.addEventListener("click", revealAnswers);

accuracyButtons.forEach(button => {
  button.addEventListener("click", () => {
    saveResult(Number(button.dataset.score));
  });
});

nextQuestionButton.addEventListener("click", nextQuestion);

resultsContinueButton.addEventListener("click", () => {
  showScreen(categoryScreen);
});

resultsHomeButton.addEventListener("click", () => {
  showScreen(homeScreen);
});

loadQuestions();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
