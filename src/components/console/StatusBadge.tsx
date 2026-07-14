'use client';
import { MdCheckCircle, MdCancel, MdOutlineError } from 'react-icons/md';

// 统一状态徽章,复用模板 ComplexTable 里的图标 + 配色语义。
const MAP: Record<string, { cls: string; icon: JSX.Element; label?: string }> = {
  active: { cls: 'text-green-500 dark:text-green-300', icon: <MdCheckCircle /> },
  healthy: { cls: 'text-green-500 dark:text-green-300', icon: <MdCheckCircle /> },
  success: { cls: 'text-green-500 dark:text-green-300', icon: <MdCheckCircle /> },
  delivered: { cls: 'text-green-500 dark:text-green-300', icon: <MdCheckCircle /> },
  disabled: { cls: 'text-gray-500 dark:text-gray-300', icon: <MdCancel /> },
  revoked: { cls: 'text-gray-500 dark:text-gray-300', icon: <MdCancel /> },
  down: { cls: 'text-red-500 dark:text-red-300', icon: <MdCancel /> },
  failed: { cls: 'text-red-500 dark:text-red-300', icon: <MdCancel /> },
  abandoned: { cls: 'text-red-500 dark:text-red-300', icon: <MdOutlineError /> },
  degraded: { cls: 'text-amber-500 dark:text-amber-300', icon: <MdOutlineError /> },
  pending: { cls: 'text-amber-500 dark:text-amber-300', icon: <MdOutlineError /> },
};

export default function StatusBadge({ status }: { status: string }) {
  const entry = MAP[status] ?? { cls: 'text-gray-500', icon: <MdOutlineError /> };
  return (
    <div className={`flex items-center gap-1 text-sm font-bold ${entry.cls}`}>
      {entry.icon}
      <span>{status}</span>
    </div>
  );
}
