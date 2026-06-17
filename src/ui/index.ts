// Reusable UI primitive library.
// Import shared components from here, e.g. `import { Button, Icon } from "@/src/ui"`.

export { cn } from "./cn";
export { Icon } from "./Icon";
export type { IconProps } from "./Icon";
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";
export { IconButton } from "./IconButton";
export type { IconButtonProps } from "./IconButton";
export { Badge } from "./Badge";
export type { BadgeProps, BadgeTone } from "./Badge";
export { TextField, inputClass } from "./TextField";
export type { TextFieldProps } from "./TextField";
export { Card } from "./Card";
export type { CardProps } from "./Card";
export { SegmentedControl } from "./SegmentedControl";
export type { SegmentedControlProps, SegmentedOption } from "./SegmentedControl";
export { NavButton } from "./NavButton";
export type { NavButtonProps } from "./NavButton";

// Pre-existing shared shells / inputs, now part of the library surface.
export { SearchBar } from "./SearchBar";
export { StandardDrawer } from "./StandardDrawer";
export { StandardModal } from "./StandardModal";
export { TableActionMenu } from "./TableActionMenu";
export { TruncateWithTooltip } from "./TruncateWithTooltip";
export { AutocompleteInput } from "./AutocompleteInput";
