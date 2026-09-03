/**
 * Media Literacy & Critical Discourse Analysis Web App
 * Interactive Worksheet & Matrix Engine
 */

window.MatrixTool = (function () {
  const STORAGE_KEY = 'media_literacy_worksheets_v1';

  // Load saved student responses from localStorage
  function getSavedData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return {};
    }
  }

  // Save student response to localStorage
  function saveData(worksheetId, rowIndex, fieldKey, value) {
    try {
      const current = getSavedData();
      if (!current[worksheetId]) current[worksheetId] = {};
      if (!current[worksheetId][rowIndex]) current[worksheetId][rowIndex] = {};

      current[worksheetId][rowIndex][fieldKey] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  // Clear saved worksheet data
  function clearWorksheetData(worksheetId) {
    try {
      const current = getSavedData();
      delete current[worksheetId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }

  // Main Renderer for a single worksheet
  function renderWorksheet(worksheet, mountId) {
    const container = document.getElementById(mountId);
    if (!container || !worksheet) return;

    const saved = getSavedData()[worksheet.id] || {};

    container.innerHTML = `
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6" id="printable-worksheet">
        
        <!-- WORKSHEET HEADER -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Fillable Worksheet
              </span>
              <span class="text-xs text-slate-400 font-mono">${worksheet.id}</span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900">${worksheet.title}</h3>
            <p class="text-sm text-slate-600">${worksheet.instructions}</p>
          </div>

          <!-- ACTIONS BAR -->
          <div class="flex items-center gap-2 print:hidden">
            <button onclick="window.MatrixTool.exportPDF()" 
              class="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="printer" class="w-4 h-4 text-emerald-400"></i> Print / Save PDF
            </button>
            <button onclick="window.MatrixTool.resetWorksheet('${worksheet.id}')" 
              class="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl text-xs font-semibold transition" title="Clear All Fields">
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- MANDATORY SENTENCE FRAME HELPER -->
        ${
          worksheet.mandatorySentenceFrame
            ? `
        <div class="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-1">
          <div class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
            <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600"></i> Mandatory Sentence Frame Reference
          </div>
          <p class="text-xs text-indigo-950 font-medium leading-relaxed font-mono bg-white/80 p-2.5 rounded-lg border border-indigo-100">
            "${worksheet.mandatorySentenceFrame}"
          </p>
        </div>
        `
            : ''
        }

        <!-- DYNAMIC TABLE / FORM MATRIX -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-900 text-white border-b border-slate-800">
                ${worksheet.fields.map((f) => `<th class="p-3.5 font-bold text-xs uppercase tracking-wider">${f.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              ${worksheet.defaultRows
                .map((row, rIdx) => {
                  const rowData = saved[rIdx] || {};
                  return `
                  <tr class="hover:bg-slate-50 transition">
                    ${worksheet.fields
                      .map((field) => {
                        const val = rowData[field.key] !== undefined ? rowData[field.key] : row[field.key] || '';
                        return `<td class="p-3 align-top">${renderFieldInput(worksheet.id, rIdx, field, val)}</td>`;
                      })
                      .join('')}
                  </tr>
                `;
                })
                .join('')}
            </tbody>
          </table>
        </div>

        <!-- FOOTER SAVED INDICATOR -->
        <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span class="flex items-center gap-1">
            <i data-lucide="check-circle2" class="w-3.5 h-3.5 text-emerald-500"></i> Auto-saved to local browser storage
          </span>
          <span>CLIL Language Support Active</span>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // Render specific input element by field type
  function renderFieldInput(worksheetId, rowIndex, field, value) {
    if (field.readOnly) {
      return `<span class="font-bold font-mono text-slate-800 text-xs px-2.5 py-1 bg-slate-100 rounded-md block">${value}</span>`;
    }

    const onChangeAttr = `onchange="window.MatrixTool.handleInput('${worksheetId}', ${rowIndex}, '${field.key}', this.value)"`;

    if (field.type === 'select') {
      return `
        <select ${onChangeAttr} class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none">
          <option value="">-- Select Option --</option>
          ${field.options
            .map((opt) => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`)
            .join('')}
        </select>
      `;
    }

    if (field.type === 'textarea') {
      return `
        <textarea ${onChangeAttr} rows="3" placeholder="${field.placeholder || ''}"
          class="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-brand-500 focus:outline-none resize-y">${value}</textarea>
      `;
    }

    return `
      <input type="text" value="${value}" ${onChangeAttr} placeholder="${field.placeholder || ''}"
        class="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none" />
    `;
  }

  // Event handler for real-time saving
  function handleInput(worksheetId, rowIndex, fieldKey, value) {
    saveData(worksheetId, rowIndex, fieldKey, value);
  }

  // Reset worksheet action
  function resetWorksheet(worksheetId) {
    if (confirm('Are you sure you want to clear all entries for this worksheet?')) {
      clearWorksheetData(worksheetId);
      // Re-render current worksheet tab
      if (window.switchWeekTab) {
        window.switchWeekTab('worksheet');
      }
    }
  }

  // Export as printable view or save to PDF
  function exportPDF() {
    window.print();
  }

  // View All Worksheets Tool Page
  function renderAllWorksheetsView(curriculum) {
    const container = document.getElementById('content-container');
    if (!container || !curriculum) return;

    container.innerHTML = `
      <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Interactive Student Matrices</h2>
          <p class="text-slate-600 text-sm mt-1">Select a weekly worksheet matrix to view, complete, or export.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${curriculum.weeks
          .map(
            (w) => `
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold px-2.5 py-0.5 bg-brand-100 text-brand-800 rounded-full">Week ${w.weekNumber}</span>
                <span class="text-xs text-slate-400 font-mono">${w.worksheet.id}</span>
              </div>
              <h3 class="font-bold text-slate-900 text-base">${w.worksheet.title}</h3>
              <p class="text-xs text-slate-600 mt-1 line-clamp-2">${w.worksheet.instructions}</p>
            </div>

            <button onclick="window.switchWeekTabAndOpen('${w.weekNumber}', 'worksheet')" 
              class="w-full py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2">
              <i data-lucide="edit-3" class="w-4 h-4"></i> Open Fillable Matrix
            </button>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();
  }

  // Helper helper to jump to week worksheet
  window.switchWeekTabAndOpen = function (weekNumber, tab) {
    if (window.state) {
      window.state.currentWeekNumber = parseInt(weekNumber, 10);
      if (window.renderSidebarNav) window.renderSidebarNav();
      if (window.renderCurrentWeek) {
        window.renderCurrentWeek();
        window.switchWeekTab(tab);
      }
    }
  };

  return {
    renderWorksheet,
    handleInput,
    resetWorksheet,
    exportPDF,
    renderAllWorksheetsView,
  };
})();