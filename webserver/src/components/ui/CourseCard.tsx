/* eslint-disable  @typescript-eslint/no-explicit-any */

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import { auth } from "lib/firebase";

interface UserData {
  fullName: string;
  profilePicture: string;
}

function getInitials(name: string): string {
    if (!name) return "";
    
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

interface CourseCardProps {
  id?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  authorName?: string;
  course?: any;
}

export default function CourseCard({ 
  id,
  title,
  description,
  thumbnail,
  authorName,
  course
}: CourseCardProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);

  const courseId = course?.id || id || '';
  const courseTitle = course?.name || title || '';
  const courseDescription = course?.description || description || '';
  const courseThumbnail = course?.imageUrl || thumbnail || '';
  const courseOwnerId = course?.ownerId;
  const courseOwnerName = course?.ownerName || '';
  const courseAuthorName = course?.authorName || authorName || courseOwnerName || '';
  const ownerProfilePicture = course?.ownerProfilePicture || '';

  useEffect(() => {
    if (!ownerProfilePicture && courseOwnerId) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const token = await auth.currentUser?.getIdToken();
          const response = await fetch(`/api/users?userId=${courseOwnerId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            
            if (data && data.success && data.user) {
              setUserData({
                fullName: data.user.fullName || "",
                profilePicture: data.user.profilePicture || ""
              });
            } else {
              console.warn('User data not found in expected structure:', data);
            }
          } else {
            console.error('Failed to fetch user data:', response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [courseOwnerId, ownerProfilePicture]);

  useEffect(() => {
  }, [userData]);

  const handleViewMaterials = () => {
    router.push(`/courses/${courseId}`);
  };

  const displayName = courseAuthorName || userData?.fullName || "Unknown";
  const displayProfilePicture = ownerProfilePicture || userData?.profilePicture || "";

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <figure className="aspect-video relative overflow-hidden rounded-t-lg">
        {courseThumbnail ? (
          <Image
            src={courseThumbnail}
            alt={courseTitle}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 768px) 16rem, 100vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-base-200">
            <span className="text-sm text-base-content opacity-40">No image</span>
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h3 className="card-title text-lg truncate" title={courseTitle}>
          {courseTitle}
        </h3>
        <p className="line-clamp-2 text-sm flex-grow opacity-70">
          {courseDescription || "No description available."}
        </p>
        <div className="flex flex-row items-center gap-2">
            <div className="avatar">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                {loading ? (
                    <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
                ) : displayProfilePicture ? (
                    <img
                    src={`${displayProfilePicture}?t=${new Date().getTime()}`}
                    alt=""
                    className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="bg-neutral-focus text-neutral-content rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="text-xl">{getInitials(displayName)}</span>
                    </div>
                )}
                </div>
            </div>
            <div className="text-xs flex flex-col">
                <span className="text-gray-500">Hosted by</span>
                <div className="font-semibold text-sm">
                    {displayName}
                </div>
            </div>
        </div>
        <div className="card-actions justify-end mt-2">
          <button onClick={handleViewMaterials} className="btn btn-primary btn-outline btn-sm w-full">
            View Materials
          </button>
        </div>
      </div>
    </div>
  );
}
