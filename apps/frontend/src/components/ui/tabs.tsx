import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/utils";

export const Tabs = TabsPrimitive.Root;
export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn("inline-flex flex-wrap gap-1 rounded-sm border bg-white p-1", className)} {...props} />;
}
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger className={cn("rounded-sm px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] data-[state=active]:bg-[var(--primary)] data-[state=active]:text-white", className)} {...props} />;
}
export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("mt-4", className)} {...props} />;
}
