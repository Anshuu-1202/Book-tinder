import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Loader2, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';

export default function AIRecommendations({ books, userSwipes }) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [analysisText, setAnalysisText] = useState('');

  // Categorize books from userSwipes
  const wantBooks = books.filter(b => userSwipes[b.id] === 'want');
  const readBooks = books.filter(b => userSwipes[b.id] === 'read');
  const skippedBooks = books.filter(b => userSwipes[b.id] === 'skipped');

  // Trigger AI generation
  const generateRecommendations = () => {
    setLoading(true);
    setRecommendations(null);
    setAnalysisText('Analyzing your reading shelf...');

    // Simulate multi-step AI thinking steps
    setTimeout(() => {
      setAnalysisText('Finding matching literary themes and genres...');
      setTimeout(() => {
        setAnalysisText('Generating personalized suggestions...');
        setTimeout(() => {
          processRecommendationLogic();
        }, 800);
      }, 800);
    }, 800);
  };

  const processRecommendationLogic = () => {
    // 1. Get list of books the user hasn't swiped yet
    const unswipedBooks = books.filter(b => !userSwipes[b.id]);

    if (wantBooks.length === 0 && readBooks.length === 0) {
      setRecommendations({
        profileSummary: "Your reading profile is empty right now.",
        recs: [],
        advice: "Start swiping right (Want to Read) or up (Already Read) on the cards deck to train your AI Book Companion! The more you swipe, the better my recommendations will be."
      });
      setLoading(false);
      return;
    }

    // 2. Tally user's liked genres
    const likedGenres = {};
    [...wantBooks, ...readBooks].forEach(b => {
      likedGenres[b.genre] = (likedGenres[b.genre] || 0) + 1;
    });

    // Sort genres by preference
    const favoriteGenre = Object.keys(likedGenres).sort((a, b) => likedGenres[b] - likedGenres[a])[0];

    // 3. Find matching recommendation candidates
    let candidates = unswipedBooks.filter(b => b.genre === favoriteGenre);
    
    // If no candidate from favorite genre, fallback to any unswiped book
    if (candidates.length === 0) {
      candidates = unswipedBooks;
    }

    // Slice to top 2 recommendations
    const selectedRecs = candidates.slice(0, 2).map(book => {
      // Build smart reason text
      let reason = '';
      if (book.genre === favoriteGenre) {
        reason = `Matches your preference for ${favoriteGenre} (seen in books like "${(wantBooks[0] || readBooks[0]).title}").`;
      } else {
        reason = `Expands your reading profile into ${book.genre}, matching your interest in high-quality storytelling.`;
      }
      return {
        ...book,
        reason: reason
      };
    });

    setRecommendations({
      profileSummary: `Your current favorite genre is ${favoriteGenre || 'General Fiction'}. You enjoy books that explore ${
        favoriteGenre === 'Sci-Fi' ? 'futuristic worlds and technology' :
        favoriteGenre === 'Classics' ? 'timeless social dynamics and deep characters' :
        favoriteGenre === 'Mystery' ? 'intricate puzzles and suspenseful investigations' :
        favoriteGenre === 'Fantasy' ? 'magical realms and epic adventures' :
        'compelling stories and narratives'
      }.`,
      recs: selectedRecs,
      advice: selectedRecs.length > 0 
        ? "These suggestions are tailored to your swiped library. Check them out in the Swiper deck or search for them directly to read comments!"
        : "You've swiped all the books in our database! Try resetting your history in the Library to swipe again."
    });
    setLoading(false);
  };

  // Generate automatically on mount if shelves change
  useEffect(() => {
    generateRecommendations();
  }, [userSwipes]);

  return (
    <div className="ai-recommendations-section animate-fade-in">
      <div className="ai-header">
        <Sparkles className="ai-spark-icon animate-pulse" size={24} />
        <h3>AI Reading Partner</h3>
      </div>

      <div className="ai-card-content">
        {loading ? (
          <div className="ai-loading-container">
            <Loader2 className="animate-spin text-primary" size={28} style={{ marginBottom: '12px' }} />
            <p className="ai-loading-text">{analysisText}</p>
          </div>
        ) : recommendations ? (
          <div className="ai-results animate-fade-in">
            <div className="profile-analysis-box">
              <h5>Reading Profile Analysis:</h5>
              <p>{recommendations.profileSummary}</p>
            </div>

            {recommendations.recs.length > 0 ? (
              <div className="ai-suggestions-list">
                <h5>My Suggestions For You:</h5>
                {recommendations.recs.map(rec => (
                  <div key={rec.id} className="ai-suggestion-item">
                    <div className="suggestion-top">
                      <div className="suggestion-details">
                        <h6>{rec.title}</h6>
                        <p>by {rec.author} • <span className="text-primary">{rec.genre}</span></p>
                      </div>
                    </div>
                    <p className="suggestion-reason">
                      <strong>Why this:</strong> {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ai-empty-warning">
                <AlertCircle size={20} className="text-muted" />
                <p>No new suggestions available in the current category.</p>
              </div>
            )}

            <div className="ai-advice-footer">
              <p>{recommendations.advice}</p>
            </div>
            
            <button 
              className="refresh-ai-btn"
              onClick={generateRecommendations}
            >
              <RefreshCw size={12} style={{ marginRight: '6px' }} />
              Recalculate Preferences
            </button>
          </div>
        ) : (
          <div className="ai-initial-state">
            <p>Click below to calculate custom reading recommendations.</p>
            <button className="btn-primary" onClick={generateRecommendations}>
              Consult AI Partner
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
