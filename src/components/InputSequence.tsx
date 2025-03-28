import React from 'react';
import { InputPath } from '../types';

interface InputSequenceProps {
  sequences: InputPath[];
  targetText: string;
  currentStep: number;
  currentCharIndex: number;
}


const dakutenReverseMap: Record<string, Record<string, string>> = {
  'か': { '゛': 'が' }, 'き': { '゛': 'ぎ' }, 'く': { '゛': 'ぐ' }, 'け': { '゛': 'げ' }, 'こ': { '゛': 'ご' },
  'さ': { '゛': 'ざ' }, 'し': { '゛': 'じ' }, 'す': { '゛': 'ず' }, 'せ': { '゛': 'ぜ' }, 'そ': { '゛': 'ぞ' },
  'た': { '゛': 'だ' }, 'ち': { '゛': 'ぢ' }, 'つ': { '゛': 'づ' }, 'て': { '゛': 'で' }, 'と': { '゛': 'ど' },
  'は': { '゛': 'ば', '゜': 'ぱ' }, 'ひ': { '゛': 'び', '゜': 'ぴ' },
  'ふ': { '゛': 'ぶ', '゜': 'ぷ' }, 'へ': { '゛': 'べ', '゜': 'ぺ' }, 'ほ': { '゛': 'ぼ', '゜': 'ぽ' },
  'カ': { '゛': 'ガ' }, 'キ': { '゛': 'ギ' }, 'ク': { '゛': 'グ' }, 'ケ': { '゛': 'ゲ' }, 'コ': { '゛': 'ゴ' },
  'サ': { '゛': 'ザ' }, 'シ': { '゛': 'ジ' }, 'ス': { '゛': 'ズ' }, 'セ': { '゛': 'ゼ' }, 'ソ': { '゛': 'ゾ' },
  'タ': { '゛': 'ダ' }, 'チ': { '゛': 'ヂ' }, 'ツ': { '゛': 'ヅ' }, 'テ': { '゛': 'デ' }, 'ト': { '゛': 'ド' },
  'ハ': { '゛': 'バ', '゜': 'パ' }, 'ヒ': { '゛': 'ビ', '゜': 'ピ' },
  'フ': { '゛': 'ブ', '゜': 'プ' }, 'ヘ': { '゛': 'ベ', '゜': 'ペ' }, 'ホ': { '゛': 'ボ', '゜': 'ポ' }
};


const getCurrentText = (sequences: InputPath[], currentStep: number): string => {
  let text = '';
  let stepCount = 0;
  let lastBaseChar = '';

  for (let i = 0; i < sequences.length; i++) {
    const sequence = sequences[i];
    const sequenceStepCount = stepCount + sequence.actions.length;

    if (sequence.char === 'END') {
      continue;
    }

    if (sequenceStepCount > currentStep) {
      const actionIndex = currentStep - stepCount - 1;
      if (actionIndex >= 0 && sequence.actions[actionIndex] === 'A') {
        if (sequence.char === '゛' || sequence.char === '゜') {
          if (lastBaseChar && dakutenReverseMap[lastBaseChar]?.[sequence.char]) {
            text = text.slice(0, -1) + dakutenReverseMap[lastBaseChar][sequence.char];
          }
        } else {
          text += sequence.char;
          lastBaseChar = sequence.char;
        }
      }
      break;
    } else {
      const lastAction = sequence.actions[sequence.actions.length - 1];
      if (lastAction === 'A') {
        if (sequence.char === '゛' || sequence.char === '゜') {
          if (lastBaseChar && dakutenReverseMap[lastBaseChar]?.[sequence.char]) {
            text = text.slice(0, -1) + dakutenReverseMap[lastBaseChar][sequence.char];
          }
        } else {
          text += sequence.char;
          lastBaseChar = sequence.char;
        }
      }
    }
    stepCount = sequenceStepCount;
  }

  return text;
};

export const InputSequence: React.FC<InputSequenceProps> = ({
  sequences,
  targetText,
  currentStep,
  currentCharIndex
}) => {
  const currentText = getCurrentText(sequences, currentStep);

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '18px',
        fontFamily: 'monospace'
      }}>
        <div style={{ marginBottom: '8px' }}>Target: {targetText}</div>
        <div>Current: {currentText}<span style={{ animation: 'blink 1s infinite' }}>|</span></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sequences.map((sequence, index) => {
          const displayChar = sequence.char;
          const stepCount = sequences.slice(0, index).reduce((sum, seq) => sum + seq.actions.length, 0);
          const isCurrentSequence = index === currentCharIndex;

          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '8px',
              padding: '8px',
              backgroundColor: isCurrentSequence ? '#e3f2fd' : 'white',
              borderRadius: '4px',
              transition: 'background-color 0.3s'
            }}>
              <span style={{
                marginRight: '8px',
                fontWeight: 'bold',
                minWidth: '2em',
                fontFamily: 'monospace'
              }}>
                {displayChar}:
              </span>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {sequence.actions.map((action, actionIndex) => {
                  const isCurrentAction = stepCount + actionIndex === currentStep;
                  const isCompleted = stepCount + actionIndex < currentStep;
                  return (
                    <span
                      key={actionIndex}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: isCurrentAction ? '#2196f3' : isCompleted ? '#a5d6a7' : '#e3f2fd',
                        color: isCurrentAction ? 'white' : 'black',
                        borderRadius: '4px',
                        fontSize: '14px',
                        transition: 'all 0.3s'
                      }}
                    >
                      {action}
                    </span>
                  );
                })}
              </div>
              <span style={{ marginLeft: 'auto', color: '#666' }}>
                {sequence.actions.length} steps
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ color: '#666' }}>
        Total steps: {sequences.reduce((sum, seq) => sum + seq.actions.length, 0)}
      </div>
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}; 
