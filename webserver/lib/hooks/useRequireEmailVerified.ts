'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "lib/firebase";
import { useNotification } from "lib/context/NotificationContext";

export default function useRequireEmailVerified() {
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else if (!user.emailVerified) {
        await signOut(auth);
        showNotification('You need to verify you account before login into your account.', 'error');
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);
}
