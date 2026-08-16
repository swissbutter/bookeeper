/**
 * Modal & BottomSheet Component System
 * Ported Book Search Engine & Edition Picker from Original bookkeeper-main/index.html
 * Optimization: Instant 0ms Local Matching + Real-Time Search Debounce Engine
 */
import { state, setState, db, updateDB } from '../state.js';
import { searchBooksMultiSource, fetchAladinPageCount } from '../api/bookApi.js';
import { DEFAULT_BOOK_COVER } from '../utils/imageUtils.js';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeImageSrc(value) {
  return esc(value || DEFAULT_BOOK_COVER);
}

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
  } else if (state.modal.type === 'REPORT') {
    renderReportModal(modalEl);
  }
}

function renderSearchModal(container) {
  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
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

        <!-- Custom Styled Search Target Dropdown & Search Bar (Harmonious Rounded-xl Design) -->
        <div class="p-4 border-b border-stone-100 dark:border-stone-800 flex gap-2">
          
          <div class="relative inline-block text-left shrink-0">
            <button id="modal-search-target-btn" type="button" class="px-3.5 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 cursor-pointer focus:outline-none select-none hover:bg-stone-200/70 dark:hover:bg-stone-700/70 transition-colors">
              <span id="modal-search-target-label">제목</span>
              <span class="material-symbols-outlined text-sm text-stone-500">expand_more</span>
            </button>

            <!-- Custom Floating Dropdown Option Panel -->
            <div id="modal-search-target-menu" class="hidden absolute left-0 top-full mt-1.5 w-32 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs z-50 font-sans space-y-0.5">
              <button type="button" data-value="title" class="target-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors">
                제목
              </button>
              <button type="button" data-value="person" class="target-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors">
                저자
              </button>
              <button type="button" data-value="publisher" class="target-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors">
                출판사
              </button>
              <button type="button" data-value="isbn" class="target-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors">
                ISBN
              </button>
            </div>
            <input type="hidden" id="modal-search-target" value="title" />
          </div>

          <input type="text" id="modal-search-input" placeholder="책 제목, 저자, ISBN 입력..." class="flex-1 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors" />
          <button id="modal-search-exec" class="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors cursor-pointer shrink-0">
            검색
          </button>
        </div>

        <!-- Multi-Source API Results List -->
        <div id="modal-search-results" class="flex-1 overflow-y-auto p-4 space-y-3 min-h-[260px]">
          <div class="text-center py-12 text-stone-400 text-xs">
            책 제목, 저자, 또는 ISBN을 입력하고 검색 버튼을 누르세요.
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

  const targetBtn = container.querySelector('#modal-search-target-btn');
  const targetMenu = container.querySelector('#modal-search-target-menu');
  const targetLabel = container.querySelector('#modal-search-target-label');

  targetBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    targetMenu?.classList.toggle('hidden');
  });

  targetMenu?.querySelectorAll('.target-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.dataset.value;
      const labelText = btn.textContent.trim();
      if (searchTargetSelect) searchTargetSelect.value = val;
      if (targetLabel) targetLabel.textContent = labelText;
      targetMenu.classList.add('hidden');
    });
  });

  const closeDropdownOnOutside = (e) => {
    if (targetMenu && !targetBtn?.contains(e.target) && !targetMenu?.contains(e.target)) {
      targetMenu.classList.add('hidden');
    }
  };
  document.addEventListener('click', closeDropdownOnOutside);

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
      const thumbnail = safeImageSrc(b.thumbnail);
      const title = esc(b.title);
      const author = esc(b.author || '저자 미상');
      const publisher = esc(b.publisher || '출판사 미상');
      const category = esc(b.genre || b.category || '소설');
      const pubDate = esc(b.pubDate || '');
      const isbn = esc(b.isbn || '미기재');
      return `
        <div class="flex gap-3.5 p-3.5 bg-stone-50 dark:bg-stone-800/60 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg border border-stone-200/80 dark:border-stone-700/80 transition-all items-center">
          <img src="${thumbnail}" alt="${title}" class="book-search-cover w-14 h-20 object-cover rounded-md shadow-md flex-shrink-0" />
          <div class="flex-1 min-w-0 space-y-0.5">
            <!-- 1) 카테고리 / 발행일 -->
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="px-2 py-0.5 bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60 text-[10px] font-bold rounded">${category}</span>
              ${editionCount > 0 ? `<span class="px-2 py-0.5 bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 text-[10px] font-bold rounded">판본 ${editionCount}개</span>` : ''}
              ${pubDate ? `<span class="text-[10px] text-stone-400 dark:text-stone-500 font-medium">발행: ${pubDate}</span>` : ''}
            </div>
            <!-- 2) 제목 -->
            <h4 class="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm truncate pt-0.5">${title}</h4>
            <!-- 3) 작가/출판사/페이지 -->
            <p class="text-[11px] text-stone-600 dark:text-stone-400 truncate">${author} · ${publisher} ${b.totalPage ? ` | ${b.totalPage}p` : ''}</p>
            <!-- 4) ISBN -->
            <p class="text-[10px] text-stone-400 dark:text-stone-500 truncate font-mono">ISBN: ${isbn}</p>
          </div>
          
          <div class="flex flex-col gap-1.5 flex-shrink-0">
            <button data-book-index="${idx}" class="btn-add-to-lib bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 text-xs px-3 py-2 rounded-md font-bold transition-colors shadow-sm cursor-pointer">
              서재 추가
            </button>
            ${editionCount > 1 ? `
              <button data-book-index="${idx}" class="btn-pick-edition text-[11px] text-stone-700 dark:text-stone-300 hover:underline font-bold px-2 py-1 cursor-pointer">
                판본 선택 (${editionCount})
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    resultsContainer.querySelectorAll('.book-search-cover').forEach(img => {
      img.addEventListener('error', () => {
        img.src = DEFAULT_BOOK_COVER;
      }, { once: true });
    });

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
        <span class="text-xs font-bold">검색 중...</span>
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
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div class="bg-white w-full max-w-md rounded-5px max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-fade-scale">
        
        <div class="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 class="font-bold text-stone-900 text-sm">도서 판본 선택 (${editions.length}개)</h3>
            <p class="text-xs text-stone-500 truncate">${esc(parentBook.title)}</p>
          </div>
          <button id="modal-close-btn" class="p-1 text-stone-400 hover:text-stone-700 rounded-5px cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          ${editions.map((ed, edIdx) => {
            const thumbnail = safeImageSrc(ed.thumbnail || parentBook.thumbnail);
            const title = esc(ed.title);
            const publisher = esc(ed.publisher || '출판사 미상');
            const pubDate = esc(ed.pubDate || '발행일 미상');
            const isbn = esc(ed.isbn || '미기재');
            return `
            <div class="p-3 bg-stone-50 hover:bg-stone-100 rounded-5px border border-stone-200 flex gap-3 items-center">
              <img src="${thumbnail}" alt="${title}" class="book-search-cover w-12 h-16 object-cover rounded-5px shadow-sm flex-shrink-0" />
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-stone-900 text-xs truncate">${title}</h4>
                <p class="text-[11px] text-stone-500 truncate">${publisher} · ${pubDate}</p>
                <p class="text-[10px] text-stone-400">ISBN: ${isbn} | ${esc(ed.totalPage || 300)}p</p>
              </div>
              <button data-edition-index="${edIdx}" class="btn-select-edition bg-stone-900 hover:bg-stone-800 text-white text-xs px-3 py-2 rounded-5px font-bold transition-colors flex-shrink-0 cursor-pointer">
                선택
              </button>
            </div>
          `;
          }).join('')}
        </div>

      </div>
    </div>
  `;

  container.querySelector('#modal-close-btn')?.addEventListener('click', () => setState({ modal: null }));

  container.querySelectorAll('.book-search-cover').forEach(img => {
    img.addEventListener('error', () => {
      img.src = DEFAULT_BOOK_COVER;
    }, { once: true });
  });

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
  const defaultType = state.modal?.defaultType || 'QUOTE';
  const targetBook = db.books.find(b => b.id === defaultBookId) || db.books[0];

  const categories = [
    { value: 'QUOTE', label: '✍️ 인용구' },
    { value: 'THOUGHT', label: '💭 내생각' },
    { value: 'QUESTION', label: '❓ 의문점' },
    { value: 'SUMMARY', label: '📋 요약' },
    { value: 'REVIEW', label: '⭐ 리뷰' }
  ];

  const selectedCategoryObj = categories.find(c => c.value === defaultType) || categories[0];
  const selectedLabel = selectedCategoryObj.label;

  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans">
      <div class="bg-white dark:bg-stone-900 w-full max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up border border-stone-200/80 dark:border-stone-800">
        
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

          <!-- TOP FIELDS: 1) Category Type Filter (LEFT) & 2) Page Number (RIGHT) -->
          <div id="top-fields-grid" class="grid grid-cols-2 gap-3 pt-1">
            
            <!-- 1) Category Type Custom Floating Dropdown (LEFT - Identical to feed.js) -->
            <div id="field-category-wrapper">
              <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <span>🏷️ 카테고리 분류</span>
                <span class="text-rose-500">*</span>
              </label>
              
              <div class="relative w-full">
                <button id="record-type-btn" type="button" class="w-full h-[36px] px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-between cursor-pointer focus:outline-none select-none hover:bg-stone-100 dark:hover:bg-stone-700/70 transition-colors">
                  <span id="record-type-label">${selectedLabel}</span>
                  <span class="material-symbols-outlined text-sm text-stone-500">expand_more</span>
                </button>
                <input type="hidden" id="record-type" value="${defaultType || 'QUOTE'}" />

                <div id="record-type-menu" class="hidden absolute left-0 top-full mt-1.5 w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs z-50 font-sans space-y-0.5">
                  ${categories.map(c => `
                    <button type="button" data-value="${c.value}" class="record-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${c.value === (defaultType || 'QUOTE') ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                      ${c.label}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- 2) Page Number (RIGHT - Hidden when REVIEW or E-BOOK) -->
            <div id="field-page-container">
              <div class="flex items-center justify-between mb-1">
                <label for="record-page" class="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <span>📖 페이지</span>
                  <span id="page-required-star" class="text-rose-500">*</span>
                </label>
                <label class="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                  <input type="checkbox" id="record-is-ebook" class="rounded text-stone-800 focus:ring-stone-800 cursor-pointer" />
                  <span>이북으로 읽음</span>
                </label>
              </div>
              <div id="record-page-input-wrap" class="relative">
                <input type="number" id="record-page" value="${targetBook?.curPage || 1}" min="1" max="${targetBook?.totalPage || 9999}" 
                       class="w-full h-[36px] px-3 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs font-bold focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors" required />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none">p</span>
              </div>
            </div>

          </div>

          <!-- Star Rating Component (Visible ONLY when REVIEW category is selected) -->
          <div id="field-rating-container" class="hidden bg-amber-50/60 dark:bg-stone-800/60 p-3.5 rounded-xl border border-amber-200/80 dark:border-stone-700/80 text-center space-y-1.5 transition-all">
            <label class="block text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center justify-center gap-1">
              <span>⭐ 도서 별점 평점</span>
              <span class="text-rose-500">*</span>
            </label>
            <input type="hidden" id="record-rating-val" value="5" />
            <div class="flex items-center justify-center gap-1.5 text-2xl cursor-pointer select-none" id="star-rating-picker">
              <button type="button" data-star="1" class="star-btn text-amber-400 transition-transform hover:scale-125">★</button>
              <button type="button" data-star="2" class="star-btn text-amber-400 transition-transform hover:scale-125">★</button>
              <button type="button" data-star="3" class="star-btn text-amber-400 transition-transform hover:scale-125">★</button>
              <button type="button" data-star="4" class="star-btn text-amber-400 transition-transform hover:scale-125">★</button>
              <button type="button" data-star="5" class="star-btn text-amber-400 transition-transform hover:scale-125">★</button>
            </div>
            <span id="star-rating-label" class="block text-[11px] font-bold text-amber-600 dark:text-amber-400">5.0점 (최고예요!)</span>
          </div>

          <!-- Quote Sentence Textarea (Hidden when REVIEW) -->
          <div id="field-quote-container">
            <label class="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
              <span>✍️ 책 속 문장</span>
              <span class="text-rose-500">*</span>
            </label>
            <textarea id="record-quote" rows="3" placeholder="책 속의 감명 깊은 문장을 기록하세요..." 
                      class="w-full p-3.5 bg-stone-50 dark:bg-stone-800/80 border-[3px] border-stone-400 dark:border-stone-500 text-stone-900 dark:text-stone-100 rounded-xl text-xs font-serif leading-relaxed focus:outline-none focus:border-stone-900 dark:focus:border-stone-100 transition-colors"></textarea>
          </div>

          <!-- Thought / Review Textarea -->
          <div id="field-thought-container">
            <div class="flex items-center justify-between mb-1">
              <label id="thought-label-el" for="record-thought" class="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <span>💭 나의 감상 (선택)</span>
              </label>
              <label class="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                <input type="checkbox" id="record-spoil" class="rounded text-stone-800 focus:ring-stone-800 cursor-pointer" />
                <span>스포일러 포함</span>
              </label>
            </div>
            <textarea id="record-thought" rows="2" placeholder="이 문장을 읽고 느껴진 나의 감상이나 의문점..." 
                      class="w-full p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs leading-normal focus:outline-none focus:border-stone-800 dark:focus:border-stone-200 transition-colors"></textarea>
          </div>

          <!-- Bottom Action Buttons: 닫기 (3) & 기록 저장하기 (7) with Top Divider Line -->
          <div class="flex items-center gap-2 pt-2 -mt-3 border-t border-stone-200/80 dark:border-stone-800">
            <button type="button" id="modal-cancel-btn" class="flex-[3] py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs rounded-xl transition-all cursor-pointer">
              닫기
            </button>
            <button type="submit" class="flex-[7] py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
              ✨ 기록 저장하기
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  const cancelBtn = container.querySelector('#modal-cancel-btn');
  cancelBtn?.addEventListener('click', () => setState({ modal: null }));

  const form = container.querySelector('#add-record-form');
  const recordTypeInput = container.querySelector('#record-type');
  const pageContainer = container.querySelector('#field-page-container');
  const quoteContainer = container.querySelector('#field-quote-container');
  const ratingContainer = container.querySelector('#field-rating-container');
  const topFieldsGrid = container.querySelector('#top-fields-grid');
  const recordQuoteInput = container.querySelector('#record-quote');
  const recordThoughtInput = container.querySelector('#record-thought');
  const thoughtLabelEl = container.querySelector('#thought-label-el');

  function checkAndPrefillExistingReview(selBook) {
    if (!selBook || !form) return;
    const existingReview = (db.records || []).find(r => 
      r.mine !== false && r.type === 'REVIEW' && (r.bookId === selBook.id || r.bookTitle === selBook.title)
    );

    const existingNoticeEl = container.querySelector('#review-edit-notice');
    if (existingReview) {
      if (form?.dataset) form.dataset.existingReviewId = existingReview.id;
      if (recordThoughtInput) {
        recordThoughtInput.value = existingReview.quote || existingReview.thought || '';
      }
      const existingStar = Math.round(existingReview.rating || 5);
      if (ratingValInput) ratingValInput.value = existingStar;
      if (ratingLabelEl) ratingLabelEl.textContent = ratingTexts[existingStar] || `${existingStar}.0점`;
      starBtns.forEach(b => {
        const bStar = parseInt(b.dataset.star) || 0;
        if (bStar <= existingStar) {
          b.classList.add('text-amber-400');
          b.classList.remove('text-stone-300', 'dark:text-stone-600');
        } else {
          b.classList.remove('text-amber-400');
          b.classList.add('text-stone-300', 'dark:text-stone-600');
        }
      });

      if (!existingNoticeEl && ratingContainer) {
        const notice = document.createElement('div');
        notice.id = 'review-edit-notice';
        notice.className = 'text-[11px] text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/40 p-2 rounded-lg font-medium flex items-center gap-1.5 mt-2 border border-amber-200 dark:border-amber-800';
        notice.innerHTML = `<span class="material-symbols-outlined text-sm">edit_note</span><span>이미 작성하신 리뷰가 있어 기존 내용을 불러왔습니다. 제출 시 이전 리뷰가 수정됩니다.</span>`;
        ratingContainer.appendChild(notice);
      }
    } else {
      if (form?.dataset) delete form.dataset.existingReviewId;
      existingNoticeEl?.remove();
    }
  }

  function updateCategoryMode(val) {
    if (val === 'REVIEW') {
      pageContainer?.classList.add('hidden');
      quoteContainer?.classList.add('hidden');
      ratingContainer?.classList.remove('hidden');
      topFieldsGrid?.classList.remove('grid-cols-2');

      if (recordQuoteInput) recordQuoteInput.removeAttribute('required');
      if (recordThoughtInput) {
        recordThoughtInput.setAttribute('required', 'true');
        recordThoughtInput.placeholder = '도서에 대한 솔직하고 깊이 있는 리뷰를 남겨주세요...';
      }

      if (thoughtLabelEl) {
        thoughtLabelEl.innerHTML = `<span>⭐ 리뷰</span><span class="text-rose-500">*</span>`;
      }

      const bookSelectEl = container.querySelector('#record-book-select');
      const bookId = bookSelectEl ? bookSelectEl.value : (targetBook?.id || '');
      const selBook = db.books.find(b => b.id === bookId) || targetBook;
      checkAndPrefillExistingReview(selBook);
    } else {
      if (form && form.dataset) delete form.dataset.existingReviewId;
      const noticeEl = container.querySelector('#review-edit-notice');
      if (noticeEl) {
        if (typeof noticeEl.remove === 'function') noticeEl.remove();
        else if (noticeEl.parentNode) noticeEl.parentNode.removeChild(noticeEl);
      }
      pageContainer?.classList.remove('hidden');
      quoteContainer?.classList.remove('hidden');
      ratingContainer?.classList.add('hidden');
      topFieldsGrid?.classList.add('grid-cols-2');

      if (recordQuoteInput) recordQuoteInput.setAttribute('required', 'true');
      if (recordThoughtInput) {
        recordThoughtInput.removeAttribute('required');
        recordThoughtInput.placeholder = '이 문장을 읽고 느껴진 나의 감상이나 의문점...';
      }

      if (thoughtLabelEl) {
        thoughtLabelEl.innerHTML = `<span>💭 나의 감상 (선택)</span>`;
      }
    }
  }

  // Initial category mode sync on modal open
  updateCategoryMode(recordTypeInput ? recordTypeInput.value : defaultType);

  const bookSelectEl = container.querySelector('#record-book-select');
  bookSelectEl?.addEventListener('change', () => {
    if (recordTypeInput?.value === 'REVIEW') {
      const selBook = db.books.find(b => b.id === bookSelectEl.value);
      checkAndPrefillExistingReview(selBook);
    }
  });

  // E-Book Toggle Interaction
  const ebookCheckbox = container.querySelector('#record-is-ebook');
  const pageInputWrap = container.querySelector('#record-page-input-wrap');
  const pageRequiredStar = container.querySelector('#page-required-star');
  const recordPageInput = container.querySelector('#record-page');

  ebookCheckbox?.addEventListener('change', (e) => {
    const isEbook = e.target.checked;
    if (isEbook) {
      pageInputWrap?.classList.add('hidden');
      pageRequiredStar?.classList.add('hidden');
      if (recordPageInput) {
        recordPageInput.removeAttribute('required');
      }
    } else {
      pageInputWrap?.classList.remove('hidden');
      pageRequiredStar?.classList.remove('hidden');
      if (recordPageInput) {
        recordPageInput.setAttribute('required', 'true');
      }
    }
  });

  // Star Rating Picker Interaction
  const starBtns = container.querySelectorAll('.star-btn');
  const ratingValInput = container.querySelector('#record-rating-val');
  const ratingLabelEl = container.querySelector('#star-rating-label');

  const ratingTexts = {
    1: '1.0점 (아쉬워요)',
    2: '2.0점 (그저 그래요)',
    3: '3.0점 (보통이에요)',
    4: '4.0점 (좋았어요)',
    5: '5.0점 (최고예요!)'
  };

  starBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const star = parseInt(btn.dataset.star) || 5;
      if (ratingValInput) ratingValInput.value = star;
      if (ratingLabelEl) ratingLabelEl.textContent = ratingTexts[star] || `${star}.0점`;

      starBtns.forEach(b => {
        const bStar = parseInt(b.dataset.star) || 0;
        if (bStar <= star) {
          b.classList.add('text-amber-400');
          b.classList.remove('text-stone-300', 'dark:text-stone-600');
        } else {
          b.classList.remove('text-amber-400');
          b.classList.add('text-stone-300', 'dark:text-stone-600');
        }
      });
    });
  });

  const recordTypeBtn = container.querySelector('#record-type-btn');
  const recordTypeMenu = container.querySelector('#record-type-menu');
  const recordTypeLabel = container.querySelector('#record-type-label');

  recordTypeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    recordTypeMenu?.classList.toggle('hidden');
  });

  recordTypeMenu?.querySelectorAll('.record-type-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.dataset.value;
      const text = btn.textContent.trim();
      if (recordTypeInput) recordTypeInput.value = val;
      if (recordTypeLabel) recordTypeLabel.textContent = text;

      recordTypeMenu.querySelectorAll('.record-type-option-btn').forEach(b => {
        if (b.dataset.value === val) {
          b.classList.add('bg-stone-100', 'dark:bg-stone-700/70', 'text-amber-600', 'dark:text-amber-400');
        } else {
          b.classList.remove('bg-stone-100', 'dark:bg-stone-700/70', 'text-amber-600', 'dark:text-amber-400');
        }
      });

      updateCategoryMode(val);
      recordTypeMenu.classList.add('hidden');
    });
  });

  document.addEventListener('click', (e) => {
    if (recordTypeMenu && !recordTypeMenu.classList.contains('hidden') && !recordTypeBtn?.contains(e.target) && !recordTypeMenu.contains(e.target)) {
      recordTypeMenu.classList.add('hidden');
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const bookId = bookSelectEl ? bookSelectEl.value : (targetBook?.id || '');
    const selBook = db.books.find(b => b.id === bookId) || targetBook;
    const recType = container.querySelector('#record-type').value;
    const isReview = (recType === 'REVIEW');
    const thoughtVal = container.querySelector('#record-thought').value.trim();
    const quoteVal = container.querySelector('#record-quote')?.value.trim() || '';
    const isEbook = container.querySelector('#record-is-ebook')?.checked;
    const pageNum = isEbook ? 0 : (parseInt(container.querySelector('#record-page').value) || 1);
    const ratingVal = isReview ? (parseFloat(ratingValInput?.value) || 5.0) : undefined;
    const existingReviewId = form.dataset.existingReviewId;

    if (isReview && existingReviewId) {
      updateDB(data => {
        const existing = data.records.find(r => r.id === existingReviewId);
        if (existing) {
          existing.quote = thoughtVal;
          existing.rating = ratingVal;
          existing.createdAt = new Date().toISOString();
        }
        if (selBook) {
          const b = data.books.find(item => item.id === selBook.id);
          if (b) b.rating = ratingVal;
        }
      });
    } else {
      const newRecord = {
        id: 'r_' + Date.now(),
        bookId: selBook ? selBook.id : '',
        bookTitle: selBook ? selBook.title : '미상 도서',
        author: selBook ? selBook.author : '저자 미상',
        quote: isReview ? (thoughtVal || '⭐ 도서 별점 리뷰') : quoteVal,
        thought: isReview ? '' : thoughtVal,
        page: isReview ? 0 : pageNum,
        type: recType,
        rating: ratingVal,
        spoil: container.querySelector('#record-spoil').checked,
        mine: true,
        likes: 0,
        createdAt: new Date().toISOString()
      };

      updateDB(data => {
        data.records.unshift(newRecord);
        if (isReview && selBook) {
          const b = data.books.find(item => item.id === selBook.id);
          if (b) b.rating = ratingVal;
        }
      });
    }

    setState({ modal: null });
  });
}

function renderReportModal(container) {
  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 text-left">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/60 dark:border-rose-800/60 shrink-0">
              <span class="material-symbols-outlined text-lg">report_problem</span>
            </div>
            <div>
              <h3 class="font-bold text-base text-stone-900 dark:text-stone-100 leading-tight">문장 기록 신고하기</h3>
              <p class="text-[11px] text-stone-400">쾌적한 독서 커뮤니티를 위해 신고 사유를 선택해 주세요.</p>
            </div>
          </div>
          <button id="btn-close-report-modal" class="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 rounded-lg cursor-pointer transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <!-- Report Reasons List (Radio Buttons) -->
        <form id="form-report-reason" class="space-y-2 text-xs">
          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors">
            <input type="radio" name="reportReason" value="spoiler" checked class="mt-0.5 accent-rose-600 cursor-pointer" />
            <div class="text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">🚫 스포일러 미표기</span>
              <span class="text-stone-500 dark:text-stone-400 text-[11px]">독서 흐름을 해치는 결말이나 중요 반전 내용이 노출됨</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors">
            <input type="radio" name="reportReason" value="abuse" class="mt-0.5 accent-rose-600 cursor-pointer" />
            <div class="text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">⚠️ 부적절한 내용 / 비하 및 욕설</span>
              <span class="text-stone-500 dark:text-stone-400 text-[11px]">특정 대상 비하, 욕설, 혐오 표현 또는 불쾌감을 주는 텍스트</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors">
            <input type="radio" name="reportReason" value="spam" class="mt-0.5 accent-rose-600 cursor-pointer" />
            <div class="text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">📢 광고 / 홍보성 / 무관한 도배</span>
              <span class="text-stone-500 dark:text-stone-400 text-[11px]">도서 내용과 무관한 상업성 홍보, 외부 링크 또는 도배글</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors">
            <input type="radio" name="reportReason" value="copyright" class="mt-0.5 accent-rose-600 cursor-pointer" />
            <div class="text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">📄 저작권 위반 / 서지 정보 오류</span>
              <span class="text-stone-500 dark:text-stone-400 text-[11px]">책 제목, 저자 오기 또는 과도한 원문 무단 복제</span>
            </div>
          </label>

          <label class="flex items-start gap-2.5 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/80 hover:bg-stone-50 dark:hover:bg-stone-800/50 cursor-pointer transition-colors">
            <input type="radio" name="reportReason" value="other" class="mt-0.5 accent-rose-600 cursor-pointer" />
            <div class="text-xs">
              <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">💬 기타 사유</span>
              <span class="text-stone-500 dark:text-stone-400 text-[11px]">기타 커뮤니티 가이드라인 위반 항목</span>
            </div>
          </label>

          <!-- Optional Detail Notes Input -->
          <div class="pt-1">
            <textarea id="report-detail-text" rows="2" placeholder="상세 사유를 입력해 주세요 (선택 사항)" class="w-full px-3 py-2 text-xs border border-stone-200 dark:border-stone-700 rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none font-sans"></textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
            <button type="button" id="btn-cancel-report" class="px-3.5 py-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer">
              취소
            </button>
            <button type="submit" class="px-4 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1">
              <span>신고 접수하기</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  container.querySelector('#btn-close-report-modal')?.addEventListener('click', () => setState({ modal: null }));
  container.querySelector('#btn-cancel-report')?.addEventListener('click', () => setState({ modal: null }));

  const form = container.querySelector('#form-report-reason');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    setState({ modal: null });
    alert('🚨 신고가 접수되었습니다. 커뮤니티 운영팀에서 신속하게 검토 후 조치하겠습니다.');
  });
}
