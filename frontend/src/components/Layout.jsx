import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">
          <span className="logo-icon">📚</span>
          Student Academic History Repository
        </Link>
        <nav>
          <Link to="/">Students</Link>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
