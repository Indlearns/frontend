import AdminChatPanel from "../../components/chat/AdminChatPanel";
import PageHeader from "../../components/admin/PageHeader";

const ChatPage = () => (
  <div>
    <PageHeader
      title="Conversations"
      subtitle="Open batch chats or start 1-on-1 and group conversations with tutors, students, admins, and super admins."
    />
    <AdminChatPanel />
  </div>
);

export default ChatPage;
