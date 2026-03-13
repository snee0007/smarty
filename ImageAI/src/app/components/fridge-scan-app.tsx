'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Camera, Plus, Trash2, X, LoaderCircle, Refrigerator } from 'lucide-react';

import { identifyItems } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default function FridgeScanApp({ placeholderImage }: { placeholderImage: ImagePlaceholder }) {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setItems([]);
      setIsEditing(false);
    }
  };

  const handleScan = async () => {
    if (!imageFile || !imagePreview) return;

    setIsLoading(true);
    setIsEditing(false);

    const result = await identifyItems({ photoDataUri: imagePreview });
    
    setIsLoading(false);

    if (result.success && result.data) {
      setItems(result.data);
      setIsEditing(true);
       if (result.data.length === 0) {
        toast({
          title: "No items found",
          description: "We couldn't identify any items in the image. You can add them manually.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: result.error || "An unknown error occurred.",
      });
    }
  };
  
  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, '']);
    setTimeout(() => {
        const itemInputs = document.querySelectorAll('[data-item-input]');
        const lastInput = itemInputs[itemInputs.length - 1] as HTMLInputElement;
        lastInput?.focus();
    }, 0);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setItems([]);
    setIsEditing(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = imagePreview || placeholderImage.imageUrl;

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="flex flex-col rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Fridge Scan</CardTitle>
          <CardDescription>Upload a photo of your fridge to get started.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center relative aspect-[3/4] p-0">
          <Image
            src={displayImage}
            alt={imagePreview ? "Fridge contents" : placeholderImage.description}
            fill
            sizes="(max-width: 1024px) 90vw, 45vw"
            className="object-cover rounded-b-xl"
            data-ai-hint={!imagePreview ? placeholderImage.imageHint : undefined}
          />
          {imagePreview && (
             <Button
                variant="destructive"
                size="icon"
                onClick={clearImage}
                className="absolute top-4 right-4 z-10 rounded-full shadow-md"
                aria-label="Clear image"
             >
                <X className="h-4 w-4" />
             </Button>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-6">
            <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Camera className="mr-2 h-4 w-4" />
                Upload Photo
            </Button>
            <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
            />
            <Button
                onClick={handleScan}
                disabled={!imageFile || isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
                {isLoading ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? 'Scanning...' : 'Scan Fridge'}
            </Button>
        </CardFooter>
      </Card>
      
      <Card className="flex flex-col rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Identified Items</CardTitle>
          <CardDescription>
            {isEditing ? "Review and edit the list of items found in your fridge." : "Your items will appear here after scanning."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          {isLoading ? (
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-10 flex-grow rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                </div>
              ))}
            </div>
          ) : items.length > 0 || isEditing ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    placeholder="Enter item name"
                    className="flex-grow"
                    data-item-input
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(index)} aria-label={`Delete ${item}`}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {items.length === 0 && isEditing && (
                 <p className="text-sm text-muted-foreground text-center py-4">No items identified. Add items manually below.</p>
              )}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg bg-background">
                <Refrigerator className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Your fridge inventory is empty</p>
                <p className="text-sm text-muted-foreground">Scan an image to see what's inside.</p>
            </div>
          )}
        </CardContent>
        {(isEditing || items.length > 0) && (
            <CardFooter>
                <Button variant="secondary" className="w-full" onClick={handleAddItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
