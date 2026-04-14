import { forwardRef } from 'react';
import { cn } from '@real/ui/reusables/lib/utils';
import { Platform, TextInput } from 'react-native';

type InputProps = React.ComponentPropsWithoutRef<typeof TextInput> & {
  className?: string;
  placeholderClassName?: string;
};

const NativeTextInput = TextInput as unknown as React.ComponentType<any>;

const Input = forwardRef<TextInput, InputProps>(function Input({ className, placeholderClassName, ...props }, ref) {
  const inputProps = {
    ...props,
    className: cn(
      // Canonical field treatment: semantic surface, intentional spacing, and full state styling.
      'bg-background text-foreground flex min-h-11 w-full min-w-0 flex-row items-center rounded-lg border border-input px-4 py-3 text-sm leading-5 shadow-none',
      props.editable === false &&
        cn(
          'bg-muted/60 opacity-50',
          Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })
        ),
      Platform.select({
        web: cn(
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[background-color,border-color,box-shadow,color]',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive'
        ),
        native: 'placeholder:text-muted-foreground/50',
      }),
      className
    ),
    ref,
  } as any

  return (
    <NativeTextInput {...inputProps} />
  );
})

export { Input };
