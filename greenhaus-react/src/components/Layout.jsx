import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";

import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="app-layout">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={24} />
      </button>

      <div
        className={`mobile-sidebar-overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <div className={`mobile-sidebar ${sidebarOpen ? "open" : ""}`}>
        <button
          type="button"
          className="mobile-sidebar-close"
          onClick={closeSidebar}
          aria-label="Close navigation"
        >
          <X size={24} />
        </button>

        <Sidebar onNavigate={closeSidebar} />
      </div>

      <div className="desktop-sidebar">
        <Sidebar />
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      <RightSidebar />
    </div>
  );
}

export default Layout;
