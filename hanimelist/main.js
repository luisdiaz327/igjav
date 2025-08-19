let animeData = [];
let savedSet = new Set(JSON.parse(localStorage.getItem('savedAnimes') || '[]'));
let animeStatus = JSON.parse(localStorage.getItem('animeStatus') || '{}');
let currentPage = 1;
const perPage = 9;
const maxVisibleButtons = 1;
let currentChunk = 0;
let showSavedOnly = false;
let currentSearch = '';
let currentFilter = 'all';

const container = document.getElementById('anime-list');
const paginationEl = document.getElementById('pagination');

// Status constants
const STATUSES = {
  WATCHING: 'watching',
  COMPLETED: 'completed',
  PLAN_TO_WATCH: 'plan_to_watch',
  DROPPED: 'dropped'
};

const STATUS_LABELS = {
  [STATUSES.WATCHING]: 'Watching',
  [STATUSES.COMPLETED]: 'Completed',
  [STATUSES.PLAN_TO_WATCH]: 'Plan to Watch',
  [STATUSES.DROPPED]: 'Dropped'
};

const STATUS_COLORS = {
  [STATUSES.WATCHING]: '#ff4081',
  [STATUSES.COMPLETED]: '#4caf50',
  [STATUSES.PLAN_TO_WATCH]: '#2196f3',
  [STATUSES.DROPPED]: '#f44336'
};

function updateStats() {
  const stats = {
    total: Object.keys(animeStatus).length,
    watching: 0,
    completed: 0,
    plan_to_watch: 0,
    dropped: 0
  };

  Object.values(animeStatus).forEach(status => {
    if (stats.hasOwnProperty(status)) {
      stats[status]++;
    }
  });

  document.getElementById('totalCount').textContent = stats.total;
  document.getElementById('watchingCount').textContent = stats.watching;
  document.getElementById('completedCount').textContent = stats.completed;
  document.getElementById('planCount').textContent = stats.plan_to_watch;
  document.getElementById('droppedCount').textContent = stats.dropped;
}

function createCard(anime) {
  const card = document.createElement('div');
  card.className = 'card';

  const isSaved = savedSet.has(anime.downloadOne);
  const currentStatus = animeStatus[anime.downloadOne] || null;

  card.innerHTML = `
    <button class="save-btn ${isSaved ? 'saved' : ''}">${isSaved ? '💾' : '💾'}</button>
    ${currentStatus ? `<div class="status-indicator" style="background: ${STATUS_COLORS[currentStatus]}">${STATUS_LABELS[currentStatus]}</div>` : ''}
    <img src="${anime.Img}" alt="${anime.videoTitle}" loading="lazy">
    <div class="card-overlay">
      <div class="card-title">${anime.videoTitle}</div>
      <div class="card-actress">${anime.actressName}</div>
      <a href="${anime.downloadOne}" target="_blank" class="card-link">Watch Now</a>
    </div>
    <div class="status-menu">
      <button class="status-btn ${currentStatus === STATUSES.WATCHING ? 'active' : ''}" data-status="${STATUSES.WATCHING}">📺 Watching</button>
      <button class="status-btn ${currentStatus === STATUSES.COMPLETED ? 'active' : ''}" data-status="${STATUSES.COMPLETED}">✅ Completed</button>
      <button class="status-btn ${currentStatus === STATUSES.PLAN_TO_WATCH ? 'active' : ''}" data-status="${STATUSES.PLAN_TO_WATCH}">📋 Plan to Watch</button>
      <button class="status-btn ${currentStatus === STATUSES.DROPPED ? 'active' : ''}" data-status="${STATUSES.DROPPED}">❌ Dropped</button>
      ${currentStatus ? '<button class="status-btn" data-status="remove">🗑️ Remove</button>' : ''}
    </div>
  `;

  const saveBtn = card.querySelector('.save-btn');
  const statusMenu = card.querySelector('.status-menu');
  const statusBtns = card.querySelectorAll('.status-btn');

  // Save button functionality
  saveBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (savedSet.has(anime.downloadOne)) {
      savedSet.delete(anime.downloadOne);
      this.classList.remove('saved');
    } else {
      savedSet.add(anime.downloadOne);
      this.classList.add('saved');
    }
    localStorage.setItem('savedAnimes', JSON.stringify([...savedSet]));
    
    if (showSavedOnly) {
      renderPage();
    }
  };

  // Status menu functionality
  card.addEventListener('click', function(e) {
    if (!e.target.classList.contains('save-btn') && !e.target.classList.contains('status-btn')) {
      statusMenu.classList.toggle('show');
    }
  });

  statusBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const status = this.dataset.status;
      
      if (status === 'remove') {
        delete animeStatus[anime.downloadOne];
      } else {
        animeStatus[anime.downloadOne] = status;
      }
      
      localStorage.setItem('animeStatus', JSON.stringify(animeStatus));
      updateStats();
      renderPage();
    });
  });

  // Close status menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!card.contains(e.target)) {
      statusMenu.classList.remove('show');
    }
  });

  // Touch device support
  if ('ontouchstart' in window) {
    card.addEventListener('touchstart', function(e) {
      if (!e.target.classList.contains('save-btn') && !e.target.classList.contains('status-btn')) {
        this.classList.toggle('show-overlay');
      }
    });

    document.addEventListener('touchstart', function(e) {
      if (!card.contains(e.target)) {
        card.classList.remove('show-overlay');
      }
    });
  }

  return card;
}

function getFilteredData() {
  let filtered = animeData;

  // Apply search filter
  if (currentSearch.trim() !== '') {
    filtered = filtered.filter(anime =>
      anime.postNumber.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }

  // Apply status filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(anime => animeStatus[anime.downloadOne] === currentFilter);
  }

  // Apply saved filter
  if (showSavedOnly) {
    filtered = filtered.filter(anime => savedSet.has(anime.downloadOne));
  }

  return filtered;
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / perPage);
  const totalChunks = Math.ceil(totalPages / maxVisibleButtons);

  const startPage = currentChunk * maxVisibleButtons + 1;
  const endPage = Math.min(startPage + maxVisibleButtons - 1, totalPages);

  paginationEl.innerHTML = '';

  if (totalPages <= 1) return;

  // Prev Chunk Button
  if (currentChunk > 0) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '← Prev';
    prevBtn.onclick = () => {
      currentChunk--;
      currentPage = currentChunk * maxVisibleButtons + 1;
      renderPage();
    };
    paginationEl.appendChild(prevBtn);
  }

  // Page Buttons
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.classList.toggle('active', i === currentPage);
    btn.onclick = () => {
      currentPage = i;
      renderPage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    paginationEl.appendChild(btn);
  }

  // Next Chunk Button
  if (currentChunk < totalChunks - 1) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next →';
    nextBtn.onclick = () => {
      currentChunk++;
      currentPage = currentChunk * maxVisibleButtons + 1;
      renderPage();
    };
    paginationEl.appendChild(nextBtn);
  }
}

function renderPage() {
  const filtered = getFilteredData();
  const totalPages = Math.ceil(filtered.length / perPage);
  const totalChunks = Math.ceil(totalPages / maxVisibleButtons);

  // Keep chunk in bounds
  if (currentPage > totalPages && totalPages > 0) currentPage = 1;
  currentChunk = Math.floor((currentPage - 1) / maxVisibleButtons);

  const start = (currentPage - 1) * perPage;
  const pageData = filtered.slice(start, start + perPage);

  container.innerHTML = '';
  
  if (pageData.length === 0) {
    container.innerHTML = '<div class="error">No post found matching your criteria.</div>';
    paginationEl.innerHTML = '';
    return;
  }

  pageData.forEach(anime => {
    container.appendChild(createCard(anime));
  });

  renderPagination(filtered.length);
}

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById(`show${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// Initialize the application
function init() {
  // Show loading state
  container.innerHTML = '<div class="loading">Loading Post list...</div>';

  // Fetch anime data
  fetch('https://raw.githubusercontent.com/luisdiaz327/igcode/refs/heads/main/data.json')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      animeData = data;
      updateStats();
      renderPage();
    })
    .catch(err => {
      console.error('Failed to fetch:', err);
      container.innerHTML = '<div class="error">⚠️ Failed to load content. Please try again later.</div>';
    });

  // Search functionality
  let searchTimeout;
  document.getElementById('searchBar').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      currentPage = 1;
      currentChunk = 0;
      renderPage();
    }, 300);
  });

  // Filter buttons
  document.getElementById('showAll').addEventListener('click', () => {
    currentFilter = 'all';
    currentPage = 1;
    currentChunk = 0;
    updateFilterButtons();
    renderPage();
  });

  document.getElementById('showWatching').addEventListener('click', () => {
    currentFilter = STATUSES.WATCHING;
    currentPage = 1;
    currentChunk = 0;
    updateFilterButtons();
    renderPage();
  });

  document.getElementById('showCompleted').addEventListener('click', () => {
    currentFilter = STATUSES.COMPLETED;
    currentPage = 1;
    currentChunk = 0;
    updateFilterButtons();
    renderPage();
  });

  document.getElementById('showPlanToWatch').addEventListener('click', () => {
    currentFilter = STATUSES.PLAN_TO_WATCH;
    currentPage = 1;
    currentChunk = 0;
    updateFilterButtons();
    renderPage();
  });

  document.getElementById('showDropped').addEventListener('click', () => {
    currentFilter = STATUSES.DROPPED;
    currentPage = 1;
    currentChunk = 0;
    updateFilterButtons();
    renderPage();
  });

  // Toggle Saved
  document.getElementById('toggleSaved').addEventListener('click', () => {
    showSavedOnly = !showSavedOnly;
    document.getElementById('toggleSaved').textContent = showSavedOnly ? 'Show All' : 'Show Saved Only';
    currentPage = 1;
    currentChunk = 0;
    renderPage();
  });

  // Handle orientation change on mobile
  window.addEventListener('orientationchange', () => {
    setTimeout(renderPage, 100);
  });
}

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.add('open');
});

document.getElementById('closeSidebar').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.remove('open');
});

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
  }
});


// Start the application
init();