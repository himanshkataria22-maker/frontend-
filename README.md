<div align="center">
  
# 🗓️ AI Editorial Calendar

**Plan smarter · Create faster · Ship content on time**

A beautiful, premium, and highly responsive **Editorial Calendar** built for content creators, marketers, and teams. This project utilizes modern web technologies and AI integrations to streamline content planning.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Usage](#-usage)

</div>

<br />

## ✨ Features

- **🎨 Premium UI/UX:** Stunning glassmorphism design, vibrant aurora gradients, and buttery-smooth micro-animations using Framer Motion. 
- **📅 Dynamic Calendar Grid:** Switch seamlessly between "Monthly" and "Weekly" views. Fully responsive grid that adapts perfectly to desktop, tablet, and mobile browsers.
- **🤖 Smart AI Suggestions:** Stuck on ideas? Generate targeted content ideas (simulated) directly inside your notes to overcome writer's block.
- **💾 Local Storage Persistence:** Never lose your notes. All your calendar entries are saved instantly to your browser's local storage and sync perfectly across reloads.
- **🏷️ Colorful Categorization:** Classify notes beautifully using categories like `Content`, `Social`, `Meeting`, `Deadline`, `Idea`, and `Other`.
- **🔍 Fast Search & Filtering:** Instantly find your notes with a real-time text search and category filters.
- **⌨️ Keyboard Shortcuts:** Built-in powerful shortcuts for power users (Press `?` inside the app to view).
- **📤 Export Capabilities:** Easily export your calendar data to JSON, CSV, or Markdown.

---

## 🛠️ Tech Stack

This project was built using a cutting-edge frontend stack:

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Core Library:** [React 19](https://react.dev/)
- **Styling:** Vanilla CSS (Glassmorphism, gradients, CSS Variables) & [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Date Handling:** [`date-fns`](https://date-fns.org/)
- **Language:** TypeScript

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites
Make sure you have Node.js (v18+) and npm (or pnpm/yarn) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/editorial-calendar.git
   cd editorial-calendar
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **View the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the calendar in action!

---

## 💡 Usage

1. **Navigate the Calendar:** Use the arrows to change the month or the 'Month/Week' switch to toggle your view.
2. **Add a Note:** Click on any day within the active month to open the note editor, or use the floating action button `+` in the bottom right corner for quick adding to 'Today'.
3. **Filter and Search:** Use the search bar in the top right to find specific notes or click the drop-down to filter entries by category.
4. **Use AI Ideas:** When adding a note, click "Show AI Suggestions" to append AI-driven content ideas directly into your editor.
5. **Shortcuts:** Press `?` anywhere to reveal helpful keyboard shortcuts.
6. **Export your Data:** Hit the export button (📤) to download all your calendar notes in your preferred format.

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <i>Built with ❤️ using Next.js & Framer Motion.</i>
</div>
