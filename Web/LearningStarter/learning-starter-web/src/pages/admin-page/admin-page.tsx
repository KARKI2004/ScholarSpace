import { Container, Space } from "@mantine/core";
import { StatsCards } from "../../components/admin-components/card";
import { RecentUsers } from "./recent-users";
import { RecentBlogs } from "./recent-blogs";

export const AdminPage = () => {
  return (
    <Container size="xl" px="lg" py="md">
      <StatsCards />
      <Space h="xl" />
      <RecentUsers />
      <Space h="xl" />
      <RecentBlogs />
    </Container>
  );
};
