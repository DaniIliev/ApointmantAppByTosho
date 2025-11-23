"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/AuthContext";

// Дефиниране на интерфейс за съобщенията
interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

// Компонент за едно съобщение в чата
const ChatMessage = ({ message, isUser }: ChatMessageProps) => (
  <div
    className={`p-2 my-2 rounded-xl max-w-[80%] ${
      isUser
        ? "bg-primary text-primary-foreground ml-auto"
        : "bg-muted text-muted-foreground mr-auto"
    }`}
  >
    {message}
  </div>
);

export default function Chatbot({ businessId }: { businessId?: string }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    { message: "Здравейте! Как мога да ви помогна?", isUser: false }, // Коригирано на message
  ]);
  const { user } = useAuthContext();
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const userMessage: ChatMessageProps = { message: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response: { response: string } = await callApi(
        "/api/chatbot",
        "POST",
        {
          message: input,
          userId: user?._id,
          businessId: businessId, // Предаваме businessId
        }
      );

      setMessages((prev) => [
        ...prev,
        { message: response.response, isUser: false },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          message:
            "Има проблем със свързването към чатбота. Моля, опитайте по-късно.",
          isUser: false,
        },
      ]);
      console.error("Chatbot API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-96 bg-background rounded-xl shadow-2xl flex flex-col transition-all duration-300">
          <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-t-xl">
            <span className="font-bold">Чатбот</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                isUser={msg.isUser}
              />
            ))}
            {loading && <ChatMessage message="Пиша..." isUser={false} />}
          </div>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Напишете съобщение..."
              />
              <Button onClick={handleSendMessage} disabled={loading}>
                Изпрати
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="default"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="rounded-full w-10 h-10 shadow-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </Button>
      )}
    </div>
  );
}
