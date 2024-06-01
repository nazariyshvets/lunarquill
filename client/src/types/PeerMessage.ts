enum PeerMessage {
  // CALLS
  AudioCall = "audioCall",
  AudioCallCancelled = "audioCallCancelled",
  AudioCallAccepted = "audioCallAccepted",
  AudioCallTimedOut = "audioCallTimedOut",
  // REQUESTS
  RequestCreated = "requestCreated",
  RequestRecalled = "requestRecalled",
  RequestDeclined = "requestDeclined",
  ContactRequestAccepted = "contactRequestAccepted",
  JoinRequestAccepted = "joinRequestAccepted",
  InviteRequestAccepted = "inviteRequestAccepted",
  // ONLINE STATUS
  UserWentOnline = "userWentOnline",
  UserWentOffline = "userWentOffline",
  // CONTACT REMOVAL
  ContactRemoved = "contactRemoved",
}

export default PeerMessage;
