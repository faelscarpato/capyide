export function showToast(message) {
  const el = document.createElement('div');
  el.className =
    'fixed bottom-16 right-4 bg-zinc-900/95 text-white text-sm px-4 py-2 rounded shadow-lg border border-zinc-700 z-[70] backdrop-blur';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => el.remove(), 220);
  }, 2200);
}
