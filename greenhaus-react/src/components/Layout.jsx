import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import { Outlet } from "react-router-dom";

function Layout() {
  

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>

      <RightSidebar />
    </div>
  );
}

export default Layout;