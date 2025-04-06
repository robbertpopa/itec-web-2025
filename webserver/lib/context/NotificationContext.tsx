"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface NotificationContextValue {
  message: string;
  variant: "success" | "error" | "";
  showNotification: (
    msg: string,
    variant?: "success" | "error",
    duration?: number
  ) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  message: "",
  variant: "",
  showNotification: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState<"success" | "error" | "">("");

  const showNotification = (
    msg: string,
    variant: "success" | "error" = "success",
    duration = 3000
  ) => {
    setMessage(msg);
    setVariant(variant);
    setTimeout(() => {
      setMessage("");
      setVariant("");
    }, duration);
  };

  return (
    <NotificationContext.Provider value={{ message, variant, showNotification }}>
      {children}
      {message && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 
            px-6 py-3 rounded shadow-lg text-white transition-all duration-500
            ${variant === "success" ? "bg-green-600" : "bg-red-600"}
            animate-slideIn`}
        >
          {message}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
