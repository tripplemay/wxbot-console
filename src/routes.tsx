import {
  MdHome,
  MdGroups,
  MdApps,
  MdOutlineSend,
  MdInbox,
  MdPayments,
  MdMonitorHeart,
} from 'react-icons/md';

// Bot Platform 运营工作台 —— 侧边栏导航(运营端 v1)
// 每个顶层项带 icon,由 Sidebar 渲染成扁平 NavLink;
// URL = layout + path,页面在 src/app<layout><path>/page.tsx。

const routes = [
  {
    name: 'Overview',
    layout: '/admin',
    path: '/default',
    icon: <MdHome className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Tenants',
    layout: '/admin',
    path: '/tenants',
    icon: <MdGroups className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Apps',
    layout: '/admin',
    path: '/apps',
    icon: <MdApps className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Delivery Logs',
    layout: '/admin',
    path: '/delivery-logs',
    icon: <MdOutlineSend className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Events',
    layout: '/admin',
    path: '/events',
    icon: <MdInbox className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Usage & Billing',
    layout: '/admin',
    path: '/billing',
    icon: <MdPayments className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Channel Health',
    layout: '/admin',
    path: '/health',
    icon: <MdMonitorHeart className="text-inherit h-5 w-5" />,
  },
];
export default routes;
