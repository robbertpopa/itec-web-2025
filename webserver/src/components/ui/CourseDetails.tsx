"use client";

import Link from "next/link";
import CourseDiscussion from "./CourseDiscussion";
import { Calendar, Heart, Share2 } from "lucide-react";
import { useNotification } from "lib/context/NotificationContext";
import { useState, useEffect } from "react";
import { auth, db } from "lib/firebase";
import { ref, get } from "firebase/database";
import Modal from "./Modal";
import { useRouter } from "next/navigation";

function getInitials(name: string | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

export default function CourseDetails({
  course,
  owner,
  imageUrl,
}: {
  course: { id: string; name: string; description?: string; lessons?: string[] };
  owner: { displayName?: string; profilePicture?: string };
  imageUrl: string | null;
}) {
  const { showNotification } = useNotification();
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [newLessonName, setNewLessonName] = useState("");
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEnrollment, setIsCheckingEnrollment] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [inviteId, setInviteId] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [participants, setParticipants] = useState<{
    id: string;
    fullName: string;
    profilePicture: string;
  }[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(true);

  const fetchParticipants = async () => {
    setParticipantsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const response = await fetch(`/api/courses/${course.id}/participants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setParticipants(data.participants || []);
      }
    } catch (error) {
      console.error("Error loading participants:", error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id]);

  useEffect(() => {
    const verifyAccess = async () => {
      const user = auth.currentUser;
      if (!user) {
        setHasAccess(false);
        router.push("/courses");
        return;
      }
      if (user.uid === course.ownerId) {
        setHasAccess(true);
        setIsOwner(true);
        return;
      }

      try {
        const invitationRef = ref(db, `/courses/${course.id}/invitedUsers/${user.uid}`);
        const snapshot = await get(invitationRef);
        if (snapshot.exists()) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
          router.push("/courses");
        }
      } catch {
        setHasAccess(false);
        router.push("/courses");
      }
    };

    verifyAccess();
  }, [course.id, course.ownerId, router]);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          setIsCheckingEnrollment(false);
          return;
        }

        const response = await fetch('/api/enrollments', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const isUserEnrolled = data.enrollments && 
            data.enrollments[course.id] !== undefined;
          
          setIsEnrolled(isUserEnrolled);
        }
      } catch (error) {
        console.error("Error checking enrollment status:", error);
      } finally {
        setIsCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [course.id]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotification("Link copied to clipboard", "success");
    } catch {
      showNotification("Failed to copy link", "error");
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonName.trim()) {
      showNotification("Lesson name cannot be empty", "error");
      return;
    }

    const lessonIndex = course.lessons ? course.lessons.length : 0;

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/courses/${course.id}/createLesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          courseId: course.id,
          lessonIndex,
          lessonName: newLessonName,
        }),
      });
      if (response.ok) {
        showNotification("Lesson added", "success");
        setNewLessonName("");
        setIsAddLessonModalOpen(false);
        router.refresh();
      } else {
        const errData = await response.json();
        showNotification(errData.error || "Failed to add lesson", "error");
      }
    } catch {
      showNotification("Error adding lesson", "error");
    }
  };
  const handleEnrollment = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        showNotification("You need to be logged in to enroll in courses", "error");
        return;
      }

      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: course.id })
      });

      if (response.ok) {
        setIsEnrolled(true);
        showNotification("Successfully enrolled in the course!", "success");
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to enroll in the course", "error");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      showNotification("An error occurred while enrolling", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnenroll = async () => {
    try {
      setIsLoading(true);
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        showNotification("You need to be logged in to unenroll from courses", "error");
        return;
      }

      const response = await fetch('/api/enrollments', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId: course.id })
      });

      if (response.ok) {
        setIsEnrolled(false);
        showNotification("Successfully unenrolled from the course", "success");
      } else {
        const error = await response.json();
        showNotification(error.error || "Failed to unenroll from the course", "error");
      }
    } catch (error) {
      console.error("Error unenrolling from course:", error);
      showNotification("An error occurred while unenrolling", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteId.trim()) return;
    try {
      setInviteLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/courses/${course.id}/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: inviteId.trim() }),
      });
      if (response.ok) {
        showNotification("User invited", "success");
        setInviteId("");
        fetchParticipants();
      } else {
        const err = await response.json();
        showNotification(err.error || "Failed to invite", "error");
      }
    } catch {
      showNotification("Failed to invite", "error");
    } finally {
      setInviteLoading(false);
    }
  };

  if (hasAccess === null) {
    return (
      <div className="p-12 flex justify-center">
        <span className="loading loading-spinner" />
      </div>
    );
  }
  if (!hasAccess) {
    return <div className="p-12">You do not have access to this course.</div>;
  }

  return (
    <>
      <div className="p-12 container mx-auto flex flex-row gap-8">
        <div className="card flex flex-col rounded-lg shadow-lg overflow-hidden w-2/3">
          <div className="relative overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`Cover image for ${course.name}`}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 40vw, 100vw"
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-base-200 text-base-content/50">
                <span>No image available</span>
              </div>
            )}
          </div>
  
          <div className="p-10">
            <h1 className="text-3xl font-bold mb-4">{course.name}</h1>
  
            <div className="flex flex-row gap-2 items-center">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  {owner.profilePicture ? (
                    <img
                      src={`${owner.profilePicture}?t=${new Date().getTime()}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-sm">
                        {owner.displayName ? getInitials(owner.displayName) : "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs flex flex-col opacity-80">
                Hosted by
                <div className="font-semibold text-sm">
                  {owner.displayName || "Unknown"}
                </div>
              </div>
            </div>
  
            <div className="font-semibold text-md mt-10 mb-2">About this course</div>
            {course.description ? (
              <div className="prose max-w-none">
                <p className="text-base-content/80 mb-4">{course.description}</p>
              </div>
            ) : (
              <div className="italic mb-4 bg-base-200/50 rounded-lg p-4 text-base-content/70">
                No description provided for this course.
              </div>
            )}
  
            <div className="mt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b flex-grow">
                  Course Lessons
                </h2>
                <button onClick={() => setIsAddLessonModalOpen(true)} type="button" className="btn btn-circle btn-outline ml-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
  
              {course.lessons && course.lessons.length > 0 ? (
                <ul className="space-y-3">
                  {course.lessons.map((lesson, idx) => (
                    <li key={idx}>
                      <Link
                        href={`/courses/${course.id}/${idx}`}
                        className="flex items-center gap-3 bg-base-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-all hover:bg-base-200/30 w-full"
                      >
                        <span className="flex items-center justify-center bg-primary/15 text-primary rounded-full w-8 h-8 shrink-0 font-medium">
                          {idx + 1}
                        </span>
                        <span className="text-base-content">{lesson}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-12 bg-base-200/30 rounded-lg border border-base-300">
                  <h3 className="text-lg font-medium text-base-content/70 mb-2">
                    No lessons yet
                  </h3>
                  <p className="text-base-content/60">
                    This course has not added any lessons yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
  
            <CourseDiscussion id={course.id} />
          </div>
        </div>
  
        <div className="w-1/3 h-fit gap-8 flex flex-col">
          <div className="card flex flex-col rounded-lg shadow-md w-full p-6 h-fit gap-6">
            <div className="font-semibold text-lg">Registration</div>
            {isCheckingEnrollment ? (
              <button type="button" className="btn btn-primary w-full" disabled>
                <span className="loading loading-spinner loading-sm"></span>
                Checking enrollment...
              </button>
            ) : isEnrolled ? (
              <button
                type="button"
                className="btn btn-error w-full"
                onClick={handleUnenroll}
                disabled={isLoading}
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                )}
                Leave Course
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-active btn-primary w-full"
                onClick={handleEnrollment}
                disabled={isLoading}
              >
                {isLoading && (
                  <span className="loading loading-spinner loading-sm mr-2"></span>
                )}
                Join now
              </button>
            )}
  
            <button
              type="button"
              className="btn btn-outline btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              Add to Calendar
            </button>
  
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleShare}
                className="btn btn-outline btn-info w-1/2 flex items-center justify-center gap-2"
              >
                <Share2 size={18} />
                Share
              </button>
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className="btn btn-outline btn-accent w-1/2 flex items-center justify-center gap-2"
              >
                <Heart size={18} className={liked ? "fill-current text-red-500" : ""} />
                {liked ? "Liked" : "Like"}
              </button>
            </div>
          </div>
  
          {isOwner && (
            <div className="card flex flex-col rounded-lg shadow-md w-full p-6 gap-4">
              <h2 className="text-xl font-semibold">Invite Participant</h2>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="User ID"
                value={inviteId}
                onChange={(e) => setInviteId(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleInvite}
                disabled={inviteLoading || !inviteId.trim()}
              >
                {inviteLoading ? "Inviting..." : "Send Invite"}
              </button>
            </div>
          )}

          <div className="card flex flex-col rounded-lg shadow-md w-full p-6 h-fit gap-6">
            <h2 className="text-xl font-semibold">Participants ({participants.length})</h2>
            {participantsLoading ? (
              <div className="flex justify-center p-4">
                <span className="loading loading-spinner" />
              </div>
            ) : (
              <div className="avatar-group -space-x-4">
                {participants.slice(0, 7).map((p) => (
                  <div key={p.id} className="avatar">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {p.profilePicture ? (
                        <img
                          src={`${p.profilePicture}?t=${new Date().getTime()}`}
                          alt={p.fullName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-sm">{getInitials(p.fullName)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {participants.length > 7 && (
                  <div className="avatar placeholder">
                    <div className="w-10 bg-neutral text-neutral-content">
                      <span>+{participants.length - 7}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  
      <Modal
        isOpen={isAddLessonModalOpen}
        onClose={() => setIsAddLessonModalOpen(false)}
        title="Add New Lesson"
      >
        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-md font-medium text-base-content">Lesson Name</span>
            <input
              type="text"
              value={newLessonName}
              onChange={(e) => setNewLessonName(e.target.value)}
              placeholder="Enter lesson name"
              className="input input-bordered mt-1 w-full"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsAddLessonModalOpen(false)}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleAddLesson}>
              Add Lesson
            </button>
          </div>
        </div>
      </Modal>
    </>
  );  
}