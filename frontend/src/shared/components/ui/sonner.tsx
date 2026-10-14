import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useThemeStore } from "@/shared/store/theme.store"

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useThemeStore((state) => state.theme)
  return <Sonner theme={theme} richColors position="top-right" {...props} />
}

export { Toaster }