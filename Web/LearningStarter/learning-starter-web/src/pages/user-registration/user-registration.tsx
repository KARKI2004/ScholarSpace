import { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Box,
  Select,
  Grid,
  Paper,
  Title,
  Text,
} from "@mantine/core";
import { useAsyncFn } from "react-use";
import { showNotification } from "@mantine/notifications";
import {
  IconUser,
  IconAt,
  IconBuildingBank,
  IconLock,
} from "@tabler/icons-react";
import {
  AnyObject,
  ApiResponse,
  UniversitiesGetDto,
  UserCreateDto,
} from "../../constants/types";
import api from "../../config/axios";
import { useNavigate } from "react-router-dom";
import { createStyles } from "@mantine/emotion";
import space from "../../assets/bg-image/space.jpg";

export const UserRegistration = () => {
  const { classes } = useStyles();

  const [universityList, setUniversityList] = useState<
    { value: string; label: string }[]
  >([]);

  const navigate = useNavigate();

  const [, fetchUniversities] = useAsyncFn(async () => {
    const response = await api.get<UniversitiesGetDto[]>("/api/Universities");
    const mapped = response.data.map((uni: any) => ({
      value: String(uni.id),
      label: uni.name,
    }));

    setUniversityList(mapped);
  }, []);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  const form = useForm<UserCreateDto>({
    initialValues: {
      firstName: "",
      lastName: "",
      userName: "",
      email: "",
      password: "",
      universityId: 0,
      status: "",
    },
    validate: {
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
    },
  });

  const [, submitRegistration] = useAsyncFn(async (values: UserCreateDto) => {
    const payload = {
      ...values,
      universityId: Number(values.universityId),
    };

    const response = await api.post<ApiResponse<any>>("/api/users", payload);
    if (response.data.hasErrors) {
      const mappedErrors = response.data.errors.reduce<AnyObject>(
        (prev, curr) => {
          prev[curr.property] = curr.message;
          return prev;
        },
        {}
      );

      form.setErrors(mappedErrors);
      return;
    }

    showNotification({
      message: "Account created successfully!",
      color: "green",
    });
    form.reset();
    navigate("/login");
  }, []);

  return (
    <>
      <div className={classes.background}></div>
      <Box className={classes.wrapper}>
        <Paper
          radius="lg"
          p="xl"
          shadow="lg"
          style={{ width: "100%", maxWidth: 520 }}
        >
          <Title order={2} ta="center" mb="xs">
            Join ScholarSpace
          </Title>
          <Text ta="center" mb="xl" c="dimmed">
            Create your account and start collaborating.
          </Text>

          <form onSubmit={form.onSubmit(submitRegistration)}>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="First Name"
                  placeholder="John"
                  required
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("firstName")}
                />
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6 }}>
                <TextInput
                  label="Last Name"
                  placeholder="Doe"
                  required
                  leftSection={<IconUser size={16} />}
                  {...form.getInputProps("lastName")}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              mt="md"
              label="Username"
              placeholder="Choose username"
              required
              leftSection={<IconUser size={16} />}
              {...form.getInputProps("userName")}
            />

            <TextInput
              mt="md"
              label="Email"
              placeholder="email@example.com"
              type="email"
              required
              leftSection={<IconAt size={16} />}
              {...form.getInputProps("email")}
            />

            <TextInput
              mt="md"
              label="Password"
              placeholder="••••••••"
              type="password"
              required
              leftSection={<IconLock size={16} />}
              {...form.getInputProps("password")}
            />

            <Select
              mt="md"
              label="University"
              placeholder="Select your university"
              searchable
              required
              data={universityList}
              leftSection={<IconBuildingBank size={18} />}
              {...form.getInputProps("universityId")}
            />

            <Select
              mt="md"
              label="Status"
              placeholder="Select academic status"
              required
              data={[
                { value: "Freshman", label: "Freshman" },
                { value: "Sophomore", label: "Sophomore" },
                { value: "Junior", label: "Junior" },
                { value: "Senior", label: "Senior" },
              ]}
              {...form.getInputProps("status")}
            />

            <Button fullWidth mt="lg" size="md" type="submit" color="green">
              Sign Up
            </Button>
          </form>

          <Text ta="center" mt="sm" size="sm">
            Already have an account?{" "}
            <a href="/login" style={{ color: "green", fontWeight: 600 }}>
              Log in
            </a>
          </Text>
        </Paper>
      </Box>
    </>
  );
};

const useStyles = createStyles(() => ({
  background: {
    width: "100vw",
    height: "100vh",
    backgroundImage: `url(${space})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: -1,

    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backdropFilter: "blur(4px)",
      background: "rgba(0,0,0,0.35)",
      zIndex: -1,
    },
  },

  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    position: "relative",
    zIndex: 2,
  },
}));
