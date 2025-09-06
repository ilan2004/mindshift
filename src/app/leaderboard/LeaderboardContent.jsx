'use client';

import { useState, useEffect } from 'react';
import LeaderboardTable from "@/components/LeaderboardTable";
import { getLeaderboard, searchUsers } from "@/lib/api";

const tabs = [
  { id: 'screenTime', name: 'Screen Time', sortBy: 'screenTime' },
  { id: 'streak', name: 'Streak', sortBy: 'streak' },
  { id: 'focusHours', name: 'Focus Hours', sortBy: 'focusHours' },
];

export default function LeaderboardContent() {
  const [activeTab, setActiveTab] = useState('screenTime');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFriends, setShowAddFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load data for the active tab
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getLeaderboard(activeTab);
        setLeaderboardData(data || []);
        // In a real app, you would fetch friends list from your API
        // const friendsData = await fetchFriends();
        // setFriends(friendsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [activeTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // In a real app, you would call your search API endpoint
      // const results = await searchUsers(searchQuery);
      // For now, we'll filter from the existing users
      const results = leaderboardData.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = (userId) => {
    // In a real app, you would call your API to add a friend
    // await addFriend(userId);
    const friendToAdd = leaderboardData.find(user => user.id === userId);
    if (friendToAdd && !friends.some(f => f.id === userId)) {
      setFriends([...friends, friendToAdd]);
    }
  };

  const handleRemoveFriend = (userId) => {
    // In a real app, you would call your API to remove a friend
    // await removeFriend(userId);
    setFriends(friends.filter(friend => friend.id !== userId));
  };

  return (
    <section className="max-w-6xl mx-auto px-3 md:px-6 py-4 md:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" style={{ fontFamily: "Tanker, sans-serif" }}>
          Leaderboard
        </h1>
        <button
          onClick={() => setShowAddFriends(true)}
          className="nav-pill nav-pill--cyan w-full sm:w-auto"
        >
          Add Friends
        </button>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 md:mb-8">
        <nav className="flex flex-wrap gap-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-pill flex-1 sm:flex-none ${
                activeTab === tab.id
                  ? 'nav-pill--cyan'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Friends Modal */}
      {showAddFriends && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl p-4 md:p-6 w-full max-w-lg mx-4" style={{ border: "2px solid var(--color-green-900)", boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)" }}>
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "Tanker, sans-serif" }}>Add Friends</h2>
              <button 
                onClick={() => {
                  setShowAddFriends(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="nav-pill w-8 h-8 flex items-center justify-center p-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-4 md:mb-6">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name..."
                  className="flex-1 px-4 py-3 rounded-[999px] text-sm"
                  style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 3px 0 var(--color-green-900)" }}
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="nav-pill nav-pill--primary w-full sm:w-auto"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-4 md:mb-6">
                <h3 className="font-semibold mb-3" style={{ fontFamily: "Tanker, sans-serif" }}>Search Results</h3>
                <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "var(--color-green-900)", color: "white" }}>
                          {user.avatar || user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                      {friends.some(f => f.id === user.id) ? (
                        <span className="text-sm text-gray-500 self-start sm:self-center">Already added</span>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          className="nav-pill nav-pill--primary w-full sm:w-auto"
                        >
                          Add Friend
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div>
              <h3 className="font-semibold mb-3" style={{ fontFamily: "Tanker, sans-serif" }}>Your Friends</h3>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No friends added yet. Search and add friends above.</p>
              ) : (
                <div className="space-y-3 max-h-48 md:max-h-60 overflow-y-auto">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-3 rounded-xl" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)" }}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "var(--color-green-900)", color: "white" }}>
                          {friend.avatar || friend.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{friend.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="nav-pill nav-pill--accent w-full sm:w-auto"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--surface)", border: "2px solid var(--color-green-900)", boxShadow: "0 4px 0 var(--color-green-900), 0 8px 24px var(--color-green-900-20)" }}>
        {isLoading ? (
          <div className="p-6 md:p-8 text-center text-gray-500">
            <div className="animate-pulse">Loading leaderboard...</div>
          </div>
        ) : (
          <LeaderboardTable 
            rows={leaderboardData} 
            type={activeTab} 
          />
        )}
      </div>

      <p className="mt-4 md:mt-6 text-sm text-gray-500 text-center">
        Showing {leaderboardData.length} users • Updated just now
      </p>
    </section>
  );
}
