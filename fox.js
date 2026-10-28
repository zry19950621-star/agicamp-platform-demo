// fox.js — 狐狸 IP 互动 & 页面小动效（独立于 app.js / navigation.js）
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fox = document.getElementById('heroFox');
  var wrap = fox ? fox.closest('.hero-fox-wrap') : null;

  /* 1) 狐狸视差：鼠标在英雄区移动时，狐狸轻轻倾斜/位移 */
  if (false) { // 原视差已由 v9 的悬停 / 拖拽 / 滚动视差取代，避免 transform 打架
    var hero = document.querySelector('.agency-hero');
    var raf = null;
    hero && hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 ~ 0.5
        var dy = (e.clientY - r.top) / r.height - 0.5;
        fox.style.transform = 'rotate(' + (dx * 5).toFixed(2) + 'deg) translate(' +
          (dx * 14).toFixed(1) + 'px,' + (dy * 10).toFixed(1) + 'px)';
        if (wrap) wrap.style.transform = 'translate(' + (dx * -8).toFixed(1) + 'px,' + (dy * -6).toFixed(1) + 'px)';
        raf = null;
      });
    });
    hero && hero.addEventListener('pointerleave', function () {
      fox.style.transform = ''; wrap && (wrap.style.transform = '');
    });
  }

  /* 2) 点狐狸：开心弹跳 + 迸出星星粒子 */
  if (fox && !reduce) {
    var QUIPS = ['好想法，做成真。', '带个真问题来～', '一起解个题？', '咦，被你发现了！', '给好作品点个赞'];
    fox.addEventListener('click', function () {
      fox.classList.remove('fox-pop');
      void fox.offsetWidth; // 重启动画
      fox.classList.add('fox-pop');
      sparkleBurst(fox);
      var q = document.querySelector('.fox-quips') || document.createElement('div');
      q.className = 'fox-quips';
      q.textContent = QUIPS[Math.floor(Math.random() * QUIPS.length)];
      if (!q.parentNode) wrap && wrap.appendChild(q);
      clearTimeout(q._t);
      q._t = setTimeout(function () { q.classList.add('show'); });
      setTimeout(function () { q.classList.remove('show'); }, 1600);
    });
  }

  function sparkleBurst(el) {
    var r = el.getBoundingClientRect();
    var colors = ['#f4581c', '#f5a623', '#2f7d4f', '#8a2f3c', '#385875'];
    for (var i = 0; i < 10; i++) {
      var s = document.createElement('span');
      s.className = 'spark-particle';
      s.textContent = '•';
      s.style.left = (r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.5) + 'px';
      s.style.top = (r.top + r.height / 2 + (Math.random() - 0.5) * r.height * 0.4) + 'px';
      s.style.color = colors[i % colors.length];
      s.style.setProperty('--dx', (Math.random() - 0.5) * 220 + 'px');
      s.style.setProperty('--dy', (-60 - Math.random() * 140) + 'px');
      s.style.fontSize = (12 + Math.random() * 14) + 'px';
      document.body.appendChild(s);
      (function (node) { setTimeout(function () { node.remove(); }, 1100); })(s);
    }
  }

  /* 3) 滚动渐显：各区块轻柔上浮 */
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('main>section>.section-heading, main>section>.showcase-track, .visual-routes, .ecosystem-grid, .activity-grid, .community-layout, .focus-challenge, .three-grid');
    targets.forEach(function (t) { t.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('reveal-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
    // 兜底：1.5s 后全部渐显，避免任何环境下内容被隐藏
    setTimeout(function () { targets.forEach(function (t) { t.classList.add('reveal-in'); }); }, 1500);
  }
})();

/* ---- v5 互动增强：磁吸按钮 / 展卡 3D 倾斜 / 跑马灯暂停 ---- */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // 1) 主按钮磁吸：光标靠近时按钮轻轻被“吸”过去
  document.querySelectorAll('.primary,.outline,.hero-search button').forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      btn.style.translate = (dx * .18).toFixed(1) + 'px ' + (dy * .22).toFixed(1) + 'px';
    });
    btn.addEventListener('pointerleave', function () { btn.style.translate = ''; });
  });

  // 2) 展卡 3D 倾斜跟随（扇形画廊）
  document.querySelectorAll('.showcase-card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - .5, dy = (e.clientY - r.top) / r.height - .5;
      card.style.transform = 'rotate(0) translateY(-6px) scale(1.04) perspective(700px) rotateY(' +
        (dx * 10).toFixed(1) + 'deg) rotateX(' + (-dy * 8).toFixed(1) + 'deg)';
    });
    card.addEventListener('pointerleave', function () { card.style.transform = ''; });
  });

  // 3) 跑马灯：悬停暂停，移开继续
  var mq = document.querySelector('.marquee');
  if (mq) {
    mq.addEventListener('pointerenter', function () {
      var t = mq.querySelector('.marquee-track'); if (t) t.style.animationPlayState = 'paused';
    });
    mq.addEventListener('pointerleave', function () {
      var t = mq.querySelector('.marquee-track'); if (t) t.style.animationPlayState = '';
    });
  }
})();

/* ---- v9 狐狸互动增强：悬停呼吸 / 拖拽回弹 / 滚动视差 / 土屑粒子 / 连点彩蛋 ---- */
(function () {
  var fox = document.getElementById('heroFox');
  if (!fox) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* A. 悬停：轻轻抬起 */
  if (!reduce) {
    fox.addEventListener('pointerenter', function () { fox.classList.add('hover-lift'); });
    fox.addEventListener('pointerleave', function () { fox.classList.remove('hover-lift'); });
  }

  /* B. 拖拽：可拖着狐狸挪一小段，松手弹回原位 */
  if (!reduce) {
    var dragging = false, startX = 0, startY = 0, moved = 0;
    fox.addEventListener('pointerdown', function (e) {
      dragging = true; moved = 0;
      startX = e.clientX; startY = e.clientY;
      fox.classList.add('dragging'); fox.classList.remove('hover-lift');
      fox.setPointerCapture && fox.setPointerCapture(e.pointerId);
    });
    fox.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
      dx = Math.max(-160, Math.min(160, dx)); dy = Math.max(-90, Math.min(90, dy));
      fox.style.transform = 'translate(' + dx.toFixed(0) + 'px,' + dy.toFixed(0) + 'px) rotate(' + (dx * .02).toFixed(2) + 'deg)';
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      fox.classList.remove('dragging');
      fox.style.transform = '';
    }
    fox.addEventListener('pointerup', endDrag);
    fox.addEventListener('pointercancel', endDrag);
    fox.dataset.dragMoved = '0';
    fox.addEventListener('click', function (e) { if (moved > 12) { e.stopPropagation(); } }, true);
  }

  /* C. 滚动视差：往下滚时狐狸轻轻下沉 */
  if (!reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, 600);
        fox.style.setProperty('--scrollY', (y * .06).toFixed(1) + 'px');
        fox.style.marginTop = (y * .06).toFixed(1) + 'px';
        ticking = false;
      });
    }, { passive: true });
  }

  /* D. 点击：土屑粒子 + 连点彩蛋（5 次触发特别反应）*/
  if (!reduce) {
    var clicks = 0, lastClick = 0;
    fox.addEventListener('click', function () {
      var now = Date.now();
      clicks = (now - lastClick < 1400) ? clicks + 1 : 1;
      lastClick = now;
      dirtBurst(fox, clicks >= 5 ? 16 : 8);
      if (clicks >= 5) {
        clicks = 0;
        fox.style.rotate = '';
        fox.classList.add('fox-pop');
        setTimeout(function () { fox.classList.remove('fox-pop'); }, 600);
        var q = document.querySelector('.fox-quips');
        if (q) { q.textContent = '你戳了五下，狐狸决定躺平一会儿。'; q.classList.add('show'); setTimeout(function(){q.classList.remove('show')},2200); }
      }
    });
  }

  function dirtBurst(el, n) {
    var r = el.getBoundingClientRect();
    for (var i = 0; i < n; i++) {
      var d = document.createElement('span');
      d.className = 'dirt-particle' + (Math.random() > .5 ? ' small' : '');
      d.style.left = (r.left + r.width / 2 + (Math.random() - .5) * r.width * .55) + 'px';
      d.style.top = (r.top + r.height * .72 + (Math.random() - .5) * r.height * .2) + 'px';
      d.style.setProperty('--dx', ((Math.random() - .5) * 160).toFixed(0) + 'px');
      d.style.setProperty('--dy', (-30 - Math.random() * 90).toFixed(0) + 'px');
      document.body.appendChild(d);
      (function (node) { setTimeout(function () { node.remove(); }, 950); })(d);
    }
  }
})();

/* ---- v11：点狐狸 → 蹦出「模力揭榜」企业文件夹卡 ---- */
(function () {
  var fox = document.getElementById('heroFox');
  if (!fox) return;

  function openFoxFolder() {
    if (typeof show !== 'function' || typeof form !== 'function' || typeof close !== 'function') return;
    show('<div class="fox-folder-modal">' +
      '<span class="eyebrow">模力揭榜计划 / 开放征题</span>' +
      '<h2>收到一个企业真问题</h2>' +
      '<p class="ffm-sub"><em>模力工场邀请你，一起解题。</em></p>' +
      '<img class="ffm-folder" src="assets/folder-fox-cutout.png" alt="企业需求文件夹">' +
      '<div class="ffm-actions">' +
      '<button type="button" class="outline" data-ffm="chat">先聊聊</button>' +
      '<button type="button" class="primary" data-ffm="reveal">我来揭榜</button>' +
      '</div>' +
      '<p class="form-note">演示交互：不会发送或保存任何信息。</p>' +
      '</div>');
    document.querySelector('[data-ffm="chat"]').onclick = function () { close(); form('need'); };
    document.querySelector('[data-ffm="reveal"]').onclick = function () { close(); form('partner'); };
  }

  fox.addEventListener('click', function () {
    // 让弹跳先演 320ms，再掀开文件夹
    setTimeout(openFoxFolder, 320);
  });
})();
