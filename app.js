/**
 * Media Literacy & Critical Discourse Analysis Web App
 * Core Application Router, State Manager & View Controller
 */

// Application State
const state = {
  curriculum: null,
  currentWeekNumber: 1,
  currentViewMode: 'teacher', // 'teacher' or 'student'
  activeTab: 'guide', // 'guide', 'worksheet', or 'media'
};

// DOM Element Registry
const elements = {
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  sidebar: document.getElementById('app-sidebar'),
  sidebarBackdrop: document.getElementById('sidebar-backdrop'),
  navWeekList: document.getElementById('nav-week-list'),
  navToolWorksheets: document.getElementById('nav-tool-worksheets'),
  navToolMediaGallery: document.getElementById('nav-tool-mediagallery'),
  btnViewTeacher: document.getElementById('btn-view-teacher'),
  btnViewStudent: document.getElementById('btn-view-student'),
  btnFullSlideMode: document.getElementById('btn-full-slide-mode'),
  contentContainer: document.getElementById('content-container'),
  mediaModal: document.getElementById('media-modal'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  modalCardTitle: document.getElementById('modal-card-title'),
  modalCardBadge: document.getElementById('modal-card-badge'),
  modalCardImage: document.getElementById('modal-card-image'),
  modalCardDomain: document.getElementById('modal-card-domain'),
  modalCardAuthor: document.getElementById('modal-card-author'),
  modalCardType: document.getElementById('modal-card-type'),
  modalCardTrust: document.getElementById('modal-card-trust'),
  modalCardDesc: document.getElementById('modal-card-desc'),
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadCurriculumData();
  renderSidebarNav();
  renderCurrentWeek();
});

// Setup Event Listeners
function setupEventListeners() {
  // Mobile Sidebar Toggles
  elements.mobileMenuToggle.addEventListener('click', toggleMobileSidebar);
  elements.sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // View Mode Switches
  elements.btnViewTeacher.addEventListener('click', () => setViewMode('teacher'));
  elements.btnViewStudent.addEventListener('click', () => setViewMode('student'));

  // Tool Navigation
  elements.navToolWorksheets.addEventListener('click', () => {
    closeMobileSidebar();
    if (window.MatrixTool) {
      window.MatrixTool.renderAllWorksheetsView(state.curriculum);
    }
  });

  elements.navToolMediaGallery.addEventListener('click', () => {
    closeMobileSidebar();
    renderMediaCardVaultView();
  });

  // Slide Deck Presentation Launcher
  elements.btnFullSlideMode.addEventListener('click', () => {
    if (window.SlideViewer) {
      const currentWeek = getCurrentWeekData();
      window.SlideViewer.launch(currentWeek.slides, currentWeek.title);
    }
  });

  // Modal Controls
  elements.modalCloseBtn.addEventListener('click', closeMediaModal);
  elements.mediaModal.addEventListener('click', (e) => {
    if (e.target === elements.mediaModal) closeMediaModal();
  });
}

// Fetch Curriculum Data
async function loadCurriculumData() {
  try {
    // Check window.CURRICULUM_DATA fallback from js/data.js first, or fetch lessons.json
    if (window.CURRICULUM_DATA) {
      state.curriculum = window.CURRICULUM_DATA;
    } else {
      const response = await fetch('data/lessons.json');
      state.curriculum = await response.json();
    }
  } catch (error) {
    console.error('Failed to load curriculum data:', error);
    elements.contentContainer.innerHTML = `
      <div class="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl max-w-xl mx-auto my-12 text-center space-y-3">
        <i data-lucide="alert-triangle" class="w-10 h-10 text-red-500 mx-auto"></i>
        <h3 class="font-bold text-lg">Curriculum Load Error</h3>
        <p class="text-sm">Unable to load lesson data. Ensure <code>data/lessons.json</code> or <code>js/data.js</code> is available.</p>
      </div>
    `;
  }
}

// Render Sidebar Navigation
function renderSidebarNav() {
  if (!state.curriculum) return;

  elements.navWeekList.innerHTML = state.curriculum.weeks
    .map(
      (week) => `
    <button 
      data-week="${week.weekNumber}" 
      class="nav-week-btn w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-between ${
        week.weekNumber === state.currentWeekNumber
          ? 'bg-brand-600 text-white shadow-sm'
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }">
      <span class="truncate">W${week.weekNumber}: ${week.title}</span>
      <i data-lucide="chevron-right" class="w-4 h-4 shrink-0 opacity-60"></i>
    </button>
  `
    )
    .join('');

  // Attach Week Click Events
  document.querySelectorAll('.nav-week-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const weekNum = parseInt(e.currentTarget.dataset.week, 10);
      state.currentWeekNumber = weekNum;
      renderSidebarNav();
      renderCurrentWeek();
      closeMobileSidebar();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

// Render Main Week Content View
function renderCurrentWeek() {
  const week = getCurrentWeekData();
  if (!week) return;

  elements.contentContainer.innerHTML = `
    <!-- WEEK HEADER -->
    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-brand-100 text-brand-700 font-bold rounded-full text-xs uppercase tracking-wider">
            Week ${week.weekNumber} of 6
          </span>
          <span class="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i> ${week.teacherGuide.logistics.sessionDuration}
          </span>
        </div>
        
        <!-- View Toggle & Presentation Quick Launch -->
        <div class="flex items-center gap-2">
          <button onclick="window.SlideViewer && window.SlideViewer.launch(state.curriculum.weeks[${week.weekNumber - 1}].slides, '${week.title}')" 
            class="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
            <i data-lucide="presentation" class="w-3.5 h-3.5 text-brand-400"></i> Present Slides
          </button>
        </div>
      </div>

      <div>
        <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">${week.title}</h2>
        <p class="text-slate-600 mt-2 text-sm md:text-base leading-relaxed">${week.summary}</p>
      </div>

      <!-- Tab Buttons -->
      <div class="flex border-b border-slate-200 text-sm font-medium pt-2">
        <button id="tab-btn-guide" onclick="switchWeekTab('guide')" class="px-4 py-2.5 border-b-2 text-brand-600 border-brand-600 font-semibold flex items-center gap-2">
          <i data-lucide="book-open" class="w-4 h-4"></i> Facilitator Guide
        </button>
        <button id="tab-btn-worksheet" onclick="switchWeekTab('worksheet')" class="px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <i data-lucide="file-spreadsheet" class="w-4 h-4"></i> Student Worksheet
        </button>
        <button id="tab-btn-media" onclick="switchWeekTab('media')" class="px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2">
          <i data-lucide="images" class="w-4 h-4"></i> Media Cards (${week.mediaCards.length})
        </button>
      </div>
    </div>

    <!-- TAB CONTENT MOUNT POINT -->
    <div id="week-tab-content" class="space-y-6">
      ${renderFacilitatorGuideHTML(week)}
    </div>
  `;

  state.activeTab = 'guide';
  if (window.lucide) window.lucide.createIcons();
}

// Switch Week Tab Content
window.switchWeekTab = function (tabName) {
  state.activeTab = tabName;
  const week = getCurrentWeekData();
  const container = document.getElementById('week-tab-content');

  // Update tab UI states
  ['guide', 'worksheet', 'media'].forEach((tab) => {
    const btn = document.getElementById(`tab-btn-${tab}`);
    if (btn) {
      if (tab === tabName) {
        btn.className = 'px-4 py-2.5 border-b-2 text-brand-600 border-brand-600 font-semibold flex items-center gap-2';
      } else {
        btn.className = 'px-4 py-2.5 border-b-2 border-transparent text-slate-500 hover:text-slate-700 flex items-center gap-2';
      }
    }
  });

  if (tabName === 'guide') {
    container.innerHTML = renderFacilitatorGuideHTML(week);
  } else if (tabName === 'worksheet') {
    container.innerHTML = '<div id="worksheet-mount"></div>';
    if (window.MatrixTool) {
      window.MatrixTool.renderWorksheet(week.worksheet, 'worksheet-mount');
    }
  } else if (tabName === 'media') {
    container.innerHTML = renderWeekMediaCardsHTML(week.mediaCards);
  }

  if (window.lucide) window.lucide.createIcons();
};

// Render Facilitator Guide HTML Layout
function renderFacilitatorGuideHTML(week) {
  const guide = week.teacherGuide;
  return `
    <!-- LOGISTICS & MATERIALS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-slate-900 text-white p-5 rounded-2xl space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
          <i data-lucide="layout" class="w-4 h-4"></i> Classroom Layout
        </h4>
        <p class="text-sm text-slate-300 leading-relaxed">${guide.logistics.layout}</p>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <i data-lucide="package" class="w-4 h-4"></i> Required Materials
        </h4>
        <ul class="text-sm text-slate-700 space-y-1">
          ${guide.logistics.requiredMaterials.map((m) => `<li class="flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>${m}</li>`).join('')}
        </ul>
      </div>
    </div>

    <!-- MINUTE-BY-MINUTE SCRIPT & PHASES -->
    <div class="space-y-4">
      <h3 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <i data-lucide="list-checks" class="w-5 h-5 text-brand-600"></i> Minute-by-Minute Facilitator Guide
      </h3>

      <div class="space-y-4">
        ${guide.phases
          .map(
            (phase) => `
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <span class="text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                Phase ${phase.phaseNumber} • ${phase.durationMinutes} Mins
              </span>
              <h4 class="font-bold text-slate-900 text-base">${phase.title}</h4>
            </div>

            <div class="text-sm text-slate-700 space-y-1">
              <strong class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Facilitator Actions:</strong>
              <p>${phase.facilitatorActions}</p>
            </div>

            ${
              state.currentViewMode === 'teacher'
                ? `
            <div class="bg-amber-50 border-l-4 border-amber-400 p-3.5 rounded-r-xl space-y-1">
              <strong class="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                <i data-lucide="message-square" class="w-3.5 h-3.5 text-amber-600"></i> Suggested Script
              </strong>
              <p class="text-sm italic text-amber-950">"${phase.script}"</p>
            </div>
            `
                : ''
            }
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

// Render Media Cards Grid
function renderWeekMediaCardsHTML(cards) {
  if (!cards || cards.length === 0) {
    return `
      <div class="bg-white p-12 rounded-2xl text-center text-slate-400 border border-slate-200">
        <i data-lucide="image-off" class="w-12 h-12 mx-auto mb-3 text-slate-300"></i>
        <p>No standalone media cards assigned to this week.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cards.map((card) => renderMediaCardTile(card)).join('')}
    </div>
  `;
}

// Single Media Tile Layout
function renderMediaCardTile(card) {
  return `
    <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group">
      <div class="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center p-2">
        <img src="${card.imagePath}" alt="${card.altText}" class="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300" 
             onerror="this.src='https://placehold.co/600x400/0f172a/ffffff?text=${encodeURIComponent(card.id)}'" />
        <button onclick="openMediaModal('${card.id}')" class="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-medium text-xs gap-1.5 backdrop-blur-xs">
          <i data-lucide="zoom-in" class="w-5 h-5"></i> Inspect Source
        </button>
      </div>
      <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div class="flex items-center justify-between gap-2 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">${card.id}</span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">${card.sourceType}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2">${card.title}</h4>
        </div>
        <button onclick="openMediaModal('${card.id}')" class="w-full py-2 bg-slate-100 hover:bg-brand-600 hover:text-white rounded-xl text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5">
          <i data-lucide="eye" class="w-3.5 h-3.5"></i> Inspect Details
        </button>
      </div>
    </div>
  `;
}

// Full Media Vault Gallery
function renderMediaCardVaultView() {
  const allCards = state.curriculum.weeks.flatMap((w) => w.mediaCards);

  elements.contentContainer.innerHTML = `
    <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Media Card Vault</h2>
        <p class="text-slate-600 text-sm mt-1">Browse all authentic news sources, TikTok feeds, WhatsApp chains, and advertisements across the 6-week unit.</p>
      </div>
      <div class="text-xs font-semibold text-slate-500">${allCards.length} Total Source Assets</div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${allCards.map((card) => renderMediaCardTile(card)).join('')}
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
}

// Inspect Modal Operations
window.openMediaModal = function (cardId) {
  const allCards = state.curriculum.weeks.flatMap((w) => w.mediaCards);
  const card = allCards.find((c) => c.id === cardId);
  if (!card) return;

  elements.modalCardBadge.textContent = card.id;
  elements.modalCardTitle.textContent = card.title;
  elements.modalCardImage.src = card.imagePath;
  elements.modalCardImage.onerror = function () {
    this.src = `https://placehold.co/800x600/0f172a/ffffff?text=${encodeURIComponent(card.title)}`;
  };
  elements.modalCardDomain.textContent = card.domain || 'N/A';
  elements.modalCardAuthor.textContent = card.author || 'Unknown';
  elements.modalCardType.textContent = card.sourceType || 'Media Card';
  elements.modalCardTrust.textContent = card.trustRating || 'Unrated';
  elements.modalCardDesc.textContent = card.description || '';

  elements.mediaModal.classList.remove('hidden');
};

function closeMediaModal() {
  elements.mediaModal.classList.add('hidden');
}

// Mobile Sidebar Utilities
function toggleMobileSidebar() {
  elements.sidebar.classList.toggle('-translate-x-full');
  elements.sidebarBackdrop.classList.toggle('hidden');
}

function closeMobileSidebar() {
  elements.sidebar.classList.add('-translate-x-full');
  elements.sidebarBackdrop.classList.add('hidden');
}

// View Mode Utility (Teacher vs. Student)
function setViewMode(mode) {
  state.currentViewMode = mode;
  if (mode === 'teacher') {
    elements.btnViewTeacher.className = 'px-3 py-1.5 rounded-md bg-brand-600 text-white transition';
    elements.btnViewStudent.className = 'px-3 py-1.5 rounded-md text-slate-300 hover:text-white transition';
  } else {
    elements.btnViewStudent.className = 'px-3 py-1.5 rounded-md bg-brand-600 text-white transition';
    elements.btnViewTeacher.className = 'px-3 py-1.5 rounded-md text-slate-300 hover:text-white transition';
  }

  if (state.activeTab === 'guide') {
    renderCurrentWeek();
  }
}

// Helper: Get Current Week Data Object
function getCurrentWeekData() {
  if (!state.curriculum) return null;
  return state.curriculum.weeks.find((w) => w.weekNumber === state.currentWeekNumber);
}