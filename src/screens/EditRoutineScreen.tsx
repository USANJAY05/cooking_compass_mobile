import React from 'react';
import { RoutineFormScreen } from './RoutineFormScreen';

export const EditRoutineScreen = (props: any) => (
  <RoutineFormScreen {...props} mode="edit" />
);

export default EditRoutineScreen;
