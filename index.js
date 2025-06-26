document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const searchInput = document.getElementById('searchTerm');
  const mediaSelect = document.getElementById('mediaType');
  const resultsList = document.getElementById('resultsList');
  const favoritesList = document.getElementById('favoritesList');
  const themeBtn = document.getElementById('toggleTheme');
  const showFavoritesBtn = document.getElementById('showFavorites');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const resultsCount = document.getElementById('resultsCount');
  const favoritesCount = document.getElementById('favoritesCount');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const favoritesView = document.getElementById('favoritesView');

  // State
  let allResults = [];
  let filteredResults = [];
  let favorites = [];
  let currentFilter = 'all';
  let showingFavorites = false;

  // Initialize app
  loadFavorites();
  loadUserPreferences();
  updateStats();

  // API Functions
  async function searchItunes(term, media) {
    try {
      showLoading(true);
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=${media}&limit=50`;
      const response = await fetch(url);
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    } finally {
      showLoading(false);
    }
  }

  function loadFavorites() {
    try {
      const stored = localStorage.getItem('musicAppFavorites');
      favorites = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load favorites:', error);
      favorites = [];
    }
  }

  function saveFavorite(track) {
    try {
      const trackWithId = { ...track, id: Date.now() };
      favorites.push(trackWithId);
      localStorage.setItem('musicAppFavorites', JSON.stringify(favorites));
      updateStats();
    } catch (error) {
      console.error('Failed to save favorite:', error);
    }
  }

  function removeFavorite(trackId) {
    try {
      favorites = favorites.filter(f => f.trackId !== trackId);
      localStorage.setItem('musicAppFavorites', JSON.stringify(favorites));
      updateStats();
      if (showingFavorites) renderFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }

  function loadUserPreferences() {
    try {
      const stored = localStorage.getItem('musicAppPreferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        if (prefs.theme === 'light') {
          document.body.classList.add('light');
        }
        mediaSelect.value = prefs.defaultMedia || 'music';
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }

  function saveUserPreferences() {
    try {
      const prefs = {
        theme: document.body.classList.contains('light') ? 'light' : 'dark',
        defaultMedia: mediaSelect.value
      };
      localStorage.setItem('musicAppPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  }

  // Utility Functions
  function showLoading(show) {
    loadingSpinner.classList.toggle('hidden', !show);
  }

  function updateStats() {
    resultsCount.textContent = `${filteredResults.length} results`;
    favoritesCount.textContent = `${Array.isArray(favorites) ? favorites.length : 0} favorites`;
  }

  function isFavorited(trackId) {
    return Array.isArray(favorites) && favorites.some(f => f.trackId === trackId);
  }

  function getTrackType(item) {
    if (item.wrapperType === 'track') return 'song';
    if (item.wrapperType === 'collection') return 'album';
    if (item.wrapperType === 'artist') return 'artist';
    return 'other';
  }

  // Filter Functions
  function applyFilter(filter) {
    if (filter === 'all') {
      filteredResults = [...allResults];
    } else {
      filteredResults = allResults.filter(item => getTrackType(item) === filter);
    }
    renderResults(filteredResults);
    updateStats();
  }

  // Render Functions
  function renderResults(results) {
    resultsList.innerHTML = '';
    results.forEach(item => {
      const li = createTrackElement(item);
      resultsList.appendChild(li);
    });
  }

  function renderFavorites() {
    favoritesList.innerHTML = '';
    if (Array.isArray(favorites)) {
      favorites.forEach(item => {
        const li = createTrackElement(item, true);
        favoritesList.appendChild(li);
      });
    }
  }

  function createTrackElement(item, isFavoritesView = false) {
    const li = document.createElement('li');
    const trackName = item.trackName || item.collectionName || item.artistName;
    const artistName = item.artistName || 'Unknown Artist';
    const genre = item.primaryGenreName || '';
    const artwork = item.artworkUrl100 || item.artworkUrl60 || '';
    const isFav = isFavorited(item.trackId);

    li.innerHTML = `
      <img src="${artwork}" alt="cover" onerror="this.style.display='none'">
      <div class="track-info">
        <strong>${trackName}</strong>
        <span>${artistName}</span>
        <small>${genre}</small>
      </div>
      <button class="favorite-btn ${isFav ? 'favorited' : ''}" data-track-id="${item.trackId}">
        ${isFav ? '❤️' : '🤍'}
      </button>
    `;

    return li;
  }

  // Event Listeners (7 distinct types)

  // 1. Input Event - Search functionality
  searchInput.addEventListener('input', debounce(async (e) => {
    const term = e.target.value.trim();
    if (term.length < 2) {
      allResults = [];
      filteredResults = [];
      renderResults([]);
      updateStats();
      return;
    }
    
    allResults = await searchItunes(term, mediaSelect.value);
    applyFilter(currentFilter);
  }, 500));

  // 2. Change Event - Media type selection
  mediaSelect.addEventListener('change', async () => {
    const term = searchInput.value.trim();
    if (!term) return;
    
    allResults = await searchItunes(term, mediaSelect.value);
    applyFilter(currentFilter);
    saveUserPreferences();
  });

  // 3. Click Event - Theme toggle
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    saveUserPreferences();
  });

  // 4. Click Event - Show favorites toggle
  showFavoritesBtn.addEventListener('click', () => {
    showingFavorites = !showingFavorites;
    
    if (showingFavorites) {
      resultsList.parentElement.style.display = 'none';
      favoritesView.classList.remove('hidden');
      showFavoritesBtn.textContent = '🔍 Search';
      renderFavorites();
    } else {
      resultsList.parentElement.style.display = 'block';
      favoritesView.classList.add('hidden');
      showFavoritesBtn.textContent = '❤️ Favorites';
    }
  });

  // 5. Click Event - Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      applyFilter(currentFilter);
    });
  });

  // 6. Click Event - Favorite/Unfavorite (Event Delegation)
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('favorite-btn')) {
      const trackId = parseInt(e.target.dataset.trackId);
      const track = [...allResults, ...favorites].find(t => t.trackId === trackId);
      
      if (isFavorited(trackId)) {
        removeFavorite(trackId);
        e.target.textContent = '🤍';
        e.target.classList.remove('favorited');
      } else {
        saveFavorite(track);
        e.target.textContent = '❤️';
        e.target.classList.add('favorited');
      }
    }
  });

  // 7. Keydown Event - Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch(e.key) {
        case 'k':
          e.preventDefault();
          searchInput.focus();
          break;
        case 'f':
          e.preventDefault();
          showFavoritesBtn.click();
          break;
        case 't':
          e.preventDefault();
          themeBtn.click();
          break;
      }
    }
    
    // Reverse results with 'R' key
    if (e.key === 'r' || e.key === 'R') {
      if (!showingFavorites && filteredResults.length > 0) {
        filteredResults.reverse();
        renderResults(filteredResults);
      }
    }
  });

  // Utility function for debouncing
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Array iteration examples using various methods
  function getTopGenres() {
    return allResults
      .map(item => item.primaryGenreName)
      .filter(genre => genre && genre.trim())
      .reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});
  }

  function getArtistSummary() {
    return allResults
      .filter(item => item.artistName)
      .map(item => ({
        artist: item.artistName,
        trackCount: allResults.filter(r => r.artistName === item.artistName).length
      }))
      .reduce((acc, curr) => {
        if (!acc.find(a => a.artist === curr.artist)) {
          acc.push(curr);
        }
        return acc;
      }, [])
      .sort((a, b) => b.trackCount - a.trackCount);
  }
});