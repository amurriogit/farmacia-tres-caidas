import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RegisterAdmin } from './components/Auth/RegisterAdmin';
import { Login } from './components/Auth/Login';
import { Layout } from './components/Layout';
import { Inventory } from './components/Inventory/Inventory';
import { Sales } from './components/Sales/Sales';
import { Reports } from './components/Reports/Reports';
import { Users } from './components/Users/Users';
import { History } from './components/History/History';
import { Config } from './components/Config/Config';
import { Help } from './components/Help/Help';
import { Dashboard } from './components/Dashboard/Dashboard';

const Main = () => {
  const { users, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // 1. If no users exist in the system, show Admin Registration
  if (users.length === 0) {
    return <RegisterAdmin />;
  }

  // 2. If no user is logged in, show Login
  if (!currentUser) {
    return <Login />;
  }

  // 3. Authenticated View
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
       {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
       {activeTab === 'inventory' && <Inventory />}
       {activeTab === 'sales' && <Sales />}
       {activeTab === 'reports' && <Reports />}
       {activeTab === 'users' && <Users />}
       {activeTab === 'history' && <History />}
       {activeTab === 'config' && <Config />}
       {activeTab === 'help' && <Help />}
    </Layout>
  );
};

export default function App() {
  return (
    <AppProvider children={<Main />} />
  );
}