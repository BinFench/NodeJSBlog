(function () {
	const MOBILE_QUERY = '(max-width: 768px)';
	const TASKBAR_HEIGHT = 48;
	const SCREEN_PAD = 8;
	const MIN_VISIBLE = 120;
	let zCounter = 10;

	function isMobile() {
		return window.matchMedia(MOBILE_QUERY).matches;
	}

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

		let startX = 0, startY = 0, origLeft = 0, origTop = 0, pointerId = null;

		handle.addEventListener('pointerdown', e => {
			if (isMobile()) return;
			if (e.button !== undefined && e.button !== 0) return;
			if (e.target.closest('.window-close, .window-min')) return;
			const rect = win.getBoundingClientRect();
			origLeft = rect.left;
			origTop = rect.top;
			startX = e.clientX;
			startY = e.clientY;
			pointerId = e.pointerId;
			win.classList.add('is-dragging');
			focusWindow(win);
			// Route all subsequent pointer events for this gesture to the handle,
			// so the window keeps following the cursor even if it outruns the
			// titlebar or leaves the viewport.
			try { handle.setPointerCapture(pointerId); } catch (_) {}
			handle.addEventListener('pointermove', onMove);
			handle.addEventListener('pointerup', onUp);
			handle.addEventListener('pointercancel', onUp);
			e.preventDefault();
		});

		win.addEventListener('pointerdown', () => {
			if (isMobile()) return;
			focusWindow(win);
		});

		function onMove(e) {
			if (e.pointerId !== pointerId) return;
			const dx = e.clientX - startX;
			const dy = e.clientY - startY;
			const pos = clampPosition(win, origLeft + dx, origTop + dy);
			win.style.left = pos.left + 'px';
			win.style.top = pos.top + 'px';
		}

		function onUp(e) {
			if (e.pointerId !== pointerId) return;
			win.classList.remove('is-dragging');
			handle.removeEventListener('pointermove', onMove);
			handle.removeEventListener('pointerup', onUp);
			handle.removeEventListener('pointercancel', onUp);
			try { handle.releasePointerCapture(pointerId); } catch (_) {}
			pointerId = null;
		}
	}

	function bindResize(win) {
		const MIN_W = 240, MIN_H = 160;
		const dirs = [
			{ cls: 'resize-handle--right', dir: 'e' },
			{ cls: 'resize-handle--left', dir: 'w' },
			{ cls: 'resize-handle--bottom', dir: 's' },
			{ cls: 'resize-handle--br', dir: 'se' },
			{ cls: 'resize-handle--bl', dir: 'sw' },
		];
		dirs.forEach(({ cls, dir }) => {
			const h = document.createElement('div');
			h.className = 'resize-handle ' + cls;
			win.appendChild(h);

			let startX = 0, startY = 0, startW = 0, startH = 0, startL = 0, startT = 0, pid = null;

			h.addEventListener('pointerdown', e => {
				if (isMobile()) return;
				if (e.button !== undefined && e.button !== 0) return;
				const rect = win.getBoundingClientRect();
				startX = e.clientX;
				startY = e.clientY;
				startW = rect.width;
				startH = rect.height;
				startL = rect.left;
				startT = rect.top;
				pid = e.pointerId;
				win.classList.add('is-resizing');
				focusWindow(win);
				try { h.setPointerCapture(pid); } catch (_) {}
				h.addEventListener('pointermove', onMove);
				h.addEventListener('pointerup', onUp);
				h.addEventListener('pointercancel', onUp);
				e.preventDefault();
				e.stopPropagation();
			});

			function onMove(e) {
				if (e.pointerId !== pid) return;
				const dx = e.clientX - startX;
				const dy = e.clientY - startY;
				let newW = startW, newH = startH, newL = startL;
				if (dir.indexOf('e') !== -1) newW = startW + dx;
				if (dir.indexOf('s') !== -1) newH = startH + dy;
				if (dir.indexOf('w') !== -1) {
					newW = startW - dx;
					newL = startL + dx;
				}
				if (newW < MIN_W) {
					if (dir.indexOf('w') !== -1) newL = startL + (startW - MIN_W);
					newW = MIN_W;
				}
				if (newH < MIN_H) newH = MIN_H;
				const maxW = window.innerWidth - SCREEN_PAD * 2;
				const maxH = window.innerHeight - TASKBAR_HEIGHT - SCREEN_PAD * 2;
				if (newW > maxW) newW = maxW;
				if (newH > maxH) newH = maxH;
				if (newL < SCREEN_PAD) {
					newW -= (SCREEN_PAD - newL);
					newL = SCREEN_PAD;
				}
				const rightEdge = newL + newW;
				const maxRight = window.innerWidth - SCREEN_PAD;
				if (rightEdge > maxRight) newW = maxRight - newL;

				win.style.width = newW + 'px';
				win.style.height = newH + 'px';
				win.style.left = newL + 'px';
				win.style.top = startT + 'px';
			}

			function onUp(e) {
				if (e.pointerId !== pid) return;
				win.classList.remove('is-resizing');
				h.removeEventListener('pointermove', onMove);
				h.removeEventListener('pointerup', onUp);
				h.removeEventListener('pointercancel', onUp);
				try { h.releasePointerCapture(pid); } catch (_) {}
				pid = null;
			}
		});
	}

	document.querySelectorAll('.window').forEach(win => {
		bindDrag(win);
		bindResize(win);
	});

	window.addEventListener('resize', () => {
		if (isMobile()) {
			document.querySelectorAll('.window').forEach(win => {
				win.style.left = '';
				win.style.top = '';
				win.style.zIndex = '';
			});
		} else {
			document.querySelectorAll('.window.is-open').forEach(win => {
				// Minimized windows are still is-open but transformed — their
				// bounding rect is the tiny near-taskbar rect, not the real
				// stored position. Skip so we don't corrupt left/top.
				if (win.classList.contains('is-minimized')) return;
				const rect = win.getBoundingClientRect();
				const pos = clampPosition(win, rect.left, rect.top);
				win.style.left = pos.left + 'px';
				win.style.top = pos.top + 'px';
			});
		}
	});

	window.WindowKit = { clampPosition, focusWindow };
})();
