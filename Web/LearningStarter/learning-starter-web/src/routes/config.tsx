import { Route, Routes as Switch, Navigate } from "react-router-dom";
import { LandingPage } from "../pages/landing-page/landing-page";
import { NotFoundPage } from "../pages/not-found";
import { useAuth } from "../authentication/use-auth";
import { UserPage } from "../pages/user-page/user-page";
import { PageWrapper } from "../components/page-wrapper/page-wrapper";
import { AdminPage } from "../pages/admin-page/admin-page";
import { ThreadPage } from "../pages/thread-page/thread-page";
import { BlogPage } from "../pages/blog-page/blog-page";
import { UserRegistration } from "../pages/user-registration/user-registration";
import { UserProfile } from "../pages/profile-page/profilePage";
import { routes } from ".";
import { CreateBlog } from "../pages/blog-page/create-blog-page";
import { ThreadDetailPage } from "../pages/thread-page/thread-detail-page";
import { BlogDetails } from "../pages/blog-page/blog-detail-page";
import { ProtectedUser } from "../components/page-wrapper/protected-user";
import { ProtectedAdmin } from "../components/page-wrapper/protected-admin";
import { LoginPage } from "../pages/login-page/login-page";
import { BlogManagement } from "../components/admin-components/blog-management";
import { UserManagement } from "../components/admin-components/user-management";
import { ThreadsManagement } from "../components/admin-components/threads-management";
import { AdminLayout } from "../layouts/AdminLayout";

export const Routes = () => {
  const { refetchUser } = useAuth();

  return (
    <PageWrapper>
      <Switch>
        <Route
          path={routes.adminPage}
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<AdminPage />} /> {/* /admin */}
          <Route path="blog-management" element={<BlogManagement />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="threads-management" element={<ThreadsManagement />} />
        </Route>
        <Route path={routes.home} element={<LandingPage />} />
        <Route path={routes.user} element={<UserPage />} />
        <Route path={routes.blog} element={<BlogPage />} />
        <Route
          path={routes.createBlog}
          element={
            <ProtectedUser>
              <CreateBlog />
            </ProtectedUser>
          }
        />
        <Route path={routes.threads} element={<ThreadPage />} />
        <Route
          path={routes.threadDetail}
          element={
            <ProtectedUser>
              <ThreadDetailPage />
            </ProtectedUser>
          }
        />
        <Route
          path={routes.blogDetail}
          element={
            <ProtectedUser>
              <BlogDetails />
            </ProtectedUser>
          }
        />
        <Route
          path={routes.blogEdit}
          element={
            <ProtectedUser>
              <CreateBlog />
            </ProtectedUser>
          }
        />
        <Route path={routes.root} element={<Navigate to={routes.home} />} />
        <Route path={routes.userRegistration} element={<UserRegistration />} />
        <Route
          path={routes.login}
          element={<LoginPage fetchCurrentUser={refetchUser} />}
        />
        <Route
          path={routes.profile}
          element={
            <ProtectedUser>
              <UserProfile />
            </ProtectedUser>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Switch>
    </PageWrapper>
  );
};