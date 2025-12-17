import { SegmentedControl, Group } from "@mantine/core";
import { useState } from "react";

export const BlogSortTabs = () => {
  const [sort, setSort] = useState("recent");

  return (
    <Group justify="end" mb="md" mt="md">
      <SegmentedControl
        value={sort}
        onChange={setSort}
        data={[
          { label: "Most Recent", value: "recent" },
          { label: "Most Liked", value: "liked" },
          { label: "Top Authors", value: "authors" },
        ]}
        radius="xl"
        color="green"
      />
    </Group>
  );
};
