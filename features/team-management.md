# 👥 **TEAM MANAGEMENT - FEATURE SPECIFICATION**

## 🎯 **OVERVIEW**
Team Management provides comprehensive management of property management teams and staff members. This feature handles the creation, editing, and management of team member profiles with advanced role-based permissions, performance tracking, and property assignments.

**🌐 ROUTE: `/team` (not `/managers`)**

---

## 📋 **CORE FUNCTIONALITY**

### **Team Member Creation**

#### **Required Fields**
- **Personal Information**: Complete personal details
  - First Name
  - Last Name
  - Email Address
  - Phone Number
  - Date of Birth
  - Social Security Number (for tax purposes)
- **Professional Information**: Professional credentials
  - License Numbers (real estate, property management)
  - Certifications
  - Years of Experience
  - Specializations
  - Professional Bio
- **Contact Information**: Multiple contact methods
  - Primary Phone
  - Secondary Phone
  - Emergency Contact
  - Office Address
  - Personal Address
- **Employment Details**: Employment information
  - Hire Date
  - Employment Status (Full-time, Part-time, Contract, Intern)
  - Salary Information
  - Benefits Package
  - Performance Metrics

#### **Optional Fields**
- **Profile Photo**: Professional headshot
- **Resume/CV**: Professional background
- **References**: Professional references
- **Skills Assessment**: Skills and competencies
- **Training Records**: Training and certification history
- **Performance History**: Historical performance data
- **Preferences**: Work preferences and availability
- **Emergency Contacts**: Emergency contact information

#### **Validation Rules**
- **Email Validation**: Verify unique email addresses
- **License Verification**: Verify professional licenses
- **Background Check**: Automated background screening
- **Reference Verification**: Verify professional references
- **Skills Assessment**: Validate skills and competencies
- **Compliance Check**: Ensure regulatory compliance

### **Team Member Editing**

#### **Profile Updates**
- **Personal Information Updates**: Modify personal details
- **Professional Information Updates**: Update credentials and experience
- **Contact Information Updates**: Update contact methods
- **Employment Updates**: Update employment details
- **Performance Updates**: Update performance metrics
- **Training Updates**: Update training and certifications

#### **Bulk Edit Operations**
- **Multiple Team Member Selection**: Select multiple team members for bulk operations
- **Bulk Status Updates**: Update employment status for multiple team members
- **Bulk Assignment Changes**: Change property assignments for multiple team members
- **Bulk Training Assignments**: Assign training to multiple team members
- **Bulk Performance Updates**: Update performance metrics for multiple team members

#### **Edit Validation**
- **Change Tracking**: Track all changes with audit trail
- **Permission Validation**: Ensure user has permission to edit
- **Data Integrity**: Maintain data consistency during edits
- **Conflict Resolution**: Handle concurrent edit conflicts

### **Team Member Deletion/Archiving**

#### **Soft Delete Implementation**
- **Archive Instead of Delete**: Move to archive rather than permanent deletion
- **Archive Date Tracking**: Record when team member was archived
- **Archive Reason**: Document reason for archiving
- **Archive User**: Track who performed the archive action

#### **Data Retention Policies**
- **Retention Period**: Define how long archived data is kept
- **Data Recovery**: Allow recovery of archived team members
- **Permanent Deletion**: Option for permanent deletion after retention period
- **Compliance Requirements**: Meet legal data retention requirements

#### **Archive Management**
- **Archive Search**: Search through archived team members
- **Archive Recovery**: Restore team members from archive
- **Archive Cleanup**: Automated cleanup of expired archives
- **Archive Reporting**: Generate archive reports

---

## 🎯 **5-STEP TEAM MEMBER WIZARD SYSTEM**

### **WIZARD STEP CONFIGURATION**
```typescript
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
```

### **STEP ICONS & PROGRESS INDICATOR**
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

### **STEP DETAILS & VALIDATION**

#### **STEP 1: PERSONAL INFORMATION**
**Title**: "Add New Team Member" with "Step 1 of 5: Personal information and contact details"

**Required Fields:**
- **First Name***: Text input with validation (min 2 chars, max 50)
- **Last Name***: Text input with validation (min 2 chars, max 50)
- **Email Address***: Email input with uniqueness validation and format checking
- **Phone Number**: Phone input with formatting (+1 (555) 123-4567 pattern)

**Validation Schema (Zod):**
```tsx
const step1Schema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters'),
  phoneNumber: z.string()
    .regex(/^\+1\s\(\d{3}\)\s\d{3}-\d{4}$/, 'Phone number must be in format: +1 (555) 123-4567')
    .optional(),
});
```

#### **STEP 2: PROFILE & PHOTO**
**Title**: "Step 2 of 5: Professional profile and photo"

**Required Fields:**
- **Profile Photo**: Drag-and-drop upload with Cloudflare R2 integration (exact Properties.tsx image upload pattern)
- **Professional Bio**: Rich text area for team member description (max 500 chars)
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

#### **STEP 3: ROLE & PERMISSIONS**
**Title**: "Step 3 of 5: Role assignment and access permissions"

**Enhanced Role Selection (11 Roles):**
- **Property Manager**: Full property management access with tenant and maintenance oversight
- **Assistant Manager**: Limited property access with no financial data access
- **Maintenance Staff**: Maintenance and vendor management with limited property access
- **Accounting Staff**: Financial data and reporting access with limited property management
- **Leasing Agent**: Tenant management and leasing operations only
- **Regional Manager**: Multi-property oversight with team management capabilities
- **Senior Manager**: Advanced permissions and comprehensive system access
- **🆕 Financial Controller**: Complete financial oversight and reporting capabilities
- **🆕 Legal Advisor**: Legal document management and compliance oversight
- **🆕 Marketing Specialist**: Marketing and tenant acquisition focused role
- **🆕 System Administrator**: Complete system access and configuration management

**Advanced Permission System (18 Granular Permissions):**

**Core Management Permissions:**
- **Manage Properties**: Property creation, editing, and deletion
- **Manage Tenants**: Tenant management and operations
- **Manage Maintenance**: Maintenance requests and scheduling
- **Manage Vendors**: Vendor management and contracts

**Financial & Reporting Permissions:**
- **Financial Access**: Financial data and accounting features
- **View Reports**: Analytics and reporting features
- **Advanced Analytics**: Advanced analytics and insights
- **View Audit Logs**: System audit and activity logs

**Administrative Permissions:**
- **Team Management**: Manage other team members
- **Assign Properties**: Assign properties to team members
- **System Settings**: System configuration and settings
- **Manage Integrations**: Third-party integrations and APIs

**Specialized Operations Permissions:**
- **Manage Leases**: Lease agreements and contracts
- **Manage Marketing**: Marketing campaigns and materials
- **Manage Legal**: Legal documents and compliance
- **Manage Templates**: Document and email templates

**Data Management Permissions:**
- **Export Data**: Export data and reports
- **Import Data**: Import data and bulk operations

**Advanced Features:**
- **Role-Based Permission Presets**: Automatic permission application when selecting roles
- **Role Descriptions**: Detailed descriptions for each role
- **Permission Groups**: Organized into logical categories (Core, Financial, Administrative, Specialized, Data)
- **Permission Count Display**: Shows "X of 18 permissions" granted
- **Active Permission Badges**: Visual badges for each granted permission
- **Clear All Button**: Quick way to reset all permissions
- **Access Level Auto-Assignment**: Access level automatically set based on role complexity

**Enhanced Access Level Selection:**
- **Basic**: Limited access to assigned properties only
- **Standard**: Access to all properties and basic reports
- **Advanced**: Full access with advanced analytics
- **Admin**: Complete system access

#### **STEP 4: EMPLOYMENT DETAILS**
**Title**: "Step 4 of 5: Employment information and compensation"

**Required Fields:**
- **Salary**: Currency input with formatting and validation
- **Benefits**: Multi-select dropdown (Health, Dental, Vision, 401k, PTO, etc.)
- **Emergency Contact**: Name and phone number (required if phone provided)
- **Address**: Complete address input with validation

**Advanced Features:**
- **Real-time Calculations**: Salary calculations and benefits totals
- **Address Validation**: Real-time address verification
- **Currency Formatting**: Professional currency display
- **Benefits Selection**: Multi-select with ProCheckbox components
- **Form Persistence**: Save progress between steps

#### **STEP 5: REVIEW & CREATE TEAM MEMBER**
**Title**: "Step 5 of 5: Review & Create Team Member"

**Comprehensive Review Interface:**

**Personal Information Section:**
- **Full Name**: First and last name display
- **Email Address**: Email validation and display
- **Phone Number**: Phone number with formatting
- **Edit Functionality**: Quick edit access to Step 1

**Professional Details Section:**
- **Department**: Selected department display
- **Hire Date**: Formatted hire date
- **Employment Status**: Current employment status
- **Profile Photo**: Avatar upload status
- **Professional Bio**: Bio text display (if provided)
- **Edit Functionality**: Quick edit access to Step 2

**Role & Permissions Section:**
- **Role**: Human-readable role name display
- **Access Level**: Current access level
- **Permissions Granted**: "X of 18 permissions" count
- **Active Permission Badges**: Visual badges for each granted permission
- **Permission Categories**: Core, Financial, Administrative, Specialized, Data
- **Edit Functionality**: Quick edit access to Step 3

**Employment Details Section:**
- **Salary**: Professional currency formatting ($50,000.00)
- **Emergency Contact**: Name and phone combination
- **Address**: Complete address display
- **Edit Functionality**: Quick edit access to Step 4

**Property Assignment Section:**
- **Assigned Properties Count**: Number of assigned properties
- **Property List**: Individual property display with icons
- **Assignment Status**: Clear indication of assignment state
- **Future Assignment Note**: Properties can be assigned after creation
- **Edit Functionality**: Quick edit access to Step 5

**Advanced Review Features:**
- **Section Cards**: Each section in organized gray cards with icons
- **Edit Buttons**: Quick edit access for each section
- **Visual Hierarchy**: Professional layout with proper spacing
- **Summary Statistics**: 4-column summary with key metrics
- **Error Display**: Validation errors with clear messaging
- **Permission Summary**: Visual display of all active permissions
- **Professional Formatting**: Currency, dates, and proper formatting
- **Dark/Light Mode**: Complete theme compatibility
- **Responsive Design**: Mobile-optimized layout

**Summary Statistics Display:**
- **Permissions Count**: Total active permissions
- **Properties Count**: Assigned properties
- **Access Level**: Current access level
- **Employment Status**: Current status

**Final Validation:**
- **Form Validation**: All required fields completed
- **Permission Validation**: Role and permissions properly configured
- **Data Integrity**: All form data validated
- **Confirmation**: Final confirmation before team member creation

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

---

## 🔄 **PROPERTY ASSIGNMENT SYSTEM**

### **Drag-and-Drop Assignment**
- **Visual Interface**: Drag properties to team members
- **Assignment Rules**: Intelligent assignment based on workload
- **Capacity Management**: Maximum properties per team member
- **Geographic Distribution**: Assign by location proximity
- **Skill Matching**: Match properties to team member expertise

### **Intelligent Workload Balancing**
- **Property Count**: Balance number of properties
- **Unit Count**: Consider total units managed
- **Revenue Distribution**: Balance revenue responsibility
- **Geographic Clustering**: Minimize travel time
- **Performance Optimization**: Assign based on performance history

### **Assignment Rules Engine**
- **Skill Matching**: Match properties to team member skills
- **Experience Level**: Consider years of experience
- **Performance History**: Use historical performance data
- **Availability**: Consider current workload and availability
- **Geographic Preferences**: Respect location preferences

---

## 📊 **COMPREHENSIVE PERFORMANCE ANALYTICS**

### **Individual Performance Dashboards**
- **Occupancy Rate**: Property occupancy performance
- **Maintenance Response Time**: Average response to maintenance requests
- **Tenant Satisfaction**: Tenant satisfaction scores
- **Collection Rate**: Rent collection performance
- **Property Value Growth**: Property appreciation under management
- **Lease Renewal Rate**: Tenant retention performance

### **Team Performance Analytics**
- **Team Comparison**: Compare team member performance
- **Workload Distribution**: Analyze workload balance
- **Performance Trends**: Track performance over time
- **Goal Achievement**: Monitor against performance goals
- **Peer Benchmarking**: Compare against industry standards

### **Performance Alerts**
- **Threshold Alerts**: Alert when metrics fall below thresholds
- **Goal Tracking**: Monitor progress toward performance goals
- **Trend Analysis**: Identify performance trends
- **AI Recommendations**: AI-powered performance suggestions

---

## 🔐 **ADVANCED ROLES & PERMISSIONS**

### **Enhanced Role Hierarchy (11 Roles)**
```typescript
interface TeamMemberRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  accessLevel: 'Basic' | 'Standard' | 'Advanced' | 'Admin';
  defaultAccessLevel: string;
  canManageProperties: boolean;
  canManageTenants: boolean;
  canManageMaintenance: boolean;
  canViewReports: boolean;
  canManageFinancials: boolean;
  canManageTeam: boolean;
  canAssignProperties: boolean;
  canViewAnalytics: boolean;
  canManageVendors: boolean;
  canManageLeases: boolean;
  canManageMarketing: boolean;
  canManageLegal: boolean;
  canManageSettings: boolean;
  canExportData: boolean;
  canImportData: boolean;
  canManageTemplates: boolean;
  canViewAuditLogs: boolean;
  canManageIntegrations: boolean;
}
```

### **Comprehensive Role Definitions**

**Core Management Roles:**
- **Property Manager**: Full property management with tenant and maintenance oversight
- **Assistant Manager**: Limited property access with no financial data access
- **Maintenance Staff**: Maintenance and vendor management with limited property access

**Financial & Reporting Roles:**
- **Accounting Staff**: Financial data and reporting access with limited property management
- **🆕 Financial Controller**: Complete financial oversight and reporting capabilities

**Specialized Roles:**
- **Leasing Agent**: Tenant management and leasing operations only
- **🆕 Legal Advisor**: Legal document management and compliance oversight
- **🆕 Marketing Specialist**: Marketing and tenant acquisition focused role

**Administrative Roles:**
- **Regional Manager**: Multi-property oversight with team management capabilities
- **Senior Manager**: Advanced permissions and comprehensive system access
- **🆕 System Administrator**: Complete system access and configuration management

### **Advanced Permission System (18 Granular Permissions)**

**Core Management Permissions:**
- **Manage Properties**: Property creation, editing, and deletion
- **Manage Tenants**: Tenant management and operations
- **Manage Maintenance**: Maintenance requests and scheduling
- **Manage Vendors**: Vendor management and contracts

**Financial & Reporting Permissions:**
- **Financial Access**: Financial data and accounting features
- **View Reports**: Analytics and reporting features
- **Advanced Analytics**: Advanced analytics and insights
- **View Audit Logs**: System audit and activity logs

**Administrative Permissions:**
- **Team Management**: Manage other team members
- **Assign Properties**: Assign properties to team members
- **System Settings**: System configuration and settings
- **Manage Integrations**: Third-party integrations and APIs

**Specialized Operations Permissions:**
- **Manage Leases**: Lease agreements and contracts
- **Manage Marketing**: Marketing campaigns and materials
- **Manage Legal**: Legal documents and compliance
- **Manage Templates**: Document and email templates

**Data Management Permissions:**
- **Export Data**: Export data and reports
- **Import Data**: Import data and bulk operations

### **Advanced Access Level System**
- **Basic**: Limited access to assigned properties only
- **Standard**: Access to all properties and basic reports
- **Advanced**: Full access with advanced analytics
- **Admin**: Complete system access

### **Role-Based Permission Presets**
Each role comes with pre-configured permission sets that automatically apply when selected:
- **Automatic Permission Application**: Permissions are set based on role selection
- **Access Level Auto-Assignment**: Access level automatically set based on role complexity
- **Role Descriptions**: Detailed descriptions for each role
- **Permission Count Display**: Shows "X of 18 permissions" granted
- **Active Permission Badges**: Visual badges for each granted permission

---

## 📱 **MOBILE TEAM MANAGEMENT**

### **Mobile App Features**
- **Team Member Profile**: View and edit profile information
- **Property Portfolio**: View assigned properties
- **Performance Dashboard**: Real-time performance metrics
- **Task Management**: View and complete assigned tasks
- **Communication**: Team communication tools
- **Notifications**: Real-time notifications and alerts

### **Mobile Optimization**
- **Touch-Optimized**: Large touch targets and gestures
- **Offline Capabilities**: Work without internet connection
- **GPS Integration**: Location-based features
- **Camera Integration**: Photo capture for documentation
- **Voice Notes**: Voice recording for notes
- **Push Notifications**: Real-time alerts and updates

---

## 🔄 **IMPORT/EXPORT SYSTEM**

### **Team Import Functionality**
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

### **Export Capabilities**
- **Multiple Formats**: CSV, Excel, PDF export options
- **Custom Reports**: Configurable export templates
- **Bulk Export**: Export all team member data
- **Filtered Export**: Export based on current filters
- **Scheduled Exports**: Automated report delivery
- **Performance Reports**: Export performance analytics
- **Property Assignment Reports**: Export property assignments

---

## 🔧 **BULK OPERATIONS**

### **Bulk Team Management**
- **Multiple Selection**: Checkbox selection for bulk operations
- **Bulk Status Updates**: Update employment status for multiple team members
- **Bulk Role Changes**: Change roles for multiple team members
- **Bulk Property Assignment**: Assign properties to multiple team members
- **Bulk Deactivation**: Deactivate multiple team members
- **Bulk Export**: Export selected team member data
- **Bulk Import**: Import multiple team members at once

### **Bulk Operation Features**
- **Confirmation Dialogs**: Confirm bulk operations
- **Progress Tracking**: Show progress for long operations
- **Error Handling**: Handle errors gracefully
- **Undo Functionality**: Ability to undo bulk operations
- **Audit Trail**: Track all bulk operations

---

## 🤖 **AI-POWERED FEATURES**

### **Intelligent Workload Balancing**
- **ML-Based Assignment**: Machine learning for optimal assignments
- **Performance Prediction**: Predict future performance
- **Risk Assessment**: Assess risk factors
- **Optimization Suggestions**: Suggest improvements
- **Skill Matching**: Match skills to property requirements

### **Predictive Analytics**
- **Performance Forecasting**: Predict future performance
- **Turnover Prediction**: Predict team member turnover
- **Revenue Forecasting**: Predict revenue performance
- **Maintenance Prediction**: Predict maintenance needs
- **Occupancy Forecasting**: Predict occupancy rates
- **Collection Rate Forecasting**: Predict collection performance

---

## 📊 **PERFORMANCE ANALYTICS & REPORTING**

### **Comprehensive Dashboards**
- **Individual Dashboard**: Personal performance metrics
- **Team Dashboard**: Team-wide performance overview
- **Property Dashboard**: Property-specific performance
- **Historical Dashboard**: Performance over time
- **Goal Dashboard**: Progress toward goals
- **Peer Comparison**: Compare with other team members

### **Advanced Reporting**
- **Performance Reports**: Detailed performance analysis
- **Assignment Reports**: Property assignment analysis
- **Workload Reports**: Workload distribution analysis
- **Training Reports**: Training and development analysis
- **Compliance Reports**: Regulatory compliance reports
- **Custom Reports**: User-defined custom reports

---

## 🔐 **SECURITY & COMPLIANCE**

### **Advanced Security Features**
- **Role-Based Access Control (RBAC)**: Granular permission system
- **Audit Logging**: Complete audit trail
- **Data Encryption**: Encrypt sensitive data
- **Session Management**: Secure session handling
- **Two-Factor Authentication**: Enhanced security
- **Data Backup**: Automated data backup

### **Compliance Features**
- **Data Retention**: Automated data retention policies
- **Privacy Controls**: GDPR and privacy compliance
- **Access Logging**: Track all access attempts
- **Export Controls**: Control data exports
- **Audit Reports**: Generate compliance reports

---

## 🎨 **PROFESSIONAL UX REQUIREMENTS**

### **Multiple View Modes (EXACT PROPERTIES.TSX PATTERN)**
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

### **Sorting & Pagination (EXACT PROPERTIES.TSX PATTERN)**
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

### **Keyboard Shortcuts (EXACT PROPERTIES.TSX PATTERN)**
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

### **Loading States & UX Enhancements**
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

### **Animation & Transitions**
- **Framer Motion**: Smooth page transitions
- **Micro-interactions**: Hover effects and feedback
- **Loading States**: Professional loading animations
- **Success Animations**: Celebration animations
- **Error States**: Graceful error handling

### **Color System**
- **Primary Colors**: Blue (#3B82F6) for primary actions
- **Success Colors**: Green (#10B981) for success states
- **Warning Colors**: Yellow (#F59E0B) for warnings
- **Error Colors**: Red (#EF4444) for errors
- **Neutral Colors**: Gray scale for text and backgrounds
- **Dark/Light Mode**: Complete theme support

### **Typography Hierarchy**
- **Headings**: Clear hierarchy with proper contrast
- **Body Text**: Readable font sizes and line heights
- **Labels**: Consistent label styling
- **Error Messages**: Clear error communication
- **Success Messages**: Positive feedback styling

---

## 🛠️ **TECHNICAL IMPLEMENTATION**

### **Frontend Technologies**
- **React 18**: Latest React with hooks
- **TypeScript**: Type-safe development
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **useDropzone**: File upload handling
- **Framer Motion**: Animations and transitions
- **TanStack Query**: Data fetching and caching

### **UI Components**
- **ShadCN UI**: Professional component library
- **Sheet Component**: Right-side drawer for wizard
- **ConfirmationDialog**: Unsaved changes protection
- **ProCheckbox**: Custom checkbox for permissions
- **ToggleGroup**: View mode switching
- **Avatar**: Team member profile pictures
- **Badge**: Status and role indicators

### **Backend Technologies**
- **Cloudflare Workers**: Serverless backend
- **Supabase**: PostgreSQL database
- **Cloudflare R2**: File storage
- **JWT Authentication**: Secure authentication
- **RESTful APIs**: Clean API design

### **API Endpoints**
- **`GET /api/team`**: Get all team members with performance metrics
- **`POST /api/team`**: Create new team member with full profile and enhanced permissions
- **`GET /api/team/:id`**: Get team member by ID with detailed info and permission breakdown
- **`PUT /api/team/:id`**: Update team member profile and permissions
- **`DELETE /api/team/:id`**: Soft delete (deactivate) team member
- **`POST /api/team/:id/assign-properties`**: Assign properties to team member
- **`GET /api/team/:id/performance`**: Get performance analytics
- **`POST /api/team/:id/avatar`**: Upload team member avatar
- **`POST /api/team/:id/avatar/upload-url`**: Generate R2 presigned URL
- **`GET /api/team/:id/storage-analytics`**: Get team member storage analytics
- **`POST /api/team/bulk/assign-properties`**: Bulk property assignment
- **`POST /api/team/bulk/update-status`**: Bulk status updates
- **`POST /api/team/bulk/update-role`**: Bulk role updates with permission presets
- **`POST /api/team/import`**: Import team members from CSV/Excel
- **`GET /api/team/export`**: Export team member data
- **`GET /api/team/analytics/overview`**: Team analytics overview
- **`GET /api/team/analytics/performance`**: Performance analytics
- **`GET /api/team/analytics/storage`**: Team storage analytics
- **`GET /api/team/templates`**: Get team templates
- **`POST /api/team/templates`**: Create team template
- **`PUT /api/team/templates/:id`**: Update team template
- **`DELETE /api/team/templates/:id`**: Delete team template

### **Database Schema**
```sql
-- Enhanced User model for team members
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN emergency_contact_name VARCHAR(255);
ALTER TABLE users ADD COLUMN emergency_contact_phone VARCHAR(50);
ALTER TABLE users ADD COLUMN department VARCHAR(100);
ALTER TABLE users ADD COLUMN hire_date TIMESTAMP;
ALTER TABLE users ADD COLUMN salary DECIMAL(10,2);
ALTER TABLE users ADD COLUMN employment_status VARCHAR(50);
ALTER TABLE users ADD COLUMN access_level VARCHAR(50) DEFAULT 'Basic';
ALTER TABLE users ADD COLUMN can_manage_properties BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_tenants BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_maintenance BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_view_reports BOOLEAN DEFAULT false;

-- Enhanced team member roles (11 total)
-- PROPERTY_MANAGER, ASSISTANT_MANAGER, MAINTENANCE_STAFF, 
-- ACCOUNTING_STAFF, LEASING_AGENT, REGIONAL_MANAGER, SENIOR_MANAGER,
-- FINANCIAL_CONTROLLER, LEGAL_ADVISOR, MARKETING_SPECIALIST, SYSTEM_ADMINISTRATOR

-- Enhanced permissions (18 total)
ALTER TABLE users ADD COLUMN can_manage_vendors BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_leases BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_marketing BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_legal BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_settings BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_export_data BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_import_data BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_templates BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_view_audit_logs BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN can_manage_integrations BOOLEAN DEFAULT false;
```

### **R2 Storage Structure (Account-Based)**
```
ormi-storage/
├── {accountId}/
│   ├── team-members/
│   │   ├── {teamMemberId}/
│   │   │   ├── avatars/
│   │   │   │   ├── {timestamp}-avatar.jpg
│   │   │   │   └── {timestamp}-avatar.png
│   │   │   ├── documents/
│   │   │   │   ├── contracts/
│   │   │   │   ├── certifications/
│   │   │   │   ├── performance-reviews/
│   │   │   │   └── training-materials/
│   │   │   └── media/
│   │   │       ├── photos/
│   │   │       └── videos/
│   │   └── ...
│   ├── properties/
│   ├── tenants/
│   ├── maintenance/
│   ├── financial/
│   ├── marketing/
│   ├── legal/
│   ├── templates/
│   └── shared/
└── ...
```

### **Storage Analytics Integration**
```typescript
interface TeamMemberStorageAnalytics {
  accountId: string;
  teamMemberId: string;
  totalStorage: number;
  storageBreakdown: {
    avatars: number;
    documents: number;
    media: number;
  };
  fileCounts: {
    total: number;
    byType: Record<string, number>;
  };
  lastUpdated: Date;
}
```

### **Enhanced R2 Storage Integration**
- **Account-Based Organization**: All team member files organized by account ID
- **Team Member Avatars**: Upload team member profile photos to Cloudflare R2 with account-based organization
- **Avatar Management**: Generate presigned URLs for secure uploads
- **File Validation**: Image type and size validation with automatic optimization
- **Storage Analytics**: Track storage usage per account and team member
- **Billing Integration**: Storage-based billing with usage tracking and overage charges
- **Account Isolation**: Complete separation of storage between accounts
- **Storage Limits**: Enforce storage limits per account tier (Basic: 10GB, Professional: 100GB, Enterprise: 1TB)
- **Automatic Cleanup**: Remove old avatar versions to save storage
- **CDN Integration**: Global content delivery for fast image loading

---

## 🏆 **DOORLOOP SUPERIORITY FEATURES**

### **Advanced Functionality**
1. **AI-Powered Analytics**: ML-based insights vs. basic reporting
2. **Visual Property Assignment**: Drag-and-drop vs. manual assignment
3. **Comprehensive Performance Tracking**: Advanced metrics vs. basic stats
4. **🆕 Enhanced Role-Based Permissions**: 18 granular permissions vs. 6-8 basic permissions
5. **🆕 Advanced Role System**: 11 specialized roles vs. 5-7 generic roles
6. **🆕 Role-Based Permission Presets**: Automatic permission application vs. manual setup
7. **🆕 Comprehensive Review Interface**: Professional review step vs. basic summary
8. **Mobile Excellence**: Touch-optimized vs. desktop-only
9. **Import/Export System**: Professional data management vs. basic CSV
10. **Team Templates**: Reusable templates vs. manual setup
11. **Bulk Operations**: Efficient bulk management vs. individual operations
12. **Advanced Filtering**: Smart filters vs. basic search
13. **Real-time Analytics**: Live data vs. static reports

### **User Experience**
1. **5-Step Wizard**: Professional onboarding vs. basic forms
2. **🆕 Comprehensive Review Interface**: Professional review step vs. basic summary
3. **🆕 Role-Based Permission Presets**: Automatic setup vs. manual configuration
4. **🆕 Permission Badges**: Visual permission display vs. text-only
5. **Multiple View Modes**: Grid/List/Tile vs. single view
6. **Keyboard Shortcuts**: Power user features vs. basic navigation
7. **Dark/Light Mode**: Complete theme support vs. light only
8. **Mobile Responsive**: Perfect mobile experience vs. desktop focus
9. **Professional Styling**: Enterprise-grade UI vs. basic styling
10. **Smooth Animations**: Framer Motion vs. no animations
11. **Real-time Updates**: Live data vs. manual refresh
12. **Smart Validation**: Real-time feedback vs. form submission validation
13. **🆕 Edit Functionality**: Quick edit access vs. no edit capability

---

## 🚀 **SUCCESS METRICS**

### **User Experience KPIs**
- **Task Completion Rate**: >95%
- **Error Rate**: <2%
- **User Satisfaction**: >4.5/5
- **Time to Complete Tasks**: <3 minutes
- **Mobile Usage**: >60% of users

### **Performance KPIs**
- **Page Load Time**: <3 seconds
- **API Response Time**: <200ms
- **Uptime**: >99.9%
- **Error Rate**: <0.1%
- **Concurrent Users**: >1000

### **Business Impact KPIs**
- **Team Productivity**: >30% increase
- **Property Assignment Efficiency**: >50% faster
- **Performance Tracking**: >90% accuracy
- **User Adoption**: >80% within 30 days
- **Customer Retention**: >95%

---

## 📋 **IMPLEMENTATION PRIORITY**

### **🔥 Phase 1 (Week 1) - Core Functionality**
1. **Team Dashboard**: Complete team management interface
2. **5-Step Wizard**: Professional team member creation process
3. **Basic CRUD**: Create, read, update, delete operations
4. **Property Assignment**: Basic assignment functionality
5. **Mobile Responsive**: Perfect mobile experience
6. **Sheet Component**: Right-side drawer implementation
7. **Form Validation**: React Hook Form + Zod
8. **Image Upload**: useDropzone + R2 integration

### **🚀 Phase 2 (Week 2) - Advanced Features**
1. **Performance Analytics**: Comprehensive performance tracking
2. **Role-Based Permissions**: Granular access control
3. **Bulk Operations**: Efficient bulk management
4. **Import/Export**: Professional data management
5. **Advanced Filtering**: Smart filtering system
6. **Mobile App**: Native mobile experience

### **🎯 Phase 3 (Week 3) - AI & Analytics**
1. **AI-Powered Features**: ML-based insights
2. **Predictive Analytics**: Performance forecasting
3. **Advanced Reporting**: Comprehensive reporting
4. **Team Templates**: Reusable templates
5. **Audit Logging**: Complete audit trail
6. **Security Features**: Advanced security

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
✅ **Implements enhanced role-based permissions** with 18 granular permissions and 11 specialized roles
✅ **Provides import/export capabilities** for professional data management
✅ **Delivers sub-3 second performance** with smooth animations
✅ **Uses exact Properties.tsx patterns** for Sheet, Form, Validation, and Image Upload
✅ **Matches screenshot layout exactly** with proper metrics cards and empty state
✅ **Implements professional wizard** with gradient icons and step validation
✅ **Uses all ShadCN UI components** with exact Properties.tsx styling patterns
✅ **Implements ProCheckbox components** for permission management
✅ **Provides comprehensive review interface** with professional styling and edit functionality
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

### **🔧 CRITICAL IMPLEMENTATION NOTES**

#### **Backend Integration**
- **API Endpoints**: All endpoints use `/api/team` prefix
- **Database Schema**: Enhanced User model with team member fields
- **R2 Storage**: Team member avatars stored in `team-avatars/{teamMemberId}/`
- **Performance Analytics**: Real-time calculation of team member metrics
- **Property Assignment**: Visual drag-and-drop with workload balancing
- **Bulk Operations**: Support for bulk team member management
- **Import/Export**: CSV/Excel import/export with validation

#### **Frontend Requirements**
- **Route**: Use `/team` instead of `/managers` for all navigation
- **Component Patterns**: Exact Properties.tsx patterns for all components
- **Form Validation**: React Hook Form + Zod for all form validation
- **Image Upload**: useDropzone + R2 integration for avatars
- **State Management**: TanStack Query for data fetching and caching
- **Animations**: Framer Motion for all transitions and micro-interactions

#### **UX Consistency**
- **Sheet Component**: Right-side drawer with `w-full sm:w-[45%] md:w-[40%]` width
- **Color System**: Exact Properties.tsx colors with dark/light mode support
- **Typography**: Consistent font hierarchy and spacing
- **Loading States**: Professional skeleton screens and progress indicators
- **Error Handling**: Graceful error states with user-friendly messages

#### **Mobile Optimization**
- **Touch Targets**: Minimum 44px touch targets for all interactive elements
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Gesture Support**: Swipe gestures for navigation and actions
- **Offline Support**: Basic offline functionality for viewing team data
- **Performance**: Sub-3 second load times on mobile devices

#### **Security & Compliance**
- **Role-Based Access**: Granular permissions for all team operations
- **Audit Logging**: Complete audit trail for all team member changes
- **Data Encryption**: Encrypt sensitive team member data
- **Privacy Controls**: GDPR compliance for team member data
- **Access Controls**: Proper authentication and authorization

#### **Testing Requirements**
- **Unit Tests**: Test all team member CRUD operations
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete team member workflow
- **Performance Tests**: Test with large datasets (1000+ team members)
- **Accessibility Tests**: WCAG AA compliance verification 