import {
  Box, Button, Card, Container, Grid, Image, Stack, Text, Title, Loader,
} from "@mantine/core";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../config/axios";
import { BlogGetDto, ForumThreadGetDto } from "../../constants/types";

export const LandingPage = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogGetDto[]>([]);
  const [threads, setThreads] = useState<ForumThreadGetDto[]>([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const getBlogs = async () => {
    try {
      setLoadingBlogs(true);
      const res = await api.get<BlogGetDto[]>(`/api/Blog`);

      const latest = [...res.data]
        .sort(
          (a, b) =>
            new Date(b.createdDate).getTime() -
            new Date(a.createdDate).getTime()
        )
        .slice(0, 3);

      setBlogs(latest);
    } catch (err) {
      console.error("Failed loading blogs:", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const getThreads = async () => {
    try {
      setLoadingThreads(true);
      const res = await api.get<ForumThreadGetDto[]>(`/api/ForumThreads`);

      const latest = [...res.data]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 3);

      setThreads(latest);
    } catch (err) {
      console.error("Failed loading threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  };

  useEffect(() => {
    getBlogs();
    getThreads();
  }, []);

  return (
    <>
      <Box
        style={{
          backgroundColor: "transparent",
          width: "100%",
          paddingBottom: 60,
        }}
      >
        <Box
          style={{
            width: "100%",
            height: "420px",
            backgroundImage:
              "url('https://images.unsplash.com/photo-1760389580457-854e59ed02f8')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          <Container
            size="lg"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              paddingLeft: "40px",
            }}
          >
            <Title
              order={1}
              style={{
                color: "white",
                fontSize: "40px",
                maxWidth: "1000px",
                lineHeight: "1.2",
                marginBottom: "10px",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
              }}
            >
              A platform where Scholars connect, learn, and share knowledge.
            </Title>

            <Text
              style={{
                color: "white",
                opacity: 0.9,
                maxWidth: "500px",
                marginBottom: "20px",
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.6)",
              }}
            >
              Join our community to explore ideas, ask questions, and
              collaborate.
            </Text>

            <Button
              style={{
                width: "150px",
                backgroundColor: "#28a745",
                color: "white",
                fontWeight: 600,
                borderRadius: "6px",
              }}
              onClick={() => navigate("/blog")}
            >
              Explore Now
            </Button>
          </Container>
        </Box>

        <Container size="lg" style={{ marginTop: "50px" }}>
          <Title order={3} style={{ marginBottom: "20px" }}>
            Featured Blogs
          </Title>

          {loadingBlogs ? (
            <Loader size="lg" />
          ) : (
            <Grid>
              {blogs.map((blog) => (
                <Grid.Col span={{ base: 12, sm: 6, md: 4 }} key={blog.id}>
                  <Card
                    shadow="sm"
                    radius="md"
                    style={{ height: "100%", cursor: "pointer" }}
                    onClick={() => navigate(`/blog-detail/${blog.id}`)}
                  >
                    <Card.Section>
                      <Image
                        src={
                          blog.blogImageUrl ||
                          "https://via.placeholder.com/300x160"
                        }
                        height={160}
                        fit="cover"
                      />
                    </Card.Section>

                    <Stack mt="md">
                      <Text fw={600}>{blog.blogTitle}</Text>
                      <Text size="sm" c="dimmed">
                        {new Date(blog.createdDate).toLocaleDateString()}
                      </Text>
                    </Stack>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          )}
        </Container>

        <Container size="lg" style={{ marginTop: "50px" }}>
          <Title order={3} style={{ marginBottom: "20px" }}>
            Latest Forum Threads
          </Title>

          {loadingThreads ? (
            <Loader size="lg" />
          ) : (
            <Stack>
              {threads.map((thread) => (
                <Card
                  key={thread.id}
                  shadow="sm"
                  style={{
                    padding: "18px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/thread-detail/${thread.id}`)}
                >
                  <Stack gap={4} style={{ maxWidth: "80%" }}>
                    <Text fw={600}>
                      {thread.post.length > 60
                        ? thread.post.substring(0, 60) + "..."
                        : thread.post}
                    </Text>

                    <Text size="sm" c="dimmed">
                      Posted on{" "}
                      {new Date(thread.createdAt).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Stack>
          )}
        </Container>
      </Box>
    </>
  );
};
