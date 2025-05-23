"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileFormProps {
  initialAllergies: string[];
  onSave: (allergies: string[]) => void;
}

export function ProfileForm({ initialAllergies, onSave }: ProfileFormProps) {
  const [allergies, setAllergies] = useState<string[]>(initialAllergies);
  const [newAllergy, setNewAllergy] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setAllergies(initialAllergies);
  }, [initialAllergies]);

  const handleAddAllergy = useCallback(() => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim().toLowerCase())) {
      setAllergies(prev => [...prev, newAllergy.trim().toLowerCase()]);
      setNewAllergy('');
    } else if (allergies.includes(newAllergy.trim().toLowerCase())) {
      toast({
        title: "Allergy already added",
        description: `"${newAllergy.trim()}" is already in your list.`,
        variant: "default",
      });
    }
  }, [newAllergy, allergies, toast]);

  const handleRemoveAllergy = useCallback((allergyToRemove: string) => {
    setAllergies(prev => prev.filter(allergy => allergy !== allergyToRemove));
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(allergies);
    toast({
      title: "Profile Saved",
      description: "Your allergy profile has been updated.",
    });
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Your Allergy Profile</CardTitle>
        <CardDescription>
          List your known allergies. This will help prioritize them in scan results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="new-allergy" className="block text-sm font-medium text-foreground">
              Add an allergy (e.g., peanuts, gluten, dairy)
            </label>
            <div className="flex gap-2">
              <Input
                id="new-allergy"
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Enter an allergy"
                className="flex-grow"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAllergy();
                  }
                }}
              />
              <Button type="button" onClick={handleAddAllergy} variant="outline" className="shrink-0">
                <PlusCircle className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>

          {allergies.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">Your current allergies:</h3>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 min-h-[40px]">
                {allergies.map(allergy => (
                  <Badge
                    key={allergy}
                    variant="secondary"
                    className="text-sm py-1 px-3 capitalize bg-primary/10 text-primary-foreground border-primary/30"
                  >
                    {allergy}
                    <button
                      type="button"
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="ml-2 rounded-full hover:bg-destructive/50 p-0.5"
                      aria-label={`Remove ${allergy}`}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          {allergies.length === 0 && (
            <p className="text-sm text-muted-foreground">You haven't added any allergies yet.</p>
          )}

          <Button type="submit" className="w-full">
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
