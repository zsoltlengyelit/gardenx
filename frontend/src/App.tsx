import './App.css';
import Board from './components/Board';
import { Theme } from 'react-daisyui';

function App() {

  return (
        <Theme
            dataTheme="lemonade"
            className="h-screen bg-white dark:bg-gray-700"
        >
            <Board/>
        </Theme>
  );
}

export default App;
