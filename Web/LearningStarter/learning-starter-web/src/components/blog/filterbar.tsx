import { TextInput, Group, Chip } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

const categories = ["Academics", "Creativity", "Careers", "Wellness", "Opinions", "Student Life", "Tech", "All"];

export const BlogFilterBar = () => {
  const [selected, setSelected] = useState("All");

  return (
    <>
      <TextInput
        leftSection={<IconSearch size={16} />}
        placeholder="Search blogs"
        radius="md"
        mb="md"
      />
      <Group gap="sm">
        {categories.map((category) => (
          <Chip
            key={category}
            checked={selected === category}
            onChange={() => setSelected(category)}
            radius="xl"
            color="green"
          >
            {category}
          </Chip>
        ))}
      </Group>
    </>
  );
};
