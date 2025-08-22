import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "@/index.css";
import budgetsData from "@/services/mockData/budgets.json";
import transactionsData from "@/services/mockData/transactions.json";
import goalsData from "@/services/mockData/goals.json";
import categoriesData from "@/services/mockData/categories.json";
import Goals from "@/components/pages/Goals";
import Transactions from "@/components/pages/Transactions";
import Dashboard from "@/components/pages/Dashboard";
import Charts from "@/components/pages/Charts";
import Budgets from "@/components/pages/Budgets";
import Sidebar from "@/components/organisms/Sidebar";
import TransactionForm from "@/components/organisms/TransactionForm";
import Header from "@/components/organisms/Header";
import Modal from "@/components/atoms/Modal";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              onMenuClick={() => setSidebarOpen(true)}
            />
            
            <main className="flex-1 overflow-y-auto">
              <div className="px-4 lg:px-8 py-8">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/charts" element={<Charts />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>

<ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 9999 }}
        />

        {/* Global Transaction Modal */}
        <Modal 
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          size="lg"
        >
          <TransactionForm 
            onTransactionAdded={() => {
              setIsTransactionModalOpen(false);
              // You can add additional logic here if needed
            }}
            editTransaction={null}
            onEditComplete={() => setIsTransactionModalOpen(false)}
          />
        </Modal>
      </div>
    </BrowserRouter>
  );
}

export default App;