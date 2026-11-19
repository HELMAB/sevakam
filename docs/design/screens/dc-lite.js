/*
 * dc-lite.js: a tiny standalone renderer for the Sevakam design screens (*.dc.html).
 * Supports {{path}} holes, <sc-for list as>, <sc-if value>, data-sc-for/data-as on an
 * element (repeat the element itself; use inside tables), onClick handlers,
 * boolean attributes, and class Component extends DCLogic with setState.
 */
(function () {
  var hide = document.createElement('style');
  hide.textContent = 'x-dc{display:none}';
  document.head.appendChild(hide);

  var BOOL = { disabled: 1, checked: 1, selected: 1, hidden: 1, readonly: 1 };
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\{\{\s*([^}]+?)\s*\}\}$/;

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    this.state = Object.assign({}, this.state, typeof patch === 'function' ? patch(this.state) : patch);
    if (this.__render) this.__render();
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__render) this.__render(); };
  window.DCLogic = DCLogic;

  function resolve(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) { var v = resolve(p, scope); return v == null ? '' : String(v); });
  }

  function renderChildren(src, out, scope) {
    for (var c = src.firstChild; c; c = c.nextSibling) renderNode(c, out, scope);
  }

  function renderNode(node, out, scope) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      var list = resolve((node.getAttribute('list') || '').replace(WHOLE, '$1'), scope) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (item, i) {
        var s = Object.create(scope); s[as] = item; s.$index = i;
        renderChildren(node, out, s);
      });
      return;
    }
    if (tag === 'sc-if') {
      if (resolve((node.getAttribute('value') || '').replace(WHOLE, '$1'), scope)) renderChildren(node, out, scope);
      return;
    }
    if (node.hasAttribute('data-sc-for')) {
      var items = resolve(node.getAttribute('data-sc-for'), scope) || [];
      var name = node.getAttribute('data-as') || 'item';
      items.forEach(function (item, i) {
        var s = Object.create(scope); s[name] = item; s.$index = i;
        renderElement(node, out, s, true);
      });
      return;
    }
    renderElement(node, out, scope, false);
  }

  function renderElement(node, out, scope, skipFor) {
    var el = document.createElementNS(node.namespaceURI, node.tagName.toLowerCase() === 'svg' || node.namespaceURI !== 'http://www.w3.org/1999/xhtml' ? node.tagName : node.tagName.toLowerCase());
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i], n = a.name, v = a.value;
      if (n.indexOf('hint-') === 0 || (skipFor && (n === 'data-sc-for' || n === 'data-as'))) continue;
      var m = v.match(WHOLE);
      if (m) {
        var val = resolve(m[1], scope);
        if (/^on[a-z]+$/.test(n)) { if (typeof val === 'function') el.addEventListener(n.slice(2), val); continue; }
        if (BOOL[n]) { if (val) el.setAttribute(n, ''); continue; }
        if (val == null || val === false && n.indexOf('aria-') !== 0) continue;
        el.setAttribute(n, String(val));
      } else if (/^on[a-z]+$/.test(n)) {
        continue;
      } else {
        el.setAttribute(n, interp(v, scope));
      }
    }
    var src = node.tagName.toLowerCase() === 'template' ? node.content : node;
    renderChildren(src, el, scope);
    if (el.tagName === 'TEXTAREA') el.value = el.textContent;
    out.appendChild(el);
  }

  function boot() {
    var root = document.querySelector('x-dc');
    if (!root) return;
    var helmet = root.querySelector('helmet');
    if (helmet) {
      while (helmet.firstChild) document.head.appendChild(helmet.firstChild);
      helmet.parentNode.removeChild(helmet);
    }
    var script = document.querySelector('script[data-dc-script]');
    var props = {};
    if (script) {
      try {
        var decl = JSON.parse(script.getAttribute('data-props') || '{}');
        Object.keys(decl).forEach(function (k) { if (k[0] !== '$' && decl[k] && 'default' in decl[k]) props[k] = decl[k]['default']; });
      } catch (e) { /* ignore */ }
    }
    var Comp = script ? new Function('DCLogic', script.textContent + '\nreturn Component;')(DCLogic) : DCLogic;
    var inst = new Comp(props);
    if (!inst.props) inst.props = props;

    var tpl = root.cloneNode(true);
    var host = document.createElement('div');
    host.className = 'dc-host';
    root.parentNode.replaceChild(host, root);

    inst.__render = function () {
      var scope = Object.assign({}, inst.renderVals ? inst.renderVals() : {});
      var frag = document.createDocumentFragment();
      renderChildren(tpl, frag, scope);
      host.innerHTML = '';
      host.appendChild(frag);
    };
    inst.__render();
    if (inst.componentDidMount) inst.componentDidMount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
