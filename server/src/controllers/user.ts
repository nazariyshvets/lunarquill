import { Request, Response } from "express";
import { MongoClient, ObjectId, GridFSBucket } from "mongodb";

import {
  getUserContacts,
  getUserChannels,
  getUserById,
  updateUserById,
  removeAvatars,
  updateUserAvatarsCollection,
} from "../services/user";
import ProfileAvatarsUpdateRequestPayload from "../types/ProfileAvatarsUpdateRequestPayload";
import File from "../models/File";

const mongoClient = new MongoClient(process.env.DB_URL!);

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

const updateUserAvatarsCollectionController = async (
  req: Request,
  res: Response,
) => {
  const { userId } = req.params;
  const {
    removedAvatarIds = [],
    newAvatarIds = [],
    selectedAvatarId,
  }: ProfileAvatarsUpdateRequestPayload = req.body;

  if (!userId) {
    throw new Error("User id is required");
  }

  const invalidRemovedAvatarIds = removedAvatarIds.filter(
    (id) => !ObjectId.isValid(id),
  );

  if (invalidRemovedAvatarIds.length) {
    throw new Error(
      `Invalid avatar ids: ${invalidRemovedAvatarIds.join(", ")}`,
    );
  }

  await mongoClient.connect();
  res.on("close", () => {
    mongoClient.close();
  });

  const database = mongoClient.db();
  const imageBucket = new GridFSBucket(database, {
    bucketName: "images",
  });

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

  const user = await updateUserAvatarsCollection(
    userId,
    removedAvatarIds,
    newAvatarObjectIds.filter(Boolean),
    selectedAvatarId,
    frontendIdToObjectIdMap,
  );

  return res.status(200).json({
    message: "Profile avatars updated successfully",
    avatars: user.avatars,
    selectedAvatar: user.selectedAvatar,
    frontendIdToObjectIdMap,
  });
};

export {
  getUserContactsController,
  getUserChannelsController,
  getUserByIdController,
  updateUserByIdController,
  updateUserAvatarsCollectionController,
};
