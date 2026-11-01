import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Collection({ type }) {
  const [pins, setPins] = useState([]);
  const loggedIn = !!localStorage.getItem("token");
  const title = type === "liked" ? "♥ Pins you liked" : "★ Pins you saved";

  useEffect(() => {
    if (loggedIn) api.get(`/pins/${type}`).then((r) => setPins(r.data)).catch(() => setPins([]));
  }, [type]);

  if (!loggedIn) return <p className="empty">Please <Link to="/login">login</Link> first</p>;

  return (
    <>
      <h2 className="page-title">{title} <small>({pins.length})</small></h2>
      {pins.length === 0 && <p className="empty">Nothing here yet</p>}
      <div className="grid">
        {pins.map((p) => (
          <div className="pin" key={p._id}>
            <img src={p.imageUrl} alt="" />
            <span
              className="dot"
              style={{ background: `rgb(${p.dominantColor?.r},${p.dominantColor?.g},${p.dominantColor?.b})` }}
            />
          </div>
        ))}
      </div>
    </>
  );
}