# Nudge Tutorial System Setup Guide

This guide will help you integrate the new tutorial system into your Nudge application.

## 📁 Files Created

The tutorial system consists of these new components:

```
src/
├── contexts/
│   └── TutorialContext.js          # Main context provider
├── components/
│   ├── TutorialModal.jsx            # Modal-style tutorials
│   ├── TutorialHighlight.jsx        # Element highlighting tutorials
│   ├── TutorialManager.jsx          # Orchestrates tutorial display
│   ├── TutorialDashboard.jsx        # Tutorial management dashboard
│   └── examples/
│       └── TutorialIntegrationExamples.jsx  # Integration examples
```

## 🚀 Quick Setup (3 Steps)

### Step 1: Add TutorialProvider to your layout

Update `src/app/layout.js`:

```jsx
import { TutorialProvider } from "../contexts/TutorialContext";
import TutorialManager from "../components/TutorialManager";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased ${tanker.variable}`}>
        <ThemeProvider>
          <TutorialProvider>  {/* Add this */}
            <NotificationManager>
              <ClientLayout>
                <Navbar />
                <main className="min-h-screen mx-auto px-4 md:px-6 py-6">
                  {children}
                </main>
                <Footer />
                <FooterFocusBar />
                <TutorialManager />  {/* Add this */}
              </ClientLayout>
            </NotificationManager>
          </TutorialProvider>  {/* Close this */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 2: Add tutorial targets to your existing components

Add `data-tutorial` attributes to elements you want to highlight:

```jsx
// In your CharacterCard component
<div data-tutorial="personality-card" className="retro-console rounded-2xl p-6">
  {/* Your existing content */}
</div>

// In your FooterFocusBar component  
<div data-tutorial="focus-bar" className="fixed bottom-0 left-0 right-0 z-50">
  {/* Your existing content */}
</div>
```

### Step 3: Add tutorial triggers (optional)

Add tutorial trigger buttons where helpful:

```jsx
import { useTutorial } from '../contexts/TutorialContext';

function YourComponent() {
  const { startTutorial, completedTutorials } = useTutorial();
  
  return (
    <div>
      {/* Your content */}
      
      {/* Tutorial trigger for new users */}
      {!completedTutorials.has('focus_sessions') && (
        <button
          onClick={() => startTutorial('focus_sessions')}
          className="nav-pill nav-pill--cyan nav-pill--compact"
        >
          📖 Learn How This Works
        </button>
      )}
    </div>
  );
}
```

## 🎯 Tutorial Targets Reference

These `data-tutorial` attributes are configured in the system:

| Target ID | Description | Tutorial |
|-----------|-------------|----------|
| `personality-card` | Character/personality display | `onboarding` |
| `focus-bar` | Footer focus session bar | `onboarding` |
| `dashboard` | Main dashboard view | `onboarding` |
| `upload-zone` | ChatGPT history upload | `personality_test` |
| `questions-container` | Personality questions | `personality_test` |
| `profile-result` | Personality result display | `personality_test` |
| `session-templates` | Focus session templates | `focus_sessions` |
| `blocking-demo` | Distraction blocking demo | `focus_sessions` |
| `progress-graph` | Progress tracking charts | `focus_sessions` |
| `contract-options` | Contract type selection | `contracts` |
| `peer-panel` | Peer accountability panel | `contracts` |
| `contract-tracker` | Contract progress tracking | `contracts` |
| `leaderboard` | Community leaderboard | `leaderboard` |
| `challenges` | Community challenges | `leaderboard` |
| `badges` | Achievement badges | `leaderboard` |

## 🔧 Available Tutorials

The system includes these pre-configured tutorials:

1. **Onboarding** (Required) - Welcome and basic concepts
2. **Personality Test** (Required) - How personality assessment works
3. **Focus Sessions** (Optional) - Using the focus system
4. **Contracts** (Optional) - Commitment and accountability
5. **Leaderboard** (Optional) - Community features

## 🎨 Styling Integration

The tutorial components use your existing Nudge styles:

- **retro-console**: Main container styling
- **nav-pill**: Button styling with variants (--primary, --cyan, --outline, etc.)
- **component-surface**: Content surface styling
- **stat-bar**: Progress bar styling
- **font-tanker**: Your custom font
- **MBTI theme variables**: Personality-aware colors

## 📱 Tutorial Dashboard

Add a tutorial dashboard to any page:

```jsx
import TutorialDashboard from '../components/TutorialDashboard';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <TutorialDashboard />
    </div>
  );
}
```

## 🎮 Tutorial Hook Usage

```jsx
import { useTutorial } from '../contexts/TutorialContext';

function MyComponent() {
  const {
    // Tutorial state
    isActive,
    currentTutorial,
    completedTutorials,
    
    // Tutorial actions
    startTutorial,
    skipTutorial,
    
    // User preferences
    userPreferences,
    updatePreferences,
    
    // Utilities
    getTutorialProgress,
    getAvailableTutorials
  } = useTutorial();
  
  // Your component logic
}
```

## ⚙️ Configuration

### Adding New Tutorials

Edit `TUTORIAL_CONFIG` in `src/contexts/TutorialContext.js`:

```javascript
new_tutorial: {
  id: 'new_tutorial',
  title: 'New Feature Guide',
  description: 'Learn about our new feature',
  priority: 6,
  required: false,
  steps: [
    {
      id: 'step1',
      title: 'Step Title',
      content: 'Step description',
      target: '[data-tutorial="new-target"]',
      position: 'bottom'
    }
  ]
}
```

### Customizing Tutorial Appearance

The tutorials automatically adapt to your MBTI personality themes. No additional styling needed!

## 🔍 Troubleshooting

### Tutorial Not Showing
1. Check that TutorialProvider wraps your app
2. Verify TutorialManager is rendered in layout
3. Ensure target elements have correct `data-tutorial` attributes

### Styling Issues
1. Make sure your global CSS includes the MBTI theme variables
2. Check that components use existing Nudge style classes
3. Verify GSAP animations are working (required dependency)

### Performance
1. Tutorials only render when active (no performance impact when hidden)
2. Context uses localStorage for persistence
3. GSAP animations are optimized for smooth transitions

## 📈 Usage Examples

See `src/components/examples/TutorialIntegrationExamples.jsx` for complete integration examples showing:

- CharacterCard with tutorial integration
- FooterFocusBar with tutorial hints
- Dashboard with multiple tutorial targets
- Personality test flow with tutorials

## 🎉 You're All Set!

Once you've completed the setup:

1. New users will automatically see the onboarding tutorial
2. Tutorial triggers will appear for incomplete tutorials
3. Users can manage tutorials via the dashboard
4. The system respects user preferences and completion state

The tutorial system is fully integrated with your existing Nudge styling and personality-aware theming system!
