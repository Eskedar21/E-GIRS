# Pre-Demo Checklist

Use this checklist to ensure everything is ready before your demo.

## ✅ Technical Setup

- [ ] Node.js installed (v18+ recommended)
- [ ] All dependencies installed: `npm install`
- [ ] Development server starts: `npm run dev`
- [ ] Application loads at http://localhost:3000
- [ ] No console errors in browser
- [ ] Build succeeds: `npm run build` (optional)

## ✅ Data & Users

- [ ] Can login with test accounts
- [ ] Users have correct roles assigned
- [ ] Sample submissions exist (or can create new ones)
- [ ] Assessment years are configured
- [ ] Administrative units are loaded

## ✅ Feature Testing

### Authentication
- [ ] Login works for all test accounts
- [ ] Logout works
- [ ] Protected routes redirect correctly
- [ ] Role-based access enforced

### Data Submission
- [ ] Data Contributor can create submission
- [ ] Can fill assessment indicators
- [ ] Can upload documents (if implemented)
- [ ] Can submit for approval

### Approval Workflow
- [ ] Approver sees pending submissions
- [ ] Can approve/reject submissions
- [ ] Status updates correctly
- [ ] Central Committee can validate

### Reports
- [ ] Reports load without errors
- [ ] Charts render correctly
- [ ] Data displays accurately
- [ ] Export functions work (CSV)

### Admin Functions
- [ ] Can view user list
- [ ] Can create/edit users
- [ ] Can view administrative units
- [ ] Can view assessment framework

## ✅ Browser Testing

- [ ] Tested in Chrome/Edge
- [ ] Tested in Firefox (optional)
- [ ] Tested in Safari (optional)
- [ ] Responsive design works
- [ ] No layout issues

## ✅ Demo Preparation

- [ ] Reviewed demo scenarios
- [ ] Practiced each user flow
- [ ] Prepared answers for common questions
- [ ] Have backup plan if issues occur
- [ ] Demo credentials ready (printed/saved)
- [ ] Internet connection stable
- [ ] Screen sharing setup tested (if remote)

## ✅ Documentation

- [ ] README.md reviewed
- [ ] DEMO_PREPARATION.md reviewed
- [ ] DEMO_QUICK_REFERENCE.md ready
- [ ] Know where to find key information

## ✅ Cleanup (Optional)

- [ ] Clear browser localStorage if needed
- [ ] Remove test data if desired
- [ ] Close unnecessary browser tabs
- [ ] Close unnecessary applications

## 🚨 Emergency Fixes

If something breaks during demo:

1. **Server crashes**: Restart with `npm run dev`
2. **Data issues**: Clear localStorage in browser console: `localStorage.clear()`
3. **Login problems**: Use incognito/private window
4. **Build errors**: Check Node.js version, reinstall dependencies

## 📝 Notes

Write any issues or reminders here:
- 
- 
- 

---

**Status:** ⬜ Not Ready | ✅ Ready for Demo

**Date:** _______________

**Demo Time:** _______________
