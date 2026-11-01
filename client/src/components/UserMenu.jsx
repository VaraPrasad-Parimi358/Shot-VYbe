import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Stats from "./Stats.jsx";

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location = "/login";
  };

  return (
    <div className="menu" ref={ref}>
      <button className="menu-btn" onClick={() => setOpen(!open)}>
        <span className="avatar">{user?.name?.[0]?.toUpperCase() || "?"}</span>
        {user?.name || "Account"} ▾
      </button>
      {open && (
        <div className="dropdown">
          <Stats onNavigate={() => setOpen(false)} />
          <Link to="/liked" onClick={() => setOpen(false)}>♥ Likes</Link>
          <Link to="/saved" onClick={() => setOpen(false)}>★ Saves</Link>
          <Link to="/boards" onClick={() => setOpen(false)}>🗂 My Boards</Link>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}