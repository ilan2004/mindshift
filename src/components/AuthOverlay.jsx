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
        // Get user metadata
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, gender, test_completed')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUsername(profile.username);
          setGender(profile.gender);
          
          // Short-circuit: If user already completed test, skip to app immediately
          if (profile.test_completed && profile.username && profile.gender) {
            try { localStorage.setItem("ms_intro_complete", "1"); } catch {}
            // Call onStartTest to advance to app flow
            onStartTest?.({ mode: "general", username: profile.username, gender: profile.gender });
          }
        }
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUsername("");
        setGender("");
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) return;

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
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username: username.trim(),
                gender: gender,
                email: data.user.email
              });
          } catch {}
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data?.user) setUser(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  const canProceed = user && username.trim().length >= 2 && (gender === "male" || gender === "female");

  // If user is authenticated and has profile data, show test options
  if (user && username && gender) {
    return (
      <div className="fixed inset-0 z-[100]" style={{ background: "var(--surface)", color: "var(--text)" }}>
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8" style={{ fontFamily: "Tanker, sans-serif" }}>
              <h1 className="text-4xl md:text-5xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Mind / Shift</h1>
              <p className="mt-2 text-neutral-500">Welcome back, {username}!</p>
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
                <div className="flex flex-wrap gap-3">
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
            <h1 className="text-4xl md:text-5xl tracking-tight" style={{ color: "var(--color-green-900)" }}>Mind / Shift</h1>
            <p className="mt-2 text-neutral-500">Let's personalize your experience</p>
          </div>

          <div className="space-y-6">
            {/* Auth Mode Toggle */}
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`px-4 py-2 rounded-[999px] ${!isSignUp ? "nav-pill nav-pill--primary" : "nav-pill"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`px-4 py-2 rounded-[999px] ${isSignUp ? "nav-pill nav-pill--primary" : "nav-pill"}`}
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
