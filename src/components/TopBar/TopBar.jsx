import React from 'react';
import './TopBar.scss';

export default function TopBar({ themeName = 'default', onToggleSidebar }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="theme-name">{themeName}</span>
      </div>
      <div className="topbar-right">
        {onToggleSidebar && (
          <button className="sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle sidebar">
            ☰
          </button>
        )}
      </div>
    </header>
  );
}
