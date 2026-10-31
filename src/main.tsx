import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { StoreProvider } from './lib/store'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/600.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/jost/400.css'
import '@fontsource/jost/500.css'
import './styles.css'
import './admin.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><StoreProvider><App /></StoreProvider></BrowserRouter></StrictMode>,
)
