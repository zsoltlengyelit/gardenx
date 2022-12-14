import './App.css';
import { canvas, InstUISettingsProvider } from '@instructure/ui';
import { SWRConfig } from 'swr/_internal';
import { SWRConfiguration } from 'swr';
import { swrFetcher } from './api/axios';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Root from './components/Root';
import Board from './components/Board';
import Schedule from './components/Schedule';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    children: [
      {
        index: true,
        element: <Board/>
      },
      {
        path: 'schedule',
        element: <Schedule/>
      }
    ]
  }
]);

function App() {

  const swrConfig: SWRConfiguration = {
    refreshInterval: 50000,
    revalidateOnFocus: true,
    fetcher: swrFetcher
  };

  return (
        <SWRConfig value={config => ({ ...config, ...swrConfig })}>
            <InstUISettingsProvider theme={canvas}>
                <RouterProvider router={router}/>
            </InstUISettingsProvider>
        </SWRConfig>
  );
}

export default App;
