import {
  Container,
  Group,
  Text,
  Button,
  TextInput,
  Card,
  SimpleGrid,
  Box,
  Pagination,
  Image,
  Center,
  Loader,
} from "@mantine/core";
import { IconPlus, IconHeart } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { BlogGetDto, CategoriesGetDto } from "../../constants/types";
import { showNotification } from "@mantine/notifications";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";

export const BlogPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [blogs, setBlogs] = useState<BlogGetDto[]>([]);
  const [categories, setCategories] = useState<CategoriesGetDto[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogGetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<"recent" | "liked">("recent");

  const navigate = useNavigate();
  const blogsPerPage = 6;

  
  const getCategories = async () => {
    try {
      const res = await api.get<CategoriesGetDto[]>(`/api/Categories`);
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  
  const getBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.get<BlogGetDto[]>(`/api/Blog`);
      setBlogs(res.data || []);
    } catch (err) {
      console.error(err);
      showNotification({ message: "Failed to fetch blogs", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
    getBlogs();
  }, []);

  
  const getCategoryName = (id: number) => {
    const cat = categories.find((c) => c.id === id);
    return cat ? cat.name : "";
  };

  
  useEffect(() => {
    let filtered = [...blogs];

    
    if (category !== "All") {
      filtered = filtered.filter(
        (b) => getCategoryName(b.categoryId) === category
      );
    }

    
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (b) =>
          b.blogTitle.toLowerCase().includes(search.toLowerCase()) ||
          b.body.toLowerCase().includes(search.toLowerCase())
      );
    }

    
    if (sortBy === "recent") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    } else if (sortBy === "liked") {
      filtered.sort((a, b) => (b.likesCount ?? 0) - (a.likesCount ?? 0));
    }

    
    const startIndex = (page - 1) * blogsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + blogsPerPage);

    setFilteredBlogs(paginated);
    setTotalPages(Math.ceil(filtered.length / blogsPerPage));
  }, [blogs, categories, category, search, sortBy, page]);

  const createBlog = () => navigate("/create-blog");
  const goToBlogDetails = (id: number) => navigate(`/blog-detail/${id}`);

  if (loading) {
    return (
      <Center style={{ height: "60vh" }}>
        <Loader size="lg" color="green" />
      </Center>
    );
  }

  return (
    <Container size="xl" mt="md" mb="xl">
      
      <Box mb="md">
        <TextInput
          placeholder="Search blogs..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="md"
          size="md"
          w="100%"
        />
      </Box>

      <Group justify="space-between" mb="xl" align="center">
        <Group gap="xs">
          {["All", ...categories.map((c) => c.name)].map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "filled" : "outline"}
              color="green"
              radius="xl"
              size="xs"
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
            >
              {cat}
            </Button>
          ))}
        </Group>

        <Button
          leftSection={<IconPlus size={18} />}
          onClick={createBlog}
          color="green"
          radius="xl"
          size="md"
        >
          Create New Blog
        </Button>
      </Group>

      <Group justify="space-between" mb="lg">
        <Text fw={700} size="lg">
          Blogs
        </Text>

        <Group>
          <Button
            variant={sortBy === "recent" ? "filled" : "outline"}
            color="green"
            size="sm"
            onClick={() => setSortBy("recent")}
          >
            Most Recent
          </Button>
          <Button
            variant={sortBy === "liked" ? "filled" : "outline"}
            color="green"
            size="sm"
            onClick={() => setSortBy("liked")}
          >
            Most Liked
          </Button>
        </Group>
      </Group>

      
      {filteredBlogs.length === 0 ? (
        <Center>
          <Text>No blogs available.</Text>
        </Center>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mb="xl">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={
                    blog.blogImageUrl
                      ? `https://localhost:5001${blog.blogImageUrl}`
                      : "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                  }
                  height={160}
                  alt={blog.blogTitle}
                  onClick={() => goToBlogDetails(blog.id)}
                  style={{ cursor: "pointer" }}
                />
              </Card.Section>

              <Group mt={8} mb={4} align="center">
                <Text fw={500} lineClamp={1} style={{ maxWidth: "70%" }}>
                  {blog.blogTitle}
                </Text>

                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px",

                    borderRadius: 12,
                    width: "fit-content",
                  }}
                >
                  <IconHeart size={18} color="red" />
                  <Text size="sm" fw={500}>
                    {blog.likesCount ?? 0}
                  </Text>
                </Box>
              </Group>

              <Text size="sm" c="dimmed" lineClamp={3}>
                {blog.body}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            color="green"
            size="md"
            radius="xl"
          />
        </Center>
      )}
    </Container>
  );
};
