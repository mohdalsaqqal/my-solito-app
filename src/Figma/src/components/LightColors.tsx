import { cn } from '../lib/cn';

type ToneRow = {
  level: string;
  note: string;
  color: string;
  tone: 'light' | 'dark';
};

type Palette = {
  heading: string;
  title: string;
  subtitle: string;
  leftLevel: string;
  leftNote: string;
  baseColor: string;
  rows: ToneRow[];
  leftTone: 'light' | 'dark';
  borderedLeft?: boolean;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const safe =
    normalized.length === 3
      ? normalized
          .split('')
          .map((part) => `${part}${part}`)
          .join('')
      : normalized;

  const int = Number.parseInt(safe, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255
  };
}

function mix(baseHex: string, overlayHex: string, alpha: number) {
  const base = hexToRgb(baseHex);
  const overlay = hexToRgb(overlayHex);
  const keep = 1 - alpha;

  const r = Math.round(base.r * keep + overlay.r * alpha);
  const g = Math.round(base.g * keep + overlay.g * alpha);
  const b = Math.round(base.b * keep + overlay.b * alpha);

  return `rgb(${r}, ${g}, ${b})`;
}

function overlayScale(baseHex: string): ToneRow[] {
  return [
    { level: '95', note: 'Overlay 00000 = 80%', color: mix(baseHex, '#000000', 0.8), tone: 'light' },
    { level: '90', note: 'Overlay 00000 = 65%', color: mix(baseHex, '#000000', 0.65), tone: 'light' },
    { level: '80', note: 'Overlay 00000 = 50%', color: mix(baseHex, '#000000', 0.5), tone: 'light' },
    { level: '70', note: 'Overlay 00000 = 35%', color: mix(baseHex, '#000000', 0.35), tone: 'light' },
    { level: '60', note: 'Overlay 00000 = 20%', color: mix(baseHex, '#000000', 0.2), tone: 'light' },
    { level: '50', note: 'Without Overlay', color: baseHex, tone: 'light' },
    { level: '40', note: 'Overlay FFFFFF = 20%', color: mix(baseHex, '#FFFFFF', 0.2), tone: 'dark' },
    { level: '30', note: 'Overlay FFFFFF = 35%', color: mix(baseHex, '#FFFFFF', 0.35), tone: 'dark' },
    { level: '20', note: 'Overlay FFFFFF = 50%', color: mix(baseHex, '#FFFFFF', 0.5), tone: 'dark' },
    { level: '10', note: 'Overlay FFFFFF = 65%', color: mix(baseHex, '#FFFFFF', 0.65), tone: 'dark' },
    { level: '5', note: 'Overlay FFFFFF = 85%', color: mix(baseHex, '#FFFFFF', 0.85), tone: 'dark' }
  ];
}

const grayscaleRows: ToneRow[] = [
  { level: '90', note: '#1A1A1A', color: '#1A1A1A', tone: 'light' },
  { level: '80', note: '#333333', color: '#333333', tone: 'light' },
  { level: '70', note: '#4D4D4D', color: '#4D4D4D', tone: 'light' },
  { level: '60', note: '#666666', color: '#666666', tone: 'light' },
  { level: '50', note: '#808080', color: '#808080', tone: 'light' },
  { level: '40', note: '#999999', color: '#999999', tone: 'dark' },
  { level: '30', note: '#B3B3B3', color: '#B3B3B3', tone: 'dark' },
  { level: '20', note: '#CCCCCC', color: '#CCCCCC', tone: 'dark' },
  { level: '10', note: '#E5E5E5', color: '#E5E5E5', tone: 'dark' },
  { level: '5', note: '#F2F2F2', color: '#F2F2F2', tone: 'dark' },
  { level: '0', note: '#FFFFFF', color: '#FFFFFF', tone: 'dark' }
];

const backgroundRows: ToneRow[] = [
  { level: '90', note: 'Overlay 000000 = 22%', color: mix('#FFFFFF', '#000000', 0.22), tone: 'dark' },
  { level: '80', note: 'Overlay 000000 = 20%', color: mix('#FFFFFF', '#000000', 0.2), tone: 'dark' },
  { level: '70', note: 'Overlay 000000 = 18%', color: mix('#FFFFFF', '#000000', 0.18), tone: 'dark' },
  { level: '60', note: 'Overlay 000000 = 16%', color: mix('#FFFFFF', '#000000', 0.16), tone: 'dark' },
  { level: '50', note: 'Overlay 000000 = 14%', color: mix('#FFFFFF', '#000000', 0.14), tone: 'dark' },
  { level: '40', note: 'Overlay 000000 = 12%', color: mix('#FFFFFF', '#000000', 0.12), tone: 'dark' },
  { level: '30', note: 'Overlay 000000 = 10%', color: mix('#FFFFFF', '#000000', 0.1), tone: 'dark' },
  { level: '20', note: 'Overlay 000000 = 8%', color: mix('#FFFFFF', '#000000', 0.08), tone: 'dark' },
  { level: '10', note: 'Overlay 000000 = 6%', color: mix('#FFFFFF', '#000000', 0.06), tone: 'dark' },
  { level: '5', note: 'Overlay 000000 = 4%', color: mix('#FFFFFF', '#000000', 0.04), tone: 'dark' },
  { level: '0', note: 'Without Overlay', color: '#FFFFFF', tone: 'dark' }
];

function PaletteCard({ palette }: { palette: Palette }) {
  return (
    <div className="h-[308px] w-[320px] overflow-hidden border border-ink/10 bg-surface shadow-elevation-01">
      <div className="grid h-full grid-cols-[104px_216px]">
        <div
          className={cn(
            'flex flex-col justify-between p-2',
            palette.leftTone === 'light' ? 'text-white' : 'text-fg',
            palette.borderedLeft ? 'border border-fg/60' : ''
          )}
          style={{ backgroundColor: palette.baseColor }}
        >
          <div className="space-y-0.5">
            <p className="font-roboto text-[11px] font-bold leading-none">{palette.title}</p>
            <p className="font-roboto text-[7px] leading-none">{palette.subtitle}</p>
          </div>
          <div className="flex items-center justify-between font-roboto text-[8px] font-medium">
            <span>{palette.leftLevel}</span>
            <span>{palette.leftNote}</span>
          </div>
        </div>

        <div>
          {palette.rows.map((row) => (
            <div
              key={`${palette.heading}-${row.level}-${row.note}`}
              className={cn(
                'grid h-7 grid-cols-[26px_1fr] items-center px-1.5 font-roboto text-[7px] font-medium',
                row.tone === 'light' ? 'text-white' : 'text-fg'
              )}
              style={{ backgroundColor: row.color }}
            >
              <span>{row.level}</span>
              <span className="text-right">{row.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const palettes: Palette[] = [
  {
    heading: 'Grayscale',
    title: 'Grayscale',
    subtitle: '#000000',
    baseColor: '#000000',
    leftLevel: '100',
    leftNote: '',
    rows: grayscaleRows,
    leftTone: 'light'
  },
  {
    heading: 'Primary home 1',
    title: 'Primary home 1',
    subtitle: '#1E1E1E',
    baseColor: '#1E1E1E',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#1E1E1E'),
    leftTone: 'light'
  },
  {
    heading: 'Primary home 2',
    title: 'Primary home 2',
    subtitle: '#0064FA',
    baseColor: '#0064FA',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#0064FA'),
    leftTone: 'light'
  },
  {
    heading: 'Primary home 3',
    title: 'Primary home 3',
    subtitle: '#9F1D00',
    baseColor: '#9F1D00',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#9F1D00'),
    leftTone: 'light'
  },
  {
    heading: 'Background elevation',
    title: 'Background elevation',
    subtitle: 'FFFFFF',
    baseColor: '#FFFFFF',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: backgroundRows,
    leftTone: 'dark',
    borderedLeft: true
  },
  {
    heading: 'Secondary home 1',
    title: 'Secondary home 1',
    subtitle: '#FAC300',
    baseColor: '#FAC300',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#FAC300'),
    leftTone: 'dark'
  },
  {
    heading: 'Secondary home 2',
    title: 'Secondary home 2',
    subtitle: '#1E1E1E',
    baseColor: '#1E1E1E',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#1E1E1E'),
    leftTone: 'light'
  },
  {
    heading: 'Secondary home 3',
    title: 'Secondary home 3',
    subtitle: '#1E1E1E',
    baseColor: '#1E1E1E',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#1E1E1E'),
    leftTone: 'light'
  },
  {
    heading: 'Warning',
    title: 'Warning',
    subtitle: '#FF3B3B',
    baseColor: '#FF3B3B',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#FF3B3B'),
    leftTone: 'light'
  },
  {
    heading: 'Atttention',
    title: 'Attention',
    subtitle: '#FFCC00',
    baseColor: '#FFCC00',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#FFCC00'),
    leftTone: 'dark'
  },
  {
    heading: 'Links',
    title: 'Links',
    subtitle: '#0E55FF',
    baseColor: '#0E55FF',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#0E55FF'),
    leftTone: 'light'
  },
  {
    heading: 'Success',
    title: 'Success',
    subtitle: '#26F13B',
    baseColor: '#06C270',
    leftLevel: '50',
    leftNote: 'Without Overlay',
    rows: overlayScale('#06C270'),
    leftTone: 'dark'
  }
];

export default function LightMode() {
  return (
    <main className="min-h-screen overflow-auto bg-bg p-8">
      <div className="relative mx-auto h-[1050px] w-[1440px]">
        <h1 className="absolute left-[8px] top-[8px] font-montserrat text-[64px] font-bold leading-none text-fg">
          Light Colors
        </h1>

        <div className="absolute left-[8px] top-[118px] grid grid-cols-4 gap-x-7 gap-y-7">
          {palettes.map((palette) => (
            <section key={palette.heading} className="space-y-2">
              <h2 className="font-roboto text-[36px] font-medium leading-none text-fg">{palette.heading}</h2>
              <PaletteCard palette={palette} />
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
