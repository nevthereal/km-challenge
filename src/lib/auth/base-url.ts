/** Resolve authentication origins without requiring a local environment variable. */
export function getAuthBaseURL(dev: boolean, override?: string) {
	if (override) return override;

	if (dev) {
		return {
			allowedHosts: ['localhost:*', '127.0.0.1:*', '[::1]:*'],
			protocol: 'http' as const
		};
	}

	return {
		allowedHosts: ['km-challenge.com', 'www.km-challenge.com', '*.vercel.app'],
		protocol: 'https' as const,
		fallback: 'https://www.km-challenge.com'
	};
}
