export default function TagElement() {
  return (
    <div className="inline-flex items-start gap-1 rounded-md border border-dashed border-accent p-2">
      <span className="rounded bg-sun px-[17px] py-1 text-xs font-semibold uppercase tracking-[0.04em] text-fg">
        Sale
      </span>
      <span className="rounded bg-mint px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] text-white">
        New
      </span>
    </div>
  );
}
