import LiveClassesPanel from "../../components/chat/LiveClassesPanel";
import PageHeader from "../../components/admin/PageHeader";

const LiveClassesPage = () => (
  <div>
    <PageHeader
      title="Live classes"
      subtitle="Join any scheduled batch session. Admin and participants can start the class."
    />
    <LiveClassesPanel title="" />
  </div>
);

export default LiveClassesPage;
