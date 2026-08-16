/**
 * Main Entry Point for 2nd Edition
 * Initializes App, Subscribes to Reactive State, Renders Views & Overlays
 */
import { state, setState, subscribe } from './state.js';
import { renderHeader, renderBottomNav, renderDesktopSidebar } from './components/nav.js';
import { renderFeed } from './components/feed.js';
import { renderLibrary } from './components/library.js';
import { renderTypingStudio } from './components/typingStudio.js';
import { renderCardStudioOverlay } from './components/cardStudio.js';
import { renderBookDetailPage } from './components/bookDetail.js';
import { renderMyPage } from './components/myPage.js';
import { renderAdminPage } from './components/admin.js';
import { renderModalContainer } from './components/modal.js';

function initApp() {
  // Global Render Controller
  const render = () => {
    // 1. Top Header, Bottom Nav & Desktop Sidebar
    renderHeader();
    renderBottomNav();
    renderDesktopSidebar();

    // Ensure any leftover backdrop is removed
    document.getElementById('detail-bg-fixed-layer')?.remove();

    // 2. Main View Container Routing
    const mainView = document.getElementById('main-view');
    if (mainView) {
      if (state.tab === 'feed') {
        renderFeed(mainView);
      } else if (state.tab === 'library') {
        if (state.activeBookId) {
          renderBookDetailPage(mainView, state.activeBookId);
        } else {
          renderLibrary(mainView);
        }
      } else if (state.tab === 'typing') {
        renderTypingStudio(mainView);
      } else if (state.tab === 'my') {
        renderMyPage(mainView);
      } else if (state.tab === 'admin') {
        renderAdminPage(mainView);
      }
    }

    // 3. Fullscreen Overlay Stack
    const overlayContainer = document.getElementById('overlay-container');
    if (overlayContainer) {
      if (state.overlayStack.length > 0) {
        overlayContainer.classList.remove('pointer-events-none');
        const activeOverlay = state.overlayStack[state.overlayStack.length - 1];
        
        if (activeOverlay.type === 'CARD_STUDIO') {
          renderCardStudioOverlay(overlayContainer, activeOverlay.data);
        }
      } else {
        overlayContainer.classList.add('pointer-events-none');
        overlayContainer.innerHTML = '';
      }
    }

    // 4. Modal Container
    renderModalContainer();
  };

  // Subscribe to state updates
  subscribe(() => {
    render();
  });

  // Global Event Delegation for Nav Tabs & Headers
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const tabId = tabBtn.dataset.tab;
      if (tabId === 'library') {
        setState({ tab: 'library', activeBookId: null });
      } else {
        setState({ tab: tabId });
      }
    }

    // Top Header Theme Toggle
    const headerThemeBtn = e.target.closest('#btn-toggle-theme');
    if (headerThemeBtn) {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      setState({ theme: newTheme });
    }

    // Top Header Admin Dashboard Toggle
    const adminBtn = e.target.closest('#btn-open-admin');
    if (adminBtn) {
      setState({ tab: 'admin' });
    }

    // Book Detail Page Top Back Button
    const backDetailBtn = e.target.closest('#btn-back-detail');
    if (backDetailBtn) {
      setState({ tab: 'library', activeBookId: null });
    }

    // Floating Action Button (+) in Book Detail Page & App
    const addBookRecordBtn = e.target.closest('#btn-add-book-record');
    if (addBookRecordBtn) {
      const bookId = addBookRecordBtn.dataset.bookId || state.activeBookId || '';
      setState({ modal: { type: 'ADD_RECORD', defaultBookId: bookId } });
    }
  });

  // Initial Render Execution
  render();
}

// Launch application on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
