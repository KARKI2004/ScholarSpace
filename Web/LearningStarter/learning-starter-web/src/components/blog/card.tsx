import { Card, Image, Text, Title } from "@mantine/core";

interface BlogCardProps {
  title: string;
  author: string;
  date: string;
  image: string;
  description: string;
}

export const BlogCard: React.FC<BlogCardProps> = ({ title, author, date, image, description }) => (
  <Card shadow="sm" radius="md" withBorder style={{ cursor: "pointer" }}>
    <Card.Section>
      <Image src={image} height={180} alt={title} />
    </Card.Section>

    <Title order={4} mt="sm">{title}</Title>
    <Text size="sm" c="dimmed" mt="xs">{description}</Text>
    <Text size="sm" mt="md" fw={500}>{author}</Text>
    <Text size="xs" c="dimmed">{date}</Text>
  </Card>
);
