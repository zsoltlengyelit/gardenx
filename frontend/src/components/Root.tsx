import { AppNav } from '@instructure/ui';
import { Outlet } from 'react-router-dom';

export default function Root() {

  return (
        <>

            <AppNav
                screenReaderLabel={'App nav'}
                visibleItemsCount={100}
            >
                <AppNav.Item
                    renderLabel={'Home'}
                    href="/"
                />
                <AppNav.Item
                    renderLabel={'Schedule'}
                    href="/schedule"
                />
            </AppNav>
            <Outlet/>
        </>
  );
}
