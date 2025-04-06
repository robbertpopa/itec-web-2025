import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import cn from 'lib/utils/cn';

export default function UserComment({userData, comment, metadata}: {
    userData: {userName: string},
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
                <div className="flex items-center gap-2">
                    <span className="font-semibold">{userData.userName}</span>
                    {metadata.isOwner && (
                        <span className="badge badge-sm badge-primary text-xs">Owner</span>
                    )}
                </div>
                <span className="text-sm opacity-70">{timeAgo}</span>
            </div>
            <div className="mt-2">
                <p className="whitespace-pre-wrap">{comment}</p>
            </div>
        </div>
    );
}