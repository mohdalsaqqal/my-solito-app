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
      // DESIGN.md — bottom-border only, no box, no radius (Brutalist-Luxe editorial)
      'bg-transparent text-foreground flex h-10 w-full min-w-0 flex-row items-center rounded-none border-0 border-b border-foreground/20 px-0 py-1 text-base leading-5 shadow-none sm:h-9',
      props.editable === false &&
        cn('opacity-50', Platform.select({ web: 'disabled:pointer-events-none disabled:cursor-not-allowed' })),
      Platform.select({
        web: cn(
          'placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none transition-[color,box-shadow] md:text-sm',
          'focus-visible:border-ring focus-visible:ring-0 focus-visible:border-b-2',
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
