import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin-components/sidebar";

export const AdminLayout = () => {
  return (
    <AppShell
      padding="md"
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: true },
      }}
      header={{ height: 50 }}
    >
      <AppShell.Navbar p="md">
        <AdminSidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
};
