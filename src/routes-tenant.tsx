import {
  MdSpaceDashboard,
  MdApps,
  MdVpnKey,
  MdLink,
  MdPayments,
} from 'react-icons/md';

// 租户自助端侧边栏导航。URL = layout + path,页面在 src/app/tenant/<path>/page.tsx。
const tenantRoutes = [
  {
    name: 'Dashboard',
    layout: '/tenant',
    path: '/dashboard',
    icon: <MdSpaceDashboard className="text-inherit h-5 w-5" />,
  },
  {
    name: 'My Apps',
    layout: '/tenant',
    path: '/apps',
    icon: <MdApps className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Invite Codes',
    layout: '/tenant',
    path: '/invites',
    icon: <MdVpnKey className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Bindings',
    layout: '/tenant',
    path: '/bindings',
    icon: <MdLink className="text-inherit h-5 w-5" />,
  },
  {
    name: 'Usage',
    layout: '/tenant',
    path: '/usage',
    icon: <MdPayments className="text-inherit h-5 w-5" />,
  },
];
export default tenantRoutes;
