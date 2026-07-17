import Link from "next/link";

export default function NotFound() {
  return (
    <div className="status-page">
      <span className="eyebrow">404</span>
      <h1>That route does not exist.</h1>
      <p>The page you asked for is not part of GrailRoute. Head back to the wallet workspace to pick up where you left off.</p>
      <Link className="primary-button" href="/">Return to GrailRoute</Link>
    </div>
  );
}
