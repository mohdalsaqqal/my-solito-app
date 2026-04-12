import { AddToCart } from "./AddToCart"; 
import { AngleSmall } from "./AngleSmall";
import { Compare } from "./Compare";
import { Eye } from "./Eye";
import { Heart } from "./Heart";
import IMG4 from "./IMG-4.png";
import IMG6 from "./IMG-6.png";
import IMG from "./IMG.png";
import { Star } from "./Star";
import image from "./image.png";

const categoryItems = [
  {
    id: 1,
    imgSrc: IMG4,
    imgAlt: "Img",
    useImgTag: true,
    name: "Sunscreen",
    count: "14 Items",
    buttonBg:
      "bg-[linear-gradient(0deg,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.85)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-15",
    arrowColor: "#2E2E2E",
    containerBg: "bg-background-elevation24",
  },
  {
    id: 2,
    imgSrc: null,
    imgAlt: null,
    useImgTag: false,
    bgClass: "bg-[url(/IMG-5.png)] bg-cover bg-[50%_50%]",
    name: "Sunscreen",
    count: "14 Items",
    buttonBg:
      "bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-170",
    arrowColor: "white",
    containerBg: "bg-background-elevation24",
  },
];

const productCards = [
  {
    id: 1,
    imgSrc: IMG,
    imgAlt: "Img",
    name: "Pandora Sparkling Heart",
    price: "$225.00",
    originalPrice: "$335.00",
    showActions: false,
    marginTop: "mt-[8.3px]",
  },
  {
    id: 2,
    imgSrc: image,
    imgAlt: "Img",
    name: "Pandora Sparkling Heart",
    price: "$225.00",
    originalPrice: "$335.00",
    showActions: true,
    marginTop: "",
  },
];

const bannerImages = [
  { id: 1, bgClass: "bg-[url(/IMG-2.png)]" },
  { id: 2, bgClass: "bg-[url(/IMG-3.png)]" },
];

export const Card = (): JSX.Element => {
  return (
    <div className="bg-[linear-gradient(0deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.06)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] w-full min-w-[1161px] min-h-[2491px] relative bg-background-elevation12">
      {/* Product Cards Column */}
      <div className="absolute top-[158px] left-[156px] w-[334px] h-[849px] flex flex-col gap-[22.2px] rounded-[5px] overflow-hidden border border-dashed border-[#9747ff]">
        {productCards.map((card) => (
          <div
            key={card.id}
            className={`inline-flex ml-2 w-[318px] h-[394px] relative ${card.marginTop} flex-col items-center justify-center gap-4`}
          >
            <div className="relative w-[318px] h-[318px] bg-background-elevation24 rounded-lg overflow-hidden border border-solid border-gray-scale5">
              <img
                className="absolute top-[calc(50.00%_-_159px)] left-[calc(50.00%_-_159px)] w-[318px] h-[318px] object-cover"
                alt={card.imgAlt}
                src={card.imgSrc}
              />

              <div className="inline-flex flex-col items-start gap-1 absolute top-3 left-3">
                <div className="flex w-12 items-center justify-center gap-1 px-3 py-1 relative flex-[0_0_auto] rounded bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] bg-primaryprimary-home-170">
                  <div className="relative w-fit mt-[-1.08px] ml-[-2.50px] mr-[-2.50px] font-caption-semibold font-[number:var(--caption-semibold-font-weight)] text-gray-scale0 text-[length:var(--caption-semibold-font-size)] text-center tracking-[var(--caption-semibold-letter-spacing)] leading-[var(--caption-semibold-line-height)] whitespace-nowrap [font-style:var(--caption-semibold-font-style)]">
                    NEW
                  </div>
                </div>

                <div className="flex w-12 items-center justify-center gap-1 px-[17px] py-1 relative flex-[0_0_auto] bg-secondarysecondary-home-150 rounded">
                  <div className="relative w-fit mt-[-1.08px] ml-[-8.00px] mr-[-8.00px] font-caption-semibold font-[number:var(--caption-semibold-font-weight)] text-gray-scale80 text-[length:var(--caption-semibold-font-size)] text-center tracking-[var(--caption-semibold-letter-spacing)] leading-[var(--caption-semibold-line-height)] whitespace-nowrap [font-style:var(--caption-semibold-font-style)]">
                    SALE
                  </div>
                </div>
              </div>

              {card.showActions && (
                <div className="inline-flex flex-col items-center justify-center gap-2 absolute top-[calc(50.00%_-_84px)] right-3">
                  <div className="w-9 h-9 gap-3 p-3 rounded-[40px] bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(255,235,59,1)_0%,rgba(255,235,59,1)_100%)] flex items-center justify-center relative bg-secondarysecondary-home-140">
                    <Eye className="!relative !w-4 !h-4 !mt-[-2.00px] !mb-[-2.00px] !ml-[-2.00px] !mr-[-2.00px]" />
                  </div>

                  <div className="w-9 h-9 gap-3 p-3 rounded-[40px] bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(255,235,59,1)_0%,rgba(255,235,59,1)_100%)] flex items-center justify-center relative bg-secondarysecondary-home-140">
                    <Heart className="!relative !w-4 !h-4 !mt-[-2.00px] !mb-[-2.00px] !ml-[-2.00px] !mr-[-2.00px]" />
                  </div>

                  <div className="w-9 h-9 gap-3 p-3 rounded-[40px] bg-[linear-gradient(0deg,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.2)_100%),linear-gradient(0deg,rgba(255,235,59,1)_0%,rgba(255,235,59,1)_100%)] flex items-center justify-center relative bg-secondarysecondary-home-140">
                    <Compare className="!relative !w-4 !h-4 !mt-[-2.00px] !mb-[-2.00px] !ml-[-2.00px] !mr-[-2.00px]" />
                  </div>

                  <div className="w-9 h-9 gap-3 p-3 rounded-[40px] bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] flex items-center justify-center relative bg-primaryprimary-home-170">
                    <AddToCart className="!relative !w-4 !h-4 !mt-[-2.00px] !mb-[-2.00px] !ml-[-2.00px] !mr-[-2.00px]" />
                  </div>
                </div>
              )}
            </div>

            <div className="relative self-stretch font-subtitle-1-regular font-[number:var(--subtitle-1-regular-font-weight)] text-gray-scale50 text-[length:var(--subtitle-1-regular-font-size)] text-center tracking-[var(--subtitle-1-regular-letter-spacing)] leading-[var(--subtitle-1-regular-line-height)] [font-style:var(--subtitle-1-regular-font-style)]">
              {card.name}
            </div>

            <div className="inline-flex items-center gap-2 relative flex-[0_0_auto]">
              <div className="relative w-fit mt-[-1.00px] font-h6-semibold font-[number:var(--h6-semibold-font-weight)] text-gray-scale80 text-[length:var(--h6-semibold-font-size)] text-center tracking-[var(--h6-semibold-letter-spacing)] leading-[var(--h6-semibold-line-height)] whitespace-nowrap [font-style:var(--h6-semibold-font-style)]">
                {card.price}
              </div>

              <div className="relative w-fit [font-family:'Montserrat-Medium',Helvetica] font-medium text-gray-scale50 text-sm text-center tracking-[0.14px] leading-5 line-through whitespace-nowrap">
                {card.originalPrice}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Testimonial Section */}
      <div className="flex w-[666px] items-center justify-center gap-[30px] p-10 absolute top-[1554px] left-[164px] rounded-lg border border-dashed border-primaryprimary-home-170">
        <div className="flex flex-col w-[110px] items-center justify-center gap-2 relative">
          <div className="relative w-20 h-20 rounded-[100px] overflow-hidden bg-[linear-gradient(0deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.04)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)] bg-background-elevation16">
            <img
              className="absolute top-0 left-0 w-20 h-20 object-cover"
              alt="Img"
              src={IMG6}
            />
          </div>

          <div className="inline-flex flex-col items-center justify-center relative flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] font-subtitle-1-semibold font-[number:var(--subtitle-1-semibold-font-weight)] text-gray-scale80 text-[length:var(--subtitle-1-semibold-font-size)] tracking-[var(--subtitle-1-semibold-letter-spacing)] leading-[var(--subtitle-1-semibold-line-height)] whitespace-nowrap [font-style:var(--subtitle-1-semibold-font-style)]">
              Jane Cooper
            </div>

            <div className="relative w-fit font-body-2-regular font-[number:var(--body-2-regular-font-weight)] text-gray-scale50 text-[length:var(--body-2-regular-font-size)] tracking-[var(--body-2-regular-letter-spacing)] leading-[var(--body-2-regular-line-height)] whitespace-nowrap [font-style:var(--body-2-regular-font-style)]">
              Customer
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 relative flex-1 grow">
          <div className="inline-flex items-start gap-1 relative flex-[0_0_auto]">
            <Star className="!relative !w-4 !h-4" />
            <Star className="!relative !w-4 !h-4" />
            <Star className="!relative !w-4 !h-4" />
            <Star className="!relative !w-4 !h-4" />
            <Star className="!relative !w-4 !h-4" />
          </div>

          <p className="relative self-stretch font-body-1-regular font-[number:var(--body-1-regular-font-weight)] text-gray-scale80 text-[length:var(--body-1-regular-font-size)] tracking-[var(--body-1-regular-letter-spacing)] leading-[var(--body-1-regular-line-height)] [font-style:var(--body-1-regular-font-style)]">
            &#39;Any of Conscious Skincare&apos;s mature range will do the trick
            for wintry months. They are called moisturisers, but that&apos;s an
            understatement!
          </p>
        </div>
      </div>

      {/* Instagram / Social Media Gallery */}
      <div className="absolute top-[1830px] left-[156px] w-64 h-[504px] flex flex-col gap-2 rounded-[5px] overflow-hidden border border-dashed border-[#9747ff]">
        <div className="ml-2 w-60 h-60 mt-2 bg-[#cccccc]" />

        <div className="ml-2 w-60 h-60 relative bg-[#cccccc]">
          <div className="absolute top-0 left-0 w-60 h-60 bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] opacity-60 bg-primaryprimary-home-170" />

          <div className="absolute top-[calc(50.00%_-_16px)] left-[calc(50.00%_-_16px)] w-8 h-8 bg-[url(/vector.svg)] bg-[100%_100%]" />
        </div>
      </div>

      {/* Sale Banner */}
      <div className="absolute top-[1106px] left-[164px] w-[840px] h-[350px] bg-white rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 w-[840px] h-[350px] bg-[#d9d9d9]" />

        <div className="inline-flex flex-col items-start gap-[30px] absolute top-[60px] left-[60px]">
          <p className="relative flex items-center w-[399.8px] mt-[-1.00px] font-h5-regular font-[number:var(--h5-regular-font-weight)] text-gray-scale80 text-[length:var(--h5-regular-font-size)] tracking-[var(--h5-regular-letter-spacing)] leading-[var(--h5-regular-line-height)] [font-style:var(--h5-regular-font-style)]">
            Lorem ipsum dolor sit amet consectetur
          </p>

          <div className="relative flex items-center w-[399.8px] font-h4-semibold font-[number:var(--h4-semibold-font-weight)] text-gray-scale80 text-[length:var(--h4-semibold-font-size)] tracking-[var(--h4-semibold-letter-spacing)] leading-[var(--h4-semibold-line-height)] [font-style:var(--h4-semibold-font-style)]">
            Sale up to 50%
          </div>

          <button className="all-[unset] box-border w-[150px] h-12 gap-2 px-6 py-3 rounded-lg overflow-hidden bg-[linear-gradient(0deg,rgba(0,0,0,0.35)_0%,rgba(0,0,0,0.35)_100%),linear-gradient(0deg,rgba(0,242,184,1)_0%,rgba(0,242,184,1)_100%)] flex items-center justify-center relative bg-primaryprimary-home-170">
            <div className="w-fit font-button-semibold font-[number:var(--button-semibold-font-weight)] text-gray-scale0 text-[length:var(--button-semibold-font-size)] text-center tracking-[var(--button-semibold-letter-spacing)] leading-[var(--button-semibold-line-height)] whitespace-nowrap flex items-center justify-center relative [font-style:var(--button-semibold-font-style)]">
              Shop Now
            </div>
          </button>
        </div>
      </div>

      {/* Banner Images */}
      <div className="absolute top-[510px] left-[526px] w-[324px] h-[414px] flex flex-col gap-2 rounded-[5px] overflow-hidden border border-dashed border-[#9747ff]">
        {bannerImages.map((banner) => (
          <div
            key={banner.id}
            className={`ml-2 w-[308px] h-[195px] ${banner.id === 1 ? "mt-2" : ""} rounded-lg ${banner.bgClass} bg-cover bg-[50%_50%]`}
          />
        ))}
      </div>

      {/* Category Items */}
      <div className="absolute top-[158px] left-[526px] w-[334px] h-[308px] flex flex-col gap-1.5 rounded-[5px] overflow-hidden border border-dashed border-[#9747ff]">
        {categoryItems.map((item, index) => (
          <div
            key={item.id}
            className={`ml-2 w-[318px] h-[140px] ${index === 0 ? "mt-2" : ""} flex ${item.containerBg} rounded-[100px] overflow-hidden`}
          >
            <div className="flex mt-[30px] w-[258px] h-20 ml-[30px] relative items-center justify-between">
              <div
                className={`relative w-20 h-20 rounded-[100px] ${!item.useImgTag ? item.bgClass : ""}`}
              >
                {item.useImgTag && item.imgSrc && (
                  <img
                    className="absolute top-2.5 left-2.5 w-[60px] h-[60px] object-cover"
                    alt={item.imgAlt}
                    src={item.imgSrc}
                  />
                )}
              </div>

              <div className="flex w-[158px] items-center justify-between relative">
                <div className="flex flex-col items-start relative flex-1 grow">
                  <div className="relative w-fit mt-[-1.00px] font-body-1-semibold font-[number:var(--body-1-semibold-font-weight)] text-gray-scale80 text-[length:var(--body-1-semibold-font-size)] tracking-[var(--body-1-semibold-letter-spacing)] leading-[var(--body-1-semibold-line-height)] whitespace-nowrap [font-style:var(--body-1-semibold-font-style)]">
                    {item.name}
                  </div>

                  <div className="relative w-fit font-body-2-regular font-[number:var(--body-2-regular-font-weight)] text-gray-scale50 text-[length:var(--body-2-regular-font-size)] tracking-[var(--body-2-regular-letter-spacing)] leading-[var(--body-2-regular-line-height)] whitespace-nowrap [font-style:var(--body-2-regular-font-style)]">
                    {item.count}
                  </div>
                </div>

                <div
                  className={`${item.buttonBg} flex w-6 h-6 items-center justify-center gap-1 p-0.5 relative rounded-3xl`}
                >
                  <AngleSmall
                    className="!relative !w-4 !h-4"
                    color={item.arrowColor}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
