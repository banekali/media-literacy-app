/**
 * Media Literacy & Critical Discourse Analysis Web App
 * Built-In HTML/CSS Slide Deck Engine
 */

window.SlideViewer = (function () {
  let slides = [];
  let currentIndex = 0;
  let title = '';
  let showNotes = true;

  // DOM Mount Container
  const container = document.getElementById('slide-viewer-container');

  // Launch Fullscreen Presentation Mode
  function launch(weekSlides, weekTitle) {
    if (!weekSlides || weekSlides.length === 0) {
      alert('No presentation slides configured for this module.');
      return;
    }

    slides = weekSlides;
    currentIndex = 0;
    title = weekTitle || 'Media Literacy Slides';

    container.classList.remove('hidden');
    container.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    setupKeyboardControls();
    setupTouchControls();
    renderSlide();
  }

  // Close Presentation Mode
  function close() {
    container.classList.add('hidden');
    container.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    removeControls();
  }

  // Navigation Logic
  function nextSlide() {
    if (currentIndex < slides.length - 1) {
      currentIndex++;
      renderSlide();
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      currentIndex--;
      renderSlide();
    }
  }

  function toggleNotes() {
    showNotes = !showNotes;
    renderSlide();
  }

  // Primary Renderer
  function renderSlide() {
    const current = slides[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === slides.length - 1;

    container.innerHTML = `
      <!-- TOP CONTROL TOOLBAR -->
      <header class="h-14 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 text-slate-300">
        <div class="flex items-center gap-3">
          <span class="px-2.5 py-0.5 rounded-full bg-brand-600 text-white font-bold text-xs">
            ${currentIndex + 1} / ${slides.length}
          </span>
          <h2 class="font-bold text-sm text-white truncate max-w-xs md:max-w-md">${title}</h2>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.SlideViewer.toggleNotes()" 
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1.5 ${showNotes ? 'bg-brand-900/50 text-brand-300 border-brand-500' : 'text-slate-400'}">
            <i data-lucide="message-square" class="w-3.5 h-3.5"></i> Facilitator Notes
          </button>

          <button onclick="window.SlideViewer.close()" 
            class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>
      </header>

      <!-- SLIDE STAGE -->
      <div class="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center justify-center relative bg-slate-950">
        <div class="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl min-h-[50vh] flex flex-col justify-between relative overflow-hidden">
          
          <!-- Slide Content Section -->
          <div class="space-y-6">
            <div class="flex items-center justify-between border-b border-slate-800 pb-4">
              <span class="text-xs font-bold uppercase tracking-wider text-brand-400">${current.layout || 'Presentation'}</span>
              <span class="text-xs text-slate-500 font-mono">Slide ID: ${current.slideNumber}</span>
            </div>

            <h2 class="text-3xl md:text-4xl font-extrabold text-white leading-tight">${current.title}</h2>

            <div class="text-slate-300 text-lg md:text-xl leading-relaxed space-y-4">
              ${formatSlideContent(current.content)}
            </div>
          </div>

          <!-- Facilitator Notes Panel Overlay -->
          ${
            showNotes && current.speakerNotes
              ? `
          <div class="mt-8 pt-4 border-t border-slate-800/80 bg-amber-950/40 border-l-4 border-amber-500 p-4 rounded-r-xl text-amber-200 text-xs md:text-sm">
            <strong class="font-bold text-amber-400 block uppercase tracking-wider text-[10px] mb-1">Teacher Facilitator Script / Cue:</strong>
            ${current.speakerNotes}
          </div>
          `
              : ''
          }
        </div>
      </div>

      <!-- BOTTOM NAVIGATION CONTROLS -->
      <footer class="h-16 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between shrink-0">
        <button onclick="window.SlideViewer.prevSlide()" ${isFirst ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="hover:bg-slate-800 text-white"'} 
          class="px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold flex items-center gap-2 transition">
          <i data-lucide="chevron-left" class="w-4 h-4"></i> Previous
        </button>

        <!-- Progress Bar Indicator -->
        <div class="hidden sm:flex items-center gap-1.5 max-w-xs w-full mx-4">
          ${slides
            .map(
              (_, idx) => `
            <div class="h-1.5 flex-1 rounded-full transition-all ${idx === currentIndex ? 'bg-brand-500' : 'bg-slate-800'}"></div>
          `
            )
            .join('')}
        </div>

        <button onclick="window.SlideViewer.nextSlide()" ${isLast ? 'disabled class="opacity-30 cursor-not-allowed"' : 'class="hover:bg-brand-600 bg-brand-700 text-white"'} 
          class="px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition">
          Next <i data-lucide="chevron-right" class="w-4 h-4"></i>
        </button>
      </footer>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // Parse Markdown-like text in slides
  function formatSlideContent(content) {
    if (!content) return '';
    return content
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-2">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="text-brand-300">$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-slate-300">$1</li>');
  }

  // Keyboard Handlers
  function handleKeyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'Escape') close();
  }

  function setupKeyboardControls() {
    document.addEventListener('keydown', handleKeyDown);
  }

  function removeControls() {
    document.removeEventListener('keydown', handleKeyDown);
  }

  // Touch Swipe Gesture Handlers
  let touchStartX = 0;
  function setupTouchControls() {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) nextSlide();
      if (touchEndX - touchStartX > 50) prevSlide();
    }, { passive: true });
  }

  return {
    launch,
    close,
    nextSlide,
    prevSlide,
    toggleNotes,
  };
})();