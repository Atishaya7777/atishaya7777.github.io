const Input = {
  baseStyle: {
    overflow: "none",
    borderRadius: 0,
  },
  variants: {
    "blue-unstyled": {
      field: {
        border: "hidden",
        bg: "transparent",
        fontWeight: "bold",
        color: "primary.500",
        caretColor: "primary.500",
      },
    },
  },
  sizes: {},
  defaultProps: {
    borderRadius: "0",
    errorBorderColor: "error.500",
  },
};

export default Input;
