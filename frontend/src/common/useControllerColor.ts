import { Controller } from '../api/types';
import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';

const colors = [
  'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'neutral', 'error',
  'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'neutral', 'error',
  'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'neutral', 'error',
].map(color => `bg-${color}`);

export function useControllerColor() {
  const { controllers } = useLiveState();

  const allControllers = useMemo(() => controllers.map(c => c.controller), [controllers]);
  return (controller: Controller) => {
    const index = allControllers.map(c => c.id).indexOf(controller.id);

    return colors[index];
  };
}
