import { useRouter } from "next/navigation";
import Image from "next/image";
import Course from "lib/models/coursePreview";
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

export default function CourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({ fullName: "", profilePicture: "" });

  useEffect(() => {
    const getUserData = async () => {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/users/" + course.ownerId, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      }
    };

    getUserData();
  }, [course.ownerId]);

  const handleViewMaterials = () => {
    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <figure className="aspect-video relative overflow-hidden rounded-t-lg">
        {course.imageUrl ? (
          <Image
            src={course.imageUrl}
            alt={course.name}
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
        <h3 className="card-title text-lg truncate" title={course.name}>
          {course.name}
        </h3>
        <p className="line-clamp-2 text-sm flex-grow opacity-70">
          {course.description ?? "No description available."}
        </p>
        <div className="flex flex-row items-center gap-2">
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
                    <span className="text-5xl">{getInitials(userData.fullName)}</span>
                    </div>
                )}
                </div>
            </div>
            <div className="text-xs flex flex-row gap-1">
                Hosted by
                <div className="font-semibold">
                    {userData?.fullName || "Unknown"}
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
