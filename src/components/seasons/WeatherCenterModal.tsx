import React, { useState } from 'react';
import {
  Camera,
  Check,
  CloudSun,
  Flower2,
  Home,
  MapPin,
  RefreshCw,
  Sparkles,
  Trees,
  X,
} from 'lucide-react';
import { PHOTO_BACKGROUND_BY_ID, PHOTO_FILTER_BY_ID, PHOTO_FRAME_BY_ID } from '../../data/photoStudio';
import {
  SEASON_CROPS,
  SEASON_FESTIVAL_BLUEPRINTS,
  SEASON_META,
  SEASON_PHOTO_CONTENT,
  SEASON_ROOM_THEMES,
  SEASON_YARD_THEMES,
  WEATHER_CITIES,
  WEATHER_EFFECT_PROFILES,
  getSeasonalVisitorsForSeason,
} from '../../data/seasons';
import {
  GameState,
  SeasonId,
  SeasonRoomThemeId,
  SeasonYardThemeId,
} from '../../types';
import { createInitialSeasonSystemState, getSeasonEventRemainingText } from '../../utils/seasons';

type WeatherCenterTab = 'weather' | 'themes' | 'guide';

interface WeatherCenterModalProps {
  open: boolean;
  onClose: () => void;
  game: GameState;
  weatherLoading?: boolean;
  onSelectCity: (cityId: string) => void;
  onRefreshWeather: () => void;
  onDismissOfflineSummary: () => void;
  onClaimWeatherTask: (taskId: string) => { ok: boolean; notice?: string; error?: string };
  onSwitchRoomTheme: (themeId: SeasonRoomThemeId) => void;
  onSwitchYardTheme: (themeId: SeasonYardThemeId) => void;
  onOpenSeasonEvent: () => void;
}

export const WeatherCenterModal: React.FC<WeatherCenterModalProps> = ({
  open,
  onClose,
  game,
  weatherLoading = false,
  onSelectCity,
  onRefreshWeather,
  onDismissOfflineSummary,
  onClaimWeatherTask,
  onSwitchRoomTheme,
  onSwitchYardTheme,
  onOpenSeasonEvent,
}) => {
  const [activeTab, setActiveTab] = useState<WeatherCenterTab>('weather');
  const [noticeText, setNoticeText] = useState<string | null>(null);

  if (!open) return null;

  const sys = game.seasonSystem ?? createInitialSeasonSystemState();
  const seasonId: SeasonId = sys.lastKnownSeason;
  const seasonMeta = SEASON_META[seasonId];
  const weather = game.dialogue.weather;
  const weatherProfile = WEATHER_EFFECT_PROFILES[weather.condition];
  const photoGuide = SEASON_PHOTO_CONTENT[seasonId];
  const seasonalVisitors = getSeasonalVisitorsForSeason(seasonId);
  const seasonalCrops = SEASON_CROPS.filter((c) => c.primarySeason === seasonId);
  const claimableWeatherTasksCount = sys.weatherTasks.filter((t) => t.completed && !t.claimed).length;

  const handleClaim = (taskId: string) => {
    const res = onClaimWeatherTask(taskId);
    if (res.ok && res.notice) {
      setNoticeText(res.notice);
    } else if (!res.ok && res.error) {
      setNoticeText(res.error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/55 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weather-center-title"
    >
      <div className="w-full max-w-[424px] max-h-[93dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#EED9CE] shadow-2xl flex flex-col overflow-hidden">
        <header className="px-4 py-2.5 bg-gradient-to-r from-[#E6F4FF] via-[#FFF6DC] to-[#FFEAF2] border-b border-[#EFE0D7] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-white/90 text-[#1F6B54] flex items-center justify-center shrink-0 text-xl">
              {weather.emoji}
            </div>
            <div className="min-w-0">
              <h2
                id="weather-center-title"
                className="text-sm font-extrabold text-[#4A3531] truncate"
              >
                {seasonMeta.emoji} 四季與小鎮氣象台
              </h2>
              <p className="text-[11px] font-bold text-[#6F5A54] tabular-nums truncate">
                {seasonMeta.name}（{seasonMeta.monthsLabel}）· {weather.cityName} {weather.label}{' '}
                {weather.temperatureC}°C
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉四季與天氣中心"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <nav
          aria-label="四季與天氣分頁"
          className="px-3 pt-2 pb-1.5 bg-[#FAF5EF] border-b border-[#EFE3DA] shrink-0"
        >
          <div className="grid grid-cols-3 gap-1 bg-[#EDE1D8] p-1 rounded-2xl">
            {(
              [
                { id: 'weather', label: '氣象與任務', icon: CloudSun, badge: claimableWeatherTasksCount },
                { id: 'themes', label: '季節房間＆庭院', icon: Home, badge: 0 },
                { id: 'guide', label: '寫真指南＆慶典', icon: Camera, badge: 0 },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setNoticeText(null);
                    setActiveTab(tab.id);
                  }}
                  className={`min-h-[44px] rounded-xl text-[11px] font-extrabold inline-flex items-center justify-center gap-1 whitespace-nowrap transition relative ${
                    active
                      ? 'bg-white text-[#1F6B54] shadow-xs'
                      : 'text-[#6D564E] hover:text-[#4A3531]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#FF6B97] text-white text-[10px] tabular-nums">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3.5">
          {noticeText && (
            <div className="rounded-2xl bg-[#E5F7F0] border border-[#A6DFCA] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{noticeText}</span>
            </div>
          )}

          {activeTab === 'weather' && (
            <>
              {sys.offlineSummary && (
                <section className="rounded-2xl bg-[#FFF6DF] border-2 border-[#F2CE6D] p-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-extrabold text-[#8A5610]">
                      🌦️ 離線期間小鎮天氣摘要
                    </h3>
                    <button
                      type="button"
                      onClick={onDismissOfflineSummary}
                      className="min-h-[34px] px-2.5 rounded-xl bg-white border border-[#E7CFA2] text-[11px] font-extrabold text-[#7D5610]"
                    >
                      我知道了
                    </button>
                  </div>
                  <p className="text-xs font-bold text-[#6E544E] leading-relaxed">
                    {sys.offlineSummary.summaryText}
                  </p>
                </section>
              )}

              <section className="rounded-2xl bg-gradient-to-br from-[#F4FAFF] via-[#FFFDF8] to-[#FFF4F8] border-2 border-[#DCE9F4] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-2xl">{weather.emoji}</span>
                      <span className="text-base font-extrabold text-[#4A3531]">
                        {weather.cityName} · {weather.label}
                      </span>
                      <span className="text-base font-extrabold text-[#1F6B54] tabular-nums">
                        {weather.temperatureC}°C
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-[#7D635D] mt-0.5">
                      {weather.mode === 'live' && !weather.isOfflineFallback
                        ? 'Open-Meteo 即時氣象同步（每 45 分鐘更新・無需 API 金鑰）'
                        : weather.lastSyncedOnlineAt != null
                        ? '目前離線或氣象更新失敗，沿用最近一次成功取得的天氣'
                        : '尚未連線取得氣象，目前使用預設晴天（不影響遊戲進行）'}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={weatherLoading}
                    onClick={onRefreshWeather}
                    aria-label="重新整理天氣"
                    className="min-h-[44px] px-3 rounded-2xl bg-white border border-[#D4E4F0] text-xs font-extrabold text-[#245998] inline-flex items-center gap-1.5 shrink-0 hover:bg-[#F2F8FD] active:scale-95 transition disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
                    <span>{weatherLoading ? '更新中' : '重新整理'}</span>
                  </button>
                </div>

                {weather.dailyForecast && weather.dailyForecast.length > 0 && (
                  <div className="pt-1">
                    <div className="text-[11px] font-extrabold text-[#4A3531] mb-1.5">
                      📅 未來 7 天預報（{weather.locationName ?? weather.cityName}）
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {weather.dailyForecast.slice(0, 7).map((day, idx) => {
                        const shortDate = day.date.slice(5).replace('-', '/');
                        return (
                          <div
                            key={`${day.date}_${idx}`}
                            className="rounded-xl bg-white/90 border border-[#E4EDF4] py-1.5 px-1 text-center flex flex-col items-center gap-0.5"
                          >
                            <span className="text-[10px] font-bold text-[#7D635D] tabular-nums">
                              {idx === 0 ? '今天' : shortDate}
                            </span>
                            <span className="text-base leading-none" title={day.label}>
                              {day.emoji}
                            </span>
                            <span className="text-[10px] font-extrabold text-[#4A3531] tabular-nums">
                              {day.tempMaxC}°
                            </span>
                            <span className="text-[9px] font-bold text-[#8A756E] tabular-nums">
                              {day.tempMinC}°
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-1.5 pt-1 text-xs">
                  <div className="rounded-xl bg-white/90 border border-[#EAE4DE] px-3 py-2">
                    <span className="font-extrabold text-[#1F6B54]">🌱 農場影響：</span>
                    <span className="font-bold text-[#5A423C]">{weatherProfile.farmEffect}</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[#EAE4DE] px-3 py-2">
                    <span className="font-extrabold text-[#9D5B12]">🐾 訪客動向：</span>
                    <span className="font-bold text-[#5A423C]">{weatherProfile.visitorEffect}</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[#EAE4DE] px-3 py-2">
                    <span className="font-extrabold text-[#B83B64]">💛 萌寵反應：</span>
                    <span className="font-bold text-[#5A423C]">{weatherProfile.petEffect}</span>
                  </div>
                  <div className="rounded-xl bg-white/90 border border-[#EAE4DE] px-3 py-2">
                    <span className="font-extrabold text-[#245998]">✨ 今日加成：</span>
                    <span className="font-bold text-[#5A423C]">{weatherProfile.gameplayEffect}</span>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#D64470]" />
                    <span>手動選擇城市（預設保護隱私，不取用 GPS）</span>
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {WEATHER_CITIES.map((city) => {
                    const selected = sys.selectedCityId === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          onSelectCity(city.id);
                          setNoticeText(`已切換城市為「${city.name}」並更新小鎮天氣！`);
                        }}
                        className={`min-h-[48px] rounded-2xl px-3 py-2 border-2 text-left transition flex items-center justify-between gap-1.5 ${
                          selected
                            ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54] shadow-xs'
                            : 'bg-white border-[#EFE0D7] text-[#4A3531] hover:bg-[#FFF8F2]'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold truncate">{city.name}</div>
                          <div className="text-[10px] font-bold opacity-75 truncate">
                            {city.region}
                          </div>
                        </div>
                        {selected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#4A3531]">
                    🌤️ 今日天氣任務（零懲罰・輕鬆拿補給）
                  </h3>
                  <span className="text-[11px] font-bold text-[#7D635D] tabular-nums">
                    {sys.weatherTasks.length} 項
                  </span>
                </div>
                {sys.weatherTasks.map((task) => {
                  const pct = Math.min(100, Math.round((task.progress / Math.max(1, task.target)) * 100));
                  return (
                    <div
                      key={task.id}
                      className="rounded-2xl bg-[#FAF4EE] border border-[#EEDCD2] p-3 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-xl shrink-0">{task.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#4A3531]">
                              {task.title}
                            </div>
                            <p className="text-[11px] font-bold text-[#7D635D] leading-snug mt-0.5">
                              {task.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#9D5B12] tabular-nums shrink-0">
                          {task.progress}/{task.target}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-[#E9DDD4] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#5CC9A7] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold text-[#1F6B54]">
                          🎁 {task.rewardSummary}
                        </span>
                        <button
                          type="button"
                          disabled={!task.completed || task.claimed}
                          onClick={() => handleClaim(task.id)}
                          className={`min-h-[44px] px-3.5 rounded-xl text-xs font-extrabold shrink-0 transition ${
                            task.claimed
                              ? 'bg-[#E6F8F1] text-[#1F6B54]'
                              : task.completed
                              ? 'bg-[#5CC9A7] text-white shadow-[0_2px_0_#3BA886] active:scale-95'
                              : 'bg-[#E9DFD8] text-[#8E7B75] cursor-not-allowed'
                          }`}
                        >
                          {task.claimed ? '✓ 已領取' : task.completed ? '領取獎勵' : '進行中'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          {activeTab === 'themes' && (
            <>
              <div className="rounded-2xl bg-[#EEF8F4] border border-[#BDE4D5] px-3.5 py-2.5 text-xs font-bold text-[#1F6B54] leading-relaxed">
                🏡 季節佈置主題可自由切換！不會更動你原本已擺放的房間家具、壁紙庫存或庭院裝飾位置。
              </div>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-[#D64470]" />
                    <span>季節房間主題（8 款＋原味小屋）</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchRoomTheme('none');
                      setNoticeText('已切回你原本自訂的房間壁紙與地板！');
                    }}
                    className={`min-h-[36px] px-2.5 rounded-xl text-[11px] font-extrabold border ${
                      sys.roomThemeOverride === 'none'
                        ? 'bg-[#FFEAF0] border-[#FF7A9E] text-[#B83B64]'
                        : 'bg-white border-[#E7D8D0] text-[#6E544E]'
                    }`}
                  >
                    原味小屋
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {SEASON_ROOM_THEMES.map((theme) => {
                    const selected = sys.roomThemeOverride === theme.id;
                    const isCurrentSeason = theme.seasonId === seasonId;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          onSwitchRoomTheme(theme.id);
                          setNoticeText(`已套用「${theme.name}」季節房間氛圍！`);
                        }}
                        className={`min-h-[84px] rounded-2xl p-2.5 border-2 text-left flex flex-col justify-between gap-1.5 transition ${
                          selected
                            ? 'border-[#FF7A9E] bg-[#FFF5F8] shadow-xs'
                            : 'border-[#EFE0D7] bg-white hover:bg-[#FFF9F4]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-lg">{theme.emoji}</span>
                          {selected ? (
                            <span className="text-[10px] font-extrabold text-[#D64470]">✓ 使用中</span>
                          ) : isCurrentSeason ? (
                            <span className="text-[10px] font-extrabold text-[#1F6B54]">當季推薦</span>
                          ) : null}
                        </div>
                        <div>
                          <div className="text-xs font-extrabold text-[#4A3531]">{theme.name}</div>
                          <p className="text-[10px] font-bold text-[#7D635D] line-clamp-2 mt-0.5">
                            {theme.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-extrabold text-[#4A3531] inline-flex items-center gap-1.5">
                    <Trees className="w-4 h-4 text-[#1F6B54]" />
                    <span>季節庭院主題（4 季＋原味草地）</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchYardTheme('none');
                      setNoticeText('已切回你原本的暖暖庭院外觀！');
                    }}
                    className={`min-h-[36px] px-2.5 rounded-xl text-[11px] font-extrabold border ${
                      sys.yardThemeOverride === 'none'
                        ? 'bg-[#E6F8F1] border-[#5CC9A7] text-[#1F6B54]'
                        : 'bg-white border-[#E7D8D0] text-[#6E544E]'
                    }`}
                  >
                    原味庭院
                  </button>
                </div>

                <div className="space-y-2">
                  {Object.values(SEASON_YARD_THEMES).map((theme) => {
                    const selected = sys.yardThemeOverride === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          onSwitchYardTheme(theme.id);
                          setNoticeText(`庭院已換上「${theme.name}」氛圍！`);
                        }}
                        className={`w-full min-h-[64px] rounded-2xl p-3 border-2 text-left flex items-center justify-between gap-2 transition ${
                          selected
                            ? 'border-[#5CC9A7] bg-[#F1FBF7]'
                            : 'border-[#EFE0D7] bg-white hover:bg-[#FFF9F4]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl shrink-0">{theme.emoji}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-extrabold text-[#4A3531]">
                              {theme.name} · {theme.decorEmojis.join(' ')}
                            </div>
                            <p className="text-[11px] font-bold text-[#7D635D] truncate mt-0.5">
                              {theme.description}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#1F6B54] shrink-0">
                          {selected ? '✓ 套用中' : '切換'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activeTab === 'guide' && (
            <>
              <section className="rounded-2xl bg-gradient-to-r from-[#FFEAF3] via-[#FFF6E5] to-[#E9F7F1] border-2 border-[#F2C9D7] p-3.5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#8E2B4E] inline-flex items-center gap-1">
                      <Flower2 className="w-4 h-4" />
                      <span>{sys.seasonEvent.name}（季節慶典）</span>
                    </h3>
                    <p className="text-[11px] font-bold text-[#7B4F5D] mt-0.5 tabular-nums">
                      {getSeasonEventRemainingText(sys.seasonEvent)} · {sys.seasonEvent.currencyEmoji}{' '}
                      {sys.seasonEvent.ticketBalance} {sys.seasonEvent.currencyName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSeasonEvent();
                    }}
                    className="min-h-[44px] px-3.5 rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_2px_0_#D9577B] shrink-0"
                  >
                    前往活動
                  </button>
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  📸 {photoGuide.label}
                </h3>
                <p className="text-[11px] font-bold text-[#7D635D] leading-relaxed">
                  {photoGuide.unlockHint}
                </p>
                <div className="space-y-1 text-xs font-bold text-[#5A423C]">
                  <div>
                    🏞️ 背景：
                    {photoGuide.backgroundIds
                      .map((id) => PHOTO_BACKGROUND_BY_ID[id]?.label ?? id)
                      .join('、')}
                  </div>
                  <div>
                    🎨 濾鏡：
                    {photoGuide.filterIds
                      .map((id) => PHOTO_FILTER_BY_ID[id]?.label ?? id)
                      .join('、')}
                  </div>
                  <div>
                    🖼️ 相框：
                    {photoGuide.frameIds
                      .map((id) => PHOTO_FRAME_BY_ID[id]?.label ?? id)
                      .join('、')}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🌱 {seasonMeta.name}當季作物（生長 +10% 加速）
                </h3>
                <div className="space-y-1.5">
                  {seasonalCrops.map((crop) => (
                    <div
                      key={crop.id}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{crop.emoji}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">{crop.name}</div>
                          <div className="text-[10.5px] font-bold text-[#7D635D] truncate">
                            {crop.description}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-[#1F6B54] shrink-0">
                        {crop.coldHardy ? '❄️ 耐寒' : '✨ 當季'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🐾 {seasonMeta.name}季節訪客出沒指南
                </h3>
                <div className="space-y-1.5">
                  {seasonalVisitors.map((v) => (
                    <div
                      key={v.visitorId}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{v.emoji}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#4A3531]">
                            {v.name} ({v.rarity === 'rare' ? '稀有' : '常客'})
                          </div>
                          <div className="text-[10.5px] font-bold text-[#7D635D] truncate">
                            {v.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-[#FFFDF8] border-2 border-[#EFE0D7] p-3.5 space-y-2">
                <h3 className="text-xs font-extrabold text-[#4A3531]">
                  🗓️ 四季慶典年曆（無抽卡／無付費轉蛋）
                </h3>
                <div className="space-y-1.5">
                  {SEASON_FESTIVAL_BLUEPRINTS.map((bp) => (
                    <div
                      key={bp.eventId}
                      className="rounded-xl bg-[#FAF4EE] px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#4A3531]">
                          {bp.emoji} {bp.name} · {bp.durationDays} 天
                        </div>
                        <div className="text-[10.5px] font-bold text-[#7D635D] truncate">
                          {bp.description}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold shrink-0 ${
                          bp.status === 'active'
                            ? 'bg-[#FFEAF3] text-[#B83B64]'
                            : 'bg-[#EDE3DC] text-[#6E544E]'
                        }`}
                      >
                        {bp.status === 'active' ? '進行中' : '季節預留'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
