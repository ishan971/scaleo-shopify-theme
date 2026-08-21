/**
 * Scale-O article: highlighted labels, table wrap, FAQ accordion.
 */
(function () {
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');
  var content = document.querySelector('.so-article .m-article__content');
  if (!content) return;

  wrapTables(content);
  markLabels(content);
  hideInternalNotes(content);
  ensureHeadingIds(content);
  buildFaq(content);
  buildToc(content);

  function slugify(text) {
    return (text || '')
      .toLowerCase()
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64);
  }

  function ensureHeadingIds(root) {
    var used = {};
    root.querySelectorAll('h2').forEach(function (h, i) {
      var base = slugify(h.textContent) || 'section-' + (i + 1);
      var id = h.id || base;
      var n = 2;
      while (used[id] || (document.getElementById(id) && document.getElementById(id) !== h)) {
        id = base + '-' + n;
        n += 1;
      }
      h.id = id;
      used[id] = true;
    });
  }

  function buildToc(root) {
    var nav = document.querySelector('[data-so-article-toc]');
    if (!nav) return;
    var list = nav.querySelector('[data-so-article-toc-list]');
    if (!list) return;

    var headings = Array.prototype.slice.call(root.querySelectorAll('h2'));
    if (!headings.length) {
      nav.hidden = true;
      return;
    }

    headings.forEach(function (h, i) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (i === 0) a.classList.add('is-active');
      a.addEventListener('click', function (e) {
        var target = document.getElementById(h.id);
        if (!target) return;
        e.preventDefault();
        var offset = 96;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: REDUCE.matches ? 'auto' : 'smooth' });
        setActive(a);
        if (history.replaceState) history.replaceState(null, '', '#' + h.id);
      });
      li.appendChild(a);
      list.appendChild(li);
    });

    var links = list.querySelectorAll('a');
    function setActive(active) {
      links.forEach(function (link) {
        link.classList.toggle('is-active', link === active);
      });
    }

    if (!('IntersectionObserver' in window)) return;
    var map = {};
    headings.forEach(function (h, i) {
      map[h.id] = links[i];
    });
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = map[entry.target.id];
          if (link) setActive(link);
        });
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 }
    );
    headings.forEach(function (h) {
      observer.observe(h);
    });
  }

  function wrapTables(root) {
    root.querySelectorAll('table').forEach(function (table) {
      if (table.parentElement && table.parentElement.classList.contains('so-table-wrap')) return;
      var wrap = document.createElement('div');
      wrap.className = 'so-table-wrap';
      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
    });
  }

  function markLabels(root) {
    root.querySelectorAll('p > strong:first-child').forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 32) return;
      el.classList.add('so-label');
      if (/cannot|watch out|warning|do not|never/i.test(text)) {
        el.classList.add('so-label--warn');
        wrapCallout(el.closest('p'), 'so-callout so-callout--warn');
      } else if (/can help|short answer|tip|note|score/i.test(text)) {
        wrapCallout(el.closest('p'), 'so-callout');
      }
    });
  }

  function wrapCallout(p, className) {
    if (!p || p.parentElement.classList.contains('so-callout')) return;
    var box = document.createElement('div');
    box.className = className;
    p.parentNode.insertBefore(box, p);
    box.appendChild(p);
  }

  function hideInternalNotes(root) {
    root.querySelectorAll('p').forEach(function (p) {
      var text = (p.textContent || '').toLowerCase();
      if (text.indexOf('do not create a second blog') !== -1) {
        p.hidden = true;
      }
    });
  }

  function sameText(el, title) {
    return cleanQuestion(el.textContent || '') === cleanQuestion(title || '');
  }

  function cleanQuestion(text) {
    return (text || '')
      .replace(/^\s*\d+[\.\)]\s*/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function isEmptyNode(el) {
    return !el || !(el.textContent || '').replace(/\s+/g, '').length;
  }

  function collectFaqNodes(faqH2) {
    var nodes = [];
    var node = faqH2.nextElementSibling;
    while (node && node.tagName !== 'H2') {
      nodes.push(node);
      node = node.nextElementSibling;
    }
    return nodes;
  }

  function titleFromQuestionNode(el) {
    if (!el) return '';
    var h3 = el.tagName === 'H3' ? el : el.querySelector && el.querySelector('h3');
    if (h3) return cleanQuestion(h3.textContent);
    var strong = el.querySelector && el.querySelector('strong, b');
    if (strong) return cleanQuestion(strong.textContent);
    return cleanQuestion(el.textContent);
  }

  function isQuestionNode(el) {
    if (!el || el.nodeType !== 1 || isEmptyNode(el)) return false;
    if (el.tagName === 'H3') return true;
    if (el.tagName === 'OL' || el.tagName === 'UL') return true;
    var text = (el.textContent || '').trim();
    if (/^\d+[\.\)]\s+/.test(text)) return true;
    if (el.tagName === 'P' && el.querySelector('strong, b') && /\?$/.test(cleanQuestion(el.textContent))) {
      return cleanQuestion(el.textContent).length < 140;
    }
    return false;
  }

  function groupsHaveAnswers(groups) {
    return groups.some(function (g) {
      return g.body && g.body.length;
    });
  }

  function groupsFromQaBlocks(nodes) {
    var groups = [];
    var consumed = [];
    var current = null;
    nodes.forEach(function (el) {
      if (isEmptyNode(el)) {
        consumed.push(el);
        return;
      }
      if (isQuestionNode(el)) {
        current = { title: titleFromQuestionNode(el), body: [] };
        if (current.title) groups.push(current);
        consumed.push(el);
        return;
      }
      if (current && !sameText(el, current.title)) {
        current.body.push(el);
      } else {
        consumed.push(el);
      }
    });
    return { groups: groups, consumed: consumed };
  }

  function groupsFromLists(nodes) {
    var groups = [];
    var consumed = [];
    nodes.forEach(function (el) {
      if (el.tagName !== 'OL' && el.tagName !== 'UL') return;
      var items = Array.prototype.slice.call(el.children).filter(function (li) {
        return li.tagName === 'LI';
      });
      if (!items.length) return;
      consumed.push(el);
      items.forEach(function (li) {
        var strong = li.querySelector('strong, b');
        var title = '';
        if (strong) {
          title = cleanQuestion(strong.textContent);
          strong.remove();
        }
        if (!title) {
          var firstP = li.querySelector('p');
          title = cleanQuestion((firstP || li).textContent);
          if (firstP) firstP.remove();
        }
        var body = Array.prototype.slice.call(li.childNodes).filter(function (n) {
          if (n.nodeType === 3) return (n.textContent || '').trim().length;
          return n.nodeType === 1 && !isEmptyNode(n);
        });
        body = body.filter(function (n) {
          return !sameText(n, title);
        });
        if (!title) return;
        groups.push({ title: title, body: body });
      });
    });
    return { groups: groups, consumed: consumed };
  }

  function groupsFromNumberedBlocks(nodes) {
    var numbered = /^\s*\d+[\.\)]\s+/;
    var groups = [];
    var consumed = [];
    var current = null;
    nodes.forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (numbered.test(text)) {
        var strong = el.querySelector && el.querySelector('strong, b');
        var title = cleanQuestion(strong ? strong.textContent : text);
        current = { title: title, body: [] };
        groups.push(current);
        if (strong) strong.remove();
        if (!isEmptyNode(el) && !sameText(el, title)) {
          current.body.push(el);
        } else {
          consumed.push(el);
        }
        return;
      }
      if (current) {
        current.body.push(el);
      }
    });
    return { groups: groups, consumed: consumed };
  }

  function renderFaq(insertBefore, groups, consumed) {
    var wrap = document.createElement('div');
    wrap.className = 'so-article-faq';
    wrap.setAttribute('data-so-article-faq', '');
    insertBefore.parentNode.insertBefore(wrap, insertBefore);

    groups.forEach(function (group, index) {
      var item = document.createElement('div');
      item.className = 'so-article-faq__item';
      if (index === 0) item.classList.add('is-open');

      var heading = document.createElement('h3');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'so-article-faq__trigger';
      btn.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      btn.innerHTML =
        '<span class="so-article-faq__q">' +
        escapeHtml(group.title) +
        '</span><span class="so-article-faq__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path class="so-article-faq__icon-h" d="M5 12h14"/><path class="so-article-faq__icon-v" d="M12 5v14"/></svg></span>';
      heading.appendChild(btn);

      var panel = document.createElement('div');
      panel.className = 'so-article-faq__panel';
      var inner = document.createElement('div');
      inner.className = 'so-article-faq__panel-inner';
      group.body.forEach(function (el) {
        if (sameText(el, group.title)) return;
        if (el.nodeType === 3) {
          if (cleanQuestion(el.textContent) === group.title) return;
          var p = document.createElement('p');
          p.textContent = el.textContent;
          inner.appendChild(p);
        } else if (!isEmptyNode(el)) {
          inner.appendChild(el);
        }
      });
      panel.appendChild(inner);

      item.appendChild(heading);
      item.appendChild(panel);
      wrap.appendChild(item);

      if (index !== 0) {
        panel.style.height = '0px';
        panel.style.opacity = '0';
      }

      btn.addEventListener('click', function () {
        toggleItem(wrap, item, btn, panel);
      });
    });

    consumed.forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
  }

  function buildFaq(root) {
    var headings = Array.prototype.slice.call(root.querySelectorAll('h2'));
    var faqH2 = headings.filter(function (h) {
      return /faq/i.test(h.textContent || '');
    })[0];
    if (!faqH2) return;

    var nodes = collectFaqNodes(faqH2);
    if (!nodes.length) return;

    var parsed = groupsFromLists(nodes);
    if (!parsed.groups.length || !groupsHaveAnswers(parsed.groups)) {
      parsed = groupsFromQaBlocks(nodes);
    }
    if (!parsed.groups.length || !parsed.consumed.length) return;

    renderFaq(parsed.consumed[0], parsed.groups, parsed.consumed);
  }

  function toggleItem(wrap, item, btn, panel) {
    var open = item.classList.contains('is-open');
    var ms = REDUCE.matches ? 0 : 220;
    wrap.querySelectorAll('.so-article-faq__item.is-open').forEach(function (other) {
      if (other === item) return;
      var otherBtn = other.querySelector('.so-article-faq__trigger');
      var otherPanel = other.querySelector('.so-article-faq__panel');
      other.classList.remove('is-open');
      if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      animate(otherPanel, false, ms);
    });
    item.classList.toggle('is-open', !open);
    btn.setAttribute('aria-expanded', open ? 'false' : 'true');
    animate(panel, !open, ms);
  }

  function animate(el, open, ms) {
    if (!el) return;
    if (ms <= 0) {
      el.style.height = open ? 'auto' : '0px';
      el.style.opacity = open ? '1' : '0';
      el.style.transition = '';
      return;
    }
    if (open) {
      el.style.height = '0px';
      el.style.opacity = '0';
      el.offsetHeight;
      el.style.transition = 'height ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
      el.style.height = el.scrollHeight + 'px';
      el.style.opacity = '1';
      var done = function (e) {
        if (e && e.propertyName && e.propertyName !== 'height') return;
        el.removeEventListener('transitionend', done);
        el.style.height = 'auto';
        el.style.transition = '';
      };
      el.addEventListener('transitionend', done);
    } else {
      el.style.height = el.scrollHeight + 'px';
      el.style.opacity = '1';
      el.offsetHeight;
      el.style.transition = 'height ' + ms + 'ms ease, opacity ' + ms + 'ms ease';
      el.style.height = '0px';
      el.style.opacity = '0';
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();

(function () {
  document.querySelectorAll('[data-so-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = btn.getAttribute('data-copy-url') || window.location.href;
      var label = btn.querySelector('[data-so-copy-label]');
      var original = label ? label.textContent : 'Copy link';
      var done = function () {
        if (!label) return;
        label.textContent = 'Copied';
        window.setTimeout(function () {
          label.textContent = original;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(function () {
          window.prompt('Copy this link', url);
        });
      } else {
        window.prompt('Copy this link', url);
      }
    });
  });
})();
