export const SUPPORTED_COUNTRY_CODES = ["US", "CA", "MX", "GB", "ES", "FR"] as const;
export const SHIPPING_METHOD_CODES = ["standard", "premium"] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRY_CODES)[number];
export type ShippingMethodCode = (typeof SHIPPING_METHOD_CODES)[number];

interface CountryConfig {
  code: SupportedCountryCode;
  name: string;
  cities: readonly string[];
  postalCodePattern: RegExp;
  postalCodeHint: string;
}

interface ShippingMethodConfig {
  code: ShippingMethodCode;
  priceCents: number;
  etaDays: number;
}

export const DEFAULT_COUNTRY: SupportedCountryCode = "US";
export const DEFAULT_SHIPPING_METHOD: ShippingMethodCode = "standard";

export const SHIPPING_COUNTRIES: readonly CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    cities: ["New York", "Los Angeles", "Miami", "Chicago", "San Francisco"],
    postalCodePattern: /^\d{5}(?:-\d{4})?$/,
    postalCodeHint: "12345",
  },
  {
    code: "CA",
    name: "Canada",
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    postalCodePattern: /^[A-Z]\d[A-Z][ -]?\d[A-Z]\d$/i,
    postalCodeHint: "A1A 1A1",
  },
  {
    code: "MX",
    name: "Mexico",
    cities: ["Mexico City", "Monterrey", "Guadalajara", "Puebla", "Tijuana"],
    postalCodePattern: /^\d{5}$/,
    postalCodeHint: "01234",
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Edinburgh"],
    postalCodePattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
    postalCodeHint: "SW1A 1AA",
  },
  {
    code: "ES",
    name: "Spain",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao"],
    postalCodePattern: /^\d{5}$/,
    postalCodeHint: "28001",
  },
  {
    code: "FR",
    name: "France",
    cities: ["Paris", "Lyon", "Marseille", "Bordeaux", "Nice"],
    postalCodePattern: /^\d{5}$/,
    postalCodeHint: "75001",
  },
] as const;

export const SHIPPING_METHODS: readonly ShippingMethodConfig[] = [
  {
    code: "standard",
    priceCents: 500,
    etaDays: 5,
  },
  {
    code: "premium",
    priceCents: 1500,
    etaDays: 1,
  },
] as const;

export function isSupportedCountryCode(value: unknown): value is SupportedCountryCode {
  return (
    typeof value === "string" && SUPPORTED_COUNTRY_CODES.includes(value as SupportedCountryCode)
  );
}

export function isShippingMethodCode(value: unknown): value is ShippingMethodCode {
  return typeof value === "string" && SHIPPING_METHOD_CODES.includes(value as ShippingMethodCode);
}

export function getCountryConfig(countryCode: SupportedCountryCode) {
  return (
    SHIPPING_COUNTRIES.find((country) => country.code === countryCode) ?? SHIPPING_COUNTRIES[0]
  );
}

export function getCityOptions(countryCode: SupportedCountryCode) {
  return getCountryConfig(countryCode).cities;
}

export function isValidCityForCountry(countryCode: SupportedCountryCode, city: string) {
  return getCityOptions(countryCode).includes(city);
}

export function normalizePostalCode(postalCode: string) {
  return postalCode.trim().toUpperCase();
}

export function isValidPostalCode(countryCode: SupportedCountryCode, postalCode: string) {
  const normalized = normalizePostalCode(postalCode);
  return getCountryConfig(countryCode).postalCodePattern.test(normalized);
}

export function getPostalCodeHint(countryCode: SupportedCountryCode) {
  return getCountryConfig(countryCode).postalCodeHint;
}

export function getShippingMethodConfig(methodCode: ShippingMethodCode) {
  return SHIPPING_METHODS.find((method) => method.code === methodCode) ?? SHIPPING_METHODS[0];
}

export function getShippingFeeCents(methodCode: ShippingMethodCode) {
  return getShippingMethodConfig(methodCode).priceCents;
}
