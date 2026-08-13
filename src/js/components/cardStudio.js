/**
 * 1:1 Quote Card Studio Component
 * HTML5 Canvas 600x600 SNS PNG Card Generator
 * Solemn & Editorial Deep Ink Palette Presets (5px Radius)
 */
import { state, setState } from '../state.js';

export function renderCardStudioOverlay(container, data) {
  const quote = data?.quote || '새는 알에서 나오기 위해 투쟁한다. 알은 세계이다.';
  const author = data?.author || '헤르만 헤세';
  const title = data?.title || '데미안';

  let currentBg = '#F5F4F0'; // Deep Antique Paper
  let currentTextColor = '#1C1917';
  let currentFont = 'Noto Serif KR';

  container.innerHTML = `
    <div class="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex flex-col pointer-events-auto animate-fade-in">
      
      <!-- Top Bar -->
      <div class="px-5 py-4 border-b border-stone-800 flex items-center justify-between text-white bg-stone-950">
        <h3 class="font-bold text-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-stone-300">style</span>
          <span>1:1 감성 인용구 카드 스튜디오</span>
        </h3>
        <button id="btn-close-studio" class="p-1 text-stone-400 hover:text-white rounded-5px">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <!-- Main Studio Work Area (Side-by-Side on Desktop) -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
        
        <!-- Canvas Preview Box -->
        <div class="canvas-preview-wrapper shadow-2xl rounded-5px overflow-hidden border border-stone-700 max-w-[420px] md:max-w-[480px]">
          <canvas id="card-canvas" width="600" height="600"></canvas>
        </div>

        <!-- Customization Controls -->
        <div class="w-full max-w-md bg-stone-900 p-5 rounded-5px border border-stone-800 space-y-5 text-white shadow-xl">
          
          <!-- Background Theme Color -->
          <div>
            <label class="block text-xs font-bold text-stone-400 mb-2">종이 배경 톤 (진중한 문학 팔레트)</label>
            <div class="flex items-center gap-3">
              <button data-bg="#F5F4F0" data-text="#1C1917" class="btn-theme-preset w-8 h-8 rounded-5px bg-[#F5F4F0] border-2 border-stone-400 shadow-md" title="고서 페이퍼"></button>
              <button data-bg="#EFECE6" data-text="#292524" class="btn-theme-preset w-8 h-8 rounded-5px bg-[#EFECE6] border-2 border-stone-500 shadow-md" title="클래식 샌드"></button>
              <button data-bg="#1C1917" data-text="#F5F4F0" class="btn-theme-preset w-8 h-8 rounded-5px bg-[#1C1917] border-2 border-stone-700 shadow-md" title="심야 먹색"></button>
              <button data-bg="#44403C" data-text="#F5F4F0" class="btn-theme-preset w-8 h-8 rounded-5px bg-[#44403C] border-2 border-stone-600 shadow-md" title="딥 스톤"></button>
              <button data-bg="#FAF8F5" data-text="#1C1917" class="btn-theme-preset w-8 h-8 rounded-5px bg-[#FAF8F5] border-2 border-stone-300 shadow-md" title="은은한 미색"></button>
            </div>
          </div>

          <!-- Font Choice -->
          <div>
            <label class="block text-xs font-bold text-stone-400 mb-2">서체 선택</label>
            <div class="flex gap-2">
              <button data-font="Noto Serif KR" class="btn-font-preset flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs rounded-5px font-serif">명조체</button>
              <button data-font="Gowun Batang" class="btn-font-preset flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs rounded-5px font-batang">바탕체</button>
              <button data-font="Pretendard" class="btn-font-preset flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs rounded-5px font-sans">고딕체</button>
            </div>
          </div>

        </div>

      </div>

      <!-- Bottom Action Bar -->
      <div class="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-center gap-3">
        <button id="btn-download-card" class="w-full max-w-md py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold rounded-5px text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer">
          <span class="material-symbols-outlined">download</span>
          <span>고화질 1:1 카드 이미지 다운로드</span>
        </button>
      </div>

    </div>
  `;

  const canvas = container.querySelector('#card-canvas');
  const ctx = canvas.getContext('2d');

  function drawCard() {
    if (!ctx) return;

    ctx.fillStyle = currentBg;
    ctx.fillRect(0, 0, 600, 600);

    ctx.strokeStyle = (currentTextColor === '#F5F4F0') ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(36, 36, 528, 528);

    ctx.fillStyle = (currentTextColor === '#F5F4F0') ? 'rgba(255,255,255,0.3)' : 'rgba(28,25,24,0.3)';
    ctx.font = `70px ${currentFont}`;
    ctx.fillText('“', 64, 124);

    ctx.font = `500 24px ${currentFont}`;
    ctx.fillStyle = currentTextColor;

    const words = quote.split(' ');
    let line = '';
    let y = 190;
    const maxWidth = 450;
    const lineHeight = 44;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, 72, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 72, y);

    ctx.beginPath();
    ctx.moveTo(72, y + 42);
    ctx.lineTo(132, y + 42);
    ctx.strokeStyle = (currentTextColor === '#F5F4F0') ? 'rgba(255,255,255,0.4)' : '#292524';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = `700 20px ${currentFont}`;
    ctx.fillText(title, 72, y + 84);

    ctx.font = `400 15px ${currentFont}`;
    ctx.fillStyle = (currentTextColor === '#F5F4F0') ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';
    ctx.fillText(author, 72, y + 110);

    ctx.font = `600 12px Pretendard`;
    ctx.fillStyle = (currentTextColor === '#F5F4F0') ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.25)';
    ctx.fillText('문장수집가 2nd Edition', 430, 535);
  }

  setTimeout(drawCard, 50);

  container.querySelectorAll('.btn-theme-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentBg = e.currentTarget.dataset.bg;
      currentTextColor = e.currentTarget.dataset.text;
      drawCard();
    });
  });

  container.querySelectorAll('.btn-font-preset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentFont = e.currentTarget.dataset.font;
      drawCard();
    });
  });

  container.querySelector('#btn-close-studio')?.addEventListener('click', () => {
    setState({ overlayStack: [] });
  });

  container.querySelector('#btn-download-card')?.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `sentence_card_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
