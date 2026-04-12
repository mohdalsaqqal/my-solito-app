import RatingElement from '../RatingElement';

type FeedbackCardElementProps = {
  avatarSrc: string;
  name: string;
  role: string;
  message: string;
};

export default function FeedbackCardElement({
  avatarSrc,
  name,
  role,
  message
}: FeedbackCardElementProps) {
  return (
    <article className="w-full max-w-[666px] rounded-lg border border-dashed border-mint bg-surface p-10">
      <div className="flex items-center gap-[30px]">
        <div className="w-[110px] shrink-0 text-center">
          <div className="mx-auto mb-2 grid h-20 w-20 place-items-center rounded-full bg-surface-soft">
            <img src={avatarSrc} alt={name} className="h-20 w-20 rounded-full object-cover" />
          </div>
          <p className="font-poppins text-base font-semibold leading-5 tracking-[0.0125em] text-fg">{name}</p>
          <p className="font-poppins text-sm leading-5 tracking-[0.0025em] text-muted">{role}</p>
        </div>

        <div className="w-full">
          <div className="mb-2">
            <RatingElement />
          </div>
          <p className="font-poppins text-base leading-6 tracking-[0.005em] text-fg">{message}</p>
        </div>
      </div>
    </article>
  );
}
