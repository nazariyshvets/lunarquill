import express from "express";
import request from "request";
import { createHmac } from "crypto";
import { v1 as uuidv1 } from "uuid";

export enum TokenRole {
  Admin = "0",
  Writer = "1",
  Reader = "2",
}

export enum TokenPrefix {
  SDK = "NETLESSSDK_",
  ROOM = "NETLESSROOM_",
  TASK = "NETLESSTASK_",
}

// ===== UTILS =====

const bufferToBase64 = (buffer: Buffer) =>
  buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const formatJSON = <T extends StrAndIntByObj>(object: T) => {
  const keys = Object.keys(object).sort();
  const target: StrByObj = {};

  for (const key of keys) {
    target[key] = String(object[key]);
  }

  return target;
};

const stringify = (object: StrByObj) =>
  Object.keys(object)
    .map((key) => {
      const value = object[key];

      if (value === undefined) {
        return "";
      }
      if (value === null) {
        return "null";
      }

      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join("&");

// ===== CORE =====

export const createRoom = (
  sdkToken: string,
  callback: (
    error: unknown,
    res: request.Response,
  ) => express.Response<unknown, Record<string, unknown>>,
) => {
  const options = {
    method: "POST",
    url: "https://api.netless.link/v5/rooms",
    headers: {
      token: sdkToken,
      "Content-Type": "application/json",
      region: "eu",
    },
    body: JSON.stringify({
      isRecord: false,
    }),
  };

  request(options, callback);
};

export const disableRoom = (
  roomUuid: string,
  sdkToken: string,
  callback: (
    error: unknown,
    res: request.Response,
  ) => express.Response<unknown, Record<string, unknown>>,
) => {
  const options = {
    method: "PATCH",
    url: `https://api.netless.link/v5/rooms/${roomUuid}`,
    headers: {
      token: sdkToken,
      "Content-Type": "application/json",
      region: "eu",
    },
    body: JSON.stringify({
      isBan: true,
    }),
  };

  request(options, callback);
};

export const listRooms = (
  sdkToken: string,
  callback: (
    error: unknown,
    res: request.Response,
  ) => express.Response<unknown, Record<string, unknown>>,
) => {
  const options = {
    method: "GET",
    url: "https://api.netless.link/v5/rooms",
    headers: {
      token: sdkToken,
      "Content-Type": "application/json",
      region: "eu",
    },
  };

  request(options, (error, res) => {
    callback(error, res);
  });
};

const createToken =
  <T extends {}>(prefix: TokenPrefix) =>
  (
    accessKey: string,
    secretAccessKey: string,
    lifespan: number,
    content: T,
  ) => {
    const object: StrAndIntByObj = {
      ...content,
      ak: accessKey,
      nonce: uuidv1(),
    };

    if (lifespan > 0) {
      object.expireAt = `${Date.now() + lifespan}`;
    }

    const information = JSON.stringify(formatJSON(object));
    const hmac = createHmac("sha256", secretAccessKey);
    object.sig = hmac.update(information).digest("hex");

    const query = stringify(formatJSON(object));
    const buffer = Buffer.from(query, "utf8");

    return prefix + bufferToBase64(buffer);
  };

export const sdkToken = createToken<SdkTokenTags>(TokenPrefix.SDK);
export const roomToken = createToken<RoomTokenTags>(TokenPrefix.ROOM);
export const taskToken = createToken<TaskTokenTags>(TokenPrefix.TASK);

export type SdkTokenTags = {
  readonly role?: TokenRole;
};

export type RoomTokenTags = {
  readonly uuid?: string;
  readonly role?: TokenRole;
};

export type TaskTokenTags = {
  readonly uuid?: string;
  readonly role?: TokenRole;
};

type StrAndIntByObj = Record<string, string | number>;
type StrByObj = Record<string, string>;
