import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import StudyRoomWorkspace from "../../components/study-room/StudyRoomWorkspace.jsx";
import {
  createStudyRoomSocket,
  fetchStudyRoomByCourse,
} from "../../services/studyRoom.service.js";

function StudyRoomPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [snapshot, setSnapshot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsersMap, setTypingUsersMap] = useState({});
  const [notes, setNotes] = useState("");
  const [notesSaveState, setNotesSaveState] = useState("Saved");
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const socketRef = useRef(null);
  const notesTimeoutRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [courseId]);

  useEffect(() => {
    let isMounted = true;

    async function loadSnapshot() {
      try {
        setIsLoading(true);
        setError("");

        const data = await fetchStudyRoomByCourse(courseId);

        if (!isMounted) return;

        setSnapshot(data || null);
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setNotes(String(data?.room?.notes_content || ""));
      } catch (loadError) {
        console.error("Study room snapshot load error:", loadError);

        if (!isMounted) return;

        setSnapshot(null);
        setMessages([]);
        setNotes("");
        setError(
          loadError?.response?.data?.message ||
            loadError?.message ||
            "Failed to load study room."
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    const socket = createStudyRoomSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("study_room:join", { courseId: Number(courseId) });
    });

    socket.on("study_room:presence", (payload = {}) => {
      setParticipants(Array.isArray(payload.participants) ? payload.participants : []);
    });

    socket.on("study_room:message:new", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("study_room:notes:updated", (payload = {}) => {
      setNotes(String(payload.notesContent || ""));
      setNotesSaveState("Saved");
    });

    socket.on("study_room:typing", (payload = {}) => {
      const userId = payload.user_id;

      if (!userId) return;

      setTypingUsersMap((prev) => {
        const next = { ...prev };

        if (payload.isTyping) {
          next[userId] = payload.name || "Someone";
        } else {
          delete next[userId];
        }

        return next;
      });
    });

    socket.on("connect_error", (socketError) => {
      console.error("Study room socket connect error:", socketError);
    });

    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (typingStopTimeoutRef.current) {
        clearTimeout(typingStopTimeoutRef.current);
      }

      socket.emit("study_room:leave", { courseId: Number(courseId) });
      socket.disconnect();
    };
  }, [courseId]);

  function handleNotesChange(nextValue) {
    setNotes(nextValue);
    setNotesSaveState("Saving...");

    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }

    notesTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit(
        "study_room:notes:update",
        {
          courseId: Number(courseId),
          notesContent: nextValue,
        },
        (response) => {
          if (response?.success) {
            setNotesSaveState("Saved");
            setSnapshot((prev) =>
              prev
                ? {
                    ...prev,
                    room: {
                      ...prev.room,
                      notes_content: nextValue,
                      updated_at: response?.data?.updatedAt || prev.room.updated_at,
                    },
                  }
                : prev
            );
          } else {
            setNotesSaveState("Retry needed");
          }
        }
      );
    }, 450);
  }

  function emitTypingState(isTyping) {
    socketRef.current?.emit("study_room:typing", {
      courseId: Number(courseId),
      isTyping,
    });
  }

  function handleMessageInputChange(nextValue) {
    setMessageInput(nextValue);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typingStopTimeoutRef.current) {
      clearTimeout(typingStopTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      emitTypingState(true);
    }, 50);

    typingStopTimeoutRef.current = setTimeout(() => {
      emitTypingState(false);
    }, 900);
  }

  function handleSendMessage() {
    const safeMessage = String(messageInput || "").trim();

    if (!safeMessage) return;

    socketRef.current?.emit(
      "study_room:message:send",
      {
        courseId: Number(courseId),
        message: safeMessage,
      },
      (response) => {
        if (response?.success) {
          setMessageInput("");
          emitTypingState(false);
        } else {
          alert(response?.message || "Failed to send message.");
        }
      }
    );
  }

  const typingUsers = useMemo(() => {
    return Object.entries(typingUsersMap)
      .filter(([userId]) => Number(userId) !== Number(user?.id || user?.user_id))
      .map(([, name]) => name);
  }, [typingUsersMap, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[32px] border border-white/80 bg-white p-8 shadow-[0_12px_40px_rgba(74,104,179,0.08)]">
          <p className="text-sm text-slate-500">Loading study room...</p>
        </div>
      </div>
    );
  }

  if (error || !snapshot?.course || !snapshot?.room) {
    return (
      <div className="min-h-screen bg-[#f4f7ff] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-[32px] border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm text-red-700">
            {error || "Study room could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/study-rooms")}
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to Study Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <StudyRoomWorkspace
      course={snapshot.course}
      room={snapshot.room}
      participants={participants}
      messages={messages}
      notes={notes}
      onNotesChange={handleNotesChange}
      notesSaveState={notesSaveState}
      messageInput={messageInput}
      onMessageInputChange={handleMessageInputChange}
      onSendMessage={handleSendMessage}
      typingUsers={typingUsers}
      currentUserId={user?.id || user?.user_id}
      onBack={() => navigate("/student/study-rooms")}
    />
  );
}

export default StudyRoomPage;