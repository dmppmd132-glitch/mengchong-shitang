import { PetSpecies, PetSpeciesInfo } from '../types';

export const PET_SPECIES_LIST: PetSpecies[] = ['pig', 'rabbit', 'dog'];

export const PET_SPECIES_INFO: Record<PetSpecies, PetSpeciesInfo> = {
  pig: {
    id: 'pig',
    label: '粉紅小豬',
    shortName: '小豬',
    eggColor: '#FFB6CA',
    accentColor: '#FF7A9E',
    favoriteFoodIds: ['caramel_pudding', 'meat_bento', 'crispy_fries'],
    greeting: '呼嚕呼嚕～今天也想吃香噴噴的點心！',
    pettedSpeech: '呼嚕呼嚕～好喜歡摸摸喔！',
    favoriteFoodReaction: '呼嚕～這是我最愛的料理，幸福度爆表！',
  },
  rabbit: {
    id: 'rabbit',
    label: '棉花糖小兔',
    shortName: '小兔',
    eggColor: '#C5F0DF',
    accentColor: '#5CC9A7',
    favoriteFoodIds: ['carrot_salad', 'fruit_box', 'dried_fruit'],
    greeting: '啾啾～最喜歡脆脆的紅蘿蔔和香甜水果盒！',
    pettedSpeech: '耳朵軟綿綿～被你摸摸好開心啾！',
    favoriteFoodReaction: '咔滋咔滋！是我最愛的紅蘿蔔與果香啾！',
  },
  dog: {
    id: 'dog',
    label: '奶油小狗',
    shortName: '小狗',
    eggColor: '#FFE099',
    accentColor: '#E6A222',
    favoriteFoodIds: ['meat_bento', 'cheese_burger', 'caramel_pudding'],
    greeting: '汪汪！今天也要吃肉肉便當再一起去散步！',
    pettedSpeech: '尾巴搖不停～最喜歡你了汪！',
    favoriteFoodReaction: '汪嗚！太香太好吃了，尾巴搖成螺旋槳！',
  },
};

export function getPetSpeciesInfo(species: PetSpecies): PetSpeciesInfo {
  return PET_SPECIES_INFO[species] ?? PET_SPECIES_INFO.pig;
}
