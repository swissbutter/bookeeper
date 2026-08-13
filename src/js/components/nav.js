/**
 * Navigation Component System (Mobile Bottom Nav + Desktop Left Sidebar)
 * Solemn & Editorial Deep Ink Theme (5px Radius)
 */
import { state, setState } from '../state.js';

export function renderHeader() {
  const header = document.getElementById('top-header');
  if (!header) return;

  const titles = {
    feed: '오늘의 문장',
    library: '내 서재',
    typing: '필사 노트',
    my: '프로필',
    admin: '관리자 센터'
  };

  header.innerHTML = `
    <div class="flex items-center gap-2.5">
      <span class="material-symbols-outlined text-stone-900 dark:text-stone-100 text-2xl md:hidden">auto_stories</span>
      <h1 class="text-base sm:text-lg font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight">${titles[state.tab] || '문장수집가'}</h1>
    </div>

    <div class="flex items-center gap-1.5">
      <button id="btn-open-admin" class="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer" title="관리자 센터 대시보드">
        <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
      </button>
      <button id="btn-toggle-theme" class="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer" title="테마 변경">
        <span class="material-symbols-outlined text-xl">${state.theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  `;
}

export function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  const tabs = [
    { id: 'feed', label: '오늘의 문장', icon: 'explore' },
    { id: 'library', label: '내 서재', icon: 'collections_bookmark' },
    { id: 'typing', label: '필사 노트', icon: 'keyboard' },
    { id: 'my', label: '프로필', icon: 'person' }
  ];

  nav.innerHTML = tabs.map(tab => {
    const isActive = state.tab === tab.id;
    const activeClass = isActive ? 'text-stone-950 font-bold scale-105 bg-stone-100' : 'text-stone-400 hover:text-stone-600';
    return `
      <button data-tab="${tab.id}" class="nav-tab-item flex flex-col items-center justify-center py-1.5 px-3 rounded-5px transition-all cursor-pointer ${activeClass}">
        <span class="material-symbols-outlined text-2xl mb-0.5">${tab.icon}</span>
        <span class="text-xs font-sans tracking-tight">${tab.label}</span>
      </button>
    `;
  }).join('');
}

export function renderDesktopSidebar() {
  const sidebar = document.getElementById('desktop-sidebar');
  if (!sidebar) return;

  const tabs = [
    { id: 'feed', label: '오늘의 문장', icon: 'explore', desc: '빛나는 문장 탐색' },
    { id: 'library', label: '내 서재', icon: 'collections_bookmark', desc: '독서 상태 및 진행률' },
    { id: 'typing', label: '필사 노트', icon: 'keyboard', desc: '몰입 필사 스튜디오' },
    { id: 'my', label: '프로필', icon: 'person', desc: '내 활동 및 독서 통계' }
  ];

  sidebar.innerHTML = `
    <!-- Sidebar Header Brand -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-stone-200/70 dark:border-stone-800 pb-5">
        <div class="w-10 h-10 bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 rounded-xl flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 shadow-xs">
          <span class="material-symbols-outlined text-2xl">auto_stories</span>
        </div>
        <div>
          <h1 class="font-serif font-bold text-base text-stone-900 dark:text-stone-100 tracking-tight">문장수집가</h1>
          <span class="text-[10px] text-stone-400 dark:text-stone-500 tracking-wider uppercase font-sans font-bold">2nd Edition</span>
        </div>
      </div>

      <!-- Sidebar Navigation Menu -->
      <nav class="space-y-1.5 pt-1">
        ${tabs.map(tab => {
          const isActive = state.tab === tab.id;
          const activeClass = isActive 
            ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-950 dark:text-stone-100 font-bold border border-stone-300/70 dark:border-stone-700/80 shadow-xs' 
            : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100/70 dark:hover:bg-stone-800/40 border border-transparent';
          return `
            <button data-tab="${tab.id}" class="w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left relative ${activeClass}">
              <span class="material-symbols-outlined text-xl ${isActive ? 'text-amber-800 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500'}">${tab.icon}</span>
              <div>
                <div class="text-xs tracking-tight">${tab.label}</div>
                <div class="text-[10px] ${isActive ? 'text-stone-600 dark:text-stone-300 font-medium' : 'text-stone-400 dark:text-stone-500 font-normal'}">${tab.desc}</div>
              </div>
            </button>
          `;
        }).join('')}
      </nav>
    </div>

    <!-- Sidebar Footer -->
    <div class="pt-5 border-t border-stone-200/70 dark:border-stone-800 space-y-2 text-xs">
      <div class="text-[11px] text-stone-400 dark:text-stone-500 text-center font-sans font-medium">
        © 2026 문장수집가 2nd
      </div>
    </div>
  `;
}
