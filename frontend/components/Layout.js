import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  PackageIcon,
  TruckIcon,
  WarehouseIcon,
  FactoryIcon,
  DollarSignIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Collection & Points', href: '/collection', icon: PackageIcon },
    { name: 'Transport', href: '/transport', icon: TruckIcon },
    { name: 'Inventory', href: '/inventory', icon: WarehouseIcon },
    { name: 'Production', href: '/production', icon: FactoryIcon },
    { name: 'Sales & Finance', href: '/sales', icon: DollarSignIcon },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-green-800 transition duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 text-white">
          <span className="text-xl font-semibold">Bottle Recycling</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-5 px-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`mt-1 flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              className="text-gray-500 focus:outline-none lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            <span className="text-lg font-semibold text-gray-800 lg:hidden">
              Bottle Recycling
            </span>

            <div className="flex items-center">
              <button className="flex items-center rounded-full bg-green-100 p-1 text-sm focus:outline-none">
                <img
                  className="h-8 w-8 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User avatar"
                />
                <span className="ml-2 mr-2 text-sm font-medium text-gray-700">
                  Admin
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
