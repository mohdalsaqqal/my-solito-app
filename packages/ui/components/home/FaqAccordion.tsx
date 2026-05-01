import { useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { colors, spacing, typography, fontWeights, radius } from '@real/tokens'

export type FaqAccordionItem = {
  id: string
  question: string
  answer: string
}

export function FaqAccordion({
  title,
  items,
}: {
  title?: string
  items: FaqAccordionItem[]
}) {
  return (
    <View
      style={{
        paddingVertical: spacing['24'],
        paddingHorizontal: spacing['16'],
      }}
    >
      {title ? (
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.xl,
            fontWeight: fontWeights.semibold,
            marginBottom: spacing['16'],
          }}
        >
          {title}
        </Text>
      ) : null}
      <View
        style={{
          borderRadius: radius.xl,
          overflow: 'hidden',
        }}
      >
        {items.map((item) => (
          <FaqRow key={item.id} question={item.question} answer={item.answer} />
        ))}
      </View>
    </View>
  )
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing['16'],
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: typography.base,
            fontWeight: fontWeights.medium,
            flex: 1,
          }}
        >
          {question}
        </Text>
        <Text
          style={{
            color: colors.textSecondary,
            fontSize: typography.lg,
            fontWeight: fontWeights.semibold,
            marginLeft: spacing['8'],
          }}
        >
          {open ? '▴' : '▾'}
        </Text>
      </Pressable>
      {open ? (
        <View
          style={{
            padding: spacing['16'],
            paddingTop: 0,
            backgroundColor: colors.surface,
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: typography.sm,
              lineHeight: typography.sm * 1.6,
            }}
          >
            {answer}
          </Text>
        </View>
      ) : null}
    </View>
  )
}
