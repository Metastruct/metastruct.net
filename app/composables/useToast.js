// Replaces $buefy.toast: a shared queue that ToastStack renders.
export function useToast() {
  const toasts = useState("toasts", () => []);
  let nextId = 0;

  function open({ message, type = "is-success", duration = 2000 }) {
    const id = `${Date.now()}-${nextId++}`;
    toasts.value = [...toasts.value, { id, message, type }];
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    }, duration);
  }

  return { toasts, open };
}
