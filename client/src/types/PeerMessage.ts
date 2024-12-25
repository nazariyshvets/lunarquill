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
  // CONTACTS
  ContactRemoved = "contactRemoved",
  // CHANNELS
  ChannelMemberJoined = "channelMemberJoined",
  ChannelMemberLeft = "channelMemberLeft",
  ChannelUpdated = "channelUpdated",
  ChannelMemberKicked = "channelMemberKicked", // Notify members of the channel about a kick
  ChannelKicked = "channelKicked", // Notify the kicked user
}

export default PeerMessage;
