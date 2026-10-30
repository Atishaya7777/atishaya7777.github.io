import { lookup } from 'node:dns/promises';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parse, type DefaultTreeAdapterMap } from 'parse5';
import { sha256, WORK } from './validation';

type Node = DefaultTreeAdapterMap['node'];
export interface SourcePage { url: string; text: string; checkedAt: string; hash: string; changed: boolean; links: { url: string; text: string }[]; images: { url: string; alt: string; context: string }[] }
const ignored = new Set(['script', 'style', 'noscript', 'nav', 'footer', 'svg', 'header']);
const children = (node: Node): Node[] => 'childNodes' in node ? node.childNodes : [];
const attr = (node: Node, name: string) => 'attrs' in node ? node.attrs.find(a => a.name === name)?.value : undefined;
export function textOf(node: Node): string {
  if ('tagName' in node && ignored.has(node.tagName)) return '';
  if (node.nodeName === '#text') return (node as DefaultTreeAdapterMap['textNode']).value;
  return children(node).map(textOf).join(' ').replace(/\s+/g, ' ').trim();
}
export function parsePage(html: string, url: string): Pick<SourcePage, 'text' | 'links' | 'images'> {
  const document = parse(html);
  const find = (node: Node): Node | undefined => ('tagName' in node && (node.tagName === 'main' || attr(node, 'role') === 'main') ? node : children(node).map(find).find(Boolean));
  const root = find(document) ?? document;
  const links: SourcePage['links'] = [];
  const images: SourcePage['images'] = [];
  function visit(node: Node, parent: Node = node) {
    if ('tagName' in node && ignored.has(node.tagName)) return;
    try {
      if ('tagName' in node && node.tagName === 'a' && attr(node, 'href')) {
        if (/mailto|^\s*(?:tel|javascript|data)\s*:/i.test(attr(node, 'href')!)) return;
        const resolved = new URL(attr(node, 'href')!, url);
        resolved.hash = '';
        if (['http:', 'https:'].includes(resolved.protocol)) links.push({ url: resolved.href, text: textOf(node).slice(0, 200) });
      }
      if ('tagName' in node && node.tagName === 'img' && attr(node, 'src')) images.push({ url: new URL(attr(node, 'src')!, url).href, alt: attr(node, 'alt') ?? '', context: textOf(parent).slice(0, 600) });
    } catch { /* Ignore malformed source URLs. */ }
    for (const child of children(node)) visit(child, node);
  }
  visit(root);
  return { text: textOf(root).slice(0, 110000), links: [...new Map(links.map(l => [l.url, l])).values()], images };
}
export async function assertPublicUrl(url: string): Promise<void> {
  const u = new URL(url);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port))) throw new Error(`Unsupported URL: ${url}`);
  const addresses = await lookup(u.hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::|fc|fd|fe80)/i.test(address))) throw new Error(`Non-public destination refused: ${u.hostname}`);
}
const nextRequest = new Map<string, number>();
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function download(url: string, maxBytes = 2_000_000): Promise<{ bytes: Buffer; contentType: string; url: string }> {
  let target = url;
  for (let redirect = 0; redirect < 6; redirect++) {
    await assertPublicUrl(target);
    const host = new URL(target).host;
    await pause(Math.max(0, (nextRequest.get(host) ?? 0) - Date.now()));
    nextRequest.set(host, Date.now() + 1200);
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        response = await fetch(target, { redirect: 'manual', signal: AbortSignal.timeout(25000), headers: { 'User-Agent': 'GraduateDirectory/1.0 (academic directory; contact: atishaya7777@gmail.com)', Accept: 'text/html,image/jpeg,image/png,image/webp;q=0.8,*/*;q=0.5' } });
        if (![429, 500, 502, 503, 504].includes(response.status)) break;
      } catch (error) { if (attempt === 2) throw error; }
      await response?.body?.cancel();
      await pause(1500 * (attempt + 1));
    }
    if (!response) throw new Error(`No response: ${target}`);
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location) throw new Error(`Redirect without location: ${target}`);
      target = new URL(location, target).href; continue;
    }
    if (!response.ok) { await response.body?.cancel(); throw new Error(`HTTP ${response.status}: ${target}`); }
    const reader = response.body?.getReader();
    if (!reader) throw new Error(`Empty response: ${target}`);
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > maxBytes) { await reader.cancel(); throw new Error(`Response too large: ${target}`); } chunks.push(part.value); }
    return { bytes: Buffer.concat(chunks), contentType: response.headers.get('content-type') ?? '', url: target };
  }
  throw new Error(`Too many redirects: ${url}`);
}
export async function fetchPage(url: string): Promise<SourcePage> {
  const file = path.join(WORK, 'cache', `${sha256(url)}.json`);
  let previous: SourcePage | undefined;
  try { previous = JSON.parse(await readFile(file, 'utf8')); } catch { /* First visit. */ }
  const response = await download(url);
  if (!response.contentType.includes('text/html')) throw new Error(`Not an HTML page: ${url}`);
  const parsed = parsePage(response.bytes.toString('utf8'), response.url);
  if (parsed.text.length < 100) throw new Error(`Empty/dynamic profile requires review: ${url}`);
  const hash = sha256(parsed.text);
  const page = { ...parsed, url, checkedAt: new Date().toISOString(), hash, changed: previous?.hash !== hash };
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(page));
  return page;
}
export function relatedLinks(page: SourcePage, name: string): string[] {
  const surname = name.split(/\s+/).at(-1)!.toLowerCase();
  return page.links.filter(l => /\b(?:personal|homepage|home page|lab(?:oratory)?|join|openings?|prospective|recruit|graduate|étudiant|recrut)/i.test(l.text) || l.text.toLowerCase().includes(surname)).map(l => l.url).filter(url => !/\.(pdf|zip|mp4|png|jpg)(\?|$)/i.test(url)).slice(0, 6);
}
