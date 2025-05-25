"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Eye,
  Loader2,
  AlertCircle,
  Calendar,
  Camera,
  List as ListIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCurrentLocale, useI18n } from '@/lib/i18n/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { ScanResultItem } from '@/lib/types';
import { AllergenResults } from '@/components/allergy-eye/allergen-results';
import { getAllergenById } from '@/lib/allergens';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Helper function to get allergen display name based on locale
const getAllergenDisplayName = (allergenId: string, locale: string): string => {
  const allergen = getAllergenById(allergenId);
  if (!allergen) return allergenId;
  
  const langKey = locale.toLowerCase();
  if (langKey === 'zh-cn' && allergen.name.sc?.length > 0) return allergen.name.sc[0];
  if (langKey === 'zh-tw' && allergen.name.tc?.length > 0) return allergen.name.tc[0];
  if (allergen.name.eng?.length > 0) return allergen.name.eng[0];
  return allergen.id;
};

const formatTimestamp = (timestamp: number, locale: string = 'zh-CN'): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60);
    return `${minutes}分钟前`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours}小时前`;
  } else if (diffInHours < 48) {
    return '昨天';
  } else {
    return date.toLocaleDateString(locale, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default function MobileHistoryPage() {
  const [scanHistory, setScanHistory] = useState<ScanResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ScanResultItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const t = useI18n();
  const { token, isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  const fetchScanHistory = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/history', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('认证失败，请重新登录');
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch history' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      const historyData = await response.json();
      setScanHistory(historyData);
    } catch (err: any) {
      console.error('Error fetching scan history:', err);
      setError(err.message || '加载历史记录失败');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchScanHistory();
  }, [fetchScanHistory]);

  const handleViewItem = (item: ScanResultItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`/api/history/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to delete item' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      setScanHistory(prev => prev.filter(item => item.id !== itemId));
      toast({ title: '删除成功', description: '扫描记录已删除' });
    } catch (err: any) {
      console.error('Error deleting history item:', err);
      toast({
        title: '删除失败',
        description: err.message || '删除扫描记录失败',
        variant: 'destructive',
      });
    }
  };

  const handleClearHistory = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to clear history' }));
        throw new Error(errorData.message || `HTTP error ${response.status}`);
      }

      setScanHistory([]);
      toast({ title: '清除成功', description: '所有扫描记录已清除' });
    } catch (err: any) {
      console.error('Error clearing history:', err);
      toast({
        title: '清除失败',
        description: err.message || '清除历史记录失败',
        variant: 'destructive',
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">需要登录</h2>
            <p className="text-muted-foreground mb-4">
              请登录后查看您的扫描历史记录
            </p>
            <Button onClick={() => router.push(`/${currentLocale}/login?redirect=${encodeURIComponent(`/${currentLocale}/m/history`)}`)}>
              立即登录
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-3"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">扫描历史</h1>
        </div>
        
        {scanHistory.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600">
                清空
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认清空历史记录</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作将删除所有扫描历史记录，且无法恢复。您确定要继续吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="bg-red-600 hover:bg-red-700">
                  确认清空
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">加载历史记录中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">加载失败</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchScanHistory}>重试</Button>
            </div>
          </div>
        ) : scanHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">暂无扫描记录</h2>
              <p className="text-muted-foreground mb-4">
                开始您的第一次食品安全扫描吧
              </p>
              <Button onClick={() => router.push(`/${currentLocale}/m`)}>
                开始扫描
              </Button>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {scanHistory.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {/* 缩略图 */}
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.imageDataUrl}
                          alt="扫描图片"
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {item.scanType === 'food' ? (
                              <Camera className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ListIcon className="h-4 w-4 text-green-500" />
                            )}
                            <span className="text-sm font-medium">
                              {item.scanType === 'food' ? '食品扫描' : '配料表扫描'}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(item.timestamp, currentLocale)}
                          </span>
                        </div>

                        {/* 过敏原信息 */}
                        {item.identifiedAllergens.length > 0 ? (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {item.identifiedAllergens.slice(0, 2).map((allergen, index) => {
                                const displayName = getAllergenDisplayName(allergen.allergenId, currentLocale);
                                const isUserAllergy = item.userProfileAllergiesAtScanTime.includes(allergen.allergenId);
                                
                                return (
                                  <Badge
                                    key={`${item.id}-${allergen.allergenId}-${index}`}
                                    variant={isUserAllergy ? "destructive" : "secondary"}
                                    className="text-xs"
                                  >
                                    {displayName}
                                  </Badge>
                                );
                              })}
                              {item.identifiedAllergens.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{item.identifiedAllergens.length - 2}
                                </Badge>
                              )}
                            </div>
                            {item.userProfileAllergiesAtScanTime.some(userAllergenId => 
                              item.identifiedAllergens.some(ia => ia.allergenId === userAllergenId)
                            ) && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                                <span className="text-xs text-red-600 font-medium">
                                  包含您的过敏原
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 mb-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-green-600">未检测到过敏原</span>
                          </div>
                        )}

                        {/* 操作按钮 */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewItem(item)}
                            className="flex-1 text-xs h-8"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            查看详情
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 h-8 px-2"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除这条扫描记录吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* 详情对话框 */}
      {selectedItem && (
        <Dialog open={isModalOpen} onOpenChange={closeModal}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-4 pb-2">
              <DialogTitle className="text-lg">
                {selectedItem.scanType === 'food' ? '食品扫描详情' : '配料表扫描详情'}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {formatTimestamp(selectedItem.timestamp, currentLocale)}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 pt-0 space-y-4">
                {/* 图片 */}
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={selectedItem.imageDataUrl}
                    alt="扫描图片"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* 分析结果 */}
                <div className="bg-white rounded-lg">
                  <AllergenResults
                    analysisResult={{
                      identifiedAllergens: selectedItem.identifiedAllergens,
                      prioritizedAllergens: selectedItem.prioritizedAllergens,
                      foodDescription: selectedItem.foodDescription,
                      extractedText: selectedItem.extractedText,
                    }}
                    userProfile={{ knownAllergies: selectedItem.userProfileAllergiesAtScanTime }}
                  />
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 