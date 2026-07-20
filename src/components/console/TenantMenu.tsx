'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Dropdown from 'components/dropdown';
import avatar from '/public/img/avatars/avatar4.png';

// Navbar profile dropdown for the tenant console: shows the signed-in member +
// tenant, and a logout action (clears the tenant session cookie).
export default function TenantMenu() {
  const [email, setEmail] = useState('');
  const [tenant, setTenant] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    fetch('/api/tenant/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.member) {
          setEmail(d.member.email || '');
          setRole(d.member.role || '');
          setTenant(d.tenant?.name || '');
        }
      })
      .catch(() => {});
  }, []);

  const logout = async () => {
    await fetch('/api/tenant/logout', { method: 'POST' }).catch(() => {});
    window.location.href = '/tenant/sign-in';
  };

  return (
    <Dropdown
      button={
        <Image width="2" height="20" className="h-10 w-10 rounded-full" src={avatar} alt="tenant" />
      }
      classNames={'py-2 top-8 -left-[180px] w-max'}
    >
      <div className="flex h-max w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat pb-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
        <div className="ml-4 mt-3">
          <p className="text-sm font-bold text-navy-700 dark:text-white">
            🏢 {tenant || '租户'}
          </p>
          {email ? (
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
              {email}
              {role ? ` · ${role}` : ''}
            </p>
          ) : null}
        </div>
        <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20" />
        <div className="ml-4 mt-3 flex flex-col">
          <button onClick={logout} className="text-left text-sm font-medium text-red-500 hover:text-red-500">
            退出登录
          </button>
        </div>
      </div>
    </Dropdown>
  );
}
