import { Text, TextClassContext } from '@real/ui/reusables/text';
import { cn } from '@real/ui/reusables/lib/utils';
import { View } from 'react-native';

function Card({ className, ...props }: React.ComponentProps<typeof View>) {
  return (
    <TextClassContext.Provider value="text-card-foreground">
      <View
        className={cn(
          'bg-card border-border flex flex-col gap-5 rounded-2xl border py-5 shadow-sm shadow-black/5',
          className
        )}
        {...props}
      />
    </TextClassContext.Provider>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex flex-col gap-2 px-5 pt-5', className)} {...props} />;
}

function CardTitle({
  className,
  ariaLevel = 3,
  ...props
}: React.ComponentProps<typeof Text> & { ariaLevel?: number }) {
  return (
    <Text
      role="heading"
      aria-level={ariaLevel}
      className={cn('font-semibold leading-tight', className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-muted-foreground text-sm', className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('px-5', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex flex-row items-center px-5 pb-5', className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
