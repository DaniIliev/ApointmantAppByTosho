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
    <div className="h-full w-full">
      <ChatLayout />
    </div>
  );
}
