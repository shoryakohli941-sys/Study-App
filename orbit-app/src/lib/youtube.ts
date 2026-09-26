export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  duration: string;
  subject: string;
  publishedAt: string;
}

// Convert ISO 8601 duration (e.g., PT1H23M45S) to human readable format
function parseISO8601Duration(iso: string): string {
  if (!iso) return 'N/A';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 'N/A';
  const hours = match[1] ? `${match[1].padStart(2, '0')}h ` : '';
  const mins = match[2] ? `${match[2].padStart(2, '0')}m` : '00m';
  return (hours + mins).trim() || 'N/A';
}

export async function fetchPlaylistVideos(
  apiKey: string,
  playlistId: string,
  subject: string
): Promise<YouTubeVideo[]> {
  const cacheKey = `orbit_yt_cache_${playlistId}`;
  const cached = localStorage.getItem(cacheKey);

  // Return cached data if available (saves API quota)
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {
      // ignore cache failure
    }
  }

  const allItems: any[] = [];
  let nextPageToken: string | undefined = '';

  // 1. Fetch all playlist items (up to 50 per page)
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', apiKey);
    if (nextPageToken) url.searchParams.set('pageToken', nextPageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `YouTube API error: ${res.status}`);
    }

    const data = await res.json();
    if (data.items) allItems.push(...data.items);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  // Filter out private or deleted videos
  const validItems = allItems.filter(
    (item) => item.snippet?.resourceId?.videoId && item.snippet?.title !== 'Private video' && item.snippet?.title !== 'Deleted video'
  );

  const videoIds = validItems.map((item) => item.snippet.resourceId.videoId);
  const durationMap: Record<string, string> = {};

  // 2. Fetch video durations in batches of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const videoUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
    videoUrl.searchParams.set('part', 'contentDetails');
    videoUrl.searchParams.set('id', chunk.join(','));
    videoUrl.searchParams.set('key', apiKey);

    const vRes = await fetch(videoUrl.toString());
    if (vRes.ok) {
      const vData = await vRes.json();
      vData.items?.forEach((v: any) => {
        durationMap[v.id] = parseISO8601Duration(v.contentDetails?.duration);
      });
    }
  }

  // 3. Map into clean format with official YouTube thumbnails
  const result: YouTubeVideo[] = validItems.map((item) => {
    const vid = item.snippet.resourceId.videoId;
    const thumbs = item.snippet.thumbnails;
    const thumbUrl = thumbs?.medium?.url || thumbs?.default?.url || `https://i.ytimg.com/vi/${vid}/mqdefault.jpg`;

    return {
      id: vid,
      title: item.snippet.title,
      thumbnailUrl: thumbUrl,
      duration: durationMap[vid] || 'N/A',
      subject,
      publishedAt: item.snippet.publishedAt || ''
    };
  });

  // Save to cache
  localStorage.setItem(cacheKey, JSON.stringify(result));
  return result;
}
