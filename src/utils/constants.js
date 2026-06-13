export const APP_NAME = "IndLearn";
export const APP_TAGLINE = "Build Your Future";

export const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  TUTOR: "tutor",
  STUDENT: "student",
};

export const SUPER_ADMIN_EMAIL = "official@indlearns.com";

/** Private URLs — bookmark only, not on public menu */
export const SUPERADMIN_LOGIN_PATH = "/superadmin/login";
export const ADMIN_LOGIN_PATH = "/admins/login";

export const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Admin",
  tutor: "Tutor",
  student: "Student",
};

export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Courses", path: "/courses" },
  { label: "Workshops", path: "/workshops" },
  { label: "Events", path: "/events" },
  { label: "Mentorship", path: "/mentorship" },
];

/** Shown in main navbar when student is enrolled in a batch */
export const ENROLLED_STUDENT_NAV = [
  { label: "Home", path: "/" },
  { label: "My Courses", path: "/student/courses" },
  { label: "Workshops", path: "/workshops" },
  { label: "Events", path: "/events" },
  { label: "Mentorship", path: "/mentorship" },
  { label: "My Progress", path: "/student/progress" },
  { label: "Career", path: "/student/career" },
];

export const FEATURES = [
  {
    title: "Live Classes",
    description:
      "Attend interactive live sessions with expert tutors and real-time doubt clearing.",
    icon: "live",
  },
  {
    title: "Assignments & Projects",
    description:
      "Practice with hands-on assignments and industry-grade projects reviewed by mentors.",
    icon: "project",
  },
  {
    title: "Assessments",
    description:
      "Track your skills with structured assessments and detailed performance insights.",
    icon: "assessment",
  },
  {
    title: "Community",
    description:
      "Connect with peers, share knowledge, and grow together in a vibrant learning community.",
    icon: "community",
  },
  {
    title: "Mentorship",
    description:
      "Get personalized guidance from industry professionals to accelerate your career.",
    icon: "mentor",
  },
  {
    title: "Workshops & Events",
    description:
      "Join exclusive workshops and events to stay ahead in your learning journey.",
    icon: "event",
  },
];

export const STATS = [
  { value: "10K+", label: "Active Students" },
  { value: "500+", label: "Expert Tutors" },
  { value: "200+", label: "Courses" },
  { value: "95%", label: "Placement Rate" },
];
