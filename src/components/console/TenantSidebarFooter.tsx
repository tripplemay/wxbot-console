'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import avatar from '/public/img/avatars/avatar4.png';

// Sidebar footer identity for the tenant console.
export default function TenantSidebarFooter() {
  const [email, setEmail] = useState('');
  const [tenant, setTenant] = useState('');

  useEffect(() => {
    fetch('/api/tenant/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.member) {
          setEmail(d.member.email || '');
          setTenant(d.tenant?.name || '');
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="mt-5 flex items-center justify-center gap-3">
      <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-200">
        <Image fill src={avatar} className="rounded-full" alt="tenant" />
      </div>
      <div className="ml-1">
        <h4 className="max-w-[140px] truncate text-sm font-bold text-navy-700 dark:text-white">
          {tenant || '租户'}
        </h4>
        <p className="max-w-[140px] truncate text-xs font-medium text-gray-600">
          {email || '—'}
        </p>
      </div>
    </div>
  );
}
