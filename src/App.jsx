import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
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
        <BrowserRouter>
          <GoogleAnalytics />
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
