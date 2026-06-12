import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import './NotFound.css'

/**
 * 404 page shown for unknown routes.
 */
export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page not found</h1>
      <p className="not-found-text">
        The page you are looking for does not exist or has moved.
      </p>
      <Link to="/">
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
