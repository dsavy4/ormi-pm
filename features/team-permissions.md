# 🔐 ORMI Property Management System - Permissions & Access Control

## 📋 **OVERVIEW**

This document provides a comprehensive breakdown of the ORMI Property Management System's role-based access control (RBAC) structure, detailing all departments, roles, permissions, and access levels.

---

## 🏢 **DEPARTMENT STRUCTURE**

### **5 Departments with 11 Specialized Roles**

| **Department** | **Available Roles** | **Role Count** | **Auto-Selection** |
|----------------|-------------------|----------------|-------------------|
| **Property Management** | Property Manager, Assistant Manager, Regional Manager, Senior Manager | 4 | ❌ Manual Selection |
| **Maintenance** | Maintenance Staff | 1 | ✅ **Auto-Selected** |
| **Accounting** | Accounting Staff, Financial Controller | 2 | ❌ Manual Selection |
| **Leasing** | Leasing Agent, Marketing Specialist | 2 | ❌ Manual Selection |
| **Administration** | Legal Advisor, System Administrator | 2 | ❌ Manual Selection |

---

## 🎯 **ACCESS LEVELS**

### **4-Tier Access System**

| **Access Level** | **Description** | **Use Case** |
|------------------|-----------------|--------------|
| **Basic** | Limited access to assigned properties only | Entry-level roles, limited scope |
| **Standard** | Access to all properties and basic reports | Mid-level roles, broader scope |
| **Advanced** | Full access with advanced analytics | Senior roles, comprehensive access |
| **Admin** | Complete system access | System administration |

---

## 🔑 **PERMISSION CATEGORIES**

### **18 Granular Permissions Organized into 5 Categories**

#### **1. Core Management Permissions**
- `canManageProperties` - Property creation, editing, and deletion
- `canManageTenants` - Tenant management and operations
- `canManageMaintenance` - Maintenance requests and scheduling
- `canManageVendors` - Vendor management and contracts

#### **2. Financial & Reporting Permissions**
- `canManageFinancials` - Financial data and accounting features
- `canViewReports` - Analytics and reporting features
- `canViewAnalytics` - Advanced analytics and insights
- `canViewAuditLogs` - System audit and activity logs

#### **3. Administrative Permissions**
- `canManageTeam` - Manage other team members
- `canAssignProperties` - Assign properties to team members
- `canManageSettings` - System configuration and settings
- `canManageIntegrations` - Third-party integrations and APIs

#### **4. Specialized Operations Permissions**
- `canManageLeases` - Lease agreements and contracts
- `canManageMarketing` - Marketing campaigns and materials
- `canManageLegal` - Legal documents and compliance
- `canManageTemplates` - Document and email templates

#### **5. Data Management Permissions**
- `canExportData` - Export data and reports
- `canImportData` - Import data and bulk operations

---

## 👥 **DETAILED ROLE BREAKDOWN**

### **🏠 PROPERTY MANAGEMENT DEPARTMENT**

#### **1. Property Manager**
- **Department**: Property Management
- **Access Level**: Standard
- **Description**: Full property management access with tenant and maintenance oversight
- **Permissions (9/18)**:
  - ✅ `canManageProperties` - Property management
  - ✅ `canManageTenants` - Tenant operations
  - ✅ `canManageMaintenance` - Maintenance oversight
  - ✅ `canViewReports` - Reports access
  - ✅ `canViewAnalytics` - Analytics access
  - ✅ `canManageVendors` - Vendor management
  - ✅ `canManageLeases` - Lease management
  - ✅ `canExportData` - Data export
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canImportData` - No data import
  - ❌ `canManageTemplates` - No templates
  - ❌ `canViewAuditLogs` - No audit logs
  - ❌ `canManageIntegrations` - No integrations

#### **2. Assistant Manager**
- **Department**: Property Management
- **Access Level**: Basic
- **Description**: Limited property access with no financial data access
- **Permissions (6/18)**:
  - ✅ `canManageProperties` - Property management
  - ✅ `canManageTenants` - Tenant operations
  - ✅ `canManageMaintenance` - Maintenance oversight
  - ✅ `canViewReports` - Reports access
  - ✅ `canManageVendors` - Vendor management
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canViewAnalytics` - No analytics
  - ❌ `canManageLeases` - No lease management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canExportData` - No data export
  - ❌ `canImportData` - No data import
  - ❌ `canManageTemplates` - No templates
  - ❌ `canViewAuditLogs` - No audit logs
  - ❌ `canManageIntegrations` - No integrations

#### **3. Regional Manager**
- **Department**: Property Management
- **Access Level**: Advanced
- **Description**: Multi-property oversight with team management capabilities
- **Permissions (14/18)**:
  - ✅ `canManageProperties` - Property management
  - ✅ `canManageTenants` - Tenant operations
  - ✅ `canManageMaintenance` - Maintenance oversight
  - ✅ `canViewReports` - Reports access
  - ✅ `canManageFinancials` - Financial access
  - ✅ `canManageTeam` - Team management
  - ✅ `canAssignProperties` - Property assignment
  - ✅ `canViewAnalytics` - Analytics access
  - ✅ `canManageVendors` - Vendor management
  - ✅ `canManageLeases` - Lease management
  - ✅ `canExportData` - Data export
  - ✅ `canImportData` - Data import
  - ✅ `canViewAuditLogs` - Audit logs
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canManageTemplates` - No templates
  - ❌ `canManageIntegrations` - No integrations

#### **4. Senior Manager**
- **Department**: Property Management
- **Access Level**: Advanced
- **Description**: Advanced permissions and comprehensive system access
- **Permissions (15/18)**:
  - ✅ `canManageProperties` - Property management
  - ✅ `canManageTenants` - Tenant operations
  - ✅ `canManageMaintenance` - Maintenance oversight
  - ✅ `canViewReports` - Reports access
  - ✅ `canManageFinancials` - Financial access
  - ✅ `canManageTeam` - Team management
  - ✅ `canAssignProperties` - Property assignment
  - ✅ `canViewAnalytics` - Analytics access
  - ✅ `canManageVendors` - Vendor management
  - ✅ `canManageLeases` - Lease management
  - ✅ `canManageMarketing` - Marketing access
  - ✅ `canExportData` - Data export
  - ✅ `canImportData` - Data import
  - ✅ `canManageTemplates` - Templates access
  - ✅ `canViewAuditLogs` - Audit logs
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canManageIntegrations` - No integrations

### **🔧 MAINTENANCE DEPARTMENT**

#### **5. Maintenance Staff**
- **Department**: Maintenance
- **Access Level**: Basic
- **Description**: Maintenance and vendor management with limited property access
- **Permissions (5/18)**:
  - ✅ `canManageMaintenance` - Core maintenance access
  - ✅ `canManageVendors` - Vendor management
  - ✅ `canViewReports` - Maintenance reports
  - ✅ `canExportData` - Maintenance data export
  - ✅ `canViewAuditLogs` - Maintenance audit logs
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageTenants` - No tenant management
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canViewAnalytics` - No analytics
  - ❌ `canManageLeases` - No lease management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canImportData` - No data import
  - ❌ `canManageTemplates` - No templates
  - ❌ `canManageIntegrations` - No integrations

### **💰 ACCOUNTING DEPARTMENT**

#### **6. Accounting Staff**
- **Department**: Accounting
- **Access Level**: Standard
- **Description**: Financial data and reporting access with limited property management
- **Permissions (5/18)**:
  - ✅ `canViewReports` - Financial reports
  - ✅ `canManageFinancials` - Financial data access
  - ✅ `canViewAnalytics` - Financial analytics
  - ✅ `canExportData` - Financial data export
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageTenants` - No tenant management
  - ❌ `canManageMaintenance` - No maintenance access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canManageVendors` - No vendor management
  - ❌ `canManageLeases` - No lease management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canImportData` - No data import
  - ❌ `canManageTemplates` - No templates
  - ❌ `canViewAuditLogs` - No audit logs
  - ❌ `canManageIntegrations` - No integrations

#### **7. Financial Controller**
- **Department**: Accounting
- **Access Level**: Advanced
- **Description**: Complete financial oversight and reporting capabilities
- **Permissions (7/18)**:
  - ✅ `canViewReports` - Financial reports
  - ✅ `canManageFinancials` - Financial data access
  - ✅ `canViewAnalytics` - Financial analytics
  - ✅ `canExportData` - Financial data export
  - ✅ `canImportData` - Financial data import
  - ✅ `canViewAuditLogs` - Financial audit logs
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageTenants` - No tenant management
  - ❌ `canManageMaintenance` - No maintenance access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canManageVendors` - No vendor management
  - ❌ `canManageLeases` - No lease management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canManageTemplates` - No templates
  - ❌ `canManageIntegrations` - No integrations

### **🏠 LEASING DEPARTMENT**

#### **8. Leasing Agent**
- **Department**: Leasing
- **Access Level**: Basic
- **Description**: Tenant management and leasing operations only
- **Permissions (3/18)**:
  - ✅ `canManageTenants` - Tenant management
  - ✅ `canManageLeases` - Lease management
  - ✅ `canViewReports` - Leasing reports
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageMaintenance` - No maintenance access
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canViewAnalytics` - No analytics
  - ❌ `canManageVendors` - No vendor management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canExportData` - No data export
  - ❌ `canImportData` - No data import
  - ❌ `canManageTemplates` - No templates
  - ❌ `canViewAuditLogs` - No audit logs
  - ❌ `canManageIntegrations` - No integrations

#### **9. Marketing Specialist**
- **Department**: Leasing
- **Access Level**: Standard
- **Description**: Marketing and tenant acquisition focused role
- **Permissions (5/18)**:
  - ✅ `canViewReports` - Marketing reports
  - ✅ `canViewAnalytics` - Marketing analytics
  - ✅ `canManageMarketing` - Marketing management
  - ✅ `canExportData` - Marketing data export
  - ✅ `canManageTemplates` - Marketing templates
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageTenants` - No tenant management
  - ❌ `canManageMaintenance` - No maintenance access
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canManageVendors` - No vendor management
  - ❌ `canManageLeases` - No lease management
  - ❌ `canManageLegal` - No legal access
  - ❌ `canManageSettings` - No settings access
  - ❌ `canImportData` - No data import
  - ❌ `canViewAuditLogs` - No audit logs
  - ❌ `canManageIntegrations` - No integrations

### **⚖️ ADMINISTRATION DEPARTMENT**

#### **10. Legal Advisor**
- **Department**: Administration
- **Access Level**: Standard
- **Description**: Legal document management and compliance oversight
- **Permissions (6/18)**:
  - ✅ `canViewReports` - Legal reports
  - ✅ `canManageLeases` - Lease legal review
  - ✅ `canManageLegal` - Legal document management
  - ✅ `canExportData` - Legal data export
  - ✅ `canManageTemplates` - Legal templates
  - ✅ `canViewAuditLogs` - Legal audit logs
  - ❌ `canManageProperties` - No property management
  - ❌ `canManageTenants` - No tenant management
  - ❌ `canManageMaintenance` - No maintenance access
  - ❌ `canManageFinancials` - No financial access
  - ❌ `canManageTeam` - No team management
  - ❌ `canAssignProperties` - No property assignment
  - ❌ `canViewAnalytics` - No analytics
  - ❌ `canManageVendors` - No vendor management
  - ❌ `canManageMarketing` - No marketing
  - ❌ `canManageSettings` - No settings access
  - ❌ `canImportData` - No data import
  - ❌ `canManageIntegrations` - No integrations

#### **11. System Administrator**
- **Department**: Administration
- **Access Level**: Admin
- **Description**: Complete system access and configuration management
- **Permissions (18/18)**:
  - ✅ `canManageProperties` - Full property management
  - ✅ `canManageTenants` - Full tenant management
  - ✅ `canManageMaintenance` - Full maintenance access
  - ✅ `canViewReports` - All reports access
  - ✅ `canManageFinancials` - Full financial access
  - ✅ `canManageTeam` - Full team management
  - ✅ `canAssignProperties` - Full property assignment
  - ✅ `canViewAnalytics` - Full analytics access
  - ✅ `canManageVendors` - Full vendor management
  - ✅ `canManageLeases` - Full lease management
  - ✅ `canManageMarketing` - Full marketing access
  - ✅ `canManageLegal` - Full legal access
  - ✅ `canManageSettings` - Full settings access
  - ✅ `canExportData` - Full data export
  - ✅ `canImportData` - Full data import
  - ✅ `canManageTemplates` - Full templates access
  - ✅ `canViewAuditLogs` - Full audit logs
  - ✅ `canManageIntegrations` - Full integrations access

---

## 📊 **PERMISSION SUMMARY MATRIX**

### **Permission Distribution by Role**

| **Permission** | **PM** | **AM** | **RM** | **SM** | **MS** | **AS** | **FC** | **LA** | **MS** | **LA** | **SA** |
|----------------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|--------|
| **Properties** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Tenants** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **Maintenance** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Reports** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Financials** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Team** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Assign Props** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Analytics** | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Vendors** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Leases** | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ✅ |
| **Marketing** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Legal** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Settings** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Export** | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Import** | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Templates** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Audit Logs** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Integrations** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend:**
- **PM** = Property Manager
- **AM** = Assistant Manager  
- **RM** = Regional Manager
- **SM** = Senior Manager
- **MS** = Maintenance Staff
- **AS** = Accounting Staff
- **FC** = Financial Controller
- **LA** = Leasing Agent
- **MS** = Marketing Specialist
- **LA** = Legal Advisor
- **SA** = System Administrator

---

## 🔄 **PERMISSION MANAGEMENT RULES**

### **Auto-Selection Rules**
1. **Single Role Departments**: Maintenance department auto-selects "Maintenance Staff"
2. **Multi-Role Departments**: Manual selection required for Property Management, Accounting, Leasing, and Administration

### **Permission Reset Rules**
1. **Role Change**: All permissions reset to false before applying new role's permissions
2. **Department Change**: Role and permissions reset if incompatible
3. **Clean Slate**: Every role change starts with a clean permission state

### **Access Level Assignment**
1. **Basic**: Entry-level roles (Assistant Manager, Maintenance Staff, Leasing Agent)
2. **Standard**: Mid-level roles (Property Manager, Accounting Staff, Legal Advisor, Marketing Specialist)
3. **Advanced**: Senior roles (Regional Manager, Senior Manager, Financial Controller)
4. **Admin**: System administration (System Administrator)

---

## 🛡️ **SECURITY CONSIDERATIONS**

### **Principle of Least Privilege**
- Each role has only the permissions necessary for their job function
- No role has unnecessary access to sensitive data or operations
- Clear separation of duties between departments

### **Audit Trail**
- All permission changes are logged
- System administrators can view complete audit logs
- Financial controllers have access to financial audit logs
- Maintenance staff can view maintenance-specific audit logs

### **Data Protection**
- Financial data restricted to accounting roles
- Legal documents restricted to legal advisors
- Property management data restricted to property management roles
- Maintenance data restricted to maintenance roles

---

## 📈 **PERMISSION STATISTICS**

### **Permission Distribution**
- **Most Permissions**: System Administrator (18/18)
- **Least Permissions**: Leasing Agent (3/18)
- **Average Permissions**: 7.5 per role
- **Most Common Permission**: `canViewReports` (11/11 roles)

### **Department Permission Totals**
- **Property Management**: 44 permissions across 4 roles
- **Maintenance**: 5 permissions across 1 role
- **Accounting**: 12 permissions across 2 roles
- **Leasing**: 8 permissions across 2 roles
- **Administration**: 24 permissions across 2 roles

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Permission Storage**
```typescript
interface TeamMemberRole {
  id: string;
  name: string;
  description: string;
  department: string;
  permissions: {
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
  };
  defaultAccessLevel: 'Basic' | 'Standard' | 'Advanced' | 'Admin';
}
```

### **Department-Role Mapping**
```typescript
const DEPARTMENT_ROLES_MAP = {
  'Property Management': ['PROPERTY_MANAGER', 'ASSISTANT_MANAGER', 'REGIONAL_MANAGER', 'SENIOR_MANAGER'],
  'Maintenance': ['MAINTENANCE_STAFF'],
  'Accounting': ['ACCOUNTING_STAFF', 'FINANCIAL_CONTROLLER'],
  'Leasing': ['LEASING_AGENT', 'MARKETING_SPECIALIST'],
  'Administration': ['LEGAL_ADVISOR', 'SYSTEM_ADMINISTRATOR'],
};
```

---

## 📝 **CHANGE MANAGEMENT**

### **Adding New Permissions**
1. Update the `TeamMemberRole` interface
2. Add permission to all role definitions
3. Update database schema
4. Update frontend validation
5. Update this documentation

### **Adding New Roles**
1. Define role in `ROLE_DEFINITIONS`
2. Add to appropriate department in `DEPARTMENT_ROLES_MAP`
3. Update role display functions
4. Update this documentation

### **Modifying Existing Permissions**
1. Update role definition
2. Test permission application
3. Update this documentation
4. Notify affected users

---

*This document is maintained as part of the ORMI Property Management System and should be updated whenever permissions or roles are modified.* 