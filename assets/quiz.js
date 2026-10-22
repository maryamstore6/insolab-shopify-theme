/*!
 * quiz.js — Kuiz keselesaan kaki InsoLab
 *
 * Aliran: intro (soalan 1) → 2 → 3 → 4 → hasil.
 * Skor: 4–6 = 1 unit, 7–9 = 1 unit (cadang 2 unit), 10–11 = 2 unit/bundle.
 * Jawapan dihantar bersama pesanan melalui line item properties Shopify.
 *
 * Tiada kebergantungan luar. Berfungsi walaupun GSAP/Lenis tiada.
 */
(function () {
  'use strict';

  var THRESHOLDS = { single: 6, suggested: 9 }; // <=6 = 1 unit, 7..9 = 1 unit + cadang, >=10 = bundle

  function pesos(n) {
    return 'RM' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function init(root) {
    if (!root || root.dataset.quizReady === '1') return;
    root.dataset.quizReady = '1';

    var form = root.querySelector('[data-quiz-form]');
    var steps = Array.prototype.slice.call(root.querySelectorAll('[data-quiz-step]'));
    var resultBox = root.querySelector('[data-quiz-result]');
    var progressBar = root.querySelector('[data-quiz-progress]');
    var counter = root.querySelector('[data-quiz-counter]');
    var backBtn = root.querySelector('[data-quiz-back]');
    var nextBtn = root.querySelector('[data-quiz-next]');
    var restartBtn = root.querySelector('[data-quiz-restart]');
    var orderLink = root.querySelector('[data-quiz-order]');
    var waLink = root.querySelector('[data-quiz-wa]');
    var resultTitle = root.querySelector('[data-quiz-result-title]');
    var resultPrice = root.querySelector('[data-quiz-result-price]');
    var resultWhy = root.querySelector('[data-quiz-result-why]');
    var answersList = root.querySelector('[data-quiz-answers]');

    var unitPrice = parseInt(root.dataset.quizUnitPrice, 10) || 599;
    var bundlePrice = parseInt(root.dataset.quizBundlePrice, 10) || 1099;
    var waNumber = root.dataset.quizWa || '60176055349';
    var tierActive = root.dataset.quizTierActive || 'On My Feet All Day';
    var tierNormal = root.dataset.quizTierNormal || 'Normal Everyday Activity';

    var index = 0; // 0..steps.length-1
    var total = steps.length;

    function answers() {
      var out = {};
      steps.forEach(function (step) {
        var checked = step.querySelector('input[type="radio"]:checked');
        if (checked) out[checked.name] = checked;
      });
      return out;
    }

    function score() {
      return Object.keys(answers()).reduce(function (sum, key) {
        return sum + (parseInt(answers()[key].dataset.score, 10) || 0);
      }, 0);
    }

    function show(i) {
      index = Math.max(0, Math.min(i, total - 1));
      steps.forEach(function (step, n) {
        step.classList.toggle('quiz-step--active', n === index);
      });
      if (resultBox) resultBox.hidden = true;
      if (form) form.hidden = false;

      if (backBtn) backBtn.hidden = index === 0;
      if (nextBtn) nextBtn.textContent = index === total - 1
        ? nextBtn.dataset.lastLabel || nextBtn.textContent
        : nextBtn.dataset.nextLabel || nextBtn.textContent;

      if (progressBar) progressBar.style.width = ((index) / total * 100) + '%';
      if (counter) counter.textContent = 'Soalan ' + (index + 1) + ' daripada ' + total;

      // fokus ke soalan semasa untuk pengguna papan kekunci
      var legend = steps[index] && steps[index].querySelector('.quiz-q');
      if (legend) {
        steps[index].setAttribute('tabindex', '-1');
        try { steps[index].focus({ preventScroll: false }); } catch (e) {}
      }
    }

    function buildAnswersArray(ans) {
      var labels = { q1: 'Lokasi tidak selesa', q2: 'Tempoh', q3: 'Bentuk tapak kaki', q4: 'Aktiviti harian' };
      return Object.keys(labels).map(function (k) {
        return { key: k, label: labels[k], value: ans[k] ? ans[k].value : '—' };
      });
    }

    // Produk ditentukan oleh aktiviti harian (Q4); bilangan unit oleh jumlah skor.
    function pickTier(ans) {
      var activity = ans.q4 ? ans.q4.value : '';
      // "Banyak duduk" → aktiviti ringan; selebihnya → sokongan tegas
      var light = /banyak duduk|duduk/i.test(activity);
      return light ? tierNormal : tierActive;
    }

    function recommend(totalScore, ans) {
      var tier = pickTier(ans || {});
      if (totalScore >= 10) {
        return {
          tier: tier,
          units: 2,
          price: bundlePrice,
          title: tier + ' — 2 unit',
          why: 'Tekanan pada kaki anda tinggi. Dua unit memberi sokongan seimbang untuk kedua belah kaki, dan lebih jimat berbanding beli berasingan.'
        };
      }
      if (totalScore >= 7) {
        return {
          tier: tier,
          units: 1,
          price: unitPrice,
          title: tier + ' — 1 unit',
          why: 'Sokongan sederhana diperlukan. Satu unit cukup untuk kaki yang paling kerap tidak selesa. Ramai pelanggan memilih 2 unit supaya kedua belah kaki seimbang.'
        };
      }
      return {
        tier: tier,
        units: 1,
        price: unitPrice,
        title: tier + ' — 1 unit',
        why: 'Kaki anda memerlukan sokongan asas. Satu unit sudah memadai untuk mula.'
      };
    }

    function showResult() {
      var ans = answers();
      var totalScore = score();
      var rec = recommend(totalScore, ans);
      var rows = buildAnswersArray(ans);

      if (resultTitle) resultTitle.textContent = rec.title;
      if (resultPrice) {
        resultPrice.textContent = pesos(rec.price) +
          (rec.units === 2 ? ' untuk 2 unit (jimat ' + pesos(unitPrice * 2 - bundlePrice) + ')' : '');
      }
      if (resultWhy) resultWhy.textContent = rec.why;

      if (answersList) {
        answersList.innerHTML = '';
        rows.forEach(function (row) {
          var li = document.createElement('li');
          li.textContent = row.label + ': ' + row.value;
          answersList.appendChild(li);
        });
      }

      // Teks WhatsApp dengan semua jawapan
      var waText = 'Hai InsoLab, saya baru selesai kuiz keselesaan kaki.\n\n' +
        rows.map(function (r) { return r.label + ': ' + r.value; }).join('\n') +
        '\n\nSkor: ' + totalScore + '\nSyor sistem: ' + rec.title + ' (' + pesos(rec.price) + ')' +
        '\n\nSaya berminat untuk teruskan.';
      if (waLink) waLink.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waText);

      // Hantar jawapan bersama pesanan: line item properties pada borang produk
      attachToOrderForm(rows, totalScore, rec);

      if (form) form.hidden = true;
      if (resultBox) resultBox.hidden = false;
      if (progressBar) progressBar.style.width = '100%';
      if (counter) counter.textContent = 'Selesai';

      // skrol hasil ke pandangan
      if (resultBox && resultBox.scrollIntoView) {
        try { resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
    }

    function attachToOrderForm(rows, totalScore, rec) {
      var orderForm = document.querySelector('.order-form');
      if (!orderForm) return;

      // buang properties kuiz lama dahulu (elak pertindihan bila ulang kuiz)
      Array.prototype.slice.call(orderForm.querySelectorAll('input[data-quiz-prop]')).forEach(function (el) {
        el.parentNode.removeChild(el);
      });

      var props = rows.map(function (r) { return [r.label, r.value]; });
      props.push(['Skor kuiz', String(totalScore)]);
      props.push(['Produk disyorkan', rec.tier]);
      props.push(['Syor kuiz', rec.units + ' unit']);

      props.forEach(function (pair) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'properties[' + pair[0] + ']';
        input.value = pair[1];
        input.setAttribute('data-quiz-prop', '1');
        orderForm.appendChild(input);
      });
    }

    function validateCurrent() {
      var step = steps[index];
      if (!step) return true;
      if (step.querySelector('input[type="radio"]:checked')) return true;

      // tandakan ralat mesra
      step.classList.add('quiz-step--error');
      var first = step.querySelector('.quiz-opt');
      if (first) {
        try { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
      }
      return false;
    }

    if (form) {
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        if (!validateCurrent()) return;
        if (index < total - 1) {
          show(index + 1);
        } else {
          showResult();
        }
      });

      // auto-advance bila pilih jawapan (kecuali soalan terakhir)
      form.addEventListener('change', function (ev) {
        if (!ev.target.matches('input[type="radio"]')) return;
        ev.target.closest('.quiz-step').classList.remove('quiz-step--error');
        if (index < total - 1) {
          window.setTimeout(function () { show(index + 1); }, 220);
        }
      });
    }

    if (backBtn) backBtn.addEventListener('click', function () { show(index - 1); });

    if (restartBtn) {
      restartBtn.addEventListener('click', function () {
        if (form) form.reset();
        show(0);
      });
    }

    show(0);
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll('[data-quiz]')).forEach(init);

    // bila section dimuat semula dalam editor tema Shopify
    document.addEventListener('shopify:section:load', function (ev) {
      var root = ev.target.querySelector('[data-quiz]');
      if (root) { root.dataset.quizReady = ''; init(root); }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
