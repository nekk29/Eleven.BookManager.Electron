import './index.css';
import { createRoot } from 'react-dom/client';
import AppLayout from './components/layout/AppLayout';

const App = () => {
  return (<AppLayout />);
}

const app = document.getElementById('app');
if (!app) throw new Error('Failed to find the app element');

const root = createRoot(app);
root.render(<App />);
