function updateClock() {
	const now = new Date();
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	let hours = now.getHours();
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const period = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;

	const date = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
	const time = `${hours}:${minutes} ${period}`;

	const el = document.getElementById('time');
	if (el) el.textContent = `${date} · ${time}`;

	setTimeout(updateClock, 1000 - (Date.now() % 1000));
}

updateClock();
