import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { studentService } from "../../services/studentService";
import ResumePreview from "../../components/resume/ResumePreview";
import Button from "../../components/common/Button";

const StudentResumePage = () => {
  const [data, setData] = useState(null);

  const load = () => {
    studentService.getResumeData().then((r) => r.success && setData(r.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between gap-4 mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">Resume builder</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm max-w-xl">
            Built from your profile and course progress. Submit assignments and complete
            classes — then refresh to update achievements on your resume.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button type="button" variant="outline" onClick={load}>
            Refresh from progress
          </Button>
          <Button type="button" onClick={handlePrint}>
            Print / Save PDF
          </Button>
          <Link to="/student/profile">
            <Button variant="outline">Edit profile</Button>
          </Link>
        </div>
      </div>
      <ResumePreview data={data} />
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-print, #resume-print * { visibility: visible; }
          #resume-print { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default StudentResumePage;
