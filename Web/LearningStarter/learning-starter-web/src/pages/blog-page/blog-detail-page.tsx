import {
  Container, Text, Title, Image, Badge, Divider, Center, Loader,
  Button, Paper, Stack, ScrollArea, Box, Grid,
} from "@mantine/core";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ApiResponse, BlogGetDto, CategoriesGetDto, UserDto } from "../../constants/types";
import api from "../../config/axios";
import { showNotification } from "@mantine/notifications";
import { useAuth } from "../../authentication/use-auth";
import { useAsyncFn } from "react-use";

export const BlogDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<BlogGetDto | null>(null);
  const [author, setAuthor] = useState<UserDto | null>(null);
  const [category, setCategory] = useState<CategoriesGetDto | null>(null);
  const [sidebarBlogs, setSidebarBlogs] = useState<BlogGetDto[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [, fetchBlog] = useAsyncFn(async () => {
    try {
      const response = await api.get<BlogGetDto>(`/api/Blog/${id}`);
      const data = response.data;
      setBlog(data);
      setLikesCount(data.likesCount ?? 0);
      setIsLiked(user ? data.likedUserIds.includes(user.id) : false);

      const authorResp = await api.get<ApiResponse<UserDto>>(`/api/Users/${data.userId}`);
      setAuthor(authorResp.data.data);

      const categoryResp = await api.get<CategoriesGetDto>(`/api/Categories/${data.categoryId}`);
      setCategory(categoryResp.data);

      const allBlogsResp = await api.get<BlogGetDto[]>(`/api/Blog`);
      let filtered = allBlogsResp.data
        .filter(b => b.id !== data.id)
        .filter(b => b.userId === data.userId);
      if (filtered.length === 0) {
        filtered = allBlogsResp.data
          .filter(b => b.id !== data.id)
          .filter(b => b.categoryId === data.categoryId);
      }
      setSidebarBlogs(filtered.slice(0, 4));
    } catch (error) {
      console.error(error);
      showNotification({ message: "Failed to load blog details", color: "red" });
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchBlog();
  }, [id]);

  const toggleLike = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      await api.post(`/api/Blog/${id}/like`, null, {
        params: { userId: user.id },
      });
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error(error);
      showNotification({ message: "Failed to update like", color: "red" });
    }
  };

  if (!blog) {
    return (
      <Center style={{ height: "70vh" }}>
        <Loader size="lg" color="blue" />
      </Center>
    );
  }

  return (
    <Container size="xl" mt="md" mb="xl">
      <Grid gutter="xl">
        <Grid.Col span={9}>
          <Stack gap={20}>
            <Text size="sm" c="dimmed">
              Blogs / {blog.blogTitle}
            </Text>

            <Title order={2}>{blog.blogTitle}</Title>

            <Text size="sm" c="dimmed">
              By {author?.firstName} {author?.lastName} |{" "}
              {new Date(blog.createdDate).toLocaleDateString()}
            </Text>

            {blog.blogImageUrl && (
              <Image
                src={`https://localhost:5001${blog.blogImageUrl}`}
                alt={blog.blogTitle}
                radius="md"
                height={350}
                fit="cover"
                styles={{
                  root: {
                    width: "100%",
                    maxHeight: "350px",
                    overflow: "hidden",
                    borderRadius: "12px",
                  },
                }}
              />

            )}

            <Divider my="md" />

            <Text size="md" style={{ whiteSpace: "pre-line" }}>
              {blog.body}
            </Text>

            <Box mt="md">
              <Button color="green" variant="outline" onClick={toggleLike}>
                {isLiked ? <IconHeartFilled size={18} style={{ marginRight: 8 }} /> : <IconHeart size={18} style={{ marginRight: 8 }} />}
                {likesCount} {likesCount === 1 ? "Like" : "Likes"}
              </Button>
            </Box>
          </Stack>
        </Grid.Col>

        <Grid.Col span={3}>
          <ScrollArea h="90vh">
            <Stack gap={15}>
              <Text fw={700} size="lg" mb="md">
                More from {author?.firstName} {author?.lastName}
              </Text>
              {sidebarBlogs.map(b => (
                <Paper
                  key={b.id}
                  shadow="xs"
                  p="sm"
                  radius="md"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/blog-detail/${b.id}`)}
                >
                  {b.blogImageUrl && (
                    <Image
                      src={`https://localhost:5001${b.blogImageUrl}`}
                      height={100}
                      alt={b.blogTitle}
                      radius="sm"
                      mb="xs"
                    />
                  )}
                  <Text fw={500} size="sm" mb={2}>
                    {b.blogTitle}
                  </Text>
                  <Badge size="xs" color="gray" variant="light">
                    {b.likesCount ?? 0} <IconHeart size={12} />
                  </Badge>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
