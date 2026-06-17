import { useMutation } from "@tanstack/react-query";
import { Bot, Send, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  text: string;
  source?: string;
}

const SUGGESTIONS = [
  "What should I do with a CRITICAL parcel?",
  "How can I reduce wildfire risk in a dry region?",
  "Best practices for low soil moisture?",
];

export function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const mutation = useMutation({
    mutationFn: (message: string) => chat({ message }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, source: data.source },
      ]);
    },
    onError: () => toast.error("Chat failed. Is the backend running?"),
  });

  function send(text: string) {
    const message = text.trim();
    if (!message) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    mutation.mutate(message);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Resilience Assistant</h1>
        <p className="text-muted-foreground">
          Generative-AI guidance for civil defense and agronomy.
        </p>
      </header>

      <Card className="flex h-[60vh] flex-col">
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>Ask about mitigation actions for a risk level.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    {m.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <Markdown>{m.text}</Markdown>
                    )}
                    {m.source && (
                      <p className="mt-1 text-[10px] uppercase tracking-wide opacity-60">
                        source: {m.source}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {mutation.isPending && (
              <p className="text-sm text-muted-foreground">Assistant is typing...</p>
            )}
          </div>

          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              className="min-h-[44px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" size="icon" disabled={mutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
