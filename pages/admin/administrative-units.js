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
  isUnitNameUnique,
  getChildUnits,
  UNIT_TYPES 
} from '../../data/administrativeUnits';

export default function AdministrativeUnitsManagement() {
  const { user } = useAuth();
  const [units, setUnits] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnitType, setSelectedUnitType] = useState('');
  const [formData, setFormData] = useState({
    officialUnitName: '',
    unitType: '',
    parentUnitId: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Refresh units list whenever it changes
  useEffect(() => {
    setUnits(getAllUnits());
  }, [successMessage]);

  // Build tree structure
  const treeStructure = useMemo(() => {
    const allUnits = getAllUnits();
    const rootUnits = allUnits.filter(unit => !unit.parentUnitId);
    
    const buildTree = (unit) => {
      const children = getChildUnits(unit.unitId);
      return {
        ...unit,
        children: children.map(child => buildTree(child))
      };
    };
    
    return rootUnits.map(unit => buildTree(unit));
  }, [units]);

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

  const validateForm = (unitType) => {
    const newErrors = {};
    const finalUnitType = unitType || formData.unitType || selectedUnitType;

    if (!formData.officialUnitName.trim()) {
      newErrors.officialUnitName = 'Official Unit Name is required';
    } else {
      // Check uniqueness
      const parentId = (finalUnitType === UNIT_TYPES.ZONE || finalUnitType === UNIT_TYPES.SUB_CITY || finalUnitType === UNIT_TYPES.WOREDA) 
        ? formData.parentUnitId || null 
        : null;
      
      if (!isUnitNameUnique(formData.officialUnitName, finalUnitType, parentId)) {
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
        parentUnitId: formData.parentUnitId || null
      });

      // Refresh units list
      const updatedUnits = getAllUnits();
      setUnits(updatedUnits);
      setSuccessMessage(`${finalUnitType} "${newUnit.officialUnitName}" has been registered successfully!`);
      
      // Reset form and close modal
      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '' });
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

  // Get valid parents based on selected unit type
  const validParents = selectedUnitType 
    ? getValidParents(selectedUnitType)
    : [];


  // Tree node component
  const TreeNode = ({ node, level = 0, isLast = false, parentPath = [] }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.unitId);
    const indent = level * 20;
    const currentPath = [...parentPath, node.unitId];

    return (
      <div className="relative">
        <div className="flex items-center group">
          {/* Vertical connector lines */}
          {level > 0 && (
            <div className="absolute left-0 top-0 bottom-0 flex" style={{ width: `${indent}px` }}>
              {parentPath.slice(0, -1).map((_, idx) => (
                <div
                  key={idx}
                  className="w-5 border-l border-gray-300"
                  style={{ marginLeft: `${idx * 20}px` }}
                />
              ))}
              {!isLast && (
                <div
                  className="w-5 border-l border-gray-300"
                  style={{ marginLeft: `${(parentPath.length - 1) * 20}px` }}
                />
              )}
            </div>
          )}
          
          {/* Horizontal connector line */}
          {level > 0 && (
            <div
              className="absolute border-t border-gray-300"
              style={{
                left: `${(level - 1) * 20 + 10}px`,
                width: '10px',
                top: '50%'
              }}
            />
          )}

          <div
            className="flex items-center py-1.5 px-2 hover:bg-gray-50 rounded transition-colors"
            style={{ paddingLeft: `${indent + 12}px` }}
          >
            {/* Expand/Collapse arrow */}
            {hasChildren ? (
              <button
                onClick={() => toggleNode(node.unitId)}
                className="mr-1.5 w-4 h-4 flex items-center justify-center text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                {isExpanded ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ) : (
              <span className="mr-1.5 w-4 h-4" />
            )}


            {/* Unit Name */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900">
                {node.officialUnitName}
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
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
              <div className="space-y-0.5">
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
                          setFormData({ officialUnitName: '', unitType: '', parentUnitId: '' });
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

