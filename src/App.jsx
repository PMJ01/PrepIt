import { useEffect, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import ParticlesBackground from "./components/ParticlesBackground";

function Landing() {
  return (
    <main className="landing noise">
      <section className="landing-copy page-enter">
        <div>
          <div className="brand-mark">PREP<span>CORE / DAILY PREPARATION</span></div>
          <div className="landing-copy-block">
            <div className="eyebrow">The daily study cockpit</div>
            <h1 className="display">Preparation that<br />compounds.</h1>
            <p className="lede">PrepCore turns a vague placement goal into a clear next session: one problem, one concept, one step closer to the offer.</p>
            <div className="button-row">
              <Link className="btn btn-primary" to="/login">Start preparation <span>→</span></Link>
              <Link className="btn btn-quiet" to="/login">Browse the bank</Link>
            </div>
          </div>
        </div>
        <div className="footer-note">Built for returning tomorrow / not browsing today</div>
      </section>
      <section className="landing-aside page-enter delay-2">
        <div className="eyebrow">What changes here</div>
        <div className="aside-statement">Less tab-hopping.<br /><strong>More signal.</strong></div>
        <div className="mark-grid">
          <div className="mark-grid-row"><span>01 / Direction</span><span>A command center that tells you what to do next, not just what you have done.</span></div>
          <div className="mark-grid-row"><span>02 / Repetition</span><span>Practice, tests, and company plans live in one short feedback loop.</span></div>
          <div className="mark-grid-row"><span>03 / Confidence</span><span>See readiness grow through evidence: solved problems, focused minutes, sharper recall.</span></div>
        </div>
      </section>
    </main>
  );
}

function AppRoutes() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("auth_token")));

  useEffect(() => {
    const sync = () => setAuthenticated(Boolean(localStorage.getItem("auth_token")));
    window.addEventListener("prepcore-auth", sync);
    return () => window.removeEventListener("prepcore-auth", sync);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={authenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/*" element={authenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <ParticlesBackground theme={theme} />
      <AppRoutes />
    </BrowserRouter>
  );
}