import { AngleSmall } from "./AngleSmall";
import ICONSocial from "./ICON-SOCIAL.svg";
import ICON from "./ICON.png";
import LINE from "./LINE.svg";
import { Search1 } from "./Search1";
import { User } from "./User";
import image from "./image.svg";
import vector2 from "./vector-2.svg";
import vector3 from "./vector-3.svg";
import vector4 from "./vector-4.svg";
import vector5 from "./vector-5.svg";
import vector6 from "./vector-6.svg";
import vector7 from "./vector-7.svg";
import vector8 from "./vector-8.svg";
import vector9 from "./vector-9.svg";
import vector from "./vector.svg";

const navItems = [
  { label: "HOME", hasDropdown: false },
  { label: "COLLECTIONS", hasDropdown: true },
  { label: "SHOP", hasDropdown: false },
  { label: "BRANDS", hasDropdown: false },
  { label: "BLOG", hasDropdown: false },
  { label: "PAGES", hasDropdown: false },
];

export const MainNavigationSection = (): JSX.Element => {
  return (
    <div className="inline-flex flex-col h-[136px] items-start absolute top-56 left-[709px]">
      <div className="relative w-[1920px] h-10 bg-[linear-gradient(0deg,rgba(0,0,0,0.65)_0%,rgba(0,0,0,0.65)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-190">
        <div className="items-center gap-[1231px] top-2.5 left-[105px] inline-flex relative">
          <p className="relative w-fit mt-[-1.00px] font-body-2-medium font-[number:var(--body-2-medium-font-weight)] text-gray-scale10 text-[length:var(--body-2-medium-font-size)] tracking-[var(--body-2-medium-letter-spacing)] leading-[var(--body-2-medium-line-height)] whitespace-nowrap [font-style:var(--body-2-medium-font-style)]">
            Free UK Mainland delivery on orders over £50
          </p>

          <img
            className="relative flex-[0_0_auto]"
            alt="Icon SOCIAL"
            src={ICONSocial}
          />
        </div>
      </div>

      <div className="relative w-[1920px] h-24">
        <div className="flex w-[calc(100%_-_210px)] items-center justify-between absolute top-[calc(50.00%_-_12px)] left-[105px]">
          <div className="flex w-[466px] gap-[30px] items-center relative">
            {navItems.map((item, index) => (
              <div
                key={index}
                className={`inline-flex justify-center gap-1 flex-[0_0_auto] items-center relative${index === navItems.length - 1 ? " mr-[-20.00px]" : ""}`}
              >
                <div className="relative flex items-center w-fit mt-[-1.00px] font-subtitle-2-medium font-[number:var(--subtitle-2-medium-font-weight)] text-gray-scale50 text-[length:var(--subtitle-2-medium-font-size)] tracking-[var(--subtitle-2-medium-letter-spacing)] leading-[var(--subtitle-2-medium-line-height)] whitespace-nowrap [font-style:var(--subtitle-2-medium-font-style)]">
                  {item.label}
                </div>
                {item.hasDropdown && (
                  <AngleSmall className="!relative !w-4 !h-4" color="#727272" />
                )}
              </div>
            ))}
          </div>

          <div className="inline-flex items-center justify-end gap-[30px] relative flex-[0_0_auto]">
            <div className="inline-flex items-center gap-6 relative flex-[0_0_auto]">
              <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                <img
                  className="relative w-4 h-4 object-cover"
                  alt="Icon"
                  src={ICON}
                />
                <AngleSmall className="!relative !w-5 !h-5" color="#2E2E2E" />
              </div>

              <img
                className="relative w-px h-[18px] object-cover"
                alt="Line"
                src={LINE}
              />

              <div className="inline-flex items-center gap-1 relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] font-body-2-medium font-[number:var(--body-2-medium-font-weight)] text-gray-scale80 text-[length:var(--body-2-medium-font-size)] tracking-[var(--body-2-medium-letter-spacing)] leading-[var(--body-2-medium-line-height)] whitespace-nowrap [font-style:var(--body-2-medium-font-style)]">
                  USD
                </div>
                <AngleSmall className="!relative !w-5 !h-5" color="#2E2E2E" />
              </div>
            </div>

            <div className="inline-flex items-start gap-6 relative flex-[0_0_auto]">
              <Search1 className="!relative !w-6 !h-6" />
              <User className="!relative !w-6 !h-6" />
              <div className="relative w-6 h-6 bg-[url(/HEART.svg)] bg-[100%_100%]">
                <div className="relative -top-3 left-3 w-6 flex items-center justify-center rounded-[20px] overflow-hidden bg-[linear-gradient(0deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-180">
                  <div className="flex items-center justify-center h-6 w-2.5 font-body-1-semibold font-[number:var(--body-1-semibold-font-weight)] text-gray-scale0 text-[length:var(--body-1-semibold-font-size)] text-center tracking-[var(--body-1-semibold-letter-spacing)] leading-[var(--body-1-semibold-line-height)] whitespace-nowrap [font-style:var(--body-1-semibold-font-style)]">
                    3
                  </div>
                </div>
              </div>

              <div className="relative w-6 h-6">
                <div className="absolute w-full h-[100.00%] top-0 left-0">
                  <img
                    className="absolute w-full h-full top-0 left-0"
                    alt="Vector"
                    src={vector}
                  />
                  <img
                    className="absolute w-[79.17%] h-[16.67%] top-[83.33%] left-[20.83%]"
                    alt="Vector"
                    src={image}
                  />
                  <img
                    className="absolute w-[37.50%] h-[16.67%] top-[83.33%] left-[62.50%]"
                    alt="Vector"
                    src={vector2}
                  />
                </div>

                <div className="absolute h-6 -top-3 left-3 w-6 flex items-center justify-center rounded-[20px] overflow-hidden bg-[linear-gradient(0deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.5)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-180">
                  <div className="flex items-center justify-center h-6 w-2.5 font-body-1-semibold font-[number:var(--body-1-semibold-font-weight)] text-gray-scale0 text-[length:var(--body-1-semibold-font-size)] text-center tracking-[var(--body-1-semibold-letter-spacing)] leading-[var(--body-1-semibold-line-height)] whitespace-nowrap [font-style:var(--body-1-semibold-font-style)]">
                    3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-[calc(50.00%_-_22px)] left-[calc(50.00%_-_76px)] w-[151px] h-11">
          <img
            className="absolute top-[calc(50.00%_-_22px)] left-[calc(50.00%_-_76px)] w-[18px] h-11"
            alt="Vector"
            src={vector3}
          />
          <img
            className="absolute top-[calc(50.00%_-_21px)] left-[calc(50.00%_-_53px)] w-4 h-[43px]"
            alt="Vector"
            src={vector4}
          />
          <img
            className="absolute top-[calc(50.00%_-_21px)] left-[calc(50.00%_-_32px)] w-[17px] h-[43px]"
            alt="Vector"
            src={vector5}
          />
          <img
            className="absolute top-[calc(50.00%_-_21px)] left-[calc(50.00%_-_10px)] w-[18px] h-[43px]"
            alt="Vector"
            src={vector6}
          />
          <img
            className="absolute top-[calc(50.00%_-_22px)] left-[calc(50.00%_+_13px)] w-[18px] h-11"
            alt="Vector"
            src={vector7}
          />
          <img
            className="absolute top-[calc(50.00%_-_21px)] left-[calc(50.00%_+_36px)] w-[19px] h-[43px]"
            alt="Vector"
            src={vector8}
          />
          <img
            className="absolute top-[calc(50.00%_-_22px)] left-[calc(50.00%_+_58px)] w-[18px] h-11"
            alt="Vector"
            src={vector9}
          />
        </div>
      </div>
    </div>
  );
};
