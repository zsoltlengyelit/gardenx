import './App.css';
import { canvas, InstUISettingsProvider } from '@instructure/ui';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import Board from './components/Board';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    children: [
      {
        index: true,
        element: <Board/>
      }
    ]
  }
]);

function App() {

  return (
        <InstUISettingsProvider theme={canvas}>
            <RouterProvider router={router}/>
        </InstUISettingsProvider>
  );
}

export default App;
