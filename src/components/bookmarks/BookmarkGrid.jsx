import React, { useEffect, useState } from "react";
import BookmarkCard from "./BookmarkCard";
import { getBookmarks } from "../../services/bookmark.service";

function BookmarkGrid() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const data = await getBookmarks();
        setBookmarks(data.bookmarks || []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchBookmarks();
  }, []);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {bookmarks.map((b) => (
        <BookmarkCard
          key={b.id}
          title={b.resource.title}
          author={b.resource.user?.name}
          type={b.resource.file_type}
          course={b.resource.course}
          savedOn={b.created_at}
          description={b.resource.description}
        />
      ))}
    </div>
  );
}

export default BookmarkGrid;