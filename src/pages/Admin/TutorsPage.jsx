import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import CreateTutorForm from "../../components/admin/CreateTutorForm";
import TutorList from "../../components/admin/TutorList";
import PageHeader from "../../components/admin/PageHeader";

const TutorsPage = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await adminService.getTutors();
    if (r.success) setTutors(r.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Tutors" subtitle="Add tutors and share login credentials." />
      <div className="grid lg:grid-cols-2 gap-8">
        <CreateTutorForm onCreated={load} />
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg mb-4">All Tutors ({tutors.length})</h2>
          <TutorList tutors={tutors} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default TutorsPage;
