(function () {
  const SECTION = '.facest-filters-section.scale-o-filters';

  const collapseAccordions = (section) => {
    section.querySelectorAll('.m-filter--widget.m-accordion--item').forEach((widget) => {
      widget.classList.remove('open');
      const content = widget.querySelector('.m-filter--widget-content, .m-accordion--item-content');
      if (!content) return;
      content.style.height = '';
      content.style.maxHeight = '';
      content.style.opacity = '';
    });
  };

  const closePopovers = (root) => {
    root.querySelectorAll('.m-filter--widget.is-popover-open').forEach((el) => {
      el.classList.remove('is-popover-open');
    });
  };

  const closeDesktopDrawer = (section) => {
    section.classList.remove('scale-o-desktop-drawer');
  };

  const onDocClick = (event) => {
    const section = document.querySelector(SECTION);
    if (!section) return;

    const openBtn = event.target.closest('.m-sidebar--open, .scale-o-filter-bar__open');
    const applyBtn = event.target.closest('[data-scale-o-filter-apply]');
    const closeBtn = event.target.closest('.m-sidebar--close');
    const title = event.target.closest('.scale-o-filters .m-filter--widget-title');
    const desktop = window.matchMedia('(min-width: 1024px)').matches;

    if (applyBtn) {
      event.preventDefault();
      closeDesktopDrawer(section);
      if (typeof MinimogTheme !== 'undefined' && MinimogTheme.Collection) {
        MinimogTheme.Collection.closeSidebarFilter();
      }
      return;
    }

    if (openBtn && desktop) {
      event.preventDefault();
      event.stopPropagation();
      closePopovers(section);
      section.classList.toggle('scale-o-desktop-drawer');
      return;
    }

    if (closeBtn && desktop) {
      closeDesktopDrawer(section);
    }

    if (title && desktop && !section.classList.contains('scale-o-desktop-drawer')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const widget = title.closest('.m-filter--widget.m-accordion--item') || title.closest('.m-filter--widget');
      if (!widget || widget.classList.contains('m-collection-filters-form')) return;
      const wasOpen = widget.classList.contains('is-popover-open');
      closePopovers(section);
      collapseAccordions(section);
      if (!wasOpen) widget.classList.add('is-popover-open');
      return;
    }

    if (!event.target.closest('.m-filter--widget') && !event.target.closest('.scale-o-filter-bar__open')) {
      closePopovers(section);
    }

    if (desktop && event.target.classList.contains('m-sidebar') && section.classList.contains('scale-o-desktop-drawer')) {
      closeDesktopDrawer(section);
    }
  };

  document.addEventListener('click', onDocClick, true);

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const section = document.querySelector(SECTION);
    if (!section) return;
    closePopovers(section);
    closeDesktopDrawer(section);
  });

  const boot = () => {
    const section = document.querySelector(SECTION);
    if (section) collapseAccordions(section);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', () => setTimeout(boot, 50));
  document.addEventListener('shopify:section:load', boot);
})();
