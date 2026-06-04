import "./Auth.css";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { loginUser } from "../lib/supabase";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin() {

    const data =
      await loginUser(
        email,
        password
      );

    if (data) {

      console.log(
        "Logged in!"
      );

      navigate("/app");

    }

  }

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>Welcome Back</h1>

        <p>
          Log into GreenHaus.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={handleLogin}
        >
          Login
        </button>

      </div>

    </div>

  );

}

export default Login;