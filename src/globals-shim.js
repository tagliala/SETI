import $ from "jquery";
import Alert from "bootstrap/js/src/alert";
import Collapse from "bootstrap/js/src/collapse";
import Dropdown from "bootstrap/js/src/dropdown";
import Modal from "bootstrap/js/src/modal";
import Tab from "bootstrap/js/src/tab";
import Tooltip from "bootstrap/js/src/tooltip";

const bootstrap = { Alert, Collapse, Dropdown, Modal, Tab, Tooltip };
window.bootstrap = bootstrap;
window.$ = $;
window.jQuery = $;

export { $, bootstrap };
