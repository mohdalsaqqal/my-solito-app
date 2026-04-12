export default function CustomerInfoElement() {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="h-20 w-20 rounded-full bg-surface/65" />
      <div className="text-left">
        <p className="font-poppins text-[21px] font-semibold leading-6 text-fg">Esther Howard</p>
        <p className="font-poppins text-sm leading-5 text-muted">Customer</p>
      </div>
    </div>
  );
}
