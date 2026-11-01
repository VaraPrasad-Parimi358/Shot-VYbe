import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api.js";

export default function Stats({ onNavigate }) {
  const [s, setS] = useState(null);
  useEffect(() => {
    api.get("/pins/me/stats").then((r) => setS(r.data)).catch(() => {});
  }, []);

  return (
    <div className="stats">
      <Link to="/my-posts" onClick={onNavigate}>
        <b>{s?.posts ?? "–"}</b><span>Posts</span>
      </Link>
      <Link to="/people/followers" onClick={onNavigate}>
        <b>{s?.followers ?? "–"}</b><span>Followers</span>
      </Link>
      <Link to="/people/following" onClick={onNavigate}>
        <b>{s?.following ?? "–"}</b><span>Following</span>
      </Link>
    </div>
  );
}