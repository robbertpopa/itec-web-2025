"use client";

import Link from "next/link";
import { FileCode, FileText, Folder, LetterText, Image as ImageIcon, Binary, FileAudio, FileVideo, FileArchive } from 'lucide-react';
import { useRef } from "react";
import { useNotification } from "lib/context/NotificationContext";
import { auth } from "lib/firebase";

export interface BucketFile {
  name: string;
  mimeType?: string;
  size: string;
}

export default function CourseMaterialTable({ fileData, path }: { fileData?: BucketFile[]; path: string }) {
  const { showNotification } = useNotification();
  const hasFiles = fileData && fileData.length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const token = await auth.currentUser?.getIdToken();
      const formData = new FormData();
      const lessonIndex = path.split("/").pop() || "0";
      formData.append("courseId", path.split("/")[1]);
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

  return (
    <>
      <div className="card bg-base-100 shadow-sm mt-8">
        <div className="card-body p-0">
          <div className="flex flex-row justify-between border-b p-4">
            <h3 className="card-title text-lg">Course Materials</h3>
            <button type="button" className="btn btn-circle" onClick={handlePlusClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="size-[1.2em]"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="overflow-x-auto">
            {hasFiles ? (
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th>Name</th>
                    <th className="w-24 text-right">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {fileData!.map((file) => (
                    <tr key={file.name} className="hover:bg-base-200/50 transition-colors">
                      <td className="text-base-content/70">
                        {mapMimeTypeToIcon(file.mimeType)}
                      </td>
                      <td>
                        <Link
                          className="hover:text-primary transition-colors flex items-center gap-2"
                          href={'/' + path + '/' + file.name}
                        >
                          <span className="font-medium">{file.name}</span>
                        </Link>
                      </td>
                      <td className="text-right text-sm font-mono text-base-content/70">
                        {file.size}
                      </td>
                    </tr>
                  ))}
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
      {/* Hidden file input */}
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </>
  );
}
