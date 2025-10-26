
import type { MindMapNode } from '../types';

const triggerDownload = (href: string, filename: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

export const exportAsJson = (data: MindMapNode) => {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  triggerDownload(jsonString, 'mindmap.json');
};

export const exportAsSvg = () => {
  const svgElement = document.querySelector('svg');
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  triggerDownload(url, 'mindmap.svg');
};

export const exportAsPng = () => {
  const svgElement = document.querySelector('svg');
  if (!svgElement) return;

  const canvas = document.createElement('canvas');
  const svgSize = svgElement.getBoundingClientRect();
  canvas.width = svgSize.width * 2; // Increase resolution
  canvas.height = svgSize.height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#111827'; // bg-gray-900
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    triggerDownload(pngUrl, 'mindmap.png');
  };
  img.src = url;
};
