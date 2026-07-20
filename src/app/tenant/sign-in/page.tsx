'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';

// 租户登录页。提交到 /api/tenant/login,成功后进入租户控制台。
export default function TenantSignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || '登录失败');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      router.push(next && next.startsWith('/tenant') ? next : '/tenant/dashboard');
    } catch {
      setError('网络错误,请重试');
      setLoading(false);
    }
  };

  return (
    <Default
      maincard={
        <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          <form onSubmit={onSubmit} className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">租户登录</h3>
            <p className="mb-9 ml-1 text-base text-gray-600">登录以管理你的应用、邀请码与绑定</p>
            <InputField variant="auth" extra="mb-3" label="邮箱*" placeholder="you@company.com" id="email" type="email"
              value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            <InputField variant="auth" extra="mb-3" label="密码*" placeholder="至少 8 位" id="password" type="password"
              value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            {error ? <p className="mb-3 ml-1 text-sm font-medium text-red-500 dark:text-red-400">{error}</p> : null}
            <button type="submit" disabled={loading}
              className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 disabled:opacity-60 dark:bg-brand-400">
              {loading ? '登录中…' : '登录'}
            </button>
            <div className="mt-4">
              <span className="text-sm font-medium text-navy-700 dark:text-gray-500">还没有账号?</span>
              <a href="/tenant/sign-up" className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white">
                注册租户
              </a>
            </div>
          </form>
        </div>
      }
    />
  );
}
