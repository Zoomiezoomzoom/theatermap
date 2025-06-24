# GrantSpotter - Theater Grant Deadline Tracker

A simple web application to help theater makers in the San Francisco Bay Area track grant application deadlines and never miss an opportunity for funding.

## Features

- 📅 View upcoming grant deadlines
- 💰 Filter grants by amount and deadline
- ✉️ Set email reminders for approaching deadlines
- 🎭 Focus on Bay Area theater grants
- 📱 Mobile-responsive design

## Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/grantspotter.git
cd grantspotter
```

2. Set up EmailJS (for reminder functionality):
   - Sign up for a free account at [EmailJS](https://www.emailjs.com/)
   - Create a new email service
   - Create an email template
   - Replace the following in `script.js`:
     - `YOUR_PUBLIC_KEY` with your EmailJS public key
     - `YOUR_SERVICE_ID` with your email service ID
     - `YOUR_TEMPLATE_ID` with your email template ID

3. Serve the files:
   - For local development, you can use any simple HTTP server
   - For example, with Python:
     ```bash
     python -m http.server 8000
     ```
   - Or with Node.js:
     ```bash
     npx http-server
     ```

4. Open in your browser:
   - Navigate to `http://localhost:8000` (or whatever port you're using)

## Project Structure

```
grantspotter/
├── index.html          # Main HTML file
├── styles.css          # Styling
├── script.js           # Application logic
├── grants.json         # Grant data
└── README.md          # This file
```

## Customizing Grant Data

The grant information is stored in `grants.json`. To add or modify grants:

1. Open `grants.json`
2. Follow the existing structure:
```json
{
  "grants": [
    {
      "id": "unique_id",
      "name": "Grant Name",
      "deadline": "YYYY-MM-DD",
      "amount": "$X,XXX - $XX,XXX",
      "description": "Grant description",
      "url": "https://application-url.com",
      "category": "federal|state|local|foundation"
    }
  ]
}
```

## Contributing

This is a learning project, but contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Future Improvements

- [ ] Add user accounts for personalized tracking
- [ ] Implement a backend to store user preferences
- [ ] Add more grants to the database
- [ ] Create an admin interface for updating grant information
- [ ] Add calendar integration

## License

MIT License - feel free to use this code for your own projects!

## Contact

For questions or suggestions, please open an issue in the GitHub repository.
