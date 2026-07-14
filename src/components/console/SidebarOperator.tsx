'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import avatar from '/public/img/avatars/avatar4.png';

// Sidebar footer identity: shows the signed-in operator (replaces the
// template's demo profile card).
export default function SidebarOperator() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.operator) {
          setEmail(d.operator.email || '');
          setName(d.operator.name || '');
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-200">
        <Image fill src={avatar} className="rounded-full" alt="operator" />
      </div>
      <div className="ml-1">
        <h4 className="text-sm font-bold text-navy-700 dark:text-white">
          {name || '运营账号'}
        </h4>
        <p className="max-w-[140px] truncate text-xs font-medium text-gray-600">
          {email || '—'}
        </p>
      </div>
    </div>
  );
}
