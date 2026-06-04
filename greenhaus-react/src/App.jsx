import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Feed from "./pages/Feed";

import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

import "./App.css";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* DEFAULT REDIRECT */}

        <Route
          path="/"
          element={
            <Navigate to="/login" />
          }
        />

        {/* AUTH ROUTES */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* MAIN APP */}

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route
            path="feed"
            element={<Feed />}
          />

          <Route
            index
            element={<Home />}
          />

          <Route
            path="explore"
            element={<Explore />}
          />

          <Route
            path="messages"
            element={<Messages />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;