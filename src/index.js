// Entry point — imports guarantee bundling order.
import "./vendor/jquery.drag-drop.plugin.js";
import "./engine.js";
import "./plugins.js";
import "./main.js";

// Validate SETI namespace is set up.
if (typeof window.SETI === "undefined") {
  throw new Error("SETI namespace not initialised");
}
