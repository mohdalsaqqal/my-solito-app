import { sephoraAssets } from '../assets/sephoraAssets';
import { Layer } from '../ui/layer';
import { CarouselButton, SectionHeading, SliderDots } from './atoms';

const testimonials = [
  {
    id: 1,
    name: 'Jane Cooper',
    role: 'Customer',
    avatar: sephoraAssets.testimonials[0],
    text: 'Any of Conscious Skincare\'s mature range will do the trick for wintry months. They are called moisturisers, but that is an understatement.'
  },
  {
    id: 2,
    name: 'Jane Cooper',
    role: 'Customer',
    avatar: sephoraAssets.testimonials[1],
    text: 'Just a quick line to say that the rejuvenate products are great and have not caused a reaction. My daughter says it makes my skin look smoother.'
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="bg-bg py-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 px-4 lg:grid-cols-[300px_1fr] lg:px-6">
        <div className="space-y-6">
          <SectionHeading
            title="See What Shoppers Say"
            align="left"
          />

          <div className="space-y-2">
            <div className="text-sm text-muted">★★★★★</div>
            <div className="flex items-center gap-3 text-sm">
              <span className="font-semibold text-fg">4.9</span>
              <span className="text-muted">(1200+ Reviews)</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative grid gap-4 md:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Layer
                key={testimonial.id}
                depth="e03"
                tone="neutral"
                className="rounded-lg border-dashed border-mint/70 p-6"
              >
                <div className="flex gap-4">
                  <img src={testimonial.avatar} alt={testimonial.name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-semibold text-fg">{testimonial.name}</p>
                      <p className="text-xs text-muted">{testimonial.role}</p>
                    </div>
                    <p className="text-sm leading-6 text-fg">{testimonial.text}</p>
                  </div>
                </div>
              </Layer>
            ))}

            <CarouselButton direction="left" className="absolute -left-3 top-1/2 hidden -translate-y-1/2 lg:grid" />
            <CarouselButton direction="right" className="absolute -right-3 top-1/2 hidden -translate-y-1/2 lg:grid" />
          </div>

          <SliderDots count={2} active={0} />
        </div>
      </div>
    </section>
  );
};
