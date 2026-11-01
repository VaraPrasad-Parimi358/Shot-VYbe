import { useState } from "react";
import api from "../api.js";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location = "/";
    } catch (e) {
      setErr(e.response?.data?.msg || "Something went wrong");
    }
  };

  return (
    <div className="auth">
      <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
      {mode === "register" && <input name="name" placeholder="Name" onChange={change} />}
      <input name="email" placeholder="Email" onChange={change} />
      <input name="password" type="password" placeholder="Password" onChange={change} />
      {err && <p className="err">{err}</p>}
      <button onClick={submit}>{mode === "login" ? "Login" : "Register"}</button>
      <p className="switch" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "New here? Register" : "Have an account? Login"}
      </p>
    </div>
  );
}