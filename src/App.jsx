import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AffiliateAuthProvider } from "./contexts/AffiliateAuthContext";
import AffiliateCapture from "./components/affiliate/AffiliateCapture";
import GoogleAnalytics from "./components/analytics/GoogleAnalytics";
import AppRoutes from "./routes/AppRoutes";

/**
 * Root App component
 * Wraps the app with Theme + Auth providers and Router
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AffiliateAuthProvider>
          <BrowserRouter>
            <GoogleAnalytics />
            <AffiliateCapture />
            <AppRoutes />
          </BrowserRouter>
        </AffiliateAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
