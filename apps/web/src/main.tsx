import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { I18nProvider } from '@/components/i18n/I18nProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <I18nProvider>
          <App />
        </I18nProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
