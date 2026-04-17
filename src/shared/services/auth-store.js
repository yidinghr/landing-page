import "./runtime-seeds.js";
import "../../../assets/js/auth-store.js";

const authStore = window.YiDingAuthStore || null;

if (!authStore) {
  throw new Error("YiDingAuthStore failed to initialize.");
}

export { authStore };
