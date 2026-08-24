import React, { useState, useEffect } from 'react';
import { OwnerSidebar } from '../components/ui/OwnerSidebar';
import { apiFetch } from '../lib/api';
import { Property } from '../types';
import { BedDouble, Plus, Search, Building2, CheckCircle2, User, AlertCircle, Menu, Edit, Trash2 } from 'lucide-react';

export const OwnerRoomsPage: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  // Form State for Add Room Modal
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newRoomType, setNewRoomType] = useState('Single');
  const [newCapacity, setNewCapacity] = useState(1);
  const [newPrice, setNewPrice] = useState(10000);
  const [newDeposit, setNewDeposit] = useState(10000);
  const [targetPropId, setTargetPropId] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const propsData = await apiFetch<Property[]>('/properties/my-properties');
      setProperties(propsData || []);

      if (propsData && propsData.length > 0) {
        setTargetPropId(propsData[0].id);
        let allRooms: any[] = [];
        for (const p of propsData) {
          try {
            const pRooms = await apiFetch<any[]>(`/properties/${p.id}/rooms`);
            if (pRooms) {
              pRooms.forEach(r => {
                r.property_name = p.name;
              });
              allRooms = [...allRooms, ...pRooms];
            }
          } catch (err) {
            console.error(err);
          }
        }
        setRooms(allRooms);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPropId || !newRoomNumber) return;

    try {
      const created = await apiFetch(`/properties/${targetPropId}/rooms`, {
        method: 'POST',
        body: JSON.stringify({
          room_number: newRoomNumber,
          floor: newFloor,
          room_type: newRoomType,
          capacity: newCapacity,
          price: newPrice,
          deposit: newDeposit,
          amenities: ['Attached Bathroom', 'Study Table', 'Wardrobe'],
          description: `${newRoomType} occupancy room`
        })
      });

      const prop = properties.find(p => p.id === targetPropId);
      created.property_name = prop?.name || 'Property';
      setRooms(prev => [created, ...prev]);
      setIsAddRoomOpen(false);
      setNewRoomNumber('');
    } catch (err: any) {
      alert(err.message || 'Failed creating room');
    }
  };

  const filteredRooms = rooms.filter(r => selectedPropertyId === 'ALL' || r.property_id === selectedPropertyId);
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 1), 0);

  return (
    <div className="min-h-screen flex bg-slate-100 relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <OwnerSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs">
          <div className="w-64 bg-navy-900 h-full">
            <OwnerSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileSidebarOpen(false)}></div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full">
        {/* Mobile Header Bar */}
        <div className="flex items-center justify-between lg:hidden mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-extrabold text-slate-900 text-sm">Rooms & Beds</span>
          </div>
          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="p-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Room
          </button>
        </div>

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Rooms & Beds Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Manage room numbers, bed capacities, pricing, and live bed occupancy.
            </p>
          </div>

          <button
            onClick={() => setIsAddRoomOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-xs shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        </div>

        {/* Filter & Summary Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Building2 className="w-5 h-5 text-brand-600 shrink-0" />
            <select
              value={selectedPropertyId}
              onChange={e => setSelectedPropertyId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none w-full md:w-72"
            >
              <option value="ALL">All Properties ({properties.length})</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-6 text-xs font-bold text-slate-600">
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Total Rooms</span>
              <span className="text-slate-900 text-sm font-black">{filteredRooms.length}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block text-[10px] uppercase">Total Capacity</span>
              <span className="text-brand-600 text-sm font-black">{totalBeds} Beds</span>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
            <BedDouble className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base mb-1">No Rooms Listed</h3>
            <p className="text-xs text-slate-500 mb-6">No rooms found for the selected property filter.</p>
            <button
              onClick={() => setIsAddRoomOpen(true)}
              className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Room Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <div key={room.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider block">
                        {room.property_name || 'Property'}
                      </span>
                      <h3 className="font-black text-slate-900 text-lg">Room #{room.room_number}</h3>
                    </div>
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-extrabold text-[11px] rounded-lg">
                      Floor {room.floor || 1}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Occupancy Type:</span>
                      <span className="font-bold text-slate-900">{room.room_type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Monthly Rent:</span>
                      <span className="font-black text-emerald-600">₹{room.price?.toLocaleString()} / mo</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold">Bed Capacity:</span>
                      <span className="font-bold text-slate-800">{room.capacity || 1} Bed(s)</span>
                    </div>
                  </div>

                  {/* Bed Breakdown list */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                      Bed Occupancy Status
                    </span>
                    {Array.from({ length: room.capacity || 1 }).map((_, idx) => {
                      const bedLetter = String.fromCharCode(65 + idx);
                      const isOccupied = idx === 0 && room.status !== 'AVAILABLE';
                      return (
                        <div key={idx} className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
                          <span className="font-bold text-slate-700">Bed {bedLetter}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            isOccupied
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Room Modal */}
        {isAddRoomOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 mb-1">Add New Room</h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Create a new room listing under your property.</p>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Select Property *</label>
                  <select
                    value={targetPropId}
                    onChange={e => setTargetPropId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
                  >
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.city})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 201"
                      value={newRoomNumber}
                      onChange={e => setNewRoomNumber(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Floor</label>
                    <input
                      type="number"
                      value={newFloor}
                      onChange={e => setNewFloor(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Room Type</label>
                    <select
                      value={newRoomType}
                      onChange={e => setNewRoomType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    >
                      <option value="Single">Single Private</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                      <option value="Four Sharing">Four Sharing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Capacity (Beds)</label>
                    <input
                      type="number"
                      min={1}
                      value={newCapacity}
                      onChange={e => setNewCapacity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Monthly Rent (₹)</label>
                    <input
                      type="number"
                      value={newPrice}
                      onChange={e => setNewPrice(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                    <input
                      type="number"
                      value={newDeposit}
                      onChange={e => setNewDeposit(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAddRoomOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
