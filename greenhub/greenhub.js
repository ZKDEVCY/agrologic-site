const plantModal = document.getElementById("plantModal");
const openPlantModal = document.getElementById("openPlantModal");
const closePlantModal = document.getElementById("closePlantModal");
const feed = document.getElementById("feed");

const posts = [
  {
    emoji: "🌱",
    name: "Aloe Vera #01",
    caretaker: "Zacharias",
    species: "Aloe vera barbadensis Miller",
    imageClass: "aloe",
    text: "New growth visible after the last irrigation cycle. Leaf color looks stable, but the lower leaves will be monitored for stress symptoms.",
    tags: ["Healthy", "Aloe Vera", "Larnaca"]
  },
  {
    emoji: "🌹",
    name: "Grandma’s Rose",
    caretaker: "Maria",
    species: "Rosa spp.",
    imageClass: "rose",
    text: "First flowering stage started this week. The caretaker added compost and adjusted irrigation frequency for warmer conditions.",
    tags: ["Flowering", "Rose", "Garden"]
  },
  {
    emoji: "🍅",
    name: "Cherry Tomato Bed",
    caretaker: "Andreas",
    species: "Solanum lycopersicum var. cerasiforme",
    imageClass: "tomato",
    text: "Fruit set has started. The next step is to monitor calcium supply, irrigation consistency, and possible early signs of blossom-end rot.",
    tags: ["Fruit set", "Tomato", "Vegetables"]
  }
];

function renderPosts() {
  feed.innerHTML = "";
  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post-card";
    article.innerHTML = `
      <div class="post-header">
        <div class="plant-avatar">${post.emoji}</div>
        <div>
          <h3>${post.name}</h3>
          <p>Managed by ${post.caretaker} · ${post.species}</p>
        </div>
      </div>
      <div class="plant-image ${post.imageClass}"></div>
      <p class="post-text">${post.text}</p>
      <div class="post-tags">${post.tags.map(tag => `<span>${tag}</span>`).join("")}</div>
      <div class="post-actions">
        <button class="action-button">♡ Like</button>
        <button class="action-button">💬 Comment</button>
        <button class="action-button">🔖 Save</button>
      </div>
    `;
    feed.appendChild(article);
  });

  document.querySelectorAll(".action-button").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
    });
  });
}

openPlantModal.addEventListener("click", () => {
  plantModal.classList.add("open");
});

closePlantModal.addEventListener("click", () => {
  plantModal.classList.remove("open");
});

plantModal.addEventListener("click", (event) => {
  if (event.target === plantModal) {
    plantModal.classList.remove("open");
  }
});

document.querySelectorAll(".side-nav button").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;

    document.querySelectorAll(".side-nav button").forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    document.querySelectorAll(".page").forEach(section => section.classList.remove("active"));
    document.getElementById(page).classList.add("active");

    const titles = {
      home: ["Plant-first home feed", "Follow plants, gardens, collections, and their caretakers."],
      plants: ["My Plants", "Create and manage digital identities for your plants."],
      communities: ["Communities", "Join plant-focused communities and local growing groups."],
      marketplace: ["Marketplace", "Discover plants, cuttings, tools, seeds, and garden services."],
      ai: ["Plant AI", "Future AI verification, identification, and diagnosis tools."]
    };

    document.getElementById("pageTitle").textContent = titles[page][0];
    document.getElementById("pageSubtitle").textContent = titles[page][1];
  });
});

document.getElementById("plantForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("plantName").value.trim();
  const species = document.getElementById("plantSpecies").value.trim();
  const health = document.getElementById("plantHealth").value;
  const note = document.getElementById("plantNote").value.trim();

  posts.unshift({
    emoji: "🌿",
    name,
    caretaker: "You",
    species,
    imageClass: "aloe",
    text: note || `New plant profile created. Current health status: ${health}.`,
    tags: [health, "New profile", "Plant-only"]
  });

  renderPosts();
  plantModal.classList.remove("open");
  event.target.reset();

  document.querySelector('[data-page="home"]').click();
});

renderPosts();
