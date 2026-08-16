/**
 * Admin Management Center Component (관리자 센터)
 * Modeled after bookkeeper-main/admin.html
 */
import { state, setState, db, updateDB } from '../state.js';
import { formatRelativeTime } from '../utils/dateUtils.js';

export function renderAdminPage(container) {
  const books = db.books || [];
  const records = db.records || [];
  const notes = db.typingNotes || [];
  const reports = db.reports || [];
  const users = db.users || [
    { id: 'u1', name: '김독서', email: 'reader1@example.com', role: '마스터 수집가', status: 'ACTIVE', joinedAt: '2026-01-15' },
    { id: 'u2', name: '박필사', email: 'writer2@example.com', role: '열혈 독서가', status: 'ACTIVE', joinedAt: '2026-03-10' },
    { id: 'u3', name: '이문장', email: 'collector3@example.com', role: '일반 회원', status: 'BLOCKED', joinedAt: '2026-05-20' }
  ];

  const adminSubTab = state.adminSubTab || 'DASHBOARD';

  container.innerHTML = `
    <div class="space-y-5 font-sans text-left">
      
      <!-- Admin Top Banner Header -->
      <div class="bg-stone-900 dark:bg-stone-800 text-stone-100 p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-md uppercase tracking-wider">Master Console</span>
            <span class="text-xs text-stone-400 font-mono">v2.0 Sync Live</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-bold font-serif text-white tracking-tight flex items-center gap-2">
            <span>👑 문장수집가 관리자 센터</span>
          </h2>
          <p class="text-xs text-stone-400">도서 정보 수정/삭제, 신고 모니터링, 회원 상태 관리 및 시스템 감사 로그</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button id="btn-admin-export-db" class="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">download</span>
            <span>DB 백업</span>
          </button>
          <button id="btn-admin-return-app" class="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            <span>서재로 돌아가기</span>
          </button>
        </div>
      </div>

      <!-- Admin Sub Navigation Tabs (Segmented Control Match) -->
      <div class="bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1 text-xs font-sans w-full shadow-xs overflow-x-auto">
        <button data-admin-tab="DASHBOARD" class="btn-admin-nav flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${adminSubTab === 'DASHBOARD' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          📊 대시보드
        </button>
        <button data-admin-tab="BOOKS" class="btn-admin-nav flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${adminSubTab === 'BOOKS' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          📚 도서 관리 (${books.length})
        </button>
        <button data-admin-tab="REPORTS" class="btn-admin-nav flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${adminSubTab === 'REPORTS' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          🚨 신고 모니터링 (${reports.length})
        </button>
        <button data-admin-tab="USERS" class="btn-admin-nav flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${adminSubTab === 'USERS' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          👥 회원 관리 (${users.length})
        </button>
        <button data-admin-tab="RECORDS" class="btn-admin-nav flex-1 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${adminSubTab === 'RECORDS' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'}">
          ✍️ 문장 기록 (${records.length})
        </button>
      </div>

      <!-- Main Section Content Area -->
      <div id="admin-section-content" class="space-y-4">
        ${renderAdminSubSection(adminSubTab, { books, records, notes, reports, users })}
      </div>

    </div>
  `;

  // Attach Event Handlers
  container.querySelectorAll('.btn-admin-nav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.adminTab;
      setState({ adminSubTab: tab });
    });
  });

  container.querySelector('#btn-admin-return-app')?.addEventListener('click', () => {
    setState({ tab: 'library', activeBookId: null });
  });

  container.querySelector('#btn-admin-export-db')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `bookkeeper_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  attachAdminActionEvents(container);
}

function renderAdminSubSection(tab, data) {
  const { books, records, notes, reports, users } = data;

  if (tab === 'DASHBOARD') {
    return `
      <!-- Stats 4-Grid Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div class="text-xs text-stone-400 font-medium">등록 도서 총계</div>
          <div class="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">${books.length}권</div>
          <div class="text-[10px] text-emerald-600 font-bold">정상 가동 중</div>
        </div>

        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div class="text-xs text-stone-400 font-medium">수집 문장 총계</div>
          <div class="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">${records.length}개</div>
          <div class="text-[10px] text-amber-600 font-bold">활발한 참여</div>
        </div>

        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div class="text-xs text-stone-400 font-medium">완성 필사 노선</div>
          <div class="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">${notes.length}회</div>
          <div class="text-[10px] text-indigo-600 font-bold">누적 타이핑</div>
        </div>

        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-1">
          <div class="text-xs text-stone-400 font-medium">신고 누적 접수</div>
          <div class="text-2xl font-bold font-serif text-rose-600 dark:text-rose-400">${reports.length}건</div>
          <div class="text-[10px] ${reports.length > 0 ? 'text-rose-500 font-bold' : 'text-stone-400'}">${reports.length > 0 ? '조치 필요' : '클린 상태'}</div>
        </div>
      </div>

      <!-- Quick Recent Books & Activity Logs -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Recent Books -->
        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
          <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>📚 최근 등록된 도서</span>
            <span class="text-xs text-stone-400">Total ${books.length}</span>
          </h3>
          <div class="space-y-2">
            ${books.slice(0, 5).map(b => `
              <div class="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-xs">
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-stone-900 dark:text-stone-100 truncate">${b.title}</div>
                  <div class="text-stone-400 text-[11px]">${b.author} · ${b.publisher}</div>
                </div>
                <span class="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-md font-bold text-[10px]">${b.status || 'WANT'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Recent Records -->
        <div class="bg-white dark:bg-stone-900 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-3">
          <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center justify-between">
            <span>✍️ 최근 수집된 문장</span>
            <span class="text-xs text-stone-400">Total ${records.length}</span>
          </h3>
          <div class="space-y-2">
            ${records.slice(0, 5).map(r => `
              <div class="p-2.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl text-xs space-y-1">
                <div class="flex items-center justify-between font-bold text-stone-900 dark:text-stone-100">
                  <span class="truncate">${r.bookTitle} (p.${r.page})</span>
                  <span class="text-[10px] text-amber-600 font-bold">♥ ${r.likes || 0}</span>
                </div>
                <p class="font-serif text-stone-600 dark:text-stone-300 line-clamp-1">"${r.quote}"</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  if (tab === 'BOOKS') {
    return `
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100">도서 정보 관리 및 편집</h3>
          <button id="btn-admin-add-book" class="px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-bold cursor-pointer">
            + 새 도서 등록
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold uppercase">
                <th class="py-2.5 px-3">도서명</th>
                <th class="py-2.5 px-3">저자 / 출판사</th>
                <th class="py-2.5 px-3">장르</th>
                <th class="py-2.5 px-3">진행 페이지</th>
                <th class="py-2.5 px-3">상태</th>
                <th class="py-2.5 px-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 dark:divide-stone-800/60">
              ${books.map(b => `
                <tr class="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                  <td class="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">${b.title}</td>
                  <td class="py-3 px-3 text-stone-500">${b.author} · ${b.publisher}</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 rounded font-bold">${b.genre || '문학'}</span></td>
                  <td class="py-3 px-3 font-mono">${b.curPage || 0} / ${b.totalPage || 1}p</td>
                  <td class="py-3 px-3 font-bold text-amber-700 dark:text-amber-400">${b.status || 'WANT'}</td>
                  <td class="py-3 px-3 text-right">
                    <button data-delete-book-id="${b.id}" class="btn-admin-delete-book text-rose-600 hover:text-rose-800 font-bold text-xs cursor-pointer">삭제</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'REPORTS') {
    return `
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100">신고 모니터링 센터</h3>
        ${reports.length === 0 ? `
          <div class="text-center py-12 text-stone-400 text-xs">
            <span class="material-symbols-outlined text-3xl mb-1 text-emerald-500">verified</span>
            <p class="font-bold text-stone-600 dark:text-stone-300">신고 처리 대기 항목이 없습니다.</p>
            <p class="mt-0.5">클린 문장수집가 커뮤니티가 유지되고 있습니다.</p>
          </div>
        ` : `
          <div class="space-y-3">
            ${reports.map(rep => `
              <div class="p-4 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-start justify-between gap-3 text-xs">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-md">신고 사유: ${rep.reason || '부적절한 내용'}</span>
                    <span class="text-stone-400">${formatRelativeTime(rep.createdAt)}</span>
                  </div>
                  <p class="font-serif text-stone-800 dark:text-stone-200">"${rep.quoteText}"</p>
                </div>
                <button data-clear-report-id="${rep.id}" class="btn-admin-clear-report px-3 py-1.5 bg-emerald-700 text-white rounded-lg font-bold cursor-pointer shrink-0">
                  신고 해제
                </button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }

  if (tab === 'USERS') {
    return `
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100">회원 계급 & 차단 관리</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-stone-200 dark:border-stone-800 text-stone-400 font-bold uppercase">
                <th class="py-2.5 px-3">회원명</th>
                <th class="py-2.5 px-3">이메일</th>
                <th class="py-2.5 px-3">계급</th>
                <th class="py-2.5 px-3">가입일</th>
                <th class="py-2.5 px-3">상태</th>
                <th class="py-2.5 px-3 text-right">제재 토글</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-stone-100 dark:divide-stone-800/60">
              ${users.map(u => `
                <tr class="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                  <td class="py-3 px-3 font-bold text-stone-900 dark:text-stone-100">${u.name}</td>
                  <td class="py-3 px-3 text-stone-500 font-mono">${u.email}</td>
                  <td class="py-3 px-3"><span class="px-2 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold rounded">${u.role}</span></td>
                  <td class="py-3 px-3 text-stone-400">${u.joinedAt}</td>
                  <td class="py-3 px-3 font-bold ${u.status === 'BLOCKED' ? 'text-rose-600' : 'text-emerald-600'}">${u.status}</td>
                  <td class="py-3 px-3 text-right">
                    <button data-user-id="${u.id}" class="btn-admin-toggle-user text-indigo-600 font-bold hover:underline cursor-pointer">
                      ${u.status === 'BLOCKED' ? '차단 해제' : '차단하기'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'RECORDS') {
    return `
      <div class="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <h3 class="font-bold text-sm text-stone-900 dark:text-stone-100">전체 문장 기록 전수 관리</h3>
        <div class="space-y-3">
          ${records.map(r => `
            <div class="p-3.5 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/60 dark:border-stone-700/60 flex items-start justify-between gap-3 text-xs">
              <div class="space-y-1 min-w-0 flex-1">
                <div class="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                  <span class="truncate">${r.bookTitle} (p.${r.page})</span>
                  <span class="text-[10px] text-stone-400 font-normal">· ${formatRelativeTime(r.createdAt)}</span>
                </div>
                <blockquote class="font-serif text-stone-700 dark:text-stone-300 line-clamp-2">"${r.quote}"</blockquote>
              </div>
              <button data-delete-record-id="${r.id}" class="btn-admin-delete-record text-rose-600 font-bold hover:underline cursor-pointer shrink-0">
                삭제
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return '';
}

function attachAdminActionEvents(container) {
  // Delete Book
  container.querySelectorAll('.btn-admin-delete-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteBookId;
      if (confirm('정말로 이 도서를 삭제하시겠습니까? 관련 수집 문장도 삭제됩니다.')) {
        updateDB(data => {
          data.books = (data.books || []).filter(b => b.id !== id);
        });
      }
    });
  });

  // Delete Record
  container.querySelectorAll('.btn-admin-delete-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.deleteRecordId;
      if (confirm('해당 문장 기록을 삭제하시겠습니까?')) {
        updateDB(data => {
          data.records = (data.records || []).filter(r => r.id !== id);
        });
      }
    });
  });

  // Add Book
  container.querySelector('#btn-admin-add-book')?.addEventListener('click', () => {
    setState({ modal: { type: 'SEARCH' } });
  });
}
