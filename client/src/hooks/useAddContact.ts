import { useCallback } from "react";

import { useAlert } from "react-alert";

import { useCreateRequestMutation } from "../services/requestApi";
import useAuth from "./useAuth";
import useRTMClient from "./useRTMClient";
import getErrorMessage from "../utils/getErrorMessage";
import { RequestType } from "../types/Request";
import PeerMessage from "../types/PeerMessage";

const useAddContact = () => {
  const { userId } = useAuth();
  const RTMClient = useRTMClient();
  const alert = useAlert();
  const [createRequest] = useCreateRequestMutation();

  return useCallback(
    async (contactId: string) => {
      if (!userId) return;

      try {
        await createRequest({
          from: userId,
          to: contactId,
          type: RequestType.Contact,
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
    },
    [userId, createRequest, RTMClient, alert],
  );
};

export default useAddContact;
