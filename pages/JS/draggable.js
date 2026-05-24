(function () {
	const TASKBAR_HEIGHT = 48;
	const SCREEN_PAD = 8;
	const MIN_VISIBLE = 120;
	let zCounter = 10;

	function clampPosition(win, left, top) {
		const handle = win.querySelector('.window-titlebar');
		const titlebarH = handle ? handle.offsetHeight : 36;
		const winW = win.offsetWidth;
		const maxTop = window.innerHeight - TASKBAR_HEIGHT - titlebarH;
		const minLeft = MIN_VISIBLE - winW;
		const maxLeft = window.innerWidth - MIN_VISIBLE;
		return {
			left: Math.max(minLeft, Math.min(left, maxLeft)),
			top: Math.max(SCREEN_PAD, Math.min(top, maxTop)),
		};
	}

	function focusWindow(win) {
		zCounter += 1;
		win.style.zIndex = zCounter;
		document.querySelectorAll('.window').forEach(w => w.classList.remove('is-focused'));
		win.classList.add('is-focused');
		const task = document.getElementById(win.id + 'Task');
		document.querySelectorAll('.taskbar-task').forEach(t => t.classList.remove('is-focused'));
		if (task) task.classList.add('is-focused');
	}

	function bindDrag(win) {
		const handle = win.querySelector('.window-titlebar');
		if (!handle) return;

		let startX = 0, startY = 0, origLeft = 0, origTop = 0;

		handle.addEventListener('mousedown', e => {
			if (e.target.closest('.window-close')) return;
			const rect = win.getBoundingClientRect();
			origLeft = rect.left;
			origTop = rect.top;
			startX = e.clientX;
			startY = e.clientY;
			win.classList.add('is-dragging');
			focusWindow(win);
			document.addEventListener('mousemove', onMove);
			document.addEventListener('mouseup', onUp);
			e.preventDefault();
		});

		win.addEventListener('mousedown', () => focusWindow(win));

		function onMove(e) {
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			const pos = clampPosition(win, origLeft + dx, origTop + dy);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		}

		function onUp() {
			win.classList.remove('is-dragging');
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
		}
	}

	document.querySelectorAll('.window').forEach(bindDrag);

	window.addEventListener('resize', () => {
		document.querySelectorAll('.window.is-open').forEach(win => {
			const rect = win.getBoundingClientRect();
			const pos = clampPosition(win, rect.left, rect.top);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		});
	});

	window.WindowKit = { clampPosition, focusWindow };
})();
