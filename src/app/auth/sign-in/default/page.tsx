'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputField from 'components/fields/InputField';
import Default from 'components/auth/variants/DefaultAuthLayout';
import Checkbox from 'components/checkbox';

// 运营控制台登录页。复用模板 DefaultAuthLayout + InputField + Checkbox,
// 提交到 BFF /api/auth/login(邮箱+密码),成功后跳转控制台。
function SignInDefault() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || '登录失败,请重试');
        setLoading(false);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      router.push(next && next.startsWith('/admin') ? next : '/admin/default');
    } catch {
      setError('网络错误,请重试');
      setLoading(false);
    }
  };

  return (
    <Default
      maincard={
        <div className="mb-16 mt-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
          {/* Sign in section */}
          <form
            onSubmit={onSubmit}
            className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]"
          >
            <h3 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
              运营登录
            </h3>
            <p className="mb-9 ml-1 text-base text-gray-600">
              使用运营账号邮箱与密码登录 Bot Platform 控制台
            </p>

            {/* Email */}
            <InputField
              variant="auth"
              extra="mb-3"
              label="邮箱*"
              placeholder="ops@example.com"
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />

            {/* Password */}
            <InputField
              variant="auth"
              extra="mb-3"
              label="密码*"
              placeholder="至少 8 位"
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />

            {error ? (
              <p className="mb-3 ml-1 text-sm font-medium text-red-500 dark:text-red-400">
                {error}
              </p>
            ) : null}

            {/* Checkbox */}
            <div className="mb-4 flex items-center justify-between px-2">
              <div className="mt-2 flex items-center">
                <Checkbox />
                <p className="ml-2 text-sm font-medium text-navy-700 dark:text-white">
                  保持登录
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="linear w-full rounded-xl bg-brand-500 py-3 text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>
        </div>
      }
    />
  );
}

export default SignInDefault;
