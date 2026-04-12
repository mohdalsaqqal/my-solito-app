import { Text } from '../../primitives'

type FooterLegalRowProps = {
  text: string
  state?: 'loading' | 'empty' | 'error' | 'disabled' | 'default'
}

export function FooterLegalRow({ text, state = 'default' }: FooterLegalRowProps) {
  if (state === 'empty') {
    return null
  }

  if (state === 'loading') {
    return <Text tone='muted' variant='meta'>...</Text>
  }

  if (state === 'error') {
    return (
      <Text tone='danger' variant='meta'>
        Legal text unavailable.
      </Text>
    )
  }

  return (
    <Text tone='inverse' variant='meta' style={{ opacity: state === 'disabled' ? 0.55 : 0.72 }}>
      {text}
    </Text>
  )
}
