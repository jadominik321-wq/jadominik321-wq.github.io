const INSTAGRAM_USERNAME = "wozniakdominikk";
const INSTAGRAM_CHAT = `https://ig.me/m/${INSTAGRAM_USERNAME}`;

const planOptions = [
  { id: "food", emoji: "🍽️", label: "Jedzenie" },
  { id: "cinema", emoji: "🎬", label: "Jedzenie + kino" },
];

const foodOptions = [
  { id: "ramen", emoji: "🍜", label: "Ramen" },
  { id: "sushi", emoji: "🍣", label: "Sushi" },
  { id: "italian", emoji: "🍝", label: "Włoskie" },
  { id: "burgers", emoji: "🍔", label: "Burgery" },
  { id: "steak", emoji: "🥩", label: "Steak / grill" },
  { id: "mexican", emoji: "🌮", label: "Meksykańskie" },
  { id: "pizza", emoji: "🍕", label: "Pizza" },
  { id: "asian", emoji: "🥟", label: "Azjatyckie" },
  { id: "your-pick", emoji: "🎲", label: "Ty wybierz" },
  { id: "surprise-food", emoji: "✨", label: "Zaskocz mnie" },
];

const movieOptions = [
  { id: "comedy", emoji: "😂", label: "Komedia" },
  { id: "romance", emoji: "❤️", label: "Romantyczny" },
  { id: "horror", emoji: "😱", label: "Horror" },
  { id: "thriller", emoji: "🧠", label: "Thriller" },
  { id: "action", emoji: "💥", label: "Akcja" },
  { id: "crime", emoji: "🕵️", label: "Kryminał" },
  { id: "drama", emoji: "🎭", label: "Dramat" },
  { id: "your-movie", emoji: "🎲", label: "Ty wybierz film" },
  { id: "surprise-movie", emoji: "✨", label: "Zaskocz mnie" },
];

const times = ["18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30", "19:45", "20:00"];

const noTexts = [
  "Nie",
  "Na pewno?",
  "Źle kliknęłaś 👀",
  "Spróbuj jeszcze raz",
  "To chyba nie ten przycisk",
  "Nie dam się kliknąć",
  "Serio próbujesz? 😂",
  "Obok jest lepsza opcja",
  "👉 TAK",
  "No dobra, wystarczy 😂",
];

const microMessages = [
  "Dobry wybór.",
  "Notuję 📝",
  "Okej, robi się konkretnie.",
  "Mamy to.",
  "Coraz mniej możliwości ucieczki 😌",
];

const state = {
  screen: "question",
  plan: null,
  food: null,
  movie: [],
  time: null,
  noAttempts: 0,
};

const app = document.querySelector("#app");
const toastElement = document.querySelector("#toast");
const confettiElement = document.querySelector("#confetti");
let activeTimers = [];
let lastNoMove = 0;

function schedule(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  activeTimers.push(timer);
  return timer;
}

function clearTimers() {
  activeTimers.forEach((timer) => window.clearTimeout(timer));
  activeTimers = [];
}

function getChoice(options, id) {
  return options.find((option) => option.id === id) || null;
}

function getStep() {
  if (state.screen === "plan") return 1;
  if (state.screen === "food" || state.screen === "movie") return 2;
  if (state.screen === "time") return 3;
  return 4;
}

function setScreen(screen) {
  if (screen !== "question") document.body.querySelector(".no-button.is-running")?.remove();
  state.screen = screen;
  render();
}

function headerTemplate() {
  const step = getStep();
  const backButton = state.screen === "plan"
    ? '<span class="back-placeholder"></span>'
    : '<button class="back-button" type="button" aria-label="Wróć do poprzedniego kroku">←</button>';

  return `
    <header class="step-header">
      ${backButton}
      <div class="progress-wrap">
        <span>${step} / 4</span>
        <div class="progress" role="progressbar" aria-label="Krok ${step} z 4" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${step * 25}">
          <span style="width: ${step * 25}%"></span>
        </div>
      </div>
      <span class="date-mark">FRI 04</span>
    </header>`;
}

function choiceCardsTemplate(options, selected, compact = false, multiple = false) {
  return `
    <div class="choice-grid ${compact ? "compact" : ""}" role="${multiple ? "group" : "radiogroup"}">
      ${options.map((option) => {
        const isSelected = Array.isArray(selected) ? selected.includes(option.id) : selected === option.id;
        return `
        <button
          class="choice-card ${isSelected ? "selected" : ""}"
          type="button"
          role="${multiple ? "checkbox" : "radio"}"
          aria-checked="${isSelected}"
          data-choice="${option.id}"
        >
          <span class="choice-emoji">${option.emoji}</span>
          <span>${option.label}</span>
          <span class="choice-indicator">✓</span>
        </button>`;
      }).join("")}
    </div>`;
}

function questionTemplate() {
  return `
    <div class="screen-content">
      <div class="question-screen">
        <div class="date-chip">PIĄTEK · 04.09</div>
        <div class="question-copy">
          <p class="eyebrow question-intro">Mam jedno ważne pytanie…</p>
          <h1>Chcesz być zajęta w piątek? <span>👀</span></h1>
        </div>
        <div class="question-actions">
          <button class="button yes-button" type="button">Tak</button>
          <button class="button no-button" type="button">${noTexts[state.noAttempts]}</button>
        </div>
        <p class="question-footnote">Właściwa odpowiedź jest całkiem blisko.</p>
      </div>
    </div>`;
}

function acceptedTemplate() {
  return `
    <div class="screen-content">
      <div class="center-message">
        <span class="tiny-check">✓</span>
        <h2>Wiedziałem, że podejmiesz dobrą decyzję 😌</h2>
        <p>To teraz ustalmy szczegóły.</p>
      </div>
    </div>`;
}

function planTemplate() {
  return `
    ${headerTemplate()}
    <div class="screen-content">
      <div class="choice-screen">
        <div class="section-heading">
          <p class="eyebrow">Ustalmy szczegóły</p>
          <h2>Na co masz ochotę?</h2>
          <p>Wybierz plan na piątkowy wieczór.</p>
        </div>
        ${choiceCardsTemplate(planOptions, state.plan)}
        <div class="micro-message" aria-live="polite"></div>
      </div>
    </div>`;
}

function foodTemplate() {
  const subtitle = state.plan === "cinema" ? "Najpierw najważniejsza decyzja." : "Jeden wybór. Bez presji.";
  return `
    ${headerTemplate()}
    <div class="screen-content">
      <div class="choice-screen">
        <div class="section-heading">
          <p class="eyebrow">Ustalmy szczegóły</p>
          <h2>Okej, a co jemy?</h2>
          <p>${subtitle}</p>
        </div>
        ${choiceCardsTemplate(foodOptions, state.food, true)}
        <div class="micro-message" aria-live="polite"></div>
        <div class="choice-footer">
          <span>Nie widzisz nic dla siebie?</span>
          <a href="${INSTAGRAM_CHAT}" target="_blank" rel="noreferrer">Napiszę Ci na Instagramie</a>
        </div>
      </div>
    </div>`;
}

function movieTemplate() {
  return `
    ${headerTemplate()}
    <div class="screen-content">
      <div class="choice-screen">
        <div class="section-heading">
          <p class="eyebrow">Ustalmy szczegóły</p>
          <h2>A co oglądamy?</h2>
          <p>Wybierz od 1 do maksymalnie 3 gatunków.</p>
        </div>
        ${choiceCardsTemplate(movieOptions, state.movie, true, true)}
        <div class="micro-message" aria-live="polite"></div>
        <div class="movie-footer">
          <div class="movie-count"><span>${state.movie.length}</span> / 3 wybrane</div>
          <p class="cinema-note">Popcorn jest obowiązkowy. To nie podlega negocjacji.</p>
          <button class="button primary-action movie-next" type="button" ${state.movie.length ? "" : "disabled"}>Dalej</button>
        </div>
      </div>
    </div>`;
}

function timeTemplate() {
  return `
    ${headerTemplate()}
    <div class="screen-content">
      <div class="time-screen">
        <div class="section-heading">
          <p class="eyebrow">Piątek · 04.09.2026</p>
          <h2>O której mam po Ciebie przyjechać?</h2>
        </div>
        <div class="time-grid" role="radiogroup" aria-label="Wybierz godzinę odbioru">
          ${times.map((option) => `
            <button
              type="button"
              role="radio"
              aria-checked="${state.time === option}"
              class="time-option ${state.time === option ? "selected" : ""}"
              data-time="${option}"
            >
              ${option}${state.time === option ? "<span>✓</span>" : ""}
            </button>
          `).join("")}
        </div>
        <div class="time-confirmation"><span class="${state.time ? "is-visible" : ""}">Zapisane ✓</span></div>
        <button class="button primary-action" type="button" ${state.time ? "" : "disabled"}>Mamy plan</button>
      </div>
    </div>`;
}

function generatedMessage() {
  const food = getChoice(foodOptions, state.food);
  const movies = state.movie.map((id) => getChoice(movieOptions, id)).filter(Boolean);
  const lines = ["No dobra, jestem zajęta w piątek 😌"];

  if (food) lines.push(`${food.emoji} ${food.label}`);
  if (state.plan === "cinema" && movies.length) lines.push(`🎬 ${movies.map((movie) => movie.label).join(", ")}`);
  if (state.time) lines.push(`🕖 ${state.time}`);
  lines.push("", "Możesz po mnie przyjechać.");

  return lines.join("\n");
}

function finalTemplate() {
  const food = getChoice(foodOptions, state.food);
  const movies = state.movie.map((id) => getChoice(movieOptions, id)).filter(Boolean);
  const movieSummary = state.plan === "cinema" && movies.length
    ? `<p><span>🎬</span> ${movies.map((movie) => movie.label).join(", ")}</p>`
    : "";

  return `
    ${headerTemplate()}
    <div class="screen-content">
      <div class="final-screen">
        <div class="final-heading">
          <span class="checkmark">✓</span>
          <h2>No to jesteśmy umówieni.</h2>
          <p>Teraz już nie ma odwrotu 😌</p>
        </div>
        <div class="summary-card">
          <div class="summary-date">PIĄTEK <span>•</span> 04.09.2026</div>
          <div class="summary-time">${state.time}</div>
          <div class="summary-details">
            ${food ? `<p><span>${food.emoji}</span> ${food.label}</p>` : ""}
            ${movieSummary}
          </div>
        </div>
        <div class="message-box">
          <div class="message-label">WIADOMOŚĆ DO WYSŁANIA</div>
          <p></p>
        </div>
        <div class="final-actions">
          <button class="button primary-action send-button" type="button">Wyślij Dominikowi <span>↗</span></button>
          <button class="button copy-button" type="button">▣&nbsp; Skopiuj wiadomość</button>
        </div>
      </div>
    </div>`;
}

function render() {
  clearTimers();
  app.className = `invite-card screen-${state.screen}`;

  const templates = {
    question: questionTemplate,
    accepted: acceptedTemplate,
    plan: planTemplate,
    food: foodTemplate,
    movie: movieTemplate,
    time: timeTemplate,
    final: finalTemplate,
  };

  app.innerHTML = templates[state.screen]();
  bindScreenEvents();
}

function bindScreenEvents() {
  const backButton = app.querySelector(".back-button");
  if (backButton) backButton.addEventListener("click", goBack);

  if (state.screen === "question") bindQuestionEvents();
  if (state.screen === "accepted") bindAcceptedEvents();
  if (state.screen === "plan") bindPlanEvents();
  if (state.screen === "food") bindFoodEvents();
  if (state.screen === "movie") bindMovieEvents();
  if (state.screen === "time") bindTimeEvents();
  if (state.screen === "final") bindFinalEvents();
}

function bindQuestionEvents() {
  const yesButton = app.querySelector(".yes-button");
  const noButton = app.querySelector(".no-button");

  schedule(() => {
    app.querySelector(".question-copy h1")?.classList.add("is-visible");
    app.querySelector(".question-actions")?.classList.add("is-visible");
    app.querySelector(".question-footnote")?.classList.add("is-visible");
  }, 900);

  yesButton.addEventListener("click", () => {
    document.body.querySelector(".no-button.is-running")?.remove();
    showConfetti();
    setScreen("accepted");
  });

  ["pointerenter", "pointerdown", "focus", "click"].forEach((eventName) => {
    noButton.addEventListener(eventName, moveNoButton, { passive: false });
  });
}

function moveNoButton(event) {
  event.preventDefault();
  event.stopPropagation();

  const now = performance.now();
  if (now - lastNoMove < 80) return;
  lastNoMove = now;

  const noButton = document.querySelector(".no-button");
  const yesButton = app.querySelector(".yes-button");
  if (!noButton || !yesButton) return;

  state.noAttempts = Math.min(state.noAttempts + 1, noTexts.length - 1);
  noButton.textContent = noTexts[state.noAttempts];
  noButton.classList.add("is-running");
  if (noButton.parentElement !== document.body) document.body.appendChild(noButton);

  const safe = 14;
  const reservedWidth = Math.min(245, window.innerWidth - safe * 2);
  const buttonHeight = noButton.offsetHeight || 52;
  const maxX = Math.max(safe, window.innerWidth - reservedWidth - safe);
  const maxY = Math.max(safe, window.innerHeight - buttonHeight - safe);
  const x = safe + Math.random() * Math.max(0, maxX - safe);
  const y = safe + Math.random() * Math.max(0, maxY - safe);

  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  noButton.style.transform = `scale(${Math.max(0.74, 1 - state.noAttempts * 0.035)})`;
  yesButton.style.transform = `scale(${1 + Math.min(state.noAttempts, 7) * 0.025})`;
}

function bindAcceptedEvents() {
  schedule(() => app.querySelector(".center-message p")?.classList.add("is-visible"), 700);
  schedule(() => setScreen("plan"), 1900);
}

function markSelectionAndContinue(id, callback) {
  clearTimers();
  app.querySelectorAll(".choice-card").forEach((card) => {
    const selected = card.dataset.choice === id;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });

  const micro = app.querySelector(".micro-message");
  if (micro) micro.textContent = microMessages[Math.floor(Math.random() * microMessages.length)];
  schedule(callback, 360);
}

function bindPlanEvents() {
  app.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.plan = card.dataset.choice;
      markSelectionAndContinue(state.plan, () => setScreen("food"));
    });
  });
}

function bindFoodEvents() {
  app.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.food = card.dataset.choice;
      markSelectionAndContinue(state.food, () => setScreen(state.plan === "cinema" ? "movie" : "time"));
    });
  });
}

function bindMovieEvents() {
  app.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.choice;
      if (state.movie.includes(id)) {
        state.movie = state.movie.filter((movieId) => movieId !== id);
      } else if (state.movie.length < 3) {
        state.movie = [...state.movie, id];
      } else {
        showToast("Możesz wybrać maksymalnie 3 gatunki.");
      }
      render();
    });
  });

  const nextButton = app.querySelector(".movie-next");
  if (state.movie.length) nextButton.addEventListener("click", () => setScreen("time"));
}

function bindTimeEvents() {
  app.querySelectorAll(".time-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.time = button.dataset.time;
      render();
    });
  });

  const confirmButton = app.querySelector(".primary-action");
  if (state.time) confirmButton.addEventListener("click", () => setScreen("final"));
}

function bindFinalEvents() {
  app.querySelector(".message-box p").textContent = generatedMessage();
  app.querySelector(".send-button").addEventListener("click", sendToInstagram);
  app.querySelector(".copy-button").addEventListener("click", copyMessage);
}

function goBack() {
  if (state.screen === "food") setScreen("plan");
  else if (state.screen === "movie") setScreen("food");
  else if (state.screen === "time") setScreen(state.plan === "cinema" ? "movie" : "food");
  else if (state.screen === "final") setScreen("time");
}

async function copyMessage() {
  const message = generatedMessage();

  try {
    if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard API unavailable");
    await navigator.clipboard.writeText(message);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = message;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  showToast("Skopiowane ✓ Teraz tylko wklej wiadomość.");
}

async function sendToInstagram() {
  await copyMessage();
  schedule(() => {
    window.location.href = INSTAGRAM_CHAT;
  }, 900);
}

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add("is-visible");
  window.setTimeout(() => toastElement.classList.remove("is-visible"), 3000);
}

function showConfetti() {
  confettiElement.innerHTML = ["·", "♡", "·", "♡", "·", "♡"].map((symbol, index) => (
    `<span style="left:${18 + index * 13}vw;font-size:${13 + index}px;animation-delay:${index * 35}ms">${symbol}</span>`
  )).join("");
  confettiElement.classList.add("is-active");
  window.setTimeout(() => {
    confettiElement.classList.remove("is-active");
    confettiElement.innerHTML = "";
  }, 1100);
}

render();
