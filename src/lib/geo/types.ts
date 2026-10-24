export type LatLng = { lat: number; lng: number };

/** Seçilmiş adres modeli (§6.6). Koordinatlar backend'e 6 ondalıklı string gider. */
export type SelectedAddress = {
  address: string;
  latitude: string;
  longitude: string;
  districtName: string;
};

export type PhotonProperties = {
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  district?: string;
  locality?: string;
  county?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  osm_key?: string;
  osm_value?: string;
};

export type GeocodeResult = {
  id: string;
  title: string;
  subtitle: string;
  position: LatLng;
  selected: SelectedAddress;
};
