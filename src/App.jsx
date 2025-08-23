import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import AddDomain from "./pages/domain/AddDomain";
import ListDomain from "./pages/domain/ListDomain";
import AdminProtected from "./components/AdminProtected";
import Layout from "./components/Layout";
import TemplateEdit from "./pages/Template/TemplateEdit";
import TemplateList from "./pages/Template/TemplateList";
import SubscriberManager from "./pages/subscriber/SubscriberManagement";
import MailSettings from "./pages/MailSetting/MailSettings";
import ListMailSetting from "./pages/MailSetting/ListMailSetting";
import DataDomain from "./pages/domain/DataDomain";
import EditDomain from "./pages/domain/EditDomain";
import Publish from "./pages/publish/Publish";
import DomainDailyStats from "./pages/domain/DomainDailyStats";
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <AdminProtected>
              <Layout />
            </AdminProtected>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-subscriber" element={<SubscriberManager />} />
          <Route path="add-domain" element={<AddDomain />} />
          <Route path="domains" element={<ListDomain />} />
          <Route path="domain-data" element={<DataDomain />} />
          <Route path="domain-edit/:id" element={<EditDomain />} />
          <Route path="templates" element={<TemplateList />} />
          <Route path="templates/create" element={<TemplateEdit />} />
          <Route path="templates/edit/:id" element={<TemplateEdit />} />
          <Route path="mail-settings" element={<MailSettings/>} />
          <Route path="publish-mail" element={<Publish />} />
          <Route path="domain-daily-stats" element={<DomainDailyStats />} />

          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* AdminRoutes */}
        {/* <Route path='/admin/dashboard' element={
          <AdminProtected>
            <LayoutDash>
              <Page/>
            </LayoutDash>
          </AdminProtected>
        } />
         <Route path='/products/create' element={
          <AdminProtected>
            <LayoutDash>
              <Productcreate/>
            </LayoutDash>
          </AdminProtected>
        } /> */}
      </Routes>
    </>
  );
};

export default App;
