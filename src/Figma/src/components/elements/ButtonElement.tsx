import { IconArrowRight, IconCart, UiButton } from '../designSystem';

function ButtonRow({
  variant,
  sizeClass
}: {
  variant: 'solid' | 'soft' | 'outline';
  sizeClass: string;
}) {
  return (
    <UiButton
      variant={variant}
      size="md"
      leftIcon={<IconCart />}
      rightIcon={<IconArrowRight />}
      className={sizeClass}
    >
      Button
    </UiButton>
  );
}

export default function ButtonElement() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <ButtonRow variant="solid" sizeClass="h-14" />
        <ButtonRow variant="soft" sizeClass="h-14" />
        <ButtonRow variant="outline" sizeClass="h-14" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ButtonRow variant="solid" sizeClass="h-12" />
        <ButtonRow variant="soft" sizeClass="h-12" />
        <ButtonRow variant="outline" sizeClass="h-12" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ButtonRow variant="solid" sizeClass="h-11 px-5 text-sm" />
        <ButtonRow variant="soft" sizeClass="h-11 px-5 text-sm" />
        <ButtonRow variant="outline" sizeClass="h-11 px-5 text-sm" />
      </div>
    </div>
  );
}

