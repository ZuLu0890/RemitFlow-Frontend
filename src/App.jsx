import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import SendMoney from './pages/SendMoney.jsx'
import Transfers from './pages/Transfers.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

/**
 * Root application component: wires up the context, router and layout.
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/send" element={<SendMoney />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  )
}
