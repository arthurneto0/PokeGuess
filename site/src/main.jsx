import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Perfil from './view/Perfil.jsx'
import Pokedex from './view/Pokedex.jsx'
import { BrowserRouter, Routes, Route } from 'react-router'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
         <Route path='/' element={<App />}/>
         <Route path='/perfil/' element={<Perfil />}/>
         <Route path='/pokedex' element={<Pokedex />}/>
    </Routes>
  </BrowserRouter>
)
