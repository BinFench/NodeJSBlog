(function () {
	const MOBILE_QUERY = '(max-width: 768px)';
	const TASKBAR_HEIGHT = 48;
	const EDGE_PAD = 24;

	function isMobile() {
		return window.matchMedia(MOBILE_QUERY).matches;
	}

	function defaultPosition(win) {
		const w = win.offsetWidth;
		const h = win.offsetHeight;
		const handle = win.querySelector('.window-titlebar');
		const titlebarH = handle ? handle.offsetHeight : 36;
		const left = Math.max(EDGE_PAD, (window.innerWidth - w) / 2);
		const maxTop = Math.max(EDGE_PAD, window.innerHeight - TASKBAR_HEIGHT - titlebarH - EDGE_PAD);
		const top = Math.min(Math.max(EDGE_PAD, (window.innerHeight - h) / 2), maxTop);
		return { left, top };
	}

	function openWindow(name) {
		const win = document.getElementById(name);
		if (!win) return;
		const task = document.getElementById(name + 'Task');
		const wasOpen = win.classList.contains('is-open');

		win.classList.add('is-open');
		if (task) task.classList.add('is-visible');

		if (isMobile()) {
			win.style.left = '';
			win.style.top = '';
		} else if (!wasOpen) {
			const pos = defaultPosition(win);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		} else if (window.WindowKit) {
			const rect = win.getBoundingClientRect();
			const pos = window.WindowKit.clampPosition(win, rect.left, rect.top);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		}

		if (window.WindowKit) window.WindowKit.focusWindow(win);
	}

	function closeWindow(name) {
		const win = document.getElementById(name);
		const task = document.getElementById(name + 'Task');
		if (win) {
			win.classList.remove('is-open');
			win.classList.remove('is-focused');
		}
		if (task) {
			task.classList.remove('is-visible');
			task.classList.remove('is-focused');
		}
	}

	document.querySelectorAll('[data-window]').forEach(el => {
		const target = el.dataset.window;
		const action = el.dataset.action;
		el.addEventListener('click', e => {
			e.preventDefault();
			e.stopPropagation();
			if (action === 'close') {
				closeWindow(target);
			} else {
				openWindow(target);
			}
		});
	});

	window.addEventListener('load', () => {
		if (!isMobile()) openWindow('Welcome');
	});

	window.openWindow = openWindow;
	window.closeWindow = closeWindow;
})();
