"use client";

import { auth, db } from "lib/firebase";
import { useRef, useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { UserContext } from "../layout";
import { Check } from "lucide-react";
import { useNotification } from "lib/context/NotificationContext";
import { ref, update } from "firebase/database";

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function Page() {
  const { showNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const userProfile = useContext(UserContext);
  const [fullName, setFullName] = useState("");

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    await signOut(auth());
    router.push("/login");
  };

  const handleUpdateUserProfile = async () => {
    const user = auth().currentUser;
    update(ref(db(), "users/" + user?.uid), {
      fullName,
    });

    if (userProfile) {
      userProfile.fullName = fullName;
    }

    showNotification("User profile updated succesfully!");
    router.refresh();
  };

  useEffect(() => {
    if (userProfile?.fullName) {
      setFullName(userProfile.fullName);
    }
  }, [userProfile]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="card lg:card-side bg-base-100 shadow-sm max-w-250">
        <div className="flex flex-col items-center gap-4 p-10">
          <div
            className="relative group cursor-pointer"
            onClick={handleImageClick}
          >
            <div className="avatar">
              <div className="w-40 h-40 rounded-full overflow-hidden">
                {userProfile === null ? (
                  <div className="w-40 h-40 bg-gray-300 rounded-full animate-pulse" />
                ) : userProfile.profilePicture ? (
                  <img
                    src={`${userProfile.profilePicture}?t=${new Date().getTime()}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-40 h-40 flex items-center justify-center">
                    <span className="text-5xl">
                      {getInitials(userProfile.fullName)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              Upload image
            </div>
          </div>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const token = await auth()?.currentUser?.getIdToken();
                const formData = new FormData();
                formData.append("image", file);
                const response = await fetch(
                  "/api/users/" + auth()?.currentUser?.uid,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  }
                );
                if (response.ok) {
                  showNotification("Profile picture updated succesfully");
                  router.refresh();
                }
              }
            }}
          />

          <button onClick={handleLogout} className="btn btn-soft btn-error">
            Logout
          </button>
        </div>

        <div className="divider divider-horizontal"></div>

        <div className="card-body">
          <div className="flex flex-row gap-2">
            <label className="floating-label">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
                className="input input-md"
              />
              <span>Full name</span>
            </label>
            <button
              onClick={handleUpdateUserProfile}
              className="btn"
              disabled={!fullName}
            >
              <Check></Check>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
