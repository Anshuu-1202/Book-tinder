import React, { useState, useEffect } from 'react';
import { BookMarked, LogOut, User, Sparkles, Heart, Search, LibraryIcon, Flame } from 'lucide-react';
import Auth from './components/Auth';
import Swiper from './components/Swiper';
import Library from './components/Library';
import SearchBar from './components/SearchBar';
import AIRecommendations from './components/AIRecommendations';
import { curatedBooks, genres } from './booksData';
import { 
  getCurrentUserSession, 
  logoutUser, 
  getUserSwipes, 
  saveUserSwipe, 
  resetUserSwipe 
} from './storage';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getCurrentUserSession());
  const [activePage, setActivePage] = useState('swipe'); // 'swipe' | 'library' | 'search' | 'recommendations'
  const [activeGenre, setActiveGenre] = useState('All Genres');
  const [userSwipes, setUserSwipes] = useState({});
  const [booksList, setBooksList] = useState(curatedBooks);

  // Load user data on authentication state change
  useEffect(() => {
    if (currentUser) {
      setUserSwipes(getUserSwipes(currentUser));
      
      // Load custom search-added books from localStorage
      const storedCustom = localStorage.getItem(`bookmatch_custom_books_${currentUser.toLowerCase()}`);
      if (storedCustom) {
        const customBooks = JSON.parse(storedCustom);
        // Merge without duplicates
        const merged = [...curatedBooks];
        customBooks.forEach(cb => {
          if (!merged.some(b => b.id === cb.id)) {
            merged.push(cb);
          }
        });
        setBooksList(merged);
      } else {
        setBooksList(curatedBooks);
      }
    }
  }, [currentUser]);

  // Synchronize localStorage storage events (e.g. reviews or edits inside details)
  useEffect(() => {
    const handleStorageChange = () => {
      if (currentUser) {
        setUserSwipes(getUserSwipes(currentUser));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser]);

  const handleLoginSuccess = (username) => {
    setCurrentUser(username);
    setActivePage('swipe');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  const handleSwipe = (bookId, direction) => {
    let actionType = 'skipped'; // left swipe default
    if (direction === 'right') actionType = 'want'; // right swipe
    if (direction === 'up') actionType = 'read'; // up swipe/mark read

    saveUserSwipe(currentUser, bookId, actionType);
    setUserSwipes(getUserSwipes(currentUser));
  };

  const handleResetSwipe = (bookId) => {
    resetUserSwipe(currentUser, bookId);
    setUserSwipes(getUserSwipes(currentUser));
  };

  const handleResetAllSwipes = () => {
    const userKey = currentUser.toLowerCase();
    const swipes = localStorage.getItem('bookmatch_swipes');
    if (swipes) {
      const swipesObj = JSON.parse(swipes);
      delete swipesObj[userKey];
      localStorage.setItem('bookmatch_swipes', JSON.stringify(swipesObj));
      setUserSwipes({});
    }
  };

  // Add custom books fetched via Open Library search
  const handleAddCustomBook = (newBook) => {
    const userKey = currentUser.toLowerCase();
    const storedCustom = localStorage.getItem(`bookmatch_custom_books_${userKey}`);
    const customList = storedCustom ? JSON.parse(storedCustom) : [];

    if (!customList.some(b => b.id === newBook.id)) {
      customList.push(newBook);
      localStorage.setItem(`bookmatch_custom_books_${userKey}`, JSON.stringify(customList));
      
      // Append to local state list immediately
      setBooksList(prev => {
        if (prev.some(b => b.id === newBook.id)) return prev;
        return [...prev, newBook];
      });
    }
  };

  // Redirect to Auth if not logged in
  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Premium Frosted Header */}
      <header className="app-header">
        <div className="header-logo-section" onClick={() => setActivePage('swipe')}>
          <div className="logo-glow-wrapper">
            <BookMarked className="logo-icon" size={24} />
          </div>
          <span className="logo-text">BookMatch</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav">
          <button 
            className={`nav-link ${activePage === 'swipe' ? 'active' : ''}`}
            onClick={() => setActivePage('swipe')}
          >
            <Flame size={18} className="nav-icon" />
            Swipe Deck
          </button>
          <button 
            className={`nav-link ${activePage === 'library' ? 'active' : ''}`}
            onClick={() => setActivePage('library')}
          >
            <LibraryIcon size={18} className="nav-icon" />
            My Library
          </button>
          <button 
            className={`nav-link ${activePage === 'search' ? 'active' : ''}`}
            onClick={() => setActivePage('search')}
          >
            <Search size={18} className="nav-icon" />
            Search Library
          </button>
          <button 
            className={`nav-link ${activePage === 'recommendations' ? 'active' : ''}`}
            onClick={() => setActivePage('recommendations')}
          >
            <Sparkles size={18} className="nav-icon" />
            AI Partner
          </button>
        </nav>

        {/* User Session Profile & Logout */}
        <div className="user-profile-controls">
          <div className="user-indicator">
            <User size={14} className="user-avatar-icon" />
            <span className="username-display">{currentUser}</span>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Dynamic Sub-header for Genre Selector (Only active on swiping desk) */}
      {activePage === 'swipe' && (
        <div className="genre-bar-container animate-slide-in">
          <span className="genre-bar-label">Current Feed Filter:</span>
          <div className="genre-pills">
            {genres.map(genre => (
              <button
                key={genre}
                className={`genre-pill ${activeGenre === genre ? 'active' : ''}`}
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Pages Router Content */}
      <main className="app-main-content">
        {activePage === 'swipe' && (
          <Swiper 
            books={booksList} 
            activeGenre={activeGenre} 
            onSwipe={handleSwipe}
            currentUser={currentUser}
            userSwipes={userSwipes}
            onResetAllSwipes={handleResetAllSwipes}
          />
        )}
        
        {activePage === 'library' && (
          <Library 
            books={booksList} 
            userSwipes={userSwipes} 
            onResetSwipe={handleResetSwipe}
            onSwipe={handleSwipe}
            currentUser={currentUser}
          />
        )}

        {activePage === 'search' && (
          <SearchBar 
            onAddCustomBook={handleAddCustomBook}
            userSwipes={userSwipes}
            onSwipe={handleSwipe}
            currentUser={currentUser}
          />
        )}

        {activePage === 'recommendations' && (
          <AIRecommendations 
            books={booksList} 
            userSwipes={userSwipes}
          />
        )}
      </main>

      {/* Simple Footer */}
      <footer className="app-footer">
        <p>© 2026 BookMatch. Design for book worms and swipe lovers.</p>
      </footer>
    </div>
  );
}
