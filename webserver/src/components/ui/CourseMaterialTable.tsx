import Link from "next/link";
import { FileCode, FileText, Folder, LetterText, Image as ImageIcon, Binary, FileAudio, FileVideo, FileArchive } from 'lucide-react';


export interface BucketFile {
    name: string
    mimeType?: string
    size: string
}

export default function CourseMaterialTable({ fileData, path }: { markdown?: string; fileData?: BucketFile[]; path: string }) {
    const hasFiles = fileData && fileData.length > 0;

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

    if (!hasFiles) {
        return (
            <div className="text-center py-12 bg-base-200/30 rounded-lg border border-base-300">
                <h3 className="text-lg font-medium text-base-content/70 mb-2">No materials available</h3>
                <p className="text-base-content/60">
                    {"This section doesn't have any downloadable files yet."}
                </p>
            </div>
        );
    }

    return (
        <div className="card bg-base-100 shadow-sm mt-8">
            <div className="card-body p-0">
                <h3 className="card-title text-lg p-4 border-b">Course Materials</h3>
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th className="w-8"></th>
                                <th>Name</th>
                                <th className="w-24 text-right">Size</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileData.map((file) => (
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
                </div>
            </div>
        </div>
    );
}