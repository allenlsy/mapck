# Map Skills Practice App

A web-based application for practicing geography skills through interactive map quizzes.

## Features

- **Multiple Quiz Modes**: Choose between Multiple Choice or Typing answers
- **Region Selection**: Practice with different geographical regions
- **Three Question Types per Country**:
  - "What country is pointed to in this image?" (shows pointed country image)
  - "What is the capital city of [country]?" (shows default map)
  - "[Capital] is the capital of which country?" (shows default map)
- **Question-Specific Images**: Each question can use a custom image or fall back to the region's default map
- **Randomized Questions**: Questions are shuffled each time for variety
- **Score Tracking**: Automatically saves your quiz history to local storage
- **Export/Import Scores**: Save your progress to a JSON file and restore it later
- **Timer**: Track how long it takes to complete each quiz
- **Detailed Results**: See which questions you got right or wrong
- **Fuzzy Answer Matching**: Handles typos and alternate names/capitals

## Project Structure

```
mapck/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application controller
│   ├── quizEngine.js       # Question generation and validation
│   ├── scoreTracker.js     # Score tracking and persistence
│   └── regionManager.js    # Region data management
├── data/
│   └── regions.json        # Region and country data
└── maps/
    ├── southern_africa.jpg   # Default map for Southern Africa
    └── southern_africa/    # Question-specific images (optional)
        ├── za_country.jpg    # South Africa country name question
        ├── za_capital.jpg    # South Africa capital question
        ├── za_pointed.jpg   # South Africa pointed country question
        └── ...
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for running the local server)

### Option 1: Using Python HTTP Server (Recommended)

1. Open a terminal and navigate to the project directory:
   ```bash
   cd /Users/allenlsy/project/mapck
   ```

2. Start the HTTP server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your web browser and visit:
   ```
   http://localhost:8080
   ```

4. To stop the server, press `Ctrl+C` in the terminal.

### Option 2: Opening Directly in Browser

1. Navigate to the project directory in your file explorer
2. Double-click on `index.html` to open it in your default browser

> **Note:** Some features may not work correctly when opening directly due to browser security restrictions. Using the HTTP server is recommended.

## Using the Application

### Starting a Quiz

1. **Select a Region**: Choose the geographical region you want to practice from the dropdown
2. **Choose Quiz Mode**:
   - **Multiple Choice**: Select from 4 possible answers
   - **Typing**: Type the full answer manually
3. **Set Question Count** (Optional): Enter a number to limit questions, or leave empty for all questions
4. **Click "Start Quiz"** to begin

### During the Quiz

- Each question displays its own image (or the region's default map)
- Read each question carefully
- For Multiple Choice: Click on your selected answer
- For Typing: Type your answer and press Enter or click Submit
- Click "Next Question" to proceed after answering
- Click "End Quiz" at any time to finish early

### Viewing Results

After completing the quiz, you'll see:
- Your final score (e.g., "22/26")
- Time taken to complete the quiz
- Detailed breakdown of each question with correct/incorrect answers

### Managing Score History

- Your quiz history is automatically saved to your browser's local storage
- **Export Scores**: Click "Export Scores" to download your history as a JSON file
- **Import Scores**: Click "Import Scores" to restore history from a previously saved file

## Adding New Regions

To add a new geographical region:

1. Open `data/regions.json`
2. Add a new region entry under the `regions` object:

```json
{
  "regions": {
    "southern_africa": { ... },
    "your_region_id": {
      "id": "your_region_id",
      "name": "Your Region Name",
      "mapImage": "maps/your_region.jpg",
      "countries": [
        {
          "id": "country_code",
          "name": "Country Name",
          "capital": "Capital City",
          "alternateNames": ["Alternate Name 1", "Alternate Name 2"],
          "alternateCapitals": ["Capital 1", "Capital 2"],
          "questionImages": {
            "country_name": "maps/your_region/country_code_country.jpg",
            "capital": "maps/your_region/country_code_capital.jpg",
            "pointed_country": "maps/your_region/country_code_pointed.jpg"
          }
        }
      ]
    }
  }
}
```

3. Place your map image in the `maps/` directory
4. (Optional) Create a `maps/your_region/` folder for question-specific images
5. Refresh the application - the new region will appear in the dropdown

### Question-Specific Images

Each country can have custom images for different question types:

| Question Type | Description | Image Key |
|---------------|-------------|-------------|
| `pointed_country` | "What country is pointed to in this image?" | `pointed_country` |
| `capital` | "What is the capital city of [country]?" | `capital` |
| `reverse_capital` | "[Capital] is the capital of which country?" | `capital` |

**Notes:**
- The `questionImages` field is optional
- If a question type doesn't have a custom image, the region's default map is used
- Images should be organized under `maps/region_name/` folder
- You can specify images for any combination of question types

### Country Data Format

Each country object supports the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique country code (e.g., "za" for South Africa) |
| `name` | string | Primary country name |
| `capital` | string | Primary capital city name |
| `alternateNames` | array | Alternative country names for answer matching |
| `alternateCapitals` | array | Alternative capital names for answer matching |

## Answer Matching

The application uses fuzzy matching to validate answers:

- **Case insensitive**: "Pretoria" = "pretoria"
- **Fuzzy matching**: Allows for minor typos (up to 30% difference)
- **Alternate answers**: Accepts any name listed in `alternateNames` or `alternateCapitals`
- **Substring matching**: "South Africa" will match "Africa" if close enough

## Troubleshooting

### Map image not displaying
- Ensure the map file exists in the `maps/` directory
- Check that the filename in `regions.json` matches the actual file
- Verify the image format is supported (JPG, PNG, SVG)

### Questions not loading
- Check browser console for errors (F12 → Console)
- Ensure `data/regions.json` is valid JSON
- Verify the HTTP server is running if using that method

### Scores not saving
- Ensure cookies/local storage is enabled in your browser
- Try clearing browser cache and reloading
- Check browser console for storage-related errors

### Quiz not starting
- Verify a region is selected in the dropdown
- Ensure a quiz mode is chosen
- Check browser console for JavaScript errors

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Opera: ✅ Full support

## License

This project is open source and available for educational purposes.

## Contributing

To contribute:

1. Add new regions to `data/regions.json`
2. Add corresponding map images to the `maps/` directory
3. Test thoroughly before submitting changes

## Future Enhancements

Potential features for future versions:
- More geographical regions
- Difficulty levels
- Leaderboard
- Sound effects
- Progress tracking across sessions
- Mobile app version
