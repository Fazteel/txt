import { atom, computed } from 'nanostores';

export interface UserAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  username: string;
  bias: string;
  biasEmoji: string;
  membershipTier: string;
  membershipNumber: string;
  joinedAt: string;
  avatar?: string;
  addresses?: UserAddress[];
  selectedAddressId?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  username?: string;
  password: string;
  bias?: string;
  biasEmoji?: string;
  initialAddress?: Omit<UserAddress, 'id'>;
}

const DEFAULT_USERS: (User & { password: string })[] = [
  {
    id: 'user_moa_default',
    name: 'Aulia Rahma',
    email: 'aulia@email.com',
    phone: '+62 812 3456 7890',
    password: 'password123',
    username: 'aulia_moa',
    bias: 'Yeonjun',
    biasEmoji: '🦊',
    membershipTier: 'Official MOA Global 5th Gen',
    membershipNumber: 'MOA-940304',
    joinedAt: 'March 4, 2024',
    addresses: [
      {
        id: 'addr_default_1',
        label: 'Rumah',
        recipientName: 'Aulia Rahma',
        phone: '+62 812 3456 7890',
        street: 'Jl. Contoh No. 12',
        city: 'Bandung',
        province: 'Jawa Barat',
        postalCode: '40123',
        isDefault: true,
      },
    ],
    selectedAddressId: 'addr_default_1',
  },
  {
    id: 'user_moa_global',
    name: 'Choi Min-ah',
    email: 'moa@txt.bighit.com',
    phone: '+82 10 9403 0404',
    password: 'Tomorrow123!',
    username: 'moa_forever',
    bias: 'Soobin',
    biasEmoji: '🐰',
    membershipTier: 'Verified Global MOA',
    membershipNumber: 'MOA-120500',
    joinedAt: 'March 4, 2024',
    addresses: [
      {
        id: 'addr_global_1',
        label: 'Dorm / Studio',
        recipientName: 'Choi Min-ah',
        phone: '+82 10 9403 0404',
        street: '42 Hangang-daero, Yongsan-gu',
        city: 'Seoul',
        province: 'Seoul',
        postalCode: '04389',
        isDefault: true,
      },
    ],
    selectedAddressId: 'addr_global_1',
  },
];

function getStoredUsers(): (User & { password: string })[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem('txt_registered_users');
    if (!raw) {
      localStorage.setItem('txt_registered_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USERS;
  }
}

function saveUsers(users: (User & { password: string })[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('txt_registered_users', JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
}

function loadInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('txt_current_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const currentUser = atom<User | null>(loadInitialUser());
export const isAuthenticated = computed(currentUser, (user) => Boolean(user));
export const isAuthModalOpen = atom<boolean>(false);

if (typeof window !== 'undefined') {
  currentUser.subscribe((user) => {
    try {
      if (user) {
        localStorage.setItem('txt_current_user', JSON.stringify(user));
        const users = getStoredUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx > -1) {
          users[idx] = { ...users[idx], ...user };
          saveUsers(users);
        }
      } else {
        localStorage.removeItem('txt_current_user');
      }
    } catch (err) {
      console.error('Failed to update current user session', err);
    }
  });
}

export function loginUser(emailOrUsername: string, pass: string): { success: boolean; error?: string; user?: User } {
  const users = getStoredUsers();
  const cleanInput = emailOrUsername.trim().toLowerCase();

  const found = users.find(
    (u) =>
      u.email.toLowerCase() === cleanInput ||
      u.username.toLowerCase() === cleanInput.replace(/^@/, '') ||
      (u.phone && u.phone.replace(/\s+/g, '') === cleanInput.replace(/\s+/g, ''))
  );

  if (!found) {
    return { success: false, error: 'No account found with this email, username or phone.' };
  }

  if (found.password !== pass) {
    return { success: false, error: 'Incorrect password. Please verify your credentials.' };
  }

  const { password, ...safeUser } = found;
  currentUser.set(safeUser);
  return { success: true, user: safeUser };
}

export function registerUser(payload: RegisterPayload): { success: boolean; error?: string; user?: User } {
  const users = getStoredUsers();
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanUsername = (payload.username || payload.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    .trim()
    .toLowerCase()
    .replace(/^@/, '');

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const initialAddresses: UserAddress[] = [];
  let selectedAddressId: string | undefined;

  if (payload.initialAddress) {
    const addrId = `addr_${Date.now()}`;
    initialAddresses.push({
      ...payload.initialAddress,
      id: addrId,
      isDefault: true,
    });
    selectedAddressId = addrId;
  }

  const newUser = {
    id: `moa_${Date.now()}`,
    name: payload.name.trim(),
    email: cleanEmail,
    phone: payload.phone || '+62 812 3456 7890',
    password: payload.password,
    username: cleanUsername,
    bias: payload.bias || 'Yeonjun',
    biasEmoji: payload.biasEmoji || '🦊',
    membershipTier: 'Verified MOA Membership',
    membershipNumber: `MOA-${randomDigits}`,
    joinedAt: formattedDate,
    addresses: initialAddresses,
    selectedAddressId: selectedAddressId,
  };

  users.push(newUser);
  saveUsers(users);

  const { password, ...safeUser } = newUser;
  currentUser.set(safeUser);
  return { success: true, user: safeUser };
}

export function logoutUser() {
  currentUser.set(null);
}

export function quickDemoLogin(memberBias: string = 'Yeonjun', biasEmoji: string = '🦊') {
  const demoUser = DEFAULT_USERS[0];
  const { password, ...safeUser } = demoUser;
  currentUser.set(safeUser);
  return safeUser;
}

export function addUserAddress(addressData: Omit<UserAddress, 'id'>): UserAddress {
  const user = currentUser.get();
  const newAddr: UserAddress = {
    ...addressData,
    id: `addr_${Date.now()}`,
  };

  if (!user) {
    return newAddr;
  }

  const currentAddresses = user.addresses || [];
  let updatedList = [...currentAddresses];

  if (newAddr.isDefault || updatedList.length === 0) {
    newAddr.isDefault = true;
    updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
  }

  updatedList.push(newAddr);
  const updatedUser: User = {
    ...user,
    addresses: updatedList,
    selectedAddressId: newAddr.isDefault ? newAddr.id : user.selectedAddressId || newAddr.id,
  };

  currentUser.set(updatedUser);
  return newAddr;
}

export function updateUserAddress(id: string, updates: Partial<UserAddress>) {
  const user = currentUser.get();
  if (!user || !user.addresses) return;

  let updatedList = user.addresses.map((addr) => {
    if (addr.id === id) {
      return { ...addr, ...updates };
    }
    if (updates.isDefault) {
      return { ...addr, isDefault: false };
    }
    return addr;
  });

  const updatedUser: User = {
    ...user,
    addresses: updatedList,
    selectedAddressId: updates.isDefault ? id : user.selectedAddressId,
  };

  currentUser.set(updatedUser);
}

export function deleteUserAddress(id: string) {
  const user = currentUser.get();
  if (!user || !user.addresses) return;

  const updatedList = user.addresses.filter((a) => a.id !== id);
  let newSelected = user.selectedAddressId;

  if (newSelected === id) {
    newSelected = updatedList[0]?.id;
  }

  const updatedUser: User = {
    ...user,
    addresses: updatedList,
    selectedAddressId: newSelected,
  };

  currentUser.set(updatedUser);
}

export function setSelectedAddress(id: string) {
  const user = currentUser.get();
  if (!user) return;
  currentUser.set({
    ...user,
    selectedAddressId: id,
  });
}

export function updateUserRecipient(name: string, email: string, phone: string) {
  const user = currentUser.get();
  if (!user) return;
  currentUser.set({
    ...user,
    name,
    email,
    phone,
  });
}
