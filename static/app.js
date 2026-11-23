/**
 * REVIVE — Your Wardrobe, Reimagined
 * Interactive Frontend Controller
 */

// State
const state = {
  activeTab: 'tab-wardrobe',
  weather: {
    condition: 'Sunny',
    temperature: 22,
    location: 'Cairo'
  },
  occasion: 'Casual',
  wardrobe: [],
  categoryFilter: 'All',
  searchQuery: '',
  showFavoritesOnly: false,
  canvasSlots: {
    Tops: null,
    Bottoms: null,
    Outerwear: null,
    Shoes: null
  },
  savedOutfits: [],
  planner: {},
  storeItems: [],
  pickingCategory: null
};

// DOM Elements
const el = {
  appViewport: document.getElementById('appViewport'),
  viewMobileBtn: document.getElementById('viewMobileBtn'),
  viewWebBtn: document.getElementById('viewWebBtn'),
  weatherToggleBtn: document.getElementById('weatherToggleBtn'),
  weatherDrawer: document.getElementById('weatherDrawer'),
  closeWeatherDrawer: document.getElementById('closeWeatherDrawer'),
  weatherText: document.getElementById('weatherText'),
  weatherIcon: document.getElementById('weatherIcon'),
  statusClock: document.getElementById('statusClock'),
  
  // Navigation
  navButtons: document.querySelectorAll('.nav-tab-btn'),
  tabs: document.querySelectorAll('.app-tab'),

  // Wardrobe
  wardrobeGrid: document.getElementById('wardrobeGrid'),
  wardrobeSearch: document.getElementById('wardrobeSearch'),
  catPills: document.querySelectorAll('.cat-pill'),
  filterFavsBtn: document.getElementById('filterFavsBtn'),
  resetWardrobeBtn: document.getElementById('resetWardrobeBtn'),
  statTotalItems: document.getElementById('statTotalItems'),
  statPossibleOutfits: document.getElementById('statPossibleOutfits'),
  statSustainability: document.getElementById('statSustainability'),

  // Outfits
  outfitsFeed: document.getElementById('outfitsFeed'),
  generateOutfitsBtn: document.getElementById('generateOutfitsBtn'),
  occPills: document.querySelectorAll('.occ-pill'),

  // AI Stylist
  aiStylePrompt: document.getElementById('aiStylePrompt'),
  submitStylePromptBtn: document.getElementById('submitStylePromptBtn'),
  aiPromptResult: document.getElementById('aiPromptResult'),
  promptQuickChips: document.querySelectorAll('.prompt-quick-chip'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  chatMessages: document.getElementById('chatMessages'),

  // Mix & Match
  canvasScoreNum: document.getElementById('canvasScoreNum'),
  canvasScoreFeedback: document.getElementById('canvasScoreFeedback'),
  randomizeCanvasBtn: document.getElementById('randomizeCanvasBtn'),
  saveCanvasOutfitBtn: document.getElementById('saveCanvasOutfitBtn'),
  savedOutfitsList: document.getElementById('savedOutfitsList'),

  // Store
  storeGrid: document.getElementById('storeGrid'),

  // Planner
  plannerGrid: document.getElementById('plannerGrid'),

  // Modals
  quickAddBtn: document.getElementById('quickAddBtn'),
  addClothingModal: document.getElementById('addClothingModal'),
  addClothingForm: document.getElementById('addClothingForm'),
  uploadDropzone: document.getElementById('uploadDropzone'),
  clothingFileInput: document.getElementById('clothingFileInput'),
  imagePreview: document.getElementById('imagePreview'),
  dropzonePlaceholder: document.getElementById('dropzonePlaceholder'),
  openAboutBtn: document.getElementById('openAboutBtn'),
  aboutModal: document.getElementById('aboutModal'),
  tryWithWardrobeModal: document.getElementById('tryWithWardrobeModal'),
  tryWithWardrobeContent: document.getElementById('tryWithWardrobeContent'),
  slotPickerModal: document.getElementById('slotPickerModal'),
  slotPickerTitle: document.getElementById('slotPickerTitle'),
  slotPickerGrid: document.getElementById('slotPickerGrid'),
  toastContainer: document.getElementById('toastContainer')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initDeviceToggle();
  initNavigation();
  initWeather();
  initModals();
  initWardrobe();
  initOutfits();
  initAIStylist();
  initMixMatch();
  initStore();
  initPlanner();

  // Initial Data Fetch
  fetchWardrobe();
  fetchStoreItems();
  fetchSavedOutfits();
  fetchPlanner();
  fetchSuggestions();

  lucide.createIcons();
});

// Toast notification
function showToast(message, icon = 'check') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i data-lucide="${icon}"></i> <span>${message}</span>`;
  el.toastContainer.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2600);
}

// Live Clock for Mobile Shell
function initClock() {
  function updateTime() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if (el.statusClock) el.statusClock.textContent = `${h}:${m}`;
  }
  updateTime();
  setInterval(updateTime, 30000);
}

// Device Viewport Switcher
function initDeviceToggle() {
  el.viewMobileBtn.addEventListener('click', () => {
    el.viewMobileBtn.classList.add('active');
    el.viewWebBtn.classList.remove('active');
    el.appViewport.classList.remove('web-layout');
    el.appViewport.classList.add('mobile-layout');
    showToast('Switched to Mobile App View', 'smartphone');
  });

  el.viewWebBtn.addEventListener('click', () => {
    el.viewWebBtn.classList.add('active');
    el.viewMobileBtn.classList.remove('active');
    el.appViewport.classList.remove('mobile-layout');
    el.appViewport.classList.add('web-layout');
    showToast('Switched to Full Web View', 'monitor');
  });
}

// Bottom Navigation Tabs
function initNavigation() {
  el.navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  el.navButtons.forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });
  el.tabs.forEach(tab => {
    tab.classList.toggle('active', tab.id === tabId);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Weather Simulator
function initWeather() {
  el.weatherToggleBtn.addEventListener('click', () => {
    el.weatherDrawer.classList.toggle('hidden');
    lucide.createIcons();
  });

  el.closeWeatherDrawer.addEventListener('click', () => {
    el.weatherDrawer.classList.add('hidden');
  });

  const chips = document.querySelectorAll('.weather-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const temp = parseInt(chip.getAttribute('data-temp'));
      const cond = chip.getAttribute('data-cond');
      
      state.weather.temperature = temp;
      state.weather.condition = cond;
      
      let icon = 'sun';
      if (cond === 'Rainy') icon = 'cloud-rain';
      else if (cond === 'Cold') icon = 'snowflake';
      else if (cond === 'Hot') icon = 'flame';
      
      el.weatherText.textContent = `${state.weather.location} • ${temp}°C`;
      el.weatherIcon.setAttribute('data-lucide', icon);
      lucide.createIcons();

      el.weatherDrawer.classList.add('hidden');
      showToast(`Weather updated to ${cond} (${temp}°C) — recalibrating outfits!`, 'cloud-sun');
      fetchSuggestions();
    });
  });
}

// Modals Handling
function initModals() {
  el.quickAddBtn.addEventListener('click', () => {
    el.addClothingModal.classList.remove('hidden');
    lucide.createIcons();
  });

  el.openAboutBtn.addEventListener('click', () => {
    el.aboutModal.classList.remove('hidden');
    lucide.createIcons();
  });

  document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.add('hidden');
    });
  });

  // Close modal when clicking on overlay background
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
  });
}

// ==========================================================================
// 1. Digital Wardrobe
// ==========================================================================
function initWardrobe() {
  // Category filter pills
  el.catPills.forEach(pill => {
    pill.addEventListener('click', () => {
      el.catPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.categoryFilter = pill.getAttribute('data-category');
      renderWardrobe();
    });
  });

  // Search input
  el.wardrobeSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.toLowerCase().trim();
    renderWardrobe();
  });

  // Favorite toggle
  el.filterFavsBtn.addEventListener('click', () => {
    state.showFavoritesOnly = !state.showFavoritesOnly;
    el.filterFavsBtn.classList.toggle('active', state.showFavoritesOnly);
    renderWardrobe();
  });

  // Reset demo
  el.resetWardrobeBtn.addEventListener('click', async () => {
    if (confirm('Reset wardrobe to the default curated items?')) {
      const res = await fetch('/api/wardrobe/reset', { method: 'POST' });
      if (res.ok) {
        showToast('Wardrobe reset to curated starter items', 'rotate-ccw');
        fetchWardrobe();
      }
    }
  });

  // Upload Photo Handling
  el.uploadDropzone.addEventListener('click', () => el.clothingFileInput.click());

  el.clothingFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        el.imagePreview.src = event.target.result;
        el.imagePreview.classList.remove('hidden');
        el.dropzonePlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Add Item Form Submit
  el.addClothingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const subCategory = document.getElementById('itemSubCategory').value || 'General';
    const color = document.getElementById('itemColor').value || 'Neutral';
    const style = document.getElementById('itemStyle').value;
    const file = el.clothingFileInput.files[0];
    const imageUrl = document.getElementById('clothingImageUrl').value;

    const checkedOccasions = Array.from(document.querySelectorAll('input[name="occ"]:checked')).map(c => c.value);

    try {
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', name);
        formData.append('category', category);
        formData.append('subCategory', subCategory);
        formData.append('color', color);
        formData.append('style', style);
        formData.append('occasions', checkedOccasions.join(','));
        formData.append('season', 'All Season');

        const res = await fetch('/api/wardrobe/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          showToast(`Added "${name}" to your closet!`, 'check-circle');
        }
      } else {
        const payload = {
          name,
          category,
          subCategory,
          color,
          style,
          occasions: checkedOccasions,
          season: ['All Season'],
          imageUrl: imageUrl || undefined
        };
        const res = await fetch('/api/wardrobe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Added "${name}" to your closet!`, 'check-circle');
        }
      }

      el.addClothingModal.classList.add('hidden');
      el.addClothingForm.reset();
      el.imagePreview.classList.add('hidden');
      el.dropzonePlaceholder.classList.remove('hidden');
      fetchWardrobe();
    } catch (err) {
      alert('Error uploading item: ' + err.message);
    }
  });
}

async function fetchWardrobe() {
  try {
    const res = await fetch('/api/wardrobe');
    state.wardrobe = await res.json();
    updateWardrobeStats();
    renderWardrobe();
    // If mix match slots are empty, auto-fill them
    if (!state.canvasSlots.Tops) autoAssembleCanvas();
  } catch (err) {
    console.error('Failed to fetch wardrobe', err);
  }
}

function updateWardrobeStats() {
  const count = state.wardrobe.length;
  el.statTotalItems.textContent = count;
  el.statPossibleOutfits.textContent = `${Math.max(12, count * 3)}+`;
  el.statSustainability.textContent = `${Math.min(96, 75 + Math.floor(count * 1.2))}%`;
}

function renderWardrobe() {
  let filtered = [...state.wardrobe];

  if (state.categoryFilter !== 'All') {
    filtered = filtered.filter(i => i.category.toLowerCase() === state.categoryFilter.toLowerCase());
  }

  if (state.searchQuery) {
    filtered = filtered.filter(i => 
      i.name.toLowerCase().includes(state.searchQuery) ||
      (i.color && i.color.toLowerCase().includes(state.searchQuery)) ||
      (i.style && i.style.toLowerCase().includes(state.searchQuery)) ||
      (i.subCategory && i.subCategory.toLowerCase().includes(state.searchQuery))
    );
  }

  if (state.showFavoritesOnly) {
    filtered = filtered.filter(i => i.favorite);
  }

  if (filtered.length === 0) {
    el.wardrobeGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: #9CA3AF;">
        <i data-lucide="archive" style="width: 38px; height: 38px; margin-bottom: 8px;"></i>
        <p style="font-size: 0.88rem; font-weight: 600;">No clothes found matching your criteria</p>
        <button id="addFirstItemBtn" class="action-pill-btn" style="margin-top: 10px;">+ Add New Item</button>
      </div>
    `;
    lucide.createIcons();
    const btn = document.getElementById('addFirstItemBtn');
    if (btn) btn.onclick = () => el.quickAddBtn.click();
    return;
  }

  el.wardrobeGrid.innerHTML = filtered.map(item => `
    <div class="clothing-card" data-id="${item.id}">
      <div class="card-img-wrap">
        <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'">
        <div class="card-top-badges">
          <span class="card-category-tag">${item.category}</span>
          <button class="card-fav-btn ${item.favorite ? 'active' : ''}" onclick="toggleItemFavorite('${item.id}', event)">
            <i data-lucide="heart" style="width: 14px; height: 14px; ${item.favorite ? 'fill: #EF4444; stroke: #EF4444;' : ''}"></i>
          </button>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title">${item.name}</h3>
        <div class="card-meta">
          <div class="color-dot-wrap">
            <span class="color-dot" style="background-color: ${item.colorHex || '#555'}"></span>
            <span>${item.color || 'Tone'}</span>
          </div>
          <button class="card-delete-btn" title="Remove Item" onclick="deleteItem('${item.id}', event)">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

window.toggleItemFavorite = async function(id, e) {
  e.stopPropagation();
  try {
    const res = await fetch(`/api/wardrobe/${id}/favorite`, { method: 'PATCH' });
    if (res.ok) {
      const updated = await res.json();
      const target = state.wardrobe.find(i => i.id === id);
      if (target) target.favorite = updated.favorite;
      renderWardrobe();
    }
  } catch (err) {
    console.error(err);
  }
};

window.deleteItem = async function(id, e) {
  e.stopPropagation();
  if (confirm('Delete this item from your wardrobe?')) {
    try {
      const res = await fetch(`/api/wardrobe/${id}`, { method: 'DELETE' });
      if (res.ok) {
        state.wardrobe = state.wardrobe.filter(i => i.id !== id);
        updateWardrobeStats();
        renderWardrobe();
        showToast('Item removed', 'trash-2');
      }
    } catch (err) {
      console.error(err);
    }
  }
};

// ==========================================================================
// 2. Smart Outfit Suggestions
// ==========================================================================
function initOutfits() {
  el.occPills.forEach(pill => {
    pill.addEventListener('click', () => {
      el.occPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.occasion = pill.getAttribute('data-occ');
      fetchSuggestions();
    });
  });

  el.generateOutfitsBtn.addEventListener('click', () => {
    fetchSuggestions();
    showToast('AI regenerated matching outfits!', 'sparkles');
  });
}

async function fetchSuggestions() {
  try {
    el.outfitsFeed.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF;">
        <i data-lucide="sparkles" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <p style="font-size: 0.85rem;">Revive AI is analyzing weather & matching silhouettes...</p>
      </div>
    `;
    lucide.createIcons();

    const res = await fetch('/api/outfits/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        weatherCondition: state.weather.condition,
        temperature: state.weather.temperature,
        occasion: state.occasion
      })
    });
    const data = await res.json();
    renderOutfits(data.outfits || []);
  } catch (err) {
    console.error('Failed to fetch suggestions', err);
  }
}

function renderOutfits(outfits) {
  if (!outfits || outfits.length === 0) {
    el.outfitsFeed.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF;">
        <p>No outfits could be matched with the current filter. Add more items to your closet!</p>
      </div>
    `;
    return;
  }

  el.outfitsFeed.innerHTML = outfits.map(outfit => `
    <div class="outfit-card">
      <div class="outfit-header">
        <div>
          <h3 class="outfit-title">${outfit.title}</h3>
          <span class="outfit-vibe">${outfit.vibe} • ${outfit.weatherSummary}</span>
        </div>
        <span class="compatibility-pill">${outfit.score}% Harmony</span>
      </div>

      <!-- Garments Thumbnails -->
      <div class="outfit-garments-row">
        ${outfit.items.map(i => `
          <div class="garment-mini-thumb" title="${i.name}">
            <img src="${i.imageUrl}" alt="${i.name}">
            <span class="garment-mini-name">${i.name}</span>
          </div>
        `).join('')}
      </div>

      <!-- AI Rationale -->
      <div class="outfit-rationale-box">
        <i data-lucide="sparkles" style="width: 18px; height: 18px; flex-shrink: 0; color: #B89047;"></i>
        <span>${outfit.rationale}</span>
      </div>

      <!-- Store Add-on Suggestion (Mix with New Store Items) -->
      ${outfit.storeAddon ? `
        <div class="store-addon-banner">
          <div class="store-addon-text">
            <strong>Elevate with Partner Item:</strong> Pair with the <em>${outfit.storeAddon.name}</em> (${outfit.storeAddon.brand} • ${outfit.storeAddon.price})
          </div>
          <button class="store-addon-btn" onclick="openTryWithWardrobe('${outfit.storeAddon.id}')">Try with Look</button>
        </div>
      ` : ''}

      <div class="outfit-card-actions">
        <button class="secondary-btn" onclick="saveSuggestedOutfit('${encodeURIComponent(JSON.stringify(outfit))}')">
          <i data-lucide="bookmark"></i> Save Look
        </button>
        <button class="secondary-btn" onclick="openPlanForDayModal('${encodeURIComponent(JSON.stringify(outfit))}')">
          <i data-lucide="calendar-plus"></i> Plan for Day
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

window.saveSuggestedOutfit = async function(encodedOutfit) {
  try {
    const outfit = JSON.parse(decodeURIComponent(encodedOutfit));
    const payload = {
      title: outfit.title,
      occasion: outfit.occasion,
      weatherNote: outfit.weatherSummary,
      itemIds: outfit.items.map(i => i.id),
      storeAddonId: outfit.storeAddon ? outfit.storeAddon.id : null,
      aiRationale: outfit.rationale
    };
    const res = await fetch('/api/saved-outfits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast(`Saved "${outfit.title}" to My Looks!`, 'bookmark-check');
      fetchSavedOutfits();
    }
  } catch (err) {
    console.error(err);
  }
};

window.openPlanForDayModal = function(encodedOutfit) {
  const outfit = JSON.parse(decodeURIComponent(encodedOutfit));
  const day = prompt("Which day of the week would you like to assign this outfit to?\n(Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)", "Wednesday");
  if (day) {
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const matched = validDays.find(d => d.toLowerCase() === day.trim().toLowerCase());
    if (matched) {
      assignOutfitToDay(matched, outfit);
    } else {
      alert("Please enter a valid day of the week.");
    }
  }
};

async function assignOutfitToDay(day, outfit) {
  try {
    const payload = {
      day: day,
      outfitId: outfit.id,
      outfitTitle: outfit.title,
      itemIds: outfit.items.map(i => i.id),
      notes: `${state.weather.condition} • ${state.weather.temperature}°C`
    };
    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast(`Assigned to ${day}!`, 'calendar');
      fetchPlanner();
      switchTab('tab-planner');
    }
  } catch (err) {
    console.error(err);
  }
}

// ==========================================================================
// 3. AI Style Generator & Chat
// ==========================================================================
function initAIStylist() {
  // Quick Prompt Chips
  el.promptQuickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      el.aiStylePrompt.value = chip.textContent.replace(/^[^\w]+/, '').trim();
      generateAIStyle();
    });
  });

  el.submitStylePromptBtn.addEventListener('click', generateAIStyle);

  // Chat Form Submit
  el.chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = el.chatInput.value.trim();
    if (!query) return;

    // Append user bubble
    appendChatBubble(query, 'user');
    el.chatInput.value = '';

    // Append thinking bubble
    const thinkingId = appendChatBubble('Stylist is thinking...', 'ai');

    try {
      const res = await fetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      const data = await res.json();
      
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) {
        thinkingEl.innerHTML = formatMarkdown(data.response);
      }
    } catch (err) {
      const thinkingEl = document.getElementById(thinkingId);
      if (thinkingEl) thinkingEl.textContent = 'Oops, something went wrong. Please try again!';
    }
  });
}

async function generateAIStyle() {
  const promptText = el.aiStylePrompt.value.trim();
  if (!promptText) {
    alert('Please enter a description or click one of the quick idea chips!');
    return;
  }

  el.aiPromptResult.classList.remove('hidden');
  el.aiPromptResult.innerHTML = `
    <div style="text-align: center; padding: 24px; color: #9CA3AF;">
      <i data-lucide="wand-2" class="animate-spin" style="width: 28px; height: 28px; margin-bottom: 6px;"></i>
      <p style="font-size: 0.82rem;">Generating your custom style formula...</p>
    </div>
  `;
  lucide.createIcons();

  try {
    const res = await fetch('/api/ai/generate-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: promptText,
        weatherCondition: state.weather.condition,
        temperature: state.weather.temperature
      })
    });
    const result = await res.json();
    renderAIStyleResult(result);
  } catch (err) {
    el.aiPromptResult.innerHTML = `<p style="color: red;">Failed to generate: ${err.message}</p>`;
  }
}

function renderAIStyleResult(data) {
  el.aiPromptResult.innerHTML = `
    <div class="outfit-card" style="border: 1px solid var(--gold-border); background: #FCFAF6;">
      <div class="outfit-header">
        <div>
          <span style="font-size: 0.68rem; text-transform: uppercase; color: var(--gold-primary); font-weight: 800; letter-spacing: 0.6px;">Custom AI Formula</span>
          <h3 class="outfit-title">Style: ${data.aesthetic}</h3>
        </div>
        <span class="compatibility-pill">${data.score}% Match</span>
      </div>

      <div class="outfit-garments-row">
        ${data.items.map(i => `
          <div class="garment-mini-thumb">
            <img src="${i.imageUrl}" alt="${i.name}">
            <span class="garment-mini-name">${i.name}</span>
          </div>
        `).join('')}
      </div>

      <div class="outfit-rationale-box">
        <i data-lucide="sparkles" style="width: 18px; height: 18px; flex-shrink: 0; color: #B89047;"></i>
        <span>${data.aiExplanation}</span>
      </div>

      <!-- Styling Tips Checklist -->
      <div style="background: #FFFFFF; border-radius: 8px; padding: 12px; border: 1px solid #E4E4E7;">
        <strong style="font-size: 0.78rem; display: block; margin-bottom: 6px;"><i data-lucide="check-circle-2"></i> Professional Styling Tips:</strong>
        <ul style="font-size: 0.74rem; color: #4B5563; padding-left: 18px; line-height: 1.5;">
          ${data.stylingTips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
      </div>

      ${data.storeAddon ? `
        <div class="store-addon-banner">
          <div class="store-addon-text">
            <strong>Recommended Store Addition:</strong> ${data.storeAddon.name} (${data.storeAddon.brand})
          </div>
          <button class="store-addon-btn" onclick="openTryWithWardrobe('${data.storeAddon.id}')">Try with Look</button>
        </div>
      ` : ''}

      <div class="outfit-card-actions">
        <button class="primary-gradient-btn" onclick="saveSuggestedOutfit('${encodeURIComponent(JSON.stringify({
          title: `Custom Style: ${data.aesthetic}`,
          occasion: 'AI Custom',
          weatherSummary: `${state.weather.temperature}°C`,
          items: data.items,
          rationale: data.aiExplanation,
          storeAddon: data.storeAddon
        }))}')">
          <i data-lucide="bookmark"></i> Save This Formula
        </button>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function appendChatBubble(text, sender) {
  const bubbleId = 'bubble_' + Math.random().toString(36).substring(2, 9);
  const bubble = document.createElement('div');
  bubble.id = bubbleId;
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = formatMarkdown(text);
  el.chatMessages.appendChild(bubble);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  return bubbleId;
}

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}

// ==========================================================================
// 4. Mix & Match Canvas
// ==========================================================================
function initMixMatch() {
  document.querySelectorAll('.slot-swap-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cat = btn.getAttribute('data-category');
      openSlotPicker(cat);
    });
  });

  document.querySelectorAll('.canvas-slot').forEach(slot => {
    slot.addEventListener('click', () => {
      const cat = slot.getAttribute('data-category');
      openSlotPicker(cat);
    });
  });

  el.randomizeCanvasBtn.addEventListener('click', () => {
    autoAssembleCanvas();
    showToast('Randomized outfit combinations', 'shuffle');
  });

  el.saveCanvasOutfitBtn.addEventListener('click', async () => {
    const items = Object.values(state.canvasSlots).filter(Boolean);
    if (items.length < 2) {
      alert('Please select at least a top and bottom to save an outfit!');
      return;
    }

    const title = prompt('Enter a name for this outfit:', 'Custom Mix Look');
    if (!title) return;

    try {
      const payload = {
        title,
        occasion: state.occasion,
        weatherNote: `${state.weather.condition} • ${state.weather.temperature}°C`,
        itemIds: items.map(i => i.id),
        aiRationale: `Interactive Canvas creation with ${items.map(i => i.name).join(', ')}.`
      };
      const res = await fetch('/api/saved-outfits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showToast(`Saved "${title}"!`, 'bookmark-check');
        fetchSavedOutfits();
      }
    } catch (err) {
      console.error(err);
    }
  });
}

function autoAssembleCanvas() {
  const tops = state.wardrobe.filter(i => i.category === 'Tops');
  const bottoms = state.wardrobe.filter(i => i.category === 'Bottoms');
  const outerwear = state.wardrobe.filter(i => i.category === 'Outerwear');
  const shoes = state.wardrobe.filter(i => i.category === 'Shoes');

  state.canvasSlots.Tops = tops.length ? tops[Math.floor(Math.random() * tops.length)] : null;
  state.canvasSlots.Bottoms = bottoms.length ? bottoms[Math.floor(Math.random() * bottoms.length)] : null;
  state.canvasSlots.Outerwear = (outerwear.length && Math.random() > 0.3) ? outerwear[Math.floor(Math.random() * outerwear.length)] : null;
  state.canvasSlots.Shoes = shoes.length ? shoes[Math.floor(Math.random() * shoes.length)] : null;

  renderCanvas();
}

function renderCanvas() {
  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Shoes'];
  categories.forEach(cat => {
    const item = state.canvasSlots[cat];
    const container = document.getElementById(`slotContent-${cat}`);
    if (!container) return;

    if (item) {
      container.className = 'slot-content filled';
      container.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}">
        <span class="slot-item-title">${item.name}</span>
      `;
    } else {
      container.className = 'slot-content empty';
      container.innerHTML = `
        <i data-lucide="plus" class="slot-icon"></i>
        <span>Select ${cat}</span>
      `;
    }
  });

  // Calculate live score
  const selectedCount = Object.values(state.canvasSlots).filter(Boolean).length;
  if (selectedCount >= 2) {
    const baseScore = 90 + Math.min(8, selectedCount * 2);
    el.canvasScoreNum.textContent = `${baseScore}%`;
    el.canvasScoreFeedback.textContent = 'Harmonious silhouette and balanced layering.';
  } else {
    el.canvasScoreNum.textContent = '—';
    el.canvasScoreFeedback.textContent = 'Add top and bottom to calculate harmony score.';
  }

  lucide.createIcons();
}

function openSlotPicker(category) {
  state.pickingCategory = category;
  el.slotPickerTitle.textContent = `Choose ${category}`;
  
  const items = state.wardrobe.filter(i => i.category.toLowerCase() === category.toLowerCase());

  if (items.length === 0) {
    el.slotPickerGrid.innerHTML = `<p style="padding: 20px; text-align: center; color: #9CA3AF;">No ${category} in your wardrobe yet.</p>`;
  } else {
    el.slotPickerGrid.innerHTML = items.map(i => `
      <div class="clothing-card" style="cursor: pointer;" onclick="selectSlotItem('${i.id}')">
        <div class="card-img-wrap" style="padding-top: 100%;">
          <img src="${i.imageUrl}" alt="${i.name}">
        </div>
        <div class="card-info" style="padding: 8px;">
          <h4 style="font-size: 0.78rem; font-weight: 600;">${i.name}</h4>
          <span style="font-size: 0.68rem; color: #6B7280;">${i.color || ''}</span>
        </div>
      </div>
    `).join('');
  }

  el.slotPickerModal.classList.remove('hidden');
}

window.selectSlotItem = function(itemId) {
  const item = state.wardrobe.find(i => i.id === itemId);
  if (item && state.pickingCategory) {
    state.canvasSlots[state.pickingCategory] = item;
    renderCanvas();
    el.slotPickerModal.classList.add('hidden');
    showToast(`Updated ${state.pickingCategory}`, 'check');
  }
};

async function fetchSavedOutfits() {
  try {
    const res = await fetch('/api/saved-outfits');
    state.savedOutfits = await res.json();
    renderSavedOutfits();
  } catch (err) {
    console.error(err);
  }
}

function renderSavedOutfits() {
  if (state.savedOutfits.length === 0) {
    el.savedOutfitsList.innerHTML = `<p style="font-size: 0.78rem; color: #9CA3AF; font-style: italic;">No saved outfits yet. Click "Save Look" on any outfit suggestion to bookmark it here!</p>`;
    return;
  }

  el.savedOutfitsList.innerHTML = state.savedOutfits.map(outfit => `
    <div class="outfit-card" style="padding: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong style="font-size: 0.88rem;">${outfit.title}</strong>
          <span style="font-size: 0.72rem; color: #6B7280; display: block;">${outfit.occasion} • ${outfit.createdAt}</span>
        </div>
        <button class="card-delete-btn" title="Delete" onclick="deleteSavedOutfit('${outfit.id}')">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
        </button>
      </div>
      <div class="outfit-garments-row" style="margin-top: 8px;">
        ${outfit.items.map(i => `
          <div class="garment-mini-thumb">
            <img src="${i.imageUrl}" alt="${i.name}">
            <span class="garment-mini-name">${i.name}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

window.deleteSavedOutfit = async function(id) {
  if (confirm('Remove this saved outfit?')) {
    const res = await fetch(`/api/saved-outfits/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Saved outfit removed', 'trash-2');
      fetchSavedOutfits();
    }
  }
};

// ==========================================================================
// 5. Partner Store & "Try with My Wardrobe"
// ==========================================================================
function initStore() {
  // Store items fetched on load
}

async function fetchStoreItems() {
  try {
    const res = await fetch('/api/store');
    state.storeItems = await res.json();
    renderStore();
  } catch (err) {
    console.error(err);
  }
}

function renderStore() {
  el.storeGrid.innerHTML = state.storeItems.map(item => `
    <div class="store-item-card">
      <div class="store-img-wrap">
        <img src="${item.imageUrl}" alt="${item.name}">
        <span class="store-brand-badge">${item.brand}</span>
      </div>
      <div class="store-card-body">
        <h4 class="store-card-title">${item.name}</h4>
        <div class="store-card-price">${item.price}</div>
        <p class="store-card-desc">${item.description}</p>
        <div class="store-card-actions">
          <button class="try-wardrobe-btn" onclick="openTryWithWardrobe('${item.id}')">
            <i data-lucide="sparkles"></i> Try with My Wardrobe
          </button>
          <a href="${item.shopUrl}" target="_blank" rel="noopener noreferrer" class="buy-partner-link">
            Buy on ${item.brand} <i data-lucide="external-link"></i>
          </a>
        </div>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

window.openTryWithWardrobe = async function(storeItemId) {
  try {
    el.tryWithWardrobeModal.classList.remove('hidden');
    el.tryWithWardrobeContent.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #9CA3AF;">
        <i data-lucide="sparkles" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 8px;"></i>
        <p>REVIVE AI is cross-referencing your closet with this store item...</p>
      </div>
    `;
    lucide.createIcons();

    const res = await fetch(`/api/mix-match/try-store-item/${storeItemId}`, { method: 'POST' });
    const data = await res.json();
    renderTryWithWardrobeResult(data);
  } catch (err) {
    el.tryWithWardrobeContent.innerHTML = `<p style="color: red;">Failed to calculate pairings: ${err.message}</p>`;
  }
};

function renderTryWithWardrobeResult(data) {
  el.tryWithWardrobeContent.innerHTML = `
    <!-- Top Value Summary -->
    <div style="background: var(--gold-light); border: 1px solid var(--gold-border); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <strong style="color: #78350F; font-size: 0.95rem;">Smart Purchase Analysis</strong>
        <span class="compatibility-pill" style="font-size: 0.8rem;">${data.wardrobeUtilityScore}% Closet Utility</span>
      </div>
      <p style="font-size: 0.8rem; color: #92400E; line-height: 1.45;">
        ${data.summary}
      </p>
    </div>

    <!-- Suggested Outfits Blending Existing Clothes with the New Item -->
    <h4 style="font-family: var(--font-serif); font-size: 1.1rem; margin-bottom: 12px;">
      How to Style with Clothes You Already Own:
    </h4>

    <div style="display: flex; flex-direction: column; gap: 14px;">
      ${data.synergies.map(syn => `
        <div class="outfit-card" style="padding: 14px; background: #FFFFFF;">
          <div class="outfit-header">
            <strong>${syn.title}</strong>
            <span class="compatibility-pill">${syn.compatibilityScore}% Synergy</span>
          </div>

          <div class="outfit-garments-row" style="margin-top: 8px;">
            <!-- Store Item (Highlighted) -->
            <div class="garment-mini-thumb" style="border: 2px solid var(--gold-primary);">
              <img src="${syn.storeItem.imageUrl}" alt="${syn.storeItem.name}">
              <span class="garment-mini-name" style="color: var(--gold-primary); font-weight: 800;">${syn.storeItem.brand} (New)</span>
            </div>
            <!-- Wardrobe items -->
            ${syn.wardrobeItems.map(w => `
              <div class="garment-mini-thumb">
                <img src="${w.imageUrl}" alt="${w.name}">
                <span class="garment-mini-name">${w.name} (Yours)</span>
              </div>
            `).join('')}
          </div>

          <p style="font-size: 0.76rem; color: #4B5563; margin-top: 8px; line-height: 1.4;">
            ${syn.notes}
          </p>
        </div>
      `).join('')}
    </div>

    <div style="margin-top: 18px; text-align: center;">
      <a href="${data.storeItem.shopUrl}" target="_blank" rel="noopener noreferrer" class="primary-gradient-btn" style="text-decoration: none;">
        Proceed to ${data.storeItem.brand} (${data.storeItem.price}) <i data-lucide="external-link"></i>
      </a>
    </div>
  `;
  lucide.createIcons();
}

// ==========================================================================
// 6. Weekly Outfit Planner
// ==========================================================================
function initPlanner() {
  // Planner initialized
}

async function fetchPlanner() {
  try {
    const res = await fetch('/api/planner');
    state.planner = await res.json();
    renderPlanner();
  } catch (err) {
    console.error(err);
  }
}

function renderPlanner() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  el.plannerGrid.innerHTML = days.map(day => {
    const plan = state.planner[day];
    return `
      <div class="planner-day-card">
        <div class="planner-day-header">
          <span class="day-name">${day}</span>
          <span class="day-badge">${plan ? 'Planned' : 'Not Scheduled'}</span>
        </div>
        <div class="planner-day-content">
          ${plan ? `
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="outfit-garments-row" style="grid-template-columns: repeat(3, 40px); gap: 4px;">
                ${plan.items.slice(0, 3).map(i => `
                  <div class="garment-mini-thumb" style="height: 40px;">
                    <img src="${i.imageUrl}" alt="${i.name}" style="height: 40px;">
                  </div>
                `).join('')}
              </div>
              <div>
                <strong style="font-size: 0.82rem; display: block;">${plan.outfitTitle}</strong>
                <span style="font-size: 0.72rem; color: #6B7280;">${plan.notes || ''}</span>
              </div>
            </div>
          ` : `
            <span class="planner-empty-state">No outfit planned yet</span>
          `}
        </div>
        <div>
          <button class="secondary-btn" style="padding: 6px 12px; font-size: 0.74rem;" onclick="switchTab('tab-outfits')">
            ${plan ? 'Change' : '+ Plan'}
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}
