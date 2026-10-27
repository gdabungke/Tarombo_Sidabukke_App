type ToastType = "success" | "error" | "info" | "warning";

export function showToast(message: string, type: ToastType = "info", duration = 3500) {
  let container = document.getElementById("tarombo-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "tarombo-toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `tarombo-toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function showNotification(
  containerSelector: string,
  message: string,
  type: "info" | "success" | "error" = "info",
  autoDismissMs = 0
) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Hapus notifikasi lama jika ada di kontainer tersebut
  const existing = container.querySelector(".tarombo-notification");
  if (existing) existing.remove();

  const notif = document.createElement("div");
  notif.className = `tarombo-notification ${type}`;

  const icon = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  notif.innerHTML = `<span>${icon}</span> <div>${message}</div>`;

  // Sisipkan di paling atas kontainer
  container.prepend(notif);

  // Jika ingin hilang otomatis
  if (autoDismissMs > 0) {
    setTimeout(() => {
      notif.style.transition = "opacity 0.3s ease";
      notif.style.opacity = "0";
      setTimeout(() => notif.remove(), 300);
    }, autoDismissMs);
  }
}