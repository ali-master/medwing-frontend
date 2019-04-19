export const getCordinates = provider => () => {
	return provider.suffix("cordinates").get();
};
