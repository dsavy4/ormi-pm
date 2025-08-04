# 🎯 **COMPREHENSIVE TEAM MANAGEMENT RECREATION PROMPT**

## 🎨 **VISION: SURPASS DOORLOOP 100X FOLD**

Create the most advanced Team Management system in the property management industry, combining enterprise-grade functionality with professional UX that exceeds DoorLoop's capabilities by 100x. This system must handle comprehensive team management, property assignments, performance analytics, and professional workflows.

**🌐 ROUTE: `/team` (not `/managers`)**

---

## 🏗️ **CORE ARCHITECTURE REQUIREMENTS**

### **📱 RESPONSIVE DESIGN EXCELLENCE**
- **Mobile-First Approach**: Perfect mobile experience with touch-optimized interfaces
- **Desktop Optimization**: Utilize large screens effectively with intelligent layouts
- **Dark/Light Mode**: Complete theme support with professional color schemes
- **Accessibility**: WCAG AA compliance throughout all components
- **Performance**: Sub-200ms interactions, sub-3 second initial loads

### **🎨 PROFESSIONAL UX STANDARDS**
- **ShadCN UI Components**: Exclusive use of ShadCN components for consistency
- **Gradient Icons**: Professional gradient backgrounds for all step icons (exact Properties.tsx pattern)
- **Smooth Animations**: Framer Motion for fluid transitions and micro-interactions
- **Professional Typography**: Clear hierarchy with proper contrast ratios
- **Intelligent Defaults**: Smart pre-filling and contextual suggestions
- **Sheet Component**: Use Sheet (not Dialog) for wizard - exact Properties.tsx pattern
- **Responsive Width**: `w-full sm:w-[45%] md:w-[40%]` - exact Properties.tsx pattern

---

## 👥 **TEAM DASHBOARD - TEAM MANAGEMENT**

### **🎯 DASHBOARD HEADER (EXACT FROM SCREENSHOT)**
- **Title**: "Team Management" with "0 members" badge
- **Subtitle**: "Manage your property management team and track performance"
- **Instructions**: "Press K to search A to select all %N to add team member"
- **Action Buttons**: "Filters", "Export", "Add Team Member" (green button)
- **URL**: `https://app.ormi.com/team`

### **📊 COMPREHENSIVE METRICS CARDS**
```typescript
interface ManagerMetrics {
  totalMembers: number;
  activeMembers: number;
  avgOccupancy: number;
  satisfaction: number;
  properties: number;
  avgSalary: number;
  experience: number;
}
```

**Required Metrics Display (EXACT FROM SCREENSHOT):**
- **Total Members**: "0" with "0 active" subtitle + Users icon
- **Avg Occupancy**: "0%" with progress bar visualization + Building icon
- **Satisfaction**: "0/5" with "Team average" subtitle + Star icon
- **Properties**: "0" with "Under management" subtitle + Building icon
- **Avg Salary**: "$0" with "Annual" subtitle + DollarSign icon
- **Experience**: "0" with "Years average" subtitle + Clock icon

**Card Styling**: Use exact Properties.tsx Card pattern with `card-hover` class

### **🔍 ADVANCED FILTERING SYSTEM (EXACT PROPERTIES.TSX PATTERN)**
- **Search Bar**: "Search team members..." with real-time filtering
- **Role Filter**: "All Roles" dropdown (Property Manager, Assistant Manager, Maintenance Staff, Accounting Staff, Leasing Agent, Regional Manager, Senior Manager)
- **Status Filter**: "All Status" dropdown (Active, Inactive, Pending)
- **View Options**: Grid/List/Tile toggle with sort functionality
- **Results Counter**: "X of Y team members" display
- **Advanced Filters**: Department, hire date range, salary range, experience level
- **Sort Options**: Name, role, status, hire date, performance rating

**Advanced Filters Interface:**
```tsx
interface AdvancedTeamFilters {
  search: string;
  role: string[];
  status: string[];
  department: string[];
  performanceRange: [number, number];
  propertyCountRange: [number, number];
  hireDateRange: {
    from?: Date;
    to?: Date;
  };
  location: string[];
  includeInactive: boolean;
}
```

**Filter Sheet Component:**
- **Advanced Filters Sheet**: Right-side drawer with all filter options
- **Filter Presets**: Save and load common filter combinations
- **Clear All Filters**: One-click filter reset
- **Active Filter Count**: Show number of active filters
- **Filter Chips**: Visual representation of active filters
- **Real-time Updates**: Filters apply immediately

**Filter Features:**
- **Smart Search**: Fuzzy search with highlighting
- **Multi-select Filters**: Select multiple values per filter
- **Range Sliders**: Performance and property count ranges
- **Date Pickers**: Professional date range selection
- **Filter Persistence**: Remember user's filter preferences

### **📋 EMPTY STATE DESIGN (EXACT FROM SCREENSHOT)**
- **Professional Empty State**: Two person silhouettes with green plus icon
- **Title**: "Build Your Dream Team"
- **Description**: "Start by adding your first team member. Manage roles, track performance, and streamline property assignments all in one place."
- **Call-to-Action**: "Add First Team Member" button (blue button, not green)

**Empty State Layout**: Center-aligned with large icon, title, description, and prominent CTA button

### **📋 TEAM MEMBERS TABLE VIEW**
**Table Columns:**
- **Team Member**: Avatar, name, email
- **Role**: Role badge with color coding (exact current pattern)
- **Status**: Status badge with color coding (exact current pattern)
- **Properties**: Number of assigned properties
- **Performance**: Occupancy rate with progress bar
- **Contact**: Email and phone action buttons
- **Actions**: Dropdown menu with View, Edit, Assign Properties, Send Message, View Performance, Deactivate

### **🎯 MULTIPLE VIEW MODES (EXACT PROPERTIES.TSX PATTERN)**
**View Mode Types:**
- **Grid View**: Card-based layout with team member cards
- **List View**: Compact table layout with detailed information
- **Tile View**: Large tile layout with performance metrics

**View Mode Toggle (ToggleGroup Component):**
```tsx
<ToggleGroup type="single" value={viewMode} onValueChange={handleViewModeChange}>
  <ToggleGroupItem value="grid" aria-label="Grid view">
    <Grid className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="list" aria-label="List view">
    <List className="h-4 w-4" />
  </ToggleGroupItem>
  <ToggleGroupItem value="tile" aria-label="Tile view">
    <Grid3X3 className="h-4 w-4" />
  </ToggleGroupItem>
</ToggleGroup>
```

**View Mode Features:**
- **Smooth Transitions**: Framer Motion animations between views
- **Responsive Design**: Mobile-optimized for each view mode
- **State Persistence**: Remember user's preferred view mode
- **Performance**: Optimized rendering for each view type

**Table Features:**
- **Row Selection**: Checkbox selection for bulk operations
- **Sorting**: Click column headers to sort
- **Pagination**: Page navigation for large datasets
- **Bulk Actions**: Select multiple team members for bulk operations
- **Dark/Light Mode**: All colors work in both themes

### **📊 SORTING & PAGINATION (EXACT PROPERTIES.TSX PATTERN)**
**Sort Options:**
```tsx
type SortOption = 'name-asc' | 'name-desc' | 'role-asc' | 'role-desc' | 'status-asc' | 'status-desc' | 'hireDate-asc' | 'hireDate-desc' | 'performance-asc' | 'performance-desc' | 'properties-asc' | 'properties-desc' | 'recent' | 'oldest';
```

**Sort Features:**
- **Column Sorting**: Click any column header to sort
- **Multi-level Sorting**: Sort by multiple columns
- **Sort Indicators**: Visual arrows showing sort direction
- **Sort Persistence**: Remember user's sort preferences
- **Smart Defaults**: Default sort by name ascending

**Pagination Features:**
- **Page Size Options**: 10, 25, 50, 100 items per page
- **Page Navigation**: Previous/Next with page numbers
- **Jump to Page**: Direct page number input
- **Results Counter**: "Showing X-Y of Z team members"
- **Load More**: Optional infinite scroll for mobile

### **👤 TEAM MEMBER DETAILS VIEW**
**Team Member Profile Sheet:**
- **Header**: Avatar, name, role, status
- **Contact Information**: Email, phone, address
- **Employment Details**: Department, hire date, salary, benefits
- **Performance Metrics**: Occupancy rate, response time, satisfaction, collection rate
- **Assigned Properties**: List with property details and unassign option
- **Recent Activity**: Timeline of recent actions
- **Permissions**: Visual permission matrix
- **Actions**: Edit, Assign Properties, Send Message, Deactivate

**Professional Features:**
- **Performance Charts**: Visual performance analytics
- **Property Map**: Visual property location map
- **Activity Timeline**: Chronological activity feed
- **Document Management**: Upload and manage manager documents
- **Dark/Light Mode**: All colors work in both themes

---

## 🎯 **5-STEP MANAGER WIZARD SYSTEM**

### **TECHNICAL IMPLEMENTATION PATTERN**
**Must follow exact Properties.tsx pattern:**

```typescript
// Wizard step configuration - EXACT PATTERN
const TEAM_WIZARD_STEPS = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Basic contact and personal details',
    icon: User,
    schema: step1Schema,
  },
  {
    id: 2,
    title: 'Profile & Photo',
    description: 'Professional profile and photo',
    icon: Camera,
    schema: step2Schema,
  },
  {
    id: 3,
    title: 'Role & Permissions',
    description: 'Role assignment and access permissions',
    icon: Shield,
    schema: step3Schema,
  },
  {
    id: 4,
    title: 'Employment Details',
    description: 'Employment information and compensation',
    icon: DollarSign,
    schema: step4Schema,
  },
  {
    id: 5,
    title: 'Property Assignment & Review',
    description: 'Property assignment and final review',
    icon: CheckCircle2,
    schema: step5Schema,
  },
];

### **🎯 STEP ICONS & PROGRESS INDICATOR (EXACT PROPERTIES.TSX PATTERN)**
**Each step has its own icon with exact Properties.tsx styling:**
- **Step 1**: `User` icon (personal information)
- **Step 2**: `Camera` icon (profile & photo)
- **Step 3**: `Shield` icon (role & permissions)
- **Step 4**: `DollarSign` icon (employment details)
- **Step 5**: `CheckCircle2` icon (property assignment & review)

**Progress Indicator Features:**
- **Circular step buttons** with gradient backgrounds
- **Completed steps** show `CheckCircle2` icon
- **Current step** has animated border and shadow
- **Future steps** are disabled with gray styling
- **Step labels** below each circle
- **Progress bar** showing completion percentage
- **Click navigation** to previous steps only

**Exact Progress Indicator Pattern:**
```tsx
{TEAM_WIZARD_STEPS.map((step, index) => (
  <div key={step.id} className="flex items-center">
    <div className="relative">
      <button
        onClick={() => handleStepClick(step.id)}
        disabled={step.id > currentStep}
        className={`relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-300 transform hover:scale-105 ${
          step.id < currentStep 
            ? 'bg-primary border-primary text-white cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/25' :
          step.id === currentStep 
            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25' :
          'bg-card border-gray-300 text-gray-400 cursor-not-allowed hover:scale-100'
        }`}
      >
        {step.id < currentStep ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : (
          <step.icon className="h-6 w-6" />
        )}
        {step.id === currentStep && (
          <div className="absolute -inset-2 rounded-full border-2 border-primary/20"></div>
        )}
      </button>
      
      {/* Step label */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-24 text-center">
        <div className={`text-xs font-medium transition-colors duration-200 ${
          step.id <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-400'
        }`}>
          {step.title}
        </div>
      </div>
    </div>
    
    {/* Connector line */}
    {index < TEAM_WIZARD_STEPS.length - 1 && (
      <div className="flex-1 h-0.5 bg-gray-200 mx-4 relative">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: step.id < currentStep ? '100%' : '0%' }}
        />
      </div>
    )}
  </div>
))}
```
```

### **STEP 1: PERSONAL INFORMATION** 
**Title**: "Add New Team Member" with "Step 1 of 5: Personal information and contact details"

**Required Fields:**
- **First Name***: Text input with validation (min 2 chars, max 50)
- **Last Name***: Text input with validation (min 2 chars, max 50)
- **Email Address***: Email input with uniqueness validation and format checking
- **Phone Number**: Phone input with formatting (+1 (555) 123-4567 pattern)

**Professional Features:**
- **Progress Bar**: "Step 1 of 5" with "20% Complete"
- **Step Icons**: 5 circular icons with gradient backgrounds
- **Validation**: Real-time field validation with professional error states
- **Navigation**: "Cancel" and "Next →" buttons with proper states
- **Dark/Light Mode**: All colors work in both themes
- **Form Persistence**: Save form state during navigation

**Exact Properties.tsx Styling Pattern:**
```tsx
// Step header with gradient icon and number badge
<div className="text-center">
  <div className="relative inline-flex">
    <div className="p-4 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
      <User className="h-16 w-16 text-blue-600 dark:text-blue-400" />
    </div>
    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
      <span className="text-white text-xs font-bold">1</span>
    </div>
  </div>
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Personal Information</h2>
  <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">Let's start with the basic contact information for your new team member.</p>
</div>

// Form container with card styling
<div className="bg-card rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

// Input styling with error states
<Input
  {...form.register('firstName')}
  placeholder="e.g., John"
  className={`h-12 text-base transition-all duration-200 ${
    formErrors.firstName 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
      : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 hover:border-gray-300'
  }`}
/>

// Error message styling
{formErrors.firstName && (
  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-700 flex items-center gap-2">
      <AlertTriangle className="h-4 w-4" />
      {formErrors.firstName.message}
    </p>
  </div>
)}
```

### **STEP 2: PROFILE & PHOTO**
**Title**: "Step 2 of 5: Professional profile and photo"

**Required Fields:**
- **Profile Photo**: Drag-and-drop upload with Cloudflare R2 integration (exact Properties.tsx image upload pattern)
- **Professional Bio**: Rich text area for manager description (max 500 chars)
- **Department**: Dropdown selection (Property Management, Maintenance, Accounting, Leasing, Administration)
- **Hire Date**: Date picker with professional styling (cannot be future date)
- **Employment Status**: Full-time/Part-time/Contract/Intern selection

**Advanced Features:**
- **Avatar Preview**: Real-time image preview with cropping
- **File Validation**: Image type and size validation (5MB max, jpg/png/gif only)
- **R2 Integration**: Direct upload to Cloudflare R2 storage
- **Professional Styling**: Gradient backgrounds and smooth animations
- **useDropzone Integration**: Exact Properties.tsx dropzone pattern
- **Dark/Light Mode**: All colors work in both themes
- **Form Validation**: Real-time validation with error states

### **STEP 3: ROLE & PERMISSIONS**
**Title**: "Step 3 of 5: Role assignment and access permissions"

**Role Selection:**
- **Property Manager**: Full property management access
- **Assistant Manager**: Limited property access, no financial data
- **Maintenance Staff**: Maintenance and vendor management
- **Accounting Staff**: Financial data and reporting access
- **Leasing Agent**: Tenant management and leasing only
- **Regional Manager**: Multi-property oversight
- **Senior Manager**: Advanced permissions and reporting

**Permission Granularity (ProCheckbox Components):**
- **Property Management**: ProCheckbox for property access control
- **Tenant Management**: ProCheckbox for tenant creation/editing
- **Maintenance Management**: ProCheckbox for maintenance request access
- **Financial Access**: ProCheckbox for financial data visibility
- **Reporting Access**: ProCheckbox for analytics and reports
- **User Management**: ProCheckbox for managing other team members

**Access Level Selection:**
- **Basic**: Limited access to assigned properties only
- **Standard**: Access to all properties and basic reports
- **Advanced**: Full access with advanced analytics
- **Admin**: Complete system access

**Professional Features:**
- **Role Templates**: Pre-built templates for quick setup
- **Permission Preview**: Visual representation of access levels
- **Dark/Light Mode**: All colors work in both themes
- **Real-time Updates**: Permission changes update immediately

**Exact Properties.tsx Select Pattern:**
```tsx
// Role selection with icons
<Select 
  value={form.watch('role')} 
  onValueChange={(value) => form.setValue('role', value as any)}
>
  <SelectTrigger className={`h-12 text-base transition-all duration-200 ${
    formErrors.role 
      ? 'border-red-300 focus:border-red-500' 
      : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
  }`}>
    <SelectValue placeholder="Select manager role" />
  </SelectTrigger>
  <SelectContent>
    {ROLE_OPTIONS.map(role => (
      <SelectItem key={role.value} value={role.value} className="py-3">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 rounded">
            <role.icon className="h-4 w-4 text-blue-600" />
          </div>
          <span className="font-medium">{role.label}</span>
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Permission checkboxes with ProCheckbox
<div className="space-y-4">
  <div className="flex items-center space-x-3">
    <ProCheckbox
      id="canManageProperties"
      checked={form.watch('canManageProperties')}
      onCheckedChange={(checked) => form.setValue('canManageProperties', checked)}
    />
    <label htmlFor="canManageProperties" className="text-sm font-medium">
      Property Management
    </label>
  </div>
  {/* Repeat for all permissions */}
</div>
```

### **STEP 4: EMPLOYMENT DETAILS**
**Title**: "Step 4 of 5: Employment information and compensation"

**Employment Fields:**
- **Salary**: Currency input with proper formatting ($0.00 pattern)
- **Benefits Package**: Multi-select options (Health, Dental, Vision, 401k, PTO, etc.)
- **Emergency Contact Name**: Text input (required if emergency contact phone provided)
- **Emergency Contact Phone**: Phone input with formatting
- **Address**: Professional address input (street, city, state, zip)

**Advanced Features:**
- **Salary Calculator**: Real-time calculations and market comparisons
- **Benefits Preview**: Visual benefits package display with icons
- **Address Validation**: Real-time address validation
- **Validation**: Comprehensive form validation with error states
- **Dark/Light Mode**: All colors work in both themes
- **Currency Formatting**: Automatic currency formatting and validation

**Exact Properties.tsx Benefits Selection Pattern:**
```tsx
// Benefits multi-select with badges (like tags in Properties)
<div>
  <label className="block text-sm font-semibold text-foreground mb-3">Benefits Package</label>
  <div className="flex flex-wrap gap-2 mb-4">
    {form.watch('benefits').map((benefit: string, index: number) => (
      <Badge 
        key={index} 
        variant="secondary" 
        className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
      >
        <CheckCircle className="h-3 w-3" />
        {benefit}
        <button
          type="button"
          onClick={() => {
            const benefits = form.getValues('benefits');
            form.setValue('benefits', benefits.filter((_: string, i: number) => i !== index));
          }}
          className="ml-1 hover:text-red-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    ))}
  </div>
  <Select 
    value="" 
    onValueChange={(value) => {
      const benefits = form.getValues('benefits');
      if (!benefits.includes(value)) {
        form.setValue('benefits', [...benefits, value]);
      }
    }}
  >
    <SelectTrigger className="h-12 text-base border-gray-200 focus:border-blue-500 hover:border-gray-300">
      <SelectValue placeholder="Add benefits to the package" />
    </SelectTrigger>
    <SelectContent>
      {BENEFITS_OPTIONS.filter(benefit => !form.watch('benefits').includes(benefit)).map(benefit => (
        <SelectItem key={benefit} value={benefit} className="py-3">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-100 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-medium">{benefit}</span>
          </div>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

### **STEP 5: PROPERTY ASSIGNMENT & REVIEW**
**Title**: "Step 5 of 5: Property assignment and final review"

**Property Assignment:**
- **Available Properties**: Multi-select with search and filtering
- **Workload Visualization**: Visual property distribution with capacity indicators
- **Capacity Management**: Prevent overloading managers (max 10 properties per manager)
- **Assignment Rules**: Automated assignment suggestions based on workload
- **Property Details**: Show property name, units, and current occupancy

**Review Section:**
- **Summary Display**: Complete manager information review (exact Properties.tsx Step5Review pattern)
- **Property List**: Assigned properties with details and unassign option
- **Permission Summary**: Clear permission overview with visual indicators
- **Final Confirmation**: Professional confirmation dialog
- **Edit Step Functionality**: Allow editing previous steps from review (exact Properties.tsx pattern)
- **Dark/Light Mode**: All colors work in both themes
- **Form Validation**: Final validation before submission

---

## 🏢 **PROPERTY ASSIGNMENT SYSTEM**

### **🎯 DRAG-AND-DROP ASSIGNMENT**
- **Visual Interface**: Interactive property assignment board
- **Workload Indicators**: Color-coded capacity management
- **Real-time Updates**: Instant assignment feedback
- **Batch Operations**: Multi-property assignment capabilities

### **⚖️ INTELLIGENT WORKLOAD BALANCING**
- **Property Count Balancing**: Distribute by number of properties
- **Unit Count Balancing**: Balance by total units managed
- **Revenue Balancing**: Consider property revenue distribution
- **Geography Balancing**: Optimize for location proximity

### **🔧 ASSIGNMENT RULES ENGINE**
- **Skill-Based Assignment**: Match manager expertise to property type
- **Experience-Based Assignment**: Consider manager experience level
- **Performance-Based Assignment**: Assign based on historical performance
- **Availability-Based Assignment**: Consider manager availability

---

## 📊 **COMPREHENSIVE PERFORMANCE ANALYTICS**

### **📈 PERFORMANCE DASHBOARDS**
- **Occupancy Rate Trending**: Historical occupancy analysis
- **Revenue Performance**: Revenue tracking and trending
- **Maintenance Response Time**: Response time analytics
- **Tenant Satisfaction**: Satisfaction scoring and trends
- **Collection Rate Analysis**: Rent collection performance
- **Goal Achievement**: Performance vs targets tracking

### **📊 COMPARATIVE ANALYTICS**
- **Peer Comparison**: Compare with similar portfolios
- **Historical Comparison**: Current vs historical performance
- **Team Benchmarking**: Team-wide performance analysis
- **Industry Benchmarks**: Industry standard comparisons

### **🚨 PERFORMANCE ALERTS**
- **Threshold Alerts**: Automated performance monitoring
- **Goal Notifications**: Achievement and miss notifications
- **Trend Analysis**: Negative trend detection
- **AI Recommendations**: Proactive improvement suggestions

---

## 🔐 **ADVANCED ROLES & PERMISSIONS**

### **👑 ROLE HIERARCHY SYSTEM**
```typescript
interface ManagerRole {
  id: string;
  name: string;
  permissions: Permission[];
  accessLevel: 'BASIC' | 'STANDARD' | 'ADVANCED' | 'ADMIN';
  canManageProperties: boolean;
  canManageTenants: boolean;
  canManageMaintenance: boolean;
  canViewReports: boolean;
  canManageTeam: boolean;
  canAccessFinancial: boolean;
}
```

### **🔒 GRANULAR PERMISSION CONTROL**
- **Property Access**: Control which properties each manager can access
- **Tenant Management**: Control tenant creation, editing, and communication
- **Maintenance Management**: Control maintenance request and vendor access
- **Financial Access**: Control access to financial data and reports
- **Reporting Access**: Control analytics and reporting permissions
- **Team Management**: Control ability to manage other team members

---

## 📱 **MOBILE TEAM MANAGEMENT**

### **📱 MOBILE MANAGER APP FEATURES**
- **Manager Profile Management**: Update profile on mobile
- **Property Portfolio View**: View assigned properties
- **Performance Dashboard**: Mobile analytics
- **Task Management**: Manage assigned tasks
- **Team Communication**: Real-time messaging
- **Push Notifications**: Important alerts

### **🎯 MOBILE OPTIMIZATION**
- **Touch-Friendly Interface**: 44px minimum touch targets
- **Gesture Support**: Swipe, pinch, and tap gestures
- **Offline Capabilities**: Work with cached data
- **GPS Integration**: Location-based features
- **Camera Integration**: Photo upload capabilities

---

## 🔄 **IMPORT/EXPORT SYSTEM**

### **📥 TEAM IMPORT FUNCTIONALITY**
- **CSV Import**: Import entire teams from CSV files
- **Excel Import**: Advanced Excel file support
- **Template Download**: Professional CSV templates
- **Data Validation**: Comprehensive import validation
- **Duplicate Detection**: Smart duplicate handling
- **Error Reporting**: Detailed import error reports
- **Preview Mode**: Import preview before final import
- **Role Assignment**: Assign roles during import process
- **Property Assignment**: Assign properties during team import
- **Welcome Automation**: Automatic welcome emails and setup instructions

### **📤 EXPORT CAPABILITIES**
- **Multiple Formats**: CSV, Excel, PDF export options
- **Custom Reports**: Configurable export templates
- **Bulk Export**: Export all team member data
- **Filtered Export**: Export based on current filters
- **Scheduled Exports**: Automated report delivery
- **Performance Reports**: Export performance analytics
- **Property Assignment Reports**: Export property assignments

## 🔧 **BULK OPERATIONS**

### **📋 BULK TEAM MANAGEMENT**
- **Multiple Selection**: Checkbox selection for bulk operations
- **Bulk Status Updates**: Update employment status for multiple team members
- **Bulk Role Changes**: Change roles for multiple team members
- **Bulk Property Assignment**: Assign properties to multiple team members
- **Bulk Deactivation**: Deactivate multiple team members
- **Bulk Export**: Export selected team member data
- **Bulk Import**: Import multiple team members at once

### **⚡ BULK OPERATION FEATURES**
- **Confirmation Dialogs**: Professional confirmation for bulk actions
- **Progress Tracking**: Visual progress indicators for bulk operations
- **Error Handling**: Graceful error handling for failed operations
- **Undo Functionality**: Ability to undo bulk operations
- **Audit Trail**: Complete audit trail of bulk operations

---

## 🤖 **AI-POWERED FEATURES**

### **🧠 INTELLIGENT WORKLOAD BALANCING**
- **ML-Based Assignment**: AI-powered property assignment
- **Performance Prediction**: Predictive performance modeling
- **Risk Assessment**: Automated risk evaluation
- **Optimization Suggestions**: AI-driven improvement recommendations
- **Workload Optimization**: Intelligent task distribution based on manager capacity
- **Skill Matching**: Match manager expertise to property requirements

### **📊 PREDICTIVE ANALYTICS**
- **Performance Forecasting**: Future performance predictions
- **Turnover Prediction**: Tenant turnover risk assessment
- **Revenue Forecasting**: Income prediction models
- **Maintenance Prediction**: Predictive maintenance scheduling
- **Occupancy Forecasting**: Predict future occupancy rates
- **Collection Rate Prediction**: Predict payment collection success

## 📊 **PERFORMANCE ANALYTICS & REPORTING**

### **📈 COMPREHENSIVE PERFORMANCE DASHBOARDS**
- **Individual Performance**: Detailed manager performance metrics
- **Team Performance**: Team-wide performance comparison
- **Property Performance**: Property-specific performance tracking
- **Historical Trends**: Performance trends over time
- **Goal Tracking**: Performance vs. target goals
- **Peer Comparison**: Compare with similar managers

### **📊 ADVANCED REPORTING**
- **Performance Reports**: Comprehensive performance analytics
- **Property Assignment Reports**: Property distribution analysis
- **Workload Reports**: Manager workload distribution
- **Training Reports**: Training and development tracking
- **Compliance Reports**: Regulatory compliance tracking
- **Custom Reports**: User-defined report generation

## 🔐 **SECURITY & COMPLIANCE**

### **🔒 ADVANCED SECURITY FEATURES**
- **Role-Based Access Control**: Granular permission system
- **Audit Logging**: Complete audit trail of all actions
- **Data Encryption**: Encrypted data storage and transmission
- **Session Management**: Secure session handling
- **Two-Factor Authentication**: Enhanced security for sensitive operations
- **Data Backup**: Automated data backup and recovery

### **📋 COMPLIANCE FEATURES**
- **Data Retention**: Configurable data retention policies
- **Privacy Controls**: GDPR and privacy compliance
- **Access Logging**: Complete access and modification logs
- **Export Controls**: Controlled data export capabilities
- **Audit Reports**: Compliance audit report generation

## 📱 **MOBILE INTEGRATION**

### **📱 MOBILE TEAM MANAGEMENT**
- **Mobile Team Member Creation**: Create team members from mobile devices
- **Mobile Team Member Editing**: Edit team member information on mobile
- **Mobile Photo Upload**: Upload team member photos from mobile devices
- **Mobile Team Member Viewing**: View team member details on mobile
- **Offline Capabilities**: Work with team member data offline

### **🎯 MOBILE FEATURES**
- **GPS Integration**: Use GPS for manager location
- **Camera Integration**: Take photos directly from mobile app
- **Voice Notes**: Add voice notes to manager records
- **Mobile Validation**: Validate manager data on mobile devices
- **Touch Optimization**: 44px minimum touch targets
- **Gesture Support**: Swipe, pinch, and tap gestures

## 🔗 **THIRD-PARTY INTEGRATIONS**

### **🔍 BACKGROUND & VERIFICATION SERVICES**
- **Background Check Services**: Integrate with background check APIs
- **License Verification**: Integrate with license verification services
- **Photo Storage**: Integrate with cloud storage for photos
- **Document Management**: Integrate with document management systems
- **Credit Check Integration**: Automated credit verification
- **Reference Verification**: Verify professional references

### **📊 SYSTEM INTEGRATIONS**
- **Property System**: Integrate with property assignment system
- **Performance System**: Integrate with performance tracking
- **Training System**: Integrate with training and development
- **Analytics System**: Integrate with analytics and reporting
- **Communication System**: Integrate with messaging and notifications
- **Calendar Integration**: Sync with calendar systems

## 📋 **TEAM TEMPLATES & HISTORY**

### **📄 TEAM TEMPLATES**
- **Template Creation**: Create team member templates for common roles
- **Template Application**: Apply templates to new team members
- **Template Customization**: Customize templates for specific needs
- **Template Sharing**: Share templates across the organization
- **Role-Based Templates**: Pre-built templates for each role type
- **Custom Field Templates**: Templates with custom field configurations

### **📊 TEAM HISTORY TRACKING**
- **Change History**: Track all changes to team member records
- **Version Control**: Maintain version history of team member data
- **Audit Trail**: Complete audit trail of all team operations
- **Change Notifications**: Notify relevant users of team member changes
- **Rollback Functionality**: Ability to revert changes
- **Change Comparison**: Visual comparison of changes

---

## 🎨 **PROFESSIONAL UX REQUIREMENTS**

### **🎪 ANIMATION & TRANSITIONS**
```css
/* Smooth Interactions */
transition-all duration-200

/* Hover Effects */
hover:scale-105 hover:shadow-md

/* Loading States */
animate-pulse animate-spin

/* Page Transitions */
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

### **🌈 COLOR SYSTEM (DARK/LIGHT MODE COMPATIBLE)**
```css
/* Primary Actions */
.bg-gradient-to-r from-blue-500 to-purple-500 text-white

/* Success States */
.text-green-600 bg-green-600/20 dark:text-green-400 dark:bg-green-400/20

/* Warning States */
.text-orange-600 bg-orange-600/20 dark:text-orange-400 dark:bg-orange-400/20

/* Error States */
.text-red-600 bg-red-600/20 dark:text-red-400 dark:bg-red-400/20

/* Role Badge Colors (exact current pattern) */
.bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 /* Property Manager */
.bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 /* Maintenance */
.bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 /* Accounting */

/* Status Badge Colors (exact current pattern) */
.bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 /* Active */
.bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 /* Inactive */
.bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 /* Pending */

/* Progress Bars */
.bg-primary dark:bg-primary /* Progress fill */
.bg-gray-200 dark:bg-gray-700 /* Progress background */
```

### **📝 TYPOGRAPHY HIERARCHY**
```css
/* Page Titles */
text-3xl font-bold text-gray-900

/* Section Titles */
text-xl font-bold text-gray-900

/* Card Titles */
text-lg font-semibold text-gray-900

/* Body Text */
text-sm text-gray-600
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **⚛️ FRONTEND ARCHITECTURE**
- **React 18**: Latest React with concurrent features
- **TypeScript**: Full type safety throughout
- **React Hook Form**: Professional form management (exact Properties.tsx pattern)
- **Zod Validation**: Schema-based validation (exact Properties.tsx pattern)
- **TanStack Query**: Advanced data fetching and caching
- **Framer Motion**: Smooth animations and transitions
- **useDropzone**: Image upload handling (exact Properties.tsx pattern)
- **Sheet Component**: Right-side drawer for wizard (exact Properties.tsx pattern)
- **ConfirmationDialog**: Unsaved changes protection (exact Properties.tsx pattern)

### **🎨 SHADCN UI COMPONENTS (EXACT PROPERTIES.TSX USAGE)**
```typescript
// Core Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProCheckbox } from '@/components/ui/pro-checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarShortcut, MenubarTrigger } from '@/components/ui/menubar';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Sonner } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { Toast } from '@/components/ui/toast';
```

### **🔍 COMPREHENSIVE VALIDATION SCHEMAS**
```typescript
// Step 1: Personal Information
const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Invalid email address").refine(async (email) => {
    // Check for unique email
    const response = await managersApi.checkEmailUnique(email);
    return response.unique;
  }, "Email already exists"),
  phone: z.string().optional().refine((phone) => {
    if (!phone) return true;
    const phoneRegex = /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }, "Phone must be in format +1 (555) 123-4567"),
});

// Step 2: Profile & Photo
const step2Schema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  department: z.enum(["Property Management", "Maintenance", "Accounting", "Leasing", "Administration"]),
  hireDate: z.date().max(new Date(), "Hire date cannot be in the future"),
  employmentStatus: z.enum(["Full-time", "Part-time", "Contract", "Intern"]),
  avatar: z.any().optional(), // File validation handled by useDropzone
});

// Step 3: Role & Permissions
const step3Schema = z.object({
  role: z.enum(["PROPERTY_MANAGER", "ASSISTANT_MANAGER", "MAINTENANCE_STAFF", "ACCOUNTING_STAFF", "LEASING_AGENT", "REGIONAL_MANAGER", "SENIOR_MANAGER"]),
  canManageProperties: z.boolean(),
  canManageTenants: z.boolean(),
  canManageMaintenance: z.boolean(),
  canViewReports: z.boolean(),
  canAccessFinancial: z.boolean(),
  canManageTeam: z.boolean(),
  accessLevel: z.enum(["Basic", "Standard", "Advanced", "Admin"]),
});

// Step 4: Employment Details
const step4Schema = z.object({
  salary: z.number().min(0, "Salary must be positive").optional(),
  benefits: z.array(z.string()).optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional().refine((phone) => {
    if (!phone) return true;
    const phoneRegex = /^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  }, "Emergency contact phone must be in format +1 (555) 123-4567"),
  address: z.string().optional(),
});

// Step 5: Property Assignment
const step5Schema = z.object({
  assignedProperties: z.array(z.string()).max(10, "Maximum 10 properties per manager"),
});
```

### **🌐 BACKEND INTEGRATION**
- **Cloudflare Workers**: Serverless backend deployment
- **Supabase**: Real-time database with PostgreSQL
- **Cloudflare R2**: Scalable file storage
- **JWT Authentication**: Secure authentication system
- **RESTful APIs**: Professional API design

### **📱 RESPONSIVE BREAKPOINTS**
```css
/* Sheet Component - EXACT Properties.tsx pattern */
w-full sm:w-[45%] md:w-[40%]

/* Mobile First */
max-w-[95vw] max-h-[90vh] m-4

/* Tablet */
max-w-2xl to max-w-4xl

/* Desktop */
max-w-4xl to max-w-6xl

/* Ultra-wide */
w-[1200px] to w-[1400px] max-w-[85vw]
```

---

## 🎯 **DOORLOOP SUPERIORITY FEATURES**

### **✨ ENHANCED UX ELEMENTS**
1. **5-Step Wizard**: More organized than DoorLoop's single-form approach
2. **Visual Progress**: Advanced progress indicators with animations
3. **Smart Validation**: Real-time feedback vs. DoorLoop's form submission validation
4. **Professional Styling**: Enterprise-grade UI vs. basic form styling
5. **Mobile Excellence**: Touch-optimized interfaces vs. desktop-only focus

### **🚀 ADVANCED FUNCTIONALITY**
1. **AI-Powered Features**: ML-based workload balancing and predictions
2. **Comprehensive Analytics**: Advanced performance tracking and reporting
3. **Property Assignment**: Visual drag-and-drop assignment system
4. **Role-Based Permissions**: Granular access control system
5. **Import/Export**: Professional data management capabilities

### **📊 BUSINESS INTELLIGENCE**
1. **Performance Prediction**: ML-based forecasting capabilities
2. **Workload Optimization**: Intelligent task distribution
3. **Risk Assessment**: Automated risk evaluation
4. **Comparative Analytics**: Peer and industry benchmarking

---

## 🏆 **SUCCESS METRICS**

### **📊 USER EXPERIENCE KPIs**
- **Task Completion Rate**: >95%
- **Error Rate**: <2%
- **User Satisfaction**: >4.8/5
- **Mobile Usability**: >90% success rate
- **Accessibility Score**: 100% WCAG AA compliance

### **⚡ PERFORMANCE TARGETS**
- **Initial Load**: <3 seconds
- **Wizard Navigation**: <200ms
- **Form Submission**: <1 second
- **Data Refresh**: <500ms
- **Image Upload**: <2 seconds

### **🎯 BUSINESS IMPACT**
- **Manager Productivity**: 50% increase in team efficiency
- **Property Assignment**: 75% faster property distribution
- **Performance Tracking**: 90% improvement in analytics visibility
- **User Adoption**: 80% higher adoption rate vs. DoorLoop

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **🔥 PHASE 1 (WEEK 1) - CORE FUNCTIONALITY**
1. **Team Dashboard**: Complete team management interface (exact screenshot layout)
2. **5-Step Wizard**: Professional team member creation process (exact Properties.tsx pattern)
3. **Basic CRUD**: Create, read, update, delete operations
4. **Property Assignment**: Basic assignment functionality
5. **Mobile Responsive**: Perfect mobile experience
6. **Sheet Component**: Right-side drawer implementation (exact Properties.tsx pattern)
7. **Form Validation**: React Hook Form + Zod (exact Properties.tsx pattern)
8. **Image Upload**: useDropzone + R2 integration (exact Properties.tsx pattern)

### **⚡ PHASE 2 (WEEK 2) - ADVANCED FEATURES**
1. **Performance Analytics**: Comprehensive metrics and dashboards
2. **Role-Based Permissions**: Granular access control
3. **Import/Export**: Professional data management
4. **Advanced Filtering**: Intelligent search and filtering
5. **Professional UX**: Complete visual polish

### **🎯 PHASE 3 (WEEK 3) - REVOLUTIONARY FEATURES**
1. **AI-Powered Features**: ML-based workload balancing
2. **Predictive Analytics**: Performance forecasting
3. **Advanced Reporting**: Comprehensive reporting suite
4. **Mobile App**: Native mobile application
5. **Integration APIs**: Third-party integrations

---

## 🎉 **FINAL DELIVERABLE**

**Create the most advanced Team Management system in the property management industry that:**

✅ **Surpasses DoorLoop 100x fold** in functionality and UX
✅ **Implements all features** from the comprehensive specifications
✅ **Provides professional UX** with perfect dark/light mode support
✅ **Enables property assignment** to team members with intelligent distribution
✅ **Delivers comprehensive analytics** with AI-powered insights
✅ **Supports mobile excellence** with touch-optimized interfaces
✅ **Integrates with Cloudflare R2** for scalable file storage
✅ **Implements role-based permissions** with granular access control
✅ **Provides import/export capabilities** for professional data management
✅ **Delivers sub-3 second performance** with smooth animations
✅ **Uses exact Properties.tsx patterns** for Sheet, Form, Validation, and Image Upload
✅ **Matches screenshot layout exactly** with proper metrics cards and empty state
✅ **Implements professional wizard** with gradient icons and step validation
✅ **Uses all ShadCN UI components** with exact Properties.tsx styling patterns
✅ **Implements ProCheckbox components** for permission management
✅ **Uses ToggleGroup components** for view mode switching
✅ **Implements comprehensive validation** with real-time feedback
✅ **Supports mobile integration** with GPS, camera, and offline capabilities
✅ **Includes third-party integrations** for background checks and verification
✅ **Provides team templates** and history tracking
✅ **Implements security & compliance** features with audit logging
✅ **Uses `/team` route** for team-oriented URL structure

**🎯 GOAL: Create the definitive property management team management system that sets new industry standards and becomes the benchmark for professional property management software.**

**🔧 CRITICAL: Must use exact technical patterns from Properties.tsx for Sheet component, React Hook Form, Zod validation, useDropzone, and all UI components to ensure consistency and functionality.**

**🎨 CRITICAL: All colors, gradients, and styling must match Properties.tsx exactly, including dark/light mode compatibility, error states, and professional UX patterns.**

**📱 CRITICAL: Must support mobile devices with touch optimization, GPS integration, camera access, and offline capabilities.**

**🔐 CRITICAL: Must implement comprehensive security features including audit logging, role-based access control, and compliance features.**

**🌐 CRITICAL: Must use `/team` route instead of `/managers` for team-oriented URL structure.**

### **⌨️ KEYBOARD SHORTCUTS (EXACT PROPERTIES.TSX PATTERN)**
**Global Shortcuts:**
- **Ctrl/Cmd + K**: Focus search bar
- **Ctrl/Cmd + A**: Select all team members
- **Ctrl/Cmd + N**: Add new team member
- **Escape**: Close modals and sheets
- **Enter**: Confirm actions in dialogs

**Navigation Shortcuts:**
- **Arrow Keys**: Navigate between team members
- **Tab**: Navigate through form fields
- **Shift + Tab**: Navigate backwards

**Action Shortcuts:**
- **Delete**: Delete selected team members
- **Space**: Toggle selection
- **Ctrl/Cmd + Click**: Multi-select

### **🎨 PROFESSIONAL UX ENHANCEMENTS**
**Loading States:**
- **Skeleton Loading**: Professional skeleton screens
- **Progress Indicators**: Loading bars for long operations
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful error handling

**Animations & Transitions:**
- **Framer Motion**: Smooth page transitions
- **Micro-interactions**: Hover effects and feedback
- **Loading Animations**: Professional loading states
- **Success Animations**: Celebration animations

**Accessibility:**
- **Screen Reader Support**: Full ARIA compliance
- **Keyboard Navigation**: Complete keyboard support
- **High Contrast Mode**: Dark/light theme support
- **Focus Management**: Proper focus indicators 