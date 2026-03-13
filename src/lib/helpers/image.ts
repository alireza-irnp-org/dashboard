export function proxiedAvatarUrl(url: string, size = 128) {
    if (!url) return url;
    return `/_next/image?url=${encodeURIComponent(url)}&w=${size}&q=75`;
}