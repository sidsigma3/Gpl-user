import { Home, Trophy, Users, Vote, Menu } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const tabs = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Matches', path: '/matches', icon: Trophy },
  { name: 'Rankings', path: '/standings', icon: Trophy },
  { name: 'Vote', path: '/vote', icon: Vote },
  { name: 'News', path: '/more', icon: Menu },
]

export default function BottomTabNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-gray-800 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 transition-colors",
                isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
              )}
            >
              <Icon size={24} className={cn(isActive && "fill-accent/20")} />
              <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
