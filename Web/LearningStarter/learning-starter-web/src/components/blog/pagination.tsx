import { Pagination, Group } from "@mantine/core";

export const BlogPagination = () => (
  <Group justify="center" mt="lg">
    <Pagination total={5} radius="md" color="green" />
  </Group>
);
