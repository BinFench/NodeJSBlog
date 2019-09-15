function closeWindow(e) {
	var element = document.getElementById((e));
	var task = document.getElementById((e + "Task"));
	element.style.visibility = "hidden";
	task.style.visibility = "hidden";
}

function openWindow(e) {
		var element = document.getElementById((e));
		var task = document.getElementById((e + "Task"));
		element.style.visibility = "visible";
		task.style.visibility = "visible";
	}
	