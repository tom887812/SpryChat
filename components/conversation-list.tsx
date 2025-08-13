"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  MoreHorizontal,
  Edit2
} from "lucide-react";
import { useSimpleConversations } from "@/hooks/use-simple-conversations";
import { useI18n } from "@/hooks/use-i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export function ConversationList() {
  const { t } = useI18n();
  const {
    conversations,
    currentConversationId,
    createNewConversation,
    switchToConversation,
    deleteConversation,
    updateConversationTitle,
    clearAllConversations,
  } = useSimpleConversations();

  const [showClearDialog, setShowClearDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleNewThread = () => {
    createNewConversation();
  };

  const handleEditTitle = (conversation: { id: string; title: string }) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const handleSaveTitle = () => {
    if (editingId && editingTitle.trim()) {
      updateConversationTitle(editingId, editingTitle.trim());
    }
    setEditingId(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
  };

  const handleClearAll = () => {
    clearAllConversations();
    setShowClearDialog(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return "今天";
    } else if (days === 1) {
      return "昨天";
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 新对话按钮 */}
      <div className="p-2">
        <Button
          onClick={handleNewThread}
          className="w-full justify-start"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('newThread')}
        </Button>
      </div>

      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            {t('noConversations')}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative flex items-center rounded-md p-2 cursor-pointer hover:bg-accent ${
                  currentConversationId === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => switchToConversation(conversation.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
                
                {editingId === conversation.id ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveTitle();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="h-6 text-sm"
                    autoFocus
                  />
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(conversation.updatedAt)}
                    </div>
                  </div>
                )}

                {editingId !== conversation.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTitle(conversation)}>
                        <Edit2 className="mr-2 h-3 w-3" />
                        编辑标题
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteConversation(conversation.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-3 w-3" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 清除历史按钮 */}
      {conversations.length > 0 && (
        <div className="p-2 border-t">
          <Button
            onClick={() => setShowClearDialog(true)}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            {t('clearHistory')}
          </Button>
        </div>
      )}

      {/* 确认清除对话框 */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('clearHistory')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('clearHistoryConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll}>
              {t('clearHistory')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
