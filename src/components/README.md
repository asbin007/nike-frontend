# Countdown Components

This directory contains reusable countdown components for the Nike Frontend application.

## Components

### 1. CountdownTimer

A comprehensive countdown timer component with multiple variants and sizes.

#### Props

- `targetDate: Date` - The target date/time for the countdown
- `onComplete?: () => void` - Callback function when countdown reaches zero
- `variant?: 'festival' | 'otp' | 'simple'` - Visual style variant (default: 'simple')
- `showLabels?: boolean` - Whether to show time unit labels (default: true)
- `className?: string` - Additional CSS classes
- `size?: 'sm' | 'md' | 'lg'` - Size of the countdown (default: 'md')

#### Variants

- **festival**: Glassmorphism style with white text on gradient background
- **otp**: Clean style with gray background for OTP-related countdowns
- **simple**: Basic white background with gray text

#### Sizes

- **sm**: Small countdown (60px boxes, text-xl)
- **md**: Medium countdown (80px boxes, text-2xl)
- **lg**: Large countdown (100px boxes, text-4xl)

#### Usage

```tsx
import CountdownTimer from '../components/CountdownTimer';

// Festival countdown
<CountdownTimer
  targetDate={new Date('2025-10-02T00:00:00')}
  variant="festival"
  size="lg"
  onComplete={() => console.log('Festival started!')}
/>

// Simple countdown
<CountdownTimer
  targetDate={new Date('2025-12-31T23:59:59')}
  variant="simple"
  size="md"
/>
```

### 2. SimpleCountdown

A lightweight countdown component for simple timer needs (like OTP resend).

#### Props

- `initialSeconds: number` - Starting number of seconds
- `onComplete?: () => void` - Callback when countdown reaches zero
- `onTick?: (secondsLeft: number) => void` - Callback on each second tick
- `className?: string` - Additional CSS classes
- `showProgress?: boolean` - Whether to show circular progress indicator

#### Usage

```tsx
import SimpleCountdown from '../components/SimpleCountdown';

// Basic countdown
<SimpleCountdown
  initialSeconds={60}
  onComplete={() => setCanResend(true)}
/>

// With progress indicator
<SimpleCountdown
  initialSeconds={30}
  showProgress={true}
  onTick={(seconds) => console.log(`${seconds} seconds left`)}
/>
```

## Implementation Examples

### Festival Countdown (Collections Page)

```tsx
// Calculate target date based on festival dates
const [targetDate, setTargetDate] = useState<Date>(new Date());

useEffect(() => {
  const now = new Date();
  let newTargetDate: Date;
  
  if (now < festivalDates.dashain.start) {
    newTargetDate = festivalDates.dashain.start;
  } else if (now < festivalDates.dashain.tika) {
    newTargetDate = festivalDates.dashain.tika;
  } else {
    newTargetDate = festivalDates.dashain.end;
  }
  
  setTargetDate(newTargetDate);
}, []);

// Use in JSX
<CountdownTimer
  targetDate={targetDate}
  variant="festival"
  size="lg"
  className="max-w-4xl mx-auto"
/>
```

### OTP Resend Countdown (Register Page)

```tsx
const [countdown, setCountdown] = useState(0);

const handleResendOtp = async () => {
  if (countdown > 0) return;
  
  // Send OTP logic
  setCountdown(60); // Start 60-second countdown
};

const handleCountdownComplete = () => {
  setCountdown(0);
};

// Use in JSX
{countdown > 0 ? (
  <SimpleCountdown
    initialSeconds={countdown}
    onComplete={handleCountdownComplete}
    className="text-gray-400"
  />
) : (
  'Resend OTP'
)}
```

## Features

- **Real-time updates**: Updates every second automatically
- **Responsive design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Performance optimized**: Cleans up timers on unmount
- **Customizable**: Multiple variants and sizes
- **TypeScript support**: Full type safety

## Styling

Both components use Tailwind CSS classes and can be customized with additional className props. The components are designed to be consistent with the overall design system of the application.

## Performance Notes

- Components automatically clean up timers when unmounted
- Use `useCallback` for onComplete and onTick functions to prevent unnecessary re-renders
- For high-frequency updates, consider debouncing the onTick callback
