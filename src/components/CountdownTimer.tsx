import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  variant?: 'default' | 'festival' | 'sale';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  variant = 'default',
  size = 'md',
  className = '',
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete]);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'gap-2',
      box: 'p-2 min-w-[60px]',
      number: 'text-lg',
      label: 'text-xs'
    },
    md: {
      container: 'gap-3',
      box: 'p-3 min-w-[70px]',
      number: 'text-2xl',
      label: 'text-sm'
    },
    lg: {
      container: 'gap-4',
      box: 'p-4 min-w-[80px]',
      number: 'text-3xl',
      label: 'text-sm'
    }
  };

  // Variant configurations
  const variantConfig = {
    default: {
      box: 'bg-gray-100 text-gray-900',
      number: 'text-gray-900',
      label: 'text-gray-600'
    },
    festival: {
      box: 'bg-white bg-opacity-30 text-black',
      number: 'text-black font-bold',
      label: 'text-black'
    },
    sale: {
      box: 'bg-red-100 text-red-900',
      number: 'text-red-900 font-bold',
      label: 'text-red-600'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  if (isExpired) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-red-600">
          Time's Up!
        </div>
      </div>
    );
  }

  return (
    <div className={`flex justify-center ${currentSize.container} ${className}`}>
      <div className={`${currentVariant.box} rounded-lg text-center ${currentSize.box}`}>
        <div className={`${currentSize.number} ${currentVariant.number}`}>
          {timeLeft.days}
        </div>
        <div className={`${currentSize.label} ${currentVariant.label}`}>
          Days
        </div>
      </div>
      
      <div className={`${currentVariant.box} rounded-lg text-center ${currentSize.box}`}>
        <div className={`${currentSize.number} ${currentVariant.number}`}>
          {timeLeft.hours}
        </div>
        <div className={`${currentSize.label} ${currentVariant.label}`}>
          Hours
        </div>
      </div>
      
      <div className={`${currentVariant.box} rounded-lg text-center ${currentSize.box}`}>
        <div className={`${currentSize.number} ${currentVariant.number}`}>
          {timeLeft.minutes}
        </div>
        <div className={`${currentSize.label} ${currentVariant.label}`}>
          Minutes
        </div>
      </div>
      
      <div className={`${currentVariant.box} rounded-lg text-center ${currentSize.box}`}>
        <div className={`${currentSize.number} ${currentVariant.number}`}>
          {timeLeft.seconds}
        </div>
        <div className={`${currentSize.label} ${currentVariant.label}`}>
          Seconds
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;