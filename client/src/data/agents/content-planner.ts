import { Calendar, FileText, TrendingUp, FileCheck, Clock, PenTool } from 'lucide-react';
import type { ExtendedAgent } from '../../types/marketplace';

/**
 * Content Strategist Agent Profile
 * Following the Agent Profile Standards
 */
export const contentPlannerAgent: ExtendedAgent = {
  id: 'content-planner',
  name: 'Content Strategist',
  category: 'content-strategy',
  description: 'Strategic content planning specialist that creates comprehensive content calendars, topic clusters, and publishing schedules aligned with business goals and audience interests.',
  avatar: '📝',
  rating: 4.9,
  reviews: 312,
  level: 'Expert',
  compatibility: 97,
  skills: [
    { name: 'Content Calendar Creation', level: 98 },
    { name: 'Topic Research', level: 95 },
    { name: 'Audience Analysis', level: 94 },
    { name: 'Content Gap Analysis', level: 92 },
    { name: 'Publishing Schedule Optimization', level: 96 },
    { name: 'Cross-Platform Planning', level: 91 }
  ],
  primaryColor: 'bg-green-600',
  secondaryColor: 'from-green-500 to-emerald-600',
  benefits: [
    'Creates strategic content calendars aligned with marketing goals',
    'Develops topic clusters to establish topical authority',
    'Identifies content gaps and opportunities in your industry',
    'Optimizes publishing schedules for maximum engagement',
    'Plans content across multiple platforms and formats'
  ],
  testimonials: [
    {
      name: 'Sarah Johnson',
      company: 'Global Media Group',
      avatar: '👩‍💼',
      text: "The Content Strategist revolutionized our editorial process. We went from chaotic, ad-hoc publishing to a strategic, organized content pipeline that's doubled our engagement.",
      rating: 5
    },
    {
      name: 'Kevin Zhang',
      company: 'Tech Insights Blog',
      avatar: '👨‍💻',
      text: "I was struggling to maintain consistency with my blog. This agent helped me create a realistic publishing schedule and develop content themes that resonate with my audience.",
      rating: 5
    },
    {
      name: 'Melissa Torres',
      company: 'Boutique Marketing Agency',
      avatar: '👩‍🎨',
      text: "We use the Content Strategist for all our clients now. It's drastically reduced our planning time while improving the strategic alignment of content with business goals.",
      rating: 4
    }
  ],
  sampleOutputs: [
    {
      title: 'Quarterly Content Calendar',
      content: `# Q2 2025 Content Calendar: Tech SaaS Company

## APRIL: "Automation Revolution" Theme
| Date | Content Type | Title | Platform | Target Keyword | Goal |
|------|-------------|-------|----------|---------------|------|
| Apr 3 | Blog Post | "10 Tasks Your Team Should Automate Today" | Website, LinkedIn | business process automation | Awareness |
| Apr 7 | Infographic | "Automation ROI Calculator" | Instagram, Twitter | automation savings | Engagement |
| Apr 10 | Case Study | "How ABC Corp Saved 20 Hours/Week with Automation" | Website, Email | workflow automation case study | Consideration |
| Apr 15 | Webinar | "Automation Implementation Blueprint" | LinkedIn, Email | automation implementation steps | Conversion |
| Apr 22 | Video Tutorial | "Setting Up Your First Automated Workflow" | YouTube, Website | automate business workflow | Education |
| Apr 28 | Expert Roundup | "Automation Predictions: 5 Experts Share Their Vision" | Website, LinkedIn | future of business automation | Thought Leadership |

## MAY: "Integration Ecosystem" Theme
| Date | Content Type | Title | Platform | Target Keyword | Goal |
|------|-------------|-------|----------|---------------|------|
| May 5 | Blog Post | "Why Closed Systems Are Limiting Your Growth" | Website, LinkedIn | software integration benefits | Awareness |
| May 8 | Comparison Guide | "Top 15 Integration Platforms Compared" | Website, Email | best integration platforms | Consideration |
| May 12 | Podcast | "The Connected Enterprise" with Jane Smith | Spotify, Website | enterprise system integration | Thought Leadership |
| May 19 | Free Tool | "Integration Compatibility Checker" | Website, ProductHunt | api compatibility tool | Lead Generation |
| May 25 | Video Demo | "Connect Any App in 3 Minutes" | YouTube, LinkedIn | easy application integration | Conversion |
| May 30 | Success Story | "Integration Case Study: Retail Giant" | Website, Email | integration success metrics | Consideration |

## JUNE: "Data-Driven Decisions" Theme
| Date | Content Type | Title | Platform | Target Keyword | Goal |
|------|-------------|-------|----------|---------------|------|
| Jun 3 | White Paper | "The Data-Driven Organization Playbook" | Website, LinkedIn | data-driven decision making | Lead Generation |
| Jun 8 | Interactive Quiz | "How Data-Driven Is Your Company?" | Website, LinkedIn | assess data maturity | Engagement |
| Jun 15 | Webinar | "From Data to Decisions: A Practical Framework" | LinkedIn, Email | data analysis framework | Conversion |
| Jun 18 | Blog Series | "Data Stories: 3 Companies That Transformed Through Analytics" | Website, LinkedIn | business transformation with data | Consideration |
| Jun 23 | Template | "Data Analysis Project Planner" | Website, Email | data project planning | Lead Nurturing |
| Jun 28 | Expert Interview | "The Future of Business Intelligence" with Data Expert | YouTube, Website | business intelligence trends | Thought Leadership |

## Content Distribution Strategy
- Repurpose blog content into LinkedIn carousel posts (1 week after publication)
- Convert webinar recordings into YouTube clips (3-5 min segments)
- Transform infographics into Instagram story series
- Create Twitter thread summaries of long-form content
- Develop email newsletter featuring monthly content highlights

## Performance Measurement Plan
- Track engagement rates across platforms
- Monitor keyword ranking improvements
- Measure conversion rates from content to demo requests
- Analyze time on page for educational content
- Compare lead quality by content source`,
      type: 'markdown'
    },
    {
      title: 'Audience Persona & Content Map',
      content: `# SaaS Product: Audience Persona & Content Map

## Primary Persona: Technical Decision Maker (TDM)

### Demographics & Characteristics
- **Title:** CTO, VP of Engineering, Technical Director
- **Age:** 35-50
- **Industry:** Technology, Finance, Healthcare
- **Company Size:** 200+ employees
- **Technical Knowledge:** High
- **Challenges:**
  - Maintaining system reliability and security
  - Scaling infrastructure efficiently
  - Reducing technical debt
  - Justifying tech investments to non-technical leadership

### Content Journey Map

#### AWARENESS STAGE
*Goal: Introduce problems we solve without being promotional*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| Technical Blog | "Hidden Costs of Legacy Systems" | LinkedIn, Hacker News, Reddit | Long-form article |
| Industry Report | "State of Enterprise Technology 2025" | Email, LinkedIn | Gated PDF |
| Podcast Interview | "Technical Debt: The Silent Innovation Killer" | Tech podcasts, Website | Audio + Transcript |

#### CONSIDERATION STAGE
*Goal: Present our approach and differentiation*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| Comparison Guide | "Build vs. Buy: Calculating the True TCO" | Email, LinkedIn | Interactive Calculator |
| Case Study | "How Company X Reduced Deployment Time by 73%" | Email, Website, Sales Outreach | PDF + Video Testimonial |
| Webinar | "Architecting for Scale: Best Practices" | LinkedIn, Email, Partner Channels | Live + Recording |

#### DECISION STAGE
*Goal: Reduce friction to adoption and prove value*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| Implementation Guide | "90-Day Deployment Roadmap" | Sales Outreach, Website | Detailed PDF |
| ROI Analysis | "Projected 3-Year Returns" | Sales Meetings | Custom Calculator |
| Product Demo | "Platform Capabilities Deep Dive" | Sales Meetings, Website | Interactive Demo |

## Secondary Persona: Business Decision Maker (BDM)

### Demographics & Characteristics
- **Title:** CEO, COO, VP of Operations
- **Age:** 40-55
- **Industry:** Technology, Finance, Healthcare
- **Company Size:** 200+ employees
- **Technical Knowledge:** Moderate to Low
- **Challenges:**
  - Improving operational efficiency
  - Reducing costs
  - Driving innovation
  - Managing digital transformation

### Content Journey Map

#### AWARENESS STAGE
*Goal: Frame business problems we solve in non-technical terms*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| Executive Brief | "Digital Transformation: Beyond the Buzzword" | LinkedIn, Email | Short PDF |
| Thought Leadership | "The Cost of Status Quo in Enterprise Operations" | Forbes, LinkedIn | Article |
| Industry Survey | "Operational Efficiency Benchmark Report" | Email, LinkedIn | Gated Interactive Report |

#### CONSIDERATION STAGE
*Goal: Connect our solution to business outcomes*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| ROI Whitepaper | "Calculating the Business Impact of Operational Efficiency" | Email, LinkedIn | PDF + Calculator |
| Case Study | "How Company Y Achieved 40% Cost Reduction" | Email, Website, Sales Outreach | One-Page PDF |
| Executive Roundtable | "Digital Transformation Success Stories" | Invitation Only Events | In-Person/Virtual |

#### DECISION STAGE
*Goal: Mitigate perceived risk and streamline approval*

| Content Type | Topics | Distribution Channels | Format |
|--------------|--------|------------------------|--------|
| Board Presentation | "Digital Transformation Business Case" | Sales Outreach | PowerPoint Template |
| Implementation Timeline | "30-60-90 Day Roadmap" | Sales Meetings | Visual Timeline |
| Executive Summary | "Executive Briefing: Expected Outcomes" | Sales Meetings | One-Page PDF |

## Content Gap Analysis & Priorities
1. **Missing Mid-Funnel Content:**
   - Technical comparison guides for specific use cases
   - Video testimonials from technical implementers
   
2. **Underdeveloped Channels:**
   - Technical forums (Stack Overflow, GitHub)
   - Industry-specific community engagement
   
3. **Priority Content Development (Next Quarter):**
   - Technical implementation guide series
   - ROI calculator for different company sizes
   - Visual case study portfolio`,
      type: 'markdown'
    },
    {
      title: 'Content Cluster Strategy',
      content: `# Content Cluster Strategy: Cybersecurity Solutions Provider

## PILLAR TOPIC: Zero Trust Architecture

### Core Pillar Content
- **Comprehensive Guide:** "Zero Trust Architecture: The Complete 2025 Implementation Guide"
- **Target Keywords:** zero trust architecture, zero trust security model, zero trust implementation
- **Content Type:** Long-form guide (3000+ words) with downloadable resources
- **URL:** /resources/guides/zero-trust-architecture-implementation

### Cluster 1: Zero Trust Fundamentals
- **Subtopic 1:** "What is Zero Trust? Beyond the Buzzword"
  - Keywords: what is zero trust, zero trust explained, zero trust principles
  - Content Type: Blog post + Infographic
  - Internal Links: Implementation guide, assessment tool
  
- **Subtopic 2:** "Zero Trust vs. Traditional Security Models"
  - Keywords: perimeter security vs zero trust, castle-and-moat security problems
  - Content Type: Comparison article + Table
  - Internal Links: Implementation guide, zero trust benefits

- **Subtopic 3:** "The 5 Pillars of Zero Trust Architecture"
  - Keywords: zero trust components, zero trust framework, zero trust pillars
  - Content Type: Blog post + Downloadable poster
  - Internal Links: Implementation guide, solution page

- **Subtopic 4:** "Zero Trust Architecture: Technical Requirements"
  - Keywords: zero trust technical requirements, zero trust prerequisites
  - Content Type: Technical article + Checklist
  - Internal Links: Implementation guide, assessment tool

### Cluster 2: Implementation & Strategy
- **Subtopic 1:** "Building a Zero Trust Roadmap: 12-Month Plan"
  - Keywords: zero trust roadmap, zero trust strategy, zero trust planning
  - Content Type: Blog post + Downloadable template
  - Internal Links: Implementation guide, consulting services

- **Subtopic 2:** "Zero Trust Identity Management Implementation"
  - Keywords: identity management zero trust, IAM zero trust
  - Content Type: Technical guide + Configuration examples
  - Internal Links: Implementation guide, identity solution page

- **Subtopic 3:** "Microsegmentation Strategies for Zero Trust"
  - Keywords: zero trust microsegmentation, network segmentation zero trust
  - Content Type: Technical article + Architecture diagrams
  - Internal Links: Implementation guide, network solution page

- **Subtopic 4:** "Data Protection in Zero Trust Environments"
  - Keywords: zero trust data protection, data security zero trust model
  - Content Type: White paper + Webinar
  - Internal Links: Implementation guide, data security solution page

### Cluster 3: Business Impact & Case Studies
- **Subtopic 1:** "Zero Trust ROI: Calculating Security Investment Returns"
  - Keywords: zero trust ROI, zero trust business case, security investment returns
  - Content Type: Blog post + ROI Calculator
  - Internal Links: Implementation guide, case studies

- **Subtopic 2:** "Case Study: Financial Services Zero Trust Transformation"
  - Keywords: zero trust case study, financial services zero trust
  - Content Type: Case study + Video testimonial
  - Internal Links: Implementation guide, financial solutions page

- **Subtopic 3:** "Zero Trust for Remote Workforce: Business Benefits"
  - Keywords: remote work zero trust, secure remote access
  - Content Type: Blog post + Infographic
  - Internal Links: Implementation guide, remote work solutions

- **Subtopic 4:** "Compliance & Zero Trust: Meeting Regulatory Requirements"
  - Keywords: zero trust compliance, regulatory requirements zero trust
  - Content Type: White paper + Compliance checklist
  - Internal Links: Implementation guide, compliance solutions page

## Implementation Schedule

| Month | Content Piece | Promotion Channel | Target Metric |
|-------|--------------|-------------------|--------------|
| Jan | Pillar Content | All channels | 1000 downloads |
| Jan | "What is Zero Trust?" | Social, Email | 2500 visits |
| Feb | "Zero Trust vs. Traditional" | Social, Email | 2000 visits |
| Feb | "5 Pillars of Zero Trust" | Social, Email, Webinar | 1800 visits |
| Mar | "Technical Requirements" | Email, Tech Forums | 1200 visits |
| Mar | "Building a Roadmap" | Social, Email | 1500 visits |
| Apr | "Identity Management" | Tech Forums, Email | 1000 visits |
| Apr | "Microsegmentation" | Tech Forums, Partner | 900 visits |
| May | "Data Protection" | Webinar, Email | 1500 visits |
| May | "Zero Trust ROI" | Social, Email | 2000 visits |
| Jun | "Financial Services Case Study" | Social, Email, Sales | 1200 visits |
| Jun | "Remote Workforce" | Social, Email | 1800 visits |
| Jul | "Compliance & Zero Trust" | Email, Webinar | 1500 visits |

## Measurement & Optimization

**KPIs to Track:**
- Organic traffic to cluster content
- Keyword ranking improvements
- Conversion rate to lead magnets
- Internal linking engagement
- Time on page/content engagement

**Quarterly Optimization Plan:**
- Review performance of all cluster content
- Update underperforming content with new research/insights
- Expand high-performing content with additional detail
- Identify new keyword opportunities to add to cluster`,
      type: 'markdown'
    }
  ],
  compatibleAgents: [
    {
      id: 'seo-expert',
      name: 'SEO Expert',
      avatar: '🔍',
      compatibility: 98,
      color: 'bg-green-600'
    },
    {
      id: 'social-media-manager',
      name: 'Social Media Manager',
      avatar: '📱',
      compatibility: 96,
      color: 'bg-pink-600'
    }
  ],
  useCases: [
    {
      title: 'Quarterly Content Calendar',
      description: 'Develop a strategic content plan aligned with business goals and seasonal trends.',
      icon: Calendar
    },
    {
      title: 'Content Cluster Strategy',
      description: 'Create comprehensive topic clusters to establish authority and boost SEO performance.',
      icon: FileText
    },
    {
      title: 'Cross-Platform Content Plan',
      description: 'Plan and coordinate content across websites, social media, email, and other channels.',
      icon: TrendingUp
    }
  ],
  performance: {
    conversionRate: 39,
    engagementScore: 52,
    outputQuality: 97,
    creativity: 90,
    consistency: 95
  }
};