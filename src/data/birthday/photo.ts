import { BirthdayPhotoContent } from '../../types';

export const BIRTHDAY_PHOTO_CONTENT: BirthdayPhotoContent = {
  poses: [
    'bday_blow_candles',
    'bday_cut_cake',
    'bday_wear_crown',
    'bday_hold_gift',
  ],
  backgrounds: [
    'bday_pink_balloons',
    'bday_rainbow_cake',
    'bday_starry_party',
    'bday_forest_picnic',
    'birthday_bg',
  ],
  filters: [
    'bday_cream_pink',
    'bday_candy_color',
    'bday_warm_gold',
    'bday_starry_purple',
  ],
  frames: [
    'bday_balloon',
    'bday_cake',
    'bday_crown',
    'bday_giftbox',
    'birthday_frame',
  ],
  stickers: [
    'bday_happy',
    'bday_heart',
    'bday_candle',
    'bday_gift',
    'bday_streamer',
  ],
};

export const BIRTHDAY_DEFAULT_STUDIO_POSES = BIRTHDAY_PHOTO_CONTENT.poses;
export const BIRTHDAY_DEFAULT_STUDIO_BACKGROUNDS = BIRTHDAY_PHOTO_CONTENT.backgrounds.filter(
  (id) => id !== 'birthday_bg'
);
export const BIRTHDAY_DEFAULT_STUDIO_FILTERS = BIRTHDAY_PHOTO_CONTENT.filters;
export const BIRTHDAY_DEFAULT_STUDIO_FRAMES = BIRTHDAY_PHOTO_CONTENT.frames.filter(
  (id) => id !== 'birthday_frame'
);
export const BIRTHDAY_DEFAULT_STUDIO_STICKERS = BIRTHDAY_PHOTO_CONTENT.stickers;
