import { useEffect, useState } from 'react';

interface SimpleCountdownProps {
  initialSeconds: number;
  onComplete?: () => void;
  onTick?: (secondsLeft: number) => void;
  className?: string;
  showProgress?: boolean;
}

const SimpleCountdown: React.FC<SimpleCountdownProps> = ({
  initialSeconds,
  onComplete,
  onTick,
  className = '',
  showProgress = false
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        const newSeconds = secondsLeft - 1;
        setSecondsLeft(newSeconds);
        if (onTick) {
          onTick(newSeconds);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [secondsLeft, onComplete, onTick]);

  // Reset countdown when initialSeconds changes
  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  const progress = showProgress ? ((initialSeconds - secondsLeft) / initialSeconds) * 100 : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showProgress && (
        <div className="w-8 h-8 relative">
          <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="16"
              cy="16"
              r="14"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
              className="text-blue-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">{secondsLeft}</span>
          </div>
        </div>
      )}
      
      <span className="text-sm font-medium text-gray-600">
        {secondsLeft > 0 ? `${secondsLeft}s` : '0s'}
      </span>
    </div>
  );
};

export default SimpleCountdown;
