import { ACCESSORIES } from '../data/accessories';
import {
  PHOTO_BACKGROUND_BY_ID,
  PHOTO_FILTER_BY_ID,
  PHOTO_FRAME_BY_ID,
  PHOTO_POSE_BY_ID,
  PHOTO_SCENE_BY_ID,
  PHOTO_STICKER_BY_ID,
} from '../data/photoStudio';
import { getPetSpeciesInfo } from '../data/species';
import { TOWN_VISITOR_BY_ID } from '../data/town';
import { VISITOR_BY_ID } from '../data/visitors';
import { PetSpecies, RoomPhotoRecord } from '../types';

export interface ShareCardPayload {
  petName: string;
  species: PetSpecies;
  title: string;
  subtitle?: string;
  dateLabel: string;
  badgeText: string;
  emoji: string;
  weight?: number;
  level?: number;
  photo?: RoomPhotoRecord | null;
  accessoryId?: string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const chars = Array.from(text);
  const lines: string[] = [];
  let cur = '';
  for (const ch of chars) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
      lines.push(cur);
      cur = ch;
      if (lines.length >= maxLines) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) {
    lines.push(cur);
  }
  return lines;
}

function drawCutePetVector(
  ctx: CanvasRenderingContext2D,
  species: PetSpecies,
  cx: number,
  cy: number,
  scale = 1
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const bodyColor =
    species === 'pig'
      ? '#FFB8C8'
      : species === 'rabbit'
      ? '#FFF2F6'
      : species === 'cat'
      ? '#FFD7BA'
      : species === 'duck'
      ? '#FFE784'
      : species === 'hamster'
      ? '#F7CBA0'
      : '#F4CA9B';
  const strokeColor = '#6B4842';
  const cheekColor = '#FF8FA8';

  // Ears
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 5;
  if (species === 'rabbit') {
    ctx.beginPath();
    ctx.ellipse(-42, -98, 20, 48, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(42, -98, 20, 48, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (species === 'cat') {
    ctx.beginPath();
    ctx.moveTo(-72, -38);
    ctx.lineTo(-56, -100);
    ctx.lineTo(-18, -62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(72, -38);
    ctx.lineTo(56, -100);
    ctx.lineTo(18, -62);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (species === 'duck') {
    // Cute tuft on top
    ctx.beginPath();
    ctx.ellipse(-6, -80, 12, 20, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(-62, -62, 24, 28, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(62, -62, 24, 28, 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Main round body/head
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 8, 92, 82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cheeks
  ctx.fillStyle = cheekColor;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(-52, 8, species === 'hamster' ? 22 : 16, species === 'hamster' ? 14 : 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(52, 8, species === 'hamster' ? 22 : 16, species === 'hamster' ? 14 : 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Eyes
  ctx.fillStyle = strokeColor;
  ctx.beginPath();
  ctx.arc(-32, -12, 8, 0, Math.PI * 2);
  ctx.arc(32, -12, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eye sparkles
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(-35, -15, 3, 0, Math.PI * 2);
  ctx.arc(29, -15, 3, 0, Math.PI * 2);
  ctx.fill();

  // Snout / Beak / Mouth
  if (species === 'pig') {
    ctx.fillStyle = '#FF93AE';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 12, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = strokeColor;
    ctx.beginPath();
    ctx.arc(-9, 12, 3.5, 0, Math.PI * 2);
    ctx.arc(9, 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (species === 'duck') {
    ctx.fillStyle = '#FF9C38';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 14, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(-6, 14, 7, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(6, 14, 7, 0, Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

export function renderShareCardDataUrl(payload: ShareCardPayload): string {
  const width = 720;
  const height = 960;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#FFEAF1');
  bgGrad.addColorStop(0.5, '#FFF8E8');
  bgGrad.addColorStop(1, '#E5F7F0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer card frame
  drawRoundedRect(ctx, 36, 36, width - 72, height - 72, 42);
  ctx.fillStyle = '#FFFDF9';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#F2C7D6';
  ctx.stroke();

  // Top Brand & Date Bar
  ctx.fillStyle = '#B83B64';
  ctx.font = '800 28px "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.fillText('🐷 萌寵食堂 · 回憶紀念圖卡', 72, 102);

  ctx.fillStyle = '#826862';
  ctx.font = '700 22px "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(payload.dateLabel, width - 72, 102);
  ctx.textAlign = 'left';

  // Inner stage preview box
  const stageX = 68;
  const stageY = 138;
  const stageW = width - 136;
  const stageH = 420;
  drawRoundedRect(ctx, stageX, stageY, stageW, stageH, 32);

  const bgId = payload.photo?.backgroundId;
  const filterId = payload.photo?.filterId ?? 'pink';
  const stageGrad = ctx.createLinearGradient(stageX, stageY, stageX, stageY + stageH);
  if (bgId === 'starry_night_market' || bgId === 'halloween_party' || bgId === 'market_night' || filterId === 'starry') {
    stageGrad.addColorStop(0, '#3B2E6B');
    stageGrad.addColorStop(1, '#5A4A92');
  } else if (bgId === 'christmas_cabin') {
    stageGrad.addColorStop(0, '#4E2A2A');
    stageGrad.addColorStop(1, '#7A3E36');
  } else if (
    bgId === 'forest_camp' ||
    bgId === 'bird_treetop_sky' ||
    bgId === 'forest_cabin' ||
    bgId === 'acorn_trail' ||
    filterId === 'forest' ||
    filterId === 'mint' ||
    filterId === 'morning_glow' ||
    filterId === 'forest_filter'
  ) {
    stageGrad.addColorStop(0, '#CDEFD9');
    stageGrad.addColorStop(1, '#F6F0D8');
  } else if (bgId === 'lakeside_sunset' || bgId === 'waterfront_bridge' || filterId === 'lake_aqua' || filterId === 'lakeside_breeze') {
    stageGrad.addColorStop(0, bgId === 'lakeside_sunset' ? '#FFB8A2' : '#BDE9FF');
    stageGrad.addColorStop(1, '#77C9EE');
  } else if (bgId === 'wooden_stalls' || filterId === 'market_warm_sun') {
    stageGrad.addColorStop(0, '#FFE4B8');
    stageGrad.addColorStop(1, '#F5D6B8');
  } else if (bgId === 'squirrel_acorn_forest' || filterId === 'forest_warm_sun') {
    stageGrad.addColorStop(0, '#FFE3B0');
    stageGrad.addColorStop(1, '#E9D6A5');
  } else if (bgId === 'rabbit_carrot_garden' || bgId === 'dream_lodge_bg' || filterId === 'meadow_pastel') {
    stageGrad.addColorStop(0, '#FFE2EE');
    stageGrad.addColorStop(1, '#DCF5CE');
  } else if (bgId === 'cloud_sky' || bgId === 'beach_vacation' || filterId === 'cloud') {
    stageGrad.addColorStop(0, '#CFE3FF');
    stageGrad.addColorStop(1, '#FFFDFB');
  } else if (bgId === 'kitchen' || filterId === 'kitchen' || filterId === 'cream' || filterId === 'vintage') {
    stageGrad.addColorStop(0, '#FFE4BC');
    stageGrad.addColorStop(1, '#FCE7DA');
  } else if (bgId === 'strawberry_season_field' || bgId === 'strawberry_field') {
    stageGrad.addColorStop(0, '#FFD4E5');
    stageGrad.addColorStop(0.55, '#FFF5E8');
    stageGrad.addColorStop(1, '#DFF5CE');
  } else {
    stageGrad.addColorStop(0, '#FFD9E6');
    stageGrad.addColorStop(1, '#FFF1E0');
  }
  ctx.fillStyle = stageGrad;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#F5D5DF';
  ctx.stroke();

  // Badge pill inside stage top-left
  drawRoundedRect(ctx, stageX + 24, stageY + 22, 240, 44, 18);
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fill();
  ctx.fillStyle = '#5A3E36';
  ctx.font = '800 21px "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.fillText(payload.badgeText, stageX + 42, stageY + 51);

  // Pet character illustration (single, duo pet, or pet + visitor)
  if (payload.photo?.duoPet) {
    drawCutePetVector(ctx, payload.species, width / 2 - 96, stageY + 235, 0.95);
    drawCutePetVector(
      ctx,
      payload.photo.duoPet.species,
      width / 2 + 96,
      stageY + 235,
      0.95
    );
  } else if (
    (payload.photo?.townVisitorId && TOWN_VISITOR_BY_ID[payload.photo.townVisitorId]) ||
    (payload.photo?.visitorId && VISITOR_BY_ID[payload.photo.visitorId])
  ) {
    const emoji = payload.photo.townVisitorId
      ? TOWN_VISITOR_BY_ID[payload.photo.townVisitorId].emoji
      : VISITOR_BY_ID[payload.photo.visitorId!].emoji;
    drawCutePetVector(ctx, payload.species, width / 2 - 72, stageY + 235, 1.0);
    ctx.save();
    ctx.font = '112px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, width / 2 + 106, stageY + 242);
    ctx.restore();
  } else {
    drawCutePetVector(ctx, payload.species, width / 2, stageY + 235, 1.15);
  }

  // Equipped accessories emojis or memory emoji around pet
  const photo = payload.photo;
  const filterMeta = photo?.filterId ? PHOTO_FILTER_BY_ID[photo.filterId] : null;
  const accEmojis: string[] = [];
  if (photo) {
    Object.values(photo.equipped).forEach((accId) => {
      if (!accId) return;
      const found = ACCESSORIES.find((a) => a.id === accId);
      if (found) accEmojis.push(found.emoji);
    });
  } else if (payload.accessoryId) {
    const found = ACCESSORIES.find((a) => a.id === payload.accessoryId);
    if (found) accEmojis.push(found.emoji);
  }

  ctx.font = '44px sans-serif';
  ctx.textAlign = 'center';
  if (photo?.stickers && photo.stickers.length > 0) {
    const offsets: Array<[number, number]> = [
      [stageX + 75, stageY + 125],
      [stageX + stageW - 75, stageY + 125],
      [stageX + 75, stageY + stageH - 55],
      [stageX + stageW - 75, stageY + stageH - 55],
      [stageX + 145, stageY + 240],
      [stageX + stageW - 145, stageY + 240],
    ];
    photo.stickers.slice(0, 6).forEach((sid, idx) => {
      const opt = PHOTO_STICKER_BY_ID[sid];
      const pos = offsets[idx];
      if (opt && pos) {
        ctx.fillText(opt.emoji, pos[0], pos[1]);
      }
    });
  } else if (filterMeta) {
    ctx.fillText(filterMeta.accentEmojis[0], stageX + 74, stageY + 130);
    ctx.fillText(filterMeta.accentEmojis[1], stageX + stageW - 74, stageY + 130);
    ctx.fillText(payload.emoji, stageX + stageW - 78, stageY + stageH - 50);
  } else {
    ctx.fillText(payload.emoji, stageX + stageW - 78, stageY + 126);
  }

  if (accEmojis.length > 0) {
    ctx.font = '32px sans-serif';
    ctx.fillText(accEmojis.slice(0, 4).join(' '), width / 2, stageY + stageH - 28);
  }
  ctx.textAlign = 'left';

  // Title & Subtitle
  ctx.fillStyle = '#4A3531';
  ctx.font = '800 38px "PingFang TC", "Noto Sans TC", sans-serif';
  const titleLines = wrapLines(ctx, payload.title, width - 144, 2);
  let textY = 626;
  for (const line of titleLines) {
    ctx.fillText(line, 72, textY);
    textY += 48;
  }

  if (payload.subtitle) {
    ctx.fillStyle = '#6E544E';
    ctx.font = '600 24px "PingFang TC", "Noto Sans TC", sans-serif';
    const subLines = wrapLines(ctx, payload.subtitle, width - 144, 3);
    textY += 8;
    for (const line of subLines) {
      ctx.fillText(line, 72, textY);
      textY += 34;
    }
  }

  // Stats Footer Box (Pet name, species, weight, level, scene/frame info)
  drawRoundedRect(ctx, 68, 796, width - 136, 92, 24);
  ctx.fillStyle = '#FFF5EC';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#EED4C6';
  ctx.stroke();

  const speciesInfo = getPetSpeciesInfo(payload.species);
  const weightVal = photo?.weightAtCapture ?? payload.weight;
  const petNamesLabel = photo?.duoPet
    ? `${payload.petName} & ${photo.duoPet.petName}`
    : `${payload.petName}（${speciesInfo.shortName}）`;
  const metaParts = [
    petNamesLabel,
    payload.level ? `Lv.${payload.level}` : null,
    typeof weightVal === 'number' ? `體重 ${weightVal.toFixed(1)} kg` : null,
  ].filter((x): x is string => Boolean(x));

  ctx.fillStyle = '#4A3531';
  ctx.font = '800 24px "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.fillText(metaParts.join(' · '), 92, 838);

  const bgLabel = photo?.backgroundId
    ? PHOTO_BACKGROUND_BY_ID[photo.backgroundId]?.label
    : undefined;
  const sceneLabel = photo?.scene
    ? PHOTO_SCENE_BY_ID[photo.scene]?.label
    : photo?.photoKind === 'room'
    ? '房間佈置'
    : undefined;
  const poseLabel = photo?.wardrobePoseId
    ? PHOTO_POSE_BY_ID[photo.wardrobePoseId]?.label
    : undefined;
  const frameLabel = photo?.frameId ? PHOTO_FRAME_BY_ID[photo.frameId]?.label : undefined;

  const subMeta = [bgLabel ?? sceneLabel, poseLabel, frameLabel]
    .filter((x): x is string => Boolean(x))
    .join(' · ');

  ctx.fillStyle = '#8A6E67';
  ctx.font = '700 19px "PingFang TC", "Noto Sans TC", sans-serif';
  ctx.fillText(
    subMeta ? `${subMeta} ｜ 萌寵食堂` : '專屬珍藏回憶圖卡 ｜ 萌寵食堂',
    92,
    869
  );

  return canvas.toDataURL('image/png');
}

export function downloadShareCardPng(
  dataUrl: string,
  fileNameBase: string
): boolean {
  if (!dataUrl || typeof document === 'undefined') return false;
  const link = document.createElement('a');
  const safeName = fileNameBase.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_');
  link.href = dataUrl;
  link.download = `${safeName || 'mengchong_memory'}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}
