import { Fragment } from 'react'
import { getBlockComponent } from './block-registry'
import type { HomeBlockRendererProps } from './block-types'

export function BlockRenderer(props: HomeBlockRendererProps) {
  const BlockComponent = getBlockComponent(props.block)

  if (!BlockComponent) {
    return null
  }

  return <Fragment>{BlockComponent(props)}</Fragment>
}
