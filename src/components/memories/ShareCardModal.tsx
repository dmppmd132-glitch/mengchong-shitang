import React, { useEffect, useMemo, useState } from 'react';
import { Check, Download, Send, Sparkles, X } from 'lucide-react';
import { SharedPetRoom } from '../../types';
import {
  ShareCardPayload,
  downloadShareCardPng,
  renderShareCardDataUrl,
} from '../../utils/shareCardCanvas';

interface ShareCardModalProps {
  open: boolean;
  onClose: () => void;
  payload: ShareCardPayload | null;
  sharedRoom: SharedPetRoom | null;
  onShareToBoard?: (payload: ShareCardPayload) => Promise<string | null>;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  open,
  onClose,
  payload,
  sharedRoom,
  onShareToBoard,
}) => {
  const [notice, setNotice] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [sharing, setSharing] = useState<boolean>(false);

  useEffect(() => {
    if (!open) return;
    setNotice('');
    setError('');
  }, [open, payload]);

  const cardDataUrl = useMemo(() => {
    if (!open || !payload) return '';
    return renderShareCardDataUrl(payload);
  }, [open, payload]);

  if (!open || !payload) return null;

  const handleDownload = () => {
    setError('');
    if (!cardDataUrl) {
      setError('目前無法生成圖卡，請稍後再試。');
      return;
    }
    const ok = downloadShareCardPng(
      cardDataUrl,
      `${payload.petName}_${payload.title}`
    );
    if (ok) {
      setNotice('已下載「回憶紀念圖卡 (PNG)」！');
    } else {
      setError('下載圖卡失敗，請確認瀏覽器下載權限。');
    }
  };

  const handleShareBoard = async () => {
    if (!onShareToBoard) return;
    setSharing(true);
    setError('');
    setNotice('');
    try {
      const err = await onShareToBoard(payload);
      if (err) {
        setError(err);
      } else {
        setNotice(
          sharedRoom
            ? '已同步分享紀念卡給共養夥伴與留言板！'
            : '已將紀念卡分享到小豬留言板！'
        );
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2621]/60 backdrop-blur-xs flex items-center justify-center p-2 overflow-x-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-card-modal-title"
    >
      <div className="w-full max-w-[420px] max-h-[92dvh] rounded-3xl bg-[#FFFDF8] border-2 border-[#F4DFD7] shadow-2xl flex flex-col overflow-hidden">
        <header className="px-4 py-3 bg-gradient-to-r from-[#FFEAF0] via-[#FFF6DA] to-[#E8F8F2] border-b border-[#F2DFD5] flex items-center justify-between gap-2 shrink-0">
          <div className="min-w-0">
            <h2
              id="share-card-modal-title"
              className="text-base font-extrabold text-[#4A3531] truncate flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#D64470] shrink-0" />
              <span>生成專屬分享圖卡</span>
            </h2>
            <p className="text-[11px] font-bold text-[#7D635D] truncate">
              可下載高畫質 PNG 紀念卡或分享到留言板
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉分享圖卡"
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-white/85 text-[#5A3E36] flex items-center justify-center hover:bg-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 space-y-3">
          {cardDataUrl ? (
            <div className="rounded-3xl bg-[#F8EFE9] border-2 border-[#EED9D0] p-2 flex items-center justify-center">
              <img
                src={cardDataUrl}
                alt={`${payload.petName} - ${payload.title} 分享圖卡`}
                className="w-full max-w-[330px] h-auto rounded-2xl shadow-md"
              />
            </div>
          ) : (
            <div className="rounded-3xl bg-[#FFF5EC] border-2 border-[#F2D5C9] p-6 text-center space-y-2">
              <div className="text-4xl">{payload.emoji}</div>
              <h3 className="text-base font-extrabold text-[#4A3531]">{payload.title}</h3>
              {payload.subtitle && (
                <p className="text-xs text-[#6E544E]">{payload.subtitle}</p>
              )}
              <p className="text-[11px] font-bold text-[#8A6E67] tabular-nums">
                {payload.petName} · {payload.dateLabel}
              </p>
            </div>
          )}

          {notice && (
            <div className="rounded-2xl bg-[#E4F7F0] border border-[#A7E0CB] px-3 py-2 text-xs font-extrabold text-[#1F6B54] flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="rounded-2xl bg-[#FFE9EF] border border-[#F5B4C6] px-3 py-2 text-xs font-extrabold text-[#C4315B]">
              {error}
            </div>
          )}
        </div>

        <footer className="p-3 bg-[#FFF8F2] border-t border-[#F2DFD5] space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="min-h-[46px] rounded-2xl bg-[#5CC9A7] text-white text-xs font-extrabold shadow-[0_3px_0_#3BA886] inline-flex items-center justify-center gap-1.5 hover:bg-[#49B895] active:translate-y-0.5 transition"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span>下載圖卡 (PNG)</span>
            </button>

            {onShareToBoard ? (
              <button
                type="button"
                disabled={sharing}
                onClick={() => void handleShareBoard()}
                className="min-h-[46px] rounded-2xl bg-[#FF7A9E] text-white text-xs font-extrabold shadow-[0_3px_0_#D9577B] inline-flex items-center justify-center gap-1.5 hover:bg-[#F45D86] active:translate-y-0.5 transition disabled:opacity-50"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>
                  {sharing
                    ? '分享中…'
                    : sharedRoom
                    ? '分享給共養夥伴'
                    : '分享到留言板'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] rounded-2xl bg-[#F2E5DE] text-[#5A3E36] text-xs font-extrabold"
              >
                完成
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};
