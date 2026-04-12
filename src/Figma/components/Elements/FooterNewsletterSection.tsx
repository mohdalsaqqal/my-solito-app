import { useState } from "react";
import { Cursor } from "./Cursor";
import ICONSocial2 from "./ICON-SOCIAL-2.svg";
import group2 from "./group-2.png";
import vector36 from "./vector-36.svg";
import vector37 from "./vector-37.svg";
import vector39 from "./vector-39.svg";
import vector40 from "./vector-40.svg";
import vector41 from "./vector-41.svg";
import vector42 from "./vector-42.svg";
import vector44 from "./vector-44.svg";
import vector45 from "./vector-45.svg";
import vector46 from "./vector-46.svg";
import vector47 from "./vector-47.svg";

const quickLinks = ["About us", "Contact us", "Shop", "Products", "Blogs"];
const usefulLinks = [
  "Special Offers",
  "Privacy Policy",
  "Teams of Use",
  "Portfolio",
  "FAQs",
];

const instagramImages = [
  {
    bg: "bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)]",
    isFirst: true,
  },
  { bg: "bg-[url(/IMG.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-2.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-3.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-4.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-5.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-6.svg)] bg-cover bg-[50%_50%]", isFirst: false },
  { bg: "bg-[url(/IMG-7.svg)] bg-cover bg-[50%_50%]", isFirst: false },
];

export const FooterNewsletterSection = (): JSX.Element => {
  const [email, setEmail] = useState("");

  return (
    <div className="inline-flex flex-col items-start absolute top-[412px] left-[714px]">
      <div className="inline-flex items-start relative flex-[0_0_auto]">
        {instagramImages.map((item, index) => (
          <div key={index} className={`relative w-60 h-60 ${item.bg}`}>
            {item.isFirst && (
              <div className="relative top-[calc(50.00%_-_16px)] left-[calc(50.00%_-_16px)] w-8 h-8 bg-[url(/vector-34.svg)] bg-[100%_100%]" />
            )}
          </div>
        ))}

        <button className="all-[unset] box-border inline-flex items-center justify-center gap-4 px-6 py-4 absolute top-[calc(50.00%_-_32px)] left-[calc(50.00%_-_113px)] bg-background-elevation24 rounded-lg">
          <div className="relative w-6 h-6 bg-[url(/vector-10.svg)] bg-[100%_100%]" />
          <div className="relative w-fit mt-[-1.00px] font-h5-medium font-[number:var(--h5-medium-font-weight)] text-gray-scale80 text-[length:var(--h5-medium-font-size)] tracking-[var(--h5-medium-letter-spacing)] leading-[var(--h5-medium-line-height)] whitespace-nowrap [font-style:var(--h5-medium-font-style)]">
            Instagram
          </div>
        </button>
      </div>

      <div className="relative w-[1920px] h-[502px] bg-[linear-gradient(0deg,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0.8)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-195">
        <div className="inline-flex flex-col items-start gap-[30px] absolute top-[76px] left-[105px]">
          <div className="relative w-fit mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale0 text-[length:var(--h6-semibold-font-size)] tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] whitespace-nowrap [font-style:var(--h6-semibold-font-style)]">
            QUICK LINKS
          </div>

          <div className="flex-col items-start gap-[30px] flex-[0_0_auto] inline-flex relative">
            {quickLinks.map((link, index) => (
              <div
                key={index}
                className={`relative w-fit ${index === 0 ? "mt-[-1.00px]" : ""} font-subtitle-1-regular font-[number:var(--subtitle-1-regular-font-weight)] text-gray-scale10 text-[length:var(--subtitle-1-regular-font-size)] tracking-[var(--subtitle-1-regular-letter-spacing)] leading-[var(--subtitle-1-regular-line-height)] whitespace-nowrap [font-style:var(--subtitle-1-regular-font-style)]`}
              >
                {link}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-flex flex-col items-start justify-center gap-[30px] absolute top-[76px] left-[395px]">
          <div className="relative w-fit mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale0 text-[length:var(--h6-semibold-font-size)] tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] whitespace-nowrap [font-style:var(--h6-semibold-font-style)]">
            USERFUL LINKS
          </div>

          <div className="flex-col items-start gap-[30px] flex-[0_0_auto] inline-flex relative">
            {usefulLinks.map((link, index) => (
              <div
                key={index}
                className={`relative w-fit ${index === 0 ? "mt-[-1.00px]" : ""} font-subtitle-1-regular font-[number:var(--subtitle-1-regular-font-weight)] text-gray-scale10 text-[length:var(--subtitle-1-regular-font-size)] tracking-[var(--subtitle-1-regular-letter-spacing)] leading-[var(--subtitle-1-regular-line-height)] whitespace-nowrap [font-style:var(--subtitle-1-regular-font-style)]`}
              >
                {link}
              </div>
            ))}
          </div>
        </div>

        <div className="inline-flex flex-col items-start gap-10 absolute top-[76px] left-[685px]">
          <div className="flex-col items-start gap-[30px] flex-[0_0_auto] inline-flex relative">
            <div className="relative w-fit mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale0 text-[length:var(--h6-semibold-font-size)] tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] whitespace-nowrap [font-style:var(--h6-semibold-font-style)]">
              FOLLOW BZOPETS
            </div>

            <img
              className="relative flex-[0_0_auto]"
              alt="Icon SOCIAL"
              src={ICONSocial2}
            />
          </div>

          <div className="inline-flex flex-col items-start gap-[30px] relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale0 text-[length:var(--h6-semibold-font-size)] tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] whitespace-nowrap [font-style:var(--h6-semibold-font-style)]">
              FOLLOW BZOPETS
            </div>

            <div className="inline-flex items-start gap-2 relative flex-[0_0_auto]">
              <div className="relative w-12 h-[29px]">
                <div className="relative h-full bg-[url(/vector-35.svg)] bg-[100%_100%]">
                  <img
                    className="absolute w-[97.38%] h-[95.84%] top-[4.16%] left-[2.62%]"
                    alt="Vector"
                    src={vector36}
                  />
                  <img
                    className="absolute w-[89.47%] h-[66.66%] top-[33.34%] left-[10.53%]"
                    alt="Vector"
                    src={vector37}
                  />
                </div>
              </div>

              <div className="relative w-12 h-[29px] bg-[url(/vector-38.svg)] bg-[100%_100%]">
                <img
                  className="absolute w-[97.38%] h-[95.84%] top-[4.16%] left-[2.62%]"
                  alt="Vector"
                  src={vector39}
                />
                <img
                  className="absolute w-[78.95%] h-[79.16%] top-[20.84%] left-[21.05%]"
                  alt="Vector"
                  src={vector40}
                />
                <img
                  className="absolute w-[57.90%] h-[79.16%] top-[20.84%] left-[42.10%]"
                  alt="Vector"
                  src={vector41}
                />
                <img
                  className="absolute w-[57.90%] h-[73.75%] top-[26.25%] left-[42.10%]"
                  alt="Vector"
                  src={vector42}
                />
              </div>

              <div className="relative w-12 h-[29px] bg-[url(/vector-43.svg)] bg-[100%_100%]">
                <img
                  className="absolute w-[97.38%] h-[95.84%] top-[4.16%] left-[2.62%]"
                  alt="Vector"
                  src={vector44}
                />
                <img
                  className="absolute w-[86.85%] h-[66.66%] top-[33.34%] left-[13.15%]"
                  alt="Vector"
                  src={vector45}
                />
              </div>

              <div className="relative w-12 h-[29px]">
                <img
                  className="absolute w-[99.33%] h-full top-0 left-0"
                  alt="Vector"
                  src={vector46}
                />
                <img
                  className="absolute w-[97.22%] h-[96.66%] top-[3.34%] left-[2.78%]"
                  alt="Vector"
                  src={vector47}
                />
                <img
                  className="absolute w-[35px] h-3.5 top-2 left-1.5"
                  alt="Group"
                  src={group2}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="inline-flex flex-col items-start gap-[30px] absolute top-[76px] left-[1120px]">
          <div className="relative w-[323.28px] mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale0 text-[length:var(--h6-semibold-font-size)] tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] [font-style:var(--h6-semibold-font-style)]">
            SUBSCRIBE OUR NEWSLETTER
          </div>

          <p className="relative w-[695px] font-body-2-regular font-[number:var(--body-2-regular-font-weight)] text-gray-scale50 text-[length:var(--body-2-regular-font-size)] tracking-[var(--body-2-regular-letter-spacing)] leading-[var(--body-2-regular-line-height)] [font-style:var(--body-2-regular-font-style)]">
            Subscribe to the weekly newsletter for all the latest updates &amp;
            get a 10% off bill offers.
          </p>

          <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
            <div className="flex w-[643px] h-12 items-center gap-2 p-3 relative bg-background-elevation24 rounded-lg">
              <input
                className="relative w-full font-button-regular font-[number:var(--button-regular-font-weight)] text-gray-scale50 text-[length:var(--button-regular-font-size)] tracking-[var(--button-regular-letter-spacing)] leading-[var(--button-regular-line-height)] whitespace-nowrap [font-style:var(--button-regular-font-style)] [background:transparent] border-[none] p-0 outline-none"
                placeholder="Enter Your Email..."
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setEmail("")}
              className="inline-flex items-start gap-1 p-3 relative flex-[0_0_auto] rounded-lg bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(255,235,59,1)_0%,rgba(255,235,59,1)_100%)] bg-secondarysecondary-home-140 cursor-pointer border-none"
            >
              <Cursor className="!relative !w-6 !h-6" />
            </button>
          </div>
        </div>

        <div className="flex w-[1920px] h-[70px] items-center justify-center gap-1 p-3 absolute top-[432px] left-0 border-t [border-top-style:solid] border-gray-scale50">
          <p className="relative w-fit font-subtitle-1-regular font-[number:var(--subtitle-1-regular-font-weight)] text-gray-scale10 text-[length:var(--subtitle-1-regular-font-size)] tracking-[var(--subtitle-1-regular-letter-spacing)] leading-[var(--subtitle-1-regular-line-height)] whitespace-nowrap [font-style:var(--subtitle-1-regular-font-style)]">
            Copyright 2023 Sephora. Designed By BZOTech.com
          </p>
        </div>
      </div>
    </div>
  );
};
