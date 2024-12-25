import { Navigate, useParams } from "react-router-dom";

import ContactCallPageComponent from "../components/ContactCallPageComponent";
import ChannelCallPageComponent from "../components/ChannelCallPageComponent";
import useAuth from "../hooks/useAuth";

interface CallPageProps {
  isContactPage: boolean;
}

const CallPage = ({ isContactPage }: CallPageProps) => {
  const { userId } = useAuth();
  const { id } = useParams();

  return userId && id ? (
    isContactPage ? (
      <ContactCallPageComponent localUserId={userId} contactRelationId={id} />
    ) : (
      <ChannelCallPageComponent localUserId={userId} channelId={id} />
    )
  ) : (
    <Navigate to="/profile" replace />
  );
};

export default CallPage;
