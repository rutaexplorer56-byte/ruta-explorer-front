import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ScrollAlInicio from './components/ScrollAlInicio.jsx'
import './styles/index.css'
import './styles/tema.css'
import './styles/ajustesResponsive.css'
import "./i18n";

// 👇 Importa BrowserRouter
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter basename="/app">
      <ScrollAlInicio />
      <App />
    </BrowserRouter>
,
)
