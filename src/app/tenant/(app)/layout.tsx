'use client';
import { usePathname } from 'next/navigation';
import { useContext, useState } from 'react';
import { ConfiguratorContext } from 'contexts/ConfiguratorContext';
import tenantRoutes from 'routes-tenant';
import {
  getActiveNavbar,
  getActiveRoute,
  isWindowAvailable,
} from 'utils/navigation';
import React from 'react';
import { Portal } from '@chakra-ui/portal';
import Navbar from 'components/navbar';
import Sidebar from 'components/sidebar';
import Footer from 'components/footer/Footer';
import TenantMenu from 'components/console/TenantMenu';
import TenantSidebarFooter from 'components/console/TenantSidebarFooter';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const pathname = usePathname();
  if (isWindowAvailable()) document.documentElement.dir = 'ltr';
  const context = useContext(ConfiguratorContext);
  const { mini, theme, setTheme, setMini } = context;
  return (
    <div className="flex h-full w-full bg-background-100 dark:bg-background-900">
      <Sidebar
        routes={tenantRoutes}
        open={open}
        setOpen={() => setOpen(!open)}
        hovered={hovered}
        setHovered={setHovered}
        mini={mini}
        variant="admin"
        footer={<TenantSidebarFooter />}
      />
      <div className="h-full w-full font-dm dark:bg-navy-900">
        <main
          className={`mx-2.5 flex-none transition-all dark:bg-navy-900 md:pr-2 ${
            mini === false
              ? 'xl:ml-[313px]'
              : mini === true && hovered === true
              ? 'xl:ml-[313px]'
              : 'ml-0 xl:ml-[142px]'
          } `}
        >
          <div>
            <Portal>
              <Navbar
                onOpenSidenav={() => setOpen(!open)}
                brandText={getActiveRoute(tenantRoutes as any, pathname)}
                secondary={getActiveNavbar(tenantRoutes as any, pathname)}
                theme={theme}
                setTheme={setTheme}
                hovered={hovered}
                mini={mini}
                setMini={setMini}
                menu={<TenantMenu />}
              />
            </Portal>
            <div className="mx-auto min-h-screen p-2 !pt-[100px] md:p-2">
              {children}
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
