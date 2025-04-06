import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import cn from 'lib/utils/cn';

export default function UserComment({userData, comment, metadata}: {
    userData: {userName: string, profilePicture: string},
    comment: string,
    metadata: {date: string, isOwner: boolean}
}) {
    // Format the date as "time ago" with error handling
    let timeAgo = '';
    try {
        // First try parsing with parseISO which is safer for ISO strings
        const parsedDate = parseISO(metadata.date);
        
        // Check if the parsed date is valid
        if (isValid(parsedDate)) {
            timeAgo = formatDistanceToNow(parsedDate, { addSuffix: true });
        } else {
            // Fallback to direct Date constructor
            const commentDate = new Date(metadata.date);
            if (isValid(commentDate)) {
                timeAgo = formatDistanceToNow(commentDate, { addSuffix: true });
            } else {
                timeAgo = 'Invalid date';
            }
        }
    } catch (error) {
        console.error('Error formatting date:', metadata.date, error);
        timeAgo = 'Unknown date';
    }

    return (
        <div className={cn(
            "card card-border p-4 mb-4 transition-all",
            metadata.isOwner ? "shadow-md border-l-4 border-l-primary" : "hover:shadow-sm"
        )}>
            <div className="flex items-center justify-between mb-2">
                <div className='flex flex-row items-center gap-2'>
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full overflow-hidden">
                        {userData === null ? (
                            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
                        ) : userData.profilePicture ? (
                            <img
                            src={`${userData.profilePicture}?t=${new Date().getTime()}`}
                            alt=""
                            className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="bg-neutral-focus text-neutral-content rounded-full w-40 h-40 flex items-center justify-center">
                            <span className="text-5xl">{getInitials(userData.userName)}</span>
                            </div>
                        )}
                        </div>
                    </div>
                    <div className='flex flex-col justify-center mt-4'>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{userData.userName}</span>
                            {metadata.isOwner && (
                                <span className="badge badge-sm badge-primary text-xs">Owner</span>
                            )}
                            <span className="text-sm opacity-70">{timeAgo}</span>
                        </div>
                        <div>
                            <p className="whitespace-pre-wrap">{comment}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function getInitials(name: string): string {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  }