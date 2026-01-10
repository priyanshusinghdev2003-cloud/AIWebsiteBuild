import React, { useEffect, useRef, useState } from "react";
import type { Message, Project, Version } from "../types";
import {
  BotIcon,
  EyeIcon,
  Loader2Icon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

function Sidebar({
  isMenuOpen,
  project,
  setProject,
  isGenerating,
  setIsGenerating,
}: {
  isMenuOpen: boolean;
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const handleRollback = async (versionId: string) => {};
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [project.conversation.length, isGenerating]);
  return (
    <div
      className={`h-full sm:max-w-sm rounded-xl bg-gray-900 border border-gray-800 transition-all ${
        isMenuOpen ? "max-sm:w-0 overflow-hidden" : "w-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* message */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 flex flex-col gap-4">
          {[...project?.conversation, ...project?.versions]
            .sort(
              (a, b) =>
                new Date(a.timestamp).getTime() -
                new Date(b.timestamp).getTime()
            )
            .map((message) => {
              const isMessage = "content" in message;
              if (isMessage) {
                const msg = message as Message;
                const isUser = msg.role === "user";
                return (
                  <div
                    className={`flex items-start gap-3 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                    key={msg.id}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                        <BotIcon className="size-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-2 px-4 rounded-2xl shadow-sm text-sm mt-5 leading-relaxed ${
                        isUser
                          ? "bg-linear-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none"
                          : "text-gray-100 rounded-tl-none bg-gray-800 "
                      }`}
                    >
                      {msg.content}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <UserIcon className="size-5 text-gray-200" />
                      </div>
                    )}
                  </div>
                );
              } else {
                const version = message as Version;
                return (
                  <div
                    key={version.id}
                    className="w-4/5 mx-auto my-2 p-3 rounded-xl bg-gray-800 text-gray-100 shadow flex flex-col gap-2"
                  >
                    <div className="text-xs font-medium">
                      code updated <br />
                      <span className="text-gray-500 text-xs font-normal">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      {project?.current_version_index === version.id ? (
                        <button className="bg-gray-700 px-3 py-1 rounded-md text-xs">
                          Current Version
                        </button>
                      ) : (
                        <button
                          className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded-md text-xs"
                          onClick={() => handleRollback(version.id)}
                        >
                          Roll back to this version
                        </button>
                      )}
                      <Link
                        target="_blank"
                        to={`/preview/${project?.id}/${version.id}`}
                      >
                        <EyeIcon className="size-6 p-1 bg-gray-700 hover:bg-gray-500 transition-colors rounded" />
                      </Link>
                    </div>
                  </div>
                );
              }
            })}
          {isGenerating && (
            <div className="flex items-center justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-600 to-indigo-700 flex items-center justify-center">
                <BotIcon className="size-5 text-white" />
              </div>
              <div className="flex gap-1.5 h-full items-end">
                <span
                  className="size-2 rounded-full bg-gray-600 animate-bounce"
                  style={{
                    animationDelay: "0s",
                  }}
                />
                <span
                  className="size-2 rounded-full bg-gray-600 animate-bounce"
                  style={{
                    animationDelay: "0.2s",
                  }}
                />
                <span
                  className="size-2 rounded-full bg-gray-600 animate-bounce"
                  style={{
                    animationDelay: "0.4s",
                  }}
                />
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
        {/* input */}
        <form className="m-3 relative">
          <div className="flex items-center gap-2">
            <textarea
              rows={4}
              placeholder="Describe your website or request changes..."
              className="flex-1 p-3 rounded-xl resize-none text-sm outline-none ring ring-gray-700 focus:ring-indigo-600 bg-gray-800 text-gray-100 placeholder-gray-400 transition-all"
              disabled={isGenerating}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              className="absolute bottom-2.5 right-2.5 rounded-full bg-linear-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white transition-colors disabled:opacity-60"
              disabled={isGenerating || !input.trim()}
            >
              {isGenerating ? (
                <Loader2Icon className="size-7 p-1.5 text-white animate-spin" />
              ) : (
                <SendIcon className="size-7 p-1.5 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Sidebar;
