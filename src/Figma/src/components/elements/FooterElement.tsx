import { useState } from 'react';
import { sephoraAssets } from '../../assets/sephoraAssets';
import { IconArrowRight, PaymentBadges } from '../designSystem';

const quickLinks = ['About us', 'Contact us', 'Shop', 'Products', 'Blogs'];
const usefulLinks = ['Special Offers', 'Privacy Policy', 'Teams of Use', 'Portfolio', 'FAQs'];

const instagramTiles = [
  sephoraAssets.instagram[0],
  sephoraAssets.instagram[1],
  sephoraAssets.instagram[2],
  sephoraAssets.instagram[3],
  sephoraAssets.instagram[4],
  sephoraAssets.instagram[5],
  sephoraAssets.instagram[6],
  sephoraAssets.instagram[0]
];

function SocialBadge({ label }: { label: string }) {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-surface/10 text-[9px] font-medium text-surface-soft">
      {label}
    </span>
  );
}

export default function FooterElement() {
  const [email, setEmail] = useState('');

  return (
    <footer className="w-full overflow-hidden">
      <div className="relative grid h-60 grid-cols-8">
        {instagramTiles.map((item, index) => (
          <div key={index} className="h-60">
            <img src={item} alt="Instagram tile" className="h-full w-full object-cover" />
          </div>
        ))}
        <button
          type="button"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-lg bg-surface px-4 py-2 text-[34px] font-medium leading-10 text-fg"
        >
          Instagram
        </button>
      </div>

      <div className="bg-ink px-[60px] pt-[76px] text-white">
        <div className="grid gap-10 pb-[76px] lg:grid-cols-[220px_220px_220px_1fr]">
          <div>
            <p className="mb-[30px] text-xl font-semibold leading-6 tracking-[0.0015em]">QUICK LINKS</p>
            <div className="space-y-[14px]">
              {quickLinks.map((item) => (
                <p key={item} className="text-base leading-5 tracking-[0.0125em] text-surface-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-[30px] text-xl font-semibold leading-6 tracking-[0.0015em]">USERFUL LINKS</p>
            <div className="space-y-[14px]">
              {usefulLinks.map((item) => (
                <p key={item} className="text-base leading-5 tracking-[0.0125em] text-surface-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-[30px]">
            <div>
              <p className="mb-4 text-xl font-semibold leading-6 tracking-[0.0015em]">FOLLOW BZOPETS</p>
              <div className="flex items-center gap-2">
                <SocialBadge label="f" />
                <SocialBadge label="ig" />
                <SocialBadge label="p" />
                <SocialBadge label="x" />
                <SocialBadge label="t" />
              </div>
            </div>

            <div>
              <p className="mb-4 text-xl font-semibold leading-6 tracking-[0.0015em]">FOLLOW BZOPETS</p>
              <PaymentBadges />
            </div>
          </div>

          <div>
            <p className="mb-4 text-xl font-semibold leading-6 tracking-[0.0015em]">SUBSCRIBE OUR NEWSLETTER</p>
            <p className="mb-6 text-sm leading-5 tracking-[0.0025em] text-surface-soft/70">
              Subscribe to the weekly newsletter for all the latest updates & get a 10% off bill offers.
            </p>
            <div className="flex items-start gap-1">
              <label className="flex h-12 flex-1 items-center rounded-lg bg-surface px-3">
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter Your Email..."
                  className="w-full border-0 bg-transparent text-base leading-5 text-fg outline-none placeholder:text-muted"
                />
              </label>
              <button
                type="button"
                className="grid h-12 w-12 place-items-center rounded-lg bg-sun text-fg"
                aria-label="Subscribe"
              >
                <IconArrowRight />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[70px] items-center justify-center border-t border-surface-soft/35">
          <p className="text-base leading-5 tracking-[0.0125em] text-surface-soft">
            Copyright 2023 Sephora. Designed By BZOTech.com
          </p>
        </div>
      </div>
    </footer>
  );
}
