import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import App from "containers/App";

test("renders hello message", () => {
  const { getByText } = render(<App />);
  const helloElement = getByText(/Hello world/i);
  expect(helloElement).toBeInTheDocument();
});
