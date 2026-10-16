// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/api.js';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and sync with backend on initial load
  useEffect(() => {
    const activeTabSessionId = sessionStorage.getItem('activeTabSessionId');
    const storedUser = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    // Tab isolation check: If window.name is missing or does not match this tab's session,
    // it means this is a newly opened tab or a cloned tab. Require re-login!
    if (!window.name || !activeTabSessionId || window.name !== activeTabSessionId) {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('activeTabSessionId');
      window.name = '';
      setUser(null);
      setLoading(false);
      return;
    }

    // Set up BroadcastChannel to detect duplicated tabs (where window.name might have been cloned)
    let channel;
    try {
      channel = new BroadcastChannel('ak_auth_tab_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PING_TAB' && event.data?.tabId === window.name) {
          // Another tab is claiming this same tabId! Inform them it is already active in this tab.
          channel.postMessage({ type: 'PONG_TAB_EXISTS', tabId: window.name });
        } else if (event.data?.type === 'PONG_TAB_EXISTS' && event.data?.tabId === window.name) {
          // We are a duplicated tab! Clear session so this tab requires re-login.
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('activeTabSessionId');
          window.name = '';
          setUser(null);
          setLoading(false);
        }
      };
      // Send ping to see if another tab already owns this tabId
      channel.postMessage({ type: 'PING_TAB', tabId: window.name });
    } catch {
      // BroadcastChannel fallback silently if not supported in the browser
    }

    const syncUser = async () => {
      if (storedUser && token) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me?userId=${parsedUser.userId}`);
          const contentType = res.headers.get("content-type") || "";
          
          if (!res.ok || !contentType.includes("application/json")) {
            setLoading(false);
            return;
          }
          
          const freshUser = await res.json();
          setUser(freshUser);
          sessionStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Failed to sync user data', error);
        }
      }
      setLoading(false);
    };

    syncUser();

    return () => {
      if (channel) {
        channel.close();
      }
    };
  }, []);

  // Login function to save data globally and to sessionStorage
  const login = (userData, token) => {
    // Generate a unique session ID tied strictly to this browser tab's window.name
    const tabSessionId = 'tab_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    window.name = tabSessionId;
    sessionStorage.setItem('activeTabSessionId', tabSessionId);
    sessionStorage.setItem('user', JSON.stringify(userData));
    sessionStorage.setItem('token', token);
    setUser(userData);
  };

  // Logout function to clear data
  const logout = async () => {
    if (user && user.userId) {
      try {
        await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.userId }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('activeTabSessionId');
    window.name = '';
  };

  const updateUser = async (newUserData) => {
    setUser(newUserData);
    sessionStorage.setItem('user', JSON.stringify(newUserData));
    
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUserData)
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      // Only persist to local state & storage if backend was successful
      setUser(data.user);
      sessionStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      console.error('Failed to sync profile to server:', error);
      // Revert to old user state if backend failed
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
