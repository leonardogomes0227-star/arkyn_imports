import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './lib/store'
import { ToastProvider } from './components/Toast'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import './styles.css'
import './design.css'
import './admin.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><StoreProvider><ToastProvider><App /></ToastProvider></StoreProvider></BrowserRouter></StrictMode>,
)
