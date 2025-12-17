import { useEffect, useState } from "react";
import {
  Box,
  Text,
  Avatar,
  Button,
  Group,
  TextInput,
  Select,
  Paper,
  Tabs,
  Loader,
  Badge,
  Table,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { useAsyncFn } from "react-use";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import {
  AnyObject,
  ApiResponse,
  UserDto,
  UniversitiesGetDto,
  BlogGetDto,
  CategoriesGetDto,
  ForumThreadGetDto,
} from "../../constants/types";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const [profile, setProfile] = useState<UserDto | null>(null);
  const [universityName, setUniversityName] = useState("");
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState("");

  const [blogs, setBlogs] = useState<BlogGetDto[]>([]);
  const [categories, setCategories] = useState<CategoriesGetDto[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);

  const [threads, setThreads] = useState<ForumThreadGetDto[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const navigate = useNavigate();

  const [, fetchUser] = useAsyncFn(async () => {
    const response = await api.get<ApiResponse<UserDto>>("/api/get-current-user");
    if (!response.data.data) return;
    setProfile(response.data.data);
    fetchUniversityName(response.data.data.universityId);
  }, []);

  const [, fetchUniversityName] = useAsyncFn(async (id: number) => {
    const res = await api.get<UniversitiesGetDto>(`/api/Universities/${id}`);
    setUniversityName(res.data.name);
  }, []);

  const getCategories = async () => {
    try {
      const res = await api.get<CategoriesGetDto[]>("/api/Categories");
      setCategories(res.data);
    } catch {
      showNotification({ message: "Failed to load categories", color: "red" });
    }
  };

  const getBlogs = async () => {
    try {
      const res = await api.get<BlogGetDto[]>("/api/Blog");
      setBlogs(res.data);
    } catch {
      showNotification({ message: "Failed to load blogs", color: "red" });
    } finally {
      setLoadingBlogs(false);
    }
  };

  const getThreads = async () => {
    try {
      const res = await api.get<ForumThreadGetDto[]>("/api/ForumThreads");
      setThreads(res.data);
    } catch {
      showNotification({ message: "Failed to load threads", color: "red" });
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    fetchUser();
    getBlogs();
    getCategories();
    getThreads();
  }, []);

  const saveChanges = async () => {
    if (!profile) return;

    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        userName: profile.userName,
        status: profile.status,
        password: password,
      };

      const response = await api.put<ApiResponse<any>>(
        `/api/users/${profile.id}`,
        payload
      );

      if (response.data.hasErrors) {
        const mappedErrors = response.data.errors.reduce<AnyObject>(
          (prev, curr) => {
            prev[curr.property] = curr.message;
            return prev;
          },
          {}
        );
        console.log("validation errors", mappedErrors);
        return;
      }

      showNotification({ message: "Profile updated!", color: "green" });
      setEditing(false);
      setPassword("");
      fetchUser();
    } catch {
      showNotification({ message: "Failed to update profile", color: "red" });
    }
  };

  const myBlogs = blogs.filter((b) => b.userId === profile?.id);
  const likedBlogs = blogs.filter((b) =>
    b.likedUserIds?.includes(profile?.id ?? -1)
  );
  const myThreads = threads.filter((t) => t.userId === profile?.id);

  if (!profile || loadingBlogs || loadingThreads) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="green" size="lg" />
      </Group>
    );
  }

  const openBlog = (id: number) => navigate(`/blog-detail/${id}`);
  const openThread = (id: number) => navigate(`/thread-detail/${id}`);

  return (
    <Box style={{ minHeight: "100vh", paddingTop: "60px", paddingBottom: "60px" }}>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" px="xl">
        <Paper p="xl" radius="lg">
          <Group align="flex-start">
            <Avatar radius={90} size={140} style={{ border: "4px solid #3fb984" }} />

            <Stack style={{ flex: 1 }}>
              <Text size="xl" fw={700}>
                {profile.firstName} {profile.lastName}
              </Text>
              <Text size="sm" opacity={0.6}>
                @{profile.userName}
              </Text>

              {editing ? (
                <>
                  <Group grow mt="xs">
                    <TextInput
                      label="First Name"
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile({ ...profile, firstName: e.target.value })
                      }
                    />

                    <TextInput
                      label="Last Name"
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile({ ...profile, lastName: e.target.value })
                      }
                    />
                  </Group>

                  <TextInput
                    mt="sm"
                    label="Username"
                    value={profile.userName}
                    onChange={(e) =>
                      setProfile({ ...profile, userName: e.target.value })
                    }
                  />

                  <Select
                    mt="sm"
                    label="Status"
                    value={profile.status}
                    data={["Freshman", "Sophomore", "Junior", "Senior"]}
                    onChange={(val) =>
                      setProfile({ ...profile, status: val || profile.status })
                    }
                  />

                  <TextInput mt="sm" label="University" disabled value={universityName} />

                  <TextInput
                    mt="sm"
                    label="Enter Password to Save Changes"
                    placeholder="Required"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </>
              ) : (
                <>
                  <Box mt="sm">
                    <Text fw={700}>University</Text>
                    <Text opacity={0.7}>{universityName}</Text>
                  </Box>

                  <Box mt="sm">
                    <Text fw={700}>Status</Text>
                    <Text opacity={0.7}>{profile.status}</Text>
                  </Box>
                </>
              )}

              <Group justify="flex-start" mt="md">
                <Button
                  size="sm"
                  color="green"
                  onClick={() => (editing ? saveChanges() : setEditing(true))}
                  disabled={editing && password.trim().length === 0}
                >
                  {editing ? "Save Changes" : "Edit Profile"}
                </Button>
              </Group>
            </Stack>
          </Group>
        </Paper>

        <Tabs defaultValue="myBlogs" w="100%">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="myBlogs">My Blogs</Tabs.Tab>
            <Tabs.Tab value="likedBlogs">Liked Blogs</Tabs.Tab>
            <Tabs.Tab value="myThreads">My Threads</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="myBlogs" pt="md">
            {myBlogs.length === 0 ? (
              <Text opacity={0.6}>You haven't posted any blogs yet.</Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {myBlogs.map((b) => (
                    <Table.Tr
                      key={b.id}
                      onClick={() => openBlog(b.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>{b.blogTitle}</Table.Td>
                      <Table.Td>
                        <Badge color="green">
                          {categories.find((c) => c.id === b.categoryId)?.name ||
                            "Unknown"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {new Date(b.createdDate).toLocaleDateString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="likedBlogs" pt="md">
            {likedBlogs.length === 0 ? (
              <Text opacity={0.6}>You haven't liked any blogs yet.</Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Title</Table.Th>
                    <Table.Th>Category</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {likedBlogs.map((b) => (
                    <Table.Tr
                      key={b.id}
                      onClick={() => openBlog(b.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>{b.blogTitle}</Table.Td>
                      <Table.Td>
                        <Badge color="green">
                          {categories.find((c) => c.id === b.categoryId)?.name ||
                            "Unknown"}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {new Date(b.createdDate).toLocaleDateString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="myThreads" pt="md">
            {myThreads.length === 0 ? (
              <Text opacity={0.6}>You haven't created any threads yet.</Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Thread</Table.Th>
                    <Table.Th>Date</Table.Th>
                  </Table.Tr>
                </Table.Thead>

                <Table.Tbody>
                  {myThreads.map((t) => (
                    <Table.Tr
                      key={t.id}
                      onClick={() => navigate(`/thread-detail/${t.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>{t.post.slice(0, 100)}...</Table.Td>
                      <Table.Td>
                        {new Date(t.createdAt).toLocaleDateString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Tabs.Panel>
        </Tabs>
      </SimpleGrid>
    </Box>
  );
};
