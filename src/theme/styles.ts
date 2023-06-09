const styles = {
  global: (props: any) => ({
    body: {
      fontFamily: '"Muli", sans-serif',
      fontWeight: 'normal',
      fontSize: 'sm',
      // letterSpacing: 'wide',
      bg: 'gray.100',
      color: props.colorMode === 'dark' ? 'white' : 'primary.900',
      lineHeight: 'base',
    },
    // '&::-webkit-scrollbar': {
    //   width: '10px',
    //   height: '10px',
    //   borderRadius: 'lg',
    // },
    // '&::-webkit-scrollbar-thumb': {
    //   background: 'secondary.500',
    //   borderRadius: 'lg',
    // },
    // '&::-webkit-scrollbar-track': {
    //   background: 'secondary.100',
    //   borderRadius: 'lg',
    // },
  }),
};

export default styles;
