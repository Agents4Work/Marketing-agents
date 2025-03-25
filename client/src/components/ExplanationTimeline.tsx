"use client";
import { useMotionValueEvent, useScroll, useTransform, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const ExplanationTimeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  const timelineData: TimelineEntry[] = [
    {
      title: "Replace Your Marketing Team",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Step 1</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Meet Your New AI Workforce</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Imagine firing your entire marketing department and replacing them with AI employees who work 24/7,
            never call in sick, don't need benefits, and execute flawlessly every time.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <span className="font-medium">It's not automation—it's replacement:</span> Each AI agent takes over a specific 
            human role in your marketing team, functioning autonomously while collaborating seamlessly with other specialized AI agents.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="font-medium text-blue-700 dark:text-blue-300 text-sm">Replace Entire Team</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Not just tools—complete workforce replacement</p>
              </div>
            </div>
            <div className="flex items-start p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h5 className="font-medium text-blue-700 dark:text-blue-300 text-sm">Simply Set Goals</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">5-minute setup, then AI handles everything</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Meet Your AI Employees",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">Step 2</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Your Digital Marketing Department</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Just like a human marketing team, our AI platform consists of specialized employees with distinct roles—except 
            they work in perfect synchronization, 24/7/365, without office politics or miscommunication.
          </p>
          
          <div className="space-y-3 mt-5 mb-5">
            <div className="flex items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">AI SEO Specialist</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Researches keywords, optimizes content, and builds backlinks 24/7</div>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">AI Copywriter</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Creates blogs, ads, emails, and social content at scale</div>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">AI Ad Strategist</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Manages budgets, optimizes campaigns, and tests ad variations</div>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">AI Analytics Expert</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Analyzes performance data and recommends optimizations</div>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3 flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">AI Marketing Manager</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Coordinates all AI employees and aligns strategies</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-sm text-purple-800 dark:text-purple-300 mt-4">
            <strong>Key Difference:</strong> Unlike human employees who require direction, our AI workforce automatically collaborates, shares insights, and optimizes campaigns without any management needed.
          </div>
        </div>
      ),
    },
    {
      title: "AI Agent Collaboration",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">Step 3</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Seamless Communication & Coordination</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Unlike human teams with communication gaps, our AI employees share a unified intelligence—the SEO AI instantly feeds 
            insights to the Copywriter AI, which coordinates with the Ad Strategist AI to create perfectly aligned campaigns.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <span className="font-medium">Example:</span> When your SEO AI discovers a trending topic, it automatically briefs the 
            Copywriter AI, which creates optimized content while the Ad Strategist AI prepares promotion campaigns—all within minutes, 
            not days or weeks as with human teams.
          </p>
          
          <div className="relative mt-8 mb-6">
            <div className="flex items-center justify-between relative z-10">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
              </div>
            </div>
            
            {/* Connection lines */}
            <div className="absolute top-7 left-12 right-12 h-1 bg-gray-200 dark:bg-gray-700 z-0"></div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-4">
            <h5 className="font-medium text-green-700 dark:text-green-300 mb-1">Real-Time Decision Making</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The AI agent network makes thousands of micro-decisions per hour, adjusting strategies based on performance without any human input required.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Autonomous Execution",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-red-100 text-red-800 border-red-200">Step 4</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">24/7 Marketing Implementation</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Your AI workforce operates around the clock, executing tasks while you sleep. Unlike human employees who need 
            direction and oversight, our AI employees autonomously:
          </p>
          
          <div className="space-y-3 my-5">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">Researches keywords and competitor strategies</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">Writes, edits, and publishes content across all channels</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">Creates, tests, and optimizes ad campaigns</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">Adjusts budget allocation based on performance data</p>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-gray-700 dark:text-gray-300">Updates strategies based on real-time market changes</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4 border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-700 text-xl font-bold">VS</span>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Human Marketing Team</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Works 40 hours/week, requires management, breaks, vacations, and constant training to stay current
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "AI Decision Engine",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">Step 5</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Superhuman Marketing Intelligence</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Unlike human marketers who rely on limited experience and gut feelings, our AI marketing workforce 
            makes decisions based on analyzing millions of data points and market patterns in real-time.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg my-4">
            <h5 className="font-medium text-amber-700 dark:text-amber-300 mb-2">How AI Makes Better Decisions Than Humans</h5>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 mr-2 flex-shrink-0">1</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Processes vast amounts of data</span> - Analyzes competitor actions, market trends, and customer behavior simultaneously
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 mr-2 flex-shrink-0">2</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">No cognitive biases</span> - Makes decisions based purely on data, not emotions or personal preferences
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 mr-2 flex-shrink-0">3</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Predictive intelligence</span> - Anticipates market shifts before they happen through pattern recognition
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 mr-2 flex-shrink-0">4</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Self-improvement</span> - Gets smarter with every campaign, learning from successes and failures
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mt-4">
            <span className="font-medium">Remember:</span> A human marketing team can only process a tiny fraction of available data and operates with 
            inherent biases. Our AI makes thousands of micro-optimizations per day that humans would never catch.
          </p>
        </div>
      ),
    },
    {
      title: "Your New Marketing Reality",
      content: (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-800">
          <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200">Step 6</Badge>
          <h4 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">A World Without Marketing Employees</h4>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Imagine checking your dashboard each morning to find that while you slept, your AI workforce has already:
          </p>
          
          <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg my-4">
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">Published 5 new optimized blog posts targeted to trending topics</p>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">A/B tested 24 ad variations and shifted budget to top performers</p>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">Identified a new market opportunity and developed a targeted campaign</p>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">Automated responses to social media engagement, increasing follower count</p>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-teal-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 dark:text-gray-300">Prepared a full analytics report with actionable recommendations</p>
              </li>
            </ul>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-red-600">$0</div>
              <div className="text-sm text-gray-600">Overtime Pay</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-red-600">$0</div>
              <div className="text-sm text-gray-600">Benefits</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-red-600">$0</div>
              <div className="text-sm text-gray-600">Turnover Costs</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">Work Hours</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button className="w-full justify-between bg-gradient-to-r from-primary to-primary-dark">
              <span>See Your Potential Savings</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className="w-full bg-gray-50 dark:bg-neutral-950 font-sans md:px-10 relative"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <Badge className="mb-6 px-3 py-1.5 text-base bg-primary/10 text-primary border-primary/20">Replace Your Marketing Team</Badge>
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-black dark:text-white max-w-5xl">
          Fire Your Marketing Department. <br />Hire Our AI Workforce Instead.
        </h2>
        <p className="text-neutral-700 dark:text-neutral-300 text-lg md:text-xl max-w-3xl mb-8">
          Not just automation—a true employee replacement. Our AI agents function as a complete marketing department, 
          working 24/7/365, with no salary, benefits, or management overhead.
        </p>
        <div className="flex flex-wrap gap-4 mb-12">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-gray-800 dark:text-gray-200">Complete workforce replacement</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-gray-800 dark:text-gray-200">True AI employees, not just tools</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-purple-500 mr-2"></div>
            <span className="text-gray-800 dark:text-gray-200">24/7 autonomous execution</span>
          </div>
        </div>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {timelineData.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-primary shadow-lg flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-white dark:bg-white border border-primary dark:border-primary" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl font-bold text-gray-800 dark:text-white">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full md:max-w-2xl">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-gray-800 dark:text-white">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary-500 via-primary-400 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto py-20 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:60px_60px] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Real Workforce Replacement</h3>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black dark:text-white">
              Let AI Replace Your Marketing Employees
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/90 dark:bg-black/50 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-primary mb-2">$0</h3>
                <p className="text-gray-700 dark:text-gray-300">Payroll Costs</p>
              </div>
              <div className="bg-white/90 dark:bg-black/50 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-primary mb-2">24/7</h3>
                <p className="text-gray-700 dark:text-gray-300">Work Hours</p>
              </div>
              <div className="bg-white/90 dark:bg-black/50 rounded-lg p-6 shadow-lg">
                <h3 className="text-2xl font-bold text-primary mb-2">100%</h3>
                <p className="text-gray-700 dark:text-gray-300">Workforce Replacement</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Button size="lg" className="px-8 py-6 text-lg bg-primary hover:bg-primary-dark w-full md:w-auto">
                Replace Your Team Now
              </Button>
              <p className="text-gray-600 dark:text-gray-400 md:ml-4 text-sm">
                Join 2,500+ businesses that have already replaced their marketing employees with our AI workforce
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplanationTimeline;