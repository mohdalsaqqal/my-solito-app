import { useState } from 'react';
import { FacebookLogo, InstagramLogo, YoutubeLogo, TiktokLogo } from '@phosphor-icons/react';
import { sephoraAssets } from '../assets/sephoraAssets';
import { FooterHeading } from './atoms';
import { IconArrowRight, PaymentBadges } from './designSystem';
import { BrandArc } from './shared/BrandArc';

const quickLinks = ['About us', 'Contact us', 'Shop', 'Products', 'Blogs'];
const usefulLinks = ['Special Offers', 'Privacy Policy', 'Terms of Use', 'Portfolio', 'FAQs'];

const instagramTiles = [
  sephoraAssets.instagram[0],
  sephoraAssets.instagram[1],
  sephoraAssets.instagram[2],
  sephoraAssets.instagram[3],
  sephoraAssets.instagram[4],
  sephoraAssets.instagram[5],
  sephoraAssets.instagram[6],
  sephoraAssets.instagram[2]
];

const footerLinkColumns = [
  { title: 'Quick Links', items: quickLinks },
  { title: 'Useful Links', items: usefulLinks },
] as const;

const socialLinks = [
  { id: 'facebook', label: 'Facebook', Icon: FacebookLogo },
  { id: 'instagram', label: 'Instagram', Icon: InstagramLogo },
  { id: 'youtube', label: 'YouTube', Icon: YoutubeLogo },
  { id: 'tiktok', label: 'TikTok', Icon: TiktokLogo },
] as const;

export const FooterSection = () => {
  const [email, setEmail] = useState('');

  return (
    <footer className="bg-ink text-white">
      <div className="w-full overflow-hidden">
        <BrandArc width={1200} className="w-full" />
      </div>
      <div className="relative grid grid-cols-4 sm:grid-cols-8">
        {instagramTiles.map((image, idx) => (
          <div key={idx} className="h-20 sm:h-28">
            <img src={image} alt="Instagram" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
        <button
          type="button"
          className="absolute left-1/2 mt-7 -translate-x-1/2 rounded-md bg-white px-5 py-2 text-sm font-medium text-fg sm:mt-11"
        >
          Instagram
        </button>
      </div>

      <div className="mx-auto max-w-site px-4 pt-10 pb-4 lg:px-6">
        <div className="flex flex-col items-start gap-1">
          <span className="font-display text-token-footer-brand tracking-token-03 text-white">REAL</span>
          <span className="text-token-micro uppercase tracking-token-35 text-white/60">cosmetics</span>
          <p className="mt-1 text-sm uppercase tracking-token-15 text-white/70">endless beauty</p>
          <BrandArc width={120} className="mt-2 opacity-60" />
        </div>
      </div>
      <div className="mx-auto grid max-w-site gap-10 px-4 py-8 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {footerLinkColumns.map((column) => (
          <div key={column.title} className="space-y-4">
            <FooterHeading>{column.title}</FooterHeading>
            <ul className="space-y-2 text-sm text-white/75">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4">
          <FooterHeading>Follow Us</FooterHeading>
          <div className="flex gap-3 text-white/80">
            {socialLinks.map((social) => (
              <a key={social.id} href="#" aria-label={social.label} className="transition hover:text-white">
                <social.Icon size={20} weight="fill" />
              </a>
            ))}
          </div>
          <FooterHeading>Payment</FooterHeading>
          <PaymentBadges />
        </div>

        <div className="space-y-4">
          <FooterHeading>Subscribe Our Newsletter</FooterHeading>
          <p className="text-sm leading-6 text-white/75">
            Subscribe to the weekly newsletter for all the latest updates and get a 10% off bill offer.
          </p>
          <div className="flex rounded-md bg-white p-1">
            <input
              type="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 flex-1 border-0 bg-transparent px-3 text-sm text-fg outline-none"
            />
            <button
              type="button"
              onClick={() => setEmail('')}
              className="grid h-10 w-10 place-items-center rounded bg-sun text-fg"
              aria-label="Send"
            >
              <IconArrowRight />
            </button>
          </div>

        </div>
      </div>

      <div className="border-t border-white/20 py-4 text-center text-xs text-white/80">
        Copyright {new Date().getFullYear()} REAL cosmetics. Designed by BZOTech.com
      </div>
    </footer>
  );
};
