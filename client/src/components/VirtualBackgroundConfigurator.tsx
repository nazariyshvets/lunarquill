import React, { useState, useRef, useEffect, PropsWithChildren } from "react";

import { HexColorPicker } from "react-colorful";
import { useAlert } from "react-alert";
import { FileRejection, ErrorCode } from "react-dropzone";
import { useIndexedDB } from "react-indexed-db-hook";
import { nanoid } from "@reduxjs/toolkit";
import { BiTrash } from "react-icons/bi";

import Modal from "./Modal";
import Select, { SelectOption } from "./Select";
import FileUploader from "./FileUploader";
import useRTC from "../hooks/useRTC";
import useAppDispatch from "../hooks/useAppDispatch";
import formatBytes from "../utils/formatBytes";
import {
  setVirtualBgType,
  setVirtualBgBlurDegree,
  setVirtualBgColor,
  setVirtualBgImgId,
  setVirtualBgVideoId,
} from "../redux/rtcSlice";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  IMAGES_IN_STORAGE_LIMIT,
  VIDEOS_IN_STORAGE_LIMIT,
} from "../constants/constants";
import type {
  VirtualBgType,
  VirtualBgMediaSource,
  VirtualBgBlurDegree,
  VirtualBgBlurDegreeString,
} from "../types/VirtualBg";
import type Configurator from "../types/Configurator";

interface MediaSourcePickerProps {
  type: "image" | "video";
  selectedFileId: string | null;
  setSelectedFileId: React.Dispatch<React.SetStateAction<string | null>>;
}

interface SelectableItemProps {
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

const virtualBgTypeOptions: SelectOption[] = [
  { value: "blur", label: "Blur" },
  { value: "color", label: "Color" },
  { value: "img", label: "Image" },
  { value: "video", label: "Video" },
];

const virtualBgTypeOptionsMap = virtualBgTypeOptions.reduce<
  Partial<Record<VirtualBgType, SelectOption>>
>((res, option) => ({ ...res, [option.value]: option }), {});

const virtualBgBlurDegreeOptions: SelectOption[] = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

const virtualBgBlurDegreeOptionsMap = virtualBgBlurDegreeOptions.reduce<
  Partial<Record<VirtualBgBlurDegreeString, SelectOption>>
>((res, option) => ({ ...res, [option.value]: option }), {});

const VirtualBackgroundConfigurator = ({ onClose }: Configurator) => {
  const {
    virtualBgType,
    virtualBgBlurDegree,
    virtualBgColor,
    virtualBgImgId,
    virtualBgVideoId,
  } = useRTC();
  const [type, setType] = useState(virtualBgType);
  const [blurDegree, setBlurDegree] = useState(
    virtualBgBlurDegree.toString() as VirtualBgBlurDegreeString,
  );
  const [color, setColor] = useState(virtualBgColor);
  const [imgId, setImgId] = useState(virtualBgImgId);
  const [videoId, setVideoId] = useState(virtualBgVideoId);
  const dispatch = useAppDispatch();
  const alert = useAlert();

  const getInputs = () => {
    switch (type) {
      case "blur":
        return (
          <Select
            value={virtualBgBlurDegreeOptionsMap[blurDegree]}
            options={virtualBgBlurDegreeOptions}
            className="w-full"
            onChange={(newValue) =>
              setBlurDegree(
                (newValue as SelectOption).value as VirtualBgBlurDegreeString,
              )
            }
          />
        );
      case "color":
        return <HexColorPicker color={color} onChange={setColor} />;
      case "img":
        return (
          <MediaSourcePicker
            type="image"
            selectedFileId={imgId}
            setSelectedFileId={setImgId}
          />
        );
      case "video":
        return (
          <MediaSourcePicker
            type="video"
            selectedFileId={videoId}
            setSelectedFileId={setVideoId}
          />
        );
      default:
        return;
    }
  };

  const handleSave = () => {
    switch (type) {
      case "blur":
        dispatch(setVirtualBgType("blur"));
        dispatch(
          setVirtualBgBlurDegree(Number(blurDegree) as VirtualBgBlurDegree),
        );
        break;
      case "color":
        dispatch(setVirtualBgType("color"));
        dispatch(setVirtualBgColor(color));
        break;
      case "img":
        if (imgId) {
          dispatch(setVirtualBgType("img"));
          dispatch(setVirtualBgImgId(imgId));
          break;
        } else {
          alert.info("Please select an image");
          return;
        }
      case "video":
        if (videoId) {
          dispatch(setVirtualBgType("video"));
          dispatch(setVirtualBgVideoId(videoId));
        } else {
          alert.info("Please select a video");
          return;
        }
    }
    onClose();
  };

  return (
    <Modal
      title="Virtual background settings"
      onCancel={onClose}
      onSave={handleSave}
    >
      <div className="flex min-h-[250px] flex-col items-center gap-2">
        <Select
          value={virtualBgTypeOptionsMap[type]}
          options={virtualBgTypeOptions}
          className="z-50 w-full"
          onChange={(newValue) =>
            setType((newValue as SelectOption).value as VirtualBgType)
          }
        />

        {getInputs()}
      </div>
    </Modal>
  );
};

const MediaSourcePicker = ({
  type,
  selectedFileId,
  setSelectedFileId,
}: MediaSourcePickerProps) => {
  const [files, setFiles] = useState<VirtualBgMediaSource[]>([]);
  const { add, getAll, deleteRecord } = useIndexedDB(
    type === "image" ? "virtualBgImages" : "virtualBgVideos",
  );
  const alert = useAlert();
  const fileSrcUrlsRef = useRef<Record<string, string>>({});
  const dispatch = useAppDispatch();

  const handleUpload = async (sources: File[]) => {
    const filesNumLimit =
      type === "image" ? IMAGES_IN_STORAGE_LIMIT : VIDEOS_IN_STORAGE_LIMIT;

    if (files.length >= filesNumLimit) {
      alert.info(`You can have up to ${filesNumLimit} ${type}s`);
      console.error(`A user can have up to ${filesNumLimit} ${type}s`);
      return;
    }

    const file = sources?.[0];

    if (file) {
      try {
        const newFile = { id: nanoid(), source: file };
        await add(newFile);
        setFiles((prev) => [...prev, newFile]);
        setSelectedFileId(newFile.id);
      } catch (err) {
        console.error("Error adding a new file to IndexedDB:", err);
      }
    }
  };

  const handleReject = (rejections: FileRejection[]) => {
    rejections.forEach((rejection) =>
      rejection.errors.forEach((error) =>
        alert.info(
          error.code === ErrorCode.FileTooSmall ||
            error.code === ErrorCode.FileTooLarge
            ? error.message.replace(/(\d+)\s*bytes/, (match) =>
                formatBytes(parseInt(match, 10)),
              )
            : error.message,
        ),
      ),
    );
    console.error(rejections);
  };

  const handleRemoveFile = async (fileId: string) => {
    try {
      await deleteRecord(fileId);
      setFiles((prev) => prev.filter(({ id }) => id !== fileId));

      if (fileId === selectedFileId) {
        setSelectedFileId(null);
        dispatch(
          type === "image"
            ? setVirtualBgImgId(null)
            : setVirtualBgVideoId(null),
        );
      }
    } catch (err) {
      alert.error("Cannot remove the file. Please try again");
      console.error("Error removing file:", err);
    }
  };

  const getUrl = ({ id, source }: VirtualBgMediaSource) => {
    if (fileSrcUrlsRef.current[id]) {
      return fileSrcUrlsRef.current[id];
    } else {
      const url = URL.createObjectURL(source);

      fileSrcUrlsRef.current[id] = url;

      return url;
    }
  };

  useEffect(() => {
    getAll()
      .then(setFiles)
      .catch((err) => console.error("Error retrieving files:", err));
  }, [getAll]);

  useEffect(() => {
    const fileSrcUrls = fileSrcUrlsRef.current;

    return () => {
      Object.values(fileSrcUrls).forEach(URL.revokeObjectURL);
    };
  }, []);

  const fileWidgets = files.map((file) => (
    <SelectableItem
      key={file.id}
      isSelected={file.id === selectedFileId}
      onSelect={() => setSelectedFileId(file.id)}
      onRemove={() => handleRemoveFile(file.id)}
    >
      {type === "image" ? (
        <img
          src={getUrl(file)}
          alt={file.source.name}
          className="h-full w-full rounded object-cover"
        />
      ) : (
        <video
          src={getUrl(file)}
          className="h-full w-full rounded object-cover"
        />
      )}
    </SelectableItem>
  ));

  return (
    <div className="flex w-full flex-col gap-1">
      {fileWidgets.length > 0 && (
        <>
          <div className="flex gap-2 overflow-auto p-1">{fileWidgets}</div>

          <div className="flex items-center gap-2">
            <span className="h-px w-full bg-white" />
            <span className="text-white">or</span>
            <span className="h-px w-full bg-white" />
          </div>
        </>
      )}

      <FileUploader
        type={type}
        multiple={false}
        maxSize={type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE}
        onDropAccepted={handleUpload}
        onDropRejected={handleReject}
      />
    </div>
  );
};

const SelectableItem = ({
  isSelected,
  children,
  onSelect,
  onRemove,
}: PropsWithChildren<SelectableItemProps>) => {
  const handleRemove = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    onRemove();
  };

  return (
    <div
      className={`relative h-24 w-24 flex-shrink-0 cursor-pointer rounded sm:h-28 sm:w-28 ${
        isSelected ? "outline outline-2 outline-offset-2 outline-primary" : ""
      }`}
      onClick={onSelect}
    >
      {children}
      <button
        className="absolute right-1 top-2 h-5 w-5 text-white transition-colors hover:text-primary sm:h-6 sm:w-6"
        onClick={handleRemove}
      >
        <BiTrash className="h-full w-full" />
      </button>
    </div>
  );
};

export default VirtualBackgroundConfigurator;
