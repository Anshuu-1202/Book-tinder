import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Check, Info, RefreshCw, MessageSquare, Star, ArrowLeftRight, ChevronRight } from 'lucide-react';
import { getBookReviews, addOrUpdateBookReview } from '../storage';

export default function Swiper({ books, activeGenre, onSwipe, currentUser, userSwipes = {}, onResetAllSwipes }) {
  // Filter out books that have already been swiped
  const unswipedBooks = books.filter(book => !userSwipes[book.id]);

  // Filter books based on selected genre
  const deckBooks = unswipedBooks.filter(book => 
    activeGenre === 'All Genres' || book.genre === activeGenre
  );

  const [isFlipped, setIsFlipped] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeExit, setSwipeExit] = useState(null); // 'left' | 'right' | 'up' | null
  
  // Reviews state for the current book
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);

  const cardRef = useRef(null);

  // The active card is always the first item in the remaining deck
  const currentBook = deckBooks[0];

  // Fetch reviews when current book changes
  useEffect(() => {
    if (currentBook) {
      setReviews(getBookReviews(currentBook.id));
      setIsFlipped(false);
      setNewReviewText('');
      setNewRating(5);
    }
  }, [currentBook?.id]);

  if (!currentBook) {
    return (
      <div className="empty-swipe-state">
        <div className="empty-icon-wrapper">
          <RefreshCw size={48} className="animate-spin-slow" />
        </div>
        <h2>No more books to swipe!</h2>
        <p>Try changing your genre filter or check your library dashboard to see your saved matches.</p>
        {onResetAllSwipes && (
          <button 
            className="btn-outline" 
            onClick={onResetAllSwipes}
            style={{ marginTop: '16px' }}
          >
            Reset Swipe History & Start Over
          </button>
        )}
      </div>
    );
  }

  // Pointer event handlers for drag-to-swipe
  const handlePointerDown = (e) => {
    if (isFlipped) return; // Prevent swiping if card is flipped to see reviews
    // Ignore drags that start on buttons, forms, input fields, or anchors
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('form')) {
      return;
    }
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const offsetX = e.clientX - dragStart.x;
    const offsetY = e.clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const thresholdX = 120;
    const thresholdY = 120;

    if (dragOffset.x > thresholdX) {
      handleAction('right'); // Like / Want to read
    } else if (dragOffset.x < -thresholdX) {
      handleAction('left'); // Dislike / Skip
    } else if (dragOffset.y < -thresholdY) {
      handleAction('up'); // Already Read
    } else {
      setDragOffset({ x: 0, y: 0 }); // Snap back
    }
  };

  const handleAction = (direction) => {
    setSwipeExit(direction);
    // Wait for exit animation to complete before registering swipe state change
    setTimeout(() => {
      onSwipe(currentBook.id, direction);
      setSwipeExit(null);
      setDragOffset({ x: 0, y: 0 });
    }, 450);
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    addOrUpdateBookReview(currentBook.id, currentUser, newRating, newReviewText);
    
    // Optimistically update reviews list
    setReviews(getBookReviews(currentBook.id));
    setNewReviewText('');
    setNewRating(5);
    
    // Automatically swipe the book UP (mark read) to transition to next book
    handleAction('up');
  };

  // Compute card style based on drag state
  const getCardStyle = () => {
    if (swipeExit) {
      let translate = 'translate3d(0, 0, 0)';
      if (swipeExit === 'left') translate = 'translate3d(-150%, 0, 0) rotate(-30deg)';
      if (swipeExit === 'right') translate = 'translate3d(150%, 0, 0) rotate(30deg)';
      if (swipeExit === 'up') translate = 'translate3d(0, -150%, 0) scale(0.8)';
      return {
        transform: translate,
        transition: 'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)',
        opacity: 0
      };
    }

    if (isDragging) {
      const rotate = dragOffset.x * 0.08; // slightly rotate card as we drag
      return {
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotate}deg)`,
        cursor: 'grabbing',
        transition: 'none'
      };
    }

    return {
      transform: isFlipped ? 'translate3d(0, 0, 0) rotateY(180deg)' : 'translate3d(0, 0, 0) rotate(0deg)',
      transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };
  };

  // Determine which feedback badge to show based on drag amount
  const getBadgeType = () => {
    if (!isDragging) return null;
    if (dragOffset.x > 60) return 'want';
    if (dragOffset.x < -60) return 'skip';
    if (dragOffset.y < -60) return 'read';
    return null;
  };

  const badge = getBadgeType();

  return (
    <div className="swiper-section">
      <div className="card-container">
        
        {/* Swipe Feedback Badges */}
        {badge === 'want' && <div className="swipe-badge badge-want animate-pulse">WANT TO READ</div>}
        {badge === 'skip' && <div className="swipe-badge badge-skip animate-pulse">SKIP</div>}
        {badge === 'read' && <div className="swipe-badge badge-read animate-pulse">ALREADY READ</div>}

        {/* 3D Double Sided Flip Card */}
        <div 
          className={`swiper-card-inner ${isFlipped ? 'flipped' : ''}`}
          style={getCardStyle()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* FRONT: Cover and Basic Details */}
          <div className="card-face card-front">
            <div className="card-image-container">
              {currentBook.coverId ? (
                <img 
                  src={`https://covers.openlibrary.org/b/id/${currentBook.coverId}-L.jpg`} 
                  alt={currentBook.title}
                  draggable="false"
                  loading="eager"
                  className="book-cover-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=600&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="book-cover-placeholder">
                  <span>📖</span>
                </div>
              )}
              <div className="genre-tag">{currentBook.genre}</div>
            </div>

            <div className="card-info">
              <div className="title-row">
                <h3>{currentBook.title}</h3>
                <button 
                  className="info-btn"
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                  title="View Synopsis & Reviews"
                >
                  <Info size={20} />
                </button>
              </div>
              <p className="author-name">by {currentBook.author}</p>
              <p className="book-description-preview">{currentBook.description}</p>
              <div className="book-metadata">
                <span>📅 {currentBook.year}</span>
                <span>📄 {currentBook.pages} pages</span>
              </div>
            </div>
          </div>

          {/* BACK: Detailed Synopsis & Reviews List */}
          <div className="card-face card-back" onPointerDown={(e) => e.stopPropagation()}>
            <div className="back-header">
              <h3>{currentBook.title}</h3>
              <p className="author-name">by {currentBook.author}</p>
              <button className="back-btn" onClick={() => setIsFlipped(false)}>
                Back to swipe <ArrowLeftRight size={14} style={{ marginLeft: '4px' }} />
              </button>
            </div>

            <div className="back-scrollable-content">
              <div className="synopsis-section">
                <h4>Synopsis</h4>
                <p>{currentBook.description}</p>
                <div className="book-metadata" style={{ margin: '12px 0 0 0' }}>
                  <span>Published: {currentBook.year}</span>
                  <span>Pages: {currentBook.pages}</span>
                  <span>Genre: {currentBook.genre}</span>
                </div>
              </div>

              <div className="reviews-section">
                <div className="reviews-header-row">
                  <h4>Reviews & Comments ({reviews.length})</h4>
                  <MessageSquare size={16} className="text-muted" />
                </div>
                
                {reviews.length === 0 ? (
                  <p className="no-reviews">No reviews yet. Be the first to share your thoughts!</p>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-meta">
                          <span className="review-username">{r.username}</span>
                          <span className="review-date">{r.date}</span>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, starIndex) => (
                            <Star 
                              key={starIndex}
                              size={12}
                              className={starIndex < r.rating ? "star-active" : "star-inactive"}
                              fill={starIndex < r.rating ? "var(--color-warning)" : "none"}
                            />
                          ))}
                        </div>
                        <p className="review-text">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="review-form-footer">
              <form onSubmit={submitReview} className="quick-review-form">
                <div className="rating-select">
                  <span>Your Rating:</span>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        className="star-input-btn"
                      >
                        <Star 
                          size={18} 
                          fill={star <= newRating ? "var(--color-warning)" : "none"}
                          className={star <= newRating ? "star-active" : "star-inactive"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="review-input-row">
                  <input
                    type="text"
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Write a comment..."
                    required
                  />
                  <button type="submit" className="submit-review-btn">Post</button>
                </div>
                <small className="review-note">Note: Posting automatically marks book as "Already Read".</small>
              </form>
            </div>
          </div>
        </div>

      </div>

      {/* Control Buttons */}
      <div className="swipe-controls">
        <button 
          className="control-btn btn-skip" 
          onClick={() => handleAction('left')} 
          title="Swipe Left: Skip"
        >
          <X size={24} />
        </button>
        <button 
          className="control-btn btn-read" 
          onClick={() => handleAction('up')} 
          title="Swipe Up: Already Read"
        >
          <Check size={24} />
        </button>
        <button 
          className="control-btn btn-want" 
          onClick={() => handleAction('right')} 
          title="Swipe Right: Want to Read"
        >
          <Heart size={24} />
        </button>
      </div>

      <div className="keyboard-hints">
        <span>Tip: Drag card Left to Skip, Right to Love, Up to Mark Read!</span>
      </div>
    </div>
  );
}
