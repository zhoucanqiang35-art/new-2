let messages;
export function text(key, values = {}) {
  messages ??= JSON.parse(document.querySelector('#runtime-messages')?.textContent || '{}');
  return (messages[key] || key).replace(/\{(\w+)\}/g, (label, name) => values[name] ?? label);
}
