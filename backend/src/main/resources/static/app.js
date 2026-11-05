/**
 * CareerPilot AI — Quiet Luxury & Editorial Minimalist Frontend
 * Color Palette: Warm Ivory (#F8F6F1), Cream (#F2EEE6), White (#FFFFFF), Champagne (#E8DDCB),
 *                Sand (#D8C8B2), Warm Bronze (#9B7955), Espresso (#302B27), Charcoal (#45413D), Sage (#8FA382)
 */

const API = '/api';

const state = {
  token: localStorage.getItem('cp_token') || '',
  user: null,
  page: localStorage.getItem('cp_token') ? 'overview' : 'landing',
  dashboard: null,
  profile: null,
  jobs: [],
  applications: [],
  analysis: null,
  question: null,
  interviewResult: null,
  authMode: 'login',
  filter: '',
  locationFilter: '',
  resumeUpload: {
    file: null,
    fileName: '',
    fileSize: 0,
    text: '',
    isUploading: false,
    progress: 0
  }
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (v = '') => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = (name = 'User') => name.split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const roleName = role => ({ STUDENT: 'Student', RECRUITER: 'Recruiter', ADMIN: 'Administrator' }[role] || role);
const dateLabel = value => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

// API Client
async function api(path, options = {}) {
  const isMultipart = options.body instanceof FormData;
  const headers = { ...(options.headers || {}) };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(API + path, { ...options, headers });
  const raw = await response.text();
  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { error: raw || 'Unexpected response from server.' };
  }

  if (!response.ok) {
    if (response.status === 401 && state.token && !path.startsWith('/auth/')) {
      state.token = '';
      state.user = null;
      localStorage.removeItem('cp_token');
      renderLanding();
    }
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }
  return data;
}

function toast(message, isError = false) {
  const root = $('#toast-root');
  if (!root) return;
  root.innerHTML = `
    <div class="luxury-toast ${isError ? '!bg-[#7A3E3E] !border-red-300/30' : ''}">
      <span>${isError ? '⚠️' : '✦'}</span>
      <span>${esc(message)}</span>
    </div>`;
  setTimeout(() => {
    if (root.innerHTML.includes(esc(message))) root.innerHTML = '';
  }, 3500);
}

function badge(text, kind = 'champagne') {
  const styles = {
    champagne: 'bg-[#F2EEE6] text-[#7D5E3E] border border-[#E8DDCB]',
    bronze: 'bg-[#F4EFEA] text-[#9B7955] border border-[#D8C8B2]',
    sage: 'bg-[#EBF0E8] text-[#586E4B] border border-[#D1DDCB]',
    terracotta: 'bg-[#F8EFEA] text-[#9E6751] border border-[#EBD4CC]',
    dark: 'bg-[#302B27] text-[#F8F6F1] border border-[#302B27]',
    sand: 'bg-[#F8F6F1] text-[#45413D] border border-[#E8DDCB]'
  };
  return `<span class="luxury-pill ${styles[kind] || styles.champagne}">${esc(text)}</span>`;
}

function emptyState(icon, title, detail, action = '') {
  return `
    <div class="text-center py-16 px-4">
      <div class="w-14 h-14 mx-auto rounded-full bg-cream border border-champagne flex items-center justify-center text-2xl text-taupe mb-4">${icon}</div>
      <h3 class="font-serif text-lg text-espresso font-medium">${esc(title)}</h3>
      <p class="text-xs text-taupe max-w-sm mx-auto mt-1.5 leading-relaxed">${esc(detail)}</p>
      ${action ? `<div class="mt-5">${action}</div>` : ''}
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PUBLIC LANDING PAGE (Editorial Quiet Luxury)
// ─────────────────────────────────────────────────────────────────────────────
function renderLanding() {
  const root = $('#app');
  root.innerHTML = `
  <div class="fade-enter min-h-screen flex flex-col bg-ivory text-espresso">
    <!-- Editorial Navigation -->
    <header class="sticky top-0 z-50 bg-ivory/90 backdrop-blur-md border-b border-champagne/60">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <a href="#" data-action="go-home" class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-espresso text-ivory flex items-center justify-center text-sm font-serif">✦</div>
          <div>
            <div class="font-serif text-lg font-semibold tracking-tight text-espresso">CareerPilot <span class="text-bronze text-xs font-sans tracking-widest uppercase font-bold">AI</span></div>
            <div class="text-[9px] tracking-[0.2em] text-taupe uppercase -mt-0.5">Career Intelligence</div>
          </div>
        </a>

        <nav class="hidden md:flex items-center gap-8 text-xs font-medium text-charcoal">
          <a href="#features" class="hover:text-bronze transition-colors">Capabilities</a>
          <a href="#how-it-works" class="hover:text-bronze transition-colors">Methodology</a>
          <a href="#opportunities" class="hover:text-bronze transition-colors">Job Board</a>
          <a href="#architecture" class="hover:text-bronze transition-colors">AI Architecture</a>
        </nav>

        <div class="flex items-center gap-3">
          <button data-action="open-auth" data-mode="login" class="text-xs font-semibold px-4 py-2 text-charcoal hover:text-bronze transition-colors">
            Sign In
          </button>
          <button data-action="open-auth" data-mode="register" class="btn-luxury-primary text-xs">
            Get Started <span>→</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-6 lg:px-12 overflow-hidden border-b border-champagne/40">
      <div class="max-w-7xl mx-auto">
        <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <div class="lg:col-span-7 space-y-6">
            <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream border border-champagne text-[11px] font-semibold text-bronze uppercase tracking-widest">
              <span class="w-1.5 h-1.5 rounded-full bg-bronze animate-pulse"></span>
              Editorial Career Architecture · 2026 Edition
            </div>

            <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl text-espresso font-normal tracking-tight leading-[1.12]">
              Build a Career That <br />
              <span class="italic font-normal text-bronze">Moves You Forward.</span>
            </h1>

            <p class="text-base sm:text-lg text-charcoal/80 max-w-xl font-light leading-relaxed">
              Discover opportunities aligned with your genuine skills, understand your potential, and build a tailored career path with transparent, explainable intelligence.
            </p>

            <div class="pt-2 flex flex-wrap items-center gap-4">
              <button data-action="open-auth" data-mode="register" class="btn-luxury-bronze !px-7 !py-3.5 text-sm">
                Explore Your Career <span>→</span>
              </button>
              <a href="#how-it-works" class="btn-luxury-secondary !px-6 !py-3.5 text-sm">
                Discover How It Works
              </a>
            </div>

            <!-- Demo Access Chips -->
            <div class="pt-6 border-t border-champagne/60 flex flex-wrap items-center gap-2.5 text-xs text-taupe">
              <span class="font-semibold text-charcoal">Quick Demo:</span>
              <button data-action="quick-demo" data-role="student" class="px-3 py-1.5 rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-[11px] font-medium">
                Student View
              </button>
              <button data-action="quick-demo" data-role="recruiter" class="px-3 py-1.5 rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-[11px] font-medium">
                Recruiter Console
              </button>
              <button data-action="quick-demo" data-role="admin" class="px-3 py-1.5 rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-[11px] font-medium">
                Admin Panel
              </button>
            </div>
          </div>

          <!-- Hero Visual Preview -->
          <div class="lg:col-span-5 relative">
            <div class="relative bg-surface rounded-2xl border border-champagne p-6 shadow-luxury-lg space-y-5">
              <!-- Header chip -->
              <div class="flex items-center justify-between pb-4 border-b border-champagne/70">
                <div class="flex items-center gap-2.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-sage"></span>
                  <span class="text-xs font-semibold text-espresso">Live Career Telemetry</span>
                </div>
                ${badge('Active Pipeline', 'sage')}
              </div>

              <!-- Top Job Match Card -->
              <div class="p-4 rounded-xl bg-ivory border border-champagne/80">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="text-[10px] uppercase tracking-wider text-taupe font-bold">Top Role Match</div>
                    <div class="font-serif text-base font-semibold text-espresso mt-0.5">Java Backend Intern</div>
                    <div class="text-xs text-taupe mt-0.5">Nexora Labs · Bengaluru / Hybrid</div>
                  </div>
                  <div class="text-right">
                    <span class="text-xl font-serif font-bold text-bronze">82%</span>
                    <div class="text-[10px] text-sage font-semibold">High Fit</div>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1.5 mt-3">
                  <span class="px-2 py-0.5 rounded bg-surface border border-champagne text-[10px] text-charcoal">Java</span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-champagne text-[10px] text-charcoal">Spring Boot</span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-champagne text-[10px] text-charcoal">MySQL</span>
                  <span class="px-2 py-0.5 rounded bg-surface border border-champagne text-[10px] text-charcoal">REST APIs</span>
                </div>
              </div>

              <!-- Metrics Split -->
              <div class="grid grid-cols-2 gap-3.5">
                <div class="p-3.5 rounded-xl bg-ivory border border-champagne/80">
                  <div class="text-[10px] uppercase tracking-wider text-taupe font-bold">Readiness Score</div>
                  <div class="text-2xl font-serif font-bold text-espresso mt-1">78<span class="text-sm font-sans text-taupe font-normal">/100</span></div>
                  <div class="w-full bg-champagne h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div class="bg-bronze h-full rounded-full" style="width: 78%"></div>
                  </div>
                </div>

                <div class="p-3.5 rounded-xl bg-ivory border border-champagne/80">
                  <div class="text-[10px] uppercase tracking-wider text-taupe font-bold">ATS Resume Score</div>
                  <div class="text-2xl font-serif font-bold text-espresso mt-1">71<span class="text-sm font-sans text-taupe font-normal">/100</span></div>
                  <div class="w-full bg-champagne h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div class="bg-sage h-full rounded-full" style="width: 71%"></div>
                  </div>
                </div>
              </div>

              <!-- Roadmap Snippet -->
              <div class="p-3.5 rounded-xl bg-cream/70 border border-champagne/60 text-xs text-charcoal flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="w-6 h-6 rounded-full bg-surface border border-champagne flex items-center justify-center font-serif text-[11px] font-bold text-bronze">1</span>
                  <span>Targeted Skill Focus: <strong>JUnit & Testing</strong></span>
                </div>
                <span class="text-[10px] text-taupe font-semibold">Week 1</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Key Capabilities (Editorial Bento Grid) -->
    <section id="features" class="py-20 lg:py-28 px-6 lg:px-12 bg-cream/40 border-b border-champagne/50">
      <div class="max-w-7xl mx-auto space-y-12">
        <div class="max-w-2xl">
          <div class="text-xs uppercase tracking-widest text-bronze font-bold">Comprehensive Capabilities</div>
          <h2 class="font-serif text-3xl sm:text-4xl text-espresso font-normal mt-2 tracking-tight">
            Quiet Intelligence. Measurable Outcomes.
          </h2>
          <p class="text-sm text-charcoal/80 mt-2 font-light">
            Every feature is engineered to replace guesswork with structured career navigation.
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">✦</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">Semantic Skill Matching</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              TF-IDF cosine similarity analyzes job descriptions and compares required competencies against your profile with zero hallucinated probabilities.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">◎</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">Diagnostic Skill Gap Analysis</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              Clear, honest identification of skills you have versus skills the role specifically requests, prioritizing what to learn next.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">📄</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">ATS Resume Diagnostics</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              Upload your PDF or paste your resume text for structural keyword evaluation, section coverage checks, and quantified outcome prompts.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">🗺</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">Structured Learning Roadmap</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              A week-by-week prioritized action plan tailored to address missing skills and build demonstrable portfolio projects.
            </p>
          </div>

          <!-- Card 5 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">▦</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">Recruiter Pipeline Engine</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              Recruiters post listings, review qualified student profiles, and advance candidates seamlessly through structured stages.
            </p>
          </div>

          <!-- Card 6 -->
          <div class="luxury-card p-7 space-y-3.5">
            <div class="w-10 h-10 rounded-xl bg-ivory border border-champagne flex items-center justify-center font-serif text-base text-bronze">✳</div>
            <h3 class="font-serif text-lg font-semibold text-espresso">Technical Interview Studio</h3>
            <p class="text-xs text-charcoal/80 leading-relaxed font-light">
              Role-focused technical interview prompts with real-time feedback on concept coverage, engineering trade-offs, and communication.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works (Editorial Timeline) -->
    <section id="how-it-works" class="py-20 lg:py-28 px-6 lg:px-12 bg-ivory border-b border-champagne/50">
      <div class="max-w-7xl mx-auto space-y-14">
        <div class="text-center max-w-xl mx-auto">
          <div class="text-xs uppercase tracking-widest text-bronze font-bold">The Methodology</div>
          <h2 class="font-serif text-3xl sm:text-4xl text-espresso font-normal mt-2 tracking-tight">
            From Profile to Placement
          </h2>
          <p class="text-sm text-charcoal/80 mt-2 font-light">
            A structured six-step trajectory designed for engineering and technology careers.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          ${[
            ['1', 'Curate Your Profile', 'Add academic milestones, degree details, target roles, and demonstrable competencies.'],
            ['2', 'Upload Your Resume', 'Provide your PDF or markdown text for structural ATS keyword scanning and parsing.'],
            ['3', 'Algorithmic Job Matching', 'TF-IDF semantic analysis ranks opportunities according to actual skill overlap.'],
            ['4', 'Skill Gap Diagnostics', 'Inspect missing proficiencies with clear prioritization rather than generic advice.'],
            ['5', 'Follow Your Roadmap', 'Execute achievable weekly milestones to close gaps and build portfolio proof.'],
            ['6', 'Apply & Track Status', 'Submit applications with full transparency across each review and interview stage.']
          ].map(([num, title, desc]) => `
            <div class="space-y-3 p-6 rounded-2xl bg-surface border border-champagne/80">
              <span class="w-8 h-8 rounded-full bg-cream border border-champagne flex items-center justify-center font-serif text-xs font-bold text-bronze">${num}</span>
              <h4 class="font-serif text-base font-semibold text-espresso">${title}</h4>
              <p class="text-xs text-charcoal/80 font-light leading-relaxed">${desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Closing Luxury CTA -->
    <section class="py-20 px-6 lg:px-12 bg-cream text-center border-b border-champagne/60">
      <div class="max-w-3xl mx-auto space-y-6">
        <div class="text-xs uppercase tracking-widest text-bronze font-bold">Start Today</div>
        <h2 class="font-serif text-3xl sm:text-4xl text-espresso font-normal tracking-tight">
          Your Next Career Milestone <br />
          <span class="italic font-normal text-bronze">Begins With Precision.</span>
        </h2>
        <p class="text-sm text-charcoal/80 font-light max-w-lg mx-auto">
          Join students, recent graduates, and hiring recruiters using CareerPilot AI to make career decisions with clarity.
        </p>
        <div class="pt-2">
          <button data-action="open-auth" data-mode="register" class="btn-luxury-primary !px-8 !py-3.5 text-sm">
            Launch Your Workspace <span>→</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Minimalist Editorial Footer -->
    <footer class="py-10 px-6 lg:px-12 bg-ivory text-xs text-taupe">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <span class="font-serif text-espresso font-bold text-sm">✦ CareerPilot AI</span>
          <span>·</span>
          <span>Intelligent Career Architecture</span>
        </div>
        <div class="flex items-center gap-6">
          <a href="#features" class="hover:text-espresso transition">Capabilities</a>
          <a href="#how-it-works" class="hover:text-espresso transition">Methodology</a>
          <button data-action="open-auth" data-mode="login" class="hover:text-espresso transition">Workspace Login</button>
        </div>
        <div>
          © 2026 CareerPilot AI · All rights reserved.
        </div>
      </div>
    </footer>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTHENTICATION PAGES (Editorial Split Screen)
// ─────────────────────────────────────────────────────────────────────────────
function renderAuth(mode = 'login') {
  state.authMode = mode;
  const root = $('#app');
  root.innerHTML = `
  <div class="fade-enter min-h-screen grid lg:grid-cols-12 bg-ivory text-espresso">
    <!-- Left Editorial Panel -->
    <div class="hidden lg:flex lg:col-span-5 bg-cream border-r border-champagne p-12 xl:p-16 flex-col justify-between">
      <div class="space-y-2">
        <a href="#" data-action="go-home" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-espresso text-ivory flex items-center justify-center font-serif text-sm">✦</div>
          <span class="font-serif text-lg font-semibold tracking-tight text-espresso">CareerPilot <span class="text-bronze text-xs font-sans tracking-widest uppercase">AI</span></span>
        </a>
      </div>

      <div class="space-y-6 max-w-sm">
        <div class="text-xs uppercase tracking-widest text-bronze font-bold">Quiet Luxury Guidance</div>
        <h2 class="font-serif text-3xl xl:text-4xl font-normal text-espresso leading-snug">
          Where Ambition Meets <br />
          <span class="italic font-normal text-bronze">Clarity and Data.</span>
        </h2>
        <p class="text-xs text-charcoal/80 leading-relaxed font-light">
          Access algorithmic job matching, skill gap discovery, resume ATS scoring, and recruiter opportunities in one refined workspace.
        </p>

        <div class="pt-4 border-t border-champagne/80 space-y-2.5 text-xs text-charcoal font-medium">
          <div class="flex items-center gap-2">
            <span class="text-bronze">✦</span> 100% Explainable semantic match ranking
          </div>
          <div class="flex items-center gap-2">
            <span class="text-bronze">✦</span> PDF & DOCX resume file analysis
          </div>
          <div class="flex items-center gap-2">
            <span class="text-bronze">✦</span> Role-based access for students & recruiters
          </div>
        </div>
      </div>

      <div class="text-[11px] text-taupe">
        Portfolio demonstration · Spring Boot 4 & FastAPI
      </div>
    </div>

    <!-- Right Form Area -->
    <div class="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
      <div class="w-full max-w-md space-y-7">
        
        <!-- Mobile brand -->
        <div class="lg:hidden flex items-center justify-between">
          <a href="#" data-action="go-home" class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-espresso text-ivory flex items-center justify-center font-serif text-xs">✦</div>
            <span class="font-serif font-bold text-espresso">CareerPilot AI</span>
          </a>
          <a href="#" data-action="go-home" class="text-xs font-semibold text-taupe hover:text-espresso">← Back</a>
        </div>

        <div>
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">
            ${state.authMode === 'login' ? 'WORKSPACE AUTHENTICATION' : 'CREATE YOUR ACCOUNT'}
          </div>
          <h2 class="font-serif text-2xl sm:text-3xl font-normal text-espresso mt-1">
            ${state.authMode === 'login' ? 'Welcome back.' : 'Begin your career trajectory.'}
          </h2>
          <p class="text-xs text-taupe mt-1.5 font-light">
            ${state.authMode === 'login' ? 'Enter your credentials to enter your private workspace.' : 'Register to unlock intelligent skill matching and recommendations.'}
          </p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="flex p-1 bg-cream rounded-xl border border-champagne">
          <button data-action="switch-auth" data-mode="login" class="flex-1 py-2 text-xs font-semibold rounded-lg transition ${state.authMode === 'login' ? 'bg-surface text-espresso shadow-card' : 'text-taupe hover:text-espresso'}">
            Sign In
          </button>
          <button data-action="switch-auth" data-mode="register" class="flex-1 py-2 text-xs font-semibold rounded-lg transition ${state.authMode === 'register' ? 'bg-surface text-espresso shadow-card' : 'text-taupe hover:text-espresso'}">
            Create Account
          </button>
        </div>

        <!-- Form -->
        <form id="auth-form" class="space-y-4">
          ${state.authMode === 'register' ? `
            <div>
              <label class="block text-xs font-semibold text-charcoal mb-1">Full Name</label>
              <input name="fullName" required class="luxury-field" placeholder="e.g. Yograj Sikka" />
            </div>` : ''}

          <div>
            <label class="block text-xs font-semibold text-charcoal mb-1">Email Address</label>
            <input name="email" type="email" required class="luxury-field" placeholder="you@domain.com" value="${state.authMode === 'login' ? 'student@careerpilot.ai' : ''}" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-charcoal mb-1">Password</label>
            <input name="password" type="password" required minlength="8" class="luxury-field" placeholder="At least 8 characters" value="${state.authMode === 'login' ? 'CareerPilot@123' : ''}" />
          </div>

          ${state.authMode === 'register' ? `
            <div>
              <label class="block text-xs font-semibold text-charcoal mb-1">Account Role</label>
              <select name="role" class="luxury-field">
                <option value="STUDENT">Student / Early Career</option>
                <option value="RECRUITER">Hiring Recruiter</option>
              </select>
            </div>` : ''}

          <button type="submit" class="btn-luxury-primary w-full !py-3 text-xs tracking-wide">
            ${state.authMode === 'login' ? 'Sign In to Workspace →' : 'Complete Registration →'}
          </button>
        </form>

        <!-- One-Click Demo Credentials -->
        <div class="p-4 rounded-xl bg-cream/70 border border-champagne space-y-2.5">
          <div class="flex items-center justify-between text-[10px] text-taupe font-bold uppercase tracking-wider">
            <span>Instant Demo Access</span>
            <span class="text-bronze">Password: CareerPilot@123</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <button data-action="fill-demo" data-email="student@careerpilot.ai" class="py-2 text-[11px] font-semibold rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-center">
              Student
            </button>
            <button data-action="fill-demo" data-email="recruiter@careerpilot.ai" class="py-2 text-[11px] font-semibold rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-center">
              Recruiter
            </button>
            <button data-action="fill-demo" data-email="admin@careerpilot.ai" class="py-2 text-[11px] font-semibold rounded-lg bg-surface border border-champagne hover:border-bronze hover:text-bronze transition text-center">
              Admin
            </button>
          </div>
        </div>

        <div class="text-center">
          <button data-action="go-home" class="text-xs text-taupe hover:text-espresso transition">
            ← Return to public home
          </button>
        </div>

      </div>
    </div>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DASHBOARD SHELL & NAVIGATION (Quiet Luxury)
// ─────────────────────────────────────────────────────────────────────────────
const navFor = role => {
  const base = [
    ['overview', '⌂', 'Overview'],
    ['jobs', '▦', role === 'STUDENT' ? 'Explore Jobs' : 'Job Board']
  ];
  if (role === 'STUDENT') {
    base.push(
      ['applications', '▤', 'Applications'],
      ['profile', '◎', 'Profile & Resume'],
      ['analysis', '✦', 'AI Intelligence'],
      ['interview', '✳', 'Interview Studio']
    );
  }
  if (role === 'RECRUITER') {
    base.push(
      ['recruiter', '▣', 'Recruiter Console'],
      ['applications', '▤', 'Candidates']
    );
  }
  if (role === 'ADMIN') {
    base.push(
      ['admin', '◈', 'Platform Admin'],
      ['applications', '▤', 'All Submissions']
    );
  }
  return base;
};

function pageTitle(page) {
  return ({
    overview: 'Workspace Overview',
    jobs: 'Career Opportunities',
    applications: 'Applications Pipeline',
    profile: 'Profile & Resume Management',
    analysis: 'AI Career Intelligence & Roadmap',
    interview: 'Technical Interview Studio',
    recruiter: 'Recruiter Console',
    admin: 'Platform Administration'
  })[page] || 'CareerPilot AI';
}

function renderShell(content = '') {
  const role = state.user.role;
  const nav = navFor(role);

  $('#app').innerHTML = `
  <div class="fade-enter min-h-screen flex bg-ivory text-espresso">
    <!-- Refined Sidebar -->
    <aside class="hidden lg:flex w-64 shrink-0 bg-surface border-r border-champagne flex-col px-5 py-6">
      <!-- Monogram Logo -->
      <a href="#" data-page="overview" class="flex items-center gap-3 px-2 mb-8">
        <div class="w-8 h-8 rounded-lg bg-espresso text-ivory flex items-center justify-center font-serif text-sm">✦</div>
        <div>
          <div class="font-serif text-base font-semibold text-espresso">CareerPilot <span class="text-bronze text-[10px] font-sans font-bold uppercase">AI</span></div>
          <div class="text-[9px] tracking-[0.2em] text-taupe uppercase -mt-0.5">Quiet Luxury</div>
        </div>
      </a>

      <!-- Navigation Section -->
      <div class="px-2 mb-2 text-[10px] tracking-widest text-taupe font-bold uppercase">Workspace</div>
      <nav class="space-y-1">
        ${nav.map(([id, ic, label]) => `
          <button data-page="${id}" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${state.page === id ? 'bg-cream text-bronze border border-champagne' : 'text-charcoal hover:bg-cream/60 hover:text-espresso'}">
            <span class="w-4 text-center text-sm">${ic}</span>
            <span>${label}</span>
          </button>
        `).join('')}
      </nav>

      <!-- Bottom Card & User Chip -->
      <div class="mt-auto space-y-4">
        <div class="p-3.5 rounded-xl bg-cream/70 border border-champagne text-xs space-y-2">
          <div class="flex items-center gap-1.5 text-bronze text-[10px] font-bold uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full bg-bronze"></span>
            Career Intelligence
          </div>
          <p class="text-[11px] text-charcoal/80 leading-relaxed font-light">
            Keep your skills and resume fresh for sharper matching.
          </p>
          ${role === 'STUDENT' ? `
            <button data-page="analysis" class="text-[11px] font-semibold text-bronze hover:underline block">
              Run Career Analysis →
            </button>` : ''}
        </div>

        <div class="pt-3 border-t border-champagne flex items-center justify-between px-1">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full bg-cream border border-champagne text-espresso font-serif font-bold text-xs flex items-center justify-center shrink-0">
              ${initials(state.user.fullName)}
            </div>
            <div class="min-w-0">
              <div class="text-xs font-semibold text-espresso truncate">${esc(state.user.fullName)}</div>
              <div class="text-[10px] text-taupe capitalize">${roleName(role)}</div>
            </div>
          </div>
          <button data-action="logout" title="Sign out" class="text-taupe hover:text-espresso text-sm p-1.5 rounded-lg hover:bg-cream transition">
            ↗
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Workspace Area -->
    <div class="min-w-0 flex-1 flex flex-col min-h-screen">
      <!-- Top Header -->
      <header class="h-18 bg-surface/90 backdrop-blur-sm border-b border-champagne px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button data-action="toggle-mobile-nav" class="lg:hidden w-8 h-8 rounded-lg bg-cream flex items-center justify-center text-xs">
            ☰
          </button>
          <div>
            <h1 class="font-serif text-lg font-semibold text-espresso">${pageTitle(state.page)}</h1>
            <div class="text-[11px] text-taupe font-light">
              ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          ${role === 'STUDENT' ? `
            <button data-action="run-analysis" class="btn-luxury-bronze !py-2 !px-3.5 text-xs hidden sm:inline-flex">
              ✦ Run AI Analysis
            </button>` : ''}
          <div class="w-8 h-8 rounded-full bg-cream border border-champagne flex items-center justify-center font-serif text-xs font-bold text-espresso">
            ${initials(state.user.fullName)}
          </div>
        </div>
      </header>

      <!-- Mobile Navigation Drawer (Hidden by default) -->
      <div id="mobile-nav" class="lg:hidden hidden bg-surface border-b border-champagne px-4 py-3 flex gap-2 overflow-x-auto">
        ${nav.map(([id, ic, label]) => `
          <button data-page="${id}" class="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold ${state.page === id ? 'bg-cream text-bronze border border-champagne' : 'text-charcoal bg-ivory'}">
            ${ic} ${label}
          </button>
        `).join('')}
      </div>

      <!-- Main Content Container -->
      <main id="page-content" class="p-6 lg:p-10 max-w-7xl w-full mx-auto flex-1">
        ${content}
      </main>

      <!-- Workspace Footer -->
      <footer class="px-8 py-4 border-t border-champagne/60 bg-surface/50 text-[11px] text-taupe flex flex-col sm:flex-row justify-between items-center gap-2">
        <span>© 2026 CareerPilot AI · Quiet Luxury Career Architecture</span>
        <span class="font-serif text-espresso/70">Refined · Explainable · Modern</span>
      </footer>
    </div>
  </div>`;
}

function setContent(html) {
  const node = $('#page-content');
  if (node) node.innerHTML = `<div class="fade-enter">${html}</div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. OVERVIEW PAGES
// ─────────────────────────────────────────────────────────────────────────────
async function renderOverview() {
  state.dashboard = await api('/dashboard');
  const d = state.dashboard;

  if (state.user.role === 'STUDENT') {
    const jobs = d.topJobs || [];
    const apps = d.recentApplications || [];

    setContent(`
      <div class="space-y-8">
        <!-- Editorial Welcome Banner -->
        <div class="p-8 rounded-2xl bg-cream border border-champagne flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2 max-w-xl">
            <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Personal Workspace</div>
            <h2 class="font-serif text-3xl text-espresso font-normal tracking-tight">
              Greetings, ${esc(state.user.fullName.split(' ')[0])}. <br />
              <span class="italic font-normal text-bronze">Your next career milestone starts here.</span>
            </h2>
            <p class="text-xs text-charcoal/80 font-light leading-relaxed">
              A clear, uninterrupted view of your career readiness, active applications, and recommended roles.
            </p>
          </div>
          <div class="shrink-0 flex gap-3">
            <button data-action="run-analysis" class="btn-luxury-bronze text-xs">
              ✦ Run Career Analysis
            </button>
            <button data-page="jobs" class="btn-luxury-secondary text-xs">
              Explore Roles →
            </button>
          </div>
        </div>

        <!-- 4 Metric Cards -->
        <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="luxury-card p-5 space-y-1.5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Career Readiness</div>
            <div class="font-serif text-3xl font-bold text-espresso">${d.readinessScore || 0}%</div>
            <div class="text-[11px] text-sage font-medium">Profile & skill metric</div>
          </div>

          <div class="luxury-card p-5 space-y-1.5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Open Opportunities</div>
            <div class="font-serif text-3xl font-bold text-espresso">${d.activeJobs || 0}</div>
            <div class="text-[11px] text-taupe font-light">Available for application</div>
          </div>

          <div class="luxury-card p-5 space-y-1.5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Applications Sent</div>
            <div class="font-serif text-3xl font-bold text-espresso">${d.applications || 0}</div>
            <div class="text-[11px] text-taupe font-light">In your personal pipeline</div>
          </div>

          <div class="luxury-card p-5 space-y-1.5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Active Pipeline</div>
            <div class="font-serif text-3xl font-bold text-espresso">${d.interviews || 0}</div>
            <div class="text-[11px] text-bronze font-medium">Shortlisted or interview stage</div>
          </div>
        </div>

        <!-- Two Column Main Body -->
        <div class="grid lg:grid-cols-12 gap-6">
          <!-- Recommended Roles -->
          <div class="lg:col-span-7 luxury-card p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-champagne">
              <div>
                <h3 class="font-serif text-base font-semibold text-espresso">Suggested Opportunities</h3>
                <p class="text-[11px] text-taupe">Roles aligned with your declared skills</p>
              </div>
              <button data-page="jobs" class="text-xs font-semibold text-bronze hover:underline">
                View all →
              </button>
            </div>

            <div class="space-y-3">
              ${jobs.length ? jobs.map(j => `
                <div class="p-4 rounded-xl bg-ivory/60 border border-champagne/80 hover:border-sand transition flex items-center justify-between gap-4">
                  <div class="min-w-0">
                    <div class="font-serif text-sm font-semibold text-espresso truncate">${esc(j.title)}</div>
                    <div class="text-[11px] text-taupe mt-0.5">${esc(j.company)} · ${esc(j.location)}</div>
                    <div class="flex gap-1.5 mt-2 flex-wrap">
                      ${badge(j.jobType || 'Full-time', 'champagne')}
                      ${badge(j.experienceLevel || 'Entry', 'sand')}
                    </div>
                  </div>
                  <div class="text-right shrink-0 space-y-1.5">
                    ${j.matchScore != null ? badge(`${j.matchScore}% Match`, j.matchScore >= 70 ? 'sage' : 'bronze') : ''}
                    <div>
                      <button data-action="apply" data-id="${j.id}" class="btn-luxury-primary !py-1.5 !px-3 !text-[11px]">
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              `).join('') : emptyState('🧭', 'No listings yet', 'Opportunities will appear as recruiters post them.')}
            </div>
          </div>

          <!-- Quick Actions & Pipeline -->
          <div class="lg:col-span-5 space-y-6">
            <!-- Readiness Summary -->
            <div class="luxury-card p-6 space-y-4">
              <div class="flex items-center justify-between">
                <h3 class="font-serif text-base font-semibold text-espresso">Profile Completeness</h3>
                ${badge(`${d.profileCompletion || 0}%`, 'bronze')}
              </div>
              <div class="w-full bg-cream h-2 rounded-full overflow-hidden border border-champagne">
                <div class="bg-bronze h-full rounded-full" style="width: ${d.profileCompletion || 0}%"></div>
              </div>
              <p class="text-xs text-charcoal/80 font-light leading-relaxed">
                Add your resume, GitHub portfolio link, and technical skills to strengthen match accuracy.
              </p>
              <button data-page="profile" class="btn-luxury-secondary w-full text-xs">
                Update Profile & Resume →
              </button>
            </div>

            <!-- Recent Applications -->
            <div class="luxury-card p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-champagne">
                <h3 class="font-serif text-base font-semibold text-espresso">Recent Submissions</h3>
                <button data-page="applications" class="text-xs font-semibold text-bronze hover:underline">
                  All →
                </button>
              </div>
              <div class="space-y-2.5">
                ${apps.length ? apps.slice(0, 3).map(a => `
                  <div class="p-3 rounded-xl bg-ivory border border-champagne flex items-center justify-between text-xs">
                    <div class="min-w-0">
                      <div class="font-semibold text-espresso truncate">${esc(a.job?.title || 'Role')}</div>
                      <div class="text-[10px] text-taupe">${esc(a.job?.company || '')} · ${dateLabel(a.appliedAt)}</div>
                    </div>
                    ${badge(a.status.replace('_', ' '), a.status === 'SHORTLISTED' || a.status === 'INTERVIEW' ? 'sage' : 'champagne')}
                  </div>
                `).join('') : emptyState('📨', 'No applications yet', 'Apply to roles to track your progress here.')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  } else if (state.user.role === 'RECRUITER') {
    const apps = d.recentApplications || [];
    setContent(`
      <div class="space-y-8">
        <div class="p-8 rounded-2xl bg-cream border border-champagne flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-1.5">
            <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Recruiter Console</div>
            <h2 class="font-serif text-3xl text-espresso font-normal">Hiring Workspace.</h2>
            <p class="text-xs text-charcoal/80 font-light">Manage open positions and evaluate qualified student talent.</p>
          </div>
          <button data-action="new-job" class="btn-luxury-primary text-xs">
            ＋ Post New Role
          </button>
        </div>

        <div class="grid sm:grid-cols-3 gap-4">
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Your Active Roles</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.myJobs || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Applications Received</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.applications || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Shortlisted Candidates</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.shortlisted || 0}</div>
          </div>
        </div>

        <div class="luxury-card p-6 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-champagne">
            <h3 class="font-serif text-base font-semibold text-espresso">Recent Applicants</h3>
            <button data-page="recruiter" class="text-xs font-semibold text-bronze hover:underline">Manage All Candidates →</button>
          </div>
          <div class="space-y-3">
            ${apps.length ? apps.map(a => `
              <div class="p-4 rounded-xl bg-ivory border border-champagne flex items-center justify-between gap-4">
                <div>
                  <div class="font-serif text-sm font-semibold text-espresso">${esc(a.student?.fullName || 'Candidate')}</div>
                  <div class="text-xs text-taupe">${esc(a.job?.title)} · ${esc(a.student?.email)} · ${dateLabel(a.appliedAt)}</div>
                </div>
                <div class="flex items-center gap-3">
                  ${badge(a.status.replace('_', ' '), 'sage')}
                  <select data-action="update-status" data-id="${a.id}" class="luxury-field !py-1.5 !text-xs !w-36">
                    ${['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map(s => `
                      <option value="${s}" ${a.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>
                    `).join('')}
                  </select>
                </div>
              </div>
            `).join('') : emptyState('👥', 'No applications yet', 'Candidates will appear as students apply to your postings.')}
          </div>
        </div>
      </div>
    `);
  } else {
    // Admin
    const overview = await api('/admin/overview');
    setContent(`
      <div class="space-y-8">
        <div class="p-8 rounded-2xl bg-cream border border-champagne">
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">System Administration</div>
          <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Platform Control Center.</h2>
          <p class="text-xs text-charcoal/80 font-light mt-1">Comprehensive system analytics and cross-role governance.</p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase">Total Users</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${overview.totalUsers || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase">Students</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${overview.students || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase">Recruiters</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${overview.recruiters || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase">Active Jobs</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${overview.activeJobs || 0}</div>
          </div>
          <div class="luxury-card p-5">
            <div class="text-[10px] font-bold text-taupe uppercase">Applications</div>
            <div class="font-serif text-3xl font-bold text-espresso mt-1">${overview.applications || 0}</div>
          </div>
        </div>

        <div class="luxury-card p-6 space-y-4">
          <h3 class="font-serif text-base font-semibold text-espresso">Recent Job Opportunities Across Platform</h3>
          <div class="space-y-2.5">
            ${(overview.recentJobs || []).map(j => `
              <div class="p-3.5 rounded-xl bg-ivory border border-champagne flex items-center justify-between text-xs">
                <div>
                  <div class="font-semibold text-espresso">${esc(j.title)}</div>
                  <div class="text-[11px] text-taupe">${esc(j.company)} · ${esc(j.location)}</div>
                </div>
                ${badge(j.active ? 'Active' : 'Closed', j.active ? 'sage' : 'sand')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. JOBS EXPLORATION & DETAILS
// ─────────────────────────────────────────────────────────────────────────────
async function renderJobs() {
  state.jobs = await api('/jobs?q=' + encodeURIComponent(state.filter) + '&location=' + encodeURIComponent(state.locationFilter || ''));
  let matches = {};
  if (state.user.role === 'STUDENT') {
    try {
      state.analysis = await api('/analysis/run', { method: 'POST', body: JSON.stringify({}) });
      (state.analysis.matches || []).forEach(j => matches[j.id] = j.matchScore);
    } catch (e) { /* profile can be completed later */ }
  }
  const jobs = state.jobs.map(j => ({ ...j, matchScore: matches[j.id] }));

  setContent(`
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Opportunities Board</div>
          <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Explore Curated Roles</h2>
          <p class="text-xs text-taupe font-light mt-1">Compare requirements, evaluate skill fit, and submit applications.</p>
        </div>
        ${state.user.role !== 'STUDENT' ? `
          <button data-action="new-job" class="btn-luxury-primary text-xs">
            ＋ Post New Role
          </button>` : ''}
      </div>

      <!-- Search & Location Filters -->
      <div class="luxury-card p-4">
        <div class="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <input id="job-search" class="luxury-field" placeholder="Search by role, company, or required skill (e.g. Java, React)..." value="${esc(state.filter)}" />
          <select id="location-filter" class="luxury-field md:w-56">
            <option value="">All Locations</option>
            ${[...new Set(state.jobs.map(j => j.location).filter(Boolean))].map(l => `
              <option value="${esc(l)}" ${state.locationFilter === l ? 'selected' : ''}>${esc(l)}</option>
            `).join('')}
          </select>
          <button data-action="filter-jobs" class="btn-luxury-bronze text-xs">
            Search
          </button>
        </div>
      </div>

      <!-- Jobs Grid -->
      <div class="grid md:grid-cols-2 gap-5">
        ${jobs.length ? jobs.map(j => `
          <div class="luxury-card p-6 flex flex-col justify-between space-y-4">
            <div class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <h3 class="font-serif text-lg font-semibold text-espresso leading-snug">${esc(j.title)}</h3>
                  <div class="text-xs text-taupe mt-0.5">${esc(j.company)} · ${esc(j.location)}</div>
                </div>
                ${j.matchScore != null ? badge(`${j.matchScore}% Match`, j.matchScore >= 70 ? 'sage' : 'bronze') : ''}
              </div>

              <p class="text-xs text-charcoal/80 font-light leading-relaxed line-clamp-2">
                ${esc(j.description)}
              </p>

              <div class="flex flex-wrap gap-1.5 pt-1">
                ${badge(j.jobType || 'Full-time', 'champagne')}
                ${badge(j.experienceLevel || 'Entry', 'sand')}
                ${j.salaryRange ? badge(j.salaryRange, 'bronze') : ''}
              </div>

              <!-- Skills tags -->
              <div class="pt-2 border-t border-champagne/60">
                <div class="text-[10px] font-bold text-taupe uppercase tracking-wider mb-1.5">Required Skills</div>
                <div class="flex flex-wrap gap-1">
                  ${(j.requiredSkills || '').split(',').slice(0, 6).map(s => `
                    <span class="px-2 py-0.5 rounded bg-ivory border border-champagne text-[10px] text-charcoal font-medium">${esc(s.trim())}</span>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="pt-3 border-t border-champagne/60 flex items-center justify-between text-xs">
              <span class="text-[10px] text-taupe">Posted ${dateLabel(j.createdAt)}</span>
              ${state.user.role === 'STUDENT' ? `
                <button data-action="apply" data-id="${j.id}" class="btn-luxury-primary !py-2 !px-4 text-xs">
                  Apply Now →
                </button>` : `
                <span class="text-[11px] text-taupe">By ${esc(j.recruiter || 'Recruiter')}</span>`}
            </div>
          </div>
        `).join('') : emptyState('🔎', 'No matching jobs found', 'Try adjusting your search keywords or clearing location filters.')}
      </div>
    </div>
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. APPLICATIONS PIPELINE
// ─────────────────────────────────────────────────────────────────────────────
async function renderApplications() {
  state.applications = await api('/applications');
  const isRecruiter = state.user.role !== 'STUDENT';

  setContent(`
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">
            ${isRecruiter ? 'CANDIDATE PIPELINE' : 'APPLICATION TRACKING'}
          </div>
          <h2 class="font-serif text-3xl text-espresso font-normal mt-1">
            ${isRecruiter ? 'Applicants Management' : 'My Applications'}
          </h2>
          <p class="text-xs text-taupe font-light mt-1">
            ${isRecruiter ? 'Review submitted student profiles and progress candidates across stages.' : 'Track the lifecycle of every role you have applied for.'}
          </p>
        </div>
        <button data-action="reload-page" class="btn-luxury-secondary text-xs">
          ↻ Refresh
        </button>
      </div>

      <div class="luxury-card overflow-hidden">
        <div class="p-5 border-b border-champagne flex justify-between items-center bg-cream/30">
          <span class="text-xs font-semibold text-espresso">${state.applications.length} Total Submissions</span>
        </div>

        ${state.applications.length ? `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs min-w-[700px]">
              <thead class="bg-ivory border-b border-champagne text-[10px] uppercase tracking-wider text-taupe">
                <tr>
                  <th class="py-3.5 px-5 font-bold">${isRecruiter ? 'Candidate' : 'Position'}</th>
                  <th class="py-3.5 px-5 font-bold">${isRecruiter ? 'Role Applied' : 'Company'}</th>
                  <th class="py-3.5 px-5 font-bold">Date Applied</th>
                  <th class="py-3.5 px-5 font-bold">Status</th>
                  ${isRecruiter ? '<th class="py-3.5 px-5 font-bold">Update Stage</th>' : ''}
                </tr>
              </thead>
              <tbody class="divide-y divide-champagne/60">
                ${state.applications.map(a => `
                  <tr class="hover:bg-ivory/50 transition">
                    <td class="py-4 px-5 font-semibold text-espresso">
                      ${esc(isRecruiter ? a.student?.fullName : a.job?.title)}
                    </td>
                    <td class="py-4 px-5 text-charcoal">
                      ${esc(isRecruiter ? a.job?.title : a.job?.company)}
                    </td>
                    <td class="py-4 px-5 text-taupe">
                      ${dateLabel(a.appliedAt)}
                    </td>
                    <td class="py-4 px-5">
                      ${badge(a.status.replace('_', ' '), ({
                        APPLIED: 'champagne',
                        UNDER_REVIEW: 'sand',
                        SHORTLISTED: 'sage',
                        INTERVIEW: 'bronze',
                        OFFERED: 'sage',
                        REJECTED: 'terracotta'
                      })[a.status])}
                    </td>
                    ${isRecruiter ? `
                      <td class="py-4 px-5">
                        <select data-action="update-status" data-id="${a.id}" class="luxury-field !py-1.5 !text-xs !w-40">
                          ${['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map(s => `
                            <option value="${s}" ${a.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>
                          `).join('')}
                        </select>
                      </td>` : ''}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : emptyState('📨', isRecruiter ? 'No candidates yet' : 'No applications submitted', isRecruiter ? 'Post a job to begin receiving candidate applications.' : 'Explore opportunities and submit your profile.', !isRecruiter ? '<button data-page="jobs" class="btn-luxury-primary text-xs mt-3">Explore Jobs →</button>' : '')}
      </div>
    </div>
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PROFILE & RESUME MANAGEMENT (WITH PDF FILE UPLOAD FIX)
// ─────────────────────────────────────────────────────────────────────────────
async function renderProfile() {
  state.profile = await api('/profile/me');
  const p = state.profile;

  setContent(`
    <div class="space-y-6">
      <div>
        <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Professional Identity</div>
        <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Profile & Resume Architecture</h2>
        <p class="text-xs text-taupe font-light mt-1">Update personal information, academic credentials, skills, and your resume document.</p>
      </div>

      <div class="grid lg:grid-cols-12 gap-8">
        <!-- Main Form (8 cols) -->
        <form id="profile-form" class="lg:col-span-8 space-y-6">
          
          <!-- Section 1: Academic & Personal -->
          <div class="luxury-card p-6 space-y-5">
            <h3 class="font-serif text-base font-semibold text-espresso border-b border-champagne pb-3">Personal & Academic Credentials</h3>
            
            <div class="grid sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-semibold text-charcoal mb-1">Full Name</label>
                <input class="luxury-field bg-cream/40" value="${esc(p.fullName)}" disabled />
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">Email Address</label>
                <input class="luxury-field bg-cream/40" value="${esc(p.email)}" disabled />
              </div>

              <div class="sm:col-span-2">
                <label class="block font-semibold text-charcoal mb-1">Professional Headline</label>
                <input name="headline" class="luxury-field" value="${esc(p.headline || '')}" placeholder="e.g. Computer Science Student | Backend Developer" />
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">University / Institution</label>
                <input name="university" class="luxury-field" value="${esc(p.university || '')}" placeholder="e.g. Northstar Institute" />
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">Degree Program</label>
                <input name="degree" class="luxury-field" value="${esc(p.degree || '')}" placeholder="e.g. B.Tech Computer Science" />
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">Graduation Year</label>
                <input name="graduationYear" type="number" class="luxury-field" value="${esc(p.graduationYear || '')}" placeholder="2027" />
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">Current CGPA (out of 10.0)</label>
                <input name="cgpa" type="number" step="0.01" min="0" max="10" class="luxury-field" value="${esc(p.cgpa || '')}" placeholder="8.4" />
              </div>

              <div class="sm:col-span-2">
                <label class="block font-semibold text-charcoal mb-1">Current Location</label>
                <input name="location" class="luxury-field" value="${esc(p.location || '')}" placeholder="City, Country" />
              </div>
            </div>
          </div>

          <!-- Section 2: Skills & Web Profiles -->
          <div class="luxury-card p-6 space-y-5">
            <h3 class="font-serif text-base font-semibold text-espresso border-b border-champagne pb-3">Technical Skills & Portfolios</h3>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-semibold text-charcoal mb-1">Declared Skills (comma-separated)</label>
                <textarea name="skills" rows="3" class="luxury-field" placeholder="Java, Spring Boot, MySQL, REST APIs, Git, Python, React...">${esc(p.skills || '')}</textarea>
                <p class="text-[11px] text-taupe mt-1 font-light">List competencies you can demonstrate in a technical interview.</p>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold text-charcoal mb-1">GitHub Portfolio URL</label>
                  <input name="githubUrl" type="url" class="luxury-field" value="${esc(p.githubUrl || '')}" placeholder="https://github.com/username" />
                </div>
                <div>
                  <label class="block font-semibold text-charcoal mb-1">LinkedIn Profile URL</label>
                  <input name="linkedinUrl" type="url" class="luxury-field" value="${esc(p.linkedinUrl || '')}" placeholder="https://linkedin.com/in/username" />
                </div>
              </div>

              <div>
                <label class="block font-semibold text-charcoal mb-1">Professional Bio</label>
                <textarea name="bio" rows="2" class="luxury-field" placeholder="A concise executive statement of your interests and technical strengths...">${esc(p.bio || '')}</textarea>
              </div>

              <div>
                <div class="flex justify-between items-center mb-1">
                  <label class="block font-semibold text-charcoal">Self-Assessed Readiness Confidence</label>
                  <span id="confidence-value" class="font-serif font-bold text-bronze">${p.confidence || 70}%</span>
                </div>
                <input name="confidence" type="range" min="0" max="100" value="${p.confidence || 70}" class="w-full accent-[#9B7955]" oninput="document.getElementById('confidence-value').textContent=this.value+'%'" />
              </div>
            </div>
          </div>

          <!-- Section 3: PDF Resume Upload & ATS Extractor (FIXED RESUME FILE PICKER) -->
          <div class="luxury-card p-6 space-y-5">
            <div class="flex items-center justify-between border-b border-champagne pb-3">
              <div>
                <h3 class="font-serif text-base font-semibold text-espresso">Resume Document & ATS Text</h3>
                <p class="text-[11px] text-taupe">Upload a PDF or DOCX file to power semantic matching and ATS scoring.</p>
              </div>
              ${p.resumeFileName ? badge('File Attached', 'sage') : badge('No Document', 'sand')}
            </div>

            <!-- Drag & Drop Zone -->
            <div id="resume-dropzone" class="p-8 border-2 border-dashed border-champagne rounded-2xl bg-ivory/50 text-center space-y-3 transition cursor-pointer hover:border-bronze">
              <input id="resume-file-input" type="file" accept=".pdf,application/pdf,.docx,.txt,.md" class="hidden" />
              
              <div class="w-12 h-12 rounded-full bg-cream border border-champagne flex items-center justify-center text-xl text-bronze mx-auto">
                📄
              </div>
              
              <div>
                <div class="text-xs font-semibold text-espresso">Upload your resume document</div>
                <div class="text-[11px] text-taupe mt-0.5">PDF format supported (also accepts DOCX & TXT, max 10MB)</div>
              </div>

              <div>
                <button type="button" id="browse-resume-btn" class="btn-luxury-secondary !py-2 !px-4 text-xs">
                  Browse Files from Device
                </button>
              </div>

              <div id="upload-status" class="text-xs text-bronze font-medium hidden"></div>
            </div>

            <!-- Current File Preview -->
            ${p.resumeFileName ? `
              <div class="p-4 rounded-xl bg-cream/70 border border-champagne flex items-center justify-between text-xs">
                <div class="flex items-center gap-3">
                  <span class="text-lg">📎</span>
                  <div>
                    <div class="font-semibold text-espresso">${esc(p.resumeFileName)}</div>
                    <div class="text-[10px] text-taupe">
                      ${p.resumeFileSize ? (p.resumeFileSize / 1024).toFixed(1) + ' KB · ' : ''}
                      ${p.resumeUploadedAt ? 'Uploaded ' + dateLabel(p.resumeUploadedAt) : 'Attached to profile'}
                    </div>
                  </div>
                </div>
                <button type="button" data-action="delete-resume" class="text-xs text-[#9E6751] hover:underline font-semibold">
                  Remove
                </button>
              </div>
            ` : ''}

            <!-- Extracted Resume Text Area -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-charcoal">Extracted Resume Content (for ATS Analysis)</label>
                <span class="text-[10px] text-taupe">Auto-populated from upload or editable directly</span>
              </div>
              <textarea id="resume-text-input" name="resumeText" rows="7" class="luxury-field font-mono text-[11px] leading-relaxed" placeholder="Upload a PDF above to extract text, or paste your complete resume text here...">${esc(p.resumeText || '')}</textarea>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn-luxury-bronze !px-8 !py-3 text-xs">
              Save Profile Changes →
            </button>
          </div>
        </form>

        <!-- Right Insights Sidebar (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          <div class="luxury-card p-6 space-y-4">
            <h3 class="font-serif text-base font-semibold text-espresso">Resume Guidelines</h3>
            <div class="space-y-3 text-xs text-charcoal/80 font-light leading-relaxed">
              <div class="p-3 rounded-xl bg-ivory border border-champagne">
                <strong class="font-semibold text-espresso block mb-0.5">Clear Section Headers</strong>
                Use standard sections: Education, Skills, Projects, and Experience.
              </div>
              <div class="p-3 rounded-xl bg-ivory border border-champagne">
                <strong class="font-semibold text-espresso block mb-0.5">Quantified Metrics</strong>
                Mention percentage improvements, user counts, or latency reductions where truthful.
              </div>
              <div class="p-3 rounded-xl bg-ivory border border-champagne">
                <strong class="font-semibold text-espresso block mb-0.5">Exact Competencies</strong>
                Ensure skills mentioned on your resume match the keywords required by target jobs.
              </div>
            </div>

            <button type="button" data-action="run-analysis" class="btn-luxury-secondary w-full text-xs">
              Test ATS Score Now
            </button>
          </div>
        </div>
      </div>
    </div>
  `);

  initResumeUploadHandlers();
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. RESUME UPLOAD HANDLER IMPLEMENTATION (PDF, DOCX, TXT with File Picker)
// ─────────────────────────────────────────────────────────────────────────────
function initResumeUploadHandlers() {
  const fileInput = $('#resume-file-input');
  const browseBtn = $('#browse-resume-btn');
  const dropzone = $('#resume-dropzone');
  const statusEl = $('#upload-status');
  const textInput = $('#resume-text-input');

  if (!fileInput || !dropzone) return;

  browseBtn?.addEventListener('click', e => {
    e.preventDefault();
    fileInput.click();
  });

  dropzone.addEventListener('click', e => {
    if (e.target !== browseBtn) fileInput.click();
  });

  dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dropzone.classList.add('drag-active');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-active');
  });

  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-active');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files[0]) {
      handleSelectedFile(fileInput.files[0]);
    }
  });

  async function handleSelectedFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      toast('Unsupported format. Please select a .pdf, .docx, or .txt file.', true);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('File exceeds the 10MB size limit.', true);
      return;
    }

    statusEl.classList.remove('hidden');
    statusEl.innerHTML = `Extracting & uploading <strong>${esc(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)...`;

    let extractedText = '';

    // If PDF and pdf.js is loaded, extract text in browser
    if (ext === 'pdf' && window.pdfjsLib) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          fullText += strings.join(' ') + '\n';
        }
        extractedText = fullText.trim();
      } catch (err) {
        console.warn('PDF.js client parse notice:', err);
      }
    } else if (ext === 'txt' || ext === 'md') {
      try {
        extractedText = await file.text();
      } catch (err) {
        console.warn('Text file read error:', err);
      }
    }

    if (extractedText && textInput) {
      textInput.value = extractedText;
    }

    // Submit multipart form to backend /api/profile/resume
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (extractedText) fd.append('text', extractedText);

      const res = await api('/profile/resume', {
        method: 'POST',
        body: fd
      });

      toast(`Resume ${esc(file.name)} uploaded and parsed.`);
      statusEl.innerHTML = `✓ ${esc(file.name)} successfully attached.`;
      await renderProfile();
    } catch (err) {
      toast(err.message, true);
      statusEl.innerHTML = `<span class="text-terracotta">Upload failed: ${esc(err.message)}</span>`;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. AI CAREER INTELLIGENCE & ROADMAP
// ─────────────────────────────────────────────────────────────────────────────
async function renderAnalysis() {
  setContent(`
    <div class="py-20 text-center text-taupe space-y-3">
      <div class="w-10 h-10 border-2 border-bronze border-t-transparent rounded-full animate-spin mx-auto"></div>
      <div class="font-serif text-lg text-espresso">Computing Career Intelligence…</div>
      <p class="text-xs text-taupe font-light">Comparing your profile against active role competencies.</p>
    </div>
  `);

  try {
    state.analysis = await api('/analysis/run', { method: 'POST', body: JSON.stringify({ confidence: state.profile?.confidence }) });
    const a = state.analysis;

    setContent(`
      <div class="space-y-8">
        <div>
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Diagnostic Evaluation</div>
          <h2 class="font-serif text-3xl text-espresso font-normal mt-1">AI Career Intelligence & Roadmap</h2>
          <p class="text-xs text-taupe font-light mt-1">Algorithmic fit scoring, missing skill identification, and personalized next steps.</p>
        </div>

        <!-- 3 Core Scores -->
        <div class="grid sm:grid-cols-3 gap-5">
          <div class="luxury-card p-6 bg-cream/40">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Career Readiness Index</div>
            <div class="font-serif text-4xl font-bold text-espresso mt-2">${a.readinessScore}%</div>
            <div class="text-[11px] text-sage font-medium mt-1">${a.applyVerdict || 'Ready for evaluation'}</div>
          </div>

          <div class="luxury-card p-6 bg-cream/40">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">ATS Resume Quality</div>
            <div class="font-serif text-4xl font-bold text-espresso mt-2">${a.atsScore}<span class="text-base font-sans text-taupe font-normal">/100</span></div>
            <div class="text-[11px] text-bronze font-medium mt-1">Grade ${a.atsGrade || 'B'} Structure</div>
          </div>

          <div class="luxury-card p-6 bg-cream/40">
            <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Confidence Alignment</div>
            <div class="font-serif text-4xl font-bold text-espresso mt-2">${a.readinessGap > 0 ? '+' : ''}${a.readinessGap}</div>
            <div class="text-[11px] text-taupe font-light mt-1">Readiness vs. Self-estimate</div>
          </div>
        </div>

        <!-- Missing Skills & ATS Checklist -->
        <div class="grid lg:grid-cols-2 gap-6">
          <div class="luxury-card p-6 space-y-4">
            <h3 class="font-serif text-base font-semibold text-espresso">Skills to Prioritize</h3>
            <p class="text-xs text-taupe">Competencies required by your top match that are missing from your profile:</p>
            <div class="flex flex-wrap gap-2 pt-1">
              ${(a.missingSkills || []).length ? (a.missingSkills || []).map(s => `
                <span class="px-3 py-1.5 rounded-lg bg-cream border border-champagne text-xs font-semibold text-bronze">＋ ${esc(s)}</span>
              `).join('') : '<span class="text-xs text-sage font-medium">✓ No major skill deficits identified against top matches.</span>'}
            </div>
          </div>

          <div class="luxury-card p-6 space-y-4">
            <h3 class="font-serif text-base font-semibold text-espresso">Resume Improvement Opportunities</h3>
            <p class="text-xs text-taupe">Feedback from automated structural evaluation:</p>
            <ul class="text-xs text-charcoal/80 space-y-2">
              ${(a.atsIssues || []).map(issue => `
                <li class="flex items-start gap-2">
                  <span class="text-bronze mt-0.5">•</span>
                  <span>${esc(issue)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>

        <!-- Personalized Career Roadmap (Timeline) -->
        <div class="luxury-card p-6 space-y-6">
          <div class="border-b border-champagne pb-3">
            <h3 class="font-serif text-base font-semibold text-espresso">Structured Learning Roadmap</h3>
            <p class="text-xs text-taupe font-light">Achievable, prioritized milestones to prepare for top placement.</p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${(a.roadmap || []).map(step => `
              <div class="p-5 rounded-xl bg-ivory border border-champagne space-y-2">
                <div class="flex items-center justify-between text-[10px] font-bold text-bronze uppercase tracking-wider">
                  <span>Week ${step.week}</span>
                  <span class="text-taupe">${esc(step.duration)}</span>
                </div>
                <h4 class="font-serif text-sm font-semibold text-espresso">${esc(step.title)}</h4>
                <p class="text-xs text-charcoal/80 font-light leading-relaxed">${esc(step.detail)}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Engine Note & Disclaimer -->
        <div class="p-4 rounded-xl bg-cream border border-champagne text-[11px] text-taupe flex items-center justify-between">
          <span>Engine: <strong>${esc(a.aiEngine)}</strong></span>
          <span class="font-light">${esc(a.disclaimer)}</span>
        </div>
      </div>
    `);
  } catch (err) {
    setContent(`
      <div class="luxury-card p-10 text-center space-y-3">
        <div class="text-2xl text-terracotta">⚠️</div>
        <h3 class="font-serif text-lg font-semibold text-espresso">Analysis Temporarily Unavailable</h3>
        <p class="text-xs text-taupe max-w-md mx-auto">${esc(err.message)}</p>
        <button data-action="run-analysis" class="btn-luxury-primary text-xs mt-4">Try Again</button>
      </div>
    `);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. INTERVIEW STUDIO
// ─────────────────────────────────────────────────────────────────────────────
function renderInterview() {
  setContent(`
    <div class="space-y-6">
      <div>
        <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Preparation Studio</div>
        <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Technical Interview Practice</h2>
        <p class="text-xs text-taupe font-light mt-1">Select a role, generate a targeted interview prompt, and evaluate your structured response.</p>
      </div>

      <div class="grid lg:grid-cols-12 gap-6">
        <div class="lg:col-span-7 luxury-card p-6 space-y-5">
          <div>
            <label class="block text-xs font-semibold text-charcoal mb-1">Target Engineering Role</label>
            <select id="interview-role" class="luxury-field">
              <option>Software Engineer</option>
              <option selected>Java Backend Developer</option>
              <option>Full-Stack Developer</option>
              <option>AI / ML Engineer</option>
              <option>Data Analyst</option>
            </select>
          </div>

          <div class="p-5 rounded-2xl bg-cream border border-champagne space-y-2">
            <div class="flex items-center justify-between text-[10px] font-bold text-bronze uppercase tracking-widest">
              <span>Interview Prompt</span>
              <span id="interview-topic">Java & OOP Core</span>
            </div>
            <p id="interview-question" class="font-serif text-base text-espresso font-semibold leading-relaxed">
              Explain the difference between an interface and an abstract class in Java. When would you choose each?
            </p>
          </div>

          <div class="flex justify-between items-center text-xs">
            <button data-action="new-question" class="btn-luxury-secondary text-xs">
              ↻ Get Another Question
            </button>
            <span class="text-taupe text-[11px] font-light">Structure context → approach → trade-offs.</span>
          </div>

          <form id="interview-form" class="space-y-3 pt-2">
            <label class="block text-xs font-semibold text-charcoal">Your Structured Answer</label>
            <textarea id="interview-answer" rows="7" class="luxury-field" placeholder="Define the core concept, provide a practical architecture example, and describe engineering trade-offs..."></textarea>
            <button type="submit" class="btn-luxury-bronze w-full !py-3 text-xs">
              Submit Answer for Evaluation →
            </button>
          </form>
        </div>

        <div class="lg:col-span-5 luxury-card p-6 space-y-4">
          <h3 class="font-serif text-base font-semibold text-espresso border-b border-champagne pb-3">Evaluation Feedback</h3>
          <div id="interview-feedback">
            ${emptyState('🎤', 'Awaiting Your Answer', 'Submit your response to see concept scores, keyword hits, and coaching suggestions.')}
          </div>
        </div>
      </div>
    </div>
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. RECRUITER & ADMIN CONSOLES
// ─────────────────────────────────────────────────────────────────────────────
async function renderRecruiter() {
  const [own, apps] = await Promise.all([api('/recruiter/jobs'), api('/applications')]);
  state.jobs = own;
  state.applications = apps;

  setContent(`
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Recruiter Workspace</div>
          <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Job Postings Management</h2>
          <p class="text-xs text-taupe font-light mt-1">Create and manage opportunities visible to candidates across the platform.</p>
        </div>
        <button data-action="new-job" class="btn-luxury-primary text-xs">
          ＋ Create Job Posting
        </button>
      </div>

      <div class="luxury-card p-6 space-y-4">
        <h3 class="font-serif text-base font-semibold text-espresso">Your Active Listings (${own.length})</h3>
        <div class="space-y-3">
          ${own.length ? own.map(j => `
            <div class="p-4 rounded-xl bg-ivory border border-champagne flex items-center justify-between gap-4">
              <div>
                <div class="font-serif text-sm font-semibold text-espresso">${esc(j.title)}</div>
                <div class="text-xs text-taupe">${esc(j.company)} · ${esc(j.location)} · ${esc(j.requiredSkills)}</div>
              </div>
              <div class="flex items-center gap-2">
                ${badge(j.active ? 'Active' : 'Closed', j.active ? 'sage' : 'sand')}
                <button data-action="edit-job" data-id="${j.id}" class="btn-luxury-secondary !py-1 !px-2.5 text-xs">Edit</button>
                <button data-action="delete-job" data-id="${j.id}" class="text-xs text-terracotta hover:underline font-semibold px-2">Close</button>
              </div>
            </div>
          `).join('') : emptyState('🧩', 'No jobs posted yet', 'Create your first opportunity listing to start collecting candidate applications.')}
        </div>
      </div>
    </div>
  `);
}

async function renderAdmin() {
  const d = await api('/admin/overview');
  setContent(`
    <div class="space-y-6">
      <div>
        <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Executive Control</div>
        <h2 class="font-serif text-3xl text-espresso font-normal mt-1">Platform Administration</h2>
        <p class="text-xs text-taupe font-light mt-1">Real-time aggregate telemetry across students, recruiters, and placement pipelines.</p>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="luxury-card p-5">
          <div class="text-[10px] font-bold text-taupe uppercase">Total Accounts</div>
          <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.totalUsers || 0}</div>
        </div>
        <div class="luxury-card p-5">
          <div class="text-[10px] font-bold text-taupe uppercase">Students</div>
          <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.students || 0}</div>
        </div>
        <div class="luxury-card p-5">
          <div class="text-[10px] font-bold text-taupe uppercase">Recruiters</div>
          <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.recruiters || 0}</div>
        </div>
        <div class="luxury-card p-5">
          <div class="text-[10px] font-bold text-taupe uppercase">Active Roles</div>
          <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.activeJobs || 0}</div>
        </div>
        <div class="luxury-card p-5">
          <div class="text-[10px] font-bold text-taupe uppercase">Applications</div>
          <div class="font-serif text-3xl font-bold text-espresso mt-1">${d.applications || 0}</div>
        </div>
      </div>

      <div class="luxury-card p-6 space-y-4">
        <h3 class="font-serif text-base font-semibold text-espresso">Recent Platform Activity</h3>
        <div class="space-y-2">
          ${(d.recentJobs || []).map(j => `
            <div class="p-3.5 rounded-xl bg-ivory border border-champagne flex items-center justify-between text-xs">
              <div>
                <span class="font-semibold text-espresso">${esc(j.title)}</span>
                <span class="text-taupe"> — ${esc(j.company)} (${esc(j.location)})</span>
              </div>
              ${badge(j.active ? 'Active' : 'Closed', j.active ? 'sage' : 'sand')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. MODALS & FORMS
// ─────────────────────────────────────────────────────────────────────────────
function showModal(content) {
  const container = $('#modal-container');
  if (!container) return;
  container.innerHTML = `
    <div id="modal-root" class="luxury-modal-backdrop">
      <div class="luxury-modal-panel">
        ${content}
      </div>
    </div>
  `;
}

function closeModal() {
  const container = $('#modal-container');
  if (container) container.innerHTML = '';
}

function jobModal(job = null) {
  const j = job || {};
  showModal(`
    <div class="flex justify-between items-start mb-6 pb-4 border-b border-champagne">
      <div>
        <div class="text-[10px] uppercase tracking-widest text-bronze font-bold">Role Architecture</div>
        <h3 class="font-serif text-xl font-semibold text-espresso mt-0.5">${job ? 'Edit Job Posting' : 'Create New Job Posting'}</h3>
      </div>
      <button data-action="close-modal" class="text-taupe hover:text-espresso text-xl">×</button>
    </div>

    <form id="job-form" data-id="${job?.id || ''}" class="grid sm:grid-cols-2 gap-4 text-xs">
      <div>
        <label class="block font-semibold text-charcoal mb-1">Job Title *</label>
        <input name="title" required class="luxury-field" value="${esc(j.title || '')}" placeholder="Backend Developer Intern" />
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Company Name *</label>
        <input name="company" required class="luxury-field" value="${esc(j.company || '')}" placeholder="e.g. Nexora Labs" />
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Location *</label>
        <input name="location" required class="luxury-field" value="${esc(j.location || '')}" placeholder="Bengaluru / Remote" />
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Job Type</label>
        <select name="jobType" class="luxury-field">
          <option ${j.jobType === 'Full-time' ? 'selected' : ''}>Full-time</option>
          <option ${j.jobType === 'Internship' ? 'selected' : ''}>Internship</option>
          <option ${j.jobType === 'Contract' ? 'selected' : ''}>Contract</option>
        </select>
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Experience Level</label>
        <select name="experienceLevel" class="luxury-field">
          <option>Entry level</option>
          <option ${j.experienceLevel === 'Fresher' ? 'selected' : ''}>Fresher</option>
          <option ${j.experienceLevel === 'Mid level' ? 'selected' : ''}>Mid level</option>
        </select>
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Salary Range</label>
        <input name="salaryRange" class="luxury-field" value="${esc(j.salaryRange || '')}" placeholder="e.g. ₹6–9 LPA" />
      </div>
      <div>
        <label class="block font-semibold text-charcoal mb-1">Minimum CGPA Requirement</label>
        <input name="minCgpa" type="number" step="0.1" min="0" max="10" class="luxury-field" value="${esc(j.minCgpa || '')}" placeholder="7.0" />
      </div>
      <div class="sm:col-span-2">
        <label class="block font-semibold text-charcoal mb-1">Required Skills * (comma-separated)</label>
        <input name="requiredSkills" required class="luxury-field" value="${esc(j.requiredSkills || '')}" placeholder="Java, Spring Boot, MySQL, REST APIs" />
      </div>
      <div class="sm:col-span-2">
        <label class="block font-semibold text-charcoal mb-1">Role Description *</label>
        <textarea name="description" rows="4" required class="luxury-field" placeholder="Outline responsibilities, team structure, and qualifications...">${esc(j.description || '')}</textarea>
      </div>
      <div class="sm:col-span-2 flex justify-end gap-3 pt-3">
        <button type="button" data-action="close-modal" class="btn-luxury-secondary text-xs">Cancel</button>
        <button type="submit" class="btn-luxury-bronze text-xs">${job ? 'Save Changes' : 'Publish Opportunity'}</button>
      </div>
    </form>
  `);
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. GLOBAL EVENT DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
async function loadPage(page) {
  state.page = page;
  if (!state.token && page !== 'landing') {
    renderAuth('login');
    return;
  }
  if (page === 'landing') {
    renderLanding();
    return;
  }

  renderShell(`<div class="py-20 text-center text-taupe font-serif">Loading workspace…</div>`);
  try {
    if (page === 'overview') await renderOverview();
    else if (page === 'jobs') await renderJobs();
    else if (page === 'applications') await renderApplications();
    else if (page === 'profile') await renderProfile();
    else if (page === 'analysis') await renderAnalysis();
    else if (page === 'interview') renderInterview();
    else if (page === 'recruiter') await renderRecruiter();
    else if (page === 'admin') await renderAdmin();
    else await renderOverview();
  } catch (err) {
    setContent(`
      <div class="luxury-card p-10 text-center space-y-3">
        <div class="text-2xl text-terracotta">⚠️</div>
        <h3 class="font-serif text-lg font-semibold text-espresso">Unable to display this view</h3>
        <p class="text-xs text-taupe max-w-sm mx-auto">${esc(err.message)}</p>
        <button data-action="reload-page" class="btn-luxury-primary text-xs mt-3">Reload</button>
      </div>
    `);
  }
}

async function enterApp() {
  try {
    state.user = await api('/auth/me');
    await loadPage(state.page === 'landing' ? 'overview' : state.page);
  } catch (err) {
    state.token = '';
    state.user = null;
    localStorage.removeItem('cp_token');
    renderLanding();
  }
}

// Event Listeners
function initEventListeners() {
  document.addEventListener('click', async e => {
    // Navigation link
    const pageBtn = e.target.closest('[data-page]');
    if (pageBtn) {
      e.preventDefault();
      await loadPage(pageBtn.dataset.page);
      return;
    }

    // Modal backdrop click
    if (e.target.id === 'modal-root') {
      closeModal();
      return;
    }

    // Action buttons
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const action = actionBtn.dataset.action;

    if (action === 'go-home') {
      e.preventDefault();
      await loadPage('landing');
      return;
    }
    if (action === 'open-auth') {
      e.preventDefault();
      renderAuth(actionBtn.dataset.mode || 'login');
      return;
    }
    if (action === 'switch-auth') {
      renderAuth(actionBtn.dataset.mode);
      return;
    }
    if (action === 'fill-demo') {
      const email = actionBtn.dataset.email;
      const form = $('#auth-form');
      if (form) {
        form.email.value = email;
        form.password.value = 'CareerPilot@123';
      }
      return;
    }
    if (action === 'quick-demo') {
      const role = actionBtn.dataset.role;
      const email = role === 'student' ? 'student@careerpilot.ai' : role === 'recruiter' ? 'recruiter@careerpilot.ai' : 'admin@careerpilot.ai';
      renderAuth('login');
      setTimeout(() => {
        const form = $('#auth-form');
        if (form) {
          form.email.value = email;
          form.password.value = 'CareerPilot@123';
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }, 50);
      return;
    }
    if (action === 'logout') {
      state.token = '';
      state.user = null;
      state.analysis = null;
      localStorage.removeItem('cp_token');
      toast('Signed out from workspace.');
      renderLanding();
      return;
    }
    if (action === 'reload-page') {
      await loadPage(state.page);
      return;
    }
    if (action === 'run-analysis') {
      await loadPage('analysis');
      return;
    }
    if (action === 'apply') {
      try {
        await api('/applications', {
          method: 'POST',
          body: JSON.stringify({ jobId: Number(actionBtn.dataset.id), coverNote: '' })
        });
        toast('Application submitted successfully.');
        if (state.page === 'jobs') await renderJobs();
        else await renderOverview();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (action === 'filter-jobs') {
      state.filter = $('#job-search')?.value || '';
      state.locationFilter = $('#location-filter')?.value || '';
      await renderJobs();
      return;
    }
    if (action === 'new-job') {
      jobModal();
      return;
    }
    if (action === 'edit-job') {
      const j = state.jobs.find(x => String(x.id) === actionBtn.dataset.id);
      if (j) jobModal(j);
      return;
    }
    if (action === 'delete-job') {
      if (!confirm('Close this job posting? It will no longer receive new applications.')) return;
      try {
        await api('/jobs/' + actionBtn.dataset.id, { method: 'DELETE' });
        toast('Job posting closed.');
        await renderRecruiter();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (action === 'delete-resume') {
      if (!confirm('Remove your resume file from profile?')) return;
      try {
        await api('/profile/resume', { method: 'DELETE' });
        toast('Resume file removed.');
        await renderProfile();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (action === 'close-modal') {
      closeModal();
      return;
    }
    if (action === 'new-question') {
      try {
        const role = $('#interview-role')?.value || 'Software Engineer';
        state.question = await api('/interview/question?role=' + encodeURIComponent(role));
        $('#interview-question').textContent = state.question.question;
        $('#interview-topic').textContent = state.question.topic;
        $('#interview-answer').value = '';
        $('#interview-feedback').innerHTML = emptyState('🎤', 'Ready for Your Answer', 'Submit your answer to see feedback.');
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
    if (action === 'toggle-mobile-nav') {
      const drawer = $('#mobile-nav');
      if (drawer) drawer.classList.toggle('hidden');
      return;
    }
  });

  // Form Submissions
  document.addEventListener('submit', async e => {
    const form = e.target;

    if (form.id === 'auth-form') {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      try {
        const path = '/auth/' + (state.authMode === 'login' ? 'login' : 'register');
        const res = await api(path, { method: 'POST', body: JSON.stringify(payload) });
        state.token = res.token;
        state.user = res.user;
        localStorage.setItem('cp_token', res.token);
        toast(res.message || 'Authenticated successfully.');
        state.page = 'overview';
        await enterApp();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    if (form.id === 'profile-form') {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      ['graduationYear', 'cgpa', 'confidence'].forEach(k => {
        payload[k] = payload[k] === '' ? null : Number(payload[k]);
      });
      try {
        state.profile = await api('/profile/me', { method: 'PUT', body: JSON.stringify(payload) });
        toast('Profile updated successfully.');
        await renderProfile();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    if (form.id === 'job-form') {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      payload.minCgpa = payload.minCgpa === '' ? null : Number(payload.minCgpa);
      const id = form.dataset.id;
      try {
        await api('/jobs' + (id ? '/' + id : ''), {
          method: id ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        });
        closeModal();
        toast(id ? 'Job updated.' : 'Job published.');
        await renderRecruiter();
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }

    if (form.id === 'interview-form') {
      e.preventDefault();
      const answer = $('#interview-answer')?.value.trim();
      if (!answer) {
        toast('Please formulate an answer before submitting.', true);
        return;
      }
      try {
        const result = await api('/interview/evaluate', {
          method: 'POST',
          body: JSON.stringify({
            role: $('#interview-role')?.value || 'Software Engineer',
            question: state.question?.question || $('#interview-question')?.textContent || '',
            answer
          })
        });
        state.interviewResult = result;
        $('#interview-feedback').innerHTML = `
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-cream border border-champagne text-center">
              <div class="text-[10px] font-bold text-taupe uppercase tracking-wider">Concept Score</div>
              <div class="font-serif text-4xl font-bold text-espresso mt-1">${result.score}<span class="text-sm font-sans font-normal text-taupe">/100</span></div>
              <div class="text-xs font-semibold text-bronze mt-1">${esc(result.level)}</div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="font-semibold text-espresso">Key Concepts Covered:</div>
              <div class="flex flex-wrap gap-1.5">
                ${result.strengths.length ? result.strengths.map(s => badge(s, 'sage')).join('') : '<span class="text-taupe">None detected.</span>'}
              </div>

              <div class="font-semibold text-espresso pt-2">Suggestions to Address:</div>
              <div class="flex flex-wrap gap-1.5">
                ${result.improvements.length ? result.improvements.map(s => badge(s, 'champagne')).join('') : '<span class="text-taupe">Comprehensive coverage.</span>'}
              </div>
            </div>

            <p class="text-xs text-charcoal/80 font-light leading-relaxed pt-2 border-t border-champagne">
              ${esc(result.feedback)}
            </p>
          </div>
        `;
      } catch (err) {
        toast(err.message, true);
      }
      return;
    }
  });

  // Changes (Select status dropdown, search enter)
  document.addEventListener('change', async e => {
    if (e.target.dataset.action === 'update-status') {
      try {
        await api('/applications/' + e.target.dataset.id + '/status', {
          method: 'PATCH',
          body: JSON.stringify({ status: e.target.value })
        });
        toast('Application stage updated.');
      } catch (err) {
        toast(err.message, true);
        if (state.page === 'applications') await renderApplications();
        else if (state.page === 'recruiter') await renderRecruiter();
      }
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'job-search') {
      state.filter = e.target.value;
      renderJobs();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. APPLICATION INITIALIZATION
// ─────────────────────────────────────────────────────────────────────────────
async function boot() {
  initEventListeners();
  if (state.token) {
    await enterApp();
  } else {
    renderLanding();
  }
}

boot();
