import { Routes, Route, Link, Navigate } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Feed from "./pages/Feed.jsx";
import Boards from "./pages/Boards.jsx";
import Collection from "./pages/Collection.jsx";
import UserMenu from "./components/UserMenu.jsx";
import People from "./pages/People.jsx";
import MyPosts from "./pages/MyPosts.jsx";

export default function App() {
  const loggedIn = !!localStorage.getItem("token");
  return (
    <>
      <nav className="nav">
        <Link to="/" className="logo">ShotVybe</Link>
        {loggedIn ? <UserMenu /> : <Link to="/login">Login</Link>}
      </nav>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/boards" element={<Boards />} />
        <Route path="/liked" element={<Collection type="liked" />} />
        <Route path="/saved" element={<Collection type="saved" />} />
        <Route path="/people/:type" element={<People />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}