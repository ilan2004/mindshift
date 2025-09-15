"use client";

import { useState, useEffect } from "react";
import HelpBulb from "./HelpBulb";

const DAYS_OF_WEEK = [
  { key: 'mon', label: 'Mon', full: 'Monday' },
  { key: 'tue', label: 'Tue', full: 'Tuesday' },
  { key: 'wed', label: 'Wed', full: 'Wednesday' },
  { key: 'thu', label: 'Thu', full: 'Thursday' },
  { key: 'fri', label: 'Fri', full: 'Friday' },
  { key: 'sat', label: 'Sat', full: 'Saturday' },
  { key: 'sun', label: 'Sun', full: 'Sunday' }
];

function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // HH:MM format
}

function formatTime12Hour(time24) {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

export default function CustomSessionScheduler({ personalityType }) {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    title: '',
    type: 'deep_reading',
    duration: 45,
    startTime: getCurrentTime(),
    endTime: '',
    selectedDays: [],
    url: '',
    active: true
  });
  const [showForm, setShowForm] = useState(false);

  // Load saved sessions
  useEffect(() => {
    try {
      const saved = localStorage.getItem('Nudge_scheduled_sessions');
      if (saved) {
        setSessions(JSON.parse(saved));
      }
    } catch {
      setSessions([]);
    }
  }, []);

  // Save sessions
  const saveSessions = (sessionList) => {
    try {
      localStorage.setItem('Nudge_scheduled_sessions', JSON.stringify(sessionList));
    } catch {}
  };

  // Calculate end time based on duration
  const updateEndTime = (startTime, duration) => {
    if (!startTime || !duration) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + parseInt(duration);
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  // Handle form changes
  const handleInputChange = (field, value) => {
    const updated = { ...newSession, [field]: value };
    
    if (field === 'startTime' || field === 'duration') {
      updated.endTime = updateEndTime(updated.startTime, updated.duration);
    }
    
    setNewSession(updated);
  };

  const handleDayToggle = (dayKey) => {
    const selectedDays = newSession.selectedDays.includes(dayKey)
      ? newSession.selectedDays.filter(d => d !== dayKey)
      : [...newSession.selectedDays, dayKey];
    
    setNewSession({ ...newSession, selectedDays });
  };

  const addSession = () => {
    if (!newSession.title.trim() || newSession.selectedDays.length === 0) return;
    
    const session = {
      id: Date.now() + Math.random(),
      ...newSession,
      title: newSession.title.trim(),
      url: newSession.url.trim(),
      createdAt: Date.now()
    };
    
    const updated = [...sessions, session];
    setSessions(updated);
    saveSessions(updated);
    
    // Reset form
    setNewSession({
      title: '',
      type: 'deep_reading',
      duration: 45,
      startTime: getCurrentTime(),
      endTime: '',
      selectedDays: [],
      url: '',
      active: true
    });
    setShowForm(false);
  };

  const removeSession = (sessionId) => {
    const updated = sessions.filter(s => s.id !== sessionId);
    setSessions(updated);
    saveSessions(updated);
  };

  const toggleSessionActive = (sessionId) => {
    const updated = sessions.map(s => 
      s.id === sessionId ? { ...s, active: !s.active } : s
    );
    setSessions(updated);
    saveSessions(updated);
  };

  const startSessionNow = (session) => {
    try {
      const payload = {
        template: session.type,
        duration: session.duration,
        url: session.url,
        startedAt: Date.now(),
        scheduled: true,
        scheduleId: session.id
      };
      localStorage.setItem("Nudge_last_template", JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("Nudge:focus:start_template", { detail: payload }));
    } catch {}
  };

  const testSessionQuiz = (session) => {
    if (!session.url.trim()) return;
    try {
      window.dispatchEvent(new CustomEvent("Nudge:blocker:quiz", { detail: { url: session.url } }));
    } catch {}
  };

  const isValidUrl = (url) => {
    if (!url.trim()) return true; // Optional URL
    return /(?:youtube\.com|youtu\.be|\.pdf)/i.test(url);
  };

  return (
    <div className="w-full max-w-4xl reveal-on-scroll">
      <div 
        data-tutorial="blocking-demo"
        className="relative rounded-xl p-4"
        style={{
          background: "var(--surface)",
          border: "2px solid var(--color-green-900)",
          boxShadow: "0 2px 0 var(--color-green-900)"
        }}
      >
        <HelpBulb 
          tutorialId="focus_sessions" 
          title="Smart Distraction Blocking & Session Scheduling"
          position="top-2 right-2"
        />
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <div className="font-tanker text-xl text-green tracking-widest">CUSTOM SESSIONS</div>
            <div className="text-xs text-neutral-600 mt-1">Schedule recurring focus sessions with content-gated quizzes</div>
          </div>
          <button 
            className="nav-pill"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ Add Session'}
          </button>
        </div>

        {/* Add Session Form */}
        {showForm && (
          <div className="mb-4 p-3 rounded-xl" style={{ background: "var(--color-green-900-20)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Session Title */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Session Name</label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Morning Deep Work"
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: "var(--surface)", 
                    border: "2px solid var(--color-green-900)", 
                    boxShadow: "0 1px 0 var(--color-green-900)" 
                  }}
                />
              </div>

              {/* Session Type */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Session Type</label>
                <select
                  value={newSession.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: "var(--surface)", 
                    border: "2px solid var(--color-green-900)", 
                    boxShadow: "0 1px 0 var(--color-green-900)" 
                  }}
                >
                  <option value="deep_reading">Deep Reading</option>
                  <option value="work_sprint">Work Sprint</option>
                  <option value="study_session">Study Session</option>
                  <option value="creative_work">Creative Work</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Duration (minutes)</label>
                <select
                  value={newSession.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: "var(--surface)", 
                    border: "2px solid var(--color-green-900)", 
                    boxShadow: "0 1px 0 var(--color-green-900)" 
                  }}
                >
                  <option value={25}>25 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-xs text-neutral-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newSession.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ 
                    background: "var(--surface)", 
                    border: "2px solid var(--color-green-900)", 
                    boxShadow: "0 1px 0 var(--color-green-900)" 
                  }}
                />
              </div>
            </div>

            {/* Content URL */}
            <div className="mt-3">
              <label className="block text-xs text-neutral-600 mb-1">Content URL (Optional)</label>
              <input
                type="url"
                value={newSession.url}
                onChange={(e) => handleInputChange('url', e.target.value)}
                placeholder="YouTube or PDF URL for content-gated quizzes"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ 
                  background: "var(--surface)", 
                  border: `2px solid ${isValidUrl(newSession.url) ? 'var(--color-green-900)' : 'var(--color-pink-500)'}`, 
                  boxShadow: "0 1px 0 var(--color-green-900)" 
                }}
              />
              {newSession.url && !isValidUrl(newSession.url) && (
                <div className="text-xs text-red-600 mt-1">Please provide a valid YouTube or PDF URL</div>
              )}
            </div>

            {/* Days Selection */}
            <div className="mt-3">
              <label className="block text-xs text-neutral-600 mb-2">Repeat on days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => handleDayToggle(day.key)}
                    className="nav-pill text-xs px-3 py-2"
                    style={{
                      background: newSession.selectedDays.includes(day.key) 
                        ? getPersonalityAccentColor(personalityType) 
                        : 'var(--surface)',
                      color: 'var(--color-green-900)'
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Summary */}
            {newSession.startTime && newSession.endTime && (
              <div className="mt-3 text-xs text-neutral-600">
                Session will run from {formatTime12Hour(newSession.startTime)} to {formatTime12Hour(newSession.endTime)}
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-4 flex gap-2">
              <button 
                className="nav-pill flex-1"
                onClick={addSession}
                disabled={!newSession.title.trim() || newSession.selectedDays.length === 0}
                style={{
                  background: (!newSession.title.trim() || newSession.selectedDays.length === 0) 
                    ? 'var(--color-neutral-300)' 
                    : 'var(--color-green-900)',
                  color: 'white'
                }}
              >
                Create Session
              </button>
            </div>
          </div>
        )}

        {/* Existing Sessions */}
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              <div className="text-sm">No custom sessions scheduled</div>
              <div className="text-xs mt-1">Create recurring focus sessions with automatic content-gated quizzes</div>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                className="p-3 rounded-xl border-2"
                style={{
                  background: session.active ? "var(--surface)" : "var(--color-neutral-100)",
                  borderColor: session.active ? "var(--color-green-900)" : "var(--color-neutral-300)",
                  boxShadow: session.active ? "0 2px 0 var(--color-green-900)" : "none",
                  opacity: session.active ? 1 : 0.7
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{session.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: getPersonalityAccentColor(personalityType), color: 'var(--color-green-900)' }}>
                        {session.type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-neutral-600 space-y-1">
                      <div>
                        📅 {session.selectedDays.map(d => DAYS_OF_WEEK.find(day => day.key === d)?.label).join(', ')} 
                        • ⏰ {formatTime12Hour(session.startTime)} - {formatTime12Hour(session.endTime)}
                        • ⌛ {session.duration}min
                      </div>
                      {session.url && (
                        <div className="flex items-center gap-1">
                          {/youtube/i.test(session.url) ? '📺' : '📄'} Content-gated quiz enabled
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      className="nav-pill text-xs px-2 py-1"
                      onClick={() => startSessionNow(session)}
                      title="Start session now"
                    >
                      ▶️ Start
                    </button>
                    
                    {session.url && (
                      <button
                        className="nav-pill text-xs px-2 py-1"
                        style={{ background: 'var(--color-blue-400)', color: 'var(--color-green-900)' }}
                        onClick={() => testSessionQuiz(session)}
                        title="Preview quiz"
                      >
                        🧠 Quiz
                      </button>
                    )}
                    
                    <button
                      className="nav-pill text-xs px-2 py-1"
                      onClick={() => toggleSessionActive(session.id)}
                      style={{
                        background: session.active ? 'var(--color-amber-400)' : 'var(--color-green-900)',
                        color: session.active ? 'var(--color-green-900)' : 'white'
                      }}
                    >
                      {session.active ? '⏸️' : '▶️'}
                    </button>
                    
                    <button
                      className="nav-pill text-xs px-2 py-1"
                      style={{ background: 'var(--color-pink-500)', color: 'white' }}
                      onClick={() => removeSession(session.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for personality colors
function getPersonalityAccentColor(personalityType) {
  if (!personalityType) return 'var(--color-green-900)';
  
  const colors = {
    INTJ: 'var(--color-purple-400)',
    INTP: 'var(--color-cyan-200)', 
    ENTJ: 'var(--color-orange-500)',
    ENTP: 'var(--color-pink-500)',
    INFJ: 'var(--color-blue-400)',
    INFP: 'var(--color-pink-200)',
    ENFJ: 'var(--color-teal-300)', 
    ENFP: 'var(--color-amber-400)',
    ISTJ: 'var(--color-blue-400)',
    ISFJ: 'var(--color-pink-200)',
    ESTJ: 'var(--color-orange-500)',
    ESFJ: 'var(--color-pink-500)', 
    ISTP: 'var(--color-teal-300)',
    ISFP: 'var(--color-lilac-300)',
    ESTP: 'var(--color-amber-400)',
    ESFP: 'var(--color-yellow-200)'
  };
  
  return colors[personalityType.toUpperCase()] || 'var(--color-green-900)';
}
