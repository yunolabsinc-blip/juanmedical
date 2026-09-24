'use strict';
// Honor OS motion preferences and offer a persistent on-page pause control.
const pageRoot = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('.motion-toggle');
let motionPaused = false;
function syncMotionPreference() {
  pageRoot.classList.toggle('motion-reduced', reducedMotion.matches);
  pageRoot.classList.toggle('motion-paused', motionPaused);
  motionToggle.disabled = reducedMotion.matches;
  motionToggle.setAttribute('aria-pressed', String(reducedMotion.matches || motionPaused));
  motionToggle.querySelector('.motion-icon').textContent = reducedMotion.matches || motionPaused ? '▷' : 'Ⅱ';
  motionToggle.querySelector('.motion-label').textContent = reducedMotion.matches ? '동작 줄이기 적용' : motionPaused ? '모션 재생' : '모션 정지';
}
motionToggle.hidden = false;
motionToggle.addEventListener('click', () => {
  motionPaused = !motionPaused;
  syncMotionPreference();
});
reducedMotion.addEventListener('change', syncMotionPreference);
syncMotionPreference();
document.addEventListener('visibilitychange', () => {
  pageRoot.classList.toggle('motion-background', document.hidden);
});
if ('IntersectionObserver' in window) {
  const heroObserver = new IntersectionObserver(entries => {
    pageRoot.classList.toggle('hero-offscreen', !entries[0].isIntersecting);
  });
  heroObserver.observe(document.querySelector('.hero'));
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: .1 });
  document.querySelectorAll('.about-grid, .section-heading, .business-card, .strength-copy, .strength-list article, .contact-copy, #inquiry').forEach(element => {
    if (element.getBoundingClientRect().top >= window.innerHeight && !reducedMotion.matches) {
      element.classList.add('reveal');
      revealObserver.observe(element);
    }
  });
}

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '메뉴 열기');
}
menuToggle.addEventListener('click', () => {
  const opened = navigation.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(opened));
  menuToggle.setAttribute('aria-label', opened ? '메뉴 닫기' : '메뉴 열기');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuToggle.focus();
  }
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
document.querySelector('#year').textContent = String(new Date().getFullYear());
const inquiry = document.querySelector('#inquiry');
document.querySelectorAll('[data-category]').forEach(link => {
  link.addEventListener('click', () => {
    inquiry.elements.category.value = link.dataset.category;
  });
});
const emailDialog = document.querySelector('#email-dialog');
const preview = document.querySelector('#email-preview');
const emailLink = document.querySelector('#email-link');
const copyStatus = document.querySelector('#copy-status');
let emailBody = '';
inquiry.addEventListener('submit', event => {
  event.preventDefault();
  if (!inquiry.reportValidity()) return;
  const data = new FormData(inquiry);
  const value = key => String(data.get(key) || '').trim();
  emailBody = `주안메디칼 사업 문의\n\n문의 분야: ${value('category')}\n회사명 / 의료기관명: ${value('company')}\n담당자명: ${value('name')}\n연락처: ${value('phone')}\n이메일: ${value('email')}\n\n문의 내용\n${value('message')}\n\n문의 응대를 위한 개인정보 수집 및 이용에 동의합니다.`;
  preview.textContent = emailBody;
  emailLink.href = `mailto:juanmedicalkorea@gmail.com?subject=${encodeURIComponent(`[주안메디칼 문의] ${value('category')} - ${value('company')}`)}&body=${encodeURIComponent(emailBody)}`;
  copyStatus.textContent = '';
  emailDialog.showModal();
});
document.querySelector('#close-dialog').addEventListener('click', () => emailDialog.close());
emailDialog.addEventListener('click', event => {
  const rect = emailDialog.getBoundingClientRect();
  if (event.target === emailDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) emailDialog.close();
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(emailBody);
    copyStatus.textContent = '문의 내용을 복사했습니다. 이메일에 붙여 넣어 주세요.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    copyStatus.textContent = '자동 복사를 사용할 수 없습니다. 선택된 내용을 직접 복사해 주세요.';
  }
});
