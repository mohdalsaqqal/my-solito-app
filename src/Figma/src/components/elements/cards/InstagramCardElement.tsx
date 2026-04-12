type InstagramCardElementProps = {
  imageSrc: string;
  showOverlay?: boolean;
};

function InstagramGlyph({ dark = false }: { dark?: boolean }) {
  const tone = dark ? 'rgb(var(--color-fg))' : 'rgb(var(--color-surface))';
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke={tone} strokeWidth="1.7" aria-hidden>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.8" fill={tone} stroke="none" />
    </svg>
  );
}

export default function InstagramCardElement({ imageSrc, showOverlay = false }: InstagramCardElementProps) {
  return (
    <div className="relative h-60 w-60 overflow-hidden">
      <img src={imageSrc} alt="Instagram post" className="h-full w-full object-cover" />

      {showOverlay ? (
        <>
          <div className="absolute inset-0 bg-mint opacity-60" />
          <div className="absolute inset-0 grid place-items-center">
            <InstagramGlyph />
          </div>
        </>
      ) : null}
    </div>
  );
}
