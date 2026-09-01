jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('lucide-react-native', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');

  const names = [
    'AlertTriangle',
    'Beef',
    'CheckCircle2',
    'ChevronDown',
    'ChevronLeft',
    'ChevronRight',
    'ChevronUp',
    'Clock',
    'Clock3',
    'Cookie',
    'Droplets',
    'Flame',
    'Globe',
    'Image',
    'ImageIcon',
    'Info',
    'Leaf',
    'Lock',
    'Minus',
    'Pencil',
    'Play',
    'Plus',
    'RotateCcw',
    'Scale',
    'Search',
    'Star',
    'Timer',
    'Users',
    'Utensils',
    'Waves',
    'Wheat',
    'X',
    'Square',
    'CheckSquare',
    'Repeat',
    'Trash2',
    'CalendarDays',
    'MoreHorizontal',
  ];

  return Object.fromEntries(
    names.map((name) => [
      name,
      (props: any) =>
        React.createElement(View, {
          ...props,
          accessibilityLabel: props?.accessibilityLabel ?? name,
          testID: props?.testID,
        }),
    ]),
  );
});