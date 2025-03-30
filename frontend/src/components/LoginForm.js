import React, { useState } from "react";
import { usePeloton } from "../contexts/PelotonContext";

export default function LoginForm() {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loginError } = usePeloton();

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(usernameOrEmail, password);
  };

  return (
    <div className="card p-4 shadow">
      <h2 className="text-center mb-4">Login to Peloton</h2>

      {loginError && <div className="alert alert-danger">{loginError}</div>}

      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label htmlFor="usernameOrEmail" className="form-label">
            Username or Email
          </label>
          <input
            type="text"
            className="form-control"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}
