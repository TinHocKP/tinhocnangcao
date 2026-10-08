/**
 * Hệ thống thi trắc nghiệm CNTT Nâng Cao - Đại học Bách Khoa (BK-CCE)
 * Mô phỏng chuẩn xác 100% giao diện phần mềm thi Bách Khoa
 * 300 câu hỏi chia 6 module, bốc ngẫu nhiên 5 câu/module -> 30 câu / 30 phút
 */

(function () {
  'use strict';

  // Cấu hình hằng số
  const EXAM_DURATION_SECONDS = 30 * 60; // 30 phút = 1800 giây
  const QUESTIONS_PER_MODULE = 5;
  const TOTAL_MODULES = 6;
  const TOTAL_EXAM_QUESTIONS = QUESTIONS_PER_MODULE * TOTAL_MODULES; // 30 câu
  const STORAGE_KEY_EXAM = 'BK_NANGCAO_EXAM_STATE_V2';
  const STORAGE_KEY_CUSTOM_BANK = 'BK_NANGCAO_CUSTOM_QUESTION_BANK';

  // Trạng thái ứng dụng
  let appState = {
    view: 'start', // 'start', 'exam', 'result_summary', 'review'
    examCode: '202610NC',
    studentId: 'BK-NC001',
    studentName: 'Điện toán Bách Khoa 001',
    certType: 'NÂNG CAO',
    fontSize: 17,
    questions: [], // 30 câu hỏi của đợt thi hiện tại
    userAnswers: {}, // { questionIndex: optionIndex (0..3) }
    flaggedQuestions: {}, // { questionIndex: true/false }
    remainingSeconds: EXAM_DURATION_SECONDS,
    timerInterval: null,
    submitTimeStr: '',
    currentQuestionIndex: 0,
    score: 0,
    correctCount: 0,
    wrongCount: 0
  };

  // Lấy ngân hàng câu hỏi
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

  // Thuật toán bốc ngẫu nhiên đúng 5 câu từ mỗi module trong 6 module nâng cao
  function generateExamQuestions() {
    const bank = getQuestionBank();
    const modules = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    // Phân loại câu hỏi theo 6 module
    bank.forEach(q => {
      const mod = q.module || 1;
      if (modules[mod]) {
        modules[mod].push(q);
      } else {
        modules[1].push(q);
      }
    });

    const selectedQuestions = [];

    // Bốc đúng 5 câu từ mỗi module
    for (let m = 1; m <= TOTAL_MODULES; m++) {
      const pool = modules[m] || [];
      if (pool.length < QUESTIONS_PER_MODULE) {
        selectedQuestions.push(...pool);
      } else {
        const shuffled = [...pool];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        selectedQuestions.push(...shuffled.slice(0, QUESTIONS_PER_MODULE));
      }
    }

    // Đảo ngẫu nhiên toàn bộ 30 câu (Fisher-Yates) để phân bổ đan xen các chuyên đề
    for (let i = selectedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedQuestions[i], selectedQuestions[j]] = [selectedQuestions[j], selectedQuestions[i]];
    }

    // Đánh số lại thứ tự từ 1 đến 30
    return selectedQuestions.map((q, idx) => ({
      ...q,
      examIndex: idx + 1
    }));
  }

  // Khởi động bài thi mới
  function startNewExam(studentId, studentName, examCode) {
    if (appState.timerInterval) {
      clearInterval(appState.timerInterval);
    }

    appState.studentId = studentId || 'BK-NC001';
    appState.studentName = studentName || 'Học viên CNTT Nâng Cao';
    appState.examCode = examCode || '202610NC';
    appState.questions = generateExamQuestions();
    appState.userAnswers = {};
    appState.flaggedQuestions = {};
    appState.remainingSeconds = EXAM_DURATION_SECONDS;
    appState.currentQuestionIndex = 0;
    appState.view = 'exam';
    appState.submitTimeStr = '';
    appState.score = 0;
    appState.correctCount = 0;

    startTimer();
    saveExamState();
    renderApp();
  }

  // Bắt đầu đếm ngược thời gian
  function startTimer() {
    if (appState.timerInterval) clearInterval(appState.timerInterval);

    appState.timerInterval = setInterval(() => {
      if (appState.remainingSeconds > 0) {
        appState.remainingSeconds--;
        updateTimerDisplay();
        if (appState.remainingSeconds % 5 === 0) {
          saveExamState();
        }
      } else {
        clearInterval(appState.timerInterval);
        alert('Đã hết thời gian làm bài 30 phút! Hệ thống đang tự động nộp bài thi của bạn.');
        finishAndSubmitExam();
      }
    }, 1000);
  }

  // Định dạng thời gian hh : mm : ss (00 : 29 : 45)
  function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
  }

  function updateTimerDisplay() {
    const formatted = formatTime(appState.remainingSeconds);
    const isDanger = appState.remainingSeconds <= 300;
    const timerEls = document.querySelectorAll('.timer-display, #header-timer, #timer-text');
    timerEls.forEach(timerEl => {
      timerEl.textContent = formatted;
      if (isDanger) {
        timerEl.classList.add('timer-danger');
      } else {
        timerEl.classList.remove('timer-danger');
      }
    });
  }

  // Nộp bài thi và chấm điểm
  function finishAndSubmitExam() {
    if (appState.timerInterval) {
      clearInterval(appState.timerInterval);
    }

    let correct = 0;
    appState.questions.forEach((q, idx) => {
      const userPick = appState.userAnswers[idx];
      if (userPick !== undefined && userPick === q.answer) {
        correct++;
      }
    });

    appState.correctCount = correct;
    appState.wrongCount = appState.questions.length - correct;
    appState.score = Number(((correct / appState.questions.length) * 10).toFixed(2));

    const now = new Date();
    const dStr = String(now.getDate()).padStart(2, '0') + '/' +
                 String(now.getMonth() + 1).padStart(2, '0') + '/' +
                 now.getFullYear();
    const tStr = now.toLocaleTimeString('en-US', { hour12: true });
    appState.submitTimeStr = `${dStr} ${tStr}`;

    appState.view = 'result_summary';
    saveExamState();
    renderApp();
  }

  // Lưu trạng thái vào localStorage để chống mất bài khi F5
  function saveExamState() {
    try {
      const dataToSave = {
        view: appState.view,
        examCode: appState.examCode,
        studentId: appState.studentId,
        studentName: appState.studentName,
        fontSize: appState.fontSize,
        questions: appState.questions,
        userAnswers: appState.userAnswers,
        flaggedQuestions: appState.flaggedQuestions,
        remainingSeconds: appState.remainingSeconds,
        submitTimeStr: appState.submitTimeStr,
        currentQuestionIndex: appState.currentQuestionIndex,
        score: appState.score,
        correctCount: appState.correctCount,
        wrongCount: appState.wrongCount
      };
      localStorage.setItem(STORAGE_KEY_EXAM, JSON.stringify(dataToSave));
    } catch (e) {
      console.warn('Lỗi lưu trạng thái:', e);
    }
  }

  // Khôi phục trạng thái bài thi khi tải lại trang
  function restoreExamState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXAM);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.questions && data.questions.length === TOTAL_EXAM_QUESTIONS) {
          Object.assign(appState, data);

          const currentBank = getQuestionBank();
          appState.questions.forEach((q) => {
            const freshQ = currentBank.find(b => b.id === q.id);
            if (freshQ && freshQ.imageUrl) {
              q.imageUrl = freshQ.imageUrl;
            }
          });

          if (appState.view === 'exam') {
            if (appState.remainingSeconds > 0) {
              startTimer();
            } else {
              finishAndSubmitExam();
            }
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Lỗi khôi phục trạng thái:', e);
    }
    return false;
  }

  // Điều hướng câu hỏi
  function goToQuestion(idx) {
    if (idx >= 0 && idx < appState.questions.length) {
      appState.currentQuestionIndex = idx;
      if (appState.view === 'result_summary') {
        appState.view = 'review';
      }
      renderApp();

      if (window.innerWidth <= 768) {
        const qBox = document.getElementById('question-box');
        if (qBox) qBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  // Chọn đáp án
  function selectOption(optIndex) {
    if (appState.view !== 'exam') return;
    appState.userAnswers[appState.currentQuestionIndex] = optIndex;
    saveExamState();
    renderQuestionGrid();
    renderOptionsBox();
  }

  // Bật/tắt cờ đánh dấu
  function toggleFlag() {
    const curr = appState.currentQuestionIndex;
    appState.flaggedQuestions[curr] = !appState.flaggedQuestions[curr];
    saveExamState();
    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
  }

  // ==========================================================================
  // RENDER GIAO DIỆN CHÍNH
  // ==========================================================================
  function renderApp() {
    document.documentElement.style.setProperty('--font-base', appState.fontSize + 'px');

    if (appState.view === 'start') {
      renderStartModal(true);
      return;
    }

    renderStartModal(false);
    renderHeaderControls();
    renderQuestionGrid();
    renderMainWorkspace();
    renderFooterButtons();
    updateTimerDisplay();
  }

  // Render cụm điều khiển trên Header: Câu x, Đặt cờ
  function renderHeaderControls() {
    const controlsContainer = document.getElementById('header-controls-container');
    if (!controlsContainer) return;

    if (appState.view === 'result_summary') {
      controlsContainer.innerHTML = '';
      return;
    }

    const currIdx = appState.currentQuestionIndex;
    const isFlagged = Boolean(appState.flaggedQuestions[currIdx]);

    controlsContainer.innerHTML = `
      <span class="current-q-badge">Câu ${currIdx + 1}</span>
      <button id="btn-toggle-flag" class="btn-flag ${isFlagged ? 'active' : ''}" title="${isFlagged ? 'Bỏ cờ đánh dấu câu này' : 'Đặt cờ đánh dấu câu này để xem lại'}">
        <span>🚩</span>
        <span>${isFlagged ? 'Bỏ cờ' : 'Đặt cờ'}</span>
      </button>
      <div class="font-controls" style="display: inline-flex; gap: 4px; margin-left: 8px;">
        <button id="btn-font-dec" title="Giảm cỡ chữ" style="padding: 2px 8px; border: 1px solid #90caf9; background: #fff; border-radius: 3px; font-weight: bold; cursor: pointer;">A-</button>
        <button id="btn-font-inc" title="Tăng cỡ chữ" style="padding: 2px 8px; border: 1px solid #90caf9; background: #fff; border-radius: 3px; font-weight: bold; cursor: pointer;">A+</button>
      </div>
    `;

    const flagBtn = document.getElementById('btn-toggle-flag');
    if (flagBtn) flagBtn.addEventListener('click', toggleFlag);

    const btnDec = document.getElementById('btn-font-dec');
    const btnInc = document.getElementById('btn-font-inc');
    if (btnDec) {
      btnDec.onclick = () => {
        if (appState.fontSize > 12) {
          appState.fontSize -= 1;
          renderApp();
          saveExamState();
        }
      };
    }
    if (btnInc) {
      btnInc.onclick = () => {
        if (appState.fontSize < 22) {
          appState.fontSize += 1;
          renderApp();
          saveExamState();
        }
      };
    }
  }

  // Render lưới 30 câu hỏi bên cột trái (chuẩn màu Bách Khoa)
  function renderQuestionGrid() {
    const gridEl = document.getElementById('questions-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const isReview = (appState.view === 'result_summary' || appState.view === 'review');

    appState.questions.forEach((q, idx) => {
      const cell = document.createElement('button');
      cell.className = 'q-cell';
      cell.textContent = String(idx + 1).padStart(2, '0');

      if (!isReview) {
        // Trong khi thi
        if (idx === appState.currentQuestionIndex) {
          cell.classList.add('current');
        }
        if (appState.userAnswers[idx] !== undefined) {
          cell.classList.add('answered');
        }
        if (appState.flaggedQuestions[idx]) {
          cell.classList.add('flagged');
        }
      } else {
        // Sau khi nộp bài: Đúng màu XANH LÁ, Sai màu ĐỎ
        const userPick = appState.userAnswers[idx];
        const isCorrect = (userPick !== undefined && userPick === q.answer);

        if (isCorrect) {
          cell.classList.add('correct');
        } else {
          cell.classList.add('wrong');
        }

        if (appState.view === 'review' && idx === appState.currentQuestionIndex) {
          cell.classList.add('current');
        }
      }

      cell.addEventListener('click', () => goToQuestion(idx));
      gridEl.appendChild(cell);
    });
  }

  // Render nội dung chính: Khung câu hỏi & Khung đáp án
  function renderMainWorkspace() {
    const qBox = document.getElementById('question-box');
    const optBox = document.getElementById('options-box');
    if (!qBox || !optBox) return;

    // Trường hợp hiển thị bảng tổng kết kết quả
    if (appState.view === 'result_summary') {
      const totalQ = appState.questions.length || 30;
      const correct = appState.correctCount || 0;
      const wrong = appState.wrongCount !== undefined ? appState.wrongCount : (totalQ - correct);

      qBox.innerHTML = `
        <div class="result-summary-pane">
          <div><strong>Số câu đúng:</strong> <span style="font-weight:700; color:#2e7d32;">${correct}/${totalQ}</span></div>
          <div><strong>Số câu sai:</strong> <span style="font-weight:700; color:#d32f2f;">${wrong}/${totalQ}</span></div>
          <div class="result-highlight-score" style="margin: 4px 0;">Tổng số điểm: ${appState.score}</div>
          <div class="result-line-divider">---------</div>
          <div><strong>Mã thí sinh:</strong> ${appState.studentId}</div>
          <div><strong>Tên thí sinh:</strong> ${appState.studentName}</div>
          <div><strong>Giờ nộp bài:</strong> ${appState.submitTimeStr}</div>
        </div>
      `;
      optBox.innerHTML = `
        <div style="color: #607d8b; font-style: italic; padding: 20px 0;">
          💡 Bạn có thể bấm vào từng số câu bên trái (màu xanh lá là đúng, màu đỏ là sai) để xem chi tiết câu hỏi và đáp án đúng.
        </div>
      `;
      return;
    }

    // Trường hợp đang thi (exam) hoặc đang xem lại câu hỏi (review)
    const currentQ = appState.questions[appState.currentQuestionIndex];
    if (!currentQ) return;

    // Render nội dung câu hỏi: Hình ảnh đặt ngoài cùng trên cao cạnh tiêu đề câu hỏi!
    const isFlagged = Boolean(appState.flaggedQuestions[appState.currentQuestionIndex]);

    let imageHtml = '';
    if (currentQ.imageUrl) {
      imageHtml = `
        <div class="question-image-topright">
          <a href="${currentQ.imageUrl}" target="_blank" title="Nhấp vào để phóng to hình ảnh">
            <img src="${currentQ.imageUrl}" alt="Hình minh họa" class="question-thumb-img" onerror="this.parentElement.parentElement.style.display='none'">
          </a>
          <span class="image-zoom-hint">🔍 Nhấp phóng to</span>
        </div>
      `;
    }

    qBox.innerHTML = `
      <div class="question-top-row">
        <div class="question-text-wrapper">
          <div class="question-meta-bar">
            ${isFlagged ? '<span class="q-flag-tag">🚩 ĐÃ ĐẶT CỜ</span>' : ''}
            <span class="q-number-title">Câu ${appState.currentQuestionIndex + 1}:</span>
            <span class="module-title-badge">${escapeHtml(currentQ.moduleName || '')}</span>
          </div>
          <div class="question-title-text">${escapeHtml(currentQ.question)}</div>
        </div>
        ${imageHtml}
      </div>
    `;

    // Render danh sách lựa chọn
    renderOptionsBox();
  }

  // Render 4 đáp án A, B, C, D
  function renderOptionsBox() {
    const optBox = document.getElementById('options-box');
    if (!optBox) return;

    const currentQ = appState.questions[appState.currentQuestionIndex];
    if (!currentQ) return;

    const isReview = (appState.view === 'review');
    const userPick = appState.userAnswers[appState.currentQuestionIndex];
    const isCorrect = (userPick !== undefined && userPick === currentQ.answer);
    const letters = ['A', 'B', 'C', 'D'];

    let html = '';

    currentQ.options.forEach((optText, optIdx) => {
      const isChecked = (userPick === optIdx);
      let itemClass = 'option-item';

      if (isReview) {
        if (optIdx === currentQ.answer) {
          itemClass += ' correct-answer-item'; // Luôn tô xanh đáp án đúng
        } else if (isChecked && !isCorrect) {
          itemClass += ' user-selected-wrong'; // Tô đỏ nếu thí sinh chọn sai
        }
      }

      html += `
        <label class="${itemClass}">
          <input type="radio" name="exam_option" class="option-radio" value="${optIdx}" 
            ${isChecked ? 'checked' : ''} 
            ${isReview ? 'disabled' : ''}>
          <span class="option-label"><strong>${letters[optIdx]}.</strong> ${escapeHtml(optText)}</span>
          ${isReview && isChecked && !isCorrect ? '<span style="color:#d32f2f; font-weight:bold; margin-left:8px;">(Bạn đã chọn)</span>' : ''}
          ${isReview && optIdx === currentQ.answer ? '<span style="color:#2e7d32; font-weight:bold; margin-left:8px;">✔ (Đáp án đúng)</span>' : ''}
        </label>
      `;
    });

    // Khi xem lại: Hiển thị giải thích chi tiết phía dưới (loại bỏ lặp lại Đáp án chính xác)
    if (isReview && !isCorrect) {
      const correctLetter = letters[currentQ.answer] || '';
      const correctOptText = currentQ.options[currentQ.answer] || '';

      // Chỉ hiển thị thêm giải thích nếu có nội dung thực chất và không lặp lại "Đáp án chính xác:"
      let extraExplanation = '';
      if (currentQ.explanation) {
        const expTrimmed = currentQ.explanation.trim();
        if (!expTrimmed.startsWith('Đáp án chính xác:')) {
          extraExplanation = `<div class="explanation-text">${escapeHtml(currentQ.explanation)}</div>`;
        }
      }

      html += `
        <div class="correct-answer-banner">
          <div>✔ Câu trả lời đúng: ${correctLetter ? correctLetter + '. ' : ''}${escapeHtml(correctOptText)}</div>
          ${extraExplanation}
        </div>
      `;
    }

    optBox.innerHTML = html;

    // Gắn sự kiện chọn đáp án khi đang thi
    if (!isReview) {
      const radios = optBox.querySelectorAll('.option-radio');
      radios.forEach(r => {
        r.addEventListener('change', (e) => {
          selectOption(parseInt(e.target.value, 10));
        });
      });
    }
  }

  // Render các nút hành động ở cột trái và thanh điều hướng dưới
  function renderFooterButtons() {
    const submitBtn = document.getElementById('btn-submit-exam');
    const exitBtn = document.getElementById('btn-exit-app');
    const navBar = document.getElementById('bottom-nav-bar');
    if (!navBar) return;

    const isExam = (appState.view === 'exam');
    const isReview = (appState.view === 'review' || appState.view === 'result_summary');

    // Nút bên cột trái
    if (submitBtn) {
      submitBtn.style.display = isExam ? 'block' : 'none';
    }
    if (exitBtn) {
      exitBtn.style.display = isReview ? 'block' : 'none';
    }

    // Nút điều hướng dưới cùng (có màu xanh chuẩn Bách Khoa btn-prev & btn-next)
    const currIdx = appState.currentQuestionIndex;
    const isFirst = (currIdx === 0);
    const isLast = (currIdx === appState.questions.length - 1);

    if (isExam) {
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>⬅ Câu trước</button>
        <span class="nav-counter" style="font-weight: 700; color: #0288d1;">Câu ${currIdx + 1} / ${appState.questions.length}</span>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu sau ➡</button>
      `;
    } else {
      // Chế độ xem lại
      navBar.innerHTML = `
        <button id="btn-prev-q" class="btn-nav btn-prev" ${isFirst ? 'disabled' : ''}>⬅ Câu trước</button>
        <div class="nav-center-buttons">
          <button id="btn-stop-review" class="btn-action-center btn-stop-review">Dừng xem lại</button>
          <button id="btn-retake-exam" class="btn-action-center btn-retake">Làm lại bài</button>
        </div>
        <button id="btn-next-q" class="btn-nav btn-next" ${isLast ? 'disabled' : ''}>Câu sau ➡</button>
      `;

      const stopBtn = document.getElementById('btn-stop-review');
      if (stopBtn) {
        stopBtn.addEventListener('click', () => {
          appState.view = 'result_summary';
          renderApp();
        });
      }

      const retakeBtn = document.getElementById('btn-retake-exam');
      if (retakeBtn) {
        retakeBtn.addEventListener('click', () => {
          if (confirm('Bạn có muốn tạo đề thi mới gồm 30 câu ngẫu nhiên khác để làm lại không?')) {
            startNewExam(appState.studentId, appState.studentName, appState.examCode);
          }
        });
      }
    }

    const prevBtn = document.getElementById('btn-prev-q');
    const nextBtn = document.getElementById('btn-next-q');
    if (prevBtn) prevBtn.addEventListener('click', () => goToQuestion(currIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToQuestion(currIdx + 1));
  }

  // Modal Bắt đầu làm bài: GỌN GÀNG ĐÚNG CHUẨN PHẦN CƠ BẢN
  function renderStartModal(show) {
    let modal = document.getElementById('start-exam-modal');
    if (!show) {
      if (modal) modal.style.display = 'none';
      return;
    }

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'start-exam-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-dialog" style="max-width: 380px; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); background: #ffffff;">
        <div class="modal-header" style="background: linear-gradient(135deg, #0288d1, #01579b); color: #fff; padding: 14px 16px; text-align: center; justify-content: center;">
          <h4 style="margin: 0; font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.3px;">
            KỲ THI ỨNG DỤNG CNTT NÂNG CAO
          </h4>
        </div>
        
        <div class="modal-body" style="padding: 18px 20px;">
          <!-- Tên đăng nhập và Mật khẩu điền sẵn gọn gàng -->
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 600; font-size: 13px; color: #37474f; display: block; margin-bottom: 4px;">Tên đăng nhập / Thí sinh:</label>
            <input type="text" id="input-username" value="sinhvien" style="width: 100%; padding: 8px 12px; border: 1.5px solid #90caf9; border-radius: 6px; font-size: 14px; font-weight: 600; color: #01579b; background: #f0f7ff;">
          </div>
          <div style="margin-bottom: 18px;">
            <label style="font-weight: 600; font-size: 13px; color: #37474f; display: block; margin-bottom: 4px;">Mật khẩu:</label>
            <input type="text" id="input-password" value="123456" style="width: 100%; padding: 8px 12px; border: 1.5px solid #90caf9; border-radius: 6px; font-size: 14px; font-weight: 600; color: #01579b; background: #f0f7ff;">
          </div>

          <!-- 2 Nút chính: Bắt đầu thi & Ôn thi -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="btn-start-now" style="background: linear-gradient(180deg, #29b6f6 0%, #0288d1 100%); color: #ffffff; border: none; padding: 12px; border-radius: 6px; font-weight: 800; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(2, 136, 209, 0.3); transition: all 0.2s;">
              <span>🎯</span>
              <span>BẮT ĐẦU THI (30 PHÚT)</span>
            </button>

            <a href="practice.html" style="background: #e8f5e9; color: #1b5e20; border: 1.5px solid #81c784; padding: 11px; border-radius: 6px; font-weight: 800; font-size: 14px; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>📚</span>
              <span>ÔN THI TỪNG PHẦN (300 CÂU)</span>
            </a>
          </div>
        </div>

        <div class="modal-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: center;">
          <a href="admin.html" style="font-size: 12px; color: #64748b; text-decoration: none;">🔒 Dành cho Giảng viên quản trị (Admin)</a>
        </div>
      </div>
    `;

    document.getElementById('btn-start-now').onclick = () => {
      const u = document.getElementById('input-username').value.trim() || 'sinhvien';
      startNewExam(u, 'Thí sinh ' + u, '202610NC');
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

  // Khởi tạo các sự kiện khi tải trang
  document.addEventListener('DOMContentLoaded', () => {
    // Nút nộp bài ở cột trái
    const btnSubmit = document.getElementById('btn-submit-exam');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        if (appState.view === 'result_summary' || appState.view === 'review') {
          appState.view = 'result_summary';
          renderApp();
          return;
        }

        const answeredCount = Object.keys(appState.userAnswers).length;
        const total = appState.questions.length;
        const unanswered = total - answeredCount;

        let msg = `Bạn đã hoàn thành ${answeredCount}/${total} câu hỏi.`;
        if (unanswered > 0) {
          msg += `\n⚠️ Còn ${unanswered} câu chưa trả lời!`;
        }
        msg += '\n\nBạn có chắc chắn muốn kết thúc và nộp bài không?';

        if (confirm(msg)) {
          finishAndSubmitExam();
        }
      };
    }

    // Nút thoát chương trình
    const btnExit = document.getElementById('btn-exit-app');
    if (btnExit) {
      btnExit.onclick = () => {
        if (confirm('Bạn có muốn thoát và bắt đầu một đợt thi mới?')) {
          localStorage.removeItem(STORAGE_KEY_EXAM);
          appState.view = 'start';
          renderApp();
        }
      };
    }

    // Khôi phục bài thi cũ nếu có
    const restored = restoreExamState();
    if (!restored) {
      renderStartModal(true);
    } else {
      renderApp();
    }
  });

})();
