import { useEffect, useState } from "react";
import api from "../api.js";
import UploadModal from "../components/UploadModal.jsx";
import SaveModal from "../components/SaveModal.jsx";

export default function Feed() {
  const [pins, setPins] = useState([]);
  const [open, setOpen] = useState(false);
  const [savePin, setSavePin] = useState(null);
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("latest");
  const [following, setFollowing] = useState([]);
  const loggedIn = !!localStorage.getItem("token");
  const me = JSON.parse(localStorage.getItem("user") || "null")?.id;

  const load = () => {
    let url = "/pins";
    if (query) url = `/pins/search?q=${encodeURIComponent(query)}`;
    else if (tab === "trending") url = "/pins/trending";
    api.get(url).then((r) => setPins(r.data)).catch(() => setPins([]));
  };
  useEffect(() => { load(); }, [query, tab]);

  useEffect(() => {
    if (loggedIn) api.get("/pins/following").then((r) => setFollowing(r.data)).catch(() => {});
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

  const like = async (id) => {
    if (!loggedIn) return (window.location = "/login");
    try {
      const { data } = await api.put(`/pins/${id}/like`);
      setPins((prev) =>
        prev.map((p) => {
          if (p._id !== id) return p;
          const list = (p.likes || []).filter((u) => u !== me);
          return { ...p, likes: data.active ? [...list, me] : list };
        })
      );
    } catch {
      alert("Please login again");
    }
  };

  const follow = async (uid) => {
    try {
      const { data } = await api.put(`/pins/follow/${uid}`);
      setFollowing((prev) => {
        const rest = prev.filter((x) => x !== uid);
        return data.following ? [...rest, uid] : rest;
      });
    } catch (e) {
      alert(e.response?.data?.msg || "Could not follow");
    }
  };

  const openSave = (id) => {
    if (!loggedIn) return (window.location = "/login");
    setSavePin(id);
  };

  const resetTab = (t) => { setQuery(""); setText(""); setTab(t); };

  return (
    <>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search: red, food, animals, blue sky..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setQuery(text.trim())}
        />
        <button onClick={() => setQuery(text.trim())}>Search</button>
        {query && <button onClick={() => { setText(""); setQuery(""); }}>Clear</button>}
        <div className="tabs">
          <button className={tab === "latest" ? "tab on" : "tab"} onClick={() => resetTab("latest")}>Latest</button>
          <button className={tab === "trending" ? "tab on" : "tab"} onClick={() => resetTab("trending")}>🔥 Trending</button>
        </div>
      </div>

      {pins.length === 0 && <p className="empty">No pins found</p>}

      <div className="grid">
        {pins.map((p) => {
          const ownerId = p.userId?._id ?? p.userId;
          const ownerName = p.userId?.name || "user";
          const isMine = me && ownerId === me;
          const showFollow = me && ownerId && !isMine && p.likes?.includes(me);
          const isFollowing = following.includes(ownerId);
          return (
            <div className="pin" key={p._id}>
              <img src={p.imageUrl} alt="" />
              <span
                className="dot"
                style={{ background: `rgb(${p.dominantColor?.r},${p.dominantColor?.g},${p.dominantColor?.b})` }}
              />
              {p.match !== undefined && <span className="badge">{Math.round(p.match * 100)}%</span>}
              {p.score !== undefined && !query && <span className="badge">🔥 {p.score}</span>}
              {isMine && (
                <button className="del" onClick={() => remove(p._id)}>🗑</button>
              )}
              {showFollow && (
                <button
                  className={isFollowing ? "follow on" : "follow"}
                  title={ownerName}
                  onClick={() => follow(ownerId)}
                >
                  {isFollowing ? "✓ Following" : `+ Follow ${ownerName}`}
                </button>
              )}
              <div className="actions">
                <button className={p.likes?.includes(me) ? "act on" : "act"} onClick={() => like(p._id)}>
                  ♥ {p.likes?.length || 0}
                </button>
                <button className={p.savedBy?.includes(me) ? "act on" : "act"} onClick={() => openSave(p._id)}>
                  ★ {p.savedBy?.length || 0}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loggedIn && <button className="fab" onClick={() => setOpen(true)}>+</button>}
      {open && <UploadModal onClose={() => setOpen(false)} onDone={load} />}
      {savePin && <SaveModal pinId={savePin} onClose={() => setSavePin(null)} onChange={load} />}
    </>
  );
}