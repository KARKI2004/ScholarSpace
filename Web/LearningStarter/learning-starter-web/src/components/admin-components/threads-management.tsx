import {
  Table,
  Title,
  ActionIcon,
  Group,
  Loader,
  Badge,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  ApiResponse,
  ForumThreadGetDto,
  UserDto,
  CommentGetDto,
} from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "../../authentication/use-auth";
import { useNavigate } from "react-router-dom";

export const ThreadsManagement = () => {
  const [threads, setThreads] = useState<ForumThreadGetDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [comments, setComments] = useState<CommentGetDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const countCommentsForThread = (threadId: number) => {
    return comments.filter((c) => c.forumThreadId === threadId).length;
  };

  const getThreads = async () => {
    try {
      const response = await api.get<ForumThreadGetDto[]>(`/api/ForumThreads`);
      setThreads(response.data);
    } catch (error) {
      showNotification({
        message: "Error fetching threads",
        color: "red",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const getComments = async () => {
    try {
      const response = await api.get<CommentGetDto[]>(`/api/Comments`);
      setComments(response.data);
    } catch (error) {
      console.error("Failed to fetch comments", error);
    }
  };

  const getUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const getAuthorName = (id: number) => {
    const u = users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Unknown";
  };

  const deleteThread = async (id: number) => {
    if (user?.role !== "Admin") {
      showNotification({
        message: "Only admins can delete threads",
        color: "red",
        position: "top-right",
      });
      return;
    }

    try {
      await api.delete(`/api/ForumThreads/${id}`);

      showNotification({
        message: "Thread deleted successfully",
        color: "green",
        position: "top-right",
      });

      getThreads();
      getComments();
    } catch (err) {
      showNotification({
        message: "Failed to delete thread",
        color: "red",
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    getUsers();
    getThreads();
    getComments();
  }, []);

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="green" size="lg" />
      </Group>
    );
  }

  return (
    <>
      <Title order={3} mb="sm">
        Thread Management
      </Title>

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Post</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Comments</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Table.Tr
                key={thread.id}
                style={{
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/thread-detail/${thread.id}`)}
              >
                <Table.Td>{thread.post}</Table.Td>

                <Table.Td>{getAuthorName(thread.userId)}</Table.Td>

                <Table.Td>
                  <Badge color="blue" variant="light">
                    {countCommentsForThread(thread.id)}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {new Date(thread.createdAt).toLocaleDateString()}
                </Table.Td>
                <Table.Td
                  onClick={(e) => e.stopPropagation()}
                >
                  <Group gap="xs">
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => deleteThread(thread.id)}
                      disabled={user?.role !== "Admin"}
                      style={{
                        opacity: user?.role !== "Admin" ? 0.5 : 1,
                        cursor:
                          user?.role !== "Admin" ? "not-allowed" : "pointer",
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                No threads found.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </>
  );
};
