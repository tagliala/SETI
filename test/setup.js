import { beforeAll } from "vitest";
import jquery from "jquery";

// Expose jQuery globally so IIFE-style modules can access $ and jQuery.
beforeAll(() => {
  global.$ = jquery;
  global.jQuery = jquery;
  global.window = global.window || {};
  global.window.SETI = global.window.SETI || {};
});
