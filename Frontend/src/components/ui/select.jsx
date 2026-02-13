/**
 * Custom Select Component
 * 
 * A fully responsive, accessible select dropdown built with Radix UI
 * 
 * Features:
 * - Smooth animations and transitions
 * - Mobile-optimized touch targets (48px+)
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Error state support (add .error className)
 * - Size variants: sm, default, lg
 * - Auto-positioning dropdown
 * 
 * Styling:
 * All styles are in utilities.css under "CUSTOM SELECT COMPONENT"
 * Uses custom-select-* classes for consistency
 * 
 * @example
 * <Select value={value} onValueChange={setValue}>
 *   <SelectTrigger className={error ? 'error' : ''}>
 *     <SelectValue placeholder="Choose an option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="1">Option 1</SelectItem>
 *     <SelectItem value="2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 */

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "custom-select-trigger",
        size === "sm" && "custom-select-trigger-sm",
        size === "lg" && "custom-select-trigger-lg",
        className
      )}
      {...props}>
      <span className="custom-select-trigger-content">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="custom-select-icon" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "custom-select-dropdown",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("custom-select-viewport", position === "popper" && "custom-select-viewport-popper")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("custom-select-label", className)}
      {...props} />
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "custom-select-item",
        className
      )}
      {...props}>
      <span className="custom-select-item-indicator">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="custom-select-check-icon" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="custom-select-item-text">{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("custom-select-separator", className)}
      {...props} />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("custom-select-scroll", className)}
      {...props}>
      <ChevronUpIcon className="custom-select-scroll-icon" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("custom-select-scroll", className)}
      {...props}>
      <ChevronDownIcon className="custom-select-scroll-icon" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
