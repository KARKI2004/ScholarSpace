import {
  AppShell, Container, TextInput, Text, Button, Group, Paper, Select, Textarea, Stack, SimpleGrid, FileInput,
} from "@mantine/core";

import { useAsyncFn } from "react-use";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  BlogCreateDto,
  CategoriesGetDto,
  UniversitiesGetDto,
  BlogGetDto,
} from "../../constants/types";
import api from "../../config/axios";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../authentication/use-auth";

export const CreateBlog = () => {
  const { id } = useParams();
  const editing = Boolean(id);

  const [categoryList, setCategoryList] = useState<
    { value: string; label: string }[]
  >([]);
  const [universityName, setUniversityName] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const form = useForm<BlogCreateDto>({
    initialValues: {
      userId: user?.id!,
      blogTitle: "",
      categoryId: 0,
      body: "",
    },
  });

  const loadExistingBlog = async () => {
    if (!editing) return;

    try {
      const res = await api.get<BlogGetDto>(`/api/Blog/${id}`);
      const blog = res.data;

      form.setValues({
        userId: blog.userId,
        blogTitle: blog.blogTitle,
        categoryId: blog.categoryId,
        body: blog.body,
      });

      if (blog.blogImageUrl!) setPreview(blog.blogImageUrl!);
    } catch (err) {
      showNotification({
        message: "Failed to load blog for editing",
        color: "red",
        position: "top-right",
      });
    }
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  // Fetch categories
  const [, fetchCategories] = useAsyncFn(async () => {
    const response = await api.get<CategoriesGetDto[]>("/api/Categories");
    const mapped = response.data.map((category) => ({
      value: String(category.id),
      label: category.name,
    }));
    setCategoryList(mapped);
  }, []);

  const [, fetchUniversityName] = useAsyncFn(async (id: number) => {
    const response = await api.get<UniversitiesGetDto>(
      `/api/Universities/${id}`
    );
    setUniversityName(response.data.name);
  }, []);

  const [, postBlog] = useAsyncFn(
    async (values: BlogCreateDto) => {
      try {
        const payload = {
          ...values,
          categoryId: Number(values.categoryId),
        };

        const response = await api.post<BlogGetDto>("/api/Blog", payload);
        const newId = response.data.id;

        if (file && newId) {
          const formData = new FormData();
          formData.append("file", file);

          await api.post(`/api/Blog/${newId}/upload-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        showNotification({
          message: "Blog created successfully!",
          color: "green",
          position: "top-right",
        });

        navigate("/blog");
      } catch (error: any) {
        showNotification({
          message: error.response?.data?.message || "Failed to create blog",
          color: "red",
          position: "top-right",
        });
      }
    },
    [file]
  );


  const [, updateBlog] = useAsyncFn(
    async (values: BlogCreateDto) => {
      if (!editing) return;

      try {
        const payload = {
          ...values,
          categoryId: Number(values.categoryId),
        };

        await api.put(`/api/Blog/${id}`, payload);


        if (file) {
          const formData = new FormData();
          formData.append("file", file);

          await api.post(`/api/Blog/${id}/upload-image`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        showNotification({
          message: "Blog updated successfully!",
          color: "green",
          position: "top-right",
        });

        navigate("/blog");
      } catch (err) {
        showNotification({
          message: "Failed to update blog",
          color: "red",
          position: "top-right",
        });
      }
    },
    [file]
  );


  useEffect(() => {
    fetchCategories();
    fetchUniversityName(user?.universityId!);
    loadExistingBlog();
  }, []);

  return (
    <AppShell padding="md">
      <Container size="xl">
        <Group justify="space-between" mb="md">
          <Text fw={700} size="xl">
            {editing ? "Edit Blog" : "Create a New Blog"}
          </Text>

          <Button
            size="md"
            color={editing ? "lime" : "green"}
            radius="md"
            onClick={() =>
              form.onSubmit(editing ? updateBlog : postBlog)()
            }
          >
            {editing ? "Update Blog" : "Post Blog"}
          </Button>
        </Group>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
          <Stack gap="md">
            <Paper withBorder p="lg" radius="md">
              <Text fw={600} mb="xs">
                Blog Title
              </Text>
              <TextInput
                placeholder="Enter a title"
                size="md"
                {...form.getInputProps("blogTitle")}
              />
            </Paper>

            <Paper withBorder p="lg" radius="md">
              <Text fw={600} mb="xs">
                Featured Image
              </Text>

              <FileInput
                placeholder="Click to upload or drag and drop"
                accept="image/png,image/jpeg,image/webp"
                radius="md"
                size="md"
                onChange={handleFileChange}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ marginTop: 10, maxWidth: "100%" }}
                />
              )}
            </Paper>

            <Paper withBorder p="lg" radius="md">
              <Text fw={600} mb="xs">
                Blog Content
              </Text>

              <Textarea
                placeholder="Start writing your blog content..."
                autosize
                minRows={12}
                {...form.getInputProps("body")}
              />
            </Paper>
          </Stack>

          <Stack gap="md">
            <Paper withBorder p="lg" radius="md">
              <Text fw={600} mb="sm">
                Blog Details
              </Text>

              <Select
                label="Category"
                placeholder="Select a category"
                data={categoryList}
                {...form.getInputProps("categoryId")}
              />
            </Paper>

            <Paper withBorder p="lg" radius="md">
              <Text fw={600} mb="sm">
                Author Information
              </Text>

              <TextInput
                label="Author Name"
                value={`${user?.firstName} ${user?.lastName}`}
                readOnly
              />

              <TextInput
                label="University Name"
                value={universityName}
                mt="md"
                readOnly
              />
            </Paper>
          </Stack>
        </SimpleGrid>
      </Container>
    </AppShell>
  );
};
