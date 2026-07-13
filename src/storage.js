// Simple localStorage Manager for BookMatch

export const getStoredUsers = () => {
  const users = localStorage.getItem('bookmatch_users');
  return users ? JSON.parse(users) : {};
};

export const registerUser = (username, password) => {
  const users = getStoredUsers();
  if (users[username.toLowerCase()]) {
    return { success: false, message: "Username already exists!" };
  }
  users[username.toLowerCase()] = {
    username: username, // Preserve original casing for display
    password: password
  };
  localStorage.setItem('bookmatch_users', JSON.stringify(users));
  return { success: true };
};

export const loginUser = (username, password) => {
  const users = getStoredUsers();
  const user = users[username.toLowerCase()];
  if (!user || user.password !== password) {
    return { success: false, message: "Invalid username or password!" };
  }
  localStorage.setItem('bookmatch_current_user', JSON.stringify(user.username));
  return { success: true, username: user.username };
};

export const logoutUser = () => {
  localStorage.removeItem('bookmatch_current_user');
};

export const getCurrentUserSession = () => {
  const user = localStorage.getItem('bookmatch_current_user');
  return user ? JSON.parse(user) : null;
};

// Swipe State: { [username]: { [bookId]: 'want' | 'read' | 'skipped' } }
export const getStoredSwipes = () => {
  const swipes = localStorage.getItem('bookmatch_swipes');
  return swipes ? JSON.parse(swipes) : {};
};

export const getUserSwipes = (username) => {
  const swipes = getStoredSwipes();
  return swipes[username.toLowerCase()] || {};
};

export const saveUserSwipe = (username, bookId, actionType) => {
  const swipes = getStoredSwipes();
  const userKey = username.toLowerCase();
  if (!swipes[userKey]) {
    swipes[userKey] = {};
  }
  swipes[userKey][bookId] = actionType;
  localStorage.setItem('bookmatch_swipes', JSON.stringify(swipes));
};

export const resetUserSwipe = (username, bookId) => {
  const swipes = getStoredSwipes();
  const userKey = username.toLowerCase();
  if (swipes[userKey] && swipes[userKey][bookId]) {
    delete swipes[userKey][bookId];
    localStorage.setItem('bookmatch_swipes', JSON.stringify(swipes));
  }
};

// Reviews State: { [bookId]: [{ username, rating, comment, date }] }
export const getStoredReviews = () => {
  const reviews = localStorage.getItem('bookmatch_reviews');
  return reviews ? JSON.parse(reviews) : {};
};

export const getBookReviews = (bookId) => {
  const reviews = getStoredReviews();
  return reviews[bookId] || [];
};

export const addOrUpdateBookReview = (bookId, username, rating, comment) => {
  const reviews = getStoredReviews();
  if (!reviews[bookId]) {
    reviews[bookId] = [];
  }
  
  // Check if user already reviewed this book, if so update it
  const existingReviewIndex = reviews[bookId].findIndex(
    r => r.username.toLowerCase() === username.toLowerCase()
  );
  
  const reviewData = {
    username: username,
    rating: Number(rating),
    comment: comment,
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  };

  if (existingReviewIndex >= 0) {
    reviews[bookId][existingReviewIndex] = reviewData;
  } else {
    reviews[bookId].unshift(reviewData); // Put newest reviews first
  }
  
  localStorage.setItem('bookmatch_reviews', JSON.stringify(reviews));
};
