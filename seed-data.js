/* ============================================================================
 * 지금이니 (Jigeumini) 외부 더미 데이터
 * ----------------------------------------------------------------------------
 * disign.html 은 이 파일을 <script src="seed-data.js"></script> 로 불러와
 * window.SEED_DATA 를 초기 시드 데이터로 사용합니다.
 *
 * 구성:
 *  - users       : 가입 회원 20명 (나를 제외한 커뮤니티 계정)
 *  - contents    : 카카오 인기 도서 10권 (sourceProvider: 'KAKAO')
 *  - myContent   : "나"의 서재 상태 10건 (10권 전체에 대한 읽기 상태)
 *  - posts       : 독서기록 17건 (내 기록 6 + 다른 회원 기록 11)
 *  - comments    : 12건 (일부는 대댓글로 스레드 구성 → 실제 소통 느낌)
 *  - collections : 문장 수집함 2건 (내 것 1 + 타 회원 공유 1)
 *
 * 이 파일만 교체하면 disign.html 코드 수정 없이 더미 데이터를 갈아끼울 수 있습니다.
 * version 값이 로컬 저장된 데이터와 다르면 disign.html이 자동으로 새 시드를 반영합니다.
 * ========================================================================== */
(function () {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  const hoursAgo = (h) => now - h * HOUR;
  const daysAgo = (d) => now - d * DAY;

  /* ---------------------------------------------------------------------- */
  /* 1) 가입 회원 20명                                                       */
  /* ---------------------------------------------------------------------- */
  const users = [
    { id: 'u1',  nickname: '이도윤', avatarBg: '#B45309', bio: '매일 밤 한 챕터씩, 잠들기 전 독서가 낙입니다.', joinedAt: daysAgo(210) },
    { id: 'u2',  nickname: '서지안', avatarBg: '#0EA5E9', bio: '에세이와 인문학을 좋아해요 📚',               joinedAt: daysAgo(180) },
    { id: 'u3',  nickname: '박하은', avatarBg: '#DB2777', bio: '소설 덕후, 리뷰 열심히 남깁니다.',            joinedAt: daysAgo(150) },
    { id: 'u4',  nickname: '최준서', avatarBg: '#059669', bio: '자기계발서로 하루를 시작해요.',               joinedAt: daysAgo(340) },
    { id: 'u5',  nickname: '김나윤', avatarBg: '#7C3AED', bio: '문장 수집이 취미입니다.',                    joinedAt: daysAgo(95)  },
    { id: 'u6',  nickname: '정태양', avatarBg: '#DC2626', bio: '출퇴근길 지하철 독서러.',                    joinedAt: daysAgo(410) },
    { id: 'u7',  nickname: '한소율', avatarBg: '#0891B2', bio: '작은 북클럽을 운영하고 있어요.',              joinedAt: daysAgo(260) },
    { id: 'u8',  nickname: '윤서준', avatarBg: '#CA8A04', bio: '고전문학 다시 읽기 프로젝트 진행중.',         joinedAt: daysAgo(500) },
    { id: 'u9',  nickname: '임채원', avatarBg: '#16A34A', bio: '느리지만 꾸준히 읽습니다.',                   joinedAt: daysAgo(70)  },
    { id: 'u10', nickname: '오지훈', avatarBg: '#9333EA', bio: '경제경영서 위주로 읽어요.',                   joinedAt: daysAgo(120) },
    { id: 'u11', nickname: '강수아', avatarBg: '#E11D48', bio: '감성 에세이 애호가.',                        joinedAt: daysAgo(30)  },
    { id: 'u12', nickname: '문예린', avatarBg: '#2563EB', bio: '매달 10권 완독 챌린지 중입니다.',             joinedAt: daysAgo(400) },
    { id: 'u13', nickname: '조현우', avatarBg: '#EA580C', bio: '책 리뷰 콘텐츠도 만들어요.',                  joinedAt: daysAgo(310) },
    { id: 'u14', nickname: '백서현', avatarBg: '#0D9488', bio: '심리학/인문 서적을 좋아합니다.',              joinedAt: daysAgo(60)  },
    { id: 'u15', nickname: '노건우', avatarBg: '#4338CA', bio: '독서모임 3년차입니다.',                       joinedAt: daysAgo(560) },
    { id: 'u16', nickname: '신유나', avatarBg: '#BE185D', bio: '감동적인 문장 저장소 운영중.',                joinedAt: daysAgo(45)  },
    { id: 'u17', nickname: '권도현', avatarBg: '#15803D', bio: '주말엔 도서관에서 삽니다.',                    joinedAt: daysAgo(250) },
    { id: 'u18', nickname: '홍시우', avatarBg: '#B91C1C', bio: '스릴러/추리 소설 매니아.',                    joinedAt: daysAgo(190) },
    { id: 'u19', nickname: '장은서', avatarBg: '#0369A1', bio: '육아하며 틈틈이 독서합니다.',                  joinedAt: daysAgo(15)  },
    { id: 'u20', nickname: '류지호', avatarBg: '#7E22CE', bio: '책 완독 인증 계정입니다.',                    joinedAt: daysAgo(130) }
  ];

  /* ---------------------------------------------------------------------- */
  /* 2) 카카오 인기 도서 10권 (contents)                                     */
  /* ---------------------------------------------------------------------- */
  const contents = [
    { id: 'k1',  type: 'BOOK', title: '채식주의자',            creator: '한강',                       publisher: '창비',           isbn: '9788936434595', cover: null, coverBg: 'rgb(71, 85, 105)',  genre: '소설',     totalPoint: 240, rating: 4.6, readerCount: 132, sourceProvider: 'KAKAO' },
    { id: 'k2',  type: 'BOOK', title: '불편한 편의점',          creator: '김호연',                     publisher: '나무옆의자',      isbn: '9791161571188', cover: null, coverBg: 'rgb(13, 148, 136)',  genre: '소설',     totalPoint: 268, rating: 4.7, readerCount: 201, sourceProvider: 'KAKAO' },
    { id: 'k3',  type: 'BOOK', title: '죽음의 수용소에서',       creator: '빅터 프랭클',                 publisher: '청아출판사',      isbn: '9788936812621', cover: null, coverBg: 'rgb(120, 53, 15)',   genre: '인문',     totalPoint: 224, rating: 4.8, readerCount: 156, sourceProvider: 'KAKAO' },
    { id: 'k4',  type: 'BOOK', title: '역행자',                creator: '자청',                       publisher: '웅진지식하우스',   isbn: '9791195841923', cover: null, coverBg: 'rgb(196, 164, 74)',  genre: '자기계발',  totalPoint: 360, rating: 4.5, readerCount: 244, sourceProvider: 'KAKAO' },
    { id: 'k5',  type: 'BOOK', title: '미움받을 용기',          creator: '기시미 이치로·고가 후미타케',   publisher: '인플루엔셜',      isbn: '9788996991342', cover: null, coverBg: 'rgb(109, 40, 217)',  genre: '인문',     totalPoint: 336, rating: 4.7, readerCount: 178, sourceProvider: 'KAKAO' },
    { id: 'k6',  type: 'BOOK', title: '아몬드',                creator: '손원평',                     publisher: '창비',           isbn: '9788936455337', cover: null, coverBg: 'rgb(90, 143, 123)',  genre: '소설',     totalPoint: 244, rating: 4.9, readerCount: 189, sourceProvider: 'KAKAO' },
    { id: 'k7',  type: 'BOOK', title: '달러구트 꿈 백화점',      creator: '이미예',                     publisher: '팩토리나인',      isbn: '9791165341909', cover: null, coverBg: 'rgb(67, 56, 202)',   genre: '소설',     totalPoint: 300, rating: 4.6, readerCount: 165, sourceProvider: 'KAKAO' },
    { id: 'k8',  type: 'BOOK', title: '언어의 온도',            creator: '이기주',                     publisher: '말글터',          isbn: '9791195824513', cover: null, coverBg: 'rgb(190, 24, 93)',   genre: '에세이',   totalPoint: 256, rating: 4.4, readerCount: 121, sourceProvider: 'KAKAO' },
    { id: 'k9',  type: 'BOOK', title: '트렌드 코리아 2026',      creator: '김난도 외',                   publisher: '미래의창',        isbn: '9791192519001', cover: null, coverBg: 'rgb(180, 83, 9)',    genre: '경제경영',  totalPoint: 392, rating: 4.3, readerCount: 98,  sourceProvider: 'KAKAO' },
    { id: 'k10', type: 'BOOK', title: '데미안',                creator: '헤르만 헤세',                 publisher: '민음사',          isbn: '9788937460449', cover: null, coverBg: 'rgb(30, 41, 59)',    genre: '고전',     totalPoint: 216, rating: 4.5, readerCount: 143, sourceProvider: 'KAKAO' }
  ];

  /* ---------------------------------------------------------------------- */
  /* 3) "나"의 서재 상태 (myContent) — 10권 전체                             */
  /* ---------------------------------------------------------------------- */
  const myContent = [
    { contentId: 'k1',  status: 'ACTIVE', currentPoint: 132, startDate: '2026.07.10' },
    { contentId: 'k2',  status: 'DONE',   currentPoint: 268, startDate: '2026.05.01', finishDate: '2026.05.20' },
    { contentId: 'k3',  status: 'WANT',   currentPoint: 0 },
    { contentId: 'k4',  status: 'ACTIVE', currentPoint: 210, startDate: '2026.07.01' },
    { contentId: 'k5',  status: 'WANT',   currentPoint: 0 },
    { contentId: 'k6',  status: 'DONE',   currentPoint: 244, startDate: '2026.04.10', finishDate: '2026.04.28' },
    { contentId: 'k7',  status: 'ACTIVE', currentPoint: 90,  startDate: '2026.07.18' },
    { contentId: 'k8',  status: 'WANT',   currentPoint: 0 },
    { contentId: 'k9',  status: 'ACTIVE', currentPoint: 55,  startDate: '2026.07.22' },
    { contentId: 'k10', status: 'DONE',   currentPoint: 216, startDate: '2026.03.02', finishDate: '2026.03.15' }
  ];

  /* ---------------------------------------------------------------------- */
  /* 4) 독서기록 17건 — 내 기록 6 + 다른 회원 기록 11                        */
  /* ---------------------------------------------------------------------- */
  const posts = [
    // ── 내가 등록한 기록 (mine: true) — 6건 ──────────────────────────────
    { id: 'p1',  contentId: 'k1',  point: 95,   memoType: 'QUOTE',    text: '"나는 왜 이렇게 살아야 하는가 하는 질문이 문장 사이사이에서 계속 떠올랐다."', review: '', rating: 0, spoiler: false, nickname: '나', mine: true,  likes: 5, comments: 2, createdAt: hoursAgo(30) },
    { id: 'p2',  contentId: 'k4',  point: null, memoType: 'THOUGHT',  text: '', review: "역행자 개념 중 '무의식 자동화'가 가장 현실적으로 와닿았다. 결국 습관 설계가 핵심.", rating: 0, spoiler: false, nickname: '나', mine: true,  likes: 2, comments: 0, createdAt: hoursAgo(20) },
    { id: 'p3',  contentId: 'k6',  point: null, memoType: 'REVIEW',   text: '', review: '손원평 작가 특유의 담백한 문체가 마음을 울린다. 올해 읽은 소설 중 손에 꼽는다.', rating: 5, spoiler: false, nickname: '나', mine: true,  likes: 9, comments: 2, createdAt: daysAgo(2) },
    { id: 'p4',  contentId: 'k9',  point: 55,   memoType: 'SUMMARY',  text: '', review: "2026년 트렌드 키워드 중 '가성비 큐레이션' 챕터가 가장 인상적이었다.", rating: 0, spoiler: false, nickname: '나', mine: true,  likes: 1, comments: 0, createdAt: hoursAgo(10) },
    { id: 'p5',  contentId: 'k7',  point: 60,   memoType: 'QUOTE',    text: '"모든 꿈은 의미가 있다, 그저 그 의미를 이해하지 못했을 뿐이다."', review: '', rating: 0, spoiler: false, nickname: '나', mine: true,  likes: 4, comments: 0, createdAt: daysAgo(1) },
    { id: 'p6',  contentId: 'k10', point: 120,  memoType: 'QUESTION', text: '', review: '싱클레어가 데미안을 통해 얻은 건 진짜 자아일까, 아니면 또 다른 그림자일까?', rating: 0, spoiler: false, nickname: '나', mine: true,  likes: 0, comments: 0, createdAt: hoursAgo(4) },

    // ── 다른 회원이 등록한 기록 (mine: false) — 11건 ─────────────────────
    { id: 'p7',  contentId: 'k1',  point: 40,   memoType: 'QUOTE',    text: '"나는 나무가 되고 싶어. 뿌리를 내리고, 그냥 서 있고 싶어."', review: '', rating: 0, spoiler: false, nickname: '박하은', mine: false, likes: 14, comments: 2, createdAt: daysAgo(4) },
    { id: 'p8',  contentId: 'k1',  point: 150,  memoType: 'THOUGHT',  text: '', review: '결말부에서 인간의 폭력성과 그로부터 벗어나려는 절규가 너무 강렬했다.', rating: 0, spoiler: true,  nickname: '한소율', mine: false, likes: 8,  comments: 0, createdAt: daysAgo(3) },
    { id: 'p9',  contentId: 'k2',  point: null, memoType: 'REVIEW',   text: '', review: '퇴근길에 읽으며 위로받은 소설. 인물들 하나하나가 다 정겹다.', rating: 5, spoiler: false, nickname: '최준서', mine: false, likes: 22, comments: 3, createdAt: daysAgo(6) },
    { id: 'p10', contentId: 'k3',  point: 88,   memoType: 'QUOTE',    text: '"인간에게서 모든 것을 빼앗아도 최후의 자유, 자신의 태도를 선택할 자유는 빼앗을 수 없다."', review: '', rating: 0, spoiler: false, nickname: '윤서준', mine: false, likes: 31, comments: 2, createdAt: daysAgo(9) },
    { id: 'p11', contentId: 'k3',  point: 150,  memoType: 'THOUGHT',  text: '', review: '극한 상황에서도 삶의 의미를 찾으려는 인간 정신에 대해 다시 생각하게 됨.', rating: 0, spoiler: false, nickname: '백서현', mine: false, likes: 12, comments: 0, createdAt: daysAgo(5) },
    { id: 'p12', contentId: 'k4',  point: 200,  memoType: 'SUMMARY',  text: '', review: "22전략의 핵심은 결국 '자동화 시스템'을 만드는 것으로 요약된다.", rating: 0, spoiler: false, nickname: '오지훈', mine: false, likes: 6,  comments: 0, createdAt: daysAgo(2) },
    { id: 'p13', contentId: 'k5',  point: 70,   memoType: 'QUOTE',    text: '"타인의 과제와 나의 과제를 분리하라."', review: '', rating: 0, spoiler: false, nickname: '서지안', mine: false, likes: 19, comments: 1, createdAt: daysAgo(7) },
    { id: 'p14', contentId: 'k7',  point: 210,  memoType: 'THOUGHT',  text: '', review: '패니 이야기를 읽으며 나의 첫 직장을 떠올렸다. 위로가 되는 챕터.', rating: 0, spoiler: false, nickname: '신유나', mine: false, likes: 10, comments: 0, createdAt: daysAgo(1) },
    { id: 'p15', contentId: 'k8',  point: 30,   memoType: 'QUOTE',    text: '"말은 그 사람의 온도를 담고 있다."', review: '', rating: 0, spoiler: false, nickname: '강수아', mine: false, likes: 15, comments: 0, createdAt: hoursAgo(15) },
    { id: 'p16', contentId: 'k9',  point: null, memoType: 'REVIEW',   text: '', review: '매년 챙겨보는 트렌드서인데 올해도 실용적인 인사이트가 많다.', rating: 4, spoiler: false, nickname: '문예린', mine: false, likes: 7,  comments: 0, createdAt: daysAgo(3) },
    { id: 'p17', contentId: 'k10', point: 60,   memoType: 'QUESTION', text: '', review: '에밀 싱클레어가 겪는 성장통, 지금 20대에게도 여전히 유효할까?', rating: 0, spoiler: false, nickname: '홍시우', mine: false, likes: 5,  comments: 0, createdAt: daysAgo(8) }
  ];

  /* ---------------------------------------------------------------------- */
  /* 5) 댓글 12건 — 일부는 대댓글로 스레드 구성 (실제 소통 느낌)             */
  /* ---------------------------------------------------------------------- */
  const comments = [
    { id: 'cm1',  postId: 'p1',  nickname: '박하은', text: '저도 같은 문장에서 한참 멈췄어요.',                 createdAt: hoursAgo(28), parentId: null },
    { id: 'cm2',  postId: 'p1',  nickname: '나',     text: '맞아요, 저도 그 부분에서 계속 곱씹게 되더라고요.',    createdAt: hoursAgo(25), parentId: 'cm1' },

    { id: 'cm3',  postId: 'p7',  nickname: '나',     text: '이 문장 진짜 좋네요, 저도 밑줄 쫙 그었어요.',        createdAt: daysAgo(3),  parentId: null },
    { id: 'cm4',  postId: 'p7',  nickname: '문예린', text: '채식주의자 다시 읽고싶어지는 댓글이네요 :)',          createdAt: daysAgo(3),  parentId: null },

    { id: 'cm5',  postId: 'p9',  nickname: '나',     text: '저도 이 책 읽고 마음이 몽글몽글했어요.',              createdAt: daysAgo(5),  parentId: null },
    { id: 'cm6',  postId: 'p9',  nickname: '정태양', text: '불편한 편의점 시리즈 다 좋더라고요.',                createdAt: daysAgo(5),  parentId: null },
    { id: 'cm7',  postId: 'p9',  nickname: '최준서', text: '2편도 강추입니다!',                                  createdAt: daysAgo(4),  parentId: 'cm6' },

    { id: 'cm8',  postId: 'p10', nickname: '백서현', text: '이 문장 읽고 한참 멍했어요.',                        createdAt: daysAgo(8),  parentId: null },
    { id: 'cm9',  postId: 'p10', nickname: '나',     text: '빅터 프랭클 문장은 매번 힘이 되네요.',                createdAt: daysAgo(7),  parentId: null },

    { id: 'cm10', postId: 'p13', nickname: '강수아', text: '미움받을 용기 진짜 인생책입니다.',                    createdAt: daysAgo(6),  parentId: null },

    { id: 'cm11', postId: 'p3',  nickname: '김나윤', text: '아몬드는 몇 번을 읽어도 좋아요.',                     createdAt: daysAgo(2),  parentId: null },
    { id: 'cm12', postId: 'p3',  nickname: '임채원', text: '저도 완독했는데 여운이 정말 오래 가더라고요.',        createdAt: daysAgo(1),  parentId: null }
  ];

  /* ---------------------------------------------------------------------- */
  /* 6) 문장 수집함 2건                                                      */
  /* ---------------------------------------------------------------------- */
  const collections = [
    { id: 'col_1', title: '📚 올해 다시 읽고 싶은 문장들',       desc: '스스로 기록했던 문장 중 다시 곱씹고 싶은 것들만 모았다.', author: '나',     mine: true,  isShared: true, postIds: ['p1', 'p3', 'p5'],  createdAt: daysAgo(2) },
    { id: 'col_2', title: '🔥 이달의 커뮤니티 인기 문장',        desc: '이번 달 가장 많은 공감을 받은 회원들의 문장 모음.',       author: '한소율', mine: false, isShared: true, postIds: ['p7', 'p9', 'p10'], createdAt: daysAgo(4) }
  ];

  /* ---------------------------------------------------------------------- */
  window.SEED_DATA = {
    version: 'seed_v1_20260726', // 이 값이 바뀌면 disign.html이 자동으로 새 더미 데이터를 반영합니다.
    activeBookId: 'k1',
    users,
    contents,
    myContent,
    posts,
    comments,
    collections
  };
})();
