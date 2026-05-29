import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// WordPress integration: look for scheda-clienti-root first, fallback to root
const rootElement = document.getElementById('scheda-clienti-root') || document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);

    // Hide loading message when app mounts
    setTimeout(() => {
      const loadingElement = rootElement.querySelector('.sc-loading');
      if (loadingElement && loadingElement instanceof HTMLElement) {
        loadingElement.style.display = 'none';
      }
    }, 100);
  } catch (error) {
    console.error('Error mounting React app:', error);
  }
} else {
  console.error('Root element not found. Neither #scheda-clienti-root nor #root found.');
}
