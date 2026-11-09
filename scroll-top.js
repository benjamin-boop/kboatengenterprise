(function () {
    function createScrollButton() {
        const button = document.createElement('button');
        button.id = 'scroll-to-top';
        button.type = 'button';
        button.setAttribute('aria-label', 'Scroll to top');
        button.className = 'scroll-top-btn';
        button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="scroll-top-icon"><path fill-rule="evenodd" d="M3.22 10.22a.75.75 0 011.06 0L10 15.94l5.72-5.72a.75.75 0 111.06 1.06l-6.25 6.25a.75.75 0 01-1.06 0L3.22 11.28a.75.75 0 010-1.06z" clip-rule="evenodd"/></svg>';
        document.body.appendChild(button);
        return button;
    }

    function updateButtonVisibility(button) {
        const isVisible = window.pageYOffset > 320;
        button.classList.toggle('show', isVisible);
    }

    function initScrollToTop() {
        const button = createScrollButton();
        button.addEventListener('click', function (event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        updateButtonVisibility(button);
        window.addEventListener('scroll', function () {
            updateButtonVisibility(button);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollToTop);
    } else {
        initScrollToTop();
    }
})();
