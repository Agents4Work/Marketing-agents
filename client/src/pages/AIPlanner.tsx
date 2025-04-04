'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ListTodo, Upload, PlusCircle, Clock, Edit, Trash2, CheckCircle2, AlertCircle, CalendarCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { KanbanProvider, KanbanBoard, KanbanHeader, KanbanCards, KanbanCard } from "@/components/ui/kanban";
import { 
  CalendarProvider, 
  CalendarBody, 
  CalendarHeader, 
  CalendarItem, 
  CalendarDate, 
  CalendarDatePicker, 
  CalendarMonthPicker, 
  CalendarYearPicker, 
  CalendarDatePagination 
} from "@/components/ui/task-calendar";
import { format, addDays, isAfter } from 'date-fns';
import { Textarea } from "@/components/ui/textarea";
import SidebarOptimized from "@/components/SidebarOptimized";
import type { DragEndEvent } from '@dnd-kit/core';
import { AlertTriangle } from "lucide-react";

// Define task status types
const taskStatuses = [
  { id: 'to-do', name: 'To Do', color: '#e5e7eb' },
  { id: 'in-progress', name: 'In Progress', color: '#60a5fa' },
  { id: 'review', name: 'Review', color: '#f59e0b' },
  { id: 'completed', name: 'Completed', color: '#34d399' },
];

// Define AI team members
const aiTeams = [
  { id: 'seo', name: 'SEO Team', icon: '🔍', color: '#818cf8' },
  { id: 'copywriting', name: 'Copywriting Team', icon: '✍️', color: '#34d399' },
  { id: 'social', name: 'Social Media Team', icon: '📱', color: '#60a5fa' },
  { id: 'ads', name: 'Ads Team', icon: '📢', color: '#f472b6' },
  { id: 'email', name: 'Email Team', icon: '📧', color: '#fbbf24' },
];

// Define initial mock tasks
const initialTasks: Task[] = [
  {
    id: '1',
    name: 'Write SEO blog post about AI marketing',
    description: 'Create a 1500-word blog post about AI marketing strategies for 2025',
    dueDate: addDays(new Date(), 3),
    status: taskStatuses[0],
    assignedTeam: aiTeams[0],
    priority: 'high',
    created: new Date(),
    autoScheduled: true,
    platform: null,
    publishDate: null,
  },
  {
    id: '2',
    name: 'Create social media campaign for product launch',
    description: 'Design and schedule posts for new product launch across all platforms',
    dueDate: addDays(new Date(), 5),
    status: taskStatuses[1],
    assignedTeam: aiTeams[2],
    priority: 'medium',
    created: new Date(),
    autoScheduled: true,
    platform: null,
    publishDate: null,
  },
  {
    id: '3',
    name: 'Write email newsletter for March',
    description: 'Create monthly newsletter highlighting new features and content',
    dueDate: addDays(new Date(), 2),
    status: taskStatuses[2],
    assignedTeam: aiTeams[4],
    priority: 'medium',
    created: new Date(),
    autoScheduled: true,
    platform: null,
    publishDate: null,
  },
  {
    id: '4',
    name: 'Create Google Ads campaign',
    description: 'Set up Google Ads campaign for spring promotion',
    dueDate: addDays(new Date(), 1),
    status: taskStatuses[3],
    assignedTeam: aiTeams[3],
    priority: 'high',
    created: new Date(),
    autoScheduled: true,
    platform: 'google',
    publishDate: addDays(new Date(), 3),
  },
];

// Define publishing platforms
const platforms = [
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#3b5998' },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e1306c' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1da1f2' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077b5' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#bd081c' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'youtube', name: 'YouTube', icon: '▶️', color: '#ff0000' },
  { id: 'google', name: 'Google Ads', icon: '🔍', color: '#4285f4' },
  { id: 'email', name: 'Email', icon: '📧', color: '#fbbf24' },
  { id: 'website', name: 'Website', icon: '🌐', color: '#10b981' },
];

// Get priority badge color
const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400';
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
  }
};

// Define Task type
type Task = {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  status: typeof taskStatuses[0];
  assignedTeam: typeof aiTeams[0];
  priority: 'high' | 'medium' | 'low';
  created: Date;
  autoScheduled: boolean;
  platform: string | null;
  publishDate: Date | null;
};

// Helper to check if task is overdue
const isTaskOverdue = (task: Task) => {
  return task.status.id !== 'completed' && isAfter(new Date(), task.dueDate);
};

export default function AIPlanner() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  
  const [newTaskData, setNewTaskData] = useState<Omit<Task, 'id' | 'created' | 'autoScheduled'>>({
    name: '',
    description: '',
    dueDate: addDays(new Date(), 3), // Default due date (3 days from now)
    status: taskStatuses[0], // Default to "To Do"
    assignedTeam: aiTeams[0], // Default to SEO team
    priority: 'medium' as 'high' | 'medium' | 'low', // Default priority
    platform: null,
    publishDate: null,
  });

  // Filter tasks by status
  const getTasksByStatus = (statusId: string) => {
    return tasks.filter(task => task.status.id === statusId);
  };

  // Get tasks for publishing tab
  const getPublishableTasks = () => {
    return tasks.filter(task => 
      task.status.id === 'completed' || 
      (task.platform && task.publishDate)
    );
  };

  // Convert tasks to calendar events format
  const tasksToCalendarEvents = () => {
    return tasks.map(task => ({
      id: task.id,
      name: task.name,
      startAt: new Date(task.created),
      endAt: new Date(task.dueDate),
      status: {
        id: task.status.id,
        name: task.status.name,
        color: isTaskOverdue(task) ? '#ef4444' : task.status.color
      }
    }));
  };

  // Handle drag and drop in kanban
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    setTasks(tasks.map(task => {
      if (task.id === active.id) {
        const newStatus = taskStatuses.find(status => status.id === over.id);
        return { ...task, status: newStatus || task.status };
      }
      return task;
    }));
  };

  // Add a new task from quick input
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    // Auto-assign team based on task content
    let assignedTeam = aiTeams[0]; // Default to SEO team
    
    const taskLower = newTask.toLowerCase();
    if (taskLower.includes('social') || taskLower.includes('post') || taskLower.includes('facebook')) {
      assignedTeam = aiTeams[2]; // Social Media Team
    } else if (taskLower.includes('email') || taskLower.includes('newsletter')) {
      assignedTeam = aiTeams[4]; // Email Team
    } else if (taskLower.includes('ad') || taskLower.includes('campaign')) {
      assignedTeam = aiTeams[3]; // Ads Team
    } else if (taskLower.includes('blog') || taskLower.includes('article') || taskLower.includes('content')) {
      assignedTeam = aiTeams[1]; // Copywriting Team
    }
    
    const newTaskObj: Task = {
      id: `${tasks.length + 1}`,
      name: newTask,
      description: `AI automatically created this task based on your input: "${newTask}"`,
      dueDate: addDays(new Date(), Math.floor(Math.random() * 7) + 1), // Random due date 1-7 days from now
      status: taskStatuses[0], // Start as To Do
      assignedTeam,
      priority: 'medium' as 'high' | 'medium' | 'low',
      created: new Date(),
      autoScheduled: true,
      platform: null,
      publishDate: null,
    };
    
    setTasks([...tasks, newTaskObj]);
    setNewTask('');
  };
  
  // Open add task dialog with form
  const openAddTaskModal = () => {
    // Reset the new task data to defaults
    setNewTaskData({
      name: '',
      description: '',
      dueDate: addDays(new Date(), 3), // Default due date (3 days from now)
      status: taskStatuses[0], // Default to "To Do"
      assignedTeam: aiTeams[0], // Default to SEO team
      priority: 'medium' as 'high' | 'medium' | 'low', // Default priority
      platform: null,
      publishDate: null,
    });
    
    setIsAddTaskModalOpen(true);
  };
  
  // Add a comprehensive new task from modal
  const handleAddTaskFormSubmit = () => {
    if (!newTaskData.name.trim()) return;
    
    // Auto-assign team based on task content if not modified by user
    let assignedTeam = newTaskData.assignedTeam;
    
    // Only auto-assign if the user hasn't changed from the default team
    if (assignedTeam.id === aiTeams[0].id) {
      const taskLower = newTaskData.name.toLowerCase() + ' ' + newTaskData.description.toLowerCase();
      if (taskLower.includes('social') || taskLower.includes('post') || taskLower.includes('facebook')) {
        assignedTeam = aiTeams[2]; // Social Media Team
      } else if (taskLower.includes('email') || taskLower.includes('newsletter')) {
        assignedTeam = aiTeams[4]; // Email Team
      } else if (taskLower.includes('ad') || taskLower.includes('campaign')) {
        assignedTeam = aiTeams[3]; // Ads Team
      } else if (taskLower.includes('blog') || taskLower.includes('article') || taskLower.includes('content')) {
        assignedTeam = aiTeams[1]; // Copywriting Team
      }
    }
    
    const newTaskObj: Task = {
      id: `${tasks.length + 1}`,
      name: newTaskData.name,
      description: newTaskData.description,
      dueDate: newTaskData.dueDate,
      status: newTaskData.status,
      assignedTeam: assignedTeam,
      priority: newTaskData.priority as 'high' | 'medium' | 'low',
      created: new Date(),
      autoScheduled: true,
      platform: newTaskData.platform,
      publishDate: newTaskData.publishDate,
    };
    
    setTasks([...tasks, newTaskObj]);
    setIsAddTaskModalOpen(false);
  };

  // Edit task
  const handleEditTask = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setIsEditModalOpen(false);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Filter tasks by search query
  const filteredTasks = searchQuery 
    ? tasks.filter(task => 
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <SidebarOptimized />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto py-6 px-4 sm:px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Task Manager & Planner</h1>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                AI-powered task management system that automatically assigns the perfect AI team for each task
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input 
                  placeholder="Search tasks..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Sort by Due Date</span>
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>Show Overdue</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <Tabs defaultValue="calendar" className="space-y-6">
              <TabsList className="grid grid-cols-3 w-full max-w-xl mb-6">
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>AI Calendar</span>
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  <span>Task List</span>
                </TabsTrigger>
                <TabsTrigger value="publish" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span>Auto-Publish</span>
                </TabsTrigger>
              </TabsList>
              
              {/* AI Calendar Tab */}
              <TabsContent value="calendar" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>AI Calendar</CardTitle>
                        <CardDescription>View and manage your content tasks and deadlines</CardDescription>
                      </div>
                      <Button 
                        className="flex items-center gap-2" 
                        onClick={openAddTaskModal}
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Add New Task</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CalendarProvider>
                      <div className="flex flex-col h-[600px] border rounded-md overflow-hidden">
                        <CalendarDate>
                          <CalendarDatePicker>
                            <CalendarMonthPicker />
                            <CalendarYearPicker start={2020} end={2030} />
                          </CalendarDatePicker>
                          <CalendarDatePagination />
                        </CalendarDate>
                        <CalendarHeader />
                        <CalendarBody features={tasksToCalendarEvents()}>
                          {({ feature }) => (
                            <div 
                              key={feature.id}
                              className="p-1 text-xs rounded my-1 truncate cursor-pointer"
                              style={{
                                backgroundColor: `${feature.status.color}20`,
                                borderLeft: `3px solid ${feature.status.color}`
                              }}
                              onClick={() => {
                                const task = tasks.find(t => t.id === feature.id);
                                if (task) {
                                  setActiveTask(task);
                                  setIsEditModalOpen(true);
                                }
                              }}
                            >
                              {feature.name}
                            </div>
                          )}
                        </CalendarBody>
                      </div>
                    </CalendarProvider>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Task List Tab */}
              <TabsContent value="tasks" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Task List</CardTitle>
                        <CardDescription>AI-assigned tasks with team recommendations</CardDescription>
                      </div>
                      <div className="flex items-center gap-4">
                        <Button 
                          className="flex items-center gap-2" 
                          onClick={openAddTaskModal}
                        >
                          <PlusCircle className="h-4 w-4" />
                          <span>Add New Task</span>
                        </Button>
                        <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Quick add a task..." 
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            className="min-w-[180px] md:min-w-[300px]"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTask();
                              }
                            }}
                          />
                          <Button onClick={handleAddTask} variant="outline">Quick Add</Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <KanbanProvider onDragEnd={handleDragEnd}>
                      {taskStatuses.map((status) => (
                        <KanbanBoard key={status.id} id={status.id}>
                          <KanbanHeader 
                            name={`${status.name} (${getTasksByStatus(status.id).length})`} 
                            color={status.color} 
                          />
                          <KanbanCards>
                            {filteredTasks
                              .filter(task => task.status.id === status.id)
                              .map((task, index) => (
                                <KanbanCard
                                  key={task.id}
                                  id={task.id}
                                  name={task.name}
                                  parent={status.id}
                                  index={index}
                                  className={isTaskOverdue(task) ? "border-red-300 dark:border-red-800" : ""}
                                >
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <h3 className="font-medium text-sm">{task.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                          {task.description}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="flex items-center gap-1">
                                        <div 
                                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                                          style={{ backgroundColor: `${task.assignedTeam.color}20` }}
                                        >
                                          {task.assignedTeam.icon}
                                        </div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {task.assignedTeam.name}
                                        </span>
                                      </div>
                                      <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                                        {task.priority}
                                      </Badge>
                                    </div>

                                    <div className="flex items-center justify-between mt-1">
                                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                        <CalendarCheck className="h-3 w-3 mr-1" />
                                        {format(task.dueDate, 'MMM dd')}
                                        {isTaskOverdue(task) && (
                                          <span className="text-red-500 ml-1 flex items-center">
                                            <AlertTriangle className="h-3 w-3 mr-1" />
                                            Overdue
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-6 w-6"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveTask(task);
                                            setIsEditModalOpen(true);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-6 w-6 text-red-500"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTask(task.id);
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </KanbanCard>
                              ))}
                          </KanbanCards>
                        </KanbanBoard>
                      ))}
                    </KanbanProvider>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Auto-Publish Tab */}
              <TabsContent value="publish" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <CardTitle>Auto-Publish & Scheduling</CardTitle>
                        <CardDescription>Schedule and publish completed content to platforms</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {getPublishableTasks().length > 0 ? (
                      <div className="space-y-4">
                        {getPublishableTasks().map(task => (
                          <Card key={task.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="flex-1 p-4">
                                <div className="flex items-start gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                                    style={{ backgroundColor: `${task.assignedTeam.color}20` }}
                                  >
                                    {task.assignedTeam.icon}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium">{task.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      {task.description}
                                    </p>
                                    
                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400">
                                        Ready to Publish
                                      </Badge>
                                      
                                      {task.platform ? (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400">
                                          {platforms.find(p => p.id === task.platform)?.icon}{' '}
                                          {platforms.find(p => p.id === task.platform)?.name}
                                        </Badge>
                                      ) : (
                                        <Badge variant="outline">Not Scheduled</Badge>
                                      )}
                                      
                                      {task.publishDate && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                          <CalendarCheck className="h-3 w-3 mr-1" />
                                          Publish: {format(task.publishDate, 'MMM dd, yyyy')}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 md:w-64 flex flex-col justify-center gap-3">
                                <Select defaultValue={task.platform || ''}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {platforms.map(platform => (
                                      <SelectItem key={platform.id} value={platform.id}>
                                        <div className="flex items-center">
                                          <span className="mr-2">{platform.icon}</span>
                                          {platform.name}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <Button className="w-full">Schedule Now</Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Upload className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium">No Content Ready for Publishing</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2 mb-6">
                          Complete your content tasks and they will appear here ready for scheduling
                        </p>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            const tasksTab = document.querySelector('[value="tasks"]') as HTMLElement;
                            if (tasksTab) tasksTab.click();
                          }}
                        >
                          Go to Task List
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {/* Add New Task Modal with comprehensive form */}
      <Dialog open={isAddTaskModalOpen} onOpenChange={setIsAddTaskModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task with advanced options and AI team assignment
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Name</label>
              <Input 
                value={newTaskData.name} 
                onChange={(e) => setNewTaskData({...newTaskData, name: e.target.value})}
                placeholder="Enter a descriptive task name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={newTaskData.description} 
                onChange={(e) => setNewTaskData({...newTaskData, description: e.target.value})}
                placeholder="Describe what needs to be done"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={newTaskData.status.id}
                  onValueChange={(value) => {
                    const newStatus = taskStatuses.find(status => status.id === value);
                    if (newStatus) {
                      setNewTaskData({...newTaskData, status: newStatus});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map(status => (
                      <SelectItem key={status.id} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select 
                  value={newTaskData.priority}
                  onValueChange={(value: 'high' | 'medium' | 'low') => setNewTaskData({...newTaskData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date" 
                  value={format(newTaskData.dueDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    if (e.target.value) {
                      setNewTaskData({...newTaskData, dueDate: new Date(e.target.value)});
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">AI Team Assignment</label>
                <Select 
                  value={newTaskData.assignedTeam.id}
                  onValueChange={(value) => {
                    const newTeam = aiTeams.find(team => team.id === value);
                    if (newTeam) {
                      setNewTaskData({...newTaskData, assignedTeam: newTeam});
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aiTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2 flex items-center justify-center"
                            style={{ backgroundColor: `${team.color}40` }}
                          >
                            {team.icon}
                          </div>
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Publishing Settings</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  value={newTaskData.platform === null ? "no-platform" : newTaskData.platform}
                  onValueChange={(value) => {
                    // Handle type casting safely - let TypeScript know both value and null are valid
                    const platformValue = value === "no-platform" ? null : value;
                    setNewTaskData({
                      ...newTaskData, 
                      platform: platformValue as (string | null)
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-platform">No platform</SelectItem>
                    {platforms.map(platform => (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{platform.icon}</span>
                          {platform.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div>
                  <Input 
                    type="date" 
                    value={newTaskData.publishDate ? format(newTaskData.publishDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const newDate = new Date(e.target.value);
                        setNewTaskData({
                          ...newTaskData, 
                          publishDate: newDate as (Date | null)
                        });
                      } else {
                        setNewTaskData({
                          ...newTaskData, 
                          publishDate: null
                        });
                      }
                    }}
                    placeholder="Select publish date"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddTaskModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddTaskFormSubmit}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Modal */}
      {activeTask && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task details or change AI team assignment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Name</label>
                <Input 
                  value={activeTask.name} 
                  onChange={(e) => setActiveTask({...activeTask, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={activeTask.description} 
                  onChange={(e) => setActiveTask({...activeTask, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={activeTask.status.id}
                    onValueChange={(value) => {
                      const newStatus = taskStatuses.find(status => status.id === value);
                      if (newStatus) {
                        setActiveTask({...activeTask, status: newStatus});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {taskStatuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={activeTask.priority}
                    onValueChange={(value: 'high' | 'medium' | 'low') => setActiveTask({...activeTask, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <Input 
                    type="date" 
                    value={format(activeTask.dueDate, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      if (e.target.value) {
                        setActiveTask({...activeTask, dueDate: new Date(e.target.value)});
                      }
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">AI Team Assignment</label>
                  <Select 
                    value={activeTask.assignedTeam.id}
                    onValueChange={(value) => {
                      const newTeam = aiTeams.find(team => team.id === value);
                      if (newTeam) {
                        setActiveTask({...activeTask, assignedTeam: newTeam});
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{team.icon}</span>
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Publishing</label>
                  <span className="text-xs text-gray-500">Only for completed content</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select 
                    value={activeTask.platform || 'not-scheduled'}
                    onValueChange={(value) => setActiveTask({...activeTask, platform: value === 'not-scheduled' ? null : value})}
                    disabled={activeTask.status.id !== 'completed'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-scheduled">Not scheduled</SelectItem>
                      {platforms.map(platform => (
                        <SelectItem key={platform.id} value={platform.id}>
                          <div className="flex items-center">
                            <span className="mr-2">{platform.icon}</span>
                            {platform.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Input 
                    type="date" 
                    value={activeTask.publishDate ? format(activeTask.publishDate, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setActiveTask({...activeTask, publishDate: new Date(e.target.value)});
                      } else {
                        setActiveTask({...activeTask, publishDate: null});
                      }
                    }}
                    placeholder="Publish date"
                    disabled={activeTask.status.id !== 'completed' || !activeTask.platform}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleEditTask(activeTask)}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}