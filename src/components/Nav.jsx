import './Nav.css'

export default function Nav() {
  return (
    <header className="nav">
      <span className="nav-logo">2CAL</span>
      <nav className="nav-links">
        <a href="#stack">the stack</a>
        <a href="#shop">shop</a>
        <a href="#social">instagram</a>
      </nav>
      <a className="nav-cta" href="#shop">
        Shop 2CAL
      </a>
    </header>
  )
}
