/*
Gets the main elements from the select artists page.
These are used later to update the search box, selected artists list,
buttons, messages, and the hidden input that is sent to Flask.
*/
const searchResults = document.getElementById("searchResults");
const searchResultsWrap = document.getElementById("searchResultsWrap");
const selectedArtists = document.getElementById("selectedArtists");
const artistSearch = document.getElementById("artistSearch");
const selectedArtistsSummary = document.getElementById("selectedArtistsSummary");
const clearArtistsButton = document.getElementById("clearArtistsButton");
const saveArtistsButton = document.getElementById("saveArtistsButton");
const saveArtistsMessage = document.getElementById("saveArtistsMessage");
const artistLimitMessage = document.getElementById("artistLimitMessage");
const artistRequiredMessage = document.getElementById("artistRequiredMessage");
const selectArtistsForm = document.getElementById("selectArtistsForm");
const selectedArtistsJson = document.getElementById("selectedArtistsJson");
const initialSelectedArtistsScript = document.getElementById("initialSelectedArtists");

/*
Gets the maximum number of artists from the HTML form.
The fallback image is used when an artist does not have a proper image.
*/
const MAX_SELECTED_ARTISTS = Number(selectArtistsForm.dataset.maxArtists);
const FALLBACK_ARTIST_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

/*
Stores the artists selected by the user on the page before the form is submitted.
*/
const chosenArtists = [];

let searchTimer = null;
let activeSearchController = null;
let latestSearchId = 0;

/*
Escapes text before putting it into HTML.
This helps stop artist names with special characters from breaking the page layout.
*/
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*
Returns the default image used when an artist image is missing.
*/
function getFallbackImage() {
  return FALLBACK_ARTIST_IMAGE;
}

/*
Stops the current search request and clears the search timer.
This helps stop old search results from showing after the user keeps typing.
*/
function stopActiveSearch() {
  latestSearchId++;

  if (activeSearchController) {
    activeSearchController.abort();
    activeSearchController = null;
  }

  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
}

/*
Shows the search results dropdown.
*/
function showSearchResults() {
  searchResultsWrap.classList.remove("hidden");
}

/*
Hides the search results dropdown and clears the results.
*/
function hideSearchResults() {
  stopActiveSearch();
  searchResultsWrap.classList.add("hidden");
  searchResults.innerHTML = "";
}

/*
If an artist image fails to load, replace it with the fallback placeholder image.
*/
function handleBrokenArtistImage(imageElement) {
  imageElement.addEventListener("error", function () {
    imageElement.src = FALLBACK_ARTIST_IMAGE;
  });
}

/*
Loads artists that were already saved for the current user.
Flask puts the saved artist data into the page, and this function adds it back
into chosenArtists so the page can show the selected artists again.
*/
function loadInitialSelectedArtists() {
  try {
    const savedArtists = JSON.parse(initialSelectedArtistsScript.textContent || "[]");

    if (!Array.isArray(savedArtists)) {
      return;
    }

    savedArtists.forEach((artist) => {
      if (!artist || !artist.id || !artist.name) {
        return;
      }

      if (chosenArtists.length >= MAX_SELECTED_ARTISTS) {
        return;
      }

      if (isAlreadySelected(artist.id)) {
        return;
      }

      chosenArtists.push({
        id: String(artist.id),
        name: artist.name,
        image: artist.image || getFallbackImage(),
      });
    });
  } catch (error) {
    console.error("Could not load selected artists:", error);
  }
}

/*
Updates the hidden input with the selected artists as JSON.
This is how the selected artists are sent to the Flask route when the form submits.
*/
function updateHiddenSelectedArtistsInput() {
  selectedArtistsJson.value = JSON.stringify(chosenArtists);
}

/*
Checks if the artist is already selected.
This prevents the same artist from being selected twice.
*/
function isAlreadySelected(artistId) {
  return chosenArtists.some((artist) => String(artist.id) === String(artistId));
}

/*
Checks if the user has already selected the maximum number of artists.
*/
function hasReachedArtistLimit() {
  return chosenArtists.length >= MAX_SELECTED_ARTISTS;
}

/*
Updates the save button, clear button, selected artist count, and warning messages.
The page changes depending on whether the user has selected no artists, some artists,
or the maximum number of artists.
*/
function updateSaveButton() {
  selectedArtistsSummary.textContent = `${chosenArtists.length} / ${MAX_SELECTED_ARTISTS} selected`;

  if (chosenArtists.length === 0) {
    saveArtistsButton.disabled = true;
    saveArtistsButton.className =
      "w-full rounded-full bg-white/10 px-4 py-3 font-bold text-white/40 cursor-not-allowed transition md:w-64";

    clearArtistsButton.classList.add("hidden");

    saveArtistsMessage.textContent = "Select at least one artist to continue.";
    saveArtistsMessage.className = "text-center text-sm text-white/50";
  } else {
    saveArtistsButton.disabled = false;
    saveArtistsButton.className =
      "w-full rounded-full bg-neon-green/5 border border-neon-green/30 px-4 py-3 font-bold text-neon-green transition hover:bg-neon-green hover:text-black cursor-pointer md:w-64";

    clearArtistsButton.classList.remove("hidden");

    saveArtistsMessage.textContent = "Your artists will be saved for next time!";
    saveArtistsMessage.className = "text-center text-sm text-white/50";
  }

  if (hasReachedArtistLimit()) {
    artistLimitMessage.classList.remove("hidden");
  } else {
    artistLimitMessage.classList.add("hidden");
  }

  if (chosenArtists.length > 0) {
    artistRequiredMessage.classList.add("hidden");
  }

  updateHiddenSelectedArtistsInput();
}

/*
Displays the selected artists as chips on the page.
Clicking a selected artist chip removes that artist from the selected list.
*/
function renderSelectedArtists() {
  selectedArtists.innerHTML = "";

  if (chosenArtists.length === 0) {
    selectedArtists.innerHTML = `
      <div class="rounded-full border border-white/10 bg-white/5 p-4 text-white/60">
        No artists selected yet.
      </div>
    `;

    updateSaveButton();
    return;
  }

  const chipsWrapper = document.createElement("div");
  chipsWrapper.className = "flex flex-wrap gap-3";

  chosenArtists.forEach((artist, index) => {
    const chip = document.createElement("div");

    chip.className =
      "group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-2 pr-3 transition hover:border-[#ff4a6e] hover:bg-[#ff4a6e1f] cursor-pointer";

    chip.innerHTML = `
      <img
        src="${escapeHtml(artist.image || getFallbackImage())}"
        alt="${escapeHtml(artist.name)}"
        class="w-10 h-10 rounded-full object-cover shrink-0 bg-black/20"
      >

      <span class="max-w-[170px] truncate text-sm font-semibold text-white group-hover:text-[#ff4a6e] transition">
        ${escapeHtml(artist.name)}
      </span>

      <button
        type="button"
        class="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-sm font-bold text-white group-hover:text-[#ff4a6e] transition"
        aria-label="Remove ${escapeHtml(artist.name)}"
      >
        ×
      </button>
    `;

    const chipImage = chip.querySelector("img");
    handleBrokenArtistImage(chipImage);

    const removeButton = chip.querySelector("button");

    chip.addEventListener("click", function () {
      chosenArtists.splice(index, 1);
      renderSelectedArtists();
    });

    chipsWrapper.appendChild(chip);
  });

  selectedArtists.appendChild(chipsWrapper);
  updateSaveButton();
}

/*
After an artist is selected, this tries to fetch a better image for that artist.
If a better image is found, the selected artist chip is updated.
*/
async function fetchArtistImageAndUpdate(artistId) {
  try {
    const response = await fetch(`/api/artist-image-by-id?artist_id=${encodeURIComponent(artistId)}`);
    const data = await response.json();

    if (!data.image || data.image === FALLBACK_ARTIST_IMAGE) {
      return;
    }

    const selectedArtist = chosenArtists.find((artist) => String(artist.id) === String(artistId));

    if (selectedArtist) {
      selectedArtist.image = data.image;
      renderSelectedArtists();
    }
  } catch (error) {
    console.error("Artist image failed:", error);
  }
}

/*
Adds an artist to the selected list.
It blocks duplicate artists and stops the user from going over the artist limit.
*/
function addArtist(artist) {
  if (isAlreadySelected(artist.id)) {
    hideSearchResults();
    artistSearch.value = "";
    return false;
  }

  if (hasReachedArtistLimit()) {
    renderSearchMessage(`You can only select up to ${MAX_SELECTED_ARTISTS} artists.`, true);
    return false;
  }

  chosenArtists.push({
    id: String(artist.id),
    name: artist.name,
    image: artist.image || getFallbackImage(),
  });

  artistSearch.value = "";
  hideSearchResults();
  renderSelectedArtists();

  fetchArtistImageAndUpdate(artist.id);

  return true;
}

/*
Shows a message inside the search dropdown.
This is used for searching, no results, errors, and max artist limit messages.
*/
function renderSearchMessage(message, isError = false) {
  searchResults.innerHTML = `
    <li class="px-4 py-3 text-sm ${isError ? "text-red-400" : "text-white/60"} border-b border-white/5 last:border-0">
      ${escapeHtml(message)}
    </li>
  `;

  showSearchResults();
}

/*
Renders the list of artists returned by the backend search route.
It also shows whether each artist can be added, is already selected, or cannot be added
because the max artist limit has been reached.
*/
function renderSearchResults(results, searchId, query) {
  if (searchId !== latestSearchId) {
    return;
  }

  if (artistSearch.value.trim() !== query) {
    return;
  }

  searchResults.innerHTML = "";

  const limitReached = hasReachedArtistLimit();

  results.forEach((artistData) => {
    const artist = {
      id: String(artistData.id),
      name: artistData.name,
      image: artistData.image || getFallbackImage(),
    };

    const alreadySelected = isAlreadySelected(artist.id);
    const cannotAdd = alreadySelected || limitReached;

    const item = document.createElement("li");

    item.className = "px-4 py-3 border-b border-white/5 last:border-0";

    let statusText = "Tap to add";
    let buttonText = "Add";

    if (alreadySelected) {
      statusText = "Already selected";
      buttonText = "Selected";
    } else if (limitReached) {
      statusText = "Limit reached";
      buttonText = "Max";
    }

    item.innerHTML = `
      <button
        type="button"
        class="w-full flex items-center justify-between gap-3 text-left ${cannotAdd ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:text-neon-green"}"
        ${cannotAdd ? "disabled" : ""}
      >
        <div class="flex items-center gap-3 min-w-0">
          <img
            src="${escapeHtml(artist.image)}"
            alt="${escapeHtml(artist.name)}"
            class="w-10 h-10 rounded-full object-cover shrink-0 bg-black/20"
          >

          <div class="min-w-0">
            <p class="text-sm font-semibold text-white truncate">${escapeHtml(artist.name)}</p>
            <p class="text-xs text-white/45">
              ${escapeHtml(statusText)}
            </p>
          </div>
        </div>

        <span class="shrink-0 text-xs font-semibold ${alreadySelected ? "text-neon-green" : "text-white/45"}">
          ${escapeHtml(buttonText)}
        </span>
      </button>
    `;

    const resultImage = item.querySelector("img");
    handleBrokenArtistImage(resultImage);

    /*
    Loads a better image for each artist result after the result is shown.
    This keeps the search list fast while still improving the image when possible.
    */
    fetch(`/api/artist-image-by-id?artist_id=${encodeURIComponent(artist.id)}`)
      .then((response) => response.json())
      .then((data) => {
        if (searchId !== latestSearchId) {
          return;
        }

        if (data.image && data.image !== FALLBACK_ARTIST_IMAGE) {
          artist.image = data.image;
          resultImage.src = data.image;
        }
      })
      .catch(() => {});

    const button = item.querySelector("button");

    if (!cannotAdd) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        addArtist(artist);
      });
    }

    searchResults.appendChild(item);
  });

  showSearchResults();
}

/*
Searches for artists using the backend artist search API.
The search is cancelled and restarted when the user keeps typing,
so old results do not appear after a newer search.
*/
async function searchArtistsFromAPI(query) {
  query = query.trim();

  if (query.length === 0) {
    hideSearchResults();
    return;
  }

  stopActiveSearch();

  const searchId = ++latestSearchId;
  activeSearchController = new AbortController();

  renderSearchMessage("Searching...");

  try {
    const response = await fetch(
      `/api/search-artists?term=${encodeURIComponent(query)}`,
      { signal: activeSearchController.signal }
    );

    const data = await response.json();

    if (searchId !== latestSearchId) {
      return;
    }

    if (artistSearch.value.trim() !== query) {
      return;
    }

    if (!response.ok) {
      renderSearchMessage("Error searching artists.", true);
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      renderSearchMessage("No artists found. Try a different spelling.");
      return;
    }

    renderSearchResults(data, searchId, query);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    if (searchId !== latestSearchId) {
      return;
    }

    console.error("Artist search failed:", error);
    renderSearchMessage("Error searching artists.", true);
  }
}

/*
Waits briefly after the user types before searching.
This avoids sending a search request for every single key press.
*/
artistSearch.addEventListener("input", function (event) {
  const query = event.target.value;

  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = setTimeout(function () {
    searchArtistsFromAPI(query);
  }, 150);
});

/*
Closes the search dropdown when the user clicks outside the search input or results box.
*/
document.addEventListener("mousedown", function (event) {
  if (!artistSearch.contains(event.target) && !searchResultsWrap.contains(event.target)) {
    hideSearchResults();
  }
});

/*
Checks the form before saving selected artists.
The clear button skips validation because the user is allowed to clear all artists.
*/
selectArtistsForm.addEventListener("submit", function (event) {
  const clickedButton = event.submitter || document.activeElement;

  if (clickedButton && clickedButton.dataset.skipValidation === "true") {
    return;
  }

  updateHiddenSelectedArtistsInput();

  if (chosenArtists.length === 0) {
    event.preventDefault();
    artistRequiredMessage.classList.remove("hidden");
    updateSaveButton();
  }
});

/*
Hides temporary status messages after a short delay.
*/
setTimeout(function () {
  const messages = document.querySelectorAll(".status-message");

  messages.forEach((message) => {
    message.classList.add("hidden");
  });
}, 2500);

/*
Initial page setup.
Loads saved artists, displays them, and updates the buttons/messages.
*/
loadInitialSelectedArtists();
renderSelectedArtists();
updateSaveButton();