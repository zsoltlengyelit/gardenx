import GpioNodeList from './GpioNodeList';
import { useGetTabs } from '../api/nodered';

export default function Board() {

  const tabs = useGetTabs();

  return (
        <>
            <GpioNodeList tabs={tabs}/>
        </>
  )
  ;
}
