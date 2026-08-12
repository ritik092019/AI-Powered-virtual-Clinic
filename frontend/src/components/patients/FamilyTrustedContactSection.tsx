import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNotification } from '../../context/NotificationContext';
import { Heart, Phone, Plus, Edit2, Trash2, ShieldCheck, User, Star, Check } from 'lucide-react';

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimaryForSOS: boolean;
}

const STORAGE_KEY = 'arogya_trusted_family_contacts';

const DEFAULT_CONTACTS: TrustedContact[] = [
  {
    id: 'cnt_01',
    name: 'Suraj Patel',
    relationship: 'Son',
    phone: '+91 98234 99881',
    isPrimaryForSOS: true,
  },
  {
    id: 'cnt_02',
    name: 'Sunita Patel',
    relationship: 'Wife',
    phone: '+91 98112 33445',
    isPrimaryForSOS: false,
  },
];

export const FamilyTrustedContactSection: React.FC = () => {
  const { addToast } = useNotification();
  const [contacts, setContacts] = useState<TrustedContact[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_CONTACTS;
    } catch {
      return DEFAULT_CONTACTS;
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);

  const [formName, setFormName] = useState('');
  const [formRel, setFormRel] = useState('Son');
  const [formPhone, setFormPhone] = useState('');
  const [formIsPrimary, setFormIsPrimary] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
    } catch (e) {
      console.warn('Failed to persist contacts in localStorage', e);
    }
  }, [contacts]);

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormRel('Son');
    setFormPhone('');
    setFormIsPrimary(contacts.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: TrustedContact) => {
    setEditingContact(c);
    setFormName(c.name);
    setFormRel(c.relationship);
    setFormPhone(c.phone);
    setFormIsPrimary(c.isPrimaryForSOS);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    addToast({
      title: 'Contact Removed',
      message: 'Trusted emergency family contact deleted.',
      type: 'info',
    });
  };

  const handleSetPrimary = (id: string) => {
    const updated = contacts.map((c) => ({
      ...c,
      isPrimaryForSOS: c.id === id,
    }));
    setContacts(updated);
    addToast({
      title: 'Primary Emergency Contact Set',
      message: 'This contact will now be prioritized during Emergency SOS.',
      type: 'success',
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      addToast({
        title: 'Validation Error',
        message: 'Name and phone number are required.',
        type: 'warning',
      });
      return;
    }

    if (editingContact) {
      const updated = contacts.map((c) => {
        if (c.id === editingContact.id) {
          return {
            ...c,
            name: formName.trim(),
            relationship: formRel,
            phone: formPhone.trim(),
            isPrimaryForSOS: formIsPrimary,
          };
        }
        return formIsPrimary ? { ...c, isPrimaryForSOS: false } : c;
      });
      setContacts(updated);
      addToast({
        title: 'Contact Updated',
        message: 'Family contact details updated successfully.',
        type: 'success',
      });
    } else {
      const newContact: TrustedContact = {
        id: `cnt_${Date.now()}`,
        name: formName.trim(),
        relationship: formRel,
        phone: formPhone.trim(),
        isPrimaryForSOS: formIsPrimary || contacts.length === 0,
      };

      let updated = [...contacts];
      if (formIsPrimary) {
        updated = updated.map((c) => ({ ...c, isPrimaryForSOS: false }));
      }
      setContacts([...updated, newContact]);
      addToast({
        title: 'Contact Added',
        message: 'New trusted family contact added.',
        type: 'success',
      });
    }

    setIsModalOpen(false);
  };

  const primaryContact = contacts.find((c) => c.isPrimaryForSOS) || contacts[0];

  return (
    <div className="space-y-4">
      <Card variant="default" className="border-rose-100 bg-rose-50/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-black flex items-center gap-2 text-slate-900">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Family / Trusted Emergency Contacts
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage family members reached during Emergency SOS dispatch & location sharing.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
          >
            Add Contact
          </Button>
        </CardHeader>

        <CardContent className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-2xl border transition-all text-xs space-y-2 relative ${
                  c.isPrimaryForSOS
                    ? 'bg-rose-500/10 border-rose-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center justify-center text-sm shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          {c.relationship}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium">{c.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {c.isPrimaryForSOS ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> Primary SOS Contact
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetPrimary(c.id)}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                    >
                      Set as Primary SOS Contact
                    </button>
                  )}

                  <a
                    href={`tel:${c.phone.replace(/\s+/g, '')}`}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1 text-[11px] shadow-2xs"
                  >
                    <Phone className="w-3 h-3" /> Call Contact
                  </a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Contact Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl space-y-0 border border-slate-200">
            <div className="p-5 bg-linear-to-r from-rose-900 to-rose-950 text-white flex items-center justify-between">
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suraj Patel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Relationship</label>
                <select
                  value={formRel}
                  onChange={(e) => setFormRel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                >
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse / Wife / Husband">Spouse / Wife / Husband</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Brother / Sister">Brother / Sister</option>
                  <option value="Relative / Neighbor">Relative / Neighbor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98234 99881"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-center justify-between">
                <span className="font-bold text-rose-950">Set as Primary Emergency SOS Contact</span>
                <input
                  type="checkbox"
                  checked={formIsPrimary}
                  onChange={(e) => setFormIsPrimary(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                  Save Contact
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
