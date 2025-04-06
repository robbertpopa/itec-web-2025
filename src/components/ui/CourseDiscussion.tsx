"use client"
import { useState, useEffect } from "react";
import UserComment from "./UserComment";
import { db, auth } from "lib/firebase";
import { ref, get } from "firebase/database";
import { useNotification } from "lib/context/NotificationContext";

type Comment = {
    id: string;
    userName: string;
    userId: string; 
    profilePicture: string;
    message: string;
    createdAt: string;
};

export default function CourseDiscussion({ id }: { id: string }) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const [courseOwnerId, setCourseOwnerId] = useState<string | null>(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
            
                const courseRef = ref(db, `courses/${id}`);
                const courseSnapshot = await get(courseRef);
                
                if (courseSnapshot.exists()) {
                    const courseData = courseSnapshot.val();
                    setCourseOwnerId(courseData.ownerId);
                }
                
                const commentsRef = ref(db, `discussions/${id}`);
                const commentsSnapshot = await get(commentsRef);
                
                if (!commentsSnapshot.exists()) {
                    setComments([]);
                    setLoading(false);
                    return;
                }
                
                const commentsData = commentsSnapshot.val();

                const commentPromises = Object.keys(commentsData).map(async (commentId) => {
                    const commentFields = commentsData[commentId];
                    
                    const userRef = ref(db, `users/${commentFields.userId}`);
                    const userSnapshot = await get(userRef);
                    let userName = '';
                    let profilePicture = '';
                    
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.val();
                        userName = userData.fullName || '';
                        profilePicture = userData.profilePicture || '';
                    }

                    return {
                        id: commentId,
                        userId: commentFields.userId,
                        userName: userName,
                        profilePicture: profilePicture,
                        message: commentFields.message,
                        createdAt: commentFields.createdAt,
                    };
                });
                
                const resolvedComments = (await Promise.all(commentPromises)).filter(Boolean) as Comment[];
                
                resolvedComments.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setComments(resolvedComments);
            } catch (err) {
                console.error("Error loading course data or comments:", err);
                setError("Failed to load discussions");
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [id]);

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!newComment.trim() || !user) return;

        try {
            const token = await user.getIdToken();
            
            // Use the server API endpoint instead of direct Firebase access
            const response = await fetch('/api/discussions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    courseId: id,
                    message: newComment
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to post comment');
            }
            
            // Add the new comment to the state with the data returned from the server
            const newCommentObj = data.comment;
            
            setComments(prevComments => [newCommentObj, ...prevComments]);
            setNewComment("");
            showNotification("Comment posted successfully!", "success");
        } catch (err) {
            console.error("Error posting comment:", err);
            showNotification("Failed to post comment. Please try again.", "error");
        }
    };

    return (
        <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold mb-6">Discussion</h2>
            
            {loading ? (
                <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-md text-red-600">
                    {error}
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">Be the first to start a discussion about this course!</p>
                    ) : (
                        <div>
                            {comments.map((comment) => (
                                <UserComment 
                                    key={comment.id}
                                    userData={{ userName: comment.userName, profilePicture: comment.profilePicture }}
                                    comment={comment.message}
                                    metadata={{ 
                                        date: comment.createdAt, 
                                        isOwner: comment.userId === courseOwnerId 
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    
                    {auth.currentUser && (
                        <div className="mt-6">
                            <form onSubmit={handleSubmitComment}>
                                <div className="flex flex-col gap-4">
                                    <textarea 
                                        className="textarea w-full" 
                                        placeholder="Type your message..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        rows={3}
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button 
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={!newComment.trim()}
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {!auth.currentUser && (
                        <div className="mt-6 p-4 bg-base-200 rounded-md text-center">
                            <p>Sign in to join the discussion</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
