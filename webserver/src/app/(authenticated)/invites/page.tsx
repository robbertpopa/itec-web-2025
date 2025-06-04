"use client";

import { useEffect, useState } from "react";
import CourseCard from "@/components/ui/CourseCard";
import Skeleton from "@/components/ui/Skeleton";
import CoursePreview from "lib/models/coursePreview";
import { auth } from "lib/firebase";
import { useNotification } from "lib/context/NotificationContext";
import { useInviteCount } from "lib/context/InviteCountContext";

interface InviteCourse extends CoursePreview {
  ownerId: string;
}

export default function Page() {
  const [invites, setInvites] = useState<InviteCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { refresh } = useInviteCount();

  const fetchInvites = async () => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/users/${user.uid}/invites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvites(data.invites || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleAccept = async (courseId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/users/${user.uid}/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        showNotification("Invitation accepted", "success");
        setInvites((prev) => prev.filter((inv) => inv.id !== courseId));
        refresh();
      } else {
        const e = await res.json();
        showNotification(e.error || "Failed to accept", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to accept", "error");
    }
  };

  const handleDecline = async (courseId: string) => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/users/${user.uid}/invites`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        showNotification("Invitation declined", "success");
        setInvites((prev) => prev.filter((inv) => inv.id !== courseId));
        refresh();
      } else {
        const e = await res.json();
        showNotification(e.error || "Failed to decline", "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to decline", "error");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Course Invitations</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex flex-col rounded-lg border border-neutral-100 bg-white shadow-sm h-[340px]"
              >
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-3" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-9 w-full mt-4" />
                </div>
              </div>
            ))}
        </div>
      ) : invites.length === 0 ? (
        <p>No pending invitations.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {invites.map((inv) => (
            <div key={inv.id} className="card bg-base-100 shadow">
              <CourseCard course={inv} />
              <div className="card-actions p-4 justify-end">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAccept(inv.id!)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => handleDecline(inv.id!)}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
