# BookMatch 📖🔥
> Find your next literary obsession. Swipe, match, read, and review.
**BookMatch** is a premium, interactive single-page web application designed for book lovers. Inspired by Tinder, it turns book discovery into a fun, gamified swiping experience. Swipe right to wishlist a book, left to skip, or up to mark it read. 
Built with a high-fidelity **Dark Glassmorphism** design system, BookMatch features local database persistence, interactive 3D card deck mechanics, dynamic Open Library integration, and an AI-driven reading partner.
---
## ✨ Features
### 🚪 1. Smart Authentication (Login & Signup)
* Sleek, secure login and signup tabs with client-side form validation.
* Powered by a sandboxed `localStorage` user database, allowing multiple users to log in, save private shelves, and read each other's community comments.
### 🎴 2. The Swiping Deck (Book Tinder)
* **3D Card Stack**: Hover over a card to experience subtle floating effects. Drag/swipe the card to trigger smooth CSS transitions.
* **Swipe Gestures**:
  * **Swipe Right** (or click ❤) → Add to **Want to Read** shelf.
  * **Swipe Left** (or click ✕) → **Skip** the book.
  * **Swipe Up** (or click ✓) → Mark as **Already Read** and open the review dialog.
* **Live Badges**: Overlay badges ("WANT TO READ", "SKIP", "ALREADY READ") appear dynamically based on the direction of your swipe.
### 🔄 3. Double-Sided Card Flipping
* Click the **Info (ⓘ)** button to trigger a 3D Y-axis card flip.
* **Front Face**: Displays book cover, author, genre tag, publish year, and page count.
* **Back Face**: Displays detailed synopsis, publication metadata, scrolling community reviews, and an interactive star-rating form.
### 📚 4. "My Library" Dashboard
* Track your reading journey across three shelves: **Want to Read** (Wishlist), **Already Read** (with your ratings), and **Skipped**.
* **Reading Stats**: View live metrics on your total swipes, reading ratios, and wishlist count.
* **Interactive Shelves**: Click "Re-queue" on skipped books to recycle them back into the swiping deck, or edit/write reviews directly from your completed shelf.
### 🔍 5. Search Library (Open Library API)
* Run search queries against the public **Open Library API** to look up any book title or author on-the-fly.
* Add search results immediately to your library shelves or read/write reviews for them without leaving the search tab.
### 🤖 6. AI Reading Partner
* A smart companion that scans your swiped lists, calculates your favorite genres, and uses multi-step reasoning logic to recommend your next book match.
---
## 🛠️ Tech Stack
* **Frontend Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (fast HMR dev server)
* **Styling**: Modern CSS3 (Frosted Glassmorphism, backdrop-filters, custom radial gradients, and spring animations)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Database / Session State**: HTML5 LocalStorage API
* **API Integration**: [Open Library Covers & Search API](https://openlibrary.org/developers/api)
---
## 🚀 Getting Started
### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.
### Installation & Run
1. **Clone or Navigate to the directory**:
   ```bash
   cd book-tinder
   ```
2. **Install the dependencies**:
   ```bash
   npm install
   ```
3. **Start the local development server**:
   ```bash
   npm run dev
   ```
4. **Open in Browser**:
   Navigate to the URL printed in your terminal (typically [http://localhost:5173](http://localhost:5173)).
---
## 📂 Project Structure
```text
├── index.html              # App HTML entrypoint
├── package.json            # Scripts & dependencies
├── src
│   ├── App.css             # Main application layout, styles, and card mechanics
│   ├── App.jsx             # Root router, handles sessions & swipe state
│   ├── booksData.js        # Curated catalog database and genre filters
│   ├── index.css           # Global typography, scrollbars, and background gradients
│   ├── main.jsx            # React root renderer
│   ├── storage.js          # LocalStorage database model
│   └── components
│       ├── Auth.jsx        # Login / Signup cards & forms
│       ├── Swiper.jsx      # Tinder swipe deck, gestures & card faces
│       ├── Library.jsx     # Reading stats, shelves list & review editors
│       ├── SearchBar.jsx   # Open Library API searches
│       └── AIRecommendations.jsx # Reading partner recommendations engine
```
---
## 📝 License
This project is open-source and available under the [MIT License](LICENSE)
