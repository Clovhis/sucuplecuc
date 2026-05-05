export const ADSENSE_PUBLISHER_ID = 'pub-6107242162035895';
export const ADSENSE_CLIENT_ID = `ca-${ADSENSE_PUBLISHER_ID}`;
export const ADSENSE_SELLER_DOMAIN = 'google.com';
export const ADSENSE_ACCOUNT_TYPE = 'DIRECT';
export const ADSENSE_CERT_AUTHORITY_ID = 'f08c47fec0942fa0';

export function getAdsTxtContents(): string {
	return `${ADSENSE_SELLER_DOMAIN}, ${ADSENSE_PUBLISHER_ID}, ${ADSENSE_ACCOUNT_TYPE}, ${ADSENSE_CERT_AUTHORITY_ID}\n`;
}
