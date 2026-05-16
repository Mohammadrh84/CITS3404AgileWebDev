let players = [];
let currentSort = "points";
var Current_Username = null;

/*
Formats numbers so large scores are easier to read on the leaderboard.
*/
function formatNumber(number) {
  return Number(number || 0).toLocaleString();
}

/*
Escapes player names before adding them into HTML.
This helps prevent names with special characters from breaking the page.
*/
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/*
Gets the player's display name.
If the name is missing, a default name is shown instead.
*/
function getPlayerName(player) {
  return String(player.name || "Unknown player");
}

/*
Filters players by the search box and sorts them using the selected sort option.
*/
function getVisiblePlayers(searchInput) {
  const searchText = searchInput.value.toLowerCase();

  let filteredPlayers = players.filter(function (player) {
    return getPlayerName(player).toLowerCase().includes(searchText);
  });

  filteredPlayers.sort(function (a, b) {
    if (currentSort === "streak") {
      return (b.streak || 0) - (a.streak || 0);
    }

    if (currentSort === "accuracy") {
      return (b.accuracy || 0) - (a.accuracy || 0);
    }

    return (b.points || 0) - (a.points || 0);
  });

  return filteredPlayers;
}

/*
Returns all players sorted by points.
This is used for the podium so the top 3 are always based on score.
*/
function getGlobalTopPlayers() {
  const globalPlayers = [...players];

  globalPlayers.sort(function (a, b) {
    return (b.points || 0) - (a.points || 0);
  });

  return globalPlayers;
}

/*
Updates the summary boxes above the leaderboard.
*/
function updateStats(playerList, elements) {
  if (playerList.length === 0) {
    elements.totalPlayersStat.textContent = "0";
    elements.topScoreStat.textContent = "0";
    elements.bestStreakStat.textContent = "0";
    elements.avgAccuracyStat.textContent = "0%";
    return;
  }

  elements.totalPlayersStat.textContent = playerList.length;
  elements.topScoreStat.textContent = formatNumber(playerList[0].points);

  const maxStreak = Math.max(...playerList.map(player => player.streak || 0));
  elements.bestStreakStat.textContent = formatNumber(maxStreak);

  let totalAccuracy = 0;

  for (let player of playerList) {
    totalAccuracy += player.accuracy || 0;
  }

  const averageAccuracy = Math.round(totalAccuracy / playerList.length);
  elements.avgAccuracyStat.textContent = averageAccuracy + "%";
}

/*
Displays the top 3 players as podium cards.
*/
function updatePodium(playerList, podiumSection) {
  const topThree = playerList.slice(0, 3);
  podiumSection.innerHTML = "";

  if (topThree.length === 0) {
    podiumSection.innerHTML = `
      <div class="rounded-[24px] border border-white/10 bg-white/5 p-5 md:col-span-3">
        <p class="text-sm text-white/60">No leaderboard data yet. Play a game to create the first score.</p>
      </div>
    `;
    return;
  }

  topThree.forEach(function (player, index) {
    const safeName = escapeHtml(getPlayerName(player));

    const card = document.createElement("div");
    card.className = "rounded-[24px] border border-white/10 bg-white/5 p-5";

    card.innerHTML = `
      <p class="text-xs uppercase tracking-[0.22em] text-white/45">Top ${index + 1}</p>
      <h3 class="mt-3 text-2xl font-bold">${safeName}</h3>
      <p class="mt-2 text-neon-green font-semibold">${formatNumber(player.points)} points</p>
      <p class="mt-1 text-sm text-white/60">${formatNumber(player.streak)} streak</p>
    `;

    podiumSection.appendChild(card);
  });
}

/*
Shows the current user's leaderboard stats.
If the current user is not found in the leaderboard data, a sign-in message is shown.
*/
function updatePlayerDetail(playerList, playerDetail) {
  if (playerList.length === 0) {
    playerDetail.innerHTML = `<p class="text-sm text-white/60">No players found.</p>`;
    return;
  }

  var currentPlayer = null;

  for (var i = 0; i < players.length; i++) {
    if (getPlayerName(players[i]) === Current_Username) {
      currentPlayer = players[i];
      break;
    }
  }

  if (currentPlayer === null) {
    playerDetail.innerHTML = `<p class="text-sm text-white/60">Sign in to see your statistics.</p>`;
    return;
  }

  const safeName = escapeHtml(getPlayerName(currentPlayer));

  playerDetail.innerHTML = `
    <p class="text-xs uppercase tracking-[0.25em] text-neon-green/80">Your statistics</p>
    <h3 class="mt-3 text-2xl font-bold">${safeName}</h3>
    <p class="mt-2 text-white/70">
      ${formatNumber(currentPlayer.points)} points · ${formatNumber(currentPlayer.streak)} streak · ${currentPlayer.accuracy}% accuracy
    </p>
  `;
}

/*
Renders the desktop leaderboard table.
*/
function updateTable(playerList, tableBody) {
  tableBody.innerHTML = "";

  if (playerList.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="rounded-2xl px-4 py-6 text-center text-white/60 bg-white/5">
          No players found.
        </td>
      </tr>
    `;
    return;
  }

  playerList.forEach(function (player, index) {
    const safeName = escapeHtml(getPlayerName(player));

    const row = document.createElement("tr");
    row.className = "bg-white/5 hover:bg-white/10 transition";

    row.innerHTML = `
      <td class="rounded-l-2xl px-4 py-4 font-bold">${index + 1}</td>
      <td class="px-4 py-4 font-semibold">${safeName}</td>
      <td class="px-4 py-4">${formatNumber(player.points)}</td>
      <td class="px-4 py-4">${formatNumber(player.streak)}</td>
      <td class="px-4 py-4">${player.accuracy}%</td>
      <td class="px-4 py-4">${formatNumber(player.games)}</td>
      <td class="rounded-r-2xl px-4 py-4">${player.avgHints}</td>
    `;

    tableBody.appendChild(row);
  });
}

/*
Renders the mobile leaderboard cards.
*/
function updateCards(playerList, cardsContainer) {
  cardsContainer.innerHTML = "";

  if (playerList.length === 0) {
    cardsContainer.innerHTML = `
      <div class="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
        No players found.
      </div>
    `;
    return;
  }

  playerList.forEach(function (player, index) {
    const safeName = escapeHtml(getPlayerName(player));

    const card = document.createElement("div");
    card.className = "rounded-2xl border border-white/10 bg-white/5 p-4";

    card.innerHTML = `
      <p class="text-xs uppercase tracking-[0.2em] text-white/45">#${index + 1}</p>
      <h3 class="mt-2 text-xl font-bold">${safeName}</h3>
      <p class="mt-2 text-neon-green font-semibold">${formatNumber(player.points)} points</p>
      <p class="mt-1 text-sm text-white/60">${formatNumber(player.streak)} streak · ${player.accuracy}% accuracy</p>
    `;

    cardsContainer.appendChild(card);
  });
}

/*
Updates all leaderboard sections using the latest player list.
*/
function renderLeaderboard(elements) {
  const visiblePlayers = getVisiblePlayers(elements.searchInput);
  const globalTopPlayers = getGlobalTopPlayers();

  updateStats(visiblePlayers, elements);
  updatePodium(globalTopPlayers, elements.podiumSection);
  updatePlayerDetail(visiblePlayers, elements.playerDetail);
  updateTable(visiblePlayers, elements.tableBody);
  updateCards(visiblePlayers, elements.cardsContainer);
}

/*
Loads leaderboard data and the current logged-in user from the backend.
*/
async function loadLeaderboard(elements) {
  try {
    const response = await fetch('/api/leaderboard');
    players = await response.json();

    if (!Array.isArray(players)) {
      players = [];
    }

    const currentUserResponse = await fetch('/api/current-user');
    const currentUserData = await currentUserResponse.json();
    Current_Username = currentUserData.username;

    renderLeaderboard(elements);
  } catch (error) {
    console.error("Could not load leaderboard:", error);
    players = [];
    renderLeaderboard(elements);
  }
}

/*
Sets up the leaderboard page after it loads.
Search and sort changes re-render the leaderboard.
*/
document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    totalPlayersStat: document.getElementById("totalPlayersStat"),
    topScoreStat: document.getElementById("topScoreStat"),
    bestStreakStat: document.getElementById("bestStreakStat"),
    avgAccuracyStat: document.getElementById("avgAccuracyStat"),
    podiumSection: document.getElementById("podiumSection"),
    tableBody: document.getElementById("leaderboardTableBody"),
    cardsContainer: document.getElementById("leaderboardCards"),
    playerDetail: document.getElementById("playerDetail"),
    searchInput: document.getElementById("searchInput"),
    sortSelect: document.getElementById("sortSelect")
  };

  elements.searchInput.addEventListener("input", function () {
    renderLeaderboard(elements);
  });

  elements.sortSelect.addEventListener("change", function () {
    currentSort = elements.sortSelect.value;
    renderLeaderboard(elements);
  });

  loadLeaderboard(elements);
});