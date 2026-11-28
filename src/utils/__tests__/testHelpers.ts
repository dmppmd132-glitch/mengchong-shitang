import { GameState } from '../../types';

export function createActivePet(state: GameState): GameState {
  return {
    ...state,
    pets: state.pets.map((p, idx) => (idx === 0 ? { ...p, hatched: true } : p)),
  };
}

export function getLocalWeekKey(date: Date): string {
  const dt = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = dt.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  dt.setDate(dt.getDate() + diffToMon);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
