import { useEffect, useState } from "react";
import api from "../api.js";

export default function SaveModal({ pinId, onClose, onChange }) {
  const [boards, setBoards] = useState([]);
  const [name, setName] = useState("");

  const load = () => api.get("/boards").then((r) => setBoards(r.data));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    await api.post("/boards", { name });
    setName("");
    load();
  };

  const toggle = async (b) => {
    await api.put(`/boards/${b._id}/pins/${pinId}`);
    await load();
    onChange();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Save to board</h3>
        {boards.length === 0 && <p className="empty">No boards yet. Create one below.</p>}
        {boards.map((b) => {
          const has = b.pins.some((p) => p._id === pinId);
          return (
            <button key={b._id} className={has ? "board-row on" : "board-row"} onClick={() => toggle(b)}>
              <span>{b.name}</span>
              <span>{has ? "✓ Saved" : "Save"}</span>
            </button>
          );
        })}
        <div className="row">
          <input placeholder="New board name" value={name} onChange={(e) => setName(e.target.value)} />
          <button onClick={create}>Create</button>
        </div>
      </div>
    </div>
  );
}