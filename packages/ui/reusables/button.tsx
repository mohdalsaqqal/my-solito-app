import { TextClassContext } from '@real/ui/reusables/text';
import { cn } from '@real/ui/reusables/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

// NOTE: group-* is not supported yet by Uniwind

const buttonVariants = cva(
  cn(
    // Canonical CTA baseline: 4px-grid spacing, semantic radius, and complete state support.
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-lg shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-[4px] focus-visible:ring-ring/70 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-[background-color,border-color,box-shadow,transform] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        // Default primary action is dark neutral; purchase-intent red is handled by higher-level variants.
        default: cn(
          'bg-primary active:bg-primary-pressed',
          Platform.select({ web: 'hover:bg-primary-hover active:scale-[0.98]' })
        ),
        destructive: cn(
          'bg-destructive active:bg-destructive/90 dark:bg-destructive/60',
          Platform.select({
            web: 'hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
          })
        ),
        outline: cn(
          'border border-foreground/20 bg-transparent active:bg-accent dark:bg-input/30 dark:border-input dark:active:bg-input/50',
          Platform.select({
            web: 'hover:bg-accent dark:hover:bg-input/50',
          })
        ),
        secondary: cn(
          'bg-secondary text-secondary-foreground active:bg-muted',
          Platform.select({ web: 'hover:bg-muted' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        link: '',
      },
      size: {
        // All sizes stay on a 4px rhythm and maintain comfortable touch targets.
        default: cn('h-12 px-6 py-3', Platform.select({ web: 'has-[>svg]:px-5' })),
        sm: cn('h-10 gap-1.5 px-4 py-2', Platform.select({ web: 'has-[>svg]:px-3' })),
        lg: cn('h-14 gap-2.5 px-8 py-4', Platform.select({ web: 'has-[>svg]:px-7' })),
        icon: 'h-11 w-11 sm:h-11 sm:w-11',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva(
  cn(
    'text-foreground text-sm font-semibold',
    Platform.select({ web: 'pointer-events-none transition-colors' })
  ),
  {
    variants: {
      variant: {
        default: 'text-primary-foreground',
        destructive: 'text-white',
        outline: cn(
          'group-active:text-accent-foreground',
          Platform.select({ web: 'group-hover:text-accent-foreground' })
        ),
        secondary: 'text-secondary-foreground',
        ghost: 'group-active:text-accent-foreground',
        link: cn(
          'text-primary group-active:underline',
          Platform.select({ web: 'underline-offset-4 hover:underline group-hover:underline' })
        ),
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type WebPressableState = {
  pressed: boolean;
  hovered?: boolean;
  focused?: boolean;
};

type ButtonProps = Omit<PressableProps, 'children' | 'style'> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode | ((state: WebPressableState) => React.ReactNode);
    className?: string;
    href?: string;
    target?: string;
    rel?: string;
    download?: string;
    style?: StyleProp<ViewStyle> | ((state: WebPressableState) => StyleProp<ViewStyle> | Record<string, unknown>);
  };

const NativePressable = Pressable as unknown as React.ComponentType<any>;

function Button({ className, variant, size, href, target, rel, download, ...props }: ButtonProps) {
  const webLinkProps =
    Platform.OS === 'web'
      ? href
        ? ({
            href,
            hrefAttrs: {
              target,
              rel,
              download,
            },
          } as const)
        : ({ type: 'button' } as const)
      : undefined;

  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <NativePressable
        className={cn(props.disabled && 'opacity-50', buttonVariants({ variant, size }), className)}
        role={href ? 'link' : 'button'}
        {...webLinkProps}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
