import React, { useState, useEffect } from 'react';
import { BookOpen, Star, Trash2, Heart, Check, RefreshCw, MessageSquare, Edit2 } from 'lucide-react';
import { getBookReviews, addOrUpdateBookReview } from '../storage';

export default function Library({ books, userSwipes, onResetSwipe, onSwipe, currentUser }) {
  const [activeTab, setActiveTab] = useState('want'); // 'want' | 'read' | 'skipped'
  const [editingBookId, setEditingBookId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editRating, setEditRating] = useState(5);
  
  // Categorize books based on swipes
  const wantToReadBooks = books.filter(b => userSwipes[b.id] === 'want');
  const alreadyReadBooks = books.filter(b => userSwipes[b.id] === 'read');
  const skippedBooks = books.filter(b => userSwipes[b.id] === 'skipped');

  // Compute stats
  const totalSwipes = Object.keys(userSwipes).length;
  const readCount = alreadyReadBooks.length;
  const wantCount = wantToReadBooks.length;
  const skipCount = skippedBooks.length;

  const startEditingReview = (bookId, currentRating, currentComment) => {
    setEditingBookId(bookId);
    setEditRating(currentRating || 5);
    setEditCommentText(currentComment || '');
  };

  const saveEditedReview = (bookId) => {
    addOrUpdateBookReview(bookId, currentUser, editRating, editCommentText);
    setEditingBookId(null);
    setEditCommentText('');
    // Trigger window state refresh
    window.dispatchEvent(new Event('storage'));
  };

  // Helper to get user's own review for a book
  const getUserReview = (bookId) => {
    const reviews = getBookReviews(bookId);
    return reviews.find(r => r.username.toLowerCase() === currentUser.toLowerCase()) || null;
  };

  return (
    <div className="library-section">
      {/* Stats Dashboard */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalSwipes}</div>
          <div className="stat-label">Total Swiped</div>
        </div>
        <div className="stat-card border-want">
          <div className="stat-value text-want">{wantCount}</div>
          <div className="stat-label">Want to Read</div>
        </div>
        <div className="stat-card border-read">
          <div className="stat-value text-read">{readCount}</div>
          <div className="stat-label">Already Read</div>
        </div>
        <div className="stat-card border-skip">
          <div className="stat-value text-skip">{skipCount}</div>
          <div className="stat-label">Skipped</div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="library-tabs">
        <button 
          className={`lib-tab-btn ${activeTab === 'want' ? 'active' : ''}`}
          onClick={() => setActiveTab('want')}
        >
          <Heart size={16} className="tab-icon" />
          Want to Read ({wantCount})
        </button>
        <button 
          className={`lib-tab-btn ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          <Check size={16} className="tab-icon" />
          Already Read ({readCount})
        </button>
        <button 
          className={`lib-tab-btn ${activeTab === 'skipped' ? 'active' : ''}`}
          onClick={() => setActiveTab('skipped')}
        >
          <Trash2 size={16} className="tab-icon" />
          Skipped ({skipCount})
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="library-content">
        {/* WANT TO READ TAB */}
        {activeTab === 'want' && (
          <div className="books-shelf-grid animate-fade-in">
            {wantToReadBooks.length === 0 ? (
              <div className="shelf-empty">
                <p>Your wishlist is empty. Go back to Swiping to add books!</p>
              </div>
            ) : (
              wantToReadBooks.map(book => (
                <div key={book.id} className="shelf-book-card">
                  <div className="shelf-cover-wrapper">
                    <img 
                      src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`} 
                      alt={book.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop";
                      }}
                    />
                    <div className="shelf-cover-overlay">
                      <button 
                        className="overlay-action-btn read-btn"
                        onClick={() => onSwipe(book.id, 'up')}
                        title="Mark as Read"
                      >
                        <Check size={16} /> Mark Read
                      </button>
                      <button 
                        className="overlay-action-btn skip-btn"
                        onClick={() => onResetSwipe(book.id)}
                        title="Remove from Shelf"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="shelf-book-details">
                    <h5>{book.title}</h5>
                    <p className="shelf-author">by {book.author}</p>
                    <span className="shelf-genre-badge">{book.genre}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ALREADY READ TAB */}
        {activeTab === 'read' && (
          <div className="read-books-list animate-fade-in">
            {alreadyReadBooks.length === 0 ? (
              <div className="shelf-empty">
                <p>No books marked as read yet. Swiped up on card deck to mark them read!</p>
              </div>
            ) : (
              alreadyReadBooks.map(book => {
                const userReview = getUserReview(book.id);
                const isEditing = editingBookId === book.id;

                return (
                  <div key={book.id} className="read-book-item">
                    <div className="read-item-left">
                      <img 
                        src={`https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`} 
                        alt={book.title}
                        className="read-item-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=200&auto=format&fit=crop";
                        }}
                      />
                      <div className="read-item-info">
                        <h4>{book.title}</h4>
                        <p className="read-item-author">by {book.author}</p>
                        <span className="shelf-genre-badge">{book.genre}</span>
                        
                        {/* Action buttons */}
                        <div className="read-item-actions">
                          <button 
                            className="text-btn btn-danger-text"
                            onClick={() => onResetSwipe(book.id)}
                          >
                            <Trash2 size={12} style={{ marginRight: '4px' }} />
                            Move back to deck
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="read-item-right">
                      {/* Review Block */}
                      {isEditing ? (
                        <div className="shelf-edit-review-form">
                          <h5>Edit Your Review</h5>
                          <div className="edit-rating-stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                className="star-input-btn"
                              >
                                <Star 
                                  size={16} 
                                  fill={star <= editRating ? "var(--color-warning)" : "none"}
                                  className={star <= editRating ? "star-active" : "star-inactive"}
                                />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            placeholder="Write your views or comments here..."
                            rows={3}
                          />
                          <div className="edit-form-buttons">
                            <button 
                              className="btn-primary-sm"
                              onClick={() => saveEditedReview(book.id)}
                            >
                              Save
                            </button>
                            <button 
                              className="btn-outline-sm"
                              onClick={() => setEditingBookId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="shelf-user-review-display">
                          {userReview ? (
                            <>
                              <div className="review-display-header">
                                <span className="review-label">Your Review</span>
                                <button 
                                  className="edit-review-icon-btn"
                                  onClick={() => startEditingReview(book.id, userReview.rating, userReview.comment)}
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                              <div className="review-rating" style={{ marginBottom: '8px' }}>
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i}
                                    size={14}
                                    fill={i < userReview.rating ? "var(--color-warning)" : "none"}
                                    className={i < userReview.rating ? "star-active" : "star-inactive"}
                                  />
                                ))}
                              </div>
                              <p className="shelf-review-text">"{userReview.comment}"</p>
                              <small className="review-date-label">Posted on {userReview.date}</small>
                            </>
                          ) : (
                            <div className="no-review-prompt">
                              <p>You haven't reviewed this book yet.</p>
                              <button 
                                className="btn-outline-sm"
                                onClick={() => startEditingReview(book.id, 5, '')}
                              >
                                Write Review
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SKIPPED TAB */}
        {activeTab === 'skipped' && (
          <div className="skipped-shelf-list animate-fade-in">
            {skippedBooks.length === 0 ? (
              <div className="shelf-empty">
                <p>No skipped books. Good swiping!</p>
              </div>
            ) : (
              <div className="skipped-grid">
                {skippedBooks.map(book => (
                  <div key={book.id} className="skipped-item-card">
                    <div className="skipped-info">
                      <h5>{book.title}</h5>
                      <p>by {book.author}</p>
                    </div>
                    <button 
                      className="requeue-btn"
                      onClick={() => onResetSwipe(book.id)}
                      title="Put back in Swiping deck"
                    >
                      <RefreshCw size={14} style={{ marginRight: '6px' }} />
                      Re-queue
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
