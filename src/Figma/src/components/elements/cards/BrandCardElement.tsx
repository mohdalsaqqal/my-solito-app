type BrandCardElementProps = {
  firstImageSrc: string;
  secondImageSrc: string;
};

export default function BrandCardElement({ firstImageSrc, secondImageSrc }: BrandCardElementProps) {
  return (
    <article className="w-[324px]">
      <div className="space-y-2 rounded-md border border-dashed border-accent p-2">
        <div className="h-[195px] overflow-hidden rounded-lg">
          <img src={firstImageSrc} alt="Brand card 1" className="h-full w-full object-cover" />
        </div>
        <div className="h-[195px] overflow-hidden rounded-lg">
          <img src={secondImageSrc} alt="Brand card 2" className="h-full w-full object-cover" />
        </div>
      </div>
    </article>
  );
}
