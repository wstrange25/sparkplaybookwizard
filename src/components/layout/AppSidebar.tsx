import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  Zap,
  FileText,
  Bell,
  History,
  Users,
  CalendarDays,
  Settings,
  Sparkles,
  Building2,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isPrincipal, isEA, isGM, isSales, profile } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Principal navigation
  const principalNavItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'Critical Items', url: '/critical', icon: Target },
    { title: 'Team Feed', url: '/team-feed', icon: Users },
    { title: 'Quick Actions', url: '/quick-actions', icon: Zap },
    { title: 'Direction Setting', url: '/direction', icon: MessageSquare },
    { title: 'Reminders', url: '/reminders', icon: Bell },
    { title: 'Meeting Board', url: '/meetings', icon: CalendarDays },
  ];

  // EA navigation (same as principal but read-only indicator)
  const eaNavItems = [
    { title: 'Dashboard', url: '/', icon: LayoutDashboard },
    { title: 'My Tasks', url: '/my-tasks', icon: FileText },
    { title: 'Quick Actions', url: '/quick-actions', icon: Zap },
    { title: 'Meeting Prep', url: '/meeting-prep', icon: CalendarDays },
    { title: 'Team Feed', url: '/team-feed', icon: Users },
  ];

  // Manager/Sales navigation
  const managerNavItems = [
    { title: 'My Focus', url: '/', icon: Target },
    { title: 'Notes from Will', url: '/notes', icon: MessageSquare },
    { title: 'Quick Actions', url: '/quick-actions', icon: Zap },
    { title: 'My Items', url: '/items', icon: FileText },
    { title: 'Weekly Submission', url: '/submission', icon: BarChart3 },
    { title: 'Reminders', url: '/reminders', icon: Bell },
    { title: 'History', url: '/history', icon: History },
  ];

  // GM additional items
  const gmAdditionalItems = [
    { title: 'Team Overview', url: '/team-overview', icon: Users },
    { title: 'Sales Overview', url: '/sales-overview', icon: TrendingUp },
  ];

  // Sales additional items
  const salesAdditionalItems = [
    { title: 'Pipeline', url: '/pipeline', icon: TrendingUp },
    { title: 'Key Deals', url: '/deals', icon: Building2 },
  ];

  // Determine which nav items to show
  let navItems = managerNavItems;
  if (isPrincipal) {
    navItems = principalNavItems;
  } else if (isEA) {
    navItems = eaNavItems;
  }

  return (
    <Sidebar
      className={cn(
        'border-r border-sidebar-border bg-sidebar transition-all duration-300',
        collapsed ? 'w-14' : 'w-60'
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-spark-gold shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Spark Playbook</span>
              <span className="text-xs text-muted-foreground">
                {isPrincipal ? 'Principal' : isEA ? 'EA' : isGM ? 'GM' : isSales ? 'Sales' : 'Manager'}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                        isActive(item.url) && 'bg-sidebar-accent text-sidebar-primary font-medium'
                      )}
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* GM additional sections */}
        {isGM && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
              Team Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {gmAdditionalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Sales additional sections */}
        {isSales && (
          <SidebarGroup>
            <SidebarGroupLabel className={cn(collapsed && 'sr-only')}>
              Sales
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {salesAdditionalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                        activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/settings"
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
