import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function MyPosts() {
  const [pins, setPins] = useState([]);

  useEffect(() => {
    api.get("/pins/mine").then((r) => setPins(r.data)).catch(() => setPins([]));
  }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this pin?")) return;
    try {
      await api.delete(`/pins/${id}`);
      setPins((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      alert(e.response?.data?.msg || "Could not delete");
    }
  };

  return (
    <>
      <h2 className="page-title">My Posts <small>({pins.length})</small></h2>
      {pins.length === 0 && <p className="empty">You haven't posted anything yet</p>}
      <div className="boards">
        <div className="thumbs">
          {pins.map((p) => (
            <div className="thumb" key={p._id}>
              <img src={p.imageUrl} alt="" />
              <button className="del" onClick={() => remove(p._id)}>🗑</button>
            </div>
          ))}
        </div>
      </div>
      <p className="back"><Link to="/">← Back to feed</Link></p>
    </>
  );
}