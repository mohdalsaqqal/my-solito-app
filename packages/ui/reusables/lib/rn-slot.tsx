import * as React from 'react'

type AnyProps = Record<string, any>

function isTextChildren(children: React.ReactNode) {
  return Array.isArray(children)
    ? children.every((child) => typeof child === 'string')
    : typeof children === 'string'
}

function setRef(ref: React.Ref<any> | undefined, value: any) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref && typeof ref === 'object') {
    ;(ref as React.MutableRefObject<any>).current = value
  }
}

function composeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    refs.forEach((ref) => setRef(ref, node))
  }
}

function combineStyles(slotStyle: any, childStyle: any) {
  if (typeof slotStyle === 'function' && typeof childStyle === 'function') {
    return (state: any) => [slotStyle(state), childStyle(state)]
  }

  if (typeof slotStyle === 'function') {
    return (state: any) => (childStyle ? [slotStyle(state), childStyle] : slotStyle(state))
  }

  if (typeof childStyle === 'function') {
    return (state: any) => (slotStyle ? [slotStyle, childStyle(state)] : childStyle(state))
  }

  if (slotStyle && childStyle) {
    return [slotStyle, childStyle]
  }

  return slotStyle ?? childStyle
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps) {
  const merged: AnyProps = { ...slotProps, ...childProps }

  Object.keys(childProps).forEach((propName) => {
    const slotPropValue = slotProps[propName]
    const childPropValue = childProps[propName]
    const isHandler = /^on[A-Z]/.test(propName)

    if (isHandler) {
      if (slotPropValue && childPropValue) {
        merged[propName] = (...args: any[]) => {
          childPropValue(...args)
          slotPropValue(...args)
        }
      } else if (slotPropValue) {
        merged[propName] = slotPropValue
      }
      return
    }

    if (propName === 'style') {
      merged[propName] = combineStyles(slotPropValue, childPropValue)
      return
    }

    if (propName === 'className') {
      merged[propName] = [slotPropValue, childPropValue].filter(Boolean).join(' ')
    }
  })

  return merged
}

function cloneChild(
  child: React.ReactElement,
  slotProps: AnyProps,
  forwardedRef: React.Ref<any> | undefined
) {
  const childProps = (child.props ?? {}) as AnyProps
  const childRef = childProps.ref as React.Ref<any> | undefined

  return React.cloneElement(child, {
    ...mergeProps(slotProps, childProps),
    ref: forwardedRef ? composeRefs(forwardedRef, childRef) : childRef,
  })
}

const Slot = React.forwardRef<any, AnyProps>(({ children, ...restOfProps }, forwardedRef) => {
  if (!React.isValidElement(children) || isTextChildren(children)) {
    return null
  }

  if (children.type === React.Fragment) {
    const fragmentChildren = React.Children.toArray((children.props as AnyProps)?.children).map((child) =>
      React.isValidElement(child) && !isTextChildren(child)
        ? cloneChild(child, restOfProps, forwardedRef)
        : child
    )

    return React.createElement(React.Fragment, null, ...fragmentChildren)
  }

  return cloneChild(children, restOfProps, forwardedRef)
})

Slot.displayName = 'Slot'

function createSlotComponent(name: string) {
  const Component = React.forwardRef<any, AnyProps>(({ children, ...restOfProps }, forwardedRef) => {
    if (!React.isValidElement(children) || isTextChildren(children)) {
      return null
    }

    return cloneChild(children, restOfProps, forwardedRef)
  })

  Component.displayName = name

  return Component
}

const Pressable = createSlotComponent('SlotPressable')
const View = createSlotComponent('SlotView')
const Text = createSlotComponent('SlotText')
const Image = createSlotComponent('SlotImage')

export { Image, Pressable, Slot, Text, View, isTextChildren }
