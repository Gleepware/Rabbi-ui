import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

beforeEach(() => {
  if (typeof globalThis.requestIdleCallback !== "function") {
    globalThis.requestIdleCallback = (callback) => setTimeout(callback, 0);
    globalThis.cancelIdleCallback = (id) => clearTimeout(id);
  }
  localStorage.clear();
  globalThis.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();
});