interface IpLocation {
  ip: string;
  country_code: string;
  country: string;
  region_code?: string;
  region?: string;
  city?: string;
  postal_code?: string;
  continent_code: string;
  latitude: number;
  longitude: number;
  organization?: string;
  timezone: string;
}

export async function getIpLocation(): Promise<IpLocation | null> {
  try {
    const response = await fetch('https://api.ip.sb/geoip');
    if (!response.ok) {
      throw new Error('Failed to fetch IP location');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching IP location:', error);
    return null;
  }
}

// 存储位置信息的键
export const IP_LOCATION_STORAGE_KEY = 'ipLocation';
export const IP_LOCATION_TIMESTAMP_KEY = 'ipLocationTimestamp';
export const IP_LOCATION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时的缓存时间

// 获取缓存的位置信息
export function getCachedLocation(): IpLocation | null {
  try {
    const locationJson = localStorage.getItem(IP_LOCATION_STORAGE_KEY);
    const timestamp = localStorage.getItem(IP_LOCATION_TIMESTAMP_KEY);
    
    if (!locationJson || !timestamp) {
      return null;
    }

    // 检查缓存是否过期
    const now = Date.now();
    if (now - Number(timestamp) > IP_LOCATION_CACHE_DURATION) {
      localStorage.removeItem(IP_LOCATION_STORAGE_KEY);
      localStorage.removeItem(IP_LOCATION_TIMESTAMP_KEY);
      return null;
    }

    return JSON.parse(locationJson);
  } catch (error) {
    console.error('Error reading cached location:', error);
    return null;
  }
}

// 缓存位置信息
export function cacheLocation(location: IpLocation): void {
  try {
    localStorage.setItem(IP_LOCATION_STORAGE_KEY, JSON.stringify(location));
    localStorage.setItem(IP_LOCATION_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching location:', error);
  }
}

// 获取格式化的位置描述
export function formatLocationDescription(location: IpLocation): string {
  const parts = [];
  if (location.city) parts.push(location.city);
  if (location.region) parts.push(location.region);
  parts.push(location.country);
  return parts.join(', ');
}

// 刷新位置信息
export async function refreshLocation(): Promise<IpLocation | null> {
  try {
    const location = await getIpLocation();
    if (location) {
      cacheLocation(location);
    }
    return location;
  } catch (error) {
    console.error('Error refreshing location:', error);
    return null;
  }
}

export type { IpLocation }; 