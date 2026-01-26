# E-GIRS Demo Preparation Guide

## Quick Start

### 1. Start the Development Server
```bash
cd /Users/gsharew/Desktop/E-GIRS/e-girs-prototype
npm run dev
```

The application will be available at: **http://localhost:3000**

### 2. Verify Build (Optional)
```bash
npm run build
npm start  # For production build
```

---

## Demo Credentials

### Admin Users
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `admin` | `Admin123!` | MInT Admin | Full system access |

### Regional Assessment Users
| Username | Password | Role | Unit |
|----------|----------|------|------|
| `contributor1` | `Contributor123!` | Data Contributor | Woreda 1 (Addis Ababa) |
| `approver1` | `Approver123!` | Regional Approver | Addis Ababa City Administration |
| `amhara_approver` | `Amhara123!` | Regional Approver | Amhara Region |

### Federal Institute Users
| Username | Password | Role | Unit |
|----------|----------|------|------|
| `institute_contributor` | `Institute123!` | Institute Data Contributor | Ministry of Health |
| `federal_approver` | `FederalApp123!` | Federal Approver | Ministry of Health |

### Central Committee Users
| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `committee1` | `Committee123!` | Central Committee Member | All units |
| `chairman` | `Chairman123!` | Chairman (CC) | All units |
| `secretary` | `Secretary123!` | Secretary (CC) | All units |

---

## Demo Scenarios

### Scenario 1: Data Contributor Workflow (5-7 minutes)
**User:** `contributor1` / `Contributor123!`

1. **Login** → Dashboard shows unit-specific metrics
2. **Data Submission** (`/data/submission`)
   - View current submission status
   - Create/edit submission for assigned unit
   - Fill assessment indicators
   - Upload supporting documents
   - Submit for approval
3. **View Reports** (`/reports/data-contributor`)
   - Unit Performance Report
   - Dimension scores and visualizations
   - Export to CSV

**Key Points:**
- Role-based access (only sees own unit)
- Submission workflow states
- Real-time score calculations

---

### Scenario 2: Regional Approver Workflow (5-7 minutes)
**User:** `approver1` / `Approver123!`

1. **Login** → Dashboard shows pending approvals
2. **Approval Queue** (`/approval/queue`)
   - View submissions from units in region
   - Review submission details
   - Approve or reject with comments
3. **Reports** (`/reports/regional-approver`)
   - Regional overview
   - Unit comparisons
   - Performance trends

**Key Points:**
- Hierarchical access (sees all units in region)
- Approval workflow
- Validation and feedback

---

### Scenario 3: Federal Institute Workflow (5 minutes)
**User:** `institute_contributor` / `Institute123!`

1. **Login** → Federal institute dashboard
2. **Data Submission** → Similar to regional contributor
3. **Reports** (`/reports/federal-contributor`)
   - Institute-specific reports
   - Federal-level metrics

**Key Points:**
- Separate workflow for federal institutes
- Different assessment framework

---

### Scenario 4: Central Committee Validation (5-7 minutes)
**User:** `committee1` / `Committee123!`

1. **Login** → Central committee dashboard
2. **Approval Queue** (`/approval/queue`)
   - View all validated submissions
   - Perform central validation
   - Subjective scoring
   - Final approval/rejection
3. **Reports** (`/reports/central-approver`)
   - National overview
   - Cross-regional comparisons
   - Comprehensive analytics

**Key Points:**
- Highest level access
- Final validation authority
- National-level reporting

---

### Scenario 5: Admin Management (5 minutes)
**User:** `admin` / `Admin123!`

1. **User Management** (`/admin/users`)
   - Create new users
   - Assign roles and units
   - Edit user permissions
2. **Administrative Units** (`/admin/administrative-units`)
   - View unit hierarchy
   - Manage unit structure
3. **Assessment Framework** (`/admin/assessment-framework`)
   - Configure dimensions
   - Manage indicators
   - Set assessment years

**Key Points:**
- System configuration
- User and unit management
- Framework customization

---

## Key Features to Highlight

### 1. Role-Based Access Control
- Each role sees only relevant data
- Scoped access based on unit hierarchy
- Protected routes and permissions

### 2. Multi-Stage Workflow
- Draft → Initial Approval → Central Validation → Validated
- Status tracking and notifications
- Rejection with feedback

### 3. Dynamic Assessment Framework
- Year-based assessments
- Configurable dimensions and indicators
- Weighted scoring system

### 4. Comprehensive Reporting
- Role-specific reports
- Interactive visualizations (charts, radar, bar charts)
- Export capabilities (CSV)
- Real-time score calculations

### 5. Hierarchical Aggregation
- Scores roll up from Woreda → Zone → Region → National
- Automatic calculations
- Unit scorecards

### 6. Data Visualization
- Bar charts for dimension performance
- Radar charts for multi-dimensional analysis
- Trend analysis over time
- Comparative views

---

## Pre-Demo Checklist

### Technical Setup
- [ ] Dependencies installed (`npm install`)
- [ ] Development server runs without errors (`npm run dev`)
- [ ] Browser cache cleared (or use incognito)
- [ ] Internet connection stable (if needed for assets)

### Data Preparation
- [ ] Test users exist in system (auto-created on first run)
- [ ] Sample submissions exist (check `/data/submissions-list`)
- [ ] Assessment years configured
- [ ] Administrative units loaded

### Browser Testing
- [ ] Test in Chrome/Firefox/Safari
- [ ] Responsive design works on different screen sizes
- [ ] All navigation links functional
- [ ] Forms submit correctly

### Demo Flow Practice
- [ ] Practice each scenario at least once
- [ ] Know where to find each feature
- [ ] Prepare answers for common questions
- [ ] Have backup plan if something breaks

---

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution:** Run `npm install` to ensure all dependencies are installed

### Issue: localStorage data conflicts
**Solution:** Clear browser localStorage or use incognito mode:
```javascript
// In browser console:
localStorage.clear();
```

### Issue: Build errors
**Solution:** 
```bash
rm -rf .next node_modules
npm install
npm run dev
```

### Issue: Users not loading
**Solution:** Check browser console for errors. Users are auto-created on first login attempt.

### Issue: Charts not rendering
**Solution:** Ensure `recharts` is installed: `npm install recharts`

---

## Demo Tips

1. **Start with Overview**: Begin with the public dashboard or admin view to show system scope
2. **Follow User Journey**: Demonstrate complete workflow from data entry to final report
3. **Show Role Differences**: Switch between users to highlight access control
4. **Highlight Calculations**: Show how scores are calculated and aggregated
5. **Emphasize Security**: Mention role-based access, protected routes, validation workflow
6. **Show Scalability**: Mention how system handles multiple units, years, and users
7. **Be Prepared for Questions**: 
   - Database integration (currently localStorage, ready for backend)
   - Production deployment
   - Multi-language support (framework ready)
   - Performance optimization

---

## System Architecture Highlights

- **Frontend**: Next.js 16 with React 19
- **Styling**: Tailwind CSS with custom theme
- **Charts**: Recharts library
- **State Management**: React Context API
- **Data Storage**: localStorage (demo), ready for backend integration
- **Authentication**: Role-based with protected routes
- **Responsive**: Mobile-friendly design

---

## Post-Demo Notes

After the demo, you may want to:
1. Document any questions asked
2. Note any features requested
3. Record any bugs or issues found
4. Update this guide with lessons learned

---

## Quick Reference: Navigation Paths

| Feature | Path | Roles |
|---------|------|-------|
| Dashboard | `/dashboard` | All |
| Login | `/login` | Public |
| Data Submission | `/data/submission` | Data Contributors |
| Approval Queue | `/approval/queue` | Approvers, Committee |
| User Management | `/admin/users` | Admins |
| Administrative Units | `/admin/administrative-units` | Admins, Committee |
| Assessment Framework | `/admin/assessment-framework` | MInT Admin |
| Reports | `/reports` | All (role-specific) |
| Profile | `/profile` | All |

---

**Good luck with your demo! 🚀**
