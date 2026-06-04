import "./Auth.css";

import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { signUpUser } from "../lib/supabase";

function Signup() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleSignup() {

    const data =
      await signUpUser(
        email,
        password
      );

    if (data) {

      console.log(
        "Account created!"
      );

      navigate("/login");

    }

  }

  return (

    <div className="auth-page">

      <div className="auth-card">

        <h1>Create Account</h1>

        <p>
          Join the GreenHaus community.
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
          onClick={handleSignup}
        >
          Create Account
        </button>

      </div>

    </div>

  );

}

export default Signup;