// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "@/components/seo/json-ld";

describe("JsonLd component", () => {
  it("renders a script tag with application/ld+json type", () => {
    const data = { "@context": "https://schema.org", "@type": "Organization", name: "Veloura" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });

  it("serializes data as JSON in the script tag", () => {
    const data = { "@context": "https://schema.org", "@type": "Product", name: "Test" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.innerHTML)).toEqual(data);
  });

  it("handles array data", () => {
    const data = [
      { "@context": "https://schema.org", "@type": "BreadcrumbList" },
      { "@context": "https://schema.org", "@type": "Product" },
    ];
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script!.innerHTML)).toHaveLength(2);
  });
});
