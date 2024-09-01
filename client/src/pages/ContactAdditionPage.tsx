import { SubmitHandler } from "react-hook-form";
import { useAlert } from "react-alert";

import ContactAdditionForm from "../components/ContactAdditionForm";
import useDocumentTitle from "../hooks/useDocumentTitle";
import useAuth from "../hooks/useAuth";
import useRTMClient from "../hooks/useRTMClient";
import { useCreateRequestMutation } from "../services/mainService";
import getErrorMessage from "../utils/getErrorMessage";
import { RequestTypeEnum } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

const ContactAdditionPage = () => {
  const [createRequest] = useCreateRequestMutation();
  const { userId } = useAuth();
  const RTMClient = useRTMClient();
  const alert = useAlert();

  useDocumentTitle("Add a contact");

  const handleSubmit: SubmitHandler<{ contactId: string }> = async ({
    contactId,
  }) => {
    if (!userId) return;

    try {
      await createRequest({
        from: userId,
        to: contactId,
        type: RequestTypeEnum.Contact,
      }).unwrap();
      await RTMClient.sendMessageToPeer(
        { text: PeerMessage.RequestCreated },
        contactId,
      );
      alert.success("Request created successfully!");
    } catch (err) {
      throw new Error(
        getErrorMessage({
          error: err,
          defaultErrorMessage:
            "Could not send a contact request. Please try again",
        }),
      );
    }
  };

  return (
    <div className="flex h-full w-full flex-col justify-center gap-12">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl xl:text-4xl">
        Add a contact
      </h1>

      <ContactAdditionForm
        submitBtnText="Add"
        onSubmit={handleSubmit}
        inputField={{
          name: "contactId",
          placeholder: "Enter id of the contact...",
          required: true,
        }}
      />
    </div>
  );
};

export default ContactAdditionPage;
