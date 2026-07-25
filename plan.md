# 📖 지금이니 (Jigeumini) — 웹/앱 개발 종합 계획서 및 명세서 (`plan.md`)

> **버전**: v10.0 (기존 `plan.md` v9.5 + 소스 분석 문서 병합·중복 제거·번호 재정렬)
> **소스 파일**: `disign.html` (Pure Vanilla JS SPA, 약 4,900줄)
> **최종 업데이트**: 2026년 7월 25일
> **⚠️ 이름 통일 안내**: 기존 `plan.md`의 타이틀은 "Bookmate (지금이독서)"였지만, 실제 소스 파일(`disign.html`)의 `<title>`은 **"지금이니 — 지금 내가 있는 곳까지만"**이며 최근 작업 맥락도 "지금이니"로 진행되어 왔습니다. 이 문서에서는 **"지금이니(Jigeumini)"를 공식 명칭으로 통일**했습니다. Bookmate가 맞다면 알려주시면 일괄 치환해 드릴게요.

---

## 목차
1. 프로젝트 개요 & 핵심 콘셉트
2. 기술 아키텍처 및 구현 방식 (현재 프로토타입 기준)
3. 디자인 시스템 & UI/UX 원칙
4. 데이터 모델 (State & Mock DB 스키마)
5. 내비게이션 구조 (탭 / 오버레이 / 모달)
6. 화면별 상세 명세
7. 모달 및 오버레이 시스템 명세
8. 핵심 기능 로직 상세 (앱 이식 시 최우선 검토 대상)
9. 실제 앱 전환 아키텍처 제안
10. 마이그레이션 우선순위
11. 최근 변경 이력 (Changelog) — 프로토타입 개선 기록

---

## 1. 프로젝트 개요 & 핵심 콘셉트

- **앱 명칭**: **지금이니 (Jigeumini)** — *"지금 내가 있는 곳까지만"*
- **핵심 목표**: 독자가 책을 읽으며 감명 받은 문장, 생각, 질문, 요약, 리뷰를 자유롭게 기록하고, 나만의 문장 수집함(컬렉션)을 관리하며 1:1 감성 인용 카드로 제작해 공유하는 **통합 독서 큐레이션 & SNS 애플리케이션**.
- **핵심 가치**:
  - 페이지 수 기준의 부담 없는 자유로운 독서 진행률 관리
  - **스포일러 자동 차단**을 통한 읽기 몰입감 및 커뮤니티 안심 탐색 보장 (내 진행 지점 이후 기록은 카드 자체가 렌더링되지 않음)
  - 바코드 그래픽 기반 **터치/마우스 드래그 페이지 설정** 및 **겹친 기록 지점 핀포인트 선택 Popover**
  - **하단 플로팅 액션 버튼(FAB)** 기반 원클릭 기록 작성 경험 및 **고가독성 독서 진행률 대시보드**
  - 따뜻한 종이 질감 크림 감성 UI/UX
  - **1:1 인용 카드 스튜디오** — Canvas 기반 SNS 공유용 이미지 가공/다운로드

---

## 2. 기술 아키텍처 및 구현 방식 (현재 프로토타입 기준)

### 2.1 기술 스택
| 구분 | 적용 기술 및 방식 | 비고 |
| :--- | :--- | :--- |
| Core Tech | HTML5, CSS3, ES6+ Vanilla JavaScript | 외부 프레임워크 없는 단일 파일 SPA |
| State Management | 전역 `state` 객체 (뮤터블) | 탭/필터/모달/오버레이/스포일러 토글 등 UI 상태 일괄 관리 |
| Rendering Engine | 템플릿 리터럴 기반 `render()` + `innerHTML` 전체 재생성 | Virtual DOM 없이 매 호출마다 문자열 전체를 다시 그림 |
| Event Binding | `attachEvents()`가 `render()` 직후 `data-*` 속성 기준으로 DOM 재스캔 후 재바인딩 | 이벤트 위임(delegation) 없이 매번 수동 재바인딩 — **앱 전환 시 이 패턴은 버리고 선언적 이벤트 핸들러로 대체** |
| Data Persistence | `localStorage` 기반 Mock DB (`db`, `saveDB()`/`loadDB()`) | 서버 없는 완전 로컬 프로토타입, 새로고침 시 데이터 보존 |
| Canvas Graphics | HTML5 Canvas API (`Card Studio`, `#cardCanvas`) | 600×600 1:1 정사각형 PNG 인용 카드 실시간 생성 및 `canvas.toDataURL('image/png')`로 다운로드 |
| External API | Kakao Book Search API (`searchKakaoBooks()`) | `https://dapi.kakao.com/v3/search/book` 연동 도서 검색·자동 등록 (register 오버레이 + 모달 두 군데에서 사용) |

### 2.2 렌더링/내비게이션 패턴 요약
- **패턴 철학**: 전역 `db`(데이터) + 전역 `state`(UI 상태) → `render()`가 호출될 때마다 해당 화면 전체를 문자열로 재생성해 `innerHTML`에 삽입. React의 "state → 순수 함수 → UI" 개념과 방향은 같지만 Virtual DOM 없이 통째로 다시 그리는 원시적 형태.
- **내비게이션은 3계층 구조**로 되어 있고, 이는 그대로 앱 내비게이션 설계 기준이 됩니다.
  1. **하단 탭 4개** (`state.tab`)
  2. **오버레이 스택** (`state.overlayStack`, push/pop) — 상세/통계/등록 화면이 탭 위에 풀스크린으로 쌓임 → **네이티브 Stack Navigator와 1:1 대응**
  3. **모달** (`state.modal`) — 오버레이 위에 다시 뜨는 바텀시트/다이얼로그

---

## 3. 디자인 시스템 & UI/UX 원칙

```
🎨 Color Tokens & Typography
 ├── Paper Background : #F8F6F2 (따뜻한 종이 감성 크림 톤)
 ├── Card Background  : #FFFFFF (깔끔한 백색 카드)
 ├── Accent Color     : #C25E00 / rgb(180, 83, 9) (웜 오렌지/브라운)
 ├── Typography       : Pretendard (UI 산세리프) + Gowun Batang / Noto Serif (인용구 명조체)
 └── Radii System     : 3px / 4px / 6px / 8px / 12px / 50px (FAB)
```

1. **반응형 유체 레이아웃**: 장르 배지 → 책 제목(20px) → 저자·출판사 → 별점 → 설명(좌측 정렬) → 상태 버튼(3등분 알약 탭, 수평·수직 중앙 정렬) 순서로 배치.
2. **중앙 정렬 플로팅 기록 버튼(`.floating-record-btn`)**: 하단 바 위(`bottom: 96px`, `left: 50%` 중앙), 백색 종이 톤 미니멀 알약 버튼.
3. **고가독성 진행률 대시보드**: 22px 대형 볼드 퍼센트 + `186p / 300p` 대형 볼드 숫자.
4. **스포일러 자동 블라인드**: 내 진행 지점보다 뒤쪽(`point > curPoint`) 기록은 카드 자체가 렌더링되지 않고 완전히 숨겨짐 (블러 처리가 아님 — 4.2절 참고).
5. **유틸리티 클래스**: `.mb-16 { margin-bottom: 16px; }` 등 `!important` 없이 유연하게 여백을 조정할 수 있는 유틸리티 클래스 사용.

---

## 4. 데이터 모델 (State & Mock DB 스키마)

### 4.1 전역 `state` 객체 (실제 소스 기준 전체 필드)

```javascript
let state = {
  tab: 'feed',                    // 활성 탭: feed / library / community / my
  overlayStack: [],               // 내비게이션 오버레이 스택 (push/pop)
  modal: null,                    // 활성 모달 객체

  // 서재(Library) 관련
  libFilter: 'ACTIVE',            // WANT / ACTIVE / DONE
  libQuery: '',                   // 서재 검색어

  // 도서 상세(Detail) 관련
  detailTab: 'MY',                // MY vs COMMUNITY 기록 탭

  // 커뮤니티(Community) 관련
  communitySection: 'POPULAR',
  commPostSort: 'LATEST',
  commPostTypeFilter: 'ALL',

  // MY 프로필 관련
  myTab: 'posts',                 // posts / reading / collections
  myLibFilter: 'ACTIVE',
  myPostSort: 'LATEST',
  myPostTypeFilter: 'ALL',
  myPostsShowAll: false,          // 내 글 더보기 펼침 여부

  // UI 임시 상태 (드롭다운/댓글 등)
  activeCommentsPostId: null,
  openCardMenuId: null,
  openCollectionMenuId: null,
  replyingToCommentId: null,
  openMetaPostId: null,           // 저자·출판사 메타 토글

  theme: 'LIGHT'                  // LIGHT / DARK / SYSTEM
};

let postForm = { memoType: 'QUOTE', page: '', text: '', review: '', rating: 0, spoiler: false };
```
> ⚠️ 기존 `plan.md`의 `state` 스니펫에는 `libQuery`, `communitySection`, `commPostSort/TypeFilter`, `myPostTypeFilter`, `myPostsShowAll`, 각종 `open*Id` 필드가 빠져 있었습니다. 위가 실제 소스 전체 필드입니다.

### 4.2 Mock DB 스키마 (5개 컬렉션)

#### `contents` — 콘텐츠(책) 마스터
| 필드 | 타입 | 설명 |
|---|---|---|
| id | string | PK |
| type | string | 현재는 `'BOOK'`만 사용 (추후 영화/드라마 확장 여지) |
| title, creator, publisher | string | 제목/저자/출판사 |
| cover | string\|null | 표지 이미지 URL |
| coverBg | string | 표지 없을 때 대체 배경색 |
| genre | string | 장르 |
| **totalPoint** | number | 총 분량(총 페이지 수) — 진행률 계산의 분모 |
| rating, readerCount | number | 평균 평점, 읽은 사람 수 |

> ⚠️ **설계 이슈**: `totalPoint`가 콘텐츠 마스터에 고정되어 있는데, 실제로는 판본(에디션)마다 페이지 수가 다를 수 있습니다. "작품"과 "내가 등록한 판본"을 분리하는 걸 권장합니다.

#### `myContent` — 내 서재(읽기 상태), 콘텐츠당 1개
| 필드 | 설명 |
|---|---|
| contentId | contents FK |
| status | `'WANT'`(보관함) / `'ACTIVE'`(읽는 중) / `'DONE'`(완독) / **`'NONE'`(무선택, 기본값)** |
| currentPoint | 현재까지 읽은 지점 (0 ~ totalPoint) |
| startDate / finishDate | 문자열 날짜(`'2026.06.14'`) — **Date 객체 아님, 실제 구현 시 ISO 문자열로 교체 필요** |
| lastActivePoint | ACTIVE 재진입 시 마지막 진행 지점을 기억하는 캐시값 |

#### `posts` — 독서 기록(메모/문장/리뷰)
| 필드 | 설명 |
|---|---|
| id, contentId | PK, FK |
| point | 기록 위치(페이지). `null`이면 지점 미지정 |
| **memoType** | `'QUOTE'`(문장) / `'THOUGHT'`(생각) / `'QUESTION'`(의문점) / `'SUMMARY'`(요약) / `'REVIEW'`(리뷰) — 5종 enum |
| text | QUOTE 타입 전용 "인용문" 필드 |
| review | QUOTE 이외 타입일 때 실제 내용이 들어가는 겸용 "감상" 필드 |
| rating | REVIEW 타입 전용 별점(1~5) |
| spoiler | 작성자가 직접 켠 수동 스포일러 플래그 |
| nickname, mine | 작성자 표시명 / 내 글 여부 |
| likes, comments | 카운트 |
| createdAt | timestamp(ms) |

> ⚠️ **설계 이슈 — text/review 겸용 필드**: QUOTE가 아니면 `text`를 비우고 내용을 전부 `review`에 담습니다. 실제 DB 설계 시 `quote_text`(선택) / `body_text`(선택) / `memo_type` / `rating`으로 명확히 분리를 권장합니다.

#### `collections` — 문장 수집함
| 필드 | 설명 |
|---|---|
| id, title, desc | 메타 |
| author, mine | 작성자 |
| isShared | 공개 여부 (`🔒 비공개` / `📢 공유됨` 배지로 노출) |
| postIds | posts.id 배열 — 정규화 시 별도 조인 테이블(`collection_items`) 분리 권장 |

#### `comments` — 댓글/대댓글 (1-depth)
| 필드 | 설명 |
|---|---|
| postId | FK |
| nickname, text, createdAt | 내용 |
| parentId | `null`=루트 댓글, 값 있으면 그 댓글의 답글 (대댓글의 대댓글은 UI상 미지원) |

### 4.3 관계 다이어그램
```
contents (1) ──< myContent (내 진행 상태, 콘텐츠당 1개)
contents (1) ──< posts (독서 기록, 여러 개)
posts    (1) ──< comments (댓글, 여러 개, 1-depth 대댓글)
posts    (N) ──< collections.postIds >── collections (N:M, 배열로 비정규화됨)
```

---

## 5. 내비게이션 구조

### 5.1 탭 화면 4개
| 탭 | 함수 | 핵심 내용 |
|---|---|---|
| 피드 (feed) | `renderFeed()` | 활성 독서 배너 + 내 기록/커뮤니티 기록 피드, 앱 첫 진입 화면 |
| 서재 (library) | `renderLibrary()` | WANT/ACTIVE/DONE 필터 + 검색, 3열 그리드 도서 목록 |
| 커뮤니티 (community) | `renderCommunity()` | 인기순/최신순 섹션, 정렬·타입 필터 |
| 마이 (my) | `renderMyPage()` | 내 글/서재/컬렉션 서브탭, 통계 진입점 |

### 5.2 오버레이(풀스크린 push) 3개
| 오버레이 | 함수 | 핵심 내용 |
|---|---|---|
| 상세 (detail) | `renderDetail(contentId)` | 바코드 진행률 시각화, MY/COMMUNITY 탭 전환, 상태 토글 |
| 통계 (stats) | `renderStats()` | 서재 수/완독 수/누적 쪽수/기록 수/연속 독서일/평균 별점, 월별 차트, 연간 목표 진행바 |
| 등록 (register) | `renderRegister()` | Kakao API 도서 검색 + 수동 등록 |

### 5.3 모달(바텀시트) 8종
`post`(기록 작성/수정) · `settings`(설정/다크모드) · `notifications`(알림) · `createCollection`(컬렉션 생성) · `changeActiveBook`(대표 읽는 책 변경) · `changeProgress`(진행률 직접 입력) · `selectCollectionForPost`(문장을 컬렉션에 담기) · `addSentenceToCollection`

---

## 6. 화면별 상세 명세

### 6.1 📖 피드 (Feed) — 앱 첫 화면
- 진입 시 자동 렌더링되는 기본 화면
- 고운바탕 명조체 크림 박스 인용구 + 작성자 프로필 + 메모 타입 태그(`✍️ 문장` `💭 생각` `❓ 의문점` `📋 요약` `⭐ 리뷰`)
- 상단 핀 고정 "읽는 책" 배너: 진행률 미니 프로그레스 바 + 실시간 페이지

### 6.2 📚 내 서재 (Library)
- 상단 `＋ 책 추가` 버튼: 앰버 골드 프라이머리 톤(`background: var(--accent); border-radius: 20px`)
- **3열 그리드**(`.book-grid`, `repeat(3, minmax(0, 1fr))`), 긴 제목이 있어도 썸네일 크기 동일하게 칼정렬(`min-width: 0` 적용)
- 상단 100% 세그먼트 컨트롤: `읽고 싶어요` / `읽는 중` / `다 읽었어요`

### 6.3 📖 도서 상세 페이지 & 인터랙티브 바코드
- **진행률/바코드 카드(`.progress-section`)**: `status === 'NONE'`(무선택)일 때는 카드 자체가 숨겨지고, 상태를 선택해야만 노출됨. 카드는 `2px solid #D1D5DB` 테두리, 흰 배경, 소프트 그림자.
- **페이지 수정 모달**: `openProgressModalBtn` → `changeProgress` 모달로 연결. 숫자 입력, range 슬라이더, `+1p/+5p/+10p/+20p` 퀵 버튼.
- **스마트 상태 연동**: 상태가 `DONE`이어도 바코드를 왼쪽으로 드래그해 진행 페이지를 완독 미만으로 조절하면 상태가 자동으로 `ACTIVE`로 전환됨.
- **하단 플로팅 버튼(`#detailNewRecordBtn`)**: 화면 하단 중앙(`bottom: 96px`)에 `✍️ 새 기록 쓰기` FAB.
- **가로형 메타 헤더(`.book-detail-info-card`)**: 프레임리스 플랫 스타일(`backdrop-filter: blur(10px)`), 순서는 장르 배지+제목 → 저자·출판사 → 별점+`👥 N명이 함께 읽고 있습니다` → 설명(좌측 정렬) → 상태 버튼.
- **상태 토글 규칙**: 무선택(Outline) → 클릭 시 즉시 해당 보관함으로 전환 → 같은 버튼 재클릭 시 무선택으로 원복(Toggle-off).
  - 상태별 표시 문구: `📌 보관함`(👥 N명이 보관했습니다) / `📖 읽는 중`(👥 N명이 함께 읽고 있습니다) / `🎉 완독`(👥 N명이 완독했습니다) — 상세 페이지·서재·MY 프로필·토스트 메시지까지 동일 문구로 통일.
- **문장 카드(피드/상세 공통)**: 상단 헤더 = 타입 배지(가장 앞) + 책 제목(14.5px, 800) + 페이지(📍) + 저자·출판사 토글 + 우측 3점 메뉴(`🔖 문장 수집` `📋 문장 복사` `✏️ 수정` `🗑 삭제`). 스포일러/이후 진행 페이지 기록은 블러 없이 **카드 자체가 렌더링되지 않음**. 타입별 포인트 테두리색(문장=브라운, 생각=오렌지, 의문점=크림슨, 요약=포레스트그린, 리뷰=골드).
- **인터랙티브 바코드(`.barcode-wrap`)**:
  - `📝 내 기록` / `💬 커뮤니티 기록` 탭에 따라 표시되는 마커 선이 분리됨
  - 드래그 시 실시간 툴팁(`186p (62%)`) 노출, 손을 떼는 순간 페이지 반영·저장
  - 마커(`.post-mark`) 단독 클릭 → 해당 게시글로 자동 스크롤 + 하이라이트
  - 근접 지점(±4~5%)에 마커 2개 이상 겹치면 `.barcode-overlap-popup`으로 선택 팝업 노출

### 6.4 👤 MY 프로필 & 문장 수집기
- 커버/프로필 헤더, 독서 통계 요약 박스. 알림(🔔) 옆 설정(⚙️) 버튼 → 테마(라이트/다크/시스템) 팝업
- 서브탭 3종:
  - `📝 내 문장`: 최신순/공감순/필터 정렬
  - `📖 내 서재`: 전체 폭 세그먼트 컨트롤(WANT/ACTIVE/DONE)
  - `📁 문장 수집기`: 컬렉션 생성/공유, `🔒 비공개`/`📢 공유됨` 배지 + ⋮ 드롭다운(공유하기/수정하기/삭제하기)

### 6.5 💬 커뮤니티
- 다양한 독자들의 도서별 실시간 기록(인용문/생각/리뷰/의문점) 탐색
- `📝 내 기록`과 동일한 최신순/공감순/필터 정렬바 제공

---

## 7. 모달 및 오버레이 시스템 명세

1. **독서 진행률 설정 모달 (`changeProgress`)**: 숫자 직접 입력, range 슬라이더, `+1p/+5p/+10p/+20p` 퀵 버튼
2. **독서 기록 작성 모달 (`post`)**: 타이틀에 책 제목 직접 표시(`📖 "책 제목" 도서기록`), 인용구/생각/질문/요약/리뷰 타입 선택, 페이지 입력, 스포일러 체크박스, 별점 평가
3. **1:1 인용 카드 스튜디오 (`Card Studio`)**: Canvas API 기반 600×600 정사각형 PNG 생성, 템플릿 변경, 이미지 다운로드
4. **도서 추가 모달 (`registerBook`)**: Kakao API 책 검색 + 수동 등록
5. 그 외: `settings`(설정) · `notifications`(알림) · `createCollection`(컬렉션 생성) · `changeActiveBook`(대표 책 변경) · `selectCollectionForPost` / `addSentenceToCollection`(문장 수집함에 담기)

---

## 8. 핵심 기능 로직 상세 (앱 이식 시 최우선 검토 대상)

### 8.1 진행률/상태 토글 로직 (`updateStatusAndProgress`)
- 선택된 상태 버튼을 다시 누르면 **상태 해제(Toggle-off)** → 무선택(`NONE`)으로 원복.
- ACTIVE 전환 시 `currentPoint`가 0이거나 총량 이상이면 `lastActivePoint`(직전 기억값) 또는 `total × 0.5`로 자동 세팅 — "이어읽기" UX. 이 디테일은 앱에서도 유지해야 함.
- `handlePointChange()`에서 point 값에 따라 상태가 **자동 파생**됨: 0 → WANT, 총량 이상 → DONE, 그 사이 → ACTIVE. 즉 **status는 사실상 currentPoint의 파생값**입니다. 서버 스키마에는 status를 컬럼으로 두더라도, point가 바뀌면 반드시 같이 재계산하는 규칙을 강제해야 합니다.
- 바코드를 드래그해 완독 미만으로 되돌리면 DONE → ACTIVE로 자동 전환됨(6.3절 참고) — 위 규칙과 일관됨.

### 8.2 스포일러 실드 (`isSpoilerFor`)
```
post.point > 내 currentPoint  →  스포일러로 간주 → 카드 자체를 렌더링하지 않음 (블러 아님, 완전 숨김)
```
- 작성자가 수동으로 켜는 `spoiler` 플래그도 별도 존재 — "위치 기반 자동 차단"과 "수동 스포일러 태그"가 별개 로직으로 공존. **수동 스포일러의 "블러 후 탭하여 보기" UI는 현재 프로토타입에 명시적으로 없어** 실제 코딩 시 정책을 새로 정해야 합니다.

### 8.3 바코드 진행률 시각화 (시그니처 기능)
- 드래그 → 진행률(point) 실시간 반영 + 툴팁. 탭 → 근처(±4~5%) 마커 탐색.
  - 마커 1개 → 해당 카드로 자동 스크롤 + 하이라이트
  - 마커 2개 이상 → 겹침 선택 팝업
  - 마커 없음 → 그냥 재렌더(진행률만 갱신)
- 드래그/탭 판정은 이동 거리 임계값(`hasDragged` 플래그)으로 구분 — 앱에서는 `PanResponder`/`Gesture.Pan()`으로 이식하며 **이 임계값을 반드시 유지**해야 오조작이 안 생김.
- **권장**: 순수 SVG 또는 커스텀 뷰로 재구현. 픽셀 좌표 → % 변환 로직은 재사용 가능.

### 8.4 메모 타입 5종 & 입력 폼 분기
- `QUOTE`: 원문 인용 textarea / `REVIEW`: 별점 UI 추가 / 나머지(THOUGHT·QUESTION·SUMMARY): 자유 서술만
- 타입별 placeholder 분리(`getPlaceholderText`) — 앱에서는 `QuoteForm`/`ReviewForm`/`NoteForm` 등 서브폼 컴포넌트 분리를 권장.

### 8.5 커뮤니티/피드 정렬·필터
- 탭마다 독립된 정렬/필터 상태(`commPostSort`, `myPostTypeFilter` 등)를 전역 `state`가 들고 있어 탭 이동 후에도 유지됨. 앱에서 이 값을 화면 진입 시 초기화할지 유지할지 정책을 정해야 합니다.

### 8.6 댓글/좋아요
- 좋아요는 단순 카운트 증가(낙관적 업데이트) — **"누가 눌렀는지" 기록이 없어** 취소/중복 방지가 불가능한 상태. 실제 앱에서는 반드시 좋아요 여부를 별도 필드/테이블로 관리해야 함.
- 댓글은 1-depth 대댓글만 지원 (`parentId`).

### 8.7 Card Studio (인용 카드 이미지 생성)
- Canvas API로 600×600 정사각형 PNG를 실시간 생성, 템플릿 전환 가능, `canvas.toDataURL()`로 다운로드.
- 앱에서는 네이티브 Canvas API가 없으므로 `react-native-view-shot` + 커스텀 뷰 캡처, 또는 서버 사이드 이미지 렌더링(예: Satori/Resvg) 방식 중 선택이 필요합니다.

### 8.8 Kakao Book Search API 연동
- `searchKakaoBooks()` — `dapi.kakao.com/v3/search/book` 호출, 현재 API 키가 소스에 하드코딩(`KakaoAK REST_API_KEY_PRESET`)되어 있음.
- **보안 이슈**: 실제 앱에서는 API 키를 클라이언트에 노출하면 안 되므로 반드시 백엔드를 경유하는 프록시 엔드포인트로 옮겨야 합니다.

---

## 9. 실제 앱 전환 아키텍처 제안 (React Native 기준 예시)

| 프로토타입 요소 | 프로토타입 방식 | 실제 앱 권장 방식 |
|---|---|---|
| 전역 `db` | `localStorage` JSON | 서버 DB(Supabase/Firebase/자체 백엔드) + 클라이언트 캐시(React Query 등) |
| 전역 `state` | 뮤터블 객체 + 수동 `render()` | Zustand/Redux 등 상태관리 + 화면별 지역 `useState` |
| innerHTML 재생성 | 문자열 템플릿 | React 컴포넌트 트리 (PostCard/BookCard/CollectionCard 등 재사용 컴포넌트화) |
| `attachEvents()` 수동 재바인딩 | data-attr 스캔 | React 선언적 이벤트 핸들러(`onPress`)로 대체 — 이 패턴은 통째로 버려도 됨 |
| `overlayStack` | 배열 push/pop | React Navigation `Stack.Navigator` |
| `state.tab` | 문자열 | React Navigation `Tab.Navigator` |
| `state.modal` | 단일 객체 | `Modal` / 바텀시트 라이브러리(`@gorhom/bottom-sheet`) |
| id 생성 `uid()` | `Math.random` 기반 | 서버에서 UUID 발급 (클라이언트 임시 ID는 낙관적 업데이트 전용) |
| 날짜 `'2026.06.14'` 문자열 | 커스텀 포맷 | ISO 8601(`Date`) 저장, 표시 시점에만 포맷팅 |
| XSS 방지 `esc()` | 수동 escape | RN/React는 텍스트 렌더링이 기본적으로 안전 → 앱에서는 불필요 |
| Kakao API 키 하드코딩 | 클라이언트에 직접 노출 | 백엔드 프록시 경유로 전환 필수 |
| Canvas 카드 생성 | 브라우저 `<canvas>` | `react-native-view-shot` 또는 서버 렌더링 |

### 추가로 필요한 것 (프로토타입엔 없는 실제 앱 요소)
- **인증/사용자 계정** (현재는 "나"가 하드코딩된 단일 사용자)
- **이미지 업로드/캐싱** (표지 이미지는 현재 외부 URL 하드코딩)
- **실시간/푸시 알림** (알림 모달은 있으나 실제 트리거 로직 없음)
- **오프라인 대응**: 로컬 캐시 후 동기화 큐
- **페이지네이션/무한스크롤**: 현재 "더보기 버튼" 슬라이스 방식 → 실 서버 연동 시 커서 기반 페이지네이션 필요
- **좋아요 중복 방지 테이블** (8.6절)
- **Kakao API 키 보안 프록시** (8.8절)

---

## 10. 마이그레이션 우선순위 제안

1. **데이터 스키마 확정** — 4장 기준 실 서버 테이블 설계 (특히 `posts.text/review` 필드 분리 여부 우선 결정)
2. **내비게이션 골격** — 탭 4개 + 스택 + 모달 구조를 React Navigation으로 먼저 세팅
3. **바코드 컴포넌트** — 가장 손이 많이 갈 시그니처 기능이므로 독립 컴포넌트로 초기에 분리 개발·테스트 (드래그/탭 판정, 마커 겹침 로직)
4. **작성 폼 분리** — 메모 타입별 서브폼 컴포넌트화
5. **상태 관리 도입** — status가 currentPoint의 파생값이라는 규칙을 selector/computed 레벨로 강제
6. **Card Studio 이식 방식 결정** — 클라이언트 캡처 vs 서버 렌더링
7. **Kakao API 프록시 구축**
8. **인증/서버 연동** — 이후 본격 CRUD를 API로 교체

---

## 11. 최근 변경 이력 (Changelog) — 프로토타입 개선 기록

> 아래는 "현재 스펙"이 아니라 v9.5 시점까지 프로토타입에 반영된 **수정/개선 작업 이력**입니다. 최종 사양은 위 4~8장을 기준으로 삼으세요.

- 하단 플로팅 새 기록 쓰기 FAB, 고가독성 진행률/페이지 대시보드 및 바코드 인터랙션 추가
- 서재 `＋ 책 추가` 버튼을 은은한 스타일 → 앰버 골드 프라이머리 톤으로 개편
- 서재 도서 목록을 2열 → 3열 그리드로 재구성, 긴 제목에도 칼정렬 유지되도록 `min-width: 0` 적용
- `openProgressModalBtn` 이벤트 핸들러의 모달 타입 매핑 오류(`pageProgress` → `changeProgress`) 수정 — 페이지 수정 팝업 정상화
- 다크 모드 상태 칩의 중복 `!important` 구문 제거 후 앰버 골드 배경 & 딥 블랙 텍스트로 고대비 수정
- `.mb-16` 등 유틸리티 클래스의 `!important` 제거로 여백 조정 유연성 확보
- 기록 작성 모달 상단에 책 제목 직접 노출, 중복 책 카드 제거로 모달 세로 공간 최적화