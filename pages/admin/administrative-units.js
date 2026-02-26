import { useState, useEffect, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  getAllUnits,
  getUnitsByType,
  getValidParents,
  createUnit,
  updateUnit,
  getUnitById,
  isUnitNameUnique,
  getChildUnits,
  UNIT_TYPES,
  UNIT_STATUS
} from '../../data/administrativeUnits';
import { getAccessibleUnitIds, canCreateUnit, canEditUnit } from '../../utils/permissions';

export default function AdministrativeUnitsManagement() {
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const [units, setUnits] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [formData, setFormData] = useState({
    officialUnitName: '',
    unitType: '',
    parentUnitId: '',
    pCode: '',
    status: UNIT_STATUS.ACTIVE
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const parentUnitSelectRef = useRef(null);
  const editParentUnitSelectRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [unitTypeFilter, setUnitTypeFilter] = useState('');

  useEffect(() => {
    setUnits(getAllUnits());
  }, [successMessage]);

  const treeStructure = useMemo(() => {
    const allUnits = units.length > 0 ? units : getAllUnits();
    const accessibleSet = user ? new Set(getAccessibleUnitIds(user, allUnits)) : new Set(allUnits.map(u => u.unitId));

    const getChildrenForUnit = (parentUnitId) => {
      return allUnits.filter(unit =>
        (unit.parentUnitId === parentUnitId || (unit.parentUnitId && String(unit.parentUnitId) === String(parentUnitId))) &&
        accessibleSet.has(unit.unitId)
      );
    };

    const buildTree = (unit, breadcrumb = []) => {
      const children = getChildrenForUnit(unit.unitId);
      const currentBreadcrumb = [...breadcrumb, { unitId: unit.unitId, name: unit.officialUnitName, type: unit.unitType }];
      return {
        ...unit,
        breadcrumb: currentBreadcrumb,
        children: children.map(child => buildTree(child, currentBreadcrumb))
      };
    };

    const rootUnits = allUnits.filter(unit => !unit.parentUnitId && accessibleSet.has(unit.unitId));
    return rootUnits.map(unit => buildTree(unit));
  }, [units, user]);

  const getUnitTypeColor = (unitType) => {
    const colors = {
      'Federal Institute': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'Region': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'City Administration': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'Zone': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'Sub-city': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'Woreda': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20',
      'Kebele': 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20'
    };
    return colors[unitType] || 'bg-[#0d6670]/10 text-[#0d6670] border-[#0d6670]/20';
  };

  const toggleNode = (unitId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) newSet.delete(unitId);
      else newSet.add(unitId);
      return newSet;
    });
    const scrollY = window.scrollY;
    setTimeout(() => window.scrollTo({ top: scrollY, behavior: 'instant' }), 0);
  };

  const handleAddClick = () => {
    setShowAddModal(true);
    setSelectedUnitType('');
    setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '', status: UNIT_STATUS.ACTIVE });
    setErrors({});
  };

  const handleUnitTypeSelect = (unitType) => {
    setSelectedUnitType(unitType);
    setFormData(prev => ({ ...prev, unitType }));
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (unitType, excludeUnitId = null) => {
    const newErrors = {};
    const finalUnitType = unitType || formData.unitType || selectedUnitType;

    if (!formData.officialUnitName.trim()) {
      newErrors.officialUnitName = 'Official Unit Name is required';
    } else {
      const parentId = (finalUnitType === UNIT_TYPES.ZONE || finalUnitType === UNIT_TYPES.SUB_CITY || finalUnitType === UNIT_TYPES.WOREDA)
        ? formData.parentUnitId || null
        : null;
      if (!isUnitNameUnique(formData.officialUnitName, finalUnitType, parentId, excludeUnitId)) {
        newErrors.officialUnitName = 'This unit name already exists for this type and parent';
      }
    }

    if (!finalUnitType) newErrors.unitType = 'Unit Type is required';

    if (finalUnitType === UNIT_TYPES.ZONE || finalUnitType === UNIT_TYPES.SUB_CITY || finalUnitType === UNIT_TYPES.WOREDA) {
      if (!formData.parentUnitId) newErrors.parentUnitId = 'Parent Unit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const finalUnitType = selectedUnitType || formData.unitType;
    if (!validateForm(finalUnitType)) return;

    const isFederalInstitute = finalUnitType === UNIT_TYPES.FEDERAL_INSTITUTE;
    try {
      const newUnit = createUnit({
        officialUnitName: formData.officialUnitName.trim(),
        unitType: finalUnitType,
        parentUnitId: formData.parentUnitId || null,
        pCode: isFederalInstitute ? null : (formData.pCode?.trim() || null),
        status: formData.status || UNIT_STATUS.ACTIVE
      });

      const updatedUnits = getAllUnits();
      setUnits(updatedUnits);
      setSuccessMessage(`${finalUnitType} "${newUnit.officialUnitName}" has been registered successfully!`);
      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '', status: UNIT_STATUS.ACTIVE });
      setSelectedUnitType('');
      setErrors({});
      setShowAddModal(false);

      if (newUnit.parentUnitId) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          newSet.add(newUnit.parentUnitId);
          let currentParentId = newUnit.parentUnitId;
          while (currentParentId) {
            const parentUnit = updatedUnits.find(u => u.unitId === currentParentId);
            if (parentUnit && parentUnit.parentUnitId) {
              newSet.add(parentUnit.parentUnitId);
              currentParentId = parentUnit.parentUnitId;
            } else break;
          }
          return newSet;
        });
      }
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred while creating the unit.' });
    }
  };

  const handleEditClick = (unit) => {
    setEditingUnitId(unit.unitId);
    setSelectedUnitType(unit.unitType);
    setFormData({
      officialUnitName: unit.officialUnitName,
      unitType: unit.unitType,
      parentUnitId: unit.parentUnitId || '',
      pCode: unit.pCode || '',
      status: unit.status || UNIT_STATUS.ACTIVE
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const finalUnitType = selectedUnitType || formData.unitType;
    if (!validateForm(finalUnitType, editingUnitId)) return;

    const isFederalInstitute = finalUnitType === UNIT_TYPES.FEDERAL_INSTITUTE;
    try {
      const updatedUnit = updateUnit(editingUnitId, {
        officialUnitName: formData.officialUnitName.trim(),
        unitType: finalUnitType,
        parentUnitId: formData.parentUnitId || null,
        pCode: isFederalInstitute ? null : (formData.pCode?.trim() || null),
        status: formData.status || UNIT_STATUS.ACTIVE
      });

      if (updatedUnit) {
        const updatedUnits = getAllUnits();
        setUnits(updatedUnits);
        setSuccessMessage(`${finalUnitType} "${updatedUnit.officialUnitName}" has been updated successfully!`);
        setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '', status: UNIT_STATUS.ACTIVE });
        setEditingUnitId(null);
        setErrors({});
        setShowEditModal(false);
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ general: 'Unit not found or could not be updated.' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred while updating the unit.' });
    }
  };

  const validParents = useMemo(() => {
    if (!selectedUnitType) return [];
    const allUnitsList = units.length > 0 ? units : getAllUnits();
    const accessibleSet = user ? new Set(getAccessibleUnitIds(user, allUnitsList)) : null;
    let parents = getValidParents(selectedUnitType);
    if (accessibleSet) {
      parents = parents.filter(p => accessibleSet.has(p.unitId));
    }
    if (editingUnitId) {
      const excludeIds = new Set([editingUnitId]);
      const collectDescendants = (parentId) => {
        getChildUnits(parentId).forEach(child => {
          excludeIds.add(child.unitId);
          collectDescendants(child.unitId);
        });
      };
      collectDescendants(editingUnitId);
      parents = parents.filter(parent => !excludeIds.has(parent.unitId));
    }
    return parents;
  }, [selectedUnitType, editingUnitId, units, user]);

  const filteredTreeStructure = useMemo(() => {
    let result = treeStructure;

    // Apply unit type filter: traverse entire tree and collect ALL nodes of the selected type (so new units are included)
    if (unitTypeFilter) {
      const collectByType = (nodes) => {
        let matched = [];
        nodes.forEach(node => {
          if (node.unitType === unitTypeFilter) {
            matched.push({ ...node, children: [] });
          }
          if (node.children && node.children.length > 0) {
            matched = matched.concat(collectByType(node.children));
          }
        });
        return matched;
      };
      result = collectByType(treeStructure);
    }

    // Apply search filter (works on current result: tree or flat list)
    if (!searchQuery.trim()) return result;
    const query = searchQuery.toLowerCase().trim();
    const filterTree = (nodes) =>
      nodes
        .map(node => {
          const matchesSearch = node.officialUnitName.toLowerCase().includes(query) ||
            (node.pCode && node.pCode.toLowerCase().includes(query));
          const filteredChildren = node.children && node.children.length > 0 ? filterTree(node.children) : [];
          const hasMatchingChildren = filteredChildren.length > 0;
          if (matchesSearch || hasMatchingChildren) {
            return { ...node, children: filteredChildren.length > 0 ? filteredChildren : (node.children || []) };
          }
          return null;
        })
        .filter(node => node !== null);
    return filterTree(result);
  }, [treeStructure, searchQuery, unitTypeFilter]);

  const TreeNode = ({ node, level = 0, isLast = false, hasNextSibling = false }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.unitId);
    const indent = level * 24;

    return (
      <div>
        <div className="flex items-center py-3 px-4 border-b border-gray-200">
          <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              <button onClick={(e) => toggleNode(node.unitId, e)} className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-mint-primary-blue transition-colors">
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                )}
              </button>
            ) : (
              <div className="w-5 h-5" />
            )}
          </div>
          <div style={{ width: `${indent}px` }} className="flex-shrink-0" />
          <Badge className={`${getUnitTypeColor(node.unitType)} text-xs font-medium px-2.5 py-1 border mr-3 flex-shrink-0`}>
            {node.unitType}
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {node.officialUnitName}
              {node.pCode && <span className="ml-2 text-xs text-gray-500 font-normal">({node.pCode})</span>}
            </div>
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${(node.status || UNIT_STATUS.ACTIVE) === UNIT_STATUS.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {(node.status || UNIT_STATUS.ACTIVE) === UNIT_STATUS.ACTIVE ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" aria-hidden />
            )}
            {(node.status || UNIT_STATUS.ACTIVE) === UNIT_STATUS.ACTIVE ? 'Active' : 'Inactive'}
          </span>
          {canEditUnit(user, node.unitId, units.length > 0 ? units : getAllUnits()) && (
            <button onClick={() => handleEditClick(node)} className="ml-3 px-3 py-1.5 text-xs font-medium text-mint-primary-blue hover:text-white hover:bg-mint-primary-blue border border-mint-primary-blue rounded-md transition-all flex-shrink-0" title="Edit unit">
              Edit
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, index) => (
              <TreeNode key={child.unitId} node={child} level={level + 1} isLast={isLast && index === node.children.length - 1} hasNextSibling={index < node.children.length - 1 || hasNextSibling} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const showPCodeForType = (unitType) => unitType && unitType !== UNIT_TYPES.FEDERAL_INSTITUTE;

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Regional Admin', 'Federal Admin', 'Chairman (CC)', 'Secretary (CC)']}>
      <Layout title="Administrative Unit Management">
        <div className="flex">
          <Sidebar />
          <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">Administrative Units</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Select
                    value={unitTypeFilter}
                    onChange={(e) => setUnitTypeFilter(e.target.value)}
                    className="w-[200px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-mint-primary-blue"
                  >
                    <option value="">All unit types</option>
                    <option value={UNIT_TYPES.FEDERAL_INSTITUTE}>{UNIT_TYPES.FEDERAL_INSTITUTE}</option>
                    <option value={UNIT_TYPES.REGION}>{UNIT_TYPES.REGION}</option>
                    <option value={UNIT_TYPES.CITY_ADMINISTRATION}>{UNIT_TYPES.CITY_ADMINISTRATION}</option>
                    <option value={UNIT_TYPES.ZONE}>{UNIT_TYPES.ZONE}</option>
                    <option value={UNIT_TYPES.SUB_CITY}>{UNIT_TYPES.SUB_CITY}</option>
                    <option value={UNIT_TYPES.WOREDA}>{UNIT_TYPES.WOREDA}</option>
                  </Select>
                  <div className="relative">
                    <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-transparent" />
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  {(user?.role === 'Super Admin' || user?.role === 'MInT Admin' || canCreateUnit(user, null, units.length > 0 ? units : getAllUnits()) || (user?.role === 'Regional Admin' && user?.officialUnitId)) && (
                    <Button onClick={handleAddClick} size="lg" className="bg-mint-primary-blue hover:bg-mint-secondary-blue">Add Unit</Button>
                  )}
                </div>
              </div>

              {successMessage && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</div>}
              {errors.general && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{errors.general}</div>}

              {filteredTreeStructure.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg text-mint-dark-text font-semibold mb-2">
                    {searchQuery ? 'No units found matching your search' : unitTypeFilter ? `No units of type "${unitTypeFilter}"` : 'No administrative units registered yet'}
                  </p>
                  <p className="text-sm text-mint-dark-text/70">
                    {searchQuery ? 'Try a different search term' : unitTypeFilter ? 'Try a different unit type filter or clear the filter' : 'Click "Add Unit" to get started'}
                  </p>
                </div>
              ) : (
                <div>
                  {filteredTreeStructure.map((rootNode, index) => (
                    <TreeNode key={rootNode.unitId} node={rootNode} level={0} isLast={index === filteredTreeStructure.length - 1} hasNextSibling={index < filteredTreeStructure.length - 1} />
                  ))}
                </div>
              )}

              {/* Edit Unit Modal */}
              <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-mint-primary-blue">Edit Administrative Unit</DialogTitle>
                    <DialogDescription>Update the information for this administrative unit.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditSubmit}>
                    <div className="mb-4">
                      <div className="p-3 bg-mint-primary-blue/10 rounded-lg">
                        <span className="text-sm font-semibold text-mint-primary-blue">Unit Type: {selectedUnitType}</span>
                        <p className="text-xs text-mint-dark-text/70 mt-1">Unit type cannot be changed</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="edit-unit-name" className="mb-2">Official Unit Name <span className="text-red-500">*</span></Label>
                      <Input type="text" id="edit-unit-name" name="officialUnitName" value={formData.officialUnitName} onChange={handleInputChange} className={errors.officialUnitName ? 'border-red-500' : ''} placeholder="Enter official unit name" />
                      {errors.officialUnitName && <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>}
                    </div>

                    {showPCodeForType(selectedUnitType) && (
                      <div className="mb-4">
                        <Label htmlFor="edit-pcode" className="mb-2">P-Code (Administrative Unit Code)</Label>
                        <Input type="text" id="edit-pcode" name="pCode" value={formData.pCode} onChange={handleInputChange} placeholder="e.g., ET01, ET0101" className="uppercase" />
                        <p className="mt-1 text-xs text-mint-dark-text/60">Unique administrative unit identifier (regional hierarchy only)</p>
                      </div>
                    )}

                    {(selectedUnitType === UNIT_TYPES.ZONE || selectedUnitType === UNIT_TYPES.SUB_CITY || selectedUnitType === UNIT_TYPES.WOREDA) && (
                      <div className="mb-4">
                        <Label htmlFor="edit-unit-parent" className="mb-2">Parent Unit <span className="text-red-500">*</span></Label>
                        <Select ref={editParentUnitSelectRef} id="edit-unit-parent" name="parentUnitId" value={formData.parentUnitId} onChange={handleInputChange} className={errors.parentUnitId ? 'border-red-500' : ''}>
                          <option value="">Select Parent Unit</option>
                          {validParents.map((parent) => (
                            <option key={parent.unitId} value={parent.unitId}>{parent.officialUnitName} ({parent.unitType})</option>
                          ))}
                        </Select>
                        {errors.parentUnitId && <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>}
                        {validParents.length === 0 && <p className="mt-1 text-sm text-yellow-600">No valid parent units available.</p>}
                      </div>
                    )}

                    <div className="mb-4">
                      <Label htmlFor="edit-unit-status" className="mb-2">Status</Label>
                      <Select id="edit-unit-status" name="status" value={formData.status} onChange={handleInputChange} className="border-gray-300">
                        <option value={UNIT_STATUS.ACTIVE}>Active</option>
                        <option value={UNIT_STATUS.INACTIVE}>Inactive</option>
                      </Select>
                    </div>

                    <DialogFooter className="mt-6">
                      <Button type="button" variant="outline" onClick={() => { setShowEditModal(false); setEditingUnitId(null); setSelectedUnitType(''); setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '', status: UNIT_STATUS.ACTIVE }); setErrors({}); }}>Cancel</Button>
                      <Button type="submit" className="bg-mint-primary-blue hover:bg-mint-secondary-blue">Update Unit</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Add Unit Modal */}
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-mint-primary-blue">Add New Administrative Unit</DialogTitle>
                    <DialogDescription>Select a unit type and fill in the required information to register a new administrative unit.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    {!selectedUnitType ? (
                      <div>
                        <label className="block text-sm font-semibold text-mint-dark-text mb-4">Select Unit Type <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-3">
                          {[UNIT_TYPES.FEDERAL_INSTITUTE, UNIT_TYPES.REGION, UNIT_TYPES.CITY_ADMINISTRATION, UNIT_TYPES.ZONE, UNIT_TYPES.SUB_CITY, UNIT_TYPES.WOREDA].map((type) => (
                            <button key={type} type="button" onClick={() => handleUnitTypeSelect(type)} className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left">
                              <div className="font-semibold text-mint-dark-text">{type}</div>
                              <div className="text-sm text-mint-dark-text/70 mt-1">
                                {type === UNIT_TYPES.FEDERAL_INSTITUTE && 'Top-level federal units'}
                                {type === UNIT_TYPES.REGION && 'Regional administration'}
                                {type === UNIT_TYPES.CITY_ADMINISTRATION && 'City-level administration'}
                                {type === UNIT_TYPES.ZONE && 'Zone within a region'}
                                {type === UNIT_TYPES.SUB_CITY && 'Sub-city within a city'}
                                {type === UNIT_TYPES.WOREDA && 'Woreda within zone/sub-city'}
                              </div>
                            </button>
                          ))}
                        </div>
                        {errors.unitType && <p className="mt-2 text-sm text-red-500">{errors.unitType}</p>}
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <Button type="button" variant="ghost" size="sm" onClick={() => { setSelectedUnitType(''); setFormData(prev => ({ ...prev, parentUnitId: '' })); }} className="text-mint-primary-blue">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Change Unit Type
                          </Button>
                          <div className="mt-2 p-3 bg-mint-primary-blue/10 rounded-lg"><span className="text-sm font-semibold text-mint-primary-blue">Selected: {selectedUnitType}</span></div>
                        </div>

                        {showPCodeForType(selectedUnitType) && (
                          <div className="mb-4">
                            <Label htmlFor="pcode" className="mb-2">P-Code (Administrative Unit Code)</Label>
                            <Input type="text" id="pcode" name="pCode" value={formData.pCode} onChange={handleInputChange} placeholder="e.g., ET01, ET0101" className="uppercase" />
                            <p className="mt-1 text-xs text-mint-dark-text/60">Unique administrative unit identifier (regional hierarchy only; Federal Institutions have no unit code)</p>
                          </div>
                        )}

                        <div className="mb-4">
                          <Label htmlFor="unit-name" className="mb-2">Official Unit Name <span className="text-red-500">*</span></Label>
                          <Input type="text" id="unit-name" name="officialUnitName" value={formData.officialUnitName} onChange={handleInputChange} className={errors.officialUnitName ? 'border-red-500' : ''} placeholder="Enter official unit name" />
                          {errors.officialUnitName && <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>}
                        </div>

                        {(selectedUnitType === UNIT_TYPES.ZONE || selectedUnitType === UNIT_TYPES.SUB_CITY || selectedUnitType === UNIT_TYPES.WOREDA) && (
                          <div className="mb-4">
                            <Label htmlFor="unit-parent" className="mb-2">Parent Unit <span className="text-red-500">*</span></Label>
                            <Select ref={parentUnitSelectRef} id="unit-parent" name="parentUnitId" value={formData.parentUnitId} onChange={handleInputChange} className={errors.parentUnitId ? 'border-red-500' : ''}>
                              <option value="">Select Parent Unit</option>
                              {validParents.map((parent) => (
                                <option key={parent.unitId} value={parent.unitId}>{parent.officialUnitName} ({parent.unitType})</option>
                              ))}
                            </Select>
                            {errors.parentUnitId && <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>}
                            {validParents.length === 0 && <p className="mt-1 text-sm text-yellow-600">No parent units available. Please register a parent unit first.</p>}
                          </div>
                        )}

                        <div className="mb-4">
                          <Label htmlFor="unit-status" className="mb-2">Status</Label>
                          <Select id="unit-status" name="status" value={formData.status} onChange={handleInputChange} className="border-gray-300">
                            <option value={UNIT_STATUS.ACTIVE}>Active</option>
                            <option value={UNIT_STATUS.INACTIVE}>Inactive</option>
                          </Select>
                        </div>

                        <DialogFooter className="mt-6">
                          <Button type="button" variant="outline" onClick={() => { setShowAddModal(false); setSelectedUnitType(''); setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '', status: UNIT_STATUS.ACTIVE }); setErrors({}); }}>Cancel</Button>
                          <Button type="submit" className="bg-mint-primary-blue hover:bg-mint-secondary-blue">Save Unit</Button>
                        </DialogFooter>
                      </div>
                    )}
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
