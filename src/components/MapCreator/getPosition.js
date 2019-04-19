export default () => {
	return new Promise((resolve, reject) => {
		if (navigator && navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(pos => {
				const coords = pos.coords;

				return resolve({
					lat: coords.latitude,
					lng: coords.longitude,
				});
			});
		} else {
			reject();
		}
	});
};
