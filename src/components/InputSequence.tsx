import React from 'react';
import { InputPath } from '../types';
import { DAKUTEN_REVERSE_MAP } from '../utils/constants';

interface StateHistory {
  position: { x: number; y: number };
  isHiragana: boolean;
  charIndex: number;
  action: string | null;
  inputChar: string | null;
}

interface InputSequenceProps {
  sequences: InputPath[];
  currentStep: number;
  currentCharIndex: number;
  stateHistory: StateHistory[];
}

const getCurrentText = (stateHistory: StateHistory[]): string => {
  let text = '';
  let lastChar = '';

  // stateHistoryからAアクションの入力文字と削除操作を追跡
  for (let i = 0; i < stateHistory.length; i++) {
    const state = stateHistory[i];

    if (state.action === 'B') {
      // Bボタンで削除操作
      if (text.length > 0) {
        text = text.substring(0, text.length - 1);
        // 最後の文字も更新
        lastChar = text.length > 0 ? text[text.length - 1] : '';
      }
    } else if (state.action === 'A' && state.inputChar) {
      // 濁点・半濁点の処理
      if (state.inputChar === '゛' || state.inputChar === '゜') {
        // 最後の文字に濁点・半濁点を適用できるかチェック
        if (lastChar && DAKUTEN_REVERSE_MAP[lastChar]?.[state.inputChar]) {
          // 最後の文字を濁点・半濁点付きの文字に置き換える
          text = text.substring(0, text.length - 1) + DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
          lastChar = DAKUTEN_REVERSE_MAP[lastChar][state.inputChar];
        }
        // 適用できない場合は何もしない
      } else {
        // EDは終了ボタンなので表示しない
        if (state.inputChar !== 'ED' && state.inputChar !== 'けってい') {
          // かな/カナ切り替えボタンも表示しない
          if (state.inputChar !== 'かな' && state.inputChar !== 'カナ') {
            text += state.inputChar;
            lastChar = state.inputChar;
          }
        }
      }
    }
  }

  return text;
};

export const InputSequence: React.FC<InputSequenceProps> = ({
  sequences,
  currentStep,
  currentCharIndex,
  stateHistory
}) => {
  const currentText = getCurrentText(stateHistory);

  const formatText = (text: string) => {
    const lines = text.match(/.{1,16}/g) || [];
    return lines.join('\n');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        fontSize: '18px',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}
        className="sequence-display">
        <div>{formatText(currentText)}<span style={{ animation: 'blink 1s infinite' }}>|</span></div>
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
            }}
              className={`sequence-item ${isCurrentSequence ? 'current' : ''}`}>
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
                      className={`action-step ${isCurrentAction ? 'current' : ''} ${isCompleted ? 'completed' : ''}`}
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
          @media (prefers-color-scheme: dark) {
            .sequence-display {
              background-color: #2a2a2a !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .sequence-item {
              background-color: #333 !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .sequence-item.current {
              background-color: #1e3a5f !important;
            }
            .action-step {
              background-color: #1e3a5f !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }
            .action-step.current {
              background-color: #4a90e2 !important;
              color: white !important;
            }
            .action-step.completed {
              background-color: #2d5f3e !important;
              color: white !important;
            }
            .sequence-item span {
              color: rgba(255, 255, 255, 0.7) !important;
            }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
}; 
