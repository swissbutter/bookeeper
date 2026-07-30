# 국립중앙도서관 소장자료 검색 Open API 활용 가이드

이 문서는 국립중앙도서관([https://www.nl.go.kr](https://www.nl.go.kr))에서 제공하는 **소장자료 검색 Open API**(`N31101030700.do`)의 사양 분석 및 이를 통한 책 검색·정보 추출 방법을 정리한 가이드입니다.

급된 인증키 정보
62f1bce114b4d69040732ebd7bd954d6490f61fa795c18d53517da91d626fa3d
---

## 1. 개요 및 인증 절차

- **서비스명**: 국립중앙도서관 소장자료 검색 Open API
- **담당 부서**: 정보기술기반과 (02-3483-8843)
- **제공 기능**: 국립중앙도서관 소장 오프라인/온라인 도서, 논문, 고문헌 등 다양한 자료의 서지 정보 및 원문 링크 검색
- **인증 방식**: API 인증키 (`key` 파라미터 필수)
  - **인증키 발급방법**: 
    1. [국립중앙도서관 누리집](https://www.nl.go.kr) 회원가입 및 로그인
    2. `도서관 서비스 > 이용자 > Open API > 인증키 신청/관리` 메뉴에서 발급 신청

---

## 2. API 요청 정보 (Request URL & Methods)

### 기본 요청 Endpoint
```http
GET https://www.nl.go.kr/NL/search/openApi/search.do
```

### 자료 구분별 URL 예시
- **전체/기본 검색**: `https://www.nl.go.kr/NL/search/openApi/search.do`
- **오프라인 자료(소장정보)**: `https://www.nl.go.kr/NL/search/openApi/search.do?systemType=오프라인자료`
- **온라인 자료(디지털화자료)**: `https://www.nl.go.kr/NL/search/openApi/search.do?systemType=온라인자료`
- **정부간행물**: `https://www.nl.go.kr/NL/search/openApi/search.do?govYn=Y`

---

## 3. 요청 파라미터 (Request Parameters)

> ⚠️ **주의사항**: `kwd` (검색어) 또는 상세검색 조건 중 **최소 하나 이상**은 반드시 포함되어야 합니다. (한글 검색어는 URL 인코딩 필수)

| 번호 | 파라미터명 | 타입 / 필수여부 | 기본값 | 설명 및 허용 값 |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `key` | String (**필수**) | - | 발급받은 Open API 인증키 |
| 2 | `pageNum` | Integer (**필수**) | `1` | 조회할 페이지 번호 |
| 3 | `pageSize` | Integer (**필수**) | `10` | 페이지당 출력 건수 |
| 4 | `kwd` | String | - | 검색어 (URL Encoding 필요) |
| 5 | `srchTarget` | String | `total` | 검색 대상 필드<br>- `total`: 전체<br>- `title`: 제목<br>- `author`: 저자<br>- `publisher`: 발행자<br>- `cheonggu`: 청구기호 |
| 6 | `apiType` | String | `xml` | 응답 데이터 형식 (`xml`, `json`) |
| 7 | `systemType` | String | - | 자료 구분 (`오프라인자료`, `온라인자료`) |
| 8 | `category` | String | - | 카테고리 필터링 (`도서`, `고문헌`, `학위논문`, `잡지/학술지`, `신문`, `기사`, `멀티미디어`, `장애인자료`, `외부연계자료`, `웹사이트`, `수집`, `기타`, `해외한국관련자료`) |
| 9 | `sort` | String | 정확도순 | 정렬 기준 (`ititle`: 제목, `iauthor`: 저자, `ipub_year`: 발행년도, `ipublisher`: 발행처, `cheonggu`: 청구기호) |
| 10 | `order` | String | - | 정렬 순서 (`asc`: 오름차순, `desc`: 내림차순) |
| 11 | `licYn` | String | - | 원문 이용 방법 / 저작권 조건 (`N`: 관외이용 무료 등) |
| 12 | `govYn` | String | - | 정부간행물 여부 (`Y`) |
| 13 | `lnbTypeName` | String | - | 멀티미디어/장애인자료 세부 분류 (예: `오디오북`, `점자자료`) |
| 14 | `offerDcode2s` | String | - | 자료제공 DB 분류코드 (예: `CH41`: 고서, `CH45`: 단행자료 등) |

### 상세 검색 (Detail Search) 파라미터
`kwd` 없이 키워드 조합 또는 ISBN으로 직접 검색하고자 할 때 사용합니다. (`kwd`와 상세검색 조건은 혼용 불가능)

- **다중 조건 검색**: `detailSearch=true&f1=title&v1=토지&f2=author&v2=박경리`
- **ISBN 검색**: `detailSearch=true&isbnOp=isbn&isbnCode=9788936433598`

---

## 4. 응답 필드 (Response Fields)

| 번호 | 필드명 (Field) | 타입 | 설명 |
| :---: | :--- | :---: | :--- |
| 1 | `total` | Integer | 전체 검색 결과 건수 |
| 2 | `pageNum` | Integer | 현재 페이지 번호 |
| 3 | `pageSize` | Integer | 페이지당 출력 건수 |
| 4 | `kwd` | String | 요청된 검색어 |
| 5 | `category` | String | 카테고리 |
| 6 | `sort` | String | 정렬 방식 |
| 7 | `title_info` | String | **도서/자료 제목 (표제)** |
| 8 | `author_info` | String | **저자 (저작자) 정보** |
| 9 | `pub_info` | String | **발행자 (출판사)** |
| 10 | `pub_year_info` | String | **발행년도** |
| 11 | `isbn` | String | **ISBN 번호** |
| 12 | `call_no` | String | **청구기호** |
| 13 | `type_name` | String | 자료 유형 (단행본, 논문 등) |
| 14 | `place_info` | String | 소장 위치 (본관 등) |
| 15 | `manage_name` | String | 자료 있는 곳 명칭 |
| 16 | `control_no` | String | 제어번호 (국립중앙도서관 내부 관리 ID) |
| 17 | `id` | String | 종키 (도서 고유 ID) |
| 18 | `doc_yn` | String | 원문 존재 여부 (`Y` / `N`) |
| 19 | `org_link` | String | 원문 링크 URL |
| 20 | `detail_link` | String | 국립중앙도서관 웹사이트 상세페이지 URL |
| 21 | `lic_yn` | String | 저작권 유무 |
| 22 | `lic_text` | String | 저작권 안내 문구 |
| 23 | `reg_date` | String | 도서 등록일 (비치일) |
| 24 | `kdc_code_1s` | String | 동양서 KDC 분류 대분류 코드 |
| 25 | `kdc_name_1s` | String | 동양서 KDC 분류 대분류 명칭 |

---

## 5. 에러 코드 (Error Codes)

API 호출 실패 시 반환되는 메시지 및 코드 목록입니다.

| 에러 코드 | 설명 및 원인 | 조치 방법 |
| :---: | :--- | :--- |
| `000` | SYSTEM ERROR | 국립중앙도서관 서버 내부 오류 |
| `010` | NO KEY VALUE | `key` 파라미터 누락 |
| `011` | INVALID KEY | 유효하지 않거나 만료된 API 키 |
| `012` | DATA LIMIT 500 | 결과 조회 건수 500건 초과 제한 (페이지 조절 필요) |
| `013` | CATEGORY ERROR | 잘못된 카테고리 파라미터 전달 |
| `014` | PARAMETER VALIDATION ERROR | 전달 파라미터 형식 오류 |
| `015` | REQUIRED PARAMETER MISSING | `kwd` 또는 상세검색 파라미터 누락 |
| `101` | SEARCH ERROR | 검색 엔진 서버 응답 실패 |

---

## 6. 사용 언어별 프로그래밍 구현 예제

### 1) cURL (터미널)
```bash
curl -G "https://www.nl.go.kr/NL/search/openApi/search.do" \
  --data-urlencode "key=YOUR_API_KEY" \
  --data-urlencode "kwd=인공지능" \
  --data-urlencode "apiType=json" \
  --data-urlencode "pageNum=1" \
  --data-urlencode "pageSize=10"
```

### 2) Python 예제
```python
import requests

def search_nl_books(api_key: str, keyword: str, page_num: int = 1, page_size: int = 10):
    url = "https://www.nl.go.kr/NL/search/openApi/search.do"
    params = {
        "key": api_key,
        "kwd": keyword,
        "apiType": "json",
        "srchTarget": "total",
        "pageNum": page_num,
        "pageSize": page_size,
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        total_count = data.get("total", 0)
        print(f"검색 결과 총 건수: {total_count}건\n")
        
        # 도서 리스트 출력
        items = data.get("result", [])  # 또는 response 구조에 따른 result 목록
        for idx, book in enumerate(items, 1):
            print(f"[{idx}] {book.get('title_info')}")
            print(f"  - 저자: {book.get('author_info')}")
            print(f"  - 출판사: {book.get('pub_info')} ({book.get('pub_year_info')})")
            print(f"  - ISBN: {book.get('isbn')}")
            print(f"  - 청구기호: {book.get('call_no')}")
            print(f"  - 상세링크: {book.get('detail_link')}\n")
    else:
        print(f"오류 발생: {response.status_code}")

# 실행 예시 (실제 발급받은 API Key로 변경 후 사용)
if __name__ == "__main__":
    API_KEY = "YOUR_API_KEY_HERE"
    search_nl_books(API_KEY, "해리포터")
```

### 3) JavaScript / Node.js (Fetch API) 예제
```javascript
async function searchBooks(apiKey, keyword) {
  const params = new URLSearchParams({
    key: apiKey,
    kwd: keyword,
    apiType: 'json',
    pageNum: '1',
    pageSize: '10'
  });

  const url = `https://www.nl.go.kr/NL/search/openApi/search.do?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`총 검색 건수: ${data.total}`);
    data.result?.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title_info} - ${item.author_info} (${item.pub_info})`);
    });
  } catch (error) {
    console.error('API 호출 중 오류 발생:', error);
  }
}

// searchBooks('YOUR_API_KEY', '파이썬');
```

---

## 7. 책 표지 이미지 (Cover Image) 수집 방법

### 1) 소장자료 검색 API의 제약 사항
본 문서에서 다룬 **소장자료 검색 Open API**(`search.do`)의 응답 결과에는 **표지 이미지 URL 필드가 기본 포함되어 있지 않습니다.**  
따라서 표지 이미지가 필요한 경우 다음과 같은 3가지 방법 중 하나를 병행하여 수집해야 합니다.

---

### 2) 표지 이미지 수집 3가지 방안

#### 방안 1: 국립중앙도서관 'ISBN 서지정보 Open API' 활용 (추천)
국립중앙도서관 서지정보 API(`SearchApi.do`)를 연동하면 **`TITLE_URL`** 필드로 책 표지 이미지 URL을 제공받을 수 있습니다.

- **Endpoint**: `https://www.nl.go.kr/seoji/SearchApi.do`
- **호출 예시**:
  ```http
  GET https://www.nl.go.kr/seoji/SearchApi.do?cert_key=YOUR_KEY&result_style=json&isbn=9788936433598
  ```
- **응답 데이터 주요 필드**:
  - `TITLE_URL`: 책 표지 이미지 URL 주소
  - `BOOK_INTRODUCTION_URL`: 책 소개 URL
  - `BOOK_SUMMARY_URL`: 책 요약 URL

---

#### 방안 2: 상세페이지(`detail_link`) 파싱
소장자료 검색 API 응답에 포함된 `detail_link` (예: `/NL/contents/search.do?schM=detail&id=...`) URL의 HTML 페이지를 웹 크롤링하여 표지 `<img>` 태그의 `src` 속성을 파싱할 수 있습니다.

---

#### 방안 3: 외부 도서 API 연동 (ISBN 기반)
소장자료 검색 API에서 얻은 `isbn` 번호를 기반으로 카카오/네이버/알라딘 도서 API 또는 **도서관 정보나루 API**(`data4library.kr`)에 조회하면 고화질 표지 이미지를 쉽게 가져올 수 있습니다.

- **카카오 도서 API**: `https://dapi.kakao.com/v3/search/book` → `thumbnail` 필드
- **네이버 도서 API**: `https://openapi.naver.com/v1/search/book.json` → `image` 필드
- **도서관 정보나루**: `http://data4library.kr/api/srchDtlList` → `bookImageURL` 필드

---

## 8. 카카오 API vs 도서관 정보나루 API 고화질 표지 비교 수집 전략

카카오 도서 API의 `thumbnail`과 도서관 정보나루 API의 `bookImageURL`을 비교하여 최상의 고화질 표지 이미지를 획득하는 전략입니다.

### 1) 두 API의 표지 이미지 특징 비교

| 비교 항목 | 카카오 도서 API (`thumbnail`) | 도서관 정보나루 API (`bookImageURL`) |
| :--- | :--- | :--- |
| **기본 이미지 크기** | 소형/중형 썸네일 (기본 약 120~174px) | 정보나루 DB 소장 원본 이미지 URL |
| **고화질 변환 팁** | **가능**: Kakao CDN 썸네일 URL 쿼리 파라미터(`R120x174`)를 `R500x0`으로 변경하거나, 원본 이미지 URL(`fname=` 값 디코딩)로 추출 가능 | 제공받은 URL이 원본 해상도 (별도 변환 불필요) |
| **커버리지 (보유율)** | 최신 도서 및 베스트셀러 커버리지 매우 높음 | 전국 공공도서관 소장 도서 위주 (희귀서적/학술서 포함) |

> 💡 **카카오 썸네일 고화질 팁**:  
> 카카오 썸네일 URL 예시:  
> `https://search1.kakaocdn.net/thumb/R120x174.q85/?fname=http%3A%2F%2Ft1.daumcdn.net%2Flbook%2Fimage%2F5389658`  
> - `R120x174` 부분을 **`R500x0`** (가로 500px)으로 바꾸거나  
> - URL의 `fname=` 뒤 원본 URL(`http://t1.daumcdn.net/lbook/image/5389658`)을 추출하면 **고화질 원본 이미지**를 얻을 수 있습니다.

---

### 2) 고화질 표지 수집 및 비교 로직 (Python 예제)

```python
import requests
from urllib.parse import unquote, parse_qs, urlparse

def get_high_res_cover(isbn: str, kakao_api_key: str = None, library_api_key: str = None) -> str:
    """
    ISBN을 기반으로 카카오 API와 도서관 정보나루 API를 비교하여
    최선의 고화질 표지 이미지 URL을 반환하는 함수
    """
    cover_urls = {}

    # 1. 카카오 도서 API 조회 (고화질 변환 포함)
    if kakao_api_key:
        try:
            kakao_url = "https://dapi.kakao.com/v3/search/book"
            headers = {"Authorization": f"KakaoAK {kakao_api_key}"}
            res = requests.get(kakao_url, headers=headers, params={"query": isbn, "target": "isbn"})
            if res.status_code == 200:
                documents = res.json().get("documents", [])
                if documents and documents[0].get("thumbnail"):
                    raw_thumb = documents[0]["thumbnail"]
                    
                    # Kakao CDN 고화질 변환 (fname 파라미터 추출 또는 R500x0 변경)
                    if "fname=" in raw_thumb:
                        parsed = urlparse(raw_thumb)
                        fname = parse_qs(parsed.query).get("fname", [None])[0]
                        if fname:
                            cover_urls["kakao_original"] = unquote(fname)
                    
                    # 파라미터 변경 방식 (가로 500px 고화질)
                    high_res_thumb = raw_thumb.replace("R120x174", "R500x0")
                    cover_urls["kakao_hd"] = high_res_thumb
        except Exception as e:
            print(f"카카오 API 호출 오류: {e}")

    # 2. 도서관 정보나루 API 조회 (bookImageURL)
    if library_api_key:
        try:
            lib_url = "http://data4library.kr/api/srchDtlList"
            params = {
                "authKey": library_api_key,
                "isbn13": isbn,
                "format": "json"
            }
            res = requests.get(lib_url, params=params)
            if res.status_code == 200:
                detail = res.json().get("response", {}).get("detail", [])
                if detail:
                    book_img = detail[0].get("book", {}).get("bookImageURL")
                    if book_img and "no_img" not in book_img:
                        cover_urls["library_naru"] = book_img
        except Exception as e:
            print(f"도서관 정보나루 API 호출 오류: {e}")

    # 3. 우선순위에 따른 최적 URL 선택
    # 카카오 원본 > 도서관 정보나루 > 카카오 HD 썸네일 순
    final_cover = (
        cover_urls.get("kakao_original") or 
        cover_urls.get("library_naru") or 
        cover_urls.get("kakao_hd") or 
        "표지 이미지 없음"
    )
    
    return final_cover

# 사용 예시
# cover = get_high_res_cover("9788936433598", kakao_api_key="YOUR_KAKAO_KEY", library_api_key="YOUR_NARU_KEY")
# print("최종 선정된 표지 이미지 URL:", cover)
```

---

## 9. 구글 책 검색 (Google Books API) 백업 연동 및 통합 파이프라인

다른 서비스(국립중앙도서관, 카카오, 도서관 정보나루)에서 도서 정보나 표지 이미지를 찾지 못했을 때, **구글 책 검색 API (Google Books API)**를 최종 백업(Fallback) 소스로 기술 통합하는 가이드입니다.

### 1) 구글 책 검색 API 기술 사양

- **Endpoint**: `https://www.googleapis.com/books/v1/volumes`
- **호출 방법**:
  - ISBN 검색: `GET https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}`
  - 키워드 검색: `GET https://www.googleapis.com/books/v1/volumes?q={search_keyword}`
- **인증 방식**: API 키 없이도 일별 기본 쿼터 사용 가능 (API 키 추가 시 쿼터 확대: `&key=YOUR_GOOGLE_API_KEY`)
- **표지 이미지 데이터 위치**:  
  `items[0].volumeInfo.imageLinks`
  - `extraLarge` > `large` > `medium` > `small` > `thumbnail` > `smallThumbnail`

> 💡 **Google Books 표지 이미지 고화질 처리 팁**:  
> 구글 API에서 반환하는 썸네일 URL 예시:  
> `http://books.google.com/books/content?id=...&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`  
> - `http://` → `https://` 로 변경 (보안 및 혼합 콘텐츠 오류 방지)  
> - `zoom=1` → **`zoom=0`** (고화질 확대)  
> - `&edge=curl` 파라미터 제거 (책 장식 효과 제거)

---

### 2) 전체 멀티소스 통합 수집 파이프라인 (Unified Multi-Source Pipeline)

```
[1단계: 도서 검색] ───> 국립중앙도서관 API (기본 서지정보 확보: 제목, 저자, ISBN 등)
                             │
                             ▼
[2단계: 표지 1차 비교] ───> 카카오 API (고화질 변환) ↔ 도서관 정보나루 API (bookImageURL)
                             │ (표지 미발견 시)
                             ▼
[3단계: 최종 백업] ───> 구글 책 API (Google Books API - zoom=0 고화질 처리)
```

---

### 3) 기술 통합 완성형 파이프라인 (Python 코드 예제)

```python
import requests
from urllib.parse import unquote, parse_qs, urlparse

class UnifiedBookSearcher:
    def __init__(self, nl_key: str = None, kakao_key: str = None, naru_key: str = None, google_key: str = None):
        self.nl_key = nl_key
        self.kakao_key = kakao_key
        self.naru_key = naru_key
        self.google_key = google_key

    def search_book_with_cover(self, keyword: str) -> dict:
        """
        1. 국립중앙도서관 API로 기본 도서 정보 검색
        2. ISBN을 추출하여 카카오 -> 정보나루 -> 구글 순으로 고화질 표지 탐색
        3. 도서 정보가 아예 없을 경우 구글 책 API로 백업 검색
        """
        book_info = {
            "title": None,
            "author": None,
            "publisher": None,
            "isbn": None,
            "cover_url": None,
            "source": None
        }

        # Step 1: 국립중앙도서관 API 검색
        if self.nl_key:
            nl_url = "https://www.nl.go.kr/NL/search/openApi/search.do"
            params = {"key": self.nl_key, "kwd": keyword, "apiType": "json", "pageSize": 1, "pageNum": 1}
            try:
                res = requests.get(nl_url, params=params, timeout=5)
                if res.status_code == 200:
                    data = res.json()
                    items = data.get("result", [])
                    if items:
                        item = items[0]
                        book_info["title"] = item.get("title_info")
                        book_info["author"] = item.get("author_info")
                        book_info["publisher"] = item.get("pub_info")
                        book_info["isbn"] = item.get("isbn")
                        book_info["source"] = "국립중앙도서관"
            except Exception as e:
                print(f"[NL API 오류] {e}")

        # Step 2: ISBN이 확보되면 고화질 표지 탐색 (카카오 -> 정보나루 -> 구글)
        isbn = book_info.get("isbn")
        if isbn:
            book_info["cover_url"] = self._fetch_cover_by_isbn(isbn)

        # Step 3: 국립중앙도서관에서 도서를 못 찾거나, 표지가 없는 경우 구글 책 API로 백업 검색
        if not book_info["title"] or not book_info["cover_url"]:
            google_data = self._search_google_books(isbn if isbn else keyword)
            if google_data:
                if not book_info["title"]:
                    book_info["title"] = google_data.get("title")
                    book_info["author"] = google_data.get("author")
                    book_info["publisher"] = google_data.get("publisher")
                    book_info["source"] = "Google Books (백업)"
                if not book_info["cover_url"]:
                    book_info["cover_url"] = google_data.get("cover_url")

        return book_info

    def _fetch_cover_by_isbn(self, isbn: str) -> str:
        """카카오 -> 도서관 정보나루 -> 구글 책 API 순으로 표지 검색"""
        
        # 1) 카카오 API
        if self.kakao_key:
            try:
                res = requests.get(
                    "https://dapi.kakao.com/v3/search/book",
                    headers={"Authorization": f"KakaoAK {self.kakao_key}"},
                    params={"query": isbn, "target": "isbn"},
                    timeout=3
                )
                if res.status_code == 200:
                    docs = res.json().get("documents", [])
                    if docs and docs[0].get("thumbnail"):
                        raw_thumb = docs[0]["thumbnail"]
                        if "fname=" in raw_thumb:
                            parsed = urlparse(raw_thumb)
                            fname = parse_qs(parsed.query).get("fname", [None])[0]
                            if fname:
                                return unquote(fname)
                        return raw_thumb.replace("R120x174", "R500x0")
            except Exception:
                pass

        # 2) 도서관 정보나루 API
        if self.naru_key:
            try:
                res = requests.get(
                    "http://data4library.kr/api/srchDtlList",
                    params={"authKey": self.naru_key, "isbn13": isbn, "format": "json"},
                    timeout=3
                )
                if res.status_code == 200:
                    detail = res.json().get("response", {}).get("detail", [])
                    if detail:
                        img = detail[0].get("book", {}).get("bookImageURL")
                        if img and "no_img" not in img:
                            return img
            except Exception:
                pass

        # 3) 구글 책 API (최종 백업)
        google_res = self._search_google_books(f"isbn:{isbn}")
        if google_res and google_res.get("cover_url"):
            return google_res["cover_url"]

        return None

    def _search_google_books(self, query: str) -> dict:
        """구글 책 API 조회 및 고화질 이미지 처리"""
        try:
            url = f"https://www.googleapis.com/books/v1/volumes?q={query}"
            if self.google_key:
                url += f"&key={self.google_key}"
            
            res = requests.get(url, timeout=5)
            if res.status_code == 200:
                items = res.json().get("items", [])
                if items:
                    v_info = items[0].get("volumeInfo", {})
                    img_links = v_info.get("imageLinks", {})
                    
                    # 이미지 URL 고화질 변환 처리
                    raw_cover = (
                        img_links.get("extraLarge") or
                        img_links.get("large") or
                        img_links.get("medium") or
                        img_links.get("small") or
                        img_links.get("thumbnail") or
                        img_links.get("smallThumbnail")
                    )
                    
                    hd_cover = None
                    if raw_cover:
                        hd_cover = raw_cover.replace("http://", "https://").replace("&zoom=1", "&zoom=0").replace("&edge=curl", "")

                    return {
                        "title": v_info.get("title"),
                        "author": ", ".join(v_info.get("authors", [])),
                        "publisher": v_info.get("publisher"),
                        "cover_url": hd_cover
                    }
        except Exception as e:
            print(f"[Google Books API 오류] {e}")
        return None

# 실행 가이드
# searcher = UnifiedBookSearcher(
#     nl_key="NL_KEY",
#     kakao_key="KAKAO_KEY",
#     naru_key="NARU_KEY",
#     google_key="GOOGLE_KEY"  # 선택사항
# )
# result = searcher.search_book_with_cover("파이썬 클린코드")
# print(result)
```



