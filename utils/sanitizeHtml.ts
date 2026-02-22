const BLOCKED_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'base',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option'
]);

const SAFE_URL_PATTERN = /^(https?:|mailto:|tel:|#)/i;

const cleanAttributes = (element: Element) => {
  const attrs = [...element.attributes];

  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const value = attr.value.trim();

    if (name.startsWith('on') || name === 'style') {
      element.removeAttribute(attr.name);
      continue;
    }

    if ((name === 'href' || name === 'src') && value && !SAFE_URL_PATTERN.test(value)) {
      element.removeAttribute(attr.name);
      continue;
    }
  }
};

const walkAndClean = (node: Node) => {
  if (!(node instanceof Element)) {
    return;
  }

  const tagName = node.tagName.toLowerCase();
  if (BLOCKED_TAGS.has(tagName)) {
    node.remove();
    return;
  }

  cleanAttributes(node);

  const children = [...node.children];
  for (const child of children) {
    walkAndClean(child);
  }
};

export const sanitizeHtml = (html: string): string => {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const bodyChildren = [...doc.body.children];
  for (const child of bodyChildren) {
    walkAndClean(child);
  }

  return doc.body.innerHTML;
};
