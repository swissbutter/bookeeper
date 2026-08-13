/**
 * Date Formatting Utility for SNS Relative Time (e.g. '방금 전', '5분 전', '2시간 전', '3일 전')
 */

export function formatRelativeTime(dateInput) {
  if (!dateInput) return '방금 전';

  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    const normalized = dateInput.trim().replace(/\./g, '-').replace(' ', 'T');
    date = new Date(normalized);
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    return '방금 전';
  }

  if (isNaN(date.getTime())) {
    return dateInput;
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return '방금 전';
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return '방금 전';
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 30) {
    return `${diffDay}일 전`;
  } else if (diffMonth < 12) {
    return `${diffMonth}달 전`;
  } else {
    return `${diffYear}년 전`;
  }
}
