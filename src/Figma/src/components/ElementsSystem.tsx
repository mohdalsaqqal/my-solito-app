import ButtonElement from './elements/ButtonElement';
import BannerCardElement from './elements/cards/BannerCardElement';
import BrandCardElement from './elements/cards/BrandCardElement';
import CardProductElement from './elements/cards/CardProductElement';
import CategoriesCardElement from './elements/cards/CategoriesCardElement';
import FeedbackCardElement from './elements/cards/FeedbackCardElement';
import InstagramCardElement from './elements/cards/InstagramCardElement';
import CustomerInfoElement from './elements/CustomerInfoElement';
import FooterElement from './elements/FooterElement';
import HeaderElement from './elements/HeaderElement';
import IconButtonElement from './elements/IconButtonElement';
import InputFieldElement from './elements/InputFieldElement';
import OverlayElement from './elements/OverlayElement';
import PaymentElement from './elements/PaymentElement';
import RatingElement from './elements/RatingElement';
import TagElement from './elements/TagElement';
import { sephoraAssets } from '../assets/sephoraAssets';

function SectionTitle({ children }: { children: string }) {
  return <h2 className="font-jost text-2xl font-semibold text-fg">{children}</h2>;
}

export default function ElementsSystem() {
  return (
    <main className="min-h-screen overflow-auto bg-bg px-[56px] py-[46px]">
      <div className="mx-auto grid max-w-[1710px] grid-cols-[240px_1fr] gap-14">
        <aside className="space-y-10 pt-8">
          <div className="space-y-6">
            <PaymentElement />
            <CustomerInfoElement />
            <RatingElement />
            <TagElement />
          </div>

          <IconButtonElement />
          <InputFieldElement />
          <OverlayElement />
        </aside>

        <section className="space-y-0">
          <HeaderElement />
          <FooterElement />
          <div className="py-10 text-center">
            <p className="font-poppins text-[45px] font-semibold leading-[53px] text-fg">CATEGORIES</p>
            <p className="font-poppins text-base leading-6 tracking-[0.005em] text-muted">
              It is a long established fact that a reader
            </p>
          </div>
        </section>
      </div>

      <section className="mx-auto mt-16 max-w-[1200px]">
        <h2 className="mb-4 font-jost text-2xl font-semibold text-fg">Button</h2>
        <ButtonElement />
      </section>

      <section className="mx-auto mt-20 max-w-[1710px] space-y-14">
        <div className="grid gap-10 xl:grid-cols-[334px_334px_1fr]">
          <div className="space-y-4">
            <SectionTitle>Card Product</SectionTitle>
            <CardProductElement
              imageSrc={sephoraAssets.newArrivals[0]}
              name="Pandora Sparkling Heart"
              price="$225.00"
              oldPrice="$335.00"
              seller="Pandora"
              deliveryText="Free delivery by Tue"
              description="Sterling silver piece with sparkling center stone and premium finish."
              colors={[
                { id: 'gold', name: 'Gold', hex: 'rgb(var(--color-payment-mastercard))' },
                { id: 'silver', name: 'Silver', hex: 'rgb(var(--color-stroke))' },
                { id: 'rose', name: 'Rose Gold', hex: 'rgb(var(--color-danger))' }
              ]}
              sizes={[
                { id: 's', label: 'S' },
                { id: 'm', label: 'M' },
                { id: 'l', label: 'L' }
              ]}
              variants={[
                { colorId: 'gold', sizeId: 's', stock: 8 },
                { colorId: 'gold', sizeId: 'm', stock: 5 },
                { colorId: 'gold', sizeId: 'l', stock: 2 },
                { colorId: 'silver', sizeId: 's', stock: 6 },
                { colorId: 'silver', sizeId: 'm', stock: 0 },
                { colorId: 'silver', sizeId: 'l', stock: 4 },
                { colorId: 'rose', sizeId: 's', stock: 1 },
                { colorId: 'rose', sizeId: 'm', stock: 3 },
                { colorId: 'rose', sizeId: 'l', stock: 0 }
              ]}
              defaultVariant={{ colorId: 'gold', sizeId: 'm' }}
            />
          </div>

          <div className="space-y-4">
            <SectionTitle>Card Product</SectionTitle>
            <CardProductElement
              imageSrc={sephoraAssets.newArrivals[1]}
              name="Pandora Sparkling Heart"
              price="$225.00"
              oldPrice="$335.00"
              seller="Pandora"
              deliveryText="Express delivery by Mon"
              description="Collector edition with limited stock and expanded color variants."
              colors={[
                { id: 'emerald', name: 'Emerald', hex: 'rgb(var(--color-mint))' },
                { id: 'royal', name: 'Royal Blue', hex: 'rgb(var(--color-payment-visa))' },
                { id: 'ruby', name: 'Ruby Red', hex: 'rgb(var(--color-danger))' },
                { id: 'onyx', name: 'Onyx', hex: 'rgb(var(--color-ink))' }
              ]}
              sizes={[
                { id: 'xs', label: 'XS' },
                { id: 's', label: 'S' },
                { id: 'm', label: 'M' },
                { id: 'l', label: 'L' }
              ]}
              variants={[
                { colorId: 'emerald', sizeId: 'xs', stock: 0 },
                { colorId: 'emerald', sizeId: 's', stock: 5 },
                { colorId: 'emerald', sizeId: 'm', stock: 2 },
                { colorId: 'emerald', sizeId: 'l', stock: 0 },
                { colorId: 'royal', sizeId: 'xs', stock: 3 },
                { colorId: 'royal', sizeId: 's', stock: 0 },
                { colorId: 'royal', sizeId: 'm', stock: 6 },
                { colorId: 'royal', sizeId: 'l', stock: 2 },
                { colorId: 'ruby', sizeId: 'xs', stock: 1 },
                { colorId: 'ruby', sizeId: 's', stock: 2 },
                { colorId: 'ruby', sizeId: 'm', stock: 0 },
                { colorId: 'ruby', sizeId: 'l', stock: 0 },
                { colorId: 'onyx', sizeId: 'xs', stock: 7 },
                { colorId: 'onyx', sizeId: 's', stock: 4 },
                { colorId: 'onyx', sizeId: 'm', stock: 3 },
                { colorId: 'onyx', sizeId: 'l', stock: 1 }
              ]}
              defaultVariant={{ colorId: 'onyx', sizeId: 'xs' }}
            />
          </div>

          <div className="grid gap-8 2xl:grid-cols-[334px_324px]">
            <div className="space-y-4">
              <SectionTitle>Categories Card</SectionTitle>
              <CategoriesCardElement
                firstImageSrc={sephoraAssets.categories.heroIcons[2]}
                secondImageSrc={sephoraAssets.categories.heroIcons[3]}
              />
            </div>

            <div className="space-y-4">
              <SectionTitle>Brand Card</SectionTitle>
              <BrandCardElement firstImageSrc={sephoraAssets.instagram[2]} secondImageSrc={sephoraAssets.instagram[3]} />
            </div>
          </div>
        </div>

        <div className="grid gap-10 xl:grid-cols-[840px_1fr]">
          <div className="space-y-4">
            <SectionTitle>Banner</SectionTitle>
            <BannerCardElement
              imageSrc={sephoraAssets.promotionalBanners[0]}
              heading="Sale up to 50%"
              subheading="Up to 50% off on select items"
            />
          </div>

          <div className="space-y-4">
            <SectionTitle>Instagram Card</SectionTitle>
            <div className="flex gap-2">
              <InstagramCardElement imageSrc={sephoraAssets.instagram[4]} />
              <InstagramCardElement imageSrc={sephoraAssets.instagram[5]} showOverlay />
            </div>
          </div>
        </div>

        <div className="space-y-4 pb-12">
          <SectionTitle>Feedback Card</SectionTitle>
          <FeedbackCardElement
            avatarSrc={sephoraAssets.testimonials[0]}
            name="Jane Cooper"
            role="Customer"
            message="'Any of Conscious Skincare’s mature range will do the trick for wintry months. They are called moisturisers, but that’s an understatement!'"
          />
        </div>
      </section>
    </main>
  );
}
