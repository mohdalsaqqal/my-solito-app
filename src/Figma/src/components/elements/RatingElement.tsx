function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path d="M8 0L6 6H0L5 10L3 16L8 12L13 16L11 10L16 6H10L8 0Z" fill="rgb(var(--color-mint))" />
      <path d="M8 0L6 6H0L5 10L3 16L8 12L13 16L11 10L16 6H10L8 0Z" fill="rgb(var(--color-ink))" fillOpacity="0.35" />
    </svg>
  );
}

export default function RatingElement() {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon key={index} />
      ))}
    </div>
  );
}
