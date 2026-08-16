/**
 * Sentence Feed & Community Component
 * Solemn & Editorial Deep Ink Theme (Default: Popular Sentences First)
 */
import { state, setState, db, updateDB } from '../state.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderFeed(container) {
  let records = [...(db.records || [])];
  const feedSec = state.feedSection || 'POPULAR';
  const typeFilter = state.feedTypeFilter || 'ALL';
  const cols = state.feedCols || 1;

  const typeLabels = {
    ALL: '전체 유형',
    QUOTE: '✍️ 인용구',
    THOUGHT: '💭 내생각',
    QUESTION: '❓ 의문점',
    SUMMARY: '📋 요약',
    REVIEW: '⭐ 리뷰'
  };
  const selectedTypeLabel = typeLabels[typeFilter] || '전체 유형';

  if (feedSec === 'MY') {
    records = records.filter(r => r.mine !== false);
  } else if (feedSec === 'POPULAR') {
    // Sort by likes descending for popular section
    records.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    // Latest first
    records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  if (typeFilter !== 'ALL') {
    records = records.filter(r => (r.type || 'QUOTE') === typeFilter);
  }

  // Calculate percentage width & gap for layout items
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

  // Select Today's Featured Most Popular Quote
  const allRecords = db.records || [];
  let todaysRecord = null;

  if (allRecords.length > 0) {
    todaysRecord = [...allRecords].sort((a, b) => {
      const likesDiff = (b.likes || 0) - (a.likes || 0);
      if (likesDiff !== 0) return likesDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    })[0];
  } else {
    todaysRecord = {
      id: 'default_today',
      bookTitle: '데미안',
      author: '헤르만 헤세',
      publisher: '민음사',
      page: 84,
      quote: '새는 알에서 나오기 위해 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
      thought: '내 안의 알을 깨부수고 진정한 자아를 찾아 나아가는 강렬한 용기.',
      likes: 128
    };
  }

  const todaysBook = db.books.find(b => b.id === todaysRecord.bookId || b.title === todaysRecord.bookTitle);
  const todaysBookTitle = todaysRecord.bookTitle || todaysBook?.title || '도서 제목';
  const todaysAuthor = todaysRecord.author || todaysBook?.author || '저자 미상';
  const todaysPublisher = todaysRecord.publisher || todaysBook?.publisher || '';

  container.innerHTML = `
    <div class="space-y-3 font-sans">
      
      <!-- 오늘의 문장 (Today's Quote Featured Hero Showcase) -->
      <div class="bg-stone-900 dark:bg-stone-900 rounded-2xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-stone-800 transition-all">
        <!-- Giant Decorative Quote Mark Background -->
        <div class="absolute -right-2 -bottom-8 opacity-10 font-serif text-9xl select-none pointer-events-none text-stone-100">“</div>
        
        <div class="relative z-10 space-y-3.5">
          <!-- Top Badge Bar -->
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 text-xs font-bold rounded-full border border-amber-400/40 backdrop-blur-xs">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>🔥 오늘의 문장</span>
            </span>
            <span class="text-[11px] text-stone-400 font-sans font-medium flex items-center gap-1">
              <span class="material-symbols-outlined text-xs text-amber-400">workspace_premium</span>
              <span>오늘의 가장 많은 공감을 받은 문장</span>
            </span>
          </div>

          <!-- Featured Quote Text (Large Serif Typography) -->
          <blockquote class="font-serif text-lg sm:text-xl md:text-2xl font-medium text-stone-100 leading-relaxed tracking-tight pl-3 border-l-4 border-amber-400/80">
            “${todaysRecord.quote}”
          </blockquote>

          ${todaysRecord.thought ? `
            <p class="text-xs text-stone-300 bg-stone-800/80 p-3 rounded-xl font-sans leading-normal border border-stone-700/60 font-serif">
              💭 ${todaysRecord.thought}
            </p>
          ` : ''}

          <!-- Bottom Footer Meta & Action Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-stone-800 text-xs text-stone-400 font-sans flex-wrap gap-2">
            <!-- Left: Book Meta (Clickable!) -->
            <div class="flex items-center gap-1.5 min-w-0 flex-wrap text-xs text-stone-300">
              <span class="material-symbols-outlined text-stone-400 text-base shrink-0">book</span>
              <button type="button" data-book-id="${todaysBook?.id || ''}" data-book-title="${todaysBookTitle}" data-author="${todaysAuthor}" class="btn-go-book-detail cursor-pointer font-bold text-amber-300 hover:underline text-xs sm:text-sm font-serif truncate">
                ${todaysBookTitle}
              </button>
              ${todaysRecord.page ? `
                <span class="text-stone-600">/</span>
                <span class="font-semibold text-stone-300">p.${todaysRecord.page}</span>
              ` : ''}
              <span class="text-stone-600">/</span>
              <span class="text-stone-400">${todaysAuthor}</span>
              ${todaysPublisher ? `
                <span class="text-stone-600">/</span>
                <span class="text-stone-500">${todaysPublisher}</span>
              ` : ''}
            </div>

            <!-- Right Actions: Like Button & Start Typing Button -->
            <div class="flex items-center gap-2 shrink-0">
              <button data-id="${todaysRecord.id}" class="btn-like-record px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 font-bold border border-stone-700/80" title="공감하기">
                <span class="material-symbols-outlined text-sm text-rose-500">favorite</span>
                <span>공감 ${todaysRecord.likes || 0}</span>
              </button>
              <button data-quote="${todaysRecord.quote}" data-title="${todaysBookTitle}" data-author="${todaysAuthor}" class="btn-start-typing px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-900 rounded-xl transition-all cursor-pointer flex items-center gap-1 font-bold shadow-xs" title="이 문장 필사하기">
                <span class="material-symbols-outlined text-sm">keyboard</span>
                <span>필사하기</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Unified Toolbar: Left (최신순 / 공감순 / 내 기록 + 전체 유형 필터), Right (1단 / 2단 / 3단) -->
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2 font-sans text-xs">
        <div class="flex items-center gap-2 flex-wrap">
          <div class="h-[30px] inline-flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
            <button data-feed-section="ALL" class="h-full btn-feed-section text-xs px-2.5 rounded-md font-bold flex items-center justify-center transition-all cursor-pointer ${feedSec === 'ALL' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
              최신순
            </button>
            <button data-feed-section="POPULAR" class="h-full btn-feed-section text-xs px-2.5 rounded-md font-bold flex items-center justify-center transition-all cursor-pointer ${feedSec === 'POPULAR' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
              공감순
            </button>
            <button data-feed-section="MY" class="h-full btn-feed-section text-xs px-2.5 rounded-md font-bold flex items-center justify-center transition-all cursor-pointer ${feedSec === 'MY' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
              내 기록
            </button>
          </div>

            <!-- Custom Floating Dropdown (Matching modal.js Search Target Dropdown Design) -->
            <div class="relative inline-block text-left shrink-0">
              <button id="feed-type-filter-btn" type="button" class="h-[30px] px-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 rounded-lg text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1 cursor-pointer focus:outline-none select-none hover:bg-stone-200/70 dark:hover:bg-stone-700/70 transition-colors shadow-2xs">
                <span>${selectedTypeLabel}</span>
                <span class="material-symbols-outlined text-sm text-stone-500">expand_more</span>
              </button>

              <div id="feed-type-filter-menu" class="hidden absolute left-0 top-full mt-1.5 w-36 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs z-50 font-sans space-y-0.5">
                <button type="button" data-value="ALL" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'ALL' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  전체 유형
                </button>
                <button type="button" data-value="QUOTE" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'QUOTE' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  ✍️ 인용구
                </button>
                <button type="button" data-value="THOUGHT" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'THOUGHT' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  💭 내생각
                </button>
                <button type="button" data-value="QUESTION" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'QUESTION' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  ❓ 의문점
                </button>
                <button type="button" data-value="SUMMARY" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'SUMMARY' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  📋 요약
                </button>
                <button type="button" data-value="REVIEW" class="feed-type-option-btn w-full px-3 py-2 text-left font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/70 rounded-lg cursor-pointer transition-colors ${typeFilter === 'REVIEW' ? 'bg-stone-100 dark:bg-stone-700/70 text-amber-600 dark:text-amber-400' : ''}">
                  ⭐ 리뷰
                </button>
              </div>
            </div>
          </div>

        <!-- Right Top Grid Column Control (1단 / 2단 / 3단 Selector) -->
        <div class="h-[30px] inline-flex items-center gap-0.5 bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/60 shadow-2xs">
          <button data-cols="1" class="h-full btn-feed-cols px-2.5 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${cols === 1 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            1단
          </button>
          <button data-cols="2" class="h-full btn-feed-cols px-2.5 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${cols === 2 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            2단
          </button>
          <button data-cols="3" class="h-full btn-feed-cols px-2.5 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${cols === 3 ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
            3단
          </button>
        </div>
      </div>

      <!-- Records Feed List (Container) -->
      ${records.length === 0 ? `
        <div class="w-full text-center py-14 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
          <span class="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-700 mb-2">format_quote</span>
          <p class="text-stone-500 dark:text-stone-400 font-medium text-sm">아직 등록된 수집 문장이 없습니다.</p>
        </div>
      ` : `
        <div id="feed-infinite-grid" class="w-full transition-all ${fallbackGridClass}">
          ${records.map(item => `
            <div class="feed-grid-item ${mbClass}" style="${itemWidthStyle}">
              ${renderRecordCard(item)}
            </div>
          `).join('')}
        </div>
      `}

    </div>
  `;

  container.querySelectorAll('.btn-feed-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sec = e.currentTarget.dataset.feedSection;
      setState({ feedSection: sec });
    });
  });

  // Filter Type Custom Dropdown Toggle & Selector
  const feedTypeBtn = container.querySelector('#feed-type-filter-btn');
  const feedTypeMenu = container.querySelector('#feed-type-filter-menu');

  feedTypeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    feedTypeMenu?.classList.toggle('hidden');
  });

  feedTypeMenu?.querySelectorAll('.feed-type-option-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = btn.dataset.value;
      feedTypeMenu.classList.add('hidden');
      setState({ feedTypeFilter: val });
    });
  });

  document.addEventListener('click', (e) => {
    if (feedTypeMenu && !feedTypeMenu.classList.contains('hidden') && !feedTypeBtn?.contains(e.target) && !feedTypeMenu.contains(e.target)) {
      feedTypeMenu.classList.add('hidden');
    }
  });

  container.querySelectorAll('.btn-feed-cols').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const numCols = parseInt(e.currentTarget.dataset.cols, 10);
      setState({ feedCols: numCols });
    });
  });

  // Initialize Naver @egjs/infinitegrid Masonry Engine (Naver D2 Technical Specification)
  const gridEl = container.querySelector('#feed-infinite-grid');
  if (gridEl && records.length > 0) {
    const eg = typeof window !== 'undefined' ? window.eg : undefined;
    const GridClass = eg?.MasonryInfiniteGrid || eg?.GridInfiniteGrid || eg?.InfiniteGrid;
    
    let egInstance = null;
    if (GridClass) {
      try {
        egInstance = new GridClass(gridEl, {
          gap: 14,
          column: cols,
          align: 'center',
          useTransform: true,
          renderExternal: false
        });
        egInstance.renderItems();
      } catch (err) {
        console.log('Naver InfiniteGrid render initialized:', err);
      }
    }

    // Apply Naver D2 Shortest Column Height Masonry Algorithm (d2.naver.com/helloworld/0637045)
    const runNaverD2MasonryLayout = () => {
      if (!gridEl || !gridEl.style) return;
      if (cols === 1) {
        gridEl.style.position = 'relative';
        gridEl.style.height = 'auto';
        Array.from(gridEl.children).forEach(item => {
          item.style.position = 'static';
          item.style.width = '100%';
        });
        return;
      }

      const containerWidth = gridEl.clientWidth;
      if (!containerWidth) return;
      
      const gap = 14;
      const itemWidth = (containerWidth - gap * (cols - 1)) / cols;
      const columnHeights = new Array(cols).fill(0);

      gridEl.style.position = 'relative';
      const items = Array.from(gridEl.children);

      items.forEach(item => {
        item.style.position = 'absolute';
        item.style.width = `${itemWidth}px`;

        // Naver D2 Shortest Column Search Algorithm: find min height column index
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
      gridEl.style.height = `${maxHeight}px`;
    };

    // Run layout after DOM render & image load
    setTimeout(runNaverD2MasonryLayout, 50);
    setTimeout(runNaverD2MasonryLayout, 300);

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', runNaverD2MasonryLayout, { passive: true });
    }
  }

  attachRecordCardEvents(container);
}

function renderStarRatingSymbols(rating) {
  const score = Math.round(Number(rating) || 5);
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= score) {
      stars += '<span class="text-amber-400">★</span>';
    } else {
      stars += '<span class="text-stone-300 dark:text-stone-600">★</span>';
    }
  }
  return `<span class="inline-flex items-center tracking-tighter text-xs" title="${rating}점">${stars}</span>`;
}

function getCardUserInfo(item) {
  if (item.userName) {
    return {
      name: item.userName,
      avatar: item.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id || 'user'}`
    };
  }
  if (item.mine !== false) {
    return {
      name: '빛나는 독자',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    };
  }
  const readerNames = ['고요한 독자', '지혜로운 독자', '달빛 수집가', '글귀 탐험가', '새벽 독서가'];
  const nameIdx = (item.id ? item.id.charCodeAt(item.id.length - 1) : 0) % readerNames.length;
  return {
    name: readerNames[nameIdx],
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.id || 'reader'}`
  };
}

export function renderRecordCard(item) {
  const targetBook = db.books.find(b => b.id === item.bookId || b.title === item.bookTitle);
  const isSpoiled = item.spoil && targetBook && (item.page > targetBook.curPage);
  const publisher = item.publisher || targetBook?.publisher || '';
  const bookTitle = item.bookTitle || targetBook?.title || '도서 제목';
  const isReview = (item.type === 'REVIEW');
  const ratingVal = item.rating || targetBook?.rating || 5.0;
  const userInfo = getCardUserInfo(item);

  return `
    <article id="post-card-${item.id}" data-id="${item.id}" class="${isReview ? 'bg-amber-50/50 dark:bg-stone-900/90 border-l-4 border-l-amber-500 border-t border-r border-b border-amber-200/80 dark:border-stone-800' : 'bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800'} rounded-2xl px-4 pt-3.5 pb-3 sm:px-5 sm:pt-4 sm:pb-3.5 shadow-sm hover:shadow-md transition-all relative overflow-visible group flex flex-col justify-between h-full gap-3 font-sans">
      
      <!-- Card Body Content -->
      <div class="flex-1 space-y-2.5">
        ${isReview ? `
          <!-- Review Card Top Header Line -->
          <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-amber-200/70 dark:border-stone-700/70">
            
            <!-- Left: '리뷰' Tag Badge + Book Title / Author / Publisher / Star Rating -->
            <div class="flex items-center gap-1.5 flex-wrap text-xs text-stone-500 font-sans min-w-0 flex-1">
              <span class="px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-[11px] shrink-0">
                리뷰
              </span>

              <button type="button" data-book-id="${targetBook?.id || ''}" data-book-title="${bookTitle}" data-author="${item.author || ''}" class="btn-go-book-detail cursor-pointer font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif text-left truncate hover:underline">
                ${bookTitle}
              </button>
              <span class="text-amber-300 dark:text-stone-600">/</span>
              <span class="text-stone-600 dark:text-stone-400">${item.author}</span>
              ${publisher ? `
                <span class="text-amber-300 dark:text-stone-600">/</span>
                <span class="text-stone-500 dark:text-stone-400">${publisher}</span>
              ` : ''}
              <span class="text-amber-300 dark:text-stone-600">/</span>
              <span class="inline-flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400 text-xs shrink-0">
                ${renderStarRatingSymbols(ratingVal)}
                <span class="text-stone-500 dark:text-stone-400 font-semibold text-[11px]">(${Number(ratingVal).toFixed(1)})</span>
              </span>
            </div>

            <!-- Right: 3-Dots Menu Button & Dropdown inside Review Card -->
            <div class="relative shrink-0 z-40">
              <button class="btn-more-feed p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-amber-100/80 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer" title="더보기">
                <span class="material-symbols-outlined text-base">more_vert</span>
              </button>

              <!-- Dropdown Menu -->
              <div class="menu-more-feed hidden absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs z-50 font-sans">
                <button data-quote="${item.quote}" data-title="${bookTitle}" data-author="${item.author}" class="btn-open-studio w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-stone-400">style</span>
                  <span>감성 카드</span>
                </button>
                <button data-quote="${item.quote}" data-title="${bookTitle}" class="btn-copy-quote w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-stone-400">content_copy</span>
                  <span>복사</span>
                </button>
                <div class="border-t border-stone-100 dark:border-stone-700/70 my-1"></div>
                <button data-id="${item.id}" class="btn-delete-record w-full px-2.5 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-rose-500">delete</span>
                  <span>삭제</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Review Text Content Body -->
          <div class="py-1">
            <p class="text-stone-800 dark:text-stone-200 leading-relaxed font-sans text-xs sm:text-sm font-medium break-words">
              ${item.quote}
            </p>
          </div>
        ` : `
          <!-- Book Title Header with Slash Dividers & Top-Right 3-Dots Menu (Non-Review Cards) -->
          <div class="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800 gap-2">
            
            <!-- Left: Book Title / Page / Author / Publisher -->
            <div class="flex items-center gap-1.5 min-w-0 flex-1 flex-wrap text-xs text-stone-500 font-sans">
              <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-base shrink-0">book</span>
              
              <!-- 1. 도서 제목 -->
              <button type="button" data-book-id="${targetBook?.id || ''}" data-book-title="${bookTitle}" data-author="${item.author || ''}" class="btn-go-book-detail cursor-pointer font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-serif text-left truncate hover:underline">
                ${bookTitle}
              </button>
              
              <!-- 2. 페이지 (또는 흑백 📱 이북) -->
              <span class="text-stone-300 dark:text-stone-600">/</span>
              <span class="font-semibold text-stone-700 dark:text-stone-300">${item.page ? `p.${item.page}` : '<span class="filter grayscale opacity-75">📱</span> 이북'}</span>
              
              <!-- 3. 작가 -->
              <span class="text-stone-300 dark:text-stone-600">/</span>
              <span class="text-stone-600 dark:text-stone-400">${item.author}</span>
              
              <!-- 4. 출판사 -->
              ${publisher ? `
                <span class="text-stone-300 dark:text-stone-600">/</span>
                <span class="text-stone-500 dark:text-stone-400">${publisher}</span>
              ` : ''}
            </div>

            <!-- Top-Right: 3 Dots Menu Button & Dropdown -->
            <div class="relative shrink-0 z-40">
              <button class="btn-more-feed p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer" title="더보기">
                <span class="material-symbols-outlined text-base">more_vert</span>
              </button>

              <!-- Dropdown Menu -->
              <div class="menu-more-feed hidden absolute right-0 top-full mt-1.5 w-32 bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl shadow-2xl p-1 text-xs z-50 font-sans">
                <button data-quote="${item.quote}" data-title="${bookTitle}" data-author="${item.author}" class="btn-open-studio w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-stone-400">style</span>
                  <span>감성 카드</span>
                </button>
                <button data-quote="${item.quote}" data-title="${bookTitle}" class="btn-copy-quote w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-stone-400">content_copy</span>
                  <span>복사</span>
                </button>
                <div class="border-t border-stone-100 dark:border-stone-700/70 my-1"></div>
                <button data-id="${item.id}" class="btn-delete-record w-full px-2.5 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                  <span class="material-symbols-outlined text-sm text-rose-500">delete</span>
                  <span>삭제</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Spoiler Blind Mask or Quote Content -->
          ${isSpoiled ? `
            <div class="bg-stone-900/10 dark:bg-stone-800/60 backdrop-blur-md rounded-xl p-3 text-center my-1.5 border border-stone-300 dark:border-stone-700">
              <span class="material-symbols-outlined text-stone-800 dark:text-stone-200 text-lg mb-0.5">visibility_off</span>
              <p class="font-bold text-stone-900 dark:text-stone-100 text-xs">스포일러 방지 블라인드</p>
              <p class="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">현재 독서 진행 지점(p.${targetBook?.curPage || 0})보다 뒤의 기록입니다.</p>
            </div>
          ` : `
            <!-- Quote Content (Larger Font Size) -->
            <blockquote class="font-serif text-stone-900 dark:text-stone-100 text-lg sm:text-xl leading-relaxed my-1.5 pl-3 py-0.5 border-l-3 border-stone-900 dark:border-stone-100 break-words font-medium">
              “${item.quote}”
            </blockquote>

            ${item.thought ? `
              <div class="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-2.5 rounded-xl mt-2 font-sans leading-normal border border-stone-100 dark:border-stone-800 break-words">
                <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">💭 독자의 생각</span>
                <span>${item.thought}</span>
              </div>
            ` : ''}
          `}
        `}
      </div>

      <!-- Integrated Card Footer Actions (Inside the Article Container) -->
      <div class="flex items-center justify-between pt-2.5 border-t ${isReview ? 'border-amber-200/70 dark:border-stone-800' : 'border-stone-100 dark:border-stone-800'} text-xs text-stone-500 font-sans mt-auto shrink-0 gap-2">
        
        <!-- Left: Profile Image / Account Name / Creation Time -->
        <div class="flex items-center gap-1.5 min-w-0 text-[11px] text-stone-500 font-sans">
          <img src="${userInfo.avatar}" alt="${esc(userInfo.name)}" class="w-5 h-5 rounded-full object-cover shrink-0 border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';" />
          <span class="font-bold text-stone-800 dark:text-stone-200 truncate">${esc(userInfo.name)}</span>
          <span class="text-stone-300 dark:text-stone-600 shrink-0">/</span>
          <span class="text-stone-400 dark:text-stone-500 font-serif shrink-0">${formatRelativeTime(item.createdAt)}</span>
        </div>

        <!-- Right: 3 Icon Action Group (Like, Typing/Save Note, Report) -->
        <div class="flex items-center gap-1 shrink-0 z-20 relative">
          
          <!-- 1. Like Button -->
          <button data-id="${item.id}" class="btn-like-record p-1 text-stone-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5" title="좋아요">
            <span class="material-symbols-outlined text-base text-rose-500">favorite</span>
            <span class="text-xs font-bold text-stone-700 dark:text-stone-300 ml-0.5">${item.likes || 0}</span>
          </button>

          <!-- 2. Transcription / Typing Button -->
          <button data-quote="${item.quote}" data-title="${bookTitle}" data-author="${item.author}" class="btn-start-typing p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer" title="이 문장 필사하기">
            <span class="material-symbols-outlined text-base">bookmark_add</span>
          </button>

          <!-- 3. Report Button -->
          <button class="btn-report-quote p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer" title="신고하기">
            <span class="material-symbols-outlined text-base">report</span>
          </button>

        </div>
      </div>

    </article>
  `;
}

export function attachRecordCardEvents(container) {
  // 1. Click Book Title -> Navigate to Book Detail Page
  container.querySelectorAll('.btn-go-book-detail').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookTitle = e.currentTarget.dataset.bookTitle;
      const bookId = e.currentTarget.dataset.bookId;
      let targetBook = db.books.find(b => (bookId && b.id === bookId) || b.title === bookTitle);

      if (!targetBook) {
        targetBook = {
          id: 'b_' + Date.now(),
          title: bookTitle,
          author: e.currentTarget.dataset.author || '저자 미상',
          publisher: '출판사 미상',
          curPage: 0,
          totalPage: 300,
          status: 'WANT',
          cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
          startDate: new Date().toISOString().slice(0, 10),
          finishDate: ''
        };
        updateDB(data => { data.books.push(targetBook); });
      }

      document.getElementById('detail-bg-fixed-layer')?.remove();
      setState({ tab: 'library', activeBookId: targetBook.id });
    });
  });

  // 2. Like Record Button
  container.querySelectorAll('.btn-like-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      updateDB(data => {
        const target = data.records.find(r => r.id === id);
        if (target) target.likes = (target.likes || 0) + 1;
      });
    });
  });

  // 3. Open Card Studio Overlay
  container.querySelectorAll('.btn-open-studio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quote = e.currentTarget.dataset.quote;
      const author = e.currentTarget.dataset.author;
      const title = e.currentTarget.dataset.title;

      setState({
        overlayStack: [{
          type: 'CARD_STUDIO',
          data: { quote, author, title }
        }]
      });
    });
  });

  // 4. Start Typing Practice
  container.querySelectorAll('.btn-start-typing').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quote = e.currentTarget.dataset.quote;
      const title = e.currentTarget.dataset.title;
      const author = e.currentTarget.dataset.author;
      setState({
        tab: 'typing',
        activeTyping: {
          text: quote,
          source: title,
          author
        }
      });
    });
  });

  // 5. Toggle 3 Dots Dropdown Menu (With Z-Index Stacking Context Elevation)
  container.querySelectorAll('.btn-more-feed').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentCard = e.currentTarget.closest('article');
      const menu = parentCard?.querySelector('.menu-more-feed');

      container.querySelectorAll('.menu-more-feed').forEach(m => {
        if (m !== menu) {
          m.classList.add('hidden');
          m.closest('article')?.classList.remove('z-30');
        }
      });

      if (menu) {
        const isOpening = menu.classList.contains('hidden');
        menu.classList.toggle('hidden');
        if (isOpening) {
          parentCard?.classList.add('z-30');
        } else {
          parentCard?.classList.remove('z-30');
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.btn-more-feed') && !e.target.closest('.menu-more-feed')) {
      container.querySelectorAll('.menu-more-feed').forEach(m => {
        m.classList.add('hidden');
        m.closest('article')?.classList.remove('z-30');
      });
    }
  });

  // 6. Copy Quote Handler
  container.querySelectorAll('.btn-copy-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quote = e.currentTarget.dataset.quote;
      const title = e.currentTarget.dataset.title;
      navigator.clipboard.writeText(`"${quote}" — ${title}`);
      alert('문장이 클립보드에 복사되었습니다.');
    });
  });

  // 7. Delete Record Handler
  container.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      if (confirm('이 문장 기록을 삭제하시겠습니까?')) {
        updateDB(data => {
          data.records = data.records.filter(r => r.id !== id);
        });
      }
    });
  });

  // 8. Report Quote Handler (Opens Custom Report Modal Window)
  container.querySelectorAll('.btn-report-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.currentTarget.closest('article');
      const id = card?.dataset?.id;
      setState({ modal: { type: 'REPORT', recordId: id } });
    });
  });
}
