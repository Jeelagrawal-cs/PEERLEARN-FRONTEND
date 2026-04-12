import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

function UserProfileLink({
  userId,
  name,
  className = "",
  ownProfileClassName = "",
  stopPropagation = false,
}) {
  const { user } = useAuth();

  const currentRole = String(
    user?.role_name || user?.role || user?.user_role || "student"
  ).toLowerCase();

  const currentUserId = Number(user?.user_id || user?.id || 0);
  const targetUserId = Number(userId || 0);
  const isOwnProfile = targetUserId > 0 && currentUserId === targetUserId;

  const to = isOwnProfile
    ? currentRole === "admin"
      ? "/admin/profile"
      : "/student/profile"
    : currentRole === "admin"
    ? `/admin/users/${targetUserId}`
    : `/student/users/${targetUserId}`;

  function handleClick(event) {
    if (stopPropagation) {
      event.stopPropagation();
    }
  }

  return (
    <Link
      to={to}
      onClick={handleClick}
      className={[
        "inline-flex items-center rounded-xl transition hover:text-blue-700 hover:underline-offset-4 hover:underline",
        isOwnProfile ? ownProfileClassName : className,
      ].join(" ")}
    >
      {name || "Unknown"}
    </Link>
  );
}

export default UserProfileLink;