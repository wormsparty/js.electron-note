async function clic() {
	const files = await window.api.getFiles();
	console.log('Files = ');
	console.log(files);
}
