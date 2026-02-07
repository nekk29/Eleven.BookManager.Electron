import './index.css';
import { createRoot } from 'react-dom/client';
import LayoutComponent from './components/layout/LayoutComponent';

const App = () => {
  return (<LayoutComponent />);
}

const app = document.getElementById('app');
if (!app) throw new Error('Failed to find the app element');

const root = createRoot(app);
root.render(<App />);
