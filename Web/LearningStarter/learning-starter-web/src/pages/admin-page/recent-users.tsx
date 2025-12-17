import { Table, Title, Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import { UserDto, ApiResponse } from "../../constants/types";

export const RecentUsers = () => {
  const [users, setUsers] = useState<UserDto[]>([]);

  const getUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);

      const randomFive = [...response.data.data]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      setUsers(randomFive);

    } catch (error) {
      console.error("Error fetching recent users", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <Title order={3} mb="sm">
        Latest Users
      </Title>

      <Table highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Username</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {users.map((user: UserDto) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                {user.firstName} {user.lastName}
              </Table.Td>
              <Table.Td>{user.userName}</Table.Td>
              <Table.Td>
                <Badge>{user.status}</Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
