import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, MessageSquare, MoreVertical, Edit } from 'lucide-react';
import { useApp } from '../App';
import { AppRoute } from '../types';
import Button from '../components/Button';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Dashboard() {
  const { assistants, deleteAssistant } = useApp();
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    assistantId: string | null;
    assistantName: string;
  }>({
    isOpen: false,
    assistantId: null,
    assistantName: '',
  });

  const handleCardClick = (id: string) => {
    navigate(`${AppRoute.CHAT}/${id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    setConfirmDialog({
      isOpen: true,
      assistantId: id,
      assistantName: name,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.assistantId) {
      deleteAssistant(confirmDialog.assistantId);
    }
    setConfirmDialog({ isOpen: false, assistantId: null, assistantName: '' });
  };

  return (
    <div className="p-6 md:p-10 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your personal AI workforce.</p>
          </div>
          <Button onClick={() => navigate(AppRoute.GENERATOR)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Assistant
          </Button>
        </div>

        {assistants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assistants Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Get started by creating your first AI assistant. You can use our Generator to build one conversationally.
            </p>
            <Button onClick={() => navigate(AppRoute.GENERATOR)}>
              Create Now
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assistants.map((assistant) => (
              <div
                key={assistant.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 hover:border-blue-300 transition-all duration-200 cursor-pointer flex flex-col h-60"
                onClick={() => handleCardClick(assistant.id)}
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-4xl">{assistant.icon}</span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleDeleteClick(e, assistant.id, assistant.name)}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                    {assistant.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {assistant.description || 'No description provided.'}
                  </p>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl flex items-center text-sm font-medium text-blue-600 group-hover:bg-blue-50 transition-colors">
                  <MessageSquare size={16} className="mr-2" />
                  Chat now
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        type="danger"
        title="Delete Assistant"
        message={`Are you sure you want to delete "${confirmDialog.assistantName}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, assistantId: null, assistantName: '' })}
      />
    </div>
  );
}
