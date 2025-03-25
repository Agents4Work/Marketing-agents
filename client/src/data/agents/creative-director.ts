import { Lightbulb, Palette, Wand2, Brain, Sparkles, Image, Film, Antenna } from 'lucide-react';
import type { ExtendedAgent } from '../../types/marketplace';

/**
 * Creative Director Agent Profile
 * Following the Agent Profile Standards
 */
export const creativeDirectorAgent: ExtendedAgent = {
  id: 'creative-director',
  name: 'Creative Director',
  category: 'creative',
  description: 'Generates innovative campaign concepts and creative directions that align with brand identity and resonate with target audiences.',
  avatar: '🎨',
  rating: 4.9,
  reviews: 438,
  level: 'Premium',
  compatibility: 97,
  skills: [
    { name: 'Campaign Ideation', level: 98 },
    { name: 'Visual Storytelling', level: 96 },
    { name: 'Brand Voice Development', level: 94 },
    { name: 'Trend Analysis', level: 93 },
    { name: 'Creative Problem Solving', level: 97 },
    { name: 'Cross-Media Concept Creation', level: 95 }
  ],
  primaryColor: 'bg-purple-600',
  secondaryColor: 'from-purple-500 to-indigo-600',
  featured: true,
  trending: true,
  new: false,
  premium: true,
  benefits: [
    'Creates breakthrough campaign concepts that stand out from competitors',
    'Develops consistent creative direction across all marketing channels',
    'Matches creative approaches to target audience preferences',
    'Transforms complex brand messages into engaging creative concepts',
    'Aligns visual and verbal elements for maximum impact'
  ],
  testimonials: [
    {
      name: 'Michael Chen',
      company: 'Elevate Brands',
      avatar: '👨‍💼',
      text: "The Creative Director agent transformed our product launch campaign. We went from safe, predictable concepts to breakthrough ideas that captured attention and drove engagement beyond our targets.",
      rating: 5
    },
    {
      name: 'Sophia Rodriguez',
      company: 'Indie Fashion Label',
      avatar: '👩‍🎨',
      text: "As a small brand, we couldn't afford a high-end agency. This agent delivered creative concepts on par with what I've seen from top firms, helping us compete against bigger competitors.",
      rating: 5
    },
    {
      name: 'James Wilson',
      company: 'Regional Tourism Board',
      avatar: '👨‍✈️',
      text: "We needed fresh eyes on our destination marketing. The Creative Director agent developed a campaign concept that highlighted our region in ways we hadn't considered, significantly increasing visitor interest.",
      rating: 4
    }
  ],
  sampleOutputs: [
    {
      title: 'Campaign Concept: Tech Startup Rebrand',
      content: `# "Boundless" Campaign Concept for NexusAI

## Campaign Concept Overview
NexusAI has been positioned as a technical AI solution provider. This rebrand will transform their identity into an enabler of human creativity and innovation—technology that removes boundaries rather than imposing them.

## Core Creative Idea: "Boundless"
The central campaign theme "Boundless" communicates that NexusAI removes limitations rather than adding another tech layer. This positive framing shifts perception from "yet another AI tool" to "the platform that sets your capabilities free."

## Visual Direction
* **Primary Visual Metaphor:** Boundaries dissolving/transforming
* **Color Evolution:** From contained, structured blues to expansive, vibrant gradients that blend technology (blues, purples) with creativity (oranges, magentas)
* **Typography:** Clean, technical base font juxtaposed with expressive, fluid headline typography
* **Imagery Style:** Split-frame visuals showing "before NexusAI" (constrained, monochromatic, structured) and "after NexusAI" (expansive, colorful, free-flowing)

## Key Visuals
1. **Hero Campaign Image:** A creative professional at a workstation where rigid grid lines around them are dissolving into colorful, flowing energy that extends beyond the frame
2. **Product Interface Visual:** UI mockups showing constrained input transforming into expanded, multi-dimensional output
3. **OOH & Print:** Triptych showing the evolution from structure to boundlessness
4. **Social:** Short animations where boxes, lines and barriers shatter or transform into flowing, expansive forms

## Messaging Framework

### Tagline
"Beyond Boundaries"

### Headlines
* "Your creativity, boundless."
* "AI that expands. Never constrains."
* "What could you create without limits?"
* "The end of creative boundaries."

### Campaign Narrative
"Every revolutionary idea begins with the same moment—when someone refuses to accept the boundaries of what's possible. NexusAI is built for those moments. Not just another tool, but a boundary-breaking platform that transforms the relationship between human creativity and artificial intelligence. When limitations dissolve, innovation thrives. Welcome to boundless creation."

## Channel Expressions

### Website
Homepage redesign featuring a dynamic boundary-breaking animation that responds to cursor movement—walls of code/structure that transform into flowing creative expressions.

### Social
Series of "Boundary Breaker" profiles featuring creative professionals who've used NexusAI to accomplish what was previously impossible in their field.

### Events
Interactive installations where physical barriers respond to participants' movements by transforming into beautiful visual expressions—physical metaphor for the digital experience.

### Content Series
"Boundless Thinking" podcast featuring conversations with innovators who've shattered boundaries in their industries.

## Launch Strategy
1. **Phase 1: Intrigue** - Teaser campaign showing boundaries, constraints, and limitations with minimal branding
2. **Phase 2: Reveal** - Dramatic "breaking free" content revealing the boundless concept and NexusAI rebrand
3. **Phase 3: Demonstrate** - Case studies and interactive demos showing real boundary-breaking applications

## Success Metrics
* Brand perception shift from "technical tool" to "creative enabler" (measured via brand sentiment analysis)
* 40% increase in creative industry audience engagement
* 25% increase in organic social sharing
* 30% increase in demo requests from creative professionals/agencies`,
      type: 'markdown'
    },
    {
      title: 'Visual Brand Identity Concept',
      content: `# Sustainable Cosmetics Brand: Visual Identity System

## Brand Essence: "Consciously Radiant"
Merging natural beauty with environmental responsibility and scientific effectiveness.

## Core Identity Elements

### Logo Concept
A minimal, elegant logomark combining a leaf silhouette that transforms into a water droplet, symbolizing the harmony between nature and science. The logotype features custom typography with subtle organic qualities while maintaining clean, modern lines.

**Lockups:**
* Primary: Horizontal arrangement with logomark + logotype
* Secondary: Stacked version for square applications
* Tertiary: Isolated logomark for icon usage and pattern creation

### Color Palette

**Primary Colors:**
* Sage Green (#8CAA94): Represents the brand's natural foundation
* Clear Aqua (#B4E1E7): Symbolizes purity and scientific clarity
* Soft Clay (#D7C3B7): Connects to earth elements and inclusivity

**Secondary Colors:**
* Fresh Mint (#E4F2EF): For highlights and negative space
* Deep Forest (#3A5149): For depth and contrast moments
* Sunrise Blush (#F5D6C6): For warmth and radiance

**Usage Guidance:**
* Primary packaging: Dominated by Sage Green and Clear Aqua
* Secondary packaging: Incorporates Soft Clay with accent colors
* Digital presence: Full palette with strategic color blocking

### Typography System

**Primary Font: "Botanica"**
* Custom semi-serif that balances organic forms with precise edges
* Weights: Light, Regular, Medium, Bold
* Primary application: Headlines, product names, key messaging

**Secondary Font: "Clarity Sans"**
* Clean, accessible sans-serif for optimal readability
* Weights: Light, Regular, Medium, Bold
* Primary application: Body copy, ingredients lists, instructions

**Tertiary Font: "Essence Script"**
* Handcrafted script for special applications
* Weight: Regular only
* Primary application: Signature phrases, testimonial highlights

### Iconography & Illustration

**Ingredient Icons:**
* Minimalist line-based illustrations of key botanical ingredients
* Two-weight system: light outline for general usage, solid fill for emphasis
* Grid-based construction for consistent sizing and spacing

**Benefit Icons:**
* Circular containment with simple visual metaphors for each product benefit
* Single-weight line style with accent color fills
* Consistent curve radius and line terminations

**Pattern System:**
* Modular set of nature-inspired patterns at three density levels
* Derived from ingredient illustrations and abstracted natural forms
* Applications: packaging liners, digital backgrounds, retail environments

## Application Guidelines

### Packaging System

**Primary Product Structure:**
* Recycled glass primary containers with brushed aluminum caps
* Embossed logo on caps and subtle debossing on glass
* Minimalist silhouettes with slight organic variations between product categories

**Label Design:**
* Predominantly white labels with color-coding by product category
* Generous negative space with precise information hierarchy
* Ingredient callouts with corresponding illustrations

**Secondary Packaging:**
* Recyclable paperboard with seed-embedded accent elements
* Structural design eliminates need for adhesives
* Interior pattern reveals full illustration of key ingredients

### Digital Presence

**Website Architecture:**
* Clean, editorial-inspired layout with abundant white space
* Product photography featured against textured natural backgrounds
* Animation principles: gentle, fluid transitions inspired by natural movements

**Social Identity:**
* Consistent grid system with alternating content types:
  * Product-only compositions
  * Ingredients/process spotlights
  * Lifestyle imagery with subtle brand presence
  * Educational content with iconography system

**Photography Direction:**
* Natural light emphasis with soft diffusion
* Texture contrasts: smooth product surfaces against organic backgrounds
* Color direction emphasizes palette harmony across product and environmental elements

### Environmental Applications

**Retail Concepts:**
* Modular display system using sustainable materials (bamboo, recycled aluminum)
* Living plant elements integrated into display structures
* Testing stations utilize compostable sampling materials

**Event Design:**
* Sensory experience focus: touchable textures, botanical scents
* Interactive elements demonstrating sustainability commitments
* Backdrop system created from recycled packaging materials

## Brand Experience Touchpoints

**Unboxing Experience:**
* Outer packaging unfolds to reveal product story
* No plastic elements, water-soluble protective materials
* Included seed paper with seasonal botanical varieties

**Digital Interaction:**
* Product scanning reveals sourcing journey of key ingredients
* Customizable routine builder with personalized animations
* Virtual try-on technology with skin analysis functionality

**Community Connection:**
* Customer photo platform with consistent editing presets
* Impact visualization showing environmental benefits of purchases
* Transparent manufacturing process documentation`,
      type: 'markdown'
    },
    {
      title: 'Multi-Channel Creative Concept',
      content: `# "Everyday Extraordinary" Concept for HomeChef Meal Service

## Creative Platform
Transform the perception of weeknight cooking from mundane necessity to accessible creative expression. Position HomeChef as the enabler of "everyday extraordinary" moments that elevate the ordinary dinner experience without adding complexity.

## Target Audience Insights
Working professionals and parents (30-45) who:
- Want to provide quality meals but face time constraints
- Enjoy cooking but lack inspiration on weeknights
- Seek moments of accomplishment within routine tasks
- Value experience-creation but require simplicity

## Campaign Elements

### Visual Identity

**Core Visual Principle: "Elevated Simplicity"**
- Clean, uncluttered compositions with unexpected focal elements
- Split-screen visuals contrasting ordinary ingredients with extraordinary outcomes
- Color strategy: Neutral canvas with vibrant "extraordinary" color pops
- Typography: Accessible serif for warmth paired with confident sans for instruction

**Key Visuals:**
1. "Transformation Moments" - Ingredient-to-plate sequences showing simple becoming special
2. "10-Minute Elevation" - Time-lapse captures of quick cooking techniques with stunning results
3. "Everyday Chef" - Authentic home cooking environments with cinematic lighting and framing

### Content Strategy

**Core Content Series:**

1. **"Weeknight Wow"** (Video Series)
   - 30-second tutorials showing single techniques that transform basic dishes
   - Features real customers (not chefs) in actual home kitchens
   - Ends with family/friends reaction shots of genuine appreciation

2. **"Ordinary to Extraordinary"** (Social Campaign)
   - Side-by-side comparisons: typical weeknight meals vs. HomeChef elevated versions
   - Focuses on similar prep time with dramatically different results
   - User-generated content challenge component

3. **"The 5-Minute Upgrade"** (Podcast/Audio)
   - Short-form audio content for in-car/commute listening
   - Each episode focuses on one simple technique, ingredient pairing, or presentation tip
   - Designed for voice assistant integration: "Hey Google, play HomeChef's 5-Minute Upgrade"

### Channel Strategy

**OOH & Print:**
- Location targeting near commuter routes with evening rush hour emphasis
- Sequential billboards showing transformation: "Tonight could be just dinner... or it could be extraordinary"
- Print ads in Sunday publications focusing on week planning moments

**Digital:**
- Pinterest focus with searchable content aligned with "quick dinner ideas" and related queries
- Instagram Stories featuring real-time weeknight cooking sequences
- YouTube pre-roll targeted to recipe searches with "Skip the ordinary, not the ad" messaging

**Direct Experience:**
- Sampling stations at commuter hubs during Thursday/Friday rush hours
- AR-enabled packaging that shows finished dish when scanned
- "Extraordinary Moments" pop-up dining experiences in unexpected locations (office buildings, train stations)

### Messaging Framework

**Tagline:**
"Everyday Extraordinary"

**Key Messages:**
- "The difference is in the details" (highlighting small, manageable techniques)
- "Dinner magic in 25 minutes" (emphasizing time-efficiency)
- "Turn Tuesday into something special" (elevating ordinary moments)
- "Simple ingredients, extraordinary results" (transformation narrative)

**Voice Characteristics:**
- Encouraging without being perfectionist
- Expert but accessible
- Slightly playful while respecting the time constraints

### Campaign Rollout

**Phase 1: Reframe**
- Challenge the binary of "quick and basic" vs. "time-consuming and special"
- Introduce the concept of "everyday extraordinary" through provocative questions
- Highlight pain points of weeknight meal monotony

**Phase 2: Reveal**
- Introduce HomeChef solution with emphasis on simplicity of transformation
- Feature unexpected testimonials from children and partners about weeknight meals
- Launch core content series across channels

**Phase 3: Reinforce**
- Shift to specific meal occasions (Monday motivation, Wednesday refresh)
- Introduce seasonal "extraordinary" elements
- Expand UGC program with weekly showcase of customer creations

**Phase 4: Reward**
- Celebrate consistent "everyday extraordinary" creators
- Introduce community challenges and voting
- Launch limited-edition collaborations with unexpected partners

## Measurement Framework

**Perception Metrics:**
- Shift in association of HomeChef from "convenient" to "creative" and "special"
- Reduction in perception that weeknight cooking is purely functional
- Increase in social sharing of weeknight meals (vs. weekend/special occasion)

**Behavioral Metrics:**
- Increase in weeknight order frequency
- Reduction in subscription pauses/cancellations
- Increase in add-on purchases for "elevation" ingredients

**Engagement Metrics:**
- UGC submission volume and quality
- Content completion rates for tutorials
- Cross-platform engagement consistency

## Innovation Opportunities

**Product Development:**
- "Elevation Kits" - Add-on components that transform multiple meals
- "Technique Tools" - Simple, affordable tools that enable specific techniques
- "Plating Partners" - Unexpected serving vessels/presentation elements

**Experience Extension:**
- Virtual cooking communities based on weeknight schedules
- "Extraordinary Moment" table setting elements
- AR instruction overlays for perfect technique execution

**Partnership Potential:**
- Home lighting companies (simple ambiance creation)
- Spotify (weeknight dinner playlists)
- Quick-clean home products (full experience consideration)`,
      type: 'markdown'
    }
  ],
  compatibleAgents: [
    {
      id: 'social-media-manager',
      name: 'Social Media Manager',
      avatar: '📱',
      compatibility: 96,
      color: 'bg-pink-600'
    },
    {
      id: 'content-planner',
      name: 'Content Strategist',
      avatar: '📅',
      compatibility: 97,
      color: 'bg-green-600'
    }
  ],
  useCases: [
    {
      title: 'Campaign Concept Development',
      description: 'Generate breakthrough creative concepts that align with brand strategy and audience insights.',
      icon: Lightbulb
    },
    {
      title: 'Visual Identity Creation',
      description: 'Develop compelling visual direction for brands, products, and campaigns across all touchpoints.',
      icon: Palette
    },
    {
      title: 'Creative Problem Solving',
      description: 'Transform marketing challenges into innovative opportunities through creative thinking approaches.',
      icon: Wand2
    }
  ],
  performance: {
    conversionRate: 48,
    engagementScore: 92,
    outputQuality: 97,
    creativity: 99,
    consistency: 90
  }
};