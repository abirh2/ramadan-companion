/** MapLibre v6 needs its worker and shared module served from one local URL. */
export async function loadMapLibre() {
  const maplibre = await import('maplibre-gl')
  maplibre.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
  return maplibre
}
