// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Price } from "@/components/store/price";

describe("Price component", () => {
  it("renders price formatted as USD currency", () => {
    render(<Price amountCents={11200} />);
    expect(screen.getByText("$112.00")).toBeInTheDocument();
  });

  it("renders zero price", () => {
    render(<Price amountCents={0} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("renders cents correctly", () => {
    render(<Price amountCents={199} />);
    expect(screen.getByText("$1.99")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Price amountCents={5000} className="text-lg font-bold" />);
    const span = container.querySelector("span");
    expect(span).toHaveClass("text-lg", "font-bold");
  });
});
