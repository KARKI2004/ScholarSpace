import { NavLink, AppShell, Button } from "@mantine/core";
import { IconHome2, IconGauge, IconUser } from "@tabler/icons-react";

export function MyNavbar() {
  return (
    <AppShell.Section>
      <NavLink
        href="#home"
        label="Home"
        leftSection={<IconHome2 size="1rem" stroke={1.5} />}
      />
      <NavLink
        href="#dashboard"
        label="Dashboard"
        leftSection={<IconGauge size="1rem" stroke={1.5} />}
      />
      <NavLink
        href="#profile"
        label="Profile"
        leftSection={<IconUser size="1rem" stroke={1.5} />}
      />
      <AppShell.Section grow>
      </AppShell.Section>
      <Button fullWidth mt="md">
        Sign Out
      </Button>
    </AppShell.Section>
  );
}
