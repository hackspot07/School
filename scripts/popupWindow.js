function popitup(url) {
	newwindow=window.open(url,'name','height=350,width=650');
	if (window.focus) {newwindow.focus()}
	return false;

}