"use client";

import { ref, get } from "firebase/database";
import { auth, db } from "lib/firebase";
import { useState, useRef, useContext, useEffect } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserContext } from "../layout";

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

export default function Page() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const userProfile = useContext(UserContext);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  useEffect(() => {
    console.log("User profile changed:", userProfile);
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
                    <span className="text-5xl">{getInitials(userProfile.fullName)}</span>
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
                const token = await auth?.currentUser?.getIdToken();
                const formData = new FormData();
                formData.append("image", file);
                const response = await fetch(
                  "/api/users/" + auth?.currentUser?.uid,
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                  }
                );
                if (response.ok) {
                  router.refresh();
                }
              }
            }}
          />

          <div className="flex font-semibold text-lg">
            {userProfile === null ? (
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
            ) : (
              userProfile.fullName
            )}
          </div>
          <button onClick={handleLogout} className="btn btn-soft btn-error">
            Logout
          </button>
        </div>

        <div className="divider divider-horizontal"></div>

        <div className="card-body">
          <h2 className="card-title">New album is released!</h2>
          <p>Click the button to listen on Spotiwhy app.</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Listen</button>
          </div>
        </div>
      </div>
    </div>
  );
}
