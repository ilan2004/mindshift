"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

export default function AuthOverlay({
  onStartTest,
  theme = "loader",
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const supabase = getSupabaseClient();

  // Check if user is already authenticated
  useEffect(() => {
    if (!supabase) return;

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get user metadata with error handling
        let profile = null;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username, gender, test_completed')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle() to avoid errors when no row exists
          
          if (error && !error.message.includes('no rows')) {
            console.warn('Error fetching profile on auth check:', error);
          }
          profile = data;
        } catch (err) {
          console.warn('Profile fetch failed:', err.message);
        }
        
        if (profile) {
          setUsername(profile.username);
          setGender(profile.gender);
          
          // If user already completed test, skip overlays and go straight to app
          if (profile.test_completed && profile.username && profile.gender) {
            try { localStorage.setItem("ms_intro_complete", "1"); } catch {}
            try { localStorage.setItem("ms_display_name", profile.username); } catch {}
            try { localStorage.setItem("ms_gender", profile.gender === "female" ? "W" : "M"); } catch {}
            // Notify app shell to switch to app stage immediately
            try { window.dispatchEvent(new CustomEvent('Nudge:auth:signed_in', { detail: { testCompleted: true, username: profile.username, gender: profile.gender } })); } catch {}
          }
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, gender, test_completed')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (error && !error.message.includes('no rows')) {
            console.warn('Error fetching profile in auth state change:', error);
          }
          
          if (profile?.test_completed) {
            try { localStorage.setItem("ms_intro_complete", "1"); } catch {}
            try { localStorage.setItem("ms_display_name", profile.username || ""); } catch {}
            try { localStorage.setItem("ms_gender", profile.gender === "female" ? "W" : "M"); } catch {}
            try { window.dispatchEvent(new CustomEvent('Nudge:auth:signed_in', { detail: { testCompleted: true, username: profile.username, gender: profile.gender } })); } catch {}
          }
        } catch (err) {
          console.warn('Profile fetch in auth state change failed:', err.message);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUsername("");
        setGender("");
        try { window.dispatchEvent(new Event('Nudge:auth:signed_out')); } catch {}
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log('Button clicked!', { isSignUp, email, password, username, gender });
    
    // Prevent multiple simultaneous submissions
    if (loading) return;
    
    if (!supabase) {
      console.error('Supabase client is null! Check environment variables.');
      setError('Authentication service not available. Check configuration.');
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up (do NOT immediately call sign-in to avoid Supabase 50s throttle)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim(),
              gender: gender
            }
          }
        });

        if (error) throw error;

        // If email confirmation is disabled, Supabase returns a session here
        // Proceed immediately. If no session, proceed optimistically using created user.
        const session = data?.session;
        if (session?.user) {
          setUser(session.user);
        } else if (data?.user) {
          setUser(data.user);
        }

        // Try to create profile, but don't block UX or throw on RLS errors
        if (data?.user) {
          try {
            // Add timeout to prevent hanging operations
            const profilePromise = supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: username.trim(),
                gender: gender,
                email: data.user.email
              });
            
            // Race against timeout to prevent hanging
            await Promise.race([
              profilePromise,
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Profile creation timeout')), 10000)
              )
            ]);
          } catch (profileError) {
            console.warn('Profile creation failed or timed out:', profileError.message);
          }
          
          // Dispatch signed_in event immediately after successful sign-up and profile creation
          try {
            window.dispatchEvent(new CustomEvent('Nudge:auth:signed_in', { 
              detail: { 
                testCompleted: false, 
                username: username.trim(), 
                gender: gender 
              } 
            })); 
          } catch {}
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data?.user) {
          setUser(data.user);
          // Fetch profile and notify shell for immediate stage switch if completed
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('username, gender, test_completed')
              .eq('id', data.user.id)
              .maybeSingle();
            
            if (error && !error.message.includes('no rows')) {
              console.warn('Error fetching profile in sign-in:', error);
            }
            
            if (profile?.test_completed) {
              try { localStorage.setItem("ms_intro_complete", "1"); } catch {}
              try { localStorage.setItem("ms_display_name", profile.username || ""); } catch {}
              try { localStorage.setItem("ms_gender", profile.gender === "female" ? "W" : "M"); } catch {}
              try { window.dispatchEvent(new CustomEvent('Nudge:auth:signed_in', { detail: { testCompleted: true, username: profile.username, gender: profile.gender } })); } catch {}
            }
          } catch (err) {
            console.warn('Profile fetch in sign-in failed:', err.message);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    
    try {
      await supabase.auth.signOut();
      // Clear local storage
      try { localStorage.removeItem("ms_intro_complete"); } catch {}
      try { localStorage.removeItem("ms_display_name"); } catch {}
      try { localStorage.removeItem("ms_gender"); } catch {}
      // Dispatch sign-out event immediately
      try { window.dispatchEvent(new Event('Nudge:auth:signed_out')); } catch {}
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign-out fails, dispatch the event to update UI
      try { window.dispatchEvent(new Event('Nudge:auth:signed_out')); } catch {}
    }
  };

  const canProceed = user && username.trim().length >= 2 && (gender === "male" || gender === "female");

  // If user is authenticated and has profile data, show test options
  if (user && username && gender) {
    return (
      <div className="fixed inset-0 z-[100]" style={{ background: "var(--surface)", color: "var(--text)" }}>
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8" style={{ fontFamily: "Tanker, sans-serif" }}>
              <h1 className="text-4xl md:text-5xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Nudge</h1>
              <p className="text-sm text-neutral-400 mt-1">Gentle Guidance. Better Habits.</p>
              <p className="mt-3 text-neutral-500">Welcome back, {username}!</p>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-neutral-500 mb-4">Ready to continue your journey?</p>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-neutral-400 hover:text-neutral-600 underline"
                >
                  Sign out
                </button>
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => onStartTest({ mode: "general", username, gender })}
                    className="px-4 py-2 rounded-[999px] nav-pill nav-pill--primary"
                  >
                    Take test – General questions
                  </button>
                  <button
                    type="button"
                    onClick={() => onStartTest({ mode: "history", username, gender })}
                    className="px-4 py-2 rounded-[999px] nav-pill nav-pill--amber"
                  >
                    Take test – ChatGPT history based
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication form
  return (
    <div className="fixed inset-0 z-[100]" style={{ background: "var(--surface)", color: "var(--text)" }}>
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8" style={{ fontFamily: "Tanker, sans-serif" }}>
            <h1 className="text-4xl md:text-5xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Nudge</h1>
            <p className="mt-3 text-neutral-500">Let's personalize your experience</p>
          </div>

          <div className="space-y-6">
            {/* Auth Mode Toggle */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => {
                  console.log('Sign In button clicked');
                  setIsSignUp(false);
                }}
                className={`px-4 py-2 rounded-[999px] ${!isSignUp ? "nav-pill nav-pill--primary" : "nav-pill"}`}
                style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 1000 }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log('Sign Up button clicked');
                  setIsSignUp(true);
                }}
                className={`px-4 py-2 rounded-[999px] ${isSignUp ? "nav-pill nav-pill--primary" : "nav-pill"}`}
                style={{ pointerEvents: 'auto', cursor: 'pointer', zIndex: 1000 }}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-neutral-500">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] outline-none"
                  style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-neutral-500">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-[14px] outline-none"
                  style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Show username and gender fields only for sign up */}
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm mb-2 text-neutral-500">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] outline-none"
                      style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-neutral-500">Gender</label>
                    <div className="flex gap-3">
                      {[
                        { key: "male", label: "Male" },
                        { key: "female", label: "Female" },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setGender(opt.key)}
                          className={`px-4 py-2 rounded-[999px] ${gender === opt.key ? "nav-pill nav-pill--cyan" : "nav-pill"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (isSignUp && (!username.trim() || !gender))}
                className={`w-full px-4 py-3 rounded-[14px] ${loading ? "opacity-50" : ""}`}
                style={{ background: "var(--color-green-900)", color: "white", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
              >
                {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
