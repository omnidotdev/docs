import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ children, className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    {...props}
    className={cn(
      "overflow-hidden transition-all duration-200 ease-out",
      "data-[state=closed]:h-0",
      "data-[state=open]:h-auto",
      className,
    )}
  >
    {children}
  </CollapsiblePrimitive.Content>
));

CollapsibleContent.displayName =
  CollapsiblePrimitive.CollapsibleContent.displayName;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
