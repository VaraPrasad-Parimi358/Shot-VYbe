import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api.js";

export default function People() {
  const { type } = useParams(); // "followers" or "following"
  const [people, setPeople] = useState([]);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    api.get(`/pins/people/${type}`).then((r) => setPeople(r.data)).catch(() => setPeople([]));
    api.get("/pins/following").then((r) => setFollowing(r.data)).catch(() => {});
  }, [type]);

  const toggle = async (id) => {
    try {
      const { data } = await api.put(`/pins/follow/${id}`);
      setFollowing((prev) => {
        const rest = prev.filter((x) => x !== id);
        return data.following ? [...rest, id] : rest;
      });
    } catch (e) {
      alert(e.response?.data?.msg || "Could not update");
    }
  };

  return (
    <>
      <h2 className="page-title">
        {type === "followers" ? "Followers" : "Following"} <small>({people.length})</small>
      </h2>
      <div className="people">
        {people.length === 0 && (
          <p className="empty">
            {type === "followers" ? "No followers yet" : "You aren't following anyone yet"}
          </p>
        )}
        {people.map((u) => {
          const isF = following.includes(u._id);
          return (
            <div className="person" key={u._id}>
              <span className="mini-avatar big">{u.name?.[0]?.toUpperCase()}</span>
              <span className="person-name">{u.name}</span>
              <button className={isF ? "act on" : "act"} onClick={() => toggle(u._id)}>
                {isF ? "Following" : type === "followers" ? "Follow back" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="back"><Link to="/">← Back to feed</Link></p>
    </>
  );
}