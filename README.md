# WLED Studio Website

A modern, responsive landing page for WLED Studio - professional LED display control software. Built with React and featuring stunning animations and a beautiful user interface.

## Features

- **Modern Design**: Dark theme with purple/blue gradient accents
- **Animated Elements**: 
  - Dynamic LED-effect text animation for the "WLED" title
  - 3D rotating sphere with multiple rings
  - Smooth page transitions
- **Multi-page Navigation**: 
  - Home page with hero section
  - Login and signup forms
  - Privacy policy page
  - Contact form
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive UI**: Hover effects, smooth transitions, and modern button styles

## Technology Stack

- **React 18**: Modern React with hooks
- **Lucide React**: Beautiful, customizable icons
- **CSS3**: Custom animations and responsive design
- **Canvas API**: Dynamic LED grid animation effects

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wled-studio-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode. The page will reload when you make changes.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Project Structure

```
wled-studio-website/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── App.js          # Main application component
│   ├── App.css         # Styles and animations
│   ├── index.js        # Application entry point
│   └── ...
├── package.json
└── README.md
```

## Key Components

### Home Page
- Hero section with animated WLED title
- 3D rotating sphere animation
- Call-to-action buttons (Download, Upgrade to Pro)
- Navigation to other pages

### Authentication Pages
- Login form with email/password fields
- Signup form with validation
- Smooth transitions between pages

### Content Pages
- Comprehensive privacy policy
- Contact form with multiple fields
- Consistent design language throughout

## Customization

### Colors
The color scheme uses CSS custom properties and can be easily modified in `App.css`:
- Primary: Purple (#9333ea)
- Secondary: Blue (#2563eb)
- Background: Dark gray (#111827)
- Text: White and gray variants

### Animations
- Sphere rotation speed can be adjusted in the `spinSphere` animation
- LED grid animation parameters can be modified in the `useEffect` hook
- Transition durations are configurable via CSS classes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Considerations

- Canvas animations are optimized with `requestAnimationFrame`
- Smooth transitions use CSS transforms for better performance
- Responsive images and optimized assets
- Minimal bundle size with tree-shaking

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- WLED project for inspiration
- Lucide React for beautiful icons
- React community for excellent documentation and tools
