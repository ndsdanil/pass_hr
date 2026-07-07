'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NumberBadge } from '@/components/ui/number-badge';
import { GradientBackground } from '@/components/ui/gradient-background';
import { Section, SectionTitle, SectionDescription } from '@/components/ui/section';
import { DocumentTextIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';
import { IconWithGradient } from '@/components/ui/icon-with-gradient';
import { StepCard } from '@/components/ui/step-card';

export default function UIKitPage() {
  const [activeTab, setActiveTab] = useState<string>('buttons');

  const tabs = [
    { id: 'buttons', label: 'Buttons' },
    { id: 'cards', label: 'Cards' },
    { id: 'badges', label: 'Badges' },
    { id: 'sections', label: 'Sections' },
    { id: 'gradients', label: 'Gradients' },
    { id: 'stepCards', label: 'Step Cards' },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">UI Component Library</h1>
      
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {activeTab === 'buttons' && (
        <Section title="Buttons">
          <SectionDescription>
            Button components with different variants and sizes
          </SectionDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="default">Primary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Button Sizes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 items-center">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" className="ml-4"><DocumentTextIcon className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          </div>
        </Section>
      )}

      {activeTab === 'cards' && (
        <Section title="Cards">
          <SectionDescription>Card components with different configurations</SectionDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Simple Card</CardTitle>
                <CardDescription>Basic card with header and content</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This is a basic card component with a header and content section.</p>
              </CardContent>
            </Card>
            
            <Card variant="outline">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>Card with an outline style</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card uses the outline variant for a more subtle appearance.</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="gradient">
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>Card with a gradient background</CardDescription>
              </CardHeader>
              <CardContent>
                <p>This card has a subtle gradient background.</p>
              </CardContent>
            </Card>
          </div>
        </Section>
      )}

      {activeTab === 'badges' && (
        <Section title="Badges">
          <SectionDescription>Badge and NumberBadge components</SectionDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Standard Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Number Badges</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6 items-center">
                <NumberBadge number={1} />
                <NumberBadge number={2} variant="primary" />
                <NumberBadge number={3} variant="blue" />
                <NumberBadge number={4} variant="green" />
                <NumberBadge number={5} variant="emerald" size="lg" />
              </CardContent>
            </Card>
          </div>
        </Section>
      )}

      {activeTab === 'sections' && (
        <Section title="Section Components">
          <SectionDescription>Section layout components for page structure</SectionDescription>
          
          <div className="space-y-12 mt-8">
            <Section 
              title="Default Section" 
              description="This is a standard section with a title and description."
              variant="default"
            >
              <Card className="mt-4">
                <CardContent className="p-6">
                  <p>Content inside a default section</p>
                </CardContent>
              </Card>
            </Section>
            
            <Section 
              title="Primary Section" 
              description="This is a primary section with a different background."
              variant="primary"
            >
              <Card className="mt-4">
                <CardContent className="p-6">
                  <p>Content inside a primary section</p>
                </CardContent>
              </Card>
            </Section>
            
            <Section 
              variant="gradient"
              className="py-8 rounded-lg"
            >
              <SectionTitle className="text-center">Gradient Section Title</SectionTitle>
              <SectionDescription className="text-center max-w-2xl mx-auto">
                This section uses a gradient background and centered content
              </SectionDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <p>Card inside a gradient section</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p>Another card inside a gradient section</p>
                  </CardContent>
                </Card>
              </div>
            </Section>
          </div>
        </Section>
      )}

      {activeTab === 'gradients' && (
        <Section title="Gradient Components">
          <SectionDescription>Components with gradient styling</SectionDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Gradient Backgrounds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GradientBackground colorVariant="blue" className="h-20 w-full rounded-lg" />
                <GradientBackground colorVariant="purple" className="h-20 w-full rounded-lg" />
                <GradientBackground colorVariant="emerald" className="h-20 w-full rounded-lg" />
                <GradientBackground colorVariant="mixed" className="h-20 w-full rounded-lg" />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Icons with Gradients</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6 justify-center py-8">
                <IconWithGradient 
                  icon={DocumentTextIcon} 
                  color="from-blue-400 to-blue-600" 
                />
                <IconWithGradient 
                  icon={RocketLaunchIcon}
                  color="from-emerald-400 to-emerald-600" 
                />
                <IconWithGradient 
                  icon={DocumentTextIcon}
                  color="from-purple-400 to-purple-600" 
                />
              </CardContent>
            </Card>
          </div>
        </Section>
      )}

      {activeTab === 'stepCards' && (
        <Section title="Step Cards">
          <SectionDescription>Cards designed for displaying steps in a process</SectionDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-8">
            <div>
              <h3 className="text-xl font-semibold mb-6">Default Style</h3>
              <div className="space-y-8">
                <StepCard
                  name="Upload Your Resume"
                  description="AI analyzes and identifies areas for improvement"
                  icon={DocumentTextIcon}
                  color="from-blue-400 to-blue-600"
                  index={0}
                  variant="blue"
                />
                
                <StepCard
                  name="Add Job Description"
                  description="System analyzes requirements and compares with your resume"
                  icon={RocketLaunchIcon}
                  color="from-blue-500 to-blue-700"
                  index={1}
                  variant="blue"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-6">Emerald Style</h3>
              <div className="space-y-8">
                <StepCard
                  name="Post Job Description"
                  description="AI analyzes requirements and extracts key skills"
                  icon={DocumentTextIcon}
                  color="from-emerald-400 to-emerald-600"
                  index={0}
                  variant="emerald"
                />
                
                <StepCard
                  name="Add Resumes or Use AI Search"
                  description="Upload CVs or let AI find candidates from open sources"
                  icon={RocketLaunchIcon}
                  color="from-emerald-500 to-emerald-700"
                  index={1}
                  variant="emerald"
                />
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
} 