(function (root) {
  'use strict';

  var pending = [];
  var queued = Object.create(null);
  var active = null;
  var sequence = 0;
  var timer = null;

  function visible(element) {
    if (!element || !element.isConnected || !element.getClientRects().length) return false;
    var style = getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0 && element.getAttribute('aria-hidden') !== 'true';
  }

  function hasExternalDialog() {
    var selector = '[role="dialog"],.modal-backdrop,.paywall-modal,.cg-overlay,.cc-overlay,#visorOverlay';
    return Array.prototype.some.call(document.querySelectorAll(selector), function (element) {
      if (active && element.closest('[data-synova-experience="' + active.key + '"]')) return false;
      return visible(element);
    });
  }

  function schedule(delay) {
    clearTimeout(timer);
    timer = setTimeout(pump, delay == null ? 60 : delay);
  }

  function release(key) {
    if (!active || (key && active.key !== key)) return;
    var finished = active;
    active = null;
    delete queued[finished.key];
    window.dispatchEvent(new CustomEvent('synova:experience:end', { detail: { key: finished.key } }));
    schedule(220);
  }

  function pump() {
    if (active || !pending.length) return;
    if (document.visibilityState === 'hidden' || hasExternalDialog()) { schedule(250); return; }
    pending.sort(function (a, b) { return b.priority - a.priority || a.sequence - b.sequence; });
    var item = pending.shift();
    if (typeof item.ready === 'function' && !item.ready()) {
      if (item.expiresAt > Date.now()) pending.push(item);
      else delete queued[item.key];
      schedule(250);
      return;
    }
    active = item;
    window.dispatchEvent(new CustomEvent('synova:experience:start', { detail: { key: item.key } }));
    var completed = false;
    function done() {
      if (completed) return;
      completed = true;
      release(item.key);
    }
    try {
      var result = item.open(done);
      if (result === false) done();
      else if (result && typeof result.then === 'function') result.catch(done);
    } catch (error) {
      console.warn('[SYNOVA] experiencia ' + item.key + ':', error && error.message || error);
      done();
    }
  }

  function request(options) {
    options = options || {};
    var key = String(options.key || '').trim();
    if (!key || typeof options.open !== 'function') return false;
    if (queued[key] || (active && active.key === key)) return false;
    queued[key] = true;
    pending.push({
      key: key,
      priority: Number(options.priority || 0),
      sequence: sequence++,
      open: options.open,
      ready: options.ready,
      expiresAt: Date.now() + Math.max(1000, Number(options.maxWait || 120000))
    });
    schedule(0);
    return true;
  }

  window.addEventListener('focus', function () { schedule(0); });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') schedule(0); });

  root.SynovaExperienceQueue = {
    request: request,
    release: release,
    isBusy: function () { return !!active || hasExternalDialog(); },
    activeKey: function () { return active && active.key || ''; }
  };
})(window);
