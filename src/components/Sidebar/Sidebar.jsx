import React from 'react';
import './Sidebar.scss';

export default function Sidebar({ items, visible }) {
  if (!visible) return null;
  return (
    <aside className={`sidebar ${visible ? 'visible' : ''}`}>
      <nav>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="sidebar-link">{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
