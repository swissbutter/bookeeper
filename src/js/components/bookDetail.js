/**
 * Book Detail Full Component System (Exact Port from bookkeeper-main/index.html)
 * Side-by-Side Cover & Metadata Card + Reader Count Pill + Expandable Description + 
 * Status Chips (보관함/읽는 중/완독) + Interactive Barcode & Direct Page Input Modal
 */
import { state, setState, db, updateDB, updateDBSilent } from '../state.js';
import { formatRelativeTime } from '../utils/dateUtils.js';
import { DEFAULT_BOOK_COVER } from '../utils/imageUtils.js';

const UNIFIED_BARCODE_COLOR = '#B45309';

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function barcodeHtml(book, records, activeDetailTab = 'MY') {
  if (!book) return '';
  const total = book.totalPage || 1;
  const cur = Math.min(book.curPage || 0, total);

  const isMineTab = (activeDetailTab === 'MY');
  const marks = records.filter(p => p.page != null && (isMineTab ? p.mine !== false : p.mine === false));

  marks.sort((a, b) => (a.page || 0) - (b.page || 0));

  const pct = Math.min(Math.round((cur / total) * 100), 100);

  const tickCount = 80;
  const ticksHtml = Array.from({ length: tickCount }).map((_, idx) => {
    const isRead = ((idx + 1) / tickCount) * 100 <= pct;
    return `<i class="${isRead ? 'read-tick' : 'unread-tick'}"></i>`;
  }).join('');

  return `
    <div class="barcode-wrap" id="detailBarcodeWrap" style="cursor: grab; user-select: none; touch-action: none; position: relative;">
      <div class="ticks">${ticksHtml}</div>
      ${marks.map((mk, i) => {
        const color = UNIFIED_BARCODE_COLOR;
        const posPct = Math.min(Math.max((mk.page / total) * 100, 2), 98);
        const isBottom = (i % 2 === 1);
        return `
          <div class="post-mark" data-post-id="${mk.id}" data-post-point="${mk.page}" data-is-mine="${mk.mine !== false ? '1' : '0'}" style="left:${posPct}%; background:${color}; box-shadow:0 0 3px ${color}; cursor:pointer;" title="${mk.page}p 문장 기록">
            <span class="post-mark-label ${isBottom ? 'is-bottom' : 'is-top'}" data-post-id="${mk.id}" data-post-point="${mk.page}" data-is-mine="${mk.mine !== false ? '1' : '0'}" style="background:${color}; pointer-events:auto; cursor:pointer; ${isBottom ? 'bottom:3px; top:auto;' : 'top:3px; bottom:auto;'}">${mk.page}p</span>
          </div>
        `;
      }).join('')}
      <div class="cursor-line" style="left:${(cur / total * 100)}%;"></div>
    </div>
  `;
}

function showBarcodeOverlapPopup(evt, nearbyMarks, barcodeWrap, container) {
  document.querySelectorAll('.barcode-overlap-popup').forEach(el => el.remove());

  const popup = document.createElement('div');
  popup.className = 'barcode-overlap-popup';

  const itemsHtml = nearbyMarks.map((mk, idx) => {
    const color = UNIFIED_BARCODE_COLOR;
    const previewText = esc(mk.quote ? (mk.quote.length > 20 ? mk.quote.slice(0, 20) + '...' : mk.quote) : '기록 문장');
    const author = esc(mk.author || '익명');
    return `
      <div class="popup-item" data-popup-post-id="${mk.id}" data-popup-point="${mk.page}" data-popup-mine="${mk.mine !== false ? '1' : '0'}" style="display:flex; align-items:center; gap:8px; padding:7px 8px; border-radius:5px; cursor:pointer; margin-bottom:3px; transition:background 0.15s;">
        <span style="background:${color}; color:#FFF; font-size:10.5px; font-weight:800; padding:2px 6px; border-radius:5px; flex-shrink:0;">${mk.page}p</span>
        <div style="overflow:hidden;">
          <div style="font-size:12px; font-weight:700; color:#1C1917; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">"${previewText}"</div>
          <div style="font-size:10px; color:#78716C; font-weight:500;">작성자: ${author}</div>
        </div>
      </div>
    `;
  }).join('');

  popup.innerHTML = `
    <div style="font-size:11px; font-weight:800; color:#78716C; padding:3px 4px 6px; border-bottom:1px solid #E7E5E4; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
      <span>📍 겹친 기록 선택 (${nearbyMarks.length}개)</span>
      <span style="cursor:pointer; font-size:12px; padding:2px 6px;" class="btn-close-overlap-popup">✕</span>
    </div>
    <div style="max-height:180px; overflow-y:auto;">
      ${itemsHtml}
    </div>
  `;

  document.body.appendChild(popup);

  const rect = barcodeWrap.getBoundingClientRect();
  const clickX = evt.changedTouches ? evt.changedTouches[0].clientX : (evt.clientX || (rect.left + rect.width / 2));
  let leftPos = Math.max(10, Math.min(window.innerWidth - 290, clickX - 100));
  let topPos = rect.top - 140;
  if (topPos < 50) topPos = rect.bottom + 10;

  popup.style.left = leftPos + 'px';
  popup.style.top = topPos + 'px';

  popup.querySelector('.btn-close-overlap-popup')?.addEventListener('click', () => popup.remove());

  popup.querySelectorAll('[data-popup-post-id]').forEach(item => {
    item.onclick = (e) => {
      e.stopPropagation();
      const postId = item.dataset.popupPostId;
      const isMine = item.dataset.popupMine === '1';
      popup.remove();

      const targetTab = isMine ? 'MY' : 'COMMUNITY';
      if ((state.detailTab || 'MY') !== targetTab) {
        setState({ detailTab: targetTab });
      }
      setTimeout(() => {
        const cardEl = container.querySelector('#post-card-' + postId);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          cardEl.style.transition = 'all 0.3s ease';
          cardEl.style.outline = '2px solid #1C1917';
          cardEl.style.boxShadow = '0 0 14px rgba(28, 25, 24, 0.4)';
          setTimeout(() => {
            cardEl.style.outline = 'none';
            cardEl.style.boxShadow = 'none';
          }, 1800);
        }
      }, 50);
    };
  });

  setTimeout(() => {
    function closePopup(e) {
      if (!popup.contains(e.target) && !barcodeWrap.contains(e.target)) {
        popup.remove();
        document.removeEventListener('click', closePopup);
      }
    }
    document.addEventListener('click', closePopup);
  }, 10);
}

function attachBarcodeDragEvents(container, book, allBookRecords) {
  const barcodeWrap = container.querySelector('#detailBarcodeWrap');
  if (!barcodeWrap || !book) return;

  const totalPoint = book.totalPage || 1;
  const cursorLine = barcodeWrap.querySelector('.cursor-line');
  const ticks = barcodeWrap.querySelectorAll('.ticks i');
  const pctText = container.querySelector('#detailPctText');
  const pageBadge = container.querySelector('#detailPageBadge');

  let isDragging = false;
  let hasDragged = false;
  let startX = 0;
  let startY = 0;
  let initialTarget = null;
  let dragTargetPage = book.curPage || 0;

  let dragTooltip = barcodeWrap.querySelector('.drag-tooltip');
  if (!dragTooltip) {
    dragTooltip = document.createElement('div');
    dragTooltip.className = 'drag-tooltip';
    dragTooltip.style.cssText = 'position:absolute; top:-26px; transform:translateX(-50%); background:#1C1917; color:#FFF; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:5px; display:none; z-index:10; pointer-events:none; box-shadow:0 2px 6px rgba(0,0,0,0.2); white-space:nowrap;';
    barcodeWrap.appendChild(dragTooltip);
  }

  function updateDragPosition(clientX) {
    const rect = barcodeWrap.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    dragTargetPage = Math.round(ratio * totalPoint);
    const curPct = Math.min(Math.round((dragTargetPage / totalPoint) * 100), 100);

    if (cursorLine) cursorLine.style.left = (ratio * 100) + '%';
    if (pctText) pctText.textContent = curPct + '%';
    if (pageBadge) pageBadge.textContent = `${dragTargetPage}p`;

    if (ticks && ticks.length > 0) {
      const tickCount = ticks.length;
      ticks.forEach((tick, idx) => {
        const isRead = ((idx + 1) / tickCount) * 100 <= curPct;
        tick.className = isRead ? 'read-tick' : 'unread-tick';
      });
    }

    if (dragTooltip) {
      dragTooltip.style.display = 'block';
      dragTooltip.style.left = (ratio * 100) + '%';
      dragTooltip.textContent = `${dragTargetPage}p (${curPct}%)`;
    }
  }

  function onMove(evt) {
    if (!isDragging) return;
    if (evt.cancelable) evt.preventDefault();

    const cx = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const cy = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const dist = Math.hypot(cx - startX, cy - startY);
    if (dist > 3) {
      hasDragged = true;
    }
    if (hasDragged) {
      updateDragPosition(cx);
    }
  }

  function onEnd(evt) {
    if (!isDragging) return;
    isDragging = false;
    barcodeWrap.style.cursor = 'grab';
    if (dragTooltip) dragTooltip.style.display = 'none';

    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);

    if (hasDragged) {
      book.curPage = dragTargetPage;
      if (dragTargetPage >= totalPoint) {
        book.status = 'DONE';
      } else if (dragTargetPage > 0) {
        book.status = 'ACTIVE';
      }
      updateDBSilent(data => {
        const b = data.books.find(item => item.id === book.id);
        if (b) {
          b.curPage = dragTargetPage;
          b.status = book.status;
        }
      });
    } else {
      const isMineTab = (state.detailTab || 'MY') === 'MY';
      const activeTabPosts = allBookRecords.filter(p => p.page != null && (isMineTab ? p.mine !== false : p.mine === false));
      const clickX = evt.changedTouches ? evt.changedTouches[0].clientX : (evt.clientX || startX);
      const rect = barcodeWrap.getBoundingClientRect();
      const clickPct = Math.max(0, Math.min(100, ((clickX - rect.left) / rect.width) * 100));

      const markEl = (initialTarget && initialTarget.closest) ? initialTarget.closest('[data-post-id]') : null;

      let nearbyMarks = [];
      if (markEl && markEl.dataset && markEl.dataset.postPoint != null) {
        const clickedPoint = parseFloat(markEl.dataset.postPoint);
        const clickedPct = (clickedPoint / totalPoint) * 100;
        nearbyMarks = activeTabPosts.filter(p => {
          const pPct = (p.page / totalPoint) * 100;
          return Math.abs(pPct - clickedPct) <= 5.0;
        });
      } else {
        nearbyMarks = activeTabPosts.filter(p => {
          const pPct = (p.page / totalPoint) * 100;
          return Math.abs(pPct - clickPct) <= 4.0;
        });
      }

      if (nearbyMarks.length > 1) {
        showBarcodeOverlapPopup(evt, nearbyMarks, barcodeWrap, container);
      } else if (nearbyMarks.length === 1) {
        const mk = nearbyMarks[0];
        const targetTab = mk.mine !== false ? 'MY' : 'COMMUNITY';
        if ((state.detailTab || 'MY') !== targetTab) {
          setState({ detailTab: targetTab });
        }
        setTimeout(() => {
          const cardEl = container.querySelector('#post-card-' + mk.id);
          if (cardEl) {
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cardEl.style.transition = 'all 0.3s ease';
            cardEl.style.outline = '2px solid #1C1917';
            cardEl.style.boxShadow = '0 0 14px rgba(28, 25, 24, 0.4)';
            setTimeout(() => {
              cardEl.style.outline = 'none';
              cardEl.style.boxShadow = 'none';
            }, 1800);
          }
        }, 50);
      }
    }
  }

  function startDrag(e) {
    isDragging = true;
    hasDragged = false;
    initialTarget = e.target;
    barcodeWrap.style.cursor = 'grabbing';
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    startY = e.touches ? e.touches[0].clientY : e.clientY;

    window.addEventListener('mousemove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  barcodeWrap.addEventListener('mousedown', startDrag);
  barcodeWrap.addEventListener('touchstart', startDrag, { passive: true });
}

export function renderBookDetailPage(container, targetBookId) {
  const bookId = typeof targetBookId === 'string' ? targetBookId : (targetBookId?.bookId || state.activeBookId);
  const book = db.books.find(b => b.id === bookId || b.title === targetBookId?.title);

  if (!book) {
    container.innerHTML = `
      <div class="bg-white dark:bg-stone-900 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 text-center max-w-md mx-auto space-y-4 my-8 font-sans">
        <span class="material-symbols-outlined text-4xl text-stone-300">menu_book</span>
        <p class="font-bold text-stone-800 dark:text-stone-200">선택한 도서 정보를 찾을 수 없습니다.</p>
        <button id="btn-close-detail-error" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold text-xs cursor-pointer">내 서재로 돌아가기</button>
      </div>
    `;
    container.querySelector('#btn-close-detail-error')?.addEventListener('click', () => {
      setState({ activeBookId: null, tab: 'library' });
    });
    return;
  }

  const curPoint = book.curPage || 0;
  const totalPoint = book.totalPage || 1;
  const pct = Math.min(Math.round((curPoint / totalPoint) * 100), 100);

  const allBookRecords = (db.records || []).filter(r => r.bookId === book.id || r.bookTitle === book.title);
  const myRecords = allBookRecords.filter(r => r.mine !== false);
  const commRecords = allBookRecords.filter(r => r.mine === false);

  const activeTab = state.detailTab || 'MY';
  const typeFilter = state.myPostTypeFilter || 'ALL';
  const sortType = state.myPostSort || 'LATEST';

  let displayRecords = (activeTab === 'MY' ? myRecords : commRecords).filter(r => {
    if (typeFilter === 'ALL') return true;
    return (r.type || 'QUOTE') === typeFilter;
  });

  if (sortType === 'LATEST') {
    displayRecords.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } else if (sortType === 'LIKES') {
    displayRecords.sort((a, b) => (b.likes || 0) - (a.likes || 0));
  }

  // Calculate Reader Count Pill
  const readerCount = Math.max(1, (book.readersCount || allBookRecords.length || 1));
  const readerMsg = book.status === 'DONE' ? '완독을 완료했어요' : '함께 독서 중이에요';
  const status = book.status || 'WANT';
  const startDate = book.startDate || '2026-08-01';
  const finishDate = book.finishDate || '2026-08-10';

  // Description expand logic
  state.expandedDescs = state.expandedDescs || {};
  const fullDesc = book.description || (book.genre ? `『${book.title}』은(는) ${book.genre} 분야의 도서로, 독서 파트너들과 함께 깊이 읽고 빛나는 문장을 수집하기 좋은 추천 명작입니다.` : '독서 파트너들과 함께 문장을 기록하고 생각을 공유하기 좋은 추천 도서입니다.');
  const isExpanded = !!state.expandedDescs[book.id];
  let displayDesc = esc(fullDesc);
  let toggleBtnHtml = '';
  if (fullDesc.length > 120) {
    if (isExpanded) {
      displayDesc = esc(fullDesc);
      toggleBtnHtml = ` <button type="button" class="btn-toggle-desc text-stone-500 dark:text-stone-400 font-bold text-[11px] underline cursor-pointer">접기 ▲</button>`;
    } else {
      displayDesc = esc(fullDesc.substring(0, 120)) + '...';
      toggleBtnHtml = ` <button type="button" class="btn-toggle-desc text-stone-500 dark:text-stone-400 font-bold text-[11px] underline cursor-pointer">더보기 ▼</button>`;
    }
  }

  container.innerHTML = `
    <div class="space-y-3 font-sans max-w-4xl mx-auto w-full pt-3 sm:pt-4 pb-2">
      
      <!-- Detail Header Bar with Action & Options -->
      <div class="bg-transparent py-0.5 px-0 flex items-center justify-between gap-3 w-full border-none shadow-none mb-0">
        <button id="btn-back-detail" class="py-0.5 px-0 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer shrink-0" title="돌아가기">
          <span class="material-symbols-outlined text-xl">arrow_back</span>
          <span class="text-xs">돌아가기</span>
        </button>
        
        <!-- Right Action: 3-Dots Dropdown -->
        <div class="relative shrink-0">
            <button id="btn-book-options" class="p-1 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 rounded-lg cursor-pointer flex items-center justify-center" title="옵션 메뉴">
              <span class="material-symbols-outlined text-xl">more_vert</span>
            </button>

            <div id="book-options-menu" class="hidden absolute right-0 top-full mt-1.5 w-36 bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 rounded-xl shadow-xl py-1 text-xs text-stone-700 dark:text-stone-200 z-50">
              <button id="btn-share-book" class="w-full px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-700/60 flex items-center gap-2 font-medium cursor-pointer">
                <span class="material-symbols-outlined text-sm text-stone-400">share</span>
                <span>공유하기</span>
              </button>
              <button id="btn-edit-book" class="w-full px-3 py-2 text-left hover:bg-stone-100 dark:hover:bg-stone-700/60 flex items-center gap-2 font-medium cursor-pointer">
                <span class="material-symbols-outlined text-sm text-stone-400">edit</span>
                <span>책 수정</span>
              </button>
              <div class="my-1 border-t border-stone-100 dark:border-stone-700/60"></div>
              <button id="btn-delete-book" class="w-full px-3 py-2 text-left hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 font-medium cursor-pointer">
                <span class="material-symbols-outlined text-sm text-rose-500">delete</span>
                <span>도서 삭제</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Side-by-Side Book Info Header Card (Foreground Layer) -->
      <div class="book-detail-info-card bg-transparent p-0 pt-0.5 rounded-2xl border-none shadow-none flex flex-col sm:flex-row gap-5 items-start">
        
        <!-- Left Side: Book Cover (Enlarged for Prominent Presence) -->
        <div class="book-cover detail flex-shrink-0 w-32 h-48 sm:w-36 sm:h-52 overflow-hidden rounded-xl shadow-lg bg-stone-100 border border-stone-200 dark:border-stone-800">
          <img src="${book.thumbnail || DEFAULT_BOOK_COVER}" alt="${esc(book.title)}" onerror="this.onerror=null; this.src='${DEFAULT_BOOK_COVER}';" class="w-full h-full object-cover" />
        </div>

        <!-- Right Side: Title, Meta, Reader Count Pill, Star Rating, Brief Info & Status Chips -->
        <div class="flex-1 min-w-0 space-y-2.5 w-full text-left">
          
          <!-- 1. Title -->
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-serif font-bold text-xl text-stone-900 dark:text-stone-100 leading-snug">${esc(book.title)}</span>
          </div>

          <!-- 2. Author · Publisher · Genre -->
          <div class="text-xs text-stone-500 dark:text-stone-400 font-sans">
            ${esc(book.author || '저자 미상')} · ${esc(book.publisher || '출판사 미상')} · ${esc(book.genre || '소설/문학')}
          </div>

          <!-- 3. Reader Count Pill & Star Rating (Side by Side) -->
          <div class="flex items-center gap-2.5 flex-wrap pt-0.5">
            <span class="inline-flex items-center gap-1 text-[11.5px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
              <span>👥</span>
              <strong>${readerCount}명이</strong>
              <span>${readerMsg}</span>
            </span>

            <div class="flex items-center gap-1 text-xs font-bold text-amber-600 bg-stone-50 dark:bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-stone-700/80">
              <span class="text-amber-500">★</span>
              <span class="text-stone-900 dark:text-stone-100">${book.rating || '4.8'}</span>
            </div>
          </div>

          <!-- 4. Brief Book Description (Expandable 120 chars) -->
          <div class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-700/60 font-sans">
            <span>${displayDesc}</span>${toggleBtnHtml}
          </div>

          <!-- 5. Status Chips (보관함 / 읽는 중 / 완독) -->
          <div class="grid grid-cols-3 gap-2 pt-1">
            <button data-status="WANT" class="btn-change-status py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${status === 'WANT' ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700 hover:bg-stone-200'}">
              보관함
            </button>
            <button data-status="ACTIVE" class="btn-change-status py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${status === 'ACTIVE' ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700 hover:bg-stone-200'}">
              읽는 중
            </button>
            <button data-status="DONE" class="btn-change-status py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${status === 'DONE' ? 'bg-stone-800 text-white border-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:border-stone-100 shadow-sm' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700 hover:bg-stone-200'}">
              완독
            </button>
          </div>

        </div>
      </div>

      <!-- Reading Progress & Barcode Card (2px Border & Larger Page Edit Button) -->
      ${status !== 'NONE' ? `
        <div class="bg-white dark:bg-stone-900 p-4 sm:p-4.5 rounded-2xl border-2 border-stone-200 dark:border-stone-800 shadow-sm space-y-2.5 font-sans">
          
          <div class="flex items-center justify-between pb-2.5 border-b border-stone-100 dark:border-stone-800">
            <div class="flex items-center gap-2">
              <span class="text-xl">📖</span>
              <div class="flex flex-col text-left">
                <span class="text-[11px] font-bold text-stone-400 uppercase tracking-wider">독서 진행률</span>
                <span class="text-xl font-bold text-amber-700 dark:text-amber-400 leading-tight mt-0.5" id="detailPctText">${pct}%</span>
              </div>
            </div>

            <!-- Page Direct Input Button (Referenced from bookkeeper-main) -->
            <button id="openProgressModalBtn" class="px-3.5 py-1.5 bg-stone-50 dark:bg-stone-800 border-2 border-amber-600/60 dark:border-amber-400/60 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all flex items-center gap-2 shadow-xs" title="페이지 직접 입력">
              <div class="text-right leading-tight">
                <span id="detailPageBadge" class="font-bold text-amber-700 dark:text-amber-400 text-sm sm:text-base">${curPoint}p</span>
                <span class="text-stone-400 text-xs font-medium"> / ${totalPoint}p</span>
              </div>
              <span class="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-1 rounded-md border border-amber-200/50 dark:border-amber-800/50">✏️ 수정</span>
            </button>
          </div>

          ${barcodeHtml(book, allBookRecords, activeTab)}

          <div class="flex items-center justify-between text-[11.5px] text-stone-400 mt-0.5 pt-0 leading-tight">
            <span>시작: ${startDate} ${status === 'DONE' ? '· 완독: ' + finishDate : ''}</span>
            <span class="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">🖱️ 바코드 드래그 페이지 변경</span>
          </div>

        </div>
      ` : ''}

      <!-- Sub Navigation Tabs (MY vs COMMUNITY) -->
      <div class="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 grid grid-cols-2 gap-1 text-xs font-sans">
        <button data-detail-tab="MY" class="btn-detail-tab py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'MY' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400'}">
          📝 내 기록 (${myRecords.length})
        </button>
        <button data-detail-tab="COMMUNITY" class="btn-detail-tab py-2 rounded-lg font-bold transition-all cursor-pointer ${activeTab === 'COMMUNITY' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400'}">
          💬 커뮤니티 기록 (${commRecords.length})
        </button>
      </div>

      <!-- Filter Controls & Post List -->
      <div class="space-y-3 font-sans">
        
        <div class="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2">
          <div class="flex items-center gap-2">
            <button data-sort="LATEST" class="btn-sort-records text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${sortType === 'LATEST' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}">최신순</button>
            <button data-sort="LIKES" class="btn-sort-records text-xs px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${sortType === 'LIKES' ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'}">공감순</button>
          </div>

          <select id="detail-type-filter" class="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-200 font-bold focus:outline-none">
            <option value="ALL" ${typeFilter === 'ALL' ? 'selected' : ''}>전체 유형</option>
            <option value="QUOTE" ${typeFilter === 'QUOTE' ? 'selected' : ''}>✍️ 인용구</option>
            <option value="THOUGHT" ${typeFilter === 'THOUGHT' ? 'selected' : ''}>💭 내생각</option>
            <option value="QUESTION" ${typeFilter === 'QUESTION' ? 'selected' : ''}>❓ 의문점</option>
            <option value="SUMMARY" ${typeFilter === 'SUMMARY' ? 'selected' : ''}>📋 요약</option>
            <option value="REVIEW" ${typeFilter === 'REVIEW' ? 'selected' : ''}>⭐ 리뷰</option>
          </select>
        </div>

        <div class="space-y-3">
          ${displayRecords.length === 0 ? `
            <div class="text-center py-10 bg-transparent border-none shadow-none">
              <span class="material-symbols-outlined text-3xl text-stone-300 dark:text-stone-700 mb-1">edit_note</span>
              <p class="text-xs text-stone-400 dark:text-stone-500 font-bold">등록된 기록이 없습니다.</p>
            </div>
          ` : displayRecords.map(r => renderDetailRecordCard(r, book)).join('')}
        </div>

      </div>



      <!-- Floating Action Button (FAB) at Bottom-Right: '+' Button -->
      <button id="btn-add-book-record" class="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-12 h-12 sm:w-13 sm:h-13 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer border border-stone-700/30 dark:border-stone-300/30" title="새 문장 기록하기" aria-label="새 문장 기록하기">
        <span class="material-symbols-outlined text-2xl font-bold">add</span>
      </button>

    </div>
  `;

  // Bind Description Toggle Button (더보기 / 접기)
  container.querySelectorAll('.btn-toggle-desc').forEach(btn => {
    btn.onclick = () => {
      state.expandedDescs[book.id] = !state.expandedDescs[book.id];
      renderBookDetailPage(container, book.id);
    };
  });

  // Bind Page Direct Input Button (openProgressModalBtn / ✏️ 수정) -> Original bookkeeper-main Progress Modal
  container.querySelector('#openProgressModalBtn')?.addEventListener('click', () => {
    renderProgressModal(book, container);
  });

  // Bind Back Button
  container.querySelector('#btn-back-detail')?.addEventListener('click', () => {
    removeDetailBackdrop();
    setState({ activeBookId: null, tab: 'library' });
  });

  // Options Menu Dropdown
  const optionsBtn = container.querySelector('#btn-book-options');
  const optionsMenu = container.querySelector('#book-options-menu');

  optionsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    optionsMenu?.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (optionsMenu && !optionsMenu.classList.contains('hidden') && !optionsMenu.contains(e.target) && !optionsBtn?.contains(e.target)) {
      optionsMenu.classList.add('hidden');
    }
  });

  container.querySelector('#btn-edit-book')?.addEventListener('click', () => {
    optionsMenu?.classList.add('hidden');
    renderEditBookModal(book, container);
  });

  container.querySelector('#btn-delete-book')?.addEventListener('click', () => {
    optionsMenu?.classList.add('hidden');
    if (confirm(`"${book.title}" 도서를 내 서재에서 삭제하시겠습니까?\n이 책과 연결된 나의 수집 문장 기록도 함께 제거됩니다.`)) {
      updateDB(data => {
        data.books = data.books.filter(b => b.id !== book.id);
        data.records = data.records.filter(r => r.bookId !== book.id && r.bookTitle !== book.title);
      });
      alert('도서가 서재에서 삭제되었습니다.');
      setState({ activeBookId: null, tab: 'library' });
    }
  });

  container.querySelector('#btn-share-book')?.addEventListener('click', () => {
    optionsMenu?.classList.add('hidden');
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: `[문장수집가 2nd] ${book.title} (${book.author}) - 함께 읽기`,
        url: window.location.href
      }).catch(() => {});
    } else {
      alert(`"${book.title}" 도서 공유 정보가 준비되었습니다.`);
    }
  });

  // Status Chips Click (보관함: 0% / 읽는 중: 현재/복원 페이지 / 완독: 100% 자동 연동)
  container.querySelectorAll('.btn-change-status').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const newStatus = e.currentTarget.dataset.status;
      updateDB(data => {
        const b = data.books.find(item => item.id === book.id);
        if (b) {
          b.status = newStatus;
          const totalP = b.totalPage || 300;
          if (newStatus === 'WANT') {
            b.curPage = 0;
          } else if (newStatus === 'DONE') {
            b.curPage = totalP;
          } else if (newStatus === 'ACTIVE') {
            if (!b.curPage || b.curPage === 0 || b.curPage >= totalP) {
              b.curPage = Math.max(1, Math.floor(totalP * 0.1));
            }
          }
        }
      });
      renderBookDetailPage(container, book.id);
    });
  });

  // Sub Navigation Tabs (MY vs COMMUNITY)
  container.querySelectorAll('.btn-detail-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.detailTab;
      setState({ detailTab: tab });
    });
  });

  // Sort buttons
  container.querySelectorAll('.btn-sort-records').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sort = e.currentTarget.dataset.sort;
      setState({ myPostSort: sort });
    });
  });

  // Filter Type Selector
  container.querySelector('#detail-type-filter')?.addEventListener('change', (e) => {
    setState({ myPostTypeFilter: e.target.value });
  });

  // Add Record Button
  container.querySelector('#btn-add-book-record')?.addEventListener('click', () => {
    setState({ modal: { type: 'ADD_RECORD', defaultBookId: book.id } });
  });

  // Interactive Barcode Touch & Drag
  attachBarcodeDragEvents(container, book, allBookRecords);
}

function renderDetailRecordCard(item, book) {
  const isSpoiled = item.spoil && (item.page > book.curPage);

  return `
    <div id="post-card-${item.id}" class="bg-white dark:bg-stone-900 p-4 sm:p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-2.5 relative overflow-hidden transition-all font-sans">
      <div class="flex items-center justify-between text-xs pb-2 border-b border-stone-100 dark:border-stone-800">
        <span class="font-bold px-2.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-lg">p.${item.page}</span>
        <span class="text-stone-400 text-[11px]">${formatRelativeTime(item.createdAt)}</span>
      </div>

      ${isSpoiled ? `
        <div class="bg-stone-100 dark:bg-stone-800 rounded-xl p-4 text-center my-1 border border-stone-200 dark:border-stone-700">
          <span class="material-symbols-outlined text-stone-700 dark:text-stone-300 text-xl mb-0.5">visibility_off</span>
          <p class="font-bold text-stone-900 dark:text-stone-100 text-xs">스포일러 방지 블라인드</p>
          <p class="text-[11px] text-stone-500 dark:text-stone-400">현재 독서 위치(p.${book.curPage})보다 뒤의 기록입니다.</p>
        </div>
      ` : `
        <blockquote class="font-serif text-stone-900 dark:text-stone-100 text-sm leading-relaxed border-l-2 border-stone-900 dark:border-stone-100 pl-3.5 py-0.5 my-1.5">
          “${esc(item.quote)}”
        </blockquote>
        ${item.thought ? `
          <div class="text-xs text-stone-700 dark:text-stone-300 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl font-sans leading-normal border border-stone-100 dark:border-stone-800">
            <span class="font-bold text-stone-900 dark:text-stone-100 block mb-0.5">💭 감상</span>
            <span>${esc(item.thought)}</span>
          </div>
        ` : ''}
      `}
    </div>
  `;
}

function renderProgressModal(book, container) {
  document.querySelector('#modal-progress-overlay')?.remove();

  const totalPoint = book.totalPage || 1;
  let curPoint = Math.min(book.curPage || 0, totalPoint);
  let pct = Math.min(Math.round((curPoint / totalPoint) * 100), 100);

  const modalHtml = `
    <div id="modal-progress-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 text-left">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">📖</span>
            <h3 class="font-bold text-base text-stone-900 dark:text-stone-100">독서 진행률 설정</h3>
          </div>
          <button id="modalProgressClose" class="p-1 text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 rounded-lg cursor-pointer">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <!-- Book Title Header -->
        <div class="text-xs font-bold text-stone-500 dark:text-stone-400 text-center truncate">
          ${esc(book.title)}
        </div>

        <!-- Modern Progress Card (Direct Number Input + Total + Percentage Badge) -->
        <div class="bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-xl p-4 text-center shadow-2xs">
          <div class="flex items-baseline justify-center gap-1.5">
            <input type="number" id="modalPageInput" value="${curPoint}" min="0" max="${totalPoint}" 
                   class="text-3xl font-extrabold font-serif text-stone-900 dark:text-stone-100 w-24 text-right bg-transparent outline-none p-0 border-b border-stone-300 dark:border-stone-600 focus:border-stone-900 dark:focus:border-stone-100 transition-colors">
            <span class="text-lg font-bold text-stone-700 dark:text-stone-300">p</span>
            <span class="text-xs font-bold text-stone-400 ml-1">/ ${totalPoint}p</span>
            <span id="modalPctBadge" class="text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/70 px-2 py-0.5 rounded-md ml-2">${pct}%</span>
          </div>
        </div>

        <!-- Slider Range Control -->
        <div class="space-y-1">
          <input type="range" id="modalRangeInput" min="0" max="${totalPoint}" value="${curPoint}" 
                 class="w-full h-2 accent-stone-900 dark:accent-stone-100 cursor-pointer">
        </div>

        <!-- Quick Add (+1p / +5p / +10p / +20p) Buttons -->
        <div class="grid grid-cols-4 gap-2 pt-1">
          <button id="quickAdd1" class="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200/60 dark:border-stone-700/60 cursor-pointer transition-all">+1p</button>
          <button id="quickAdd5" class="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200/60 dark:border-stone-700/60 cursor-pointer transition-all">+5p</button>
          <button id="quickAdd10" class="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200/60 dark:border-stone-700/60 cursor-pointer transition-all">+10p</button>
          <button id="quickAdd20" class="py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-xs rounded-xl border border-stone-200/60 dark:border-stone-700/60 cursor-pointer transition-all">+20p</button>
        </div>

        <!-- Confirm Save Button -->
        <div class="pt-2">
          <button id="saveProgressBtn" class="w-full py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer">
            확인 및 저장
          </button>
        </div>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.querySelector('#modal-progress-overlay');
  const modalPageInput = modalEl.querySelector('#modalPageInput');
  const modalRangeInput = modalEl.querySelector('#modalRangeInput');
  const modalPctBadge = modalEl.querySelector('#modalPctBadge');

  function updateModalUI(val) {
    let pVal = parseInt(val, 10);
    if (isNaN(pVal)) pVal = 0;
    pVal = Math.max(0, Math.min(totalPoint, pVal));
    modalPageInput.value = pVal;
    modalRangeInput.value = pVal;
    const calcPct = Math.min(Math.round((pVal / totalPoint) * 100), 100);
    if (modalPctBadge) modalPctBadge.textContent = `${calcPct}%`;
  }

  modalPageInput.oninput = (e) => updateModalUI(e.target.value);
  modalRangeInput.oninput = (e) => updateModalUI(e.target.value);

  modalEl.querySelector('#quickAdd1').onclick = () => updateModalUI(+modalPageInput.value + 1);
  modalEl.querySelector('#quickAdd5').onclick = () => updateModalUI(+modalPageInput.value + 5);
  modalEl.querySelector('#quickAdd10').onclick = () => updateModalUI(+modalPageInput.value + 10);
  modalEl.querySelector('#quickAdd20').onclick = () => updateModalUI(+modalPageInput.value + 20);

  modalEl.querySelector('#modalProgressClose').onclick = () => modalEl.remove();

  modalEl.querySelector('#saveProgressBtn').onclick = () => {
    const finalPoint = Math.max(0, Math.min(totalPoint, parseInt(modalPageInput.value, 10) || 0));
    updateDB(data => {
      const b = data.books.find(item => item.id === book.id);
      if (b) {
        b.curPage = finalPoint;
        if (finalPoint >= totalPoint) {
          b.status = 'DONE';
        } else if (finalPoint > 0) {
          b.status = 'ACTIVE';
        }
      }
    });
    modalEl.remove();
    renderBookDetailPage(container, book.id);
  };
}

function renderEditBookModal(book, container) {
  document.querySelector('#modal-edit-book-overlay')?.remove();

  const modalHtml = `
    <div id="modal-edit-book-overlay" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in font-sans">
      <div class="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 text-left">
        
        <div class="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <h3 class="font-serif font-bold text-base sm:text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <span class="material-symbols-outlined text-amber-600">edit_note</span>
            <span>도서 정보 상세 편집</span>
          </h3>
          <button id="btn-close-edit-modal" type="button" class="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1 cursor-pointer">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form id="form-edit-book" class="space-y-3 text-xs">
          
          <!-- Title -->
          <div class="space-y-1">
            <label class="font-bold text-stone-700 dark:text-stone-300">도서 제목 *</label>
            <input type="text" id="edit-book-title" value="${esc(book.title)}" required class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 font-medium" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Author -->
            <div class="space-y-1">
              <label class="font-bold text-stone-700 dark:text-stone-300">저자</label>
              <input type="text" id="edit-book-author" value="${esc(book.author || '')}" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600" />
            </div>

            <!-- Publisher -->
            <div class="space-y-1">
              <label class="font-bold text-stone-700 dark:text-stone-300">출판사</label>
              <input type="text" id="edit-book-publisher" value="${esc(book.publisher || '')}" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <!-- Genre -->
            <div class="space-y-1">
              <label class="font-bold text-stone-700 dark:text-stone-300">장르</label>
              <input type="text" id="edit-book-genre" value="${esc(book.genre || '문학')}" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600" />
            </div>

            <!-- Total Page -->
            <div class="space-y-1">
              <label class="font-bold text-stone-700 dark:text-stone-300">총 페이지 수</label>
              <input type="number" id="edit-book-totalpage" value="${book.totalPage || 300}" min="1" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 font-mono" />
            </div>
          </div>

          <!-- Thumbnail Cover Image URL -->
          <div class="space-y-1">
            <label class="font-bold text-stone-700 dark:text-stone-300">표지 이미지 URL (Web Link)</label>
            <input type="url" id="edit-book-thumbnail" value="${esc(book.thumbnail || '')}" placeholder="https://..." class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 font-mono" />
          </div>

          <!-- Description -->
          <div class="space-y-1">
            <label class="font-bold text-stone-700 dark:text-stone-300">도서 소개글</label>
            <textarea id="edit-book-description" rows="3" class="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-600 leading-relaxed">${esc(book.description || '')}</textarea>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
            <button type="button" id="btn-cancel-edit-book" class="px-4 py-2 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded-xl font-bold cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700">
              취소
            </button>
            <button type="submit" class="px-5 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold cursor-pointer hover:bg-amber-800 dark:hover:bg-amber-400 shadow-sm">
              💾 저장하기
            </button>
          </div>
        </form>

      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modalEl = document.querySelector('#modal-edit-book-overlay');
  const closeBtn = modalEl.querySelector('#btn-close-edit-modal');
  const cancelBtn = modalEl.querySelector('#btn-cancel-edit-book');
  const formEl = modalEl.querySelector('#form-edit-book');

  const closeModal = () => modalEl.remove();

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  formEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    const titleVal = modalEl.querySelector('#edit-book-title').value.trim();
    if (!titleVal) {
      alert('도서 제목을 입력해 주세요.');
      return;
    }

    const authorVal = modalEl.querySelector('#edit-book-author').value.trim();
    const publisherVal = modalEl.querySelector('#edit-book-publisher').value.trim();
    const genreVal = modalEl.querySelector('#edit-book-genre').value.trim();
    const totalPageVal = parseInt(modalEl.querySelector('#edit-book-totalpage').value, 10) || 1;
    const thumbnailVal = modalEl.querySelector('#edit-book-thumbnail').value.trim();
    const descVal = modalEl.querySelector('#edit-book-description').value.trim();

    updateDB(data => {
      const b = data.books.find(item => item.id === book.id);
      if (b) {
        b.title = titleVal;
        b.author = authorVal;
        b.publisher = publisherVal;
        b.genre = genreVal;
        b.totalPage = totalPageVal;
        if (b.curPage > totalPageVal) b.curPage = totalPageVal;
        b.thumbnail = thumbnailVal;
        b.description = descVal;
      }
    });

    closeModal();
    renderBookDetailPage(container, book.id);
  });
}
