/**
 * Sentence Feed & Community Component
 * Solemn & Editorial Deep Ink Theme (Default: Popular Sentences First)
 */
import { state, setState, db, updateDB } from '../state.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

export function renderFeed(container) {
  let records = [...(db.records || [])];
  const feedSec = state.feedSection || 'POPULAR';

  if (feedSec === 'MY') {
    records = records.filter(r => r.mine !== false);
  } else if (feedSec === 'POPULAR') {
    // Sort by likes descending for popular section
    records.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  } else {
    // Latest first
    records.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  container.innerHTML = `
    <div class="space-y-3.5 font-sans">
      
      <!-- Hallmark Editorial Banner -->
      <div class="bg-stone-900 dark:bg-stone-800/90 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-stone-800/80">
        <div class="absolute -right-3 -bottom-5 opacity-10 font-serif text-9xl select-none pointer-events-none text-stone-200">“</div>
        <div class="relative z-10 space-y-2">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-stone-800/90 dark:bg-stone-700/80 text-amber-300 text-[11px] font-bold rounded-lg border border-stone-700/60">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            오늘의 문장 수집함
          </span>
          <h2 class="text-xl md:text-2xl font-bold font-serif leading-snug tracking-tight text-stone-100">
            책 속의 빛나는 문장을 수집하고<br/><span class="text-stone-300">나만의 감성 인용 카드</span>로 간직하세요
          </h2>
        </div>
      </div>

      <!-- Feed Section Filter Tabs (Segmented Control Match) -->
      <div class="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1 text-xs font-sans w-full shadow-xs">
        <button data-feed-section="POPULAR" class="btn-feed-section flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${feedSec === 'POPULAR' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          🔥 인기 문장
        </button>
        <button data-feed-section="ALL" class="btn-feed-section flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${feedSec === 'ALL' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          📚 전체 문장
        </button>
        <button data-feed-section="MY" class="btn-feed-section flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${feedSec === 'MY' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          📝 내 수집 문장
        </button>
      </div>

      <!-- Records Feed List (2 Columns on PC Desktop) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${records.length === 0 ? `
          <div class="col-span-full text-center py-14 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <span class="material-symbols-outlined text-4xl text-stone-300 dark:text-stone-700 mb-2">format_quote</span>
            <p class="text-stone-500 dark:text-stone-400 font-medium text-sm">아직 등록된 수집 문장이 없습니다.</p>
          </div>
        ` : records.map(item => renderRecordCard(item)).join('')}
      </div>

    </div>
  `;

  container.querySelectorAll('.btn-feed-section').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sec = e.currentTarget.dataset.feedSection;
      setState({ feedSection: sec });
    });
  });

  container.querySelectorAll('.btn-like-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      updateDB(data => {
        const target = data.records.find(r => r.id === id);
        if (target) target.likes = (target.likes || 0) + 1;
      });
    });
  });

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

  // 3. More Options Menu Toggles (Dots)
  container.querySelectorAll('.btn-more-feed').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parentCard = e.currentTarget.closest('article');
      const menu = parentCard?.querySelector('.menu-more-feed');
      container.querySelectorAll('.menu-more-feed').forEach(m => {
        if (m !== menu) m.classList.add('hidden');
      });
      menu?.classList.toggle('hidden');
    });
  });

  document.addEventListener('click', () => {
    container.querySelectorAll('.menu-more-feed').forEach(m => m.classList.add('hidden'));
  });

  // Copy Quote Handler
  container.querySelectorAll('.btn-copy-quote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const quote = e.currentTarget.dataset.quote;
      const title = e.currentTarget.dataset.title;
      navigator.clipboard.writeText(`"${quote}" — ${title}`);
      alert('문장이 클립보드에 복사되었습니다.');
    });
  });

  // Report Quote Handler
  container.querySelectorAll('.btn-report-quote').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('해당 문장이 신고 접수되었습니다. 검토 후 조치하겠습니다.');
    });
  });
}

function renderRecordCard(item) {
  const targetBook = db.books.find(b => b.id === item.bookId || b.title === item.bookTitle);
  const isSpoiled = item.spoil && targetBook && (item.page > targetBook.curPage);

  return `
    <article class="bg-white rounded-5px p-4.5 sm:p-5 border border-stone-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all relative overflow-hidden group space-y-3">
      
      <!-- Book Title Header -->
      <div class="flex items-center justify-between pb-2.5 border-b border-stone-100">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-stone-800 text-lg">book</span>
          <h3 class="font-bold text-stone-900 text-sm font-serif group-hover:text-stone-700 transition-colors">${item.bookTitle}</h3>
          <span class="text-xs text-stone-400">· ${item.author}</span>
        </div>
        <span class="text-xs font-bold px-2.5 py-0.5 bg-stone-100 text-stone-800 rounded-5px">p.${item.page}</span>
      </div>

      <!-- Spoiler Blind Mask -->
      ${isSpoiled ? `
        <div class="bg-stone-900/10 backdrop-blur-md rounded-5px p-4 text-center my-2 border border-stone-300">
          <span class="material-symbols-outlined text-stone-800 text-xl mb-0.5">visibility_off</span>
          <p class="font-bold text-stone-900 text-xs">스포일러 방지 블라인드</p>
          <p class="text-[11px] text-stone-600 mt-0.5">현재 독서 진행 지점(p.${targetBook?.curPage || 0})보다 뒤의 기록입니다.</p>
        </div>
      ` : `
        <!-- Quote Content -->
        <blockquote class="font-serif text-stone-900 text-base leading-relaxed my-2.5 pl-3.5 py-0.5 border-l-2.5 border-stone-900">
          “${item.quote}”
        </blockquote>

        ${item.thought ? `
          <div class="text-xs text-stone-700 bg-stone-50 p-3 rounded-5px mt-2.5 font-sans leading-normal border border-stone-100">
            <span class="font-bold text-stone-900 block mb-0.5">💭 독자의 생각</span>
            <span>${item.thought}</span>
          </div>
        ` : ''}
      `}

      <!-- Footer Actions (Unified 3 Icon Group matching Typing Studio) -->
      <div class="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500 font-sans">
        
        <!-- Left: Created Date -->
        <span class="text-[11px] text-stone-400 font-serif">${formatRelativeTime(item.createdAt)}</span>

        <!-- Right: 3 Icon Action Group (Like, Typing/Save Note, More Menu) -->
        <div class="flex items-center gap-1 shrink-0 z-20 relative">
          
          <!-- 1. Like Button -->
          <button data-id="${item.id}" class="btn-like-record p-1.5 text-stone-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer flex items-center gap-0.5" title="좋아요">
            <span class="material-symbols-outlined text-lg text-rose-500">favorite</span>
            <span class="text-xs font-bold text-stone-700 dark:text-stone-300 ml-0.5">${item.likes || 0}</span>
          </button>

          <!-- 2. Transcription / Typing Button (필사 수집 & 필사하기) -->
          <button data-quote="${item.quote}" data-title="${item.bookTitle}" data-author="${item.author}" class="btn-start-typing p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer" title="이 문장 필사하기">
            <span class="material-symbols-outlined text-lg">bookmark_add</span>
          </button>

          <!-- 3. More Options Button (Dots) -->
          <div class="relative">
            <button class="btn-more-feed p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer" title="더보기">
              <span class="material-symbols-outlined text-lg">more_vert</span>
            </button>

            <!-- Dropdown Menu -->
            <div class="menu-more-feed hidden absolute right-0 bottom-full mb-2 w-32 bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl shadow-lg p-1 text-xs z-30 font-sans">
              <button data-quote="${item.quote}" data-title="${item.bookTitle}" data-author="${item.author}" class="btn-open-studio w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                <span class="material-symbols-outlined text-sm text-stone-400">style</span>
                <span>감성 카드</span>
              </button>
              <button data-quote="${item.quote}" data-title="${item.bookTitle}" class="btn-copy-quote w-full px-2.5 py-1.5 text-left text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700/60 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                <span class="material-symbols-outlined text-sm text-stone-400">content_copy</span>
                <span>복사</span>
              </button>
              <button class="btn-report-quote w-full px-2.5 py-1.5 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg flex items-center gap-2 cursor-pointer font-medium">
                <span class="material-symbols-outlined text-sm">report</span>
                <span>신고</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </article>
  `;
}
