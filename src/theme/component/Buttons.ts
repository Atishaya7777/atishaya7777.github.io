const Button = {
  baseStyle: {
    fontSize: 'sm',
    lineHeight: 'base',
    fontWeight: 'normal',
  },
  variants: {
    'primary-ghost': {
      colorScheme: 'primary',
      bg: 'primary.50',
      color: 'primary.500',
      '&:hover': {
        bg: 'primary.500',
        color: 'white',
      },
    },
  },
  sizes: {
    md: {
      fontSize: 'sm',
    },
    lg: {
      fontSize: 'sm',
      fontWeight: 'semibold',
    },
  },
  defaultProps: {
    colorScheme: 'primary',
    fontSize: 'sm',
  },
};

export default Button;
