"use client"

import React, { createContext, ReactNode, useContext, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { colors, radius, spacing, borderWidth } from '@real/tokens'
import { Text } from '../primitives'
import { useThemeColors } from '../responsive'

type TabsContextValue = {
  value: string
  onChange: (v: string) => void
}

const TabsContext = createContext<TabsContextValue>({
  value: '',
  onChange: () => {},
})

type TabsRootProps = {
  defaultValue?: string
  value?: string
  onChange?: (v: string) => void
  children?: ReactNode
}

const TabsRoot = React.memo(function TabsRoot({ defaultValue = '', value: controlled, onChange, children }: TabsRootProps) {
  const [internal, setInternal] = useState(defaultValue)
  const value = controlled ?? internal
  const handleChange = (v: string) => {
    setInternal(v)
    onChange?.(v)
  }
  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      {children}
    </TabsContext.Provider>
  )
})

function TabsList({ children }: { children?: ReactNode }) {
  const c = useThemeColors()
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        borderBottomWidth: borderWidth.thin,
        borderBottomColor: c.border,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {children}
      </View>
    </ScrollView>
  )
}

function TabsTrigger({ value, children }: { value: string; children?: ReactNode }) {
  const c = useThemeColors()
  const ctx = useContext(TabsContext)
  const active = ctx.value === value
  return (
    <Pressable
      onPress={() => ctx.onChange(value)}
      accessibilityRole='tab'
      accessibilityState={{ selected: active }}
      style={{
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        position: 'relative',
      }}
    >
      <Text
        variant='bodySm'
        tone={active ? 'default' : 'muted'}
        weight={active ? '600' : '400'}
      >
        {children}
      </Text>
      {active ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: spacing.md,
            right: spacing.md,
            height: 2,
            backgroundColor: c.brandPrimary,
            borderRadius: radius.full,
          }}
        />
      ) : null}
    </Pressable>
  )
}

function TabsContent({ value, children }: { value: string; children?: ReactNode }) {
  const ctx = useContext(TabsContext)
  if (ctx.value !== value) return null
  return <View>{children}</View>
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
