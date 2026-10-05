import { atom } from 'nanostores';

export const activeMemberId = atom<string | null>(null);

export function openMemberModal(id: string) {
  activeMemberId.set(id);
}

export function closeMemberModal() {
  activeMemberId.set(null);
}
