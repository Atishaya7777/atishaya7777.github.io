// theme.js
import { extendTheme, ThemeOverride } from '@chakra-ui/react';

import Button from './component/Buttons';
import Drawer from './component/Drawer';
import Heading from './component/Heading';
import Input from './component/Input';
import Skeleton from './component/Skeleton';
import Table from './component/Table';
import Tooltip from './component/Tooltip';
import breakpoints from './foundations/breakpoints';
import colors from './foundations/colors';
import fonts from './foundations/fonts';
import textStyles from './foundations/textStyles';
import styles from './styles';

const overrides: ThemeOverride = {
  config: {
    cssVarPrefix: 'timeero',
  },
  fonts,
  textStyles,
  breakpoints,
  styles,
  colors,
  components: {
    Button,
    Drawer,
    Heading,
    Input,
    Skeleton,
    Table,
    Tooltip,
  },
};

export default extendTheme(overrides);
