import { AppNav, IconCalendarAddSolid, IconCalendarClockLine, ScreenReaderContent } from '@instructure/ui';
import { Outlet } from 'react-router-dom';

export default function Root() {

  return (
        <>
            <AppNav
                screenReaderLabel={'App nav'}
                visibleItemsCount={100}
                renderBeforeItems={
                    <AppNav.Item
                        renderLabel={<ScreenReaderContent>GardenX</ScreenReaderContent>}
                        renderIcon={<IconCalendarClockLine
                            inline={false}
                            size="medium"
                            color="primary"
                                    />}
                        href="/"
                    />
                }
            >
                <AppNav.Item renderLabel={''}>
                    <IconCalendarAddSolid/>
                    GardenX
                </AppNav.Item>
            </AppNav>
            <Outlet/>
        </>
  );
}
