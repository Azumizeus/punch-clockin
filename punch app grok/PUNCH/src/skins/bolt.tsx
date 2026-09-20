export function Bolt({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path fill="currentColor" d="M18.4 3.2 8.6 16.8h6.1l-2.2 12 11.6-16.1h-6.4L18.4 3.2Z" />
    </svg>
  );
}
