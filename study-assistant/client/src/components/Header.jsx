import React from "react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ theme, onToggleTheme, onHome }) {
  return (
    <header className="app-header">
      <button className="logo-button" onClick={onHome} aria-label="Go to home">
        <span className="logo-icon">📚</span>
        <span className="logo-text">Study Assistant</span>
      </button>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </header>
  );
}
