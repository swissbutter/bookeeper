/**
 * Library Component (WANT / ACTIVE / DONE Shelf Manager)
 * Solemn & Editorial Deep Ink Theme (Order: WANT -> ACTIVE -> DONE)
 */
import { state, setState, db, updateDB } from '../state.js';
import { DEFAULT_BOOK_COVER } from '../utils/imageUtils.js';

export function renderLibrary(container) {
  const books = db.books || [];
  const filter = state.libFilter || 'ACTIVE';
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

  container.innerHTML = `
    <div class="space-y-3.5 animate-fade-in">
      
      <!-- Top Action & Search Bar -->
      <div class="space-y-3 bg-white dark:bg-stone-900 p-4 rounded-5px border border-stone-200 dark:border-stone-800 shadow-sm">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-2xl">collections_bookmark</span>
            <span>내 서재</span>
          </h2>
          <button id="lib-add-book-btn" class="bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-bold px-3.5 py-1.5 rounded-5px text-xs shadow-sm flex items-center gap-1 transition-all cursor-pointer">
            <span class="material-symbols-outlined text-base">add</span>
            <span>+ 책 추가</span>
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-lg">search</span>
          <input type="text" id="lib-search-input" value="${state.libQuery || ''}" placeholder="서재 내 책 제목, 저자 검색..." class="w-full pl-9 pr-4 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-5px text-xs focus:outline-none focus:border-stone-800 transition-colors" />
        </div>
      </div>

      <!-- Status Filter Segmented Control (Exact Match to 내 기록/커뮤니티 기록 Tab Styling) -->
      <div class="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1 text-xs font-sans w-full shadow-xs">
        <button data-filter="WANT" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'WANT' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>보관함</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'WANT' ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${wantCount}</span>
        </button>

        <button data-filter="ACTIVE" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'ACTIVE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>읽는 중</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'ACTIVE' ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${activeCount}</span>
        </button>

        <button data-filter="DONE" class="btn-lib-filter flex-1 py-2 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${filter === 'DONE' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          <span>완독</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-md ${filter === 'DONE' ? 'bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200' : 'bg-stone-200/60 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400'} font-bold">${doneCount}</span>
        </button>
      </div>

      <!-- Books List (1 Row Per Book Card Format) -->
      <div class="grid grid-cols-1 gap-3 w-full">
        ${filteredBooks.length === 0 ? `
          <div class="col-span-full text-center py-14 bg-white rounded-5px border border-dashed border-stone-300">
            <span class="material-symbols-outlined text-4xl text-stone-300 mb-2">menu_book</span>
            <p class="text-stone-600 font-bold text-sm">${query ? '검색된 책이 없습니다.' : '등록된 책이 없습니다.'}</p>
            <p class="text-stone-400 text-xs mt-1">상단의 도서 검색 버튼을 눌러 첫 도서를 등록해보세요.</p>
          </div>
        ` : filteredBooks.map(b => renderBookShelfCard(b)).join('')}
      </div>

    </div>
  `;

  container.querySelectorAll('.btn-lib-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const f = e.currentTarget.dataset.filter;
      setState({ libFilter: f });
    });
  });

  const searchInput = container.querySelector('#lib-search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();
    state.libQuery = e.target.value;
    
    const cardItems = container.querySelectorAll('.book-card-item');
    cardItems.forEach(card => {
      const bookId = card.dataset.bookId;
      const b = books.find(item => item.id === bookId);
      if (!b) return;

      const matchQuery = !q || 
        b.title.toLowerCase().includes(q) ||
        (b.author && b.author.toLowerCase().includes(q)) ||
        (b.publisher && b.publisher.toLowerCase().includes(q));

      const matchFilter = (filter === 'ALL') || ((b.status || 'WANT') === filter);

      if (matchQuery && matchFilter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
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
}

function renderBookShelfCard(book) {
  const cur = book.curPage || 0;
  const total = book.totalPage || 1;
  const pct = Math.min(Math.round((cur / total) * 100), 100);

  const recordCount = (db.records || []).filter(r => r.bookId === book.id || r.bookTitle === book.title).length;

  const statusBadge = book.status === 'DONE' 
    ? '<span class="px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-md shadow-xs">완독 🏆</span>'
    : (book.status === 'WANT' 
      ? '<span class="px-2 py-0.5 bg-stone-700 text-white text-[10px] font-bold rounded-md shadow-xs">보관함 📦</span>'
      : '<span class="px-2 py-0.5 bg-amber-700 text-white text-[10px] font-bold rounded-md shadow-xs">읽는 중 📖</span>');

  return `
    <div data-book-id="${book.id}" class="book-card-item col-span-full bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex gap-4 items-center group w-full">
      
      <!-- Book Thumbnail with Standard 3:4 Aspect Ratio -->
      <div class="relative flex-shrink-0 w-20 h-28 sm:w-24 sm:h-32 overflow-hidden rounded-xl shadow-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
        <img src="${book.thumbnail || DEFAULT_BOOK_COVER}" alt="${book.title}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div class="absolute top-1.5 left-1.5 z-10">
          ${statusBadge}
        </div>
      </div>

      <!-- Book Main Information -->
      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 px-2.5 py-0.5 rounded-md border border-stone-200 dark:border-stone-700">
            ${book.genre || '문학'}
          </span>
          <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
            <span class="material-symbols-outlined text-amber-500 text-sm">star</span>
            <span>${book.rating || 4.8}</span>
          </span>
        </div>

        <h3 class="font-serif font-bold text-stone-900 dark:text-stone-100 text-base leading-snug truncate group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors">${book.title}</h3>
        <p class="text-xs text-stone-500 dark:text-stone-400 font-sans truncate">${book.author} · ${book.publisher}</p>

        <!-- Progress Bar Mini -->
        <div class="pt-1.5 space-y-1 font-sans">
          <div class="flex items-center justify-between text-[11px] font-medium text-stone-600 dark:text-stone-400">
            <span>기록 문장 <b class="text-stone-900 dark:text-stone-100 font-bold">${recordCount}개</b></span>
            <span class="font-bold text-amber-800 dark:text-amber-300">${cur} / ${total}p (${pct}%)</span>
          </div>
          <div class="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden border border-stone-200/50 dark:border-stone-700/50">
            <div class="bg-amber-700 dark:bg-amber-500 h-full rounded-full transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        </div>

      </div>

    </div>
  `;
}
