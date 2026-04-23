const searchResults = document.getElementById("searchResults");
const selectedArtists = document.getElementById("selectedArtists");
const artistSearch = document.getElementById("artistSearch");
const startButton = document.getElementById("startButton");
const selectedArtistsSummary = document.getElementById("selectedArtistsSummary");

const chosenArtists = [];

function debounce(func, timeout = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(null, args);
    }, timeout);
  };
}

function getFallbackImage() {
  return "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";
}

function hideSearchResults() {
  searchResults.classList.add("hidden");
  searchResults.innerHTML = "";
}

function showSearchResults() {
  searchResults.classList.remove("hidden");
}

function isAlreadySelected(artistId) {
  return chosenArtists.some((artist) => artist.id === artistId);
}

async function getArtistImageFromApple(artistId) {
  try {
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 1) {
      const albumData = data.results[1];
      if (albumData.artworkUrl100) {
        return albumData.artworkUrl100.replace("100x100bb", "600x600bb");
      }
    }

    return getFallbackImage();
  } catch (error) {
    console.error("Failed to fetch artist image:", error);
    return getFallbackImage();
  }
}

function updateStartButton() {
  if (chosenArtists.length === 0) {
    startButton.disabled = true;
    startButton.className =
      "mt-8 w-full rounded-full bg-white/10 px-4 py-3 font-bold text-white/40 cursor-not-allowed transition md:mx-auto md:block md:w-64";
    selectedArtistsSummary.textContent = "0 selected";
    return;
  }

  startButton.disabled = false;
  startButton.className =
    "mt-8 w-full rounded-full bg-neon-green px-4 py-3 font-bold text-black transition hover:scale-105 md:mx-auto md:block md:w-64";
  selectedArtistsSummary.textContent = `${chosenArtists.length} selected`;
}

function renderSelectedArtists() {
  selectedArtists.innerHTML = "";

  if (chosenArtists.length === 0) {
    selectedArtists.innerHTML = `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
        No artists selected yet.
      </div>
    `;
    updateStartButton();
    return;
  }

  chosenArtists.forEach((artist, index) => {
    const card = document.createElement("div");
    card.className =
      "rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4";

    card.innerHTML = `
      <div class="flex items-center gap-4 min-w-0">
        <img
          src="${artist.image}"
          alt="${artist.name}"
          class="w-14 h-14 rounded-2xl object-cover shrink-0 bg-black/20"
        >
        <div class="min-w-0">
          <p class="text-lg font-bold text-white truncate">${artist.name}</p>
          <p class="text-sm text-white/55">Selected for this game</p>
        </div>
      </div>

      <button
        class="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm font-semibold text-white transition hover:text-neon-green"
        aria-label="Remove ${artist.name}"
      >
        Remove
      </button>
    `;

    const removeButton = card.querySelector("button");
    removeButton.addEventListener("click", function () {
      chosenArtists.splice(index, 1);
      renderSelectedArtists();

      const currentQuery = artistSearch.value.trim();
      if (currentQuery) {
        searchArtistsFromAPI(currentQuery);
      }
    });

    selectedArtists.appendChild(card);
  });

  updateStartButton();
}

function addArtist(artist) {
  if (isAlreadySelected(artist.id)) {
    return;
  }

  chosenArtists.push(artist);
  renderSelectedArtists();
}

function renderSearchLoading() {
  showSearchResults();
  searchResults.innerHTML = `
    <li class="px-4 py-3 text-sm text-white/60">
      Searching...
    </li>
  `;
}

function renderSearchEmpty() {
  showSearchResults();
  searchResults.innerHTML = `
    <li class="px-4 py-3 text-sm text-white/60">
      No artists found.
    </li>
  `;
}

function renderSearchError() {
  showSearchResults();
  searchResults.innerHTML = `
    <li class="px-4 py-3 text-sm text-red-400">
      Error searching artists.
    </li>
  `;
}

function renderSearchResults(results) {
  searchResults.innerHTML = "";

  results.forEach((artistData, index) => {
    const artist = {
      id: artistData.artistId,
      name: artistData.artistName,
      image: getFallbackImage(),
    };

    const alreadySelected = isAlreadySelected(artist.id);
    const item = document.createElement("li");

    item.className = `
      px-4 py-3 border-b border-white/5 last:border-0
      flex items-center justify-between gap-3
      ${alreadySelected ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:bg-neon-green/10"}
    `;

    const imageId = `artist-image-${artist.id}-${index}`;

    item.innerHTML = `
      <div class="flex items-center gap-3 min-w-0">
        <img
          id="${imageId}"
          src="${artist.image}"
          alt="${artist.name}"
          class="w-10 h-10 rounded-full object-cover shrink-0 bg-black/20"
        >

        <div class="min-w-0">
          <p class="text-sm font-semibold text-white truncate">${artist.name}</p>
          <p class="text-xs text-white/45">
            ${alreadySelected ? "Already selected" : "Tap to add"}
          </p>
        </div>
      </div>

      <span class="text-xs font-semibold ${alreadySelected ? "text-neon-green" : "text-white/45"}">
        ${alreadySelected ? "Selected" : "Add"}
      </span>
    `;

    if (!alreadySelected) {
      item.addEventListener("click", async function () {
        artist.image = await getArtistImageFromApple(artist.id);
        addArtist(artist);
        artistSearch.value = "";
        hideSearchResults();
      });
    }

    searchResults.appendChild(item);

    getArtistImageFromApple(artist.id).then((imageUrl) => {
      const imageElement = document.getElementById(imageId);
      if (imageElement) {
        imageElement.src = imageUrl;
      }
    });
  });

  showSearchResults();
}

async function searchArtistsFromAPI(query) {
  if (!query) {
    hideSearchResults();
    return;
  }

  renderSearchLoading();

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=musicArtist&limit=5`
    );
    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      renderSearchEmpty();
      return;
    }

    renderSearchResults(results);
  } catch (error) {
    console.error("Artist search failed:", error);
    renderSearchError();
  }
}

artistSearch.addEventListener(
  "input",
  debounce(function (event) {
    searchArtistsFromAPI(event.target.value.trim());
  }, 400)
);

document.addEventListener("click", function (event) {
  if (!artistSearch.contains(event.target) && !searchResults.contains(event.target)) {
    hideSearchResults();
  }
});

startButton.addEventListener("click", function () {
  if (chosenArtists.length === 0) {
    return;
  }

  console.log("Selected artists:", chosenArtists);
});

renderSelectedArtists();
updateStartButton();