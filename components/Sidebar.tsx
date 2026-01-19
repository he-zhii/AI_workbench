import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wand2, Settings, MessageSquare } from 'lucide-react';
import { AppRoute } from '../types';

const Sidebar: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-600 text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 z-20">
      <div>
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            A
          </div>
          <span className="hidden md:block ml-3 font-bold text-lg text-gray-800">
            AI Workbench
          </span>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink to={AppRoute.DASHBOARD} className={linkClass}>
            <LayoutDashboard size={20} />
            <span className="hidden md:block font-medium">Dashboard</span>
          </NavLink>
          <NavLink to={AppRoute.GENERATOR} className={linkClass}>
            <Wand2 size={20} />
            <span className="hidden md:block font-medium">Generator</span>
          </NavLink>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100">
        <NavLink to={AppRoute.SETTINGS} className={linkClass}>
          <Settings size={20} />
          <span className="hidden md:block font-medium">Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
