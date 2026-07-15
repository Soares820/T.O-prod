'use client';

import { useEffect, useCallback } from 'react';

export type ToastType = 'check' | 'error' | 'info' | 'warn';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

const ICONS: Record<ToastType, string> = {
  check: '✓',
  error: '✕',
  info: 'ℹ',
  warn: '⚠',
};

function createToast(message: string, type: ToastType = 'info', duration = 3500) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span>${ICONS[type]}</span><span>${message}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, duration);
}

// Global toast function — accessible from anywhere
if (typeof window !== 'undefined') {
  Object.assign(window, { toast: createToast });
}

export function toast(message: string, type: ToastType = 'info', duration?: number) {
  createToast(message, type, duration);
}

export default function ToastContainer() {
  return null; // Container is in layout.tsx
}
