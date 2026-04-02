/* ═══════════════════════════════════════════
   ERO RIVESITE — Main JavaScript
   assets/js/main.js
═══════════════════════════════════════════ */

'use strict';

/* ─── Smooth Scroll cho Menu ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }
  });
});

/* ─── Nav sticky state ─── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ─── Reveal on scroll ─── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════
   CAROUSEL 3D — Fixed (overflow + near class)
═══════════════════════════════════════════════ */
(function initCarousel() {
  const track    = document.querySelector('.carousel-track');
  if (!track) return;

  const wrapper  = track.closest('.carousel-container');
  const nextBtn  = wrapper.querySelector('.next-btn');
  const prevBtn  = wrapper.querySelector('.prev-btn');
  const dotsWrap = document.getElementById('carouselDots');

  const items      = Array.from(track.children);
  const ITEM_GAP   = 28;   // phải khớp với CSS gap
  let currentIndex = Math.floor(items.length / 2);  // bắt đầu ở giữa
  let isAnimating  = false;

  /* ── Tạo dots ── */
  items.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Ảnh ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getDots() { return Array.from(dotsWrap.children); }

  /* ── Cập nhật trạng thái ── */
  function updateCarousel(animate = true) {
    if (!animate) track.style.transition = 'none';

    items.forEach((item, i) => {
      item.classList.remove('active', 'near');
      if (i === currentIndex) {
        item.classList.add('active');
      } else if (Math.abs(i - currentIndex) === 1) {
        item.classList.add('near');
      }
    });

    getDots().forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });

    /* Tính offset để item active vào giữa wrapper */
    const itemWidth    = items[0].offsetWidth;
    const wrapperWidth = wrapper.offsetWidth;
    const centerOffset = (wrapperWidth / 2) - (itemWidth / 2);
    const translation  = centerOffset - currentIndex * (itemWidth + ITEM_GAP);

    track.style.transform = `translateX(${translation}px)`;

    if (!animate) {
      // Force reflow rồi bật lại transition
      track.offsetHeight;
      track.style.transition = '';
    }
  }

  function goTo(index) {
    if (isAnimating) return;
    isAnimating = true;
    currentIndex = (index + items.length) % items.length;
    updateCarousel();
    setTimeout(() => { isAnimating = false; }, 680);
  }

  nextBtn.addEventListener('click', () => goTo(currentIndex + 1));
  prevBtn.addEventListener('click', () => goTo(currentIndex - 1));

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (i !== currentIndex) goTo(i);
    });
  });

  /* Touch / swipe support */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(currentIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });

  /* Resize: recalc không animate */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => updateCarousel(false), 120);
  }, { passive: true });

  /* Init sau khi font/layout ổn định */
  requestAnimationFrame(() => setTimeout(() => updateCarousel(false), 80));
})();


/* ═══════════════════════════════════════════
   FORM ĐĂNG KÝ
═══════════════════════════════════════════ */
function setError(id, msg) {
  const el = document.getElementById('err-' + id);
  if (el) el.textContent = msg;
  const input = document.getElementById(id);
  if (input) input.style.borderColor = msg ? '#e07070' : '';
}

function clearErrors() {
  ['fullname', 'phone'].forEach(id => setError(id, ''));
}

function validatePhone(val) {
  return /^(0|\+84)[0-9]{8,10}$/.test(val.replace(/\s/g, ''));
}

document.getElementById('mainForm').addEventListener('submit', function (e) {
  e.preventDefault();
  clearErrors();

  const fullname = document.getElementById('fullname').value.trim();
  const phone    = document.getElementById('phone').value.trim();
  const consent  = document.getElementById('consent').checked;
  let valid = true;

  if (!fullname) { setError('fullname', 'Vui lòng nhập họ tên.'); valid = false; }
  if (!phone) { setError('phone', 'Vui lòng nhập số điện thoại.'); valid = false; }
  else if (!validatePhone(phone)) { setError('phone', 'Số điện thoại không hợp lệ.'); valid = false; }
  if (!consent) { alert('Vui lòng đồng ý chính sách bảo mật để tiếp tục.'); valid = false; }
  if (!valid) return;

  const submitBtn = this.querySelector('.btn-submit');
  const originalBtnText = submitBtn.textContent;
  submitBtn.textContent = 'Đang gửi...';
  submitBtn.disabled = true;

  fetch('http://localhost:3000/api/dang-ky', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ho_ten:            document.getElementById('fullname').value,
      so_dien_thoai:     document.getElementById('phone').value,
      email:             document.getElementById('email').value,
      san_pham:          document.getElementById('product').value,
      ngan_sach:         document.getElementById('budget').value,
      thoi_gian_lien_he: document.getElementById('contact-time').value,
      ghi_chu:           document.getElementById('note').value
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showSuccess();
    } else {
      alert(data.message || 'Có lỗi xảy ra từ máy chủ.');
    }
  })
  .catch(() => {
    if (confirm('Không thể kết nối đến máy chủ. Bạn có muốn giả lập gửi thành công để xem giao diện không?')) {
      showSuccess();
    }
  })
  .finally(() => {
    submitBtn.textContent = originalBtnText;
    submitBtn.disabled = false;
  });
});

function showSuccess() {
  document.getElementById('mainForm').style.display   = 'none';
  document.getElementById('successMsg').style.display = 'block';
  document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
}

function resetForm() {
  document.getElementById('mainForm').reset();
  clearErrors();
  document.getElementById('mainForm').style.display   = 'block';
  document.getElementById('successMsg').style.display = 'none';
}
