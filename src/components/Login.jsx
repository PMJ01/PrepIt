import React, { useState } from 'react';

const API_BASE_URL = '/backend-php';

export default function Login({ onLoginSuccess }) {
  const [mode, setMode] = useState('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const isSignUp = mode === 'signup';
    const endpoint = isSignUp 
      ? `${API_BASE_URL}/signup.php` 
      : `${API_BASE_URL}/login.php`;

    const payload = isSignUp 
      ? { full_name: fullName, email, password } 
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.status === 'success') {
        if (isSignUp) {
          setSuccessMsg(data.message);
          setTimeout(() => {
            setMode('signin');
            setPassword('');
            setSuccessMsg('Account created! Please sign in with your credentials.');
          }, 1200);
        } else {
          // Store auth data and full name for dashboard greeting
          localStorage.setItem('auth_token', JSON.stringify(data.user));
          localStorage.setItem('prepcore_user', JSON.stringify(data.user));
          if (data.user && data.user.full_name) {
            localStorage.setItem('user_name', data.user.full_name);
          }
          
          window.dispatchEvent(new Event('prepcore-auth'));

          if (onLoginSuccess) onLoginSuccess(data.user);
        }
      } else {
        setErrorMsg(data.message || 'Authentication failed.');
      }
    } catch (err) {
      setErrorMsg('Server connection error. Ensure PHP server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eae8e1] text-[#1c1c1c] font-sans flex flex-col justify-between p-6 md:p-12">
      <header className="flex justify-between items-center border-b border-[#1c1c1c]/10 pb-4 mb-8">
        <div>
          <span className="font-mono text-xs font-bold tracking-widest block uppercase">PREP</span>
          <span className="font-mono text-[10px] tracking-wider text-[#1c1c1c]/60 uppercase">CORE / DAILY PREPARATION</span>
        </div>
        <div className="font-mono text-[11px] tracking-widest text-[#1c1c1c]/70 uppercase">
          PLACEMENT PREPARATION / 2026
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch my-auto max-w-7xl w-full mx-auto">
        <div className="lg:col-span-7 flex flex-col justify-between pr-0 lg:pr-8">
          <div>
            <div className="font-mono text-xs tracking-widest uppercase mb-6 text-[#1c1c1c]/70">
              — WELCOME BACK
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-medium tracking-tight leading-[1.08] mb-6 text-[#1c1c1c]">
              Your prep starts with focus, structure, and momentum.
            </h1>
            <p className="text-base md:text-lg text-[#1c1c1c]/80 leading-relaxed max-w-2xl mb-12">
              PrepCore helps students and early-career engineers turn interview prep into a daily system: solve the right problems, track readiness, compare company paths, and keep feedback visible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-[#1c1c1c]/10 pt-6">
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase mb-2 text-[#1c1c1c]/60">— DAILY LOOP</div>
              <p className="text-xs text-[#1c1c1c]/80 leading-normal">One plan, one focus area, one meaningful session at a time.</p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase mb-2 text-[#1c1c1c]/60">— INTERVIEW SIGNAL</div>
              <p className="text-xs text-[#1c1c1c]/80 leading-normal">Measure readiness with practice, tests, and guided company prep.</p>
            </div>
            <div>
              <div className="font-mono text-[10px] tracking-widest uppercase mb-2 text-[#1c1c1c]/60">— CAREER CLARITY</div>
              <p className="text-xs text-[#1c1c1c]/80 leading-normal">Move from vague effort to a real shortlist and next action.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#1c1c1c] text-[#eae8e1] p-8 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-6 font-mono text-xs tracking-widest uppercase mb-8">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`transition-opacity ${mode === 'signin' ? 'text-[#eae8e1] font-bold border-b border-[#eae8e1] pb-1' : 'text-[#eae8e1]/40 hover:text-[#eae8e1]'}`}
              >
                — SIGN IN
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`transition-opacity ${mode === 'signup' ? 'text-[#eae8e1] font-bold border-b border-[#eae8e1] pb-1' : 'text-[#eae8e1]/40 hover:text-[#eae8e1]'}`}
              >
                — SIGN UP
              </button>
            </div>

            <h2 className="text-3xl md:text-4xl font-serif font-normal tracking-tight mb-8 text-[#eae8e1]">
              {mode === 'signin' ? 'Continue to PrepCore' : 'Create your account'}
            </h2>

            {errorMsg && (
              <p className="font-mono text-xs text-red-400 mb-6">{errorMsg}</p>
            )}

            {successMsg && (
              <p className="font-mono text-xs text-emerald-400 mb-6">{successMsg}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-[#eae8e1]/60 mb-2">
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Purushottam Jadhav"
                    className="w-full bg-transparent border-b border-[#eae8e1]/20 py-2 text-sm text-[#eae8e1] placeholder-[#eae8e1]/30 focus:outline-none focus:border-[#eae8e1] transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[#eae8e1]/60 mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-b border-[#eae8e1]/20 py-2 text-sm text-[#eae8e1] placeholder-[#eae8e1]/30 focus:outline-none focus:border-[#eae8e1] transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-[#eae8e1]/60 mb-2">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-[#eae8e1]/20 py-2 text-sm text-[#eae8e1] placeholder-[#eae8e1]/30 focus:outline-none focus:border-[#eae8e1] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#eae8e1] text-[#1c1c1c] py-4 text-xs font-mono font-bold tracking-widest uppercase hover:bg-white transition-colors mt-8 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Processing...' : mode === 'signin' ? 'Enter dashboard →' : 'Create account →'}</span>
              </button>
            </form>
          </div>

          <p className="font-mono text-[10px] tracking-wider text-[#eae8e1]/40 mt-12">
            Your name, email, and local progress are saved for your next session.
          </p>
        </div>
      </main>
    </div>
  );
}