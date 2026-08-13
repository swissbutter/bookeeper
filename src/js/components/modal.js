/**
 * Modal & BottomSheet Component System
 * Ported Book Search Engine & Edition Picker from Original bookkeeper-main/index.html
 * Optimization: Instant 0ms Local Matching + Real-Time Search Debounce Engine
 */
import { state, setState, db, updateDB } from '../state.js';
import { searchBooksMultiSource, fetchAladinPageCount } from '../api/bookApi.js';
import { DEFAULT_BOOK_COVER } from '../utils/imageUtils.js';

export function renderModalContainer() {
  const modalEl = document.getElementById('modal-container');
  if (!modalEl) return;

  if (!state.modal) {
    modalEl.classList.add('hidden');
    modalEl.innerHTML = '';
    return;
  }

  modalEl.classList.remove('hidden');

  if (state.modal.type === 'SEARCH') {
    renderSearchModal(modalEl);
  } else if (state.modal.type === 'ADD_RECORD') {
    renderAddRecordModal(modalEl);
  } else if (state.modal.type === 'EDITION_PICKER') {
    renderEditionPickerModal(modalEl);
  }
}

function renderSearchModal(container) {
  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div class="bg-white w-full max-w-lg rounded-t-5px sm:rounded-5px max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
        
        <!-- Header -->
        <div class="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <h3 class="font-bold text-stone-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-stone-800">search</span>
            <span>도서 검색</span>
          </h3>
          <button id="modal-close-btn" class="p-1 text-stone-400 hover:text-stone-700 rounded-5px cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Search Input with Target Filter -->
        <div class="p-4 border-b border-stone-100 flex gap-2">
          <select id="modal-search-target" class="px-2.5 py-2 bg-stone-100 border border-stone-300 rounded-5px text-xs font-bold text-stone-700 focus:outline-none focus:border-stone-800">
            <option value="title">제목</option>
            <option value="person">저자</option>
            <option value="publisher">출판사</option>
            <option value="isbn">ISBN</option>
          </select>
          <input type="text" id="modal-search-input" placeholder="책 제목, 저자, ISBN 입력..." class="flex-1 px-3.5 py-2 bg-stone-100 border border-stone-300 rounded-5px text-xs focus:outline-none focus:border-stone-800" />
          <button id="modal-search-exec" class="bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-5px text-xs shadow-sm transition-colors cursor-pointer">
            검색
          </button>
        </div>

        <!-- Multi-Source API Results List -->
        <div id="modal-search-results" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px]">
          <div class="text-center py-12 text-stone-400 text-xs">
            검색어를 입력하고 검색 버튼을 누르거나 입력을 완료하세요.
          </div>
        </div>

      </div>
    </div>
  `;

  const closeBtn = container.querySelector('#modal-close-btn');
  closeBtn?.addEventListener('click', () => setState({ modal: null }));

  const searchInput = container.querySelector('#modal-search-input');
  const searchTargetSelect = container.querySelector('#modal-search-target');
  const searchExec = container.querySelector('#modal-search-exec');
  const resultsContainer = container.querySelector('#modal-search-results');

  let debounceTimer = null;
  let activeSearchBooks = [];

  const renderBookItems = (books) => {
    activeSearchBooks = books || [];
    if (!books || books.length === 0) {
      resultsContainer.innerHTML = `<div class="text-center py-12 text-stone-400 text-xs">검색 결과가 없습니다.</div>`;
      return;
    }

    resultsContainer.innerHTML = books.map((b, idx) => {
      const editionCount = (b.editions && b.editions.length > 1) ? b.editions.length : 0;
      return `
        <div class="flex gap-3.5 p-3.5 bg-stone-50 hover:bg-stone-100 rounded-5px border border-stone-200 transition-all items-center">
          <img src="${b.thumbnail || DEFAULT_BOOK_COVER}" alt="${b.title}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-14 h-20 object-cover rounded-5px shadow-md flex-shrink-0" />
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 bg-stone-200 text-stone-900 text-[10px] font-bold rounded-5px">${b.source}</span>
              ${editionCount > 0 ? `<span class="px-2 py-0.5 bg-stone-800 text-white text-[10px] font-bold rounded-5px">판본 ${editionCount}개</span>` : ''}
              ${b.pubDate ? `<span class="text-[10px] text-stone-400">발행: ${b.pubDate}</span>` : ''}
            </div>
            <h4 class="font-bold text-stone-900 text-xs truncate">${b.title}</h4>
            <p class="text-[11px] text-stone-500 truncate">${b.author} · ${b.publisher}</p>
            <p class="text-[10px] text-stone-400 truncate">ISBN: ${b.isbn || '미기재'} | 총 ${b.totalPage || 300}p</p>
          </div>
          
          <div class="flex flex-col gap-1.5 flex-shrink-0">
            <button data-book-index="${idx}" class="btn-add-to-lib bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-2 rounded-5px font-bold transition-colors shadow-sm cursor-pointer">
              서재 추가
            </button>
            ${editionCount > 1 ? `
              <button data-book-index="${idx}" class="btn-pick-edition text-[11px] text-stone-700 hover:underline font-bold px-2 py-1 cursor-pointer">
                판본 선택 (${editionCount})
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.querySelectorAll('.btn-add-to-lib').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const idx = parseInt(e.currentTarget.dataset.bookIndex, 10);
        const bookData = activeSearchBooks[idx];
        if (bookData) {
          addBookToLibrary(bookData);
        }
      });
    });

    resultsContainer.querySelectorAll('.btn-pick-edition').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.bookIndex, 10);
        const bookData = activeSearchBooks[idx];
        if (bookData) {
          setState({
            modal: {
              type: 'EDITION_PICKER',
              parentBook: bookData
            }
          });
        }
      });
    });
  };

  const doSearch = async () => {
    const q = searchInput.value.trim();
    const target = searchTargetSelect.value;
    if (!q) return;

    // Show loading skeleton
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center py-12 text-stone-500 gap-2">
        <span class="material-symbols-outlined animate-spin text-3xl text-stone-800">sync</span>
        <span class="text-xs font-bold">초고속 멀티 API 통합 검색 중...</span>
      </div>
    `;

    const books = await searchBooksMultiSource(q, target);
    renderBookItems(books);
  };

  searchExec?.addEventListener('click', doSearch);

  searchInput?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (searchInput.value.trim().length >= 2) {
        doSearch();
      }
    }, 250);
  });

  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      clearTimeout(debounceTimer);
      doSearch();
    }
  });
}

function renderEditionPickerModal(container) {
  const parentBook = state.modal.parentBook;
  const editions = parentBook?.editions || [parentBook];

  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-5px max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-fade-scale">
        
        <div class="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 class="font-bold text-stone-900 text-sm">도서 판본 선택 (${editions.length}개)</h3>
            <p class="text-xs text-stone-500 truncate">${parentBook.title}</p>
          </div>
          <button id="modal-close-btn" class="p-1 text-stone-400 hover:text-stone-700 rounded-5px cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          ${editions.map((ed, edIdx) => `
            <div class="p-3 bg-stone-50 hover:bg-stone-100 rounded-5px border border-stone-200 flex gap-3 items-center">
              <img src="${ed.thumbnail || parentBook.thumbnail || DEFAULT_BOOK_COVER}" alt="${ed.title}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-12 h-16 object-cover rounded-5px shadow-sm flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-stone-900 text-xs truncate">${ed.title}</h4>
                <p class="text-[11px] text-stone-500 truncate">${ed.publisher} · ${ed.pubDate || '발행일 미상'}</p>
                <p class="text-[10px] text-stone-400">ISBN: ${ed.isbn || '미기재'} | ${ed.totalPage || 300}p</p>
              </div>
              <button data-edition-index="${edIdx}" class="btn-select-edition bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-2 rounded-5px font-bold transition-colors flex-shrink-0 cursor-pointer">
                선택
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    </div>
  `;

  container.querySelector('#modal-close-btn')?.addEventListener('click', () => setState({ modal: null }));

  container.querySelectorAll('.btn-select-edition').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const edIdx = parseInt(e.currentTarget.dataset.editionIndex, 10);
      const editionData = editions[edIdx];
      if (editionData) {
        addBookToLibrary(editionData);
      }
    });
  });
}

async function addBookToLibrary(bookData) {
  const exists = db.books.some(item => item.title === bookData.title && item.publisher === bookData.publisher);

  if (exists) {
    alert('이미 서재에 등록된 도서입니다.');
    return;
  }

  let finalPage = bookData.totalPage;
  if (!finalPage && bookData.isbn) {
    const fetchedPage = await fetchAladinPageCount(bookData.isbn);
    if (fetchedPage) finalPage = fetchedPage;
  }

  updateDB(data => {
    data.books.unshift({
      id: 'b_' + Date.now(),
      title: bookData.title,
      author: bookData.author || '저자 미상',
      publisher: bookData.publisher || '출판사 미상',
      thumbnail: bookData.thumbnail || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      totalPage: finalPage || 300,
      curPage: 0,
      status: 'WANT',
      genre: bookData.genre || '소설',
      rating: 4.8,
      startDate: '',
      finishDate: ''
    });
  });

  alert(`"${bookData.title}"이(가) 서재에 추가되었습니다!`);
  setState({ modal: null, tab: 'library' });
}

function renderAddRecordModal(container) {
  const defaultBookId = state.modal?.defaultBookId || state.activeBookId;
  const targetBook = db.books.find(b => b.id === defaultBookId) || db.books[0];

  const categories = [
    { value: 'QUOTE', label: '✍️ 인용구' },
    { value: 'THOUGHT', label: '💭 내생각' },
    { value: 'QUESTION', label: '❓ 의문점' },
    { value: 'SUMMARY', label: '📋 요약' },
    { value: 'REVIEW', label: '⭐ 리뷰' }
  ];

  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div class="bg-white dark:bg-stone-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up border border-stone-200/80 dark:border-stone-800">
        
        <!-- Modal Header -->
        <div class="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/80">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-xl">edit_note</span>
            <h3 class="font-bold text-stone-900 dark:text-stone-100 text-sm">새 문장 기록 수집</h3>
          </div>
          <button id="modal-close-btn" class="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 rounded-lg cursor-pointer transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form id="add-record-form" class="p-5 space-y-4 overflow-y-auto">
          
          <!-- Locked / Target Book Info Header Card -->
          <div class="bg-stone-50 dark:bg-stone-800/70 p-3 rounded-xl border border-stone-200/70 dark:border-stone-700/70 flex items-center gap-3">
            <img src="${targetBook?.thumbnail || DEFAULT_BOOK_COVER}" alt="${esc(targetBook?.title)}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-10 h-14 object-cover rounded-lg shadow-xs flex-shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">대상 도서</div>
              <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs truncate mt-0.5">${esc(targetBook?.title || '도서 선택')}</h4>
              <p class="text-[11px] text-stone-500 dark:text-stone-400 truncate">${esc(targetBook?.author || '저자 미상')} · ${esc(targetBook?.publisher || '출판사 미상')}</p>
            </div>
            ${db.books.length > 1 && !defaultBookId ? `
              <select id="record-book-select" class="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-1.5 font-bold text-stone-800 dark:text-stone-200">
                ${db.books.map(b => `<option value="${b.id}" ${b.id === targetBook?.id ? 'selected' : ''}>${esc(b.title)}</option>`).join('')}
              </select>
            ` : `
              <input type="hidden" id="record-book-select" value="${targetBook?.id || ''}" />
            `}
          </div>

          <!-- TOP FIELDS: 1) Page Number & 2) Category Type Filter (Side by Side at TOP) -->
          <div class="grid grid-cols-2 gap-3 pt-1">
            
            <!-- 1) Page Number -->
            <div>
              <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <span>📖 페이지 번호 (p)</span>
                <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input type="number" id="record-page" value="${targetBook?.curPage || 1}" min="1" max="${targetBook?.totalPage || 9999}" 
                       class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs font-bold focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors" required />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">p</span>
              </div>
            </div>

            <!-- 2) Category Type Filter -->
            <div>
              <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <span>🏷️ 카테고리 분류</span>
                <span class="text-rose-500">*</span>
              </label>
              <select id="record-type" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs font-bold focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors">
                ${categories.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
              </select>
            </div>

          </div>

          <!-- Quote Sentence Textarea -->
          <div>
            <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <span>✍️ 수집할 인용 문장</span>
              <span class="text-rose-500">*</span>
            </label>
            <textarea id="record-quote" rows="3" placeholder="책 속의 감명 깊은 문장을 기록하세요..." 
                      class="w-full p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs font-serif leading-relaxed focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors" required></textarea>
          </div>

          <!-- Thought / Reflection Textarea -->
          <div>
            <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">💭 나의 생각 / 감상 (선택)</label>
            <textarea id="record-thought" rows="2" placeholder="이 문장을 읽고 느껴진 나의 감상이나 의문점..." 
                      class="w-full p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs leading-normal focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors"></textarea>
          </div>

          <!-- Spoiler Checkbox & Typing Practice Button -->
          <div class="flex items-center justify-between pt-1 pb-1">
            <label class="flex items-center gap-2 text-xs font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
              <input type="checkbox" id="record-spoil" class="rounded text-stone-800 focus:ring-stone-800 cursor-pointer" />
              <span>스포일러 포함 기록</span>
            </label>

            <button type="button" id="btn-open-typing-practice" class="text-xs text-stone-800 dark:text-stone-200 font-bold hover:underline flex items-center gap-1 cursor-pointer">
              <span class="material-symbols-outlined text-sm">keyboard</span>
              <span>이 문장으로 타자 필사하기</span>
            </button>
          </div>

          <!-- Submit Button -->
          <button type="submit" class="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
            ✨ 문장 기록 저장하기
          </button>
        </form>

      </div>
    </div>
  `;

  const closeBtn = container.querySelector('#modal-close-btn');
  closeBtn?.addEventListener('click', () => setState({ modal: null }));

  const form = container.querySelector('#add-record-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookSelectEl = container.querySelector('#record-book-select');
    const bookId = bookSelectEl ? bookSelectEl.value : (targetBook?.id || '');
    const selBook = db.books.find(b => b.id === bookId) || targetBook;

    const newRecord = {
      id: 'r_' + Date.now(),
      bookId: selBook ? selBook.id : '',
      bookTitle: selBook ? selBook.title : '미상 도서',
      author: selBook ? selBook.author : '저자 미상',
      quote: container.querySelector('#record-quote').value.trim(),
      thought: container.querySelector('#record-thought').value.trim(),
      page: parseInt(container.querySelector('#record-page').value) || 1,
      type: container.querySelector('#record-type').value,
      spoil: container.querySelector('#record-spoil').checked,
      mine: true,
      likes: 0,
      createdAt: new Date().toISOString()
    };

    updateDB(data => {
      data.records.unshift(newRecord);
    });

    setState({ modal: null });
  });

  const typingBtn = container.querySelector('#btn-open-typing-practice');
  typingBtn?.addEventListener('click', () => {
    const quote = container.querySelector('#record-quote').value.trim();
    if (!quote) {
      alert('먼저 필사할 문장을 입력하세요.');
      return;
    }
    setState({
      modal: null,
      tab: 'typing',
      activeTyping: {
        text: quote,
        source: '직접 입력한 문장'
      }
    });
  });
}
