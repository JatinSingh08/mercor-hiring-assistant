# 🧠 RecruitAI - AI-Powered Hiring Assistant

> **Transform your hiring process from guesswork to data-driven decisions with intelligent candidate scoring, smart filtering, and automated team building.**

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.1.3-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🚀 Features

### 🎯 **AI-Powered Candidate Scoring**
- **Intelligent Weighting System**: Customizable scoring based on skill match, role relevance, education, salary efficiency, and recency
- **Real-time Calculations**: Instant score updates as you adjust parameters
- **Performance Optimization**: Efficient processing of large datasets (1000+ candidates) without lag

### 🔍 **Smart Skills Filtering**
- **Automatic Categorization**: Skills organized into Frontend, Backend, DevOps, Testing, and Other
- **Collapsible Interface**: Clean, organized sidebar with expandable skill sections
- **Real-time Filtering**: Instantly filter candidates based on selected skills
- **Ant Design Integration**: Professional checkbox components for enhanced UX

### 🏗️ **Intelligent Team Building**
- **Constraint Management**: Set team size, location limits, and budget constraints
- **AI Recommendations**: Automatically suggests optimal team combinations
- **Manual Override**: Pick candidates manually while maintaining AI optimization
- **Team Analytics**: Real-time insights into skills coverage and location distribution

### 📊 **Advanced Candidate Management**
- **Rich Candidate Cards**: Comprehensive profiles with skills, experience, education, and AI reasoning
- **Fixed Dimensions**: Uniform card sizes with scrollable content for consistency
- **Hover Indicators**: Visual cues for scrollable content areas
- **Responsive Design**: Mobile-first approach with touch-friendly interactions

### 📤 **Professional Export System**
- **Excel Export**: Generate comprehensive reports with all candidate details
- **Team Summary**: Includes total costs, skills matrix, and location analysis
- **Auto-formatted**: Professional spreadsheet ready for stakeholders
- **Date-stamped Files**: Organized file naming for easy record keeping

### 🎨 **Modern UI/UX**
- **Beautiful Design**: Gradient backgrounds, smooth animations, and professional aesthetics
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Independent Scrolling**: Sidebar and main content scroll separately for better navigation
- **Performance Optimized**: Debounced inputs, memoized calculations, and efficient rendering

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **Build Tool**: Vite
- **UI Components**: Ant Design + Custom Components
- **Icons**: Lucide React
- **Excel Export**: SheetJS (xlsx)
- **State Management**: React Hooks (useState, useMemo, useCallback)
- **Performance**: Debouncing, Memoization, RequestIdleCallback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mercor-hiring-assistant.git
cd mercor-hiring-assistant

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Load Candidate Data**: Paste JSON data in the Dataset section
2. **Configure Weights**: Adjust scoring parameters based on your priorities
3. **Set Constraints**: Define team size, budget, and location requirements
4. **Filter Skills**: Select relevant skills to narrow down candidates
5. **Build Team**: Pick candidates manually or use AI recommendations
6. **Export Results**: Generate Excel reports for stakeholders

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── CandidateCard.tsx    # Individual candidate display
│   ├── SkillsFilter.tsx     # Skills filtering interface
│   ├── TeamSummary.tsx      # Team analytics display
│   └── ui/                  # Reusable UI components
├── lib/                 # Core business logic
│   ├── scoring.ts       # AI scoring algorithms
│   ├── team.ts          # Team building logic
│   ├── utils.ts         # Utility functions
│   └── constant.ts      # Default configurations
├── types/               # TypeScript type definitions
├── hooks/               # Custom React hooks
└── App.tsx             # Main application component
```

## 🎯 Key Algorithms

### Candidate Scoring
```typescript
Score = (skillMatch × 0.4) + (roleRelevance × 0.25) + 
        (education × 0.1) + (salaryEfficiency × 0.15) + 
        (recency × 0.1)
```

### Team Optimization
- **Greedy Algorithm**: Selects candidates with highest scores while respecting constraints
- **Constraint Satisfaction**: Ensures team size, budget, and location limits are met
- **Skills Coverage**: Maximizes diversity of skills within the team

## ⚙️ Configuration

### Scoring Weights
```typescript
const DEFAULT_WEIGHTS = {
  skillMatch: 0.4,        // Skills alignment
  roleRelevance: 0.25,    // Experience relevance
  education: 0.1,         // Academic background
  salaryEfficiency: 0.15, // Value for money
  recency: 0.1            // Experience recency
};
```

### Team Constraints
```typescript
const DEFAULT_CONSTRAINTS = {
  teamSize: 5,            // Number of team members
  maxPerLocation: 2,      // Max candidates per location
  minLocations: 3,        // Minimum locations covered
  budget: null            // Optional budget limit
};
```

## 📱 Responsive Design

- **Desktop**: Full sidebar + main content layout
- **Tablet**: Collapsible sidebar with touch gestures
- **Mobile**: Hamburger menu with slide-out navigation
- **Touch Optimized**: Large touch targets and smooth scrolling

## 🚀 Performance Features

- **Debounced Inputs**: Prevents excessive API calls during typing
- **Memoized Calculations**: Caches expensive computations
- **Chunked Processing**: Handles large datasets efficiently
- **RequestIdleCallback**: Utilizes browser idle time for background tasks
- **Optimized Rendering**: React.memo and useCallback for component optimization

## 🔒 Data Privacy

- **Client-side Processing**: All data processing happens locally
- **No External APIs**: No candidate data sent to third-party services
- **Secure Export**: Excel files generated locally with no data transmission

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Build project
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Ant Design** for professional UI components
- **Lucide** for beautiful icons
- **SheetJS** for Excel export functionality

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/recruit-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/recruit-ai/discussions)
- **Email**: support@recruitai.com

---

**Made with ❤️ by the RecruitAI Team**

*Transform your hiring process today with AI-powered intelligence!* 🚀
