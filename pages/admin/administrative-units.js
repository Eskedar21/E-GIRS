import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getAllUnits, 
  getUnitsByType, 
  getValidParents, 
  createUnit, 
  isUnitNameUnique,
  UNIT_TYPES 
} from '../../data/administrativeUnits';

export default function AdministrativeUnitsManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [units, setUnits] = useState([]);
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

    if (!formData.officialUnitName.trim()) {
      newErrors.officialUnitName = 'Official Unit Name is required';
    } else {
      // Check uniqueness
      const parentId = (unitType === UNIT_TYPES.ZONE || unitType === UNIT_TYPES.SUB_CITY || unitType === UNIT_TYPES.WOREDA) 
        ? formData.parentUnitId || null 
        : null;
      
      if (!isUnitNameUnique(formData.officialUnitName, unitType, parentId)) {
        newErrors.officialUnitName = 'This unit name already exists for this type and parent';
      }
    }

    // Only validate unitType if it's not passed as parameter (for region/zone forms)
    if (!unitType && !formData.unitType) {
      newErrors.unitType = 'Unit Type is required';
    }

    // Validate parent requirement
    if (unitType === UNIT_TYPES.ZONE || unitType === UNIT_TYPES.SUB_CITY || unitType === UNIT_TYPES.WOREDA) {
      if (!formData.parentUnitId) {
        newErrors.parentUnitId = 'Parent Unit is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e, unitType) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    
    if (!validateForm(unitType)) {
      return;
    }

    try {
      const newUnit = createUnit({
        officialUnitName: formData.officialUnitName.trim(),
        unitType: unitType || formData.unitType,
        parentUnitId: formData.parentUnitId || null
      });

      // Refresh units list
      const updatedUnits = getAllUnits();
      setUnits(updatedUnits);
      setSuccessMessage(`${unitType || formData.unitType} "${newUnit.officialUnitName}" has been registered successfully!`);
      
      // Reset form
      setFormData({ officialUnitName: '', unitType: '', parentUnitId: '' });
      setErrors({});
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred while creating the unit.' });
    }
  };

  // Get valid parents based on current unit type and available units
  // This will automatically update when units change
  const validParents = formData.unitType 
    ? getValidParents(formData.unitType)
    : [];
  
  // For Woreda, always get valid parents (updates when units change)
  const woredaParents = getValidParents(UNIT_TYPES.WOREDA);

  return (
    <ProtectedRoute allowedRoles={['Super Admin', 'MInT Admin', 'Regional Admin', 'Institute Admin', 'Chairman (CC)', 'Central Committee Member', 'Secretary (CC)', 'Initial Approver']}>
      <Layout title="Administrative Unit Management">
        <div className="flex">
          <Sidebar />
        <main className="flex-grow ml-64 p-8 bg-white text-mint-dark-text min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-mint-primary-blue mb-2">
                Administrative Unit Management
              </h1>
              <p className="text-mint-dark-text/70">Register and manage administrative units in the hierarchy</p>
            </div>

        {/* Navigation Tabs */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-2 border border-mint-medium-gray">
          <nav className="flex space-x-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'list'
                  ? 'bg-mint-primary-blue text-white shadow-md'
                  : 'text-mint-dark-text hover:bg-mint-light-gray'
              }`}
            >
              📋 View All Units
            </button>
            <button
              onClick={() => setActiveTab('federal')}
              className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'federal'
                  ? 'bg-mint-primary-blue text-white shadow-md'
                  : 'text-mint-dark-text hover:bg-mint-light-gray'
              }`}
            >
              🏢 Register Federal Institute
            </button>
            <button
              onClick={() => setActiveTab('region')}
              className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'region'
                  ? 'bg-mint-primary-blue text-white shadow-md'
                  : 'text-mint-dark-text hover:bg-mint-light-gray'
              }`}
            >
              🗺️ Register Region/City
            </button>
            <button
              onClick={() => setActiveTab('zone')}
              className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'zone'
                  ? 'bg-mint-primary-blue text-white shadow-md'
                  : 'text-mint-dark-text hover:bg-mint-light-gray'
              }`}
            >
              📍 Register Zone/Sub-city
            </button>
            <button
              onClick={() => setActiveTab('woreda')}
              className={`py-2.5 px-4 font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'woreda'
                  ? 'bg-mint-primary-blue text-white shadow-md'
                  : 'text-mint-dark-text hover:bg-mint-light-gray'
              }`}
            >
              🏘️ Register Woreda
            </button>
          </nav>
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

        {/* List View */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden border border-mint-medium-gray">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-mint-dark-text mb-4">
                All Administrative Units ({units.length})
              </h2>
              {units.length === 0 ? (
                <p className="text-mint-dark-text">No administrative units registered yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-mint-medium-gray">
                    <thead className="bg-mint-primary-blue">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mint-light-gray uppercase tracking-wider">
                          Unit ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mint-light-gray uppercase tracking-wider">
                          Official Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mint-light-gray uppercase tracking-wider">
                          Unit Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-mint-light-gray uppercase tracking-wider">
                          Parent Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-mint-medium-gray">
                      {units.map((unit) => {
                        const parent = unit.parentUnitId 
                          ? units.find(u => u.unitId === parseInt(unit.parentUnitId))
                          : null;
                        return (
                          <tr key={unit.unitId} className="hover:bg-mint-light-gray">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {unit.unitId}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-mint-dark-text">
                              {unit.officialUnitName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {unit.unitType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-mint-dark-text">
                              {parent ? parent.officialUnitName : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Register Federal Institute Form */}
        {activeTab === 'federal' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
            <h2 className="text-2xl font-semibold text-mint-primary-blue mb-6">
              Register Federal Institute
            </h2>
            <form onSubmit={(e) => handleSubmit(e, UNIT_TYPES.FEDERAL_INSTITUTE)}>
              <div className="mb-4">
                <label htmlFor="federal-name" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Official Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="federal-name"
                  name="officialUnitName"
                  value={formData.officialUnitName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.officialUnitName ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                  placeholder="e.g., Ministry of Health"
                />
                {errors.officialUnitName && (
                  <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                )}
              </div>
              <button
                type="submit"
                className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Save Institute
              </button>
            </form>
          </div>
        )}

        {/* Register Region/City Administration Form */}
        {activeTab === 'region' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
            <h2 className="text-2xl font-semibold text-mint-primary-blue mb-6">
              Register Regional/City Administration Unit
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formData.unitType) {
                setErrors({ unitType: 'Unit Type is required' });
                return;
              }
              handleSubmit(e, formData.unitType);
            }}>
              <div className="mb-4">
                <label htmlFor="region-name" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Official Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="region-name"
                  name="officialUnitName"
                  value={formData.officialUnitName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.officialUnitName ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                  placeholder="e.g., Oromia Region or Addis Ababa City Administration"
                />
                {errors.officialUnitName && (
                  <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="region-type" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="region-type"
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.unitType ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                >
                  <option value="">Select Unit Type</option>
                  <option value={UNIT_TYPES.REGION}>Region</option>
                  <option value={UNIT_TYPES.CITY_ADMINISTRATION}>City Administration</option>
                </select>
                {errors.unitType && (
                  <p className="mt-1 text-sm text-red-500">{errors.unitType}</p>
                )}
              </div>
              <button
                type="submit"
                className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Save Unit
              </button>
            </form>
          </div>
        )}

        {/* Register Zone/Sub-city Form */}
        {activeTab === 'zone' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
            <h2 className="text-2xl font-semibold text-mint-primary-blue mb-6">
              Register Zone/Sub-city Unit
            </h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!formData.unitType) {
                setErrors({ unitType: 'Unit Type is required' });
                return;
              }
              handleSubmit(e, formData.unitType);
            }}>
              <div className="mb-4">
                <label htmlFor="zone-name" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Official Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="zone-name"
                  name="officialUnitName"
                  value={formData.officialUnitName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.officialUnitName ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                  placeholder="e.g., West Arsi Zone or Sub-city 1"
                />
                {errors.officialUnitName && (
                  <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="zone-type" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="zone-type"
                  name="unitType"
                  value={formData.unitType}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.unitType ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                >
                  <option value="">Select Unit Type</option>
                  <option value={UNIT_TYPES.ZONE}>Zone</option>
                  <option value={UNIT_TYPES.SUB_CITY}>Sub-city</option>
                </select>
                {errors.unitType && (
                  <p className="mt-1 text-sm text-red-500">{errors.unitType}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="zone-parent" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Parent Regional/City Administration <span className="text-red-500">*</span>
                </label>
                <select
                  id="zone-parent"
                  name="parentUnitId"
                  value={formData.parentUnitId}
                  onChange={handleInputChange}
                  disabled={!formData.unitType}
                  className={`w-full p-2 border rounded-md ${
                    errors.parentUnitId ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue disabled:bg-gray-100`}
                >
                  <option value="">Select Parent Unit</option>
                  {validParents.map((parent) => (
                    <option key={parent.unitId} value={parent.unitId}>
                      {parent.officialUnitName} ({parent.unitType})
                    </option>
                  ))}
                </select>
                {errors.parentUnitId && (
                  <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>
                )}
                {formData.unitType && validParents.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No parent units available. Please register a Region or City Administration first.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Save Unit
              </button>
            </form>
          </div>
        )}

        {/* Register Woreda Form */}
        {activeTab === 'woreda' && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-mint-medium-gray">
            <h2 className="text-2xl font-semibold text-mint-primary-blue mb-6">
              Register Woreda Unit
            </h2>
            <form onSubmit={(e) => handleSubmit(e, UNIT_TYPES.WOREDA)}>
              <div className="mb-4">
                <label htmlFor="woreda-name" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Official Unit Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="woreda-name"
                  name="officialUnitName"
                  value={formData.officialUnitName}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.officialUnitName ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                  placeholder="e.g., Woreda 1"
                />
                {errors.officialUnitName && (
                  <p className="mt-1 text-sm text-red-500">{errors.officialUnitName}</p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="woreda-parent" className="block text-sm font-semibold text-mint-dark-text mb-2">
                  Parent Zone/Sub-city <span className="text-red-500">*</span>
                </label>
                <select
                  id="woreda-parent"
                  name="parentUnitId"
                  value={formData.parentUnitId}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${
                    errors.parentUnitId ? 'border-red-500' : 'border-mint-medium-gray'
                  } focus:outline-none focus:ring-2 focus:ring-mint-primary-blue`}
                >
                  <option value="">Select Parent Unit</option>
                  {woredaParents.map((parent) => (
                    <option key={parent.unitId} value={parent.unitId}>
                      {parent.officialUnitName} ({parent.unitType})
                    </option>
                  ))}
                </select>
                {errors.parentUnitId && (
                  <p className="mt-1 text-sm text-red-500">{errors.parentUnitId}</p>
                )}
                {woredaParents.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    No parent units available. Please register a Zone or Sub-city first.
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="bg-mint-secondary-blue hover:bg-mint-primary-blue text-white font-bold py-2 px-6 rounded transition-colors"
              >
                Save Unit
              </button>
            </form>
          </div>
        )}
          </div>
        </main>
      </div>
    </Layout>
    </ProtectedRoute>
  );
}

