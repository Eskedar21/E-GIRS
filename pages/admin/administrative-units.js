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
  UNIT_TYPES 
} from '../../data/administrativeUnits';

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
    pCode: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const parentUnitSelectRef = useRef(null);
  const editParentUnitSelectRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Refresh units list whenever it changes
  useEffect(() => {
    setUnits(getAllUnits());
  }, [successMessage]);

  // Build tree structure with breadcrumb paths
  const treeStructure = useMemo(() => {
    const allUnits = getAllUnits();
    const rootUnits = allUnits.filter(unit => !unit.parentUnitId);
    
    const buildTree = (unit, breadcrumb = []) => {
      const children = getChildUnits(unit.unitId);
      const currentBreadcrumb = [...breadcrumb, { unitId: unit.unitId, name: unit.officialUnitName, type: unit.unitType }];
      return {
        ...unit,
        breadcrumb: currentBreadcrumb,
        children: children.map(child => buildTree(child, currentBreadcrumb))
      };
    };
    
    return rootUnits.map(unit => buildTree(unit));
  }, [units]);

  // Get unit type color for badges
  const getUnitTypeColor = (unitType) => {
    const colors = {
      'Federal Institute': 'bg-blue-100 text-blue-800 border-blue-200',
      'Region': 'bg-blue-100 text-blue-800 border-blue-200',
      'City Administration': 'bg-blue-100 text-blue-800 border-blue-200',
      'Zone': 'bg-green-100 text-green-800 border-green-200',
      'Sub-city': 'bg-green-100 text-green-800 border-green-200',
      'Woreda': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Kebele': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[unitType] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const toggleNode = (unitId, event) => {
    // Prevent scroll when expanding/collapsing
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
    
    // Maintain scroll position
    const scrollY = window.scrollY;
    setTimeout(() => {
      window.scrollTo({
        top: scrollY,
        behavior: 'instant'
      });
    }, 0);
  };

  const handleAddClick = () => {
    setShowAddModal(true);
    setSelectedUnitType('');
    setFormData({ officialUnitName: '', unitType: '', parentUnitId: '' });
    setErrors({});
  };

  const handleUnitTypeSelect = (unitType) => {
    setSelectedUnitType(unitType);
    setFormData(prev => ({ ...prev, unitType }));
    setErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (unitType, excludeUnitId = null) => {
    const newErrors = {};
    const finalUnitType = unitType || formData.unitType || selectedUnitType;

    if (!formData.officialUnitName.trim()) {
      newErrors.officialUnitName = 'Official Unit Name is required';
    } else {
      // Check uniqueness (exclude current unit when editing)
      const parentId = (finalUnitType === UNIT_TYPES.ZONE || finalUnitType === UNIT_TYPES.SUB_CITY || finalUnitType === UNIT_TYPES.WOREDA) 
        ? formData.parentUnitId || null 
        : null;
      
      if (!isUnitNameUnique(formData.officialUnitName, finalUnitType, parentId, excludeUnitId)) {
        newErrors.officialUnitName = 'This unit name already exists for this type and parent';
      }
    }

    if (!finalUnitType) {
      newErrors.unitType = 'Unit Type is required';
    }

    // Validate parent requirement
    if (finalUnitType === UNIT_TYPES.ZONE || finalUnitType === UNIT_TYPES.SUB_CITY || finalUnitType === UNIT_TYPES.WOREDA) {
      if (!formData.parentUnitId) {
        newErrors.parentUnitId = 'Parent Unit is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    const finalUnitType = selectedUnitType || formData.unitType;
    if (!validateForm(finalUnitType)) {
      return;
    }

    try {
      const newUnit = createUnit({
        officialUnitName: formData.officialUnitName.trim(),
        unitType: finalUnitType,
        parentUnitId: formData.parentUnitId || null,
        pCode: formData.pCode?.trim() || null
      });

      // Refresh units list
      const updatedUnits = getAllUnits();
      setUnits(updatedUnits);
      setSuccessMessage(`${finalUnitType} "${newUnit.officialUnitName}" has been registered successfully!`);
      
      // Reset form and close modal
      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '' });
      setSelectedUnitType('');
      setErrors({});
      setShowAddModal(false);
      
      // Expand parent node if unit has a parent, and ensure all ancestor nodes are expanded
      if (newUnit.parentUnitId) {
        setExpandedNodes(prev => {
          const newSet = new Set(prev);
          newSet.add(newUnit.parentUnitId);
          // Also expand all ancestor nodes
          let currentParentId = newUnit.parentUnitId;
          while (currentParentId) {
            const parentUnit = updatedUnits.find(u => u.unitId === currentParentId);
            if (parentUnit && parentUnit.parentUnitId) {
              newSet.add(parentUnit.parentUnitId);
              currentParentId = parentUnit.parentUnitId;
            } else {
              break;
            }
          }
          return newSet;
        });
      }
      
      // Clear success message after 5 seconds
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
      pCode: unit.pCode || ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    
    const finalUnitType = selectedUnitType || formData.unitType;
    if (!validateForm(finalUnitType, editingUnitId)) {
      return;
    }

    try {
      const updatedUnit = updateUnit(editingUnitId, {
        officialUnitName: formData.officialUnitName.trim(),
        unitType: finalUnitType,
        parentUnitId: formData.parentUnitId || null,
        pCode: formData.pCode?.trim() || null
      });

      if (updatedUnit) {
        // Refresh units list
        const updatedUnits = getAllUnits();
        setUnits(updatedUnits);
        setSuccessMessage(`${finalUnitType} "${updatedUnit.officialUnitName}" has been updated successfully!`);
        
        // Reset form and close modal
        setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '' });
        setSelectedUnitType('');
        setEditingUnitId(null);
        setErrors({});
        setShowEditModal(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrors({ general: 'Unit not found or could not be updated.' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred while updating the unit.' });
    }
  };

  // Get valid parents based on selected unit type (exclude current unit and its descendants when editing)
  const validParents = useMemo(() => {
    if (!selectedUnitType) return [];
    
    let parents = getValidParents(selectedUnitType);
    
    // When editing, exclude the current unit and its descendants from parent options
    if (editingUnitId) {
      const excludeIds = new Set([editingUnitId]);
      const collectDescendants = (parentId) => {
        const children = getChildUnits(parentId);
        children.forEach(child => {
          excludeIds.add(child.unitId);
          collectDescendants(child.unitId);
        });
      };
      collectDescendants(editingUnitId);
      parents = parents.filter(parent => !excludeIds.has(parent.unitId));
    }
    
    return parents;
  }, [selectedUnitType, editingUnitId]);


  // Filter tree structure based on search query
  const filteredTreeStructure = useMemo(() => {
    if (!searchQuery.trim()) {
      return treeStructure;
    }
    
    const filterTree = (nodes) => {
      return nodes
        .map(node => {
          const matchesSearch = node.officialUnitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               (node.pCode && node.pCode.toLowerCase().includes(searchQuery.toLowerCase()));
          
          const filteredChildren = node.children ? filterTree(node.children) : [];
          const hasMatchingChildren = filteredChildren.length > 0;
          
          if (matchesSearch || hasMatchingChildren) {
            return {
              ...node,
              children: filteredChildren.length > 0 ? filteredChildren : node.children
            };
          }
          return null;
        })
        .filter(node => node !== null);
    };
    
    return filterTree(treeStructure);
  }, [treeStructure, searchQuery]);

  // Tree node component with simplified hierarchy style
  const TreeNode = ({ node, level = 0, isLast = false, hasNextSibling = false }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.unitId);
    const indent = level * 24;

    return (
      <div>
        <div className="flex items-center py-3 px-4 border-b border-gray-200">
          {/* Expand/Collapse icon */}
          <div className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={(e) => toggleNode(node.unitId, e)}
                className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-mint-primary-blue transition-colors"
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </button>
            ) : (
              <div className="w-5 h-5" />
            )}
          </div>

          {/* Indentation spacer */}
          <div style={{ width: `${indent}px` }} className="flex-shrink-0" />

          {/* Unit Type Badge */}
          <Badge className={`${getUnitTypeColor(node.unitType)} text-xs font-medium px-2.5 py-1 border mr-3 flex-shrink-0 hover:!bg-opacity-100 hover:!text-opacity-100`}>
            {node.unitType}
          </Badge>

          {/* Unit Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {node.officialUnitName}
              {node.pCode && (
                <span className="ml-2 text-xs text-gray-500 font-normal">({node.pCode})</span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => handleEditClick(node)}
            className="ml-3 px-3 py-1.5 text-xs font-medium text-mint-primary-blue hover:text-white hover:bg-mint-primary-blue border border-mint-primary-blue rounded-md transition-all flex-shrink-0"
            title="Edit unit"
          >
            Edit
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map((child, index) => (
              <TreeNode
                key={child.unitId}
                node={child}
                level={level + 1}
                isLast={isLast && index === node.children.length - 1}
                hasNextSibling={index < node.children.length - 1 || hasNextSibling}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)', 'Central Committee Member', 'Secretary (CC)']}>
      <Layout title="Administrative Unit Management">
        <div className="flex">
          <Sidebar />
        <main className={`flex-grow p-8 bg-white text-mint-dark-text min-h-screen transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Administrative Units
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-mint-primary-blue focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Button onClick={handleAddClick} size="lg" className="bg-mint-primary-blue hover:bg-mint-secondary-blue">
                  Add Unit
                </Button>
              </div>
            </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        {/* Tree View */}
        {filteredTreeStructure.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-mint-dark-text font-semibold mb-2">
              {searchQuery ? 'No units found matching your search' : 'No administrative units registered yet'}
            </p>
            <p className="text-sm text-mint-dark-text/70">
              {searchQuery ? 'Try a different search term' : 'Click "Add Unit" to get started'}
            </p>
          </div>
        ) : (
          <div>
            {filteredTreeStructure.map((rootNode, index) => (
              <TreeNode
                key={rootNode.unitId}
                node={rootNode}
                level={0}
                isLast={index === filteredTreeStructure.length - 1}
                hasNextSibling={index < filteredTreeStructure.length - 1}
              />
            ))}
          </div>
        )}

        {/* Edit Unit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-mint-primary-blue">
                Edit Administrative Unit
              </DialogTitle>
              <DialogDescription>
                Update the information for this administrative unit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div>
                <div className="mb-4">
                  <div className="p-3 bg-mint-primary-blue/10 rounded-lg">
                    <span className="text-sm font-semibold text-mint-primary-blue">Unit Type: {selectedUnitType}</span>
                    <p className="text-xs text-mint-dark-text/70 mt-1">Unit type cannot be changed</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Label htmlFor="edit-unit-name" className="mb-2">
                    Official Unit Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="edit-unit-name"
                    name="officialUnitName"
                    value={formData.officialUnitName}
                    onChange={handleInputChange}
                    className={errors.officialUnitName ? 'border-red-500' : ''}
                    placeholder="Enter official unit name"
                  />
                  {errors.officialUnitName && (
                    <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                  )}
                </div>

                {(selectedUnitType === UNIT_TYPES.ZONE || selectedUnitType === UNIT_TYPES.SUB_CITY || selectedUnitType === UNIT_TYPES.WOREDA) && (
                  <div className="mb-4">
                    <Label htmlFor="edit-unit-parent" className="mb-2">
                      Parent Unit <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      ref={editParentUnitSelectRef}
                      id="edit-unit-parent"
                      name="parentUnitId"
                      value={formData.parentUnitId}
                      onChange={handleInputChange}
                      onMouseDown={(e) => {
                        // Store current scroll position
                        const scrollY = window.scrollY;
                        // Prevent default to stop immediate scroll
                        const select = e.target;
                        if (select instanceof HTMLSelectElement) {
                          // Allow the select to open, but restore scroll position
                          setTimeout(() => {
                            window.scrollTo({
                              top: scrollY,
                              behavior: 'instant'
                            });
                          }, 0);
                        }
                      }}
                      className={errors.parentUnitId ? 'border-red-500' : ''}
                    >
                      <option value="">Select Parent Unit</option>
                      {validParents.map((parent) => (
                        <option key={parent.unitId} value={parent.unitId}>
                          {parent.officialUnitName} ({parent.unitType})
                        </option>
                      ))}
                    </Select>
                    {errors.parentUnitId && (
                      <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>
                    )}
                    {validParents.length === 0 && (
                      <p className="mt-1 text-sm text-yellow-600">
                        No valid parent units available.
                      </p>
                    )}
                  </div>
                )}

                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUnitId(null);
                      setSelectedUnitType('');
                      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '' });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                  >
                    Update Unit
                  </Button>
                </DialogFooter>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Unit Modal */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-mint-primary-blue">
                Add New Administrative Unit
              </DialogTitle>
              <DialogDescription>
                Select a unit type and fill in the required information to register a new administrative unit.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
                {!selectedUnitType ? (
                  <div>
                    <label className="block text-sm font-semibold text-mint-dark-text mb-4">
                      Select Unit Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.FEDERAL_INSTITUTE)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">Federal Institute</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">Top-level federal units</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.REGION)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">Region</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">Regional administration</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.CITY_ADMINISTRATION)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">City Administration</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">City-level administration</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.ZONE)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">Zone</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">Zone within a region</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.SUB_CITY)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">Sub-city</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">Sub-city within a city</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitTypeSelect(UNIT_TYPES.WOREDA)}
                        className="p-4 border-2 border-mint-medium-gray rounded-lg hover:border-mint-primary-blue hover:bg-mint-primary-blue/5 transition-all text-left"
                      >
                        <div className="font-semibold text-mint-dark-text">Woreda</div>
                        <div className="text-sm text-mint-dark-text/70 mt-1">Woreda within zone/sub-city</div>
                      </button>
                    </div>
                    {errors.unitType && (
                      <p className="mt-2 text-sm text-red-500">{errors.unitType}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUnitType('');
                          setFormData({ ...formData, parentUnitId: '' });
                        }}
                        className="text-mint-primary-blue"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Change Unit Type
                      </Button>
                      <div className="mt-2 p-3 bg-mint-primary-blue/10 rounded-lg">
                        <span className="text-sm font-semibold text-mint-primary-blue">Selected: {selectedUnitType}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="pcode" className="mb-2">
                        P-Code (Administrative Unit Code)
                      </Label>
                      <Input
                        type="text"
                        id="pcode"
                        name="pCode"
                        value={formData.pCode}
                        onChange={handleInputChange}
                        placeholder="e.g., ET01, ET0101, ET010101"
                        className="uppercase"
                      />
                      <p className="mt-1 text-xs text-mint-dark-text/60">
                        Unique administrative unit identifier (e.g., ET01 for regions, ET0101 for zones)
                      </p>
                    </div>

                    <div className="mb-4">
                      <Label htmlFor="unit-name" className="mb-2">
                        Official Unit Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        id="unit-name"
                        name="officialUnitName"
                        value={formData.officialUnitName}
                        onChange={handleInputChange}
                        className={errors.officialUnitName ? 'border-red-500' : ''}
                        placeholder={
                          selectedUnitType === UNIT_TYPES.FEDERAL_INSTITUTE 
                            ? "e.g., Ministry of Health"
                            : selectedUnitType === UNIT_TYPES.REGION || selectedUnitType === UNIT_TYPES.CITY_ADMINISTRATION
                            ? `e.g., ${selectedUnitType === UNIT_TYPES.REGION ? 'Oromia Region' : 'Addis Ababa City Administration'}`
                            : selectedUnitType === UNIT_TYPES.ZONE || selectedUnitType === UNIT_TYPES.SUB_CITY
                            ? `e.g., ${selectedUnitType === UNIT_TYPES.ZONE ? 'West Arsi Zone' : 'Sub-city 1'}`
                            : "e.g., Woreda 1"
                        }
                      />
                      {errors.officialUnitName && (
                        <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                      )}
                    </div>

                    {(selectedUnitType === UNIT_TYPES.ZONE || selectedUnitType === UNIT_TYPES.SUB_CITY || selectedUnitType === UNIT_TYPES.WOREDA) && (
                      <div className="mb-4">
                        <Label htmlFor="unit-parent" className="mb-2">
                          Parent Unit <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          ref={parentUnitSelectRef}
                          id="unit-parent"
                          name="parentUnitId"
                          value={formData.parentUnitId}
                          onChange={handleInputChange}
                          onMouseDown={(e) => {
                            // Store current scroll position
                            const scrollY = window.scrollY;
                            // Prevent default to stop immediate scroll
                            const select = e.target;
                            if (select instanceof HTMLSelectElement) {
                              // Allow the select to open, but restore scroll position
                              setTimeout(() => {
                                window.scrollTo({
                                  top: scrollY,
                                  behavior: 'instant'
                                });
                              }, 0);
                            }
                          }}
                          className={errors.parentUnitId ? 'border-red-500' : ''}
                        >
                          <option value="">Select Parent Unit</option>
                          {validParents.map((parent) => (
                            <option key={parent.unitId} value={parent.unitId}>
                              {parent.officialUnitName} ({parent.unitType})
                            </option>
                          ))}
                        </Select>
                        {errors.parentUnitId && (
                          <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>
                        )}
                        {validParents.length === 0 && (
                          <p className="mt-1 text-sm text-yellow-600">
                            No parent units available. Please register a parent unit first.
                          </p>
                        )}
                      </div>
                    )}

                    <DialogFooter className="mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddModal(false);
                          setSelectedUnitType('');
                      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '', pCode: '' });
                      setErrors({});
                    }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-mint-primary-blue hover:bg-mint-secondary-blue"
                      >
                        Save Unit
                      </Button>
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

