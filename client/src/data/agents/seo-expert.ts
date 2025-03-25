import { FileBarChart, Lightbulb, Link, BarChart2, Search, Rocket, Target } from 'lucide-react';
import type { ExtendedAgent } from '../../types/marketplace';

/**
 * SEO Expert Agent Profile
 * Following the Agent Profile Standards
 */
export const seoExpertAgent: ExtendedAgent = {
  id: 'seo-expert',
  name: 'SEO Expert',
  category: 'seo-optimization',
  description: 'Advanced SEO specialist with expertise in on-page optimization, keyword research, competitive analysis, and search ranking strategies to maximize your content visibility and organic traffic.',
  avatar: '🔍',
  rating: 4.8,
  reviews: 278,
  level: 'Expert',
  compatibility: 95,
  skills: [
    { name: 'Keyword Research', level: 98 },
    { name: 'On-Page SEO', level: 96 },
    { name: 'Technical SEO', level: 94 },
    { name: 'Competitive Analysis', level: 93 },
    { name: 'Content Optimization', level: 91 },
    { name: 'Link Building Strategy', level: 89 }
  ],
  primaryColor: 'bg-green-600',
  secondaryColor: 'from-green-500 to-emerald-600',
  benefits: [
    'Uncovers high-value keywords your competitors are missing',
    'Optimizes content to rank higher in search engine results',
    'Identifies and fixes technical SEO issues hurting performance',
    'Provides data-driven recommendations for content creation',
    'Develops comprehensive SEO strategies for sustainable growth'
  ],
  testimonials: [
    {
      name: 'Michael Roberts',
      company: 'Digital Growth Partners',
      avatar: '👨‍💼',
      text: 'The SEO Expert agent transformed our organic search strategy. We saw a 42% increase in organic traffic within just three months of implementation.',
      rating: 5
    },
    {
      name: 'Jennifer Chen',
      company: 'E-commerce Solutions',
      avatar: '👩‍💻',
      text: 'I was skeptical about AI-driven SEO, but this agent delivered results beyond my expectations. Our product pages now rank in the top 5 for our target keywords.',
      rating: 5
    },
    {
      name: 'David Wilson',
      company: 'Content Studio',
      avatar: '👨‍🎨',
      text: 'The keyword research capabilities alone are worth the investment. We discovered untapped opportunities that our manual research had missed completely.',
      rating: 4
    }
  ],
  sampleOutputs: [
    {
      title: 'Keyword Research Report',
      content: `# SEO Keyword Research Analysis for Fitness Equipment Brand

## High-Value Keyword Opportunities

### Product-Focused Keywords
* home gym equipment (5,400 monthly searches, Medium competition)
* adjustable dumbbells set (4,200 monthly searches, Medium competition)
* affordable rowing machine (2,800 monthly searches, Low competition)
* foldable treadmill small space (1,900 monthly searches, Low competition)

### Informational Content Keywords
* home workout routines no equipment (8,200 monthly searches, Medium competition)
* beginner strength training plan (6,100 monthly searches, Medium competition)
* how to build home gym small budget (3,500 monthly searches, Low competition)
* best cardio exercises for weight loss (7,800 monthly searches, High competition)

## Competitive Gap Analysis
Your competitors are not effectively targeting these valuable keywords:
* space-saving home gym ideas (2,300 monthly searches)
* apartment-friendly exercise equipment (1,800 monthly searches)
* quiet cardio equipment for apartments (1,200 monthly searches)

## Content Recommendations
Based on this analysis, we recommend creating the following optimized content:
1. Ultimate Guide to Building a Space-Saving Home Gym
2. 10 Best Apartment-Friendly Cardio Equipment Options
3. Beginner's Guide to Strength Training at Home`,
      type: 'markdown'
    },
    {
      title: 'On-Page SEO Optimization Plan',
      content: `# On-Page SEO Optimization Plan for "Beginner's Guide to Home Fitness"

## Title Tag Optimization
Current: "Home Fitness Guide for Beginners - FitGear"
Recommended: "Beginner's Guide to Home Fitness: Equipment, Workouts & Tips (2025)"

## Meta Description Optimization
Current: "Learn about home fitness with our guide."
Recommended: "Create the perfect home fitness routine with our beginner's guide. Discover essential equipment, effective workouts, and expert tips to start your fitness journey today."

## Heading Structure Optimization
- H1: "Beginner's Guide to Home Fitness: Everything You Need to Start"
- H2: "Essential Home Fitness Equipment for Beginners"
- H2: "7-Day Starter Workout Plan for Home Training"
- H2: "Common Beginner Mistakes and How to Avoid Them"
- H2: "Nutrition Basics to Support Your Home Fitness Goals"
- H2: "How to Track Progress Without a Gym Trainer"

## Content Gaps to Address
- Add a section comparing budget vs. premium equipment options
- Include expert quotes from certified fitness trainers
- Add a FAQ section addressing common beginner questions
- Create an interactive checklist for setting up a home workout space

## Internal Linking Opportunities
- Link to "Adjustable Dumbbells Product Page" from equipment section
- Link to "Beginner Nutrition Guide" from the nutrition section
- Link to "Fitness Tracking Tools" from the progress section
- Link to "Home Workout Video Library" from the workout plan section`,
      type: 'text'
    },
    {
      title: 'Technical SEO Audit Excerpt',
      content: `# Technical SEO Audit Findings

## Critical Issues
* Page speed below threshold on mobile (Current: 62/100, Target: 85+)
* 23 pages with duplicate meta descriptions
* 8 critical 404 errors from external backlinks
* XML sitemap outdated (missing 34 new product pages)
* No schema markup on product or review pages

## Recommended Fixes (Prioritized)
1. Implement image optimization to improve page speed:
   * Convert all product images to WebP format
   * Implement lazy loading for below-fold images
   * Set explicit width/height attributes to prevent layout shifts

2. Implement product schema markup:
   \`\`\`json
   {
     "@context": "https://schema.org/",
     "@type": "Product",
     "name": "Adjustable Dumbbell Set",
     "description": "Professional-grade adjustable dumbbells with quick weight change system",
     "sku": "ADJ-DB-25",
     "mpn": "9876543",
     "brand": {
       "@type": "Brand",
       "name": "FitGear Pro"
     },
     "review": {
       "@type": "Review",
       "reviewRating": {
         "@type": "Rating",
         "ratingValue": "4.8",
         "bestRating": "5"
       },
       "author": {
         "@type": "Person",
         "name": "JohnD"
       }
     },
     "aggregateRating": {
       "@type": "AggregateRating",
       "ratingValue": "4.7",
       "reviewCount": "89"
     }
   }
   \`\`\`

3. Set up 301 redirects for broken backlink URLs
4. Update XML sitemap and submit to Google Search Console
5. Fix duplicate meta descriptions with unique, keyword-optimized content`,
      type: 'markdown'
    }
  ],
  compatibleAgents: [
    {
      id: 'content-planner',
      name: 'Content Planner',
      avatar: '📝',
      compatibility: 98,
      color: 'bg-indigo-600'
    },
    {
      id: 'analytics-advisor',
      name: 'Analytics Advisor',
      avatar: '📊',
      compatibility: 95,
      color: 'bg-amber-600'
    }
  ],
  useCases: [
    {
      title: 'Full SEO Content Audit',
      description: 'Comprehensive analysis of your existing content with actionable recommendations for SEO improvement.',
      icon: FileBarChart
    },
    {
      title: 'Keyword Strategy Development',
      description: 'Data-driven keyword research and targeting plan tailored to your industry and business goals.',
      icon: Target
    },
    {
      title: 'Competitor SEO Analysis',
      description: 'Detailed breakdown of competitor strategies with opportunities to outrank them in search results.',
      icon: BarChart2
    }
  ],
  performance: {
    conversionRate: 35,
    engagementScore: 48,
    outputQuality: 96,
    creativity: 88,
    consistency: 97
  }
};