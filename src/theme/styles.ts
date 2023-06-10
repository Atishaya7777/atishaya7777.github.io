const styles = {
  global: (props: any) => ({
    body: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: "normal",
      fontSize: "md",
      bg: "primary.50",
      color: props.colorMode === "dark" ? "white" : "primary.500",
      lineHeight: "base",
    },
  }),
};

export default styles;
