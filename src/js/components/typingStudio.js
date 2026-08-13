/**
 * Typing Practice Studio Component ("문장수집가 2nd" Ultra-Clean Zen Engine)
 * Modes:
 *  1. [✍️ 고요한 필사 모드 (PRACTICE, Default)]: 수치(CPM/WPM)가 숨겨진 고요하고 깊은 문학 필사
 *  2. [🎮 타자 연습 모드 (GAME)]: 타수(CPM), WPM, 정확도, 오타 수가 실시간 집계되는 타자 연습
 */
import { state, setState, db, updateDB, updateDBSilent } from '../state.js';
import { calculateTypingStats, getDisplayTokens } from '../utils/hangul.js';
import { soundEngine } from '../utils/soundEngine.js';

const sampleQuotes = [
  {
    title: '데미안',
    author: '헤르만 헤세',
    publisher: '민음사',
    quote: '새는 알에서 나오기 위해 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.'
  },
  {
    title: '어린 왕자',
    author: '생텍쥐페리',
    publisher: '문학동네',
    quote: '가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야만 분명하게 볼 수 있어.'
  },
  {
    title: '참을 수 없는 존재의 가벼움',
    author: '밀란 쿤데라',
    publisher: '민음사',
    quote: '인간의 삶은 단 한 번뿐이며, 그것은 우리가 다른 삶과 비교할 수도, 이전의 삶으로 교정할 수도 없다는 것을 의미한다.'
  },
  {
    title: '불편한 편의점',
    author: '김호연',
    publisher: '나무옆의자',
    quote: '결국 삶은 관계였고 관계는 소통이었다. 행복은 먼 데서 오는 게 아니라 옆 사람과 주고받는 온기에 있었다.'
  },
  {
    title: '채식주의자',
    author: '한강',
    publisher: '창비',
    quote: '나는 나무가 되고 싶어. 뿌리를 깊게 내리고, 바람을 받으며 그냥 서 있고 싶어.'
  },
  {
    title: '달러구트 꿈 백화점',
    author: '이미예',
    publisher: '팩토리나인',
    quote: '과거에 얽매이지 않고, 미래를 두려워하지 않으며, 현재에 충실할 때 우리는 진짜 삶을 살게 됩니다.'
  },
  {
    title: '월든',
    author: '헨리 데이비드 소로',
    publisher: '은행나무',
    quote: '내가 숲으로 들어간 것은 인생을 의도적으로 살아보기 위해서였다.'
  },
  {
    title: '이방인',
    author: '알베르 카뮈',
    publisher: '민음사',
    quote: '마침내 나는 내 안에서 결코 굴복하지 않는 불멸의 여름을 발견했다.'
  },
  {
    title: '1984',
    author: '조지 오웰',
    publisher: '민음사',
    quote: '과거를 지배하는 자가 미래를 지배하며, 현재를 지배하는 자가 과거를 지배한다.'
  },
  {
    title: '구의 증명',
    author: '최진영',
    publisher: '은행나무',
    quote: '네가 죽는다면 나도 죽는다. 아니, 너를 먹고 너와 하나가 되어 영원히 살아갈 것이다.'
  }
];

function getRandomQuote(mode = 'RECOMMENDED', currentQuote = '') {
  const records = db.records || [];
  let pool = [];
  if (mode === 'MY_RECORDS') {
    pool = records.filter(r => r.mine !== false && r.quote).map(r => ({ title: r.bookTitle || '내 수집함', author: r.author || '', publisher: r.publisher || '자체 수집', page: r.page, quote: r.quote }));
  } else if (mode === 'COMMUNITY') {
    pool = records.filter(r => r.mine === false && r.quote).map(r => ({ title: r.bookTitle || '커뮤니티', author: r.author || '익명', publisher: r.publisher || '이웃 수집', page: r.page, quote: r.quote }));
  }
  if (pool.length === 0) {
    pool = sampleQuotes;
  }
  const filtered = pool.filter(q => q.quote !== currentQuote);
  const targetPool = filtered.length > 0 ? filtered : pool;
  return targetPool[Math.floor(Math.random() * targetPool.length)];
}

export function renderTypingStudio(container) {
  const practiceMode = state.typingPracticeMode || 'PRACTICE'; // 'PRACTICE' vs 'GAME'
  const sourceMode = state.typingSourceMode || 'RECOMMENDED';
  const currentFont = state.typingFont || 'typing-font-batang';
  const soundType = state.soundType || 'mechanical';

  let currentObj = null;
  if (state.activeTyping && state.activeTyping.text) {
    currentObj = {
      title: state.activeTyping.source || '선택한 문장',
      author: state.activeTyping.author || '',
      publisher: state.activeTyping.publisher || '민음사',
      page: state.activeTyping.page || null,
      quote: state.activeTyping.text
    };
  } else {
    currentObj = getRandomQuote(sourceMode);
  }

  let activeQuote = currentObj.quote;
  let activeSource = currentObj.title;
  let activeAuthor = currentObj.author;
  let activePublisher = currentObj.publisher || '민음사';
  let activePage = currentObj.page || null;

  let typedText = '';
  let startTime = null;
  let timerInterval = null;
  let isCompleted = false;

  const isGameMode = (practiceMode === 'GAME');
  const typingNotes = db.typingNotes || [];
  const pageSize = 10;
  const currentPage = Math.min(state.typingNotePage || 1, Math.max(1, Math.ceil(typingNotes.length / pageSize)));
  const totalPages = Math.max(1, Math.ceil(typingNotes.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedNotes = typingNotes.slice(startIndex, startIndex + pageSize);

  container.innerHTML = `
    <div class="min-h-[78vh] flex flex-col justify-between space-y-6 animate-fade-in typing-zen-container max-w-3xl mx-auto font-sans py-2 sm:py-4">
      
      <!-- Top Mode & Source Switcher Bar (Frameless & Transparent Background) -->
      <div class="bg-transparent py-0.5 px-0 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0 border-none shadow-none mb-1">
        
        <!-- Practice / Game Mode Switcher -->
        <div class="inline-flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700/60 shrink-0">
          <button data-practice-mode="PRACTICE" class="btn-practice-mode font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${!isGameMode ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}">
            <span>고요한 필사</span>
          </button>
          <button data-practice-mode="GAME" class="btn-practice-mode font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${isGameMode ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'}">
            <span>타자 연습</span>
          </button>
        </div>

        <!-- Quote Source Switcher -->
        <div class="inline-flex bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200 dark:border-stone-700/60 shrink-0">
          <button data-source-mode="MY_RECORDS" class="btn-source-mode px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${sourceMode === 'MY_RECORDS' ? 'bg-stone-800 text-white shadow-sm dark:bg-stone-200 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" title="내 서재의 수집 문장">
            <span class="material-symbols-outlined text-sm">collections_bookmark</span>
            <span>내 서재</span>
          </button>
          <button data-source-mode="COMMUNITY" class="btn-source-mode px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${sourceMode === 'COMMUNITY' ? 'bg-stone-800 text-white shadow-sm dark:bg-stone-200 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" title="이웃들의 추천 문장">
            <span class="material-symbols-outlined text-sm">forum</span>
            <span>커뮤니티</span>
          </button>
          <button data-source-mode="RECOMMENDED" class="btn-source-mode px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${sourceMode === 'RECOMMENDED' ? 'bg-stone-800 text-white shadow-sm dark:bg-stone-200 dark:text-stone-900' : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'}" title="랜덤 명문장 수집">
            <span class="material-symbols-outlined text-sm">casino</span>
            <span>랜덤</span>
          </button>
        </div>

        <!-- Auto Next Toggle -->
        <button id="btn-toggle-autonext" class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-bold text-xs shrink-0 ${state.autoNextQuote ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500'}" title="필사 완필 후 자동으로 다음 문장 넘어가기">
          <span class="material-symbols-outlined text-sm">${state.autoNextQuote ? 'autorenew' : 'pause_circle'}</span>
          <span>다음 문장</span>
        </button>

      </div>

      <!-- Main Typing Canvas (Frameless Paper Typography with Compact Vertical Spacing) -->
      <div id="typing-canvas-wrap" class="relative bg-transparent p-2 sm:p-3 flex flex-col justify-between flex-1 min-h-[45vh] transition-all cursor-text">
        
        <!-- Permanent Smooth Sliding Caret Line -->
        <div id="typing-active-caret"></div>

        <!-- Render Target Characters Display (Compact Padding) -->
        <div class="flex-1 flex items-center justify-center w-full my-auto py-1 sm:py-2">
          <div id="typing-display" class="relative text-lg sm:text-xl md:text-2xl leading-normal tracking-tight select-none text-left w-full break-all break-words text-wrap ${currentFont}">${renderCharSpans(activeQuote, '')}</div>
        </div>

        <!-- Card Bottom Footer (Fixed to Bottom of Container) -->
        <div class="flex items-center justify-between gap-3 mt-auto pt-2 pb-0.5 border-t border-stone-200/60 dark:border-stone-800/80 text-xs font-sans w-full">
          
          <!-- Left: Left-aligned Book Title (Page) / Author / Publisher -->
          <div id="typing-card-footer-meta" class="font-serif text-stone-600 dark:text-stone-400 text-xs truncate flex items-center gap-1.5 min-w-0">
            <span class="font-bold text-stone-900 dark:text-stone-100 truncate">${activeSource}${activePage ? ` (${activePage}p)` : ''}</span>
            <span class="text-stone-300 dark:text-stone-700">/</span>
            <span class="truncate">${activeAuthor || '작자 미상'}</span>
            <span class="text-stone-300 dark:text-stone-700">/</span>
            <span class="text-stone-400 dark:text-stone-500 truncate">${activePublisher}</span>
          </div>

          <!-- Right: More Menu Option (3-Dots) -->
          <div class="flex items-center gap-1 shrink-0 z-20 relative">

            <!-- 3 Dots Options Button -->
            <div class="relative">
              <button id="btn-toggle-typing-options" class="p-1.5 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg transition-colors cursor-pointer" title="옵션 더보기">
                <span class="material-symbols-outlined text-lg">more_vert</span>
              </button>

              <!-- Dropdown Menu -->
              <div id="menu-more-options" class="hidden absolute right-0 bottom-full mb-2 w-28 bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl shadow-lg p-1 text-xs z-30 font-sans">
                <button id="menu-item-copy" class="w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-stone-400">content_copy</span>
                  <span>복사</span>
                </button>
                <button id="menu-item-report" class="w-full px-2.5 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm">report</span>
                  <span>신고</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        <!-- Hidden Typing Input Focus Target -->
        <textarea id="typing-hidden-input" class="absolute opacity-0 pointer-events-auto inset-0 w-full h-full cursor-text resize-none" autocomplete="off" spellcheck="false" autofocus></textarea>
      </div>

      <!-- Real-time Stats Dashboard (Visible only in GAME mode) -->
      ${isGameMode ? `
        <div class="grid grid-cols-4 gap-2 text-center text-xs font-sans animate-fade-in">
          <div class="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <span class="text-[10px] text-stone-400 uppercase tracking-widest block font-bold mb-0.5">SPEED</span>
            <span id="stat-cpm" class="zen-stat-num text-xl sm:text-2xl block">0</span>
            <span class="text-[10px] text-stone-400">CPM (타수)</span>
          </div>
          <div class="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <span class="text-[10px] text-stone-400 uppercase tracking-widest block font-bold mb-0.5">WPM</span>
            <span id="stat-wpm" class="zen-stat-num text-xl sm:text-2xl block">0</span>
            <span class="text-[10px] text-stone-400">단어/분</span>
          </div>
          <div class="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <span class="text-[10px] text-stone-400 uppercase tracking-widest block font-bold mb-0.5">ACCURACY</span>
            <span id="stat-accuracy" class="zen-stat-num text-xl sm:text-2xl block text-emerald-600 dark:text-emerald-400">100%</span>
            <span class="text-[10px] text-stone-400">정확도</span>
          </div>
          <div class="bg-white dark:bg-stone-900 p-3 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <span class="text-[10px] text-stone-400 uppercase tracking-widest block font-bold mb-0.5">ERRORS</span>
            <span id="stat-errors" class="zen-stat-num text-xl sm:text-2xl block text-rose-600 dark:text-rose-400">0</span>
            <span class="text-[10px] text-stone-400">오타 수</span>
          </div>
        </div>
      ` : ''}

      <!-- Recent Transcription Notes Drawer (AJAX Partial DOM Update, Paged 10 per page) -->
      <div id="typing-notes-drawer-container" class="pt-4 border-t border-stone-200/80 dark:border-stone-800 space-y-3">
        <!-- Rendered dynamically by renderTypingNotesList() without full page reload -->
      </div>

    </div>
  `;

  // Function: In-Place Partial DOM Update (AJAX / SPA Partial Re-render)
  function updateNotesDrawerList(page) {
    const drawerContainer = container.querySelector('#typing-notes-drawer-container');
    if (!drawerContainer) return;

    const allNotes = db.typingNotes || [];
    const pSize = 5;
    const totalP = Math.max(1, Math.ceil(allNotes.length / pSize));
    const curP = Math.min(Math.max(1, page), totalP);
    const startIdx = (curP - 1) * pSize;
    const pagedItems = allNotes.slice(startIdx, startIdx + pSize);

    drawerContainer.innerHTML = `
      <div class="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-base text-stone-400">auto_stories</span>
          <span>최근 필사 기록 (${allNotes.length})</span>
        </span>
        <span class="text-xs font-normal text-stone-400">(${curP}/${totalP}p)</span>
      </div>

      ${allNotes.length === 0 ? `
        <div class="bg-white dark:bg-stone-900/50 p-6 rounded-xl border border-stone-200/60 dark:border-stone-800 text-center text-xs text-stone-400">
          아직 저장된 필사 기록이 없습니다. 문장을 필사하면 이곳에 자동으로 기록됩니다!
        </div>
      ` : `
        <div class="space-y-2">
          ${pagedItems.map(note => `
            <div class="bg-white dark:bg-stone-900 p-3.5 rounded-xl border border-stone-200/70 dark:border-stone-800 flex items-start justify-between gap-3 shadow-2xs hover:border-stone-300 transition-all">
              <div class="space-y-1 min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">${note.title}</span>
                  <span class="text-[10px] text-stone-400">${new Date(note.completedAt).toLocaleDateString()}</span>
                </div>
                <p class="font-serif text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">"${note.text}"</p>
                ${note.cpm > 0 ? `
                  <div class="text-[10px] text-stone-400 flex items-center gap-2 pt-0.5">
                    <span>속도: ${note.cpm} CPM</span>
                    <span>•</span>
                    <span>정확도: ${note.accuracy}%</span>
                  </div>
                ` : ''}
              </div>
              <button data-delete-note-id="${note.id}" class="btn-delete-note p-1 text-stone-300 hover:text-rose-500 rounded transition-colors cursor-pointer" title="삭제">
                <span class="material-symbols-outlined text-base">delete</span>
              </button>
            </div>
          `).join('')}
        </div>

        <!-- Pagination Controls (AJAX In-Place Navigation) -->
        ${totalP > 1 ? `
          <div class="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-stone-800/80 text-xs font-sans">
            <button id="btn-prev-typing-note-page" class="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold transition-all cursor-pointer ${curP > 1 ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700' : 'bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'}" ${curP <= 1 ? 'disabled' : ''}>
              ◀ 이전
            </button>
            <span class="text-xs font-bold text-stone-700 dark:text-stone-300">
              ${curP} / ${totalP} 페이지
            </span>
            <button id="btn-next-typing-note-page" class="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold transition-all cursor-pointer ${curP < totalP ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700' : 'bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'}" ${curP >= totalP ? 'disabled' : ''}>
              다음 ▶
            </button>
          </div>
        ` : ''}
      `}
    `;

    // Re-attach pagination handlers inside the updated container
    drawerContainer.querySelector('#btn-prev-typing-note-page')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (curP > 1) {
        state.typingNotePage = curP - 1;
        updateNotesDrawerList(curP - 1);
      }
    });

    drawerContainer.querySelector('#btn-next-typing-note-page')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (curP < totalP) {
        state.typingNotePage = curP + 1;
        updateNotesDrawerList(curP + 1);
      }
    });

    // Delete note handler
    drawerContainer.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteId = e.currentTarget.dataset.deleteNoteId;
        updateDB(data => {
          data.typingNotes = (data.typingNotes || []).filter(n => n.id !== noteId);
        });
        updateNotesDrawerList(curP);
      });
    });
  }

  // Initial call for notes drawer
  updateNotesDrawerList(state.typingNotePage || 1);

  const hiddenInput = container.querySelector('#typing-hidden-input');
  const typingDisplay = container.querySelector('#typing-display');
  const progressBar = container.querySelector('#progress-bar');
  const progressPercent = container.querySelector('#progress-percent');
  const progressCount = container.querySelector('#progress-count');

  const cpmEl = container.querySelector('#stat-cpm');
  const wpmEl = container.querySelector('#stat-wpm');
  const accEl = container.querySelector('#stat-accuracy');
  const errEl = container.querySelector('#stat-errors');
  const canvasWrap = container.querySelector('#typing-canvas-wrap');

  function updateCaretPosition() {
    const currentEl = container.querySelector('.char-current');
    const caretEl = container.querySelector('#typing-active-caret');
    const canvasWrapEl = container.querySelector('#typing-canvas-wrap');

    if (currentEl && caretEl && canvasWrapEl) {
      const canvasRect = canvasWrapEl.getBoundingClientRect();
      const currentRect = currentEl.getBoundingClientRect();

      const left = currentRect.left - canvasRect.left;
      const top = currentRect.bottom - canvasRect.top - 4;
      const width = Math.max(10, currentRect.width);

      caretEl.style.left = `${left}px`;
      caretEl.style.top = `${top}px`;
      caretEl.style.width = `${width}px`;
      caretEl.style.opacity = '1';
    }
  }

  setTimeout(() => {
    hiddenInput?.focus();
    updateCaretPosition();
  }, 50);

  setTimeout(() => {
    updateCaretPosition();
  }, 200);

  window.addEventListener('resize', updateCaretPosition);

  canvasWrap?.addEventListener('click', () => {
    hiddenInput?.focus();
  });

  hiddenInput?.addEventListener('input', (e) => {
    if (isCompleted) return;

    const prevLength = typedText.length;
    typedText = e.target.value;

    if (!startTime && typedText.length > 0) {
      startTime = Date.now();
      if (isGameMode) {
        timerInterval = setInterval(updateStats, 200);
      }
    }

    // Play Keystroke Audio Feedback
    if (typedText.length > prevLength) {
      const lastCharIndex = typedText.length - 1;
      if (lastCharIndex < activeQuote.length && typedText[lastCharIndex] !== activeQuote[lastCharIndex]) {
        soundEngine.playErrorSound();
      } else {
        const lastInputChar = typedText[lastCharIndex];
        if (lastInputChar === ' ' || lastInputChar === '\n') {
          soundEngine.playSpaceOrEnter();
        } else {
          soundEngine.playKeySound(state.soundType);
        }
      }
    }

    // Update Progress UI
    const progressRatio = Math.min(1, typedText.length / activeQuote.length);
    const pct = Math.round(progressRatio * 100);
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
    if (progressCount) progressCount.textContent = `${typedText.length} / ${activeQuote.length}자`;

    typingDisplay.innerHTML = renderCharSpans(activeQuote, typedText);
    updateCaretPosition();
    
    if (isGameMode) {
      updateStats();
    }

    // Check Completion
    if (typedText.length >= activeQuote.length && typedText === activeQuote) {
      isCompleted = true;
      if (timerInterval) clearInterval(timerInterval);
      
      soundEngine.playSuccessChime();

      const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 1;
      const stats = calculateTypingStats(activeQuote, typedText, elapsedSeconds);

      // Silently save note to history notebook
      saveTypingNote(activeSource, activeQuote, isGameMode ? stats.cpm : '0', `${stats.accuracy}%`, stats.errors);

      // Auto advance to next sentence in-place seamlessly without page refresh!
      if (state.autoNextQuote) {
        setTimeout(advanceToNextQuote, 400);
      } else {
        setTimeout(() => {
          showCompletionModal(activeQuote, activeSource, activeAuthor, activePublisher, stats, isGameMode, advanceToNextQuote);
        }, 300);
      }
    }
  });

  function advanceToNextQuote() {
    const nextObj = getRandomQuote(state.typingSourceMode || 'RECOMMENDED', activeQuote);
    
    activeQuote = nextObj.quote;
    activeSource = nextObj.title;
    activeAuthor = nextObj.author;
    activePublisher = nextObj.publisher || '민음사';
    activePage = nextObj.page || null;

    typedText = '';
    if (hiddenInput) hiddenInput.value = '';
    startTime = null;
    isCompleted = false;

    // Update DOM in-place seamlessly!
    if (typingDisplay) typingDisplay.innerHTML = renderCharSpans(activeQuote, '');

    const footerMeta = container.querySelector('#typing-card-footer-meta');
    if (footerMeta) {
      footerMeta.innerHTML = `
        <span class="font-bold text-stone-900 dark:text-stone-100 truncate">${activeSource}${activePage ? ` (${activePage}p)` : ''}</span>
        <span class="text-stone-300 dark:text-stone-700">/</span>
        <span class="truncate">${activeAuthor || '작자 미상'}</span>
        <span class="text-stone-300 dark:text-stone-700">/</span>
        <span class="text-stone-400 dark:text-stone-500 truncate">${activePublisher}</span>
      `;
    }

    const iconLike = container.querySelector('#icon-like-quote');
    if (iconLike) {
      iconLike.textContent = 'favorite_border';
      iconLike.classList.remove('text-rose-500');
      iconLike.classList.add('text-stone-400');
    }

    updateCaretPosition();
    hiddenInput?.focus();
  }

  function updateStats() {
    if (!startTime || !isGameMode) return;
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const stats = calculateTypingStats(activeQuote, typedText, elapsedSeconds);

    if (cpmEl) cpmEl.textContent = stats.cpm;
    if (wpmEl) wpmEl.textContent = stats.wpm;
    if (accEl) accEl.textContent = `${stats.accuracy}%`;
    if (errEl) errEl.textContent = stats.errors;
  }

  // Event Handlers for Controls
  container.querySelectorAll('.btn-practice-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      soundEngine.playSpaceOrEnter();
      const pm = e.currentTarget.dataset.practiceMode;
      setState({ typingPracticeMode: pm });
    });
  });

  container.querySelectorAll('.btn-source-mode').forEach(btn => {
    btn.addEventListener('click', (e) => {
      soundEngine.playSpaceOrEnter();
      const sm = e.currentTarget.dataset.sourceMode;
      const nextObj = getRandomQuote(sm);
      setState({
        typingSourceMode: sm,
        activeTyping: {
          text: nextObj.quote,
          source: nextObj.title,
          author: nextObj.author,
          publisher: nextObj.publisher,
          page: nextObj.page
        }
      });
    });
  });

  // Toggle Auto-Next Sentence Feature
  container.querySelector('#btn-toggle-autonext')?.addEventListener('click', () => {
    soundEngine.playSpaceOrEnter();
    setState({ autoNextQuote: !state.autoNextQuote });
  });

  // Manual Change Quote Button
  container.querySelector('#btn-next-random')?.addEventListener('click', () => {
    soundEngine.playSpaceOrEnter();
    const nextObj = getRandomQuote(state.typingSourceMode || 'RECOMMENDED');
    setState({
      activeTyping: {
        text: nextObj.quote,
        source: nextObj.title,
        author: nextObj.author
      }
    });
  });

  // 1. Like Button (Save sentence to user's collection)
  const btnLike = container.querySelector('#btn-like-quote');
  const iconLike = container.querySelector('#icon-like-quote');
  btnLike?.addEventListener('click', () => {
    soundEngine.playSpaceOrEnter();
    updateDBSilent(data => {
      if (!data.myQuotes) data.myQuotes = [];
      const exists = data.myQuotes.some(q => q.text === activeQuote);
      if (!exists) {
        data.myQuotes.unshift({
          id: 'mq_' + Date.now(),
          text: activeQuote,
          bookTitle: activeSource,
          author: activeAuthor,
          createdAt: new Date().toISOString()
        });
      }
    });
    if (iconLike) {
      iconLike.textContent = 'favorite';
      iconLike.classList.add('text-rose-500');
      iconLike.classList.remove('text-stone-400');
    }
    alert('내 문장 수집란에 수집되었습니다! (내 서재에서 확인 가능)');
  });

  // 2. Transcription Note Button
  container.querySelector('#btn-save-note')?.addEventListener('click', () => {
    soundEngine.playSpaceOrEnter();
    saveTypingNote(activeSource, activeQuote, isGameMode ? (cpmEl?.textContent || '0') : '0', '100%', '0');
    alert('필사 노트 수집란에 저장되었습니다!');
  });

  // 3. More Options Menu Toggle (Dots)
  const btnMore = container.querySelector('#btn-more-options');
  const menuMore = container.querySelector('#menu-more-options');

  btnMore?.addEventListener('click', (e) => {
    e.stopPropagation();
    menuMore?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!menuMore?.contains(e.target) && e.target !== btnMore) {
      menuMore?.classList.add('hidden');
    }
  });

  // Menu Items: Copy & Report
  container.querySelector('#menu-item-copy')?.addEventListener('click', () => {
    navigator.clipboard.writeText(`"${activeQuote}" — ${activeSource}`);
    menuMore?.classList.add('hidden');
    alert('문장이 클립보드에 복사되었습니다.');
  });

  container.querySelector('#menu-item-report')?.addEventListener('click', () => {
    menuMore?.classList.add('hidden');
    alert('해당 문장이 신고 접수되었습니다. 검토 후 조치하겠습니다.');
  });

  // History Note Delete Buttons
  container.querySelectorAll('.btn-delete-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const noteId = e.currentTarget.dataset.deleteNoteId;
      updateDB(data => {
        data.typingNotes = (data.typingNotes || []).filter(n => n.id !== noteId);
      });
    });
  });
}

function renderCharSpans(target, typed) {
  const tokens = getDisplayTokens(target, typed);
  return tokens.map(token => {
    const isSpace = token.char === ' ';
    const isPunct = /[.,!?'"~:;\-–—()]/ .test(token.char);
    const statusClass = `char-${token.status}`;
    const spaceClass = isSpace ? 'char-space' : (isPunct ? 'char-punct' : '');
    const displayChar = isSpace ? '&nbsp;' : token.char;
    return `<span class="char-item ${statusClass} ${spaceClass}">${displayChar}</span>`;
  }).join('');
}

function saveTypingNote(title, text, cpm, accuracy, errors) {
  updateDBSilent(data => {
    if (!data.typingNotes) data.typingNotes = [];
    data.typingNotes.unshift({
      id: 't_' + Date.now(),
      title,
      text,
      cpm: parseInt(cpm) || 0,
      accuracy: parseInt(accuracy) || 100,
      errors: parseInt(errors) || 0,
      completedAt: new Date().toISOString()
    });
  });
}

function showCompletionModal(quote, source, author, publisher, stats, isGameMode, onNext) {
  document.querySelector('#modal-completion-overlay')?.remove();

  const modalHtml = `
    <div id="modal-completion-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
        
        <!-- Header Icon & Title -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-500 text-xl">auto_awesome</span>
            <h3 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100">${isGameMode ? '타자 연습 완필 카드' : '완필 카드'}</h3>
          </div>
          <span class="text-[11px] font-sans font-medium text-stone-400">자동 생성됨</span>
        </div>

        <!-- Automatically Generated Literary Postcard / Image Card -->
        <div id="transcription-card-preview" class="relative rounded-xl overflow-hidden shadow-md border border-stone-200/80 dark:border-stone-700 bg-[#F5F4F0] dark:bg-[#1C1917] p-5 sm:p-6 text-left font-serif transition-all">
          <div class="text-3xl text-stone-400/60 leading-none select-none font-serif font-bold mb-1">“</div>

          <p class="text-sm sm:text-base text-stone-800 dark:text-stone-100 leading-relaxed font-serif tracking-tight font-medium select-text pb-4 border-b border-stone-300/50 dark:border-stone-700/60">
            "${quote}"
          </p>

          <div class="flex items-end justify-between pt-3 text-xs">
            <div class="space-y-0.5 min-w-0">
              <span class="block font-bold text-stone-900 dark:text-stone-100 truncate">${source}</span>
              <span class="block text-[11px] text-stone-500 dark:text-stone-400 truncate">${author || '작자 미상'} ${publisher ? `· ${publisher}` : ''}</span>
            </div>
            
            <div class="text-right shrink-0">
              <span class="block text-[10px] text-stone-400 uppercase tracking-widest font-sans font-bold">고요한 필사</span>
              <span class="block text-[10px] text-stone-400 font-sans">${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        ${isGameMode ? `
          <!-- Game Stats Summary Grid -->
          <div class="grid grid-cols-4 gap-2 text-center text-xs">
            <div class="bg-stone-100/80 dark:bg-stone-800/80 p-2 rounded-xl">
              <span class="text-[10px] text-stone-400 block font-bold">속도</span>
              <span class="zen-stat-num text-base sm:text-lg block">${stats ? stats.cpm : 0}</span>
              <span class="text-[9px] text-stone-400">CPM</span>
            </div>
            <div class="bg-stone-100/80 dark:bg-stone-800/80 p-2 rounded-xl">
              <span class="text-[10px] text-stone-400 block font-bold">WPM</span>
              <span class="zen-stat-num text-base sm:text-lg block">${stats ? stats.wpm : 0}</span>
              <span class="text-[9px] text-stone-400">단어/분</span>
            </div>
            <div class="bg-stone-100/80 dark:bg-stone-800/80 p-2 rounded-xl">
              <span class="text-[10px] text-stone-400 block font-bold">정확도</span>
              <span class="zen-stat-num text-base sm:text-lg block text-emerald-600 dark:text-emerald-400">${stats ? stats.accuracy : 100}%</span>
              <span class="text-[9px] text-stone-400">일치율</span>
            </div>
            <div class="bg-stone-100/80 dark:bg-stone-800/80 p-2 rounded-xl">
              <span class="text-[10px] text-stone-400 block font-bold">오타</span>
              <span class="zen-stat-num text-base sm:text-lg block text-rose-600 dark:text-rose-400">${stats ? stats.errors : 0}</span>
              <span class="text-[9px] text-stone-400">오타수</span>
            </div>
          </div>
        ` : ''}

        <!-- Modal Action Buttons: [💾 카드 저장] / [✕ 닫기] / [🔄 다음 문장] -->
        <div class="flex items-center gap-2 pt-2">
          <button id="btn-completion-modal-save-card" class="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer" title="화면의 완필 카드 이미지 다운로드">
            <span class="material-symbols-outlined text-sm">download</span>
            <span>카드 저장</span>
          </button>
          <button id="btn-completion-modal-close" class="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold text-xs transition-all cursor-pointer">
            닫기
          </button>
          <button id="btn-completion-modal-next" class="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm">
            <span class="material-symbols-outlined text-sm">autorenew</span>
            <span>다음 문장</span>
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.querySelector('#modal-completion-overlay');
  
  modalEl?.querySelector('#btn-completion-modal-save-card')?.addEventListener('click', () => {
    downloadExactQuoteCardPNG(quote, source, author, publisher);
  });

  modalEl?.querySelector('#btn-completion-modal-close')?.addEventListener('click', () => {
    modalEl.remove();
  });

  modalEl?.querySelector('#btn-completion-modal-next')?.addEventListener('click', () => {
    modalEl.remove();
    onNext();
  });
}

function downloadExactQuoteCardPNG(quote, title, author, publisher) {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background Tone (#F5F4F0 - Antique Paper)
  ctx.fillStyle = '#F5F4F0';
  ctx.fillRect(0, 0, 600, 600);

  // Outer Border Frame Line
  ctx.strokeStyle = '#E7E5E4';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, 540, 540);

  // Top Quote Mark “
  ctx.fillStyle = 'rgba(168, 162, 158, 0.6)';
  ctx.font = 'bold 64px "Noto Serif KR", serif';
  ctx.fillText('“', 55, 105);

  // Main Quote Text
  ctx.font = '500 22px "Noto Serif KR", serif';
  ctx.fillStyle = '#1C1917';

  const words = quote.split(' ');
  let line = '';
  let y = 165;
  const maxWidth = 480;
  const lineHeight = 40;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, 55, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 55, y);

  // Divider Line
  const dividerY = Math.max(y + 45, 430);
  ctx.beginPath();
  ctx.moveTo(55, dividerY);
  ctx.lineTo(545, dividerY);
  ctx.strokeStyle = '#D6D3D1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Book Title
  ctx.font = 'bold 20px "Noto Serif KR", serif';
  ctx.fillStyle = '#1C1917';
  ctx.fillText(title, 55, dividerY + 45);

  // Author & Publisher
  ctx.font = '14px "Noto Serif KR", serif';
  ctx.fillStyle = '#78716C';
  ctx.fillText(`${author || '작자 미상'} ${publisher ? `· ${publisher}` : ''}`, 55, dividerY + 70);

  // Right Signature: GOYOHAN FILSA & Date
  ctx.textAlign = 'right';
  ctx.font = 'bold 11px Pretendard, sans-serif';
  ctx.fillStyle = '#A8A29E';
  ctx.fillText('고요한 필사', 545, dividerY + 45);

  ctx.font = '11px Pretendard, sans-serif';
  ctx.fillText(new Date().toLocaleDateString(), 545, dividerY + 68);

  // Download Action
  const link = document.createElement('a');
  link.download = `완필카드_${title}_${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

