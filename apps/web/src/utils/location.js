export function getRegionName(record) {
  return record?.region_name || record?.regionName || "";
}

export function getCityName(record) {
  return record?.city_name || record?.cityName || record?.destination || "";
}

export function getLocationHierarchyParts(record) {
  return [record?.continent, record?.country, getRegionName(record), getCityName(record)].filter(Boolean);
}

export function formatLocationHierarchy(record, separator = " > ") {
  const parts = getLocationHierarchyParts(record);
  return parts.length ? parts.join(separator) : "Location to be confirmed";
}

export function getPrimaryLocationLabel(record) {
  return getCityName(record) || getRegionName(record) || record?.country || record?.continent || "Location";
}
