import { Navigate } from "react-router-dom";
import { useStudentEnrollment } from "../hooks/useStudentEnrollment";
import LoadingSpinner from "../components/common/LoadingSpinner";

/** Student portal — after batch enrollment or paid course purchase */
const StudentEnrolledRoute = ({ children }) => {
  const { enrolled, loading, isStudent } = useStudentEnrollment();

  if (!isStudent) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!enrolled) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default StudentEnrolledRoute;
