const dakutenMap: Record<string, [string, string]> = {
  'が': ['か', '゛'], 'ぎ': ['き', '゛'], 'ぐ': ['く', '゛'], 'げ': ['け', '゛'], 'ご': ['こ', '゛'],
  'ざ': ['さ', '゛'], 'じ': ['し', '゛'], 'ず': ['す', '゛'], 'ぜ': ['せ', '゛'], 'ぞ': ['そ', '゛'],
  'だ': ['た', '゛'], 'ぢ': ['ち', '゛'], 'づ': ['つ', '゛'], 'で': ['て', '゛'], 'ど': ['と', '゛'],
  'ば': ['は', '゛'], 'び': ['ひ', '゛'], 'ぶ': ['ふ', '゛'], 'べ': ['へ', '゛'], 'ぼ': ['ほ', '゛'],
  'ぱ': ['は', '゜'], 'ぴ': ['ひ', '゜'], 'ぷ': ['ふ', '゜'], 'ぺ': ['へ', '゜'], 'ぽ': ['ほ', '゜'],
  'ガ': ['カ', '゛'], 'ギ': ['キ', '゛'], 'グ': ['ク', '゛'], 'ゲ': ['ケ', '゛'], 'ゴ': ['コ', '゛'],
  'ザ': ['サ', '゛'], 'ジ': ['シ', '゛'], 'ズ': ['ス', '゛'], 'ゼ': ['セ', '゛'], 'ゾ': ['ソ', '゛'],
  'ダ': ['タ', '゛'], 'ヂ': ['チ', '゛'], 'ヅ': ['ツ', '゛'], 'デ': ['テ', '゛'], 'ド': ['ト', '゛'],
  'バ': ['ハ', '゛'], 'ビ': ['ヒ', '゛'], 'ブ': ['フ', '゛'], 'ベ': ['ヘ', '゛'], 'ボ': ['ホ', '゛'],
  'パ': ['ハ', '゜'], 'ピ': ['ヒ', '゜'], 'プ': ['フ', '゜'], 'ペ': ['ヘ', '゜'], 'ポ': ['ホ', '゜']
};

const isHiragana = (char: string): boolean => {
  return /^[ぁ-ゖ]$/.test(char);
};

const isKatakana = (char: string): boolean => {
  return /^[ァ-ヶ]$/.test(char);
};

export const decomposeTextWithMode = (text: string, initialIsHiragana: boolean): { chars: string[], modes: boolean[] } => {
  const result: string[] = [];
  const modes: boolean[] = [];
  let currentIsHiragana = initialIsHiragana;

  for (const char of text) {
    const decomposed = dakutenMap[char];
    const chars = decomposed ? [decomposed[0], decomposed[1]] : [char];

    for (const c of chars) {
      if (c === '゛' || c === '゜' || c === 'ー' || c === ' ' || c === 'ED') {
        result.push(c);
        modes.push(currentIsHiragana);
        continue;
      }

      const charIsHiragana = isHiragana(c);
      const charIsKatakana = isKatakana(c);

      if ((charIsHiragana && !currentIsHiragana) || (charIsKatakana && currentIsHiragana)) {
        currentIsHiragana = !currentIsHiragana;
      }

      result.push(c);
      modes.push(currentIsHiragana);
    }
  }

  return { chars: result, modes: modes };
}; 
