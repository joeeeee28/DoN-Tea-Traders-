import heroImg from '../assets/images/hero_don_traders_tea_1794552844989.jpg';
import ctcDustImg from '../assets/images/cat_ctc_dust_tea_1794552846113.jpg';
import assamLeafImg from '../assets/images/cat_assam_leaf_tea_1794552845941.jpg';
import masalaImg from '../assets/images/cat_masala_speciality_tea_1794552846425.jpg';
import plantationImg from '../assets/images/origin_tea_plantation_1794552847105.jpg';
import tastingImg from '../assets/images/story_tea_tasting_1794552848734.jpg';

const ASSET_MAP: Record<string, string> = {
  'asset:hero': heroImg,
  'asset:ctc_dust': ctcDustImg,
  'asset:assam_leaf': assamLeafImg,
  'asset:masala': masalaImg,
  'asset:plantation': plantationImg,
  'asset:tasting': tastingImg,
};

export const AVAILABLE_STUDIO_ASSETS = [
  { key: 'asset:hero', label: 'Hero Chai & Red/Gold Pouch' },
  { key: 'asset:ctc_dust', label: 'CTC Granules & Dust Brass Bowls' },
  { key: 'asset:assam_leaf', label: 'Assam Leaf Canister & Glass Teapot' },
  { key: 'asset:masala', label: 'Masala Chai & Whole Spices' },
  { key: 'asset:plantation', label: 'Indian Highland Tea Gardens' },
  { key: 'asset:tasting', label: 'Tea Quality Cupping Table' },
];

export function resolveImageUrl(input?: string | null): string {
  if (!input) return ctcDustImg;
  if (ASSET_MAP[input]) return ASSET_MAP[input];
  return input;
}

export function formatMoney(
  value: number | string | null | undefined,
  currency = 'INR'
): string {
  if (value === null || value === undefined || value === '') {
    return 'Price on Enquiry';
  }
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return 'Price on Enquiry';
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: num % 1 === 0 ? 0 : 2,
    }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2)}`;
  }
}
