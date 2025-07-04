import React, { useState, useEffect, ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  CreditCard,
  Wrench,
  BarChart3,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  User,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  Zap,
  Shield,
  Award,
  Crown,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// Hooks
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';

// Enhanced Logo Component
const Logo = ({ size = 'md', showText = true, collapsed = false }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean; collapsed?: boolean }) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto',
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const FallbackLogo = () => (
    <div className="flex items-center gap-3">
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-2.5 shadow-lg">
        <Building2 className={`text-white ${iconSizeClasses[size]}`} />
      </div>
      {showText && !collapsed && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ORMI
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Property Management
          </span>
        </div>
      )}
    </div>
  );

  if (imageError) {
    return <FallbackLogo />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <img
          src={theme === 'dark' ? '/ormi_logo_dark.png' : '/ormi-logo.png'}
          alt="ORMI Property Management"
          className={`${sizeClasses[size]} object-contain`}
          onError={() => setImageError(true)}
        />
      </div>
      {showText && !collapsed && (
        <div className="flex flex-col">
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            ORMI
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            Property Management
          </span>
        </div>
      )}
    </div>
  );
};

// Enhanced Theme Switcher
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 rounded-lg hover:bg-muted/50 transition-colors"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  color?: string;
  description?: string;
}

const navigation: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Properties', 
    href: '/properties', 
    icon: Building2,
    description: 'Manage Properties'
  },
  { 
    name: 'Units', 
    href: '/units', 
    icon: Home,
    description: 'Unit Management'
  },
  { 
    name: 'Tenants', 
    href: '/tenants', 
    icon: Users,
    description: 'Tenant Portal'
  },
  { 
    name: 'Payments', 
    href: '/payments', 
    icon: CreditCard,
    description: 'Payment Processing'
  },
  { 
    name: 'Maintenance', 
    href: '/maintenance', 
    icon: Wrench, 
    badge: 3,
    description: 'Work Orders'
  },
  { 
    name: 'Reports', 
    href: '/reports', 
    icon: BarChart3,
    description: 'Analytics & Reports'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'System Configuration'
  },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

// Animation variants
const sidebarVariants = {
  expanded: {
    width: '18rem',
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  collapsed: {
    width: '5rem',
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

const contentVariants = {
  expanded: {
    marginLeft: '18rem',
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  collapsed: {
    marginLeft: '5rem',
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
      if (window.innerWidth < 1280) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={sidebarCollapsed ? 'collapsed' : 'expanded'}
        className="hidden lg:flex flex-col bg-card border-r border-border shadow-sm"
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          navigation={navigation}
          location={location}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </motion.div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 w-72 bg-card shadow-2xl z-50 lg:hidden border-r border-border"
          >
            <SidebarContent
              collapsed={false}
              onToggle={() => setSidebarOpen(false)}
              navigation={navigation}
              location={location}
              mobile
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header */}
        <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 px-4 lg:px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Desktop collapse button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex h-9 w-9 p-0"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" />
                ) : (
                  <PanelLeftClose className="h-5 w-5" />
                )}
              </Button>

              {/* Global Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search properties, tenants, units..."
                  className="w-80 pl-10 pr-4 h-9 bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Help */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              </Button>

              {/* Quick Actions */}
              <Button size="sm" className="hidden sm:flex h-9 gap-2">
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 p-0 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-blue-600 text-white">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="p-3">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3">
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3">
                    <MessageSquare className="mr-3 h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="p-3 text-red-600 focus:text-red-600">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-muted/20">
          <div className="p-4 lg:p-8 max-w-[1800px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Enhanced Sidebar Content
interface SidebarContentProps {
  collapsed: boolean;
  onToggle: () => void;
  navigation: NavItem[];
  location: any;
  mobile?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function SidebarContent({ 
  collapsed, 
  onToggle, 
  navigation, 
  location, 
  mobile = false,
  searchQuery,
  setSearchQuery
}: SidebarContentProps) {
  const filteredNavigation = navigation.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <Link to="/dashboard" className="flex items-center">
          <Logo size="md" showText={!collapsed} collapsed={collapsed} />
        </Link>
        {mobile && (
          <Button variant="ghost" size="sm" onClick={onToggle} className="h-9 w-9 p-0">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Search (Mobile) */}
      {mobile && (
        <div className="p-4 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 h-9 bg-muted/50 border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }
              `}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${collapsed ? 'mx-auto' : ''}`} />
              <AnimatePresence>
                {(!collapsed || mobile) && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex items-center justify-between flex-1 overflow-hidden"
                  >
                    <div className="flex flex-col">
                      <span className="truncate">{item.name}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground/70 truncate">
                          {item.description}
                        </span>
                      )}
                    </div>
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.badge}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border/50">
        <AnimatePresence>
          {(!collapsed || mobile) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Award className="h-3 w-3" />
                <span>© 2024 ORMI™</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 