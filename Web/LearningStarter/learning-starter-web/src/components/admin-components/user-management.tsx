import { Table, Title, Badge, ActionIcon, Group } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ApiResponse, UserDto } from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "../../authentication/use-auth";
import { useAsyncFn } from "react-use";

export const UserManagement = () => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [universityNames, setUniversityNames] = useState<
    Record<number, string>
  >({});

  const { user } = useAuth();

  const getUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);
      setUsers(response.data.data);
    } catch (error) {
      showNotification({
        message: "Error fetching user data",
        color: "red",
        position: "top-right",
      });
    }
  };

  const [, fetchUniversityName] = useAsyncFn(
    async (id: number) => {
      if (!universityNames[id]) {
        const res = await api.get<{ id: number; name: string }>(
          `/api/Universities/${id}`
        );
        setUniversityNames((prev) => ({ ...prev, [id]: res.data.name }));
      }
    },
    [universityNames]
  );

  const deleteUser = async (id: number) => {
    if (id === user?.id) {
      showNotification({
        message: "You cannot delete your own account",
        color: "red",
        position: "top-right",
      });
      return;
    }

    if (user?.role !== "Admin") {
      showNotification({
        message: "Only admins can delete user accounts",
        color: "red",
        position: "top-right",
      });
      return;
    }
    try {
      await api.delete(`/api/users/${id}`);

      showNotification({
        message: "User deleted successfully",
        color: "green",
        position: "top-right",
      });

      getUsers();
    } catch (error) {
      showNotification({
        message: "Failed to delete user",
        color: "red",
        position: "top-right",
      });
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    users.forEach((u) => {
      if (u.universityId && !universityNames[u.universityId]) {
        fetchUniversityName(u.universityId);
      }
    });
  }, [users, universityNames, fetchUniversityName]);
  return (
    <>
      <Title order={3} mb="sm">
        User Management
      </Title>

      <Table highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User ID</Table.Th>
            <Table.Th>First Name</Table.Th>
            <Table.Th>Last Name</Table.Th>
            <Table.Th>Username</Table.Th>
            <Table.Th>University</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.id}</Table.Td>
              <Table.Td>{u.firstName}</Table.Td>
              <Table.Td>{u.lastName}</Table.Td>
              <Table.Td>{u.userName}</Table.Td>
              <Table.Td>
                {universityNames[u.universityId] || "Loading..."}
              </Table.Td>
              <Table.Td>
                <Badge>{u.status}</Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => deleteUser(u.id)}
                    disabled={user?.role !== "Admin" || u.id === user?.id}
                    style={{
                      opacity:
                        user?.role !== "Admin" || u.id === user?.id ? 0.5 : 1,
                      cursor:
                        user?.role !== "Admin" || u.id === user?.id
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
