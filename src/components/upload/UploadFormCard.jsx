import React, { useState } from "react";
import { uploadResource } from "../../services/resource.service";

function UploadFormCard() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    course: "",
    semester: "",
    subject: "",
  });

  const [file, setFile] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    setFile(e.target.files[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("course", formData.course);
    data.append("semester", formData.semester);
    data.append("subject", formData.subject);
    data.append("file", file);

    try {
      await uploadResource(data);
      alert("Uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border">
      <input
        name="title"
        placeholder="Title"
        onChange={handleChange}
        className="w-full mb-3 p-3 border rounded"
      />

      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        className="w-full mb-3 p-3 border rounded"
      />

      <input type="file" onChange={handleFileChange} />

      <button className="mt-4 bg-blue-600 text-white px-5 py-3 rounded">
        Upload
      </button>
    </form>
  );
}

export default UploadFormCard;