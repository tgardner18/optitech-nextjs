import Button from "@/components/ui/Button";
import type { ButtonVariant, ButtonSize } from "@/components/ui/Button";
import { ICON_REGISTRY } from "@/components/icons/iconRegistry";
import { cn } from "@/lib/utils";

// ─── Style option types ───────────────────────────────────────────────────────

/** "none" + any key from the shared icon registry */
export type ButtonIconKey = "none" | keyof typeof ICON_REGISTRY;

export type ButtonIconPosition = "leading" | "trailing";
export type ButtonAlignment    = "left" | "center" | "right";

export type ButtonBlockStyleOptions = {
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  icon?:         ButtonIconKey;
  iconPosition?: ButtonIconPosition;
  alignment?:    ButtonAlignment;
  fullWidth?:    boolean;
};

export type ButtonBlockProps = {
  label:         string;
  url?:          string;
  styleOptions?: ButtonBlockStyleOptions;
};

const ALIGN_CLASS: Record<ButtonAlignment, string> = {
  left:   "flex justify-start",
  center: "flex justify-center",
  right:  "flex justify-end",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ButtonBlock({
  label,
  url,
  styleOptions = {},
}: ButtonBlockProps) {
  const {
    variant      = "brand",
    size         = "md",
    icon         = "none",
    iconPosition = "trailing",
    alignment    = "left",
    fullWidth    = false,
  } = styleOptions;

  const IconComp   = icon !== "none" ? ICON_REGISTRY[icon] : undefined;
  const iconEl     = IconComp ? <IconComp /> : undefined;
  const leadingIcon  = iconEl && iconPosition === "leading"  ? iconEl : undefined;
  const trailingIcon = iconEl && iconPosition === "trailing" ? iconEl : undefined;

  return (
    <div className={cn(ALIGN_CLASS[alignment], "w-full")}>
      <Button
        variant={variant}
        size={size}
        href={url}
        leadingIcon={leadingIcon}
        trailingIcon={trailingIcon}
        className={fullWidth ? "w-full" : undefined}
      >
        {label}
      </Button>
    </div>
  );
}
