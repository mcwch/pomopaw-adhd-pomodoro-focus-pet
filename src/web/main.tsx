import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WebApp from './App'

createRoot(document.getElementById('root')!).render(<StrictMode><WebApp /></StrictMode>)
