import { sephoraAssets } from '../assets/sephoraAssets';
import { Layer } from '../ui/layer';
import { SectionHeading, ShopNowButton } from './atoms';

const brandNames = ['NIVEA', 'Hada Labo', 'innisfree', 'Simple', 'SOME BY MI', 'tarte'];

export const BrandShowcaseSection = () => {
  return (
    <section className="bg-bg py-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 lg:grid-cols-[1fr_1.6fr] lg:px-6">
        <Layer depth="e04" tone="soft" className="group relative overflow-hidden rounded-[10px] p-8">
          <img src={sephoraAssets.brandShowcase.hero} alt="Curology cleanser" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-transparent transition duration-500 group-hover:from-black/62" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_32%)]" />
          <div className="relative z-10 max-w-[320px] space-y-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">Brand spotlight</p>
            <h3 className="font-display text-[clamp(2rem,3vw,3.4rem)] leading-[0.95] tracking-[-0.05em]">Curology Micro-Foam Cleanser</h3>
            <p className="text-sm leading-6 text-white/85">A department-store spotlight on cleansing formulas, barrier care, and gentle daily essentials.</p>
            <ShopNowButton className="border-white/25 bg-white/10 text-white hover:border-white hover:bg-white hover:text-fg" />
          </div>
        </Layer>

        <Layer depth="e01" tone="soft" className="space-y-5 rounded-[10px] p-6 md:p-8">
          <SectionHeading title="Explore Brand Hall" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sephoraAssets.brandShowcase.logos.map((logo, index) => (
              <Layer
                key={brandNames[index]}
                depth="e02"
                tone="neutral"
                className="grid h-24 place-items-center rounded-[8px] bg-white/95 p-4 transition hover:-translate-y-0.5 hover:shadow-elevation-04"
              >
                <img src={logo} alt={brandNames[index]} className="max-h-full w-full object-contain" loading="lazy" />
              </Layer>
            ))}
          </div>
        </Layer>
      </div>
    </section>
  );
};
