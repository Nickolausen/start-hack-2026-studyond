import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Settings, MessageSquare, Bookmark, LogOut, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

interface MobileNavProps {
  progressTitle?: string;
}

export function MobileNav({ progressTitle }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAppStore();

  const navItems = [
    {
      label: 'Profile',
      icon: Star,
      href: '/profile',
    },
    {
      label: 'Chat',
      icon: MessageSquare,
      href: '/chat',
    },
    {
      label: 'Threads',
      icon: Bookmark,
      href: '/',
    },
  ];

  const handleNavigate = () => {
    setOpen(false);
  };

  return (
    <div className="md:hidden flex items-center justify-between h-16 px-4 bg-background border-b border-border sticky top-0 z-40">
      {/* Hamburger Menu */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-lg">
            <Menu className="size-5 text-foreground" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-card border-border">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-foreground text-left">
              {/* Left: Logo */}
              <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                <img
                  src="/studyond.svg"
                  alt="Studyond"
                  className="h-6 w-auto dark:invert"
                />
              </Link>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={handleNavigate}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary text-foreground ds-label transition-colors"
                >
                  <Icon className="size-4 text-muted-foreground flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <hr className="my-2 border-border" />
            <button
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-secondary text-foreground ds-label transition-colors text-left"
            >
              <LogOut className="size-4 text-muted-foreground flex-shrink-0" />
              <span>Logout</span>
            </button>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Title */}
      <div className="flex-1 text-center">
        <p className="ds-label text-muted-foreground truncate">
          {progressTitle || 'Your Thesis'}
        </p>
      </div>

    </div>
  );
}
