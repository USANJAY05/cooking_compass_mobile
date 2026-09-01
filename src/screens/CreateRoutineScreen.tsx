import React from 'react';
import { RoutineFormScreen } from './RoutineFormScreen';

export const CreateRoutineScreen = (props: any) => (
  <RoutineFormScreen {...props} mode="create" />
);

export default CreateRoutineScreen;
