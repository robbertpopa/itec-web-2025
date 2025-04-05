"use client";

import { ref, get } from "firebase/database";
import { auth, db } from "lib/firebase";
import { useState, useRef, useContext } from "react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserContext } from "../layout";

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

  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="card lg:card-side bg-base-100 shadow-sm max-w-250">
        <div className="flex flex-col items-center gap-4 p-10">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div className="avatar">
              <div className="w-40 h-40 rounded-full overflow-hidden">
                {userProfile ? (
                  <img
                    src={
                      userProfile.profilePicture ||
                      "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    }
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-40 h-40 bg-gray-300 rounded-full animate-pulse" />
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
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log("Selected file:", file);
              }
            }}
          />

          <div className="flex font-semibold text-lg">
            {userProfile ? (
              userProfile.fullName
            ) : (
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
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
