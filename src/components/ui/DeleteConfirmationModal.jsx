import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, itemName, confirmText }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 relative border-red-500/20">
                <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{title || "Delete Item"}</h3>
                    <p className="text-text-muted mb-6">
                        {message || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this item'}? This action cannot be undone.`}
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <Button 
                            variant="secondary" 
                            className="flex-1" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button 
                            className="flex-1 bg-red-500 hover:bg-red-600 border-red-500" 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                        >
                            {confirmText || "Delete"}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DeleteConfirmationModal;
