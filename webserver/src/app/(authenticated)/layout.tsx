"use client";

import Image from "next/image";
import Link from "next/link";
import { mainNavLinks } from "lib/navigation";
import useRequireEmailVerified from "lib/hooks/useRequireEmailVerified";
import { PlusCircle } from "lucide-react";
import Modal from "@/components/ui/Modal";
import CreateCourseForm from "@/components/ui/CreateCourseForm";
import React, { createContext, useEffect, useState } from "react";
import { get, ref } from "firebase/database";
import { auth, db } from "lib/firebase";
import { useRouter } from "next/navigation";

interface UserData {
  fullName: string;
  profilePicture: string;
}

export const UserContext = createContext<UserData | null>(null);

function getInitials(name: string): string {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useRequireEmailVerified();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {}, [userData?.profilePicture]);

  useEffect(() => {
    const unsubscribe = auth().onIdTokenChanged(async (user) => {
      if (user) {
        const userRef = ref(db(), `users/${user.uid}`);
        const snapshot = await get(userRef);
        setUserData(snapshot.val() ? { ...snapshot.val() } : null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={userData}>
      <div className="w-full h-full box-border">
        <nav className="fixed top-0 left-0 w-full z-50 navbar bg-base-100 shadow px-6">
          <div className="navbar-start">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/of_coursly.png"
                alt="OfCoursly Logo"
                width={64}
                height={64}
                className="cursor-pointer"
              />
            </Link>
            <div className="hidden lg:flex">
              <ul className="menu menu-horizontal px-1">
                {mainNavLinks.map((link, index) => (
                  <li key={`desktop-${link.name}-${index}`}>
                    <Link href={link.href} className="btn btn-ghost">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:hidden">
              <div className="dropdown">
                <label tabIndex={0} className="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </label>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
                >
                  {mainNavLinks.map((link, index) => (
                    <li key={`mobile-${link.name}-${index}`}>
                      <Link href={link.href} className="btn btn-ghost">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="navbar-end gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary btn-sm hidden sm:flex"
            >
              <PlusCircle size={16} className="mr-1" />
              Create Course
            </button>
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            <Link href="/profile" className="no-underline">
              <div className="flex flex-row justify-center items-center gap-2 cursor-pointer">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative">
                    {userData === null ? (
                      <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse" />
                    ) : userData.profilePicture ? (
                      <>
                        <img
                          src={`${userData.profilePicture}?t=${new Date().getTime()}`}
                          alt="Profile picture"
                          className="w-full h-full object-cover"
                        />
                      </>
                    ) : (
                      <div className="w-10 h-10 bg-neutral-focus text-neutral-content rounded-full flex items-center justify-center">
                        <span className="text-sm">
                          {getInitials(userData.fullName)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex font-semibold">
                  {userData === null ? (
                    <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
                  ) : (
                    userData.fullName
                  )}
                </div>
              </div>
            </Link>
          </div>
        </nav>
        {/* Main content with top padding to account for fixed navbar height */}
        <main className="w-full flex flex-col px-6 py-4 bg min-h-screen pt-24">
          {children}
        </main>
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create a New Course"
        >
          <CreateCourseForm
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={(courseId: string) => {
              setIsCreateModalOpen(false);
              router.push("/courses/" + courseId);
            }}
          />
        </Modal>
      </div>
    </UserContext.Provider>
  );
}
