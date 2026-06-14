"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/context/PageTitleContext";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle("Messages");
    return () => {
      setPageTitle(null);
    };
  }, [setPageTitle]);

  return (
    <div className="absolute inset-2 md:inset-7">
      <ChatLayout />
    </div>
  );
}
