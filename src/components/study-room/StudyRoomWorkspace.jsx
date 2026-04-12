import React from "react";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  CopyCheck,
  MessagesSquare,
  SendHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

function formatDateTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString();
}

function getInitials(name) {
  return String(name || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StudyRoomWorkspace({
  course,
  room,
  participants,
  messages,
  notes,
  onNotesChange,
  notesSaveState,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  typingUsers,
  currentUserId,
  onBack,
}) {
  return (
    <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-white/80 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white shadow-[0_12px_40px_rgba(74,104,179,0.14)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <ArrowLeft size={16} />
                Back to Study Rooms
              </button>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-200">
                  Live collaborative room
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  {room?.title || `${course?.course_name || "Course"} Study Room`}
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100/90">
                  Real-time chat + shared collaborative notes for group study,
                  quick revision, and live class discussion.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-blue-100">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    Course
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-white">
                  {course?.course_code} · {course?.course_name}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-blue-100">
                  <Users size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    Online
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-white">
                  {participants.length}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-blue-100">
                  <MessagesSquare size={16} />
                  <span className="text-xs font-bold uppercase tracking-[0.18em]">
                    Messages
                  </span>
                </div>
                <p className="mt-2 text-2xl font-black text-white">
                  {messages.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr_0.8fr]">
          <section className="rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">
                  Shared Notes
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Live whiteboard notes
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CopyCheck size={14} />
                {notesSaveState}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Type shared notes here... everyone in the room sees updates live."
              className="mt-5 h-[520px] w-full resize-none rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </section>

          <section className="rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">
                  Group Chat
                </p>
                <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  Live discussion feed
                </h2>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                <Sparkles size={14} />
                Real-time
              </div>
            </div>

            <div className="mt-5 h-[430px] space-y-4 overflow-y-auto rounded-[26px] border border-slate-200 bg-slate-50 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-[22px] border border-dashed border-slate-300 bg-white px-6 text-center text-sm text-slate-500">
                  No messages yet. Open the room in another tab and start the live demo.
                </div>
              ) : (
                messages.map((message) => {
                  const isOwn = Number(message.user_id) === Number(currentUserId);

                  return (
                    <div
                      key={message.study_room_message_id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-[24px] px-4 py-3 shadow-sm ${
                          isOwn
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {!isOwn ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[11px] font-bold text-white">
                              {getInitials(message.sender_name)}
                            </div>
                          ) : null}

                          <div>
                            <p
                              className={`text-xs font-bold ${
                                isOwn ? "text-slate-300" : "text-slate-900"
                              }`}
                            >
                              {isOwn ? "You" : message.sender_name}
                            </p>
                            <p
                              className={`text-[11px] ${
                                isOwn ? "text-slate-400" : "text-slate-500"
                              }`}
                            >
                              {formatDateTime(message.created_at)}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
                          {message.message_text}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-4 rounded-[26px] border border-slate-200 bg-slate-50 p-3">
              <textarea
                value={messageInput}
                onChange={(event) => onMessageInputChange(event.target.value)}
                placeholder="Send a message to the room..."
                className="h-24 w-full resize-none rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-400"
              />

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  {typingUsers.length > 0
                    ? `${typingUsers.join(", ")} typing...`
                    : "Live typing indicator enabled"}
                </div>

                <button
                  type="button"
                  onClick={onSendMessage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <SendHorizontal size={16} />
                  Send
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-500">
                Presence
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Active users
              </h2>

              <div className="mt-5 space-y-3">
                {participants.length === 0 ? (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No active users yet.
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                        {getInitials(participant.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {Number(participant.user_id) === Number(currentUserId)
                            ? "You"
                            : participant.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-white/80 bg-white p-5 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
                Room Info
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                Demo highlights
              </h2>

              <div className="mt-5 space-y-4">
                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <Clock3 size={16} />
                    <span className="text-sm font-bold">Last note sync</span>
                  </div>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    {formatDateTime(room?.updated_at)}
                  </p>
                </div>

                <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    Best way to present
                  </p>
                  <ul className="mt-2 space-y-2 text-xs leading-6 text-slate-500">
                    <li>• Open the same room in two tabs</li>
                    <li>• Type notes in one tab</li>
                    <li>• Send chat from the second tab</li>
                    <li>• Show live participant count changing</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default StudyRoomWorkspace;