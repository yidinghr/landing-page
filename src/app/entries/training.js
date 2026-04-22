import "../../shared/services/auth-store.js";
import { init } from "../../features/training/training-controller.js";

const _auth = window.YiDingAuthStore;
if (_auth && !_auth.getSession()) {
  window.location.replace("../../index.html");
} else {
  init();
}
