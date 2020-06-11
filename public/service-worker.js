const FILES_TO_CACHE = [
	'/',
	'/index.html',
	'/manifest.webmanifest',
	'/assets/css/styles.css',
	'/assets/js/index.js',
	'/assets/icons/icon-192x192.png',
	'/assets/icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v2';
const DATA_CACHE_NAME = 'data-cache-v1';

// install
self.addEventListener('install', function (evt) {
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log('Your files were pre-cached successfully!');
			return cache.addAll(FILES_TO_CACHE);
		})
	);
});

// fetch
self.addEventListener('fetch', function (evt) {
	if (evt.request.url.includes('/api/')) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(evt.request)
						.then((response) => {
							// If the response was good, clone it and store it in the cache.
							if (response.status === 200) {
								cache.put(evt.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							// Network request failed, try to get it from the cache.
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);

		return;
	}

	evt.respondWith(
		fetch(event.request).catch(function () {
			return caches.match(event.request).then(function (response) {
				if (response) {
					return response;
				} else if (event.request.headers.get('accept').includes('text/html')) {
					// return the cached home page for all requests for html pages
					return caches.match('/');
				}
			});
		})
	);
});
