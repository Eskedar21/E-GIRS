import { useState, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
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
    // Neutral styling for all badges
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const toggleNode = (unitId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(unitId)) {
        newSet.delete(unitId);
      } else {
        newSet.add(unitId);
      }
      return newSet;
    });
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


  // Tree node component with enhanced hierarchy visualization
  const TreeNode = ({ node, level = 0, isLast = false, parentPath = [] }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.unitId);
    const indent = level * 40;
    const currentPath = [...parentPath, node.unitId];

    return (
      <div className="relative">
        <div className="flex items-center group">
          {/* Enhanced vertical connector lines */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: `${indent}px` }}>
              {parentPath.slice(0, -1).map((_, idx) => (
                <div
                  key={idx}
                  className="w-10 border-l-2 border-gray-300"
                  style={{ marginLeft: `${idx * 40}px` }}
                />
              ))}
              {!isLast && (
                <div
                  className="w-10 border-l-2 border-gray-300"
                  style={{ marginLeft: `${(parentPath.length - 1) * 40}px` }}
                />
              )}
            </div>
          )}
          
          {/* Enhanced horizontal connector line */}
          {level > 0 && (
            <div
              className="absolute border-t-2 border-gray-300"
              style={{
                left: `${(level - 1) * 40 + 20}px`,
                width: '20px',
                top: '50%'
              }}
            />
          )}

          <div
            className={`flex items-center py-3 px-4 rounded-lg border-l-4 transition-all group-hover:shadow-md group-hover:bg-gray-50 bg-white ${
              level === 0 ? 'border-mint-primary-blue' : 
              level === 1 ? 'border-mint-secondary-blue' : 
              level === 2 ? 'border-mint-primary-blue/60' : 
              'border-gray-300'
            }`}
            style={{ paddingLeft: `${indent + 24}px`, marginLeft: level > 0 ? '0' : '0' }}
          >
            {/* Expand/Collapse arrow */}
            {hasChildren ? (
              <button
                onClick={() => toggleNode(node.unitId)}
                className="mr-3 w-6 h-6 flex items-center justify-center text-gray-600 hover:text-mint-primary-blue hover:bg-gray-100 rounded flex-shrink-0 transition-all"
              >
                {isExpanded ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ) : (
              <span className="mr-3 w-6 h-6 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
              </span>
            )}

            {/* Unit Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                {/* P-Code Badge */}
                {node.pCode && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-mint-primary-blue text-white border border-mint-primary-blue shadow-sm">
                      {node.pCode}
                    </span>
                  </div>
                )}
                <div className="font-semibold text-gray-900 text-base">
                  {node.officialUnitName}
                </div>
                <Badge className={`${getUnitTypeColor(node.unitType)} text-xs font-medium px-2.5 py-0.5 border`}>
                  {node.unitType}
                </Badge>
              </div>
              {/* Breadcrumb path */}
              {node.breadcrumb && node.breadcrumb.length > 1 && (
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="text-gray-400">Path:</span>
                  {node.breadcrumb.slice(0, -1).map((crumb, idx) => (
                    <span key={idx} className="flex items-center">
                      <span className="text-mint-primary-blue font-medium">{crumb.name}</span>
                      {idx < node.breadcrumb.length - 2 && (
                        <svg className="w-3 h-3 mx-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => handleEditClick(node)}
              className="ml-3 px-3 py-1.5 text-xs font-medium text-mint-primary-blue hover:text-white hover:bg-mint-primary-blue border border-mint-primary-blue rounded-md transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
              title="Edit unit"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children.map((child, index) => (
              <TreeNode
                key={child.unitId}
                node={child}
                level={level + 1}
                isLast={index === node.children.length - 1}
                parentPath={currentPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)', 'Central Committee Member', 'Secretary (CC)', 'Initial Approver']}>
      <Layout title="Administrative Unit Management">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                  Administrative Unit Management
                </h1>
                <p className="text-mint-dark-text/70">Register and manage administrative units in the hierarchy</p>
              </div>
              <Button onClick={handleAddClick} size="lg" className="bg-mint-primary-blue hover:bg-mint-secondary-blue">
                Add Unit
              </Button>
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
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-mint-primary-blue/5 to-mint-secondary-blue/5 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-mint-primary-blue">
                  Administrative Units Hierarchy
                </CardTitle>
                <CardDescription className="text-sm">
                  {units.length} {units.length === 1 ? 'unit' : 'units'} in {treeStructure.length} {treeStructure.length === 1 ? 'root branch' : 'root branches'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (expandedNodes.size === 0) {
                      // Expand all
                      const allNodeIds = new Set();
                      const collectIds = (nodes) => {
                        nodes.forEach(node => {
                          if (node.children && node.children.length > 0) {
                            allNodeIds.add(node.unitId);
                            collectIds(node.children);
                          }
                        });
                      };
                      collectIds(treeStructure);
                      setExpandedNodes(allNodeIds);
                    } else {
                      // Collapse all
                      setExpandedNodes(new Set());
                    }
                  }}
                >
                  {expandedNodes.size === 0 ? 'Expand All' : 'Collapse All'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {treeStructure.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-mint-dark-text font-semibold mb-2">No administrative units registered yet</p>
                <p className="text-sm text-mint-dark-text/70">Click "Add Unit" to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {treeStructure.map((rootNode, index) => (
                  <TreeNode
                    key={rootNode.unitId}
                    node={rootNode}
                    level={0}
                    isLast={index === treeStructure.length - 1}
                    parentPath={[]}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                      id="edit-unit-parent"
                      name="parentUnitId"
                      value={formData.parentUnitId}
                      onChange={handleInputChange}
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
                          id="unit-parent"
                          name="parentUnitId"
                          value={formData.parentUnitId}
                          onChange={handleInputChange}
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

