import {atomWithStorage} from 'jotai/utils';
import {Site} from "./api/useIo";

export const selectedSiteAtom = atomWithStorage<Site | null>('selectedSite', null);
