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

	// Sets the CSS custom properties that translate the window toward its
	// taskbar button's center. Must be called when the window is at its
	// natural (untransformed) size, so the bounding rect reflects the
	// real on-screen position.
	function setMinimizeOffsets(win, task) {
		if (!task) return;
		const winRect = win.getBoundingClientRect();
		const taskRect = task.getBoundingClientRect();
		const dx = (taskRect.left + taskRect.width / 2) - (winRect.left + winRect.width / 2);
		const dy = (taskRect.top + taskRect.height / 2) - (winRect.top + winRect.height / 2);
		win.style.setProperty('--minimize-dx', dx + 'px');
		win.style.setProperty('--minimize-dy', dy + 'px');
	}

	function openWindow(name) {
		const win = document.getElementById(name);
		if (!win) return;
		const task = document.getElementById(name + 'Task');
		const wasOpen = win.classList.contains('is-open');
		const wasMinimized = win.classList.contains('is-minimized');

		if (task) task.classList.add('is-visible');

		if (isMobile()) {
			win.classList.add('is-open');
			win.classList.remove('is-minimized');
			win.style.left = '';
			win.style.top = '';
		} else if (wasMinimized) {
			// Same transition runs in reverse — the window is still
			// display:flex, so the baseline exists and removing the class
			// animates transform/opacity smoothly back from the taskbar.
			win.classList.remove('is-minimized');
		} else if (wasOpen) {
			if (window.WindowKit) {
				const rect = win.getBoundingClientRect();
				const pos = window.WindowKit.clampPosition(win, rect.left, rect.top);
				win.style.left = pos.left + 'px';
				win.style.top = pos.top + 'px';
			}
		} else {
			win.classList.add('is-open');
			const pos = defaultPosition(win);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		}

		if (window.WindowKit) window.WindowKit.focusWindow(win);
	}

	function minimizeWindow(name) {
		const win = document.getElementById(name);
		if (!win || !win.classList.contains('is-open')) return;
		if (win.classList.contains('is-minimized')) return;
		const task = document.getElementById(name + 'Task');

		if (isMobile()) {
			// No taskbar on mobile — treat as close for consistency.
			win.classList.remove('is-open');
			win.classList.remove('is-focused');
			if (task) task.classList.remove('is-focused');
			return;
		}

		setMinimizeOffsets(win, task);
		win.classList.add('is-minimized');
		win.classList.remove('is-focused');
		if (task) task.classList.remove('is-focused');
	}

	function closeWindow(name) {
		const win = document.getElementById(name);
		const task = document.getElementById(name + 'Task');
		if (win) {
			win.classList.remove('is-open');
			win.classList.remove('is-focused');
			win.classList.remove('is-minimized');
			// Closing fully resets the window — wipe any inline size/position
			// from drag/resize so the next open uses the CSS default size
			// and a fresh centered position.
			win.style.width = '';
			win.style.height = '';
			win.style.left = '';
			win.style.top = '';
		}
		if (task) {
			task.classList.remove('is-visible');
			task.classList.remove('is-focused');
		}
	}

	function toggleFromTaskbar(name) {
		const win = document.getElementById(name);
		if (!win) return;
		// Minimized windows are still is-open but invisible — restore them.
		if (win.classList.contains('is-minimized')) {
			openWindow(name);
			return;
		}
		if (win.classList.contains('is-open') && win.classList.contains('is-focused')) {
			minimizeWindow(name);
		} else {
			openWindow(name);
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
			} else if (action === 'minimize') {
				minimizeWindow(target);
			} else if (el.classList.contains('taskbar-task')) {
				toggleFromTaskbar(target);
			} else {
				openWindow(target);
			}
		});
	});

	// --- Taskbar reorder via HTML5 drag-and-drop ---
	(function bindTaskbarReorder() {
		const container = document.querySelector('.taskbar-tasks');
		if (!container) return;
		let dragged = null;

		container.querySelectorAll('.taskbar-task').forEach(task => {
			task.setAttribute('draggable', 'true');

			task.addEventListener('dragstart', e => {
				dragged = task;
				task.classList.add('is-task-dragging');
				if (e.dataTransfer) {
					e.dataTransfer.effectAllowed = 'move';
					// Firefox requires data to be set for the drag to start.
					e.dataTransfer.setData('text/plain', task.id);
				}
			});

			task.addEventListener('dragend', () => {
				task.classList.remove('is-task-dragging');
				dragged = null;
			});
		});

		container.addEventListener('dragover', e => {
			if (!dragged) return;
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
			const over = e.target.closest('.taskbar-task');
			if (!over || over === dragged) return;
			const rect = over.getBoundingClientRect();
			const insertAfter = (e.clientX - rect.left) > rect.width / 2;
			const ref = insertAfter ? over.nextSibling : over;
			if (ref !== dragged && ref !== dragged.nextSibling) {
				container.insertBefore(dragged, ref);
			}
		});

		container.addEventListener('drop', e => {
			if (dragged) e.preventDefault();
		});
	})();

	window.addEventListener('load', () => {
		if (!isMobile()) openWindow('Welcome');
	});

	window.openWindow = openWindow;
	window.closeWindow = closeWindow;
	window.minimizeWindow = minimizeWindow;
})();
