import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { studentService } from "../services/studentService";
import { ROLES } from "../utils/constants";

export const useStudentEnrollment = () => {
  const { isAuthenticated, user } = useAuth();
  const [enrolled, setEnrolled] = useState(false);
  const [batchCount, setBatchCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const isStudent = isAuthenticated && user?.role === ROLES.STUDENT;

  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    const onEnrollmentChange = () => setTick((t) => t + 1);
    window.addEventListener("student-enrollment-changed", onEnrollmentChange);
    return () => window.removeEventListener("student-enrollment-changed", onEnrollmentChange);
  }, []);

  useEffect(() => {
    if (!isStudent) {
      setEnrolled(false);
      setBatchCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    studentService
      .getEnrollmentStatus()
      .then((r) => {
        if (r.success) {
          setEnrolled(r.data.enrolled);
          setBatchCount(r.data.batchCount);
        }
      })
      .finally(() => setLoading(false));
  }, [isStudent, user?._id, tick]);

  return { enrolled, batchCount, loading, isStudent, refresh };
};
