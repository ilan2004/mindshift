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
    <section className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
        <button
          onClick={() => setShowAddFriends(true)}
          className="nav-pill nav-pill--cyan"
        >
          Add Friends
        </button>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-pill ${
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Friends</h2>
              <button 
                onClick={() => {
                  setShowAddFriends(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name..."
                  className="flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Search Results</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {searchResults.map(user => (
                    <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatar || user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                      {friends.some(f => f.id === user.id) ? (
                        <span className="text-sm text-gray-500">Already added</span>
                      ) : (
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Friends List */}
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Your Friends</h3>
              {friends.length === 0 ? (
                <p className="text-gray-500 text-sm">No friends added yet. Search and add friends above.</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {friends.map(friend => (
                    <div key={friend.id} className="flex justify-between items-center p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {friend.avatar || friend.name.charAt(0)}
                        </div>
                        <span>{friend.name}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
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
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <LeaderboardTable 
            rows={leaderboardData} 
            type={activeTab} 
          />
        )}
      </div>

      <p className="mt-4 text-sm text-gray-500 text-center">
        Showing {leaderboardData.length} users • Updated just now
      </p>
    </section>
  );
}
