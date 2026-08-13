/**
 * My Page (프로필) & Settings Modal Component
 */
import { state, setState, db } from '../state.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

export function renderMyPage(container) {
  const books = db.books || [];
  const records = db.records || [];
  const notes = db.typingNotes || [];

  const doneCount = books.filter(b => b.status === 'DONE').length;

  // Pagination for Typing Notes (10 items per page)
  const pageSize = 10;
  const currentPage = Math.min(state.notePage || 1, Math.max(1, Math.ceil(notes.length / pageSize)));
  const totalPages = Math.max(1, Math.ceil(notes.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedNotes = notes.slice(startIndex, startIndex + pageSize);

  container.innerHTML = `
    <div class="space-y-4 animate-fade-in font-sans">
      
      <!-- Profile Header (Top Right: Gear Icon for Settings Modal Popup) -->
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between gap-4">
        
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl flex items-center justify-center text-xl font-bold font-serif shadow-md shrink-0">
            독자
          </div>
          <div>
            <h2 class="font-bold text-stone-900 dark:text-stone-100 text-lg">빛나는 문장을 모으는 독자</h2>
            <p class="text-xs text-stone-500 dark:text-stone-400">문장수집가 2nd와 함께하는 고요한 독서 여정</p>
          </div>
        </div>

        <!-- Profile Top Right Action Buttons: Admin Console & Settings -->
        <div class="flex items-center gap-1.5 shrink-0">
          <button id="btn-open-admin-from-profile" class="px-3 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl transition-all cursor-pointer font-bold text-xs flex items-center gap-1.5 shadow-xs" title="관리자 대시보드 센터">
            <span class="material-symbols-outlined text-base">admin_panel_settings</span>
            <span>관리자 센터</span>
          </button>
          <button id="btn-open-settings" class="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer shrink-0" title="필사 환경 & 테마 설정">
            <span class="material-symbols-outlined text-2xl">settings</span>
          </button>
        </div>

      </div>

      <!-- Reading Analytics Summary Card -->
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-1.5">
          <span class="material-symbols-outlined text-stone-800 dark:text-stone-200">insights</span>
          <span>독서 및 필사 통계</span>
        </h3>
        
        <div class="grid grid-cols-3 gap-2.5 text-center pt-1">
          <div class="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <div class="text-[11px] text-stone-500 dark:text-stone-400 font-medium">수집 문장</div>
            <div class="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">${records.length}개</div>
          </div>

          <div class="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <div class="text-[11px] text-stone-500 dark:text-stone-400 font-medium">완독 도서</div>
            <div class="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">${doneCount}권</div>
          </div>

          <div class="bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60">
            <div class="text-[11px] text-stone-500 dark:text-stone-400 font-medium">완료한 필사</div>
            <div class="text-xl font-bold font-serif text-stone-900 dark:text-stone-100 mt-0.5">${notes.length}회</div>
          </div>
        </div>
      </div>

      <!-- Saved Typing Notes History Drawer (AJAX Partial DOM Update, Paged max 10 per page) -->
      <div id="mypage-notes-drawer-container" class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-3">
        <!-- Rendered dynamically by updateMyPageNotesList() without full page reload -->
      </div>

    </div>
  `;

  // Function: In-Place Partial DOM Update (AJAX / SPA Partial Re-render)
  function updateMyPageNotesList(page) {
    const drawerContainer = container.querySelector('#mypage-notes-drawer-container');
    if (!drawerContainer) return;

    const allNotes = db.typingNotes || [];
    const pSize = 5;
    const totalP = Math.max(1, Math.ceil(allNotes.length / pSize));
    const curP = Math.min(Math.max(1, page), totalP);
    const startIdx = (curP - 1) * pSize;
    const pagedItems = allNotes.slice(startIdx, startIdx + pSize);

    drawerContainer.innerHTML = `
      <h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <span class="material-symbols-outlined text-stone-800 dark:text-stone-200">history_edu</span>
          <span>나의 필사 노트 기록</span>
        </span>
        <span class="text-xs font-normal text-stone-400">총 ${allNotes.length}건 (${curP}/${totalP}p)</span>
      </h3>

      <div class="space-y-2.5">
        ${allNotes.length === 0 ? `
          <p class="text-xs text-stone-400 text-center py-8">아직 저장된 필사 노치가 없습니다. 필사를 완성하면 이곳에 기록됩니다.</p>
        ` : pagedItems.map(n => `
          <div class="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100">${n.title}</span>
              <span class="text-stone-400 text-[11px]">${formatRelativeTime(n.completedAt)}</span>
            </div>
            <p class="text-xs font-serif text-stone-700 dark:text-stone-300 line-clamp-2 leading-relaxed">“${n.text}”</p>
            <div class="flex items-center gap-3 text-[10px] text-stone-400 pt-1">
              <span>속도: <b class="text-stone-900 dark:text-stone-100 font-bold">${n.cpm} CPM</b></span>
              <span>정확도: <b class="text-stone-800 dark:text-stone-200 font-bold">${n.accuracy}%</b></span>
              <span>오타: <b>${n.errors}개</b></span>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Pagination Controls (AJAX In-Place Navigation) -->
      ${totalP > 1 ? `
        <div class="flex items-center justify-between pt-3 border-t border-stone-200/60 dark:border-stone-800/80 text-xs font-sans">
          <button id="btn-prev-mypage-note-page" class="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold transition-all cursor-pointer ${curP > 1 ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700' : 'bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'}" ${curP <= 1 ? 'disabled' : ''}>
            ◀ 이전
          </button>
          <span class="text-xs font-bold text-stone-700 dark:text-stone-300">
            ${curP} / ${totalP} 페이지
          </span>
          <button id="btn-next-mypage-note-page" class="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 font-bold transition-all cursor-pointer ${curP < totalP ? 'bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700' : 'bg-stone-100 dark:bg-stone-800/40 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'}" ${curP >= totalP ? 'disabled' : ''}>
            다음 ▶
          </button>
        </div>
      ` : ''}
    `;

    // Re-attach pagination handlers
    drawerContainer.querySelector('#btn-prev-mypage-note-page')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (curP > 1) {
        state.notePage = curP - 1;
        updateMyPageNotesList(curP - 1);
      }
    });

    drawerContainer.querySelector('#btn-next-mypage-note-page')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (curP < totalP) {
        state.notePage = curP + 1;
        updateMyPageNotesList(curP + 1);
      }
    });
  }

  // Initial call for MyPage notes drawer
  updateMyPageNotesList(state.notePage || 1);

  // Admin Console Button Click Handler
  container.querySelector('#btn-open-admin-from-profile')?.addEventListener('click', () => {
    setState({ tab: 'admin' });
  });

  // Gear Icon Click Handler: Open Settings Popup Modal
  container.querySelector('#btn-open-settings')?.addEventListener('click', () => {
    renderSettingsModal();
  });
}

function renderSettingsModal() {
  document.querySelector('#modal-settings-overlay')?.remove();

  const modalHtml = `
    <div id="modal-settings-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 text-left">
        
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-xl">settings</span>
            <h3 class="font-bold text-base text-stone-900 dark:text-stone-100">필사 환경 & 테마 설정</h3>
          </div>
          <button id="btn-close-settings-modal" class="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 rounded-lg cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- 1. Theme Option (Light vs Dark) -->
        <div class="space-y-2 text-xs">
          <span class="font-bold text-stone-700 dark:text-stone-300 block">화면 테마</span>
          <div class="grid grid-cols-2 gap-2">
            <button id="btn-theme-light" class="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${state.theme !== 'dark' ? 'bg-stone-900 text-white border-stone-900 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}">
              <span>☀️ 라이트 모드</span>
            </button>
            <button id="btn-theme-dark" class="py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all cursor-pointer ${state.theme === 'dark' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'}">
              <span>🌙 다크 모드</span>
            </button>
          </div>
        </div>

        <!-- 2. Font Choice Option -->
        <div class="space-y-2 text-xs">
          <span class="font-bold text-stone-700 dark:text-stone-300 block">필사 서체 폰트</span>
          <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            <button data-font="typing-font-batang" class="btn-select-font py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer font-batang ${state.typingFont === 'typing-font-batang' || !state.typingFont ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              바탕체
            </button>
            <button data-font="typing-font-serif" class="btn-select-font py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer font-serif ${state.typingFont === 'typing-font-serif' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              명조체
            </button>
            <button data-font="typing-font-sans" class="btn-select-font py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer font-sans ${state.typingFont === 'typing-font-sans' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              고딕체
            </button>
            <button data-font="typing-font-nanum" class="btn-select-font py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer font-serif ${state.typingFont === 'typing-font-nanum' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              나눔명조
            </button>
            <button data-font="typing-font-maru" class="btn-select-font py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer font-serif ${state.typingFont === 'typing-font-maru' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              마루부리
            </button>
          </div>
        </div>

        <!-- 3. Sound Option -->
        <div class="space-y-2 text-xs">
          <span class="font-bold text-stone-700 dark:text-stone-300 block">타이핑 효과음</span>
          <div class="grid grid-cols-3 gap-1.5">
            <button data-sound="mechanical" class="btn-select-sound py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer ${state.soundType === 'mechanical' || !state.soundType ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              ⌨️ 기계식
            </button>
            <button data-sound="typewriter" class="btn-select-sound py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer ${state.soundType === 'typewriter' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              📜 타자기
            </button>
            <button data-sound="pen" class="btn-select-sound py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl text-center transition-all cursor-pointer ${state.soundType === 'pen' ? 'ring-2 ring-stone-900 dark:ring-stone-100 font-bold bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100' : 'text-stone-600 dark:text-stone-400'}">
              ✍️ 펜 소리
            </button>
          </div>
        </div>

        <!-- Footer Close Button -->
        <div class="pt-2">
          <button id="btn-confirm-settings" class="w-full py-2.5 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer">
            완료
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.querySelector('#modal-settings-overlay');

  modalEl?.querySelector('#btn-close-settings-modal')?.addEventListener('click', () => modalEl.remove());
  modalEl?.querySelector('#btn-confirm-settings')?.addEventListener('click', () => modalEl.remove());

  modalEl?.querySelector('#btn-theme-light')?.addEventListener('click', () => {
    document.documentElement.classList.remove('dark');
    setState({ theme: 'light' });
    modalEl.remove();
  });

  modalEl?.querySelector('#btn-theme-dark')?.addEventListener('click', () => {
    document.documentElement.classList.add('dark');
    setState({ theme: 'dark' });
    modalEl.remove();
  });

  modalEl?.querySelectorAll('.btn-select-font').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const font = e.currentTarget.dataset.font;
      setState({ typingFont: font });
      modalEl.remove();
    });
  });

  modalEl?.querySelectorAll('.btn-select-sound').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sound = e.currentTarget.dataset.sound;
      setState({ soundType: sound });
      modalEl.remove();
    });
  });
}
