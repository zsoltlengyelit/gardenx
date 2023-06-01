import './App.css';
import {canvas, InstUISettingsProvider} from '@instructure/ui';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from './components/Root';
import Board from './components/Board';
import SignInPage from "./pages/SignInPage/SignInPage";

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
                path: 'signin',
                element: <SignInPage/>
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
