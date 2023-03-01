import { atomWithStorage } from 'jotai/utils';
import { Tab } from './api/nodered';

export const selectedTabAtom = atomWithStorage<Tab | null>('selectedTab', null);
