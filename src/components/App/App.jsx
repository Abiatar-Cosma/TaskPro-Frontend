import { Suspense, lazy, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { useAuth } from 'hooks';
import { refreshUser } from '../../redux/auth/authOperations';
import { getTheme } from '../../redux/theme/themeOperation';
import { getAllBoards } from '../../redux/board/boardOperations';

import { PrivateRoute } from '../../routes/PrivateRoute';
import { PublicRoute } from '../../routes/PublicRoute';

import SharedLayout from 'layouts/SharedLayout';
import Loader from 'components/Loader/Loader';

const WelcomePage = lazy(() => import('pages/WelcomePage'));
const AuthPage = lazy(() => import('pages/AuthPage'));
const HomePage = lazy(() => import('pages/HomePage'));
const ScreensPage = lazy(() => import('pages/ScreensPage'));
const StatsPage = lazy(() => import('pages/StatsPage'));
const SchedulePage = lazy(() => import('pages/SchedulePage'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage'));

const App = () => {
  const dispatch = useDispatch();
  const { isRefreshing, isLoggedIn } = useAuth();

  // 1) La boot încercăm rehidratarea sesiunii (refresh sau NO_SESSION)
  useEffect(() => {
    dispatch(refreshUser());
  }, [dispatch]);

  // 2) Oricând devine logat → adu tema + board-urile
  useEffect(() => {
    if (isLoggedIn) {
      dispatch(getTheme());
      dispatch(getAllBoards());
    }
  }, [isLoggedIn, dispatch]);

  if (isRefreshing) return <Loader strokeColor="#fff" />;

  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute redirectTo="/home">
                <WelcomePage />
              </PublicRoute>
            }
          />
          <Route
            path="/auth/:id"
            element={
              <PublicRoute redirectTo="/home">
                <AuthPage />
              </PublicRoute>
            }
          />

          <Route path="/home" element={<SharedLayout />}>
            <Route
              index
              element={
                <PrivateRoute redirectTo="/auth/login">
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="board/:boardId"
              element={
                <PrivateRoute redirectTo="/auth/login">
                  <ScreensPage />
                </PrivateRoute>
              }
            />
            <Route
              path="stats"
              element={
                <PrivateRoute redirectTo="/auth/login">
                  <StatsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="schedule"
              element={
                <PrivateRoute redirectTo="/auth/login">
                  <SchedulePage />
                </PrivateRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
