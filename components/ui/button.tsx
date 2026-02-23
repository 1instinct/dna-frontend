import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-title uppercase tracking-wider transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[radial-gradient(circle_at_50%_100%,#EB8B8B,#E6CDC0)] bg-[length:100%] bg-[position:50%_100%] text-white border-none rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.1)] text-shadow-sm hover:shadow-[0px_4px_12px_rgba(0,0,0,0.2)] hover:bg-[length:200%]",
        outline:
          "border-[3px] border-foreground bg-transparent text-foreground rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.1)] hover:shadow-[0px_4px_12px_rgba(0,0,0,0.2)] hover:bg-[length:200%] dark:border-white dark:text-white dark:shadow-[0px_2px_6px_rgba(255,255,255,0.33)]",
        ghost:
          "rounded-xl hover:bg-accent hover:text-accent-foreground",
        link:
          "text-brand underline-offset-4 hover:underline rounded-none tracking-normal normal-case font-body",
        destructive:
          "bg-red text-white border-none rounded-xl shadow-[0px_2px_6px_rgba(0,0,0,0.1)] hover:bg-red/90 hover:shadow-[0px_4px_12px_rgba(0,0,0,0.2)]",
        ambient:
          "bg-ambient text-white border-none rounded-xl shadow-brand-glow hover:shadow-brand-glow-primary-sm hover:brightness-110",
      },
      size: {
        default: "h-[60px] px-6 text-title-md sm:text-title-sm sm:px-4 sm:h-[52px]",
        sm: "h-10 px-4 text-title-sm",
        lg: "h-16 px-10 text-title-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
