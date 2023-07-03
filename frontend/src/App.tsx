import './App.css';
import { canvas, InstUISettingsProvider } from '@instructure/ui';
import Board from './components/Board';

function App() {

  return (
        <InstUISettingsProvider theme={canvas}>
            <Board />
        </InstUISettingsProvider>
  );
}

export default App;
