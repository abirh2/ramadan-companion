import sanitizeHtml from 'sanitize-html'

/** Keep commentary formatting, but never render provider-supplied active HTML. */
export function sanitizeTafsirHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li', 'blockquote', 'h2', 'h3', 'h4', 'sup', 'sub',
    ],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
  })
}
