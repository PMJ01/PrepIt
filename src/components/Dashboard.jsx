import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";


const PHP_BASE_URL = import.meta.env.VITE_PHP_BASE_URL || "http://localhost:8000";
const JAVA_BASE_URL = import.meta.env.VITE_JAVA_BASE_URL || (window.location.port === "5173" ? "http://localhost:8080" : "");

// Helper function to get greeting based on the current hour
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Helper function to get user name from stored session data
// Helper function to get user name from stored session data
function getUserName() {
  try {
    const saved = localStorage.getItem("auth_token") || localStorage.getItem("prepcore_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check for username (new DB column) or full_name (old DB column)
      if (parsed.username) return parsed.username;
      if (parsed.full_name) return parsed.full_name;
      
      // If the entire PHP response object was saved by accident, check inside parsed.user
      if (parsed.user && parsed.user.username) return parsed.user.username;
      if (parsed.user && parsed.user.full_name) return parsed.user.full_name;
    }
  } catch (e) {
    // fallback
  }
  return localStorage.getItem("user_name") || "Student";
}



const companies = [
  { id: "tcs", name: "TCS NQT", logo: "T", rounds: 4, applicants: "3.2M annual", focus: "Aptitude, coding, communication", overview: "TCS NQT commonly moves from a general ability screen into advanced quantitative reasoning, a coding section, and a final interview. Balance speed with clean fundamentals.", plan: ["Foundation: numerical ability, verbal ability, reasoning, and data interpretation.", "Advanced: tougher reasoning sets under strict time pressure.", "Coding: arrays, strings, sorting, recursion, SQL, and one medium implementation problem.", "Interview: project walkthrough, OOP, operating systems, DBMS, and communication."] },
  { id: "amazon", name: "Amazon", logo: "A", rounds: 5, applicants: "1.6M annual", focus: "DSA, system design, leadership", overview: "Amazon interviews reward structured problem solving and clear trade-offs. Expect coding, design, and behavioral questions mapped to Leadership Principles.", plan: ["Online assessment: debugging, work simulation, and timed DSA.", "Phone screen: one or two coding problems with complexity analysis.", "Loop coding: graphs, trees, dynamic programming, and edge-case reasoning.", "Design: APIs, data stores, queues, scaling, observability, and failure modes.", "Behavioral: ownership, customer focus, disagree and commit, and results."] },
  { id: "microsoft", name: "Microsoft", logo: "M", rounds: 4, applicants: "900K annual", focus: "Problem solving, CS core, collaboration", overview: "Microsoft screens for strong fundamentals and the ability to communicate while solving. Be comfortable with trees, graphs, design basics, and explaining decisions.", plan: ["Online screen: correctness, complexity, and practical debugging.", "Technical one: arrays, strings, linked lists, and binary trees.", "Technical two: graphs, concurrency, APIs, and object-oriented design.", "Final loop: project depth, collaboration stories, and role-specific fundamentals."] },
  { id: "infosys", name: "Infosys", logo: "I", rounds: 4, applicants: "2.1M annual", focus: "Aptitude, pseudocode, coding", overview: "Infosys assessments place a premium on speed, output tracing, and basic programming fluency. A repeatable test routine beats memorizing isolated tricks.", plan: ["Reasoning: logical deductions, data sufficiency, and analytical puzzles.", "Verbal and quantitative: grammar, arithmetic, percentages, and time-work problems.", "Pseudocode: loops, arrays, strings, and debugging output.", "Interview: resume walkthrough, OOP, DBMS, networking, and willingness to learn."] },
  { id: "google", name: "Google", logo: "G", rounds: 5, applicants: "1.0M annual", focus: "Algorithms, design, clarity", overview: "Google-style preparation is about reducing ambiguity. Practise narrating brute force first, proving the improvement, and checking constraints before writing code.", plan: ["Assessment: algorithmic reasoning and implementation under time limits.", "Coding screen: one large problem with follow-up constraints.", "Onsite coding: graphs, dynamic programming, strings, and mathematical modeling.", "Design: distributed systems, interfaces, storage, and reliability.", "Behavioral: teamwork, ambiguity, feedback, and impact."] },
];

const tests = [
  { id: "google-screen", title: "Google phone screen", company: "Google", type: "Coding screen", questions: 3, duration: 45, difficulty: "Medium", description: "Three problems that test decomposition, edge cases, and how you communicate under time." },
  { id: "tcs-foundation", title: "TCS Foundation Sprint", company: "TCS NQT", type: "Aptitude + CS", questions: 10, duration: 25, difficulty: "Foundation", description: "A fast mixed set covering quantitative ability, reasoning, SQL, OOP, and one coding trace." },
  { id: "tcs-coding", title: "TCS Coding Capsule", company: "TCS NQT", type: "Coding", questions: 8, duration: 35, difficulty: "Intermediate", description: "Timed array, string, recursion, and implementation questions with interview-style explanations." },
  { id: "amazon-dsa", title: "Amazon DSA Screen", company: "Amazon", type: "Algorithms", questions: 12, duration: 45, difficulty: "Advanced", description: "A company-style screen focused on trees, graphs, intervals, dynamic programming, and complexity." },
  { id: "microsoft-core", title: "Microsoft Core CS Check", company: "Microsoft", type: "Core CS", questions: 10, duration: 30, difficulty: "Intermediate", description: "Operating systems, DBMS, networking, OOP, and practical debugging scenarios." },
];

const guides = {
  "operating-systems": ["Operating systems", "Build a mental model from processes and threads to scheduling, memory, files, and deadlocks.", [["Processes and threads", "A process owns an address space and operating-system resources. A thread is an execution path inside that process."], ["Scheduling", "Compare turnaround, waiting, response, and throughput. Round robin improves response with a time quantum, while priority scheduling needs an answer for starvation."], ["Memory", "Virtual memory maps process addresses to physical frames through page tables and translation caches. Page faults are expensive because storage is involved."], ["Revision checklist", "Revise process states, context switching, scheduling metrics, page tables, TLBs, faults, protection, and deadlock recovery."]]],
  databases: ["Databases", "Prepare for data modeling, indexing, transactions, recovery, and query planning questions.", [["Relational modeling", "Choose keys that identify facts, separate repeating attributes, and make relationship cardinality explicit."], ["Indexes", "An index is an access path, not a guarantee of speed. Discuss selectivity, ordering, covering columns, and write amplification."], ["Transactions", "Atomicity, consistency, isolation, and durability describe guarantees. Isolation levels trade concurrency against anomalies."], ["Recovery", "A write-ahead log records durable intent before data pages are flushed. Checkpoints shorten recovery."]]],
  "computer-networks": ["Computer networks", "Trace a request from DNS through transport, HTTP, caching, and failure recovery.", [["Naming and routing", "DNS maps names to records through recursive and authoritative servers. Routing forwards packets across networks."], ["Transport", "TCP gives an ordered byte stream with setup, acknowledgements, retransmission, flow control, and congestion control."], ["HTTP", "HTTP methods communicate intent and status codes communicate outcome. Idempotency matters when clients retry."], ["Reliability", "Timeouts, bounded retries, exponential backoff, circuit breakers, and request IDs make failures diagnosable."]]],
  "object-oriented-design": ["Object-oriented design", "Use responsibilities, contracts, composition, and interfaces to explain maintainable software design.", [["Responsibilities", "A class should own a coherent reason to change. Start with behavior and collaborators rather than jumping to inheritance."], ["Composition", "Composition wires objects together without forcing a rigid taxonomy. Prefer delegation when behavior can vary independently."], ["Contracts", "State preconditions, postconditions, invariants, and failure behavior so tests can exercise a visible contract."], ["Patterns", "Factories, adapters, and observers are vocabulary for trade-offs; each adds indirection that should earn its complexity."]]],
  "distributed-systems": ["Distributed systems", "Study consistency, partition tolerance, queues, replication, and operational failure modes.", [["Failure model", "A remote call can be slow, duplicated, reordered, or unavailable. Design with deadlines and idempotency keys."], ["Consistency", "Strong consistency simplifies reads but can increase coordination cost. Eventual consistency improves availability when convergence is acceptable."], ["Queues", "A queue separates producers from consumers and absorbs bursts. Discuss delivery semantics and dead-letter handling."], ["Observability", "Logs explain events, metrics show trends, and traces connect one request across services."]]],
  "low-level-foundations": ["Low-level foundations", "Connect memory, storage, concurrency, and runtime cost to practical engineering decisions.", [["Memory and locality", "Caches exploit spatial and temporal locality. Data layout changes cache misses and allocation pressure."], ["Storage", "Sequential access, random access, buffering, and durability shape storage performance."], ["Concurrency", "Immutability reduces coordination, message passing moves ownership, and locks require a defined order."], ["Cost reasoning", "Name the dominant resource: CPU, memory, network, storage, or coordination, then name the measurement that would confirm it."]]],
};

const courses = [
  { slug: "dsa-foundations", title: "DSA foundations", subtitle: "Arrays → trees → graphs", lessons: ["Complexity and invariants", "Arrays and prefix reasoning", "Linked lists and pointer ownership", "Graphs and traversal choices"] },
  { slug: "dynamic-programming", title: "Dynamic programming", subtitle: "State → transition → proof", lessons: ["Recognising overlapping subproblems", "One-dimensional state", "Grid and two-dimensional state", "Knapsack and choice transitions"] },
  { slug: "aptitude-sprint", title: "Aptitude sprint", subtitle: "Quantitative ability → reasoning → data interpretation", lessons: ["Percentages and ratios", "Profit, loss, and averages", "Time, work, and pipes", "Probability and counting"] },
  { slug: "systems-design-primer", title: "Systems design primer", subtitle: "Boundaries → trade-offs → failure", lessons: ["Clarify requirements", "API and data modelling", "Storage and indexing", "Queues and asynchronous work"] },
  { slug: "interview-communication", title: "Interview communication", subtitle: "Make technical reasoning visible", lessons: ["Frame the problem", "Explain the baseline", "Narrate the invariant", "Handle edge cases"] },
];

const starterCode = {
  javascript: "function solve(values, target) {\n  // write the invariant first\n  return [];\n}\n\nconsole.log(solve([2, 7, 11, 15], 9));",
  java: "public class Main {\n  static int[] solve(int[] values, int target) {\n    // write the invariant first\n    return new int[] {};\n  }\n\n  public static void main(String[] args) {\n    System.out.println(\"Ready for the invariant\");\n  }\n}",
};

// function getProgress() {
//   try {
//     return JSON.parse(localStorage.getItem("prepcore_progress") || "{\"solved\":47,\"minutes\":382,\"streak\":6,\"readiness\":68,\"completed\":[]}");
//   } catch {
//     return { solved: 47, minutes: 382, streak: 6, readiness: 68, completed: [] };
//   }
// }

// function saveProgress(next) {
//   localStorage.setItem("prepcore_progress", JSON.stringify(next));
//   window.dispatchEvent(new Event("prepcore-progress"));
// }
// Helper to get a unique storage key for each user
function getUserKey() {
  try {
    const saved = localStorage.getItem("prepcore_user") || localStorage.getItem("auth_token");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.email) return `prepcore_progress_${parsed.email}`;
      if (parsed.id) return `prepcore_progress_${parsed.id}`;
    }
  } catch (e) {
    // fallback
  }
  return "prepcore_progress_default";
}

// Get user progress (defaults to 0 for new users)
function getProgress() {
  try {
    const key = getUserKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // fallback
  }
  return { solved: 0, minutes: 0, streak: 0, readiness: 0, completed: [] };
}

// Save progress to the current user's profile
function saveProgress(next) {
  try {
    const key = getUserKey();
    localStorage.setItem(key, JSON.stringify(next));
  } catch (e) {
    // fallback
  }
  window.dispatchEvent(new Event("prepcore-progress"));
}

function Logo() {
  return <Link to="/dashboard" className="brand-mark">PREP<span>CORE / DAILY PREPARATION</span></Link>;
}

const navGroups = [
  ["Command center", [["/dashboard", "Dashboard", "⌂"], ["/practice", "Practice bank", "⌁"]]],
  ["Preparation", [["/company", "Company plans", "◇"], ["/tests", "Mock tests", "◷"], ["/core-cs", "Core CS", "▣"], ["/courses", "Courses", "▤"]]],
  ["Career kit", [["/resume", "Resume match", "□"], ["/contact", "Contact", "↗"]]],
];
function Shell({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const userName = getUserName();
  const initials = userName.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
    document.title = `${pathname.split("/")[1] || "Dashboard"} / PrepCore`;
  }, [theme, pathname]);

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("prepcore_user");
    localStorage.removeItem("user_name");
    window.dispatchEvent(new Event("prepcore-auth"));
    navigate("/login");
  };

  return (
    <div className="shell noise">
      <aside className="sidebar">
        <Logo />
        {navGroups.map(([label, items]) => (
          <div key={label}>
            <div className="nav-label">{label}</div>
            <nav>
              {items.map(([href, title, icon]) => (
                <Link 
                  key={href} 
                  to={href} 
                  className={`nav-link ${pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)) ? "active" : ""}`}
                >
                  <span className="nav-icon">{icon}</span>
                  {title}
                </Link>
              ))}
              {label === "Career kit" && (
                <button 
                  onClick={logout} 
                  className="nav-link" 
                  style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}
                >
                  <span className="nav-icon">←</span>
                  Log out
                </button>
              )}
            </nav>
          </div>
        ))}
        <div className="sidebar-foot">A workspace for the serious part of getting ready.<br /><br /><span className="mono">v2.0 / focused mode</span></div>
      </aside>
      <main className="main">
        <header className="topbar">
          <span className="topbar-kicker">Placement preparation / 2026</span>
          <div className="topbar-right">
            <span>{todayFormatted}</span>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <span className="avatar" title={userName}>{initials || "ST"}</span>
            <button className="logout-button" onClick={logout}>Exit</button>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
function LoadingBlock() {
  return <div className="panel panel-pad"><div className="skeleton" style={{ width: "38%", height: 16 }} /><div className="skeleton" style={{ width: "62%", height: 38, marginTop: 16 }} /><div className="skeleton" style={{ width: "86%", height: 10, marginTop: 12 }} /></div>;
}

function DashboardHome() {
  const [progress, setProgress] = useState(getProgress);
  const userName = getUserName();
  const greeting = getGreeting();
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => { 
    const update = () => setProgress(getProgress()); 
    window.addEventListener("prepcore-progress", update); 
    return () => window.removeEventListener("prepcore-progress", update); 
  }, []);

  const heat = [["Arrays", 86], ["Trees", 71], ["DP", 54], ["Graphs", 44], ["Core CS", 77], ["Aptitude", 63]];
  
  return (
    <Page>
      <div className="eyebrow">{currentDay.toUpperCase()} / COMMAND CENTER</div>
      <h1 className="headline">{greeting}, {userName}.</h1>
      <p className="lede">Your next useful hour is already mapped.</p>
      
      <div className="metric-grid">
        {[[`${progress?.readiness || 0}%`, "Readiness"], [`${progress?.solved || 0}`, "Problems solved"], [`${progress?.streak || 0}`, "Day streak"], [`${progress?.minutes || 0}m`, "Study time"]].map(([value, label]) => (
          <div className="metric" key={label}>
            <span className="metric-value">{value}</span>
            <span className="metric-name">{label}</span>
          </div>
        ))}
      </div>

      <div className="split-wide dashboard-split">
        <section>
          <div className="section-line">
            <div>
              <div className="eyebrow">Priority queue</div>
              <div className="section-title">Your next actions</div>
            </div>
            <span className="mono small">03 ITEMS</span>
          </div>
          <div className="panel rule-list">
            <Link className="action-row" to="/practice/word-break">
              <div>
                <div className="mono tiny">CONTINUE / 31 MIN</div>
                <strong>Finish dynamic programming foundations</strong>
                <div className="muted">Word break · medium · 46.8% acceptance</div>
              </div>
              <span>›</span>
            </Link>
            <Link className="action-row" to="/tests/google-screen">
              <div>
                <div className="mono tiny">ASSESS / 45 MIN</div>
                <strong>Run a phone screen simulation</strong>
                <div className="muted">Google-style coding screen · 3 questions</div>
              </div>
              <span>›</span>
            </Link>
            <Link className="action-row" to="/company/google">
              <div>
                <div className="mono tiny">PREP / 20 MIN</div>
                <strong>Read the Google loop plan</strong>
                <div className="muted">Algorithms · systems thinking · 5 rounds</div>
              </div>
              <span>›</span>
            </Link>
          </div>
        </section>

        <aside>
          <div className="section-line">
            <div>
              <div className="eyebrow">Signal map</div>
              <div className="section-title">Topic readiness</div>
            </div>
          </div>
          <div className="panel panel-pad">
            <div className="heatmap">
              {Array.from({ length: 35 }, (_, index) => { 
                const score = heat[index % heat.length][1]; 
                return <div className="heat-cell" data-level={score > 75 ? 4 : score > 55 ? 3 : score > 35 ? 2 : 1} key={index} title={`${heat[index % heat.length][0]}: ${score}%`} />; 
              })}
            </div>
            <div className="rule-list topic-list">
              {heat.slice(0, 4).map(([topic, score]) => (
                <div key={topic}>
                  <span>{topic}</span>
                  <span className="mono">{score}%</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function Page({ children }) {
  return <div className="content page-enter">{children}</div>;
}

function Practice() {
  const [practiceData, setPracticeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All topics");
  const [difficulty, setDifficulty] = useState("All levels");
  const [page, setPage] = useState(1);
  const itemsPerPage = 24;

  const categories = ["All topics", "DSA", "General Aptitude", "Core CS"];

  // Fetch data from phpMyAdmin via PHP endpoint
  const fetchQuestions = () => {
    setLoading(true);
    fetch(`${PHP_BASE_URL}/get_practice_questions.php`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          setPracticeData(result.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load questions from database:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const questions = useMemo(() => {
    return practiceData.filter((item) => {
      const text = `${item.title} ${item.category} ${(item.tags || []).join(" ")} ${item.prompt}`.toLowerCase();
      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesCategory = category === "All topics" || item.category === category;
      const matchesDifficulty = difficulty === "All levels" || item.difficulty === difficulty;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [practiceData, search, category, difficulty]);

  useEffect(() => {
    setPage(1);
  }, [search, category, difficulty]);

  const paginatedQuestions = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return questions.slice(start, start + itemsPerPage);
  }, [questions, page]);

  const totalPages = Math.ceil(questions.length / itemsPerPage);

  const dsaCount = useMemo(() => practiceData.filter((q) => q.category === "DSA").length, [practiceData]);
  const aptCount = useMemo(() => practiceData.filter((q) => q.category === "General Aptitude").length, [practiceData]);

  if (loading) {
    return (
      <Page>
        <div className="eyebrow">PRACTICE BANK / MYSQL CONNECTED</div>
        <h1 className="headline">Loading practice bank...</h1>
        <p className="lede">Fetching questions directly from phpMyAdmin database.</p>
      </Page>
    );
  }

  return (
    <Page>
      <div className="eyebrow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>
          PRACTICE BANK / {questions.length} QUESTIONS VISIBLE ({dsaCount} DSA · {aptCount} APTITUDE)
        </span>
        <button className="btn btn-quiet" onClick={fetchQuestions} style={{ padding: "4px 12px", fontSize: "12px" }}>
          ↻ Refresh from MySQL
        </button>
      </div>

      <h1 className="headline">
        Make the hard thing
        <br />
        specific.
      </h1>
      <p className="lede">
        Questions dynamically queried from phpMyAdmin. Filter by DSA or General Aptitude with live database updates.
      </p>

      {/* Toolbar */}
      <div className="toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
        <input
          className="field search-field"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="⌕ Search database records..."
          style={{ flex: "1 1 300px" }}
        />
        <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
        <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          {["All levels", "Easy", "Medium", "Hard"].map((lvl) => (
            <option key={lvl}>{lvl}</option>
          ))}
        </select>
      </div>

      {paginatedQuestions.length ? (
        <>
          <div className="card-grid">
            {paginatedQuestions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "32px" }}>
              <button
                className="btn btn-quiet"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <span className="mono tiny">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-quiet"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty">
          <strong>No matching database records found.</strong>
          <p className="muted">Try another filter or clear search.</p>
          <button
            className="btn btn-quiet"
            onClick={() => {
              setSearch("");
              setCategory("All topics");
              setDifficulty("All levels");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </Page>
  );
}

function QuestionCard({ question, index }) {
  return <Link to={`/practice/${question.id}`} className={`question-card page-enter delay-${Math.min(index + 1, 4)}`}><div className="card-top"><span className={`tag ${question.difficulty === "Hard" ? "tag-fill" : ""}`}>{question.difficulty}</span><span className="mono tiny">{question.category}</span></div><h3>{question.title}</h3><p>{question.prompt}</p><div className="card-foot"><span>{question.acceptance}% accepted</span><span>{question.time} →</span></div></Link>;
}

function CodeLab({ question, onClose }) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(starterCode.javascript);
  const [output, setOutput] = useState("READY / waiting for your first run");
  const runCode = () => {
    setOutput(`OUTPUT / ${language.toUpperCase()}\n\nPrepitworkschecked the starter locally.\n✓ Input: [2, 7, 11, 15], target 9\n✓ Expected pair: 0, 1\n\nKeep the invariant visible as you finish ${question.title}.`);
  };
  return <div className="code-lab-shell"><div className="code-lab-bar"><div className="eyebrow">Code lab / {question.title}</div><div className="button-row"><select className="select code-language" value={language} onChange={(e) => { setLanguage(e.target.value); setCode(starterCode[e.target.value]); setOutput("READY / starter code loaded"); }}><option value="javascript">JavaScript</option><option value="java">Java</option></select><button className="btn btn-primary" onClick={runCode}>Run code</button><button className="btn btn-quiet" onClick={onClose}>Exit</button></div></div><div className="code-lab-grid"><div className="code-editor-pane"><div className="mono code-editor-meta">EDITOR / {language.toUpperCase()}</div><textarea className="code-editor" value={code} onChange={(e) => setCode(e.target.value)} spellCheck="false" /></div><div className="code-output-pane"><div className="mono code-editor-meta">OUTPUT / LIVE</div><pre>{output}</pre><div className="lab-note"><span className="tag">Hint</span><span>Use the smallest data structure that makes the invariant obvious.</span></div></div></div></div>;
}

function PracticeDetail({ id }) {
  const [question, setQuestion] = useState(null);
  const [labOpen, setLabOpen] = useState(false);
  const [solved, setSolved] = useState(false);
  
  // Calculator & Scratchpad States
  const [showCalc, setShowCalc] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("");
  const [calcResult, setCalcResult] = useState("");

  useEffect(() => {
    fetch(`${PHP_BASE_URL}/get_practice_questions.php`)
      .then((res) => res.json())
      .then((result) => {
        if (result.status === "success" && Array.isArray(result.data)) {
          const found = result.data.find((item) => item.id === id) || result.data[0];
          setQuestion(found);
          setSolved(getProgress().completed.includes(found?.id));
        }
      })
      .catch((err) => console.error("Error fetching detail:", err));
  }, [id]);

  const handleCalcInput = (btn) => {
    if (btn === "C") {
      setCalcDisplay("");
      setCalcResult("");
    } else if (btn === "=") {
      try {
        // Safe evaluation for simple calculations
        const evalResult = Function(`'use strict'; return (${calcDisplay})`)();
        setCalcResult(String(evalResult));
      } catch (e) {
        setCalcResult("Error");
      }
    } else {
      setCalcDisplay((prev) => prev + btn);
    }
  };

  const markSolved = () => {
    if (!question) return;
    const progress = getProgress();
    if (!progress.completed.includes(question.id)) {
      saveProgress({
        ...progress,
        solved: progress.solved + 1,
        readiness: Math.min(100, progress.readiness + 2),
        completed: [...progress.completed, question.id],
      });
    }
    setSolved(true);
  };

  if (!question) {
    return (
      <Page>
        <div className="eyebrow">PRACTICE DETAIL</div>
        <h1 className="headline">Loading question...</h1>
      </Page>
    );
  }

  const isAptitude = question.category === "General Aptitude";

  if (labOpen && !isAptitude) {
    return (
      <Page>
        <button className="eyebrow lab-back" onClick={() => setLabOpen(false)}>
          ← {question.title}
        </button>
        <CodeLab question={question} onClose={() => setLabOpen(false)} />
      </Page>
    );
  }

  return (
    <Page>
      <Link to="/practice" className="eyebrow">
        ← Practice bank
      </Link>
      <div className="split-wide detail-split">
        <section>
          <div className="button-row">
            <span className="tag tag-fill">{question.difficulty}</span>
            <span className="tag">{question.category}</span>
          </div>
          <h1 className="headline">{question.title}</h1>
          <p className="lede">{question.prompt}</p>

          {isAptitude ? (
            <div className="panel panel-pad" style={{ marginTop: "24px", marginBottom: "24px", background: "var(--bg-secondary)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="eyebrow">General Aptitude Notes & Tools</div>
                <button 
                  className="btn btn-quiet" 
                  onClick={() => setShowCalc(!showCalc)}
                  style={{ padding: "4px 10px", fontSize: "12px" }}
                >
                  {showCalc ? "Hide Calculator ✖" : "🧮 Optional Calculator"}
                </button>
              </div>

              {/* Step-by-Step Solving Approach from MySQL */}
              <div style={{ padding: "16px", background: "var(--bg-primary)", borderRadius: "6px", margin: "16px 0", borderLeft: "3px solid var(--accent-color)" }}>
                <strong style={{ display: "block", marginBottom: "8px" }}>Step-by-Step Approach & Notes:</strong>
                <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", color: "var(--text-muted)", margin: 0 }}>
                  {question.solving_notes || question.explanation}
                </pre>
              </div>

              {/* Optional Calculator */}
              {showCalc && (
                <div style={{ padding: "16px", background: "var(--bg-primary)", borderRadius: "6px", maxWidth: "280px" }}>
                  <div className="mono tiny" style={{ marginBottom: "6px" }}>SCRATCHPAD CALCULATOR</div>
                  <input className="field" value={calcDisplay} readOnly placeholder="0" style={{ textAlign: "right", marginBottom: "8px" }} />
                  {calcResult && <div style={{ textAlign: "right", fontWeight: "bold", marginBottom: "8px" }}>= {calcResult}</div>}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+","C"].map((btn) => (
                      <button 
                        key={btn} 
                        className="btn btn-quiet" 
                        onClick={() => handleCalcInput(btn)}
                        style={{ padding: "8px", gridColumn: btn === "C" ? "span 4" : "span 1" }}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="lab">
              <div className="lab-copy">
                <div className="eyebrow">Code lab / ready</div>
                <h2>Start from the constraint.</h2>
                <p>Switch languages, edit the starter, run a local feedback pass, and keep the explanation close to the invariant.</p>
                <button className="btn btn-primary" onClick={() => setLabOpen(true)}>
                  Enter code lab →
                </button>
              </div>
              <div className="code-box">
                01 function solve(input) {"{"}
                <br />
                02 // name the invariant
                <br />
                03 const answer = null;
                <br />
                04 return answer;
                <br />
                05 {"}"}
              </div>
            </div>
          )}

          <button className="btn btn-primary" onClick={markSolved} disabled={solved}>
            {solved ? "Problem solved ✓" : "Mark problem solved ✓"}
          </button>
        </section>

        <aside>
          <div className="panel panel-pad">
            <div className="eyebrow">Field notes</div>
            <Info label="Target time" value={question.time} />
            <Info label="Acceptance" value={`${question.acceptance}%`} />
            <div className="info-block">
              <div className="mono tiny">TOPICS & TAGS</div>
              <div className="tag-row">
                {(question.tags || []).map((tag) => (
                  <span className="tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="panel panel-pad side-gap">
            <div className="eyebrow">Shortcut Rule</div>
            <p>{question.explanation}</p>
          </div>
        </aside>
      </div>
    </Page>
  );
}

function Info({ label, value }) {
  return <div className="info-block"><div className="mono tiny">{label}</div><strong className="info-value">{value}</strong></div>;
}

function Company({ id }) {
  if (id) {
    const company = companies.find((item) => item.id === id) || companies[0];
    return <Page><Link to="/company" className="eyebrow">← Company plans</Link><div className="split-wide detail-split"><section><div className="company-heading"><div className="logo-box">{company.logo}</div><div><div className="mono tiny">{company.rounds} ROUNDS / {company.applicants}</div><h1 className="headline">{company.name}</h1></div></div><p className="lede">{company.overview}</p><div className="section-line"><div><div className="eyebrow">The route</div><div className="section-title">Focused sessions</div></div></div><div className="panel rule-list">{company.plan.map((item, index) => <div className="action-row" key={item}><div><span className="mono tiny">0{index + 1}</span> <span>{item}</span></div><span>✓</span></div>)}</div></section><aside><div className="panel panel-pad"><div className="eyebrow">Loop profile</div><Info label="Primary focus" value={company.focus} /><div className="info-block"><div className="mono tiny">WHAT TO PRACTICE</div><div className="tag-row"><span className="tag">Problem framing</span><span className="tag">Tradeoffs</span><span className="tag">Clarity</span></div></div><Link to="/tests/google-screen" className="btn btn-primary full-button">Take a matching mock →</Link></div></aside></div></Page>;
  }
  return <Page><div className="eyebrow">Company preparation / choose a lane</div><h1 className="headline">Prepare for the<br />conversation behind the code.</h1><p className="lede">Each company plan is a short, opinionated route through its loop. No sprawling syllabus.</p><div className="company-grid">{companies.map((company) => <Link to={`/company/${company.id}`} className="company-card" key={company.id}><div className="card-top"><div className="logo-box">{company.logo}</div><span className="mono tiny">{company.rounds} ROUNDS</span></div><h2>{company.name}</h2><p>{company.focus}</p><div className="card-foot"><span>{company.applicants}</span><span>→</span></div></Link>)}</div></Page>;
}

function Tests({ id }) {
  if (id) return <TestDetail id={id} />;
  return <Page><div className="eyebrow">Mock assessments / pressure, measured</div><h1 className="headline">A test is useful<br />when it tells you what next.</h1><p className="lede">Timed, short, and followed by a recommendation you can act on immediately.</p><div className="test-grid">{tests.map((test) => <Link to={`/tests/${test.id}`} className="test-card" key={test.id}><div className="card-top"><span className="tag">{test.type}</span><span className="mono tiny">{test.difficulty}</span></div><h3>{test.title}</h3><p>{test.description}</p><div className="test-meta"><span>◷ {test.duration} min</span><span>{test.questions} questions</span></div></Link>)}</div></Page>;
}

function TestDetail({ id }) {
  const test = tests.find((item) => item.id === id) || tests[0];
  const prompts = ["Explain the time and space complexity of your preferred approach.", "What changes if the input is too large to fit in memory?", "Walk through the edge cases before writing final code.", "Which trade-off would you revisit in production?", "Describe how you would test beyond the happy path."];
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const submit = () => {
    const answered = Object.keys(answers).length;
    const score = Math.min(test.questions, answered);
    localStorage.setItem("prepcore_result", JSON.stringify({ score, total: test.questions, percentage: Math.round((score / test.questions) * 100), recommendation: score / test.questions >= 0.6 ? "Good base. Revisit missed concepts, then repeat this test without looking at notes." : "Rebuild the fundamentals first. Close one topic gap in the practice bank before retaking." }));
    setSubmitted(true);
  };
  if (submitted) return <Page><div className="eyebrow">Assessment complete</div><h1 className="headline">The clock stopped.<br />Now use the signal.</h1><p className="lede">Your result is ready with a clear recommendation for the next study block.</p><Link to="/results" className="btn btn-primary">View result →</Link></Page>;
  return <Page><div className="eyebrow">◷ {test.company} / {test.type}</div><h1 className="headline">{test.title}</h1><div className="steps">{Array.from({ length: test.questions }, (_, item) => <div className={`step ${item === index ? "active" : ""} ${item < index ? "done" : ""}`} key={item}>0{item + 1} / {test.questions}</div>)}</div><div className="split-wide"><section className="panel panel-pad"><div className="mono tiny">QUESTION {index + 1} OF {test.questions}</div><h2 className="question-prompt">{prompts[index % prompts.length]}</h2><p className="muted">Use the response area to capture the approach you would say out loud. Mark confidence from 1–5.</p><textarea className="field textarea" value={answers[index] || ""} onChange={(e) => setAnswers({ ...answers, [index]: e.target.value })} placeholder="Enter a confidence score or short note…" /><div className="action-between"><button className="btn btn-quiet" disabled={index === 0} onClick={() => setIndex(index - 1)}>← Previous</button>{index < test.questions - 1 ? <button className="btn btn-primary" onClick={() => setIndex(index + 1)}>Next question →</button> : <button className="btn btn-primary" onClick={submit}>Submit assessment ✓</button>}</div></section><aside><div className="panel panel-pad"><div className="eyebrow">Session timer</div><div className="timer">{String(test.duration).padStart(2, "0")}:00</div><p className="muted">A complete attempt is more useful than a perfect first answer.</p></div><div className="panel panel-pad side-gap"><div className="eyebrow">Progress</div><div className="progress-track"><div className="progress-fill" style={{ width: `${((index + 1) / test.questions) * 100}%` }} /></div><div className="mono tiny">{index + 1} / {test.questions} viewed</div></div></aside></div></Page>;
}

function Results() {
  let result = { score: 3, total: 5, percentage: 60, recommendation: "Spend your next block on complexity analysis and timed medium problems." };
  try { result = { ...result, ...JSON.parse(localStorage.getItem("prepcore_result") || "{}") }; } catch { /* use fallback */ }
  return <Page><div className="eyebrow">Result / latest mock assessment</div><h1 className="headline">A useful read<br />on your readiness.</h1><p className="lede">The number matters less than what it tells you to do next.</p><div className="metric-grid results-grid">{[[`${result.percentage}%`, "Score"], [`${result.score}/${result.total}`, "Signal points"], ["◉", "Diagnostic"], ["↗", "Keep going"]].map(([value, label]) => <div className="metric" key={label}><span className="metric-value">{value}</span><span className="metric-name">{label}</span></div>)}</div><div className="split result-split"><div className="panel panel-pad"><div className="eyebrow">Recommendation</div><h2>{result.recommendation}</h2><Link to="/dashboard" className="btn btn-primary">Back to dashboard →</Link></div><div className="panel panel-pad"><div className="eyebrow">Next best move</div><strong className="next-move">Solve one medium graph problem</strong><div className="progress-track"><div className="progress-fill" style={{ width: "44%" }} /></div><Link to="/practice/course-schedule" className="btn btn-quiet">Open problem →</Link></div></div></Page>;
}

function CoreCS({ id }) {
  if (id) {
    const guide = guides[id] || guides["operating-systems"];
    return <Page><Link to="/core-cs" className="eyebrow">← Core CS</Link><h1 className="headline">{guide[0]}</h1><p className="lede">{guide[1]}</p><div className="panel rule-list guide-list">{guide[2].map(([title, copy], index) => <article className="panel-pad" key={title}><div className="eyebrow">0{index + 1} / {title}</div><p>{copy}</p></article>)}</div></Page>;
  }
  const subjects = [["operating-systems", "Operating systems", "Processes, threads, scheduling, and the memory model.", "06 guides"], ["databases", "Databases", "Indexes, transactions, normalization, and query planning.", "08 guides"], ["computer-networks", "Computer networks", "HTTP, TCP, DNS, and the path a request takes.", "05 guides"], ["object-oriented-design", "Object-oriented design", "Modeling behavior, boundaries, and change.", "07 guides"], ["distributed-systems", "Distributed systems", "Consistency, queues, failure, and graceful scale.", "04 guides"], ["low-level-foundations", "Low-level foundations", "Concurrency, storage, and the cost of abstraction.", "03 guides"]];
  return <Page><div className="eyebrow">Core CS / Interview guides</div><h1 className="headline">The concepts<br />under the answers.</h1><p className="lede">Original, structured study notes for GATE CSE fundamentals and placement interviews.</p><div className="card-grid">{subjects.map(([slug, title, copy, count]) => <Link to={`/core-cs/${slug}`} className="question-card" key={slug}><span className="mono tiny">{count}</span><h3>{title}</h3><p>{copy}</p><div className="card-foot"><span>Read guide</span><span>→</span></div></Link>)}</div><DatabaseNotes /></Page>;
}

function DatabaseNotes() {
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    fetch(`${PHP_BASE_URL}/get_notes.php`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("PHP service unavailable")))
      .then((result) => setNotes(Array.isArray(result.data) ? result.data : []))
      .catch(() => setNotes([]));
  }, []);
  if (!notes.length) return null;
  return <div className="database-notes"><div className="eyebrow">PHP / MySQL knowledge base</div><p className="muted">These notes are loaded from <span className="mono">study_notes</span>, not the frontend fallback.</p><div className="note-row">{notes.map((note) => <article key={note.id}><span className="tag">{note.category}</span><h3>{note.title}</h3><p>{note.content}</p></article>)}</div></div>;
}

function Courses({ slug, lessonNumber }) {
  if (slug) {
    const course = courses.find((item) => item.slug === slug) || courses[0];
    const lessonIndex = Math.max(0, Number(lessonNumber || 1) - 1);
    const title = course.lessons[lessonIndex] || course.lessons[0];
    return <Page><Link to="/courses" className="eyebrow">← Courses</Link><h1 className="headline">{title}</h1><p className="lede">Work from the constraint, name the invariant, and close the lesson with a timed checkpoint.</p><div className="split-wide detail-split"><section><div className="panel panel-pad"><div className="eyebrow">Mental model / diagram</div><pre className="diagram">{title.toLowerCase()} → constraint → state → transition → proof</pre></div><div className="panel panel-pad side-gap"><div className="eyebrow">Worked reasoning</div><p>Start with a small example and state what each variable means. Identify the repeated operation, choose the data structure that makes it predictable, and report the time and space cost before optimising.</p></div></section><aside><div className="panel panel-pad"><div className="eyebrow">Common mistakes</div><p>Do not optimise before establishing a correct baseline. Check empty input, one item, duplicates, boundaries, and whether the constraint changes the choice of algorithm.</p><Link to="/practice" className="btn btn-primary full-button">Open practice →</Link></div></aside></div></Page>;
  }
  return <Page><div className="eyebrow">Courses / lesson tracks</div><h1 className="headline">Study by module<br />until it holds.</h1><p className="lede">Concepts first, worked reasoning next, then targeted questions and revision.</p><div className="course-list">{courses.map((course, index) => <details className="panel" key={course.slug} open={index === 0}><summary className="action-row"><div><div className="mono tiny">TRACK 0{index + 1} / {course.lessons.length} LESSONS</div><strong>{course.title}</strong><div className="muted">{course.subtitle}</div></div><span>⌄</span></summary><div className="rule-list">{course.lessons.map((lesson, lessonIndex) => <div className="action-row lesson-row" key={lesson}><div><span className="mono tiny">0{lessonIndex + 1}</span> <span>{lesson}</span><p className="muted">Concepts, diagrams, worked reasoning, and a practice checkpoint.</p></div><Link className="btn btn-quiet" to={`/courses/${course.slug}/${lessonIndex + 1}`}>Open lesson →</Link></div>)}</div></details>)}</div><div className="panel panel-pad continue-card"><div className="eyebrow">Continue / dynamic programming</div><h2>State, transition, proof.</h2><Link to="/courses/dynamic-programming/02" className="btn btn-primary">Continue →</Link></div></Page>;
}

function Resume() {
  const [submitted, setSubmitted] = useState(false);
  if (submitted) return <Page><div className="panel panel-pad success-panel"><div className="eyebrow">Evaluation ready</div><h2>Your match brief is ready to review.</h2><p className="muted">Start with the missing keywords, then rewrite one project bullet around an outcome.</p><button className="btn btn-primary" onClick={() => setSubmitted(false)}>Evaluate another →</button></div></Page>;
  return <Page><div className="eyebrow">Resume / ATS match evaluator</div><h1 className="headline">Make the first<br />screen count.</h1><p className="lede">Paste the role and your resume. Turn the gap into a checklist you can actually close.</p><div className="split form-layout"><form className="form-stack" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}><div><label className="label">Target role</label><input className="field" placeholder="Software engineer, frontend…" required /></div><div><label className="label">Job description</label><textarea className="field textarea" placeholder="Paste the role description…" required /></div><div><label className="label">Resume text</label><textarea className="field textarea tall" placeholder="Paste your resume…" required /></div><button className="btn btn-primary" type="submit">Evaluate match →</button></form><div className="panel panel-pad"><div className="eyebrow">What you get</div><div className="rule-list checklist">{["Keyword coverage", "Impact gaps", "Project evidence", "A focused rewrite queue"].map((item, index) => <div key={item}><span>{item}</span><span className="mono tiny">0{index + 1}</span></div>)}</div></div></div></Page>;
}

function Contact() {
  const [sent, setSent] = useState(false);
  if (sent) return <Page><div className="panel panel-pad success-panel"><div className="eyebrow">✓ Message received</div><h2>Thanks for the signal.</h2><p className="muted">Your note is ready for the <Prepitworks></Prepitworks> team.</p><button className="btn btn-quiet" onClick={() => setSent(false)}>Send another note</button></div></Page>;
  return <Page><div className="eyebrow">Contact / keep the loop open</div><h1 className="headline">A real question<br />deserves a real reply.</h1><p className="lede">Tell us where preparation is getting stuck.</p><form className="form-stack contact-form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}><div><label className="label">Name</label><input className="field" placeholder="Your name" required /></div><div><label className="label">Email</label><input className="field" type="email" placeholder="you@example.com" required /></div><div><label className="label">Message</label><textarea className="field textarea tall" placeholder="A bug, a request, a stuck concept…" required /></div><button className="btn btn-primary" type="submit">Send note →</button></form></Page>;
}

export default function Dashboard() {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const section = parts[0] || "dashboard";
  let content = <DashboardHome />;
  if (section === "practice") content = parts[1] ? <PracticeDetail id={parts[1]} /> : <Practice />;
  if (section === "company") content = <Company id={parts[1]} />;
  if (section === "tests") content = <Tests id={parts[1]} />;
  if (section === "results") content = <Results />;
  if (section === "core-cs") content = <CoreCS id={parts[1]} />;
  if (section === "courses") content = <Courses slug={parts[1]} lessonNumber={parts[2]} />;
  if (section === "resume") content = <Resume />;
  if (section === "contact") content = <Contact />;
  return <Shell>{content}</Shell>;
}