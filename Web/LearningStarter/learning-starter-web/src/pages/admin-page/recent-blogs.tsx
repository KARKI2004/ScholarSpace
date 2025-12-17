import { Table, Title, Badge } from "@mantine/core";
import { useEffect, useState } from "react";
import api from "../../config/axios";
import {
  ApiResponse,
  BlogGetDto,
  CategoriesGetDto,
  UserDto,
} from "../../constants/types";

export const RecentBlogs = () => {
  const [blogs, setBlogs] = useState<BlogGetDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [categories, setCategories] = useState<CategoriesGetDto[]>([]);

  const getCategories = async () => {
    try {
      const res = await api.get<CategoriesGetDto[]>(`/api/Categories`);
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const getBlogs = async () => {
    try {
      const response = await api.get<BlogGetDto[]>(`/api/Blog`);

      const sorted = [...response.data]
        .sort((a, b) => {
          const dateA = new Date(a.createdDate).getTime();
          const dateB = new Date(b.createdDate).getTime();
          return dateB - dateA;
        })
        .slice(0, 5);

      setBlogs(sorted);
    } catch (error) {
      console.error("Error fetching recent blogs", error);
    }
  };

  const getCategoryName = (id: number): string => {
    const found = categories.find((c) => c.id === id);
    return found ? found.name : "Unknown";
  };
  const getUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);
      setUsers(response.data.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };
  const getAuthorName = (id: number) => {
    const u = users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Unknown";
  };

  useEffect(() => {
    getCategories();
    getBlogs();
    getUsers();
  }, []);

  return (
    <>
      <Title order={3} mb="sm">
        Latest Blogs
      </Title>

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {blogs.map((blog: BlogGetDto) => (
            <Table.Tr key={blog.id}>
              <Table.Td>{blog.blogTitle}</Table.Td>
              <Table.Td>{getAuthorName(blog.userId)}</Table.Td>

              <Table.Td>
                <Badge color="green">{getCategoryName(blog.categoryId)}</Badge>
              </Table.Td>

              <Table.Td>
                {new Date(blog.createdDate).toLocaleDateString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
