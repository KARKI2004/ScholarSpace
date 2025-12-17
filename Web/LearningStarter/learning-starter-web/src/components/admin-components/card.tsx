import { SimpleGrid, Card, Text, Title, Loader, Group } from "@mantine/core";
import { ApiResponse, BlogGetDto, ForumThreadGetDto, UserDto } from "../../constants/types";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";

export const StatsCards = () => {
  const [blogCount, setBlogCount] = useState<number>(0);
  const [userCount, setUserCount] = useState<number>(0);
  const [threadCount, setThreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const getBlogCount = async () => {
    try {
      const response = await api.get<BlogGetDto[]>(`/api/Blog`);
      setBlogCount(response.data.length);
    } catch (error) {
      console.error("Error fetching blog count:", error);
    }
  };

  const getUserCount = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);
      setUserCount(response.data.data.length);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const getThreadCount = async () => {
    try {
      const response = await api.get<ForumThreadGetDto[]>(`/api/ForumThreads`);
      setThreadCount(response.data.length);
    } catch (error) {
      console.error("Error fetching thread count:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([getBlogCount(), getUserCount(), getThreadCount()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <Group justify="center" align="flex-start">
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 4 }}
        spacing="lg"
        style={{
          width: "100%",
          maxWidth: "100%",
          marginLeft: "0",
        }}
      >
        <Card
          shadow="sm"
          radius="md"
          withBorder
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/admin/user-management")}
        >
          <Text c="dimmed" fw={500}>
            Total Users
          </Text>
          {loading ? (
            <Loader size="sm" color="green" mt="xs" />
          ) : (
            <Title order={2} mt="xs">
              {userCount}
            </Title>
          )}
        </Card>

        <Card
          shadow="sm"
          radius="md"
          withBorder
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/admin/blog-management")}
        >
          <Text c="dimmed" fw={500}>
            Blogs
          </Text>
          {loading ? (
            <Loader size="sm" color="green" mt="xs" />
          ) : (
            <Title order={2} mt="xs">
              {blogCount}
            </Title>
          )}
        </Card>

        <Card
          shadow="sm"
          radius="md"
          withBorder
          style={{ textAlign: "center", cursor: "pointer" }}
          onClick={() => navigate("/admin/threads-management")}
        >
          <Text c="dimmed" fw={500}>
            Threads
          </Text>
          {loading ? (
            <Loader size="sm" color="green" mt="xs" />
          ) : (
            <Title order={2} mt="xs">
              {threadCount}
            </Title>
          )}
        </Card>
      </SimpleGrid>
    </Group>
  );
};
