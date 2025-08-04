import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProCheckbox } from '@/components/ui/pro-checkbox';
import {
  GrippableSheet,
  GrippableSheetContent,
  GrippableSheetHeader,
  GrippableSheetTitle,
  GrippableSheetDescription,
} from '@/components/ui/grippable-sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const DrawerDemo = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState({
    option1: false,
    option2: true,
    option3: false,
  });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">ShadCN Components Demo</h1>
          <p className="text-muted-foreground mt-2">Professional checkboxes and grippable drawers</p>
        </div>

        {/* Professional Checkboxes Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Checkboxes</CardTitle>
            <CardDescription>Enhanced ShadCN checkboxes with animations and size variants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ProCheckbox
                  id="small"
                  size="sm"
                  checked={checkboxStates.option1}
                  onCheckedChange={(checked) => 
                    setCheckboxStates(prev => ({ ...prev, option1: !!checked }))
                  }
                />
                <Label htmlFor="small" className="text-sm font-medium">
                  Small checkbox with professional styling
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <ProCheckbox
                  id="medium"
                  size="md"
                  checked={checkboxStates.option2}
                  onCheckedChange={(checked) => 
                    setCheckboxStates(prev => ({ ...prev, option2: !!checked }))
                  }
                />
                <Label htmlFor="medium" className="text-sm font-medium">
                  Medium checkbox (default) - Perfect for forms
                </Label>
              </div>
              
              <div className="flex items-center space-x-3">
                <ProCheckbox
                  id="large"
                  size="lg"
                  checked={checkboxStates.option3}
                  onCheckedChange={(checked) => 
                    setCheckboxStates(prev => ({ ...prev, option3: !!checked }))
                  }
                />
                <Label htmlFor="large" className="text-sm font-medium">
                  Large checkbox with enhanced shadow and hover effects
                </Label>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Three size variants: sm, md, lg</li>
                <li>• Smooth animations and transitions</li>
                <li>• Enhanced shadow effects on checked state</li>
                <li>• Hover animations with scale and border effects</li>
                <li>• Professional color scheme matching ORMI theme</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Grippable Drawer Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Grippable Drawers</CardTitle>
            <CardDescription>ShadCN sheets with visual grip handles and enhanced sizing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsDrawerOpen(true)}>
              Open Grippable Drawer
            </Button>
          </CardContent>
        </Card>

        {/* Grippable Sheet */}
        <GrippableSheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <GrippableSheetContent side="right" showGrip={true}>
            <GrippableSheetHeader>
              <GrippableSheetTitle>Professional Drawer</GrippableSheetTitle>
              <GrippableSheetDescription>
                This drawer features a visual grip handle, enhanced sizing, and professional styling
              </GrippableSheetDescription>
            </GrippableSheetHeader>

            <div className="flex-1 px-6 py-4 space-y-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Property Name</Label>
                  <Input id="name" placeholder="Enter property name..." />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Property description..." rows={4} />
                </div>
                
                <div className="space-y-4">
                  <Label>Features</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <ProCheckbox id="feature1" size="sm" />
                      <Label htmlFor="feature1" className="text-sm">Swimming Pool</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ProCheckbox id="feature2" size="sm" />
                      <Label htmlFor="feature2" className="text-sm">Gym Access</Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <ProCheckbox id="feature3" size="sm" />
                      <Label htmlFor="feature3" className="text-sm">Parking Included</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-2">Drawer Features:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visual grip handle on the left side</li>
                  <li>• Responsive width (sm:max-w-sm to 2xl:max-w-2xl)</li>
                  <li>• Enhanced backdrop blur and styling</li>
                  <li>• Hover effects on grip handle</li>
                  <li>• Professional header and footer components</li>
                </ul>
              </div>
            </div>

            <div className="border-t bg-muted/30 backdrop-blur-sm px-6 py-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsDrawerOpen(false)}>
                Save Property
              </Button>
            </div>
          </GrippableSheetContent>
        </GrippableSheet>
      </div>
    </div>
  );
}; 