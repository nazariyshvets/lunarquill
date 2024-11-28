export default interface AvatarsUpdateRequestPayload {
  removedAvatarIds: string[];
  newAvatarIds: string[];
  selectedAvatarId?: string;
}
