/**
 * Application State & LocalStorage Reactive Manager
 */

export const INITIAL_DB = {
  version: '2nd_v2',
  books: [
    {
      id: 'b1',
      title: '데미안',
      author: '헤르만 헤세',
      publisher: '민음사',
      thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      totalPage: 240,
      curPage: 124,
      status: 'ACTIVE',
      genre: '고전소설',
      rating: 4.9,
      startDate: '2026.07.15',
      finishDate: ''
    },
    {
      id: 'b2',
      title: '아몬드',
      author: '손원평',
      publisher: '창비',
      thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      totalPage: 264,
      curPage: 264,
      status: 'DONE',
      genre: '현대소설',
      rating: 4.8,
      startDate: '2026.06.01',
      finishDate: '2026.06.20'
    },
    {
      id: 'b3',
      title: '사피엔스',
      author: '유발 하라리',
      publisher: '김영사',
      thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
      totalPage: 636,
      curPage: 0,
      status: 'WANT',
      genre: '인문학',
      rating: 4.7,
      startDate: '',
      finishDate: ''
    },
    {
      id: 'b4',
      title: '어린 왕자',
      author: '생텍쥐페리',
      publisher: '문학동네',
      thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      totalPage: 140,
      curPage: 140,
      status: 'DONE',
      genre: '세계문학',
      rating: 5.0,
      startDate: '2026.05.10',
      finishDate: '2026.05.15'
    },
    {
      id: 'b5',
      title: '참을 수 없는 존재의 가벼움',
      author: '밀란 쿤데라',
      publisher: '민음사',
      thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
      totalPage: 480,
      curPage: 185,
      status: 'ACTIVE',
      genre: '철학소설',
      rating: 4.9,
      startDate: '2026.08.01',
      finishDate: ''
    },
    {
      id: 'b6',
      title: '불편한 편의점',
      author: '김호연',
      publisher: '나무옆의자',
      thumbnail: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
      totalPage: 268,
      curPage: 92,
      status: 'ACTIVE',
      genre: '한국소설',
      rating: 4.7,
      startDate: '2026.08.05',
      finishDate: ''
    },
    {
      id: 'b7',
      title: '채식주의자',
      author: '한강',
      publisher: '창비',
      thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400',
      totalPage: 248,
      curPage: 248,
      status: 'DONE',
      genre: '한국소설',
      rating: 4.9,
      startDate: '2026.04.12',
      finishDate: '2026.04.18'
    },
    {
      id: 'b8',
      title: '달러구트 꿈 백화점',
      author: '이미예',
      publisher: '팩토리나인',
      thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
      totalPage: 300,
      curPage: 0,
      status: 'WANT',
      genre: '판타지소설',
      rating: 4.6,
      startDate: '',
      finishDate: ''
    },
    {
      id: 'b9',
      title: '월든',
      author: '헨리 데이비드 소로',
      publisher: '은행나무',
      thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400',
      totalPage: 540,
      curPage: 110,
      status: 'ACTIVE',
      genre: '수필',
      rating: 4.8,
      startDate: '2026.07.20',
      finishDate: ''
    },
    {
      id: 'b10',
      title: '구의 증명',
      author: '최진영',
      publisher: '은행나무',
      thumbnail: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
      totalPage: 180,
      curPage: 180,
      status: 'DONE',
      genre: '한국소설',
      rating: 4.9,
      startDate: '2026.03.01',
      finishDate: '2026.03.03'
    }
  ],
  records: [
    {
      id: 'r1',
      bookId: 'b1',
      bookTitle: '데미안',
      author: '헤르만 헤세',
      publisher: '민음사',
      quote: '새는 알에서 나오기 위해 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
      thought: '나 자신으로 돌아가는 과정에서의 고통과 기쁨에 대해 다시금 생각해보게 하는 명문장.',
      page: 124,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 24,
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'r2',
      bookId: 'b2',
      bookTitle: '아몬드',
      author: '손원평',
      publisher: '창비',
      quote: '구할 수 없는 인간이란 없다. 구하려는 노력을 그만두는 사람들이 있을 뿐이다.',
      thought: '타인에 대한 공감과 구원의 의미를 담담하게 일깨워주는 문장.',
      page: 198,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 42,
      createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
      id: 'r3',
      bookId: 'b3',
      bookTitle: '사피엔스',
      author: '유발 하라리',
      publisher: '김영사',
      quote: '우리는 상상의 질서를 믿음으로써 수백만 명이 함께 협력할 수 있는 유일한 종이 되었다.',
      thought: '화폐와 국가, 종교에 대한 파격적인 문명사적 해석.',
      page: 55,
      type: 'THOUGHT',
      spoil: false,
      mine: false,
      likes: 38,
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 'r4',
      bookId: 'b4',
      bookTitle: '어린 왕자',
      author: '생텍쥐페리',
      publisher: '문학동네',
      quote: '가장 중요한 것은 눈에 보이지 않아. 마음으로 보아야만 분명하게 볼 수 있어.',
      thought: '순수한 마음으로 세상을 바라보는 자세에 대한 울림.',
      page: 86,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 56,
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'r5',
      bookId: 'b5',
      bookTitle: '참을 수 없는 존재의 가벼움',
      author: '밀란 쿤데라',
      publisher: '민음사',
      quote: '인간의 삶은 단 한 번뿐이며, 그것은 우리가 다른 삶과 비교할 수도, 이전의 삶으로 교정할 수도 없다는 것을 의미한다.',
      thought: '삶의 가벼움과 무거움 사이에서 고뇌하는 유일무이한 선택들.',
      page: 185,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 31,
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'r6',
      bookId: 'b6',
      bookTitle: '불편한 편의점',
      author: '김호연',
      publisher: '나무옆의자',
      quote: '결국 삶은 관계였고 관계는 소통이었다. 행복은 먼 데서 오는 게 아니라 옆 사람과 주고받는 온기에 있었다.',
      thought: '지친 도시인들의 마음을 따스하게 보듬어주는 이웃 이야기.',
      page: 92,
      type: 'QUOTE',
      spoil: false,
      mine: false,
      likes: 67,
      createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
    },
    {
      id: 'r7',
      bookId: 'b7',
      bookTitle: '채식주의자',
      author: '한강',
      publisher: '창비',
      quote: '나는 나무가 되고 싶어. 뿌리를 깊게 내리고, 바람을 받으며 그냥 서 있고 싶어.',
      thought: '폭력적인 세상으로부터 온전히 스스로를 지켜내려는 강렬한 비망록.',
      page: 142,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 48,
      createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'r8',
      bookId: 'b8',
      bookTitle: '달러구트 꿈 백화점',
      author: '이미예',
      publisher: '팩토리나인',
      quote: '과거에 얽매이지 않고, 미래를 두려워하지 않으며, 현재에 충실할 때 우리는 진짜 삶을 살게 됩니다.',
      thought: '꿈을 사고파는 신비로운 백화점에서 만난 힐링의 시간.',
      page: 75,
      type: 'QUOTE',
      spoil: false,
      mine: false,
      likes: 29,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'r9',
      bookId: 'b9',
      bookTitle: '월든',
      author: '헨리 데이비드 소로',
      publisher: '은행나무',
      quote: '내가 숲으로 들어간 것은 인생을 의도적으로 살아보기 위해서였다.',
      thought: '간소하고 본질적인 삶을 향한 숲속의 깊은 침묵.',
      page: 110,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 35,
      createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'r10',
      bookId: 'b10',
      bookTitle: '구의 증명',
      author: '최진영',
      publisher: '은행나무',
      quote: '네가 죽는다면 나도 죽는다. 아니, 너를 먹고 너와 하나가 되어 영원히 살아갈 것이다.',
      thought: '죽음마저 삼켜버린 비극적이고 애절한 사랑의 찬가.',
      page: 180,
      type: 'QUOTE',
      spoil: false,
      mine: false,
      likes: 81,
      createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
    },
    {
      id: 'r11',
      bookId: 'b1',
      bookTitle: '이방인',
      author: '알베르 카뮈',
      publisher: '민음사',
      quote: '마침내 나는 내 안에서 결코 굴복하지 않는 불멸의 여름을 발견했다.',
      thought: '부조리한 세상 속에서도 자아의 주체성을 지켜내는 의지.',
      page: 65,
      type: 'QUOTE',
      spoil: false,
      mine: false,
      likes: 52,
      createdAt: new Date(Date.now() - 22 * 3600 * 1000).toISOString()
    },
    {
      id: 'r12',
      bookId: 'b5',
      bookTitle: '1984',
      author: '조지 오웰',
      publisher: '민음사',
      quote: '과거를 지배하는 자가 미래를 지배하며, 현재를 지배하는 자가 과거를 지배한다.',
      thought: '통제와 통섭에 맞서는 인간 자유에 관한 경고.',
      page: 140,
      type: 'QUOTE',
      spoil: false,
      mine: true,
      likes: 44,
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    }
  ],
  typingNotes: [],
  collections: []
};

function loadLocalDB() {
  try {
    const raw = localStorage.getItem('bookkeeper_2nd_db');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === '2nd_v2') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage load error:', e);
  }
  return INITIAL_DB;
}

export let db = loadLocalDB();

export function saveDB() {
  try {
    localStorage.setItem('bookkeeper_2nd_db', JSON.stringify(db));
  } catch (e) {
    console.error('LocalStorage save error:', e);
  }
}

export function updateDB(mutator) {
  mutator(db);
  saveDB();
  notifySubscribers();
}

/**
 * Update DB silently without triggering subscribers
 */
export function updateDBSilent(mutator) {
  mutator(db);
  saveDB();
}

// Global Reactive UI State
export const state = {
  tab: 'feed', // 'feed' | 'library' | 'typing' | 'my'
  feedSection: 'POPULAR',
  libFilter: 'ACTIVE',
  libQuery: '',
  detailTab: 'MY',
  myPostTypeFilter: 'ALL',
  myPostSort: 'LATEST',
  activeBookId: null,
  activeTyping: {
    text: '',
    source: ''
  },
  typingPracticeMode: 'PRACTICE', // Default: 'PRACTICE' (수치 안보이는 순수 필사) | 'GAME' (타자게임)
  typingSourceMode: 'RECOMMENDED',
  autoNextQuote: false, // Default: false (기본적으로 꺼진 상태로 시작)
  soundEnabled: true,
  soundType: 'mechanical',
  theme: 'light',
  overlayStack: [],
  modal: null
};

const subscribers = [];

export function subscribe(listener) {
  subscribers.push(listener);
}

export function notifySubscribers() {
  subscribers.forEach(fn => fn(state, db));
}

export function setState(partial) {
  Object.assign(state, partial);
  notifySubscribers();
}
