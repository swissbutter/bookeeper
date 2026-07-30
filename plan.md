# 📖 문장수집가 (Sentence Collector) — 웹/앱 개발 종합 계획서 및 명세서 (`plan.md`)

> **버전**: v11.5 (카카오 & 구글 책 동시 검색 엔진, 고화질 썸네일 필터링 & UI 명세 최신화)
> **소스 파일**: `disign.html` (Pure Vanilla JS SPA, 약 5,500줄)
> **최종 업데이트**: 2026년 7월 26일
> **📌 앱 명칭**: 본 프로젝트의 공식 명칭은 **"문장수집가 (Sentence Collector)"**입니다.

---

## 목차
1. 프로젝트 개요 & 핵심 콘셉트
2. 기술 아키텍처 및 구현 방식 (현재 프로토타입 기준)
3. 디자인 시스템 & UI/UX 원칙
4. 데이터 모델 (State & Mock DB 스키마)
5. 내비게이션 구조 (탭 / 오버레이 / 모달)
6. 화면별 상세 명세
7. 모달 및 오버레이 시스템 명세
8. 핵심 기능 로직 상세 (멀티소스 도서 동시 검색 & 고화질 표지 수집 파이프라인)
9. 실제 앱 전환 아키텍처 제안
10. 마이그레이션 우선순위
11. 최근 변경 이력 (Changelog) — 프로토타입 및 기술 명세 개선 기록

---

## 1. 프로젝트 개요 & 핵심 콘셉트

- **앱 명칭**: **문장수집가 (Sentence Collector)** — *"책 속의 빛나는 문장을 수집하고 나만의 감성을 기록하다"*
- **핵심 목표**: 독자가 책을 읽으며 감명 받은 문장, 생각, 질문, 요약, 리뷰를 자유롭게 기록하고, 나만의 문장 수집함(컬렉션)을 관리하며 1:1 감성 인용 카드로 제작해 공유하는 **통합 독서 큐레이션 & SNS 애플리케이션**.
- **핵심 가치**:
  - **멀티소스 동시 도서 검색 엔진**: 카카오 도서 API + 구글 책 API (`AIzaSyCgW1mJzTjmA6n1MY-3fQMAjuYEHAG4ZDY`) 동시 호출(`Promise.allSettled`) 및 고화질 표지 자동 매칭
  - 국립중앙도서관 Open API는 추후 승인 후 추가 연동 예정
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
| **External API (Multi-Source)** | **멀티소스 도서 동시 검색 & 고화질 표지 엔진** | 1. **카카오 도서 API** (`dapi.kakao.com`): 1차 국내 도서 및 썸네일 고화질 파싱 (`R500x0` / `fname=` 원본 추출)<br>2. **구글 책 API (Google Books)** (`googleapis.com/books/v1`): **동시 병열 검색** (`Promise.allSettled`), 고화질 표지 (`zoom=0`), **표지 없는 데이터 자동 필터링** (`filter(b => !!b.thumbnail)`) <br>3. **국립중앙도서관 / 도서관정보나루**: 승인 후 3차 확장 연동 예정 |

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
4. **스포일러 자동 블라인드**: 내 진행 지점보다 뒤쪽(`point > curPoint`) 기록은 카드 자체가 렌더링되지 않고 완전히 숨겨짐.
5. **유틸리티 클래스**: `.mb-16 { margin-bottom: 16px; }` 등 유연한 여백 조정 클래스.

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

### 4.2 Mock DB 스키마 (5개 컬렉션)

#### `contents` — 콘텐츠(책) 마스터
| 필드 | 타입 | 설명 |
|---|---|---|
| id | string | PK |
| type | string | 현재는 `'BOOK'`만 사용 |
| title, creator, publisher | string | 제목/저자/출판사 |
| cover | string\|null | 표지 이미지 URL (멀티소스 고화질 추출 결과) |
| coverBg | string | 표지 없을 때 대체 배경색 |
| genre | string | 장르 |
| isbn | string | ISBN 번호 (10자리/13자리) |
| **totalPoint** | number | 총 분량(총 페이지 수) — 진행률 계산의 분모 |
| rating, readerCount | number | 평균 평점, 읽은 사람 수 |

#### `myContent` — 내 서재(읽기 상태)
| 필드 | 설명 |
|---|---|
| contentId | contents FK |
| status | `'WANT'`(보관함) / `'ACTIVE'`(읽는 중) / `'DONE'`(완독) / **`'NONE'`(무선택, 기본값)** |
| currentPoint | 현재까지 읽은 지점 (0 ~ totalPoint) |
| startDate / finishDate | 문자열 날짜 |
| lastActivePoint | ACTIVE 재진입 시 마지막 진행 지점을 기억하는 캐시값 |

#### `posts` — 독서 기록
#### `collections` — 문장 수집함
#### `comments` — 댓글/대댓글 (1-depth)

---

## 5. 내비게이션 구조

### 5.1 탭 화면 4개 (feed, library, community, my)
### 5.2 오버레이 3개 (detail, stats, register)
### 5.3 모달 8종 (post, settings, notifications, createCollection, changeActiveBook, changeProgress, selectCollectionForPost, addSentenceToCollection)

---

## 6. 화면별 상세 명세

### 6.6 ➕ 도서 등록 & 멀티소스 동시 책 검색 연동 (Register Overlay & Modal)
- **UI 탭 명칭 개편**:
  - `🔍 책 검색` 탭 (기존 '카카오 책 검색'에서 변경)
  - `✏️ 추가 입력` 탭 (기존 '직접 입력'에서 변경)
- **동시 비동기 책 검색 (`fetchMultiSourceBooks`)**:
  - 카카오 도서 API와 구글 책 API를 `Promise.allSettled`로 **동시에 병렬 요청**.
  - 구글 북스 결과 중 **표지 이미지(썸네일)가 없는 데이터는 자동으로 제외** (`filter(b => !!b.thumbnail)`).
  - ISBN 및 제목 기준 **스마트 중복 제거** 후 통합 검색 리스트 노출.
- **검색 출처 태그 표시**:
  - 검색 항목별로 **`[카카오 책]`**, **`[구글 북스]`** 출처 태그 구분 노출.
- **폼 자동 완성(Auto-fill)**:
  - 결과 항목 선택 시 제목, 저자, 출판사, 고화질 표지 URL이 `✏️ 추가 입력` 탭 폼에 즉시 자동 바인딩.

---

## 7. 모달 및 오버레이 시스템 명세

1. **독서 진행률 설정 모달 (`changeProgress`)**
2. **독서 기록 작성 모달 (`post`)**
3. **1:1 인용 카드 스튜디오 (`Card Studio`)**
4. **도서 추가 모달 (`registerBook`) / 등록 오버레이 (`register`)**: `🔍 책 검색` 및 `✏️ 추가 입력` 탭 뷰 구성, 동시 책 검색 및 출처 태그(`[카카오 책]`, `[구글 북스]`) 명세 반영

---

## 8. 핵심 기능 로직 상세

### 8.8 멀티소스 도서 동시 검색 & 고화질 표지 수집 엔진 명세

#### 8.8.1 동시 API 요청 및 결과 병합 로직 (`fetchMultiSourceBooks`)
```javascript
// 카카오 & 구글 동시에 비동기 요청 처리 (Promise.allSettled)
const results = await Promise.allSettled([kakaoPromise, googlePromise]);

// 구글 북스는 썸네일 있는 자료만 필터링
const googleBooks = (results[1].status === 'fulfilled' ? results[1].value : []).filter(b => !!b.thumbnail);

// 중복 제거 및 스마트 병합 (ISBN / 제목 기준)
```

#### 8.8.2 출처 태그 및 표지 고화질 튜닝 규격
- **카카오 책 (`카카오 책`)**: `fname=` 디코딩 또는 `R500x0` 고화질 변환
- **구글 북스 (`구글 북스`)**: `imageLinks` 내 최고 화질 추출, **엑스박스/기본 대체 이미지(`img=0`, `no_cover`, `placeholder`, `nophoto`) 및 15자 미만 무효 URL 필터링** (`filter(b => b.thumbnail && b.thumbnail.trim().length > 15)`)
- **검색 우선 도서 등록 프로세스 (`🔍 책 검색 > ✏️ 추가 입력`)**: 책 등록 진입 시 탭 전환 없이 **`🔍 책 검색` 화면만 전면에 표출**하여 사용자가 반드시 도서를 검색하도록 유도하며, 검색 결과에서 도서를 **선택(클릭)한 시점에만 해당 도서의 정보가 채워진 `✏️ 추가 입력` 화면으로 순차 전환** 및 등록 완료 진행
- **우리들만의 전용 마스터 DB 도서 독립 저장 (`db.contents`)**: 서비스 사용자가 등록하거나 가져온 모든 도서는 **우리들만의 전용 마스터 DB 저장소 (`db.contents`)**에 독립적으로 기록 및 보관되어, 외부 API 의존 없이 전체 유저가 공용 도서 데이터베이스로 검색하고 공유 및 재활용 가능
- **사이트 내부 DB 도서 최우선 검색 & 원클릭 내 서재 담기 (`등록 도서`)**: 누군가 이미 우리 전용 DB에 등록한 도서(`db.contents`)가 검색어와 일치(ISBN 또는 제목 기준)하는 경우, 검색 결과 **최상단에 `[등록 도서]` 태그로 노출**하며, 해당 항목 클릭 시 **별도 폼 수정 절차 없이 즉시 내 서재('읽는 중')로 담아** 도서 상세 화면으로 직행 안내
- **미사용 등록 도서 자동 DB 삭제 (`cleanupUnusedBook`)**: 서재에서 도서를 삭제하거나 독서 상태를 해제했을 때, 해당 도서를 보관/읽고 있거나 남긴 독서 기록이 남아있는 다른 유저가 아무도 없으면 **`db.contents`에서도 해당 도서를 자동으로 완전히 삭제**하여 DB를 깨끗하게 유지
- **ISBN 정보 영구 보존 및 매칭 (`isbn`)**: 도서 등록 시 수집된 ISBN 정보를 `isbn` 필드로 저장하여, 향후 동일한 ISBN으로 검색 시 기존 등록 도서를 정확하게 매칭하고 재활용
- **도서 메타 데이터 표출 및 세분화된 카테고리 17종 규격 (`creator`, `publisher`, `genre`)**:
  - **표출 양식**: 책 상세 화면 및 컨텐츠 영역에서 별도 강조/배지 없이 은은한 회색의 일반 텍스트 **`저자 이름 · 출판사 이름 · 장르`** (중간점 구분) 형식으로 깔끔하게 표출
  - **세분화 카테고리 17종 표준**: `소설`, `시/에세이`, `인문학`, `철학/사상`, `역사/세계사`, `사회/정치/법`, `경제/경영/재테크`, `자기계발`, `자연/과학/공학`, `IT/컴퓨터/AI`, `예술/대중문화`, `종교/영성`, `건강/취미/여행`, `청소년/아동`, `만화/웹툰`, `외국어/학습`, `기타`
- **책 정보 수정 전체페이지 전환 & 표지 URL 변경/히스토리 복구 시스템 (`db.bookHistory`)**:
  - **전체 페이지 심플 레이아웃 오버레이**: `class="card"` 감싸는 형태의 박스 테두리를 없애고 전체 화면 구조로 시원하게 퍼지도록 개편
  - **좌측 전면 큼직한 표지 썸네일 배치**: `표지 이미지` 항목에서 큼직한 표지 썸네일 상자(`76px × 106px`, 섀도우)를 **URL 입력 필드의 앞쪽(왼쪽)에 배치**하여 시각적 직관성을 강화하고 원래 표지 URL이 자동 연결
  - **추가/수정 입력 폼 내 제목/저자/출판사 수정 불가 고정**: 책 추가 입력 및 수정 시 도서 정보 보전을 위해 `제목`, `저자`, `출판사` 항목은 **수정 불가 읽기 전용(`readonly disabled`, 🔒 안내)**으로 엄격히 고정
  - **ISBN 번호 숨김 및 입력 폼 관리 규격**: 책 상세 화면 및 포스트 카드 컨텐츠 영역에서는 시각적 정돈을 위해 **ISBN 번호를 가리고 `저자 · 출판사 · 장르`** 형식으로만 깔끔하게 표출하며, 등록/수정 입력 폼 내에서만 백엔드 관리용 고정 메타 정보로 보여짐
  - **완독자 10명 이상 도서 수정 완전 차단**: 도서를 완독한 독자가 **10명 이상(`COMPLETED >= 10`)**인 도서는 집단 지성 보호 및 도서 정보 안정성을 위해 수정을 클릭하더라도 진입을 차단하고 폼 입력을 비활성화 (`🔒 완독한 독자가 10명 이상인 도서는 수정을 하실 수 없습니다.`)
  - **수정 권한 검증**: 사용자가 본인 서재에 등록하고 읽고(보관 포함) 있는 책만 수정할 수 있도록 엄격한 권한 체크 (`db.myContent.some(m => m.contentId === c.id)`)
- **9단계 독서 등급제 & 칭호 로드맵 시스템 (`getUserTierInfo`)**:
  - **초기 기본 상태**: 책 등록 이력이 없거나 완독 책이 없을 때 **`등급 없음`** 표출
  - **🌱 프론티어 (Frontier)**: 책을 서재에 **등록(추가)**한 유저에게 즉시 부여
  - **🥉 브론즈 (Bronze)**: 완독 **3권 이상**
  - **🥈 실버 (Silver)**: 완독 **10권 이상**
  - **🥇 골드 (Gold)**: 완독 **20권 이상**
  - **💎 플래티넘 (Platinum)**: 완독 **50권 이상**
  - **❇️ 에메랄드 (Emerald)**: 완독 **100권 이상**
  - **💎 다이아몬드 (Diamond)**: 완독 **200권 이상**
  - **👑 마스터 (Master)**: 완독 **300권 이상**
  - **🔥 챌린저 (Challenger)**: 완독 **500권 이상**
  - **프로필 내 등급마크 팝업 표출**: 프로필 중간의 복잡한 등급 달성치 카드를 제거하여 심플하게 정리하고, '나의 독서 일지' 우측의 **`[🌱 프론티어]` 마크를 클릭 시 전체 9단계 등급표 안내 모달 팝업**을 띄워 깔끔한 내 등급 요약 카드(`현재 내 등급`, `완독 N권 달성`) 및 정갈한 전체 등급표 제공 지원

---

## 9. 실제 앱 전환 아키텍처 제안
- 백엔드 프록시 라우트 (`GET /api/v1/books/search`)에서 카카오 + 구글 책 API 병렬 처리 및 응답 반환.

---

## 10. 마이그레이션 우선순위 제안
1. 멀티소스 도서 동시 검색 백엔드 API 구축
2. 데이터 스키마 확정 (ISBN, 고화질 표지 URL 포함)
3. React Navigation 내비게이션 골격 세팅

---

## 11. 최근 변경 이력 (Changelog) — 프로토타입 및 기술 명세 개선 기록

- **v11.5 (2026.07.26)**: **책 정보 수정 전체페이지 전환, 수정 히스토리/복구 및 레이아웃 최신화**
  - 책 정보 수정 화면을 팝업 모달에서 **전체 페이지 오버레이 화면(`✏️ 책 정보 수정`)**으로 전면 개편.
  - `[취소]` 및 `[수정 완료]` 버튼 하단에 **`📜 책 정보 수정 히스토리`** 리스트(**`수정 내역 / 작성인 / 날짜 / ↺ 이 버전으로 복구`**) 배치 및 과거 버전 원클릭 폼 복구 기능 구축.
  - 본인이 서재에 등록하고 읽고 있는 책만 수정 가능한 **책 정보 수정 권한 검증** 유지.
  - 카카오 도서 API와 구글 책 API (`AIzaSyCgW1mJzTjmA6n1MY-3fQMAjuYEHAG4ZDY`)를 `Promise.allSettled` 기반으로 **동시 병렬 검색**하도록 업그레이드.
  - 도서 상세 헤더 및 컨텐츠 영역에서 **`✍️ 작가 이름 / 🏢 출판사 / 🏷️ 카테고리`**가 각각 독립된 항목으로 직관적 표출되도록 레이아웃 개편.
  - 서재 삭제 및 독서 상태 해제 시 더 이상 해당 책을 읽거나 남긴 기록이 없는 미사용 도서는 **`db.contents`에서 자동 삭제(`cleanupUnusedBook`)** 처리.
  - 도서 등록 시 **ISBN(`isbn`) 및 수집 출처(`sourceProvider`)를 DB에 영구 기록**하여 동일 ISBN 검색 시 등록 도서 최우선 매칭.
  - 우리 사이트에 이미 누군가 등록한 책(`db.contents`)을 **최우선 검색하여 결과 최상단에 `[등록 도서]` 배지 노출**하고, **동일 도서의 외부 API 중복 검색 결과를 완전 제거(지움)**.
  - 구글 북스 검색 결과 중 **기본 대체 이미지(`img=0`, `no_cover`, `placeholder`, `nophoto`) 및 표지 미보유 데이터 정밀 검증 필터링** 적용.
  - 도서 원본 요약 설명 데이터 전량 보존 및 상세 화면 **기본 120자 표출 + 흑백 `더보기 ▼` / `접기 ▲` 토글** 기능 도입.
  - UI 탭 명칭 개편: `🔍 카카오 책 검색` ➔ **`🔍 책 검색`**, `✏️ 직접 입력` ➔ **`✏️ 추가 입력`**.
  - 검색 항목 출처 태그명 변경: `카카오` ➔ **`카카오 책`**, `Google Books` ➔ **`구글 북스`**, `사이트 DB` ➔ **`등록 도서`**.
  - 국립중앙도서관 API는 향후 승인 시 추가 연동 슬롯으로 배치.
- **v11.0 (2026.07.26)**: 멀티소스 도서 검색 & 고화질 표지 수집 엔진 기술 통합 명세 작성.
- **v10.5 (2026.07.25)**: 카카오 책 검색 API 기반 도서 추가 명세 추가 & 앱 명칭 "문장수집가 (Sentence Collector)" 확정.
