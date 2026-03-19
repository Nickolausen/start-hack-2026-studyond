import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {theme === 'dark' ? (
        <Sun size={18} strokeWidth={1.8} />
      ) : (
        <Moon size={18} strokeWidth={1.8} />
      )}
    </button>
  )
}
