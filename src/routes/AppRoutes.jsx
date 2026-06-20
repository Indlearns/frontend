import { Routes, Route, Navigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import AdminLayout from "../components/admin/layout/AdminLayout";
import HomePage from "../pages/Home/HomePage";
import LoginPage from "../pages/Auth/LoginPage";
import SuperAdminLoginPage from "../pages/Auth/SuperAdminLoginPage";
import StaffAdminLoginPage from "../pages/Auth/StaffAdminLoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";
import TutorLayout from "../components/tutor/layout/TutorLayout";
import StudentLayout from "../components/student/layout/StudentLayout";
import TutorOverviewPage from "../pages/Tutor/TutorOverviewPage";
import TutorBatchesPage from "../pages/Tutor/TutorBatchesPage";
import TutorChatPage from "../pages/Tutor/TutorChatPage";
import TutorClassesPage from "../pages/Tutor/TutorClassesPage";
import TutorAssignmentsPage from "../pages/Tutor/TutorAssignmentsPage";
import TutorMeetingsPage from "../pages/Tutor/TutorMeetingsPage";
import StudentOverviewPage from "../pages/Student/StudentOverviewPage";
import StudentChatPage from "../pages/Student/StudentChatPage";
import StudentClassesPage from "../pages/Student/StudentClassesPage";
import StudentAssignmentsPage from "../pages/Student/StudentAssignmentsPage";
import StudentMeetingsPage from "../pages/Student/StudentMeetingsPage";
import StudentMyCoursesPage from "../pages/Student/StudentMyCoursesPage";
import StudentCourseDashboardPage from "../pages/Student/StudentCourseDashboardPage";
import StudentProgressPage from "../pages/Student/StudentProgressPage";
import StudentCareerPage from "../pages/Student/StudentCareerPage";
import StudentProfilePage from "../pages/Student/StudentProfilePage";
import StudentResumePage from "../pages/Student/StudentResumePage";
import OverviewPage from "../pages/Admin/OverviewPage";
import TutorsPage from "../pages/Admin/TutorsPage";
import StudentsPage from "../pages/Admin/StudentsPage";
import AdminCoursesPage from "../pages/Admin/CoursesPage";
import AdminWorkshopsPage from "../pages/Admin/WorkshopsPage";
import BatchesPage from "../pages/Admin/BatchesPage";
import SchedulePage from "../pages/Admin/SchedulePage";
import CompaniesPage from "../pages/Admin/CompaniesPage";
import ChatPage from "../pages/Admin/ChatPage";
import LiveClassesPage from "../pages/Admin/LiveClassesPage";
import StaffAdminsPage from "../pages/Admin/StaffAdminsPage";
import CoursesPage from "../pages/Public/CoursesPage";
import CheckoutPage from "../pages/Public/CheckoutPage";
import CourseDetailPage from "../pages/Public/CourseDetailPage";
import WorkshopsPage from "../pages/Public/WorkshopsPage";
import WorkshopDetailPage from "../pages/Public/WorkshopDetailPage";
import EventsPage from "../pages/Public/EventsPage";
import MentorshipPage from "../pages/Public/MentorshipPage";
import PrivacyPolicyPage from "../pages/Legal/PrivacyPolicyPage";
import TermsPage from "../pages/Legal/TermsPage";
import RefundPolicyPage from "../pages/Legal/RefundPolicyPage";
import AboutPage from "../pages/Public/AboutPage";
import ContactPage from "../pages/Public/ContactPage";
import PaymentReturnPage from "../pages/Public/PaymentReturnPage";
import ZohoOAuthCallbackPage from "../pages/Public/ZohoOAuthCallbackPage";
import NotFoundPage from "../pages/NotFoundPage";
import PartnerLoginPage from "../pages/Auth/PartnerLoginPage";
import PartnerLayout from "../components/partner/layout/PartnerLayout";
import PartnerOverviewPage from "../pages/Partner/PartnerOverviewPage";
import PartnerJobsPage from "../pages/Partner/PartnerJobsPage";
import PartnerApplicationsPage from "../pages/Partner/PartnerApplicationsPage";
import ProtectedRoute from "./ProtectedRoute";
import StudentEnrolledRoute from "./StudentEnrolledRoute";
import { ROLES } from "../utils/constants";

const staffRoles = [ROLES.ADMIN, ROLES.SUPERADMIN];

const LegacyCourseCheckoutRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/checkout/course/${id}`} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="superadmin/login" element={<SuperAdminLoginPage />} />
    <Route path="admins/login" element={<StaffAdminLoginPage />} />
    <Route path="partners/login" element={<PartnerLoginPage />} />

    {/* Legacy URL → unified admin portal */}
    <Route path="superadmin" element={<Navigate to="/admin" replace />} />

    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={staffRoles}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<OverviewPage />} />
      <Route path="tutors" element={<TutorsPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="courses" element={<AdminCoursesPage />} />
      <Route path="workshops" element={<AdminWorkshopsPage />} />
      <Route path="batches" element={<BatchesPage />} />
      <Route path="schedule" element={<SchedulePage />} />
      <Route path="live-classes" element={<LiveClassesPage />} />
      <Route path="companies" element={<CompaniesPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="staff-admins" element={<StaffAdminsPage />} />
    </Route>

    <Route
      path="/tutor"
      element={
        <ProtectedRoute allowedRoles={[ROLES.TUTOR]}>
          <TutorLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<TutorOverviewPage />} />
      <Route path="batches" element={<TutorBatchesPage />} />
      <Route path="chat" element={<TutorChatPage />} />
      <Route path="classes" element={<TutorClassesPage />} />
      <Route path="assignments" element={<TutorAssignmentsPage />} />
      <Route path="meetings" element={<TutorMeetingsPage />} />
    </Route>

    <Route
      path="/student"
      element={
        <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
          <StudentEnrolledRoute>
            <StudentLayout />
          </StudentEnrolledRoute>
        </ProtectedRoute>
      }
    >
      <Route index element={<StudentOverviewPage />} />
      <Route path="courses" element={<StudentMyCoursesPage />} />
      <Route path="courses/:batchId" element={<StudentCourseDashboardPage />} />
      <Route path="progress" element={<StudentProgressPage />} />
      <Route path="career" element={<StudentCareerPage />} />
      <Route path="profile" element={<StudentProfilePage />} />
      <Route path="resume" element={<StudentResumePage />} />
      <Route path="chat" element={<StudentChatPage />} />
      <Route path="classes" element={<StudentClassesPage />} />
      <Route path="assignments" element={<StudentAssignmentsPage />} />
      <Route path="meetings" element={<StudentMeetingsPage />} />
    </Route>

    <Route
      path="/partner"
      element={
        <ProtectedRoute allowedRoles={[ROLES.PARTNER]}>
          <PartnerLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<PartnerOverviewPage />} />
      <Route path="jobs" element={<PartnerJobsPage />} />
      <Route path="applications" element={<PartnerApplicationsPage />} />
    </Route>

    <Route element={<Layout />}>
      <Route index element={<HomePage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />
      <Route path="courses" element={<CoursesPage />} />
      <Route path="courses/:id" element={<CourseDetailPage />} />
      <Route path="checkout/:type/:id" element={<CheckoutPage />} />
      <Route path="payment/return" element={<PaymentReturnPage />} />
      <Route path="zoho/oauth/callback" element={<ZohoOAuthCallbackPage />} />
      <Route path="courses/:id/checkout" element={<LegacyCourseCheckoutRedirect />} />
      <Route path="workshops" element={<WorkshopsPage />} />
      <Route path="workshops/:id" element={<WorkshopDetailPage />} />
      <Route path="events" element={<EventsPage />} />
      <Route path="events/:id" element={<WorkshopDetailPage />} />
      <Route path="mentorship" element={<MentorshipPage />} />
      <Route path="privacy" element={<PrivacyPolicyPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="refund" element={<RefundPolicyPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
