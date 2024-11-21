export default interface ProfileAvatarsUpdateRequestPayload {
  removedAvatarIds: string[];
  newAvatarIds: string[];
  selectedAvatarId?: string;
}
