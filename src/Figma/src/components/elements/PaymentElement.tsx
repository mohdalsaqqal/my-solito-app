const paymentCards = [
  { label: 'VISA', tone: 'bg-payment-visa-deep text-white' },
  { label: 'MC', tone: 'bg-surface text-fg border border-stroke' },
  { label: 'AMEX', tone: 'bg-payment-amex text-white' },
  { label: 'VISA', tone: 'bg-surface text-fg border border-stroke' },
  { label: 'MC', tone: 'bg-surface text-fg border border-stroke' },
  { label: 'APPLE', tone: 'bg-ink text-white' }
];

export default function PaymentElement() {
  return (
    <section className="rounded-md border border-dashed border-accent p-2">
      <div className="grid grid-cols-3 gap-1">
        {paymentCards.map((card, index) => (
          <div
            key={`${card.label}-${index}`}
            className={`grid h-7 min-w-[34px] place-items-center rounded text-[9px] font-semibold uppercase ${card.tone}`}
          >
            {card.label}
          </div>
        ))}
      </div>
    </section>
  );
}
