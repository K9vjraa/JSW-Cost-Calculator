/**
 * JSW Metal Cost Management System (MCMS) Design System
 * 
 * Barrel export hub compiling components, tokens, layout shells, styles, and helpers.
 */

// Export utility functions and merge classes
export { cn, inr } from "./utils";

// Export standard TypeScript Design Tokens
export { COLORS, SPACING, TYPOGRAPHY, ROUNDNESS } from "./tokens";

// Export primary action elements
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";

// Export form and user selection inputs
export {
  Input,
  Select,
  Textarea,
  Checkbox,
  Switch,
  RadioGroup,
  Label
} from "./components/Input";
export type {
  InputProps,
  SelectProps,
  SelectOption,
  TextareaProps,
  CheckboxProps,
  SwitchProps,
  RadioGroupProps,
  RadioOption,
  LabelProps
} from "./components/Input";

// Export visual indicators and badges
export { Badge } from "./components/Badge";
export type { BadgeProps } from "./components/Badge";

// Export container and metrics panels
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  KPICard,
  AlertCard
} from "./components/Card";
export type { KPICardProps, AlertCardProps } from "./components/Card";

// Export high-density table cells & layouts
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell
} from "./components/Table";

// Export technical detail collapse items
export { Accordion, AccordionItem } from "./components/Accordion";
export type { AccordionProps, AccordionItemProps } from "./components/Accordion";

// Export overlay dialog sheets and drawers
export { Modal } from "./components/Modal";
export type { ModalProps } from "./components/Modal";
export { Drawer } from "./components/Drawer";
export type { DrawerProps } from "./components/Drawer";

// Export layout containers
export {
  Sidebar,
  SidebarItem,
  SidebarUserPanel,
  Navbar
} from "./components/Layout";
export type {
  SidebarProps,
  SidebarItemProps,
  SidebarUserPanelProps,
  NavbarProps
} from "./components/Layout";

// Export industrial themed charts container
export { ChartContainer, CHART_COLORS, CHART_PALETTES } from "./components/Chart";
export type { ChartContainerProps } from "./components/Chart";

// Export newly generated enterprise components
export { SearchBar } from "./components/SearchBar";
export type { SearchBarProps } from "./components/SearchBar";

export { FilterPanel } from "./components/FilterPanel";
export type { FilterPanelProps } from "./components/FilterPanel";

export { DataTable } from "./components/DataTable";
export type { DataTableProps, ColumnDef } from "./components/DataTable";

export { CalculationCard } from "./components/CalculationCard";
export type { CalculationCardProps, CalculationLine } from "./components/CalculationCard";

export { Skeleton, SkeletonForm, SkeletonList } from "./components/Skeleton";
export type { SkeletonProps } from "./components/Skeleton";

export { EmptyState } from "./components/EmptyState";
export type { EmptyStateProps } from "./components/EmptyState";

export { SummaryCard } from "./components/SummaryCard";
export type { SummaryCardProps, SummaryItem } from "./components/SummaryCard";

export { AlertBanner } from "./components/AlertBanner";
export type { AlertBannerProps } from "./components/AlertBanner";

