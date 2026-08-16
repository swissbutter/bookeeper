/**
 * Date Formatting Utility for SNS Relative Time (e.g. '방금 전', '5분 전', '2시간 전', '3일 전', '8월 12일')
 */

export function parseDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return null;

    // 1. Direct standard Date parse (handles ISO strings like 2026-08-12T16:16:51.044Z)
    let d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    // 2. Normalize dot-separated date strings (e.g. "2026.08.12" -> "2026-08-12")
    const normalized = trimmed.replace(/(\d{4})\.(\d{1,2})\.(\d{1,2})/, '$1-$2-$3').replace(' ', 'T');
    d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export function formatRelativeTime(dateInput) {
  const date = parseDate(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : '방금 전';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return '방금 전';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return '방금 전';
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else {
    // 7일 이상 지나면 SNS 스타일로 날짜 표기 (올해면 M월 D일, 다른 해면 YYYY.MM.DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (year === now.getFullYear()) {
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    }
    return `${year}.${month}.${day}`;
  }
}

export function formatDate(dateInput, format = 'YYYY.MM.DD') {
  const date = parseDate(dateInput);
  if (!date) return typeof dateInput === 'string' ? dateInput : '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (format === 'YYYY.MM.DD') return `${year}.${month}.${day}`;
  if (format === 'YYYY년 M월 D일') return `${year}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (format === 'M월 D일') return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  if (format === 'YYYY.MM.DD HH:mm') return `${year}.${month}.${day} ${hours}:${minutes}`;
  return `${year}.${month}.${day}`;
}

