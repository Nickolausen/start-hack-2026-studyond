import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const location = useLocation();
  const { profile, savedThreads } = useAppStore();
  const unreadCount = savedThreads.filter((t) => !t.isRead).length;
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="header border-b border-border px-4 lg:px-8 items-center">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center gap-2 flex-shrink-0">
        <img
          src="/studyond.svg"
          alt="Studyond"
          className="h-6 w-auto dark:invert"
        />
      </Link>

      {/* Center: AI Chat CTA — the focal point */}
      <div className='w-full flex justify-center gap-4'>
        <Link className='my-auto' to="/">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full relative ${isActive('/') ? 'bg-muted' : ''}`}
            aria-label="Home"
          >
            <Home className="size-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-4 bg-primary text-primary-foreground rounded-full text-[10px] font-medium flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>

        <Link to="/chat">
          <Button
            className={`
              bg-ai ai-pulse
              h-10 px-5 rounded-full gap-2 font-medium text-sm
              hover:opacity-90 transition-opacity
              ${isActive('/chat') ? 'opacity-100' : 'opacity-95'}
            `}
          >
            <Sparkles className="size-4" />
            AI Thesis Advisor
          </Button>
        </Link>

        <div className='flex items-center'>
          <Link to="/profile">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isActive('/profile') ? 'bg-muted' : ''}`}
              aria-label="Profile"
            >
              <Avatar className="size-7">
                <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </Link>
        </div>
      </div>

      {/* Right: Nav items */}
      <div className="flex items-center gap-1">
        {/* <Link to="/">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full relative ${isActive('/') ? 'bg-muted' : ''}`}
            aria-label="Home"
          >
            <Home className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 size-4 bg-primary text-primary-foreground rounded-full text-[10px] font-medium flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
        </Link>

        <Link to="/profile">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isActive('/profile') ? 'bg-muted' : ''}`}
            aria-label="Profile"
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </Button>
        </Link> */}

        <div className="ml-1">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
