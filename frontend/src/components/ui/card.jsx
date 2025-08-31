import * as React from "react";
import { cn } from "../../lib/utils";
export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl border bg-white shadow-sm", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6", className)} {...props} />
));
CardContent.displayName = "CardContent";

