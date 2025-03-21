import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MusicPlayer from './App.jsx'

createRoot(document.getElementById('root')).render(
    <MusicPlayer />
)
