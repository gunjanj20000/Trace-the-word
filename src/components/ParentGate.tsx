import React, { useState, useEffect, useRef } from 'react';
import { ParentGateType } from '../types';
import { Lock, X, Check } from 'lucide-react';

interface ParentGateProps {
  gateType: ParentGateType;
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ParentGate: React.FC<ParentGateProps> = ({
  gateType,
  isOpen,
  onSuccess,
  onCancel,
}) => {
  // Math challenge state
  const [num1, setNum1] = useState(7);
  const [num2, setNum2] = useState(6);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // Hold challenge state
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimerRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  // Re-generate challenge when modal opens
  useEffect(() => {
    if (isOpen) {
      if (gateType === 'none') {
        onSuccess();
        return;
      }
      const n1 = Math.floor(Math.random() * 8) + 5; // 5 to 12
      const n2 = Math.floor(Math.random() * 7) + 4; // 4 to 10
      setNum1(n1);
      setNum2(n2);
      setMathAnswer('');
      setMathError(false);
      setHoldProgress(0);
      setIsHolding(false);
    }
  }, [isOpen, gateType, onSuccess]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        cancelAnimationFrame(holdTimerRef.current);
      }
    };
  }, []);

  if (!isOpen || gateType === 'none') return null;

  // Handle Math Submission
  const handleMathSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const expected = num1 + num2;
    if (parseInt(mathAnswer.trim(), 10) === expected) {
      onSuccess();
    } else {
      setMathError(true);
      setMathAnswer('');
      setTimeout(() => setMathError(false), 1200);
    }
  };

  // Handle Hold
  const startHold = () => {
    setIsHolding(true);
    holdStartTimeRef.current = Date.now();

    const update = () => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / 3000) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        setIsHolding(false);
        onSuccess();
      } else {
        holdTimerRef.current = requestAnimationFrame(update);
      }
    };

    holdTimerRef.current = requestAnimationFrame(update);
  };

  const cancelHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) {
      cancelAnimationFrame(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">Parent Gate</h2>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {gateType === 'hold' ? (
          <div className="flex flex-col items-center">
            <p className="text-slate-600 mb-6 text-lg">
              Press and hold the button for <strong>3 seconds</strong> to open Parent Settings.
            </p>

            {/* Circular Hold Button */}
            <div className="relative flex items-center justify-center my-4">
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="#0284c7"
                  strokeWidth="10"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * holdProgress) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-75"
                />
              </svg>

              <button
                type="button"
                onPointerDown={startHold}
                onPointerUp={cancelHold}
                onPointerLeave={cancelHold}
                onContextMenu={(e) => e.preventDefault()}
                className={`absolute w-32 h-32 rounded-full font-bold text-lg flex flex-col items-center justify-center transition-all select-none shadow-lg active:scale-95 ${
                  isHolding
                    ? 'bg-sky-600 text-white shadow-sky-300'
                    : 'bg-sky-500 hover:bg-sky-600 text-white'
                }`}
              >
                <Lock className="w-8 h-8 mb-1" />
                <span>{isHolding ? `${Math.round(holdProgress)}%` : 'HOLD'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-400 mt-4">
              Keep holding until the ring completes
            </p>
          </div>
        ) : (
          <form onSubmit={handleMathSubmit} className="flex flex-col items-center">
            <p className="text-slate-600 mb-2 text-base">
              Please solve this quick problem to verify you are a parent:
            </p>

            <div className="my-5 text-3xl font-extrabold text-sky-700 bg-sky-50 py-4 px-8 rounded-2xl border border-sky-100">
              {num1} + {num2} = ?
            </div>

            <div className="flex gap-2 w-full max-w-xs mb-4">
              <input
                type="number"
                pattern="[0-9]*"
                autoFocus
                value={mathAnswer}
                onChange={(e) => setMathAnswer(e.target.value)}
                placeholder="Answer"
                className={`w-full text-center text-2xl font-bold py-3 px-4 rounded-2xl border-2 outline-none transition ${
                  mathError
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : 'border-slate-200 focus:border-sky-500 bg-slate-50'
                }`}
              />
              <button
                type="submit"
                className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold flex items-center justify-center shadow-md active:scale-95 transition"
              >
                <Check className="w-6 h-6" />
              </button>
            </div>

            {mathError && (
              <p className="text-sm font-semibold text-rose-500 animate-shake">
                Incorrect answer. Please try again!
              </p>
            )}
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700 text-base font-semibold px-6 py-2 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
