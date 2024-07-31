enum PeerMessage {
  // CALLS
  Call = "call",
  CallDeclined = "callDeclined",
  CallAccepted = "callAccepted",
  CallRecalled = "callRecalled",
  CallTimedOut = "callTimedOut",
  CallEnded = "callEnded",
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
