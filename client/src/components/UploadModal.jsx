import { useState } from "react";
import api from "../api.js";

export default function UploadModal({ onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!file) return setErr("Choose a photo first");
    const fd = new FormData();
    fd.append("image", file);
    fd.append("tags", tags);
    setBusy(true);
    try {
      await api.post("/pins", fd);
      onDone();
      onClose();
    } catch (e) {
      setErr(e.response?.data?.msg || "Upload failed");
      setBusy(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>New pin</h3>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        {file && <img className="preview" src={URL.createObjectURL(file)} alt="" />}
        <input placeholder="tags: nature, red" value={tags} onChange={(e) => setTags(e.target.value)} />
        {err && <p className="err">{err}</p>}
        <button onClick={submit} disabled={busy}>{busy ? "Uploading..." : "Upload"}</button>
      </div>
    </div>
  );
}