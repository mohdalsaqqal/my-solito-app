import { IconArrowRight } from '../../designSystem';

type CategoryPillProps = {
  imageSrc: string;
  title: string;
  itemsLabel: string;
  active?: boolean;
};

function CategoryPill({ imageSrc, title, itemsLabel, active = false }: CategoryPillProps) {
  return (
    <div className="flex h-[140px] items-center justify-center rounded-[100px] bg-surface px-[30px] shadow-elevation-02">
      <div className="flex w-[258px] items-center justify-between">
        <div className="grid h-20 w-20 place-items-center rounded-full">
          <img src={imageSrc} alt={title} className="h-20 w-20 rounded-full object-cover" />
        </div>

        <div className="flex w-[158px] items-center justify-between">
          <div>
            <p className="font-poppins text-base font-semibold leading-6 tracking-[0.005em] text-fg">{title}</p>
            <p className="font-poppins text-sm leading-5 tracking-[0.0025em] text-muted">{itemsLabel}</p>
          </div>

          <div
            className={`grid h-6 w-6 place-items-center rounded-3xl ${
              active
                ? 'bg-mint text-white shadow-elevation-04'
                : 'bg-mint/20 text-fg'
            }`}
          >
            <IconArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

type CategoriesCardElementProps = {
  firstImageSrc: string;
  secondImageSrc: string;
};

export default function CategoriesCardElement({ firstImageSrc, secondImageSrc }: CategoriesCardElementProps) {
  return (
    <article className="w-[334px] space-y-2 rounded-md border border-dashed border-accent p-2">
      <CategoryPill imageSrc={firstImageSrc} title="Sunscreen" itemsLabel="14 Items" />
      <CategoryPill imageSrc={secondImageSrc} title="Sunscreen" itemsLabel="14 Items" active />
    </article>
  );
}
