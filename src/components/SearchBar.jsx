import React, { useState } from 'react';
import { Search, Loader2, Plus, Heart, Check, Info, ArrowLeft } from 'lucide-react';
import { getBookReviews, addOrUpdateBookReview } from '../storage';

export default function SearchBar({ onAddCustomBook, userSwipes, onSwipe, currentUser }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [expandedBookId, setExpandedBookId] = useState(null);

  // Search reviews state
  const [reviews, setReviews] = useState({});
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setExpandedBookId(null);

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
      );
      if (!response.ok) {
        throw new Error('Search failed. Please try again.');
      }
      const data = await response.json();
      
      if (!data.docs || data.docs.length === 0) {
        setError('No books found. Try a different search query.');
        return;
      }

      // Map Open Library search results to our book schema
      const mappedBooks = data.docs.map(doc => {
        const id = `ol_${doc.key.split('/').pop()}`;
        return {
          id: id,
          title: doc.title,
          author: doc.author_name ? doc.author_name[0] : 'Unknown Author',
          genre: doc.subject ? doc.subject[0] : 'Fiction',
          description: doc.first_sentence ? doc.first_sentence[0] : (doc.subject ? `A book about ${doc.subject.slice(0, 4).join(', ')}.` : 'No description available for this edition.'),
          pages: doc.number_of_pages_median || 250,
          year: doc.first_publish_year || 'N/A',
          coverId: doc.cover_i || null
        };
      });

      setResults(mappedBooks);
    } catch (err) {
      setError(err.message || 'Something went wrong while searching.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAction = (book, type) => {
    // Add book metadata to the app's global state
    onAddCustomBook(book);
    // Apply swipe action immediately
    onSwipe(book.id, type);
  };

  const toggleDetails = (bookId) => {
    if (expandedBookId === bookId) {
      setExpandedBookId(null);
    } else {
      setExpandedBookId(bookId);
      // Fetch reviews
      setReviews(prev => ({
        ...prev,
        [bookId]: getBookReviews(bookId)
      }));
    }
  };

  const postSearchBookReview = (e, book) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    // Add book to custom list so review works
    onAddCustomBook(book);
    // Submit review
    addOrUpdateBookReview(book.id, currentUser, newRating, newReviewText);
    // Mark as read
    onSwipe(book.id, 'up');

    // Reset review form and reload reviews
    setNewReviewText('');
    setNewRating(5);
    setReviews(prev => ({
      ...prev,
      [book.id]: getBookReviews(book.id)
    }));
  };

  return (
    <div className="search-section">
      <div className="search-box-container">
        <form onSubmit={handleSearch} className="search-form-row">
          <div className="search-input-wrapper">
            <Search className="search-input-icon" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search books by title, author, or keyword..."
              required
            />
          </div>
          <button type="submit" className="search-submit-btn" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Search'}
          </button>
        </form>
      </div>

      {loading && (
        <div className="search-loading-state">
          <Loader2 className="animate-spin-slow text-primary" size={36} />
          <p>Scouring the Open Library shelves...</p>
        </div>
      )}

      {error && <div className="search-error-message">{error}</div>}

      {results.length > 0 && (
        <div className="search-results-grid">
          {results.map(book => {
            const swipeState = userSwipes[book.id];
            const isExpanded = expandedBookId === book.id;
            const bookReviews = reviews[book.id] || [];

            return (
              <div key={book.id} className={`search-result-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="card-primary-layout">
                  {book.coverId ? (
                    <img 
                      src={`https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`} 
                      alt={book.title}
                      className="result-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="result-cover-placeholder">📖</div>
                  )}

                  <div className="result-details">
                    <h4>{book.title}</h4>
                    <p className="result-author">by {book.author}</p>
                    <div className="result-meta-tags">
                      <span className="meta-tag">📅 {book.year}</span>
                      <span className="meta-tag">📄 {book.pages} pgs</span>
                      <span className="meta-tag font-genre">{book.genre}</span>
                    </div>

                    {/* Action Panel */}
                    <div className="result-actions">
                      {swipeState ? (
                        <div className="swipe-status-indicator">
                          {swipeState === 'want' && <span className="status-badge text-want">❤ Want to Read</span>}
                          {swipeState === 'read' && <span className="status-badge text-read">✓ Already Read</span>}
                          {swipeState === 'skipped' && <span className="status-badge text-skip">✕ Skipped</span>}
                        </div>
                      ) : (
                        <div className="actions-button-row">
                          <button 
                            className="action-btn want-btn"
                            onClick={() => handleAddAction(book, 'right')}
                            title="Add to Want to Read"
                          >
                            <Heart size={14} style={{ marginRight: '4px' }} /> Want
                          </button>
                          <button 
                            className="action-btn read-btn"
                            onClick={() => handleAddAction(book, 'up')}
                            title="Mark as Read"
                          >
                            <Check size={14} style={{ marginRight: '4px' }} /> Read
                          </button>
                        </div>
                      )}

                      <button 
                        className="info-toggle-btn"
                        onClick={() => toggleDetails(book.id)}
                      >
                        <Info size={14} style={{ marginRight: '4px' }} />
                        {isExpanded ? 'Less' : 'Comments'}
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="card-expanded-content animate-slide-in">
                    <hr className="divider" />
                    <div className="expanded-synopsis">
                      <h5>Description / Opening Line</h5>
                      <p>{book.description}</p>
                    </div>

                    <div className="expanded-reviews-section">
                      <h5>Community Reviews ({bookReviews.length})</h5>
                      {bookReviews.length === 0 ? (
                        <p className="no-reviews-light">No reviews posted yet. Be the first!</p>
                      ) : (
                        <div className="mini-reviews-list">
                          {bookReviews.map((r, i) => (
                            <div key={i} className="mini-review-item">
                              <div className="review-heading">
                                <span className="username">{r.username}</span>
                                <span className="rating">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                              </div>
                              <p className="text">"{r.comment}"</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Search reviews post form */}
                      <form 
                        onSubmit={(e) => postSearchBookReview(e, book)} 
                        className="search-review-post-form"
                      >
                        <input
                          type="text"
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          placeholder="Write a comment..."
                          required
                        />
                        <button type="submit">Post</button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
