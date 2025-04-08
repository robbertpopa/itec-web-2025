"use client";

import Link from "next/link";
import {
  Sparkles,
  CheckCircle,
  Binary,
  FileArchive,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Folder,
  Image as ImageIcon,
  LetterText,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotification } from "lib/context/NotificationContext";
import { auth, storage } from "lib/firebase";
import { ref as storageRef, getDownloadURL } from "firebase/storage";

export interface BucketFile {
  name: string;
  mimeType?: string;
  size: string;
}

export default function CourseMaterialTable({
  fileData,
  path,
}: {
  fileData?: BucketFile[];
  path: string;
}) {
  const { showNotification } = useNotification();
  const hasFiles = fileData && fileData.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parts = path.split("/");
  const courseId = parts[1];
  const lessonIndex = parts[2] || "0";

  const [summarizedMap, setSummarizedMap] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (hasFiles) {
      fileData!.forEach(async (file) => {
        const fileFullPath = `${path}/${file.name}`;
        const summarizedFilePath = fileFullPath.replace(
          /^courses/,
          "summarized"
        );
        try {
          await getDownloadURL(storageRef(storage(), summarizedFilePath));
          setSummarizedMap((prev) => ({
            ...prev,
            [file.name]: true,
          }));
        } catch {
          setSummarizedMap((prev) => ({
            ...prev,
            [file.name]: false,
          }));
        }
      });
    }
  }, [fileData, path, hasFiles]);

  function mapMimeTypeToIcon(mimeType: string | undefined) {
    switch (mimeType) {
      case "application/pdf":
        return <FileText className="w-4 h-4" />;
      case "application/octet-stream":
        return <Binary className="w-4 h-4" />;
      case "xml":
        return <FileCode className="w-4 h-4" />;
      case "text/plain":
        return <LetterText className="w-4 h-4" />;
      case "audio/mpeg":
      case "audio/wav":
      case "audio/ogg":
      case "audio/mp3":
      case "audio/mp4":
      case "audio/aac":
        return <FileAudio className="w-4 h-4" />;
      case "video/mp4":
      case "video/mkv":
        return <FileVideo className="w-4 h-4" />;
      case "image/png":
      case "image/jpeg":
      case "image/webp":
      case "image/gif":
      case "image/avif":
      case "image/svg+xml":
        return <ImageIcon className="w-4 h-4" />;
      case "application/vnd.rar":
      case "application/zip":
      case "application/x-zip-compressed":
      case "application/x-zip":
      case "application/x-rar-compressed":
      case "application/x-7z-compressed":
      case "application/x-tar":
      case "application/x-gzip":
      case "application/x-bzip":
      case "application/x-bzip2":
        return <FileArchive className="w-4 h-4" />;
      default:
        return <Folder className="w-4 h-4" />;
    }
  }

  const handlePlusClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const token = await auth().currentUser?.getIdToken();
      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("lessonIndex", lessonIndex);
      formData.append("file", file);

      try {
        const response = await fetch(`/api/${path}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        if (response.ok) {
          showNotification("File uploaded successfully", "success");
        } else {
          const errData = await response.json();
          showNotification(errData.error || "Failed to upload file", "error");
        }
      } catch {
        showNotification("Error uploading file", "error");
      }
    }
  };

  const handleSummarize = async (fileFullPath: string) => {
    if (!fileFullPath) {
      showNotification("Invalid file", "error");
      return;
    }
    try {
      const summarizedFilePath = fileFullPath.replace(/^courses/, "summarized");

      try {
        const url = await getDownloadURL(
          storageRef(storage(), summarizedFilePath)
        );
        showNotification("Summarized file found. Downloading...", "success");
        window.open(url, "_blank");
        return;
      } catch {}

      const token = await auth().currentUser?.getIdToken();
      const apiUrl = `/api/courses/${courseId}/${lessonIndex}/${encodeURIComponent(fileFullPath)}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        showNotification("Summarization queued successfully", "success");
      } else {
        const errData = await response.json();
        showNotification(
          errData.error || "Failed to queue summarization",
          "error"
        );
      }
    } catch {
      showNotification("Error queuing summarization", "error");
    }
  };

  return (
    <>
      <div className="card bg-base-100 shadow-sm mt-8">
        <div className="card-body p-0">
          <div className="flex flex-row justify-between border-b p-4">
            <h3 className="card-title text-lg">Course Materials</h3>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-circle"
                onClick={handlePlusClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="size-[1.2em]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <button
                type="button"
                className="btn btn-circle btn-outline bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform shadow-lg"
                title="Queue Summarization"
                onClick={() => {
                  if (hasFiles) {
                    const fileFullPath = `${path}/${fileData![0].name}`;
                    handleSummarize(fileFullPath);
                  }
                }}
              >
                {hasFiles && summarizedMap[fileData![0].name] ? (
                  <CheckCircle size={18} className="text-white" />
                ) : (
                  <Sparkles size={18} className="text-white" />
                )}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {hasFiles ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th>Name</th>
                    <th className="w-24 text-right">Size</th>
                    <th className="w-12 text-center">Summarize</th>
                  </tr>
                </thead>
                <tbody>
                  {fileData!.map((file) => {
                    const fileFullPath = `${path}/${file.name}`;
                    const isSummarized = summarizedMap[file.name];
                    return (
                      <tr
                        key={file.name}
                        className="hover:bg-base-200/50 transition-colors"
                      >
                        <td className="text-base-content/70">
                          {mapMimeTypeToIcon(file.mimeType)}
                        </td>
                        <td>
                          <Link
                            className="hover:text-primary transition-colors flex items-center gap-2"
                            href={"/" + path + "/" + file.name}
                          >
                            <span className="font-medium">{file.name}</span>
                          </Link>
                        </td>
                        <td className="text-right text-sm font-mono text-base-content/70">
                          {file.size}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleSummarize(fileFullPath)}
                          >
                            {isSummarized ? (
                              <CheckCircle
                                size={16}
                                className="text-green-500"
                              />
                            ) : (
                              <Sparkles size={16} />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 bg-base-200/30 rounded-lg border border-base-300">
                <h3 className="text-lg font-medium text-base-content/70 mb-2">
                  No materials available
                </h3>
                <p className="text-base-content/60">
                  This section does not have any downloadable files yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
}
