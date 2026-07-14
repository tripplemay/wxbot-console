'use client';
import Card from 'components/card';

// 各栏目在 Phase 2/3 前的统一占位组件,复用模板 Card。
export default function PagePlaceholder(props: {
  title: string;
  description: string;
  phase?: string;
}) {
  const { title, description, phase } = props;
  return (
    <div className="mt-3 flex w-full flex-col gap-5">
      <Card extra="w-full px-6 py-6">
        <div className="flex items-center justify-between">
          <h4 className="text-2xl font-bold text-navy-700 dark:text-white">
            {title}
          </h4>
          {phase ? (
            <span className="rounded-full bg-lightPrimary px-3 py-1 text-xs font-medium text-brand-500 dark:bg-navy-700 dark:text-white">
              {phase}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </Card>
    </div>
  );
}
