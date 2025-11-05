import chineseHtml from './index.html';
import englishHtml from './en.html';
import threeDHtml from './elysia-3d.html';

document.addEventListener('DOMContentLoaded', () => {
  let htmlToUse = chineseHtml;  // 默认中文
  const url = new URL(window.location.href);
  const pathname = url.pathname.slice(1);
  const params = new URLSearchParams(url.search);

  if (pathname === 'en' || params.get('lang') === 'en') {
    htmlToUse = englishHtml;
  } else if (pathname === '3d' || params.get('page') === '3d') {
    htmlToUse = threeDHtml;
  } else if (params.get('lang') === 'zh') {
    htmlToUse = chineseHtml;
  }

  document.body.innerHTML = htmlToUse;

  if (htmlToUse === threeDHtml) {
    console.log('3D page loaded');  // 加3D初始化，如Three.js
  }

  console.log('Loaded: ' + (htmlToUse === chineseHtml ? 'ZH' : htmlToUse === englishHtml ? 'EN' : '3D'));
});
