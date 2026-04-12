type Weight = {
  label: string;
  value: 400 | 500 | 600 | 700;
};

type TypeScaleRow = {
  key: string;
  sample: string;
  fontSize: number;
  lineHeight: number;
  letterSpacingEm: number;
  letterSpacingLabel: string;
  uppercase?: boolean;
};

const weights: Weight[] = [
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'SemiBold', value: 600 },
  { label: 'Bold', value: 700 }
];

const scale: TypeScaleRow[] = [
  { key: 'H1', sample: 'H1', fontSize: 96, lineHeight: 104, letterSpacingEm: -0.015, letterSpacingLabel: '-1.5 %' },
  { key: 'H2', sample: 'H2', fontSize: 60, lineHeight: 68, letterSpacingEm: -0.005, letterSpacingLabel: '-0.5 %' },
  { key: 'H3', sample: 'H3', fontSize: 48, lineHeight: 52, letterSpacingEm: 0, letterSpacingLabel: '0 %' },
  { key: 'H4', sample: 'H4', fontSize: 34, lineHeight: 40, letterSpacingEm: 0.0025, letterSpacingLabel: '0.25 %' },
  { key: 'H5', sample: 'H5', fontSize: 26, lineHeight: 32, letterSpacingEm: 0, letterSpacingLabel: '0 px' },
  { key: 'H6', sample: 'H6', fontSize: 20, lineHeight: 24, letterSpacingEm: 0.0015, letterSpacingLabel: '0.15 %' },
  { key: 'Subtitle 1', sample: 'Subtitle 1', fontSize: 16, lineHeight: 20, letterSpacingEm: 0.0125, letterSpacingLabel: '1.25 %' },
  { key: 'Subtitle 2', sample: 'Subtitle 2', fontSize: 14, lineHeight: 20, letterSpacingEm: 0.01, letterSpacingLabel: '1 %' },
  { key: 'Body 1', sample: 'Body 1', fontSize: 16, lineHeight: 24, letterSpacingEm: 0.005, letterSpacingLabel: '0.5 %' },
  { key: 'Body 2', sample: 'Body 2', fontSize: 14, lineHeight: 20, letterSpacingEm: 0.0025, letterSpacingLabel: '0.25 %' },
  { key: 'Caption', sample: 'Caption', fontSize: 12, lineHeight: 16, letterSpacingEm: 0.005, letterSpacingLabel: '0.5 %' },
  { key: 'OVERLINE', sample: 'OVERLINE', fontSize: 10, lineHeight: 16, letterSpacingEm: 0.01, letterSpacingLabel: '1 %', uppercase: true },
  { key: 'BUTTON', sample: 'BUTTON', fontSize: 16, lineHeight: 20, letterSpacingEm: 0, letterSpacingLabel: '0 %', uppercase: true }
];

function textStyle(row: TypeScaleRow, weight: Weight['value']) {
  return {
    fontFamily: 'Poppins, sans-serif',
    fontSize: `${row.fontSize}px`,
    lineHeight: `${row.lineHeight}px`,
    letterSpacing: `${row.letterSpacingEm}em`,
    fontWeight: weight,
    textTransform: row.uppercase ? 'uppercase' : 'none'
  } as const;
}

export default function TypographySystem() {
  return (
    <main className="min-h-screen overflow-auto bg-bg p-8">
      <div className="relative mx-auto h-[1130px] w-[1365px]">
        <h1 className="absolute left-[26px] top-[18px] font-montserrat text-[58px] font-bold leading-none text-fg">
          Typography
        </h1>
        <h2 className="absolute left-[183px] top-[116px] font-poppins text-[112px] font-light leading-none text-fg">
          Poppins
        </h2>

        <div className="absolute left-[183px] top-[240px] w-[1080px] border-t border-ink/20" />

        <div className="absolute left-[32px] top-[248px] space-y-[246px] font-jost text-[31px] font-semibold text-fg">
          <p>Huge Title</p>
          <p>Small Title</p>
          <p>Body &amp; Caption</p>
        </div>

        <div className="absolute left-[183px] top-[206px] grid w-[1080px] grid-cols-[repeat(4,1fr)_90px_100px_120px] items-end font-jost text-[40px] font-semibold leading-none text-muted">
          <p className="pl-8">Regular</p>
          <p className="pl-8">Medium</p>
          <p className="pl-8">SemiBold</p>
          <p className="pl-8">Bold</p>
          <p className="text-right text-lg font-semibold text-fg">Font size</p>
          <p className="text-right text-lg font-semibold text-fg">Line height</p>
          <p className="text-right text-lg font-semibold text-fg">Letter Spacing</p>
        </div>

        <div className="absolute left-[183px] top-[241px] w-[1080px]">
          {scale.map((row, index) => (
            <div
              key={row.key}
              className={`grid h-[54px] grid-cols-[repeat(4,1fr)_90px_100px_120px] items-center ${
                index % 2 === 0 ? 'bg-surface' : 'bg-surface-soft'
              }`}
            >
              {weights.map((weight) => (
                <div key={`${row.key}-${weight.label}`} className="pl-8">
                  <span style={textStyle(row, weight.value)}>{row.sample}</span>
                </div>
              ))}
              <p className="text-right font-jost text-[30px] text-muted">{row.fontSize}</p>
              <p className="text-right font-jost text-[30px] text-muted">{row.lineHeight}</p>
              <p className="pr-4 text-right font-jost text-[30px] text-muted">{row.letterSpacingLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
