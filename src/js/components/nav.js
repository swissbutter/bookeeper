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
    <div class="flex items-center gap-2">
      <div class="w-8 h-8 rounded-xl bg-amber-700/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/60 shadow-2xs">
        <span class="material-symbols-outlined text-lg">auto_stories</span>
      </div>
      <div>
        <h1 class="text-xs text-stone-400 dark:text-stone-500 font-sans font-medium">문장수집가 2nd</h1>
        <div class="text-sm font-bold font-serif text-stone-900 dark:text-stone-100 tracking-tight leading-none">${titles[state.tab] || '문장수집가'}</div>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <button id="btn-open-admin" class="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer" title="관리자 센터">
        <span class="material-symbols-outlined text-xl">admin_panel_settings</span>
      </button>
      <button id="btn-toggle-theme" class="p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer" title="테마 변경">
        <span class="material-symbols-outlined text-xl">${state.theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  `;

  header.querySelector('#btn-toggle-theme')?.addEventListener('click', () => {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.className = nextTheme;
    setState({ theme: nextTheme });
  });

  header.querySelector('#btn-open-admin')?.addEventListener('click', () => {
    setState({ tab: 'admin' });
  });
}

export function renderBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  const tabs = [
    { id: 'feed', label: '문장', icon: 'explore' },
    { id: 'library', label: '서재', icon: 'collections_bookmark' },
    { id: 'typing', label: '필사', icon: 'keyboard' },
    { id: 'my', label: '마이', icon: 'person' }
  ];

  nav.innerHTML = tabs.map(tab => {
    const isActive = state.tab === tab.id;
    const activeClass = isActive 
      ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold shadow-xs' 
      : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200';
    
    return `
      <button data-tab="${tab.id}" class="nav-tab-item flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 text-xs py-1.5 px-2 rounded-xl transition-all cursor-pointer ${activeClass}">
        <span class="material-symbols-outlined text-lg sm:text-xl">${tab.icon}</span>
        <span class="font-sans font-medium tracking-tight text-[11px] sm:text-xs">${tab.label}</span>
      </button>
    `;
  }).join('');

  nav.querySelectorAll('.nav-tab-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.dataset.tab;
      setState({ tab: tabId });
    });
  });
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

  sidebar.querySelectorAll('button[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.dataset.tab;
      setState({ tab: tabId });
    });
  });
}
