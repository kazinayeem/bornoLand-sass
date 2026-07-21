/** Detect if a string contains HTML markup. */
export function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

/** Strip HTML tags for plain-text previews. */
export function stripHtml(text: string): string {
  if (!text) return "";
  if (typeof document !== "undefined") {
    const el = document.createElement("div");
    el.innerHTML = text;
    return (el.textContent || el.innerText || "").replace(/\s+/g, " ").trim();
  }
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** Short plain-text excerpt from HTML or plain content. */
export function excerptContent(text: string, maxLength = 220): string {
  const plain = isHtmlContent(text) ? stripHtml(text) : text.trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}…`;
}
