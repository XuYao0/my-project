import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AudioPlayer from './AudioPlayer'

createRoot(document.getElementById('root')).render(
    <AudioPlayer />
)
