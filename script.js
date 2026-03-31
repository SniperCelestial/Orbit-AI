const STORAGE_KEYS = {
  users: "orbit-users",
  session: "orbit-session"
};

const authScreen = document.getElementById("authScreen");
const dashboard = document.getElementById("dashboard");
const authStatus = document.getElementById("authStatus");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const tabButtons = document.querySelectorAll("[data-auth-tab]");
const navButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");

const profileName = document.getElementById("profileName");
const profileMeta = document.getElementById("profileMeta");
const profileAvatar = document.getElementById("profileAvatar");
const profileAvatarLarge = document.getElementById("profileAvatarLarge");
const summaryName = document.getElementById("summaryName");
const summaryHandle = document.getElementById("summaryHandle");
const summaryVibe = document.getElementById("summaryVibe");
const welcomeTitle = document.getElementById("welcomeTitle");
const xpValue = document.getElementById("xpValue");
const postCount = document.getElementById("postCount");
const goalCount = document.getElementById("goalCount");
const streakValue = document.getElementById("streakValue");
const profileInsight = document.getElementById("profileInsight");
const profileInsightBody = document.getElementById("profileInsightBody");
const feedTip = document.getElementById("feedTip");
const feedTipBody = document.getElementById("feedTipBody");

const postForm = document.getElementById("postForm");
const postTitle = document.getElementById("postTitle");
const postContent = document.getElementById("postContent");
const feedList = document.getElementById("feedList");

const goalForm = document.getElementById("goalForm");
const goalInput = document.getElementById("goalInput");
const goalList = document.getElementById("goalList");

const assistantForm = document.getElementById("assistantForm");
const assistantInput = document.getElementById("assistantInput");
const assistantMessages = document.getElementById("assistantMessages");

const logoutButton = document.getElementById("logoutButton");
const startTimerButton = document.getElementById("startTimer");
const resetTimerButton = document.getElementById("resetTimer");
const timerValue = document.getElementById("timerValue");
const timerRing = document.getElementById("timerRing");

const sessionLength = 12 * 60;
let remaining = sessionLength;
let timerId = null;
let currentUser = null;

const seedPosts = [
  {
    author: "Layla",
    username: "layladraws",
    title: "Finished my sneaker redesign",
    content: "Used my focus sprint first and then posted it here. That actually helped a lot.",
    createdAt: "Just now"
  },
  {
    author: "Rohan",
    username: "rohancodes",
    title: "Starting a 20 minute math room",
    content: "Anyone else trying to finish homework before gaming tonight?",
    createdAt: "12 min ago"
  }
];

function readUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function saveSession(username) {
  localStorage.setItem(STORAGE_KEYS.session, username);
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.session);
}

function findUser(username) {
  return readUsers().find((user) => user.username.toLowerCase() === username.toLowerCase());
}

function updateUser(updatedUser) {
  const users = readUsers().map((user) => user.username === updatedUser.username ? updatedUser : user);
  saveUsers(users);
  currentUser = updatedUser;
}

function randomId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `goal-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function createDefaultUser(data) {
  return {
    name: data.name,
    username: data.username,
    password: data.password,
    vibe: data.vibe,
    xp: 40,
    streak: 1,
    posts: [],
    goals: [
      { id: randomId(), text: "Finish one school task", done: false },
      { id: randomId(), text: "Post one real progress update", done: false }
    ],
    messages: [
      {
        role: "bot",
        text: `Hey ${data.name.split(" ")[0]}, I am Orbit AI. I can help you plan your day, write better posts, and keep your goals moving.`
      }
    ]
  };
}

function setAuthStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.style.color = isError ? "#ffd3cb" : "rgba(255, 255, 255, 0.82)";
}

function switchAuthTab(tab) {
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authTab === tab);
  });
  loginForm.classList.toggle("hidden", tab !== "login");
  signupForm.classList.toggle("hidden", tab !== "signup");
}

function showApp(user) {
  currentUser = user;
  authScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");
  renderUser();
  renderFeed();
  renderGoals();
  renderMessages();
  switchView("feedView");
}

function showAuth() {
  authScreen.classList.remove("hidden");
  dashboard.classList.add("hidden");
}

function initialsFor(name) {
  return name.trim().charAt(0).toUpperCase();
}

function completedGoals() {
  return currentUser.goals.filter((goal) => goal.done).length;
}

function renderUser() {
  const firstName = currentUser.name.split(" ")[0];
  const initials = initialsFor(currentUser.name);
  const postsTotal = currentUser.posts.length;
  const goalsDone = completedGoals();

  profileName.textContent = currentUser.name;
  profileMeta.textContent = `@${currentUser.username} • ${currentUser.vibe}`;
  profileAvatar.textContent = initials;
  profileAvatarLarge.textContent = initials;
  summaryName.textContent = currentUser.name;
  summaryHandle.textContent = `@${currentUser.username}`;
  summaryVibe.textContent = currentUser.vibe;
  welcomeTitle.textContent = `Welcome back, ${firstName}`;
  xpValue.textContent = currentUser.xp;
  postCount.textContent = postsTotal;
  goalCount.textContent = goalsDone;
  streakValue.textContent = `${currentUser.streak} day${currentUser.streak === 1 ? "" : "s"}`;

  if (goalsDone >= 3) {
    profileInsight.textContent = "You are turning Orbit into a progress machine.";
    profileInsightBody.textContent = "You have completed several goals. The next smart move is to post what helped you stay consistent.";
    feedTip.textContent = "Your consistency is getting noticed.";
    feedTipBody.textContent = "Post a short reflection and Orbit AI can turn it into a stronger community update.";
  } else if (postsTotal > 0) {
    profileInsight.textContent = "You are showing up and building momentum.";
    profileInsightBody.textContent = "Keep balancing posting with real work so your feed reflects actual progress.";
    feedTip.textContent = "Posts connected to real work feel stronger.";
    feedTipBody.textContent = "Tell people what you finished, what challenged you, and what comes next.";
  } else {
    profileInsight.textContent = "Your orbit is ready for its first move.";
    profileInsightBody.textContent = "Start with one goal, then post a small win so your profile begins with action.";
    feedTip.textContent = "Posting progress gives you bonus XP.";
    feedTipBody.textContent = "Try sharing one thing you created, one thing you learned, and one thing you want to improve tomorrow.";
  }
}

function renderFeed() {
  const combinedPosts = [...currentUser.posts, ...seedPosts];

  if (combinedPosts.length === 0) {
    feedList.innerHTML = '<div class="post-card"><p>No posts yet. Publish the first one.</p></div>';
    return;
  }

  feedList.innerHTML = combinedPosts
    .map((post) => `
      <article class="post-card">
        <div class="post-head">
          <div>
            <h4>${escapeHtml(post.title)}</h4>
            <p class="post-meta">${escapeHtml(post.author)} • @${escapeHtml(post.username)} • ${escapeHtml(post.createdAt)}</p>
          </div>
          <span class="pill">${post.username === currentUser.username ? "You" : "Community"}</span>
        </div>
        <p>${escapeHtml(post.content)}</p>
      </article>
    `)
    .join("");
}

function renderGoals() {
  if (currentUser.goals.length === 0) {
    goalList.innerHTML = '<div class="goal-card"><p>No goals yet. Add one above.</p></div>';
    return;
  }

  goalList.innerHTML = currentUser.goals
    .map((goal) => `
      <article class="goal-card ${goal.done ? "done" : ""}">
        <div class="goal-head">
          <div>
            <h4>${escapeHtml(goal.text)}</h4>
            <p class="goal-meta">${goal.done ? "Completed" : "In progress"}</p>
          </div>
          <div class="goal-actions">
            <button class="goal-button complete" data-goal-action="toggle" data-goal-id="${goal.id}">
              ${goal.done ? "Undo" : "Done"}
            </button>
            <button class="goal-button delete" data-goal-action="delete" data-goal-id="${goal.id}">
              Delete
            </button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderMessages() {
  assistantMessages.innerHTML = currentUser.messages
    .map((message) => `
      <article class="message ${message.role}">
        <strong>${message.role === "bot" ? "Orbit AI" : "You"}</strong>
        <p>${escapeHtml(message.text)}</p>
      </article>
    `)
    .join("");

  assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

function switchView(viewId) {
  views.forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
}

function addBotMessage(text) {
  currentUser.messages.push({ role: "bot", text });
  updateUser(currentUser);
  renderMessages();
}

function respondToAssistant(prompt) {
  const text = prompt.toLowerCase();
  const pendingGoals = currentUser.goals.filter((goal) => !goal.done);

  if (text.includes("study") || text.includes("exam") || text.includes("homework")) {
    return `Try this study flow: 12 minutes focused, 3 minutes reset, then one quick recap post to your friends. Your next pending goal is "${pendingGoals[0]?.text || "add a new school goal"}".`;
  }

  if (text.includes("post") || text.includes("caption")) {
    return "Here is a stronger post formula: what you worked on, what was difficult, and what improved today. That feels real and gets better reactions than random posting.";
  }

  if (text.includes("goal") || text.includes("plan") || text.includes("productive")) {
    return `You currently have ${pendingGoals.length} open goals. Pick one short win first, finish it, then come back and tell me so I can help shape your next step.`;
  }

  if (text.includes("sad") || text.includes("stress") || text.includes("tired")) {
    return "Take a softer win today. Choose one tiny goal, mute distractions for one sprint, and message one trusted friend instead of pushing yourself too hard.";
  }

  return "I can help with study plans, goal breakdowns, captions, motivation, and daily routines. Ask me what you want to do next and I will turn it into a simple plan.";
}

function formatTime(value) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderTimer() {
  timerValue.textContent = formatTime(remaining);
  timerRing.style.setProperty("--progress", (remaining / sessionLength) * 100);
}

function resetTimer() {
  clearInterval(timerId);
  timerId = null;
  remaining = sessionLength;
  startTimerButton.textContent = "Start sprint";
  renderTimer();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchAuthTab(button.dataset.authTab));
});

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const vibe = document.getElementById("signupVibe").value;

  if (!name || !username || !password) {
    setAuthStatus("Please fill in every signup field.", true);
    return;
  }

  if (findUser(username)) {
    setAuthStatus("That username already exists. Try another one.", true);
    return;
  }

  const users = readUsers();
  const user = createDefaultUser({ name, username, password, vibe });
  users.push(user);
  saveUsers(users);
  saveSession(user.username);
  signupForm.reset();
  setAuthStatus("Account created. Logging you into Orbit...");
  showApp(user);
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const user = findUser(username);

  if (!user || user.password !== password) {
    setAuthStatus("Wrong username or password. Try again.", true);
    return;
  }

  saveSession(user.username);
  loginForm.reset();
  setAuthStatus("Login successful.");
  showApp(user);
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = postTitle.value.trim();
  const content = postContent.value.trim();

  if (!title || !content) {
    return;
  }

  currentUser.posts.unshift({
    author: currentUser.name,
    username: currentUser.username,
    title,
    content,
    createdAt: "Just now"
  });
  currentUser.xp += 15;
  currentUser.streak += 1;

  updateUser(currentUser);
  renderUser();
  renderFeed();

  postForm.reset();
  addBotMessage("Nice work. I gave you bonus XP because you posted a progress update instead of just scrolling.");
});

goalForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = goalInput.value.trim();
  if (!text) {
    return;
  }

  currentUser.goals.unshift({
    id: randomId(),
    text,
    done: false
  });

  updateUser(currentUser);
  renderGoals();
  renderUser();
  goalForm.reset();
});

goalList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const action = target.dataset.goalAction;
  const goalId = target.dataset.goalId;

  if (!action || !goalId) {
    return;
  }

  if (action === "toggle") {
    currentUser.goals = currentUser.goals.map((goal) => {
      if (goal.id !== goalId) {
        return goal;
      }

      const nextDone = !goal.done;
      if (nextDone) {
        currentUser.xp += 20;
      } else {
        currentUser.xp = Math.max(0, currentUser.xp - 20);
      }

      return { ...goal, done: nextDone };
    });
  }

  if (action === "delete") {
    currentUser.goals = currentUser.goals.filter((goal) => goal.id !== goalId);
  }

  updateUser(currentUser);
  renderGoals();
  renderUser();
});

assistantForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const prompt = assistantInput.value.trim();
  if (!prompt) {
    return;
  }

  currentUser.messages.push({ role: "user", text: prompt });
  currentUser.messages.push({ role: "bot", text: respondToAssistant(prompt) });
  updateUser(currentUser);
  renderMessages();
  assistantForm.reset();
});

logoutButton.addEventListener("click", () => {
  clearSession();
  currentUser = null;
  resetTimer();
  showAuth();
  switchAuthTab("login");
  setAuthStatus("You have been logged out.");
});

startTimerButton.addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    startTimerButton.textContent = "Resume sprint";
    return;
  }

  startTimerButton.textContent = "Pause sprint";
  timerId = setInterval(() => {
    if (remaining === 0) {
      clearInterval(timerId);
      timerId = null;
      startTimerButton.textContent = "Start sprint";
      currentUser.xp += 10;
      updateUser(currentUser);
      renderUser();
      addBotMessage("Sprint complete. You earned 10 XP. Now finish one small task before opening another tab.");
      remaining = sessionLength;
      renderTimer();
      return;
    }

    remaining -= 1;
    renderTimer();
  }, 1000);
});

resetTimerButton.addEventListener("click", resetTimer);

renderTimer();
switchAuthTab("login");

const savedSession = localStorage.getItem(STORAGE_KEYS.session);
if (savedSession) {
  const user = findUser(savedSession);
  if (user) {
    showApp(user);
  } else {
    showAuth();
  }
} else {
  showAuth();
}
