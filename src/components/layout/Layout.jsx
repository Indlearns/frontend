import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import StudentEnrollBanner from "../student/StudentEnrollBanner";
import PageTransition from "../common/PageTransition";
import WhatsAppFloat from "../common/WhatsAppFloat";

/**
 * Main layout wrapper - Navbar + page content + Footer
 * Outlet renders the child route (Home, Login, etc.)
 */
const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <StudentEnrollBanner />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Layout;
