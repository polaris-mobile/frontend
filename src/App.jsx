import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Home,
  Map,
  List,
  BarChart2,
  Settings as SettingsIcon,
  LogOut,
  PieChart,
} from "lucide-react";

// Import your page components
import Dashboard from "./components/Dashboard";
import MapView from "./components/MapView";
import TableView from "./components/TableView";
import ChartsView from "./components/ChartsView";
import Settings from "./components/Settings";
import ActiveTestsView from "./components/ActiveTestsView";
import DataAnalysis from "./components/DataAnalysis"; // New analysis component
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import { AdminProvider } from "./context/AdminContext";
import logo from "./assets/logos/logo.png";
import { ThemeProvider } from './context/ThemeContext'; 
import { Sun, Moon } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';


// The main layout with a sidebar that wraps all pages
const MainLayout = () => {
  const location = useLocation();
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Dashboard" },
    { path: "/map", icon: Map, label: "Map View" },
    { path: "/table", icon: List, label: "Table View" },
    { path: "/charts", icon: BarChart2, label: "Passive Charts" },
    { path: "/active-tests", icon: BarChart2, label: "Active Test Charts" },
    { path: "/analysis", icon: PieChart, label: "Data Analysis" },
    { path: "/settings", icon: SettingsIcon, label: "Settings" },
  ];
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.clear(); // Clear all auth data
    navigate("/login");
  };
  return (
    <div className="flex h-screen bg-app font-sans text-primary">
      <aside className="w-64 bg-sidebar text-inverted flex flex-col flex-shrink-0">
        <div className="flex p-4 text-2xl font-bold border-b border-default">
        <div className="flex">
            <img
              src={logo}
              alt="Polaris Logo"
              className="w-7 h-7 mr-3 mt-1 rounded-full"
            />
          </div>
          <div className="flex">Polaris</div>
          <ThemeToggle />
          
        </div>
        <nav className="flex-1 p-2 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-gray-900"
                  : "hover:bg-gray-700"
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        {/* A placeholder for a potential future logout button */}
        <div className="p-2 border-t border-default">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {/* Child routes will render here */}
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
       <ThemeProvider>
      <AdminProvider>
        <Routes>
          {/* All routes are now children of the MainLayout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="map" element={<MapView />} />
              <Route path="table" element={<TableView />} />
              <Route path="charts" element={<ChartsView />} />
              <Route path="active-tests" element={<ActiveTestsView />} />
              <Route path="analysis" element={<DataAnalysis />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
          {/* A simple redirect for any other path */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AdminProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
