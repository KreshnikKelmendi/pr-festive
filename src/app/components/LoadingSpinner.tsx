interface LoadingSpinnerProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-[3px]',
  lg: 'h-14 w-14 border-4',
};

export default function LoadingSpinner({
  label,
  size = 'md',
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-[#367a3b]/20 border-t-[#367a3b]`}
        role="status"
        aria-label={label || 'Duke u ngarkuar'}
      />
      {label && (
        <p className="text-sm font-medium text-[#367a3b] animate-pulse">{label}</p>
      )}
    </div>
  );
}
