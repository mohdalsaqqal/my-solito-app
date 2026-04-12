const shadowSteps = [
  { label: '00 px', className: '' },
  { label: '01 px', className: 'shadow-elevation-01' },
  { label: '02 px', className: 'shadow-elevation-02' },
  { label: '03 px', className: 'shadow-elevation-03' },
  { label: '04 px', className: 'shadow-elevation-04' },
  { label: '06 px', className: 'shadow-elevation-06' },
  { label: '08 px', className: 'shadow-elevation-08' },
  { label: '12 px', className: 'shadow-elevation-12' },
  { label: '16 px', className: 'shadow-elevation-16' },
  { label: '24 px', className: 'shadow-elevation-24' }
];

const lineBorderSamples = [
  { label: 'Left', style: { boxShadow: 'inset 1px 0 0 rgb(var(--color-ink) / 0.12)' } },
  { label: 'Top', style: { boxShadow: 'inset 0 1px 0 rgb(var(--color-ink) / 0.12)' } },
  { label: 'Bottom', style: { boxShadow: 'inset 0 -1px 0 rgb(var(--color-ink) / 0.12)' } },
  { label: 'Right', style: { boxShadow: 'inset -1px 0 0 rgb(var(--color-ink) / 0.12)' } }
];

export default function SystemEffect() {
  return (
    <main className="min-h-screen overflow-auto bg-bg p-10">
      <div className="relative mx-auto h-[1180px] w-[2000px]">
        <h1 className="absolute left-10 top-[100px] font-montserrat text-[72px] font-bold leading-none text-fg">
          System Effect
        </h1>

        <p className="absolute left-10 top-[229px] font-jost text-[34px] font-semibold uppercase tracking-[0.015em] text-fg">
          LIGHT - SHADOW ELEVATION
        </p>
        <div className="absolute left-10 top-[261px] h-px w-[1919px] bg-ink/10" />

        <div className="absolute left-10 top-[301px] flex gap-2">
          {shadowSteps.map((step) => (
            <div key={step.label} className="w-[185px]">
              <p className="mb-4 font-jost text-[34px] font-semibold leading-none text-fg">{step.label}</p>
              <div className={`h-20 rounded bg-surface ${step.className}`} />
            </div>
          ))}
        </div>

        <div className="absolute left-10 top-[501px] flex items-end gap-3">
          <p className="font-jost text-[34px] font-semibold uppercase tracking-[0.015em] text-fg">
            EXAMPLE BACKGROUND ELEVATION
          </p>
          <p className="pb-1 font-jost text-[26px] italic text-muted">
            Độ tương phản shadow trên Light Mode sẽ nhẹ nhàng hơn Dark Mode
          </p>
        </div>
        <div className="absolute left-10 top-[533px] h-px w-[720px] bg-ink/10" />

        <p className="absolute left-10 top-[573px] font-jost text-[34px] font-semibold text-fg">Light Mode</p>

        <div className="absolute left-10 top-[613px] grid h-[267px] w-[284px] place-items-center rounded-[30px] bg-ink-soft">
          <div className="grid h-[219px] w-[234px] place-items-center rounded-[30px] bg-stroke shadow-elevation-24">
            <div className="grid h-[157px] w-[167px] place-items-center rounded-[30px] bg-bg shadow-elevation-16">
              <div className="grid h-[101px] w-[107px] place-items-center rounded-[30px] bg-surface-soft shadow-elevation-12">
                <div className="h-[53px] w-14 rounded-[30px] bg-surface shadow-elevation-08" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-10 top-[960px] flex items-end gap-3">
          <p className="font-jost text-[34px] font-semibold uppercase tracking-[0.015em] text-fg">LINE BORDER</p>
          <p className="pb-1 font-jost text-[26px] italic text-muted">
            Trường hợp đối tượng có các dòng kẻ (Header, Footer, Card ...)
          </p>
        </div>
        <div className="absolute left-10 top-[992px] h-px w-[765px] bg-ink/10" />

        <div className="absolute left-10 top-[1032px] flex gap-2">
          {lineBorderSamples.map((item) => (
            <div key={item.label} className="w-[185px]">
              <p className="mb-4 font-jost text-[34px] font-semibold leading-none text-fg">{item.label}</p>
              <div className="h-20 bg-surface" style={item.style} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
