import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/ErrorBoundary'
import { initAnalytics } from './lib/analytics'
import { StoreProvider } from './lib/store'
import { ToastProvider } from './components/Toast'
import './fonts.css'
import './styles.css'
import './design.css'
import './campaign.css'
import './boutique.css'
import './scente.css'
import './natal.css'
import './banner.css'
import './intro.css'
import './theme.css'
import './explore.css'
import './align.css'
import './perf.css'
import './anim.css'
import './type.css'
import './notes.css'
import './pyramid.css'
import './look.css'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><StoreProvider><ToastProvider><ErrorBoundary><App /></ErrorBoundary></ToastProvider></StoreProvider></BrowserRouter></StrictMode>,
)
