"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, MicOff, Send } from "lucide-react";
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    : null;
import callApi from "@/app/Api/callApi";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthContext";
import { CustomTooltip } from "../customUIComponents/CustomTooltip";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessageProps[]>([
    { message: "Здравейте! Как мога да ви помогна?", isUser: false },
  ]);
  const { user } = useAuthContext();
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  // Voice message state
  const [listening, setListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  // Ref for chat scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);
  // Voice message handlers
  const handleMicDown = () => {
    if (!SpeechRecognition)
      return alert("Гласовото разпознаване не се поддържа в този браузър.");
    if (listening && recognition) {
      recognition.stop();
      setListening(false);
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = "bg-BG";
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    setRecognition(recog);
    setListening(true);
    recog.start();
  };

  const handleMicUp = () => {
    if (listening && recognition) {
      recognition.stop();
      setListening(false);
    }
  };

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
          userId: user?._id || "guest",
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
            <CustomTooltip
              onClick={() => setIsOpen(false)}
              icon={<X className="hover:text-primary h-6 w-6" />}
            />
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
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t">
            {/* Recording indicator */}
            {listening && (
              <div className="flex items-center mb-2 gap-2 animate-pulse">
                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                <span className="text-red-600 font-semibold">Recording...</span>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Напишете съобщение..."
                rows={2}
                className="flex-1 resize-none rounded-md border-[1.5px] border-primary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background text-foreground min-h-[40px] max-h-32"
                style={{ lineHeight: "1.4" }}
              />
              <button
                ref={micButtonRef}
                type="button"
                className={`relative w-10 h-10 flex items-center justify-center rounded-full border-none outline-none transition-all duration-200
                  ${
                    listening
                      ? "bg-blue-200 shadow-lg animate-pulse"
                      : "bg-muted"
                  }
                `}
                onMouseDown={handleMicDown}
                onMouseUp={handleMicUp}
                onTouchStart={handleMicDown}
                onTouchEnd={handleMicUp}
                disabled={loading}
                aria-label={listening ? "Говори" : "Гласово съобщение"}
              >
                {listening ? (
                  <MicOff
                    className="w-6 h-6 text-blue-500"
                    onClick={handleMicUp}
                  />
                ) : (
                  <Mic className="w-6 h-6 text-primary" />
                )}
                {listening && (
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-blue-500 animate-pulse">
                    Говорете...
                  </span>
                )}
              </button>
              <Button
                onClick={handleSendMessage}
                disabled={loading}
                size="icon"
                aria-label="Изпрати"
              >
                <Send className="w-5 h-5" />
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
