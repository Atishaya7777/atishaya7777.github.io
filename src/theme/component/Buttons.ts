const Button = {
  baseStyle: {
    fontSize: "sm",
    lineHeight: "base",
    fontWeight: "normal",
    w: "100%",
  },
  variants: {
    "primary-brown": {
      bg: "primary.400",
      color: "primary.50",
      borderRadius: "base",
      _hover: {
        opacity: 0.8,
      },
    },
  },
  sizes: {
    md: {
      fontSize: "sm",
    },
    lg: {
      fontSize: "sm",
      fontWeight: "semibold",
    },
  },
  defaultProps: {
    colorScheme: "primary",
    fontSize: "sm",
  },
};

export default Button;
