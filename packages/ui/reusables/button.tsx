import { TextClassContext } from '@real/ui/reusables/text';
import { cn } from '@real/ui/reusables/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Platform, Pressable } from 'react-native';

// NOTE: group-* is not supported yet by Uniwind

const buttonVariants = cva(
  cn(
    // DESIGN.md §4 — "Roundedness Scale of 0px" — Brutalist-Luxe, no radius
    'group shrink-0 flex-row items-center justify-center gap-2 rounded-none shadow-none',
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    })
  ),
  {
    variants: {
      variant: {
        // DESIGN.md primary red — hover/pressed via CSS token vars
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
          'bg-secondary active:bg-secondary/80',
          Platform.select({ web: 'hover:bg-secondary/80' })
        ),
        ghost: cn(
          'active:bg-accent dark:active:bg-accent/50',
          Platform.select({ web: 'hover:bg-accent dark:hover:bg-accent/50' })
        ),
        link: '',
      },
      size: {
        // DESIGN.md — generous padding (px-8) on primary CTAs
        default: cn('h-12 px-8 py-3 sm:h-11', Platform.select({ web: 'has-[>svg]:px-6' })),
        sm: cn('h-9 gap-1.5 px-4 sm:h-8', Platform.select({ web: 'has-[>svg]:px-3' })),
        lg: cn('h-14 px-10 sm:h-12', Platform.select({ web: 'has-[>svg]:px-8' })),
        icon: 'h-10 w-10 sm:h-9 sm:w-9',
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
    'text-foreground text-sm font-medium',
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

type ButtonProps = React.ComponentProps<typeof Pressable> &
  VariantProps<typeof buttonVariants> & {
    className?: string;
    href?: string;
    target?: string;
    rel?: string;
    download?: string;
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
