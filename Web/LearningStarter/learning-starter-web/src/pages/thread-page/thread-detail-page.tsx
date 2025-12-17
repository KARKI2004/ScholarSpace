import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Text,
  Textarea,
  Grid,
} from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../config/axios";
import {
  ApiResponse,
  UserDto,
  UniversitiesGetDto,
  ForumThreadGetDto,
  CommentGetDto,
  CommentWithUser,
} from "../../constants/types";

export const ThreadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const threadId = Number(id);

  const [thread, setThread] = useState<ForumThreadGetDto | null>(null);
  const [moreThreads, setMoreThreads] = useState<ForumThreadGetDto[]>([]);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  const [newComment, setNewComment] = useState("");
  const [loadingNewComment, setLoadingNewComment] = useState(false);

  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [loadingReply, setLoadingReply] = useState(false);

  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [error, setError] = useState("");

  const buildCommentTree = (list: CommentWithUser[]): CommentWithUser[] => {
    const map = new Map<number, CommentWithUser>();
    list.forEach((c) => map.set(c.id, { ...c, replies: [] }));

    const roots: CommentWithUser[] = [];

    list.forEach((c) => {
      const current = map.get(c.id)!;
      if (c.parentCommentId) {
        const parent = map.get(c.parentCommentId);
        if (parent) parent.replies.push(current);
        else roots.push(current);
      } else {
        roots.push(current);
      }
    });

    return roots;
  };

  const fetchThread = async () => {
    if (!threadId) return;

    try {
      const threadRes = await api.get<ForumThreadGetDto>(
        `/api/ForumThreads/${threadId}`
      );
      const rawThread = threadRes.data;

      const userRes = await api.get<ApiResponse<UserDto>>(
        `/api/Users/${rawThread.userId}`
      );
      const user = userRes.data.data;

      const uniRes = await api.get<UniversitiesGetDto>(
        `/api/Universities/${user.universityId}`
      );
      const university = uniRes.data;

      setThread({
        ...rawThread,
        userName: user.userName,
        universityName: university.name,
      });

      fetchMoreThreadsFromUser(rawThread.userId);
    } catch (err) {
      console.error("Error fetching thread:", err);
      setError("Failed to fetch thread details.");
    }
  };

  const fetchMoreThreadsFromUser = async (userId: number) => {
    try {
      const res = await api.get<ForumThreadGetDto[]>("/api/ForumThreads");
      const filtered = res.data.filter(
        (t) => t.userId === userId && t.id !== threadId
      );
      setMoreThreads(filtered);
    } catch (err) {
      console.error("Failed to fetch more threads:", err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get<CommentGetDto[]>("/api/Comments");
      const threadComments = res.data.filter(
        (c) => c.forumThreadId === threadId
      );

      const enriched: CommentWithUser[] = await Promise.all(
        threadComments.map(async (comment) => {
          const userRes = await api.get<ApiResponse<UserDto>>(
            `/api/Users/${comment.userId}`
          );
          const user = userRes.data.data;

          const uniRes = await api.get<UniversitiesGetDto>(
            `/api/Universities/${user.universityId}`
          );
          const university = uniRes.data;

          return {
            ...comment,
            userName: user.userName,
            universityName: university.name,
            replies: [],
          };
        })
      );

      setComments(buildCommentTree(enriched));
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get<ApiResponse<UserDto>>("/api/get-current-user");
      setCurrentUser(res.data.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  const handleSubmitNewComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    setLoadingNewComment(true);
    try {
      await api.post("/api/Comments", {
        body: newComment,
        userId: currentUser.id,
        forumThreadId: threadId,
        parentCommentId: null,
      });

      setNewComment("");
      await fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setLoadingNewComment(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: number) => {
    if (!currentUser) return;

    const text = replyTextareaRef.current?.value?.trim() ?? "";
    if (!text) return;

    setLoadingReply(true);
    try {
      await api.post("/api/Comments", {
        body: text,
        userId: currentUser.id,
        forumThreadId: threadId,
        parentCommentId,
      });

      if (replyTextareaRef.current) {
        replyTextareaRef.current.value = "";
      }
      setReplyingToId(null);
      await fetchComments();
    } catch (err) {
      console.error("Error posting reply:", err);
    } finally {
      setLoadingReply(false);
    }
  };

  const RenderComment = ({
    comment,
    depth,
  }: {
    comment: CommentWithUser;
    depth: number;
  }) => {
    const isReplyingHere = replyingToId === comment.id;

    return (
      <Box
        ml={depth * 20}
        pl={depth > 0 ? "md" : 0}
        style={{
          borderLeft: depth > 0 ? "1px solid #22c55e" : "none",
        }}
      >
        <Box p="md">
          <Group align="flex-start">
            <Avatar radius="xl">
              {comment.userName?.charAt(0).toUpperCase()}
            </Avatar>

            <Stack gap={4} style={{ flex: 1 }}>
              <Group justify="space-between">
                <Text fw={600}>{comment.userName}</Text>
                <Text size="xs" c="dimmed">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </Group>

              <Text size="sm">{comment.body}</Text>

              {comment.universityName && (
                <Text size="xs" c="dimmed">
                  {comment.universityName}
                </Text>
              )}

              {!isReplyingHere && (
                <Button
                  variant="subtle"
                  size="compact-xs"
                  onClick={() => {
                    setReplyingToId(comment.id);
                    if (replyTextareaRef.current) {
                      replyTextareaRef.current.value = "";
                    }
                  }}
                  style={{
                    width: "fit-content",
                    marginTop: 6,
                    paddingInline: 8,
                  }}
                >
                  Reply
                </Button>
              )}

              {isReplyingHere && (
                <Box mt="xs">
                  <Textarea
                    placeholder="Write your reply..."
                    minRows={2}
                    autoFocus
                    ref={replyTextareaRef}
                  />
                  <Group justify="flex-start" mt="xs">
                    <Button
                      size="compact-xs"
                      variant="filled"
                      color="gray"
                      onClick={() => {
                        setReplyingToId(null);
                        if (replyTextareaRef.current) {
                          replyTextareaRef.current.value = "";
                        }
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      size="compact-xs"
                      color="green"
                      variant="filled"
                      loading={loadingReply}
                      onClick={() => handleSubmitReply(comment.id)}
                    >
                      Post Reply
                    </Button>
                  </Group>
                </Box>
              )}
            </Stack>
          </Group>
        </Box>

        {comment.replies.map((reply) => (
          <RenderComment key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </Box>
    );
  };

  useEffect(() => {
    if (!threadId) return;
    fetchThread();
    fetchComments();
    fetchCurrentUser();
  }, [threadId]);

  return (
    <Grid p="xl" gutter="xl">
      <Grid.Col span={{ base: 12, md: 8 }}>
        <Stack>
          {error && <Text c="red">{error}</Text>}

          {thread ? (
            <Paper p="xl" radius="lg" withBorder>
              <Text size="sm" c="dimmed" mb={6}>
                {thread.userName} |{" "}
                {new Date(thread.createdAt).toLocaleDateString()}
              </Text>
              <Text size="sm" c="dimmed">
                {thread.universityName}
              </Text>
              <Text fw={700} size="xl" mb={3}>
                {thread.post}
              </Text>
            </Paper>
          ) : (
            <Text>Loading thread...</Text>
          )}

          <Divider my="md" color="#22c55e" />

          <Text fw={600} size="lg">
            Comments
          </Text>

          <Textarea
            placeholder="Post a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            minRows={2}
            autosize
            maxRows={4}
          />

          <Group justify="flex-end" mt="1">
            <Button
              color="green"
              loading={loadingNewComment}
              onClick={handleSubmitNewComment}
            >
              Post Comment
            </Button>
          </Group>

          <Paper
            p="lg"
            radius="md"
            withBorder
            style={{
              maxHeight: "500px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(255,255,255,0.15) transparent",
            }}
          >
            <style>
              {`
      ::-webkit-scrollbar {
        width: 6px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.35);
      }
    `}
            </style>

            <Stack>
              {[...comments].reverse().map((comment) => (
                <RenderComment key={comment.id} comment={comment} depth={0} />
              ))}

              {comments.length === 0 && (
                <Text size="sm" c="dimmed">
                  Be the first to comment.
                </Text>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Grid.Col>

      <Grid.Col span={{ base: 12, md: 4 }}>
        <Paper p="lg" radius="lg" withBorder>
          <Text fw={700} size="lg" mb="sm">
            More threads from {thread?.userName}
          </Text>

          {moreThreads.length === 0 && (
            <Text size="sm" c="dimmed">
              No more threads by this user.
            </Text>
          )}

          <Stack>
            {moreThreads.map((t, index) => (
              <Box key={t.id}>
                <Box
                  onClick={() => navigate(`/thread-detail/${t.id}`)}
                  style={{
                    cursor: "pointer",
                    padding: "10px",
                    borderRadius: "8px",
                    transition: "all 0.05s ease",
                  }}
                  className="author-thread-item"
                >
                  <Text fw={600}>
                    {t.post.length > 80 ? `${t.post.slice(0, 80)}...` : t.post}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </Text>
                </Box>

                {index < moreThreads.length - 1 && (
                  <Divider color="#22c55e" my="sm" />
                )}
              </Box>
            ))}
          </Stack>

          <style>
            {`
    .author-thread-item:hover {
      transform: scale(1.02);
      border: 1px solid #22c55e;
      border-radius: 10px;
      background-color: rgba(34, 197, 94, 0.05);
    }
  `}
          </style>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};
