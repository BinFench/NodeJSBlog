//Make the DIV element draggable:
dragElement(document.getElementById(("GrabWelcome")));
dragElement(document.getElementById(("GrabAbout")));
dragElement(document.getElementById(("GrabResume")));

function dragElement(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	elmnt.parentElement.parentElement.position = "absolute";
	elmnt.onmousedown = dragMouseDown;

	function dragMouseDown(e) {
		elmnt.parentElement.parentElement.style.boxShadow = "3px 4px 6px rgba(0, 0, 0, .5)"
		e = e || window.event;
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;
	}

	function elementDrag(e) {
		e = e || window.event;
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX;
		pos2 = pos4 - e.clientY;
		pos3 = e.clientX;
		pos4 = e.clientY;
		// set the element's new position:
		elmnt.parentElement.parentElement.style.top = Math.min(Math.max((elmnt.parentElement.parentElement.offsetTop - pos2), 0), window.innerHeight - elmnt.parentElement.parentElement.clientHeight) + "px";
		elmnt.parentElement.parentElement.style.left = Math.min(Math.max((elmnt.parentElement.parentElement.offsetLeft - pos1), 0), window.innerWidth - elmnt.parentElement.parentElement.clientWidth) + "px";
	}

	function closeDragElement() {
		/* stop moving when mouse button is released:*/
		elmnt.parentElement.parentElement.style.boxShadow = "1px 2px 4px rgba(0, 0, 0, .5)"
		document.onmouseup = null;
		document.onmousemove = null;
		elmnt.parentElement.parentElement.position = "fixed";
	}
}