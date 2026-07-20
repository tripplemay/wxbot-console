'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';

// 租户自助注册页。提交到 /api/tenant/signup(建租户 + owner),成功后直接进入控制台。
export default function TenantSignUp() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('密码至少 8 位');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/tenant/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantName, email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.error || '注册失败');
        setLoading(false);
        return;
      }
      router.push('/tenant/dashboard');
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
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">注册租户</h3>
            <p className="mb-9 ml-1 text-base text-gray-600">创建你的租户,立即开始接入自己的应用</p>
            <InputField variant="auth" extra="mb-3" label="租户名称*" placeholder="例如:Acme Inc." id="tenantName" type="text"
              value={tenantName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTenantName(e.target.value)} />
            <InputField variant="auth" extra="mb-3" label="邮箱*" placeholder="you@company.com" id="email" type="email"
              value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
            <InputField variant="auth" extra="mb-3" label="密码*" placeholder="至少 8 位" id="password" type="password"
              value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
            {error ? <p className="mb-3 ml-1 text-sm font-medium text-red-500 dark:text-red-400">{error}</p> : null}
            <button type="submit" disabled={loading}
              className="linear mt-2 w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 disabled:opacity-60 dark:bg-brand-400">
              {loading ? '注册中…' : '注册并进入'}
            </button>
            <div className="mt-4">
              <span className="text-sm font-medium text-navy-700 dark:text-gray-500">已有账号?</span>
              <a href="/tenant/sign-in" className="ml-1 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-white">
                去登录
              </a>
            </div>
          </form>
        </div>
      }
    />
  );
}
