import LiveClassesPanel from "../../components/chat/LiveClassesPanel";
import PageHeader from "../../components/admin/PageHeader";

const LiveClassesPage = () => (
  <div>
    <PageHeader
      title="Live classes"
      subtitle="Join any scheduled batch session. Recording starts for tutor/admin; students can watch saved recordings below."
    />
    <LiveClassesPanel title="" showRecordings />
  </div>
);

export default LiveClassesPage;
