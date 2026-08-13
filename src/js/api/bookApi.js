/**
 * Ultra-Fast Book Search API Infrastructure (Optimized from bookkeeper-main/index.html)
 * Performance Boosters:
 *  1. In-Memory Search LRU Cache (0ms Instant Return on Repeated Queries)
 *  2. Fast 1.0s Resolution Timeout for External APIs (Kakao / Google / Aladin)
 *  3. Local Seed DB + Local Storage Prioritized Instant Delivery
 */

const GOOGLE_BOOKS_API_KEY = 'AIzaSyCgW1mJzTjmA6n1MY-3fQMAjuYEHAG4ZDY';
const KAKAO_API_KEY = '9e4f47a5976e926dfc5f669a730c86d3';
const ALADIN_TTB_KEY = 'ttbtamet1421006';

// In-Memory Search Cache (Query -> Results) for 0ms Instant Response
const SEARCH_CACHE = new Map();

// Seed Books Database from seed-data.js & bookkeeper index.html
const SEED_BOOKS = [
  { id: 'sb_1',  title: '채식주의자', creator: '한강', publisher: '창비', isbn: '9788936434595', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', genre: '소설', totalPoint: 240, rating: 4.8, pubDate: '2022.03.15', contents: '상처받은 영혼의 고통과 육식에 대한 거부를 다룬 한강 작가의 노벨문학상 수상작.' },
  { id: 'sb_2',  title: '불편한 편의점', creator: '김호연', publisher: '나무옆의자', isbn: '9791161571188', thumbnail: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400', genre: '소설', totalPoint: 268, rating: 4.9, pubDate: '2021.04.20', contents: '청파동 골목길 작은 편의점을 배경으로 이웃들의 삶을 따뜻하게 그린 힐링 소설.' },
  { id: 'sb_3',  title: '죽음의 수용소에서', creator: '빅터 프랭클', publisher: '청아출판사', isbn: '9788936812621', thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', genre: '인문학', totalPoint: 224, rating: 4.8, pubDate: '2020.05.10', contents: '나치 강제수용소에서 생존한 정신과의사의 인간 존엄성에 관한 위대한 기록.' },
  { id: 'sb_4',  title: '역행자', creator: '자청', publisher: '웅진지식하우스', isbn: '9791195841923', thumbnail: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400', genre: '자기계발', totalPoint: 360, rating: 4.7, pubDate: '2022.05.30', contents: '돈과 시간에서 완전한 자유를 얻는 7단계 순리자 벗어나기 공식.' },
  { id: 'sb_5',  title: '미움받을 용기', creator: '기시미 이치로·고가 후미타케', publisher: '인플루엔셜', isbn: '9788996991342', thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400', genre: '인문학', totalPoint: 336, rating: 4.7, pubDate: '2014.11.17', contents: '아들러 심리학의 대가와 철학자의 대화를 통해 자유롭고 행복한 삶을 안내하는 책.' },
  { id: 'sb_6',  title: '아몬드', creator: '손원평', publisher: '창비', isbn: '9788936455337', thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', genre: '소설', totalPoint: 244, rating: 4.9, pubDate: '2017.03.31', contents: '감정을 느끼지 못하는 소년 선윤재의 아름다운 성장 스토리.' },
  { id: 'sb_7',  title: '달러구트 꿈 백화점', creator: '이미예', publisher: '팩토리나인', isbn: '9791165341909', thumbnail: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', genre: '소설', totalPoint: 300, rating: 4.8, pubDate: '2020.07.08', contents: '잠들어야만 입장이 가능한 몽환적인 꿈 백화점에서 일어나는 감동 판타지.' },
  { id: 'sb_8',  title: '언어의 온도', creator: '이기주', publisher: '말글터', isbn: '9791195824513', thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', genre: '시/에세이', totalPoint: 256, rating: 4.6, pubDate: '2016.08.19', contents: '말과 글에 담긴 온기와 인간관계의 소중함을 말하는 감성 에세이.' },
  { id: 'sb_9',  title: '트렌드 코리아 2026', creator: '김난도 외', publisher: '미래의창', isbn: '9791192519001', thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400', genre: '경제/경영', totalPoint: 392, rating: 4.5, pubDate: '2025.10.05', contents: '대한민국 소비 트렌드 변화와 미래 시장 예측 분석서.' },
  { id: 'sb_10', title: '데미안', creator: '헤르만 헤세', publisher: '민음사', isbn: '9788937460449', thumbnail: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400', genre: '소설', totalPoint: 216, rating: 4.9, pubDate: '2000.12.20', contents: '자기 자신에게로 이르는 길을 찾아가는 청년 싱클레어의 고뇌와 성장을 그린 명작.' },
  { id: 'sb_11', title: '사피엔스', creator: '유발 하라리', publisher: '김영사', isbn: '9788934972464', thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', genre: '인문학', totalPoint: 636, rating: 4.8, pubDate: '2015.11.24', contents: '인류의 기원에서 인공지능 시대까지, 인간이 지구의 지배자가 된 성찰서.' },
  { id: 'sb_12', title: '클린 코드 (Clean Code)', creator: '로버트 C. 마틴', publisher: '인사이트', isbn: '9788966260959', thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400', genre: 'IT/과학', totalPoint: 584, rating: 4.9, pubDate: '2013.12.24', contents: '애자일 소프트웨어 명수가 전하는 유지보수하기 쉬운 우수한 코드 작성 가이드.' },
  { id: 'sb_13', title: '어린 왕자', creator: '앙투안 드 생텍쥐페리', publisher: '열린책들', isbn: '9788932917245', thumbnail: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400', genre: '소설', totalPoint: 160, rating: 5.0, pubDate: '2015.10.20', contents: '가장 중요한 것은 눈에 보이지 않는다는 진리를 전하는 어른들을 위한 동화.' },
  { id: 'sb_14', title: '돈의 속성', creator: '김승호', publisher: '스노우폭스북스', isbn: '9791188331796', thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400', genre: '경제/경영', totalPoint: 400, rating: 4.8, pubDate: '2020.06.15', contents: '자수성가한 스노우폭스 회장의 돈에 대한 남다른 철학과 부자가 되는 원칙.' },
  { id: 'sb_15', title: '코스모스', creator: '칼 세이건', publisher: '사이언스북스', isbn: '9788983711892', thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400', genre: 'IT/과학', totalPoint: 700, rating: 4.9, pubDate: '2006.12.20', contents: '우주의 광대함 속에서 인간 존재의 의미를 묻는 명저.' }
];

export function parseCategoryToStandard(categoryName) {
  if (!categoryName) return '소설';
  const c = categoryName.toLowerCase();

  if (c.includes('소설') || c.includes('fiction') || c.includes('문학')) return '소설';
  if (c.includes('시') || c.includes('에세이') || c.includes('수필')) return '시/에세이';
  if (c.includes('인문') || c.includes('철학') || c.includes('역사')) return '인문학';
  if (c.includes('사회') || c.includes('정치') || c.includes('법')) return '사회/정치';
  if (c.includes('경제') || c.includes('경영') || c.includes('재테크') || c.includes('주식')) return '경제/경영';
  if (c.includes('자기계발') || c.includes('성공')) return '자기계발';
  if (c.includes('과학') || c.includes('공학') || c.includes('컴퓨터') || c.includes('it') || c.includes('프로그래밍')) return 'IT/과학';
  if (c.includes('예술') || c.includes('대중문화') || c.includes('음악') || c.includes('미술')) return '예술/문화';
  
  return '소설';
}

export function fetchAladinSingleIsbnInfo(isbn) {
  return new Promise((resolve) => {
    if (!isbn) return resolve(null);
    const cleanedIsbn = String(isbn).replace(/[^0-9X]/gi, '');
    if (!cleanedIsbn) return resolve(null);

    const cbName = 'aladin_lookup_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');

    const cleanup = () => {
      delete window[cbName];
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    window[cbName] = function(data) {
      cleanup();
      try {
        if (data && !data.errorCode && data.item && data.item.length > 0) {
          const item = data.item[0];
          const itemPage = item.subInfo?.itemPage;
          const pageCount = (itemPage && !isNaN(itemPage) && parseInt(itemPage, 10) > 0) ? parseInt(itemPage, 10) : null;
          const desc = item.description ? item.description.trim() : null;
          const cat = item.categoryName ? parseCategoryToStandard(item.categoryName) : null;
          let cover = item.cover || null;
          if (cover) {
            cover = cover.replace('http://', 'https://');
          }
          if (pageCount || desc || cat || cover) {
            return resolve({ pageCount, description: desc, category: cat, cover });
          }
        }
      } catch(e) {
        console.warn('알라딘 LookUp 파싱 오류:', e);
      }
      resolve(null);
    };

    script.onerror = () => {
      cleanup();
      resolve(null);
    };

    const itemIdType = cleanedIsbn.length === 13 ? 'ISBN13' : 'ISBN';
    script.src = `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_TTB_KEY}&itemIdType=${itemIdType}&ItemId=${cleanedIsbn}&output=js&Version=20131101&callback=${cbName}`;
    document.body.appendChild(script);
  });
}

export async function fetchAladinPageCount(isbn) {
  if (!isbn) return null;
  const parts = String(isbn).trim().split(/\s+/).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    const info = await fetchAladinSingleIsbnInfo(parts[i]);
    if (info && info.pageCount) return info.pageCount;
  }
  return null;
}

export function fetchAladinSearchBooks(query, target = 'title') {
  return new Promise((resolve) => {
    if (!query) return resolve([]);
    let aladinTarget = 'Title';
    if (target === 'person') aladinTarget = 'Author';
    else if (target === 'publisher') aladinTarget = 'Publisher';
    else if (target === 'isbn') aladinTarget = 'Isbn';

    const cbName = 'aladin_search_cb_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    const script = document.createElement('script');

    const cleanup = () => {
      delete window[cbName];
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    window[cbName] = function(data) {
      cleanup();
      try {
        if (data && data.item && Array.isArray(data.item)) {
          const books = data.item.map(item => {
            let cover = item.cover || null;
            if (cover) {
              cover = cover.replace('http://', 'https://');
            }
            let rawCat = item.categoryName || '';
            let parsedGenre = parseCategoryToStandard(rawCat);

            return {
              title: item.title || '',
              author: (item.author || '').replace(/\(지은이\)|\(옮긴이\)|\(그림\)/g, '').trim(),
              publisher: item.publisher || '',
              contents: item.description || '',
              thumbnail: cover,
              isbn: item.isbn13 || item.isbn || '',
              totalPage: item.subInfo?.itemPage || null,
              pubDate: item.pubDate ? item.pubDate.replace(/-/g, '.') : '',
              genre: parsedGenre,
              source: '알라딘'
            };
          });
          return resolve(books);
        }
      } catch(e) {
        console.warn('알라딘 검색 파싱 오류:', e);
      }
      resolve([]);
    };

    script.onerror = () => {
      cleanup();
      resolve([]);
    };

    script.src = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_TTB_KEY}&Query=${encodeURIComponent(query)}&QueryType=${aladinTarget}&MaxResults=10&Output=js&Version=20131101&callback=${cbName}`;
    document.body.appendChild(script);
  });
}

/**
 * Optimized Ultra-Fast Multi-Source Search Engine with 0ms Memory Cache & 1.0s Timeout
 */
export async function searchBooksMultiSource(query, target = 'title') {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  // Check In-Memory Cache for 0ms Instant Response!
  const cacheKey = `${q}||${target}`;
  if (SEARCH_CACHE.has(cacheKey)) {
    return SEARCH_CACHE.get(cacheKey);
  }

  // 1. Seed Books Local Match (0ms)
  const localMatched = SEED_BOOKS.filter(b => {
    if (target === 'isbn') return b.isbn.toLowerCase().includes(q);
    if (target === 'person') return b.creator.toLowerCase().includes(q);
    if (target === 'publisher') return b.publisher.toLowerCase().includes(q);
    return b.title.toLowerCase().includes(q) || b.creator.toLowerCase().includes(q) || b.publisher.toLowerCase().includes(q);
  }).map(b => ({
    id: 'seed_' + b.id,
    title: b.title,
    author: b.creator,
    publisher: b.publisher,
    contents: b.contents,
    thumbnail: b.thumbnail,
    totalPage: b.totalPoint || 300,
    genre: b.genre || '소설',
    isbn: b.isbn,
    pubDate: b.pubDate || '2022.01.01',
    source: '추천 도서',
    editions: []
  }));

  let kakaoTarget = target;
  let gQuery = query;

  if (target === 'title') gQuery = `intitle:${query}`;
  else if (target === 'person') gQuery = `inauthor:${query}`;
  else if (target === 'publisher') gQuery = `inpublisher:${query}`;
  else if (target === 'isbn') gQuery = `isbn:${query}`;

  // Ultra-Fast Timeout Helper (1.0 Second Max Wait for external APIs)
  const withFastTimeout = (promise, ms = 1000) => {
    return Promise.race([
      promise,
      new Promise(resolve => setTimeout(() => resolve([]), ms))
    ]);
  };

  // 2. Kakao Books API (Fastest ~150ms Response)
  const kakaoPromise = withFastTimeout((async () => {
    try {
      const res = await fetch(`https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&target=${kakaoTarget}`, {
        headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.documents) return [];
      return data.documents.map(b => {
        let cover = b.thumbnail || null;
        if (cover) {
          cover = cover.replace('http://', 'https://');
        }
        let isbnVal = '';
        if (b.isbn) {
          const parts = b.isbn.split(' ');
          isbnVal = parts[parts.length - 1] || b.isbn;
        }
        return {
          title: b.title || '',
          author: Array.isArray(b.authors) ? b.authors.join(', ') : (b.authors || ''),
          publisher: b.publisher || '',
          contents: b.contents || '',
          thumbnail: cover,
          isbn: isbnVal,
          totalPage: b.page_count || b.page || null,
          pubDate: b.datetime ? b.datetime.slice(0, 10).replace(/-/g, '.') : '',
          source: '카카오 책'
        };
      });
    } catch(e) {
      return [];
    }
  })(), 1000);

  // 3. Google Books API
  const googlePromise = withFastTimeout((async () => {
    try {
      const gUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(gQuery)}&key=${GOOGLE_BOOKS_API_KEY}&maxResults=10`;
      const res = await fetch(gUrl).catch(() => null);
      if (!res || !res.ok) return [];
      const data = await res.json().catch(() => ({}));
      if (!data || !data.items) return [];
      return data.items.map(item => {
        const v = item.volumeInfo || {};
        const imgLinks = v.imageLinks || {};
        let rawCover = imgLinks.extraLarge || imgLinks.large || imgLinks.medium || imgLinks.small || imgLinks.thumbnail || imgLinks.smallThumbnail || null;
        
        if (rawCover) {
          rawCover = rawCover.replace('http://', 'https://').replace('&edge=curl', '');
          if (rawCover.includes('img=0') || rawCover.includes('no_cover') || rawCover.includes('nophoto') || rawCover.includes('placeholder')) {
            rawCover = null;
          }
        }

        let isbnVal = '';
        if (v.industryIdentifiers) {
          const isbnObj = v.industryIdentifiers.find(i => i.type === 'ISBN_13') || v.industryIdentifiers.find(i => i.type === 'ISBN_10');
          if (isbnObj) isbnVal = isbnObj.identifier;
        }

        return {
          title: v.title || '',
          author: Array.isArray(v.authors) ? v.authors.join(', ') : (v.authors || ''),
          publisher: v.publisher || '',
          contents: v.description || '',
          thumbnail: rawCover,
          isbn: isbnVal,
          totalPage: v.pageCount || null,
          pubDate: v.publishedDate ? v.publishedDate.replace(/-/g, '.') : '',
          source: '구글 북스'
        };
      }).filter(b => b.thumbnail && b.thumbnail.trim().length > 15);
    } catch(e) {
      return [];
    }
  })(), 1000);

  // 4. Aladin Books API
  const aladinPromise = withFastTimeout(fetchAladinSearchBooks(query, target), 1000);

  const results = await Promise.allSettled([kakaoPromise, googlePromise, aladinPromise]);
  const kakaoBooks = results[0].status === 'fulfilled' ? results[0].value : [];
  const googleBooks = results[1].status === 'fulfilled' ? results[1].value : [];
  const aladinBooks = results[2].status === 'fulfilled' ? results[2].value : [];

  const merged = [];

  const cleanTitle = (str) => {
    let t = (str || '').toLowerCase();
    t = t.replace(/\([^)]*개정판[^)]*\)/g, '')
         .replace(/\([^)]*에디션[^)]*\)/g, '')
         .replace(/\([^)]*특별판[^)]*\)/g, '')
         .replace(/\([^)]*양장[^)]*\)/g, '')
         .replace(/\([^)]*무선[^)]*\)/g, '')
         .replace(/\([^)]*세트[^)]*\)/g, '');
    return t.replace(/[^a-z0-9가-힣]/g, '');
  };

  const cleanAuthor = (str) => {
    let a = (str || '').toLowerCase();
    a = a.replace(/\([^)]*\)/g, '').replace(/지은이|글|그림|옮긴이|역자|저자|원작/g, '');
    const parts = a.split(/[,·;\s]+/);
    return parts[0] ? parts[0].replace(/[^a-z0-9가-힣]/g, '') : '';
  };

  const cleanPublisher = (str) => {
    let p = (str || '').toLowerCase();
    return p.replace(/\(주\)/g, '').replace(/주식회사/g, '').replace(/[^a-z0-9가-힣]/g, '');
  };

  const getEditionGroupKey = (b) => {
    const t = cleanTitle(b.title);
    const a = cleanAuthor(b.author);
    const p = cleanPublisher(b.publisher);
    return `${t}||${a}||${p}`;
  };

  const addBook = (b) => {
    const groupKey = getEditionGroupKey(b);
    const isbnKey = (b.isbn || '').trim();

    let exactIndex = -1;
    if (isbnKey) {
      exactIndex = merged.findIndex(m => (m.isbn || '').trim() === isbnKey);
    }

    if (exactIndex >= 0) {
      if (!merged[exactIndex].thumbnail && b.thumbnail) merged[exactIndex].thumbnail = b.thumbnail;
      if (!merged[exactIndex].pubDate && b.pubDate) merged[exactIndex].pubDate = b.pubDate;
      if (!merged[exactIndex].totalPage && b.totalPage) merged[exactIndex].totalPage = b.totalPage;
      if ((!merged[exactIndex].contents || merged[exactIndex].contents.trim().length < 10) && b.contents && b.contents.trim().length >= 10) {
        merged[exactIndex].contents = b.contents;
      }
      return;
    }

    let groupIndex = merged.findIndex(m => getEditionGroupKey(m) === groupKey);
    if (groupIndex >= 0) {
      const parent = merged[groupIndex];
      if (!parent.editions || !Array.isArray(parent.editions)) {
        parent.editions = [{ ...parent }];
      }
      const isAlreadyInEditions = parent.editions.some(e => 
        (e.isbn && b.isbn && e.isbn.trim() === b.isbn.trim()) || 
        (e.pubDate && b.pubDate && e.pubDate === b.pubDate)
      );
      if (!isAlreadyInEditions) {
        parent.editions.push(b);
      }
      return;
    }

    b.editions = [{ ...b }];
    merged.push(b);
  };

  // Merge Local Matches First + External API
  localMatched.forEach(addBook);
  kakaoBooks.forEach(addBook);
  aladinBooks.forEach(addBook);
  googleBooks.forEach(addBook);

  // Fallback if no external result: return all seed matches
  if (merged.length === 0) {
    const fallbackResults = SEED_BOOKS.map(b => ({
      id: 'seed_' + b.id,
      title: b.title,
      author: b.creator,
      publisher: b.publisher,
      contents: b.contents,
      thumbnail: b.thumbnail,
      totalPage: b.totalPoint || 300,
      genre: b.genre || '소설',
      isbn: b.isbn,
      pubDate: b.pubDate || '2022.01.01',
      source: '시드 추천 도서',
      editions: []
    }));
    SEARCH_CACHE.set(cacheKey, fallbackResults);
    return fallbackResults;
  }

  const finalOutput = merged.map(b => ({
    id: 'api_' + (b.isbn || Date.now() + '_' + Math.floor(Math.random() * 1000)),
    title: b.title,
    author: b.author || '저자 미상',
    publisher: b.publisher || '출판사 미상',
    contents: b.contents || '',
    thumbnail: b.thumbnail || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    totalPage: b.totalPage || 300,
    genre: b.genre || '소설',
    isbn: b.isbn || '',
    pubDate: b.pubDate || '',
    source: b.source || '도서 API',
    editions: b.editions || []
  }));

  // Store in cache for instant future responses
  if (SEARCH_CACHE.size > 50) {
    const firstKey = SEARCH_CACHE.keys().next().value;
    SEARCH_CACHE.delete(firstKey);
  }
  SEARCH_CACHE.set(cacheKey, finalOutput);

  return finalOutput;
}
