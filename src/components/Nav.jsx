import './Nav.css'

export default function Nav() {
  return (
    <header className="nav">
      <span className="nav-logo">2CAL</span>
      <nav className="nav-links">
        <a href="#interest">the drink</a>
        <a href="#ingredients">ingredients</a>
        <a href="#shop">shop</a>
      </nav>
      <a className="nav-cta" href="#shop">
        Shop now
      </a>
    </header>
  )
}
