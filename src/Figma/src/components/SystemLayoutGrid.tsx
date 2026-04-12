export default function SystemLayoutGrid() {
  return (
    <main className="min-h-screen overflow-auto bg-bg p-10">
      <div className="relative mx-auto h-[1220px] w-[4484px]">
        <h1 className="absolute left-[109px] top-[125px] font-montserrat text-[104px] font-bold leading-[1] text-fg">
          System Layout Grid
        </h1>

        <div className="absolute left-10 top-[250px] h-px w-[4380px] bg-ink/10" />

        <p className="absolute left-[109px] top-[369px] font-jost text-xl font-semibold uppercase tracking-[0.015em] text-fg">
          DASH BOARD
        </p>
        <div className="absolute left-[109px] top-[401px] h-px w-[1440px] bg-ink/10" />

        <p className="absolute left-[2122px] top-[369px] font-jost text-xl font-semibold uppercase tracking-[0.015em] text-fg">
          MOBILE REPONSIVE
        </p>
        <div className="absolute left-[2122px] top-[401px] h-px w-80 bg-ink/10" />

        <p className="absolute left-[2593px] top-[369px] font-jost text-xl font-semibold uppercase tracking-[0.015em] text-fg">
          DESTOP 32 GUTTER
        </p>
        <div className="absolute left-[2593px] top-[401px] h-px w-[1440px] bg-ink/10" />

        <div className="absolute left-[109px] top-[441px] h-[760px] w-[1920px] overflow-hidden bg-surface shadow-elevation-01" />
        <div className="absolute left-[2122px] top-[441px] h-[760px] w-80 overflow-hidden bg-surface-soft shadow-elevation-01" />
        <div className="absolute left-[2593px] top-[441px] h-[760px] w-[1440px] overflow-hidden bg-surface shadow-elevation-01" />
      </div>
    </main>
  );
}
