# Vite + React Portfolio Template

A modern, fast, and responsive personal portfolio website built with React, Vite, and Tailwind CSS. This website showcases my projects, technical skills, background, and personal journey as a developer.

Live Demo: [https://tamdev.biz.id](https://tamdev.biz.id)

--- 

## Features

* **Modern & Clean UI/UX:** Built with Tailwind CSS for an intuitive and aesthetically pleasing design.
* **Fully Responsive:** Optimized across all screen sizes, from mobile devices to high-resolution desktop displays.
* **Fast Performance:** Powered by Vite for near-instant build times and smooth transitions.
* **Interactive Elements:** Smooth scrolling, interactive dynamic components, and functional layout.
* **Project Showcase:** Highlights key projects with descriptions, tech stacks, and live/source links.

## Tech Stack

* **Frontend:** React.js, TypeScript
* **Styling:** Tailwind CSS, Lucide Icons / FontAwesome
* **Build Tool:** Vite
* **Deployment:** Vercel

## 💻 Getting Started Locally

To get a local copy up and running, follow these simple steps:

### Prerequisites

Make sure you have Node.js and npm installed on your machine.

* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/mchmddiazz/wfx-tamdev.git](https://github.com/mchmddiazz/wfx-tamdev.git)
    cd wfx-tamdev
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

    The app will be available at `http://localhost:5173` by default.

## Customization

This template is designed to be easily customized. Here's how to make it your own:

1.  **Update Content**:
    *   **About Section**: Open `src/components/About.tsx` and edit the text to write your own bio.
    *   **Projects/Work**: Modify `src/components/Work.tsx` to display your projects. Consider creating a separate data file (e.g., `src/data/projects.ts`) and mapping over it to generate project cards dynamically.
    *   **Metadata**: Change the title and meta tags in `index.html`.

2.  **Update Styling**:
    *   **Theme**: Modify `tailwind.config.js` to change colors, fonts, and other design tokens to match your personal brand.
    *   **Global Styles**: For base styles, edit `src/styles/index.css` (or wherever your main CSS import is).

3.  **Replace Assets**:
    *   **Favicon**: Replace the favicon files in the `public/` directory.
    *   **Images & SVGs**: Add your own project screenshots or personal photos to the `src/assets/` directory and update the paths in the components.

## Available Scripts

- `npm run dev` - Start the development server.
- `npm run build` - Create a production-ready build.
- `npm run preview` - Preview the production build locally.
- `npm run lint` - Run ESLint to check for code quality issues.

## Folder Structure

```
wfx-tamdev/
├── public/          # Static assets (images, icons, etc.)
├── src/
│   ├── assets/      # Media assets used in components
│   ├── components/  # Reusable UI components
│   ├── data/        # Static JSON/JS data for dynamic rendering
│   ├── App.jsx/tsx  # Main Application component
│   └── main.jsx/tsx # Entry point
├── index.html       # HTML entry template
├── tailwind.config.js
├── vite.config.js
└── package.json
```

## Configuration

### Vite

The `vite.config.ts` file includes the React plugin and compression plugin for optimized builds.

### Tailwind CSS

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`. You can customize your design tokens and plugins there.

### ESLint

ESLint is configured via `eslint.config.js` to enforce code quality and consistency. Run `npm run lint` to check for issues.

## Deployment

This template is ready for deployment to platforms like Vercel. A `vercel.json` is included for default settings. Simply connect your repository and push to deploy.

## 🙏 Credits & Acknowledgments

Designed and built upon the portfolio template created by [neelshha](https://github.com/neelshha). Huge thanks for sharing such a great open-source template!