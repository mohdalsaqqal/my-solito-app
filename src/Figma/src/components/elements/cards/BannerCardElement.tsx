type BannerCardElementProps = {
  imageSrc: string;
  heading: string;
  subheading: string;
};

export default function BannerCardElement({ imageSrc, heading, subheading }: BannerCardElementProps) {
  return (
    <article className="relative h-[200px] sm:h-[280px] md:h-[350px] w-full max-w-[840px] overflow-hidden rounded-lg bg-surface">
      <img src={imageSrc} alt={heading} className="h-full w-full object-cover" />
      {/* Gradient scrim for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" aria-hidden />

      <div className="absolute left-[60px] top-[60px]">
        <p className="w-[400px] font-poppins text-[26px] leading-8 text-white">{subheading}</p>
        <p className="mt-6 w-[400px] font-poppins text-[34px] font-semibold leading-10 tracking-[0.0025em] text-white">
          {heading}
        </p>
        <button
          type="button"
          className="mt-8 inline-flex h-12 w-[150px] items-center justify-center rounded-lg bg-mint font-poppins text-base font-semibold text-white shadow-elevation-04"
        >
          Shop Now
        </button>
      </div>
    </article>
  );
}
