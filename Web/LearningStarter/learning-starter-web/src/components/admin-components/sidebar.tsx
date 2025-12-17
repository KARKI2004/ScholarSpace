import { Stack, Group, Text, UnstyledButton, rem } from "@mantine/core";
import {
  IconHome,
  IconUsers,
  IconNotes,
  IconMessageCircle
} from "@tabler/icons-react";
import { NavLink, useLocation } from "react-router-dom";
import { routes } from "../../routes";

const topLinks = [
  { label: "Dashboard", icon: IconHome, path: routes.adminPage },
  { label: "Users", icon: IconUsers, path: routes.userManagement },
  { label: "Blogs", icon: IconNotes, path: routes.blogManagement },
  { label: "Threads", icon: IconMessageCircle, path: routes.threadsManagement },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <Stack
      p="md"
      style={{
        height: "100%",
        justifyContent: "space-between",
      }}
    >
      <div>
        <Group justify="center" mb="md">
          <Text size="lg" fw={700}>
            Admin Panel
          </Text>
        </Group>

        <Stack gap="xs">
          {topLinks.map((item) => (
            <UnstyledButton
              key={item.label}
              component={NavLink}
              to={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                gap: rem(8),
                padding: "0.6rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                backgroundColor:
                  location.pathname === item.path ? "#75d34fff" : "transparent",
                color: location.pathname === item.path ? "white" : "inherit",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#75d34fff")
              }
              onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                location.pathname === item.path ? "#57ae63ff" : "transparent")
              }
            >
              <item.icon size={20} />
              <Text size="sm">{item.label}</Text>
            </UnstyledButton>
          ))}
        </Stack>
      </div>


    </Stack>
  );
}
