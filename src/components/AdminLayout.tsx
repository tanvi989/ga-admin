'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  email: string;
  role: string;
  name: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [showEmails, setShowEmails] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const sampleEmails = [
    { id: 1, from: 'Vision Opticals', subject: 'Bulk Order Inquiry - Summer Collection', time: '2h ago', preview: 'We are interested in ordering 500 units of the BERG classic frames...' },
    { id: 2, from: 'Stripe Billing', subject: 'Payment Successful: ORD-9928', time: '5h ago', preview: 'The payment of £1,450.00 from João Souza Silva has been processed...' },
    { id: 3, from: 'Warehouse Ops', subject: 'Low Stock Alert: Face-a-Face E10C', time: 'Yesterday', preview: 'The inventory for SKU E10C1031 has dropped below the threshold of 5 units...' }
  ];

  const sampleNotifications = [
    { id: 1, title: 'New Order Received', message: 'Order #ORD-176589111 was placed by a new customer.', time: '10m ago' },
    { id: 2, title: 'Server Health', message: 'MongoDB connection is stable. Latency: 45ms.', time: '1h ago' },
    { id: 3, title: 'System Update', message: 'V2.4 Dashboard update is now live.', time: '4h ago' }
  ];

  useEffect(() => {
    setIsSessionLoading(true);
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
        } else {
          if (window.location.pathname !== '/login') {
            router.push('/login');
          }
        }
      })
      .catch(() => {
        if (window.location.pathname !== '/login') {
          router.push('/login');
        }
      })
      .finally(() => {
        setIsSessionLoading(false);
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const allNavItems = [
    { href: '/', label: 'Dashboard', roles: ['admin', 'hr', 'investor', 'sales', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/analytics', label: 'Analytics', roles: ['admin', 'investor'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
    { href: '/orders', label: 'Orders', roles: ['admin', 'sales', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )},
    { href: '/payments', label: 'Payments', roles: ['admin', 'sales'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
    { href: '/products', label: 'Products', roles: ['admin', 'sales', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { href: '/products/add', label: 'Add Product', roles: ['admin', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { href: '/users', label: 'Users', roles: ['admin', 'hr'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 15.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { href: '/upload', label: 'Upload', roles: ['admin', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    )},
    { href: '/logistics', label: 'Logistics', roles: ['admin', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1m-6 0a1 1 0 001-1" />
      </svg>
    )},
    { href: '/shipping', label: 'Shipping', roles: ['admin', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )},
    { href: '/track-orders', label: 'Track Orders', roles: ['admin', 'sales', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { href: '/returns', label: 'Returns', roles: ['admin', 'ops'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
      </svg>
    )},
    { href: '/settings', label: 'Settings', roles: ['admin'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { href: '/settings/team', label: 'Team & Roles', roles: ['admin'], icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
  ];

  const navItems = allNavItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for Desktop */}
      <aside 
        className={`bg-white border-r border-gray-100 transition-all duration-300 ease-in-out hidden md:flex flex-col sticky top-0 h-screen ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between h-16">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 pl-2">
              <img src="https://cdn.multifolks.com/desktop/images/multifolks-logo.svg" alt="Multifolks Logo" className="h-8 w-auto" />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <img src="https://cdn.multifolks.com/desktop/images/multifolks-logo.svg" alt="Multifolks Logo" className="h-8 w-8 object-contain" />
            </div>
          )}
        </div>

        <div className="px-3 mb-4">
           <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all text-gray-600 hover:text-blue-600"
          >
            <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
            </svg>
            {!isCollapsed && <span className="ml-3 font-medium">Collapse</span>}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {isSessionLoading ? (
            <div className="space-y-2 px-4 py-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-full w-full"></div>
              ))}
            </div>
          ) : (
            navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center h-12 rounded-full transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className={`flex items-center justify-center ${isCollapsed ? 'w-full' : 'w-14'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  )}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all transform translate-x-[-10px] group-hover:translate-x-0 z-50 whitespace-nowrap shadow-xl">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {isSessionLoading ? (
            <div className="flex items-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-slate-100"></div>
              {!isCollapsed && (
                <div className="ml-3 space-y-2 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-100 rounded w-1/2"></div>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold uppercase">
                {user?.name?.substring(0, 2) || 'AD'}
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-gray-500 truncate uppercase tracking-tighter font-bold text-blue-600">{user?.role || 'admin'}</p>
                </div>
              )}
              {!isCollapsed && (
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 z-40 px-4 flex items-center justify-between">
        <img src="https://cdn.multifolks.com/desktop/images/multifolks-logo.svg" alt="Multifolks Logo" className="h-8 w-auto" />
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-50"
          onClick={() => setIsMobileOpen(false)}
        >
          <div 
            className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 h-16 flex items-center justify-between">
              <img src="https://cdn.multifolks.com/desktop/images/multifolks-logo.svg" alt="Multifolks Logo" className="h-8 w-auto" />
              <button onClick={() => setIsMobileOpen(false)} className="p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 py-4">
              {isSessionLoading ? (
                <div className="space-y-2 px-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-xl w-full"></div>
                  ))}
                </div>
              ) : (
                navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center px-4 py-3 mx-2 rounded-xl mb-1 ${
                      pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span className="ml-3 font-medium">{item.label}</span>
                  </Link>
                ))
              )}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col pt-16 md:pt-0">
        <header className="bg-white border-b border-gray-200 h-16 hidden md:flex items-center justify-between px-8 sticky top-0 z-30">
          <h2 className="text-lg font-semibold text-gray-800 capitalize">
            {pathname === '/' ? 'Overview' : pathname.split('/')[1]}
          </h2>
          <div className="flex items-center gap-4 relative">
            <div className="relative">
              <button 
                onClick={() => { setShowNotifications(!showNotifications); setShowEmails(false); }}
                className={`p-2 rounded-xl transition-all ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-6 bg-slate-900 text-white">
                    <h3 className="font-black text-sm uppercase tracking-widest">Notifications</h3>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                    {sampleNotifications.map(n => (
                      <div key={n.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                        <p className="text-xs font-black text-slate-900 mb-1">{n.title}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-4 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Clear All</button>
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => { setShowEmails(!showEmails); setShowNotifications(false); }}
                className={`p-2 rounded-xl transition-all ${showEmails ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
              </button>

              {showEmails && (
                <div className="absolute right-0 mt-3 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-widest">Inbox</h3>
                      <p className="text-[10px] text-blue-100 font-bold">sales@multifolks.com</p>
                    </div>
                    <span className="px-2 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase">3 New</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                    {sampleEmails.map(email => (
                      <div key={email.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">{email.from}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{email.time}</p>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 mb-1">{email.subject}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{email.preview}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-5 bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors border-t border-slate-100">Open Full Mailbox</button>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome Back</span>
              <span className="text-sm font-black text-slate-900 tracking-tight">{user?.name || 'Super Admin'}</span>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
