import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  FolderOpen, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  Server,
  LogOut,
  User,
  Bell,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  Building2,
  Briefcase,
  Wallet,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Admin navigation structure matching original Python project
  const adminNavigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      name: 'DATA',
      isHeader: true,
    },
    {
      name: 'Projects',
      icon: FolderOpen,
      children: [
        { name: 'All Projects', href: '/projects' },
        { name: 'Quotations', href: '/quotations' },
        { name: 'Project P&L', href: '/project-profit-loss' },
      ],
    },
    {
      name: 'Server & Domain',
      icon: Server,
      children: [
        { name: 'Hosting Details', href: '/hosting' },
        { name: 'Domain Details', href: '/domains' },
      ],
    },
    {
      name: 'Files & Docs',
      href: '/file-docs',
      icon: FileText,
    },
    {
      name: 'Add Data',
      icon: Database,
      children: [
        { name: 'Designations', href: '/designations' },
        { name: 'Technologies', href: '/technologies' },
        { name: 'App Modes', href: '/app-modes' },
        { name: 'Roles', href: '/roles' },
      ],
    },
    {
      name: 'USERS',
      isHeader: true,
    },
    {
      name: 'Employees',
      icon: Users,
      children: [
        { name: 'All Employees', href: '/users' },
        { name: 'Manage Attendance', href: '/admin-attendance' },
        { name: 'Leaves', href: '/leaves' },
        { name: 'Task Management', href: '/tasks' },
      ],
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Briefcase,
    },
    {
      name: 'PAYMENTS',
      isHeader: true,
    },
    {
      name: 'Payments',
      href: '/payments',
      icon: Wallet,
    },
  ];

  // Staff navigation structure
  const staffNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'WORK',
      isHeader: true,
    },
    {
      name: 'My Work',
      icon: Briefcase,
      children: [
        { name: 'My Tasks', href: '/my-tasks' },
        { name: 'Attendance', href: '/attendance' },
        { name: 'Leave Requests', href: '/leaves' },
        { name: 'My Profile', href: '/my-profile' },
      ],
    },
  ];

  const navigation = user?.is_superuser ? adminNavigation : staffNavigation;
  
  // Debug logging
  console.log('Layout - User:', user);
  console.log('Layout - Is superuser:', user?.is_superuser);
  console.log('Layout - Current location:', location.pathname);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleLogout = () => {
    logout();
  };

  const renderSidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">D</span>
          </div>
          <span className="text-xl font-bold text-gray-900">DigiWave</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item, index) => {
            if (item.isHeader) {
              return (
                <li key={index} className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {item.name}
                </li>
              );
            }

            if (item.children) {
              const isOpen = openMenus[item.name];
              const hasActiveChild = item.children.some(child => location.pathname === child.href);
              
              return (
                <li key={index}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      hasActiveChild || isOpen
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className={`h-5 w-5 mr-3 ${
                        hasActiveChild || isOpen ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      {item.name}
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`} />
                  </button>
                  
                  {isOpen && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child, childIndex) => {
                        const isActive = location.pathname === child.href;
                        return (
                          <li key={childIndex}>
                            <Link
                              to={child.href}
                              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                isActive
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              {child.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            const isActive = location.pathname === item.href;
            return (
              <li key={index}>
                <Link
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
          
          {/* Logout */}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-400" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {renderSidebarContent()}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              
              {/* Search bar */}
              <div className="hidden sm:flex items-center bg-gray-50 rounded-md px-3 py-2 w-80">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-0 outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 rounded-md hover:bg-gray-100 transition-colors relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.is_superuser ? 'Administrator' : 'Staff'}
                  </p>
                </div>
                
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>
                  
                  {/* Dropdown menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <Link 
                        to="/my-profile"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        My Profile
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
