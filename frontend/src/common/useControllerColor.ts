import { Controller } from '../api/types';
import { useLiveState } from '../api/live-state';
import { useMemo } from 'react';

const colors = [
  'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'neutral', 'error',
].map(color => `bg-${color}`);

export function useControllerColor() {
  const { controllers } = useLiveState();
  const allControllers = useMemo(() => controllers.map(c => c.controller), [controllers]);
  return (controller: Controller) => {
    let baseColors = [...colors];
    while (baseColors.length < controllers.length) {
      baseColors = [...baseColors, ...colors];
    }
    const index = allControllers.map(c => c.id).indexOf(controller.id);

    return baseColors[index];
  };
}
