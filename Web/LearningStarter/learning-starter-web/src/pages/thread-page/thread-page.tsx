import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Group,
  Button,
  Text,
  Textarea,
  Modal,
  Divider,
  TextInput,
  ScrollArea,
  Box,
} from "@mantine/core";
import { IconSearch, IconPlus } from "@tabler/icons-react";
import api from "../../config/axios";
import {
  ApiResponse,
  UserDto,
  ForumThreadGetDto,
  UniversitiesGetDto,
  CommentGetDto,
} from "../../constants/types";
import { useAuth } from "../../authentication/use-auth";
import { useNavigate } from "react-router-dom";

type ThreadWithUser = ForumThreadGetDto & {
  userName: string;
  universityName: string;
  commentCount: number;
};

const THREAD_COLUMNS = "47% 16% 22% 15%";
const ROW_HEIGHT = 72;
const PAD_X = 20;

export const ThreadPage = () => {
  const [threads, setThreads] = useState<ThreadWithUser[]>([]);
  const [opened, setOpened] = useState(false);
  const [content, setContent] = useState("");
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [userUniversityName, setUserUniversityName] = useState<string>("");
  const [sortBy, setSortBy] = useState<"recent" | "discussed">("recent");

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchUserUniversity = async () => {
    if (user?.universityId) {
      const uniResponse = await api.get<UniversitiesGetDto>(
        `/api/Universities/${user.universityId}`
      );
      setUserUniversityName(uniResponse.data.name);
    }
  };

  const fetchThreads = async () => {
    const response = await api.get<ForumThreadGetDto[]>("/api/ForumThreads");

    const commentsRes = await api.get<CommentGetDto[]>(`/api/Comments`);
    const commentCounts: Record<number, number> = {};
    commentsRes.data.forEach((c) => {
      if (!commentCounts[c.forumThreadId]) commentCounts[c.forumThreadId] = 0;
      commentCounts[c.forumThreadId]++;
    });

    const threadsWithUserData = await Promise.all(
      response.data.map(async (thread) => {
        const userResponse = await api.get<ApiResponse<UserDto>>(
          `/api/users/${thread.userId}`
        );
        const threadUser = userResponse.data.data;

        const uniResponse = await api.get<UniversitiesGetDto>(
          `/api/Universities/${threadUser.universityId}`
        );

        return {
          ...thread,
          userName: threadUser.userName,
          universityName: uniResponse.data.name,
          commentCount: commentCounts[thread.id] || 0,
        };
      })
    );

    setThreads(threadsWithUserData);
  };

  const getSortedThreads = () => {
    const list = [...threads];
    if (sortBy === "recent") {
      return list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === "discussed") {
      return list.sort((a, b) => b.commentCount - a.commentCount);
    }
    return list;
  };

  const handleCreateThread = async () => {
    if (!content.trim() || !user) return;

    await api.post("/api/ForumThreads", {
      post: content,
      userId: user.id,
    });

    setOpened(false);
    setContent("");
    fetchThreads();
  };

  const goToThreadDetails = (id: number) => navigate(`/thread-detail/${id}`);

  useEffect(() => {
    fetchUserUniversity();
    fetchThreads();
  }, [user]);

  const [searchQuery, setSearchQuery] = useState("");

  const sortedThreads = getSortedThreads();

  const filteredThreads = sortedThreads.filter((thread) => {
    const query = searchQuery.toLowerCase().trim();
    return (
      thread.post.toLowerCase().includes(query) ||
      thread.userName.toLowerCase().includes(query) ||
      thread.universityName.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Text size="xl" fw={700} style={{ letterSpacing: "0.5px" }}>
            Create a New Thread
          </Text>
        }
        centered
        size="lg"
        radius="lg"
        overlayProps={{ opacity: 0.3, blur: 3 }}
      >
        <Paper p="md" radius="md">
          <Textarea
            placeholder="Share your question or idea here..."
            autosize
            minRows={6}
            radius="md"
            size="md"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            mb="md"
          />

          <Divider my="lg" color="#22c55e" />

          {user && (
            <Group justify="space-between" mb="md">
              <Paper p="xs" radius="md">
                <Text fw={600}>Author</Text>
                <Text>{user.firstName + " " + user.lastName}</Text>
              </Paper>
              <Paper p="xs" radius="md">
                <Text fw={600}>University</Text>
                <Text>{userUniversityName}</Text>
              </Paper>
            </Group>
          )}

          <Group justify="flex-end" mt="md">
            <Button color="green" radius="md" onClick={handleCreateThread}>
              Post Thread
            </Button>
          </Group>
        </Paper>
      </Modal>

      <Container size="xl" mt="md" mb="xl">
        <TextInput
          placeholder="Search threads..."
          radius="md"
          size="md"
          leftSection={<IconSearch size={18} />}
          w="100%"
          mb="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Group justify="flex-end" align="center" mb="lg" gap="md">
          <Button
            variant={sortBy === "recent" ? "filled" : "outline"}
            color="green"
            size="sm"
            radius="xl"
            onClick={() => setSortBy("recent")}
          >
            Most Recent
          </Button>

          <Button
            variant={sortBy === "discussed" ? "filled" : "outline"}
            color="green"
            size="sm"
            radius="xl"
            onClick={() => setSortBy("discussed")}
          >
            Most Discussed
          </Button>

          <Button
            leftSection={<IconPlus size={18} />}
            color="green"
            radius="xl"
            size="md"
            onClick={() => setOpened(true)}
          >
            Create New Thread
          </Button>
        </Group>

        <Paper
          shadow="xs"
          p="xl"
          radius="lg"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {/* Table Header */}
          <Box mb="xs" px={PAD_X}>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: THREAD_COLUMNS,
                alignItems: "center",
                columnGap: 8,
                width: "100%",
              }}
            >
              {["Threads", "Author", "University", "Date"].map((label, i) => (
                <Box
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "4px 0",
                    transform:
                      i === 0 ? "translateX(-4px)" : "translateX(-6px)",
                  }}
                >
                  <Box
                    style={{
                      padding: "3px 10px",
                      textAlign: "center",
                      minWidth: "fit-content",
                    }}
                  >
                    <Text
                      fw={400}
                      size="sm"
                      style={{
                        color: "#22c55e",
                        textTransform: "capitalize",
                        letterSpacing: "0.8px",
                      }}
                    >
                      {label}
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box
            style={{
              height: "65vh",
              overflow: "hidden",
            }}
          >
            <ScrollArea h="100%" scrollbarSize={8} offsetScrollbars type="auto">
              <Box px={0} py={4}>
                {filteredThreads.map((thread) => {
                  const isHover = hoveredRowId === thread.id;

                  return (
                    <Paper
                      key={thread.id}
                      radius={18}
                      withBorder={false}
                      p={0}
                      mb="sm"
                      style={{
                        position: "relative",
                        height: ROW_HEIGHT,
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                      onMouseEnter={() => setHoveredRowId(thread.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      onClick={() => goToThreadDetails(thread.id)}
                    >
                      <Paper
                        p={0}
                        radius={18}
                        style={{
                          position: "absolute",
                          inset: 2,
                          backgroundColor: isHover
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(255,255,255,0.03)",
                          border: isHover
                            ? "2px solid rgba(34,197,94,0.55)"
                            : "2px solid transparent",
                          boxShadow: isHover
                            ? "0 4px 12px rgba(34,197,94,0.10), 0 2px 8px rgba(0,0,0,0.25)"
                            : "0 1px 4px rgba(0,0,0,0.18)",
                          transition:
                            "opacity .18s ease, transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                          transform: isHover ? "scale(1.004)" : "scale(1)",
                          pointerEvents: "none",
                          zIndex: 0,
                        }}
                      />

                      <Box
                        px={PAD_X}
                        style={{
                          position: "relative",
                          zIndex: 1,
                          height: "100%",
                          display: "grid",
                          gridTemplateColumns: THREAD_COLUMNS,
                          alignItems: "center",
                          columnGap: 8,
                        }}
                      >
                        <Box
                          style={{
                            position: "absolute",
                            inset: 0,
                            pointerEvents: "none",
                            backgroundImage:
                              "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 100%)," +
                              "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 100%)," +
                              "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 100%)",
                            backgroundRepeat: "no-repeat",
                            backgroundSize: "1px 100%, 1px 100%, 1px 100%",
                            backgroundPosition: "47% 0, 63% 0, 85% 0",
                          }}
                        />

                        <Box pr={16} style={{ overflow: "hidden" }}>
                          <Text
                            size="sm"
                            style={{
                              lineHeight: 1.2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={thread.post}
                          >
                            {thread.post}
                          </Text>
                        </Box>

                        <Box px={16}>
                          <Text size="sm" style={{ lineHeight: 1.2 }}>
                            {thread.userName}
                          </Text>
                        </Box>

                        <Box px={16}>
                          <Text size="sm" style={{ lineHeight: 1.2 }}>
                            {thread.universityName}
                          </Text>
                        </Box>

                        <Group justify="center">
                          <Text size="sm" style={{ lineHeight: 1.2 }}>
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            </ScrollArea>
          </Box>
        </Paper>
      </Container>
    </>
  );
};
