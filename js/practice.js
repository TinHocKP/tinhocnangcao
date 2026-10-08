/**
 * Hệ thống Ôn tập Trắc nghiệm CNTT Nâng Cao (Đại học Bách Khoa BK-CCE)
 * 300 câu hỏi chính thức chia thành 3 Phần / 6 Chuyên Đề
 * Hỗ trợ chế độ ôn 50 câu hoặc ôn gộp 100 câu theo từng Phần
 * Kèm chế độ xem đáp án tức thì (Instant Mode) và giải thích chi tiết
 */

(function () {
  'use strict';

  const STORAGE_KEY_CUSTOM_BANK = 'BK_NANGCAO_CUSTOM_QUESTION_BANK';
  const STORAGE_KEY_PREFIX = 'BK_NANGCAO_PRACTICE_STATE_';

  const MODULES_INFO = {
    1: {
      part: 1,
      partTitle: 'Phần 1: Xử lý văn bản nâng cao (MS Word)',
      moduleTitle: 'Chuyên đề 1: Word Nâng Cao (Câu 1 - 50)',
      icon: '📘',
      desc: 'AutoCorrect, Page Setup (Gutter, Mirror Margins), Bảo mật tài liệu, Styles, Thao tác Table và Định dạng đoạn văn.',
      formUrl: 'https://forms.gle/NXMzCeNcHAVGSMXb9',
      count: 50
    },
    2: {
      part: 1,
      partTitle: 'Phần 1: Xử lý văn bản nâng cao (MS Word)',
      moduleTitle: 'Chuyên đề 2: Word Nâng Cao (Câu 51 - 100)',
      icon: '📝',
      desc: 'Trộn thư (Mail Merge), Footnote, Mục lục tự động (Table of Contents), Đặt lề nâng cao, Quản lý in ấn và Phân đoạn.',
      formUrl: 'https://forms.gle/2DpCJiMVkVYWeo5F7',
      count: 50
    },
    3: {
      part: 2,
      partTitle: 'Phần 2: Sử dụng bảng tính nâng cao (MS Excel)',
      moduleTitle: 'Chuyên đề 3: Excel Nâng Cao (Câu 1 - 50)',
      icon: '📊',
      desc: 'Bảo mật Workbook & Sheet, hàm VLOOKUP, HLOOKUP, INDEX, MATCH, DSUM, DCOUNT, CSDL và Lọc nâng cao (Advanced Filter).',
      formUrl: 'https://forms.gle/tU94d2DcTXu78pnb6',
      count: 50
    },
    4: {
      part: 2,
      partTitle: 'Phần 2: Sử dụng bảng tính nâng cao (MS Excel)',
      moduleTitle: 'Chuyên đề 4: Excel Nâng Cao (Câu 51 - 100)',
      icon: '📈',
      desc: 'Hàm xử lý chuỗi và số nâng cao, SUMIF, COUNTIF, biểu thức logic lồng nhau, Conditional Formatting, Data bars.',
      formUrl: 'https://forms.gle/3ztse8bKg1msUtby5',
      count: 50
    },
    5: {
      part: 3,
      partTitle: 'Phần 3: Sử dụng trình chiếu nâng cao (MS PowerPoint)',
      moduleTitle: 'Chuyên đề 5: PowerPoint Nâng Cao (Câu 1 - 50)',
      icon: '📽️',
      desc: 'Slide Master nâng cao, Section, Layout, Header & Footer, kỹ thuật thiết kế bài thuyết trình trực quan chuyên nghiệp.',
      formUrl: 'https://forms.gle/jx8PucfUfdy8jt7m8',
      count: 50
    },
    6: {
      part: 3,
      partTitle: 'Phần 3: Sử dụng trình chiếu nâng cao (MS PowerPoint)',
      moduleTitle: 'Chuyên đề 6: PowerPoint Nâng Cao (Câu 51 - 100)',
      icon: '✨',
      desc: 'Kỹ thuật Animation nâng cao, Animation Pane, Trigger, thiết lập thời gian tự động, liên kết và hiệu ứng chuyển động.',
      formUrl: 'https://forms.gle/pNiAMH48UEwbWm2VA',
      count: 50
    }
  };

  // Trạng thái ôn tập
  let state = {
    activeScreen: 'overview', // 'overview' hoặc 'workspace'
    practiceTarget: 'mod_1', // 'mod_1'..'mod_6' hoặc 'part_1'..'part_3'
    view: 'study', // 'study', 'result_summary', 'review'
    fontSize: 17,
    questions: [],
    userAnswers: {},
    flaggedQuestions: {},
    instantMode: true, // Mặc định BẬT xem đáp án tức thì để học hiệu quả
    currentQuestionIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0
  };

  function getQuestionBank() {
    try {
      const custom = localStorage.getItem(STORAGE_KEY_CUSTOM_BANK);
      if (custom) {
        const parsed = JSON.parse(custom);
        if (Array.isArray(parsed) && parsed.length >= 30) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc ngân hàng tùy chỉnh:', e);
    }
    return window.DEFAULT_QUESTION_BANK || [];
  }

  // Tải danh sách câu hỏi theo mục tiêu (module hoặc part)
  function loadQuestionsForTarget(target) {
    const bank = getQuestionBank();
    let filtered = [];

    if (target.startsWith('mod_')) {
      const modId = parseInt(target.replace('mod_', ''), 10);
      filtered = bank.filter(q => Number(q.module) === modId);
    } else if (target.startsWith('part_')) {
      const partId = parseInt(target.replace('part_', ''), 10);
      filtered = bank.filter(q => Number(q.part) === partId);
    }

    return filtered.map((q, idx) => ({
      ...q,
      practiceIndex: idx + 1
    }));
  }

  // Đọc dữ liệu tiến độ đã lưu
  function getTargetSavedData(targetKey) {
    try {
      const key = STORAGE_KEY_PREFIX + targetKey;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Lỗi đọc tiến độ:', e);
    }
    return null;
  }

  function savePracticeState() {
    try {
      const key = STORAGE_KEY_PREFIX + state.practiceTarget;
      const dataToSave = {
        practiceTarget: state.practiceTarget,
        view: state.view,
        userAnswers: state.userAnswers,
        flaggedQuestions: state.flaggedQuestions,
        currentQuestionIndex: state.currentQuestionIndex,
        instantMode: state.instantMode,
        score: state.score,
        correctCount: state.correctCount,
        wrongCount: state.wrongCount,
        lastUpdated: new Date().toLocaleString('vi-VN')
      };
      localStorage.setItem(key, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Lỗi lưu tiến độ ôn tập:', e);
    }
  }

  // Bắt đầu một phiên ôn tập
  function startPractice(targetKey) {
    state.practiceTarget = targetKey;
    let loaded = loadQuestionsForTarget(targetKey);
    if (!loaded || loaded.length === 0) {
      const bank = window.DEFAULT_QUESTION_BANK || [];
      if (targetKey.startsWith('mod_')) {
        const modId = parseInt(targetKey.replace('mod_', ''), 10);
        loaded = bank.filter(q => Number(q.module) === modId);
      } else if (targetKey.startsWith('part_')) {
        const partId = parseInt(targetKey.replace('part_', ''), 10);
        loaded = bank.filter(q => Number(q.part) === partId);
      }
      loaded = loaded.map((q, idx) => ({ ...q, practiceIndex: idx + 1 }));
    }
    state.questions = loaded;
    state.activeScreen = 'workspace';
    state.view = 'study';
    state.userAnswers = {};
    state.flaggedQuestions = {};
    state.currentQuestionIndex = 0;

    // Phục hồi phiên trước nếu có
    const saved = getTargetSavedData(targetKey);
    if (saved && saved.userAnswers) {
      state.userAnswers = saved.userAnswers || {};
      state.flaggedQuestions = saved.flaggedQuestions || {};
      state.currentQuestionIndex = saved.currentQuestionIndex || 0;
      if (saved.instantMode !== undefined) state.instantMode = saved.instantMode;
      if (saved.view === 'result_summary') state.view = 'study';
    }

    renderApp();
  }

  // Kết thúc ôn tập và chấm điểm
  function finishPractice() {
    let correct = 0;
    state.questions.forEach((q, idx) => {
      const userPick = state.userAnswers[idx];
      if (userPick !== undefined && userPick === q.answer) {
        correct++;
      }
    });

    state.correctCount = correct;
    state.wrongCount = state.questions.length - correct;
    state.score = Number(((correct / state.questions.length) * 10).toFixed(2));
    state.view = 'result_summary';

    savePracticeState();
    renderApp();
  }

  // Thoát về màn hình danh sách chủ đề
  function exitToOverview() {
    savePracticeState();
    state.activeScreen = 'overview';
    renderApp();
  }

  // ==========================================
  // RENDER APP
  // ==========================================
  function renderApp() {
    const overviewEl = document.getElementById('practice-overview-screen');
    const workspaceEl = document.getElementById('practice-workspace-screen');

    document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');

    if (state.activeScreen === 'overview') {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      if (overviewEl) overviewEl.style.display = 'block';
      if (workspaceEl) workspaceEl.style.display = 'none';
      renderOverviewScreen();
    } else {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      if (overviewEl) overviewEl.style.display = 'none';
      if (workspaceEl) workspaceEl.style.display = 'flex';
      renderWorkspaceScreen();
    }
  }

  // Render màn hình Tổng quan
  function renderOverviewScreen() {
    const overviewGrid = document.getElementById('overview-topics-grid');
    if (!overviewGrid) return;

    overviewGrid.innerHTML = '';

    // Nhóm 6 module thành 3 Phần
    const parts = [
      { id: 1, title: 'PHẦN 1: MS WORD NÂNG CAO (100 CÂU)', color: '#1565c0', icon: '📝', modules: [1, 2] },
      { id: 2, title: 'PHẦN 2: MS EXCEL NÂNG CAO (100 CÂU)', color: '#2e7d32', icon: '📊', modules: [3, 4] },
      { id: 3, title: 'PHẦN 3: MS POWERPOINT NÂNG CAO (100 CÂU)', color: '#d84315', icon: '📽️', modules: [5, 6] }
    ];

    parts.forEach(part => {
      const partCard = document.createElement('div');
      partCard.className = 'part-group-card';
      partCard.style.borderTop = `4px solid ${part.color}`;

      let moduleCardsHtml = '';
      part.modules.forEach(mId => {
        const info = MODULES_INFO[mId];
        const saved = getTargetSavedData(`mod_${mId}`);
        const answeredCount = saved ? Object.keys(saved.userAnswers || {}).length : 0;
        const progressPct = Math.round((answeredCount / info.count) * 100);

        moduleCardsHtml += `
          <div class="sub-topic-row">
            <div class="sub-topic-header">
              <span class="sub-topic-title">${info.icon} ${info.moduleTitle}</span>
              <span class="sub-topic-badge">${answeredCount}/${info.count} câu (${progressPct}%)</span>
            </div>
            <div class="sub-topic-desc">${info.desc}</div>
            <div class="sub-topic-actions">
              <button class="btn-start-topic" data-target="mod_${mId}">Luyện tập 50 câu</button>
              <a href="${info.formUrl}" target="_blank" rel="noopener" class="link-original-form" title="Mở Google Form gốc">🔗 Google Form gốc</a>
            </div>
          </div>
        `;
      });

      partCard.innerHTML = `
        <div class="part-header" style="background-color: ${part.color}; color: #ffffff;">
          <div class="part-header-title">${part.icon} ${part.title}</div>
          <button class="btn-part-all" data-target="part_${part.id}">Ôn gộp toàn bộ 100 câu</button>
        </div>
        <div class="part-body">
          ${moduleCardsHtml}
        </div>
      `;

      overviewGrid.appendChild(partCard);
    });

    // Bắt sự kiện click các nút
    document.querySelectorAll('.btn-start-topic, .btn-part-all').forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-target');
        startPractice(target);
      };
    });
  }

  // Render màn hình Ôn tập (Workspace)
  function renderWorkspaceScreen() {
    renderPracticeHeader();
    renderPracticeSidebar();
    renderPracticeQuestion();

    if (state.view === 'result_summary') {
      showPracticeResultModal();
    }
  }

  function getTargetDisplayName(targetKey) {
    if (targetKey.startsWith('mod_')) {
      const mId = parseInt(targetKey.replace('mod_', ''), 10);
      return MODULES_INFO[mId]?.moduleTitle || 'Ôn tập';
    } else if (targetKey.startsWith('part_')) {
      const pId = parseInt(targetKey.replace('part_', ''), 10);
      if (pId === 1) return 'Phần 1: Toàn bộ 100 câu Word Nâng Cao';
      if (pId === 2) return 'Phần 2: Toàn bộ 100 câu Excel Nâng Cao';
      if (pId === 3) return 'Phần 3: Toàn bộ 100 câu PowerPoint Nâng Cao';
    }
    return 'Ôn tập';
  }

  function renderPracticeHeader() {
    const titleEl = document.getElementById('practice-header-title');
    if (titleEl) {
      titleEl.textContent = getTargetDisplayName(state.practiceTarget);
    }

    const toggleInstant = document.getElementById('toggle-instant-mode');
    if (toggleInstant) {
      toggleInstant.checked = state.instantMode;
      toggleInstant.onchange = (e) => {
        state.instantMode = e.target.checked;
        savePracticeState();
        renderPracticeQuestion();
      };
    }

    const btnBack = document.getElementById('btn-back-overview');
    if (btnBack) {
      btnBack.onclick = () => {
        exitToOverview();
      };
    }

    const btnDec = document.getElementById('btn-prac-font-dec');
    const btnInc = document.getElementById('btn-prac-font-inc');
    if (btnDec) {
      btnDec.onclick = () => {
        if (state.fontSize > 13) {
          state.fontSize -= 1;
          document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');
        }
      };
    }
    if (btnInc) {
      btnInc.onclick = () => {
        if (state.fontSize < 24) {
          state.fontSize += 1;
          document.documentElement.style.setProperty('--font-base', state.fontSize + 'px');
        }
      };
    }
  }

  function renderPracticeSidebar() {
    const gridEl = document.getElementById('practice-questions-grid');
    if (!gridEl) return;

    gridEl.innerHTML = '';
    const isSubmitted = (state.view === 'result_summary' || state.view === 'review');

    state.questions.forEach((q, idx) => {
      const cell = document.createElement('button');
      cell.className = 'q-cell';
      cell.textContent = String(idx + 1).padStart(2, '0');

      const userPick = state.userAnswers[idx];
      const hasAnswer = (userPick !== undefined);

      if (!isSubmitted) {
        if (idx === state.currentQuestionIndex) {
          cell.classList.add('current');
        }
        if (hasAnswer) {
          if (state.instantMode) {
            if (userPick === q.answer) {
              cell.classList.add('correct');
            } else {
              cell.classList.add('wrong');
            }
          } else {
            cell.classList.add('answered');
          }
        }
        if (state.flaggedQuestions[idx]) {
          cell.classList.add('flagged');
        }
      } else {
        if (userPick === q.answer) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('wrong');
        }
        if (idx === state.currentQuestionIndex) {
          cell.classList.add('current');
        }
      }

      cell.onclick = () => {
        state.currentQuestionIndex = idx;
        renderPracticeSidebar();
        renderPracticeQuestion();
      };

      gridEl.appendChild(cell);
    });

    const btnSubmit = document.getElementById('btn-finish-practice');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        const answeredCount = Object.keys(state.userAnswers).length;
        const total = state.questions.length;
        if (confirm(`Bạn đã làm ${answeredCount}/${total} câu hỏi.\nBạn có muốn nộp bài và xem bảng điểm tổng kết?`)) {
          finishPractice();
        }
      };
    }
  }

  function renderPracticeQuestion() {
    const qBox = document.getElementById('practice-question-box');
    const optBox = document.getElementById('practice-options-box');
    const navBar = document.getElementById('practice-bottom-nav');
    if (!qBox || !optBox) return;

    const currIdx = state.currentQuestionIndex;
    const q = state.questions[currIdx];
    if (!q) return;

    const userPick = state.userAnswers[currIdx];
    const isAnswered = (userPick !== undefined);
    const isSubmitted = (state.view === 'result_summary' || state.view === 'review');
    const showExplanation = isSubmitted || (state.instantMode && isAnswered);
    const isFlagged = Boolean(state.flaggedQuestions[currIdx]);

    // Hình ảnh minh họa đặt ở ngoài cùng trên cao cạnh tiêu đề câu hỏi
    let imageHtml = '';
    if (q.imageUrl) {
      imageHtml = `
        <div class="question-image-topright">
          <a href="${q.imageUrl}" target="_blank" title="Nhấp vào để phóng to hình ảnh">
            <img src="${q.imageUrl}" alt="Hình minh họa" class="question-thumb-img" onerror="this.parentElement.parentElement.style.display='none'">
          </a>
          <span class="image-zoom-hint">🔍 Nhấp phóng to</span>
        </div>
      `;
    }

    qBox.innerHTML = `
      <div class="question-top-row">
        <div class="question-text-wrapper">
          <div class="question-title-text">
            ${isFlagged ? '<span class="q-flag-tag">🚩 ĐÃ ĐẶT CỜ</span>' : ''}
            <span class="q-number-title">Câu ${currIdx + 1} / ${state.questions.length}:</span>
            ${escapeHtml(q.question)}
          </div>
        </div>
        ${imageHtml}
      </div>
    `;

    optBox.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, optIdx) => {
      const optRow = document.createElement('div');
      optRow.className = 'option-item';

      const isChecked = (userPick === optIdx);

      if (showExplanation) {
        if (optIdx === q.answer) {
          optRow.classList.add('correct-choice');
        }
        if (isChecked && optIdx !== q.answer) {
          optRow.classList.add('wrong-choice');
        }
      }

      optRow.innerHTML = `
        <label class="radio-label">
          <input type="radio" name="practice-option" value="${optIdx}" ${isChecked ? 'checked' : ''} ${isSubmitted ? 'disabled' : ''}>
          <span class="custom-radio"></span>
          <span class="opt-letter">${letters[optIdx]}.</span>
          <span class="opt-text">${escapeHtml(optText)}</span>
        </label>
      `;

      if (!isSubmitted) {
        optRow.onclick = (e) => {
          if (e.target.tagName !== 'INPUT') {
            const radio = optRow.querySelector('input');
            if (radio) radio.checked = true;
          }
          state.userAnswers[currIdx] = optIdx;
          savePracticeState();
          renderPracticeSidebar();
          renderPracticeQuestion();
        };
      }

      optBox.appendChild(optRow);
    });

    if (showExplanation) {
      const isRight = (userPick === q.answer);
      let extraExplanation = '';
      if (q.explanation) {
        const expTrimmed = q.explanation.trim();
        if (!expTrimmed.startsWith('Đáp án chính xác:')) {
          extraExplanation = `<div class="explanation-text" style="margin-top:6px; color:#475569;">${escapeHtml(q.explanation)}</div>`;
        }
      }

      const explanationBox = document.createElement('div');
      explanationBox.className = 'explanation-box';
      explanationBox.innerHTML = `
        <div class="exp-header ${isRight ? 'text-success' : 'text-danger'}">
          ${isRight ? '✅ Bạn đã chọn ĐÚNG' : '❌ Lựa chọn CHƯA CHÍNH XÁC'}
        </div>
        <div class="exp-body">
          <strong>✔ Đáp án đúng:</strong> ${letters[q.answer]}. ${escapeHtml(q.options[q.answer] || '')}
          ${extraExplanation}
        </div>
      `;
      optBox.appendChild(explanationBox);
    }

    if (navBar) {
      const isFlagged = Boolean(state.flaggedQuestions[currIdx]);
      navBar.innerHTML = `
        <button id="btn-prev-prac" class="btn-nav btn-prev" ${currIdx === 0 ? 'disabled' : ''}>⬅ Câu trước</button>
        <button id="btn-toggle-flag-prac" class="btn-flag ${isFlagged ? 'active' : ''}">🚩 ${isFlagged ? 'Bỏ cờ' : 'Đặt cờ'}</button>
        <span class="nav-counter" style="font-weight: 700; color: #0288d1;">Câu ${currIdx + 1} / ${state.questions.length}</span>
        <button id="btn-next-prac" class="btn-nav btn-next" ${currIdx === state.questions.length - 1 ? 'disabled' : ''}>Câu sau ➡</button>
      `;

      document.getElementById('btn-prev-prac').onclick = () => {
        if (state.currentQuestionIndex > 0) {
          state.currentQuestionIndex--;
          renderPracticeSidebar();
          renderPracticeQuestion();
        }
      };

      document.getElementById('btn-next-prac').onclick = () => {
        if (state.currentQuestionIndex < state.questions.length - 1) {
          state.currentQuestionIndex++;
          renderPracticeSidebar();
          renderPracticeQuestion();
        }
      };

      document.getElementById('btn-toggle-flag-prac').onclick = () => {
        state.flaggedQuestions[currIdx] = !state.flaggedQuestions[currIdx];
        savePracticeState();
        renderPracticeSidebar();
        renderPracticeQuestion();
      };
    }
  }

  function showPracticeResultModal() {
    let modal = document.getElementById('practice-result-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'practice-result-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="result-card">
        <div class="result-card-header bg-pass">
          <h3>KẾT QUẢ ÔN TẬP</h3>
          <div class="result-badge">${getTargetDisplayName(state.practiceTarget)}</div>
        </div>
        <div class="result-card-body">
          <div class="result-score-large">${state.score} <span class="score-max">/ 10.00</span></div>
          <table class="result-details-table">
            <tr>
              <td>Số câu đúng:</td>
              <td class="text-success"><strong>${state.correctCount} / ${state.questions.length} câu</strong></td>
            </tr>
            <tr>
              <td>Số câu sai / Chưa làm:</td>
              <td class="text-danger"><strong>${state.wrongCount} câu</strong></td>
            </tr>
          </table>
        </div>
        <div class="result-card-footer">
          <button id="btn-review-prac" class="btn-review-answers">Xem lại chi tiết từng câu</button>
          <button id="btn-exit-prac-modal" class="btn-retake-exam">Quay lại danh mục</button>
        </div>
      </div>
    `;

    document.getElementById('btn-review-prac').onclick = () => {
      modal.remove();
      state.view = 'review';
      renderWorkspaceScreen();
    };

    document.getElementById('btn-exit-prac-modal').onclick = () => {
      modal.remove();
      exitToOverview();
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderApp();
  });

})();
