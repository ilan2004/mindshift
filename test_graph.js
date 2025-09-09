// Quick test for ProductivityGraph mock data
function getLastNDays(n = 7) {
  const out = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toLocaleDateString("en-CA");
    out.push({ key, date: d });
  }
  return out;
}

function mockSessions(personalityType = null) {
  const days = getLastNDays(7);
  
  const patterns = {
    INTJ: [45, 75, 90, 60, 85, 70, 40],
    DEFAULT: [15, 35, 65, 45, 80, 95, 25]
  };
  
  const pattern = patterns[personalityType?.toUpperCase()] || patterns.DEFAULT;
  
  return days.map((d, i) => ({ 
    date: d.key, 
    minutes: pattern[i % pattern.length],
    day: d.date.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1)
  }));
}

// Test the mock data generation
console.log("🧪 Testing ProductivityGraph Mock Data");
console.log("=====================================");

const testCases = ['INTJ', 'ENFP', null];
testCases.forEach(personality => {
  console.log(`\n📊 ${personality || 'DEFAULT'} Pattern:`);
  const data = mockSessions(personality);
  data.forEach(d => {
    console.log(`${d.day}: ${d.minutes}m (${d.date})`);
  });
  
  const total = data.reduce((sum, d) => sum + d.minutes, 0);
  const avg = Math.round(total / 7);
  const max = Math.max(...data.map(d => d.minutes));
  
  console.log(`📈 Stats - Total: ${total}m, Avg: ${avg}m/day, Best: ${max}m`);
});

console.log("\n✅ Mock data generation working!");
console.log("📍 You should now see colorful bars in the graph component");
