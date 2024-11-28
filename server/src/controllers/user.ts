import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import {
  getUserContacts,
  getUserChannels,
  getUserRequests,
  getUserById,
  updateUserById,
  removeAvatars,
  updateAvatarsCollection,
} from "../services/user";
import { getGridFSBucket } from "../db";
import capitalize from "../utils/capitalize";
import AvatarsUpdateRequestPayload from "../types/AvatarsUpdateRequestPayload";
import File from "../models/File";

const getUserContactsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) throw new Error("User id is required");

  const contacts = await getUserContacts(userId);

  return res.status(200).json(contacts);
};

const getUserChannelsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) throw new Error("User id is required");

  const channels = await getUserChannels(userId);

  return res.status(200).json(channels);
};

const getUserRequestsController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) throw new Error("User id is required");

  const requests = await getUserRequests(userId);

  return res.json(requests);
};

const getUserByIdController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!userId) throw new Error("User id is required");

  const user = await getUserById(userId);

  return res.status(200).json(user);
};

const updateUserByIdController = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const updateData = req.body;

  if (!userId) throw new Error("User id is required");

  const updatedUser = await updateUserById(userId, updateData);

  return res.status(200).json(updatedUser);
};

const updateAvatarsCollectionController = async (
  req: Request,
  res: Response,
  type: "user" | "channel",
) => {
  const { id } = req.params;
  const {
    removedAvatarIds = [],
    newAvatarIds = [],
    selectedAvatarId,
  }: AvatarsUpdateRequestPayload = req.body;

  if (!id) {
    throw new Error(`${capitalize(type)} id is required`);
  }

  const invalidRemovedAvatarIds = removedAvatarIds.filter(
    (id) => !ObjectId.isValid(id),
  );

  if (invalidRemovedAvatarIds.length) {
    throw new Error(
      `Invalid avatar ids: ${invalidRemovedAvatarIds.join(", ")}`,
    );
  }

  const imageBucket = await getGridFSBucket("images");

  await removeAvatars(imageBucket, removedAvatarIds);

  const reqFiles = req.files;
  const files = Array.isArray(reqFiles)
    ? reqFiles
    : reqFiles && typeof reqFiles === "object"
      ? Object.values(reqFiles).flat()
      : [];
  const filenames = files.map((file) => file.filename);
  const fileInfos = await File.find({ filename: { $in: filenames } });
  const orderedFileInfos = filenames.map((filename) =>
    fileInfos.find((fileInfo) => fileInfo.filename === filename),
  );
  const newAvatarObjectIds = orderedFileInfos.map((file) => file?.id);
  const frontendIdToObjectIdMap = newAvatarIds.reduce(
    (acc, frontendId, index) => ({
      ...acc,
      [frontendId]: newAvatarObjectIds[index],
    }),
    {},
  );

  const document = await updateAvatarsCollection(
    type,
    id,
    removedAvatarIds,
    newAvatarObjectIds.filter(Boolean),
    selectedAvatarId,
    frontendIdToObjectIdMap,
  );

  return res.status(200).json({
    message: "Avatars updated successfully",
    avatars: document.avatars,
    selectedAvatar: document.selectedAvatar,
    frontendIdToObjectIdMap,
  });
};

export {
  getUserContactsController,
  getUserChannelsController,
  getUserRequestsController,
  getUserByIdController,
  updateUserByIdController,
  updateAvatarsCollectionController,
};
