const artists = [
    { name: "Drake", image: "https://upload.wikimedia.org/wikipedia/commons/9/90/Drake_in_2016.jpg" },
    { name: "John Mayer", image: "https://upload.wikimedia.org/wikipedia/commons/3/30/John_Mayer_2010.jpg" },
    { name: "Kanye West", image: "https://upload.wikimedia.org/wikipedia/commons/4/45/Kanye_West_at_the_2009_Tribeca_Film_Festival.jpg" },
    { name: "Playboi Carti", image: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Playboi_Carti_2016.jpg" }
  ];
  
  const searchResults = document.getElementById("searchResults");
  const selectedArtists = document.getElementById("selectedArtists");
  const artistSearch = document.getElementById("artistSearch");
  
  function renderSearchResults() {
    const searchText = artistSearch.value.toLowerCase();
    searchResults.innerHTML = "";
  
    const filtered = artists.filter(artist =>
      artist.name.toLowerCase().includes(searchText)
    );
  
    filtered.forEach(artist => {
      const card = document.createElement("div");
      card.className = "bg-white text-black rounded-3xl p-4 flex items-center gap-4";
  
      card.innerHTML = `
        <img src="${artist.image}" alt="${artist.name}" class="w-16 h-16 rounded-2xl object-cover">
        <span class="text-3xl font-bold">${artist.name}</span>
      `;
  
      searchResults.appendChild(card);
    });
  }
  
  artistSearch.addEventListener("input", renderSearchResults);
  
  renderSearchResults();