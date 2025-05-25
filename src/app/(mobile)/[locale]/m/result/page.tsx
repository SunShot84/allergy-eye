"use client";

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import { useCurrentLocale } from '@/lib/i18n/client';

interface FoodResult {
  name: string;
  brand: string;
  allergens: string[];
  safeAllergens: string[];
  ingredients: string[];
  confidence: number;
}

interface IngredientsResult {
  name: string;
  text: string;
  allergens: string[];
  safeAllergens: string[];
  confidence: number;
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLocale = useCurrentLocale();
  const mode = searchParams.get('mode') || 'food';

  // 模拟扫描结果数据
  const mockResults = {
    food: {
      name: '雀巢奇巧威化饼干',
      brand: '雀巢',
      allergens: ['小麦', '牛奶', '大豆'],
      safeAllergens: ['鸡蛋', '花生'],
      ingredients: ['小麦粉', '糖', '植物油', '牛奶粉', '大豆卵磷脂'],
      confidence: 95
    } as FoodResult,
    ingredients: {
      name: '配料表分析',
      text: '小麦粉，糖，植物油，牛奶粉，可可粉，大豆卵磷脂，香草香精，食用盐',
      allergens: ['小麦', '牛奶', '大豆'],
      safeAllergens: ['鸡蛋', '花生', '坚果'],
      confidence: 88
    } as IngredientsResult
  };

  const result = mockResults[mode as keyof typeof mockResults];

  const handleRescan = () => {
    router.push(`/${currentLocale}/m`);
  };

  const isFoodResult = (result: FoodResult | IngredientsResult): result is FoodResult => {
    return mode === 'food';
  };

  const isIngredientsResult = (result: FoodResult | IngredientsResult): result is IngredientsResult => {
    return mode === 'ingredients';
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      {/* 顶部导航 */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {mode === 'food' ? '食品扫描结果' : '配料表分析结果'}
        </h1>
      </div>

      {/* 识别结果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{result.name}</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {result.confidence}% 置信度
            </Badge>
          </CardTitle>
          {isFoodResult(result) && (
            <p className="text-sm text-muted-foreground">品牌: {result.brand}</p>
          )}
        </CardHeader>
        <CardContent>
          {isIngredientsResult(result) && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">识别的配料表文字:</h4>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">{result.text}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 过敏原分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>过敏原分析</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 危险过敏原 */}
          {result.allergens.length > 0 && (
            <div>
              <h4 className="font-medium text-red-600 mb-2 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span>检测到过敏原</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.allergens.map((allergen: string) => (
                  <Badge key={allergen} variant="destructive">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 安全成分 */}
          {result.safeAllergens.length > 0 && (
            <div>
              <h4 className="font-medium text-green-600 mb-2 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>未检测到的过敏原</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.safeAllergens.map((allergen: string) => (
                  <Badge key={allergen} variant="secondary" className="bg-green-100 text-green-800">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 成分详情 */}
      {isFoodResult(result) && (
        <Card>
          <CardHeader>
            <CardTitle>主要成分</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.ingredients.map((ingredient: string) => (
                <Badge key={ingredient} variant="outline">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 底部操作 */}
      <div className="fixed bottom-4 left-4 right-4">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleRescan}
            className="flex-1 flex items-center justify-center space-x-2"
          >
            <Camera className="h-4 w-4" />
            <span>重新扫描</span>
          </Button>
          <Button className="flex-1">
            保存结果
          </Button>
        </div>
      </div>
    </div>
  );
} 