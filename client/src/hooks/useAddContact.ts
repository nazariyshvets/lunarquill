import { useCallback } from "react";

import { useAlert } from "react-alert";

import { useCreateRequestMutation } from "../services/requestApi";
import useAuth from "./useAuth";
import useSendMessageToPeer from "./useSendMessageToPeer";
import getErrorMessage from "../utils/getErrorMessage";
import { RequestType } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

const useAddContact = () => {
  const { userId } = useAuth();
  const alert = useAlert();
  const [createRequest] = useCreateRequestMutation();
  const sendMessageToPeer = useSendMessageToPeer();

  return useCallback(
    async (contactId: string) => {
      if (!userId) return;

      try {
        await createRequest({
          from: userId,
          to: contactId,
          type: RequestType.Contact,
        }).unwrap();
        await sendMessageToPeer(contactId, PeerMessage.RequestCreated);
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
    },
    [userId, createRequest, sendMessageToPeer, alert],
  );
};

export default useAddContact;
