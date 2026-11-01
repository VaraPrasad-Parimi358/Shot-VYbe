import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [name, setName] = useState("");
  const loggedIn = !!localStorage.getItem("token");

  const load = () => api.get("/boards").then((r) => setBoards(r.data));
  useEffect(() => { if (loggedIn) load(); }, []);

  if (!loggedIn) return <p className="empty">Please <Link to="/login">login</Link> to see your boards</p>;

  const create = async () => {
    if (!name.trim()) return;
    await api.post("/boards", { name });
    setName("");
    load();
  };
  const removeBoard = async (id) => {
    if (!window.confirm("Delete this board?")) return;
    await api.delete(`/boards/${id}`);
    load();
  };
  const removePin = async (boardId, pinId) => {
    await api.put(`/boards/${boardId}/pins/${pinId}`);
    load();
  };

  return (
    <div className="boards">
      <div className="row">
        <input className="search" placeholder="New board name" value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={create}>Create board</button>
      </div>

      {boards.length === 0 && <p className="empty">No boards yet</p>}

      {boards.map((b) => (
        <div className="board" key={b._id}>
          <h3>
            {b.name} <small>({b.pins.length})</small>
            <button onClick={() => removeBoard(b._id)}>Delete board</button>
          </h3>
          <div className="thumbs">
            {b.pins.map((p) => (
              <div className="thumb" key={p._id}>
                <img src={p.imageUrl} alt="" />
                <button className="del" onClick={() => removePin(b._id, p._id)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}