/**
 * Library Component (WANT / ACTIVE / DONE Shelf Manager)
 * Solemn & Editorial Deep Ink Theme (Order: WANT -> ACTIVE -> DONE)
 */
import { state, setState, db, updateDB } from '../state.js';
import { DEFAULT_BOOK_COVER } from '../utils/imageUtils.js';

export function renderLibrary(container) {
  const books = db.books || [];
  const filter = state.libFilter || 'ACTIVE';
  const cols = state.libCols || 1;
  const query = (state.libQuery || '').trim().toLowerCase();

  const wantCount = books.filter(b => b.status === 'WANT').length;
  const activeCount = books.filter(b => b.status === 'ACTIVE').length;
  const doneCount = books.filter(b => b.status === 'DONE').length;

  let filteredBooks = books.filter(b => {
    if (filter === 'ALL') return true;
    return (b.status || 'ACTIVE') === filter;
  });

  if (query) {
    filteredBooks = filteredBooks.filter(b =>
      b.title.toLowerCase().includes(query) ||
      (b.author && b.author.toLowerCase().includes(query)) ||
      (b.publisher && b.publisher.toLowerCase().includes(query))
    );
  }

  // Calculate percentage width & gap for layout items (Exact match to feed.js system)
  const mbClass = cols === 1 ? 'mb-2' : 'mb-3.5';
  let itemWidthStyle = 'width: 100%;';
  if (cols === 2) {
    itemWidthStyle = 'width: calc(50% - 7px);';
  } else if (cols === 3) {
    itemWidthStyle = 'width: calc(33.333% - 9.333px);';
  }

  let fallbackGridClass = 'flex flex-col gap-2';
  if (cols === 2) {
    fallbackGridClass = 'grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-start';
  } else if (cols === 3) {
    fallbackGridClass = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-start';
  }

  container.innerHTML = `
    <div class="space-y-3 font-sans">
      
      <!-- Top Action Bar (Title & Add Book Button) -->
      <div class="flex items-center justify-between bg-white dark:bg-stone-900 px-4 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm">
        <h2 class="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-xl sm:text-2xl">collections_bookmark</span>
          <span>내 서재</span>
        </h2>
        <button id="lib-add-book-btn" class="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-sm flex items-center gap-1 transition-all cursor-pointer">
          <span class="material-symbols-outlined text-base">add</span>
          <span>책 추가</span>
        </button>
      </div>

      <!-- Status Filter Segmented Control -->
      <div class="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1 text-xs font-sans w-full shadow-xs">
        <button data-filter="WANT" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'WANT' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>📦 보관함</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'WANT' ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${wantCount}</span>
        </button>

        <button data-filter="ACTIVE" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'ACTIVE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>📖 읽는 중</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'ACTIVE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${activeCount}</span>
        </button>

        <button data-filter="DONE" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'DONE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>🏆 완독</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'DONE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${doneCount}</span>
        </button>
      </div>

      <!-- Search Input & 1/2/3단 Column Control Bar (Search Input in Front of 1,2,3단) -->
      <div class="flex items-center justify-between gap-2.5 pt-0.5 pb-1 px-0.5 font-sans text-xs">
        
        <!-- Left: Search Input Box (Flex-1) -->
        <div class="relative flex-1 min-w-0">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none">search</span>
          <input type="text" id="lib-search-input" value="${state.libQuery || ''}" placeholder="서재 내 책 제목, 저자 검색..." class="w-full pl-9 pr-3.5 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-xl text-xs focus:outline-none focus:border-stone-800 dark:focus:border-stone-300 transition-colors" />
        </div>

        <!-- Right: 1단 / 2단 / 3단 Layout Switcher -->
        <div class="inline-flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/60 shadow-2xs shrink-0">
          <button data-lib-cols="1" class="btn-lib-cols py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${cols === 1 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            1단
          </button>
          <button data-lib-cols="2" class="btn-lib-cols py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${cols === 2 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            2단
          </button>
          <button data-lib-cols="3" class="btn-lib-cols py-1 px-2.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${cols === 3 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            3단
          </button>
        </div>

      </div>

      <!-- Books List (Dynamic 1단 / 2단 / 3단 Container) -->
      ${filteredBooks.length === 0 ? `
        <div class="w-full text-center py-14 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
          <span class="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-700 mb-2">menu_book</span>
          <p class="text-stone-600 dark:text-stone-400 font-bold text-sm">${query ? '검색된 책이 없습니다.' : '등록된 책이 없습니다.'}</p>
          <p class="text-stone-400 dark:text-stone-500 text-xs mt-1">상단의 도서 추가 버튼을 눌러 첫 도서를 등록해보세요.</p>
        </div>
      ` : `
        <div id="lib-infinite-grid" class="w-full transition-all ${fallbackGridClass}">
          ${filteredBooks.map(b => `
            <div class="lib-grid-item ${mbClass}" style="${itemWidthStyle}">
              ${renderBookShelfCard(b, cols)}
            </div>
          `).join('')}
        </div>
      `}

    </div>
  `;

  container.querySelectorAll('.btn-lib-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.dataset.filter;
      setState({ libFilter: f });
    });
  });

  container.querySelectorAll('.btn-lib-cols').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const numCols = parseInt(e.currentTarget.dataset.libCols, 10);
      setState({ libCols: numCols });
    });
  });

  const libGridEl = container.querySelector('#lib-infinite-grid');

  const runNaverD2MasonryLayout = () => {
    if (!libGridEl || filteredBooks.length === 0) return;

    if (cols === 1) {
      libGridEl.style.position = 'relative';
      libGridEl.style.height = 'auto';
      Array.from(libGridEl.children).forEach(item => {
        item.style.position = 'static';
        item.style.width = '100%';
      });
      return;
    }

    const containerWidth = libGridEl.clientWidth;
    if (!containerWidth) return;
    
    const gap = 14;
    const itemWidth = (containerWidth - gap * (cols - 1)) / cols;
    const columnHeights = new Array(cols).fill(0);

    libGridEl.style.position = 'relative';
    const items = Array.from(libGridEl.children);

    items.forEach(item => {
      if (item.style.display === 'none') return;
      item.style.position = 'absolute';
      item.style.width = `${itemWidth}px`;

      let minColIndex = 0;
      let minColHeight = columnHeights[0];
      for (let i = 1; i < cols; i++) {
        if (columnHeights[i] < minColHeight) {
          minColHeight = columnHeights[i];
          minColIndex = i;
        }
      }

      const left = minColIndex * (itemWidth + gap);
      const top = columnHeights[minColIndex];

      item.style.left = `${left}px`;
      item.style.top = `${top}px`;
      item.style.transition = 'all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)';

      const itemHeight = item.offsetHeight;
      columnHeights[minColIndex] += itemHeight + gap;
    });

    const maxHeight = Math.max(...columnHeights);
    libGridEl.style.height = `${maxHeight}px`;
  };

  const searchInput = container.querySelector('#lib-search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();
    state.libQuery = e.target.value;
    
    const items = container.querySelectorAll('.lib-grid-item');
    items.forEach(item => {
      const card = item.querySelector('.book-card-item');
      const bookId = card?.dataset.bookId;
      const b = books.find(bObj => bObj.id === bookId);
      if (!b) return;

      const matchQuery = !q || 
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.publisher && b.publisher.toLowerCase().includes(q));

      const matchFilter = (filter === 'ALL') || ((b.status || 'WANT') === filter);

      if (matchQuery && matchFilter) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    runNaverD2MasonryLayout();
  });

  container.querySelector('#lib-add-book-btn')?.addEventListener('click', () => {
    setState({ modal: { type: 'SEARCH' } });
  });

  container.querySelectorAll('.book-card-item').forEach(card => {
    card.addEventListener('click', (e) => {
      const bookId = e.currentTarget.dataset.bookId;
      setState({
        tab: 'library',
        activeBookId: bookId
      });
    });
  });

  // Initialize Naver @egjs/infinitegrid Masonry Engine (Same specification as feed.js)
  if (libGridEl && filteredBooks.length > 0) {
    const eg = window.eg;
    const GridClass = eg?.MasonryInfiniteGrid || eg?.GridInfiniteGrid || eg?.InfiniteGrid;
    if (GridClass) {
      try {
        const ig = new GridClass(libGridEl, {
          gap: 14,
          column: cols,
          align: 'center',
          useTransform: true
        });
        ig.renderItems();
      } catch (err) {
        console.log('Library InfiniteGrid initialized:', err);
      }
    }

    setTimeout(runNaverD2MasonryLayout, 50);
    setTimeout(runNaverD2MasonryLayout, 300);

    window.addEventListener('resize', runNaverD2MasonryLayout, { passive: true });
  }
}

function renderBookShelfCard(book, cols = 1) {
  const cur = book.curPage || 0;
  const total = book.totalPage || 1;
  const pct = Math.min(Math.round((cur / total) * 100), 100);

  const recordCount = (db.records || []).filter(r => r.bookId === book.id || r.bookTitle === book.title).length;

  const statusBadge = book.status === 'DONE' 
    ? '<span class="px-1.5 py-0.5 bg-emerald-700 text-white text-[9px] sm:text-[10px] font-bold rounded-md shadow-xs">🏆 완독</span>'
    : (book.status === 'WANT' 
      ? '<span class="px-1.5 py-0.5 bg-stone-700 text-white text-[9px] sm:text-[10px] font-bold rounded-md shadow-xs">📦 보관함</span>'
      : '<span class="px-1.5 py-0.5 bg-amber-700 text-white text-[9px] sm:text-[10px] font-bold rounded-md shadow-xs">📖 읽는 중</span>');

  // Dynamic thumbnail width based on column count
  const thumbClass = cols === 1 
    ? 'w-20 h-28 sm:w-24 sm:h-32' 
    : (cols === 2 ? 'w-16 h-22 sm:w-20 sm:h-28' : 'w-14 h-20 sm:w-16 sm:h-22');

  const paddingClass = cols === 1 ? 'p-3.5 sm:p-4' : (cols === 2 ? 'p-3 sm:p-3.5' : 'p-2.5 sm:p-3');
  const gapClass = cols === 1 ? 'gap-3.5 sm:gap-4' : 'gap-2.5 sm:gap-3';

  return `
    <div data-book-id="${book.id}" class="book-card-item bg-white dark:bg-stone-900 ${paddingClass} rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-row items-center ${gapClass} group w-full h-full font-sans">
      
      <!-- Left: Book Cover Image (Horizontal Side-by-Side) -->
      <div class="relative shrink-0 ${thumbClass} overflow-hidden rounded-xl shadow-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
        <img src="${book.thumbnail || DEFAULT_BOOK_COVER}" alt="${book.title}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-full h-full object-cover" />
        <div class="absolute top-1 left-1 z-10">
          ${statusBadge}
        </div>
      </div>

      <!-- Right: Book Details & Progress Bar (Compact Horizontal Layout) -->
      <div class="flex-1 min-w-0 space-y-1 sm:space-y-1.5 flex flex-col justify-between h-full">
        <div>
          <div class="flex items-center justify-between gap-1 mb-0.5">
            <span class="text-[10px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-md border border-stone-200 dark:border-stone-700 truncate">
              ${book.genre || '문학'}
            </span>
            <span class="text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 shrink-0">
              <span class="material-symbols-outlined text-amber-500 text-xs">star</span>
              <span>${book.rating || 4.8}</span>
            </span>
          </div>

          <h3 class="font-serif font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm leading-snug truncate">${book.title}</h3>
          <p class="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 font-sans truncate">${book.author}</p>
        </div>

        <!-- Progress Bar Mini -->
        <div class="pt-0.5 space-y-0.5 font-sans mt-auto">
          <div class="flex items-center justify-between text-[10px] font-medium text-stone-600 dark:text-stone-400">
            <span class="truncate">기록 <b class="text-stone-900 dark:text-stone-100 font-bold">${recordCount}개</b></span>
            <span class="font-bold text-amber-800 dark:text-amber-300 shrink-0 ml-1">${pct}%</span>
          </div>
          <div class="w-full bg-stone-100 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
            <div class="bg-amber-700 dark:bg-amber-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>

      </div>

    </div>
  `;
}
