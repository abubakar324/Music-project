# Music Discovery App

A single-page music discovery application that uses the iTunes API to search for music, podcasts, and audiobooks. Features include favorites management, filtering, and theme switching with data persistence via json-server.

## Features

### Core Functionality
- **Search**: Real-time search across iTunes catalog
- **Filter**: Filter results by songs, albums, artists
- **Favorites**: Save and manage favorite tracks
- **Theme Toggle**: Switch between dark and light themes
- **Persistence**: All user data saved via json-server

### User Stories
1. **As a user**, I want to search for music so that I can discover new songs and artists
2. **As a user**, I want to filter search results so that I can find specific types of content
3. **As a user**, I want to save favorites so that I can easily access my preferred tracks
4. **As a user**, I want to toggle themes so that I can customize the app appearance
5. **As a user**, I want my preferences saved so that they persist between sessions
6. **As a user**, I want keyboard shortcuts so that I can navigate efficiently

### Technical Requirements Met
- ✅ Single HTML page with no redirects/reloads
- ✅ Public API (iTunes) with no authentication required
- ✅ JSON communication format
- ✅ 7+ distinct event listeners (input, change, click, keydown)
- ✅ Array iteration methods (map, filter, forEach, reduce, sort)
- ✅ json-server for data persistence
- ✅ Async/await for all API calls
- ✅ DRY code principles

### Event Listeners Used
1. **input** - Search functionality with debouncing
2. **change** - Media type selection
3. **click** - Theme toggle
4. **click** - Favorites view toggle
5. **click** - Filter buttons
6. **click** - Favorite/unfavorite tracks (event delegation)
7. **keydown** - Keyboard shortcuts (Ctrl+K, Ctrl+F, Ctrl+T, R)

### Array Methods Implemented
- `forEach()` - Rendering results and favorites
- `map()` - Data transformation for genres and artists
- `filter()` - Filtering results by type and valid data
- `reduce()` - Aggregating genre counts and artist summaries
- `sort()` - Sorting artists by track count
- `find()` - Finding specific tracks and favorites
- `some()` - Checking if track is favorited

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start json-server**
   ```bash
   npm start
   ```

3. **Serve the app** (in another terminal)
   ```bash
   python3 -m http.server 8080
   ```

4. **Open in browser**
   ```
   http://localhost:8080
   ```

## API Endpoints

### iTunes API
- `GET https://itunes.apple.com/search?term={query}&media={type}&limit=50`

### json-server Endpoints
- `GET /favorites` - Get all favorites
- `POST /favorites` - Add favorite
- `DELETE /favorites/:id` - Remove favorite
- `GET /userPreferences` - Get user preferences
- `PUT /userPreferences` - Update preferences

## Keyboard Shortcuts
- `Ctrl/Cmd + K` - Focus search input
- `Ctrl/Cmd + F` - Toggle favorites view
- `Ctrl/Cmd + T` - Toggle theme
- `R` - Reverse current results order

## Project Structure
```
Music-project/
├── index.html          # Single page application
├── style.css           # Responsive styling
├── index.js            # Main application logic
├── db.json             # json-server database
├── package.json        # Dependencies
└── README.md           # Documentation
```