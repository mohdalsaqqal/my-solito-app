import { Button } from './Button'

type NavChipProps = {
  label: string
  active?: boolean
  onPress?: () => void
}

export function NavChip({ label, active = false, onPress }: NavChipProps) {
  return (
    <Button
      onPress={onPress}
      size='sm'
      shape='pill'
      variant={active ? 'outline' : 'secondaryQuiet'}
    >
      {label.toUpperCase()}
    </Button>
  )
}
