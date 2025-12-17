import {
  Table,
  Title,
  Badge,
  ActionIcon,
  Group,
  Loader,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  ApiResponse,
  BlogGetDto,
  CategoriesGetDto,
  UserDto,
} from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "../../authentication/use-auth";
import { useNavigate } from "react-router-dom";

export const BlogManagement = () => {
  const [blogs, setBlogs] = useState<BlogGetDto[]>([]);
  const [categories, setCategories] = useState<CategoriesGetDto[]>([]);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const getCategories = async () => {
    try {
      const response = await api.get<CategoriesGetDto[]>(`/api/Categories`);
      setCategories(response.data);
    } catch (err) {
      console.error("Failed categories", err);
    }
  };

  const getBlogs = async () => {
    try {
      const response = await api.get<BlogGetDto[]>(`/api/Blog`);
      setBlogs(response.data);
    } catch (error) {
      showNotification({
        message: "Error fetching blog data",
        color: "red",
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      const response = await api.get<ApiResponse<UserDto[]>>(`/api/users`);
      setUsers(response.data.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const getCategoryName = (id: number): string => {
    const c = categories.find((x) => x.id === id);
    return c ? c.name : "Unknown";
  };

  const getAuthorName = (id: number) => {
    const u = users.find((x) => x.id === id);
    return u ? `${u.firstName} ${u.lastName}` : "Unknown";
  };

  const deleteBlog = async (id: number) => {
    if (user?.role !== "Admin") {
      showNotification({
        message: "Only admins can delete blog posts",
        color: "red",
        position: "top-right",
      });
      return;
    }

    try {
      await api.delete(`/api/Blog/${id}`);

      showNotification({
        message: "Blog deleted successfully",
        color: "green",
        position: "top-right",
      });

      getBlogs();
    } catch (err) {
      showNotification({
        message: "Failed to delete blog",
        color: "red",
        position: "top-right",
      });
    }
  };

  const editBlog = (id: number) => {
    navigate(`/blog-edit/${id}`);
  };

  useEffect(() => {
    getCategories();
    getBlogs();
    getUsers();
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
        Blog Management
      </Title>

      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Title</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Likes</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <Table.Tr
                key={blog.id}
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/blog-detail/${blog.id}`)}
              >
                <Table.Td>{blog.blogTitle}</Table.Td>

                <Table.Td>{getAuthorName(blog.userId)}</Table.Td>

                <Table.Td>
                  <Badge color="green">{getCategoryName(blog.categoryId)}</Badge>
                </Table.Td>

                <Table.Td>
                  <Badge color="blue" variant="light">
                    {blog.likesCount}
                  </Badge>
                </Table.Td>

                <Table.Td>
                  {new Date(blog.createdDate).toLocaleDateString()}
                </Table.Td>

                <Table.Td
                  onClick={(e) => e.stopPropagation()}
                >
                  <Group gap="xs">
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => editBlog(blog.id)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>

                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => deleteBlog(blog.id)}
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
              <Table.Td colSpan={6} style={{ textAlign: "center" }}>
                No blogs found.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </>
  );
};
