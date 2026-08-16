/**
 * Hangul Decomposer & Typing Analytics Utility
 * Handles Hangul Jamo breakdown and accurate WPM/CPM/Accuracy calculations
 */

const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

const DOUBLE_JONGSUNG_MAP = {
  'ㄳ': ['ㄱ'],
  'ㄵ': ['ㄴ'],
  'ㄶ': ['ㄴ'],
  'ㄺ': ['ㄹ'],
  'ㄻ': ['ㄹ'],
  'ㄼ': ['ㄹ'],
  'ㄽ': ['ㄹ'],
  'ㄾ': ['ㄹ'],
  'ㄿ': ['ㄹ'],
  'ㅀ': ['ㄹ'],
  'ㅄ': ['ㅂ']
};

const COMPOUND_JUNGSUNG_MAP = {
  'ㅘ': ['ㅗ'],
  'ㅙ': ['ㅗ'],
  'ㅚ': ['ㅗ'],
  'ㅝ': ['ㅜ'],
  'ㅞ': ['ㅜ'],
  'ㅟ': ['ㅜ'],
  'ㅢ': ['ㅡ'],
  'ㅐ': ['ㅏ'],
  'ㅔ': ['ㅓ'],
  'ㅒ': ['ㅑ'],
  'ㅖ': ['ㅕ']
};

/**
 * Decomposes a Hangul character into Jamo count (e.g. '한' -> 3, '가' -> 2)
 */
export function getCharStrokeCount(char) {
  const code = char.charCodeAt(0);
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const index = code - HANGUL_START;
    const cho = Math.floor(index / 588);
    const jung = Math.floor((index % 588) / 28);
    const jong = index % 28;
    return 2 + (jong > 0 ? 1 : 0);
  }
  return 1;
}

/**
 * Calculates total stroke/keystroke count for a given text
 */
export function getTotalKeystrokes(text) {
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    count += getCharStrokeCount(text[i]);
  }
  return count;
}

/**
 * Computes typing statistics (CPM, WPM, Accuracy, Error count)
 */
export function calculateTypingStats(targetText, typedText, elapsedTimeSeconds) {
  if (!elapsedTimeSeconds || elapsedTimeSeconds <= 0) {
    return { cpm: 0, wpm: 0, accuracy: 100, errors: 0 };
  }

  let correctStrokes = 0;
  let totalTypedStrokes = 0;
  let errors = 0;

  const minLen = Math.min(targetText.length, typedText.length);

  for (let i = 0; i < minLen; i++) {
    const targetChar = targetText[i];
    const typedChar = typedText[i];
    const charStrokes = getCharStrokeCount(targetChar);

    totalTypedStrokes += getCharStrokeCount(typedChar);

    if (targetChar === typedChar) {
      correctStrokes += charStrokes;
    } else {
      errors++;
    }
  }

  // Handle over-typed characters as errors
  if (typedText.length > targetText.length) {
    errors += (typedText.length - targetText.length);
  }

  const minutes = elapsedTimeSeconds / 60;
  const cpm = Math.round(correctStrokes / minutes);
  const wpm = Math.round(cpm / 5); // Standard 5 strokes = 1 word

  const totalEvaluated = Math.max(1, typedText.length);
  const accuracy = Math.max(0, Math.round(((totalEvaluated - errors) / totalEvaluated) * 100));

  return {
    cpm: isNaN(cpm) ? 0 : cpm,
    wpm: isNaN(wpm) ? 0 : wpm,
    accuracy,
    errors
  };
}

/**
 * Decomposes a character into Hangul Jamo components ({ cho, jung, jong })
 */
export function decomposeHangulChar(char) {
  if (!char) return { cho: '', jung: '', jong: '' };
  const code = char.charCodeAt(0);
  if (code >= HANGUL_START && code <= HANGUL_END) {
    const index = code - HANGUL_START;
    const choIndex = Math.floor(index / 588);
    const jungIndex = Math.floor((index % 588) / 28);
    const jongIndex = index % 28;
    return {
      cho: CHOSUNG[choIndex] || '',
      jung: JUNGSUNG[jungIndex] || '',
      jong: JONGSUNG[jongIndex] || ''
    };
  }
  if (CHOSUNG.includes(char)) {
    return { cho: char, jung: '', jong: '' };
  }
  return { cho: char, jung: '', jong: '' };
}

/**
 * Converts target and typed text into real-time visual tokens supporting Hangul IME composition
 */
export function getDisplayTokens(target, typed) {
  if (!typed) {
    return target.split('').map((char, idx) => ({
      char,
      status: idx === 0 ? 'current' : 'default'
    }));
  }

  let expandedTyped = [];
  for (let i = 0; i < typed.length; i++) {
    const tChar = typed[i];
    const targetChar = target[expandedTyped.length];
    const nextTargetChar = target[expandedTyped.length + 1];

    if (targetChar && tChar !== targetChar) {
      const decompT = decomposeHangulChar(tChar);
      const decompTarget = decomposeHangulChar(targetChar);

      // Only split if targetChar has no 받침 (jongsung) AND tChar's jongsung matches nextTargetChar's chosung
      if (decompT.jong && decompT.cho && decompT.jung && !decompTarget.jong && nextTargetChar) {
        const decompNextTarget = decomposeHangulChar(nextTargetChar);
        if (decompT.cho === decompTarget.cho && decompT.jung === decompTarget.jung && decompT.jong === decompNextTarget.cho) {
          const choIdx = CHOSUNG.indexOf(decompT.cho);
          const jungIdx = JUNGSUNG.indexOf(decompT.jung);
          if (choIdx !== -1 && jungIdx !== -1) {
            const baseChar = String.fromCharCode(HANGUL_START + (choIdx * 588) + (jungIdx * 28));
            expandedTyped.push(baseChar);
            expandedTyped.push(decompT.jong);
            continue;
          }
        }
      }
    }
    expandedTyped.push(tChar);
  }

  const tokens = [];
  let hasCurrentToken = false;

  for (let i = 0; i < target.length; i++) {
    const targetChar = target[i];

    if (i < expandedTyped.length) {
      const typedChar = expandedTyped[i];
      const isLastTyped = (i === expandedTyped.length - 1);

      if (typedChar === targetChar) {
        tokens.push({ char: typedChar, status: 'correct' });
      } else if (isLastTyped) {
        const decompT = decomposeHangulChar(typedChar);
        const decompTarget = decomposeHangulChar(targetChar);

        const choMatch = decompT.cho && (decompT.cho === decompTarget.cho);
        const jungMatch = !decompT.jung || 
                          (decompT.jung === decompTarget.jung) || 
                          (COMPOUND_JUNGSUNG_MAP[decompTarget.jung] && COMPOUND_JUNGSUNG_MAP[decompTarget.jung].includes(decompT.jung));
        const jongMatch = !decompT.jong || 
                          (decompT.jong === decompTarget.jong) || 
                          (DOUBLE_JONGSUNG_MAP[decompTarget.jong] && DOUBLE_JONGSUNG_MAP[decompTarget.jong].includes(decompT.jong));

        if (choMatch && jungMatch && jongMatch) {
          tokens.push({ char: typedChar, status: 'current' });
          hasCurrentToken = true;
        } else {
          tokens.push({ char: targetChar, status: 'incorrect' });
        }
      } else {
        tokens.push({ char: targetChar, status: 'incorrect' });
      }
    } else if (i === expandedTyped.length && !hasCurrentToken) {
      tokens.push({ char: targetChar, status: 'current' });
      hasCurrentToken = true;
    } else {
      tokens.push({ char: targetChar, status: 'default' });
    }
  }

  return tokens;
}
