import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils";

export const Accordion = AccordionPrimitive.Root;
export function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={cn("overflow-hidden rounded-sm border bg-white", className)} {...props} />;
}
export function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger className={cn("flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-sm font-semibold [&[data-state=open]>svg]:rotate-180", className)} {...props}>
        {children}
        <ChevronDown className="size-4 shrink-0 transition" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}
export function AccordionContent({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return <AccordionPrimitive.Content className={cn("border-t px-4 py-3 text-sm text-[var(--muted-foreground)]", className)} {...props} />;
}
