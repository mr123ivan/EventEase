import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, FileText , Calendar} from "lucide-react";

const NavPanel = () => {
  return (
    <div className="h-screen bg-white">
      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4">
        <NavLink
          to="/subcontractor/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition 
            ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        
                  <NavLink
          to="/subcontractor/progress"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition 
            ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`
          }
        >
          <LayoutDashboard size={20} />
          Event Assigned
        </NavLink>

        <NavLink
          to="/subcontractor/transactions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition 
            ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`
          }
        >
          <CreditCard size={20} />
          Transaction
        </NavLink>

{/* added a new section in sidepanel -ivan */}
        <NavLink
          to="/subcontractor/calendar"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-md transition 
            ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`
          }
        >
          <Calendar size={20} />
          Calendar
        </NavLink>

        {/*<NavLink*/}
        {/*  to="/showcase"*/}
        {/*  className={({ isActive }) =>*/}
        {/*    `flex items-center gap-3 px-3 py-2 rounded-md transition */}
        {/*    ${isActive ? "text-blue-600 font-semibold" : "text-gray-600 hover:text-blue-500"}`*/}
        {/*  }*/}
        {/*>*/}
        {/*  <FileText size={20} />*/}
        {/*  Showcase*/}
        {/*</NavLink>*/}
      </nav>
    </div>
  );
};

export default NavPanel;
