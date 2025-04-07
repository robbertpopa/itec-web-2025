"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "lib/firebase";

export default function useRedirectIfAuthenticated() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth(), (user) => {
      if (user) {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);
}
