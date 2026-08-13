import React, { useState, useEffect } from 'react';
import {
  Building2,
  Pill,
  MapPin,
  Phone,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Plus,
  Edit3,
  Loader2,
  Navigation,
  ShieldCheck,
  Stethoscope,
  Info,
  ChevronRight,
  X,
  RefreshCw,
} from 'lucide-react';
import {
  ruralHealthcareService,
  RuralHospitalModel,
  RuralMedicineModel,
  MedicineCreateUpdatePayload,
} from '../../services/ruralHealthcareService';

interface RuralHealthcareSectionProps {
  userRole?: string;
  defaultVillage?: string;
}

export const RuralHealthcareSection: React.FC<RuralHealthcareSectionProps> = ({
  userRole = 'PATIENT',
  defaultVillage = 'Ambikapur',
}) => {
  const [selectedVillage, setSelectedVillage] = useState<string>(defaultVillage);
  const [activeTab, setActiveTab] = useState<'hospitals' | 'medicines'>('hospitals');
  const [useGps, setUseGps] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: 23.1205, lng: 83.1970 });

  // Data state
  const [hospitals, setHospitals] = useState<RuralHospitalModel[]>([]);
  const [medicines, setMedicines] = useState<RuralMedicineModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('All');
  const [bedFilter, setBedFilter] = useState<string>('All');
  const [medStatusFilter, setMedStatusFilter] = useState<string>('All');

  // Modals
  const [selectedHospital, setSelectedHospital] = useState<RuralHospitalModel | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<RuralMedicineModel | null>(null);
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState<boolean>(false);
  const [editingHospitalBeds, setEditingHospitalBeds] = useState<RuralHospitalModel | null>(null);

  // Form states for Medicine Add/Edit
  const [medName, setMedName] = useState('');
  const [medPurpose, setMedPurpose] = useState('');
  const [medQty, setMedQty] = useState<number>(100);
  const [medStatus, setMedStatus] = useState('In Stock');
  const [medSupplier, setMedSupplier] = useState('');
  const [medSupplierAddr, setMedSupplierAddr] = useState('');
  const [medContact, setMedContact] = useState('');
  const [medOrderStatus, setMedOrderStatus] = useState('In Stock & Available');
  const [medDelivery, setMedDelivery] = useState('In Stock Now');
  const [isSaving, setIsSaving] = useState(false);

  // Bed Update Form
  const [updateTotalBeds, setUpdateTotalBeds] = useState<number>(50);
  const [updateOccupiedBeds, setUpdateOccupiedBeds] = useState<number>(30);
  const [updateDocCount, setUpdateDocCount] = useState<number>(5);

  const isHealthWorker = userRole === 'HEALTH_WORKER' || userRole === 'ADMIN';

  // Request GPS consent
  const handleRequestGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUseGps(true);
        },
        (err) => {
          console.warn('Geolocation permission denied or error:', err);
          alert('GPS location permission denied. Using selected village coordinates.');
        }
      );
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'hospitals') {
        const data = await ruralHealthcareService.getHospitals({
          village_area: selectedVillage === 'All' ? undefined : selectedVillage,
          specialty: specialtyFilter === 'All' ? undefined : specialtyFilter,
          bed_status: bedFilter === 'All' ? undefined : bedFilter,
          search: searchQuery,
          user_lat: userCoords.lat,
          user_lng: userCoords.lng,
        });
        setHospitals(data);
      } else {
        const data = await ruralHealthcareService.getMedicines({
          village_area: selectedVillage === 'All' ? undefined : selectedVillage,
          status_filter: medStatusFilter === 'All' ? undefined : medStatusFilter,
          search: searchQuery,
        });
        setMedicines(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load rural healthcare data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedVillage, specialtyFilter, bedFilter, medStatusFilter, useGps]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openAddMedicine = () => {
    setEditingMedicine(null);
    setMedName('');
    setMedPurpose('');
    setMedQty(100);
    setMedStatus('In Stock');
    setMedSupplier('Jan Aushadhi Kendra Ambikapur');
    setMedSupplierAddr('Main Market, Ambikapur');
    setMedContact('+91 98271 44012');
    setMedOrderStatus('Delivered & Stocked');
    setMedDelivery('In Stock Now');
    setIsAddMedicineOpen(true);
  };

  const openEditMedicine = (med: RuralMedicineModel) => {
    setEditingMedicine(med);
    setMedName(med.medicine_name);
    setMedPurpose(med.purpose);
    setMedQty(med.quantity);
    setMedStatus(med.availability_status);
    setMedSupplier(med.supplier_name);
    setMedSupplierAddr(med.supplier_address);
    setMedContact(med.contact_number);
    setMedOrderStatus(med.order_status);
    setMedDelivery(med.expected_delivery || 'In Stock Now');
    setIsAddMedicineOpen(true);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: MedicineCreateUpdatePayload = {
        medicine_name: medName,
        purpose: medPurpose,
        quantity: medQty,
        availability_status: medStatus,
        supplier_name: medSupplier,
        supplier_address: medSupplierAddr,
        contact_number: medContact,
        village_area: selectedVillage === 'All' ? 'Ambikapur' : selectedVillage,
        order_status: medOrderStatus,
        expected_delivery: medDelivery,
      };

      if (editingMedicine) {
        await ruralHealthcareService.updateMedicine(editingMedicine.id, payload);
      } else {
        await ruralHealthcareService.addMedicine(payload);
      }
      setIsAddMedicineOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save medicine record.');
    } finally {
      setIsSaving(false);
    }
  };

  const openUpdateBeds = (h: RuralHospitalModel) => {
    setEditingHospitalBeds(h);
    setUpdateTotalBeds(h.total_beds);
    setUpdateOccupiedBeds(h.occupied_beds);
    setUpdateDocCount(h.doctors_available_count);
  };

  const handleSaveBeds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHospitalBeds) return;
    setIsSaving(true);
    try {
      await ruralHealthcareService.updateHospitalBeds(editingHospitalBeds.id, {
        total_beds: updateTotalBeds,
        occupied_beds: updateOccupiedBeds,
        doctors_available_count: updateDocCount,
      });
      setEditingHospitalBeds(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update hospital bed status.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Location Selector & Location Consent */}
      <div className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-teal-900 to-teal-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-300" />
            <h2 className="text-lg md:text-xl font-bold tracking-tight">Rural Healthcare & Medicine Availability</h2>
          </div>
          <p className="text-xs text-teal-100/90 font-medium">
            Real-time hospital bed status, doctor availability, and pharmacy stock across Surguja district
          </p>
        </div>

        {/* Location Dropdown & GPS Toggle */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
            <MapPin className="w-4 h-4 text-teal-300" />
            <span>Area:</span>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="Ambikapur" className="text-slate-900">Ambikapur (Block HQ)</option>
              <option value="Lakhanpur" className="text-slate-900">Lakhanpur Sub-Center</option>
              <option value="Udaipur" className="text-slate-900">Udaipur Rural Area</option>
              <option value="Surajpur" className="text-slate-900">Surajpur Border</option>
              <option value="All" className="text-slate-900">All Surguja District</option>
            </select>
          </div>

          <button
            onClick={handleRequestGps}
            className={`px-3 py-1.5 rounded-2xl font-bold transition-all flex items-center gap-1.5 ${
              useGps
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            {useGps ? 'GPS Enabled' : 'Enable GPS'}
          </button>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-medium flex items-start gap-2.5 shadow-xs">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Verified Medical Inventory Data:</strong> All medicine availability, pharmacy supply statuses, and hospital bed counts are synced directly from authorized Jan Aushadhi Kendras and Surguja Civil Health repositories. <em>AI does not prescribe or dispense medications.</em>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'hospitals'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Nearby Hospitals & Beds ({hospitals.length})
          </button>

          <button
            onClick={() => setActiveTab('medicines')}
            className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'medicines'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Pill className="w-4 h-4" />
            Medicines & Stock Delivery ({medicines.length})
          </button>
        </div>

        {isHealthWorker && activeTab === 'medicines' && (
          <button
            onClick={openAddMedicine}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add / Update Stock
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'hospitals' ? "Search hospital name or address..." : "Search medicine name, purpose, or pharmacy..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none focus:outline-none text-slate-900 font-medium placeholder:text-slate-400"
          />
        </div>

        {activeTab === 'hospitals' ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Bed Status:</span>
            <select
              value={bedFilter}
              onChange={(e) => setBedFilter(e.target.value)}
              className="bg-white p-1.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            >
              <option value="All">All Bed Statuses</option>
              <option value="Beds Available">Beds Available</option>
              <option value="Limited">Limited Beds</option>
              <option value="Full">Full (No Beds)</option>
            </select>

            <span className="font-bold text-slate-500 ml-2">Specialty:</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="bg-white p-1.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            >
              <option value="All">All Specialties</option>
              <option value="Cardiologist">Cardiology</option>
              <option value="Pulmonologist">Pulmonology</option>
              <option value="General Physician">General Medicine</option>
              <option value="Pediatrician">Pediatrics</option>
              <option value="Gynecologist">Gynecology</option>
              <option value="Orthopedic">Orthopedics</option>
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">Stock Status:</span>
            <select
              value={medStatusFilter}
              onChange={(e) => setMedStatusFilter(e.target.value)}
              className="bg-white p-1.5 rounded-xl border border-slate-300 font-semibold focus:outline-none"
            >
              <option value="All">All Stock Statuses</option>
              <option value="In Stock">In Stock</option>
              <option value="Limited Stock">Limited Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="In Transit">In Transit</option>
            </select>
          </div>
        )}
      </form>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center text-slate-500 text-xs font-semibold gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
          <span>Fetching real-time rural health data...</span>
        </div>
      )}

      {/* HOSPITALS VIEW */}
      {!isLoading && activeTab === 'hospitals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((h) => (
            <div key={h.id} className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-300 transition-all shadow-sm hover:shadow-md space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base">{h.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    {h.address}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                  h.availability_status === 'Beds Available'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : h.availability_status === 'Limited'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}>
                  {h.availability_status}
                </span>
              </div>

              {/* Bed Metrics Progress */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>Bed Availability Overview</span>
                  <span className="text-teal-800 font-mono">{h.available_beds} Available / {h.total_beds} Total</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-600 h-full"
                    style={{ width: `${(h.occupied_beds / h.total_beds) * 100}%` }}
                    title={`Occupied: ${h.occupied_beds}`}
                  ></div>
                  <div
                    className="bg-emerald-400 h-full"
                    style={{ width: `${(h.available_beds / h.total_beds) * 100}%` }}
                    title={`Available: ${h.available_beds}`}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                  <span>Occupied: {h.occupied_beds}</span>
                  <span className="text-emerald-700 font-bold">Free Beds: {h.available_beds}</span>
                </div>
              </div>

              {/* Doctor Availability & Distance */}
              <div className="flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-1.5 font-bold">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  <span>{h.doctors_available_count} Doctors Available</span>
                </div>
                <div className="font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200">
                  {h.distance_km} km away
                </div>
              </div>

              {/* Specialty Badges */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                {(h.doctor_specialties || []).map((doc, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-semibold">
                    {doc.specialty}
                  </span>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Updated: {new Date(h.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-2">
                  {isHealthWorker && (
                    <button
                      onClick={() => openUpdateBeds(h)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Beds
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedHospital(h)}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MEDICINES VIEW */}
      {!isLoading && activeTab === 'medicines' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {medicines.map((m) => (
            <div key={m.id} className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-teal-300 transition-all shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-2">
                    <Pill className="w-4 h-4 text-teal-600" />
                    {m.medicine_name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Purpose: {m.purpose}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                  m.availability_status === 'In Stock'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : m.availability_status === 'Limited Stock'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : m.availability_status === 'Out of Stock'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {m.availability_status}
                </span>
              </div>

              {/* Quantity & Supplier Info */}
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Available Stock Quantity:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">{m.quantity} Units</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-semibold">Supplier / Pharmacy:</span>
                  <span className="font-bold text-teal-900">{m.supplier_name}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  📍 {m.supplier_address} • 📞 {m.contact_number}
                </div>
              </div>

              {/* Order Status & Delivery */}
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs flex items-center justify-between text-teal-900 font-semibold">
                <span>Supply Status: <strong>{m.order_status}</strong></span>
                <span className="text-[11px] text-teal-700 font-bold">Delivery: {m.expected_delivery || 'In Stock'}</span>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">
                  Updated: {new Date(m.last_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {isHealthWorker && (
                  <button
                    onClick={() => openEditMedicine(m)}
                    className="px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Stock
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HOSPITAL DETAILS MODAL */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedHospital.name}</h3>
                <p className="text-xs text-slate-500 font-mono">Code: {selectedHospital.code}</p>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="font-semibold text-slate-800">📍 Address: {selectedHospital.address}</p>
                <p className="font-semibold text-slate-800">📞 Contact: {selectedHospital.contact_number}</p>
                <p className="font-semibold text-teal-800">🚘 Distance: {selectedHospital.distance_km} km from your area</p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-emerald-950 font-medium">
                <div className="font-bold text-sm">Bed Occupancy Breakdown:</div>
                <div>Total Capacity: <strong>{selectedHospital.total_beds} Beds</strong></div>
                <div>Currently Occupied: <strong>{selectedHospital.occupied_beds} Beds</strong></div>
                <div className="text-emerald-700 font-bold text-sm">Available Free Beds: {selectedHospital.available_beds} Beds</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">Available Doctors & Department Specialties:</h4>
                <div className="space-y-2">
                  {(selectedHospital.doctor_specialties || []).map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[11px] text-teal-700 font-semibold">{doc.specialty}</div>
                        <div className="text-[10px] text-slate-500">{doc.qualifications}</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        {doc.availability_status || 'Available'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <a
                href={`tel:${selectedHospital.contact_number}`}
                className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-600/20"
              >
                <Phone className="w-4 h-4" /> Call Hospital Direct
              </a>
            </div>
          </div>
        </div>
      )}

      {/* HEALTH WORKER: ADD/EDIT MEDICINE MODAL */}
      {isAddMedicineOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingMedicine ? 'Edit Medicine Stock & Order' : 'Add New Medicine Stock'}
              </h3>
              <button
                onClick={() => setIsAddMedicineOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medicine Name & Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. Amoxicillin 500mg"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Purpose / Treatment Indication</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency Snakebite Treatment"
                  value={medPurpose}
                  onChange={(e) => setMedPurpose(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={medQty}
                    onChange={(e) => setMedQty(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Status</label>
                  <select
                    value={medStatus}
                    onChange={(e) => setMedStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Limited Stock">Limited Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                    <option value="In Transit">In Transit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jan Aushadhi / Supplier Pharmacy Name</label>
                <input
                  type="text"
                  value={medSupplier}
                  onChange={(e) => setMedSupplier(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supplier Address</label>
                  <input
                    type="text"
                    value={medSupplierAddr}
                    onChange={(e) => setMedSupplierAddr(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={medContact}
                    onChange={(e) => setMedContact(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Supply Order Status</label>
                  <input
                    type="text"
                    value={medOrderStatus}
                    onChange={(e) => setMedOrderStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Delivery</label>
                  <input
                    type="text"
                    value={medDelivery}
                    onChange={(e) => setMedDelivery(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddMedicineOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 flex items-center gap-2 shadow-md shadow-teal-600/20"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Medicine Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEALTH WORKER: BED COUNT UPDATE MODAL */}
      {editingHospitalBeds && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Update Hospital Bed Count</h3>
              <button
                onClick={() => setEditingHospitalBeds(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBeds} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Bed Capacity</label>
                <input
                  type="number"
                  value={updateTotalBeds}
                  onChange={(e) => setUpdateTotalBeds(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Occupied Beds</label>
                <input
                  type="number"
                  value={updateOccupiedBeds}
                  onChange={(e) => setUpdateOccupiedBeds(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctors Available Count</label>
                <input
                  type="number"
                  value={updateDocCount}
                  onChange={(e) => setUpdateDocCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
                />
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold text-[11px]">
                Calculated Available Beds: {Math.max(0, updateTotalBeds - updateOccupiedBeds)} Beds
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHospitalBeds(null)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold hover:bg-teal-700 flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Bed Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
