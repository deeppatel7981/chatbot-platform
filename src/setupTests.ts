import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

global.IntersectionObserver = class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;

Element.prototype.scrollIntoView = vi.fn();

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown> & React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { fill: _fill, ...rest } = props;
    const width = (rest.width as number) ?? 480;
    const height = (rest.height as number) ?? 280;
    return React.createElement("img", { ...rest, width, height });
  },
}));

vi.mock("next/link", async () => {
  const R = await import("react");
  return {
    default: ({
      children,
      href,
      ...rest
    }: { children: React.ReactNode; href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      R.createElement("a", { href, ...rest }, children),
  };
});
